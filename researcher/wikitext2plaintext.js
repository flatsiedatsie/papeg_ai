/**********************************************************
 * Module: wikitext2plaintext
 * Author: Dan Kennedy
 * 
 * Description:
 * Module used to remove all markup from a string containing
 * wikitext and output the resulting plain text version which is
 * the best representation possible using only plain text.
 * 
 * Recent Updates:
 * 2018-03-05: Original development
 **********************************************************/

//const he = require('he');
import './he.js'
console.log("window.he: ", window.he);
const he = window.he;

function wikitext2plaintext() {
    // Rule exclusions & repeats
    this.ex = {
        'exclude_rules' : {
            //'EXTERNAL_LINKS_KEEP_URL' : true,
			'CITATION_TITLE_1':true,
			'CITATION_TITLE_2':true,
			'EXTERNAL_LINKS_ALT':true,
			'CATEGORIES_FORMAT':true,
        },
		'include_rules' : {
            'CATEGORIES_REMOVE' : true,
			'CITE_REMOVE':true,
		},
        'exclude_groups' : {
            
        },
        'repeat_groups' : {
            'LINKS' : 3,
            'DBL_CURLY_TAGS' : 3
        }
    };
    this.regex_all = [
        ['R','BOLD_TAGS',/'''?/g,''],
        ['R','HEADER_TAGS',/ *={2,6} {0,}/g,''],
        ['G','WIKI_TABLES',[
                ['R','WIKI_TABLES_REMOVE',/{\|[\s\S]*?\|}/gm,'']
        ]],
        ['G','LINKS',[
                ['R','FILE_LINKS',/\[\[(?:File|Media):(?:[^\]\[\|]+\|)+([^\]\[\|]+)\]\]/gi,'$1'],
                ['R','LOCAL_LINKS_ALT',/\[\[[^\]\[\|]+\|([^\]\[\|]+)\]\]/g,'$1'],
                ['R','LOCAL_LINKS',/\[\[([^\]\[\|]+)\]\]/g,'$1'],
                //['R','EXTERNAL_LINKS_ALT',/\[http[^\]\[\s]{3,} ([^\]\[]+)\]/gi,'$1'],
				['R','EXTERNAL_LINKS_ALT',/\[http[^\]\[\s]{3,} ([^\]\[]+)\]/gi,''],
                ['R','EXTERNAL_LINKS_REMOVE',/\[ *http[^\]\[ ]{3,} *\]/gi,''],
                //['R','EXTERNAL_LINKS_KEEP_URL',/\[ *(http[^\]\[ ]{3,}) *\]/gi,'$']
				['R','EXTERNAL_LINKS_KEEP_URL',/\[ *(http[^\]\[ ]{3,}) *\]/gi,'']
        ]],
		['R','CATEGORIES_REMOVE',/\[\[Category:([^\]\[]+)\]\]/gi,''],
        ['R','CATEGORIES_FORMAT',/\[\[Category:([^\]\[]+)\]\]/gi,'Category - $1'],
        
        ['G','LISTS',[
                ['R','LIST_DEPTH_6',/^([\*\#\:\;]){6,}\s{0,}/gm,'------ '],
                ['R','LIST_DEPTH_5',/^([\*\#\:\;]){5}\s{0,}/gm,'----- '],
                ['R','LIST_DEPTH_4',/^([\*\#\:\;]){4}\s{0,}/gm,'---- '],
                ['R','LIST_DEPTH_3',/^([\*\#\:\;]){3}\s{0,}/gm,'--- '],
                ['R','LIST_DEPTH_2',/^([\*\#\:\;]){2}\s{0,}/gm,'-- '],
                ['R','LIST_DEPTH_1',/^([\*\#\:\;]){1}\s{0,}/gm,'- ']
        ]],
        ['G','HTML_TAGS',[
                ['R','HTML_REF_TAGS',/<\/?ref[^>]*>/gi,''],
                ['R','HTML_COMMENT_TAGS',/<\!--.+?-->/g,''],
                ['R','HTML_MATH_TAGS',/<math>.*?<\/math>/gi,''],
                //['R','HTML_SUB_TAGS',/<sub>(.*?)<\/sub>/gi,'$1'],
                //['R','HTML_SUP_TAGS',/<sup>(.*?)<\/sup>/gi,'^$1'],
                ['R','HTML_SUB_TAGS',/<sub>(.*?)<\/sub>/gi,''],
                ['R','HTML_SUP_TAGS',/<sup>(.*?)<\/sup>/gi,''],
                ['R','HTML_BLOCKQUOTE_TAGS',/<\/?blockquote>/gi,'']
        ]],
        ['G','DBL_CURLY_TAGS',[
				['R','CURLY_OTHER',/\{\{[^{]+?\}\}\r?\n?/g,''],
                ['R','CITE_TITLE',/{{\s*cite[^}{]+title=([^}{\|]+)[^}{]*}}/gmi,'$1'],
                ['R','CITATION_TITLE_1',/{{\s*citation[^}{]+title=([^}{\|]+)[^}{]+publisher=([^}{\|]+)[^}{]*}}/gmi,'$1 - $2'],
                ['R','CITATION_TITLE_2',/{{\s*citation[^}{]+publisher=([^}{\|]+)[^}{]+title=([^}{\|]+)[^}{]*}}/gmi,'$2 - $1'],
                ['R','ISBN_FORMAT',/{{\s*ISBN\s*\|\s*([\d\-]+)\s*}}/gi,'ISBN $1'],
                ['R','IMDB_STATIC',/{{\s*IMDB[^}{]+}}/gi,'IMDB Reference'],
                ['R','DMOZ_FORMAT',/{{\s*DMOZ[^}{]+\|([^}{\|]+)}}/gi,'$1'],
                ['R','OFFICIAL_WEB_STATIC',/{{\s*Official Website[^}{]*}}/gi,'Official Website'],
                ['R','CITE_REMOVE',/{{\s*cit[^}{]+}}/gmi,'']
                
        ]],
        ['R','REPEATED_BLANK_LINES_REMOVE',/(\r\n|\r|\n| ){3,}/g,'\r\n\r\n']
    ];
    // Flag to indicate if criteria have been modified since last rebuild of active rules list
    this.criteria_changed = false;
    // List of active regex rules which will be utilized
    this.regex_active = [];
    // Build our active rules list based on the default criteria
    this._build_regex_list(this.regex_all,this.regex_active);

}
window.wikitext2plaintext = wikitext2plaintext;

/**
 * Parses provided wikitext string into plaintext.
 * @param {string} wikitext The string containing the wikitext markup
 * @returns {string} The plaintext version of the provided wikitext block.
 */
wikitext2plaintext.prototype.parse = function(wikitext) {
    var plaintext;
    
    // If our criteria has changed since the last build of the regex list, we
    // rebuild the active regex list
    if(this.criteria_changed) {
        this._rebuild_regex_list();
    }
    
    // Init our plaintext to be equal to the wikitext
    plaintext = wikitext;
    
    // Apply our regex rules
    plaintext = this._apply_regex_rules(this.regex_active, plaintext);
    
    // Decode all the HTML entities
    plaintext = he.decode(plaintext);
    
    return(plaintext);
};

/**
 * Includes the rule group specified by the group_name parameter.  This causes
 * all rules in the group to be included in parsing unless those rules have been
 * individually excluded.
 * @param {string} group_name The name of the group to include.
 */
wikitext2plaintext.prototype.include_rule_group = function(group_name) {
    // If the group is excluded, we remove the exclusion
    if(this.ex['exclude_groups'].hasOwnProperty(group_name)) {
        this.criteria_changed = true;
        this.ex['exclude_groups'][group_name] = false;
        delete this.ex['exclude_groups'][group_name];
    }
};

/**
 * Excludes the rule group specified by the group_name parameter.  This causes
 * all rules in the group to be skipped during parsing of wikitext.
 * @param {string} group_name The name of the group to exclude.
 */
wikitext2plaintext.prototype.exclude_rule_group = function(group_name) {
    // If the group is excluded, we remove the exclusion
    if(!this.ex['exclude_groups'].hasOwnProperty(group_name)) {
        this.criteria_changed = true;
        this.ex['exclude_groups'][group_name] = true;
    }
};

/**
 * Includes the rule specified by the rule_name parameter.  This causes
 * the rule to be applied when parsing wikitext.
 * @param {string} rule_name The name of the rule to include.
 */
wikitext2plaintext.prototype.include_rule = function(rule_name) {
    // If the group is excluded, we remove the exclusion
    if(this.ex['exclude_rules'].hasOwnProperty(rule_name)) {
        this.criteria_changed = true;
        this.ex['exclude_rules'][rule_name] = false;
        delete this.ex['exclude_rules'][rule_name];
    }
};

/**
 * Excludes the rule specified by the rule_name parameter.  This causes
 * the rule to be skipped during parsing of wikitext.
 * @param {string} rule_name The name of the rule to exclude.
 */
wikitext2plaintext.prototype.exclude_rule = function(rule_name) {
    // Check if the rule is already excluded excluded, we remove the exclusion
    if(!this.ex['exclude_rules'].hasOwnProperty(rule_name)) {
        this.criteria_changed = true;
        this.ex['exclude_rules'][rule_name] = true;
    }
};

/**
 * Sets the number of times a specific rule group should be applied to a given wikitext
 * string.  This allows for nested tags to be processed.
 * @param {string} rule_group_name The name of the rule group to repeat.
 * @param {number} repeat_count Number of times to repeat application of the rule 
 * group.  Must be greater than 0 and less than 1000.
 */
wikitext2plaintext.prototype.repeat_rule_group = function(rule_group_name, repeat_count) {
    if(repeat_count > 0 && repeat_count < 1000) {
        this.ex['repeat_groups'][rule_group_name] = true;
    } else {
        throw new Error("Rule group repeat count must be greater than 0 and less than 1000.");
    }
};

/**
 * Rebuilds the regex_active list using the regex_all as a source.
 */
wikitext2plaintext.prototype._rebuild_regex_list = function() {
    this.regex_active = [];
    this._build_regex_list(this.regex_all,this.regex_active);
    this.criteria_changed = false;
};

/**
 * Applies the exclusions specified in exclude_rules and exclude_groups to create the
 * regex list which will be used while parsing.
 * @param {array} source_list The array to use as the source of regex rules
 * @param {array} dest_list The destination reference array to add applicable rules
 */
wikitext2plaintext.prototype._build_regex_list = function(source_list, dest_list) {
    var item_type, item_name;
    var new_group_items, new_group;
    
    for(var i = 0; i < source_list.length; i++) {
        item_type = source_list[i][0];
        item_name = source_list[i][1];
        if(item_type === 'R') {
            // Check if the rule is NOT in the exclude list
            if(!(this.ex['exclude_rules'].hasOwnProperty(item_name) && this.ex['exclude_rules'][item_name])) {
                // Add the rule
                dest_list.push(source_list[i]);
            }
        } else if(item_type === 'G') {
            // Check if the rule is NOT in the exclude list
            if(!(this.ex['exclude_groups'].hasOwnProperty(item_name) && this.ex['exclude_groups'][item_name])) {
                // Create a new group record
                new_group_items = [];
                new_group = ['G',item_name,new_group_items];
                // Push the group to our final list
                dest_list.push(new_group);
                // Recursively call this function to process rules/subgroups in this group
                this._build_regex_list(source_list[i][2],new_group_items);
            }
        } else {
            // Something went wrong with our rules
            throw new Error("wikitext2plaintext - Internal error processing rules");
        }
    }
};

/**
 * Applies the ruleset containing regex replacements to the input text
 * @param {array} ruleset An array of rules containing regex replacements to be applied.
 * @param {string} input_text The string on which to apply the ruleset
 * @returns {string} The resulting string after the rules were applied
 */
wikitext2plaintext.prototype._apply_regex_rules = function(ruleset, input_text) {
    var item_type, item_name;
    var output_text;
    
    output_text = input_text;
    
    for(var i = 0; i < ruleset.length; i++) {
        item_type = ruleset[i][0];
        item_name = ruleset[i][1];
        
        if(item_type === 'R') {
            // Run the regex replacement from the rule on the text
            output_text = output_text.replace(ruleset[i][2],ruleset[i][3]);
        } else if(item_type === 'G') {
            // Recursively apply the rules in the group
            if(this.ex['repeat_groups'].hasOwnProperty(item_name) && this.ex['repeat_groups'][item_name] > 1) {
                for(var j = 0; j < this.ex['repeat_groups'][item_name]; j++) {
                    output_text = this._apply_regex_rules(ruleset[i][2],output_text);
                }
            } else {
                output_text = this._apply_regex_rules(ruleset[i][2],output_text);
            }
        } else {
            // Something went wrong with our rules
            throw new Error("wikitext2plaintext - Internal error processing rules");
        }
    }
    
    return(output_text);
};

//module.exports = wikitext2plaintext;


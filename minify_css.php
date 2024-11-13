<?php

header("Content-type:text/javascript");



$css_file_list = array(
	'css/chat_style.css',
	'css/style.css',
);


$js_file_list = array(
	#'pjs/utils.js', 
	#'early.js', 
	'ai.js',
	'translations.js',
	'p_translation.js',
	/*
	'p_init.js',
	'js/various_utils.js',
	'p_ui.js',
	'p_audio.js',
	'p_main.js',
	'p_docs.js',
	*/
	#'p_constants.js' // moved into late
	#'pjs/first.js',
	#'pjs/data.js',
);



function minify_css($css) {
	// Remove comments
	$css = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $css);
	// Remove spaces before and after selectors, braces, and colons
	$css = preg_replace('/\s*([{}|:;,])\s+/', '$1', $css);
	// Remove remaining spaces and line breaks
	$css = str_replace(array("\r\n", "\r", "\n", "\t", '  ', '    ', '    '), '',$css);
	return $css;
}


function minify_js($source){

	$total = '';

    //a list of characters that don't need spaces around them
    $NO_SPACE_NEAR = ' +=-*/%&|^!~?:;,.<>(){[]}'; // 

    //loop through each line of the source, removing comments and unnecessary whitespace
    $lines = explode("\n", $source);

    //keep track of whether we're in a string or not
    $in_string = false;

    //keep track of whether we're in a comment or not
    $multiline_comment = false;

    foreach($lines as $line){

        //remove whitespace from the start and end of the line
        $line = trim($line);

        //skip blank lines
        if($line == '') continue;
		
		/*
		if (str_ends_with($line, '}')) {
		    $line .= ';';
		}
		*/
		if($line == '}'){
			$line .= ' ';
		}
		
        //remove "use strict" statements
        if(!$in_string && str_starts_with($line, '"use strict"')) continue;

        //loop through the current line
        $string_len = strlen($line);

        for($position = 0; $position < $string_len; $position++){
            //if currently in a string, check if the string ended (making sure to ignore escaped quotes)
            if($in_string && $line[$position] === $in_string && ($position < 1 || $line[$position - 1] !== '\\')){
                $in_string = false;
            }
            else if($multiline_comment){
                //check if this is the end of a multiline comment
                if($position > 0 && $line[$position] === "/" && $line[$position - 1] === "*"){
                    $multiline_comment = false;
                }
                continue;
            }
            //check everything else
            else if(!$in_string && !$multiline_comment){

                //check if this is the start of a string
                if($line[$position] == '"' || $line[$position] == "'" || $line[$position] == '`'){
                    //record the type of string
                    $in_string = $line[$position];
                } 

                //check if this is the start of a single-line comment
                else if($position < $string_len - 1 && $line[$position] == '/' && $line[$position + 1] == '/'){
                    //this is the start of a single line comment, so skip the rest of the line
                    break;
                }

                //check if this is the start of a multiline comment
                else if($position < $string_len - 1 && $line[$position] == '/' && $line[$position + 1] == '*'){
                    $multiline_comment = true;
                    continue;
                }

                else if(
                        $line[$position] == ' ' && (
                            //if this is not the first character, check if the character before it requires a space
                            ($position > 0 && strpos($NO_SPACE_NEAR, $line[$position - 1]) !== false) 
                            //if this is not the last character, check if the character after it requires a space
                            || ($position < $string_len - 1 && strpos($NO_SPACE_NEAR, $line[$position + 1]) !== false)
                        )
                    ){
                    //there is no need for this space, so keep going
                    continue;
                }
            }

            //print the current character and continue
			
			$total .= $line[$position];
            #echo $line[$position];
        }

        //if this is a multi-line string, preserve the line break
        if($in_string){
			#$total .= "\\n";
            #echo "\\n";
        }
		$total .= PHP_EOL; //"\\n";
		
		
    }
	return $total;
}





$merged_css = '';
	
foreach ($css_file_list as $filename) {
    $merged_css = $merged_css . "\n\n//\n// " . $filename . "\n//\n";
	#echo "\n\n//\n// " . $filename . "\n//\n";
	
	$source = file_get_contents(__DIR__ . '/' . $filename);
	$merged_css .= minify_css($source);
	#echo $source;
	
}

file_put_contents(__DIR__ . '/merged.css', $merged_css);







$merged_js = '';
	
foreach ($js_file_list as $filename) {
    $merged_js = $merged_js . "\n\n//\n// " . $filename . "\n//\n";
	#echo "\n\n//\n// " . $filename . "\n//\n";
	
	$source = file_get_contents(__DIR__ . '/' . $filename);
	$merged_js .= minify_js($source); # 1.4MB
	#echo $source;  # 2.1MB
	
}

file_put_contents(__DIR__ . '/merged.js', $merged_js);

echo $merged_js;





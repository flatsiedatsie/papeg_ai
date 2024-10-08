
//import './codemirror.js';
//import './codemirror-indentation-markers.js';

//console.log("CM: ", CM);

//
//  CODE MIRROR
//

// TODO: Why are some variables capitalized, and others not?
const {EditorSelection, basicSetup} = CM["codemirror"];
const {EditorView, keymap, drawSelection, lineNumbers, highlightActiveLineGutter, gutter, GutterMarker, scrollPastEnd} = CM["@codemirror/view"]; //  , Decoration <- declared in codemirror-indentation-markers.js
const {EditorState, StateEffect, Compartment, StateField, RangeSet} = CM["@codemirror/state"];
//const {javascript} = CM["@codemirror/lang-javascript"];
const {searchKeymap, highlightSelectionMatches, SearchCursor} = CM["@codemirror/search"]; 
const {indentMore, indentLess, indentWithTab, indentSelection, defaultKeymap,  history,  historyKeymap, undo, redo} = CM["@codemirror/commands"]; //  
const {language, bracketMatching, indentOnInput, indentUnit, syntaxHighlighting, HighlightStyle, defaultHighlightStyle} = CM["@codemirror/language"]; // 

const {tags, Tag, styleTags} = CM["@lezer/highlight"]; 

//console.log("codemirror: lezer/highlight: styleTags: ", styleTags);

//import { languages } from '@codemirror/language-data'

//const { MarkdownConfig }= CM["@lezer/markdown"];
//console.log("MarkdownConfig: ", MarkdownConfig);
//const { languages } = CM["@codemirror/language-data"];
//console.log("CM languages: ", languages);

const { markdown, markdownLanguage } = CM["@codemirror/lang-markdown"];
//const { classHighlightStyle }  = CM["@codemirror/highlight"];
//const {undo,redo} = CM["@codemirror/history"];
//const { MarkdownConfig } = CM["@lezer/markdown"];
//console.log("MarkdownConfig: ", MarkdownConfig);

const { javascript, javascriptLanguage }  = CM["@codemirror/lang-javascript"];
const { pythonLanguage }  = CM["@codemirror/lang-python"];
const { htmlLanguage, html }  = CM["@codemirror/lang-html"];
const { cssLanguage, css }  = CM["@codemirror/lang-css"];
const { phpLanguage, php }  = CM["@codemirror/lang-php"];
//const { defaultHighlightStyle }  = CM["@codemirror/highlight"];
const {
  oneDarkTheme,
  oneDarkHighlightStyle
}  = CM["@codemirror/theme-one-dark"];



const highlightStyle = HighlightStyle.define([
    {
        tag: tags.heading1,
        color: "white",
        fontSize: "200%",
        fontWeight: "bold",
    },
    { tag: tags.processingInstruction, textDecoration: 'none', fontSize: '100%' },
	{ tag: tags.meta, textDecoration: 'none', fontSize: '100%',opacity:0.1 },
]);


// https://github.com/davidmyersdev/ink-mde/blob/main/src/editor/extensions/theme.ts

/*
syntaxHighlighting(
      HighlightStyle.define([
        { tag: t.heading1, fontWeight: 'bold', fontSize: '200%' },
        { tag: t.strikethrough, textDecoration: 'line-through' },
        { tag: t.processingInstruction, textDecoration: 'none', fontSize: '100%' },
      ]),
),
	
*/





//import {htmlLanguage, html} from "@codemirror/lang-html"
//import {language} from "@codemirror/language"
//import {javascript} from "@codemirror/lang-javascript"

/*
const languageExtensions = {
  javascript: [new LanguageSupport(javascriptLanguage)],
  python: [new LanguageSupport(pythonLanguage)],
}

const themeExtensions = {
  light: [defaultHighlightStyle],
  dark: [oneDarkTheme, oneDarkHighlightStyle]
}


function setTabSize(view, size) {
  view.dispatch({
    effects: tabSize.reconfigure(EditorState.tabSize.of(size))
  })
}

function setLanguage(view, language) {
  view.dispatch({
    effects: tabSize.reconfigure(EditorState.tabSize.of(size))
  })
}
*/


function myCompletions(context) { // not currenty used
  let word = context.matchBefore(/\w*/);
  if (word.from == word.to && !context.explicit)
    return null
  return {
    from: word.from,
    options: [
      {label: "match", type: "keyword"},
      {label: "hello", type: "variable", info: "(World)"},
      {label: "magic", type: "text", apply: "⠁⭒*.✩.*⭒⠁", detail: "macro"}
    ]
  }
}

const {syntaxTree} = CM["@codemirror/language"];

const tagOptions = [
  "constructor", "deprecated", "link", "param", "returns", "type"
].map(tag => ({label: "@" + tag, type: "keyword"}));

function completeJSDoc(context) {
  let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
  if (nodeBefore.name != "BlockComment" ||
      context.state.sliceDoc(nodeBefore.from, nodeBefore.from + 3) != "/**")
    return null
  let textBefore = context.state.sliceDoc(nodeBefore.from, context.pos);
  let tagBefore = /@\w*$/.exec(textBefore);
  if (!tagBefore && !context.explicit) return null
  return {
    from: tagBefore ? nodeBefore.from + tagBefore.index : context.pos,
    options: tagOptions,
    validFor: /^(@\w*)?$/
  }
}

//!jsDocCompletions



/*
interface HistoryConfig {
    minDepth?: number;
    newGroupDelay?: number;
}
declare function history(config?: HistoryConfig): Extension;
*/

//const {javascriptLanguage} = CM["@codemirror/lang-javascript"];

const jsDocCompletions = javascriptLanguage.data.of({
	autocomplete: completeJSDoc
});


//const historyCompartment = new Compartment();
let undoRedo = new Compartment;
//EditorView.readOnly.of(false)
window.cm_read_only = false;
let readOnly = new Compartment;
//console.log("readOnly compartment: ", readOnly );

//console.log("EditorState.readOnly: ", EditorState.readOnly); // .of(false)




// EditorState.readOnly.of(true)

//readOnly.of(window.cm_read_only);
//console.log("readOnly compartment after: ", readOnly );

//console.error("EditorView: ", EditorView);


const languageConf = new Compartment;

const autoLanguage = EditorState.transactionExtender.of(tr => {
	//console.error("in autoLanguage. tr.docChanged,language: ", tr.docChanged, tr.startState.facet(language));
	if (!tr.docChanged) return null
		
	if(typeof current_file_name != 'string'){
		current_file_name = 
		console.error("editor: autoLanguage: current_file_name was not a string: ", current_file_name);
		return
	}
		
	if(current_file_name.toLowerCase().endsWith('.html')){
		return {
			effects: languageConf.reconfigure(html())
		}
	}
	else if(current_file_name.toLowerCase().endsWith('.css')){
		return {
			effects: languageConf.reconfigure(css())
		}
	}
	else if(current_file_name.toLowerCase().endsWith('.js')){
		return {
			effects: languageConf.reconfigure(javascript())
		}
	}
	else if(current_file_name.toLowerCase().endsWith('.php')){
		return {
			effects: languageConf.reconfigure(php())
		}
	}
	else{
		return {
			effects: languageConf.reconfigure(markdown()) // {props: styleTags({EmphasisMark: 'emphasisMarkTag'})}
		}
	}
	/*
	else if(current_file_name.toLowerCase().endsWith('.txt') || current_file_name.toLowerCase().endsWith('.pdf') || current_file_name.toLowerCase().endsWith('.docx') || current_file_name.toLowerCase().endsWith('.doc') || current_file_name.toLowerCase().endsWith('.odt') || current_file_name.toLowerCase().endsWith('.epub')){
		return {
			effects: languageConf.reconfigure(markdownLanguage())
		}
	}
	else{
		let docIsHTML = /^\s*</.test(tr.newDoc.sliceString(0, 100))
		let stateIsHTML = tr.startState.facet(language) == htmlLanguage
		//console.log("in autoLanguage: extension was not html/js/css/php.  Detected HTML?: ", stateIsHTML);
		if (docIsHTML == stateIsHTML) return null
		return {
			effects: languageConf.reconfigure(docIsHTML ? html() : javascript())
		}
	}
	*/
})

/*

const hexLineNumbers = lineNumbers({
  formatNumber: n => n.toString(16)
})


*/


/*
const breakpointEffect = StateEffect.define({pos, on})({
  map: (val, mapping) => ({pos: mapping.mapPos(val.pos), on: val.on})
})

const breakpointState = StateField.define(RangeSet(GutterMarker))({
  create() { return RangeSet.empty },
  update(set, transaction) {
    set = set.map(transaction.changes)
    for (let e of transaction.effects) {
      if (e.is(breakpointEffect)) {
        if (e.value.on)
          set = set.update({add: [breakpointMarker.range(e.value.pos)]})
        else
          set = set.update({filter: from => from != e.value.pos})
      }
    }
    return set
  }
})

function toggleBreakpoint(view, pos) {
  let breakpoints = view.state.field(breakpointState)
  let hasBreakpoint = false
  breakpoints.between(pos, pos, () => {hasBreakpoint = true})
  view.dispatch({
    effects: breakpointEffect.of({pos, on: !hasBreakpoint})
  })
}

const breakpointMarker = new class extends GutterMarker {
  toDOM() { return document.createTextNode("💔") }
}

const breakpointGutter = [
  breakpointState,
  gutter({
    class: "cm-breakpoint-gutter",
    markers: v => v.state.field(breakpointState),
    initialSpacer: () => breakpointMarker,
    domEventHandlers: {
      mousedown(view, line) {
        toggleBreakpoint(view, line.from)
        return true
      }
    }
  }),
  EditorView.baseTheme({
    ".cm-breakpoint-gutter .cm-gutterElement": {
      color: "red",
      paddingLeft: "5px",
      cursor: "default"
    }
  })
]
*/





// Programmatic CSS classes for selection of text, and selecting programmatically. From:
// https://stackoverflow.com/questions/72599672/how-to-search-for-and-highlight-a-substring-in-codemirror-6

// code mirror effect that you will use to define the effect you want (the decoration)
const highlight_effect = StateEffect.define(); 
const remove_highlight = StateEffect.define();

// define a new field that will be attached to your view state as an extension, update will be called at each editor's change
const highlight_extension = StateField.define({
	create() { 
		return Decoration.none 
	},
	update(value, transaction) {
	    value = value.map(transaction.changes)
		//console.log("Editor: updating highlight. value map: ", value);
		/*
		for (let effect of transaction.effects) {
			if (effect.is(addMarks)) value = value.update({add: effect.value, sort: true})
			else if (effect.is(filterMarks)) value = value.update({filter: effect.value})
		} 
		*/
		//console.log("highlight_extension: transaction.effects: ", transaction.effects);
	    for (let effect of transaction.effects) {
			if (effect.is(highlight_effect)){
				//console.log("editor: adding highlight. effect.value: ", effect.value);
				value = value.update({add: effect.value, sort: true})
			}
			else if (effect.is(remove_highlight)){
				//console.log("editor: removing highlight. effect.value: ", effect.value);
				value = value.update({filter: effect.value})		  
			} 
	    }

	    return value
	},
	provide: f => EditorView.decorations.from(f)
});

// this is your decoration where you can define the change you want : a css class or directly css attributes
const highlight_decoration = Decoration.mark({
	// attributes: {style: "background-color: red"}
	class: 'llm_work_selection'
});

/*
// your editor's view
let main_view = new EditorView({ 
  extensions: [highlight_extension]
});
*/



let previous_selected_text = null;


// 
let cm_extensions = [
	basicSetup,
	indentUnit.of("	"),
    indentOnInput(), 
    bracketMatching(),
    //javascriptLanguage,
    //languageConf.of(javascript()), // DISABLED FOR AI CHAT
	languageConf.of(markdown()),
    autoLanguage,
	readOnly.of(EditorState.readOnly.of(window.cm_read_only)), // EditorView.editable.of(!this.props.isDisabled)
	//readOnly, //.of(window.cm_read_only),
    //bracketMatching({brackets : "(){}[]"}),
    indentationMarkers(),
  	highlight_extension, // search/select
	//syntaxHighlighting(highlightStyle),
	//scrollPastEnd(),
  	//gutter({class: "cm-mygutter"}),
	//breakpointGutter,
    //lineNumbers(), 
    //highlightActiveLineGutter(),
    //highlightSelectionMatches(),
    // matchBrackets(),
    //matchbrackets(),
    // specialChars(),     
    //keymap.of([...defaultKeymap, ...historyKeymap]),
    
    //jsDocCompletions,
    //history({minDepth:20}),
	undoRedo.of([history()]),
	keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap, ... searchKeymap]),
	
	//classHighlightStyle,
	/*
    markdown({
		base: markdownLanguage,
		//codeLanguages: languages,
		codeLanguages:[javascript()],
		//addKeymap: true,
    }),
	*/
	//historyCompartment.of(history()),
    //keymap.of([...defaultKeymap, ...historyKeymap]),
    //javascript(),
    //html(),
    //
    //defaultHighlightStyle,
    //drawSelection(),
    //EditorView.lineWrapping,
    //syntaxHighlighting(defaultHighlightStyle),
    EditorView.updateListener.of(function(e) {
        //console.log("editorview updated. e: ", e, e.state.doc.toString());
  		//console.log("editor: editorview updated.  current_file_name: ", current_file_name);
  		//console.log("editor.state.doc: ", editor.state.doc);
  		//console.log("editor.state.selection: ", editor.state.selection);
		
  		//console.log("editor.state: ", editor.state.doc.lineAt);
  		//console.log("editor line nr: ", state.doc.lineAt(state.selection.main.head).number);
  		//console.log("editor updated. saving:  current_file_name, cursor_line_nr:", current_file_name, editor.state.selection.main); //, editor.state.doc.line(editor.state.selection.main.head).text);
  		//console.log("state.selection.main.head: ", state.selection);
  		//console.log("state.doc.lineAt(state.selection.main.head): ", state.doc.lineAt(state.selection.main.head));
		//console.log("ranges 0: ", editor.state.selection.ranges[0]);
		
		
		let new_code = e.state.doc.toString();
		
  		current_line_nr = editor.state.doc.lineAt(editor.state.selection.main.head).number;
		//current_line_nr = editor.state.doc.lineAt(editor.state.selection.main.head).from
		
		
		//console.log("editor.state.selection.ranges: ", editor.state.selection.ranges);
		
		current_selection = editor.state.selection.ranges[0]; //{'from':editor.state.selection.main.anchor, 'to':editor.state.selection.main.head};
		//console.log("current_selection: ", current_selection);
		
		// For AI chat
		
		let something_changed = false;
		
		//console.log("window.doc_selected_text: ", window.doc_selected_text);
		window.doc_line_nr = current_line_nr; // TODO: it seems both are used..
		window.doc_current_line_nr = current_line_nr;
		window.doc_selection = {'from':current_selection.from,'to':current_selection.to};
		//console.log("window.doc_current_line_nr: ", window.doc_line_nr);
		if(window.doc_selection.from != window.doc_selection.to){
			//console.log("window.doc_selection: ", window.doc_selection);
			window.doc_selected_text = editor.state.sliceDoc(editor.state.selection.main.from,editor.state.selection.main.to);
		}
		else{
			window.doc_selected_text = null;
		}
		if(window.doc_selected_text != previous_selected_text){
			previous_selected_text = window.doc_selected_text;
			something_changed = true;
		}
		
		
		
		
  		save_file_meta('state_selection_main', current_selection );      //editor.state.selection.ranges[0]);
		
  		//save_file_meta('cursor_head_nr',state.doc.lineAt(state.selection.main.head).number);
  		//save_file_meta('cursor_line_nr',state.doc.lineAt(state.selection.main.head).number);

        
        if(code != new_code){
			something_changed = true;
			playground_live_backups[folder + '/' + current_file_name] = new_code;
  			// The user started making changes to the file, so it's time to quickly save the original data as if it was saved when the file was opened.
  			if(current_file_name == previous_open_file_name){

				
  				//if(localStorage.getItem(folder + current_file_name) == null){
  				if(typeof files[current_file_name] != 'undefined'){
  					if(typeof files[current_file_name]['loaded'] != 'undefined' && files[current_file_name]['loaded'] == true){
  						// already loaded
  					}
  					else{
  						//console.log("saving initial version of file in db");
  						save_file(current_file_name,new_code);
  						save_file_meta('loaded',true);
  					}
  				}
  				else{
  					console.error("\n\n\n\ncm: files[current_file_name] was undefined");
  				}
  			}
			
            code = new_code;
  			//console.warn("EditorView: code changed.  current_file_name, previous_open_file_name: ", current_file_name, previous_open_file_name);
  			if(current_file_name == previous_open_file_name){
  				if(new_code.startsWith('_PLAYGROUND_BINARY_')){ //  || window.filename_is_binary(current_file_name)
  					//console.log("Not saving modified version of a binary file");
  				}else{
  					editor_changed();
  				}
				
  			}
  			else{
  				console.warn("current_file_name has changed, so not calling editor_changed().  current_file_name,previous_open_file_name: ", current_file_name, previous_open_file_name);
  				previous_open_file_name = current_file_name;
  				document.body.classList.add('show-document');
  				window.settings.docs.open = {'filename':current_file_name,'folder':folder}
  				window.doc_reset(); // for AI chat
  				if(window.settings.assistant == 'scribe' && current_file_name.endsWith('.notes')){
  					scroll_to_end();
  				}
				
  				// for AI chat
  				window.update_recent_documents();

  				//window.doc_text = code;
  			}
  			previous_open_file_name = current_file_name;
			
        }
		if(debugging){
			debug_popup();
		}
		  
		
		// for AI chat
		window.doc_text = code;
		try{
			if(something_changed){
				doc_updated();
			}
			
		}
		catch(e){
			console.error("editor.js: caught error calling doc_updated: ", e);
		}
		
		return e;
		  
	}),
	 
	/*
	EditorState.changeFilter.of((transaction) => {
		//console.log("EditorState filter: transaction: ", transaction);
		
		if(transaction.isUserEvent("undo") || transaction.isUserEvent("redo")){
			//console.log("EditorState filter: transaction was an undo or redo transaction");
		}
		else{
			transaction['addToHistory'] = true;
		}
		return transaction;
	}),
	*/
    //autocompletion()
  ];

//console.log("bracketMatching: ", bracketMatching);
let state = EditorState.create({
	extensions: cm_extensions
})


let editor = new EditorView({
	doc: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",
	state: state,
	parent: document.querySelector("#editor"),
});
//console.log("codeMirror editor object: ", editor);

if(window.active_destination = 'document'){
	editor.focus();
}


// keyboard shortcuts
document.body.addEventListener('keydown', function (e) {
	
	// NEW FILE
    if (e.keyCode == 77 && e.metaKey) {
		//console.log("Ctrl-M detected");
        e.preventDefault();
		create_file(false);
    }
	
	
	// SAVE
    if (e.keyCode == 83 && e.metaKey) {
		//console.log("Ctrl-S detected");
        e.preventDefault();
		save_file(current_file_name);
    }
	
	// SEARCH
    if (e.keyCode == 70 && e.metaKey) {
		//console.log("Ctrl-F detected");
        //e.preventDefault();
		open_text_search();
    }
	
    if (e.keyCode == 38) {
		//console.log("Keyboard up detected");
        //e.preventDefault();
		//open_text_search();
		navigate_file_manager_by_keyboard(e.keyCode);
    }
	else if (e.keyCode == 40) {
		//console.log("Keyboard down detected");
        //e.preventDefault();
		//open_text_search();
		navigate_file_manager_by_keyboard(e.keyCode);
    }
	
	
	/*
	// COPY
    if (e.key == 'c' && (e.ctrlKey || e.metaKey)) {
        //e.preventDefault(); // prevent from copying
		//console.log("Ctrl-C detected");
		setTimeout(() => {
			save_to_clipboard_history();
		},1);
		setTimeout(() => {
			update_ui_clipboard_history();
		},10);
    }
	
	// CUT
    if (e.key == 'k' && (e.ctrlKey || e.metaKey)) {
		//console.log("Ctrl-K detected");
		setTimeout(() => {
			save_to_clipboard_history();
		},1);
		setTimeout(() => {
			update_ui_clipboard_history();
		},10);
        //e.preventDefault(); // prevent from pasting
    }
	
	// PASTE
    if (e.key == 'v' && (e.ctrlKey || e.metaKey)) {
		//console.log("Ctrl-V detected");
		update_ui_clipboard_history();
        //e.preventDefault(); // prevent from pasting
    }
	*/
	
});


function navigate_file_manager_by_keyboard(key_code){
	console.log("navigate_file_manager_by_keyboard:  key_code,window.active_section,document.activeElement.tagName,current_file_name: ", key_code, window.active_section, document.activeElement.tagName, current_file_name);
	
	if(typeof key_code == 'number'){
		if(!document.body.classList.contains('sidebar') && document.body.classList.contains('viewing-media') ){
			let subtitle_chunk = document.querySelector('.overlay-description-chunk');
			if(subtitle_chunk != null){
			
				let highlighted_subtitle_chunk = document.querySelector('.overlay-description-chunk.highlighted-description-chunk');
		
				let current_description_chunk_index = 0;
				if(highlighted_subtitle_chunk != null){
					//console.log("highlighted current_description_chunk_index: ", current_description_chunk_index);
					current_description_chunk_index = highlighted_subtitle_chunk.getAttribute('data-description-chunk-index');
				}		
			
				if(key_code == 38 && current_description_chunk_index > 0){ // up
					console.log("going to click on previous subtitle chunk");
					current_description_chunk_index--;
					const previous_chunk_el = document.querySelector('.overlay-description-chunk[data-description-chunk-index="' + current_description_chunk_index + '"]');
					if(previous_chunk_el){
						//console.log("CLICK: " + current_description_chunk_index);
						previous_chunk_el.click();
					}
				}
				else if(key_code == 40){ // down
					const chunks_length = parseInt(subtitle_chunk.getAttribute('data-description-chunk-length'));
					//console.log("going to click on next subtitle chunk. chunks_length: ", current_description_chunk_index, chunks_length);

					if(typeof chunks_length == 'number'){
						if(current_description_chunk_index < chunks_length - 1){
					
							current_description_chunk_index++;
							//console.log("going to click on next subtitle chunk really: " + current_description_chunk_index);
							const next_chunk_el = document.querySelector('.overlay-description-chunk[data-description-chunk-index="' + current_description_chunk_index + '"]');
							if(next_chunk_el){
								//console.log("CLICK: " + current_description_chunk_index);
								next_chunk_el.click();
							}
						}
					}
			
				}
			}
		}
	
	
	
	
	
	
		if(typeof window.active_section != 'string'){
			return false
		}
		if(window.code_mirror_editor_el == null){
			window.code_mirror_editor_el = document.querySelector('.cm-editor');
		}
		if(window.code_mirror_editor_el == null){
			console.error("navigate_file_manager_by_keyboard: window.code_mirror_editor_el was still null. Aborting.");
			return false
		}
		
		if(window.code_mirror_editor_el.classList.contains('cm-focussed')){
			console.error("navigate_file_manager_by_keyboard: aborting, CodeMirror editor has cm-focussed class.");
			return false
		}
		if(document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA'){
			console.warn("navigate_file_manager_by_keyboard: an input or textarea was the active element. Aborting.");
			return false
		}
	
		if( 
			(document.body.classList.contains('full-playground-overlay') && (document.body.classList.contains('viewing-image') 
			|| document.body.classList.contains('viewing-media')) && !document.body.classList.contains('image-editor')) 
			|| (document.body.classList.contains('sidebar') && window.settings.left_sidebar == 'docs' && window.active_section == 'sidebar' && typeof current_file_name == 'string' && files != null)
		){
			// File manager is visible and has focus, or fullscreen is enabled
			//console.log("navigate_file_manager_by_keyboard: OK, can try to select the next one. files: ", current_file_name, files);
			const files_list = keyz(files);
			const current_file_index = files_list.indexOf(current_file_name);
			if(current_file_index != -1){
				if(key_code == 40 && current_file_index > 0){
					new_file_name = files_list[current_file_index - 1];
					open_file(new_file_name);
				}
				else if(key_code == 38 && current_file_index < files_list.length - 2){
					new_file_name = files_list[current_file_index + 1];
					open_file(new_file_name);
				}
			}
		}
	}
	else if(typeof key_code == 'string'){
		let filenames_list = keyz(files);
		if(filenames_list.length){
			if(key_code == 'first'){
				open_file( filenames_list[filenames_list.length-1] ); // SIC
			}
			else if(key_code == 'last'){
				open_file( filenames_list[0] ); // SIC
			}
		}
		
	}
	
	return true
}




/*
function App() {
  const [rebuild, setRebuild] = useState(true)
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('light');
  const container = useRef(null);
  const editor = useRef(null);

  useEffect(() => {
    if (container.current) {
      const extensions = [
        history(),
        indentOnInput(),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        ...languageExtensions[language],
        ...themeExtensions[theme],
      ]
      if (!editor.current) {
        editor.current = new EditorView({
          state: EditorState.create({
            doc: exampleCode,
            extensions,
          }),
          parent: container.current,
        })
      } else if (rebuild) {
        const doc = editor.current.state.doc
        editor.current.destroy()
        editor.current = new EditorView({
          state: EditorState.create({
            doc: exampleCode,
            extensions,
          }),
          parent: container.current,
        })
      } else {
        editor.current.dispatch({
          reconfigure: {
            full: extensions,
          }
        })
      }
    }
  }, [rebuild, language, theme, container, editor])

  return (
    <div>
      <p className="buttons">
      rebuild {rebuild ? 'on' : 'off'}{' '}
        <button onClick={() => setRebuild(true)}>On</button>
        <button onClick={() => setRebuild(false)}>Off</button>
      </p>
      <p className="buttons">
      {language}{' '}
        <button onClick={() => setLanguage('javascript')}>JavaScript</button>
        <button onClick={() => setLanguage('python')}>Python</button>
      </p>
      <p className="buttons">
        {theme}{' '}
        <button onClick={() => setTheme('light')}>Light</button>
        <button onClick={() => setTheme('dark')}>Dark</button>
      </p>
      <div className="code" ref={container}></div>
    </div>
  );
}

*/










// EDITOR CHANGEd

// only triggered if the current_file_name was the same as the last time that the editor actually changed. To avoid comparing different files.
function editor_changed(){
    //console.log("in editor_changed. code: ", code);
	//console.log("-\n------\nin editor_changed. current_file_name: ", current_file_name);
    
    
	let hash = get_hash(code);
	if(current_file_name != unsaved_file_name){
		if(typeof files[current_file_name]['save_hash'] != 'undefined'){
			if(hash == files[current_file_name]['save_hash']){
				save_file_meta('modified',false);
			}
			else{
				save_file_meta('modified',true);
			}
		}
		else if(typeof playground_saved_files[folder + '/' + current_file_name] != 'undefined'){
			if(playground_saved_files[folder + '/' + current_file_name] == code){
				save_file_meta('modified',false);
			}
			else{
				save_file_meta('modified',true);
			}
		}
		else{
			save_file_meta('modified',true);
			//files[current_file_name]['modified'] = true;
		}
	}
	
	
	files[current_file_name]['save_hash'] = hash;
	// console.log("editor_changed:  setting playground_live_backups value (but not saving to localstorage).  current_file_name,code: ", current_file_name, code);
	playground_live_backups[folder + '/' + current_file_name] = code;
	//savr(folder + '/playground_backup_' + current_file_name, code); // moved this to only run on settled() in main.js.
	
	//console.log("editor.state: ", editor.state);
	
    //localStorage.setItem(folder + '_last_opened',current_file_name);
	//if(typeof files[file] == 'undefined'){ files[file] = {'modified':true}}
	
	//console.log("editor_changed. folder + current_file_name: ", folder + '/' + current_file_name);
	/*
	getr(folder + curent_file_name);
	.then(function(value){
		//console.log("getr: got value: ", value);
		
		if(typeof value == 'string'){
			if(code == value){
				save_file_meta('modified',false);
			}
			else{
				save_file_meta('modified',true);
			}
		}
		else{
			decompress(value,'gzip')
			.then(function(unzipped){
				
				console.error("setr: unzipping is done");
				console.error('setr: unzipped: ', typeof unzipped, unzipped);
				
				editor_set_value(unzipped);
				if(typeof files[current_file_name]['selection'] != 'undefined'){
					//console.log("setr: last known cursor position in this document is available: ", files[current_file_name]['selection']);
					scroll_to_selection(files[current_file_name]['selection']);
				}
				
			})
			.catch(function(err){
				//console.log("setr: unzipping failed");
			});
		}
	})
	.catch(function(err){
		//console.log("getr failed: ", err);
	})
	*/
	
	//if(typeof files[file]['modified'] != 'undefined' && files[file]['modified'] == true){}
	
	//save_file_meta('modified',true);
	/*
	if(typeof playground_live_backups[current_file_name] == 'undefined'){
		//console.log("editor_changed: adding code to live_backups for the first time, for file: ", current_file_name);
		playground_live_backups[current_file_name] = code;
	}
	*/
	/*
	//if(typeof playground_modified_files[current_file_name] == 'undefined'){
		//console.log("editor_changed: setting playground_modified_files to true for the first time, for file: ", current_file_name);
		//playground_modified_files[current_file_name] = true
		//localStorage.setItem(folder + 'playground_modified_files', JSON.stringify(playground_modified_files));
        if(fileMenu.querySelector('.current')) {
            fileMenu.querySelector('.current').classList.add('modified');
        }
	}
	*/
	
	if(files[current_file_name]['modified'] == true){
        if(fileMenu.querySelector('.current')) {
            fileMenu.querySelector('.current').classList.add('modified');
			document.body.classList.add('current-modified');
        }
	}
	else{
        if(fileMenu.querySelector('.current')) {
            fileMenu.querySelector('.current').classList.remove('modified');
			document.body.classList.remove('current-modified');
        }
	}
	/*
    if(code != localStorage.getItem(folder + current_file_name)) {
		//console.log("editor_changed: the code changed, not the same as the saved file");
		//playground_live_backups[current_file_name] = code;
		//playground_modified_files[current_file_name] = true;
		save_file_meta('modified',true);
		
		//localStorage.setItem(folder + 'playground_live_backups', JSON.stringify(playground_live_backups));
        
    }
	else{
		//playground_modified_files[current_file_name] = false;
		save_file_meta('modified',false);
        
	}
	*/
	
	if(diffing){
		differ();
	}
	
	clearTimeout(settle_timer);
  	settle_timer = window.setTimeout(function() {
		settled();
  	},2000);
	
	
	//localStorage.setItem(folder + 'playground_live_backups', JSON.stringify(playground_live_backups));
	//localStorage.setItem(folder + 'playground_modified_files', JSON.stringify(playground_modified_files));
	
	
	
    // autoparse is disabled by default to avoid issues in case there is a runaway loop;
    if(keys_pressed < 6 && current_file_name.toLowerCase().endsWith('.js')){
        keys_pressed++;
        if(keys_pressed == 5){
            console.warn("5 key presses: enabling autoparse");
			let autoparse_el = document.getElementById('autoparse');
            if(autoparse_el){
            	autoparse_el.checked = true;
            }
            //autoparse = true;
			allow_execute = true;
        }
    }
	
    if(allow_execute && autoparse && (current_file_name.toLowerCase().endsWith('.js') || current_file_name == unsaved_file_name)){
        should_run = true; // do the first auto-run on the next clock tick
    }
	
	
	try{
		//console.log("history? state: ", state);
		//console.log("history? editor.state: ", editor.state.values[0]['done'].length, editor.state.values[0]['undone'].length, editor.state.values[0]);
		//console.log("UNDO: editor.state.values[0]['done']: ", editor.state.values[0]['done'].length,  editor.state.values[0]['done']);
		
		if(editor.state.values[0]['done'].length >= 2){
			document.body.classList.add('can-undo');
		}
		else{
			document.body.classList.remove('can-undo');
		}
		
		if(editor.state.values[0]['undone'].length > 0){
			document.body.classList.add('can-redo');
		}
		else{
			document.body.classList.remove('can-redo');
		}
	}
	catch(e){
		console.error("settles: error getting document history: ", e);
	}
	
}



// SET VALUE

async function editor_set_value(value){
	try{
		if(typeof value == 'string'){
			//console.log("editor_set_value:  \n-string value: \n", value.substr(0,60) , "\n-current_file_name, files[current_file_name]: ",current_file_name, files[current_file_name]);
		}
		
		a_file_is_open = false;
		let text_length = null;
		
		document.body.classList.remove("viewing-image");
		document.body.classList.remove("viewing-media");
		document.body.classList.remove('image-editor');
		document.body.classList.remove("zip-file");
		document.body.classList.remove("subtitle-document");
		
		
		document.body.classList.add('show-document');
		
		if(value == null){
			console.error("editor_set_value: received null value");
			return false
		}
		
		window.settings.docs['last_opened'] = {'folder':folder,'filename':current_file_name}
		//console.log("window.settings.docs['last_opened']: \n", JSON.stringify(window.settings.docs['last_opened'],null,2));
		
		//const overlay_description_el = document.getElementById('overlay-description-container');
		playground_overlay_el.innerHTML = '';
		/*
		if(typeof value == 'string' && value.trim() == ''){
			document.body.classList.add("doc-empty");
		}
		*/
		
		
		
		if(typeof value == 'string' && value == '_PLAYGROUND_BINARY_'){
			console.warn("editor_set_value: value IS '_PLAYGROUND_BINARY_' ONLY, so actual data needs to be loaded");
		}
		playground_overlay_el.innerHTML = '';
		
		if(typeof value == 'string'){
			
			
			
			if(value.startsWith('_PLAYGROUND_BINARY_') && typeof files[current_file_name] != 'undefined' && typeof files[current_file_name].compression == 'string' && files[current_file_name].compression == 'gzip'){
				try{
					value = await decompress( string_to_buffer(value.substr(19)),'gzip');
				}
				catch(err){
					console.error("editor_set_value: decompression of file failed: ", err);
				}
			
			}
			
			
			//console.log("value.startsWith('_PLAYGROUND_BINARY_'): ", value.startsWith('_PLAYGROUND_BINARY_'));
			if(value.startsWith('_PLAYGROUND_BINARY_')){ //  || window.filename_is_binary(current_file_name)
				//console.log("editor_set_value: switching editor to read-only mode as the file starts with _PLAYGROUND_BINARY_");

				set_editor_read_only(true);
				document.body.classList.add('binary-file');
				document_summarize_button_el.removeAttribute('title');
			}
			else{
				//console.log("editor_set_value: no need for read-only mode as the file is a normal text file");
				set_editor_read_only(false);
				document.body.classList.remove('binary-file');
				if(value.indexOf(' ') != -1){
					document_summarize_button_el.setAttribute('title', value.length + ' chars, ' + value.split(' ').length + ' words, '  + value.split('\n').length + ' lines');
				}
				else{
					document_summarize_button_el.removeAttribute('title');
				}
				
			}
			
			if(value.length == 0){
				document.body.classList.add('doc-empty');
			}
			else{
				document.body.classList.remove('doc-empty');
			}
			
		}
		
		
		if(typeof current_file_name == 'string' && (current_file_name.endsWith('.js') || current_file_name.endsWith('.ts') || current_file_name.endsWith('.css') || current_file_name.endsWith('.py') || current_file_name.endsWith('.php') || current_file_name.endsWith('.html') || current_file_name.endsWith('.json'))){
		
					
					if(current_file_name.endsWith('.js')){
						document.body.classList.add('javascript-document');
					}
					if(current_file_name.endsWith('.js') || current_file_name.endsWith('.py')){
				
					}
					document.body.classList.add('coder');
		
				}
				else{
					document.body.classList.remove('coder');
					
				}
		
		
		// Coding document?
		if(current_file_name.toLowerCase().endsWith('.js') || current_file_name.toLowerCase().endsWith('.json') || current_file_name.toLowerCase().endsWith('.ts') || current_file_name.toLowerCase().endsWith('.py') || current_file_name.toLowerCase().endsWith('.php') || current_file_name.toLowerCase().endsWith('.html') || current_file_name.toLowerCase().endsWith('.css')){
			document.body.classList.add('coder');
			
			if(window.coder_script_loaded == false){
				//console.log("adding p_coder.js to the page because of this file: ", current_file_name);
				if(window.add_script){
					window.add_script('./p_coder.js'); 
				}
			}
		}
		else{
			document.body.classList.remove('coder');
		}
		
		// Javascript document?
		if(current_file_name.toLowerCase().endsWith('.js')){
			document.body.classList.add('javascript-document');
		}
		else{
			document.body.classList.remove('javascript-document');
		}
		
		
		if(current_file_name.toLowerCase().endsWith('.srt') || current_file_name.toLowerCase().endsWith('.vtt')){
			document.body.classList.add('subtitle-document');
			//console.log("editor_set_value: setting value of a subtitle file: " + current_file_name);
			if(typeof files[current_file_name] != 'undefined'){
				//console.log("editor_set_value: current file name is in files dict: " + current_file_name, JSON.stringify(files[current_file_name],null,2));
			}
			else{
				console.error("editor_set_value: current_file_name is not in files dict?: " + current_file_name, JSON.stringify(files,null,2));
			}
			if(typeof files[current_file_name] != 'undefined' && files[current_file_name] != null && typeof files[current_file_name].origin_file != 'undefined' && files[current_file_name].origin_file != null && typeof files[current_file_name].origin_file.filename == 'string'){
				document.body.classList.add('subtitle-document-has-origin-file'); // this wil cause the play button to also become visible, allowing for a short-cut to immediately play an edited subtitle file
			}
			else{
				console.warn("editor: subtitle file, but without origin_file meta data: " + current_file_name + "\n" + JSON.stringify(files[current_file_name],null,4));
			}
			
		}
		else{
			document.body.classList.remove('subtitle-document');
			document.body.classList.remove('subtitle-document-has-origin-file');
		}
		
		
		
		// Special settings backup file?
		if(folder == '' && (current_file_name == 'papeg_ai_settings.json' || current_file_name.endsWith('papeg_ai_conversation.json') )){
			document.body.classList.add('viewing-settings-file');
		}
		else{
			document.body.classList.remove('viewing-settings-file');
		}
		
		// SQLITE file?
		if(current_file_name.toLowerCase().endsWith('.sqlite') || current_file_name.toLowerCase().endsWith('.sqlite3')){
			playground_overlay_el.innerHTML = '<h1>SQLITE</h1>';
			open_sqlite(value);
		}
		
		// ZIP file?
		else if(current_file_name.toLowerCase().endsWith('.zip')){
			playground_overlay_el.innerHTML = '<h1>📦 ZIP</h1>';
			try{
				display_zip(value);
			}
			catch(err){
				console.error("caught error displaying zip file: ", err);
				flash_message(get_translation('Error_opening_file'),3000,'fail');
			}
		}
	
		else if( (typeof value == 'string' && value.startsWith('_PLAYGROUND_BINARY_'))){ //  || window.filename_is_binary(current_file_name)     // superfluous extra check // was it though? 
			
			// Check if filename is image
			if(filename_is_image(current_file_name) ){
				
				
				
				let img_el = null;
				/*
				if(window.settings.assistant.startsWith('image_to_text')){
					//generate_image_html(null,folder,current_file_name,image_to_text_prompt_image_el);
					generate_image_html(null,folder,current_file_name);
					if(!document.body.classList.contains('show-document') && window.innerWidth < 981){
						console.warn("not also showing image in document editor overlay because an image_to_text AI is selected, and the window's innerWidth isn't very wide: ",  window.innerWidth);
						return
					}
					if( window.innerWidth < 641 ){
						console.warn("not also showing image in document editor overlay because an image_to_text AI is selected, and the window's innerWidth isn't very wide: ",  window.innerWidth);
						//document.body.classList.remove('show-document');
						return
					}
				}
				*/
				
				img_el = generate_image_html(null,folder,current_file_name);
				if(img_el){
					img_el.classList.add("editor-image");
					img_el.id = "editor-image";
				
					img_el.addEventListener('click', (event) => {
						event.stopPropagation();
						if(document.body.classList.contains('full-playground-overlay')){
							document.body.classList.remove('full-playground-overlay');
						}
						else{
							if( window.innerWidth > 640 ){
								document.body.classList.add('full-playground-overlay');
								document.body.classList.remove('sidebar');
							}
						}
					})
				
				
					playground_overlay_el.appendChild(img_el); //.innerHTML += '<img class="file-list-image" src="' + folder + '/' + file + '"/>';
					document.body.classList.add("viewing-image");
					//if(window.innerWidth > 980){
						document.body.classList.add("show-document");
					//}
					let image_context_buttons_container_el = document.createElement('div');
					image_context_buttons_container_el.classList.add("image-context-buttons-container");
				
					
					// EDIT IMAGE BUTTON
					let edit_image_button_el = document.createElement('button');
					edit_image_button_el.setAttribute('data-i18n','Edit_image');
					edit_image_button_el.textContent = get_translation('Edit'); // get_translation('Edit_image');
				
					edit_image_button_el.addEventListener('click', () => {
					
						add_script('./js/filerobot-image-editor.min.js')
						.then((value) => {
							//console.log("editor_set_value: filerobot-image-editor.min.js script seems to be loaded OK. Creating image editor.");
							document.body.classList.add('image-editor');
							create_image_editor(img_el);
							setTimeout(() => {
								let image_editor_save_button = document.querySelector('.FIE_topbar-save-button.SfxButton-root');
								if(image_editor_save_button){
									//console.log("image editor save button exists");
									image_editor_save_button.addEventListener('click', () => {
										setTimeout(() => {
											let image_editor_filename_input = document.querySelector('.FIE_save-modal.SfxModal-Container input.SfxInput-Base')
											if(image_editor_filename_input){
												//console.log("image editor filename input exists");
												image_editor_filename_input.value = current_file_name.replace(/\.[^/.]+$/, "");
												image_editor_filename_input.focus();
											}
											else{
												//console.log("image editor filename input does not exist yet");
											}
										},100);
										setTimeout(() => {
											let image_editor_filename_input = document.querySelector('.FIE_save-modal.SfxModal-Container input.SfxInput-Base')
											if(image_editor_filename_input){
												//console.log("image editor filename input exists");
												image_editor_filename_input.value = current_file_name.replace(/\.[^/.]+$/, "");
												image_editor_filename_input.focus();
											}
											else{
												//console.log("image editor filename input does not exist yet");
											}
										},1000);
							
									});
								}
								else{
									//console.log("image editor save button does not exist yet");
								}
							},100);
						})
						.catch((err) => {
							console.error("editor_set_value: caught add_script error: ", err);
						})
					
					});
				
					image_context_buttons_container_el.appendChild(edit_image_button_el);
				
				
				
				
				
					// SCAN IMAGE BUTTON
					let scan_image_button_el = document.createElement('button');
					scan_image_button_el.setAttribute('data-i18n','Scan');
					scan_image_button_el.setAttribute('id','overlay-scan-file-button');
					scan_image_button_el.textContent = get_translation('Scan');
					scan_image_button_el.addEventListener('click', () => {
						//console.log("clicked on scan image button");
					
						scan_image_button_el.classList.add('no-pointer-events');
						scan_image_button_el.classList.add('opacity05');
						setTimeout(() => {
							scan_image_button_el.classList.remove('no-pointer-events');
							scan_image_button_el.classList.remove('opacity05');
						},5000);
					
						if(window.innerWidth < 641){
							document.body.classList.remove('show-document');
						}
						else if(window.innerWidth < 981){
							document.body.classList.remove('sidebar');
						}
						document.body.classList.remove('full-playground-overlay');
					
						switch_assistant('image_to_text_ocr');
						prompt_el.value = '';
					
						if(window.last_image_to_text_blob != null){
							//window.add_chat_message('current','user',get_translation('Write_a_detailed_description_of_this_image'),'Write_a_detailed_description_of_this_image');
							
							let new_ocr_task = {
								'assistant':'image_to_text_ocr',
								'image_blob':window.last_image_to_text_blob,
								'origin':'chat', // Playground?
								'type':'image_processing',
								'state':'should_ocr',
								'prompt':'',
								//'file':window.last_image_to_text_blob_file
							}
							
							
							if(window.last_image_to_text_blob_file != null){
								new_ocr_task['file'] = window.last_image_to_text_blob_file;
								if(typeof window.last_image_to_text_blob_file.filename == 'string'){
									window.last_user_query = remove_file_extension(window.last_image_to_text_blob_file.filename);
								}
							}
							
							window.create_image_to_text_task(new_ocr_task);
					
							/*
							if(window.innerWidth < 641){
								document.body.classList.remove('show-document');
							}
							*/
					
						}
					
					});
					image_context_buttons_container_el.appendChild(scan_image_button_el);
				
				
				
				
					// DESCRIBE IMAGE BUTTON
					// Only shown if WebGPU is available
					if(window.web_gpu_supported){
						let describe_image_button_el = document.createElement('button');
						describe_image_button_el.setAttribute('data-i18n','Describe');
						scan_image_button_el.setAttribute('id','overlay-describe-file-button');
						describe_image_button_el.textContent = get_translation('Describe');
						describe_image_button_el.addEventListener('click', () => {
							//console.log("clicked on describe image button");
							/*
							describe_image_button_el.classList.add('no-pointer-events');
							setTimeout(() => {
								describe_image_button_el.classList.remove('no-pointer-events');
							},10000);
							*/
							switch_assistant('image_to_text');
							prompt_el.value = get_translation('Write_a_detailed_description_of_this_image');
						
							if(window.innerWidth < 981){
								document.body.classList.remove('sidebar');
							}
						
							if(window.last_image_to_text_blob != null){
								window.add_chat_message('current','user',get_translation('Write_a_detailed_description_of_this_image'),'Write_a_detailed_description_of_this_image');
								
								
								let new_image_to_text_task = {
									'assistant':'image_to_text',
									'image_blob':window.last_image_to_text_blob,
									'origin':'chat', // TODO: playground?
									'prompt':'Write a detailed description of this image',
									'state':'should_image_to_text',
									//'file':window.last_image_to_text_blob_file
								}
								if(window.busy_doing_blueprint_task){
									new_image_to_text_task['destination'] = 'document';
								}
								else{
									new_image_to_text_task['destination'] = 'chat';
								}
								
								if(window.last_image_to_text_blob_file != null){
									new_image_to_text_task['file'] = window.last_image_to_text_blob_file;
									if(typeof window.last_image_to_text_blob_file.filename == 'string'){
										window.last_user_query = remove_file_extension(window.last_image_to_text_blob_file.filename);
									}
								}
								
								window.create_image_to_text_task(new_image_to_text_task);
						
								if(window.innerWidth < 641){
									document.body.classList.remove('show-document');
								}
						
							}
							document.body.classList.remove('full-playground-overlay');
					
						});
						image_context_buttons_container_el.appendChild(describe_image_button_el);
					
					}
					
					
					// DOWNLOAD IMAGE BUTTON
					let download_image_button_el = document.createElement('button');
					download_image_button_el.classList.add('download-button');
					//download_image_button_el.setAttribute('data-i18n','Download');
					//download_image_button_el.textContent = get_translation('Download');
					download_image_button_el.addEventListener('click', () => {
						//console.log("clicked on download image button");
						download_currently_open_file();
					});
					image_context_buttons_container_el.appendChild(download_image_button_el);
				
					
					
					
					
					
					
					playground_overlay_el.appendChild(image_context_buttons_container_el);
				
					add_overlay_description();
					/*
					if(typeof files[current_file_name] != 'undefined' && typeof files[current_file_name]['image_to_text_description'] == 'string'){
						//console.log("image file has description in meta data");
						let image_description_container_el = document.createElement('div');
						image_description_container_el.classList.add('overlay-image-description-container');
						image_description_container_el.setAttribute('id','overlay-description-container');
						let image_description_el = document.createElement('div');
						image_description_el.classList.add('overlay-image-description');
						image_description_el.textContent = files[current_file_name]['image_to_text_description'];
					
						image_description_container_el.appendChild(image_description_el);
						playground_overlay_el.appendChild(image_description_container_el);
					}
					*/
					/*
					else if(typeof files[current_file_name] != 'undefined' && typeof files[current_file_name]['audio_to_text_description'] == 'string'){
						//console.log("audio file has transcription in meta data");
						let image_description_container_el = document.createElement('div');
						image_description_container_el.classList.add('overlay-image-description-container');
						let image_description_el = document.createElement('div');
						image_description_el.classList.add('overlay-image-description');
						image_description_el.textContent = files[current_file_name]['audio_to_text_description'];
					
						image_description_container_el.appendChild(image_description_el);
						playground_overlay_el.appendChild(image_description_container_el);
					}
					else{
						//console.log("No meta description/transcription for this file");
					}
					*/
				}
				
				
			}
			else if(filename_is_media(current_file_name)){
				//console.log("editor: filename_is_media");
				let video_el = generate_video(value,folder,current_file_name); // generated audio html and transcribe button
				//console.log("video_el: ", video_el);
				document.body.classList.add("viewing-media");
				
				playground_overlay_el.appendChild(video_el); //.innerHTML += '<img class="file-list-image" src="' + folder + '/' + file + '"/>';
				//return
				
				add_overlay_description();
				/*
				if(typeof files[current_file_name] != 'undefined' && typeof files[current_file_name]['audio_to_text_description'] == 'string'){
					//console.log("audio file has transcription in meta data");
					let image_description_container_el = document.createElement('div');
					image_description_container_el.classList.add('overlay-image-description-container');
					image_description_container_el.setAttribute('id','overlay-description-container');
					let image_description_el = document.createElement('div');
					image_description_el.classList.add('overlay-image-description');
					image_description_el.textContent = files[current_file_name]['audio_to_text_description'];
				
					image_description_container_el.appendChild(image_description_el);
					playground_overlay_el.appendChild(image_description_container_el);
				}
				else{
					//console.log("No meta description/transcription for this file");
				}
				*/
				
			}

			else{
				console.error("string value starting with _PLAYGROUND_BINARY_ fell though.  current_file_name,value: ", current_file_name, value);
				playground_overlay_el.innerHTML = ''; // <h1>Unsupported file type</h1>
			}
		
		
		
		}
		/*
		else if(typeof value == 'string' && filename_is_image(current_file_name)){
			//console.log("filename_is_image");
			let img_el = generate_image_html(null,folder,current_file_name);
			//console.log("img_el: ", img_el);
			img_el.classList.add("editor-image");
			img_el.id = "editor-image";
			playground_overlay_el.appendChild(img_el); //.innerHTML += '<img class="file-list-image" src="' + folder + '/' + file + '"/>';
		}
	
		else if(typeof value == 'string' && filename_is_media(current_file_name)){
			//console.log("filename_is_media");
			let video_el = generate_video(null,folder,current_file_name);
			//console.log("video_el: ", video_el);
			video_el.classList.add("video-player");
			video_el.id = "video-player";
			playground_overlay_el.appendChild(video_el); //.innerHTML += '<img class="file-list-image" src="' + folder + '/' + file + '"/>';
		}
		*/
	
	
	
		else if(typeof value == 'string'){
			
			if(typeof editor.state != 'undefined' && typeof editor.state.doc != 'undefined'){
			    const update = editor.state.update({changes: {from: 0, to: editor.state.doc.length, insert: value}});
				//update.addToHistory.of(false);
				update['addToHistory'] = false; // ,Transaction.addToHistory.of(false)
				//transaction['addToHistory'] = true;
			    editor.update([update]);
			
				a_file_is_open = true;
				text_length = value.length;
			
				setTimeout(() => {
					resetUndoRedo();
				},1)
			}
			else{
				console.error("editor.state.doc undefined");
			}
		    
			//
			//  SCROLL TO LINE
			//
		
			if(typeof files[current_file_name] != 'undefined' && typeof files[current_file_name]['state_selection_main'] != 'undefined'){
				//editor.dispatch({selection: {anchor: N, head: N}})
				//console.log("editor_set_value. restoring selection: ", files[current_file_name]['state_selection_main']);
				//editor.dispatch({selection: files[current_file_name]['state_selection_main']})
				scroll_to_selection(files[current_file_name]['state_selection_main']); // files[current_file_name]['state_selection_main'] is also the default, so doesn't realy have to be provided here
		
			}
			else{
				//console.log("editor_set_value. No remembered selection, will scroll to last non-empty line.");
				if(typeof value == 'string'){
			
				    let lines = value.split('\n');
				    let lines_length = lines.length;
				    //console.log("lines.length: ", lines_length);
				    if(lines.length < 60){
				        let add_newlines_count = 60 - lines.length;
				        for(let i = 0; i < add_newlines_count; i++){
				            value += '\n';
				        }
				        lines = value.split('\n');
				        lines_length = lines.length;
				    }
    
				    for(let i = lines_length-1; i > 0; i--){
				        //console.log("lines[i]: ", typeof lines[i], '>' + lines[i] + '<');
				        if(lines[i].trim() != ''){
				            //console.log("first non-empty line is at: ", i);
			
							let line_to_scroll_to = i < lines_length - 2 ? i+2 : i;
							scroll_to_line(line_to_scroll_to);
				            break;
				        }
				    }
			
				}
				
				
	    
			}
			//console.log("resetting document undo history");
			resetUndoRedo();
			
			
			// SVG
			
			// SVG files are a special type of text file that also gets an image overlay, which can be closed to reveal the text underneath.
			// TODO: integrate an actual SVG editor UI, and load that in on demand
			if(current_file_name.toLowerCase().endsWith('.svg')){
				//value = 'data:image/svg+xml,' + value.replace(/[<>#%{}"]/g, (x) => '%' + x.charCodeAt(0).toString(16));
	
				let img_el = document.createElement('img');
				img_el.classList.add("editor-image");
				img_el.id = "editor-image";
				img_el.src = 'data:image/svg+xml,' + value.replace(/[<>#%{}"]/g, (x) => '%' + x.charCodeAt(0).toString(16));
				playground_overlay_el.appendChild(img_el); //.innerHTML += '<img class="file-list-image" src="' + folder + '/' + file + '"/>';
				document.body.classList.add("viewing-image");
	
				let image_context_buttons_container_el = document.createElement('div');
				image_context_buttons_container_el.classList.add("image-context-buttons-container");
	
				let download_image_button_el = document.createElement('button');
				download_image_button_el.classList.add('download-button');
				/*
				download_image_button_el.setAttribute('data-i18n','Download');
				download_image_button_el.textContent = get_translation('Download');
				*/
				download_image_button_el.addEventListener('click', () => {
					//console.log("clicked on download image button");
					download_currently_open_file();
				});
				image_context_buttons_container_el.appendChild(download_image_button_el);
	
	
				let edit_image_button_el = document.createElement('button');
				edit_image_button_el.setAttribute('data-i18n','Edit_image');
				edit_image_button_el.textContent = get_translation('Edit_image');
	
				edit_image_button_el.addEventListener('click', () => {
					document.body.classList.remove("viewing-image");
					playground_overlay_el.innerHTML = "";
				});
				image_context_buttons_container_el.appendChild(edit_image_button_el);
	
				playground_overlay_el.appendChild(image_context_buttons_container_el);
			}
			
			
			
			
		}
		else{
			console.error("editor.js: editor_set_value fell through. value is not a string.");
			try{
				console.warn("editor_set_value: input value is not a string: ", typeof value, value);
				//value = value.toString();
		
				if(typeof files[current_file_name]['type'] != 'undefined' && files[current_file_name]['type'] == 'image'){
					//playground_overlay_el.innerHTML = "IMAGE";
					let img_el = generate_image_html(null,folder,current_file_name);
					img_el.classList.add("editor-image");
					playground_overlay_el.appendChild(img_el); //.innerHTML += '<img class="file-list-image" src="' + folder + '/' + file + '"/>';
				}
		
			}
			catch(err){
				console.error("editor_set_value: could not toString value: ", err);
				//return
			}
			
			//if(typeof value != 'string'){
				
			//}
			
			//else{
				//console.error("PLAYGROUND: EDITOR.JS: THIS COULD NEVER RUN");
				/*
			    console.log("in editor_set_value. value: ", '' + value.substr(0,10) + '...');
    
			    const update = editor.state.update({changes: {from: 0, to: editor.state.doc.length, insert: value}});
			    editor.update([update]);
				a_file_is_open = true;
				text_length = ('' + value).length
				*/
			//}
    
	
			/*
			editor.dispatch({
			    effects: StateEffect.reconfigure.of(cm_extensions)
			});
			*/
	
	
			
		
		}
		
		/*
		// Used by AI chat project
		window.doc_length = text_length;
		if(text_length != null && text_length > 0){
			window.doc_text = value;
		}else{
			window.doc_text = '';
		}
		
		// reset other things
		window.doc_selected_text = '';
		window.doc_selected_line_nr = null;
		
		doc_updated();
		*/
		
		update_ui();
		//update_ui_folder();
		document.body.classList.remove('loading-file');
		//console.log("editor_set_value:  calling post_file_load (BLOCKED)");
	    //post_file_load();
	}
	catch(err){
		console.error("caught error in editor_set_value: ", err);
		document.body.classList.remove('loading-file');
		flash_message(get_translation('An_error_occured'), 3000, 'fail');
	}
	
}









function get_editor_state(){
	console.warn("in get_editor_state");
	
	//console.log("- editor.state: ", editor.state);
	/*
	const new_state = EditorState.fromJSON(
		{
			...editor.state.toJSON({ history: historyField }),
			history,
		},
		editor.state,
		{ history: historyField }
	);
	//console.log("get_editor_state: new_state: ", new_state);
	*/
	return editor.state;
}


const editor_undo = () => {
	//console.log("in editor_undo");
    if (editor.state) {
		undo({
        	state: editor.state,
        	dispatch: editor.dispatch,
		});
    }
	else{
    	console.error("editor_undo: no editor");
    }
};

const editor_redo = () => {
	//console.log("in editor_redo");
    if (editor.state) {
        redo({
        	state: editor.state,
        	dispatch: editor.dispatch,
        });
    }
	else{
    	console.error("editor_redo: no editor");
    }
};




function resetUndoRedo() {
	//console.log("in resetUndoRedo");
    // Clear history
    editor.dispatch({
      effects: [undoRedo.reconfigure([])],
    });

    // Add history back
	
    editor.dispatch({
      effects: [undoRedo.reconfigure([history()])],
    });
	
}


function set_editor_read_only(desired_state){
	//console.log("in set_editor_read_only. desired_state: ", desired_state);
	editor.dispatch({
		effects: readOnly.reconfigure(EditorState.readOnly.of(desired_state))
	})
}

// editor.editable.of(state)




// MOVED THESE TO CHATTY_DOCS.JS
/*
// search string must be at least 3 characters
// Returns a codemirror object with the start and end characters index
function search_in_doc(needle=null){
	//console.log("in search_in_doc. needle: ", needle);
	
	if(typeof needle == 'string' && needle.length > 2){
		let cursor = new SearchCursor(editor.state.doc, needle); 
		cursor.next();
		//console.log("search_in_doc: cursor.value: ", cursor.value);
		return cursor.value;
	}
	else{
		console.error("search_in_doc: invalid search string. Must be at least three characters long: ", needle);
	}
	return null;
}


function search_and_replace(needle,replacement){
	//console.log("in search_and_replace.  needle,replacement: ", needle,replacement);
	
	if(typeof needle == 'string' && needle.length > 0){
		let position = search_in_doc(needle);
		//console.log("search_and_replace: position: ", position);
		if(position == null){
			console.error("search_and_replace: could not find the string");
			return false
		}
		editor.dispatch({
			changes: {from:position.from, to:position.to, insert: replacement}
		})
		return true;
		
		
		
	}
	else{
		console.error("search_and_replace: invalid search string:", needle);
	}
	
	return false
}


function insert_into_document(content){
	//console.log("in insert_into_doc. content: ", content);
	
	if(typeof content != 'string'){
		console.error("insert_into_doc: provided content was invalid. aborting. content: ", content);
		return;
	}
	if(window.doc_selection == null){
		console.error("insert_into_doc: window.doc_selection is null. aborting.")
		return;
	}
	if(typeof window.doc_selection.from == 'number' && typeof window.doc_selection.to == 'number'){
		//console.log("insert_into_doc. inserting at window.doc_selection: ", window.doc_selection);
		editor.dispatch({
			changes: {from:window.doc_selection.from, to:window.doc_selection.to, insert: content}
		})
	}
	
}
*/




function scroll_to_selection(selection=null){
	//console.log("in scroll_to_selection.  selection: ", typeof selection, selection);
	
	let line = {'from':0,'to':0};
	
	if(typeof selection != 'undefined' && typeof selection == 'object' && selection != null && typeof selection.from == 'number' && typeof selection.to == 'number'){
		//console.log("scroll_to_selection:  selection was provided.  selection.from,selection.to:", selection.from, selection.to);
	    editor.dispatch({
	        selection: { head: selection.to , anchor: selection.from}, // line.to
	        //scrollIntoView: ,true
			effects: EditorView.scrollIntoView(selection.from, {y: 'center'}),
	    });
	}
	
	else if(selection == null && typeof files[current_file_name] != 'undefined' && typeof files[current_file_name]['selection'] != 'undefined' && typeof files[current_file_name]['selection'].from == 'number'){
		//console.log("scroll_to_selection: selection was null, attempting to grab selection from files dict: ", files[current_file_name]['selection']);
		line.from = files[current_file_name]['selection'].from;
		line.to = files[current_file_name]['selection'].to;
		
	    editor.dispatch({
	        selection: { head: line.to , anchor: line.from}, // line.to
	        //scrollIntoView: ,true
			effects: EditorView.scrollIntoView(line.from, {y: 'center'}),
	    });
	}
	/*
	else if(typeof selection == 'object' && selection != null && typeof selection.from == 'number' && typeof selection.to == 'number'){
		//console.log("scroll_to_selection:  setting line as selection object")
		line.from = selection.from;
		line.to = selection.to;
		
	    //const line = editor.state.doc.line(line_nr);
		//let scroll_options = { 'y': 'center'};
	    editor.dispatch({
	        selection: { head: line.to , anchor: line.from}, // line.to
	        //scrollIntoView: ,true
			effects: EditorView.scrollIntoView(line.from, {y: 'center'}),
	    });
	}
	*/
	else{
		console.error("scroll_to_selection: invalid input: ", typeof selection, selection);
	}
    
}


function scroll_to_line(line_nr){
	//console.log("in scroll_to_line.  line_nr: ", line_nr);
	
    const line = editor.state.doc.line(line_nr);
	if(line){
		//console.log("scroll_to_line: ", line);
		//let scroll_options = { 'y': 'center'};
	    editor.dispatch({
	        selection: { head: line.from , anchor: line.from}, // line.to
	        //scrollIntoView: ,true
			effects: EditorView.scrollIntoView(line.from, {y: 'center'}),
	    });
	}
	else{
		console.warn("scroll_to_line: invalid line to scroll to.  line_nr,line: ", line_nr, line);
	}
	
}
window.scroll_to_line = scroll_to_line;


function scroll_to_start(){
	//console.log("in scroll_to_start");
	if(typeof code == 'string'){
		//console.log("scroll_to_end: scrolling to: ", code.length);
		scroll_to_selection({'from':0,'to':0});
		return true
	}
	else{
		console.warn("scroll_to_end: code was not a string, it was: ", code);
	}
	return false
}

function scroll_to_end(){
	//console.log("in scroll_to_end");
	if(typeof code == 'string'){
		//console.log("scroll_to_end: scrolling to: ", code.length);
		scroll_to_selection({'from':code.length,'to':code.length});
		return true
	}
	else{
		console.warn("scroll_to_end: code was not a string, it was: ", code);
	}
	return false
}
window.scroll_to_end = scroll_to_end;


function scroll_to_next_line(){
	
	/*
view.dispatch({
  selection: {anchor: targetPosition},
  scrollIntoView: true
})
	*/
}
	
	




// Highlight a part of the document

function highlight_selection(cursor=null,split_on='\n'){
	if(typeof split_on != 'string'){
		split_on = '\n';
	}
	console.log("editor.js: in highlight_selection. cursor,split_on: ", cursor, split_on);
	if(cursor==null){
		console.error("highlight_selection: invalid cursor provided: ", cursor);
		return false
	}
	
	let split_threshold = 500;
	if(split_on == ' '){
		
		if(typeof cursor.from == 'number' && typeof cursor.to == 'number' && cursor.to - cursor.from < 300){
			split_threshold = 5;
			console.log("highlight_selection: split_on is a single space. Each word should get a separate highlight");
		}
		else{
			console.warn("very long selection, not highlighting it word for word");
			split_on = '\n';
			
			if(cursor.from == 0 && window.doc_text.length > 10 && cursor.to > window.doc_text.length - 10){
				console.error("highlight selection: almost highlighted entire document. Aborting.");
				return false
			}
		}
	}
	
	
	
	
	let already_highlighed_elements = document.querySelectorAll('.llm_work_selection');
	
	// TODO: is this still relevant? When the editor gets a selection a custom window.doc_selection is now created that should be in the correctt format already
	if(typeof cursor.value != 'undefined' && typeof cursor.value.from == 'number' && typeof cursor.value.to == 'number' && cursor.value.from < cursor.value.to){
		//console.log("highlight_selection: will highlight. cursor.value.from: ", cursor.value.from);
		cursor = cursor.value;	
	}
	
	if(typeof cursor.from == 'number' && typeof cursor.to == 'number' && cursor.from < cursor.to){
		console.log("highlight_selection: will highlight. cursor.from, cursor.to: ", cursor.from, cursor.to);
		
		if(cursor.to > cursor.from + split_threshold && (cursor.to - cursor.from < 2000)){
			console.log("highlight_selection: very long text, will be prettier to split this up into smaller selections");
			// very long span. It's nice to break it up
			
			let text_chunks = [];
			let source_text = null;
			if(typeof playground_live_backups[folder + '/' + current_file_name] == 'string' && playground_live_backups[folder + '/' + current_file_name].length >= cursor.to){
				source_text = playground_live_backups[folder + '/' + current_file_name];
			}
			else if(typeof playground_saved_files[folder + '/' + current_file_name] == 'string' && playground_saved_files[folder + '/' + current_file_name].length >= cursor.to){
				source_text = playground_saved_files[folder + '/' + current_file_name];
			}
			if(typeof source_text == 'string' && !source_text.startsWith('_PLAYGROUND_BINARY_') && cursor.to <= source_text.length){
				
				//source_text_parts = source_text.split('\n');  // sic, split_on comes later
				//let source_text_cursor = 0;
				let text_chunk = '';
				let c = cursor.from; // sic
				for(c = cursor.from; c <= cursor.to; c++){
					const char = source_text.charAt(c);
					if(char == split_on || c == source_text.length){
						if(text_chunk.length > 200 || c == source_text.length){
							//console.log("highlight_selection: adding selection for text_chunk: ", text_chunk);
							//cursor_list.push({'from':(c - text_chunk.length),'to':c});
							
							if(typeof already_highlighed_elements[text_chunks.length-1] != 'undefined'){
								//console.log("highlight_selection: there was a higlighted element. let's compare: ", already_highlighed_elements[text_chunks.length-1].textContent, text_chunk);
								if(already_highlighed_elements[text_chunks.length-1].textContent == text_chunk){
									//console.log("highlight_selection: MATCH! this text already has a highlight, no need to set it again");
								}
								else{
									//console.log("highlight_selection: no match with textContent of already_highlighted_element, so higlighting: ", c - text_chunk.length, c);
									editor.dispatch({
										effects: highlight_effect.of([highlight_decoration.range(c - text_chunk.length, c)])
									});
								}
							}
							else{
								//console.log("highlight_selection: no match with already_highlighed_elements, so higlighting: ", c - text_chunk.length, c);
								editor.dispatch({
									effects: highlight_effect.of([highlight_decoration.range(c - text_chunk.length, c)])
								});
							}
							text_chunks.push('' + text_chunk);
							text_chunk = '';
						}
					}
					else{
						text_chunk += char;
					}
					
				}
				if(text_chunk.length){
					//console.log("highlight_selection: adding final selection for text_chunk: ", text_chunk);
					//cursor_list.push({'from':(c - text_chunk.length),'to':c});
					editor.dispatch({
						effects: highlight_effect.of([highlight_decoration.range(c - text_chunk.length, c)])
					});
				}
				
			}
			else{
				console.error("the selection would be outside of the range of the source text.  cursor, source_text.length: ", cursor, source_text.length);
				
				//editor.dispatch({
				//	effects: highlight_effect.of([highlight_decoration.range(cursor.from, cursor.to)])
				//});
				
			}
		}
		else{
			//console.log("highlight_selection: short selection, so no need to split it up: ", cursor.from, cursor.to);
			editor.dispatch({
				effects: highlight_effect.of([highlight_decoration.range(cursor.from, cursor.to)])
			});
		}
		
		return true
	}
	else{
		console.warn("highlight_selection: invalid 'cursor' input (likely: to must be bigger than from): ", cursor);
		return false
	}
	
	
	
}
window.highlight_selection = highlight_selection;


function remove_highlight_selection(cursor=null){
	//console.log("in remove_highlight_selection. cursor: ", cursor);
	let a = 0;
	let b = 0;
	if(cursor==null){
		if(window.settings.docs.open != null){
			//console.log("remove_highlight_selection: no cursor provided, but there is an open document. Removing highlights from entire document. doc_text.length: ", window.doc_text.length);
			b = window.doc_text.length;
		    editor.dispatch({
		      effects: remove_highlight.of((from, to) => to <= a || from >= b)
		    })
			return true
		}
		else{
			//console.error("remove_highlight_selection: cursor was null, and document was not open, so falling through");
		}
		
	}
	else if(typeof cursor.from == 'number' && typeof cursor.to == 'number'){
		//console.log("remove_highlight_selection: removing between valid cursor: ", cursor);
		
	    editor.dispatch({
	      //effects: remove_highlight.of((from, to) => to <= a || from >= b)
			effects: remove_highlight.of((from, to) => to <= cursor.from || from >= cursor.to)
	    });
		return true
		/*
		editor.dispatch({
			effects: highlight_effect.of([])
		});
		*/
	}
	else{
		console.error("remove_highlight_selection: fell through. cursor: ", cursor);
	}
	return false
}
window.remove_highlight_selection = remove_highlight_selection;

/*
function remove_highlight(a, b) {
    view.dispatch({
      effects: remove_highlight.of((from, to) => to <= a || from >= b)
    })
}
*/



function doc_show_alternate_selection(selection=null){
	//console.log("in show_alternate_selection");
	try{
		if(selection != null && typeof selection.from != 'undefined' && typeof selection.to != 'undefined'){
			let selections = [];
			selections.push(EditorSelection.range(selection.from, selection.to));
		
			editor.dispatch({
			  selection: EditorSelection.create(selections)
			})
		
			/*
			if(window.doc_selection != null){
				selections.push(EditorSelection.range(window.doc_selection.from, window.doc_selection.to));
				editor.dispatch({
				  selection: EditorSelection.create(selections, 1)
				})
			}
			*/
		
		}
	}
	catch(e){
		console.error("doc_show_alternate_selection:  caught error: ", e);
	}
	
	
	/*
	editor.dispatch({
	  selection: EditorSelection.create([
	    EditorSelection.range(4, 5),
	    EditorSelection.range(6, 7),
	    EditorSelection.cursor(8)
	  ], 1)
	})
	
	
	view.value.dispatch({
    selection: EditorSelection.create([
        EditorSelection.range(startPos.from, endPos.to),
    ]),
    scrollIntoView: true,
});
	*/
}












//
//   EXECUTE JS CODE
//



let safe_code_template = `
//importScripts("./js/dayjs-with-plugins.min.js");
var window = {};
const location = undefined;
window.alert = function(){
    self.postMessage(JSON.stringify({'type':'alert','arguments':arguments}));
};
var alert = window.alert;
const setInterval = function(x,y) {console.warn('setInterval is not supported')}
const setTimeout = function(x,y) {console.warn('setTimeout is not supported')}

var console = {
  log: function(){
    self.postMessage(JSON.stringify({'type':'log','arguments':arguments}));
  },
  error: function(){
    self.postMessage(JSON.stringify({'type':'error','arguments':arguments}));
  },
  warn: function(){
      self.postMessage(JSON.stringify({'type':'warn','arguments':arguments}));
  }
};

self.addEventListener('message', function(e) {
    //try{
        //code_goes_here
    //} catch (e) {
    //    //console.error(e);
    //    console.error.apply(console, ["ERROR: "].concat(Array.prototype.slice.call(arguments)));
    //}
    
	self.postMessage(JSON.stringify({'type':'end_of_code','arguments':["Reached end of code"]}));
    
}, false);

`
let code_offset = 32;
let safe_code_lines = safe_code_template.split('\n');
for(let y = 0; y < safe_code_lines.length; y++){
    if(safe_code_lines[y].indexOf('//code_goes_here') != -1){
        code_offset = y;
		//console.log("worker code_offset lines: ", code_offset);
    }
}


let interval_counter = 0;

window.every_second = setInterval(() => {
    if(should_run){
        console.warn("interval: executing");
        executeCode();
    }
    else{
        //console.warn("not executing");
    }
},100);


window.supervisor = setInterval(() => {
    
    if(Date.now() > window.worker_start_time + 500 && window.worker != null){
        
        console.log("supervisor killed worker");
        window.worker.terminate();
        window.worker = null;
		if(codeOutput.innerHTML != ''){
			//add_to_output("Worker done / timed out");
			add_to_output({'type':'end_of_code','arguments':["Worker done / timed out"]});
			
		}
    }
    
},50);



// EXECUTE CODE

function executeCode(){
    //console.log("in executeCode. should_run: ", should_run);
    alert_counter = 0;
    document.getElementById('alert').style.display = 'none';
	
    /*
    if(should_run == false){
        console.error("executeCode(): should_run was already false");
        return
    }
    if(window.worker != null){
        console.warn("executeCode: worker was not null, it's still running. Aborting.");
        should_run = true;
        return
    }
    */
    
    if(window.worker != null){
        window.worker.terminate();
        window.worker = null;
        add_to_output("Worker terminated in order to start new worker");
    }
    
    
    should_run = false;
    output_message_count = 0;
    error_lines = [];
    
	// Lint CSS
	if(current_file_name.toLowerCase().endsWith('.css')){
		lint_css(code);
		return;
	}
	
	
	if( current_file_name.toLowerCase().endsWith('html') || code.substr(0,20).toLowerCase().indexOf('<!DOCTYPE html>') != -1 || code.substr(0,30).toLowerCase().indexOf('\n<html') != -1){
		//codeOutput.innerHTML = '<p>Seems to be a HTML file</p>';
		//codeOutput.classList.add('hidden');
		open_viewer('window','beta');
		return
	}
	
	else if(code.startsWith('<?php') || code.indexOf('\n<?php') != -1){
		//codeOutput.innerHTML = '<p>Seems to be a PHP file</p>';
		//codeOutput.classList.add('hidden');
		return
	}
	else{
		//codeOutput.classList.remove('hidden');
	}
	
	
	// Only JS beyond this point
	if(current_file_name != unsaved_file_name && !current_file_name.toLowerCase().endsWith('.js')){
		codeOutput.classList.add('hidden');
		codeOutput.innerHTML = '';
		clear_gutter_classes();
		return
	}
	
	
	
	
    if(code.trim() == '') {
        codeOutput.innerHTML = ''; // <h4 style="color: #ff5555">🤣 First write some code, then run it!</h4>
		clear_gutter_classes();
        return;
    }
    
    
    let wrapped_code = safe_code_template.replace('//code_goes_here',code);

    // prepare the string into an executable blob
     var bb = new Blob([wrapped_code], {
        type: 'text/javascript'
      });

      //console.log("creating worker from blob: ");
      // convert the blob into a pseudo URL
      var bbURL = URL.createObjectURL(bb);

      // Prepare the worker to run the code
      window.worker_start_time = Date.now();
      window.worker = new Worker(bbURL);
      

      let received_messages_counter = 0;
      // add a listener for messages from the Worker
      window.worker.addEventListener('message', function(e){
          //console.log("worker message: ", e);
          
          received_messages_counter++;
          if(received_messages_counter > output_message_limit){
              console.log("worker was spamming, killing it.");
              if(window.worker != null){
                  window.worker.terminate();
                  window.worker = null;
                  add_to_output("Worker was spamming, terminated after messages: ", output_message_limit);
              }
              else{
                  console.warn("unexpectedly worker is already terminated");
              }
              
              
          }
          add_to_output(JSON.parse(e.data));
          
      }); // .bind(this));


      // add a listener for errors from the Worker
      window.worker.addEventListener('error', function(e){
          console.error("\n\nworker error: ", e);
          
          /*
          console.log("worker returned error, killing it.");
          if(window.worker != null){
              window.worker.terminate();
              window.worker = null;
              add_to_output("Worker terminated");
          }
          else{
              add_to_output("Worker already terminated?");
          }
          */
          
          
          if(output_message_count > output_message_limit){
              console.log("output_message_count > output_message_limit: ", output_message_count, output_message_limit);
              return;
          }
          
          
		  //console.log("code_offset: ", code_offset);
          let error_line = e.lineno - code_offset;
		  //console.log("error_line: ", code_offset);
          
		  
		  
          function check_linter_messages(messages, lines_done, lines_and_part_done){
              if(messages.length){
                  
				  //console.log("linter messages: ", messages);
                  
                  for(let m = 0; m < messages.length; m++){
                      if(messages[m].fatal){
                          const linter_error_line = lines_done + messages[m].line;
                          //console.warn("linter_error_line:  ", lines_done , ' + ', messages[m].line, ' = ',linter_error_line);
                          if(error_lines.indexOf(linter_error_line) == -1 && linter_error_line <= all_lines_count){
                              error_lines.push(linter_error_line);
                              //console.error("linter:  linter_error_line, all_lines_count:", linter_error_line, all_lines_count,)
                              add_error_to_output([lines_done, lines_and_part_done], linter_error_line, 'LINTER: ' + messages[m].message);
                          }
                      }
                      else{
						  console.log("linter error was not fatal: ", lines_done, messages[m].line, messages[m].message);
                      }
                  
                  }
              }
          }
          
          
          let all_lines_count = code.split('\n').length;
          //console.log("linter: all_lines_count: ", all_lines_count);
          let lines_done = 0;
          let code_parts = code.split('\n}');
          let previous_part = '';
          let previous_part_length = 0;
          //console.warn("linter code_parts:", code_parts);
          for(let c = 0; c < code_parts.length; c++){
              let part = code_parts[c] + '\n';
              if(c < code_parts.length-1){
                  part += '}';
              }
              //console.error("\n\nL");
              //console.log("\n\n\nlinter: code part: ", {'code_part':part});
              
              // split(/[\r\n]+/)
              let part_lines = part.split('\n');
              let part_lines_length = part_lines.length - 1;
              //console.warn("\nLINTER PART\npart_lines.length: ", part_lines_length, '\npart_lines: ', part_lines,'\n\n\n');
              
              //const messages = 
			  if(window.js_linter){
	              check_linter_messages( window.js_linter.verify(part, linter_config, { filename: "foo.js" }) ,lines_done, lines_done + part_lines_length);
              
	              //console.log("now checking with previous part: ", previous_part + part);
	              //let two_part = previous_part + part;
	              //two_part_length = two_p
	              check_linter_messages( window.js_linter.verify(previous_part + part, linter_config, { filename: "foo.js" }) ,lines_done-previous_part_length, lines_done + part_lines_length);
              
			  }
			  else{
				  console.error("execute_code: window.js_linter was invalid");
			  }
              
              
              
              //console.log("linter: lines_done before: ", lines_done, ' +++ ', part_lines.length, ' ===');
              lines_done = lines_done + part_lines_length;
              
              //console.log("linter: lines_done after: ", lines_done);
              
              previous_part = part;
              previous_part_length = part_lines_length;
          }
          
          
          
          if(error_lines.indexOf(error_line) == -1){
              error_lines.push(error_line);
              var error_message = (e.message).toString();
              add_error_to_output(null,  error_line, error_message);
          }
        
      });

      
      

      // Put a timeout on the worker to automatically kill the worker
      /*
      setTimeout(function(){
        console.log("terminating worker");
        if(window.worker != null){
            window.worker.terminate();
            window.worker = null;
            add_to_output("Worker timed out");
        }
        else{
            add_to_output("Worker terminated before timeout");
        }
        
      }, 500);
      */
      
      
      try {
          const startTime = new Date();
          //console.log("editor.js: executeCode: At start, clearing codeOutput");
          codeOutput.innerHTML = '';
		  clear_gutter_classes();
		  
          // Finally, actually start the worker
          //console.log("starting worker");
          window.worker.postMessage('start');
          
      } catch (e) {
          console.error("Error starting worker: ", JSON.stringify(e.stack,null,2));
          
      }
      
}


function clear_gutter_classes(){
    let line_number_els = document.querySelectorAll('.cm-gutterElement');
    for(let x=0; x < line_number_els.length; x++){
        line_number_els[x].classList.remove('cm-error-line');
    }
}











//
//  DIFF
//



document.getElementById('quick-diff-button').onclick = (event) => {
    console.log("quick-diff-button clicked.  diffing, diff_el: ", diffing, diff_el);
    //let diff_display_el = document.getElementById('diff-display');
	if(diffing == false){
		diffing = true;
		document.body.classList.add('diffing');
		differ();
	}
	else{
		diffing = false;
		document.body.classList.remove('diffing');
		if(diff_el != null){
			diff_el.remove();
			diff_el = null;
		}
		
	}
	
}



function differ(){
	//console.log("in differ");
	diffing = true;
	
	if(diff_el == null){
		diff_el = document.createElement('pre');
		diff_el.classList.add('diff-display');
		diff_el.id = 'diff-display';
		let cm_scoller = document.querySelector('.cm-scroller');
		cm_scoller.appendChild(diff_el);
	}
	
	if(typeof files[current_file_name].loaded != 'undefined' && files[current_file_name].loaded == true && typeof playground_live_backups[folder + '/' + current_file_name] == 'string'){
		//console.log("differ: both variables seem to be available. Calling getr for: ", folder + '/' + current_file_name);
		
		getr(folder + '/' + current_file_name)
		.then(function(value) {
			
			//console.log("differ: ArrayBuffer.isView: ", ArrayBuffer.isView(value));
			//console.log("differ: zipped? ", files[current_file_name]);
			if(typeof files[current_file_name].compression != 'undefined' && files[current_file_name].compression == 'gzip'){
				//value = decompress(value)
				
				decompress(value,'gzip')
				.then(function(unzipped){
					//console.log("differ: unzipped the one: ", unzipped);
					really_differ(unzipped,playground_live_backups[folder + '/' + current_file_name]);
				})
				.catch(function(err){
					//console.log("differ: unzipping value failed: ", err);
				});
				
			}
			else if(typeof value == 'string'){
				really_differ(value,playground_live_backups[folder + '/' + current_file_name]);
			}
			else{
				console.error("diff: loaded/saved data from DB was not a string. It was: ", typeof value, value);
			}
			
		})
		.catch(function(e) {
			console.error("differ: caught getr error: ", e);
		});
		
	}
	else{
		flash_message("Please save the file first",1500,'warn');
	}
}


// This function does no input checking
function really_differ(one,other,target_element=null){
	//console.log("in really_differ.  typeof one, typeof other: ", typeof one, typeof other);
	//console.log("reallly differ:\n",one,'\n',other);
    let differ_list = [];
	let differ_dict = {};
	let color = '';
	
	let span = null;

	if(typeof JsDiff == 'undefined'){
		console.error("really_differ: aborting, JsDiff library has not loaded (yet)?");
		return
	}

	const diff = JsDiff.diffChars(one, other);
    fragment = document.createDocumentFragment();
	//console.log("diff: ", diff);
	diff.forEach((part) => {
		//console.log("diff part: ", part);

		// green for additions, red for deletions
		// grey for common parts
		const color = part.added ? 'green' :
	    part.removed ? 'red' : 'grey';
		span = document.createElement('span');
		//span.style.color = color;
		span.classList.add('diff-' + color);
		let sub_span = document.createElement('span');
		sub_span.appendChild(document.createTextNode(part.value));
		span.appendChild(sub_span);
		/*
		if(color == 'red'){

		}
		else{
			span.appendChild(document.createTextNode(part.value));
		}*/
		
		if(color != 'grey'){
			//console.log("differ:  fragment.textContent: ", fragment.textContent.length);
			//console.log("differ:  fragment.textContent: ", fragment.textContent, fragment.textContent.length,'\n',part.value,part.value.length);
			
			differ_dict[part.value] = fragment.textContent.split('\n').length;
			differ_list.push({'value':part.value,'anchor':fragment.textContent.length,'head':fragment.textContent.length + part.value.length})
		}
		
		fragment.appendChild(span);

	});
	
	//console.log('differ_list is now: ', differ_list);

	if(target_element){
		target_element.innerHTML = '';
		target_element.appendChild(fragment);
	}
	//diff_el.innerHTML = '';
	//diff_el.appendChild(fragment);
	
	/*
	if(differ_list.length == 1){
		flash_message(differ_list.length + " difference found", 1500, 'warn');
	}
	else if(differ_list.length > 1){
		flash_message(differ_list.length + " differences found", 1500, 'warn');
	}
	*/
	
	if(typeof current_file_name == 'string' && current_file_name.endsWith(".js")){
		update_function_list(differ_dict);
	}
	
	
}










//
//  CSS
//


const css_linter_config = {
  rules: {
    // https://github.com/stylelint/stylelint-config-recommended/blob/main/index.js
    'annotation-no-unknown': true,
    'at-rule-no-unknown': true,
    'block-no-empty': true,
    'color-no-invalid-hex': true,
    'comment-no-empty': true,
    'custom-property-no-missing-var-function': true,
    'declaration-block-no-duplicate-custom-properties': true,
    'declaration-block-no-duplicate-properties': [
      true,
      {
        ignore: ['consecutive-duplicates-with-different-values'],
      },
    ],
    'declaration-block-no-shorthand-property-overrides': true,
    'font-family-no-duplicate-names': true,
    'font-family-no-missing-generic-family-keyword': true,
    'function-calc-no-unspaced-operator': true,
    'function-linear-gradient-no-nonstandard-direction': true,
    'function-no-unknown': true,
    'keyframe-block-no-duplicate-selectors': true,
    'keyframe-declaration-no-important': true,
    'media-feature-name-no-unknown': true,
    'named-grid-areas-no-invalid': true,
    'no-descending-specificity': true,
    'no-duplicate-at-import-rules': true,
    'no-duplicate-selectors': true,
    'no-empty-source': true,
    'no-extra-semicolons': true,
    'no-invalid-double-slash-comments': true,
    'no-invalid-position-at-import-rule': true,
    'no-irregular-whitespace': true,
    'property-no-unknown': true,
    'selector-pseudo-class-no-unknown': true,
    'selector-pseudo-element-no-unknown': true,
    'selector-type-no-unknown': [
      true,
      {
        ignore: ['custom-elements'],
      },
    ],
    'string-no-newline': true,
    'unit-no-unknown': true,
  }
};

//const textarea = document.querySelector("textarea");
//const output = document.querySelector("output");
/*
let timer = null;
textarea.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(update, 500);
});
textarea.addEventListener("change", () => {
  if (timer === null) {
    return;
  }
  clearTimeout(timer);
  update();
});
textarea.value = DEFAULT_SOURCE;
*/
//update();

function lint_css(css_text) {
	//console.log("in lint_css. css_tex: ", css_text);
    //const code = textarea.value;
    //timer = null;
    stylelint.lint({
      config: {
        ...css_linter_config,
        //customSyntax: css_text.includes("{") ? null : "sugarss"
      },
      code,
      formatter: () => {}
    })
    .then(css_result => {
		//console.log("lint_css result: ", css_result);
        codeOutput.innerHTML = '';
		clear_gutter_classes();
  	  	let warnings = css_result.results[0].warnings;
  	  	for(var n = 0; n < warnings.length; n++) {
			if(warnings[n].text.indexOf('(no-descending-specificity)') == -1){
				add_error_to_output(null,warnings[n].line, warnings[n].severity + ': ' + warnings[n].text);
			}
  	  	}
        //output.classList.remove("error");
    })
    .catch(err => {
      //output.textContent = String(err);
      //output.classList.add("error");
      console.error("css_lint error: ", err);
    });
}



// https://github.com/beautify-web/js-beautify

/*
	defaults:

{
    "indent_size": 4,
    "indent_char": " ",
    "indent_with_tabs": false,
    "editorconfig": false,
    "eol": "\n",
    "end_with_newline": false,
    "indent_level": 0,
    "preserve_newlines": true,
    "max_preserve_newlines": 10,
    "space_in_paren": false,
    "space_in_empty_paren": false,
    "jslint_happy": false,
    "space_after_anon_function": false,
    "space_after_named_function": false,
    "brace_style": "collapse",
    "unindent_chained_methods": false,
    "break_chained_methods": false,
    "keep_array_indentation": false,
    "unescape_strings": false,
    "wrap_line_length": 0,
    "e4x": false,
    "comma_first": false,
    "operator_position": "before-newline",
    "indent_empty_lines": false,
    "templating": ["auto"]
}
	
*/

function beautify(){
	const options = { indent_size: 4, space_in_empty_paren: true }

	const dataObj = {completed: false,id: 1,title: "delectus aut autem",userId: 1,}

	const dataJson = JSON.stringify(dataObj)

	// console.log(beautify(data, { indent_size: 4, space_in_empty_paren: true }));
	if (current_file_name.toLowerCase().endsWith('.js') || current_file_name.toLowerCase().endsWith('.ts') || current_file_name.toLowerCase().endsWith('.json')){
		let beautiful_js = js_beautify(code, options);
		//console.log("beautiful_js: ", beautiful_js);
		editor_set_value(beautiful_js);
	}
	else if (current_file_name.toLowerCase().endsWith('.css')){
		let beautiful_css = css_beautify(code, options);
		//console.log("beautiful_css: ", beautiful_css);
		editor_set_value(beautiful_css);
	}
	else if (current_file_name.toLowerCase().endsWith('.html') || current_file_name.toLowerCase().endsWith('.xhtml')){
		let beautiful_html = html_beautify(code, options);
		//console.log("beautiful_css: ", beautiful_html);
		editor_set_value(beautiful_html);
	}
	else{
		console.error("cannot beautify this file type: ", current_file_name);
	}
	
	/* OUTPUT
	{
	  "completed": false,
	  "id": 1,
	  "title": "delectus aut autem",
	  "userId": 1,
	}
	*/
}










/*  TOGGLE MARKDOWN STYLES  */

function toggleBold() {
	//console.log("in toggleBold. Editor: ", editor);
    const { state, dispatch } = editor;
    const { selection } = state;
    const { from, to } = selection.main;
    const text = state.doc.sliceString(from, to);
	//console.log("toggleBold. selected text: ", text);

    const before = state.doc.sliceString(Math.max(0, from - 2), from);
    const after = state.doc.sliceString(to, Math.min(state.doc.length, to + 2));

    if (before === "**" && after === "**") {
        // Remove surrounding **
        const transaction = state.update({
            changes: [
                { from: from - 2, to: from, insert: "" },
                { from: to, to: to + 2, insert: "" }
            ],
            selection: { anchor: from - 2, head: to - 2 },
            scrollIntoView: true,
        });
        dispatch(transaction);
        editor.focus();
        return;
    }

    const isBold = text.startsWith("**") && text.endsWith("**");

    if (isBold) {
        // Remove bold
        const newText = text.slice(2, -2);
        const transaction = state.update({
            changes: { from, to, insert: newText },
            selection: { anchor: from, head: from + newText.length },
            scrollIntoView: true,
        });
        dispatch(transaction);
    } else {
        // Add bold
        const newText = `**${text}**`;
        const transaction = state.update({
            changes: { from, to, insert: newText },
            selection: { anchor: from + 2, head: from + 2 + text.length },
            scrollIntoView: true,
        });
        dispatch(transaction);
    }

    editor.focus();
}



function toggleItalic() {
	//console.log("in toggleItalic. Editor: ", editor);
    const { state, dispatch } = editor;
    const { selection } = state;
    const { from, to } = selection.main;
    const text = state.doc.sliceString(from, to);
	//console.log("toggleItalic. selected text: ", text);

    const before = state.doc.sliceString(Math.max(0, from - 2), from);
    const after = state.doc.sliceString(to, Math.min(state.doc.length, to + 2));

    if (before === "*" && after === "*") {
        // Remove surrounding **
        const transaction = state.update({
            changes: [
                { from: from - 2, to: from, insert: "" },
                { from: to, to: to + 2, insert: "" }
            ],
            selection: { anchor: from - 2, head: to - 2 },
            scrollIntoView: true,
        });
        dispatch(transaction);
        editor.focus();
        return;
    }

    const isItalic = text.startsWith("*") && text.endsWith("*");

    if (isItalic) {
        // Remove bold
        const newText = text.slice(2, -2);
        const transaction = state.update({
            changes: { from, to, insert: newText },
            selection: { anchor: from, head: from + newText.length },
            scrollIntoView: true,
        });
        dispatch(transaction);
    } else {
        // Add bold
        const newText = `*${text}*`;
        const transaction = state.update({
            changes: { from, to, insert: newText },
            selection: { anchor: from + 2, head: from + 2 + text.length },
            scrollIntoView: true,
        });
        dispatch(transaction);
    }

    editor.focus();
}




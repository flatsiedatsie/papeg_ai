window.beta_window = null;
window.context_menus = []; // holds file browser context menus
window.context_menus2 = []; // holds other context menus

window.recently_opened_playground_files = [];

let debugging = false;

const current_file_el = document.getElementById('current-file-name'); // also as 'current_file_name_el in chat init
//const current_folder_el = document.getElementById('current-folder'); // already done in chat init
const folder_back_button_el = document.getElementById('folder-back-button');
const new_file_button_el = document.getElementById('new-file-button');
const folder_select_el = document.getElementById('folder-select');
const file_manager_el = document.getElementById('file-manager');
const file_menu_el = document.querySelector('#file-manager .files');
const function_index_el = document.getElementById('function-index-list');
const flash_message_el = document.getElementById('flash-message');
//const line_bookmark_button_el = document.querySelector('#line-bookmark-button span'); // already done, and changed, in chat init
const draggable_dialog_content_el = document.getElementById('draggable-dialog-content');
const hamburger_el = document.getElementById('hamburger-container');
const file_tabs_container_el = document.getElementById('file-tabs-container');
const sidebar_tabs_el = document.getElementById('sidebar-tabs');
//const editor_el = document.getElementById("#editor"); // moved to chatty_init.js
const load_all_files_button_el = document.getElementById('load-all-files-button');

const upload_progress_container_el = document.getElementById('file-upload-progress-container'); // added for ai chat project


const overlay_content_el = document.getElementById('overlay-content');
const file_drag_overlay = document.getElementById('file-drag-overlay');
//const playground_overlay_el = document.getElementById('playground-overlay'); // moved to chatty_init.js
var draggableElements = document.querySelectorAll('[draggable="true"]');
var inBetweenElements = document.querySelectorAll('.in-between-draggable');
file_tabs_container_el.addEventListener('dragover', () => { file_tabs_container_el.classList.add('dragging-over')}, false);

const fileMenu = document.querySelector('.file-pane');
const codeEditor = document.querySelector('#editor');
const codeOutput = document.querySelector('#output');
const resizeHandle = document.querySelector('#resizer');
window.code_mirror_editor_el = null;


if(typeof window.settings == 'undefined'){ // for AI chat
	window.settings = {'docs':{'open':null}};
}

let playground_code_output_width = localStorage.getItem('_playground_code_output_width');
if(playground_code_output_width != null){
	//console.log("playground_code_output_width: ", playground_code_output_width, codeOutput, codeOutput.style.width);
	setTimeout(() => {
		codeOutput.style.width = playground_code_output_width + 'px';
	},100);
		
}


let password_hash = localStorage.getItem('playground_password_hash');
if(password_hash == null){password_hash = 'none'}


let diff_el = null;
let diffing = false;
let differ_list = {};

let just_started = false; // if true, then the sidebar will be open initially, but easy to close with one click on the code windows.
let modified = false;
let autoparse = false;
let allow_execute = false;
let should_run = false;
let keys_pressed = 0;
let alert_counter = 0; // for faux-popup
var pressTimer;
var settle_timer = 0;
let current_line_nr = null;
let current_selection = null;
let remembered_selection = null;
let remembered_line_nr = null;
let remembered_selection_filename = null;
let remembered_selection_folder = null;
let suggested_filename = '';
let a_file_is_open = false;

let clipboard_text_array = [];
let trash = [];

let beta_folder = 'playground/playbeta';

let unsaved_folder_name = '_playground_folder/';
let unsaved_file_name = '_playground_notepad.txt';
let previous_open_file_name = unsaved_file_name;
let current_file_name = unsaved_file_name; // current filename. empty string until given a name

//const empty_image_base64 = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkAQAAAABYmaj5AAAAGElEQVR4AWP4jwQ+0Jo3yhvljfJGeaM8AL7rCVwFt2PiAAAAAElFTkSuQmCC';
const empty_image_encoded = "%C2%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00d%00%00%00d%01%00%00%00%00X%C2%99%C2%A8%C3%B9%00%00%00%18IDATx%01c%C3%B8%C2%8F%04%3E%C3%90%C2%9A7%C3%8A%1B%C3%A5%C2%8D%C3%B2Fy%C2%A3%3C%00%C2%BE%C3%AB%09%5C%05%C2%B7c%C3%A2%00%00%00%00IEND%C2%AEB%60%C2%82"
const empty_image_base64 = 'wolQTkcKGgoAAAANSUhEUgAAAGQAAABkAQAAAABYwpnCqMO5AAAAGElEQVR4AWPDuMKPBD7DkMKaN8OKG8Olwo3DskZ5wqM8AMK+w6sJXAXCt2PDogAAAABJRU5Ewq5CYMKC';
const text_file_extensions = ['txt','js','ts','json','html','xhtml','css','yaml','ino','py','readme'];
const binary_image_extensions = ['png','jpg','jpeg','gif','webp','ico','bmp','tiff'];
const binary_video_extensions = ['mp4','h264','h265','mjpeg','webm','mov','ogv'];
const binary_audio_extensions = ['mp3','wav','flac','aac','m4a','ogg'];
const binary_media_extensions = binary_video_extensions.concat(binary_audio_extensions);  //['mp4','mp3','wav','h264','h265','mjpeg','flac','aac','webm','m4a','ogg'];
const archive_extensions = ['zip','gzip'];
const binary_document_extensions = ['pdf','epub']; // epub is zipped html
const uninformative_folder_names = []; //['js','css','img','images','assets','res','source','sources','resources','scripts','pjs','pcss']; // are not shown in file tabs
const color_keys = ['#warning','#error','#info','#ok','#note','#nowrap','#orange','#red','#grey','#green','#blue','#yellow','#purple']; //Object.keys(colors_lookup);
var color_added = 0;

const output_message_limit = 1000;
var output_message_count = 0;

var error_lines = []; // resets on each execute





let forbidden_file_names = [
	unsaved_folder_name,
	unsaved_file_name,
	'_last_opened',
	'_playground_files',
	//'playground_modified_files',
	//'playground_current_folder',
	'playground_folder_path',
	'playground_current_file_name',
	'playground_live_backups',
	'playground.php',
	'playground.js',
	'playground.css',
	'playground.html',
	'..',
	'.'
];


let serverless = true; // set to permanently true for the AI chat project
if(window.location.href.startsWith('file://')){
	serverless = true;
	document.body.classList.add('serverless');
}

let localhost = false;
if(window.location.href.indexOf('//localhost') != -1 || window.location.href.indexOf('//127.0.0.1') != -1){
	localhost = true;
}

if(window.location.href.indexOf('debug') != -1 || window.location.search.indexOf('debug') != -1){
	//console.log("window.location.search: ", window.location.search);
	document.body.classList.add('developer');
}










// trash
function reload_trash(){
	let loaded_trash = localStorage.getItem('_playground_trash');
	if(loaded_trash == null){
		loaded_trash = [];
	}
	else if(typeof loaded_trash == 'string'){
		loaded_trash = JSON.parse(loaded_trash);
	}else{
		console.error("trash from localstorage was unexpected type: ", typeof loaded_trash, loaded_trash);
		loaded_trash = [];
	}
	trash = loaded_trash;
}
reload_trash();


// projects
let projects = localStorage.getItem('_playground_projects');
if(projects == null){
	projects = {};
}
else if(typeof projects == 'string'){
	projects = JSON.parse(projects);
}else{
	console.error("projects from localstorage was unexpected type: ", typeof projects, projects);
	projects = {};
}

let current_project = localStorage.getItem('_playground_current_project');

//let current_beta_path = 'playground/playbeta/index.html';
let current_beta_path = localStorage.getItem('_playground_current_beta_path');



let folder_parts = localStorage.getItem('playground_folder_path');
//console.log("localStorage: playground_folder_path: ", folder_parts);
if(typeof folder_parts == 'string'){
	if(folder_parts.endsWith('/')){
		folder_parts = folder_parts.substr(0,folder_parts.length-1);
		//console.log("had to remove trailing slash from folder path string: ", folder_parts);
	}
	if(folder_parts == ''){
		folder_parts = [];
	}
	else{
		folder_parts = folder_parts.split('/');
	}
	
}
else{
	folder_parts = [unsaved_folder_name];
}

//console.error("initial folder_parts: ", folder_parts);
let folder = '';
folder_path();
//console.log("first.js: initial folder: ", folder);

let previous_code = '';
let code = '';


let sub_folders = {}; // TODO: could be moved into folder_meta, or a more general file/folder structure meta. But it doesn't matter.


let files = {};
let folder_meta = {};
//let playground_files = [];
let playground_saved_files = {};
let playground_live_backups = {};
//let playground_modified_files = {};
let playground_snapshot1 = {};
let playground_snapshot2 = {};
let playground_snapshot3 = {};



// Snapshots meta
let snapshots_meta = localStorage.getItem('_playground_snapshots_meta');
function reload_snapshots_meta(){
	//console.log("in reload_snapshots_meta");
	let snapshot_meta = localStorage.getItem('_playground_snapshots_meta');
	if(snapshot_meta == null){
		//console.log("snapshots_meta was null - no snapshots yet");
		document.body.classList.remove('snapshot');
		snapshots_meta = {};
	}
	else if(typeof snapshot_meta == 'string'){
		snapshot_meta = JSON.parse(snapshot_meta);
		snapshots_meta = snapshot_meta;
		//console.log("succesfully loaded snapshots_meta: ", snapshots_meta);
	}
	else{
		console.error("reload_snapshots_meta: snapshot_meta was unexpected type: ", typeof snapshot_meta, snapshot_meta);
	}
	
	if(folder != ''){
		if(typeof snapshots_meta[folder] != 'undefined'){
			document.body.classList.add('snapshot');
		}
		else{
			document.body.classList.remove('snapshot');
		}
	}
	else{
		document.body.classList.remove('snapshot');
	}
	
	return snapshots_meta;
}
reload_snapshots_meta();





// used when switching to a new folder
function clear_vars(){
	//console.log("in clear_vars()");
	previous_code = '';
	code = '';
	current_line_nr = null;
	folder = unsaved_folder_name;
	current_file_name = unsaved_file_name;
}


function reload_vars(){
	//console.log("in reload_vars");
	const files_before = JSON.stringify(files,null,2);
	const sub_folders_before = JSON.stringify(sub_folders,null,2);
	reload_folder_dict();
	reload_files_dict();
	if(JSON.stringify(files,null,2) != files_before || JSON.stringify(sub_folders,null,2) != sub_folders_before){
		console.warn("RELOAD VARS RESULTED IN DIFFERENT FILES OR FOLDER VALUES: \n\n-FILES BEFORE-\n\n", files_before, "\n\n-FILES AFTER-\n\n", JSON.stringify(files,null,2), "\n\n-SUB_FOLDERS BEFORE-\n\n", sub_folders_before,  "\n\n-SUB_FOLDERS AFTER-\n\n", JSON.stringify(sub_folders,null,2));
		//console.log('\n\n',JsDiff.diffChars(files_before, JSON.stringify(files,null,2))[0],'\n\n');
		//flash_message("reload_vars: files changed",1500,'warn');
		update_ui();
	}
	if(JSON.stringify(sub_folders,null,2) != sub_folders_before){
		console.warn("RELOAD VARS RESULTED IN DIFFERENT SUB_FOLDERS VALUES: \n\n", sub_folders_before, "\n\n\n", JSON.stringify(sub_folders,null,2));
		//console.log('\n\n',JsDiff.diffChars(sub_folders_before, JSON.stringify(sub_folders,null,2))[0],'\n\n');
		//flash_message("reload_vars: sub_folders changed",1500,'warn');
		update_ui();
	}
}


function reload_files_dict(){
	//console.log("in reload_files_dict. folder: ", folder);
	//console.log("reload_files_dict: files before: ", keyz(files).length, files);
	//console.log("reload_files_dict: files before: ", files);
	let gotten_files = get_files_dict();
	//console.log("reload_files_dict:  gotten_files: ",  JSON.stringify(gotten_files,null,4));
	localStorage.setItem(folder + '_playground_files', JSON.stringify(gotten_files));
	
	files = gotten_files;
	//console.log("reload_files_dict: files after: ", keyz(files).length, files);
	
	
	/*
	let new_files = localStorage.getItem(folder + '_playground_files');
    if(new_files != null && typeof new_files == 'string'){
		try{
			new_files = JSON.parse(new_files); //files.split(',');
			files = new_files;
		}
		catch(e){
			console.error("\n\n\n\nreload_files_dict: error loading files. Resetting files dict..", e);
			files = {};
			files[unsaved_file_name] = {};
			localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
		}
		//console.log("reload_files_dict: found (possibly outdated) files list in local storage: ", files);
	}
	else{
		console.warn("reload_files_dict: no files data or unexpected data type found: ", typeof new_files, new_files);
		files = {};
		files[unsaved_file_name] = {};
		localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
		//console.log("reload_files_dict: did not find files list in local storage. Setting to list with unsaved_file_name only: ", files);
	}
	//console.log("reload_files_dict: files after: ", files);
	*/
}



function get_files_dict(target_folder=null){
	//console.log("get_files_dict: folder: ", folder );
	if(target_folder==null){target_folder=folder}
	//console.log("get_files_dict: target_folder: ", target_folder );
	let new_files = localStorage.getItem(target_folder + '_playground_files');
    if(new_files != null && typeof new_files == 'string'){
		try{
			//console.log("get_files_dict: for from localStorage: ", new_files);
			new_files = JSON.parse(new_files); //files.split(',');
		}
		catch(e){
			console.error("\n\n\n\nreload_files_dict: error loading files. Resetting files dict..", e);
			new_files = {};
			//new_files[unsaved_file_name] = {};
			//localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
		}
		//console.log("reload_files_dict: found (possibly outdated) files list in local storage: ", files);
	}
	else{
		console.warn("reload_files_dict: no files data or unexpected data type found: ", typeof new_files, new_files);
		new_files = {};
		//new_files[unsaved_file_name] = {};
		localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
	}
	return new_files;
}



function reload_folder_dict(){
	//console.log("in reload_sub_folder_dict. folder: ", folder);
	
	let sub_folders_dict = localStorage.getItem(folder + '_playground_sub_folders');
	if(sub_folders_dict == null){
		sub_folders_dict = {};
		localStorage.setItem(folder + '_playground_sub_folders', JSON.stringify(sub_folders_dict));
	}
	else if(typeof sub_folders_dict == 'string'){
		sub_folders_dict = JSON.parse(sub_folders_dict);
		folder_list = keyz(sub_folders_dict);
	}
	else{
		console.error("reload_folder_dict: unexpected sub_folders_dict format");
		sub_folders_dict = {};
	}
	sub_folders = sub_folders_dict;
	//console.log("reload_folder_dict: sub_folders is now: ", sub_folders);
	
	get_folder_meta(null,'load');
}





// helper function to manage current file path
// sets 'playground_folder_path'
function folder_path(action='full',part=null){
	//console.log("in folder_path.  action,part: ", action, part);
	
	let likely_folder_parts = localStorage.getItem('playground_folder_path');
	if(likely_folder_parts == null){
		folder_parts = [''];
	}
	else{
		folder_parts = likely_folder_parts.split('/');
	}
	
	if(folder_parts.length > 0 && folder_parts[folder_parts.length-1] == unsaved_folder_name ){
		folder_parts = [''];
	}
	
	//console.log("folder_path.  gonna check actions. action: ", action);
	
	if(action=='last'){
		if(folder_parts.length){
			//console.log("folder_path:returning last part of folder path: ", folder_parts[folder_parts.length-1]);
			return folder_parts[folder_parts.length-1];
		}
		else{
			//console.log("folder_path:returning last part of folder path, which is empty string since path is at root");
			return '';
		}
		
	}
	else if(action=='add' && typeof part == 'string'){
		//console.log("folder_path.  adding: ", part);
		if(part == unsaved_folder_name){
			folder_parts = [''];
		}
		else{
			part = part.replace('/','');
			folder_parts.push(part);
		}
	}
	else if(action=='back'){
		folder_parts.pop();
		//return folder_parts;
	}
	else if(action=='parse' && typeof part == 'string'){
		//console.log("folder_path.  parsing: part: ", part);
		if(part.endsWith('/')){
			part = part.substr(0,part.length-1);
		}
		//console.log("folder_path.  parsing: cleaned part: ", part);
		folder_parts = part.split('/');
		//console.log("folder_path.  parts after parsing split: ", folder_parts);
	}
	
	//console.log("folder_path. actions done. folder_parts: ", folder_parts);
	
	let new_folder_path = folder_parts.join('/');
	//console.log("folder_path. new_folder_path:", new_folder_path);
	localStorage.setItem('playground_folder_path',new_folder_path);
	
	if(current_file_name != unsaved_file_name){
		window.location.hash = "#" + encodeURIComponent(new_folder_path + '/' + current_file_name);
	}
	else{
		window.location.hash = "#" + encodeURIComponent(new_folder_path);
	}
	//console.log("folder_path. set location hash.");
	/*
	if(action=='file_hash' && typeof part == 'string'){
		window.location.hash = "#" + encodeURIComponent(new_folder_path + '/' + current_file_name);
	}
	else{
		window.location.hash = "#" + encodeURIComponent(new_folder_path);
	}
	*/
	if(typeof new_folder_path == 'string'){
		folder = new_folder_path;
	}
	
	//console.log("folder_path:  new_folder_path: ", new_folder_path);
	if(action=='get'){
		return new_folder_path;
	}
	
	//console.log("folder_path.  reached end.  folder: ", folder);
	//return new_folder_path;
}

function save_folder_meta(attribute=null,value=null,target_folder=null){
	//console.log("in save_folder_meta:  attribute,value,target_folder:\n", attribute,'\n',value,'\n',target_folder);
	if(target_folder == null){
		target_folder = folder;
	}
	if(typeof target_folder == 'string'){
		let target_folder_dict = get_folder_meta(target_folder);
		if(typeof attribute == 'string'){
			if(value == null){
				delete target_folder_dict[attribute];
				//console.log("save_folder_meta: value was null, deleted attribute: ",attribute);
			}
			else{
				target_folder_dict[attribute] = value;
				//console.log("save_folder_meta: saved:  attribute,value: ",attribute, value);
			}
			//console.log("save_folder_meta: saving: ", target_folder, JSON.stringify(target_folder_dict,null,4));
			
			localStorage.setItem(target_folder + '_playground_folder_meta',JSON.stringify(target_folder_dict));
		}
		else{
			console.error("save_folder_meta: invalid input:  attribute,value: ",attribute, value);
		}
	}
	else{
		console.error("save_folder_meta: target_folder was not a string: ", typeof target_folder, target_folder);
	}
	
}

function get_folder_meta(target_folder=null,action='return'){
	if(target_folder == null){
		target_folder = folder;
	}
	//let new_folder_dict = {}
	let target_folder_dict = localStorage.getItem(target_folder + '_playground_folder_meta');
	//let target_folder_dict = localStorage.getItem('_playground_meta');
	
	if(target_folder_dict == null){
		target_folder_dict = {};
	}
	else if(typeof target_folder_dict == 'string'){
		target_folder_dict = JSON.parse(target_folder_dict);
	}
	else{
		console.error("unexpected type for folder meta dict");
		target_folder_dict = {};
	}
	if(action == 'load'){
		//if(typeof target_folder_dict[target_folder] != 'undefined'){}
		folder_meta = target_folder_dict;
	}
	return target_folder_dict;
}

// Load initial folder metadata
get_folder_meta(null,'load');


function save_file_meta(attribute,value,target_folder=null,target_file=null){
	//console.log("in save_file_meta.  \nattribute:", attribute,"\nvalue: ",value,"\ntarget_folder: ",target_folder,"\ntarget_file: ",target_file);
	if(target_folder == null){
		target_folder = folder;
	}
	if(target_file == null){
		target_file = current_file_name;
	}
	
	if(target_file == 'state_selection_main'){
		console.error("save_file_meta: caught 'state_selection_main' as filename");
		return false
	}
	
	//console.log("target_file: ", target_file);
	if(typeof target_file != 'string'){
		console.error("save_file_meta: error, target_file was not a string. Aborting.");
		return false
	}
	let target_files_dict = {};
	
	if(typeof target_folder == 'string'){
		target_files_dict = get_files_dict(target_folder);
		//console.log("save_file_meta: target_files_dict: ", target_files_dict);
	}
	else{
		console.error("save_file_meta: target_folder was not a string, it was: ", target_folder);
		return false
	}
	
	
	if(typeof target_files_dict == 'undefined'){
		console.error("whaawaw? save_file_meta: This should not happen. target_files_dict was undefined.  target_folder, target_file: ", target_folder, target_file);
		target_files_dict = {};
	} // should not happen, but just in case..
	/*
	if(typeof target_files_dict[target_file] == 'undefined'){
		console.error("whaawaw? save_file_meta: This should not happen. target_files_dict[target_file] was undefined.  target_file: ", target_file);
		target_files_dict[target_file] = {};
	} // should not happen, but just in case..
	*/
	/*
	let target_files_dict = localStorage.getItem(target_folder + '_playground_files');
	//console.log("save_file_meta: raw target_files_dict: ", typeof target_files_dict, target_files_dict);
	if(target_files_dict == null){
		console.warn("save_file_meta: there was no files data for that folder yet: ", target_folder);
		target_files_dict = {};
	}
	else if(typeof target_files_dict == 'string'){
		target_files_dict = JSON.parse(target_files_dict);
	}
	else{
		console.error("\n\n\nsave_file_meta:  data from localStorage was of unexpected type: ", typeof target_files_dict, target_files_dict );
	}
	*/
	//console.log("save_file_meta: target_files_dict: ", target_files_dict);
	
	if(typeof target_files_dict[target_file] == 'undefined'){
		console.warn("save_file_meta: there was no info for that file in target_files_dict yet: ", target_folder, target_file, files);
		target_files_dict[target_file] = {};
	}
	
	
	if(attribute ==	'state_selection_main'){
		if(typeof value.to == 'number' && typeof value.from == 'number'){
			//console.log("save_file_meta:  saving state_selection_main: target_file: ", target_file, 'from', value.from, 'to',value.to);
			target_files_dict[target_file]['state_selection_main'] = {'from':value.from,'to':value.to};
		}
		else{
			console.error("save file meta: state_selection_main did not have from and/or to cursor data: ", attribute, value);
		}
	}
	else{
		target_files_dict[target_file][attribute] = value;
	}
	
	//target_files_dict[target_file][attribute] = value;
	//console.log("save_file_meta: target_files_dict with new value: ",attribute,value,' -> ', target_files_dict);
	
	if(target_folder == folder){
		//console.log("save_file_meta: in currently open folder, saving target_files_dict as files");
		if(attribute !=	'state_selection_main'){
			//console.log("save_file_meta: updated files dict for currently open folder. ", target_folder, target_file, attribute, ' -> ', value);
		}
		
		files = target_files_dict;
	}
	else{
		console.warn("saving file meta for file in different folder.  target_folder,folder,target_file: ", target_folder,folder, target_file);
	}
	//console.log("save_file_meta: saving to localstorage: ", target_folder + '_playground_files', target_files_dict);
	localStorage.setItem(target_folder + '_playground_files', JSON.stringify(target_files_dict));
}














const blueprint_boilerplate = `// This is a 'blueprint' - a series of tasks that will be run in succession. They are the same commands that you can use as voice commands, just written down.
// This blueprint writes and then speaks a bedtime story.
// As you can see below, only when TWO empty lines are encountered in a row will the next line be interpreted as a command. So you can add lots of text to the blueprint as long as the paragraphs have only a single line between them.


Create a new document called bedtime story



Once upon a time, in a land far far away, there lived an evil wizard. His dark magic corrupted the lands, and the peasants and townsfolk found it ever harder to toil the land or trade with neighbouring cities.

However, that all changed when one day a young girl called Maya ventured into these forsaken lands. She


continue


play document



`;





const html5_boilerplate = `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta http-equiv="X-UA-Compatible" content="ie=edge">
		<title>HTML 5 Boilerplate</title>
		<link rel="stylesheet" href="style.css">
    </head>
    <body>
		<h1>Hello world</h1>
		<script src="main.js"></script>
    </body>
</html>
`;



const js_boilerplate = `// Javascript
console.log("Hello world");

let loop_counter = 3;
for(let i = 0; i < loop_counter; i++){
	//console.log("i: ", i);
}

console.warn("Done");

// Press the play button in the bottom right to test this javascript

`;


const css_boilerplate = `

*{
	padding: 0;
	margin: 0;
	background: none;
	color: inherit;
	border: none;
	appearance: none;
	outline: none;
	box-sizing:border-box;
}


:root {
  --main-bg-color: #151515;
  --highlight-bg: #151546;
  --selected-bg: #282c7b;
}


@font-face {
    font-family: 'Material Icons';
    font-style: normal;
    font-weight: 400;
    src: url(res/fonts/material_icons.woff2) format('woff2');
}

.material-icons {
    font-family: 'Material Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
}


/*  STYLED SCROLLBARS  */

#file-manager::-webkit-scrollbar-track,
.cm-scroller::-webkit-scrollbar-track,
#function-index-list::-webkit-scrollbar-track{
	background:#111;
}

#file-manager::-webkit-scrollbar-thumb,
.cm-scroller::-webkit-scrollbar-thumb,
#function-index-list::-webkit-scrollbar-thumb{
	background: #888; /* #226 */
}

#file-manager::-webkit-scrollbar-button,
.cm-scroller::-webkit-scrollbar-button,
#function-index-list::-webkit-scrollbar-button{
	background: #bbb;
}




.button{
	cursor:pointer;
}
.button > span{
	pointer-events:none;
}

.space-between{
	display:flex;
	justify-content:space-between;
}
.align-center{
	display:flex;
	align-items:center;
}

.hidden{
	display:none!important;
}

.success{
    background-color:green;
    color:white;
}
.warning{
    background-color:orange;
    color:white;
}
.fail{
    background-color:red;
    color:white;
}





/*  quick message at top of window */

#message {
    text-align: center;
    position:fixed;
    top:0;
    right:2rem;
    width:calc(100% - 2rem);
	overflow-y: hidden;
	max-height: 4rem;
    box-sizing:border-box;
    display:flex;
    justify-content:center;
    align-items:center;
    padding:.2rem 1rem;
    height:2rem;
    z-index:1005;
    color:white;
}
#message:empty{
    padding:0;
    box-shadow:none;
    height:0;
	max-height: 0;
}
.body:not(.loading) #message{
	transition-property: all;
	transition-duration: .2s;
	transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
}






/*   ANIMATION   */

.move-to-left{
	animation: slideIn .2s ease-out ; /* forwards .2s;*/
}
.move-to-right{
	animation: slideIn .2s ease-out reverse; /* forwards .2s;*/
}

@keyframes slideIn {
    0% {
        transform: translateX(20rem);
    }
    100% {
        transform: translateX(0px);
    }
}

@keyframes slideUp {
    0% {
        transform: translateY(300px);
    }
    100% {
        transform: translateY(0px);
    }
}

@keyframes expand {
    0% {
        transform: translateX(1400px);
    }
    100% {
        transform: translateX(0px);
    }
}






@media only screen and (min-width: 801px) {
    
}

`;

let snippets = {'HTML5 Boilerplate':html5_boilerplate,'CSS Boilerplate':css_boilerplate};

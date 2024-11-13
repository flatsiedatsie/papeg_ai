// makeid is in index.html


//const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June','July', 'August', 'September', 'October', 'November', 'December'];
const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
function get_date(){
	var today = new Date();
	var dd = String(today.getDate()); //.padStart(2, '0');
	//var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var mm = String(monthNames[today.getMonth()]);// + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();

	return dd + ' ' + mm + ' ' + yyyy + ' - ' + String(today.toLocaleTimeString());
}



// human readable time when a file was last opened
function getFormattedDate(date, prefomattedDate = false, hideYear = false) {
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  let minutes = date.getMinutes();

  if (minutes < 10) {
    // Adding leading zero to minutes
    minutes = `0${ minutes }`;
  }

  if (prefomattedDate) {
    // Today at 10:20
    // Yesterday at 10:20
    return `${ prefomattedDate } at ${ hours }:${ minutes }`;
  }

  if (hideYear) {
    // 10. January at 10:20
    return `${ day }. ${ month } at ${ hours }:${ minutes }`;
  }

  // 10. January 2017. at 10:20
  return `${ day }. ${ month } ${ year }. at ${ hours }:${ minutes }`;
}


// --- Main function
function timeAgo(dateParam,now_stamp) {
  if (!dateParam) {
    return null;
  }

  const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
  const DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
  const today = new Date(now_stamp);
  const yesterday = new Date(today - DAY_IN_MS);
  const seconds = Math.round((today - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const isToday = today.toDateString() === date.toDateString();
  const isYesterday = yesterday.toDateString() === date.toDateString();
  const isThisYear = today.getFullYear() === date.getFullYear();


  if (seconds < 5) {
    return 'now';
  } else if (seconds < 60) {
    return `${ seconds } seconds ago`;
  } else if (seconds < 90) {
    return 'about a minute ago';
  } else if (minutes < 60) {
    return `${ minutes } minutes ago`;
  } else if (isToday) {
    return getFormattedDate(date, 'Today'); // Today at 10:20
  } else if (isYesterday) {
    return getFormattedDate(date, 'Yesterday'); // Yesterday at 10:20
  } else if (isThisYear) {
    return getFormattedDate(date, false, true); // 10. January at 10:20
  }

  return getFormattedDate(date); // 10. January 2017. at 10:20
}


let last_time_message_flashed = 0;
let last_message_flashed = null;

// Flash quick message at top of screen
function flash_message(message,duration=2500,color='green'){
	//console.log("in flash_message. message: ", message);
	
	if(Date.now() < last_time_message_flashed + (duration * 4)){
		if(message == last_message_flashed){
			console.error("flash_message: not showing the same message again so soon");
			return
		}
	}
	
    if(color=='info'){
        color = '#888';
    }
    if(color=='success'){
        color = 'green';
    }
    if(color=='warn' || color=='warning'){
        color = 'orange';
    }
    if(color=='fail' || color=='stop' || color=='error'){
        color = 'red';
    }
    flash_message_el.style.background = color;
    flash_message_el.innerText = message;
    setTimeout(() => {
        if(Date.now() > flash_message_end_time){
            flash_message_el.innerText = "";
        }
    },duration);
    flash_message_end_time = Date.now() + (duration-10);
	last_time_message_flashed = Date.now();
	last_message_flashed = message;
}
window.flash_message = flash_message;







function open_viewer(type='window',intensity='beta'){
	//console.log("window.location.pathname: ", window.location.pathname);
	var base_url = window.location.protocol + "//" + window.location.host + window.location.pathname;  //+ window.location.search
	let target_filename = current_file_name;
	
	// Switch to an available index.html or index.php file if it's available.
	if( ! (target_filename.toLowerCase().endsWith('.html') || target_filename.toLowerCase().endsWith('.php')) ){
		if( keyz(files).includes('index.html') ){
			target_filename = 'index.html';
		}
		else if( keyz(files).includes('index.php') ){
			target_filename = 'index.php';
		}
	}
	
	//console.log("open_viewer: base_url: ", base_url);
	if(base_url.indexOf('/playground') != -1){
		base_url = base_url.substr(0,base_url.indexOf('/playground')+1 );
	}
	
	//console.log("open_viewer: base_url: ", base_url);
	if(!base_url.endsWith('/')){
		base_url += '/';
	}
	
	//console.log("open_viewer: base_url: ", base_url);
	let target_folder = folder;
	if(target_folder.startsWith('/')){
		target_folder = target_folder.substr(1);
	}
	
	if(intensity == 'beta'){
		base_url = base_url + 'playground/playbeta/';
	}
	
	
	//var target_file_url = base_url + encodeURIComponent(target_folder) + '/' + encodeURIComponent(target_filename);
	
	var target_file_url = target_folder + '/' + target_filename;
	
	let target_parts = target_file_url.split('/');
	for(var n = 0; n < target_parts.length; n++) {
		target_parts[n] = encodeURIComponent(target_parts[n]);
	}
	target_file_url = target_parts.join('/');
	
	target_file_url = base_url + target_file_url;
	//console.log("open_viewer: encoded target_file_url: ", target_file_url);
	
	//viewer_url = base_url + '/playground/viewer.html?' + encodeURIComponent(target_file_url);
	//https://localhostje.dd/playground/
	
	if(folder != unsaved_folder_name){
		if(type == 'window'){
			
			if(intensity == 'beta'){
				save_beta()
				.then((values) => {
					//console.log("save_beta returned values: ", values);
					window.beta_window = window.open(target_file_url, 'demonstration');
				})
				.catch((err) => {
					console.error("err: ", err);
				})
			}
			else{
				window.beta_window = window.open(target_file_url, 'demonstration');
			}
			
		}else{
			// iframe
			window.open('viewer.html?' + target_file_url, '_blank');
		}
		current_beta_path = target_file_url;
		localStorage.setItem('_playground_current_beta_path', target_file_url);
	}
}



function reset(){
	console.error("RESET");
	
	localStorage.clear();
	
	ldb.clear(function() {
		//console.log('ldb storage cleared');
		window.location.reload(true); 
	});
	
	window.indexedDB.webkitGetDatabaseNames().onsuccess = function(sender,args)
	{
	    var r = sender.target.result;
	    for(var i in r)
			//console.log("deleting indexedDB: ", r[i]);
	        indexedDB.deleteDatabase(r[i]);
	}; 
	
}


function case_insensitive_sort(input){
	if(typeof input == 'object' && Array.isArray(input)){
		return input.sort(function (a, b) {
		    return a.toLowerCase().localeCompare(b.toLowerCase());
		});
	}
	console.error("case_insensitive_sort: invalid input: ", typeof input, input);
	return ['sorting error'];
}





//
//   CLIPBOARD
//


function copy_to_clipboard(text,hint=null){
    console.log("in copy_to_clipboard. text: ", text);
    if(typeof text != 'string'){return}
    if(hint == null){
		hint = '';
	    if(text.length < 20){
	        hint = '"' + text + '" ';
	    }
    }
	else if(typeof hint == 'string'){
		hint = ' ' + hint;
	}
	else{
		hint = '';
	}
    if(text.trim().length > 0){
        try{
            navigator.clipboard.writeText(text.trim()).then(() => {
              console.log('text copied to clipboard: ', text);
              flash_message("Copied " + hint + " to clipboard", 1000);
			  
			  save_to_clipboard_history(text);
			  
            },() => {
              console.error('Failed to copy text to clipboard');
            });
        }
        catch(e){
            console.error("failed to write to clipboard");
        }
    }
}


function save_to_clipboard_history(content=null){
	//console.log("in save_to_clipboard_history. content: ", content);
	
	let stored_clipboard = localStorage.getItem('_playground_clipboard_text_array');
	if(stored_clipboard != null){
		clipboard_text_array = JSON.parse(stored_clipboard);
	}
	
	if(clipboard_text_array.length > 6){
		clipboard_text_array = clipboard_text_array.slice(0,5);
	}
	
	if(typeof content == 'string'){
		_add_to_clipboard_text_array(content);
	}
	else{
	  	navigator.clipboard.readText()
	    .then((clipText) => {
			_add_to_clipboard_text_array(clipText);
	    });
	}
  	
	function _add_to_clipboard_text_array(clipText){
		if(typeof clipText == 'string' && clipText.length > 0){
			
			//console.log("save_to_clipboard_history:  adding: ", clipText, clipboard_text_array);
			let index = clipboard_text_array.indexOf(clipText);
			//console.log("index: ", index);
	    	if(index > -1){
				//console.log("should remove old value from clipboard array first");
	    		clipboard_text_array.slice(index,1);
	    	}
			
			index = clipboard_text_array.indexOf(clipText);
			//console.log("index again: ", index);
	    	if(index > -1){
				//console.log("strange, should again remove old value from clipboard array first");
	    		clipboard_text_array.slice(index,1);
	    	}
			
		
			clipboard_text_array = clipboard_text_array.filter(value => value !== clipText);
			//console.log("filtered: ", clipboard_text_array);
			
			clipboard_text_array.push(clipText);
			//console.log("save_to_clipboard_history: clipboard_text_array is now: ", clipboard_text_array);
			localStorage.setItem('_playground_clipboard_text_array',JSON.stringify(clipboard_text_array));
		}
		
	}
	
}










let used_space = 0;
let total_space = 5000;
const disk_space_total_el = document.getElementById('disk-space-total');
const disk_space_used_el = document.getElementById('disk-space-used');
const disk_space_progress_bar_el = document.getElementById('disk-space-progress-bar');

let used_db_space = 5000;
let total_db_space = 5000;
const db_space_total_el = document.getElementById('db-space-total');
const db_space_used_el = document.getElementById('db-space-used');
const db_space_progress_bar_el = document.getElementById('db-space-progress-bar');


function get_free_space(){
	//console.log("in get_free_space()");
	if (localStorage) { // && !localStorage.getItem('playground_free_space')
	    var i = 0;
	    try {
	        // Test up to 10 MB
	        for (i = 250; i <= 10000; i += 250) {
				//console.log(i);
	            localStorage.setItem('playground_free_space', new Array((i * 1024) + 1).join('a'));
	        }
	    } catch (e) {
	        localStorage.removeItem('playground_free_space');
	        localStorage.setItem('playground_free_space', i - 250);
			used_space = total_space - (i - 250);
			
			disk_space_progress_bar_el.style.width = Math.round( (total_space/used_space) * 100 ) + '%';
			//console.error("get_free_space: ", i - 250, 'Kb of space available');
			
			if(!localStorage.getItem('playground_total_space')){
				total_space = i - 250;
				localStorage.setItem('playground_total_space', i - 250);
			}
			else{
				total_space = parseInt(localStorage.getItem('playground_total_space'));
			}
			//console.log("get_free_space: total_space: ", total_space);
			
			disk_space_used_el.innerText = used_space + ' / ';
			disk_space_total_el.innerText = total_space + 'Kb';
			
	    }
	}
	
	try{
		navigator.storage.estimate()
		.then(function(estimate){
			//console.log("storage size estimate: ", estimate);
			total_db_space = estimate.quota;
			used_db_space = estimate.usage
			
			db_space_used_el.innerText = Math.round(used_db_space / (1024*1024)) + ' / ';
			db_space_total_el.innerText = Math.round(total_db_space / (1024*1024)) + 'Mb';
			db_space_progress_bar_el.style.width = Math.round( (used_db_space/total_db_space) * 100 ) + '%';
			
		})
		.catch(function(err){
			console.error("error getting storage estimate: ", err);
		})
		//console.log("navigator.storage.estimate(): ", navigator.storage.estimate());
	}
	catch(e){
		console.error("navigator.storage.estimate failed. no db support?", e);
	}
	
}




//
//  SMALL HELPER FUNCTIONS
//

// https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
function get_hash(s) {
  return [...s].reduce(
    (hash, c) => (Math.imul(31, hash) + c.charCodeAt(0)) | 0, // extraneous ( )
    0
  );
}



function make_date_string(){
	 let date_string = new Date().toLocaleString(undefined, {
	    month: "short", day: "numeric", 
	    hour: "numeric", minute: "numeric", second: "numeric"
	});
	date_string = date_string.replaceAll(',','');
	date_string = date_string.replace(':','h');
	date_string = date_string.replace(':','m');
	date_string = date_string.replaceAll('/','-');
	date_string = date_string.replaceAll('\\','-');
	return date_string
}



function clear_output(){
	//console.log("utils.js: in clear_output");
	codeOutput.innerHTML = '';
}


function valid_new_name(value, allow_existing_name=false){
	let is_valid = true;
	if( value == '' ){return false}
	//console.log("valid_new_name: not empty string, so still valid 1");
	
	if(allow_existing_name == false){
		if( keyz(files).includes(value) ){
			console.error("valid_new_name: that name is already used: ", value);
			is_valid = false
		}
		if(is_valid){
			//console.log("valid_new_name: not an existing file name, so still valid 2");
		};
	}
	
	
	if(is_valid && keyz(sub_folders).includes(value) ){
		console.error("valid_new_name: that folder name is already used: ", value);
		is_valid = false
	}
	if(is_valid){
		//console.log("valid_new_name: not a sub folder name, so still valid 3");
	}
	
	//if(is_valid && ! /^[^\\\\\/\?\%\*\:\|\"<>]+$/.test(value) ){is_valid = false}
	if(is_valid && ! /^[^\\\\\/\?\%\*\:\|\"<>]+$/.test(value) ){
		console.error("valid_new_name: invalid characters in name: ", value);
		is_valid = false
	}
	if(is_valid){
		//console.log("valid_new_name: no forbidden characters, so still valid 4");
	}
	
	if( serverless == false && forbidden_file_names.includes(value) ){
		console.warn("filename was in list of forbidden file names.  value,forbidden_file_names: ", value, forbidden_file_names);
		is_valid = false
	}
	if(is_valid){
		//console.log("valid_new_name: not a forbidden filename, so still valid 5");
	}
	//console.log("valid_new_name: is valid?:", is_valid);
	
	if(!is_valid){
		console.warn("invalid filename: ", value);
		/*
		let invalid_filename_message = 'Invalid file name';
		if(get_translation){
			invalid_filename_message = get_translation('Invalid_file_name')
		}
		*/
		if(get_translation){
			flash_message(get_translation('Invalid_filename'),3000,'fail');
		}
		
	}
	else{
		console.warn("OK, valid filename: ", value);
	}
	
	return is_valid;
}

function sanitize_filename(filename){
	if(typeof filename == 'string'){
		filename = filename.replaceAll(',',' ');
		filename = filename.replaceAll(':',' ');
		filename = filename.replaceAll('"','');
		filename = filename.replaceAll("'","");
		filename = filename.replaceAll('?','');
		filename = filename.replaceAll('!','');
		filename = filename.replaceAll('|','');
		filename = filename.replaceAll('/','__');
		filename = filename.replaceAll('  ',' ');
	}
	
	return filename;
}
window.sanitize_filename = sanitize_filename;



function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}


function html_to_string(input) {
    input = input.replace(/&/g, '&amp;');
    input = input.replace(/</g, '&lt;');
    input = input.replace(/>/g, '&gt;');
    return input;
}


// This function relied on a JS library, but modern browsers support this natively.
//function sha512(str) {
//    return CryptoJS.SHA512(str).toString(CryptoJS.enc.Hex);
//}

async function sha512(message) {
  const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}




//
//  ZIP
//

function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

function compress(string, encoding) {
  const byteArray = new TextEncoder().encode(string);
  const cs = new CompressionStream(encoding);
  const writer = cs.writable.getWriter();
  writer.write(byteArray);
  writer.close();
  return new Response(cs.readable).arrayBuffer();
}

function decompress(byteArray, encoding) {
  const cs = new DecompressionStream(encoding);
  const writer = cs.writable.getWriter();
  writer.write(byteArray);
  writer.close();
  return new Response(cs.readable).arrayBuffer().then(function (arrayBuffer) {
    return new TextDecoder().decode(arrayBuffer);
  });
}






//
//  DEBUG
//

function debug(){
	debugging = true;
	console.warn("\n\n\n\nDEBUG\n\n");
	//console.log("a_file_is_open: ", a_file_is_open);
	//console.log("folder: ", folder);
	//console.log("folder_parts: ", folder_parts);
	//console.log("current_file_name: ", current_file_name);
	//console.log("files: ", files);
	//console.log("sub_folders: ", sub_folders);
	//console.log(" ");
	//console.log("current_project: ", current_project);
	//console.log("projects: ", projects);
	//console.log("playground_live_backups: ", playground_live_backups);
	//console.log("playground_saved_files: ", playground_saved_files);
	//console.log("trash: ", trash);
	//console.log("modified", playground_modified_files);
	//console.log(" ");
	//console.log("current_line_nr: ", current_line_nr);
	//console.log("current_selection: ", current_selection);
	//console.log(" ");
	//console.log("window.context_menus: ", window.context_menus);
	//console.log("playground_snapshot1: ", playground_snapshot1);
	//console.log("playground_snapshot2: ", playground_snapshot2);
	//console.log("playground_snapshot3: ", playground_snapshot3);
	
	//get_editor_state();
	
	//console.log("testing compression");
	//testCompression(code, 'gzip');
	
}

function debug2(){
	return
	codeOutput.innerHTML = '';
	add_to_output("folder: " + folder);
	add_to_output("current_file_name: " + current_file_name);
	add_to_output("files: " + JSON.stringify(files,null,2));
	//add_to_output("modified: ", JSON.stringify(playground_modified_files,null,2));
}


function debug_popup(){
	//console.log("in debug_popup");
	if(debugging == false){
		return;
	}
	let debug_dict = {
		'folder': folder,
		//'folder_parts': folder_parts,
		"current_file_name": current_file_name,
		"file": files[current_file_name],
		'folder_meta':folder_meta,
		'current_project':current_project,
		'project':projects[current_project]
	}
	
	debug_dict['playground_live_backups'] = typeof playground_live_backups[folder + '/' + current_file_name];
	if(typeof playground_live_backups[folder + '/' + current_file_name] == 'string'){
		debug_dict['value'] = playground_live_backups[folder + '/' + current_file_name].substr(0,20) + '...';
	}
	debug_dict['playground_saved_files'] = typeof playground_saved_files[folder + '/' + current_file_name];
	
	function_index_el.innerHTML = '<pre>' + JSON.stringify(debug_dict,null,2) + '</pre>';
}



function inspect(){
	overlay_content_el.innerHTML = '';
	
	let storage_keys = [];
	let special_keys = [];
	
	for (var i = 0; i < localStorage.length; i++){
		if(!special_keys.includes(localStorage.key(i))){
			storage_keys.push(localStorage.key(i));
		}
	}
	storage_keys = case_insensitive_sort(storage_keys);
	
	for (var i = 0; i < special_keys.length; i++){
		let local_el = document.createElement('div');
		local_el.innerHTML = '<h2>' + special_keys[i] + '</h2><textarea readonly>' + localStorage.getItem(special_keys[i]) + '</textarea>';
		overlay_content_el.appendChild(local_el);
	}
	
	let hr_el = document.createElement('hr');
	overlay_content_el.appendChild(hr_el);
	
	for (var i = 0; i < localStorage.length; i++){
		let local_el = document.createElement('div');
		local_el.innerHTML = '<h3>' + storage_keys[i] + '</h3><textarea readonly>' + localStorage.getItem(storage_keys[i]) + '</textarea>';
		overlay_content_el.appendChild(local_el);
	}
	
	ldb.getAll(function(entries) {
		//console.log('All LDB entries: ', entries);
		for (const [key, value] of Object.entries(entries)) {
			//console.log("LDB entry: typeof value, isArray: ", typeof value, Array.isArray(value));
			let local_el = document.createElement('div');
			local_el.classList.add('indb');
			if(typeof value == 'string' || typeof value == 'number'){
				//local_el.innerHTML = '<h3>' + key + '</h3><textarea readonly>' + localStorage.getItem(storage_keys[i]) + '</textarea>';
			}
			else if(typeof value == 'object' && typeof value.k == 'string'){
				if(typeof value.v == 'string' || typeof value.v == 'number'){
					local_el.innerHTML = '<h3>' + value.k + '</h3><textarea readonly>' + value.v + '</textarea>';
				}
				else{
					local_el.innerHTML = '<h3>' + value.k + '</h3><textarea readonly>' + 'NOT A STRING OR NUMBER' + '</textarea>';
				}
			}
			else{
				local_el.innerHTML = '<h3>' + key + '</h3><textarea readonly>' + 'NOT A STRING OR NUMBER' + '</textarea>';
			}
			
			overlay_content_el.appendChild(local_el);
		}
	});
	
	document.body.classList.add('overlay');
}




//
//  BACKUP
//

function download_as_json(data){
	//console.log("in download_as_json");
    let json_data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data,null,2));
	//json_data = json_data.replace(/\\n/g,"\n");
	//console.log("json_data before downloading: ", json_data, JSON.stringify(data,null,2))
	//let json_data = "data:text/json;charset=utf-8," + JSON.stringify(data,null,2);
    let link = window.document.createElement('a');
    link.setAttribute("href", json_data);
    link.setAttribute("download", 'playground_backup_(' + get_date() + ').json');
    
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
}


// yet another way to download variables as text files
const saveTemplateAsFile = (filename, dataObjToWrite) => {
    const blob = new Blob([JSON.stringify(dataObjToWrite,null,2)], { type: "text/json" });
    const link = document.createElement("a");

    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

    const evt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
    });

    link.dispatchEvent(evt);
    link.remove()
};

/*
document.getElementById('backup-all-button').onclick = () => {
	backup_all()
	.then((everything) => {
		//console.log("\n\n\nBACKUP DATA:  everything: ", everything);
		//saveTemplateAsFile("filename.json", take_snapshot(true));
		download_as_json(everything);
	})
	.catch((err) => {
		console.error("\n\n\nBACKUP DATA FAILED: ", err);
	})
}
*/

function backup_all(){
	let everything = {};
	let promises = [];
	
	return new Promise(function(resolve) {
		
		for (var i = 0; i < localStorage.length; i++){
			everything[ localStorage.key(i) ] = localStorage.getItem( localStorage.key(i) )
		}
		//console.log("backup_all: everything from localStorage: ", everything);
		
		ldb.getAll(function(entries) {
			//console.log('backup_all: All LDB entries: ', entries);
			for (var h = 0; h < entries.length; h++){
				if(!entries[h].k.startsWith('_playground_snapshot')){ // don't save snapshots of snapshots
					everything[ entries[h].k ] = entries[h].v;
				}
			}
			
			//console.log("backup_all: everything final: ", everything);
			if(playground_snapshot2 != null){
				playground_snapshot3 = playground_snapshot2;
			}
			if(playground_snapshot1 != null){
				playground_snapshot2 = playground_snapshot1;
			}
			playground_snapshot1 = everything;
		
			let everything_as_string = JSON.stringify(everything);
		
			if(total_db_space - used_db_space > (everything_as_string.length * 3) ){
				
				compress(everything_as_string,'gzip')
				.then((zipped) => {
					//console.log("zipped snapshot1: ", zipped);
					
					savr('_playground_snapshot1',zipped)
					.then((value) => {
						//console.log("Saved compressed backup in browser storage");
						flash_message("Saved compressed backup in browser storage");
						
						resolve(everything);
						return everything;
					})
					.catch((err) => {
						flash_message("Saving compressed snapshot in browser failed", 3000,'fail');
						console.error("saving compressed snapshot failed: ", err);
						reject(null);
					})
					
				})
				.catch((err) => {
					flash_message("compressed backup failed", 3000,'fail');
					console.error("compressing snapshot failed: ", err);
					reject(null);
				})
				
				
			}
			else{
				resolve(everything);
				return everything;
			}
			
		});
		
		
	});
}



function split_file_extension(filename){
	if(typeof filename == 'string'){
		
		let tail = 10;
		if(filename.length < 12){
			tail = filename.length - 2;
		}
		if(filename.lastIndexOf('.') > 0 && filename.lastIndexOf('.') > (filename.length - tail)){
			return [filename.substr(0,filename.lastIndexOf('.')),filename.substr(filename.lastIndexOf('.'))] //re.exec(filename);
		}
		else{
			return [filename];
		}
		
	}
	else{
		console.error("split_file_extension: provided filename was not a string");
		return null;
	}
	
}


function get_file_extension(filename){
	if(typeof filename == 'string'){
		
		if(filename.indexOf('.') == -1){
			return 'none';
		}
		
		let tail = 10;
		if(filename.length < 12){
			tail = filename.length - 1;
		}
		let filename_tail = filename.substr(filename.length - tail);
		if(filename_tail.endsWith('.')){
			filename_tail = filename_tail.substr(0,filename_tail.length-2);
		}
		if(filename_tail.indexOf('.') == -1){
			return null
		}
		else{
			
			let extension = filename_tail.substr( (filename_tail.lastIndexOf('.') + 1) );
			if(extension.length){
				return extension.toLowerCase();
			}
			else{
				return null
			}
		}
		
	}
	else{
		return null;
	}
	
}

function remove_file_extension(filename){
	if(typeof filename == 'string'){
		const extension = get_file_extension(filename);
		if(extension != 'none'){
			return filename.substr(0, (filename.length - (extension.length + 1)))
		}
	}
	return filename;
}
window.remove_file_extension = remove_file_extension;


function filename_is_binary_image(filename){
	//console.log("in filename_is_binary_image.  filename: ", filename);
	let extension = get_file_extension(filename);
	//console.log("filename_is_binary_image?  extension: ", extension, binary_image_extensions);
	if(extension && binary_image_extensions.includes(extension)){
		//console.log("filename_is_binary_image: yes");
		return true
	}
	else{
		//console.log("filename_is_binary_image: no");
		return false
	}
}
window.filename_is_binary_image = filename_is_binary_image;


function filename_is_image(filename){
	//console.log("in filename_is_image.  filename: ", filename);
	let extension = get_file_extension(filename);
	if(extension && extension == '.svg'){
		//console.log("filename_is_image: yes (svg)");
		return true;
	}
	else{
		return filename_is_binary_image(filename);
	}
}
window.filename_is_image = filename_is_image;



function filename_is_media(filename){
	//console.log("in filename_is_image.  filename: ", filename);
	let extension = get_file_extension(filename);
	if(extension && binary_media_extensions.includes(extension)){
		//console.log("filename_is_binary_media: yes");
		return true
	}
	else{
		//console.log("filename_is_binary_media: no");
		return false
	}
}
window.filename_is_media = filename_is_media;

function filename_is_video(filename){
	//console.log("in filename_is_image.  filename: ", filename);
	let extension = get_file_extension(filename);
	if(extension && binary_video_extensions.includes(extension)){
		//console.log("filename_is_binary_video: yes");
		return true
	}
	else{
		//console.log("filename_is_binary_video: no");
		return false
	}
}
window.filename_is_media = filename_is_media;

function filename_is_audio(filename){
	//console.log("in filename_is_image.  filename: ", filename);
	let extension = get_file_extension(filename);
	if(extension && binary_audio_extensions.includes(extension)){
		//console.log("filename_is_binary_audio: yes");
		return true
	}
	else{
		//console.log("filename_is_binary_audio: no");
		return false
	}
}
window.filename_is_media = filename_is_media;



function filename_is_archive(filename){
	//console.log("in filename_is_image.  filename: ", filename);
	let extension = get_file_extension(filename);
	if(extension && archive_extensions.includes(extension)){
		return true
	}
	else{
		return false
	}
}

// added for AI chat
function filename_is_binary_document(filename){
	//console.log("in filename_is_image.  filename: ", filename);
	let extension = get_file_extension(filename);
	if(extension && binary_document_extensions.includes(extension)){
		return true
	}
	else{
		return false
	}
}


function filename_is_binary(filename){
	if(filename_is_binary_image(filename)){
		return true;
	}
	else if(filename_is_media(filename)){
		return true;
	}
	else if(filename_is_archive(filename)){
		return true;
	}
	else if(filename_is_binary_document(filename)){
		return true;
	}
	return false
}
window.filename_is_binary = filename_is_binary;




function arrayBufferToString( buffer, encoding, callback ) {
    var blob = new Blob([buffer],{type:'text/plain'});
    var reader = new FileReader();
    reader.onload = function(evt){callback(evt.target.result);};
    reader.readAsText(blob, encoding);
}


function stringToArrayBuffer( string, encoding, callback ) {
    var blob = new Blob([string],{type:'text/plain;charset='+encoding});
    var reader = new FileReader();
    reader.onload = function(evt){callback(evt.target.result);};
    reader.readAsArrayBuffer(blob);
}



function buffer_to_string2(buf) {
	let blob = new Blob([buf], {type: "octet/stream"});
	// type: 'image/jpeg' // or whatever your Content-Type is
	return blob.text();
}






// These two work
function buffer_to_string(buf) {
   var str = "";
   var ab = new Uint8Array(buf);
   var abLen = ab.length;
   var CHUNK_SIZE = Math.pow(2, 8);
   var offset, len, subab;
   for (offset = 0; offset < abLen; offset += CHUNK_SIZE) {
      len = Math.min(CHUNK_SIZE, abLen-offset);
      subab = ab.subarray(offset, offset+len);
      str += String.fromCharCode.apply(null, subab);
   }
   return str;
}

function string_to_buffer(str) {
  var buf = new ArrayBuffer(str.length); // *2  // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}


function generate_image_html(data=null,target_folder=null,target_filename=null,img_el=null,skip_image_to_text=false){
	//console.log("in generate_image_html.  data,target_folder,target_filename: ", data,target_folder,target_filename,img_el);
	if(target_folder == null){target_folder = folder}
	if(target_filename == null){target_file = current_file_name}
	
	//console.log("generate_image_html: playground_live_backups value:\n - ", playground_live_backups[target_folder + '/' + target_filename], '\n - ', target_folder, target_filename, '\n - ', playground_live_backups);
	
	if(data==null){
		if(typeof playground_live_backups[target_folder + '/' + target_filename] == 'string' && playground_live_backups[target_folder + '/' + target_filename].length > 5 && playground_live_backups[target_folder + '/' + target_filename] != '_PLAYGROUND_BINARY_'){
			//console.log("generate_image_html: found data in playground_live_backups: ", playground_live_backups[target_folder + '/' + target_filename]);
			//console.log("generate_image_html: found data in playground_live_backups");
			data = playground_live_backups[target_folder + '/' + target_filename];
		}
		else if(typeof playground_saved_files[target_folder + '/' + target_filename] == 'string' && playground_saved_files[target_folder + '/' + target_filename].length > 5 && playground_saved_files[target_folder + '/' + target_filename] != '_PLAYGROUND_BINARY_'){
			//console.log("generate_image_html: found data in playground_live_backups: ", playground_live_backups[target_folder + '/' + target_filename]);
			//console.log("generate_image_html: found data in playground_live_backups");
			data = playground_saved_files[target_folder + '/' + target_filename];
		}
		else{
			//console.warn("generate_image_html: no data in playground_saved_files or playground_live_backups: \n- playground_saved_files: \n", playground_saved_files, "\n- playground_live_backups: \n",playground_live_backups);
			if(serverless){
				return null;
			}
		}
		//console.log("generate_image_html: data from playground_live_backups: ", typeof data, data);
	}
	//console.log("generate_image_html:  data,target_folder,target_filename: ", data,target_folder,target_filename);
	
	
	let extension = get_file_extension(target_filename);
	
	if(img_el == null){
		img_el = document.createElement('img');
	}
	//console.log("generate_image_html: typeof data, data: ", typeof data, data);
	
	if(typeof data == 'string' && typeof extension == 'string'){
		if(data.startsWith('_PLAYGROUND_BINARY_')){
			//console.log("generate_image_html: data started with _PLAYGROUND_BINARY_");
			data = data.substr(19);
		}
		//console.log("IMAGE AS TEXT BASE64: ",Base64.encode(data), encodeURIComponent(data) );
		data = string_to_buffer( data );
		let is_array_buffer = ArrayBuffer.isView(data);
		//console.log("generate_image_html: raw_data is_array_buffer?: ", is_array_buffer);
		
		let blob = new Blob([ data ], {type: "image/" + extension});
		var url = URL.createObjectURL(blob);
		
		//if(typeof window.settings.assistant == 'string' && window.settings.assistant.startsWith('image_to_text')){
		if(skip_image_to_text==false){	
			//console.log("generate_image_html: setting window.last_image_to_text_blob");
			window.last_image_to_text_blob = blob;
			window.last_image_to_text_blob_file = {'folder':target_folder,'filename':target_filename};
			image_to_text_prompt_image_el.src = url;
		}
		
		//var blob = new Blob([ playground_saved_files[folder + '/' + file] ], {type: 'application/octet-binary'});
		
		//console.log("generate_image_html: virtual image data url: ", url);
		img_el.src = url;
		
	}
	else if(data==null){
		img_el.src = folder + '/' + target_filename;
	}
	else{
		console.error("generate_image_html: unexpected value type: ", typeof data, data);
		img_el.src = folder + '/' + target_filename;
	}
	
	return img_el;
}





function generate_video(data=null,target_folder=null,target_filename=null){
	
	//console.log("in generate_video.  data,target_folder,target_filename: \n- DATA: ", data,"\n- folder & filename: ",target_folder,target_filename);
	if(target_folder == null){target_folder = folder}
	if(target_filename == null){target_file = current_file_name}
	
	if(data==null){
		if(typeof playground_live_backups[target_folder + '/' + target_filename] != 'undefined'){
			data = playground_live_backups[target_folder + '/' + target_filename];
		}
		else if(typeof playground_saved_files[target_folder + '/' + target_filename] != 'undefined'){
			data = playground_saved_files[target_folder + '/' + target_filename];
		}
		else if(window.settings.settings_complexity == 'developer'){
			console.warn("generate_video: no data in playground_live_backups or playground_saved_files: ", playground_live_backups, playground_saved_files);
		}
	}
	
	let media_type = 'audio';
	let extension = get_file_extension(target_filename);
	if(typeof extension != 'string'){
		console.error("generate_video: aborting, no valid file extension");
		return null;
	}
	
	if(filename_is_video(target_filename)){
		media_type = 'video';
	}
	
	
	let media_buttons_el = document.createElement('div');
	media_buttons_el.classList.add('center');
	media_buttons_el.classList.add('flex-wrap');
	
	let media_container_el = document.createElement('div');
	media_container_el.classList.add('playground-overlay-media-container');
	
	let video_el = document.createElement(media_type);
	
	video_el.classList.add(media_type + "-player");
	video_el.setAttribute("id","media-player");
	
	video_el.controls = true;
	
	video_el.addEventListener("play", (event) => {
		//console.log("generate_video: started playing video.  event: ", event);
		
		if(window.scroll_description_to_time_timeout != null){
			//console.log("clearing old scroll_description_to_time_timeout first");
			clearTimeout(window.scroll_description_to_time_timeout);
		}
		scroll_description_to_time();
	});
	
	
	
	
	video_el.addEventListener('loadeddata', function() {
	    //console.log("MEDIA PLAYER ELEMENT IS LOADED");
		
		if(
			typeof files[current_file_name] != 'undefined' 
			&& (
				(typeof files[current_file_name]['subtitle'] == 'string' && files[current_file_name]['subtitle'].length) 
				|| (typeof files[current_file_name]['subtitle_file'] != 'undefined' && files[current_file_name]['subtitle_file'] != null && typeof files[current_file_name]['subtitle_file'].filename == 'string')
			)
		){
			
			let subtitle_buttons_wrapper_el = document.createElement('div');
			subtitle_buttons_wrapper_el.classList.add('flex');
			
			let view_subtitle_button_el = document.createElement('button');
			view_subtitle_button_el.setAttribute('data-i18n','Edit_subtitles');
			view_subtitle_button_el.setAttribute('id','overlay-view-subtitles-button');
			view_subtitle_button_el.textContent = get_translation('Edit_subtitles');
			view_subtitle_button_el.addEventListener('click', () => {
				//console.log("clicked view subtitle for current media file.  subtitle from file meta: ", current_file_name, files[current_file_name]['subtitle']);
				
				if(typeof files[current_file_name]['subtitle'] == 'string'){
					add_overlay_description(files[current_file_name]['subtitle'],'subtitle');
				}
				
				
				if(
					typeof files[current_file_name] != 'undefined' 
					&& typeof files[current_file_name].subtitle_file != 'undefined' 
					&& files[current_file_name].subtitle_file != null 
					&& typeof files[current_file_name].subtitle_file.filename == 'string'
				){
					if(files[current_file_name].subtitle_file.folder == folder && typeof files[ files[current_file_name].subtitle_file.filename ] == 'undefined'){
						console.error("the subtitle file no longer exists");
						delete files[current_file_name].subtitle_file;
						if(window.settings.docs.open.filename != null && typeof window.settings.docs.open.filename == 'string' && filename_is_media(window.settings.docs.open.filename)){
							const origin_file = JSON.parse(JSON.stringify(window.settings.docs.open));
							const short_name = remove_file_extension(current_file_name);
							window.load_meeting_notes_example('vtt',files[current_file_name]['subtitle'],short_name)
							.then(() => {
								//console.log("saving subtitle_file meta data to window.settings.docs.open.filename: " + window.settings.docs.open.filename +  ",  origin_file.filename: ", origin_file.filename);
								save_file_meta('subtitle_file',JSON.parse(JSON.stringify(window.settings.docs.open)), origin_file.folder, origin_file.filename);
								save_file_meta('origin_file',origin_file);
							})
							.catch((err) => {
								console.error("caught error trying to re-create a linked subtitle file for a media file: ", err);
							})
						}
						
						
					}
					else{
						open_file( files[current_file_name].subtitle_file.filename,null,files[current_file_name].subtitle_file.folder );
					}
					
				}
				else{
					if(window.settings.docs.open.filename != null && typeof window.settings.docs.open.filename == 'string' && filename_is_media(window.settings.docs.open.filename)){
					
						const origin_file = JSON.parse(JSON.stringify(window.settings.docs.open));
						const short_name = remove_file_extension(current_file_name);
						window.load_meeting_notes_example('vtt',files[current_file_name]['subtitle'],short_name)
						.then(() => {
							//console.log("saving subtitle_file meta data to: " + window.settings.docs.open.filename +  ",  origin_file.filename: ", origin_file.filename);
							save_file_meta('subtitle_file',JSON.parse(JSON.stringify(window.settings.docs.open)), origin_file.folder, origin_file.filename);
							save_file_meta('origin_file',origin_file);
						})
						.catch((err) => {
							console.error("caught error trying to re-create a linked subtitle file for a media file: ", err);
						})
					}
				}
				
				
				
				
			});
			subtitle_buttons_wrapper_el.appendChild(view_subtitle_button_el);
			
			let download_subtitle_button_el = document.createElement('button');
			download_subtitle_button_el.setAttribute('data-i18n','Download_subtitles');
			download_subtitle_button_el.setAttribute('id','overlay-download-subtitles-button');
			download_subtitle_button_el.textContent = get_translation('Download_subtitles');
			download_subtitle_button_el.addEventListener('click', () => {
				if(typeof files[current_file_name]['subtitle'] == 'string'){
					const subtitle_filename = sanitize_filename(remove_file_extension(current_file_name));
					//console.log("cleaned subtitle_filename: ", subtitle_filename);
					window.download_text_as_txt( vtt_to_srt(files[current_file_name]['subtitle']), subtitle_filename + '.srt');
					window.download_text_as_txt( files[current_file_name]['subtitle'], subtitle_filename + '.vtt');
				}
				
			});
			subtitle_buttons_wrapper_el.appendChild(download_subtitle_button_el);
			
			media_buttons_el.appendChild(subtitle_buttons_wrapper_el);
		}
		else{
			//console.log("there are no subtitles in the meta data for this file: ", current_file_name);
		}
		
		
		
		
		
		
		
		let transcribe_buttons_wrapper_el = document.createElement('div');
		transcribe_buttons_wrapper_el.classList.add('flex-wrap');
		transcribe_buttons_wrapper_el.classList.add('flex-justify-center');
		
		let transcribe_button_el = document.createElement('button');
		transcribe_button_el.setAttribute('data-i18n','Transcribe');
		transcribe_button_el.setAttribute('id','start-file-transcription-button');
		transcribe_button_el.textContent = get_translation('Transcribe');
		transcribe_button_el.addEventListener('click', () => {
			//console.log("clicked on transcribe button. video_el.src: ", video_el.src);
			
			//console.log("transcribe: data.length: ", data.length);
			
			if(window.innerWidth < 981){
				document.body.classList.remove('chat-shrink');
				document.body.classList.remove('sidebar');
			}
			
			transcribe_button_el.classList.add('no-pointer-events');
			transcribe_button_el.classList.add('opacity05');
			transcribe_button_el.innerHTML = '<span class="spinner rotating">&nbsp;</span> &nbsp; ' + transcribe_button_el.innerHTML;
			
			// add this media file to the recently opened documents list
			window.update_recent_documents();
			
			/*
			setTimeout(() => {
				transcribe_button_el.classList.remove('no-pointer-events');
				transcribe_button_el.classList.remove('opacity0');
			},10000)
			*/
			window.reset_scribe_clock();
			
			if(window.microphone_enabled){
				window.disable_microphone();
			}
			
			buffer_to_audio_array(data)
			.then((audio) => {
				if(audio != null){
					window.switch_assistant('scribe',true);
					window.push_stt_task(audio,false,{'sample_rate':16000, 'origin': media_type + '_file', 'assistant':'scribe'},'media_transcription');
				}
				else{
					console.error("utils.js: generate_video: buffer_to_audio_array returned null");
				}
			})
			.catch((err) => {
				console.error("utils.js: generate_video: caught error from buffer_to_audio_array: ", err);
			})
			
			//transform_recorded_audio(data);
		});
		
		transcribe_buttons_wrapper_el.appendChild(transcribe_button_el);
		
		
		let transcribe_subtitle_button_el = document.createElement('button');
		transcribe_subtitle_button_el.setAttribute('data-i18n','Generate_subtitles');
		transcribe_subtitle_button_el.setAttribute('id','start-subtitle-file-transcription-button');
		transcribe_subtitle_button_el.textContent = get_translation('Generate_subtitles');
		transcribe_subtitle_button_el.addEventListener('click', () => {
			//console.log("clicked on transcribe button. video_el.src: ", video_el.src);
			
			//console.log("transcribe: data.length: ", data.length);
			if(window.innerWidth < 981){
				document.body.classList.remove('chat-shrink');
				document.body.classList.remove('sidebar');
			}
			
			transcribe_subtitle_button_el.classList.add('no-pointer-events');
			transcribe_subtitle_button_el.classList.add('opacity05');
			transcribe_subtitle_button_el.innerHTML = '<span class="spinner rotating">&nbsp;</span> &nbsp; ' + transcribe_subtitle_button_el.innerHTML;
			
			// add this media file to the recently opened documents list
			window.update_recent_documents();
			
			
			window.reset_scribe_clock();
			
			if(window.microphone_enabled){
				window.disable_microphone();
			}
			
			buffer_to_audio_array(data)
			.then((audio) => {
				if(audio != null){
					
					window.switch_assistant('scribe',true);
					window.push_stt_task(audio,false,{'sample_rate':16000, 'origin': media_type + '_file', 'assistant':'scribe'},'vtt');
				}
				else{
					console.error("utils.js: generate_video: buffer_to_audio_array returned null");
				}
			})
			.catch((err) => {
				console.error("utils.js: generate_video: caught error from buffer_to_audio_array: ", err);
			})
			
			//transform_recorded_audio(data);
		});
		
		transcribe_buttons_wrapper_el.appendChild(transcribe_subtitle_button_el);
		
		
		let transcribe_json_button_el = document.createElement('button');
		transcribe_json_button_el.classList.add('show-if-advanced');
		transcribe_json_button_el.setAttribute('data-i18n','Transcribe_to_JSON');
		transcribe_json_button_el.setAttribute('id','start-json-file-transcription-button');
		transcribe_json_button_el.textContent = get_translation('Transcribe_to_JSON');
		transcribe_json_button_el.addEventListener('click', () => {
			//console.log("clicked on transcribe to JSON button. video_el.src: ", video_el.src);
			
			//console.log("transcribe to JSON: data.length: ", data.length);
			
			if(window.innerWidth < 981){
				document.body.classList.remove('chat-shrink');
				document.body.classList.remove('sidebar');
			}
			
			transcribe_json_button_el.classList.add('no-pointer-events');
			transcribe_json_button_el.classList.add('opacity05');
			transcribe_json_button_el.innerHTML = '<span class="spinner rotating">&nbsp;</span> &nbsp; ' + transcribe_json_button_el.innerHTML;
			
			// add this media file to the recently opened documents list
			window.update_recent_documents();
			
			window.reset_scribe_clock();
			buffer_to_audio_array(data)
			.then((audio) => {
				if(audio != null){
					window.switch_assistant('scribe',true);
					window.push_stt_task(audio,false,{'sample_rate':16000, 'origin': media_type + '_file', 'assistant':'scribe'},'json');
				}
				else{
					console.error("utils.js: generate_video: buffer_to_audio_array returned null");
				}
			})
			.catch((err) => {
				console.error("utils.js: generate_video: caught error from buffer_to_audio_array: ", err);
			})
			
			//transform_recorded_audio(data);
		});
		
		transcribe_buttons_wrapper_el.appendChild(transcribe_json_button_el);
		media_buttons_el.appendChild(transcribe_buttons_wrapper_el);
		
		
		
		
		
		
		
		
		
		
		
		
		
		//console.log("transcribe file button appended");
		
		setTimeout(window.do_after(null,'media'),100);
	}, false);
	
	//video_el.autoplay = true;
	//console.log("generate_image_html: typeof data, data: ", typeof data, data);
	let source_el = document.createElement('source');
	source_el.type = media_type + "/" + extension;
	
	if(typeof data == 'string'){
		if(data.startsWith('_PLAYGROUND_BINARY_')){
			data = data.substr(19);
		}
		data = string_to_buffer( data );
		//console.log("data: ", data);
		let is_array_buffer = ArrayBuffer.isView(data);
		//console.log("raw_data is_array_buffer?: ", is_array_buffer);
		//console.log("media player: media type: ", media_type + "/" + extension);
		
		let blob = new Blob([ data ], {type: media_type + "/" + extension});
		//var blob = new Blob([ playground_saved_files[folder + '/' + file] ], {type: 'application/octet-binary'});
		var url = URL.createObjectURL(blob);
		
		//console.log("virtual image data url: ", url);
		video_el.src = url;
		
		
	}
	else{
		source_el.src = folder + '/' + target_filename;
	}
	
	//video_el.appendChild(source_el);
	
	media_container_el.appendChild(video_el);
	
	
	
	
	media_container_el.appendChild(media_buttons_el);
	
	return media_container_el;
}




async function buffer_to_audio_array(buffer){
	
	
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16_000 });

    try {
        const audioBuffer = await audioContext.decodeAudioData(buffer);
		//console.log("processFile: audioBuffer: ",  audioBuffer);
		
		const sample_rate = AudioBuffer.sampleRate;
		//console.log("processFile: sampleRate: ", sample_rate);
		
        let audio = [];
        if (audioBuffer.numberOfChannels === 2) {
			//console.warn("processFile: TWO CHANNELS");
            // Merge channels
            const SCALING_FACTOR = Math.sqrt(2);
            const left = audioBuffer.getChannelData(0);
            const right = audioBuffer.getChannelData(1);
            for (let i = 0; i < left.length; ++i) {
				audio[i] = (left[i] + right[i]) / 2;
				
            }
        } else {
			//console.warn("processFile: ONE CHANNEL");
            const left = audioBuffer.getChannelData(0);
			
            for (let i = 0; i < left.length; ++i) {
                //audio[i] = SCALING_FACTOR * (left[i] + right[i]) / 2;
				audio[i] = left[i] * 1;
				
            }
			
			
        }
		//console.error("processFile: remade audio: ", audio);
		
		let all_zeros = true;
		for(let a = 0; a < audio.length / 1000; a++){
			if(audio[a * 1000] != 0){
				//console.log("OK, not all zeros: ", a, audio[a * 1000]);
				all_zeros = false;
				break
				/*
				if(a > 32){
					break
				}
				*/
			}
		}
		if(all_zeros){
			console.error("processFile: audio seems to be all zeros");
			flash_message(get_translation("An_error_occured"), 2000, 'fail');
		}
		else{
			//console.error("processFile: audio was NOT all zeros");
			
			
			//transform_recorded_audio(audio,'file');
			
			return audio
			
		}
		
		
        //onInputChange(audio);

    } catch (err) {
        console.error("utils.js: caught error in processFile (audio buffer handling): ", err);
		return null
    }
}




// If there is an image description or audio transcription in the file meta, show it.
function add_overlay_description(text=null,text_type=null){
	//console.log("in add_overlay_description.  text,text_type: ", text, text_type);
	
	
	
	if(
		typeof text != 'string' 
		&& typeof text_type == 'string' 
		&& text_type == 'subtitle' 
		&& typeof files[current_file_name]['subtitle_file'] != 'undefined' 
		&& files[current_file_name]['subtitle_file'] != null 
		&& typeof files[current_file_name]['subtitle_file'].filename == 'string'
		&& (
			typeof playground_saved_files[ files[current_file_name]['subtitle_file'].folder + '/' + files[current_file_name]['subtitle_file'].filename ] == 'string'
			|| typeof playground_live_backups[ files[current_file_name]['subtitle_file'].folder + '/playground_backup_' + files[current_file_name]['subtitle_file'].filename ] == 'string'
		)
	){
		if(typeof playground_live_backups[ files[current_file_name]['subtitle_file'].folder + '/playground_backup_' + files[current_file_name]['subtitle_file'].filename ] == 'string'){
			text = playground_live_backups[ files[current_file_name]['subtitle_file'].folder + '/playground_backup_' + files[current_file_name]['subtitle_file'].filename ];
		}else{
			text = playground_saved_files[ files[current_file_name]['subtitle_file'].folder + '/' + files[current_file_name]['subtitle_file'].filename ];
		}
	}
	
	
	
	if(typeof text == 'string' || (typeof files[current_file_name] != 'undefined' && (typeof files[current_file_name]['subtitle'] == 'string' || typeof files[current_file_name]['image_to_text_description'] == 'string' || typeof files[current_file_name]['audio_to_text_description'] == 'string' )) ){
	
		// get the description
		//let text_type = 'image_description';
		//let text = null;
		
		if(typeof text != 'string' && typeof text_type == 'string'){
			if(text_type == 'image_description' && typeof files[current_file_name]['image_to_text_description'] == 'string'){
				text = files[current_file_name]['image_to_text_description'];
			}
			else if(text_type == 'audio_transcription' && typeof files[current_file_name]['audio_to_text_description'] == 'string'){
				text = files[current_file_name]['audio_to_text_description'];
			}
			else if(text_type == 'subtitle' && typeof files[current_file_name]['subtitle'] == 'string'){
				text = files[current_file_name]['subtitle'];
			}
			else{
				console.error("add_overlay_description fell through, could not find desired text_type in file meta: ", text_type, current_file_name, files[current_file_name]);
			}
		}
		
		if(typeof text != 'string' && typeof text_type != 'string'){
			if(typeof files[current_file_name]['subtitle'] == 'string'){
				text = files[current_file_name]['subtitle'];
				text_type = 'subtitle';
			}
			else if(typeof files[current_file_name]['image_to_text_description'] == 'string'){
				text = files[current_file_name]['image_to_text_description'];
				text_type = 'image_description';
			}
			else if(typeof files[current_file_name]['audio_to_text_description'] == 'string'){
				text = files[current_file_name]['audio_to_text_description'];
				text_type = 'audio_transcription';
			}
		}
		
		
		
		
		
		if(typeof text != 'string'){
			//console.warn("no overlay description/transcription text available for this file: ", current_file_name);
			return
		}
		//console.log("file has description in meta data");
		
		let overlay_description_container_el = document.getElementById('overlay-description-container');
		
		if(overlay_description_container_el == null){
			overlay_description_container_el = document.createElement('div');
			overlay_description_container_el.classList.add('overlay-image-description-container');
			overlay_description_container_el.setAttribute('id','overlay-description-container');
			playground_overlay_el.appendChild(overlay_description_container_el);
		}
	
	
		// Add description to overlay
		if(overlay_description_container_el != null){
			let overlay_description_el = document.getElementById('overlay-description');
			if( overlay_description_el == null){
		
				//console.log("add_overlay_description: adding overlay-image-description element");
				overlay_description_el = document.createElement('div');
				overlay_description_el.classList.add('overlay-image-description');
				overlay_description_el.setAttribute('id','overlay-description');
			
				overlay_description_container_el.appendChild(overlay_description_el);
				
				
				//overlay_description_container_el.appendChild(overlay_description_el);
			
				// Overlay description context buttons
				overlay_description_context_buttons_container_el = document.createElement('div');
				overlay_description_context_buttons_container_el.classList.add('overlay-description-context-buttons-container');
			
				// Copy to clipboard button
				overlay_description_context_copy_button_el = document.createElement('div');
				overlay_description_context_copy_button_el.setAttribute('title','Copy');
				overlay_description_context_copy_button_el.innerHTML = '<img src="images/copy_to_clipboard.svg" class="bubble-copy-to-clipboard-button-icon" width="12" height="12" alt="Copy">';
				//overlay_description_context_copy_button_el.classList.add('overlay-description-context-button');
				//overlay_description_context_copy_button_el.classList.add('overlay-description-context-copy-button');
				//overlay_description_context_copy_button_el.classList.add('bubble-doc-button');
				overlay_description_context_copy_button_el.classList.add('invert-colors');
				overlay_description_context_copy_button_el.classList.add('bubble-copy-to-clipboard-button-icon-wrapper');
				overlay_description_context_copy_button_el.classList.add('center');
				overlay_description_context_copy_button_el.addEventListener('click', () => {
					copy_to_clipboard(text);
				
					overlay_description_context_copy_button_el.classList.add('opacity0');
					overlay_description_context_copy_button_el.classList.add('no-click-events');
					setTimeout(() => {
						overlay_description_context_copy_button_el.classList.remove('opacity0');
						overlay_description_context_copy_button_el.classList.remove('no-click-events');
					},2000);
				
				});
				overlay_description_context_buttons_container_el.appendChild(overlay_description_context_copy_button_el);
			
				let create_new_doc_button_el = document.createElement('div');
				create_new_doc_button_el.classList.add('bubble-new-doc-button');
				create_new_doc_button_el.classList.add('bubble-doc-button');
				create_new_doc_button_el.classList.add('add-icon');
				create_new_doc_button_el.textContent = '📄';
			
				create_new_doc_button_el.addEventListener('click',(event) => {
					//console.log("add_chat_message: clicked on create new doc button");
					create_new_doc_button_el.classList.add('opacity0');
					create_new_doc_button_el.classList.add('no-click-events');
					setTimeout(() => {
						create_new_doc_button_el.classList.remove('opacity0');
						create_new_doc_button_el.classList.remove('no-click-events');
					},4000);
					window.show_files_tab(); // only shows it if the sidebar is already open
				
					let filename_parts = split_file_extension(current_file_name);
					//console.log("filename_parts: ", filename_parts);
				
					if(filename_parts && filename_parts.length){
						suggested_file_name = filename_parts[0] + ' ' + get_translation('Transcription').toLowerCase() + '.txt';
						//console.log("suggested_file_name: ", suggested_file_name);
						window.last_user_query = suggested_file_name;
					}
					create_new_document(text);
				});
				overlay_description_context_buttons_container_el.appendChild(create_new_doc_button_el);
				overlay_description_container_el.appendChild(overlay_description_context_buttons_container_el);
				//overlay_description_container_el.appendChild(overlay_description_context_buttons_container_el);
				
				
				
				
				
			}
		
			//let overlay_description_container_el = document.getElementById('overlay-description-container');
			
			if( overlay_description_el != null){
				//let description_chunks_container_el = document.createElement('div');
				overlay_description_el.innerHTML = '';
			
				if(typeof text == 'string' && text.trim().length > 5){
					let text_chunks = text.split('\n\n');
					for (let ch = 0; ch < text_chunks.length; ch++){
						const my_text = text_chunks[ch];
						let seconds = null;
						let seconds_part = '';
						let text_part = '';
			
						let description_chunk_el = document.createElement('div');
						description_chunk_el.classList.add('overlay-description-chunk');
						description_chunk_el.classList.add('overlay-description-chunk-' + text_type);
						description_chunk_el.setAttribute('data-description-chunk-index',ch);
						description_chunk_el.setAttribute('data-description-chunk-length',text_chunks.length);
						description_chunk_el.textContent = my_text;
			
						if(my_text.indexOf(' --> ') != -1 && my_text.indexOf(':') != -1){
							let subtitle_parts = my_text.match(/^\s*(\d+:\d+:\d+.\d+)[^\S\n]+-->[^\S\n]+(\d+:\d+:\d+.\d+)((?:\n(?!\d+:\d+:\d+.\d+\b|\n+\d+$).*)*)/gm);
							//console.log("utils: add_overlay_description: subtitle_parts: ", subtitle_parts);
							if(subtitle_parts && subtitle_parts.length){
								let first_timestamp = subtitle_parts[0].split(' --> ')[0];
								if(first_timestamp.indexOf(':') != -1 && my_text.indexOf('.') != -1){
						
									let milliseconds = '0.' + first_timestamp.split('.')[1];
									//console.log("milliseconds string: ", milliseconds);
									milliseconds = parseFloat(milliseconds);
									//console.log("milliseconds parsed to float: ", milliseconds);
									let time_parts = first_timestamp.split('.')[0];
									if(time_parts.indexOf(':') != -1 && typeof milliseconds == 'number'){
										time_parts = time_parts.split(':');
										//console.log("time_parts.length: ", time_parts.length, time_parts);
										if(time_parts.length == 3){
											seconds = parseInt(time_parts[2]);
											seconds_part = time_parts[2];
											if(time_parts[1] != '00'){
												seconds_part = time_parts[1] + ':' + seconds_part;
												seconds = seconds + (parseInt(time_parts[1]) * 60);
												if(time_parts[0] != '00'){
													seconds_part = parseInt(time_parts[2]) + ':' + seconds_part;
													seconds = seconds + (parseInt(time_parts[0]) * 3600);
												}
											}
											else{
												seconds_part = '00:' + seconds_part;
											}
											seconds += milliseconds;
											//console.log("subtitle chunk seconds offset: ", seconds);
											let text_lines = my_text.split('\n');
											for(let tl = 0; tl < text_lines.length; tl++){
												if(text_lines[tl].indexOf(' --> ') == -1 && text_lines[tl].trim() != ''){
													text_part = text_part + text_lines[tl] + '\n';
												}
											}
								
										}
									}
						
								}
							}
						}
						if(seconds != null){
							description_chunk_el.setAttribute('data-seconds',seconds);
						
							if(typeof text_part == 'string' && text_part != '' && typeof seconds_part == 'string' && seconds_part != ''){
								description_chunk_el.innerHTML = '<div class="flex"><div class="overlay-description-chunk-seconds">' + seconds_part + '</div><div class="overlay-description-chunk-text">' + text_part + '</div></div>';
							}
				
				
							description_chunk_el.addEventListener('click', () => {
								//console.log("clicked on overlay description chunk");
								let media_player_el = document.getElementById('media-player');
								if(media_player_el){
									media_player_el.currentTime = seconds;
									media_player_el.play();
								}
				
							});
						}
				
						overlay_description_el.appendChild(description_chunk_el);
					}
				}
			
			}
		}
	}
	
	
	
	// Add subtitle to video player
	let media_player_el = document.getElementById('media-player');
	if( media_player_el != null){
		
		if(typeof files[current_file_name] != 'undefined' && typeof files[current_file_name]['subtitle'] == 'string' && files[current_file_name]['subtitle'].length){
			//console.log("spotted subtitle in file meta: ", files[current_file_name]['subtitle']);
			let media_player_track_el = document.getElementById('media-player-track');
			if(media_player_track_el == null){
				//console.log("creating subtitle track for media player");
				media_player_track_el = document.createElement('track');
				media_player_track_el.setAttribute('id','media-player-track');
				media_player_track_el.setAttribute('kind','subtitles');
				//console.log("media_player_track_el: ", media_player_track_el);
				//media_player_track_el.setAttribute('mode','showing');
				//v.textTracks[0].mode = "hidden";
				media_player_el.appendChild(media_player_track_el);
			}
			
			let raw_subtitle = files[current_file_name]['subtitle'];
			if(typeof raw_subtitle == 'string'){
				raw_subtitle = window.srt_to_vtt(raw_subtitle);
				//console.log("final raw_subtitle turned into VTT subtitle: ", raw_subtitle);
			
				if(media_player_track_el != null){
					let vtt_blob = new Blob([raw_subtitle], {type: 'text/vtt'});
					media_player_track_el.src = URL.createObjectURL(vtt_blob);
					//media_player_el.textTracks[0].mode = "hidden";
					//console.log("media_player_el.textTracks: ", media_player_el.textTracks);
					if(media_player_el.textTracks.length){
						media_player_el.textTracks[0].mode = "showing";
					}
				}
				else{
					console.error("no subtitle track element");
				}
			
			}
			
			if(typeof media_player_el.onplaying == 'undefined'){
				media_player_el.onplaying = function() { 
					//console.log('Video is now loaded and playing');
					
				}
			}
			
		}
		else{
			//console.log("no subtitle in file meta, cannot add subtitle to media player");
		}
		
	}
	
	
}



function scroll_description_to_time(){
	//console.log("in scroll_description_to_time");
	let still_media_player_el = document.getElementById('media-player');
	if(still_media_player_el){
		if(still_media_player_el.paused === false){
			
			const description_container_el = document.getElementById('overlay-description-container');
			if(description_container_el){
				
				
			
			
				let subtitle_chunk_els = document.querySelectorAll('.overlay-description-chunk');
				if(subtitle_chunk_els.length){
				
					let video_seconds = still_media_player_el.currentTime;
					//console.log("video_seconds: ", typeof video_seconds, video_seconds);
					if(typeof video_seconds == 'number'){
						let found_it = false;
						let previous_seconds = 0;
					
					
						for(let sc = 0; sc < subtitle_chunk_els.length; sc++){
							subtitle_chunk_els[sc].classList.remove('highlighted-description-chunk');
						}
					
						for(let sc = 0; sc < subtitle_chunk_els.length; sc++){
					
							if(found_it == false && subtitle_chunk_els[sc].hasAttribute('data-seconds')){
								let data_seconds = subtitle_chunk_els[sc].getAttribute('data-seconds');
								//console.log("data_seconds: ", sc, typeof data_seconds, data_seconds);
								let chunk_seconds = parseFloat(data_seconds);
								//
								//console.log("checking: chunk_seconds vs video_seconds: ", chunk_seconds, video_seconds);
							
								/*
								let next_chunk_seconds = null;
								if(sc < subtitle_chunk_els.length - 1){
									if(subtitle_chunk_els[sc - 1].hasAttribute('data-seconds')){
										next_chunk_seconds = parseFloat(subtitle_chunk_els[sc + 1].getAttribute('data-seconds'));
									}
								}
								if(typeof next_chunk_seconds == 'number' && chunk_seconds >= video_seconds && video_seconds < next_chunk_seconds){
									found_it = true;
									//console.log("FOUND OPTIMAL SUBTITLE CHUNK ELEMENT:  nr: ", sc, chunk_seconds, " >", video_seconds, "< ", next_chunk_seconds);
									subtitle_chunk_els[sc].classList.add('highlighted-description-chunk');
									subtitle_chunk_els[sc].scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
								}
								*/
								if(video_seconds >= previous_seconds && video_seconds < chunk_seconds){
									//console.log("not the right chunk yet");
									found_it = true;
									//console.log("FOUND CURRENT SUBTITLE CHUNK ELEMENT:  nr: ", sc, previous_seconds, " >", video_seconds, "< ", chunk_seconds);
									if(sc == 0){
										subtitle_chunk_els[sc].classList.add('highlighted-description-chunk');
										if (!description_container_el.matches(':hover')) {
											subtitle_chunk_els[sc].scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
										}
										else{
											//console.log('Mouse is over the overlay-description-container element');
										}
										
									}
									else{
										subtitle_chunk_els[sc-1].classList.add('highlighted-description-chunk');
										if (!description_container_el.matches(':hover')) {
											subtitle_chunk_els[sc-1].scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
										}
										else{
											//console.log('Mouse is over the overlay-description-container element');
										}
										
									}
								
								
								}
								else{ // if(typeof chunk_seconds == 'number' && typeof video_seconds == 'number' && video_seconds >= chunk_seconds)
									subtitle_chunk_els[sc].classList.remove('highlighted-description-chunk');
								
								}
								previous_seconds = chunk_seconds;
							}
							else{
								//console.log("already found it, so this can't be it");
								//subtitle_chunk_els[sc].removeAttribute('highlighted-description-chunk');
								subtitle_chunk_els[sc].classList.remove('highlighted-description-chunk');
							}
					
						}
					}
					
					window.scroll_description_to_time_timeout = setTimeout(scroll_description_to_time,200);
				}
				else{
					console.warn("no overlay-description-chunk elements found");
				}
			}
			else{
				console.warn("no overlay-description container element found");
			}
			
			
		}
		else{
			//console.log("media player has been paused");
		}
	}
	else{
		//console.log("media player element is gone");
	}
	
}





function srt_to_vtt(raw_subtitle){
	//console.log("in srt_to_vtt. raw_subtitle: ", raw_subtitle);
	if(typeof raw_subtitle == 'string' && !raw_subtitle.startsWith('WEBVTT')){
		raw_subtitle = 'WEBVTT\n\n' + raw_subtitle;
		raw_subtitle = raw_subtitle.replace(/(\d+:\d+:\d+)+,(\d+)/g, '$1.$2');
		let raw_subtitle_lines = raw_subtitle.split('\n');
		for(let r = raw_subtitle_lines.length - 1; r > 1; --r){
			if(raw_subtitle_lines[r-1].trim() == '' && !isNaN(raw_subtitle_lines[r].trim())){
				//console.log("srt_to_vtt: removing number from SRT subtitle: " + raw_subtitle_lines[r]);
				raw_subtitle_lines.splice(r,1);
				r--;
			}
		}
		raw_subtitle = raw_subtitle_lines.join('\n');
	}
	return raw_subtitle;
}
window.srt_to_vtt = srt_to_vtt;



function vtt_to_srt(raw_subtitle){
	if(typeof raw_subtitle == 'string' && raw_subtitle.indexOf(' --> ') != -1){
		let chunks = raw_subtitle.split(/[\n]{2,}/); 
		//console.log("vtt_to_srt: chunks: ", chunks);
	
		for(let y = chunks.length - 1; y >= 0; y--){
			if(chunks[y].indexOf(' --> ') == -1){
				console.warn("CHUNK IN VTT FILE DID NOT CONTAIN ' --> ':\n" + chunks[y]);
				chunks.splice(y,1);
			}
		}
	
		for(let x = 0; x < chunks.length; x++){
			let chunk_lines = chunks[x].split('\n');
			for(let cl = 0; cl < chunk_lines.length; cl++){
				//console.log("chunk_line: ", cl, chunk_lines[cl], ", double-dot-count: ", chunk_lines[cl].split(':').length);
				if(chunk_lines[cl].indexOf(' --> ') != -1 && chunk_lines[cl].split(':').length > 6){
					let timestamp_parts = chunk_lines[cl].split(':');
					chunk_lines[cl] = timestamp_parts[0] + ':' + timestamp_parts[1] + ':' + timestamp_parts[2] + ',' + timestamp_parts[3] + ':' + timestamp_parts[4] + ':' + timestamp_parts[5] + ',' + timestamp_parts[6].substr(0,3);
				}
				else if(chunk_lines[cl].indexOf('<') != -1 && chunk_lines[cl].indexOf('>') != -1){
					//chunk_lines[cl] = chunk_lines[cl].replaceAll('<i>')
					chunk_lines[cl] = chunk_lines.replace(/<\/?[^>]+(>|$)/g, "");
				}
			}
			chunks[x] = chunk_lines.join('\n');
			//console.log("simplified VTT to SRT chunk: ", chunks[x]);
		
			chunks[x] = x + '\n' + chunks[x];
		}
		return chunks.join('\n\n\n');
	}
	else{
		console.error("vtt_to_srt: invalid input: ", typeof raw_subtitle);
		return '';
	}
	
}
window.vtt_to_srt = vtt_to_srt;






//example:
//var buf = new Uint8Array([65,66,67]);
//arrayBufferToString(buf, 'UTF-8', console.log.bind(console)); //"ABC"

//stringToArrayBuffer('ABC', 'UTF-8', console.log.bind(console)); //[65,66,67]





/*
function buffer_to_string2(value){
	
  var
    binaryString = '',
    bytes = new Uint8Array(value),
    array_length = bytes.length;
  for (var i = 0; i < array_length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return binaryString;
  
	//var enc = new TextDecoder("utf-8");
	//var arr = new Uint8Array([84,104,105,115,32,105,115,32,97,32,85,105,110,116, 56,65,114,114,97,121,32,99,111,110,118,101,114,116,101,100,32,116,111,32,97,32,115,116,114,105,110,103]);
	//return enc.decode(value);
	//console.log(enc.encode("This is a string converted to a Uint8Array"));
	//return new Buffer.from(value).toString("base64");
}
function string_to_buffer2(value){
	var enc = new TextEncoder(); // always utf-8
	return enc.encode(value).buffer;
}
*/

function arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}


function base64ToUint8Array(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++)
        bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function base64ToArrayBuffer(base64) {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++)
        bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}


const blobToBase64 = blob => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise(resolve => {
        reader.onloadend = () => {
        	resolve(reader.result);
        };
    });
};

/*
function base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
*/







/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info
*
**/
var Base64 = {

    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

    // public method for encoding
    , encode: function (input)
    {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length)
        {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2))
            {
                enc3 = enc4 = 64;
            }
            else if (isNaN(chr3))
            {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        } // Whend 

        return output;
    } // End Function encode 


    // public method for decoding
    ,decode: function (input)
    {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length)
        {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64)
            {
                output = output + String.fromCharCode(chr2);
            }

            if (enc4 != 64)
            {
                output = output + String.fromCharCode(chr3);
            }

        } // Whend 

        output = Base64._utf8_decode(output);

        return output;
    } // End Function decode 


    // private method for UTF-8 encoding
    ,_utf8_encode: function (string)
    {
        var utftext = "";
        string = string.replace(/\r\n/g, "\n");

        for (var n = 0; n < string.length; n++)
        {
            var c = string.charCodeAt(n);

            if (c < 128)
            {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048))
            {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else
            {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        } // Next n 

        return utftext;
    } // End Function _utf8_encode 

    // private method for UTF-8 decoding
    ,_utf8_decode: function (utftext)
    {
        var string = "";
        var i = 0;
        var c, c1, c2, c3;
        c = c1 = c2 = 0;

        while (i < utftext.length)
        {
            c = utftext.charCodeAt(i);

            if (c < 128)
            {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224))
            {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else
            {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        } // Whend 

        return string;
    } // End Function _utf8_decode 

}






// SQLITE



/*
var execBtn = document.getElementById("execute");
var outputElm = document.getElementById('output');
var errorElm = document.getElementById('error');
var commandsElm = document.getElementById('commands');
var dbFileElm = document.getElementById('dbfile');
var savedbElm = document.getElementById('savedb');
*/

// Start the worker in which sql.js will run


// Connect to the HTML element we 'print' to
/*
function print(text) {
	outputElm.innerHTML = text.replace(/\n/g, '<br>');
}
function error(e) {
	//console.log(e);
	errorElm.style.height = '2em';
	errorElm.textContent = e.message;
}

function noerror() {
	errorElm.style.height = '0';
}

// Run a command in the database
function execute(commands) {
	tic();
	worker.onmessage = function (event) {
		var results = event.data.results;
		toc("Executing SQL");
		if (!results) {
			error({message: event.data.error});
			return;
		}

		tic();
		outputElm.innerHTML = "";
		for (var i = 0; i < results.length; i++) {
			outputElm.appendChild(tableCreate(results[i].columns, results[i].values));
		}
		toc("Displaying results");
	}
	worker.postMessage({ action: 'exec', sql: commands });
	outputElm.textContent = "Fetching results...";
}

// Create an HTML table
var tableCreate = function () {
	function valconcat(vals, tagName) {
		if (vals.length === 0) return '';
		var open = '<' + tagName + '>', close = '</' + tagName + '>';
		return open + vals.join(close + open) + close;
	}
	return function (columns, values) {
		var tbl = document.createElement('table');
		var html = '<thead>' + valconcat(columns, 'th') + '</thead>';
		var rows = values.map(function (v) { return valconcat(v, 'td'); });
		html += '<tbody>' + valconcat(rows, 'tr') + '</tbody>';
		tbl.innerHTML = html;
		return tbl;
	}
}();

// Execute the commands when the button is clicked
function execEditorContents() {
	noerror()
	execute(editor.getValue() + ';');
}
execBtn.addEventListener("click", execEditorContents, true);
*/

// Performance measurement functions
/*
var tictime;
if (!window.performance || !performance.now) { window.performance = { now: Date.now } }
function tic() { tictime = performance.now() }
function toc(msg) {
	var dt = performance.now() - tictime;
	//console.log((msg || 'toc') + ": " + dt + "ms");
}


// Add syntax highlighting to the textarea
var editor = CodeMirror.fromTextArea(commandsElm, {
	mode: 'text/x-mysql',
	viewportMargin: Infinity,
	indentWithTabs: true,
	smartIndent: true,
	lineNumbers: true,
	matchBrackets: true,
	autofocus: true,
	extraKeys: {
		"Ctrl-Enter": execEditorContents,
		"Ctrl-S": savedb,
	}
});
*/

// Load a db from a file
/*
dbFileElm.onchange = function () {
	var f = dbFileElm.files[0];
	var r = new FileReader();
	r.onload = function () {
		worker.onmessage = function () {
			//toc("Loading database from file");
			// Show the schema of the loaded database
			editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
			execEditorContents();
		};
		//tic();
		try {
			worker.postMessage({ action: 'open', buffer: r.result }, [r.result]);
		}
		catch (exception) {
			worker.postMessage({ action: 'open', buffer: r.result });
		}
	}
	r.readAsArrayBuffer(f);
}
*/


function open_sqlite(data){
	//console.log("in open_sqlite.  data: ", data);
	
	playground_overlay_el.innerHTML = "<h2>SQLITE</h2>";
	
	let sql_div = document.createElement('div');
	sql_div.id = 'sqlite-container';
	
	let sql_header = document.createElement('div');
	sql_header.id = 'sqlite-header';
	
	let sql_save_button = document.createElement('button');
	sql_save_button.innerText = 'Save SQLite';
	sql_save_button.onclick = () => {
		//console.log("clicked on save sqlite button");
	}
	sql_header.appendChild(sql_save_button);
	
	let sql_table = document.createElement('div');
	sql_table.id = 'sqlite-table-container';
	
	let sql_pre = document.createElement('pre');
	sql_pre.id = 'sqlite-table';
	sql_table.appendChild(sql_pre);

	sql_div.appendChild(sql_header);
	sql_div.appendChild(sql_table);
	
	playground_overlay_el.appendChild(sql_div);
	
	
	var worker = new Worker("./pjs/worker.sql-wasm.js");
	worker.onerror = worker_error;
	
	// Open a database
	worker.postMessage({ action: 'open' });
	
	
	if(typeof data == 'string'){
		if(data.startsWith('_PLAYGROUND_BINARY_')){
			data = data.substr(19);
		}
		
		data = string_to_buffer( data );
		let is_array_buffer = ArrayBuffer.isView(data);
		//console.log("raw_data is_array_buffer?: ", is_array_buffer);
		
		//console.log("sending data to sqlite worker: ", data);
		
		try {
			worker.postMessage({ action: 'open', buffer: data }, [data]);
		}
		catch (exception) {
			worker.postMessage({ action: 'open', buffer: data });
		}
		
		//let blob = new Blob([ data ], {type: "image/" + extension});
		
		//var blob = new Blob([ playground_saved_files[folder + '/' + file] ], {type: 'application/octet-binary'});
		//var url = URL.createObjectURL(blob);
	
		//console.log("virtual image data url: ", url);
		//img_el.src = url;
		
	}
	
	
	

	
	
	worker.onmessage = function(message) {
		//console.log("received message fromm sqlite worker: ", message);
		//toc("Loading database from file");
		// Show the schema of the loaded database
		//editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
		//execEditorContents();
	};
	
	
	
	
	function worker_error(err){
		console.error("sqlite worker error: ", err);
	}
	
	// Run a command in the database
	function sqlite_execute(commands) {
		worker.onmessage = function (event) {
			var results = event.data.results;
			if (!results) {
				console.error({message: event.data.error});
				return;
			}

			sql_table.innerHTML = "";
			for (var i = 0; i < results.length; i++) {
				sql_table.appendChild(tableCreate(results[i].columns, results[i].values));
			}
		}
		worker.postMessage({ action: 'exec', sql: commands });
		sql_table.textContent = "Fetching results...";
	}
	
	// Create an HTML table
	var tableCreate = function () {
		function valconcat(vals, tagName) {
			if (vals.length === 0) return '';
			var open = '<' + tagName + '>', close = '</' + tagName + '>';
			return open + vals.join(close + open) + close;
		}
		return function (columns, values) {
			var tbl = document.createElement('table');
			var html = '<thead>' + valconcat(columns, 'th') + '</thead>';
			var rows = values.map(function (v) { return valconcat(v, 'td'); });
			html += '<tbody>' + valconcat(rows, 'tr') + '</tbody>';
			tbl.innerHTML = html;
			return tbl;
		}
	}();
	
	
	
	
	
	
	
	// Save the db to a file
	function savedb() {
		worker.onmessage = function (event) {
			//toc("Exporting the database");
			var arraybuff = event.data.buffer;
			var blob = new Blob([arraybuff]);
			var a = document.createElement("a");
			document.body.appendChild(a);
			a.href = window.URL.createObjectURL(blob);
			a.download = "sql.db";
			a.onclick = function () {
				setTimeout(function () {
					window.URL.revokeObjectURL(a.href);
				}, 1500);
			};
			a.click();
		};
		//tic();
		worker.postMessage({ action: 'export' });
	}
	//savedbElm.addEventListener("click", savedb, true);
	
	
}


/*
function check_if_script_exists(script_path){
	//console.log("in check_if_script_exists.  script_path: ", script_path);
	var scripts = document.getElementsByTagName("script");
	for (var i = 0; i < scripts.length; i++) {
		if (scripts[i].src) {
			//console.log(i, scripts[i].src)
			if(scripts[i].src == script_path){
				//console.log("Yes, the script exists in the page");
				return true
			}
		}
	}
	console.warn("No, the script does not yet exist in the page");
	return false
}
*/



// STRIP_HTML - strip_html is in index.html


function strip_markdown(md,options){
	//console.log("in strip_markdown. md, options: ", md, options)
    options = options || {};
    options.listUnicodeChar = options.hasOwnProperty('listUnicodeChar') ? options.listUnicodeChar : false;
    options.stripListLeaders = options.hasOwnProperty('stripListLeaders') ? options.stripListLeaders : true;
    options.gfm = options.hasOwnProperty('gfm') ? options.gfm : true;
    options.useImgAltText = options.hasOwnProperty('useImgAltText') ? options.useImgAltText : true;
    options.abbr = options.hasOwnProperty('abbr') ? options.abbr : false;
    options.replaceLinksWithURL = options.hasOwnProperty('replaceLinksWithURL') ? options.replaceLinksWithURL : false;
    options.htmlTagsToSkip = options.hasOwnProperty('htmlTagsToSkip') ? options.htmlTagsToSkip : [];

    var output = md || '';

    // Remove horizontal rules (stripListHeaders conflict with this rule, which is why it has been moved to the top)
    output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*/gm, '');

    try {
      if (options.stripListLeaders) {
        if (options.listUnicodeChar)
          output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, options.listUnicodeChar + ' $1');
        else
          output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, '$1');
      }
      if (options.gfm) {
        output = output
        // Header
          .replace(/\n={2,}/g, '\n')
          // Fenced codeblocks
          .replace(/~{3}.*\n/g, '')
          // Strikethrough
          .replace(/~~/g, '')
          // Fenced codeblocks
          .replace(/`{3}.*\n/g, '');
      }
      if (options.abbr) {
        // Remove abbreviations
        output = output.replace(/\*\[.*\]:.*\n/, '');
      }
      output = output
      // Remove HTML tags
        .replace(/<[^>]*>/g, '')

      var htmlReplaceRegex = new RegExp('<[^>]*>', 'g');
      if (options.htmlTagsToSkip.length > 0) {
        // Using negative lookahead. Eg. (?!sup|sub) will not match 'sup' and 'sub' tags.
        var joinedHtmlTagsToSkip = '(?!' + options.htmlTagsToSkip.join("|") + ')';

        // Adding the lookahead literal with the default regex for html. Eg./<(?!sup|sub)[^>]*>/ig
        htmlReplaceRegex = new RegExp(
            '<' +
            joinedHtmlTagsToSkip +
            '[^>]*>', 
            'ig'
        );
      }

      output = output
        // Remove HTML tags
        .replace(htmlReplaceRegex, '')
        // Remove setext-style headers
        .replace(/^[=\-]{2,}\s*$/g, '')
        // Remove footnotes?
        .replace(/\[\^.+?\](\: .*?$)?/g, '')
        .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
        // Remove images
        .replace(/\!\[(.*?)\][\[\(].*?[\]\)]/g, options.useImgAltText ? '$1' : '')
        // Remove inline links
        .replace(/\[([^\]]*?)\][\[\(].*?[\]\)]/g, options.replaceLinksWithURL ? '$2' : '$1')
        // Remove blockquotes
        .replace(/^\s{0,3}>\s?/gm, '')
        // .replace(/(^|\n)\s{0,3}>\s?/g, '\n\n')
        // Remove reference-style links?
        .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
        // Remove atx-style headers
        .replace(/^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} #{0,}(\n)?\s{0,}$/gm, '$1$2$3')
        // Remove * emphasis
        .replace(/([\*]+)(\S)(.*?\S)??\1/g, '$2$3')
        // Remove _ emphasis. Unlike *, _ emphasis gets rendered only if 
        //   1. Either there is a whitespace character before opening _ and after closing _.
        //   2. Or _ is at the start/end of the string.
        .replace(/(^|\W)([_]+)(\S)(.*?\S)??\2($|\W)/g, '$1$3$4$5')
        // Remove code blocks
        .replace(/(`{3,})(.*?)\1/gm, '$2')
        // Remove inline code
        .replace(/`(.+?)`/g, '$1')
        // // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
        // .replace(/\n{2,}/g, '\n\n')
        // // Remove newlines in a paragraph
        // .replace(/(\S+)\n\s*(\S+)/g, '$1 $2')
        // Replace strike through
        .replace(/~(.*?)~/g, '$1');
    } catch(e) {
      console.error("caught error in strip_markdown: ", e);
      return md;
    }
    return output;
}






// String similarity

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}


function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
window.capitalizeFirstLetter = capitalizeFirstLetter;



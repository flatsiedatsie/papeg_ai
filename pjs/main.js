
//let playground_just_started = true; // whether to show a document immediately, especially for mobile mode

// Set global counter variable to verify event instances
var nCounter = 0;

// Set up event handler to produce text for the window focus event
window.addEventListener("focus", function(event) 
{ 
    //flash_message("window has focus " + nCounter); 
	//console.log("window has focus " + nCounter);
    nCounter = nCounter + 1; 
	reload_vars();
}, false);

// Example of the blur event as opposed to focus
// window.addEventListener("blur", function(event) { 
// document.getElementById('message').innerHTML = "window lost focus"; }, 
// false);

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
		//console.log("window is no longer (partially) visible");
    } else {
		//console.log("window has become (partially) visible");
		reload_vars();
    }
});







function create_file(save=false,content='',desired_filename) {
	//console.log("in create_file.  \n - save: ", save, '\n - content: ', content, '\n - desired_filename: ', desired_filename);
	
 	return new Promise(function(resolve,reject) { // , reject
		//console.log("create_file: inside promise");
    	
		if(typeof desired_filename == 'string' && desired_filename.length){
			//console.log("create_file: a filename was provided: ", desired_filename);
			// New filename was provided, no need to ask the user for one
			suggested_filename = '';
			
			really_create_file(save,content,desired_filename)
			.then((value) => {
				//console.log("create_file: called really_create_file directly succesfully.  value: ", value);
				generate_ui();
				resolve(value);
			})
			.catch((err) => {
				console.error("create_file: calling really_create_file directly failed:  err: ", err);
				reject(err);
			})
		}
		else{
			//console.log("create_file: no filename provided, will ask user.");
			
			// Need to get a name from the user first
			
			if (suggested_filename == null || suggested_filename == ''){
				
				let potential_file_name = window.last_user_query;
				if(window.last_user_query.length > 80){
					potential_file_name =  window.last_user_query.substr(0,80);
				}
				if(potential_file_name == ''){
					potential_file_name = 'unnamed';
				}
				
				if(potential_file_name.indexOf('.') > 10){
					potential_file_name = potential_file_name.substr(0,potential_file_name.indexOf('.'));
				}
				if(potential_file_name.indexOf('?') > 10){
					potential_file_name = potential_file_name.substr(0,potential_file_name.indexOf('?'));
				}
				
				potential_file_name = potential_file_name.replace(/[@!^&\/\\#,+()$~%.'":*?<>{}]/g,'');
				
				if(potential_file_name.lastIndexOf(' ') > 20){
					potential_file_name = potential_file_name.substr(0,potential_file_name.lastIndexOf(' '));
				}
				potential_file_name = potential_file_name.trim();
				
				if(potential_file_name.length > 15 && potential_file_name.indexOf(' ') > 0){
					potential_file_name = potential_file_name.substr(potential_file_name.indexOf(' '));
					potential_file_name = potential_file_name.trim();
				}
				
				
				if(potential_file_name.length > 40){
					potential_file_name = potential_file_name.substr(potential_file_name.length - 40);
					
					if(potential_file_name.startsWith('What ')){
						potential_file_name = potential_file_name.replace('What ','');
					}
					if(potential_file_name.startsWith('How ')){
						potential_file_name = potential_file_name.replace('How ','');
					}
					if(potential_file_name.startsWith('When ')){
						potential_file_name = potential_file_name.replace('When ','');
					}
					if(potential_file_name.startsWith('Why ')){
						potential_file_name = potential_file_name.replace('Why ','');
					}
					if(potential_file_name.startsWith('Where ')){
						potential_file_name = potential_file_name.replace('Where ','');
					}
					if(potential_file_name.startsWith('is ')){
						potential_file_name = potential_file_name.replace('is ','');
					}
					if(potential_file_name.startsWith('was ')){
						potential_file_name = potential_file_name.replace('was ','');
					}
					if(potential_file_name.startsWith('does ')){
						potential_file_name = potential_file_name.replace('does ','');
					}
					if(potential_file_name.startsWith('do ')){
						potential_file_name = potential_file_name.replace('do ','');
					}
					if(potential_file_name.startsWith('can ')){
						potential_file_name = potential_file_name.replace('can ','');
					}
					if(potential_file_name.startsWith('the ')){
						potential_file_name = potential_file_name.replace('the ','');
					}
					if(potential_file_name.startsWith('a ')){
						potential_file_name = potential_file_name.replace('the ','');
					}
					if(potential_file_name.startsWith('I ')){
						potential_file_name = potential_file_name.replace('the ','');
					}
					if(potential_file_name.length > 15){
						let snipped_potential_file_name = potential_file_name.substr(10);
						if(snipped_potential_file_name.indexOf(' ') > 2){
							snipped_potential_file_name = snipped_potential_file_name.substr(0,snipped_potential_file_name.indexOf(' '));
						}
					
						//console.log("snipped_potential_file_name: ", snipped_potential_file_name);
						/*
					
						*/
						if(snipped_potential_file_name.length > 3){
							potential_file_name = potential_file_name.substr(0,10) + snipped_potential_file_name;
						}
						//+1,potential_file_name.length);
						
					}
					
				}
				
				if(potential_file_name.indexOf('.') == -1 || potential_file_name.lastIndexOf('.') < (potential_file_name.length - 10)){
					//console.log("filename did not have an extension yet");
					potential_file_name = potential_file_name; // + ".txt";
				}
				
				//console.log("filename suggestion already in files?", files, potential_file_name);
				
				if(!potential_file_name.endsWith('.txt') && typeof files[potential_file_name] == 'undefined' && typeof files[potential_file_name + '.txt'] == 'undefined'){
					suggested_filename = potential_file_name;
				}
				else if(potential_file_name.endsWith('.txt') && typeof files[potential_file_name] == 'undefined'){
					suggested_filename = potential_file_name;
				}
				else if(!potential_file_name.endsWith('.txt') && typeof files[potential_file_name + '.txt'] != 'undefined'){
					suggested_filename = potential_file_name + '_' + makeid(3); // + '.txt';
				}
				else if(potential_file_name.endsWith('.txt') && typeof files[potential_file_name] != 'undefined'){
					suggested_filename = potential_file_name.substr(0,(potential_file_name.length - 4)) + '_' + makeid(3); // + '.txt';
				}
				
				
				//suggested_filename = suggested_filename.toLowerCase();
			} 
			//console.log("create_file:  suggested_filename,files: ", suggested_filename, files);
			
			setTimeout(() => {
				let vex_dialog_input_el = document.querySelector('.vex-dialog-prompt-input');
				if(vex_dialog_input_el){
					//console.log("found the vex input element");
					vex_dialog_input_el.setSelectionRange(0, vex_dialog_input_el.value.length);
				}
			},10);
		    vex.dialog.prompt({
		        message: 'Provide file name',
				value:suggested_filename,
		        placeholder: 'File name',
		        callback: function (target_filename) {
					console.warn("in vex dialog callback");
					//console.log("create_file: suggested_filename: ", suggested_filename);
					reload_files_dict();
					/*
		            if(!valid_new_name(target_filename)) {
						flash_message("That file name is invalid or not allowed",3000,'fail');
						reject("That file name is invalid or not allowed");
						suggested_filename = '';
		                return false;
		            }
					*/
					
					if(typeof target_filename != 'string'){
						return
					}
					
					let allow_existing_name = false;
					if(typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint')){
						allow_existing_name = true;
					}
					
					extension_offset = target_filename.length - 1;
					if(target_filename.length > 10){
						extension_offset = 10;
					}
					if(target_filename.indexOf('.') == -1 || target_filename.lastIndexOf('.') < (target_filename.length - extension_offset) ){
						//console.log("target_filename did not have an extension yet");
						target_filename = target_filename + ".txt";
					}
					
					if(valid_new_name(target_filename, allow_existing_name)) {
						//console.log("create_file: user provided a valid target_filename: ", target_filename);
						
						// For AI chat
						try{
							if(typeof current_file_name == 'string' && allow_existing_name && typeof window.busy_doing_blueprint_task == 'boolean' && window.busy_doing_blueprint_task == false && typeof window.doc_text == 'string'){
								
								let create_document_command = '\n\n' + get_translation("create_a_new_document_called") + ' ' + target_filename + '\n\n';
								if(!window.doc_text.endsWith(create_document_command)){
									insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, create_document_command);
								}
								else{
									//console.log("blueprint already ended with a command to create this file");
								}
								
							}
						}
						catch(err){
							console.error("error adding open file string to blueprint file: ", err);
						}
						
						
						//console.log("calling really_create_file");
						really_create_file(save,content,target_filename)
						.then((value) => {
							//console.log("create_file: called really_create_file succesfully.  value: ", value);
							setTimeout(reload_vars,200);
							resolve(value);
						})
						.catch((err) => {
							console.error("create_file: calling really_create_file failed:  err: ", err);
							setTimeout(reload_vars,200);
							reject(err);
						})
					}
					
					
		        }
		    });
		}
		
	});
}

function really_create_file(save,content=null,target_filename=null,target_folder=null,quiet=false){
	//console.log("in really_create_file. save, content, target_filename, target_folder: ", save, content, target_filename, target_folder);
	
	if(content == null){
		console.warn("really_create_file: no content provided, falling back to using 'code' variable");
		content = "" + code;
	}
	
	return new Promise(function(resolve,reject) {
		
		if(typeof content != 'string'){
			console.error("really_create_file: aborting, content was not a string: ", typeof content, content);
			reject(null);
			return
		}
		
		
		let files_dict = files;
		
		if(typeof target_filename != 'string'){
			target_filename = current_file_name;
		}
		
		if(typeof target_folder != 'string'){
			target_folder = folder;
		}
		
		
		if(typeof target_folder == 'string'){
			
			let conversation_files = localStorage.getItem(target_folder + '_playground_files');
			if(typeof conversation_files == 'string'){
				files_dict = JSON.parse(conversation_files);
			}
			else{
				console.error("really_create_file: that target folder does not exist in local storage: ", target_folder);
				reject(null);
				return
			}
			
		}
		
		//console.log("really_create_file:  files_dict before: ", files_dict);
	
		suggested_filename = '';
		if(target_folder != "/Papeg_ai_conversations" && !target_filename.endsWith('_papeg_ai_conversation.json')){
	        current_file_name = target_filename;
			if(quiet == false){
				//console.log("really_create_file: setting last_opened as: ", folder + '_last_opened', current_file_name );
		        localStorage.setItem(folder + '_last_opened', current_file_name);
			}
		}
        
		
		
		files_dict[target_filename] = {'real':false,'loaded':true,'modified':false,'last_time_opened':Date.now()}; // , missing data.
		localStorage.setItem(target_folder + '_playground_files', JSON.stringify(files_dict));
		
		// for AI chat
		if(target_folder != "/Papeg_ai_conversations" && !target_filename.endsWith('_papeg_ai_conversation.json') && quiet == false){
			document.body.classList.add('show-document');
		}
		
        if(save) {
			//saving an update to an existing file
			//console.log("really_create_file: save was true, (also) storing content in browser: ", target_folder + '/' +  current_file_name, content);

			if(content != playground_saved_files[target_folder + '/' + target_filename]){
				//console.log("really_create_file: content was indeed different from the value in playground_saved_files: \n\n" + playground_saved_files[target_folder + '/' + target_filename] + "\n\n" + content);
				playground_saved_files[target_folder + '/' + target_filename] = content;
			}
			if(typeof playground_live_backups[target_folder + '/' + target_filename] != 'undefined'){
				console.warn("deleting playground_live_backups[target_folder + '/' + target_filename] because it was just saved into playground_save_files");
				delete playground_live_backups[target_folder + '/' + target_filename]
			}
			
			
			//playground_live_backups[target_folder + '/' + target_filename] = content; 
			
			//console.log("really_create_file: save was true. calling savr. target_filename, content: ", target_filename, content);
			savr(target_folder + '/playground_backup_' + target_filename, content)
			.then((value) => {
				//console.log("really_create_file: savr done.  value: ", value);
				return savr(target_folder + '/' + target_filename, content);
			})
			.then((value) => {
				//console.log("really_create_file: nested savr done.  value: ", value);
				
				if(target_folder != "/Papeg_ai_conversations" && !target_filename.endsWith('_papeg_ai_conversation.json') && quiet == false){
					window.settings.docs.open = {'folder':target_folder,'filename':target_filename};
					save_settings();
				}
				
				
				//scroll_to_end();
				
				resolve(value);
			})
			.catch((err) => {
				console.error("really_create_file: savr failed:  err: ", err);
				reject(err);
			})
			
		
        } else {
			// setting initial content of brand new file
			//console.log("really_create_file: save was false, so saving content (defaults to empty string) in local storage: ", target_folder + '/' + target_filename);
		
			playground_saved_files[target_folder + '/' + target_filename] = content;
			playground_live_backups[target_folder + '/' + target_filename] = content;
			
			if(target_folder != "/Papeg_ai_conversations" && !target_filename.endsWith('_papeg_ai_conversation.json')){
				editor_set_value(content);
			}
			
			//console.log("really_create_file: save was false. calling savr. target_filename,content: ", target_filename, content);
			
			// ATTEMPT TO SAVE SOME SPACE BY NOT IMMEDIATELY SAVING THE BACKUP VERSION TOO
			savr(target_folder + '/' + target_filename, content)
			.then((value) => {
				if(target_folder != "/Papeg_ai_conversations" && !target_filename.endsWith('_papeg_ai_conversation.json') && quiet == false){
					window.settings.docs.open = {'folder':target_folder,'filename':target_filename};
					save_settings();
				}
				
				window.doc_text = content;
				window.doc_length = window.doc_text.length;
				window.doc_selected_text = null;
				window.doc_line_nr = 0;
				window.doc_current_line_nr = 0;
				window.doc_selection = {'from':0,'to':0};
				
				settled();
				//scroll_to_end();
				
				resolve(value);
			})
			.catch((err) => {
				console.error("really_create_file: savr failed:  err: ", err);
				reject(err);
			})
			
			/*
			savr(target_folder + '/playground_backup_' + target_filename, content)
			.then((value) => {
				//console.log("really_create_file: savr done.  value: ", value);
				//console.log("really_create_file: calling nested savr, so save to non-backup version. target_filename, content: ", target_filename, content);
				return savr(target_folder + '/' + target_filename, content);
			})
			.then((value) => {
				//console.log("really_create_file: nested savr done.  value: ", value);
				
				if(target_folder != "/Papeg_ai_conversations" && !target_filename.endsWith('_papeg_ai_conversation.json') && quiet == false){
					window.settings.docs.open = {'folder':target_folder,'filename':target_filename};
					save_settings();
				}
				
				window.doc_text = content;
				window.doc_length = window.doc_text.length;
				window.doc_selected_text = null;
				window.doc_line_nr = 0;
				window.doc_current_line_nr = 0;
				window.doc_selection = {'from':0,'to':0};
				
				settled();
				//scroll_to_end();
				
				resolve(value);
			})
			.catch((err) => {
				console.error("really_create_file: savr failed:  err: ", err);
				reject(err);
			})
			*/

			/*

			playground_saved_files[folder + '/' + current_file_name] = content;
			savr(folder + '/' + current_file_name, content);

			playground_live_backups[folder + '/' + current_file_name] = content;
			savr(folder + '/playground_backup_' + current_file_name, content);
        	*/
			
			
        }
	
		//console.log("really_create_file:  files after: ", files);
	
        update_ui();
		
	});
}





function create_folder(save=false,folder_name=null){
	//console.log("in create_folder.  save,folder_name: ", save,folder_name);
	return new Promise((resolve, reject) => {
		
		function create_and_open_the_folder(target_folder){
			setTimeout(() => {
				//console.log("create_folder: target_folder: ", target_folder);
				target_folder = target_folder.replace('/','');
				//console.log("create_folder: target_folder: ", target_folder);
				if(typeof sub_folders[target_folder] == 'undefined'){
					update_sub_folders('add',target_folder);
					//console.log("create_folder: sub_folders: ", sub_folders);
					document.body.classList.remove('show-document');
				}

				//console.log("create_folder: folder before: ", folder);
				
				folder_path('add',target_folder);
				//console.log("create_folder: folder after: ", folder);
				document.body.classList.add('has-folder');
				//let new_folder_path = folder_parts.join('/');
	
				//folder = folder_path('add',value);
				//change_folder(value,'browser');
				//open_folder(null,'browser');
				open_folder(folder,'browser');
				/*
				.then((value) => {
					resolve(folder);
				})
				.catch((err) => {
					console.error("create_folder: caught error opening the new folder: ", err);
					reject();
				
				})
				*/
		
				localStorage.setItem(folder + '_last_opened', unsaved_file_name);
				resolve(folder);
			},1);
		}
		
		if(typeof folder_name != 'string'){
		    vex.dialog.prompt({
		        message: 'Provide folder name',
		        placeholder: 'Folder name',
		        callback: function (target_folder) {
		            if(!valid_new_name(target_folder) ){
		                //vex.dialog.alert("That folder name is invalid or not allowed");
						/*
						if(target_folder == ''){
							flash_message("That folder name is invalid or not allowed",3000,'fail');
						}
						else{
							flash_message("That folder name is invalid or not allowed",3000,'fail');
						}
						*/
						flash_message("That folder name is invalid or not allowed",3000,'fail');
						reject();
		                return false;
		            }
		            //console.log("create_folder: user provided new folder name: ", target_folder);
					//console.log("create_folder: folder and files before: ", folder, files);
					create_and_open_the_folder(target_folder);
					resolve(target_folder);
					// for some reason calling folder_path() here fails
			
		        }
		    });
			//change_folder(value);
		}
		else{
			//console.log("create_folder: using the provided folder name: ", folder_name);
			if(valid_new_name(folder_name)){
				create_and_open_the_folder(folder_name);
				resolve(folder_name);
			}
			else{
				console.error("create_folder: error, invalid new folder name: ", folder_name);
				reject();
			}
			
		}
	});
    
}









function update_sub_folders(action='',folder_list=[]){
	//console.log("in update_sub_folders.  action,folder_list: ", action,folder_list);
	if(typeof folder_list == 'string'){
		
		folder_list = [folder_list];
		//console.log("turning folder_list string into an array: ", folder_list);
	}
	
	let sub_folders_dict = localStorage.getItem(folder + '_playground_sub_folders');
	if(sub_folders_dict == null){
		//console.log("update_sub_folders: no existing sub_folders data");
		sub_folders_dict = {};
	}
	else if(typeof sub_folders_dict == 'string'){
		
		sub_folders_dict = JSON.parse(sub_folders_dict);
		//console.log("update_sub_folders: loaded existing sub_folders data: ", sub_folders_dict);
		
	}
	else{
		console.error("update_sub_folders: unexpected error");
	}
	
	for(let o = 0; o < folder_list.length; o++){
		if(action == 'add'){
			
			if(typeof sub_folders_dict[ folder_list[o] ] == 'undefined'){ //}.includes(folder_list[o])){
				//console.log("update_sub_folders: adding: ", folder_list[o], ', to: ', sub_folders_dict);
				sub_folders_dict[ folder_list[o] ] = {'real':false,'loaded':false,'modified':false}
				//sub_folders_list.push(folder_list[o]);
			}
		}
		else if(action == 'remove'){
			//if(typeof sub_folders_dict[folder_list[o]] == 'undefined'){
			if(typeof sub_folders_dict[ folder_list[o] ] != 'undefined'){
				//console.log("update_sub_folders: deleting: ", folder_list[o], ', from: ', sub_folders_dict);
				delete sub_folders_dict[ folder_list[o] ];
			}
		}
	}
	sub_folders = sub_folders_dict;
	//console.log("update_sub_folders: updated sub_folders: ", sub_folders_dict);
	localStorage.setItem(folder + '_playground_sub_folders', JSON.stringify(sub_folders_dict));
	//console.log("update_sub_folder: calling update_ui (BLOCKED)");
	//update_ui();
}


function add_sub_folder(folder_base_path,folder_name){
	//console.log("in add_sub_folder.  folder_base_path,folder_name: ", folder_base_path,folder_name);
	
	if(typeof folder_base_path != 'string' || typeof folder_name != 'string'){
		return false
	}
	if(folder_name == ''){
		return
	}
	if(folder_base_path.startsWith('/')){
		folder_base_path = folder_base_path.substr(1);
	}
	
	let sub_folders_dict = localStorage.getItem(folder_base_path + '_playground_sub_folders');
	if(sub_folders_dict == null){
		//console.log("add_sub_folder: no existing sub_folders data");
		sub_folders_dict = {};
	}
	else if(typeof sub_folders_dict == 'string'){
		sub_folders_dict = JSON.parse(sub_folders_dict);
		//console.log("add_sub_folder: loaded existing sub_folders data: ", sub_folders_dict);
	}
	else{
		console.error("add_sub_folder: unexptected error");
	}
	
	if(typeof sub_folders_dict[ folder_name ] == 'undefined'){ //}.includes(folder_list[o])){
		//console.log("update_sub_folders: adding: ", folder_name, ', to: ', sub_folders_dict);
		sub_folders_dict[ folder_name ] = {'real':false,'loaded':false,'modified':false}
	}
	//console.log("add_sub_folder: updated sub_folders: ", sub_folders_dict);
	localStorage.setItem(folder_base_path + '_playground_sub_folders', JSON.stringify(sub_folders_dict));
}




// change folder name
function change_folder(new_folder_name){
	//console.log("\n\n\n\n.\n..\n...\nchange_folder.  new_folder_name: ", new_folder_name);
	if(typeof new_folder_name == 'string'){
		folder_path('add',new_folder_name);
		open_folder(folder);
	}
	else{
		console.error('change_folder: invalid input: ', typeof new_folder_name, new_folder_name);
	}
}



function open_folder(target_folder=null, intensity='production'){
	//console.log("\n\n-\n--\n--- OPEN FOLDER: ", target_folder, "  \n--\n-\n");
	//console.log("in open_folder.  target_folder, intensity: ", target_folder, intensity);
	
	const before_time = Date.now();
	
	if(typeof intensity == 'string' && intensity == 'production' && serverless){
		intensity = 'browser';
	}
	
	clear_output();
	hide_all_context_menus();
	
	//console.log("open_folder clear and hide took this long: ", Date.now() - before_time);
	
	if(target_folder == null){
		folder = folder_path('get');
	}
	else{
		folder_path('parse',target_folder);
		if(folder != target_folder){
			console.warn("open_folder: parsed folder path was different from input: ", target_folder , ' -> ', folder);
		}
	}
	//console.log("open_folder: target_folder, folder: ", target_folder, folder);
	
	if(folder == null){
		folder = folder_path('get');
	}
	
	//get_folder_meta(null,'load'); // updates folder_meta. Not really used for anything while in the folder.
	//update_sub_folders();
	reload_folder_dict();
	
	// is there a snapshot for this folder?
	reload_snapshots_meta();
	
	//console.log("open_folder: + reload folder dict and reload snapshots_meta took this long: ", Date.now() - before_time);
	
	// What was the last opened file in this folder?
	current_file_name = localStorage.getItem(folder + '_last_opened');
	if(current_file_name == null){
		current_file_name = unsaved_file_name;
	}
	if(typeof current_file_name != 'string'){
		console.error("open_folder: current_file_name was not a string! Setting it to unsaved_file_name: ", typeof current_file_name, current_file_name, " -> ", typeof unsaved_file_name, unsaved_file_name);
		current_file_name = unsaved_file_name;
		
	}
	
	//console.log("open_folder: last opened filename: ", current_file_name);
	
	
	reload_files_dict();
	//console.log("open_folder: reloaded files: ", files);
	//console.log("open_folder: playground_live_backups:\n", playground_live_backups);
	//console.log("open_folder: playground_saved_files:\n", playground_saved_files);
	
	
	if(serverless && typeof files[current_file_name] == 'undefined'){
		if(current_file_name != unsaved_file_name){
			console.error("open_folder: have to fix issue where current_file_name was not in files dict for this folder:\n- folder:", folder, "\n- (missing) current_file_name: ", current_file_name, "\n- files:",files);
		}
		function_index_el.innerHTML = '';
		if(keyz(files).length==0){
			current_file_name = unsaved_file_name;
		}
		else{
			let alt_filename = keyz(files)[0];
			console.error("open_folder: setting current filename to alt_filename: ", alt_filename);
			if(typeof alt_filename == 'string' && alt_filename.length){
				current_file_name = files[ alt_filename ];
			}
			else{
				current_file_name = unsaved_file_name;
			}
		}
		if(typeof current_file_name == 'string'){
			localStorage.setItem(folder + '_last_opened', current_file_name);
		}
		
	}
		
	
	if(current_file_name == unsaved_file_name){
		window.settings.docs.open = null;
	}
	else if(typeof folder == 'string' && typeof current_file_name == 'string'){
		window.settings.docs.open = {'folder':folder,'filename':current_file_name};
	}
	

	if(typeof folder == 'string' && folder != unsaved_folder_name && !serverless && intensity != 'browser'){
		ajax()
		.then(function(value) {
			return open_file();
		})
		.then(function(value) {
			//console.log("\n\n\n\n\nopen_folder: in  open_file().then, HURRAY.  current_file_name: ", current_file_name); //  value: ", value
			update_ui();
		})
		.catch(function(err) {
			console.error("open_folder: caught open_file.then error: ", err);
			update_ui();
		});
		
	}
	else if(typeof current_file_name == 'string' && current_file_name != unsaved_file_name){
		//console.log("open_folder: not calling ajax for latest files list of real folders.  calling open_file(). folder,current_file_name: ", folder, current_file_name);
		open_file()
		.then(function(value) {
			//console.log("\n\n\n\n\nopen_folder: in  open_file().then, HURRAY.  current_file_name: ", current_file_name); //  value: ", value
			update_ui();
		})
		.catch(function(err) {
			console.error("open_folder: caught open_file.then error: ", err);
			update_ui();
		});
		
	}
	else{
		//console.log("open folder fizzled out. current_file_name: ", current_file_name);
		document.body.classList.remove('show-document');
		update_ui();
	}
}



function delete_file(target_filename=null,intensity=null,target_folder=null){
	//console.log("in delete_file.  target_filename,intensity,target_folder: ", target_filename,intensity,target_folder);
	if(target_folder == null){
		target_folder = folder;
	}
	if(intensity == null){intensity = 'beta'}
	//console.log("in delete_file.  target_filename,intensity: ", target_filename, intensity);
	if(target_filename == null){
		target_filename = current_file_name;
	}
	if(target_filename == unsaved_file_name){
		console.error("cannot delete notepad"); // Why not? could be a way to clear it.
		return;
	}
	
	reload_files_dict();
	reload_trash();
	if(trash.length > 5){
		trash = trash.slice(0,4);
	}
	let timestamp = Date.now();
	let new_trash = {'timestamp':timestamp,
			'folder':target_folder,
			'filename':target_filename,
			'intensity':intensity
	}
	
	
	
	
	let target_path = target_folder + '/' + target_filename;
	
	// SAVE A BACKUP TO THE TRASH
	if(typeof playground_live_backups[target_path] == 'string' && !playground_live_backups[target_path].startsWith('_PLAYGROUND_BINARY_')){
		new_trash['data'] = playground_live_backups[target_path];
	}
	else if(typeof playground_saved_files[target_path] == 'string' && !playground_saved_files[target_path].startsWith('_PLAYGROUND_BINARY_')){
		if(typeof new_trash['data'] == 'undefined'){
			new_trash['data'] = playground_saved_files[target_path];
		}
	}
	
	
	if(typeof playground_live_backups[target_path] != 'undefined'){
		delete playground_live_backups[target_path];
	}
	
	if(typeof playground_saved_files[target_path] != 'undefined'){
		delete playground_saved_files[target_path];
	}
	/*
	if(typeof new_trash['data'] != 'undefined'){
		//console.log("adding file to trash");
		trash.push(new_trash);
	}
	else{
		console.error("delete_file: could not save deleted file to trash: ", target_path);
	}
	*/
	
	// delete real file in beta or production
	let beta_location = beta_folder;
	if( ! target_folder.startsWith('/') && ! beta_location.endsWith('/')){
		beta_location += '/';
	}
	if(beta_location.startsWith('/')){
		beta_location = beta_location.substr(1);
	}
	if(intensity == 'production'){
		beta_location = '';
	}
	//console.log("delete_file: beta_location + target_folder: ", beta_location + target_folder);
	
	let target_files_dict = get_files_dict(target_folder);
	let old_index = null;
	let filename_to_switch_to = null;
	
	if(typeof target_files_dict[target_filename] != 'undefined'){
		if(target_folder == folder && keyz(target_files_dict).length > 1){
			old_index = keyz(target_files_dict).indexOf(target_filename);
			if(old_index > 0){
				filename_to_switch_to = keyz(target_files_dict)[old_index - 1];
			}
		}
		
		delete target_files_dict[target_filename];
		//console.log("deleted from files: ", target_folder + '/' + target_filename, JSON.stringify(target_files_dict,null,2));
		localStorage.setItem(target_folder + '_playground_files', JSON.stringify(target_files_dict));
	}
	else{
		console.error('delete_file: that file was not in files dict: ', target_filename);
	}
	
	
	
	
	if(window.settings.docs.open != null && typeof window.settings.docs.open.filename == 'string' && window.settings.docs.open.filename == target_filename && typeof window.settings.docs.open.folder == 'string' && window.settings.docs.open.folder == target_folder){
		if(typeof filename_to_switch_to == 'string'){
			window.settings.docs.open = {'folder':target_folder,'filename':filename_to_switch_to}
		}
		else{
			window.settings.docs.open = null;
		}
		save_settings();
	}
	
	
	console.error("- files: ", files);
	
	
	
	//delete files[current_file_name];
	//localStorage.setItem(target_folder + '_playground_files', JSON.stringify(files));
	
	current_file_name = unsaved_file_name;
	
	if(old_index != -1 && keyz(files).length){
		if(keyz(files).length >= old_index && old_index != 0){
			old_index = old_index - 1;
		}
		const new_open_filename = keyz(files)[old_index];
		localStorage.setItem(folder + '_last_opened', new_open_filename);
		open_file(new_open_filename);
	}
	else{
		localStorage.setItem(folder + '_last_opened',unsaved_file_name);
	}
	
	
	document.body.classList.remove('show-document');
	update_ui();
	
	
	
 	return new Promise(function(resolve,reject) { // , reject
		//console.log("delete_file: inside promise");
		
		deletr(target_path)
		.then((value) => {
			//console.log("delete_file: deletr 1 done: deleted saved file data from db", value);
			//resolve(true);
			return deletr(target_folder + '/playground_backup_' + target_filename);
		})
		.then((value) => {
			//console.log("delete_file: deletr 2 done: deleted /playground_backup_etc from db. ", value);
			
			if(intensity == 'browser' || serverless == true){
				//console.log("delete_file: not deleting real files");
				resolve(true);
				return true;
			}
			else{
				//console.log("delete file: calling ajax to delete file in beta folder");
				return ajax('delete_file',{
					'folder':beta_location + target_folder + '/',
					'target_file':target_filename
				})
			}
			
		})
		.then((value) => {
			//console.log("delete_file: ajax response: ", value);
			resolve(true);
		})
		.catch((err) =>{
			flash_message("Error deleting file: " + target_filename, 3000,'fail');
			console.error("delete_file: error deleting file: ", err);
			reject(false);
		})
		
	});
	
}



function delete_folder(target_folder=null,intensity=null){
	//console.log("in delete_folder.  target_folder: ", target_folder);
	
	
	if(typeof target_folder != 'string'){
		flash_message('Cannot delete unspecified folder',2000,'fail');
		return
	}
	if(target_folder == ''){
		flash_message('Cannot delete root folder',2000,'fail');
		return
	}
	
	if(intensity == null){
		intensity = 'beta';
	}
	
	
	
	
	for (const [key, value] of Object.entries(playground_live_backups)) {
		//console.log("delete_folder: key starts with target_folder? ", key, target_folder);
		if(key.startsWith(target_folder)){
			//console.log("delete_folder: deleting from playground_live_backups and db: ", key);
			delete playground_live_backups[key];
			let db_key_list = key.split('/');
			//console.log("delete_folder:  db_key_list: ", db_key_list);
			let short_file_name = db_key_list[db_key_list.length-1];
			db_key_list[db_key_list.length-1] = 'playground_backup_' + db_key_list[db_key_list.length-1];
			let db_key = db_key_list.join('/');
			let folder_path = key.replace(short_file_name,'');
			//console.log("delete_folder:  folder_path: ", folder_path);
			let folder_files = get_files_dict(folder_path);
			if(folder_files[short_file_name] != 'undefined'){
				//console.log("removing file from files dict: ", folder_path, short_file_name, folder_files);
				delete folder_files[short_file_name];
				localStorage.setItem(folder_path + '_playground_files', JSON.stringify(folder_files));
			}
			else{
				console.error("could not find filename in folder files dict.  folder_path, short_file_name, folder_files: ", folder_path, short_file_name, folder_files );
			}
			
			//console.log("delete_folder:  playground_backup_ db_key: ", db_key);
			deletr(db_key);
		}
		
	}
	for (const [key, value] of Object.entries(playground_saved_files)) {
		//console.log("key starts with target_folder? ", key, target_folder);
		if(key.startsWith(target_folder)){
			//console.log("delete_folder: deleting from playground_saved_files and db: ", key);
			delete playground_saved_files[key];
			deletr(key);
		}
	}
	
	//console.log("delete_folder: calling update_sub_folders with target_folder: ", target_folder);
	update_sub_folders('remove',target_folder.replace('/',''));
	
	
	const items = { ...localStorage };
	const local_storage_keys = keyz(items);
	//console.log("delete_folder: localStorage items, keys: ", items, local_storage_keys);
	for(let ls = 0; ls < local_storage_keys.length; ls++){
		//console.log("delete_folder: localStorage key: ", local_storage_keys[ls]);
		if(local_storage_keys[ls].startsWith('/')){
			if(local_storage_keys[ls].startsWith(target_folder)){
				//console.log("delete_folder: local_storage_keys[ls]: ", local_storage_keys[ls]);
				localStorage.removeItem(local_storage_keys[ls]);
			}
		}
	}
	
	// delete beta
	if(!serverless){
		let beta_location = beta_folder;
		if(beta_location.startsWith('/')){
			beta_location = beta_location.substr(1); // this is silly, beta_folder is predefined
		}
		if( ! beta_location.endsWith('/')){
			beta_location += '/';
		}
		console.warn("delete_folder: deleting beta folder: ", beta_location + target_folder + '/');
		ajax('delete_dir',{
			'folder': beta_location + target_folder + '/'
		})
		.then((value) => {
			//console.log("\n\n\ndelete_folder: ajax beta delete_dir response: ", value);
		})
		.catch((err) => {
			console.error("\n\n\ndelete_folder: ajax beta delete_dir failed: ", err);
		})
	
	
		// delete production
		if(intensity == 'production'){
		
			console.warn("delete_folder: deleting production folder: ", beta_location + target_folder + '/');
			ajax('delete_dir',{
				'folder': beta_location + target_folder + '/'
			})
			.then((value) => {
				//console.log("\n\n\ndelete_folder: ajax production delete_dir response: ", value);
				update_sub_folders('remove',short_folder_name);
			})
			.catch((err) => {
				console.error("\n\n\ndelete_folder: ajax production delete_dir failed: ", err);
			})
		}
	}
	
}





// load_type 'latest': if a live_backup exists, load that. It not, if a saved loaded file exists in the DB, get that. And so forth.
// load_type 'saved': if a saved loaded file exists in the DB, get that
// load_type 'outside': (re)load the actual real file.
// should first open a new folder if the file target is in a different folder
function open_file(target_filename=null,load_type=null,target_folder=null,save=false){
	if(load_type==null){load_type='latest'}
	//console.log("___\n|   |   OPEN FILE " + target_filename + " (" + load_type + ")\n----");
	//console.log("in open_file.  target_filename,load_type,target_folder: ", target_filename,load_type,target_folder);
	//console.log("- files: ", typeof files, files);
	document.body.classList.add("loading-file");
	let loaded_data = null;
	/*
	setTimeout(() => {
		
	},200);
	*/
	
	const before_time = Date.now();
	
	
 	return new Promise(function(resolve,reject) { // , reject
		//console.log("open_file: inside promise. load_type: ", load_type);
	
		//console.log("open_file: clearing code output");
		codeOutput.innerHTML = '';
		playground_overlay_el.innerHTML = '';
		
		//update_function_list(); // clears function list
		function_index_el.innerHTML = '';
		
		
		
		
		if(diff_el != null){
			diff_el.remove();
			diff_el = null;
		}
	
		//reset_line_bookmark();
	
		//let my_files = files;
	
		if(target_folder == null){
			target_folder = folder;
		}
		else if(target_folder != folder){
			console.warn("opening file in another folder, which means switching to that folder.  folder, target_folder, target_filename: ", folder, " --> ", target_folder, target_filename);
			folder_path('parse',target_folder);
			//console.log("open_file: folder should now be target_folder: ", folder, target_folder);
		}
		reload_files_dict();
		
		//console.log("open_file: + yet another reload files dict took this long: ", Date.now() - before_time);
		
		//console.log("open_file: reloaded files dict: ", files);
		//console.log("open_file:  folder,target_folder: ",folder,target_folder);
		//typeof files[current_file_name].modified !== 'undefined' && files[current_file_name].modified == true
		if(target_filename == null){
			//target_filename = current_file_name;
		    let possible_last_opened_file = localStorage.getItem(target_folder + '_last_opened');
		    if(typeof(possible_last_opened_file) == 'string' && typeof files[possible_last_opened_file] != 'undefined'){
				//console.log("open_file: found last opened file name in local storage: ", possible_last_opened_file);
				target_filename = possible_last_opened_file;
		    }
			else{
				//console.log("open_file: did not find last opened file name in local storage. Will use unsaved_file_name (BLOCKED):  ", unsaved_file_name);
				//console.log("files in this folder: ", files);
				
				if(keyz(files).length){
					//target_filename = keyz(files)[0];
					//update_ui();
				}
				else{
					//update_ui();
				}
				localStorage.setItem(target_folder + '_last_opened',null);
				target_filename = unsaved_file_name;
				
				//reject(null);
				//return
				
			}
		}
		
		// For Scribe voice dictation
		if(target_filename != current_file_name){
			//window.last_verified_speaker = null;
		}
		
		// make sure target file name is valid
		if(keyz(files).includes(target_filename)){ //  || target_filename == unsaved_file_name // Removed for AI chat project
			//console.log("open_file: OK, found target_filename in files: ", target_filename, files);
			current_file_name = target_filename;
			//console.log("open_file: current_file_name is now: ", current_file_name);
		}
		else{
			console.error("\n\n\nopen_file: no valid target_filename provided.  target_filename not in files: ", target_filename, files);
			current_file_name = unsaved_file_name;
		}
	
	
		// Additions for AI chat project
		if(typeof current_file_name == 'string' && current_file_name == unsaved_file_name){
			window.settings.docs.open = null;
		}
		else if(typeof folder == 'string' && typeof current_file_name == 'string'){
			window.settings.docs.open = {'folder':folder,'filename':current_file_name};
		}
		else{
			console.warn("open_file: current_file_name is (not yet) not a string: ", current_file_name);x
		}
	
	
		// Additions for AI chat project
		if(typeof current_file_name == 'string' && current_file_name == unsaved_file_name){
			console.error("open_file: almost opened notepad");
			document.body.classList.remove('show-document');
			window.active_destination = 'chat';
			
			if(typeof files[unsaved_file_name] != 'undefined'){
				console.warn("open_file: spotted unsaved_file_name in files dict. Removing it.");
				delete files[unsaved_file_name];
				localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
				
			}
			
			if(serverless && target_folder == folder && typeof files[current_file_name] == 'undefined'){
				console.error("open_folder: have to fix issue where current_file_name was not in files dict for this folder. target_folder, current_file_name, files: ", folder, current_file_name, files);
				
			
				// attempt switching current file to the first available one instead
				if(keyz(files).length == 0){
					console.error("open_file: could not find file in files! In fact, files list is empty!");
					console.error("open_folder: having to set unsaved_file_name as the _last_opened filename for this empty target_folder: ", target_folder, unsaved_file_name);
					current_file_name = unsaved_file_name; // was already this..
					target_filename = unsaved_file_name; 
					//localStorage.setItem(target_folder + '_last_opened', unsaved_file_name);
					localStorage.setItem(target_folder + '_last_opened', null);
					document.body.classList.remove('show-document');
					//console.log("open_file: + not opening unsaved_file_name.  took this long: ", Date.now() - before_time);
					
					reject(null);
					return
				}
				else{
					console.error("open_file: could not find file in files! have to switch to another file");
					//console.log("open_file: + discovering missing file took this long: ", Date.now() - before_time);
					//current_file_name = files[ keyz(files)[0] ];
					//target_filename = files[ keyz(files)[0] ];
					open_file(keyz(files)[0])
					.then((value) => {
						console.error("open_folder: setting the first file as the new _last_opened file: ", current_file_name);
						//localStorage.setItem(target_folder + '_last_opened', keyz(files)[0]);
						//console.log("open_file: discovering missing file and opening a new one took this long: ", Date.now() - before_time);
						resolve(value);
					})
					.catch((err) => {
						console.error("open_file: failed to switch to different file after not finding the desired file in the files dict");
						//localStorage.setItem(target_folder + '_last_opened', unsaved_file_name);
						localStorage.setItem(target_folder + '_last_opened', null);
						reject(null);
					});
					return
					
				}
				
			}
			else{
				console.error("open_file: fell through");
				reject(null);
				return
			}
			
			
		}
	
		/*
		if(typeof current_file_name != 'string'){
			console.error("open_file: ERROR, current_file_name was not a string?: ", current_file_name);
			reject(null);
			return
		}
	
		*/
	
	

		let current_file_path = target_folder + '/' + current_file_name;
		//console.log("open_file: current_file_path: ", current_file_path);

		// remember the last opened file name
		//console.log("open_file: setting last_opened to: ", current_file_name);
		localStorage.setItem(target_folder + '_last_opened', current_file_name);
	
	
		// For Chat AI project
		window.settings.docs.open = {'folder':target_folder,'filename':current_file_name};
		save_settings();
	
	
	
	
	
 		//console.log("load_type is still?: ", load_type );
		
		
		// IGNORE THIS ONE, it creates the notepad
		// if the file is new, make sure the unsaved file has some initial data
		/*
		if(load_type == 'latest' && typeof playground_live_backups[target_folder + '/' + unsaved_file_name] == 'undefined'){
			//console.log("notepad was not in playground_live_backups yet");
			playground_live_backups[target_folder + '/' + unsaved_file_name] = '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n';
			savr(target_folder + '/playground_backup_' + unsaved_file_name, playground_live_backups[target_folder + '/' + unsaved_file_name])
			.then((value) => {
				//console.log("open_file: creating initial notepad succeeded.  value: ", value);
				//resolve(value);
				//return;
			})
			.catch((err) => {
				console.error("open_file: creating initial notepad failed: savr reject with:  err: ", err);
				//reject(null);
				//return;
			})
		}
		*/
		
		//console.log("load_type is still?: ", load_type );
	
	
		// NEW: to save memory, for a binary file, currently only a hint that the file exists is now stored in playground_live_backups. The hint is a string that normally also starts longer strings that encode binary files: '_PLAYGROUND_BINARY_'
		
		
		// TODO: maybe also skip directly to loading the saved version of binary files if the load_type is backup? Then again, users could edit images, in which case a backup might be useful? Or are those saved directly anyway?
		if(load_type == 'latest' && typeof current_file_name == 'string' && typeof playground_live_backups[current_file_path] == 'string' && !playground_live_backups[current_file_path].startsWith('_PLAYGROUND_BINARY_') ){ // window.filename_is_binary(current_file_name) &&
			//console.log("open_file: seems to be loading a binary file. Should skip directly to the saved version.  current_file_name: ", current_file_name, current_file_path);
			
			editor_set_value(playground_live_backups[current_file_path]);
			resolve(playground_live_backups[current_file_path]);
			return playground_live_backups[current_file_path];
			
		}
		else if(load_type == 'latest' && typeof current_file_name == 'string' && typeof playground_saved_files[current_file_path] == 'string' && !playground_saved_files[current_file_path].startsWith('_PLAYGROUND_BINARY_') ){ // window.filename_is_binary(current_file_name) &&
			//console.log("open_file: seems to be loading a binary file. Should skip directly to the saved version.  current_file_name: ", current_file_name, current_file_path);
			
			editor_set_value(playground_saved_files[current_file_path]);
			resolve(playground_saved_files[current_file_path]);
			return playground_saved_files[current_file_path];
			
		}
		else if(load_type == 'latest' && typeof current_file_name == 'string' && typeof playground_live_backups[current_file_path] == 'string' && playground_live_backups[current_file_path] == '_PLAYGROUND_BINARY_'){ // window.filename_is_binary(current_file_name) &&
			//console.log("open_file: seems to be loading a binary file. Should skip directly to the saved version.  current_file_name: ", current_file_name, current_file_path);
			
			if(typeof playground_saved_files[current_file_path] == 'string' && playground_saved_files[current_file_path].startsWith('_PLAYGROUND_BINARY_') && !playground_saved_files[current_file_path].endsWith('_PLAYGROUND_BINARY_')){ // if it starts with '_PLAYGROUND_BINARY_' but does not end with it, that means there is actual loaded binary data in playground_saved_files.
				//console.log("open_file: OK, the file was already saved in playground_saved_files because it was opened before");
				editor_set_value(playground_saved_files[current_file_path]);
				resolve(playground_saved_files[current_file_path]);
				return playground_saved_files[current_file_path];
			}
			else{
				//console.log("open_file: the binary file did not already exist in playground_saved_files. calling load_saved");
				_load_saved();
			}
			
		}
		else if(load_type == 'latest' && typeof current_file_name == 'string' && typeof playground_saved_files[current_file_path] == 'string' && playground_saved_files[current_file_path].startsWith('_PLAYGROUND_BINARY_') && !playground_saved_files[current_file_path].endsWith('_PLAYGROUND_BINARY_') ){ // window.filename_is_binary(current_file_name) &&
			//console.log("open_file: seems to be loading a binary file. Should skip directly to the saved version.  current_file_name: ", current_file_name, current_file_path);
			editor_set_value(playground_saved_files[current_file_path]);
			resolve(playground_saved_files[current_file_path]);
			return playground_saved_files[current_file_path];
			
		}
		else if(load_type == 'latest' && typeof current_file_name == 'string' && typeof playground_saved_files[current_file_path] == 'string' && playground_saved_files[current_file_path] == '_PLAYGROUND_BINARY_'){ // window.filename_is_binary(current_file_name) &&
			//console.log("open_file: seems to be loading a binary file. Should skip directly to the saved version.  current_file_name: ", current_file_name, current_file_path);
			_load_saved();
			
		}
		else if(load_type == 'backup' || load_type == 'latest'){
			document.body.classList.add('loading-file');
			_load_backup();
		}
		else if(load_type == 'saved'){
			document.body.classList.add('loading-file');
			_load_saved();
		}
		else if(load_type == 'outside'){
			document.body.classList.add('loading-file');
			_load_outside();
		}
		else{
			console.error("load_type fell through");
		}
		
		function _load_backup(){
			
			//if(load_type == 'latest' && typeof playground_live_backups[current_file_name] !== 'undefined'){
			
			// Most often just open data in playground_live_backups.. It should be the latest data.
			// Added '!window.filename_is_binary(current_file_name' check so that binary files are always loaded from the indexDB
				
			
				
			if(load_type == 'latest' && typeof playground_live_backups[current_file_path] == 'string' && playground_live_backups[current_file_path] != '_PLAYGROUND_BINARY_' && typeof current_file_name == 'string'  ){ // && !window.filename_is_binary(current_file_name)){
				//console.log("open_file: type was latest, and found the filename in live_backups. Using that data: ", current_file_path, typeof playground_live_backups[current_file_path], "-->",playground_live_backups[current_file_path],"<--");
				editor_set_value(playground_live_backups[current_file_path]);
				resolve(playground_live_backups[current_file_path]);
				//update_ui();
				return;
			}
			// Loading the live backup data form DB (if file path not in playground_live_backups var, or if forced (although they should be the same))
			else if( (load_type == 'backup' || load_type == 'latest') ){ // && typeof files[current_file_name].modified !== 'undefined' && files[current_file_name].modified == true
				if(load_type == 'backup'){
					console.error("open_file: IF YOU SEE ME, THEN THERE WAS NO DATA IN PLAYGROUND_LIVE_BACKUPS. For binary files this can happen. For text files this is unexpected.");
				}
				//console.log("open_file: restoring live_backup code for current_file_name from DB: ", current_file_name);
				//console.log("open_file: trying to open saved/loaded file: ", folder + '/playground_backup_' + current_file_name);
			
				//console.warn("open_file: no data for this file in playground_live_backups, or purposefully going back to database data (which is strange, should be the same as in playground_live_backups)");
				
				setr(folder + '/playground_backup_' + current_file_name, files[current_file_name])
				.then((value) => {
					//console.log("open_file: _load_backup: A live backup was found in DB. setr returned value.  current_file_name,value: ", current_file_name, value);
					// A live-backup seems available, so loading that.
					
					if(value == '_PLAYGROUND_BINARY_'){
						console.warn("setr returned a value, but it's '_PLAYGROUND_BINARY_', so that's not good");
						_load_saved();
					}
					else{
						resolve(value);
						return;
						
					}
					//update_ui();
					//clear_output();
					
				})
				.catch((err) => {
					
					//console.error("open_file: caught calling setr error (promise returned null? no saved backup?).  err:", err);
				
					if(load_type == 'backup'){
						flash_message("could not restore live backup of " + current_file_name, 3000,'fail');
						reject(null);
						return;
					}
					else{
						//console.log("open_file: loading latest version: will attempt to load saved version from DB next");
						_load_saved();
					}
				});
			
			}
		}
	
		// No data in playground_live_backups, and not in DB either. And to goal was to load backup only. Which has now failed.
		/*
		if(load_type == 'backup'){
			console.error("open_file: there was no live backup data");
			flash_message("could not restore live backup of " + current_file_name);
			reject(null);
			return
		}
		*/
		
		function _load_saved(){
			//console.log("in _load_saved. playground_saved_files[current_file_path]: ", playground_saved_files[current_file_path]);
			if(typeof playground_saved_files[current_file_path] == 'string' && playground_saved_files[current_file_path] != '_PLAYGROUND_BINARY_'  ){ // && !window.filename_is_binary(current_file_name)){
				//console.log("_load_saved: found saved data: ", playground_saved_files[current_file_path]);
				playground_live_backups[current_file_path] = playground_saved_files[current_file_path];
				editor_set_value(playground_saved_files[current_file_path]);
				resolve(playground_saved_files[current_file_path]);
				return playground_saved_files[current_file_path];
			}
			else if((load_type == 'saved' || load_type == 'latest')){ //  && typeof files[current_file_name].loaded !== 'undefined' && files[current_file_name].loaded == true
				//console.error("loading previously loaded/saved file from DB (live_backup did not exist (yet/anymore) or was not intended, and playground_saved_files didn't contain data either). load_type: ", load_type, current_file_path, playground_saved_files);
				
				setr(current_file_path, files[current_file_name])
				.then((value) => {
					//console.log("open_file: _load_saved: inside setr then. value: ", value);
					playground_saved_files[current_file_path] = value;
					resolve(value);
					//update_ui();
					clear_output();
					return
				})
				.catch((err) => {
					console.error("open_file: _load_saved (revert to saved) failed: ", err);
					if(serverless && typeof files[current_file_name] != 'undefined'){
						console.error("setr failed. a file in the files dict didn't actually seem to exist! Deleting: ", target_folder, current_file_name);
						
						if(window.settings.docs.open != null && typeof window.settings.docs.open.filename == 'string' && window.settings.docs.open.filename == current_file_name &&  typeof window.settings.docs.open.folder == 'string' && window.settings.docs.open.folder == target_folder){
							window.settings.docs.open = null;
							save_settings();
						}
						
						let last_opened_in_ls = localStorage.getItem(folder + '_last_opened');
						if(typeof last_opened_in_ls == 'string' && last_opened_in_ls == current_file_name){
							localStorage.removeItem(folder + '_last_opened');
						}
						
						console.error("- files: ", files);
						delete files[current_file_name];
						localStorage.setItem(target_folder + '_playground_files', JSON.stringify(files));
						current_file_name = unsaved_file_name;
						document.body.classList.remove('show-document');
						update_ui();
					}
					
					if(load_type == 'saved'){
						flash_message("could not restore saved version of " + current_file_name, 3000,'fail');
						
						reject(null);
						return
					}
					else if(!serverless){
						//console.log("open_file: loading latest version: will attempt to load file from outside next");
						_load_outside();
					}
					else{
						reject(null);
					}
				});
			}
		}
	

		function _load_outside(){
			// time to try and load the raw file from outside
			if((load_type == 'outside' || load_type == 'latest') && folder != unsaved_folder_name && target_filename != unsaved_file_name){
				console.warn("open_file: calling fetch to load from outside"); // load_file_from_outside()
				//editor_set_value('LOADING...');
			
				// if the file is known to be unreal, don't try to load it from outside.
				if(typeof files[target_filename] != 'undefined' && typeof files[target_filename].real != 'undefined' && files[target_filename].real == false){
					console.warn("open_file: this file isn't a real file (yet), so no need to attempt to load it from outside: ", target_filename, files[target_filename]);
					reject(null);
					return
				}
				
				load_file_from_outside(target_folder,target_filename)
				.then((value) => {
					//console.log("HURRAY, open_file: load_file_from_outside.then:  value: ", value); //.substr(0,10) + '...');
					if(load_type == 'outside'){
						// forced revert
						playground_live_backups[target_folder + '/' + target_filename] = value;
						playground_saved_files[target_folder + '/' + target_filename] = value;
						if(save){
							//console.log("open_file: will save the opened file immediately.  target_filename,value: ", target_filename,value);
							
							save_file(target_filename,value,'browser',target_folder,true) // force save
							.then((value) => {
								//console.log("open_file: opened file and then saved it. value: ",  value);
								resolve(value);
							})
							.catch((err) => {
								console.error("open_file: open then save failed:  err: ", err);
								reject(err);
							})
						}
						else{
							resolve(value);
						}
					}
					else{
						resolve(value);
					}
					
					//update_ui();
					
				})
				.catch((err) => {
					console.error("open_file: load_file_from_outside -> then error:  err: ", err);
					if(load_type == 'latest'){console.error("open_file: trying to get latest version completely fell through")}
					reject(err);
				})
			
				// folder,current_file_name are the default
				//resolve(true);
				//return save_promise;
			}
			else{
				console.warn("open_file: not attempting load from outside: ", target_folder + '/' + target_filename);
				//update_ui();
				reject(null);
			}
		}
		
		/*
		if(load_type == 'saved'){
			console.error("open_file: there was no previously loaded/saved data");
			reject(null);
			return
		}
		*/
	
		
		//console.error("open_file: fell through, could not load anything.  load_type: ", load_type, ', path: ', target_folder + '/' + current_file_name);	
	});
}
window.open_file = open_file;


function show_notepad(){
	return false
	open_file(unsaved_file_name);
}



function post_file_load(){
	//console.log("in post_file_load. calling update_ui and settled (blocked).");
	//update_ui();
	settled();
}






function save_file(new_file_name=null,new_data=null,intensity=null,target_folder=null,force_save=false){
	console.warn("\n\nin save_file.  new_file_name,target_folder: ", new_file_name, target_folder); //.  new_file_name, new_data: ", new_file_name, '\n', new_data.substr(0,10) + '...');
	//console.log("save_file: file name, data: ", new_file_name, new_data);
	if(target_folder == null){target_folder = folder}
	
	
 	return new Promise(function(resolve,reject) { // , reject
		//console.log("save_file: inside promise");
		
		
		if(new_file_name == null){
			console.error("save_file: no filename provided");
			reject(null);
			return
			//new_file_name = current_file_name
		}
		if(intensity == null){
			if(serverless){
				intensity='browser';
			}else{
				intensity='beta';
			}
		} // by default (if not serverless) save in browser and also save a copy in the beta folder
    
		if(serverless){
			// for AI Chat project
			force_save=true;
		}
	
		//console.log(" - intensity: ", intensity);
		//console.log(" - new_data: ", new_data);
	    //console.log(" - new_data btoa: ", window.btoa(new_data));
		//console.log(" - current_file_name: ", current_file_name);
		//console.log(" - target_folder: ", target_folder);
		//console.log(" - force_save: ", force_save);
		if(typeof new_data == 'string'){
			//console.log("save_file: new_data: ", new_data.substr(0,10) + '...');
		}
		else{
			//console.log("save_file: new_data: ", typeof new_data, new_data);
		}
		if(typeof new_data == 'undefined'){
			console.error("save_file: new_data was undefined, aborting.");
			reject(null);
			return;
			/*
			if(target_folder == folder){
			
			}
			else{
			
			}
			*/
		}
		
		
		
		
		
		if(a_file_is_open == false && force_save == false){
			console.error("save_file: no file currently open. Aborting.");
			reject(null);
			return
		}
		
		if(typeof new_data == 'undefined'){
			console.error("save_file: new_data was undefined. Aborting.");
			reject(null);
			return
		}
		
		
		try{
			
			let was_modified = false;
			//let was_already_modified = false;
	
			let refresh_delay = 1000;
			if(localhost){
				refresh_delay = 100;
			}
		
			if(new_data == null){
				if(typeof playground_live_backups[target_folder + '/' + new_file_name] == 'string' && playground_live_backups[target_folder + '/' + new_file_name] != '_PLAYGROUND_BINARY_'){
					new_data = playground_live_backups[target_folder + '/' + new_file_name];
				}
				
				//console.log("save_file:  new_data was null. Got data from playground_live_backups: ", new_data);
				
				
			}
		
			if(typeof new_data != 'string'){
				console.error("main.js: save_file: aborting: new data was not a string, it was: ", typeof new_data, new_data);
				reject(null);
				return
			}
		
			//playground_live_backups[target_folder + '/' + target_filename] = value;
			//playground_saved_files[target_folder + '/' + target_filename] = value;
			
			// saving the notepad, which always creates a new file with the notepad's contents
			if(new_file_name==null && current_file_name == unsaved_file_name) {
				/*
		        create_file(true)
				.then((value) =>{
					console.warning("creating notepad done");
					clear_file(); // default clears the notepad
				})
				.catch((err) => {
					console.error("save_file: saving the notepad caught error:  err:",err);
				})
				*/
		    }
			
			// saving any other file
			else {
				if(new_file_name==null){
					new_file_name = current_file_name;
					//console.log(" - save_file: saving as current_file_name: ", current_file_name);
				}
				if(new_file_name==null){
					console.error("error saving file: new_file_name was still null somehow");
					return;
				}
				
				reload_files_dict();
				let gotten_files = get_files_dict(target_folder);
				//console.log("save_file:  target_folder: ", target_folder);
				//console.log("save_file:  gotten_files: ", gotten_files);
				
				if(typeof gotten_files[new_file_name] == 'undefined'){
					console.warn("\n\n\n\nsave_file: strange, saving a file that was not in files dict yet: ", new_file_name);
					//reload_files_dict(); // make sure it's up to date, in case something was modified in another window
					gotten_files[new_file_name] = {'modified':false,'loaded':true,'last_time_opened':Date.now()}
					localStorage.setItem(target_folder + '_playground_files', JSON.stringify(gotten_files));
				}
				else{
					//console.log("save_file: saving a file that already existed");
					if(typeof gotten_files[new_file_name].modified != 'undefined' && gotten_files[new_file_name].modified == true){
						//console.log("save_file: file was modified before the save");
						was_modified = true;
					}
				}
		
				if(filename_is_binary_image(new_file_name)){
					save_file_meta('type','image',target_folder,new_file_name);
				}
				else if(filename_is_media(new_file_name)){
					save_file_meta('type','media',target_folder,new_file_name);
				}
				else if(filename_is_binary(new_file_name)){
					save_file_meta('type','binary',target_folder,new_file_name);
				}
				else{
					save_file_meta('type','text',target_folder,new_file_name);
				}
				
				save_file_meta('modified',false,target_folder,new_file_name);
				save_file_meta('loaded',true,target_folder,new_file_name);
				if(typeof new_data != 'undefined'){
					save_file_meta('size', new_data.length,target_folder,new_file_name); // byteCount(new_data)
				}
				
		
				if(typeof new_data == 'string'){
					//console.log("save_file: saving: ", new_file_name, new_data.substr(0,10) + "...");
					//console.log("save_file: new_data.length: ", new_data.length); // byteCount(new_data), 
				}
				else{
					//console.log("save_file: saving non-string: ", new_file_name, new_data);
				}
				
				playground_saved_files[target_folder + '/' + new_file_name] = new_data;
				//playground_live_backups[target_folder + '/' + new_file_name] = new_data;
				
				
				
		
				// ZIP big files to save some space
				if(
					new_data.length > 300000 && 
					!new_data.startsWith('_PLAYGROUND_BINARY_') && 
					(
						new_file_name.toLowerCase().endsWith('.js') || 
						new_file_name.toLowerCase().endsWith('.csv') || 
						new_file_name.toLowerCase().endsWith('.json') || 
						new_file_name.toLowerCase().endsWith('.txt') || 
						new_file_name.toLowerCase().endsWith('.notes') || 
						new_file_name.toLowerCase().endsWith('.md') || 
						new_file_name.toLowerCase().endsWith('.pdf') || 
						new_file_name.toLowerCase().endsWith('.epub') || 
						new_file_name.toLowerCase().endsWith('.docx') || 
						new_file_name.toLowerCase().endsWith('.odf') 
					)
				){ // && window.filename_is_binary(new_file_name) == false
		
					console.warn("save_file: ZIPPING before saving. BEFORE zipped byte count: ", byteCount(new_data));
		
					compress(new_data,'gzip')
					.then(function(zipped){
			
						console.error("save_file: zipping is done");
						console.error('save_file: zipped: ', typeof zipped, zipped);
						
						if(typeof zipped != 'string'){
							zipped = '_PLAYGROUND_BINARY_' + buffer_to_string(zipped);
						}
						
						//console.log("save_file: calling savr with COMPRESSED DATA for file: ", new_file_name);
						savr(target_folder + '/' + new_file_name,zipped)
						.then((value) => {
					
							save_file_meta('compression','gzip',target_folder,new_file_name);
							save_file_meta('type','zip',target_folder,new_file_name);
							
							
							if(typeof playground_live_backups[target_folder + '/' + new_file_name] != 'undefined' && playground_saved_files[target_folder + '/' + new_file_name] == playground_live_backups[target_folder + '/' + new_file_name]){ // make sure it's still the same value
								save_file_meta('modified',false,target_folder,new_file_name);
								//console.log("save_file: savr saved succesfully. deleting the backup data from playground_live_backups");
								delete playground_live_backups[target_folder + '/' + new_file_name];
							}
							
							update_ui();
							
							deletr(target_folder + '/playground_backup_' + new_file_name)
							.then((value) => {
								//console.log("save_file: in deletr->then. backup should now be deleted from the database. deletr returned value: ", value);
								resolve(true);
							})
							.catch((err) =>{
								console.error("Error saving zipped backup in db: ", err);
								reject(false);
							})
							// TODO: maybe delete the backup now instead? to save space?
							
							/*
							//console.log("save_file: calling savr to also store backup of zipped data (to save space). ");
							savr(target_folder + '/playground_backup_' + new_file_name, zipped)
							.then((value) => {
								if(intensity == 'browser' || intensity == 'local' || serverless == true){
									
									if(typeof playground_live_backups[target_folder + '/' + new_file_name] != 'undefined' && playground_saved_files[target_folder + '/' + new_file_name] == playground_live_backups[target_folder + '/' + new_file_name]){ // make sure it's still the same value
										//console.log("save_file: savr saved succesfully. deleting the backup data from playground_live_backups");
									// playground_live_backups[target_folder + '/' + new_file_name] = new_data;
										delete playground_live_backups[target_folder + '/' + new_file_name];
									}
									
									update_ui();
									resolve(true);
								}
								else{
									_save_real_file();
								}
								
							})
							.catch((err) =>{
								console.error("Error saving zipped backup in db: ", err);
								reject(false);
							})
							*/
						})
						.catch((err) =>{
							console.error("Error saving zipped file in db: ", err);
							reject(false);
						})
			
					})
					.catch(function(err){
						//console.log("save_file: zipping failed: ", err);
						reject(false);
					});
					//console.log("zipped new_data: ", typeof zipped, zipped);
				}
				else{
					//console.log("save_file: saving without zipping. new_data.length: ", new_data.length);
		
					//console.log("save_file: calling savr with uncompressed data for file: ", new_file_name);
					savr(target_folder + '/' + new_file_name,new_data)
					.then((value) => {
			
						//console.log("save_file: savr1 (normal browser save) done.  value: ", value);
				
						save_file_meta('compression','none',target_folder,new_file_name);
						
						if(typeof playground_live_backups[target_folder + '/' + new_file_name] != 'undefined' && playground_saved_files[target_folder + '/' + new_file_name] == playground_live_backups[target_folder + '/' + new_file_name]){ // make sure it's still the same value
							save_file_meta('modified',false,target_folder,new_file_name);
							//console.log("save_file: savr saved succesfully. deleting the backup data from playground_live_backups");
							delete playground_live_backups[target_folder + '/' + new_file_name];
						}
						
						update_ui();
						
						return deletr(target_folder + '/playground_backup_' + new_file_name); // always returns resolve
						/*
						.then((value) => {
							//console.log("save_file: in deletr->then. backup should now be deleted from the database. deletr returned value: ", value);
							resolve(true);
						}
						.catch((err) =>{
							console.error("Error saving zipped backup in db: ", err);
							reject(false);
						})
						*/
						
						
						//return savr(target_folder + '/playground_backup_' + new_file_name, new_data);
				
					})
					.then((value) => {
						
						//console.log("save_file: savr2 (backup) done.  value: ", value);
				
						if(serverless || (intensity == 'browser' || intensity == 'local')){
							console.error("save_file: done saving to browser");
							update_ui();
							
							let file_saved_flash_message = "💾 File saved";
							// Added for AI chat
							if(get_translation){
								file_saved_flash_message = get_translation('File_saved');
							}
							flash_message(file_saved_flash_message,1000);
							resolve(true);
							//update_ui_file_menu();
						}
						else{
							console.error("save_file: savr2 (backup) done -> CALLING _save_real_file.  target_folder,new_file_name: ", target_folder,new_file_name);
							_save_real_file();
						}
						//update_ui_file_menu();
				
					})
					.catch((err) =>{
						console.error("save_file: Error saving file in db: ", err);
						reject(false);
					})
		
				}
			
		
				
			
				// Save to real filesystem via PHP
				function _save_real_file(){
					if(serverless){
						console.error("in _save_real_file.");
					}
					else{
						//console.log("in _save_real_file.");
					}
					
					//console.log("- save real file:  intensity: ", intensity);
					//console.log("- save real file:  new_data: ", new_data);
					//console.log("- save real file:  target_folder,new_file_name: ", target_folder,new_file_name);
				
					// Turn into BASE64 for transmission to php
					if(new_data.startsWith('_PLAYGROUND_BINARY_')){
						new_data = string_to_buffer( new_data.substr(19) );
						new_data = arrayBufferToBase64(new_data);
					}
					else{
						new_data = btoa(unescape(encodeURIComponent(new_data)))
					}
				
					let beta_location = beta_folder;
					if( ! target_folder.startsWith('/') && ! beta_location.endsWith('/')){
						beta_location += '/';
					}
					if(beta_location.startsWith('/')){
						beta_location = beta_location.substr(1);
					}
				
					if(!serverless && target_folder != unsaved_folder_name && current_file_name != unsaved_file_name){
						console.warn("save_file: also saving this file in the beta folder.", beta_location, current_file_name);
						save_file_meta('beta',true,target_folder,new_file_name);
						ajax('save_file',{
							'folder':beta_location + target_folder,
							'target_file':new_file_name,
							'data': new_data
						})
						.then(() => {
							//console.log("saved file to beta via ajax: ", target_folder,new_file_name);
							update_ui();
							resolve(true);
							//save_file_meta('real',true,target_folder,new_file_name);
						})
						.catch((err) =>{
							flash_message("Error saving file in beta folder: " + new_file_name, 3000,'fail');
							console.error("Error saving file in beta folder: ", err);
							reject(false);
						})
					}
					
					
					// SAVING TO PRODUCTION
					if(intensity == 'production' && target_folder != unsaved_folder_name && current_file_name != unsaved_file_name){
						console.warn("this file should be saved to production.", target_folder, current_file_name);
						save_file_meta('beta',false,target_folder,new_file_name);

						ajax('save_file',{
							'folder':target_folder,
							'target_file':new_file_name,
							'data': new_data//btoa(unescape(encodeURIComponent(new_data)))
						})
						.then(() => {
							save_file_meta('real',true,target_folder,new_file_name);
							//console.log("saved file to production via ajax: ", target_folder,new_file_name);
							update_ui();
							resolve(true);
						})
						.catch((err) =>{
							flash_message("Error saving file in production: " + new_file_name, 3000,'fail');
							console.error("Error saving file in production: ", err);
							reject(false);
						})
						
					}
					else if(was_modified == true){
						//console.log("cannot save to production, but setting beta to true");
						save_file_meta('beta',true,target_folder,new_file_name);
						//reject(false);
					}
					else{
						console.error("not saving file to production");
					}
				
					if(diffing){
						differ();
					}
					//get_free_space();
				}
			
		    }
			
		}
		catch(err){
			console.error("caught general error in save_file: ", err);
		}
		
	});
	
}









// TODO: isn't this just a low-level intensity delete?
function clear_file(target_filename=null, intensity='browser', target_folder=null){
	//console.log("clear_file is blocked");
	return;
	//console.log("in clear_file.  target_filename: ", target_filename)
	if(target_filename == null){
		console.warn("NOTICE: clear file is too dangerous to be used without an explicit target_filename");
		//return;
	}
	if(target_folder == null){
		target_folder = folder;
	}
	
	if(target_filename == null){
		target_filename = current_file_name;
	}
	//console.log("in clear_file. target_filename: ", target_filename);
	
	if(typeof playground_live_backups[target_folder + '/' + target_filename] != 'undefined'){
		delete playground_live_backups[target_folder + '/' + target_filename];
	}
	if(target_filename != unsaved_file_name){
		save_file(target_filename,'','browser',target_folder);
	}
	
	if(target_folder == folder && target_filename == current_file_name){
		editor_set_value('');
	}
}


function revert_file(target_filename=null, intensity='browser',target_folder=null){
	if(target_folder==null){target_folder=folder}
	//console.log("in revert_file.  target_filename,intensity,target_folder: ", target_filename, intensity,target_folder);
	if(target_filename == null){target_filename = current_file_name}
	//console.log("in revert_file. target_filename: ", target_filename);
	
	if(typeof files[target_filename] != 'undefined'){
		if(typeof files[target_filename]['loaded'] != 'undefined' && files[target_filename]['loaded'] == true){
			
			getr(target_folder + '/' + target_filename)
			.then(function(value) {
				if(value == null){
					if(intensity=='browser'){
						flash_message("Could not revert, no saved version in local storage: ", target_folder + '/' + target_filename);
					}
					else{
						open_file(target_filename,'outside',target_folder);
					}
				}
				else{
					playground_live_backups[target_folder + '/' + target_filename] = value;
					savr(target_folder + '/playground_backup_' + target_filename, playground_live_backups[target_filename]);
				}
			})
			.catch(function(e) {
				console.error("revert_file: caught getr error: ", e);
			});
			
		}
	}
}




//
//  LOADING / RECREATING LOTS OF VARIABLES
//

// TODO: this only restores the current folder
function recreate_live_backups_var(target_folder=null){
	if(target_folder==null){target_folder=folder}
	console.error("in recreate_live_backups_var. target_folder: ", target_folder);
	
	reload_files_dict(); // make sure the latest files list is used
	//playground_live_backups = {};
	// TODO: theoretically there is a short window here where the backup dictionary is empty..
	
	//console.log("recreate_live_backups_var:  files is now: ", files);
	
	let files_keys = keyz(files);
	let backup_keys = keyz(playground_live_backups);
	//console.log("recreate_live_backups_var: files_keys: ", files_keys);
	//console.log("recreate_live_backups_var: backup_keys: ", backup_keys);
	/*
	for(var n = 0; n < backup_keys.length; n++) {
		if(backup_keys[n].startsWith(folder))
		if( ! files_keys.includes(backup_keys[n])){
			delete playground_live_backups[ backup_keys[n] ];
		}
	}
	*/
	
	let promises = [];
	
	
	
	// LOAD live_backups
	
	for (const [filename, details] of Object.entries(files) ){
		//console.log("recreate_live_backups_var: checking for: ", folder + '/playground_backup_' + filename,', in:\n', initial_db_keys);
		//if(typeof details.modified != 'undefined')
		
		if(initial_db_keys.includes( target_folder + '/playground_backup_' + filename )){
			//console.log("repopulating live_backups with: ", folder + '/playground_backup_' + filename);
			let gets_promise = getr(target_folder + '/playground_backup_' + filename)
			.then(function(value) {
				//console.log("recreate_live_backups_var: then value: ", typeof value, value);
				if(value != null){ //  && typeof value == 'string'
					playground_live_backups[target_folder + '/' + filename] = value; // playground_backup_
					//console.log("recreate_live_backups_var: backup has grown: added:\n",target_folder + '/' + filename,'\n', playground_live_backups, '\n',keyz(playground_live_backups).length);
				}
				else{
					//console.log("recreate_live_backups_var: backup data was null or invalid value type: ", typeof value, value);
				}
				return value;
			})
			.catch(function(e) {
				console.error("recreate_live_backups: caught getr error: ", e);
				return null;
			});
			
			promises.push(gets_promise);
		}
		else{
			//console.warn("initial files list item does not have a db entry yet: path,files,initial_db_keys:\n\n", target_folder + '/playground_backup_' + filename, '\n', files, '\n' , initial_db_keys);
		}
	}
	
	// LOAD playground_saved_files
	
	for (const [filename, details] of Object.entries(files) ){
		//console.log("recreate_live_backups_var: checking for: ", folder + '/' + filename,', in:\n', initial_db_keys);
		//if(typeof details.modified != 'undefined')
		
		if(initial_db_keys.includes(target_folder + '/' + filename)){
			//console.log("repopulating saved_files with: ", folder + '/playground_backup_' + filename);
			let gets_promise = getr(target_folder + '/' + filename)
			.then(function(value) {
				//console.log("recreate_live_backups_var: then value: ", typeof value, value);
				if(value != null){ // && typeof value == 'string'
					playground_saved_files[target_folder + '/' + filename] = value;
					//console.log("recreate_live_backups_var: saved_files has grown: ", playground_live_backups, keyz(playground_live_backups).length);
				}
				else{
					//console.log("recreate_live_backups_var: saved_files data was null or invalid value type: ", typeof value, value);
				}
				return value;
			})
			.catch(function(e) {
				console.error("recreate_live_backups: recreating saved_files: caught getr error: ", e);
				return null;
			});
			
			promises.push(gets_promise);
		}
		else{
			//console.warn("initial files list does have db entries yet:  files,initial_db_keys: ", files, initial_db_keys);
		}
	}
	
	
	//console.log("recreate_live_backups_var: promises.length: ", promises.length);
	return Promise.all(promises)
	.then((values) => {
		//console.error("recreate_live_backups_var: ALL PROMISES DONE.", values);
		document.body.classList.remove('busy-restoring-files');
		return values;
	})
	.catch(function(err) {
		console.error("recreate_live_backups_var: ALL PROMISES DONE: caught getr error: ", err);
		document.body.classList.remove('busy-restoring-files');
		return null;
	});
}














function save_beta(){
	//console.log("in save_beta");
	
	let beta_location = beta_folder;
	if( ! folder.startsWith('/') && ! beta_location.endsWith('/')){
		beta_location += '/';
	}
	if(beta_location.startsWith('/')){
		beta_location = beta_location.substr(1);
	}
	//console.log("save_beta: beta_location: ", beta_location);
	
	let promises = [];

	for (const [filename, details] of Object.entries(files) ){
		
		if(filename == unsaved_file_name){continue}
		
		//console.log("save_beta:  playground_live_backups:  raw data: ", playground_live_backups[folder + '/' + filename]);
		
		// payload object
		const payload = {
			'action': 'save_file',
			'folder': beta_location + folder,
			'target_file':filename,
			'data':btoa(unescape(encodeURIComponent( playground_live_backups[folder + '/' + filename] ))) //btoa(new_data)
		}
		//console.log("payload: ", payload);
		
		// make the request
		let save_promise = fetch("playground.php", {
			method: "POST",
			body: JSON.stringify(payload),
			headers: {
  		    	"Content-Type": "application/json; charset=UTF-8"
			}
		})
		.then((response) => response.json())
		.then((data) => () => {
			//console.log("save_beta: PHP response data: ", data);
			resolve(data);
		})
		.catch((err) => {
			console.error("err: ", err);
		})
		
		promises.push(save_promise);
		
	}
	//console.log("promises.length: ", promises.length);
	return Promise.all(promises).then((values) => {
		console.error("ALL SAVE PROMISES DONE.", values);
		return values;
	});
	
}



document.getElementById('save-all-files-button').onclick = (event) => {
	//console.log("clicked on save-all-files-button");
	save_all_files();
}

function save_all_files(intensity='local',target_files=null,target_folder=null){
	
	if(target_files == null){target_files=files}
	if(target_folder==null){target_folder=folder}
	//console.log("in save_all_files.  intensity,target_files,target_folder: ", intensity,target_files,target_folder);
	
	let promises = [];
	
	
	//let save_promises = [];
	for (const [filename, details] of Object.entries(target_files) ){
		if(intensity == 'local'){
			if(typeof playground_live_backups[ target_folder + '/' + filename ] != 'undefined'){
				let save_promise = save_file(filename, playground_live_backups[ target_folder + '/' + filename ]);
				promises.push(save_promise);
			}
		}
		
		//savr(key,value,promise=false)
	}
	
	//console.log("promises.length: ", promises.length);
	return Promise.all(promises).then((values) => {
		console.error("ALL SAVE PROMISES DONE.", values);
		return values;
	});
	
	update_ui();
}



function loadAll(target_folder=null){
	if(target_folder==null){target_folder=folder}
	//console.log("in loadAll. target_folder: ",target_folder);
	
	let folder_files = get_files_dict(target_folder);
	let promises = [];
	
	let filenames = keyz(folder_files);
	
	let queue_counter = 0;
	
	function _load_next_file(){
		if(queue_counter < filenames.length){
			//console.log("q: ", queue_counter, filenames[queue_counter]);
			let target_filename = filenames[queue_counter];
			queue_counter++;
			
			if(target_filename != unsaved_file_name){
				load_file_from_outside(target_folder,target_filename,'save') // target_folder,target_file,intensity    //open_file(filename,'latest',target_folder,true); // open and then save
		    	.then((value) => {
					//console.log("loadAll: load_file_from_outside finished for: ", target_filename,'\n',value);
		    		//return value;
					_load_next_file();
		    	})
				.catch((err) => {
					console.error("loadAll: load_file_from_outside failed for: ", target_filename,'\n',value);
					//return null;
					_load_next_file();
				})
			}
			else{
				_load_next_file();
			}
			
		}
		else{
			//console.log("load queue done");
		}
		
	}
	_load_next_file();
	
	
}






// Loads all data available in local storage for this folder and anything below. Only uses what is already loaded into browser storage.
function take_snapshot(split_lines=false,target_folder=null,target_files_dict=null,download=false){
	if(target_folder==null){target_folder=folder}
	if(target_files_dict==null){target_files_dict=files}
	//console.log("in take_snapshot.  target_folder,target_files_dict: ", target_folder, target_files_dict);
	let timestamp = Date.now();
	reload_snapshots_meta();

	//let zipWriter = new zip.ZipWriter(new zip.BlobWriter("application/zip"), { bufferedWrite: true, useCompressionStream: false });
	var zip = new JSZip();
	//console.log("zip: ", typeof zip, zip);
	
	let all_data = {'timestamp':timestamp,'folder':target_folder,'data':{}};
	let added_file_to_zip = false;
	
	for (let [file_path, live_code] of Object.entries(playground_live_backups) ){
		//console.log("take_snapshot: checking: ", file_path, live_code);
		
		if(target_folder == '' || file_path.startsWith(folder + '/')){
			if( file_path.indexOf('_snapshot_') != -1 && file_path.endsWith('.zip') ){
				// this old snapshot file should not be part of the new snapshot
			}
			else{
				if(typeof live_code == 'string'){
					all_data.data[file_path] = live_code;
					//zipWriter.add(file_path, new zip.BlobReader(file), options);
					
					if(live_code.startsWith('_PLAYGROUND_BINARY_')){
						live_code = string_to_buffer( live_code.substr(19) );
						//live_code = live_code.substr(19);
						//new_data = arrayBufferToBase64(new_data);
					}
					
					if(target_folder != '' && file_path.indexOf(target_folder) != -1){
						file_path = file_path.replace(target_folder,'');
						if(file_path.startsWith('/')){
							file_path = file_path.substr(1);
						}
						if(file_path.startsWith('/')){
							file_path = file_path.substr(1);
						}
						//console.log("zip file_path: ", file_path);
					}
			
					//console.log("take_snapshot: adding to zip: ", file_path);
					zip.file(file_path, live_code);
					//if(file_path != unsaved_file_name){
						added_file_to_zip = true;
					//}
					
					
					
				}
				else{
					console.error("take snapshot: file content was not a string?");
				}
				
			}
			
		}
	}
	//console.log("take_snapshot: all_data: ", all_data);
	//console.log("filled zip: ", typeof zip, zip);
	if(!added_file_to_zip){
		flash_message("No data for snapshot yet",2000,'warn');
		return;
	}
	
	
	let zip_name = 'root';
	if(target_folder != ''){
		if(target_folder.indexOf('/') == -1){
			zip_name = target_folder;
		}
		else{
			zip_name = target_folder.split('/')[target_folder.split('/').length-1];
		}
	}
	zip_name = '_snapshot_' + zip_name + '_' + Math.floor(timestamp/1000);
	
	//console.log("take_snapshot: zip name: ", zip_name);
	
	/*
	zip.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions: {level: 9}}).then(function (blob) {
		
		const blob_type = blob.type;
		//console.log("blob_type: ", blob_type);

		blobToBase64(blob)
		.then((value) => {
			//console.log("zip: blobToBase64: ", value);
			value = Base64.decode(value);
			//console.log("zip: blob as text: ", value);
			//console.log("blob.text value: ", zip_name + ".zip", '\n', value);
			save_file(zip_name + ".zip", value, null, null, true);
		})
		.catch((err) => {
			console.error("zip blob.text() error: ", err);
		})
		
		
		//console.log("blob: ", blob_type, blob_string);
		
		saveAs(blob, zip_name + ".zip");
	}, function (err) {
		//console.log("take_snapshot: error creating zip: ", err);
	});
	*/
	
	
	zip.generateAsync({type:"arraybuffer",compression:"DEFLATE",compressionOptions: {level: 9}}).then(function (arbuf) {
		//console.log("zip: arbuf: ", arbuf);
		if(download){
			let is_array_buffer = ArrayBuffer.isView(arbuf);
			//console.log("take_snapshot: zip data is_array_buffer?: ", is_array_buffer);
			
			let blob = new Blob([ arbuf ], {type: "application/zip"});

			//var blob = new Blob([ playground_saved_files[folder + '/' + file] ], {type: 'application/octet-binary'});
			var blob_url = URL.createObjectURL(blob);
		
			var link = document.createElement("a"); // Or maybe get it from the current document
			link.href = blob_url;
			link.download = 'papegai_' + folder.replaceAll('/','__') + '.zip';
		
		    document.body.appendChild(link);
		    link.click();
		    document.body.removeChild(link);
		    window.URL.revokeObjectURL(blob_url);
			
			
		}
		else{
			save_file(zip_name + ".zip", buffer_to_string(arbuf), 'production', null, true);
		}
		
	}, function (err) {
		//console.log("take_snapshot: error creating zip: ", err);
		flash_message(get_translation('An_error_occured'),2000,'fail');
	});
	
	
	let file_count = keyz(all_data.data).length;
	//console.log("take_snapshot: file_count: ", file_count);
	
	// Download the data.
	
	
	return all_data;
	
}



function choose_snapshot(){
	//console.log("in choose_snapshot");
	draggable_dialog_content_el.innerHTML = '';
	reload_snapshots_meta();
	
	if(typeof snapshots_meta[folder] != 'undefined'){
		//console.log("found data for folder in snapshots_meta: ", snapshots_meta[folder]);
		
		
        // get current time from browser
        let now_time = Date.now();
		
		let dialog_content_el = document.createElement("div");
		
		
		for (const[filename, details] of Object.entries(snapshots_meta[folder])) {
			if(dialog_content_el.innerHTML == ''){
				//dialog_content_el.innerHTML = '<h2>' + details.folder + '</h2>';
			}
			//console.log("filename, details: ", filename, details);
			
            let date_object = new Date(details.timestamp);
            let since = timeAgo(date_object,now_time);
			
			let meta_item = document.createElement("div");
			meta_item.classList.add('meta-item');
			meta_item.setAttribute('data-timestamp',details.timestamp);
			meta_item.setAttribute('data-folder',details.folder);
			meta_item.innerHTML = '<span>' + since + '</span><span><span>' + details.file_count + ' files</span> <span>' + (parseInt(details.size)/1000) + 'Kb</span></span>';
			meta_item.onclick = (event) => {
				//console.log("clicked on snapshot meta item. event: ", event);
				let timestamp2 = event.target.getAttribute('data-timestamp');
				let folder2 = event.target.getAttribute('data-folder');
				//console.log("timestamp2, folder2: ", timestamp2, folder2);
				
				if(typeof snapshots_meta[folder2] != 'undefined'){
					//console.log("found metadata for folder", snapshots_meta[folder2]);
					if(typeof snapshots_meta[folder2][timestamp2] != 'undefined'){
						//console.log("found metadata for folder -> timestamp", snapshots_meta[folder2][timestamp2]);
						
						
						getr(folder2 + '_playground_snapshot_' + timestamp2)
						.then((value) => {
							//console.log("snapshot data: ", typeof value, value);
							let all_data = JSON.parse(value);
							//console.log("snapshot all_data: ", typeof all_data, all_data);
							
							let dialog_content_el2 = document.createElement("div");
							
							for (const[filename, details] of Object.entries(all_data.data)) {
							
								let meta_item2 = document.createElement("div");
								meta_item2.classList.add('meta-item');
								meta_item2.innerText = filename;
								dialog_content_el2.appendChild(meta_item2);
								//dialog_content_el2.appendChild(meta_item2);
								draggable_dialog_content_el.innerHTML = '';
								draggable_dialog_content_el.appendChild(dialog_content_el2);
							}
							
							let buttonset_el = document.createElement("div");
							buttonset_el.classList.add('buttonset');
							
							let restore_snapshot_button_el = document.createElement("button");
							restore_snapshot_button_el.innerText = 'Restore';
							restore_snapshot_button_el.onclick = (event) => {
								//console.log("clicked on restore snapshot button");
							}
							
							buttonset_el.appendChild(restore_snapshot_button_el);
							draggable_dialog_content_el.appendChild(buttonset_el);
							
							/*
							//snapshots_meta = snapshot_meta;
							if(typeof snapshots_meta[folder] == 'undefined'){
								//console.log("there was no snapshot meta data for this folder yet");
								snapshots_meta[folder] = {};
							}
							
							snapshots_meta[folder][timestamp] = {'timestamp':timestamp,'folder':folder,'size':all_data.length,'file_count':file_count}
							console.warn("snapshots_meta[folder][timestamp]: ", snapshots_meta[folder][timestamp]);
							localStorage.setItem('_playground_snapshots_meta',JSON.stringify(snapshots_meta));
							//console.log("snapshot meta saved. ", snapshots_meta);
							flash_message("Snapshot taken of " + folder);
							*/
						})
						.catch((err) => {
							flash_message("getting snapshot data failed");
							console.error("getting snapshot data failed: ", err);
						});
	
						
					}
				}
				
			}
			dialog_content_el.appendChild(meta_item);
		}
		
		open_dialog_overlay();
		draggable_dialog_content_el.appendChild(dialog_content_el);
		//document.getElementById('draggable-dialog-content');
		//document.getElementById('dialog-content').appendChild(dialog_content_el);
	}
	
	
}



















function save_snapshot(){
	
}


function download_backup(){
	console.error("in download_backup TODO");
}





function restore_snapshot(data,folder){
	
}




/*
var ignoreScrollEvents = false
function syncScroll(element1, element2) {
    element1.scroll(function (e) {
		//console.log("playground overlay is scrolling");
        var ignore = ignoreScrollEvents
        ignoreScrollEvents = false
        if (ignore) return

        ignoreScrollEvents = true
        element2.scrollTop(element1.scrollTop())
    })
}
syncScroll(playground_overlay, codeEditor);

codeEditor.scroll(function (e) {
	//console.log("codeEditor scrolled");
	//console.log("codeEditor.scrollTop(): ", codeEditor.scrollTop());
});
*/




function enter_password(){
	password_hash = 'none';
	localStorage.setItem('playground_password_hash',password_hash);
	ajax();
}

// Request list of most recent versions of a file, and open the most recent one of available (and if the spreadsheet element is empty)
function ajax(action='list_files',options={}){
	console.warn("\n\n\nAJAX\n\n\n", action, options);
	
	if(serverless){
		console.warn("in _do_ajax, but serverless. Aborting.");
		return '{}';
	}
	
	if(options == null){
		options = {
			'action':'list_files',
			'folder':''
		}
	}
	
	return new Promise(function(resolve, reject) {
	
		if(password_hash == 'none'){
			_ask_for_password();
		}
		else{
			_do_ajax();
		}
	
	
		function _ask_for_password(){
		    vex.dialog.prompt({
		        message: 'Please provide the password',
				//value: '',
		        placeholder: 'Password',
		        callback: (value) => {
					if(value != ''){
						//console.log("user provided a password: ", value);
						if(value.length > 5 && value.length < 40){
							password_hash = sha512(value);
							//console.log("password_hash: ", password_hash);
							localStorage.setItem('playground_password_hash',password_hash);
							//ajax(action,options);
							_do_ajax();
						}
					}
					else{
						flash_message('Invalid password', 2000,'fail');
						_ask_for_password();
					}
		        }
		    });
		}
	
	
		//target_folder=null,target_file=null
	
		function _do_ajax(){
			//console.log("in _do_ajax");
			
			
			
			options.password = password_hash;
	
	
	
			if(typeof options == 'object'){
				options.action = action;
		
				if(typeof options.folder == 'undefined'){
					if(folder != unsaved_folder_name){
						options.folder = folder;
					}
					else{
						options.folder = '';
					}
					console.warn("AJAX: no folder provided, set target_folder to: ", options.folder);
				}
	
				else if(action.indexOf('file') != -1 && options.folder == null){
					console.error("ajax: files-related action, but no target folder. Aborting.");
					reject("ajax: files-related action, but no target folder. Aborting.")
					return
				}
	
			    // Request list of versions from php
				var responseCopy;
			    const url = "playground.php";
				let headers = {
					//'Accept': 'application/json',
					"Content-Type": "application/json",
				}
		
			    fetch(url, {
			        method : "POST",
			        //mode: "cors", // no-cors, *cors, same-origin
			        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
			        //credentials: "same-origin", // include, *same-origin, omit
			        headers: headers,
			        body : JSON.stringify(options)
			    })
			    .then(function(res){
					responseCopy = res.clone();
			        //console.warn("ajax raw response: ", JSON.stringify(res.text(),null,2));
					//console.warn("ajax raw response: ", res.text());
			
			        return res.json(); 
				})
				.catch(function (err) {
					console.error("ajax: error getting json from fetch response: ", err);
					reject(err);
					if (err instanceof SyntaxError) {
						return responseCopy.text()
						.then(function(text) {
							console.error(text);
							throw err;
						});
					}
					else {
						throw err;
					}
				})
			    .then(function(data){ 
					//console.warn("\n\nAJAX: THEN: action, target_folder, data\n", action, options, data);
			        ajax_response( data );
					resolve(data);
					//open_folder(target_folder);
				})
				.catch(function (err) {
					console.error("ajax: error while handling response: ", err);
					reject(err);
				});
		
		
			}
			else{
				console.error("ajax: invalid input: ", action, typeof options, options);
				reject("ajax: invalid input, should be object");
			}
		}
		

	});

}




// Parse PHP response
function ajax_response(json){
    console.error("in ajax response. json.action, json: ", json.action, '\n', json); // JSON.stringify(json,null,2)
	//console.error("ajax_respons: files at start: ", JSON.stringify(files,null,2));
	
	
	//update_ui_folder_dropdown(json.dirs);
	reload_files_dict();
	
	let target_folder = folder;
	if(typeof json.target_folder != 'undefined'){
		target_folder = json.target_folder;
	}
	
	if(typeof json.dirs != 'undefined'){
		//console.log("ajax response: calling update_sub_folders");
		update_sub_folders('add',json.dirs);
	}
	else{
		console.error("ajax response: undefined dirs");
	}

	// create initial files var
	if(typeof json.files != 'undefined'){
		reload_files_dict();
		for(let f = 0; f < json.files.length; f++){
			let filename = json.files[f];
			
			if(typeof files[filename] == 'undefined'){
				console.error("ajax response: files[filename] didn't exist yet for: ", filename);
				files[filename] = {'modified':false,'loaded':false,'real':true,'last_time_opened':Date.now()}
				localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
				//console.log("ajax_response: checking if file that was not in files also is unloaded (likely): ", folder + '/' + filename);
			}
			
			// Is the file loaded into browser storage DB?
			getr(folder + '/' + filename)
			.then(function(value) {
				
				if(typeof files[filename] == 'undefined'){files[filename] = {}}
				
				if(value == null){
					if(!(typeof files[filename] != 'undefined' && files[filename].loaded == false)){
						//console.log("ajax response: file .loaded to false");
						files[filename].loaded = false; // default is already false
						localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
					}
					
					//save_file_meta('loaded',false,folder,filename);
				}
				else{
					//playground_saved_files[folder + '/' + filename] = value;
					//console.warn("UNEXPECTED: filename was not in files yet, but does already exist as saved in DB: ", folder + '/' + filename);
					if(!(typeof files[filename] != 'undefined' && files[filename].loaded == true)){
						//console.log("ajax response: file .loaded to true");
						files[filename].loaded = true;
						localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
						//save_file_meta('loaded',true,folder,filename);
					}
					
				}
			})
			.catch(function(e) {
				console.error("ajax_response: caught getr error: ", e);
			});
			
		}
		
		// Which files in the files list exist in production?
		for (const[filename, details] of Object.entries(files)) {
			if( json.files.includes(filename)){
				if( !(typeof details.real != 'undefined' && details.real == true) ){
					save_file_meta('real',true,folder,filename);
				}
			}
		}
		
		//localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
	}
	
	// update subdirs
	if(typeof json.dirs != 'undefined'){
		for(let f = 0; f < json.dirs.length; f++){
			let dirname = json.dirs[f];
			
			if(typeof sub_folders[dirname] == 'undefined'){
				console.error("ajax response: sub_folders[dirname] didn't exist yet for: ", dirname);
				sub_folders[dirname] = {'modified':false,'loaded':false,'real':true}
			}
			else{
				sub_folders[dirname]['real'] = true;
			}
		}
		localStorage.setItem(folder + '_playground_sub_folders', JSON.stringify(sub_folders));
	}
	
	
	
	
	// Received the contents of a file
	if(typeof json.content != 'undefined'){
		if(json.content == null){
			//console.log("ajax response: json.content was null");
		}
		else{
			//console.log("\n\najax response:  GOT CONTENT: ", json.content, atob(json.content));
			if(json.action == 'display_file'){
				//editor_set_value(atob(json.content));
				editor_set_value(Base64.decode(json.content));
				//post_file_load();
			}
			else if(json.action == 'load_file' && typeof json.target_file == 'string'){
				//save_file(json.target_file, atob(json.content));
				save_file(json.target_file, Base64.decode(json.content),'browser',target_folder,true) // force save
				.then((value) => {
					//console.log("ajax response: also saved the newly opened file.  value: ", value);
					//console.log("ajax response: also saved the newly opened file");
					//resolve(text);
				})
				.catch((err) => {
					console.error("ajax response: saving the loaded file caused an error: ", err);
					//reject(err);
				})
			}
			
		}
	}
	
	
	// If a file was saved, if it was a beta file, update the beta preview window
	if(typeof json.action != 'undefined'){
		if(json.action == 'save_file'){
			if(typeof json.target_folder == 'string' && typeof json.target_file == 'string'){
				if(json.target_folder.indexOf('playground/playbeta') != -1){
					//console.log("ajax_response: succesfully saved beta file");
					localStorage.setItem('playground_last_update', JSON.stringify({'folder':json.target_folder,'file':json.target_file,'time':Date.now()}))
					
					if(window.beta_window != null){
						if(typeof window.beta_window.closed != 'undefined'){
							if(window.beta_window.closed == false && current_beta_path != null){
								window.beta_window = window.open(current_beta_path, 'demonstration');
							}
							else{
								flash_message('The beta preview window is no longer open');
								window.beta_window = null;
							}
						}
					}
					
				}
			}
		}
	}
	
	
	// If there was an error, display it prominently.
	if(typeof json.error == 'string'){
		if(json.error == 'disabled'){
			console.warn("opening and storing files has been disabled");
			return;
		}
		flash_message(json.error,4000,'fail');
		if(json.error == 'Invalid password'){
			setTimeout(enter_password,4000);
		}
	}
	
	
	if(typeof json.dirs != 'undefined'){
		//console.log("ajax response: calling update_ui (blocked)");
		//update_ui();
	}
   

}








//
//  ADD FILES BY DRAGGING THEM INTO THE WINDOW
//

let last_drag_enter_time = 0;
document.body.addEventListener("dragenter", (event) => {
    //console.log("drag enter detected. event:", event);
    
	last_drag_enter_time = Date.now();
    //var is_file = isDragSourceExternalFile(event.originalEvent.dataTransfer);
    var is_file = isDragSourceExternalFile(event.dataTransfer);
    
	//console.log("dragged is_file? ", is_file);
    if(is_file){
		document.body.classList.add('sidebar');
		document.body.classList.add('dragging_files');
        //file_manager_el.style.display = 'flex';
    }
	
	document.body.classList.add('sidebar');
	document.body.classList.add('dragging-files');
    
}, true);


document.body.addEventListener("dragleave", (event) => {
   // console.log("drag leave detected. event:", event);
    dragTimer = window.setTimeout(function() {
        //file_manager_el.style.display = 'none';
		if(Date.now() > last_drag_enter_time + 100){
			document.body.classList.remove('dragging-files');
		}
		
    }, 1000);
    
}, true);


file_drag_overlay.addEventListener("drop", (event) => {
    console.log("File dropped into file drop overlay");
    file_drop_handler(event);
});

file_drag_overlay.addEventListener("dragover", (event) => {
    console.log("dragging file over file drop overlay. Preventing default.");
    event.preventDefault();
});

// file input element
document.getElementById('upload-file-input').addEventListener('change', (event) => {
	//console.log("upload-file-input changed. event.target.files: ", event.target.files);
    file_upload(event.target);
});


function input_upload_handler(event){
	console.error("in input_upload_handler TODO");
}


function file_drop_handler(event) {
  console.log("File(s) dropped");

  // Prevent default behavior (Prevent file from being opened)
  event.preventDefault();
  
  document.body.classList.remove('sidebar-chat');
  document.body.classList.remove('sidebar-settings');
  
  file_upload(event.dataTransfer);

}





// Load a file from disk or from dragging it into the window.
function file_upload(inputElement,fs_files=[]) {
    console.log("in file_upload.  inputElement: ", inputElement);
	
	//return new Promise((resolve, reject) => {
	
		//file_drop_overlay_el.style.display = 'none';
		document.body.classList.remove('dragging-files');
	
		let file_promises = [];
		

		
	
		if(fs_files.length == 0 && typeof inputElement != 'undefined'){
			fs_files = inputElement.files || [];
		}
	    
	    if (!fs_files.length){
			//flash_message(get_translation('No_files_selected'),3000,'warn');
	        console.warn("file_upload: no files selected?");
			window.do_after_command = null;
			document.body.classList.remove('prepare-summarize-document');
			document.body.classList.remove('prepare-translate-document');
	        //alert("no files selected?");
			/*
			resolve(false);
	        return;
			*/
	    } 
		
		
		
	
		// Loop over all provided files
		for(let f = 0; f < fs_files.length; f++){
		//for (const [filename, details] of Object.entries(files)) {
			
			let an_error_occured = false;
	
			const file_upload_promise = new Promise((resolve, reject) => {
				
				function file_parsed(){
					//console.log("all uploaded files parsed.  did an error occur?: ", an_error_occured);
					file_upload_progress_container_el.innerHTML = '';
					get_files_dict();
					update_ui();
					window.do_after(null,'file');
					if(an_error_occured){
						resolve(false);
					}
					else{
						resolve(true);
					}
				}
				
			
				try{
					const file = fs_files[f];
					//console.log("files[f]: ", f, file);
				    //document.body.classList.add('loading');
				    //clear_spreadsheet_html();
		
					// This one is special, as it's essentially a zip file with XHTML files inside
					if(file.name.toLowerCase().endsWith('.epub')){
						//console.log("filename ends with .epub");
						try {
						    //const epubData = await EPUBParse.loadEPUB(dataBuffer);
					
							window.add_script('./epub_module.js',true) // load as module
							.then((value) => {
								//console.log("load of EPUB parser module finished. Next step: parse the arrayBuffer object.  value: ", value);
								//console.log("window.epub_parser: ", window.load_epub);
								if(typeof window.load_epub == 'function'){
									//console.log("window.load_epub exists");
							
									window.load_epub(file)
									.then((book) => {
										//console.log("epub book:", book);
										if(book == null){
											console.error("failed to read epub");
											an_error_occured = true;
										}
										else{
											//console.log("GOT EPUB BOOK!: ", book);
											
											if(typeof book.sections != 'undefined'){
												//console.log("calling parse_epub");
												parse_epub(book)
												.then((responseText) => {
													//console.log("EPUB: final ebook responseText: ", responseText);
													
													
													if(typeof responseText == 'string' && responseText != ''){
		
														current_file_name = file.name;
														localStorage.setItem(folder + '_last_opened', current_file_name);

														reload_files_dict();

														if(!keyz(files).includes(file.name)){
															files[file.name] = {'loaded':true,'modified':false,'last_time_opened':Date.now(),'last_time_edited':0,'pin':0};
															localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
															//console.log("file_upload:  file.name,new_value: ", file.name, responseText);
															save_file(file.name,responseText);
		
															save_file_meta('type','text',folder,file.name);
															document.body.classList.add('show-document');
															editor_set_value(responseText);
		
															file_parsed();
														}
														else{
															if(confirm(get_translation("Overwrite_file") + " " + file.name)){ // That file name exists, overwrite?
																files[file.name].loaded = true; // = {'loaded':true,'modified':false};;
																files[file.name].modifed = true;
																localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
																save_file(file.name,responseText);
			
																save_file_meta('type','text',folder,file.name);
																document.body.classList.add('show-document');
																editor_set_value(responseText);
			
																file_parsed();
															}
															else{
																file_parsed();
															}
														}

	

	

														//update_ui();
													}
													else{
														//console.log("EPUB response text was not a string, or an empty string");
														flash_message(get_translation("An_error_occured"),3000,'fail');
													}
													
													
												})
												.catch((err) => {
													console.error("caught error getting epub text: ", err);
												})
											}
											else{
												console.error("EPUB has no sections? book:", book);
											}
										
											//let ebook_text = book.loadText();
											//console.log("EPUB: ebook_text: ", ebook_text)
										
											//TODO save
										
										
										
										
										
										
										
											// TODO
										
											/*
											if(typeof responseText == 'string'){
												current_file_name = file.name;
												localStorage.setItem(folder + '_last_opened', current_file_name);
									
												reload_files_dict();
					
												if(!keyz(files).includes(file.name)){
													files[file.name] = {'loaded':true,'modified':false,'last_time_opened':Date.now(),'last_time_edited':0,'pin':0};
													localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
													//console.log("file_upload:  file.name,new_value: ", file.name, responseText);
													save_file(file.name,responseText);
												
													save_file_meta('type','text',folder,file.name);
													document.body.classList.add('show-document');
													editor_set_value(responseText);
												
													file_parsed();
												}
												else{
													if(confirm(get_translation("Overwrite_file") + " " + file.name)){
														files[file.name].loaded = true; // = {'loaded':true,'modified':false};;
														files[file.name].modifed = true;
														localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
														save_file(file.name,responseText);
													
														save_file_meta('type','text',folder,file.name);
														document.body.classList.add('show-document');
														editor_set_value(responseText);
													
														file_parsed();
													}
													else{
														file_parsed();
													}
												}
									
											}
											*/
										
										
										
										
										}
										file_parsed();
									})
									.catch((err) => {
										console.error("caught error doing load_epub: ", err);
										an_error_occured = true;
										file_parsed();
									})
							
								}
						
							})
							.catch((err) => {
								console.error("caught error loading EPUB parser script: ", err);
								an_error_occured = true;
								file_parsed();
							})
					
					
					
					
					
						} 
						catch (err) {
						    console.error("error extracting text from epub: ", err);
							an_error_occured = true;
							file_parsed();
						}
					
				
					}
					else{
				
				
						// FOR AI CHAT PROJECT
						//console.log("looping over file: ", event.target.files[f].name);
						//console.log("looping over file: ", file.name);
			
				  		let file_upload_progress_el = document.createElement('progress');
						//file_upload_progress_el.setAttribute('id','upload-progress-' + event.target.files[f].name);
						file_upload_progress_el.setAttribute('id','upload-progress-' + file.name);
						upload_progress_container_el.appendChild(file_upload_progress_el);
						//var pdff = new Pdf2TextClass();
		


					    console.log("\n+\n+ +\n+ + +\nfile_upload: file: ", file);
					    console.log("file_upload: file.name: ", file.name);
					    console.log("file_upload: file.type: ", file.type);
    	
						const is_binary_image = filename_is_binary_image(file.name);
						//console.log("file_upload: is_binary_image?: ", is_binary_image);
	
					    var reader = new FileReader();
					    reader.onloadend = (event) => {
							//console.log("file_upload: onloadend:  file.name,is_binary_image: ", file.name, is_binary_image);
							//console.log("file_upload: file reader onload end event: ", event);
					        let arrayBuffer = reader.result;
					        console.log("file_upload: arrayBuffer: ", typeof arrayBuffer, arrayBuffer);
			
							//console.log("file_upload: event.result: ", typeof event.result, event.result);
					        //console.log("file_upload: event.target.result: ", typeof event.target.result, event.target.result);
					        //import_json(event.target.result, file.name.replace(/\.[^/.]+$/, ""));
			
			
		    
			
							let new_value = reader.result; //event.target.result;
			
			
							// For AI chat project
							const target_el = document.getElementById('upload-progress-' + file.name);
							if(target_el){
								target_el.remove();
							}
				
						    try{
						
						
						
								// DOCX ALTERNATIVE
						
								if(file.name.toLowerCase().endsWith('.odt')){
							
									if(JSZip){
										var new_zip = new JSZip();
										// async("uint8array")
										new_zip.loadAsync(arrayBuffer, {binary : true})
										.then(function(zip) {
											//console.log("ODT zip: ", zip);
									
									
									
									
											zip.files['content.xml'].async('string')
											.then( (fileData) => {
												//console.log("content.xml fileData: ", fileData);
										
												const parser = new DOMParser();
												let xmlDoc = parser.parseFromString(fileData,"text/xml");
										
												//let p_tags = xmlDoc.querySelectorAll('text:p');
												//console.log("xmlDoc: p_tags: ", p_tags);
										
												if(typeof xmlDoc.body != 'undefined'){
													//console.log("xmlDoc.body: ", xmlDoc.body);
												}
												if(typeof xmlDoc['office:body'] != 'undefined'){
													//console.log("xmlDoc: has office:body: ", xmlDoc['office:body']);
												}
										
												//document.getElementById("demo").innerHTML = xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue;
										
										
												//console.log("xmlDoc: ", xmlDoc);
										
												let config = {};
										
												let notesText = [];
												let responseText = "";

												const allowedTextTags = ["text:p", "text:h"];
												const notesTag = "presentation:notes";
										
												// Main dfs traversal function that goes from one node to its children and returns the value out.
												function extractAllTextsFromNode(root) {
												    let xmlTextArray = []
												    for (let i = 0; i < root.childNodes.length; i++)
												        traversal(root.childNodes[i], xmlTextArray, true);
												    return xmlTextArray.join("");
												}
												// Traversal function that gets recursive calling.
												function traversal(node, xmlTextArray, isFirstRecursion) {
												    if(!node.childNodes || node.childNodes.length == 0)
												    {
												        if (node.parentNode.tagName.indexOf('text') == 0 && node.nodeValue) {
												            if (isNotesNode(node.parentNode) && (config.putNotesAtLast || config.ignoreNotes)) {
												                notesText.push(node.nodeValue);
												                if (allowedTextTags.includes(node.parentNode.tagName) && !isFirstRecursion)
												                    notesText.push(config.newlineDelimiter ?? "\n");
												            }
												            else {
												                xmlTextArray.push(node.nodeValue);
												                if (allowedTextTags.includes(node.parentNode.tagName) && !isFirstRecursion)
												                    xmlTextArray.push(config.newlineDelimiter ?? "\n");
												            }
												        }
												        return;
												    }

												    for (let i = 0; i < node.childNodes.length; i++)
												        traversal(node.childNodes[i], xmlTextArray, false);
												}

												// Checks if the given node has an ancestor which is a notes tag. We use this information to put the notes in the response text and its position.
												function isNotesNode(node) {
												    if (node.tagName == notesTag)
												        return true;
												    if (node.parentNode)
												        return isNotesNode(node.parentNode);
												    return false;
												}

												// Checks if the given node has an ancestor which is also an allowed text tag. In that case, we ignore the child text tag.
												function isInvalidTextNode(node) {
												    if (allowedTextTags.includes(node.tagName))
												        return true;
												    if (node.parentNode)
												        return isInvalidTextNode(node.parentNode);
												    return false;
												}

										
										
											    const xmlTextNodesList = [...Array.from(xmlDoc
											                                    .getElementsByTagName("*"))
											                                    .filter(node => allowedTextTags.includes(node.tagName)
											                                        && !isInvalidTextNode(node.parentNode))
											                                ];
										
										
												//console.log("xmlTextNodesList: ", xmlTextNodesList);

											    responseText = xmlTextNodesList
											            // Add every text information from within this textNode and combine them together.
											            .map(textNode => extractAllTextsFromNode(textNode))
											            .filter(text => text != "")
											            .join(config.newlineDelimiter ?? "\n\n")
										
												//console.log("responseText: ", responseText);
										
										
												if(typeof responseText == 'string'){
													current_file_name = file.name;
													localStorage.setItem(folder + '_last_opened', current_file_name);
										
													reload_files_dict();
						
													if(!keyz(files).includes(file.name)){
														files[file.name] = {'loaded':true,'modified':false,'last_time_opened':Date.now(),'last_time_edited':0,'pin':0};
														localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
														//console.log("file_upload:  file.name,new_value: ", file.name, responseText);
														save_file(file.name,responseText);
													
														save_file_meta('type','text',folder,file.name);
														document.body.classList.add('show-document');
														editor_set_value(responseText);
													
														file_parsed();
													}
													else{
														if(confirm(get_translation("Overwrite_file") + " " + file.name)){
															files[file.name].loaded = true; // = {'loaded':true,'modified':false};;
															files[file.name].modifed = true;
															localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
															save_file(file.name,responseText);
														
															save_file_meta('type','text',folder,file.name);
															document.body.classList.add('show-document');
															editor_set_value(responseText);
														
															file_parsed();
														}
														else{
															file_parsed();
														}
													}
										
													//update_ui();
												}
										
										
										
										
										
										
										
										
										
										
											})
											.catch(err => {
												console.error("failed to extract content.xml from ODT file: ", err);
												an_error_occured = true;
												file_parsed();
											})
									
						
						
										})
										.catch(err => {
											console.error("failed to load ODT file as zip: ", err);
											an_error_occured = true;
											file_parsed();
										})
									}
									else{
										console.error("parsing ODT: no JSZIP");
										an_error_occured = true;
										file_parsed();
									}
								}
						
						
								// DOCX ALTERNATIVE
						
								else if(file.name.toLowerCase().endsWith('.docx')){
							
							
									window.add_script('./docxjs/docx-preview.min.js')
									.then((value) => {
								
										const docx_options = {};
								
										/*
		options: {
		        className: string = "docx", //class name/prefix for default and document style classes
		        inWrapper: boolean = true, //enables rendering of wrapper around document content
		        ignoreWidth: boolean = false, //disables rendering width of page
		        ignoreHeight: boolean = false, //disables rendering height of page
		        ignoreFonts: boolean = false, //disables fonts rendering
		        breakPages: boolean = true, //enables page breaking on page breaks
		        ignoreLastRenderedPageBreak: boolean = true, //disables page breaking on lastRenderedPageBreak elements
		        experimental: boolean = false, //enables experimental features (tab stops calculation)
		        trimXmlDeclaration: boolean = true, //if true, xml declaration will be removed from xml documents before parsing
		        useBase64URL: boolean = false, //if true, images, fonts, etc. will be converted to base 64 URL, otherwise URL.createObjectURL is used
		        renderChanges: false, //enables experimental rendering of document changes (inserions/deletions)
		        renderHeaders: true, //enables headers rendering
		        renderFooters: true, //enables footers rendering
		        renderFootnotes: true, //enables footnotes rendering
		        renderEndnotes: true, //enables endnotes rendering
		        renderComments: false, //enables experimental comments rendering
		        debug: boolean = false, //enables additional logging
		    })
									
									
										*/
										if(docx){
											docx.parseAsync(arrayBuffer,docx_options)
											.then(docx_object => {
												//console.log("docx_object: ", docx_object);
									
									
									
												if(typeof docx_object != 'undefined' && docx_object != null && typeof docx_object.documentPart != 'undefined' && typeof docx_object.documentPart.body != 'undefined' && typeof docx_object.documentPart.body.children != 'undefined' && Array.isArray(docx_object.documentPart.body.children)){
											
													let part_list = [];
											
													for(let p = 0; p < docx_object.documentPart.body.children.length; p++){
														//console.log("docx part: ", docx_object.documentPart.body.children[p]);
														let part = docx_object.documentPart.body.children[p];
												
												
														let paragraph = [];
												
														function dive_deeper(party) {
															//console.log("in dive_deeper.  party: ", party);
															if(typeof party.children != 'undefined' && Array.isArray(party.children)){
																for(let z = 0; z < party.children.length; z++){
																	if(party.children[z].children != 'undefined'){
																		//console.log("--> diving deeper");
																		dive_deeper(party.children[z]);
																	}
																	else if(typeof party.children[z].type != 'undefined' && typeof party.children[z].text == 'string'){
																		//console.log(party.children[z].text);
																		paragraph.push(party.children[z].text);
																	}
																}
															}
															else if(typeof party.type != 'undefined' && typeof party.text == 'string'){
																//console.log(party.text);
																paragraph.push(party.text);
															}
														}
														dive_deeper(part);
														part_list.push(paragraph.join(' '));
												
													}
											
													let doc_text = part_list.join('\n\n');
													//console.log("doc_text: ", doc_text);
											
													current_file_name = file.name;
													localStorage.setItem(folder + '_last_opened', current_file_name);
											
													reload_files_dict();
											
													if(!keyz(files).includes(file.name)){
														files[file.name] = {'loaded':true,'modified':false,'last_time_opened':Date.now(),'last_time_edited':0,'pin':0};
														localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
														//console.log("file_upload:  file.name,new_value: ", file.name, doc_text);
														save_file(file.name,doc_text);
													
														save_file_meta('type','text',folder,file.name);
														document.body.classList.add('show-document');
														editor_set_value(doc_text);
												
														file_parsed();
													}
													else{
														if(confirm(get_translation("Overwrite_file") + " " + file.name)){
															files[file.name].loaded = true; // = {'loaded':true,'modified':false};;
															files[file.name].modifed = true;
															localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
															save_file(file.name,doc_text);
														
															save_file_meta('type','text',folder,file.name);
															document.body.classList.add('show-document');
															editor_set_value(doc_text);
												
															file_parsed();
														}
														else{
															file_parsed();
														}
													}
	
												
												
													//update_ui();
											
											
											
											
											
												}
												else{
													console.error('unexpected or missing parts in docx_object: ', docx_object );
													an_error_occured = true;
													file_parsed();
												}
									
												/*
												current_file_name = file.name;
												localStorage.setItem(folder + '_last_opened', current_file_name);
					
												reload_files_dict();
					
												if(!keyz(files).includes(file.name)){
													files[file.name] = {'loaded':true,'modified':false,'last_time_opened':Date.now(),'last_time_edited':0,'pin':0};
													localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
													//console.log("file_upload:  file.name,new_value: ", file.name, new_value);
													save_file(file.name,new_value);
												}
												else{
													if(confirm(get_translation("Overwrite_file") + " " + file.name)){
														files[file.name].loaded = true; // = {'loaded':true,'modified':false};;
														files[file.name].modifed = true;
														localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
														save_file(file.name,new_value);
													}
												}

												save_file_meta('type','text',folder,file.name);
												document.body.classList.add('show-document');
												editor_set_value(new_value);
					
												update_ui();
												*/
									
									
											})
											.catch((err) => {
												console.error("caught error DocXjs parseAsync: ", err);
												an_error_occured = true;
												file_parsed();
											})
									
										}
										else{
											console.error("cannot parse .docx file: docx was undefined");
											an_error_occured = true;
											file_parsed();
										}
								
								
							
									})
									.catch((err) => {
										console.error("caught error loading in DocXjs module which can parse .docx files: ", err);
										an_error_occured = true;
										file_parsed();
									})
					
								}
						
						
						
								// PDF
						
								else if(file.name.toLowerCase().endsWith('.pdf')){
									//console.log("filename ends with .pdf");
					                //pdff.pdfToText(event.target.result, null, (text) => {
							
									try {
									    //const pdfData = await PDFParse.loadPDF(dataBuffer);
							
							
										//./js/pdf.min.js
								
								
								
										window.add_script('./pdf_parse2.js',true) // load as module
										.then((value) => {
											//console.log("filename ends with .pdf -> pdf_parse2.js has loaded.  value,arrayBuffer: ", value, arrayBuffer);
											const extract_from_pdf = async () => {
												
												//console.log("extract_from_pdf:  window.pdf_parser,arrayBuffer: ", window.pdf_parser,arrayBuffer);
												
												window.pdf_parser.loadPDF(arrayBuffer)
												.then((pdfData) => {
							
													//console.log('pdfData:', pdfData);
												    console.log('pdfData.Text:', pdfData.text);
						
													new_value = pdfData.text;
													
													//new_value = new_value.replaceAll('\n','\n\n');
													//new_value = new_value.replaceAll("[\w](\n)[\w]","\\\s");
													new_value = new_value.replaceAll(/(\w+)(\n)(\w+)/g, "$1 $3");
													new_value = new_value.replaceAll(/(\w+,)(\n)(\w+)/g, "$1 $3");
													new_value = new_value.replaceAll(/(\w+)(\-\n)(\w+)/g, "$1$3");
													new_value = new_value.replaceAll(/(\w+)(\n)(\-\w+)/g, "$1 $3");
													new_value = new_value.replaceAll(/(\w+;)(\n)(\w+)/g, "$1 $3");
													new_value = new_value.replaceAll(/(\w+)(\n)(\(\w+)/g, "$1 $3");
							
													new_value = new_value.replaceAll(/(\w+\.\s)(\n)(\w+)/g, "$1\n\n$3");
													new_value = new_value.replaceAll(/(\w+\.)(\n)(\w+)/g, "$1\n\n$3");
													new_value = new_value.replaceAll(/(\w+\)\.)(\n)(\w+)/g, "$1\n\n$3");
													new_value = new_value.replaceAll(/(\w+\?)(\n)(\w+)/g, "$1\n\n$3");
													new_value = new_value.replaceAll(/(\w+\:)(\n)(\w+)/g, "$1\n\n$3");
													new_value = new_value.replaceAll(/(\w+\!)(\n)(\w+)/g, "$1\n\n$3");
							
													current_file_name = file.name;
													localStorage.setItem(folder + '_last_opened', current_file_name);
						
													reload_files_dict();
						
													if(!keyz(files).includes(file.name)){
														files[file.name] = {'loaded':true,'modified':false,'last_time_opened':Date.now(),'last_time_edited':0,'pin':0};
														localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
														//console.log("file_upload:  file.name,new_value: ", file.name, new_value);
														save_file(file.name,new_value)
														.then(() => {
															save_file_meta('type','text',folder,file.name);
															editor_set_value(new_value);
															document.body.classList.add('show-document');
													
															file_parsed();
														})
														.catch((err) => {
															console.error("caught error saving new PDFfile: ", err);
															file_parsed();
														})
													
													
													}
													else{
														if(confirm(get_translation("Overwrite_file") + " " + file.name)){
															files[file.name].loaded = true; // = {'loaded':true,'modified':false};;
															files[file.name].modifed = true;
															localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
															save_file(file.name,new_value)
															.then(() => {
																save_file_meta('type','text',folder,file.name);
																editor_set_value(new_value);
																document.body.classList.add('show-document');
													
																file_parsed();
															})
															.catch((err) => {
																console.error("caught error saving new PDFfile: ", err);
																file_parsed();
															})
														}
														else{
															file_parsed();
														}
													}
	
												
													//update_ui();
							
												})
												.catch((err) => {
													console.error("caught error extracting text from PDF file: ", err);
													an_error_occured = true;
													file_parsed();
												})
											}
									
											//if(window.pdf_parser == null){}
											setTimeout(() => {
												if(window.pdf_parser){
													console.error("Going to extract from PDF");
													//const pdf_parser = new PDFParse();
													extract_from_pdf();
											
												}
												else{
													console.error("window.pdf_parser was still undefined");
													setTimeout(() => {
														if(window.pdf_parser){
															//const pdf_parser = new PDFParse();
															extract_from_pdf();
											
														}
														else{
															console.error("window.pdf_parser was still undefined");
															an_error_occured = true;
															file_parsed();
														}
													},3000);
												}
											},1000);
									
									
							
									
										//const pdfData = await window.pdf_parser.loadPDF(arrayBuffer);
										})
										.catch((err) => {
											console.error("caught error loading in pdf_parse2.js module which can parse .pdf files: ", err);
											an_error_occured = true;
											file_parsed();
										})
							
							
									} 
									catch (err) {
									    console.error("error extracting text from pdf: ", err);
										an_error_occured = true;
										file_parsed();
									}
						
							
									/*
									pdff.pdfToText(new_value, null, (text) => {
										//console.log(".pdf -> as text: ", text);
										new_value = text;
							
										current_file_name = file.name;
										localStorage.setItem(folder + '_last_opened', current_file_name);
							
										reload_files_dict();
							
										if(!keyz(files).includes(file.name)){
											files[file.name] = {'loaded':true,'modified':false,'last_time_opened':Date.now(),'last_time_edited':0,'pin':0};
											localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
											//console.log("file_upload:  file.name,new_value: ", file.name, new_value);
											save_file(file.name,new_value);
										}
										else{
											if(confirm(get_translation("Overwrite_file") + " " + file.name)){
												files[file.name].loaded = true; // = {'loaded':true,'modified':false};;
												files[file.name].modifed = true;
												localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
												save_file(file.name,new_value);
											}
										}
		
										save_file_meta('type','text',folder,file.name);
							
										editor_set_value(new_value);
							
										update_ui();
							
									});
									*/
								}
					
					
					
					
					
								/*
								if(file.name.toLowerCase().endsWith('.docx')){
						
									window.add_script('./js/mammoth.browser.min.js',true) // load as module
									.then((value) => {
						
						
										mammoth.convertToMarkdown({arrayBuffer})
										.then(function (resultObject) {
									        //result3.innerHTML = resultObject.value
									        console.log("raw mammoth .docx conversion resultObject: ", resultObject)
							
											const new_value = resultObject.value;
											current_file_name = file.name;
											localStorage.setItem(folder + '_last_opened', current_file_name);
						
											reload_files_dict();
						
											if(!keyz(files).includes(file.name)){
												files[file.name] = {'loaded':true,'modified':false,'last_time_opened':Date.now(),'last_time_edited':0,'pin':0};
												localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
												//console.log("file_upload:  file.name,new_value: ", file.name, new_value);
												save_file(file.name,new_value);
											}
											else{
												if(confirm(get_translation("Overwrite_file") + " " + file.name)){
													files[file.name].loaded = true; // = {'loaded':true,'modified':false};;
													files[file.name].modifed = true;
													localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
													save_file(file.name,new_value);
												}
											}
	
											save_file_meta('type','text',folder,file.name);
											document.body.classList.add('show-document');
											editor_set_value(new_value);
						
											update_ui();
							
							
										})
										.catch((err) => {
											console.error("caught error while using Mammoth to extract text from DOCX file: ", err);
										})
							
									})
									.catch((err) => {
										console.error("caught error loading in Mammoth JS module which can parse .docx files: ", err);
									})
					
								}
								*/
					
					
					
								/*
								else if(file.name.toLowerCase().endsWith('.epub')){
									//console.log("filename ends with .epub.  arrayBuffer: ", arrayBuffer);
									try {
									    //const epubData = await EPUBParse.loadEPUB(dataBuffer);
							
										window.add_script('./epub_module.js',true) // load as module
										.then((value) => {
											//console.log("load of EPUB parser module finished. Next step: parse the arrayBuffer object.  value: ", value);
											//console.log("window.epub_parser: ", window.load_epub);
											if(typeof window.load_epub == 'function'){
												//console.log("window.load_epub exists");
									
												window.load_epub(arrayBuffer, file.name)
												.then((book) => {
													//console.log("epub book:", book);
													if(book == null){
														console.error("failed to read epub");
													}
													else{
														//console.log("GOT EPUB BOOK!");
													}
												})
												.catch((err) => {
													console.error("caught error doing load_epub: ", err);
												})
									
											}
								
										})
										.catch((err) => {
											console.error("caught error loading EPUB parser script: ", err);
										})
							
							
							
							
							
									} 
									catch (err) {
									    console.error("error extracting text from epub: ", err);
									}
							
						
								}
								*/
								else if(typeof new_value == 'string' && filename_is_binary(file.name) == false){
									//console.log("uploaded file is a basic text file: ", file.name);
						
									current_file_name = file.name;
									localStorage.setItem(folder + '_last_opened', current_file_name);
						
									reload_files_dict();
						
									if(!keyz(files).includes(file.name)){
										files[file.name] = {'loaded':true,'modified':false,'last_time_opened':Date.now(),'last_time_edited':0,'pin':0};
										localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
										//console.log("file_upload:  file.name,new_value: ", file.name, new_value);
										save_file(file.name,new_value);
									
										save_file_meta('type','text',folder,file.name);
										editor_set_value(new_value);
									
										file_parsed();
									}
									else{
										if(confirm(get_translation("Overwrite_file") + " " + file.name)){
											files[file.name].loaded = true; // = {'loaded':true,'modified':false};;
											files[file.name].modifed = true;
											localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
											save_file(file.name,new_value);
										
											save_file_meta('type','text',folder,file.name);
											editor_set_value(new_value);
										
											file_parsed();
										}
										else{
											file_parsed();
										}
									}
	
								
						
									//update_ui();
						
								}
					
								else if( filename_is_binary(file.name) && typeof new_value != 'string'){
									//console.log("adding _PLAYGROUND_BINARY_ buffer_to_string-ified file array buffer value");
									//new_value = '_PLAYGROUND_BINARY_' + buffer_to_string(new_value);   //new TextDecoder().decode(new_value);
									new_value = '_PLAYGROUND_BINARY_' + buffer_to_string(new_value);   //new TextDecoder().decode(new_value);
									//console.error("binary image/media decoded to text: ", new_value);
									current_file_name = file.name;
									localStorage.setItem(folder + '_last_opened', current_file_name);
		
									reload_files_dict();
		
									if(!keyz(files).includes(file.name)){
										files[file.name] = {'loaded':true,'modified':false,'last_time_opened':Date.now(),'last_time_edited':0,'pin':0};
										localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
										//console.log("file_upload:  file.name,new_value: ", file.name, new_value);
										save_file(file.name,new_value);
									
										if(filename_is_binary_image(file.name)){
											save_file_meta('type','image',folder,file.name);
										}
										else if(filename_is_media(file.name)){
											save_file_meta('type','media',folder,file.name);
										}
										else{
											save_file_meta('type','text',folder,file.name);
										}
				
										//editor_set_value(event.target.result); // or new_value?
										editor_set_value(new_value); // or new_value?
									
										file_parsed();
									}
									else{
										if(confirm(get_translation("Overwrite_file") + " " + file.name)){
											files[file.name].loaded = true; // = {'loaded':true,'modified':false};;
											files[file.name].modifed = true;
											localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
											save_file(file.name,new_value);
										
											if(filename_is_binary_image(file.name)){
												save_file_meta('type','image',folder,file.name);
											}
											else if(filename_is_media(file.name)){
												save_file_meta('type','media',folder,file.name);
											}
											else{
												save_file_meta('type','text',folder,file.name);
											}
				
											//editor_set_value(event.target.result); // or new_value?
											editor_set_value(new_value); // or new_value?
										
											file_parsed();
										}
										else{
											file_parsed();
										}
									}
						
								
								}
					
						    }
				            catch(e){
				            	console.error("caught error analyzing read file bufferArray for file type: ", e);
								an_error_occured = true;
								file_parsed();
								//return
				            }
			
			
			
			
			
					    }
						//console.error("\n\n\nfilename_is_binary_image(file.name): ", filename_is_binary_image(file.name));
						if(filename_is_binary(file.name) || file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.epub') || file.name.toLowerCase().endsWith('.odt') ){
							//console.log("file_upload: filereader: reading binary file");
							//reader.readAsBinaryString(file);
							reader.readAsArrayBuffer(file);
							//reader.readAsDataURL(file);
						}
						else{
							//console.log("file_upload: filereader: reading file text");
							reader.readAsText(file);
						}
	    
	    
						/*
					    if(file.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
					    }
					    else if(file.name.endsWith('.json')){
					    }
						*/
				
					}
			
				}
				catch(e){
					console.error("file_upload: caught error: ", e);
					an_error_occured = true;
					file_parsed();
				}
			
			})
			
			file_promises.push(file_upload_promise);
			
		}
		
		//console.log("file_promises.length: ", file_promises.length);
		
		return Promise.all(file_promises)
		.then((values) => {
			//console.log("file upload promise.ALL done. values: ", values);
			//get_files_dict();
			//update_ui();
		})
		.catch((err) => {
			console.error("file upload promise all caught error: ", err);
		})
	
	    //update_ui();
	//});
}



function save_blob(blob,filename){
	//console.log("in save_blob.  blob,filename: ", typeof blob, blob, filename);
	var reader = new FileReader();
	
	reader.onloadend = () => {
		var new_value = reader.result;                
		//console.log("base64data of blob: ", new_value);
		if( filename_is_binary(filename)){
			//console.log("blob filename indicated binary");
			new_value = '_PLAYGROUND_BINARY_' + buffer_to_string(new_value);
			
			current_file_name = filename;
			localStorage.setItem(folder + '_last_opened', current_file_name);

			reload_files_dict();

			if(!keyz(files).includes(filename)){
				files[filename] = {'loaded':true,'modified':false};
				localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
				//console.log("file_upload:  file.name,new_value: ", filename, new_value);
				save_file(filename,new_value);
			}
			else{
				if(confirm(get_translation("Overwrite_file") + " " + filename)){
					files[filename].loaded = true; // = {'loaded':true,'modified':false};;
					files[filename].modifed = true;
					localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
					save_file(filename,new_value);
				}
			}

			if(filename_is_binary_image(filename)){
				save_file_meta('type','image',folder,filename);
			}
			else if(filename_is_audio(filename)){
				save_file_meta('type','audio',folder,filename);
			}
			else if(filename_is_video(filename)){
				save_file_meta('type','video',folder,filename);
			}
			else if(filename_is_media(filename)){
				save_file_meta('type','media',folder,filename);
			}
			else{
				save_file_meta('type','text',folder,filename);
			}
		
			//editor_set_value(event.target.result); // or new_value?
			editor_set_value(new_value); // or new_value?
		}
		else{
			console.error("save_blob: should be used to store binary blobs. Provided filename does not indicate binary file");
		}
		
	}
	//reader.readAsDataURL(blob); 
	reader.readAsArrayBuffer(blob);
}
window.save_blob = save_blob;








// from https://stackoverflow.com/questions/6848043/how-do-i-detect-a-file-is-being-dragged-rather-than-a-draggable-element-on-my-pa
function isDragSourceExternalFile(dataTransfer){
    // Source detection for Safari v5.1.7 on Windows.
    if (typeof Clipboard != 'undefined') {
        if (dataTransfer.constructor == Clipboard) {
            if (dataTransfer.files.length > 0)
                return true;
            else
                return false;
        }
    }

    // Source detection for Firefox on Windows.
    if (typeof DOMStringList != 'undefined'){
        var DragDataType = dataTransfer.types;
        if (DragDataType.constructor == DOMStringList){
            if (DragDataType.contains('files'))
                return true;
            else
                return false;
        }
    }

    // Source detection for Chrome on Windows.
    if (typeof Array != 'undefined'){
        var DragDataType = dataTransfer.types;
        if (DragDataType.constructor == Array){
            if (DragDataType.indexOf('files') != -1)
                return true;
            else
                return false;
        }
    }
}




// https://stackoverflow.com/questions/70731074/how-to-load-content-from-external-file-in-js-to-variable
function load_file_from_outside(target_folder,target_file,intensity=null){
	if(intensity == null){intensity = 'display'}
	//console.log("in load_file_from_outside. target_folder,target_file: ", target_folder,target_file);
	
	let relative_path = '';
	if(target_folder == null){
		target_folder = folder;
	}
	if(target_file == null){
		target_file = current_file_name;
	}
	
	
	relative_path = target_folder + '/' + target_file;
	
	if(target_folder != '' && !relative_path.startsWith('/')){
		relative_path = '/' + relative_path;
	}
	relative_path =  '..' + relative_path;
	
	//console.log("load_file_from_outside. relative_path: ", relative_path);
	relative_path = relative_path.replaceAll('//','/');
	
 	return new Promise(function(resolve, reject) {
		
		if(target_file == unsaved_file_name){
			//console.log("cannot load notepad from outside");
			reject('');
			return '';
		}
		
		// Load locally via iframe (untested)
		if(serverless){
			console.error("load_file_from_outside: ROUTE 1: loading file via iframe: ", target_folder,'/',target_file,intensity);
			var iframe = document.createElement('iframe');
	        iframe.id = 'iframe';
	        iframe.style.display = 'none';
	        document.body.appendChild(iframe);
	        iframe.src = relative_path;
	        iframe.onload = function(){
				if(document.getElementById('iframe').contentDocument){
		            var text = document.getElementById('iframe').contentDocument.body.firstChild.innerHTML;
					if(intensity == 'display'){
						editor_set_value(text);
						post_file_load();
						resolve(text);
					}
		            else if(intensity == 'save'){
						//console.log("load_file_from_outside:  intensity was save, should save.");
						if(target_folder == folder){
							save_file(target_file,text,'browser',target_folder,true) // force save
							.then((value) => {
								//console.log("open_file: also saved the newly opened file.  value: ", value);
								resolve(text);
							})
							.catch((err) => {
								console.error("open_file: also saving the newly opened file caused an error: ", err);
								reject(err);
							})
						}
						else{
							console.error("load_file_from_outside does not support saving files to other folders than the currently open one yet.  target_folder,folder: ", target_folder, folder);
							reject(err);
						}
					}
				}
	            else{
	            	console.error("loading local document via iframe failed");
	            }
				
	        }
		}
		
		// Load file directly as text file
		//else if( ! relative_path.endsWith('.php') && ! relative_path.endsWith('.zip') && ! relative_path.endsWith('.png')){
		else if( text_file_extensions.includes( get_file_extension(relative_path.toLowerCase()) )){
			console.error("load_file_from_outside: ROUTE 2: loading text file via XMLHTTPREQUEST: ", target_folder,'/',target_file,intensity);
			var txtFile = new XMLHttpRequest();
			txtFile.onload = function(e) {
				
				//console.log("txtFile: ", txtFile);
				//console.log("txtFile.response: ", typeof txtFile.response, txtFile.response);
				let text = txtFile.responseText;
				
				if(intensity == 'display'){
					editor_set_value(text);
					post_file_load();
					resolve(text);
				}
	            else if(intensity == 'save'){
					//console.log("load_file_from_outside:  intensity was save, should save. TODO");
					if(target_folder == folder){
						save_file(target_file,text,'browser',target_folder,true) // force save
						.then((value) => {
							//console.log("open_file: also saved the newly opened file.  value: ", value);
							resolve(text);
						})
						.catch((err) => {
							console.error("open_file: also saving the newly opened file caused an error: ", err);
							reject(err);
						})
					}
					else{
						console.error("load_file_from_outside does not support saving files to other folders than the currently open one yet.  target_folder,folder: ", target_folder, folder);
						reject(err);
					}
				}
				
			}
			txtFile.open("GET", relative_path, true); 
			txtFile.send(null);
		}
		
		// Load PHP file via ajax
		else{
			console.error("load_file_from_outside: ROUTE 2: loading via AJAX: ", target_folder,'/',target_file,intensity);
		
			let action = 'display_file';
			if(intensity != 'display'){
				action = 'load_file'; // this forces save further down the line
			}
			
			// payload object
			const options = {
				'action': action,
				'folder': target_folder,
				'target_file':target_file,
				'password':password_hash
				//'data':btoa(unescape(encodeURIComponent( playground_live_backups[folder + '/' + filename] ))) //btoa(new_data)
			}
			//console.log("load_file_from_outside:  fetch PHP: options: ", options);
	
			var responseCopy;
		    const url = "playground.php";
		    fetch(url, {
		        method : "POST",
		        //mode: "cors", // no-cors, *cors, same-origin
		        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
		        //credentials: "same-origin", // include, *same-origin, omit
		        headers: {
		          //'Accept': 'application/json',
		          "Content-Type": "application/json",
		        },
		        body : JSON.stringify(options)
		    })
		    .then(function(res){
			
				responseCopy = res.clone();
				console.error("OPEN_FILE: GOT FETCH RESPONSE: ", responseCopy);
		        //console.warn("ajax raw response: ", JSON.stringify(res.text(),null,2));
				//console.warn("ajax raw response: ", res.text());
				resolve(responseCopy);
		        return res.json(); 
			})
			.catch(function (err) {
				console.error("error in  open_file: fetch:  err:", err);
				reject(err);
			
				if (err instanceof SyntaxError) {
					return responseCopy.text()
					.then(function(text) {
						console.error(text);
						throw err;
					});
				}
				else {
					throw err;
				}
			
			})
		    .then(function(data){ 
				console.warn("\n\nopen_file: THEN: options, data\n", options, data);
				
				/*
				//console.log("zip text file loaded. data.content: ", data.content);
				const text = data.content;
				
				console.warn("zip Base64 decode: ", Base64.decode(data.content));
				
				//const zip_buffer = base64ToArrayBuffer(data.content); //string_to_buffer(text);
				const zip_buffer = string_to_buffer( Base64.decode(data.content) );
				//console.log("zip_buffer: ", typeof zip_buffer, zip_buffer);
				
				var new_zip = new JSZip();

				new_zip.loadAsync(zip_buffer)
				.then(function(zip) {
					console.error("ZIP ZIP zip: ", zip);
		
					zip.forEach(function (relativePath, zipEntry) { 
						//console.log("zipEntry.name: ", relativePath, zipEntry.name);
					});
		
				});
				*/
				
		        ajax_response( data );
				resolve(data);
				//open_folder(target_folder);
			})
			.catch(function (err) {
				console.error("second error in  open_file: fetch:  err:", err);
				reject(err);
			})
			
			
		}
	});
	
}




function dataURIToiFrame(dataURI) {

	function dataURIToBlob(dataURI) {

		let binStr = window.atob(dataURI.split(',')[1]),
        len = binStr.length,
        arr = new Uint8Array(len),
        fString = dataURI.split(',')[0].split(':')[1].split(';')[0];

		for (let i = 0; i < len; i++) {
			arr[i] = binStr.charCodeAt(i);
		}

		return new Blob([arr], {type: mimeString});

	}

	let iframe = document.getElementById("iframe1");
    if (!iframe) {
		//draggable_dialog_content_el.innerHTML = '';
		// $('#iframe1_wrapper').remove()
		draggable_dialog_content_el.innerHTML = `<iframe id="iframe1" style="width:100%;height:100%; padding:0px;"></iframe>`;
		iframe = document.getElementById("iframe1");
    }

	iframe.src = URL.createObjectURL(dataURIToBlob(dataURI));       
}



function settled(){
	//console.log("in settled. diffing: ", diffing);
	
	//console.log("settled: setting window.doc_text");
	// used by AI chat
	
	// Why is settled setting the value of window.doc_text in the first place?
	
	
	
	
	function_index_el.innerHTML = '';
	
	if(typeof current_file_name != 'string'){
		console.error("settled: current_file_name was not a string, it was: ", typeof current_file_name, current_file_name);
		return false
	}
		
	//console.log("settled: calling savr.  current_file_name, and data: ", current_file_name, playground_live_backups[folder + '/' + current_file_name]);
	if(typeof playground_live_backups[folder + '/' + current_file_name] != 'string'){
		//console.warn('settled: no value in playground_live_backups. file must have just been saved');
		if(typeof playground_saved_files[folder + '/' + current_file_name] == 'string' && playground_saved_files[folder + '/' + current_file_name] != '_PLAYGROUND_BINARY_' && !playground_saved_files[folder + '/' + current_file_name].startsWith('_PLAYGROUND_BINARY_') ){
			console.warn("settled: falling back to setting window.doc_text from playground_saved_files");
			//window.doc_text = playground_saved_files[folder + '/' + current_file_name]; //code;
			//window.doc_length = playground_saved_files[folder + '/' + current_file_name].length; //code.length;
		}
	}
	else{
		//console.log("settled: calling savr to store the playground_live_backups data in the indexDB");
		if(typeof playground_saved_files[folder + '/' + current_file_name] == 'string' && playground_live_backups[folder + '/' + current_file_name] != '_PLAYGROUND_BINARY_' && !playground_live_backups[folder + '/' + current_file_name].startsWith('_PLAYGROUND_BINARY_') && typeof playground_live_backups[folder + '/' + current_file_name] == 'string' && playground_live_backups[folder + '/' + current_file_name] != '_PLAYGROUND_BINARY_' && playground_live_backups[folder + '/' + current_file_name] != playground_saved_files[folder + '/' + current_file_name] ){
			savr(folder + '/playground_backup_' + current_file_name, playground_live_backups[folder + '/' + current_file_name]);
			//window.doc_text = playground_live_backups[folder + '/' + current_file_name]; //code;
			//window.doc_length = playground_live_backups[folder + '/' + current_file_name].length; //code.length;
		}
	
	}


	// doc_settled is in chatty_docs.js. It mostly tries to guess the language of the current document, and updates body classes that indicate the length of the document, such as 'doc-has-little-text'.
	doc_settled()
	.then((value) => {
		doc_updated();
	})
	.catch((err) => {
		//console.error("playground main.js code has settled: caught error trying to ascertain language of document: ", err);
		document.body.classList.remove('unknown-language');
		doc_updated();
		//return
	})

	// Not sure why this has to stop here if doing_documents_search is active. Maybe it clears the sidebar with sources?
	if(document.body.classList.contains('doing-documents-search')){
		return
	}
	
	
	
	if(current_file_name.toLowerCase().endsWith('.js')){
		//console.log("settled: file is javascript file, creating functions list")
		update_ui_function_list();
	}
	else if(current_file_name.toLowerCase().endsWith('.css')){
		update_ui_css_list();
	}
	
	if(diffing){
		differ();
	}
	
	if(function_index_el.innerHTML == '' && debugging){
		debug_popup();
	}
	
}



function reset_line_bookmark(){
	//console.log("in reset_line_bookmark");
	line_bookmark_button_el.innerHTML = '<span class="unicode-icon rotate-45">🏷️</span>';
	line_bookmark_button_el.classList.remove('bookmarked');
	remembered_selection = null;
	remembered_selection_filename = null;
	remembered_selection_folder = null;
	remembered_line_nr = null;
}

function line_bookmark(){
	//console.log("in line_bookmark");
	if(typeof current_line_nr == 'number'){
		if(line_bookmark_button_el.innerText == '🏷️'){
			if(current_selection != null && current_line_nr != null){
				line_bookmark_button_el.classList.add('bookmarked');
				line_bookmark_button_el.innerHTML = current_line_nr;
				remembered_selection_filename = current_file_name;
				remembered_selection_folder = folder;
				remembered_selection = current_selection;
				remembered_line_nr = current_line_nr;
				//console.log("line_bookmark set for: ", remembered_selection_folder, remembered_selection_filename, remembered_line_nr, remembered_selection);
			}
		}
		else if(remembered_selection != null){
			//console.log("line_bookmark: jumping back to: ", remembered_selection_folder, remembered_selection_filename, remembered_line_nr, remembered_selection);
			if(remembered_selection_filename != current_file_name){
				open_file(remembered_selection_filename,null,remembered_selection_folder)
				.then((value) => {
					//console.log("\n\n\n\n\n\n\nHURRAY, open_file .then worked. value: ", value);
					scroll_to_selection(remembered_selection);
					reset_line_bookmark();
				});
			}
			else{
				scroll_to_selection(remembered_selection);
				reset_line_bookmark();
			}	
		}
		else{
			console.error("bookmark failed, resetting");
			reset_line_bookmark();
		}
	}
	
}


let initial_db_keys = [];



window.indexdb_worker = new Worker("./indexdb_worker.js");

window.indexdb_worker.addEventListener('error', (error) => {
	console.error("ERROR: indexdb_worker sent error: ", error);
});


window.indexdb_worker.onmessage = (e) => {
	//console.log("Message received from indexdb worker: ", e.data);
	handle_indexdb_worker_response(e.data);	
};


async function handle_indexdb_worker_response(e_data){
	//console.log("in handle_indexdb_worker_response. e_data: ", e_data);
	if(e_data.action == 'get_playground_live_backups'){
		playground_live_backups = e_data.result['playground_live_backups'];
		playground_saved_files = e_data.result['playground_saved_files'];
		initial_db_keys = e_data.result['initial_db_keys'];
		//console.log("Message received from indexdb worker: initial_db_keys: ", initial_db_keys);
		document.body.classList.remove('busy-restoring-files');
		
		
		//console.log("indexdb -> playground_live_backups is now: ", playground_live_backups);
		//console.log("indexdb -> playground_saved_files is now: ", playground_saved_files);
		//console.log("indexdb -> initial_db_keys is now: ", initial_db_keys);
		
		// Get initial list of files and folders at the parent level (..).
		if(!serverless){
			//console.log("\n\n\n\n\ncalling initial ajax, then open_folder\n\n\n\n\n");
			ajax()
			.then(function(values){
				//console.log("\n\n\n\n\najax done, calling initial open_folder\n\n\n\n\n");
				open_folder();
			})
			.catch(function(err){
				console.error("iniial ajax.then error: ", err);
			})
		}
		else{
			//console.log("\n\n\n\n\ncannot use ajax (serverless). Calling initial open_folder\n\n\n\n\n");
			if(window.settings.docs.open != null){
				const before_time = Date.now();
				open_folder();
				//console.log("open_folder took this long: ", Date.now() - before_time);
			}
			else{
				//console.log("playground: loading file data only, not opening file");
				reload_folder_dict();
				
				files = get_files_dict();
				//console.log("playground: files: ", files);
				//reload_files_dict();
				update_ui();
				
				// For AI Chat
				//console.log("early current_file_name: ", current_file_name);
				if(typeof current_file_name == 'string' && folder == 'string'){
					
					window.settings.docs.open = {'filename':current_file_name,'folder':folder}
				}
				//update_ui_file_menu(files);
			}
			
		}
		
		
		// For Chat AI project
		window.file_data_loaded();
		window.indexdb_worker.terminate();
	}
}



window.indexdb_worker.postMessage({'action':'get_playground_live_backups'});
//console.log("get_playground_live_backups message posted to indexdb worker");



function load_file_data_only(){
	
	
}


async function parse_epub(book){
	//console.log("main.js: in parse_epub. Book: ", book);
	let full_epub_text = '';
	for(let s = 0; s < book.sections.length; s++){
		
		if(typeof book.sections[s].linear == 'string' && book.sections[s].linear == 'no'){
			//console.log("Skipping part of epub that is designated as 'non-linear' (not part of the main text)");
		}
		else{
			
			const section_html = await book.sections[s].createDocument();
			//console.log("parse_epub: section_html: ", typeof section_html, section_html);
			let section_text = parse_epub_section(section_html);
			
			full_epub_text += '\n\n' + section_text + '\n\n';
			
			
		}
	}
	
	return full_epub_text;
}


function parse_epub_section(fileData){
	if(typeof fileData == 'undefined' || fileData == null){
		console.error("parse_epub_section: invalid fileData provided");
		return 'error loading EPUB document section';
	}
	//console.log("parse_epub_section: fileData: ", typeof fileData, fileData);
	
	
	let xmlDoc = null;
	if(typeof fileData == 'string'){
		const parser = new DOMParser();
		xmlDoc = parser.parseFromString(fileData,"text/xml");
	}
	else if(typeof fileData == 'object'){
		xmlDoc = fileData;
	}
	else{
		console.error("parse_epub_section: unexpected fileData type: ", typeof fileData, fileData);
		return 'error loading EPUB document section';
	}
	

	//let p_tags = xmlDoc.querySelectorAll('text:p');
	//console.log("xmlDoc: p_tags: ", p_tags);

	if(typeof xmlDoc.body != 'undefined'){
		//console.log("parse_epub_section: xmlDoc.body: ", xmlDoc.body);
	}
	if(typeof xmlDoc['xmlns:epub'] != 'undefined'){
		//console.log("parse_epub_section: xmlDoc: has xmlns:epub: ", xmlDoc['xmlns:epub']);
	}

	//document.getElementById("demo").innerHTML = xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue;


	//console.log("parse_epub_section: xmlDoc: ", xmlDoc);

	let config = {};

	let notesText = [];
	let responseText = "";

	//const allowedTextTags = ["text:p", "text:h"];
	const allowedTextTags = ["p","h1","h2","h4","h4","h5","h6","quote","pre","span"];
	const notesTag = "presentation:notes";

	// Main dfs traversal function that goes from one node to its children and returns the value out.
	function extractAllTextsFromNode(root,tagname) {
		//console.log("in extractAllTextsFromNode. root, tagname: ", typeof root, root, tagname);
		//console.log("epub: root: ", Object.keys(root), Object.values(root));
		
		
		if(typeof window.html_to_markdown != 'undefined'){
			let raw_html = root.innerHTML;
			/*
			if(raw_html.indexOf('hen a voice she had never heard befo') != -1){
				console.error("then a voice she had never heard before: ", root, raw_html);
			}
			*/
			//console.log("raw_html: ", raw_html);
			if(typeof raw_html == 'string'){
				
				// remove page indicators first
				if(raw_html.indexOf('<a') != -1){
					raw_html = raw_html.replaceAll("<a(?:(?!\bhref=)[^>])*><\/a>", ""); // /abc/g
				}
				
				// If there still are other HTML elements in the paragraph, turn them into markdown
				if(raw_html.indexOf('<') != -1 && raw_html.indexOf('>')){
					let markdown = window.html_to_markdown.render(raw_html);
					//console.log("used window.html_to_markdown on non-p element.  tagname, markdown:  ", tagname, markdown);
					if(typeof markdown == 'string' && markdown.indexOf('#') != -1 && markdown.indexOf('\n') != -1){
						let markdown_lines = markdown.split('\n');
						for(let l = 0; l < markdown_lines.length; l++){
							let trimmed_line = markdown_lines[l].trim();
							//console.log("trimmed_line: -->" + trimmed_line + "<--");
							if(trimmed_line == '#' || trimmed_line == '##' || trimmed_line == '###' || trimmed_line == '####' || trimmed_line == '#####' || trimmed_line == '######'){
								//console.log("parse_epub_section: extractAllTextsFromNode: removing hash characters from empty header line from html_to_markdown output: ", markdown_lines[l]);
								markdown_lines[l] = markdown_lines[l].replaceAll('#','');
							}
						}
						markdown = markdown_lines.join('\n');
					}
					return markdown;
				}
				else{
					return root.textContent;
				}
				
				
			}
			else{
				console.error("html_to_markdown did not return a string: ", typeof markdown, markdown);
				return 'ERROR reading epub document';
			}
		}
		else{
			console.error("window.markdown_to_html did not exist");
			let textContent = root.textContent;
		
			let markdown_prefix = '';
			if(tagname.length == 2 && tagname.startsWith('h')){
				const header_size = parseInt(tagname.substr(1));
				if(typeof header_size == 'number' && header_size > 0 && header_size < 7){
					for(let hs = 0; hs < header_size; hs++){
						markdown_prefix += '#';
					}
					markdown_prefix = markdown_prefix + ' ';
					//console.log("parse_epub_section: markdown_prefix: ", markdown_prefix);
				}
			}
		
			return markdown_prefix + textContent;
		}
		 
		
	}
	
	
	// Traversal function that gets recursive calling.
	function traversal(node, xmlTextArray, isFirstRecursion) {
	    if(!node.childNodes || node.childNodes.length == 0)
	    {
	        if (node.parentNode.tagName.indexOf('text') == 0 && node.nodeValue) {
	            if (isNotesNode(node.parentNode) && (config.putNotesAtLast || config.ignoreNotes)) {
	                notesText.push(node.nodeValue);
	                if (allowedTextTags.includes(node.parentNode.tagName) && !isFirstRecursion)
	                    notesText.push(config.newlineDelimiter ?? "\n");
	            }
	            else {
	                xmlTextArray.push(node.nodeValue);
	                if (allowedTextTags.includes(node.parentNode.tagName) && !isFirstRecursion)
	                    xmlTextArray.push(config.newlineDelimiter ?? "\n");
	            }
	        }
	        return;
	    }

	    for (let i = 0; i < node.childNodes.length; i++){
	    	traversal(node.childNodes[i], xmlTextArray, false);
	    }
	        
	}

	// Checks if the given node has an ancestor which is a notes tag. We use this information to put the notes in the response text and its position.
	function isNotesNode(node) {
	    if (node.tagName == notesTag)
	        return true;
	    if (node.parentNode)
	        return isNotesNode(node.parentNode);
	    return false;
	}

	// Checks if the given node has an ancestor which is also an allowed text tag. In that case, we ignore the child text tag.
	function isInvalidTextNode(node) {
	    if (allowedTextTags.includes(node.tagName))
	        return true;
	    if (node.parentNode)
	        return isInvalidTextNode(node.parentNode);
	    return false;
	}



    const xmlTextNodesList = [...Array.from(xmlDoc
                                    .getElementsByTagName("*"))
                                    .filter(node => allowedTextTags.includes(node.tagName))
                                    //    && !isInvalidTextNode(node.parentNode))
                                ];


	//console.log("EPUB xmlTextNodesList: ", xmlTextNodesList);
	
	
	// Detect indentation through the entire chapter, and remove it.
	let total_lines_count = 0;
	let lines_that_start_with_indentation_count = 0;
	let indentation_dict = {};
	
	let indented_lines = [];
	let non_indented_lines = [];
	
	//const code_start_hinters = ['/*','//','{'];
	//const code_end_hinters = [';','){','{'];
	//const code_hinters = ['==','!=','()'];
	let code_hints = 0;
	
	for(let n = 0; n < xmlTextNodesList.length; n++){
		if(xmlTextNodesList[n].tagName == 'p'){
			let child_nodes = xmlTextNodesList[n].childNodes;
			for(let c = 0; c < child_nodes.length; c++){
				
				if(child_nodes[c].nodeType == 3){
					let lines = child_nodes[c].textContent.split('\n');
					//console.log("indent lines: ", lines);
					for (let l = 0; l < lines.length; l++){
						if(lines[l].trim() == ''){
							continue
						}
						
						if(
							lines[l].startsWith('/*') || 
							lines[l].startsWith('//')
						){
							//console.log("starting code hint in: ", lines[l]);
							code_hints++
						}
						if(
							lines[l].trim == '{' ||
							lines[l].endsWith(';') || 
							lines[l].endsWith('){') || //'
							lines[l].endsWith(') {') //'
							
						){
							//console.log("ending code hint in: ", lines[l]);
							code_hints++
						}
						if(
							lines[l].indexOf('()') != -1 ||
							lines[l].indexOf('&&') != -1 ||
							lines[l].indexOf('||') != -1 ||
							lines[l].indexOf('==') != -1 ||
							lines[l].indexOf('!=') != -1 ||
							lines[l].indexOf('>=') != -1 ||
							lines[l].indexOf('<=') != -1 
							
						){
							//console.log("code hint in: ", lines[l]);
							code_hints++
						}
						
						if(lines.length > 1 && l != 0){
							total_lines_count++;
						}else{
							total_lines_count++;
						}
						
						let indentation = '';
						for(let ca = 0; ca < lines[l].length; ca++){
							if(lines[l].charAt(ca) == '\t'){ // || lines[l].charAt(ca) == ' '){
								indentation += lines[l].charAt(ca);
							}
							else{
								break
							}
						}
						if(indentation != ''){
							if(lines.length > 1 && l != 0){
								lines_that_start_with_indentation_count++;
								indented_lines.push(lines[l]);
							}else{
								lines_that_start_with_indentation_count++;
								indented_lines.push(lines[l]);
							}
							if(typeof indentation_dict['indent' + indentation] == 'undefined'){
								indentation_dict['indent' + indentation] = 1;
							}
							else{
								indentation_dict['indent' + indentation]++;
							}
						}
						else{
							if(lines.length > 1 && l != 0){
								non_indented_lines.push(lines[l]);
							}else{
								non_indented_lines.push(lines[l]);
							}
							
						}
					}
				}
			}
		}
	}
	
	//console.log("epub indent: total_lines_count: ", total_lines_count);
	//console.log("epub indent: lines_that_start_with_indentation_count: ", lines_that_start_with_indentation_count);
	//console.log("epub indent: indentation_dict: ", indentation_dict);
	//console.log("epub indent: indentation_dict keyz.length: ", keyz(indentation_dict).length);
	//console.log("INDENTED LINES: ", indented_lines);
	//console.log("NON_INDENTED LINES: ", non_indented_lines);
	//console.log("indent: code_hints: ", code_hints);
	
	let likely_is_code = false;
	if(total_lines_count > 10 && code_hints > (total_lines_count / 10)){
		likely_is_code = true;
	}
	//console.log("indent; likely_is_code: ", likely_is_code);
	let indentation_ratio = 0;
	if(total_lines_count > 0 && lines_that_start_with_indentation_count > 0){
		indentation_ratio = (lines_that_start_with_indentation_count / total_lines_count) * 100;
	}
	
	//console.log("indentation_ratio: ", indentation_ratio + "%");
	
	for(let n = 0; n < xmlTextNodesList.length; n++){
		if(xmlTextNodesList[n].tagName == 'p'){
			
			let markdown_text = '';
			let child_nodes = xmlTextNodesList[n].childNodes;
			
			for(let c = 0; c < child_nodes.length; c++){
				//console.log("child_nodes[c]: ", child_nodes[c]);
				if(child_nodes[c].nodeType == 3){
					
					if(indentation_ratio > 30 && likely_is_code == false){
						//console.log("attempting to remove indentation from epub text");
						let raw_text = child_nodes[c].textContent;
						let lines = raw_text.split('\n');
						//console.log("indent lines: ", lines);
						for (let l = 0; l < lines.length; l++){
							if(lines[l].startsWith('\t')){
								while(lines[l].startsWith('\t')){
									lines[l] = lines[l].substr(1);
								}
								if(l > 0){
									if(lines[l-1].endsWith(' ') || lines[l].startsWith(' ')){
										// When sentences are joined there will be a space to separate the words
									}
									else{
										lines[l] = ' ' + lines[l];
									}
								}
							}
							
						}
						raw_text = lines.join('\n');
						markdown_text += raw_text.replaceAll('\n','');
					}
					else{
						markdown_text += child_nodes[c].textContent;
					}
					
				}
				else{
					if(child_nodes[c].textContent != ''){
						//console.warn("epub: paragraph has child element: ", child_nodes[c].tagName, child_nodes[c]);
						if(child_nodes[c].tagName == 'span'){
							//console.warn("epub: paragraph child element was span");
							
							if(child_nodes[c].classList.contains('epub-b')){
								markdown_text += '**' + child_nodes[c].textContent + '**';
							}
							else if(child_nodes[c].classList.contains('epub-i')){
								markdown_text += '_' + child_nodes[c].textContent + '_';
							}
							else{
								markdown_text += child_nodes[c].textContent;
							}
						}
						else{
							let markdown = window.html_to_markdown.render(child_nodes[c]);
							//console.log("tag to markdown -> ", child_nodes[c].tagName, child_nodes[c], markdown);
							if(typeof markdown == 'string'){
								markdown_text += markdown;
							}
							else{
								console.error('html_to_markdown did not result in string: ', markdown);
								markdown_text += child_nodes[c].textContent;
							}
						}
						
					}
					
				}
			}
			
			if(markdown_text != ''){
				
				//console.log("EPUB: ADDING: ", markdown_text);
				
				responseText += markdown_text + "\n\n";
			}
			
			
		}
		else if(xmlTextNodesList[n].tagName == 'span'){
		
		}
		else{
			element_text = extractAllTextsFromNode(xmlTextNodesList[n],xmlTextNodesList[n].tagName);
			if(element_text != ''){
				responseText += element_text + "\n\n";
			}
		}
		
	}


	
	return responseText;
}

// Save files to the virtual file system

let indexdb_helper_worker_error_count = 0;

// Handle vendor prefixes.
window.requestFileSystem = window.requestFileSystem || 
                           window.webkitRequestFileSystem;
// Check for support.
if (window.requestFileSystem) {
	//console.log("filesystem supported");
} else {
	console.error("filesystem NOT supported");
}






window.indexdb_helper_worker_exists = false;
window.indexdb_helper_worker = null;
window.real_indexdb_helper_worker = null;
window.indexdb_helper_worker_busy = false;

async function create_indexdb_helper_worker(){
	console.log("in create_indexdb_helper_worker");
	
	if(window.indexdb_helper_worker != null){
		console.warn("create_indexdb_helper_worker: window.indexdb_helper_worker wasn't null initially");
	}
	else{
		//console.log("create_indexdb_helper_worker: OK, window.indexdb_helper_worker was initially null");
	}
	
	return new Promise((resolve, reject) => {
		
		window.indexdb_helper_worker = null;
		window.real_indexdb_helper_worker = null;
		
		window.real_indexdb_helper_worker = new Worker('./indexdb_helper_worker.js', {
		  	type: 'module'
		})
		window.indexdb_helper_worker = new PromiseWorker(window.real_indexdb_helper_worker);
		
		//console.log("data.js: window.indexdb_helper_worker: ", window.indexdb_helper_worker);
		
		
		window.real_indexdb_helper_worker.addEventListener('message', e => {

			if(typeof e.data.status == 'string'){
				
				if(e.data.status == 'exists'){
					//console.log("indexDB helper worker sent exists message");
					window.indexdb_helper_worker_exists = true;
					window.indexdb_helper_worker_busy = false;
					resolve(true);
				}
				
				else if(e.data.status == 'error'){
					console.error("indexDB helper worker sent an error message: ", e.data);
					if(typeof e.data.error == 'string'){
						console.error("indexDB helper worker error is: ", e.data.error);
						if(e.data.error.indexOf('no available backend found') != -1){
							flash_message(get_translation('A_model_needs_to_be_downloaded_but_there_is_no_internet_connection'),10000,'warn');
						}else{
							console.error("indexdb helper worker sent unanticipated error: ", e.data);
							flash_message(get_translation('An_error_occured'),4000,'error');
						}
						
					}
					
					window.indexdb_helper_worker_busy = false;
					resolve(false);
				}
				else{
					console.error("indexDB helper worker sent an unexpected message: ", e.data);
					window.indexdb_helper_worker_busy = false;
				}
			}
	
		});


		window.real_indexdb_helper_worker.addEventListener('error', (error) => {
			console.error("ERROR: indexdb_helper_worker sent error. terminating!. Error was: ", error, error.message);
			indexdb_helper_worker_error_count++;
		
			window.real_indexdb_helper_worker.terminate();
			window.indexdb_helper_worker = null;
			window.indexdb_helper_worker_busy = false;
			if(typeof error != 'undefined' && indexdb_helper_worker_error_count < 3){
				setTimeout(() => {
					//console.log("attempting to restart indexDB helper worker");
					create_indexdb_helper_worker();
				},1000);
			}
			else{
				console.error("indexdb_helper_worker errored out");
			}
		});
		
		
	});
	
	
}


create_indexdb_helper_worker();











function deletr(key){
	console.log("deletr: deleting key: ", key);
	
 	return new Promise(function(resolve, reject) {
		if(window.indexdb_helper_worker != null && window.indexdb_helper_worker_exists){
			
			window.indexdb_helper_worker.postMessage({
				'action':'delete',
				'key':key,
			})
			.then((response) => {
				//console.error("\n\nHURRAY\n\nin promiseWorker then!\n\n");
				//console.log("promise worker response: ", response);
				
				resolve(response);
				return response;
			})
			.catch((err) => {
				console.error("promise indexdb helper worker: received error which was caught in worker: ", err);
				reject(false);
				return false;
			})
		}
		else{
			ldb.delete(key, () => {
				//console.log('Value deleted');
				resolve(true);
			});
		}
		
	});
}


function savr(key,value,promise=true){
	if(typeof value == 'string'){
		//console.log("in savr.  key,value: \n ", key,'\n ',value.substr(0,10) + '...');
	}
	else{
		console.error("in savr.  key,value (not string!),promise: \n ", key,'\n ',value,'\n ',promise);
	}
	
	//console.error("\n\n\n\n_____________________+______________\nsavr:  key,value: ", key, value,'\n\n\n');
	
 	return new Promise(function(resolve, reject) {
		if(typeof value != 'string'){
			console.error("savr: almost saved a non-string value?!  key, value: ", key, value);
			if(window.settings.settings_complexity == 'developer'){
				flash_message("Almost save a non-string value to the database!",5000,'fail');
			}
			reject(false);
		}
		else if(value == '_PLAYGROUND_BINARY_'){
			console.error("savr: almost saved '_PLAYGROUND_BINARY_' only");
			reject(false);
		}
		else if(typeof key != 'string'){
			if(window.settings.settings_complexity == 'developer'){
				flash_message("Almost save a non-string key to the database!",5000,'fail');
			}
		}
		else if(!isNaN(key)){
			if(window.settings.settings_complexity == 'developer'){
				flash_message("Almost save a key that is just a number to the database!",5000,'fail');
			}
		}
		else{
			
			if(window.indexdb_helper_worker != null && window.indexdb_helper_worker_exists){
			
				window.indexdb_helper_worker.postMessage({
					'action':'set',
					'key':key,
					'value':value,
				})
				.then((response) => {
					//console.error("\n\nHURRAY\n\nin data promiseWorker then! Key saved to indexDB\n\n");
					//console.log("promise worker response: ", response);
					resolve(response);
					//return response;
				})
				.catch((err) => {
					console.error("promise indexdb helper worker: received error which was caught in worker: ", err);
					reject(false);
					//return false;
				})
			}
			else{
				ldb.set(key, value, function (ldb_response) {
			    	//console.log('savr: ldb has finished saving the data in IndexDB.  callback:  key,original value, ldb_response: ', key, value, ldb_response); // key,value.substr(0,10) + '...'
					resolve(value);
				});
			}
			
		}
		
	});
	
}


function getr(key) {
	//console.log("in getr. key: ", key);
 	return new Promise(function(resolve,reject) {
		
		if(window.indexdb_helper_worker != null && window.indexdb_helper_worker_exists){
			//console.log("getr: posting message to indexDB helper worker to get: ", key);
			window.indexdb_helper_worker.postMessage({
				'action':'get',
				'key':key,
			})
			.then((response) => {
				//console.error("\n\nHURRAY\n\nin data promiseWorker then! Key loaded from indexDB\n\n");
				//console.log("promise worker response: ", response);
				if(typeof response == 'undefined' || response == null){
					console.warn("getr: indexdb helper returned 'null' from the indexDB. key:  ", key);
					reject(false);
				}
				else{
					resolve(response);
				}
				
				//return response;
			})
			.catch((err) => {
				console.error("promise indexdb helper worker: received error which was caught in worker: ", err);
				reject(false);
				//return false;
			})
		}
		else{
			ldb.get(key, (value) => {
		    	//console.log('getr done.  key,value: ', key, value);
				resolve(value);
			});
		}
		
	});
}




// gets text from DB and places it in the editor
function setr(key,file_dict=null) {
	//console.log("in setr.  key,file_dict: ", key,file_dict);
	if(key.indexOf('//') != -1){
		console.error("\n\n\n\n\n\n\nsetr: FOUND DOUBLE // IN KEY: ", key);
	}
	
	let compression = 'none';
	let file_type = 'text';
	if(typeof file_dict != 'undefined' && file_dict != null){
		if(typeof file_dict.type == 'string'){
			file_type = file_dict.type;
		}
		if(typeof file_dict.compression == 'string'){
			compression = file_dict.compression;
		}
	}
	//console.log("setr:  compression, file_type:", compression, file_type);
	
 	return new Promise(function(resolve,reject) {
		//console.log("setr: inside promise");
		
		getr(key)
		.then(function(value){
			//console.log("setr: got value from getr.  key,value: ", key, value);
			
			if(typeof value == 'string'){ // || (file_type == 'image' || file_type == 'media' || file_type == 'binary')
				if(value != '_PLAYGROUND_BINARY_'){
					
					if(key == folder + '/' + current_file_name){
						//console.log("setr: storing retrieved value in playground_saved_files. key: ", key);
						playground_saved_files[folder + '/' + current_file_name] = value;
						
					}
					else if(key == folder + '/playground_backup_' + current_file_name){
						//console.log("setr: storing retrieved value in playground_live_backups. key: ", key);
						playground_live_backups[folder + '/' + current_file_name] = value;
					}
					editor_set_value(value);
					if(typeof files[current_file_name]['selection'] != 'undefined' && files[current_file_name]['selection'] != null){
						//console.log("setr: last known cursor position in this document is available: ", files[current_file_name]['selection']);
						scroll_to_selection(files[current_file_name]['selection']);
					}
					post_file_load();
					resolve(value);
				}
				else{
					console.error("setr: getr succesfully retrieved data, but it was '_PLAYGROUND_BINARY_', so this isn't the file we're looking for.");
					reject(null);
				}
				
			}
			else if(value != null && compression == 'gzip'){
				decompress(value,'gzip')
				.then(function(unzipped){
				
					//console.error("setr: unzipping is done");
					//console.error('setr: unzipped: ', typeof unzipped, unzipped);
				
					if(typeof unzipped == 'string' && unzipped != '_PLAYGROUND_BINARY_'){
						
						if(key == folder + '/' + current_file_name){
							//console.log("setr: storing retrieved value in playground_saved_files");
							playground_saved_files[folder + '/' + current_file_name] = unzipped;
						}
						else if(key == folder + '/playground_backup_' + current_file_name){
							playground_live_backups[folder + '/' + current_file_name] = unzipped;
						}
						
						editor_set_value(unzipped);
						if(typeof files[current_file_name]['selection'] != 'undefined'){
							//console.log("setr: last known cursor position in this document is available: ", files[current_file_name]['selection']);
							scroll_to_selection(files[current_file_name]['selection']);
						}
						post_file_load();
						resolve(value);
					}
					else{
						console.error("setr: getr succesfully retrieved AND unzipped data, but the contents was '_PLAYGROUND_BINARY_', so this isn't the file we're looking for.");
						reject(null);
					}
				
				})
				.catch(function(err){
					console.error("setr: unzipping failed: ", err);
					reject(null);
				});
			}
			else{
				console.error("setr: getr returned null (not in DB), ignoring it and rejecting with null. Key was: ", key);
				reject(null);
			}
		})
		.catch(function(err){
			if(typeof err != 'boolean'){
				console.error("setr: caught general error: ", err);
			}
			
			reject(null);
		})
	});
	
}



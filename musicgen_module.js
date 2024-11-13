


//
//   MUSICGEN
//

let my_task = null;
let musicgen_worker_error_count = 0;
let musicgen_files_to_cache = ['./musicgen_module.js','./musicgen_worker.js'];
let musicgen_previous_percentage = 1;
let musicgen_previous_percentage_timestamp = 0;
let musicgen_files = [];



window.interrupt_musicgen = function(){
	//console.log("in interrupt_musicgen");
	if(window.real_musicgen_worker != null){
		window.real_musicgen_worker.postMessage({'action':'interrupt'});
		return true
	}
	else if(my_task != null){
		window.handle_completed_task(my_task,false,{'state':'interrupted'})
	}
	else{
		window.change_tasks_with_state('doing_musicgen','interrupted');
	}
	return false
}
window.stop_musicgen = function(){
	//console.log("in stop_musicgen");
	if(window.real_musicgen_worker != null){
		window.real_musicgen_worker.postMessage({'action':'stop'});
		return true
	}
	return false
}

async function create_musicgen_worker(){
	//console.log("in create_musicgen_worker");
	
	return new Promise((resolve, reject) => {
		
		window.musicgen_worker = null;
		window.real_musicgen_worker = null;
		window.real_musicgen_worker = new Worker('./musicgen_worker.js', {
		  	type: 'module'
		})
		window.musicgen_worker = new PromiseWorker(window.real_musicgen_worker);
		
		//console.log("musicgen_module: window.musicgen_worker: ", window.musicgen_worker);
		
		setTimeout(() => {
			window.add_chat_message_once('musicgen','musicgen','model_examples#setting---');
		},2000);
		
		window.real_musicgen_worker.addEventListener('message', e => {
			//console.log("musicgen_module: received message from musicgen_worker: ", e.data.status, e.data);

		
			if(typeof e.data.status == 'string'){
				
				if(e.data.status == 'interrupt' || e.data.status == 'stop'){
				
					//console.log("musicgen worker sent message that is has interrupted or stopped: " + e.data.status);
					// remove download message
					let musicgen_progress_el = document.getElementById('download-progress-musicgen');
					if(musicgen_progress_el){
						musicgen_progress_el.closest('.download-progress-chat-message').remove();
					}
					
					if(typeof e.data.task != 'undefined' && typeof e.data.task.index == 'number'){
						let musicgen_progress_el = document.getElementById('chat-message-task-musicgen-progress' + e.data.task.index);
						if(musicgen_progress_el){
							musicgen_progress_el.remove();
						}
					}
					
					document.body.classList.remove('doing-musicgen');
					
					if(typeof e.data.task != 'undefined' && e.data.task != null){
						window.handle_completed_task(e.data.task,null,{'state':'interrupted'});
					}
					
					if(e.data.status == 'stop'){
						if(window.real_musicgen_worker != null){
							window.real_musicgen_worker.terminate();
							window.real_musicgen_worker = null;
						}
					}
					
				}
				
				
				
				
				
				
				
				if(e.data.status == 'progress' && typeof e.data.file == 'string'){
					//console.log("musicgen worker sent download progress: ", e.data.progress);
					
					
					
					musicgen_files[e.data.file] = e.data;
			
					let total_bytes = 0;
					let loaded_bytes = 0;
					let musicgen_file_names = keyz(musicgen_files);
					if(musicgen_file_names.length > 2){
						for(let w = 0; w < musicgen_file_names.length; w++){
							if(typeof musicgen_files[musicgen_file_names[w]].total == 'number' && typeof musicgen_files[musicgen_file_names[w]].loaded == 'number'){
								total_bytes += musicgen_files[musicgen_file_names[w]].total;
								loaded_bytes += musicgen_files[musicgen_file_names[w]].loaded;
							}
					
						}
					}
					if(total_bytes > 0){
						
						let percentage = (loaded_bytes / total_bytes) * 100;
						if(musicgen_previous_percentage > percentage){
							musicgen_previous_percentage = 0;
						}
						if(Math.floor(percentage) > musicgen_previous_percentage){
							
							
							
							//console.log("\n\nmusicgen: download %: ", percentage);
							/*
							if(percentage == 1){
								musicgen_previous_percentage_timestamp = Date.now();
							}
							else 
							*/
							if(percentage > 2){
								
								let musicgen_progress_el = document.getElementById('download-progress-musicgen');
								if(musicgen_progress_el == null && percentage != 100){
									console.error("musicgen (down)load progress element is missing. Creating it now.");
									add_chat_message('musicgen','musicgen','download_progress#setting---');
									musicgen_progress_el = document.getElementById('download-progress-musicgen');
								}
								
								if(musicgen_progress_el){
									
									musicgen_progress_el.value = loaded_bytes / total_bytes;//e.data.progress / 100;
									
									let musicgen_progress_parent_el = musicgen_progress_el.parentNode;
									if(musicgen_progress_parent_el){
									
										let musicgen_time_remaining_element = musicgen_progress_parent_el.querySelector('.time-remaining');
										if(musicgen_time_remaining_element){
											//console.log("OK, found musicgen_time_remaining_element");
											const delta = Date.now() - musicgen_previous_percentage_timestamp;
											//console.log("musicgen_progress: time it took for 1% progress: ", delta);
											const percent_remaning = 100 - percentage;
											//console.log("musicgen_download_progress: seconds remaning: ", (percent_remaning * delta) / 1000);
											//musicgen_time_remaining_element.innerHTML = '<span></span>';
								
											let time_remaining = (percent_remaning * delta) / 1000;
											musicgen_time_remaining_element.innerHTML = window.create_time_remaining_html(time_remaining);
										}
										else{
											console.error("could not find musicgen .time-remaining element");
										}
									}
									else{
										console.error("could not find musicgen parent for .time-remaining element");
									}
									
									if(percentage == 100){
										musicgen_progress_el.closest('.message').remove();
									}
									
								}
								
							}
							musicgen_previous_percentage = percentage;
							musicgen_previous_percentage_timestamp = Date.now();
						
						
						}
						
						
						
						
						
						
						/*
						//let musicgen_progress_el = document.getElementById('download-progress-musicgen');
						if(musicgen_progress_el == null){
							console.error("musicgen (down)load progress element is missing");
							add_chat_message('current','musicgen','download_progress#setting---');
						}
						else{
							//console.log("updating musicgen (down)load progress: ", ((loaded_bytes / total_bytes) * 100) + "%");
						}
						*/
					}
					else{
						console.error("musicgen loading: total_bytes is 0");
					}
					
					
					
					/*
					let musicgen_progress_el = document.getElementById('download-progress-musicgen');
					if(musicgen_progress_el == null){
						console.error("musicgen (down)load progress element is missing");
						add_chat_message('musicgen','musicgen','download_progress#setting---');
					}
					else{
						//console.log("updating musicgen (down)load progress");
						musicgen_progress_el.value = e.data.progress / 100;
					}
					*/
				
				}
				else if(e.data.status == 'exists'){
					//console.log("musicgen worker sent exists message");
					window.musicgen_worker_busy = false;
					window.musicgen_loaded = false;
				}
				else if(e.data.status == 'already_busy'){
					console.error("musicgen worker sent 'already_busy' message");
					window.musicgen_worker_busy = true;
					if(my_task != null){
						handle_completed_task(my_task,null,{'state':'failed'});
					}
					
				}
				else if(e.data.status == 'ready'){
					//console.log("musicgen worker sent ready message. e.data: ", e.data);
					//window.musicgen_worker_busy = false;
					window.busy_loading_assistant = false;
					window.musicgen_loaded == true;
					window.busy_loading_musicgen == false;
					window.currently_loaded_assistant = 'musicgen';
					if(window.settings.assistant == 'musicgen'){
						set_model_loaded(true);
					}
					add_chat_message('current','developer',get_translation('Musician_AI_has_loaded'));
					let musicgen_progress_el = document.getElementById('download-progress-musicgen');
					if(musicgen_progress_el){
						console.error("musicgen became ready, adding 'download-complete-chat-message' class to chat message");
						let download_progress_chat_message_el = musicgen_progress_el.closest('.message');
						if(download_progress_chat_message_el){
							download_progress_chat_message_el.classList.add('download-complete-chat-message');
						}
						else{
							console.error("musicgen became ready, but cannot find parent chat message to add download complete class");
						}
					}
					else{
						console.error("musicgen became ready, but cannot find loading progress indicator element");
					}
				}
			
				else if(e.data.status == 'initiate'){
					//console.log("musicgen worker sent initiate message");
				}
				
			
				else if(e.data.status == 'download'){
					//console.log("musicgen worker sent download message: ", e.data.file);
					const file_to_cache = 'https://www.huggingface.co/' + e.data.name + '/resolve/main/' + e.data.file;
					
					if(document.body.classList.contains('developer')){
						add_chat_message('current','developer','(down)loading: ' + e.data.file);
					}
				}
			
				else if(e.data.status == 'preloaded'){
					//console.log("musicgen worker sent 'preloaded' message. Seems to be ready to go.");
					if(window.settings.assistant == 'musicgen'){
						set_model_loaded(true);
					}
					add_chat_message('musicgen','musicgen',get_translation('Loading_complete'),'Loading_complete');
				}
				
			
				else if(e.data.status == 'done'){
					//console.log("musicgen worker sent 'done' message. Seems to be for a file being done downloading");
					handle_download_complete(false);
				}
				
				
				else if(e.data.status == 'musicgen_progress'){
					
					document.body.classList.add('doing-musicgen');
					
					//console.log("musicgen worker sent 'musicgen_progress' message: ", e.data);
					if(typeof e.data.task != 'undefined' && typeof e.data.task.index == 'number' && typeof e.data.progress == 'number'){
						//console.log("got everything to update musicgen progress");
						let musicgen_progress_el = document.getElementById('chat-message-task-musicgen-progress' + e.data.task.index);
						if(musicgen_progress_el == null){
							let musicgen_task_el = document.getElementById('chat-message-task-musicgen-musicgen' + e.data.task.index);
							if(musicgen_task_el){
								musicgen_progress_el = document.createElement('progress');
								musicgen_progress_el.setAttribute('id','chat-message-task-musicgen-progress' + e.data.task.index);
								musicgen_task_el.appendChild(musicgen_progress_el);
								const musicgen_time_remaining_el = document.createElement('div');
								musicgen_time_remaining_el.setAttribute('id','chat-message-task-musicgen-time-remaining' + e.data.task.index);
								musicgen_time_remaining_el.classList.add('time-remaining');
								musicgen_task_el.appendChild(musicgen_time_remaining_el);
							}
							else{
								console.error("musicgen: missing musicgen_task_el");
								//musicgen_previous_percentage_timestamp = Date.now();
							}
						}
						
						if(musicgen_progress_el){
							//console.log("setting musicgen_progress_el.value to e.data.progress: ", e.data.progress);
							musicgen_progress_el.value = e.data.progress;
							
							
							
							const musicgen_time_remaining_element = document.getElementById('chat-message-task-musicgen-time-remaining' + e.data.task.index);
							if(musicgen_time_remaining_element){
								const percentage = e.data.progress * 100;
								
								if(musicgen_previous_percentage > percentage){
									musicgen_previous_percentage = 0;
								}
								
								if(Math.floor(percentage) > musicgen_previous_percentage){
									//console.log("\n\nmusicgen: %: ", percentage);
									if(percentage == 1){
										musicgen_previous_percentage_timestamp = Date.now();
									}
									if(percentage > 2){
										const delta = Date.now() - musicgen_previous_percentage_timestamp;
										//console.log("musicgen_progress: time it took for 1% progress: ", delta);
										const percent_remaning = 100 - percentage;
										//console.log("musicgen_progress: seconds remaining: ", (percent_remaning * delta) / 1000);
										//musicgen_time_remaining_element.innerHTML = '<span></span>';
										
										let time_remaining = (percent_remaning * delta) / 1000;
										if(musicgen_time_remaining_element){
											musicgen_time_remaining_element.innerHTML = window.create_time_remaining_html(time_remaining);
										}
										
										
										
									}
									musicgen_previous_percentage = percentage;
									musicgen_previous_percentage_timestamp = Date.now();
								
								
								}
							}
							else{
								console.error("musicgen: could not find time-remaining element");
							}
							
							
							/*
							if(e.data.progress == 1){
								musicgen_progress_el.removeAttribute('id');
							}
							*/
							
						}
						else{
							console.error("musicgen: generration progress update: still no musicgen_progress_el");
						}
						
					}
				}
				
				else if(e.data.status == 'download_required'){
					//console.log("musicgen worker sent 'download_required' message.");
					flash_message(get_translation("A_model_has_to_be_downloaded_from_the_internet_but_there_is_no_internet_connection"), 4000, 'fail');
				}
				
				else if(e.data.status == 'update'){
					console.error("music modle: received 'update' message from musicgen worker:  e.data: ", e.data);
					/*
					if(typeof e.data.data == 'object' && e.data.data != null && e.data.data.length){
						set_chat_status(e.data.data[0],2);
					}
					*/
				}
				
				else if(e.data.status == 'complete'){
					window.musicgen_worker_busy = false;
					//set_chat_status('',2);
					//console.log('GOT MUSICGEN COMPLETE.  e.data: ', e.data);
					
					document.body.classList.remove('doing-musicgen');
					
					if(typeof e.data.task != 'undefined' && typeof e.data.task.index == 'number' && typeof e.data.wav_blob != 'undefined'){
						//console.log("musicgen worker: complete, and returned wav_blob");
						let musicgen_task_output_el = document.getElementById('chat-message-task-musicgen-musicgen' + e.data.task.index);
						if(musicgen_task_output_el){
							musicgen_task_output_el.innerHTML = '';
							let audio_player_el = document.createElement('audio');
							//console.log("audio_player_el: ", audio_player_el);
							audio_player_el.classList.add('chat-message-audio-player');
							audio_player_el.setAttribute('controls',true);
							//audio_player_el.setAttribute("type","audio/mpeg");
							audio_player_el.setAttribute('id','chat-message-audio-player-task' + e.data.task.index);
							audio_player_el.src = window.URL.createObjectURL(e.data.wav_blob);
							//audio_player_el.load();
							//console.log("do_audio_player: appending audio_player to bubble: ", audio_player_el);
							musicgen_task_output_el.appendChild(audio_player_el);
							
							if(window.settings.assistant != 'musicgen'){
								flash_message(get_translation("Music_has_been_generated"));
							}
							
							
							let generated_audio_buttons_container_el = document.createElement('div');
							generated_audio_buttons_container_el.classList.add('generated-audio-buttons-container');
							
							// Save generated image button
							let save_generated_music_button_el = document.createElement('div');
							save_generated_music_button_el.classList.add('generated-image-button');
							save_generated_music_button_el.classList.add('save-generated-image-button');
							save_generated_music_button_el.innerHTML = '<span class="unicode-icon">💾</span>';
							save_generated_music_button_el.addEventListener('click', (event) => {
								//console.log("saving generated image to current folder");
		
								let save_filename = e.data.task.prompt;
								if(save_filename.length > 62){
									save_filename = save_filename.substr(0,62);
								}
								let final_filename = save_filename + '-' + makeid(4) + '.wav';
								//console.log("final_filename: ", final_filename);
								//console.log("blob to save: ", image_blob_url);
								if(valid_new_name(final_filename)){
									//console.log("new filename is valid");
								}
								else{
									//console.log("new filename is invalid, attempting to add random string");
									final_filename = save_filename + '-' + window.makeid(4) + '.wav';
								}
								final_filename = window.sanitize_filename(final_filename);
								if(valid_new_name(final_filename)){
									//console.log("calling save_blob with filename: ", final_filename);
									window.save_blob(e.data.wav_blob, final_filename);
									window.show_files_tab(); // only shows it if the sidebar is already open
			
								}
								else{
									console.error("could not create a valid filename for the generated image: ", final_filename);
									//flash_message(get_translation("invalid_file_name"),3000,'fail');
								}
		
							});
							generated_audio_buttons_container_el.appendChild(save_generated_music_button_el);
							musicgen_task_output_el.appendChild(generated_audio_buttons_container_el);
							
						}
						
						
					}
					else{
						//console.log("missing data in musicgen complete message: ", e.data);
					}
				
				}
				
				else if(e.data.status == 'error'){
					//console.log("received error from musicgen worker.  e.data: ", e.data);
					if(typeof e.data.error == 'string'){
						if(e.data.error.indexOf('no available backend found') != -1 || e.data.error.indexOf('Failed to fetch') != -1){
							flash_message(get_translation('A_model_needs_to_be_downloaded_but_there_is_no_internet_connection'),4000,'warn');
						}
					}
					else{
						flash_message(get_translation('An_error_occured'),4000,'warn');
					}
					if(typeof e.data.task == 'object' && typeof e.data.task != null){
						if(typeof e.data.task.index == 'number'){
							let chat_bubble_output_el = document.querySelector('#chat-message-task-musicgen-musicgen' + e.data.task.index);
							if(chat_bubble_output_el){
								chat_bubble_output_el.innerHTML = '✘';
							}
						}
						
						handle_completed_task(e.data.task,null,{'state':'failed'});
					}
					
					window.musicgen_worker_busy = false;
				}
				
				else{
					//console.log("musicgen worker sent an unexpected content message: ", e.data);
					window.musicgen_worker_busy = false;
				}
			}
			
			if(window.enable_microphone == false){
				//console.log("musicgen worker returned audio file, but in the meantime enable_microphone was disabled. Throwing away the data.");
			}
			else{
			
				
			}
	
		});


		window.real_musicgen_worker.addEventListener('error', (error) => {
			console.error("ERROR: musicgen_worker sent error. terminating!. Error was: ", error, error.message);
			musicgen_worker_error_count++;
			
			window.real_musicgen_worker.terminate();
			window.musicgen_worker = null;
			window.musicgen_worker_busy = false;
			if(typeof error != 'undefined' && musicgen_worker_error_count < 10){
				setTimeout(() => {
					//console.log("attempting to restart musicgen worker");
					create_musicgen_worker();
				},1000);
			}
			else{
				console.error("musicgen_worker errored out");
			}
			if(my_task != null){
				window.handle_completed_task(my_task,false,{'state':'failed'});
				my_task = null;
			}
			// TODO: clean up the partially executed task? maybe use my_task here to, and then call handle_task_completed on that?
		});
		
		resolve(true);
	});
	
	
	
	
}


console.log("musicgen_module.js:  calling create_musicgen_worker");
create_musicgen_worker();





window.do_musicgen = async function (task){ // musicgen_queue_item
	//console.log("in do_musicgen. Task: ", task);
	
	//await caches.open(window.cache_name).then((my_cache) => my_cache.add(e.data.file))
	//await create_musicgen_worker();
	
	return new Promise((resolve, reject) => {
		
		if(task == null){
			console.error("do_musicgen: task was null");
			reject(false);
			return false
		}
	
		if(window.musicgen_worker_busy == true){
			console.error("do_musicgen: ABORTING. window.musicgen_worker_busy was already true. task: ", task);
			reject(false);
			return false
		}
		
		window.musicgen_worker_busy = true;
		my_task = task;
		
		/*
		caches.open(window.cache_name)
		.then((my_cache) => {
			my_cache.add(e.data.file);
			return create_musicgen_worker();
		})
		*/
		
		
		if(window.musicgen_worker == null){
			//console.log("do_musicgen: calling create_musicgen_worker");
			create_musicgen_worker()
			.then((value) => {
				//console.log("do_musicgen: .then: create_musicgen_worker should be done now. value: ", value);
				//console.log("do_musicgen: window.musicgen_worker: ", window.musicgen_worker);
			
				if(window.musicgen_worker == null){
					console.error("do_musicgen: creating musicgen promise worker failed");
					reject(false);
				}
				else{
					console.warn("do_musicgen: window.musicgen_worker seems to exist: ", window.musicgen_worker);
					//musicgen_worker.postMessage({'task':task});
					document.body.classList.add('doing-musicgen');
					
					window.musicgen_worker.postMessage({
						'task':task,
						'type': 'en'
					})
					.then((response) => {
						//console.log("musicgen promise worker response: ", response);
						document.body.classList.remove('doing-musicgen');
						resolve(response);
						return response;
					})
					.catch((err) => {
						console.error("promise musicgen worker: received error which was caught in worker: ", err);
						document.body.classList.remove('doing-musicgen');
						
						flash_message(get_translation('Musician_failed'),2000,'fail');
						
						/*
						const download_progress_el = document.querySelector('.message.pane-musicgen.download-progress-chat-message');
						//console.log("download_progress_el: ", download_progress_el)
						if(download_progress_el){
							//console.log("musicgen error: download progress element still existed, removing it now");
							setTimeout(() => {
								download_progress_el.remove()
							},1000);
							
						}
						*/
						
						if(my_task){
							console.error("promise musicgen worker: calling handle_completed_task with state:failed");
							
							//chat-message-task-musicgen-musicgen0
							
							handle_completed_task(my_task,null,{'state':'failed'});
						}
						my_task = null;
						console.error("reached end of error part");
						
						reject(false);
						return false;
					})
			
				}
			
			})
			.then((value) => {
				//console.log("do_musicgen: start promise worker: final then: value: ", value);
				resolve(value);
			})
			.catch((err) => {
				console.error("do_musicgen: caught error from create_musicgen_worker: ", err);
			})
		}
		else{
			//console.log("do_musicgen: doing postMessage. sending:  task,musicgen_worker: ", task, window.musicgen_worker);
			document.body.classList.add('doing-assistant');
			
			window.musicgen_worker.postMessage({
				'task':task,
				'type': 'en'
			})
			.then((response) => {
				console.error("\n\nHURRAY\n\nin musicgen promiseWorker.then!\n\n");
				//console.log("musicgen promise worker response: ", response);
				document.body.classList.remove('doing-assistant');
				resolve(response);
				return response;
			})
			.catch((err) => {
				console.error("promise musicgen worker: received error which was caught in worker: ", err);
				document.body.classList.remove('doing-assistant');
				handle_completed_task(my_task,null,{'state':'failed'});
				my_task = null;
				reject(null);
				return false;
			})
		}
		
		
	});
	
}







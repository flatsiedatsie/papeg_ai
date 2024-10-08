

//
//   IMAGE TO TEXT - MOONDREAM 2
//

let my_image_to_text_task = null;

let image_to_text_worker_error_count = 0;
let image_to_text_previous_percentage = 1;
let image_to_text_previous_percentage_timestamp = 0;
let image_to_text_files = {};



window.interrupt_image_to_text = function(){
	console.log("in interrupt_image_to_text");
	
	window.change_tasks_with_type('image_to_text');
	
	
	
	if(window.real_image_to_text_worker != null){
		window.real_image_to_text_worker.postMessage({'action':'interrupt'});
		return true
	}
	return false
}
window.stop_image_to_text = function(){
	console.log("in stop_image_to_text");
	if(window.real_image_to_text_worker != null){
		console.log("stop_image_to_text: posting stop message to worker");
		window.real_image_to_text_worker.postMessage({'action':'stop'});
		return true
	}
	else{
		console.log("stop_image_to_text: worker is already null");
	}
	return false
}

async function create_image_to_text_worker(){
	console.log("in create_image_to_text_worker.");
	if(window.busy_loading_assistant != null){
		console.error("create_image_to_text_worker: notice only: window.busy_loading_assistant was not null")
	}
	window.busy_loading_assistant = 'image_to_text';
	
	return new Promise((resolve, reject) => {
		
		window.image_to_text_worker = null;
		window.real_image_to_text_worker = null;
		window.real_image_to_text_worker = new Worker('./image_to_text_worker.js', {
		  	type: 'module'
		})
		window.image_to_text_worker = new PromiseWorker(window.real_image_to_text_worker);
		
		console.log("image_to_text_module: window.image_to_text_worker: ", window.image_to_text_worker);
		
		setTimeout(() => {
			window.add_chat_message_once('image_to_text','image_to_text','model_examples#setting---');
		},2000);
		
		window.real_image_to_text_worker.addEventListener('message', e => {
			//console.log("image_to_text_module: received message from image_to_text_worker: ", e.data);

		
			if(typeof e.data.status == 'string'){
				
				if(e.data.status == 'progress' && typeof e.data.file == 'string'){
					//console.log("image_to_text worker sent download progress: ", e.data.progress);
					
					let image_to_text_progress_el = document.getElementById('download-progress-image_to_text');
					if(image_to_text_progress_el == null && !e.data.progress == 100){
						console.error("image_to_text (down)load progress element is missing");
						add_chat_message('image_to_text','image_to_text','download_progress#setting---');
					}
					
					if(image_to_text_progress_el){
						
						if(e.data.progress == 100){
							image_to_text_files = {};
							let chat_message_el = image_to_text_progress_el.closest('download-progress-chat-message');
							if(chat_message_el){
								//chat_message_el.classList.add('download-complete-chat-message');
								chat_message_el.remove();
								window.set_model_loaded(true);
							}
							//window.busy_loading_image_to_text = false;
							return
						}
						
						image_to_text_files[e.data.file] = e.data;
				
						//console.log("image_to_text_files: ", image_to_text_files);
				
						let total_bytes = 0;
						let loaded_bytes = 0;
						let image_to_text_file_names = keyz(image_to_text_files);
						if(image_to_text_file_names.length > 0){
							for(let w = 0; w < image_to_text_file_names.length; w++){
								if(typeof image_to_text_files[image_to_text_file_names[w]].total == 'number' && typeof image_to_text_files[image_to_text_file_names[w]].loaded == 'number'){
									total_bytes += image_to_text_files[image_to_text_file_names[w]].total;
									loaded_bytes += image_to_text_files[image_to_text_file_names[w]].loaded;
								}
						
							}
						}
						if(total_bytes > 0){
							
							//e.data.progress
							image_to_text_progress_el.value = loaded_bytes / total_bytes;//e.data.progress / 100;
							
							
							let percentage = (loaded_bytes / total_bytes) * 100;
							if(image_to_text_previous_percentage > percentage){
								image_to_text_previous_percentage = 0;
							}
							if(Math.floor(percentage) > image_to_text_previous_percentage){
								//console.log("image_to_text: download %: ", percentage);
								/*
								if(percentage == 1){
									image_to_text_previous_percentage_timestamp = Date.now();
								}
								else 
								*/
								if(percentage > 2){
									
									let image_to_text_progress_parent_el = image_to_text_progress_el.parentNode;
									if(image_to_text_progress_parent_el){
										
										let image_to_text_time_remaining_element = image_to_text_progress_parent_el.querySelector('.time-remaining');
										if(image_to_text_time_remaining_element){
											//console.log("OK, found image_to_text_time_remaining_element");
											const delta = Date.now() - image_to_text_previous_percentage_timestamp;
											//console.log("image_to_text_progress: time it took for 1% progress: ", delta);
											const percent_remaning = 100 - percentage;
											//console.log("image_to_text_download_progress: seconds remaning: ", (percent_remaning * delta) / 1000);
											//image_to_text_time_remaining_element.innerHTML = '<span></span>';
									
											let time_remaining = (percent_remaning * delta) / 1000;
											image_to_text_time_remaining_element.innerHTML = window.create_time_remaining_html(time_remaining);
										}
										else{
											console.error("could not find image_to_text .time-remaining element");
										}
									}
									else{
										console.error("could not find image_to_text parent for .time-remaining element");
									}
									
									
									
								}
								image_to_text_previous_percentage = percentage;
								image_to_text_previous_percentage_timestamp = Date.now();
							
							
							}
							
							
							
							
							
							
							/*
							//let image_to_text_progress_el = document.getElementById('download-progress-image_to_text');
							if(image_to_text_progress_el == null){
								console.error("image_to_text (down)load progress element is missing");
								add_chat_message('current','image_to_text','download_progress#setting---');
							}
							else{
								console.log("updating image_to_text (down)load progress: ", ((loaded_bytes / total_bytes) * 100) + "%");
							}
							*/
						}
						else{
							console.error("image_to_text loading: total_bytes is 0");
						}
						
						
						
						//console.log("updating whisper (down)load progress");
						//image_to_text_progress_el.value = e.data.progress / 100;
					}
					
					
					
					/*
					let image_to_text_progress_el = document.getElementById('download-progress-image_to_text');
					if(image_to_text_progress_el == null){
						console.error("image_to_text (down)load progress element is missing");
						add_chat_message('image_to_text','image_to_text','download_progress#setting---');
					}
					else{
						//console.log("updating image_to_text (down)load progress");
						image_to_text_progress_el.value = e.data.progress / 100;
					}
					*/
				
				}
				else if(e.data.status == 'exists'){
					console.log("image_to_text worker sent exists message");
					console.log("window.image_to_text_worker_loaded: ", window.image_to_text_worker_loaded);
					console.log("window.busy_loading_image_to_text: ", window.busy_loading_image_to_text);
				}
			
				else if(e.data.status == 'ready'){
					console.log("image_to_text worker sent ready message. e.data: ", e.data);
					//window.image_to_text_worker_busy = false;
					
					if(typeof window.busy_loading_assistant == 'string' && window.busy_loading_assistant == 'image_to_text'){
						window.busy_loading_assistant = null;
					}
					else{
						console.error("image_to_text worker is ready (fully loaded), but unexpectedly window.busy_loading_assistant is something other than 'image_to_text': ", window.busy_loading_assistant);
					}
					window.image_to_text_worker_loaded = true;
					window.busy_loading_image_to_text = false;
					window.currently_loaded_assistant = 'image_to_text';
					set_model_loaded(true);
					add_chat_message('current','developer',get_translation('Image_to_text_AI_has_loaded'));
					let image_to_text_progress_el = document.getElementById('download-progress-image_to_text');
					if(image_to_text_progress_el){
						console.log("image_to_text became ready, adding 'download-complete-chat-message' class to chat message");
						let download_progress_chat_message_el = image_to_text_progress_el.closest('.message');
						if(download_progress_chat_message_el){
							download_progress_chat_message_el.classList.add('download-complete-chat-message');
							setTimeout(() => {
								download_progress_chat_message_el.remove();
							},3000);
						}
						else{
							console.error("image_to_text became ready, but cannot find parent chat message to add download complete class");
						}
					}
					else{
						console.error("image_to_text became ready, but cannot find loading progress indicator element");
					}
				}
			
				else if(e.data.status == 'initiate'){
					console.log("image_to_text worker sent initiate message");
				}
			
				//https://huggingface.co/Xenova/opus-mt-nl-en/resolve/main/onnx/decoder_model_merged_quantized.onnx?download=true
			
				else if(e.data.status == 'download'){
					console.log("image_to_text worker sent download message: ", e.data.file);
					//const file_to_cache = 'https://www.huggingface.co/' + e.data.name + '/resolve/main/' + e.data.file;
					
					if(document.body.classList.contains('developer')){
						add_chat_message('current','developer','(down)loading: ' + e.data.file);
					}
				}
			
				else if(e.data.status == 'preloaded'){
					console.log("image_to_text worker sent 'preloaded' message. Seems to be ready to go.");
					add_chat_message('image_to_text','image_to_text', get_translation('Loading_complete'),'Loading_complete');
				}
				
			
				else if(e.data.status == 'done'){
					console.log("image_to_text worker sent 'done' message. Seems to be for a file being done downloading");
					handle_download_complete(false);
				}
				
				
				else if(e.data.status == 'image_to_text_progress'){
					//console.log("image_to_text worker sent 'image_to_text_progress' message: ", e.data);
					if(typeof e.data.task != 'undefined' && typeof e.data.task.index == 'number' && typeof e.data.progress == 'number'){
						//console.log("got everything to update image_to_text progress");
						let image_to_text_progress_el = document.getElementById('chat-message-task-image_to_text-progress' + e.data.task.index);
						if(image_to_text_progress_el == null){
							let image_to_text_task_el = document.getElementById('chat-message-task-image_to_text' + e.data.task.index);
							if(image_to_text_task_el){
								image_to_text_progress_el = document.createElement('progress');
								image_to_text_progress_el.setAttribute('id','chat-message-task-image_to_text-progress' + e.data.task.index);
								image_to_text_task_el.appendChild(image_to_text_progress_el);
								const image_to_text_time_remaining_el = document.createElement('div');
								image_to_text_time_remaining_el.setAttribute('id','chat-message-task-image_to_text-time-remaining' + e.data.task.index);
								image_to_text_time_remaining_el.classList.add('time-remaining');
								image_to_text_task_el.appendChild(image_to_text_time_remaining_el);
							}
							else{
								//image_to_text_previous_percentage_timestamp = Date.now();
							}
						}
						
						if(image_to_text_progress_el){
							image_to_text_progress_el.value = e.data.progress;
							
							
							
							const image_to_text_time_remaining_element = document.getElementById('chat-message-task-image_to_text-time-remaining' + e.data.task.index);
							if(image_to_text_time_remaining_element){
								const percentage = e.data.progress * 100;
								
								if(image_to_text_previous_percentage > percentage){
									image_to_text_previous_percentage = 0;
								}
								
								if(Math.floor(percentage) > image_to_text_previous_percentage){
									//console.log("\n\nimage_to_text: %: ", percentage);
									if(percentage == 1){
										image_to_text_previous_percentage_timestamp = Date.now();
									}
									if(percentage > 2){
										const delta = Date.now() - image_to_text_previous_percentage_timestamp;
										//console.log("image_to_text_progress: time it took for 1% progress: ", delta);
										const percent_remaning = 100 - percentage;
										console.log("image_to_text_progress: seconds remaning: ", (percent_remaning * delta) / 1000);
										//image_to_text_time_remaining_element.innerHTML = '<span></span>';
										
										let time_remaining = (percent_remaning * delta) / 1000;
										image_to_text_time_remaining_element.innerHTML = window.create_time_remaining_html(time_remaining);
										
										
									}
									image_to_text_previous_percentage = percentage;
									image_to_text_previous_percentage_timestamp = Date.now();
								
								
								}
							}
							else{
								console.error("image_to_text: could not find time-remaining element");
							}
							
							
							/*
							if(e.data.progress == 1){
								image_to_text_progress_el.removeAttribute('id');
							}
							*/
							
						}
						else{
							console.error("still no image_to_text_progress_el");
						}
						
					}
				}
				
				else if(e.data.status == 'download_required'){
					console.log("image_to_text worker sent 'download_required' message.");
					flash_message(get_translation("A_model_has_to_be_downloaded_from_the_internet_but_there_is_no_internet_connection"), 4000, 'fail');
				}
			
				else if(e.data.status == 'update'){
					//console.log("received an update from image_to_text worker.  e.data: ", e.data);
					if(typeof e.data.chunk == 'string' && typeof e.data.output_so_far == 'string'){
						window.handle_chunk(my_image_to_text_task,e.data.output_so_far,e.data.chunk);
						//set_chat_status({'assistant':'image_to_text'}, e.data.output);
					}
				}
				
				else if(e.data.status == 'complete'){
					//window.image_to_text_worker_busy = false;
					//set_chat_status('',2);
					console.log('GOT IMAGE TO TEXT COMPLETE.  e.data: ', e.data);
					/*
					if(typeof e.data.task != 'undefined' && typeof e.data.task.index == 'number' && typeof e.data.wav_blob != 'undefined'){
						console.log("image_to_text worker: complete, and returned wav_blob");
						let image_to_text_task_el = document.getElementById('chat-message-task-image_to_text' + e.data.task.index);
						if(image_to_text_task_el){
							image_to_text_task_el.innerHTML = '';
							let audio_player_el = document.createElement('audio');
							console.log("audio_player_el: ", audio_player_el);
							audio_player_el.classList.add('chat-message-audio-player');
							audio_player_el.setAttribute('controls',true);
							//audio_player_el.setAttribute("type","audio/mpeg");
							audio_player_el.setAttribute('id','chat-message-audio-player-task' + e.data.index);
							audio_player_el.src = window.URL.createObjectURL(e.data.wav_blob);
							//audio_player_el.load();
							console.log("do_audio_player: appending audio_player to bubble: ", audio_player_el);
							image_to_text_task_el.appendChild(audio_player_el);
							
							if(window.settings.assistant != 'image_to_text'){
								flash_message(get_translation("Music_has_been_generated"));
							}
						}
						
						
					}
					else{
						console.log("missing data in image_to_text complete message: ", e.data);
					}
					*/
				
				}
				
				else if(e.data.status == 'error'){
					if(typeof e.data.error == 'string'){
						if(e.data.error.indexOf('no available backend found') != -1){
							flash_message(get_translation('A_model_needs_to_be_downloaded_but_there_is_no_internet_connection'),4000,'warn');
						}
						else{
							flash_message(get_translation('An_error_occured'),4000,'warn');
						}
					}
					
					window.image_to_text_worker_busy = false;
				}
				
				
				
				else{
					console.log("image_to_text worker sent an unexpected content message: ", e.data);
					window.image_to_text_worker_busy = false;
				}
			}
			
	
		});


		window.real_image_to_text_worker.addEventListener('error', (error) => {
			console.error("ERROR: image_to_text_worker sent error. terminating!. Error was: ", error, error.message);
			image_to_text_worker_error_count++;
			
			window.real_image_to_text_worker.terminate();
			window.image_to_text_worker = null;
			window.image_to_text_worker_busy = false;
			if(window.busy_loading_assistant == 'image_to_text'){
				window.busy_loading_assistant = null;
			}
			if(typeof error != 'undefined' && image_to_text_worker_error_count < 10){
				setTimeout(() => {
					console.log("attempting to restart image_to_text worker");
					create_image_to_text_worker();
				},1000);
			}
			else{
				console.error("image_to_text_worker errored out");
			}
			
			// TODO: clean up the partially executed task?
			if(my_image_to_text_task != null){
				window.handle_completed_task(my_image_to_text_task,false,{'state':'failed'});
				my_image_to_text_task = null;
			}
			
		});
		
		resolve(true);
	});
}



window.do_image_to_text = function (task){ // image_to_text_queue_item
	console.log("in do_image_to_text. Task: ", task);
	
	return new Promise((resolve, reject) => {
		
		if(task == null){
			console.error("do_image_to_text: task was null");
			reject(false);
			return false
		}
		
		if(typeof task.image_blob == 'undefined' || task.image_blob == null){
			console.error("do_image_to_text: invalid image_blob provided");
			reject(false);
			return false
		}
		
		// This AI can use different models under the hood. It's not optimal to do this nested approach..
		if(typeof window.settings.assistants['image_to_text'] != 'undefined' && typeof window.settings.assistants['image_to_text']['huggingface_id'] == 'string' && window.settings.assistants['image_to_text']['huggingface_id'].length){  // window.settings['image_to_text'].model_id.toLowerCase().indexOf('nanollava') != -1
			task['huggingface_id'] = window.settings.assistants['image_to_text'].huggingface_id;
			console.log('do_image_to_text: setting task.huggingface_id as: ', window.settings.assistants['image_to_text'].huggingface_id);
		}
		else{
			console.error('do_image_to_text: NOT setting task.huggingface_id.  window.settings.assistants[image_to_text]:  ', window.settings.assistants['image_to_text']);
		}
		
		my_image_to_text_task = task;
		
		
		
		if(window.image_to_text_worker == null){
			console.log("do_image_to_text: calling create_image_to_text_worker");
			create_image_to_text_worker()
			.then((value) => {
				console.log("do_image_to_text: .then: create_image_to_text_worker should be done now. value: ",value);
				console.log("do_image_to_text: window.image_to_text_worker: ", window.image_to_text_worker);
			
				if(window.image_to_text_worker == null){
					console.error("do_image_to_text: creating image_to_text promise worker failed");
					reject(false);
				}
				else{
					console.warn("do_image_to_text: window.image_to_text_worker seems to exist: ", window.image_to_text_worker);
					//image_to_text_worker.postMessage({'task':task});
			
					document.body.classList.add('doing-image-to-text');
					
					console.warn("do_image_to_text: posting message to image_to_text_worker");
					window.image_to_text_worker.postMessage({
						'task':task
					})
					.then((response) => {
						console.error("\n\nHURRAY\n\nin image_to_text promiseWorker then!\n\n");
						console.log("image_to_text -> promise worker response: ", response);
						document.body.classList.remove('doing-image-to-text');
						resolve(response);
						//return response;
					})
					.catch((err) => {
						console.error("promise image_to_text worker: received error which was caught in worker: ", err);
						document.body.classList.remove('doing-image-to-text');
						if( ('' + err).indexOf('network error') != -1){
							flash_message(get_translation('A_network_connection_error_occured'),5000,'error');
						}
						
						
						reject(false);
						return false;
					})
			
				}
			
			})
			.catch((err) => {
				console.error("do_image_to_text: caught error from create_image_to_text_worker: ", err);
			})
		}
		else{
			console.log("do_image_to_text: doing postMessage. sending:  task,image_to_text_worker: ", task, window.image_to_text_worker);
			
			window.image_to_text_worker.postMessage({
				'task':task
			})
			.then((response) => {
				console.error("\n\nHURRAY\n\nin image_to_text promiseWorker.then!\n\n");
				console.log("image_to_text promise worker response: ", response);
				if(typeof response != 'undefined'){
					if(window.continuous_image_to_text_enabled == false){
						document.body.classList.remove('doing-image-to-text');
					}
					resolve(response);
					return response;
				}
				else{
					console.error("promise image_to_text worker: response was 'undefined'");
					document.body.classList.remove('doing-image-to-text');
					reject(false);
					return false;
				}
				
			})
			.catch((err) => {
				console.error("promise image_to_text worker: received error which was caught in worker: ", err);
				document.body.classList.remove('doing-image-to-text');
				reject(false);
				return false;
			})
		}
		
		
	});
	
}


window.do_continuous_image_to_text = async function (task=null){ // image_to_text_queue_item
	console.log("in do_continuous_image_to_text. window.waiting_for_image_to_text: ", window.waiting_for_image_to_text);
	window.continuous_image_to_text_enabled = true;
	
	window.continuous_image_to_text_scan_counter = 0;
	window.busy_starting_camera = false;
	
	if(window.camera_on == false){
		console.log("do_continuous_image_to_text: have to start the camera first");
		window.busy_starting_camera = true;
		window.add_script('./camera_module.js',true) // add it as a module
		.then((value) => {
			console.log("do_continuous_image_to_text: starting camera..");
			return window.start_camera();
		})
		.then((start_camera_state) => {
			console.log("do_continuous_image_to_text: camera should now be started..  start_camera_state: ", start_camera_state);
		})
		.catch((err) => {
			console.error("do_continuous_image_to_text: caught error loading camera_module script or starting the camera: ", err);
			return false
		})
			
	}
	
	if(window.image_to_text_interval != null){
		clearInterval(window.image_to_text_interval);
	}
	window.image_to_text_interval = setInterval(() => {
		//console.log("* do_continuous_image_to_text: in image_to_text interval. window.continuous_image_to_text_enabled: ", window.continuous_image_to_text_enabled);
		//console.log("window.waiting_for_image_to_text: ", window.waiting_for_image_to_text);
		if(window.continuous_image_to_text_enabled == false || window.settings.assistant == 'image_to_text'){
			console.log("do_continuous_image_to_text: clearing window.image_to_text_interval and exiting image-to-text continuous interval loop");
			clearInterval(window.image_to_text_interval);
			window.image_to_text_interval = null;
			window.update_task_overview();
			return
		}
		
		if(window.busy_starting_camera){
			console.warn("do_continuous_image_to_text: interval: skipping, as camera is starting")
			return
		}
		
		if(window.camera_on == false){
			console.warn("do_continuous_image_to_text: interval: aborting, as camera has been set to off");
			clearInterval(window.image_to_text_interval);
			window.update_task_overview();
			return
		}
		
		if(window.camera_on && window.waiting_for_image_to_text == false){
			console.log("do_continuous_image_to_text: not waiting_for_image_to_text");
			window.image_to_text_start_time = Date.now();
			window.describe_one_camera_frame();
			window.update_task_overview();
			
		}
		else{
			
			window.continuous_image_to_text_scan_counter++;
			if(window.continuous_image_to_text_scan_counter > window.image_to_text_delta){
				window.continuous_image_to_text_scan_counter = window.image_to_text_delta;
			}
			camera_image_to_text_scan_progress_el.value = window.continuous_image_to_text_scan_counter / window.image_to_text_delta;

			//console.log("do_continuous_image_to_text: window.waiting_for_image_to_text is true, still waiting...  window.camera_on,window.waiting_for_image_to_text:", window.camera_on, window.waiting_for_image_to_text);
		}
		document.body.classList.add('doing-image-to-text');
		
		
	},1000);
	
	
	// For creating relative timestamps when descriptions are inserted into a document
	if(window.last_time_continuous_image_to_text_started == null){
		window.last_time_continuous_image_to_text_started = Date.now();
	}
	
}


window.describe_one_camera_frame = () => {
	console.log("in describe_one_camera_frame");
	
	camera_do_ocr_details_el.open = false;
	camera_image_to_text_details_el.open = true;
	
	window.last_image_to_text_blob_file = null;
	
	
	
	window.get_camera_jpeg_blob() // this should also restart the camera if it was stopped by accident // TODO: check is this is the case
	.then((blob) => {
		
		if(window.camera_streaming){
			console.log("describe_one_camera_frame: in theory the camera is streaming. ");
			
			
			function add_image_to_text_task(fresh_blob){
				console.log("describe_one_camera_frame: in theory the camera is streaming, so will attempt to grab an image from the stream");
				window.last_image_to_text_blob = fresh_blob;
				window.last_image_to_text_blob_file = null;
				window.continuous_image_to_text_scan_counter = 0;
				window.last_time_continuous_image_to_text_frame_grabbed = Date.now();
		
				let continuous_image_to_text_task = {
					'image_blob':fresh_blob,
					'assistant':'image_to_text',
					'origin':'camera',
					'state':'should_image_to_text',
					'type':'image_to_text',
				}
				const image_to_text_prompt = window.live_image_to_text_prompt_el.value;
				if(image_to_text_prompt.length > 4){
					continuous_image_to_text_task['prompt'] = image_to_text_prompt;
					if(window.settings.image_to_text_prompt != image_to_text_prompt){
						console.log("image_to_text_prompt changed to: ",  image_to_text_prompt);
						window.settings.image_to_text_prompt = image_to_text_prompt;
						save_settings();
					}
				}
				else{
					continuous_image_to_text_task['prompt'] = 'Describe the image';
				}
			
				if(window.create_image_to_text_task(continuous_image_to_text_task)){
					console.log("describe_one_camera_frame: a new continuous image_to_text task was added succesfully");
				}
				else{
					console.error("describe_one_camera_frame: failed to create_camera_to_text_task, add_task returned false");
				}
			}
			
			
			// If the blob is very big, resize it first
			try{
				createImageBitmap(blob)
				.then((original_bitmap) => {
					const { width, height } = original_bitmap;
					if(width > 1280 || height > 1280){
						console.log("describe_one_camera_frame: image-to-text blob should be resized, it's rather large.  width, height: ", width, height);
		  				let scale_factor = 1;
		  				let desired_width = width;
		    			let desired_height = height;
		    			if(width > height){
		    				scale_factor = width / 1280;
		    			}
		    			else{
		    			 	scale_factor = height / 1280;
		    			}
		    			desired_width = Math.round(width / scale_factor);
		    			desired_height = Math.round(height / scale_factor);
		  
		    			createImageBitmap(original_bitmap, { resizeWidth: desired_width, resizeHeight: desired_height })
						.then((resized_bitmap) => {
			    			original_bitmap.close();
			    			let resized_canvas = document.createElement('canvas');
			    			resized_canvas.width = desired_width;
			    			resized_canvas.height = desired_height;
			    			const resized_canvas_ctx = resized_canvas.getContext("2d");
			    			resized_canvas_ctx.drawImage(resized_bitmap, 0, 0, desired_width, desired_height);
			    			resized_bitmap.close();
			    			resized_canvas.toBlob(
								(resized_blob) => {
									add_image_to_text_task(resized_blob);
								},
								"image/jpeg",
								0.95,
							);
						})
						.catch((err) => {
							console.error("describe_one_camera_frame: caught error trying to resize blob with createImageBitmap: ", err);
							add_image_to_text_task(blob);
							original_bitmap.close();
						})
		    			
					}
					else{
						add_image_to_text_task(blob);
					}
				})
				.catch((err) => {
					console.error("describe_one_camera_frame: caught error trying to resize blob with createImageBitmap: ", err);
					add_image_to_text_task(blob);
					original_bitmap.close();
				})
				
			}
			catch(err){
				console.error("describe_one_camera_frame: caught error trying to resize blob: ", err);
				add_image_to_text_task(blob);
			}
			
			
	
		}
		
		
	})
	.catch((err) => {
		console.error("describe_one_camera_frame: caught error from window.get_camera_jpeg_blob: ", err);
		window.camera_streaming = false;
		window.continuous_image_to_text_scan_counter = 0;
	})
	
	
}



window.new_document_from_image_to_text_scan_result = function (){
	console.log("in new_document_from_image_to_text_scan_result");
	
	let save_image_to_text_task = {
		'prompt':null,
		'origin':'picture',
		'assistant':'image_to_text',
		'type':'image_processing',
		'state':'doing_image_to_text',
		'destination':'document'
	}
	//console.log("save_image_to_text_task: ", save_image_to_text_task);
	
	let image_to_text_document_filename = get_translation('Image_description') + ' ' + make_date_string() + '.txt'
	create_new_document(get_translation("Image_description") + ":\n\n", image_to_text_document_filename);
	save_image_to_text_task['file'] = {'folder':folder,'filename':image_to_text_document_filename};
	save_image_to_text_task['selection'] = {'position':'end'};
	
	save_image_to_text_task = window.add_task(save_image_to_text_task);
	if(save_image_to_text_task){
		window.handle_completed_task(save_image_to_text_task,live_image_to_text_output_el.value + '\n');
	}
	
}



window.insert_image_to_text_scan_result = async function(task=null,selection=null){
	// live_image_to_text_output_el.value + '\n'
	
	
	let save_image_to_text_task = {
		'prompt':null,
		'origin':'picture',
		'assistant':'image_to_text',
		'type':'image_to_text',
		'state':'doing_image_to_text',
		'destination':'document'
	}
	
	if(task != null && typeof task.file != 'undefined' && task.file != null && typeof task.file.filename == 'string'){
		save_image_to_text_task['file'] = task.file;
	}
	else{
		if(window.settings.docs.open == null){
			console.error("insert_image_to_text_scan_result: no open document?");
		
			//window.continuous_image_to_text_enabled = false;
			//camera_image_to_text_auto_scan_input_el.checked = false;
			//window.settings['continous_image_to_text'] = false;
		
			//return false
		
			const new_date_time = make_date_string();
			await window.create_new_document(get_translation('image_to_text_name') + ' - ' + new_date_time + '\n\n', get_translation('image_to_text_name') + "-" + new_date_time + ".txt");
			window.scroll_to_end();
			console.log("window.settings.docs.open is now: ", window.settings.docs.open);
			save_image_to_text_task['file'] = window.settings.docs.open;
		}
		
		if(selection == null){
			save_image_to_text_task['selection'] = window.doc_selection;
		}
		else{
			save_image_to_text_task['selection'] = selection; // {'position':'end'}
		}
		
		save_image_to_text_task['file'] = window.settings.docs.open;
	}
	
	
	
	
	
	// insert it 1 character before the actual cursor position
	/*
	if(save_image_to_text_task['selection'] && typeof save_image_to_text_task['selection'].from == 'number' && typeof save_image_to_text_task['selection'].to == 'number' && save_image_to_text_task['selection'].from == save_image_to_text_task['selection'].to && save_image_to_text_task['selection'].from > 0){
		save_image_to_text_task['selection'].from = save_image_to_text_task['selection'].from - 1;
		save_image_to_text_task['selection'].to = save_image_to_text_task['selection'].to - 1;
	}
	else{
		save_image_to_text_task['selection'] = {'to':0,'from':0}
	}
	*/
	
	insert_into_document(save_image_to_text_task, live_image_to_text_output_el.value + '\n');
	// insert_into_document(task,content,{"position":"overwrite"});
	
}




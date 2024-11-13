//window.version = 95; // NOT USED
//window.cache_name = "v" + window.settings.version;

window.deregistered = false
let received_service_worker_update_download_progress_message = false;

const update_download_progress_el = document.getElementById('update-download-progress');
const update_download_version_el = document.getElementById('update-download-version');

const channel = new BroadcastChannel('sw-messages');
channel.addEventListener('message', event => {
	if(window.settings.settings_complexity == 'developer'){
		console.warn('dev: updater.js: received broadcast message from service workers: ', event.data);
	}
	if(window.settings.version == null){
		console.warn("received caching progress message from service worker, which is pre-caching the initial version: ", event.data.version);
		return
	}
	if(update_download_progress_el != null && typeof event.data.pre_cache_progress == 'number'){
		received_service_worker_update_download_progress_message = true;
		if(event.data.pre_cache_progress >= 1){
			remove_body_class('update-downloading');
		}
		else{
			add_body_class('update-downloading');
		}
		update_download_progress_el.value = event.data.pre_cache_progress;
		if(window.settings.settings_complexity != 'normal' && typeof event.data.version == 'number' && update_download_version_el != null){
			update_download_version_el.textContent = window.settings.version + ' ➜ ' + event.data.version;
		}
	}
	
	if(typeof event.data.pre_cache_done == 'boolean' && event.data.pre_cache_done == true){
		window.notify_user_of_available_update();
	}
	
});

function send_message_to_service_worker(controller,message) {
    return new Promise(function(resolve, reject) {
        var messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = function(event) {
    		if(window.settings.settings_complexity == 'developer'){
				console.warn("dev: updater.js: send_message_to_service_worker: received a response. event: ", event);
			}
            if (event.data.error) {
				reject(event.data.error);
            } else {
				resolve(event.data);
            }
			
			if (event.data.download_failed) {
				console.error("UPDATE.JS: received message from service worker that a download failed");
			}
        };

	  	if(controller){
	  		controller.postMessage(message, [messageChannel.port2]);
	  	}
	  	else{
	  		console.error("cannot send message to service worker: no navigator.serviceWorker.controller");
	  		reject(false);
	  	}
	
    });
}


if (navigator.serviceWorker.controller) {
	//console.log('Sending version request to controlling serviceworker');
	//navigator.serviceWorker.controller.postMessage({"type":"get_version_number"});
	send_message_to_service_worker(navigator.serviceWorker.controller,{"type":"get_version_number"});
	
	navigator.serviceWorker.addEventListener("message", (event) => {
		console.log("updater.js: received a message from a service worker: ", event.data);
	});
	
	
	
} else {
	//console.log('No service worker controller found. Try a soft reload.');
}





let requested_version = false;

window.service_worker_registered = async function (registration){
	if(window.settings.settings_complexity == 'developer'){
		console.warn("dev: updater.js: in service_worker_registered. registration: ", registration);
	}
	
	if(registration.active != null && registration.waiting != null){
		console.warn("updater.js: there is both an active service worker, and a waiting one. Notifying user that an update is available");
		if(received_service_worker_update_download_progress_message){
			//window.notify_user_of_available_update();
		}
	}
	
	if(typeof registration.active != 'undefined' && registration.active != null){
		//console.log("updater.js there is an active service worker");
		//registration.active.postMessage({'type':'get_version_number'});
		
		send_message_to_service_worker(registration.active,{"type":"get_version_number","version":window.settings.version})
		.then((response) => {
			if(window.settings.settings_complexity == 'developer'){
				console.warn("dev: service_worker_registered: service worker responded: ", JSON.stringify(response,null,2));
			}
			
			if(typeof response != 'undefined' && response != null && typeof response.version_number == 'number'){
				if(window.settings.settings_complexity == 'developer'){
					console.warn("dev: updater.js: service_worker_registered: returned version_number: ", response.version_number, " ,  =?= window.settings.version: ", window.settings.version);
				}
				
				window.cache_name = 'v' + response.version_number;
				
				if(window.settings.version == null){
					window.settings.version = response.version_number;
					save_settings();
				}
				
				else if(typeof window.settings.version == 'number' && window.settings.version < response.version_number){
					if(window.settings.settings_complexity == 'developer'){
						console.warn("dev: updater.js: UPDATED TO A NEW VERSION! Saving to settings: ", response.version_number);
					}
					window.settings.version = response.version_number;
					save_settings();
					document.body.classList.remove('update-available');
					
					document.getElementById('papegai-version').textContent = window.cache_name;
					
				}
				else if(typeof window.settings.version == 'number' && window.settings.version == response.version_number){
					//document.body.classList.remove('update-available');
					
					if(typeof registration.waiting == 'undefined' || (typeof registration.waiting != 'undefined' && registration.waiting == null)){
						if(window.settings.settings_complexity == 'developer'){
							console.warn("dev: updater.js: there is an active service worker, and there doesn't seem to be a waiting service worker");
						}
						//cache_names = await caches.keys();
						caches.keys()
						.then((cache_names) => {
							console.log("updater.js: cache_names: ", cache_names);
						    for (let cache_name of cache_names){
								console.log("updater.js: spotted cache called: ", cache_name);
						    	for(let v = 0; v < response.version_number; v++){
						    		if(cache_name == 'v' + v){
										console.error("updater.js: deleting outdated cache: ", response.version_number, cache_name);
						    			caches.delete(cache_name);
						    		}
						    	}
						    }
						})
						.catch((err) => {
							console.error("updater.js: caught error trying to loop over existing caches: ", err);
						})
					}
				   
					
					if(window.settings.settings_complexity == 'developer'){
						console.warn("dev: there is an active worker: ", response.version_number);
						setTimeout(() => {
							console.warn("dev: _________THE CACHE_________");
							list_caches();
						},5000);
					}
					
					
					setTimeout(() =>{
						/*
						caches.keys()
						.then(function(names) {
						    for (let cache_name of names){
								if(window.settings.settings_complexity == 'developer'){
									console.warn("dev: updater.js: spotted cache called: ", cache_name);
								}
						    	for(let v = 0; v < response.version_number; v++){
						    		if(cache_name == 'v' + v){
										if(window.settings.settings_complexity == 'developer'){
											console.error("dev: updater.js: deleting outdated cache: ", cache_name);
										}
						    			caches.delete(cache_name);
						    		}
						    	}
						    }
						});
						*/
						
						
						
						
						
					},10000);
					
				}
				/*
				if(window.settings.settings_complexity == 'developer'){
					setTimeout(() => {
						list_caches();
					},5000);
				}
				*/
				
			}
			
		})
		.catch((err) => {
			console.error("sending message service worker failed: ", err);
		})
		
	}
	//else 
	if(typeof registration.waiting != 'undefined' && registration.waiting != null){
		if(window.settings.settings_complexity == 'developer'){
			console.warn("A service worker is waiting to take over control, adding message listener to it");
		}
		
		registration.waiting.addEventListener("message", (event) => {
			console.log("updater.js: received a message from a waiting service worker: ", event.data);
		});
		
		window.notify_user_of_available_update();
		
		
	}
	else if(typeof registration.waiting == 'undefined' || (typeof registration.waiting != 'undefined' && registration.waiting == null)){
		if(window.settings.settings_complexity == 'developer'){
			console.warn("dev: updater.js: there is no service worker waiting in the wings");
		}
		// Probably better to let the service worker handle this? Then it can call that same function before telling the user an update is available, to preload the update
		// Maybe also check if a service worker is even running?
		if(window.first_run == false && (window.is_mobile == false || window.settings.settings_complexity == 'advanced') && typeof window.add_script != 'undefined'){
			setTimeout(() => {
				//console.log("last.js: a minute has passed: maybe pre-load some JS?");
				//preload_some_scripts();
				//if(window.settings.settings_complexity != 'normal'){}
		
			},300000);
		}
	}
	
	else{
		console.warn("a registered service worker was neither active nor waiting: ", registration);
	}
	
}

// called when service worker is registered
// Is it though?
/*
window.service_worker_ready = async function (registration){
	console.log("updater.js: in service_worker_ready. registration: ", registration);
	
	try{
		registration.addEventListener("message", (event) => {
			console.error("updater.js: received post-registration message from service worker: ", event.data, event);
			//document.getElementById('papegai-version').innerText = 'v' + window.settings.version;
		});
		
		
		console.error("updater.js: attempting postMessage to service worker. registration.active: ", registration.active);
		//registration.active.postMessage({'type':'get_version_number'});
		
		send_message_to_service_worker(registration.active, {"type":"get_version_number"})
		.then((response) => {
			console.log("service_worker_ready: service worker responded: ", response);
			
			if(typeof response != 'undefined' && response != null && typeof response.data != 'undefined' && typeof response.data.version_number == 'number'){
				
				window.cache_name = 'v' + response.version_number;
				
				document.getElementById('papegai-version').textContent = window.cache_name;
				
				if(window.settings.version == null){
					window.settings.version = response.version_number;
					save_settings();
				}
				
				else if(typeof window.settings.version == 'number' && window.settings.version < response.data.version_number){
					//console.log("A new version!  Saving to settings: response.data.version_number: ", response.data.version_number);
					window.settings.version = response.data.version_number;
					save_settings();
					
					//document.getElementById('papegai-version').textContent = 'v' + window.settings.version + ' -> v' + response.data.version_number;
					document.body.classList.add('update-available');
					window.settings.left_sidebar_settings_tab = 'settings';
					document.body.classList.remove('sidebar-settings-show-tasks');
				}
				else if(typeof window.settings.version == 'number' && window.settings.version == response.version_number){
					//document.body.classList.remove('update-available');
					//document.getElementById('papegai-version').textContent = 'v' + window.settings.version;
				}
				
			}
			
		})
		.catch((err) => {
			console.error("sending message service worker failed: ", err);
		})
		
	}
	catch(err){
		console.error("updater.js:   window.service_worker_ready: caught error trying to post message to service worker: ", err);
	}
	
}
*/

/*
navigator.serviceWorker.addEventListener("message", (message) => {
	console.error("updater.js: received a message from a service worker: ", message);
});
*/

window.notify_user_of_available_update = async function (){
	document.body.classList.add('update-available');
	document.body.classList.remove('update-downloading');
	window.settings.left_sidebar_settings_tab = 'settings';
	document.body.classList.remove('sidebar-settings-show-tasks');
	window.flash_message(window.get_translation('A_new_version_is_available'));
}




window.update_site = async function (){
	console.error("updater.js: in update_site");
	
	//window.settings.version = null;
	save_settings();
	
	// n.serviceWorker.controller.postMessage({ type: "deregister" });
    const n = navigator;
	//console.log("updater.js: update_site: does a service worker exist?  n.serviceWorker:", n.serviceWorker);
    const controlling = n.serviceWorker && n.serviceWorker.controller;
	console.log("updater.js: update_site: is a service worker controlling? ", controlling);
	if(controlling){
		//console.log("update_site: sending clear_cache message to service worker");
		//n.serviceWorker.postMessage({'type':'clear_cache'});
		//n.serviceWorker.controller.postMessage({'type':'clear_cache'});
		if(typeof window.settings.version == 'number'){
			flash_message(get_translation("Updating"),10000);
		}
		
	}
	else{
		console.error("update_site: no controlling service worker?");
	}
	
	/*
	caches.keys()
	.then(function(names) {
	    for (let cache_name of names){
			//console.log("updater.js: update_site: spotted cache called: ", cache_name);
	    	for(let v = 0; v < window.settings.version; v++){
	    		if(cache_name == 'v' + v){
					console.log("update_site: deleting outdated cache: ", cache_name);
	    			caches.delete(cache_name);
	    		}
	    	}
	    }
	});
	*/
	
	
	
	/*
	setTimeout(() => {
		if(typeof window.settings.version == 'number'){
			//flash_message(get_translation("Updating"),10000);
		}
	},5000);
	
	setTimeout(() => {
		console.error("still not reloaded after 60 seconds?");
		window.location.reload(true);
	},60000);
	*/
	//console.log("calling unregister_serviceworkers");
	//unregister_serviceworkers();
	
}



if(typeof navigator.serviceWorker != 'undefined'){
	navigator.serviceWorker.addEventListener('controllerchange', (event) => {
		console.log("updater.js: service worker changed: ", event);
		
		if(window.first_run == false){
			/*
			setTimeout(() => {
				document.body.classList.add('update-available');
				window.flash_message(window.get_translation('A_new_version_is_available'));
			},1000);
			*/
			if(window.time_started - Date.now() < 20000){
				console.warn("EARLY SERVICE WORKER CONTROLLER CHANGE");
				
				//clear_transformers_cache();
				
				/*
				window.flash_message(window. get_translation("Updating"),10000);
				setTimeout(() => {
					window.location.reload(true);
				},1000);
				*/
			}
			
		}
		
		if(window.settings.settings_complexity == 'developer'){
			window.flash_message('Updated');
		}
		
		//get_current_service_worker();
		
	});
}


// Used by unregister button in developer mode settings menu
function unregister_serviceworkers(){
	console.error("in unregister_serviceworkers (should not be used, as it also unloads the waiting service worker)");
	if(window.settings.settings_complexity == 'developer'){
		navigator.serviceWorker.getRegistrations().then(function(registrations) {
			console.log("serviceworker registrations: ", registrations);
		 	for(let registration of registrations) {
				registration.unregister();
			}
		})
	}
}


function update_service_worker(){
	console.log("in update_service_worker");
	
	/*
	if(controlling){
		//console.log("update_site: sending clear_cache message to service worker");
		//n.serviceWorker.postMessage({'type':'clear_cache'});
		n.serviceWorker.controller.postMessage({'type':'update'});
		flash_message(get_translation("Updating"),10000);
		
		n.serviceWorker.controller.unregister()
	    .then( unregResult => { 
			console.log("unregResult: ", unregResult);
			//You can check if successful with Promise result 'unregResult'
			window.location.reload();
	    })
		
		setTimeout(() => {
			window.location.reload(true);
		},5000);
	}
	else{
		console.error("update_site:  cannot post message to service worker: not controlling");
	}
	*/
	/*
	if(typeof n.serviceWorker.controller != 'undefined' && n.serviceWorker.controller != null){
		n.serviceWorker.controller.postMessage({'type':'update'});
		flash_message(get_translation("Updating"),10000);
	
		n.serviceWorker.controller.unregister()
	    .then( unregResult => { 
			console.log("unregResult: ", unregResult);
			//You can check if successful with Promise result 'unregResult'
			window.location.reload();
	    })
	
		setTimeout(() => {
			window.location.reload(true);
		},5000);
	}
	else if(typeof n.serviceWorker != 'undefined' && n.serviceWorker != null){
		n.serviceWorker.postMessage({'type':'update'});
		flash_message(get_translation("Updating"),10000);
	
		n.serviceWorker.unregister()
	    .then( unregResult => { 
			console.log("unregResult: ", unregResult);
			//You can check if successful with Promise result 'unregResult'
			window.location.reload();
	    })
	
		setTimeout(() => {
			window.location.reload(true);
		},5000);
	}
	*/
	
	
	
	/*
	setTimeout(() => {
		window.location.reload(true);
	},5000);
	*/
	
	if(window.settings.version != null){
		
		navigator.serviceWorker.getRegistrations().then(function(registrations) {
			console.log("update_service_worker: registrations: ", registrations);
			//console.log("registrations.waiting: ", registrations[0].waiting);
			/*
			navigator.serviceWorker.getRegistrations().then(function(registrations) {
				console.log("serviceworker registrations: ", registrations);
			 	for(let registration of registrations) {
					registration.unregister();
					send_message_to_service_worker(v.active,{"type":"unregister"});
				}
			})
			*/
		
			for(let sw = 0; sw < registrations.length; sw++){
			
				if(window.settings && window.settings.settings_complexity === 'developer'){
					console.log('dev: serviceWorker.getRegistrations: ACTIVE ', sw, registrations[sw], typeof registrations[sw].active, registrations[sw].active);
					console.log('dev: serviceWorker.getRegistrations: WAITING ', sw, registrations[sw], typeof registrations[sw].active, registrations[sw].active);
				}
			
				if(typeof registrations[sw].waiting != 'undefined' && registrations[sw].waiting != null){

					console.log("telling the waiting service worker to take over");
					flash_message(window.get_translation("Updating"),10000);
					registrations[sw].waiting.postMessage({"type":"skip_waiting"});
				
					break
				}
				/*
				if(typeof registrations[sw].active == 'boolean' && registrations[sw].active == true){
					console.log("update.js: found active service worker at index ", sw);
					window.deregistered = true;
					registrations[sw].active.postMessage({"type":"deregister"});
				}
				*/
			
				//registrations[sw].unregister();
			
			
				console.log('dev: last script: list service worker registrations[sw].waiting: ', registrations[sw].waiting);
				console.log('dev: last script: list service worker registrations[sw].active: ', registrations[sw].active);
				//send_message_to_service_worker(v.active,{"type":"update"});
			};
		
		});
		
	}
	
	//unregister_serviceworkers();
	//setTimeout(() => {
		//window.location.reload(true); // service worker tells all clients to reload
	//},1000);

}
window.update_service_worker = update_service_worker;


function clear_transformers_cache(){
	console.warn("in clear_transformers_cache (BLOCKED)");
	return
	
	if(window.settings.settings_compexity == 'developer'){
		window.flash_message('Clearing Transformers cache');
		window.add_chat_message('current','developer','Cleared Transformers cache');
	}
	
	caches.open('transformers-cache')
	.then(cache => {
		
		cache.keys()
		.then(items => {
			//console.log("DELETE_MODEL_FROM_TRANSFORMERS_CACHE: ", cacheName, items);
    		items.map(item => {
				console.log(cacheName + " - item - ", item.url , item);
				const cached_file_url = item.url;
				
				if(!cached_file_url.toLowerCase().endsWith('.onnx')){
					console.log("deleting from Transformers cache: ", cached_file_url)
					cache.delete( cached_file_url )
					.then((value) => {
						console.log('deletes from transformers cache: resolved value:', value);
						
						//remove_from_cached_list(cached_file_url);
						
					})
					.catch((err) => {
						console.error('delete_model_from_cache: cache.delete() rejected/failed:', err);
					})
				}
				else{
					console.log("not deleting from Transformers cache: ", cached_file_url);
				}
			})
		})
		.catch((err) => {
			console.error("clear_transformers_cache: level 2 promise error: ", err);
		});
	})
	.catch((err) => {
		console.error("clear_transformers_cache: level 1 promise error: ", err);
	});
	
	/*
	caches.open('v' + window.settings.version)
	.then(cache => {
		
		cache.keys()
		.then(items => {
			//console.log("DELETE_MODEL_FROM_TRANSFORMERS_CACHE: ", cacheName, items);
    		items.map(item => {
				//console.log(cacheName + " - item - ", item.url , item);
				const cached_file_url = item.url;
				if(cached_file_url.indexOf('jsdelivr.') != -1 && cached_file_url.toLowerCase().endsWith('.wasm')){
					console.log("clear_transformers_cache: deleting from main cache: ", cached_file_url);
					cache.delete( cached_file_url )
					.then((value) => {
						console.log('deleting from main cache: resolved value:', value);
						
						remove_from_cached_list(cached_file_url);
						
					})
					.catch((err) => {
						console.error('delete_model_from_cache: cache.delete() rejected/failed:', err);
					})
				}
			})
		})
		.catch((err) => {
			console.error("clear_transformers_cache: level 2 promise error: ", err);
		});
	})
	.catch((err) => {
		console.error("clear_transformers_cache: level 1 promise error: ", err);
	});
	*/
}









async function preload_some_scripts(){
	console.log("in preload_some_scripts");
	if(typeof window.settings.version != 'number'){
		console.error("preload_some_scripts: aborting, window.settings.version was not a number");
		return
	}
	
	let cache_name = 'v' + window.settings.version;
	
	let files_to_preload = [
		
		'./404.html',
		
		'./whisper_worker.js',
		
		'./p_coder.js',
		'./pjs/dayjs-with-plugins.min.js',
		'./pjs/diff.js',
		'./pjs/linter.min.js',
		'./pjs/stylelint-bundle.min.js',
		'./pjs/beautify-css.min.js',
		'./pjs/beautify-html.min.js',
		'./pjs/beautify.js',
		'./fonts/FiraCode.woff',
		'./css/coder.css',
		
		'./js/eld.M60.min.js',
		
		'./camera_module.js',
		'./tesseract/tesseract.min.js',
		
		'./js/emoji_picker_browser.js',
		'./js/emojis.json',
		
		'./tjs/transformers.min.js',
		
		'./pdf_parse.js',
		'./pdfjs-dist/build/pdf.mjs',
		'./pdfjs-dist/build/pdf.worker.mjs',
		
		'./researcher_module.js',
		'./researcher/he.js',
		'./researcher/wikitext2plaintext.js',
		
		'./simple_vad/fft.js',
		'./simple_vad/vad-audio-worklet.js',
		
		'./specials/fairytale_example.js',
		'./specials/voice_tutorial.js',
		
		'./rag_module.js',
		'./promise_rag_worker.js',
		
		'./pip_module.js',
		'./js/canvasTxt.js',
		'./images/pip_header.png',
		
		'./pjs/filerobot-image-editor.min.js',
		
		'./audio/ok.mp3',
		'./audio/timer_done_harp.mp3',
		
		'https://huggingface.co/datasets/Xenova/cmu-arctic-xvectors-extracted/resolve/main/cmu_us_slt_arctic-wav-arctic_a0001.bin',
		
		'./t2i_module.js',
		
		'./t2i/ort.webgpu.min.js',
		'./t2i/ort.webgpu.min.js.map',
		'./t2i/t2i_worker.js',
		'./t2i/mediapipe/tasks-genai/genai_wasm_internal.js',
		'./t2i/ort-wasm-simd-threaded.jsep.wasm',
		'./t2i/ort-wasm-simd.jsep.wasm',
		
	];
	
	for(let f = 0; f < files_to_preload.length; f++){
		
		let found_it = false;
		let filename_to_cache = files_to_preload[f];
		if(typeof filename_to_cache != 'string'){
			console.error("filename_to_cache not a string?: ", f, typeof filename_to_cache, filename_to_cache);
			continue
		}
		filename_to_cache = filename_to_cache.replace('./','');
		
		for(let s = 0; s < window.cached_urls.length; s++){
			if(window.cached_urls[s].indexOf(filename_to_cache) != -1){
				found_it = true;
			}
		}
		if(found_it == false){
			try{
				console.log("preload_some_scripts: preloading into cache: ", filename_to_cache);
				let preload_cache = await caches.open(cache_name);
				
				let precache_result = await preload_cache.add(filename_to_cache); //await caches.open(cache_name).then((cache) => cache.add(filename_to_cache));
				console.log("preload_some_scripts: precache_result: ", filename_to_cache, " -> ", precache_result);
			}
			catch(err){
				console.error("caught error in preload_some_scripts: ", err);
			}
		}
		else{
			console.log("preload_some_scripts: already in cache: ", filename_to_cache);
		}
		
	}
	
	/*
	for(let s = 0; s < window.cached_urls.length; s++){
		if(window.cached_urls[s].indexOf('eld.M60.min.js') != -1){
			spotted_language_detector = true;
		}
		if(window.cached_urls[s].indexOf('beautify-css.min.js') != -1){
			spotted_coder_scripts = true;
		}
	}
	if(spotted_coder_scripts == false && window.coder_script_loaded == false){
		await window.add_script('./p_coder.js'); 
	}
	
	if(spotted_language_detector == false && window.language_detector_loaded == false){
		//await add_script('./js/eld.M60.min.js');
		caches.open(cache_name).then((cache) => cache.add('./js/eld.M60.min.js'))
	}
	*/
}




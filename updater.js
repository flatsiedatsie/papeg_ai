window.version = 95; // NOT USED
window.cache_name = "v" + window.settings.version;



function send_message_to_service_worker(controller,message) {
  return new Promise(function(resolve, reject) {
    var messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function(event) {
		//console.log(" send_message_to_service_worker: received ...something. event: ", event);
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
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

window.service_worker_registered = async function (registration){
	//console.log("updater.js: in service_worker_registered. registration: ", registration);
	if(registration.active){
		//registration.active.postMessage({'type':'get_version_number'});
		
		send_message_to_service_worker(registration.active,{"type":"get_version_number"})
		.then((response) => {
			//console.log("service_worker_registered: service worker responded: ", response);
			
			if(typeof response != 'undefined' && response != null && typeof response.version_number == 'number'){
				console.log("service_worker_registered: returned version_number: ", response.version_number, " ,  =?= window.settings.version: ", window.settings.version);
				
				window.cache_name = 'v' + response.version_number;
				
				if(window.settings.version == null){
					window.settings.version = response.version_number;
					save_settings();
				}
				
				else if(typeof window.settings.version == 'number' && window.settings.version < response.version_number){
					console.log("A new version! Saving to settings: ", response.version_number);
					window.settings.version = response.version_number;
					save_settings();
					
					document.body.classList.add('update-available');
					if(window.settings.settings_complexity != 'normal'){
						//flash_message(get_translation('A_new_version_is_available'));
					}
				}
				else if(typeof window.settings.version == 'number' && window.settings.version == response.version_number){
					document.body.classList.remove('update-available');
				}
				
			}
			
		})
		.catch((err) => {
			console.error("sending message service worker failed: ", err);
		})
		
	}
	
}

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
			//console.log("service_worker_ready: service worker responded: ", response);
			
			if(typeof response != 'undefined' && response != null && typeof response.data != 'undefined' && typeof response.data.version_number == 'number'){
				
				window.cache_name = 'v' + response.version_number;
				
				if(window.settings.version == null){
					window.settings.version = response.version_number;
					save_settings();
				}
				
				else if(typeof window.settings.version == 'number' && window.settings.version < response.data.version_number){
					console.log("A new version!  Saving to settings: response.data.version_number: ", response.data.version_number);
					window.settings.version = response.data.version_number;
					save_settings();
					
					document.getElementById('papegai-version').textContent = 'v' + window.settings.version + ' -> v' + response.data.version_number;
					document.body.classList.add('update-available');
					window.settings.left_sidebar_settings_tab = 'settings';
					document.body.classList.remove('sidebar-settings-show-tasks');
					if(window.settings.settings_complexity != 'normal'){
						//flash_message(get_translation('A_new_version_is_available'));
					}
				}
				else if(typeof window.settings.version == 'number' && window.settings.version == response.version_number){
					document.body.classList.remove('update-available');
					document.getElementById('papegai-version').textContent = 'v' + window.settings.version;
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


/*
navigator.serviceWorker.addEventListener("message", (message) => {
	console.error("updater.js: received a message from a service worker: ", message);
});
*/

window.update_site = async function (){
	console.log("updater.js: in update_site");
	//window.settings.version = null;
	save_settings();
	
	
	
	// n.serviceWorker.controller.postMessage({ type: "deregister" });
    const n = navigator;
	console.log("updater.js: update_site: does a service worker exist?  n.serviceWorker:", n.serviceWorker);
    const controlling = n.serviceWorker && n.serviceWorker.controller;
	console.log("updater.js: update_site: is a service worker controlling? ", controlling);
	if(controlling){
		console.log("update_site: sending clear_cache message to service worker");
		//n.serviceWorker.postMessage({'type':'clear_cache'});
		n.serviceWorker.controller.postMessage({'type':'clear_cache'});
	}
	else{
		console.error("update_site:  cannot post message to service worker: not controlling");
	}
	
	
	setTimeout(() => {
		
		if(typeof window.settings.version == 'number'){
			
			flash_message(get_translation("Updating"),10000);
			
			caches.keys()
			.then(function(names) {
			    for (let cache_name of names){
					console.log("updater.js: update_site: spotted cache called: ", cache_name);
			    	for(let v = 0; v < window.settings.version; v++){
			    		if(cache_name == 'v' + v){
							console.log("update_site: deleting outdated cache: ", cache_name);
			    			caches.delete(cache_name);
			    		}
			    	}
			    }
			});
			
			setTimeout(() => {
				window.location.reload(true);
			},10000);
		
		}
		
	},5000);
	
}



if(typeof navigator.serviceWorker != 'undefined'){
	navigator.serviceWorker.addEventListener('controllerchange', (event) => {
		console.log("updater.js: service worker changed: ", event);
		
		
		if(window.first_run == false){
			
			if(window.time_started - Date.now() < 15000){
				console.warn("EARLY SERVICE WORKER CONTROLLER CHANGE");
				//document.body.classList.add('update-available');
				//window.flash_message(window.get_translation('A_new_version_is_available'));
				/*
				window.flash_message(window. get_translation("Updating"),10000);
				setTimeout(() => {
					window.location.reload(true);
				},1000);
				*/
			}
			
			
		}
		
	});
}

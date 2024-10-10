import { register } from './register_service_worker.js'

//console.log("calling register from register_service_worker to handle service_worker.js");

register('coi-serviceworker.js', {
    registrationOptions: { scope: './' },
    //registrationOptions: { scope: '/wasm3/' },
    ready (registration) {
		//console.log('Service manager: Papeg.ai service worker is active');
		
		if(typeof window.service_worker_ready != 'undefined'){
			//console.log('Service manager: calling window.service_worker_ready');
			window.service_worker_ready(registration);
		}
		else{
			console.error("service_module.js: window.service_worker_ready did not exist (yet)");
			setTimeout(() => {
				if(typeof window.service_worker_ready != 'undefined'){
					console.log("OK, window.service_worker_ready exists now");
					window.service_worker_ready(registration);
				}
				else{
					console.error("service_module.js: ten seconds later window.service_worker_ready still did not exist");
				}
			},10000);
		}
		
		
		
    },
    registered (registration) {
		//console.log('Service manager: Service worker has been registered.');
		if(typeof window.service_worker_registered != 'undefined'){
			console.log('Service manager: calling window.service_worker_registered');
			window.service_worker_registered(registration);
		}
		else{
			//console.error("service_module.js: window.service_worker_registered did not exist (yet)");
			setTimeout(() => {
				if(typeof window.service_worker_registered != 'undefined'){
					window.service_worker_registered(registration);
				}
				else{
					console.error("service_module.js: ten seconds later window.service_worker_registered still did not exist");
				}
			},10000);
			
		}
		
    },
    cached (registration) {
		console.log('Service manager: Content has been cached for offline use.');
    },
    updatefound (registration) {
		console.log('Service manager: New content is downloading.', registration);
    },
    updated (registration) {
		console.log('Service manager: New content is available; please refresh.');
		/*
		if(window.time_started - Date.now() < 10000){
			window.flash_message(window.get_translation("Updating"),10000);
			setTimeout(() => {
				window.location.reload(true);
			},1000);
		}
		*/
    },
    offline () {
		console.log('Service manager: No internet connection found. Papeg.ai is running in offline mode.');
		window.service_worker_offline();
    },
    error (error) {
		console.error('Service manager: Error during service worker registration:', error);
    }
})


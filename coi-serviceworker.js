// This script is always laoded in fresh (if there is an internet connection). That makes it useful as a backup to fix serious issues with deployment.



var service_worker_version = 518;
//console.log("service_worker: location: ", service_worker_version, location);
self.client_version = null;


let old_cache_urls = [
		
	'./404.html',
	
	'./tjs/transformers.min.js',
	
	'./js/eld.M60.min.js',
	
	'./whisper_worker.js',
	
	'./simple_vad/fft.js',
	'./simple_vad/vad-audio-worklet.js',
	
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
	
	'./camera_module.js',
	'./tesseract/tesseract.min.js',
	
	'./js/emoji_picker_browser.js',
	'./js/emojis.json',
	
	'./office_parser/officeParserBundle.js',
	
	'./pdf_parse.js',
	'./pdfjs-dist/build/pdf.mjs',
	'./pdfjs-dist/build/pdf.worker.mjs',
	
	'./researcher_module.js',
	'./researcher/he.js',
	'./researcher/wikitext2plaintext.js',
	
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
	'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0/dist/ort-wasm-simd-threaded.jsep.wasm',
	
	'./t2i_module.js',
	
	'./t2i/ort.webgpu.min.js',
	'./t2i/ort.webgpu.min.js.map',
	'./t2i/t2i_worker.js',
	'./t2i/mediapipe/tasks-genai/genai_wasm_internal.js',
	'./t2i/ort-wasm-simd-threaded.jsep.wasm',
	'./t2i/ort-wasm-simd.jsep.wasm',
		
]


const channel = new BroadcastChannel('sw-messages');
channel.postMessage({title: 'Hello from SW ' + service_worker_version});

function send_message_to_client(message=null){
	//console.log("service_worker: in send_message_to_client. message: ", message);
	if(message == null){
		console.error("service_worker: send_message_to_client: invalid message provided");
	}
	message['version'] = service_worker_version;
	channel.postMessage(message);
	
	/*
	self.clients.matchAll()
	.then((clients) => {
		console.log("send_message_to_client: clients: ", clients);
		clients.forEach(function(client) {
			console.log("--> send_message_to_client: posting message to client: ", message);
			client.postMessage(message);
	  	})
	})
	*/
}








if(service_worker_version > 1000){
	console.error("\n\n\nSERVICE WORKER VERSION TYPO!\n\n\n");
}
else{
	var cacheName = 'v' + service_worker_version; 
	var previousCacheName ='v' + (service_worker_version - 1); 
	var update_available = false;
	var pre_cache_done = true;


	let coepCredentialless = false;

	self.addEventListener("install", (event) => {
		console.log('service worker: installed.  service_worker_version,cacheName: ', service_worker_version, cacheName);
		//previousCacheName = cacheName;
	
		
		const preCache = async () => {
			console.log("service worker: in preCache.  Going to fill cache:  v" + service_worker_version);
			//self.old_cache_urls = ['https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0/dist/ort-wasm-simd-threaded.jsep.wasm'];
		
			try{
				
				let cache_names = await caches.keys();
			    for (let old_cache_name of cache_names){
					console.log("service_worker: spotted old cache called: ",  old_cache_name);
			    	for(let v = 1; v < service_worker_version; v++){
			    		if(old_cache_name == 'v' + v){
							console.log("service worker: looping over files in old cache: ",  old_cache_name);
							let old_cache = await caches.open(old_cache_name);
							//console.log("service_worker: old_cache: ", old_cache_name);
							if(old_cache){
								let items = await old_cache.keys();
								//console.log("service_worker:  old_cache, keys: ", old_cache_name, items);
						    	items.map(item => {
									if(item && typeof item.url == 'string'){
										if( (item.url.startsWith('https://papeg') || item.url.startsWith('https://www.papeg')) && old_cache_urls.indexOf(item.url) == -1 && item.url.indexOf('updater.js') == -1 && item.url.indexOf('counter.php') == -1 && item.url.indexOf('/cors_fetch') == -1){ // && item.url.indexOf('coi-serviceworker.js') == -1 // not necessary
											const item_url = item.url.replace('https://papeg.ai/','').replace('https://papegai.eu/','');
											//console.log("typeof item_url: ", typeof item_url, item_url);
											console.log("service_worker: adding url from old cache to pre-caching list for new cache: ", service_worker_version, "\n", item.url, "\n", item_url);
											old_cache_urls.push(item.url);
											old_cache_urls.push(item_url);
										}
									}
						    	});
							}
			    		}
			    	}
			    }
			
				if(old_cache_urls.length){
					//console.log("service worker: final list of old_cache_urls: ", service_worker_version, cacheName, old_cache_urls.length);
					const pre_cache = await caches.open(cacheName);
					//console.log("service worker: pre-caching URL's in: ", cacheName);
					const before_cache_time = Date.now();
					//await cache.addAll(old_cache_urls);
				
					// one by one, we're not in a rush
					for(let u = 0; u < old_cache_urls.length; u++){
						console.log("pre-loading into cache: ", service_worker_version, " (#" + u + "/" + old_cache_urls.length + ") ", old_cache_urls[u]);
						try{
							
							let pre_cache_response = await fetch(old_cache_urls[u]); // , { headers }
							await pre_cache.put(old_cache_urls[u], pre_cache_response);
							if(old_cache_urls.length > 1){
								//console.log("service worker: broadcasting progress message to clients");
								send_message_to_client({'pre_cache_progress':(u/(old_cache_urls.length-1))});
							}
							
							//await cache.add(old_cache_urls[u]);
						}
						catch(err){
							console.error("service worker: caught error trying to pre-cache file: ", service_worker_version, old_cache_urls[u], err);
						}
					
					}			
				
					console.log("service worker: pre-caching URL's should now be complete. It took: ", service_worker_version, (Date.now() - before_cache_time));
					//console.log("pre-cached URL's: ", service_worker_version, await pre_cache.keys());
				
					send_message_to_client({'pre_cache_done':true});
				
					return true
				}
				else{
					//console.warn("service worker: old_cache_urls.length was zero. No old cache?");
					return true
				}
			
			}
			catch(err){
				console.error("service worker: caught error trying to open the previous cache: ", err);
			}
		
		};
	
		pre_cache_done = false;
		event.waitUntil(preCache());
		console.log("service_worker: pre-cache for new version is done", service_worker_version);
		pre_cache_done = true;
		//event.waitUntil(caches.open(cacheName));
	
		//self.skipWaiting();
	
	});


	self.addEventListener("activate", async (event) => {
		console.log("service worker: in ACTIVATE.  service_worker_version: ", service_worker_version);
		//console.log("service worker: in ACTIVATE. doing clients.claim. old and current cacheName: ", previousCacheName, cacheName);
		//console.log("service worker: activate: self.clients before: ", self.clients);
	
		console.log("service worker: in ACTIVATE. Just to check: was pre_cache_done?: ", pre_cache_done);
	
		let found_old_cache = false;
		cache_names = await caches.keys();
	    for (let cache_name of cache_names){
			console.log("service worker: ACTIVATE: spotted cache called: ", service_worker_version, cache_name);
	    	for(let v = 0; v < service_worker_version; v++){
	    		if(cache_name == 'v' + v){
					console.log("service worker: ACTIVATE: deleting outdated cache: ", service_worker_version, cache_name);
					found_old_cache = true;
	    			await caches.delete(cache_name);
	    		}
	    	}
	    }
	
		console.log("service worker: in ACTIVATE: claiming clients and telling them to reload");
		self.clients.claim()
		.then(() => {
			return self.clients.matchAll();
		})
	    .then(clients => {
			console.log("service worker: ACTIVATE: clients ", service_worker_version, clients);
	        clients.forEach((client) => {
				console.log("service worker: potentially telling client to reload: client, client.url: ", client, client.url);
				let client_url = client.url;
				if(client_url.indexOf('cors_fetch') != -1){
					client_url = client_url.substr(0, (client_url.indexOf('cors_fetch') - 1));
					console.error("service worker: client.url has cors_fetch substring. Removed it: ", client_url);
				}
				if(found_old_cache || self.client_version != null){
					client.navigate(client_url);
				}
				else{
					console.warn("service worker: not telling client to reload the page.  found_old_cache,self.client_version: ", found_old_cache, self.client_version);
				}
	        	
	        });
	    });
	
		//event.waitUntil(
		
			/*
			caches.keys()
			.then( async (names) => {
			    for (let my_cache_name of names){
					//console.log("service_worker: spotted cache called: ", my_cache_name);
					//let caches_to_delete = [];
				
					//return true
			    }
			})
			.then(() => {
				//console.log("service worker: activate: old caches should now be deleted");
				return caches.delete('transformers-cache')
			})
		
			*/
			/*
			caches.delete('transformers-cache')
			.then((value) => {
				//console.log("service_worker: activate: transformers-cache should now also be cleared");
			
				self.clients.claim();
				//console.log("service worker: activate: self.clients: ", self.clients);
				return true
			})
			.catch((err) => {
				console.error("service worker: caught error during activate: ", err);
			})
			*/
		
		//)
		
		
	
	});


	self.addEventListener("message", (ev) => {
		//console.log("service worker: received message. ev: ", ev, ev.data, ev.data.type);
	
		if (!ev.data) {
	        return;
		
	    } else if (ev.data.type === "deregister") {
	    	console.warn("service_worker received deregister command. self.clients: ", service_worker_version, self.clients);
		
	    	self.registration
	        .unregister()
	        .then(() => {
	            return self.clients.matchAll();
	        })
	        .then(clients => {
	            clients.forEach((client) => client.navigate(client.url));
	        });
		
	    }
	
		else if (ev.data.type == "get_version_number") {
			if(typeof ev.data.version != 'undefined'){
				self.client_version = ev.data.version;
			}
			self.clients.matchAll().then((matches) => {
				//console.log("service worker: number of clients: ", matches.length);
				if(ev.ports && ev.ports.length){
					ev.ports[0].postMessage({'version_number':service_worker_version, 'client_count':matches.length});
				}
			})
		}
	
	  	else if (ev.data.type == 'show_notification') {
	  		//console.warn("service worker: received show_notification command");
			if(typeof ev.data.title == 'string' && ev.data.options != 'undefined' && self.registration && typeof self.registration.showNotification != 'undefined'){
				if(ev.data.options == null){
					ev.data.options = {}
				}
				if(typeof ev.data.options.icon == 'undefined' && typeof ev.data.options.image == 'undefined'){
					ev.data.options['icon'] = 'images/papegai_logo.png';
				}
			
				show_notification(ev.data.title,ev.data.options);
			}
	  	}
	
	
		else if (ev.data.type == 'clear_cache') {
			console.warn("service worker: received clear_cache command (blocked)", service_worker_version);
			/*
			caches.delete(cacheName)
			.then((value) => {
				console.warn("service_worker: received clear cache: cache should now be cleared: ", cacheName);
			})
			.catch((err) => {
				console.error("service_worker: received clear cache: caught error clearing cache: ", cacheName, err);
			})
			*/
		}
	
		else if (ev.data.type == 'skip_waiting') {
			console.log("SERVICE WORKER: RECEIVED skip_waiting.  version,pre_cache_done:", service_worker_version, pre_cache_done);
			if(pre_cache_done){
				self.skipWaiting();
			}
			else{
				console.error("SERVICE WORKER: received skip_waiting command, but pre_cache_done was still false");
			}
		
		}
	
		else if (ev.data.type == 'update') {
			console.log("SERVICE WORKER: RECEIVED UPDATE MESSAGE (skip_waiting)", service_worker_version);
			/*
			caches.delete('transformers-cache')
			.then((value) => {
				//console.log("service_worker: transformers-cache should now be cleared. calling self.skipWaiting");
				self.skipWaiting();
				//self.clients.claim();
			})
			.catch((err) => {
				console.error("service_worker: received clear cache: caught error clearing transformers-cache: ", err);
			})
			*/
		
			self.skipWaiting();
		}
	
	});



	function show_notification(title=null,options={}){
		//console.log("service_worker: in show_notification.  title,options: ", title, options);
	
		if(typeof title == 'string' && options != null && self.registration && typeof self.registration.showNotification != 'undefined'){
		
			self.registration.showNotification(
			    title,
			    options
			).catch((error) => {
			    console.log("service worker: received show_notification caught error: ", error);
			});
		}
	
	}









	self.addEventListener("fetch", function (event) {
		//console.warn("");
	    const r = event.request;
	
	    if (r.cache === "only-if-cached" && r.mode !== "same-origin") {
			console.error("isolating service worker: blocking fetch request: ", r);
	        return;
	    }
	
		//console.log("service worker:  handling request, r.url: ", r.url);
		//console.log("coepCredentialless: ", coepCredentialless);
		//console.log("service worker:  r.mode: ", r.mode);
		/*
		if(r.cache != 'default' && r.cache != 'reload'){
			console.error("service worker:  non-default r.cache: ", r.cache, r.url);
		}
		*/
	
		let request;
		if(coepCredentialless && r.mode === "no-cors"){
			console.warn("service_worker: request has no-cors mode: ", r.url);
			request = new Request(r, {
				            credentials: "omit",
				        })
		}
		else{
			//console.warn("service_worker: using r as request directly: ", r.url);
			request = r;
		}
		/*
	    const request = (coepCredentialless && r.mode === "no-cors")
	        ? new Request(r, {
	            credentials: "omit",
	        })
	        : r;
		*/
		//const request = event.request;
	
		const error_html = '<html><head><title>Papeg.ai error</title></head><body><h1>🦜 Whoops, an error occured</h1><p>You will need to connect to the internet and reload this page to fix this.</p></body><html>';
		const error_response_options = { status: 503, statusText: "Service worker error" };
		const error_response = new Response(error_html, error_response_options);
	
		const empty_html = '';
		const empty_response_options = { status: 503, statusText: "Service worker error" };
		const empty_response = new Response(empty_html, empty_response_options);
	
	
	
		function do_reponse(event,request) {
			//console.log("service worker: in do_response.  request.url: ", service_worker_version, request.url); // .replace('https://papegai.eu','')
		
			return new Promise((resolve, reject) => {
			
				if(request.url.indexOf('index.html?') != -1){
					request.url = request.url.substr(0,request.url.indexOf('?'));
					//console.log("service_worker: do_response: remove part after index.html question mark?: ", service_worker_version, request.url);
				}
				else if(request.url.indexOf('/?') != -1){
					request.url = request.url.substr(0,request.url.indexOf('/?') + 1);
					//console.log("service_worker: do_response: remove part after /? question mark?: ", service_worker_version, request.url);
				}
			
				
				/*
				// TODO create an options object?
				const options = {
				        ignoreVary: true, // ignore differences in Headers
				        ignoreMethod: true, // ignore differences in HTTP methods
				        ignoreSearch: true // ignore differences in query strings
				    }

				// then we pass it in here
				const response = await newCache.match(request, options);
				*/
				
				caches.match(request.url)
				.then(function(response) {

					if (response) {
						//console.log('Response found in cache, no need to fetch. returning from cache: ', service_worker_version, request.url);
						//event.respondWith(response);
						resolve(response);
						return
					} 
					else {
						if(typeof request != 'undefined' && request != null &&  typeof request.url == 'string'){
							//console.warn('coi service worker: no response found in cache. Fetching...', service_worker_version, request.url, request);
		
							fetch(request)
			                .then((fetch_response) => {
								//let fetch_response_clone = null;
								if(typeof fetch_response != 'undefined'){
								
									//console.log("service worker: was not in cache. fetch_response.status: ", service_worker_version, fetch_response.status, request.url);
								
								
									//console.log('coi service worker: fetch_response was not undefined. fetch_response_clone: ', fetch_response_clone);
							
									var fetch_response2 = fetch_response.clone();
									const fetch_status = fetch_response2.status;
									
				                    if (fetch_status === 0) {
										console.warn("service worker: fetch status was 0 for: ", service_worker_version, request.url);
										
										//const fetch_response_clone = fetch_response.clone();
										//caches.open(cacheName).then((my_cache) => my_cache.put(request.url, fetch_response.clone())); //.add(request));
										resolve(fetch_response); // should this be reject?
										return
				                    }
									else{
									
									
										//console.log("service worker: fetch_response status was not 0. returning crafted fetch_response");
					                    /*
										const newHeaders = new Headers(fetch_response.headers);
					                    newHeaders.set("Cross-Origin-Embedder-Policy",
					                        coepCredentialless ? "credentialless" : "require-corp"
					                    );
					                    if (!coepCredentialless) {
					                        newHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");
					                    }
					                    newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
										//console.log("service worker: newHeaders: ", newHeaders);
	
					                    let new_reponse = new Response(fetch_response.body, {
					                        status: fetch_response.status,
					                        statusText: fetch_response.statusText,
					                        headers: newHeaders,
					                    });
		
										//var new_reponse2 = new_reponse.clone();
										*/
			
									
										if(
											fetch_status === 200 
											&& request.url.match("^(http|https)://") 
											&& (
												(request.url.indexOf('papeg.ai/') != -1 && request.url.indexOf('papeg.ai/?') == -1 && request.url.indexOf('papeg.ai/http') == -1) // cache papeg.ai files, but not if there is a gguf file in the url
												|| 
												(request.url.indexOf('papegai.eu/') != -1 && request.url.indexOf('papegai.eu/?') == -1 && request.url.indexOf('papegai.eu/http') == -1 ) // same, but for papegai.eu, the beta site.
												|| 
												request.url.indexOf('https://cdn.jsdelivr.net/npm/@huggingface/transformers') != -1 // cache all requests for Transformers.js because it doesn't handle this itself yet
												||
												request.url.indexOf('https://huggingface.co/datasets/Xenova') != -1 // while we're at it, cache tts voice files too
											
											)
											&& request.url.indexOf('/updater.js?') == -1 
											&& request.url.indexOf('/counter.php') == -1
											&& request.url.indexOf('/cors_fetch') == -1
										){
											//console.log("service worker: fetch_response had 200 status, will attempt to cache: ", service_worker_version, request.url);
										
											//const fetch_response_clone = new_reponse.clone(); //fetch_response.clone();
											const fetch_response_clone = fetch_response.clone();
										
											let target_cache = cacheName;
											if(request.url.indexOf('transformers.min.js') != -1){
												//console.log("service_worker: saving to transformers-cache: ", request.url);
												target_cache = 'transformers-cache';
											}
											/*
											if(request.url.indexOf('https://cdn.jsdelivr.net/npm/@huggingface/transformers') != -1){
												//console.log("service_worker: saving to transformers-cache: ", request.url);
												target_cache = 'transformers-cache';
											}
											*/
											caches.open(target_cache)
											.then(function(cache) {
												cache.put(request.url, fetch_response_clone);
												//console.log("put in cache: ", service_worker_version, target_cache, request.url, fetch_response_clone);
											})
											.catch((err) => {
												console.error("service worker: caught error adding to cache: ", service_worker_version, err);
											})
										
										}
		
										else{
											console.warn("service worker: not caching: ", service_worker_version, fetch_status, request.url);
											//resolve(fetch_response);
										}
		
										//resolve(new_reponse);
										resolve(fetch_response);
										return
									}
							
								}
								else{
									console.error("service worker: fetch had no reponse?", service_worker_version);
									if(r.url.endsWith('.html')){
										resolve(error_response);
									}
									else{
										resolve(empty_response);
									}
								}
	
							
	
			                })
			                .catch((err) => {
			                	console.error(" service worker: caught error wrangling cache: ", service_worker_version, err, request.url);
								console.error(" ## service worker: sending download failed error to client. event: ", event);
								send_message_to_client({'download_failed':r.url});
								
								if(r.url.endsWith('.html')){
									resolve(error_response);
								}
								else{
									resolve(empty_response);
								}
			                })
		
		
						}
						else{
							console.error("service worker: request was invalid?!", service_worker_version);
		
							if(r.url.endsWith('.html')){
								resolve(error_response);
							}
							else{
								resolve(empty_response);
							}
						}
	

				    }
				})
	            .catch((err) => {
	            	console.error("service worker: caught error matching cache: ", service_worker_version, err);
					if(r.url.endsWith('.html')){
						resolve(error_response);
					}
					else{
						resolve(empty_response);
					}

					return
	            })
		
			})
	
		}
	
	
	
	
		//
		// The code below calls do_reponse (above) when needed
		//
		if(
			(event.request.url.indexOf('huggingface.co/') != -1 && event.request.url.indexOf('https://huggingface.co/datasets/Xenova') == -1) // let everything to huggingface pass through without caching it (as this could cause double caching), except for the TTS voice files.
			|| event.request.url.indexOf('hf.co/') != -1 
			|| event.request.url.indexOf('githubusercontent.com/') != -1 
			|| event.request.url.indexOf('github.com/') != -1 
			|| (event.request.url.indexOf('jsdelivr.net/') != -1 && event.request.url.indexOf('jsdelivr.net/npm/@huggingface/transformers') == -1)
		){
			//console.log("service_worker: passing huggingface et al straight through: ", service_worker_version, event.request.url);
			event.respondWith(fetch(event.request));
		}
		else if(event.request.url.indexOf('https://huggingface.co/datasets/Xenova') != -1){
			//console.log("service_worker: might be caching huggingface tts voice file: ", service_worker_version, event.request.url);
			//event.respondWith(fetch(event.request));
			event.respondWith(do_reponse(event,request));
		}
		else if(event.request.url.indexOf('jsdelivr.net/npm/@huggingface/transformers') != -1){
			//console.log("service_worker: might be caching jsdelivir related to transformers.js: ", service_worker_version, event.request.url);
			//event.respondWith(fetch(event.request));
			event.respondWith(do_reponse(event,request));
		}
		else if(
			event.request.mode !== "navigate" 
			|| event.request.method !== "GET" 
			|| registration.waiting == null
		)
		{
			//console.log("service_worker: normal", service_worker_version);
			event.respondWith(do_reponse(event,request));
		
		}
		else{
			console.error("service_worker: special case (likely navigation mode).  event.request.mode, event.request.method, registration.waiting: ", event.request.mode, event.request.method, (registration.waiting != null));
		
			self.clients.matchAll().then((matches) => {
				console.log("service worker: clients: matches.length: ", service_worker_version, matches.length);
				if(matches.length < 2 && registration.waiting != null){
					console.error("service worker: navigate mode request, and a service worker is waiting, and only one client, so updating now");
					registration.waiting.postMessage({'type':'update'});
					//event.respondWith(new Response("", {headers: {"Refresh": "0"}}));
					
					async function handleRequest(request) {
						const response = await fetch(request);
						return response
					}
					
					
					event.respondWith(handleRequest(event.request));
				}
			
				else{
					//console.log("service worker: special case: more than one client. doing fetch", service_worker_version);
					//event.respondWith(fetch(event.request));
					event.respondWith(do_reponse(event,request));
				}
			
				//event.respondWith(do_reponse(event,request));
			})
			.catch((err) => {
				console.error("service worker: caught error in special case fetch: ", service_worker_version, err);
				if(event.request && event.request.url && event.request.url.endsWith('.html')){
					event.respondWith(error_response);
				}
				else{
					event.respondWith(empty_response);
				}
			
			})
		}
	
	});
}



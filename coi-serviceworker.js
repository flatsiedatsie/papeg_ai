/*! coi-serviceworker v0.1.7 - Guido Zuidhof and contributors, licensed under MIT */

var service_worker_version = 234;

var previousCacheName = null; 
var cacheName = 'v' + service_worker_version; 




// Default files to always cache
var cacheFiles = [];
/*
const addResourcesToCache = async (resources) => {
	//console.log("service worker: in addResourcesToCache");
	const cache = await caches.open(cacheName);
	await cache.addAll(resources);
};
*/
let coepCredentialless = false;
if (typeof window === 'undefined') {
	
	const enableNavigationPreload = async () => {
		if (self.registration.navigationPreload) {
			console.error("service worker: enabling preload");
			await self.registration.navigationPreload.enable();
		}
	};
	
    self.addEventListener("install", (event) => {
		//console.log('service worker: installed. cacheName: ', cacheName);
		previousCacheName = cacheName;
		
		event.waitUntil(caches.open(cacheName));
		
		self.skipWaiting();
		
    });
	
	
    self.addEventListener("activate", (event) => {
		console.log("service worker: in ACTIVATE. doing clients.claim. old and current cacheName: ", previousCacheName, cacheName);
		//console.log("service worker: activate: self.clients before: ", self.clients);
		
		event.waitUntil(
			
			caches.keys()
			.then(function(names) {
			    for (let my_cache_name of names){
					//console.log("service_worker: spotted cache called: ", my_cache_name);
			    	for(let v = 0; v < service_worker_version; v++){
			    		if(my_cache_name == 'v' + v){
							//console.log("service_worker: activate: deleting outdated cache: ", my_cache_name);
			    			caches.delete(my_cache_name);
			    		}
			    	}
			    }
			})
			.then(() => {
				self.clients.claim();
				//console.log("service worker: activate: self.clients: ", self.clients);
			})
			.catch((err) => {
				console.error("service worker: caught error during activate: ", err);
			})
			
		)
		
    });
	

    self.addEventListener("message", (ev) => {
		//console.log("service worker: received message. ev: ", ev, ev.data, ev.data.type);
		
		if (!ev.data) {
            return;
			
        } else if (ev.data.type === "deregister") {
        	console.warn("service_worker received deregister command. self.clients: ", self.clients);
			
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
		
			if(ev.ports && ev.ports.length){
				ev.ports[0].postMessage({'version_number': service_worker_version});
			}
		}
		
		
		
		else if (ev.data.type == "list_cache") {
			//console.log("service_worker: received message: list_cache.  previousCacheName,cacheName: ", previousCacheName, cacheName);
			
        	caches.keys()
			.then((cacheNames) =>
		
	 	 		cacheNames.map(cacheName => {
	    			//console.warn("service_worker: received list_cache:  opening cacheName: ", cacheName);
			
					caches.open(cacheName)
					.then(cache => {
					
						cache.keys()
						.then(items => {
				  		  items.map(item => {
								//console.log("service_worker: list_cache:  " + cacheName + " - item - ", item.url , item);
				    		})
				  	  	})
						.catch((err) => {
							console.error("service_worker: received list_cache: caught error opening a cached url item: ", err);
						})
					
					})
					.catch((err) => {
						console.error("service_worker: received list_cache: caught error opening a cache: ", err);
					})
	  			})
		
        	)
        
		}
		
		else if (ev.data.type == 'clear_cache') {
			
			caches.delete(cacheName)
			.then((value) => {
				//console.log("service_worker: received clear cache: cache should now be cleared: ", cacheName);
			})
			.catch((err) => {
				console.error("service_worker: received clear cache: caught error clearing cache: ", cacheName, err);
			})

		}
		
    });


    self.addEventListener("fetch", function (event) {
        const r = event.request;
        if (r.cache === "only-if-cached" && r.mode !== "same-origin") {
			console.log("isolating service worker: blocking fetch request: ", r);
            return;
        }
		
		//console.log("serviceworker:  handling request r: ", r.url,"\n",r);
		
        const request = (coepCredentialless && r.mode === "no-cors")
            ? new Request(r, {
                credentials: "omit",
            })
            : r;
			
			
		const error_html = '<html><head><title>Papegai error</title></head><body><h1>🦜 Whoops, an error occured</h1><p>You will need to connect to the internet and reload this page to fix this.</p></body><html>';
		const error_response_options = { status: 503, statusText: "Service worker error" };
		const error_response = new Response(error_html, error_response_options);
		
		const empty_html = '';
		const empty_response_options = { status: 503, statusText: "Service worker error" };
		const empty_response = new Response(empty_html, empty_response_options);
		
		
		if(r.url == 'https://papeg.ai/indexXXX,html'){
			//console.log("coi service worker: call for index.html. Doing things a little bit differently.");
			
			
			
			event.respondWith(
				new Promise((resolve, reject) => {
					fetch(r)
		            .then((response) => {
						let response_clone = null;
						if(typeof response != 'undefined'){
							//console.log("coi service worker: got response");
							//var response2 = response.clone();
			                if (response.status === 200) {
								//console.log("coi service worker: fetching latest update of index.html from web succeeded");
			                	resolve(response);
			                }
							else{
								//console.log("coi service worker: will attempt to get index.html from cache because fetching index.html from the web returned a non-200 response: ", response.status);
								caches.match(request).then(function(response) {
					
									if (response) {
										//console.log('Luckily, response for index.html was found in cache. Returning from cache: ', response);
										//event.respondWith(response);
										resolve(response);
										//return
									} 
									else{
										console.error('failed to fetch index.html, and it was not in the cache either. Rejecting.');
										
										resolve(error_response);
										//reject(response);
									}
								})
								.catch(() => {
									console.error("coi service worker: caught searching cache for index.html");
									resolve(error_response);
									//reject(response);
								});
			                }
						}
					})
					.catch(() => {
						console.error("coi service worker: caught error fetching index.html");
						reject(response);
					})
				
				})
			
			)
		
		}
		else{
			event.respondWith(
				new Promise((resolve, reject) => {
					
					caches.match(request)
					.then(function(response) {
					
						if (response) {
							//console.log('Response found in cache, no need to fetch. returning from cache: ', response);
							//event.respondWith(response);
							resolve(response);
							//return
						} 
						else {
							if(typeof request != 'undefined' && request != null &&  typeof request.url == 'string'){
								//console.warn('coi service worker: no response found in cache. Fetching...', request.url);
								
								fetch(request)
				                .then((response) => {
									let response_clone = null;
									if(typeof response != 'undefined'){
								
										response_clone = response.clone();
										//console.log('coi service worker: response was not undefined. response_clone: ', response_clone);
									}
							
									//var response2 = response.clone();
				                    if (response.status === 0) {
										//console.log("service worker: good fetch, status was 0. Adding to cache: ", request);
										//caches.open(cacheName).then((my_cache) => my_cache.add(request));
										resolve(response); // should this be reject?
										
				                    }
									else{
										//console.log("service worker: response status was not 0. returning crafted response");
					                    const newHeaders = new Headers(response.headers);
					                    newHeaders.set("Cross-Origin-Embedder-Policy",
					                        coepCredentialless ? "credentialless" : "require-corp"
					                    );
					                    if (!coepCredentialless) {
					                        newHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");
					                    }
					                    newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
										//console.log("coi service worker: newHeaders: ", newHeaders);
							
					                    let new_reponse = new Response(response.body, {
					                        status: response.status,
					                        statusText: response.statusText,
					                        headers: newHeaders,
					                    });
								
										//var new_reponse2 = new_reponse.clone();
									
										if(response.status === 200 && response_clone != null){
											//console.log("coi service worker: response clone was not null, will attempt to cache it.");
										
											caches.open(cacheName)
											.then(function(cache) {
											
												if(request.url.match("^(http|https)://")){
													if(request.url.indexOf('papeg.ai/') != -1 && request.url.indexOf('/updater.js?') == -1){
														//console.log("COI service worker: adding 200 response to cache.  request.url: ", request.url);
														cache.put(request, response_clone);
													}
													
													//https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0-alpha.14/dist/ort-wasm-simd-threaded.jsep.wasm
													else if(request.url.indexOf('https://cdn.jsdelivr.net/npm/@huggingface/transformers') != -1){
														console.log("COI service worker: adding 200 JSDELIVR response to cache.  request.url, response_clone: ", request.url);
														cache.put(request, response_clone);
													}
													
													else{
														console.log("COI service worker: purposefully not caching: ", request.url);
													}
												}
												else{
													console.error("service worker: could not cache url that doesn't start with http(s): ", request.url);
												}
												//cache.add(request);
												//return response;
												//resolve(new_reponse);
										
											})
											.then(() => {
												//console.log("coi service worker: cache done");
												//resolve(new_reponse);
											})
											.catch((err) => {
												console.error("coi service worker: caught error caching: ", err);
											})
										}
								
										else{
											//console.log("service worker: NOT good fetch.  status, response.status, new_response: ", response.status, new_reponse);
											//resolve(new_reponse);
										}
								
										resolve(new_reponse);
								
									}
							
				                })
				                .catch((err) => {
				                	console.error("COI service worker: caught error wrangling cache: ", err);
									if(r.url.endsWith('.html')){
										resolve(error_response);
									}
									else{
										resolve(empty_response);
									}
									//return
				                })
								
								
								
								
							}else{
								console.error("coi service worker: request was invalid");
								
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
	                	console.error("COI service worker: caught error matching cache: ", err);
						if(r.url.endsWith('.html')){
							resolve(error_response);
						}
						else{
							resolve(empty_response);
						}
						
						//return
	                })
				
				})
		    )
		}
    });

} else {
    (() => {
		//console.log("Hello from service worker loader. window.crossOriginIsolated: ", window.crossOriginIsolated);
		//console.log("window.document.currentScript.src: ", window.document.currentScript.src);
		
        const reloadedBySelf = window.sessionStorage.getItem("coiReloadedBySelf");
		//console.log("session worker: reloadedBySelf from session storage: ", reloadedBySelf);
		
		if(window.crossOriginIsolated && reloadedBySelf == null){
			//console.log("no need for coi-serviceworker. Loading alternative service worker.");
			//window.add_script('./service_worker.js',true);
		}
		
        window.sessionStorage.removeItem("coiReloadedBySelf");
        const coepDegrading = (reloadedBySelf == "coepdegrade");

        // You can customize the behavior of this script through a global `coi` variable.
        const coi = {
            shouldRegister: () => !reloadedBySelf,
            shouldDeregister: () => false,
            coepCredentialless: () => true,
            coepDegrade: () => true,
            doReload: () => window.location.reload(),
            quiet: false,
            ...window.coi
        };

        const n = navigator;
        const controlling = n.serviceWorker && n.serviceWorker.controller;

        // Record the failure if the page is served by serviceWorker.
        if (controlling && !window.crossOriginIsolated) {
			console.error("service worker failed to create cross origin isolation");
            window.sessionStorage.setItem("coiCoepHasFailed", "true");
        }
		else if (controlling && window.crossOriginIsolated) {
			console.warn("OK, COI service worker managed to create cross origin isolation");
		}
        const coepHasFailed = window.sessionStorage.getItem("coiCoepHasFailed");
		//console.log("service worker: coepHasFailed?: ", coepHasFailed);

        if (controlling) {
			//console.log("service worker; controlling");
            // Reload only on the first failure.
            const reloadToDegrade = coi.coepDegrade() && !(
                coepDegrading || window.crossOriginIsolated
            );
            n.serviceWorker.controller.postMessage({
                type: "coepCredentialless",
                value: (reloadToDegrade || coepHasFailed && coi.coepDegrade())
                    ? false
                    : coi.coepCredentialless(),
            });
            if (reloadToDegrade) {
				//console.log("Service worker: Reloading page to degrade COEP.");
                !coi.quiet && console.log("Reloading page to degrade COEP.");
                window.sessionStorage.setItem("coiReloadedBySelf", "coepdegrade");
                coi.doReload("coepdegrade");
            }

            if (coi.shouldDeregister()) {
                n.serviceWorker.controller.postMessage({ type: "deregister" });
            }
        }
		else{
			console.log("service worker; NOT controlling");
		}

        // If we're already coi: do nothing. Perhaps it's due to this script doing its job, or COOP/COEP are
        // already set from the origin server. Also if the browser has no notion of crossOriginIsolated, just give up here.
        if (window.crossOriginIsolated !== false || !coi.shouldRegister()) {
        	console.log("service worker: the site is cross origin isolated. Perhaps because of this script");
			return
        };

        if (!window.isSecureContext) {
            !coi.quiet && console.log("COOP/COEP Service Worker not registered, a secure context is required.");
            return;
        }

        // In some environments (e.g. Firefox private mode) this won't be available
        if (!n.serviceWorker) {
			console.error("COOP/COEP Service Worker not registered, perhaps due to private mode.");
            !coi.quiet && console.error("COOP/COEP Service Worker not registered, perhaps due to private mode.");
            return;
        }
		
        n.serviceWorker.register(window.document.currentScript.src).then(
            (registration) => {
                !coi.quiet && console.log("COOP/COEP Service Worker registered", registration.scope);

                registration.addEventListener("updatefound", () => {
                    !coi.quiet && console.log("Reloading page to make use of updated COOP/COEP Service Worker.");
                    window.sessionStorage.setItem("coiReloadedBySelf", "updatefound");
                    coi.doReload();
                });

                // If the registration is active, but it's not controlling the page
                if (registration.active && !n.serviceWorker.controller) {
                    !coi.quiet && console.log("Reloading page to make use of COOP/COEP Service Worker.");
                    window.sessionStorage.setItem("coiReloadedBySelf", "notcontrolling");
                    coi.doReload();
                }
            },
            (err) => {
                !coi.quiet && console.error("COOP/COEP Service Worker failed to register:", err);
            }
        );
		
    })();
}

//console.log("Hello from last script");

if(window.settings.settings_complexity == 'developer'){
	setTimeout(() => {
		navigator.serviceWorker.getRegistrations().then(function(registrations) {
			registrations.forEach(function(v) {
				console.log('last script: list service worker: ' + v);
			});
		});
	},10000);
}

if(typeof window.ios_device != 'undefined'){
	//document.body.classList.add('device-too-old');
	document.getElementById('device-too-old-warning-container').style.display = 'flex';
}


let konami_cursor = 0;
const KONAMI_CODE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
document.addEventListener('keydown', (e) => {
  konami_cursor = (e.keyCode == KONAMI_CODE[konami_cursor]) ? konami_cursor + 1 : 0;
  if (konami_cursor == KONAMI_CODE.length) activate_konami();
});

function activate_konami(){
	console.warn("\n\n\n\n\n\n\n\n\n\n\n⬆⬆⬇⬇⬅➡⬅➡🅱🅰\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
	play_sound_effect('funkycats_dot_nl');
} 


/*
caches.open('transformers-cache')
.then((cache) => {
	cache.add('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0-alpha.14/dist/ort-wasm-simd-threaded.jsep.wasm');
	//console.log("added Transformers.js WASM to cache");
})
.catch((err) => {
	console.error('failed to cache Transformers.js WASM file: ', err);
})
*/










/*
var scripts = document.getElementsByTagName('script');
var css_files = document.getElementsByTagName('link');
console.log("LIST OF STYLES: css_files elements: ", css_files);

console.log("LIST OF SCRIPTS");

for(var i=0;i<scripts.length;i++){
	console.log(scripts[i].src);
}

console.log("LIST OF STYLES");

for(var j=0;j < css_files.length;j++){
	console.log(css_files[j].href);
}
*/




function save_timers(){
	//console.log("saving settings: ", JSON.stringify(window.settings,null,4));
	//console.log("saving timers: ", window.timers);
	localStorage.setItem("timers", JSON.stringify(window.timers));
}
window.save_timers = save_timers;

if(typeof window.url_parameter_functionality == 'string' && typeof window.functionality[window.url_parameter_functionality] != 'undefined'){
	console.log("a functionality shortcut was present in de URL:  ", window.url_parameter_functionality);
	window.do_functionality(window.functionality[url_parameter_functionality]);
}


if(typeof window.url_parameter_functionality == 'string' &&  window.url_parameter_functionality.length > 2){
	console.log("last.js: a functionality shortcut was present in de URL:  ", window.url_parameter_functionality);
	window.do_functionality(url_parameter_functionality);
}



/*
// Currently not used
function do_jsonp(api_url='',callback_name='wikipediaCallback'){
	//console.log("in do_jsonp. api_url: ", api_url);
	//return new Promise((resolve, reject) => {
		
	return new Promise((resolve, reject) => {
		
		window.deferreds.push({resolve: resolve, reject: reject});
		
		//window.jsonp_resolve = resolve;
		//window.jsonp_reject = reject;
		
		//console.log("in do_jsonp. api_url,callback_name: ", api_url, callback_name);
		if(typeof api_url == 'string' && api_url.startsWith('http') && typeof callback_name == 'string' && callback_name.length > 4){
			try{
				let script_el = document.createElement('script');
			    //script_el.type = 'text/javascript';
			    script_el.src = api_url + '&callback=' + callback_name;
				script_el.setAttribute('crossOrigin','anonymous');
			    document.body.appendChild(script_el);
			    document.body.removeChild(script_el);
			}
			catch(err){
				console.error("error appendig jsonp: ", err);
				reject(null);
			}
			  
		}
		else{
			console.error("do_jsonp: invalid api_url, or callback_name too short. Rejecting with null.");
			reject(null);
		}
	})
	//console.log("window.jsonp_promise: ", window.jsonp_promise);
	//return window.jsonp_promise;
}

function wikipediaCallback(result){
	//console.log("wikipediaCallback got jsonp result: ", result);
	
	if(typeof result != 'undefined'){
		if(window.deferreds.length){
			window.deferreds[0].resolve(result); // resolve the promise with "Hello"
			window.deferreds.splice(0,1);
		}
		else{
			console.error("wikipediaCallback: window.deferreds was unexpectedly empty");
		}
	}
	else{
		console.error("wikipediaCallback: result was undefined");
		if(window.deferreds.length){
			window.deferreds[0].reject(null); // resolve the promise with "Hello"
			window.deferreds.splice(0,1);
		}
		else{
			console.error("wikipediaCallback: window.deferreds was unexpectedly empty");
		}
	}
	
}
*/

async function preload_some_scripts(){
	if(window.coder_script_loaded == false){
		await window.add_script('./p_coder.js'); 
	}
	if(window.language_detector_loaded == false){
		await add_script('./js/eld.M60.min.js')
	}	
}

// Probably better to let the service worker handle this? Then it can call that same function before telling the user an update is available, to preload the update
// Maybe also check if a service worker is even running?
if(window.first_run == false && window.add_script){
	setTimeout(() => {
		console.log("last.js: a minute has passed: maybe pre-load some JS?");
		preload_some_scripts();
		//if(window.settings.settings_complexity != 'normal'){}
		
	},60000);
}
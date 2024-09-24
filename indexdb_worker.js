//importScripts("foo.js", "bar.js"); /* imports two scripts */
//console.log("hello from indexdb ldb worker");
//!function(){var s,c,e="undefined"!=typeof window?window:{},t=e.indexedDB||e.mozIndexedDB||e.webkitIndexedDB||e.msIndexedDB;"undefined"==typeof window||t?((t=t.open("ldb",1)).onsuccess=function(e){s=this.result},t.onerror=function(e){console.error("indexedDB request error"),console.log(e)},t={get:(c={ready:!(t.onupgradeneeded=function(e){s=null,e.target.result.createObjectStore("s",{keyPath:"k"}).transaction.oncomplete=function(e){s=e.target.db}}),get:function(e,t){s?s.transaction("s").objectStore("s").get(e).onsuccess=function(e){e=e.target.result&&e.target.result.v||null;t(e)}:setTimeout(function(){c.get(e,t)},50)},set:function(t,n,o){if(s){let e=s.transaction("s","readwrite");e.oncomplete=function(e){"Function"==={}.toString.call(o).slice(8,-1)&&o()},e.objectStore("s").put({k:t,v:n}),e.commit()}else setTimeout(function(){c.set(t,n,o)},50)},delete:function(e,t){s?s.transaction("s","readwrite").objectStore("s").delete(e).onsuccess=function(e){t&&t()}:setTimeout(function(){c.delete(e,t)},50)},list:function(t){s?s.transaction("s").objectStore("s").getAllKeys().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.list(t)},50)},getAll:function(t){s?s.transaction("s").objectStore("s").getAll().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.getAll(t)},50)},clear:function(t){s?s.transaction("s","readwrite").objectStore("s").clear().onsuccess=function(e){t&&t()}:setTimeout(function(){c.clear(t)},50)}}).get,set:c.set,delete:c.delete,list:c.list,getAll:c.getAll,clear:c.clear},e.ldb=t,"undefined"!=typeof module&&(module.exports=t)):console.error("indexDB not supported")}();

//console.log("indexdb: indexedDB: ", indexedDB);
//console.log("indexdb: webkitIndexedDB: ", webkitIndexedDB);

//!function(){
	//var s,c,e="undefined"!=typeof window?window:{},t=indexedDB||mozIndexedDB|webkitIndexedDB||msIndexedDB;
	var t = null;
	if(typeof indexedDB != 'undefined'){t = indexedDB};
	if(t == null && typeof webkitIndexedDB != 'undefined'){t = webkitIndexedDB};
	if(t == null && typeof mozIndexedDB != 'undefined'){t = mozIndexedDB};
	if(t == null && typeof msIndexedDB != 'undefined'){t = msIndexedDB};
	//if(typeof t != 'object'){t=webkitIndexedDB}
	//if(typeof t != 'object'){t=mozIndexedDB}
	//if(typeof t != 'object'){t=msIndexedDB}
	//= typeof indexedDB == 'object' ? window.indexedDB : webkitIndexedDB;
	var s,c,e= {};//"undefined"!=typeof window?window:{} // , //t=indexedDB||mozIndexedDB|webkitIndexedDB||msIndexedDB;
	var e = self;
	//console.log("s,c,e: ", s,c,e);
	//console.log("indexdb t:", t);
	//console.log("indexdb window:", window);
	//console.log("indexdb e:", e);
	"undefined"==typeof window||t?((t=t.open("ldb",1)).onsuccess=function(e){s=this.result},t.onerror=function(e){console.error("indexedDB request error"),console.log(e)},t={get:(c={ready:!(t.onupgradeneeded=function(e){s=null,e.target.result.createObjectStore("s",{keyPath:"k"}).transaction.oncomplete=function(e){s=e.target.db}}),get:function(e,t){s?s.transaction("s").objectStore("s").get(e).onsuccess=function(e){e=e.target.result&&e.target.result.v||null;t(e)}:setTimeout(function(){c.get(e,t)},50)},set:function(t,n,o){if(s){let e=s.transaction("s","readwrite");e.oncomplete=function(e){"Function"==={}.toString.call(o).slice(8,-1)&&o()},e.objectStore("s").put({k:t,v:n}),e.commit()}else setTimeout(function(){c.set(t,n,o)},50)},delete:function(e,t){s?s.transaction("s","readwrite").objectStore("s").delete(e).onsuccess=function(e){t&&t()}:setTimeout(function(){c.delete(e,t)},50)},list:function(t){s?s.transaction("s").objectStore("s").getAllKeys().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.list(t)},50)},getAll:function(t){s?s.transaction("s").objectStore("s").getAll().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.getAll(t)},50)},clear:function(t){s?s.transaction("s","readwrite").objectStore("s").clear().onsuccess=function(e){t&&t()}:setTimeout(function(){c.clear(t)},50)}}).get,set:c.set,delete:c.delete,list:c.list,getAll:c.getAll,clear:c.clear},e.ldb=t,"undefined"!=typeof module&&(module.exports=t)):console.error("indexDB not supported")
//}();

//indexedDB = typeof window == 'object' ? window.indexedDB : webkitIndexedDB;

/*
setTimeout(() => {
	console.error("indexdb ldb worker: self.ldb: ", self.ldb);
},1000);
*/




self.addEventListener("message", async (event) => {
	//console.log("indexdb worker received message: ", event);
    const message = event.data;
	let result = {};
	
	try{
		if(message.action == 'get_playground_live_backups'){
			//console.log("indexdb_worker: handling action get_playground_live_backups");
			
			self.ldb.getAll((entries) => {
				//console.log("entries: ", entries);
				//console.log('All LDB indexDB entries: ', entries);
				
				let initial_db_keys = [];
				let playground_live_backups = {};
				let playground_saved_files = {};
				
				
				let file_keys = [];
	
				/*
				for (const [key, value] of Object.entries(entries)) {
					if(typeof value == 'object' && typeof value.k == 'string'){
						if(value.k.indexOf('playground_backup_') != -1){
							file_keys.push(value.k.replace('playground_backup_',''));
						}
					}
				}
				console.log("indexdb_worker: file_keys: ", file_keys);
				*/
	
				
	
	
	
				for (const [key, value] of Object.entries(entries)) {	
					//console.log("indexDB: key, value: ", key, value);
					//console.log("LDB entry: typeof value, isArray: ", typeof value, Array.isArray(value));
					if(typeof value == 'string' || typeof value == 'number'){
						console.error("indexdb worker: error, value was not string or number.  key,value: ", key, value);
					}
					else if(typeof value == 'object' && typeof value.k == 'string'){
						if(typeof value.v == 'string' || typeof value.v == 'number'){
							//console.log("indexdb_worker: adding value.k: ", value.k);
							
							initial_db_keys.push(value.k);
							
							if(value.k.indexOf('playground_backup_') != -1){
								let clean_key = value.k.replace('playground_backup_','');
								//console.log("indexdb_worker: playground_live_backups: indexdb_worker: clean_key: ", clean_key);
								
								if(value.v.startsWith('_PLAYGROUND_BINARY_')){
									playground_live_backups[value.k] = '_PLAYGROUND_BINARY_';
								}
								else{
									/*
									if(typeof playground_saved_files[clean_key] == 'string' && playground_saved_files[clean_key] == value.v){
										console.log("indexdb_worker: live_backup is the same as the saved version, so no need to get it");
									}
									else{
										playground_live_backups[clean_key] = value.v;
									}
									*/
									//console.log("indexdb_worker: adding to playground_live_backups: ", clean_key, playground_live_backups[clean_key]);
									playground_live_backups[clean_key] = value.v;
								}
								file_keys.push(clean_key);
								//console.log("added a live_backup file: ", value.k);
							}
						}
						else{
							console.error("found entry in indexdb that was not of type text. key: ", key,', value:', value);
						}
					}
					else{
						console.error("found entry in indexdb that did not have a string key. key: ", key,', value:', value);
					}
				}
				//console.log("initial playground_live_backups is now: ", playground_live_backups);
	
	
				for (const [key, value] of Object.entries(entries)) {		
					//console.log("LDB entry: typeof value, isArray: ", typeof value, Array.isArray(value));
					if(typeof value == 'object' && typeof value.k == 'string'){
						if(typeof value.v == 'string' || typeof value.v == 'number'){
							//if(!file_keys.includes(value.k) || value.v.startsWith('_PLAYGROUND_BINARY_')){
								
							//}
							//console.log("playground_saved_files: value.k: ", value.k);
							if(value.v.startsWith('_PLAYGROUND_BINARY_')){
								//playground_saved_files[value.k] = '_PLAYGROUND_BINARY_'; //should be retrieved from the indexDB as needed
								playground_saved_files[value.k] = '_PLAYGROUND_BINARY_';
							}
							else{
								if(typeof playground_live_backups[value.k] == 'string' && playground_live_backups[value.k] == value.v){
									delete playground_live_backups[value.k];
									playground_saved_files[value.k] = value.v;
									//console.log("indexdb_worker: live_backup is the same as the saved version, so only keeping the saved_files version");
								}
								else{
									playground_saved_files[value.k] = value.v;
								}
								//playground_saved_files[value.k] = value.v;
							}
						}
					}
				}
	
	
	
				
				//console.log("final indexdb playground_saved_files: ", playground_saved_files);
				result['playground_saved_files'] = playground_saved_files;
				result['playground_live_backups'] = playground_live_backups;
				result['initial_db_keys'] = initial_db_keys;
				
				//console.log("indexdb_worker: initial_db_keys: ", initial_db_keys);
				
				//console.log("indexdb result is now: ", result);
				
			    // Send the result back to the main thread
			    self.postMessage({
			        action: message.action,
			        result: result,
			    });
			
			});
		}
	
	}
	catch(e){
		console.error("indexdb worker: caught ERROR: ", e);
	}
    
    
});

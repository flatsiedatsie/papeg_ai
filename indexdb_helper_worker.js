
var t = null;
if(typeof indexedDB != 'undefined'){t = indexedDB};
if(t == null && typeof webkitIndexedDB != 'undefined'){t = webkitIndexedDB};
if(t == null && typeof mozIndexedDB != 'undefined'){t = mozIndexedDB};
if(t == null && typeof msIndexedDB != 'undefined'){t = msIndexedDB};
var s,c,e= {};
var e = self;
"undefined"==typeof window||t?((t=t.open("ldb",1)).onsuccess=function(e){s=this.result},t.onerror=function(e){console.error("indexedDB request error"),console.log(e)},t={get:(c={ready:!(t.onupgradeneeded=function(e){s=null,e.target.result.createObjectStore("s",{keyPath:"k"}).transaction.oncomplete=function(e){s=e.target.db}}),get:function(e,t){s?s.transaction("s").objectStore("s").get(e).onsuccess=function(e){e=e.target.result&&e.target.result.v||null;t(e)}:setTimeout(function(){c.get(e,t)},50)},set:function(t,n,o){if(s){let e=s.transaction("s","readwrite");e.oncomplete=function(e){"Function"==={}.toString.call(o).slice(8,-1)&&o()},e.objectStore("s").put({k:t,v:n}),e.commit()}else setTimeout(function(){c.set(t,n,o)},50)},delete:function(e,t){s?s.transaction("s","readwrite").objectStore("s").delete(e).onsuccess=function(e){t&&t()}:setTimeout(function(){c.delete(e,t)},50)},list:function(t){s?s.transaction("s").objectStore("s").getAllKeys().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.list(t)},50)},getAll:function(t){s?s.transaction("s").objectStore("s").getAll().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.getAll(t)},50)},clear:function(t){s?s.transaction("s","readwrite").objectStore("s").clear().onsuccess=function(e){t&&t()}:setTimeout(function(){c.clear(t)},50)}}).get,set:c.set,delete:c.delete,list:c.list,getAll:c.getAll,clear:c.clear},e.ldb=t,"undefined"!=typeof module&&(module.exports=t)):console.error("indexDB not supported")


//console.log("indexdb helper worker: ldb: ", ldb);






// LDB

/*
	
// Setting values
ldb.set('nameGoesHere', 'value goes here');
// or 
ldb.set('nameGoesHere', 'value goes here', function(){
  console.log("Data is successfully written to the disk.")
}); 

// Getting values - callback is required because the data is being retrieved asynchronously:
ldb.get('nameGoesHere', function (value) {
  console.log('And the value is', value);
});

// Deleting one value (callback optional)
ldb.delete('nameGoesHere', () => console.log('Value deleted'));

// List all keys
ldb.list(function(list) {
  console.log('List of keys', list)
});

// Get all keys and values
ldb.getAll(function(entries) {
  console.log('All values', entries)
});

// Clear everything (callback optional)
ldb.clear(function() {
  console.log('Storage cleared')
});

*/






function isPromise (obj) {
  // via https://unpkg.com/is-promise@2.1.0/index.js
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

function registerPromiseWorker (callback) {
  function postOutgoingMessage (e, messageId, error, result) {
    function postMessage (msg) {
      /* istanbul ignore if */
      if (typeof self.postMessage !== 'function') { // service worker
        e.ports[0].postMessage(msg)
      } else { // web worker
        self.postMessage(msg)
      }
    }
    if (error) {
      /* istanbul ignore else */
      if (typeof console !== 'undefined' && 'error' in console) {
        // This is to make errors easier to debug. I think it's important
        // enough to just leave here without giving the user an option
        // to silence it.
        console.error('Promise worker caught an error:', error)
      }
      postMessage([messageId, {
        message: error.message
      }])
    } else {
      postMessage([messageId, null, result])
    }
  }

  function tryCatchFunc (callback, message) {
    try {
      return { res: callback(message) }
    } catch (e) {
      return { err: e }
    }
  }

  function handleIncomingMessage (e, callback, messageId, message) {
	////console.log("registerPromiseWorker: in handleIncomingMessage")
    var result = tryCatchFunc(callback, message)

    if (result.err) {
      postOutgoingMessage(e, messageId, result.err)
    } else if (!isPromise(result.res)) {
      postOutgoingMessage(e, messageId, null, result.res)
    } else {
      result.res.then(function (finalResult) {
        postOutgoingMessage(e, messageId, null, finalResult)
      }, function (finalError) {
        postOutgoingMessage(e, messageId, finalError)
      })
    }
  }

  function onIncomingMessage (e) {
	  ////console.log("translation worket: registerPromiseWorker: onIncomingMessage: e.data: ", e.data);
      var payload = e.data
      if (!Array.isArray(payload) || payload.length !== 2) {
		  //console.log("onIncomingMessage: ignoring message with wrong format");
		  // message doens't match communication format; ignore
		  return
      }
      var messageId = payload[0]
      var message = payload[1]

      if (typeof callback !== 'function') {
        postOutgoingMessage(e, messageId, new Error(
          'Please pass a function into register().'))
      } else {
		  handleIncomingMessage(e, callback, messageId, message)
      }
  }

  self.addEventListener('message', onIncomingMessage)
}









registerPromiseWorker(function (message) {
	//console.log("registerPromiseWorker: indexDB helper worker got message");
	
	return new Promise((resolve, reject) => {
		try{
			
			if(typeof message.action == 'string'){
				//console.log("INDEXDB HELPER WORKER: received an ACTION: ", typeof message.action, message.action, ", KEY: ", typeof message.key, message.key);
			
			
			
				// GET
			
				if(message.action == 'get' && typeof message.key == 'string'){
					//console.log("INDEXDB HELPER WORKER: GOOD GET ACTION");
					ldb.get(message.key, (value) => {
				    	//console.log('INDEXDB HELPER WORKER:  GET DONE.  key,value: ', message.key, value);
						resolve(value);
					});
				}
				
				
				
				// SET
				
				else if(message.action == 'set' && typeof message.key == 'string' && typeof message.value == 'string'){
					ldb.set(message.key, message.value, function (ldb_response) {
				    	//console.log('INDEXDB HELPER WORKER: key SAVED: ldb has finished saving the data in IndexDB.  callback:  key,original value, ldb_response: ', message.key, message.value, ldb_response); // key,value.substr(0,10) + '...'
						resolve(message.value);
					});
				}
				
				
				
				// DELETE
				
				else if(message.action == 'delete' && typeof message.key == 'string'){
					ldb.delete(message.key, (value) => {
						//console.log('INDEXDB HELPER WORKER: key DELETED.  key,value: ', message.key, value);
						resolve(true);
					});
				}
				
				
				
				else{
					console.error('indexdb helper worker: action fell through.  message: ', message.key, message);
					self.postMessage({
						status: 'error',
						error: 'indexdb helper worker: invalid/incomplete action: ' + message.key,
						bad_message:message,
					});
					reject(false);
				}
			
			}
			else{
				console.error('indexdb helper worker: no action provided?  message: ', message);
				self.postMessage({
					status: 'error',
					error: 'indexdb helper worker: no action provided?',
					bad_message:message,
				});
				reject(false);
			}
			
		}
		catch(err){
			console.error("INDEXDB HELPER WORKER: CAUGHT GENERAL ERROR: ", err);
			self.postMessage({
				status: 'error',
				error: "INDEXDB HELPER WORKER ERROR: " + err.toString(),
				bad_message:message,
			});
			reject(false);
		}
		
	});
	
});








postMessage({"status":"exists"});
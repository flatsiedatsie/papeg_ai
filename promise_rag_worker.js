//import { pipeline } from './tjs/transformers.js';
//import { env, Tensor, AutoTokenizer, SpeechT5ForTextToSpeech, SpeechT5HifiGan } from '@xenova/transformers';
//import { env, Tensor, AutoTokenizer, SpeechT5ForTextToSpeech, SpeechT5HifiGan } from './tjs/transformers.js';

console.log("HELLO FROM RAG WORKER");






//console.log("RAG: ort: ", ort);


import { pipeline, env } from './tjs/transformers.min.js';
//import { registerPromiseWorker } from './js/promise-worker.register.js';

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

// Create a feature-extraction pipeline
//const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

// Compute sentence embeddings
//const sentences = ['This is an example sentence', 'Each sentence is converted'];
//const output = await extractor(sentences, { pooling: 'mean', normalize: true });

//console.log(output);


// Tensor {
//   dims: [ 2, 384 ],
//   type: 'float32',
//   data: Float32Array(768) [ 0.04592696577310562, 0.07328180968761444, ... ],
//   size: 768
// }


/*
import './mememo/index.umd.js';
console.log("RAG WORKER: mememo imported?");
console.log("RAG WORKER: mememo: ", mememo);

const index = new mememo.HNSW({ distanceFunction: 'cosine' });
console.log("RAG WORKER: mememo: index: ", index);
*/

import { create, insert, insertMultiple, remove, removeMultiple, search } from './node_modules/@orama/orama/dist/index.js';
//import { persist,restore } from './node_modules/@orama/plugin-data-persistence/dist/index.js';

self.vector_db = null;

let prompt_embeddings = {};

self.extractor = null;

self.embedded_chunks = {};


// INDEXDB

// ldb, a simple indexDB wrapper
!function(){var s,c,e="undefined"!=typeof self?self:{},t=e.indexedDB||e.mozIndexedDB||e.webkitIndexedDB||e.msIndexedDB;"undefined"==typeof self||t?((t=t.open("ldb",1)).onsuccess=function(e){s=this.result},t.onerror=function(e){console.error("indexedDB request error"),console.log(e)},t={get:(c={ready:!(t.onupgradeneeded=function(e){s=null,e.target.result.createObjectStore("s",{keyPath:"k"}).transaction.oncomplete=function(e){s=e.target.db}}),get:function(e,t){s?s.transaction("s").objectStore("s").get(e).onsuccess=function(e){e=e.target.result&&e.target.result.v||null;t(e)}:setTimeout(function(){c.get(e,t)},50)},set:function(t,n,o){if(s){let e=s.transaction("s","readwrite");e.oncomplete=function(e){"Function"==={}.toString.call(o).slice(8,-1)&&o()},e.objectStore("s").put({k:t,v:n}),e.commit()}else setTimeout(function(){c.set(t,n,o)},50)},delete:function(e,t){s?s.transaction("s","readwrite").objectStore("s").delete(e).onsuccess=function(e){t&&t()}:setTimeout(function(){c.delete(e,t)},50)},list:function(t){s?s.transaction("s").objectStore("s").getAllKeys().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.list(t)},50)},getAll:function(t){s?s.transaction("s").objectStore("s").getAll().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.getAll(t)},50)},clear:function(t){s?s.transaction("s","readwrite").objectStore("s").clear().onsuccess=function(e){t&&t()}:setTimeout(function(){c.clear(t)},50)}}).get,set:c.set,delete:c.delete,list:c.list,getAll:c.getAll,clear:c.clear},e.ldb=t,"undefined"!=typeof module&&(module.exports=t)):console.error("indexDB not supported")}();
console.log("RAG WORKER: ldb: ", ldb);

function savr(key,value){
	//console.log("RAG WORKER: in savr. key: ", key, value);
 	return new Promise(function(resolve, reject) {
		ldb.set(key, value, function (value) {
	    	//console.log('savr: promise saved:  callback:  key,value: ', key, value); // key,value.substr(0,10) + '...'
			resolve(value);
		});
	});
}

function getr(key) {
	//console.log("RAG WORKER: in getr. key: ", key);
 	return new Promise(function(resolve) { // , reject
		ldb.get(key, (value) => {
			resolve(value);
		});
	});
}







let extractor = null;

let web_gpu_supported = false;
let web_gpu32_supported = false;

async function check_gpu(){
	// CHECK WEB GPU SUPPORT
	
	return
	
    if (!navigator.gpu) {
		console.error("RAG WORKER: WebGPU not supported.");
    }else{
		console.error("RAG WORKER: navigator.gpu exists: ", navigator.gpu);
		const adapter = await navigator.gpu.requestAdapter();
		if (typeof adapter != 'undefined' && adapter != null && typeof adapter.features != 'undefined') {
			if(adapter.features.has("shader-f16")){
				web_gpu_supported = true;
				
				if (navigator.gpu.wgslLanguageFeatures && !navigator.gpu.wgslLanguageFeatures.has("packed_4x8_integer_dot_product")) {
					//console.log(`RAG WORKER: webgpu DP4a built-in functions are not available`);
				}
			}
			else{
				console.warn("RAG WORKER: Web GPU: 16-bit floating-point value support is not available");
				web_gpu32_supported = true;
			}
		}
		else{
			console.error("RAG WORKER: querying WebGPU was not a success");
		}
    }
	
}

check_gpu();


async function create_embedding(texts){
	//console.log("in create_embedding. texts: ", texts);
	let embeddings = null;
	
	if(web_gpu_supported){
		//console.log("create_embedding. calling webgpu16");
		embeddings = await run_web_gpu_inference(texts);
	}
	else if(web_gpu32_supported){
		//console.log("create_embedding. calling webgpu32");
		embeddings = await run_web_gpu_inference(texts,32);
	}
	else{
		//console.log("create_embedding. calling cpu version");
		if(self.extractor == null){
			
			let options = {
				quantized: false,
				progress_callback: data => {
					//console.log("RAG WORKER: embedding progress: ", data);
					self.postMessage(data);
					/*
					self.postMessage({
						status: 'progress',
						data
					});
					*/
				}

	        }
			if(web_gpu_supported){
				options['device'] = 'webgpu';
			}
			self.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', options);
		}
		
		//console.log("RAG WORKER: cpu transformers.js extractor: ", extractor);
		embeddings = await self.extractor(texts, { pooling: 'mean', normalize: true });
	}
	//console.log("final embeddings: ", embeddings);
	return embeddings;
}







async function run_web_gpu_inference(texts, bits=16) {
	//console.log("RAG WORKER: in run_web_gpu_inference");
	if(typeof texts == 'undefined' || texts == null){
		console.error("run_web_gpu_inference: invalid texts provided");
	}
	if(typeof bits != 'number'){
		console.error("run_web_gpu_inference: invalid bits provided");
		return null;
	}
	
	let onnx_file_name = 'model_fp16.onnx';
	if(bits == 32){
		onnx_file_name = 'model.onnx';
	}
	if(bits == 8){
		onnx_file_name = 'model_int8.onnx';
	}
	
	const session = await ort.InferenceSession.create('models/Xenova/all-MiniLM-L6-v2/onnx/' + onnx_file_name, { executionProviders: ['webgpu'], log_severity_level: 0 });
    const tokenizer = await AutoTokenizer.from_pretrained('Xenova/all-MiniLM-L6-v2');

    //const texts = ['This is an example sentence', 'Each sentence is converted']

    const { input_ids, token_type_ids, attention_mask } = tokenizer(texts, {
		padding: true,
		truncation: true,
		return_tensors: 'pt'
    });

    const feeds = {
		input_ids: new ort.Tensor('int64', input_ids.data, [1, input_ids.data.length]),
		token_type_ids: new ort.Tensor('int64', token_type_ids.data, [1, token_type_ids.data.length]),
		attention_mask: new ort.Tensor('int64', attention_mask.data, [1, attention_mask.data.length])
    };
	
	const result = await session.run(feeds);
	return result;
}




/*
const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
  // Can use "nomic-ai/nomic-embed-text-v1" for more powerful but slower embeddings
  // modelName: "nomic-ai/nomic-embed-text-v1",
});
*/


function isPromise (obj) {
  // via https://unpkg.com/is-promise@2.1.0/index.js
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

function registerPromiseWorker (callback) {
  function postOutgoingMessage (e, messageId, error, result) {
    function postMessage (msg) {
     
      if (typeof self.postMessage !== 'function') { // service worker
        e.ports[0].postMessage(msg)
      } else { // web worker
        self.postMessage(msg)
      }
    }
    if (error) {
      if (typeof console !== 'undefined' && 'error' in console) {
        // This is to make errors easier to debug. I think it's important
        // enough to just leave here without giving the user an option
        // to silence it.
		  //console.error('Promise worker caught an error:', error);
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
	  console.log("registerPromiseWorker: in handleIncomingMessage");
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
	  console.log("registerPromiseWorker: onIncomingMessage: e.data: ", e.data);
      var payload = e.data
      if (!Array.isArray(payload) || payload.length !== 2) {
		  console.log("onIncomingMessage: ignoring message with wrong format");
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


console.log("RAG (PROMISE) WORKER EXISTS");
//console.log("RAG (PROMISE) WORKER: registerPromiseWorker: ", registerPromiseWorker);


// Do local model checks
env.allowLocalModels = true;
//env.allowRemoteModels = false;


let pipelines = {};






function extract_sentences(text){
	//console.log("in extract_sentences");
	//console.log("in extract_sentences. text: ", text);
	
	if(typeof text != 'string'){
		console.error("extract_sentences: returning empty array, as text was not a string: ", text);
		return [];
	}
	
	function is_number(char) {
	    return !isNaN(parseInt(char));
	}
	
	let sentences = [];
	
	if(text.indexOf('🕰️ ') != -1 && text.indexOf(' ( T+ ') != -1 && text.indexOf(' )') != -1){
		//console.log("RAG_selection: it looks like the text contains 🕰️ scribe timestamps");
	}
	let lines = text.split("\n");
	let timestamp_lines_removed = 0;
	//console.log("extract_sentences: number of lines to check: ", lines.length);
	if(lines.length){
		for(let l = lines.length - 1; l >= 0; l--){
			//console.log("extract_sentences: l: ", l,lines[l]);
			if(typeof lines[l] == 'string'){
				if(lines[l].startsWith('🕰️ ') && lines[l].endsWith(' )') && lines[l].indexOf(' ( T+ ') != -1){
					//console.log("extract_sentences: removing timestamp line from source_text: ", lines[l]);
					lines.splice(l,1);
					l--;
					timestamp_lines_removed++;
				}
				
				else if( (lines[l].trim()).length < 2){
					//console.log("extract_sentences: removed empty line from lines: ", lines[l]);
					lines.splice(l,1);
					l--;
				}
				
			}
			else{
				console.error("extract_sentences: lines[l] was not a string??", l, lines, lines[l]);
			}
		}
		
	}
	//console.log("next: removing empty strings from sentences");
	if(lines.length){
		for(let l = lines.length - 1; l >= 0; l--){
			if(lines[l].trim().length < 2){
				//console.log("extract_sentences: removed empty line from lines: ", lines[l]);
				lines.splice(l,1);
				l--;
			}
		}
	}
	/*
	//console.log("extract_sentences: number of lines after stripping: ", lines.length);
	if(lines.length > 3 && timestamp_lines_removed > 3){
		//console.log("RAG_selection: setting lines as prepared_lines: ", lines);
		prepared_lines = lines;
	}
	*/
	
	
	

	for(let l = 0; l < lines.length; l++){
		const paragraph = lines[l];
		let start = 0;
		
		if(paragraph.length < 4 && l < (lines.length - 1) && paragraph.indexOf('.') == -1 && paragraph.indexOf('!') == -1 && paragraph.indexOf('?') == -1){
			//console.log("extract_sentences: could scoot this very short paragraph over so it becomes part of the next one: ", lines[l], lines[l+1]);
			//lines[l+1] = lines[l] + ' ' + lines[l+1];
		}
		
		for (let i = 0; i < paragraph.length; i++) {
			if(i == paragraph.length - 5){
				//console.log("extract_sentences: almost reached end of a paragraph, jumping to the end");
				let sentence = paragraph.substring(start).trim();
				if(sentence.length > 1){
					sentences.push(sentence);
					//break
				}
				break
				
			}
		    else if (paragraph[i] === '.' || paragraph[i] === '?' || paragraph[i] === '!') {
		        let sentence = paragraph.substring(start, i + 1).trim();
				
				if(sentence.length < 3){ // try to continue if the sentence is very short
					//console.log("very short sentence, will try to get a longer one")
					
					if( (paragraph.length - i) < 5){ // almost at the end
						sentence = paragraph.substring(start).trim(); // grab everything until the end
						sentences.push(sentence);
						break
					}
					else{
						//console.log("extract_sentences: aiming for a longer sentence");
					}
				}
				else if(paragraph.length - i > 1){ // almost at the end
					//if(paragraph[i+1] === ' '){
					if(is_number(paragraph[i+1])){
						
					}
					else{
		        		sentences.push(sentence);
		        		start = i + 1;
					}
				}
				else{
					sentence = paragraph.substring(start).trim(); // grab everything until the end
					sentences.push(sentence);
					break
				}
		        
		    }
		}
	}
	
	if(sentences.length){
		for(let l = sentences.length - 1; l >= 0; l--){
			if((sentences[l].trim()).length < 2){
				//console.log("extract_sentences: removed empty line from sentences: ", sentences[l]);
				sentences.splice(l,1);
				l--;
			}
		}
	}
	
	//console.log("extract_sentences: final sentences: ", JSON.stringify(sentences));
	return sentences
	
}







/*
// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
    static task = 'text-classification';
    static model = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}
*/




/*
// non-promise-wrapped normal worker messages
self.addEventListener('message', async (message) => {
	
	message = message.data;
	
	//console.log("RAG WORKER: RECEIVED MESSAGE: ", message);

	

	if(typeof message.task != 'undefined' && message.task != null){
		//console.log("RAG WORKER: received a task: ", message.task);
	
		let source_text = null;
		let embedded_property = null;
		let embedded_property_index = null;
		
		
		if(typeof message.task.silent == 'boolean' && message.task.silent == true && typeof message.task.results != 'undefined' && Array.isArray(message.task.results) && message.task.results.length){
			source_text = message.task.results[message.task.results.length - 1];
			embedded_property = 'result';
			embedded_property_index = message.task.results.length - 1;
			//console.log("RAG WORKER: embedding result at index: ", embedded_property_index);			
		}
		
		else if(typeof message.task.text == 'string' && message.task.text.length){
			//console.log("RAG_WORKER: task had no source_text, but does have text. Using that as embedding input. ",  message.task.text);
			source_text = message.task.text;
			embedded_property = 'text';
		}
		else if(typeof message.task.original_prompt == 'undefined' && typeof message.task.prompt == 'string' && message.task.prompt.length){
			source_text = message.task.prompt;
			embedded_property = 'prompt';
		}
		else if(typeof message.task.results != 'undefined' && Array.isArray(message.task.results) && message.task.results.length){
			source_text = message.task.results[message.task.results.length - 1];
			embedded_property = 'result';
			embedded_property_index = message.task.results.length - 1;
			//console.log("RAG WORKER: embedding result at index: ", embedded_property_index);
		}
		
		if(source_text){
			
			function progressCallback(x){
				//console.log("RAG embedding worker: progressCallback: ", x);
			    self.postMessage(x);
			}
			
			let previous_doc_cursor = 0;
			let done_so_far = '';
			let so_far = '';
			let work_text = '' + source_text;
			let to_go_part = '' + source_text;
			let old_text = '' + source_text;
			let new_text = '' + source_text;
			let sentences = [];
			if(typeof message.task.sentences_to_embed != 'undefined' && message.task.sentences_to_embed != null && Array.isArray(message.task.sentences_to_embed)){
				//console.log("RAG WORKER: TASK HAS LIST OF PRE-SPLIT sentences_to_embed: ", message.task.sentences_to_embed);
				sentences = message.task.sentences_to_embed;
			}
			else if(typeof extract_sentences != 'undefined'){
				//console.log("WAR WORKER: going to send text to extract_sentences, which will split the text into sentences");
				sentences = extract_sentences(source_text);
				//console.log("RAG WORKER: used extract_sentences. Sentences list is now: ", sentences);
			}
			else{
				sentences = source_text.replace(/([.?!\n])\s*(?=[A-Z])/g, "$1|!|!|").split("|!|!|");
				//console.log("RAG WORKER:did split of text into sentences. Sentences list is now: ", sentences);
			}
			console.warn("RAG WORKER: sentences to embed: ", sentences.length, sentences);
			let s = 0;
			
			let chunks = [];
			
			const do_embedding_loop = () => {
				console.warn("RAG WORKER: in do_embedding_loop. s: ", s, " of ", sentences.length);
				if(s < sentences.length){
					let sentence = sentences[s].trim();
					
					if(sentence.length < 250 && s < (sentences.length - 1)){
						sentences[s+1] = sentences[s] + sentences[s+1];
						console.warn("RAG WORKER: very short sentence, attempting to delay it until the next loop: ", sentences[s], " --> ", sentences[s+1]);
						s++;
						do_embedding_loop();
						return
					}
					
					chunks.push(sentence);
					
					s++;
					do_embedding_loop();
					
				}
				else{
					console.warn("RAG WORKER: RAG EMBEDDINGS: ALL CHUNKS CREATED. final chunks: ", chunks);
					
					create_embedding(chunks)
					.then((embeddings) => {
						//console.log("HURRAY, RAG EMBEDDINGS!: ", embeddings);
						//console.log("HURRAY, RAG EMBEDDINGS AS A LIST: ", embeddings.tolist())
						
						if(typeof message.task.rag_full_document == 'boolean' && message.task.rag_full_document == true && typeof message.task.file != 'undefined' && message.task.file != null && typeof message.task.file.folder == 'string' && typeof message.task.file.filename == 'string'){
							//console.log("HURRAY, RAG: can save embeddings, as file info is available. message.task.file: ", message.task.file);
						}
						
						
					})
					.catch((err) => {
						console.error("RAG WORKER: caught error creating embeddings: ", err);
					})
				}
			}
			do_embedding_loop();
		}
		else{
			//console.log("RAG WORKER: TEXT/PROMPT TO RAG MISSING, NOT LONG ENOUGH, OR INVALID: ", message.task);
			//postMessage({"error":"Invalid source_text provided",'task': message.task});
			//reject({"status":"error","error":"Invalid source_text provided","task": message.task})
		}


		//postMessage({'embedding_data': message});
		//postMessage( message);

	}
	else{
		console.error("RAG WORKER: no valid task provided");
		//postMessage({"error":"No valid task object provided"});
		//reject({"status":"error","error":"No valid task object provided"});
	}


});
*/









registerPromiseWorker(function (message) {
	//console.log("registerPromiseWorker:  got message: ", typeof message, message);
	//console.log("PROMISE RAG WORKER: registerPromiseWorker: GOT MESSAGE: ", typeof message, message); // { hello: 'world', answer: 42, 'this is fun': true }
	
	
	//console.log("PROMISE RAG WORKER RECEIVED MESSAGE");
	//console.log("PROMISE RAG message: ", typeof message, message);
	
	if(typeof message.action == 'string' && message.action == 'save_db'){
		save_db();
		return true;
	}
	
	else if(typeof message.action == 'string' && message.action == 'get_database'){
		//console.log("PROMISE RAG WORKER: got action request to get_database");
		return get_database();
	}
	
	/*
	if(typeof message.task == 'undefined' && message['1'].task != 'undefined'){
		
	}
	*/
	
	else if(typeof message.task == 'undefined'){
		console.error("RAG PROMISE WORKER: message.task was undefined");
		if(message.length && typeof message[0].task != 'undefined'){
			message = message[1];
		}
		else if(message.length > 1){
			if(typeof message[1].task != 'undefined'){
				message = message[1];
			}
		}
	}
	
	if(typeof message.task != 'undefined' && message.task != null && typeof message.task.type == 'string'){
		//console.log("PROMISE RAG WORKER: received a task: ", message.task.type, message.task);
		
		// EMBEDDING OF DOCUMENTS
		if(message.task.type == 'embedding' && typeof message.task.text == 'string'){
			return do_embedding(message.task);
		}
		
		else if(message.task.type == 'get_database'){
			return get_database();
		}
		
		// SEARCHING IN DOCUMENTS
		else if(message.task.type == 'rag_search' && typeof message.task.prompt == 'string' && typeof message.task.files != 'undefined'){
			
			return new Promise((resolve, reject) => {
				
				let prompt_as_embedding = null;
				if(typeof prompt_embeddings[message.task.prompt] != 'undefined'){
					//console.log("do_rag: found an embedding for this prompt in window.prompt_embeddings: ", message.task.prompt);
					prompt_as_embedding = prompt_embeddings[message.task.prompt];
					//return search_in_documents(message.task,prompt_as_embedding);
					search_in_documents(message.task, prompt_as_embedding)
					.then((search_result) => {
						//console.log("RAG WORKER: re-search_in_documents COMPLETE. search_result: ", search_result);
						/*
						resolve({
							'task': task,
							'status': 'search_complete',
							//'embedded_property': embedded_property,
							//'embedded_property_index': embedded_property_index,
							'search_results': search_result
						});
						
						return {
							'task': message.task,
							'status': 'search_complete',
							//'embedded_property': embedded_property,
							//'embedded_property_index': embedded_property_index,
							'search_results': search_result
						}*/
						const search_result_message = {
							'task': message.task,
							'status': 'search_complete',
							//'embedded_property': embedded_property,
							//'embedded_property_index': embedded_property_index,
							'search_results': search_result
						}
					
						//postMessage({"status":"search_complete",'task':message.task,'search_result':search_result});
						
						resolve(search_result_message);
						return search_result_message;
					
					})
					.catch((err) => {
						console.error("PROMISE RAG WORKER: caught error re-searching in documents: ", err);
						
						reject({
							'task': message.task,
							'status': 'error',
							'error':'searching in documents failed'
						});
						
						return {
							'task': message.task,
							'status': 'error',
							'error':'searching in documents failed'
						}
					});
				}
				else{
				
					create_embedding([message.task.prompt])
					.then((embeddings) => {
					
						//console.log("RAG WORKER: SEARCH: EMBEDDINGS: ", typeof embeddings, Array.isArray(embeddings), embeddings);
						const embeddings_list = embeddings.tolist();
						//console.log("RAG WORKER: SEARCH: embeddings_list: ", embeddings_list);
					
						// Save prompt embedding for future reference
						prompt_embeddings[message.task.prompt] = embeddings_list[0];
					
						search_in_documents(message.task, embeddings_list[0])
						.then((search_result) => {
							//console.log("RAG WORKER: search_in_documents COMPLETE. search_result: ", search_result);
							
							
							
							const search_result_message = {
								'task': message.task,
								'status': 'search_complete',
								//'embedded_property': embedded_property,
								//'embedded_property_index': embedded_property_index,
								'search_results': search_result
							}
						
							postMessage({"status":"search_complete",'task':message.task,'search_result':search_result});
							
							resolve(search_result_message);
							return search_result_message;
						
						})
						.catch((err) => {
							console.error("PROMISE RAG WORKER: caught error searching in documents: ", err);
							
							reject({
								'task': message.task,
								'status': 'error',
								'error':'searching in documents failed: ' + err
							});
							
							return {
								'task': message.task,
								'status': 'error',
								'error':'searching in documents failed: ' + err
							}
						});
					
		
				
					})
					.catch((err) => {
						console.error("PROMISE RAG WORKER: caught error searching: ", err);
						
						reject({
							'task': message.task,
							'status': 'error',
							'error':'embedding failed: ' + err
						});
						
						return {
							'task': message.task,
							'status': 'error',
							'error':'embedding failed: ' + err
						}
					})
				
				}
			})
			
		}
		else{
			return {"error":"action/tasks fell through"};
			//return false
		}
		
	}
	
	else{
		console.error("PROMISE RAG WORKER: no valid task provided");
		//postMessage({"error":"No valid task object provided"});
		return {"error":"No valid task object provided"};
	}
	
});



/*

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
	
	//console.log("RAG WORKER RECEIVED TASK");
	//console.log("RAG event.data: ", event.data);
	
	if(typeof event.data.cache_name == 'string'){
		//console.log("embedding_worker: setting cache_name to: ", event.data.cache_name)
		cache_name = event.data.cache_name;
	}
	
	let source_text = null;
	if(typeof event.data.task == 'object'){
		//console.log("RAG WORKER: received a task: ",  event.data.task);
		
		
		if(typeof event.data.task.source_text == 'string' && event.data.task.source_text.length){
			//console.log("RAG_WORKER: task has simple source_text property, using that as the input source_text: ", event.data.task.source_text);
			source_text = event.data.task.source_text; // simpler shortcut option for simple tasks
		}
		else if(typeof event.data.task.text == 'string' && event.data.task.text.length){
			//console.log("RAG_WORKER: task had no source_text, but does have text. Using that as embedding input. ", event.data.task.text);
			source_text = event.data.task.text;
		}
		if(source_text != null){
			//console.log("RAG WORKER: OK, source_text was not null: ", source_text);
			
			let input_language = 'nl';
			if(typeof event.data.task.input_language == 'string'){
				input_language = event.data.task.input_language.toLowerCase();
			}
			let output_language = 'en';
			if(typeof event.data.task.output_language == 'string'){
				output_language = event.data.task.output_language.toLowerCase();
			}

			
			await caches.open("transformers").then((my_cache) => my_cache.add('./tjs/transformers.js'));
			
			
			
			let hf_model_url = 'Xenova/opus-mt-' + input_language + '-' + output_language ;

			function progressCallback(x){
				//console.log("embedding worker: progressCallback: ", x);
			    self.postMessage(x);
			}
			
			
		    //let pipe = await pipeline('embedding', 'Xenova/opus-mt-nl-en'); // ,{ dtype: 'fp32' }
			let pipe = await pipeline('embedding', hf_model_url, {
                progress_callback: progressCallback
            }); // ,{ dtype: 'fp32' }

			
			
		    let embedding = await pipe("Wat is de hoofdstad van Frankrijk?");
		    console.log("embedding worker: ", embedding);
			
		    self.postMessage({
				task: event.data.task,
		        status: 'complete',
				embedding: embedding
		    });
			
			
			
		
			
		}
		else{
			//console.log("RAG WORKER: TEXT TO RAG NOT LONG ENOUGH OR INVALID: ", source_text);
			postMessage({"error":"Invalid source_text provided",'task':event.data.task});
			return
		}

		//postMessage({'embedding_data':event.data});
		//postMessage(event.data);
		
	}
	else{
		console.error("RAG WORKER: no valid task provided");
		postMessage({"error":"No valid task object provided"});
		return
	}
	
});
postMessage({"status":"exists"});
*/



/*
let pre_made_embeddings = await getr('$playground_rag_embeddings' + rag_path, files[current_file_name]);
console.log("start_rag_search:  pre_made_embeddings: ", pre_made_embeddings);
if(pre_made_embeddings == null){

}
*/

async function do_embedding(task){
	
	
	return new Promise((resolve, reject) => {
		try{
			
			// self.vector_db should have been created when this script was loaded in
			if(self.vector_db == null){
				console.error("do_embedding: self.vector_db was still null");
				reject({
					'task': task,
					'status': 'error',
					'error':'vector_db was still null'
				});
				return
			}
			//console.log("self.vector_db: ", self.vector_db);
		
			let search_result = [];
			//console.log("do_embedding: task", task);
		
			let quick_file_path = '$totallynonexistantpath$';
			if(typeof task.file != 'undefined' && task.file != null && typeof task.file.folder == 'string' && typeof task.file.filename == 'string'){
				quick_file_path = task.file.folder + '/' + task.file.filename;
			}
			//console.log("RAG WORKER: do_embedding: quick_file_path: ", quick_file_path);
		
			// Below is an attempt to avoid re-scanning chunks
			
			
			search(self.vector_db, {
				term: quick_file_path,
				properties: ['path'],
				exact: true,
			})
			.then((initial_search_result) => {
				search_result = initial_search_result;
				//console.log("do_embedding:  quick_file_path, initial_search_result: ", quick_file_path, initial_search_result);


				let source_text = null;
				let embedded_property = null;
				let embedded_property_index = null;
	
	
				if(typeof task.silent == 'boolean' && task.silent == true && typeof task.results != 'undefined' && Array.isArray(task.results) && task.results.length){
					source_text = task.results[task.results.length - 1];
					embedded_property = 'result';
					embedded_property_index = task.results.length - 1;
					//console.log("PROMISE RAG WORKER: embedding result at index: ", embedded_property_index);			
				}
	
				else if(typeof task.text == 'string' && task.text.length && !task.text.startsWith('_PLAYGROUND_BINARY_')){
					//console.log("PROMISE RAG WORKER: task had no source_text, but does have text. Using that as embedding input. ",  task.text);
					source_text = task.text;
					embedded_property = 'text';
				}
				else if(typeof task.original_prompt == 'undefined' && typeof task.prompt == 'string' && task.prompt.length){
					source_text = task.prompt;
					embedded_property = 'prompt';
				}
				else if(typeof task.results != 'undefined' && Array.isArray(task.results) && task.results.length){
					source_text = task.results[task.results.length - 1];
					embedded_property = 'result';
					embedded_property_index = task.results.length - 1;
					//console.log("PROMISE RAG WORKER: embedding result at index: ", embedded_property_index);
				}
	
				if(typeof task.type != 'string' || typeof task.origin != 'string'){
					reject({"status":"error","error":"Task did not have valid type or origin property","task": task});
					return
				}
	
				if( (task.origin == 'selection' || task.origin == 'document') && (typeof task.file == 'undefined' || task.file == null || typeof task.file.folder != 'string' || typeof task.file.filename != 'string') ){
					reject({"status":"error","error":"Task did not have required file info","task": task});
					return
				}
	
	
				if(typeof source_text == 'string' && source_text.startsWith('_PLAYGROUND_BINARY_')){
					console.error("PROMISE RAG WORKER: almost tried to embed a binary file. Aborting.");
					reject({"status":"error","error":"File was not a text file","task": task});
					return
				}
	
				if(typeof source_text == 'string'){
		
					function progressCallback(x){
						//console.log("PROMISE RAG embedding worker: progressCallback: ", x);
					    self.postMessage(x);
					}
		
					let previous_doc_cursor = 0;
					let done_so_far = '';
					let so_far = '';
					let work_text = '' + source_text;
					let to_go_part = '' + source_text;
					let old_text = '' + source_text;
					let new_text = '' + source_text;
					let sentences = [];
				
					if(typeof task.sentences_to_embed != 'undefined'){
						//console.log("PROMISE RAG WORKER: TASK HAS LIST OF PRE-SPLIT sentences_to_embed: ", task.sentences_to_embed);
						sentences = task.sentences_to_embed;
					}
					else if(typeof extract_sentences != 'undefined'){
						//console.log("PROMISE RAG WORKER: going to send text to extract_sentences, which will split the text into sentences");
						sentences = extract_sentences(source_text);
						//console.log("PROMISE RAG WORKER: used extract_sentences. Sentences list is now: ", sentences);
					}
					else{
						sentences = source_text.replace(/([.?!\n])\s*(?=[A-Z])/g, "$1|!|!|").split("|!|!|");
						//console.log("PROMISE RAG WORKER:did split of text into sentences. Sentences list is now: ", sentences);
					}
					console.warn("PROMISE RAG WORKER: sentences to embed: ", sentences.length, sentences);
					//let s = 0;
		
					let chunks = [];
					let chunks_list = []
					let text_pointer = 0;
		
					let next_sentence = '';
					let first_glued_sentence = null;
		
					for(let s = 0; s < sentences.length; s++){
						let sentence = sentences[s].trim();
						if(first_glued_sentence == null && sentence.length > 2){
							first_glued_sentence = sentence;
						}
						next_sentence += ' ' + sentence;
						if(next_sentence.length < 250 && s < (sentences.length - 1)){
							// wait until the next sentence is long enough
						
						}
						else{
				
							let chunk_from = null;
							let chunk_to = null;
							let remaining_text = source_text;
							if(text_pointer > 0){
								remaining_text = source_text.substr(text_pointer);
							}
							//console.log("PROMISE RAG WORKER: cursors: remaining_text: ", remaining_text.substr(0,10) );
							//console.log("PROMISE RAG WORKER: cursors: next_sentence: ", next_sentence.substr(0,10) + " .... " +  next_sentence.substr(next_sentence.length-10));
							chunks_list.push(next_sentence);
				
							//console.log("PROMISE RAG WORKER: cursors: text_pointer: ", text_pointer);
							//console.log("PROMISE RAG WORKER: cursors: remaining_text.indexOf(next_sentence): ", remaining_text.indexOf(first_glued_sentence));
							chunk_from = text_pointer + remaining_text.indexOf(first_glued_sentence);
							if(chunk_from < 0){
								chunk_from = 0;
							}
							if(typeof chunk_from == 'number'){
								chunk_to = chunk_from + next_sentence.length;
								if(chunk_to > (source_text.length - 1)){
									chunk_to = source_text.length - 1;
								}
								text_pointer = chunk_to - 1;
								if(text_pointer<0){
									text_pointer = 0;
								}
								//console.log("PROMISE RAG WORKER: text_pointer is now: ", text_pointer)
							}
							else{
								console.error("PROMISE RAG WORKER: chunk from was not a number: ", chunk_from);
							}
				
							//console.log("PROMISE RAG WORKER: cursors: chunk_from, next_sentence.length, chunk_to: ", chunk_from, next_sentence.length, chunk_to);
						
							let brand_new_chunk = {'chunk':next_sentence,'to':chunk_to,'from':chunk_from,'chunk_index':s};
				
							if(typeof task.file != 'undefined' && task.file != null && typeof task.file.folder == 'string' && typeof task.file.filename == 'string'){
								brand_new_chunk['folder'] = task.file.folder;
								brand_new_chunk['filename'] = task.file.filename;
								brand_new_chunk['path'] = task.file.folder + '/' + task.file.filename;
							}
							//console.log("RAG WORKER: adding brand new chunk: ", brand_new_chunk);
							chunks.push(brand_new_chunk);
				
							next_sentence = '';
							first_glued_sentence = null;
				
						}
			
					}
		
					let already_embedded_chunks = {};
					if(typeof task.file != 'undefined' && task.file != null && typeof task.file.folder == 'string' && typeof task.file.filename == 'string'){
						/*
						const search_result = await do_search({
														term: task.file.folder + '/' + task.file.filename,
														properties: ['path'],
														exact: true,
													})
			
						*/
			
						if(typeof search_result != 'undefined' && search_result != null && typeof search_result.hits != 'undefined' && search_result.hits.length){
							//console.log("RAG WORKER: looping over initial search results. search_result.hits: ", search_result.hits)
							for(let c = 0; c < search_result.hits.length; c++){
								if(typeof search_result.hits[c].chunk == 'string' && typeof search_result.hits[c].meta.to == 'number' && typeof search_result.hits[c].meta.from == 'number'){
									already_embedded_chunks[ search_result.hits[c].chunk ] = search_result.hits[c].meta;
								}
					
							}
						}
			
					}
					else{
						console.warn("RAG WORKER: do_embeddings: task.file was invalid");
					}
		
					//console.log("RAG WORKER: do_embeddings: already_embedded_chunks: ", already_embedded_chunks);
					//already_embedded_chunks
		
					if(chunks_list.length){
						create_embedding(chunks_list)
						.then((embeddings) => {
			
							//console.log("RAG WORKER: EMBEDDINGS: ", typeof embeddings, Array.isArray(embeddings), embeddings);
							const embeddings_list = embeddings.tolist();
							//console.log("RAG WORKER: EMBEDDINGS_LIST: ", embeddings_list);
				
							let chunks_list_index = 0;
							//for (const [chunk, details] of Object.entries(chunks)) {
							for( let em = 0; em < chunks.length; em++){
								//console.log("RAG WORKER: chunks[em]: ", chunks[em]);
								//console.log("RAG WORKER: chunks[em].chunk: ", chunks[em].chunk , " =?= ", chunks_list[em] );
								//console.log("RAG WORKER: chunks_list[em]: ", chunks_list[em]);
								//console.log("RAG WORKER: chunks -> embeddings_list[em]: ", embeddings_list[em]);
						
								if(typeof chunks_list[em] == 'string' && chunks_list[em] == chunks[em]['chunk']){
									chunks[ em ]['embedding'] = embeddings_list[em];
									//console.log("RAG WORKER: OK, added embedding to chunk object: ", chunks[ em ]);
								}
								else{
									console.error("RAG WORKER: EMBEDDINGS: chunks got out of sync");
								}
				
								//chunks_list_index++;
							}
			
			
			
							if(typeof task.file != 'undefined' && task.file != null && typeof task.file.folder == 'string' && typeof task.file.filename == 'string'){
								if(embeddings_list.length == chunks.length){
									//console.log("RAG WORKER: OK, embeddings_list.length == chunks.length == ", chunks.length);
									/*
									let new_records = [];
									for(let e = 0; e < chunks.length; e++){
										//console.log("rag_worker: adding chunk to vector_db: ", chunk[e], "\n --> ", embeddings_list[e]);
						
										new_records.push({
											folder: task.file.folder,
											filename: task.file.filename,
											path: task.file.folder + '/' + task.file.filename,
											chunk:chunks[e],
											embedding: embeddings_list[e],
											meta:{
												chunk_index:e,
											}
										})
									}
									*/
									//console.log("RAG WORKER: ADDING MULTIPLE: chunks: ", chunks);
								
									insertMultiple(self.vector_db, chunks, 500)
									.then((ids) => {
										//console.log("RAG WORKER: added new records to DB. ids: ", ids);
										
										save_db();
										
										resolve({
											'task': task,
											'status': 'embedding_complete',
											'file':task.file,
											//'embedded_property': embedded_property,
											//'embedded_property_index': embedded_property_index,
											'chunks':chunks,
											'embeddings': embeddings_list
										});
									})
									.catch((err) => {
										console.error("RAG WORKER: caught error doing insertMultiple: ", err);
										reject({
											'task': task,
											'status': 'error',
											'error':'caught error doing insertMultiple'
										});
									})
							
							
					
								}
								else{
									console.error("RAG WORKER: chunks length and embeddings length are not the same");
									reject({
										'task': task,
										'status': 'error',
										'error':'embeddings and chunks length mismatch'
									});
								}
							}
							else{
								resolve({
									'task': task,
									'status': 'embedding_complete',
									//'embedded_property': embedded_property,
									//'embedded_property_index': embedded_property_index,
									'embeddings': embeddings_list
								});
							}
			
					
						})
						.catch((err) => {
							console.error("PROMISE RAG WORKER: caught error generating embedding: ", err);
							reject({
								'task': task,
								'status': 'error',
								'error':'embedding failed'
							});
						})
					}
		
					else{
						//console.log("PROMISE RAG WORKER: no new chunks to add to the DB");
						resolve({
							'task': task,
							'status': 'embedding_complete'
						});
					}
		
		
	
				    //let pipe = await pipeline('embedding', 'Xenova/opus-mt-nl-en'); // ,{ dtype: 'fp32' }
		

				}
				else{
					//console.log("PROMISE RAG WORKER: TEXT/PROMPT TO RAG MISSING, NOT LONG ENOUGH, OR INVALID: ", task);
					//postMessage({"error":"Invalid source_text provided",'task': task});
					reject({"status":"error","error":"Invalid source_text provided","task": task});
				}
				
				
			
			})
			.catch((err) => {
				console.error("do_embedding: failed to get initial search result: ", err);
				reject({"status":"error","error":"failed to get initial search result","task": task});
			})
			
			
			
			
				
			
			
			
		
		}
		catch(err){
			console.error("PROMISE RAG WORKER: CAUGHT GENERAL ERROR: ", err);
			reject({"status":"error","error":"general error in promise rag worker"});
		}
		
	});
}









//
//  SEARCH IN DOCUMENTS
//


function search_in_documents(task=null, prompt_embedding=null){
	//console.log("PROMISE RAG WORKER: in search_in_documents. task, prompt_embedding: ", task, prompt_embedding);
	
	return new Promise((resolve, reject) => {
		try{
			
			if(typeof task == 'undefined' || task == null || prompt_embedding == null){
				console.error("PROMISE RAG WORKER: search_in_documents: invalid task or prompt embedding provided: ", task, prompt_embedding);
				reject({"status":"error","error":"search_in_documents: invalid input","task": task});
				return false
			}
			
			let rag_paths = [];
			for (const [rag_path, details] of Object.entries(task.files)) {
				//console.log("PROMISE RAG WORKER: search_in_documents: adding rag_path to search filter: ", rag_path);
				if(rag_paths.indexOf(rag_path) == -1){
					rag_paths.push(rag_path);
				}
			}
			//console.log("RAG WORKER: search_in_documents: rag_paths,prompt_embedding: ", rag_paths, prompt_embedding);
			
			let rag_limit = 5;
			if(typeof task.rag_limit == 'number'){
				rag_limit = task.rag_limit;
			}
			
			let vector_search_query = {
				mode: 'vector',
				vector: {
					value: prompt_embedding, //[0.938292, 0.284961, 0.248264, 0.748276, 0.264720],
					property: 'embedding',
				},
				similarity: 0.3,      // Minimum vector search similarity. Defaults to `0.8`
				includeVectors: false,  // Defaults to `false`
				limit: rag_limit,             // Defaults to `10`
				offset: 0,             // Defaults to `0`
			}
			
			if(rag_paths.length){
				vector_search_query['where'] = {'path': rag_paths}
			}
			
			if(typeof task.rag_term == 'string' && task.rag_term.length > 3){
				//console.log("RAG WORKER: search_in_documents: doing a hybrid search. term: ", task.rag_term);
				vector_search_query['term'] = task.rag_term;
				vector_search_query['mode'] = 'hybrid';
			}
			
			/*
			vector_search_query = {
				term: task.prompt,
				properties: ['chunk'],
			}
			*/
			
			//console.log("RAG WORKER: search_in_documents:  vector_search_query: ", vector_search_query);
			
			search(self.vector_db, vector_search_query)
			.then((search_result) => {
				//console.log("RAG WORKER: search_in_documents: search_result: ", search_result);
				//let ids_to_remove = [];
				if(typeof search_result.hits != 'undefined'){
					/*
					for(let h = 0; h < search_result.hits.length; h++){
						ids_to_remove.push(search_result.hits[h].id);
						//await remove(self.vector_db, harryPotterId)
					}
					removeMultiple(self.vector_db,ids_to_remove,500);
					*/
					
				}
				resolve(search_result);
			})
			.catch((err) => {
				console.error("RAG WORKER: search_in_documents: caught error: ", err);
				reject({"status":"error","error":"search_in_documents failed","task": task});
			})
			
			
			//console.log("search_in_documents: results: ", results);
			
			/*
			const results = await search(vector_db, {
			  mode: 'vector',
			  vector: {
			    value: [0.938292, 0.284961, 0.248264, 0.748276, 0.264720],
			    property: 'embedding',
			  },
			  similarity: 0.85,      // Minimum similarity. Defaults to `0.8`
			  includeVectors: true,  // Defaults to `false`
			  limit: 10,             // Defaults to `10`
			  offset: 0,             // Defaults to `0`
			})
			*/
			
		}
		catch(err){
			console.error("search_in_documents: caught error: ", err);
			reject({"status":"error","error":"Error doing document search","task": task});
		}
	})
}








async function get_database(){
	//console.log("RAG WORKER: in get_database");
	return search(self.vector_db, {'term':'','limit': 1000,});
}





/*
async function search_chunk(chunk,folder,filename){
	if(typeof chunk != 'string' || typeof folder != 'string' || typeof filename != 'string'){
		console.error("search_chunk: must all be strings, but are not:  chunk,folder,filename:", chunk,folder,filename);
		return null;
	}
	
	if(typeof chunk == 'string' && chunk.length > 5){
		const search_result = await search(vector_db, {
			term: chunk,
			properties: ['chunk'],
			exact: true,
		});
		//console.log("search_chunk: search_result: ", search_result);
		
		if(typeof search_result.hits != 'undefined'){
			if(typeof search_result.hits.length > 1){
				console.warn("RAG WORKER: GOT MORE THAN ONE HIT FOR THIS CHUNK: ", chunk, search_result);
			}
			
			if(search_result.hits.length){
				for(let h = 0; h < search_result.hits.length; h++){
					if(search_result.hits[h].folder == folder && search_result.hits[h].filename == filename){
						return search_result.hits[h];
					}
				}
			}
			return null
		}
	}
	else{
		return null;
	}
	
}
*/


/*
async function do_search(details){
	return search(self.vector_db, details);
}
*/

async function delete_file_from_db(folder,filename){
	let path = null
	if(typeof folder == 'string' && typeof filename == 'string'){
		path = folder + '/' + filename;
	}
	else if(typeof folder == 'object' && folder != null && typeof folder.folder == 'string' && typeof folder.filename == 'string'){
		path = folder.folder + '/' + folder.filename;
	}
	if(path){
		search(self.vector_db, {
			term: path,
			properties: ['path'],
			exact: true,
			
			
			/*
			// alternatively:
			term:'',
			where: {
				'path': path,
			},
			*/
			
		})
		.then((search_result) => {
			//console.log("delete_file_from_db: search_result: ", search_result);
			let ids_to_remove = [];
			if(typeof search_result.hits != 'undefined'){
				for(let h = 0; h < search_result.hits.length; h++){
					ids_to_remove.push(search_result.hits[h].id);
					//await remove(self.vector_db, harryPotterId)
				}
				removeMultiple(self.vector_db,ids_to_remove,500);
			}
		})
		.catch((err) => {
			console.error("RAG WORKER: delete_file_from_db: caught error: ", err)
		})
		
	}
	else{
		console.error("RAG WORKER: delete_file_from_db: could not create path.  folder,filename: ", folder,filename);
	}
	
}




async function create_db(){
	self.vector_db = await create({
	  schema: {
	    folder: 'string',
	    file: 'string',
		path:'string',
	    //price: 'number',
        
 		chunk:'string',
	    embedding: 'vector[384]', // Vector size must be expressed during schema initialization
	    meta: {
			chunk_index:'number',
			to:'number',
			from:'number',
	      //rating: 'number',
	    },
	  },
	})

	postMessage({"status":"new_database_created"});
}

async function save_db(){
	//console.log("RAG WORKER: in save_db. self.vector_db: ", self.vector_db);
	
	const orama_db = {
		internalDocumentIDStore: self.vector_db.internalDocumentIDStore.save(self.vector_db.internalDocumentIDStore),
		index: await self.vector_db.index.save(self.vector_db.data.index),
		docs: await self.vector_db.documentsStore.save(self.vector_db.data.docs),
		sorting: await self.vector_db.sorter.save(self.vector_db.data.sorting),
		language: self.vector_db.tokenizer.language
	};
	
	//const vector_db_as_json = await persist(self.vector_db, 'json');
	//console.log("Vector DB as JSON: ", typeof vector_db_as_json, vector_db_as_json);
	await savr('$playground_vector_db_backup', JSON.stringify(orama_db));
	//console.log("ORAMA DATABASE SAVED")
	postMessage({"status":"database_saved"});
}

async function restore_db(vector_db_as_json){
	if(typeof vector_db_as_json == 'string'){
		vector_db_as_json = JSON.parse(vector_db_as_json);
	}
	//console.log("RAG WORKER: in restore_db. vector_db_as_json: ", vector_db_as_json);
	
	///const vector_db_as_json = await persist(vector_db, 'json');
	//console.log("Vector DB as JSON: ", vector_db_as_json);
	//self.vector_db = await restore('json', vector_db_as_json);
	
	await create_db();
	
    self.vector_db.internalDocumentIDStore.load(self.vector_db, vector_db_as_json.internalDocumentIDStore);
    self.vector_db.data.index = await self.vector_db.index.load(self.vector_db.internalDocumentIDStore, vector_db_as_json.index);
    self.vector_db.data.docs = await self.vector_db.documentsStore.load(self.vector_db.internalDocumentIDStore, vector_db_as_json.docs);
    self.vector_db.data.sorting = await self.vector_db.sorter.load(self.vector_db.internalDocumentIDStore, vector_db_as_json.sorting);
    self.vector_db.tokenizer.language = vector_db_as_json.language;
	
	postMessage({"status":"database_restored"});
	
	//console.log("RAG WORKER: RESTORED DATABASE: ", self.vector_db);
	
	/*
	await search(newInstance, {
	  term: '...'
	})
	*/
}



getr('$playground_vector_db_backup')
.then((vector_db_as_json) => {
	//console.log("vector_db_as_json: ", vector_db_as_json);
	restore_db(vector_db_as_json);
	
})
.catch((err) => {
	console.error("No database to restore");
	//console.log("RAG WORKER: cannot restore vector DB, did not find it's JSON in IndexDB");
	create_db();
})
/*
let vector_db_as_json = getr('$playground_vector_db_backup');
if(vector_db_as_json == null){
	//console.log("RAG WORKER: cannot restore vector DB, did not find it's JSON in IndexDB");
	create_db();
}
else{
	//console.log("RAG WORKER: restoring vector_db from JSON found in IndexDB: ", vector_db_as_json);
	
}
*/





postMessage({"status":"exists"});
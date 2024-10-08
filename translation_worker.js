//import { pipeline } from './tjs/transformers.js';
//import { env, Tensor, AutoTokenizer, SpeechT5ForTextToSpeech, SpeechT5HifiGan } from '@xenova/transformers';
//import { env, Tensor, AutoTokenizer, SpeechT5ForTextToSpeech, SpeechT5HifiGan } from './tjs/transformers.js';

//import './shared_utils.js';

import { pipeline, env } from './tjs/transformers.min.js';
import './js/eld.M60.min.js';
////console.log("translation worker: loaded language detection script. eld: ", eld);
//import { registerPromiseWorker } from './js/promise-worker.register.js';

//console.log("HELLO FROM TRANSLATION WORKER");




env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;
env.backends.onnx.wasm.simd = true;

self.device = 'webgpu';
//const MAX_NEW_TOKENS = 256;


self.supports_web_gpu16 = false;
self.supports_web_gpu32 = false;

self.running = false;
self.interrupted = false;

self.force_webgpu = false; // test setting for ONNX Debugging
//elf.output_so_far = '';
//self.task = null;


async function hasFp16() {
    try {
        const adapter = await navigator.gpu.requestAdapter();
		if (typeof adapter != 'undefined' && adapter != null && typeof adapter.features != 'undefined') {
			self.supports_web_gpu32 = true;
		}
		self.supports_web_gpu16 = adapter.features.has('shader-f16');
        return adapter.features.has('shader-f16');
    } catch (e) {
        return false;
    }
}
await hasFp16();
// self.supports_web_gpu16 ??= await hasFp16();



console.log("TRANSLATION WORKER: self.supports_web_gpu16: ", self.supports_web_gpu16);
console.log("TRANSLATION WORKER: self.supports_web_gpu32: ", self.supports_web_gpu32);
if(self.supports_web_gpu16 == false && self.supports_web_gpu32 == false){
	console.log("TRANSLATION WORKER: NO WEB GPU");
	self.device = 'wasm';
}
else{
	console.log("TRANSLATION WORKER: WEB GPU IS AVAILABLE");
	self.device = 'webgpu';
}

//console.log("TRANSLATION WORKER: env.backends.onnx.wasm.proxy before: ", env.backends.onnx.wasm.proxy);
env.backends.onnx.wasm.proxy = self.device !== 'webgpu';
//console.log("TRANSLATION WORKER: env.backends.onnx.wasm.proxy after: ", env.backends.onnx.wasm.proxy);




// BART50 needs longer codes
self.bart_lookup = {
    "ar": "ar_AR",
    "cs": "cs_CZ",
    "de": "de_DE",
    "en": "en_XX",
    "es": "es_XX",
    "et": "et_EE",
    "fi": "fi_FI",
    "fr": "fr_XX",
    "gu": "gu_IN",
    "hi": "hi_IN",
    "it": "it_IT",
    "ja": "ja_XX",
    "kk": "kk_KZ",
    "ko": "ko_KR",
    "lt": "lt_LT",
    "lv": "lv_LV",
    "my": "my_MM",
    "ne": "ne_NP",
    "nl": "nl_XX",
    "ro": "ro_RO",
    "ru": "ru_RU",
    "si": "si_LK",
    "tr": "tr_TR",
    "vi": "vi_VN",
    "zh": "zh_CN"
}










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


////console.log("TRANSLATION (PROMISE) WORKER EXISTS");
////console.log("TRANSLATION (PROMISE) WORKER: registerPromiseWorker: ", registerPromiseWorker);


// Do local model checks
//env.allowLocalModels = true;
//env.allowRemoteModels = false;


let pipelines = {};


function check_if_already_target_language(paragraph,output_language){
	const language_detection_result = eld.detect(paragraph);
	if(typeof language_detection_result.language == 'string'){
		const detected_language = language_detection_result.language;
		////console.log("TRANSLATION WORKER: check_if_already_target_language: detected_language: ", detected_language);
		if(language_detection_result.isReliable() && output_language.toLowerCase() == detected_language.toLowerCase()){
			return true
		}
	}
	return false
}




function extract_sentences(text, output_language){
	console.log("translation worker: in extract_sentences. text,output_language: ", text, output_language);
	if(typeof text != 'string'){
		console.error("extract_sentences: returning empty array, as text was not a string: ", text);
		return [];
	}
	
	function is_number(char) {
	    return !isNaN(parseInt(char));
	}
	
	function is_letter(character) {
	  return character.length === 1 && character.match(/[a-z]/i);
	}
	
	/*
	if(text.indexOf('<context>') != -1 && text.indexOf('</context>') != -1 ){
		let context_text = text.split('<context>')[1];
		if(text.indexOf('</context>') != -1){
			context_text = context_text.split('</context>')[0];
			
			const language_detection_result = eld.detect(context_text);
			if(typeof language_detection_result.language == 'string'){
				detected_language = language_detection_result.language;
				//text.replace('<context>' + context_text + '')
			}
		}
	}
	*/
	
	
	let sentences = []; // this will be filled with actual individual sentences, and then returned
	
	if(text.indexOf('🕰️ ') != -1){ //  && text.indexOf(' ( T+ ') != -1 && text.indexOf(' )') != -1
		////console.log("translation worker: it looks like the text contains 🕰️ scribe timestamps");
	}
	let lines = text.split("\n");

	let timestamp_lines_removed = 0;
	////console.log("translation worker: extract_sentences: number of lines to check: ", lines.length);
	if(lines.length){
		
		let ok_line = '';
		
		for(let l = lines.length - 1; l >= 0; l--){
			console.log("translation worker: extract_sentences: l: ", l, lines[l].charAt(2));
			if(typeof lines[l] == 'string'){
				//if(lines[l].startsWith('🕰️ ') && lines[l].endsWith(' )') && lines[l].indexOf(' ( T+ ') != -1){
				if(lines[l].startsWith('🕰️ ') && !isNaN(lines[l].charAt(3))){
					////console.log("extract_sentences: removing timestamp line from source_text: ", lines[l]);
					lines.splice(l,1);
					l--;
					timestamp_lines_removed++;
				}
				
				else if(lines[l].charAt(2) == ':' && lines[l].charAt(5) == ':' && lines[l].indexOf(' --> ') != -1){
					////console.log("extract_sentences: removing timestamp line from source_text: ", lines[l]);
					lines.splice(l,1);
					l--;
					timestamp_lines_removed++;
				}
				else if( (lines[l].trim()).length < 2){
					////console.log("translation worker: extract_sentences: removing empty line from lines: ", lines[l]);
					lines.splice(l,1);
					l--;
				}
				else if(lines[l].trim() == '<context>' || lines[l].trim() == '</context>'){
					////console.log("translation worker: extract_sentences: removing <context> tag line from lines: ", lines[l]);
					lines.splice(l,1);
					l--;
					
				}
				else{
					let letter_count = 0;
					for(let c = 0; c < lines[l].length; c++){
						if(is_letter(lines[l].charAt(c))){
							letter_count++;
							if(letter_count > 2){
								break
							}
						}
					}
					if(letter_count < 3 && lines[l].length > 10){
						lines.splice(l,1);
						l--;
					}
				}
				
			}
			else{
				console.error("extract_sentences: lines[l] was not a string??", l, lines, lines[l]);
			}
		}
		
	}
	////console.log("next: removing empty strings from sentences"); // already done?
	//console.log("translation_worker: lines: ", lines);
	if(lines.length){
		for(let l = lines.length - 1; l >= 0; l--){
			if(lines[l].trim().length < 2){
				////console.log("extract_sentences: removed empty line from lines: ", lines[l]);
				lines.splice(l,1);
				l--;
			}
			else if(lines[l].trim() == '""'){
				lines.splice(l,1);
				l--;
			}
		}
	}
	/*
	////console.log("extract_sentences: number of lines after stripping: ", lines.length);
	if(lines.length > 3 && timestamp_lines_removed > 3){
		////console.log("translate_selection: setting lines as prepared_lines: ", lines);
		prepared_lines = lines;
	}
	*/
	
	////console.log("extract_sentences: number of lines to check 2: ", lines.length);
	
	//console.log("translation_worker: lines again: ", lines);
	for(let l = 0; l < lines.length; l++){
		let paragraph = lines[l];
		let start = 0;
		
		if(paragraph.length > 50 && check_if_already_target_language(paragraph,output_language) == true){
			console.warn("TRANSLATION WORKER: skipping paragraph that already seems to be in the desired language: ", paragraph);
			continue
		}
		/*
		let spaces_count = lines[l].split(" ").length - 1; // Chinese and Japanese don't use spaces
		if(spaces_count == 0 && lines[l].length > 20){
			continue
		}
		
		if(spaces_count > 5 && lines[l].length < 300){
			sentences.push(lines[l]);
			continue
		}
		*/
		
		// Skip lines that contain a lot of untranslatable characters
		let non_letters = '@#$%ˆ&*()_-+=|.~[]<>{}"';
		let non_letter_count = 0;
		let cleaner_line = lines[l].replaceAll(/(?:https?|ftp):\/\/[\n\S]+/g, '');
		if(cleaner_line != lines[l]){
			////console.log("cleaner_line: ", cleaner_line);
		}
		
		for(let c = 0; c < cleaner_line.length; c++){
			const char = cleaner_line[c];
			for(let n = 0; n < non_letters.length; n++){
				if(char == non_letters[n]){
					non_letter_count++;
					break
				}
			}
		}
		////console.log("non_letter percentage: ", Math.round((non_letter_count/cleaner_line.length) * 100) + '%');
		if(non_letter_count * 4 >= cleaner_line.length){
			console.warn("translation_worker: skipping line that contains too many non-characters: ", lines[l]);
			continue
		}
		
		paragraph = paragraph.replace(/([a-z][a-z])(\.\"\s)([A-Z][a-z])/g, '$1."=|=sentence_break=|=$3');
		paragraph = paragraph.replace(/([a-z][a-z])(\"\.\s)([A-Z][a-z])/g, '$1".=|=sentence_break=|=$3');
		paragraph = paragraph.replace(/([a-z][a-z])(\?\"\s)([A-Z][a-z])/g, '$1?"=|=sentence_break=|=$3');
		paragraph = paragraph.replace(/([a-z][a-z])(\"\?\s)([A-Z][a-z])/g, '$1"?=|=sentence_break=|=$3');
		paragraph = paragraph.replace(/([a-z][a-z])(\!\"\s)([A-Z][a-z])/g, '$1!"=|=sentence_break=|=$3');
		paragraph = paragraph.replace(/([a-z][a-z])(\"\!\s)([A-Z][a-z])/g, '$1"!=|=sentence_break=|=$3');
		
		paragraph = paragraph.replace(/([a-z][a-z])(\.\s)([A-Z][a-z])/g, "$1. =|=sentence_break=|=$3");
		paragraph = paragraph.replace(/([a-z][a-z])(\!\s)([A-Z][a-z])/g, "$1! =|=sentence_break=|=$3");
		paragraph = paragraph.replace(/([a-z][a-z])(\?\s)([A-Z][a-z])/g, "$1? =|=sentence_break=|=$3");
		////console.log("paragraph broken up: ", paragraph);
		if(paragraph.indexOf('=|=sentence_break=|=') != -1){
			const paragraph_parts = paragraph.split('=|=sentence_break=|=');
			
			sentences = sentences.concat(paragraph_parts);
			/*
			for(let s = 0; s < paragraph_parts.length; s++){
				if(paragraph_parts[s].length > 1){
					sentences.push(s);
				}
			}
			*/
				
			
		}
		else{
			sentences.push(paragraph);
		}
		
		
		/*
		if(paragraph.length < 4 && l < (lines.length - 1) && paragraph.indexOf('.') == -1 && paragraph.indexOf('!') == -1 && paragraph.indexOf('?') == -1){
			////console.log("extract_sentences: could scoot this very short paragraph over so it becomes part of the next one: ", lines[l], lines[l+1]);
			//lines[l+1] = lines[l] + ' ' + lines[l+1];
		}
		*/
		
		/*
		for (let i = 0; i < paragraph.length; i++) {
			
			
			
		    else if (paragraph[i] === '.' || paragraph[i] === '?' || paragraph[i] === '!') {
		        let sentence = paragraph.substring(start, i + 1).trim();
				
				if(sentence.length < 3){ // try to continue if the sentence is very short
					////console.log("very short sentence, will try to get a longer one")
					
					if( (paragraph.length - i) < 5){ // almost at the end
						sentence = paragraph.substring(start).trim(); // grab everything until the end
						sentences.push(sentence);
						break
					}
					else{
						////console.log("extract_sentences: aiming for a longer sentence");
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
		*/
	}
	
	if(sentences.length){
		for(let l = sentences.length - 1; l >= 0; l--){
			if((sentences[l].trim()).length < 2){
				////console.log("extract_sentences: removed empty line from sentences: ", sentences[l]);
				sentences.splice(l,1);
				l--;
			}
		}
	}
	
	//console.log("extract_sentences: final sentences: ", JSON.stringify(sentences));
	return sentences
	
}







/*
async function go() {
  //let pipe = await pipeline('translation', 'onnx/quantized/Helsinki-NLP/opus-mt-nl-en');
  let pipe = await pipeline('translation', 'Xenova/opus-mt-nl-en'); // ,{ dtype: 'fp32' }
  
  let translation = await pipe("Wat is de hoofdstad van Frankrijk?");
  //console.log("translation worker: ", translation);
  return translation;
}

go();
*/
/*
// Use the Singleton pattern to enable lazy construction of the pipeline.
class MyTextToSpeechPipeline {

    static BASE_URL = 'https://huggingface.co/datasets/Xenova/cmu-arctic-xvectors-extracted/resolve/main/';

    static model_id = 'Xenova/speecht5_translation';
    static vocoder_id = 'Xenova/speecht5_hifigan';

    static tokenizer_instance = null;
    static model_instance = null;
    static vocoder_instance = null;

    static async getInstance(progress_callback = null) {
        if (this.tokenizer_instance === null) {
            this.tokenizer = AutoTokenizer.from_pretrained(this.model_id, { progress_callback });
        }

        if (this.model_instance === null) {
            this.model_instance = SpeechT5ForTextToSpeech.from_pretrained(this.model_id, {
                //quantized: false,
				dtype: 'fp32',
                progress_callback,
            });
        }
        if (this.vocoder_instance === null) {
            this.vocoder_instance = SpeechT5HifiGan.from_pretrained(this.vocoder_id, {
                //quantized: false,
				dtype: 'fp32',
                progress_callback,
            });
        }

        return new Promise(async (resolve, reject) => {
            const result = await Promise.all([
                this.tokenizer,
                this.model_instance,
                this.vocoder_instance,
            ]);
            self.postMessage({
                status: 'ready',
            });
            resolve(result);
        });
    }

    static async getSpeakerEmbeddings(speaker_id) {
        // e.g., `cmu_us_awb_arctic-wav-arctic_a0001`
        const speaker_embeddings_url = `${this.BASE_URL}${speaker_id}.bin`;
		////console.log("translation_worker2: speaker_embeddings_url: ", speaker_embeddings_url);
        const speaker_embeddings = new Tensor(
            'float32',
            new Float32Array(await (await fetch(speaker_embeddings_url)).arrayBuffer()),
            [1, 512]
        )
        return speaker_embeddings;
    }
}

// Mapping of cached speaker embeddings
const speaker_embeddings_cache = new Map();

*/

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


registerPromiseWorker(function (message) {
	console.log("registerPromiseWorker: translation worker got message: ", message);
	////console.log("WORKER: registerPromiseWorker: GOT MESSAGE: ", message); // { hello: 'world', answer: 42, 'this is fun': true }
	
	
	////console.log("TRANSLATION WORKER RECEIVED TASK");
	////console.log("TRANSLATION message: ", message);

	/*
	if(typeof event.data.cache_name == 'string'){
		////console.log("translation_worker: setting cache_name to: ", event.data.cache_name)
		cache_name = event.data.cache_name;
	}
	*/
	
	return new Promise((resolve, reject) => {
		try{
			
			if(typeof message.task != 'undefined' && message.task != null){
				console.log("TRANSLATION WORKER: received a task: ", message.task);
			
				//return {"error":"translation worker: this is a test"};
				/*
				if(typeof  message.task.source_text == 'string' &&  message.task.source_text.length){
					////console.log("TRANSLATION_WORKER: task has simple source_text property, using that as the input source_text: ",  message.task.source_text);
					source_text =  message.task.source_text; // simpler shortcut option for simple tasks
				}
				else 
				*/
				let source_text = null;
				let translated_property = null;
				let translated_property_index = null;
				
				self.running = true;
				self.interrupt = false;
				self.stop = false;
				
				////console.log("TRANSLATION WORKER: pre-existing pipelines: ", Object.keys(pipelines));
				
				if(typeof message.task.force_webgpu == 'boolean'){
					self.force_webgpu = message.task.force_webgpu;
				}
				
				if(typeof message.task.silent == 'boolean' && message.task.silent == true && typeof message.task.results != 'undefined' && Array.isArray(message.task.results) && message.task.results.length ){
					source_text = message.task.results[message.task.results.length - 1];
					translated_property = 'result';
					translated_property_index = message.task.results.length - 1;
					////console.log("TRANSLATION WORKER: translating result at index: ", translated_property_index);
				}
				
				else if(typeof message.task.q != 'undefined' && message.task.q.length == 0 && typeof message.task.silent != 'undefined' && typeof message.task.return_language == 'string' && Array.isArray(message.task.results) && message.task.results.length){
					source_text = message.task.results[message.task.results.length - 1];
					translated_property = 'result';
					translated_property_index = message.task.results.length - 1;
					////console.log("TRANSLATION WORKER: translating post-translation return journey result at index: ", translated_property_index);
				}
				
				
				else if(typeof message.task.text == 'string' && message.task.text.length){
					////console.log("TRANSLATION_WORKER: task had no source_text, but does have text. Using that as translation input. ",  message.task.text);
					source_text = message.task.text;
					translated_property = 'text';
				}
				else if(typeof message.task.original_prompt == 'undefined' && typeof message.task.prompt == 'string' && message.task.prompt.length){
					source_text = message.task.prompt;
					translated_property = 'prompt';
				}
				else if(typeof message.task.results != 'undefined' && Array.isArray(message.task.results) && message.task.results.length){
					source_text = message.task.results[message.task.results.length - 1];
					translated_property = 'result';
					translated_property_index = message.task.results.length - 1;
					////console.log("TRANSLATION WORKER: translating result at index: ", translated_property_index);
				}
				////console.log("source_text came from this task property: ", translated_property);
				
				console.log("translation worker: source_text: ", source_text);
				if(source_text){
					
					let input_language = null;
					if(typeof  message.task.input_language == 'string'){
						input_language =  message.task.input_language.toLowerCase();
					}
					let output_language = null;
					if(typeof  message.task.output_language == 'string'){
						output_language =  message.task.output_language.toLowerCase();
					}
					console.log("TRANSLATION WORKER: input_language: ", input_language);
					console.log("TRANSLATION WORKER: output_language: ", output_language);
		
					//await caches.open("transformers").then((my_cache) => my_cache.add('./tjs/transformers.js'));
			
					if(typeof input_language != 'string' || typeof output_language != 'string'){
						console.error("TRANSLATION WORKER: input or output language was null: ", input_language, output_language);
						
						self.postMessage({
							task: message.task,
							status: 'error',
							error: 'input or output language was not clear',
							translation: source_text
						});
						
						reject(false);
						return
					}
			
		
					
					let hf_model_url = 'Xenova/opus-mt-' + input_language + '-' + output_language;
					
					if(typeof message.task.translation_details != 'undefined' && message.task.translation_details != null){
						if(typeof message.task.translation_details.model == 'string'){
							console.log("TRANSLATION WORKER: found model name in translation_details: ", message.task.translation_details.model);
							hf_model_url = message.task.translation_details.model;
						}
					}
					
					// TEST
					//hf_model_url = 'Xenova/mbart-large-50-many-to-many-mmt';
					/*
						
let translator = await pipeline(
      "translation",
      "Xenova/mbart-large-50-many-to-many-mmt"
    );
					*/
					
					
					////console.log("TRANSLATION WORKER: hf_model_url: ", hf_model_url);
			
					function progressCallback(x){
						//console.log("translation worker: download progressCallback: ", x);
					    self.postMessage(x);
					}
					
					let previous_doc_cursor = 0;
					let done_so_far = '';
					let so_far = '';
					
					let ahead_text = '' + source_text;
					let constructed_text = '';
					//let previous_constructed_text = '';
					
					let work_text = '' + source_text;
					let to_go_part = '' + source_text;
					let old_text = '' + source_text;
					let new_text = '' + source_text;
					let sentences = [];
					if(typeof message.task.sentences_to_translate != 'undefined'){
						console.log("TRANSLATION WORKER: TASK HAS LIST OF PRE-SPLIT SENTENCES_TO_TRANSLATE: ", message.task.sentences_to_translate);
						sentences = message.task.sentences_to_translate;
					}
					else{
						sentences = extract_sentences(source_text,output_language);
						console.log("TRANSLATION WORKER: used extract_sentences. Sentences list is now: ", sentences);
					}
					console.warn("TRANSLATION WORKER: sentences to translate: ", sentences.length, sentences);
					let s = 0;
		
					const do_translation_loop = () => {
						console.warn("TRANSLATION WORKER: in do_translation_loop. s: ", s, " of ", sentences.length);
						
						if(self.interrupt){
							console.error("TRANSLATION WORKER: INTERRUPTED");
						    self.postMessage({
								task: message.task,
						        status: 'translation_interrupted',
								translated_property:translated_property,
								translated_property_index:translated_property_index,
								translation: constructed_text
						    });
							if(self.stop){
								clean_up();
								
							}
							reject(false);
						}
						else if(s < sentences.length){
							let sentence = sentences[s]; //.trim();
							
							
							
							
							
							s++;
							
							if(sentence.length > 1){
								if(ahead_text.indexOf(sentence) == -1){
									console.error("TRANSLATION WORKER: sentence to translate was not found in ahead_text:\nSENTENCE: ", sentence, "\nAHEAD_TEXT: ", ahead_text);
									self.postMessage({
										task: message.task,
										status: 'error',
										error: 'sentence to translate was not found: ' + sentence,
										ahead_text: ahead_text,
										translated_property:translated_property,
										translated_property_index:translated_property_index,
										translation: constructed_text
									});
									return
								}
								const pre_part = ahead_text.substr(0,ahead_text.indexOf(sentence));
								console.log("pre_part: -->" + pre_part + "<--");
								////console.log("next cursor with pre_part + sentence: ", ahead_text.indexOf(sentence) + sentence.length);
								ahead_text = ahead_text.substr(ahead_text.indexOf(sentence) + sentence.length);
								console.log("ahead text has shrunk to:  -->" +  ahead_text);
								//console.log("TRANSLATION WORKER: TRANSLATING: SENTENCE:", sentence);
								
								self.postMessage({
									task: message.task,
									translated_property:translated_property,
									translated_property_index:translated_property_index,
									sentences_count:s,
									sentences_total:sentences.length,
									status: 'translation_progress',
									sentence:sentence,
									sentence_selection:{'from': (constructed_text + pre_part).length, 'to': (constructed_text + pre_part + sentence).length}
								});
								
								let translation_settings = {};
								
								if(typeof input_language == 'string' && typeof output_language == 'string'){
									
									/* 
									
const pipe = await pipeline('translation', 'Helsinki-NLP/opus-mt-en-mul');
const result = await pipe(">>jpn<< I love pizza", {
    do_sample: false,
    num_beams: 1
});
									*/
									
									
									
									// Small fix for BART // Xenova/mbart-large-50-many-to-many-mmt
									if(hf_model_url.endsWith('mbart-large-50-many-to-many-mmt')){
										console.log("translation worker: looking up language code in bart_lookup table: " + input_language, bart_lookup);
										if(typeof self.bart_lookup[input_language] != 'undefined'){
											input_language = self.bart_lookup[input_language];
										}
										
										if(typeof self.bart_lookup[output_language] != 'undefined'){
											output_language = self.bart_lookup[output_language];
										}
									}
									
									
									// Small fix for M2M
									else if(hf_model_url.endsWith('m2m100_418M')){
										if(input_language == 'jp'){
											input_language  = 'jap';
										}
										if(output_language == 'jp'){
											output_language  = 'jap';
										}
									}
									
									
									
									if(hf_model_url.endsWith('-mul-en')){
										if(input_language.length != 3){
											console.error("-mul-en: input language code is too short: ", input_language);
											if(typeof message.task.translation_details != 'undefined' && typeof message.task.translation_details != null && typeof message.task.translation_details.language == 'string' && message.task.translation_details.language.length == 3){
												input_language = message.task.translation_details.language;
												console.error("-mul-en: input language code replaced with: ", input_language);
											}
										}
										if(input_language.length != 3){
											console.error("TRANSLATION WORKER: -mul-en: input language should be three letters long: ", input_language);
										}
										output_language = 'eng';
										
									}
									if(hf_model_url.endsWith('-en-mul')){
										if(output_language.length != 3){
											console.error("-mul-en: input language code is too short: ", output_language);
											if(typeof message.task.translation_details != 'undefined' && typeof message.task.translation_details != null && typeof message.task.translation_details.language == 'string' && message.task.translation_details.language.length == 3){
												output_language = message.task.translation_details.language;
												console.error("-en-mul: output language code replaced with: ", output_language);
											}
										}
										if(output_language.length != 3){
											console.error("TRANSLATION WORKER: -en-mul: output language should be three letters long: ", output_language);
										}
										input_language = 'eng';
										
									}
									
									// Open MT MUL (currently not used)
									if(hf_model_url.endsWith('-mul-en') || hf_model_url.endsWith('-en-mul')){
										/*
										if(input_language == 'en'){
											input_language = 'eng';
											if(output_language.length != 3){
												console.error("TRANSLATION WORKER: output language should be three letters long: ", output_language);
											}
										}
										if(output_language == 'en'){
											output_language = 'eng';
											if(input_language.length != 3){
												console.error("TRANSLATION WORKER: input language should be three letters long: ", input_language);
											}
										}
										*/
										/*
										if(input_language == 'ces'){
											input_language = 'ce';
											if(output_language.length != 3){
												console.error("TRANSLATION WORKER: CES test: ", input_language, " -> ", output_language);
											}
										}
										*/
										
										if(hf_model_url.endsWith('-mul-en')){
											////console.log("TRANSLATION WORKER: MUL -> EN");
											sentence = '>>' + input_language + '<< ' + sentence;
										}
										else if(hf_model_url.endsWith('-en-mul')){
											////console.log("TRANSLATION WORKER: EN -> MUL");
											sentence = '>>' + output_language + '<< ' + sentence;
										}
										
									}
									else{
										//translation_settings['src_lang'] = 'en_XX' //input_language;
										//translation_settings['tgt_lang'] = 'nl_XX' //output_language;
										translation_settings['src_lang'] = input_language //input_language;
										translation_settings['tgt_lang'] = output_language //output_language;
									}
									
								}
								
								
								
								console.log("TRANSLATION_WORKER: hf_model_url: ", hf_model_url);
								console.log("TRANSLATION_WORKER: translation_settings: ", translation_settings);
								
								//translation_settings['src_lang'] = 'en_XX' //input_language;
								//translation_settings['tgt_lang'] = 'nl_XX' //output_language;
								
								// final cleaning of the string before translating it
								sentence = sentence.replaceAll('\"','"');
								sentence = sentence.replaceAll('\t','  ');
								//sentence = sentence.trim();
								//console.log("trimmed sentence: -->" + sentence + "<--");
								
								console.log("TRANSLATION WORKER: TRANSLATING: FINAL SENTENCE:", sentence);
								
								
								pipelines[hf_model_url].pipe(sentence,translation_settings)
								.then((translation) => {
									console.log("\nTRANSLATION WORKER: TRANSLATED! \nfrom: ", sentence, "\n to: ", translation, "\n");
									try{
										console.log("translation[0].translation_text: ", translation[0].translation_text);
									}
									catch(err){
										console.error("translation result was not an array: ", err);
									}
									
									let extra_space = '';
									if((constructed_text + pre_part).length && !(constructed_text + pre_part).endsWith(' ') && !(constructed_text + pre_part).endsWith('\n') && !translation[0].translation_text.startsWith(' ') && translation[0].translation_text.length && !translation[0].translation_text.startsWith('\n')){
										console.log("translation worker: injecting an extra space");
										extra_space = ' ';
									}
									
									
									self.postMessage({
										task: message.task,
										translated_property:translated_property,
										translated_property_index:translated_property_index,
										sentences_count:s,
										sentences_total:sentences.length,
										status: 'chunk',
										input_sentence:sentence,
										output_sentence:translation[0].translation_text,
										response_so_far:constructed_text + pre_part,
										pre_part:pre_part,
										chunk:pre_part + extra_space + translation[0].translation_text,
										old_text:constructed_text,
										new_text:constructed_text + pre_part + extra_space + translation[0].translation_text,
									});
									
									constructed_text += pre_part;
									
									if(typeof pre_part == 'string' && typeof translation[0].translation_text == 'string'){
										console.log("TRANSLATION WORKER: JOINING:  ", pre_part + "-XXX-" + translation[0].translation_text.substr(0,10) + "...");
									}
									
									
									
									constructed_text = constructed_text + extra_space + translation[0].translation_text;
									//previous_constructed_text = constructed_text;
									////console.log("NEW constructed_text: ", constructed_text);
									do_translation_loop();
									return
								
								})
								.catch((err) => {
									console.error("TRANSLATION WORKER: pipe: caught translation error. err: ", err);
									self.postMessage({
										task: message.task,
										status: 'error',
										error: '' + err,
										translated_property:translated_property,
										translated_property_index:translated_property_index,
										translation: constructed_text
									});
									reject(err);
								})
								
							}
							else{
								console.warn("TRANSLATION WORKER: Sentence was too short to translate? sentence: ", sentence);
								if(s + 1 < sentences.length){
									do_translation_loop();
								}
								else if(s == 0){
									// basically no sentences to translate
									self.postMessage({
										task:  message.task,
										status: 'error',
										error: 'Sentence was too short to translate, and no other sentences remain'
									});
									reject(false);
								}
								else{
									reject(false);
								}
								return
							}
						}
						else{
							////console.log("TRANSLATION WORKER: PROCESSED ALL SENTENCES");
							self.running = false;
						    self.postMessage({
								task: message.task,
						        status: 'translation_complete',
								translated_property:translated_property,
								translated_property_index:translated_property_index,
								translation: constructed_text
						    });
							
							resolve(constructed_text);
							
						}
					}
					
		
				
				    //let pipe = await pipeline('translation', 'Xenova/opus-mt-nl-en'); // ,{ dtype: 'fp32' }
			
					if(typeof pipelines[hf_model_url] == 'undefined'){
						console.log("translation worker: creating new pipeline");
						// Clear any old pipelines
						// TODO: could allow two recently used pipelines to remain active, or adjust this based on the amound of system ram
						// Having two pipelines persist might be nice for translating back and forth between two languages
						////console.log("TRANSLATION WORKER: clearing pipelines dict first:", pipelines);
						//pipelines = {}; // TODO: if memory permits, could allow more than one pipeline to remain loaded
						let existing_pipelines = Object.keys(pipelines);
						if(existing_pipelines.length > 1 && existing_pipelines.indexOf(hf_model_url) == -1){
							console.warn("TRANSLATION WORKER: already two pipelines in memory, deleting a pipeline: ", '' + existing_pipelines[0], " of: ", '' + JSON.stringify(existing_pipelines));
							delete pipelines[existing_pipelines[0]];
						}
						
						/*
						let dtype_settings = {
				        	embed_tokens: self.supports_web_gpu16 ? 'fp16' : 'fp32', // or 'fp32'
				            vision_encoder: self.supports_web_gpu16 ? 'fp16' : 'fp32', // or 'q8'
				            decoder_model_merged: 'q4', // or 'q4f16' or 'q8'
						}
						*/
						let dtype_settings
						
						if( (self.supports_web_gpu16 || self.supports_web_gpu32) && hf_model_url.indexOf('opus-mt-') != -1){
							
							dtype_settings = self.supports_web_gpu16 ? 'fp16' : 'fp32'; //'fp16';
							console.log("translation worker: setting DTYPE to give Opus MT translation a speeed boost.  dtype_settings: ", dtype_settings);
						}
						
						let actual_device = self.device;
						
						//if(hf_model_url.endsWith('-mul-en') || hf_model_url.endsWith('-en-mul')){
						if( self.force_webgpu == false && (hf_model_url.endsWith('m2m100_418M') || hf_model_url.endsWith('mbart-large-50-many-to-many-mmt') ) ){
							console.log("translation worker: forcing WASM pipeline for translation model: ", hf_model_url);
							env.backends.onnx.wasm.proxy = true;
							actual_device = 'wasm';
							//dtype_settings = 'fp32';
						}
						else{
							env.backends.onnx.wasm.proxy = self.device !== 'webgpu';
						}
						
						
						console.log("translation worker:  actual_device,hf_model_url: ", actual_device, hf_model_url);
						
						// let pipe = 
						pipeline(
							'translation', 
							hf_model_url, 
							{
			                	
			    				//dtype: dtype_settings, // { dtype: 'fp32' }
			    				device: actual_device,
								//quantized: true,
								progress_callback: progressCallback,
			            	},
			    			
						)
						.then((pipe) => {
							console.log("TRANSLATION WORKER: MADE PIPE");
							console.log("TRANSLATION WORKER: pipeline_constructed.  pipe, sentences: ", pipe, sentences);
					
							self.postMessage({
								task: message.task,
								status: 'pipeline_constructed'
							});
					
							pipelines[hf_model_url] = {'pipe':pipe,'last_used':Date.now()}
							do_translation_loop();
				
						})
						.catch((err) => {
							console.error("TRANSLATION WORKER: caught pipeline_construction error. err: ", err);
							if( ('' + err).indexOf('no available backend found') != -1){
								console.error("TRANSLATION WORKER: likely no internet to download translation model");
							
								self.postMessage({
									task:  message.task,
									status: 'download_required'
								});
							
							}
							
							self.postMessage({
								task:  message.task,
								status: 'error',
								error: '' + err
							});
							reject(err);
						})
					}
			
					else{
						console.log("TRANSLATION_WORKER: USING PRE_MADE PIPELINE");
						
						// hf_model_url.endsWith('-mul-en') || hf_model_url.endsWith('-en-mul') || 
						
						
						if(self.force_webgpu == false && (hf_model_url.endsWith('m2m100_418M') || hf_model_url.endsWith('mbart-large-50-many-to-many-mmt') ) ){
							console.log("translation worker: forcing WASM proxy to true");
							env.backends.onnx.wasm.proxy = true;
						}
						else{
							env.backends.onnx.wasm.proxy = self.device !== 'webgpu';
						}
						
						do_translation_loop();
						
					}

				}
				else{
					////console.log("TRANSLATION WORKER: TEXT/PROMPT TO TRANSLATE MISSING, NOT LONG ENOUGH, OR INVALID: ", message.task);
					//postMessage({"error":"Invalid source_text provided",'task': message.task});
					reject({"error":"Invalid source_text provided","task": message.task})
				}
		
		
				//postMessage({'translation_data': message});
				//postMessage( message);
	
			}
			else{
				console.error("TRANSLATION WORKER: no valid task provided");
				//postMessage({"error":"No valid task object provided"});
				reject({"error":"No valid task object provided"});
			}
		
		}
		catch(err){
			console.error("TRANSLATION WORKER: CAUGHT GENERAL ERROR: ", err);
		}
		
	});
	
	
});


/*

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
	
	////console.log("TRANSLATION WORKER RECEIVED TASK");
	////console.log("TRANSLATION event.data: ", event.data);
	
	if(typeof event.data.cache_name == 'string'){
		////console.log("translation_worker: setting cache_name to: ", event.data.cache_name)
		cache_name = event.data.cache_name;
	}
	
	let source_text = null;
	if(typeof event.data.task == 'object'){
		////console.log("TRANSLATION WORKER: received a task: ",  event.data.task);
		
		
		if(typeof event.data.task.source_text == 'string' && event.data.task.source_text.length){
			////console.log("TRANSLATION_WORKER: task has simple source_text property, using that as the input source_text: ", event.data.task.source_text);
			source_text = event.data.task.source_text; // simpler shortcut option for simple tasks
		}
		else if(typeof event.data.task.text == 'string' && event.data.task.text.length){
			////console.log("TRANSLATION_WORKER: task had no source_text, but does have text. Using that as translation input. ", event.data.task.text);
			source_text = event.data.task.text;
		}
		if(source_text != null){
			////console.log("TRANSLATION WORKER: OK, source_text was not null: ", source_text);
			
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
				////console.log("translation worker: progressCallback: ", x);
			    self.postMessage(x);
			}
			
			
		    //let pipe = await pipeline('translation', 'Xenova/opus-mt-nl-en'); // ,{ dtype: 'fp32' }
			let pipe = await pipeline('translation', hf_model_url, {
                progress_callback: progressCallback
            }); // ,{ dtype: 'fp32' }

			
			
		    let translation = await pipe("Wat is de hoofdstad van Frankrijk?");
		    //console.log("translation worker: ", translation);
			
		    self.postMessage({
				task: event.data.task,
		        status: 'complete',
				translation: translation
		    });
			
			
			
		
			
		}
		else{
			////console.log("TRANSLATION WORKER: TEXT TO TRANSLATE NOT LONG ENOUGH OR INVALID: ", source_text);
			postMessage({"error":"Invalid source_text provided",'task':event.data.task});
			return
		}

		//postMessage({'translation_data':event.data});
		//postMessage(event.data);
		
	}
	else{
		console.error("TRANSLATION WORKER: no valid task provided");
		postMessage({"error":"No valid task object provided"});
		return
	}
	
});

*/


async function clean_up(){
	for(let p = 0; p < pipelines.length; p++){
		console.log("translation worker: should unload this translation pipeline: ", p, pipelines[p]);
		if(typeof pipelines[p].dispose == 'function'){
			await pipelines[p].dispose();
		}
	}

	self.postMessage({
		task: self.task,
		status: 'translation_worker_stopped',
	});
	self.task = null;
	self.stop = false;
}


addEventListener('message', async (event) => {
	console.log("TRANSLATION WORKER: received non-promise message?  event.data: ", event.data);
	
    const message = event.data;
	
	if(typeof message.action == 'string'){
		
		// Interrupt
		if(message.action == 'interrupt' && self.running){
			console.log("translation worker: setting interrupt to true");
			self.interrupt = true;
		}
		
		// Stop
		else if(typeof message.action == 'stop'){
			console.log("translation worker: action was STOP");
			if(self.running){
				self.stop = true;
				self.interrupt = true;
			}
			else{
				clean_up();
			}
		}
	}
	
});





postMessage({"status":"exists"});
import { AutoTokenizer, MusicgenForConditionalGeneration, BaseStreamer, StoppingCriteria, env } from './tjs/transformers.min.js';

try{
	//import wavefile from './wavefile.js';
	//import { wavefile } from './js/wavefile.js';
	//var wav = new wavefile.WaveFile();
	//console.log("wavefile wav: ", wav);
}
catch(e){
	console.error("WHY DOES THIS FAIL? ", e);
}


//console.log("HELLO FROM MUSICGEN WORKER");


// Do local model checks
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;


self.device = 'wasm';
self.supports_web_gpu16 = false;
self.supports_web_gpu32 = false;

self.task = null;
self.busy_generating = false;



class InterruptableStoppingCriteria extends StoppingCriteria {
  constructor() {
    super();
    this.interrupted = false;
  }

  interrupt() {
    this.interrupted = true;
  }

  reset() {
    this.interrupted = false;
  }

  _call(input_ids, scores) {
    return new Array(input_ids.length).fill(this.interrupted);
  }
}

const stopping_criteria = new InterruptableStoppingCriteria();



function minFramesForTargetMS(targetDuration, frameSamples, sr = 16e3) {
  return Math.ceil(targetDuration * sr / 1e3 / frameSamples);
}
function arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}


function encodeWAV(samples, format = 3, sampleRate = 16e3, numChannels = 1, bitDepth = 32) {
  var bytesPerSample = bitDepth / 8;
  var blockAlign = numChannels * bytesPerSample;
  var buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  var view = new DataView(buffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * bytesPerSample, true);
  if (format === 1) {
    floatTo16BitPCM(view, 44, samples);
  } else {
    writeFloat32(view, 44, samples);
  }
  return buffer;
}
function writeFloat32(output, offset, input) {
  for (var i = 0; i < input.length; i++, offset += 4) {
    output.setFloat32(offset, input[i], true);
  }
}
function floatTo16BitPCM(output, offset, input) {
  for (var i = 0; i < input.length; i++, offset += 2) {
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 32768 : s * 32767, true);
  }
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; ++i) {
        view.setUint8(offset + i, string.charCodeAt(i))
    }
}




class CallbackStreamer extends BaseStreamer {
  constructor(callback_fn) {
    super();
    this.callback_fn = callback_fn;
  }

  put(value) {
    return this.callback_fn(value);
  }

  end() {
    return this.callback_fn();
  }
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
		console.error('Promise worker caught an error:',error);
        //const error_string = '' + error.error;
		//console.error("error string: ", typeof error_string, error_string);
        //postMessage({'task':self.task,'status':'error','error':error_string});
		postMessage(error);
      }
      postMessage([messageId, {
        task:self.task,
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
	  console.log("registerPromiseWorker: in handleIncomingMessage")
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


console.log("MUSICGEN (PROMISE) WORKER EXISTS");
//console.log("MUSICGEN (PROMISE) WORKER: registerPromiseWorker: ", registerPromiseWorker);



// Load tokenizer
//self.tokenizer = AutoTokenizer.from_pretrained('Xenova/musicgen-small');

// Prepare for model
self.model = null;
self.tokenizer = null;
self.duration = 30;
self.guidance_scale = 3;
self.temperature = 1;

registerPromiseWorker((message) => {
	console.log("MUSICGEN WORKER: registerPromiseWorker: RECEIVED MESSAGE: ", message);
	
	try{
		return new Promise((resolve, reject) => {
	
			self.task = null;
	
			const do_musicgen = (sentence) => {
				console.log("MUSICGEN WORKER: in do_musicgen. sentence: ", sentence);
				
				self.postMessage({
					'status':'ready'
				});
				
				if(sentence == 'papegai_preload'){
					console.log("MUSICGEN WORKER: prompt was papegai_preload. Stopping here.")
					const preload_done_message = {
						'task':message.task,
						'status':'preloaded'
					}
					self.postMessage(preload_done_message);
					resolve(preload_done_message);
					return
				}
				
				const max_length = Math.min(
					Math.max(Math.floor(self.duration * 50), 1) + 4,
					self.model.generation_config.max_length ?? 1500,
				);
				
				const inputs = self.tokenizer(sentence);
				
				function generationProgressCallback(x){
					//console.log("musicgen worker: generationProgressCallback: ", x);
				    self.postMessage(x);
				}
				
				let num_tokens = 0;
				const streamer = new CallbackStreamer((value) => {
					try{
						//console.log("MUSICGEN WORKER: in callback streamer. value: ", value);
						const percent = value === undefined ? 1 : ++num_tokens / max_length;
						//console.log("MUSICGEN WORKER: streamer: percent: ", percent);
						self.postMessage({
							'task':message.task,
							'status':'musicgen_progress',
							'progress':percent
						});
					}
					catch(err){
						console.error("musigen_worker: caught error in callback streamer: ", err);
					}
					//setStatusText(`Generating (${(percent * 100).toFixed()}%)...`);
					//setProgress(percent * 100);
				});
				
				const guidance_scale = self.guidance_scale;
				const temperature = self.temperature;
				
				self.model.generate({
					// Inputs
					...inputs,

	     		   // Generation parameters
					max_length, // duration, as number of tokens.
					guidance_scale,
					temperature,

					// Outputs
					streamer,
					//stopping_criteria,
				})
				.then((audio_values) => {
					//console.log("MUSICGEN WORKER: \n\ngenerated audio_values: ", audio_values);
					//console.warn("MUSICGEN WORKER: audio_values.data: ", audio_values.data);
					// console.log("audio_values.ort_tensor.cpuData: ", audio_values.ort_tensor.cpuData);
					
					if(audio_values.data){
					    const wav = encodeWAV(audio_values.data, 3, 32000, 1, 32);

					    // Send the output back to the main thread
						let result = {
							task: message.task,
					        status: 'complete',
							big_audio_array: audio_values.data,
					        wav_blob: new Blob([wav], { type: 'audio/wav' }),
					    }
					    self.postMessage(result);
						self.busy_generating = false;
						self.task = null;
						resolve(result);
					}
					else{
						console.error("MUSICGEN WORKER: issue getting audio_values.data? audio_values:", audio_values);
						reject({"status":"error","error":"Caught error: missing audio_values.data?","task": message.task});
					}
				    
				})
				.catch((err) => {
					console.error("MUSICGEN_WORKER: caught error generating audio_values: ", err);
					reject({"status":"error","error":"Caught error generating audio values or wav file","task": message.task});
					self.busy_generating = false;
					self.task = null;
					return err
				})
				
				
			}
	
	
			let sentence = null;
			if(typeof message.task == 'object'){
				console.log("MUSICGEN WORKER: received a task: ", message.task);
				
				if(self.busy_generating){
					reject({"status":"already_busy", "error":"musigen worker already busy"});
					return false
				}
				self.busy_generating = true;
				
				self.task = message.task;
				
				self.temperature = 1;
				if(typeof message.task.temperature == 'number'){
					//console.log("MUSICGEN WORKER: got temperature from task: ",   message.task.temperature);
					self.temperature = message.task.temperature;
				}
				self.guidance_scale = 3;
				if(typeof message.task.guidance_scale == 'number'){
					//console.log("MUSICGEN WORKER: got guidance_scale from task: ",   message.task.guidance_scale);
					self.guidance_scale = message.task.guidance_scale;
				}
				self.duration = 30;
				if(typeof message.task.music_duration == 'number' && message.task.music_duration > 1 && message.task.music_duration < 31){
					//console.log("MUSICGEN WORKER: got intended music duration from task: ",   message.task.music_duration);
					self.duration = message.task.music_duration;
				}

				if(typeof message.task.prompt == 'string' &&  message.task.prompt.length){
					//console.log("MUSICGEN_WORKER: task has prompt, using that as the input sentence: ",  message.task.prompt);
					sentence = message.task.prompt; // simpler shortcut option for simple tasks
				}
				else if(typeof message.task.sentence == 'string' &&  message.task.sentence.length){
					//console.log("MUSICGEN_WORKER: task had no prompt, but does have sentence. Using that as musicgen input. ",  message.task.sentence);
					sentence =  message.task.sentence;
				}
				else if(typeof  message.task.text == 'string' &&  message.task.text.length){
					//console.log("MUSICGEN_WORKER: task had no sentence, but does have text. Using that as musicgen input. ",  message.task.text);
					sentence =  message.task.text;
				}
		
				
				if(typeof sentence == 'string' && sentence.length){
					//console.log("MUSICGEN WORKER: OK, sentence was string with length: ", sentence);
			
					
					// Progress callback
					/*
					function progressCallback(x){
						//console.log("musicgen worker: progressCallback: ", x);
					    self.postMessage(x);
					}
					*/
					
					
					if(self.tokenizer == null || self.model == null){
						
						AutoTokenizer.from_pretrained('Xenova/musicgen-small')
						.then((tokenizer) => {
							self.tokenizer = tokenizer;
							
							if(self.device == 'wasm'){
								return MusicgenForConditionalGeneration.from_pretrained('Xenova/musicgen-small', {
							        progress_callback: (progress_data) => {
										//console.log("MUSICGEN WORKER: model download progress_callback: progress_data: ", progress_data);
							          	if (progress_data.status !== 'progress') return;
										//setLoadProgress(prev => ({ ...prev, [data.file]: data }))
										///setLoadProgress(data);
										self.postMessage(progress_data);
							        },
							        dtype: {
							          text_encoder: 'q8',
							          decoder_model_merged: 'q8',
							          encodec_decode: 'fp32',
							        },
							        device: 'wasm',
					    		});
							}
							else{
								return MusicgenForConditionalGeneration.from_pretrained('Xenova/musicgen-small', {
							        progress_callback: (progress_data) => {
										//console.log("MUSICGEN WORKER: model download progress_callback: progress_data: ", progress_data);
							          	if (progress_data.status !== 'progress') return;
										//setLoadProgress(prev => ({ ...prev, [data.file]: data }))
										///setLoadProgress(data);
										self.postMessage(progress_data);
							        },
							        dtype: {
							          text_encoder: 'q8',
							          decoder_model_merged: 'q8',
							          encodec_decode: 'fp32',
							        },
							        device: 'webgpu',
					    		});
							}
							
							
						})
						.then((model) => {
							//console.log("MUSICGEN WORKER: created model: ", model);
							self.model = model;
							do_musicgen(sentence);
						
						})
						.catch((err) => {
							console.error("MUSICGEN_WORKER: caught error creating tokenizer: ", err);
							reject({"status":"error", "error":"Caught error creating MusicGen tokenizer or model: " + err, "task": message.task});
							self.busy_generating = false;
							self.task = null;
							return err
						})
					}
					else{
						do_musicgen(sentence);
					}
					
				
				}
				else{
					//console.log("MUSICGEN WORKER: PROMPT TO GENERATE MUSIC FROM NOT LONG ENOUGH OR INVALID: ", sentence);
					//postMessage({"error":"Invalid sentence provided",'task': message.task});
					reject({"error":"Invalid sentence provided","task": message.task});
					self.busy_generating = false;
					self.task = null;
				}
		
			}
			else{
				console.error("MUSICGEN WORKER: no valid task provided");
				//postMessage({"error":"No valid task object provided"});
				reject({"error":"No valid task object provided"});
				self.busy_generating = false;
				self.task = null;
			}
		
		});
	}
	catch(err){
		console.error("CAUGHT GENERAL MUSICGEN WORKER ERROR:", err);
		self.busy_generating = false;
		self.task = null;
	}

});



// Listen for messages from the main thread
self.addEventListener('message', async (e) => {
    const { action } = e.data;
	
	console.log("musicgen_worker: received non-promise-worker message: ", e.data);

    switch (action) {
		/*
        case 'load':
            load();
            break;

        case 'generate':
            stopping_criteria.reset();
            generate(data);
            break;
		*/

        case 'interrupt':
			//console.log("musicgen_worker:  doing stopping_criteria.interrupt");
            stopping_criteria.interrupt();
			postMessage({'task':self.task,'action':'interrupt'});
			self.task = null;
            break;

        case 'stop':
            stopping_criteria.reset();
			if(self.model != null){
				//console.log("musicgen worker: disposing of model");
				await self.model.dispose();
			}
			postMessage({'task':self.task,'action':'stop'});
			self.task = null;
            break;
    }
});


async function check_gpu(){
	// CHECK WEB GPU SUPPORT
	
    if (!navigator.gpu) {
		//console.error("MUSICGEN WORKER: WebGPU not supported.");
    }
	else{
		//console.error("MUSICGEN WORKER: navigator.gpu exists: ", navigator.gpu);
		const adapter = await navigator.gpu.requestAdapter();
		console.error("MUSICGEN WORKER:  adapter,adapter.features: ", adapter, adapter.features);
		if (typeof adapter != 'undefined' && adapter != null && typeof adapter.features != 'undefined') {
			if(adapter.features.has("shader-f16")){
				//web_gpu_supported = true;
				self.supports_web_gpu16 = true;
				
				if (navigator.gpu.wgslLanguageFeatures && !navigator.gpu.wgslLanguageFeatures.has("packed_4x8_integer_dot_product")) {
					//console.log(`MUSICGEN WORKER: webgpu DP4a built-in functions are not available`);
				}
			}
			else{
				console.warn("MUSICGEN WORKER: Web GPU: 16-bit floating-point value support is not available");
				//web_gpu32_supported = true;
				self.supports_web_gpu32 = true;
			}
		}
		else{
			console.error("MUSICGEN WORKER: querying WebGPU was not a success");
		}
    }
	
}

//await check_gpu();
console.error("MUSICGEN WORKER:  self.supports_web_gpu16, self.supports_web_gpu32: ", self.supports_web_gpu16, self.supports_web_gpu32);

if(self.supports_web_gpu16 || self.supports_web_gpu32){
	//console.log("MUSICGEN WORKER: WEBGPU SUPPORTED");
	self.device = 'webgpu';
}






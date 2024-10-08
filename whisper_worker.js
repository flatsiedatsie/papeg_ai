import { 
	pipeline, 
	env, 
	AutoTokenizer,
	AutoProcessor, 
	AutoModel, 
	AutoModelForAudioFrameClassification,
	//TextStreamer,
	WhisperTextStreamer,
    WhisperForConditionalGeneration,
    full,
} from './tjs/transformers.min.js';

//console.log("WHISPER WEB WORKER EXISTS");







const MAX_NEW_TOKENS = 64;
// 

// https://github.com/xenova/whisper-web/blob/experimental-webgpu/src/worker.js
// uses:
// WhisperTextStreamer

//console.log("WHISPER WEB WORKER EXISTS");

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

self.device = 'webgpu';
let gpu_checked = false;
env.backends.onnx.wasm.proxy = false;

self.supports_web_gpu16 = false;
self.supports_web_gpu32 = false;

//self.output_so_far = '';
self.task = null;

let processing = false;
self.busy_transcribing = false;
self.busy_loading = false;

self.busy_disposing_models = false;
self.was_disposed = false;
self.segmentation_loaded = null;
self.quantized = null;
self.current_model_preferences = null;
self.current_asr_model_id = null;

self.is_mobile = false;
self.segmentation_preferences = {};

self.speaker_translation = 'Speaker';

self.fingerprints = [];
self.fingerprint_matches = {};
let next_fingerprints_id = 1;
self.matches = [];

let recorded_audio_length = 0;
let total_duration_time = null;

self.interrupted = false;

self.start_time = null;

self.similarity_threshold = 0.965;
self.perfect_simillarity_threshold = 0.975;
self.minimal_verification_duration = 2000;

/*
self.transcribot = null;
self.segmentation_processor = null;
self.segmentation_model = null;
self.verification_processor = null;
self.verification_model = null;
*/

//self.chunks_to_verify = [];
let segment_index = 0;

self.last_used_preferences = null;
self.last_used_segmentation = null;



let PER_DEVICE_CONFIG = {
    webgpu: {
        dtype: {
            encoder_model: 'fp32',
            decoder_model_merged: 'q4', // 'fp32', //
        },
        device: 'webgpu',
    },
    wasm: {
        dtype: 'q8',
        device: 'wasm',
    },
};




/*
// From Transformers.js V2 demo: https://github.com/xenova/whisper-web/blob/main/src/utils/Constants.ts
export default {
    SAMPLING_RATE: 16000,
    DEFAULT_AUDIO_URL: `https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/${
        isMobileOrTablet ? "jfk" : "ted_60_16k"
    }.wav`,
    DEFAULT_MODEL: "Xenova/whisper-tiny",
    DEFAULT_SUBTASK: "transcribe",
    DEFAULT_LANGUAGE: "english",
    DEFAULT_QUANTIZED: isMobileOrTablet,
    DEFAULT_MULTILINGUAL: false,
};
*/



function delay(millisec) { 
    return new Promise(resolve => { 
        setTimeout(() => { resolve('') }, millisec); 
    }) 
}







// Define model factories
// Ensures only one model is created of each type
class PipelineFactory {
//class AutomaticSpeechRecognitionPipelineFactory {
	//static task = null;
	static task = null; //"automatic-speech-recognition";
    static model = null; //'onnx-community/whisper-small.en_timestamped';
	static instance = null;
	
	//static model_id = 'onnx-community/whisper-tiny.en_timestamped';
    static quantized = null;
    
	
	
    constructor(tokenizer, model, quantized) {
		//console.log("in pipelineFactory constructor.  tokenizer, model, quantized: ", tokenizer, model, quantized);
		//console.log("pipelineFactory: in constructor");
        this.tokenizer = tokenizer;
        this.model = model;
        //this.quantized = quantized;
    }
	
	
	
	static instance_exists(){
		console.log("returning if instance exists");
		return this.instance != null;
	}
	
	static set_to_null(var_to_null=null) {
		if(typeof var_to_null == 'string' && typeof this[var_to_null] != 'undefined'){
			this[var_to_null] = null;
			console.log("ASR PipelineFactory: set_to_null: ", var_to_null);
		}
	}
	
	
	
    static async getInstance(progress_callback=null, model_id=null, quantized=null, preferences={}) {
		console.log("ASR: getInstance: model_id,quantized,preferences: ", model_id, quantized, preferences);
		
		if(typeof model_id == 'string'){
			console.log("using provided model_id string: ", model_id);
			this.model = model_id;
		}
		else if(typeof this.model != 'string'){
			this.model = 'onnx-community/whisper-tiny.en_timestamped';
		}
		
		this.quantized = quantized;
		
		
		// TODO DEBUG
		this.quantized = true;
		
		//this.model = model_id;
		
		//this.quantized = quantized;
		
		console.log("\n\npipelineFactory: getInstance");
		console.log("- this.task: ", this.task);
		//console.log("- this.model_id: ", this.model_id);
		console.log("- this.model: ", this.model);
		console.log("- this.quantized: ", this.quantized);
		console.log("- self.device: ", self.device);
		
		
		
		
		//let MY_PER_DEVICE_CONFIG = {...PER_DEVICE_CONFIG[self.device], ...preferences};
		
		/*
		MY_PER_DEVICE_CONFIG['progress_callback'] = (x) => {
			console.log("got progress callback: ", x);
		}
		*/
		
		//console.log("- MY_PER_DEVICE_CONFIG: ", JSON.stringify(MY_PER_DEVICE_CONFIG,null,4));
		
		/*
			{
                dtype: {
                    encoder_model:
                        this.model_id === "onnx-community/whisper-large-v3-turbo"
                            ? "fp16"
                            : "fp32",
                    decoder_model_merged: "fp32", //"q4", // or 'fp32' ('fp16' is broken)
                },
                device: "webgpu",
                progress_callback,
            }
			
			
		*/
		//const device = '' + self.device;
		//const dtype = JSON.parse(JSON.stringify(MY_PER_DEVICE_CONFIG.dtype));
		//console.log("dtype: ", dtype);
		
		//this.model = 'onnx-community/whisper-large-v3-turbo';
        if (this.instance === null) {
			console.log("PipelineFactory: this.instance was null, creating pipeline promise.  this.task, this.model_id: ", this.task, this.model);
			
			/*
            this.instance = pipeline(this.task, this.model_id, {
            	dtype:PER_DEVICE_CONFIG[self.device].dtype,
				device:device,
				progress_callback:progress_callback,
            });
			*/
			
			if(self.device == 'webgpu'){
	            this.instance = pipeline(this.task, this.model, {
				    "dtype": {
				        "encoder_model": "fp32",
				        "decoder_model_merged": "q4" // "fp32" //
				    },
				    "device": "webgpu",
					"quantized":true,
					progress_callback
				});
			}
			else{
	            this.instance = pipeline(this.task, this.model, {
				    "dtype": "q8",
				    "device": "wasm",
					progress_callback
				});
			}
			
        }
		else{
			//console.log("ASR pipeline getInstance: this.instance already existed: ", this.instance);
		}

		//console.log("PipelineFactory: returning this.instance: ", this.instance);
        return this.instance;
    }
}

/*
self.addEventListener("message", async (event) => {
    const message = event.data;

    // Do some work...
    // TODO use message data
    let transcript = await transcribo(message);
    if (transcript === null) return;

    // Send the result back to the main thread
    self.postMessage({
        status: "complete",
        data: transcript,
    });
});
*/



class AutomaticSpeechRecognitionPipelineFactory extends PipelineFactory {
    static task = "automatic-speech-recognition";
	static model = null;
    static quantized = null;
}





class SegmentationSingleton {
    
    static instance = null;
	
	//static asr_model_id = 'onnx-community/whisper-base_timestamped';
    //static asr_instance = null;
	//static asr_preferences = null;

    static segmentation_model_id = 'onnx-community/pyannote-segmentation-3.0';
    static segmentation_instance = null;
    static segmentation_processor = null;
	static loaded_segmentation = false;
	
	static verification_model_id = 'Xenova/wavlm-base-plus-sv'; // Xenova/wavlm-base-plus-sv
    //static verification_model_id = 'onnx-community/wespeaker-voxceleb-resnet34-LM';
    static verification_instance = null;
    static verification_processor = null;
	

	//static asr_exists(){
	//	return this.asr_instance != null;
	//}
	/*
	static get_asr_model_id(){
		return this.asr_model_id;
	}
	*/
	static instance_exists(){
		return this.segmentation_instance != null;
	}
	
	static set_to_null(var_to_null=null){
		if(typeof var_to_null == 'string' && typeof this[var_to_null] != 'undefined'){
			this[var_to_null] = null;
			console.log("SegmentationSingleton: set_to_null: ", var_to_null);
		}
	}


    //static async getInstance(progress_callback=null,model_name='onnx-community/whisper-base_timestamped',preferences={},load_segmentation=true) {
	static async getInstance(progress_callback=null,preferences={}) {
		console.log("Whisper_worker: SegmentationSingleton: getInstance");
		/*
		let should_update_asr = false;
		if(this.asr_instance == null || this.asr_model_id != model_name || this.asr_preferences == null || (typeof this.asr_preferences == 'string' && JSON.stringify(preferences) != this.asr_preferences) ){    // || load_segmentation != this.loaded_segmentation){
			should_update_asr = true;
			self.current_asr_model_id = model_name;
			
			if(this.asr_instance != null){
				console.warn("OLD WHISPER ASR MODEL HAS TO BE DISPOSED FIRST!  this.asr_instance: ", this.asr_instance);
				console.warn("this.asr_model_id != model_name?: ", this.asr_model_id, " -> ", model_name);
				console.warn("this.asr_preferences != preferences?: ", this.asr_preferences, " -> ", JSON.stringify(preferences));
				await this.dispose('all');
				
				
				//this.asr_instance = null;
			}
			this.asr_preferences = JSON.stringify(preferences);
		}
		*/
		
		//this.asr_model_id = model_name;
		this.loaded_segmentation = true

		console.error("singleton: creating segmentation instances");
		
        this.segmentation_processor ??= AutoProcessor.from_pretrained(this.segmentation_model_id, {
			...preferences,
            progress_callback,
        });
        this.segmentation_instance ??= AutoModelForAudioFrameClassification.from_pretrained(this.segmentation_model_id, {
            // NOTE: WebGPU is not currently supported for this model
            // See https://github.com/microsoft/onnxruntime/issues/21386
            device: 'wasm',
            //dtype: 'fp32',
			dtype: 'q8',
			...preferences,
            progress_callback,
        });
	
		if(this.verification_model_id.endsWith('wespeaker-voxceleb-resnet34-LM')){
			self.similarity_threshold = 0.5;
			self.perfect_simillarity_threshold = 0.7;
		}
		else{
			self.similarity_threshold = 0.95;
			self.perfect_simillarity_threshold = 0.98;
		}
	
        this.verification_processor ??= AutoProcessor.from_pretrained(this.verification_model_id, {
            device: 'wasm',
            dtype: 'fp32',
			//device: 'webgpu',
			//dtype: 'q8',
			...preferences,
            progress_callback,
        });
	
        this.verification_instance ??= AutoModel.from_pretrained(this.verification_model_id, {
            device: 'wasm',
            dtype: 'fp32',
			//device: 'webgpu',
			//dtype: 'q8',
			...preferences,
            progress_callback,
        });

        return Promise.all([this.asr_instance, this.segmentation_processor, this.segmentation_instance, this.verification_processor, this.verification_instance]);


		/*
		let MY_PER_DEVICE_CONFIG = {...PER_DEVICE_CONFIG[self.device], ...preferences};
		console.log("SegmentationSingleton: MY_PER_DEVICE_CONFIG: ", JSON.stringify(MY_PER_DEVICE_CONFIG,null,4));
		console.log("this.asr_model_id: ", this.asr_model_id);
		
        this.asr_instance ??= pipeline('automatic-speech-recognition', this.asr_model_id, {
            ...MY_PER_DEVICE_CONFIG,
            progress_callback,
        });
		console.log("this.asr_instance created from pipeline");
		*/
		
		
		/*
		this.asr_instance ??= WhisperForConditionalGeneration.from_pretrained(this.asr_model_id, {
            dtype: {
                encoder_model: 'fp32', // 'fp16' works too
                decoder_model_merged: 'q4', // or 'fp32' ('fp16' is broken)
            },
            device: 'webgpu',
            progress_callback,
        });
		*/
		
		/*
		this.asr_instance ??= AutomaticSpeechRecognitionPipelineFactory.getInstance(x => {
			self.postMessage(x);
		}, this.asr_model_id, MY_PER_DEVICE_CONFIG);
		*/
		
		


		//console.log("WHISPER:  this.asr_instance: ", this.asr_instance); // at this point it's a promise

		// This part can take some time, which is a bit dodgy
		/*
		if(load_segmentation == true){
			
			
		}
		else{
			
			console.log("SegmentationSingleton: gerInstance: returning this.asr_instance");
			return Promise.all([this.asr_instance]);
		}
		*/
        
    }
}

























const transcribo = async (message,preload=false) => {
	console.log("whisper_worker: in new transcribo function.  message,preload: ", message, preload);
	
    // Storage for chunks to be processed. Initialise with an empty chunk.
    const chunks = [];
	let output = null;
	let tps;
	
	try{
		
	
		if(typeof message.model != 'string'){
			console.error("transcribe: message.model was not a string!");
			return null;
		}
		console.log("transcribo: message.model: ", message.model);
		self.current_asr_model_id = message.model;
	
	
		if(typeof message.options == 'undefined'){
			console.error("transcribe: message.options was undefined!");
			return null;
		}
	
		let asr_options = JSON.parse(JSON.stringify(message.options));
	
		console.log("transcribe: initial asr_options: ", asr_options);
	
	
	
		/*
		let asr_options = {
	        // Greedy
	        top_k: 0,
	        do_sample: false,

	        // Sliding window
	        chunk_length_s:20,
	        stride_length_s:3,
		
	        // Language and task
	        //language:'en',
			//language:'english',
	        //task: "transcribe",
		
	        // Return timestamps
	        return_timestamps: 'word',
	        force_full_sequences: false,

	        // Callback functions
	        //streamer, // after each generation step
	    }
		*/
		
		

	    const p = AutomaticSpeechRecognitionPipelineFactory;
    	
	

		if (p.model !== message.model){
			
			// Invalidate model if different
			console.warn("whisper_worker: need to load a new ASR model: ", message.model);
			p.model = message.model;
			
	        if (p.instance !== null) {
				console.log("whisper_worker: disposing of old ASR instance first");
	            (await p.getInstance()).dispose();
	            p.instance = null;
	        }
	    }
		
	    // Load transcribot model
	    const transcribot = await p.getInstance((data) => {
			//console.log("whisper_worker: transcribot: got data: ", data);
	        self.postMessage(data);
	    }, message.model);
		
		console.warn("\n\nHURRAY, GOT BEYOND TRANSCRIBOT CREATION\n\n");
		
		//console.log("transcribot loaded?: ", transcribot);
		//console.log("transcribot model: ", transcribot.tokenizer);
		//console.log("transcribot model: ", transcribot.model);
		//console.log("transcribot processor: ", transcribot.processor);


		if(preload){
			/*
			if(self.device == 'webgpu' && typeof transcribot.model == 'object' && transcribot.model != null && typeof transcribot.model.generate === 'function'){
				console.log("transcribot: preloading: attempting to warm-up the transcribot model (transcribot.model.generate is a function)");
			    self.postMessage({
			        status: 'asr_warming_up',
			        data: 'Compiling shaders and warming up model...'
			    });

			    // Run model with dummy input to compile shaders. Only needed if running via WebGPU
			    await transcribot.model.generate({
			        input_features: full([1, 80, 3000], 0.0),
			        max_new_tokens: 1,
			    });
			}
			*/
			console.warn("transcribe: ending early because this was a preload run");
			return true
		}


		if(typeof message.task == 'undefined' || message.task == null || typeof message.task.recorded_audio == 'undefined'){
			console.error("transcribo: NO AUDIO!");
			return null;
		}
		

	    const time_precision =
	        transcribot.processor.feature_extractor.config.chunk_length /
	        transcribot.model.config.max_source_positions;

		console.log("transcribo: time_precision: ", time_precision);

	    

	    // TODO: Storage for fully-processed and merged chunks
	    // let decoded_chunks = [];

	    let chunk_count = 0;
	    let start_time;
	    let num_tokens = 0;
	    
		
	
		console.log("creating streamer next. transcribot.tokenizer: ", transcribot.tokenizer);
		
		if(typeof transcribot.tokenizer !== 'function'){
		    console.error("transcribot.tokenizer was invalid: ", transcribot.tokenizer);
			//asr_options['streamer'] = streamer;
		}
		
	    const streamer = new WhisperTextStreamer(transcribot.tokenizer, {
	        time_precision,
	        on_chunk_start: (x) => {
	            const offset = (asr_options['chunk_length_s'] - asr_options['stride_length_s']) * chunk_count;
	            chunks.push({
	                text: "",
	                timestamp: [offset + x, null],
	                finalised: false,
	                offset,
	            });
	        },
	        token_callback_function: (x) => {
	            start_time ??= performance.now();
	            if (num_tokens++ > 0) {
	                tps = (num_tokens / (performance.now() - start_time)) * 1000;
	            }
	        },
	        callback_function: (x) => {
	            if (chunks.length === 0) return;
				console.log("WHISPER_WORKER: STREAM: + chunk: ", x);
	            // Append text to the last chunk
	            chunks.at(-1).text += x;
				
				if(self.task != null && typeof self.task.index == 'number' && typeof self.task.assistant == 'string'){
				    self.postMessage({
						task_index: task.index,
						task_parent_index: task.parent_index,
						task_assistant: task.assistant,
						task_destination: task.destination,
				        status: "stream",
						content: x,
				    });
				}
			   


				/*
	            self.postMessage({
					task:self.task,
	                status: "stream",
	                data: {
	                    text: "", // No need to send full text yet
	                    chunks,
	                    tps,
	                },
	            });
				*/
	        },
	        on_chunk_end: (x) => {
	            const current = chunks.at(-1);
	            current.timestamp[1] = x + current.offset;
	            current.finalised = true;
	        },
	        on_finalize: () => {
	            start_time = null;
	            num_tokens = 0;
	            ++chunk_count;
	        },
	    });
		
		
	    
		console.log("asr_options: ", JSON.stringify(asr_options,null,4));

		self.postMessage({ status: 'pipeline_ready' });
		
	
		console.error("\n\n\nOK\n\n\n\nWHISPER: AUDIO LENGTH: ", message.task.recorded_audio.length);
		//console.error("WHISPER AUDIO: ", message.task.recorded_audio);
		console.log("message.task.recorded_audio: ", typeof message.task.recorded_audio, message.task.recorded_audio )

	    // Actually run transcription
	    output = await transcribot(message.task.recorded_audio, {
	    	...asr_options,
			streamer,
	    }).catch((error) => {
	        console.error("caught error in transcribot: ", error);
	        self.postMessage({
	            status: "error",
	            data: error,
	        });
	        return null;
	    });
	
		console.log("whisper_worker: RAW ASR output: ", output);
		
		
		// SANITY CHECKS for Dutch language
		if(typeof output.text == 'string' && output.text.length < 24 && output.text.indexOf('TV GELDERLAND') != -1){
			output = null;
		}
		else if(typeof output.text == 'string' && output.text == ' MUZIEK.'){
			output = null;
		}
		else if(typeof output.text == 'string' && output.text.startsWith('!!!!!!!!!!!!!!!!!')){
	        self.postMessage({
	            status: "exclamation_marks",
	        });
			output = null;
		}
		
		// Check if the words are sensible. In very rare occasions Whisper freaks out
		if(output != null && typeof output.chunks != 'undefined' && output.chunks.length > 40){
			let words_spotted = [];
			for(let w = 0; w < output.chunks.length; w++){
				if(typeof output.chunks[w].text == 'string' && words_spotted.indexOf(output.chunks[w].text) == -1){
					words_spotted.push(output.chunks[w].text);
				}
			}
			if(words_spotted.length < output.chunks.length/10){
				console.error("Whisper went haywire, creating looping output");
				
				let unlooped_text = '';
				let found_the_loop = false;
				let maximum_trim = output.text.length;
				let best_loop = null;

				let max_test_length = Math.round(output.text.length / 3);
				if(max_test_length > 100){
					max_test_length = 100;	
				}
				for(let q = output.text.length; q > max_test_length; --q){
					//console.log("q:",q);
					let loop_text = '';
					let test_text = output.text.substr(0,q);
					//console.log("test_text:", test_text);
	
					for(let e = test_text.length - 1; e > Math.round(test_text.length / 3); --e){
						//console.log(e,test_text.charAt(e));
						//break
		
						loop_text = test_text.charAt(e) + loop_text;
						if(loop_text.length > 7){
							const tester = test_text.substr(e - loop_text.length,loop_text.length);
							//console.log("tester: ", tester, loop_text);
							if(tester == loop_text){
								//console.log("BINGO: ", loop_text);
								if(output.text.indexOf(loop_text) < maximum_trim){
									//console.log("Found an even better loop: ", loop_text);
									best_loop = loop_text;
								}
								//found_the_loop = true;
								break
							}
						}
		
					}
	
				}
				if(best_loop != null){
					output.text = output.text.substr(0,(output.text.indexOf(best_loop) + best_loop.length));
					//console.log("Fixed un-looped output.text: ", output.text);
					let remake = '';
					if(typeof output.chunks != 'undefined'){
						for(let w = 0; w < output.chunks.length; w++){
							remake += output.chunks[w] + ' ';
							//console.log("remake: ", remake);
							if(remake.length > output.text.length){
								//console.log("remake: ", remake);
								output.chunks.splice(w+1,output.chunks.length);
								console.error("Fixed un-looped output.chunks: ", output.chunks);
								break
							}
						}
					}
				}
				else{
					console.error("COULD NOT FIX WHISPER GONE HAYWIRE");
					output = null;
				}
				
			}
		}
		
		
		if(self.interrupted){
		    self.postMessage({
				task: task,
		        status: "interrupted",
		    });
			return null
		}
		
		
		return output
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
	}
	catch(err){
		console.error("caught general error in transcribo: ", err);
        self.postMessage({
            status: "error",
            data: err,
        });
        return null;
	}

    return {
        tps,
        ...output,
		chunks,
    };
};










/*
class AutomaticSpeechRecognitionPipeline {
    static model_id = null;
    static tokenizer = null;
    static processor = null;
    static model = null;
	
	
	static asr_config = {
    	dtype: {
        	encoder_model: 'fp32', // 'fp16' works too
        	decoder_model_merged: 'q4', // or 'fp32' ('fp16' is broken)
    	},
    	device: 'webgpu'
	};


	constructor(tokenizer, model) {
		this.tokenizer = tokenizer;
		this.model = model;
	}

	static get_asr_model_id(){
		return this.model_id;
	}

	static set_to_null(var_to_null=null) {
		if(typeof var_to_null == 'string' && typeof this[var_to_null] != 'undefined'){
			this[var_to_null] = null;
			console.log("AutomaticSpeechRecognitionPipelineFactory: set_to_null: ", var_to_null);
		}
	};


    static async getInstance(progress_callback=null,asr_model_id=null,my_config=null) {
        this.model_id = 'onnx-community/whisper-base';
		if(typeof asr_model_id == 'string' && asr_model_id.length){
			this.model_id = asr_model_id;
		}
		
		if(my_config != null){
			this.asr_config = my_config;
			console.log("this.asr_config has been set to: ", JSON.stringify(this.asr_config, null, 4));
		}


        this.tokenizer ??= AutoTokenizer.from_pretrained(this.model_id, {
            progress_callback,
        });
        this.processor ??= AutoProcessor.from_pretrained(this.model_id, {
            progress_callback,
        });
		
		
        this.model ??= WhisperForConditionalGeneration.from_pretrained(this.model_id, my_config);

        return Promise.all([this.tokenizer, this.processor, this.model]);
    }
}
*/









async function dispose(dispose_type='all') {
	console.log("whisper_worker: in dispose.  dispose_type: ", dispose_type);
	/*
	if(SegmentationSingleton.asr_exists() === false){
		console.log("whisper worker: dispose: asr hasn't been created yet");
		return true;
	}
	*/
	
	if(typeof dispose_type != 'string'){
		console.eror("whisper_worker: invalid dispose_type: ", dispose_type);
		return false
	}
	
	self.busy_disposing_models = true;
	
	if( (dispose_type == 'segmentation' || dispose_type == 'all') && SegmentationSingleton.instance_exists() === true){
		console.log("whisper dispose: should indeed dispose segmentation");
		
		const [segmentation_processor,segmentation_model,verification_processor,verification_model] = await SegmentationSingleton.getInstance(x => {
			//
			//}, asr_model_id, JSON.parse(asr_preferences),loaded_segmentation);
		},self.segmentation_preferences);
		
		
		if(segmentation_processor != null && typeof segmentation_processor.dispose == 'function'){
			console.log("whisper_worker: dispose: disposing of segmentation_processor");
			await segmentation_processor.dispose();
			segmentation_processor = null;
			SegmentationSingleton.set_to_null('segmentation_processor');
		}
		if(segmentation_model != null && typeof segmentation_model.dispose == 'function'){
			console.log("whisper_worker: dispose: disposing of segmentation_model");
			await segmentation_model.dispose();
			SegmentationSingleton.set_to_null('segmentation_model');
		}
		if(verification_processor != null && typeof verification_processor.dispose == 'function'){
			console.log("whisper_worker: dispose: disposing of verification_processor");
			await verification_processor.dispose();
			SegmentationSingleton.set_to_null('verification_processor');
		}
		if(verification_model != null && typeof verification_model.dispose == 'function'){
			console.log("whisper_worker: dispose: disposing of verification_model");
			await verification_model.dispose();
			SegmentationSingleton.set_to_null('verification_model');
		}
	}
	
	
	if( (dispose_type == 'asr' || dispose_type == 'all') && AutomaticSpeechRecognitionPipelineFactory.instance_exists() === true){
		console.log("whisper_worker: disposing the transcribot");
		
		const p = AutomaticSpeechRecognitionPipelineFactory;
		
		const transcribot = await p.getInstance();
		
		if(transcribot.tokenizer != null && typeof transcribot.tokenizer.dispose == 'function'){
			console.log("whisper_worker: dispose: disposing of transcribot -> tokenizer");
			await asr.tokenizer.dispose();
			AutomaticSpeechRecognitionPipelineFactory.set_to_null('tokenizer');
		}
		if(transcribot.processor != null && typeof transcribot.processor.dispose == 'function'){
			console.log("whisper_worker: dispose: disposing of transcribot -> processor");
			await transcribot.processor.dispose();
			AutomaticSpeechRecognitionPipelineFactory.set_to_null('processor');
		}
		if(transcribot.model != null && typeof transcribot.model.dispose == 'function'){
			console.log("whisper_worker: dispose: disposing of transcribot -> model");
			await transcribot.model.dispose();
			AutomaticSpeechRecognitionPipelineFactory.set_to_null('model');
			self.current_asr_model_id = null;
		}
		
		/*
		const [tokenizer,processor,model] = await AutomaticSpeechRecognitionPipelineFactory.getInstance();
		
		if(tokenizer != null && typeof tokenizer.dispose == 'function'){
			console.log("whisper_worker: dispose: disposing of transcribot -> tokenizer");
			await tokenizer.dispose();
			AutomaticSpeechRecognitionPipelineFactory.set_to_null('tokenizer');
		}
		if(processor != null && typeof processor.dispose == 'function'){
			console.log("whisper_worker: dispose: disposing of transcribot -> processor");
			await processor.dispose();
			AutomaticSpeechRecognitionPipelineFactory.set_to_null('processor');
		}
		if(model != null && typeof model.dispose == 'function'){
			console.log("whisper_worker: dispose: disposing of transcribot -> model");
			await model.dispose();
			AutomaticSpeechRecognitionPipelineFactory.set_to_null('model');
			self.current_asr_model_id = null;
		}
		*/
	}
	
	self.busy_disposing_models = false;
	
	console.log("whisper_worker: dispose done: ", dispose_type);
	
	return true
}


async function unload_segmentation() {
	console.log("whisper worker: in unload_segmentation (dispose segmentation)");
	
	if(SegmentationSingleton.segmentation_exists() === false){
		console.log("whisper worker: unload_segmentation: segmentation hasn't been created yet");
		return true;
	}
	
	await dispose('segmentation');
	/*
	if(self.last_used_segmentation === true && self.last_used_preferences != null){
		console.log("whisper worker: actually calling dispose");
		
	}
	else{
		console.log("whisper worker: unload_segmentation (dispose): nothing to do");
	}
	*/
	console.log("unload_segmentation: done");
	return null;
}










// MESSAGE LISTENER

addEventListener('message', async (event) => {
	//console.log("WHISPER WEB WORKER: RECEIVED MESSAGE");
	console.log("WHISPER WEB WORKER: RECEIVED MESSAGE. event.data: ", event.data);
	
	
	if(typeof event.data.action == 'string' && (event.data.action == 'delete_speakers' || event.data.action == 'delete_speaker' || event.data.action == 'set_speaker_name' || event.data.action == 'dispose' || event.data.action == 'interrupt')){
		
		
		if(event.data.action == 'dispose'){
			console.log("whisper worker: action: dispose");
			//await dispose_models();
			if(self.busy_disposing_models == false){
				
				if(self.busy_transcribing){
					console.warn("whisper_worker: dispose was called while the worker was busy");
					self.interrupted = true;
				}
				
				await dispose('all');
			    self.postMessage({
			        status: "disposed"
			    });
				self.task = null;
			}
			else{
				console.error("whisper_worker: already busy disposing");
			}
			
		}
		
		else if(event.data.action == 'interrupt'){
			console.log("whisper worker: action: interrupt");
			self.interrupted = true;
		}
		
		else if(event.data.action == 'delete_speakers'){
			//console.log("whisper worker: action: delete_speakers");
			reset_fingerprints();
		}
		
		else if(event.data.action == 'delete_speaker'){
			if(typeof event.data.id == 'number' && typeof event.data.parent_index == 'number' && self.task != null && typeof self.task.parent_index == 'number' && self.task.parent_index == event.data.parent_index){
				for(let f = 0; f < self.fingerprints.length; f++){
					if(self.fingerprints[f].id == event.data.id){
						self.fingerprints.splice(f,1);
					    self.postMessage({
					        status: "success",
							message: "Deleted"
					    });
						break
					}
				}
			}
		}
		else if(event.data.action == 'set_speaker_name'){
			//console.log("whisper_worker: received set_speaker_name.  event.data: ", event.data);
			//console.log("typeof event.data.id: ", typeof event.data.id);
			//console.log("typeof event.data.parent_index: ", typeof event.data.parent_index);
			if(self.task && typeof self.task.parent_index == 'number'){
				//console.log("whisper_worker: received set_speaker_name. parent_index to match: ", self.task.parent_index);
			}
			else{
				console.error("set_speaker_name: self.task was null, so no parent index to match with");
			}
			if(typeof event.data.id == 'number' && typeof event.data.speaker_name == 'string' && typeof event.data.parent_index == 'number'){
				//console.log("whisper_worker: set_speaker_name: received valid input. self.fingerprints.length: ", self.fingerprints.length);
				
				if( (self.task != null && typeof self.task.parent_index == 'number' && self.task.parent_index == event.data.parent_index) || self.task == null){
					//console.log("whisper_worker: set_speaker_name: OK.  self.task: ", self.task);
					for(let f = 0; f < self.fingerprints.length; f++){
						if(self.fingerprints[f].id == event.data.id){
							//console.log("set_speaker_name: found the fingerprint");
							if(event.data.speaker_name == ''){
								//console.log("set_speaker_name: should delete the speaker_name from the fingerprint");
								if(typeof self.fingerprints[f].speaker_name != 'undefined'){
									delete self.fingerprints[f].speaker_name;
								}
								//self.fingerprints[f].speaker_name = self.speaker_translation + ' ' + self.fingerprints[f].id;
							}
							else{
								self.fingerprints[f].speaker_name = event.data.speaker_name;
								//console.log('set_speaker_name: self.fingerprints[f].speaker_name is now: ', self.fingerprints[f].speaker_name);
							}
						    self.postMessage({
						        status: "success",
								message: "Saved"
						    });
							break
						}
					}
				}
				else{
					console.error("set_speaker_name: event.data.parent_index and task parent_index did not match: ", typeof event.data.parent_index, event.data.parent_index, typeof self.task.parent_index, self.task.parent_index);
				}
					
			}
			else{
				console.error("set_speaker_name: invalid input");
			}
		}
		
		return null
	}
	
	//console.log("WHISPER WEB WORKER: device: ", self.device);
	
	if(self.busy_disposing_models){
		console.error("whisper worker: ignoring incoming message, busy disposing of models");
	    self.postMessage({
			task: task,
	        status: "error",
	        error: "whisper was busy disposing of models",
	    });
		return null
	}
	
	if(self.busy_loading){
		console.error("whisper worker: incoming message, but busy loading. aborting");
	    self.postMessage({
			task: task,
	        status: "warning",
	        error: "already busy loading",
	    });
		return null
	}
	
	if(self.busy_transcribing){
		console.error("whisper worker: incoming message, but already busy transcribing");
	    self.postMessage({
			task: task,
	        status: "error",
	        error: "already busy transcribing",
	    });
		return null
	}
	
	//const message = event.data;
	//let transcript = null;
	
	if(gpu_checked == false){
		console.log("whisper_worker: calling check_gpu");
		gpu_checked = true;
		await check_gpu();
	}
	
	self.segmentation_preferences = {};
	if(typeof event.data.mobile == 'boolean'){
		self.is_mobile = event.data.mobile;
	}
	console.log("whisper_worker: self.is_mobile is now: ", self.is_mobile);
	if(self.is_mobile){
		self.segmentation_preferences['quantized'] = true;
	}
	
	if(typeof event.data.action == 'string'){

		
		if(event.data.action == 'preload'){
			console.log("whisper worker: action: preload");
			if(typeof event.data.preload_segmentation == 'boolean'){
				console.log("whisper worker: action: preload:  event.data.preload_segmentation: ", event.data.preload_segmentation);
			}
			
			self.busy_loading = true;
		    self.postMessage({
		        status: "preloading"
		    });
			await preload(event.data);
			self.busy_loading = false;
			console.log("whisper_worker: preload done")
		    self.postMessage({
		        status: "preload_complete"
		    });
			
		}
		
		return null
	}
	
	
	else if(typeof event.data.task != 'undefined'){
		
		
		self.task = event.data.task;
		
		self.interrupted = false;
		
		let output = boss(event.data);
		
	}
	else{
	    self.postMessage({
			//task: event.data,
	        status: "error",
	        //task: "automatic-speech-recognition",
	        error: "no (task) data in incoming message",
	    });
	}

});



const boss = async (message) => {
	
	console.warn("whisper_worker: BOSS GOT THE MESSAGE: ", message);
	
	
	let merged_snippets = null;
	let transcript = null;
	try{
		
		// This has already been checked
		if(typeof message.task == 'undefined' || message.task == null){
			console.error("WHISPER WORKER: no valid task in message? message: ", message);
		    self.postMessage({
				task: message.task,
		        status: "error",
		        error: "no task provided",
		    });
			self.busy_transcribing = false;
			return null
		}
		
		if(typeof message.task.recorded_audio == 'undefined' || message.task.recorded_audio == null || (message.task.recorded_audio.length == 0 )){
			/*
			if(typeof message.task.preload == 'boolean' && message.task.preload == true){
				//message.task.recorded_audio = new Float32Array(16_000);
				message.task.recorded_audio = new Float32Array(1000);
			}
			else{
				
			}*/
			console.error("whisper_worker: aborting, task had NO AUDIO");
		    self.postMessage({
				task: message.task,
		        status: "error",
		        error: "task had no recorded_audio",
		    });
			self.busy_transcribing = false;
			return null
			
		}

		
	

    	// Do some work...
    	// TODO use message data
	
		//console.log("WHISPER WEB WORKER: received message -> CALLING TRANSCRIBE FUNCTION");
		
		self.busy_transcribing = true;
		
		self.task = message.task;
		
		
		//if(typeof message.task.recorded_audio != 'undefined' && message.task.recorded_audio != null && Array.isArray(message.task.recorded_audio)){
		//	//console.log("padding recorded audio start with extra zeros");
			//message.task.recorded_audio.unshift([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
		//}
		
		
		recorded_audio_length = message.task.recorded_audio.length;
		
		
		if(typeof message.task.recording_start_time == 'undefined' && typeof message.task.recording_end_time == 'undefined'){
			console.error("whisper_worker: task has neither an absolute start or end time");
		}
		

		if(typeof message.task.recording_start_time != 'number' && typeof message.task.recording_end_time == 'number'){
			console.log("WHISPER WORKER: task had no recording_start_time, but it can be calculated from recording_end_time: ", message.task.recording_end_time);
			message.task.recording_start_time = message.task.recording_end_time - (recorded_audio_length / 16);
		}
		else if(typeof message.task.recording_end_time != 'number' && typeof message.task.recording_start_time == 'number'){
			console.log("WHISPER WORKER: task had no recording_end_time, but it can be calculated from recording_start_time: ", message.task.recording_start_time);
			message.task.recording_end_time = message.task.recording_start_time + (recorded_audio_length / 16);
		}
		
		
		if(typeof message.task.recording_start_time != 'number' && typeof message.task.recording_end_time != 'number'){
			// add fake recording end time, likely for a file that is being transcribed
			
			console.error("WHISPER WORKER: task had no recording_start_time and no recording_end_time: ", message.task);
			if(typeof message.task.origin == 'string' && message.task.origin.endsWith('file')){
				message.task.recording_start_time = 0;
				message.task.recording_end_time = message.task.recorded_audio.length / 16; // milliseconds from zero
				message.task.recording_start_time = message.task.recording_end_time - (recorded_audio_length / 16);
			}
			else{
				console.error("whisper worker: voice task had no recording_end_time?");
				message.task.recording_end_time = Date.now();
				message.task.recording_start_time = message.task.recording_end_time - (recorded_audio_length / 16);
			}
			//console.error("WHISPER WORKER: generated recording_start_time and recording_end_time: ", message.task.recording_start_time, message.task.recording_end_time);
			
		}
		
		total_duration_time = (recorded_audio_length / 16);
		//console.log("whisper worker: total_duration_time: ", total_duration_time);
		
		self.minimal_verification_duration = 2000; // resets the value to 2 seconds
		
		
		if(self.interrupted){
		    self.postMessage({
				task: message.task,
		        status: "interrupted",
		    });
			return null
		}
		
		if(typeof message.task.origin == 'string' && message.task.origin.endsWith('file') && typeof message.task.parent_index == 'number' && typeof message.task.progress_index == 'number' && message.task.progress_index == 0){
			console.log("WHISPER WORKER: first task of many to transcribe a file. Resetting fingerprints.  message.task.parent_index: ", message.task.parent_index);
			reset_fingerprints();
		}
		
		post_speakers_list();
		
		
		
		
		
		
		/*
		let preload = false
		if(typeof task.preload == 'boolean' && task.preload == true){
			self.busy_loading = true;
			preload = true;
		}
		else{
			self.busy_transcribing = true;
		}
		*/
		
		
		
		
		//modelName = 'onnx-community/whisper-base';

		let load_segmentation = false;
		if(typeof message.task.assistant == 'string' && message.task.assistant == 'scribe'){
			//console.log("whisper worker: assistant is scribe, should load segmentation");
			load_segmentation = true;
		}
		
		if(self.loaded_segmentation === true && load_segmentation == false){
			console.error("boss: unloading segmentation instances");
			await unload_segmentation();
			self.loaded_segmentation = false;
		}
		
		if(typeof message.task.preload == 'boolean'){
			console.error("task still has a preload boolean: ", message.task.preload);
		}
		
		
		
		/*
		if(typeof self.current_asr_model_id == 'string' && model_name != self.current_asr_model_id){
			await dispose('asr');
		}
		*/
		
		
		
		
		//console.log("WHISPER WORKER: QUANTIZED: ", preferences['quantized']);
		
		
		self.start_time = Date.now();
		/*
		await load(
			task,
			model,
			multilingual,
			quantized,
			subtask,
			language,
			mobile,
			preload
		)
		*/
		
		//self.last_used_preferences = preferences;
		self.last_used_segmentation = load_segmentation;
		
		let segmentation_processor,segmentation_model,verification_processor,verification_model;
		
		if(load_segmentation){
			console.log("whisper_worker: boss: MUST LOAD SEGMENTATION");
			[segmentation_processor,segmentation_model,verification_processor,verification_model] = await SegmentationSingleton.getInstance(x => {
		        // We also add a progress callback to the pipeline so that we can
		        // track model loading.
		        self.postMessage(x);
				//console.log("whisper_worker: loading pipeline: ", x);
			//}, model_name,preferences,load_segmentation);
			},self.segmentation_preferences);
			
			console.log("whisper_worker: segmentation models loaded");
			self.postMessage({ 'status':'segmentation_loaded', 'task':message.task});
			//self.busy_loading = false;
			
		}
		else{
			
		}
		//console.log("WHISPER WORKER: +LOAD IS DONE. It took: ", (Date.now() - self.start_time) / 1000 + " seconds");
		
		
		//console.log("transcribot: ", transcribot);
		
		/*
		const [transcribot,segmentation_processor,segmentation_model,verification_processor,verification_model] = await SegmentationSingleton.getInstance(x => {
	        // We also add a progress callback to the pipeline so that we can
	        // track model loading.
	        self.postMessage(x);
			//console.log("whisper_worker: loading pipeline: ", x);
	    }, model_name,preferences,load_segmentation);
		*/
		//console.log("WHISPER WORKER: +LOAD IS DONE. It took: ", (Date.now() - self.start_time) / 1000 + " seconds");
		//console.log("whisper_worker: transcribot: ", transcribot);
		//console.log("segmentation_processor: ", segmentation_processor);
		//console.log("segmentation_model: ", segmentation_model);
		//console.log("verification_processor: ", verification_processor);
		//console.log("verification_model: ", verification_model);
		
		/*
		if(typeof segmentation_model != 'undefined'){
			//console.log("typeof segmentation_model.dispose: ", typeof segmentation_model.dispose);
		}
		if(typeof segmentation_model != 'undefined'){
			//console.log("typeof verification_model.dispose: ", typeof verification_model.dispose);
		}
		*/
		
		/*
		if(typeof message.task.preload == 'boolean' && message.task.preload == true){
			console.log("whisper_worker: preloading complete");
			
			self.busy_transcribing = false;
			self.busy_loading = false;
			self.task = null;
			
			self.postMessage({ task:message.task, status: 'preload_complete' });
			
			return null;
		}
		else{
			
		}
		*/
		
		
		//console.log("this.asr_instance: ", transcribot);
		//console.log("this.asr_instance.tokenizer: ", transcribot.tokenizer);
		
		
		/*
	    let output = await transcribo(
			transcribot,
			segmentation_processor,
			segmentation_model,
	        message.task,
	        message.model,
	        message.multilingual,
	        message.quantized,
	        message.subtask,
	        message.language,
			message.mobile,
	    );*/
		console.log("boss: calling transcribe");
	    let output = await transcribo(message);
		console.log("boss: output: ", output);
		
		/*
	    if (typeof output == 'undefined' || output == null){
	    	console.error("WHISPER WEB WORKER: transcription was invalid or null");
		
		    self.postMessage({
				task: message.task,
		        status: "error",
		        //task: "automatic-speech-recognition",
		        error: "transcription was invalid or null",
		    });
			self.busy_transcribing = false;
			return null
		
	    }
		*/
		
		if(output != null && typeof output.text == 'string'){
			console.log("boss: output.text: ", output.text);
			//transcript = output.text;
			//transcript = transcript.trim();
			message.task['transcript'] = output.text.trim(); // not really used?
			
			
			console.log("WHISPER WEB WORKER: TRANSCRIPTION RESULT: ", output);
		
			//if(output != null && typeof output.chunks != 'undefined'){
			//	task['transcript_chunks'] = output.chunks;
			//}
		
			if(typeof message.task.recording_start_time == 'number' && output != null && typeof output.chunks != 'undefined' && Array.isArray(output.chunks) ){
				console.log("boss: output.chunks exists: ", output.chunks);
				for(let ch = 0; ch < output.chunks.length; ch++){
					output.chunks[ch].absolute_start_time = Math.floor(message.task.recording_start_time + (output.chunks[ch].timestamp[0] * 1000));
					output.chunks[ch].absolute_end_time = Math.floor(message.task.recording_start_time + (output.chunks[ch].timestamp[1] * 1000));
				}
			}
		
		
			if(output != null && typeof output.chunks != 'undefined' && typeof task.progress_index == 'number'){
				for(let c = 0; c < output.chunks.length; c++){
					output.chunks[c]['progress_index'] = task.progress_index;
					if(typeof task.progress_total == 'number'){
						output.chunks[c]['progress_total'] = task.progress_total;
					}
				}
			}
		
		
		    //const end = performance.now();
			if(output != null && typeof output.chunks != 'undefined' && message.task != null && typeof message.task.assistant == 'string' && message.task.assistant == 'scribe' && typeof verification_processor != 'undefined' && verification_processor != null && typeof verification_model != 'undefined' && verification_model != null){
			
				if(typeof message.task.preload == 'boolean' && message.task.preload == true){
					console.warn("whisper_worker: PRELOAD, so only doing a quick fingerprint test");
					//const fake_audio = new Float32Array(16_000);
				
					const fresh_fingerprint = await verify(verification_processor, verification_model, new Float32Array(16_000));
					self.task = null;
				
				}
				else if(typeof output.segments != 'undefined'){
					console.log("output has segments");
					self.original_segments = JSON.parse(JSON.stringify(output.segments));
					//console.log("BOSS: calling deepen_segments");
					output.segments = await deepen_segments(segmentation_processor, segmentation_model, task.recorded_audio, output.segments);
				
				
					const verification_result = await verify_segments(output.segments, output.chunks, task.recorded_audio, verification_processor, verification_model);
					output = {...output, ...verification_result}
					//console.warn("FINAL VERIFIED SEGMENTS: ", output['segments']);
				
					if(output != null && typeof output['segments'] != 'undefined'){
						for(let seg = 0; seg < output['segments'].length; seg++){
							if(typeof output['segments'][seg].audio != 'undefined'){
								console.warn("WHISPER WORKER: DELETING STRAY AUDIO FROM SEGMENT");
								delete output['segments'][seg].audio;
							}
							if(typeof output['segments'][seg].fingerprint != 'undefined'){
								console.warn("WHISPER WORKER: DELETING FINGERPRINT FROM SEGMENT");
								delete output['segments'][seg].fingerprint;
							}
						}
					}
				}
				else{
					console.error("whisper worker: fell through, could not call verify_segments: no segments");
				}
			
				//console.log("WHISPER WORKER: +VERIFY_SEGMENTS IS DONE. It took: ", (Date.now() - self.start_time) / 1000 + " seconds");
			}
			else if(load_segmentation){
				console.error("was supposed to use segmentation, but could not");
			}
			else{
				//console.log("could not call verify_segments, some parameters are invalid, or verification is simply not needed for the current task");
			}
		}
		
		
		
		
		
		
		if(typeof message.task != 'undefined' && typeof message.task != null && typeof message.task.recorded_audio != 'undefined'){
			delete message.task.recorded_audio;
		}
		if(typeof self.task != 'undefined' && self.task != null && typeof self.task.recorded_audio != 'undefined'){
			console.error("whisper_worker: also deleting audio from self.task, which means that data is duplicated in memory");
			delete self.task.recorded_audio;
		}
		
		/*
		if(typeof message.task.preload == 'boolean' && message.task.preload == true){
			console.log("WHISPER WORKER: task.preload was true, this is a preload task. Sending preload_complete message.  task: ", message.task);
			self.postMessage({ task:message.task, status: 'preload_complete' });
		}
		else{
			
		}
		*/
		post_speakers_list();
		
	    // Send the result back to the main thread
	    self.postMessage({
			task: self.task,
	        status: "complete",
	        //task: "automatic-speech-recognition",
	        transcript: output,
			//speakers: clean_speakers_list,
	    });
		
	
	}catch(err){
		console.error("boss: ERROR: whisper worker: ", err);
	    self.postMessage({
			task: message.task,
	        status: "error",
	        error: "whisper worker caught general error: " + err.toString(),
	    });
	}
	
	self.busy_transcribing = false;
	self.busy_loading = false;
	self.task = null;
	console.log("whisper worker: done");
}








/*
let generating = false;
//async function transcribot({ audio, language }) {
async function transcribot(audio, options) {
	console.log("in transcribot. typeof audio, options: ", typeof audio, options);
    if (generating){
    	console.error("whisper_worker: already generating");
		return
    }
    generating = true;

    // Tell the main thread we are starting
    self.postMessage({ status: 'asr_generating_start' });

    // Retrieve the text-generation pipeline.
    const [tokenizer, processor, model] = await AutomaticSpeechRecognitionPipelineFactory.getInstance();

	
	
	function streamCallback(value){
		//console.error("GOT WHISPER STREAM CALLBACK: ", typeof value, value);
		//previous_stream_stamp = stream_stamp;
	    self.postMessage({
			task_index: task.index,
			task_parent_index: task.parent_index,
			task_assistant: task.assistant,
	        status: "stream",
			content: value,
	    });
	}
	
	
	

    const streamer = new TextStreamer(tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function:streamCallback,
    });

    const inputs = await processor(audio);

    const outputs = await model.generate({
        ...inputs,
        max_new_tokens: MAX_NEW_TOKENS,
        language:options.language,
        streamer,
    });

    const outputText = tokenizer.batch_decode(outputs, { skip_special_tokens: true });

    // Send the output back to the main thread
    self.postMessage({
        status: 'asr_generating_complete',
        output: outputText,
    });
    generating = false;
}
*/




async function preload(message=null) {
	console.log("whisper_worker: in preload. message: ", message);
	if(message == null){
		console.error("whisper_worker: preload: no valid message provided: ", message);
		return false;
	}
    self.postMessage({
        status: 'asr_loading',
        data: 'Loading model...'
    });

    // Load the pipeline and save it for future use.
	/*
    const [tokenizer, processor, model] = await AutomaticSpeechRecognitionPipelineFactory.getInstance(x => {
        self.postMessage(x);
    });
	*/
	
	
	const output = await transcribo(message,true); // set preload flag to true so it stops early
	console.log("PRELOAD: transcribe preload run is done. preload output: ", output);
	/*
	if(typeof message_data.model == 'string'){
		self.current_asr_model_id = message_data.model;
	}
	
	let asr_options = JSON.parse(JSON.stringify(message.options));
	
    const p = AutomaticSpeechRecognitionPipelineFactory;
	
		
	
	
	//p.subtask = "transcribe";

	if (
		p.model !== message.model 
		|| 
		(
			(p.quantized == null && typeof asr_options.quantized == 'boolean' && asr_options.quantized === true) 
			|| 
			(p.quantized === true && typeof asr_options.quantized != 'boolean' && asr_options.quantized === null)
		)
	){
		// Invalidate model if different
		p.model = model_name;
		if(typeof asr_options.quantized == 'boolean' && asr_options.quantized == 'true'){
			p.quantized = true;
		}
		else{
			p.quantized = null;
		}
		

		console.warn("whisper_worker: preload: need to load a new ASR model: ", model_name);
	
        if (p.instance !== null) {
			console.log("whisper_worker: preload: disposing of old ASR instance first");
            (await p.getInstance()).dispose();
            p.instance = null;
        }
    }
	console.log("P exists. next: create transcribot.  asr_options: ", asr_options);
	console.log("p.model: ", p.model);
	//console.log("p.task: ", p.task); // should always be "automatic-speech-recognition"
	console.log("p.quantized: ", p.quantized);

    // Load transcribot model
    const transcribot = await p.getInstance((data) => {
		console.log("whisper_worker: preload: transcribot: got data: ", data);
        self.postMessage(data);
    });
	console.warn("\n\nPRELOAD: GOT BEYOND TRANSCRIBER\n\n");
	*/
	
	
	/*
	if(self.device == 'webgpu' && typeof asr_instance.model == 'object' && asr_instance.model != null && typeof asr_instance.model.generate === 'function'){
	    self.postMessage({
	        status: 'asr_warming_up',
	        data: 'Compiling shaders and warming up model...'
	    });

	    // Run model with dummy input to compile shaders. Only needed if running via WebGPU
	    await asr_instance.model.generate({
	        input_features: full([1, 80, 3000], 0.0),
	        max_new_tokens: 1,
	    });
	}
    */
	
	
	if(typeof message.preload_segmentation == 'boolean' && message.preload_segmentation === true){
		console.log("whisper_worker: preload: also preloading segmentation and verification AI");
	    
		self.postMessage({
	        status: 'segmentation_loading',
	        data: 'Loading model...'
	    });
		
		const [segmentation_processor,segmentation_model,verification_processor,verification_model] = await SegmentationSingleton.getInstance(x => {
	        self.postMessage(x);
		});
		console.log("whisper_worker: segmentation preload complete");
	}
	else{
		console.log("whisper_worker: preload: not preloading segmentation models");
	}
	
	console.log("whisper_worker: preload: done");

	return true
}










// TRANSCRIBE FUNCTION
/*
const transcribe_old = async (
	//transcribot,
	segmentation_processor,
	segmentation_model,
    task,
    model_name,
    multilingual,
    quantized,
    subtask,
    language,
	mobile
	) => {
	
	try{
		
		//console.log("whisper_worker: in transcribe.  transcribot: ", typeof transcribot, transcribot);
		
		
		if(typeof transcribot == 'undefined' || transcribot == null){
			console.error("whisper worker: transcribot was still null somehow");
			self.busy_transcribing = false;
			self.busy_loading = false;
		    self.postMessage({
				task: task,
		        status: "error",
		        error: "transcribot was null",
		    });
			return null
		}
		
		
		if(self.interrupted){
			
		    self.postMessage({
				task: task,
		        status: "interrupted",
		    });
			return null
		}
		
		
		let options = {
	        return_timestamps: 'word',
	        chunk_length_s: 30,
	    }
		
		if(typeof model_name != 'string'){
			console.error("whisper worker: model_name is not a string");
			self.busy_transcribing = false;
		    self.postMessage({
				task: task,
		        status: "error",
		        error: "model_name is not a string",
		    });
			return null
		}
		
		console.log("model_name: ", model_name);
		
		if(model_name.endsWith('.en') || model_name.endsWith('.en_timestamped') || (typeof language == 'string' && language == 'en')){
		    console.log("whisper_worker: language is english");
		}
		else{
			if(typeof subtask == 'string'){
				options['task'] = subtask;
			}
			if(typeof language == 'string' && language != 'auto'){
				options['language'] = language;
			}
			else{
				options['language'] = 'en';
			}
		}
		
		
		if(multilingual){
			//console.log("setting language: ", language);
			//options['language'] = language;
		}
		
		let previous_stream_stamp = Date.now();
		let stream_text = '';
		function streamCallback(value){
			//console.error("GOT WHISPER STREAM CALLBACK: ", typeof value, value);
			//previous_stream_stamp = stream_stamp;
		    self.postMessage({
				task_index: task.index,
				task_parent_index: task.parent_index,
				task_assistant: task.assistant,
		        status: "stream",
				content: value,
		    });
		}
		
		
		
		let output = null;
		let segments = null;
		if(typeof self.task.assistant == 'string' && self.task.assistant == 'scribe'){
			if(typeof transcribot != 'undefined' && typeof segmentation_processor != 'undefined' && typeof segmentation_model != 'undefined'){
			    
				if(self.is_mobile){
					output = await transcribot({'audio':task.recorded_audio, 'options':options});
					segments = await really_segment(segmentation_processor, segmentation_model, task.recorded_audio, task.preload);
				}
				else{
					[output, segments] = await Promise.all([
						transcribot({'audio':task.recorded_audio, 'options':options}),
						really_segment(segmentation_processor, segmentation_model, task.recorded_audio, task.preload)
					]);
				}
				
				
			       
			        
			    
				//console.log("WHISPER WORKER: +TRANSCRIBER & SEGMENTATION IS DONE. It took: ", (Date.now() - self.start_time) / 1000 + " seconds");
				output['segments'] = segments;
			}
			else{
				console.error("WHISPER WORKER transcribot, segmentation_processor and/or segmentation_model is undefined");
			}
		    
		}
		else{
			output = await transcribot(task.recorded_audio, options);
			//console.log("WHISPER WORKER: +TRANSCRIBER ONLY IS DONE. It took: ", (Date.now() - self.start_time) / 1000 + " seconds");
		}
	    
		
		if(typeof output.text == 'string'){
			//console.log("WHISPER HEARD: ", output.text, output);
		}
		
		// SANITY CHECKS for Dutch language
		if(typeof output.text == 'string' && output.text.length < 24 && output.text.indexOf('TV GELDERLAND') != -1){
			output = null;
		}
		else if(typeof output.text == 'string' && output.text == ' MUZIEK.'){
			output = null;
		}
		else if(typeof output.text == 'string' && output.text.startsWith('!!!!!!!!!!!!!!!!!')){
			output = null;
		}
		
		// Check if the words are sensible. In very rare occasions Whisper freaks out
		if(output != null && typeof output.chunks != 'undefined' && output.chunks.length > 40){
			let words_spotted = [];
			for(let w = 0; w < output.chunks.length; w++){
				if(typeof output.chunks[w].text == 'string' && words_spotted.indexOf(output.chunks[w].text) == -1){
					words_spotted.push(output.chunks[w].text);
				}
			}
			if(words_spotted.length < output.chunks.length/10){
				console.error("Whisper went haywire, creating looping output");
				
				let unlooped_text = '';
				let found_the_loop = false;
				let maximum_trim = output.text.length;
				let best_loop = null;

				let max_test_length = Math.round(output.text.length / 3);
				if(max_test_length > 100){
					max_test_length = 100;	
				}
				for(let q = output.text.length; q > max_test_length; --q){
					//console.log("q:",q);
					let loop_text = '';
					let test_text = output.text.substr(0,q);
					//console.log("test_text:", test_text);
	
					for(let e = test_text.length - 1; e > Math.round(test_text.length / 3); --e){
						//console.log(e,test_text.charAt(e));
						//break
		
						loop_text = test_text.charAt(e) + loop_text;
						if(loop_text.length > 7){
							const tester = test_text.substr(e - loop_text.length,loop_text.length);
							//console.log("tester: ", tester, loop_text);
							if(tester == loop_text){
								//console.log("BINGO: ", loop_text);
								if(output.text.indexOf(loop_text) < maximum_trim){
									//console.log("Found an even better loop: ", loop_text);
									best_loop = loop_text;
								}
								//found_the_loop = true;
								break
							}
						}
		
					}
	
				}
				if(best_loop != null){
					output.text = output.text.substr(0,(output.text.indexOf(best_loop) + best_loop.length));
					//console.log("Fixed un-looped output.text: ", output.text);
					let remake = '';
					if(typeof output.chunks != 'undefined'){
						for(let w = 0; w < output.chunks.length; w++){
							remake += output.chunks[w] + ' ';
							//console.log("remake: ", remake);
							if(remake.length > output.text.length){
								//console.log("remake: ", remake);
								output.chunks.splice(w+1,output.chunks.length);
								console.error("Fixed un-looped output.chunks: ", output.chunks);
								break
							}
						}
					}
				}
				else{
					console.error("COULD NOT FIX WHISPER GONE HAYWIRE");
					output = null;
				}
				
			}
		}
		
		
		if(self.interrupted){
		    self.postMessage({
				task: task,
		        status: "interrupted",
		    });
			return null
		}
		
		
		return output
		
	}
	catch(err){
		console.error("Whisper worker: caught error in transcribe function: ", err);
		self.busy_transcribing = false;
		self.processing = false;
		
		if( ('' + err).indexOf('revious buffer is not registered') != -1){
			console.error("whisper worker: the error in the transcribe function was caused by ONNX issues");
		    self.postMessage({
				task: task,
		        status: "reset_me",
		        error: "ONNX issue",
		    });
		}
		else{
		    self.postMessage({
				task: task,
		        status: "error",
		        error: "caught error in transcribo function",
		    });
		}
		
	    
		return null;
	}
    
};

*/






function count_properties_in_list(funky_list,property_name){
	let found_properties = [];
	if(typeof property_name == 'string' && typeof funky_list == 'object' && funky_list != null && Array.isArray(funky_list)){
		for(let x = 0; x < funky_list.length; x++){
			if(typeof funky_list[x][property_name] != 'undefined'){
				if(found_properties.indexOf(funky_list[x][property_name]) == -1){
					found_properties.push(funky_list[x][property_name]);
				}
			}
		}
	}
	else{
		console.error("count_properties_in_list: invalid input: ", funky_list, property_name);
	}
	return found_properties
}







function min(arr) {
    if (arr.length === 0) throw Error('Array must not be empty');
    let min = arr[0];
    let indexOfMin = 0;
    for (let i = 1; i < arr.length; ++i) {
        if (arr[i] < min) {
            min = arr[i];
            indexOfMin = i;
        }
    }
    return [min, indexOfMin];
}

function max(arr) {
    if (arr.length === 0) throw Error('Array must not be empty');
    let max = arr[0];
    let indexOfMax = 0;
    for (let i = 1; i < arr.length; ++i) {
        if (arr[i] > max) {
            max = arr[i];
            indexOfMax = i;
        }
    }
    return [Number(max), indexOfMax];
}

function isPowerOfTwo(number) {
    // Check if the number is greater than 0 and has only one bit set to 1
    return (number > 0) && ((number & (number - 1)) === 0);
}




function softmax(arr) {
    // Compute the maximum value in the array
    const maxVal = max(arr)[0];

    // Compute the exponentials of the array values
    const exps = arr.map(x => Math.exp(x - maxVal));

    // Compute the sum of the exponentials
    // @ts-ignore
    const sumExps = exps.reduce((acc, val) => acc + val, 0);

    // Compute the softmax values
    const softmaxArr = exps.map(x => x / sumExps);

    return /** @type {T} */(softmaxArr);
}


function samples_to_frames(samples) {
	const offset = 0;
	const step = 128;
	return ((samples - offset) / step);
}

async function local_post_process_speaker_diarization(logits, num_samples) {
	//console.log("in local_post_process_speaker_diarization. num_samples: ", num_samples);
    
	/*
	const ratio = (
        num_samples / this.samples_to_frames(num_samples)
    ) / 16000;
	*/
	
	const ratio = 1;
	

    const results = [];
    for (const scores of logits.tolist()) {
        const accumulated_segments = [];

        let current_speaker = -1;
		//console.log("local_post_process_speaker_diarization: scores: ", scores);
		
        for (let i = 0; i < scores.length; ++i) {
            const probabilities = softmax(scores[i]);
			//console.log("local_post_process_speaker_diarization: probabilities: ", probabilities);
            const [score, id] = max(probabilities);
			//console.log("local_post_process_speaker_diarization: score, id: ", score, id);
            const [start, end] = [i, i + 1];

            if (id !== current_speaker) {
				//console.log("local_post_process_speaker_diarization: speaker has changed: ", current_speaker, " -> ", id);
                // Speaker has changed
                current_speaker = id;
                accumulated_segments.push({ id, start, end, score });
            } else {
                // Continue the current segment
                accumulated_segments.at(-1).end = end;
                accumulated_segments.at(-1).score += score;
            }
        }
		//console.log("local_post_process_speaker_diarization: accumulated_segments: ", accumulated_segments);
		
        results.push(accumulated_segments.map(
            // Convert frame-space to time-space
            // and compute the confidence
            ({ id, start, end, score }) => ({
                id,
                start: start * ratio,
                end: end * ratio,
                confidence: score / (end - start),
            })
        ));
    }
    return results;
}

















async function deepen_segments(processor, model, audio, segments){
	//console.log("in deepen_segments");
	let diarization_ids_spotted = [];

	
	try{
		
		for(let es = segments.length - 1; es >= 0; es--){
			if(segments[es].id > 0 && segments[es].id < 4){
				if(diarization_ids_spotted.indexOf(segments[es].id) == -1){
					diarization_ids_spotted.push(segments[es].id);
				}
			}
		}
		//console.log("deepen_segments: diarization_ids_spotted: ", diarization_ids_spotted);
		if(diarization_ids_spotted.length > 1){
			for(let es = segments.length - 1; es >= 0; es--){
		
				if(segments[es].id > 0 && segments[es].id < 4){
					segments[es].depth = 0;
					if(diarization_ids_spotted.indexOf(segments[es].id) == -1){
						diarization_ids_spotted.push(segments[es].id);
						//console.log("deepen_segments:  first segment ID spotted was: ", segments[es].id);
					}
					//console.log("deepen_segments: ", es, segments[es].id, segments[es].end - segments[es].start);
					
					if(diarization_ids_spotted.length > 0 && segments[es].end - segments[es].start > 3){ // segments[es].id == 3 && 
						console.error("deepen_segments: SPLITTING FURTHER: ", es, ", dur: ", segments[es].end - segments[es].start);
						//segments_to_possibly_split_further.push(s);
						//segments[s] = segment_further(processor, model, audio, segments[s]);
						//console.log("deepen_segments: calling segment_further");
						const smaller_segments = await segment_further(processor, model, audio, segments[es], 0, es); // .slice(segments[es].start * 16000, segments[es].end * 16000)
						console.error("deepen_segments: smaller_segments: ", smaller_segments);
						if(smaller_segments && smaller_segments.length > 1){
							segments.splice(es,1, ...smaller_segments);
						}
					
					}
					else{
						//console.log("not deepening:  diarization.id, segment: ", segments[es].id, segments[es]);
					}
				}
				else{
					//console.log("deepen_segments: ", es, segments[es].id, segments[es].end - segments[es].start);
				}
		
				// Sometimes there are weird, very short segments at the beginning, less than a tenth of a second long. This causes them to be pruned later
				// Perhaps there's a bug in the audio worklet recording buffer?
		
				//joined_segment_end = segments[s].end;
			}
			
			console.error("deepen_segments: FINAL DEEPEN FURTHER_SPLIT_SEGMENTS: \n\n", JSON.stringify(segments,null,4));
		}
		else{
			//console.log("deepen_segments: NICE AND EASY: only detected one solo speaker in the entire audio");
		}
	}
	catch(err){
		console.error("deepen_segments: caught error: ", err);
	}
	
	
	await delay(10); // atttempt to avoid crashing mobile phones by giving other processes some time
	return segments
}





async function segment_further(processor, model, audio, long_segment, depth=0, parent_segment_index=null){
	//console.log("deepen: in segment_further.  depth,long_segment,parent_segment_index: ", depth, long_segment, parent_segment_index);
	try{
		
		if(depth > 3){
			//console.log("deepen: segment_further is too deep (4). returning segment");
			return long_segment;
		}
	
		depth++;
		//console.log("deepen: segment_further:  depth,parent_segment_index: ", depth, parent_segment_index);
		//long_segment.depth = depth;
	
	
		if(typeof long_segment.start == 'number' && typeof long_segment.end == 'number'){
			if(typeof long_segment.start_frame != 'number'){
				long_segment.start_frame = long_segment.start * 16000;
				long_segment.end_frame = long_segment.end * 16000;
			}
		
			let sub_segments = await really_segment(processor, model, audio.slice(Math.round(long_segment.start_frame), Math.round(long_segment.end_frame)));
			//console.log("deepen: segment_further: sub_segments: ", sub_segments);
	
			let sub_diarization_ids_spotted = [];
			if(sub_segments){
				//let sub_segments_to_possibly_split_further = [];
		
				for(let su = sub_segments.length - 1; su >= 0; su--){
					if(sub_segments[su].id > 0 && sub_segments[su].id < 4 && sub_diarization_ids_spotted.indexOf(sub_segments[su].id) == -1){
						sub_diarization_ids_spotted.push(sub_segments[su].id);
						//console.log("deepen: segment_further: first sub_segment ID spotted was: ", sub_segments[su].id);
					}
				}
					
				if(sub_diarization_ids_spotted.length > 1){
					
					for(let su = sub_segments.length - 1; su >= 0; su--){
						//console.log("-looping over sub_segments: ", JSON.stringify(sub_segments[su],null,2));
					
						sub_segments[su].parent_original_index = parent_segment_index;
						sub_segments[su].parent_original = JSON.parse(JSON.stringify(long_segment));
						sub_segments[su].depth = depth;
					
						if(sub_diarization_ids_spotted.length > 1 && typeof sub_segments[su].start == 'number' && typeof sub_segments[su].end == 'number' && typeof sub_segments[su].id == 'number'){
							//console.log("deepen: segment_further: child segment looks valid.  start, end:", sub_segments[su].start, sub_segments[su].end);
						
							sub_segments[su].start_frame = long_segment.start_frame + (sub_segments[su].start * 16000);
							sub_segments[su].end_frame = long_segment.start_frame + (sub_segments[su].end * 16000);
			
							sub_segments[su].start += long_segment.start; // + sub_segments[su].start;// + (sub_segments[su].end_frame / 16000);
							sub_segments[su].end += long_segment.start; //= sub_segments[su].end + (sub_segments[su].end_frame / 16000);
						
							if(sub_segments[su].id > 0 && sub_segments[su].id < 4){
								//console.log("deepen: segment_further: child segment has useful diarization id: ", sub_segments[su].id);
								
								if(depth == 1){
									sub_segments[su].id = sub_segments[su].id + 100;
								}
								else if(depth == 2){
									sub_segments[su].id = sub_segments[su].id + 1000;
								}
								else if(depth == 3){
									sub_segments[su].id = sub_segments[su].id + 10000;
								}
								
								if(sub_diarization_ids_spotted.indexOf(sub_segments[su].id) == -1){
									sub_diarization_ids_spotted.push(sub_segments[su].id);
								}
								if(sub_segments[su].end - sub_segments[su].start > 5){  // sub_segments[su].id == 3 && 
									
									//sub_segments_to_possibly_split_further.push(su);
									const smaller_segments = await segment_further(processor, model, audio, sub_segments[su], depth); // .slice(sub_segments[su].start_frame,sub_segments[su].end_frame)
									if(smaller_segments && smaller_segments.length > 1){
										sub_segments.splice(su, 1, ...smaller_segments);
									}
								
								}
							}
						}
						else{
							console.error("deepen: segment_further: segment has missing properties: ", sub_segments[su]);
						}
					}
			
					console.warn("deepen: segment_further: RETURNING SPLIT-UP SEGMENT");
					return sub_segments;
				}
				else{
					console.warn("deepen: segment_further: sub_diarization_ids_spotted was boring: ", sub_diarization_ids_spotted.length, sub_diarization_ids_spotted);
				}
				//console.log("sub_segments_to_possibly_split_further: ", sub_segments_to_possibly_split_further);
			}
		}
		
	}
	catch(err){
		console.error("deepen: segment_further: caught error: ", err);
	}
	console.warn("deepen: segment_further: BORING split, so returning original long_segment");
	return long_segment;
}



async function really_segment(processor, model, audio, preload=false){
    const inputs = await processor(audio);
    const { logits } = await model(inputs);
	//console.log("segment logits: ", logits, logits[0]);
	
	//console.log("really_segment: SIGMOID LIST: ", logits[0].sigmoid().tolist());
    const labels = logits[0].sigmoid().tolist().map(
        frames => frames.map(speaker => speaker > 0.5 ? 1 : 0)
    );
    //console.log("really_segment: SIGMOID labels: ",labels); // labels is a one-shot array of shape (num_frames, num_speakers)
	
	//const post_segments = processor.post_process_speaker_diarization(logits, audio.length);
   	await delay(10);
	const segments = await processor.post_process_speaker_diarization(logits, audio.length)[0];
	//const segments = await local_post_process_speaker_diarization(logits, audio.length)[0];
	//console.log("local_post_process_speaker_diarization returned segments: ", segments);
	await delay(10);
	return segments;
}





async function segment(processor, model, audio, warmup=false) {
	//console.log("in segment");
	//self.chunks_to_verify = [];
	
     //processor.post_process_speaker_diarization(logits, audio.length)[0];
	//console.log("audio.length, audio.length in seconds, segments: ", audio.length, audio.length/16000, segments);
    // Attach labels
	
	
	//let new_segments = [];
	let segments = await really_segment(processor, model, audio);
	self.original_segments = JSON.parse(JSON.stringify(segments));
	//console.log("\n\n\n\noriginal_segments: \n", JSON.stringify(self.original_segments),"\n\n\n");
	
	
	
	if(warmup){
		//console.log("segment: warming up only");
		return
	}
	
	
	let minimum_confidence = 0.5;
	let found_speakers = [];
	
	for(let x = 0; x < segments.length; x++){
		segments[s]['original_id'] = segments[s].id;
		if(typeof segments[x].id == 'number' && segments[x].id > 0 && segments[x].id < 4){
			if(found_speakers.indexOf(segments[x].id) == -1){
				found_speakers.push(segments[x].id);
			}
		}
	}
	//console.log("found_speakers.length: ", found_speakers.length);
	//console.warn("segments.length BEFORE: ", segments.length);
	
	if(found_speakers.length > 1){
		minimum_confidence = 0.7;
	}
	else{
		minimum_confidence = 0.4;
	}
	
	
	
	
	let last_speaker_id = null;
	let joined_segment_end = null;
	
	for(let s = 0; s < segments.length; s++){
		//segments[s]['original_id'] = segments[s].id;
		if(segments[s].id > 0 && segments[s].id < 4){
			last_speaker_id = segments[s].id;
		}
		if(s < 3 && segments[s].start < (s * 0.1)){
			segments[s].start = 0;
		}
		joined_segment_end = segments[s].end;
	}
	
	if(last_speaker_id != null){
		//last_speaker_id = 2;
		
		let reached_zero = false;
	
		//console.error("GOING TO FIX SEGMENTS NOW");
		for(let s = segments.length - 1; s >= 0; --s){
			//let segment = segments[s];
	    	//console.log("segment: ", s);
			if(typeof segments[s] == 'undefined'){
				console.error("segment no longer existed at position: ", s);
				continue
			}
	
			if(typeof segments[s].id == 'number' && typeof segments[s].confidence == 'number' && typeof segments[s].start == 'number' && typeof segments[s].end == 'number'){
			
				if(segments[s].id >= 4){
					console.error("SPOTTED MIXED SPEAKERS IN ORIGINAL SEGMENTS: __" + s + " -> " + segments[s].id);
				}
				// TODO could check if the last_speaker_id is a match in with the mixed speaker indicator. If not, then the last_speaker_is should switch
			
				
				// only speaker ID's of 1, 2 or 3 refer to individual speakers. zero means no speaker (silence), and 4 and above is for combinations of speakers (speaking at the same time)
				// TODO: this just steamrolls over mixed speakers, assigning the ID of the speaker that ends up speaking on it's own afterwards.
				if( (segments[s].id == 0 || segments[s].id >= 4) && last_speaker_id != null){
					//console.log("changing a segment's ID.  old -> new, and duration: ", segments[s].id,last_speaker_id,segments[s].end - segments[s].start);
					
					segments[s].id = last_speaker_id;
				}
			
				if( (segments[s].id > 0 && segments[s].id < 4) || (segments[s].id == 0 && confidence > 0.8 && (segments[s].end - segments[s].start) > 2) ){ // NEW: long periods of silence may now remain
					//console.log("segment has good single speaker ID: ", segments[s].id);
					
					
					if(segments[s].id != last_speaker_id){
						//console.log("switching to another speaker");
						
						last_speaker_id = segments[s].id;
						joined_segment_end = segments[s].end;
						
						
					}
					else{
						//console.log("still the same speaker speaking");
						if(joined_segment_end != null){
							if(joined_segment_end != segments[s].end){
								segments[s].end = joined_segment_end;
			
								if(typeof segments[s + 1] != 'undefined' && segments[s+1].id == segments[s].id && reached_zero == false){
									//console.log("removing older segment with the same ID as this one: __" + s, segments[s].id);
									segments.splice(s + 1, 1);
								}
							}
			
						}
		
					}
				
				}
				
				// TODO: Could distinguish between silence and mixed speakers here
				else{
					console.error("segment has bad speaker ID: ", segments[s]);
				}
			
				if(segments[s].start == 0 && reached_zero == true){
					segments.splice(s, 1);
				}
				else if(segments[s].start == 0 && reached_zero == false){
					reached_zero = true;
				}
			
				//console.log("reached_zero: ", reached_zero);
				//console.log("joined_segment_end: ", joined_segment_end);
			
			}
			else{
				console.error("segment was missing basic attributes: ", segments[s]);
			}
		
	    }
	
		//console.warn("segments.length AFTER: ", segments.length);
		//console.log("simpified segments: ", segments);

	}
	
    return segments;
}



async function verify_audio(verification_processor, verification_model, audio, veri_start_frame, veri_end_frame, verification_sentence, verification_text='missing verification_text',speaker_id_to_skip=null){
	//console.log("in verify_audio");
	let segments_s = {};
	let identity = null;
	let verification_start_stopwatch = Date.now();
	let comparison = null;
	
	if(typeof speaker_id_to_skip == 'number'){
		//console.log("verify_audio: a speaker_id to skip was provided: ", speaker_id_to_skip);
		//console.log("verify_audio: existing fingerprints: ", JSON.stringify(self.fingerprints,null,2));
	}
	
	
	let force_add_speaker = false;
	if(typeof speaker_id_to_skip == 'number' && self.fingerprints.length == 1){
		//force_add_speaker = true;
	}
	
	try{
		//console.log("verify_audio: VERIFYING AUDIO... veri_start_frame: ", veri_start_frame ,", veri_end_frame: ", veri_end_frame, ",  --> theoretical audio duration: ", (veri_end_frame - veri_start_frame));


		if(veri_start_frame < 0){
			console.error("verify_audio: veri_start_frame was less than zero: ", veri_start_frame);
			veri_start_frame = 0;
		}
		if(veri_start_frame > audio.length){
			console.error("verify_audio: veri_start_frame is bigger than the audio length!: ", veri_start_frame, audio.length);
			veri_start_frame = audio.length - 4000;
		}
		if(veri_end_frame > audio.length){
			console.error("verify_audio: veri_end_frame is bigger than the audio length: ", veri_end_frame, audio.length);
			veri_end_frame = audio.length;
		}
		else{
			//console.log("VERIFYING AUDIO: ", audio.slice(veri_start_frame, veri_end_frame));
			/*
			self.postMessage({ // sending verification_audio
		        status: 'verification_audio',
		        audio: audio.slice(veri_start_frame, veri_end_frame),
				message:verification_text,
				//speaker_id:self.fingerprints[identity].id,
		    });
			*/
			
		}



		let added_fingerprint = false;
		
		// CALLING VERIFY
		//console.log("verify_audio: delaying");
		await delay(10);
		//console.log("verify_audio: delay done, calling verify()"); //  with audio: ", audio.slice(veri_start_frame, veri_end_frame)
		let fresh_fingerprint = await verify(verification_processor, verification_model, audio.slice(veri_start_frame, veri_end_frame));
		
		await delay(10);
		
		if(typeof fresh_fingerprint != 'undefined' && fresh_fingerprint != null){
			
			comparison = compare_fingerprints(fresh_fingerprint, speaker_id_to_skip);


			//console.log("verify_audio: comparing done.  comparison: ", comparison);
			//console.log("verify audio: force_add_speaker: ", force_add_speaker);
			
			if(self.fingerprints.length == 0){
				comparison.highest_match = 0.90;
			}

			if(typeof comparison.highest_match == 'number'){ //  && highest_match > 0
				//self.matches.push(highest_match);
				//console.log("verify segment: added match percentage to history of all matches.  self.matches: ", self.matches);
				segments_s.match_percentage = (Math.round(comparison.highest_match * 1000000)/100) / 100;
				//fingerprint_to_segment_id_mapping['s' + segments_s.id]['verification_matches'].push(segments_s.match_percentage);
			}
			
			// force_add_speaker: if diarization detects two speakers in the audio, but only one fingerprint is known, then it can force the addition of a new fingerprint
			if(comparison.found_index == null || force_add_speaker){ //  && highest_match > 0

				if(comparison.highest_match < self.similarity_threshold || force_add_speaker){
					//console.log("verify audio: adding new speaker. comparison.highest_match was: ", comparison.highest_match);
					self.fingerprints.push({'embedding':fresh_fingerprint,'embeddings':[fresh_fingerprint],'id':next_fingerprints_id,'speaker_name':self.speaker_translation + ' ' + (next_fingerprints_id),'force_added':force_add_speaker,'verification_text':verification_text});
					
					// 0 + next_fingerprints_id; //
					identity = self.fingerprints.length - 1; // TODO: is this a bad idea? does the fingerprints array shrink?
					next_fingerprints_id++;
					added_fingerprint = true;
					//comparison.found_index = self.fingerprints.length - 1;
					//console.log("verify segment: new self.fingerprints: ", self.fingerprints);
				}
				else{

					//console.log("verify segment: IN DUBIO, could be a new speaker, but not too sure");
					//if(self.fingerprints.length > 3 && highest_match < 0.92){

					//}
					//console.log("verify_audio: IN DUBIO, but adding new speaker anyway");
					self.fingerprints.push({'embedding':segments_s.fingerprint,'id':next_fingerprints_id,'speaker_name':self.speaker_translation + ' ' + (next_fingerprints_id),'force_added':force_add_speaker,'verification_text':verification_text,'dubio':comparison.highest_match}); // self.speaker_translation + (identity + 1)
					
					//found_index = self.fingerprints.length - 1;
					identity = self.fingerprints.length - 1;
					//identity = 0 + next_fingerprints_id;
					next_fingerprints_id++;
					added_fingerprint = true;
					//console.log("verify segment: new self.fingerprints: ", self.fingerprints);


				}
				//console.log("verify_audio: self.fingerprints is now: ", self.fingerprints)
			}
			else{
				identity = comparison.found_index;
				
				if(typeof self.fingerprints[identity] != 'undefined' && typeof self.fingerprints[identity].embeddings != 'undefined' && self.fingerprints[identity].embeddings.length < 4){
					
					// TODO: could make it so that this can only happen if the previous sentence was also this speaker, if there is absolute certainty in all the sentence parts
					if(comparison.highest_match > self.similarity_threshold && self.fingerprints[identity].embeddings.length < 2){
						//console.log("verify_audio: adding second embedding to fingerprint embeddings list");
						self.fingerprints[identity].embeddings.push(fresh_fingerprint);
					}
					else if(comparison.highest_match > self.perfect_similarity_threshold && comparison.highest_average_match > self.similarity_threshold){
						//console.log("verify_audio: that was a pretty much perfect match. Adding it to the fingerprint's embeddings list");
						self.fingerprints[identity].embeddings.push(fresh_fingerprint);
					}
				}
				
				
			}
		    //return found_index; //{'speaker_id':found_index,'speaker_name':speaker_name,'consent':consent}


			//found_index;

			


			//console.log("verify_audio: verify returned identity: ", identity);
			//delete segment.audio;

			if(typeof identity == 'number'){ // identity is the index of the match in the self.fingerprints list

				//let segment_text = segment.text;
				
				if(typeof self.fingerprints[identity].consent == 'boolean'){
					segments_s.consent = self.fingerprints[identity].consent;
					segments_s.print = JSON.parse(JSON.stringify(self.fingerprints[identity]));
					if(typeof segments_s.print.embedding != 'undefined'){
						delete segments_s.print.embedding;
					}
					if(typeof segments_s.print.embeddings != 'undefined'){
						delete segments_s.print.embeddings;
					}
				}
				
				//console.log("verify_audio: fingerprint_to_segment_id_mapping: ", typeof fingerprint_to_segment_id_mapping, fingerprint_to_segment_id_mapping);
				/*
				let verified = false;
				if(typeof self.fingerprint_matches['' + segment.id] == 'undefined'){
					//console.log("adding to self.fingerprint_matches lookup: ", '' + segment.id, " -> ", identity);
					self.fingerprint_matches['' + segment.id] = identity;
					fingerprint_to_segment_id_mapping['s' + segments_s.id].speaker_id = identity;
					verified = true;
				}
				else if(self.fingerprint_matches['' + segment.id] != identity){
					console.error("That segment ID was already correlated to a speaker fingerprint. It seems two different speakers have the same fingerprint..");
					//identity = await verify(self.verification_processor, self.verification_model, segment.audio); // force adding a new fingerprint // , false, [identity]

					verified = true;
				}
				else{
					//console.log("OK, segment ID matched with fingerprint ID again");
					verified = true;
				}
				*/
				
				let verified = true;

				if(verified){
					//console.log("verify_audio: self.fingerprints[identity]: ", self.fingerprints[identity]);
					if(typeof self.fingerprints[identity] != 'undefined' && typeof self.fingerprints[identity].id == 'number'){
						segments_s.speaker_id = self.fingerprints[identity].id;
					}

					segments_s.verified = true;

					let consent = null;
					let speaker_name = null;
					
					if(typeof verification_sentence == 'string' && verification_sentence.length > 10 && verification_sentence.length < 80 && verification_sentence.indexOf('.') != -1){
						let check_text = verification_sentence.toLowerCase();


						verification_sentence = verification_sentence.substr(0,verification_sentence.indexOf('.'));

						if(check_text.startsWith('consent to ') || check_text.startsWith('agree ')){
							check_text = "i " + check_text;
						}

						check_text = ' ' + check_text;
						//console.log("verify_segments: check_text:  -->" + check_text + "<--");

						if( check_text.indexOf(' voice') != -1 && check_text.indexOf(' record') != -1){
							if(check_text.startsWith(' i can send to recording')){
								consent = true;
							}
							else if(check_text.startsWith(' i contend to recording')){
								consent = true;
							}
							else if(check_text.startsWith(' i can sense to recording')){
								consent = true;
							}
							else if(check_text.startsWith(' i can censor recording')){
								consent = true;
							}
							else if(check_text.startsWith(' i can sense it recording')){
								consent = true;
							}
							else if(check_text.indexOf(' allowed to record ') != -1){
								consent = true;
							}



							else if(check_text.indexOf(' i agree ') != -1 || check_text.indexOf(' i consent') != -1 || check_text.indexOf(' i allow') != -1 || check_text.indexOf(' you may ') != -1 || check_text.indexOf(" i'm ok with ") != -1 || check_text.indexOf(" i am ok with ") != -1){
								if(check_text.indexOf(' you may not') == -1){
									consent = true;
								}
							}
							if(check_text.indexOf(' do not ') != -1 || check_text.indexOf(" don't ") != -1 || check_text.indexOf(' may not ') != -1 || check_text.indexOf(' i revoke') != -1 || check_text.indexOf(' i am revoking ') != -1){
								consent = false;
							}
							//console.log("verify_segments: consent is now: ", consent, ", based on: " ,check_text);

						}

						if( check_text.indexOf(' mag mijn stem opnemen') != -1){
							consent = true;
						}
						if( check_text.indexOf(' mag mijn stem niet opnemen') != -1 || check_text.indexOf(' mag niet mijn stem opnemen') != -1 || check_text.indexOf(' mijn stem mag opgenomen worden') != -1){
							consent = false;
						}


						if(typeof consent == 'boolean'){
							self.fingerprints[identity].consent = consent;
							segments_s.consent = consent;
							self.postMessage({
						        status: 'consent',
						        data: consent,
								speaker_id:self.fingerprints[identity].id,
						    });
							post_speakers_list();
						}

						//console.log("check_text: -->" + check_text + "<--");
						if( check_text.trim().startsWith('my name is ') || check_text.trim().startsWith('mijn naam is ')){

							let name_text = verification_sentence.substr( (verification_sentence.indexOf(' is ') + 4));

							//console.log("verify_segments: initial name_text: ", name_text);
							if(name_text.indexOf('.') != -1){
								name_text = name_text.substr(0,name_text.indexOf('.'));
							}
							if(name_text.indexOf(' and ') != -1){
								name_text = name_text.substr(0,name_text.indexOf(' and '));
							}
							else if(name_text.indexOf(' en ') != -1){
								name_text = name_text.substr(0,name_text.indexOf(' en '));
							}
							name_text = name_text.trim();
							//console.log("verify_segments: my name is: ", name_text);
							if(name_text.length > 35){
								if(name_text.indexOf(' ') > 0){
									const name_text_parts = name_text.split(' ');
									let shorter_name = '';
									for(let np = 0; np < name_text_parts.length; np++){
										if(shorter_name.length + name_text_parts[np].length < 34){
											if(shorter_name == ''){
												shorter_name = name_text_parts[np];
											}else{
												shorter_name = shorter_name + ' ' + name_text_parts[np];
											}

										}
									}
									if(shorter_name.length){
										//console.warn("verify_segments: had to make name shorter: ", shorter_name);
										name_text = shorter_name;
									}
								}

							}

							if(name_text.length > 1){
								speaker_name = name_text;
							}

						}

						if(typeof speaker_name == 'string'){
							self.fingerprints[identity].speaker_name = speaker_name;
							segments_s.speaker_name = speaker_name;
							self.postMessage({
						        status: 'speaker_name',
						        data: speaker_name
						    });
						}
					}



					if(typeof identity == 'number' && typeof self.fingerprints[identity] != 'undefined'){
						if(typeof speaker_name == 'string'){
							self.fingerprints[identity].speaker_name = speaker_name;
						}


						if(typeof consent == 'boolean'){
							self.fingerprints[identity].consent = consent;
	
						}

						let has_consent = false;
						if(typeof self.fingerprints[identity].consent == 'boolean'){
							segments_s.consent = self.fingerprints[identity].consent;
							if(self.fingerprints[identity].consent == true){
								has_consent = true;
							}
						}

						if(has_consent){
							segments_s.consent = true;
						}
						else{
							segments_s.consent = false;
						}

						
						if(typeof self.fingerprints[identity].speaker_name == 'string'){
							segments_s.speaker_name = self.fingerprints[identity].speaker_name;
							post_speakers_list();
							//verification_sentence = '_' + self.fingerprints[identity].speaker_name + '_: ' + verification_sentence;
						}
						else{
							//console.error("whisper worker: missing speaker name for fingerprint. fingerprints: ", fingerprints);
							//verification_sentence = '_' + self.speaker_translation + (identity + 1) + '_: ' + verification_sentence;
						}

						

					}
					else{
						//console.error("verify_audio: missing fingerprint for this identity.  identity,self.fingerprints.length,self.fingerprints:", identity, self.fingerprints.length, self.fingerprints);
					}
					
				}
				else{
					console.error("verify_audio: INVALID VERIFICATION\n");
				}

			}
			else{
				console.error("verify_audio: verify returned null");
				//segment.text = 'Unsure';
				segments_s.doubt = true;
				//segment.actual_text = segment_text;
				//segment.text = segment_text;

			}
			
			if(added_fingerprint){
				//console.log("a fingerprint was added");
				post_speakers_list();
			}
		}

	}
	catch(err){
		console.error("verify_audio: caught error calling audio verification model: ", err);
	}
	//console.log("verify_audio: verification duration stopwatch: ", (Date.now() - verification_start_stopwatch), verification_sentence);
	segments_s['comparison'] = comparison;
	
	return segments_s;
}















function show_fingerprints_debug(){
	//console.log("in show_fingerprints_debug");
	const fingerprints_copy = JSON.parse(JSON.stringify(self.fingerprints));
	for(let fip = 0; fip < fingerprints_copy.length; fip++){
		if(typeof fingerprints_copy[fip].embedding != 'undefined'){
			delete fingerprints_copy[fip].embedding;
		}
		if(typeof fingerprints_copy[fip].embeddings != 'undefined'){
			delete fingerprints_copy[fip].embeddings;
		}
	}
	//console.warn("show_fingerprints_debug: fingerprints_copy: " + fingerprints_copy.length, "\n",JSON.stringify(fingerprints_copy,null,4));
}


async function verify_segments(segments, chunks, audio=null, verification_processor, verification_model){
	//console.log("in verify_segments.  segments,chunks: ", segments,chunks); // ,audio,verification_processor,verification_model
	
	let raw_sentences = [];
	
	//show_fingerprints_debug()
	
	
	try{
		if(typeof verification_processor == 'function' && typeof verification_model == 'function' && audio != null){
			
			let meta_characters = [')',']','*']; // '♪' // music note
			let all_meta_characters = ['(','[',')',']','*']; // '♪' // music note
			
			let full_duration = 0;
			let wonky_timestamps = false;
			self.fingerprint_matches = {};
			let fingerprint_to_segment_id_mapping = {};
			let fingerprint_count = 0;
			let found_fingerprints = [];
			let found_speaker_count = 0;
			
			let found_speakers = [];
			
			let music_spotted = 0;
			
			let id_map = {};
			let final_id_map = {};
			let speaker_certainty_map = {};
			
			
			
			
			/*
			for(let x = 0; x < segments.length; x++){
				if(typeof segments[x].id == 'number' && segments[x].id > 0 && segments[x].id < 4){
					if(found_speakers.indexOf(segments[x].id) == -1){
						found_speakers.push(segments[x].id);
					}
				}
			}
			*/
			
			let in_meta_chunks = false;
			for(let c = 0; c < chunks.length; c++){
				//console.log("adding words to original_segments: ", chunks[c].text,chunks[c].timestamp[0],chunks[c].timestamp[1]);
				chunks[c].index_in_task = c;
				chunks[c].task_index = self.task.index;
				chunks[c].verify_audio_results = [];
				
				
				if(chunks[c].text == ' (bleep)'){
					chunks[c].text = ' -bleep-';
				}
				
				
				if(chunks[c].text.trim().startsWith('[') || chunks[c].text.trim().startsWith('(') ){ // || (chunks[c].text.trim().startsWith('*') && in_meta_chunks == false)
					in_meta_chunks = true;
					chunks[c].meta_chunk = true;
				}
			
				if(in_meta_chunks){
					chunks[c].meta_chunk = true;
					chunks[c].diarization_id = 0;
				}
				else{
					chunks[c].meta_chunk = false;
				}
			
				if(chunks[c].text.trim().endsWith(']') || chunks[c].text.trim().endsWith(')') ){ // || chunks[c].text.trim().endsWith('*')
					chunks[c].meta_chunk = true;
					in_meta_chunks = false;
				
				}
				
				
				
				// 
				
				//if(typeof self.task.)
				let found_segment_to_place_word_in = false;
				
				for(let x = 0; x < self.original_segments.length; x++){
					if(typeof self.original_segments[x].words == 'undefined'){
						//console.log("original_segments: creating empty words array");
						self.original_segments[x].words = [];
					}
					
					
					if(chunks[c].timestamp[0] >= self.original_segments[x].start && chunks[c].timestamp[0] <= self.original_segments[x].end){
						//console.error("CHUNK FIT PERFECTLY INSIDE A SEGMENT: ", chunks[c], self.original_segments[x]);
						//console.log("original_segments: BIGGER: __" + x, chunks[c].text, chunks[c].timestamp[0], chunks[c].timestamp[1], " starts in ", self.original_segments[x].start, self.original_segments[x].end);
						
						
						
						if(typeof original_segments[x].confidence == 'number'){
							chunks[c]['segment_confidence'] = original_segments[x].confidence;
						}
						
						if(typeof chunks[c].diarization_id == 'number'){
							if(self.original_segments[x].id > 0 && self.original_segments[x].id < 4){
								console.warn("replacing segment id of word with a better one that actually matches a single speaker: ", chunks[c].text, self.original_segments[x].id);
								chunks[c].diarization_id = self.original_segments[x].id;
							}
						}
						else{
							chunks[c].diarization_id = self.original_segments[x].id;
						}
						
						self.original_segments[x].words.push(chunks[c]);
						found_segment_to_place_word_in = true;
						
						//break
					}
					else if(chunks[c].timestamp[1] - chunks[c].timestamp[0] > 0.1 && self.original_segments[x].end - self.original_segments[x].start > 0.1 && ((chunks[c].timestamp[1] + chunks[c].timestamp[0])/3) >= self.original_segments[x].start && ((chunks[c].timestamp[1] + chunks[c].timestamp[0])/1.5) <= self.original_segments[x].end){
						console.error("CHUNK DID NOT PERFECTLY FIT INSIDE A SEGMENT, IT WAS A SQUEEZE: ", chunks[c], self.original_segments[x]);
						chunks[c].diarization_id = self.original_segments[x].id;
						self.original_segments[x].words.push(chunks[c]);
						found_segment_to_place_word_in = true;
						
					}
					else if( ((chunks[c].timestamp[1] + chunks[c].timestamp[0])/2) >= self.original_segments[x].start && ((chunks[c].timestamp[1] + chunks[c].timestamp[0])/2) <= self.original_segments[x].end){
						console.error("WONKY CHUNK DID NOT FIT WELL AT ALL, TOOK IT'S TEMPORAL CENTER, AND FOUND A SEGMENT TO PLACE IT IN: ", chunks[c], self.original_segments[x]);
						
						chunks[c].diarization_id = self.original_segments[x].id;
						chunks[c].wonky_segment_fit = true;
						self.original_segments[x].words.push(chunks[c]);
						found_segment_to_place_word_in = true;
						
					}
					else if(in_meta_chunks){
						
					}
					else{
						//console.error("CHUNK DEFIED FITTING IN A SEGMENT: ", chunks[c] );
						
					}
				}
				
				
				if(found_segment_to_place_word_in == false){
					//console.error("FAILED TO FIND A SEGMENT DIARIZATION ID FOR A WORD: ", c, chunks[c].text, chunks[c]);
				}
			}
			//console.log("self.original_segments with added words: ", JSON.stringify(self.original_segments,null,2));
			
			
			for(let c = 0; c < chunks.length; c++){
				if(typeof chunks[c].diarization_id == 'undefined'){
					console.error("FAILED TO FIND A SEGMENT DIARIZATION ID FOR A WORD: ", c, chunks[c].text, chunks[c]);
					chunks[c].diarization_id = 0;
				}
			}
			
			
			
			
			
			
			
			//console.log("STARTING WORD FLOW VERIFICATION EXPERIMENT");
			
			let previous_solo_diarization_id = null;
			let sibling_words_container = [];
			let sibling_words = [];
			for(let c = 0; c < chunks.length; c++){
				
				
				// All the reasons that a flow of words from a single speaker may be interrupted
				if(
						previous_solo_diarization_id == null
					||	c == chunks.length - 1 					// Reached the end of all words
					||	(typeof chunks[c].meta == 'boolean' && chunks[c].meta == true)
					||	(typeof chunks[c].meta_chunk == 'boolean' && chunks[c].meta_chunk == true)
					||	(typeof chunks[c].wonky_segment_fit == 'boolean' && chunks[c].wonky_segment_fit == true)
					|| 	typeof chunks[c].diarization_id != 'number' 	// Segment has no valid diarization ID
					||(
						typeof chunks[c].diarization_id == 'number' 	// Non-single-speaker diarization ID
						&&(
							(chunks[c].diarization_id == 0 && typeof chunks[c].words == 'undefined' && c < chunks.length - 1 && typeof chunks[c + 1].diarization_id == 'number' && chunks[c + 1].diarization_id != previous_solo_diarization_id) // It seems to be a silence segment (no words array), but the word after it doesn't continue with the same speaker (so it's not just a brief pause in a solo speaker talking)
							|| (chunks[c].diarization_id == 0 && chunks[c].end - chunks[c].start > .5) // a long pause will cause bad verification, so should interrupt the flow
							|| (chunks[c].diarization_id  >= 4 && chunks[c].diarization_id <= 6) // Multiple speakers speaking at once
						) 
					)
					||(
						typeof chunks[c].diarization_id == 'number' 	// A different speaker has started speaking
						&& chunks[c].diarization_id > 0 
						&& (chunks[c].diarization_id < 4 || chunks[c].diarization_id > 6) 
						&& chunks[c].diarization_id != previous_solo_diarization_id
					)
				){
					
					
					if(previous_solo_diarization_id == null){
						sibling_words.push(chunks[c]);
					}
					else{
						console.error("\n\n\nFLOW INTERRUPTION - CHUNK WITHOUT DIARIZATION ID, OR A NON-SINGLE-SPEAKER ID, OR A DIFFERENT SPEAKER: ", c, JSON.stringify(chunks[c],null,2));
   					 	console.error("-- chunks[c].diarization_id: ", typeof chunks[c].diarization_id, chunks[c].diarization_id);
						console.error("-- previous_solo_diarization_id: ", previous_solo_diarization_id);
						
						if(sibling_words.length){
   							console.error("FLOW INTERRUPTION, AND THERE IS AN ARRAY OF SIBLING WORDS: ", JSON.stringify(sibling_words,null,2));
   							sibling_words_container.push( JSON.parse(JSON.stringify(sibling_words)) );
   							sibling_words = [];
   						}
					}
					
					if( typeof chunks[c].diarization_id == 'number' && chunks[c].diarization_id > 0 && (chunks[c].diarization_id < 4 || chunks[c].diarization_id > 6) ){
						//console.log("WORD FLOW: SETTING NEW previous_solo_diarization_id: ", previous_solo_diarization_id);
						previous_solo_diarization_id = chunks[c].diarization_id;
					}
					
				}
				else{
					//console.log("WORD FLOW: not in an interruption");
					if( chunks[c].meta_chunk == false && typeof chunks[c].diarization_id == 'number' && chunks[c].diarization_id > 0 && (chunks[c].diarization_id < 4 || chunks[c].diarization_id > 6) ){
						//console.log("WORD FLOW: (+): ", c, chunks[c].diarization_id, chunks[c].text);
						sibling_words.push(chunks[c]);
					}
					else{
						//console.log("WORD FLOW: skipping a (meta) word.  c, diarizationID, text: ",  c, chunks[c].diarization_id, chunks[c].text);
					}
				}
				
			}
			
			//console.log("WORD FLOW COMPLETE:  sibling_words_container: ", sibling_words_container);
			
			
			for(let sw = 0; sw < sibling_words_container.length; sw++){
				
				let veri_sentence = '';
				for(let wd = 0; wd < sibling_words_container[sw].length; wd++){
					veri_sentence += sibling_words_container[sw][wd].text;
				}
				//console.log("WORD FLOW: VERIFYING: ", veri_sentence, ", words count: ", sibling_words_container[sw].length);
				
				
				let verify_audio_result = null;
				
				if(sibling_words_container[sw].length > 6){
					//console.log("WORD FLOW: verifying long list or words");
					verify_audio_result = await verify_audio(verification_processor, verification_model, audio, (sibling_words_container[sw][1].timestamp[0] * 16000), (sibling_words_container[sw][sibling_words_container[sw].length-2].timestamp[1] * 16000), veri_sentence, veri_sentence);
				}
				else if(sibling_words_container[sw].length > 3){
					//console.log("WORD FLOW: verifying short list or words");
					verify_audio_result = await verify_audio(verification_processor, verification_model, audio, (sibling_words_container[sw][0].timestamp[0] * 16000), (sibling_words_container[sw][sibling_words_container[sw].length-1].timestamp[1] * 16000), veri_sentence, veri_sentence);
				}
				else{
					console.error("WORD FLOW: VERIFYING:not enough words in segment to do a good verification on: ", veri_sentence);
				}
				
				
			
				if(verify_audio_result != null){
					//console.log("WORD FLOW: VERIFYING:  verify_audio_result: ", veri_sentence, "\n",JSON.stringify(verify_audio_result,null,2));
					
					if(typeof verify_audio_result.speaker_id == 'number'){
						//console.log("WORD FLOW SPEAKER: ", verify_audio_result.speaker_id, veri_sentence)
						
						for(let wd = 0; wd < sibling_words_container[sw].length; wd++){
							if(typeof sibling_words_container[sw][wd].index_in_task == 'number'){
								chunks[ sibling_words_container[sw][wd].index_in_task ]['speaker_id'] = verify_audio_result.speaker_id;
								if(typeof verify_audio_result.speaker_name == 'string'){
									chunks[ sibling_words_container[sw][wd].index_in_task ]['speaker_name'] = verify_audio_result.speaker_name;
								}
								chunks[ sibling_words_container[sw][wd].index_in_task ]['verify_audio_result'] = verify_audio_result;
								chunks[ sibling_words_container[sw][wd].index_in_task ]['verify_audio_results'].push(verify_audio_result);
							}
						}
					}
		
				}
				else{
					console.error("WORD FLOW: verify_audio_result was null");
				}
			}
			
			//console.log("WORD FLOW: FINAL CHUNKS AFTER EARLY SEGMENT AUDIO VERIFICATION: ", JSON.stringify(chunks,null,2));
			
			
			//let original_segments = JSON.parse(JSON.stringify(segments));
			
			//console.table(original_segments, ['start', 'end', 'id', 'confidence']);
			//console.log("+");
			//console.table(segments, ['start', 'end', 'id', 'speaker_id', 'text']);
			
			
		    for (const segment of segments) {
				
				if(typeof segment.end == 'number' && segment.end > full_duration){
					full_duration = segment.end;
				}
				if( typeof segment.start == 'number' && typeof segment.end == 'number' && segment.end > segment.start){ // typeof segment.verified == 'boolean' && segment.verified == false && typeof segment.audio != 'undefined' && segment.audio.length &&
				
					if(typeof segment.duration != 'number'){
						segment.duration = segment.end - segment.start;
					}
				
					// try to get the accompanying text first. If it's a meta sound (such as [click] ), then it can be skipped.
					let segment_text = '';
					let in_meta_text = false;
					for(let x = 0; x < chunks.length; x++){
						//console.log("verify_segments:  checking chunk: ", chunks[x]);
						if(typeof chunks[x].text == 'string' && typeof chunks[x].timestamp != 'undefined' && Array.isArray(chunks[x].timestamp) && chunks[x].timestamp.length == 2){
							//console.log("verify_segments:  checking valid chunk: ", chunks[x].text, chunks[x].timestamp[0], "->", chunks[x].timestamp[1]);
							//if(chunks[x].timestamp[0] >= segment.start && chunks[x].timestamp[1] <= segment.end ){
							let chunk_text = chunks[x].text.trim();
							
							
							if(chunk_text.indexOf('♪') != -1){
								music_spotted++
							}
							
							chunk_text = chunk_text.toLowerCase();
							
							// TODO: if a meta text consists of three chunks, the middle chunk would get through.
							if(chunk_text.startsWith('[') || chunk_text.startsWith('(') || chunk_text.endsWith(']') || chunk_text.endsWith(')') || chunk_text.indexOf('*') != -1 || in_meta_text){
								
								if(chunk_text.startsWith('[') || chunk_text.startsWith('(') || chunk_text.startsWith('*')){
									in_meta_text = true;
								}
								
								if(in_meta_text){
									
									if(chunk_text.indexOf('music') != -1){
										music_spotted++
									}
									
									/*
									if(typeof segment_text.meta_text != 'string'){
										segment.meta_text = chunks[x].text;
									}
									else{
										segment.meta_text += chunks[x].text;
									}
									*/
								}
								if(chunk_text.endsWith(']') || chunk_text.endsWith(')') || chunk_text.endsWith('*')){
									in_meta_text = false;
								}
								
							}
							else{
								//segment_text += chunks[x].text;
							}
							if(in_meta_text){
								//console.log("in_meta_text: ", in_meta_text);
							}
								
							if(chunks[x].timestamp[0] >= segment.start && chunks[x].timestamp[0] < segment.end ){ // base it on the beginning of the word
								//console.log("BINGO: ", chunks[x].text);
								//if(typeof chunks[x].matched_to_segment == 'undefined'){
									//chunks[x].matched_to_segment = true;
								//}
								
								//console.log("chunk_text: ", chunk_text);
								
							}
							else{
								//console.log("text did not fit in segment: ", chunks[x].timestamp[0], " not in between: ", segment.start, segment.end);
							}
						}
					}
					//console.log("verify_segments: segment_text: ", segment_text);
				
					
					if(segment_text.indexOf('(') != -1 || segment_text.indexOf('[') != -1){
						console.error("whisper_worker: verify_segments:  this text chunk/segment is (also) for a meta sound: ", segment_text);
					}
				
					//segment_text = remove_brackets_from_string(segment_text);
					segment_text = segment_text.trim();
					if(segment_text.length > 1){
						
					
					
					}
					else{
						//console.log("verify_segments: segment text was or ended up empty");
					}
					
					//console.log("verify_segments: valid text for segment: ", segment_text); 
				
					
					
				}
				else{
					console.error("whisper_worker: SEGMENT WITHOUT VALID .start AND/OR .end ?", segment);
				}
				
			}
			
			
			/*
			if(segments.length > 1 && segments[0].end < 0.2 && segments[1].end > 1 && (segments[0].confidence < 0.6 || segments[0].verified == false )){
				console.error("removing a very short first segment");
				segments[1].start = 0;
				segments.splice(0,1);
			}
			
			if(segments.length > 1 && (segments[segments.length-1].end - segments[segments.length-1].start) < 0.2 && (segments[segments.length-2].end - segments[segments.length-2].start) > 1 && (segments[segments.length-2].confidence < 0.6 || segments[segments.length-2].verified == false )){
				console.error("removing a very short last segment");
				segments[segments.length-2].end = segments[segments.length-1].end;
				segments.splice(segments.length-1,1);
			}
			*/
			
			
			
			
			
			
			let verification_stats = [];
			
			
			
			
			let in_meta = false;
			//raw_sentences = [];
			
			
			//console.log("whisper_worker: music_spotted: ", music_spotted);
			self.task.music_spotted = music_spotted;
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			let spotted_left_over_words = true; // TODO DEBUG try to use this all the time
			for(let x = 0; x < chunks.length; x++){
				if(typeof chunks[x].matched_to_segment == 'undefined'){
					spotted_left_over_words = true;
				}
			}
			if(spotted_left_over_words){
				let sentence = '';
				let sentence_type = 'speech';
				let words = [];
				let most_seen_diarization_ids = {};
				let sentence_start_time = 0;
				let real_sentence_start_time = 0;
				let sentence_duration = 0;
				let sentence_end_time = 0;
				let sentence_has_wonky_timestamps = false;
				let first_sentence = true;
				let next_word_is_sentence_beginning = true;
				
				let first_word_index = 0;

				//clear out old text
				for(let s = 0; s < segments.length; s++){
					if(typeof segments[s].text != 'undefined'){
						//console.log("first deleting old text from segment: ", segments[s].text);
						delete segments[s].text;
					}
				}
				
				for(let x = 0; x < chunks.length; x++){
					//console.log("whisper_worker: chunks[x].text: ", x, chunks[x].text);
					words.push(chunks[x]);
					sentence += chunks[x].text;
					
					if(typeof chunks[x].diarization_id == 'number'){
						if(typeof most_seen_diarization_ids['sid' + chunks[x].diarization_id] == 'undefined'){
							most_seen_diarization_ids['sid' + chunks[x].diarization_id] = 1;
						}
						else{
							most_seen_diarization_ids['sid' + chunks[x].diarization_id]++; // = most_seen_diarization_ids['sid' + chunks[x].diarization_id] + 1;
						}
					}
					else{
						console.error("whisper_worker: chunk did not have a diarization_id: ", x, chunks[x].text, chunks[x]);
					}
					
					
					
					
					if(chunks[x].timestamp[0] != chunks[x].timestamp[1] && chunks[x].timestamp[0] < full_duration){
						sentence_duration += (chunks[x].timestamp[1] - chunks[x].timestamp[0]);
					}
					else{
						sentence_duration += ((full_duration * 0.95) / chunks.length);
					}
					//console.log("sentence_duration: ", sentence_duration);
					
					if(chunks[x].timestamp[0] != chunks[x].timestamp[1] && chunks[x].timestamp[0] < full_duration){
						
					}
					else{
						if(chunks[x].timestamp[0] < full_duration){
							sentence_has_wonky_timestamps = true;
						}
						else if(chunks[x].text.trim().length > 1){
							sentence_has_wonky_timestamps = true;
						}
						else{
							console.error("whisper_worker: wonky timestamp, but word is only a single letter, so letting it slide");
						}
						
					}
					
					
					//let next = (typeof chunks[x+1] != 'undefined' && chunks[x+1].text.startsWith(' ');
					//console.log("ends with period? ", x, chunks.length - 1, /([a-z]+[\.\?\!])$/.test(chunks[x].text));
					//if(/^([a-z]+[\.\?\!])$/.test(chunks[x].text) && (x == chunks.length - 1 || (typeof chunks[x+1] != 'undefined' && chunks[x+1].text.startsWith(' ')) ) ){
			
					//for(let m = 0; m < meta_characters.length; m++){
				
					
					
					
					if(next_word_is_sentence_beginning){ // which means we are now at the beginning of a new sentence
				
						if(typeof chunks[x].absolute_start_time == 'number'){ // chunks[x].timestamp[0] != chunks[x].timestamp[1] && 
							real_sentence_start_time = chunks[x].absolute_start_time; // no matter if it's wonky, the real start time must be known
						}
						else{
							console.error("whisper_worker: no absolute start time for first word of sentence!: ", chunks[x]);
						}
						
						sentence_type = 'speech';
						first_word_index = x;
						most_seen_diarization_ids = {};
						
						if(chunks[x].timestamp[0] < full_duration){ // chunks[x].timestamp[0] != chunks[x].timestamp[1] && 
							real_sentence_start_time = chunks[x].timestamp[0]; // no matter if it's wonky, the real start time must be known
							sentence_start_time = chunks[x].timestamp[0]; // + ((chunks[x].timestamp[1] - chunks[x].timestamp[0]) / 4);
							
							
							
							// Let the start be the middle of the two adjacent words
							if(typeof chunks[x + 1] != 'undefined' && chunks[x + 1].timestamp[0] == chunks[x].timestamp[1]){
								sentence_start_time += ((chunks[x+1].timestamp[1] - sentence_start_time) / 2);
								
								if(typeof chunks[x + 2] != 'undefined' && chunks[x + 2].timestamp[0] == chunks[x+1].timestamp[1]){
									sentence_start_time = chunks[x+1].timestamp[1]; // End of second word
								}
								
								//console.log("whisper_worker: sentence_start_time has been made a little later than the real_sentence_start_time. It is now: ", sentence_start_time, ", in between: ", chunks[x].timestamp[0], chunks[x].timestamp[1], ", which added this delay: ",  (sentence_start_time - real_sentence_start_time));
							}
							
						}
						else{
							console.error("whisper_worker: chunks[x].timestamp[0] was bigger than the full_duration: ", chunks[x].timestamp[0], full_duration);
							wonky_timestamps = true;
							//sentence_start_time = null;
							//real_sentence_start_time = null;
							console.error("WHISPER WORKER: VERY WONKY CHUNK TIMESTAMPS:  \n- sentence so far: ", sentence, "\n- bad word timestamps",  chunks[x].timestamp[0], " -> ",chunks[x].timestamp[1], "\n- full audio duration: ", full_duration);
						}
					}
					//let next = (typeof chunks[x+1] != 'undefined' && chunks[x+1].text.startsWith(' ');
					//console.log("ends with period? ", x, chunks.length - 1, /([a-z]+[\.\?\!])$/.test(chunks[x].text));
					//if(/^([a-z]+[\.\?\!])$/.test(chunks[x].text) && (x == chunks.length - 1 || (typeof chunks[x+1] != 'undefined' && chunks[x+1].text.startsWith(' ')) ) ){
					
					//for(let m = 0; m < meta_characters.length; m++){
						
					
					
					if(chunks[x].text.indexOf('♪') != -1){
						sentence_type = 'singing';
					}
				
				
					let last_char = chunks[x].text.trim();
					let first_char = last_char.charAt(0);
					last_char = last_char.charAt(last_char.length-1);
					
					if(all_meta_characters.indexOf(first_char) != -1 || all_meta_characters.indexOf(last_char) != -1){
						sentence_type = 'sound';
					}
					
					
					
					
					/*
					if(/([A-Za-z]+[\.\?\!])$/.test(chunks[x].text)){
						//console.log("likely end of sentence chunk: ", chunks[x].text);
					}
					*/
					
					
					// Word ends with period or question mark or exclamation mark or closing meta character
					if( 
						(/([A-Za-z\']+[\.\?\!])$/.test(chunks[x].text) && x < (chunks.length - 2) && chunks[x+1].text.startsWith(' ') ) || 
						meta_characters.indexOf(last_char) != -1 ||
						(last_char == '♪' && in_meta)
					){
						//console.log("spotted possible end of sentence chunk, based on word and it's last_char: ",  chunks[x], last_char);
				
						if( chunks[x].text.trim().length == 2 && /([A-Z]\.)$/.test(chunks[x].text) && chunks[x+1].text.trim().length == 2 && /([A-Z]\.)$/.test(chunks[x+1].text) ){
							console.warn("whisper_worker: this is probably (part of) an abbrevation: ", chunks[x], chunks[x+1]);
							next_word_is_sentence_beginning = false;
						}
						else{
							//console.log("whisper_worker: Word end with a period, or a meta character, so this word counts as end of sentence: ", chunks[x]);
							next_word_is_sentence_beginning = true;
						}
				
						//sentence += ' -!- ';
				
					}
			
					// Next word starts with an opening meta character
					else if( 
						///([A-Za-z]+[\.\?\!])$/.test(chunks[x].text) && 
						x < (chunks.length - 2) && 
						chunks[x+1].text.startsWith(' ') && 
						chunks[x+1].text.length > 1 &&
						(chunks[x+1].text.charAt(1) == '[' || chunks[x+1].text.charAt(1) == '(' || chunks[x+1].text.charAt(1) == '*' || (chunks[x+1].text.charAt(1) == '♪' && in_meta == false) ) 
					){
						//console.log("whisper_worker: spotted possible end of sentence chunk, as next word starts with a meta character: ", chunks[x]);
				
						next_word_is_sentence_beginning = true;
					}
			
			
					// Sometimes the ending periods are missing, e.g. with music transcription. This tries to figure it out based on capitalization of the first word
					else if(
						music_spotted && 
						words.length > 10 && 
						x < (chunks.length - 3) && 
						/^(\s[a-z\']+)$/.test(chunks[x].text) && // normal word, followed by
						/^(\s[A-Z][a-z\']+\,?)$/.test(chunks[x+1].text) &&  // capitalized word (possibly ending with comma), followed by
						/^(\s[a-z]\'+\,?)$/.test(chunks[x+2].text) && // normal word (possibly ending with comma)
						(chunks[x+1].text.length > 2 || !chunks[x+1].text.startsWith("I'")) // avoid issues with _I'm_
				
					){
						next_word_is_sentence_beginning = true;
						//console.log("whisper_worker: spotted possible end of sentence chunk based on Capitalization: ", chunks[x]);
					}
			
					else{
						//console.log("not at end of sentence: ", chunks[x]);
						next_word_is_sentence_beginning = false;
					}
			
					if(next_word_is_sentence_beginning && sentence.trim() == '♪'){
						next_word_is_sentence_beginning = false;
					}
			
					if(x == chunks.length - 1){
						//console.log("whisper_worker: reached final chunk, forcing next_word_is_sentence_beginning to true");
						next_word_is_sentence_beginning = true; // reached the end
					}
					
					
					
					
					// Since the next word will be the start of a new sentence, it's time to ship off the currently created sentence.
					if(next_word_is_sentence_beginning){
						//add_sentence_to_segment(sentence,sentence_start_time,real_sentence_start_time,sentence_duration,words,sentence_has_wonky_timestamps);
						
						//console.log("most_seen_diarization_ids: ", most_seen_diarization_ids);
						let most_seen_diarization_id = null;
						let speaker_id_highest_count = 0;
						for (const [sid, count] of Object.entries(most_seen_diarization_ids)) {
							if(count > speaker_id_highest_count){
								speaker_id_highest_count = count;
								most_seen_diarization_id = sid;
							}
							else if(count > 0 && count == speaker_id_highest_count){
								console.warn("whisper_worker: matching most_seen_diarization_id count: ", count, sid);
							}
							/*
							else if(count > 0 && count == speaker_id_highest_count){
								if(sid > 0 && sid < 4){
									most_seen_diarization_id = sid;
								}
							}
							*/
						}
						//console.log("whisper_worker: most_seen_diarization_id: ", most_seen_diarization_id);
						if(typeof most_seen_diarization_id == 'string'){
							most_seen_diarization_id = parseInt(most_seen_diarization_id.substr(3));
						}
						
						
						// Update the chunks array with sentence information
						for(let fwi = first_word_index; fwi <= x; fwi++){
							//console.log("whisper_worker: updating chunks for the completed sentence:  fwi:", fwi, chunks[fwi].text, "    ,most_seen_diarization_id: ", most_seen_diarization_id);
							chunks[fwi]['sentence_most_seen_diarization_id'] = most_seen_diarization_id;
							chunks[fwi]['sentence_type'] = sentence_type;
							chunks[fwi]['task_sentence_nr'] = raw_sentences.length;
						}
						
						
						
						
						/*
						if(keyz(most_seen_diarization_ids).length == 1 && words.length > 5){
							
						}
						*/
						
						
						
						if(chunks[x].timestamp[0] == chunks[x].timestamp[1]){
							if(sentence_has_wonky_timestamps == false){
								console.error("END OF THE SENTENCE HAS A WONKY TIMESTAMP");
								sentence_has_wonky_timestamps = true;
							}
							else{
								console.error("BOTH START AND END OF THE SENTENCE HAVE A WONKY TIMESTAMP");
							}
						}
						else if(sentence_has_wonky_timestamps){
							console.error("ONLY THE START OF THE SENTENCE HAS A WONKY TIMESTAMP");
						}
						
						
						
						let new_sentence = {'text':sentence,'sentence_start_time':sentence_start_time,'real_sentence_start_time':real_sentence_start_time,'duration':sentence_duration,'words':words,'sentence_has_wonky_timestamps':sentence_has_wonky_timestamps,'first_word_index':first_word_index};
						
						if(typeof most_seen_diarization_id == 'number'){
							new_sentence['most_seen_diarization_id'] = most_seen_diarization_id;
						}
						
						if(typeof words[0].merged_absolute_start_time == 'number'){
							new_sentence['absolute_start_time'] = words[0].merged_absolute_start_time;
						}
						if(typeof words[words.length - 1].merged_absolute_end_time == 'number'){
							new_sentence['absolute_end_time'] = words[words.length - 1].merged_absolute_end_time;
						}
						
						
						if(first_sentence){
							new_sentence['first_sentence'] = true;
							first_sentence = false;
						}
						
						if(x == chunks.length - 1){
							new_sentence['last_sentence'] = true;
						}
						
						/*
						if(x < (chunks.length - 3)){
							new_sentence['next_words'] = [chunks[x+1],chunks[x+2]];
						}
						else if(x < (chunks.length - 2)){
							new_sentence['next_words'] = [chunks[x+1]];
						}
						*/
						raw_sentences.push(new_sentence);
						
						words = [];
						words.length = 0;
						sentence = '';
						sentence_duration = 0;
						sentence_has_wonky_timestamps = false;
						
						if(x < (chunks.length - 2) && (chunks[x+1].text.charAt(1) == '♪' || chunks[x+1].text.endsWith('♪')) ){
							in_meta = !in_meta;
						}
					}
					
				}
				//console.log("LOOPED OVER THE WORDS");
				if(sentence != ''){
					console.error("LOOPED OVER WORDS: SOME TEXT WAS LEFT OVER: ", sentence);
				}
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				//  FIX SENTENCES THAT OVERLAP
				
				/*
				let maximum_relative_start_time = null;
				let expected_maximum_relative_start_time = null;
				let last_seemingly_valid_index = null;
				for(let r = raw_sentences.length - 1; r >= 0 ; --r){
					//console.log("FIX OVERLAP: maximum_relative_start_time: ", maximum_relative_start_time, raw_sentences[r]);
					if(typeof maximum_relative_start_time == 'number'){
						if(maximum_relative_start_time <= raw_sentences[r].relative_start_time){ // sic, going in reverse, so it has to be smaller
							console.error("BAD SENTENCE START TIME: ", r, raw_sentences[r].relative_start_time, " is a later start than that of the next sentence: ", maximum_relative_start_time, " at index: ", last_seemingly_valid_index);
							console.error("duration, text: ", raw_sentences[r].duration, raw_sentences[r].text);
						}
						else{
							//console.log("Plausible sentence start: ", r);
							//console.log("duration, text: ", raw_sentences[r].duration, raw_sentences[r].text);
							maximum_relative_start_time = raw_sentences[r].relative_start_time;
							last_seemingly_valid_index = r;
						}
					}
					else{
						//console.log("set maximum_relative_start_time? raw_sentences[r].relative_start_time: ", typeof raw_sentences[r].relative_start_time, raw_sentences[r].relative_start_time);
						if(typeof raw_sentences[r].relative_start_time == 'number'){
							maximum_relative_start_time = raw_sentences[r].relative_start_time;
							last_seemingly_valid_index = r;
						}
						
					}
				}
				*/
				
				
				let previous_sentence_diarization_id = null;
				let previous_sentence_speaker_id = null;
				
				
				// VERIFY ALL SENTENCES EXPERIMENTO
				if(typeof task.recording_start_time == 'number'){
					for(let r = 0; r < raw_sentences.length; r++){
						//console.warn("\n\n\nverif:  sentence: ", r);
						if(typeof raw_sentences[r].meta == 'boolean' && raw_sentences[r].meta == true){
							//console.log("verif:  not verifying meta sentence: ", raw_sentences[r].text);
							continue
						}
						if(typeof raw_sentences[r].type == 'string' && raw_sentences[r].type != 'speech'){
							//console.log("verif:  not verifying non-speech sentence: ", raw_sentences[r].text);
							continue
						}
						
						if(typeof raw_sentences[r].text == 'string' && raw_sentences[r].text.indexOf('♪') != -1){
							//console.log("verif:  not verifying singing sentence: ", raw_sentences[r].text);
							continue
						}
						
						
						
						//let verify_audio_result = null;
						
						//if(typeof raw_sentences[r].most_seen_diarization_id == 'number' && raw_sentences[r].most_seen_diarization_id > 1 && raw_sentences[r].most_seen_diarization_id < 4)
						if(typeof raw_sentences[r].most_seen_diarization_id == 'number' && typeof raw_sentences[r].words != 'undefined'){
							//console.log("verif:  raw_sentences[r].words: ", raw_sentences[r].words );
							if(typeof raw_sentences[r].words[raw_sentences[r].words.length - 1] != 'undefined' && typeof raw_sentences[r].words[raw_sentences[r].words.length - 1].absolute_end_time == 'number'){
								let end_time = raw_sentences[r].words[raw_sentences[r].words.length - 1].absolute_end_time;
								if(typeof end_time != 'number'){
									console.error("verif: not verifying sentence, last word did not have absolute_end_time: ", raw_sentences[r].words);
									continue
								}
								let verification_sentence_parts = [];
								let verification_text = '';
								let word_start_index = null;
								let word_end_index = raw_sentences[r].words.length - 1;
							
								for(let rw = raw_sentences[r].words.length - 1; rw >= 0; rw--){
									if(verification_text.trim().endsWith(']') || verification_text.trim().endsWith(')') || verification_text.trim().endsWith('*') || verification_text.trim().startsWith('[') || verification_text.trim().startsWith('(') || verification_text.trim().startsWith('*') ){
										console.error("verif: almost verified a sentence that seems to be a meta sound. verification_text: ", verification_text);
										raw_sentences[r].meta = true;
										raw_sentences[r].type = 'sound';
										raw_sentences[r].words[rw].type = 'sound';
										raw_sentences[r].words[rw].meta = true;
										break;
									}
									
									verification_text = raw_sentences[r].words[rw].text + verification_text;
									word_start_index = rw;
									
									//console.log("verif: growing sentence: ", rw, ", dur: ", end_time - raw_sentences[r].words[rw].absolute_start_time, " <?> self.minimal_verification_duration: ", self.minimal_verification_duration, verification_text);
									if(
										end_time - raw_sentences[r].words[rw].absolute_start_time > self.minimal_verification_duration 
										|| (r == 0 && rw == 0 && end_time - raw_sentences[r].words[rw].absolute_start_time > 1000)
										|| (rw == raw_sentences[r].words.length - 1 && end_time - raw_sentences[r].words[rw].absolute_start_time > 1000)
									){
									
										//console.log("verif:  verification_text: ", verification_text);
										let veri_start_frame = Math.floor((raw_sentences[r].words[rw].absolute_start_time - task.recording_start_time) * 16);
										let veri_end_frame = Math.floor((end_time - task.recording_start_time) * 16);
										//console.log("verif: SENTENCE PART COMPLETE.  veri_start_frame,veri_end_frame: ", veri_start_frame, veri_end_frame, ", frames: ", veri_end_frame - veri_start_frame, ((veri_end_frame - veri_start_frame) / 16) + "s");
										
										verification_sentence_parts.push({'verification_text':verification_text,'veri_start_frame': veri_start_frame, 'veri_end_frame': veri_end_frame,'word_start_index': word_start_index, 'word_end_index':word_end_index});
										if(rw > 0){
											word_end_index = rw - 1;
											end_time = raw_sentences[r].words[word_end_index].absolute_end_time;
											verification_text = '';
										}
										
										
										
									}
									
									
								}
								
								// Add one more, starting from the beginning of the sentence this time
								if(word_start_index > 2 && verification_sentence_parts.length > 0 && typeof raw_sentences[r].words[0].absolute_start_time == 'number'){
									//console.error("verif: adding one more verification_sentence_part that starts from the beginning (and may overlap)");
									verification_text = '';
									word_start_index = 0;
									word_end_index = null;
									start_time = raw_sentences[r].words[0].absolute_start_time;
									end_time = null;
									
									for(let rw = 0; rw < raw_sentences[r].words.length; rw++){
										
										if(verification_text.trim().endsWith(']') || verification_text.trim().endsWith(')') || verification_text.trim().endsWith('*') || verification_text.trim().startsWith('[') || verification_text.trim().startsWith('(') || verification_text.trim().startsWith('*') ){
											console.error("verif: almost verified a sentence that seems to be a meta sound. verification_text: ", verification_text);
											break;
										}
										
										verification_text += raw_sentences[r].words[rw].text;
										word_end_index = rw;
										end_time = raw_sentences[r].words[rw].absolute_end_time;
										//console.log("verif: growing sentence from beginning: ", rw, ", dur: ", end_time - start_time, " <?> self.minimal_verification_duration: ", self.minimal_verification_duration, verification_text);
										if(end_time - start_time > self.minimal_verification_duration || (r == 0 && rw == 0 && end_time - start_time > 1000)){
									
											//console.log("verif:  verification_text from beginning: ", verification_text);
											let veri_start_frame = Math.floor((raw_sentences[r].words[rw].absolute_start_time - task.recording_start_time) * 16);
											let veri_end_frame = Math.floor((end_time - task.recording_start_time) * 16);
											//console.log("verif: SENTENCE PART COMPLETE from beginning.  veri_start_frame,veri_end_frame: ", veri_start_frame, veri_end_frame, ", frames: ", veri_end_frame - veri_start_frame, ((veri_end_frame - veri_start_frame) / 16) + "s");
										
											verification_sentence_parts.push({'verification_text':verification_text,'veri_start_frame': veri_start_frame, 'veri_end_frame': veri_end_frame,'word_start_index': word_start_index, 'word_end_index':word_end_index});
											break
										}
									
									
									}
								}
								
								
								// Verify all the sentence parts
								
								if(verification_sentence_parts.length){
									//console.log("verif: verification_sentence_parts: ", verification_sentence_parts);
									
									let starting_point = 0;
									if(verification_sentence_parts > 4){
										starting_point = 1;
									}
									
									let verifications = [];
									for(let vsp = starting_point; vsp < verification_sentence_parts.length; vsp++){
										
										
										if(
											typeof verification_sentence_parts[vsp].verification_text == 'string' 
											&& (
												verification_sentence_parts[vsp].verification_text.indexOf('(') != -1
												|| verification_sentence_parts[vsp].verification_text.indexOf('[') != -1
												|| verification_sentence_parts[vsp].verification_text.indexOf(')') != -1
												|| verification_sentence_parts[vsp].verification_text.indexOf(']') != -1
											)
										){
											console.error("whisper_worker: almost verified audio on a meta sound: ", verification_sentence_parts[vsp].verification_text);
											continue
										}
										
										// CALLING VERIFY_AUDIO
										let verify_audio_result = await verify_audio(verification_processor, verification_model, audio, verification_sentence_parts[vsp].veri_start_frame, verification_sentence_parts[vsp].veri_end_frame, raw_sentences[r].text, verification_sentence_parts[vsp].verification_text);
										//console.log("verif:  verify_audio_result: ", verification_sentence_parts[vsp].verification_text, verify_audio_result);
									
										if(verify_audio_result != null){
											verifications.push(verify_audio_result);
											if(typeof verify_audio_result.speaker_id == 'number' && typeof raw_sentences[r].most_seen_diarization_id == 'number'){
												
												if(typeof previous_sentence_diarization_id == 'number' && typeof previous_sentence_speaker_id == 'number'){
													if(raw_sentences[r].most_seen_diarization_id != previous_sentence_diarization_id && verify_audio_result.speaker_id == previous_sentence_speaker_id){
														console.warn("verif: VERY ODD RESULT - SAME SPEAKER AS LAST SEGMENT, BUT IT HAD A DIFFERENT DIARIZATION ID. calling verify_audio again, but this timing telling it to skip the previous outcome");
														verify_audio_result = await verify_audio(verification_processor, verification_model, audio, verification_sentence_parts[vsp].veri_start_frame, verification_sentence_parts[vsp].veri_end_frame, raw_sentences[r].text, verification_sentence_parts[vsp].verification_text, verify_audio_result.speaker_id);
													}
												}
												/*
												if(raw_sentences[r].most_seen_diarization_id > 1 && raw_sentences[r].most_seen_diarization_id < 4){
													
													previous_sentence_diarization_id = raw_sentences[r].most_seen_diarization_id;
													previous_sentence_speaker_id = raw_sentences[r].verify_audio_result.speaker_id;
												}*/
												
											}
											
											if(typeof verification_sentence_parts[vsp].word_start_index == 'number' && typeof verification_sentence_parts[vsp].word_end_index == 'number'){
												for(let vspw = verification_sentence_parts[vsp].word_start_index; vspw <= verification_sentence_parts[vsp].word_end_index; vspw++){
													//console.log("verif: adding verify_audio_result to chunk: ", vspw, chunks[vspw].text);
													chunks[vspw].verify_audio_results.push(verify_audio_result);
												}
											}
											
											
											
											
											/*
											if(typeof raw_sentences[r].first_word_index == 'number'){
												for(let fwi = raw_sentences[r].first_word_index; fwi < (raw_sentences[r].first_word_index + raw_sentences[r].words.length); fwi++){
													//console.log("verif:  setting words speaker data at sentence, word index: ", r, fwi, chunks[fwi].text);
													chunks[fwi].verification = raw_sentences[r].verify_audio_result; 
												}
											}
											*/
								
										}
										/*
										if( verification_sentence_parts.length - vsp == 1 && verification.length % 2 == 1){ // (vsp - starting_point) % 2 == 0
											//console.log("verif: not doing the last sentence verification part because it's preferable the keep the verifications array at an uneven number");
											break
										}
										*/
										
										/*
										if(self.task != null){
											self.postMessage({ // sending verification_audio
										        status: 'verification_audio',
												parent_index: self.task.parent_index,
										        audio: audio.slice(verification_sentence_parts[vsp].veri_start_frame, verification_sentence_parts[vsp].veri_end_frame),
												message:verification_sentence_parts[vsp].verification_text,
												//speaker_id:self.fingerprints[identity].id,
										    });
										}
										*/
										
										await delay(10);
										
										
									}
									
									
									
									
									// If there are valid verifications, then find out who most likely spoke this sentence
									if(verifications.length){
										//console.log("verif: got at least one verification: ", verifications);
										raw_sentences[r].verify_audio_result = verifications[0];
										raw_sentences[r].verify_audio_results = verifications;
										
										if(verifications.length > 1){
											//console.warn("verif: multiple verifications for this sentence. Let's check if they are in agreement:\n\n", raw_sentences[r].text, "\n",JSON.stringify(verifications,null,2));
											
											let possible_speakers = {};
											for(let vf = 0; vf < verifications.length; vf++){
												if(typeof verifications[vf].speaker_id == 'number'){
													if(typeof possible_speakers[ '' + verifications[vf].speaker_id ] == 'undefined'){
														possible_speakers[ '' + verifications[vf].speaker_id ] = 0;
													}
													possible_speakers[ verifications[vf].speaker_id ]++;
													if(typeof verifications[vf].match_percentage == 'number'){
														possible_speakers[ verifications[vf].speaker_id ] += (verifications[vf].match_percentage/100);
													}
													
												}
												
											}
											//console.log("verif: possible_speakers list: ", possible_speakers);
											
											if(Object.keys(possible_speakers).length == 1){
												//console.log("verif: Nice, only detected one possible speaker for this sentence - all verifications are in agreement");
											}
											else{
												let highest_possible_speaker_score = 0;
												let highest_possible_speaker_id = null;
												for (const [possible_speaker_id, possible_speaker_score] of Object.entries(possible_speakers)){
													if(possible_speaker_score > highest_possible_speaker_score){
														highest_possible_speaker_score = possible_speaker_score;
														highest_possible_speaker_id = possible_speaker_id;
													}
												}
												if(highest_possible_speaker_id != null){
													for(let hvf = 0; hvf < verifications.length; hvf++){
														if(typeof verifications[hvf].speaker_id == 'number' && verifications[hvf].speaker_id == highest_possible_speaker_id){
															raw_sentences[r].verify_audio_result = verifications[hvf];
														}
													}
												}
											}
											
										}
										
										if(typeof raw_sentences[r].verify_audio_result != 'undefined' && raw_sentences[r].verify_audio_result != null){
											previous_sentence_diarization_id = raw_sentences[r].most_seen_diarization_id;
											previous_sentence_speaker_id = raw_sentences[r].verify_audio_result.speaker_id;
										
											for(let hrw = raw_sentences[r].words.length - 1; hrw >= 0; hrw--){
												//console.warn(("verif: setting word verification and verify_audio_result to: ", raw_sentences[r].verify_audio_result.speaker_id, raw_sentences[r].text));
												raw_sentences[r].words[hrw].verification = raw_sentences[r].verify_audio_result;
												raw_sentences[r].words[hrw].verify_audio_result = raw_sentences[r].verify_audio_result;
											}
										}
										else{
											console.error("verif: impossible: verify_audio_result was invalid");
											previous_sentence_diarization_id = null;
											previous_sentence_speaker_id = null;
										}
										
										
									}
									else{
										console.error("verif: NO SUCCESFUL VERIFICATION FOR THIS SENTENCE: ", raw_sentences[r].text);
										previous_sentence_diarization_id = null;
										previous_sentence_speaker_id = null;
									}
								}
								else{
									console.warn("verif: no verification_sentence_parts - sentence too short?");
									
								}
								
							}
							else{
								console.error("verif: last word in words array in sentence did not have absolute_end_time?: ", raw_sentences[r]);
								
							}
						}
						else{
							console.error("verif: no words array in sentence, or most_seen_diarization_id was undefined: ", raw_sentences[r]);
							
						}
						
						
						if(typeof raw_sentences[r].verify_audio_result == 'undefined'){
							console.warn("verif: did not run verification on this sentence: ", raw_sentences[r].text);
						}
					}
				}
				
				
				//console.log("making id_map");
				
				
				for(let r = 0; r < raw_sentences.length; r++){
					//console.log("id_map: typeof raw_sentences[r].verification: ", typeof raw_sentences[r].verification, raw_sentences[r].verification);
					//console.log("id_map: typeof raw_sentences[r].verify_audio_result: ", typeof raw_sentences[r].verify_audio_result, raw_sentences[r].verify_audio_result);
					//console.log("id_map: sentence:  nr, most_seen_diarization_id", r, raw_sentences[r].most_seen_diarization_id);
					
					if(typeof raw_sentences[r].most_seen_diarization_id == 'number'){
						if(raw_sentences[r].most_seen_diarization_id == 0){ // was 1? // silence / meta sound
							continue;
						}
						if(typeof id_map['' + raw_sentences[r].most_seen_diarization_id] == 'undefined'){
							id_map['' + raw_sentences[r].most_seen_diarization_id] = {};
						}
						
						
						if(typeof raw_sentences[r].verification != 'undefined' && raw_sentences[r].vverification != null && typeof raw_sentences[r].verification.speaker_id == 'number' && typeof raw_sentences[r].most_seen_diarization_id == 'number'){
						
							final_id_map['' + raw_sentences[r].most_seen_diarization_id] = null;
							//final_id_map['' + raw_sentences[r].verify_audio_result.speaker_id] = null;
							if(typeof speaker_certainty_map['' + raw_sentences[r].verification.speaker_id] == 'undefined'){
								speaker_certainty_map['' + raw_sentences[r].verification.speaker_id] = 0;
							}
						
						
							if(typeof id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verification.speaker_id] == 'undefined'){
								id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verification.speaker_id] = {'count':0,'matches':[],'quality':0,'quality_score':null};
							}
						
							id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verification.speaker_id]['count']++;
						
							if(typeof raw_sentences[r].verification['match_percentage'] == 'number'){
								id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verification.speaker_id]['matches'].push(raw_sentences[r].verification['match_percentage']);
								if(raw_sentences[r].verification['match_percentage'] > 0.97){
									id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verification.speaker_id]['quality']++;
									id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verification.speaker_id]['quality_score'] = id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verification.speaker_id]['quality'] / id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verification.speaker_id]['matches'].length;
								}
							
								if(raw_sentences[r].verification['match_percentage'] > 0.97){
									speaker_certainty_map['' + raw_sentences[r].verification.speaker_id]++;
								}
								else{
									speaker_certainty_map['' + raw_sentences[r].verification.speaker_id]--;
								}
							}
						
						}
						
					
						else if(typeof raw_sentences[r].verify_audio_result != 'undefined' && raw_sentences[r].verify_audio_result != null && typeof raw_sentences[r].verify_audio_result.speaker_id == 'number' && typeof raw_sentences[r].most_seen_diarization_id == 'number'){
						
							final_id_map['' + raw_sentences[r].most_seen_diarization_id] = null;
							//final_id_map['' + raw_sentences[r].verify_audio_result.speaker_id] = null;
							if(typeof speaker_certainty_map['' + raw_sentences[r].verify_audio_result.speaker_id] == 'undefined'){
								speaker_certainty_map['' + raw_sentences[r].verify_audio_result.speaker_id] = 0;
							}
						
						
							if(typeof id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verify_audio_result.speaker_id] == 'undefined'){
								id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verify_audio_result.speaker_id] = {'count':0,'matches':[],'quality':0,'quality_score':null};
							}
						
							id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verify_audio_result.speaker_id]['count']++;
						
							if(typeof raw_sentences[r].verify_audio_result['match_percentage'] == 'number'){
								id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verify_audio_result.speaker_id]['matches'].push(raw_sentences[r].verify_audio_result['match_percentage']);
								if(raw_sentences[r].verify_audio_result['match_percentage'] > 0.97){
									id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verify_audio_result.speaker_id]['quality']++;
									id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verify_audio_result.speaker_id]['quality_score'] = id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verify_audio_result.speaker_id]['quality'] / id_map['' + raw_sentences[r].most_seen_diarization_id]['' + raw_sentences[r].verify_audio_result.speaker_id]['matches'].length;
								}
							
								if(raw_sentences[r].verify_audio_result['match_percentage'] > 0.97){
									speaker_certainty_map['' + raw_sentences[r].verify_audio_result.speaker_id]++;
								}
								else{
									speaker_certainty_map['' + raw_sentences[r].verify_audio_result.speaker_id]--;
								}
							}
						
						}
						else{
							console.warn("sentence had no verify_audio_result data: ", raw_sentences[r].text, JSON.stringify(raw_sentences[r],null,2));
						}
					}
					else{
						console.error("sentence had no most_seen_diarization_id: ", raw_sentences[r].text, JSON.stringify(raw_sentences[r],null,2));
					}
				}
				//console.log("A id_map: ", JSON.stringify(id_map,null,4));
				//console.log("A id_map speaker_certainty_map: ", JSON.stringify(speaker_certainty_map,null,4));
				//console.log("A final_id_map: ", JSON.stringify(final_id_map,null,4));
				
				let most_likely_round1 = {};
				let used_up_ids = [];
				let used_up_certain_ids = [];
				let negative_id_map = {}; // for each segment ID, list speakers that it certainly cannot be.
				
				
				let all_segment_keys = Object.keys(id_map);
				let all_speaker_keys = Object.keys(speaker_certainty_map);
				//console.log("id_map: all_segment_keys: ", all_segment_keys);
				//console.log("id_map: all_speaker_keys: ", all_speaker_keys);
				
				if(all_segment_keys.length == 1 && all_speaker_keys.length == 1){
					// One segment ID, one speaker ID. Easy.
					
					//console.log("id_map: EASY, only one diarization ID and one speaker ID to match it with. final_id_map: ", final_id_map);
					
					if(used_up_certain_ids.indexOf(all_speaker_keys[0]) == -1){
						final_id_map['' + all_segment_keys[0]] = all_speaker_keys[0];
					}
					else{
						console.error("id_map: EASY.. was not that easy: the speaker ID has already been used before?");
					}
					
				}
				else{
					// Start with a simple tally based distribution. If we're lucky that will make it clear which segment is which speaker
					
					// Get very certain matches done first (if there are any)
					for (let [seg, value] of Object.entries(id_map)) {
						if(typeof value == 'object' && value != null){
							// I suspect these are two ways of doing the exact same thing..
							if(Object.keys(value).length == 1){
								//console.log("id_map:  NICE, only one possible speaker for this diarization ID.  seg,speaker_id: ", seg, Object.keys(value)[0]);
								if(parseInt(seg) > 6){
									final_id_map[seg] = Object.keys(value)[0];
								}
								if(used_up_certain_ids.indexOf(Object.keys(value)[0]) == -1){
									used_up_certain_ids.push(Object.keys(value)[0]);
									final_id_map[seg] = Object.keys(value)[0];
								}
								else{
									console.error("This speaker_id was already used in another root segment (<4): ", seg, value);
									//for (let [existing_seg, existing_speaker_id] of Object.entries(id_map)) {
									// check if the segment has a very low segment ID. It's it's below 4, then they shouldn;t both be the same speaker.
								}
								
							}
							else if(final_id_map[seg] == null){
								let total_count = 0;
								for (let [spkr, details] of Object.entries(value)) {
									total_count += details.count;
								}
								for (let [spkr, details] of Object.entries(value)) {
									if(details.count == total_count){
										final_id_map[seg] = spkr;
										used_up_certain_ids.push(spkr);
									}
								}
							}
						}
						
					}
					
					
					//console.log("B id_map: ", JSON.stringify(id_map,null,4));
					//console.log("B id_map speaker_certainty_map: ", JSON.stringify(speaker_certainty_map,null,4));
					//console.log("B final_id_map: ", JSON.stringify(final_id_map,null,4));
					
					if(Object.keys(final_id_map).length == 0){
						console.error("FINAL_ID_MAP HAD NO KEYS");
					}
					
					let early_filled_up = false;
					if(Object.keys(final_id_map).length > 0){
						early_filled_up = true;
					}
					for (let [seg, value] of Object.entries(final_id_map)) {
						if(value == null){
							early_filled_up = false;
						}
					}
					//console.log("id_map: early_filled_up? ", early_filled_up);
					
					
					
					for (let [seg, value] of Object.entries(id_map)) {
						//console.log("id_map:  seg, value:", seg, value);
						
						if(typeof final_id_map[seg] != 'undefined'){
							//console.log("- skipping segment that is already in the bag: ", seg);
							continue
						}
						
						let highest_count = 0;
						let highest_speaker = null;
						let second_highest_count = null;
						let second_highest_speaker = null;
						let total_count = 0;
						
						for(let g = 0; g < all_speaker_keys.length; g++){
							if(typeof value['' + all_speaker_keys[g]] == 'undefined'){
								negative_id_map['' + seg].push(all_speaker_keys[g]);
							}
						}
						
						
						for (let [spkr, details] of Object.entries(value)) {
							//console.log("id_map:  spkr, details: ", spkr, details);
							
							if(used_up_certain_ids.indexOf(spkr) == -1){
								total_count += details.count;
								if(details.count > highest_count){ // || (details.count > 0 && details.count == highest_count) ){
									if(used_up_certain_ids.indexOf(sprk) == -1){
										//console.log("id_map:  most likely speaker for segment is now:", seg, spkr);
									
										if(highest_count > 0 && highest_speaker != null){
											second_highest_count = highest_count;
											second_highest_speaker = highest_speaker;
										}
										highest_count = details.count;
										highest_speaker = spkr;
									}
									else{
										//console.log("id_map: skipping speaker_id that is already certain: ", spkr);
									}
								}
							}
							
						}
						
						
						
						//console.log("id_map: total_count, highest_count, second_highest_count: ", total_count, highest_count, second_highest_count, ' (', highest_speaker, second_highest_speaker);
						if( total_count > 5 && (highest_count / total_count) > 0.65 && used_up_certain_ids.indexOf(highest_speaker) == -1){ //  && (second_highest_count == null || (second_highest_count/total_count) < 0.2) 
							final_id_map[seg] = highest_speaker;
							used_up_certain_ids.push(highest_speaker);
						}
						else if(total_count > 2 && (highest_count / total_count) > 0.74 && used_up_certain_ids.indexOf(highest_speaker) == -1){
							final_id_map[seg] = highest_speaker;
							used_up_certain_ids.push(highest_speaker);
						}
						
					}
						
						
					let filled_up = true;
					for (let [seg, value] of Object.entries(final_id_map)) {
						if(value == null){
							filled_up = false;
						}
					}
					
					//console.log("id_map: filled_up? ", filled_up);
					
					
					if(filled_up == false){
						let highest_count = 0;
						let highest_speaker = null;
						let second_highest_count = null;
						let second_highest_speaker = null;
						let total_count = 0;
					
						for (let [seg, value] of Object.entries(final_id_map)) {
							for (let [spkr, details] of Object.entries(value)) {
								//console.log("id_map:  spkr, details: ", spkr, details);
						
								if(used_up_certain_ids.indexOf(spkr) == -1){
									total_count += details.count;
									if(details.count > highest_count){ // || (details.count > 0 && details.count == highest_count) ){
										if(used_up_certain_ids.indexOf(sprk) == -1){
											//console.log("id_map:  most likely speaker for segment is now:", seg, spkr);
								
											if(highest_count > 0 && highest_speaker != null){
												second_highest_count = highest_count;
												second_highest_speaker = highest_speaker;
											}
											highest_count = details.count;
											highest_speaker = spkr;
										}
										else{
											//console.log("id_map: skipping speaker_id that is already certain: ", spkr);
										}
									}
								}
						
							}
					
					
					
							//console.log("id_map: total_count, highest_count, second_highest_count: ", total_count, highest_count, second_highest_count, ' (', highest_speaker, second_highest_speaker);
							if( total_count > 5 && (highest_count / total_count) > 0.65 && used_up_certain_ids.indexOf(highest_speaker) == -1){ //  && (second_highest_count == null || (second_highest_count/total_count) < 0.2) 
								final_id_map[seg] = highest_speaker;
								used_up_certain_ids.push(highest_speaker);
							}
							else if(total_count > 2 && (highest_count / total_count) > 0.74 && used_up_certain_ids.indexOf(highest_speaker) == -1){
								final_id_map[seg] = highest_speaker;
								used_up_certain_ids.push(highest_speaker);
							}
						}
					}
					
					
					
				}
				
				
				
				//console.log("Z id_map: ", JSON.stringify(id_map,null,4));
				//console.log("Z id_map speaker_certainty_map: ", JSON.stringify(speaker_certainty_map,null,4));
				//console.log("Z final_id_map: ", JSON.stringify(final_id_map,null,4));
				
				
				let id_map_filled_up = true;
				for (let [seg, value] of Object.entries(final_id_map)) {
					if(value == null){
						id_map_filled_up = false;
					}
				}
				
				
				
				if(id_map_filled_up){
					
					//console.log("OK, Z ID_MAP IS FILLED UP");
					
				}
				else{
					console.error("Z ID_MAP: FAILED TO FILL UP THE ID_MAP!");
				}
				
				// Fill in the blanks as best as possible
				for(let z = 0; z < chunks.length; z++){
					if(typeof chunks[z].sentence_most_seen_diarization_id == 'number' && typeof final_id_map['' + chunks[z].sentence_most_seen_diarization_id] != 'undefined'){
						
						let missing_speaker_id = final_id_map['' + chunks[z].sentence_most_seen_diarization_id];
						if(typeof missing_speaker_id == 'string'){
							missing_speaker_id = parseInt(missing_speaker_id);
						}
						
						if(typeof chunks[z].speaker_id != 'number'){
							chunks[z].speaker_id = missing_speaker_id;
						}
							
						for(let f = 0; f < self.fingerprints.length; f++){
							if(typeof self.fingerprints[f].id == 'number' && self.fingerprints[f].id == chunks[z].speaker_id && typeof self.fingerprints[f].speaker_name == 'string'){
								if(typeof chunks[z]['speaker_name'] == 'string'){
									//console.log("Z ID_MAP:  forcing chunk's latest speaker name: " + chunks[z]['speaker_name'] + " -> " + self.fingerprints[f].speaker_name);
								}
								else{
									//console.log("Z ID_MAP: creating missing chunk speaker_name: ", self.fingerprints[f].speaker_name);
								}
								chunks[z]['speaker_name'] = self.fingerprints[f].speaker_name;
							}
						}
						
						
						
						if(typeof chunks[z].verification == 'undefined'){
							//console.log("Z ID_MAP: spotted chunk without verification, SETTING MINIMAL VERSION: ", JSON.stringify(chunks[z],null,2));
							
							chunks[z].verification = {'speaker_id':missing_speaker_id}
							for(let f = 0; f < self.fingerprints.length; f++){
								if(typeof self.fingerprints[f].id == 'number' && self.fingerprints[f].id == missing_speaker_id && typeof self.fingerprints[f].speaker_name == 'string'){
									chunks[z].verification['speaker_name'] = self.fingerprints[f].speaker_name;
								}
							}
						}
						else{
							if(typeof chunks[z].verification.speaker_id == 'number' && chunks[z].verification.speaker_id != missing_speaker_id){
								console.error("Z ID_MAP: CHUNK WORD HAS MISMATCH WITH SPEAKER ID FROM ID_MAP: ", chunks[z].verification.speaker_id, missing_speaker_id);
							}
						}
					}
					else{
						console.error("Z ID_MAP: CHUNK WORD HAS NO diarization_id OR IT WAS NOT IN THE FINAL ID MAP SOMEHOW.  chunks[z]: ", JSON.stringify(chunks[z],null,2), "\nfinal_id_map: ", JSON.stringify(final_id_map,null,2));
					}
					
				}
				
				//console.log("id_map: self.fingerprints: ", self.fingerprints);
				
				post_speakers_list();
				
				
				
				self.segment_to_start_at = 0;
				self.last_good_sentence_end = 0;
				self.last_sentence_was_wonky = true;
				
				
			} // end of spotted_left_over_words
			
			
			
			
			let force_add_speaker = false;
			let fingerprints_to_skip = [];
			
			
			
			
			
			// Check if two speakers are perhaps the same
			
			for(let e = 0; e < self.fingerprints; e++){
				let similar_prints = [];
				
				for(let r = 0; r < self.fingerprints; r++){
					const print_similarity = cosinesim(self.fingerprints[e].embedding,self.fingerprints[r].embedding);
					similar_prints.push(print_similarity);
					
					if(print_similarity > self.perfect_similarity_threshold){
						console.warng("very high print SIMILARITY between two speakers: ", e, r, " -> ", print_similarity);
					}
				}
				//console.log("* print: ", e, JSON.stringify(similar_prints));
				
			}
			
		}
	}
	catch(err){
		console.error("whisper_worker: caught error in verify_segments: ", err);
	}
	
    if(self.task){
    	return {'segments':segments,'sentences':raw_sentences,'words':chunks,'progress_index':self.task.progress_index,'progress_total':self.task.progress_total}
    }
	else{
		return {'segments':segments,'sentences':raw_sentences,'words':chunks,'progress_index':null,'progress_total':null}
	}
	
}





function compare_fingerprints(fingerprint=null,speaker_id_to_skip=null){
	//console.log("in compare_fingerprints. fingerprint: ", fingerprint);
	//console.log("compare_fingerprints: self.fingerprints.length: ", self.fingerprints.length, self.fingerprints);
	let found_index = null; // most important one: whether there is an above 94% match with any of the existing fingerprints
	let found_id = null;
	let worst_found_index = null;
	let highest_match_id = null;
	let highest_match = -1;
	let highest_average_match_id = null;
	let highest_average_match = -1;
	let lowest_match_id = null;
	let lowest_match = 1;
	let found_speaker_name = null;
	let found_print = null;

	let matches = [];
	
	
	if(typeof fingerprint != 'undefined' && fingerprint != null){
		
		
		//for (let [key, value] of Object.entries(self.fingerprints)) {
		for(let f = 0; f < self.fingerprints.length; f++){
			/*
			if(fingerprints_to_skip.indexOf(f) != -1){
				// skip, already used
			}
			else{
			
			}
			*/
			
			if(typeof speaker_id_to_skip == 'number' && self.fingerprints[f].id == speaker_id_to_skip){
				console.warn("compare_fingerprints: was told to skip this ID, so skipping: ", speaker_id_to_skip);
				continue
			}
			
			//if(typeof self.fingerprints[f].embedding != 'undefined'){
			if(typeof self.fingerprints[f].embeddings != 'undefined'){
				
				let embeddings_scores_added_up = 0;
				for(let e = 0; e < self.fingerprints[f].embeddings.length; e++){
					//console.log("compare_fingerprints: comparing ", f, self.fingerprints[f].embedding, fingerprint);
					try{
						const similarity = cosinesim(self.fingerprints[f].embeddings[e], fingerprint);
						
						embeddings_scores_added_up += similarity;
						
						//console.log("compare_fingerprints: SIMILARITY: ", f, similarity);
						//self.fingerprint_matches.push(similarity);
						matches.push({
							'fingerprints_index':f,
							'embedding_index':e,
							'fingerprints_id':self.fingerprints[f].id,
							'speaker_name':self.fingerprints[f].speaker_name,
							'similarity':similarity
						});
						
						if(similarity > highest_match){
							highest_match = similarity;
							if(similarity >= self.similarity_threshold){
								found_index = f;
								found_id = self.fingerprints[f].id;
								found_speaker_name = self.fingerprints[f].speaker_name;
								found_print = JSON.parse(JSON.stringify(self.fingerprints[f]));
								if(typeof found_print.embedding != 'undefined'){
									delete found_print.embedding;
								}
								if(typeof found_print.embeddings != 'undefined'){
									delete found_print.embeddings;
								}
							}
							highest_match_id = self.fingerprints[f].id;
						}
						if(similarity < lowest_match){
							worst_found_index = f;
							lowest_match_id = self.fingerprints[f].id;
							lowest_match = similarity;
						}
					}
					catch(err){
						console.error("compare_fingerprints: caught error doing similarity check: ", err);
					}
				}
				
				
				const average_match = embeddings_scores_added_up / self.fingerprints[f].embeddings.length;
				if(average_match > highest_average_match){
					//console.error("compare_fingerprints: higher average match: " + highest_average_match + " -> " + average_match);
					highest_average_match = average_match;
					highest_average_match_id = self.fingerprints[f].id;
				}
				else{
					//console.error("compare_fingerprints: lower average match: " + average_match + " is not bigger than " + highest_average_match);
				}
				
			}
			else{
				console.error("spotted a fingerprint without an embeddings array");
			}

		}
		
		//console.log("compare_fingerprints: -FOUND INDEX?: ", found_index);
		//console.log("compare_fingerprints: -FOUND ID?: ", found_id);
		//console.log("compare_fingerprints: highest_match: ", highest_match);
		//console.log("compare_fingerprints: - highest_match ID: ", highest_match_id);
		//console.log("compare_fingerprints: highest_average_match: ", highest_average_match);
		//console.log("compare_fingerprints: - highest_average_match ID: ", highest_average_match_id);
		//console.log("compare_fingerprints: lowest_match: ", lowest_match);
		//console.log("compare_fingerprints: - lowest_match_id: ", lowest_match_id);
		//console.log("compare_fingerprints: MATCHES: ", JSON.stringify(matches,null,2));

		if(highest_average_match_id != highest_match_id){
			console.error("\n\n\n\n\n\n\n\ncompare_fingerprints: highest_average_match_id and highest_match_id were not the same!!: ", highest_average_match_id, highest_match_id);
		}

	}
	else{
		console.error("compare_fingerprints: no valid fingerprint provided: ", typeof fingerprint, fingerprint);
	}
	
	
	return {
		"found_index":found_index, 
		"found_id":found_id,
		"found_speaker_name":found_speaker_name,
		"print":found_print,
		"worst_found_index":worst_found_index, 
		"highest_match":highest_match, 
		"highest_match_id":highest_match_id, 
		"highest_average_match":highest_average_match,
		"highest_average_match_id":highest_average_match_id,
		"lowest_match":lowest_match, 
		"lowest_match_id":lowest_match_id, 
		"matches":matches
	}
	
}



// VERIFY A SINGLE SEGMENT'S SPEAKER

// TODO could add multiple fingerprints per speaker, and add new ones when the match is very certain. Then verification could check against these multiple fingerprints for extra certainty / extra 'grip' on the voice
// TODO one issue is that now the fingerprint is the sole source of knowing which speaker is which. But the fingerprint isn't very accurate, so two different speakers could be said to be the same speaker.
// One quick heuristic fix would be to make sure that when audio contains multiple speakers, that they are not getting the same fingerprint verification. Keep track of which fingerprints are matched to which segment ID.

// TODO Force-add speaker could re-add the already known speaker twice? So the least-matching of the two/three speakers's fingerprint should be added

async function verify(processor, model, audio=null) { // force_add_speaker=false, fingerprints_to_skip=[]
	
	//console.log("in verify (of segment). audio.length,force_add_speaker: ", audio.length,force_add_speaker);
	if(typeof processor !== 'function' || typeof model !== 'function'){
		console.error("verify segment: processor or model was not a function: ", processor, model);
		return null
	}
	if(typeof audio == 'undefined' || audio == null){
		console.error("verify: provided audio was invalid.  typeof audio: ", typeof audio, audio);
		return null
	}
	
    const inputs = await processor(audio);
	
    const raw_fingerprint = await model(inputs);
	
	//console.log("verify: raw fingerprint: ", raw_fingerprint);
	if(typeof raw_fingerprint == 'undefined' || raw_fingerprint == null){
		console.error("failed to verify speaker: model returned null, no valid raw_fingerprint");
		return null
	}
	
	
	
	if(typeof raw_fingerprint.logits != 'undefined' && typeof raw_fingerprint.logits.ort_tensor != 'undefined' && raw_fingerprint.logits.ort_tensor.cpuData != 'undefined'){
		return raw_fingerprint.logits.ort_tensor.cpuData;
	}
	else if(typeof raw_fingerprint.last_hidden_state != 'undefined' && typeof raw_fingerprint.last_hidden_state.ort_tensor != 'undefined' && raw_fingerprint.last_hidden_state.ort_tensor.cpuData != 'undefined'){
		return raw_fingerprint.last_hidden_state.ort_tensor.cpuData;
	}
	else{
		console.error("verify did not return a raw_fingerprint embedding: ", raw_fingerprint);
		return null
	}
}


function cosinesim(A,B){
    var dotproduct=0;
    var mA=0;
    var mB=0;
    for(let i = 0; i < A.length; i++){
        dotproduct += (A[i] * B[i]);
        mA += (A[i]*A[i]);
        mB += (B[i]*B[i]);
    }
    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    var similarity = (dotproduct)/((mA)*(mB))
    return similarity;
}




function reset_fingerprints(){
	console.log("whisper_worker: in reset_fingerprints");
	self.fingerprints = [];
	self.fingerprints.length = 0;
	next_fingerprints_id = 1;
	post_speakers_list();
}



function post_speakers_list(){
	//console.log("in post_speakers_list");
	// Let's not send the audio fingerprints to the front end
	let clean_speakers_list = [];
	for(let f = 0; f < self.fingerprints.length; f++){
		clean_speakers_list.push({'id':self.fingerprints[f].id,'speaker_name':self.fingerprints[f].speaker_name,'consent':self.fingerprints[f].consent,'verification_text':self.fingerprints[f].verification_text});
	}
	//console.log("clean_speakers_list: ", clean_speakers_list);

    // Send the result back to the main thread
    self.postMessage({
		task: task,
        status: "speakers_list",
		speakers: clean_speakers_list,
    });
}









async function check_gpu(){
	// CHECK WEB GPU SUPPORT
	console.log("whisper_worker: in check_gpu")
	
    if (!navigator.gpu) {
		console.error("WHISPER WORKER: WebGPU not supported.");
    }
	else{
		//console.error("WHISPER WORKER: navigator.gpu exists: ", navigator.gpu);
		const adapter = await navigator.gpu.requestAdapter();
		//console.error("WHISPER WORKER:  adapter,adapter.features: ", adapter, adapter.features);
		if (typeof adapter != 'undefined' && adapter != null && typeof adapter.features != 'undefined') {
			if(adapter.features.has("shader-f16")){
				///web_gpu_supported = true;
				self.supports_web_gpu16 = true;
				
				if (navigator.gpu.wgslLanguageFeatures && !navigator.gpu.wgslLanguageFeatures.has("packed_4x8_integer_dot_product")) {
					//console.log(`WHISPER WORKER: webgpu DP4a built-in functions are not available`);
				}
			}
			else{
				//console.warn("WHISPER WORKER: Web GPU: 16-bit floating-point value support is not available");
				//web_gpu32_supported = true;
				self.supports_web_gpu32 = true;
			}
		}
		else{
			//console.error("WHISPER WORKER: querying WebGPU was not a success");
		}
    }
	if(self.supports_web_gpu16 == false && self.supports_web_gpu32 == false){
		//console.log("IMAGE TO TEXT WORKER: NO WEB GPU SUPPORT");
		self.device = 'wasm';
		env.backends.onnx.wasm.proxy = true;
	}
	
}





function remove_brackets_from_string(input) {
    return input
        .replace(/{.*?}/g, "")
        .replace(/\[.*?\]/g, "")
        .replace(/<.*?>/g, "")
        .replace(/\(.*?\)/g, "");
}


self.postMessage({
    status: "exists"
});
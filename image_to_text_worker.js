//import { pipeline } from './tjs/transformers.js';
//import { env, Tensor, AutoTokenizer, SpeechT5ForTextToSpeech, SpeechT5HifiGan } from '@xenova/transformers';
//import { env, Tensor, AutoTokenizer, SpeechT5ForTextToSpeech, SpeechT5HifiGan } from './tjs/transformers.js';

//console.log("HELLO FROM IMAGE TO TEXT WORKER");


// Great example: https://github.com/xenova/transformers.js/blob/046b292ac50a0de594d9916bbe2f9b1ffcbbd752/examples/webgpu-vlm/src/worker.js


import { AutoProcessor, AutoTokenizer, Moondream1ForConditionalGeneration, LlavaForConditionalGeneration, Florence2ForConditionalGeneration, TextStreamer, StoppingCriteria, RawImage, env } from './tjs/transformers.min.js';
/*
import {
    Florence2ForConditionalGeneration,
    AutoProcessor,
    AutoTokenizer,
    RawImage,
	TextStreamer, 
	StoppingCriteria,
	env
} from '@xenova/transformers';
*/

// Tensor
// full


const MAX_NEW_TOKENS = 256;

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

self.device = 'webgpu';

let gpu_checked = false;
self.supports_web_gpu16 = false;
self.supports_web_gpu32 = false;

self.current_huggingface_id = null;
self.output_so_far = '';
self.task = null;
self.busy = false;


// Load processor, tokenizer and model
self.processor = null;
self.tokenizer = null;
self.model = null;

let web_gpu_supported = false;
let web_gpu32_supported = false;


function delay(millisec) { 
    return new Promise(resolve => { 
        setTimeout(() => { resolve('') }, millisec); 
    }) 
}


async function hasFp16() {
    try {
        const adapter = await navigator.gpu.requestAdapter();
		console.error("IMAGE_TO_TEXT WORKER: GPU adapter: ", adapter);
		if (typeof adapter != 'undefined' && adapter != null && typeof adapter.features != 'undefined') {
			self.supports_web_gpu32 = true;
			self.device = 'webgpu';
		}
        return adapter.features.has('shader-f16');
    } catch (err) {
		console.error("IMAGE_TO_TEXT WORKER: caught error trying to determine GPU support: ", err);
        return false;
    }
}
self.supports_web_gpu16 ??= await hasFp16();



//const MAX_NEW_TOKENS = 256;
//console.log("env.backends.onnx.wasm.proxy before: ", env.backends.onnx.wasm.proxy);
env.backends.onnx.wasm.proxy = self.device !== 'webgpu';
//console.log("env.backends.onnx.wasm.proxy after: ", env.backends.onnx.wasm.proxy);





class TextGenerationPipeline {
    static huggingface_id = 'Xenova/moondream2';
    static tokenizer = null;
    static processor = null;
    static model = null;
    static supportsFp16 = null;

	static instance_exists(){
		//console.log("returning if instance exists");
		return this.model != null;
	}
	
	static set_to_null(var_to_null=null) {
		if(typeof var_to_null == 'string' && typeof this[var_to_null] != 'undefined'){
			this[var_to_null] = null;
			//console.log("WHISPER WORKER: ASR PipelineFactory: set_to_null: ", var_to_null);
		}
	}
	

    static async getInstance(progress_callback = null, huggingface_id='Xenova/moondream2') {
		this.huggingface_id = huggingface_id;
		
        this.tokenizer ??= AutoTokenizer.from_pretrained(this.huggingface_id, {
            progress_callback,
        });

        this.processor ??= AutoProcessor.from_pretrained(this.huggingface_id);

        // Choose the model based on whether fp16 is available
        this.supportsFp16 ??= await hasFp16();
		
		/*
        this.model ??= Moondream1ForConditionalGeneration.from_pretrained(this.huggingface_id, {
            dtype: {
                embed_tokens: this.supportsFp16 ? 'fp16' : 'fp32', // or 'fp32'
                vision_encoder: this.supportsFp16 ? 'fp16' : 'fp32', // or 'q8'
                decoder_model_merged: 'q4', // or 'q4f16' or 'q8'
            },
            device: DEVICE,
            progress_callback,
        });
		*/
		
		
		if(this.model == null ){ // && huggingface_id.indexOf('moondream') != -1
		
			let dtype_settings = {
				embed_tokens: self.supports_web_gpu16 ? 'fp16' : 'fp32', // or 'fp32'
	            vision_encoder: self.supports_web_gpu16 ? 'fp16' : 'fp32', // or 'q8'
	            decoder_model_merged: 'q4', // or 'q4f16' or 'q8'
				        /*
						embed_tokens: 'fp16', // or 'fp32'
				        vision_encoder: 'fp16', // or 'q8'
				        decoder_model_merged: 'q4', // or 'q4f16' or 'q8'
						*/
			}
		
			//console.log("IMAGE TO TEXT WORKER: dtype_settings: ", JSON.stringify(dtype_settings,null,4));
			//console.log("IMAGE TO TEXT WORKER: LOADING huggingface_id: ", huggingface_id);
		
			if(huggingface_id.indexOf('nanoLLaVA') != -1){
				//self.model = await Moondream1ForConditionalGeneration.from_pretrained(huggingface_id, {
				//console.log("IMAGE TO TEXT WORKER:  self.device,dtype_settings: ", self.device, JSON.stringify(dtype_settings,null,4));
			
				this.model = LlavaForConditionalGeneration.from_pretrained(this.huggingface_id, {
			        progress_callback: (progress_data) => {
						//console.log("IMAGE TO TEXT WORKER: model download progress_callback: progress_data: ", progress_data);
			          	if (progress_data.status !== 'progress') return;
						//setLoadProgress(prev => ({ ...prev, [data.file]: data }))
						///setLoadProgress(data);
						self.postMessage(progress_data);
			        },
				    dtype: dtype_settings,
					//quantized:true,
				    device: self.device,
				});
				
			}
			else if(huggingface_id.indexOf('moondream') != -1){
				//console.log("IMAGE TO TEXT WORKER: moondream.  self.device,dtype_settings: ", self.device, JSON.stringify(dtype_settings,null,4));
			
				this.model = Moondream1ForConditionalGeneration.from_pretrained(this.huggingface_id, {
				//self.model = await LlavaForConditionalGeneration.from_pretrained(huggingface_id, {
			        progress_callback: (progress_data) => {
						//console.log("IMAGE TO TEXT WORKER: model download progress_callback: progress_data: ", progress_data);
			          	if (progress_data.status !== 'progress') return;
						//setLoadProgress(prev => ({ ...prev, [data.file]: data }))
						///setLoadProgress(data);
						self.postMessage(progress_data);
			        },
				    dtype: dtype_settings,
					quantized: true,
				    device: self.device,
					//device: 'wasm',
				});
				
			}
			else{
				//console.log("IMAGE TO TEXT WORKER: using Florence. self.device: ", self.devicef);
				this.model = await Florence2ForConditionalGeneration.from_pretrained(this.huggingface_id, {
	    			//dtype: 'fp32',
				
					dtype: {
					        embed_tokens: 'fp16',
					        vision_encoder: 'fp32',
					        encoder_model: 'fp16',
					        decoder_model_merged: 'q8', // q4
					},
					//quantized:true,
			        progress_callback: (progress_data) => {
						//console.log("IMAGE TO TEXT WORKER: Florence 2 download progress_callback: progress_data: ", progress_data);
			          	if (progress_data.status !== 'progress') return;
						//setLoadProgress(prev => ({ ...prev, [data.file]: data }))
						///setLoadProgress(data);
						self.postMessage(progress_data);
			        },
				
					//device: 'wasm',
				
				});
			}
			
		}

        return Promise.all([this.tokenizer, this.processor, this.model]);
    }
}














class CallbackTextStreamer extends TextStreamer {
    constructor(tokenizer, cb) {
        super(tokenizer, {
            skip_prompt: true,
            skip_special_tokens: true,
        });
        this.cb = cb;
    }

    on_finalized_text(text) {
        this.cb(text);
    }
}


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


/*
async function generate(messages) {

    // Only support a single image for now
    const images = messages.filter(x => x.image).map(x => x.image);
    if (images.length > 1) {
        self.postMessage({
            status: 'error',
            error: 'Currently, at most one image is supported.',
        });
        return;
    }

    // Retrieve the text-generation pipeline.
    const [tokenizer, processor, model] = await TextGenerationPipeline.getInstance();

    // Construct and tokenize prompt
    const prompt = messages.map(x => `${x.image ? '<image>\n\n' : ''}${x.role === 'user' ? 'Question: ' : 'Answer: '}${x.content.trim()}`).join('\n\n') + '\n\nAnswer:'
    let inputs = tokenizer(prompt);

    if (images.length > 0) {
        const image = await RawImage.fromURL(images[0]);
        const vision_inputs = await processor(image);

        inputs = { ...inputs, ...vision_inputs };
    }

    let startTime;
    let numTokens = 0;
    const cb = (output) => {
        startTime ??= performance.now();

        let tps;
        if (numTokens++ > 0) {
            tps = numTokens / (performance.now() - startTime) * 1000;
        }
        self.postMessage({
            status: 'update',
            output, tps, numTokens,
        });
    }

    const streamer = new CallbackTextStreamer(tokenizer, cb);

    // Tell the main thread we are starting
    self.postMessage({ status: 'start' });

    const outputs = await model.generate({
        ...inputs,
        max_new_tokens: MAX_NEW_TOKENS,
        streamer,
        stopping_criteria,
    });
    const outputText = tokenizer.batch_decode(outputs, { skip_special_tokens: false });

    // Send the output back to the main thread
    self.postMessage({
        status: 'complete',
        output: outputText,
    });
}


async function load() {
    self.postMessage({
        status: 'loading',
        data: 'Loading model...'
    });

    // Load the pipeline and save it for future use.
    const [tokenizer, processor, model] = await TextGenerationPipeline.getInstance(x => {
        // We also add a progress callback to the pipeline so that we can
        // track model loading.
        self.postMessage(x);
    });
	
    self.postMessage({
        status: 'loading',
        data: 'Compiling shaders and warming up model...'
    });

    // Run model with dummy input to compile shaders
    const text_inputs = tokenizer('a');

    const vision_inputs = {
        pixel_values: full([1, 3, 378, 378], 0.0)
    }

    const inputs = { ...text_inputs, ...vision_inputs };
    await model.generate({ ...inputs, max_new_tokens: 1 });
    self.postMessage({ status: 'ready' });
}
*/
// Listen for messages from the main thread



self.addEventListener('message', async (e) => {
	//console.log("IMAGE_TO_TEXT_WORKER: received message: ", e.data);
    
	if(typeof e.data.action == 'string'){
		//console.log("IMAGE_TO_TEXT_WORKER: received non-prommise message: action: ", action);
	    switch (e.data.action) {

	        case 'interrupt':
	            stopping_criteria.interrupt();
				postMessage({'task':self.task,'output_so_far':self.output_so_far,'action':'interrupt'});
				self.output_so_far = '';
	            break;

	        case 'dispose':
	            stopping_criteria.reset();
				
				if(self.model){
					await self.model.dispose();
				}
				else if(TextGenerationPipeline.instance_exists() === true){
					//console.log("image_to_text worker: disposing of model");
					//await self.model.dispose();
					await dispose();
				}
				//postMessage({'task':self.task,'output_so_far':self.output_so_far,'action':'reset'});
				postMessage({'status':'disposed'});
				self.output_so_far = '';
	            break;
	    }
	}
	
	else if(typeof e.data.task != 'undefined' && e.data.task != null){
		
		stopping_criteria.reset();
		
		const decoded = await image_to_text(e.data.task);
		
	    self.postMessage({
			task: e.data.task,
	        status: "complete",
	        result: decoded,
	    });
	}
	
	else{
        self.postMessage({
            status: 'error',
            error: 'No action or task provided',
        });
	}
	
});





/*

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

*/


const cb = (chunk) => {
	self.output_so_far += chunk;
    self.postMessage({
        status: 'update',
        output_so_far, 
		chunk, 
    });
}




// not used
async function check_gpu(){
	// CHECK WEB GPU SUPPORT
	
    if (!navigator.gpu) {
		console.error("IMAGE_TO_TEXT WORKER: WebGPU not supported.");
    }
	else{
		//console.error("IMAGE_TO_TEXT WORKER: navigator.gpu exists: ", navigator.gpu);
		const adapter = await navigator.gpu.requestAdapter();
		//console.error("IMAGE_TO_TEXT WORKER:  adapter,adapter.features: ", adapter, adapter.features);
		if (typeof adapter != 'undefined' && adapter != null && typeof adapter.features != 'undefined') {
			if(adapter.features.has("shader-f16")){
				web_gpu_supported = true;
				self.supports_web_gpu16 = true;
				
				if (navigator.gpu.wgslLanguageFeatures && !navigator.gpu.wgslLanguageFeatures.has("packed_4x8_integer_dot_product")) {
					//console.log(`IMAGE_TO_TEXT WORKER: webgpu DP4a built-in functions are not available`);
				}
			}
			else{
				console.warn("IMAGE_TO_TEXT WORKER: Web GPU: 16-bit floating-point value support is not available");
				web_gpu32_supported = true;
				self.supports_web_gpu32 = true;
			}
		}
		else{
			console.error("IMAGE_TO_TEXT WORKER: querying WebGPU failed");
		}
    }
	if(self.supports_web_gpu16 == false && self.supports_web_gpu32 == false){
		//console.log("IMAGE TO TEXT WORKER: NO WEB GPU SUPPORT");
		self.device = 'wasm';
	}
	
}

//await check_gpu();
//console.error("IMAGE_TO_TEXT WORKER:  web_gpu_supported, web_gpu32_supported: ", web_gpu_supported ,web_gpu32_supported);










async function image_to_text(task=null){
	//console.log("IMAGE TO TEXT WORKER: in image_to_text. task: ",task);
	
	try{
		
		if(task == null || typeof task.prompt != 'string' || typeof task.image_blob == 'undefined' || typeof task.type != 'string'){
			console.error("IMAGE TO TEXT WORKER: image_to_text: missing inputs (prompt,image_blog,type).  task: ", task);
			self.postMessage({
				'task':task,
				'status':'error',
				'error':'invalid input provided',
			});
			return null
		}
	
		if(self.busy){
			console.error("IMAGE TO TEXT WORKER: image_to_text:  was already busy. Aborting image_to_text");
			self.postMessage({
				'task':task,
				'status':'error',
				'error':'was already busy',
			});
			return false
		}
		self.busy = true;
		
		
		
		
		if(gpu_checked == false){
			gpu_checked = true;
			await check_gpu();
		}
		//console.log("self.device: ", self.device)
	
		//console.log("env.backends.onnx.wasm.proxy before: ", env.backends.onnx.wasm.proxy);
		env.backends.onnx.wasm.proxy = self.device !== 'webgpu';
		//console.log("env.backends.onnx.wasm.proxy after: ", env.backends.onnx.wasm.proxy);

	
		//await preload_image_to_text(task.huggingface_id);
		/*
		self.postMessage({
			'task':task,
			'status':'preloaded'
		});
		*/
		
		let huggingface_id = 'Xenova/moondream2';
		
		if(typeof task.huggingface_id == 'string'){
			huggingface_id = task.huggingface_id;
		}
		
		
		
		
		
		
		if(typeof self.current_huggingface_id == 'string' && self.current_huggingface_id != huggingface_id){
			console.warn("IMAGE TO TEXT WORKER: SWITCHING TO DIFFERENT MODEL: ", self.current_huggingface_id, " -> ", huggingface_id);
			//await dispose();
			
			self.processor = null;
			self.tokenizer = null;
			if(self.model != null){
				//console.log("IMAGE TO TEXT WORKER: Disposing of old model first");
				await self.model.dispose();
			}
			self.model = null;
			
		}
		
		await preload_image_to_text(huggingface_id);
		await delay(10);
		
		self.postMessage({
			'task':task,
			'status':'preloaded'
		});
		
		self.current_huggingface_id = huggingface_id;
	
		/*
		const [processor,tokenizer,model] = await TextGenerationPipeline.getInstance(x => {
			self.postMessage(x);
		},self.current_huggingface_id);
		
		//console.log("typeof model: ", typeof model);
		*/
	
		const image = await RawImage.fromBlob(task.image_blob);
	
		const vision_inputs = await self.processor(image);
	
		const streamer = new CallbackTextStreamer(tokenizer, cb);
	
		self.output_so_far = '';
		
		
		let prompt = 'Describe this image.';
		if(typeof task.prompt == 'string'){
			prompt = task.prompt;
		}
		
		// Prepare prompt text inputs
		let text = 'Describe with a paragraph what is shown in the image.';
		
		//let text = `<image>\n\nQuestion: ${prompt}\n\nAnswer:`;
		
		if(self.current_huggingface_id.indexOf('nanoLLaVA') != -1){	
			//console.log("IMAGE TO TEXT WORKER: Applying nanoLlava template");		
			const messages = [
			    { role: 'system', content: 'Answer the question.' },
			    { role: 'user', content: `<image>\n${prompt}` }
			]
			text = self.tokenizer.apply_chat_template(messages, { tokenize: false, add_generation_prompt: true });
		}
		else if(self.current_huggingface_id.indexOf('moondream') != -1){	
			//console.log("IMAGE TO TEXT WORKER: Using Moondream template");		
			text = `<image>\n\nQuestion: ${prompt}\n\nAnswer:`;
		}
		else{
			//console.log("IMAGE TO TEXT WORKER: Using Florence template");		
			// Florence
			text = prompt;
		}
		//console.log("IMAGE TO TEXT WORKER: input prompt text: ", text);
		
		
		const text_inputs = self.tokenizer(text);
		
		// Prepare vision inputs
		//const url = 'https://huggingface.co/vikhyatk/moondream1/resolve/main/assets/demo-1.jpg';
		
		/*
		const streamer = new CallbackStreamer((value) => {
			//console.log("IMAGE TO TEXT WORKER: in callback streamer. value: ", value);
			
			//const percent = value === undefined ? 1 : value[0].length / max_length;
			//console.log("MUSICGEN WORKER: streamer: percent: ", percent);
			self.postMessage({
				'task':message.task,
				'status':'musicgen_progress',
				'progress':percent
			});
			
			//setStatusText(`Generating (${(percent * 100).toFixed()}%)...`);
			//setProgress(percent * 100);
		});
		
		
		function progressCallback(x){
			//console.log("image_to_text worker: progressCallback: ", x);
		    self.postMessage(x);
		}
		*/
		
		
		let generate_this = {
		    ...text_inputs,
		    ...vision_inputs, 
		    //do_sample: false,
		    max_new_tokens: 1000,
    		streamer,
    		stopping_criteria,
			
	        progress_callback: (progress_data) => {
				//console.log("IMAGE TO TEXT WORKER: model generate progress_callback: progress_data: ", progress_data);
	          	
				//if (progress_data.status !== 'progress') return;
				//setLoadProgress(prev => ({ ...prev, [data.file]: data }))
				///setLoadProgress(data);
				self.postMessage(progress_data);
	        },
			
		}
		
		if(self.current_huggingface_id.indexOf('lorence') == -1){
			generate_this['do_sample'] = false;
			//generate_this['streamer'] = streamer;
			//generate_this['stopping_criteria'] = stopping_criteria;
			//generate_this['max_new_tokens'] = 1000;
			
			
		}
		
		//console.log("image_to_text worker: calling self.model.generate with: ", generate_this);
		
		// Generate response
		const output = await model.generate(generate_this);
		
		//console.log("image_to_text worker: OK, got output from the model");
		let decoded = null;
		
		// NanoLlava
		if(self.current_huggingface_id.indexOf('nanoLLaVA') != -1){
			decoded = self.tokenizer.decode( // TODO should there be await here?
				output.slice(0, [text_inputs.input_ids.dims[1], null]),
				{ skip_special_tokens: true },
			);
		}
		// Moondream 2 and Florence 2
		else{
			//console.log("decoding output for moondream or florence");
			decoded = self.tokenizer.batch_decode(output, { skip_special_tokens: true });  // TODO should there be await here?
		}
		
		//console.log("IMAGE TO TEXT WORKER:  self.current_huggingface_id,decoded: ", self.current_huggingface_id, decoded);
		if(typeof task.image_blob != 'undefined'){
			delete task.image_blob; // no need to send all that data back to the main thread
		}
		
		self.busy = false;
		return decoded;
		
	}
	catch (err){
		console.error("IMAGE TO TEXT WORKER: caught general error in image_to_text: ", err);
		self.busy = false;
		return null
	}
	
	
}



async function dispose(dispose_type='all') {
	//console.log("image_to_text_worker: in dispose");
	
	return false
	
	self.busy_disposing_models = true;
	
	
	/*
		const p = AutomaticSpeechRecognitionPipelineFactory;
		try{
			(await p.getInstance()).dispose();
			p.instance = null;
			//console.log("dispose: ASR should now be disposed");
		}
		catch(err){
			console.error("caught error trying to dispose of ASR: ", err);
		}
	*/
	
	try{
		const [processor,tokenizer,model] = await TextGenerationPipeline.getInstance(null, self.current_huggingface_id);
	
		if(processor != null && typeof processor.dispose == 'function'){
			//console.log("image_to_text_worker: dispose: disposing of processor");
			await processor.dispose();
		}
	
		if(tokenizer != null && typeof tokenizer.dispose == 'function'){
			//console.log("image_to_text_worker: dispose: disposing of tokenizer");
			await tokenizer.dispose();
		}
	
		if(model != null && typeof model.dispose == 'function'){
			//console.log("image_to_text_worker: dispose: disposing of model");
			await model.dispose();
		}
	
	
		TextGenerationPipeline.set_to_null('processor');
		TextGenerationPipeline.set_to_null('tokenizer');
		TextGenerationPipeline.set_to_null('model');
	
		return true
		
	}
	catch(err){
		console.error("caught error trying to dispose of image_to_text: ", err);
	}
		
	self.busy_disposing_models = false;
	return false
	
}





async function preload_image_to_text(task){
	//console.log("IMAGE TO TEXT WORKER: in preload_image_to_text. task: ",task);
	self.busy_preloading = true;
	//let huggingface_id = 'onnx-community/Florence-2-base-ft';
	let huggingface_id = 'Xenova/moondream2';
	if(typeof task != 'undefined' && task != null && typeof task.huggingface_id == 'string' && task.huggingface_id.length > 4){
		console.warn("image_to_text worker: task contained a huggingface_id: ", task.huggingface_id);
		huggingface_id = task.huggingface_id;
	}
	if(typeof self.current_huggingface_id == 'string' && self.current_huggingface_id != huggingface_id){
		console.warn("IMAGE TO TEXT WORKER: SWITCHING TO DIFFERENT MODEL: ", huggingface_id);
		self.processor = null;
		self.tokenizer = null;
		if(self.model != null){
			//console.log("IMAGE TO TEXT WORKER: Disposing of old model first");
			await self.model.dispose();
		}
		self.model = null;
	}
	self.current_huggingface_id = huggingface_id;
	
	//console.log("IMAGE TO TEXT WORKER: preload_image_to_text:  huggingface_id: ",huggingface_id);
	
	if(self.processor == null){
		//console.log("IMAGE TO TEXT WORKER: preload_image_to_text:  huggingface_id -> creating processor for ", huggingface_id);
		self.processor = await AutoProcessor.from_pretrained(huggingface_id);
	}
	if(self.tokenizer == null){
		//console.log("IMAGE TO TEXT WORKER: preload_image_to_text:  huggingface_id -> creating tokenizer for ", huggingface_id);
		self.tokenizer = await AutoTokenizer.from_pretrained(huggingface_id);
	}
	
	if(self.model == null ){ // && huggingface_id.indexOf('moondream') != -1
		
		let dtype_settings = {
			embed_tokens: self.supports_web_gpu16 ? 'fp16' : 'fp32', // or 'fp32'
            vision_encoder: self.supports_web_gpu16 ? 'fp16' : 'fp32', // or 'q8'
            decoder_model_merged: 'q4', // or 'q4f16' or 'q8'
			        /*
					embed_tokens: 'fp16', // or 'fp32'
			        vision_encoder: 'fp16', // or 'q8'
			        decoder_model_merged: 'q4', // or 'q4f16' or 'q8'
					*/
		}
		
		//console.log("IMAGE TO TEXT WORKER: dtype_settings: ", JSON.stringify(dtype_settings,null,4));
		//console.log("IMAGE TO TEXT WORKER: LOADING huggingface_id: ", huggingface_id);
		
		if(huggingface_id.indexOf('nanoLLaVA') != -1){
			//self.model = await Moondream1ForConditionalGeneration.from_pretrained(huggingface_id, {
			//console.log("IMAGE TO TEXT WORKER:  self.device,dtype_settings: ", self.device, JSON.stringify(dtype_settings,null,4));
			
			self.model = await LlavaForConditionalGeneration.from_pretrained(huggingface_id, {
		        progress_callback: (progress_data) => {
					//console.log("IMAGE TO TEXT WORKER: model download progress_callback: progress_data: ", progress_data);
		          	if (progress_data.status !== 'progress') return;
					//setLoadProgress(prev => ({ ...prev, [data.file]: data }))
					///setLoadProgress(data);
					self.postMessage(progress_data);
		        },
			    dtype: dtype_settings,
				//quantized:true,
			    device: self.device,
			});
		}
		else if(huggingface_id.indexOf('moondream') != -1){
			//console.log("IMAGE TO TEXT WORKER: moondream.  self.device,dtype_settings: ", self.device, JSON.stringify(dtype_settings,null,4));
			
			self.model = await Moondream1ForConditionalGeneration.from_pretrained(huggingface_id, {
			//self.model = await LlavaForConditionalGeneration.from_pretrained(huggingface_id, {
		        progress_callback: (progress_data) => {
					//console.log("IMAGE TO TEXT WORKER: model download progress_callback: progress_data: ", progress_data);
		          	if (progress_data.status !== 'progress') return;
					//setLoadProgress(prev => ({ ...prev, [data.file]: data }))
					///setLoadProgress(data);
					self.postMessage(progress_data);
		        },
			    dtype: dtype_settings,
				quantized:true,
			    device: self.device,
				//device: 'wasm',
			});
		}
		else{
			//console.log("IMAGE TO TEXT WORKER: using Florence. self.device: ", self.devicef);
			self.model = await Florence2ForConditionalGeneration.from_pretrained(huggingface_id, {
    			//dtype: 'fp32',
				
				dtype: {
				        embed_tokens: 'fp16',
				        vision_encoder: 'fp32',
				        encoder_model: 'fp16',
				        decoder_model_merged: 'q8', // q4
				},
				//quantized:true,
		        progress_callback: (progress_data) => {
					//console.log("IMAGE TO TEXT WORKER: Florence 2 download progress_callback: progress_data: ", progress_data);
		          	if (progress_data.status !== 'progress') return;
					//setLoadProgress(prev => ({ ...prev, [data.file]: data }))
					///setLoadProgress(data);
					self.postMessage(progress_data);
		        },
				
				//device: 'wasm',
				
			});
		}
		
		
		
		self.postMessage({
			'status':'ready'
		});
	}
	
	self.busy_preloading = false;
	return true
}















console.log("IMAGE TO TEXT WORKER EXISTS");
postMessage({"status":"exists"});
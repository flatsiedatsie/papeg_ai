import {
    AutoTokenizer,
    env
} from "./tjs/transformers.min.js";


import { orta } from './i2t/ort.webgpu.min.js';
//const { ort } = await import('./i2t/ort.webgpu.min.js');

//console.log("orta: ", orta);

let ort = orta();
//console.log("ort: ", ort);




if(typeof env.backends != 'undefined'){
	//console.log("env: ", env);
	//console.log("env.backends: ", env.backends);
	//console.log("env.backends.onnx: ", env.backends.onnx);
}

//env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/';
env.backends.onnx.wasm.wasmPaths = 'https://huggingface.co/BoscoTheDog/onnx_diffusion/resolve/main/';


// https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/ort-wasm-simd.jsep.wasm




env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;
env.backends.onnx.wasm.proxy = false;

self.device = 'webgpu';

self.supports_web_gpu16 = false;
self.supports_web_gpu32 = false;

self.task = null;


self.interrupted = false;

self.models_loaded = false;
self.busy_loading = false;
self.busy_preloading = false;
self.busy_running = false;
self.models_initialized = false;


let web_gpu_supported = false;
let web_gpu32_supported = false;






async function check_gpu() {
    // CHECK WEB GPU SUPPORT

    if (!navigator.gpu) {
        console.error("TEXT_TO_IMAGE WORKER: WebGPU not supported!");
    } 
	else {
        //console.error("TEXT_TO_IMAGE WORKER: navigator.gpu exists: ", navigator.gpu);
        const adapter = await navigator.gpu.requestAdapter();
        //console.error("TEXT_TO_IMAGE WORKER:  adapter,adapter.features: ", adapter, adapter.features);
        if (typeof adapter != 'undefined' && adapter != null && typeof adapter.features != 'undefined') {
            if (adapter.features.has("shader-f16")) {
                web_gpu_supported = true;
                self.supports_web_gpu16 = true;

                if (navigator.gpu.wgslLanguageFeatures && !navigator.gpu.wgslLanguageFeatures.has("packed_4x8_integer_dot_product")) {
                    //console.log(`TEXT_TO_IMAGE WORKER: webgpu DP4a built-in functions are not available`);
                }
            } 
			else {
                console.warn("TEXT_TO_IMAGE WORKER: Web GPU: 16-bit floating-point value support is not available");
                web_gpu32_supported = true;
                self.supports_web_gpu32 = true;
            }
        } 
		else {
            console.error("TEXT_TO_IMAGE WORKER: querying WebGPU was not a success");
        }
    }
    if (self.supports_web_gpu16 == false && self.supports_web_gpu32 == false) {
        //console.log("TEXT TO IMAGE WORKER: NO WEB GPU SUPPORT");
        self.device = 'wasm';
        env.backends.onnx.wasm.proxy = true;
    }

}

await check_gpu();
//console.error("TEXT_TO_IMAGE WORKER:  web_gpu_supported, web_gpu32_supported: ", web_gpu_supported, web_gpu32_supported);


if (self.device == "webgpu") {
    env.backends.onnx.wasm.numThreads = 1;
    env.backends.onnx.wasm.simd = true;
} else {
    //ort.env.wasm.numThreads = config.threads;
   env.backends.onnx.wasm.simd = true;
}


let opfs_supported = false;
try{
	if(typeof navigator.storage != 'undefined' && typeof navigator.storage.getDirectory != 'undefined'){
		const opfsRoot = await navigator.storage.getDirectory();
		//console.log("TEXT TO IMAGE WORKER: OPFS storage seems supported.  opfsRoot: ", opfsRoot);
		opfs_supported = true;
	}
}
catch(err){
	console.error("TEXT TO IMAGE WORKER: caught error testing OPFS file storage: ", err);
}





self.current_huggingface_id = null;




// PROMISE WORKER
/*
function isPromise(obj) {
    // via https://unpkg.com/is-promise@2.1.0/index.js
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

function registerPromiseWorker(callback) {
    function postOutgoingMessage(e, messageId, error, result) {
        function postMessage(msg) {

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
                console.error('Promise worker caught an error:', error);
            }
            postMessage([messageId, {
                message: error.message
            }])
        } else {
            postMessage([messageId, null, result])
        }
    }

    function tryCatchFunc(callback, message) {
        try {
            return {
                res: callback(message)
            }
        } catch (e) {
            return {
                err: e
            }
        }
    }

    function handleIncomingMessage(e, callback, messageId, message) {
	//console.log("registerPromiseWorker: in handleIncomingMessage");
        var result = tryCatchFunc(callback, message)

        if (result.err) {
            postOutgoingMessage(e, messageId, result.err)
        } else if (!isPromise(result.res)) {
            postOutgoingMessage(e, messageId, null, result.res)
        } else {
            result.res.then(function(finalResult) {
                postOutgoingMessage(e, messageId, null, finalResult)
            }, function(finalError) {
                postOutgoingMessage(e, messageId, finalError)
            })
        }
    }

    function onIncomingMessage(e) {
		//console.log("registerPromiseWorker: onIncomingMessage: e.data: ", e.data);
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



registerPromiseWorker(function(message) {
	//console.log("TEXT TO IMAGE WORKER: registerPromiseWorker: GOT MESSAGE: \n", typeof message, message);

    

    if (typeof message.action == 'string') {
		//console.log("TEXT TO IMAGE WORKER: registerPromiseWorker: GOT ACTION: ", message.action);
    }

    if (typeof message.task == 'undefined') {
        console.error("TEXT TO IMAGE PROMISE WORKER: message.task was undefined");
        if (message.length && typeof message[0].task != 'undefined') {
            message = message[1];
        } else if (message.length > 1) {
            if (typeof message[1].task != 'undefined') {
				//message = message[1];
				//console.log("TEXT TO IMAGE WORKER: calling run from (weird) promise-worker message");
	            self.task = message[1].task;
	            return run(self.task);
            }
        } else {
            console.error("trying to locate task object in incoming message failed");
        }
    }

    if (typeof message.task != 'undefined' && message.task != null && typeof message.task.type == 'string') {
		//console.log("TEXT TO IMAGE WORKER: received a task: ", message.task.type, message.task);

        if (message.task.type == 'text_to_image' && typeof message.task.prompt == 'string') {
			//console.log("TEXT TO IMAGE WORKER: calling run from promise-worker message");
            self.task = message.task;
            return run(self.task);
        }
    } 
	
	console.error("TEXT TO IMAGE WORKER: no valid task provided");
    return {
		"status":"error",
        "message": "No valid task object provided"
    };

});
*/




function dispose_everything(){
	
	if(textEncoderOutputsTensor && typeof textEncoderOutputsTensor.dispose == 'function'){
		textEncoderOutputsTensor.dispose();
	}
	
	if(unetSampleInputsTensor && typeof unetSampleInputsTensor.dispose == 'function'){
		unetSampleInputsTensor.dispose();
	}
	if(unetOutSampleTensor && typeof unetOutSampleTensor.dispose == 'function'){
		unetOutSampleTensor.dispose();
	}
	if(decodedOutputsTensor && typeof decodedOutputsTensor.dispose == 'function'){
		decodedOutputsTensor.dispose();
	}
	if(tokenizer && typeof tokenizer.dispose == 'function'){
		tokenizer.dispose();
	}
	
}


// old-school non-promise option
addEventListener('message', async (event) => {
	//console.log("TEXT TO IMAGE WORKER: RECEIVED MESSAGE. event.data: ", event.data);

	
	
	if(typeof event.data.action == 'string' && (event.data.action == 'interrupt' || event.data.action == 'stop' || event.data.action == 'dispose')){
		if(event.data.action == 'interrupt'){
			self.interrupted = true;
			
		}
		else if(event.data.action == 'stop' || event.data.action == 'dispose'){
			dispose_everything();
		}
		
		self.task = null;
	}
	
	
	if(typeof event.data.task != 'undefined' && event.data.task != null){
		//console.log("TEXT TO IMAGE WORKER: calling run from non-promise message");
		self.interrupted = false;
        self.task = event.data.task;
        return do_run(self.task);
	}
});




















/*
 * This file is modified based on
 *    https://github.com/guschmue/ort-webgpu/blob/master/sd-turbo/index.html
 */

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */


// import { ALL_NEEDED_MODEL_RESOURCES } from "./config.js";

const ALL_NEEDED_MODEL_RESOURCES = {
    // summarization
    "distilbart-cnn-6-6": {
        linkPathPrefix: "https://huggingface.co/Xenova/distilbart-cnn-6-6/resolve/main/",
        localFolderPathPrefix: "Xenova/",
        resources: [
            "onnx/decoder_model_merged_quantized.onnx",
            "onnx/encoder_model_quantized.onnx"
        ]
    },

    // image-to-text
    "vit-gpt2-image-captioning": {
        linkPathPrefix: "https://huggingface.co/Xenova/vit-gpt2-image-captioning/resolve/main/",
        localFolderPathPrefix: "Xenova/",
        resources: [
            "onnx/decoder_model_merged_quantized.onnx",
            "onnx/encoder_model_quantized.onnx"
        ]
    },

    // question-answering
    "distilbert-base-cased-distilled-squad": {
        linkPathPrefix: "https://huggingface.co/Xenova/distilbert-base-cased-distilled-squad/resolve/main/",
        localFolderPathPrefix: "Xenova/",
        resources: ["onnx/model_quantized.onnx"]
    },

    // background-removal
    "RMBG-1.4": {
        linkPathPrefix: "https://huggingface.co/briaai/RMBG-1.4/resolve/main/",
        localFolderPathPrefix: "briaai/",
        resources: ["onnx/model.onnx"]
    },

    // SD-Turbo
    "sd-turbo-ort-web": {
        linkPathPrefix: "https://huggingface.co/schmuell/sd-turbo-ort-web/resolve/main/",
        localFolderPathPrefix: "schmuell/",
        resources: [
            "unet/model.onnx",
            "vae_decoder/model.onnx",
            "text_encoder/model.onnx"
        ]
    },

    // used by SD-Turbo
    "clip-vit-base-patch16": {
        linkPathPrefix: "https://huggingface.co/Xenova/clip-vit-base-patch16/resolve/main/",
        localFolderPathPrefix: "Xenova/",
        resources: []
    },

    "Phi-3-mini-4k-instruct": {
        linkPathPrefix: "https://huggingface.co/Xenova/Phi-3-mini-4k-instruct/resolve/main/",
        localFolderPathPrefix: "Xenova/",
        resources: ["onnx/model_q4.onnx", "onnx/model_q4.onnx_data"]
    },

    "Phi-3-mini-4k-instruct_fp16": {
        linkPathPrefix: "https://huggingface.co/Xenova/Phi-3-mini-4k-instruct_fp16/resolve/main/",
        localFolderPathPrefix: "Xenova/",
        resources: ["onnx/model_q4.onnx", "onnx/model_q4.onnx_data"]
    },

    // ort web wasm
    "ort-web@1_18_0": {
        linkPathPrefix: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/",
        localFolderPathPrefix: "frameworks/ort-web/",
        resources: ["ort-wasm-simd.jsep.wasm"]
    },

    "ort-web@1_17_1": {
        linkPathPrefix: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.1/dist/",
        localFolderPathPrefix: "frameworks/ort-web/",
        resources: ["ort-wasm-simd.jsep.wasm"]
    },

    // mediapipe
    "tasks-genai": {
        linkPathPrefix: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@0.10.14/wasm/",
        localFolderPathPrefix: "frameworks/mediapipe/",
        resources: ["genai_wasm_internal.wasm"]
    }
};



var deviceWebgpu = null;
var queueWebgpu = null;
var textEncoderOutputsBuffer = null;
var textEncoderOutputsTensor = null;
var textEncoderOutputs = {};
var latentData = null;
var latentBuffer = null;
var unetSampleInputsBuffer = null;
var unetSampleInputsTensor = null;
var unetOutSampleBuffer = null;
var unetOutSampleTensor = null;
var prescaleLatentSpacePipeline = null;
var prescaleLatentSpaceBindGroup = null;
var stepLatentSpacePipeline = null;
var stepLatentSpaceBindGroup = null;
var decodedOutputsBuffer = null;
var decodedOutputsTensor = null;
const pixelHeight = 512;
const pixelWidth = 512;
var renderContext = null;
var renderPipeline = null;
var renderBindGroup = null;

const canvas = new OffscreenCanvas(512, 512); //document.getElementById(`canvas`);
canvas.width = pixelWidth;
canvas.height = pixelHeight;


const PRESCALE_LATENT_SPACE_SHADER = `
@binding(0) @group(0) var<storage, read_write> result: array<vec4<f32>>;
@binding(1) @group(0) var<storage, read> latentData: array<vec4<f32>>;

@compute @workgroup_size(128, 1, 1)
fn _start(@builtin(global_invocation_id) GlobalId : vec3<u32>) {
let index = GlobalId.x;
let value = latentData[index] / 14.64877241136608;
result[index] = value;
}
`;

const STEP_LATENT_SPACE_SHADER = `
@binding(0) @group(0) var<storage, read_write> result: array<vec4<f32>>;
@binding(1) @group(0) var<storage, read> latentData: array<vec4<f32>>;

@compute @workgroup_size(128, 1, 1)
fn _start(@builtin(global_invocation_id) GlobalId : vec3<u32>) {
let index = GlobalId.x;
let sigma_hat = 14.6146;
let latentVal = latentData[index];
let outputSampleVal = result[index];

let pred_original_sample = latentVal - 14.6146 * outputSampleVal;
let derivative = (latentVal - pred_original_sample) / 14.6146;
let dt = -14.6146;
result[index] = (latentVal + derivative * dt) / 0.18215;
}
`;

const VERTEX_SHADER = `
struct VertexOutput {
@builtin(position) Position : vec4<f32>,
@location(0) fragUV : vec2<f32>,
}

@vertex
fn main(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {
var pos = array<vec2<f32>, 6>(
vec2<f32>( 1.0,  1.0),
vec2<f32>( 1.0, -1.0),
vec2<f32>(-1.0, -1.0),
vec2<f32>( 1.0,  1.0),
vec2<f32>(-1.0, -1.0),
vec2<f32>(-1.0,  1.0)
);

var uv = array<vec2<f32>, 6>(
vec2<f32>(1.0, 0.0),
vec2<f32>(1.0, 1.0),
vec2<f32>(0.0, 1.0),
vec2<f32>(1.0, 0.0),
vec2<f32>(0.0, 1.0),
vec2<f32>(0.0, 0.0)
);

var output : VertexOutput;
output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
output.fragUV = uv[VertexIndex];
return output;
}
`;

const PIXEL_SHADER = `
@group(0) @binding(1) var<storage, read> buf : array<f32>;

@fragment
fn main(@location(0) fragUV : vec2<f32>) -> @location(0) vec4<f32> {
// The user-facing camera is mirrored, flip horizontally.
var coord = vec2(0.0, 0.0);
if (fragUV.x < 0.5) {
  coord = vec2(fragUV.x + 0.5, fragUV.y);
} else {
  coord = vec2(fragUV.x - 0.5, fragUV.y);
}

let redInputOffset = 0;
let greenInputOffset = 262144;
let blueInputOffset = 524288;
let index = i32(coord.x * f32(512)) + i32(coord.y * f32(512) * f32(512));  // pixelWidth = pixelHeight= 512
let r = clamp(buf[index] / 2 + 0.5, 0.0, 1.0);
let g = clamp(buf[262144 + index] / 2 + 0.5, 0.0, 1.0);
let b = clamp(buf[524288 + index] / 2 + 0.5, 0.0, 1.0);
let a = 1.0;

var out_color = vec4<f32>(r, g, b, a);

return out_color;
}
`;

const modelName = "sd-turbo-ort-web";
const tokenizerName = "clip-vit-base-patch16";

const config = getConfig();

const models = {
    unet: {
        url: "unet/model.onnx",
        size: 640,
        // should have 'steps: 1' but will fail to create the session
        opt: {
            freeDimensionOverrides: {
                batch_size: 1,
                num_channels: 4,
                height: 64,
                width: 64,
                sequence_length: 77
            }
        }
    },
    text_encoder: {
        url: "text_encoder/model.onnx",
        size: 1700,
        // should have 'sequence_length: 77' but produces a bad image
        opt: {
            freeDimensionOverrides: {
                batch_size: 1
            }
        }
    },
    vae_decoder: {
        url: "vae_decoder/model.onnx",
        size: 95,
        opt: {
            freeDimensionOverrides: {
                batch_size: 1,
                num_channels_latent: 4,
                height_latent: 64,
                width_latent: 64
            }
        }
    }
};

let tokenizer;
let loading;
const sigma = 14.6146;
const gamma = 0;
const vae_scaling_factor = 0.18215;

let loadedCount = 0;
let fetchedModels = {};

//text.value = "Paris with the river in the background";

const STATUS = {
    DEFAULT: 0,
    PREPARING: 1,
    RUNNING: 2,
    DONE: 3
};

function getConfig() {
    var config = {
        model: modelName,
        provider: "webgpu",
        device: "gpu",
        threads: 1,
        images: 1
    };

    // Define a whitelist of allowed configuration keys
    const allowedConfigKeys = new Set([
        "model",
        "provider",
        "device",
        "threads",
        "images"
    ]);

    // Parse the query string
    /*
    const query = window.location.search.substring(1);
    const vars = query.split("&");

    for (var i = 0; i < vars.length; i++) {
      let pair = vars[i].split("=");

      // Check if the key is in the whitelist
      if (allowedConfigKeys.has(pair[0])) {
        let key = pair[0];
        let value = decodeURIComponent(pair[1]);

        // Additional validation for numeric values
        if (key === "threads" || key === "images") {
          value = parseInt(value);
          if (isNaN(value) || value < 1) {
            throw new Error(
              `Invalid value for ${key}: must be a positive integer`
            );
          }
        }

        // Assign the validated value to the config object
        config[key] = value;
      } else if (pair[0].length > 0) {
        throw new Error("Unknown argument: " + pair[0]);
      }
    }
    */
    return config;
}

function randn_latents(shape, noise_sigma) {
    function randn() {
        // Use the Box-Muller transform
        let u = Math.random();
        let v = Math.random();
        let z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        return z;
    }
    let size = 1;
    shape.forEach((element) => {
        size *= element;
    });

    let data = new Float32Array(size);
    // Loop over the shape dimensions
    for (let i = 0; i < size; i++) {
        data[i] = randn() * noise_sigma;
    }
    return data;
}




let previous_download_percentage = -1;

async function fetchAndCache(name, base_url, model_path) {
	//console.log("fetchAndCache:  \n- name:\n", name, "\n- base_url: ", base_url, "\n- model_path: ", model_path);
    //const url = `${base_url}${model_path}`;
	const url = `https://huggingface.co/schmuell/sd-turbo-ort-web/resolve/main/${model_path}`;
	
    let data = [];

	//console.log("trying to fetch url: ", url);

    //const statusBarElement = document.getElementById(`${name}StatusBar`);

    // fetch models from origin private file system
    const root = await navigator.storage.getDirectory();
	
	//for await (let [filename, handle] of directoryHandle.entries()) {}
	
	
	
	
	
    let fileHandle;

    async function fetchFile() {
        try {

			//console.log("in fetchFile. url: ", url);
            const response = await fetch(url);

            if (response.status === 404) {
                throw new Error(`${name} model not found.`);
            }

            const reader = response.body.getReader();
            const totalLength = +response.headers.get("Content-Length");
			
			//console.log("fetchFile: totalLength: ", totalLength);
			
            let loaded = 0;
            let chunks = [];

            const startTime = new Date().getTime();
            let stream = new ReadableStream({
                start(controller) {
                    function push() {
                        reader.read().then(({
                            done,
                            value
                        }) => {
                            const currentTime = new Date().getTime();
                            const elapsedTime = (currentTime - startTime) / 1000;
                            if (done) {
                                // update status bar content when download complete
								//console.log(`downloaded in ${elapsedTime}s (${formatBufferSize(totalLength)})`);
                                controller.close();
                                return;
                            }

                            loaded += value.byteLength;
                            let progress = Math.floor( (loaded / totalLength) * 1000);
							
							if(progress != previous_download_percentage){
								//console.log("Downloading model: ", name, progress);
								previous_download_percentage = progress;
								
							    self.postMessage({
							        status: 'progress',
									progress: (progress / 10),
							        file:name, 
									loaded:loaded,
									total:totalLength,
							    });
								
							}
                            


                            chunks.push(value);
                            controller.enqueue(value);
                            push();
                        });
                    }

                    push();
                }
            });

            let newResponse = new Response(stream);
            data = await newResponse.arrayBuffer();

            // save the buffer into origin private file system
            fileHandle = await root.getFileHandle(name, {
                create: true
            });

            const writable = await fileHandle.createWritable();
            await writable.write(data);
            await writable.close();
			//console.log("stored the downloaded model in the OPFS cache");
            // update status flag in model panel
			
            return data;
			
        } catch (err) {
            console.error("caught error downloading to cache: ", err);
	    	self.postMessage({
				task: self.task,
	        	status: "error",
				message:"download error"
	    	});
            return;
        }
    }

    try {
		//console.log("attempting to load model from OPFS cache.  name: ", name);
        // get buffer from origin private file system
        fileHandle = await root.getFileHandle(name);
        const blob = await fileHandle.getFile();
        const buffer = await blob.arrayBuffer();
		//console.log("buffer loaded from OPFS cache: ", name, buffer);
        return buffer;
		
    } catch (err) {
        console.error("no cached model found in origin private file system, fetching from origin server. Err: ", err);
        // not saved in origin private file system, fetch from origin server
        return await fetchFile();
    }
}


function uploadToGPU(buffer, values, type) {
	//console.log("Uploading data to GPU buffer ...");
    const stagingBuffer = deviceWebgpu.createBuffer({
        usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC,
        size: values.buffer.byteLength,
        mappedAtCreation: true
    });
    const arrayBuffer = stagingBuffer.getMappedRange();
    if (type === "float32") {
        new Float32Array(arrayBuffer).set(values);
    } else if (type === "int32") {
        new Int32Array(arrayBuffer).set(values);
    }
    stagingBuffer.unmap();
    const encoder = deviceWebgpu.createCommandEncoder();
    encoder.copyBufferToBuffer(stagingBuffer, 0, buffer, 0, values.byteLength);
    deviceWebgpu.queue.submit([encoder.finish()]);
    stagingBuffer.destroy();
}


function submitComputeTask(pipeline, bindGroup) {
    let commandEncoderWebgpu = deviceWebgpu.createCommandEncoder();
    let computePassEncoder = commandEncoderWebgpu.beginComputePass();
    computePassEncoder.setPipeline(pipeline);
    computePassEncoder.setBindGroup(0, bindGroup);
    computePassEncoder.dispatchWorkgroups(32, 1, 1);
    computePassEncoder.end();
    computePassEncoder = null;
    queueWebgpu.submit([commandEncoderWebgpu.finish()]);
}


async function load_models(models) {
	//console.log("in load_models. models: ", models);
	// NOTE: download or load models first
	console.time("load_models");
	for (const [name, model] of Object.entries(models)) {
		//console.log("load_models: loading: ", name, model);
        //const statusBarElement = document.getElementById(`${name}StatusBar`);
        try {
            const model_bytes = await fetchAndCache(name, config.model, model.url);
            fetchedModels[name] = model_bytes;
        } catch (err) {
            console.error("caught error in load_models: ", err);
	    	self.postMessage({
				task: self.task,
	        	status: "error",
				message:"load_models failed"
	    	});
        }
		if(self.interrupted){
			return
		}
    }
    console.timeEnd("load_models");

	//console.log("loaded models: ", Object.keys(fetchedModels));

    if (Object.keys(fetchedModels).length !== Object.keys(models).length) {
        console.error("TEXT TO IMAGE WORKER: failed to load all models");
        postMessage({
            'task': self.task,
            'action': 'error',
            'message': 'Download_failed'
        });
		self.models_loaded = false;
    }
	else {
		//console.log("TEXT TO IMAGE WORKER: MODELS LOADED SUCCESFULLY");
        postMessage({
            'task': self.task,
            'action': 'download_complete'
        });
		self.models_loaded = true;
    }

}




const opt = {
    executionProviders: [config.provider],
    enableMemPattern: false,
    enableCpuMemArena: false,
    extra: {
        session: {
            disable_prepacking: "1",
            use_device_allocator_for_initializers: "1",
            use_ort_model_bytes_directly: "1",
            use_ort_model_bytes_for_initializers: "1"
        }
    }
};

switch (config.provider) {
    case "webgpu":
        if (!("gpu" in navigator)) {
            throw new Error("webgpu is NOT supported");
        }
        opt.preferredOutputLocation = {
            last_hidden_state: "gpu-buffer"
        };
        break;
    case "webnn":
        if (!("ml" in navigator)) {
            throw new Error("webnn is NOT supported");
        }
        opt.executionProviders = [{
            name: "webnn",
            deviceType: config.device,
            powerPreference: "default"
        }];
        break;
}




/*
  const imagePrompts = [
    "Paris with the river in the background",
    "A serene sunset over a calm ocean",
    "A bustling cityscape at night",
    "A tranquil forest with a flowing river",
    "A snowy mountain peak under a clear blue sky",
    "A medieval castle surrounded by a moat",
    "A futuristic city with flying cars",
    "A desert oasis with palm trees and a camel",
    "A tropical beach with crystal clear water",
    "A group of penguins on an ice floe",
    "A cherry blossom tree in full bloom",
    "A Victorian mansion at dusk",
    "A field of sunflowers under a sunny sky",
    "A cozy cabin in a winter landscape",
    "A bustling farmer's market with fresh produce",
    "A coral reef teeming with marine life",
    "A vineyard in the rolling hills of Tuscany",
    "A lighthouse on a cliff overlooking the sea",
    "A hot air balloon festival at sunrise",
    "A tranquil Japanese garden with a koi pond",
    "A space station orbiting a distant planet",
    "Impressionist oil painting of a beach at sunset with a narrow aspect ratio",
    "A photograph of a city skyline in the style of Edward Hopper taken from an aerial viewpoint",
    "A 3D rendering of a cat sitting on a windowsill in minimalist style with high resolution",
    "Graffiti-style painting of a city street with an urban look and textured surfaces",
    "A sketch of a pirate ship in black-and-white with realistic textures and low resolution",
    "A chalk drawing of a family picnic being attacked by ants in Central Park with a surrealist style",
    "A watercolor painting of a coffee shop with surreal elements in vibrant colors",
    "An oil painting of a rainbow over a rural abandoned town with classic style",
    "A 3D rendering of a spaceship taking off into space with a cyberpunk look and wide aspect ratio",
    "A sketch of two cats sitting on a sofa watching TV while eating spaghetti"
  ];
*/





async function do_run(task, initFlag=false){
	//console.log("TEXT TO IMAGE WORKER: in do_run. task: ", task);
	if(typeof task != 'undefined' && task != null && typeof task.prompt == 'string'){
		
		
		if(self.busy_running == false && self.busy_loading == false){
		
			if(self.models_loaded == false){
				if(self.busy_loading == true){
				    self.postMessage({
						task: task,
				        status: "error",
				        message: "already busy loading models",
				    });
					return false
				}
				else{
					//console.log("do_run: calling load_models first");
					if(self.interrupted){
						return false
					}
					self.busy_loading = true;
					await load_models(models);
					self.busy_loading = false;
					
				}
			}
		
			if(self.models_loaded){
				//console.log("do_run: OK, models are loaded, calling run()");
				if(self.interrupted){
					return false
				}
				self.busy_running = true;
			    self.postMessage({
					task: task,
			        status: "running",
			    });
				
				await run(task, initFlag);
		
				self.busy_running = false;
			    self.postMessage({
					task: task,
			        status: "running_completed"
			    });
				return true
				
			}
			else{
			    self.postMessage({
					task: task,
			        status: "error",
			        message: "loading models failed",
			    });
			}
			
		
		
		}
		else{
		    self.postMessage({
				task: task,
		        status: "error",
		        message: "already busy",
		    });
		
		}
		
		
		
		
		
	}
	else{
	    self.postMessage({
			task: task,
	        status: "error",
	        message: "invalid task or prompt",
	    });
	
	}
	
	
	
	return false
	
}




async function run(task, initFlag = false) {
    if (task == null || typeof task.prompt != 'string') {
        console.error("TEXT TO IMAGE WORKER: RUN: INVALID PROMPT. TASK: ", task);
        return false
    }
	//console.log("config.images: ", config.images);

    try {
        // initialize web gpu and models
        async function initializeModels() {
            for (const [name, model] of Object.entries(models)) {
				//console.log("initializeModels:  name, model: ", name, model);
				
                if (loadedCount === 1) {
                    webgpuResourceInitialize();
                }
                const sess_opt = {
                    ...opt,
                    ...model.opt
                };
				//console.log("run: initializeModels: sess_opt: ", sess_opt);
				//console.log(`run: initializeModels: Creating inference session for ${name} ...`, fetchedModels[name]);
                models[name].sess = await ort.InferenceSession.create(
                    fetchedModels[name],
                    sess_opt
                );
                loadedCount++;
				//console.log("loadedCount is now: ", loadedCount);
				if(self.interrupted){
					return false
				}
            }
            const latent_shape = [1, 4, 64, 64];
            latentData = randn_latents(latent_shape, sigma);

            uploadToGPU(latentBuffer, latentData, "float32");

            submitComputeTask(
                prescaleLatentSpacePipeline,
                prescaleLatentSpaceBindGroup
            );

            if (tokenizer === undefined) {
				//console.log("run: Loading tokenizer ..."); // https://huggingface.co/Xenova/clip-vit-base-patch16/resolve/main/
                
				//tokenizer = await AutoTokenizer.from_pretrained(
                //    ALL_NEEDED_MODEL_RESOURCES[tokenizerName].localFolderPathPrefix +
                //    tokenizerName
				//);
				
				const my_progress_callback = function(x){
					//console.log("IMAGE_TO_TEXT WORKER: got tokenizer download progress callback: ", x);
	        		self.postMessage(x);
	    		}
				
                tokenizer = await AutoTokenizer.from_pretrained('Xenova/clip-vit-base-patch16',{
		            progress_callback:my_progress_callback
		        });
				
                tokenizer.pad_token_id = 0;
				
		    	self.postMessage({
					task: self.task,
		        	status: "ready"
		    	});
				if(self.interrupted){
					return
				}
				
            }
        }

        async function executeInference(token) {
            const {
                input_ids
            } = await tokenizer(token, {
                padding: true,
                max_length: 77,
                truncation: true,
                return_tensor: false
            });

			//console.log("input_ids: ", input_ids);

            // text-encoder
            textEncoderOutputs["last_hidden_state"] = textEncoderOutputsTensor;
            await models.text_encoder.sess.run({
                    input_ids: new ort.Tensor("int32", input_ids, [1, input_ids.length])
                },
                textEncoderOutputs
            );
			
			if(self.interrupted){
				return false
			}
			
            for (let j = 0; j < config.images; j++) {
				//console.log("executeInference: creating image: ", j);
                let feed = {
                    sample: unetSampleInputsTensor,
                    timestep: new ort.Tensor("int64", [999n], [1]),
                    encoder_hidden_states: textEncoderOutputsTensor
                };
                var unetOutSampleOutputs = {};
                unetOutSampleOutputs["out_sample"] = unetOutSampleTensor;
                let {
                    out_sample
                } = await models.unet.sess.run(
                    feed,
                    unetOutSampleOutputs
                );
				
                submitComputeTask(stepLatentSpacePipeline, stepLatentSpaceBindGroup);

                var vaeDecodeInputs = {};
                vaeDecodeInputs["latent_sample"] = unetOutSampleTensor;
                const decodedOutputs = {};
                decodedOutputs["sample"] = decodedOutputsTensor;
                await models.vae_decoder.sess.run(vaeDecodeInputs, decodedOutputs);
				
                const commandEncoder = deviceWebgpu.createCommandEncoder();
                const textureView = renderContext.getCurrentTexture().createView();
                const renderPassDescriptor = {
                    colorAttachments: [{
                        view: textureView,
                        clearValue: {
                            r: 0.0,
                            g: 0.0,
                            b: 0.0,
                            a: 0.0
                        },
                        loadOp: "clear",
                        storeOp: "store"
                    }]
                };

                const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
                passEncoder.setPipeline(renderPipeline);
                passEncoder.setBindGroup(0, renderBindGroup);
                passEncoder.draw(6, 1, 0, 0);
                passEncoder.end();
                deviceWebgpu.queue.submit([commandEncoder.finish()]);
                await deviceWebgpu.queue.onSubmittedWorkDone();
				
				canvas.convertToBlob() // default is PNG
				.then((blob) => {
					//console.log("IMAGE TO TEXT WORKER: GOT CANVAS BLOB: ", blob);
					
			    	self.postMessage({
						task: self.task,
			        	status: "final_image",
						blob:blob
			    	});
					//reset();
				})
				.catch((err) => {
					console.error("IMAGE TO TEXT WORKER: offscreenCanvas -> convert image to blob -> caught error: ", err);
			    	self.postMessage({
						task: self.task,
			        	status: "error",
						message:"convert-to-blob-failed"
			    	});
				});
				
				
				if(self.interrupted){
					return false
				}
				
            }
        }


		if(self.models_initialized == false){
			//console.log("TEXT_TO_IMAGE WORKER: calling initializeModels first");
			await initializeModels();
			clearCanvas();
			self.models_initialized = true;
		}
		if(self.interrupted){
			return false
		}
        await executeInference(task.prompt);
		//console.log("TEXT_TO_IMAGE WORKER: inference complete");
		

    } catch (err) {
        console.error("TEXT TO IMAGE WORKER: Caught error in run: ", err);
    	self.postMessage({
			task: self.task,
        	status: "error",
			message:"run failed"
    	});
        return;
    }
}

function clearCanvas() {
    const commandEncoder = deviceWebgpu.createCommandEncoder();
    const textureView = renderContext.getCurrentTexture().createView();
    const renderPassDescriptor = {
        colorAttachments: [{
            view: textureView,
            clearValue: {
                r: 0.0,
                g: 0.0,
                b: 0.0,
                a: 0.0
            },
            loadOp: "clear",
            storeOp: "store"
        }]
    };

    const passEncoder = commandEncoder.beginComputePass(renderPassDescriptor);
    passEncoder.end();
    deviceWebgpu.queue.submit([commandEncoder.finish()]);
}

function webgpuResourceInitialize() {
	//console.log("Initializing the webgpu resources ...");
    deviceWebgpu = ort.env.webgpu.device;
    queueWebgpu = deviceWebgpu.queue;

    textEncoderOutputsBuffer = deviceWebgpu.createBuffer({
        size: Math.ceil((1 * 77 * 1024 * 4) / 16) * 16,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
    });
    textEncoderOutputsTensor = ort.Tensor.fromGpuBuffer(
        textEncoderOutputsBuffer, {
            dataType: "float32",
            dims: [1, 77, 1024],
            dispose: () => textEncoderOutputsBuffer.destroy()
        }
    );

    unetOutSampleBuffer = deviceWebgpu.createBuffer({
        size: Math.ceil((1 * 4 * 64 * 64 * 4) / 16) * 16,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
    });
    unetOutSampleTensor = ort.Tensor.fromGpuBuffer(unetOutSampleBuffer, {
        dataType: "float32",
        dims: [1, 4, 64, 64],
        dispose: () => unetOutSampleBuffer.destroy()
    });
    latentBuffer = deviceWebgpu.createBuffer({
        size: Math.ceil((1 * 4 * 64 * 64 * 4) / 16) * 16,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
    });
    unetSampleInputsBuffer = deviceWebgpu.createBuffer({
        size: Math.ceil((1 * 4 * 64 * 64 * 4) / 16) * 16,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
    });
    unetSampleInputsTensor = ort.Tensor.fromGpuBuffer(unetSampleInputsBuffer, {
        dataType: "float32",
        dims: [1, 4, 64, 64],
        dispose: () => unetSampleInputsBuffer.destroy()
    });
    decodedOutputsBuffer = deviceWebgpu.createBuffer({
        size: Math.ceil((1 * 3 * pixelHeight * pixelWidth * 4) / 16) * 16,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
    });
    decodedOutputsTensor = ort.Tensor.fromGpuBuffer(decodedOutputsBuffer, {
        dataType: "float32",
        dims: [1, 3, pixelHeight, pixelWidth],
        dispose: () => decodedOutputsBuffer.destroy()
    });

    prescaleLatentSpacePipeline = deviceWebgpu.createComputePipeline({
        layout: "auto",
        compute: {
            module: deviceWebgpu.createShaderModule({
                code: PRESCALE_LATENT_SPACE_SHADER
            }),
            entryPoint: "_start"
        }
    });

    prescaleLatentSpaceBindGroup = deviceWebgpu.createBindGroup({
        layout: prescaleLatentSpacePipeline.getBindGroupLayout(0),
        entries: [{
                binding: 0,
                resource: {
                    buffer: unetSampleInputsBuffer
                }
            },
            {
                binding: 1,
                resource: {
                    buffer: latentBuffer
                }
            }
        ]
    });

    stepLatentSpacePipeline = deviceWebgpu.createComputePipeline({
        layout: "auto",
        compute: {
            module: deviceWebgpu.createShaderModule({
                code: STEP_LATENT_SPACE_SHADER
            }),
            entryPoint: "_start"
        }
    });

    stepLatentSpaceBindGroup = deviceWebgpu.createBindGroup({
        layout: stepLatentSpacePipeline.getBindGroupLayout(0),
        entries: [{
                binding: 0,
                resource: {
                    buffer: unetOutSampleBuffer
                }
            },
            {
                binding: 1,
                resource: {
                    buffer: latentBuffer
                }
            }
        ]
    });

    //const canvas = new OffscreenCanvas(512,512);
    
    renderContext = canvas.getContext("webgpu");
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    const presentationSize = [pixelWidth, pixelHeight];
    renderContext.configure({
        device: deviceWebgpu,
        size: presentationSize,
        format: presentationFormat,
        alphaMode: "premultiplied"
    });
    renderPipeline = deviceWebgpu.createRenderPipeline({
        layout: "auto",
        vertex: {
            module: deviceWebgpu.createShaderModule({
                code: VERTEX_SHADER
            }),
            entryPoint: "main"
        },
        fragment: {
            module: deviceWebgpu.createShaderModule({
                code: PIXEL_SHADER
            }),
            entryPoint: "main",
            targets: [{
                format: presentationFormat
            }]
        },
        primitive: {
            topology: "triangle-list"
        }
    });

    renderBindGroup = deviceWebgpu.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [{
            binding: 1,
            resource: {
                buffer: decodedOutputsBuffer
            }
        }]
    });
}


function formatBufferSize(bufferByteSize) {
    if (bufferByteSize >= 1e9) {
        return (bufferByteSize / 1e9).toFixed(2) + "GB";
    } else if (bufferByteSize >= 1e6) {
        return (bufferByteSize / 1e6).toFixed(2) + "MB";
    } else if (bufferByteSize >= 1e3) {
        return (bufferByteSize / 1e3).toFixed(2) + "KB";
    } else {
        return bufferByteSize + "bytes";
    }
}



function formatBytes(bytes, decimals = 0) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)), 10);
    const rounded = (bytes / Math.pow(1000, i)).toFixed(decimals);
    return rounded + " " + sizes[i];
}





console.log("TEXT TO IMAGE WORKER EXISTS");
postMessage({
    "status": "exists"
});



/*
try {
	//console.log("TEXT TO IMAGE WORKER: PRELOAD: calling load_models");
    postMessage({
        'task': self.task,
        'action': 'preloading'
    });
    await load_models(models);
    postMessage({
        'task': self.task,
        'action': 'download_complete'
    });
    postMessage({
        'task': self.task,
        'action': 'preload_complete'
    });
    
} catch (err) {
    console.error("TEXT TO IMAGE WORKER: preload: caught error calling load_models: ", err);
}
*/


















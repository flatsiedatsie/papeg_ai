import { Wllama } from './wllama/index.js';

window.llama_cpp_app = null;

// Wllama caches files in: wllama_cache
const CONFIG_PATHS = {
  'single-thread/wllama.js'       : './wllama/single-thread/wllama.js',
  'single-thread/wllama.wasm'     : './wllama/single-thread/wllama.wasm',
  'multi-thread/wllama.js'        : './wllama/multi-thread/wllama.js',
  'multi-thread/wllama.wasm'      : './wllama/multi-thread/wllama.wasm',
  'multi-thread/wllama.worker.mjs': './wllama/multi-thread/wllama.worker.mjs',
};
// If you want to enforce single-thread, add { "n_threads": 1 } to LoadModelConfig


window.last_llama_cpp_crash_time = 0;
let called_on_model_loaded = false;


const UNLOADED = 'unloaded' // whisper not loaded
const LISTENING = 'listening'
const RECORDING = 'recording'
const DOING_STT = 'stt'
const DOING_ASSISTANT = 'assistant'
const DOING_TTS = 'tts'


const prompt_el = document.getElementById('prompt');

let my_task = null;
let response_so_far = "";
let pre_download_state = null;
window.sentences_parsed = [];
window.tts_queue = [];

//const onModelLoaded = async function (task=null){
const onModelLoaded = async (task=null,first_load=true) => {
	
	window.interrupt_wllama = false;
	called_on_model_loaded = true;

	if(task==null){
		//console.log("llama_cpp: onModelLoaded: no task provided. aborting.");
		window.llama_cpp_busy = false;
		return false
	}
	my_task = task;
	
	if(typeof task.assistant == 'string'){
		let download_progress_message_el = document.querySelector('.message.pane-' + task.assistant + '.download-progress-chat-message');
		if(download_progress_message_el){
			download_progress_message_el.classList.add('download-complete-chat-message');
			setTimeout(() => {
				download_progress_message_el.remove();
			},1000);
		}
	}
	
	
	if(typeof window.currently_loaded_llama_cpp_assistant != 'string'){
		console.error("wllama_cpp: onModelLoaded: aborting, window.currently_loaded_llama_cpp_assistant was not a string: ", window.currently_loaded_llama_cpp_assistant);
		window.llama_cpp_busy = false;
		return false
	}
	
	window.sentences_parsed = [];
	
	if(my_task == null){
		window.remove_body_class('waiting-for-response'); // no longer used
		if(window.state == DOING_ASSISTANT){
			window.set_state(LISTENING);
		}
		window.llama_cpp_busy = false;
		return false
	}
	else if(typeof my_task == 'object' && my_task != null && typeof my_task.type == 'string'){
		if(my_task.type != 'chat'){
			console.warn('llama_cpp: onModelLoaded: resetting llama_cpp before summarize task (DISABLED). my_task.type: ', my_task.type);
			//window.restart_llama_cpp();
		}
	}
	
	if(typeof my_task.prompt != 'string'){
		console.error("llama_cpp: onModelLoaded: my_task.prompt was not a string.  my_task: ", my_task);
		window.llama_cpp_busy = false;
		return false
	}
	
	let prompt = null;
	let using_chatml = false;
	let total_prompt = '';
	let chat_history = []; // assumes the first message in this is always from the user
	let ctx_size = 1024;
	let temperature = 0.7;
	let top_k = 10;
	let top_p = 0.9;
	
	if(typeof window.currently_loaded_llama_cpp_assistant != 'string'){
		console.error("wllama: window.currently_loaded_llama_cpp_assistant was not a string?: ", window.currently_loaded_llama_cpp_assistant);
	}
	else{	
		if(typeof window.settings.assistants[window.currently_loaded_llama_cpp_assistant]['context'] == 'number'){
			ctx_size = window.settings.assistants[window.currently_loaded_llama_cpp_assistant]['context'];
			//console.log("wllama: found custom context size in user's settings: ", ctx_size);
		}
		else if(typeof window.assistants[window.currently_loaded_llama_cpp_assistant] != 'undefined' && typeof window.assistants[window.currently_loaded_llama_cpp_assistant]['context'] == 'number'){
			ctx_size = window.assistants[window.currently_loaded_llama_cpp_assistant]['context'];
			//console.log("wllama: using context size from assistants dict: ", ctx_size);
		}
		else{
			console.error("wllama: getting context size fell through, so it's still the default: ", ctx_size);
		}
	
		if(typeof window.settings.assistants[window.currently_loaded_llama_cpp_assistant] != 'undefined' && typeof window.settings.assistants[window.currently_loaded_llama_cpp_assistant]['top_k'] == 'number'){
			top_k = window.settings.assistants[window.currently_loaded_llama_cpp_assistant]['top_k'];
			//console.log("wllama: settings.assistant has custom top_k: ", top_k);
		}
		if(typeof window.assistants[window.currently_loaded_llama_cpp_assistant] != 'undefined' && typeof window.assistants[window.currently_loaded_llama_cpp_assistant]['top_p'] == 'number'){
			top_k = window.assistants[window.currently_loaded_llama_cpp_assistant]['top_p'];
			//console.log("wllama: assistant has custom top_p: ", top_p);
		}
		
		// Get custom temperature from task if it is set
		if(typeof my_task.temperature == 'number'){
			temperature = my_task.temperature;
		}
		// Get custom temperature if it is set
		else if(typeof window.currently_loaded_assistant == 'string' && typeof window.settings.assistants[window.currently_loaded_llama_cpp_assistant] != 'undefined' && typeof window.settings.assistants[window.currently_loaded_llama_cpp_assistant].temperature != 'undefined'){
			temperature = window.assistants[window.currently_loaded_llama_cpp_assistant].temperature;
		}
		// Fall back to temperature in assistants dict if it exists
		else if(typeof window.currently_loaded_assistant == 'string' && typeof window.assistants[window.currently_loaded_llama_cpp_assistant] != 'undefined' && typeof window.assistants[window.currently_loaded_llama_cpp_assistant].temperature != 'undefined'){
			temperature = window.assistants[window.currently_loaded_llama_cpp_assistant].temperature;
		}
		if(typeof temperature != 'number'){
			console.error("wllama: temperature was not a number!: " + temperature);
			temperature = 0;
		}
	}

	total_prompt = await window.get_total_prompt(my_task);
	//total_prompt = window.apply_template(my_task);
	//console.warn("* onModelLoaded: total_prompt: \n\n", total_prompt,"\n\n");
	//console.log("* onModelLoaded: final ctx_size: ", ctx_size);
	//console.log("* onModelLoaded: final temperature: ", temperature);

	if(total_prompt == null){
		console.error("wllama: total_prompt is null, aborting");
		window.llama_cpp_busy = false;
		return false
	}

	if(total_prompt == ''){
		console.warn("wllama: total prompt was empty string");
		if(typeof my_task.prompt == 'string' && my_task.prompt.length > 1){
			total_prompt = my_task.prompt;
		}
		else{
			console.error("wllama: total_prompt was empty string: ", total_prompt);
			window.llama_cpp_busy = false;
			return false
		}
	}
	
	
	
		
	
	/*
	
	OLD 
	llama_cpp_wasm
	OPTIONS/DEFAULTS:
	
	batch_size: 512
	chatml: false
	ctx_size: 2048
	event: 2
	n_gpu_layers: 0
	n_predict: -2
	no_display_prompt: true
	prompt: ""
	temp: 0.7
	top_k: 40
	top_p: 0.9
	
	*/
	
	if(total_prompt != null && total_prompt != ''){
	
		if(typeof window.conversations[window.settings.assistant] == 'undefined'){
			window.conversations[window.settings.assistant] = [];
		}
		//console.log("llama_cpp: adding user's prompt to conversation history");
		//window.conversations[window.settings.assistant].push({'role':'user','content':my_task.prompt});
		
	
		if(window.state == UNLOADED || window.state == DOING_STT){
			window.set_state(DOING_ASSISTANT);
		}
		if(window.settings.settings_complexity == 'developer'){
			console.warn("dev: Wllama: onModelLoaded: total_prompt: ", total_prompt);
		}
		
		//console.log("onModelLoaded: setting window.llama_cpp_busy to true");
		window.llama_cpp_busy = true;
		window.add_body_class('doing-assistant');
		
		//console.log("onModelLoaded: total_prompt: ", total_prompt);
		//console.log("onModelLoaded: ctx_size: ", ctx_size);
		//console.log("onModelLoaded: temperature: ", temperature);
		//console.log("onModelLoaded: window.llama_cpp_app: ", window.llama_cpp_app);
		window.llama_cpp_fresh = false;
		
		//console.log("onModelLoaded: model is no longer fresh"); // no longer needed
		//console.log("\n\ncalling Wllama's createCompletion\n\n");
		
		
		
		
		/*

		export interface SamplingConfig {
		  // See sampling.h for more details
		  mirostat?: number, // 0 = disabled, 1 = mirostat, 2 = mirostat 2.0
		  mirostat_tau?: number,
		  temp?: number, // temperature
		  top_p?: number,
		  top_k?: number,
		  penalty_last_n?: number,
		  penalty_repeat?: number,
		  penalty_freq?: number,
		  penalty_present?: number,
		  penalize_nl?: boolean,
		  dynatemp_range?: number,
		  dynatemp_exponent?: number,
		  grammar?: string,
		  n_prev?: number,
		  n_probs?: number,
		  min_p?: number,
		  tfs_z?: number,
		  typical_p?: number,
		  logit_bias?: { token: number, bias: number }[],
		};
	
		*/
		
		let sampling = generate_model_settings(task);
		
		
		
		
		try{
			
			//window.interrupt_wllama = false;
			//let response_so_far = "";
			window.currently_running_llm = task.assistant;
			const outputText = await window.llama_cpp_app.createCompletion(total_prompt, {
	            //nPredict: 500,
				allow_offline:true,
	            sampling: {
					temp: temperature,
					//top_k: top_k,//40,
					//top_p: top_p, //0.9,
	            },
				useCache: true,
	            onNewToken: (token, piece, currentText, { abortSignal }) => {
    				if (window.interrupt_wllama) {
						console.log("sending interrupt signal to Wllama");
						abortSignal();
						window.interrupt_wllama = false;
					}
					else{
						//console.log("wllama: onNewToken:  token,piece,currentText:", token, piece, currentText);
						let new_chunk = currentText.substr(response_so_far.length);
						window.handle_chunk(my_task,response_so_far,new_chunk);
						response_so_far = currentText;
					}
	            },
	        });
			
			//console.log("wllama:  outputText: ", outputText);
			if(typeof outputText == 'string' && outputText.length){
				await window.handle_completed_task(my_task, outputText);
			}
			else if(typeof outputText == 'string' && outputText == ''){
				console.error("wllama: output text was invalid. Empty string?: -->" +  outputText + "<--");
				window.flash_message(window.get_translation("The_AI_gave_an_empty_response"),3000,'fail');
				await window.handle_completed_task(my_task, outputText, {'state':'failed'});
			}
			else{
				console.error("wllama: output text was invalid, and not a string: ", outputText);
				window.flash_message(window.get_translation("The_AI_gave_an_unexpected_response"),3000,'fail');
				await window.handle_completed_task(my_task, '', {'state':'failed'});
			}
			
			response_so_far = '';
			my_task = null;
			window.llama_cpp_busy = false;
			called_on_model_loaded = false;
		}
		catch(err){
			console.error("caught error running Wllama: ", err);
			
			if( ('' + err).indexOf('Received abort signal from llama.cpp') != -1){
				window.add_chat_message(window.currently_loaded_llama_cpp_assistant,window.currently_loaded_llama_cpp_assistant,'it_seems_the_AI_has_crashed#setting---');
			}
			else if( ('' + err).indexOf('memory access out of bounds') != -1){
				window.add_chat_message(window.currently_loaded_llama_cpp_assistant,window.currently_loaded_llama_cpp_assistant,'it_seems_the_AI_has_crashed#setting---');
			}
			
			message_downloads_container_el.innerHTML = '';
			called_on_model_loaded = false;
			window.llama_cpp_busy = true;
			window.flash_message(window.get_translation("The_AI_has_crashed"));
			setTimeout(() => {
				//restart_llama_cpp(false);
				console.error("wllama crash: 5 second passed");
				repair_wllama();
			},5000);
			
			
		}
		
	}
	else{
		console.error("wllama: onModelLoaded: invalid prompt: at the end total_prompt was still an empty string or null: ", total_prompt);
	}
	
}


async function repair_wllama(){
	console.error("in repair_wllama");
	
	
	
	//console.log("it seems wllama crashed while loading the AI model");
	if(my_task != null){
		
		if(typeof my_task.parent_index == 'number'){
			window.change_tasks_with_parent_index(my_task.parent_index);
		}
		
		console.warn("repair_wllama:  candle handle_completed_task to set my_task to failed")
		await window.handle_completed_task(my_task, '', {'state':'failed'});
		my_task = null;
	}
	
	window.llama_cpp_busy = true;
	called_on_model_loaded = false;
	console.error("repair_wllama: calling restart_llama_cpp");
	await restart_llama_cpp();
	window.llama_cpp_busy = false;
	
}



//
// MODEL DOWNLOAD PROGRESS
//
// Is this still used?
const onMessage = (progression) => {
	wllama_update_model_download_progress(progression);
};

let previous_percentage = 1;
let previous_time = 0;



async function wllama_update_model_download_progress(progression, assistant_id=null){
	//console.log("LLAMA_CPP MODEL DOWNLOAD:  PROGRESSION, window.llama_cpp_model_being_loaded: ", progression, window.llama_cpp_model_being_loaded, assistant_id);
	
	if(assistant_id == null){
		assistant_id = window.llama_cpp_model_being_loaded;
	}
	
	if(progression == 1){
		if(typeof assistant_id == 'string'){
			//console.log("llama_cpp model download complete: ", assistant_id);
			//flash_message(window.get_translation("Download_complete"),2000);
			if(window.settings.assistant == assistant_id){
				window.add_body_class('model-loaded');
			}
			let progress_el = document.querySelector('#download-progress-' + assistant_id);
			if(progress_el != null){
				const message_el = progress_el.closest('.message');
				if(message_el){
					message_el.remove();
				}
			}
		}
		else{
			console.error("llama_cpp model download complete, but no assistant id?");
			const downloads_container_el = document.querySelector('#message-downloads-container');
			if(downloads_container_el){
				downloads_container_el.innerHTML = '';
			}
		}
		
		await update_cached_files_list();
		window.handle_download_complete(false); // TODO: delay this. This re-calculates the total used disk space. But in case of custom AI models it's called to early here, as we won't know their size until they have fully loaded. 
		
	}
	
	if(assistant_id != null){
		//console.log("a llama_cpp model is being loaded");
		
	
		const percent = Math.floor(progression * 300);
		//console.log("wllama_update_model_download_progress: percent: ", percent);
		
		if(previous_percentage > percent){
			previous_percentage = 0;
		}
		
		if(percent > previous_percentage){
			//console.log("Wllama download percent: ", percent / 3);
			let progress_el = document.getElementById('download-progress-' + assistant_id);
			if(progress_el == null){
				
				if(progression != 1){
					//console.log("llama_cpp (down)load progress element is missing, adding it now: ", assistant_id, percent);
					window.add_chat_message(assistant_id,assistant_id,"download_progress#setting---");
				}
			}
			else{
				//console.log("a llama_cpp model is being loaded: found the progress element");
				progress_el.value = progression;
			
			}
			
			if(percent % 3 == 0 && percent != 300){
				//console.log("doing remaining download time estimation. percent: ", percent);
				const now_time = Date.now() / 300; // SIC
				if(previous_time == 0){
		
					previous_time = now_time;
					//console.log("changed previous time to: ", previous_time);
				}
				else if(progress_el != null){
					let delta = now_time - previous_time;
					previous_time = now_time;
					//console.log("it took this long to download the last percent: ", delta);
					let time_remaining = ((300 - percent)/10) * delta;
					let time_remaining_el = progress_el.parentNode.querySelector('.time-remaining'); // #download-progress-' + window.settings.assistant + ' + 
					if(time_remaining_el != null){
						time_remaining_el.innerHTML = window.create_time_remaining_html(time_remaining);
					}
					else{
						console.error("could not find time-remaining element")
					}
				}
			}
			
	
			previous_percentage = percent;
		}
		else{
			//console.error("Download percentage is not greater: ", previous_percentage, percent);
		}
	    
		
	}
	else{
		console.error("wllama download progress: assistant_id was null");
	}
    
}
window.wllama_update_model_download_progress = wllama_update_model_download_progress;








function generate_model_settings(task){
	let model_settings = {'allow_offline':true};//{'cache_type_k': 'q4_0'}; // save memory
	//let model_settings = {};
	
	let assistant_id = window.settings.assistant;
	// window.currently_loaded_llama_cpp_assistant
	if(typeof task.assistant == 'string'){
		assistant_id = task.assistant;
	}
	
	
	let context = 1024;
	model_settings['n_ctx'] = 1024;
	
	if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['context'] == 'number'){
		context = window.settings.assistants[assistant_id]['context'];
	}
	else if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id]['context'] == 'number'){
		context = window.assistants[assistant_id]['context'];
	}
	
	if(typeof context == 'number' && context > 1024){
		
		if(window.is_mobile){
			//window.web_llm_app_config['context_window_size'] = 1024;
		
			// 1024 is the default for mobile, unless there is tons of ram
			if(window.ram > 6000 && context > 2048){
				model_settings['n_ctx'] = 2048;
			}
		
		}
		else{
			model_settings['n_ctx'] = context;
		}
	}

	//model_settings['n_seq_max'] = 1; //model_settings['n_ctx'];
	//model_settings['n_batch'] = 1024; //2048;//model_settings['n_ctx'];
	//model_settings['n_threads'] = 4;
	
	if(typeof window.assistants[assistant_id]['cache_type_k'] == 'string'){
		model_settings['cache_type_k'] = window.assistants[assistant_id]['cache_type_k']; //'q4_0'; = window.assistants[assistant_id]['context'];
	}
			
	model_settings['embeddings'] = false;
	
	
	let downloads = {};
	let file_chunk_count = 1;
	if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].download_url != 'undefined' && window.assistants[assistant_id].download_url != null && Array.isArray(window.assistants[assistant_id].download_url)){
		file_chunk_count = window.assistants[assistant_id].download_url.length;
		//console.log("wllama: downloading file in chunks: ", file_chunk_count);
	}
	
	model_settings['progressCallback'] = ({ loaded, total }) => {
		
		//console.log(`Wllama: downloading... ${Math.round(loaded/total*100)}%`, loaded, total);
		//console.log("percentage, loaded, total: ", Math.round(loaded/total*100) + '%', loaded, total);
		
		if(total != 0 && loaded > 1000000){
			//console.log("loaded, total: ", loaded, total);
			wllama_update_model_download_progress(loaded / total, assistant_id);
		}
	}
	
	
	let temperature = 0;
	// Get custom temperature from task if it is set
	if(typeof task.temperature == 'number'){
		temperature = task.temperature;
	}
	// Get custom temperature if it is set
	else if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].temperature == 'number'){
		temperature = window.assistants[assistant_id].temperature;
	}
	// Fall back to temperature in assistants dict if it exists
	else if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].temperature == 'number'){
		temperature = window.assistants[assistant_id].temperature;
	}
	//console.log("wllama: window.llama_cpp_app: ", window.llama_cpp_app);
	if(window.settings.settings_complexity == 'developer'){
		console.warn("dev: wllama: temperature: ", temperature);
	}
	
	
	if(typeof temperature == 'number'){
		model_settings['temp'] = temperature;
		
		if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].seed == 'number'){
			model_settings['seed'] = window.settings.assistants[assistant_id].seed;
			console.log("wllama: spotted seed preference, it is now: ", window.settings.assistants[assistant_id].seed);
		}
		else if(temperature == 0){
			model_settings['seed'] = 42;
			//console.log("wllama: temperature was 0, seed set to 42");
		}
	}
	return model_settings
}




// This function returns immediately so that the main interval loop can continue
function do_llama_cpp(task=null, model_url=null, query=''){
	//console.log("in do_llama_cpp.  task,model_url,query: ", task,model_url,query);
	if(query != ''){
		//console.log("do_llama_cpp: also placing a string in the prompt input: ", query);
		prompt_el.value = query;
	}
	
	if(task==null){
		console.error("do_llama_cpp: task was null. Aborting.");
		window.llama_cpp_busy = false;
		return false
	}
	
	if(typeof window.settings.assistant != 'string'){
		console.error("do_llama_cpp: no valid window.settings.assistant: ", window.settings.assistant); // need to know which model to load. Or could get that from the task?
		window.llama_cpp_busy = false;
		return false
	}
	
	let assistant_id = window.settings.assistant;
	// window.currently_loaded_llama_cpp_assistant
	if(typeof task.assistant == 'string'){
		assistant_id = task.assistant;
	}
	else{
		console.warn("do_llama_cpp: task had no assistant property: ", task);
	}
	if(typeof assistant_id != 'string'){
		console.error("do_llama_cpp: no valid assistant_id");
		window.llama_cpp_busy = false;
		return false
	}
	
	if(typeof window.assistants[assistant_id]['do_not_load'] != 'undefined' && window.assistants[assistant_id]['do_not_load'] == true){ // for 'fake' assistants, such as Developer
		console.warn("do_llama_cpp: aborting, as the assistant has do_not_load flag: ", assistant_id);
		window.llama_cpp_busy = false;
		return false
	}
	
	
	if(window.llama_cpp_busy){
		console.error("in do_llama_cpp, but window.llama_cpp_busy was true? Aborting!");
		return false
	}
	
	if(typeof window.settings.assistants[assistant_id] == 'undefined' || window.settings.assistants[task.assistant] == null){
		console.error("do_llama_cpp: assistant_id not found in window.assistants: ", assistant_id);
		window.llama_cpp_busy = false;
		return false
	}
	
	
	window.llama_cpp_busy = true;
	
	// NO AWAIT
	really_do_llama_cpp(task, model_url, query);
	return true
}
window.do_llama_cpp = do_llama_cpp;




async function really_do_llama_cpp(task=null, model_url=null, query=''){
	//console.log("in really_do_llama_cpp. task: ", task);
	//console.log("window.llama_cpp_app: ", window.llama_cpp_app);
	
	window.llama_cpp_busy = true;
	called_on_model_loaded = false;
	if(task == null){
		my_task = null;
	}
	else{
		my_task = JSON.parse(JSON.stringify(task));
	}
	
	
	let assistant_id = window.settings.assistant;
	// window.currently_loaded_llama_cpp_assistant
	if(typeof my_task.assistant == 'string'){
		assistant_id = my_task.assistant;
	}
	
	
	if(model_url == null){
		
		//console.log("do_llama_cpp: assistant_id: ",  assistant_id);
		
		if(my_task != null && typeof assistant_id == 'string'){
		
			if(typeof window.settings.assistants[assistant_id]['download_url'] == 'string' 
				&& (window.settings.assistants[assistant_id]['download_url'].startsWith('http') || window.settings.assistants[assistant_id]['download_url'].startsWith('/')) // || window.settings.assistants[task.assistant]['download_url'].startsWith('./')
			){
				model_url = window.settings.assistants[assistant_id]['download_url'];
				//console.log("do_llama_cpp: getting CUSTOM model URL from window.settings: ", model_url);
			}
			else if(typeof window.settings.assistants[assistant_id]['download_url'] == 'string' 
				&& (window.settings.assistants[assistant_id]['download_url'].startsWith('[') && window.settings.assistants[assistant_id]['download_url'].endsWith(']')) // || window.settings.assistants[task.assistant]['download_url'].startsWith('./')
			){
				try{
					model_url = JSON.parse(window.settings.assistants[assistant_id]['download_url']);
					//console.log("getting CUSTOM model URL from window.settings: ", model_url);
				}
				catch(err){
					console.error("do_llama_cpp: failed to parse what seemed like a custom model chunks array: ", window.settings.assistants[assistant_id]['download_url']);
				}
			}
			
			if(model_url == null){
				//console.log("do_llama_cpp: no custom model url, so will use the one from window.assistants (if it exists)");
				if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id]['download_url'] != 'undefined' && window.assistants[assistant_id]['download_url'] != null){
					model_url = window.assistants[assistant_id]['download_url'];
					//console.log("do_llama_cpp: got model URL from assistants dict: ", model_url);
				}
				else{
					// custom model, but still without a URL
					// Although technically it could also be that the assistant key is invalid
					//console.log("do_llama_cpp: ABORTING, NO DOWNLOAD_URL (likely custom assistant)");
					window.add_chat_message(assistant_id,'developer',get_translation('Missing_AI_model_URL'));
					window.llama_cpp_busy = false;
					return false
				}
			}
			
		}
		else{
			console.warn("do_llama_cpp: could not get a download URL from the task, as assistant_id was likely invalid: ", assistant_id, JSON.stringify(my_task,null,4));
		}
		
		// If the model_url is still an empty string, fall back to using the download URL of the currently visible assistant
		/*
		if(model_url == null){
			console.warn("do_llama_cpp: could not get a model URL via/from the task itself, falling back to getting it based on the currently visible assistant");
			if(typeof window.assistants[window.settings.assistant]['download_url'] == 'string'){
				model_url = window.assistants[window.settings.assistant]['download_url'];
			}
		}
		*/
		
		// Turn relative model paths into absolute URL's
		if(typeof model_url == 'string' && model_url != '' && !model_url.startsWith('http')){
			let base_url = window.location.origin; //window.location.href;
			//console.log("do_llama_cpp: base_url: ", base_url);
			if(base_url.endsWith('/')){
				
				base_url = base_url.substring(0, base_url.length - 1);
				//console.log("do_llama_cpp: removing trailing slash base url: ", '' + base_url);
			}
			if(!model_url.startsWith('/')){
				//console.log("do_llama_cpp: adding starting slash to model url: ", '' + model_url);
				model_url = '/' + model_url;
			}
			model_url = base_url + model_url;
			//console.log("do_llama_cpp: generated relative model url: ", model_url);
		}
		
		if(typeof model_url == 'string'){
			//console.warn("do_llama_cpp: is it correct? model_url: ", model_url);
		}
		else if( Array.isArray(model_url) && model_url.length){
			//console.warn("model_url is an array. First item is: ", model_url[0])
		}
		
	}
	
	// If the URL is not a string, that's not good
	if(model_url == null){
		console.error("do_llama_cpp: model_url was null. Aborting.");
		window.add_chat_message(assistant_id,'developer',get_translation('Missing_AI_model_URL'));
		window.llama_cpp_busy = false;
		return false
	}
	
	// If the URL is still an empty string, that's not good
	if(typeof model_url == 'string' && model_url == ''){
		console.error("\n\nERROR, model_url was an empty string. Adding error chat message and aborting.\n\n");
		if(typeof assistant_id == 'string' && assistant_id.startsWith('custom')){
			window.add_chat_message(assistant_id,'developer','Please_provide_the_URL_of_an_AI_model#setting---');
		}
		else{
			window.add_chat_message(assistant_id,'developer',get_translation('Missing_AI_model_URL'));
		}
		await window.handle_completed_task(task,false,{'state':'failed'});
		window.llama_cpp_busy = false;
		return false
	}
	
	//console.log("do_llama_cpp: model_url is now: ", model_url);

	if(typeof model_url == 'string'){
		let check_for_gguf_extension = model_url.toLowerCase();
		if(!check_for_gguf_extension.endsWith('.gguf')){
			console.warning("\n\nWarning! MODEL URL DOES NOT SEEM TO END WITH .GGUF:\n" + model_url + "\n\n")
		}
	}
	




	// THE FORK IN THE ROAD
	
    //if (app && app.url == selectModel.value) {
	if (window.llama_cpp_app && typeof window.currently_loaded_llama_cpp_assistant == 'string' && window.currently_loaded_llama_cpp_assistant == assistant_id) {
		if(window.settings.settings_complexity == 'developer'){
			console.warn("dev: do_llama_cpp: FORK: this model was already the loaded model. Jumping to onModelLoaded.  currently_loaded_llama_cpp_assistant: ", window.currently_loaded_llama_cpp_assistant);
		}
		await onModelLoaded(task, false); // false indicates that the model was already loaded
		return true;
    }
	else{
		if(window.settings.settings_complexity == 'developer'){
			console.warn("dev: really_do_llama_cpp: FORK: this model was NOT already the loaded model. Going to load model first, and then call onModelLoaded. assistant_id,window.currently_loaded_llama_cpp_assistant: ", assistant_id, window.currently_loaded_llama_cpp_assistant);
		}
		//console.log("- window.llama_cpp_app: ", window.llama_cpp_app);
		//console.log("- window.currently_loaded_llama_cpp_assistant: ", window.currently_loaded_llama_cpp_assistant);
		//window.add_chat_message(assistant_id,assistant_id,'download_progress#setting---');
	}
	if(window.settings.settings_complexity == 'developer'){
		console.log("\n\ndo_llama_cpp: LOADING FIRST/DIFFERENT MODEL.  assistant_id,model_url: ", assistant_id, model_url);
	}
	
	try{
		
		window.add_chat_message(assistant_id,assistant_id,"download_progress#setting---");
		
		if(window.llama_cpp_app == null){
			console.warn("really_do_llama_cpp: still had to create window.llama_cpp_app");
			create_wllama_object();
		}
		else{
			
			try{
				if(typeof window.currently_loaded_llama_cpp_assistant == 'string'){
					console.log("really_do_llama_cpp: calling unload_llama_cpp first, to unload:  window.currently_loaded_llama_cpp_assistant: ", window.currently_loaded_llama_cpp_assistant);
					await unload_llama_cpp();
				}
			}
			catch(err){
				console.error("really_do_llama_cpp: caught error trying to call wllama's isModelLoaded: ", err);
				//called_on_model_loaded = false;
			}
			
		}
		
		if(window.llama_cpp_app == null){
			console.warn("really_do_llama_cpp: still had to create window.llama_cpp_app (likely just unloaded the previous model)");
			create_wllama_object();
		}
		
		
		
		//window.currently_loaded_llama_cpp_assistant = null;

		previous_percentage = 1;
		previous_time = 0;
	
	
		if(window.llama_cpp_app != null && typeof window.llama_cpp_app.worker != 'undefined' && typeof window.llama_cpp_app.worker != null){
			console.warn("Sreally_do_llama_cpp: terminated worker on existing app object before loading the new AI model (blocked)");
			//window.llama_cpp_app.worker.terminate();
		}
	
		//window.assistants_loading_count++;
		//window.busy_loading_assistant = true;
	
		/*
	export interface LoadModelConfig {
	  seed?: number,
	  n_ctx?: number,
	  n_batch?: number,
	  n_threads?: number,
	  embeddings?: boolean,
	  offload_kqv?: boolean,
	  n_seq_max?: number,
	  pooling_type?: 'LLAMA_POOLING_TYPE_UNSPECIFIED'
	    | 'LLAMA_POOLING_TYPE_NONE'
	    | 'LLAMA_POOLING_TYPE_MEAN'
	    | 'LLAMA_POOLING_TYPE_CLS',
	  // context extending
	  rope_scaling_type?: 'LLAMA_ROPE_SCALING_TYPE_UNSPECIFIED'
	    | 'LLAMA_ROPE_SCALING_TYPE_NONE'
	    | 'LLAMA_ROPE_SCALING_TYPE_LINEAR'
	    | 'LLAMA_ROPE_SCALING_TYPE_YARN',
	  rope_freq_base?: number,
	  rope_freq_scale?: number,
	  yarn_ext_factor?: number,
	  yarn_attn_factor?: number,
	  yarn_beta_fast?: number,
	  yarn_beta_slow?: number,
	  yarn_orig_ctx?: number,
	  // TODO: add group attention
	  // optimizations
	  cache_type_k?: 'f16' | 'q8_0' | 'q4_0',
	  cache_type_v?: 'f16',
	  // download-specific params
	  n_download_parallel?: number,
		
		*/
	
	
	
		
		
		
		
		
		let model_settings = generate_model_settings(task);
		
		// DEBUG
		//model_settings = { temp: 0 };
		
		// LOADING FROM URL
		//window.llama_cpp_model_being_loaded = assistant_id;
		//console.log("do_llama_cpp: calling loadModelFromUrl with:  model_url,model_settings: ", model_url, model_settings);
		//console.warn("do_llama_cpp: window.llama_cpp_app: ", window.llama_cpp_app);
		//console.warn("do_llama_cpp: window.currently_loaded_llama_cpp_assistant: ", window.currently_loaded_llama_cpp_assistant);
		
		/*
		if(
			typeof window.settings.assistants[assistant_id] != 'undefined' 
			&& typeof window.settings.assistants[assistant_id]['llama_cpp_general_name'] == 'string' 
		){
			console.warn("really_do_llama_cpp: window.settings.assistants[assistant_id]['llama_cpp_general_name']: ", window.settings.assistants[assistant_id]['llama_cpp_general_name']);
		}
		
		if(
			typeof window.llama_cpp_app.metadata != 'undefined' 
			&& typeof window.llama_cpp_app.metadata.meta != 'undefined' 
			&& typeof window.llama_cpp_app.metadata.meta['general.name'] == 'string'
		){
			console.warn("really_do_llama_cpp: window.llama_cpp_app.metadata.meta['general.name']: ", window.llama_cpp_app.metadata.meta['general.name']);
		}
		*/
		
		if(
			typeof assistant_id == 'string'
			&& typeof window.settings.assistants[assistant_id] != 'undefined' 
			&& typeof window.settings.assistants[assistant_id]['llama_cpp_general_name'] == 'string' 
			&& window.llama_cpp_app != null
			&& typeof window.llama_cpp_app.metadata != 'undefined' 
			&& typeof window.llama_cpp_app.metadata.meta != 'undefined' 
			&& typeof window.llama_cpp_app.metadata.meta['general.name'] == 'string'
		){
			if(window.llama_cpp_app.metadata.meta['general.name'] == window.settings.assistants[assistant_id]['llama_cpp_general_name']){
				console.warn("really_do_llama_cpp: it seems this model is already loaded: ", assistant_id, ", a.k.a. ", window.settings.assistants[assistant_id]['llama_cpp_general_name']);
				console.warn("really_do_llama_cpp: window.currently_loaded_llama_cpp_assistant: ", window.currently_loaded_llama_cpp_assistant);
				
			}
			else{
				console.warn(" calling unload_llama_cpp.. again? Because general.name was not the same");
				if(typeof window.llama_cpp_app.loadModelFromUrl != 'undefined'){
					console.warn("really_do_llama_cpp: loadModelFromUrl was not undefined. first calling unload_llama_cpp.. again");
					await unload_llama_cpp();
					if(window.settings.settings_complexity == 'developer'){
						console.warn("dev: really_load_llama_cpp: calling llama_cpp_app.loadModelFromUrl.  model_url, model_settings: ", model_url, model_settings);
					}
					
				}
				else{
					console.error("really_load_llama_cpp: window.llama_cpp_app.loadModelFromUrl was undefined?", window.llama_cpp_app);
					//console.log("window.llama_cpp_busy: ", window.llama_cpp_busy);
				}
			}
		}
		
			
			
		try{
			if(window.llama_cpp_app == null){
				console.error("really_do_llama_cpp: window.llama_cpp_app was still NULL?!");
				create_wllama_object();
			}
			
			await window.llama_cpp_app.loadModelFromUrl(model_url, model_settings);
			
		}
		catch(err){
			console.error("wllama: really_load_llama_cpp: caught loadModelFromUrl error: ", err);
			//window.flash_message(window.get_translation('An_error_occured'),2000,'fail');
			
			window.display_error(null, '' + err);
			
			if(task != null && typeof task.index == 'number'){
				await window.handle_completed_task(task,null,{'state':'failed'});
			}
			
			window.llama_cpp_busy = false;
			window.interrupt_wllama = false;
			window.doing_llama_cpp_refresh = false;
			window.llama_cpp_model_being_loaded = null;
			window.llama_cpp_model_being_downloaded = null;
			window.currently_loaded_llama_cpp_assistant = null;
			window.currently_loaded_llama_cpp_assistant_general_name = null;
			
			return false
		}
			
		
		
		
		
		
		
		window.currently_loaded_llama_cpp_assistant = assistant_id;
		//console.log("really_load_llama_cpp: window.currently_loaded_llama_cpp_assistant is now: ", window.currently_loaded_llama_cpp_assistant)
		
		if(typeof window.llama_cpp_app.metadata != 'undefined' && typeof window.llama_cpp_app.metadata.meta != 'undefined' && typeof window.llama_cpp_app.metadata.meta['general.name'] == 'string'){
			window.currently_loaded_llama_cpp_assistant_general_name = window.llama_cpp_app.metadata.meta['general.name'];
			if(typeof window.settings.assistants[assistant_id] == 'undefined'){
				window.settings.assistants[assistant_id] = {};
			}
			if(window.settings.settings_complexity == 'developer'){
				console.warn("dev: wllama: really_load_llama_cpp: setting general.name: ", assistant_id, " -> ", window.llama_cpp_app.metadata.meta['general.name']);
			}
			window.settings.assistants[assistant_id]['llama_cpp_general_name'] = window.llama_cpp_app.metadata.meta['general.name'];
		}
		//window.llama_cpp_model_being_loaded = null;
		window.currently_loaded_assistant = assistant_id;
		//console.log("window.currently_loaded_llama_cpp_assistant is now: ", window.currently_loaded_llama_cpp_assistant);
		
		window.settings.last_loaded_text_ai = assistant_id;
		window.save_settings();
		
		
		
		// Update the list of cached files
		await update_cached_files_list();
		
		window.set_model_loaded(true);
		window.generate_ui();
		
		await onModelLoaded(task,true); // first_load = true
		
		//window.llama_cpp_model_being_loaded = null;
		window.last_loaded_model_url = model_url; // TODO is this still used for anything?
		//window.assistants_loaded_count++;
		
		window.llama_cpp_busy = false;
		window.generate_ui();
	
		
	}
	catch(err){
		console.error("really_load_llama_cpp: caught general error: ", err);
		console.error("really_load_llama_cpp: caught general error: my_task: ", my_task);
		
		/*
		if(window.busy_loading_assistant != null && window.busy_loading_assistant == window.llama_cpp_model_being_loaded){
			//window.llama_cpp_model_being_loaded = null;
			window.busy_loading_assistant = null;
		}
		*/
		
		window.busy_loading_assistant = null;
		
		// iPhone Safari: Error: Out of bounds memory access (evaluating '(_wllama_start=Module["_wllama_start"]=wasmExports["w"])()')
		// Safari: TypeError: FetchEvent.respondWith received an error: TypeError: 
		
		//(args[0].indexOf('error loading model vocabulary') != -1 || args[0].indexOf('unknown model architecture') != -1)
		window.display_error(null, err);
		
		console.error("really_load_llama_cpp: it seems the Wllama AI model crashed");
		window.remove_body_class('waiting-for-response');
		window.remove_body_class('working-on-doc');
		window.remove_body_class('doing-assistant');
		
		if(my_task != null){
			console.error("really_do_llama_cpp: caught error -> calling window.stop_assistant with my_task"); // this will then call stop_llama_cpp back here
			window.stop_assistant(my_task);
		}
		
		if(window.state == DOING_ASSISTANT){
			window.set_state(LISTENING);
		}
		message_downloads_container_el.innerHTML = '';
		window.currently_loaded_llama_cpp_assistant = null;
		
		//window.llama_cpp_model_being_loaded = null;
		//flash_message(window.get_translation("The_AI_has_crashed"),2000,'fail');
		//setTimeout(() => {
			//restart_llama_cpp();
			//},2000);
		
		if(my_task != null){
			await window.handle_completed_task(my_task,false,{'state':'failed'});
			window.clean_up_dead_task(my_task);
			my_task = null;
		}
		else if(window.current_task != null){
			console.error("really_load_llama_cpp: Wllama crashed. my_task is null, but window.current_task exists: ", window.current_task);
		}
		else{
			console.error("really_load_llama_cpp: Wllama crashed, and my_task and window.current_task were both null");
		}
		
		window.llama_cpp_busy = false;
		
		return false
	}
	
	if(window.settings.settings_complexity == 'developer'){
		console.warn("dev: reached end of really_load_llama_cpp\n\n\n\n\n");
	}
	
	//window.llama_cpp_busy = false;
	
	return true
}



function display_error(task=null,err=''){
	
	if(task == null && my_task != null){
		//console.log("display_error: grabbing my_task: ", my_task);
		task = my_task;
	}
	
	if( (''+ err).indexOf('error loading model vocabulary') != -1 ||  (''+ err).indexOf('unknown model architecture') != -1 ){
		console.error("wllama: it seems the error was that the model is unsupported");
		window.flash_message(window.get_translation("An_error_occured"),2000,'fail');
	}
	else if((''+ err).indexOf('unknown model architecture') != -1 || (''+ err).indexOf('unknown architecture') != -1){
		console.error("detected error: architecture not supported");
		setTimeout(() => {
			window.flash_message(window.get_translation("This_AI_is_currently_unsupported"),3000,'fail');
		},1000);
	}
	else if((''+ err).indexOf('must be non-empty') != -1){
		console.error("Check the URL of the gguf file, it seems invalid");
		setTimeout(() => {
			window.flash_message(window.get_translation("AI_download_failed"),3000,'fail');
		},1000);
	}
	
	
	
	else if( (''+ err).indexOf('ailed to fetch') != -1 || (''+ err).indexOf('network error') != -1 ){
		console.error("failed to fetch -> network error (likely while downloading a model)");
		window.flash_message(window.get_translation("A_network_connection_error_occured"),2000,'fail');
		if(task != null && typeof task.assistant == 'string'){
			window.add_chat_message_once(task.assistant,'developer',get_translation('A_network_connection_error_occured'));
		}
	}
	else if( (''+ err).indexOf('Error while loading model') != -1 ||  (''+ err).indexOf('Load failed') != -1 ){
		console.error("wllama: it seems the error was an instance of an event object. Likely a progress event, meaning the model failed to load (no internet?)");
		window.flash_message(window.get_translation("An_error_occured"),2000,'fail');
	}
	else if( (''+ err).indexOf('Out of bounds') != -1 || (''+ err).toLowerCase().indexOf('memory') != -1 || (''+ err).toLowerCase().indexOf('allocate') != -1){ // Android Chrome: Cannot allocate WebAssembly.Memory
		console.error("Crash seems related to memory access");
		window.flash_message(window.get_translation("Not_enough_memory"),2000,'fail');
		if(task != null && typeof task.assistant == 'string'){
			window.add_chat_message(task.assistant,'developer',window.get_translation('Not_enough_memory') + ' 🙁', 'Not_enough_memory');
		}
	}
	
	else if(err instanceof Event){
		console.error("llama_cpp error was instance of Event");
	}
	else{
		//add_chat_message(window.currently_loaded_llama_cpp_assistant,'developer','it_seems_the_AI_has_crashed#setting---');
		if(task != null && typeof task.assistant == 'string'){
			window.add_chat_message(task.assistant,'developer','it_seems_the_AI_has_crashed#setting---');
		}
	}
}
window.display_error = display_error;




async function interrupt_llama_cpp(){
	if(window.settings.settings_complexity == 'developer'){
		console.log("in interrupt_llama_cpp. window.llama_cpp_app: ", window.llama_cpp_app);
	}
	if(window.llama_cpp_busy){
		if(window.llama_cpp_app){ //  && my_task != null
			console.error("interrupt_llama_cpp: window.llama_cpp_app exists. setting window.interrupt_wllama to true");
			//window.llama_cpp_app['interrupt'] = true;
			window.interrupt_wllama = true;
			if(my_task != null){
				await window.handle_completed_task(my_task, response_so_far, {'state':'interrupted'});
			}
			//window.skip_a_beat = true; 
			window.task_started = 10; // delays the next interval cycle, giving the runner some time to do it's thing, and for garbage collection.
			window.llama_cpp_model_loaded = false; // TODO experiment
		}
		else{
			console.error("interrupt_llama_cpp: no window.llama_cpp_app, or my_task was null.  my_task,window.llama_cpp_app: ", my_task, window.llama_cpp_app);
		}
	}
	else{
		console.warn("interrupt wllama: window.llama_cpp_busy was false, so nothing to interrupt? (assumption)");
	}
	
	//window.llama_cpp_busy = false;
	//window.llama_cpp_busy_downloading = false;
}
window.interrupt_llama_cpp = interrupt_llama_cpp;



async function stop_llama_cpp(planned=false){
	if(window.settings.settings_complexity == 'developer'){
		console.warn("dev: in stop_llama_cpp.  planned,response_so_far: ", planned, response_so_far);
	}
	//console.log("app: ", window.llama_cpp_app);
	
	if(typeof window.llama_cpp_app != 'undefined' && window.llama_cpp_app != null){

		//console.log("calling Wllama exit.  typeof window.llama_cpp_app.exit: ", typeof window.llama_cpp_app.exit);
		try{
			//console.log("stop_llama_cpp: calling unload_llama_cpp first");
			await unload_llama_cpp();
		}
		catch(err){
			console.error("caught error trying to unloadModel Wllama: ", err);
		}
		
		
		
		
		
		
		/*
		try{
			
			if(typeof window.llama_cpp_app.kvClear != 'undefined'){
				await window.llama_cpp_app.kvClear();
				console.warn("WLLAMA KV cache should be cleared now");
			}else{
				console.error("window.llama_cpp_app was not null, but had no KvClear function?  window.llama_cpp_app: ", window.llama_cpp_app);
			}
			
		}
		catch(err){
			console.error("caught error trying to KvClear Wllama: ", err);
		}
		*/
		
		/*
		try{
			
			if(typeof window.llama_cpp_app.exit != 'undefined'){
				await window.llama_cpp_app.exit();
				console.warn("WLLAMA exit call complete");
			}else{
				console.error("window.llama_cpp_app was not null, but had no exit function?  window.llama_cpp_app: ", window.llama_cpp_app);
			}
			
		}
		catch(err){
			console.error("caught error trying to exit Wllama: ", err);
		}
		*/
			
		
		/*
		if(window.llama_cpp_app != null && typeof window.llama_cpp_app.exit === 'function'){
			//console.log("calling Wllama exit");
			try{
				await window.llama_cpp_app.exit();
			}
			catch(err){
				console.error("caught error trying to stop Wllama: ", err);
			}
			
		}
		else{
			console.warn(" window.llama.cpp was null, or window.llama_cpp_app.exit was undefined.  window.llama_cpp_app: ", window.llama_cpp_app);
		}
		*/
		
		
		
		//window.llama_cpp_app.worker.terminate();
		//my_task['state'] = 'interrupted';
		if(window.llama_cpp_busy){
			
			//window.set_chat_status('');
			window.remove_body_class('doing-assistant');
			window.remove_body_class('working-on-doc');
			
			if(my_task != null){
				console.error("stop_llama_cpp: window.llama_cpp_busy was true, and task was not null, so this was likely an unexpected interruption. Calling handle_completed_task and asking for the task's state to be set to interrupted.");
				//window.handle_completed_task(my_task, response_so_far);
				window.set_chat_status(my_task,'');
				await window.handle_completed_task(my_task, response_so_far, {'state':'interrupted'});
				window.remove_body_class('model-loaded');
				
			}
			
			window.llama_cpp_busy = false;
		}
		window.interrupt_wllama = false;
		window.doing_llama_cpp_refresh = false;
		//window.llama_cpp_busy = false;
	}
	
	//window.sentences_parsed = [];
	if(window.busy_loading_assistant != null && window.busy_loading_assistant == window.llama_cpp_model_being_loaded){
		//window.llama_cpp_model_being_loaded = null;
		window.busy_loading_assistant = null;
	}
	
	//window.llama_cpp_model_being_loaded = null;
	
	response_so_far = "";
	window.llama_cpp_busy = false;
	/*
	if(window.busy_loading_assistant != null && window.busy_loading_assistant == window.llama_cpp_model_being_loaded){
		//window.llama_cpp_model_being_loaded = null;
		window.busy_loading_assistant = null;
	}
	*/
	
}
window.stop_llama_cpp = stop_llama_cpp;


// UNLOAD LLAMA_CPP

async function unload_llama_cpp(){
	if(window.settings.settings_complexity == 'developer'){
		console.warn("dev: in unload_llama_cpp");
	}
	if(window.llama_cpp_app != null && typeof window.llama_cpp_app.isModelLoaded != 'undefined'){
		let a_model_is_loaded = await window.llama_cpp_app.isModelLoaded();
		if(window.settings.settings_complexity == 'developer'){
			console.warn("dev: WLLAMA: unload_llama_cpp: a_model_is_loaded?: ", a_model_is_loaded, window.llama_cpp_app);
		}
		
		if(a_model_is_loaded){
			console.log("unload_llama_cpp: a model seems to be loaded, attempting unload");
			
			if(typeof window.currently_loaded_llama_cpp_assistant == 'string' && window.currently_loaded_assistant == window.currently_loaded_llama_cpp_assistant){
				window.currently_loaded_assistant = null;
			}
			
			
			try{
				if(a_model_is_loaded && typeof window.llama_cpp_app.kvClear != 'undefined'){
					await window.llama_cpp_app.kvClear();
					console.warn("stop_llama_cpp: WLLAMA KV cache should be cleared now");
				}else{
					console.error("stop_llama_cpp: window.llama_cpp_app was not null, but had no KvClear function?  window.llama_cpp_app: ", window.llama_cpp_app);
				}
			}
			catch(err){
				console.error("unload_llama_cpp: caught error trying to KvClear Wllama: ", err);
			}
			
			
			try{
				if(typeof window.llama_cpp_app.unloadModel === 'function'){
					await window.llama_cpp_app.unloadModel();
					console.log("\n\nWLLAMA\nUNLOAD MODEL SUCCESS\n\n");
				}
				else{
					//console.error("window.llama_cpp_app has no unloadModel function");
				}
			}
			catch(err){
				console.error("unload_llama_cpp: caught error attempting unloadModel: ", err);
			}
		}
		if(window.llama_cpp_app != null && typeof window.llama_cpp_app.proxy != 'undefined' && window.llama_cpp_app.proxy != null && typeof window.llama_cpp_app.proxy.worker != 'undefined'){
			console.warn("wllama.proxy still existed, attempting to terminate it manually");
			window.llama_cpp_app.proxy.worker.terminate();
			window.llama_cpp_app.proxy.worker = null;
			//await delay(10);
			
			
		}
		/*
		if(a_model_is_loaded && typeof window.llama_cpp_app.unloadModel != 'undefined'){
			//console.log("wllama: unloading loaded model first.  window.llama_cpp_app: ", window.llama_cpp_app);
			await window.llama_cpp_app.unloadModel();
		}
		else if(a_model_is_loaded && typeof window.llama_cpp_app.exit != 'undefined'){
			console.error("wllama: unloading loaded model first by calling exit instead of unloadModel.  window.llama_cpp_app: ", window.llama_cpp_app);
			await window.llama_cpp_app.exit();
			//console.log("wllama exited.  window.llama_cpp_app is now: ", window.llama_cpp_app);
		}
		else if(a_model_is_loaded){
			console.error("WLLAMA HAS A MODEL LOADED, BUT NO WAY TO UNLOAD IT?  window.llama_cpp_app: ", window.llama_cpp_app);
			return false;
		}
		*/
		
		window.llama_cpp_app = null;
		create_wllama_object(); // TODO: potential memory leak if the old model isn't unloaded properly first
		
	}
	else if(window.llama_cpp_app != null){
		console.error("unload_llama_cpp: llama_cpp_add has no isModelLoaded: ", window.llama_cpp_app);
	}
	else{
		console.error("unload_llama_cpp: window.llama_cpp_app is already null");
	}

	window.currently_loaded_llama_cpp_assistant = null;
	window.llama_cpp_model_being_loaded = null;
	window.llama_cpp_model_being_downloaded = null;
	window.currently_loaded_llama_cpp_assistant = null;
	window.currently_loaded_llama_cpp_assistant_general_name = null;
}

window.unload_llama_cpp = unload_llama_cpp;





async function restart_llama_cpp(planned=false){
	console.error("in restart_llama_cpp. restart is on purpose? (blocked): ", planned);
	return false
	if(typeof window.currently_loaded_llama_cpp_assistant == 'string' && window.llama_cpp_model_being_loaded == null){
		const current_assistant = '' + window.currently_loaded_llama_cpp_assistant;
		try{
			await stop_llama_cpp(planned);
		}
		catch(err){
			console.error("restart_llama_cpp: caught error calling stop_llama_cpp: ", err);
		}
		
		//setTimeout(() => {
			//console.log("restart_llama_cpp: calling do_llama_cpp to load: ", current_assistant);
			//do_llama_cpp({'assistant':current_assistant})
		//},2000)
		
	}
	else if(typeof window.llama_cpp_model_being_loaded == 'string'){
		message_downloads_container_el.innerHTML = '';
		
		const current_assistant = '' + window.llama_cpp_model_being_loaded;
		try{
			await stop_llama_cpp(planned);
		}
		catch(err){
			console.error("restart_llama_cpp: caught error calling stop_llama_cpp: ", err);
		}
		/*
		setTimeout(() => {
			//console.log("restart_llama_cpp: calling do_llama_cpp to load: ", current_assistant);
			do_llama_cpp({'assistant':current_assistant})
		},5000)
		*/
	}
	else{
		console.error("restart_llama_cpp fell through. window.currently_loaded_llama_cpp_assistant: ", window.currently_loaded_llama_cpp_assistant);
	}
	
}
window.restart_llama_cpp = restart_llama_cpp;




function create_wllama_object(assistant_id=null){
	//console.log("in create_wllama_object. assistant_id: ", assistant_id);
    window.llama_cpp_app = new Wllama(CONFIG_PATHS, {
		allow_offline:true,
		logger: {
			debug: (...args) => {
				//console.log("🔧 args: ", typeof args, args);
				if(window.settings.settings_complexity == 'developer'){
					console.debug('🔧', ...args);
				}
				
				
				if(typeof assistant_id == 'string' && assistant_id.length > 1){
					if(typeof window.settings.assistants[assistant_id] == 'undefined'){
						window.settings.assistants[assistant_id] = {};
					}
					if(assistant_id.startsWith('custom') && Array.isArray(args)){
				
						// typeof window.settings.assistants[assistant_id].size != 'number'
					
						//console.log("args.length: ", args.length);
						const line = args.join(' ');
						if(line.indexOf('model size') != -1 && line.indexOf('=') != -1 ){
							console.error("🔧 FOUND MODEL SIZE line: ", line);
							let size = line.split(' = ')[1];
							size = size.split(' ')[0];
							if(size.length){
								size = parseFloat( size );
								if(line.indexOf('MiB') != -1){
									size = Math.round(size/100)/10;
								}
								else if(line.indexOf('GiB') != -1){
									size = Math.round(size*10)/10;
								}
							
								console.error("wllama: FOUND MODEL SIZE: ", size);
								if(typeof window.settings.assistants[assistant_id].size == 'undefined' || (typeof window.settings.assistants[assistant_id].size == 'number' && window.settings.assistants[assistant_id].size != size)){
									//console.log("custom model size changed: ", size);
									window.settings.assistants[assistant_id].size = size;
									save_settings();
								}
							
							}
						
						}
					}
				}
				
			},
			log: (...args) => {
				//console.log("ℹ️ args: ", typeof args, args);
				console.log('ℹ️ WLLAMA: ', ...args);
			},
			warn: (...args) => console.warn('⚠️', ...args),
			error: (...args) => {
				console.error('☠️ WLLAMA: ', ...args);
				//console.log("Llama.cpp: Error args: ", args);
				if( typeof args[0] == 'string'){
					console.error("wllama caught error: ", args[0]);
					
					//window.display_error(null, '' + args[0]);
					
					
				}
				else{
					//flash_message(window.get_translation("Loading_the_AI_failed"),3000,'fail');
				}
				
			},
		},
	});
}
window.create_wllama_object = create_wllama_object;

//console.log("llama_cpp.js: creating initial wllama object");
create_wllama_object();



async function update_cached_files_list(){
	//console.log("in update_cached_files_list, updating Wllama caches in list");
	try{
		if(window.llama_cpp_app != null){
			//console.log("check_if_cached: window.llama_cpp_app: ", window.llama_cpp_app);
			if(typeof window.llama_cpp_app.cacheManager != 'undefined'){
				const wllama_cached_list = await window.llama_cpp_app.cacheManager.list();
				
				if(wllama_cached_list){
					//console.log("update_cached_files_list: wllama_cached_list: ", wllama_cached_list);
					let total_wllama_size = 0;
					for(let w = 0; w < wllama_cached_list.length; w++){
						if(typeof wllama_cached_list[w].name == 'string' && wllama_cached_list[w].name.length > 41){
							
							if(typeof wllama_cached_list[w].size == 'number'){
								total_wllama_size += wllama_cached_list[w].size;
							}
							const wllama_cached_url = wllama_cached_list[w].name.substr(41);
							
							if( typeof wllama_cached_url == 'string' && wllama_cached_url.indexOf('-of-00') != -1){
								//console.log("wllama_cached_url: ", wllama_cached_url);
								/*
								download_url = download_url.split('-00001-of-0')[0];
								if(download_url.indexOf('/') != -1 && !download_url.endsWith('/')){
									download_url = download_url.substr( (download_url.lastIndexOf('/')) + 1 );
								}
								*/
								let chunk_test_url = wllama_cached_url.replace('.gguf','');
								chunk_test_url = chunk_test_url.substr(chunk_test_url.length - 15);
								//console.log("chunk_test_url: ", chunk_test_url);
								let param_count = chunk_test_url.split('-of-0')[1];
								
								if(chunk_test_url.indexOf(param_count) != chunk_test_url.lastIndexOf(param_count)){
									if(window.cached_urls.indexOf(wllama_cached_url) == -1){
										//console.log("update_cached_files_list: adding last chunk wllama_cached_url to window.cached_urls: ", wllama_cached_url);
										window.cached_urls.push(wllama_cached_url);
										window.cached_urls2[wllama_cached_url] = 'wllama';
									}
								}
							}
							else if(window.cached_urls.indexOf(wllama_cached_url) == -1){
								//console.log("update_cached_files_list: adding wllama_cached_url to window.cached_urls: ", wllama_cached_url);
								window.cached_urls.push(wllama_cached_url);
								window.cached_urls2[wllama_cached_url] = 'wllama';
							}
							
						}
						else{
							console.error("update_cached_files_list: unexpected entry in wllama cache: ", wllama_cached_list[w]);
						}
					}
					//console.log("update_cached_files_list: total_wllama_size:", total_wllama_size + 'B ', (Math.round(total_wllama_size / 10000000) / 100) + 'GB');
				}
				else{
					console.error("update_cached_files_list: invalid wllama_cached_list: ", typeof wllama_cached_list);
				}
			}
			else{
				console.error("update_cached_files_list: cacheManager was undefined");
			}
		}
		else{
			console.error("update_cached_files_list: window.llama_cpp_app was null");
		}
	}
	catch(err){
		console.error("update_cached_files_list: caught error trying to get Wllama cached list: ", err);
	}
}
window.update_cached_files_list = update_cached_files_list;

update_cached_files_list();




import { Template } from './jinja/index.js';

// See https://github.com/ngxson/wllama/issues/120



function check_if_text_fits_in_context(text,context_size){
	//console.log("in check_if_text_fits_in_context.");
	if(typeof text != 'string' || typeof context_size != 'number'){
		return false
	}
	// https://llmtokencounter.com seems to just divide by four
	if(text.length / 4 < context_size){
		return true
	}
	return false
	
}
window.check_if_text_fits_in_context = check_if_text_fits_in_context;





const apply_chat_template = async (task, messages) => {
	//console.log("in apply_chat_template. messages: ", messages);
	
	if(typeof task == 'undefined' || task == null){
		console.error("apply_chat_template: invalid task provided");
		return null;
	}
	if(typeof messages == 'undefined' || messages == null || !Array.isArray(messages)){
		console.error("apply_chat_template: invalid messages provided");
		return null;
	}
	
	if(window.llama_cpp_app == null || typeof Template == 'undefined'){
		console.error("format_chat: window.llama_cpp_app was null");
		return null;
	}
	
	/*
	let assistant_id = null;
	if(typeof task.assistant == 'string'){
		assistant_id = task.assistant;
		//console.log("apply_chat_template:  got assistant_id from task: ", assistant_id);
	}
	
	if(typeof assistant_id != 'string'){
		console.error("apply_chat_template: missing assistant_id in task: ", task);
		return null
	}
	*/
	
	
	const defaultChatTemplate = "{% for message in messages %}{{'<|im_start|>' + message['role'] + '\n' + message['content'] + '<|im_end|>' + '\n'}}{% endfor %}{% if add_generation_prompt %}{{ '<|im_start|>assistant\n' }}{% endif %}";

	try{
		
		const template = new Template(
			window.llama_cpp_app.getChatTemplate() ?? defaultChatTemplate,
		);
		
		/*
		// old
		let rendered = template.render({
	    	messages,
	    	bos_token: await window.llama_cpp_app.detokenize([window.llama_cpp_app.getBOS()]),
	    	eos_token: await window.llama_cpp_app.detokenize([window.llama_cpp_app.getEOS()]),
	    	add_generation_prompt: true,
		});
		*/
		
		
		
		
		
		//console.log("jinja: template: ", template);
		
		const pre_bos_token = window.llama_cpp_app.getBOS();
		const pre_eos_token = window.llama_cpp_app.getEOS();
		//console.log("jinja: pre_bos_token: ", pre_bos_token);
		//console.log("jinja: pre_eos_token: ", pre_eos_token);
		
		let bos_token = await window.llama_cpp_app.detokenize([window.llama_cpp_app.getBOS()])
		let eos_token = await window.llama_cpp_app.detokenize([window.llama_cpp_app.getEOS()])
		bos_token = new TextDecoder().decode(bos_token);
		eos_token = new TextDecoder().decode(eos_token);
		//console.log("jinja: bos_token: ", bos_token);
		//console.log("jinja: eos_token: ", eos_token);
		let rendered = template.render({
	    	messages,
	    	bos_token: bos_token,
			eos_token: eos_token,
	    	add_generation_prompt: true,
		});
		//console.log("jinja: rendered: ", rendered);
		
		return rendered.replaceAll('[object Map]','');
		
	}
	catch(err){
		console.error(" apply_chat_template: caught error in apply_chat_template: ", err, messages);
		if((''+err).indexOf('Failed to fetch') != -1){
			flash_message(get_translation('A_model_needs_to_be_downloaded_but_there_is_no_internet_connection'),4000,'warn');
		}
		if(messages.length && typeof messages[messages.length-1].content == 'string' && messages[messages.length-1].content.length > 1){
			return messages[messages.length-1].content;
		}
	
	}


	console.error("apply_chat_template: task fell through. Setting task as failed");

	window.handle_completed_task(task,false,{'state':'failed'});
	//window.clean_up_dead_task(task);

	return null
	
}
window.apply_chat_template = apply_chat_template;




//console.log("hi from llama_cpp.js");
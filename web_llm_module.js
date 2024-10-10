import * as webllm from './webllm/web_llm_lib.js';

window.webllm = webllm;
//console.log("window.webllm: ", window.webllm);
//console.log("webllm: CreateWebWorkerMLCEngine: ", CreateWebWorkerMLCEngine);


// TODO: interesting unused abilities:

// built-in method to check if the model is cached
//let modelCached = await webllm.hasModelInCache(selectedModel, appConfig);

//await webllm.deleteModelAllInfoInCache(selectedModel, appConfig);



let my_task = null;
let previous_response_so_far = '';

let previous_percentage = 1;
let previous_time = 0;

let imager_percentage = 0;
let previous_imager_percentage = 0;
let previous_imager_time = 0;
//const prompt_el = document.getElementById('prompt');

window.web_llm_app_config = webllm.prebuiltAppConfig;
window.web_llm_app_config.useIndexedDBCache = false;
//console.log("WebLLM window.web_llm_app_config: ", window.web_llm_app_config);


if(typeof window.web_llm_app_config['model_list'] != 'undefined' &&  Array.isArray(window.web_llm_app_config['model_list'])){
	
	
	const modelLibURLPrefix = "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/";
	const modelVersion = "v0_2_39";
	
	//https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_39/Phi-3-mini-4k-instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm
	
	// Phi3-mini-instruct
	/*
    window.web_llm_app_config['model_list'].push({
      model: "https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f16_1-MLC",
      model_id: "Phi-3-mini-4k-instruct-q4f16_1",
      model_lib:
        modelLibURLPrefix +
        modelVersion +
        "/Phi-3-mini-4k-instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm",
      vram_required_MB: 3672.07,
      low_resource_required: false,
	  "required_features": [
		  "shader-f16"
	  ]
    });
    window.web_llm_app_config['model_list'].push({
      model: "https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f32_1-MLC",
      model_id: "Phi-3-mini-4k-instruct-q4f32_1",
      model_lib:
        modelLibURLPrefix +
        modelVersion +
        "/Phi-3-mini-4k-instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm",
      vram_required_MB: 5483.12,
      low_resource_required: false,
    });
    window.web_llm_app_config['model_list'].push({
      model: "https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f16_1-MLC",
      model_id: "Phi-3-mini-4k-instruct-q4f16_1-MLC-1k",
      model_lib:
        modelLibURLPrefix +
        modelVersion +
        "/Phi-3-mini-4k-instruct-q4f16_1-ctx1k_cs1k-webgpu.wasm",
      vram_required_MB: 2520.07,
      low_resource_required: true,
	  "required_features": [
		  "shader-f16"
	  ]
    });
    window.web_llm_app_config['model_list'].push({
      model: "https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f32_1-MLC",
      model_id: "Phi-3-mini-4k-instruct-q4f32_1-MLC-1k",
      model_lib:
        modelLibURLPrefix +
        modelVersion +
        "/Phi-3-mini-4k-instruct-q4f32_1-ctx1k_cs1k-webgpu.wasm",
      vram_required_MB: 3179.12,
      low_resource_required: true,
    });
	
	//window.web_llm_app_config['sliding_window_size'] = -1;
	*/
}


//window.web_llm_prompt = 'What is the capital of Spain?'; // This was part of the hack where that chat UI would load its prompt from this global variable
window.web_llm_model_being_loaded = null;






// DO WEB_LLM 
window.load_web_llm = async function (task){ 
	//console.log("in load_web_llm. task: ", task);
	//my_task = task;
	
	let assistant_id = null;
	if(typeof task == 'object' && task != null && typeof task.assistant == 'string'){
		assistant_id = task.assistant;
	}
	else if(typeof window.settings.assistant == 'string'){
		assistant_id = window.settings.assistant;
		console.error("load_web_llm. no task provided, fell back to window.settings.assistant: ", window.settings.assistant);
	}
	else{
		console.error("window.load_web_llm: no provided task, and window.settings.assistant is null. Don't know which assistant to load. Aborting.");
		return false
	}
	
	//console.log("load_web_llm: assistant_id: ", assistant_id );
	
	try{
		previous_percentage = 1;
		previous_time = Date.now() / 1000;
		/*
		if(window.busy_loading_assistant){
			if(window.web_llm_model_being_loaded != null){
				console.error("load_web_llm: busy_loading_assistant was true - a model is already being loaded. window.web_llm_model_being_loaded: ", window.web_llm_model_being_loaded);
				window.flash_message(window.get_translation("A_model_is_already_being_loaded"),3000,'error');
				return
			}
			else{
				//console.log("could in theory allow this AI to load. bad idea.."); // in theory a WebLLM and LlamaCPP model would both be running at the same time
			}
			return
		}
		else 
		*/
		if(typeof window.web_llm_model_being_loaded == 'string'){
			window.busy_loading_assistant = window.web_llm_model_being_loaded;
			console.error("load_web_llm: a model is already being loaded. window.web_llm_model_being_loaded: ", window.web_llm_model_being_loaded);
			window.flash_message(window.get_translation("A_model_is_already_being_loaded"),3000,'error');
			return
		}
	
		//if(window.my_webllm){
		if(webllm){
			//console.log("load_web_llm: webllm: ", webllm);
			
			
			/*
			if(typeof assistant_id != 'string'){
				console.error("load web_llm: assistant_id was not a string");
				return false
			}
			else{
				//console.log("load_web_llm: loading.  assistant_id: ", assistant_id);
			}
			*/
			
			let web_llm_model_id = null;
			
			if((typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['web_llm_file_name'] == 'string')){
				web_llm_model_id = window.settings.assistants[assistant_id]['web_llm_file_name'];
			}
			else if((typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id]['web_llm_file_name'] == 'string')){
				web_llm_model_id = window.assistants[assistant_id]['web_llm_file_name'];
			}
			
			if(typeof web_llm_model_id != 'string'){
				console.error("load web_llm: web_llm_model_id was not a string");
				return false
			}
		
			window.web_llm_model_being_loaded = assistant_id;
			window.busy_loading_assistant = assistant_id;
			window.currently_loaded_web_llm_assistant = null;
			// = window.assistants[assistant_id]['web_llm_file_name'];
			//window.chatUI.selectedModel = window.assistants[assistant_id]['web_llm_file_name'];
			//window.chatUI.load_model(window.assistants[assistant_id]['web_llm_file_name']);
			
			window.add_chat_message(assistant_id,assistant_id,"download_progress#setting---");
			
			if(window.web_llm_worker != null){
				// TODO: stop the old WebLLM first
				console.error("window.load_web_llm:  window.web_llm_worker was not null. Should be unloaded first.");
			}
			
			
			let chatOpts = {};
			
			let repetition_penalty = null;
			if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['repetition_penalty'] == 'number'){
				repetition_penalty = window.settings.assistants[assistant_id]['repetition_penalty'];
			}
			else if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id]['repetition_penalty'] == 'number'){
				repetition_penalty = window.assistants[assistant_id]['repetition_penalty'];
			}
			if(typeof repetition_penalty == 'number'){
				chatOpts['repetition_penalty'] = repetition_penalty; // e.g. 1.01
			}
			
			let context = 1024;
			chatOpts['context_window_size'] = 1024;
			
			if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['context'] == 'number'){
				context = window.settings.assistants[assistant_id]['context'];
			}
			else if(typeof window.assistants[assistant_id]['context'] == 'number'){
				context = window.assistants[assistant_id]['context'];
			}
			
			if(typeof context == 'number' && context > 1024){
				
				if(window.is_mobile){
					//window.web_llm_app_config['context_window_size'] = 1024;
				
					// 1024 is the default for mobile, unless there is tons of ram
					if(window.ram > 6000 && context > 2048){
						chatOpts['context_window_size'] = 2048;
					}
				
				}
				else{
					chatOpts['context_window_size'] = context;
				}
				
			}
			
			/*
				overrides: {
					context_window_size: 1024,
				},
			
			*/
					
					
			/*
export interface ChatConfig {
  // First three fields affect the entire conversation, i.e. used in `ChatModule.reload()`
  tokenizer_files: Array<string>;
  conv_config?: Partial<ConvTemplateConfig>;
  conv_template: string | ConvTemplateConfig;
  // KVCache settings
  context_window_size: number;
  sliding_window_size: number;
  attention_sink_size: number;
  // Fields below can be swapped per-generation via `GenerationConfig`
  // Fields only used in MLC
  repetition_penalty: number;
  tokenizer_info?: TokenizerInfo;
  token_table_postproc_method?: string; // TODO: backward compatibility, remove soon
  // Fields shared by MLC and OpenAI APIs
  frequency_penalty: number;
  presence_penalty: number;
  top_p: number;
  temperature: number;
  bos_token_id?: number;
}
						
						
			*/
			//console.log("creating web_llm_worker");
			window.web_llm_worker = new Worker(
				new URL('./web_llm_worker.js', import.meta.url), { type: 'module' }
			)
			
			// Creating the WebLLM engine
			window.web_llm_engine = await webllm.CreateWebWorkerMLCEngine(
				window.web_llm_worker,
		    	web_llm_model_id,
		    	{ 
					initProgressCallback: function (mes) { 
						//console.log('WebLLM init progress message received: ', mes); 
						window.handle_web_llm_init_progress(mes); 
					}, 
					appConfig: window.web_llm_app_config,
					//logLevel: "DEBUG"
				},
				chatOpts
			);
			
			//console.log("load_web_llm: DONE, window.web_llm_engine is now: ", window.web_llm_engine);
			window.handle_web_llm_init_complete();
			window.currently_loaded_web_llm_assistant = assistant_id;
		 	
			
			//await window.my_webllm.unloadModel();
			//await window.my_webllm.loadModel(web_llm_model_id);
			//window.currently_loaded_web_llm_assistant = assistant_id;
			//window.assistants_loading_count++;
			return true
		
		}
		else{
			console.error("webllm doesn't exist?", typeof webllm);
		}
	}
	catch(e){
		console.error("load_web_llm: caught error: ", e);
		if( ('' + e).indexOf('buffer allocation failed') != -1){
			console.error("WebLLM did not have enough memory available? task: ", task);
			window.add_chat_message(assistant_id,assistant_id,window.get_translation('Not_enough_memory') + ' 🙁', 'Not_enough_memory');
		}
		await window.handle_completed_task(task,false,{'state':'failed'});
		
		window.flash_message(window.get_translation("Loading_the_AI_failed"),3000,'error');
		message_downloads_container_el.innerHTML = '';
		window.web_llm_model_being_loaded = null;
		window.web_llm_busy = false;
		if(window.currently_loaded_assistant == window.currently_loaded_web_llm_assistant){
			window.currently_loaded_assistant = null;
		}
		window.currently_loaded_web_llm_assistant = null;
		window.busy_loading_assistant = null;
		
		if(window.web_llm_worker != null){
			window.web_llm_worker.terminate();
			window.web_llm_worker = null;
		}
		
		window.clean_up_dead_task(task);
		//my_task = null;
	
	}
	
	return false
}


window.do_web_llm = (task) => { 
	//console.log("in do_web_llm. task: ", task);

	if(typeof task == 'undefined' || task == null){
		console.error("do_web_llm: provided task was invalid. Aborting.");
		return false
	}
	if(typeof task.assistant != 'string'){
		console.error("do_web_llm. task.assistant was not a string: ", task);
		return false
	}
	if(window.web_llm_busy){
		console.error("do_web_llm. window.web_llm_busy was already true.  task: ", task);
		return false
	}
	if(typeof window.web_llm_model_being_loaded == 'string'){
		console.error("do_web_llm.  a model is already being loaded: ", window.web_llm_model_being_loaded);
		return false
	}
	
	window.web_llm_busy = true;
	if(typeof task.state == 'string'){
		task.state.replace('should','doing');
	}
	window.really_do_web_llm(task);
	return true
}



window.really_do_web_llm = async (task) => { 
	//console.log("in really_do_web_llm.  window.currently_loaded_web_llm_assistant, task: ", window.currently_loaded_web_llm_assistant, task);
	
	
	try{
		// Start the WebLLM engine first if it hasn't been started already
		if(typeof window.currently_loaded_web_llm_assistant != 'string' && window.web_llm_model_being_loaded == null){
			console.error("do_web_llm: WebLLM AI wasn't loaded yet, and is not busy loading either. calling window.load_web_llm with task: ", task);
			await window.load_web_llm(task);
		}
	
		// Switch to a different WebLLM AI if the task requires it
		else if(typeof window.currently_loaded_web_llm_assistant == 'string' && window.web_llm_model_being_loaded == null){
			//console.log("do_web_llm: a WebLLM AI is currently already loaded. window.currently_loaded_web_llm_assistant ", window.currently_loaded_web_llm_assistant);
			if(typeof task.assistant == 'string'){
				if(task.assistant != window.currently_loaded_web_llm_assistant){
					//console.log("do_web_llm: calling load_web_llm first, to load a different WebLLM assistant: ", window.currently_loaded_web_llm_assistant, " => ", task.assistant);
					
					let model_id = null;
					if(typeof window.settings.assistants[task.assistant] != 'undefined' && typeof  window.settings.assistants[task.assistant].model_id != 'undefined'){
						model_id = window.settings.assistants[task.assistant].model_id;
					}
					else if(typeof window.assistants[task.assistant] != 'undefined' && typeof window.assistants[task.assistant].model_id != 'undefined'){
						model_id = window.assistants[task.assistant].model_id;
					}
					console.warn("really_do_web_llm: switching to different model: ", model_id);
					if(typeof model_id == 'string'){
						
						if(window.web_llm_engine){
							//console.log("do_web_llm: calling engine.reload with model_id: ", model_id);
							//await window.web_llm_engine.reload(selectedModel, undefined, window.web_llm_app_config);
							await window.web_llm_engine.reload(model_id); // , undefined, window.web_llm_app_config
							window.handle_web_llm_init_complete();
							//console.log("Reload model end");
						}
						else{
							//console.log("do_web_llm: no engine? calling load_web_llm with task: : ", task);
							await window.load_web_llm(task);
						}
					}
				
					//console.log("do_web_llm: load_web_llm has finished loading a different AI model");
				}
				else{
					//console.log("do_web_llm: OK, the currently loaded WebLLM model is the desired one: ", window.currently_loaded_web_llm_assistant);
				}
			
			}
			else{
				console.error("task has no assistant property. aborting");
				return false
			}
		
		}
		else if(window.web_llm_model_being_loaded != null){
			console.error("do_web_llm: UNEXPECTEDLY, window.web_llm_model_being_loaded is not null: ", window.web_llm_model_being_loaded);
			return false
		}
		else{
			console.error("web_llm UNEXPECTED");
			//console.log(" -- window.web_llm_model_being_loaded: ", window.web_llm_model_being_loaded);
			//console.log(" -- window.currently_loaded_web_llm_assistant: ", window.currently_loaded_web_llm_assistant);
		}
		
		
		if(window.currently_loaded_web_llm_assistant == null){
			//console.log("attempting to set window.currently_loaded_web_llm_assistant by calling get_loaded_web_llm_model");
			window.currently_loaded_web_llm_assistant = get_loaded_web_llm_model();
		}
		
		if(window.currently_loaded_web_llm_assistant == null){
			console.error("do_web_llm: typeof window.currently_loaded_web_llm_assistant was still null");
			if(my_task != null){
				console.error("do_web_llm: ABORTING, setting my_task to failed");
				await window.handle_completed_task(my_task,false,{'state':'failed'});
				window.clean_up_dead_task(my_task);
				//my_task = null;
				//window.flash_message(window.get_translation('Could_not_start_task'),3000,'fail');
			}
			return false
		}
		//console.log("do_web_llm:  window.web_llm_model_being_loaded: ", window.web_llm_model_being_loaded);
		//console.log("do_web_llm:  window.currently_loaded_web_llm_assistant: ", window.currently_loaded_web_llm_assistant);
	
		
	
		my_task = task;
		previous_response_so_far = '';
		
		if(window.web_llm_engine != null){
			//console.log("window.web_llm_engine exists: \n", window.web_llm_engine);
			
		
			if(typeof task.prompt == 'string' && task.prompt.length > 1){
				//console.log("do_web_llm: passing prompt to model: ", task.prompt);
				//window.web_llm_prompt = task.prompt;
				if(task.type != 'chat'){
					//console.log('resetting web_llm before summarize task');
				}
			
			
				// TEMPERATURE
				let temperature = 0.7;
				// Get custom temperature from task if it is set
				if(typeof my_task.temperature == 'number'){
					temperature = my_task.temperature;
				}
				// Get custom temperature if it is set
				else if(typeof task.assistant == 'string' && typeof window.settings.assistants[task.assistant] != 'undefined' && typeof window.settings.assistants[task.assistant].temperature == 'number'){
					temperature = window.settings.assistants[task.assistant].temperature;
				}
				// Fall back to temperature in assistants dict if it exists
				else if(typeof task.assistant == 'string' && typeof window.assistants[task.assistant] != 'undefined' && typeof window.assistants[task.assistant].temperature == 'number'){
					temperature = window.assistants[task.assistant].temperature;
				}
			
				let messages = window.get_conversation_history(my_task);
			
			
				// cut getting previous_messages from here
			
				let request = {
				    stream: true,
				    messages: messages,
				    temperature: temperature,
				    //max_gen_len: 256,
					//n: 1,
				};
			
				if(window.settings.settings_complexity == 'developer'){
					//console.log("developer mode active, so telling WebLLM to log problems during inference");
					request['logprobs'] = true;
					request['top_logprobs'] = 2;
				}
			
			
				// ensure complete predictability at temperature 0
				if(request.temperature == 0){
					request['seed'] = 42;
				}
				
			
			
				//console.log("web_llm: calling doChat with: ", request);
			
				if(window.web_llm_engine){
					window.web_llm_busy = true;
					window.currently_running_llm = task.assistant;
					const async_chunk_generator = await window.web_llm_engine.chat.completions.create(request);
					//console.log("Web LLM async_chunk_generator: ", async_chunk_generator);
				
					for await (const chunk of async_chunk_generator) {
					    //console.log("fresh web_llm chunk object: ", chunk);
						//reply += chunk.choices[0]?.delta.content || "";
					
					    if (typeof chunk.choices[0] != 'undefined' && typeof chunk.choices[0].delta != 'undefined' && typeof chunk.choices[0].delta.content == 'string' && typeof chunk.choices[0].delta.content != '') {
					      // Last chunk has undefined content
							//console.log("new chunk: ", chunk.choices[0].delta.content);
							window.handle_chunk(my_task,previous_response_so_far,chunk.choices[0].delta.content);
							previous_response_so_far += chunk.choices[0].delta.content;
					    }
					
						//window.handle_web_llm_chunk(chunk,previous_response_so_far,chunk.choices[0].delta.content);
					    //setLabel("generate-label", message);
					    // engine.interruptGenerate();  // works with interrupt as well
					}
					const final_message = await window.web_llm_engine.getMessage();  // the concatenated message
					
					if(typeof task.assistant == 'string'){
						window.settings.last_loaded_text_ai = task.assistant;
						window.save_settings();
					}
					
					
					//console.log("WebLLM: final previous_response_so_far:\n", '' + previous_response_so_far);
					//console.log("WebLLM: final message:\n", '' + final_message);
					//window.handle_completed_task(my_task,final_message);
					await window.handle_completed_task(my_task,previous_response_so_far);
					//if(window.settings.settings_complexity == 'developer'){console.log("Web LLM stats: ", await window.web_llm_engine.runtimeStatsText())}
				
					//my_task = null;
					previous_response_so_far = '';
					window.web_llm_busy = false;
					return true
				}
				else{
					console.error("window.do_web_llm: somehow still no WebLLM engine?")
					return false
				}
				//await window.my_webllm.doChat(request);
			
			}
			else if(window.currently_loaded_web_llm_assistant == null && typeof task.assistant == 'string'){
				//console.log("do_web_lmm: no valid prompt, but there is no currently loaded web_llm assistant yet either. This must be a preload request. Loading web_llm assistant: ", task.assistant);
				window.load_web_llm(task);
				return true
			}
			else{
				console.error("do_web_llm: task.prompt was invalid / too short: ", task.prompt);
				await window.handle_completed_task(task,false,{'state':'failed'});
				window.clean_up_dead_task(task,'failed');
				//my_task = null;
				return false
			}
		
		}
		else{
			console.error("web_llm doesn't seem to have actually loaded; window.web_llm_engine does not exist");
			await window.handle_completed_task(my_task,previous_response_so_far,null,{"state":"failed"});
			//my_task = null;
			return false
		}
	}
	catch(err){
		console.error("do_web_llm: caught error: ", err);
		if( ('' + err).indexOf('ContextWindowSizeExceededError') != -1){
			window.flash_message(window.get_translation('The_command_was_too_long'),3000,'fail');
		}
		await window.handle_completed_task(task,previous_response_so_far,null,{"state":"failed"});
		window.clean_up_dead_task(task,'failed');
		//my_task = null;
		return false
	}

}

function get_loaded_web_llm_model(){
	let found_assistant_id = null;
	
	if(typeof window.web_llm_engine != 'undefined' && window.web_llm_engine != null && typeof window.web_llm_engine.model == 'string' && window.web_llm_engine.model.length){
		for (const [assistant_id, details] of Object.entries(window.settings.assistants)) {
			if(typeof details.model_id == 'string' &&  details.model_id == window.web_llm_engine.model){
				found_assistant_id = assistant_id;
				//console.log("get_loaded_web_llm_model: found a match in window.settings.assistants: ", assistant_id, details);
				break
			}
		}
		if(found_assistant_id == null){
			for (const [assistant_id, details] of Object.entries(window.assistants)) {
				if(typeof details.model_id == 'string' && details.model_id == window.web_llm_engine.model){
					found_assistant_id = assistant_id;
					//console.log("get_loaded_web_llm_model: found a match in window.assistants: ", assistant_id, details);
					break
				}
			}
		}
		
	}
	if(found_assistant_id == null){
		console.warn("get_loaded_web_llm_model: WebLLM does not seem to have a loaded model.  window.web_llm_engine: ", window.web_llm_engine);
	}
	return found_assistant_id;
}
window.get_loaded_web_llm_model = get_loaded_web_llm_model;


window.interrupt_web_llm = async function (){ 
	//console.log("in interrupt_web_llm. my_task:", JSON.stringify(my_task),null,2);
	//set_model_loaded(true);
	if(window.web_llm_engine){
		//console.log("interrupt_web_llm:  calling interrupt");
		if(window.web_llm_busy){
			if(my_task != null){
				await window.handle_completed_task(my_task,previous_response_so_far,{'state':'interrupted'});
				//my_task = null;
			}
			previous_response_so_far = '';
			window.web_llm_engine.interruptGenerate();
		}
		//console.log("interrupt_web_llm. web_llm doesn't seem to be busy? Aborting doing interrupt");
		
	}
}


window.stop_web_llm = async function (){ 
	//console.log("in stop_web_llm");
	//set_model_loaded(true);
	/*
	if(window.my_webllm){
		//console.log("stop_web_llm:  calling interrupt");
		if(my_task != null){
			window.handle_completed_task(my_task,previous_response_so_far,{'state':'interrupted'});
			my_task = null;
		}
		previous_response_so_far = '';
		window.my_webllm.interrupt();
	}
	*/
	await window.interrupt_web_llm();
	await window.unload_web_llm();
	/*
	if(window.web_llm_engine){
		window.web_llm_engine.interruptGenerate();
	}
	if(my_task != null){
		await window.handle_completed_task(my_task,previous_response_so_far,{'state':'interrupted'});
		//my_task = null;
		previous_response_so_far = '';
	}
	*/
	return true;
}


//window.web_llm_logger = async function (message){
window.web_llm_logger = function (message){ 
	//console.log("in window.web_llm_logger. message: ", message);
}

window.web_llm_load_complete = async function (){ 
	//console.log("web_llm_load_complete: LOAD COMPLETE");
	set_model_loaded(true);
}


window.web_llm_progression = async function (data){ 
	//console.log("in web_llm_progression: data: ", data);
}

window.web_llm_done = async function (result){ 
	//console.log("in web_llm_done. result:\n\n", result);
	await window.handle_completed_task(my_task,result);
	//window.add_chat_message('current','current',result);
	//window.set_chat_status('');
}

window.web_llm_unloaded = async function (){
	//console.log("web_llm is now unloaded");
	
}


// HANDLE WEB_LLM CHUNK
window.handle_web_llm_chunk = async function (chunk_object,response_so_far,chunk){ 
	if(typeof response_so_far == 'string' && typeof chunk == 'string'){ // && type != 'init'){
		//console.log("in window.handle_web_llm_chunk. type,text: ", type,text);
		const chunk_index = response_so_far.lastIndexOf(chunk);
		if(chunk_index != -1 && chunk_index > (response_so_far.length - 20)){
			//console.log("handle_web_llm_chunk: stripping chunk from end of response_so_far");
			response_so_far = response_so_far.substr(0,chunk_index);
		}
		previous_response_so_far = response_so_far;
		
		window.handle_chunk(my_task,response_so_far,chunk);
	}	
}

// HANDLE WEB_LLM INIT PROGRESS
window.handle_web_llm_init_progress = async function (message){ 
	//console.log("window.handle_web_llm_init_progress: progress message: ", message);
	//console.log("window.handle_web_llm_init_progress: web_llm_model_being_loaded: ", window.web_llm_model_being_loaded);
	try{
		if(window.web_llm_model_being_loaded != null){
			let web_llm_progress_el = document.getElementById('download-progress-' + window.web_llm_model_being_loaded);
			if(web_llm_progress_el == null){
				//console.log("window.handle_web_llm_init_progress: web_llm (down)load progress element is missing, adding it now: ", window.web_llm_model_being_loaded);
				window.add_chat_message(window.web_llm_model_being_loaded,window.web_llm_model_being_loaded,'download_progress#setting---');
			}
			else{
				//console.log("window.handle_web_llm_init_progress: updating web_llm (down)load progress: ",  message.progress);
				
				if(typeof message.progress == 'number'){
					let percentage = Math.floor(message.progress * 100);
					if(typeof message.text == 'string' && message.text.startsWith('Loading model from cache[') && message.text.indexOf(']') != -1){
						let cache_progress_part = message.text.replace('Loading model from cache[','');
						cache_progress_part = cache_progress_part.split(']')[0];
						if(cache_progress_part.indexOf('/') != -1){
							let cache_progress_parts = cache_progress_part.split('/');
							//console.log("cache_progress_parts: ", cache_progress_parts);
							web_llm_progress_el.value = parseInt(cache_progress_parts[0]) / parseInt(cache_progress_parts[1]);
							//percentage = Math.floor((parseInt(cache_progress_parts[0]) / parseInt(cache_progress_parts[1])) * 100);
							return
						}
					}
					else{
						web_llm_progress_el.value = message.progress;
					}
					
					if(message.progress == 1){
						//console.log("handle_web_llm_init_progress: load complete");
						web_llm_progress_el.closest('.download-progress-chat-message').classList.add('download-complete-chat-message'); // superfluous, also handled when 'Finish loading' is spotted in the log output
						setTimeout(() => {
							web_llm_progress_el.closest('.download-progress-chat-message').remove();
						},1000);
					}
					else{
						
						//console.log("window.handle_web_llm_init_progress: percentage: ", percentage);
			  		  	if(percentage > previous_percentage){
							//console.log("doing remaining download time estimation. percent: ", percentage);
			  			 	const now_time = Date.now() / 1000;
			  			    if(previous_time == 0){

			  				    previous_time = now_time;
			  				    //console.log("diffusion download: changed previous time to: ", previous_time);
			  			    }
			  			    else{
							
								if(typeof message.text == 'string' && message.text.startsWith('Fetching param cache[') && message.text.indexOf(']') != -1){
									let cache_time_part = message.text.split(' secs elapsed')[0];
									cache_time_part = parseInt(cache_time_part.substr(cache_time_part.lastIndexOf(' ')));
									const percent_to_go = 100 - percentage;
									const time_remaining = percent_to_go * (cache_time_part/percentage);
				  				    let time_remaining_el = web_llm_progress_el.parentNode.querySelector('.time-remaining'); // #download-progress-' + window.settings.assistant + ' + 
				  				    if(time_remaining_el != null){
				  					    time_remaining_el.innerHTML = window.create_time_remaining_html(time_remaining);
				  				    }
				  				    else{
				  				  	    console.error("diffusion: count not find time-remaining element");
				  				    }
								
								}
							
								
			  			  	}

			  			  	previous_percentage = percentage;
			  		  	}
			
					}
				}
				
				
			}
		}
		else{
			console.error("web_llm: received load progress message, but window.web_llm_model_being_loaded is not a string: ", window.web_llm_model_being_loaded);
		}
	}
	catch(e){
		console.error("window.handle_web_llm_init_progress: caught error");
	}
	
	
}


// HANDLE WEB_LLM INIT DONE
window.handle_web_llm_init_complete = async function (){ 
	//console.log("web_llm init done. window.web_llm_model_being_loaded was: " + window.web_llm_model_being_loaded);
	//console.log("WEB_LLM LOADING COMPLETE");
	
	//window.currently_loaded_assistant = window.chatUI.selectedModel;
	//window.currently_loaded_web_llm_assistant = window.chatUI.selectedModel;
	
	window.currently_loaded_assistant = window.web_llm_model_being_loaded;
	if(typeof window.web_llm_model_being_loaded == 'string'){
		window.currently_loaded_web_llm_assistant = window.web_llm_model_being_loaded;
	}
	else{
		console.error("handle_web_llm_init_complete: window.web_llm_model_being_loaded was not a string, it was: ", window.web_llm_model_being_loaded);
	}
	
	//window.web_llm_loaded_assistant = window.web_llm_model_being_loaded;
	window.web_llm_model_being_loaded = null;
	window.busy_loading_assistant = null;
	
	let web_llm_progress_el = document.getElementById('download-progress-' + window.settings.assistant);
	if(web_llm_progress_el){
		//web_llm_progress_el.removeAttribute('id');
		//console.log("removed ID from web_llm_download progress chat message");
		web_llm_progress_el.closest('.download-progress-chat-message').classList.add('download-complete-chat-message');
		setTimeout(() => {
			web_llm_progress_el.closest('.download-progress-chat-message').remove();
		},1000);
		
	}
	if(typeof window.currently_loaded_web_llm_assistant == 'string'){
		window.add_chat_message_once(window.currently_loaded_web_llm_assistant,'developer',get_translation('Ready_to_chat'),'Ready_to_chat');
		setTimeout(() => {
			window.add_chat_message_once(window.currently_loaded_web_llm_assistant,'developer','model_examples#setting---');
		},2000);
	
		window.set_model_loaded(true);
		//window.chatUI.load_model('Mistral-7B-Instruct-v0.2-q4f16_1');
	}
	
	window.handle_download_complete(false); // do not generate the models list, only update the total disk space used
}




/*
window.restart_web_llm = async function (){
	console.error("in restart_web_llm");
	if(window.my_webllm){
		//console.log("restart_web_llm: restarting web_llm");
		
		let assistant_id = window.currently_loaded_web_llm_assistant;
		if(typeof assistant_id != 'string'){
			if(typeof my_task != 'undefined' && my_task != null && typeof my_task.assistant == 'string'){
				assistant_id = my_task.assistant;
			}
		}
		
		//console.log("restart_web_llm: unloading old web_llm");
		await window.my_webllm.unloadModel();
		
		if(typeof assistant_id == 'string'){
			//console.log("restart_web_llm: loading fresh web_llm. assistant_id: ", assistant_id);
			window.load_web_llm({'assistant':assistant_id});
		}
		
	}
	else{
		console.error("reset_web_llm: no window.my_webllm");
	}
}



// No longer needed, since the conversation is now managed on this side. Clear window.conversations[assistant_id] instead
window.reset_web_llm = async function (){
	console.error("in reset_web_llm");
	if(window.chatUI){
		//console.log("reset_web_llm: calling window.chatUI.onReset()");
		window.chatUI.onReset();
	}
	else{
		console.error("reset_web_llm: no window.chatUI");
	}
}
*/


window.unload_web_llm = async function (){
	//console.log("in unload_web_llm");
	if(window.currently_loaded_assistant == window.currently_loaded_web_llm_assistant){
		window.currently_loaded_assistant = null;
	}
	if(window.currently_loaded_web_llm_assistant != null && window.web_llm_engine){
		window.web_llm_busy = true;
		await window.web_llm_engine.unload();
		window.web_llm_busy = false;
	}
	
	window.currently_loaded_web_llm_assistant = null;
	return true
}




























//
//   DIFFUSION WORKER
//

let my_imager_task = null;

window.create_diffusion_worker = async function (task){ // task is not used for anything
	//console.log("in create_diffusion_worker. task: ", task);
	
	imager_percentage = 0;
	previous_imager_percentage = 0;
	
	if(window.diffusion_worker == null){
		//console.log("diffusion worker was likely never loaded before. Showing tutorial messages.");
		window.add_chat_message('imager','developer','model_examples#setting---');
	}
	
	//console.log("create_diffusion_worker: adding some files to cache first");
	const diffusion_tvmjs_url = new URL('./diffusion/tvmjs.bundle.js', window.cache_base_url).href;
	//console.log("create_diffusion_worker: diffusion_tvmjs_url to cache: ", diffusion_tvmjs_url);

	const diffusion_tokenizers_wasm_url = new URL('./diffusion/tokenizers-wasm/tokenizers_wasm.js', window.cache_base_url).href;
	//console.log("create_diffusion_worker: diffusion_tokenizers_wasm_url: ", diffusion_tokenizers_wasm_url);
	
	const diffusion_worker_url = new URL('./diffusion_worker.js', window.cache_base_url).href;
	//console.log("create_diffusion_worker: diffusion_worker_url: ", diffusion_worker_url);

	await caches.open('diffusion').then((cache) => {
		cache.add(diffusion_tvmjs_url);
		cache.add(diffusion_tokenizers_wasm_url);
		cache.add(diffusion_worker_url);
	})
	
	window.diffusion_worker = null;
	window.diffusion_worker = new Worker('./diffusion_worker.js', {
	  type: 'module'
	});

	//console.log("diffusion_module: window.diffusion_worker: ", window.diffusion_worker);
	
	window.diffusion_worker.addEventListener('message', e => {
		//console.log("received message from diffusion_worker: ", e, e.data);
		
		if(typeof e.data.status == 'string'){
			
			
			if(e.data.status == 'interrupt' || e.data.status == 'stop'){
				
				// remove download message
				let diffusion_progress_el = document.getElementById('download-progress-imager');
				if(diffusion_progress_el){
					diffusion_progress_el.closest('.download-progress-chat-message').remove();
				}
				
				if(typeof e.data.task != 'undefined' && typeof e.data.task.index == 'number'){
					let task_output_el = document.querySelector("#chat-message-task-imager-imager" + e.data.task.index);
					let diffusion_progress_el = document.getElementById('diffusion-progress-imager');
					if(diffusion_progress_el){
						diffusion_progress_el.remove();
					}
					handle_completed_task(e.data.task,true,{'state':'interrupted'});
				}
				
				window.diffusion_worker_busy = false;
				document.body.classList.remove('doing-imager');
				
			}
			
			else if(e.data.status == 'init_progress' && typeof e.data.progress == 'number'){
				//console.log("diffusion init progress message: ", e.data.progress);
				
				let diffusion_progress_el = document.getElementById('download-progress-imager');
				if(diffusion_progress_el == null){
					console.error("diffusion (down)load progress element is missing, adding it now");
					window.add_chat_message('imager','imager','download_progress#setting---');
				}
				
				if(diffusion_progress_el){
					//console.log("updating diffusion (down)load progress");
					diffusion_progress_el.value = e.data.progress;
					
					if(e.data.progress == 1){
						//console.log("imager AI seems to be loaded");
						if(window.settings.assistant == 'imager'){
							document.body.classList.add('model-loaded');
						}
						
						diffusion_progress_el.closest('.download-progress-chat-message').classList.add('download-complete-chat-message');
						window.currently_loaded_assistant = 'imager';
						set_model_loaded(true);
						handle_download_complete(false); // do not show the models list, but do update the total disk space used
						
					}
					else{
						let imager_percentage = Math.floor(e.data.progress * 100);
						//console.log("diffusion (down)load  percentage: ", imager_percentage);
						
			  		  	if(imager_percentage > previous_imager_percentage){
							
							//console.log("doing remaining download time estimation. percent: ", imager_percentage);
			  			 	const now_time = Date.now();

			  			    if(imager_percentage > 2){
			  				    let delta = Date.now() - previous_imager_time;
			  				    previous_imager_time = now_time;
			  				    //console.log("it took this long to download the last percent: ", delta);
								let percent_remaining = (100 - imager_percentage);
			  			  	    let time_remaining = percent_remaining * (delta/1000);
			  				    let time_remaining_el = diffusion_progress_el.parentNode.querySelector('.time-remaining'); // #download-progress-' + window.settings.assistant + ' + 
			  				    if(time_remaining_el != null){
									time_remaining_el.innerHTML = window.create_time_remaining_html(time_remaining);
			  				    }
			  				    else{
			  				  	    console.error("count not find imager progress time-remaining element");
			  				    }
			  			  	}

			  			  	previous_imager_percentage = imager_percentage;
							previous_imager_time = Date.now();
			  		  	}
					}
				}
				
				
				
			}
			else if(e.data.status == 'progress' && typeof e.data.progress == 'number' && typeof e.data.task == 'object' && e.data.task != null && typeof e.data.task.index == 'number'){
				//console.log("diffusion progress: ", e.data.progress);
				
				let task_output_el = document.querySelector("#chat-message-task-imager-imager" + e.data.task.index);
				let diffusion_progress_el = document.getElementById('diffusion-progress-imager');
				if(diffusion_progress_el == null && e.data.progress < 1){
					console.error("diffusion generation progress element is missing, adding it now");
					//add_chat_message('imager','imager','download_progress#setting---');
					
					if(task_output_el){
						//console.log("found task output element in chat bubble. Appending progress indicator.");
						diffusion_progress_el = document.createElement('progress');
						diffusion_progress_el.setAttribute('id','diffusion-progress-imager');
						diffusion_progress_el.setAttribute('value',0);
						diffusion_progress_el.classList.add('progress');
						diffusion_progress_el.classList.add('diffusion-progress');
						task_output_el.appendChild(diffusion_progress_el);
					}
					else{
						console.error("do_diffusion: no task output element found");
					}
				}
				
				if(diffusion_progress_el){
					//console.log("updating diffusion generation progress");
					diffusion_progress_el.value = e.data.progress;
					
					if(e.data.progress == 1){
						//console.log("diffusion process (almost) complete. Image almost ready.");
					}
				}
				
				
				if(e.data.progress == 1){
					// second message with
					// Generating ... at stage vae, 52 secs elapsed.
					// Generating ... at stage vae, 57 secs elapsed.
					//console.log("diffusion progress is 1. diffusion apparently complete?");
					
				}
				
			}
			
			// Append generated image to task output element of chat bubble
			else if( (e.data.status == 'image' || e.data.status == 'preview_image' || e.data.status == 'final_image') && typeof e.data.blob != 'undefined' && typeof e.data.task == 'object' && e.data.task != null && typeof e.data.task.index == 'number'){
				//console.warn("\n\n\n\n\nIMAGE!\n\n\n\n");
				//console.log("diffusion blob: ", e.data.blob);
				
				if(e.data.status == 'final_image'){
					document.body.classList.remove('doing-imager');
					
					// Keep track of unread messages
					if(window.settings.assistant != 'imager'){
						if(typeof window.unread_messages['imager'] == 'number'){
							window.unread_messages['imager']++; // = window.unread_messages['text_to_image'] + 1;
						}
						else{
							window.unread_messages['imager'] = 1;
						}
					}
				}
				else{
					document.body.classList.add('doing-imager');
				}
				
				window.place_generated_image_in_bubble(e.data);
				
				if(e.data.status == 'final_image'){
					handle_completed_task(e.data.task,true);
					window.diffusion_worker_busy = false;
					
					if(window.settings.assistant != 'imager'){
						if(typeof window.unread_messages['imager'] == 'number'){
							window.unread_messages['imager']++; // = window.unread_messages['imager'] + 1;
						}
						else{
							window.unread_messages['imager'] = 1;
						}
					}
				}
				
			}
			
			// Process complete
			else if(e.data.status == 'complete'){
				console.warn("\n\n\n\n\nIMAGE COMPLETE\n\n\n\n");
			}
			
			else if(e.data.status == 'error'){
				console.error("Diffusion generated an error");
				if(typeof e.data.message == 'string'){
					if(e.data.message.indexOf('This browser env does not support WebGPU') != -1){
						window.flash_message(window.get_translation("Your_browser_does_not_support_running_this_model"),5000,'error');
					}
				}
			}
			
			else{
				console.error("message from diffusion worker fell through: ", e.data);
			}
			
		}
		
		/*
		if(typeof e.data.diffusion_counter == 'number' && typeof e.data.task == 'object' && e.data.task != null && typeof e.data.big_audio_array != 'undefined'){
		
			if(e.data.diffusion_counter == window.diffusion_counter){
				//console.log("(diffusion response counter and window.diffusion_counter matched)");
			}
			window.handle_completed_task(e.data.task, e.data.big_audio_array);
		}
		else{
			console.error("diffusion worker returned unexpected data: ", e.data);
		}
		*/
		
	});
	
	window.diffusion_worker.addEventListener('error', (error) => {
		console.error("ERROR: diffusion_module: diffusion_worker error (terminating!): ", error);
		window.diffusion_worker.terminate();
		
		setTimeout(() => {
			window.diffusion_worker_busy = false;
			//console.log("attempting to restart diffusion worker");
			create_diffusion_worker();
		},5000);
	});
	
}


window.do_diffusion = async function (task){ 
//function do_diffusion(task){ 
	//console.log("in do_diffusion. task: ", task);
	if(!is_task_valid(task)){
		console.error("do_diffusion: invalid task provided: ", task);
		return false
	}
	//console.log("do_diffusion. passing task to worker and setting diffusion_worker_busy to true");
	try{
		
		
		my_imager_task = task;
		
		
		if(window.llama_cpp_app != null && typeof window.llama_cpp_app.worker != 'undefined' && typeof window.llama_cpp_app.worker != null){
			console.error("do_diffusion: had to kill llama_cpp worker first");
			window.llama_cpp_app.worker.terminate();
		}
		
		
		//if(window.diffusion_worker == null){
		if(!window.diffusion_worker){
			//console.log("do_diffusion: creating diffusion_worker first");
			await window.create_diffusion_worker();
		}
	
		//window.diffusion_worker.postMessage({'task':{'prompt':'A crayon picture of a zeppelin flying in the sky','neg_prompt':'','scheduler_id':0,'vae_cycle':-1}});
		
		if(window.diffusion_worker){
			//console.log("do_diffusion: window.diffusion_worker exists, doing postMessage")
			window.diffusion_worker.postMessage({'task':task,'cache_name':window.cache_name});
			window.diffusion_worker_busy = true;
			return true
		}
		else{
			return false
		}
	}
	catch(err){
		console.error('caught error in do_diffusion: ', err);
		await window.handle_completed_task(my_imager_task,false,{'state':'failed'});
		my_imager_task = null;
		window.diffusion_worker_busy = false;
		return false
	}
	
}

window.do_imager = do_diffusion; // currently only one AI model that generates images is implemented




window.interrupt_imager = async function (){ 
	//console.log("in interrupt_imager");
	if(window.diffusion_worker){
		window.diffusion_worker.postMessage({'action':'interrupt'});
		/*
		if(my_imager_task != null){
			window.handle_completed_task(my_imager_task,false,{'state':'interrupted'});
			my_imager_task = null;
		}
		*/
		return true
	}
	else{
		if(my_imager_task != null){
			await window.handle_completed_task(my_imager_task,false,{'state':'interrupted'});
			my_imager_task = null;
		}
		return false
	}
	
}


window.stop_imager = async function (){ 
	//console.log("in stop_imager");
	if(window.diffusion_worker){
		window.diffusion_worker.postMessage({'action':'interrupt'});
		/*
		if(my_imager_task != null){
			window.handle_completed_task(my_imager_task,false,{'state':'interrupted'});
			my_imager_task = null;
		}
		*/
		return true
	}
	else{
		if(my_imager_task != null){
			await window.handle_completed_task(my_imager_task,false,{'state':'interrupted'});
			my_imager_task = null;
		}
		return false
	}
	
}

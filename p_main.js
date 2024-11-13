let model_tutorial_shown = false;
let document_tutorial_shown = false;
let voice_tutorial_shown = false;
let first_switch_done = false;
window.previous_note_time = '';
window.interval_paused = false;

let time_to_keep_irrelevant_task = 120 * 1000; // TODO: 2 minutes

/*
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
		//console.log("chatty_main: window is no longer (partially) visible");
    } else {
		//console.log("chatty_main: window has become (partially) visible");
    }
});
*/



//
//   SWITCH ASSISTANT
//


async function switch_assistant(assistant_id,called_from_automation=false,prefered_language=null){
	//console.log("in switch_assistant. assistant_id: ", assistant_id);
	
	if(typeof assistant_id != 'string'){
		console.warn('switch_assistant: no valid assistant_id string provided. calling window.pick_optimal_text_ai.  typeof assistant_id: ', typeof assistant_id);
		
		if(typeof window.settings.last_loaded_text_ai == 'string'){
			assistant_id = window.settings.last_loaded_text_ai;
		}
		else{
			assistant_id = pick_optimal_text_ai();
		}
		
	}
	
	remove_body_class('model-loaded');
		
	if(typeof assistant_id != 'string'){
		console.error("switch_assistant: provided assistant_id was not a string");
		return
	}	
	if(assistant_id == 'any writer'){
		assistant_id == 'any_writer';
	}
	if(assistant_id == 'any small writer'){
		assistant_id == 'any_small_writer';
	}
	
	if(assistant_id == 'speak'){
		assistant_id == 'speaker';
	}
		
	if(called_from_automation == false){
		if(!document.body.classList.contains('sidebar-shrink')){
			setTimeout(() => {
				add_body_class('sidebar-shrink');
			},100);
		}
	}
	
	
	
	if(window.camera_streaming && typeof window.settings.assistant == 'string' && window.settings.assistant.startsWith('image_to_') && !assistant_id.startsWith('image_to_')){
		//console.log("switch_assistant: stopping camera from image_to_ assistant");
		window.stop_camera();
	}
	
	
	if(assistant_id == 'any_coder'){
		assistant_id = pick_optimal_coder_ai();
		//console.log("switch_assistant: any_coder -> pick_optimal_coder_ai -> ", assistant_id);
	}
	
	
	if(assistant_id == 'any_small_writer'){
		
		if(typeof window.settings.last_loaded_text_ai == 'string' && typeof window.assistants[window.settings.last_loaded_text_ai].media != 'undefined' && window.assistants[window.settings.last_loaded_text_ai].media.indexOf('text') != -1 && typeof window.assistants[window.settings.last_loaded_text_ai].size == 'number' && window.assistants[window.settings.last_loaded_text_ai].size < 2){
			assistant_id = window.settings.last_loaded_text_ai;
		}
		else if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant].media != 'undefined' && window.settings.assistants[window.settings.assistant].media.indexOf('text') != -1 && typeof window.settings.assistants[window.settings.assistant].size == 'number' && window.settings.assistants[window.settings.assistant].size < 2){
			//assistant_id = window.settings.assistant;
			return
		}
		else if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant].media != 'undefined' && window.assistants[window.settings.assistant].media.indexOf('text') != -1 && typeof window.assistants[window.settings.assistant].size == 'number' && window.assistants[window.settings.assistant].size < 2){
			//assistant_id = window.settings.assistant;
			return
		}
		else{
			let maximum_ram_for_small_model = 4000;
			if(maximum_ram_for_small_model > window.ram){
				maximum_ram_for_small_model = window.ram;
			}
			assistant_id = pick_optimal_text_ai(prefered_language,maximum_ram_for_small_model);
		}
		
	}
	
	
	if(assistant_id == 'any_writer'){
		//console.log("switch_assistant: attempting to replace 'any_writer'. window.settings.last_loaded_text_ai: ", window.settings.last_loaded_text_ai);
		
		if(typeof window.settings.last_loaded_text_ai == 'string' && typeof window.settings.assistants[window.settings.last_loaded_text_ai].media != 'undefined' && window.settings.assistants[window.settings.last_loaded_text_ai].media.indexOf('text') != -1){
			assistant_id = window.settings.last_loaded_text_ai;
		}
		else if(typeof window.settings.last_loaded_text_ai == 'string' && typeof window.assistants[window.settings.last_loaded_text_ai].media != 'undefined' && window.assistants[window.settings.last_loaded_text_ai].media.indexOf('text') != -1){
			assistant_id = window.settings.last_loaded_text_ai;
		}
		else if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant].media != 'undefined' && window.assistants[window.settings.assistant].media.indexOf('text') != -1){
			assistant_id = window.settings.assistant;
		}
		else if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant].media != 'undefined' && window.settings.assistants[window.settings.assistant].media.indexOf('text') != -1){
			assistant_id = window.settings.assistant;
		}
		else{
			if(typeof window.settings.last_loaded_text_ai != 'string'){
				window.settings.last_loaded_text_ai = pick_optimal_text_ai();
			}
		
			if(typeof window.settings.last_loaded_text_ai == 'string'){
				//console.log("switch_assistant: changing 'any_writer' to: ", window.settings.last_loaded_text_ai);
				assistant_id = window.settings.last_loaded_text_ai;
				if(assistant_id == window.settings.assistant){
					//console.log("...which is already the current assistant");
					return
				}
			}
			else{
				console.error("window.settings.last_loaded_text_ai was not a string: ", window.settings.last_loaded_text_ai);
				return
			}
		}
	}
	if(assistant_id == 'any_writer'){ // sic, second one has a space
		assistant_id = pick_optimal_text_ai(prefered_language);
	}

	document.body.setAttribute('id','assistant-' + assistant_id);
	
	if(typeof window.intro_explanations_given[assistant_id] == 'undefined'){
		window.intro_explanations_given[assistant_id] = [];
	}
	
	
	if(window.innerWidth < 641 && document.body.classList.contains('show-document')){
		remove_body_class('show-document');
	}
	
	
	
	
	// change icon and info in the chat header
	let header_icon_src = 'images/developer_thumb.png';
	let image_filename = assistant_id;
	if(typeof window.assistants[assistant_id] != 'undefined'){
		if(typeof window.assistants[assistant_id]['icon'] == 'string' && window.assistants[assistant_id]['icon'].length){
			image_filename = window.assistants[assistant_id].icon;
		}
		if(image_filename.length){
			header_icon_src = 'images/' + image_filename.replace('fast_','').replace('_32bit','') + '_thumb.png';
		}
	}
	
	if(assistant_id.startsWith('custom_saved')){
		/*
		let custom_saved_icon_el = document.querySelector('img[data-assistant_id="' + assistant_id + '"]');
		if(custom_saved_icon_el){
			header_icon_src = custom_saved_icon_el.src;
		}
		*/
		add_body_class('custom-ai');
		chat_header_icon_el.src = 'images/developer_thumb.png';
	}
	else{
		remove_body_class('custom-ai');
		chat_header_icon_el.src = header_icon_src;
	}
	
	
	
	let assistant_name = '?'; 
	if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id]['custom_name'] == 'string'){
		let assistant_name = window.assistants[assistant_id]['custom_name']
	}
	//window.assistants[assistant_id]['name'];
	if(assistant_id.startsWith('custom_saved') && typeof window.settings.assistants[assistant_id] != 'undefined'){
		if(typeof window.settings.assistants[assistant_id]['custom_name'] == 'string'){
			assistant_name = window.settings.assistants[assistant_id]['custom_name'];
		}
		else{
			assistant_name = assistant_name.replace('custom_saved_','');
		}
		
	}
	else if(typeof window.translations[assistant_id + "_name"] != 'undefined'){
		assistant_name = get_translation(assistant_id + "_name");
	} 
		
	if(assistant_name != '?'){
		chat_header_name_el.textContent = assistant_name;
	}
	else{
		chat_header_name_el.textContent = '';
	}
	
	
	// Close model info if it was open
	model_info_container_el.innerHTML = '';
	
	
	if(typeof window.settings.assistants[assistant_id] == 'undefined'){
		//console.log("switch_assistant: this assistant was not in the activated assistants list yet. Setting selected to true");
		window.settings.assistants[assistant_id] = {'selected':true};
		save_settings();
	}
	if(typeof window.settings.assistants[assistant_id]['selected'] == 'undefined' || (typeof window.settings.assistants[assistant_id]['selected'] == 'boolean' && window.settings.assistants[assistant_id]['selected'] == false)){
		window.settings.assistants[assistant_id]['selected'] = true;
		save_settings();
	}
	
	let first_run = false;
	if(first_switch_done == false){
		first_run = true;
	}
	
	
	//console.log("switch_assistant: called_from_automation: ", called_from_automation);
	//console.log("switch_assistant: first_run: ", first_run);
	
	
	if(window.settings.assistant != assistant_id || first_switch_done == false){
		first_switch_done = true;
		//first_run = true;
		//console.log("switch_assistant: got new assistant_id: ", window.settings.assistant, " --> ", assistant_id);
		
		
		window.assistant_switches_made_count++;
		
		
		if(assistant_id == 'developer'){
			add_body_class('intro-ai');
			add_body_class('model-loaded');
		}
		else{
			remove_body_class('intro-ai');
			
			if(assistant_id == 'scribe' && called_from_automation == false){
				if(first_run == false && window.microphone_enabled == false){
					window.enable_microphone(); // add 'false' parameter to not also enable the speaker
				}
			}
			
			if(assistant_id == 'scribe' && window.whisper_worker != null){
				add_body_class('model-loaded');
			}
			else if(assistant_id.startsWith('ollama')){
				//console.log("switch_assistant: assistant_id starts with ollama, setting model-loaded state");
				if(window.ollama_online){
					add_body_class('model-loaded');
				}
				else{
					remove_body_class('model-loaded');
				}
			}
			else{
				remove_body_class('model-loaded');
			}
			
		} 
		
		
		
		if(window.settings.assistant != assistant_id){
			//console.log('switch_assistant: SWITCHING indeed. ', window.settings.assistant, " -> ", assistant_id);
			window.settings.assistant = assistant_id;
			save_settings();
		}
		window.update_interrupt_button_icon(); // {"assistant":'ignore'}
		
		
		
		
		
		// image_to_text: show suggestion to try an example
		if(assistant_id == 'image_to_text'){
			setTimeout(() => {
				add_chat_message_once(assistant_id,'developer','Try_an_image_description_example#setting---');
			},3000);
		}
		
		if(assistant_id == 'image_to_text_ocr'){
			setTimeout(() => {
				add_chat_message_once(assistant_id,'developer','Try_a_document_scanner_example#setting---');
			},1000);
		}
		
	}
	
	
	if(called_from_automation == false || first_run == true){
		
		if(assistant_id != 'scribe' && window.microphone_enabled && window.audio_player_busy == false && window.vad_paused){
			window.unpause_vad();
		}
		
		sidebar_filter_input_el.value = '';
	}
	
	if(assistant_id == 'scribe'){
		add_chat_message_once(window.settings.assistant,'developer','scribe_privacy#setting---');
	
		if(typeof window.settings.assistants['scribe'] != 'undefined' && typeof window.settings.assistants['scribe']['add_timestamps'] == 'string' && window.settings.assistants['scribe']['add_timestamps'] != 'None'){
			add_chat_message_once(window.settings.assistant,'developer','scribe_clock#setting---');
			if(window.microphone_enabled && window.audio_player_busy == false && window.vad_paused == false && window.last_time_scribe_started == null){
				//window.pause_vad();
			}
		
		}
	
	}
	
	if(assistant_id == 'developer'){
		if(intro_step == 0){
			intro_step = 1;
		}
	}
	
	if(assistant_id == 'speaker'){
		if(window.audio_module_loaded == false){
			window.audio_module_loaded = true;
			await window.add_script('p_audio_module.js');
		}
	}
	
	
	// Scribe: show suggestion to create empty document
	if(assistant_id == 'scribe' && window.last_time_scribe_started == null || (typeof window.last_time_scribe_started == 'number' && (Date.now() - window.last_time_scribe_started) > window.maximum_scribe_duration) ){
		add_chat_message_once(assistant_id,'developer','Would_you_like_to_create_a_new_document#setting---');
	}
	
	if(window.microphone_enabled && typeof window.last_time_scribe_started == 'number' && window.last_time_scribe_started > 1000000 && (Date.now() - window.last_time_scribe_started) < window.maximum_scribe_duration){
		if(assistant_id == 'scribe'){
			window.continuous_vad();
		}
		else{
			window.continuous_vad(false);
		}
	}
	
	setTimeout(() => {
		if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].second_prompt == 'string' && window.settings.assistants[assistant_id].second_prompt.length){
			add_chat_message_once(assistant_id,assistant_id,window.settings.assistants[assistant_id].second_prompt);
			if(typeof window.last_time_ai_responded[assistant_id] == 'undefined'){
				window.last_time_ai_responded[assistant_id] = Date.now();
			}
			
		}
	},1500);
	
	if(typeof window.conversations[assistant_id] != 'undefined'){
		if(Array.isArray(window.conversations[assistant_id]) && window.conversations[assistant_id].length){
			add_body_class('has-conversation');
		}
		else{
			remove_body_class('has-conversation');
		}
	}
	else{
		remove_body_class('has-conversation');
	}
	
	
	let cached = false;
	if(assistant_id == 'translator'){  // translator is many models, so checking cache might not be as simple
		detect_language(null,'#prompt')
		.then((value) => {
			//console.log("switch_assistant -> detect_language: resolved: ", value);
		})
		.catch((err) => {
			//console.error("switch_assistant -> detect_language: rejected: ", err);
		})
	}
	else{
		cached = check_if_cached(assistant_id);
	}
	
	
	if(assistant_id == 'text_to_image'){
		await add_script('./t2i_module.js');
	}
	
	
	
	
	// Add chat messages with explanation about how to actually load the AI
	const pane = document.getElementById('pane-content-' + assistant_id + '-chats');
	if(pane && assistant_id != 'developer' && assistant_id != 'image_to_text_ocr' && !assistant_id.startsWith('ollama') && assistant_id != 'translator' ){
		
		if(typeof window.assistants[assistant_id].pretend_cached == 'boolean' && window.assistants[assistant_id].pretend_cached){
			//console.log("switch_assistant: this model pretends to be cached, so not showing any message about cached state");
			//console.error("check_if_cached: provided assistant_id is not in window.assistants: ", assistant_id);
			//return false
		}
		else{
			
			let cache_info_delay = 1;
			if(first_run){
				cache_info_delay = 900;
			}
			setTimeout(() => {
				
				//if( (window.busy_loading_assistant != assistant_id && assistant_id != window.currently_loaded_assistant)){  //  || window.currently_loaded_assistant == null
					cached = check_if_cached(assistant_id);
					
					if(cached){
						add_chat_message_once(assistant_id,'developer',get_translation('This_AI_has_already_been_downloaded'),'This_AI_has_already_been_downloaded');
						if(window.currently_loaded_assistant != null || (window.currently_loaded_assistant == null && window.settings.assistant == 'scribe') ){
							//add_chat_message_once(assistant_id,'developer',get_translation('Select_the_input_field_below_to switch_to_this_AI','Select_the_input_field_below_to switch_to_this_AI'));
						}
						
					}
					else if(window.settings.assistant != 'translator'){
						if( (window.settings.assistant.startsWith('custom') && !window.settings.assistant.startsWith('custom_saved')) || window.settings.assistant.startsWith('clone')){
							if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant].runner == 'string' && window.settings.assistants[window.settings.assistant].runner == 'llama_cpp' && 
								(
									typeof window.settings.assistants[window.settings.assistant].download_url == 'undefined' || 
									(typeof window.settings.assistants[window.settings.assistant].download_url == 'string' && window.settings.assistants[window.settings.assistant].download_url.toLowerCase().indexOf('.gguf') == -1) 
								) 
							){
								//if(window.settings.assistant.startsWith('custom') && !window.settings.assistant.startsWith('custom_saved') && window.settings.assistant != 'custom_received'){
									add_chat_message_once(assistant_id,'developer','Please_provide_the_URL_of_an_AI_model#setting---');
								//}
							}
						}
						else{
							add_chat_message_once(assistant_id,'developer',get_translation('This_AI_has_not_been_downloaded_yet'),'This_AI_has_not_been_downloaded_yet');
				
							//add_chat_message_once(assistant_id,'developer',get_translation('This_AI_has_not_been_downloaded_yet'),'This_AI_has_not_been_downloaded_yet');
							if(window.currently_loaded_assistant != null || (window.currently_loaded_assistant == null && window.settings.assistant == 'scribe') ){
								//add_chat_message(assistant_id,'developer',get_translation('Select_the_input_field_below_to_start_downloading_this_AI'),'Select_the_input_field_below_to_start_downloading_this_AI');
							}
				
							if(typeof window.assistants[assistant_id].size == 'number'){
								add_chat_message_once(assistant_id,'developer',get_translation('The_download_may_take_a_while_as_the_file_size_is') + ' ' + window.assistants[assistant_id].size + ' ' + get_translation('gigabytes').toLowerCase());
							}
						}
				
					}
					else{
						//console.log("translator, so skipped explaining to the user if the model is cached or not");
				
						// TODO: what about giving the user an option to pre-cache all the language models? How much data would that even be? Could be an interface on the translator model details page, a checklist.
						//if(window.intro_explanations_given[assistant_id].indexOf('This_AI_has_not_been_downloaded_yet') == -1){
					}
				//}
				//else{
					//console.log("not showing switch assistant hint because a model is being downloaded");
				//}
				
			},cache_info_delay);
			
			
		}
		
		
	}

	
	// Tweaks for individual assistants
	
	
	if(called_from_automation == false){
		//console.log("switch_assistant: removing chat-shrink class");
		window.unshrink_chat();
		remove_body_class('show-rewrite');
		remove_body_class('document-active');
		window.active_destination = 'chat';
	}
	
	
	if(assistant_id == 'translator'){
		if(translation_details_el){
			//console.log("switch_assistant: switching to translator: setting translation_details_el to open"); // CSS will hide the rest
			live_translation_output_el.value = '';
			summarize_details_el.removeAttribute('open');
			rewrite_details_el.removeAttribute('open');
			translation_details_el.setAttribute('open',true);
			
		}
		else{
			console.error("switch_assistant: switching to translator. translation_details_el was missing");
		}
		
		setTimeout(() => {
			add_chat_message_once(assistant_id,'developer','Try_opening_the_camera#setting---');
		},4000);
		
	}
	
	if(assistant_id == 'phi3_rag'){
		show_rag_search();
		open_sidebar();
	}
	
	if(assistant_id.startsWith('ollama') && window.ollama_module_loaded == false){
		window.add_script('./ollama_module.js',true) // add it as a module
		.then(() => {
			//console.log("switch_assistant: ollama module is now loaded");
			window.ollama_module_loaded = true;
			window.settings.last_loaded_text_ai = assistant_id;
			save_settings();
		})
		.catch((err) => {
			console.error("switch_assistant: failed to load ollama module: ", err);
		})
	}
	
	// add scripts that will likely be needed
	
	if(assistant_id == 'translator' && is_script_added('translation') == false){
		//console.log("switch_assistant: adding translation_module.js");
		window.add_script('translation');
	}
	
	if(assistant_id == 'musicgen' && window.added_scripts.indexOf('./musicgen_module.js') == -1){
		window.musicgen_script_loaded = true;
		window.add_script('musicgen');
	}
	
	// Add command to blueprint file
	if(first_run == false && window.busy_doing_blueprint_task == false && window.blueprint_tasks_left == 0 && called_from_automation == false && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string'){
		const switch_command = '\n\nChange AI to ' + get_translation(assistant_id + '_name') + '\n\n';
		flash_message(get_translation("Added_command_to_blueprint"),1000);
		if(!window.doc_text.endsWith(switch_command)){
			insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, switch_command); // task, content, cursor
		}
		else{
			//console.log("blueprint already ended with a command to switch to this AI");
		}
	}
	
	if(assistant_id != 'image_to_text_ocr'){
		window.only_allow_voice_commands = false;
	}
	
	
	// Update the UI
	generate_ui();
	
	update_prompt_adjustments();
	
	// Markdown toggle
	if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].markdown_supported == 'boolean' && window.assistants[assistant_id].markdown_supported == true){
		add_body_class("markdown-supported");
		if(window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].markdown_enabled == 'boolean'){
			if(window.settings.assistants[assistant_id].markdown_enabled){
				add_body_class('markdown-enabled');
			}
			else{
				remove_body_class('markdown-enabled');
			}
		}
		else if(window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].markdown_enabled == 'boolean'){
			if(window.assistants[assistant_id].markdown_enabled){
				add_body_class('markdown-enabled');
			}
			else{
				remove_body_class('markdown-enabled');
			}
		}
		else{
			remove_body_class('markdown-enabled');
		}
	}
	
	else{
		remove_body_class("markdown-supported");
		remove_body_class('markdown-enabled');
	}
	
	
	// Brevity toggle
	//console.log("typeof window.assistants[assistant_id]['brevity_supported']: ", window.assistants[assistant_id]['brevity_supported']);
	if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id]['brevity_supported'] == 'boolean' &&  window.assistants[assistant_id]['brevity_supported'] == true){
		add_body_class("brevity-supported");
		//console.log("switch_assistant: brevity is supported");
		if(window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].brevity_enabled == 'boolean'){
			if(window.settings.assistants[assistant_id].brevity_enabled){
				add_body_class('brevity-enabled');
			}
			else{
				remove_body_class('brevity-enabled');
			}
		}
		else if(window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].brevity_enabled == 'boolean'){
			if(window.assistants[assistant_id].brevity_enabled){
				add_body_class('brevity-enabled');
			}
			else{
				remove_body_class('brevity-enabled');
			}
		}
		else{
			remove_body_class('brevity-enabled');
		}
	}
	/*
	else if(window.settings.settings_complexity == 'developer'){
		add_body_class("brevity-supported");
	}
	*/
	else{
		//console.log("switch_assistant: removing brevity-supported classname. assistant_id: ", assistant_id);
		remove_body_class("brevity-supported");
		remove_body_class('brevity-enabled');
	}
	
	
	
	
	// TODO: ?? how does this check for being mobile?
	// Found no refernce to this class in the styling
	remove_body_class('sidebar-overlay'); // Hide the sidebar overlay when in phone mode
	
	// Close sidebar on very small displays
	if(window.innerWidth < 641){
		if(typeof close_sidebar != 'undefined'){
			close_sidebar();
		}
	}

	let runner = 'llama_cpp';
	if(typeof typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].runner == 'string'){
		runner = window.settings.assistants[assistant_id].runner;
	}
	else if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].runner == 'string'){
		runner = window.assistants[assistant_id].runner;
	}
	
	//console.log("window.busy_loading_assistant: ", window.busy_loading_assistant);
	
	if(runner == 'web_llm' && window.currently_loaded_assistant == null && window.web_llm_script_loaded && window.currently_loaded_web_llm_assistant == null && typeof window.busy_loading_assistant != 'string'){
		//window.load_web_llm({'assistant':window.settings.assistant});
		
		if(model_tutorial_shown == false && window.settings.tutorial.model_tutorial_done == false){
			model_tutorial_shown = true;
			setTimeout(() => {
				//play_tutorial(assistant_tutorial_messages,assistant_id);
				add_chat_message('current','developer','model_tutorial#setting---');
			},7000);
		}
	}
	
	
	else if(window.currently_loaded_assistant == null && assistant_id != 'developer' && typeof window.busy_loading_assistant != 'string'){ //  && assistant_id != 'speaker' && assistant_id != 'imager'
		
		if(typeof window.settings.assistant == 'string'){
			//window.busy_loading_assistant = true;
			//console.log("switch_assistant: Loading the very first assistant immediately: ", window.settings.assistant);
			// Show download progress message
			//prompt_el.value = ''; // having an empty prompt prevents the model from immediately trying to use its value as a prompt
			if(!window.settings.assistant.startsWith('ollama')){
				//window.start_assistant({'assistant':window.settings.assistant});
			}
		}
		else{
			console.error("switch_assistant: window.settings.assistant was invalid/null, cannot do initial load of assistant");
		}
		
	}
	else{
		//console.log("switch_assistant: an assistant seems to be loaded, or in the process of loading. window.currently_loaded_assistant: ", window.currently_loaded_assistant);
		//console.log("switch_assistant: window.busy_loading_assistant: ", window.busy_loading_assistant);
	}
	
	
	manage_prompt();
	//console.log("reached end of switch_assistant, should be adding examples in 2 seconds");
	if(assistant_id != 'developer' ){ // && window.assistants[assistant_id] != 'undefined'
		setTimeout(() => {
			let chatter = false
			window.add_chat_message_once(assistant_id,'developer','model_examples#setting---');
		},1005);
		
		
		if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id]['model_type'] == 'string' && window.assistants[assistant_id]['model_type'] == 'base'){
			setTimeout(() => {
				window.add_chat_message_once(assistant_id,'developer',get_translation('This_model_can_only_continue_writing_text_it_cannot_answer_questions'),'This_model_can_only_continue_writing_text_it_cannot_answer_questions');
			},1000);
		}
	}

	// SECOND SENTENCE (a.k.a "welcome message")
	let second_prompt = null
	
	// Get custom system prompt if it is set
	if(typeof assistant_id == 'string' && typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].second_prompt == 'string' && window.settings.assistants[assistant_id].second_prompt.length > 10){
		second_prompt = window.settings.assistants[assistant_id].second_prompt;
	}
	// Fall back to second prompt in assistants dict if it exists
	else if(typeof assistant_id == 'string' && typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].second_prompt == 'string' && window.assistants[assistant_id].second_prompt.length > 10){
		second_prompt = window.assistants[assistant_id].second_prompt;
	}
	if(typeof second_prompt == 'string' && second_prompt.length){
		
		if(typeof window.conversations[assistant_id] == 'undefined'){
			window.conversations[assistant_id] = [];
		}
		// Add initial second_prompt to the conversation
		if(window.conversations[assistant_id].length == 0){
			window.conversations[assistant_id].push({'role':'assistant','content':second_prompt});
			setTimeout(() => {
				window.add_chat_message_once(assistant_id,assistant_id,second_prompt);
			},2500);
		}
		
	}
	
	
}
window.switch_assistant = switch_assistant;







// Places a previously used prompt for the currently type of assistant back in the prompt input textarea
function manage_prompt(prompt){
	//console.log('in manage_prompt. prompt: ', prompt);
	
	if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant].type == 'string'){
		
		let type = 'generic';
		if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant].type == 'string'){
			type = window.assistants[window.settings.assistant].type;
			//console.log('manage_prompt. found type in assistants dict: ', type);
		}
		
		if(type == 'generic' && typeof window.assistants[window.settings.assistant].languages != 'undefined' && window.assistants[window.settings.assistant].languages.length == 1 && window.assistants[window.settings.assistant].languages[0] != 'en'){
			type = window.assistants[window.settings.assistant].languages[0];
		}
		
		//console.log('manage_prompt. type: ', type);
		
		if(typeof window.settings.types[type] == 'undefined'){
			window.settings.types[type] = {};
		}
		
		if(typeof prompt == 'string'){
			//console.log("manage_prompt: saving prompt: ", window.assistants[window.settings.assistant].type, prompt);
			window.settings.types[type]['prompt'] = prompt;
			save_settings();
		}
		else{
			//console.log("manage_prompt: restoring prompt: ", type);
			if(typeof window.settings.types[type].prompt == 'string'){
				prompt_el.value = window.settings.types[type].prompt;
			}
			
			else if(
				typeof window.settings.language == 'string'
				&& typeof window.settings.assistant == 'string'
				&& typeof window.assistants[window.settings.assistant] != 'undefined' 
				&& typeof window.assistants[window.settings.assistant].initial_example_prompt != 'undefined' 
				
			){
				if(typeof window.assistants[window.settings.assistant].initial_example_prompt == 'string'){
					prompt_el.value = window.assistants[window.settings.assistant].initial_example_prompt;
				}
				else if(typeof window.assistants[window.settings.assistant].initial_example_prompt[window.settings.language] == 'string'){
					prompt_el.value = window.assistants[window.settings.assistant].initial_example_prompt[window.settings.language];
				}
				else{
					console.warn("no example in assistant dict.  window.settings.language,window.settings.assistant: ", window.settings.language, window.settings.assistant);
				}
				
			}
			else{
				//console.log("manage_prompt: fell through. Nothing to save, and nothing to restore");
			}
				
		}
		
	}
}
window.manage_prompt = manage_prompt;







function try_showing_tutorial(){
	//console.log("in try_showing_tutorial");
	if(model_tutorial_shown == false && window.settings.tutorial.model_tutorial_done == false){
		model_tutorial_shown = true;
		setTimeout(() => {
			//play_tutorial(assistant_tutorial_messages,assistant_id);
			add_chat_message('current','developer','model_tutorial#setting---');
		},60000);
	}
	else if(model_tutorial_shown && document_tutorial_shown == false && window.settings.tutorial.document_tutorial_done == false){
		document_tutorial_shown = true;
		setTimeout(() => {
			//play_tutorial(assistant_tutorial_messages,assistant_id);
			add_chat_message('current','developer','document_tutorial#setting---');
		},60000);
	}
	else if(document_tutorial_shown && voice_tutorial_shown == false && window.settings.tutorial.voice_tutorial_done == false && window.settings.assistant != 'scribe'){
		voice_tutorial_shown = true;
		setTimeout(() => {
			//play_tutorial(assistant_tutorial_messages,assistant_id);
			add_chat_message('current','developer','voice_tutorial#setting---');
		},60000);
	}
}


function load_model_from_focus(){
	//console.log("in load_model_from_focus");
	
	if(window.innerWidth > 640 && window.innerWidth <= 1024 && document.body.classList.contains('sidebar') && document.body.classList.contains('sidebar-chat') && !document.body.classList.contains('sidebar-settings')){
		add_body_class('sidebar-shrink');
	}
	
	if(!window.idle){
		//console.log("load_model_from_focus: window is not idle");
		return
	}
	//console.log("- window.currently_loaded_assistant: ", window.currently_loaded_assistant);
	//console.log("- window.currently_loaded_web_llm_assistant: ", window.currently_loaded_web_llm_assistant);
	//console.log("- window.busy_loading_assistant: ", window.busy_loading_assistant);
	//console.log("- window.web_llm_model_being_loaded: ", window.web_llm_model_being_loaded);
	//console.log("- window.llama_cpp_model_being_loaded: ", window.llama_cpp_model_being_loaded);
	
	if(typeof window.busy_loading_assistant == 'string'){
		
		if(window.busy_loading_assistant == window.settings.assistant){
			//console.log("load_model_from_focus: this model is already being (down)loaded, aborting");
			return
			
		}else{
			const cached = check_if_cached(window.settings.assistant);
			if(!cached){
				//flash_message(get_translation("A_model_is_already_being_loaded"),3000,'warn');
				return;
			}
			else{
				console.warn("load_model_from_focus: loading another assistant while the one is downloading might not be a great idea");
			}
		}
		
		// ALWAYS STOP
		return;
	}
	
	
	// special assistants
	if(window.diffusion_worker == null && window.settings.assistant == 'imager'){ // imager
		//console.log("imager prompt got focus ->  calling create_diffusion_worker");
		window.create_diffusion_worker();
	}
	else if(window.text_to_image_worker == null && window.settings.assistant == 'text_to_image'){ // text_to_image
		//console.log("imager prompt got focus ->  calling create_diffusion_worker");
		//window.create_text_to_image_worker();
		window.preload_text_to_image();
	}
	else if(window.tts_worker == null && window.settings.assistant == 'speaker'){ // speaker
		//console.log("speaker prompt got focus -> calling create_tts_worker");
		if(window.tts_worker == null){
			window.create_tts_worker();
			setTimeout(() => {
				window.add_chat_message(window.settings.assistant,'model_examples#setting---');
			},2000);
		}
		if(window.speaker_enabled == false){
			window.enable_speaker();
		}
	}
	else if(window.settings.assistant == 'musicgen'){ // musicgen
		//console.log("musician prompt got focus");
		if(window.real_musicgen_worker == null){
			//console.log("musician prompt got focus -> calling create_musicgen_worker");
			window.create_musicgen_worker();
		}
		else{
			//console.log("musician prompt got focus -> musicgen_worker already seems to exist");
		}
		
		
	}
	
	else if(window.settings.assistant == 'scribe'){
		if(window.whisper_worker != null){
			window.currently_loaded_model = 'scribe';
		}
		if(window.whisper_worker == null || window.microphone_enabled == false){
			enable_microphone();
			window.last_time_scribe_started = Date.now();
		}
		
		if(window.speaker_enabled == true){
			const previous_speakers_manually_overridden = window.speakers_manually_overridden;
			disable_speaker();
			window.speakers_manually_overridden = previous_speakers_manually_overridden;
		}
	}
	
		
		
	// TODO: I suspect only doing the last part here will also work now, since start_assistant also checks which runner should be used
	
	else{
		//console.log("chat prompt got focus, but window.settings.assistant may be null (or already the currently loaded assistant).  window.settings.assistant:", window.settings.assistant);
	}
	// TODO: SCROLL TO THE BOTTOM
	//this.uiChat.scrollTo(0, this.uiChat.scrollHeight);
}
window.load_model_from_focus = load_model_from_focus;


// This function is outdated, as Papeg.ai has gotter a lot more complex and flexible.
function set_model_loaded(state){
	//console.log("in set_model_loaded. state: ", state);
	window.model_loaded = state; // TODO: is this variable still used? Ancient..
	
	if(state){
		add_body_class('model-loaded');
		//buttonRunProgressLoadingModel.setAttribute("hidden", "hidden");
		//buttonRunProgressLoadedModel.removeAttribute("hidden");
	}
	else{
		remove_body_class('model-loaded');
	    //buttonRun.setAttribute("hidden", "hidden");
	    //buttonRunProgressLoadingModel.removeAttribute("hidden");
	    //modelProgress.removeAttribute("hidden");
	}
	//update_ai_media_class(); // add CSS class to hint to the user to load an AI model with text capabilities
	
	generate_ui();
	update_translation_input_select();
	
}
window.set_model_loaded = set_model_loaded;



function handle_example(example){
	console.log("in handle_example. example: ", example);
	
	if(typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
		window.settings.assistants[window.settings.assistant] = {};
	}
	if(typeof window.settings.assistants[window.settings.assistant].selected != 'boolean' || (typeof window.settings.assistants[window.settings.assistant].selected == 'boolean' && window.settings.assistants[window.settings.assistant].selected == false)){
		window.settings.assistants[window.settings.assistant].selected = true;
		save_settings();
	}
	
	if(typeof example.warning == 'string'){
		add_chat_message('current','developer',window.get_translation(example.warning), example.warning);
	}
	
	
	if(typeof example.action == 'string'){
		
		let date_string = make_date_string();
		
		if(typeof example.text == 'string' && typeof example.title == 'string'){
			
			let example_filename = example.title;
			if(typeof example.filename == 'string'){
				example_filename = example.filename;
			}
			example_filename += ' ' + date_string + '.txt'
			
			// Continue text
			if(example.action == 'continue_text'){
				//console.log("handle_example: type is continue_text. Creating a file and placing the provided text in it");
				
				create_file(false,example.text,example_filename)
				.then((value) => {
					//console.log("handle_example: successfully created new file.  value: ", value);
					//resolve(value);
				})
				.then((value) => {
					//console.log("handle_example: calling continue_document");
					//resolve(value);
					remove_body_class('sidebar-chat'); // show that a new file was created
					continue_document();
				})
				.catch((err) => {
					//console.log("handle_example: failed to create new file.  err: ", err);
					flash_message("couldn't create new file",4000,'error');
					//reject(err);
				})
			}
			
			else{
				console.error("handle_example: fell through: ", example);
			}
		}
		// Chat messages
		else if(example.action == 'chat_messages' && typeof example.chat_messages != 'undefined'){
			//console.log("handle_example: type is chat_messages. Will add a few additional chat messages");
			for(let e = 0; e < example.chat_messages.length; e++){
				setTimeout(() => {
					//console.log("handle_example: posting a chat message: ", example.chat_messages[e]);
					add_chat_message('current','developer',example.chat_messages[e]);
				},1 + (e*2000));
			}
			setTimeout(() => {
				window.scroll_chat_to_bottom();
			},1000);
		}
		// Do prompt
		else if(example.action == 'prompt' && typeof example.prompt == 'string' && example.prompt != ''){
			//console.log("handle_example: type is prompt action. Will run the prompt.");
			console.log("handle_example: example was basic. Setting chat prompt value to: ", example.prompt);
			//window.conversations[window.settings.assistant] = [];
			prompt_el.value = window.get_translation(example.prompt);
			do_prompt(null,prompt_el.value);
			setTimeout(() => {
				window.scroll_chat_to_bottom();
			},1100);
			//submit_prompt_button_el.click();
		}
		else{
			console.error("handle_example: fell through: ", example);
		}
	}
	else if(typeof example.prompt == 'string' && example.prompt != ''){
		console.log("handle_example: example was basic. Setting chat prompt value to: ", example.prompt);
		prompt_el.value = window.get_translation(example.prompt);
	}
	else{
		console.error("handle_example: fell through: ", example);
	}
	
	if(typeof example.function == 'string' && example.function != ''){
		window[example.function]();
	}
	
	if(window.settings.assistant.startsWith('image_to_text')){
		remove_body_class('hide-camera-still');
	}
	
	
}



// Add user message and an empty assistant message
function add_to_conversation(task,response=null,prompt=null){
	//console.log("in add_to_conversation.  task,response,prompt:", task,response,prompt);
	
	let assistant_id = null;
	
	if(typeof task != 'undefined'){
		if(typeof task.assistant == 'string'){
			assistant_id = task.assistant;
		}
		if(typeof prompt == 'string'){
			
		}
		else if(prompt == null && typeof task.prompt == 'string'){
			console.warn("add_to_conversation: provided prompt was null")
			prompt = task.prompt;
		}
		else{
			console.error("add_to_conversation: no prompt, so cannot add.  task: ", task);
			return false
		}
		if(typeof task.index != 'number'){
			console.error("add_to_conversation: task has no index: ", task);
			return false
		}
	}
	else{
		console.error("add_to_conversation: no valid (proto)task provided");
		return false
	}

	if(assistant_id == null){
		assistant_id = window.settings.assistant;
	}
	
	if(typeof window.conversations[assistant_id] == 'undefined'){
		window.conversations[assistant_id] = [];
	}
	
	if(typeof prompt != 'string'){
		console.error("add_to_conversation: prompt was not a string: ", prompt);
		return false
	}
	
	let user_chat = {'role':'user','content':prompt,'index':task.index}
	
	//console.log("add_to_conversation: adding prompt: ", prompt);
	
	if(typeof task.index == 'number' && typeof task.raw_prompt == 'string' && task.state == 'should_translation'){ // This task needs pre- and post-translation. So we should store both the raw untranslated prompt and, later on, the translation
		user_chat['raw_prompt'] = task.raw_prompt;
		user_chat['index'] = task.index;
	}
	
	window.conversations[assistant_id].push(user_chat);
	
	if(typeof response != 'string'){
		response = '';
	}
	let response_object = {'role':'assistant','content':response,'index':task.index};
	
	
	
	//console.log("add_to_conversation: adding response: ", response);
	window.conversations[assistant_id].push(response_object);
	
	return true
	
}



async function add_response_to_conversation(task,response=null){
	//console.log("in add_response_to_conversation.  task,response: ", task, response);
	
	let assistant_id = null;
	let prompt = null;
	
	if(typeof task != 'undefined'){
		if(typeof task.assistant == 'string'){
			assistant_id = task.assistant;
		}
		else{
			console.error("add_response_to_conversation: task.assistant was undefined");
			return false
		}
		if(typeof task.index != 'number'){
			console.error("add_response_to_conversation: task.index was not a number");
			return false
		}
	}
	else{
		console.error("add_response_to_conversation: task was undefined");
		return false
	}
	
	if(typeof response != 'string'){
		if(typeof task.results != 'undefined' && Array.isArray(task.results) && task.results.length){
			if(typeof task.results[task.results.length - 1] == 'string'){
				response = task.results[task.results.length - 1];
			}
		}
	}
	if(typeof response != 'string' && typeof task.transcription == 'string'){
		response = task.transcription;
	}
	if(typeof response != 'string' && typeof task.sentence == 'string'){
		response = task.sentence;
	}
	
	if(typeof task.type == 'string'){
		//console.log("add_to_conversatin: task.type: ", task.type);
	}
	if(typeof task.state == 'string'){
		//console.log("add_to_conversatin: task.state: ", task.state);
	}
	
	
	//https://huggingface.co/QuietImpostor/Gemini-Nano-Safetensors/tree/main
	
	//let found_it = false;
	if(typeof response == 'string' && typeof window.conversations[assistant_id] != 'undefined' && Array.isArray(window.conversations[assistant_id])){
		//console.log("add_response_to_conversation: looking through conversation history to find spot to add the result: ", window.conversations[assistant_id]);
		for(let x = 0; x < window.conversations[assistant_id].length; x++){
			//console.log("add_response_to_conversation: index match? ", window.conversations[assistant_id][x].index, " =?= ", task.index);
			if(typeof window.conversations[assistant_id][x].index == 'number' && window.conversations[assistant_id][x].index == task.index && typeof window.conversations[assistant_id][x].role == 'string' && window.conversations[assistant_id][x].role == 'assistant'){
				//found_it = true;
				//console.log("add_response_to_conversation: found it: ", window.conversations[assistant_id][x]);
				
				if(window.conversations[assistant_id][x].role == 'assistant' && typeof window.conversations[assistant_id][x].content == 'string'){
					//console.log("add_response_to_conversation: role is assistant");
					if(typeof task.return_language == 'string' && window.conversations[assistant_id][x]['content'] != '' ){ // typeof task.quiet == 'boolean' && 
						//console.log("add_response_to_conversation: adding response to conversation post_translation dict: ", task.return_language, response);
						if(typeof window.conversations[assistant_id][x]['post_translations'] == 'undefined'){
							window.conversations[assistant_id][x]['post_translations'] = {};
						}
						window.conversations[assistant_id][x]['post_translations'][task.return_language] = response;
					}
					else{
						//console.log("add_response_to_conversation: setting response as content");
						window.conversations[assistant_id][x]['content'] = response;
					}
					//console.log("add_response_to_conversation: succesfully set assistant response content: ", window.conversations[assistant_id][x]);
					
				}
				else if(window.conversations[assistant_id][x].role == 'assistant'){
					console.error("add_response_to_conversation: faulty coversation, assistant content was not an (empty) string: ", x, window.conversations[assistant_id], "\n", window.conversations[assistant_id][x]);
				}
				else{
					//console.log("add_response_to_conversation: skipping user message: ", window.conversations[assistant_id][x]);
				}
				
				//delete window.conversations[assistant_id][x].index;
				await save_conversation(assistant_id);
				return true
			}
		}
	}
	return false
}



function add_translation_to_conversation(task, translation=null, role='user'){
	//console.log("in add_translation_to_conversation. task,translation,role: ", task, translation, role);
	
	let assistant_id = null;
	//let translation = null;
	
	if(typeof task != 'undefined'){
		if(typeof task.assistant == 'string'){
			assistant_id = task.assistant;
		}
		else{
			console.error("add_translation_to_conversation: task.assistant was undefined");
			return false
		}
		if(typeof task.index != 'number'){
			console.error("add_translation_to_conversation: task.index was not a number");
			return false
		}
	}
	else{
		console.error("add_translation_to_conversation: task was undefined");
		return false
	}
	
	if(typeof translation != 'string'){
		console.error("add_translation_to_conversation: translation was not string");
		return false
	}
	
	
	//https://huggingface.co/QuietImpostor/Gemini-Nano-Safetensors/tree/main
	
	//let found_it = false;
	if(typeof translation == 'string' && typeof window.conversations[assistant_id] != 'undefined' && Array.isArray(window.conversations[assistant_id])){
		//console.log("add_translation_to_conversation: looking through conversation history to find spot to add the translation");
		for(let x = 0; x < window.conversations[assistant_id].length; x++){
			if(typeof window.conversations[assistant_id][x].index == 'number' && window.conversations[assistant_id][x].index == task.index && typeof window.conversations[assistant_id][x].role == 'string'){
				//found_it = true;
				//console.log("add_translation_to_conversation: looking through conversation history: found it:  window.conversations[assistant_id][x]: ", window.conversations[assistant_id][x]);
				if(window.conversations[assistant_id][x].role == 'user' && typeof window.conversations[assistant_id][x].content == 'string'){
					//console.log("add_translation_to_conversation: role is user");
					
					if(typeof task.return_language == 'string' && translation != '' ){
						//console.log("add_translation_to_conversation: adding translation to conversation post_translation dict: ", task.return_language, translation);
						if(typeof window.conversations[assistant_id][x]['pre_translations'] == 'undefined'){
							window.conversations[assistant_id][x]['pre_translations'] = {};
						}
						
						let ai_language = 'en';
						
						if(typeof task.lingua_franca == 'string' && task.lingua_franca != ''){
							ai_language = task.lingua_franca;
						}
						
						
						// TODO figure out intermediary languge the AI speaks - likely English
						window.conversations[assistant_id][x]['pre_translations'][ai_language] = translation;
						
						if(typeof task.raw_prompt == 'string'){
							window.conversations[assistant_id][x]['pre_translations'][task.return_language] = task.raw_prompt;
						}
						else if(typeof task.original_prompt == 'string'){
							window.conversations[assistant_id][x]['pre_translations'][task.return_language] = task.original_prompt;
						}
						else if(typeof task.prompt == 'string'){
							window.conversations[assistant_id][x]['pre_translations'][task.return_language] = task.prompt;
						}
						
						if(typeof task.lingua_franca == 'string' && task.lingua_franca != '' && task.return_language != task.lingua_franca && typeof window.conversations[assistant_id][x]['pre_translations'][task.return_language] == 'string' && window.conversations[assistant_id][x]['pre_translations'][task.return_language].length){
							window.conversations[assistant_id][x].content = translation;
						}
						
					}
					else{
						console.error("add_translation_to_conversation: task not quiet?", task);
					}
				}
				else{
					console.error("add_translation_to_conversation: error?  window.conversations[assistant_id]:", window.conversations[assistant_id]);
				}
				//delete window.conversations[assistant_id][x].index;
				save_conversation(assistant_id);
				return true
			}
		}
	}
	return false
}










// Saved (part of) conversation to backup file
async function save_conversation(assistant_id){
	//console.log("in save_conversation.  assistant_id: ", assistant_id);
	if(typeof assistant_id == 'string' && assistant_id.length){
		
		let conversation_data = '';
		let conversation_to_keep_count = 0;
		if(typeof window.conversations[assistant_id] != 'undefined' && Array.isArray(window.conversations[assistant_id]) ){
			if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['save_conversation'] == 'number' && window.settings.assistants[assistant_id]['save_conversation'] > 0){
				conversation_to_keep_count = window.settings.assistants[assistant_id]['save_conversation'];
				if(conversation_to_keep_count > window.conversations[assistant_id].length){
					conversation_to_keep_count = window.conversations[assistant_id].length;
				}
			}
			//console.log("save_conversation: conversation_to_keep_count: ", conversation_to_keep_count);
			let conversation_to_store = [];
			for (let c = (window.conversations[assistant_id].length - conversation_to_keep_count); c < window.conversations[assistant_id].length; c++){
				let conversation_message = JSON.parse(JSON.stringify(window.conversations[assistant_id][c]));
				if(typeof conversation_message['index'] != 'undefined'){
					delete conversation_message['index']; // remove index from conversation backup so that it doesn't interfere after the page is reloaded, and the index is reset.
				}
				conversation_to_store.push(conversation_message);
			}
			conversation_data = JSON.stringify(conversation_to_store,null,4);
		}
		
		
		const conversation_filename = assistant_id + "_papeg_ai_conversation.json";
		//console.log("save_conversation: saving conversation_data: ", conversation_data);
		//console.log("save_conversation: saving to: ", conversation_filename);
		
		if(typeof conversation_data == 'string' && conversation_data != '' && conversation_to_keep_count > 0){
			// add conversations folder to root if it doesn't exist yet
			add_sub_folder('','Papeg_ai_conversations');
			
			if(typeof playground_live_backups["Papeg_ai_conversations/" + conversation_filename] != 'string'){

				really_create_file(false,conversation_data,conversation_filename,'/Papeg_ai_conversations',true)
				.then((value) => {
					//console.log("created new conversation history file");
					return true
				})
				.catch((err) => {
					console.error("error saving conversation history file.  err: ", err, '\n/Papeg_ai_conversations/ + ' + conversation_filename, "\nconversation_data: ", conversation_data);
					return true
				})
				
			}
			else{
				
				save_file(
					conversation_filename, 
					conversation_data, 
					"browser",
					"/Papeg_ai_conversations"
				)
				.then((value) => {
					//console.log("save_conversation: saved conversation history. value: ", value);
					return true
				})
				.catch((err) => {
					console.error("save_conversation: caught error saving conversation history");
					return false
				})
			}
			
		}
		else if(typeof conversation_data == 'string'){
			//console.log("save_conversation: no conversation_data to store (save_conversation likely set to zero): ", assistant_id);
			
			if(typeof playground_live_backups["Papeg_ai_conversations/" + conversation_filename] == 'string' && playground_live_backups["Papeg_ai_conversations/" + conversation_filename] != ''){
				playground_live_backups["Papeg_ai_conversations/" + conversation_filename] = '';
				save_file(
					conversation_filename, 
					'[]', 
					"browser",
					"/Papeg_ai_conversations"
				)
				.then((value) => {
					//console.log("save_conversation: saved empty conversation history. value: ", value);
					return true
				})
				.catch((err) => {
					console.error("save_conversation: caught error saving empty conversation history");
					return false
				})
			}
			if(typeof playground_saved_files["Papeg_ai_conversations/" + conversation_filename] == 'string' && playground_saved_files["Papeg_ai_conversations/" + conversation_filename] != ''){
				playground_saved_files["Papeg_ai_conversations/" + conversation_filename] = '';
				save_file(
					conversation_filename, 
					'[]', 
					"browser",
					"/Papeg_ai_conversations"
				)
				.then((value) => {
					//console.log("save_conversation: saved empty conversation history. value: ", value);
					return true
				})
				.catch((err) => {
					console.error("save_conversation: caught error saving empty conversation history");
					return false
				})
			}
			
			return false
		}
		else{
			console.error("save_conversation: conversation data was not a string? ", conversation_data);
			return false
		}
		
	}
	else{
		console.error("save_conversation: invalid assistant ID provided: ", assistant_id);
		return false
	}
}




//
//   TASK MANAGEMENT
//

// can also generated a chat message that has elements with ID's based on the task counter, so that they can later be updated with content from the task when it's completed.
function add_task(new_task=null,chat_message=null){
	//console.log("in add_task.  new task: \n", JSON.stringify(new_task,null,4));
	
	if(chat_message != null){
		//console.log("add_task: chat_message:\n",JSON.stringify(chat_message,null,4));
	}
	if(typeof hide_doc_selection_hint == 'function'){
		hide_doc_selection_hint();
	}
	
	
	if(typeof new_task == 'undefined' || new_task == null){
		console.error("add_task: provided task was invalid: ", task);
		return false
	}
	if(typeof new_task.prompt == 'undefined'){
		console.error("add_task: new task prompt was undefined: ", new_task);
		return false
	};
	if(typeof new_task.prompt == 'string' && new_task.prompt.length < 2){
		if(typeof new_task.assistant == 'string' && new_task.assistant == 'image_to_text_ocr'){
			//console.log("add_task: allowing OCR to have an empty prompt");
		}
		else{
			console.error("add_task: new task prompt was empty/too short: ", new_task);
			return false
		}
		
	};
	if(typeof new_task.image_blob != 'undefined'){
		//console.log("add_task:  new_task.image_blob was not undefined: ", new_task.image_blob);
	}
	
	window.task_counter++;
	
	window.set_idle(false);
	
	if(typeof new_task.assistant == 'undefined'){
		new_task['assistant'] = window.settings.assistant;
	}
	if(new_task['assistant'] == 'developer'){
		console.error("add_task: task's assistant was developer. window.settings.last_loaded_text_ai : ", window.settings.last_loaded_text_ai );
		if(window.settings.last_loaded_text_ai == null || typeof window.settings.last_loaded_text_ai != 'string' || window.assistants[window.settings.last_loaded_text_ai] == 'undefined'){
			new_task['assistant'] = window.pick_optimal_text_ai();
		}
		else{
			new_task['assistant'] = window.settings.last_loaded_text_ai;
			console.error("add_task: switched task's assistant to: ", new_task['assistant']);
		}
	}
	
	
	// Switch to text-first AI's for tasks that require it
	if(typeof new_task['assistant'] == 'string' && typeof window.assistants[new_task['assistant']] != 'undefined' && typeof window.assistants[new_task['assistant']].media != 'undefined' && Array.isArray(window.assistants[new_task['assistant']].media) && window.assistants[new_task['assistant']].media.indexOf('text') == -1){
		//console.log("AI model has list of supported media types, and text is not one of them: ", window.assistants[new_task['assistant']].media);
		if(new_task['type'].indexOf('rewrite') != -1 || new_task['type'].indexOf('summarize') != -1 || new_task['type'].indexOf('proofread') != -1 || new_task['type'] == 'continue' || new_task['state'] == 'should_rag' || new_task['state'] == 'should_assistant'){
			console.warn("add_task: the currently assigned AI cannot handle a text task. It has to be switched to one that can. window.settings.last_loaded_text_ai: ", window.settings.last_loaded_text_ai, "\n- new_task with wrong Ai: ", new_task);
			window.switch_assistant(window.settings.last_loaded_text_ai); // TODO: experiment
			new_task['assistant'] = window.settings.last_loaded_text_ai;
			//console.log("add_task: switched assistant to: ", new_task['assistant']);
		}
	}
	
	new_task['index'] = window.task_counter;
	new_task['timestamp_created'] = Date.now();

	if(typeof new_task.state == 'undefined'){
		console.error("add_task: new task has no provided state (setting it to 'added'): ", new_task);
		new_task['state'] = 'added';
	}
	
	if(new_task.state == 'should_stt'){
		window.stt_tasks_left++;
		window.update_audio_counters_in_ui();
	}
	else if(new_task.state == 'should_tts'){
		window.tts_tasks_left++;
		//console.log("add_task: window.tts_tasks_left is now: ", window.tts_tasks_left);
	}
	
	if(typeof new_task.handled_by == 'undefined'){
		new_task['handled_by'] = [];
	}
	
	if(typeof new_task.origin == 'string' && new_task.origin == 'blueprint'){
		// do not add voice string to task now, the voice to use will be based on window.settings.voice instead. That way a blueprint can switch voices.
	}
	else if(typeof new_task.voice != 'string'){
		new_task['voice'] = window.settings.voice;
	}
	
	if(typeof new_task.voice == 'string' && new_task.voice == 'basic' && new_task.assistant == 'speaker'){
		console.warn("changing speaker task TTS from 'basic' to 'default'");
		new_task['voice'] = 'default';
	}
	
	if(typeof new_task.desired_results != 'number'){
		new_task.desired_results = 1;
	}
	
	if(typeof new_task.sentences == 'undefined'){
		new_task['sentences'] = [];
	}
	
	if(typeof new_task.q == 'undefined'){
		new_task['q'] = [];
	}
	else{
		//console.log("add_task: this task already has a q: ", new_task.q);
	}
	
	
	
		
	// Markdown
	if(typeof window.assistants[new_task.assistant] != 'undefined' && typeof window.assistants[new_task.assistant].markdown_supported == 'boolean' && window.assistants[new_task.assistant].markdown_supported == true){
		//console.log("add_task: this assistant supports the markdown toggle");
		if(typeof window.settings.assistants[new_task.assistant] != 'undefined' && typeof window.settings.assistants[new_task.assistant].markdown_enabled == 'boolean' && window.settings.assistants[new_task.assistant].markdown_enabled == true){
			//console.log("add_task: enabling markdown as it was enabled in the user's model settings");
			new_task['markdown'] = true;
		}
		else if(typeof window.assistants[new_task.assistant] != 'undefined' && typeof window.assistants[new_task.assistant].markdown_enabled == 'boolean' && window.assistants[new_task.assistant].markdown_enabled == true){
			//console.log("add_task: enabling markdown as it was set in the assistants dict");
			new_task['markdown'] = true;
		}
		else{
			//console.log("add_task: not enabling markdown");
		}
	}
	

	// Brevity
	if(typeof window.assistants[new_task.assistant] != 'undefined' && typeof window.assistants[new_task.assistant].brevity_supported == 'boolean' && window.assistants[new_task.assistant].brevity_supported == true){
		//console.log("add_task: this assistant supports the brevity toggle");
		if(typeof window.settings.assistants[new_task.assistant] != 'undefined' && typeof window.settings.assistants[new_task.assistant].brevity_enabled == 'boolean' && window.settings.assistants[new_task.assistant].brevity_enabled == true){
			//console.log("add_task: enabling brevity as it was enabled in the user's model settings");
			new_task['brevity'] = true;
		}
		else if(typeof window.assistants[new_task.assistant].brevity_enabled == 'boolean' && window.assistants[new_task.assistant].brevity_enabled == true){
			//console.log("add_task: enabling brevity as it was set in the assistants dict");
			new_task['brevity'] = true;
		}
		else{
			//console.log("add_task: not enabling brevity");
		}
	}
	
	
	if(typeof new_task.results == 'undefined'){
		new_task['results'] = [];
	}
	else if(new_task.results.length > 0){
		console.error("add_task: this task came with pre-filled results?");
		if(new_task.results.length >= new_task.desired_results){
			console.error("add_task: the provided task was already fulfilled. Aborting.");
			return false
		}
	}
	
	
	//
	//  PRE-AND-POST-TRANSLATE NEW TASK IF NEED BE
	//
	
	// STT tasks could be translated from a non-english source language by Whisper directly. 
	// TODO: test the quality of that. If Whisper's transcription into non-english languages works fine, but the translations to English are poor, then let the specialized translation AI's translate the transcriptions.
	// update: it was pretty bad..
	
	
	window.task_queue.push(new_task);
	update_buffer_counts();
	update_task_overview();
	
	
	if(typeof new_task.destination == 'string' && new_task.destination == 'chat' && window.settings.tutorial.first_task_slow_explanation == false && window.settings.chat_shrink == false){
		
		window.settings.tutorial.first_task_slow_explanation = true;
		save_settings();
		
		setTimeout(()=>{
			add_chat_message_once(new_task.assistant,'developer','why_so_slow#setting---');
		},5000)
		
	}
	
	//console.log("add_task: done. returning accepted task: ", new_task);
	
	return new_task
}
window.add_task = add_task;






// TODO: also keep count of remaining summarization, continuation and rewriting tasks
// keeping track of how many completed tasks are buffered (waiting for a next step in a process) is important to not get too far ahead of ourselves, and to now waste processing power
// E.g. when playing a document, the document could technically change while it's being spoken, so the process should only look-ahead a few sentences, and not the entire document.
function update_buffer_counts(){
	//console.log("in update_buffer_counts");
	
	let stt_tasks_left = 0;
	let tts_tasks_left = 0;
	let audio_files_in_buffer = 0;
	let blueprint_tasks_left = 0;
	let chat_messages_to_answer = 0;
	let play_document_tasks_left = 0;
	let images_to_generate = 0;
	let images_to_process = 0;
	let music_to_generate = 0;
	let mp3_to_encode = 0;
	let rag_tasks_left = 0;
	let assistant_tasks_left = 0;
	let should_tasks_left = 0;
	let doing_tasks_left = 0;
	
	for(let t = 0; t <  window.task_queue.length; t++){
		
		// Skip completed tasks
		if(is_task_valid(window.task_queue[t]) == false){
			//console.log("update_buffer_counts: skipping invalid task (likely already completed)");
			continue
		}
		
		// Blueprint tasks should happen sequentially, one by one. This is slow but safe.
		if(window.task_queue[t].origin == 'blueprint' && typeof window.task_queue[t].state != 'completed'){
			//console.log("update_buffer_counts: spotted incomplete blueprint task ++");
			//console.log("blueprint index of incomplete task: ", window.task_queue[t].blueprint_index, window.task_queue[t].type);
			blueprint_tasks_left++;
		}
		
		if(window.task_queue[t].origin == 'play_document' && typeof window.task_queue[t].state != 'completed'){
			//console.log("update_buffer_counts: spotted incomplete play_document task ++");
			play_document_tasks_left++;
		}
		
		
		// These two can be all kinds of types
		if(window.task_queue[t].state.startsWith('should_')){
			should_tasks_left++;
		}
		if(window.task_queue[t].state.startsWith('doing_')){
			doing_tasks_left++;
		}
		
		
		// Tasks whose audio should be turned into MP3's. This happens at the very end of the chain, so it's safe to continue
		if(window.task_queue[t].state == 'should_mp3'){
			mp3_to_encode++;
			continue
		}
		if(window.task_queue[t].state == 'should_musicgen'){
			music_to_generate++;
		}
		
		
		if(window.task_queue[t].type == 'image'){
			images_to_generate++;
		}
		
		if(window.task_queue[t].type == 'processing_image'){
			images_to_process++;
		}
		
		if(window.task_queue[t].state == 'should_rag'){
			rag_tasks_left++;
		}
		
		if(window.task_queue[t].state == 'should_assistant' || window.task_queue[t].state == 'doing_assistant'){
			assistant_tasks_left++;
		}
			
			
		
			
		
			
		// chat tasks that should be responded to by an assistant
		if(window.task_queue[t].type == 'chat' || (typeof window.task_queue[t].prompt == 'string' && window.task_queue[t].state != 'should_tts' && window.task_queue[t].state != 'should_audio_player')){
			//console.log("update_buffer_counts: spotted chat task ++");
			chat_messages_to_answer++;
		}
		
		// .recorded_audio -> stt task
		if(window.task_queue[t].state == 'should_stt' || window.task_queue[t].state == 'doing_stt'){
			//console.log("update_buffer_counts: spotted task with recorded_audio ++");
			stt_tasks_left++;
			continue
		}
		
		
		
		// .sentence -> ready for tts
		if(window.task_queue[t].state == 'should_tts' || window.task_queue[t].state == 'doing_tts'){
			//console.warn("update_buffer_counts: spotted task with sentence to do tts on ++");
			tts_tasks_left++;
			continue
		}
		
		// TODO: loop over more complex tasks
		
		// .audio -> ready for audio player
		if(window.task_queue[t].state == 'should_audio_player' || window.task_queue[t].state == 'doing_audio_player'){
			//console.log("update_buffer_counts: spotted task with audio buffer to play ++");
			audio_files_in_buffer++;
			continue
		}
		
	}
	
	window.stt_tasks_left = stt_tasks_left;
	window.tts_tasks_left = tts_tasks_left;
	window.audio_files_in_buffer = audio_files_in_buffer;
	window.blueprint_tasks_left = blueprint_tasks_left;
	window.chat_messages_to_answer = chat_messages_to_answer;
	window.play_document_tasks_left = play_document_tasks_left;
	window.images_to_generate = images_to_generate;
	window.images_to_process = images_to_process;
	window.music_to_generate = music_to_generate;
	window.mp3_to_encode = mp3_to_encode;
	window.rag_tasks_left = rag_tasks_left;
	window.assistant_tasks_left = assistant_tasks_left;
	window.should_tasks_left = should_tasks_left;
	window.doing_tasks_left = doing_tasks_left;
	
	//console.log("________")
	//console.log("window.stt_tasks_left: ", window.stt_tasks_left);
	//console.log("window.chat_messages_to_answer: ", window.chat_messages_to_answer);
	//console.log("window.tts_tasks_left: ", window.tts_tasks_left);
	//console.log("window.audio_files_in_buffer: ", window.audio_files_in_buffer);
	//console.log("window.play_document_tasks_left: ", window.play_document_tasks_left);
	//console.log("window.blueprint_tasks_left: ", window.blueprint_tasks_left);
	//console.log("window.images_to_generate: ", window.images_to_generate);
	//console.log("window.images_to_process: ", window.images_to_process);
	//console.log("window.music_to_generate: ", window.music_to_generate);
	//console.log("window.mp3_to_encode: ", window.mp3_to_encode);
	//console.log("window.rag_tasks_left: ", window.rag_tasks_left);
	//console.log("window.assistant_tasks_left: ", window.assistant_tasks_left);
	//console.log("window.should_tasks_left: ", window.should_tasks_left);
	//console.log("window.doing_tasks_left: ", window.doing_tasks_left);
	//console.log("ˆˆˆˆˆˆˆˆ")
	
	
	update_audio_counters_in_ui();
	
	
}
window.update_buffer_counts = update_buffer_counts;



function update_audio_counters_in_ui(){
	
	// Microphone tasks counter	
	if(window.microphone_enabled){
		if(window.stt_tasks_left > 2){
			microphone_tasks_counter_container_el.textContent = window.stt_tasks_left - 1;
		}
		else{
			if(microphone_tasks_counter_container_el.textContent != ''){
				microphone_tasks_counter_container_el.textContent = '';
			}
		}
	
		if(window.stt_tasks_left > 5){
			add_body_class('many-stt-tasks');
		}
		else{
			if(document.body.classList.contains('many-stt-tasks')){
				remove_body_class('many-stt-tasks');
			}
		}
	}
	else{
		if(microphone_tasks_counter_container_el.textContent != ''){
			microphone_tasks_counter_container_el.textContent = '';
		}
		if(document.body.classList.contains('many-stt-tasks')){
			remove_body_class('many-stt-tasks');
		}
		
	}
	
	// Speaker tasks counter
	if((window.tts_tasks_left + window.audio_files_in_buffer) > 2){
		speaker_tasks_counter_container_el.textContent = (window.tts_tasks_left + window.audio_files_in_buffer) - 1;
	}
	else{
		if(speaker_tasks_counter_container_el.textContent != ''){
			speaker_tasks_counter_container_el.textContent = '';
		}
	}
}
window.update_audio_counters_in_ui = update_audio_counters_in_ui;



//
//  IS TASK VALID ?
//
// Filter out broken or completed tasks
function is_task_valid(task){
	//console.log("in is_task_valid. task: ", task);
	if(typeof task != 'object' || task == null){
		console.error("is_task_valid: no valid task object / task was null. Returning false.");
		return false
	}
	
	if(typeof task.type != 'string' || typeof task.state != 'string'){
		console.error("is_task_valid: task had invalid type or state. Returning false.");
		return false
	}
	
	if(window.irrelevant_task_states.indexOf(task.state) != -1){
		//console.log("is_task_valid: task has already been completed, interrupted, or has failed.");
		return false;
	}
	return true
}
window.is_task_valid = is_task_valid;



//
//  HANDLE CHUNK
//

// response_so_far: the previously generated tokens
// chunk: the brand new tokens
// Snippet: a portion of the output to be shown as progress update. With translation this can be in the middle of the final text
function handle_chunk(task, response_so_far, chunk, snippet=null,result_object){
	//console.log("in handle_chunk. task: ", task);
	
	if(typeof task == 'undefined' || task == null){
		console.error('handle_chunk: task was invalid: ', task, response_so_far, chunk);
		return false
	}
	
	if(typeof response_so_far != 'string' || typeof chunk != 'string'){
		console.error("handle_chunk: aborting, response_so_far or chunk was not a string: ", response_so_far, chunk);
		return
	}
	
	if(window.settings.left_sidebar_open == true && window.settings.left_sidebar == 'settings' && window.settings.left_sidebar_settings_tab == 'tasks' && typeof task.index == 'number'){
		//console.log("handle_chunk: task, has task.index: ", task.index, chunk);
		let task_list_chunk_el = document.querySelector('#simple-task-details-chunk' + task.index);
		//console.log("handle_chunk: task_list_chunk_el: ", task_list_chunk_el);
		if(task_list_chunk_el != null){
			task_list_chunk_el.textContent = task_list_chunk_el.textContent + chunk;
			if(task_list_chunk_el.textContent.length > 20){
				task_list_chunk_el.textContent = "..." + task_list_chunk_el.textContent.substr( task_list_chunk_el.textContent.length - 20);
			}
		}
	}
	
	
	//console.log(" - chunk: ", chunk);
	//console.log(" - snippet: ", snippet);
	
	if(response_so_far.startsWith('[INST] ')){
		response_so_far = response_so_far.replace('[INST] ','');
	}
	if(response_so_far.startsWith('? ')){
		response_so_far = response_so_far.replace('? ','');
	}
	
	if(response_so_far.startsWith('<!') && response_so_far.indexOf('|>') != -1){
		response_so_far = response_so_far.substr( (response_so_far.indexOf('|>') + 1) );
	}
	
	
	let removed_sure = false;
	if(response_so_far.startsWith('Sure')){
		//console.log("removing 'Sure, here' etc from beginning of result: ", result);
	
		if(response_so_far.startsWith('Sure, here') && response_so_far.indexOf(':\n') != -1){
			if(response_so_far.indexOf('.') != -1 && response_so_far.indexOf(':\n') > response_so_far.indexOf('.')){
				//console.warn("handle_chunk: summarize_document: spotted a . before the :, so not removing 'Sure, here' etc");
				removed_sure = true;
			}
			else{
				response_so_far = response_so_far.substr(response_so_far.indexOf(':\n') + 1);
				//console.log("Handle_chunk: 'Sure, here' snipped from response_so_far: ", response_so_far);
				while(response_so_far.startsWith('\n')){
					//console.log("snipping newline from beginning of 'Sure, here' snipped result");
					response_so_far = response_so_far.substr(1);
				}
				removed_sure = true;
			}
		}
	
	}
	else{
		removed_sure = true;
	}
	
	if(removed_sure == false){
		console.warn("Handle_chunk: aborting, after 'Sure, here' was somehow NOT snipped from response_so_far: ", response_so_far);
		return;
	}
	
	
	
	
	let total_response = response_so_far + chunk;
	
	
	if(
		total_response.startsWith('>>>>>>>>>>>>>') // Danube 3 500m
		|| total_response.startsWith('!!!!!!!!!!!') // Whisper when using non-16000 sample rate
	){
		console.error("handle_chunk: stopping assistant, it's outputting a string of nonsense characters: ", total_response);
		window.stop_assistant(task);
		return
	}
	
	if(total_response.length > 20){
		let total_response_tail = total_response.substr(total_response.length - 10);
		if( total_response_tail.indexOf('<|user') != -1 || 
			total_response_tail.indexOf('<|im_end') != -1 || 
			total_response_tail.indexOf('<|end') != -1 || 
			total_response_tail.indexOf('[INST]') != -1 ||
			total_response_tail.indexOf('[/INST]') != -1 ||
			total_response_tail.indexOf('<human') != -1 ||
			total_response_tail.indexOf('<|prompt|>') != -1
			
		){
			console.error("handle_chunk: stopping assistant, saw special tokens in response tail: ", total_response_tail);
			window.stop_assistant(task);
			return
		}
	}
	


	window.write_on_pip_canvas(total_response);
	
	
	
	if(snippet == null){
		//console.log("handle_chunk: no snippet provided by LLM, setting total response as the snippet");
		snippet = total_response;
	}
	
	if(check_if_text_end_is_repeating(total_response)){
		console.error("handle_chunk: warning, the AI seems to be repeating itself.  total_response, task: ", total_response, task);
		flash_message(get_translation("The_AI_seems_to_be_repeating_itself"),5000,'warn');
		if(task != null){
			window.stop_assistant(task);
			return
		}
		else{
			console.error("handle_chunk: AI is repeating itself, but there is no task provided, so cannot stop it");
		}
		
	}
	//console.log("handle_chunk: OK, the text is not repeating itself (yet)");
	
	if(typeof task.origin == 'string'){
		
		if(task.assistant == "translator"){
			if(typeof snippet == 'string'){
				//console.log("handle_chunk: got snippet from translator: ", snippet);
		
				if(task.origin == 'ocr' || task.origin == 'camera'){
					live_translation_output_el.innerHTML += snippet;
				}
				else if(task.origin == 'chat'){
					set_chat_status(task,total_response);
				}
				else if(task.origin == "translate_document"){
					//console.log("handle_chunk: got translate_document chunk");
					
					if(typeof result_object != 'undefined' && typeof result_object.chunk != 'undefined'){
						insert_into_document(task, result_object.chunk, {"position":"end"});
					}
					else if(typeof snippet == 'string'){
						insert_into_document(task, snippet, {"position":"end"});
					}
							
				}
		
				if(window.speaker_enabled){
					//console.log("handle_chunk: speaker is enabled, creating speaking task from snippet (latest translated sentence): ", snippet);
					
					let tts_task = {
						'prompt':null,
						'assistant':'translator',
						'type':'speak',
						'state':'should_tts',
						'sentence': snippet,
						'destination':'audio_player'
					}
					if(typeof task.index == 'number'){
						tts_task['parent_index'] = task.index;
					}
			
					if(typeof task.origin == 'string'){
						tts_task.origin = task.origin;
					}
					
					if(typeof task.input_language == 'string'){
						tts_task.input_language = task.input_language;
					}
					if(typeof task.output_language == 'string'){
						tts_task.output_language = task.output_language;
					}
					
					
					/*
					if(typeof window.task_queue[t].destination == 'string'){
						tts_task.destination = window.task_queue[t].destination;
					}
					*/
					
					window.add_task(tts_task);
				}
			}	
		}
		
		else if (task.origin == 'rewrite' || task.origin == 'rewrite_selection' || task.origin == 'translate_selection'){ // || task.origin == 'summarize_selection' || task.origin == 'summarize_document' // || task.origin == 'translate_document'
			if(typeof task.index == 'number'){
			
				//console.log("handle_chunk: task.origin was from rewrite, rewrite_selection or translate_selection tool: ", task.origin, task);
			
				if(typeof task.type == 'string' && task.type == 'summarize'){
					console.error("HANDLE CHUNK IS OUTPUTTING PARTIAL SUMMARIZE RESULT TO CHAT STATUS.. BAD IDEA?");
					// show simple summary output as chat status update
					window.set_chat_status(task, response_so_far + chunk ); // TODO this is rather odd. It shouldn't be shown there if the destination is a document
				}
				else{
					//console.log("handle_chunk: adding chunk to rewrite-result container");
					// Add to rewrite-result container
					
					let index = task.index;
					if(typeof task.parent_index == 'number'){
						//console.log("handle_chunk: task has parent. Switching to index of parent task: ", task.index, " -> ", task.parent_index);
						index = task.parent_index;
					}
					// update rewrite short snippet in the summary
					let rewrite_snippet_el = document.getElementById('rewrite-results-snippet' + index);
					if(rewrite_snippet_el){
						let snippet_el = rewrite_snippet_el.querySelector('#rewrite-results-snippet' + index + '-' + task.results.length);
						if(snippet_el == null){
							snippet_el = document.createElement('div');
							snippet_el.setAttribute('id','rewrite-results-snippet' + index + '-' + task.results.length);
							rewrite_snippet_el.appendChild(snippet_el);
						}
						let minus = snippet.length - 100;
				
						/*
						let ellipsis = '...';
						if(minus < 0){minus = 0; ellipsis = ''}
						*/
						if(minus < 0){minus = 0}
						//snippet_el.textContent = ellipsis + total_response.substr(minus,30);
						snippet_el.textContent = snippet.substr(minus,100);
					}
					else{
						console.error("handle_chunk: could not find element to place snippet into (probably feeling lucky). index: ", index);
					}
					
					if(typeof task.results != 'undefined'){ //  && task.origin != 'summarize_selection' && task.origin != 'summarize_document'
						let rewrite_result_text_el = document.getElementById('rewrite-result' + index + '-textarea' + task.results.length);
						if(rewrite_result_text_el != null){
							rewrite_result_text_el.value = total_response;
							/*
							if(typeof task.results[r] == 'string'){
								rewrite_result_text_el.value = task.results[r];
							}
							*/
						}
					}
				}
			}
		}
		else if(task.origin == "summarize_document"){
			//console.log("handle_chunk: got summarize_document chunk");
			
			if(removed_sure && typeof response_so_far == 'string' && response_so_far.length > 99){
				const response_so_far_cursor = search_in_doc(task,response_so_far);
				if(response_so_far_cursor){
					//highlight_selection(snippet_cursor);
					if(typeof response_so_far_cursor.to == 'number' && typeof window.doc_text == 'string' && response_so_far_cursor.to > (window.doc_text.length - 10)){
						//console.log("handle_chunk:  response_so_far_cursor.to: ", response_so_far_cursor.to, ", window.doc_text.length: ", window.doc_text.length);
						search_and_replace(task,response_so_far,total_response);
					}
				}
				else{
					console.warn("handle_chunk: summarize document: could not find response_so_far in document.  response_so_far: ", response_so_far);
					insert_into_document(task, '\n\n' + total_response, {"position":"end"});
				}
			}
			
			// dealing with Gemma's verbosity
			if(removed_sure && typeof total_response == 'string' && total_response.length > 300){
				const tail = total_response.substr(total_response.length - 10);
				if(tail.indexOf('\n---\n') != -1){
					console.warn("It seems that the translation is done, as it has sent --- in the output. It could be that it's hallucinating more content from here on out");
					flash_message('Stopped_the_assistant_early',1000);
					window.stop_assistant(task);
				}
			}
		}
	}
	
	
	
	
	if(window.document_tasks.indexOf(task.type) != -1){
		//window.set_chat_status(task, get_translation('Working_on_' + task.type) ); // moved to showing this as the assistant's desciption instead
	}
	
	for(let t = 0; t < window.task_queue.length; t++){
		//console.log(typeof window.task_queue[t].index, window.task_queue[t].index, " =?= ", typeof task.index, task.index);
		if(window.task_queue[t].index == task.index){
			//console.log("handle_chunk: found task with index: ", task.index);
			//console.log("handle_chunk: \n\n", window.task_queue[t], "\n\n",task);
			//window.task_queue[t]['last_response'] = total_response;
			
			if(typeof window.task_queue[t].type != 'string' || typeof window.task_queue[t].state != 'string'){
				consle.error("task without type or state detected: ",window.task_queue[t]);
				continue
			}
			
			add_body_class('doing-assistant');
			if(window.task_queue[t].type != 'chat' && typeof window.task_queue[t].destination == 'string' && window.task_queue[t].destination == 'document'){
				add_body_class('working-on-doc');
			}
			
			let assistant = window.settings.assistant;
			if(typeof window.task_queue[t].assistant == 'string'){
				assistant = window.task_queue[t].assistant;
			}
			
			let chatter = false;
			if(typeof window.task_queue[t].assistant == 'string' && typeof window.assistants[window.task_queue[t].assistant] != 'undefined' && window.assistants[window.task_queue[t].assistant] != null && typeof window.assistants[window.task_queue[t].assistant]['chatter'] == 'boolean' && window.assistants[window.task_queue[t].assistant]['chatter'] == true){
				chatter = true;
			}
			
			
			if(window.task_queue[t].type == 'proofread'){
				//console.log("handle_chunk: type is proofread. response_so_far: -->" + response_so_far + "<--");
				
				// Test if the proofread response also starts with the original text. If not, then all is not lost, but the entire response should be handled at once.
				if(typeof window.task_queue[t]['skip_handle_chunks'] == 'boolean' && window.task_queue[t]['skip_handle_chunks'] == true){
					
				}
				else{
					if(typeof handle_proofread_result != 'undefined'){
						if(response_so_far.length < 50){
							if(response_so_far.length > 40){
								let orig = strip_markdown(window.task_queue[t].text);
								orig = orig.substr(0,response_so_far.length);
								let similarity_score = similarity(orig,response_so_far);
								
								if(similarity_score < 0.5){
									window.task_queue[t]['skip_handle_chunks'] = true;
									if(window.settings.settings_complexity == 'developer'){
										//console.log("handle_chunk: type is proofread. similarity_score with original text: ", similarity_score, "\n", orig + ' =?= ' + response_so_far);
										flash_message(get_translation('The_proofread_AI_is_misbehaving'),1000,'warn');
									}
								}
							}
						}
						else{
							handle_proofread_result(window.task_queue[t],response_so_far,false);
						}
					
					}
				}
				
				
			}
			
			// CONTINUE CHUNK 
			else if(window.task_queue[t].type == 'continue'){
				//console.log("handle_chunk: type is continue. response_so_far: -->" + response_so_far + "<--");
				//console.log("- replacing: ", window.task_queue[t].text + response_so_far);
				//console.log("- with: ", window.task_queue[t].text + total_response);
				
				if(removed_sure && window.task_queue[t].text == null && typeof window.doc_text == 'string'){
					console.error("handle_chunk: about to do find-and-replace with the update chunk, but task.text was null. Attempting fix by taking doc_text as the task.text, which will result in appending to the end");
					window.task_queue[t].text = window.doc_text;
					if(response_so_far.length && window.task_queue[t].text.indexOf(response_so_far) != -1){
						window.task_queue[t].text = window.task_queue[t].text.substr(0, lastIndexOf(response_so_far));
					}
					
				}
				if(removed_sure && typeof window.task_queue[t].text == 'string' && typeof response_so_far == 'string'){
					//console.log("handle_chunk: continue:  task text: ", window.task_queue[t].text);
					//console.log("handle_chunk: continue:  response_so_far: ", response_so_far);
					//console.log("handle_chunk: continue:  total_response: ", total_response.length);
					
					//if(typeof window.task_queue[t].origin == 'rewrite_selection')
					if(window.task_queue[t].text.startsWith(total_response) && total_response.length < window.task_queue[t].text.length){
						//console.log("handle_chunk: continue: It could be that the AI is regurgitating the original text first: ", total_response.substr(total_response.length-20));
					}
					else{
						//console.log("handle_chunk: continue: starting replacement of text");
						
						if(total_response.length > 100){
							if(window.task_queue[t].text.startsWith(total_response.substr(0,100))){
								//console.error("handle_chunk: continue: the continued text seems to mirror the start of the seed text, at least for a bit");
								for(let c = 0; c < window.task_queue[t].text.length; c++){
									if(c < response_so_far.length){
										if(window.task_queue[t].text[c] != response_so_far[c] || c == window.task_queue[t].text.length - 1){
											//console.log("handle_chunk: continue: cutting away mirrored part of response_so_far: ", c, " of ", window.task_queue[t].text.length, ", -> ", response_so_far.substr(0,c));
											total_response = total_response.substr(c);
											response_so_far = response_so_far.substr(c);
											//console.log("response_so_far after cutting: ", c, " of ", window.task_queue[t].text.length, ", response_so_far: ", response_so_far.length, response_so_far);
											if(response_so_far.length == 1){
												response_so_far = '';
											}
										}
									}
								}
							}
						}
						
						search_and_replace(window.task_queue[t], window.task_queue[t].text + response_so_far, window.task_queue[t].text + total_response);
						
					}
					
				}
				
			}
	
			else if(window.task_queue[t].type == 'rewrite' && typeof window.task_queue[t].desired_results == 'number' && window.task_queue[t].desired_results == 1){
				if(window.task_queue[t].origin == 'selection' && typeof window.task_queue[t].destination == 'string' && window.task_queue[t].destination == 'chat'){ // TODO: this is never true at the moment
					rewrite_status_progress_container_el.textContent = response_so_far + chunk;
					window.write_on_pip_canvas(total_response);
				}
			}
	
			else if(window.task_queue[t].type == 'summarize' && typeof window.task_queue[t].desired_results == 'number' && window.task_queue[t].desired_results == 1){
				if(window.task_queue[t].origin == 'selection' && typeof window.task_queue[t].destination == 'string' && window.task_queue[t].destination == 'chat'){ // TODO: this is never true at the moment
					window.set_chat_status(window.task_queue[t], response_so_far + chunk );
					window.write_on_pip_canvas(total_response);
				}
			}
			
			else if(window.task_queue[t].type == 'translate' && typeof window.task_queue[t].desired_results == 'number' && window.task_queue[t].desired_results == 1){
				if(window.task_queue[t].origin == 'selection' && typeof window.task_queue[t].destination == 'string' && window.task_queue[t].destination == 'chat'){ // TODO: this is never true at the moment
					window.set_chat_status(window.task_queue[t], response_so_far + chunk );
					window.write_on_pip_canvas(total_response);
				}
			}
			
			
			else if(window.task_queue[t].type == 'rag_search_merging' || typeof window.task_queue[t].type == 'rag_search_rephrasing'){
				window.set_chat_status(window.task_queue[t], response_so_far + chunk );
				window.write_on_pip_canvas(total_response);
			}
			
	
			else if(window.task_queue[t].type == 'prompt_at_line'){
				
				if(typeof window.task_queue[t].pre_text == 'string'){
					if(search_and_replace(window.task_queue[t], window.task_queue[t].pre_text + response_so_far, window.task_queue[t].pre_text + total_response)){
						//console.log("handle_chunk: successfully inserted chunk into document for prompt_at_line: ", chunk);
						window.set_chat_status(window.task_queue[t], get_translation('Working_on_' + window.task_queue[t].type) ); // TODO: shouldn't the assistant's description say this now? Perhaps make a function for that to simplify this process. IDEA: Or maybe the interval could handle this?
					}
					else{
						console.error("handle_chunk: could not inject updated text into document (perhaps it changed after the window.task_queue[t] was added)");
						//window.set_chat_status(window.task_queue[t], response_so_far + chunk );
					}
				}
				else if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'blueprint' && response_so_far.length > 40){
					if(search_and_replace(window.task_queue[t], response_so_far, total_response)){
						//console.log("handle_chunk: successfully inserted chunk into document for prompt_at_line: ", chunk);
						window.set_chat_status(window.task_queue[t], get_translation('Working_on_' + window.task_queue[t].type) ); // TODO: shouldn't the assistant's description say this now? Perhaps make a function for that to simplify this process. IDEA: Or maybe the interval could handle this?
					}
					else{
						console.error("handle_chunk: task had no pre_text, and search_and_replace also failed. Attempting to insert_into_document at the end.");
						//window.set_chat_status(window.task_queue[t], response_so_far + chunk );
						insert_into_document(window.task_queue[t], ' \n\n' + total_response + ' \n', {'position':'end'});						
					}
				}
				window.write_on_pip_canvas(total_response);
				
			}
	
	
			// CHAT CHUNK
	
			else if(window.task_queue[t].type == 'chat'){
		
				window.write_on_pip_canvas(response_so_far);
				
				let pre_lines = [total_response];
				let incomplete_sentence = '';
				
				try{
					pre_lines = split_into_sentences_and_punctuation(total_response);
					//console.log("handle_chunk: initial split into sentences: ", pre_lines);
					
					if(pre_lines.length && pre_lines.length % 2 == 0){
						//console.log("handle_chunk: pre-lines length is even, clearing chat status");
						if(chatter){
							window.set_chat_status(window.task_queue[t],'');
						}
					}
					else{
						if(typeof pre_lines[pre_lines.length-1] == 'string'){
							//console.log("pre-lines length is uneven. Likely a sentence is progress: ", pre_lines[pre_lines.length-1]);
							incomplete_sentence = pre_lines[pre_lines.length-1].trim();
							//console.log("incomplete_sentence: ", incomplete_sentence);
							window.task_queue[t]['incomplete_sentence'] = incomplete_sentence;
							if(chatter){
								//console.log("chunk: chat: and posting each chat as line -> updating status with single line");
								if(!incomplete_sentence.startsWith('<') && !incomplete_sentence.endsWith('>')){
									window.set_chat_status(window.task_queue[t],pre_lines[pre_lines.length-1]);
								}
								else{
									console.warn("Yikes, the AI model likely outputted some start or end token");
								}
							}
						}
						
					}
					
					const even_length = pre_lines.length - (pre_lines.length % 2);
					//console.log("even_length: ", even_length);
					
					//let good_sentences = '';
					for(let i=0;i<even_length;i=i+2){
						
						if(pre_lines[i].length > 0 && pre_lines[i+1].length == 1){
							//console.log("handle_chunk: pre_lines[i]: ", pre_lines[i]);
							//console.log("handle_chunk: pre_lines[i+1]: ", pre_lines[i+1]);
							try{
								let sentence_parts = [pre_lines[i], pre_lines[i + 1]];
								let full_sentence = pre_lines[i] + pre_lines[i + 1];
								//console.log("full_sentence: ", i/2, full_sentence);
								//good_sentences += full_sentence;
								let sentence_already_added = false;
								for(let s=0;s<window.task_queue[t].sentences.length;s++){
									if(typeof window.task_queue[t].sentences[s].sentence == 'string' && window.task_queue[t].sentences[s].sentence == full_sentence){
										sentence_already_added = true;
									}
								}
								
								if(sentence_already_added == false){
									//console.log("handle_chunk: NEW SENTENCE: ", full_sentence);
									
									if(chatter){
										//console.log("chunk: chat: posting each chat as line, and new sentence, so -> clearing status");
										if(!full_sentence.startsWith('<') && !full_sentence.endsWith('>')){
											add_chat_message(assistant,assistant,full_sentence);
											incomplete_sentence = '';
											window.task_queue[t]['incomplete_sentence'] = '';
										}
										
										window.set_chat_status(window.task_queue[t],'');
									}
									
									
									window.task_queue[t]['sentences'].push( // push a new dict to the sentences array.
										{
											'sentence':full_sentence,
											'audio':null,
											'spoken':false,
											'task_index':window.task_queue[t].index,
											'sentence_index':window.sentence_counter,
											'timestamp':Date.now(),
											'state':'added'
										}
									);
									
									
									window.sentence_counter++;
									
									
									if(typeof task.silent == 'boolean' && task.silent){
										//console.log("handle_chunk: task is silent, it should not be spoken out loud");
									}
									
									else if(window.speaker_enabled && typeof window.task_queue[t].speech_interrupted == 'boolean' && window.task_queue[t].speech_interrupted == true){
										//console.log("handle_chunk: new sentence, but task has speech_interrupted set to true, so not creating TTS tasks for: ", full_sentence);
									}
									
									else if(window.speaker_enabled && typeof window.task_queue[t].index <= window.interrupt_speaking_task_index){
										//console.log("handle_chunk: new sentence, but task index is smaller than window.interrupt_speaking_task_index: ", window.interrupt_speaking_task_index, full_sentence);
									}
									else if(window.speaker_enabled){
										//console.log("handle_chunk: new sentence, going to turn it into smaller TTS sentences: ", full_sentence);
										// Split the really basic sentence further into smaller parts to speak individually
										
										if(typeof full_sentence == 'string' && full_sentence.trim().length){
											let smaller_sentence_parts = split_into_sentences(full_sentence);
											//console.log("full_sentence split into smaller parts: ", smaller_sentence_parts);
											for(let sp = 0; sp < smaller_sentence_parts.length; sp++){
												if(smaller_sentence_parts[sp].trim().length){
													//console.log("handle_chunk: NEW SENTENCE -> CREATING SPEAKING TASK: ", smaller_sentence_parts[sp]);
													let tts_task = {
														'prompt':null,
														'type':'speak',
														'state':'should_tts',
														'sentence': clean_up_string_for_speaking(smaller_sentence_parts[sp]),
														'destination':'audio_player'
													}
													if(typeof window.task_queue[t].index == 'number'){
														tts_task['parent_index'] = window.task_queue[t].index;
													}
										
													if(typeof window.task_queue[t].origin == 'string'){
														tts_task.origin = window.task_queue[t].origin;
													}
										
													window.add_task(tts_task);
												}
												else{
													//console.log("handle_chunk: skipping empty smaller sentence part");
												}
											}
										}
										else{
											//console.log("handle_chunk: full sentence was empty or invalid? ", full_sentence);
										}
										
										
									}
									
								}
								
							}
							catch(e){
								console.error("handle_chunk: caught error in handling pre_lines: ", pre_lines);
							}
		
						}
						else{
							//console.warn("pre-line was short");
						}
					}
					
					// Attempt to apply markdown styling to the partial response
					let good_sentences = ''; //total_response.substr(0,total_response.lastIndexOf(incomplete_sentence));
					let appendix = '';
					if(chatter == false && total_response.lastIndexOf('\n\n') != -1 && typeof window.task_queue[t].assistant == 'string' && typeof window.assistants[window.task_queue[t].assistant] != 'undefined' && typeof window.assistants[window.task_queue[t].assistant].markdown_supported == 'boolean' && window.assistants[window.task_queue[t].assistant].markdown_supported){
						
						good_sentences = total_response.substr(0,total_response.lastIndexOf('\n\n'));
						appendix = total_response.substr(total_response.lastIndexOf('\n\n'));
						
						window.set_chat_status(window.task_queue[t], '<div class="markdown-status">' + window.apply_markdown(good_sentences) + appendix + '</div>');
					}
					else if(chatter == false){
						window.set_chat_status(window.task_queue[t], total_response);
					}
					
				}
				catch(e){
					console.error("handle_chunk: caught error trying to split into sentences: ", e);
				}
		
		
			}
			else if(window.task_queue[t].type == 'image_to_text'){
				if(window.task_queue[t].origin == 'chat' && typeof window.task_queue[t].image_to_text_index == 'number'){
					
					const target_output_el = document.getElementById('image-to-text-result-output' + window.task_queue[t].image_to_text_index);
					if(target_output_el){
						target_output_el.innerHTML = '';
						target_output_el.textContent = response_so_far; //total_response;
					}
					else{
						console.error("could not find image-to-text-result-output element to place image_to_text chunk into.");
					}
				}
				else if(window.task_queue[t].origin == 'camera'){
					live_image_to_text_output_el.value = response_so_far; //total_response;
				}
				window.write_on_pip_canvas(response_so_far);
			}
		}
	}
	
}
window.handle_chunk = handle_chunk;























//
//  HANDLE COMPLETED TASK
//



async function handle_completed_task(task, result=null,task_meta=null,extra=null){
	if(window.settings.settings_complexity == 'developer'){
		//console.log("\n\n#\n##\n###\n####\nin handle_task_completed.  task: ", task, typeof result);
		//console.log(" - TASK DONE: ", task);
	
		if(typeof result == 'string'){
			//console.log(" - TASK RESULT: ", result.substr(0,40) + "...");
		}
		else{
			//console.log(" - TASK RESULT: ", result);
		}
		
		if(task_meta != null){
			//console.log(" - TASK META: ", task_meta);
		}
		if(extra != null){
			//console.log(" - EXTRA: ", extra);
		}
	}
	
    //console.log(" - window.speaker_enabled: ", window.speaker_enabled);
	//console.log(" - window.audio_player_busy: ", window.audio_player_busy);
	//console.log(" - window.whisper_worker_busy: ", window.whisper_worker_busy);
	//console.log(" - window.llama_cpp_busy: ", window.llama_cpp_busy);
	//console.log(" - window.web_llm_busy: ", window.web_llm_busy);
	//console.log(" - window.tts_worker_busy: ", window.tts_worker_busy);
	
	window.previous_response_so_far = '';
	
	if(task == null){
		console.error("ERROR, handle_task_completed: task was null. (set to null before onComplete was called)");
		return
	}
	
	if(typeof task.index == 'undefined'){
		console.warn("handle_completed_task: task did not have an index. Likely received the first pipeline warmup transcription. Aborting.");
		return;
	}

	// Sometimes the models output some special tokens
	let result_object = null;
	if(typeof result == 'undefined'){
		console.error("handle_completed_task: result was undefined");
	}
	if(typeof result == 'object' && result != null){
		result_object = result;
		
		if(typeof result.text == 'string'){
			result = result.text;
		}
		if(window.settings.settings_complexity == 'developer'){
			console.warn("dev: handle_completed_task: received a result object: ", result_object);
		}
		
		
	}
	
	// Remove stray end tokens from result
	if(typeof result == 'string'){
		
		if(result.startsWith('? ')){
			result = result.replace('? ','');
		}
		
		if(result.length > 20){
			let total_response_tail = result.substr(result.length - 12);
			/*
			if( total_response_tail.indexOf('<|user') != -1 
				|| total_response_tail.indexOf('<|im_') != -1 
				|| total_response_tail.indexOf('<|end') != -1 
				|| total_response_tail.indexOf('<|prompt') != -1 
				|| total_response_tail.indexOf('<|user') != -1 
				|| total_response_tail.indexOf('<|answer') != -1 
			){
			*/
			if( total_response_tail.indexOf('<|') != -1){
				
				console.error("handle_completed_response: saw special tokens in result tail: -->" + total_response_tail + "<--");
				result = result.substr(0,(result.lastIndexOf('<|') ));
			}
			
			if( total_response_tail.indexOf('[INST]') != -1){
				result = result.substr(0,(result.lastIndexOf('[INST]') ));
			}
			if( total_response_tail.indexOf('[/INST]') != -1){
				result = result.substr(0,(result.lastIndexOf('[/INST]') ));
			}
			if( total_response_tail.indexOf('</s>') != -1){
				result = result.substr(0,(result.lastIndexOf('</s>') ));
			}
			if( total_response_tail.indexOf('<human') != -1){
				result = result.substr(0,(result.lastIndexOf('<human') ));
			}
			
		}
		
		
		
		if(result.endsWith('<|')){
			console.error("handle_completed_response: still saw <| as the last characters of the result");
			result = result.substr(0,result.length-2);
		}
		
		if(result.indexOf('<|') > 10){
			console.warn("handle_completed_task: there is <| in the result");
			/*
			result = result.replaceAll('<|endoftext|>','');
			result = result.replaceAll('<|im_end|>','');
			//result = result.replaceAll('<|prompt|>','');
			result = result.replaceAll('<|end|>','');
			result = result.replaceAll('<|user|>','');
			result = result.replaceAll('<|assistant|>','');
			*/
			result = result.substr(0,result.indexOf('<|'));
			result = result.replaceAll('</s>',''); // for good measure
		}
		
		if(result.indexOf('<|') != -1){
			console.warn("handle_completed_task: there is still <| in the result");
		}
		
		if(result.startsWith('[INST] ')){
			console.warn("handle_completed_task: had to strip [INST] from beginning of result string");
			result = result.replace('[INST] ','');
		}
		if(result.endsWith(' [/INST]')){
			console.warn("handle_completed_task: had to strip [/INST] from end of result string");
			result = result.substr(0,result.lastIndexOf(' [/INST]'));
		}
		
		// <|prompt|>
		if(result.trim().startsWith('<|') && result.indexOf('|>') != -1 && result.indexOf('|>') < 20){
			console.warn("handle_completed_task: had to strip <|...|> from beginning of result string: ", result.substr(0,20));
			result = result.substr( (result.indexOf('|>') + 2) );
		}
		
		result.replaceAll('<|prompt|>',' ');
		result.replaceAll('<|answer|>',' ');
		
	}
	
	
	//let as = window.assistants[task.assistant];
	/*
	if(typeof task.assistant == 'string' && task.assistant != window.currently_loaded_assistant){
		if(task.assistant != 'speaker' && task.assistant != 'translator' && task.assistant != 'image_to_text_ocr' ){ // && task.assistant != 'imager'
			//console.warn("WARNING, THE TASK WAS HANDLED BY ANOTHER ASSISTANT THAN WAS INTENDED:");
			//console.warn("- currently_loaded_assistant: ", window.currently_loaded_assistant);
			//console.warn("- task.assistant: ", task.assistant);
		}
	}
	*/
	
	
	let date_string = make_date_string();
	
	
	// loop over all tasks to find the index of the one provided 
	
	for(let t = 0; t < window.task_queue.length; t++){
		//console.log(typeof window.task_queue[t].index, window.task_queue[t].index, " =?= ", typeof task.index, task.index);
		if(window.task_queue[t].index == task.index){
			
			//console.error("\n\n\n\n", task.index, "\n\n\n\n");
			//console.log("handle_completed_task: found task again in queue. It's index: ", task.index, ", state: " + task.state, ", (should be the same as the real task: " + window.task_queue[t].state + ")");
			//console.log("TASK TO UPDATE: ", JSON.stringify(window.task_queue[t],null,4));
			
			let chatter = false;
			if(typeof window.task_queue[t].assistant == 'string' && typeof window.assistants[window.task_queue[t].assistant] != 'undefined' && window.assistants[window.task_queue[t].assistant] != null && typeof window.assistants[window.task_queue[t].assistant]['chatter'] == 'boolean' && window.assistants[window.task_queue[t].assistant]['chatter'] == true){
				chatter = true;
			}
			
			const state_before = '' + window.task_queue[t].state;
			//console.log("handle_completed_task: state_before: ", state_before);
			
			if(typeof window.task_queue[t].type != 'string' || typeof window.task_queue[t].state != 'string'){
				console.error("handle_completed_task: spotted task with invalid type or state. Setting it's state to failed");
				window.task_queue[t]['state'] == 'failed';
			}
			
			if(typeof window.task_queue[t]['results'] == 'undefined'){
				//console.log("handle_completed_task: adding missing results array to task. Must have been a task that was not supposed to split into sentences (e.g. code or recipe)");
				window.task_queue[t]['results'] = [];
			}
			
			if(typeof window.task_queue[t]['handled_by'] == 'undefined'){
				//console.warn("handle_completed_task: adding missing handled_by array to task.");
				window.task_queue[t]['handled_by'] = [];
			}
			
			
			if(typeof window.task_queue[t].in_progress == 'boolean'){
				//console.log("handle_completed_task: setting in_progress to false");
				window.task_queue[t].in_progress = false;
			}
			
			
			//if((window.task_queue[t]['state'] == 'doing_assistant' || window.task_queue[t]['state'] == 'doing_summary' || window.task_queue[t]['state'] == 'doing_rewrite' || window.task_queue[t]['state'] == 'doing_proofread') && typeof result == 'string' && result.startsWith('Sure, here') && result.indexOf(':\n') != -1){
			if((window.task_queue[t]['state'] == 'doing_assistant' || window.task_queue[t]['state'] == 'doing_summary' || window.task_queue[t]['state'] == 'doing_rewrite' || window.task_queue[t]['state'] == 'doing_proofread') && typeof result == 'string' && result.startsWith('Sure, here') && result.indexOf(':\n') != -1){
			
				//console.log("removing 'Sure, here' etc from beginning of result: ", result);
				
				if(result.indexOf('.') != -1 && result.indexOf(':\n') > result.indexOf('.')){
					console.warn("spotted a . before the :, so not removing 'Sure, here' etc"); // for Gemma
				}else{
					result = result.substr(result.indexOf(':\n') + 1);
					//console.log("'Sure, here' snipped from result: ", result);
					if(typeof result == 'string' && result.length){
						while(result.startsWith('\n')){
							//console.log("snipping newline from beginning of 'Sure, here' snipped result");
							result = result.substr(1);
						}
					}
					
				}
				
			}
			
			
			if(typeof result == 'string' && result.startsWith('Sure, here') && result.indexOf(':\n') != -1){
				console.warn("Still detected 'Sure, here' in result.  task: ", window.task_queue[t].state, window.task_queue[t]);
			}
			
			
			// Booleans to direct the flow
			let is_blueprint_command = false;
			if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'blueprint'){
				is_blueprint_command = true;
			}
			
			else if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'voice' && typeof result == 'string' && typeof window.task_queue[t].assistant == 'string' && window.task_queue[t].assistant == 'scribe'){
				result = window.remove_brackets_from_string(result);
			}
			
			
			let assistant_id = window.settings.assistant;
			if(typeof window.task_queue[t].assistant == 'string'){
				assistant_id = window.task_queue[t].assistant;
			}
			
			set_chat_status(window.task_queue[t],'');
			remove_body_class('working-on-doc');
			
			
			//console.log("handle_completed_task: state_before, state: " + state_before + ", " + window.task_queue[t].state);
			
			
			
			//
			//  POST STT ROUTING - change_task_after_stt
			//
			//  ALSO HANDLES BLUEPRINT TASKS, SINCE THOSE ARE MOSTLY 'VOICE COMMANDS'
			
			if(window.task_queue[t].state == 'doing_stt' || window.task_queue[t].state == 'should_blueprint'){
				//window.task_queue[t]['handled_by'].push('stt');
				
				let inform_parent = true; // this can be disabled by blueprint tasks, to manage how many results are sent to the parent. With 'normal' commands they are executed immediately. But some, like 'continue' require actual effort by an AI first. In those cases we only want handle_complete_task to also update the parent when the task is actually done.
				//if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'voice'){
				remove_body_class('doing-stt');
				//}
				
				if(window.task_queue[t].state == 'doing_stt'){
					window.task_queue[t]['handled_by'].push('stt');
				}
				
				
				
				let bad_stt_result = false;
				
				// TODO: this does not take into account more complex tasks yet
				if(typeof result != 'string'){
					console.error("handle_completed_task: bad stt result: transcript was not a string.  result: ", result);
					console.error("SETTING STT TASK STATE TO FAILED");
					window.task_queue[t]['state'] = 'failed';
					bad_stt_result = true;
					//window.task_queue[t].splice(t,1);
					//return;
				}
				if(typeof result == 'string' && result.trim().length < 2){ //  && window.task_queue[t].assistant != 'image_to_text_ocr'
					console.error("handle_completed_task: transcript was too short: -->" + result + "<--");
					console.error("SETTING STT TASK STATE TO FAILED");
					bad_stt_result = true;
				}
				
				if(
					typeof result == 'string' 
					&& window.settings.assistant != 'scribe'
					&& (
						result.toLowerCase().trim() == 'you' 
						|| result.toLowerCase().trim() == 'you.' 
						|| result.toLowerCase().trim() == 'silence'
						|| result.toLowerCase().trim() == 'silence.' 
						|| result.toLowerCase().trim() == 'paragraph' 
						|| result.toLowerCase().trim() == 'paragraph.'
						|| result.toLowerCase().trim() == 'move.'
						|| result.toLowerCase().trim() == 'okay.'
						|| (result.length < 30 && result.trim().startsWith('*') && result.trim().endsWith('*'))
					)
				){
					console.warn("heard a single word which often indicates a whisper issue ('you','silence','paragraph','move','okay'). setting bad_stt_result to true.");
					bad_stt_result = true;
				}
				
				
				// Remove original audio from the task if it still exists
				if(typeof task_queue[t].recorded_audio != 'undefined'){
					//console.error("handle_task_complete: post-stt: task still has it's originally recorded audio. Deleting the recording now: ", task_queue[t]);
					delete task_queue[t].recorded_audio;
					
					//task_queue[t].prompt = transcript;
					//task_queue[t].transcript = transcript;
					//delete task_queue[t].audio_recording;
				}
				
				if(typeof result == 'string'){
					//result = result.trim();
				}
				else if(result == null){
					console.error("stt result was not a string (null, or array?). Setting task to failed. result: ", result); // might be harsh. If it's an array, it could be turned into a string.
					task_queue[t].state = 'failed';
					bad_stt_result = true;
				}
				else{
					
				}
				
				
				//console.log("handle_completed_task: bad_stt_result? ", bad_stt_result);
				
				let note = ''; // used by scribe assistant. If this is not an empty string later, it will be injected into the currently open document
				
				if(typeof result != 'string'){
					console.warn("ignoring STT result that was not a string: ", result);
				}
				else{
					if(typeof task_queue[t].origin == 'string' && is_blueprint_command == false && (task_queue[t].origin == 'voice' || task_queue[t].origin.endsWith('file'))){ // origin can also be chat, in order to let the chat prompt get parsed by the STT commands pipeline
						
						if(window.settings.assistant == 'scribe'){
							note = result;
							if(task_queue[t].origin == 'voice' && task_queue[t].state != 'parent'){
								task_queue[t].state = 'completed';
							}
							//console.log("scribe: heard normal sentence. note is now: ", note);
						}
						
					}
					
					
					
					if(typeof task_queue[t].origin == 'string' && task_queue[t].origin == 'voice'){
						if(result.startsWith(' ')){
							result = result.substr(1);
						}
						if( (result.startsWith('(') && result.endsWith(')')) || (result.startsWith('[') && result.endsWith(']')) ){ //  || (result.startsWith('*') && result.endsWith('*')) || (result.startsWith('♪') && result.endsWith('♪')) 
							//console.log("post-stt: stt returned a meta-sound: ", result);
							
							if(result.toLowerCase() != '[blank_audio]' && result.toLowerCase() != '[clicking]' && result.toLowerCase() != '[click]' && result.toLowerCase() != '[sound]'){
								if(result.indexOf('] (') != -1 || result.indexOf(') [') != -1 || result.indexOf(') (') != -1 || result.indexOf('] [') != -1){
									console.warn("result from STT contained multiple meta indicators: ", result);
								}
								else if(result.length > 4 && result.length < 20){
									microphone_meta_hint_el.textContent = result.substr(1,result.length-2).trim();
									setTimeout(()=>{
										microphone_meta_hint_el.textContent = '';
									},4000);
									
								}
								
							}
					
					
							task_queue[t].sentence = result;
					
							if(typeof task_queue[t].parent_index != 'number'){
								if(window.settings.assistant == 'scribe'){
									task_queue[t].state = 'completed';
								}
								else{
									task_queue[t].state = 'failed';
									bad_stt_result = true;
								}
							}
							
					
						}
						
						
						result = window.remove_brackets_from_string(result);
						//console.log("brackets removed from result (in theory...): ", result);
						task_queue[t].transcript = '' + result.trim();
						//task_queue[t].transcript = task_queue[t].transcript.trim();
						
						
					}
					
				
					
					let extracted_time = null;
					// If it was a voice command, try and determine what type the task is
					
					let transcript = '';
					
					if(typeof result == 'string' && window.settings.assistant != 'scribe'){
						transcript = result.toLowerCase();
						if(transcript.endsWith('.')){
							//console.log("STT transcript ends with a period: ", transcript);
							transcript = transcript.substr(0,transcript.length-1);
							//console.log("STT transcript period should be removed now: ", transcript);
						}
						//console.log("transcript: ", transcript);
						
						while (transcript.startsWith(' ')){
							transcript = transcript.substr(1);
						}
						
						if(transcript == ''){
							bad_stt_result = true;
						}
						else{
							
							if(transcript.indexOf('wekker ') != -1){
								//console.log("spotted wekker in transcript");
								if(transcript.endsWith(' seconden')){
									transcript = transcript.replaceAll(' seconden',' seconds');
								} 
								else if(transcript.endsWith(' minuten')){
									transcript = transcript.replaceAll(' minuten',' minutes');
								} 
								else if(transcript.endsWith(' minuut')){
									transcript = transcript.replaceAll(' minuut',' minute');
								} 
								else if(transcript.endsWith(' 1 uur')){
									transcript = transcript.replaceAll(' 1 uur',' 1 hour');
								} 
								else if(transcript.endsWith(' uur')){
									transcript = transcript.replaceAll(' uur',' hours');
								} 
								else if(transcript.endsWith(' uren')){
									transcript = transcript.replaceAll(' uren',' hours');
								} 
								else if(transcript.endsWith(' dag')){
									transcript = transcript.replaceAll(' dag',' day');
								} 
								else if(transcript.endsWith(' dagen')){
									transcript = transcript.replaceAll(' dagen',' days');
								} 
							}
							
							if(typeof window.chrono == 'undefined'){
								await add_script('./js/chrono.js');
							}
							
							if(typeof window.chrono != 'undefined'){
								extracted_time = window.chrono.parseDate(transcript, new Date(), { forwardDate: true });
							}
							else{
								console.error('window.chrono was still undefined');
							}
							
						}
						
						//console.log("heard -> transcript:  -->" + transcript + "<--  , transcript.length: " , transcript.length);
					}
					else{
						//console.warn("heard -> transcript: assistant is scribe, so transcript has been set to empty to avoid voice commands");
					}
					
					
					if(bad_stt_result){
						if(window.settings.settings_complexity == 'developer'){
							console.error("dev: handle_completed_task: bad_stt_result, doing nothing with the STT result: ", result);
						}
						task_queue[t].state = 'failed';
						set_state(LISTENING);
					}
					else{
						
						let input_dialog_open = false;
						let vex_input_el = null;
						let vex_cancel_el = null;
						let vex_submit_el = null;
					
						if(document.body.classList.contains('vex-open')){
							vex_input_el = document.querySelector('.vex-dialog-prompt-input');
							vex_cancel_el = document.querySelector('.vex-dialog-button-primary.vex-dialog-button.vex-first[type="button"]');
							vex_submit_el = document.querySelector('.vex-dialog-button-secondary.vex-dialog-button.vex-last[type="submit"]');
						}
					
					
						//console.log("active_destination before: ", window.active_destination);
						if(window.settings.assistant == 'scribe'){
							window.active_destination == 'document';
							//console.log("assistant is scribe, so changing active destination to document");
						}
					
					
					
						
							
					
						// VOICE COMMAND _ CREATE A DOCUMENT
						
						if(
							transcript == 'new document' 
							|| transcript == 'create document' 
							|| transcript == 'create new document' 
							|| transcript == 'create a new document' 
							|| transcript == 'create a new file' 
							|| transcript == 'start a new file' 
							|| transcript == 'start a new document' 
							|| transcript == 'make a new document' 
							
							|| transcript == 'nieuw document' 
							|| transcript == 'open een nieuw document' 
							|| transcript == 'start een nieuw document' 
							|| transcript == 'start document'
						){
							
							if(is_blueprint_command){
								create_new_document('', ('blueprint ' + makeid(4) + ' ' + make_date_string() + '.txt'));
							}
							else{
								create_new_document('');
							}
							
							
							window.active_destination = 'document';
							//task_complete = true; // TODO: is this still used?
							set_state(LISTENING);
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
							
						}
						
						
						
						
						// VOICE COMMAND _ CREATE DOCUMENT CALLED ....
						
						else if(
							transcript.startsWith('create a new document called ') 
							|| transcript.startsWith('create a new document named ') 
							|| transcript.startsWith('create a new file called ') 
							|| transcript.startsWith('create a new file named ') 
							|| transcript.startsWith('maak een nieuw document genaamd ') 
							|| transcript.startsWith('maak een nieuw document met de naam ') 
							|| transcript.startsWith('maak een nieuw document getiteld ') 
							|| transcript.startsWith('maak een nieuw document met als naam ')
						){
							
							let new_doc_filename = transcript.replace('create a new document called ','');
							new_doc_filename = new_doc_filename.replace('create a new document named ','');
							new_doc_filename = new_doc_filename.replace('create a new file called ','');
							new_doc_filename = new_doc_filename.replace('create a new file named ','');
							new_doc_filename = new_doc_filename.replace('maak een nieuw document genaamd ','');
							new_doc_filename = new_doc_filename.replace('maak een nieuw document met als naam ','');
							new_doc_filename = sanitize_filename(new_doc_filename);
							
							if(new_doc_filename.length > 1 && new_doc_filename.length < 81){
								if(!new_doc_filename.endsWith('.txt') && !new_doc_filename.endsWith('.srt') && !new_doc_filename.endsWith('.notes')){
									if(new_doc_filename.charAt(new_doc_filename.length - 1) == '.'){
										new_doc_filename = new_doc_filename + 'txt';
									}
									else{
										new_doc_filename = new_doc_filename + '.txt';
									}
									
									if(is_blueprint_command){
										await create_new_document('', 'blueprint ' + makeid(4) + ' ' + new_doc_filename);
									}
									else{
										await create_new_document('',new_doc_filename);
									}
								}
								else{
									await create_new_document('',new_doc_filename);
								}
								
								
								
								/*
								if(valid_new_name(new_doc_filename)){
									create_new_document('',new_doc_filename);
								}
								else{
									flash_message(get_translation("Invalid_file_name") + ": " + new_doc_filename, 3000,'warning');
								}
								*/
								window.task_queue[t].state = 'completed';
							}
							else{
								flash_message(get_translation("Invalid_file_name_length") + ": " + new_doc_filename, 4000,'warning');
								window.task_queue[t].state = 'failed';
							}
							
							window.active_destination = 'document';
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
						
							set_state(LISTENING);
						}
					
						
						
						
						// VOICE COMMAND _ OPEN DOCUMENT
						
						else if(
							!document.body.classList.contains('show-document')
							&& window.settings.docs.recent.length 
							&& (
								transcript == 'open document' 
								|| transcript == 're-open document' 
								|| transcript == 'open the document' 
								|| transcript == 're-open the document' 
								|| transcript == 'open the last document' 
								|| transcript == 're-open the last document' 
								|| transcript == 'open the current document' 
								|| transcript == 're-open the current document' 
								|| transcript == 'open file' 
								|| transcript == 'open the file' 
								|| transcript == 'open the last file' 
								|| transcript == 'open the current file' 
								|| transcript == 're-open file' 
								|| transcript == 're-open the file' 
								|| transcript == 're-open the last file' 
								|| transcript == 're-open the current file' 
								
								|| transcript == 'open het document'
								|| transcript == 'heropen het document'
								|| transcript == 'open het laatste document'
								|| transcript == 'heropen het laatste document'
								|| transcript == 'open het huidige document'
								|| transcript == 'heropen het huidige document'
								|| transcript == 'open bestand'
								|| transcript == 'heropen bestand'
								|| transcript == 'open het bestand'
								|| transcript == 'heropen het bestand'
								|| transcript == 'open het laatste bestand'
								|| transcript == 'heropen het laatste bestand'
								|| transcript == 'open het huidige bestand'
								|| transcript == 'heropen het huidige bestand'
							)
							
						){
							
							if(window.busy_doing_blueprint_task == false && window.blueprint_tasks_left == 0 && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
								const blueprint_prompt_command = '\n\nClose file\n\n';
								flash_message(get_translation("Added_command_to_blueprint"),1000);
								if(!window.doc_text.endsWith(blueprint_prompt_command)){
									insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, blueprint_prompt_command);
								}
								else{
									//console.log("blueprint already ended with this prompt command");
								}
							}
							else{
								window.active_destination = 'chat';
								remove_body_class('show-document');
							}
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						// BLUEPRINT VOICE COMMAND _ OPEN FILE OPEN DOCUMENT
						
						else if(is_blueprint_command && transcript.startsWith('open ') && keyz(files).indexOf( result.replace('open ','').replace('Open ','').trim() ) != -1){
							inform_parent = false;
							//console.log("blueprint is attempting to open a file: ", result.replace('open ','').replace('Open ','').trim() );
							
							open_file( result.replace('open ','').replace('Open ','').trim() )
							.then((value) => {
								//console.log("blueprint command opened a file successfully: ", result.replace('open ','').replace('Open ','').trim() );
								setTimeout(() => {
									// Give the file some time to fully load
									window.task_queue[t].state = 'completed';
									window.busy_doing_blueprint_task = false;
								},4000);
								
							})
							.catch((err) => {
								console.error("blueprint command failed to open a file: ", err, result.replace('open ','').replace('Open ','').trim() );
								window.task_queue[t].state = 'failed';
								window.busy_doing_blueprint_task = false;
							})
						}
						
						
						// VOICE COMMAND _ CLOSE DOCUMENT
						
						else if(transcript == 'close the document' || transcript == 'close document' || transcript == 'close the file' || transcript == 'close file' || transcript == 'close the document' 
							|| transcript == 'close the picture' || transcript == 'close picture' || transcript == 'close the photo' || transcript == 'close photo'  
							|| transcript == 'sluit bestand' || transcript == 'sluit document'
						){
							
							if(window.busy_doing_blueprint_task == false && window.blueprint_tasks_left == 0 && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
								const blueprint_prompt_command = '\n\nClose file\n\n';
								flash_message(get_translation("Added_command_to_blueprint"),1000);
								if(!window.doc_text.endsWith(blueprint_prompt_command)){
									insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, blueprint_prompt_command);
								}
								else{
									//console.log("blueprint already ended with this prompt command");
								}
							}
							else{
								window.active_destination = 'chat';
								remove_body_class('show-document');
							}
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						// START THE CAMERA
						// This one might not work, since camera streams should be started from a button
						
						else if( (transcript == 'start the camera' || transcript == 'start camera' || transcript == 'show the camera' || transcript == 'show camera' || transcript == 'start de camera' || transcript == 'open the camera' || transcript == 'open de camera') ){
							window.active_destination = 'chat';
							
							if(window.settings.assistant.startsWith('image_to_text')){
								add_body_class('hide-camera-still');
							}
							
							if(window.busy_doing_blueprint_task == false && window.blueprint_tasks_left == 0 && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
								const blueprint_prompt_command = '\n\nStart camera\n\n';
								flash_message(get_translation("Added_command_to_blueprint"),1000);
								if(!window.doc_text.endsWith(blueprint_prompt_command)){
									insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, blueprint_prompt_command);
								}
								else{
									//console.log("blueprint already ended with this prompt command");
								}
							}
							
							
							if(window.innerWidth < 981){
								close_sidebar();
							}
							window.load_and_start_camera();
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						
						// VOICE COMMAND _ STOP CAMERA
						else if( (transcript == 'stop the camera' || transcript == 'stop camera' || transcript == 'close the camera' || transcript == 'hide camera' || transcript == 'stop de camera' || transcript == 'disable the camera' || transcript == 'sluit de camera' || transcript == 'quit the camera') ){
							//window.active_destination = 'chat';
							if(typeof window.stop_camera != 'undefined'){
								window.stop_camera();
							}
							
							if(window.busy_doing_blueprint_task == false && window.blueprint_tasks_left == 0 && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
								const blueprint_prompt_command = '\n\nStop camera\n\n';
								flash_message(get_translation("Added_command_to_blueprint"),1000);
								if(!window.doc_text.endsWith(blueprint_prompt_command)){
									insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, blueprint_prompt_command);
								}
								else{
									//console.log("blueprint already ended with this prompt command");
								}
							}
							
							
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						// VOICE COMMAND _ TAKE PICTURE
						else if( (transcript == 'take a picture' || transcript == 'take a photo' || transcript == 'neem een foto' || transcript == 'maak een foto')){
							
							// place prompt in blueprint document if it's open
							// Add prompt to blueprint file
							if(window.busy_doing_blueprint_task == false && window.blueprint_tasks_left == 0 && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
								const blueprint_prompt_command = '\n\nTake a picture\n\n';
								if(!window.doc_text.endsWith(blueprint_prompt_command)){
									insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, blueprint_prompt_command);
								}
								else{
									//console.log("blueprint already ended with this prompt command");
								}
							}
							else{
								window.active_destination = 'chat';
								
								if(window.innerWidth < 981){
									close_sidebar();
								}
							
								if(window.settings.assistant.startsWith('image_to_text')){
									remove_body_class('hide-camera-still');
									window.get_camera_jpeg_blob();
								}
								else{
									window.load_and_start_camera()
									.then((value) => {
										console.error("STT: take a picture -> started camera, calling take_picture next. value: ", value);
										setTimeout(() => {
											window.take_picture();
										},100);
									})
									.catch((err) => {
										console.error("STT: take a picture -> failed to start camera: ", err);
									})
								
								}
							}
							
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						
						
						
						
						// VOICE COMMAND _ PREVIOUS / NEXT

						else if(
							transcript == 'next' 
							|| transcript == 'next paragraph' 
							|| transcript == 'select next paragraph' 
							|| transcript == 'select the next paragraph' 
							|| transcript == 'previous' 
							|| transcript == 'previous paragraph' 
							|| transcript == 'select previous paragraph' 
							|| transcript == 'select the previous paragraph' 
							|| transcript == 'down' 
							|| transcript == 'go down'
							|| transcript == 'move down'
							|| transcript == 'up' 
							|| transcript == 'go up' 
							|| transcript == 'move up' 
							|| transcript == 'volgende' 
							|| transcript == 'volgende paragraaf' 
							|| transcript == 'selecteer volgende paragraaf' 
							|| transcript == 'selecteer de volgende paragraaf' 
							|| transcript == 'vorige' 
							|| transcript == 'vorige paragraaf' 
							|| transcript == 'selecteer vorige paragraaf' 
							|| transcript == 'selecteer de vorige paragraaf' 
							|| transcript == 'omlaag' 
							|| transcript == 'omhoog' 
							|| transcript == 'ga omlaag' 
							|| transcript == 'ga omhoog' 
						){
							//console.log("detected previous/next voice command");
							let next = true;
							if(transcript == 'previous' || transcript == 'up' || transcript.endsWith(' up') || transcript == 'vorige' || transcript.endsWith('omhoog')){
								next = false;
							}
							if(window.active_section == 'sidebar' && document.body.classList.contains('sidebar') && window.settings.left_sidebar == 'docs' && transcript.indexOf('paragraph') == -1 && transcript.indexOf('paragraaf') == -1){
								//console.log("routing previous/next to file manager");
								if(next){
									navigate_file_manager_by_keyboard(40); // down
								}
								else{
									navigate_file_manager_by_keyboard(38); // up
								}
							}
							else if (window.active_destination == 'chat' && !document.body.classList.contains('show-document')){
								// do nothing?
								console.warn("previous/next voice command: chat selected, and no open file to switch to");
							}
							else if(document.body.classList.contains('show-document')){
									
								window.active_destination = 'document';
								
								// Scroll to next paragraph?
								//console.log("voice command for going to previous or next paragraph or word?");
								if(typeof current_file_name == 'string' && filename_is_binary(current_file_name)){
									//console.log("previous/next voice command: skipping binary file");
								}
								else if(typeof current_file_name == 'string'){
									//console.log("previous/next voice command: will attempt to select paragraph");
									let selected_paragraph = null;
									if(next){
										if(transcript == 'down' || transcript == 'omlaag'){ 
											select_paragraph('next', true); // DOWN -  allow empty paragraphs to be selected
										}
										else{ 
											select_paragraph('next'); // NEXT
										}
										
									}else{
										if(transcript == 'up' || transcript == 'omhoog'){
											select_paragraph('previous', true); // UP - allow empty paragraphs to be selected
										}
										else{
											select_paragraph('previous'); // PREVIOUS
										}
									}
								}
								
							}
							else{
								console.warn("next/previous voice command fell through");
							}
							
							if(window.busy_doing_blueprint_task == false && window.blueprint_tasks_left == 0 && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
								let blueprint_prompt_command = '\n\nPrevious\n\n';
								if(next){
									blueprint_prompt_command = '\n\nNext\n\n';
								}
								flash_message(get_translation("Added_command_to_blueprint"),1000);
								if(!window.doc_text.endsWith(blueprint_prompt_command)){
									insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, blueprint_prompt_command);
								}
								else{
									//console.log("blueprint already ended with this prompt command");
								}
							}
							
							
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						// VOICE COMMAND _ FIRST / LAST
						else if(
							window.settings.docs.open != null 
							&& (
								transcript == 'first' 
								|| transcript == 'thirst' 
								|| transcript == 'first paragraph' 
								|| transcript == 'select first'
								|| transcript == 'selects first'
								|| transcript == 'select first one'
								|| transcript == 'select the first' 
								|| transcript == 'select first paragraph' 
								|| transcript == 'select the first paragraph' 
								|| transcript == 'selects the first paragraph' 
								|| transcript == 'selects his first paragraph'
								|| transcript == 'select the first one' 
								
								|| transcript == 'select top' 
								|| transcript == 'select top paragraph' 
								|| transcript == 'select the top paragraph' 
								
								|| transcript == 'eerste'
								|| transcript == 'de eerste'
								|| transcript == 'eerste paragraaf'
								|| transcript == 'de eerste paragraaf'
								|| transcript == 'selecteer eerste'
								|| transcript == 'selecteer de eerste'
								|| transcript == 'selecteer eerste paragraaf'
								|| transcript == 'selecteer de eerste paragraaf'
								
								|| transcript == 'bovenste'
								|| transcript == 'de bovenste'
								|| transcript == 'bovenste paragraaf'
								|| transcript == 'de bovenste paragraaf'
								|| transcript == 'selecteer bovenste'
								|| transcript == 'selecteer de bovenste'
								|| transcript == 'selecteer bovenste paragraaf'
								|| transcript == 'selecteer de bovenste paragraaf'
								
								|| transcript == 'last' 
								|| transcript == 'lost' 
								|| transcript == 'last paragraph' 
								|| transcript == 'lost paragraph' 
								|| transcript == 'select last' 
								|| transcript == 'select the last' 
								|| transcript == 'select the last one' 
								|| transcript == 'select last paragraph' 
								|| transcript == 'select the last paragraph' 
								|| transcript == 'lowest paragraph' 
								|| transcript == 'select lowest paragraph' 
								|| transcript == 'select the lowest paragraph' 
								
								|| transcript == 'laatste'
								|| transcript == 'laatste paragraaf'
								|| transcript == 'de laatste paragraaf'
								|| transcript == 'selecteer laatste'
								|| transcript == 'selecteer de laatste'
								|| transcript == 'selecteer laatste paragraaf'
								|| transcript == 'selecteer de laatste paragraaf'
								
								|| transcript == 'onderste'
								|| transcript == 'onderste paragraaf'
								|| transcript == 'de onderste paragraaf'
								|| transcript == 'selecteer onderste'
								|| transcript == 'selecteer de onderste'
								|| transcript == 'selecteer onderste paragraaf'
								|| transcript == 'selecteer de onderste paragraaf'
								
							)
						){
							//console.log("detected first or last (paragraph) voice command");
							let next = true;
							if(transcript.indexOf('eerste') != -1 || transcript.indexOf('bovenste') != -1 || transcript.indexOf('first') != -1 || transcript.indexOf(' top') != -1){
								next = false;
							}
							if(window.active_section == 'sidebar' && document.body.classList.contains('sidebar') && window.settings.left_sidebar == 'docs' && transcript.indexOf('paragraph') == -1 && transcript.indexOf('paragraaf') == -1){
								//console.log("first/last voice command: routing to open file manager");
								if(next){
									navigate_file_manager_by_keyboard('last'); // first
								}
								else{
									navigate_file_manager_by_keyboard('first'); // last
								}
							}
							else if (window.active_destination == 'chat' && !document.body.classList.contains('show-document')){
								// do nothing?
								console.warn("first/last voice command: chat selected, and no open file to switch to");
								window.active_section = 'chat';
							}
							else if(document.body.classList.contains('show-document')){
								//console.log("first/last voice command: routing to open document");
								window.active_destination = 'document';
								window.active_section = 'document';
								
								if(typeof current_file_name == 'string' && window.filename_is_binary(current_file_name)){
									//console.log("first/last voice command: skipping binary file");
								}
								else if(typeof current_file_name == 'string'){
									//console.log("first/last voice command: calling select_paragraph");
									if(next){
										select_paragraph('last');
									}else{
										select_paragraph('first');
									}
								}
								else{
									console.error("first/last voice command: showing document, but still fell through. current_file_name: ", current_file_name, typeof window.doc_text);
								}
								
							}
							else{
								console.warn("first/last voice command fell through");
							}
							
							if(window.busy_doing_blueprint_task == false && window.blueprint_tasks_left == 0 && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
								let blueprint_prompt_command = '\n\nFirst\n\n';
								if(next){
									blueprint_prompt_command = '\n\nLast\n\n';
								}
								flash_message(get_translation("Added_command_to_blueprint"),1000);
								if(!window.doc_text.endsWith(blueprint_prompt_command)){
									insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, blueprint_prompt_command);
								}
								else{
									//console.log("blueprint already ended with this prompt command");
								}
							}
							
							
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						
						
						
						
						
						// VOICE COMMAND _ UNDO
						else if( (transcript == 'undo' || transcript == 'andu' || transcript == 'back' || transcript == 'ongedaan maken')){
							
							if(document.body.classList.contains('show-document')){
								window.active_destination = 'document';
								
								if(document.body.classList.contains('can-undo')){
									hide_doc_selection_hint();
									editor_undo();
								}
								window.task_queue[t].state = 'completed';
							}
							else{
								window.task_queue[t].state = 'failed';
							}
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							
							set_state(LISTENING);
						}
						
						
						// VOICE COMMAND _ REDO
						else if(transcript == 'redo' || transcript == 'forward'){
							
							if(document.body.classList.contains('show-document')){
								window.active_destination = 'document';
								
								if(document.body.classList.contains('can-redo')){
									hide_doc_selection_hint();
									editor_redo();
								}
								window.task_queue[t].state = 'completed';
							}
							else{
								window.task_queue[t].state = 'failed';
							}
							
							
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							
							set_state(LISTENING);
						}
						
						
						// VOICE COMMAND _ SELECT CHAT
						else if(transcript == 'select chat' || transcript == 'select the chat' || transcript == 'selecteer chat'){
							
							window.active_destination = 'chat';
							window.active_section = 'chat';
							remove_body_class('document-active');
							remove_body_class('chat-shrink');
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						// VOICE COMMAND _ SELECT DOCUMENT
						else if(transcript == 'select document' || transcript == 'select the document' || transcript == 'selecteer document' || transcript == 'selecteer het document'){
							
							window.active_destination = 'document';
							window.active_section = 'document';
							add_body_class('document-active');
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						// VOICE COMMAND _ SHOW FILE MANAGER IN SIDEBAR
						else if(transcript == 'open files' || transcript == 'show files' || transcript == 'select files' || transcript == 'toon bestanden' || transcript == 'selecteer bestanden' || transcript == 'toon documenten' || transcript == 'selecteer documenten'){
							
							window.active_destination = 'document';
							window.active_section = 'sidebar';
							add_body_class('sidebar');
							remove_body_class('shrink-sidebar');
							remove_body_class('sidebar-settings');
							remove_body_class('sidebar-chat');
							window.settings.left_sidebar_open = true;
							window.settings.left_sidebar = 'docs';
							
							save_settings();
							give_attention_to_file();
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						// VOICE COMMAND _ SHOW TASKS IN SIDEBAR
						else if(transcript == 'select tasks' || transcript == 'show tasks' || transcript == 'open tasks' || transcript == 'selecteer taken' || transcript == 'toon taken' || transcript == 'open taken'){
							
							window.active_destination = 'document';
							window.active_section = 'sidebar';
							add_body_class('sidebar');
							remove_body_class('shrink-sidebar');
							add_body_class('sidebar-settings');
							add_body_class('sidebar-settings-show-tasks');
							remove_body_class('sidebar-chat');
							window.settings.left_sidebar_open = true;
							window.settings.left_sidebar = 'settings';
							window.settings.left_sidebar_settings_tab = 'tasks';
							save_settings();
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						// VOICE COMMAND _ CLOSE SIDEBAR
						
						else if(
							document.body.classList.contains('sidebar') 
							&& (
								transcript == 'hide files' 
								|| transcript == 'close files' 
								|| transcript == 'close sidebar' 
								|| transcript == 'close menu'
								|| transcript == 'hide menu'
								|| transcript == 'hide sidebar'
								|| transcript == 'hide tasks'
								|| transcript == 'close tasks'
								|| transcript == 'sluit menu'
								|| transcript == 'sluit bestanden'
								|| transcript == 'sluit taken'
								|| transcript == 'verberg menu'
							)
						){
							if(document.body.classList.contains('show-document')){
								window.active_destination = 'document';
								window.active_section = 'document';
							}
							else{
								window.active_destination = 'chat';
								window.active_section = 'chat';
							}
							
							remove_body_class('sidebar');
							window.settings.left_sidebar_open = false;
							save_settings();
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						
						
						// VOICE COMMAND _ STOP
						else if( 
							transcript == 'stop' 
							|| transcript == 'abort' 
							|| transcript == 'shush' 
							|| transcript == 'stop talking' 
							|| transcript == 'be quiet' 
							|| transcript == 'shut up' 
							|| transcript == 'stil' 
							|| transcript == 'hou je bek' 
							//|| transcript == 'shh' 
						){
							
							console.warn("HEARD VOICE COMMAND 'STOP'");
							/*
							if(window.llama_cpp_busy || window.web_llm_busy){
								//console.log("HEARD VOICE COMMAND 'STOP' -> calling stop_assistant");
								window.stop_assistant();
							}
							*/
							
							//&& window.active_destination == 'chat' && (window.llama_cpp_busy || window.web_llm_busy || window.whisper_worker_busy || window.tts_worker_busy || window.audio_player_busy)
							
							
							
							flash_message('🗣️ ' + get_translation('Stop'),'1000','error');
							window.stop_assistant();
							
							if(window.whisper_worker_busy){
								//console.log("HEARD VOICE COMMAND 'STOP' -> whisper_worker_busy -> interrupting STT tasks");
								change_tasks_with_state('doing_stt','interrupted');
								change_tasks_with_state('should_stt','interrupted');
							}
							if(window.tts_worker_busy || (window.speaker_enabled && window.audio_player_busy)){
								//console.log("HEARD VOICE COMMAND 'STOP' -> TTS or audio player busy -> interrupting STT, TTS and audio player tasks");
								window.interrupt_speaker();
								change_tasks_with_state('doing_stt','interrupted');
								change_tasks_with_state('should_stt','interrupted');
							}
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						// VOICE COMMAND _ RESET
						else if( 
							transcript == 'reset'
							|| transcript == 'recycle'
							|| transcript == 'clear'
							|| transcript == 'ververs' 
							|| transcript == 'verfris'
							
							|| transcript == 'forget'
							|| transcript == 'vergeet'
						){
							
							console.warn("HEARD VOICE COMMAND 'RESET'");
							/*
							if(window.llama_cpp_busy || window.web_llm_busy){
								//console.log("HEARD VOICE COMMAND 'STOP' -> calling stop_assistant");
								window.stop_assistant();
							}
							*/
							
							//&& window.active_destination == 'chat' && (window.llama_cpp_busy || window.web_llm_busy || window.whisper_worker_busy || window.tts_worker_busy || window.audio_player_busy)
							
							
							
							flash_message('🗣️ ' + get_translation('Reset'),'1000');
							window.stop_assistant({'assistant':window.settings.assistant});
							
							window.clear_assistant();
							
							if(window.whisper_worker_busy){
								//console.log("HEARD VOICE COMMAND 'STOP' -> whisper_worker_busy -> interrupting STT tasks");
								change_tasks_with_state('doing_stt','interrupted');
								change_tasks_with_state('should_stt','interrupted');
							}
							if(window.tts_worker_busy || (window.speaker_enabled && window.audio_player_busy)){
								//console.log("HEARD VOICE COMMAND 'STOP' -> TTS or audio player busy -> interrupting STT, TTS and audio player tasks");
								window.interrupt_speaker();
								change_tasks_with_state('doing_stt','interrupted');
								change_tasks_with_state('should_stt','interrupted');
							}
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						
						// VOICE COMMAND _ FOR EACH FILE
						else if(is_blueprint_command && (transcript == 'for each file' || transcript == 'voor elk bestand')){
							
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						// VOICE COMMAND _ SET ORIGIN FILE
						else if(transcript == 'set as origin file' || transcript == 'gebruik als bron bestand'){
							
							if(is_blueprint_command && typeof window.task_queue[t].origin_file != 'undefined' && window.task_queue[t].origin_file != null && typeof window.task_queue[t].origin_file.filename != 'undefined'){
								window.blueprint_origin_file = JSON.parse(JSON.stringify(window.task_queue[t].origin_file));
							}
							else if(!is_blueprint_command && window.settings.docs.open != null && typeof window.settings.docs.open.filename == 'string'){
								window.current_origin_file = JSON.parse(JSON.stringify(window.settings.docs.open));
							}
							//console.log("origin file has been set to: ", window.current_origin_file);
							
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						// VOICE COMMAND _ FLASH MESSAGE FOR A BLUEPRINT
						else if(is_blueprint_command && transcript.startsWith('info:')){
							
							flash_message(get_translation(result.substr(5)).trim(),3000,'info');
							
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						
						
					
					
						// VOICE COMMAND _ CANCEL / SUBMIT
					
						else if(vex_cancel_el && (transcript.startsWith('cancel') || transcript.startsWith('annuleren'))){
							vex_cancel_el.click();
							window.active_destination = 'document';
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						else if(vex_submit_el && (transcript.startsWith('submit') || transcript.startsWith('save') || transcript.startsWith('opslaan') || transcript.startsWith('ok'))){
							vex_submit_el.click();
							window.active_destination = 'document';
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
					
						else if(vex_input_el){
							vex_input_el.value = transcript + '.txt';
							vex_submit_el.click();
							window.active_destination = 'document';
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						
						// VOICE COMMAND _ WRITE A PARAGRAPH
						
						else if(window.settings.docs.open != null && (
							   transcript.startsWith('write a paragraph ') 
							|| transcript.startsWith('write a short paragraph ') 
							|| transcript.startsWith('write a new paragraph ')
							|| transcript.startsWith('create a paragraph ')
							|| transcript.startsWith('add a paragraph ')
							|| transcript.startsWith('add a short paragraph ') 
							|| transcript.startsWith('add a new paragraph ')
							)
						){
							let word_to_split_command_on = 'paragraph ';
							if(transcript.indexOf('paragraph about ') != -1){
								word_to_split_command_on = 'paragraph about ';
							}
							if(transcript.indexOf('paragraph on ') != -1){
								word_to_split_command_on = 'paragraph on ';
							}
					
						
							window.active_destination = 'document';
					
							let paragraph_subject = transcript.substr( transcript.indexOf(word_to_split_command_on)+word_to_split_command_on.length ,transcript.length-1);
							if(paragraph_subject.length > 2){
								window.task_queue[t].type = 'prompt_at_line';
								window.task_queue[t].state = 'should_assistant';
								window.task_queue[t].destination = 'document';
								window.task_queue[t].file = window.settings.docs.open;
								window.task_queue[t].selection = window.doc_selection;
								flash_message( get_translation('Adding_a_paragraph_about') + ' ' + paragraph_subject,4000);
								window.task_queue[t].prompt = result;
								//console.log("tts task transformed into prompt_at_line task: ", window.task_queue[t]);
								
								
								if(window.busy_doing_blueprint_task == false && window.blueprint_tasks_left == 0 && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
									const blueprint_prompt_command = '\n\n' + result + '\n\n';
									flash_message(get_translation("Added_command_to_blueprint"),1000);
									if(!window.doc_text.endsWith(blueprint_prompt_command)){
										insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, blueprint_prompt_command);
									}
									else{
										//console.log("blueprint already ended with this prompt command");
									}
								}
								
								
								
							}
							else{
								flash_message(get_translation('Not_sure_what_the_paragraph_should_be_about'), 4000,'warning');
								window.task_queue[t].state = 'failed';
							}
							//create_new_document('',new_doc_filename);
					
							//window.task_queue[t].type = 'stt_to_document';
							
							//window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
						
						// VOICE COMMAND _ NEW PARAGRAPH - While dictating in a document, add two newlines
						else if(transcript == 'add paragraph' || transcript == 'new paragraph' || transcript == 'nieuwe paragraaf' || transcript == 'nieuwe alinea' || transcript == 'nieuwe paragraaf' || transcript == 'alinea'){
							window.active_destination = 'document';
							
							window.task_queue[t].file = window.settings.docs.open;
							window.task_queue[t].selection = {'from':window.doc_selection.to,'to':window.doc_selection.to};
							insert_into_document(window.task_queue[t], '\n\n');
							
							
							if(window.busy_doing_blueprint_task == false && window.blueprint_tasks_left == 0 && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
								const blueprint_prompt_command = '\n\nNew paragraph\n\n';
								flash_message(get_translation("Added_command_to_blueprint"),1000);
								if(!window.doc_text.endsWith(blueprint_prompt_command)){
									insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, blueprint_prompt_command);
								}
								else{
									//console.log("blueprint already ended with this prompt command");
								}
							}
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
				
						
						// VOICE COMMAND _ PROMPT:
						// The prompt blueprint command is transformed into a prompt_at_line or, if no document is open, a chat task
						else if(is_blueprint_command && transcript.startsWith('prompt: ') ){ // && window.settings.assistant != 'scribe'
							//console.log("changing blueprint command into prompt task : ", transcript);
							
							// TODO: should be simplified by calling do_prompt here instead, and passing in the task, so the blueprint type and task index get copied over into the new task
							//add_chat_message('current','user',result.substr(8));
							
							
							// For now, if the blueprint hasn't created a new document, then the 'old' route of changing the task will be used. This also has the 'prompt-at-line' transition at the end
						
							window.task_queue[t].assistant = window.settings.assistant;
							window.task_queue[t].desired_results = 1;
							window.task_queue[t].results = [];
							
							window.task_queue[t].state = 'should_assistant';
							
							window.task_queue[t].prompt = result.substr(8);
							//window.task_queue[t].destination = 'document';
						
							if(window.settings.assistant == 'imager'){
								window.task_queue[t].state = 'should_imager';
								window.task_queue[t].type = 'image';
								window.task_queue[t].destination = 'chat';
								window.task_queue[t]['desired_results'] = 1;
								window.task_queue[t]['results'] = [];
							}
							else if(window.settings.assistant == 'text_to_image'){
								window.task_queue[t].state = 'should_text_to_image';
								window.task_queue[t].type = 'image';
								window.task_queue[t].destination = 'chat';
								window.task_queue[t]['desired_results'] = 1;
								window.task_queue[t]['results'] = [];
							}
							else if(window.settings.assistant == 'musicgen'){
								window.task_queue[t].type = 'generate_audio';
								window.task_queue[t].state = 'should_musicgen';
								window.task_queue[t].destination = 'chat';
								window.task_queue[t]['desired_results'] = 0;
								window.task_queue[t]['results'] = [];
							}
							else if(window.settings.assistant.startsWith('image_to_text')){
								window.task_queue[t].type = 'image_to_text';
								window.task_queue[t].state = 'should_image_to_text';
								if(typeof window.task_queue[t].image_to_text_index != 'number'){
									window.task_queue[t].image_to_text_index = window.image_to_text_counter;
									window.image_to_text_counter++
								}
								

								if(window.settings.assistant == 'image_to_text_ocr'){
									window.task_queue[t].state = 'should_ocr';
									window.task_queue[t].prompt = null;
								}
								
								window.task_queue[t].destination = 'document';
								window.task_queue[t]['desired_results'] = 1;
								window.task_queue[t]['results'] = [];
								if(window.settings.docs.open != null){
									window.task_queue[t]['file'] = window.settings.docs.open;
								}
								
								
								if(typeof window.task_queue[t].image_blob == 'undefined' && window.last_image_to_text_blob != null){
									//window.task_queue[t].state = 'failed';
									//console.log("adding image blob to blueprint 'prompt: ' task");
									window.task_queue[t]['image_blob'] = window.last_image_to_text_blob;
								}
								//console.log("blueprint image_to_text prompt: window.task_queue[t].state " + window.task_queue[t].state);
								
							}
							else if(window.settings.assistant == 'speaker' || window.settings.assistant == 'speak'){
							
								window.enable_speaker();
							
								window.task_queue[t].type = 'speak';
								window.task_queue[t].state = 'should_tts';
								window.task_queue[t].destination = 'audio_player';
								window.task_queue[t]['desired_results'] = 0;
								window.task_queue[t]['results'] = [];
								window.task_queue[t]['sentence'] = result.substr(8);
								window.tts_tasks_left++;
							
							}
							else if(window.settings.assistant == 'translator'){
								window.task_queue[t].type = 'translation';
								window.task_queue[t].state = 'should_translation';
							
								window.task_queue[t]['desired_results'] = 1;
								window.task_queue[t]['results'] = [];
								window.task_queue[t]['input_language'] = window.settings.input_language;
								window.task_queue[t]['output_language'] = window.settings.output_language;
								window.task_queue[t]['translation_details'] = get_translation_model_details_from_languages(window.settings.input_language,window.settings.output_language);
							}
							else if(window.settings.assistant == 'scribe'){ // blueprints can't do much with a scribe prompt
							
								window.disable_speaker();
								
							}
							
							else if(typeof window.doc_text == 'string' && !current_file_name.endsWith('.blueprint') && window.settings.docs.open != null){
								window.active_destination = 'document';
								window.task_queue[t].type = 'prompt_at_line';
								//window.task_queue[t].text = window.doc_text;
								window.task_queue[t].destination = 'document';
								window.task_queue[t]["file"] = window.settings.docs.open;
								window.task_queue[t]["selection"] = {"position":"end"}; // blueprints can, for now, only append to the end of the document
							}
							else{
								add_chat_message('current','user',result.substr(8));
								window.task_queue[t].type = 'chat';
								//window.task_queue[t].prompt = result.substr(8);
								window.task_queue[t].destination = 'chat';
							}
							
							
							inform_parent = false; // don't update the parent task until prompt is finished
							set_state(LISTENING);
						}
						
						
						
						// CONTINUE
						// The continue voice command gets a second life, and is transformed into a continue task
						else if(transcript == 'continue' || transcript.startsWith('continue the document') || transcript.startsWith('continue the file') || transcript.startsWith('continue writing') || transcript == 'schrijf verder' || transcript == 'schrijf door'){
							//console.log("changing voice/blueprint task into continue task");
							
							window.active_destination = 'document';
							window.task_queue[t].type = 'continue';
							window.task_queue[t].desired_results = 1;
							window.task_queue[t].results = [];
							window.task_queue[t].file = window.settings.docs.open;
							
							if(typeof window.doc_text == 'string' && window.doc_text.length > 5){
								window.task_queue[t].text = window.doc_text;
								//window.task_queue[t].state = 'should_assistant';
								//window.task_queue[t].prompt = get_text_tail(window.doc_text,600);
								//window.task_queue[t].template = 'oneshot';
								window.task_queue[t] = await continue_document(null,true,window.task_queue[t]);
								inform_parent = false; // don't update the parent task until continue is finished
								
							}
							else{
								console.error("changing voice/blueprint command into continue command failed, window.doc_text is empty or too short: ", window.doc_text);
								window.task_queue[t].state = 'failed';
								change_tasks_with_origin('blueprint'); // default is to set it to interrupted
								//window.stop_assistant();
							}
							
							if(window.busy_doing_blueprint_task == false && window.blueprint_tasks_left == 0 && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
								const blueprint_prompt_command = '\n\nContinue\n\n';
								flash_message(get_translation("Added_command_to_blueprint"),1000);
								if(!window.doc_text.endsWith(blueprint_prompt_command)){
									insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, blueprint_prompt_command);
								}
								else{
									//console.log("blueprint already ended with this prompt command");
								}
							}
							
							
							set_state(LISTENING);
						}
					
					
						// DO REWRITE
						// The longer rewrite voice command start the rewrite immediately
						else if( 
							//is_blueprint_command == false &&
							typeof window.doc_selected_text == 'string' 
							&& window.doc_selected_text.length > 5 
							&& (
								transcript.startsWith('rewrite the text ') || 
								transcript.startsWith('rewrite the selection ') ||
								transcript.startsWith('rewrite the selected ') ||
								transcript.startsWith('rewrite the paragraph ') ||
								transcript.startsWith('herschrijf de ') || 
								transcript.startsWith('herschrijf het ') || 
								transcript.startsWith('maak de selectie ') || 
								transcript.startsWith('maak de paragraaf ') || 
								transcript.startsWith('maak de geselecteerde ') || 
								transcript.startsWith('maak de text ')
							)
						
						){
							//console.log("got a longer rewrite voice command");
							window.rewrite_prompt_el.value = result;
							window.active_destination = 'document';
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							
							//prepare_rewrite();
							
							rewrite_selection('rewrite',null,1,null,result,true);
							
							set_state(LISTENING);
						}
					
						
						// OPEN REWRITE _ open the rewrite dialog only
						else if( 
							is_blueprint_command == false 
							&& typeof window.doc_selected_text == 'string' 
							&& window.doc_selected_text.length > 5
							&& (
								transcript == 'rewrite' || 
								transcript == 'rewriting' || 
								transcript == 'rewrite the text' || 
								transcript == 'rewrite the selection' || 
								transcript == 'rewrite the file' ||
						
								transcript == 'herschrijf' || 
								transcript == 'herschrijven' || 
								transcript == 'herschrijf selectie' || 
								transcript == 'herschrijf text' || 
								transcript == 'pas de tekst aan'
							)
						){
							//console.log("got open rewrite dialog voice command");
							window.active_destination = 'document';
							window.active_section = 'document';
							window.task_queue[t].type = 'voice_command';
							window.task_queue[t].state = 'completed';
							prepare_rewrite();
							set_state(LISTENING);
						}
					
					
						
						// VOICE COMMAND _ SET INPUT OR OUTPUT LANGUAGE
						else if( 
							is_blueprint_command == false 
							&& typeof window.doc_selected_text == 'string' 
							&& window.doc_selected_text.length > 5 
							&& transcript.length < 80
							&& (
								transcript.startsWith('change input language ') || 
								transcript.startsWith('set input language ') ||
								transcript.startsWith('change source language ') || 
								transcript.startsWith('change the source language ') || 
								transcript.startsWith('set source language ') ||
								transcript.startsWith('set the source language ') ||
								transcript.startsWith('stel invoer taal in ') || 
								transcript.startsWith('stel de invoer taal in ') || 
								transcript.startsWith('zet invoer taal ') ||
								transcript.startsWith('zet de invoer taal ') ||
								transcript.startsWith('stel bron taal in ') || 
								transcript.startsWith('stel de bron taal in ') || 
								transcript.startsWith('zet bron taal ') ||
								transcript.startsWith('stel oorsprong taal in ') || 
								transcript.startsWith('zet oorsprong taal ') ||
								transcript.startsWith('zet de oorsprong taal ') ||
								transcript.startsWith('change output language ') || 
								transcript.startsWith('set output language ') ||
								transcript.startsWith('change target language ') || 
								transcript.startsWith('set target language ') ||
								transcript.startsWith('stel doel taal in ') || 
								transcript.startsWith('stel de doel taal in ') || 
								transcript.startsWith('zet doel taal ') ||
								transcript.startsWith('zet de doel taal ') ||
								transcript.startsWith('stel uitvoer taal in ') || 
								transcript.startsWith('zet uitvoer taal ') 
							)
						
						){
							let set_type = 'input';
							if(
								transcript.indexOf('output ') != -1 
								|| transcript.indexOf('uitvoer ') != -1 
								|| transcript.indexOf('target ') != -1 
								|| transcript.indexOf('doel ') != -1
							){
								set_type = 'output';
							}
							
							let last_word = transcript.split(' ').pop();
							//console.log("voice command: set input lanuage: last_word: ", last_word);
							
							if(window.microphone_enabled && window.settings.assistant == 'translator'){
								window.active_destination = 'chat';
							}
							else{
								window.active_destination = 'document';
							}
							//let possible_languages = Object.keys(window.translation_languages);
							
							
							let found_language_code = false
							if(last_word.length > 2){
								for (let [key, value] of Object.entries(window.translations)) {
									if(key.length == 2){
										for (let [lang_code, lang_name] of Object.entries(window.translations)) {
											if(last_word == lang_name){
												last_word = lang_code;
												found_language_code = true;
												break
											}
										}
									}
									if(found_language_code){
										break
									}
								}
							}
							//console.log("voice command: set language: language code: ", set_type, " -> ", last_word);
							if(window['update_translation_' + set_type + '_select'](last_word)){
								window.task_queue[t].state = 'completed';
							}
							else{
								window.task_queue[t].state = 'failed';
							}
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							//prepare_rewrite();
							//rewrite_selection();
							set_state(LISTENING);
						}
					
					
					
				
						// VOICE COMMAND _ PLAY DOCUMENT
						else if(transcript.startsWith('play document') || transcript.startsWith('play the document') || transcript.startsWith('play file') || transcript.startsWith('play the file') || transcript.endsWith('play the document') || transcript.startsWith('speel document') || transcript.startsWith('speel het document') || transcript.startsWith('speel het bestand')){
							//console.log("STT command was to play document");
							window.active_destination = 'document';
						
							if(typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'blueprint'){
								flash_message("Cannot start a blueprint from a blueprint",4000,'fail');
								window.task_queue[t].state = 'failed';
							}
							else{
								/*
								window.active_destination = 'document';
								window.task_queue[t].type = 'play_document';
								window.task_queue[t].state = 'should_play_document';
								*/
							
								//window.task_queue[t].type = 'play_document';
								if(!is_blueprint_command){
									window.task_queue[t].type = 'voice_command';
								}
								window.task_queue[t].state = 'completed';
								setTimeout(() => {
									window.start_play_document();
								},5);
							
								set_state(LISTENING);
							}
					
						}
						
						
						// PLAY DOCUMENT
						else if(transcript == 'play' || transcript.startsWith('play document') || transcript.startsWith('play the document') || transcript.startsWith('play file') || transcript.startsWith('play the file') || transcript.endsWith('play the document') || transcript.startsWith('speel document') || transcript.startsWith('speel het document') || transcript.startsWith('speel het bestand') || transcript == 'afspelen' || transcript == 'document afspelen'){
							//console.log("STT command was to play document");
							window.active_destination = 'document';
						
							if(typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'blueprint'){
								flash_message("Cannot start a blueprint from a blueprint",4000,'fail');
								window.task_queue[t].state = 'failed';
							}
							else{
								/*
								window.active_destination = 'document';
								window.task_queue[t].type = 'play_document';
								window.task_queue[t].state = 'should_play_document';
								*/
							
								//window.task_queue[t].type = 'play_document';
								if(!is_blueprint_command){
									window.task_queue[t].type = 'voice_command';
								}
								window.task_queue[t].state = 'completed';
								setTimeout(() => {
									window.start_play_document();
								},1)
							
								set_state(LISTENING);
							}
					
						}
						
						// SPEAK DOCUMENT
						else if(
							transcript == 'speak' 
							|| transcript == 'say out loud' 
							|| transcript =='speak document' 
							|| transcript == 'speak the document' 
							|| transcript =='speak file'
							|| transcript =='speak the file' 
							|| transcript == 'speak the document'
							|| transcript == 'spreek' 
							|| transcript == 'spreek hardop' 
							|| transcript == 'spreek document' 
							|| transcript == 'spreek het document' 
							|| transcript == 'spreek het bestand' 
							|| transcript == 'spreken' 
							|| transcript == 'document spreken'
							|| transcript == 'zeg hardop'
						){
							
							//console.log("STT command was to play document");
							window.active_destination = 'document';
							if(window.speaker_enabled == false){
								window.enable_speaker();
							}
							//window.task_queue[t].type = 'play_document';
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							setTimeout(() => {
								window.start_play_document();
							},1)
						
							set_state(LISTENING);
					
						}
						
						
				
					
					
						// VOICE COMMAND _ DELAY
						else if(is_blueprint_command && transcript.startsWith('delay ') && transcript.length < 21 ){
							transcript = transcript.replace('seconds','');
							transcript = transcript.replace('seconden','');
							transcript = transcript.replace('sekunden','');
							
							transcript = transcript.trim();
							if(transcript.endsWith('s')){
								transcript = transcript.substr(0,transcript.length-1);
							}
							
							//console.log("DELAY COMMAND:  -->" + transcript + '<--');
							let last_word = transcript.split(' ').pop();
							//console.log("DELAY COMMAND: last_word: ", last_word, isNaN(last_word));
							
							
							window.active_destination = 'document';
							if(!isNaN(last_word)){
								let delay_duration = parseFloat(last_word);
								//console.log("blueprint delay_duration: ", delay_duration);
								delay_duration =  Math.round(delay_duration * 1000);
								inform_parent = false;
								const my_task = window.task_queue[t].state = 'completed';
								setTimeout(() => {
									//console.log("blueprint delay done");
									my_task.state = 'completed';
									if(window.busy_doing_blueprint_task == false){
										console.error("blueprint delay: when the delay was done, busy_doing_blueprint_task was already false?");
									}
									if(my_task.state != 'interrupted'){
										window.busy_doing_blueprint_task = false;
									}
								
								}, delay_duration);
							}
							else{
								console.error("blueprint delay: not a valid number in command: ", transcript);
							}
							
							set_state(LISTENING);
						}
					
					
						// VOICE COMMAND _ scroll to bottom
						else if(
							transcript.startsWith('scroll to the end') || 
							transcript.startsWith('scroll to the ending') || 
							transcript.startsWith('scroll to end') || 
							transcript.startsWith('scroll to ending') || 
							transcript.startsWith('scroll to bottom') || 
							transcript.startsWith('scroll to the bottom') || 
							transcript.startsWith('move to the end') || 
							transcript.startsWith('move to the ending') || 
							transcript.startsWith('move to end') || 
							transcript.startsWith('move to bottom') || 
							transcript.startsWith('move to the bottom') || 
							transcript.startsWith('show the end') || 
							transcript.startsWith('show the ending') || 
							transcript.startsWith('show the bottom') || 
							transcript.startsWith('go to the end') || 
							transcript.startsWith('go to the ending') || 
							transcript.startsWith('go to the bottom') || 
						
							transcript.startsWith('scroll helemaal naar het eind') || 
							transcript.startsWith('scroll naar het eind') || 
							transcript.startsWith('scroll naar eind') || 
							transcript.startsWith('scroll eind') || 
							transcript.startsWith('scroll helemaal naar beneden') || 
							transcript.startsWith('scroll naar beneden') || 
							transcript.startsWith('scroll beneden') || 
							transcript.startsWith('scroll naar de laatste zin') || 
							transcript.startsWith('ga naar het eind') || 
							transcript.startsWith('ga naar eind') || 
							transcript.startsWith('ga naar beneden')
						){
							
							if(window.active_destination == 'chat'){
								window.scroll_chat_to_bottom();
							}
							else{
								if(scroll_to_end() == false){
									flash_message(get_translation('Please_open_a_document_first'),3000,'fail');
								}
							}
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							
							set_state(LISTENING);
						}
						
						
						// VOICE COMMAND _ SCROLL UP
						else if(transcript == 'scroll up' || transcript == 'scroll omhoog'){
							
							window.scroll_a_bit(window.active_destination,'up','page');
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						// VOICE COMMAND _ SCROLL DOWN
						else if(transcript == 'scroll down' || transcript == 'scroll omlaag'){
							
							window.scroll_a_bit(window.active_destination,'down','page');
							
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
					
					
						else if( (transcript.length < 20 && transcript.indexOf(' time is it') != -1) || (transcript.length < 25 && transcript.indexOf('what time is it') != -1) || (transcript.length < 25 && transcript.indexOf('what time it is') != -1) || (transcript.length < 20 && transcript.endsWith(' the time')) || transcript == "what time is it?" || transcript == "what's the time?" || transcript == "tell me the time" || transcript == "hoe laat is het?" || (transcript.length < 20 && transcript.endsWith(' hoe laat het is')) ){
							//console.log("STT command was to tell the time");
							
							// TODO: could add recognition to tell the time in other countries/cities. E.g. "what time is it in new york"
							
							window.add_chat_message('current','user',result);
							
							const time_as_sentence = get_time_as_sentence();
							window.add_chat_message('current','current',time_as_sentence);
							
							if(window.speaker_enabled){
								window.add_task({
									'prompt':null,
									'origin':'chat',
									'type':'speak',
									'state':'should_tts',
									'sentence':clean_up_string_for_speaking(time_as_sentence),
									'desired_results':0,
									'results':[],
									'destination':'audio_player'
								});
							}
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						
					
						// VOICE COMMAND _ SET A TIMER
						
						else if(
							transcript.length < 60
							&&
							(
								transcript.startsWith('set ') || transcript.startsWith('create ') || transcript.startsWith('zet ') || transcript.startsWith('stel ') || transcript.indexOf(' a timer for ') != -1 ||
								((transcript.indexOf(' timer for ') != -1 || transcript.indexOf(' time are for ') != -1 || transcript.indexOf('wekker ') != -1))
							)
							&&   
							(
								transcript.indexOf(' timer ') != -1 || transcript.indexOf(' alarm ') != -1 || transcript.indexOf(' wekker ') != -1 || transcript.indexOf(' kookwekker ') != -1
							)
							&&
							(
								transcript.endsWith(' seconds') || transcript.endsWith(' minutes') || transcript.endsWith(' hours') || transcript.endsWith(' hour') || transcript.endsWith(' days') || transcript.endsWith(' day')
							)
							&& extracted_time
						){
							//console.log("STT: set a timer voice command. chrono extracted_time: ", transcript, " -> ", typeof extracted_time, extracted_time);
							//extracted_time += 1;
							extracted_time.setSeconds(extracted_time.getSeconds() + 1);
							
							const now_time = Date.now();
							const duration = extracted_time - now_time;
							
							if(duration > 0){
								const my_timer_index = window.timer_index + 0;
							
								let new_timer = {
									'created_time':now_time,
									'from_time':now_time,
									'to_time':extracted_time,
									'duration_time': duration,
									'always_visible':false,
									'sentence':result,
									'timer_index':my_timer_index,
									'assistant':window.settings.assistant
								}
								//console.log("adding new timer: ", new_timer);
								window.timers.push(new_timer);
							
								window.add_chat_message('current','user',result);
								remove_body_class('show-rewrite');
								remove_body_class('chat-shrink');
								if(window.innerWidth < 641){
									remove_body_class('show-document');
								}
								
								window.timer_index++;
								localStorage.setItem("timer_index", window.timer_index);
								recreate_timers();
								
								//console.log("window.timer_index is now: ", window.timer_index);
							
								save_timers();
							}
							
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
					
					
					
						
						
						
						// VOICE COMMAND _ SWITCH TO ANOTHER ASSISTANT Switch assistant Switch_assistant
						
						else if( 
							transcript.length < 80 
							&& (
								transcript.startsWith('chat with ') 
								|| transcript.startsWith('switch assistant to ') 
								|| transcript.startsWith('switch ai to ') 
								|| transcript.startsWith('switch to ') 
								|| transcript.startsWith('change assistant to ') 
								|| transcript.startsWith('change ai to ') 
								|| transcript.startsWith('open assistant ') 
								|| transcript.startsWith('open assistent ')
								|| transcript.startsWith('gebruik ai ')
							)
						){
							//console.log("voice command is 'switch assistant'. transcript: ", transcript);
							let found_assistant = null;
							let assistant_name = transcript.replace('change assistant to ','');
							assistant_name = assistant_name.replace('change ai to ','');
							assistant_name = assistant_name.replace('chat with ','');
							assistant_name = assistant_name.replace('switch to ','');
							assistant_name = assistant_name.replace('switch ai to ','');
							assistant_name = assistant_name.replace('switch assistant to ','');
							assistant_name = assistant_name.replace('open assistant ','');
							assistant_name = assistant_name.replace('open assistent ','');
							assistant_name = assistant_name.replace('gebruik ai ','');
							assistant_name = assistant_name.trim();
							//console.log("switch to other assistant command: assistant_name: -->" + assistant_name + "<--");
							
							if(
								assistant_name == 'any writer' 
								|| assistant_name == 'any_writer'
							){
								found_assistant = assistant_name.replaceAll(' ','_');
								//console.log("voice command -> switching to any writer");
								window.switch_assistant('any_writer');
							}
							else if(
								assistant_name == 'any small writer'
								|| assistant_name == 'any_small_writer'
							){
								found_assistant = assistant_name.replaceAll(' ','_');
								//console.log("voice command -> switching to any small writer");
								window.switch_assistant('any_small_writer');
							}
							else if(
								assistant_name == 'any coder'
								|| assistant_name == 'any_coder'
							){
								found_assistant = assistant_name.replaceAll(' ','_');
								//console.log("voice command -> switching to any coder");
								window.switch_assistant('any_coder');
							}
							
							if(is_blueprint_command){
								
								if(typeof window.assistants[assistant_name] != 'undefined'){
									found_assistant = assistant_name;
									window.switch_assistant(assistant_name, true); // true = from automation. So it won't actually switch the UI
								}
							}
							
							if(found_assistant == null){
								console.warn("switch assistant voice command: found assistant is null")
								const assistant_keys = keyz(window.assistants);
								for(let x = 0; x < assistant_keys.length; x++){
									
									if(typeof window.translations[assistant_keys[x] + '_name'] != 'undefined'){
										const translated_assistant_name = get_translation(assistant_keys[x] + '_name').toLowerCase();
										//console.log("assistant_name match? ", assistant_name, " =?= ", translated_assistant_name);
										if(assistant_name == translated_assistant_name){
											
											if(window.web_gpu32_supported == false && assistant_keys[x].endsWith('_32bit')){
												continue
											}
											if(window.web_gpu_supported == false && assistant_keys[x].startsWith('fast_')){
												continue
											}
											
											found_assistant = assistant_keys[x];
											//console.log("handle_completed_task: switching to assistant command: found it: ", assistant_keys[x], " a.k.a. ", assistant_name);
											window.switch_assistant(assistant_keys[x]);
											break
										}
									}
								}
							}
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							if(found_assistant){
								//console.log("found_assistant: ", found_assistant);
								window.task_queue[t].state = 'completed';
								/*
								if(window.settings.docs.open != null && typeof current_file_name == 'string' && !current_file_name.endsWith('.blueprint')){
									if(window.settings.settings_complexity == 'developer'){
										insert_into_document(window.task_queue[t], '\n\n' + get_translation(assistant_name + '_name') + '\n', {'position':'end'});
									}
								}
								*/
							}
							else{
								console.error("did not find assistant: ");
								window.task_queue[t].state = 'failed';
							}
							
							set_state(LISTENING);
						}
						
						
						// VOICE COMMAND _ SWITCH TO ANOTHER VOICE
						
						else if( transcript.length < 80 && (transcript.startsWith('change voice to ') || transcript.startsWith('set voice to ')) ){
							
							let found_voice = null;
							let voice_name = transcript.replace('change voice to ','');
							voice_name = voice_name.replace('set voice to ','');
							voice_name = voice_name.trim();
							//console.log("switch to other voice: voice_name: ", voice_name);
							
							if(is_blueprint_command){
								const voice_names = keyz(window.voice_to_file_lookup);
								for(let v = 0; v < voice_names.length; v++){
									if(voice_names[v].toLowerCase() == voice_name.toLowerCase()){
										found_voice = voice_names[v];
										//console.log("found the intended voice. calling set_voice with: ", voice_names[v]);
										window.set_voice(voice_names[v]);
										window.task_queue[t]['voice'] = voice_names[v];
									}
								}
							}
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							if(found_voice){
								window.task_queue[t].state = 'completed';
							}
							else{
								window.task_queue[t].state = 'failed';
							}
							
							set_state(LISTENING);
						}
						
						
						
						
						// VOICE COMMAND _ TOGGLE SPEAKER
						
						else if( transcript == 'enable speaker' || transcript == 'disable speaker' || transcript == 'enable audio' || transcript == 'disable audio' || 
							transcript == 'start sound' || transcript == 'stop sound' ||
							transcript == 'stop audio' || transcript == 'stop the audio' || transcript == 'stop de audio' ||
							transcript == 'zet de audio uit' || transcript == 'zet audio uit' || transcript == 'zet het geluid uit' || transcript == 'zet geluid uit' || transcript == 'doe het geluid uit' ||
							transcript == 'zet de audio aan' || transcript == 'zet audio aan' || transcript == 'zet het geluid aan' || transcript == 'zet geluid aan' || transcript == 'doe het geluid aan' ||
							transcript == 'stop het geluid' || transcript == 'stop geluid'
						){
							//console.log("voice command: enable / disable speaker: ", transcript);
							
							if(transcript.startsWith('stop ') || transcript.startsWith('disable ') || transcript.endsWith(' uit')){
								//window.stop_play_document();
								window.disable_speaker();
							}
							else{
								window.enable_speaker();
							}
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							set_state(LISTENING);
						}
						
						else if( transcript == 'stop microphone' || transcript == 'stop the microphone' || transcript == 'disable microphone' || transcript == 'disable the microphone' || transcript == 'disable voice control' || transcript == 'stop voice control' 
							|| transcript == 'zet de microfoon uit' || transcript == 'stop met luisteren' || transcript == 'microfoon uit' || transcript == 'stop microfoon' || transcript == 'stop stembediening'
						){
							//console.log("voice command: enable / disable speaker: ", transcript);
							
							window.stop_microphone();
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							window.task_queue[t].state = 'completed';
							
							set_state(LISTENING);
						}
						
						
						
						// VOICE COMMAND _ SET SEED VALUE
						else if(is_blueprint_command && transcript.startsWith('set seed to ') && !isNaN(transcript.replace('set seed to ',''))){
							let new_seed = parseInt(transcript.replace('set seed to ',''));
							if(typeof new_seed == 'number' && new_seed >= 0 && new_seed <= 1000000){
								window.settings.assistants[window.settings.assistant]['seed'] = new_seed;
								console.log("blueprint command set LLM starting seed to: ", new_seed);
							}
							else{
								console.error("invalid seed proposed via blueprint command: ", new_seed);
							}
							window.task_queue[t].state = 'completed';
						}
						
						
						
						
						// VOICE COMMAND _ TRANSCRIBE FILE
						else if(transcript == 'transcribe' && filename_is_media(current_file_name)){
							window.active_destination = 'document';
							
							
							if(window.settings.assistant != 'scribe'){
								switch_assistant('scribe');
							}
							
							let overlay_transcribe_button = document.getElementById('start-file-transcription-button');
							
							if(overlay_transcribe_button != null){
								overlay_transcribe_button.click();
								window.task_queue[t].state = 'completed';
								
							}
							
							else{
								console.error("transcribe command fell through");
								flash_message(get_translation("Cannot_transcribe"),2000,'fail');
								window.task_queue[t].state = 'failed';
							}
							
						}
						
						
						
						// VOICE COMMAND _ DESCRIBE 
						else if(
							(window.settings.assistant != 'image_to_text' || window.settings.assistant == 'image_to_text' && is_blueprint_command)
							&& (
								transcript == 'describe' 
								|| transcript == 'describe image' 
								|| transcript == 'describe the image' 
								|| transcript == 'describe this image' 
								|| transcript == 'describe the picture' 
								|| transcript == 'describe the video' 
								|| transcript == 'describe the camera' 
								|| transcript == 'describe the camera stream' 
								|| transcript == 'describe the webcam' 
								|| transcript == 'describe video' 
								|| transcript == 'describe camera' 
								|| transcript == 'beschrijf' 
								|| transcript == 'beschrijf de afbeelding' 
								|| transcript == 'beschrijf de foto' 
								|| transcript == 'beschrijf het plaatje' 
								|| transcript == 'beschrijf de camera' 
								|| transcript == 'beschrijf camera' 
								|| transcript == 'beschrijf de video' 
								|| transcript == 'beschrijf de video'
							)
						){
							
							//console.log("HEARD VOICE COMMAND 'DESCRIBE'");
							
							if(window.camera_on == true && window.camera_streaming == true && document.body.classList.contains('show-camera') && camera_image_to_text_details_el.open == true ){
								
								camera_image_to_text_describe_button_el.click();
								
								window.task_queue[t].state = 'completed';
							}
							else{
								let overlay_describe_button = document.getElementById('overlay-describe-file-button');
								if(overlay_describe_button){
									overlay_describe_button.click();
									window.task_queue[t].state == 'completed';
								}
								else{
									flash_message(get_translation("Cannot_describe"),2000,'fail');
									window.task_queue[t].state == 'failed';
								}
							}
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							
							set_state(LISTENING);
						}
						
						
						
						
						// VOICE COMMAND _ SCAN
						else if(transcript == 'scan' || transcript == 'scan document' || transcript == 'scan the document' || transcript == 'scan this document' || transcript == 'scan het document' || transcript == 'scan dit document' || transcript == 'scan page' || transcript == 'scan the page' || transcript == 'scan this page' || transcript == 'scan pagina' || transcript == 'scan de pagina' || transcript == 'scan deze pagina'){ // 
							//console.log("HEARD VOICE COMMAND 'SCAN', so calling start_an_ocr_scan");
							
							if(window.camera_on == true && window.camera_streaming == true && document.body.classList.contains('show-camera') && camera_do_ocr_details_el.open == true ){
								
								window.continuous_ocr_enabled = false;
								window.continuous_image_to_text_enabled = false;
								window.start_an_ocr_scan();
								camera_do_ocr_details_el.setAttribute('open',true);
								camera_image_to_text_details_el.removeAttribute('open');
								const hint_el = document.getElementById('live-ocr-scans-say-scan-hint');
								if(hint_el){
									hint_el.remove();
								}
								window.task_queue[t].state = 'completed';
							}
							else if(window.settings.assistant == 'image_to_text_ocr'){
								let overlay_scan_button = document.getElementById('overlay-scan-file-button');
								if(overlay_scan_button){
									overlay_scan_button.click();
									window.task_queue[t].state == 'completed';
								}
								else{
									flash_message(get_translation("Cannot_scan"),2000,'fail');
									window.task_queue[t].state == 'failed';
								}
							}
							
							
							if(!is_blueprint_command){
								window.task_queue[t].type = 'voice_command';
							}
							
							set_state(LISTENING);
						}
						
						// Do OCR scan
						/*
						else if( document.body.classList.contains('doing-ocr') && (transcript == "scan" || transcript == "scan now" || transcript == "do a scan" || transcript == "maak een scan") ){
							//console.log("STT command was to scan the document");
							if(window.speaker_enabled){
								window.add_task({
									'prompt':null,
									'origin':'chat',
									'type':'speak',
									'state':'should_tts',
									'sentence':'OK',
									'desired_results':0,
									'results':[],
									'destination':'audio_player'
								});
							}
						}
						*/
						
						
						
					
						else if(window.only_allow_voice_commands == false && ( is_blueprint_command && (window.task_queue[t].state == 'failed' || window.task_queue[t].state == 'completed')) == false){
							
							//console.log("handle_completed_task: parsing a transcription that did not seem to be a voice command. result, task: ", result, window.task_queue[t]);
					
							if( is_blueprint_command && (window.task_queue[t].state == 'failed' || window.task_queue[t].state == 'completed')){
								console.error("this blueprint command already has a state of failed or completed: ", window.task_queue[t].state, window.task_queue[t])
							}
							
					
							
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
							//
							// POST STT -> VOICE INPUT
							//
					
							//console.log("handle_completed_task: transcript was not a voice command: ", transcript, task_queue[t]);

					
							// RE-ROUTE SOME SITUATIONS TO THE DOCUMENT INSTEAD
							
							// voice input for scribe should always go to the document
							if(typeof task_queue[t].assistant == 'string' && task_queue[t].assistant == 'scribe' && typeof task_queue[t].origin == 'string' && task_queue[t].origin == 'voice'){
								//console.log("forcing STT result to document because task assistant is Scribe");
								task_queue[t].destination = 'document';
							}
							/*
							if(typeof task_queue[t].origin == 'string' && task_queue[t].origin == 'voice' && window.innerWidth < 641){
								//console.log("handle_completed_task: got STT result on a small screen");
								if(document.body.classList.contains('show-document')){
									//console.log("forcing STT result to document");
									task_queue[t].destination = 'document';
								}
							}
							*/
							
							
							// If low memory, stop Whisper so the prompt can be handled optimally by the LLM
							if(typeof task_queue[t].destination == 'string' && task_queue[t].destination == 'chat' && typeof task_queue[t].assistant == 'string' && task_queue[t].assistant != 'scribe' && !task_queue[t].assistant != 'image_to_text_ocr' && !task_queue[t].assistant != 'developer' && window.ram < 4001){
								
								if(window.microphone_enabled){
									if(window.settings.settings_complexity == 'developer'){
										console.warn("dev: handle_completed_task: post stt: disposing of whisper because of low memory, and an assistant will likely be called next: ", task_queue[t].assistant);
									}
									window.stopped_whisper_because_of_low_memory = true;
									add_body_class('microphone-sleeping');
									//window.disable_microphone();
									if(typeof window.dispose_whisper == 'function'){
										window.dispose_whisper();
									}
									else{
										console.error("window.dispose_whisper was not a function");
									}
									
								}
								else if(window.whisper_worker != null){
									window.dispose_whisper(); // if somewhow microphone was switched off, but whisper worker still exists
								}
								
							}
							
							
							if(task_queue[t].prompt == null){
								
								let destination_file_is_binary = false;
								let destination_folder = null;
								let destination_filename = null;
								
								
								if(typeof window.task_queue[t].file != 'undefined' && window.task_queue[t].file != null && typeof window.task_queue[t].file.folder == 'string' && typeof window.task_queue[t].file.filename == 'string' && window.task_queue[t].file.filename.length && window.task_queue[t].file.filename != unsaved_file_name){
									//console.log("handle_completed_task: insert transcript into the document: task has file data: ", window.task_queue[t].file);
									destination_folder = window.task_queue[t].file.folder;
									destination_filename = window.task_queue[t].file.filename;
								}
								else if(window.settings.docs.open != null && typeof window.settings.docs.open.filename == 'string' && window.settings.docs.open.filename != unsaved_file_name){
									//console.log("handle_completed_task: insert transcript into the document: task did not have file data, falling back to trying currently open file.  task:", window.task_queue[t]);
									destination_folder = window.settings.docs.open.folder;
									destination_filename = window.settings.docs.open.filename;
								}
								
								
								if(typeof destination_folder == 'string' && typeof destination_filename == 'string' && (typeof playground_saved_files[destination_folder + '/' + destination_filename] == 'string' || typeof playground_live_backups[destination_folder + '/' + destination_filename] == 'string')){
									if( typeof playground_live_backups[destination_folder + '/' + destination_filename] == 'string' && playground_live_backups[destination_folder + '/' + destination_filename].startsWith('_PLAYGROUND_BINARY_')){ //  || window.filename_is_binary(destination_filename)
										destination_file_is_binary = true;
									}
									else if( typeof playground_saved_files[destination_folder + '/' + destination_filename] == 'string' && playground_saved_files[destination_folder + '/' + destination_filename].startsWith('_PLAYGROUND_BINARY_')){ //  || window.filename_is_binary(destination_filename)
										destination_file_is_binary = true;
									}
								}
								
								if(task_queue[t].destination == 'document' && destination_file_is_binary){
									console.error("handle_completed_task: STT: force-changing destination to chat.  _PLAYGROUND_BINARY_' detected. Destination file/currently open file seems to be a binary, so destination must be changed from document to chat isntead.  destination_filename:  ", destination_filename);
									task_queue[t].destination = 'chat';
								}
								
								
								
								
								
								
								// VOICE INPUT --> CHAT
								
								// Insert transcript into the chat
								if(task_queue[t].destination == 'chat'){
									//console.log("handle_completed_task: STT transcript should go to chat.  result,task: ", result, task_queue[t]);

									if(result.replaceAll('\n','').trim() == ''){
										console.error("handle_completed_task: result was empty string, setting task to failed");
										window.task_queue[t].state = 'failed';
									}
									else{
										
										
										if(window.ram < 4001 && bad_stt_result == false && typeof result == 'string' && result.trim().length > 1){
											if(window.microphone_enabled === true){
												console.warn("handle_completed_task: Got a seemingly good STT result. Low memory device, so disposing of whisper before it becomes an assistant task. \nresult: \n\n", result,"\n\n");
												//window.disable_microphone();
												if(window.whisper_worker != null && window.whisper_worker_busy == false && typeof window.dispose_whisper == 'function'){
													window.dispose_whisper();
													//window.microphone_enabled = true;
													window.stopped_whisper_because_of_low_memory = true;
													window.add_body_class('microphone-sleeping');
												}
												window.pauseSimpleVAD();
											}
										}
										
										if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'voice' && typeof window.task_queue[t].raw_prompt != 'string'){
											//console.log("handle_completed_task: the task that just went through the post-stt pipeline did actually come from a voice origin. transcript: ", result);
											window.task_queue[t].raw_prompt = '' + result;
										}
										
										
										
										//console.log("handle_completed_task: POST STT: destination is CHAT.  TASK: ", window.task_queue[t]);
										
										// ADD USER PROMPT CHAT MESSAGE
										
										// TODO: AREN'T THESE TWO CHECKS THE SAME?
									
										// Add new user prompt to conversation
										// TODO: check for 'text' in assistant dict media list instead
										if(
											typeof window.task_queue[t].assistant == 'string' 
											&& typeof window.task_queue[t].origin == 'string' 
											&& (window.task_queue[t].origin == 'chat' || window.task_queue[t].origin == 'voice') 
											&& typeof window.task_queue[t].destination == 'string' 
											&& window.task_queue[t].destination == 'chat'
										){
											
											
											//
											//  ADD USER CHAT MESSAGE
											//
											
											window.add_chat_message(window.task_queue[t].assistant,'user',result,null,null,window.task_queue[t].index);
											
											if(typeof window.task_queue[t].chatter == 'boolean' && window.task_queue[t].chatter == true){
												//console.log("chatter is enabled for this assistant, so not creating early assistant response chat message");
												// For a more organic feel, don't add the response message until it's ready
											}
											else{
												//console.log("creating early empty assistant chat message");
												window.add_chat_message(window.task_queue[t].assistant,window.task_queue[t].assistant,'......',null, null,window.task_queue[t].index);
											}
											
											//console.log("handle_completed_task: pushing task user prompt to chat conversation history: ", result);
											add_to_conversation(window.task_queue[t],null,result);
											//window.conversations[window.task_queue[t].assistant].push({'role':'user','content':window.task_queue[t].prompt});
										}
										else{
											console.error("handle_completed_task: NOT ADDING TO CONVERSATION: ", window.task_queue[t]);
										}
									
									
										// Add three-dot waiting for response indicator to chat status
										// TODO: check for 'special' in assistant dict media list instead
										if(
											window.task_queue[t].assistant != 'speak' 
											&& window.task_queue[t].assistant != 'speaker' 
											&& window.task_queue[t].assistant != 'musicgen' 
											&& !window.task_queue[t].assistant.startsWith('image_to_text') 
											&& !window.task_queue[t].assistant.startsWith('text_to_image') 
											&& window.task_queue[t].assistant != 'imager' 
											&& window.task_queue[t].assistant != 'scribe'
										){
											if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'chat' && typeof window.task_queue[t].destination == 'string' && window.task_queue[t].destination == 'chat'){
												set_chat_status(window.task_queue[t],'<div class="dot-flashing-container center"><div class="dot-flashing"></div></div>');
											}
	
										}
										
										
										
										// ADD AI RESPONSE CHAT MESSAGE
										window.task_queue[t] = await window.add_prompt_to_task(window.task_queue[t],result.replaceAll('\n','').trim());
										
										if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'voice' && typeof window.task_queue[t].raw_prompt != 'string'){
											//console.log("handle_completed_task: the task that just went through the post-stt pipeline did actually come from a voice origin. transcript: ", result);
											window.task_queue[t].raw_prompt = '' + result;
										}
									
										// window.task_queue[t].state == 'should_image' || // it seems it's better to let stable diffusion handle the raw language input
										if(
											typeof window.task_queue[t].prompt == 'string' 
											&& typeof window.task_queue[t].type == 'string' 
											&& !window.task_queue[t].type.endsWith('document') 
											&& !window.task_queue[t].type.startsWith('proofread') 
											&& !window.task_queue[t].type.startsWith('rewrite') 
											&& typeof window.task_queue[t].state == 'string' 
											&& (window.task_queue[t].state == 'should_assistant' || window.task_queue[t].state == 'should_musicgen')
										){ 
											
											// TODO: or check type?
											//console.log("handle_completed_task: turning voice command into a chat task: checking if pre-translation step is needed");
										
											//window.last_user_query = window.task_queue[t].prompt;
											//console.log("handle_completed_task: window.last_user_query is now: ", window.last_user_query);
											
											// Find out if the currently loaded AI model already natively supports multiple languages, in which case pre-translation of the prompt is not necessary
											let languages_the_assistant_understands = ['en'];
											if(typeof window.task_queue[t].assistant == 'string' && typeof window.assistants[window.task_queue[t].assistant] != 'undefined' && typeof window.assistants[window.task_queue[t].assistant].languages != 'undefined' && Array.isArray(window.assistants[window.task_queue[t].assistant].languages)){
												languages_the_assistant_understands = window.assistants[window.task_queue[t].assistant].languages;
												if(languages_the_assistant_understands.indexOf('en') == -1){
													console.warn("hack: adding english to list of languges that the model understands: ", languages_the_assistant_understands);
													languages_the_assistant_understands.push('en'); // we assume that all models (also) speak english
												}
											}
											//console.log("handle_completed_task: turning into a chat: languages_the_assistant_understands: ", languages_the_assistant_understands);
											
											if(languages_the_assistant_understands.indexOf(window.settings.language) != -1){
												//console.log("add_task: OK, the assistant understands the currently selected UI language. Let's assume the input language was the same as the UI language for now");// TODO: check that the input language actually is the same?
												//window.task_queue.push(window.task_queue[t]);
											}

											// The prompt should be translated into a language the AI model understands first
											// This uses the Q (queue) system, where a task changes in nature every time it's completed
											else{
												console.warn("handle_completed_task: STT: turning into a chat: the current UI language is not supported by the AI. Pre- and Post- translation seem necessary.  window.settings.language, languages_the_assistant_understands: ", window.settings.language, languages_the_assistant_understands);
	
												let language_detection_result = null;
												let detected_language = null;
												let lingua_franca = null;
											
												let source_text = null;
												if(typeof window.task_queue[t].raw_prompt == 'string'){
													source_text = window.task_queue[t].raw_prompt;
												}
												else if(typeof window.task_queue[t].text == 'string'){
													source_text = window.task_queue[t].text;
												}
												else if(typeof window.task_queue[t].transcription == 'string'){
													source_text = window.task_queue[t].transcription;
												}
												else if(typeof window.task_queue[t].prompt == 'string'){
													source_text = window.task_queue[t].prompt;
												}
												else if(typeof window.task_queue[t].sentence == 'string'){
													source_text = window.task_queue[t].sentence;
												}
												if(source_text.trim() != ''){
													//console.log("handle_completed_task: turning into a chat: checking language of source_text: ", source_text);
		
													add_script('./js/eld.M60.min.js')
													.then((value) => {

														//console.log("handle_completed_task: turning into a chat: loaded language detection script? value: ", value);
														//console.log("handle_completed_task: turning into a chat: language detection script: eld.info: ", eld.info() );

														language_detection_result = eld.detect(source_text);
														//console.log("handle_completed_task: turning into a chat: language_detection_result: ", language_detection_result, source_text);

														// /translation_module.js

														//window.do_translation(task)

														return add_script('./translation_module.js');

													})
													.then((value) => {
														//console.log("handle_completed_task: turning into a chat: translation_module should now be loaded. value: ", value);
														//console.log("handle_completed_task: turning into a chat: language_detection_result is still: ", language_detection_result);
													
														if(translation_details_el.open && typeof window.settings.input_language == 'string'){
															detected_language = window.settings.input_language;
														}
														else if(typeof language_detection_result.language == 'string' && language_detection_result.isReliable()){
															detected_language = language_detection_result.language;
														}
														//console.log("handle_completed_task: turning into a chat: final 'detected' input language: ", detected_language);
	
														if(typeof detected_language == 'string' && languages_the_assistant_understands.indexOf(detected_language) == -1){
															console.warn("handle_completed_task: turning into a chat: The input text has to be translated into a language the model understands first.");
	
															if(typeof window.translation_languages[detected_language] != 'undefined'){
		
																// TODO: also check that the return translation path is available? Maybe a bit much for now, since the lingua_france will most likely be english, and that language is well supported in both directions
																if(languages_the_assistant_understands.indexOf('en') != -1 && typeof window.translation_languages[detected_language]['en'] != 'undefined'){
																	lingua_franca = 'en';
																}
																else if(languages_the_assistant_understands.indexOf('nl') != -1 && typeof window.translation_languages[detected_language]['nl'] != 'undefined'){
																	lingua_franca = 'nl';
																}
																else if(languages_the_assistant_understands.indexOf('de') != -1 && typeof window.translation_languages[detected_language]['de'] != 'undefined'){
																	lingua_franca = 'de';
																}
																else if(languages_the_assistant_understands.indexOf('fr') != -1 && typeof window.translation_languages[detected_language]['fr'] != 'undefined'){
																	lingua_franca = 'fr';
																}
																else if(languages_the_assistant_understands.indexOf('es') != -1 && typeof window.translation_languages[detected_language]['es'] != 'undefined'){
																	lingua_franca = 'es';
																}
																else if(languages_the_assistant_understands.indexOf('pt') != -1 && typeof window.translation_languages[detected_language]['pt'] != 'undefined'){
																	lingua_franca = 'pt';
																}
																else if(languages_the_assistant_understands.indexOf('cn') != -1 && typeof window.translation_languages[detected_language]['cn'] != 'undefined'){
																	lingua_franca = 'cn';
																}
																// TODO: could loop over all available output languages for the detected input language
		
																console.error("handle_completed_task: turning into a chat: final lingua_franca: ", lingua_franca);
																if(lingua_franca == null){
																	console.error("handle_completed_task: turning into a chat: could not find a language that the AI 'understands' to translate the source text into. Aborting.");
																	flash_message(get_translation("The_language_cannot_be_translated_into_a_language_the_AI_understands"),4000,'fail');
																	reject(false);
																	return false
																}
					
																if(typeof window.task_queue[t].state == 'string' && (typeof window.task_queue[t].prompt == 'string' || typeof window.task_queue[t].text == 'string')){
																	window.task_queue[t]['silent'] = true;
																	window.task_queue[t]['return_language'] = detected_language;
																	window.task_queue[t]['lingua_franca'] = lingua_franca;
																
																	let phase2 = {'state':'' + window.task_queue[t].state, 'desired_results': window.task_queue[t]['desired_results']};
																	let phase3 = {'state':'should_translation','input_language': lingua_franca, 'output_language':detected_language, 'desired_results':null};
																	//let phase4 = JSON.parse(JSON.stringify(phase2));
						
						
																	if(window.task_queue[t].assistant != 'musicgen' && window.task_queue[t].assistant != 'imager' && !window.task_queue[t].assistant.startsWith('text_to_image') && window.task_queue[t].assistant != 'speaker'){
																		phase2['silent'] = true;
																		phase3['silent'] = false;
																		//phase4['silent'] = false;
																	}
																	else{
																		phase2['silent'] = false;
																	}
						
						
																	// Phase 2, which is just a delay of the task until after a translation has happened
																	window.task_queue[t].q.unshift(phase2); // will be put back once the pre-translation is complete // unshift, in case there already are tasks in the q, e.g. with the researcher
						
																	window.task_queue[t].state = 'should_translation';
																	window.task_queue[t]['desired_results'] = null;
																	window.task_queue[t]['input_language'] = detected_language;
																	window.task_queue[t]['output_language'] = lingua_franca;
						
																	// Plase 3, in which it is translated back into the original language (optional)
																	if(window.task_queue[t].assistant != 'musicgen' && window.task_queue[t].assistant != 'imager' && !window.task_queue[t].assistant.startsWith('text_to_image') && window.task_queue[t].assistant != 'speaker'){ // enqueu a task 'metamorphosis' to translate it back into the ui language again
																		window.task_queue[t].q.push(phase3);
																		//window.task_queue[t].q.push(phase4);
																	}
																	//console.log("handle_completed_task: turning into a chat: wrapped task in pre- and post-translation. window.task_queue[t].q: ", JSON.stringify(window.task_queue[t].q,null,4));
																
																	if(typeof window.intro_explanations_given['pre_and_post_translation'] == 'undefined'){
																		window.intro_explanations_given['pre_and_post_translation'] = true;
																		add_chat_message('current','developer',get_translation('The_current_AI_does_not_speak_the_language_so_some_back_and_forth_translation_will_be_applied'));
																	}
																}
					
		
															}	
															else{
																console.error("handle_completed_task: turning into a chat: detected language cannot be pre-translated");
																flash_message(get_translation("The_language_cannot_be_translated_into_a_language_the_AI_understands"),4000,'fail');
															}
	
														}
														else{
															//console.log("handle_completed_task: turning into a chat: nice, the input language is a language the AI assistant understands");
															if(languages_the_assistant_understands.indexOf('en') != -1){
																lingua_franca = 'en';
															}
															else{
																lingua_franca = languages_the_assistant_understands[0];
															}
															//window.task_queue.push(window.task_queue[t]);
															update_task_overview();
				
														}
														

													})
													.catch((err) => {
														console.error("handle_completed_task: turning into a chat: Caught general error in language analysis: ", err);
													})
												}
												else{
													console.error("handle_completed_task: turning into a chat: pre-translation check could not run, no text to work with.  window.task_queue[t]: ", window.task_queue[t]);
													//window.task_queue.push(window.task_queue[t]); // TODO: push the task anyway, for now
													//update_task_overview();
												}
	
											}


										}
										
										
										
										
										
										
									}
									
									/*
									if(window.task_queue[t].assistant == 'speaker'){
										
										
										if(window.speaker_enabled == false){
											window.enable_speaker();
										}
										
										
										//window.add_chat_message('current','user',prompt_el.value);
		
										window.add_task({
											'prompt':null,
											'origin':'chat',
											'assistant':'speaker',
											'type':'speak',
											'state':'should_tts',
											'sentence':clean_up_string_for_speaking(result),
											'desired_results':0,
											'results':[],
											'destination':'audio_player'
										});
										//return;
										
										set_state(DOING_TTS);
									
									}
									
									// THIS SHOULD NEVER HAPPEN
									if(window.task_queue[t].assistant == 'scribe'){
										console.error("handle_completed_task: assistant is scribe, but ended up in handling a chat message.  task: ", window.task_queue[t]);
										// Do nothing with a voice chat command when using the scribe // TODO: or route do document if it's open?
										window.task_queue[t].state = 'completed';
										window.task_queue[t].sentence = '' + result;
										window.task_queue[t].type = 'stt_to_document';
									}
								
									// Doing voice input while using the translator assistant
									else if(window.task_queue[t].assistant == 'translator'){
										
										//console.log("received STT result, and assistant is translator");
										if(result.replaceAll('\n','').trim() != ''){
											window.task_queue[t].type = 'translation';
											window.task_queue[t].state = 'should_translation';
											window.task_queue[t].text = '' + result;
											set_state(LISTENING);
									
											//if(window.active_destination == 'chat'){
											window.add_chat_message('translator','user',result);
											set_chat_status(window.task_queue[t],'',2);
										}
										else{
											window.task_queue[t].state = 'failed';
										}
										
									
									}
								
								
									else if(window.task_queue[t].assistant.startsWith('text_to_image') || window.task_queue[t].assistant == 'imager' || window.task_queue[t].assistant == 'musicgen' ){
										
										//console.log("prompt for text-to-image or musicgen.  result,task: ", result, window.task_queue[t]);
										
										if(result.trim() != 'Thank you.' && result.replaceAll('\n','').trim() != ''){
											window.task_queue[t].prompt = result;
											window.task_queue[t].state = 'should_' + window.task_queue[t].assistant;
											
											if(window.task_queue[t].assistant == 'musicgen'){
												window.task_queue[t].type = 'generate_audio';
											}
											else{
												window.task_queue[t].type = 'image';
											}
											
											if(window.task_queue[t].assistant.indexOf('image') != -1){
												
											}
											
										}
										else{
											console.error("handle_completed_task: result was essentially an empty string. task,result: ", window.task_queue[t], result);
											window.task_queue[t].state = 'failed';
										}
										set_state(DOING_TTS);
										//console.log("window.task_queue[t] after: ", window.task_queue[t]);
									
									}
									
									
									else if(window.task_queue[t].assistant == 'image_to_text'){
										
										if(document.body.classList.contains('show-camera') && document.body.classList.contains('hide-camera-still')){
											
											//console.log("STT done, and assistant is image_to_text, and the camera is running, so trying to get latest blob from stream");
											window.get_camera_jpeg_blob()
											.then((blob) => {
												do_prompt({'assistant':window.task_queue[t].assistant},result);
											})
											.catch((err) => {
												console.error("handle_completed_task: STT: failed to take picture to handle STT: ", err);
											})
										}
								
										else if(result.replaceAll('\n','').trim() != ''){
											do_prompt({'assistant':window.task_queue[t].assistant},result);
										}
										else{
											console.error("handle_completed_task: result was essentially an empty string. task,result: ", window.task_queue[t], result);
											window.task_queue[t].state = 'failed';
										}
										set_state(DOING_TTS);
									
									}
								
								
									else if(result.replaceAll('\n','').trim() != ''){
										//console.log("handle_completed_task: turning voice command into a chat task.  result: ", result);
										
										//window.conversations[window.currently_loaded_assistant].push({'role':'user','content':result});
										while(result.startsWith(' ')){
											//console.log("handle_completed_task: removed space from beginning of chat response");
											result = result.substr(1);
										}
										window.task_queue[t].type = 'chat';
										window.task_queue[t].state = 'should_assistant';
										window.task_queue[t].prompt = '' + result;
										
										// TODO: remove this? See what happens?
										set_state(DOING_ASSISTANT);
									
										window.task_queue[t] = await window.do_prompt(window.task_queue[t]);
									
										if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'voice' && typeof window.task_queue[t].raw_prompt != 'string'){
											//console.log("handle_completed_task: the task that just went through the post-stt pipeline did actually come from a voice origin. transcript: ", result);
											window.task_queue[t].raw_prompt = '' + result;
										}
									
										// window.task_queue[t].state == 'should_image' || // it seems it's better to let stable diffusion handle the raw language input
										if(
											typeof window.task_queue[t].prompt == 'string' 
											&& typeof window.task_queue[t].type == 'string' 
											&& !window.task_queue[t].type.endsWith('document') 
											&& !window.task_queue[t].type.startsWith('proofread') 
											&& !window.task_queue[t].type.startsWith('rewrite') 
											&& typeof window.task_queue[t].state == 'string' 
											&& (window.task_queue[t].state == 'should_assistant' || window.task_queue[t].state == 'should_musicgen')
										){ 
											
											// TODO: or check type?
											//console.log("handle_completed_task: turning voice command into a chat task: checking if pre-translation step is needed");
										
											//window.last_user_query = window.task_queue[t].prompt;
											//console.log("handle_completed_task: window.last_user_query is now: ", window.last_user_query);
											
											// Find out if the currently loaded AI model already natively supports multiple languages, in which case pre-translation of the prompt is not necessary
											let languages_the_assistant_understands = ['en'];
											if(typeof window.task_queue[t].assistant == 'string' && typeof window.assistants[window.task_queue[t].assistant] != 'undefined' && typeof window.assistants[window.task_queue[t].assistant].languages != 'undefined' && Array.isArray(window.assistants[window.task_queue[t].assistant].languages)){
												languages_the_assistant_understands = window.assistants[window.task_queue[t].assistant].languages;
												if(languages_the_assistant_understands.indexOf('en') == -1){
													console.warn("hack: adding english to list of languges that the model understands: ", languages_the_assistant_understands);
													languages_the_assistant_understands.push('en'); // we assume that all models (also) speak english
												}
											}
											//console.log("handle_completed_task: turning into a chat: languages_the_assistant_understands: ", languages_the_assistant_understands);
											
											if(languages_the_assistant_understands.indexOf(window.settings.language) != -1){
												//console.log("add_task: OK, the assistant understands the currently selected UI language. Let's assume the input language was the same as the UI language for now");// TODO: check that the input language actually is the same?
												//window.task_queue.push(window.task_queue[t]);
											}

											// The prompt should be translated into a language the AI model understands first
											// This uses the Q (queue) system, where a task changes in nature every time it's completed
											else{
												console.warn("handle_completed_task: turning into a chat: the current UI language is not supported by the AI. Pre- and Post- translation seem necessary.  window.settings.language, languages_the_assistant_understands: ", window.settings.language, languages_the_assistant_understands);
	
												let language_detection_result = null;
												let detected_language = null;
												let lingua_franca = null;
											
												let source_text = null;
												if(typeof window.task_queue[t].raw_prompt == 'string'){
													source_text = window.task_queue[t].raw_prompt;
												}
												else if(typeof window.task_queue[t].text == 'string'){
													source_text = window.task_queue[t].text;
												}
												else if(typeof window.task_queue[t].transcription == 'string'){
													source_text = window.task_queue[t].transcription;
												}
												else if(typeof window.task_queue[t].prompt == 'string'){
													source_text = window.task_queue[t].prompt;
												}
												else if(typeof window.task_queue[t].sentence == 'string'){
													source_text = window.task_queue[t].sentence;
												}
												if(source_text.trim() != ''){
													//console.log("handle_completed_task: turning into a chat: checking language of source_text: ", source_text);
		
													add_script('./js/eld.M60.min.js')
													.then((value) => {

														//console.log("handle_completed_task: turning into a chat: loaded language detection script? value: ", value);
														//console.log("handle_completed_task: turning into a chat: language detection script: eld.info: ", eld.info() );

														language_detection_result = eld.detect(source_text);
														//console.log("handle_completed_task: turning into a chat: language_detection_result: ", language_detection_result, source_text);

														// /translation_module.js

														//window.do_translation(task)

														return add_script('./translation_module.js');

													})
													.then((value) => {
														//console.log("handle_completed_task: turning into a chat: translation_module should now be loaded. value: ", value);
														//console.log("handle_completed_task: turning into a chat: language_detection_result is still: ", language_detection_result);
													
														if(translation_details_el.open && typeof window.settings.input_language == 'string'){
															detected_language = window.settings.input_language;
														}
														else if(typeof language_detection_result.language == 'string' && language_detection_result.isReliable()){
															detected_language = language_detection_result.language;
														}
														//console.log("handle_completed_task: turning into a chat: final 'detected' input language: ", detected_language);
	
														if(typeof detected_language == 'string' && languages_the_assistant_understands.indexOf(detected_language) == -1){
															console.warn("handle_completed_task: turning into a chat: The input text has to be translated into a language the model understands first.");
	
															if(typeof window.translation_languages[detected_language] != 'undefined'){
		
																// TODO: also check that the return translation path is available? Maybe a bit much for now, since the lingua_france will most likely be english, and that language is well supported in both directions
																if(languages_the_assistant_understands.indexOf('en') != -1 && typeof window.translation_languages[detected_language]['en'] != 'undefined'){
																	lingua_franca = 'en';
																}
																else if(languages_the_assistant_understands.indexOf('nl') != -1 && typeof window.translation_languages[detected_language]['nl'] != 'undefined'){
																	lingua_franca = 'nl';
																}
																else if(languages_the_assistant_understands.indexOf('de') != -1 && typeof window.translation_languages[detected_language]['de'] != 'undefined'){
																	lingua_franca = 'de';
																}
																else if(languages_the_assistant_understands.indexOf('fr') != -1 && typeof window.translation_languages[detected_language]['fr'] != 'undefined'){
																	lingua_franca = 'fr';
																}
																else if(languages_the_assistant_understands.indexOf('es') != -1 && typeof window.translation_languages[detected_language]['es'] != 'undefined'){
																	lingua_franca = 'es';
																}
																else if(languages_the_assistant_understands.indexOf('pt') != -1 && typeof window.translation_languages[detected_language]['pt'] != 'undefined'){
																	lingua_franca = 'pt';
																}
																else if(languages_the_assistant_understands.indexOf('cn') != -1 && typeof window.translation_languages[detected_language]['cn'] != 'undefined'){
																	lingua_franca = 'cn';
																}
																// TODO: could loop over all available output languages for the detected input language
		
																console.error("handle_completed_task: turning into a chat: final lingua_franca: ", lingua_franca);
																if(lingua_franca == null){
																	console.error("handle_completed_task: turning into a chat: could not find a language that the AI 'understands' to translate the source text into. Aborting.");
																	flash_message(get_translation("The_language_cannot_be_translated_into_a_language_the_AI_understands"),4000,'fail');
																	reject(false);
																	return false
																}
					
																if(typeof window.task_queue[t].state == 'string' && (typeof window.task_queue[t].prompt == 'string' || typeof window.task_queue[t].text == 'string')){
																	window.task_queue[t]['silent'] = true;
																	window.task_queue[t]['return_language'] = detected_language;
																	window.task_queue[t]['lingua_franca'] = lingua_franca;
																
																	let phase2 = {'state':'' + window.task_queue[t].state, 'desired_results': window.task_queue[t]['desired_results']};
																	let phase3 = {'state':'should_translation','input_language': lingua_franca, 'output_language':detected_language, 'desired_results':null};
																	//let phase4 = JSON.parse(JSON.stringify(phase2));
						
						
																	if(window.task_queue[t].assistant != 'musicgen' && window.task_queue[t].assistant != 'imager' && !window.task_queue[t].assistant.startsWith('text_to_image') && window.task_queue[t].assistant != 'speaker'){
																		phase2['silent'] = true;
																		phase3['silent'] = false;
																		//phase4['silent'] = false;
																	}
																	else{
																		phase2['silent'] = false;
																	}
						
						
																	// Phase 2, which is just a delay of the task until after a translation has happened
																	window.task_queue[t].q.unshift(phase2); // will be put back once the pre-translation is complete // unshift, in case there already are tasks in the q, e.g. with the researcher
						
																	window.task_queue[t].state = 'should_translation';
																	window.task_queue[t]['desired_results'] = null;
																	window.task_queue[t]['input_language'] = detected_language;
																	window.task_queue[t]['output_language'] = lingua_franca;
						
																	// Plase 3, in which it is translated back into the original language (optional)
																	if(window.task_queue[t].assistant != 'musicgen' && window.task_queue[t].assistant != 'imager' && !window.task_queue[t].assistant.startsWith('text_to_image') && window.task_queue[t].assistant != 'speaker'){ // enqueu a task 'metamorphosis' to translate it back into the ui language again
																		window.task_queue[t].q.push(phase3);
																		//window.task_queue[t].q.push(phase4);
																	}
																	//console.log("handle_completed_task: turning into a chat: wrapped task in pre- and post-translation. window.task_queue[t].q: ", JSON.stringify(window.task_queue[t].q,null,4));
																
																	if(typeof window.intro_explanations_given['pre_and_post_translation'] == 'undefined'){
																		window.intro_explanations_given['pre_and_post_translation'] = true;
																		add_chat_message('current','developer',get_translation('The_current_AI_does_not_speak_the_language_so_some_back_and_forth_translation_will_be_applied'));
																	}
																}
					
		
															}	
															else{
																console.error("handle_completed_task: turning into a chat: detected language cannot be pre-translated");
																flash_message(get_translation("The_language_cannot_be_translated_into_a_language_the_AI_understands"),4000,'fail');
															}
	
														}
														else{
															//console.log("handle_completed_task: turning into a chat: nice, the input language is a language the AI assistant understands");
															if(languages_the_assistant_understands.indexOf('en') != -1){
																lingua_franca = 'en';
															}
															else{
																lingua_franca = languages_the_assistant_understands[0];
															}
															//window.task_queue.push(window.task_queue[t]);
															update_task_overview();
				
														}
														

													})
													.catch((err) => {
														console.error("handle_completed_task: turning into a chat: Caught general error in language analysis: ", err);
													})
												}
												else{
													console.error("handle_completed_task: turning into a chat: pre-translation check could not run, no text to work with.  window.task_queue[t]: ", window.task_queue[t]);
													window.task_queue.push(window.task_queue[t]); // TODO: push the task anyway, for now
													//update_task_overview();
												}
	
											}


										}
									
									
										// TODO: AREN'T THESE TWO CHECKS THE SAME?
									
										// Add new user prompt to conversation
										// TODO: check for 'text' in assistant dict media list instead
										if(typeof window.task_queue[t].assistant == 'string' && typeof window.task_queue[t].prompt == 'string' && typeof window.task_queue[t].origin == 'string' && (window.task_queue[t].origin == 'chat' || window.task_queue[t].origin == 'voice') && typeof window.task_queue[t].destination == 'string' && window.task_queue[t].destination == 'chat'){
											//console.log("handle_completed_task: pushing task user prompt to chat conversation history: ", window.task_queue[t].prompt);
											add_to_conversation(window.task_queue[t]);
											//window.conversations[window.task_queue[t].assistant].push({'role':'user','content':window.task_queue[t].prompt});
										}
										else{
											console.error("handle_completed_task: NOT ADDING TO CONVERSATION: ", window.task_queue[t]);
										}
									
										// TODO: check for 'special' in assistant dict media list instead
										if(
											window.task_queue[t].assistant != 'speaker' 
											&& window.task_queue[t].assistant != 'musicgen' 
											&& !window.task_queue[t].assistant.startsWith('image_to_text') 
											&& !window.task_queue[t].assistant.startsWith('text_to_image') 
											&& window.task_queue[t].assistant != 'imager' 
											&& window.task_queue[t].assistant != 'scribe'
										){
											if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'chat' && typeof window.task_queue[t].destination == 'string' && window.task_queue[t].destination == 'chat'){
												set_chat_status(window.task_queue[t],'<div class="dot-flashing-container center"><div class="dot-flashing"></div></div>');
											}
	
										}
									}
									else{
										console.error("handle_completed_task: result was essentially an empty string. result, task", result, window.task_queue[t]);
										window.task_queue[t].state = 'failed';
									}
									
									*/
									
								}
								
								
								// VOICE INPUT --> DOCUMENT
						
								// insert transcript into the document
								else if(task_queue[t].destination == 'document'){
									if(window.testing){
										console.warn("handle_completed_task: STT result should be placed in a document");
									}
									
									if(task_queue[t].assistant == 'scribe' && typeof task_queue[t].origin == 'string' && task_queue[t].origin == 'voice' && window.current_scribe_voice_parent_task_id == null){
										window.create_scribe_parent_task('voice');
										if(window.current_scribe_voice_parent_task_id != null){
											// quickly send the current result to fill up the new parent
											handle_completed_task({'index':window.current_scribe_voice_parent_task_id},result,task_meta,extra);
										}
									}
									
									
									if( (typeof result != 'string' || (typeof result == 'string' && result.trim() == '')) && (typeof note != 'string' || (typeof note == 'string' && note.trim() == ''))){
										console.error("insert transcript into the document: nothing to place in the document");
									}
									else if(task_queue[t].origin == 'blueprint' && current_file_name.endsWith('.blueprint')){
										console.error("handle_completed_task: blueprint task cannot insert into a blueprint");
										flash_message(get_translation('A_blueprint_task_cannot_write_to_a_blueprint_document'),3000,'fail');
										task_queue[t].state = 'failed';
									}
									// typeof window.task_queue[t].origin == 'string' window.task_queue[t].origin.endsWith('file') && 
									else if(typeof window.task_queue[t].file != 'undefined' && window.task_queue[t].file != null && typeof window.task_queue[t].file.folder == 'string' && typeof window.task_queue[t].file.filename == 'string' && window.task_queue[t].file.filename.length && window.task_queue[t].file.filename != unsaved_file_name){
										//console.log("handle_completed_task: insert transcript into the document: task has file data: ", window.task_queue[t].file);
										destination_folder = window.task_queue[t].file.folder;
										destination_filename = window.task_queue[t].file.filename;
									}
									else if(window.settings.docs.open != null && typeof window.settings.docs.open.filename == 'string' && window.settings.docs.open.filename != unsaved_file_name){
										//console.log("handle_completed_task: insert transcript into the document: task did not have file data, falling back to trying currently open file.  task:", window.task_queue[t]);
										destination_folder = window.settings.docs.open.folder;
										destination_filename = window.settings.docs.open.filename;
									}
									/*
									else if(typeof current_file_name == 'string' && current_file_name.length && current_file_name != unsaved_file_name){
										destination_folder = folder;
										destination_filename = filename;
									}
									*/
									
									if(typeof destination_folder == 'string' && typeof destination_filename == 'string' && (typeof playground_saved_files[destination_folder + '/' + destination_filename] == 'string' || typeof playground_live_backups[destination_folder + '/' + destination_filename] == 'string')){
										if( typeof playground_live_backups[destination_folder + '/' + destination_filename] == 'string' && playground_live_backups[destination_folder + '/' + destination_filename].startsWith('_PLAYGROUND_BINARY_')){ //  || window.filename_is_binary(destination_filename)
											console.error("handle_completed_task: STT result should be written to file, but the destination_file seems to be a binary: ", destination_filename);
											destination_file_is_binary = true;
										}
										else if( typeof playground_saved_files[destination_folder + '/' + destination_filename] == 'string' && playground_saved_files[destination_folder + '/' + destination_filename].startsWith('_PLAYGROUND_BINARY_')){ //  || window.filename_is_binary(destination_filename)
											console.error("handle_completed_task: STT result should be written to file, but the destination_file seems to be a binary: ", destination_filename);
											destination_file_is_binary = true;
										}
										/*
										else if( typeof playground_saved_files[destination_folder + '/' + destination_filename] == 'string' && !playground_saved_files[destination_folder + '/' + destination_filename].startsWith('_PLAYGROUND_BINARY_') && typeof playground_saved_files[destination_folder + '/' + destination_filename] == 'undefined'){ //  || window.filename_is_binary(destination_filename)
											console.error("handle_completed_task: STT result should be written to file. There is a saved file, but not a live backup. Creating the live backup now for: ", destination_filename);
											playground_live_backups[destination_folder + '/' + destination_filename] = '' + playground_saved_files[destination_folder + '/' + destination_filename];
											//flash_message(get_translation("Cannot_write_text_in_the_currently_open_file"),3000,'fail');
											//destination_file_is_binary = true;
										}
										*/
										
										
										if(destination_file_is_binary == true){
											flash_message(get_translation("Cannot_write_text_in_the_currently_open_file"),3000,'fail');
										}
										else{
											if(window.task_queue[t].assistant == 'translator'){
												window.task_queue[t].type = 'translation';
												window.task_queue[t].state = 'should_translation';
												window.task_queue[t].text = '' + result;
												set_state(LISTENING);
										
												if(window.settings.assistants['translator'].add_both_languages_to_documents && typeof window.task_queue[t].input_language == 'string' && typeof window.doc_text == 'string' && window.settings.docs.open != null && current_file_name != unsaved_file_name && result.trim() != ''){
													language_indicator = window.task_queue[t].input_language.toUpperCase() + ': ';
													insert_into_document(window.task_queue[t], '\n' + language_indicator + result.trim() + '\n'); // ,{'position':'end'}
												}
												
											}
											else if(window.task_queue[t].assistant == 'scribe'){ // Scribe also adds meta-sounds and timestamps to document
										
												//console.log("handle_completed_task: scribe task is done:  result,task: ", result, window.task_queue[t]);
												
												if(typeof window.task_queue[t].origin == 'string' && !window.task_queue[t].origin.endsWith('file') && window.last_time_scribe_started == null){
													//window.last_time_scribe_started = Date.now();
												}
												
												// Voice origin
												if(typeof window.task_queue[t].origin == 'string' && !window.task_queue[t].origin.endsWith('file') && typeof window.last_time_scribe_started == 'number' && (Date.now() - window.last_time_scribe_started) > window.maximum_scribe_duration){
													console.warn("handle_completed_task: scribe has been running for more than an hour. window.last_time_scribe_started: ", window.last_time_scribe_started);
													flash_message(get_translation('To_protect_privacy_scribe_is_limited_to_running_one_hour_at_a_time'),7000,'warn');
													window.task_queue[t].state = 'failed';
													window.disable_microphone();
													window.last_time_scribe_started = null;
												}
												
												// no parent index
												else if(typeof window.task_queue[t].parent_index == 'undefined'){
													
													if(note.trim() != '' ){ // && typeof window.task_queue[t].parent_index == 'undefined'
														//console.log("SCRIBE -> NOTE: ", note);
													
													
														if(typeof extra != 'undefined' && extra != null){
															//console.log("transcription: adding extra to results");
															window.task_queue[t].results.push(extra);
														}
														else{
															console.error("transcription: NOT adding extra to results, adding note instead");
															window.task_queue[t].results.push(note);
														}
													
														window.whisper_snippets_to_text(window.task_queue[t]);
														
														window.task_queue[t].state = 'completed';
													}
													else{
														console.warn("scribe task has no parent_index, and note was empty string");
														window.task_queue[t].state = 'failed';
													}
													
												
												}
												else if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin.endsWith('file')){
													//console.log("scribe file transcription task has a parent index, so the child task is done");
													window.task_queue[t].state = 'completed';
												}
												else{
													//console.log("scribe voice transcription task has a parent index, so the child task is done");
													window.task_queue[t].state = 'completed';
													
												}
									
											}
											else{
												
												if(!is_blueprint_command){
													//console.log("This STT result should be copied into a document. Task, result: ", window.task_queue[t],result);
													window.task_queue[t].type = 'stt_to_document'; // this is not used for anything (yet), just to remember that this task was speech-to-document
												}
										
												if(is_blueprint_command && window.task_queue[t].state == 'completed'){
													//console.log("blueprint task was already completed, so not inserting the result to the document (was likely a blueprint command): ", result);
												}
												else{
													if(typeof result == 'string' && result.length){
														if(!result.endsWith(' ') && !result.endsWith('\n')){
															//console.log("handle_completed_task: adding an empty space to the end of the result");
															result += ' ';
														}
														insert_into_document(window.task_queue[t],result);
													}
													/*
													
													if(typeof window.doc_text == 'string' && typeof result == 'string' && result != ''){
														if(window.doc_text.startsWith('_PLAYGROUND_BINARY_') ){ // || window.filename_is_binary(destination_filename)
															flash_message(get_translation("Cannot write text in the currently open file"),3000,'fail');
														}
														else{
															//insert_into_document(window.task_queue[t],note,{'position':'end'});
											
															
														}
													}
													*/
												}
												
												window.task_queue[t].state = 'completed';
											}
										}
										
									}
									
								
									set_state(LISTENING);
									// could figure out some more commands, like summarize or continue or 'write a paragraph about'
								}
							}
							else{
								console.error("STT task already had a prompt");
							}
					
							
						}
						else{
							console.warn("window.only_allow_voice_commands was true, and this voice input has fallen through: ", transcript);
							window.task_queue[t].state = 'completed';
							window.only_allow_voice_commands = false;
						}
						
						if(window.task_queue[t].state != 'completed' && window.task_queue[t].state != 'failed'){
							//console.log("after STT task was not yet completed (or failed). task.state is: ", window.task_queue[t].state);
							if(window.task_queue[t].type == 'should_stt'){
								console.error("task type was (still) 'should_stt', indicating the type was unknown because it was a voice command. But it should be another type by now");
							}
						}
						else if(window.task_queue[t].state == 'completed'){
							//console.log("handle_task_completed: \n\nGOOD NEWS! \n\ntask state has changed to completed");
							if(window.task_queue[t].type == 'chat'){
								set_chat_status(window.task_queue[t],'');
							}
						}
				
						if(window.task_queue[t].state == 'doing_stt'){
							console.error("handle_completed_task: task with state 'doing_stt' fell through: ", window.task_queue[t]);
							window.task_queue[t].state = 'failed';
						}
						else if(window.task_queue[t].state == 'doing_tts'){
							console.error("handle_completed_task: task with state 'doing_tts' fell through");
							window.task_queue[t].state = 'failed';
						}
						else if(window.task_queue[t].state == 'doing_audio_player'){
							console.error("handle_completed_task: task with state 'doing_audio_player' fell through");
							window.task_queue[t].state = 'failed';
						}
	
	
						// Update UI based on any changes to the task, or that happened during the process
				
						if(window.active_destination == 'document'){ // voice commands can create a new document, which set the document pane to active
							add_body_class('document-active');
						}
						else if(window.active_destination == 'chat'){
							remove_body_class('document-active');
						}
				
						
					
					}
				}
				
				
				
				
				if(typeof window.task_queue[t].parent_index == 'number' && inform_parent){
					setTimeout(() => {
						handle_completed_task({'index':window.task_queue[t].parent_index}, result, null, extra);
					},1);
					
				}
				if(typeof window.task_queue[t].parent_index == 'number' && inform_parent){
					//console.log("task has a parent_index, but inform_parent was false. Likely a blueprint task that needs to do more work");
				}
				
			}
			
			
			
			//
			//  POST ASSISTANT ROUTING
			//
			
			else if(window.task_queue[t].state == 'doing_assistant'){
				
				remove_body_class('doing-assistant');
				
				if(typeof window.task_queue[t]['handled_by'] == 'undefined'){
					window.task_queue[t]['handled_by'] = [];
				}
				if(typeof window.task_queue[t].assistant == 'string'){
					window.task_queue[t]['handled_by'].push(window.task_queue[t].assistant);
				}
				
				
				if(typeof window.task_queue[t].destination == 'string' && typeof window.task_queue[t].assistant == 'string' && window.task_queue[t].destination == 'chat'){
					//console.log("post assistant: destination is chat.  window.task_queue[t].assistant =?= window.setting.assistant: ", window.task_queue[t].assistant, window.settings.assistant);
					if(window.task_queue[t].assistant != window.settings.assistant){
						//console.log("post assistant: destination is chat and the task.assistant is not the currently visible one: ", window.task_queue[t].assistant, window.settings.assistant);
						if(typeof window.unread_messages[window.settings.assistant] == 'number'){
							window.unread_messages[window.task_queue[t].assistant]++; // = window.unread_messages[pane] + 1;
						}
						else{
							window.unread_messages[window.task_queue[t].assistant] = 1;
						}
						//console.log("window.unread_messages is now: ", window.unread_messages);
					}
				}
				
				// Add result to chat conversation
				if(window.task_queue[t].type == 'chat'){
					/*
					if(typeof window.conversations[window.currently_loaded_assistant] == 'undefined'){
						window.conversations[window.currently_loaded_assistant] = [];
					}
					*/
					//console.log("handle_completed_task: pushing assistant content to chat conversation history: ", result);
					if(typeof result == 'string'){
						const add_to_conversation_result = await add_response_to_conversation(window.task_queue[t],result);
						//console.log("add_to_conversation_result: ", add_to_conversation_result);
						/*
						if(add_to_conversation_result === true){
							//console.log("handle_completed_task: succesfully filled in the conversation by adding the result: ", result);
							//console.log("handle_completed_task: succesfully filled in the conversation");
						}else{
							//console.error("handle_completed_task: add_response_to_conversation failed.  window.task_queue[t],result: ", window.task_queue[t], result);
						}
						*/
						
						
						if(window.settings.show_notifications == true && window.pip_started == false && window.page_has_focus == false){ // && window.page_has_focus == false
							//console.log("handle_completed_task: should show result in a notification");
							window.send_notification(window.task_queue[t], window.get_translation(window.task_queue[t].assistant + '_name'), result); // title is assistant name,  body is result
						}
						
					}
					
					if(window.ram < 4001 && window.speaker_enabled){
						
						// Unload the current AI as we need the memory for generating audio
						if(window.settings.settings_complexity == 'developer'){
							console.warn("dev: handle_completed_task: calling do_unload to unload everything, so that TTS has plenty of memory");
						}
						window.task_started = 10;
						window.doing_low_memory_tts_chat_response = true;
						
						window.do_unload([]);
						if(window.whisper_worker != null && window.whisper_worker_busy == false && typeof window.dispose_whisper == 'function' && window.whisper_loaded == true){
							if(window.settings.settings_complexity == 'developer'){
								console.warn("freeing up memory for TTS by disposing whisper");
							}
							window.dispose_whisper();
							//window.microphone_enabled = true;
							window.stopped_whisper_because_of_low_memory = true;
							window.add_body_class('microphone-sleeping');
						}
						else{
							//console.log("whisper is already disposed. window.whisper_worker: ", window.whisper_worker);
						}
					}
					
				}
				
				
				// If a parent task exists, update that too.
				if(typeof window.task_queue[t].parent_index == 'number'){
					setTimeout(() => {
						//console.log("calling handle_completed_task from handle_completed_task to update parent task. parent_index: ", window.task_queue[t].parent_index);
						handle_completed_task({'index':window.task_queue[t].parent_index}, result);
					},1);
				}
				
				
				// If a result text was provided (output from an LLM), then it should be added to the results list. Sometimes that list already contains data from processing the chunks earlier, but sometimes not (with coding and recipe assistants)
				if(typeof window.task_queue[t]['desired_results'] == 'number' && window.task_queue[t]['results'].length <= window.task_queue[t]['desired_results']){
					
					if(window.task_queue[t]['desired_results'] > 0 && typeof result == 'string'){
						//console.log("handle_completed_task: Adding result to task results array.");
						//window.task_queue[t]['results'].push({'text':result,'sentences':[],'audio':null,'spoken':false,'state':'completed'}); // not sure if setting the result to completed is wise yet
						window.task_queue[t]['results'].push(result); 
						
						if(window.task_queue[t].results.length == window.task_queue[t].desired_results){
							//console.log("all desired results have been generated by the assistant: ", window.task_queue[t].desired_results, window.task_queue[t]);
							window.task_queue[t]['state'] = 'completed';
						}
						else{
							//console.log("handle_completed_task: not all desired results have been generated yet");
						}
						
						
						if(window.task_queue[t].type == 'chat'){ 
							// are chat results even allowed to have multiple results? makes little sense..
							// && window.task_queue[t]['results'].length == window.task_queue[t].desired_results
							//console.log("handle_completed_task: assistant returned complete chat response.  chatter,result: ", chatter, result);
							
							//remove_body_class('doing-assistant');
							//remove_body_class('waiting-for-response'); // better to handle these later, after updating the buffer counts?
							
							window.task_queue[t].state = 'completed';
							
							if(chatter){
								if(typeof window.task_queue[t].incomplete_sentence == 'string' && window.task_queue[t].incomplete_sentence != ''){
									if(!window.task_queue[t].incomplete_sentence.startsWith('<') && !window.task_queue[t].incomplete_sentence.endsWith('>')){
										window.add_chat_message(assistant_id,assistant_id,window.task_queue[t].incomplete_sentence);
									}
									window.task_queue[t].sentences.push(window.task_queue[t].incomplete_sentence);
									window.task_queue[t].incomplete_sentence = null;
								}
							}
							else{
								
								// task_output_el.setAttribute('id','chat-message-task-' + special_task_index_prefix + participant + task_index);
								
								
								
								
								let existing_chat_message_el = document.querySelector('#chat-message-' + assistant_id + '-' + assistant_id + window.task_queue[t].index);
								if(existing_chat_message_el){
									let existing_inner_bubble_el = existing_chat_message_el.querySelector('.bubble');
									if(existing_inner_bubble_el){
										//existing_inner_bubble_el.innerHTML = result;
										existing_inner_bubble_el = place_message_in_bubble(existing_inner_bubble_el,result,assistant_id);
									}
									else{
										console.error("found existing chat message, but it had no inner '.bubble' element?  existing_chat_message_el: ", existing_chat_message_el );
										window.add_chat_message(assistant_id,assistant_id,result);
									}
								}
								else{
									console.warn("did not find an existing_chat_bubble_output_el, so calling add_chat_message now");
									window.add_chat_message(assistant_id,assistant_id,result,null,null,window.task_queue[t].index);
								}
								
								// Add insert into document buttons to chat bubble
								if(existing_chat_message_el == null){
									existing_chat_message_el = document.querySelector('#chat-message-' + assistant_id + '-' + assistant_id + window.task_queue[t].index);
								}
								if(existing_chat_message_el){
									let existing_inner_bubble_wrap_el = existing_chat_message_el.querySelector('.chat-bubble-wrap');
									if(existing_inner_bubble_wrap_el){
										let insert_into_doc_buttons_el = create_insert_into_doc_buttons(result);
										if(insert_into_doc_buttons_el){
											existing_inner_bubble_wrap_el.appendChild(insert_into_doc_buttons_el);
										}
									}
								}
							}
							
							window.set_chat_status(window.task_queue[t],'');
							
							window.task_queue[t]['sentence'] = result;
							
							if(window.speaker_enabled){
								
								if(typeof result == 'string' && result == window.task_queue[t].incomplete_sentence){
									console.warn("handle_completed_task: chat task: RESULT IS SAME AS INCOMPLETE SENTENCE: ", result);
									
									//console.log("speaker is enabled, so turning the chat task which had an incomplete sentence into a speak command, with state 'should_tts'. result: ", result);
									window.task_queue[t]['type'] = 'speak';
									window.task_queue[t]['state'] = 'should_tts';
									window.task_queue[t]['sentence'] = result;
									
									// TODO: or generate new speak tasks, one for each sentence?
									// maybe automate that with a function?
									
								}
								
							}
							else{
								//console.log("handle_completed_task: assistant is done, and speaker is disabled.")
								
								if(window.state == DOING_ASSISTANT){
									//console.log("handle_completed_task: state was doing_assistant, switching it back to listening/unloaded");
									window.set_state(LISTENING);
								}
							}
						}
						
						else if(window.task_queue[t].type == 'prompt_at_line'){
							//console.log("handle_completed_task: assistant returned a complete prompt_at_line response");
							window.settings.prompt_at_line = result;
							save_settings();
							const selection = get_selection_from_task(window.task_queue[t]);
							if(selection != null){
								insert_into_document(window.task_queue[t],result + '\n\n');
							}
							else{
								//if(typeof window.task_queue[t].file != 'undefined' && typeof window.task_queue[t].file.folder == 'string' && window.task_queue[t].file.folder == folder && typeof window.task_queue[t].file.filename == 'string' && window.task_queue[t].file.filename == current_file_name)
								insert_into_document(window.task_queue[t],result + '\n\n',{"position":"end"});
								//console.error("handle_completed_task: prompt at line, but no selection");
							}
							set_chat_status(window.task_queue[t],'');
							remove_body_class('doing-assistant');
							remove_body_class('waiting-for-response');
							remove_body_class('doing-prompt-at-line');
						}
						
						else if(window.task_queue[t].type == 'continue'){
							//console.log("handle_completed_task: assistant returned complete continue response: ", result);
							remove_body_class('doing-continue');
							remove_body_class('doing-assistant');
							/*
							if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'selection'){
								const selection = get_selection_from_task(window.task_queue[t]);
								if(selection != null){
									insert_into_document(window.task_queue[t],result);
								}
								else{
									console.error("failed to get selection to insert continue result into document: ", result);
								}
							}
							*/
							remove_highlight_selection();
						}
						
						
						
						if(window.task_queue[t].type == 'summarize'){
							//console.log("handle_completed_task: assistant returned a complete summarize response");
							// TODO: if one summarization result, and if short enough, output as chat? Otherwise as new document?
							// If multiple results have accumulated, show a UI to pick one? Although that's more relevant for summarize :-)
							// Or just always show the user a UI?
							
							
							
							if( typeof window.task_queue[t].desired_results == 'number' && typeof window.task_queue[t].results != 'undefined' && Array.isArray(window.task_queue[t].results) ){
								//console.log("handle_completed_task: got rewrite or translation result");
								if(typeof window.task_queue[t].index == 'number' && window.task_queue[t].desired_results > 1){
									let result_counter_el = document.getElementById('rewrite-results-count' + window.task_queue[t].index);
									if(result_counter_el){
										result_counter_el.textContent = window.task_queue[t].results.length;
									}
									else{
										console.error("handle_completed_task: got rewrite result: could not find rewrite result count el");
									}
								}
								
								let rewrite_result_details_el = document.querySelector('#rewrite-result' + task.index);
								if(rewrite_result_details_el){
									rewrite_result_details_el.classList.remove('in-progress');
									rewrite_result_details_el.classList.add('rewrite-result-complete');
								}
								
							}
							
							
							if(window.task_queue[t]['state'] == 'completed'){
								//console.log("handle_completed_task: assistant task has completed state (which it must have just gotten)");
								//remove_highlight_selection();
								
								if(typeof window.task_queue[t].desired_results == 'number' && typeof window.task_queue[t].results != 'undefined' && Array.isArray(window.task_queue[t].results)){
									
									// Insert summary into document, as it is part of a larger summarization process with a parent
									if(typeof window.task_queue[t].parent_index == 'number'){
										//console.log("handle_completed_task: this summarize task has a parent index");
										
										const document_text = get_latest_document_text_from_task(window.task_queue[t]);
										if(typeof document_text == 'string' && document_text.indexOf(result) == -1){
											console.error("handle_completed_task: the summarization result does not seem to have been inserted into the document yet (even though handle_chunk should have done that)");
											insert_into_document(window.task_queue[t], '\n\n' + result, {'position':'end'});
										}
										else{
											//console.log("handle_completed_task: OK, the summarization result seems to already have been inserted into the document (probably by handle_chunk)");
										}
										
									}
									else if(window.task_queue[t].desired_results == 1 && typeof window.task_queue[t].results[0] == 'string'){
										//console.log("handle_completed_task: it's a basic summarization task without a parent task.");
										
										window.set_chat_status(window.task_queue[t],'');
										remove_body_class('doing-summarize');
										remove_body_class('doing-assistant');
										
										if(
											typeof window.task_queue[t].feeling_lucky == 'boolean' 
											&& window.task_queue[t].feeling_lucky == true 
											&& typeof window.task_queue[t].file != 'undefined' 
											&& window.task_queue[t].file != null 
											&& typeof window.task_queue[t].file.filename == 'string'
										){
											
											if(typeof window.task_queue[t].text == 'string'){
												search_and_replace(window.task_queue[t], window.task_queue[t].text, result);
											}
											//insert_into_document(window.task_queue[t], result_to_insert, {'position:':'start'});
											
										}
										else{
											window.add_chat_message(window.task_queue[t].assistant,window.task_queue[t].assistant,result,null,null,window.task_queue[t].index);
											
											let summary_selection = get_selection_from_task(window.task_queue[t]);
											if(summary_selection != null){
												highlight_selection(summary_selection);
											}
											
										}
										
									}
									else{
										//console.log("spotted a summarize task with multiple results. Must be a parent summarize task that has become summarize type?")
									}
									
								}
							}
							
						}
						
						else if(window.task_queue[t].type == 'rag_search_rephrasing'){
							//console.log("handle_completed_task: task was of rag_search_rephrasing type");
							
							if(typeof window.task_queue[t].rag_index == 'number'){
								let rag_answer_question_el = document.getElementById('rag-result-answer-question'+ window.task_queue[t].rag_index);
								if(rag_answer_question_el){
									rag_answer_question_el.textContent = result;
								}
								else{
									console.error("handle_completed_task: rag_search_rephrasing: cannot find rag answer question element to place result into");
								}
							}
							else{
								console.error("handle_completed_task: rag_search_rephrasing: tag rask did not have rag_index?", window.task_queue[t]);
							}
							window.set_chat_status(window.task_queue[t],'');
						}
						
						else if(window.task_queue[t].type == 'rag_search_merging'){
							//console.log("handle_completed_task: task was of rag_search_merging type");
							if(typeof window.task_queue[t].rag_index == 'number'){
								let rag_answer_el = document.getElementById('rag-search-result-answer'+ window.task_queue[t].rag_index);
								if(rag_answer_el){
									rag_answer_el.textContent = result;
								}
								else{
									console.error("handle_completed_task: rag_search_merging: cannot find rag answer element to place result into");
								}
							}
							else{
								console.error("handle_completed_task: rag_search_merging: tag rask did not have rag_index?", window.task_queue[t]);
							}
							window.set_chat_status(window.task_queue[t],'');
						}
						
						
						
						else if(window.task_queue[t].type == 'research'){
							//console.log("Assistant was done with a task related to research");
						}
						
						else if(window.task_queue[t].type == 'proofread'){
							//console.log("handle_completed_task: assistant returned a completed proofread");
							
							handle_proofread_result(window.task_queue[t]);
							
							//set_chat_status(window.task_queue[t],'');
							remove_body_class('doing-assistant');
							remove_body_class('waiting-for-response');
							remove_body_class('doing-proofread');
						}
						
						
						
						
						// Rewrite and Translation.. BY THE MAIN LLM ASSISTANT
						// Translation by the assistant has, so far, not been great.
						if(window.task_queue[t].type == 'proofread' || window.task_queue[t].type == 'rewrite' || window.task_queue[t].type == 'translation'){ // TODO translation isn't / shouldn't really be handled by an assistant anymore? They don't do so well?
							//console.log("handle_completed_task: post-asistant routing: type is rewrite or translation: ", window.task_queue[t].type);
							
							// TODO: if one summarization result, and if short enough, output as chat? Otherwise as new document?
							// If multiple results have accumulated, show a UI to pick one? Although that's more relevant for summarize :-)
							// Or just always show the user a UI?
							if(window.task_queue[t].type == 'translation' && typeof result == 'string'){
								if(typeof window.task_queue[t].translation != 'string' ){
									window.task_queue[t].translation = result;
								}
								else{
									window.task_queue[t].translation = window.task_queue[t].translation + ' ' + result;
								}
								//console.log("handle_completed_task:  window.task_queue[t].translation is now: ", window.task_queue[t].translation);
							}
							
							if(rewrite_status_progress_container_el){
								rewrite_status_progress_container_el.textContent = '';
							}
							
							
							if(
								typeof window.task_queue[t].text == 'string'
								&& typeof window.task_queue[t].desired_results == 'number' 
								&& typeof window.task_queue[t].results != 'undefined' 
								&& Array.isArray(window.task_queue[t].results) 
								
							){
								//console.log("handle_completed_task: got rewrite or translation result");
								if(typeof window.task_queue[t].index == 'number' && window.task_queue[t].desired_results > 1){
									let result_counter_el = document.getElementById('rewrite-results-count' + window.task_queue[t].index);
									if(result_counter_el){
										result_counter_el.textContent = window.task_queue[t].results.length;
									}
									else{
										console.error("handle_completed_task: got rewrite result: could not find rewrite result count el");
									}
								}
								
								//console.log("handle_completed_task: got rewrite result: window.task_queue[t].results.length: ", window.task_queue[t].results.length);
								
								if(window.task_queue[t].results.length == window.task_queue[t].desired_results){
									//console.log("handle_completed_task: got rewrite result: all results are ready");
									
									if(typeof window.task_queue[t]['feeling_lucky'] == 'boolean' && window.task_queue[t]['feeling_lucky'] == true){
										if(window.task_queue[t].type != 'proofread'){
											search_and_replace(window.task_queue[t], window.task_queue[t].text, result);
											add_body_class('can-undo');
										}
										
										// highlight_selection(window.doc_selection);
										
									}
									else{
										show_rewrite_picker(window.task_queue[t]);
									}
									
									let rewrite_result_details_el = document.querySelector('#rewrite-result' + task.index);
									if(rewrite_result_details_el){
										rewrite_result_details_el.classList.remove('in-progress');
										rewrite_result_details_el.classList.add('rewrite-result-complete');
									}
									//console.log("rewrite_results_dialog_content_container_el.children: ", rewrite_results_dialog_content_container_el.children);
									rewrite_results_ready_counter_el.textContent = rewrite_results_dialog_content_container_el.children.length;
								}
								else{
									//console.log("handle_completed_task: got rewrite result: not all rewrite result are ready yet. window.task_queue[t]: ", window.task_queue[t]);
									//show_rewrite_picker(window.task_queue[t]);
								}
								
								if(rewrite_status_progress_el){
									rewrite_status_progress_el.value = window.task_queue[t].results.length / window.task_queue[t].desired_results;
								}
								
							}
							
						}
						
					}
					else{
						//console.log("strange situation where desired results was zero, or 'result' was not a string.  window.task_queue[t].desired_results, result: ", window.task_queue[t].desired_results, result);
					}
					
				}
				remove_body_class('doing-assistant');
			}
			
			
			
			
			
			
			
			//
			//  POST RESEARCHER ROUTING
			//
			
			else if(window.task_queue[t].state == 'doing_research'){
				//console.log("handle_completed_task: state was doing_research");
				
				window.task_queue[t]['results'].push(result);
				
				if(typeof window.task_queue[t]['desired_results'] == 'number' && typeof window.task_queue[t]['results'] != 'undefined' && Array.isArray(window.task_queue[t]['results']) && window.task_queue[t].results.length == window.task_queue[t].desired_results){
					//console.log("all desired research documents have been collected: ", window.task_queue[t].desired_results);
					window.task_queue[t]['state'] = 'completed';
					
					remove_body_class('doing-research');
					window.set_chat_status(window.task_queue[t],'');
				}
				
				// window.task_queue[t]['results'].push(result); 
				
				// TODO: could continue into doing RAG
				
				if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'blueprint'){
					window.busy_doing_blueprint_task = false;
				}
			
			}
			
			
			
			
			
			
			//
			//  POST TRANSLATION ROUTING
			//
			
			//else if(window.task_queue[t].state == 'doing_tts' || window.task_queue[t].state == 'doing_audio_player'){
			else if(window.task_queue[t].state == 'doing_translation'){
				console.log("handle_completed_task: it's a translation task: ", window.task_queue[t]);
				//window.task_queue[t]['handled_by'].push( window.task_queue[t].state.replace('doing_','') );
				
				if(typeof window.task_queue[t]['handled_by'] == 'undefined'){
					window.task_queue[t]['handled_by'] = [];
				}
				window.task_queue[t]['handled_by'].push('translation'); // these two aren't really used at the moment. And.. it seems a task might need to be translated twice (NL -> EN -> NL), so keeping track of who worked on a task might not be 100% useful.
				
				if(typeof window.task_queue[t]['desired_results'] == 'number' && typeof window.task_queue[t]['results'] != 'undefined' && Array.isArray(window.task_queue[t]['results']) && window.task_queue[t]['results'].length <= window.task_queue[t]['desired_results']){
					
					if(window.task_queue[t]['desired_results'] > 0 && typeof result == 'string'){
						//console.log("handle_completed_task: Adding translation result to task results array.");
						//window.task_queue[t]['results'].push({'text':result,'sentences':[],'audio':null,'spoken':false,'state':'completed'}); // not sure if setting the result to completed is wise yet
						window.task_queue[t]['results'].push(result); 
						//console.log("task results length is now: ", window.task_queue[t]['results'].length);
						
						if(window.task_queue[t].results.length == window.task_queue[t].desired_results){
							//console.log("all desired translation results have been generated for a translation task: ", window.task_queue[t].desired_results);
							window.task_queue[t]['state'] = 'completed';
							
							add_overlay_description();
							
							if(typeof window.task_queue[t].parent_index == 'number'){
								//console.log("translation task has a parent");
								// If there is a parent, the translation will likely be added to a rewrite result.
								setTimeout(() => {
									console.warn("calling handle_completed_task from handle_completed_task to update parent translation task. parent_index: ", window.task_queue[t].parent_index);
									handle_completed_task({'index':window.task_queue[t].parent_index}, result);
								},1);
								
								// If the task is feeling lucky, then immediately replace the task's text in the document?
								if(typeof window.task_queue[t].q != 'undefined' && Array.isArray(window.task_queue[t].q) && window.task_queue[t].q.length){
									//console.log("this translation task has a parent, and has more evolutions to go: ", );
								}
								// No more evolutions for this task
								else if(typeof window.task_queue[t].feeling_lucky == 'boolean' && window.task_queue[t].feeling_lucky == true){
									//console.log("this translation task has a parent, and is feeling lucky.", window.task_queue[t]);
									if(typeof window.task_queue[t].text == 'string' && typeof result == 'string'){
										search_and_replace(window.task_queue[t],window.task_queue[t].text, result);
									}
									else{
										console.error("feeling lucky translation is not so lucky.  source text or translation result not a string?: ", window.task_queue[t].text, result, ", task: ", window.task_queue[t]);
									}
								}
								else{
									//console.log("translation task did not feel lucky");
								}
								
							}
							else if(typeof window.task_queue[t].destination == 'string'){
								//console.log("translation task does not have a parent. It does have a destination: ", window.task_queue[t].destination);
								
								
								remove_body_class('doing-translation');
								
								// If there is no parent, the translation can shown as a chat message
								if(window.task_queue[t].destination == 'chat'){
									
									let translated_sentences = result.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
									if(window.speaker_enabled && translated_sentences.length == 1 && typeof window.task_queue[t].output_language == 'string' && window.task_queue[t].output_language == 'en'){
										//console.log("handle_completed_task: translation: speaker enabled, and one result. So handle_chunk should have already created a message. Not adding a chat message.");
										// doesn't make much sense to add a chat messsage with one sentence if that message has likely just been added as part of the extra TTS-to-WAV task that was created by handle_chunk based on the latest received translated sentence ('snippet')
									}
									else{
										//console.log("handle_completed_task: translation going to chat message: ", result);
										add_chat_message('translator','translator',result,null,null,window.task_queue[t].index);
									}
									
								}
								else if(window.task_queue[t].destination == 'document'){
									//console.log("handle_completed_task: inserting translation into document: ", result, window.task_queue[t]);
									
									remove_body_class('working-on-doc');
									
									
									if(result.trim() != ''){
										if(window.settings.assistants['translator'].add_both_languages_to_documents && window.task_queue[t].assistant == 'translator' && typeof window.task_queue[t].output_language == 'string' && window.microphone_enabled){
											result = window.task_queue[t].output_language.toUpperCase() + ': ' + result + '\n';
										}
										else if(!result.endsWith(' ')){
											result += ' ';
										}
										insert_into_document(window.task_queue[t], result);
									}
									
								}
								else if(window.task_queue[t].destination == 'live_translation_output'){
									//console.log("handle_completed_task: setting translation as live_translation_output: ", result);
									live_translation_output_el.value = result + ' ';
								}
								
								
							}
							else{
								console.error("handle_completed_task: translation task does not have a destination: ", window.task_queue[t]);
							}
							
						}
						else{
							//console.log("handle_completed_task: not all desired translation results have been generated yet");
						}
					}
					else{
						console.warn("handle_completed_task: unexpected result, not string?: ", result);
					}
					
					if(typeof window.task_queue[t].parent_index != 'number' && typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'blueprint'){
						window.busy_doing_blueprint_task = false;
					}
				}
				
				else{
				//else if(typeof window.task_queue[t]['desired_results'] != 'number'){	
					//console.log("handle_completed_task: a translation is done, but desired_results is not a number? Likely part of an invisible pre-and-post translation wrapper around the task");
					remove_body_class('doing-translation');
					
					if(typeof window.task_queue[t].q != 'undefined'){
						
						if(window.task_queue[t].q.length > 1){
							//console.log("handle_completed_task: translation: there is more than 1 evolution of this task ahead, so this is not the final phase of the task yet");
							if(window.task_queue[t].type == 'chat'){
								//console.log("handle_completed_task: a translation is done: evolution: setting translation result as the prompt of the task");
								window.task_queue[t].prompt = result;
								window.task_queue[t].state = 'completed'; // this will cause the evolution to the next state of the q later on
								
								add_translation_to_conversation(window.task_queue[t],result,'user'); // TODO hardcoded assumption that this translation is of a user input
								
							}
						}
						else if(window.task_queue[t].q.length == 1){
							//console.log("handle_completed_task: a translation is done: evolution: there is 1 evolution of this task ahead");
							
							// Musicgen prompt translation
							if(typeof window.task_queue[t].assistant == 'string' && window.task_queue[t].assistant == 'musicgen'){
								//console.log("handle_completed_task: a translation for musicgen is done: setting translation result as the prompt of the musicgen task: ", result);
								window.task_queue[t].prompt = result;
								if(window.settings.settings_complexity == 'developer'){
									add_chat_message('musicgen','translator',result,null,null,window.task_queue[t].index);
								}
								window.task_queue[t].state = 'completed'; // this will cause the evolution to the next state of the q later on
							}
							
							
							window.task_queue[t].state = 'completed';
						}
						else if(window.task_queue[t].q.length == 0){
							//console.log("handle_completed_task: a translation is done: evolution Q is empty - this is the final form of the task");
							
							if(window.task_queue[t].type == 'chat'){
								
								add_chat_message(assistant_id,assistant_id,result,null,null,window.task_queue[t].index);
								
								remove_body_class('waiting-for-response');
								add_response_to_conversation(window.task_queue[t],result);
								
								
							}
							remove_body_class('doing-assistant');
							remove_body_class('doing-translation');
							remove_body_class('working-on-doc');
							remove_body_class('doing-prompt-at-line');
							window.task_queue[t].state = 'completed';
							
						}
						
					}
					else{
						console.error("handle_completed_task: a translation is done, but desired_results is not a number, and Q is not defined either");
					}
				}
			
			}
			
			
			
			
			
			
			
			
			
			
	
			//
			//  POST TTS ROUTING
			//
			
			//else if(window.task_queue[t].state == 'doing_tts' || window.task_queue[t].state == 'doing_audio_player'){
			else if(window.task_queue[t].state == 'doing_tts'){
				//console.log("handle_completed_task: was doing_tts: state: " + window.task_queue[t].state);
				//window.task_queue[t]['handled_by'].push( window.task_queue[t].state.replace('doing_','') );
				
				let found_sentence = false;
				//let found_played_audio = false;
				window.task_queue[t]['handled_by'].push('tts');
				
				// Simple task can immediately be set to completed
				if(window.task_queue[t].type == 'speak' && typeof task.sentence == 'string' && task.sentence.length){
					//console.log("handle_task_completed: simple: probably just TTS'ed this sentence: ", task.sentence);
					
					
					if(typeof window.task_queue[t].speech_interrupted == 'boolean' && window.task_queue[t].speech_interrupted == true){
						window.task_queue[t].state = 'interrupted';
						console.warn("handle_completed_task: post tts_routing:  window.task_queue[t].speech_interrupted was true, so not going to play the audio that was just received");
					}
					else if(result != null && typeof result.big_audio_array != 'undefined'){
						if(window.settings.settings_complexity == 'developer'){
							console.error("dev: handle_completed_task: OK, tts result had audio");
						}
						window.task_queue[t].audio = result.big_audio_array;
						window.task_queue[t].wav_blob = result.wav_blob;
						window.task_queue[t].state = 'should_audio_player';
						
						found_sentence = true;
					}
					else{
						console.error("handle_completed_task: tts result was invalid: ", window.task_queue[t]);
						window.task_queue[t].state = 'failed';
					}
					
				}
				else{
					console.error("doing_tts task was not of type 'speak': ", window.task_queue[t].type);
				}
				
			}
			
			
			
			
			
			//
			//  POST AUDIO PLAYING ROUTING
			//
			
			
			else if(window.task_queue[t].state == 'doing_audio_player'){
				//window.task_queue[t]['handled_by'].push('audio_player');
				
				//console.log("handle_completed_task: audio player done. type: ", window.task_queue[t].type);
				let found_played_audio = false;
				
				if(window.task_queue[t].type == 'speak' || window.task_queue[t].type == 'play_document' || window.task_queue[t].type == 'audio_player'){
					//console.log("handle_task_completed: type required playing of audio: ", window.task_queue[t].type);
					
					if(typeof window.task_queue[t].origin == 'string'){
						if(window.task_queue[t].origin == 'play_document' || window.task_queue[t].origin == 'blueprint'){
							if(typeof window.task_queue[t].parent_index == 'number'){
								setTimeout(() => {
									//console.log("calling handle_completed_task from handle_completed_task to update parent task. parent_index: ", window.task_queue[t].parent_index);
									handle_completed_task({'index':window.task_queue[t].parent_index}, 'done'); // could use any string really
								},1);
							}
						}
					}
					
					// Simple task can immediately be set to completed
					if(window.task_queue[t].type == 'speak' && typeof task.audio == 'object' && task.audio != null && typeof task.sentence == 'string' && task.sentence.length){
						//console.log("handle_task_completed: probably just spoke this sentence: ", task.sentence);
						/*
						if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'chat' && typeof window.task_queue[t].assistant == 'string' && window.task_queue[t].assistant == 'speaker'){
							window.task_queue[t].type = 'mp3';
							window.task_queue[t].state = 'should_mp3';
						}
						else{
							window.task_queue[t].state = 'completed';
						}
						*/
						window.task_queue[t].state = 'completed';
						found_played_audio = true;
					}
					else if(typeof window.task_queue[t].audio != 'undefined'){
						window.task_queue[t].state = 'completed';
						found_played_audio = true;
						delete window.task_queue[t].audio;
					}
					
					
				}
				else{
					//console.log("audio play task: unexected type: ", window.task_queue[t].type);
				}
			
				if(found_played_audio == false){
					console.error("ERROR, did not find the audio that has played. task: ", window.task_queue[t]);
					window.task_queue[t].state = 'completed';
				}
				
				if(window.task_queue[t].assistant == 'speaker' && typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'blueprint'){
					window.busy_doing_blueprint_task = false;
				}
			
			}
			
			
			
			//
			//  POST MP3 ENCODING ROUTING
			//
			
			
			else if(window.task_queue[t].state == 'doing_mp3'){
				//window.task_queue[t]['handled_by'].push('mp3');
				
				if(typeof window.task_queue[t].index == 'number' && typeof result == 'object'){
					const chat_bubble_id = '#chat-message-task-' + window.task_queue[t].assistant + '-' + window.task_queue[t].assistant + window.task_queue[t].index; // sic
					//console.log("chat_bubble_id: ", chat_bubble_id);
					let target_chat_bubble = document.querySelector(chat_bubble_id);
					if(target_chat_bubble){
						//console.log("found chat bubble to add audio player to: ", target_chat_bubble);
						//target_chat_bubble.innerHTML = 'Hi';
						try{
							let audio_player_el = document.createElement('audio');
							//console.log("audio_player_el: ", audio_player_el);
							audio_player_el.classList.add('chat-message-mp3-player');
							audio_player_el.setAttribute('controls',true);
							// audio_player_el.crossOrigin = 'anonymous';
							//audio_player_el.setAttribute("type","audio/mpeg");
							audio_player_el.setAttribute('id','mp3-task' + window.task_queue[t].index);
							
							audio_player_el.addEventListener('onstalled', function(e) { 
								//console.log("mp3 audio player onstalled");
							      audio_player_el.load();
							}, false);
							
							//console.log("so far so good?");
							
							function getBlob(url) {
							  return new Promise((resolve, reject) => {
							    const xhr = new XMLHttpRequest()
							    xhr.responseType = "blob"
							    xhr.overrideMimeType("audio/mp3")

							    xhr.onload = event => {
							      var blob = xhr.response
							      resolve(blob)
							    }
							    xhr.onerror = event => {
							      reject(event)
							    }

							    xhr.open("GET", url)
							    xhr.send()
							  })
							}
							
							let blob_url = URL.createObjectURL(result);
							
							// const blob = 
							getBlob(blob_url)
							.then((blob2) => {
								//console.log("got blob2: ", blob2);
								
								//console.log("appending audio_player to bubble: ", audio_player_el);
								target_chat_bubble.appendChild(audio_player_el);
								
								
								
								const url2 = URL.createObjectURL(blob2);
								//console.log("url2: ", url2);
								
								var link = document.createElement("a"); // Or maybe get it from the current document
								link.href = url2;
								link.download = "test.mp3";
								link.innerHTML = "Click here to download the file";
								target_chat_bubble.appendChild(link);
								//document.body.appendChild(link); // Or append it whereever you want
								
								
								let source_el = document.createElement('source');
								source_el.src = url2;
								//source_el.type = "audio/mp3";
								source_el.type = "audio/mpeg";
								audio_player_el.appendChild(source_el);
								
								
								audio_player_el.load();
								
								audio_player_el.play();
								
								setTimeout(()=>{
									//console.log("doing delayed basic audio play");
									const audio = new Audio(url2);
									audio.load();
									audio.play()
  								  .then(() => {
									  console.log("OK! Audio is playing");
  								  })
  								  .catch(error => {
  								    console.log("nope, audio did not play. Error: ", error);
  								  });
								},2000);
								
								
							})
							.catch((err) => {
								console.error("caught error manipulating blob: ", err);
							})
							
							
						}
						catch(e){
							console.error("Caught error appending MP3 player to chat message: ", e);
						}
						
						
					}
					else{
						console.error("could not find chat bubble to append MP3 player to");
					}
				}
				else{
					console.error("cannot create MP3 player. Invalid result?", result);
				}
			}
			
			
			
			
			
			
			
			//
			//  POST GENERATE IMAGE
			//
			
			else if(window.task_queue[t].state == 'doing_imager' || window.task_queue[t].state == 'doing_text_to_image'){
				//console.log("handle_completed_task: image generation done. ", window.task_queue[t]);
				//window.task_queue[t]['handled_by'].push('audio_player');
				if(window.task_queue[t].type == 'image'){
					
				}
				window.task_queue[t].state = 'completed';
				remove_body_class('doing-imager');
				remove_body_class('doing-text-to-image');
				
				if(window.pip_started && typeof window.task_queue[t].image_blob != 'undefined'){
					window.image_to_pip_canvas(window.task_queue[t].image_blob);
				}
				
				if(typeof window.task_queue[t]['handled_by'] == 'undefined'){
					window.task_queue[t]['handled_by'] = [];
				}
				if(typeof window.task_queue[t].assistant == 'string'){
					window.task_queue[t]['handled_by'].push(window.task_queue[t].assistant);
				}
				
				
				if(typeof window.task_queue[t].origin == 'string'){
					if(window.task_queue[t].origin == 'play_document' || window.task_queue[t].origin == 'blueprint'){
						
						//console.log("handle_completed_task: image, and origin was play_document");
						
						// Show fairytale image
						if(window.task_queue[t].origin == 'play_document' && typeof window.task_queue[t].image_blob != 'undefined' && document.body.classList.contains('playing-document')){
							var reader = new FileReader();
							reader.readAsDataURL(window.task_queue[t].image_blob); 
							reader.onloadend = function() {
							   //const base64data = ;
							   playground_overlay_el.innerHTML = '<img src="' + reader.result + '"/>'; 
							}
						}
						
						// Do images ever have a parent task? Perhaps imager could store all the intermediary steps. Or an animation could be created, or...
						if(typeof window.task_queue[t].parent_index == 'number'){
							setTimeout(() => {
								//console.log("IMAGE DONE. calling handle_completed_task from handle_completed_task to update parent task. parent_index: ", window.task_queue[t].parent_index);
								handle_completed_task({'index':window.task_queue[t].parent_index}, 'done'); // could use any string really
							},1);
							
						}
					}
				}
				
				if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'blueprint'){
					window.busy_doing_blueprint_task = false;
				}
			
			}
			
			
			
			
			
			//
			//  POST MUSICGEN
			//
			
			else if(window.task_queue[t].state == 'doing_musicgen'){
				//console.log("handle_completed_task:  musicgen task: ", window.task_queue[t]);
				//window.task_queue[t]['handled_by'].push('audio_player');
				window.task_queue[t].state = 'completed';
				remove_body_class('doing-musicgen');
				
				if(window.settings.assistant != 'musicgen'){
					if(typeof window.unread_messages['musicgen'] == 'number'){
						window.unread_messages['musicgen']++; // = window.unread_messages[pane] + 1;
					}
					else{
						window.unread_messages['musicgen'] = 1;
					}
				}
				
				if(typeof window.task_queue[t].origin == 'string'){
					if(window.task_queue[t].origin == 'play_document' || window.task_queue[t].origin == 'blueprint'){
						
						if(typeof window.task_queue[t].parent_index == 'number'){
							setTimeout(() => {
								//console.log("MUSICGEN DONE. calling handle_completed_task from handle_completed_task to update parent task. parent_index: ", window.task_queue[t].parent_index);
								handle_completed_task({'index':window.task_queue[t].parent_index}, 'done'); // could use any string really
							},1);
							
						}
						
					}
				}
				
				if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'blueprint'){
					window.busy_doing_blueprint_task = false;
				}
			
			}
			
			
			
			//
			//    POST OCR - OPTICAL CHARACTER RECOGNITION
			//
			
			else if(window.task_queue[t].state == 'doing_ocr'){
				//console.log("handle_completed_task: doing_ocr done");
				
				if(typeof result != 'string'){
					console.error("handle_task_completed:  OCR result was not a string: ", result);
					window.task_queue[t].state = 'failed';
				}
				else{
					//console.log("handle_completed_task: got a OCR result: ", result);
					
					window.task_queue[t].results.push(result);
					
					if(typeof window.task_queue[t].destination == 'string'){
						if(typeof window.task_queue[t].selection == 'undefined'){
							window.task_queue[t].selection = {'position':'end'};
						}
						
						if(window.task_queue[t].destination == 'document' && typeof window.task_queue[t].file != 'undefined'){
							insert_into_document(window.task_queue[t],'\n\n' + result);
						}
						else if(window.task_queue[t].destination == 'document' && window.settings.docs.open != null){
							//console.log("handle_task_completed:  OCR result: inserting into currently open document");
							insert_into_document(window.task_queue[t],'\n\n' + result);
						}
						else if(typeof window.task_queue[t].file == 'undefined' && window.task_queue[t].destination == 'document' && result.length > 500){
							//console.log("handle_task_completed:  OCR result: creating new document");
							create_new_document(result,get_translation('Text_from_photo') + ' ' + date_string + '.txt' );
						}
						else if(window.task_queue[t].destination == 'chat'){
							//console.log("handle_task_completed:  OCR result to place in chat bubble: ", result);
							
							const target_output_el = document.querySelector('#image-to-text-result-output' + window.task_queue[t].index);
							if(target_output_el){
								target_output_el.innerHTML = '';
								//target_output_el.textContent = result;
								
								let bubble_wrapper_el = document.createElement('div');
								bubble_wrapper_el.classList.add('chat-bubble-wrap');
								
								let bubble_el = document.createElement('div');
								bubble_el.textContent = result;
								bubble_wrapper_el.appendChild(bubble_el);
								
								let insert_into_doc_buttons_el = create_insert_into_doc_buttons(result);
								if(insert_into_doc_buttons_el){
									bubble_wrapper_el.appendChild(insert_into_doc_buttons_el);
								}
								
								target_output_el.appendChild(bubble_wrapper_el);
								
								
								if(window.settings.assistant != 'image_to_text_ocr'){
									if(typeof window.unread_messages['image_to_text_ocr'] == 'number'){
										window.unread_messages['image_to_text_ocr']++; // = window.unread_messages[pane] + 1;
									}
									else{
										window.unread_messages['image_to_text_ocr'] = 1;
									}
								}
								
							}
							else{
								console.error("could not find image-to-text-result-output element to place OCR result into.  window.task_queue[t].image_to_text_index: ", window.task_queue[t].image_to_text_index);
							}
							
						}
						else{
							//console.log("handle_task_completed: OCR result fell through");
						}
					}
					else if(typeof window.task_queue[t].origin == 'string'){
						//console.log("OCR task has origin: ", window.task_queue[t].origin);
						if(window.task_queue[t].origin == 'camera'){
							//add_chat_message('image_to_text_ocr','image_to_text_ocr',result);
							
						}
						else if(window.task_queue[t].origin == 'chat' && typeof window.task_queue[t].image_to_text_index == 'number'){
							
							const target_output_el = document.getElementById('image-to-text-result-output' + window.task_queue[t].image_to_text_index);
							if(target_output_el){
								target_output_el.innerHTML = '';
								//target_output_el.textContent = result;
								
								let bubble_wrapper_el = document.createElement('div');
								bubble_wrapper_el.classList.add('chat-bubble-wrap');
								
								let bubble_el = document.createElement('div');
								bubble_el.textContent = result;
								bubble_wrapper_el.appendChild(bubble_el);
								
								target_output_el.appendChild(bubble_wrapper_el);
								
								if(window.settings.assistant != 'image_to_text_ocr'){
									if(typeof window.unread_messages['image_to_text_ocr'] == 'number'){
										window.unread_messages['image_to_text_ocr']++; // = window.unread_messages[pane] + 1;
									}
									else{
										window.unread_messages['image_to_text_ocr'] = 1;
									}
								}
								
							}
							else{
								console.error("could not find image-to-text-result-output element to place OCR result into.  window.task_queue[t].image_to_text_index: ", window.task_queue[t].image_to_text_index);
							}
							
							
						}
						else{
							window.add_chat_message('image_to_text_ocr','image_to_text_ocr',result,null,null,window.task_queue[t].index);
						}
					}
				
					window.task_queue[t].state = 'completed';
				}
				
				
				// OCR cleanup
				if(typeof window.task_queue[t].image_blob != 'undefined'){
					//console.log("deleted image_blob from task");
					delete window.task_queue[t].image_blob; // save some memory
				}
				if(window.task_queue[t].type == 'processing_image'){
					remove_body_class('processing-image');
					remove_body_class('doing-ocr');
				}
				
				if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'blueprint'){
					window.busy_doing_blueprint_task = false;
				}
				
				window.ocr_worker_busy = false;
				remove_body_class('doing-ocr-scan');
			
			}
			
			
			
			
			
			
			//
			//    POST IMAGE TO TEXT
			//    post image_to_text
			
			else if(window.task_queue[t].state == 'doing_image_to_text'){
				//console.log("handle_completed_task: doing_image_to_text done");
				
				camera_image_to_text_scan_progress_el.value = 0;
				if(window.image_to_text_start_time != 0){
					window.image_to_text_delta = Math.round( (Date.now() - window.image_to_text_start_time)/1000 ) + 10;
				}
				
				if(typeof result != 'string'){
					console.error("handle_task_completed:  Image to Text result was not a string: ", result);
					window.task_queue[t].state = 'failed';
				}
				else{
					//console.log("handle_completed_task: got a image_to_text result:\n\n", result, "\n\n");
					
					window.task_queue[t].results.push(result);
					
					if(
						typeof window.task_queue[t].file != 'undefined' 
						&& window.task_queue[t].file != null 
						&& typeof window.task_queue[t].prompt == 'string' 
						&& window.task_queue[t].prompt == 'Write a detailed description of this image' //get_translation('Write_a_detailed_description_of_this_image')
					){ 
						
						//console.log("handle_completed_task: the image_to_text result seems to be a detailed description of a saved image, and the task has a file: ", window.task_queue[t].file);
						if(typeof window.task_queue[t].file.filename == 'string' && typeof window.task_queue[t].file.folder == 'string' && typeof files[window.task_queue[t].file.filename] != 'undefined'){
							//console.log("handle_completed_task: saving image_to_text_description to file meta");
							save_file_meta('image_to_text_description',result,window.task_queue[t].file.folder,window.task_queue[t].file.filename);
						}
					}
						
						
					if(typeof window.task_queue[t].destination == 'string'){
						if(typeof window.task_queue[t].selection == 'undefined'){
							window.task_queue[t].selection = {'position':'end'};
						}
						
						if(result.startsWith('- Of course. ')){
							result = result.replace('- Of course. ','');
						}
						
						// Optionally add timestamps, when the assistant is Scribe. Defaults to showing every minute
						if(window.settings.assistant == 'scribe' && typeof window.settings.assistant['scribe'] != 'undefined' && typeof window.settings.assistant['scribe'].add_timestamps == 'string'){
							if(window.settings.assistant['scribe'].add_timestamps != 'None' && window.last_time_continuous_image_to_text_started != null && window.last_time_continuous_image_to_text_frame_grabbed != null){
								//console.log("window.last_time_continuous_image_to_text_started: ", typeof window.last_time_continuous_image_to_text_started, window.last_time_continuous_image_to_text_started);
								result = create_scribe_timestamp(new Date(window.last_time_continuous_image_to_text_started),window.last_time_continuous_image_to_text_frame_grabbed) + '\n' + result; 
							}
						}
						
						if(window.task_queue[t].destination == 'document' && typeof window.task_queue[t].file != 'undefined'){ //  && window.task_queue[t].file != null
							//console.log("handle_task_completed:  image_to_text result: inserting into task's file");
							insert_into_document(window.task_queue[t],'\n\n' + result + '\n');
						}
						else if(window.task_queue[t].destination == 'document' && window.settings.docs.open != null){
							//console.log("handle_task_completed:  image_to_text result: inserting into currently open document");
							insert_into_document(window.task_queue[t],'\n\n' + result + '\n');
						}
						else if(typeof window.task_queue[t].file == 'undefined' && window.task_queue[t].destination == 'document' && result.length > 500){
							//console.log("handle_task_completed:  image_to_text result: creating new document");
							create_new_document(result,get_translation('Image_description') + ' ' + date_string + '.txt' );
						}
						else{
							//console.log("handle_task_completed: image_to_text result fell through");
						}
					}
					else if(typeof window.task_queue[t].origin == 'string'){
						//console.log("image_to_text task has origin: ", window.task_queue[t].origin);
						if(window.task_queue[t].origin == 'camera'){
							//add_chat_message('image_to_text_ocr','image_to_text_ocr',result);
							//console.log("origin of image_to_text task was camera. ");
							if(typeof result == 'string'){
							
								
								
								if(typeof window.task_queue[t].prompt == 'string' && window.task_queue[t].prompt == 'What is the text in the image?'){
									//console.log("image to text task was to get the text in an image");
									
									if(result.indexOf('"') != result.lastIndexOf('"')){
										//result = 'This is a "test thing" and here is number two: "ok dan", and another one? "Yes!". Ok.';
										let detected_texts_list = '';
										const detected_texts = result.match(/(?<=(["']\b))(?:(?=(\\?))\2.)*?(?=\1)/g);
										//console.log("detected_texts: ", detected_texts);
										if(detected_texts.length > 1){
											for(let d = 0; d < detected_texts.length; d++){
												detected_texts_list += '- ' + detected_texts[d] + '\n';
											}
											
										}
										else if(detected_texts.length == 1){
											detected_texts_list = detected_texts[0];
										}
										
										if(detected_texts_list.startsWith("I'm sorry, I'm sorry")){
											live_image_to_text_output_el.value = '';
										}
										else{
											live_image_to_text_output_el.value = detected_texts_list;
										
											if(camera_image_to_text_save_auto_scan_input_el.checked){
												window.insert_image_to_text_scan_result(window.task_queue[t], {'position':'end'});
											}
										
											if(detected_texts_list != '' && window.settings.docs.open == null && translation_details_el.open){
											
												if(camera_image_to_text_save_auto_scan_input_el.checked){
													do_prompt({'destination':'document'},detected_texts_list);
												}
												else{
													do_prompt({'destination':'live_translation_output'},detected_texts_list);
												}
											}
										}
										
										
									}
								}
								else{
									if(camera_image_to_text_save_auto_scan_input_el.checked){
										window.insert_image_to_text_scan_result(window.task_queue[t], {'position':'end'});
									}
									live_image_to_text_output_el.value = result + '\n';
								}
							}
							
							
							
							
							window.waiting_for_image_to_text = false;
						}
						else if(window.task_queue[t].origin == 'chat' && typeof window.task_queue[t].image_to_text_index == 'number'){
							
							const target_output_el = document.getElementById('image-to-text-result-output' + window.task_queue[t].image_to_text_index);
							if(target_output_el){
								target_output_el.innerHTML = '';
								//target_output_el.textContent = result;
								
								let bubble_wrapper_el = document.createElement('div');
								bubble_wrapper_el.classList.add('chat-bubble-wrap');
								
								let bubble_el = document.createElement('div');
								bubble_el.textContent = result;
								bubble_wrapper_el.appendChild(bubble_el);
								
								let insert_into_doc_buttons_el = create_insert_into_doc_buttons(result);
								if(insert_into_doc_buttons_el){
									bubble_wrapper_el.appendChild(insert_into_doc_buttons_el);
								}
								
								target_output_el.appendChild(bubble_wrapper_el);
								
								if(window.settings.assistant != 'image_to_text'){
									if(typeof window.unread_messages['image_to_text'] == 'number'){
										window.unread_messages['image_to_text']++; // = window.unread_messages[pane] + 1;
									}
									else{
										window.unread_messages['image_to_text'] = 1;
									}
								}
							}
							else{
								console.error("could not find image-to-text-result-output element to place image_to_text result into.");
							}
							
							
						}
						else{
							console.error("handle_completed_task: image_to_text done: origin check fell through.");
							window.add_chat_message('image_to_text','image_to_text',result,null,null,window.task_queue[t].index);
						}
					}
				
					window.task_queue[t].state = 'completed';
				}
				
				
				// image_to_text cleanup
				if(typeof window.task_queue[t].image_blob != 'undefined'){
					//console.log("deleted image_blob from task");
					delete window.task_queue[t].image_blob; // save some memory
				}
				if(window.task_queue[t].type == 'image_to_text'){
					remove_body_class('doing-image-to-text');
				}
				if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'blueprint'){
					window.busy_doing_blueprint_task = false;
				}
			
			}
			
			
			
			
			//
			//  POST PLAY DOCUMENT
			//
			
			else if(window.task_queue[t].state == 'doing_play_document'){
				//console.log("handle_completed_task: state: doing_play_document");
				//window.task_queue[t]['handled_by'].push('audio_player');
				if(window.task_queue[t].type == 'play_document'){
					if(result === true){
						//console.log("play document task was completed");
						
						// TODO: allow themes for tasks, fairytale being one example
						if(typeof window.task_queue[t].play_document_style == 'string'){
							//console.log("handle_completed_task: play_document task had a document style: ",  window.task_queue[t].play_document_style);
						}
						else{
							//console.log("handle_completed_task: play_document task did not have a document style (e.g. fairytale)");
						}
						
						window.task_queue[t].state = 'completed';
						
						//window.playing_document = false;
						//remove_body_class('playing-document'); // parent task should handle this
						//remove_body_class('fairytale');
						
					}
					else{
						//console.log("play document task was not complete yet. Letting it be.  Result: ", typeof result, result);
					}
				}
			
			}
			
			
			
			//
			//  POST SAVE (CAMERA) IMAGE
			//
			
			else if(window.task_queue[t].state == 'save_image'){
				//console.log("handle_completed_task: state is save_image");
				
				let extension = '.png';
				if(typeof window.task_queue[t].mime_type == 'string'){
					if(window.task_queue[t].mime_type.endsWith('jpg') || window.task_queue[t].mime_type.endsWith('jpeg')){
						extension = '.jpg';
					}
				}
				let image_filename = 'image ' + date_string + extension;
				
				//console.log("handle_completed_task: saving image: ", image_filename);
				
				if(typeof result != 'undefined' && typeof result != 'boolean' && result != null){
					//save_data_url(result,image_filename);
					
					try{
						save_blob(result,image_filename);
						//let new_value = '_PLAYGROUND_BINARY_' + buffer_to_string(new_value);
						window.task_queue[t].state = 'completed';
					}
					catch(e){
						console.error("caught error saving image: ", e);
						window.task_queue[t].state = 'failed';
					}
					
					
				}
				else{
					//console.log("handle_completed_task: saving image: invalid result: ", result);
					window.task_queue[t].state = 'failed';
				}
			}
			
			
			
			//
			//  POST PRELOAD
			//
			
			else if(window.task_queue[t].type == 'preload'){ // && window.task_queue[t].state == 'doing_preload'
				/*
				if(result){
					window.task_queue[t].state == 'completed';
				}
				else{
					window.task_queue[t].state == 'failed';
				}
				*/
				//console.log("Assistant was done with a preload task (downloading a model). Updating cache list. result was: ", result);
				window.task_queue[t].state = 'completed';
				
				let model_that_was_downloaded = null;
				if(typeof window.task_queue[t].assistant == 'string'){
					model_that_was_downloaded = window.task_queue[t].assistant;
					//console.log("model_that_was_downloaded: ", model_that_was_downloaded);
				}
				let runner = null;
				if(typeof window.task_queue[t].runner == 'string' && window.task_queue[t].runner.length){
					runner = window.task_queue[t].runner;
				}
				
				
				
				
				
				if(typeof window.task_queue[t].assistant == 'string'){
					let download_message_el = document.querySelector('.message.pane-' + window.task_queue[t].assistant + '.download-progress-chat-message');
					if(download_message_el){
						//download_message_el.classList.add('cached');
						download_message_el.remove();
					}
				}
				
				
				window.update_cached_files_list(); // updates Wllama cached files
				setTimeout(() => {
					window.update_cached_files_list();
					if(typeof model_that_was_downloaded == 'string'){
						if(runner == 'llama_cpp' && model_that_was_downloaded == window.llama_cpp_model_being_loaded){
							console.error("post preload: delayed: setting window.llama_cpp_model_being_loaded to null from: " + window.llama_cpp_model_being_loaded);
							window.llama_cpp_model_being_loaded = null;
						}
					}
				},10000);
			}
			
			
			
			
			//
			//  POST PARENT
			//
			else if(window.task_queue[t].state == 'parent'){
				//console.log("handle_completed_task: this is a parent container task. Likely filling up it's results list");
				if(typeof window.task_queue[t]['results'] == 'undefined'){
					window.task_queue[t]['results'] = [];
				}
				
				// Dealing with an interruption of a string of tasks
				if(task_meta != null && typeof task_meta.state == 'string' && task_meta.state == 'interrupted'){
					//console.log("POST PARENT: TASK_META: INTERRUPTED: ", task_meta);
					if(typeof window.task_queue[t].type == 'string' && window.task_queue[t].type == 'stt_parent' && typeof window.task_queue[t].index == 'number'){
						let transcription_bubble = document.querySelector('#scribe-transcription-info-container-bubble' + window.task_queue[t].index);
						if(transcription_bubble){
							transcription_bubble.classList.add('scribe-transcription-stopped');
							transcription_bubble.classList.add('scribe-transcription-interrupted');
						}
					}
				}
				
				
				
				
				
				//console.log("appending result to a parent task");
				if(typeof window.task_queue[t].origin == 'blueprint' && typeof window.task_queue[t].blueprint_index == 'number'){
					//console.log("potentially appending result to a parent task: blueprint index: ", window.task_queue[t].blueprint_index);
					//console.log("potentially appending result to a parent task: relative_blueprint_command_index: ",  window.task_queue[t].relative_blueprint_command_index);
				}
				
				if(typeof window.task_queue[t].origin == 'blueprint' && typeof window.task_queue[t].blueprint_index == 'number' && window.task_queue[t].blueprint_index == window.task_queue[t]['results'].length){
					console.error("HANDLE COMPLETED TASK: NOT ADDING RESULT TO RESULTS ARRAY OF PARENT BLUEPRINT TASK. window.task_queue[t].blueprint_index: ", window.task_queue[t].blueprint_index, window.task_queue[t]);
				}
				else if(extra != null){ // typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin.endsWith('file')
					window.task_queue[t]['results'].push(extra); // could in theory be null if Whisper Worker returns null 
					window.whisper_snippets_to_text(window.task_queue[t]);
				}
				else{
					window.task_queue[t]['results'].push(result);  // TODO all kinds of unwanted things could be added to the results array. False, null... which then has to be accounted for.
				}
				
				if(typeof window.task_queue[t].origin == 'string'){
					if(window.task_queue[t].origin == 'blueprint'){
						//console.warn("handle_completed_task: a blueprint task was completed and updated the parent blueprint task");
						window.busy_doing_blueprint_task = false;
					}
					else if(window.task_queue[t].origin.endsWith('file')){
						//console.warn("\n\nFILE TRANSCRIPTION DONE\n\nFile transcription added to parent results list. calling whisper_snippets_to_text\n\n");
						window.whisper_snippets_to_text(window.task_queue[t]);
					}
					else if(window.task_queue[t].origin == 'voice'){
						//console.warn("\n\nVOICE TRANSCRIPTION ADDED TO PARENT -> calling whisper_snippets_to_text");
						//console.log("task should have an array of extras: ", window.task_queue[t], "\n", window.task_queue[t].extras);
						
						window.whisper_snippets_to_text(window.task_queue[t]);
					}
				}
				else{
					console.warn("handle_completed_task: a task was completed and updated the parent non-blueprint task");
				}
				
				
					
				
				
				
				
				
				if(typeof window.task_queue[t].parent_index == 'undefined' && typeof window.task_queue[t].origin == 'string' && (window.task_queue[t].origin == 'translate_selection' || window.task_queue[t].origin == 'translate')){
					//console.log("this (grand)parent has no further parents. We're at the top.");
					show_rewrite_picker(window.task_queue[t]);
				}
				
				
				if(
					typeof window.task_queue[t].desired_results == 'number' 
					&& typeof window.task_queue[t]['results'] != 'undefined' 
					&& window.task_queue[t]['results'].length < window.task_queue[t].desired_results
				){
					//console.log("parent is not full yet");
					/*
					if(window.task_queue[t].desired_results != 0 && window.settings.docs.open != null && typeof window.settings.docs.open.filename == 'string' && typeof window.task_queue[t].file == 'object' && window.task_queue[t].file != null && typeof window.task_queue[t].file.filename == 'string'){
						if(window.task_queue[t].file.filename == window.settings.docs.open.filename && window.task_queue[t].file.folder == window.settings.docs.open.folder){
							//console.log("handle_completed_task: the parent container task is for the currently open file");
							
							// Summarization indicator
							if(window.task_queue[t].type == 'summarize'){
								//console.log("handle_completed_task: the parent container task is for the currently open file, and it's a summarization process. Adding a progress bar.");
								document_form_notifications_container_el.innerHTML = '<div class="document-summarize-progress-indicator-container"><div class="document-progress-indicator-title">' + get_translation('summarize') + '</div><progress class="progress" value="' + (window.task_queue[t]['results'].length / window.task_queue[t].desired_results) + '"></progress></div>';
							}
						}
					}
					*/
					
					
					let generic_rewrite_result_el = null;
					if(typeof window.task_queue[t].parent_index == 'number'){
						generic_rewrite_result_el = document.getElementById('rewrite-results-count' + window.task_queue[t].parent_index);
					}
					if(generic_rewrite_result_el == null && typeof window.task_queue[t].index == 'number'){
						generic_rewrite_result_el = document.getElementById('rewrite-results-count' + window.task_queue[t].index);
					}
					if(generic_rewrite_result_el){
						//console.log("parent task: found rewrite-results-count element. task: ", window.task_queue[t]);
						generic_rewrite_result_el.classList.add("in-progress");
						generic_rewrite_result_el.textContent = window.task_queue[t]['results'].length;
					}
					else{
						//console.log("parent task result counter increased, but did not find a rewrite_result element to update");
					}
					
					
				}
				else{
					//console.log("parent is FULL: ", window.task_queue[t]);
					document_form_notifications_container_el.innerHTML = '';
				
					window.task_queue[t].state = 'completed';
					
					// If a rewrite_result element exists for this parent task, then update it's CSS classes to indicate it's complete
					let parent_rewrite_result_el = null;
					if(typeof window.task_queue[t].parent_index == 'number'){
						parent_rewrite_result_el = document.getElementById('rewrite-result' + window.task_queue[t].parent_index);
					}
					if(parent_rewrite_result_el == null && typeof window.task_queue[t].index == 'number'){
						parent_rewrite_result_el = document.getElementById('rewrite-result' + window.task_queue[t].index);
					}
					if(parent_rewrite_result_el){
						//console.log("parent task completed, removing 'in-progress' class from rewrite_result element. task: ", window.task_queue[t]);
						parent_rewrite_result_el.classList.remove("in-progress");
						parent_rewrite_result_el.classList.add("completed");
						parent_rewrite_result_el.open = true;
						
						
						if(typeof window.task_queue[t].feeling_lucky == 'boolean' && window.task_queue[t].feeling_lucky == true){
							setTimeout(() => {
								parent_rewrite_result_el.remove();
							},1000);
						}
						
						if(
							(typeof window.task_queue[t].feeling_lucky == 'boolean' && window.task_queue[t].feeling_lucky == true)
							|| (typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'translate_document')
						){
							setTimeout(() => {
								parent_rewrite_result_el.remove();
							},1000);
							
							remove_body_class('doing-translation');
							remove_body_class('working-on-doc');
							
						}
						else if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'summarize_document'){
							parent_rewrite_result_el.remove();
						}
					}
					else{
						//console.log("parent task completed. Did not find a rewrite_result element to update");
					}
					
					
					
					if(typeof window.task_queue[t].origin == 'string'){
						//console.log("window.task_queue[t].origin: ", window.task_queue[t].origin);
						
						// Parent play_document is full
						if(window.task_queue[t].origin == 'play_document'){
							//console.log("play_document task parent is full");
							window.playing_document = false;
							remove_body_class('playing-document');
							remove_body_class('fairytale');
							document.getElementById('playground-overlay').innerHTML = '';
						}
						
						// Blueprint parent is complete
						else if(window.task_queue[t].origin == 'blueprint'){
							console.warn("\n\nBLUEPRINT PARENT DONE\n\nblueprint task parent is full\n\n");
							window.blueprint_origin_file = null;
							if(window.playing_document && window.tts_tasks_left > 1 && document.body.classList.contains('fairytale')){
								//console.log("allowing fairytale to continue playing");
							}
							else{
								remove_body_class('playing-document');
								remove_body_class('fairytale');
							}
							
							flash_message(get_translation('Blueprint_done'),1000);
							if(window.settings.show_notifications == true && window.page_has_focus == false){ // && window.page_has_focus == false
								//console.log("handle_completed_task: should show blueprint done notification");
								window.send_notification(window.task_queue[t], get_translation('Blueprint_done')); // title is assistant name,  body is result
							}
						}
						
						// Rewrite parent is complete
						else if(window.task_queue[t].origin.indexOf('rewrite') != -1){
							console.warn("\n\nREWRITE PARENT DONE\n\nrewrite task parent is full\n\n");
							flash_message(get_translation('Rewrite_done'),1000);
							if(window.settings.show_notifications == true && window.page_has_focus == false){ // && window.page_has_focus == false
								//console.log("handle_completed_task: should show Rewrite_done notification");
								window.send_notification(window.task_queue[t], get_translation('Rewrite_done')); // title is assistant name,  body is result
							}
						}
						
						// Translation parent is complete
						else if(window.task_queue[t].origin.indexOf('translate') != -1){
							console.warn("\n\nTRANSLATION PARENT DONE\n\ntranslate task parent is full\n\n");
							remove_body_class('doing-translation');
							if(window.task_queue[t].origin == 'translate_document'){
								remove_body_class('working-on-doc');
							}
							flash_message(get_translation('Translation_done'),1000);
							if(window.settings.show_notifications == true && window.page_has_focus == false){ // && window.page_has_focus == false
								//console.log("handle_completed_task: should show Translation_done notification");
								window.send_notification(window.task_queue[t], get_translation('Translation_done')); // title is assistant name,  body is result
							}
						}
						
						// Transcription parent
						else if(window.task_queue[t].origin.endsWith('file')){
							//console.log("\n\nFILE TRANSCRIPTION PARENT DONE\n\nFile transcription task parent is full\n\n");
							//console.log("task should have an array of extras: ", window.task_queue[t], "\n", window.task_queue[t].extras);
							
							let scribe_progress_el = document.querySelector('#scribe-progress' + window.task_queue[t].index);
							if(scribe_progress_el){
								scribe_progress_el.value = 1;
								setTimeout(() => {
									scribe_progress_el.remove();
								},1000);
							}
							
							let scribe_transcription_info_bubble_el = document.querySelector('#scribe-transcription-info-container-bubble' + window.task_queue[t].index);
							if(scribe_transcription_info_bubble_el){
								scribe_transcription_info_bubble_el.classList.add('scribe-transcription-stopped');
								if(window.settings.assistant != 'scribe'){
									if(typeof window.unread_messages['scribe'] == 'number'){
										window.unread_messages['scribe']++;
									}
									else{
										window.unread_messages['scribe'] = 1;
									}
								}
							}
							
							//window.whisper_snippets_to_text(window.task_queue[t]);
							setTimeout(() => {
								if(window.whisper_worker != null && window.whisper_worker_busy == false && window.stt_tasks_left == 0 && window.microphone_enabled == false){
									if(window.testing && window.is_mobile == false){
										flash_message("not attempting dispose of Whisper after transcribing a file because window.testing is true",2000,'info');
									}
									else{
										//console.log("disposing of Whisper after transcribing a file, and no other whisper tasks busy");
										if(typeof window.dispose_whisper == 'function'){
											window.dispose_whisper();
										}
									}
								}
							},2000);
		
							window.last_verified_speaker = null;
							window.scribe_precise_sentences_count = 0;
							window.last_time_scribe_started = null;
							
							flash_message(get_translation('Transcription_done'),2000);
							if(window.settings.show_notifications == true && window.page_has_focus == false){ // && window.page_has_focus == false
								//console.log("handle_completed_task: should show Transcription notification");
								window.send_notification(window.task_queue[t], get_translation('Transcription_done')); // title is assistant name,  body is result
							}
						}
					}
					
					
					
					
					
					
					// Inform a grandparent task, if it exists // Currently not being used
					/*
					if(typeof window.task_queue[t].parent_index == 'number'){
						console.warn("parent is done, but THIS PARENT TASK HAS A GRANDPARENT. Calling handle_completed_task for that too.");
						setTimeout(() => {
							console.warn("calling handle_completed_task from handle_completed_task to update GRANDPARENT translation task. parent_index: ", window.task_queue[t].parent_index);
							handle_completed_task({'index':window.task_queue[t].parent_index}, result);
						},1);
			
					}
					*/
					
					
				}
				
				
				
			}
			else{
				if(window.settings.settings_complexity == 'developer'){
					console.error("dev: handle_completed_task: task fell through, odd state?   state_before, window.task_queue[t].state: ", state_before, window.task_queue[t].state, window.task_queue[t]);
				}
			}
			
			
			
			//console.log("active_destination after: ", window.active_destination);
			
			
			// Task Evolution Queue
			
			if(state_before != window.task_queue[t].state){
				if(window.settings.settings_complexity == 'developer'){
					//console.log("dev: handle_task_completed: task state changed: ", state_before, " --> ", window.task_queue[t].state);
				}
				
				
				if(window.task_queue[t].state == 'completed'){
					
					// Apply the next evolution of the task
					if(typeof window.task_queue[t].q != 'undefined' && Array.isArray(window.task_queue[t].q) && window.task_queue[t].q.length){
						console.error("handle_completed_task: applying next evolution to the completed task: ", window.task_queue[t].q[0]);
						window.task_queue[t] = {...window.task_queue[t], ...window.task_queue[t].q[0]};
						window.task_queue[t].q.splice(0,1);
					}
				}
				
				if(window.irrelevant_task_states.indexOf(window.task_queue[t].state) != -1){
					//console.log("handle_completed_task: this task is (now) in an irrelevant state");
					
					if(typeof window.task_queue[t].q != 'undefined' && Array.isArray(window.task_queue[t].q) && window.task_queue[t].q.length){
						console.warn("handle_completed_task: spotted a task in an irrelevant state (completed/failed/interrupted) that still had evolutions in it's q: ", window.task_queue[t]);
					}
					
					if(typeof window.task_queue[t]['timestamp_irrelevance'] != 'undefined'){
						console.warn("handle_completed_task: this task already had a timestamp_irrelevance: ", window.task_queue[t]);
					}
					window.task_queue[t]['timestamp_irrelevance'] = Date.now();
					
				}
			}
			
			
			
			// TASK META
			
			// Task may have been interrupted, in which case task_meta dict would indicate this
			// For now, the task meta can override the evolution Q. E.g. to indicate that a task failed/was interrupted
			if(typeof task_meta != 'undefined' && typeof task_meta == 'object' && task_meta != null){
				
				
				if(typeof task_meta.state == 'string' && (task_meta.state == 'failed' || task_meta.state == 'interrupted') && typeof window.task_queue[t].index == 'number'){
					let rewrite_result_item = document.querySelector('#rewrite-results-dialog #rewrite-result' + window.task_queue[t].index);
					if(rewrite_result_item){
						rewrite_result_item.classList.add('rewrite-result-failed');
						const rewrite_result_first_textarea_el = rewrite_result_item.querySelector('.rewrite-result-text');
						if(rewrite_result_first_textarea_el && rewrite_result_first_textarea_el.value == ''){
							// rewrite result was still empty, so it can be removed without issue
							rewrite_result_item.classList.add('fade-out-chat-message');
							setTimeout(() => {
								rewrite_result_item.remove();
							},2000);
						}
						else{
							// remove it in two minutes
							setTimeout(() => {
								rewrite_result_item.classList.add('fade-out-chat-message');
							},120000);
							setTimeout(() => {
								rewrite_result_item.remove();
							},122000);
						}
					}
				}
				
				
				//console.log("overwriting parts of task with provided task_meta: ", window.task_queue[t], task_meta);
				window.task_queue[t] = {...window.task_queue[t], ...task_meta};
				
			}
			
			
			
			// Alternative way to check if a blueprint parent task is complete: if a task with the final expected blueprint task index has just been completed
			if(
				typeof window.task_queue[t].state == 'string' 
				&& window.task_queue[t].state != 'parent' 
				&& typeof window.task_queue[t].origin == 'string' 
				&& window.task_queue[t].origin == 'blueprint' 
				&& typeof window.task_queue[t].parent_index == 'number' 
				&& typeof window.task_queue[t].index == 'number' 
				&& typeof window.task_queue[t].blueprint_index == 'number' 
				&& typeof window.task_queue[t].blueprint_command_index == 'number'
			){
				if(window.task_queue[t].index > 0){
					for(let p = window.task_queue[t].index - 1; p >= 0; p--){
						if(typeof window.task_queue[p] != 'undefined' && window.task_queue[p] != null && typeof window.task_queue[p].state == 'string' && window.task_queue[p].state == 'parent' && typeof window.task_queue[p].origin == 'string' && window.task_queue[p].origin == 'blueprint' && typeof window.task_queue[p].blueprint_index == 'number' && window.task_queue[p].blueprint_index == window.task_queue[t].blueprint_index && typeof window.task_queue[p].end_blueprint_commands_counter == 'number' && window.task_queue[p].end_blueprint_commands_counter == window.task_queue[t].blueprint_command_index){
							window.task_queue[p].state = 'completed';
							//console.log("handle_completed_task: set parent blueprint task to completed");
						}
					}
				}
				
			}
			
		} // end of if where the task is the one with the matching index
		
		
	} // end of for-loop that goes over all tasks
	
	
	// The loop over all tasks is now complete
	
	update_rewrite_results_indicator();
	
	update_buffer_counts();
	
	if(window.stt_tasks_left == 0){
		//console.log("handle_completed_task: there are no more relevant tasks with recorded_audio. Removing doing-stt class from document.")
		remove_body_class('doing-stt');
	}
	
	if(window.chat_messages_to_answer == 0){
		//console.log("handle_completed_task: there are no more chat messages to answer.");
		remove_body_class('doing-assistant');
		remove_body_class('waiting-for-response');
	}
	
	if(window.tts_tasks_left == 0){
		//console.log("handle_completed_task: there are no more sentences to turn into audio.");
		remove_body_class('doing-stt');
	}
	
	if(window.audio_files_in_buffer == 0){
		//console.log("handle_completed_task: there is no more audio to play.");
		window.set_state(LISTENING);
	}
	
	if(window.blueprint_tasks_left == 0){
		//console.log("handle_completed_task: there are no more blueprint tasks.");
		if(window.audio_files_in_buffer == 0){
			remove_body_class('doing-blueprint');
		}
	}	
	
	if(window.play_document_tasks_left == 0){
		//console.log("handle_completed_task: there are no more play_document tasks.");
		if(window.audio_files_in_buffer == 0){
			remove_body_class('playing-document');
		}
	}
	
	if(window.music_to_generate == 0){
		//console.log("handle_completed_task: there is no more music to generate.");
		remove_body_class('doing-musicgen');
	}
	
	if(window.mp3_to_encode == 0){
		//console.log("handle_completed_task: there is no more audio to turn into MP3.");
		remove_body_class('doing-mp3');
	}
	
	if(window.rag_tasks_left == 0){
		//console.log("handle_completed_task: there are no more RAG tasks to perform.");
		remove_body_class('doing-rag');
	}
	
	if(
		window.blueprint_tasks_left == 0 
		&& window.chat_messages_to_answer == 0 
		&& window.tts_tasks_left == 0 
		&& window.stt_tasks_left == 0
		&& window.audio_files_in_buffer == 0 
		&& window.mp3_to_encode == 0 
		&& window.images_to_generate == 0 
		&& window.music_to_generate == 0 
		&& window.play_document_tasks_left == 0 
		&& window.rag_tasks_left == 0 
		&& window.assistant_tasks_left == 0 
		&& window.doing_tasks_left == 0 
		&& window.should_tasks_left == 0
	){
		if(window.settings.settings_complexity == 'developer'){
			console.warn("\n\ndev: AND ALL WAS QUIET IN THE LAND\n\n");
		}
		
		
		window.set_state(LISTENING);
		window.set_chat_status({'assistant':window.settings.assistant},null,'');
		window.set_idle(true);

		//remove_highlight_selection();
	}
	else{
		//console.log("\n+ + + +\nwindow.should_tasks_left: ", window.should_tasks_left);
		//console.log("window.doing_tasks_left: ", window.doing_tasks_left);
		//console.log("window.rag_tasks_left: ", window.rag_tasks_left);
		//console.log("+ + + +\n");
		window.set_idle(false);
	}
	
	//console.log(" -x- window.llama_cpp_busy: ", window.llama_cpp_busy);
	
	if(typeof task.meta != 'undefined' && task.meta != null && typeof task_meta.state == 'string'){
		if(task_meta.state == 'interrupted' || task_meta.state == 'failed'){
			window.clean_up_dead_task(my_task,task_meta.state);
		}
	}
	
	do_overviews();
	
}
window.handle_completed_task = handle_completed_task;




function get_task(index){
	if(typeof index == 'number'){
		for(let t = 0; t < window.task_queue.length; t++){
			//console.log(typeof window.task_queue[t].index, window.task_queue[t].index, " =?= ", typeof task.index, task.index);
			if(window.task_queue[t].index == index){
				return window.task_queue[t];
			}
		}
	}
	return null;
}
window.get_task = get_task;


// Shortcut fuction to quickly set the state of a task.
function set_task_state(task,state='interrupted'){
	//console.log("in set_task_state. task, state: ", task, state);
	if(typeof state != 'string'){
		//console.log("set_task_state: invalid state provided: ", state);
		return false;
	}
	if(typeof task != 'object'){
		//console.log("set_task_state: task was not object. Aborting. task: ", typeof task, task);
		return false;
	}
	if(task == null){
		//console.log("set_task_state: task was null. aborting.");
		return false;
	}
	if(typeof task.index != 'number'){
		//console.log("set_task_state: task had no valid index. aborting.");
		return false;
	}
	
	for(let t = 0; t < window.task_queue.length; t++){
		if(window.task_queue[t].index == task.index){
			if(typeof window.task_queue[t].state == 'string'){
				//console.log("window.task_queue[t].state before: ", window.task_queue[t].state);
			}
			window.task_queue[t]['state'] = state;
			update_task_overview();
			return true
		}
	}
	console.error("set_task_state: could not find task: ", task);
	
	update_task_overview();
	return false
}
window.set_task_state = set_task_state;





// Checks is big tasks are able to run
function check_memory(task, return_megabytes=false){
	//console.log("in check_memory");
	
	if(typeof task == 'undefined' || task == null){
		console.error("check_memory:  invalid task provided");
	}
	else if(typeof task.assistant != 'string'){
		//console.error("check_memory: task does not have assistant property: ", task);
	}
	
	let big_one_busy = false;
	let big_one_loaded = false;
	
	let used_memory = 0;
	if(window.whisper_loaded || window.whisper_loading || window.busy_loading_whisper){
		//console.log("check_memory: whisper is loaded/loading");
		used_memory += 1000;
	}
	if(window.whisper_worker_busy){
		//console.log("check_memory: whisper is busy");
		big_one_busy = true;
		used_memory += 2500;
		if(window.ram > 7000){
			used_memory += 400;
		}
	}
	if(window.tts_worker_busy){
		//console.log("check_memory: tts is busy");
		used_memory += 500;
	}
	
	if(window.ocr_worker_busy){
		//console.log("check_memory: ocr is busy");
		used_memory += 500;
	}
	
	if(window.image_to_text_worker_loaded){
		//console.log("check_memory: image_to_text is loaded");
		used_memory += 2000;
	}
	if(window.image_to_text_worker_busy){
		big_one_busy = true;
		//console.log("check_memory: image_to_text_worker_busy is true");
		used_memory += 1000;
	}
	
	if(window.rag_worker != null){
		//console.log("check_memory: rag worker exists");
		used_memory += 300; // TODO check the size
	}
	
	//console.log("check_memory: guessed memory use of small models: ", used_memory);
	
	
	let assistants_to_measure = [];
	if(typeof window.currently_loaded_llama_cpp_assistant == 'string'){ // window.llama_cpp_busy && 
		//console.log("window.currently_loaded_llama_cpp_assistant : ", window.currently_loaded_llama_cpp_assistant);
		//console.log("check_memory: llama_cpp is busy");
		assistants_to_measure.push(window.currently_loaded_llama_cpp_assistant);
		big_one_loaded = true;
	}
	if(typeof window.currently_loaded_web_llm_assistant == 'string'){ // window.web_llm_busy && 
		//console.log("check_memory: web_llm is busy");
		//console.log("window.currently_loaded_web_llm_assistant : ", window.currently_loaded_web_llm_assistant);
		assistants_to_measure.push(window.currently_loaded_web_llm_assistant);
		big_one_loaded = true;
	}
	
	for(let a = 0; a < assistants_to_measure.length; a++){
		
		const as = assistants_to_measure[a];
		//console.log("check_memory: guessing memory use of assistant: ", as);
		if(typeof window.assistants[as].size == 'number'){
			used_memory += (window.assistants[as].size * 1000);
			
			
			
			//console.log("check_memory: used_memory increase from assistant's size:  +" + window.assistants[as].size," --> ",  used_memory);
			if(typeof window.assistants[as].context == 'number'){
				const context_size = window.assistants[as].context_size;
				const context = window.assistants[as].context;
				
				let word_count = 0;
				if(typeof window.conversations[as] != 'undefined' && Array.isArray(window.conversations[as])){
					//console.log("check_memory: conversation array for this AI exists. It's length: ", window.conversations[as].length)
					for(let c = window.conversations[as].length - 1; c >= 0; c--){
						if(typeof window.conversations[as][c].role == 'string' && typeof window.conversations[as][c].content == 'string'){
							word_count += window.conversations[as][c].content.split(" ").length;
							//console.log("check_memory: conversation history word_count is now: ", word_count);
							
							if(context_size < 4100){
								if( (word_count * 3) < context_size && window.conversations[as][c].role == 'user'){
									//previous_messages_to_include = c;
									//console.log("check_memory: still within context limit: ", as, c, word_count, context_size);
								}
								else{
									break
								}
						
							}
							else { // modern AI models tend to have tokens that are equal to entire words
								if( (word_count * 1.1) < context_size && window.conversations[as][c].role == 'user'){
									//previous_messages_to_include = c;
									//console.log("check_memory: still within context limit: ", as, c , word_count, context_size);
								}
								else{
									break
								}
							}
						}
					}
				
				}
				if(context_size < 4100){
					//console.log("check_memory: guesstimate of how much memory the tokens are using: ", as, (word_count * 4))
					used_memory += (word_count * 4);
				}
				else{
					//console.log("check_memory: guesstimate of how much memory the tokens are using: ", as, (word_count * 4))
					used_memory += (word_count * 4);
				}
				
				
				//used_memory += (window.assistants[task.assistant].context_size / 4);
			}
			else{
				used_memory += 500;
			}
			
		}
		
	}
	
	//console.log("check_memory: guessed memory use of whisper, tts and text-based assistants: ", used_memory);
	
	if(window.musicgen_loaded){
		//console.log("check_memory: musicgen is loaded");
		used_memory += (window.assistants['musicgen'].memory * 1000);
	}
	if(window.musicgen_worker_busy){
		//console.log("check_memory: musicgen is busy");
		used_memory += 1000; // guess
		big_one_busy = true;
	}
	
	if(window.diffusion_worker_loaded && window.busy_loading_diffusion_worker == false){
		used_memory += (window.assistants['imager'].memory * 1000);
	}
	if(window.text_to_image_worker_loaded && window.busy_loading_text_to_image == false){
		used_memory += (window.assistants['text_to_image'].memory * 1000);
	}
	if(window.diffusion_worker_busy && window.busy_loading_diffusion_worker == false){
		//console.log("check_memory: imager is busy");
		used_memory += 1500;// this one is actually the heaviest. Still a guesstimate though
		big_one_busy = true;
	}
	if(window.text_to_image_worker_busy && window.busy_loading_diffusion_worker == false){
		//console.log("check_memory: imager is busy");
		used_memory += 1500;// this one is actually the heaviest. Still a guesstimate though
		big_one_busy = true;
	}
	//console.log("check_memory: total guessed memory use: ", used_memory);
	window.used_memory = used_memory;
	if(used_memory_el){
		used_memory_el.textContent = (Math.round(used_memory/100) / 10);
	}
	
	
	if(return_megabytes){
		//console.log("check_memory: returning megabytes: ", used_memory);
		return used_memory;
	}
	
	// Checking if there is enough memory for the task
	let required_memory = 0;
	if(typeof window.ram == 'number' && window.ram != 0){
		if(typeof window.assistants[task.assistant] != 'undefined' && typeof window.assistants[task.assistant].memory == 'number'){
			required_memory += window.assistants[task.assistant].memory;
		}
		else if(typeof window.assistants[task.assistant] != 'undefined' && typeof window.assistants[task.assistant].size == 'number'){
			required_memory += (window.assistants[task.assistant].size * 1.2); // TODO: could try to more accurately guess how much memory the context would use. That code should probably be extracted out into a separate function
		}
		required_memory = required_memory * 1000;
		//console.log("    check_memory: estimation of used memory: ", used_memory);
		//console.log("^_^ check_memory: estimation of required memory for task: ", required_memory);
		//console.log("    check_memory: available ram: ", window.ram * 1000);
		if((used_memory + required_memory) < (window.ram * 1000)){
			//console.log("check_memory: enough memory available to run task: ", task);
			return true;
		}
		else{
			console.warn("check_memory: not enough memory available to run task: ", task);
			return false
		}
		
	}
	else{
		// To be safe, just say that a new task can't be started at the moment if a big task (text-generation AI, image creation, music creation) is already busy
		return big_one_busy;
	}
	
}
window.check_memory = check_memory;











//
//  MAIN INTERVAL
//
// acts as the engine that checks on the status of tasks and kickstarts processes
// mostly tasks keep themselves busy, asking for a next task when they are complete.

let main_interval_counter = 0;
let previous_interval_done = true;
let interval_blocked_counter = 0;
let previous_used_memory = 0;


function pause_interval(){
	window.interval_paused = !window.interval_paused;
	//console.log("window.interval_paused: ", window.interval_paused);
}


// This interval starts tasks from the task queue
window.main_interval = setInterval( function(){
	//console.log("in interval ",main_interval_counter);
	
	if(window.interval_paused){
		return
	}
	
	if(window.ram < 4001 && previous_interval_done == false){
		//console.log("interval: previous interval isn't done yet, and this is a low memory device, so patiently waiting for it to complete");
	}
	else{
		do_interval();
	}
	
},200);



async function do_interval(){
	//console.log("in do_interval ",main_interval_counter);
	current_time = Math.floor(Date.now()/1000);
	
	//console.log("window.camera_streaming: ", window.camera_streaming);
	/*
	if(current_time % 5 == 0 && document.body.classList.contains('sidebar') && window.settings.left_sidebar == 'settings' && window.settings.left_sidebar_settings_tab == 'tasks'){
		//console.log("interval: updating task overview");
		update_task_overview();
	}
	
	if(current_time % 5 == 0){
		//console.log("interval: 5 seconds passed");
		//update_task_overview();
		
	}
	*/
	//console.log("window.active_section: ", window.active_section);
	
	if(window.busy_doing_blueprint_task){
		//console.log("BUSY doing blueprint task");
	}
	
	
	if (document.pictureInPictureElement) {
		if(window.pip_started == false){
			//console.log("Picture in Picture window has been opened");
		}
		window.pip_started = true;
	}
	else{
		if(window.pip_started){
			//console.log("Picture in Picture window has been closed");
		}
		window.pip_started = false;
	}
	
	
	if (document.hasFocus()) { // document visibility
		if(window.page_has_focus == false){
			//console.log('✅ window regained focus');
			remove_body_class('page-lost-focus');
		}
		window.page_has_focus = true;
		window.page_focus_loss_counter = 0;
		
	} else {
		
		
		if(window.page_focus_loss_counter == 1){
			//console.log('⛔️ window just lost focus (1s)');
			/*
			if(window.audioCtx){
				window.audioCtx.suspend();
			}
			*/
			
		}
		
		if(window.page_focus_loss_counter == 290){
			//console.log('⛔️ window is losing focus (29s)');
			/*
			if(window.audioCtx){
				window.audioCtx.suspend();
			}
			*/
		}
		
		if(window.page_focus_loss_counter == 300){
			if(window.pip_started == false){
				window.page_has_focus = false;
				add_body_class('page-lost-focus');
			}
		}
		
		if(window.page_focus_loss_counter == 1200){
			if(window.idle){
				
				if(window.pip_started == false){
					//console.log("lost focus for over 120 seconds, and idle, so unloading all AI's");
					window.do_unload([]); // unload all AI's
					if(window.pip_started == false){
						if(typeof window.dispose_whisper == 'function'){
							window.dispose_whisper();
							window.dispose_tts();
						}
					}
				}
				
			}
			else{
				//console.log("window has lost focus for a while, but there is still activity. Waiting a bit longer for idle..");
				window.page_focus_loss_counter = 310;
			}
		}
		
		if(window.page_focus_loss_counter < 1201){
			window.page_focus_loss_counter++;
		}
	}
	
	
	if(window.only_allow_voice_commands == true && !document.body.classList.contains('doing-ocr')){
		console.warn("interval: disabling only_allow_voice_commands");
		window.only_allow_voice_commands = false;
	}
	
	
	
	// RUNNING TASKS
	
	let should_update_tasks_overview = false;
	
	// Clean up tasks in the current_tasks list that have been completed, interrupted, etc
	for (const [task_type,details] of Object.entries(window.current_tasks)){
		//console.log("interval: current_tasks: checking:  task_type,details: ", task_type, details);
		if(typeof window.current_tasks[task_type] != 'undefined' && window.current_tasks[task_type] == null){
			console.error("interval: current_tasks: cleaning up null value from window.current_tasks: ", task_type);
			delete window.current_tasks[task_type];
			should_update_tasks_overview = true;
		}
		else if(typeof window.current_tasks[task_type] != 'undefined'){
			if(typeof window.current_tasks[task_type].state == 'string' && window.irrelevant_task_states.indexOf(window.current_tasks[task_type].state) != -1){
				//console.log("interval: current_tasks: cleaning up irrelevant task from window.current_tasks: ", task_type);
				delete window.current_tasks[task_type];
				should_update_tasks_overview = true;
				
			}
			
		}
		else{
			console.error("interval: current_tasks: invalid entry for task_type: ", task_type, details);
			delete window.current_tasks[task_type];
			should_update_tasks_overview = true;
		}
	}
	
	update_buffer_counts()
	
	if(should_update_tasks_overview){
		generate_running_tasks_overview();
	}
	
	
	
	if(current_time != previous_time){
		previous_time = current_time;
		//console.log("a second has passed");

		update_timers();

		if(intro_step > 0 && intro_step < 4){
			intro_step++;
			if(document.getElementById('pane-content-developer-chats')){
				do_intro();
				do_intro();
				do_intro();
			}
		}
		if(window.scribe_clock_time_elapsed_el != null){
			update_scribe_clock();
		}
		
		/*
		if(window.stt_tasks_left > 0){
			//console.log("interval: window.stt_tasks_left: ", window.stt_tasks_left);
		}
		*/
		if(window.tts_tasks_left > 0 || window.audio_output_tasks_left > 0){
			//console.log("interval: window.tts_tasks_left: ", window.tts_tasks_left);
			//console.log("window.audio_output_tasks_left: ", window.audio_output_tasks_left);
		}
		
		
	}
	
	
	if(window.skip_a_beat){
		//console.warn("interval: skipping a beat");
		window.skip_a_beat = false;
		window.task_started = 10;
		//window.interrupt_wllama = false;
		return
	}
	
	
	if(window.task_started > 0){
		window.task_started--;
		if(window.settings.settings_complexity == 'developer'){
			//console.log("zZz");
		}
		return
	}
	
	if(previous_interval_done == false){
		interval_blocked_counter++;
		
		if(interval_blocked_counter < 30){
			if(window.settings.settings_complexity == 'developer'){
				console.error("PREVIOUS INTERVAL WAS NOT DONE YET. ABORTING.  interval_blocked_counter: ", interval_blocked_counter);
			}
			return
		}
		else{
			interval_blocked_counter = 0;
		}
		//console.log("running interval blockade");
		
	}
	previous_interval_done = false;
	
	character_flourish(); // lets a character say "hmm" or "?" is there hasn't been a response in a while
	
	
	try{
		window.used_memory = check_memory({},true);
		if(window.used_memory != previous_used_memory){
			//console.log("interval: used_memory changed: ", previous_used_memory," --> ", window.used_memory);
			previous_used_memory = window.used_memory;
			//console.log("interval: used_memory changed: ", window.used_memory);
			if(typeof window.ram == 'number' && window.ram != 0){
				if( window.ram > window.used_memory){
					window.available_memory = window.ram - window.used_memory;
					//console.log("interval: window.available_memory: ", window.available_memory);
				}
				else{
					window.available_memory = 0;
				}
			}
		}
		
	
		if(
			window.blueprint_tasks_left > 0 
			&& window.chat_messages_to_answer == 0 
			&& window.tts_tasks_left == 0 
			&& window.audio_files_in_buffer == 0 
			&& window.mp3_to_encode == 0 
			&& window.images_to_generate == 0 
			&& window.play_document_tasks_left == 0
		){
			//console.warn("\ninterval: ALMOST QUIET IN THE LAND - BLUEPRINTS LEFT: ", window.blueprint_tasks_left);
			if(window.settings.settings_complexity == 'developer'){
				console.warn("\ninterval: ALMOST QUIET IN THE LAND - BLUEPRINTS BUSY, TASKS LEFT: ", window.busy_doing_blueprint_task, window.blueprint_tasks_left);
			}
			
			//window.busy_doing_blueprint_task = false;
		}
	
		

		main_interval_counter++; // not used for anything?
		
		let requested_preloads = [];


		//console.log("interval. window.speaker_enabled: ", window.speaker_enabled);
		

		// keep an eye out for the first play_document task
		// Why again? ..as only one document may be playing at a time?
		let play_document_task_index = null;
		
		
		

		// A quick 'n dirty, much simpler version of memory management
		let only_small_models = false;
		if(model_busy('big')){
			only_small_models = true;
			add_body_class('big-model-busy');
		}
		else{
			remove_body_class('big-model-busy');
		}
		
		
		
		
		
		
		if(main_interval_counter % 20 == 0 && window.settings.settings_complexity == 'developer' && window.testing){
			
			//console.log("-------")
			
			console.warn("- only_small_models: ", only_small_models);
			console.warn("- window.currently_running_llm: ", window.currently_running_llm);
		
			console.warn("- window.llama_cpp_busy: ", window.llama_cpp_busy);
			console.warn("- window.doing_llama_cpp_refresh: ", window.doing_llama_cpp_refresh);
			console.warn("- window.web_llm_busy: ", window.web_llm_busy);
			console.warn("- window.doing_web_llm_refresh: ", window.doing_web_llm_refresh);
			console.warn("- : ", );
			console.warn("- window.whisper_worker_busy: ", window.whisper_worker_busy);
			console.warn("- window.tts_worker_busy: ", window.tts_worker_busy);
			console.warn("- window.audio_player_busy: ", window.audio_player_busy);
			console.warn("- window.image_to_text_worker_busy : ", window.image_to_text_worker_busy);
			
			//console.warn("- window.diffusion_worker_busy: ", window.diffusion_worker_busy);
		
			console.warn("- : ", );
			console.warn("- window.busy_loading_diffusion_worker: ", window.busy_loading_diffusion_worker);
			console.warn("- window.web_llm_model_being_loaded: ", window.web_llm_model_being_loaded);
			console.warn("- window.llama_cpp_model_being_loaded: ", window.llama_cpp_model_being_loaded);
			console.warn("- window.busy_loading_assistant: ", window.busy_loading_assistant);
			console.warn("- window.busy_loading_tts: ", window.busy_loading_tts);
			console.warn("- window.busy_loading_whisper: ", window.busy_loading_whisper);
			console.warn("- window.busy_loading_image_to_text: ", window.busy_loading_image_to_text);
			console.warn("- : ", );
			console.warn("- : ", );
			
		}
		
		
		// DO ONE TASK AT A TIME ON LOW MEMORY SYSTEMS
		let one_task_at_a_time = false
		if(window.ram < 4001 && model_busy('any')){
			//console.log("interval: low memory, only doing one task at a time");
			one_task_at_a_time = true;
		}
		
		
		
		
		
		let something_left_to_do = false;
		
		for(let t = 0; t < window.task_queue.length; t++){
			//console.log("t: ", t);
			if(window.task_queue[t] == null){
				window.task_queue.splice(t,1);
				console.error("interval: found a NULL task. Removed it."); // likely a worker returning a null my_task somewhere? Happened once after a llama.cpp crash
				t--;
				return
			}
			if(typeof window.task_queue[t].type == 'undefined' || typeof window.task_queue[t].type != 'string' || typeof window.task_queue[t].state == 'undefined' || typeof window.task_queue[t].state != 'string'){
				console.error("interval: found invalid task. type or state was not a string: ", window.task_queue[t]);
				if(typeof window.task_queue[t] == 'object' && window.task_queue[t] != null){
					window.task_queue[t].state = 'failed';
				}
				else{
					window.task_queue.splice(t,1);
					return
				}
				continue
			}
			else if(typeof window.task_queue[t].state == 'string'){
		
				if(window.task_queue[t].state.startsWith('should_') || window.task_queue[t].state.startsWith('doing_')){
					something_left_to_do = true;
				}
		
				let runner = null;
				
				if(typeof window.task_queue[t].runner == 'string'){
					runner = window.task_queue[t].runner;
				}
				else{
					runner = get_task_runner(window.task_queue[t]);
				}
				
				if(typeof runner != 'string'){
					runner = 'error';
				}
				
				let cached = check_if_cached(window.task_queue[t].assistant);
				//console.log("interval: cached: ", cached);
				//console.log(",\n.\n;\n\n", t , "_________________________interval________________________")
			
				if(window.task_started){
					//console.log("interval: a task was already started this interval. Let's wait a bit.");
					break
				}
				
				
				if(window.irrelevant_task_states.indexOf(window.task_queue[t].state) == -1){
					if(typeof window.task_queue[t].assistant == 'string'){
						
						//let runner = get_task_runner(window.task_queue[t]);
						
						//console.log("--- type: ", window.task_queue[t].type);
						//console.log("--- runner: ", runner);
						//console.log("--- cached: ", cached);
						
						
						if( window.task_queue[t].type != 'preload' && window.task_queue[t].type != 'undetermined' && window.task_queue[t].type != 'save_image' && typeof runner == 'string' && (runner == 'web_llm' || runner == 'llama_cpp') && cached == false){
							
							let model_file_name = null;
							if(typeof window.settings.assistants[window.task_queue[t].assistant] != 'undefined' && typeof window.settings.assistants[window.task_queue[t].assistant].model_file_name == 'string' && window.settings.assistants[window.task_queue[t].assistant].model_file_name.length > 4){
								model_file_name = window.settings.assistants[window.task_queue[t].assistant].model_file_name
							}
							else if(typeof window.assistants[window.task_queue[t].assistant] != 'undefined' && typeof window.assistants[window.task_queue[t].assistant].model_file_name == 'string' && window.assistants[window.task_queue[t].assistant].model_file_name.length > 4){
								model_file_name = window.assistants[window.task_queue[t].assistant].model_file_name
							}
							if(typeof model_file_name == 'string'){
								if(requested_preloads.indexOf(window.task_queue[t].assistant) == -1){
									requested_preloads.push(window.task_queue[t].assistant);
									//console.log("interval: the needed model hasn't been (fully) preloaded yet.  model_file_name, runner, assistant, task: ", model_file_name, runner, window.task_queue[t].assistant, window.task_queue[t]);
									window.preload_model({'assistant':window.task_queue[t].assistant});
								}
								continue
							}
						}
						
						
						if(cached){
							//console.log("interval: Nice, this model is already cached: ", window.task_queue[t].assistant, window.task_queue[t].state);
						}
						else{
							
							
							
							
							//console.log("interval: this model doesn't seem to be cached yet.  assistant,state: ", window.task_queue[t].assistant, window.task_queue[t].state);
							//continue
							
							if(window.currently_downloading() == false){
								if(!window.task_queue[t].state.startsWith('doing')){
									//console.log("interval: No model is being (down)loaded at the moment, and for this task a new model should be (down)loaded, so let's do that.  assistant,task: ", window.task_queue[t].assistant, window.task_queue[t]);
								}
								
							}
							else if(window.task_queue[t].assistant != 'speaker' && window.task_queue[t].assistant != 'translator' && window.task_queue[t].state != 'parent'){
								//console.log("currently_downloading was true");
								if( typeof window.task_queue[t].assistant == 'string' && (window.task_queue[t].assistant == window.web_llm_model_being_loaded || window.task_queue[t].assistant == window.llama_cpp_model_being_loaded)){
									//console.log("interval: GOOD, this model is being loaded by WebLLM or Wllama: ",  window.task_queue[t].assistant, window.web_llm_model_being_loaded, window.llama_cpp_model_being_loaded);
								}
								else{
									/*
									console.warn("interval: to perform this task a model needs to be downloaded (it's not in the cache), but a model is already being (down)loaded at the moment.  assistant,task: ", window.task_queue[t].assistant, window.task_queue[t]);
									console.warn(" - window.task_queue[t].assistant: ", window.task_queue[t].assistant);
									console.warn(" - window.web_llm_model_being_loaded: ", window.web_llm_model_being_loaded);
									console.warn(" - window.llama_cpp_model_being_loaded: ", window.llama_cpp_model_being_loaded);
									*/
								}
								
								//continue
							}
							else{
								//console.log("interval: fell through. window.task_queue[t].assistant: ", window.task_queue[t].assistant);
							}
							
						}
						
						
						
					}
					else{
						// getting a bit stricter about what properties tasks should minimally have
						console.error("interval: spotted task without an assistant property. Setting task to failed: ", window.task_queue[t]);
						window.task_queue[t].state = 'failed';
						continue
					}
				}
				else if(window.settings.settings_complexity != 'developer'){
					// this task is already in an irrelevant state
					
					if(window.settings.left_sidebar_open && window.settings.left_sidebar == 'settings' && window.settings.left_sidebar_settings_tab == 'tasks'){
						// Don't remove old tasks while the tasks are being viewed
					}
					else if(typeof window.task_queue[t]['timestamp_irrelevance'] != 'undefined'){ //  && typeof window.task_queue[t].parent_index != 'number'
						
						if(Date.now() - window.task_queue[t]['timestamp_irrelevance'] > time_to_keep_irrelevant_task){ // a few minutes
							//console.error("REMOVING OLD TASK FROM window.task_queue: ", JSON.stringify(window.task_queue[t],null,4));
							
							if(typeof window.task_queue[t].type == 'string' && window.task_queue[t].type.endsWith('parent') && typeof window.task_queue[t].assistant == 'string' && window.task_queue[t].assistant == 'scribe'){
								// no not clean up scribe parent tasks
							}
							else{
								if(window.settings.settings_complexity == 'developer'){
									console.warn("cleaning up old task. type: " + window.task_queue[t].type + ", origin: " + window.task_queue[t].origin);
								}
								window.task_queue.splice(t,1);
								t--;
								continue
							}
							
						}
					}
					
				}
				
				
				
				
				
				
				
			
			
				//
				//   INTERVAL -> PRELOAD
				//
			
				// This calls do_preload, which is a download function for Wllama models
				if(
					window.llama_cpp_model_being_loaded == null 
					&& window.task_queue[t].type == 'preload' 
					&& window.task_queue[t].state == 'should_preload' 
					&& typeof window.task_queue[t].runner == 'string' 
					&& window.task_queue[t].runner == 'llama_cpp' 
					&& typeof window.task_queue[t].assistant == 'string'
				){
					//console.log("interval: starting preload task for llama.cpp model: ", window.task_queue[t].assistant);
					if(window.llama_cpp_app == null){
						console.error("interval: starting preload: have to create llama_cpp_app first");
						
						if(typeof window.create_wllama_object != 'function'){
							await load_runners();
						}
						
						
						
						window.create_wllama_object();
					}
					
					if(window.llama_cpp_app != null){
						//console.log("interval: starting Wllama preload task");
						window.llama_cpp_model_being_loaded = window.task_queue[t].assistant;
						//console.log("window.llama_cpp_model_being_loaded is now: ", window.llama_cpp_model_being_loaded);
						window.task_queue[t].state = 'doing_preload';
						add_chat_message(window.task_queue[t].assistant,window.task_queue[t].assistant,"download_progress#setting---");
						window.do_preload(window.task_queue[t]);
					
						window.task_started = 10;
					}
				}
				
				
				//
				//   INTERVAL -> SAVE IMAGE
				//
				// This task is a bit different, as it can be immediately completed
				if(window.task_queue[t].state == 'save_image' && typeof window.task_queue[t].image_blob != 'undefined'){ // || is_task_relevant(window.task_queue[t], 'mp3') == true){
					//console.log("interval: sending 'save_image' task directly to handle_completed_task: ", window.task_queue[t]);
					handle_completed_task(window.task_queue[t],window.task_queue[t].image_blob);
				}
		
				
				
				// INTERVAL -> AUDIO PLAYER
				
				if(window.audio_player_busy == false && 
					(window.task_queue[t].state == 'should_audio_player' || 
						(window.task_queue[t].type == 'speak' && window.task_queue[t].state == 'doing_tts' && typeof window.task_queue[t].audio != 'undefined') 
					)
				){
					//console.log("interval: found task that should play audio, and audio player is not busy");
			
					window.task_queue[t].state = 'doing_audio_player';
					if(window.task_queue[t] != null && typeof window.task_queue[t].type == 'string'){
						window.current_tasks[window.task_queue[t].type] = window.task_queue[t];
					}
					window.do_audio_player(window.task_queue[t]);
					window.task_started = 10;
				}
				
				
				
				
				
				// INTERVAL -> MP3 (not currently used)
				
				//console.log("interval: mp3 check");
				if(window.mp3_worker_busy == false){
			
					//console.log("__OK mp3_worker is not busy. next: state: ", window.task_queue[t].state)
					if(window.task_queue[t].state == 'should_mp3'){ // || is_task_relevant(window.task_queue[t], 'mp3') == true){
				
						window.task_queue[t].state = 'doing_mp3';
				
						if(window.do_mp3(window.task_queue[t])){
							//console.log("interval: successfully passed task to do_mp3: ", window.task_queue[t]);
							if(window.task_queue[t] != null && typeof window.task_queue[t].type == 'string'){
								window.current_tasks[window.task_queue[t].type] = window.task_queue[t];
							}
						}
						else{
							console.warn("interval: FAILED TO GET THE MP3 CONVERSION STARTED: ", JSON.stringify(window.task_queue[t],null,4));
							window.task_queue[t].state = 'failed'; // TODO: a bit harsh, could/should just be delayed until later?
						}
					}
				}
				
				
				if(one_task_at_a_time && window.ram < 4000){
					continue
				}
				
				
				
				//
				// OCR
				//
				
				if(window.ocr_worker_busy == false && window.busy_starting_camera == false){
			
					//console.log("__OK ocr_worker is not busy. next: state: ", window.task_queue[t].state)
					if(window.task_queue[t].state == 'should_ocr'){ // || is_task_relevant(window.task_queue[t], 'mp3') == true){   // window.task_queue[t].type == 'image_processing' && 
						
						//console.log("interval: STARTING OCR TASK");
						window.ocr_worker_busy = true;
						
						window.add_script('./camera_module.js',true) // add it as a module
						.then((value) => {
							
							//console.log("There is an added OCR task. camera_module.js loaded: ", value);
							window.task_queue[t].state = 'doing_ocr';
				
							if(window.do_ocr(window.task_queue[t])){
								//console.log("interval: successfully passed task to do_ocr: ", window.task_queue[t]);
								if(window.settings.assistant == 'image_to_text_ocr'){
									add_body_class('model-loaded');
								}
								if(window.task_queue[t] != null && typeof window.task_queue[t].type == 'string'){
									window.current_tasks[window.task_queue[t].type] = window.task_queue[t];
								}
							}
							else{
								console.error("interval: FAILED TO GET OCR STARTED: ", JSON.stringify(window.task_queue[t],null,4));
								window.task_queue[t].state = 'failed'; // TODO: a bit harsh, could/should just be delayed until later?
								window.ocr_worker_busy = false;
							}
							
						})
						.catch((err) => {
							console.error("caught error loading camera_module script / calling do_ocr: ", err);
							window.ocr_worker_busy = false;
						})
						
						
						window.task_started = 10;
					}
				}
				
				
				if(one_task_at_a_time){
					continue
				}
		
		
				
				// INTERVAL -> STT
				
				if(window.whisper_worker_busy == false && window.preloading_whisper == false && window.busy_loading_whisper == false && window.doing_low_memory_tts_chat_response == false){
					if(window.task_queue[t].state == 'should_stt'){
						//console.log("interval: found should_stt task: ", window.task_queue[t]);
						//window.whisper_worker_busy = true;
						/*
						if(typeof window.task_queue[t].progress_index == 'number' && window.task_queue[t].progress_index == 0){
							//console.log("interval: calling clear_whisper_speakers: ", window.task_queue[t]);
							window.clear_whisper_speakers();
						}
						*/
						if(window.whisper_loaded == false){
							//console.log("interval: should_stt task, but window.busy_loading_whisper is false and window.whisper_loaded is false. calling preload_whisper.");
							window.preload_whisper();
							
						}
						else{
							//console.log("interval: doing stt task: ", window.task_queue[t]);
							window.task_queue[t].state = 'doing_stt';
							try{
								if(await window.do_stt(window.task_queue[t]) === true){
									//console.log("interval: succesfully called do_sst");
									window.whisper_worker_busy = true;
									if(window.task_queue[t] != null && typeof window.task_queue[t].type == 'string'){
										window.current_tasks[window.task_queue[t].type] = window.task_queue[t];
									}
									add_body_class('doing-stt');
									window.task_started = 10;
									if(typeof window.task_queue[t].assistant == 'string' && window.task_queue[t].assistant == 'scribe'){
										window.currently_running_llm = window.task_queue[t].assistant;
									}
								}
								else{
									console.error("interval: calling do_sst failed");
									//window.task_queue[t].state = 'failed';
									await window.handle_completed_task(window.task_queue[t],null,{'state':'failed'});
									remove_body_class('doing-stt');
									window.whisper_worker_busy = false;
								}
							}
							catch(err){
								console.error("interval: do_stt caused an error: ", err);
								await window.handle_completed_task(window.task_queue[t],null,{'state':'failed'});
								remove_body_class('doing-stt');
								window.whisper_worker_busy = false;
							}
						}
						
						
						
					}
					
				}
		
		
				
				
		
				// TTS CHECK
				let tts_possible = false
		
				//console.log("interval: tts check");
				if(window.tts_worker_busy == false && window.busy_loading_tts == false){
					
					if(window.task_queue[t].state == 'should_tts' ){ // || is_task_relevant(window.task_queue[t], 'tts') == true
						//console.log("interval: task seems to be relevant for tts: ", JSON.stringify(window.task_queue[t],null,4));
					
						if(window.tts_worker_loaded == false){
							//console.log("calling preload_tts from interval");
							window.preload_tts();
							window.busy_loading_tts = true;
						}
						
						else{
							if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'blueprint'){
								console.error("blueprint, so setting task voice to current one: ", window.task_queue[t].voice, " -> ",  window.settings.voice)
								window.task_queue[t].voice = window.settings.voice;
							}
				
							//console.log("interval: tts_check: switching to 'doing_tts' and feeding task to do_tts (T5)");
							window.task_queue[t].state = 'doing_tts';
							try{
								const do_tts_result = await window.do_tts(window.task_queue[t]);
								//console.log("do_tts_result: ", do_tts_result);
								if(do_tts_result === true){
									//console.log("interval: successfully passed task to T5 tts: ", window.task_queue[t]);
									//window.task_queue[t].state = 'doing_assistant';
									if(window.task_queue[t] != null && typeof window.task_queue[t].type == 'string'){
										window.current_tasks[window.task_queue[t].type] = window.task_queue[t];
									}
								}
								else{
									console.warn("interval: FAILED TO CALL DO_TTS.  task: ", window.task_queue[t]);
									await window.handle_completed_task(window.task_queue[t],null,{'state':'failed'});
									window.tts_worker_busy = false;
									//window.task_queue[t].state = 'failed'; // TODO: a bit harsh, could/should just be delayed until later?
								}
					
								window.task_started = 10;
							}
							catch(err){
								console.error("interval: do_tts caused an error: ", err);
								await window.handle_completed_task(window.task_queue[t],null,{'state':'failed'});
								window.tts_worker_busy = false;
							}
						}
						
					}
					
				}
				
				
				
		
		
			
				//
				//   TRANSLATION
				//
		
				if(window.translation_worker_busy == false){
			
					//console.log("__OK tts is not busy. next: state: ", window.task_queue[t].state)
				
					if(window.task_queue[t].state == 'should_translation' && typeof window.do_translation == 'undefined'){
						console.error("interval: there is a translation task, but window.do_translation is still undefined");
						window.task_queue[t].state = 'failed';
						update_task_overview();
					}
				
					else if(window.task_queue[t].state == 'should_translation' && window.do_translation){ // || is_task_relevant(window.task_queue[t], 'mp3') == true){
					
						window.task_queue[t].state = 'doing_translation';
						//window.translation_worker_busy = true;
					
						let translation_rewrite_result_el = null;
						if(typeof window.task_queue[t].parent_index == 'number'){
							translation_rewrite_result_el = document.getElementById('rewrite-result' + window.task_queue[t].parent_index);
						}
						if(translation_rewrite_result_el == null && typeof window.task_queue[t].index == 'number'){
							translation_rewrite_result_el = document.getElementById('rewrite-result' + window.task_queue[t].index);
						}
						if(translation_rewrite_result_el){
							//console.log("starting translation task, and adding 'in-progress' class to rewrite_result element. task: ", window.task_queue[t]);
							translation_rewrite_result_el.classList.add("in-progress");
						}
						
						if(
							typeof window.task_queue[t].file != 'undefined' 
							&& window.task_queue[t].file != null 
							&& typeof window.task_queue[t].file.folder == 'string' 
							&& typeof window.task_queue[t].file.filename == 'string' 
							&& window.task_queue[t].file.folder == folder 
							&& window.task_queue[t].file.filename == current_file_name
						){
							
							if(
								typeof window.task_queue[t].origin == 'string' 
								&& (window.task_queue[t].origin == 'translate_document' || window.task_queue[t].origin == 'translate_selection')
							){
								let sentence_to_translate_highlighted = highlight_selection_from_task(window.task_queue[t]);
								//console.log("main: interval: sentence_to_translate_highlighted?", sentence_to_translate_highlighted);
							}
							
							if(
								typeof window.task_queue[t]['feeling_lucky'] == 'boolean' 
								&& window.task_queue[t]['feeling_lucky'] == true 
								&& typeof window.task_queue[t].selection != 'undefined' 
								&& window.task_queue[t].selection != null 
								&& typeof window.task_queue[t].selection.from == 'number' 
								&& typeof window.task_queue[t].selection.to == 'number' 
								&& typeof window.task_queue[t].selection.from != window.task_queue[t].selection.to
							){
								highlight_selection(window.task_queue[t].selection);
							}
						}
						
					
					
						if(window.task_queue[t] != null && typeof window.task_queue[t].type == 'string'){
							window.current_tasks[window.task_queue[t].type] = window.task_queue[t];
						}
					
						const my_task = window.task_queue[t];
					
						add_body_class('doing-translation');
						
						
						try{
							let value = await window.do_translation(window.task_queue[t]);
							//console.log("main: interval: do_translation was resolved.  value: ", value);
					
							if(value && typeof value.task != 'undefined' && typeof value.translation != 'undefined'){
								//console.log("main: interval: do_translation resolved a task and translation");
								let full_translation = '';
							
								if(value && Array.isArray(value.translation)){
							
									// TODO: recreate newlines in translation output based on translation input
									for(let f = 0; f < value.translation.length; f++){
										if(typeof value.translation[f].translation_text == 'string'){
											full_translation += value.translation[f].translation_text + ' ';
										}
									}
									//console.log("main: interval: resolved translation: full_translation: ", full_translation);
								
									let completed_meta = {};
									if(typeof value.translated_property == 'string'){
										completed_meta[value.translated_property] = full_translation;
										//console.log("main: interval: completed_meta: ", completed_meta);
										if(value.translated_property == 'prompt' && typeof window.task_queue[t].prompt == 'string'){
											//console.log("main: interval: taking a shortcut to placing the translated prompt into the task");
											window.task_queue[t]['original_prompt'] = window.task_queue[t].prompt;
											window.task_queue[t]['prompt'] = full_translation;
										}
									}
									else{
										console.warn("resolved translation had no translated_property value? ", value);
									}
									
									remove_body_class('doing-translation');
									await window.handle_completed_task(value.task, full_translation, completed_meta);
									
								}
								else if(value && typeof value.translation == 'string'){
									//console.log("main: interval: do_translation .then: value.translation: ", value.translation);
									remove_body_class('doing-translation');
									await window.handle_completed_task(value.task, value.translation);
								}
								else{
									console.error("main: interval: resolved translation was not an array? ", value.translation);
								}
						
							}
						}
						catch(e){
							console.error("main: interval: caught error after do_translation .then: ", err);
							remove_body_class('doing-translation');
							update_task_overview();
							flash_message(get_translation('Translation_failed'),3000,'fail');
						}							
						window.translation_worker_busy = false;
						remove_body_class('doing-translation');
					
						
							
						
						
						window.task_started = 10;
						
						/*
						if(window.do_translation(window.task_queue[t])){
							//console.log("interval: successfully passed task to do_translation: ", window.task_queue[t]);
						}
						else{
							console.warn("interval: FAILED TO GET THE TRANSLATION STARTED: ", JSON.stringify(window.task_queue[t],null,4));
							window.task_queue[t].state = 'failed'; // TODO: a bit harsh, could/should just be delayed until later?
						}
					
						*/
					}
				
				}
				
				
				// INTERVAL -> ASSISTANT CHECK
				//console.log("interval: assistant check");
				
				//console.log("interval: ASSISTANT CHECK  runner: ", runner, ", runner busy?", window[runner + '_busy']);
				
				if(runner == 'ollama' && (window.ollama_module_loaded == false  || typeof window.do_ollama == 'undefined')){
					console.warn("interval: ollama task, but ollama module is not loaded yet. window.ollama_module_loaded: ", window.ollama_module_loaded);
					continue
				}
				
				if(
					only_small_models == false &&
					window.llama_cpp_busy == false && 
					window.llama_cpp_model_being_loaded == null && 
					window.web_llm_busy == false && 
					window.web_llm_model_being_loaded == null &&
					window.ollama_busy == false && 
					window[runner + '_busy'] == false && 
					window['doing_' + runner + '_refresh'] == false
					 //&& 
					//window.llama_cpp_model_being_loaded == null && 
					//window.web_llm_model_being_loaded == null && 
					//window.ollama_model_being_loaded == null
				){
					//console.log("Runner not busy, and not busy refreshing the runner either: ", runner);
					if(window.task_queue[t].state == 'should_assistant' || (window.task_queue[t].state == 'doing_assistant' && typeof window.task_queue[t].results != 'undefined' && typeof window.task_queue[t].desired_results == 'number' && window.task_queue[t].results.length < window.task_queue[t].desired_results)){
						//console.log("This task should be (further) worked on by a text-generation AI: ", window.task_queue[t]);
						
						if(window.task_queue[t].state == 'doing_assistant' && typeof window.task_queue[t].in_progress == 'boolean' && window.task_queue[t].in_progress == true){
							//console.log("task already has in_progress set to true: ", window.task_queue[t]);
							//window.task_queue[t].in_progress = false;
							console.error("an assistant task already has in_progress set to true, but a runner wasn't set as true? runner: ", runner, window.task_queue[t]);
							window.task_queue[t].in_progress = false;
							//window[runner + '_busy'] = true;
							continue
						}
						
						if(window.task_queue[t].state == 'should_assistant' && window.task_queue[t].type == 'research'){
							setTimeout(() => {
								window.add_chat_message('current','clone_researcher1',get_translation("Turning_your_question_into_search_keywords"),"Turning_your_question_into_search_keywords",null,window.task_queue[t].index);
							},100);
							
						}
						
						
						
						if( window.task_queue[t].type == 'summarize' || window.task_queue[t].type == 'rewrite' || window.task_queue[t].type == 'continue' ){
							
							add_body_class('doing-' + window.task_queue[t].type);
							
							if(typeof window.task_queue[t].assistant == 'string'){
								
								if(window.task_queue[t].assistant != 'developer' && window.settings.assistant == 'developer'){
									switch_assistant(window.task_queue[t].assistant);
								}
								
								//console.log("interval: assistant: cleared conversation history for: ", window.task_queue[t].assistant);
								//window.conversations[window.task_queue[t].assistant] = [];
								let old_chat_bubbles = document.querySelectorAll('.message.pane-' + window.task_queue[t].assistant);
								//console.log("old_chat_bubbles: ", old_chat_bubbles);
								if(old_chat_bubbles.length){
									for(let b = 0; b < old_chat_bubbles.length; b++){
										old_chat_bubbles[b].classList.add('forgotten');
									}
								}
								
								
							}
							
						}
						
						//console.log("setting task state to doing_assistant.  window.task_queue[t].index:  ", window.task_queue[t].index);
						window.task_started = 10;
						window.task_queue[t].state = 'doing_assistant';
						//let assistant_started = await ;
						let assistant_started = null;
						assistant_started = await start_assistant(window.task_queue[t]);
						
						if(assistant_started === true){
							//console.log("interval: successfully passed task to assistant: ", window.task_queue[t]);
							//window.task_queue[t].state = 'doing_assistant';
							/*
							if(window.task_queue[t].type == 'string' && window.task_queue[t].type == 'continue'){
								add_body_class('working-on-doc');
							}
							*/
							add_body_class('doing-assistant');
							
							let rewrite_result_el = document.getElementById('rewrite-result' + window.task_queue[t].index);
							if(rewrite_result_el){
								//console.log("interval: adding 'in-progress' class to rewrite-result output element. task: ", window.task_queue[t]);
								rewrite_result_el.classList.add("in-progress");
							}
							
							
							// Add highlight to text to indicate it's being worked on
							// TODO: why only do this for "feeling lucky" tasks?
							if(
								typeof window.task_queue[t].file != 'undefined' 
								&& window.task_queue[t].file != null 
								&& typeof window.task_queue[t].file.folder == 'string' 
								&& typeof window.task_queue[t].file.filename == 'string' 
								&& window.task_queue[t].file.folder == folder 
								&& window.task_queue[t].file.filename == current_file_name
							){
								
								if( 
									(
										window.task_queue[t].type == 'summarize' 
										|| window.task_queue[t].type == 'rewrite'
									) 
									&& typeof window.task_queue[t]['feeling_lucky'] == 'boolean' 
									&& window.task_queue[t]['feeling_lucky'] == true
									&& typeof window.task_queue[t].selection != 'undefined' 
									&& window.task_queue[t].selection != null 
									&& typeof window.task_queue[t].selection.from == 'number' 
									&& typeof window.task_queue[t].selection.to == 'number' 
									&& typeof window.task_queue[t].selection.from != window.task_queue[t].selection.to
								){
									highlight_selection(window.task_queue[t].selection);
								}
								if( 
									window.task_queue[t].type == 'continue' 
									&& typeof window.task_queue[t]['feeling_lucky'] == 'boolean' 
									&& window.task_queue[t]['feeling_lucky']  == true
									&& typeof window.task_queue[t].selection != 'undefined' 
									&& window.task_queue[t].selection != null 
									&& typeof window.task_queue[t].selection.from == 'number' 
									&& typeof window.task_queue[t].selection.to == 'number' 
									&& typeof window.task_queue[t].selection.from != window.task_queue[t].selection.to
								){
									highlight_selection(window.task_queue[t].selection);
								}
							}
							
							
							
							if(typeof window.task_queue[t].assistant == 'string'){
								//console.log("interval: succesfully started assistant, so setting window.currently_running_llm to: ", window.task_queue[t].assistant);
								window.currently_running_llm = window.task_queue[t].assistant;
							}
							else{
								window.currently_running_llm = null;
							}
							if(window.task_queue[t] != null && typeof window.task_queue[t].type == 'string'){
								window.current_tasks[window.task_queue[t].type] = window.task_queue[t];
							}
							
							set_idle(false);
							window.update_interrupt_button_icon(window.task_queue[t]);
							
							window.task_started = 10;
							break;
						}
						else{
							console.warn("interval: FAILED TO GET THE ASSISTANT STARTED: ", JSON.stringify(window.task_queue[t],null,4));
							window.task_queue[t].state = 'failed'; // TODO: a bit harsh, could/should just be done a little later?
						
							setTimeout(() => {
								window[runner + '_busy'] = false;
							},1);
						}
					
					
						
			
			
					}
					else{
						//console.log("There is no task for assistant to work on.");
					}
				}
				else{
					//console.log("cannot start assistant task right now. busy runner: ", runner, window[runner + '_busy'], " doing runner refresh: ", window['doing_' + runner + '_refresh']);
				}
				
				
				
				if(only_small_models == false && window.busy_doing_research == false){
					
					if(window.task_queue[t].state == 'should_research'){
						console.error("interval: spotted a should_research task");
						
						window.busy_doing_research = true;
						
						try{
							await window.add_script('./researcher_module.js',true); // add it as a module
							//console.log("researcher_module.js is now loaded");
	
							//ensure_text_ai();
							window.task_queue[t].state = 'doing_research';
							if(window.task_queue[t] != null && typeof window.task_queue[t].type == 'string'){
								window.current_tasks[window.task_queue[t].type] = window.task_queue[t];
							}
							update_task_overview();
							
							window.do_research(window.task_queue[t]);
							
						}
						catch (err) {
							console.error("failed to load researcher_module.js: ", err);
							window.task_queue[t].state = 'failed';
							window.busy_doing_research = false;
							flash_message(get_translation("An_error_occured"),2000,'fail');
						}
						//return
						
						window.task_started = 10;
					}
					
				}
				
		
		
				//console.log("interval: diffusion check");
				if(only_small_models == false && window.diffusion_worker_busy == false){
			
					//console.log("__OK diffusion worker is not busy. next: state: ", window.task_queue[t].state)
					if(window.task_queue[t].type == 'image' && (window.task_queue[t].state == 'added' || window.task_queue[t].state == 'should_imager')){ // || is_task_relevant(window.task_queue[t], 'mp3') == true){
						window.diffusion_worker_busy = true;
						//console.log("There is an added image task");
						window.task_queue[t].state = 'doing_imager';
						
						do_unload(['imager']);
						
						if(window.do_imager(window.task_queue[t])){
							//console.log("interval: successfully passed task to do_imager: ", window.task_queue[t]);
							if(window.task_queue[t] != null && typeof window.task_queue[t].type == 'string'){
								window.current_tasks[window.task_queue[t].type] = window.task_queue[t];
							}
						}
						else{
							console.warn("interval: FAILED TO GET IMAGE GENERATION STARTED: ", JSON.stringify(window.task_queue[t],null,4));
							window.task_queue[t].state = 'failed'; // TODO: a bit harsh, could/should just be delayed until later?
							window.diffusion_worker_busy = false;
						}
						window.task_started = 10;
					}
				}
				
				
				if(only_small_models == false && window.text_to_image_worker_busy == false){
			
					//console.log("__OK text_to_image_worker is not busy. next: state: ", window.task_queue[t].state);
					if(window.task_queue[t].state == 'should_text_to_image'){ // window.task_queue[t].type == 'image' &&   // || is_task_relevant(window.task_queue[t], 'mp3') == true){
						
						/*
						window.text_to_image_worker = null;
						window.text_to_image_worker_loaded = false;
						window.real_text_to_image_worker = null;
						window.text_to_image_worker_busy = false;
						window.busy_loading_text_to_image = false;
						*/
						
						if(window.text_to_image_worker_loaded == false){
							if(window.busy_loading_text_to_image == false){
								window.preload_text_to_image();
								window.busy_loading_text_to_image = true;
								window.text_to_image_worker_busy == false;
							}
							
							
							//window.task_started = 1;
						}
						else{
							window.text_to_image_worker_busy = true;
							//console.log("There is an added image task");
							window.task_queue[t].state = 'doing_text_to_image';
						
							do_unload(['text_to_image']);
						
							if(window.do_text_to_image(window.task_queue[t])){
								//console.log("interval: successfully passed task to do_imager: ", window.task_queue[t]);
								if(window.task_queue[t] != null && typeof window.task_queue[t].type == 'string'){
									window.current_tasks[window.task_queue[t].type] = window.task_queue[t];
								}
							}
							else{
								console.warn("interval: FAILED TO GET TEXT TO IMAGE GENERATION STARTED: ", JSON.stringify(window.task_queue[t],null,4));
								window.task_queue[t].state = 'failed'; // TODO: a bit harsh, could/should just be delayed until later?
								window.text_to_image_worker_busy = false;
							}
							window.task_started = 10;
						}
						
						
						
					}
				}
				
				
		
		
				
				
				
				// IMAGE TO TEXT
				if(only_small_models == false && window.image_to_text_worker_busy == false && window.busy_starting_camera == false){  //  && window.task_queue[t].state != 'parent'
			
					//console.log("INTERVAL: __OK image_to_text is not busy. candidate task's state: ", window.task_queue[t].state);
					//console.log("INTERVAL: __OK image_to_text is not busy. candidate task's type: ", window.task_queue[t].type);
					//console.log("Interval: __OK typeof window.task_queue[t].image_blob: ", typeof window.task_queue[t].image_blob);
					if(window.task_queue[t].state == 'should_image_to_text' && typeof window.task_queue[t].image_blob != 'undefined'){ // || is_task_relevant(window.task_queue[t], 'mp3') == true){  // window.task_queue[t].type == 'image_to_text' && 
						
						//console.log("There is an added image_to_text task");
						//console.log('INTERVAL: STARTING IMAGE TO TEXT TASK');
						
						window.image_to_text_worker_busy = true;
						window.task_queue[t].state = 'doing_image_to_text';
						window.current_task = window.task_queue[t];
						if(window.task_queue[t] != null && typeof window.task_queue[t].type == 'string'){
							window.current_tasks[window.task_queue[t].type] = window.task_queue[t];
						}
						window.task_started = 10;
						
						if(window.image_to_text_worker_loaded == false){
							
						}
						
						try{
							await window.add_script('./image_to_text_module.js',true) // add it as a module
						
							
							do_unload(['image_to_text']); // unload everything except image_to_text
							
							if(typeof window.task_queue[t].image_blob != 'undefined' && live_image_to_text_thumbnail_container){
								const image_to_text_thumbnail = document.createElement("img");
								image_to_text_thumbnail.classList.add('image-to-text-thumbnail');
								const url = URL.createObjectURL(window.task_queue[t].image_blob);

								image_to_text_thumbnail.onload = () => {
									// no longer need to read the blob so it's revoked
									URL.revokeObjectURL(url);
								};

								image_to_text_thumbnail.src = url;
								live_image_to_text_thumbnail_container.innerHTML = '';
								live_image_to_text_thumbnail_container.appendChild(image_to_text_thumbnail);
							}
							
							
							try{
								
								window.add_chat_message('image_to_text','image_to_text',"download_progress#setting---");
								//let response = await window.do_image_to_text(window.task_queue[t]);
								window.do_image_to_text(window.task_queue[t]);
								//console.log("interval: do_image_to_text: response: ", response);
								/*
								if(typeof window.task_queue[t] != 'undefined' && typeof window.task_queue[t]['image_blob'] != 'undefined'){
									//console.log("removing image blob from image_to_text task that was sent to worker");
									delete window.task_queue[t]['image_blob'];
								}
								*/
								
								
							}
							catch (err) {
								console.error("interval: do_image_to_text: caught error: ", err);
							
								console.warn("interval: IMAGE TO TEXT TASK FAILED: ", JSON.stringify(window.task_queue[t],null,4));
								//window.task_queue[t].state = 'failed'; // TODO: a bit harsh, could/should just be delayed until later?
							
								await window.handle_completed_task(window.task_queue[t],null,{'state':'failed'});
								window.clean_up_dead_task(window.task_queue[t]);
								window.image_to_text_worker_busy = false;
								
								return null
							
							}
							
						}
						catch (err) {
							console.error("caught error loading image_to_text module script: ", err);
						}
							
						
						window.task_started = 10;
					}
				}
		
		
		
				if(only_small_models == false && window.rag_worker_busy == false && window.image_to_text_worker_busy == false){
					//console.log("interval: rag_worker is not busy.  window.task_queue[t].state:", window.task_queue[t].state);
					
					
					if(window.task_queue[t].state == 'should_rag' && typeof window.do_rag == 'function'){ // || is_task_relevant(window.task_queue[t], 'mp3') == true){
						//console.log("interval: starting RAG task");
					
						window.task_queue[t].state = 'doing_rag';
						//window.rag_worker_busy = true;
						//window.translation_worker_busy = true;
						if(window.task_queue[t] != null && typeof window.task_queue[t].type == 'string'){
							window.current_tasks[window.task_queue[t].type] = window.task_queue[t];
						}
						
						add_body_class('doing-rag');
						window.do_rag(window.task_queue[t])
						.then((value) => {
							//console.log("main: interval: do_rag was resolved.  value: ", value);
							//console.log("setting rag task state to completed: ", window.task_queue[t]);
							window.task_queue[t].state = 'completed';
							/*
							try{
								if(value && typeof value.task != 'undefined' ){ // && typeof value.rag != 'undefined'
									//console.log("main: interval: do_rag resolved a task: ", value);
									let full_rag = '';
								
									if(value && Array.isArray(value.hits)){
										
										
										await window.handle_completed_task(value.task, true);
										//return
									}
									else{
										console.error("main: interval: resolved rag search hits was not an array? ", value);
									}
							
								}
							}
							catch(e){
								console.error("main: interval: caught error after do_rag .then: ", err);
							}
							*/				
							window.rag_worker_busy = false;
							remove_body_class('doing-rag');
						
						
						})
						.catch((err) => {
							console.error("main: interval: do_rag was rejected. err: ", err);
							window.task_queue[t].state = 'failed';
							window.rag_worker_busy = false;
							remove_body_class('doing-rag');
							flash_message(get_translation('Document_search_failed'),3000,'fail');
							
						})
						/*
						if(window.do_translation(window.task_queue[t])){
							//console.log("interval: successfully passed task to do_translation: ", window.task_queue[t]);
						}
						else{
							console.warn("interval: FAILED TO GET THE TRANSLATION STARTED: ", JSON.stringify(window.task_queue[t],null,4));
							window.task_queue[t].state = 'failed'; // TODO: a bit harsh, could/should just be delayed until later?
						}
					
						*/
						window.task_started = 10;
					}
						
				
				}
			
			
			
				
		
		
		
		
				//
				//  MUSIC GEN
				//
			
				if(only_small_models == false && window.musicgen_worker_busy == false){
			
					//console.log("__OK musicgen_worker is not busy. next: state: ", window.task_queue[t].state)
					if(window.task_queue[t].state == 'should_musicgen'){ // || is_task_relevant(window.task_queue[t], 'mp3') == true){
						
						if(typeof window.do_musicgen != 'undefined'){
							
							//console.log("interval: setting task state to doing_musicgen");
							window.task_queue[t].state = 'doing_musicgen';
							window.task_started = 10;
							window.current_task = window.task_queue[t];
							if(window.task_queue[t] != null && typeof window.task_queue[t].type == 'string'){
								window.current_tasks[window.task_queue[t].type] = window.task_queue[t];
							}
							window.update_task_overview();
							
							const musicgen_task = window.task_queue[t];
							
							// Why use promise worker for musicgen? It runs for such a long time
							try{
								const value = await window.do_musicgen(window.task_queue[t])
							
								//console.log("main: interval: do_musicgen was resolved.  value: ", value);
								if(typeof value.task != 'undefined' && typeof value.big_audio_array != 'undefined'){
									//console.log("main: interval: do_musicgen resolved a task and musicgen");
									await window.handle_completed_task(musicgen_task,true);
								}
								window.musicgen_worker_busy = false;
							}
							catch (err) {
								console.error("main: do_musicgen was rejected. err: ", err);
								window.task_queue[t].state = 'failed';
								window.musicgen_worker_busy = false;
								await window.handle_completed_task(musicgen_task,false,{'state':'failed'});
								window.clean_up_dead_task(musicgen_task);
							}
						}
						else{
							console.error("interval: window.do_musicgen is missing. Module didn't load?");
						}
					
					}
				}
		
			
			
				
				
				if(window.busy_doing_blueprint_task == false){
					if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == 'blueprint' && window.task_queue[t].state != 'parent' && window.irrelevant_task_states.indexOf(window.task_queue[t].state) == -1){
						//console.log("Not busy doing blueprint, and spotted task with blueprint origin that is not done yet: ", window.task_queue[t]);
					
						if(window.task_queue[t].type == 'blueprint' && window.task_queue[t].state == 'should_blueprint'){
						
							if(typeof window.task_queue[t].transcript == 'string'){
								//console.log("interval: passing blueprint task to handle_task_complete");
								window.busy_doing_blueprint_task = true;
								add_body_class('doing-blueprint');
								handle_completed_task(window.task_queue[t],window.task_queue[t].transcript); // here it will be interpreted as an STT task
							}
							else{
								console.error("interval: blueprint task without transcript");
							}
							window.task_started = 10;
						}
						
					}
				}
			}
			
			if(window.task_started == true){
				
				// TODO: should centralize adding the task here:
				
				if(window.task_queue[t] != null && typeof window.task_queue[t].type == 'string'){
					window.current_tasks[window.task_queue[t].type] = window.task_queue[t];
					generate_running_tasks_overview();
					update_interrupt_button_icon(window.task_queue[t]);
				}
				
				if(typeof window.task_queue[t].assistant == 'string'){
					//console.log("interval: setting window.currently_running_llm to: ", window.task_queue[t].assistant);
					window.currently_running_llm = window.task_queue[t].assistant;
				}
				else{
					console.error("interval: started a task without an assistant");
					window.currently_running_llm = null; // starting a task without an assistant? Does that happen?
				}
				set_idle(false);
				//window.update_interrupt_button_icon(window.task_queue[t]);
				
				
			}
			
		}
		
		

		if(play_document_task_index != null){
			//console.log("interval: current play_document_task_index: ", play_document_task_index);
		}

		if(window.task_started == true){
			window.update_task_overview();
		}
		else if(something_left_to_do == false && window.idle == false){
			console.warn("seemingly nothing left to do, but window.idle was false");
			window.set_idle(true);
		}


	}
	catch(err){
		console.error("caught error in interval: ", err);
	}
	previous_interval_done = true;
}








// find out which Javascript project is supposed to run the model
// TODO: it should output null by default, instead of 'llama_cpp'; 
function get_task_runner(task){
	//console.log("in get_task_runner. task: ", task);
	
	let runner = 'llama_cpp';
	
	if(typeof task == 'undefined' || task == null){
		console.error("get_task_runner: no valid task provided. falling back to checking if window.settings.assistant is in web_llm list");
		if(typeof window.settings.assistant == 'string' && window.assistants[window.settings.assistant] != 'undefined' && window.assistants[window.settings.assistant] != null && typeof window.assistants[window.settings.assistant].runner == 'string'){
			runner = window.assistants[window.settings.assistant].runner;
			//console.log("get_task_runner: found runner in assistants dictionary: ", runner);
		}
		else{
			//console.log("get_task_runner: no task provided, and no runner defined in assistants dictionary. Default of llama_cpp is probably correct");
		}
	}
	else if(typeof task.assistant == 'string'){
		
		if(typeof window.settings.assistants[task.assistant] != 'undefined' && window.settings.assistants[task.assistant] != null && typeof window.settings.assistants[task.assistant].runner == 'string'){
			runner = window.settings.assistants[task.assistant].runner;
		}
		else if(typeof window.assistants[task.assistant] != 'undefined' && window.assistants[task.assistant] != null && typeof window.assistants[task.assistant].runner == 'string'){
			runner = window.assistants[task.assistant].runner;
		}
		
		//console.log("get_task_runner: found runner in task: ", runner);
	}
	else{
		//console.error("get_task_runner: task provided, but had no runner info. Forced to fall back to returning default runner: llama_cpp");
	}
	
	return runner
}



// disposes of the big AI's - translation worker, tts worker, OCR, and even whisper are unaffected
// TODO also stop whisper if there are no stt tasks remaining?
window.do_unload = function (runners_to_keep){
	//console.log("\n\nDO_UNLOAD\n\n");
	if(window.settings.settings_complexity == 'developer'){
		console.warn("dev: in do_unload. runners_to_keep: ", runners_to_keep);
	}
	
	//console.log("do_unload: START: window.currently_loaded_assistant: ", window.currently_loaded_assistant);
	if(typeof runners_to_keep == 'undefined' || runners_to_keep == null){
		console.error("do_unload: no runners_to_keep list provided -> unloading everything");
		runners_to_keep = [];
	}
	if(!Array.isArray(runners_to_keep)){
		console.error("do_unload: runners_to_keep list was not an array");
		return false
	}
	
	if(runners_to_keep.length == 0){
		message_downloads_container_el.innerHTML = '';
	}
	
	//if(runners_to_keep.indexOf(window.currently_loaded_assistant) == -1){}
	
	if(runners_to_keep.indexOf('image_to_text') == -1){
		if(window.real_image_to_text_worker){
			//console.log("do_unload: calling stop_image_to_text");
			window.stop_image_to_text();
			
			setTimeout(() => {
				if(window.real_image_to_text_worker){
					//console.log("do_unload: stopping image_to_text worker harshly by terminating worker");
					window.real_image_to_text_worker.terminate();
					window.real_image_to_text_worker = null;
					window.diffusion_worker_busy = false;
					window.diffusion_worker_loaded = false;
				}
				else{
					//console.log("do_unload: image_to_text worker stopped cleanly");
				}
				//window.image_to_text_worker = null;
				
			},2000);
			
		}
		if(window.currently_loaded_assistant == 'image_to_text'){
			window.currently_loaded_assistant = null;
		}
	}
	
	if(runners_to_keep.indexOf('imager') == -1){
		if(window.diffusion_worker){
			window.stop_imager();
			
			setTimeout(() => {
				if(window.diffusion_worker){
					//console.log("do_unload: stopping imager worker harshly by terminating worker");
					window.diffusion_worker.terminate();
					window.diffusion_worker_busy = false;
					window.diffusion_worker_loaded = false;
				}
				else{
					//console.log("do_unload: imager worker stopped cleanly");
				}
				
			},2000);
			
		}
		if(window.currently_loaded_assistant == 'imager'){
			window.currently_loaded_assistant = null;
		}
	}
	
	if(runners_to_keep.indexOf('text_to_image') == -1){
		if(window.real_text_to_image_worker){
			window.stop_text_to_image_worker();
		}
		if(window.currently_loaded_assistant == 'imager'){
			window.currently_loaded_assistant = null;
		}
	}
	
	
	if(runners_to_keep.indexOf('musicgen') == -1){
		if(window.real_musicgen_worker){
			//console.log("window.real_musicgen_worker: ", window.real_musicgen_worker);
			window.stop_musicgen();
			setTimeout(() => {
				if(window.real_musicgen_worker != null){
					window.real_musicgen_worker.terminate();
					window.real_musicgen_worker = null;
				}
			},30);
			
			window.musicgen_worker = null;
			window.real_musicgen_worker = null;
			window.musicgen_loaded == false;
			window.busy_loading_musicgen == false;
			if(window.currently_loaded_assistant == 'musicgen'){
				window.currently_loaded_assistant = null;
			}
		}
		if(window.currently_loaded_assistant == 'musicgen'){
			window.currently_loaded_assistant = null;
		}
	}
	if(runners_to_keep.indexOf('llama_cpp') == -1){
		//if(window.llama_cpp_app && window.llama_cpp_app.worker){
			//window.llama_cpp_app.worker.terminate();
		if(window.llama_cpp_app){
			window.stop_llama_cpp();
			//window.currently_loaded_assistant = null;
			
		}
	}
	if(runners_to_keep.indexOf('web_llm') == -1){
		//console.log("typeof window.unload_web_llm: ", window.unload_web_llm);
		if(typeof window.unload_web_llm == 'function'){
			window.unload_web_llm();
		}
		else{
			console.error("window.unload_web_llm() was missing?");
		}
		
		window.web_llm_busy = false;
		if(typeof window.currently_loaded_assistant == 'string' && typeof window.assistants[window.currently_loaded_assistant] != 'undefined' && typeof window.assistants[window.currently_loaded_assistant].runner == 'string' && window.assistants[window.currently_loaded_assistant].runner == 'web_llm'){
			window.currently_loaded_assistant = null;
		}
		window.currently_loaded_web_llm_assistant = null;
	}
	
	if(runners_to_keep.length == 0){
		remove_body_class('model-loaded');
	}
	
	
	// TODO: translation? whisper? They can get quite big
	
	
	
	
	//console.log("do_unload: END: window.currently_loaded_assistant: ", window.currently_loaded_assistant);
	return true
}  



	
window.start_assistant = async function (task=null){  // async 
	//console.log("in start_assistant. Task: ", task);
	
	//const runners_to_unload = ['musicgen','imager','web_llm','llama_cpp'];
	
	if(typeof task == 'undefined' || task == null){
		console.error("start_assistant: invalid task provided: ", task);
		return false
	}
	if(typeof task.assistant != 'string'){
		console.error("start_assistant: task does not have an assistant property, cannot start assistant");
		return false
	}
	
	window.update_interrupt_button_icon(task);
	
	// TODO: This doesn't seem to be used. Musicgen is started directly from the interval.
	if(task.assistant == 'musicgen'){
		
		do_unload(['musicgen']); // unload all AI's except for musicgen
		
		if(window.musicgen_worker == null && window.musicgen_script_loaded == false){
			
			//console.log("start_assistant: Starting musicgen worker");
			window.add_script('./musicgen_module.js')
			.then((value) => {
				window.musicgen_script_loaded = true;
				window.update_task_overview();
				
				window.current_task = task;
				
				// TODO: And then.. nothing? Is this just to preload?
				
			})
			.catch((err) => {
				console.error("start_assistant: caught error adding musicgen_module.js: ", err);
			})
		}
		else{
			//console.log("start_assistant: musicgen worker already exists");
		}
		return true
	}
	
	else if(task.assistant == 'imager'){
		
		do_unload(['imager']); // unload all AI's except for imager
		
		if(window.diffusion_worker == null){
			// console.log("start_assistant: Starting imager worker");
			// create diffusion worker
			window.current_task = task;
			window.do_diffusion(task);
			window.update_task_overview();
			
			//window.create_diffusion_worker(task); // task is currently not used
			//add_body_class('model-loaded');
		}
		else{
			//console.log("start_assistant: imager worker already exists");
		}
		return true
	}
	
	
	
	if(task == null){
		console.error("window.start_assistant: provided task was null");
		return false
		
	}
	
	if(typeof window.assistants[task.assistant] != 'undefined' && typeof window.assistants[task.assistant]['do_not_load'] == 'boolean' && window.assistants[window.settings.assistant]['do_not_load'] == true){
		//console.log("start_assistant: aborting, as the assistant has do_not_load flag: ", window.settings.assistant); // this generally means it's not a text generation model, but a special one that works with media (audio, pictures, etc)
		return false
	} 
	
	
	let runner = get_task_runner(task);
	//console.log("window.start_assistant:  runner: ", runner);
	
	if(window[runner + '_busy'] == true){
		console.error("start_assistant: error, aborting, runner was already busy: ", runner);
		return false
	}
	
	
	// TODO: HACK: some Bitnet models need a little '<s>' before their prompt
	if(
		typeof task.assistant == 'string' 
		&& (task.assistant == 'bitnet1' ||  task.assistant == 'bitnet2')
		&& typeof task.prompt == 'string' 
		&& !task.prompt.startsWith('<s>')
	){
		console.warn("hacky: had to add <s> before the bitnet prompt");
		task.prompt = '<s>' + task.prompt;
	}
	
	
	// unload unneeded LLM's
	
	
	if(runner == 'web_llm' && typeof window.web_llm_model_being_loaded == 'string'){
		if(task.assistant != window.web_llm_model_being_loaded){
			console.error("web_llm is loading a model, but it's not the model that this start_assistant call wants to load.  window.web_llm_model_being_loaded, task.assistant: ", window.web_llm_model_being_loaded, task.assistant);
		}
		do_unload([runner]);
	}
	else if(runner == 'web_llm' && (window.currently_loaded_web_llm_assistant == null || (typeof window.currently_loaded_web_llm_assistant == 'string' && typeof task.assistant == 'string' && window.currently_loaded_web_llm_assistant != task.assistant))){
		console.warn("start_assistant: web_llm assistant not loaded yet, or wrong model loaded.  window.currently_loaded_web_llm_assistant,task.assistant: ", window.currently_loaded_web_llm_assistant, task.assistant);
		console.error("start_assistant: UNLOADING EVERYTHING");
		//window.unload_web_llm();
		do_unload([]); // unloads all the big runners
	}
	
	else{
		//console.warn("start_assistant: unloading everything except: " + runner);
		do_unload([runner]);
	}
	/*
	if(runner == 'web_llm'){
		if(window.diffusion_worker){
			window.diffusion_worker.terminate();
		}
		if(window.llama_cpp_app && window.llama_cpp_app.worker){
			window.llama_cpp_app.worker.terminate();
		}
	}
	else if(runner == 'llama_cpp'){
		if(window.diffusion_worker){
			window.diffusion_worker.terminate();
		}
		if(window.currently_loaded_web_llm_assistant != null){
			window.unload_web_llm();
		}
	}
	*/
	
	
	if(typeof task.type == 'string'){
		
		if(task.type == 'proofread'){
			//highlight_selection_from_task(task,' '); // split highlights on spaces
		}
		
	}
	
	
	
	try{
		
		//console.log("start_assistant: calling do_" + runner); // do_web_llm or do_llama_cpp
		
		if(runner == 'ollama' && typeof window.do_ollama == 'undefined'){
			console.error("start_assistant: window.do_ollama was still undefined");
			return false;
		}
		if(runner == 'ollama' && window.ollama_busy == true){
			console.error("start_assistant: almost started another ollama task");
			return false;
		}
		
		// preloader, as the task has only one property (assistant)		
		//console.log("start_assistant: runner: ", runner);
		
		let started = null;
		if(runner == 'web_llm'){
			started = window.do_web_llm(task);
		}
		else if(runner == 'llama_cpp'){
			started = window.do_llama_cpp(task);
		}
		
		if(started){
			task.in_progress = true;
			//console.log("start_assistant: assistant seems to have started successfully. runner,task.index,task: ", runner, task.index, task);
			if(runner == 'ollama'){
				//console.log("window.ollama_busy? ", window.ollama_busy);
			}
			
			window.current_task = task;
			if(typeof task.type == 'string' && task.type.length){
				window.current_tasks[task.type] = task;
			}
			//add_body_class('doing-assistant');
			
			
			//console.log("window.current_task is now: ", window.current_task);
			if(['rewrite','proofread','summarize','translation','continue'].indexOf(task.type) != -1){
				add_body_class('doing-' + task.type); // e.g. 'doing-rewrite','doing-proofread','doing-summarize','doing-translation','doing-continue'
				
				if(
					typeof task.selection != 'undefined' 
					&& typeof task.selection.from == 'number' 
					&& typeof task.selection.to == 'number' 
					&& typeof task.selection.from != typeof task.selection.to 
					&& typeof task.file != 'undefined' 
					&& task.file != null 
					&& typeof task.file.filename == 'string' 
					&& task.file.filename == current_file_name 
					&& typeof task.file.folder == 'string' 
					&& task.file.folder == folder 
					&& typeof task.type == 'string' 
					&& typeof task.destination == 'string' 
					&& task.destination == 'document'
				
				){
					//console.log("start_assistant: also tryng to highlight the selection") // SUPERFLUOUS, this also happens in the interval. It's more centralised here though, so this might be preferable
					if(typeof remove_highlight_selection == 'function'){
						remove_highlight_selection();
						highlight_selection(task.selection);
					}
					
					add_body_class('working-on-doc');
				}
			}
			
			window.update_task_overview();
			return true;
		}
		else{
			console.error('start_assistant: ERROR, Failed to start assistant. Runner: ', runner);
			
			setTimeout(() => {
				window.handle_completed_task(task,false,{'state':'failed'});
			},10)
			
		}
		return started;
		
	}
	catch(e){
		console.error("start_assistant: caught error trying to start assistant.  runner,error: ", runner, e);
		await window.handle_completed_task(task,false,{'state':'failed'});
		window.clean_up_dead_task(task);
		window.current_task = null;
	}
	
	console.error("start_assistant fell through. task: \n", JSON.stringify(task.null,4));
	
	await window.handle_completed_task(task,false,{'state':'failed'});
	window.clean_up_dead_task(task);
	window.current_task = null;
	
	return false
}




// This should really be called "interrupt assistant" instead
window.stop_assistant = async function (task=null,called_from_automation=null){ 
	//console.log("in stop_assistant.   window.currently_running_llm, task, window.current_task: ", window.currently_running_llm, task, window.current_task);
	
	let assistant_id = null;
	
	if(task == null){
		if(window.current_task != null){
			console.warn("stop_assistant: no task provided, falling back to using window.current_task: ", window.current_task);
			task = window.current_task;
		}
		else{
			console.error("stop_assistant: no task provided, and could not fall back to window.current_task as it was null");
		}
	}
	
	if(task != null){
		if(typeof task.rag_index == 'number'){
			let rag_answer_el = document.getElementById('rag-search-result-answer' + task.rag_index);
			if(rag_answer_el){
				rag_answer_el.innerHTML = '😵‍💫';
			}
		}
		if(typeof task.assistant == 'string'){
			assistant_id = task.assistant;
		}
		
		if(called_from_automation == null && typeof task.origin == 'string' && task.origin == 'blueprint'){
			called_from_automation = true;
		}
	}
	
	if(assistant_id == null && typeof window.currently_loaded_assistant == 'string'){
		console.warn("stop_assistant: assistant_id was still null, falling back to window.currently_loaded_assistant: ", window.currently_loaded_assistant);
		assistant_id = window.currently_loaded_assistant;
	}

	
	if(window.currently_running_llm == 'translator'){
		console.error("stop_assistant: translator seemed to be running");
		if(window.translation_worker_busy && window.real_translation_worker != null){
			window.interrupt_translation();
		}
	}
	
	if(assistant_id == 'imager'){
		//console.log("stop_assistant: stopping imager.  window.diffusion_worker: ", window.diffusion_worker);
		if(window.diffusion_worker){
			
			window.interrupt_imager();
			setTimeout(() => {
				window.diffusion_worker.terminate();
				window.diffusion_worker_busy = false;
				//window.diffusion_worker_loaded = false;
			},2000);
			
		}
		let diffusion_progress_el = document.getElementById('diffusion-progress-imager');
		if(diffusion_progress_el){
			diffusion_progress_el.remove();
		}
		window.set_chat_status(task,'');
	}
	
	
	if(assistant_id == 'text_to_image'){
		//console.log("stop_assistant: stopping text_to_image.  window.real_text_to_image_worker: ", window.real_text_to_image_worker);
		if(window.real_text_to_image_worker){
			
			window.interrupt_text_to_image();
			setTimeout(() => {
				if(window.real_text_to_image_worker != null){
					window.real_text_to_image_worker.terminate();
					window.text_to_image_worker_busy = false;
					window.text_to_image_worker_loaded = false;
					window.busy_loading_text_to_image = false;
				}
			},2000);
			
		}
		
	}
	remove_body_class('doing-text-to-image');
	
	
	if(assistant_id == 'musicgen'){
		//console.log("stop_assistant: stopping musicgen");
		if(typeof window.interrupt_musicgen != 'undefined'){
			window.interrupt_musicgen();
			if(window.real_musicgen_worker){
				setTimeout(() => {
					window.real_musicgen_worker.terminate(); // Mobile Safari doesn't clean up terminated workers properly. But then again, Mobile Safari is unlikely to run this model in the first place.
					window.musicgen_worker_busy = false;
					window.musicgen_worker_loaded = false;
				},1000);
			}
		}
		else{
			change_tasks_with_state('doing_musicgen','interrupted');
		}
		if(window.currently_loaded_assistant == 'musicgen'){
			window.currently_loaded_assistant = null;
		}
		//change_tasks_with_state('doing_musicgen','interrupted');
		window.set_chat_status(task,'');
		//return
	}
	
	if(assistant_id == 'image_to_text'){
		//console.log("stop_assistant: stopping image_to_text");
		if(typeof window.interrupt_image_to_text != 'undefined'){
			camera_image_to_text_auto_scan_input_el.checked = false;
			window.continuous_image_to_text_enabled = false;
			window.interrupt_image_to_text();
			
			
			if(window.real_image_to_text_worker){
				setTimeout(() => {
					window.real_image_to_text_worker.terminate(); // Mobile Safari doesn't clean up terminated workers properly. But then again, Mobile Safari is unlikely to run this model in the first place.
					window.image_to_text_worker_busy = false;
					window.image_to_text_worker_loaded = false;
				},1000);
			}
		}
		else{
			change_tasks_with_state('doing_image_to_text','interrupted');
		}
		if(window.currently_loaded_assistant == 'image_to_text'){
			window.currently_loaded_assistant = null;
		}
		//
		window.set_chat_status(task,'');
		//return
	}
	
	
	let runner_to_stop = 'llama_cpp';
	
	if(window.llama_cpp_app == null){
		console.warn("stop_assistant: window.llama_cpp_app was null, so must be web_llm");
		runner_to_stop = 'web_llm';
	}
	
	if(typeof assistant_id == 'string'){
		if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].runner == 'string'){
			runner_to_stop = window.settings.assistants[assistant_id].runner;
		}
		else if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].runner == 'string'){
			runner_to_stop = window.assistants[assistant_id].runner;
		}
	}
	
	console.warn("stop_assistant: runner to stop: ", runner_to_stop);
	
	if(runner_to_stop == 'llama_cpp'){
		console.warn("stop_assistant: calling window.interrupt_llama_cpp");
		//window.stop_llama_cpp();
		window.interrupt_llama_cpp();
		//window.restart_llama_cpp(true); // restart on purpose
	}
	else if(runner_to_stop == 'ollama'){
		
		//console.log("stop_assistant: runner is ollama. window.ollam_abort_controller: ", window.ollam_abort_controller);
		if(window.ollam_abort_controller != null){
			//console.log("calling abort on window.ollam_abort_controller");
			window.ollam_abort_controller.abort();
		}
		// or just call window.interrupt_ollama();
	}
	else if(runner_to_stop == 'transformers_js'){
		//console.log("runner to abort is transformers.js"); //  Aborting these is handled on a per-assistant basis above
	}
	else if(runner_to_stop == 'web_llm'){
		console.warn("stop_assistant: interrupting web_llm");
		window.interrupt_web_llm();
	}
	
	if(typeof task != 'undefined' && task != null){
		console.warn("\n\nSTOP\n\nstop_assistant: stoppping a single task");
		
		if(typeof task.origin == 'string' && task.origin == 'blueprint' && typeof task.index == 'number'){
			
			if( (typeof task.state == 'string' && task.state == 'parent') || typeof task.parent_index == 'undefined'){
				// stopping a parent blueprint task
				await window.handle_completed_task(task,false,{'state':'interrupted'});
				//change_tasks_with_parent_index(task.index); // stop all it's children
				change_tasks_with_parent(task);
				//change_tasks_with_origin('blueprint');
				window.stop_play_document('blueprint');
			}
			else{
				// stop only a single task in the blueprint
				// TODO does interrupting increment the blueprint parent counter
				await window.handle_completed_task(task,false,{'state':'interrupted'});
			}
			
		}
		else if(typeof task.parent_index == 'number'){
			//console.log("stop_assistant: task had a parent_index. setting all tasks with the same parent index, and the parent itself, to interrupted");
		
			if(typeof task.state == 'string' && window.irrelevant_task_states.indexOf(task.state) == -1){
				await window.handle_completed_task(task,false,{'state':'interrupted'});
			}
			if(called_from_automation === false){
				change_tasks_with_parent_index(task.parent_index);
			}
			
			// TODO: shouldn't handle_completed_task be called? It resets a lot of things this solution doesn't. It could handle killing the entire task cluster.
		}
		
		
		if(typeof task.type == 'string'){
			
			if(task.type == 'image_to_text_ocr'){
				window.continuous_ocr_enabled = true;
				camera_ocr_auto_scan_input_el.checked = false;
			}
			
			if(task.type == 'speak'){
				change_tasks_with_type(task.type); // stop all speaking tasks
			}
			
		}
		
		window.set_chat_status(task,'');
		task.state = 'interrupted';
		
	}
	else{
		console.warn("\n\nSTOP\n\nstop_assistant: doing nuclear, stopping everything");
		console.warn("stop_assistant: window.current_task was null, going to stop everything in window.current_tasks: ", window.current_tasks);
		for (let [task_type, cur_task] of Object.entries(window.current_tasks)) {
			console.warn("stopping everything: window.current_tasks -> task_type: ", task_type);
			
			if(document.body.classList.contains('doing-' + task_type)){
				remove_body_class('doing-' + task_type);
			}
			
			if(typeof cur_task.parent_index == 'number'){
				//console.log("stop_assistant: cur_task had a parent_index. setting all tasks with the same parent index, and the parent itself, to interrupted. parent_index: ", cur_task.parent_index);
				
				await window.handle_completed_task({'index':cur_task.parent_index},null,{'state':'interrupted'});
				//change_tasks_with_parent_index(cur_task.parent_index);
				change_tasks_with_parent(task);
				// TODO: shouldn't handle_completed_task be called? It resets a lot of things this solution doesn't. It could handle killing the entire task cluster.
			}
	
	
			if(typeof cur_task.origin == 'string'){
				if(cur_task.origin == 'blueprint'){
					change_tasks_with_origin('blueprint');
					window.busy_doing_blueprint_task = false;
				}
			}
	
	
			if(typeof cur_task.type == 'string'){
		
				if(cur_task.type == 'image_to_text_ocr'){
					window.continuous_ocr_enabled = true;
					camera_ocr_auto_scan_input_el.checked = false;
				}
		
				change_tasks_with_type(cur_task.type);
			}
			
			let doomed_task_state = '' + cur_task.state.replace('doing_','should_');
			if(doomed_task_state != 'parent'){
				change_tasks_with_state(doomed_task_state);
			}
			
			//console.log("killing task with state: ", doomed_task_state);
			//window.current_tasks[window.task_queue[t].type] = window.task_queue[t];
			//change_tasks_with_state('doing_musicgen','interrupted');
			
			await window.handle_completed_task(cur_task,false,{'state':'interrupted'});
			window.clean_up_dead_task(cur_task,'interrupted');
		}
	}
	
	if(window.microphone_enabled){
		window.set_state(LISTENING);
	}
	
	remove_body_class('working-on-doc');
	if(typeof remove_highlight_selection == 'function'){
		remove_highlight_selection();
	}
	window.current_task = null;
	generate_ui();
}



window.clear_assistant = function (assistant_id){
	if(typeof assistant_id != 'string'){
		assistant_id = window.settings.assistant;
	} 
	if(typeof assistant_id == 'string'){
		//console.log("clearing conversation history for: ", assistant_id);
		window.conversations[assistant_id] = [];
		if(assistant_id == window.settings.assistant){
			remove_body_class('has-conversation');
		}
		let pane_el = document.getElementById('pane-content-' + assistant_id + '-chats');
		if(pane_el){
			pane_el.innerHTML = '';
		}
	}
}



function change_tasks_with_parent(task, new_state='interrupted', overwrite_ended_tasks=false){
	//console.log("in change_tasks_with_state.  old_state,new_state,overwrite_ended_tasks: ", old_state, new_state, overwrite_ended_tasks);
	for(let t = 0; t < window.task_queue.length; t++){
		if(window.irrelevant_task_states.indexOf(window.task_queue[t].state) == -1){
			if(typeof window.task_queue[t].parent_index == 'number' && ((typeof task.parent_index == 'number' && window.task_queue[t].parent_index == task.parent) || (typeof task.index == 'number' && window.task_queue[t].parent_index == task.index)) ){
				window.task_queue[t].state = new_state;
				if(typeof window.task_queue[t].in_progress != 'undefined' && (new_state == 'interrupted' || new_state == 'failed')){
					window.task_queue[t].in_progress = false;
				}
			}
		}
	}
}
window.change_tasks_with_parent = change_tasks_with_parent;



function change_tasks_with_parent_index(parent_index=null, new_state='interrupted'){
	//console.log("in change_tasks_with_parent_index.  parent_index,new_state: ", parent_index, new_state);
	if(typeof parent_index != 'number'){
		console.error("change_tasks_with_parent_index: aborting, provided parent_index was not a number: ", parent_index);
		return false
	}
	if(typeof new_state != 'string'){
		console.error("change_tasks_with_parent_index: aborting, new_state was not a string: ", new_state);
		return false
	}
	for(let t = 0; t < window.task_queue.length; t++){
		if(window.irrelevant_task_states.indexOf(window.task_queue[t].state) == -1){
			if(typeof window.task_queue[t].parent_index == 'number' && window.task_queue[t].index == parent_index){
				window.task_queue[t].state = new_state;
			}
			if(typeof window.task_queue[t].index == 'number' && window.task_queue[t].index == parent_index){
				window.task_queue[t].state = new_state;
			}
			if(typeof window.task_queue[t].in_progress != 'undefined' && (new_state == 'interrupted' || new_state == 'failed')){
				window.task_queue[t].in_progress = false;
			}
			
		}
	}
}




function change_tasks_with_state(old_state, new_state='interrupted', overwrite_ended_tasks=false){
	//console.log("in change_tasks_with_state.  old_state,new_state,overwrite_ended_tasks: ", old_state, new_state, overwrite_ended_tasks);
	
	let affected_parents = [];
	
	for(let t = 0; t < window.task_queue.length; t++){
		if(typeof window.task_queue[t].type == 'string' && typeof window.task_queue[t].state == 'string'){
			if(window.task_queue[t].state == old_state){
				if(window.irrelevant_task_states.indexOf(window.task_queue[t].state) != -1){
					if(overwrite_ended_tasks){
						window.task_queue[t].state = new_state;
						affected_parents.push(window.task_queue[t].index);
					}
				}
				else{
					window.task_queue[t].state = new_state;
					affected_parents.push(window.task_queue[t].index);
				}
				
				// Should a parent process also be marked as failed?
				if(typeof window.task_queue[t].parent_index == 'number'){
					if(affected_parents.indexOf(window.task_queue[t].parent_index) == -1){
						//console.log("change_tasks_with_state: adding a parent index to affected_parents list: ", window.task_queue[t].parent_index);
						affected_parents.push(window.task_queue[t].parent_index);
					}
				}
			}
		}
	}
	if(affected_parents.length){
		//console.log("change_tasks_with_state: spotted affected_parents: ", affected_parents);
		for(let t = 0; t < window.task_queue.length; t++){
			if(typeof window.task_queue[t].state == 'string' && window.task_queue[t].state == 'parent' && typeof window.task_queue[t].index == 'number' && affected_parents.indexOf(window.task_queue[t].index) != -1){
				//console.log("change_tasks_with_state: found affected parent task: ", window.task_queue[t]);
				if(window.irrelevant_task_states.indexOf(window.task_queue[t].state) != -1){
					if(overwrite_ended_tasks){
						window.task_queue[t].state = new_state;
					}
				}
				else{
					window.task_queue[t].state = new_state;
				}
			}
			else if(typeof window.task_queue[t].parent_index == 'number' && affected_parents.indexOf(window.task_queue[t].parent_index) != -1){
				//console.log("change_tasks_with_state: found affected sibling task: ", window.task_queue[t]);
				if(window.irrelevant_task_states.indexOf(window.task_queue[t].state) != -1){
					if(overwrite_ended_tasks){
						window.task_queue[t].state = new_state;
					}
				}
				else{
					window.task_queue[t].state = new_state;
				}
			}
			if(typeof window.task_queue[t].in_progress != 'undefined' && (new_state == 'interrupted' || new_state == 'failed')){
				window.task_queue[t].in_progress = false;
			}
		}
	}
}
window.change_tasks_with_state = change_tasks_with_state;




function change_tasks_with_type(type, new_state='interrupted'){
	//console.log("in change_tasks_with_type.  type,new_state: ", type, new_state);
	if(typeof type != 'string' || typeof new_state != 'string'){
		console.error("change_tasks_with_type:  invalid input, should be strings:  type,new_state: ", origin,new_state);
		return false
	}
	for(let t = 0; t < window.task_queue.length; t++){
		//console.log("change_tasks_with_type: window.task_queue[t].type: ", window.task_queue[t].type, " =?= ", type);
		if(typeof window.task_queue[t].state == 'string' && typeof window.task_queue[t].type == 'string' && window.task_queue[t].type == type){
			//console.log("change_tasks_with_type: found one: ", window.task_queue[t]);
			if(window.irrelevant_task_states.indexOf(window.task_queue[t].state) == -1){
				//console.log("change_tasks_with_type:  changing state: " + window.task_queue[t].state + " --> " + new_state);
				window.task_queue[t].state = new_state;
			}
		}
		if(typeof window.task_queue[t].in_progress != 'undefined' && (new_state == 'interrupted' || new_state == 'failed')){
			window.task_queue[t].in_progress = false;
		}
	}
}
window.change_tasks_with_type = change_tasks_with_type;


// Used to interrupt play_document tasks (and maybe blueprints too?)
function change_tasks_with_origin(origin, new_state='interrupted'){
	//console.log("in change_tasks_with_origin.  origin: ", origin,new_state);
	
	if(typeof origin != 'string' || typeof new_state != 'string'){
		console.error("change_tasks_with_origin:  invalid input, should be string:  origin,new_state: ", origin,new_state);
		return false
	}
	for(let t = 0; t < window.task_queue.length; t++){
		if(typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin == origin){
			if(window.irrelevant_task_states.indexOf(window.task_queue[t].state) == -1){
				window.task_queue[t].state = new_state;
			}
		}
		if(typeof window.task_queue[t].in_progress != 'undefined' && (new_state == 'interrupted' || new_state == 'failed')){
			window.task_queue[t].in_progress = false;
		}
	}
}


function pick_optimal_coder_ai(ram_limit=null){
	//console.log("in pick_optimal_coder_ai. ram_limit: ", ram_limit);
	if(ram_limit == null){
		ram_limit = window.ram
	}
	
	if(ram_limit > 4000){
		if(window.web_gpu_supported && (window.internet || (!window.internet && check_if_cached('fast_qwen2_5_coder_7b')))){
			return 'fast_qwen2_5_coder_7b';
		}
		else if(window.web_gpu32_supported && (window.internet || (!window.internet && check_if_cached('fast_qwen2_5_coder_7b_32bit')))){
			return 'fast_qwen2_5_coder_7b_32bit';
		}
		else if(window.internet || (!window.internet && check_if_cached('qwen2_5_coder_7b'))){
			//return 'qwen2_5_coder_7b';
			return 'stable_code';
		}
	}
	else { // if(ram_limit > 6000 || (ram_limit == 0 && window.innerWidth > 1300))
		if(window.web_gpu_supported && (window.internet || (!window.internet && check_if_cached('fast_qwen2_5_coder_1_5b')))){
			return 'fast_qwen2_5_coder_1_5b';
		}
		else if(window.web_gpu32_supported && (window.internet || (!window.internet && check_if_cached('fast_qwen2_5_coder_1_5b_32bit')))){
			return 'fast_qwen2_5_coder_1_5b_32bit';
		}
		else if(window.internet || (!window.internet && check_if_cached('qwen2_5_coder_1_5b'))){
			//return 'qwen2_5_coder_1_5b';
			return 'stable_code';
		}
	}
	
}


function pick_optimal_text_ai(target_language=null,ram_limit=null){
	//console.log("in pick_optimal_text_ai.  target_language, ram_limt: ", target_language, ram_limit);
	
	let optimal_assistant = null;
	let optimal_assistants = [];
	
	if(typeof target_language != 'string'){
		target_language = window.settings.language;
	}
	if(ram_limit == null){
		ram_limit = window.ram
	}
	
	if(window.is_mobile){
		ram_limit = 1500;
	}
	
	
	if(target_language == 'nl'){
		if(ram_limit > 3000){
			return 'fietje3';
		}
		else{
			return 'fietje2';
			/*
			if(window.web_gpu_supported){
				return 'fast_zephyr';
			}
			else if(window.web_gpu32_supported){
				return 'fast_zephyr_32bit';
			}
			else{
				return 'zephyr';
			}
			*/
		}
	}
	
	else if(target_language == 'de'){
		if(ram_limit > 3000){
			return 'german_gemma_2b';
		}
		
	}
	
	else if(target_language == 'es' && ram_limit > 3000){
		return 'phi3_mini_spanish';
	}
	else if(target_language == 'pt' && ram_limit > 3000){
		return 'phi3_mini_portugese';
	}
	else if(target_language == 'fr' && ram_limit > 3000){
		return 'phi3_mini_french';
	}
	else if(target_language == 'it' && ram_limit > 3000){
		return 'phi3_mini_italian';
	}
	else if(target_language != 'en' && ram_limit > 3000){
		
		for (let [assistant, details] of Object.entries(window.assistants)) {
			if(assistant.startsWith('fast_') || assistant.endsWith('_32bit')){
				continue
			}
			if(typeof details.languages != 'undefined' && Array.isArray(details.languages) && details.languages.indexOf(target_language) != -1){
				if(typeof details.runner == 'string' && details.runner == 'web_llm'){
					optimal_assistant = assistant;
					break
				}
				
				optimal_assistants.push({'assistant_id':assistant,'details':details,'fast':fast});
				
			}
			 
		}
		
		if(typeof optimal_assistant == 'string'){
			if(window.web_gpu_supported && typeof window.assistants['fast_' + optimal_assistant] != 'undefined'){
				return 'fast_' + optimal_assistant;
			}
			else if(window.web_gpu32_supported && typeof window.assistants['fast_' + optimal_assistant + '_32bit'] != 'undefined'){
				return 'fast_' + optimal_assistant + '_32bit';
			}
			else{
				return optimal_assistant;
			}
		}
		
	}
	else if(target_language == 'pl'){
		return 'tiny_llama_polish';
	}
	
	else if(["es","it","fr","pt"].indexOf(target_language) != -1){
		if(window.web_gpu_supported){
			return 'fast_zephyr';
		}
		else if(window.web_gpu32_supported){
			return 'fast_zephyr_32bit';
		}
		else{
			return 'zephyr';
		}
	}
	else if(target_language != 'en'){
		console.error("There is no specific AI that speaks this language: ", target_language);
	}
	
	
	if(ram_limit > 10000){
		if( window.web_gpu_supported && (window.internet || (!window.internet && check_if_cached('llama3_8B')) )){
			return 'llama3_8B';
		}
		else if(window.web_gpu32_supported && (window.internet || (!window.internet && check_if_cached('llama3_8B_32bit')) )){
			return 'llama3_8B_32bit';
		}
		else if(!window.internet && check_if_cached('mistral32')){
			return 'mistral32';
		}
	}
	if(ram_limit > 6000){
		
		if(window.web_gpu_supported){
			if(window.settings.assistant == 'fast_phi3_mini' && (window.internet || (!window.internet && check_if_cached('fast_phi3_mini')))){ // Phi 3 is fine, keep using it
				return 'fast_phi3_mini';
			}
			else if(window.internet || (!window.internet && check_if_cached('fast_mistral'))){
				return 'fast_mistral';
			}
		}
		else if(window.web_gpu32_supported){
			if(window.settings.assistant == 'fast_phi3_mini_32bit' && (window.internet || (!window.internet && check_if_cached('fast_phi3_mini_32bit')))){ // Phi 3 is fine, keep using it
				return 'fast_phi3_mini_32bit';
			}
			else if(window.internet || (!window.internet && check_if_cached('fast_mistral_32bit'))){
				return 'fast_mistral';
			}
		}
		else if(window.internet || (!window.internet && check_if_cached('phi3_mini'))){
			return 'phi3_mini';
		}
	}
	if(ram_limit > 3000 || (ram_limit == 0 && window.innerWidth > 1300)){
		if(window.web_gpu_supported && (window.internet || (!window.internet && check_if_cached('fast_phi3_mini')))){
			return 'fast_phi3_mini';
		}
		else if(window.web_gpu32_supported && (window.internet || (!window.internet && check_if_cached('fast_phi3_mini_32bit')))){
			return 'fast_phi3_mini_32bit';
		}
		else if(window.internet || (!window.internet && check_if_cached('fast_phi3_mini_32bit'))){
			return 'phi3_mini';
		}
	}
	if(ram_limit > 1700 || ram_limit == 0){ // UNKNOWN RAM OPTION
		if(window.web_gpu_supported && (window.internet || (!window.internet && check_if_cached('fast_gemma_2_2b')))){
			//return 'fast_incite_chat';
			return 'fast_gemma_2_2b';
		}
		else if(window.web_gpu32_supported && (window.internet || (!window.internet && check_if_cached('fast_gemma_2_2b_32bit')))){
			//return 'fast_incite_chat_32bit';
			return 'fast_gemma_2_2b_32bit';
		}
		else{
			if(ram_limit == 0 && window.innerWidth <= 640 && (window.internet || (!window.internet && check_if_cached('danube_3_500m')))){
				//return 'danube'; // a bit of a gamble that the device with unknown ram size can run Danube.
				return 'danube_3_500m';
			}else if(window.internet || (!window.internet && check_if_cached('gemma_2_2b'))){
				return 'gemma_2_2b'; // even more of a gamble that the device with unknown ram size can run Gemma 2 2B
			}
		}
	}
	else if(ram_limit > 800 && (window.internet || (!window.internet && check_if_cached('fast_tiny_llama')))){
		if(window.web_gpu_supported){
			return 'fast_tiny_llama';
		}
		else if(window.web_gpu32_supported && (window.internet || (!window.internet && check_if_cached('fast_tiny_llama_32bit')))){
			return 'fast_tiny_llama_32bit';
		}
		else if(window.internet || (!window.internet && check_if_cached('tiny_llama'))){
			return 'tiny_llama';
		}
		
	}
	else if(window.internet || (!window.internet && check_if_cached('danube_3_500m'))){
		return 'danube_3_500m';
	}
	
	if(typeof window.settings.last_loaded_text_ai == 'string'){
		return window.settings.last_loaded_text_ai;
	}
	
	flash_message(get_translation('It_seems_the_AI_failed_to_download'),3000,'fail');
	return 'danube_3_500m';
	
}
window.pick_optimal_text_ai = pick_optimal_text_ai;


if(typeof window.settings.last_loaded_text_ai != 'string'){
	window.settings.last_loaded_text_ai = pick_optimal_text_ai();
	//console.log("window.settings.last_loaded_text_ai has been set by pick_optimal_text_ai to initial model: ", window.settings.last_loaded_text_ai);
}







function get_conversation_history(task,add_system_prompt=null){
	//console.log("in get_conversation_history.  task,add_system_prompt:", task, add_system_prompt);
	if(typeof task == 'undefined' || task == null){
		console.error("get_conversation_history: invalid task provided: ", task);
		return [];
	}
	if(typeof task.prompt != 'string'){ 
		console.error("get_conversation_history: task.prompt was not a string.  task: ", task);
		return [];
	}
	if(typeof task.assistant != 'string'){ 
		console.error("get_conversation_history: task.assistant was not a string.  task: ", task);
		return [{"role":"user","content":task.prompt}];
	}
	
	let runner = get_task_runner(task);
	if(typeof runner != 'string'){ 
		console.error("get_conversation_history: could not get runner for task: ", task);
		return [{"role":"user","content":task.prompt}];
	}
	
	let previous_messages = [];
	let assistant_id = task.assistant;
	
	let context_size = 1024;
	
	if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].context_size == 'number' && window.is_mobile == false){
		context_size = window.assistants[assistant_id].context_size;
	}
	
	system_prompt_name = 'system';
	if(add_system_prompt == null){
		if(typeof assistant_id == 'string' && ((typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].no_system_prompt == true) || (typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].no_system_prompt == true))){
			//console.log("assistants dict -> this model should not use a system prompt.   assistant_id:", assistant_id);
			//add_system_prompt = false;
			system_prompt_name = 'user';
		}
		else{
			//add_system_prompt = true;
		}
	}
	
	
	// Keep track of al the words we'll be feeding to the AI, since the context size may limit how much it can handle
	let word_count = task.prompt.split(" ").length;
	//console.log("get_conversation_history: prompt word count: ", word_count);
	
	
	
	// SECOND SENTENCE (a.k.a "welcome message")
	let second_prompt = null
	// Get second prompt from task if it is set
	if(typeof task.second_prompt == 'string'){
		if(task.second_prompt.length > 5){
			second_prompt = task.second_prompt;
		}
	}
	// Get custom second prompt if it is set
	else if(typeof assistant_id == 'string' && typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].second_prompt == 'string'){
		//console.log("get_conversation_history: custom settings contained a second prompt (might be empty string): ", window.settings.assistants[assistant_id].second_prompt);
		if(window.settings.assistants[assistant_id].second_prompt.length > 2){
			second_prompt = window.settings.assistants[assistant_id].second_prompt;
		}
	}
	// Fall back to second prompt in assistants dict if it exists
	else if(typeof assistant_id == 'string' && typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].second_prompt == 'string'){
		//console.log("get_conversation_history: falling back to found second prompt in assistants dict: ", window.settings.assistants[assistant_id].second_prompt);
		if(window.assistants[assistant_id].second_prompt.length > 2){
			second_prompt = window.assistants[assistant_id].second_prompt;
		}
	}
	
	
	
	
	// ADD SYSTEM PROMPT
	let system_prompt = null;
	
	if(add_system_prompt !== false){
		//console.log("get_conversation_history: should add a system prompt. Will look for one.")
		// Get system prompt from task if it is set
		if(typeof task.system_prompt == 'string'){
			//console.log("get_conversation_history: task came with a system prompt");
			if(task.system_promp.length > 10){
				system_prompt = task.system_prompt;
			}
		}
		// Get custom system prompt if it is set
		else if(typeof assistant_id == 'string' && typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].system_prompt == 'string'){
			//console.log("get_conversation_history: custom settings system prompt exists (might be empty string): ", window.settings.assistants[assistant_id].system_prompt);
			if(window.settings.assistants[assistant_id].system_prompt.length > 10){
				system_prompt = window.settings.assistants[assistant_id].system_prompt;
			}
			
		}
		// Fall back to system_prompt in assistants dict if it exists
		else if(typeof assistant_id == 'string' && typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].system_prompt == 'string'){
			//console.log("get_conversation_history: falling back to found system prompt in assistants dict: ", window.assistants[assistant_id].system_prompt);
			if(window.assistants[assistant_id].system_prompt.length > 10){
				system_prompt = window.assistants[assistant_id].system_prompt;
			}
		}
		
		
		if(typeof system_prompt == 'string'){
			word_count += system_prompt.split(" ").length;
			previous_messages.push({
				"role":system_prompt_name,
				"content":system_prompt
			})
			
			if(typeof second_prompt == 'string'){
				word_count += second_prompt.split(" ").length;
				previous_messages.push({
					"role":"assistant",
					"content":second_prompt
				})
			}
			else{
				word_count += 1;
				previous_messages.push({
					"role":"assistant",
					"content":"OK"
				})
			}
		}
	}
	
	
	
	
	
	
	
	/*
	if(add_system_prompt === true && typeof system_prompt == 'string'){
		//console.log("get_conversation_history: model had a system prompt: ", system_prompt);
		word_count += system_prompt.split(" ").length;
		previous_messages.push({
			"role":"system",
			"content":system_prompt
		})
	}
	else if(add_system_prompt === true && typeof system_prompt == 'string'){
		//console.log("get_conversation_history: model had a system prompt: ", system_prompt);
		word_count += system_prompt.split(" ").length;
		previous_messages.push({
			"role":"system",
			"content":system_prompt
		})
	}
	else{
		console.warn("get_conversation_history: not adding system prompt.  add_system_prompt,system_prompt: ", add_system_prompt, system_prompt);
	}
	*/
	//console.log("get_conversation_history: prompt + system_prompt word count: ", word_count);
	
	
	// ADD SECOND PROMPT
	/*
	if(typeof second_prompt == 'string'){
		//console.log("get_conversation_history: model had a second prompt: ", system_prompt);
		word_count += second_prompt.split(" ").length;
		previous_messages.push({
			"role":"assistant",
			"content":system_prompt
		})
	}
	else{
		console.warn("get_conversation_history: not adding system prompt.  add_system_prompt: ", add_system_prompt);
	}
	//console.log("get_conversation_history: prompt + system_prompt + second_prompt  word count: ", word_count);
	*/
	
	
	
	
	
	
	// Previous messages from conversation history
	
	let previous_messages_to_include = 0;
	//let newest_messages_to_skip = null;
	let history_word_count = 0;
	//let conversation_to_keep = 100;
	
	if(typeof assistant_id == 'string' && typeof window.conversations[assistant_id] != 'undefined' && Array.isArray(window.conversations[assistant_id])){
		//console.log("get_conversation_history: conversations: ", window.conversations[assistant_id]);
		
		//newest_messages_to_skip = window.conversations[assistant_id].length;
		
		// count all words in the current chat history first o figure out how many old message we can bring along
		for(let c = window.conversations[assistant_id].length - 1; c >= 0; c--){
			if(typeof window.conversations[assistant_id][c].role == 'string' && typeof window.conversations[assistant_id][c].content == 'string' && typeof window.conversations[assistant_id][c].index == 'undefined'){
				
				if(window.conversations[assistant_id][c].role == 'user' && c < window.conversations[assistant_id].length - 1 && window.conversations[assistant_id][c+1].content == ''){
					// skip user input if the response is empty
					//if(c >= 0){
						//newest_messages_to_skip = c;
					//}
				}
				else if(window.conversations[assistant_id][c].content == ''){
					// skip empty
					//if(c > 0){
						//newest_messages_to_skip = c - 1;
						//console.log("empty assistant response. newest_messages_to_skip set to: ", newest_messages_to_skip);
					//}
					
				}
				else{
					history_word_count += window.conversations[assistant_id][c].content.split(" ").length;
					//console.log("get_conversation_history: conversation history word_count is now: ", c, " => ",word_count);
					//console.log("get_conversation_history: role: ",  window.conversations[assistant_id][c].role);
					// TODO: this is a very imprecise and rough estimation of tokens. WebLLM has a built-in tokenizer which could be used for more precision
					if( ((word_count + history_word_count) * 3) < context_size && window.conversations[assistant_id][c].role == 'user'){
						previous_messages_to_include = c;
						//console.log("get_conversation_history: still within context limit: ", c, word_count, context_size);
					}
					else{
						//console.log("get_conversation_history: over the limit:  word_count*3,context_size: ", (word_count * 3), context_size);
					}
				}
				
				/*
				
				if(context_size < 4100){
					
					
				}
				else { // modern AI models tend to have tokens that are equal to entire words
					if( (word_count * 1.1) < context_size && window.conversations[assistant_id][c].role == 'user'){
						previous_messages_to_include = c;
						//console.log("get_conversation_history: still within context limit: ", c , word_count, context_size);
					}
				}
				*/
			}
		}
		
		// TODO: could attempt to summarize old messages in order to bring some of that context along
		
		//console.log("get_conversation_history: conversation: previous_messages_to_include: ", previous_messages_to_include);
		for(let c = previous_messages_to_include; c < window.conversations[assistant_id].length; c++){ // window.conversations[assistant_id].length - 
			//console.log("get_conversation_history: second c: ", c)
		
			//if(c >= previous_messages_to_include){
				//previous_messages.unshift(window.conversations[assistant_id][c]);
			
			if(c == (window.conversations[assistant_id].length - 1) && window.conversations[assistant_id][c].role == 'user'){
				console.error("get_conversation_history: almost added the last user prompt to previous_messages_to_include: ", window.conversations[assistant_id][c]);
				continue
			}
			
			// TODO: what if the user query is an empty string? Shouldn't happen theoretically..
			
			if(window.conversations[assistant_id][c].role == 'user' && c < window.conversations[assistant_id].length - 1 && window.conversations[assistant_id][c+1].content == ''){
				if(window.settings.settings_complexity == 'developer'){
					console.error("dev: SHOULD SKIP THIS HISTORY DUO (NOW AT USER): ", window.conversations[assistant_id][c], window.conversations[assistant_id][c+1]);
				}
				
				// skip user input if the response is empty
				//if(c >= 0){
					//newest_messages_to_skip = c;
				//}
			}
			else if(window.conversations[assistant_id][c].role == 'assistant' && window.conversations[assistant_id][c].content == ''){
				if(window.settings.settings_complexity == 'developer'){
					console.error("dev: SHOULD SKIP THIS HISTORY: CONTENT WAS EMPTY STRING");
				}
				// skip empty
				//if(c > 0){
					//newest_messages_to_skip = c - 1;
					//console.log("empty assistant response. newest_messages_to_skip set to: ", newest_messages_to_skip);
				//}
				
			}
			else{
				previous_messages.push( window.conversations[assistant_id][c]);
			}
			
			
			//}
		}
		
		
		//console.log("get_conversation_history: PREVIOUS CONVERSATION MESSAGES TO BRING ALONG: ", previous_messages);
		
		let latest_prompt = task.prompt;
		
		
		if(typeof task.type == 'string' && (task.type.indexOf('continue') != -1 || task.type.indexOf('summarize') != -1 || task.type.indexOf('rewrite') != -1)){
			if(previous_messages.length){
				console.error("almost sent previous messages to a continue/summarize/rewrite command: ", JSON.stringify(previous_messages,null,4));
			}
			previous_messages = [];
		}
		
		
		if(typeof task.destination == 'string' && task.destination == 'document'){
			// do not add brevity command to continue tasks
			//previous_messages = [];
		}
		else{
			
			// Be brief
			if(typeof task.brevity == 'boolean' && task.brevity == true){
				latest_prompt += (' ' + get_translation('Write_your_answer_short_and_succinct') + '.');
				latest_prompt += (' ' + get_translation('Just_provide_the_answer_with_no_explanations') + '.');
				//console.log("added brevity command to prompt: ", latest_prompt);
			}
			else{
				//console.log("get_conversation_history: not adding brevity sentence to prompt");
			}
			// Add markdown command
			if(typeof task.markdown == 'boolean' && task.markdown == true){
				latest_prompt += (' ' + get_translation('Format_your_response_in_markdown') + '.');
				//console.log("added markdown command to prompt: ", latest_prompt);
			}
			else{
				//console.log("get_conversation_history: not adding markdown sentence to prompt");
			}
			
			// No explanations
			/*
			if(typeof task.no_explanations == 'boolean' && task.no_explanations == true){
				latest_prompt += (' ' + get_translation('Just_provide_the_answer_with_no_explanations') + '.');
				//console.log("added markdown command to prompt: ", latest_prompt);
			}
			*/
		}
		
		
		
		//console.log("get_conversation_history: latest_prompt, possibly with brevity/markdown: ", latest_prompt);
		//console.log("get_conversation_history: adding latest prompt: ", latest_prompt);
		previous_messages.push({
			"role": "user",
			"content": latest_prompt
		});
		return previous_messages;
		
	}
	else{
		console.warn("get_conversation_history: invalid conversation history: ", assistant_id,  window.conversations[assistant_id]);
		
	}
	
}
window.get_conversation_history = get_conversation_history;


function get_total_prompt(task=null){
	if(typeof task == 'undefined' || task == null){
		console.error("get_total_prompt: invalid task provided: ", task);
		return null
	}
	
	try{
		//console.log("in get_total_prompt. task: ", task);
		
		/*
		if(typeof task.type == 'string' && task.type == 'continue' && typeof task.prompt == 'string' ){
			if(task.prompt.length > 5){
				return task.prompt;
			}
			else{
				console.error("get_total_prompt: prompt was too short: ", task.prompt);
				return null
			}
		}
		*/
		let messages = null;
		
		//if(typeof task.type == 'string' && (task.type == 'proofread' || task.type == 'summarize' || task.type == 'rewrite'
		
		if(typeof task.type == 'string' && task.type == 'chat'){
			//console.log("get_total_prompt: task type is chat");
			messages = get_conversation_history(task); // ,false   // false = do not add system prompt         // web_llm only needs this first part, as it applies the template itself // No, not anymore?
			//messages = get_conversation_history(task); // web_llm only needs this first part, as it applies the template itself // No, not anymore?
		}
		else{
			//console.log("get_total_prompt: task type is NOT chat. Skipping get history and returning only the last user command.");
			messages = [{'role':'user','content':task.prompt}];
		}
		
		let runner = get_task_runner(task);
		if(runner == 'web_llm'){
			//console.log("get_total_prompt: task runner is web_llm, returning the raw history array of messages");
			return messages;
		}
		
		if(typeof task.assistant == 'string' && typeof window.assistants[task.assistant] != 'undefined' && typeof window.assistants[task.assistant].model_type == 'string' && window.assistants[task.assistant].model_type == 'base'){
			//console.log("get_total_prompt: model_type is base, returning prompt without template");
			//messages = [{'role':'user','content':task.prompt}];
			//return task.prompt;
			//return [{'role':'user','content':task.prompt}];
		}
		else if(typeof task.assistant == 'string' && typeof window.settings.assistants[task.assistant] != 'undefined' && typeof window.settings.assistants[task.assistant].model_type == 'string' && window.settings.assistants[task.assistant].model_type == 'base'){
			//console.log("get_total_prompt: model_type is base, returning prompt without template");
			return task.prompt;
			//return [{'role':'user','content':task.prompt}];
		}
		else if(messages){
			//console.log("get_total_prompt:  applying template to messages: ", messages);
			const total_prompt = window.apply_chat_template(task,messages);
			return total_prompt;
		}
		else if(typeof task.prompt == 'string' && task.prompt.length){
			console.error("get_total_prompt: messages was null. Returing raw task.prompt instead: ", task.prompt);
			return '' + task.prompt;
		}
		else{
			console.error("get_total_prompt: fell through. task: ", task);
			return 'error';
		}
		
	}
	catch(err){
		console.error("caught error in get_total_prompt. task, err: ", task, err);
	}
	if(typeof task.prompt == 'string'){
		console.error("returning raw prompt to try and salvage things: ", task.prompt)
		return task.prompt;
	}
	else{
		handle_completed_task(task,false,{'state':'failed'});
		window.clean_up_dead_task(task);
		return null
	}
	
	
}

window.get_total_prompt = get_total_prompt;


function set_idle(idle){
	//console.log("in set_idle: ", idle);
	if(window.settings.settings_complexity == 'developer'){
		//console.log("dev: in set_idle:  \n-idle: ", idle, "\n- stopped_whisper_because_of_low_memory?: ", window.stopped_whisper_because_of_low_memory, "\n- window.doing_low_memory_tts_chat_response: ", window.doing_low_memory_tts_chat_response);
	}
	
	if(window.idle === false && idle === true){
		window.idle = true;
		const classNames = document.body.className.split(' ');
		classNames.forEach(class_name => {
			//console.log("class_name: ", class_name);
			if(class_name.startsWith('doing-')){
				remove_body_class('doing-' + class_name);
			}
		})
		
		if(!document.body.classList.contains('idle')){
			add_body_class('idle');
		}
		if(window.stopped_whisper_because_of_low_memory && window.doing_low_memory_tts_chat_response == false && window.tts_tasks_left == 0 && window.stt_tasks_left == 0 && (window.settings.interrupt_speaking != 'No' || window.audio_files_in_buffer == 0)){
			window.task_started = 10;
			window.stopped_whisper_because_of_low_memory = false;
			
			if(window.settings.settings_complexity == 'developer'){
				//console.log("dev: set_idle: whisper was stopped because of low memory. Restarting it after unloading everything.");
			}
			window.do_unload([]);
			if(window.tts_worker != null && window.tts_worker_busy == false){
				//console.log("also disposing of TTS to give whisper more memory (in 300ms)");
				if(typeof window.dispose_tts == 'function'){
					//console.log("also disposing of TTS to give whisper more memory (now)");
					setTimeout(window.dispose_tts,300);
				}
			}
			// Give everything some time to unload, dispose and settle. Then restart Whisper.
			window.setTimeout(function() {
				window.task_started = 10;
				console.log("delayed 3 seconds: restarting sleeping whisper");
				window.unpauseSimpleVAD();
				//window.microphone_enabled = true;
				//window.stopped_whisper_because_of_low_memory = false;
				window.remove_body_class('microphone-sleeping');
				window.preload_whisper();
				
			},3000);
		}
		
		do_overviews();
	}
	
	window.idle = idle;
	
	if(window.idle == false && document.body.classList.contains('idle')){
		remove_body_class('idle');
	}
}
window.set_idle = set_idle;











// TODO: The following two functions are very similar, and could possibly be combined

// Only starts the camera, does nothing else
function load_and_start_camera(){
	//console.log("in load_and_start_camera");
	return new Promise((resolve, reject) => {
		
		window.add_script('./camera_module.js',true) // add it as a module
		.then(() => {
			window.start_camera()
			.then((start_camera_state) => {
				//console.log("load_and_start_camera: STT: camera should now be started.  start_camera_state: ", start_camera_state);
				//grab_jpeg_frame();
				resolve(start_camera_state);
			})
			.catch((err) => {
				console.error("load_and_start_camera: camera module loaded, but caught error starting the camera: ", err);
				window.camera_streaming = false;
				flash_message(get_translation('Could_not_start_the_camera'),2000,'fail');
				reject(null);
				
			})
		})
		.catch((err) => {
			console.error("load_and_start_camera: caught error loading camera_module script: ", err);
			window.camera_streaming = false;
			reject(null);
		})
	});
}
window.load_and_start_camera = load_and_start_camera;


// IMAGE TO TEXT
window.get_camera_jpeg_blob = function (){
	return new Promise((resolve, reject) => {
		
		function grab_jpeg_frame(){
			if(window.camera_streaming){
				//console.log("get_camera_blob: in theory the camera is streaming, so will attempt to grab an image from the stream");
				
				try{
					video_context.drawImage(video_el, 0, 0, window.camera_width, window.camera_height);
					video_canvas_el.toBlob((blob) => {
						//console.log("get_camera_blob: video_canvas_el: toBlob result: ", blob);
						if(typeof window.settings.assistant == 'string' && window.settings.assistant.startsWith('image_to_text')){
							//console.log("setting window.last_image_to_text_blob");
							window.last_image_to_text_blob = blob;
							window.last_image_to_text_blob_file = null;
							
							const imageUrl = URL.createObjectURL(blob);
							//console.log("setting image_to_text_prompt_image_el.src: ", imageUrl);
							image_to_text_prompt_image_el.src = imageUrl;
							
						}
						resolve(blob);
					}, 'image/jpeg', 0.95);
				}
				catch(err){
					console.error("get_camera_blob: caught error trying to get image from camera stream. setting window.camera_streaming to false");
					window.camera_streaming = false;
					
					// TODO: or restart the stream?
					reject(null);
				}

			}
			else{
				console.error("create_image_to_text_task: could not get any image blob (not provided, and no camera stream). aborting.");
				window.showing_camera_still = false;
				reject(null);
			}
		}
		
		window.add_script('./camera_module.js',true) // add it as a module
		.then(() => {
			
			if(!window.camera_streaming){
				
				//console.log("get_camera_jpeg_blob: have to start the camera first");
				window.start_camera()
				.then((start_camera_state) => {
					//console.log("get_camera_jpeg_blob: camera should now be started.  start_camera_state: ", start_camera_state);
					setTimeout(() => {
						grab_jpeg_frame(); // a little delay to avoid grabbing a black frame
					},1000);
				})
				.catch((err) => {
					console.error("get_camera_jpeg_blob: caught error loading camera_module script or starting the camera: ", err);
					window.camera_streaming = false;
					reject(null);
				})
			}
			else{
				grab_jpeg_frame();
			}
			
		})
		.catch((err) => {
			console.error("caught error loading camera_module script: ", err);
			window.camera_streaming = false;
			
			reject(null);
		})
	})
}




function model_busy(type='big'){
	if(type == 'big' || type == 'any'){
		if(
			window.musicgen_worker_busy
			|| window.ollama_busy
			|| window.web_llm_busy
			|| window.llama_cpp_busy
			|| window.image_to_text_worker_busy
			|| window.text_to_image_worker_busy
			|| window.diffusion_worker_busy
		){
			return true
		}
	}
	// These aren't so much small anymore, but they are still nice to keep running in paralel of possible
	if(type == 'small' || type == 'any'){
		if(
			window.translation_worker_busy // non-opus translation models can now be quite big too..
			|| window.whisper_worker_busy // whisper isn't really small anymore..
			|| window.tts_worker_busy
		){
			return true
		}
	}
	
	return false
}
window.model_busy = model_busy;



const create_image_to_text_task = function (task=null){
	//console.log("in create_image_to_text_task. task: ", task);
	
	if(window.waiting_for_image_to_text){
		console.warn("create_image_to_text_task: NOTE ONLY: still waiting for an image_to_text task to complete (window.waiting_for_image_to_text is true)");
	}
	
	try{
		//console.log("window.image_to_text_counter: ", window.image_to_text_counter);
		let image_to_text_task = {
			"type":"image_to_text",
			"state":"should_image_to_text",
			"origin":"chat", // origin is camera by default. If camera, then the result should be placed in the rewrite column. If chat, then the output is sent to a chat message
			
			"image_to_text_index": 0 + window.image_to_text_counter,
			"system_prompt":null,
			"image_mime_type":'image/jpeg'
		}
		
		window.image_to_text_counter++;
		
		if(task != null && typeof task.prompt == 'string'){
			image_to_text_task['prompt'] = task.prompt;
		}
		
		
		if(typeof task != 'undefined' && typeof task == 'object' && task != null && typeof task.image_blob != 'undefined' && task.image_blob != null){
			//console.log("create_image_to_text_task: a blob has been provided");
			
			
		}
		/*
		else if(window.camera_streaming){
			//console.log("create_image_to_text_task: in theory the camera is streaming, so will attempt to grab an image from the stream");
			
			try{
				video_canvas_el.toBlob((blob) => {
					//console.log("create_image_to_text_task: video_canvas_el: toBlob result: ", blob);
					task['image_blob'] = blob;
					task['image_mime_type'] = 'image/jpeg';
					
					if(window.add_task(image_to_text_task)){
						//console.log("do_continuous_image_to_text: succesfully added new image_to_text task to the queue");
					}
					
					window.image_to_text_counter++;
	
				}, 'image/jpeg', 0.95);
			}
			catch(err){
				console.error("caught error trying to get image from camera stream");
			}
			
		}
		*/
		else{
			console.error("create_image_to_text_task: could not get any image blob (not provided). aborting.");
			return null
		}
		
		if(typeof task != 'undefined' && typeof task == 'object' && task != null){
			//console.log("create_image_to_text_task: overwriting image_to_text_task with data from provided task: ", task); // must be used to override the origin, which is 'camera' by default
			if(typeof task.index == 'number'){
				task = {...task,...image_to_text_task};
				image_to_text_task = task;
				window.waiting_for_image_to_text = true;
			}
			else{
				image_to_text_task = {...image_to_text_task, ...task};
				image_to_text_task = window.add_task(image_to_text_task);
				if(image_to_text_task){
					window.waiting_for_image_to_text = true;
				}
			}
			
		}
		
		if(typeof image_to_text_task.assistant != 'string'){
			image_to_text_task["assistant"] = "image_to_text";
		}
		
		image_to_text_task["state"] = "should_image_to_text";
		if(typeof image_to_text_task.prompt != 'string'){
			image_to_text_task['prompt'] = "Describe this image.";
		}
		
	
		// TODO: if translation is open, use that and q to also translate the result
		// TODO: allow the user to automatically append the result to the end of an open document
		
		if(typeof image_to_text_task.image_blob != 'undefined' && image_to_text_task.image_blob != null){
		
			//TODO: if the current assistant is 'image_to_text', then add a chat message with the blob, and add the image description once it's ready?
		
			if(typeof image_to_text_task.assistant == 'string' && typeof image_to_text_task.prompt == 'string' && typeof image_to_text_task.image_to_text_index == 'number' && image_to_text_task.assistant.startsWith('image_to_text')){
				
				if(typeof image_to_text_task.destination == 'string' && image_to_text_task.destination == 'chat'){
					add_chat_message('image_to_text', 'image_to_text', '', null, '<div id="image-to-text-output' + image_to_text_task.image_to_text_index + '"><div id="image-to-text-output-image-container' + image_to_text_task.image_to_text_index + '" class="image-container-at-top-of-chat-bubble"/></div><div id="image-to-text-result-output' + image_to_text_task.image_to_text_index + '" class="image-to-text-response"><p class="image-to-text-result-original-prompt">' + image_to_text_task.prompt + '</p><div class="center vertical-margin"><div class="spinner"></div></div></div></div>', image_to_text_task.image_to_text_index);
					
					
					const img_container_el = document.querySelector('#image-to-text-output-image-container' + image_to_text_task.image_to_text_index);
					if(img_container_el){
						//console.log("found image element container. Creating image and setting blob-to-url as it's source. ", img_container_el);
				
						let img_el = document.createElement('img');
						img_el.classList.add('image-to-process');
						const imageUrl = URL.createObjectURL(image_to_text_task.image_blob);
						img_el.addEventListener('load', () => {
							//console.log("image from blob has loaded. revoking blob url");
							URL.revokeObjectURL(imageUrl);
						});
						img_container_el.appendChild(img_el);
						img_el.src = imageUrl;
					}
					else{
						console.error("image-to-text-output-image-container did not exist");
					}
				}
				
			}
		
			return image_to_text_task;
		}
		else{
			console.error("create_image_to_text_task: somehow had no blob (must be set to null by task)");
		}
		
	}
	catch(err){
		console.error("caught error in create_image_to_text_task: ", err);
	}
	
	return null
	
}
window.create_image_to_text_task = create_image_to_text_task;



window.character_flourish = async function (task=null){
	//console.log("in character_flourish");
	if(typeof window.settings.assistants == 'undefined'){
		window.settings.assistants = {};
	}
	let assistant_id_keys = keyz(window.settings.assistants);
	let threshold = Date.now() - 60000; // 60 seconds
	for(let c = 0; c < assistant_id_keys.length; c++){
		const assistant_id = assistant_id_keys[c];
		if(typeof window.settings.assistants[assistant_id].character != 'undefined'){
			//console.log("found AI with character setting: ", assistant_id, window.settings.assistants[assistant_id].character);
		}
		if(typeof window.settings.assistants[assistant_id] != 'undefined' && window.settings.assistants[assistant_id].character == true && typeof window.last_time_ai_responded[assistant_id] == 'number' && window.last_time_ai_responded[assistant_id] != 0 && window.last_time_ai_responded[assistant_id] < threshold){
			window.last_time_ai_responded[assistant_id] = 0; // data about when the last interaction occured is kept in a separate dictionary to avoid storing that information
			const flourishes = ['?','hmm','eh','*raises eyebrow*','...','..','*coughs*'];
			const random_flourish = flourishes[Math.floor(Math.random() * flourishes.length)];
			//console.log("random_flourish: ", random_flourish);
			add_chat_message(assistant_id,assistant_id,random_flourish);
		}
	}
}





//
//  PRELOAD AI MODEL
//

//function shard_progress({loaded, total}) {
function shard_progress(task,new_bytes) {
	//console.log("shard_progress: ", Math.round(loaded/total*100)+'%');
	if(typeof task.assistant == 'string'){
		task.downloaded_bytes += new_bytes;
		if(typeof task.expected_bytes == 'number'){
			let promile = Math.floor((task.downloaded_bytes/task.expected_bytes) * 1000);
			if( promile != task.previous_percentage){
				//console.log("SHARD PROGRESS: ANOTHER PROMILE: ", promile);
				task.previous_percentage = promile;
			
				let progress_el = document.querySelector('.message.pane-' + task.assistant + '.download-progress-chat-message progress');
				if(progress_el){
					progress_el.value = promile / 1000;
					
					let now = Date.now();
					if(typeof task.previous_percentage_timestamp == 'number'){
						const delta = now - task.previous_percentage_timestamp;
						//console.log("promile delta: ", delta);
						
						let time_remaining = (1000 - promile) * delta;
						//console.log("promile time_remaining: ", time_remaining);
						time_remaining = time_remaining / 1000;
						//console.log("promile time_remaining 2: ", time_remaining);
						let time_remaining_el = progress_el.parentNode.querySelector('.time-remaining'); // #download-progress-' + window.settings.assistant + ' + 
						if(time_remaining_el != null){
							//console.log("promile: found time remaining element");
							time_remaining_el.innerHTML = window.create_time_remaining_html(time_remaining);
						}
						else{
							console.error("shard_progress: promile, could not find time-remaining element");
						}
						
					}
					task.previous_percentage_timestamp = now;
					
				}
				else{
					add_chat_message(task.assistant,task.assistant,"download_progress#setting---");
				}
			}
		}
	}
}

window.preload_shard = async function (task,shard){ 
	//console.log("in preload_shard. task,shard: ", task,shard);
	shard.downloading = true;
	
	shard.controller = new AbortController();
	const signal = shard.controller.signal;
	
	window.currently_preloading.push(shard);
	//console.log("window.currently_preloading.length: ", window.currently_preloading, window.currently_preloading);
	
	
	fetch(shard.url, {
	    method: 'get',
	    signal: signal,
	})
	.then(function(response) {
		//console.log(`preload_shard: Fetch complete`);
		//console.log("response.clone: ", shard.index, response.clone());
		let response_clone = response.clone();
		const contentLength = response_clone.headers.get('content-length');
		//console.log("contentLength: ", shard.index, contentLength);
		const total = parseInt(contentLength, 10);
		let loaded = 0;
		
		for(let q = 0; q < task.shards.length; q++){
			if(task.shards[q].url == shard.url){
				task.shards[q].total = total;
				localStorage.setItem('preload_recovery_' + task.assistant, JSON.stringify(task.shards));
				break
			}
		}

		const res = new Response(new ReadableStream({
		    async start(controller) {
				//console.log("got readable stream");
				const reader = response_clone.body.getReader();
				for (;;) {
					const {done, value} = await reader.read();
					if (done) break;
					loaded += value.byteLength;
					//console.log("shard_progress: ", shard.index, Math.round(loaded/total*100)+'%');
					//
					//console.log("shard: loaded: ", loaded);
					//shard_progress({loaded, total})
					shard_progress(task,value.byteLength);
				
					controller.enqueue(value);
				}
				//console.log("shard done?", loaded, total);
				
				if (!response.ok) {
					throw new TypeError("preload_shard: bad response status");
					window.update_preload('failed',shard.url);
				}
				else{
					let cache_name = 'webllm/model';
					if(shard.runner == 'web_llm'){
						caches.open("webllm/model").then((cache) => cache.put(shard.url, response)).then(() => {
							for(let q = 0; q < task.shards.length; q++){
								if(task.shards[q].url == shard.url){
									task.shards[q].downloaded = true;
									localStorage.setItem('preload_recovery_' + task.assistant, JSON.stringify(task.shards));
									break
								}
							}
						});
						window.cached_urls2[shard.url] = "webllm/model";
					}
		
					if(window.cached_urls.indexOf(shard.url) == -1){
						window.cached_urls.push(shard.url);
					}
		
		
					task.download_count += 1;
					//console.log("SHARD LOADED? task.download_count: ", shard.index, " -> ", task.download_count, " of ", task.total_shards, ", LOADED BYTES, total: ", loaded, total);
					/*
					if(loaded == 0 && typeof total == 'number' && total > 0){
						//console.log("quick adding total: ", total);
						shard_progress(task,total);
					}
					*/
		
					window.update_preload(task,'downloaded',shard.url);
					if(task.download_count == task.total_shards){
						//console.log("all shards have loaded");
						await window.handle_completed_task(task,true,{'state':'completed'});
						localStorage.removeItem('preload_recovery_' + task.assistant);
					}
					else if(task.download_count + task.download_failures == task.total_shards){
						//console.log("some shards failed to load: ", task.download_failures);
						await window.handle_completed_task(task,false,{'state':'failed'});
					}
				}
				
				controller.close();
			},
		}));
	
	}).catch(function(err) {
		console.error(`preload_shard: caught error: ${err}`);
		window.update_preload(task,'failed',shard.url);
	})
	

}


window.update_preload = async function (task,action,filename){ 
	//console.log("in update_preload. action,filename: ", action,filename);
	if(typeof action != 'string' || typeof filename != 'string'){
		console.error("update_preload: invalid input. action,filename: ", action,filename);
	}
	for(let x = window.currently_preloading.length - 1; x >= 0 ; --x){
	
		if(action == 'abort_all'){
			window.currently_preloading[x].controller.abort();
		}
		if(window.currently_preloading[x].url.indexOf(filename) != -1){
			//console.log("update_preload: updating for: ", window.currently_preloading[x].url, filename);
			if(action == 'abort'){
				window.currently_preloading[x].controller.abort();
				window.currently_preloading.splice(x,1);
			}
			else if(action == 'downloaded'){
				window.currently_preloading[x].downloaded = true;
				window.currently_preloading[x].downloading = false;
				window.currently_preloading.splice(x,1);
				//console.log("shard downloaded. window.currently_preloading has shrunk to: ", window.currently_preloading.length);
			}
			else if(action == 'failed'){
				if(typeof window.currently_preloading[x].failed != 'number'){
					window.currently_preloading[x].failed = 1;
				}
				else{
					window.currently_preloading[x].failed++;
				}
				if(typeof window.currently_preloading[x].failed == 'number' && window.currently_preloading[x].failed < window.max_preload_attempts){
					window.currently_preloading[x].downloaded = false;
					window.currently_preloading[x].downloading = false;
				}
				else{
					console.error("window.update_preload: too many attempts to download failed: ", window.currently_preloading[x]);
					task.download_failures++;
				}
			}
		}
	}
	if(action == 'abort_all'){
		window.currently_preloading = [];
		window.currently_preloading.length = 0;
	}
	
}


// This gets called by the interval if a WebLLM or Wllama task's model isn't cached yet
window.preload_model = async function (task){ 
	//console.log("in preload_model. task: ", task);
	
	if(typeof task.assistant != 'string'){
		console.error("preload_model: invalid task");
		return false
	}
	
	if(check_if_cached(task.assistant) == false){
		//console.log("preload_model: not yet in cache: ", task.assistant);
		let already_in_preloads = false;
		if(window.currently_preloading.length){
			//console.log("window.currently_preloading.length: ", window.currently_preloading.length);
		}
		
		// Check if a new download task should be added
		// push current shards download queue forward
		for(let t = 0; t < window.task_queue.length; t++){
			if(typeof window.task_queue[t].state == 'string' && window.irrelevant_task_states.indexOf(window.task_queue[t].state) == -1 && typeof window.task_queue[t].type == 'string' && window.task_queue[t].type == 'preload' && typeof window.task_queue[t].assistant == 'string'){
				//console.log("spotted a preload task: ", window.task_queue[t].assistant, window.task_queue[t]);
				if(window.task_queue[t].assistant == task.assistant){
					//console.log("preload_model: already_in_preloads: ", window.task_queue[t].assistant);
					already_in_preloads = true;
				}
				
				if(window.currently_preloading.length < 3 && typeof window.task_queue[t].shards != 'undefined'){
					for(let sh = 0; sh < window.task_queue[t].shards.length; sh++){
						if(window.currently_preloading.length < 3 && window.task_queue[t].shards[sh].downloading == false && window.task_queue[t].shards[sh].downloaded == false){
							window.task_queue[t].shards[sh].downloading = true;
							window.preload_shard(window.task_queue[t],window.task_queue[t].shards[sh]);
						}
					}
				}
			}
		}
		
		
		
		// Add preload task
		if(already_in_preloads == false){
			//console.log("should create preload task (already_in_preloads == false) for: ", task.assistant);
			if( (typeof window.settings.assistants[task.assistant] != 'undefined' && typeof window.settings.assistants[task.assistant].runner == 'string') || (typeof window.assistants[task.assistant] != 'undefined' && typeof window.assistants[task.assistant].runner == 'string')){
			
				//console.log("creating new model preload task for ", task.assistant);
				
				let old_shard_info = localStorage.getItem('preload_recovery_' + task.assistant);
				if(typeof old_shard_info == 'string'){
					recovered_download_shards[task.assistant] = JSON.parse(old_shard_info);
					console.error("recovered old preload data: ", recovered_download_shards[task.assistant]);
					localStorage.removeItem('preload_recovery_' + task.assistant);
				}
				
			
				let runner = get_task_runner(task);
				//console.log("preload_model: runner: ", runner);
				
				let expected_bytes = null;
				if(typeof window.settings.assistants[task.assistant] != 'undefined' && typeof window.settings.assistants[task.assistant].size == 'number' ){
					expected_bytes = Math.round(1024 * 1024 * 1024 * (window.settings.assistants[task.assistant].size * 1.03));
				}
				else if(typeof window.assistants[task.assistant] != 'undefined' && typeof window.assistants[task.assistant].size == 'number' ){
					expected_bytes = Math.round(1024 * 1024 * 1024 * (window.assistants[task.assistant].size * 1.03));
				}
				
				let download_task = {'shards':[],'prompt':get_translation(task.assistant + '_name'),'state':'should_preload','type':'preload','origin':runner,'assistant':task.assistant,'runner':runner,'download_count':0, 'download_failures':0,'downloaded_bytes':0,'expected_bytes':expected_bytes,'previous_percentage':0};
				
				
				// Web LLM
				
				if(runner == 'web_llm'){
					
					let base_url = null;
					
					if(typeof window.settings.assistants[task.assistant].model_file_name == 'string' && window.settings.assistants[task.assistant].model_file_name.indexOf('params_shard_') != -1 && window.settings.assistants[task.assistant].model_file_name.endsWith('.bin')){
						base_url = window.settings.assistants[task.assistant].model_file_name;
					}
					else if(typeof window.assistants[task.assistant].model_file_name == 'string' && window.assistants[task.assistant].model_file_name.indexOf('params_shard_') != -1 && window.assistants[task.assistant].model_file_name.endsWith('.bin')){
						base_url = window.assistants[task.assistant].model_file_name;
					}
					else{
						console.error("preload_model: was unable to find a model_file_name for a WebLLM model");
					}
					//console.log("preload_model: WebLLM base_url: ", base_url);
					
					if(typeof base_url == 'string'){
						//console.log("creating new WebLLM model preload task.  base_url: ", base_url);
						//https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.3-q4f16_1-MLC/resolve/main/params_shard_79.bin 
			
						let there_is_something_to_download = false;
						let param_count = base_url.split('params_shard_')[1];
						param_count = param_count.replace('.bin','');
			
						if(!isNaN(param_count)){
							param_count = parseInt(param_count);
							download_task['total_shards'] = param_count;
							
							base_url = base_url.split('params_shard_')[0];
				
							if(!base_url.startsWith('http') && !base_url.startsWith('/')){
								base_url = 'https://huggingface.co/mlc-ai/' + base_url;
							}
							
							base_url += 'params_shard_';
							//console.log("preload_web_llm: base_url: ", base_url);
				
							for(let s = 0; s <= param_count; s++){
								let shard_url = base_url + s + '.bin';
								
								let skip_it = false;
								if(typeof window.recovered_download_shards[task.assistant] != 'undefined'){
									//console.log("checking shard in recovery data: ", window.recovered_download_shards[task.assistant][s]);
									if(typeof window.recovered_download_shards[task.assistant][s] != 'undefined' && window.recovered_download_shards[task.assistant][s].downloaded == true ){
										//console.log("ALREADY DOWNLOADED THIS SHARD");
										if(typeof window.recovered_download_shards[task.assistant][s].total == 'number'){
											//console.log("found shard info in recovery. already downloaded this one: ", window.recovered_download_shards[task.assistant][s].total);
											download_task.downloaded_bytes += window.recovered_download_shards[task.assistant][s].total;
											//console.error("task.downloaded_bytes: ", download_task.downloaded_bytes);
											skip_it = true;
										}
										else{
											there_is_something_to_download = true;
										}
									}
									else{
										there_is_something_to_download = true;
									}
								}
								else{
									there_is_something_to_download = true;
								}
								
								if(skip_it == false){
									download_task.shards.push({'url':shard_url,'downloading':false,'downloaded':false,'runner':runner,'index':s,'total':0});
								}
								else{
									download_task.shards.push({'url':shard_url,'downloading':false,'downloaded':true,'runner':runner,'index':s});
								}
								
							}
							//console.log("download task initial already downloaded bytes: ", download_task.downloaded_bytes)
							//console.log("Web LLM download_task: ", download_task);
							if(there_is_something_to_download){
								download_task = window.add_task(download_task);
							}
							else{
								console.error("preload_model: there is nothing to actually download? download_task: ", download_task);
							}
							
						}
					}
					else{
						console.error("preload_model: no base_url for this WebLLM model: ", task.assistant. task);
					}
					
				}
			
			
			
			
				// WLLAMA
				
				else if(runner == 'llama_cpp'){
					
					let base_url = null;
				
					if(typeof window.settings.assistants[task.assistant].download_url == 'string' && window.settings.assistants[task.assistant].download_url.endsWith('.gguf')){
						base_url = window.settings.assistants[task.assistant].download_url;
					}
					else if(typeof window.assistants[task.assistant].download_url == 'string' && window.assistants[task.assistant].download_url.endsWith('.gguf')){
						base_url = window.assistants[task.assistant].download_url;
					}
					//console.log("base_url: ", base_url);
				
					if(typeof base_url == 'string' && base_url.endsWith('.gguf')){
						//console.log("creating new Wllama model preload task.  base_url: ", base_url);
				
						if(!base_url.startsWith('http') && !base_url.startsWith('/')){
							base_url = 'https://huggingface.co/' + base_url;
						}
				
						download_task['state'] = 'should_preload';
						download_task['download_url'] = base_url;
					
						// Multiple shards
						if(base_url.indexOf('-00001-of-00') != -1){
							let param_count = base_url.split('-00001-of-00')[1];
							param_count = param_count.replace('.gguf','');
				
							if(!isNaN(param_count)){
								param_count = parseInt(param_count);
								download_task['total_shards'] = param_count;
						
								//base_url = base_url.split('-00001-of-00')[0];
			
								//console.log("preload_web_llm: base_url: ", base_url);
					
								for(let s = 0; s <= param_count; s++){
									let padded_index = '' + s;
									while(padded_index.length < 5){
										padded_index = '0' + padded_index;
									}
									padded_index = '-' + padded_index + '-of-00';
						
									//download_task.shards.push({'url':base_url.replace('-00001-of-00',padded_index),'downloading':false,'downloaded':false,'runner':runner});
								}
								//console.log("Wllama download_task: ", download_task);
								download_task = window.add_task(download_task);
							}
						}
						else{
							//console.log("preload_model: creating unsharded Wllama .gguf file preload task");
							download_task['total_shards'] = 1;
							//download_task.shards.push({'url':base_url,'downloading':false,'downloaded':false,'runner':runner});
							download_task = window.add_task(download_task);
						}
						
						
					
						//console.log("Wllama download_task: ", download_task);
						//window.add_task(download_task);
					}
					
					if(download_task && typeof download_task.index == 'number' && typeof download_task.assistant == 'string' && download_task.assistant.length){
						window.add_chat_message(download_task.assistant,download_task.assistant, "download_progress#setting---");
					}
					
				}
				else{
					console.error("do_preload: get_runner returned unexpected runner: ", runner, task);
				}
				
			}
			else{
				console.error("do_preload: no runner defined? task: ", task);
			}
		}
		
	}
	else{
		console.warn("preload_model: already in cache?");
	}
	
	return true
}


// Only used to pre-download Wllama models in a promise-based fire-and-forget manner
window.do_preload = async function (task){ 
	//console.log("in do_preload.  task: ", task);
	
	if(typeof task == 'undefined' || task == null){
		console.error("do_preload: invalid task provided");
	}
	
	if(typeof task.runner == 'string' && task.runner == 'llama_cpp' && typeof task.download_url == 'string' && task.download_url.endsWith('.gguf')){
		
		try{
			//console.log("calling window.llama_cpp_app.downloadModel");
			let model_settings = {'allow_offline':false};
			model_settings['progressCallback'] = ({ loaded, total }) => {

				//console.log(`do_preload: Wllama: pre-downloading... ${Math.round(loaded/total*100)}%`);
				//console.log("do_preload: Wllama: pre-downloading... percentage, loaded, total: ", Math.round(loaded/total*100) + '%', loaded, total);

				if(total != 0 && loaded > 1000000){
					//console.log("loaded, total: ", loaded, total);
					window.wllama_update_model_download_progress(loaded / total, task.assistant);
				}
			}
		
			await window.llama_cpp_app.downloadModel(task.download_url,model_settings);
			//console.error("do_preload: Wllama window.llama_cpp_app.downloadModel preload complete: ", task.download_url, task);
			await window.handle_completed_task(task,true,{'state':'completed'});
			window.llama_cpp_model_being_loaded = null;
		}
		catch(err){
			console.error("caught error in do_preload: ", err);
			await window.handle_completed_task(task,false,{'state':'failed'});
			window.llama_cpp_model_being_loaded = null;
		}
		
	}

}


if(window.first_run && window.innerWidth > 1500){
	//switch_assistant(window.first_assistant);
	remove_body_class('chat-shrink');
	
}




// TODO: could do this with words instead of sentences
function check_if_text_end_is_repeating(text){
	//console.log("in check_if_text_end_is_repeating. text: ",text);
	if(typeof text != 'string'){
		console.error("check_if_text_end_is_repeating:  provided text was not a string: ", text);
		return true
	}
	
	try{
			
		if(text.endsWith(',,,,,,')){
			return true;
		}
		
		let text_lines = text.split('\n');
		for(let r = 0; r < text_lines.length; r++){
			if(text_lines[r].startsWith('0') && text_lines[r].indexOf(' --> ') != -1){
				// subtitle timestamp line
			}
			else{
				text_lines[r] = text_lines[r].replace(/[0-9]/g, '');
			}
		}
		text = text_lines.join('\n');
		
		// Helper function
		const count_occurence = (array, element) => {
		    let counter = 0;
			if(Array.isArray(array) && typeof element == 'string'){
			    for (let i = 0; i <= array.length; i++) {
			        if (array[i] == element) {
			            counter++;
			        }
			    }
			}
			else{
				console.error("check_if_text_end_is_repeating: array or element invalid. array,element: ", array, element);
			}
		    
			//console.log("check_if_text_end_is_repeating: sentence repetition count: ", counter);
		    return counter;
		};
		
		// A quick 'n dirty test that checks if the end of the text occurs multiple times
		if(text.length > 300){
			if(text.indexOf( text.substr(text.length - 150) ) < (text.length - 200)){
				console.warn("check_if_text_is_repeating: quick test detected repeating of: ", text.substr(text.length - 150));
				return true
			}
		}
		
		
		
		if(text.endsWith('.') || text.endsWith('!') || text.endsWith('?') || text.endsWith('. ') || text.endsWith('! ') || text.endsWith('? ')){
			//text = text.replaceAll('\n',' ');
			const sentences = split_into_sentences(text);
			//console.log("check_if_text_is_repeating:  sentences.length: ", sentences.length);
			if(sentences.length > 7){
		
				let seeing_double = true;
				let sentences_checked = [];
		
				for(let s = sentences.length - 1; s > Math.round(sentences.length/2); s--){
					if(sentences[s].length > 5){
						const occurence = count_occurence(sentences,sentences[s]);
						if(occurence < 2){
							seeing_double = false;
						}
						if(seeing_double){
							if(sentences_checked.indexOf(sentences[s]) != -1 && sentences_checked.length > 2){
								console.warn("The end of the text seems to be repeating itself: ", text);
								return true;
							}
							else if(sentences_checked.indexOf(sentences[s]) == -1){
								sentences_checked.push(sentences[s]);
							}
						}
					}
				}
			}
		}
		
	}
	catch(err){
		console.error("check_if_text_end_is_repeating: caught error: ", err);
	}
	
	return false;
}




// simpler version
function split_into_sentences(text){
	//console.log("in split_into_sentences");
	//return text.replace(/([.?!\"])[\s\n]*(?=[A-Z])/g, "$1|!0|0!|").split("|!0|0!|"); // splits into sentences without removing the punctuation
	//return text.replace(/([?!\n]|[a-zA-Z]\n\n(?=[a-zA-Z])|\:\n|\:\*\*|\.\n|\.\s|^-\s)/gm, "$1|!0|0!|").split("|!0|0!|");
	return text.replace(/([?!\n]|[a-zA-Z]\n\n(?=[a-zA-Z])|[a-zA-Z]\n\n?(?=[\*\-0-9])|\:\n|\:\*\*|\*\*\: |\*\*\:\n|\.\n|\!\n|\?\n|[^0-9]\.\s|^-\s)/gm, "$1|!0|0!|").split("|!0|0!|");
	
}


// ([?!\n]|:\n|\.\n|\.\s|^-\s)
function split_into_sentences_and_punctuation_HMM(text){
	//console.log("in split_into_sentences_and_punctuation");
	//let pre_lines = text.split(/([?!.:\n])/g);
	let pre_lines = text.split(/([?!.\n])/g); // removed :
	//return text.replace(/([?!\n]|:\n|\.\n|\.\s|^-\s)/gm, "$1|!0|0!|").split("|!0|0!|");
	//return text.replace(/([?!\n]|[a-zA-Z]\n\n(?=[a-zA-Z])|:\n|\.\n|\.\s|^-\s)/gm, "$1|!0|0!|").split("|!0|0!|");
}

function split_into_sentences_and_punctuation(text){
	//console.log("in split_into_sentences_and_punctuation");
	//let pre_lines = text.split(/([?!.:\n])/g);
	let pre_lines = text.split(/([?!.\n])/g); // removed :
	//console.log("pre_lines: ", pre_lines);
	if(pre_lines[0] == ''){
		pre_lines.splice(0, 1);
	}
	if(pre_lines[pre_lines.length - 1] == ''){pre_lines.splice(pre_lines.length - 1, 1);}

	for(let x=pre_lines.length-1;x>=0;x--){
		//console.log("x: ",x);
		//console.log("pre_lines[x]: -->" + pre_lines[x] + "<--");
		if(pre_lines[x] == ''){
			//console.log("removing empty item in array");
			pre_lines.splice(x, 1);
		}
		else if(pre_lines[x] == '\n'){
			//console.warn("removing newline item in array");
			pre_lines.splice(x, 1);
			//pre_lines[x] = '--newline--';
		}
	}

	let new_pre_lines = [];
	let unpunctuated_sentence = '';
	//for(let x=pre_lines.length-1;x>=0;x--){
	for(let y=0;y<pre_lines.length;y++){
		//console.log("y: ",y);
		//console.log("pre_lines[y]: -->" + pre_lines[y] + "<--");
		//if(['?','!','.',':'].indexOf(pre_lines[y].trim()) == -1){
		if(['?','!','.'].indexOf(pre_lines[y].trim()) == -1){ // removed :
			unpunctuated_sentence += pre_lines[y];
			if(y==pre_lines.length-1){
				new_pre_lines.push(unpunctuated_sentence);
			}
		}
		else{
			if(unpunctuated_sentence != ''){
				new_pre_lines.push(unpunctuated_sentence);
				new_pre_lines.push(pre_lines[y]);
				unpunctuated_sentence = '';
			}
		}
	}


	pre_lines = new_pre_lines;

	//console.log("split_into_sentences_and_punctuation: pre_lines cleaned: ", pre_lines.length, pre_lines);
	return pre_lines
}



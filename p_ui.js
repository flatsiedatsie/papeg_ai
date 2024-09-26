let simple_tasks_ordering = 'index';





// Option to scroll down in the chat window through JS: this.uiChat.scrollTo(0, this.uiChat.scrollHeight);


	//
	//  ADD CHAT MESSAGE
	//
	
	//window.last_chat_times = {};
	function add_chat_message(pane,participant,message,i18n_code=null,task_output=null,task_index=null){  //,save_to_conversations=false){
		save_to_conversations = false;
		/*
		//console.log("in add_chat_message.");
		//console.log("- pane: ", pane);
		//console.log("- participant: ", participant);
		//console.log("- message: ", message);
		//console.log("- i18n_code: ", i18n_code);
		//console.log("- task_output: ", task_output);
		//console.log("- task_index: ", task_index);
		*/
		//console.log("add_chat_message: message: ", message);
		
		//console.log("add_chat_message: message:  -->" +  message + "<--");
		
		
		
		try{
			/*
			let pane = null;
			if(typeof participant == 'string'){
				pane = participant;
			}
			else if(typeof participant == 'object' && participant != null){
				if(typeof participant.pane == 'string'){
					pane = participant.pane;
				}
				if(typeof participant.participant == 'string'){
					participant = participant.participant;
				}
				else{
					participant = window.settings.assistant;
				}
			}
			*/
			
			if(typeof pane == 'undefined' || pane == null){
				pane = window.settings.assistant;
			}
			if(pane == 'current'){
				//console.log("participant is current");
				pane = window.settings.assistant;
				//console.log("add_chat_message: changed pane from 'current' to: ", pane);
			}
			if(typeof participant == 'undefined' || participant == null){
				participant = window.settings.assistant;
			}
			
			
			let special_task_index_prefix = '';
			if(typeof task_index != 'number' && typeof task_index != 'string'){
				task_index = window.task_counter;
			}
			/*
			else{
				//console.log("setting special_task_index_prefix to: ", pane);
				special_task_index_prefix = '-' + pane;
			}
			*/
			special_task_index_prefix = pane + '-';
		
			// Ignore musicgen preload response message
			if(typeof message == 'string' && message == 'papegai_preload'){
				return;
			}
			
			
			//const original_participant = participant;
			if(typeof message != 'string'){
				console.error("add_chat_message: Error, message was not a string: ", typeof message, message);
				console.error("add_chat_message: pane,participant: ", pane,participant);
				return false
			}
		
			// They can't both be null. Eithe there's a text message, of there's an element/html to place in the output div (which will then be filled in later)
			if(message.trim() == '' && (typeof task_output == 'undefined' || task_output == null || (typeof task_output == 'string' && task_output == ''))){
				console.error("add_chat_message: message was empty string, not adding it.");
				return false
			}
			
			if(participant == 'user' && message.trim() == ''){
				console.error("add_chat_message: user's message was empty, not posting it");
				return false
			}
			
			
			const original_message = message;
			
			const my_message_nr = window.chat_message_counter;
			if(participant == 'current'){
				//console.log("participant is current");
				participant = window.settings.assistant;
				//console.log("add_chat_message: changed participant from 'current' to: ", participant);
			}
			const original_participant = participant;
			//console.log("adding chat message to element ID: ", pane_id);
			
			// chat message container
			let chat_message_el = document.createElement('div');
			chat_message_el.classList.add('message');
			chat_message_el.classList.add('pane-' + participant);
			chat_message_el.setAttribute('data-message-nr', my_message_nr);
			
			// TODO check if assistant has 'chatter' enabled? If so, then there's no need to add an ID.
			if(typeof task_index == 'number' && original_participant != 'developer' && pane != 'developer'){
				const message_el_id = 'chat-message-' + pane + '-' + original_participant + task_index;
				const already_existing_message_el = document.querySelector('#' + message_el_id);
				if(already_existing_message_el){
					console.error("add_chat_message: the chat message seems to already exist!  ID:  #" + message_el_id);
				}
				else{
					chat_message_el.setAttribute('id',message_el_id);
				}
			}
			
		
			let bubble_wrap_el = document.createElement('div');
			bubble_wrap_el.classList.add('chat-bubble-wrap');
			
			let chat_profile_pic_el = document.createElement('div');
			
			let task_output_el = document.createElement('div');
			task_output_el.classList.add('chat-message-task-output');
			
			//if((participant == 'speaker' || participant == 'translator' || participant == 'musicgen' || participant == 'imager') && !message.endsWith('#setting---')){
			//	task_output_el.setAttribute('id','chat-message-task-' + participant + window.task_counter);
			//}
			
			
			if(typeof task_output != 'undefined' && task_output != null){
				task_output_el.setAttribute('id','chat-message-task-' + special_task_index_prefix + participant + task_index);
				//console.log("add_chat_message: task_output was provided: ", task_output);
				if(typeof task_output == 'string'){
					//console.log("add_chat_message: setting provided string as initial task output innerHTML: ", task_output);
					task_output_el.innerHTML = task_output;
				}
				else if(task_output instanceof Element || task_output instanceof HTMLDocument){
					//console.log("add_chat_message: add_chat_message: setting provided element as initial task output child: ", task_output);
					task_output_el.appendChild(task_output);
				}
				else{
					console.error("add_chat_message: invalid task_output value provided, ignoring: ", task_output);
				}
			}
			
			// Chat bubble
			let bubble_el = document.createElement('div');
			bubble_el.classList.add('bubble');
			
			if(original_message.startsWith('_$_')){
				bubble_el.setAttribute('data-i18n',original_message);
			}
			
		
			/*  SPECIAL MESSAGES  */
		
			if(participant != 'user' && message.endsWith('#setting---')){
			
				const special_type = message.split('#')[0];
				//console.log("add_chat_message: spotted special_type: -->" + special_type + "<--");
			
				message = document.createElement('div');
				message.classList.add('chat-setting');
				//message.innerHTML = '<p>' + special_type.replaceAll('_',' ') + '</p>';
				let setting_wrapper_el = document.createElement('div');
				setting_wrapper_el.classList.add('chat-setting-wrapper');
				
				
				if(special_type == 'language'){
					let en_button_el = document.createElement('button');
					en_button_el.textContent = 'English';
					en_button_el.addEventListener("click", (event) => {
						window.settings.language = 'en'; // sic - purposefully not using set_language here, so the UI is generated and then translated
						window.settings['language'] = 'en';
						save_settings();
						generate_ui();
						translate();
						setting_language_dropdown_el.value = 'en';
					});
		
					let nl_button_el = document.createElement('button');
					if(window.settings.language != 'nl'){
						nl_button_el.textContent = 'Dutch';
					}else{
						nl_button_el.textContent = 'Nederlands';
					}
					nl_button_el.addEventListener("click", (event) => {
						window.settings.language = 'nl';  // sic - purposefully not using set_language here, so the UI is generated and then translated
						window.settings['language'] = 'nl';
						save_settings();
						generate_ui();
						translate();
						setting_language_dropdown_el.value = 'nl';
					});
		
					setting_wrapper_el.appendChild(en_button_el);
					setting_wrapper_el.appendChild(nl_button_el);
					setting_wrapper_el.classList.add('text-align-right');
				
				}
				
				else if(special_type == 'scribe_privacy'){
					let medium_button_el = document.createElement('button');
					medium_button_el.textContent = get_translation('Pseudonym');
					medium_button_el.setAttribute('data-i18n','Pseudonym');
					medium_button_el.addEventListener("click", (event) => {
						window.settings.privacy_level = 'Medium';
						window.settings.assistants['scribe'].privacy_level = 'Medium';
						save_settings();
						explanation1_el.classList.add('selected');
						explanation2_el.classList.remove('selected');
						
						if(window.microphone_enabled == false){
							window.enable_microphone();
						}
						
						//generate_ui();
						//setting_privacy_dropdown_el.value = 'en';
					});
		
					let high_button_el = document.createElement('button');
					high_button_el.textContent = get_translation('Redacted');
					high_button_el.setAttribute('data-i18n','Redacted');
					high_button_el.addEventListener("click", (event) => {
						window.settings.privacy_level = 'High';
						window.settings.assistants['scribe'].privacy_level = 'High';
						save_settings();
						explanation1_el.classList.remove('selected');
						explanation2_el.classList.add('selected');
						//generate_ui();
						//setting_privacy_dropdown_el.value = 'nl';
						if(window.microphone_enabled == false){
							window.enable_microphone();
						}
					});
					
					let pre_explanation_title_el = document.createElement('h2');
					pre_explanation_title_el.textContent = get_translation('Privacy');
					pre_explanation_title_el.setAttribute('data-i18n','Privacy');
					
					let pre_explanation_el = document.createElement('p');
					pre_explanation_el.classList.add('small-vertical-margin');
					pre_explanation_title_el.setAttribute('data-i18n','What_should_be_shown_until_a_speaker_has_given_their_consent_to_be_recorded');
					pre_explanation_el.textContent = get_translation('What_should_be_shown_until_a_speaker_has_given_their_consent_to_be_recorded');
					
					
					let explanations_container_el = document.createElement('div');
					explanations_container_el.classList.add("big-chat-bubble-settings-container");
					explanations_container_el.classList.add('flex-wrap');
					
					let explanation1_el = document.createElement('div');
					explanation1_el.classList.add("big-chat-bubble-setting-option");
					// 
					explanation1_el.innerHTML = '<h3 data-i18n="Pseudonym">' + get_translation('Pseudonym') + '</h3><img src="./images/privacy_pseudonymous.svg" alt="' + get_translation('Pseudonym') + '"><p data-i18n="Scribe_medium_privacy_level_explanation">' + get_translation('Scribe_medium_privacy_level_explanation') + '</p>';
					if(window.settings.assistants['scribe'].privacy_level == 'Medium'){
						explanation1_el.classList.add('selected');
					}
					
					
					let explanation2_el = document.createElement('div');
					explanation2_el.classList.add("big-chat-bubble-setting-option");
					// 
					explanation2_el.innerHTML = '<h3 data-i18n="Redacted">' + get_translation('Redacted') + '</h3><img src="./images/privacy_redacted.svg" alt="' + get_translation('Redacted') + '"><p data-i18n="Scribe_high_privacy_level_explanation">' + get_translation('Scribe_high_privacy_level_explanation') + '</p>';
					if(window.settings.assistants['scribe'].privacy_level == 'High'){
						explanation2_el.classList.add('selected');
					}
					
					let explanation1_button_wrapper_el = document.createElement('div');
					explanation1_button_wrapper_el.classList.add('align-right');
					
					let explanation2_button_wrapper_el = document.createElement('div');
					explanation2_button_wrapper_el.classList.add('align-right');
					
					explanation1_button_wrapper_el.appendChild(medium_button_el);
					explanation2_button_wrapper_el.appendChild(high_button_el);
					
					explanation1_el.appendChild(explanation1_button_wrapper_el);
					explanation2_el.appendChild(explanation2_button_wrapper_el);
					
					setting_wrapper_el.appendChild(pre_explanation_title_el);
					setting_wrapper_el.appendChild(pre_explanation_el);
					explanations_container_el.appendChild(explanation1_el);
					explanations_container_el.appendChild(explanation2_el);
					
					setting_wrapper_el.appendChild(explanations_container_el);
					
					setting_wrapper_el.classList.add('big-settings-bubble');
				
				}
				
				else if(special_type == 'scribe_clock'){
					//console.log("adding scribe_clock");
					
					
					let pre_explanation_title_el = document.createElement('h2');
					pre_explanation_title_el.textContent = get_translation('Voice_recordings');
					pre_explanation_title_el.setAttribute('data-i18n','Voice_recordings');
					
					let pre_explanation_el = document.createElement('p');
					pre_explanation_el.classList.add('small-vertical-margin');
					pre_explanation_title_el.setAttribute('data-i18n','For_precise_time_keeping_please_press_start_when_the_voice_recording_should_begin');
					pre_explanation_el.textContent = get_translation('For_precise_time_keeping_please_press_start_when_the_voice_recording_should_begin');
					
					let explanation1_el = document.createElement('div');
					explanation1_el.classList.add("big-chat-bubble-setting-option");
					
					let time_wrapper_el = document.createElement('div');
					time_wrapper_el.classList.add("flex-between");
					time_wrapper_el.classList.add("flex-align-bottom");
					
					
					window.scribe_clock_time_elapsed_el = document.createElement('div');
					window.scribe_clock_time_elapsed_el.classList.add('clock-time-elapsed');
					window.scribe_clock_time_elapsed_el.setAttribute('id','clock-time-elapsed');
					window.scribe_clock_time_elapsed_el.textContent = '00:00';
					time_wrapper_el.appendChild(window.scribe_clock_time_elapsed_el);
					
					window.scribe_clock_time_remaining_el = document.createElement('div');
					window.scribe_clock_time_remaining_el.classList.add('clock-time-remaining');
					window.scribe_clock_time_remaining_el.setAttribute('id','clock-time-remaining');
					//window.scribe_clock_time_remaining_el.innerHTML = create_time_remaining_html(window.maximum_scribe_duration);
					time_wrapper_el.appendChild(window.scribe_clock_time_remaining_el);
					
					explanation1_el.appendChild(time_wrapper_el);
					
					let time_progress_wrapper_el = document.createElement('div');
					time_progress_wrapper_el.classList.add("clock-progress-wrapper");
					
					window.scribe_clock_progress_el = document.createElement('progress');
					window.scribe_clock_progress_el.classList.add('clock-progress');
					window.scribe_clock_progress_el.setAttribute('id','clock-progress');
					window.scribe_clock_progress_el.setAttribute('value',0);
					time_progress_wrapper_el.appendChild(window.scribe_clock_progress_el);
					
					
					let start_transcription_button_el = document.createElement('button');
					start_transcription_button_el.classList.add('always-blue-button');
					start_transcription_button_el.textContent = get_translation('Start');
					start_transcription_button_el.setAttribute('data-i18n','Start');
					start_transcription_button_el.addEventListener("click", (event) => {
						window.reset_scribe_clock();
						
						// Stop an already started voice transcription first, if there is one
						if(typeof window.current_scribe_voice_parent_task_id == 'number'){
							window.stop_scribe_voice_task();
						}
						
						//window.create_scribe_parent_task('voice');
						
						window.last_time_scribe_started = Date.now();
						if(window.microphone_enabled == false){
							window.enable_microphone();
						}
						
						window.unpause_vad();
						
						window.continuous_vad();
						
						start_transcription_button_el.classList.add('opacity05');
						start_transcription_button_el.classList.remove('always-blue-button');
						window.scribe_clock_progress_el.value = 0;
						window.scribe_precise_sentences_count = 0; // TODO Maybe check if there is no file currently being transcribed, otherwise it would interrupt it's counting
						
					});
					
					
					let explanation1_button_wrapper_el = document.createElement('div');
					explanation1_button_wrapper_el.classList.add('align-right');
					explanation1_button_wrapper_el.appendChild(start_transcription_button_el);
					
					explanation1_el.appendChild(time_wrapper_el);
					explanation1_el.appendChild(time_progress_wrapper_el);
					explanation1_el.appendChild(explanation1_button_wrapper_el);
					
					
					
					//setting_wrapper_el.classList.add('big-settings-bubble');
					
					
					
					// Microphone transcription settings
					continuous_mic_footer_el = document.createElement('div');
					continuous_mic_footer_el.classList.add('continuous-mic-bubble-settings');
					continuous_mic_footer_el.setAttribute('id','continuous-mic-bubble-settings');
				
					let continuous_mic_detail_container_el = document.createElement('div');
					continuous_mic_detail_container_el.classList.add('flex-vertical');
					continuous_mic_detail_container_el.classList.add('area');
					
					
					let continuous_mic_setting_label_el = document.createElement('label');
					continuous_mic_setting_label_el.classList.add('continuous-mic-bubble-settings-label')
					continuous_mic_setting_label_el.textContent = window.get_translation('continuous_mic');
					continuous_mic_setting_label_el.setAttribute('data-i18n','continuous_mic');
					continuous_mic_setting_label_el.setAttribute('for','scribe-continuous-mic-setting');
				
				
					
					
					let continuous_mic_setting_select_el = document.createElement('select');
					continuous_mic_setting_select_el.classList.add('model-info-toggle');
					continuous_mic_setting_select_el.setAttribute('id','scribe-continuous-mic-setting');
					if(typeof window.settings.assistants['scribe'] == 'undefined'){
						window.settings.assistants['scribe'] = {'selected':true,'continous_mic':window.continuous_mic_options[0]};
					}
					for(let o = 0; o < window.continuous_mic_options.length; o++){
						let option_el = document.createElement('option');
						option_el.setAttribute('value',window.continuous_mic_options[o]);
						option_el.setAttribute('data-i18n',window.continuous_mic_options[o]);
						option_el.textContent = window.get_translation(window.continuous_mic_options[o]);
						if(typeof window.settings.assistants['scribe'] != 'undefined' && typeof window.settings.assistants['scribe'].continous_mic == 'string'){
							if(window.continuous_mic_options[o] == window.settings.assistants['scribe'].continuous_mic){
								option_el.setAttribute('selected','selected');
							}
						}
						continuous_mic_setting_select_el.appendChild(option_el);
					}
					
					continuous_mic_setting_select_el.addEventListener('change',() => {
						//console.log("continuous_mic_options select element changed to: ", continuous_mic_setting_select_el.value);
						window.settings.assistants['scribe'].continuous_mic = continuous_mic_setting_select_el.value;
						save_settings();
						if(window.microphone_enabled == false){
							window.enable_microphone();
						}
						window.continuous_vad();
						
					});
					continuous_mic_setting_label_el.setAttribute('data-i18n','continuous_mic');
					
					
					
					
					
					continuous_mic_detail_container_el.appendChild(continuous_mic_setting_label_el);
					continuous_mic_detail_container_el.appendChild(continuous_mic_setting_select_el);
					continuous_mic_footer_el.appendChild(continuous_mic_detail_container_el);
					
					
					setting_wrapper_el.appendChild(pre_explanation_title_el);
					setting_wrapper_el.appendChild(pre_explanation_el);
					setting_wrapper_el.appendChild(continuous_mic_footer_el);
					
					setting_wrapper_el.appendChild(explanation1_el);
				
				}
				
				
				else if(special_type == 'scribe_transcription_info'){
					//console.log("creating scribe transcription info chat message");
					if(task_index == null){
						console.error('add_chat_message: scribe_transcription_info element should not be created without a task_index');
					}
					let speaker_list_title_el = document.createElement('h2');
					speaker_list_title_el.textContent = get_translation('Transcription');
					speaker_list_title_el.setAttribute('data-i18n','Transcription');
					setting_wrapper_el.appendChild(speaker_list_title_el);
					
					let speaker_list_done_el = document.createElement('div');
					speaker_list_done_el.textContent = '✅';
					speaker_list_done_el.classList.add('scribe-transcription-done-indicator');
					setting_wrapper_el.appendChild(speaker_list_done_el);
					
					
					let speaker_list_container_el = document.createElement('div');
					speaker_list_container_el.classList.add('scribe-transcription-info-container');
					if(task_index == null){
						speaker_list_container_el.setAttribute('id','scribe-transcription-info-container');
					}
					else{
						speaker_list_container_el.setAttribute('id','scribe-transcription-info-container' + task_index);
						chat_message_el.setAttribute('id','scribe-transcription-info-container-bubble' + task_index);
					}
					setting_wrapper_el.appendChild(speaker_list_container_el);
					setting_wrapper_el.classList.add('scribe-transcription-info-settings-wrapper');
					
					setTimeout(() => {
						window.scroll_chat_to_bottom();
					},1);
					
					
					
				}
				
				
				else if(special_type == 'switch_to_other_ai'){ // not used, but an AI could in theory recommend switching to another one
					let switch_button_el = document.createElement('button');
					switch_button_el.textContent = get_translation('Lets_chat');
					switch_button_el.setAttribute('data-i18n','Lets_chat');
					switch_button_el.addEventListener("click", (event) => {
						switch_assistant(window.other_ai_to_switch_to);
						//generate_ui();
						//translate();
					});
					setting_wrapper_el.appendChild(switch_button_el);
					setting_wrapper_el.classList.add('text-align-right');
				}
				
				
				
				
				
				
				
				
				else if(special_type == 'switch_to_functionality'){
					
					chat_message_el.classList.add('show-if-mobile');
					
					let functionality_counter = 0;
					for (let [key, details] of Object.entries(window.functionality)) {
					    //console.log(key, details);
						
						if(typeof details.requires_web_gpu == 'boolean' && details.requires_web_gpu == true && window.web_gpu == false){
							continue
						}
						
						functionality_counter++;
						if(typeof details.i18n_code == 'string' && typeof details.assistant_id == 'string'){
							let switch_button_el = document.createElement('button');
							switch_button_el.textContent = get_translation(details.i18n_code);
							switch_button_el.setAttribute('data-i18n',details.i18n_code);
							switch_button_el.addEventListener("click", (event) => {
								
								if(window.web_gpu_supported && typeof details.fast_assistant_id == 'string'){
									switch_assistant(details.fast_assistant_id);
								}
								else{
									switch_assistant(details.assistant_id);
								}
								
								if(typeof details.functions != 'undefined'){
									for(let d = 0; d < details.functions.length; d++){
										//console.log("switch_to_functionality: doing function: ", details.functions[d]);
										window[details.functions[d]]();
									}
								}
								if(typeof details.classes_to_add != 'undefined'){
									for(let d = 0; d < details.classes_to_add.length; d++){
										//console.log("switch_to_functionality: adding class: ", details.classes_to_add[d]);
										document.body.classList.add(details.classes_to_add[d]);
									}
								}
								if(typeof details.classes_to_remove != 'undefined'){
									for(let d = 0; d < details.classes_to_remove.length; d++){
										//console.log("switch_to_functionality: removing class: ", details.classes_to_remove[d]);
										document.body.classList.remove(details.classes_to_remove[d]);
									}
								}
								
								//generate_ui();
								//translate();
							});
							setTimeout(() => {
								setting_wrapper_el.appendChild(switch_button_el);
							},functionality_counter * 10);
							
						}
						
					}
					
					
				}
				
				
				else if(special_type == 'reveal_sidebar'){
					//console.log("add_chat_message: revealing sidebar");
					document.body.classList.remove('intro');
					return
				}
				
				else if(special_type == 'hide_developer_prompt_input'){
					//console.log("add_chat_message: setting developer prompt input to hidden");
					developer_input_hidden = true;
					document.body.classList.add('hide-developer-prompt');
					return
				}
				
				
				
				else if(special_type == 'why_so_slow'){
					
					let why_so_slow_image_el = document.createElement('img');
					why_so_slow_image_el.src = './images/waiting_for_download.png';
					why_so_slow_image_el.setAttribute('alt','Downloading illustration');
					setting_wrapper_el.appendChild(why_so_slow_image_el);
					
					let why_so_slow_title_el = document.createElement('h2');
					why_so_slow_title_el.textContent = get_translation('What_is_taking_so_long');
					why_so_slow_title_el.setAttribute('data-i18n','What_is_taking_so_long');
					setting_wrapper_el.appendChild(why_so_slow_title_el);
					
					
					
					let why_so_slow_first_paragraph_el = document.createElement('p');
					why_so_slow_first_paragraph_el.innerHTML = '<span data-i18n="The_best_way_to_protect_your_privacy_is_to_never_send_your_data_to_an_AI_in_the_cloud_in_the_first_place">' + get_translation('The_best_way_to_protect_your_privacy_is_to_never_send_your_data_to_an_AI_in_the_cloud_in_the_first_place') + '</span>. <br><br><span data-i18n="Instead_Papeg_ai_brings_the_AI_to_you_by_downloading_a_complete_AI_to_your_device_first">' + get_translation('Instead_Papeg_ai_brings_the_AI_to_you_by_downloading_a_complete_AI_to_your_device_first') + '</span><br/><br/><span data-i18n="You_only_need_to_download_an_AI_once_and_it_will_remain_available">' + get_translation('You_only_need_to_download_an_AI_once_and_it_will_remain_available') + "</span>";
					setting_wrapper_el.appendChild(why_so_slow_first_paragraph_el);
					
					chat_message_el.classList.add('why-so-slow-hint');
				}
				
				else if(special_type == 'download_progress'){
					//console.log("add_chat_message: adding model download progress chat message");
					
					let existing_progress_el = document.getElementById('download-progress-' + participant);
					if(existing_progress_el != null){
						//console.error("add_chat_message: aborting, download progress chat message already exists for: ", participant);
						return
					}
					
					let cancel_download_button_el = document.createElement('div');
					cancel_download_button_el.classList.add('cancel-download-button');
					cancel_download_button_el.textContent = '×';
					cancel_download_button_el.addEventListener('click', () => {
						//console.log("clicked on cancel download button");
						abort_download(participant);
					})
					
					let ai_model_size_part = '<span id="download-ai-model-size' + task_index + '" class="ai-model-size"></span>';
					if(typeof window.assistants[participant] != 'undefined' && typeof window.assistants[participant].size == 'number'){
						ai_model_size_part = '<span id="download-ai-model-size' + task_index + '" class="ai-model-size"><span class="ai-model-size-number">' + window.assistants[participant].size + '</span><span class="ai-model-size-gb">GB</span></span>';
					}
					
					let cached = false;
					if(typeof participant == 'string' && participant != 'translator' && typeof window.assistants[participant] != 'undefined'){ // translator is many models
						cached = check_if_cached(participant);
					}
					let participant_download_name = '';
					if(typeof window.settings.assistants[participant] != 'undefined' && typeof window.settings.assistants[participant]['custom_name'] == 'string'){
						participant_download_name = window.settings.assistants[participant]['custom_name'];
					}
					else if(typeof window.translations[participant + '_name'] != 'undefined'){
						participant_download_name = get_translation(participant + '_name');
					}
					if(cached){
						message.classList.add('cached');
						message.innerHTML = '<div class="download-progress-title flex-between" data-i18n="download_progress"><span class="capitalize-first-letter">' + participant_download_name + ' ' + get_translation('loading_progress') + '</span></div>';
					}
					else{
						message.innerHTML = '<div class="download-progress-title flex-between" data-i18n="download_progress"><span class="capitalize-first-letter">' + participant_download_name + ' ' + get_translation('download_progress') + '</span></div>';
						//message.appendChild(cancel_download_button_el); // TODO: allow model download to be interrupted
					}
					

					//let progress_container_el = document.createElement('div');
					//progress_container_el.setAttribute('id','download-progress-' + window.settings.assistant + '-container');
					chat_message_el.classList.add('download-progress-chat-message');
					let progress_el = document.createElement('progress');
					progress_el.classList.add('progress');
					progress_el.setAttribute('id','download-progress-' + participant);
					//setting_wrapper_el.appendChild(progress_el);
					//console.log("progress_el: ", progress_el);
					setting_wrapper_el.appendChild(progress_el);
					
					let download_message_footer = document.createElement('div');
					download_message_footer.classList.add('download-message-footer');
					download_message_footer.classList.add('flex-between');
					download_message_footer.innerHTML = ai_model_size_part;
					
					// Estimated download time remaining indicator
					let time_remaining_el = document.createElement('div');
					time_remaining_el.classList.add('time-remaining');
					
					
					
					download_message_footer.appendChild(time_remaining_el);
					setting_wrapper_el.appendChild(download_message_footer);
					
					setting_wrapper_el.addEventListener('click', () => {
						//console.log("clicked on download message");
						
						if(pane != 'current' && pane != window.settings.assistant){
							switch_assistant(pane); // switch to the AI being downloaded
						}
						setTimeout(()=>{
							add_chat_message_once(pane,'developer','why_so_slow#setting---');
						},500);
						
					})
					
					message.appendChild(setting_wrapper_el);
					chat_message_el.appendChild(message);
					message_downloads_container_el.appendChild(chat_message_el);
					
					
					return;
				}
				
				// Currently only really used for Scribe
				else if(special_type == 'Would_you_like_to_create_a_new_document'){
					//console.log("add_chat_message: special message: adding button to start a new empty document");
					
					message.innerHTML = '<div class="model-example-title" data-i18n="Would_you_like_to_create_a_new_document">' + get_translation('Would_you_like_to_create_a_new_document') + '</div>';
					
					
					let json_button_el = document.createElement('button');
					json_button_el.classList.add('show-if-advanced');
					json_button_el.textContent = 'JSON';
					json_button_el.addEventListener("click", () => {
						//console.log("clicked on button to create new document (for scribe)");
						//const date_string = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
						//const date_string = new Date().toLocaleString();
						load_meeting_notes_example('json','');
						window.scribe_precise_sentences_count = 0;
						if(window.settings.assistant == 'scribe' && window.microphone_enabled == false){
							window.enable_microphone();
						}
					});
					setting_wrapper_el.appendChild(json_button_el);
					
					
					let subtitle_button_el = document.createElement('button');
					subtitle_button_el.textContent = get_translation('Subtitles');
					subtitle_button_el.setAttribute('data-i18n','Subtitles');
					subtitle_button_el.addEventListener("click", () => {
						//console.log("clicked on button to create new document (for scribe)");
						//const date_string = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
						//const date_string = new Date().toLocaleString();
						load_meeting_notes_example('vtt','');
						create_scribe_parent_task();
						window.scribe_precise_sentences_count = 0;
						if(window.settings.assistant == 'scribe' && window.microphone_enabled == false){
							window.enable_microphone();
						}
						
						
					});
					setting_wrapper_el.appendChild(subtitle_button_el);
					
					
					let load_button_el = document.createElement('button');
					load_button_el.textContent = get_translation('Meeting');
					load_button_el.setAttribute('data-i18n','Meeting');
					load_button_el.addEventListener("click", () => {
						//console.log("clicked on button to create new document (for scribe)");
						//const date_string = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
						//const date_string = new Date().toLocaleString();
						load_meeting_notes_example('notes');
						create_scribe_parent_task();
						if(window.settings.assistant == 'scribe' && window.microphone_enabled == false){
							window.enable_microphone();
						}
					});
					setting_wrapper_el.appendChild(load_button_el);
					
					
					
					
					setting_wrapper_el.classList.add('text-align-right');
				}
				
				
				else if(special_type == 'Switch_AI_button'){
					//console.log("add_chat_message: adding model switch hint message");
					
					if(window.busy_loading_assistant == true){
						console.warn("add_chat_message: a model is already in the process of being loaded, aborting showing switch hint message");
						return
					}
					
					//let progress_container_el = document.createElement('div');
					//progress_container_el.setAttribute('id','download-progress-' + window.settings.assistant + '-container');
					chat_message_el.classList.add('switch-hint-chat-message');
					
					if(window.currently_loaded_assistant == null){
						// in this case the model should automatically start loading
						//add_chat_message(current,'developer',get_translation('Nice_choice'), 'Nice_choice');
						console.warn("add_chat_message: currently_loaded_model was still null. aborting."); // the first model should in theory be auto-loaded
						return
					}
					else{
						
						// TODO: check if model is already cached, in which case show "load model" instead of "download model".
						// TODO: show the file size of the model to be downloaded".
						
						//message.innerHTML = '<p>' + get_translation('Would_you_like_to_download_this_AI') + '</p>';
					}
					
					let load_button_el = document.createElement('button');
					load_button_el.textContent = get_translation('Switch_to_this_AI');
					load_button_el.setAttribute('data-i18n','Switch_to_this_AI');
					load_button_el.addEventListener("click", () => {
						//console.log("clicked on switch to different AI button");
						//window.stop_assistant();
						chat_message_el.remove();
						prompt_el.focus();
						//clear_cache();
					});
					setting_wrapper_el.appendChild(load_button_el);
				}
				
				else if(special_type == 'Try_opening_the_camera'){
					//console.log("add_chat_message: adding open the camera hint message");
					
					if(window.continuous_ocr_enabled == true){
						console.warn("add_chat_message: OCR is already acive");
						return
					}
					
					message.innerHTML = '<div class="model-example-title" data-i18n="model_examples">' + get_translation('Try_opening_the_camera') + '</div><div><img src="./images/camera_translation.png" alt="camera-to-text-to-translation-to-voice example"/></div>';
					
					//let progress_container_el = document.createElement('div');
					//progress_container_el.setAttribute('id','download-progress-' + window.settings.assistant + '-container');
					chat_message_el.classList.add('open-camera-hint-chat-message');
					
					let load_ocr_button_el = document.createElement('button');
					load_ocr_button_el.textContent = get_translation('Open_camera');
					load_ocr_button_el.setAttribute('data-i18n','Open_camera');
					load_ocr_button_el.addEventListener("click", () => {
						//console.log("add_chat_message: clicked on Try_opening_the_camera button");
						if(window.microphone_enabled){
							window.disable_microphone();
						}
						if(window.is_mobile && window.ram < 4000){
							window.start_ocr();
						}
						else{
							load_live_camera_translation_example();
						}
						
					});
					setting_wrapper_el.appendChild(load_ocr_button_el);
					setting_wrapper_el.classList.add('text-align-right');
				
				}
				
				
				else if(special_type == 'model_examples'){
					//console.log("add_chat_message: adding model examples chat message (and setting participant to developer)");
					
					
					if(typeof window.intro_explanations_given[pane] == 'undefined'){
						window.intro_explanations_given[pane] = [];
					}
					//console.log("add_chat_message:  pane,participant,window.intro_explanations_given[pane],original_message: ", pane, participant, window.intro_explanations_given[pane], original_message);
					if(window.intro_explanations_given[pane].indexOf(original_message) == -1){
						window.intro_explanations_given[pane].push(original_message);
					}
					else{
						console.warn("add_chat_message: aborting: the 'model_example' chat message was already show for this pane: ", pane, original_message);
						return
					}
					
					//participant = 'developer'; // TODO: this hacky stuff might not be needed anymore now that pane can be set
					
					message.innerHTML = '<div class="model-example-title" data-i18n="model_examples">' + get_translation('model_examples') + '</div>';
					
					let assistant_to_load_examples_for = null;
					if(original_participant != 'user'){
						assistant_to_load_examples_for = pane;
					}
					//console.log('add_chat_message: original_participant, assistant_to_load_examples_for: ', original_participant, assistant_to_load_examples_for);
					if(window.currently_loaded_assistant == null){
						//console.warn("add_chat_message: adding model examples: notice: window.currently_loaded_assistant is null");
					}
					
					let examples = [];
					
					if(typeof assistant_to_load_examples_for != 'string'){
						console.error("add_chat_message: adding model examples: assistant_to_load_examples_for was not a string. Aborting.");
					}
					else if( (typeof window.assistants[assistant_to_load_examples_for] != 'undefined' && typeof window.assistants[assistant_to_load_examples_for]['examples'] != 'undefined') || (typeof window.settings.assistants[assistant_to_load_examples_for] != 'undefined' && typeof window.settings.assistants[assistant_to_load_examples_for]['examples'] != 'undefined') ){
						//console.log("add_chat_message: examples data: ", window.assistants[assistant_to_load_examples_for]['examples']);
						
						message.innerHTML = '<div class="model-example-title" data-i18n="model_examples">' + get_translation('model_examples') + '</div>';
						
						if(typeof window.settings.assistants[assistant_to_load_examples_for] != 'undefined' && typeof window.settings.assistants[assistant_to_load_examples_for]['examples'] != 'undefined'){
							
							if(typeof window.settings.assistants[assistant_to_load_examples_for]['examples']['all'] != 'undefined'){
								examples = window.settings.assistants[assistant_to_load_examples_for]['examples']['all'];
							}
							else if(typeof window.settings.assistants[assistant_to_load_examples_for]['examples'][window.settings.language] != 'undefined'){
								examples = window.settings.assistants[assistant_to_load_examples_for]['examples'][window.settings.language];
							}
							else if(typeof window.settings.assistants[assistant_to_load_examples_for]['examples']['en'] != 'undefined'){
								examples = window.settings.assistants[assistant_to_load_examples_for]['examples']['en'];
							}
							
						}
						if(examples.length == 0 && typeof window.assistants[assistant_to_load_examples_for]['examples'] != 'undefined'){
							
							if(typeof window.assistants[assistant_to_load_examples_for]['examples'][window.settings.language] != 'undefined'){
								examples = window.assistants[assistant_to_load_examples_for]['examples'][window.settings.language];
							}
							else if(typeof window.assistants[assistant_to_load_examples_for]['examples']['en'] != 'undefined'){
								examples = window.assistants[assistant_to_load_examples_for]['examples']['en'];
							}
						}
						
						
						if(examples.length == 0){
							console.warn("add_chat_message: the examples list for this model in the current language existed, but was empty: ", window.settings.language);
							//return
						}
						
						for(let q=0;q<examples.length;q++){
							const example = examples[q];
							//console.log("add_chat_message: looping over example: ", examples[q]);
							if(typeof example.title == 'string' && typeof example.prompt == 'string'){
								let button_el = document.createElement('button');
								let button_text_el = document.createElement('span');
								button_text_el.innerText = example.title;
								button_el.appendChild(button_text_el)
								
								//console.log("example.title.length: ", example.title.length, example.title);
								if(example.title.length < 3){
									button_el.classList.add('example-emoji-title');
								}
								button_el.classList.add('chat-example-button');
								button_el.addEventListener("click", () => {
									//console.log("clicked on example button. Example: ", example);
									handle_example(example);
								});
								
								setting_wrapper_el.appendChild(button_el);
								
							}
							else{
								console.error("add_chat_message: example was incomplete: ", examples[q]);
							}
						}
						
						let ai_type = 'generic';
						if(typeof window.assistants[assistant_to_load_examples_for].type == 'string'){
							ai_type = window.assistants[assistant_to_load_examples_for].type;
						}
						
						if( typeof window.assistants[assistant_to_load_examples_for]['languages'] == 'undefined' || (typeof window.assistants[assistant_to_load_examples_for]['languages'] != 'undefined' && window.assistants[assistant_to_load_examples_for]['languages'].indexOf('en') != -1)){
							//console.log("adding extra default examples.  ai_type: ", ai_type);
							for(let qq=0; qq < window.examples.length; qq++){
								if(window.examples[qq].types.indexOf(ai_type) != -1){
									const example = window.examples[qq];
									if(typeof example.title != 'undefined' && typeof example.prompt != 'undefined'){
									
										let button_el = document.createElement('button');
										let button_text_el = document.createElement('span');
										button_text_el.innerText = get_translation(example.title);
										button_el.appendChild(button_text_el)
									
										//console.log("generic example.title.length: ", example.title.length, example.title);
										if(example.title.length < 5){
											button_el.classList.add('example-emoji-title');
										}
										button_el.classList.add('generic-chat-example-button');
										button_el.addEventListener("click", () => {
											//console.log("clicked on universal prompt example button. Example: ", example);
											handle_example(example);
										});
								
										setting_wrapper_el.appendChild(button_el);
								
									}
								}
							}
						}
						
						
						
						
						
						
						// 	What's the difference between green and red apples?
						
						
					}
					else{
						//console.log("add_chat_message: this model did not have any examples to show. assistant_to_load_examples_for: ", assistant_to_load_examples_for);
						return
					}
					
					chat_message_el.classList.add('model-examples-chat-message');
					//setting_wrapper_el.classList.add('text-align-right');
					//console.log("final setting_wrapper_el, should be filled with example buttons: ", setting_wrapper_el);
				}
				
				
				else if(special_type == 'model_tutorial' || special_type == 'document_tutorial' || special_type == 'voice_tutorial'){
					
					if(window.active_destination == 'document'){
						console.log("not showing tutorial hints, as the document has focus, and adding the chat message would take away from that");
						return
					}
					
					if(special_type == 'model_tutorial'){
						return // TODO: at the moment this tutorial isn't very useful
						//message.innerHTML = '<p>' + get_translation("While_you_can_download_many_AIs_you_can_only_have_one_active_at_a_time") + '</p><img src="./images/model_ankeiler.svg">';
						message.innerHTML = '<p>' + get_translation("There_are_many_AI_models_you_can_try") + '</p><img src="./images/model_ankeiler.svg">';
					}
					else if(special_type == 'document_tutorial'){
						message.innerHTML = '<p>' + get_translation("With_the_aid_of_these_AIs_you_can_write_even_better_documents") + '</p>';
					}
					else if(special_type == 'voice_tutorial'){
						message.innerHTML = '<p>' + get_translation("You_can_use_voice_control_to_talk_to_an_AI_dictate_into_a_document_and_even_give_voice_commands_like_start_a_new_document") + '</p><img src="./images/voice_ankeiler.svg">';
					}
				
					let learn_more_button_el = document.createElement('button');
					learn_more_button_el.textContent = get_translation('Learn_more');
					learn_more_button_el.setAttribute('data-i18n','Learn_more');
					learn_more_button_el.addEventListener("click", () => {
						//console.log("add_chat_message: clicked on play model tutorial button");
					
						if(special_type == 'model_tutorial'){
						
							if(window.innerWidth < 641 && window.innerWidth < window.innerHeight){
								flash_message(get_translation("Please_rotate_your_phone_horizontally_first"));
								return
							}
							else{
								document.body.classList.remove('view-document');
								open_sidebar();
								document.body.classList.add('sidebar-chat');
								document.body.classList.remove('sidebar-settings');
							}
						}
					 
					
						learn_more_button_el.remove();
						play_tutorial(special_type);
						window.settings.tutorial[special_type + "_done"] = true;
						save_settings();
						
						scroll_chat_to_bottom();
					
					
					});
					setting_wrapper_el.classList.add('text-align-right');
					setting_wrapper_el.appendChild(learn_more_button_el);
					
				}
				
				
				// Document tutorial
				else if(special_type == 'Create_document_tutorial_document'){
					window.add_script('./specials/document_tutorial.js');
					return
				}
				
				// Voice tutorial
				else if(special_type == 'Create_voice_tutorial_document'){
					window.add_script('./specials/voice_tutorial.js');
					return
				}
				
				// AI crashed
				else if(special_type == 'it_seems_the_AI_has_crashed'){
					//console.log("add_chat_message: adding model crashed message (and setting participant to developer)");
					
					participant = 'developer';
					
					message.innerHTML = '<p>' + get_translation('it_seems_the_AI_has_crashed') + '</p>';
					
					let restart_button_el = document.createElement('button');
					restart_button_el.textContent = get_translation('restart');
					restart_button_el.setAttribute('data-i18n','restart');
					restart_button_el.addEventListener("click", () => {
						//console.log("add_chat_message: clicked on restart model button");
						window.stop_assistant();
						chat_message_el.remove();
						//clear_cache();
					});
					setting_wrapper_el.appendChild(restart_button_el);
					
					let button_el = document.createElement('button');
					button_el.textContent = get_translation('clear_cache');
					button_el.setAttribute('data-i18n','clear_cache');
					button_el.addEventListener("click", () => {
						//console.log("clicked on clear cache button");
						delete_model_from_cache(window.currently_loaded_assistant);
						chat_message_el.remove();
						//clear_cache();
					});
					setting_wrapper_el.appendChild(button_el);
					
					//let progress_container_el = document.createElement('div');
					//progress_container_el.setAttribute('id','download-progress-' + window.settings.assistant + '-container');
					chat_message_el.classList.add('error-chat-message');
					chat_message_el.classList.add('model-crashed-message');
					
					message.classList.add('error-chat-message');
					
				}
				
				// AI crashed
				else if(special_type == 'it_seems_the_AI_failed_to_download'){
					//console.log("add_chat_message: ai failed to download");
					
					participant = 'developer';
					
					message.innerHTML = '<p>' + get_translation('It_seems_the_AI_failed_to_download') + '</p>';
					/*
					let restart_button_el = document.createElement('button');
					restart_button_el.textContent = get_translation('restart');
					restart_button_el.setAttribute('data-i18n','clear_cache');
					restart_button_el.addEventListener("click", () => {
						//console.log("clicked on restart model button");
						window.stop_assistant();
						chat_message_el.remove();
						//clear_cache();
					});
					setting_wrapper_el.appendChild(restart_button_el);
					
					let button_el = document.createElement('button');
					button_el.textContent = get_translation('clear_cache');
					button_el.setAttribute('data-i18n','clear_cache');
					button_el.addEventListener("click", () => {
						//console.log("add_chat_message: clicked on clear cache button");
						delete_model_from_cache(window.currently_loaded_assistant);
						chat_message_el.remove();
						//clear_cache();
					});
					setting_wrapper_el.appendChild(button_el);
					*/
					//let progress_container_el = document.createElement('div');
					//progress_container_el.setAttribute('id','download-progress-' + window.settings.assistant + '-container');
					chat_message_el.classList.add('error-chat-message');
					chat_message_el.classList.add('model-crashed-message');
					
					
					message.classList.add('error-chat-message');
					
				}
				
				
				
				
				// AI crashed
				else if(special_type == 'it_seems_the_AI_failed_to_load'){
					//console.log("add_chat_message: ai failed to load");
					
					participant = 'developer';
					
					message.innerHTML = '<p>' + get_translation('it_seems_the_AI_failed_to_load') + '</p>';
					
					let restart_button_el = document.createElement('button');
					restart_button_el.textContent = get_translation('restart');
					restart_button_el.setAttribute('data-i18n','clear_cache');
					restart_button_el.addEventListener("click", () => {
						//console.log("clicked on restart model button");
						window.stop_assistant();
						chat_message_el.remove();
						//clear_cache();
					});
					setting_wrapper_el.appendChild(restart_button_el);
					
					let button_el = document.createElement('button');
					button_el.textContent = get_translation('clear_cache');
					button_el.setAttribute('data-i18n','clear_cache');
					button_el.addEventListener("click", () => {
						//console.log("add_chat_message: clicked on clear cache button");
						delete_model_from_cache(window.currently_loaded_assistant);
						chat_message_el.remove();
						//clear_cache();
					});
					setting_wrapper_el.appendChild(button_el);
					
					//let progress_container_el = document.createElement('div');
					//progress_container_el.setAttribute('id','download-progress-' + window.settings.assistant + '-container');
					chat_message_el.classList.add('error-chat-message');
					chat_message_el.classList.add('model-crashed-message');
					
					
					message.classList.add('error-chat-message');
					
				}
				
				
				
				// Image description example
				else if(special_type == 'Try_an_image_description_example'){
					
					//console.log("add_chat_message: Try_an_image_description_example");
					
					participant = 'developer';
					
					message.innerHTML = '<p>' + get_translation('Try_an_image_description_example') + '</p>';
					
					let button_el = document.createElement('button');
					button_el.textContent = 'Work';//get_translation('Image_description');
					//button_el.setAttribute('data-i18n','Image_description');
					button_el.addEventListener("click", () => {
						//console.log("add_chat_message: clicked on describe image example button");
						window.add_script('./specials/image_to_text_example.js');
						return
					});
					setting_wrapper_el.appendChild(button_el);
					
					
					let button2_el = document.createElement('button');
					button2_el.textContent = 'South-Africa';//get_translation('Image_description');
					//button2_el.setAttribute('data-i18n','Image_description');
					button2_el.addEventListener("click", () => {
						//console.log("add_chat_message: clicked on describe image example 2 button");
						window.add_script('./specials/image_to_text_example2.js');
						return
					});
					setting_wrapper_el.appendChild(button2_el);
					
					
					//let progress_container_el = document.createElement('div');
					//progress_container_el.setAttribute('id','download-progress-' + window.settings.assistant + '-container');
					//chat_message_el.classList.add('error-chat-message');
					//chat_message_el.classList.add('model-crashed-message');
					
					
					//message.classList.add('error-chat-message');

				}
				
				
				
				// Image description example
				else if(special_type == 'Try_a_document_scanner_example'){
					
					//console.log("add_chat_message: Try_an_image_description_example");
					
					participant = 'developer';
					
					message.innerHTML = '<p>' + get_translation('Try_a_document_scanner_example') + '</p>';
					
					let button_el = document.createElement('button');
					button_el.textContent = 'Alice in Wonderland';//get_translation('Image_description');
					//button_el.setAttribute('data-i18n','Image_description');
					button_el.addEventListener("click", () => {
						//console.log("add_chat_message: clicked on describe image example button");
						window.add_script('./specials/image_to_text_ocr_example.js');
						return
					});
					setting_wrapper_el.appendChild(button_el);
					
				}
				
				
				
				// Please provide the URL for a custom model
				else if(special_type == 'Please_provide_the_URL_of_an_AI_model'){
					//console.log("add_chat_message: Please_provide_the_URL_of_an_AI_model");
					
					
					message.innerHTML = '<div class="model-example-title" data-i18n="Please_provide_the_URL_of_an_AI_model">' + get_translation('Please_provide_the_URL_of_an_AI_model') + '</div><div><img src="./images/provide_url_ankeiler.svg" alt="Please provide the URL of an AI model file"/></div>';
					
					//let progress_container_el = document.createElement('div');
					//progress_container_el.setAttribute('id','download-progress-' + window.settings.assistant + '-container');
					chat_message_el.classList.add('provide-url-hint-chat-message');
					
					let provide_url_button_el = document.createElement('button');
					provide_url_button_el.textContent = get_translation('Settings');
					provide_url_button_el.setAttribute('data-i18n','Settings');
					provide_url_button_el.addEventListener("click", () => {
						//console.log("add_chat_message: clicked on provide URL button");
						show_model_info();
						setTimeout(() => {
							// scroll URL input field into view
							let model_info_url_container_el = document.getElementById('model-info-setting-url-container');
							if(model_info_url_container_el){
								model_info_url_container_el.scrollIntoView({ behavior: "smooth"});
							}
						},1);
						
					});
					setting_wrapper_el.appendChild(provide_url_button_el);
					setting_wrapper_el.classList.add('text-align-right');
				}
				
				else{
					//console.log("add_chat_message: special message fell through. special_type: ", special_type);
					return;
				}
				
				
				let close_special_message_button_wrapper_el = document.createElement('div');
				let close_special_message_button_el = document.createElement('div');
				close_special_message_button_el.classList.add('small-corner-close-button');
				close_special_message_button_el.classList.add('close-button-cross');
				close_special_message_button_el.classList.add('bg-icon');
				close_special_message_button_el.addEventListener('click', () => {
					chat_message_el.remove();
				})
				close_special_message_button_wrapper_el.appendChild(close_special_message_button_el);
				bubble_el.appendChild(close_special_message_button_wrapper_el);
				
				
				
				message.appendChild(setting_wrapper_el);
				//setting_wrapper_el.classList.add('text-align-right');
				
				setTimeout(() => {
					scroll_chat_to_bottom();
				},100);
				
			
			}
			else if(participant != 'user'){
				
				// Translate messages that start with _$_
				if(message.startsWith('_$_')){
					//console.log("got _$_ message, will attempt to get translation");
					if(typeof translations[message] != 'undefined'){
						message = get_translation(message);
						/*
						if(typeof translations[message][window.settings.language] == 'string'){
							message = translations[message][window.settings.language];
						}
						else if(typeof translations[message]['en'] == 'string'){
							message = translations[message]['en'];
						}
						else{
							console.error("add_chat_message: missing translation for: ", message);
							return
						}
						*/
					}
				}
				
				// remove trailing period from message if it's just one sentence
				else if(message.endsWith('.')){
					const periods = (message.match(/\./g) || []).length;
					if(periods == 1){
						let unpunctuated = message.replaceAll('.','');
						if(unpunctuated != '' && !isNaN(unpunctuated)){
							bubble_el.classList.add('index-number');
						}
						//message = message.replaceAll('.','');
					}
				}
				
				if(intro_user_made_first_query){
					//console.log("add_chat_message: user got first real response to a query");
					setTimeout(() => {
						set_tutorial_step(3);
					}, 10000);
					
				}
			}
			
			if(typeof message == 'string'){
				
				if(typeof i18n_code == 'string'){
					//console.log("apply_markdown was undefined, or participant was developer");
					let message_text_el = document.createElement('div');
					message_text_el.classList.add('bubble-text');
					if(typeof i18n_code == 'string'){
						message_text_el.setAttribute('data-i18n', i18n_code);
					}
					message_text_el.textContent = message;
					bubble_el.appendChild(message_text_el);
				}
				else{
					bubble_el = place_message_in_bubble(bubble_el,message,participant);
				}
				
				
				
				// Clicking on a user's chat bubble copies it's text to the prompt input
				if(participant == 'user'){
					//console.log("participant is user, adding click listener to copy command into prompt input");
					
					let share_prompt_button_el = document.createElement('div');
					share_prompt_button_el.classList.add('bubble-share-prompt-button');
					share_prompt_button_el.classList.add('bubble-doc-button');
					
					let share_prompt_button_icon_el = document.createElement('div');
					
					share_prompt_button_icon_el.classList.add('unicode-icon');
					share_prompt_button_icon_el.textContent = '🔗';
					share_prompt_button_el.appendChild(share_prompt_button_icon_el);
					
					share_prompt_button_el.addEventListener('click',(event) => {
						event.stopPropagation();
						
						document.body.classList.remove('busy-editing-assistant');
						document.body.classList.remove('busy-editing-received-ai');
						
						//console.log("add_chat_message: clicked on share link button");
						share_prompt_button_el.classList.add('opacity0');
						share_prompt_button_el.classList.add('no-click-events');
						setTimeout(() => {
							share_prompt_button_el.classList.remove('opacity0');
							share_prompt_button_el.classList.remove('no-click-events');
						},500);
						
						
						share_prompt_input_el.value = message;
						create_share_prompt_link(true); // true == initial creation of share dialog, which populates the textareas for
						
						share_prompt_dialog_el.showModal();
						
					});
					bubble_wrap_el.appendChild(share_prompt_button_el);
					
					
					bubble_el.addEventListener("click", (event) => {
						//console.log("add_chat_message: clicked on bubble. message: ", message);
						/*
						if(window.state == UNLOADED || window.state == LISTENING){
							prompt_el.value = message;
						}
						else{
							console.warn("not copying contents of chat bubble to prompt input")
						}
						*/
						prompt_el.value = message;
					});
				}
				else if(message.length > 30 && pane != 'musicgen'){
					//console.log("add_chat_message: quite a long message. Adding small buttons to insert into current document, or start a new one with it.");
					
					if(window.reate_insert_into_doc_buttons){
						let doc_buttons_container_el = window.create_insert_into_doc_buttons(message);
						if(message.length < 60){
							doc_buttons_container_el.classList.add('short-chat-message');
						}
					
						bubble_wrap_el.appendChild(doc_buttons_container_el);
					}
					
					
				}
				
				// simple text message by the developer will fade away after a while
				if(participant == 'developer' && pane != 'developer'){
					setTimeout(() => {
						chat_message_el.classList.add('fade-out-chat-message');
					},60000);
					setTimeout(() => {
						chat_message_el.remove();
					},62000);
				}
				
			}
			else{
				bubble_el.classList.add('special');
				bubble_el.appendChild(message);
			}
			
			
			
			if(participant != window.settings.assistant && participant != 'user'){
				//console.log("adding profile pic to chat bubble");
				chat_profile_pic_el.classList.add('chat-bubble-assistant-icon-container');
				chat_profile_pic_el.innerHTML = '<img src="images/' + participant.replace('_32bit','') + '.png" class="chat-bubble-assistant-icon"/>';
				bubble_wrap_el.appendChild(chat_profile_pic_el);
			}
			
			//if((participant == 'speaker' || participant == 'translator' || participant == 'musician' || participant == 'imager') && typeof message == 'string' && !message.endsWith('#setting---')){
			if(typeof task_output != 'undefined' && task_output != null){
				bubble_el.appendChild(task_output_el);
			}
			
			bubble_wrap_el.appendChild(bubble_el);
			
			chat_message_el.appendChild(bubble_wrap_el);
		
			
			
		
		
		
			// Chat bubble time
			let local_time = new Date().toLocaleString();
			
			let local_time_parts = local_time.split(':');
			let hours = local_time_parts[0].slice(-2);
			let minutes = local_time_parts[1];
			if(isNaN(hours) || isNaN(minutes)){
				console.warn("bad time");
			}
			else{
				if(parseInt(minutes) % 2 == 0){
					chat_message_el.classList.add('even-time');
				}
				else{
					chat_message_el.classList.add('odd-time');
				}
				
				let local_time = hours + ':' + minutes;
				let time_el = document.createElement('div');
				time_el.classList.add('time');
				time_el.textContent = local_time;
				//console.log("local time: ", local_time);
				
				chat_message_el.appendChild(time_el);
				//window.last_chat_times[participant] = local_time;
				
			}
			
			
			chat_message_el.classList.add('participant-' + participant);
			
			// Add the message to the correct chat pane
			if(participant == 'user' && window.settings.assistant != 'speaker' && window.settings.assistant != 'musicgen' && !window.settings.assistant.startsWith('image_to_text') && window.settings.assistant != 'imager' && window.settings.assistant != 'scribe'){
				//document.body.classList.add('waiting-for-response');
				/*
				if(task){
					set_chat_status(task,'<div class="dot-flashing"></div>');
				}
				*/
				//participant = window.settings.assistant;
			}
			
			//console.log("original_message: ", original_message);
			//if(!original_message.startsWith('_$_intro')){
				
			if(participant == 'whisper' || (participant == 'developer' && window.settings.assistant != 'developer' && !original_message.startsWith('_$_intro')) ){
				//console.log("switching participant back to the one currently being viewed: ", window.settings.assistant);
				participant = window.settings.assistant; // switch it back if the participant was 'hacked' to be another
			}
			//}
			if(original_message.startsWith('_$_intro') || original_message == 'language#setting---'){
				//console.log("Message was an intro or system setting message. setting participant to developer");
				participant = 'developer';
			}
			
			participant = original_participant;
			//console.log('participant pane: participant, window.settings.assistant: ', participant, window.settings.assistant);
			
			if(pane == 'user' || pane == 'whisper'){
				pane = window.settings.assistant;
			}
			let pane_id = 'pane-content-' + pane + '-chats';
		
			
			if(typeof window.conversations[window.settings.assistant] != 'undefined' && Array.isArray(window.conversations[window.settings.assistant]) && window.conversations[window.settings.assistant].length){
				document.body.classList.add('has-conversation');
			}
			/*
			if(participant == window.settings.assistant || participant == 'user'){
				// This chat will have been added to window.conversations, so the UI can reflect that.
				document.body.classList.add('has-conversation');
			}
			*/
		
			let chat_pane_el = document.getElementById(pane_id);
			if(chat_pane_el){
				chat_pane_el.appendChild(chat_message_el);
				
				
				
				if(participant == 'user'){
					scroll_chat_to_bottom();
					
					set_chat_status({'assistant':pane}, '', 2); // clear any whisper live transcription stream status text
					
					//chat_pane_el.scrollTop = chat_pane_el.scrollHeight;
					/*
					if(save_to_conversations){
						if(typeof window.conversations[pane] == 'undefined'){
							window.conversations[pane] = [];
						}
						//console.log("add_chat_message: conversation:  typeof message,mesage: ", typeof message, message);
						if(typeof message == 'string'){
							//console.log("add_chat_message: adding user message to window.conversations.  original_message: ", pane, original_message);
							//console.log("window.conversations[pane]: ", pane, window.conversations[pane]);
							window.conversations[pane].push({'role':'user','content':original_message,'timestamp': Math.floor(Date.now() / 1000)});
						}
						else{
							//console.log("add_chat_message: conversation: message was not a string, not adding to conversation: ", typeof message, message);
						}
					}
					*/
					
					//chat_message_el.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest"}); // 
				}
				else if(pane != window.settings.assistant && participant != 'developer'){
					if(typeof window.unread_messages[pane] == 'number'){
						window.unread_messages[pane]++; // = window.unread_messages[pane] + 1;
					}
					else{
						window.unread_messages[pane] = 1;
					}
				}
				
				window.chat_message_counter++;
			}
			else{
				console.error("add_chat_message: had to fall back to finding chat page based on window.settings.assistant as this pane was missing: ", pane_id);
				chat_pane_el = document.getElementById('pane-content-' + window.settings.assistant + '-chats');
				if(chat_pane_el){
					chat_pane_el.appendChild(chat_message_el);
					chat_pane_el.scrollTop = chat_pane_el.scrollHeight;
					window.chat_message_counter++;
				}
				else{
					console.error("add_chat_message: cannot add chat message: missing chat panes: ", pane_id, 'pane-content-' + window.settings.assistant + '-chats');
				}
				
			}
			
		}
		catch(e){
			console.error("add_chat_message: caught general error: ", e);
		}
	}
	window.add_chat_message = add_chat_message;



	// Add Chat Message ONCE

	function add_chat_message_once(pane,participant,message,i18n_code=null, task_output=null, task_index=null){
		//console.log("in add_chat_message_once.  pane,participant,message,i18n_code,task_output,task_index: ", pane, participant, message, i18n_code, task_output, task_index=null);
		
		let real_pane = null;
		if(typeof pane == 'string'){
			real_pane = pane;
			if(real_pane == 'current'){
				real_pane = window.settings.assistant;
			}
		}
		
		if(task_output != null){
			add_chat_message(real_pane,participant,message,i18n_code,task_output,task_index);
		}
		else if(typeof real_pane == 'string'){
			if(typeof window.intro_explanations_given[real_pane] == 'undefined'){
				window.intro_explanations_given[real_pane] = [];
			}
			
			if(typeof message == 'string' && typeof i18n_code == 'string'){
				if(window.intro_explanations_given[real_pane].indexOf(i18n_code) == -1){
					add_chat_message(real_pane,participant,message,i18n_code,task_output,task_index);
					window.intro_explanations_given[pane].push(i18n_code);
				}
			}
			else if(typeof message == 'string'){
				if(window.intro_explanations_given[real_pane].indexOf(message) == -1){
					add_chat_message(real_pane,participant,message,i18n_code,task_output,task_index);
					window.intro_explanations_given[real_pane].push(message);
				}
			}
			else{
				console.error("add_chat_message_once: invalid input (participant or message was likely not a string).  pane,participant,message: ", pane, participant, message);
			}
		}
		else{
			console.error("add_chat_message_once: pane was not a string");
		}
		
	}
	window.add_chat_message_once = add_chat_message_once;
	
	
	function place_message_in_bubble(bubble_el=null,message='',participant=null){
		//console.log("in place_message_in_bubble.  bubble_el,message,participant: ", bubble_el, message, participant);
		if(bubble_el == null){
			console.error("place_message_in_bubble: no valid element provided");
			return bubble_el;
		}
		if(typeof message != 'string' || (typeof message == 'string' && message == '')){
			console.error("place_message_in_bubble: provided message was empty or invalid");
			return bubble_el;
		}
		
		let markdown_allowed = false;
		if(typeof participant == 'string'){
			if(typeof window.settings.assistants[participant] != 'undefined' && typeof window.settings.assistants[participant]['markdown_supported'] == 'boolean'){
				markdown_allowed = window.settings.assistants[participant]['markdown_allowed'];
			}else if(typeof window.assistants[participant] != 'undefined' && typeof window.assistants[participant]['markdown_supported'] == 'boolean'){
				markdown_allowed = window.assistants[participant]['markdown_allowed'];
			}
		}
		
		
		
		//console.log("add_chat_message: markdown_allowed: ", markdown_allowed);
	
	
		if(markdown_allowed && typeof apply_markdown == 'function' && participant != 'developer'){
			let markdown_version = message.trim();
			try{
				if(markdown_version.length > 10){
					//console.log("place_message_in_bubble: attempting to apply markdown to:\n", markdown_version);
					markdown_version = apply_markdown(markdown_version);
					//console.log("place_message_in_bubble: markdown_version: ", markdown_version);
				
					if(markdown_version.indexOf('<p><strong>') != -1){
						markdown_version = markdown_version.replace(/<p><strong>([^<>]*?<\/strong>:?<\/p>)/, '<p><strong class="strong-header">' + '$1');
					}
				
				}
				else{
					console.error("place_message_in_bubble: text was too short to attempt to apply markdown to it");
				}
			}
			catch(err){
				console.error("place_message_in_bubble: an error occured while trying to apply markdown: ", err);
			}
			//console.log("apply_markdown_version: ", markdown_version);
			if( 
				(markdown_version.indexOf('<ul') != -1 && markdown_version.indexOf('</ul>') != -1) 
				|| (markdown_version.indexOf('<ol') != -1 && markdown_version.indexOf('</ol>') != -1) 
				|| (markdown_version.indexOf('<strong>') != -1 && markdown_version.indexOf('</strong>') != -1) 
				|| (markdown_version.indexOf('<em>') != -1 && markdown_version.indexOf('</em>') != -1) 
				|| (markdown_version.indexOf('<p>') != -1 && markdown_version.indexOf('</p>') != -1) 
			){
				bubble_el.classList.add('has-html');
			}
		
			bubble_el.innerHTML = markdown_version;
		}
		else{
			let message_text_el = document.createElement('div');
			message_text_el.classList.add('bubble-text');
			message_text_el.textContent = message;
			bubble_el.innerHTML = '';
			bubble_el.appendChild(message_text_el);
		}
		
		return bubble_el;
	}
	
	
	
	
	
	
	
	
	
	
	function reset_scribe_clock(){
		window.last_time_scribe_started = null;
		if(window.scribe_clock_time_elapsed_el != null){
			window.scribe_clock_time_elapsed_el.textContent = '00:00';
			window.scribe_clock_time_remaining_el.innerHTML = '';
			window.scribe_clock_progress_el.value = 0;
		}
	}
	window.reset_scribe_clock = reset_scribe_clock;
	
	
	
	
	function scroll_chat_to_bottom(assistant_id=null){
		
		if(typeof assistant_id != 'string'){
			assistant_id = window.settings.assistant;
		}
		//console.log("in scroll_chat_to_bottom. assistant_id: ", assistant_id);
		
		// pane-content-fast_gemma_2_2b-reverser
		let pane_id = 'pane-content-' + assistant_id + '-chats';
		//let pane_id = 'pane-content-' + assistant_id + '-reverser';
		let chat_pane_el = document.getElementById(pane_id);
		if(chat_pane_el){
			//console.log("chat_pane_el.lastChild: ", chat_pane_el.lastChild);
			if(chat_pane_el.lastChild){
				chat_pane_el.lastChild.scrollIntoView({'behavior':'smooth','block':'end'});
			}
			//console.log("- chat_pane_el.scrollTop: ", chat_pane_el.scrollTop);
			//console.log("->");
			//console.log("- chat_pane_el.scrollHeight: ", chat_pane_el.scrollHeight);
			//console.error("scroll_chat_to_bottom: scrolling: pane-content-" + window.settings.assistant + "-reserver,  scrollHeight,chat_pane_el.scrollTop: ", chat_pane_el.scrollHeight, chat_pane_el.scrollTop);
			//chat_pane_el.scrollTop = chat_pane_el.scrollHeight;
		}
		else{
			console.error("scroll_chat_to_bottom: could not find pane: ", pane_id);
		}
	}
	window.scroll_chat_to_bottom = scroll_chat_to_bottom;
	
	
	
	
	function scroll_a_bit(element='document',direction='down',amount='page'){
		console.log("in scroll_a_bit.  element, direction, amount: ", element, direction, amount);
		
		let target_el = null;
		let pixels = 300;
		
		if(typeof element == 'string'){
			let element_id = element;
			if(element == 'document'){
				element_id = '.cm-scroller';
			}
			else if(element == 'chat'){
				element_id = '#pane-content-' + window.settings.assistant + '-chats';
			}
			target_el = document.querySelector(element_id);
		}
		
		if(target_el){
			
			if(typeof amount == 'number'){
				pixels = amount;
			}
			else if(typeof amount == 'string'){
				
				if(amount == 'page'){
					let parent_el = target_el.parentNode;
					pixels = parent_el.getBoundingClientRect().height;
					if(pixels > 500){
						pixels = pixels * 0.7;
					}
				}
			}
			
			
			if(direction === 'down'){
				direction = 1;
			}
			else{
				direction = -1;
			}
			
			
			const distance = Math.round(pixels) * direction;
			console.log("scroll_a_bit: distance: ", distance);
			//target_el.scroll(0, distance);
			target_el.scroll({
			  top: distance,
			  left: 0,
			  behavior: "smooth",
			})
			
		}
		else{
			console.error("scroll_a_bit: no element to scroll");
		}
		
	}
	window.scroll_a_bit = scroll_a_bit;
	
	
	
	
	
	
	
	function recreate_timers(){
		//console.log("in recreate_timers. window.timers: ", window.timers);
		if(typeof window.timers != 'undefined' && window.timers != null && Array.isArray(window.timers)){
			for(let x = 0; x < window.timers.length; x++){
				//console.log("recreate_timers:  sentence: ", window.timers[x].sentence);
				//window.timers[x]
				//console.log("window.timers[x]: ", window.timers[x]);
				if(typeof window.timers[x].timer_index == 'number' && typeof window.timers[x].sentence == 'string'){
					let timer_container_el = document.getElementById('timer-container-' + window.timers[x].timer_index);
					if(timer_container_el == null){
					
						if(typeof window.timers[x].to_time == 'string'){
							try{
								let to_time = new Date(window.timers[x].to_time);
								//console.log("recreate_timers: to_time: ", typeof to_time, to_time);
								if(to_time < Date.now()){
									//console.log("recreate_timers: skipping timer that ended in the past: ", window.timers[x]);
									continue
								}
							}
							catch(err){
								console.error("recreate_timers: failed to turn string into date: ", err);
							}
						}
						else if(window.timers[x].to_time == null){
							//console.log("timer had no valid to_time (null): ", window.timers[x].to_time);
							continue;
						}
						
					
						const my_timer_index = window.timers[x].timer_index;
					
						timer_container_el = document.createElement('div');
						timer_container_el.setAttribute('id','timer-container-' + my_timer_index);
						timer_container_el.classList.add('timer-container');
					
						let timer_el = document.createElement('div');
						timer_el.setAttribute('id','timer-' + my_timer_index);
						timer_container_el.classList.add('timer');
						timer_container_el.appendChild(timer_el);

	
						// Timer footer
						let timer_footer_el = document.createElement('div');
						timer_footer_el.classList.add('timer-footer');
						
						let timer_speak_sentence_wrapper_el = document.createElement('div');
						timer_speak_sentence_wrapper_el.classList.add('timer-sentence-input-wrapper');
						
						
						// Timer speak input
						let timer_speak_sentence_el = document.createElement('input');
						timer_speak_sentence_el.setAttribute('id','timer-sentence' + my_timer_index);
						timer_speak_sentence_el.classList.add('timer-sentence-input');
						
						if(typeof window.timers[x].speak_sentence == 'string'){
							timer_speak_sentence_el.value = window.timers[x].speak_sentence;
						}
						
						timer_speak_sentence_el.setAttribute('placeholder', get_translation('Your_timer_is_finished'));
						timer_speak_sentence_el.setAttribute('data-i18n-placeholder', 'Your_timer_is_finished');
						
						timer_speak_sentence_el.addEventListener('blur', () => {
							
							
							if(update_timer_speak_sentence(my_timer_index, timer_speak_sentence_el.value)){
								timer_speak_sentence_el.classList.add('success');
								setTimeout(() => {
									timer_speak_sentence_el.classList.remove('success');
								},300);
							}
							else{
								timer_speak_sentence_el.classList.add('fail');
								setTimeout(() => {
									timer_speak_sentence_el.classList.remove('fail');
								},300);
							}
							
						});
						
						timer_speak_sentence_wrapper_el.appendChild(timer_speak_sentence_el);
						
						
						let timer_speak_icon_el = document.createElement('img');
						timer_speak_icon_el.classList.add('timer-sentence-icon');
						timer_speak_icon_el.src = 'images/mouth.svg';
						
						
						timer_speak_sentence_wrapper_el.appendChild(timer_speak_icon_el);
						
						
						
						timer_footer_el.appendChild(timer_speak_sentence_wrapper_el);
						
	
						// Timer stop button
						let timer_stop_button_el = document.createElement('div');
						timer_stop_button_el.setAttribute('id','timer-stop-button-' + my_timer_index);
						timer_stop_button_el.classList.add('timer-stop-button');
						timer_stop_button_el.innerHTML = '<span class="unicode-icon">■</span>';
	
						timer_stop_button_el.addEventListener('click', () => {
							//console.log("clicked on stop timer button. my_timer_index: ", my_timer_index);
							stop_timer(my_timer_index);
							reset_timer(my_timer_index);
							timer_container_el.classList.add('timer-stopped');
						});

						timer_footer_el.appendChild(timer_stop_button_el);
						


						// Timer (re)start button
						let timer_start_button_el = document.createElement('div');
						timer_start_button_el.setAttribute('id','timer-start-button-' + my_timer_index);
						timer_start_button_el.classList.add('timer-start-button');
						timer_start_button_el.innerHTML = '<span class="unicode-icon">▶</span>';
	
						timer_start_button_el.addEventListener('click', () => {
							//console.log("clicked on start timer button. my_timer_index: ", my_timer_index);
							restart_timer(my_timer_index);
							timer_container_el.classList.remove('timer-stopped');
						});

						timer_footer_el.appendChild(timer_start_button_el);

						timer_container_el.appendChild(timer_footer_el);


						window.add_chat_message(window.timers[x].assistant,window.timers[x].assistant,window.timers[x].sentence,null,timer_container_el);
						if(window.timers[x].assistant == window.settings.assistant){
							window.scroll_chat_to_bottom();
						}
					}
				}
			
			}
		}
		window.timers_recreated = true;
		update_timers();
	
	}








	function update_timers(){

		// wait until the timer elements have been recreated
		if(window.timers_recreated == false){
			//console.warn("update_timers: waiting for Generate UI to have completed it's first run");
			return
		}
		
		//console.log("in update_timers");
		if(!Array.isArray(window.timers)){
			console.error("window.timers was not an array: ", window.timers);
			return
		}
		if(window.timers.length == 0){
			//console.log("timers list was empty");
			return;
		}
	
		const now_time = Date.now();
	
		for(let t = (window.timers.length - 1); t >= 0 ; --t){
			//console.log("timer: t: ", t);
			let details = window.timers[t];
			//console.log("timer details: ", details);
			const my_t = t;
		
			if(details && typeof details.timer_index != 'number'){
				//window.timers.splice(t,1);
				continue
			}
		
			if(details.to_time == null){
				continue
			}
			
		
			//console.log("update_timers: typeof details.to_time: ", typeof details.to_time, details.to_time);
		
			try{
				if(typeof details.to_time == 'string'){
					details.to_time = new Date(details.to_time);
				}
			}
			catch(err){
				console.error("update_timers: failed to regenerate the date object: ", err);
			}
			
		
			let delta = details.to_time - now_time;
			//console.log("timer delta: ", delta);
			
			
			const timer_el = document.getElementById('timer-' + details.timer_index);
			if(timer_el == null && delta < 0){
				//console.log("update_timers: no timer element for timer_index: ", details.timer_index)
				window.timers.splice(t,1);
				continue
			}
			
			
			if(delta >= 0 && delta < 1000){
				new Audio('./audio/timer_done_harp.mp3').play();
				//window.timers.splice(t,1);
				console.log("timer complete.  window.tts_tasks_left, details: ", window.tts_tasks_left, details);
				if(window.tts_tasks_left == 0){ // check_if_cached('speaker')
					
					timer_is_done_task = {
						'prompt':null,
						'origin':'chat',
						'assistant':'speaker',
						'type':'speak',
						'state':'should_tts',
						'desired_results':0,
						'results':[],
						'destination':'audio_player'
					}
					
					if(typeof details.speak_sentence == 'string'){
						if(details.speak_sentence.trim().length){
							timer_is_done_task['sentence'] = clean_up_string_for_speaking(details.speak_sentence);
						}else if(window.speaker_enabled){
							timer_is_done_task['sentence'] = get_translation('Your_timer_is_finished');
						}
						add_task(timer_is_done_task);
					}
					else if(window.speaker_enabled){
						timer_is_done_task['sentence'] = get_translation('Your_timer_is_finished');
						add_task(timer_is_done_task);
					}
					
				}
			
				stop_timer(details.timer_index);
				reset_timer(details.timer_index);
			
				const timer_container_el = document.getElementById('timer-container-' + details.timer_index);
				if(timer_container_el){
					timer_container_el.classList.add('timer-stopped');
				}
			
				continue
				
			}
			
			if(delta < 0){
				continue
			}
		
			
			
			let biggest_time = null;
			if(timer_el){
				
				const days = Math.floor(delta / (1000 * 60 * 60 * 24));
				const hours = Math.floor(delta / (1000 * 60 * 60));
				const minutes = Math.floor(delta/ (1000 * 60));
				const seconds = Math.floor(delta / 1000);

				const d = days;
				const h = hours - days * 24;
				const m = minutes - hours * 60;
				const s = seconds - minutes * 60;
				//console.log("update_timers: t, d,h,m,s: ",t, " -> ",d,h,m,s);
				
				if(timer_el.innerHTML.length < 3){
					
					let timer_html = '';
					if(days && d != 0){
						if(biggest_time == null){
							biggest_time = 'days';
						}
						timer_html += '<div class="timer-days"><span class="timer-number" id="timer-days-' +        details.timer_index + '">' + d + '</span><span class="timer-number-description" data-i18n="Days">' + get_translation('Days') + '</span></div>';
					}
					if(hours){
						if(biggest_time == null && h != 0){
							if(biggest_time == null){
								biggest_time = 'hours';
							}
							timer_html += '<div class="timer-hours"><span class="timer-number" id="timer-hours-' +      details.timer_index + '">' + h + '</span><span class="timer-number-description" data-i18n="Hours">' + get_translation('Hours') + '</span></div>';
						}
					}
					if(minutes){
						if(biggest_time == null){
							biggest_time = 'minutes';
						}
						timer_html += '<div class="timer-minutes"><span class="timer-number" id="timer-minutes-' +  details.timer_index + '">' + m + '</span><span class="timer-number-description" data-i18n="Minutes">' + get_translation('Minutes') + '</span></div>';
					}
			
					timer_html += '<div class="timer-seconds"><span class="timer-number" id="timer-seconds-' +  details.timer_index + '">' + s + '</span><span class="timer-number-description" data-i18n="Seconds">' + get_translation('Seconds') + '</span></div>' + 
					'</div><div class="timer-progress-container"><progress id="timer-progress-' + details.timer_index + '" value="0" max="' + delta + '"></progress></div>';
			
					if(biggest_time == null){
						biggest_time = 'seconds';
					}
			
					timer_html = '<div class="timer-numbers timer-for-' + biggest_time + '">' + timer_html;
			
					timer_el.innerHTML = timer_html;
			
				}
				else{
					if(typeof details.duration_time == 'number' && typeof delta == 'number'){
						update_timer_display(details.timer_index, d,h,m,s, details.duration_time - delta);
					}
				}
			}
			
		
		}
	}





	function update_timer_display(timer_index, d=0,h=0,m=0,s=0, progress=0){
		if(typeof timer_index != 'number'){
			return false
		}
		const timer_days_el = document.getElementById('timer-days-' + timer_index);
		if(timer_days_el){
			timer_days_el.innerText = d;
		}
		const timer_hours_el = document.getElementById('timer-hours-' + timer_index);
		if(timer_hours_el){
			timer_hours_el.innerText = h;
		}
		const timer_minutes_el = document.getElementById('timer-minutes-' + timer_index);
		if(timer_minutes_el){
			timer_minutes_el.innerText = m;
		}
		const timer_seconds_el = document.getElementById('timer-seconds-' + timer_index);
		if(timer_seconds_el){
			timer_seconds_el.innerText = s;
		}
		const timer_progress_el = document.getElementById('timer-progress-' + timer_index);
		if(timer_progress_el){
			timer_progress_el.value = progress;
		}
		return true
	}

	function stop_timer(timer_index){
		//console.log("in stop_timer.  timer_index: ", timer_index);
		if(typeof timer_index == 'number'){
			for(let t = (window.timers.length - 1); t >= 0 ; --t){
				if(window.timers[t].timer_index == timer_index){
					window.timers[t].to_time = null;
					return true;
				}
			}
		}
		return false
	}

	function reset_timer(timer_index){
		//console.log("in reset_timer.  timer_index: ", timer_index);
		if(typeof timer_index == 'number'){
			for(let t = (window.timers.length - 1); t >= 0 ; --t){
				if(window.timers[t].timer_index == timer_index){
					const days = Math.floor(window.timers[t].duration_time / (1000 * 60 * 60 * 24));
					const hours = Math.floor(window.timers[t].duration_time/ (1000 * 60 * 60));
					const mins = Math.floor(window.timers[t].duration_time / (1000 * 60));
					const secs = Math.floor(window.timers[t].duration_time / 1000);

					const d = days;
					const h = hours - days * 24;
					const m = mins - hours * 60;
					const s = secs - mins * 60;
				
					return update_timer_display(timer_index, d,h,m,s);
				}
			}
		}
		return false
	}
	
	

	function restart_timer(timer_index){
		//console.log("in restart_timer.  timer_index: ", timer_index);
	
		if(typeof timer_index == 'number'){
			const now_time = Date.now();
			for(let t = (window.timers.length - 1); t >= 0 ; --t){
				if(window.timers[t].timer_index == timer_index){
					window.timers[t].from_time = now_time;
					window.timers[t].to_time = now_time + window.timers[t].duration_time;
					return true;
				}
			}
		}
		return false
	}


	function update_timer_speak_sentence(timer_index, text){
		console.log("in update_timer_speak_sentence.  timer_index, text: ", text);
		if(typeof timer_index == 'number' && typeof text == 'string'){
			for(let t = (window.timers.length - 1); t >= 0 ; --t){
				if(window.timers[t].timer_index == timer_index){
					console.log("update_timer_speak_sentence: found it: ", window.timers[t]);
					window.timers[t].speak_sentence = text;
					return true;
				}
			}
		}
		return false
	}




	//function humanReadableTime(utcTimestamp, addPartOfDay) {
	function get_time_as_sentence(addPartOfDay=false) {
	    try {
	        //const localizedTimestamp = parseInt(utcTimestamp) + parseInt(this.secondsOffsetFromUTC);
	        //const hackyDateTime = new Date(localizedTimestamp);
	        const hackyDateTime = new Date();
			let hours = hackyDateTime.getHours();
	        let minutes = hackyDateTime.getMinutes();
        
			// Dutch
			if(window.settings.language == 'nl'){
			
				let comboWord = " over ";
		        let endWord = "";
		        let partOfDay = "";

		        // Minutes
		        if (minutes === 45) {
		          hours++;
		          comboWord = " voor ";
		          minutes = "kwart";
		        } else if (minutes > 45) {
		          hours++;
		          comboWord = " voor ";
		          minutes = 60 - minutes; // switches minutes to between 1 and 14, and increases the hour count
		        } else if (minutes === 0 && hours !== 24) {
		          comboWord = "";
		          minutes = "";
		          endWord = " uur";
		        } else if (minutes === 30) {
		          minutes = "half";
		        }

		        if (typeof minutes === "number") {
		          if (minutes === 1) {
		            minutes = "1 minuut";
		          } else {
		            minutes = minutes + " minuten";
		          }
		        }

		        // Hours
		        if (hours !== 12) {
		          hours = hours % 12;
		        }
		        if (hours === 0) {
		          hours = "middernacht";
		          endWord = "";
		        } 
				/*
				else if (hours === 12) {
		          hours = "noon";
		          endWord = "";
		        }
				*/
				else {
		          if (addPartOfDay) {
		            if (hackyDateTime.getHours() < 12) {
		              partOfDay = " 's morgens";
		            } else if (hackyDateTime.getHours() < 18) {
		              partOfDay = " 's middags";
		            } else if (hackyDateTime.getHours() < 24) {
		              partOfDay = " 's avonds";
				    }
		          }
		        }

		        const niceTime = minutes + comboWord + hours + endWord + partOfDay;

				//console.log("niceTime:", niceTime);

		        return "Het is " + niceTime;
			
			
			}
			
			// English
			else{
				let comboWord = " past ";
		        let endWord = "";
		        let partOfDay = "";

		        // Minutes
		        if (minutes === 45) {
		          hours++;
		          comboWord = " to ";
		          minutes = "a quarter";
		        } else if (minutes > 45) {
		          hours++;
		          comboWord = " to ";
		          minutes = 60 - minutes; // switches minutes to between 1 and 14, and increases the hour count
		        } else if (minutes === 0 && hours !== 24) {
		          comboWord = "";
		          minutes = "";
		          endWord = " o' clock";
		        } else if (minutes === 30) {
		          minutes = "half";
		        }

		        if (typeof minutes === "number") {
		          if (minutes === 1) {
		            minutes = "1 minute";
		          } else {
		            minutes = minutes + " minutes";
		          }
		        }

		        // Hours
		        if (hours !== 12) {
		          hours = hours % 12;
		        }
		        if (hours === 0) {
		          hours = "midnight";
		          endWord = "";
		        } else if (hours === 12) {
		          hours = "noon";
		          endWord = "";
		        } else {
		          if (addPartOfDay) {
		            if (hackyDateTime.getHours() < 12) {
		              partOfDay = " in the morning";
		            } else if (hackyDateTime.getHours() < 18) {
		              partOfDay = " in the afternoon";
		            } else if (hackyDateTime.getHours() < 24) {
		              partOfDay = " in the evening";
				    }
		          }
		        }

		        const niceTime = minutes + comboWord + hours + endWord + partOfDay;

		        console.log("niceTime:", niceTime);

		        return "It's " + niceTime;
			}
		
		
	    } catch (ex) {
			console.error("Error making human readable time: " + ex);
			return "Error making time";
	    }
	}

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	//
	//  GENERATE "CONTACTS LIST"
	//
	
	
	function generate_ui(){
		//console.log("in generate_ui");
		
		if(typeof window.assistants == 'undefined'){
			console.error("generate_ui: error, window.assistants was undefined");
			return false
		}
		
		let custom_saved_assistant_counter = 0;
		
		// TODO: this is very messy. Perhaps there should be a third source of truth that is a merger of window.assistants and window.settings.assistants, 
		// and that is updated when window.settings.assistants is updated/saved.
		for (const [assistant_id, details] of Object.entries(window.settings.assistants)) {
			if(assistant_id.startsWith('custom_saved_') && typeof window.assistants[assistant_id] == 'undefined'){
				//console.log("adding custom assistant to window.assistants: ", details);
				//window.assistants[assistant_id] = details;
				window.assistants[assistant_id] = {};
			}
		}
		
		contacts_list_el.innerHTML = '';
		chat_header_emoji_icon_container_el.innerHTML = '';
		
		
		let contact_details = ['name','description'];
		const busy_assistants = get_busy_assistants();
		//console.log("generate_ui: busy_assistants: ", busy_assistants);
		
		// Check if the current assistant is a clone with an original
		let loaded_clone_original = null;
		//console.log("generate_ui: window.currently_loaded_assistant: ", window.currently_loaded_assistant);
		//console.log("generate_ui: window.currently_loaded_web_llm_assistant: ", window.currently_loaded_web_llm_assistant);
		//console.log("generate_ui: window.currently_loaded_llama_cpp_assistant: ", window.currently_loaded_llama_cpp_assistant);
		

		if(typeof window.currently_loaded_llama_cpp_assistant == 'string' && window.currently_loaded_llama_cpp_assistant != '' && typeof window.settings.assistants[window.currently_loaded_llama_cpp_assistant] != 'undefined'){
			//console.log("generate_ui: LOADED LLAMA.CPP ASSISTANT: ", window.settings.assistants[window.currently_loaded_llama_cpp_assistant]);
		}
		
		
		if(typeof window.currently_loaded_llama_cpp_assistant == 'string' && window.currently_loaded_llama_cpp_assistant != '' && typeof window.settings.assistants[window.currently_loaded_llama_cpp_assistant] != 'undefined' && typeof window.settings.assistants[window.currently_loaded_llama_cpp_assistant]['clone_original'] == 'string' && window.settings.assistants[window.currently_loaded_llama_cpp_assistant]['clone_original'] != '' ){
			loaded_clone_original = window.settings.assistants[window.currently_loaded_llama_cpp_assistant]['clone_original'];
			//console.log("generate_ui: loaded clone original is a llama.cpp model: ", loaded_clone_original);
		}
		else if(typeof window.currently_loaded_web_llm_assistant == 'string' && window.currently_loaded_web_llm_assistant != '' && typeof window.settings.assistants[window.currently_loaded_web_llm_assistant] != 'undefined' && typeof window.settings.assistants[window.currently_loaded_web_llm_assistant]['clone_original'] == 'string' && window.settings.assistants[window.currently_loaded_web_llm_assistant]['clone_original'] != ''){
			loaded_clone_original = window.settings.assistants[window.currently_loaded_web_llm_assistant]['clone_original'];
			//console.log("generate_ui: loaded clone original is a web_llm model: ", loaded_clone_original);
		}
		else if(typeof window.currently_loaded_assistant == 'string' && window.currently_loaded_assistant.length && typeof window.settings.assistants[window.currently_loaded_assistant] != 'undefined' && typeof window.settings.assistants[window.currently_loaded_assistant]['clone_original'] == 'string' && window.settings.assistants[window.currently_loaded_assistant]['clone_original'] != '' ){
			loaded_clone_original = window.settings.assistants[window.currently_loaded_assistant]['clone_original'];
			//console.log("generate_ui: loaded clone original: ", loaded_clone_original);
		}
		
		if(loaded_clone_original != null){
			//console.log("generate_ui: loaded_clone_original: ", loaded_clone_original);
		}
		
		
		
		
		for (let [assistant_id, details] of Object.entries(window.assistants)) {
			//console.log("-------")
		  	//console.log(`${assistant_id} -> ${details}`);
			
			if(keyz(details).length == 0){
				if(typeof window.settings.assistants[assistant_id] != 'undefined'){
					details = window.settings.assistants[assistant_id];
				}
			}
			
			
			let clone_original_assistant_id = assistant_id;
			if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['clone_original'] == 'string' && !window.settings.assistants[assistant_id]['clone_original'].startsWith('custom')){
				clone_original_assistant_id = window.settings.assistants[assistant_id]['clone_original'];
			}
			
			if(assistant_id == 'custom_received' && !(window.settings.settings_complexity == 'developer')){ // window.settings.received_an_ai == true || 
				//console.log("generate_ui: not adding 'received' AI to contacts list");
				continue;
			}
			
			if(typeof window.conversations[assistant_id] == 'undefined'){
				window.conversations[assistant_id] = [];
			}
			if(typeof window.unread_messages[assistant_id] != 'number'){
				window.unread_messages[assistant_id] = 0;
			}
			
			
			
			// chat messages container
			let chat_pane_id = 'pane-content-' + assistant_id;
			let chat_pane_el = document.getElementById(chat_pane_id);
			if(chat_pane_el == null){
				chat_pane_el = document.createElement('div');
				chat_pane_el.setAttribute('id',chat_pane_id);
				chat_pane_el.classList.add('message-content-wrapper');
				
				// The chat messages are in an extra 'reverser' wrapper that lets CSS keep the latest added message in view automatically.
				chats_reverser_el = document.createElement('div');
				chats_reverser_el.setAttribute('id',chat_pane_id + '-reverser');
				chats_reverser_el.classList.add('message-content-reverser');
				
					chats_el = document.createElement('div');
					chats_el.setAttribute('id',chat_pane_id + '-chats');
					chats_el.classList.add('message-content');
				
					chats_reverser_el.appendChild(chats_el);
				
				chat_pane_el.appendChild(chats_reverser_el);
				
				// The status element shows hint about message being generated or audio being processed
				let chat_status_el = document.createElement('div');
				chat_status_el.setAttribute('id',chat_pane_id + '-status');
				chat_status_el.classList.add('message-status-container');
				
					let chat_status_div_el = document.createElement('div');
					chat_status_div_el.classList.add('message-status1');
					chat_status_el.appendChild(chat_status_div_el);
					let chat_status_div_el2 = document.createElement('div');
					chat_status_div_el2.classList.add('message-status2');
					chat_status_el.appendChild(chat_status_div_el2);
				
				chat_pane_el.appendChild(chat_status_el);
				
				message_container_el.appendChild(chat_pane_el);
				
			}
			
			
			
			//
			//  ASSISTANTS LIST IN SIDEBAR
			//
			
			// item in chat partners list sidebar
			let assistant_el = document.createElement('li');
			assistant_el.classList.add('contact-item');
			assistant_el.setAttribute('id','contact-item-' + assistant_id);
			
			if(assistant_id == 'developer'){
				assistant_el.classList.add('developer-ai');
			}
			
			if(assistant_id == window.settings.assistant){
				//console.log("this is the selected assistant");
				assistant_el.classList.add('selected-ai');
				chat_pane_el.classList.add('selected-pane');
				if(typeof window.translations[assistant_id + '_name'] != 'undefined'){
					chat_header_name_el.textContent = get_translation(assistant_id + '_name');
				}
				
			}
			else{
				chat_pane_el.classList.remove('selected-pane');
			}
			
			
			
			if(assistant_id == window.currently_loaded_assistant || assistant_id == window.currently_loaded_web_llm_assistant || assistant_id == window.currently_loaded_llama_cpp_assistant){
				assistant_el.classList.add('loaded-ai');
			}
			// Show all clones of the same model as loaded if one of them is
			
			if(typeof loaded_clone_original == 'string' && typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['clone_original'] == 'string' && window.settings.assistants[assistant_id]['clone_original'] != ''){
				//console.log("generate_ui: clone sibling loaded? ", window.settings.assistants[assistant_id]['clone_original'] , " =?= ", loaded_clone_original);
				
				// TODO: Show all of the clones as green (loaded) too. However, switching to a clone currently still reloads it.
				if(window.settings.assistants[assistant_id]['clone_original'] == loaded_clone_original){
					//assistant_el.classList.add('loaded-ai');
					
					window.settings.assistants[assistant_id]['clone_original']
				}
				
			}
			
			// Also the the clone's original as loaded
			if(typeof loaded_clone_original == 'string' && assistant_id == loaded_clone_original){
				assistant_el.classList.add('loaded-ai');
			}
			if(assistant_id.startsWith('ollama') && window.ollama_online == true){
				assistant_el.classList.add('loaded-ai');
			}
			
			
			
			if(assistant_id == 'custom_received' && window.settings.received_an_ai == 'true'){
				//assistant_el.classList.add('cached-ai');
			}
			
			let is_cached = check_if_cached(clone_original_assistant_id); // this also checks for clones, as clone_original_assistant_id
			//console.log("generate_ui: is_cached: ", assistant_id, is_cached);
			if(is_cached){
				assistant_el.classList.add('cached-ai');
			}
			

			if(typeof details.availability == 'string'){
				//console.log("details.availability: ", assistant_id, details.availability);
				assistant_el.classList.add('availability-' + details.availability);
			}
			else{
				//console.log("No availability data for: ", assistant_id);
			}
			
			
			if(typeof details.show_if_web_gpu == 'boolean' ){ // || ( typeof details.runner == 'string')
				if(details.show_if_web_gpu == true){
					assistant_el.classList.add('show-if-web-gpu');
				}
				else if(typeof details.show_if_web_gpu32 == 'boolean' && details.show_if_web_gpu32 == true){
					assistant_el.classList.add('show-if-web-gpu32');
				}
				else{
					assistant_el.classList.add('hide-if-web-gpu');
				}
			}
			if(typeof details.runner == 'string'){
				assistant_el.classList.add('runner-' + details.runner);
			}
			
			
			if(busy_assistants.indexOf(assistant_id) != -1){
				//console.log("adding busy-doing class to assistant");
				assistant_el.classList.add('busy-doing');
			}
			
			
			if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id]['champion'] != 'undefined' && !assistant_id.startsWith('custom')){
				assistant_el.classList.add('champion');
			}
			
			
			if(typeof details.runner == 'string' && details.runner == 'web_llm'){
				if(window.web_llm_assistants.indexOf(assistant_id) == -1){
					window.web_llm_assistants.push(assistant_id);
					//console.log("window.web_llm_assistants list is now: ", window.web_llm_assistants);
				}
			}
			
			
			if(typeof window.settings.assistants[assistant_id] == 'undefined' 
				|| (typeof window.settings.assistants[assistant_id] != 'undefined' 
					&& typeof window.settings.assistants[assistant_id].selected == 'boolean' 
					&& window.settings.assistants[assistant_id].selected == false
				)
			){
				// not selected
			}else{
				assistant_el.classList.add('selected');
			}
			
			
			assistant_el.addEventListener("click", (event) => {
				//console.log("clicked on assistant in sidebar. assistant_id: ", assistant_id);
				clicked_on_assistant(assistant_el,assistant_id,details);
			});
			
			
			
			
			// Add image
			
			
			let assistant_icon_wrapper_el = document.createElement('div');
			assistant_icon_wrapper_el.classList.add('sidebar-model-icon-container');
			
			let assistant_icon_inner_wrapper_el = document.createElement('div');
			assistant_icon_inner_wrapper_el.classList.add('sidebar-model-icon-inner-container');
			assistant_icon_inner_wrapper_el.classList.add('center');
			
			let assistant_icon_el = document.createElement('img');
			let image_src = assistant_id.replace('_32bit','');
			
			if(typeof window.assistants[image_src] != 'undefined' && typeof window.assistants[image_src].real_name == 'string'){
				assistant_icon_el.setAttribute('title',window.assistants[image_src].real_name);
			}
			
			if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['emoji'] == 'string'){
				//console.log("adding emoji as icon");
				let emoji_icon_el = document.createElement('div');
				emoji_icon_el.classList.add('emoji-icon-container');
				emoji_icon_el.classList.add('center');
				emoji_icon_el.innerText = window.settings.assistants[assistant_id]['emoji'];
				
				if(typeof window.settings.assistants[assistant_id]['emoji_bg'] == 'string' && window.settings.assistants[assistant_id]['emoji_bg'].length == 7 && window.settings.assistants[assistant_id]['emoji_bg'].startsWith('#')){
					emoji_icon_el.style['background-color'] = window.settings.assistants[assistant_id]['emoji_bg'];
				}
				
				if(assistant_id == window.settings.assistant){
					chat_header_emoji_icon_container_el.innerHTML = '';
					chat_header_emoji_icon_container_el.appendChild(emoji_icon_el.cloneNode(true));
				}
				
				assistant_icon_inner_wrapper_el.appendChild(emoji_icon_el);
				image_src = null;
			}
			else if(typeof window.assistants[image_src] != 'undefined' && typeof window.assistants[image_src].icon == 'string' && window.assistants[image_src].icon.length){
				image_src = window.assistants[image_src].icon;
				stop_assistant_button_assistant_icon_el.src = 'images/' + image_src + '_thumb.png';
				
				
			}
			else if(assistant_id.startsWith('custom_saved')){
				custom_saved_assistant_counter++;
				if(custom_saved_assistant_counter > 20){
					custom_saved_assistant_counter = 1;
				}
				image_src = 'custom_saved' + custom_saved_assistant_counter;
			}
			
			//assistant_icon_el.srcset = 'images/' + image_src + '.png 50w';
			//assistant_icon_el.src = 'images/generic.png';
			if(image_src != null){
				assistant_icon_el.src = 'images/' + image_src + '_thumb.png';
				assistant_icon_el.alt = assistant_id.replace('custom_saved_','') + ' icon';
				assistant_icon_el.setAttribute('data-assistant_id', assistant_id);
				assistant_icon_el.width = "30";
				assistant_icon_el.height = "30";
				assistant_icon_inner_wrapper_el.appendChild(assistant_icon_el);
			}
			
			assistant_icon_wrapper_el.appendChild(assistant_icon_inner_wrapper_el);
			
			
			
			//srcset="elva-fairy-320w.jpg, elva-fairy-480w.jpg 1.5x, elva-fairy-640w.jpg 2x"
			
			// Small circle to indicate which of the models is currently loaded
			let assistant_loaded_indicator_el = document.createElement('div');
			assistant_loaded_indicator_el.classList.add('assistant-loaded-indicator');
			assistant_icon_wrapper_el.appendChild(assistant_loaded_indicator_el);
			
			assistant_el.appendChild(assistant_icon_wrapper_el);
			
			if(assistant_id == window.settings.assistant){
				window.unread_messages[assistant_id] = 0;
			}
			
			// Unread messages indicator
			if(assistant_id != 'developer' && assistant_id != window.settings.assistant && typeof window.unread_messages[assistant_id] == 'number' && window.unread_messages[assistant_id] > 0){
				let assistant_unread_indicator_el = document.createElement('div');
				assistant_unread_indicator_el.classList.add('assistant-unread-indicator');
				assistant_unread_indicator_el.classList.add('center');
				if(window.unread_messages[assistant_id] > 99){
					window.unread_messages[assistant_id] = 99;
				}
				assistant_unread_indicator_el.textContent = window.unread_messages[assistant_id]
				assistant_icon_wrapper_el.appendChild(assistant_unread_indicator_el);
				assistant_el.appendChild(assistant_icon_wrapper_el);
			}
			
			
			
			
			// add contact details div
			let contact_el = document.createElement('div');
			contact_el.classList.add('contact');
			
			
			
			// Add more general details
			let details_copy = JSON.parse(JSON.stringify(details));
			//console.log("details_copy: ", details_copy);
			for (const details_key of Object.keys(details_copy)) {
				
				if(contact_details.indexOf(details_key) != -1){
					//console.log("adding contact detail: ", details_key);
					
					const i18n_code = assistant_id + '_' + details_key;
					//console.log("i18n_code: ", i18n_code);
					if(typeof window.translations[ i18n_code] != 'undefined'){
						details_copy[details_key] = get_translation(i18n_code);
					}
					
					let el = document.createElement('div');
					el.classList.add(details_key);
					
					el.setAttribute('id',assistant_id + '-contacts-' + details_key);
					//el.setAttribute('data-i18n',i18n_code);
					//el.classList.add('sidebar-assistant-' + details_key);
					let value = details_copy[details_key];
					if(details_key == 'size'){
						value = value + ' ' + translations['gigabytes'][window.settings.language];
						el.classList.add('show-if-developer');
					}
					
					let advanced_details = '';
					if(details_key == 'name'){
						
						let advanced_details_name_el = document.createElement('span');
						advanced_details_name_el.classList.add('nice-name');
						if(typeof details.custom_name == 'string'){
							//console.log("details.custom_name exists: ", details.custom_name);
							advanced_details_name_el.textContent = details.custom_name;
							
							if(assistant_id == window.settings.assistant){
								chat_header_name_el.textContent = details.custom_name;
							}
							
						}
						else if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['custom_name'] == 'string' ){
							//console.log("window.settings.assistants[assistant_id]['custom_name'] exists: ", window.settings.assistants[assistant_id]['custom_name']);
							//flash_message("found it");
							advanced_details_name_el.textContent = window.settings.assistants[assistant_id]['custom_name'];
						}
						else if(!assistant_id.startsWith('custom_saved_') && typeof i18n_code == 'string' && typeof window.translations[i18n_code] != 'undefined'){
							advanced_details_name_el.setAttribute('data-i18n',i18n_code);
							advanced_details_name_el.textContent = get_translation(i18n_code);
							
						}
						else {
							console.error("generate_ui: creating contact list name fell through (missing translation?). Details: ", details);
							advanced_details_name_el.textContent = '?';
						}
						
						el.appendChild(advanced_details_name_el);
						
						let advanced_details_real_name_el = null;
						if(typeof details_copy.real_name == 'string'){
							advanced_details_real_name_el = document.createElement('span');
							advanced_details_real_name_el.classList.add('real-name');
							advanced_details_real_name_el.classList.add('show-if-advanced');
							advanced_details_real_name_el.textContent = details_copy['real_name'];
							el.appendChild(advanced_details_real_name_el);
						}
						
					}
					else if(details_key == 'description'){
						
						let advanced_details_description_el = document.createElement('span');
						
						if(typeof details.custom_description == 'string'){
							//console.warn("generate_ui: LLM in assistants dict has custom description: ", details.custom_description);
							advanced_details_description_el.textContent = details.custom_description;
						}
						else if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['custom_description'] == 'string'){
							//console.log("generate_ui: spotted custom description: ", window.settings.assistants[assistant_id]['custom_description']);
							
							advanced_details_description_el.textContent = window.settings.assistants[assistant_id]['custom_description'];
						}
						else if(!assistant_id.startsWith('custom_saved_') && typeof i18n_code == 'string' && typeof window.translations[i18n_code] != 'undefined'){
							advanced_details_description_el.setAttribute('data-i18n',i18n_code);
							advanced_details_description_el.textContent = get_translation(i18n_code);
						}
						else if(assistant_id.startsWith('custom') && typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].download_url == 'string' && window.settings.assistants[assistant_id].download_url.indexOf('.gguf') != -1 && window.settings.assistants[assistant_id].download_url.indexOf('/') != -1){
							if(window.settings.assistants[assistant_id].download_url.endsWith('.gguf') && window.settings.assistants[assistant_id].download_url.indexOf('0000') == -1){
								let gguf_filename = window.settings.assistants[assistant_id].download_url.substr( window.settings.assistants[assistant_id].download_url.lastIndexOf('/') + 1);
								gguf_filename = gguf_filename.replaceAll('.gguf','');
								gguf_filename = gguf_filename.replaceAll('-',' ');
								gguf_filename = gguf_filename.replaceAll('_',' ');
								gguf_filename = gguf_filename.replace('.Q',' Q');
								if(gguf_filename.length > 4){
									details_text = gguf_filename;
									el.innerHTML = '<span>' + gguf_filename + '</span>';
									contact_el.appendChild(el);
									continue
								}
							}
						}

						else {
							console.error("generate_ui: creating contact list description fell through. Details: ", details);
							advanced_details_description_el.textContent = '?';
						}
						el.appendChild(advanced_details_description_el);
					}
					
					
					contact_el.appendChild(el);
				}
				else{
					//console.log("not adding this detail: ", details_key);
				}
			}
			
			
			
			// CHECK IF TOO BIG OR TOO SMALL FOR AVAILABLE MEMORY
			if( window.ram > 0 && !assistant_id.startsWith('custom') ){
				let required_memory = null; // in gigabytes
				if(typeof details.memory == 'number'){
					required_memory = details.memory;
				}
				if(typeof details.size == 'number'){
					required_memory = details.size * 1.2;
				}
				
				if(typeof required_memory == 'number'){
					required_memory = required_memory * 1000; // in Megabytes
					//console.log("RAM?: ", assistant_id, required_memory, window.ram);
					if(required_memory > window.ram){
						//console.log("too big: ", assistant_id);
						assistant_el.classList.add('too-big');
						
						too_big_el = document.createElement('div');
						too_big_el.classList.add('poor-memory-match-hint');
						too_big_el.classList.add('too-big-hint');
						too_big_el.textContent = get_translation('Too_big');
						too_big_el.setAttribute('data-i18n','Too_big');
						contact_el.appendChild(too_big_el);
						
					}
					else if(typeof details.media != 'undefined' && Array.isArray(details.media) && details.media.indexOf('text') != -1 && window.ram > 4000 && required_memory < 1000){
						//console.log("too small: ", assistant_id);
						//assistant_el.classList.add('too-small'); // hide AI models for very low memory systems (old phones)
						
						too_small_el = document.createElement('div');
						too_small_el.classList.add('poor-memory-match-hint');
						too_small_el.classList.add('too-small-hint');
						too_small_el.textContent = get_translation('Too_small');
						too_small_el.setAttribute('data-i18n','Too_small');
						contact_el.appendChild(too_small_el);
					}
				}
			}
			
			
			
			
			
			
			assistant_el.appendChild(contact_el);
			
			// Add checkbox for selecting active models
			
			let checkbox_container_el = document.createElement('div');
			checkbox_container_el.classList.add('assistants-checkbox-container');
			checkbox_container_el.innerHTML = `<div class="assistants-checkbox">
  <span>
    <svg width="12px" height="9px" viewbox="0 0 12 9">
      <polyline points="1 5 4 8 11 1"></polyline>
    </svg>
  </span>
</div>`
				
			
			assistant_el.appendChild(checkbox_container_el);
			
			contacts_list_el.appendChild(assistant_el);
			
			
		} // end of loop over all assistants
		
		// Now that the chat panes exist, they can be filled;
		if(window.generate_ui_first_run){
			window.generate_ui_first_run = false;
			setTimeout(recreate_timers,3000);
			//recreate_timers();
		}
	}
	window.generate_ui = generate_ui;
	
	
	// generate_ui helper functions
	
	function get_busy_tasks(){
		//console.log("in get_busy_tasks");
		let active_tasks = [];
		for(let t = 0; t < window.task_queue.length; t++){
			//console.log(typeof window.task_queue[t].index, window.task_queue[t].index, " =?= ", typeof task.index, task.index);
			if(typeof window.task_queue[t].state == 'string' && window.task_queue[t].state.startsWith('doing')){
				active_tasks.push(window.task_queue[t]);
			}
		}
		return active_tasks;
	}
	
	function get_busy_assistants(){
		//console.log("in get_busy_assistants");
		let busy_assistants = [];
		let active_tasks = get_busy_tasks();
		for(let t = 0; t < active_tasks.length; t++){
			if(typeof active_tasks[t].assistant == 'string' && busy_assistants.indexOf(active_tasks[t].assistant) == -1){
				busy_assistants.push(active_tasks[t].assistant);
			}
		}
		//console.log("busy_assistants: ", busy_assistants);
		return busy_assistants;
	}
	
	
	
	
	function clicked_on_assistant(assistant_el=null,assistant_id,details){
		document.body.classList.remove('hide-chat-form'); // show the prompt input area (developer 'assistant' has it hidden)
		
        try{
			if(document.body.classList.contains('busy-selecting-assistants')){
				
				if(typeof window.settings.assistants[assistant_id] == 'undefined'){
					window.settings.assistants[assistant_id] = {};
				}
				
				if(assistant_el.classList.contains('selected')){
					assistant_el.classList.remove('selected');
					window.settings.assistants[assistant_id]['selected'] = false;
				}
				else{
					assistant_el.classList.add('selected');
					window.settings.assistants[assistant_id]['selected'] = true;
				}
				save_settings();
				
				if(typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint')){
					//console.log("adding switch line to open blueprint document");
					insert_into_document({},'\n\nswitch assistant to ' + assistant_id + '\n\n');
				}
				
				
			}
			
			else{
				
				if(window.innerWidth < 981){
					close_sidebar();
				}
				window.switch_assistant(assistant_id);
			}
			
		}
		catch(err){
			console.error("caught error in clicked_on_assistant: ", err);
		}
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	// LANGUAGE INPUT
	function update_translation_input_select(input_language=null,desired_output_language=null){
		//console.log("in update_translation_input_select. input_language: ", input_language);
		//console.log(" - window.settings.input_language: ", window.settings.input_language);
		
		if( window.translation_languages== null){
			console.error("update_translation_input_select: window.translation_languages was null");
			return false
		}
		let input_languages = Object.keys(window.translation_languages);
		//console.log(" - input_languages.length: ", input_languages.length);
		
		//console.log("input_languages: ", input_languages);
		input_languages.sort();
		//console.log("sorted input_languages: ", input_languages);
		
		if(typeof input_language != 'string' && typeof window.settings.input_language == 'string' && input_languages.indexOf(window.settings.input_language) != -1){
			input_language = window.settings.input_language;
		}
		
		if(typeof input_language != 'string'){
			input_language = window.settings.language;
		}
		if(input_languages.indexOf(input_language) == -1){
			input_language = 'en'; // try English
		}
		if(input_languages.indexOf(input_language) == -1){
			input_language = 'nl'; // try Dutch
		}
		if(input_languages.indexOf(input_language) == -1){
			for(let fl = 0; fl < window.settings.favourite_translation_languages.length; fl++){
				//console.log("checking if favorite language can be used as dropdown default: ", window.settings.favourite_translation_languages[fl]);
				if(input_languages.indexOf(window.settings.favourite_translation_languages[fl]) != -1){
					input_language = window.settings.favourite_translation_languages[fl];
					break;
				}
			}
		}
		if(input_languages.indexOf(input_language) == -1){
			input_language = input_languages[0]; // if all else fails, fall back to using the first language in the list
		}
		//console.log("update_translation_input_select: final input_language: ", input_language);
		
		if(window.settings.input_language != input_language && window.microphone_enabled){
			window.preload_whisper({'assistant':window.settings.assistant},input_language);
		}
		
		window.settings.input_language = input_language;
		
		translation_input_language_select_el.innerHTML = '';
		for(let l = 0; l < input_languages.length; l++){
			let input_language_option_el = document.createElement('option');
			input_language_option_el.setAttribute('value',input_languages[l]);
			let nice_language_name = get_nice_language_name(input_languages[l]);
			if(nice_language_name == input_languages[l]){
				nice_language_name = nice_language_name.toUpperCase();
			}
			input_language_option_el.textContent = nice_language_name;
			if(input_languages[l] == input_language){
				//console.log("setting this input language as selected: ", input_language);
				input_language_option_el.setAttribute('selected',true);
			}
			
			// Show favourite languages at the top?
			//window.settings.favourite_translation_languages
			
			translation_input_language_select_el.appendChild(input_language_option_el);
		}
		
		update_translation_output_select(input_language, desired_output_language);
		
		save_settings();
		
		return true
	}
	
	
	
	// LANGUAGE OUTPUT
	function update_translation_output_select(input_language=null,output_language=null){
		//console.log("in update_translation_output_select.  input_language: ", input_language);
		if(typeof input_language != 'string'){
			input_language = translation_input_language_select_el.value;
			//console.log("update_translation_output_select: took input language from select: ", translation_input_language_select_el.value)
		}
		if(typeof window.translation_languages[input_language] == 'undefined'){
			console.error("update_translation_output_select: somehow select input language was missing from window.translation_languages. Falling back to English.");
			input_language = 'en';
		}
		
		
		
		if(typeof input_language == 'string' && typeof window.translation_languages[input_language] != 'undefined'){
			translation_output_language_select_el.innerHTML = '';
			let found_output_language = false;
			let possible_output_languages = keyz(window.translation_languages[input_language]);
			let output_languages = window.translation_languages[input_language];
			//console.log("update_translation_output_select: output_languages: ", output_languages);
			//console.log("update_translation_output_select: possible_output_languages: ", possible_output_languages);
			
			
			if(typeof output_language == 'string' && possible_output_languages.indexOf(output_language) != -1){
				//console.log("update_translation_output_select: OK, the initially provided output language can indeed be used with the current input language. input, output:", input_language,output_language);
			}
			else if(typeof window.settings.output_language == 'string' && possible_output_languages.indexOf(window.settings.output_language) != -1){
				//console.log("update_translation_output_select: OK, with the current input language (" + input_language + ") the previous window.settings.output_language is still an option after recreating the language output select: ",  window.settings.output_language);
				output_language = window.settings.output_language;
			
			}
			else{
				console.warn("update_translation_output_select: With the current input language (" + input_language + ") the previous output language is no longer available: ", window.settings.output_language, possible_output_languages);
			}
			
			if(output_language == null && possible_output_languages.indexOf(window.settings.language) != -1){ // try if the UI language is available
				//console.log("update_translation_output_select: setting output_language to the UI language: ", window.settings.language);
				output_language = window.settings.language;
			}
			
			if(output_language == null){ // try if a 'favourite' (recently selected) language is available
				//console.log("update_translation_output_select: going to try if a favourite language can be set as the output language: ", JSON.stringify(window.settings.favourite_translation_languages));
				for(let fl = 0; fl < window.settings.favourite_translation_languages.length; fl++){
					//console.log("update_translation_output_select: checking... ", window.settings.favourite_translation_languages[fl], "..in...", possible_output_languages);
					if(possible_output_languages.indexOf(window.settings.favourite_translation_languages[fl]) != -1){
						//console.log("update_translation_output_select: setting a favourite language as output language: ", window.settings.favourite_translation_languages[fl]);
						output_language = window.settings.favourite_translation_languages[fl];
						break;
					}
				}
			}
			
			if(output_language == null && possible_output_languages.indexOf('en') != -1 && input_language != 'en'){
				output_language = 'en';
			}
			if(output_language == null && possible_output_languages.indexOf('nl') != -1 && input_language != 'nl'){
				output_language = 'nl';
			}
			if(output_language == null){ // falling back to picking the first language in the output list
				console.warn("update_translation_output_select: falling back to picking the first language in the output list: ", possible_output_languages[0]);
				window.settings.output_language = possible_output_languages[0];
			}
			
			
			if(typeof output_language == 'string'){
				
				if(input_language == output_language){
					console.error("almost set the translation output language the same as the input language");
					output_language = possible_output_languages[0];
					window.settings.output_language = possible_output_languages[0];
				}
				
				window.settings.output_language = output_language;
			}
			else{
				console.warn("update_translation_output_select: failed to find a prefered new output language");
			}
				
				
			
			/*
			// If the currently loaded AI model is multi-lingual, add it's languages as translation options
			// UPDATE: Turns out these multi-lingual models aren't very good at translating...
			
			
			if(typeof window.settings.assistant == 'string' && typeof window.assistants[window.currently_loaded_assistant] != 'undefined' && typeof window.assistants[window.currently_loaded_assistant].languages != 'undefined'){
				//console.log("updating translation output language dropdown: adding extra languages supported by the current AI model: ", window.assistants[window.currently_loaded_assistant].languages);
				for(let l = 0; l < window.assistants[window.settings.assistant].languages.length; l++){
					
					let runner = 'llama_cpp';
					if(typeof window.assistants[window.currently_loaded_assistant].runner == 'string'){
						runner = window.assistants[window.currently_loaded_assistant].runner;
					}
					// Do not overwrite the data from the specialized models. Could make this a preference in settings.
					if(typeof output_languages[ window.assistants[window.currently_loaded_assistant].languages[l] ] == 'undefined'){
						output_languages[ window.assistants[window.currently_loaded_assistant].languages[l] ] = {
							'language':window.assistants[window.currently_loaded_assistant].languages[l],
							'runner':runner,
							'model_base':null,
							'model':window.settings.assistant
						}
					}
					
				}
			}
			*/
			
			// Create the select dropdown element
			//let language_keys = keyz(output_languages); // same as possible_output_languages
			possible_output_languages.sort();
			
			
			for(let l = 0; l < possible_output_languages.length; l++){
				if(typeof output_languages[ possible_output_languages[l] ]['language'] == 'string' && typeof output_languages[ possible_output_languages[l] ]['model'] == 'string' && output_languages[ possible_output_languages[l] ]['language'] != input_language){
					let output_language_option_el = document.createElement('option');
					//output_language_option_el.setAttribute('value',output_languages[ possible_output_languages[l] ]['model']);
					output_language_option_el.setAttribute('value',possible_output_languages[l]);
					
					//console.log("output_languages[ possible_output_languages[l] ]: ", output_languages[ possible_output_languages[l] ]);
					
					let nice_language_name = get_nice_language_name( output_languages[ possible_output_languages[l] ]['language'] );
					if(typeof nice_language_name == 'string' && nice_language_name == output_languages[ possible_output_languages[l] ]['language']){  //possible_output_languages[l]){
						nice_language_name = nice_language_name.toUpperCase();
					}
					
					if(window.settings.settings_complexity == 'developer'){
						if(typeof output_languages[ possible_output_languages[l] ].model == 'string'){
							if(output_languages[ possible_output_languages[l] ]['model'].indexOf('/mbart') != -1){
								nice_language_name += ' (mbart)';
							}
							else if(output_languages[ possible_output_languages[l] ]['model'].indexOf('/m2m') != -1){
								nice_language_name += ' (m2m)';
							}
							else{
								nice_language_name += ' (opus)';
							}
						}
					}
					
					output_language_option_el.textContent = nice_language_name; //output_languages[ possible_output_languages[l] ]['language'].toUpperCase();
					if(output_languages[ possible_output_languages[l] ]['language'] == window.settings.output_language){
						//console.log("update_translation_output_select: spotted selected output language while making dropdown, setting as selected: ", window.settings.output_language);
						output_language_option_el.setAttribute('selected',true);
						found_output_language = true;
					}
					translation_output_language_select_el.appendChild(output_language_option_el);
				}
			}
			
			if(found_output_language == false){
				console.warn("update_translation_output_select: Did not find output language? window.settings.output_language: ", window.settings.output_language);
				window.settings.output_language = null;
				save_settings();
				return false
			}
			else{
				//console.log("update_translation_output_select: update_translation_output_select: calling check_if_languages_can_be_flipped");
				check_if_languages_can_be_flipped();
			}
		}
		return true
	}
	
	function get_translation_model_details_from_select(lang=null){
		//console.log("in get_translation_model_details_from_select.  lang: ", lang);
		//console.log(" - get_translation_model_details_from_select. Dropdown values:  input: ", translation_input_language_select_el.value, ", output: ", translation_output_language_select_el.value);
		let target_lang = null;
		if(typeof lang == 'string'){
			//console.log(" get_translation_model_details_from_select: retrieving for provided language code: ", lang);
			target_lang = lang;
		}
		else{
			target_lang = translation_output_language_select_el.value;
		}
		return get_translation_model_details_from_languages(translation_input_language_select_el.value,target_lang);
	}
	window.get_translation_model_details_from_select = get_translation_model_details_from_select;
	
	
	function get_translation_model_details_from_languages(source_language, destination_language){
		if(typeof source_language == 'string' && typeof destination_language == 'string' && typeof window.translation_languages[source_language] != 'undefined' && typeof window.translation_languages[source_language][destination_language] != 'undefined'){
			return window.translation_languages[translation_input_language_select_el.value][destination_language];
		}
		console.error("get_translation_model_details_from_languages: could not find a match.  source_language,destination_language: ", source_language, destination_language);
		return null;
	}
	window.get_translation_model_details_from_languages = get_translation_model_details_from_languages;
	
	
	function check_if_languages_can_be_flipped(){
		const original_input_language = translation_input_language_select_el.value;
		const original_output_language = translation_output_language_select_el.value;
		//console.log("check_if_languages_can_be_flipped: original_input_language: ", original_input_language);
		//console.log("check_if_languages_can_be_flipped: original_output_language: ", original_output_language);
		
		// LANGUAGE FLIP
		// Check if the reverse translation would also be possible
		
		let input_languages = Object.keys(window.translation_languages);
		if(input_languages.indexOf(original_output_language) != -1){
			//console.log("Flip languages: OK so far, the output language is also available as an input language");
			let flipped_output_options = keyz(window.translation_languages[original_output_language]);
			//console.log("flipped_output_options: ", flipped_output_options);
			if(flipped_output_options.indexOf(original_input_language) != -1){
				//console.log("check_if_languages_can_be_flipped: OK, flipping the languages is possible");
				document.body.classList.add('reversable-languages');
				return
			}
			else{
				//console.log("check_if_languages_can_be_flipped: unfortunately these languages cannot be flipped");
			}
		}
		else{
			//console.log("check_if_languages_can_be_flipped: unfortunately the output language is not also available as an input language");
		}
		document.body.classList.remove('reversable-languages');
	}
	
	// Set initial translation language settings in the UI
	update_translation_input_select();
	
	
	
	
	// nr = left or right status element
	function set_chat_status(task, content='',nr){
		//console.log("in set_chat_status.  task,content,nr: ", task, content, nr);
		
		if(typeof nr == 'number' && (nr == 1 || nr == 2) ){
			//console.log("set_chat_status: valid nr was provided");
		}
		else if(typeof nr == 'undefined'){
			//console.log("set_chat_status: nr was undefined, setting it to 1");
			nr = 1;
		}
		else if(typeof nr == 'string' && isNaN(nr) && nr.length > 2){
			//console.warn("set_chat_status: nr was not a number: ", nr);
			if(nr == 'user'){
				nr = 2;
			}
			else{
				nr = 1;
			}
		}
		else{
			//console.log("set_chat_status: nr fell through, setting to 1");
			nr = 1;
		}
		//console.log("set_chat_status: final nr: ", nr);
		
		let assistant_id = null;//window.settings.assistant; //window.currently_loaded_assistant;
		if(typeof task != 'undefined' && task != null && typeof task.assistant == 'string'){
			assistant_id = task.assistant;
			/*
			if(nr == 1 && typeof task.markdown_enabled == 'boolean' && task.markdown_enabled){
				//console.log("f: applying markdown");
				content = apply_markdown(content);
			}
			*/
		}
		
		if(assistant_id){
			const selector_line = '#pane-content-' + assistant_id + '-status .message-status' + nr;
			let status_el = document.querySelector(selector_line);
			if(status_el){
				if(content != '' && !content.startsWith('<div')){
					if(nr == 2){
						let old_text = status_el.textContent;
						if(old_text.length > 120){
							old_text = '...' + old_text.substr(old_text.length - 100);
						}
						if(old_text.indexOf('(') == -1 && old_text.indexOf(')') == -1 && old_text.indexOf('[') == -1 && old_text.indexOf(']') == -1){
							content = old_text + content;
						}
						
					}
					else{
						content =  '<div class="width100">' + content.trim() + '</div>';
					}
					
				}
				status_el.innerHTML = content;
			}
			else{
				console.error("set_chat_status: could not find status element: ", selector_line);
			}
		}
		
		else{
			console.error("set_chat_status: cannot update status element. Task did not have an assistant property.  task: ", task);
		}
		
	}
	window.set_chat_status = set_chat_status;
	
	
	
	
	
	
function set_speaker_progress(progress) {
	speaker_icon_el.style.background =
    "conic-gradient(var(--button-bg) " +
    progress +
    "%,var(--button-warning-bg) " +
    progress +
    "%)";
}
set_speaker_progress(100);




let task_list_update_timeout = null;
//let last_time_pushed_overview_time = Date.now();
function update_task_overview(){
	//console.log("in update_task_overview");
	
	if(task_list_update_timeout != null){
		clearTimeout(task_list_update_timeout);
		task_list_update_timeout = null;
	}
	if(window.settings.left_sidebar_open){
		task_list_update_timeout = setTimeout(do_overviews,500);
	}

}
window.update_task_overview = update_task_overview;

function do_overviews(){
	generate_task_overview();
	if(window.settings.settings_complexity == 'developer'){
		generate_running_tasks_overview();
	}
}




function generate_running_tasks_overview(){
	console.log("in generate_running_tasks_overview. window.current_tasks: ", window.current_tasks);
	if(window.settings.settings_complexity != 'developer'){
		return;
	}
	running_tasks_list_el.innerHTML = '';
	let running_tasks_el = document.createElement('ul');
	let idle = true;
	for (const [task_type,details] of Object.entries(window.current_tasks)){
		
		let running_tasks_item = document.createElement('li');
		running_tasks_item.classList.add('running-tasks-item');
		//running_tasks_item.classList.add('hint-area');
		
		idle = false;
		
		let interesting = ['assistant','type','state','origin','destination'];
		for (let i = 0; i < interesting.length; i++){
			const attr = interesting[i];
			//console.log("attr: ", attr);
			interesting_el = document.createElement('div');
			
			interesting_el.classList.add('running-tasks-item-' + attr);
			if(typeof details[attr] == 'string' || typeof details[attr] == 'number'){
				if(attr == 'assistant'){
					if(window.settings.settings_complexity == 'developer'){
						interesting_el.textContent = details[attr];
					}
					else{
						interesting_el.textContent = get_translation(details[attr] + '_name');
					}
				}
				else{
					if(window.settings.settings_complexity == 'developer'){
						interesting_el.textContent = details[attr];
					}else{
						interesting_el.textContent = get_translation(details[attr]);
					}
				}
			}
			interesting_el.textContent = " - " + attr + ": " + interesting_el.textContent;
			running_tasks_item.appendChild(interesting_el);
		}
		running_tasks_el.appendChild(running_tasks_item);
	}
	running_tasks_list_el.innerHTML = '';
	if(idle == false){
		running_tasks_list_el.appendChild(running_tasks_el);
	}
	
}



function generate_task_overview(){
	//console.log("in generate_task_overview");
	
	generate_ui();
	
	
	// Also update the indicator of used memory
	window.check_memory({},true);
	
	if(window.update_task_viewer == false){
		console.warn("window.update_task_viewer was false, not updating task overview");
		return
	}
	
	
	if(window.update_simple_task_list){
		simple_tasks_list_el.innerHTML = '';
		document.body.classList.remove('simple-task-list-paused');
	}
	else{
		//console.log("updating simple task list is disabled");
		document.body.classList.add('simple-task-list-paused');
		return
	}
	
	
	let do_complex_too = false;
	/*
	if(document.body.classList.contains('developer')){
		do_complex_too = true;
	}
	*/
	
	
	let sorting_states = ['order_of_creation'];
	if(simple_tasks_ordering == 'state'){
		sorting_states = ['added','active','completed','interrupted','failed'];
	}

	let sorting_list_els = {};
	for(let q = 0; q < sorting_states.length; q++){
		sorting_list_els[ sorting_states[q] ] = document.createElement('ul');
	}
	
	if(typeof task_overview_el != 'undefined' && task_overview_el != null){
		task_overview_el.innerHTML = '';
	}
	
	for(let t = 0; t < window.task_queue.length; t++){
		
		const my_task = window.task_queue[t];
		
		
		if(typeof window.task_queue[t].type != 'string' || typeof window.task_queue[t].state != 'string'){
			console.error("generate_task_overview: task did not have valid type and/or state: ", window.task_queue[t]);
			continue;
		}
		
		// SIMPLE 
		//if(window.update_simple_task_list && document.body.classList.contains('sidebar-settings') && document.body.classList.contains('sidebar-settings-show-tasks'))
		//console.log("updating simple tasks list in sidebar");
		let simple_task_el = document.createElement('li');
		simple_task_el.classList.add('simple-task-item');
		if(typeof window.task_queue.index == 'number'){
			simple_task_el.setAttribute('id','simple-task-item' + window.task_queue.index);
		}
		
	
		let simple_task_details_el = document.createElement('details');
		let simple_task_summary_el = document.createElement('summary');
		let simple_task_details_container_el = document.createElement('div');
		simple_task_details_el.appendChild(simple_task_summary_el);
		simple_task_el.appendChild(simple_task_details_el);
	
		
		
		// Add some classes to help visually distinguish
		simple_task_el.classList.add('simple-task-item-type-' + window.task_queue[t].type);
		simple_task_el.classList.add('simple-task-item-state-' + window.task_queue[t].state);
	
		if(typeof window.task_queue[t].origin == 'blueprint'){
			simple_task_el.classList.add('simple-task-item-origin-blueprint');
		}
		
		if(window.task_queue[t].state.startsWith('doing_') || window.task_queue[t].state.startsWith('should_')){
			simple_task_el.classList.add('simple-task-item-currently-doing');
			simple_task_details_el.open = true;
		}
		
		
		
		// Add a progress indicator to task summary element if multiple results are desired
		if(typeof window.task_queue[t].results == 'object' && Array.isArray(window.task_queue[t].results) && typeof window.task_queue[t].desired_results == 'number' && window.task_queue[t].desired_results > 1){
			let simple_results_progress_el = document.createElement('div');
			simple_results_progress_el.classList.add('simple-task-results-progress');
		
			for(let p = 0; p < window.task_queue[t].desired_results; p++){
				let simple_results_progress_indicator_el = document.createElement('span');
				simple_results_progress_indicator_el.classList.add('simple-task-results-progress-indicator');
				if(typeof window.task_queue[t].results[p] != 'undefined' && typeof window.task_queue[t].results[p] == 'object' && window.task_queue[t].results[p] != null){
					
					if(typeof window.task_queue[t].results[p].state == 'string'){
						//console.log("generate_task_overview: setting task result (p = " + p + ") progress indicator to: ", window.task_queue[t].results[p].state);
						simple_results_progress_indicator_el.classList.add('simple-task-results-progress-indicator-' + window.task_queue[t].results[p].state);
					}
				}
				simple_results_progress_el.appendChild(simple_results_progress_indicator_el);
			}
			
			if(window.task_queue[t].desired_results != 10000){
				simple_results_progress_el.innerHTML = '<span class="simple-task-results-progress-current">' + window.task_queue[t].results.length  + '</span><span class="simple-task-results-progress-divider">/</span><span class="simple-task-results-progress-desired">' + window.task_queue[t].desired_results + '</span>';
				simple_task_summary_el.appendChild(simple_results_progress_el);
			}
			
		}
		
		if(window.task_queue[t].state === 'parent'){
			simple_task_el.classList.add('simple-task-item-parent');
		}
		
		
		
		
		
		
		
		
	
		// Add type to task summary element
		let simple_type_el = document.createElement('span');
		simple_type_el.classList.add('simple-task-type');
		
		let simple_type_name_el = document.createElement('span');
		simple_type_name_el.classList.add('simple-task-type-name');
		
		simple_type_name_el.textContent = get_translation( window.task_queue[t].type );
		if(window.settings.settings_complexity == 'developer'){
			simple_type_name_el.textContent = window.task_queue[t].index + '. ' + get_translation( window.task_queue[t].type );
		}
		
		
		if(typeof window.task_queue[t].parent_index == 'number'){
			simple_task_el.classList.add('simple-task-item-child');
			let simple_task_item_child_indicator_el = document.createElement('span');
			simple_task_item_child_indicator_el.classList.add('simple-task-item-child-indicator');
			simple_task_item_child_indicator_el.textContent = '╰';
			simple_type_el.appendChild(simple_task_item_child_indicator_el);
		}
		
		
		
		if(typeof window.task_queue[t].demo_audio != 'undefined'){
			let play_audio_demo_button_el = document.createElement('span');
			play_audio_demo_button_el.classList.add('mini-play-audio-button');
			play_audio_demo_button_el.textContent = '▶';
			play_audio_demo_button_el.addEventListener('click', (event) => {
				event.stopPropagation();
				event.preventDefault();
				if(typeof window.task_queue[t] != 'undefined' && typeof window.task_queue[t].demo_audio != 'undefined'){
					window.play_float32_array_as_audio(window.task_queue[t].demo_audio);
				}
				
			});
			simple_type_el.appendChild(play_audio_demo_button_el);
		}
		
		
		
		simple_type_el.appendChild(simple_type_name_el);
		simple_task_summary_el.appendChild(simple_type_el);
		
		
		
		
		
		
		
		
	
		// Add state to task summary element
		let simple_state_el = document.createElement('span');
		simple_state_el.classList.add('simple-task-state');
		//let assistant_icon_html = '';
		let assistant_icon_el = document.createElement('img');
		assistant_icon_el.classList.add('simple-task-item-state-assistant-icon');
		
		if(typeof window.task_queue[t].assistant == 'string'){
			if(window.task_queue[t].assistant.startsWith('custom_saved')){
				if(typeof window.settings.assistants[window.task_queue[t].assistant] != 'undefined' && typeof window.settings.assistants[window.task_queue[t].assistant].emoji == 'string'){
					let assistant_emoji_icon_el = document.createElement('div');
					assistant_emoji_icon_el.classList.add('simple-task-item-state-assistant-icon');
					assistant_emoji_icon_el.classList.add('simple-task-item-state-assistant-emoji-icon');
					assistant_emoji_icon_el.textContent = window.settings.assistants[window.task_queue[t].assistant].emoji;
					if(typeof window.settings.assistants[window.task_queue[t].assistant].emoji_bg == 'string'){
						assistant_emoji_icon_el.style.background = window.settings.assistants[window.task_queue[t].assistant].emoji_bg;
					}
					simple_state_el.appendChild(assistant_emoji_icon_el);
				}
			}
			else{
				assistant_icon_el.src = 'images/' + window.task_queue[t].assistant.replace('_32bit','') + '_thumb.png';
				
				if(typeof window.settings.assistants[window.task_queue[t].assistant] != 'undefined' && typeof window.settings.assistants[window.task_queue[t].assistant].icon == 'string' && window.settings.assistants[window.task_queue[t].assistant].icon.length){
					assistant_icon_el.src = 'images/' + window.settings.assistants[window.task_queue[t].assistant].icon + '_thumb.png';
				}
				else if(typeof window.assistants[window.task_queue[t].assistant] != 'undefined' && typeof window.assistants[window.task_queue[t].assistant].icon == 'string' && window.assistants[window.task_queue[t].assistant].icon.length){
					assistant_icon_el.src = 'images/' + window.assistants[window.task_queue[t].assistant].icon + '_thumb.png';
				}
				
				assistant_icon_el.setAttribute('alt',get_translation(window.task_queue[t].assistant.replace('_32bit','') + '_name'));
				//assistant_icon_html = '<img src="images/' + window.task_queue[t].assistant.replace('_32bit','') + '.png" class="simple-task-item-state-assistant-icon"/>';
				const my_assistant_id = window.task_queue[t].assistant;
				assistant_icon_el.addEventListener('click', () => {
					window.switch_assistant(my_assistant_id);
				});
				simple_state_el.appendChild(assistant_icon_el);
			}
			
		}
		
		let state_el = document.createElement('span');
		state_el.classList.add('unicode-icon');
		state_el.classList.add('simple-task-item-state-icon');
		
		if(window.task_queue[t].state == 'completed'){
			state_el.textContent = '✅';
		}
		else if(window.task_queue[t].state == 'interrupted'){
			state_el.innerHTML = '🛑<span class="unicode-icon-overlay">✋</span>';
		}
		else if(window.task_queue[t].state == 'failed'){
			state_el.textContent = '💥';
		}
		else if(window.task_queue[t].state.startsWith('doing_') || window.task_queue[t].state == 'parent'){
			state_el.innerHTML = '<span class="spinner"></span>';
		}
		else{
			state_el.textContent = '🫸'; //window.get_translation( window.task_queue[t].state.replace('should_','') );
			//simple_state_el.innerHTML = assistant_icon_html + '<span>' + window.get_translation( window.task_queue[t].state.replace('doing_','') ) + '</span>';
		}
		
		
		simple_state_el.appendChild(state_el);
		
		
		
		let close_button_container_el = document.createElement('span');
		close_button_container_el.classList.add('unicode-icon');
		close_button_container_el.classList.add('kill-task-icon');
		close_button_container_el.textContent = '×';
		close_button_container_el.addEventListener('click',() => {
			
			
			if(my_task.state.startsWith('should_')){
				window.change_tasks_with_parent_index(my_task,'interrupted');
				clean_up_dead_task(my_task,'interrupted');
			}
			if(window.current_task != null && typeof window.current_task.index == 'number' && typeof my_task.index == 'number' && my_task.index == window.current_task.index){
				window.stop_assistant(my_task);
				handle_completed_task(my_task,false,{'state':'interrupted'});
			}
			simple_task_summary_el.classList.add('simple-task-results-interrupting');
			
			if(typeof my_task.state == 'string' && window.irrelevant_task_states.indexOf(my_task.state) == -1){
				window.handle_completed_task(my_task,false,{'state':'interrupted'});
			}
			change_tasks_with_parent_index(my_task);
			update_task_overview();
		});
		simple_state_el.appendChild(close_button_container_el);
		simple_task_summary_el.appendChild(simple_state_el);
	

		
		/// show the prompt or the sentence to speak in the details
		let sentence_text_el = document.createElement('p');
		sentence_text_el.classList.add('simple-task-details-sentence');
		if(typeof my_task.index == 'number'){
			sentence_text_el.setAttribute('id','simple-task-details-sentence' + my_task.index);
		}
		//simple_task_details_el.appendChild(simple_task_summary_el);
		if(typeof window.task_queue[t].raw_prompt == 'string'){
			sentence_text_el.classList.add('simple-task-details-prompt');
			sentence_text_el.textContent = window.task_queue[t].raw_prompt;
			simple_task_details_container_el.appendChild(sentence_text_el);
		}
		else if(typeof window.task_queue[t].prompt == 'string'){
			sentence_text_el.classList.add('simple-task-details-prompt');
			sentence_text_el.textContent = window.task_queue[t].prompt;
			simple_task_details_container_el.appendChild(sentence_text_el);
		}
		else if(window.task_queue[t].type == 'speak' && typeof window.task_queue[t].sentence == 'string'){
			sentence_text_el.textContent = window.task_queue[t].sentence;
		}
		else if(typeof window.task_queue[t].transcription == 'string'){
			sentence_text_el.textContent = window.task_queue[t].transcription.substr(0,50);
		}
		else if(typeof window.task_queue[t].sentence == 'string'){
			sentence_text_el.textContent = window.task_queue[t].sentence.substr(0,50);
		}
		else if(typeof window.task_queue[t].text == 'string'){
			sentence_text_el.textContent = window.task_queue[t].text.substr(0,50);
		}
		
		else if(typeof window.task_queue[t].transcript == 'string'){
			sentence_text_el.textContent = window.task_queue[t].transcript;
		}
		else{
			sentence_text_el.textContent = '';
		}

		simple_task_details_container_el.appendChild(sentence_text_el);
		
		simple_task_details_el.appendChild(simple_task_summary_el);
		simple_task_details_el.appendChild(simple_task_details_container_el);
		simple_task_el.appendChild(simple_task_details_el);
		
		if(typeof window.task_queue[t].index == 'number'){
			let children_container_el = document.createElement('div');
			children_container_el.classList.add('simple-task-children-container');
			children_container_el.setAttribute('id','simple-task-children-container' + window.task_queue[t].index);
		
			simple_task_el.appendChild(children_container_el);
		}
		
		

		if(simple_tasks_ordering == 'index'){
			sorting_list_els['order_of_creation'].appendChild(simple_task_el);
		}
		else if(simple_tasks_ordering == 'state'){
			
			if(typeof sorting_list_els[window.task_queue[t].state] != 'undefined'){
				sorting_list_els[window.task_queue[t].state].appendChild(simple_task_el);
			}
			else{
				sorting_list_els['active'].appendChild(simple_task_el);
			}
		}
		
		
		
		
		
		// COMPLEX
		
		if(typeof task_overview_el != 'undefined' && task_overview_el != null && do_complex_too){
			let task_el = document.createElement('ul');
			task_el.classList.add('task');
		
			for (const [key, value] of Object.entries(window.task_queue[t])) {
			
				//console.log("value: ", typeof value, value);
				let property_el = document.createElement('li');
				property_el.classList.add('task-property');
				property_el.classList.add('task-property-' + key);
			
				let key_el = document.createElement('span');
				key_el.classList.add('task-key');
				key_el.textContent = key;
				property_el.appendChild(key_el);
		
				let content = null;
		
				if(typeof value == 'string'|| typeof value == 'number'){
					content = '' + value;
				}
				else if(typeof value == 'boolean'){
					if(value){
						content = 'TRUE';
					}else{
						content = 'FALSE';
					}
				}
				else if(value == null){
					content = 'null';
				}
				else if(Array.isArray(value)){
					content = 'length: ' + value.length;
				}
				else if(typeof value == 'object'){
					content = JSON.stringify(value,null,4);
				}
				else{
					//console.error("generate_task_overview: spotted something unexpected in a task: ", key, value);
				}
				//console.log("final content: ", typeof content, content);
			
				if(content == null || typeof content != 'string'){
					content = 'UNEXPECTED VALUE (OBJECT?)';
				}
		
				let value_el = document.createElement('span');
				value_el.classList.add('task-value');
				value_el.textContent = content;
				property_el.appendChild(value_el);
		
				task_el.appendChild(property_el);
			}
			task_overview_el.appendChild(task_el);
		}
		
	}
	
	// Went through all the tasks, attaching simple items to various lists. Now append each resulting list to the sidebar.
	for (const [ordering_name, ordering_element] of Object.entries(sorting_list_els)) {
		//console.log("simple tasks list: ordering_name: ", ordering_name);
		if(ordering_element.innerHTML != ''){
			// Append sorted task list title
			let simple_task_state_name_el = document.createElement('div');
			simple_task_state_name_el.classList.add('simple-task-state-name');
			simple_task_state_name_el.textContent = get_translation(ordering_name);
			simple_tasks_list_el.appendChild(simple_task_state_name_el);
		
			// Append sorted task list
			simple_tasks_list_el.appendChild(ordering_element);
		}
		
	}
}
window.generate_task_overview = generate_task_overview;







if(localStorage.getItem('message_form_container_height')){
	const starting_message_form_height = localStorage.getItem('message_form_container_height');
	//console.log("starting message form height found in local storage: ", starting_message_form_height);
	message_form_container_el.style.height = starting_message_form_height + 'px';
	
	if(starting_message_form_height > window.chat_footer_transition_threshold_height){
		document.body.classList.add("chat-message-form-more-height");
	}
	if(starting_message_form_height >= 300){
		document.body.classList.add("chat-message-form-maximum-height");
	}
	if(starting_message_form_height <= 94){
		document.body.classList.add("chat-message-form-minimum-height");
	}
}

if(message_form_container_el.style.height == '300px'){
	//console.log("chat message form stretched to maximum height of 300px");
	document.body.classList.add("chat-message-form-maximum-height");
}
else{
	document.body.classList.remove("chat-message-form-maximum-height");
}



// RESIZE DRAG
// resize code output

message_form_resize_handle_el.addEventListener("touchstart", start_message_form_drag, {passive: true});

message_form_resize_handle_el.addEventListener("touchleave", stop_message_form_drag,{passive: true});

function form_drag_touch_leave(e){
	//console.log("form_drag_touch_leave: e: ", e);
}
/*
  el.addEventListener("touchcancel", handleCancel, false);
  el.addEventListener("touchleave", handleEnd, false);
  el.addEventListener("touchmove", handleMove, false);
*/

message_form_resize_handle_el.addEventListener('mousedown', start_message_form_drag, true);

let message_form_resize_start_y = null;
let message_form_resize_start_height = null;

function get_client_y_from_event(e){
	if(e.clientY){
		return e.clientY;
	}
	else if(typeof e.touches != 'undefined' && typeof e.touches[0] != 'undefined' && typeof e.touches[0].clientY == 'number'){
		return e.touches[0].clientY;
	}
	return null;
}


function start_message_form_drag(e) {
	//console.log("in start_message_form_drag. e: ", e);
	let client_y = get_client_y_from_event(e);
	if(e.clientY){
	    message_form_resize_start_y = client_y;
		//console.log("message form resize init drag: startY: ", message_form_resize_start_y);
	    message_form_resize_start_height = parseInt(document.defaultView.getComputedStyle(message_form_container_el).height, 10);
		//console.log("message form resize init drag: start_height: ", message_form_resize_start_height);
	    document.documentElement.addEventListener('mousemove', do_message_form_drag, false);
	    document.documentElement.addEventListener('mouseup', stop_message_form_drag, false);
	}
	else if(typeof e.touches != 'undefined' && typeof e.touches[0] != 'undefined' && typeof e.touches[0].clientY == 'number'){
		message_form_resize_start_y = e.touches[0].clientY;
		//message_form_resize_start_height = e.touches[0].clientY;
		message_form_resize_start_height = parseInt(document.defaultView.getComputedStyle(message_form_container_el).height, 10);
		document.documentElement.addEventListener('touchmove', do_message_form_drag, false);
		document.documentElement.addEventListener("touchend", stop_message_form_drag, false);
	}
	else{
		console.error("start_message_form_drag: could not find a .clientY. event: ", e);
	}
	
}

function do_message_form_drag(e) {
	//console.log("in do_message_form_drag");
	let client_y = get_client_y_from_event(e);
	//console.log("client_y: ", client_y);
	//console.log("message_form_resize_start_height: ", message_form_resize_start_height);
	//console.log("message_form_resize_start_y: ", message_form_resize_start_y);
	let new_form_height = (message_form_resize_start_height - client_y + message_form_resize_start_y);
	
	if(new_form_height > 300){
		new_form_height = 300;
	}
	/*
	if(window.settings.assistant.startsWith('image_to_text') && new_form_height < 201){
		new_form_height = 201;
	}
	*/
	
	if(new_form_height < 94){
		new_form_height = 94;
	}
	//console.log("new_form_height: ", new_form_height);
	
    message_form_container_el.style.height = new_form_height + 'px';
	//message_form_container_el.style['min-height'] = (message_form_resize_start_height - e.clientY + message_form_resize_start_height) + 'px';
	//console.log("message_form_container_el.style.height ", message_form_container_el.style.height,  client_y);
	
	if(new_form_height == 300){
		//console.log("chat message form stretched to maximum height of 300px");
		document.body.classList.add("chat-message-form-maximum-height");
	}
	else{
		document.body.classList.remove("chat-message-form-maximum-height");
	}
	
	if(new_form_height > window.chat_footer_transition_threshold_height){
		document.body.classList.add("chat-message-form-more-height");
	}
	else{
		document.body.classList.remove("chat-message-form-more-height");
	}
	
	if(new_form_height == 94){
		document.body.classList.add('chat-message-form-minimum-height');
	}
	else{
		document.body.classList.remove('chat-message-form-minimum-height');
	}
	
}



function stop_message_form_drag(e) {
	//console.log("in stop_message_form_drag");
	let client_y = get_client_y_from_event(e);
	//console.log("client_y: ", client_y);
    document.documentElement.removeEventListener('mousemove', do_message_form_drag, false);
    document.documentElement.removeEventListener('mouseup', stop_message_form_drag, false);
    document.documentElement.removeEventListener('touchmove', do_message_form_drag, false);
    document.documentElement.removeEventListener('touchend', stop_message_form_drag, false);
	
	let final_height = parseInt(message_form_container_el.style.height);
	//console.log("final_height: ", final_height);
	//console.log("stop_message_form_drag: message_form_container_el.style.height: ", message_form_container_el.style.height,  client_y);
	if(final_height == 300){
		//console.log("chat message form stretched to maximum height of 300px");
		document.body.classList.add("chat-message-form-maximum-height");
	}
	else{
		document.body.classList.remove("chat-message-form-maximum-height");
	}
	
	if(final_height > window.chat_footer_transition_threshold_height){
		document.body.classList.add("chat-message-form-more-height");
	}
	else{
		document.body.classList.remove("chat-message-form-more-height");
	}
	
	if(final_height == 94){
		document.body.classList.add('chat-message-form-minimum-height');
	}
	else{
		document.body.classList.remove('chat-message-form-minimum-height');
	}
	
	localStorage.setItem('message_form_container_height', final_height); //message_form_resize_start_height - client_y + message_form_resize_start_y);
   
}




// SHOW FILES TAB (if sidebar already open)
window.show_files_tab = function (){
	//console.log("in show_files_tab");
	if(document.body.classList.contains('sidebar')){
		document.body.classList.remove('sidebar-chat');
		document.body.classList.remove('sidebar-settings');
	}
} 






let speaker_voice_button_els = document.getElementById('speaker-voice-buttons').children;
for(let i = 0; i < speaker_voice_button_els.length; i++){
	speaker_voice_button_els[i].addEventListener('click',(event) => {
		//console.log("clicked on a speaker voice icon.  dataset.value: ", speaker_voice_button_els[i].dataset.value);
		set_voice(speaker_voice_button_els[i].dataset.value);
	});
}

// Move Speaker voice icon background

function move_speaker_voice_button_background(new_voice="default"){
    //console.log("move_cell_type_button_background. cell_type: ", cell_type);
    
    // if cell_type is null, the text button gets set to selected
	if(speaker_voice_button_els){
	    for(let i = 0; i < speaker_voice_button_els.length; i++){
	        if(new_voice != "" && speaker_voice_button_els[i].dataset.value == new_voice){
	            speaker_voice_button_els[i].classList.add('selected-speaker-voice-icon');
	            speaker_voice_buttons_background_ball_pusher.style.width = ((i) * (100 / (speaker_voice_button_els.length-1))) + '%'; //(i * 14.28) + "%"; //speaker_voice_button_els[i].offsetLeft + "px";
	        }
	        else{
				speaker_voice_button_els[i].classList.remove('selected-speaker-voice-icon');
	        }
	    }
	}
    
    
}



// Adjust textarea height to fit content
function textAreaAdjust(element) {
	element.style.height = "1px";
	element.style.height = (25+element.scrollHeight)+"px";
}
window.textAreaAdjust = textAreaAdjust;




// TODO: This function and show_rewrite_picker should probably be merged now?
function create_rewrite_result_container(task=null){
	//console.log("in create_rewrite_result_container. task: ", task);
	if(typeof task != 'object' || task == null){
		console.error("create_rewrite_result_container: aborting, invalid task provided: ", task);
		return false
	}
	if(typeof task.index != 'number'){
		console.error("create_rewrite_result_container: aborting, task has no index: ", task);
		return false
	}
	
	let rewrite_details_el = document.createElement('details');
	rewrite_details_el.setAttribute('id','rewrite-result' + task.index);
	rewrite_details_el.setAttribute('data-index',task.index);
	rewrite_details_el.classList.add('rewrite-result-details');
	if(typeof task.type == 'string'){
		rewrite_details_el.classList.add('rewrite-result-details-' + task.type);
	}
	

	let rewrite_summary_el = document.createElement('summary');
	rewrite_summary_el.classList.add('rewrite-result-summary');

	rewrite_summary_el.addEventListener('click', (event) => {
		//console.log("clicked on rewrite result summary element. task: ", task);
		//event.preventDefault();
		event.stopPropagation();
		let cursor = highlight_selection_from_task(task);
		if(cursor){
			scroll_to_selection(cursor);
		}
		
		if(task.results.length > 2){
			if(window.innerWidth > 800){
				rewrite_details_el.classList.add("rewrite-result-big");
			}
		}

		// Expand the first rewrite result
		const rewrite_result_text_el = rewrite_details_el.querySelector('.rewrite-result-text');
		if(rewrite_result_text_el){
			//console.log("found first rewrite result textarea. Giving it focus");
			rewrite_result_text_el.focus();
		}

	});

	let rewrite_summary_faux_button_el = document.createElement('div');
	rewrite_summary_faux_button_el.classList.add('rewrite-result-summary-faux-button');
	rewrite_summary_faux_button_el.classList.add('flex-space-between');

	let rewrite_summary_type_el = document.createElement('span');
	rewrite_summary_type_el.classList.add('rewrite-result-summary-type');
	rewrite_summary_type_el.classList.add('capitalize-first-letter');
	rewrite_summary_type_el.setAttribute('data-i18n',task.type);
	rewrite_summary_type_el.textContent = task.type;

	rewrite_summary_faux_button_el.appendChild(rewrite_summary_type_el);

	let rewrite_summary_count_wrapper_el = document.createElement('span');
	rewrite_summary_count_wrapper_el.classList.add('rewrite-results-count-wrapper');
	rewrite_summary_count_wrapper_el.setAttribute('id','rewrite-results-count-wrapper' + task.index);
	
	if(typeof task.desired_results == 'number' && task.desired_results > 1){
		let rewrite_summary_count_el = document.createElement('span');
		rewrite_summary_count_el.classList.add('rewrite-result-summary-current-results');
		rewrite_summary_count_el.setAttribute('id','rewrite-results-count' + task.index);
		rewrite_summary_count_el.textContent = '0';
		rewrite_summary_count_wrapper_el.appendChild(rewrite_summary_count_el);

		let rewrite_summary_desired_results_el = document.createElement('span');
		rewrite_summary_desired_results_el.classList.add('rewrite-result-summary-desired-results');
		rewrite_summary_desired_results_el.textContent = '/' + task.desired_results;
		rewrite_summary_count_wrapper_el.appendChild(rewrite_summary_desired_results_el);
	}
	
	rewrite_summary_faux_button_el.appendChild(rewrite_summary_count_wrapper_el);
	
	rewrite_summary_el.appendChild(rewrite_summary_faux_button_el);

	let rewrite_summary_text_snippet_el = document.createElement('div');
	rewrite_summary_text_snippet_el.classList.add('rewrite-result-text-snippet');
	rewrite_summary_text_snippet_el.classList.add('ellipsis');
	if(typeof task.text == 'string'){
		rewrite_summary_text_snippet_el.textContent = task.text.substr(0,100);
		rewrite_summary_el.appendChild(rewrite_summary_text_snippet_el);
	}
	

	let rewrite_summary_result_snippet_el = document.createElement('div');
	rewrite_summary_result_snippet_el.classList.add('rewrite-result-output-snippet');
	rewrite_summary_result_snippet_el.setAttribute('id','rewrite-results-snippet' + task.index);

	rewrite_summary_el.appendChild(rewrite_summary_result_snippet_el);

	rewrite_details_el.appendChild(rewrite_summary_el);

	
	// Delete rewrite result button
	let rewrite_result_footer_el = document.createElement('div');
	rewrite_result_footer_el.classList.add('rewrite-result-delete-container');
	
	let remove_rewrite_result_button_el = document.createElement('div');
	remove_rewrite_result_button_el.classList.add('rewrite-result-delete-button');
	remove_rewrite_result_button_el.classList.add('center');
	//remove_rewrite_result_button_el.innerHTML = '<span class="unicode-icon">🗑️</span>';
	remove_rewrite_result_button_el.innerHTML = '<img src="images/trash.svg" width="20" height="20" alt="Delete"/>';
	remove_rewrite_result_button_el.addEventListener('click', () => {
		//console.log("clicked on delete rewrite result button");
		rewrite_details_el.remove();
		update_rewrite_results_indicator();
		window.remove_rewrite(task);
	});
	rewrite_result_footer_el.appendChild(remove_rewrite_result_button_el);
	
	// Add rewrite result to page
	rewrite_results_dialog_content_container_el.appendChild(rewrite_details_el);
	
	// A bit messy that this got split up. This fills in the rewrite results further
	//console.log("rewrite_selection: calling show_rewrite_picker with task: ", task);
	show_rewrite_picker(task);
	
	rewrite_details_el.appendChild(rewrite_result_footer_el);
	
	rewrite_details_el.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
}



function remove_rewrite(task){
	//console.log("in remove_rewrite. task: ", task);
	if(typeof task.state == 'string' && task.state.startsWith('doing')){
		console.warn("it seems this rewrite is still ongoing");
		//const runner = get_task_runner(task);
		window.stop_assistant(task);
		handle_completed_task(task,false,{'state':'interrupted'});
		//window.set_task_state(task,'completed');
	}
}
window.remove_rewrite = remove_rewrite;




function show_rewrite_picker(task){
	//console.log("in show_rewrite_picker. task: ", task);
	
	if(typeof task == 'undefined' || task == null){
		console.error("show_rewrite_picker: no valid task");
		return false
	}
	
	if(typeof task.results == 'undefined' || typeof task.desired_results != 'number'){
		console.error("show_rewrite_picker: no results to show");
		return false
	}
	
	if(typeof task.index != 'number'){
		console.error("show_rewrite_picker: task had no index");
		return
	}
	
	let index = task.index;
	if(typeof task.grandparent_index == 'number'){
		//console.log("rewrite_picker: task has a grandparent_index, which will be the index of the rewrite output element's ID: ", task.grandparent_index);
		index = task.grandparent_index;
	}
	else if(typeof task.parent_index == 'number'){
		//console.log("rewrite_picker: task has a parent_index, which will be the index of the rewrite output element's ID: ", task.parent_index);
		index = task.parent_index;
	}
	
	let rewrite_el = document.getElementById('rewrite-result-wrapper' + index);
	if(rewrite_el == null){
		//console.log("show_rewrite_picker: creating wrapper element: ", 'rewrite-result-wrapper' + index);
		rewrite_el = document.createElement('div');
		rewrite_el.setAttribute('id','rewrite-result-wrapper' + index);
		
		let rewrite_result_details_el = document.querySelector('#rewrite-result' + index);
		if(rewrite_result_details_el){
			//console.log("show_rewrite_picker:  found rewrite result details element");
			rewrite_result_details_el.appendChild(rewrite_el);
			//rewrite_result_details_el.classList.add('rewrite-result-complete');
		}
		else{
			console.error("show_rewrite_picker: cannot find element:  #rewrite-result" + index);
		}
	}
	else{
		//console.log("show_rewrite_picker: found already existing wrapper element: ", 'rewrite-result-wrapper' + index);
	}
	
	
	if(typeof task.text == 'string'){
		
		let rewrite_orig_el = document.createElement('div');
		rewrite_orig_el.classList.add('rewrite-results-dialog-original-text-container');
		
		let rewrite_result_header_original_el = document.createElement('h3');
		rewrite_result_header_original_el.classList.add('rewrite-result-header-original');
		rewrite_result_header_original_el.textContent = 'Original';
		rewrite_result_header_original_el.setAttribute('data-i18n','Original');
		rewrite_orig_el.appendChild(rewrite_result_header_original_el);
		
		let rewrite_result_text_original_el = document.createElement('textarea');
		rewrite_result_text_original_el.classList.add('rewrite-result-text-original');
		rewrite_result_text_original_el.value = task.text;
		rewrite_orig_el.appendChild(rewrite_result_text_original_el);
		rewrite_result_text_original_el.addEventListener('keyup', () => {
			textAreaAdjust(rewrite_result_text_original_el);
		});
		rewrite_el.appendChild(rewrite_orig_el);
	}
		
		
	let rewrite_creations_el = document.getElementById('rewrite-result-creations' + index);
	if(rewrite_creations_el == null){
		rewrite_creations_el = document.createElement('div');
		rewrite_creations_el.classList.add('rewrite-results-dialog-creations-container');
		rewrite_creations_el.setAttribute('id','rewrite-result-creations' + index);
		rewrite_el.appendChild(rewrite_creations_el);
	}
	
	//rewrite_results_dialog_original_text_el.value = task.results;

	for(let r = 0; r < task.desired_results; r++){
		
		let rewrite_result_text_el = document.getElementById('rewrite-result' + index + '-textarea' + r);
		if(rewrite_result_text_el != null){
			//console.log("show_rewrite_picker: found existing textarea/container: ", 'rewrite-result' + index + '-textarea' + r);
			if(typeof task.results[r] == 'string'){
				rewrite_result_text_el.value = task.results[r];
			}
		}
		else{
			//console.log("show_rewrite_picker: adding rewrite output textarea/html: ", 'rewrite-result' + index + '-textarea' + r);
			let rewrite_result_container_el = document.createElement('div');
			rewrite_result_container_el.classList.add('rewrite-result-container');
	
			let rewrite_result_header_el = document.createElement('h3');
			rewrite_result_header_el.classList.add('rewrite-result-header');
			rewrite_result_header_el.innerHTML = get_translation('Option') + " " + (r + 1) + '<span class="rewrite-result-header-of">/' + task.results.length + '</span>';
			rewrite_result_container_el.appendChild(rewrite_result_header_el);
			
			let rewrite_result_textarea_container_el = document.createElement('div');
			rewrite_result_textarea_container_el.setAttribute('id','rewrite-result-wrapper' + index);
			rewrite_result_textarea_container_el.classList.add('rewrite-result-textarea-container');
			
			
			rewrite_result_text_el = document.createElement('textarea');
			rewrite_result_text_el.classList.add('rewrite-result-text');
			rewrite_result_text_el.setAttribute('id','rewrite-result' + index + '-textarea' + r);
			
			if(typeof task.results[r] == 'string'){
				rewrite_result_text_el.value = task.results[r];
			}
			rewrite_result_text_el.addEventListener('keyup', () => {
				textAreaAdjust(rewrite_result_text_el);
				rewrite_result_textarea_overlay_el.innerHTML = '';
			});
		
			rewrite_result_textarea_container_el.appendChild(rewrite_result_text_el);
	
			let rewrite_result_textarea_overlay_el = document.createElement('pre');
			rewrite_result_textarea_overlay_el.classList.add('rewrite-result-textarea-overlay');
			rewrite_result_textarea_container_el.appendChild(rewrite_result_textarea_overlay_el);
		
			rewrite_result_container_el.appendChild(rewrite_result_textarea_container_el);
	
	
			let rewrite_result_footer_el = document.createElement('div');
			rewrite_result_footer_el.classList.add('rewrite-result-footer');
	
	
			// Add show differences button
			let rewrite_result_differences_button_el = document.createElement('button');
			rewrite_result_differences_button_el.classList.add('rewrite-result-differences-button');
			rewrite_result_differences_button_el.setAttribute('data-i18n','Differences');
			rewrite_result_differences_button_el.textContent = 'Differences';
			rewrite_result_differences_button_el.addEventListener('click',(event) => {
				//console.log("clicked on differences button. task was: ", task);
				//console.log("text in textarea: ", rewrite_result_text_el.value);
				textAreaAdjust(rewrite_result_text_el);
				really_differ(task.text, rewrite_result_text_el.value, rewrite_result_textarea_overlay_el);
		
			})
			rewrite_result_footer_el.appendChild(rewrite_result_differences_button_el);
	
	
			// Add select rewrite button
			let rewrite_result_select_button_el = document.createElement('button');
			rewrite_result_select_button_el.classList.add('rewrite-result-select-button');
			//rewrite_result_select_button_el.setAttribute('data-i18n','Select');
			rewrite_result_select_button_el.textContent = '➜';
			rewrite_result_select_button_el.addEventListener('click',(event) => {
				//console.log("clicked on select result button. task was: ", task);
				//console.log("text in textarea: ", rewrite_result_text_el.value);
				search_and_replace(task,task.text,rewrite_result_text_el.value);
				rewrite_el.closest('.rewrite-result-details').remove();
			
				// check if there are any remaining
				if(rewrite_results_dialog_content_container_el.innerHTML == ''){
					document.body.classList.remove('show-rewrite-results');
				}
			
			});
			
			rewrite_result_footer_el.appendChild(rewrite_result_select_button_el);
			rewrite_result_textarea_container_el.appendChild(rewrite_result_footer_el);
			//rewrite_result_container_el.appendChild(rewrite_result_footer_el);
	
			rewrite_creations_el.appendChild(rewrite_result_container_el);
			
		}
		document.body.classList.add('show-rewrite-results');
		
	}

}


// uses summarize_tags, rewrite_tags
function generate_rewrite_tags(type="rewrite",force=false){ 
	//console.log("in generate_rewrite_tags. type: ", type);
	if(typeof type != 'string'){
		type = 'rewrite';
	}
	
	let tag_language = 'en';
	if(typeof window.settings[type +'_tags'][window.settings.language] != 'undefined'){
		tag_language = window.settings.language;
	}
	//console.log("generate_rewrite_tags: tag_language: ", tag_language, window.settings[type +'_tags'][tag_language]);
	
	if(force){
		window[ type + '_dialog_content_toggles_container_el'].innerHTML = '';
		window[ type + '_dialog_content_tags_container_el'].innerHTML = '';
	}
	
	if(window[ type + '_dialog_content_toggles_container_el'].innerHTML == '' && window[ type + '_dialog_content_tags_container_el'].innerHTML == ''){
		for(let i = 0; i < window.settings[type +'_tags'][tag_language].length; i++){
			let tag = window.settings[type +'_tags'][tag_language][i];
		
			if(typeof tag == 'string'){
				let tag_el = document.createElement('div');
				tag_el.classList.add('tag-checkbox-wrapper');
				let tag_input_el = document.createElement('input');
				tag_input_el.setAttribute('type','checkbox');
				tag_input_el.setAttribute('id',type + '-tag-checkbox-' + window.settings[type +'_tags'][tag_language][i]);
				tag_input_el.setAttribute('data-checked',window.settings[type +'_tags'][tag_language][i]);
				tag_input_el.addEventListener('change',() => {
					//console.log("clicked on simple tag. toggle changed to: ", tag_input_el.checked);
					setTimeout(() => {
						generate_rewrite_prompt_from_tags(type);
					},1);
				});
				tag_el.appendChild(tag_input_el);
				let tag_label_el = document.createElement('label');
				tag_label_el.setAttribute('for',type + '-tag-checkbox-' + window.settings[type +'_tags'][tag_language][i]);
				tag_label_el.setAttribute('data-i18n',window.settings[type +'_tags'][tag_language][i]);
				tag_label_el.textContent = window.settings[type +'_tags'][tag_language][i].replaceAll('_',' ');
				tag_el.appendChild(tag_label_el);
	
				window[type + '_dialog_content_tags_container_el'].appendChild(tag_el);
			}
			else{
				
				let tag_el = document.createElement('div');
				tag_el.classList.add('three-toggle-switch');
				
				
				
				
				// LEFT
				let tag_label_el = document.createElement('label');
				tag_label_el.textContent = window.settings[type +'_tags'][tag_language][i][0].replaceAll('_',' ');
				tag_label_el.setAttribute('for',type + '-tag-checkbox-' + window.settings[type +'_tags'][tag_language][i][0]);
				tag_label_el.setAttribute('data-i18n', window.settings[type +'_tags'][tag_language][i][0]);
				tag_label_el.classList.add('three-toggle-switch-option1');
				
				let tag_input_el = document.createElement('input');
				tag_input_el.setAttribute('type','radio');
				tag_input_el.setAttribute('id',type + '-tag-checkbox-' + window.settings[type +'_tags'][tag_language][i][0]);
				tag_input_el.setAttribute('data-tag', window.settings[type +'_tags'][tag_language][i][0]);
				tag_input_el.setAttribute('name','tag-checkbox' + i);
				tag_input_el.setAttribute('value', window.settings[type +'_tags'][tag_language][i][0]);
				
				tag_label_el.addEventListener('click', function(event) {
					//console.log("clicked on three state toggle switch, and input changed.  event,this: ", event, this);
					//console.log("event.target.previousSibling: ", event.target.previousSibling);
					//console.log("event.target.previousSibling.checked: ", event.target.previousSibling.checked);
					if(event.target.previousSibling){
						if(event.target.previousSibling.checked){
							//console.log("removing radio button checked attribute from sibling");
							event.target.previousSibling.checked = false;
							event.target.previousSibling.indeterminate = true;
						}
					}
					else if(event.target.checked){
						//console.log("removing radio button checked attribute");
						event.target.checked = false;
						event.target.indeterminate = true;
					}
					setTimeout(() => {
						generate_rewrite_prompt_from_tags(type);
					},1);
					
				});
				
				
				//tag_label_el.appendChild(tag_input_el);
				tag_el.appendChild(tag_input_el);
				tag_el.appendChild(tag_label_el);
				
				
				
				
				// MIDDLE
				let tag_label2_el = document.createElement('label');
				tag_label2_el.textContent = ' - ';
				tag_label2_el.classList.add('three-toggle-switch-neutral');
				tag_label2_el.setAttribute('for',type + '-tag-checkbox' + i);
				
				let tag_input2_el = document.createElement('input');
				tag_input2_el.setAttribute('type','radio');
				tag_input2_el.setAttribute('id',type + '-tag-checkbox' + i);
				tag_input2_el.setAttribute('name','tag-checkbox' + i);
				tag_input2_el.setAttribute('value','');
				//tag_input2_el.setAttribute('data-tag','');
				//tag_label2_el.appendChild(tag_input2_el);
				tag_el.appendChild(tag_input2_el);
				tag_el.appendChild(tag_label2_el);
				
				
				tag_label2_el.addEventListener('click', function(event) {
					//console.log("clicked on three state toggle switch, and middle input changed.  event,this: ", event, this);
					if(event.target.previousSibling){
						if(event.target.previousSibling.checked){
							//console.log("removing radio button checked attribute from sibling");
							event.target.previousSibling.checked = false;
							event.target.previousSibling.indeterminate = true;
							
						}
					}
					else if(event.target.checked){
						//console.log("removing radio button checked attribute");
						event.target.checked = false;
						event.target.indeterminate = true;
					}
					setTimeout(() => {
						generate_rewrite_prompt_from_tags(type);
					},1);
					
				});
				
				
				
				
				
				// RIGHT
				let tag_label3_el = document.createElement('label');
				tag_label3_el.textContent = window.settings[type +'_tags'][tag_language][i][1].replaceAll('_',' ');
				tag_label3_el.setAttribute('for',type + '-tag-checkbox-' + window.settings[type +'_tags'][tag_language][i][1]);
				tag_label3_el.setAttribute('data-i18n', window.settings[type +'_tags'][tag_language][i][1]);
				tag_label3_el.classList.add('three-toggle-switch-option2');
				
				let tag_input3_el = document.createElement('input');
				tag_input3_el.setAttribute('type','radio');
				tag_input3_el.setAttribute('id',type + '-tag-checkbox-' + window.settings[type +'_tags'][tag_language][i][1]);
				tag_input3_el.setAttribute('data-tag', window.settings[type +'_tags'][tag_language][i][1]);
				tag_input3_el.setAttribute('name','tag-checkbox' + i);
				tag_input3_el.setAttribute('value', window.settings[type +'_tags'][tag_language][i][1]);
				
				//tag_label3_el.appendChild(tag_input3_el);
				tag_el.appendChild(tag_input3_el);
				tag_el.appendChild(tag_label3_el);
				
				tag_label3_el.addEventListener('click', function(event) {
					//console.log("clicked on three state toggle switch, and input changed.  event,this: ", event, this);
					//console.log("event.target.previousSibling: ", event.target.previousSibling);
					//console.log("event.target.previousSibling.checked: ", event.target.previousSibling.checked);
					if(event.target.previousSibling){
						if(event.target.previousSibling.checked){
							//console.log("removing radio button checked attribute from sibling");
							event.target.previousSibling.checked = false;
							event.target.previousSibling.indeterminate = true;
							
							
						}
						
					}
					else if(event.target.checked){
						//console.log("removing radio button checked attribute");
						event.target.checked = false;
						event.target.indeterminate = true;
						
					}
					else{
						//generate_rewrite_prompt_from_tags();
					}
					setTimeout(() => {
						generate_rewrite_prompt_from_tags(type);
					},1);
				});
				
				
				window[type + '_dialog_content_tags_container_el'].appendChild(tag_el);
			}
		}
	}	
}
window.generate_rewrite_tags = generate_rewrite_tags;

generate_rewrite_tags('rewrite');
generate_rewrite_tags('summarize');



function generate_rewrite_prompt_from_tags(type="rewrite"){
	//console.log("in generate_rewrite_prompt_from_tags. type: ", type);
	if(typeof type != 'string'){
		type = 'rewrite';
	}
	let prefix = '';
	if(type == 'summarize'){
		prefix = type + '_'; // summarize add entire sentences, and not just translations of the words, so this is a bit more tricky
	}
	
	let tags_to_use = [];
	
	let tag_els = document.querySelectorAll('#' + type + '-dialog-content-toggles-and-tags-container input:checked');
	//console.log("tag_els: ", tag_els);
	for(let i = 0; i < tag_els.length; i++){
		//console.log("generate_" + type + "_prompt_from_tags: tag_els[i]: ", tag_els[i]);
		if(tag_els[i].getAttribute('type') == 'radio'){
			if(tags_to_use.indexOf(prefix + tag_els[i].value) == -1 && tag_els[i].value != ''){
				tags_to_use.push(prefix + tag_els[i].value);
			}
			
		}
		else if(tag_els[i].indeterminate == false){
			//console.log("tag_els[i].getAttribute('data-unchecked'): ", tag_els[i].getAttribute('data-unchecked'));
			//console.log("tag_els[i].getAttribute('data-checked'): ", tag_els[i].getAttribute('data-checked'));
			if(tag_els[i].checked == false && typeof tag_els[i].getAttribute('data-unchecked') == 'string'){
				tags_to_use.push(prefix + tag_els[i].getAttribute('data-unchecked'));
			}
			else if(tag_els[i].checked == true && typeof tag_els[i].getAttribute('data-checked') == 'string'){
				tags_to_use.push(prefix + tag_els[i].getAttribute('data-checked'));
			}
		}
	}
	
	let new_prompt = '';
	if(type == 'rewrite'){
		new_prompt = get_translation(type + '_the_following_text_to_be_more');
	}
	
	
	console.warn("generate_rewrite_prompt_from_tags: tags_to_use: ", tags_to_use);
	if(tags_to_use.length){
		
		for(let k = 0; k < tags_to_use.length; k++){
			if(k > 0 && type == 'rewrite'){
				
				if(k == tags_to_use.length - 1){
					new_prompt += ' and';
				}
				else{
					new_prompt += ',';
				}
				
			}
			if(type == 'rewrite'){
				new_prompt += ' ' + get_translation(tags_to_use[k]);
			}
			else{
				new_prompt += get_translation(tags_to_use[k]) + ' ';
			}
		}
		//new_prompt += ':';
	}
	else{
		new_prompt += ' ';
	}
	
	// edge case of "less repetitive being the only active tag"
	new_prompt = new_prompt.replace('more less','less');
	new_prompt = new_prompt.replace('meer minder','minder');
	
	const var_name = type + '_prompt_el';
	//console.log("prompt target element var name: ", var_name);
	window[var_name].value = new_prompt;
	if(new_prompt != '' && new_prompt != get_translation(type + '_the_following_text_to_be_more')){
		window.settings[type + '_prompt'] = new_prompt;
		save_settings();
	}
}
window.generate_rewrite_prompt_from_tags = generate_rewrite_prompt_from_tags;






function check_if_cached(assistant_id){
	//console.log("in check_if_cached.  assistant_id: ", assistant_id);
	
	let cached = false;
	
	if(typeof assistant_id == 'string' && assistant_id.length > 2){
		
		if(assistant_id == 'speak'){assistant_id = 'speaker'}
		
		// Not actually necessary
		/*
		if(assistant_id.startsWith('custom_saved') || assistant_id.startsWith('clone')){
			if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].clone_original == 'string'){
				//console.log("check_if_cached: switching assistant id for the clone original: " + assistant_id + " -> " + window.settings.assistants[assistant_id].clone_original);
				assistant_id = window.settings.assistants[assistant_id].clone_original;
			}
		}
		*/
		
		
		if(typeof window.assistants[assistant_id] == 'undefined' && typeof window.settings.assistants[assistant_id] == 'undefined'){
			console.error("check_if_cached: provided assistant_id is not in window.assistants or window.settings.assistants: ", assistant_id, window.assistants, window.settings.assistants);
			return false
		}
		
		if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id]['pretend_cached'] == 'boolean' && window.assistants[assistant_id]['pretend_cached']){
			//console.error("check_if_cached: pretending to be cached for: ", assistant_id, window.assistants);
			return false // TODO: this has been reversed. Should rename the variable?
		}
		
		let download_url = null;
		
		if(typeof download_url != 'string' && typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].download_url == 'string' && window.settings.assistants[assistant_id].download_url.endsWith('.gguf')){
			download_url = window.settings.assistants[assistant_id].download_url;
		}
		if(typeof download_url != 'string' && typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].download_url == 'string' && window.assistants[assistant_id].download_url.endsWith('.gguf')){
			download_url = window.assistants[assistant_id].download_url;
		}
		if( typeof download_url == 'string' && download_url.indexOf('-00001-of-0') != -1){
			/*
			download_url = download_url.split('-00001-of-0')[0];
			if(download_url.indexOf('/') != -1 && !download_url.endsWith('/')){
				download_url = download_url.substr( (download_url.lastIndexOf('/')) + 1 );
			}
			*/
			
			
			let param_count = download_url.split('-00001-of-0')[1];
			param_count = param_count.replace('.gguf','');
			
			if(!isNaN(param_count)){
				param_count = parseInt(param_count);
				if(typeof param_count == 'number'){
					let padded_index = '' + param_count;
					while(padded_index.length < 5){
						padded_index = '0' + padded_index;
					}
					padded_index = '-' + padded_index + '-of-00';
					download_url = download_url.replace('-00001-of-00',padded_index);
					//console.log("check_if_cached: modified Wllama download_url: ", download_url);
				}
				
			}
		}
		
		
		if(typeof download_url != 'string' && typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].download_url == 'string' && window.assistants[assistant_id].download_url.length > 4){
			download_url = window.assistants[assistant_id].download_url;
		}
		if(typeof download_url != 'string' && typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].model_file_name == 'string' && window.settings.assistants[assistant_id].model_file_name.length > 4){
			download_url = window.settings.assistants[assistant_id].model_file_name;
		}
		if(typeof download_url != 'string' && typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].model_file_name == 'string' && window.assistants[assistant_id].model_file_name.length > 4){
			download_url = window.assistants[assistant_id].model_file_name;
		}
		if(typeof download_url != 'string' && typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].web_llm_file_name == 'string' && window.assistants[assistant_id].web_llm_file_name.length > 4){
			download_url = window.assistants[assistant_id].web_llm_file_name;
		}
		if(typeof download_url != 'string' && typeof window.settings.assistants[assistant_id] != 'undefined' && window.settings.assistants[assistant_id].download_url != null && Array.isArray(window.settings.assistants[assistant_id].download_url) && window.settings.assistants[assistant_id].download_url.length){
			download_url = window.settings.assistants[assistant_id].download_url[window.settings.assistants[assistant_id].download_url.length-1];
		}
		if(typeof download_url != 'string' && typeof window.assistants[assistant_id] != 'undefined' && window.assistants[assistant_id].download_url != null && Array.isArray(window.assistants[assistant_id].download_url) && window.assistants[assistant_id].download_url.length){
			download_url = window.assistants[assistant_id].download_url[window.assistants[assistant_id].download_url.length-1];
		}
		
		//console.log("check_if_cached: download_url to check: ", download_url);
		
		if(typeof download_url == 'string'){
			download_url = download_url.trim();
			
			if(download_url.length > 4){
				if(download_url.startsWith('[') && download_url.endsWith(']')){
					try{
						//console.log("check_if_cached: download_url seems to be a JSON array object: ", download_url);
						download_url = JSON.parse(download_url);
						if(Array.isArray(download_url)){
							if(typeof download_url[download_url.length - 1] == 'string'){
								download_url = download_url[download_url.length - 1];
								//console.log("check_if_cached: succesfully extracted last item on chunked model URL's list: ", download_url);
							}
						}
					}
					catch(err){
						console.error("check_if_cached: parsing user provided model URL array failed: ", err);
						flash_message(get_translation('Invalid_model_url_provided'),4000,'fail');
					}
				}
				if(typeof window.cached_urls != 'undefined' && Array.isArray(window.cached_urls)){
					for(let m = 0; m < window.cached_urls.length; m++){
						if(window.cached_urls[m].indexOf(download_url) != -1 || (download_url.endsWith('.gguf') && window.cached_urls[m].endsWith('.gguf') && download_url.endsWith(window.cached_urls[m]))){
							//console.log("check_if_cached: download_url match at: ", assistant_id, download_url, window.cached_urls[m]);
							return true
						}
						else{
							//console.log("check_if_cached: \nno match: ", download_url, "\nin: ", window.cached_urls[m]);
						}
					}
				}
				else{
					console.error("check_if_cached: window.cached_urls was invalid (not an array?): ", window.cached_urls);
				}
				
			}
		}
		else{
			if(assistant_id.startsWith('custom') || assistant_id == 'developer' || assistant_id == 'translator' || assistant_id == 'ollama1'){
				// here download_url is expected/allowed to be null
			}else{
				console.error("check_if_cached: final download_url was not a string: ", download_url, assistant_id);
			}
			
		}
		 
	}
	else{
		console.error("check_if_cached:  invalid assistant_id provided, should be a string: ", typeof assistant_id, assistant_id);
	}
	return false
}



// add file to recent documents list
function update_recent_documents(newly_opened_document=null){
	//console.log("in update_recent_documents. newly_opened_document: ", newly_opened_document);
	let force_save = false;
	if(newly_opened_document == null){
		newly_opened_document = window.settings.docs.open;
	}
	else{
		force_save = true;
	}
	
	if(newly_opened_document == null && typeof folder == 'string' && typeof current_file_name == 'string'){
		console.error("update_recent_documents: current_file_name was a string, but window.settings.docs.open was null?  current_file_name,window.settings.docs.open: ", current_file_name, window.settings.docs.open);
		newly_opened_document = {'folder':folder,'filename':current_file_name}
	}
	//console.log("in chatty_ui.js: update_recent_documents. newly_opened_document: ", typeof newly_opened_document, newly_opened_document);
	
	if(typeof newly_opened_document == 'object' && newly_opened_document != null && typeof newly_opened_document.folder == 'string' && typeof newly_opened_document.filename == 'string'){
		
		if(typeof window.settings.docs.recent == 'undefined'){
			console.error("update_recent_documents: window.settings.docs.recent was undefined");
			return
		}
		let already_at_the_top = false;
		for(let r = window.settings.docs.recent.length - 1; r >= 0; --r){
			if(typeof window.settings.docs.recent[r].filename == 'string' && window.settings.docs.recent[r].filename == newly_opened_document.filename && typeof window.settings.docs.recent[r].folder == 'string' && window.settings.docs.recent[r].folder == newly_opened_document.folder){
				//console.log("removing newly_opened_document from recent files list first");
				if(r == 0){
					//console.log("update_recent_documents: document was already at the number one spot of the recent documents");
					already_at_the_top = true;
				}
				else{
					window.settings.docs.recent.splice(r,1);
				}
			}
		}
		
		if(!already_at_the_top){
			window.settings.docs.recent.unshift(newly_opened_document);
		}
		
		if(window.settings.docs.recent.length > window.settings.maximum_recent_files){
			window.settings.docs.recent = window.settings.docs.recent.splice(0,window.settings.maximum_recent_files);
			//save_settings();
		}
		else if(!already_at_the_top){
			//save_settings();
		}
		/*
		else if(force_save){
			save_settings();
		}
		*/
		
		save_settings();
		
		window.generate_recent_documents_list();
			
	}
	else{
		console.error("newly_opened_document was invalid?   newly_opened_document,window.settings.docs.open: ", newly_opened_document, window.settings.docs.open);
	}
}
window.update_recent_documents = update_recent_documents;



function generate_recent_documents_list(){
	//console.log("in generate_recent_documents_list");
	
	recently_opened_documents_list_el.innerHTML = '';
	let added_something = false;
	if(window.settings.docs.recent && window.settings.docs.recent.length){
		
		for(let r = 0; r < window.settings.docs.recent.length; r++){
			
			const file_data = window.settings.docs.recent[r];
			//console.log("generate_recent_documents_list: file_data: ", file_data);
			
			if(!filename_is_media(file_data.filename) && typeof playground_live_backups[file_data.folder + '/' + file_data.filename] != 'string' && typeof playground_saved_files[file_data.folder + '/' + file_data.filename] != 'string'){
				//console.error("generate_recent_documents_list: skipping file item that no longer seems to exist: ", file_data.filename);
				continue
			}
			
			
			let recent_li = document.createElement('li');
			recent_li.classList.add('recent-documents-item');
			recent_li.classList.add('flex');
			
			let recent_file_icon_container_el = document.createElement('div');
			recent_file_icon_container_el.classList.add('recent-documents-icon-container');
			
			let recent_file_icon_el = document.createElement('img');
			recent_file_icon_el.classList.add('recent-documents-icon');
			
			if(file_data.filename.endsWith('.vtt') || file_data.filename.endsWith('.srt') ){
				recent_file_icon_el.src = './images/subtitle_icon.svg';
			}
			else if(file_data.filename.endsWith('.blueprint') ){
				recent_file_icon_el.src = './images/blueprint_icon.svg';
			}
			else if(window.filename_is_image(file_data.filename)){
				recent_file_icon_el.src = './images/image_icon.svg';
			}
			else if(window.filename_is_audio(file_data.filename)){
				recent_file_icon_el.src = './images/audio_icon.svg';
			}
			else if(window.filename_is_video(file_data.filename)){
				recent_file_icon_el.src = './images/video_icon.svg';
			}
			else{
				recent_file_icon_el.src = './images/document.svg';
			}
			recent_file_icon_container_el.appendChild(recent_file_icon_el);
			
			let recent_file_info_container_el = document.createElement('div');
			recent_file_info_container_el.classList.add('recent-documents-info-container');
			
			let folder_name_el = document.createElement('span');
			folder_name_el.classList.add('recent-documents-item-folder');
			let clean_folder_name = file_data.folder;
			/*
			if(clean_folder_name.endsWith('/')){
				clean_folder_name = clean_folder_name.substr(0,clean_folder_name.length-1);
			}
			*/
			if(clean_folder_name.startsWith('/')){
				clean_folder_name = clean_folder_name.substr(1);
			}
			folder_name_el.textContent = clean_folder_name;
			
			let file_name_el = document.createElement('span');
			file_name_el.classList.add('recent-documents-item-filename');
			file_name_el.textContent = file_data.filename;
			
			
			
			
			recent_file_info_container_el.appendChild(file_name_el);
			recent_file_info_container_el.appendChild(folder_name_el);
			
			recent_li.appendChild(recent_file_icon_container_el);
			recent_li.appendChild(recent_file_info_container_el);
			
			recent_li.addEventListener('click', () => {
				//console.log("clicked on recent document item: ", file_data);
				/*
				if(file_data.filename != current_file_name || file_data.folder != folder){
					open_file(file_data.filename,null,file_data.folder);
				}
				*/
				open_file(file_data.filename,null,file_data.folder);
				document.body.classList.add('show-document');
			});
			
			added_something = true;
			recently_opened_documents_list_el.appendChild(recent_li);
		
			
		}
	}
	
	if(added_something){
		document.body.classList.add('has-recent-documents');
	}
	else{
		document.body.classList.remove('has-recent-documents');
	}
	
}
window.generate_recent_documents_list = generate_recent_documents_list;




function detect_language(text=null, element_id=null, flash_detected_language=false){
	//console.log("in detect_language.  text,element_id: ", text,element_id);
	
	return new Promise((resolve, reject) => {
	
		if(typeof text != 'string' && typeof element_id != 'string'){
			console.error("detect_input_language:  provided text or element_id was not a string: ", text,element_id);
			reject(false);
			return false
		}
		if(typeof text != 'string' && typeof element_id == 'string'){
			//console.log("detect_language:  getting text from element first");
			try{
				if(!element_id.startsWith("#") && !element_id.startsWith(".")){
					element_id = '#' + element_id;
				}
				let element = document.querySelector(element_id);
				if(element){
					if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
						text = element.value;
					}
					else {
						text = element.textContent;
					}
				}
				else{
					console.error("detect_input_language:  could not find element: ", element_id);
				}
			}
			catch(err){
				console.error("detect_language: caught error: ", err);
				reject(false);
				return false
			}
		
		}
		
		if(typeof text == 'string'){
			//console.log("in detect_language.  detecting from text: ", text,element_id);
		
			add_script('./js/eld.M60.min.js')
			.then((value) => {
	
				//console.log("detect_language: loaded language detection script? value: ", value);
				//console.log("window.eld: ", window.eld);
				//console.log("detect_language: language detection script: eld.info: ", eld.info() );
				if(typeof prompt_el.value == 'string' && typeof eld != 'undefined'){
					language_detection_result = eld.detect(text);
					//console.log("detect_language: language_detection_result: ", language_detection_result);
					
					if(typeof language_detection_result.language == 'string'){
						//console.log("detect_language: detected language vs possible languages: ", language_detection_result.language,  keyz(window.translation_languages));
					}
					
					
					if(typeof language_detection_result.language == 'string' && language_detection_result.language.length > 1 && keyz(window.translation_languages).indexOf(language_detection_result.language) != -1){
						if(language_detection_result.isReliable() || window.settings.favourite_translation_languages.indexOf(language_detection_result.language) != -1){
							
							if(language_detection_result.language != window.settings.input_language){
								if(keyz(window.translation_languages).indexOf(language_detection_result.language) != -1){
									//console.log("detect_language: was reliable. Setting select element to the detected language");
									/*
									translation_input_language_select_el.value = language_detection_result.language;
									window.settings.input_language = language_detection_result.language;
									update_translation_output_select();
									*/
									update_translation_input_select(language_detection_result.language);
									if(!add_favourite_language(language_detection_result.language)){
										save_settings(); // add_favourite_langage didn't do a settings save, so let's do it now.
									}
								}
								else{
									console.error("The detected language is not supported by the translator: ", language_detection_result.language);
								}
								
							}
							else{
								//console.log("detect_language: same language it already was");
							}
							resolve(language_detection_result.language);
							return true
						}
						else{
							console.warn("detect_language: detection was not reliable: ", language_detection_result);
							
							reject(null);
							return false
						}
					}
					else{
						console.error("cannot set detected language as input language (empty string, unsupported language, or unreliable): ", language_detection_result.language, ", reliable: ", language_detection_result.isReliable());
						if(flash_detected_language){
							if(typeof language_detection_result.language == 'string' && language_detection_result.language.length > 1 && language_detection_result.isReliable()){
								
								if(typeof window.language_codes_lookup != 'undefined' && typeof window.language_codes_lookup[language_detection_result.language] != 'undefined' && typeof window.language_codes_lookup[language_detection_result.language]['name'] == 'string'){
									flash_message(get_translation(window.language_codes_lookup[language_detection_result.language]['name']),2000);
								}
							}
						}
						reject(false);
						return false
						
					}
				}
				else{
					console.error("detect_language: failed to load language detection script?");
					reject(false);
					return false
				}
				
	
			})
			.catch((err) => {
				console.error("detect_language: caught error: ", err);
				reject(false);
				return false
			});
		
		}
		else{
			reject(false);
			return false
		}
	
		//return false
	});

	
}


function add_favourite_language(lang_code){
	if(typeof lang_code == 'string'){
		if(window.settings.favourite_translation_languages.indexOf(lang_code) == -1){
			//console.log("add_favourite_language: adding language to beginning of favourite languages array. It is now: ", window.settings.favourite_translation_languages);
			window.settings.favourite_translation_languages.unshift(lang_code);
			window.settings.favourite_translation_languages = window.settings.favourite_translation_languages.slice(0,2); // remember favourite languages
			save_settings();
			return true
		}
		
	}
	else{
		console.error("add_favourite_language: provided language code was not a string: ", lang_code);
	}
	return false
}





function create_share_prompt_link(initial=false,assistant_id=null,prompt=null){
	//console.log("in create_share_prompt_link.  initial,assistant_id: ", initial, assistant_id);
	
	if(typeof assistant_id != 'string'){
		assistant_id = window.settings.assistant;
	}
	if(typeof prompt != 'string'){
		prompt = share_prompt_input_el.value;
	}
	
	//console.log("in create_share_prompt_link. window.settings.assistant,initial: ", window.settings.assistant,initial);
	
	if(document.body.classList.contains('busy-editing-assistant')){
		console.error("create_share_prompt_link: body has busy-editing-assistant class, aborting");
		return;
	}
	
	function encode_url_component(str){
		//return new URLSearchParams({ text: text }).toString();
		//return new URLSearchParams({ encoded: "'@#$%^&" }).toString();
		return encodeURIComponent(str).replace(/[!'()*]/g, function(c) { return '%' + c.charCodeAt(0).toString(16); });
		//return encodeURIComponent(text).replace(/[!'()*]/g, escape);
		//return encodeURIComponent(text);
	}
	
	
	let share_name = '?';
	let custom_name_part = '';
	
	let emoji_part = '';
	let emoji_bg_part = '';
	
	share_prompt_assistant_emoji_el.textContent = '';
	if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['emoji'] == 'string' && window.settings.assistants[assistant_id]['emoji'] != ''){
		share_prompt_assistant_emoji_el.textContent = window.settings.assistants[assistant_id]['emoji'];
		emoji_part = '&emoji=' + encode_url_component(window.settings.assistants[assistant_id]['emoji']);
		
		if(typeof window.settings.assistants[assistant_id]['emoji_bg'] == 'string' && window.settings.assistants[assistant_id]['emoji_bg'].startsWith('#')){
			share_prompt_assistant_emoji_el.style['background-color'] = window.settings.assistants[assistant_id]['emoji_bg'];
			emoji_bg_part = '&emoji_bg=' + encode_url_component(window.settings.assistants[assistant_id]['emoji_bg'].replaceAll('#',''));
		}
	}
	
	if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['custom_name'] == 'string' && window.settings.assistants[assistant_id]['custom_name'] != ''){
		share_prompt_assistant_name_el.textContent = window.settings.assistants[assistant_id]['custom_name'];
		custom_name_part = '&custom_name=' + encode_url_component(window.settings.assistants[assistant_id]['custom_name']);
	}
	else if(typeof window.translations[window.settings.assistant + '_name'] != 'undefined'){
		share_prompt_assistant_name_el.textContent = get_translation(assistant_id + '_name');
	}
	else{
		console.error("create_share_prompt_link: getting assistant name fell through");
		share_prompt_assistant_name_el.textContent = '?';
	}
	//share_prompt_assistant_name_el.textContent = get_translation(window.settings.assistant + '_name'); // TODO: set this to more generic type indication instead? As the device of the person who receives the link might not support the current assistant
	if(chat_header_icon_el.src.indexOf('/custom_saved') == -1){
		share_prompt_assistant_name_icon_el.src = chat_header_icon_el.src; //"./images/" + window.settings.assistant.replace('_32bit','') + ".png";
	}
	// TODO: else, show papegai icon instead
	
	
	let custom_description_part = '';
	if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['custom_description'] == 'string' && typeof window.settings.assistants[assistant_id]['custom_description'] != ''){
		custom_description_part = '&custom_description=' + encode_url_component(window.settings.assistants[assistant_id]['custom_description']);
	}
	
	let has_download_url = false;
	
	const origin = window.location.origin;
	//const host = window.location.host;
	let origin_part = window.location.origin + window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'));
	let prompt_part = '';
	if(prompt != ''){
		prompt_part = '&prompt=' + encode_url_component(prompt);
	}
	let has_clone_original = false;
	let ai_part = '?ai=';
	if(!assistant_id.startsWith('custom')){
		ai_part = '?ai=' + encode_url_component(assistant_id);
		has_download_url = true;
	}
	else if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['clone_original'] == 'string' && !window.settings.assistants[assistant_id]['clone_original'].startsWith('custom')){
		ai_part = '?ai=' + encode_url_component(window.settings.assistants[assistant_id]['clone_original']);
		has_download_url = true;
		//if(assistant_id.startsWith('custom')){
			has_clone_original = true;
		//}
	}
	let webllm_id_part = '';
	
	let config_part = '';
	let chatter_part = '';
	let role_name_part = '';
	//let custom_name_part = '';
	//let custom_description_part = '';
	let system_prompt_part = '';
	let second_prompt_part = '';
	let context_part = '';
	let temperature_part = '';
	let cache_type_k_part = '';
	
	
	if(typeof window.settings.assistants[assistant_id] != 'undefined'){ // checks if anything is different from assistants dict
		
		if(has_download_url == false && typeof assistant_id == 'string' && assistant_id.startsWith('custom_')){
			
			// For custom AI's add the download URL if it exists
			if(typeof window.settings.assistants[assistant_id].download_url == 'string' && window.settings.assistants[assistant_id].download_url.toLowerCase().indexOf('.gguf') != -1){
				//console.log("create_share_prompt_link: custom download_url: ", window.settings.assistants[assistant_id].download_url);
				if(initial){ // && share_prompt_model_download_url.value == ''){
					share_prompt_model_download_url_el.value = window.settings.assistants[assistant_id].download_url;
				}
				ai_part = '?ai=' + encode_url_component(share_prompt_model_download_url_el.value.replace('https://www.huggingface.co/',''));
				has_download_url = true;
			
				// If a download URL exists, then also add config_url, if it exists
				if(typeof window.settings.assistants[assistant_id].config_url == 'string' && window.settings.assistants[assistant_id].config_url.length > 5){
					if(initial){ // if(initial && share_prompt_model_config_url.value == ''){
						share_prompt_model_config_url_el.value = window.settings.assistants[assistant_id].config_url;
					}
					config_part = '&config_url=' + encode_url_component(share_prompt_model_config_url_el.value);
				}
				else if(typeof window.assistants[assistant_id].config_url == 'string' && window.assistants[assistant_id].config_url.length > 5){
					if(initial){ // if(initial && share_prompt_model_config_url.value == ''){
						share_prompt_model_config_url_el.value = window.settings.assistants[assistant_id].config_url;
					}
					config_part = '&config_url=' + encode_url_component(share_prompt_model_config_url_el.value);
				}
				
				if(typeof window.settings.assistants[assistant_id].config_url == 'string' && typeof window.assistants[assistant_id].config_url == 'string' && window.settings.assistants[assistant_id].config_url == window.assistants[assistant_id].config_url){
					config_part = ''; // the config_url is the same as the original's default, so no need to share the data
				}
			}
			else if(typeof window.settings.assistants[assistant_id]["web_llm_file_name"] == 'string' && window.settings.assistants[assistant_id]["web_llm_file_name"] != ''){
				webllm_id_part = '&webllm_id=' + encode_url_component(window.settings.assistants[assistant_id]["web_llm_file_name"]);
			}
			
		}
		
		
		
		// If a custom system prompt exists, then also add it
		if( (typeof window.settings.assistants[assistant_id].system_prompt == 'string' && window.settings.assistants[assistant_id].system_prompt.length > 5) || (typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].system_prompt == 'string' && window.assistants[assistant_id].system_prompt.length > 5) ){
			//console.log("adding system prompt to share link");
			if(typeof window.settings.assistants[assistant_id].system_prompt == 'string' && window.settings.assistants[assistant_id].system_prompt.length > 1){
				if(initial){
					share_prompt_model_system_prompt_el.value = window.settings.assistants[assistant_id].system_prompt;
				}
				if(!assistant_id.startsWith('custom') && typeof window.assistants[assistant_id].system_prompt == 'string' && window.assistants[assistant_id].system_prompt == window.settings.assistants[assistant_id].system_prompt){
					// custom system prompt is the same as the default one, so no need to add it to the share link
					//console.log("share_prompt_link: custom system prompt is the same as the default one, so not adding it:\n\n", window.assistants[assistant_id].system_prompt, "\n\n", window.settings.assistants[assistant_id].system_prompt);
				}
				else{
					
					system_prompt_part = '&system_prompt=' + encode_url_component(window.settings.assistants[assistant_id].system_prompt.replaceAll(' ','_'));
					//console.log("system_prompt_part is now: ", system_prompt_part);
				}
				
			}
			else if(typeof window.assistants[assistant_id].system_prompt == 'string'){
				if(initial){
					share_prompt_model_system_prompt_el.value = window.assistants[assistant_id].system_prompt;
				}
				//system_prompt_part = '&system_prompt=' + encode_url_component(window.settings.assistants[assistant_id].system_prompt.replaceAll(' ','_'));
			}
			
		}
		
		// If a second system prompt exists, then also add it
		if( (typeof window.settings.assistants[assistant_id].second_prompt == 'string' && window.settings.assistants[assistant_id].second_prompt.length > 5) || (typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].second_prompt == 'string') ){
			if(typeof window.settings.assistants[assistant_id].second_prompt == 'string' && window.settings.assistants[assistant_id].second_prompt.length > 1){
				if(initial){
					share_prompt_model_second_prompt_el.value = window.settings.assistants[assistant_id].second_prompt;
				}
				if(typeof window.assistants[assistant_id].second_prompt == 'string' && window.assistants[assistant_id].second_prompt == window.settings.assistants[assistant_id].second_prompt){
					// custom second prompt is the same as the default one, so no need to add it to the share link
				}
				else{
					second_prompt_part = '&second_prompt=' + encode_url_component(window.settings.assistants[assistant_id].second_prompt.replaceAll(' ','_'));
				}
				
			} 
			else if(typeof window.assistants[assistant_id].second_prompt == 'string'){
				if(initial){
					share_prompt_model_second_prompt_el.value = window.assistants[assistant_id].second_prompt;
				}
			}
			
		}
		
		// context
		if( (typeof window.settings.assistants[assistant_id].context == 'number') || (typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].context == 'number') ){
				
			if(typeof window.assistants[assistant_id].context == 'number' && typeof window.settings.assistants[assistant_id].context == 'number' && window.assistants[assistant_id].context != window.settings.assistants[assistant_id].context){	
				//console.log("create_share_prompt_link: context is different from the original, so should be shared.  context_part,original,setting: ", context_part, window.assistants[assistant_id].context, window.settings.assistants[assistant_id].context);
				if(typeof window.settings.assistants[assistant_id].context == 'number' && window.settings.assistants[assistant_id].context > 500){
					context_part = '&context=' + encode_url_component('' + window.settings.assistants[assistant_id].context);
				} 
				else if(typeof window.assistants[assistant_id].context == 'number'){
					context_part = '&context=' + encode_url_component('' + window.assistants[assistant_id].context);
				}
			}		
		}
		
		// temperature
		if( (typeof window.settings.assistants[assistant_id].temperature == 'number' && window.settings.assistants[assistant_id].temperature >= 0 && window.settings.assistants[assistant_id].temperature <= 2) || (typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].temperature == 'number') ){
			//if(initial){ // if(initial && share_prompt_model_system_prompt_el.value == ''){
				//share_prompt_model_second_prompt_el.value = window.settings.assistants[assistant_id].second_prompt;
			//if(has_clone_original){
			if(typeof window.assistants[assistant_id].temperature == 'number' && typeof window.settings.assistants[assistant_id].temperature == 'number' && window.assistants[assistant_id].temperature != window.settings.assistants[assistant_id].temperature){
				if(typeof window.settings.assistants[assistant_id].temperature == 'number'){
					//share_prompt_model_context_el.value = window.settings.assistants[assistant_id].context;
					temperature_part = '&temperature=' + encode_url_component('' + window.settings.assistants[assistant_id].temperature);
				} 
				else if(typeof window.assistants[assistant_id].temperature == 'number'){
					//share_prompt_model_context_el.value = window.assistants[assistant_id].context;
					temperature_part = '&temperature=' + encode_url_component('' + window.assistants[assistant_id].temperature);
				}
			}
			//}
			//temperature_part = '&temperature=' + encode_url_component(share_prompt_temperature_el.value);
		}
		
		// chatter
		if( (typeof window.settings.assistants[assistant_id].chatter == 'boolean') || (typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].chatter == 'boolean') ){
			
			if(typeof window.assistants[assistant_id].chatter == 'boolean' && typeof window.settings.assistants[assistant_id].chatter == 'boolean' && window.assistants[assistant_id].chatter != window.settings.assistants[assistant_id].chatter){	
				if(typeof window.settings.assistants[assistant_id].chatter == 'boolean'){
					chatter_part = '&chatter=' + encode_url_component('' + window.settings.assistants[assistant_id].chatter);
				} 
				else if(typeof window.assistants[assistant_id].chatter == 'boolean'){
					chatter_part = '&chatter=' + encode_url_component('' + window.assistants[assistant_id].chatter);
				}
			}
			
		}
		
		// cache_type_k
		if( (typeof window.settings.assistants[assistant_id].cache_type_k == 'string' && window.settings.assistants[assistant_id].cache_type_k >= 0 && window.settings.assistants[assistant_id].cache_type_k <= 2) || (typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].cache_type_k == 'string') ){
			if(typeof window.assistants[assistant_id].cache_type_k == 'string' && typeof window.settings.assistants[assistant_id].cache_type_k == 'string' && window.assistants[assistant_id].cache_type_k != window.settings.assistants[assistant_id].cache_type_k){	
				if(typeof window.settings.assistants[assistant_id].cache_type_k == 'string'){
					//share_prompt_model_context_el.value = window.settings.assistants[assistant_id].context;
					cache_type_k_part = '&cache_type_k=' + encode_url_component('' + window.settings.assistants[assistant_id].cache_type_k);
				} 
				else if(typeof window.assistants[assistant_id].cache_type_k == 'string'){
					//share_prompt_model_context_el.value = window.assistants[assistant_id].context;
					cache_type_k_part = '&cache_type_k=' + encode_url_component('' + window.assistants[assistant_id].cache_type_k);
				}
			}
		}
		
		
	}
	
	
	let share_link = get_translation('The_link_is_too_long_to_share');
	
	if(config_part.startsWith('https://www.huggingface.co/')){
		config_part = config_part.replace('https://www.huggingface.co/','');
		let config_parts = config_part.split('/');
		if(config_parts.length > 2){
			console.warn("create_share_prompt_link: have to simplify config_url: ", config_part);
			config_part = config_parts[0] + "/" + config_parts[1];
			
		}
	}
	
	
	if( (origin_part.length + prompt_part.length + ai_part.length + config_part.length + webllm_id_part.length + custom_name_part.length + custom_description_part.length + system_prompt_part.length + second_prompt_part.length + cache_type_k_part.length + temperature_part.length + context_part.length + chatter_part.length + custom_name_part.length + custom_description_part.length + emoji_part.length + emoji_bg_part.length) < 2000){
		share_link = origin_part + ai_part + prompt_part + config_part + webllm_id_part + cache_type_k_part + temperature_part + context_part + system_prompt_part + second_prompt_part + chatter_part + custom_name_part + emoji_part + emoji_bg_part + custom_description_part;
	}
	else if( (origin_part.length + prompt_part.length + ai_part.length + config_part.length + webllm_id_part.length + custom_name_part.length + chatter_part.length + custom_description_part.length + system_prompt_part.length + second_prompt_part.length + cache_type_k_part.length + temperature_part.length + context_part.length) < 2000){
		console.error("Cannot create full share link (1)");
		share_link = origin_part + ai_part + prompt_part + config_part + webllm_id_part + cache_type_k_part + temperature_part + context_part + chatter_part + system_prompt_part + second_prompt_part;
	}
	else if( (origin_part.length + prompt_part.length + ai_part.length + config_part.length + webllm_id_part.length + custom_name_part.length + chatter_part.length + custom_description_part.length + system_prompt_part.length + cache_type_k_part.length + temperature_part.length + context_part.length) < 2000){
		console.error("Cannot create full share link (2)");
		share_link = origin_part + ai_part + prompt_part + config_part + webllm_id_part + cache_type_k_part + temperature_part + context_part + chatter_part + system_prompt_part;
	}
	else if( (origin_part.length + prompt_part.length + ai_part.length + config_part.length + webllm_id_part.length + system_prompt_part.length + custom_name_part.length + custom_description_part.length ) < 2000){
		console.error("Cannot create full share link (3)");
		share_link = origin_part + ai_part + prompt_part + config_part + webllm_id_part + custom_name_part + custom_description_part + system_prompt_part;
	}
	else if( (origin_part.length + prompt_part.length + ai_part.length + config_part.length + webllm_id_part.length) < 2000){
		console.error("Cannot create full share link (4)");
		share_link = origin_part + ai_part + prompt_part + config_part + webllm_id_part;
	}
	
	
	//origin_part + config_part + system_prompt_part + second_prompt_part + prompt_part;
	//console.log("create_share_prompt_link:  share_link, share_link.length: ", share_link,  share_link.length);
	
	let model_info_share_link_el = document.getElementById('model-info-share-clone-link-text');
	if(model_info_share_link_el){
		model_info_share_link_el.textContent = share_link;
	}
	else{
		share_prompt_link_el.textContent = share_link;
	}
	
	return share_link;
}





/*
function save_custom_ai(){
	//console.log("in save_custom_ai");
}

*/





/*
function abort_download(assistant_id){
	//console.log("in abort_download.  assistant_id: ", assistant_id);
	// TODO: implement download abort in service worker? https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort
}
*/




function load_chat_example(){
	
	// If first run, try to start with a small model so that the user doesn't have to wait too long
	if(window.first_run){
		if(window.ram > 3000 && window.settings.language == 'en'){
			if(window.web_gpu_supported){
				switch_assistant('fast_gemma_2_2b');
			}
			else if(window.web_gpu32_supported){
				switch_assistant('fast_gemma_2_2b_32bit');
			}
			else{
				switch_assistant('gemma_2_2b');
			}
		}
		else{
			switch_assistant('danube_3_500m');
		}
	}
	else{
		switch_assistant('any_writer');
	}
	setTimeout(() => {
		prompt_el.focus();
	},100);
}




function load_cleopatra_example(){
	//console.log("in load_cleopatra_example");
	window.settings.assistants['actor1'] = {
		"selected":true,
		"prefered_voice_gender":"female",
		"role_name":"Cleopatra",
		"chatter":true,
		"system_prompt":`You are Cleopatra. Embody the character and personality completely.

Cleopatra is the powerful ruler of ancient Egypt, with a love of riddles and a passion for politics. She loves looking at the night sky, wondering what the gods have in store for her.`,
		"second_prompt":`Cleopatra
*Cleopatra strides into the room with a smile, her eyes lighting up when she sees you. She's wearing a gown make of gold and silk, and carries a mysterious piece of rolled up parchment, and a golden quill. She takes a seat next to you, her enthusiasm palpable in the air* Hello, I'm so excited to finally meet you. I've heard you're a time traveler from a distant future, and I'm eager to pick your brain about the future, and tell you about my life in Egypt. I'm sure you have a wealth of knowledge that I can learn from. *She grins, eyes twinkling with excitement* Let's get started!`,
	}
	
	document.body.classList.add('cleopatra');
	
	let cleopatra_tts_task = {
		'prompt':null,
		'origin':'chat',
		'assistant':'actor',
		'type':'speak',
		'state':'should_tts',
		'sentence': get_translation("Hello_I_am_Cleopatra"),
		'destination':'audio_player',
		'input_language':window.settings.language,
	}
	window.add_task(cleopatra_tts_task);

	let cleopatra_tts_task2 = {
		'prompt':null,
		'origin':'chat',
		'assistant':'actor',
		'type':'speak',
		'state':'should_tts',
		'sentence': get_translation("What_a_pleasure_to_meet_you"),
		'destination':'audio_player',
		'input_language':window.settings.language,
	}
	window.add_task(cleopatra_tts_task2);

	let cleopatra_tts_task3 = {
		'prompt':null,
		'origin':'chat',
		'assistant':'actor',
		'type':'speak',
		'state':'should_tts',
		'sentence': get_translation("I_hear_you_are_from_the_future"),
		'destination':'audio_player',
		'input_language':window.settings.language,
	}
	window.add_task(cleopatra_tts_task3);
	
	add_chat_message('actor','actor',get_translation("Hello_I_am_Cleopatra"),"Hello_I_am_Cleopatra");
	setTimeout(() => {
		add_chat_message('actor','actor',get_translation("What_a_pleasure_to_meet_you"),"What_a_pleasure_to_meet_you");
	},2000);
	setTimeout(() => {
		add_chat_message('actor','actor',get_translation("I_hear_you_are_from_the_future"),"I_hear_you_are_from_the_future");
	},4000);



	// TODO: add a picture of Cleopatra and select it, so it shows up on the right? But only on a wide screen? And then hide the sidebar. Or enable partial parchment mode for the chat
}



function load_leonardo_example(){
	//console.log("in load_leonardo_example");
	window.settings.assistants['actor_nous_capybara'] = {
		"selected":true,
		"prefered_voice_gender":"male",
		"role_name":"Leonardo",
		"chatter":true,
		"system_prompt":"A conversation between a user and a Leonardo Da Vinci, the famous inventor and painter. De Vinci is busy in his workshop in Venice, building fantastical new inventions. He begrudgingly answers the user's questions."
	}
	document.body.classList.add('cleopatra');

	if(window.settings.language = 'en'){
		window.settings.voice = 'US male 1';
	}
	else{
		window.settings.voice = 'basic';
	}
	window.settings.voice_gender = 'male';

	let leonardo_tts_task = {
		'prompt':null,
		'origin':'chat',
		'assistant':'actor',
		'type':'speak',
		'state':'should_tts',
		'sentence': get_translation("Hello_I_am_Leonardo_Da_vinci"),
		'destination':'audio_player',
		'input_language':window.settings.language,
	}
	window.add_task(leonardo_tts_task);

	let leonardo_tts_task2 = {
		'prompt':null,
		'origin':'chat',
		'assistant':'actor',
		'type':'speak',
		'state':'should_tts',
		'sentence': get_translation("What_a_pleasure_to_meet_you"),
		'destination':'audio_player',
		'input_language':window.settings.language,
	}
	window.add_task(leonardo_tts_task2);

	let leonardo_tts_task3 = {
		'prompt':null,
		'origin':'chat',
		'assistant':'actor',
		'type':'speak',
		'state':'should_tts',
		'sentence': get_translation("I_hear_you_are_from_the_future"),
		'destination':'audio_player',
		'input_language':window.settings.language,
	}
	window.add_task(leonardo_tts_task3);
	
	add_chat_message('actor_nous_capybara','actor_nous_capybara',get_translation("Hello_I_am_Leonardo_Da_vinci"),"Hello_I_am_Leonardo_Da_vinci");
	setTimeout(() => {
		add_chat_message('actor_nous_capybara','actor_nous_capybara',get_translation("What_a_pleasure_to_meet_you"),"What_a_pleasure_to_meet_you");
	},2000);
	setTimeout(() => {
		add_chat_message('actor_nous_capybara','actor_nous_capybara',get_translation("I_hear_you_are_from_the_future"),"I_hear_you_are_from_the_future");
	},4000);
	


	// TODO: add a picture of Leonardo and select it, so it shows up on the right? But only on a wide screen? And then hide the sidebar. Or enable partial parchment mode for the chat
}



function load_voice_chat_example(){
	if(window.ram > 4000){
		let tts_task = {
			'prompt':null,
			'type':'speak',
			'state':'should_tts',
			'sentence': get_translation("Hello"),
			'destination':'audio_player'
		}
	
		window.add_task(tts_task);
	}
	
}
window.load_voice_chat_example = load_voice_chat_example;



function load_write_code_example(){
	//load_meeting_notes_example('js','// This editor has built-in support for linting, prettyfying and running code.\n');
	load_meeting_notes_example('js','// ' + get_translation('This_editor_has_built-in_support_for_linting_prettyfying_and_running_code') + '.\n\n');
}
window.load_write_code_example = load_write_code_example;




// This function has become increasingly important, and is now used more widely than just the single example functionality
async function load_meeting_notes_example(type='txt',document_content='', filename=''){
	console.log("in load_meeting_notes_example.  type, document_content, filename: ", type, document_content, filename);
	if(typeof type != 'string'){ 
		type = 'txt';
	}
	if(typeof document_content != 'string'){
		document_content = '';
	}
	
	// Scribe SRT
	if(window.settings.assistant == 'scribe' && type == 'srt'){
		document_content = '';
	}
	// Scribe VTT
	else if(window.settings.assistant == 'scribe' && type == 'vtt'){
		document_content = '';
	}
	 // Scribe JSON
	else if(window.settings.assistant == 'scribe' && type == 'json'){
		document_content = '[]';
	}
	else if(window.settings.assistant == 'scribe' && type == 'notes' && filename != ''){
		document_content = get_translation('Meeting') + ' ' + date_string + '\n\n';
	}
	
	
	
	if(type == 'notes' && document_content == '' && filename == '' && window.assistant != 'scribe'){
		type = 'txt';
	}
	
	//console.log("in load_meeting_notes_example");
	const d = new Date();
	let date_string = d.toLocaleString([],{year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'});
	
	date_string = date_string.replaceAll('/','-');
	date_string = date_string.replace(':','h');
	

	if(typeof filename == 'string'){
		if(filename == ''){
			if(type == 'srt'){
				filename = get_translation('Subtitles') + ' ' + date_string + '.srt';
			}
			if(type == 'vtt'){
				filename = get_translation('Subtitles') + ' ' + date_string + '.vtt';
			}
			else if(type == 'json'){
				filename = get_translation('Transcription') + ' ' + date_string + '.json';
			}
			else if(type == 'media_transcription'){
				type = 'notes';
				filename = get_translation('Transcription') + ' ' + date_string + '.notes';
			}
			else if(type == 'notes' || window.settings.assistant == 'scribe'){
				filename = get_translation('Meeting') + ' ' + date_string + '.notes';
			}
			else{
				filename = get_translation('Transcription') + ' ' + date_string + '.' + type;
			}
		}
		else{
			if(type == 'media_transcription'){
				type = 'notes';
			}
			filename = filename + ' ' + date_string + '.' + type;
		}
		
	}
	else{
		if(type == 'media_transcription'){
			type = 'notes';
		}
		filename = get_translation('Transcription')  + ' ' + date_string + '.' + type;
		
	}
	
	filename = sanitize_filename(filename);
	
	
	try{
		await create_new_document(document_content, filename);
		await open_file(filename);
		scroll_to_end();
		return true
	}
	catch(err){
		console.error("load_meeting_notes_example:  caught error while trying to create new document: ", err);
		return false
	}
	
}
window.load_meeting_notes_example = load_meeting_notes_example;





function load_generate_a_subtitle_example(){
	//window.settings.assistants['scribe'].add_timestamps = 'Precise';
	if(window.microphone_enabled){
		window.disable_microphone();
	}
	window.do_after_command = 'start_subtitle_file_transcription';
	upload_file_input_el.click();
	
	//window.unshrink_chat();
	/*
	if(window.innerWidth > 640){
		document.body.classList.add('show-rewrite');
	}
	*/
	
	
	
	//load_meeting_notes_example('srt','\n');
}


// A poor man's promise
// DO_AFTER - Used to enhance functionalities, parses a window.do_after_command
function do_after(command=null,command_type='any'){
	//console.log("in do_after.  command,command_type: ", command, command_type);
	
	if(typeof command != 'string' && typeof window.do_after_command == 'string'){
		command = '' + window.do_after_command;
		//console.log("do_after. found window.do_after_command: ", command);
	}
	
	
	if(typeof command == 'string'){
		//console.log("do_after: got command: ", command);
		
		if(command_type == 'any' || command_type == 'media'){
			if(command == 'start_file_transcription'){
				let start_file_transcription_button_el = document.getElementById('start-file-transcription-button');
				if(start_file_transcription_button_el){
					//console.log("clicking on start_file_transcription_button_el");
					start_file_transcription_button_el.click();
				}
				else{
					console.error("do_after: did not find start_file_transcription_button_el");
				}
				window.do_after_command = null;
			}
			else if(command == 'start_subtitle_file_transcription'){
				let start_subtitle_file_transcription_button_el = document.getElementById('start-subtitle-file-transcription-button');
				if(start_subtitle_file_transcription_button_el){
					//console.log("clicking on start_subtitle_file_transcription_button_el");
					start_subtitle_file_transcription_button_el.click();
				}
				else{
					console.error("do_after: did not find start_file_transcription_button_el");
				}
				window.do_after_command = null;
			}
			else if(command == 'start_video'){
				let media_player_el = document.getElementById('media-player');
				if(media_player_el){
					//console.log("do_after: starting video player");
					media_player_el.play(); // doesn't work, not allowed
				}
				else{
					console.error("do_after: did not find media_player_el");
				}
				
			}
		}
		
		if(command_type == 'any' || command_type == 'file'){
			if(command == 'summarize_document_after_upload'){
				//console.log("do_after: calling prepare_summarize_document");
				window.prepare_summarize_document();
				//window.do_after_command = null;
				if(command_type == 'file'){
					//console.log("do_after: setting window.do_after_command back to null after handling a file upload related command: ", window.do_after_command);
					window.do_after_command = null;
				}
			}
			else if(command == 'translate_document_after_upload'){
				//console.log("do_after: calling prepare_translate_document");
				window.prepare_translate_document();
				//window.do_after_command = null;
				if(command_type == 'file'){
					//console.log("do_after: setting window.do_after_command back to null after handling a file upload related command: ", window.do_after_command);
					window.do_after_command = null;
				}
			}
			
			
		}
		
	}
}
window.do_after = do_after;





function load_scan_a_document_example(){
	//console.log("in load_scan_a_document_example");
	
	//load_meeting_notes_example('txt','// ' + get_translation('This_editor_has_built-in_support_for_linting_prettyfying_and_running_code') + '.\n\n');
	load_meeting_notes_example('txt','\n');
	
	window.start_ocr();
	translation_details_el.removeAttribute('open');
}
window.load_scan_a_document_example = load_scan_a_document_example;




function load_live_camera_translation_example(){
	//console.log("in load_live_camera_translation_example");
	if(window.innerWidth < 980){
		close_sidebar();
	}
	if(window.innerWidth < 641){
		document.body.classList.remove('show-document');
	}
	window.switch_assistant('translator');
	document.body.classList.add('show-rewrite');
	
	translation_details_el.setAttribute('open',true); // superfluous? Opening the translator should already open this
	live_translation_output_el.value = '';
	
	camera_image_to_text_details_el.open = true;
	camera_image_to_text_auto_scan_input_el.checked = true;
	window.continuous_image_to_text_enabled = true;
	window.settings.continuous_image_to_text_scan = true;
	// not saving this as a setting
	
	window.add_script('./camera_module.js',true) // add it as a module
	.then((value) => {
		//console.log("load_live_camera_translation_example: camera module loaded? ", value, ", typeof window.start_camera: ", typeof window.start_camera);
		const start_camera_promise = window.start_camera();
		//console.log("typeof start_camera_promise: ", start_camera_promise);
		return start_camera_promise;
	})
	.then((value) => {
		//console.log("load_live_camera_translation_example: camera started? ", value);
		return window.add_script('./image_to_text_module.js',true);
	})
	.then((value) => {
		//console.log("load_live_camera_translation_example: image_to_text  module loaded? ", value);
		//console.log("typeof window.do_continuous_image_to_text: ", typeof window.do_continuous_image_to_text);
		setTimeout(() => {
			window.do_continuous_image_to_text();
		},100);
		
		
	})
	.catch((err) => {
		console.error("load_live_camera_translation_example: caught error loading camera_module or image_to_text module script: ", err);
	})
	
	live_image_to_text_output_el.value = '';
	
	//window.do_continuous_image_to_text();
	translation_details_el.setAttribute('open',true);
	
	live_image_to_text_prompt_el.value = 'What is the text in the image?';
	
}


function load_image_to_text_example(){
	prompt_el.value = get_translation('Describe_the_image');
	document.body.classList.remove('hide-camera-still');
	if(window.innerWidth > 640){
		create_new_document('',get_translation('Image_description') + ' ' + make_date_string() + '.txt' );
	}
	
}

function load_live_image_to_text_example(){
	//console.log("in load_live_image_to_text_example");
	document.body.classList.add('show-rewrite');
	
	if(window.innerWidth < 980){
		close_sidebar();
	}
	
	window.switch_assistant('scribe'); // When this assistant is active timestamps will also be added
	//if(window.settings.assistants['scribe'].add_timestamps == 'None'){}
	//window.settings.assistants['scribe'].add_timestamps = 'Minutes'
	
	window.last_time_continuous_image_to_text_started = Date.now();
	
	if(window.innerWidth > 640){
		load_meeting_notes_example('txt', get_translation('The_image_describer_AI_can_run_continuously') + '\n\n');
		camera_image_to_text_save_auto_scan_input_el.checked = true;
		window.settings.save_image_to_text_scan = true;
		// not saving this as a setting
	}
	camera_image_to_text_details_el.open = true;
	window.continuous_image_to_text_enabled = true;
	
	camera_image_to_text_auto_scan_input_el.checked = true;
	window.settings.continuous_image_to_text_scan = true;
	// not saving this as a setting
	
	
	window.add_script('./camera_module.js',true) // add it as a module
	.then(() => {
		return window.start_camera();
	})
	.then(() => {
		return window.add_script('./image_to_text_module.js',true);
	})
	.then(() => {
		document.body.classList.add('doing-image-to-text');
		window.do_continuous_image_to_text();
		
	})
	.catch((err) => {
		console.error("load_live_image_to_text_example: caught error loading camera_module or image_to_text module script: ", err);
		document.body.classList.remove('doing-image-to-text');
	})
	
	live_image_to_text_output_el.value = '';
	
	translation_details_el.removeAttribute('open');
	
	
}
window.load_scan_a_document_example = load_scan_a_document_example;




function load_fairytale_example(){
	//console.log("in load_fairytale_example");
	switch_assistant('any_writer');
	window.add_script('./specials/fairytale_example.js')
	.then((value) => {
		create_fairytale_document();
	})
	.catch((err) => {
		console.error("caught error in load_fairytale_example: ", err);
	})
}




function load_blueprint_voice_conversation_example(){
	//console.log("in load_blueprint_voice_conversation_example");
	window.add_script('./specials/blueprint_voice_conversation.js');
}
window.load_blueprint_voice_conversation_example = load_blueprint_voice_conversation_example;


function load_improve_a_document_example(){
	//console.log("in load_improve_a_document_example");
	//document.body.classList.add('show-document-chat-upload-button');
	upload_file_input_el.click();
	window.unshrink_chat();
	if(window.innerWidth > 640){
		document.body.classList.add('show-rewrite');
	}
}


function load_summarize_a_document_example(){
	//console.log("in load_summarize_a_document_example");
	upload_file_input_el.click();
	//window.unshrink_chat();
	document.body.classList.add('show-rewrite');
	window.do_after_command = 'summarize_document_after_upload';
}

function load_translate_a_document_example(){
	//console.log("in load_translate_a_document_example");
	upload_file_input_el.click();
	//window.unshrink_chat();
	document.body.classList.add('show-rewrite');
	window.do_after_command = 'translate_document_after_upload';
}


function load_chat_with_a_document_example(){
	//console.log("in load_chat_with_a_document_example");
	document.body.classList.add('show-document-chat-upload-button');
	document.body.classList.remove('show-rewrite');
	document_chat_upload_input_el.click();
}


function load_search_many_documents_example(){
	//console.log("in load_chat_with_a_document_example");
	document.body.classList.remove('show-rewrite');
	sidebar_rag_select_all_button_el.click();
}










function update_rewrite_results_indicator(){
	//console.log("in update_rewrite_results_indicator. rewrite_results_dialog_content_container_el.children.length: ", rewrite_results_dialog_content_container_el.children.length);
	if(rewrite_results_dialog_content_container_el.children.length){
		document.body.classList.add('show-rewrite-results');
	}
	else{
		document.body.classList.remove('show-rewrite-results');
	}	
}






function handle_download_complete(){
	//console.log("in handle_download_complete")
	show_models_info(false); // updates the user disk space number in the settings menu
	document.body.classList.remove('busy-downloading');
}
window.handle_download_complete = handle_download_complete;



// cleanup dead task cleanup_task
function clean_up_dead_task(task=null, new_state='failed'){
	//console.log("in clean_up_dead_task. task,new_state: ", task,new_state);
	if(typeof new_state != 'string'){
		new_state = 'failed';
	}
	
	if(task != null){
		if(typeof task.index == 'number'){
			let possible_dead_rewrite_container_el = document.getElementById('rewrite-result' + task.index);
			if(possible_dead_rewrite_container_el){
				possible_dead_rewrite_container_el.remove();
			}
		}
		if(typeof task.parent_index == 'number'){
			let possible_dead_rewrite_container_el = document.getElementById('rewrite-result' + task.parent_index);
			if(possible_dead_rewrite_container_el){
				possible_dead_rewrite_container_el.remove();
			}
		}
	}
	else{
		console.error("clean_up_dead_task: no task provided (task was null)");
	}
	//set_task_state(task,new_state);
	//handle_completed_task(task,false,{'state':'failed'});
	
	message_downloads_container_el.innerHTML = '';
	
	document.body.classList.remove('waiting-for-response');
	document.body.classList.remove('working-on-doc');
	document.body.classList.remove('doing-assistant');
	document.body.classList.remove('doing-proofread');
	document.body.classList.remove('doing-summarize');
	document.body.classList.remove('doing-rewrite');
	document.body.classList.remove('doing-translation');
	document.body.classList.remove('doing-continue');
	
	remove_highlight_selection();
	
}
window.clean_up_dead_task = clean_up_dead_task;




function update_interrupt_button_icon(){
	//console.log("in update_interrupt_button_icon");
	if(typeof window.currently_running_llm == 'string' || window.idle){
		
		let icon_name = window.settings.assistant;
		if(typeof window.currently_running_llm == 'string' && !window.currently_running_llm.startsWith('custom_saved')){
			icon_name = window.currently_running_llm;
		}
		
		if(typeof window.assistants[icon_name] != 'undefined' && typeof window.assistants[icon_name].icon == 'string' && window.assistants[icon_name].icon.length){
			icon_name = window.assistants[icon_name].icon;
		}
		stop_assistant_button_assistant_icon_el.src = 'images/' + icon_name + '_thumb.png';
		
		if(window.currently_running_llm != window.settings.assistant){
			//console.log("currently running AI is different than the one being viewed.  window.currently_running_llm vs window.settings.assistant: ", window.currently_running_llm, window.settings.assistant);
			document.body.classList.add('other-ai-running');
		}
		else{
			document.body.classList.remove('other-ai-running');
			//console.log("currently running AI is the same as the one being viewed: ", window.currently_running_llm);
		}
	}
	else{
		console.error("update_interrupt_button_icon: window.currently_running_llm was not a string (null)");
		document.body.classList.remove('other-ai-running');
	}
}
window.update_interrupt_button_icon = update_interrupt_button_icon;




function create_time_remaining_html(time_remaining, add_to_go=true){
	let remaining_minutes = Math.floor(time_remaining / 60);
	if(remaining_minutes > 999){
		remaining_minutes = 999;
	}
	let remaining_seconds = Math.round(time_remaining % 60);
	if(remaining_seconds < 10){
		remaining_seconds = '0' + remaining_seconds;
	}
	// console.log("time remaining: minutes, seconds: ", remaining_minutes, remaining_seconds);
	
	let time_remaining_text = remaining_seconds + ' ';
	if(add_to_go){
		time_remaining_text = time_remaining_text + '<span class="to-go-postfix" data-i18n="to_go">' + window.get_translation('to_go') + '</span>';
	}
	if(remaining_minutes > 0){
		time_remaining_text = remaining_minutes + ':' + time_remaining_text;
	}
	//if(add_to_go){
		time_remaining_text = '⏳ ' + time_remaining_text;
	//}
	
	return time_remaining_text;
}
window.get_time_remaining_html = create_time_remaining_html; // TODO: fix this
window.create_time_remaining_html = create_time_remaining_html;


function get_nice_language_name(language_code){
	//console.log("get_nice_language_name:  language_code,window.settings.language:", language_code, " -> ", window.settings.language);
	
	// Brave doesn't seem to know all languages
	if(language_code == 'ss'){
		//console.log("SWATI");
		return 'Swati'
	}
	else if(language_code == 'ba'){
		//console.log("BASHKIR");
		return 'Bashkir'
	}
	else if(language_code == 'ff'){
		//console.log("FULAH");
		return 'Fulah'
	}
	else if(language_code == 'ns'){
		//console.log("NORTHERN SOTO");
		return 'Northern Sotho'
	}
	
	try{
		
		if(typeof window.settings.language == 'string' && typeof window.language_names[window.settings.language] == 'undefined'){
			//console.log("get_nice_language_name: trying to create DisplayNames lookup for: ", window.settings.language);
			window.language_names[window.settings.language] = new Intl.DisplayNames([window.settings.language], { type: "language" });
		}
	
		if(window.language_names[window.settings.language]){
			let nicer_name = window.language_names[window.settings.language].of(language_code);
			if(typeof nicer_name == 'string'){
				return nicer_name;
			}
			else{
				console.error("did not find language code in browser's lookup table.  language_code: ", language_code);
			}
		}
		else{
			console.error("get_nice_language_name: failed to create DisplayNames lookup for: ", window.settings.language);
		}
		/*
		let language_names_lookup = new Intl.DisplayNames(["en"], { type: "language" });
		const nicer_name = language_names_lookup.of(language_code);
		return nicer_name;
		*/
	}
	catch(err){
		//console.error("get_nice_language_name: failed to create DisplayNames lookup for:   window.settings.language,language_code: ", window.settings.language, language_code, " -> err: ",err);
	}
	
	
	
	
	
	return language_code;
}



function add_recent_rewrite_prompt(type,prompt){
	//console.log("in add_recent_rewrite_prompt.  type,prompt: ", type,prompt);
	
	if(typeof prompt == 'string' && prompt.length > 2){
		
		
		prompt = type + '__!__ ' + prompt;
		
		const prompt_index = window.settings.recent_rewrite_prompts.indexOf(prompt);
		
		if(prompt_index != -1){
			window.settings.recent_rewrite_prompts.splice(prompt_index,1);
		}
		
		window.settings.recent_rewrite_prompts.unshift(prompt);
		
		if(window.settings.recent_rewrite_prompts.length > 3){
			window.settings.recent_rewrite_prompts = window.settings.recent_rewrite_prompts.slice(0,3);
		}
		save_settings();
		
		generate_selection_quick_actions();
		
	}
	
}


function generate_selection_quick_actions(){
	doc_selection_hint_quick_actions_el.innerHTML = '';
	let existing_button_texts = [];
	for(let q = 0; q < window.settings.recent_rewrite_prompts.length; q++){
		
		let quick_prompt = window.settings.recent_rewrite_prompts[q];
		
		let type = 'rewrite';
		
		if(quick_prompt.indexOf('__!__ ') != -1){
			type = quick_prompt.split('__!__ ')[0];
			quick_prompt = quick_prompt.split('__!__ ')[1];
		}
		
		let quick_action_item_el = document.createElement('div');
		quick_action_item_el.setAttribute('title',quick_prompt);
		quick_action_item_el.classList.add('selection-quick-action-item');
		//console.log("window.settings.recent_rewrite_prompts[q]: ", window.settings.recent_rewrite_prompts[q]);
		
		
		let button_text = quick_prompt;
		
		if(button_text == get_translation('summarize_bullet_points')){
			button_text = get_translation('bullet_points');
			//console.log("generate_quick_selection_actions: summarize_bullet_points: summarize_bullet_points.. stripped button_text: ", button_text);
		}
		else if(button_text == get_translation('summarize_very_short')){
			button_text = get_translation('Very_short_summary');
			//console.log("generate_quick_selection_actions: summarize_bullet_points: summarize_very_short.. stripped button_text: ", button_text);
		}
		else if(button_text == get_translation('summarize_short')){
			button_text = get_translation('Short_summary');
			//console.log("generate_quick_selection_actions: summarize_short: summarize_very_short.. stripped button_text: ", button_text);
		}
		
		button_text = button_text.replace(get_translation('rewrite_the_following_text_to_be_more'),'');
		button_text = button_text.replace(get_translation('rewrite_the_following_text',''));
		button_text = button_text.trim();
		if(button_text.endsWith('.') || button_text.endsWith('!') || button_text.endsWith('?')){
			button_text = button_text.substr(0,button_text.length-1);
		}
		if(button_text.length > 20){
			//console.log("generate_quick_selection_actions: still too long, going to loop over words and pick the last long ones: ", button_text);
			//button_text = button_text.substr(button_text.length - 50);
			//if(button_text.indexOf(' ') != -1 && button_text.indexOf(' ') < 30){
				//button_text = button_text.substr(button_text.indexOf(' '));
			//}
			
			let button_text_parts = button_text.split(' ');
			let new_button_text = '';
			
			for(let b = button_text_parts.length - 1; b > 0; --b){
				if(typeof button_text_parts[b] == 'string' && button_text_parts[b].length > 4 && new_button_text.length <= 15){
					new_button_text =  button_text_parts[b] + ' ' + new_button_text;
				}
			}
			if(new_button_text == ''){
				for(let b = button_text_parts.length - 1; b > 0; --b){
					if(typeof button_text_parts[b] == 'string' && button_text_parts[b].length > 3 && new_button_text.length <= 15){
						new_button_text += button_text_parts[b] + ' ' + new_button_text;
					}
				}
			}
			new_button_text = new_button_text.trim();
			
			if(new_button_text.length > 3){
				//console.log("shortened button text: ", button_text, " -> ", new_button_text);
				button_text = new_button_text;
			}
			
			
		}
		
		if(button_text.length > 2){
			if(existing_button_texts.indexOf(button_text) == -1){
				existing_button_texts.push(button_text);
				quick_action_item_el.innerText = button_text;
				quick_action_item_el.addEventListener('click', () => {
					rewrite_selection(type,window.doc_selected_text,1,null,quick_prompt,true); // the last parameter is feeling_lucky
				})
				doc_selection_hint_quick_actions_el.appendChild(quick_action_item_el);
			}
			else{
				console.error("almost created a duplicate quick action button");
			}
			
		}
		
	}
}
generate_selection_quick_actions();








function update_scribe_clock(){
	//console.log("in update_scribe_clock");
	if(window.scribe_clock_time_elapsed_el != null && typeof window.last_time_scribe_started == 'number' && window.last_time_scribe_started != 0){
		const now_date = new Date();
		const now_stamp = new Date().getTime();
		//const now_stamp = date_object.getTime();
		let scribe_start_date = new Date(window.last_time_scribe_started);
		let scribe_end_date = new Date(window.last_time_scribe_started + window.maximum_scribe_duration);
		let time_elapsed = now_stamp - window.last_time_scribe_started;
		const maximum_duration = window.maximum_scribe_duration;
		//let time_remaining = (window.last_time_scribe_started + maximum_duration) - time_elapsed;
		let time_remaining = maximum_duration - time_elapsed;
		//console.log("update_scribe_clock: time_remaining: ", time_remaining);
		
		let delta = Math.round( (now_stamp - window.last_time_scribe_started) / 1000);
		let delta_minutes = Math.floor(delta/60);
		let delta_seconds = (delta % 60);
		if(delta_minutes < 10){
			delta_minutes = '0' + delta_minutes;
		}
		if(delta_seconds < 10){
			delta_seconds = '0' + delta_seconds;
		}
		window.scribe_clock_time_elapsed_el.textContent = delta_minutes + ':' + delta_seconds + '';
		window.scribe_clock_time_remaining_el.innerHTML = window.create_time_remaining_html(Math.floor(time_remaining/1000),false);
		
		window.scribe_clock_progress_el.value = time_elapsed / maximum_duration;
		
	}
	
}






//window.pip_header_canvas_context = window.pip_header_canvas.getContext("2d");

window.pip_video = document.createElement("video");

// Picture in Picture
window.pip_canvas = document.createElement("canvas");
window.pip_canvas_context = window.pip_canvas.getContext("2d");
window.pip_header_canvas = document.createElement("canvas");
window.pip_canvas.width = 480;
window.pip_canvas.height = 640;
window.pip_header_canvas.width = 480;
window.pip_header_canvas.height = 50;
//async function load_pip_image(url) {
//  return new Promise(r => { let i = new Image(); i.onload = (() => r(i)); i.src = url; });
//}

const pip_button_el = document.getElementById('do-pip-button');
pip_button_el.addEventListener('click', async (event) => {
	console.log("clicked on do-pip-button");
	event.preventDefault();
	event.stopPropagation();
	window.pip_started = true;
	
	

	
	window.pip_canvas_context.fillStyle = "white";
	window.pip_canvas_context.font = "bold 16px Arial";
	//window.pip_canvas_context.fillText("Zibri", (window.pip_canvas.width / 2) - 17, (window.pip_canvas.height / 2) + 8);

	var img1 = new Image();

    //drawing of the test image - img1
    img1.onload = function () {
        //draw background image
		const pip_header_canvas_context = window.pip_header_canvas.getContext("2d");
		pip_header_canvas_context.drawImage(img1, 0, 0);
        //draw a box over the top
        //ctx.fillStyle = "rgba(200, 0, 0, 0.5)";
        //ctx.fillRect(0, 0, 500, 500);
		write_on_pip_canvas(window.get_translation('AI_responses_will_be_shown_here'));
		window.pip_video.srcObject = window.pip_canvas.captureStream(0);
    };

    img1.src = './images/pip_header.png';
	
	
	window.pip_video.addEventListener("canplaythrough", () => {
		window.pip_video.play();
		window.pip_video.requestPictureInPicture();
	});
	
	window.pip_video.play();
	
});


function write_on_pip_canvas(text=null){
	
	if(window.pip_started && window.canvasTxt && typeof text == 'string'){
		//console.log("write_on_pip_canvas: writing");
		const { drawText, getTextHeight, splitText } = window.canvasTxt; // https://github.com/geongeorge/Canvas-Txt/
		
		window.pip_canvas_context.clearRect(0, 0, window.pip_canvas.width, window.pip_canvas.height);
		
		
		
		
		//window.pip_canvas_context.fillStyle = "white";
		//window.pip_canvas_context.font = "bold 16px Arial";
		
		if(text.length < 500){
			
			window.pip_canvas_context.drawImage(window.pip_header_canvas, 5, 5);
			
			const { height } = drawText(window.pip_canvas_context, text, {
				x: 20,
				y: 70,
				width: (window.pip_canvas.width - 40),
				height: (window.pip_canvas.height - 90),
				fontSize: 24,
				align:'left',
				vAlign:'top',
				lineHeight:35,
				debug:false,
			});
		
			
			
			//console.log(`write_on_canvas: total height = ${height}`);
		
			if(height < window.pip_canvas.height - 90){
				window.pip_video.srcObject = window.pip_canvas.captureStream(0);
				return
			}
			else{
				window.pip_canvas_context.clearRect(0, 0, window.pip_canvas.width, window.pip_canvas.height);
			}
		}
		
		
		drawText(window.pip_canvas_context, text, {
			x: 20,
			y: 20,
			width: (window.pip_canvas.width - 40),
			height: (window.pip_canvas.height - 40),
			fontSize: 24,
			align:'left',
			vAlign:'bottom',
			lineHeight:35,
			debug:false,
		});
		
		
		window.pip_video.srcObject = window.pip_canvas.captureStream(0);
		
	}
	
}
window.write_on_pip_canvas = write_on_pip_canvas;



function image_to_pip_canvas(image_blob){
	console.log("in image_to_pip_canvas.  window.pip_started,typeof image_blob: ", window.pip_started, typeof image_blob);
	if(window.pip_started && typeof image_blob != 'undefined'){
		window.pip_canvas_context.clearRect(0, 0, window.pip_canvas.width, window.pip_canvas.height);
		window.pip_canvas_context.drawImage(window.pip_header_canvas, 5, 5);
		console.log("image_to_pip_canvas: creating image");
		var img1 = new Image();
		img1.onload = function(event) {
			console.log("image_to_pip_canvas: blob succesfully loaded into image");
			if(typeof img1.width == 'number' && img1.width > 0){
				const ratio = window.pip_canvas.width / img1.width;
				console.log("image_to_pip_canvas: ratio: ", ratio);
				const centerShift_y = ( window.pip_canvas.height - img1.height*ratio ) / 2;  
				var centerShift_x = ( window.pip_canvas.width - img1.width*ratio ) / 2;
				console.log("image_to_pip_canvas: centerShift_x: ", centerShift_x);
				console.log("image_to_pip_canvas: centerShift_y: ", centerShift_y);
				window.pip_canvas_context.drawImage(img1, 0,0, img1.width, img1.height, centerShift_x, centerShift_y, img1.width*ratio, img1.height*ratio); 
				window.pip_video.srcObject = window.pip_canvas.captureStream(0);
			}
			else{
				console.error("image_to_pip_canvas: img did not have valid width: ", typeof img1.width, img1.width);
			}
			
		    //ctx.drawImage(img1, 0, 70);
			URL.revokeObjectURL(event.target.src);
		}
		img1.src = URL.createObjectURL(image_blob);
	}
	else{
		console.warn("image_to_pip_canvas: pip not started, or invalid image blob provided.  window.pip_started,typeof image_blob: ", window.pip_started, typeof image_blob);
	}
	
}
window.image_to_pip_canvas = image_to_pip_canvas;






function select_paragraph(direction='next',allow_empty=false){
	console.log("in select_paragraph. direction: ", direction);
	let selected_paragraph = null;
	try{
		selected_paragraph = really_select_paragraph(direction,allow_empty);
		
		if(selected_paragraph){
			console.log("select_paragraph: selected paragraph: ", selected_paragraph, selected_paragraph.textContent);
			
			if(window.settings.docs.open != null){
			
				remove_highlight_selection();
			
				if(selected_paragraph.textContent.trim() != '' && selected_paragraph.textContent.trim() != '\n'){
					console.log("selected_paragraph.textContent.length: ", selected_paragraph.textContent.length);
					window.select_element_text(selected_paragraph);
				
					console.log("select_paragraph: paragraph element has text. calling highlight_selection_from_task");
					let cursor = highlight_selection_from_task({'sentence': selected_paragraph.textContent ,'file':window.settings.docs.open});
					console.log("select_paragraph: cursor from highlight_selection_from_task: ", cursor);
				
					if(cursor){
						/*
						editor.dispatch({
							effects: highlight_effect.of([highlight_decoration.range(c - text_chunk.length, c)])
						});
						*/
				
						//editor.dispatch({selection: cursor})
					}
				
				
				}
				else{
					console.warn("selected_paragraph is empty. typeof window.doc_text: ", typeof window.doc_text);
					
					//place_cursor_after_element(selected_paragraph);
					
				}
				
				place_cursor_after_element(selected_paragraph);
				
				if(selected_paragraph.textContent.trim() != '' && selected_paragraph.textContent.trim() != '\n'){
					selected_paragraph.scrollIntoView({
		            	behavior: 'smooth',
		            	block: 'center',
		            	inline: 'center'
		        	});
				}
				
			}
			
			window.last_selected_paragraph = selected_paragraph;
			window.last_selected_paragraph_text = selected_paragraph.textContent;
			console.log("window.last_selected_paragraph is now: ", window.last_selected_paragraph);
			console.log("window.last_selected_paragraph_text is now: ", window.last_selected_paragraph_text);
		
		}
		else{
			console.error("select_paragraph: no element selected");
		}
	
	}
	catch(err){
		console.error("select_paragraph: caught general error: ", err);
	}

	return selected_paragraph;
}
window.select_paragraph = select_paragraph;



function really_select_paragraph(direction='next',allow_empty=false){
	console.log("in really_select_paragraph. direction: ", direction);
	const cm_content_el = document.querySelector('.cm-content');
	if(cm_content_el){
		
		
		if(typeof direction == 'string' && direction == 'absolute_last'){
			if(allow_empty){
				return cm_content_el.lastChild;
			}
			else{
				for (var i = cm_content_el.children.length - 1; i >= 0; i--) {
					if(cm_content_el.children[i].textContent.trim() != ''){
						return cm_content_el.children[i];
					}
				}
			}
		}
		else if(typeof direction == 'string' && direction == 'absolute_first'){
			if(allow_empty){
				return cm_content_el.firstChild;
			}
			else{
				for (var i = 0; i < cm_content_el.children.length; i++) {
					if(cm_content_el.children[i].textContent.trim() != ''){
						return cm_content_el.children[i];
					}
				}
			}
		}
		
		else{
			//check_if_paragraph_selected();
			
			console.log("really_select_paragraph: getting visible_els. window.last_selected_paragraph: ", window.last_selected_paragraph);
			let visible_els = [];
		
			// add all the visible paragraphs to a list
			for (var i = 0; i < cm_content_el.children.length; i++) {
				if(check_if_element_visible(cm_content_el.children[i])){
					console.log("really_select_paragraph: found a visible paragraph: ", cm_content_el.children[i]);
					
					visible_els.push(cm_content_el.children[i]);
					//if(window.last_selected_paragraph == null){
						
					//}
				}
			}
			
			
			if(visible_els.length){
				console.log("really_select_paragraph: number of visible paragraphs: ", visible_els.length, visible_els);
				
				if(typeof direction == 'number'){
					if(direction < visible_els.length){
						return visible_els[number];
					}
					else{
						console.error("really_select_paragraph: that paragraph is not visible");
					}
					
				}
				
				else if(typeof direction == 'string'){
					if(direction == 'first'){
						return visible_els[0];
					}
					else if(direction == 'second' && visible_els.length > 1){
						return visible_els[1];
					}
					else if(direction == 'third' && visible_els.length > 2){
						return visible_els[2];
					}
					else if(direction == 'fourth' && visible_els.length > 3){
						return visible_els[3];
					}
					else if(direction == 'fifth' && visible_els.length > 4){
						return visible_els[4];
					}
					else if(direction == 'last'){
						return visible_els[visible_els.length-1];
					}
					else if(direction == 'previous' || direction == 'next'){
						let found_it = null;
						
						//console.log("window.last_selected_paragraph BEFORE: ", window.last_selected_paragraph.textContent, window.last_selected_paragraph);
						if(window.last_selected_paragraph || window.last_selected_paragraph == null){
							console.log("really_select_paragraph: trying to match previous/next with window.last_selected_paragraph: ", window.last_selected_paragraph);
							for (var vi = 0; vi < visible_els.length; vi++) {
								console.log("vi: ", vi);
								if(window.last_selected_paragraph == null || visible_els[vi] === window.last_selected_paragraph){
									found_it = visible_els[vi];
									console.log("really_select_paragraph: FOUND last_selected_paragraph: ", vi, visible_els[vi], " === ", window.last_selected_paragraph);
									if(direction == 'previous'){
										if(allow_empty && vi > 0){
											return visible_els[vi - 1];
										}
										else if(vi > 0 && visible_els[vi - 1].textContent.trim() != ''){
											return visible_els[vi - 1];
										}
										else if(vi > 1 && visible_els[vi - 2].textContent.trim() != ''){
											return visible_els[vi - 2];
										}
										else if(vi > 2 && visible_els[vi - 3].textContent.trim() != ''){
											return visible_els[vi - 3];
										}
										else if(vi > 3 && visible_els[vi - 4].textContent.trim() != ''){
											return visible_els[vi - 4];
										}
										else{
											console.error("previous paragraph with some actual text seems very far away");
										}
									}
									else if(direction == 'next'){
										if(allow_empty && vi < visible_els.length - 1){
											console.error("first next visible (possible empty) element: ", visible_els[vi + 1]);
											return visible_els[vi + 1];
										}
										else if(vi < visible_els.length - 1 && visible_els[vi + 1].textContent.trim() != ''){
											console.error("first next visible element: ", visible_els[vi + 1]);
											return visible_els[vi + 1];
										}
										else if(vi < visible_els.length - 2 && visible_els[vi + 2].textContent.trim() != ''){
											console.error("second next visible element: ", visible_els[vi + 2]);
											return visible_els[vi + 2];
										}
										else if(vi < visible_els.length - 3 && visible_els[vi + 3].textContent.trim() != ''){
											console.error("third next visible element: ", visible_els[vi + 3]);
											return visible_els[vi + 3];
										}
										else if(vi < visible_els.length - 4 && visible_els[vi + 4].textContent.trim() != ''){
											console.error("fourth next visible element: ", visible_els[vi + 3]);
											return visible_els[vi + 4];
										}
										else{
											console.error("next paragraph with some actual text seems very far away");
										}
									}
								}
							}
							
						}
						
						if(found_it == null && typeof window.last_selected_paragraph_text == 'string' && window.last_selected_paragraph_text.length > 60){
							for (var vi = 0; vi < visible_els.length; vi++) {
								if(visible_els[vi].textContent === window.last_selected_paragraph_text){
									console.log("Found a match based on last_selected_paragraph_text: ", last_selected_paragraph_text);
									found_it = visible_els[vi];
									if(direction == 'previous'){
										if(allow_empty && vi > 0){
											return visible_els[vi - 1];
										}
										else if(vi > 0 && visible_els[vi - 1].textContent.trim() != ''){
											return visible_els[vi - 1];
										}
										else if(vi > 1 && visible_els[vi - 2].textContent.trim() != ''){
											return visible_els[vi - 2];
										}
										else if(vi > 2 && visible_els[vi - 3].textContent.trim() != ''){
											return visible_els[vi - 3];
										}
										else if(vi > 3 && visible_els[vi - 4].textContent.trim() != ''){
											return visible_els[vi - 4];
										}
										else{
											console.error("previous paragraph with some actual text seems very far away");
										}
									}
									else if(direction == 'next'){
										if(allow_empty && vi < visible_els.length - 1){
											return visible_els[vi + 1];
										}
										else if(vi < visible_els.length - 1 && visible_els[vi + 1].textContent != ''){
											return visible_els[vi + 1];
										}
										else if(vi < visible_els.length - 2 && visible_els[vi + 2].textContent != ''){
											return visible_els[vi + 2];
										}
										else if(vi < visible_els.length - 3 && visible_els[vi + 3].textContent != ''){
											return visible_els[vi + 3];
										}
										else if(vi < visible_els.length - 4 && visible_els[vi + 4].textContent != ''){
											return visible_els[vi + 4];
										}
										else{
											console.error("next paragraph with some actual text seems very far away");
										}
									}
								}
							}
						}
						
						if(found_it == null){
							console.error("could not find window.last_selected_paragraph");
							if(direction == 'next' && visible_els.length > 1){
								return visible_els[1];
							}
							else{
								return visible_els[0];
							}
						}
						
					}
					
					else{
						console.error("really_select_paragraph: direction fell through: ", direction);
					}
				}
				
			}
			else{
				console.warn("really_select_paragraph: there were no visible paragraphs");
			}
			
		}
	}
	return null;
}



function place_cursor_after_element(selected_paragraph=null){
	console.log("in place_cursor_after_element. selected_paragraph: ", selected_paragraph);
	if(selected_paragraph == null){
		console.error("place_cursor_after_element: invalid element provided");
		return
	}
	if(typeof window.doc_text == 'string'){
		let after_text = '';
		let before_text = '';
		if(selected_paragraph.textContent.length){
			before_text = '\n' + selected_paragraph.textContent;
		}
		let from = null;
		if(typeof selected_paragraph.nextSibling != 'undefined'){
			after_text += selected_paragraph.nextSibling.textContent;
			if(selected_paragraph.nextSibling.textContent == ''){after_text += '\n'}
			console.log("after_text1: ", after_text);
		}
		if(after_text.length > 5 && window.doc_text.indexOf(after_text) != -1 && window.doc_text.indexOf(after_text) == window.doc_text.lastIndexOf(after_text)){
			from = window.doc_text.indexOf(after_text) - 1;
			if(from < 0){from = 0}
			console.log("from1: ", from);
			//editor.dispatch({selection: {'from':from,'to':from}});
			editor.dispatch({ selection: {anchor: from}, scrollIntoView: true});
		}
		else if(typeof selected_paragraph.nextSibling.nextSibling != 'undefined'){
			after_text += selected_paragraph.nextSibling.nextSibling.textContent;
			if(selected_paragraph.nextSibling.nextSibling.textContent == ''){after_text += '\n'}
			console.log("after_text2: ", after_text);
		}
		if(from == null && after_text.length > 5 && window.doc_text.indexOf(after_text) != -1 && window.doc_text.indexOf(after_text) == window.doc_text.lastIndexOf(after_text)){
			from = window.doc_text.indexOf(after_text) - 1;
			if(from < 0){from = 0}
			console.log("from2: ", from);
			//editor.dispatch({selection: {'from':from,'to':from}});
			editor.dispatch({ selection: {anchor: from}, scrollIntoView: true});
		}
		else if(from == null && typeof selected_paragraph.nextSibling.nextSibling.nextSibling != 'undefined'){
			after_text += selected_paragraph.nextSibling.nextSibling.nextSibling.textContent;
			if(selected_paragraph.nextSibling.nextSibling.nextSibling.textContent == ''){after_text += '\n'}
			console.log("after_text3: ", after_text);
		}
		if(from == null && after_text.length > 5 && window.doc_text.indexOf(after_text) != -1 && window.doc_text.indexOf(after_text) == window.doc_text.lastIndexOf(after_text)){
			from = window.doc_text.indexOf(after_text) - 1;
			if(from < 0){from = 0}
			console.log("from3: ", from);
			//editor.dispatch({selection: {'from':from,'to':from}});
			editor.dispatch({ selection: {anchor: from}, scrollIntoView: true});
		}
		
		if(after_text == ''){
			console.error("place_cursor_after_element: there is nothing after the provided element, so cursor cannot be placed after it"); // TODO or just add a single newline?
			return
		}
		
		if(from == null && typeof selected_paragraph.previousSibling != 'undefined'){
			before_text += selected_paragraph.previousSibling.textContent;
			console.log("before_text1: ", before_text);
		}
		if(from == null && before_text.length > 5 && window.doc_text.indexOf(before_text) != -1 && window.doc_text.indexOf(before_text) == window.doc_text.lastIndexOf(before_text)){
			from = window.doc_text.indexOf(before_text) + before_text.length;
			console.log("from4: ", from);
			//editor.dispatch({selection: {'from':from,'to':from}});
			editor.dispatch({ selection: {anchor: from}, scrollIntoView: true});
		}
		else if(from == null && typeof selected_paragraph.previousSibling.previousSibling != 'undefined'){
			//before_text += selected_paragraph.previousSibling.previousSibling.textContent;
			before_text = selected_paragraph.previousSibling.previousSibling.previousSibling.textContent + '\n' + before_text;
			//if(selected_paragraph.previousSibling.previousSibling.textContent == ''){before_text = '\n' + before_text}
			console.log("before_text2: ", before_text);
		}
		if(from == null && before_text.length > 5 && window.doc_text.indexOf(before_text) != -1 && window.doc_text.indexOf(before_text) == window.doc_text.lastIndexOf(before_text)){
			from = window.doc_text.indexOf(before_text) + before_text.length;
			console.log("from5: ", from);
			////editor.dispatch({selection: {'from':from,'to':from}});
			editor.dispatch({ selection: {anchor: from}, scrollIntoView: true});
		}
		else if(from == null && typeof selected_paragraph.previousSibling.previousSibling.previousSibling != 'undefined'){
			before_text = selected_paragraph.previousSibling.previousSibling.previousSibling.textContent + '\n' + before_text;
			//if(selected_paragraph.previousSibling.previousSibling.previousSibling.textContent == ''){before_text = '\n' + before_text}
			console.log("before_text3: ", before_text);
		}
		if(from == null && before_text.length > 5 && window.doc_text.indexOf(before_text) != -1 && window.doc_text.indexOf(before_text) == window.doc_text.lastIndexOf(before_text)){
			from = window.doc_text.indexOf(before_text) + before_text.length;
			console.log("from6: ", from);
			//editor.dispatch({selection: {'from':from,'to':from}});
			editor.dispatch({ selection: {anchor: from}, scrollIntoView: true});
		}
		
		if(from == null){
			console.error("frankenstein reconstruction of cursor failed");
		}
		
		console.log("selected_paragraph is empty. frankenstein from: ", from);
	}
}






function check_if_paragraph_selected(){
	console.log("in check_if_paragraph_selected (blocked)");
	return
	const cm_content_el = document.querySelector('.cm-content');
	if(cm_content_el){
		
		
		for (var i = 0; i < cm_content_el.children.length; i++) {
			if(check_if_element_visible(cm_content_el.children[i])){
				
				if(window.last_selected_paragraph == cm_content_el.children[i]){
					console.log("check_if_paragraph_selected: the same paragraph is still visible");
					return window.last_selected_paragraph;
				}
				
				console.log("check_if_paragraph_selected: found a visible paragraph: ", cm_content_el.children[i]);
				const text = cm_content_el.children[i].textContent;
				
				if(text.trim() == ''){
					console.log("empty visible paragraph");
					continue
				}
				if(typeof window.selected_doc_text == 'string' && window.selected_doc_text.length && text.trim() == window.selected_doc_text.trim()){
					console.log("check_if_paragraph_selected: FOUND SELECTED PARAGRAPH BASED ON THE SELECTED TEXT");
					window.last_selected_paragraph = cm_content_el.children[i];
					window.last_selected_paragraph_text = cm_content_el.children[i].textContent;
					return cm_content_el.children[i];
				}
			}
		}
	}
	window.last_selected_paragraph = null;
	return null;
}
window.check_if_paragraph_selected = check_if_paragraph_selected;



if(vex){
	vex.defaultOptions.className = 'vex-theme-top'
}

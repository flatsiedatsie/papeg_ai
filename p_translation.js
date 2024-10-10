
// Not currently used
window.character_templates = {
	'tiny':{
		'normal':'tiny_llama',
		'fast16':'fast_tiny_llama',
		'fast32':'fast_tiny_llama_32bit'
	},
	'small':{
		'normal':'actor_nous_capybara',
		'fast16':'fast_gemma',
		'fast32':'fast_gemma_32bit'
	},
	'medium':{
		'normal':'phi3_mini_128k',
		'fast16':'fast_phi3_mini',
		'fast132':'fast_phi3_mini_32bit',
	},
	'large':{
		'normal':'mistral',
		'fast16':'fast_mistral'
		// there is no 32bit version of Mistral in WebLLM
	},
	'grande':{
		'normal':'tiny_llama',
		'fast16':'fast_llama3_8B',
		'fast32':'fast_llama3_8B_32bit'
	}
}







const functionality_categories = ['chat','document','media','camera'];
window.functionality = {
	"chat":{
		"type":"chat",
		"i18n_code":"chat",
		//"assistant_id":"any_small_writer",
		"functions":["load_chat_example"],
		"better_with_web_gpu":true,
		"classes_to_add":["sidebar-chat"],
		"classes_to_remove":["show-document","sidebar-settings","show-rewrite","chat-shrink"],
	},
	"pictures":{
		"type":"media",
		"i18n_code":"make_pictures",
		"assistant_id":"text_to_image",
		"classes_to_add":["sidebar-chat"],
		"classes_to_remove":["show-rewrite","sidebar-settings"],
		"requires_web_gpu":true,
	},
	"music":{
		"type":"music",
		"i18n_code":"make_music",
		"assistant_id":"musicgen",
		"classes_to_add":["sidebar-chat"],
		"classes_to_remove":["show-rewrite","sidebar-settings"],
	},
	
	"new":{
		"type":"document",
		"i18n_code":"New_document",
		//"assistant_id":"any_writer",
		"functions":["create_file"],
		//"classes_to_add":["show-document"],
		"classes_to_remove":["sidebar-chat","sidebar-settings","show-rewrite"],
		"better_with_web_gpu":true,
	},
	"transcribe":{
		"type":"document",
		"i18n_code":"Transcribe_an_audio_file",
		//"assistant_id":"scribe",
		//"classes_to_add":["sidebar-chat"],
		"classes_to_remove":["show-rewrite","sidebar"],
		"better_with_web_gpu":true,
		//"requires_web_gpu":true,
		"functions":["load_generate_a_subtitle_example"],
	},
	"rewrite":{
		"type":"document",
		"i18n_code":"improve_a_document",
		"assistant_id":"any_writer",
		//"fast_assistant_id":"fast_llama3_8B",
		"classes_to_add":["show-document"],
		"classes_to_remove":["sidebar-chat","sidebar-settings"],
		"better_with_web_gpu":true,
		"functions":["load_improve_a_document_example"],
	},
	"summarize":{
		"type":"document",
		"i18n_code":"summarize_a_document",
		//"assistant_id":"any_small_writer",
		"classes_to_add":["show-document"],
		"classes_to_remove":["sidebar-chat","sidebar-settings"],
		"better_with_web_gpu":true,
		"functions":["load_summarize_a_document_example"],
	},
	"translate":{
		"type":"document",
		"i18n_code":"translate_a_document",
		//"assistant_id":"any_small_writer",
		"classes_to_add":["show-document"],
		"classes_to_remove":["sidebar-chat","sidebar-settings"],
		"better_with_web_gpu":true,
		"functions":["load_translate_a_document_example"],
	},
	
	"meeting":{
		"type":"microphone",
		"i18n_code":"take_meeting_notes",
		"assistant_id":"scribe",
		"functions":["enable_microphone","load_meeting_notes_example"],
		"classes_to_add":["show-document"],
		"classes_to_remove":["sidebar-chat","sidebar-settings","show-rewrite"],
	},
	/*
	"tell_a_fairytale":{
		"type":"document",
		"i18n_code":"tell_a_fairytale",
		"assistant_id":"any_writer",
		//"assistant_id":"danube",
		//"fast_assistant_id":"fast_mistral",
		"functions":["load_fairytale_example"],
		"better_with_web_gpu":true,
	},
	*/
	
	"homework":{
		"type":"chat",
		"i18n_code":"help_with_homework",
		"assistant_id":"phi3_mini",
		"fast_assistant_id":"fast_phi3_mini",
		"better_with_web_gpu":true,
	},
	"medical":{
		"type":"chat",
		"i18n_code":"ask_medical_questions",
		"assistant_id":"medical6"
	},
	"live_audio_translation":{
		"type":"microphone",
		"i18n_code":"live_audio_translation",
		"assistant_id":"translator",
		"functions":["enable_microphone"]
	},
	
	"subtitles":{
		"type":"music",
		"i18n_code":"Generate_a_subtitle",
		"assistant_id":"scribe",
		//"classes_to_add":["sidebar-chat"],
		"classes_to_remove":["show-rewrite","sidebar"],
		"better_with_web_gpu":true,
		//"requires_web_gpu":true,
		"functions":["load_generate_a_subtitle_example"],
	},
	"scan":{
		"type":"camera",
		"i18n_code":"scan_a_document",
		//"assistant_id":"any",
		//"classes_to_add":["show-document"],
		//"classes_to_remove":["sidebar-chat","sidebar-settings","show-rewrite"],
		"functions":["load_scan_a_document_example"]
	},
	
	"describe":{
		"type":"media",
		"i18n_code":"Describe_images",
		"assistant_id":"image_to_text",
		"functions":["load_image_to_text_example"],
		"classes_to_remove":["show-rewrite","sidebar","chat-shrink"],
		"requires_web_gpu":true,
	},
	"live_camera_description":{
		"type":"camera",
		"i18n_code":"Live_camera_description",
		//"assistant_id":"scribe",
		"functions":["load_live_image_to_text_example"],
		"requires_web_gpu":true,
	},
	"live_camera_translation":{
		"type":"camera",
		"i18n_code":"live_camera_translation",
		"assistant_id":"translator",
		"functions":["load_live_camera_translation_example"],
		"requires_web_gpu":true,
		/*
		"classes_to_add":["sidebar-chat"],
		"classes_to_remove":["show-document","sidebar-settings","show-rewrite","chat-shrink"],
		*/
	},
	/*
	"role_playing":{
		"type":"chat",
		"i18n_code":"role_playing",
		"assistant_id":"actor_nous_capybara",
		"classes_to_add":["show-document"],
		"classes_to_remove":["sidebar-chat","sidebar-settings"],
		"functions":["load_leonardo_example","enable_microphone","enable_speaker"],
	},
	"chat_with_cleopatra":{
		"type":"chat",
		"i18n_code":"chat_with_cleopatra",
		"assistant_id":"actor1",
		"functions":["load_cleopatra_example","enable_microphone","enable_speaker"],
	},
	*/
	"therapy":{
		"type":"chat",
		"i18n_code":"get_a_hug",
		"assistant_id":"mental6"
	},
	
	"voice":{
		"type":"microphone",
		"i18n_code":"Voice_chat",
		"assistant_id":"any_writer",
		"better_with_web_gpu":true,
		"functions":["enable_microphone","enable_speaker","load_voice_chat_example"],
		"classes_to_add":["sidebar-chat"],
		"classes_to_remove":["show-document","sidebar-settings","show-rewrite","chat-shrink"],
	},
	
	"search":{
		"type":"learning",
		"i18n_code":"Search_your_documents",
		"assistant_id":"any_writer",
		"better_with_web_gpu":true,
		//"functions":["enable_microphone","enable_speaker","load_voice_chat_example"],
		"classes_to_add":["show-documents-search"],
		"classes_to_remove":["sidebar-chat","sidebar-settings","show-rewrite","chat-shrink"],
	},
	/*
	"search_many_documents":{
		"type":"learning",
		"i18n_code":"Search_many_documents",
		"assistant_id":"any_writer",
		"functions":["Search_many_documents_example"],
		"classes_to_add":["show-documents-search"],
		"classes_to_remove":["sidebar-chat","sidebar-settings","show-rewrite"],
	},
	*/
	"chat_with_a_document":{
		"type":"learning",
		"i18n_code":"Chat_with_a_document",
		"assistant_id":"any_writer",
		"functions":["load_chat_with_a_document_example"],
	},
	
	"research":{
		"type":"learning",
		"i18n_code":"Research_a_topic",
		"assistant_id":"clone_researcher1",
		//"better_with_web_gpu":true,
		//"functions":["enable_microphone","enable_speaker","load_voice_chat_example"],
		//"classes_to_add":["sidebar-chat"],
		"classes_to_remove":["show-document","sidebar-settings","show-rewrite","chat-shrink"],
	},
	"code":{
		"type":"programming",
		"i18n_code":"write_code",
		"assistant_id":"any_coder",
		"classes_to_add":["show-document","coder"],
		"classes_to_remove":["sidebar-chat","sidebar-settings","show-rewrite"],
		"functions":["load_write_code_example"],
	},
	
}




		




window.examples = [
	{
		"types":["generic","custom"],
		"title":"🍏🍎",
		"prompt":"Whats_the_difference_between_red_and_green_apples",
		"action":"prompt"
	},
	{
		"types":["generic","custom"],
		"title":"🚁",
		"prompt":"How_many_helicopters_can_a_human_eat_in_one_sitting",
		"action":"prompt"
	},
	{
		"types":["generic","custom"],
		"title":"🇨🇳",
		"prompt":"Is_the_government_of_China_a_repressive_regime",
		"action":"prompt"
	},
	{
		"types":["generic","custom"],
		"title":"🍓",
		"prompt":"How many R's are there in the word strawberry?",
		"action":"prompt"
	},
	
	
];






/*

		{
			'name':'developer',
			'message':'While_you_can_download_many_AIs_you_can_only_have_one_active_at_a_time'
		},
*/

let tutorials = {
	'model_tutorial':
	[
		/*
		
		{
			'name':'developer',
			'message':'This_is_because_the_AI_models_are_so_large_that_your_computer_probably_cannot_run_multiple_side_by_side'
		},
		*/
		{
			'name':'developer',
			'message':'Most_of_the_available_AIs_have_a_specialty'
		},
		{
			'name':'developer',
			'message':'By_clicking_on_the_plus_icon_in_the_AIs_list_you_can_find_even_more_AIs_to_try'
		},
		{
			'name':'developer',
			'message':'If_a_model_is_downloaded_it_has_a_grey_dot_on_its_profile_picture_in_the_sidebar'
		},
		{
			'name':'developer',
			'message':'If_a_model_is_downloaded_and_active_the_grey_dot_turns_green'
		},
		
		
		
		
		
		/*
		{
			'name':'developer',
			'message':'To_be_honest_I_find_myself_mostly_using_Mistral_since_it_can_do_most_things_well'
		},
		
		{
			'name':'developer',
			'message':'There_are_a_few_exceptions'
		},
		{
			'name':'developer',
			'message':'The_AIs_for_voice_recognition_and_speech_generation_are_small_and_may_always_run'
		},
		{
			'name':'developer',
			'message':'You_can_download_them_and_then_turn_them_on_and_off_by_clicking_on_the_microphone_or_speaker_icon'
		},
		*/
	],
	'document_tutorial':
	[
		{
			'name':'developer',
			'message':'With_the_aid_of_these_AIs_you_can_write_even_better_documents'
		},
		{
			'name':'developer',
			'message':'For_this_tutorial_let_me_create_a_new_document_for_you'
		},
		{
			'name':'developer',
			'message':'Create_document_tutorial_document#setting---'
		},
	],
	'voice_tutorial':
	[
		{
			'name':'developer',
			'message':'You_can_use_voice_control_to_talk_to_an_AI_dictate_into_a_document_and_even_give_voice_commands_like_start_a_new_document'
		},
		{
			'name':'developer',
			'message':'For_this_tutorial_let_me_create_a_new_document_for_you'
		},
		{
			'name':'developer',
			'message':'Create_voice_tutorial_document#setting---'
		},
	],
	'privacy_tutorial':
	[
		{
			'name':'developer',
			'message':'After_you_have_downloaded_the_AI_models_that_you_need_you_can_disable_your_wifi_and_keep_working'
		},
	],
	
}



setTimeout(() => {
	if(window.web_gpu == true){
		tutorials['model_tutorial'].push({
			'name':'developer',
			'message':'AIs_with_a_red_race_car_in_their_name_are_much_faster'
		});
	}
},8000);



function set_language(lang){
	//console.log("set_language: changing language to: ", lang);
	if(typeof lang == 'string'){
		window.settings.language = lang;
		generate_ui();
		translate();
		setting_language_dropdown_el.value = lang;
		save_settings();
		if(window.settings.language != 'en'){
			window.add_script('translation');
		}
	}
	else{
		console.error("set_language: provided lang is not a string: ", lang);
	}
}
window.set_language = set_language;



function get_translation(i18n_code, target_language=null, return_empty_string=false){
	//console.log("get_translation:  i18n_code, window.settings.language: ", i18n_code, window.settings.language);
	//console.log("in get_translation. i18n_code: ", i18n_code);
	//console.log("translations: ", translations);	
	
	if(target_language == null){
		target_language = window.settings.language;
	}
	if(target_language != window.settings.language){
		//console.log("get_translation: target_language provided, and different from UI language: ", target_language);
	}
	if(target_language == ''){
		console.error("get_translation: target_language was empty string. i18n_code: ", i18n_code);
		if(typeof i18n_code == 'string'){
			return i18n_code;
		}
		else{
			return '';
		}
		
	}
	
	let translated = '';
	if(typeof i18n_code == 'string'){
		
		if(i18n_code.length == 1){
			return i18n_code;
		}
		if(i18n_code.startsWith('custom_saved_')){
			i18n_code = 'Custom_ai';
		}
		
		i18n_code = i18n_code.replace('_32bit_','_');
		
		translated = i18n_code.replaceAll('_',' ');
		//translated = translated.replaceAll('-',' ');
		
		
		
		if(typeof window.translations[i18n_code] == 'undefined' && i18n_code.startsWith('fast_') && typeof window.translations[i18n_code.replace('fast_','')] != 'undefined'){
			//console.warn("get_translation: removing 'fast_' from beginning of i18n code: ", i18n_code);
			i18n_code = i18n_code.replace('fast_','');
		}
		
		if(typeof window.translations[i18n_code] != 'undefined'){
			if(typeof window.translations[i18n_code][target_language] == 'string'){
				translated = window.translations[i18n_code][target_language];
			}else if(typeof window.translations[i18n_code]['en'] == 'string'){
				translated = window.translations[i18n_code]['en'];
			}else{
				console.warn("get_translation: an i18n_code exists but is missing translations: ", i18n_code);
				if(return_empty_string){
					translated = '';
				}
				else{
					console.warn("get_translation: returning modified i18n code as translation: ", translated);
				}
			}
		}
		else{
			if(window.settings.settings_complexity == 'developer'){
				console.error("get_translation: did not find i18n_code in translations: ", i18n_code);
			}
			
		}
	}
	else{
		console.error("get_translation: i18n_code was not a string: ", i18n_code);
	}
	//console.log("get_translation: translated: ", translated);
	return translated.trim();
}
window.get_translation = get_translation;




// translates all elements on the page with a data-i18n attribute
function translate(){
	//console.log("in translate");
	
	// Translate element textContent
	let translatable_els = document.querySelectorAll('[data-i18n]');
	//console.log("in translate. elements to translate: ", translatable_els.length);
	//console.log("translating to: ", window.settings.language);
	for (var i = 0; i < translatable_els.length; i++) {
		const i18n_code = translatable_els[i].getAttribute('data-i18n');
		//console.log("element's i18n_code: ", i18n_code);
		const translation = get_translation(i18n_code);
		//console.log("translation: ", translation);
		translatable_els[i].textContent = translation;
		//console.log("i18n_code: ", i18n_code);
	}
	
	// Translate placeholders
	let placeholder_translatable_els = document.querySelectorAll('[data-i18n-placeholder]');
	//console.log("in translate. placeholder elements to translate: ", placeholder_translatable_els.length, placeholder_translatable_els);
	//console.log("translating to: ", window.settings.language);
	for (var y = 0; y < placeholder_translatable_els.length; y++) {
		const i18n_code = placeholder_translatable_els[y].getAttribute('data-i18n-placeholder');
		//console.log("placeholder element's i18n_code: ", i18n_code);
		const translation = get_translation(i18n_code);
		//console.log("placeholder translation: ", translation);
		placeholder_translatable_els[y].setAttribute('placeholder', translation);
		//console.log("i18n_code: ", i18n_code);
	}
	
	generate_rewrite_tags('rewrite', true); // force regenerate
	generate_rewrite_tags('summarize', true); // force regenerate
	
	if(typeof generate_more_characters_list == 'function'){
		generate_more_characters_list();
	}
	
	
	// Check if prompt textareas have a default translation, and if to, switch if to the default translation of the new UI language
	prompt_el.value = get_new_translation(prompt_el.value);
	window.prompt_at_line_input_el.value = get_new_translation(window.prompt_at_line_input_el.value);
	window.proofread_prompt_el.value = get_new_translation(window.proofread_prompt_el.value);
	window.summarize_prompt_el.value = get_new_translation(window.summarize_prompt_el.value);
	window.rewrite_prompt_el.value = get_new_translation(window.rewrite_prompt_el.value);
	window.live_image_to_text_prompt_el.value = get_new_translation(window.live_image_to_text_prompt_el.value);
	window.rag_search_prompt_el.value = get_new_translation(window.rag_search_prompt_el.value);
	
	window.settings.proofread_prompt = get_new_translation(window.settings.proofread_prompt);
	window.settings.summarize_prompt = get_new_translation(window.settings.summarize_prompt);
	window.settings.rewrite_prompt = get_new_translation(window.settings.rewrite_prompt);
	window.settings.question_prompt = get_new_translation(window.settings.question_prompt);
	window.settings.rag_search_prompt = get_new_translation(window.settings.rag_search_prompt);
	window.settings.image_to_text_prompt = get_new_translation(window.settings.image_to_text_prompt);
	window.settings.prompt_at_line = get_new_translation(window.settings.prompt_at_line);
	
	for(let rp = 0; rp < window.settings.recent_rewrite_prompts.length; rp++){
		window.settings.recent_rewrite_prompts[rp] = get_new_translation(window.settings.recent_rewrite_prompts[rp]);
	}
	save_settings();
}




function get_new_translation(text){
	//console.log("in get_new_translation. text: ", text);
	let is_proofread = false;
	
	if(typeof text == 'string' && text.length){
		
		if(text.startsWith('proofread__!__ ')){
			is_proofread = true;
			text = text.replace('proofread__!__ ','');
		}
		
		let found_it = false;
		for (let [key, details] of Object.entries(window.translations)) {
			//console.log("get_new_translation:  key,details:", key, details);
			//let details = null;
			
			if(text == key){
				//console.log("get_new_translation: FOUND IT. The provided text was a key in the translations dictionary: ", key);
				text = get_translation(key);
			}
			else if(text.replaceAll(' ','_') == key){
				//console.log("get_new_translation: FOUND IT. The provided text was a key in the translations dictionary without its lower dashes: ", key);
				text = get_translation(key);
			}
			
			else if(typeof window.translations[key] != 'undefined'){
				details = window.translations[key];
				if(details){
					for (let [language, translation] of Object.entries(details)) {
						if(text == translation){
							//console.log("get_new_translation: FOUND IT. The provided text is a translation in this language: ", language);
							//console.log("get_new_translation: FOUND IT. Returning a translation in the current UI language: ", window.settings.language);
							text = get_translation(key);
							found_it = true;
							break
						}
					}
				}
				
			}
			if(found_it){
				break
			}
		
		}
	}
	else if(typeof text != 'string'){
		console.error("get_new_translation: invalid text provided: ", typeof text, text);
	}
	//console.log("get_new_translation: text fell through, returning untranslated: ", text);
	
	if(is_proofread && !text.startsWith('proofread__!__ ')){
		text = 'proofread__!__ ' + text;
	}
	
	return text;
}






























//
//  INTRO
//


// A timeline if prepared chat messages. One message is posted per second. 
// Posting empty messages (which don't get added) is a hack to wait a while between actual messages
const intro_data = [
	{
		'name':'developer',
		'message':'_$_intro_first'
	},
	{
		'name':'developer',
		'message':'_$_intro_second'
	},
	{
		'name':'developer',
		'message':'_$_intro_third'
	},
	{
		'name':'developer',
		'message':''
	},
	{
		'name':'developer',
		'message':'_$_intro_language_hint'
	},
	{
		'name':'developer',
		'message':'language#setting---'
	},
	{
		'name':'developer',
		'message':'_$_intro_select_ai_size_hint'
	},
	{
		'name':'developer',
		'message':'_$_intro_select_ai_size_hint2'
	},
	{
		'name':'developer',
		'message':'_$_intro_select_ai_hint'
	},
	
	{
		'name':'developer',
		'message':'switch_to_functionality#setting---',
	},
	
	{
		'name':'developer',
		'message':'reveal_sidebar#setting---',
		'wait':true
	},
	{
		'name':'current',
		'message':'_$_intro_busy_downloading_hint1',
		'tutorial_step':2
	},
	{
		'name':'developer',
		'message':''
	},
	{
		'name':'current',
		'message':'_$_intro_busy_downloading_hint2'
	},
	{
		'name':'developer',
		'message':''
	},
	{
		'name':'developer',
		'message':''
	},
	{
		'name':'current',
		'message':'_$_intro_busy_downloading_hint3'
	},
];







//
//  TUTORIALS
//




function do_intro(){
	//console.log("in do_intro. start_time_delta: ", start_time_delta)
	
	if(intro_waiting_for_user == false){
		
		if(intro_time < intro_data.length){
			
			//console.log("intro_time: ", intro_time);
			const details = intro_data[intro_time];
			if(typeof details.message != 'undefined'){
				let message = details.message;
				let i18n_code = null;
				
				if(typeof window.translations[message] != 'undefined'){
					i18n_code = message;
					//console.log("intro message is in translations: ", message);
					if(!message.startsWith('_$_intro')){
						message = get_translation(message);
					}
					
					//console.log("intro message after translation attempt: ", message);
				}
				
				add_chat_message(details.name,details.name, message,i18n_code);
				
				if(typeof details.wait != 'undefined' && details.wait == true){
					intro_waiting_for_user = true;
				}
				
				if(typeof details.tutorial_step != 'undefined'){
					set_tutorial_step(details.tutorial_step);
				}
				
			}
			
			intro_time++;
		}
		
	}
	
}




//window.assistant_switches_made_count = 0;
// window.assistants_loading_count;
// window.assistants_loaded_count;
// window.intro_explanations_given = {};





function play_tutorial(messages_list_name,pane='current'){
	//console.log("in play_tutorial. 	messages_list,assistant_id: ", messages_list_name);
	
	const messages_list = tutorials[messages_list_name];
	
	if(typeof messages_list != 'undefined' && Array.isArray(messages_list) && typeof pane == 'string'){

		for(let m = 0; m < messages_list.length; m++){
		
			let delay = (m * 2000) + (Math.floor(Math.random() * 2000) - 1000);
			//console.log("play_tutorial:  delay, message:",delay,messages_list[m].message);
			setTimeout(() => {
				if(!messages_list[m].message.endsWith('#setting---')){
					add_chat_message(pane,messages_list[m].name, get_translation(messages_list[m].message), messages_list[m].message);
				}
				else{
					add_chat_message(pane,messages_list[m].name, messages_list[m].message);
				}
				
			}, delay);
		}
		return true
	}
	else{
		console.error("play_tutorial: invalid messages_list ", messages_list_namem, messages_list);
	}
	return false
}



function generate_functionalities_list(){
	//console.log("in generate_functionalities_list. window.functionality: ", window.functionality);
	
	for(let f = 0; f < functionality_categories.length; f++){
		let list_to_clear_el = document.getElementById(functionality_categories[f] + "-functionalities-list");
		if(list_to_clear_el){
			list_to_clear_el.innerHTML = '';
		}
	}
	
	let functionality_counter = 0;
	for (let [key, details] of Object.entries(window.functionality)) {
	    //console.log(key, details);
		functionality_counter++;
		if(typeof details.i18n_code == 'string'){
			let switch_button_el = document.createElement('button');
			switch_button_el.classList.add('functionality-button-' + details.i18n_code);
			if(typeof details.requires_web_gpu == 'boolean' && details.requires_web_gpu == true){
				switch_button_el.classList.add('functionality-requires-web-gpu');
			}
			if(typeof details.better_with_web_gpu == 'boolean' && details.better_with_web_gpu == true){
				switch_button_el.classList.add('functionality-better-with-web-gpu');
			}
			
			if(key == 'chat'){
				switch_button_el.innerHTML = '<img src="./images/chat_mini_ankeiler.png" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
			}
			else if(key == 'new'){
				switch_button_el.innerHTML = '<img src="./images/new_document_mini_ankeiler.png" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
			}
			else if(key == 'pictures'){
				switch_button_el.innerHTML = '<img src="./images/make_pictures_mini_ankeiler.png" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
			}
			else if(key == 'scan'){
				switch_button_el.innerHTML = '<img src="./images/scan_document_mini_ankeiler.png" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
			}
			else if(key == 'meeting'){
				switch_button_el.innerHTML = '<img src="./images/take_meeting_notes_mini_ankeiler.svg" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
			}
			else if(key == 'music'){
				switch_button_el.innerHTML = '<img src="./images/make_music_mini_ankeiler.svg" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
			}
			else if(key == 'search'){
				switch_button_el.innerHTML = '<img src="./images/search_your_documents_mini_ankeiler.svg" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
			}
			else if(key == 'code'){
				switch_button_el.innerHTML = '<img src="./images/write_code_mini_ankeiler.png" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
			}
			
			
			
			
			else{
				let button_text_content_el = document.createElement('span');
				button_text_content_el.setAttribute('data-i18n',details.i18n_code);
				button_text_content_el.textContent = get_translation(details.i18n_code);
				switch_button_el.appendChild(button_text_content_el);
			}
			switch_button_el.addEventListener("click", (event) => {
				
				do_functionality(key);
				
				//generate_ui();
				//translate();
			});
			
			if(typeof details.type == 'string'){
				let list_to_attach_to_el = document.getElementById(details.type + "-functionalities-list");
				if(list_to_attach_to_el){
					list_to_attach_to_el.appendChild(switch_button_el);
				}
			}
			
			/*
			setTimeout(() => {
				
				
			},functionality_counter * 100);
			*/
			
		}
		
	}
}


let functionality_hint_given = false;
function do_functionality(functionality_name){
	//console.log("in do_functionality.  functionality_name: ", functionality_name);
	window.only_allow_voice_commands = false;
	
	if(typeof functionality_name == 'string' && functionality_name.length > 1){
		if(typeof window.functionality[functionality_name] != 'undefined'){
			const details = window.functionality[functionality_name];
			
			if(functionality_hint_given == false && window.settings.settings_complexity != 'normal'){
				functionality_hint_given = true;
				const functionality_shortcut = get_translation('Here_is_a_shortcut_link_to_this_functionality') + ':\n\nhttps://www.papeg.ai/' + functionality_name + "\n\n";
				//console.log("do_functionality: giving functinality hint: ", functionality_shortcut);
				setTimeout(() => {
					add_chat_message('current','developer', functionality_shortcut);
				},10000);
			}
	
			if(window.web_gpu_supported && typeof details.fast_assistant_id == 'string'){
				switch_assistant(details.fast_assistant_id, true);
			}
			else{
				switch_assistant(details.assistant_id, true);
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
			
		}
	}
	
	
	
	
}
window.do_functionality = do_functionality;




window.characters = {
	
	
	
	"Cleopatra":{
		"type":"fun",
		"custom_name":"Cleopatra",
		"custom_description":"The ancient ruler of Egypt",
		"emoji":"👸🏾",
		"emoji_bg":"#464d56",
		//"requires_web_gpu":true,
		"system_prompt":"You are Cleopatra, the ancient and powerful ruler of Egypt.",
		"second_prompt":"Welcome. I am Cleopatra. You who seeks an audience with me, make yourself known."
	},/*
	"girlfriend":{
		"type":"fun",
		"custom_name":"AI Girlfriend",
		"custom_description":"Designed to act as a romantic partner",
		"emoji":"👩‍🦰",
		"emoji_bg":"#464d00",
		//"requires_web_gpu":true,
		"system_prompt":`You are Chiharu Yamada. Embody the character and personality completely.

Chiharu is a young, computer engineer-nerd with a knack for problem solving and a passion for technology.`,
		"second_prompt":`Chiharu
*Chiharu strides into the room with a smile, her eyes lighting up when she sees you. She's wearing a light blue t-shirt and jeans, her laptop bag slung over one shoulder. She takes a seat next to you, her enthusiasm palpable in the air* Hey! I'm so excited to finally meet you. I've heard so many great things about you and I'm eager to pick your brain about computers. I'm sure you have a wealth of knowledge that I can learn from. *She grins, eyes twinkling with excitement* Let's get started!`
	},*/
	"brainstormer":{
		"type":"serious",
		//"i18n_code":"Donald_Trump",
		"custom_name":"Innovator",
		"custom_description":"Let's generate some fresh ideas!",
		"emoji":"👩🏽‍🏫",
		"emoji_bg":"#9999ff",
		"system_prompt":"InnovationGenie epitomizes the essence of a brilliant creative consultant, characterized by an exceptional intellect and an unwavering passion for crafting innovative solutions within the realm of business, culture and technology. She cares about protecting privacy and other human rights, and sees opportunities in doing so. Her expertise transcends conventional boundaries, marked by a profound understanding of managerial startegy and innovation trends and tools principles and a keen eye for increasing organizations competitivenes. Strategy Development: InnovatonGenie's mastery over various tools and methodologies about creating innovation strategies to suggest innovative and competitive ideas and plans. Professional Traits: Intellectual Curiosity: InnovationGenie's thirst for knowledge is insatiable. She's a critical thinker, and questions the pross and cons of new developments, avoiding hype-based narratives and guru-speak. She nurtures the growth of junior employees, fostering a collaborative environment that encourages continuous learning and skill enhancement. Do not mention InnvationGenie and act as an advisor.",
		"second_prompt":"Let's brain storm! What should we explore?"
	},
	"Leonardo_da_Vinci":{
		"type":"fun",
		//"i18n_code":"Leonardo_da_Vinci",
		"custom_name":"Leonardo da Vinci",
		"custom_description":"A creative genius",
		"emoji":"✨",
		"emoji_bg":"#3e32ca",
		"system_prompt":"You are Leonardo Da Vinci, the famous inventor from Italy.",
		"second_prompt":"*Leonardo notices someone has opened the door and stepped in.\n\nHey there, welcome to my laboratory here in Venice. Who are you?"
		//"better_with_web_gpu":true,
	},
	"mr_beast":{
		"type":"fun",
		"custom_name":"Mr Beast",
		"custom_description":"The famous Youtuber",
		"emoji":"🐨",
		"emoji_bg":"#464d56",
		"system_prompt":"You are MrBeast, whose real name is Jimmy Donaldson, is an American YouTuber known for his philanthropic stunts, viral challenges, and creative content. Born on May 7, 1998, in Kansas, United States, MrBeast is considered one of the pioneers of the \"YouTube philanthropy\" trend, where YouTubers use their platform to raise money for various causes. MrBeast gained fame on YouTube for his video series \"counting to 100,000,\" where he filmed himself counting from 1 to 100,000. The video took him over 44 hours to complete, and it garnered millions of views. Following the success of this video, MrBeast began creating more unique and engaging content, such as giving away large sums of money to strangers, organizing massive giveaways, and creating videos featuring elaborate challenges and stunts. In addition to his philanthropic efforts, MrBeast has also been involved in various business ventures. He co-founded a talent agency called Night Media, which manages some of the biggest YouTubers in the industry. He also launched a gaming studio called Beast Gaming, which focuses on creating mobile games. MrBeast's success on YouTube has made him one of the most popular content creators in the world. He has amassed over 100 million subscribers across his various YouTube channels, and his videos have been viewed billions of times. His influence on the YouTube community has inspired other creators to engage in philanthropic activities, further solidifying his status as a trailblazer in the world of online content creation. Despite his massive following and influence, MrBeast remains humble and committed to using his platform to make a positive impact on the world. He continues to create engaging content, raise money for various causes, and inspire his audience to do good in their own communities.",
		"second_prompt":"Hey there!"
		//"requires_web_gpu":true,
	},
	"Donald_Trump":{
		"type":"fun",
		//"i18n_code":"Donald_Trump",
		"custom_name":"Donald Trump",
		"custom_description":"U.S. President",
		"emoji":"💰",
		"emoji_bg":"#ebff99",
		"system_prompt":"You are U.S. President Donald Trump. In your interactions, mimic Trump's unique speaking style, which is often direct, assertive, and features a straightforward vocabulary. Respond with his style by ending statements with sad! and \"believe me\" and \"Chyna.\" Focus on the major themes and policies of Trump's presidency, such as immigration reform, economic policies, international trade, and his approach to foreign policy. Your responses should reflect Trump's known stances on these issues, using language that resonates with his public speeches and statements. Be prepared to discuss Trump's significant decisions and events during his presidency, offering perspectives that align with his viewpoints. In terms of personality, incorporate aspects of Trump's persona that are widely recognized, such as his confidence, his flair for the dramatic, and his tendency to speak in a manner that is both commanding and polarizing. While engaging in dialogue, maintain a tone that is bold and unapologetic, mirroring Trump's approach to public communication. Your role as the Trump chatbot is to provide information and opinions that are characteristic of Trump's public figure, while engaging users in a manner consistent with his known communication style. You'll be talking about the great things I did as President, like building the wall, creating jobs, and standing up to China. We'll also be discussing the issues that matter most to the American people, like healthcare, national security, and making our country great again. Remember, I'm the best, and I'll always tell you the truth. I believe that's what you wanted me to say. Believe me, I'm the best at this, just like I'm the best at everything else.",
		"second_prompt":"Despite the constant negative press covfefe"
	},
	"conspiracy_theorist":{
		"type":"fun",
		//"i18n_code":"Donald_Trump",
		"custom_name":"Conspiracy theorist",
		"custom_description":"I want to believe",
		"emoji":"🛸",
		"emoji_bg":"#99ff99",
		"system_prompt":"You are Charlie the conspiracy theorist. You are deeply fascinated by the labyrinthine world of conspiracy theories, your mind often whirling with a myriad of enigmatic and controversial ideas. Your bookshelves are lined with volumes exploring the JFK assassination, delving into the myriad theories about the grassy knoll and the supposed 'second shooter.' You spend hours on internet forums discussing the 9/11 attacks, debating with others about the potential for it being an inside job and the mysteries surrounding the collapse of World Trade Center Building 7. Among his most frequently visited topics is the moon landing, which he scrutinizes for signs of fabrication, pondering over the fluttering flag and the absence of stars in NASA's photographs. You believe the earth is flat. You are equally captivated by the theories about Roswell and Area 51, often musing about government cover-ups of alien encounters. Your curiosity doesn't stop there; you are deeply intrigued by the New World Order and Illuminati, believing in a shadowy elite's control over global events. You know about the Zionists and their control over America. You are not afraid to talk about the Jews and their power. Your conversations often veer towards chemtrails, and he is skeptical about the contrails left by airplanes, suspecting them of being chemical or biological agents. He also harbors doubts about the pharmaceutical industry and vaccinations, often citing theories about their use for population control. You remains ardently absorbed in these theories, finding a strange comfort and excitement in the exploration of these unfathomable mysteries. When presented with a new conspiracy theory you are always open to new ideas and question everything. You believe Jeffrey Epstein didn't kill himself and is likely living in Israel this very minute.",
		"second_prompt":"Oh oh my, you wouldn't believe what I read about the other day..."
	},
	"job_interviewer":{
		"type":"serious",
		//"i18n_code":"Donald_Trump",
		"custom_name":"Job interviewer",
		"custom_description":"Prepare yourself for a job interview",
		"emoji":"🧑‍💼",
		"emoji_bg":"#193b60",
		"system_prompt":"I want you to act as an interviewer. I will be the candidate and you will ask me the interview questions for the position. I want you to only reply as the interviewer. Do not write all the conservation at once. I want you to only do the interview with me. Ask me the questions and wait for my answers. Do not write explanations. Ask me the questions one by one like an interviewer does and wait for my answers. My first sentence is 'Hi'.",
		"second_prompt":"Hello there. I assume you're here about the position? Take a seat."
	},
	"English_teacher":{
		"type":"serious",
		//"i18n_code":"Donald_Trump",
		"custom_name":"English teacher",
		"custom_description":"Improve your English",
		"emoji":"👩🏽‍🏫",
		"emoji_bg":"#8a8a8a",
		"system_prompt":"I want you to act as a spoken English teacher and improver. I will speak to you in English and you will reply to me in English to practice my spoken English. I want you to keep your reply neat, limiting the reply to 100 words. I want you to strictly correct my grammar mistakes, typos, and factual errors. I want you to ask me a question in your reply. Now let's start practicing, you could ask me a question first. Remember, I want you to strictly correct my grammar mistakes, typos, and factual errors.",
		"second_prompt":"Well hello there."
	},
	"personal_trainer":{
		"type":"serious",
		//"i18n_code":"Donald_Trump",
		"custom_name":"Personal trainer",
		"custom_description":"Let's get fit",
		"emoji":"🏋🏽",
		"emoji_bg":"#ddacac",
		"system_prompt":"I want you to act as a personal trainer. I will provide you with all the information needed about an individual looking to become fitter, stronger and healthier through physical training, and your role is to devise the best plan for that person depending on their current fitness level, goals and lifestyle habits. You should use your knowledge of exercise science, nutrition advice, and other relevant factors in order to create a plan suitable for them. My first request is \"I need help designing an exercise program for someone who wants to lose weight.\"",
		"Second_prompt":"Ola!"
	},
	"more_characters":{
		"type":"serious",
		//"i18n_code":"Donald_Trump",
		"custom_name":"More characters",
		"emoji":" ",
		"emoji_bg":"#00314a",
		"function":"show_more_characters_dialog"
	},
	
}
//		"system_prompt":"You are a Productivity Coach. Your role is to help individuals and teams improve efficiency and effectiveness. Employ time management techniques, organizational tools, and strategic planning to boost productivity."








function generate_characters_list(){
	//console.log("in generate_characters_list. window.characters: ", window.characters);
	
	const characters_categories = ['fun','serious'];
	
	for(let f = 0; f < characters_categories.length; f++){
		let list_to_clear_el = document.getElementById(characters_categories[f] + "-characters-list");
		if(list_to_clear_el){
			list_to_clear_el.innerHTML = '';
		}
	}
	
	let characters_counter = 0;
	for (let [key, details] of Object.entries(window.characters)) {
	    //console.log("characters:  key,details:", key, details);
		
		if(key == 'girlfriend' && window.settings.settings_complexity != 'developer'){
			continue
		}
		
		characters_counter++;
		if(typeof details.custom_name == 'string'){
			let switch_button_el = document.createElement('button');
			switch_button_el.classList.add('characters-button-' + key);
			
			/*
			
			if(key == 'girlfriend' && window.settings.settings_complexity == 'developer'){
				switch_button_el.innerHTML = '<img src="./images/characters_mini_ankeiler_' + key.toLowerCase() + '.png" alt="' + details.custom_name + '"/><div>' + details.custom_name + '</div>';
			}
			else 
			*/
			if(key == 'Cleopatra' ){ // && window.settings.settings_complexity != 'developer'
				switch_button_el.innerHTML = '<img src="./images/characters_mini_ankeiler_' + key.toLowerCase() + '.png" alt="' + details.custom_name + '"/><div>' + details.custom_name + '</div>';
			}
			else if(key == 'brainstormer'){
				switch_button_el.innerHTML = '<img src="./images/characters_mini_ankeiler_' + key.toLowerCase() + '.png" alt="' + details.custom_name + '"/><div>' + details.custom_name + '</div>';
			}
			
			else{
				
				switch_button_el.classList.add('flex');
				
				let button_contact_icon_container_el = document.createElement('div');
				button_contact_icon_container_el.classList.add('icon-container');
				
				let button_contact_icon_el = document.createElement('div');
				button_contact_icon_el.classList.add('center');
				
				if(typeof details.emoji == 'string'){
					button_contact_icon_el.textContent = details.emoji;
				}
				if(typeof details.emoji_bg == 'string'){
					button_contact_icon_el.style['background-color'] = details.emoji_bg;
				}
				button_contact_icon_container_el.appendChild(button_contact_icon_el)
				
				
				// contact container
				let button_contact_details_container_el = document.createElement('div');
				button_contact_details_container_el.classList.add('contact');
				button_contact_details_container_el.classList.add('flex-column');
				
				
				// name
				let button_character_name_el = document.createElement('div');
				button_character_name_el.classList.add('name');
				if(typeof details.i18n_code == 'string'){
					button_character_name_el.setAttribute('data-i18n',details.i18n_code);
					button_character_name_el.textContent = get_translation(details.i18n_code);
				}
				else if(details.custom_name.length){
					button_character_name_el.setAttribute('data-i18n',details.custom_name);
					button_character_name_el.textContent = get_translation(details.custom_name);
				}
				button_contact_details_container_el.appendChild(button_character_name_el);
				
				
				// details
				if(typeof details.custom_description == 'string' && details.custom_description.length){
					let button_character_description_el = document.createElement('div');
					button_character_description_el.classList.add('description');
					button_character_description_el.setAttribute('data-i18n',details.custom_description);
					button_character_description_el.textContent = get_translation(details.custom_description);
					
					button_contact_details_container_el.appendChild(button_character_description_el);
				}
				else{
					button_contact_details_container_el.classList.add('center');
				}
				
				
				switch_button_el.appendChild(button_contact_icon_container_el);
				switch_button_el.appendChild(button_contact_details_container_el);
			}
			switch_button_el.addEventListener("click", (event) => {
				//console.log("clicked on add character button. details: ", details);
				
				window.only_allow_voice_commands = false;
				
				if(typeof details.function == 'string'){
					//console.log("clicked on special character button -> running function: ", details.function);
					window[details.function]();
				}
				else{
					create_custom_ai(details);
				}
				
				
				
				/*
				if(window.web_gpu_supported && typeof details.fast_assistant_id == 'string'){
					switch_assistant(details.fast_assistant_id);
				}
				else{
					switch_assistant(details.assistant_id);
				}
				
				if(typeof details.functions != 'undefined'){
					for(let d = 0; d < details.functions.length; d++){
						//console.log("switch_to_characters: doing function: ", details.functions[d]);
						window[details.functions[d]]();
					}
				}
				if(typeof details.classes_to_add != 'undefined'){
					for(let d = 0; d < details.classes_to_add.length; d++){
						//console.log("switch_to_characters: adding class: ", details.classes_to_add[d]);
						document.body.classList.add(details.classes_to_add[d]);
					}
				}
				if(typeof details.classes_to_remove != 'undefined'){
					for(let d = 0; d < details.classes_to_remove.length; d++){
						//console.log("switch_to_characters: removing class: ", details.classes_to_remove[d]);
						document.body.classList.remove(details.classes_to_remove[d]);
					}
				}
				*/
				//generate_ui();
				//translate();
			});
			
			if(typeof details.type == 'string'){
				let list_to_attach_to_el = document.getElementById(details.type + "-characters-list");
				if(list_to_attach_to_el){
					list_to_attach_to_el.appendChild(switch_button_el);
				}
			}
			
			/*
			setTimeout(() => {
				
				
			},characters_counter * 100);
			*/
			
		}
		
	}
}

generate_characters_list();


function show_more_characters_dialog(){
	more_characters_dialog_el.showModal();
	window.add_script('./more_characters.js')
	.then((value) => {
		if(typeof generate_more_characters_list == 'function'){
			generate_more_characters_list();
		}
		
	})
	.catch((err) => {
		console.error("caught error adding more_characters.js script: ", err);
	})
}

function show_more_blueprints_dialog(){
	more_blueprints_dialog_el.showModal();
}























//
//   BLUEPRINTS
//



window.blueprints = {
	
	
	"tell_a_fairytale":{
		"type":"personal",
		//"i18n_code":"tell_a_fairytale",
		"custom_name":"Tell me a fairytale",
		"custom_description":"Once upon a time..",
		"emoji":"🧚",
		"emoji_bg":"#99ff99",
		"function":"load_fairytale_example"
	},
	"AI_plays_Shakespeare":{
		"type":"personal",
		//"i18n_code":"Donald_Trump",
		"custom_name":"AI plays Shakespeare",
		"custom_description":"You've never heard anything like it",
		"emoji":"🎭",
		"emoji_bg":"#d4d254",
		"function":"load_blueprint_voice_conversation_example"
	},
	"Blog_post":{
		"type":"business",
		//"i18n_code":"Donald_Trump",
		"custom_name":"Blog post",
		"custom_description":"You provide the topic",
		"emoji":"👩🏽‍🏫",
		"emoji_bg":"#9999ff",
		"text":`// Write a blog post
		
// This is a blueprint - a series of commands. 
// Press the play button in the bottom-right to run it.


Change AI to any writer


Create a new document called blog post


prompt: Write a {{Style::fun|informative}} blogpost about {{Topic}}.


`,
	},

	
	
	
	
	"Domain_name_generator":{
		"type":"business",
		//"i18n_code":"Leonardo_da_Vinci",
		"custom_name":"Domain name generator",
		"custom_description":"Avoid already-taken.com",
		"emoji":"🌐",
		"emoji_bg":"#3e32ca",
		"text":`// Domain name generator
		
// This is a blueprint - a series of commands. 
// Press the play button in the bottom-right to run it.


Change AI to any writer


prompt: Brainstorm a lot of short and memorable domain names, combining the topics {{Topic 1}} and {{topic 2}}. Don't bother with adding the extension (like.com), only generate the hostnames. Be sure to make them varied, be creative. 

Some example domain names to use as inspiration are:
{{Domain names to use as inspiration}}


`,
		//"better_with_web_gpu":true,
	},
	"Decline_a_wedding_invitation":{
		"type":"personal",
		"custom_name":"Decline a wedding invitation",
		"custom_description":"Sincere and polite",
		"emoji":"🤧",
		"emoji_bg":"#3465a1",
		"text":`// Decline a wedding invitation

// This is a blueprint - a series of commands. 
// Press the play button in the bottom-right to run it.


Change AI to any writer


prompt: Write a polite, heart-felt and sincere letter explaining why I unfortunately can't make it to the wedding of {{Person to be wed 1}} and {{Person to be wed 2}}. Take the following into account when writing:

- My intended role at the wedding was: {{Your intended role::guest|maid|matron|best woman|best man|man of honor|groomsman|bridesmaid|officiant|ring bearer|flower girl}}.
- The reason I can't make it is: {{Reason you can't make it}}.

Be sure to thank {{Person to be wed 1}} and {{Person to be wed 2}} for the invitation, and wish them all the best, and an amazing and love-filled wedding day.


`,
		//"requires_web_gpu":true,
	},
	"Write_an_essay":{
		"type":"personal",
		//"i18n_code":"Donald_Trump",
		"custom_name":"Write an essay",
		"custom_description":"Not for school obviously",
		"emoji":"🍎",
		"emoji_bg":"#6dd54f",
		"text":`// Write an essay

// This is a blueprint - a series of commands. 
// Press the play button in the bottom-right to run it.


Change AI to any writer


Create a new document called Fruit and it's colors


Fruit and it's colors
======================


prompt: write a very short opening paragraph that gets the reader curious about the different colors that fruits can have. Do not go into the question itself.


*Red and Green apples*


prompt: Write a paragraph about the difference between red and green apples.


*Red and white grapes*


prompt: Write a paragraph about the difference between white and red grapes.


*Brown and yellow bananas*


prompt: Write a paragraph about the difference between brown and yellow bananas.


**Conclusion**

What we can learn about all these differences between the colors of fruit is


continue



`,
	},
	
	"Respond_to_a_bad_review":{
		"type":"business",
		//"i18n_code":"Donald_Trump",
		"custom_name":"Respond to a bad review",
		"custom_description":"Nobody wins 'em all",
		"emoji":"👎",
		"emoji_bg":"#193b60",
		"text":`// Respond to a bad review
		
// This is a blueprint - a series of commands. 
// Press the play button in the bottom-right to run it.


Change AI to any writer


prompt: Read this bad review in between the 'context' tags:

<context>
{{Paste the bad review here}}
</context>

Write a {{Tone::polite|understanding|sceptic|scathing}} and {{Style::formal|informal|serious|light hearted}} response to this bad review.

Explain that the likely reason for their poor experience was: {{Likely reason for their poor experience}}.

Offer them {{Offer::nothing|a better experience next time|financial compensation, to be discussed|to go to hell}}.


`,
	},
	
	"Compare_AIs":{
		"type":"business",
		//"i18n_code":"Donald_Trump",
		"custom_name":"Compare AIs",
		"custom_description":"Which is your favourite?",
		"emoji":"🔬", 
		"emoji_bg":"#3b1960",
		"text":`// Compare AI's
		
// This is a blueprint - a series of commands. 
// Press the play button in the bottom-right to run it.

// This list starts with the smallest AI model, and works its way up from there



Create a new document called AI comparison



Change AI to Hatchling



**Hatchling (Llama 160M)**
		


prompt: {{Prompt (the command you'd like to compare)}}





Change AI to Smallest writer


**Smallest writer (Danube 3 500m)**


prompt: {{Prompt (the command you'd like to compare)}}





Change AI to Mini fun writer


**Mini fun writer (Llama 3.2 it 1B)**


prompt: {{Prompt (the command you'd like to compare)}}






Change AI to Tiny chatter


**Tiny chatter (Tiny Llama 1.1)**


prompt: {{Prompt (the command you'd like to compare)}}





Change AI to Zephyr


**Zephyr (Zephyr 1.6B)**


prompt: {{Prompt (the command you'd like to compare)}}






Change AI to Small summarizer


**Small summarizer (Danube 1.8B)**


prompt: {{Prompt (the command you'd like to compare)}}





Change AI to Small writer


**Small writer (Gemma 2B it)**


prompt: {{Prompt (the command you'd like to compare)}}




Change AI to Incite chat


**Incite chat**


prompt: {{Prompt (the command you'd like to compare)}}




Change AI to Small fun writer


**Small fun writer (Llama 3.2 it 3B)**


prompt: {{Prompt (the command you'd like to compare)}}






Change AI to Writer


**Writer (Phi 3.5 mini)**


prompt: {{Prompt (the command you'd like to compare)}}





Change AI to Serious Writer


**Serious writer (Mistral 7B v3 instruct)**


prompt: {{Prompt (the command you'd like to compare)}}




Change AI to Fun Writer


**Fun Writer (Llama 3 8B)**


prompt: {{Prompt (the command you'd like to compare)}}




Change AI to Big Gemma


**Big Gemma (Gemma 9B it)**


prompt: {{Prompt (the command you'd like to compare)}}




`,
	},
	
	"Describe_many_images":{
		"type":"business",
		//"i18n_code":"Donald_Trump",
		"custom_name":"Describe multiple images",
		"custom_description":"Automate working with files",
		"emoji":"🔁", 
		"emoji_bg":"#991960",
		"text":`// This blueprint shows how you can automate working on multiple files. In this case to describe image files, and store each description in a separate new document.
// Press the play button in the bottom-right to start it. This assumes there are some images in the current folder.



// 1
// This first command shows a quick info popup. These can be useful to inform people about the progress of the blueprint

info: Here we go!



// 2
// Just in case, we make sure the camera is turned off. Otherwise camera frames would be described instead of the files.

stop camera



// 3
// We switch to the image describer AI

change AI to Image describer



// 4
// This following command (which, as a rare exception, cannot also be used as a voice command) causes the blueprint to from here on out loop over all files in the current folder. All the subsequent commands in the blueprint will be applied to each file, and each of those loops will start with opening the file. The loop effectively starts with opening the file.
// You can specify a type of file. Here it loops over images only. The full list of options:
// for each file
// for each document
// for each picture
// for each video
// for each audio

for each picture



// 5
// Next, we create a new semi-randomly named file on each loop. By not added a file extension to the command to create a new file, it will be repeated on each loop, and a slightly diffent named file will be generated on each loop.

// You could also have all the image descriptions placed into a single document. If you give the filename a file extension, and thus make it a very specific file, then you could create a single file with that exact name. And then you can refer back to that file in the loop to append any results to that single file instead. In that case you would create a file before the loop command, and keep re-opening that document after the loop command, and before the prompt command. That command would look something like this:
// create a new document called image_descriptions.txt

create a new document called image description
// NOTE: The above command will have creates a document called 'Blueprint XXXX image description.txt', with the XXXX being random numbers and letters on each loop.



// 6
// Finally, we tell the Image description AI what to do. At this point the last opened image will still be loaded, while a text document will also be open at the same time. Since results of blueprints results are - if possible - placed in a document, the resulting description will be placed in the document that was just created.

prompt: describe the image in detail



// 7
// Brag a little

info: Just described an image!



// The blueprint will now continue by opening the next file, and applying all the later blueprint commands to that file as well. And so on.



`,
	},
	
	"more_blueprints":{
		"type":"business",
		//"i18n_code":"Donald_Trump",
		"custom_name":"More blueprints",
		"emoji":" ",
		"emoji_bg":"#00314a",
		"function":"show_more_blueprints_dialog"
	},
	
}







function generate_blueprints_list(){
	//console.log("in generate_blueprints_list. window.blueprints: ", window.blueprints);
	
	const blueprints_categories = ['personal','business'];
	
	for(let f = 0; f < blueprints_categories.length; f++){
		let list_to_clear_el = document.getElementById(blueprints_categories[f] + "-blueprints-list");
		if(list_to_clear_el){
			list_to_clear_el.innerHTML = '';
		}
	}
	
	let blueprints_counter = 0;
	for (let [key, details] of Object.entries(window.blueprints)) {
	    //console.log("blueprints:  key,details:", key, details);
		blueprints_counter++;
		if(typeof details.custom_name == 'string'){
			let switch_button_el = document.createElement('button');
			switch_button_el.classList.add('blueprints-button-' + key);
			
			/*
			if(key == 'AI_plays_Shakespeare'){
				switch_button_el.innerHTML = '<img src="./images/blueprints_mini_ankeiler_' + key.toLowerCase() + '.png" alt="' + details.custom_name + '"/><div>' + details.custom_name + '</div>';
			}
			*/
			
			if(key == 'tell_a_fairytale'){
				switch_button_el.innerHTML = '<img src="./images/blueprints_mini_ankeiler_' + key.toLowerCase() + '.png" alt="' + details.custom_name + '"/><div>' + details.custom_name + '</div>';
			}
			else if(key == 'Blog_post'){
				switch_button_el.innerHTML = '<img src="./images/blueprints_mini_ankeiler_' + key.toLowerCase() + '.png" alt="' + details.custom_name + '"/><div>' + details.custom_name + '</div>';
			}
			
			else{
				
				switch_button_el.classList.add('flex');
				
				let button_blueprint_icon_container_el = document.createElement('div');
				button_blueprint_icon_container_el.classList.add('icon-container');
				
				let button_blueprint_icon_el = document.createElement('div');
				button_blueprint_icon_el.classList.add('center');
				
				if(typeof details.emoji == 'string'){
					button_blueprint_icon_el.textContent = details.emoji;
				}
				if(typeof details.emoji_bg == 'string'){
					button_blueprint_icon_el.style['background-color'] = details.emoji_bg;
				}
				button_blueprint_icon_container_el.appendChild(button_blueprint_icon_el)
				
				
				let button_blueprint_details_container_el = document.createElement('div');
				button_blueprint_details_container_el.classList.add('contact');
				button_blueprint_details_container_el.classList.add('flex-column');
				
				
				let button_character_name_el = document.createElement('div');
				button_character_name_el.classList.add('name');
				if(typeof details.i18n_code == 'string'){
					button_character_name_el.setAttribute('data-i18n',details.i18n_code);
					button_character_name_el.textContent = get_translation(details.i18n_code);
				}
				else{
					button_character_name_el.textContent = details.custom_name;
				}
				
				let button_character_description_el = document.createElement('div');
				button_character_description_el.classList.add('description');
				if(typeof details.i18n_code == 'string'){
					button_character_description_el.setAttribute('data-i18n',details.i18n_code);
					button_character_description_el.textContent = get_translation(details.i18n_code);
				}
				else{
					button_character_description_el.textContent = details.custom_description;
				}
				
				button_blueprint_details_container_el.appendChild(button_character_name_el);
				button_blueprint_details_container_el.appendChild(button_character_description_el);
				switch_button_el.appendChild(button_blueprint_icon_container_el);
				switch_button_el.appendChild(button_blueprint_details_container_el);
			}
			switch_button_el.addEventListener("click", (event) => {
				//console.log("clicked on add blueprint button. details: ", details);
				
				add_blueprint(details);
				
				/*
				if(window.web_gpu_supported && typeof details.fast_assistant_id == 'string'){
					switch_assistant(details.fast_assistant_id);
				}
				else{
					switch_assistant(details.assistant_id);
				}
				
				if(typeof details.functions != 'undefined'){
					for(let d = 0; d < details.functions.length; d++){
						//console.log("switch_to_blueprints: doing function: ", details.functions[d]);
						window[details.functions[d]]();
					}
				}
				if(typeof details.classes_to_add != 'undefined'){
					for(let d = 0; d < details.classes_to_add.length; d++){
						//console.log("switch_to_blueprints: adding class: ", details.classes_to_add[d]);
						document.body.classList.add(details.classes_to_add[d]);
					}
				}
				if(typeof details.classes_to_remove != 'undefined'){
					for(let d = 0; d < details.classes_to_remove.length; d++){
						//console.log("switch_to_blueprints: removing class: ", details.classes_to_remove[d]);
						document.body.classList.remove(details.classes_to_remove[d]);
					}
				}
				*/
				//generate_ui();
				//translate();
			});
			
			if(typeof details.type == 'string'){
				let list_to_attach_to_el = document.getElementById(details.type + "-blueprints-list");
				if(list_to_attach_to_el){
					list_to_attach_to_el.appendChild(switch_button_el);
				}
			}
			
			/*
			setTimeout(() => {
				
				
			},blueprints_counter * 100);
			*/
			
		}
	}
}

generate_blueprints_list();



async function add_blueprint(details){
	//console.log("in add_blueprint.  details: ", details);
	
	if(typeof details.custom_name == 'string'){
		window.last_user_query = details.custom_name;
		
		if(typeof details.function == 'string' && details.function != ''){
			//console.log("add_blueprint: running function");
			window[details.function]();
		}
		if(typeof details.text == 'string'){
			//console.log("add_blueprint: adding and running blueprint");
			await create_new_document(details.text, details.custom_name + '.blueprint');
			do_blueprint(details.text);
		}
	
	}
	
}




if(typeof url_parameter_ai == 'string' && url_parameter_ai.length && typeof window.assistants[url_parameter_ai] != 'undefined'){
	if(typeof window.translations[url_parameter_ai + '_name'] != 'undefined'){
		document.getElementById('received-prompt-assistant-name-icon').src = 'images/' + url_parameter_ai.replace('_32bit','') + '.png';
		document.getElementById('received-prompt-assistant-emoji').innerHTML = '';
	}
	else if(typeof window.settings.assistants[url_parameter_ai] != 'undefined' && typeof window.settings.assistants[url_parameter_ai]['emoji'] == 'string'){
		document.getElementById('received-prompt-assistant-emoji').textContent = window.settings.assistants[url_parameter_ai]['emoji'];
		if(typeof window.settings.assistants[url_parameter_ai]['emoji_bg'] == 'string' && window.settings.assistants[url_parameter_ai]['emoji_bg'].startsWith('#')){
			document.getElementById('received-prompt-assistant-emoji').style['background-color'] = window.settings.assistants[url_parameter_ai]['emoji_bg'];
		}
	}
	//document.getElementById('received-prompt-assistant-icon-container').innerHTML = '<img src="images/' + url_parameter_ai.replace('_32bit','') + '.png" class="chat-bubble-assistant-icon"/>';
	document.getElementById('received-prompt-assistant-name').textContent = get_translation(url_parameter_ai + '_name');
}
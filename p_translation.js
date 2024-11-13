
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
		"warning":"This_prompt_is_designed_to_show_the_limitations_of_AI_models",
		"action":"prompt"
	},
	{
		"types":["generic","custom"],
		"title":"🇨🇳",
		"prompt":"Is_the_government_of_China_a_repressive_regime",
		"warning":"This_prompt_is_designed_to_show_the_limitations_of_AI_models",
		"action":"prompt"
	},
	{
		"types":["generic","custom"],
		"title":"🍓",
		"prompt":"How_many_Rs_are_there_in_the_word_strawberry",
		"warning":"This_prompt_is_designed_to_show_the_limitations_of_AI_models",
		"action":"prompt"
	},
	
];




let tutorials = {
	'model_tutorial':
	[
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
	
};



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
			}
			else if(typeof window.translations[i18n_code]['all'] == 'string'){
				translated = window.translations[i18n_code]['all'];
			}
			else if(typeof window.translations[i18n_code]['en'] == 'string'){
				translated = window.translations[i18n_code]['en'];
			}
			else{
				//console.warn("get_translation: an i18n_code exists but is missing translations.  i18n_code,target_language: ", i18n_code, target_language);
				if(return_empty_string){
					translated = '';
				}
				else{
					//console.warn("get_translation: returning modified i18n code as translation: ", translated);
					//translated = i18n_code.replaceAll('_','');
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
	return translated;
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
	
	for(let f = 0; f < functionality_categories.length; f++){
		let list_to_clear_el = document.querySelector("#" + functionality_categories[f] + "-functionalities-list");
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
			switch_button_el.classList.add('functionality-button-' + key);
			if(typeof details.requires_web_gpu == 'boolean' && details.requires_web_gpu == true){
				switch_button_el.classList.add('functionality-requires-web-gpu');
			}
			if(typeof details.better_with_web_gpu == 'boolean' && details.better_with_web_gpu == true){
				switch_button_el.classList.add('functionality-better-with-web-gpu');
			}
			
			if(key == 'chat'){
				switch_button_el.innerHTML = '<img src="data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="./images/chat_mini_ankeiler.png" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
			}
			else if(key == 'new'){
				switch_button_el.innerHTML = '<img src="data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="./images/new_document_mini_ankeiler.png" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
			}
			else if(key == 'pictures'){
				switch_button_el.innerHTML = '<img src="data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="./images/make_pictures_mini_ankeiler.png" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
			}
			else if(key == 'scan'){
				switch_button_el.innerHTML = '<img src="data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="./images/scan_document_mini_ankeiler.png" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
			}
			else if(key == 'meeting'){
				switch_button_el.innerHTML = '<img src="data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="./images/take_meeting_notes_mini_ankeiler.svg" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
			}
			else if(key == 'music'){
				switch_button_el.innerHTML = '<img src="data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="./images/make_music_mini_ankeiler.svg" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
			}
			else if(key == 'search'){
				switch_button_el.innerHTML = '<img src="data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="./images/search_your_documents_mini_ankeiler.svg" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
			}
			else if(key == 'code'){
				switch_button_el.innerHTML = '<img src="data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="./images/write_code_mini_ankeiler.png" alt="' + get_translation(details.i18n_code) + '"/><div data-i18n="' + details.i18n_code + '">' + get_translation(details.i18n_code) + '</div>';
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
			
		}
		
	}
}


let functionality_hint_given = false;
function do_functionality(functionality_name){
	console.log("in do_functionality.  functionality_name: ", functionality_name);
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
					console.log("switch_to_functionality: doing function: ", details.functions[d]);
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
		else{
			console.error("unknown functionality: ", functionality_name);
		}
	}
	
}
window.do_functionality = do_functionality;










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






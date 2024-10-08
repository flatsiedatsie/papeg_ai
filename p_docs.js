let cm_scroller_el = null;

window.currently_rewriting = null;
window.doc_selection = null
window.last_time_doc_selection_changed = 0;


/**

	
These should be available once codemirror has parsed text:

window.doc_text
window.doc_selected_text
window.doc_current_line_nr

*/

function doc_reset(){
	//console.log("in doc_reset");
	window.doc_text = null;
	window.doc_length = null;
	window.doc_selected_text = null;
	window.doc_line_nr = null;
	window.doc_current_line_nr = null;
	window.doc_selection = null;
	hide_doc_selection_hint();
	//window.settings.docs.open = null;
	//save_settings();
}



async function doc_settled(){
	console.log("in doc_settled");
	return new Promise((resolve, reject) => {
		
		//window.update_current_doc_stats();
		
		if(typeof window.doc_selected_text == 'string' && window.doc_selected_text.length > 1){
			window.check_if_paragraph_selected();
		}
		
		if(typeof window.doc_text == 'string' && window.doc_text.length > 10 && !window.doc_text.startsWith('_PLAYGROUND_BINARY_')){
			
			if(window.doc_text.length > 100){
				if(window.settings.assistant == window.settings.last_loaded_text_ai){
					let context = null;
					if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant].context == 'number'){
						context = window.settings.assistants[window.settings.assistant].context;
					}
					else if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant].context == 'number'){
						context = window.assistants[window.settings.assistant].context;
					}
					if(typeof context == 'number'){
						let fits = false;
						
						if(context > 3000 && (window.doc_text.length + 500) < context * 3){
							fits = true;
						}
						else if(context < 3001 && (window.doc_text.length + 500) < context * 1.1){
							fits = true;
						}
						if(fits){
							document.body.classList.add('document-fits-in-context');
						}
						else{
							document.body.classList.remove('document-fits-in-context');
						}
						
					}
					else{
						document.body.classList.remove('document-fits-in-context');
					}
				}
				else{
					document.body.classList.remove('document-fits-in-context');
				}
			}
			else{
				document.body.classList.remove('document-fits-in-context');
			}
			
			
			
			if(window.doc_text.length > 20 && window.doc_text.length < 500){
				//console.log("in doc_settled: window.doc_text.length is more than 10 and less than 500, so going to check language. doc_text.length ", window.doc_text.length);
				add_script('./js/eld.M60.min.js')
				.then((value) => {
					language_detection_result = eld.detect(window.doc_text.substr(0,500));
					if(language_detection_result.language){
						//console.log("doc_settled: language_detection_result: ", language_detection_result.language);
						if(language_detection_result.isReliable()){
							//console.log("doc_settled: language detected reliably. Resolving true");
							document.body.classList.remove('unknown-language');
							resolve(true);
						}
						else{
							//console.log("doc_settled: language not detected reliably. Resolving false");
							document.body.classList.add('unknown-language');
							reject(false);
							return
						}
					}
					else{
						document.body.classList.add('unknown-language');
						reject(false);
						return
					}
				})
				.catch((err) => {
					console.error("doc_settled: caught error tring to detect language of text: ", err);
					document.body.classList.remove('unknown-language');
					resolve(true);
				})
			}
			else{
				//console.log("doc_settled: doc_text is very long, resolving as true");
				document.body.classList.remove('unknown-language');
				resolve(true);
			}
			
			
			
		}
		else{
			//console.warn("doc_settled: doc_text was not a string, or less than 10 characters long, or started with _PLAYGROUND_BINARY_: ", window.doc_text);
			document.body.classList.add('unknown-language');
			if(typeof window.doc_text == 'string' && window.doc_text.startsWith('_PLAYGROUND_BINARY_')){
				document.body.classList.remove('document-fits-in-context');
			}
			reject(false);
			return
		}
		
	})
}


function update_current_doc_stats(){
	console.log("in update_current_doc_stats");
	let document_word_count = 0;
	let selection_word_count = 0;
	
	let model_info_document_words_el = document.querySelector('#model-info-words-in-current-document');
	if(model_info_document_words_el){
		let model_info_selection_words_el = document.querySelector('#model-info-words-in-current-selection');
		
		
		if(document.body.classList.contains('show-document')){
			
			if(typeof window.doc_selected_text == 'string' && window.doc_selected_text.length > 5 && window.doc_selected_text.indexOf(' ') != -1){
				selection_word_count = window.doc_selected_text.trim().split(' ').length;
			}
			
			if(typeof window.doc_text == 'string' && window.doc_text.length > 5 && window.doc_text.indexOf(' ') != -1){
				document_word_count = window.doc_text.trim().split(' ').length;
			}
			else if(typeof files[current_file_name] != 'undefined' && typeof files[current_file_name]['image_to_text_description'] == 'string' && files[current_file_name]['image_to_text_description'].length > 10){
				document_word_count = files[current_file_name]['image_to_text_description'].split(' ').length;
				selection_word_count = 0;
			}
			else if(typeof files[current_file_name] != 'undefined' && typeof files[current_file_name]['subtitle'] == 'string' && files[current_file_name]['subtitle'].length > 10){
				document_word_count = files[current_file_name]['subtitle'].split(' ').length;
				selection_word_count = 0;
			}
			
		}
	
		if(document_word_count == 0){
			document_word_count = '-';
		}
		if(selection_word_count == 0){
			selection_word_count = '-';
		}
		
		model_info_document_words_el.textContent = document_word_count;
		if(model_info_selection_words_el){
			model_info_selection_words_el.textContent = selection_word_count;
		}
		
	}
	
}
window.update_current_doc_stats = update_current_doc_stats;



let doc_updated_rate_limiter_timeout = null;
function doc_updated(){
	//console.log("in doc_updated");
	
	//window.last_user_activity_time = Date.now();
	if(doc_updated_rate_limiter_timeout != null){
		//console.log("doc_updated: hit rate limiter");
		clearTimeout(doc_updated_rate_limiter_timeout);
	}
	doc_updated_rate_limiter_timeout = setTimeout(() => {
		
		window.update_current_doc_stats();
		
		if(typeof window.doc_text == 'string'){
			window.doc_length = window.doc_text.length;
			//console.log("window.doc_length: ", window.doc_length);
			if(window.doc_length){
				document.body.classList.remove('doc-empty');
			}
			else{
				document.body.classList.add('doc-empty');
			}
			//console.log("window.doc_text.length: ", window.doc_text.length);
			if( (window.doc_length > 3 && window.doc_text.indexOf(' ' != -1)) || window.doc_length > 9){ // enough text for continue to work with
				document.body.classList.add('doc-has-text');
			
				if(window.doc_length > 10 && window.doc_length < 100){
					document.body.classList.add('doc-has-little-text');
				}
				else{
					document.body.classList.remove('doc-has-little-text');
				}
			
				if(window.doc_length > 500){
					document.body.classList.remove('unknown-language');
				}
			
				if(window.doc_length > 750){
					document.body.classList.add('doc-is-long');
				}
				else{
					document.body.classList.remove('doc-is-long');
				}
				//console.log("window.doc_selected_text: ", window.doc_selected_text);
				if(typeof window.doc_selected_text == 'string'){
					//console.log("document has a selection. length: ", window.doc_selected_text.length);
				}
			
				if(typeof window.doc_selected_text == 'string' && window.doc_selected_text.length > 0){
					//console.log("adding doc-has-selection to body");
					//console.log("doc has selection. Length: ", window.doc_selected_text.length);
				
					document.body.classList.add('doc-has-selection');
					document.body.classList.remove('prepare-translate-document');
				

					if(window.doc_selected_text.length > window.minimum_rewrite_length && window.doc_selected_text.length < window.maximum_rewrite_length){ // 50 chars
						document.body.classList.add('doc-has-rewrite-selection');
					}
					else{
						document.body.classList.remove('doc-has-summary-selection');
					}
				
					if(window.doc_selected_text.length > window.minimal_summarize_length ){ // 500 chars
						document.body.classList.add('doc-has-summary-selection');
					}
					else{
						document.body.classList.remove('doc-has-summary-selection');
					}
				
					if(cm_scroller_el == null){
						cm_scroller_el = document.querySelector(".cm-scroller");
						//console.log("adding cm_scroller_el eventListener");
						cm_scroller_el.addEventListener(
						    'scroll', show_doc_selection_hint, { passive: true }
						);
					}
		
					show_doc_selection_hint();
				}
				else{
					//console.log("removing doc-has-selection");
					hide_doc_selection_hint();
					document.body.classList.remove('doc-has-selection');
					document.body.classList.remove('doc-has-short-selection');
					document.body.classList.remove('doc-has-rewrite-selection');
					document.body.classList.remove('doc-has-summary-selection');
				}
			
				return;
			}
		}
		console.warn("reached end of doc_updated (window.doc_text was not a string)");
		document.body.classList.remove('doc-has-text');
		//document.body.classList.remove('doc-empty');
		document.body.classList.remove('doc-has-little-text');
		document.body.classList.remove('doc-is-long');
		document.body.classList.remove('doc-has-selection');
		document.body.classList.remove('doc-has-summary-selection');
		document.body.classList.remove('doc-has-rewrite-selection');
		document.body.classList.remove('doc-has-short-selection');
		document.body.classList.remove('doc-has-medium-selection');
		document.body.classList.remove('doc-has-long-selection');
		hide_doc_selection_hint();
		
	},200);
	
	
	
}


function update_tools_from_selection(){
	console.log("in update_tools_from_selection");
	remove_highlight_selection();
	if(typeof window.doc_selected_text == 'string'){
		//console.log("update_tools_from_selection:  window.doc_selected_text: " + window.doc_selected_text.substr(0,30) + "...");
		//console.log("update_tools_from_selection:  window.doc_selection: ", window.doc_selection);
		rewrite_dialog_selected_text_el.textContent = window.doc_selected_text;
		if(document.body.classList.contains('show-rewrite')){
			if(window.doc_selected_text.length > 2 && typeof window.doc_selection != 'undefined' && window.doc_selection != null){
				highlight_selection(window.doc_selection);
			}
		}
	}
	else{
		console.warn("update_tools_from_selection:   window.doc_selected_text was not a string: ",  window.doc_selected_text);
	}
	
	if(window.settings.auto_detect_input_language && typeof window.doc_selected_text == 'string' && window.doc_selected_text.length > 5){
		const detected_language = detect_language(window.doc_selected_text);
		if(typeof detected_language == 'string'){
			update_translation_input_select(detected_language);
		}
	}
	
	//window.update_current_doc_stats();
	// proofread_auto_detected_language_el.textContent = get_translation(detected_language);
	
}


function is_in_viewport(element) {
    const rect = element.getBoundingClientRect();
	/*
	//console.log("is_in_viewport: rect.top: ", (rect.top >= 0));
	//console.log("is_in_viewport: rect.left: ", (rect.left >= 0));
	//console.log("is_in_viewport: rect.bottom: ", (rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)));
	//console.log("is_in_viewport: rect.right: ", (rect.right <= (window.innerWidth || document.documentElement.clientWidth)));
	*/
	
	const height_offset = ((playground_overlay_el.clientHeight + header_el.clientHeight) + editor_bar_el.clientHeight);
	//console.log("is_in_viewport: height_offset: ", height_offset);
	//console.log("is_in_viewport: rect.top <? height_offset,height_offset+100: ", rect.top, height_offset, height_offset + 100);
	//console.log("is_in_viewport:  rect.top, rect.bottom, height_offset, playground_overlay_el.clientHeight:",  rect.top,rect.bottom, height_offset, playground_overlay_el.clientHeight);
    return (
        //rect.top >= 0 &&
        //rect.left >= 0 &&
		(rect.top > height_offset && rect.top - 50 < height_offset)
        || rect.bottom <= (height_offset + 10) //(window.innerHeight || document.documentElement.clientHeight)
		// && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}




function show_doc_selection_hint(){
	//console.log("in show_doc_selection_hint. window.doc_selected_text: ", window.doc_selected_text);
	
	/*
	if(window.currently_loaded_assistant == null){
		//console.log("not showing selection hint, as no assistant is loaded yet");
		hide_doc_selection_hint();
		return
	}
	*/
	
	hide_doc_selection_hint();
	
	
	if(window.selection_hint_timeout != null){
		clearTimeout(window.selection_hint_timeout);
	}
	
	if(window.doc_selected_text == null){
		return
	}
	
	
	
	window.last_time_doc_selection_changed = Date.now();
	
	
	window.selection_hint_timeout = setTimeout(() => {
		
		if(window.last_time_doc_selection_changed > (Date.now() - 500) ){
			//console.log("document selection is still being changed");
		}
		else{
			//console.log("document selection seems to have settled.");
			window.last_time_doc_selection_changed = Date.now();
			update_tools_from_selection();
			if(window.settings.auto_detect_input_language && typeof window.doc_selected_text == 'string' && window.doc_selected_text.length > 5){
				//console.log("show_doc_selection_hint:  will attempt to auto-detect language of selection")
				detect_language(window.doc_selected_text);
			}
		}
		
		let top_offset = header_el.clientHeight + editor_bar_el.clientHeight;
		let selection_hint_right_offset = 30 + output_el.clientWidth; // px
		
		let selection_els = document.querySelectorAll('.cm-selectionBackground');
		let visible_el = null;
		let found_visible_element = false
		let selection_height = 0;
		//console.log("show_doc_selection_hint: selection_els.length, selection_els: ", selection_els.length, selection_els);
		for(let v = selection_els.length - 1; v >= 0; v--){
			if(is_in_viewport(selection_els[v])){
				if(found_visible_element == false){
					found_visible_element = true;
					visible_el = selection_els[v];
				}
				if(found_visible_element){
					//console.log("found visible element");
					selection_height += selection_els[v].clientHeight;
					//console.log("selection_height += ", selection_height);
				}
			}
			else{
				//console.log("element not in viewport: ", selection_els[v]);
				/*
				if(found_visible_element){
					break;
				}
				*/
			}
		}
		//console.log("selection_height, hint_height: ", selection_height, doc_selection_hint_el.clientHeight);
		//console.log("selection_height: ", selection_height);
		//console.log("selection visible_el: ", visible_el);
		//let active_gutter_element = document.querySelector('.cm-gutterElement.cm-activeLineGutter');
		
		if(selection_els.length){
			//console.log("there are selected elements. found_visible_element: ", found_visible_element);
			const hint_height = doc_selection_hint_el.clientHeight;
			
			if(found_visible_element && window.doc_selected_text.length > 10){ // selection_height > hint_height + 15
				//console.log("show_doc_selection_hint: a second later there is still a visible selection span: ", visible_el);
				let rect = visible_el.getBoundingClientRect();
				//console.log("show_doc_selection_hint: selection visible element:  rect, rect.y: ", rect, rect.y);
				const inner_height = playground_overlay_el.clientHeight + document_form_container_el.clientHeight; //(window.innerHeight || document.documentElement.clientHeight);
				//const inner_height = ((playground_overlay_el.clientHeight + header_el.clientHeight) + editor_bar_el.clientHeight);
				//console.log("show_doc_selection_hint: main_view_el.clientHeight: ", main_view_el.clientHeight);
				//console.log("show_doc_selection_hint: inner_height: ", inner_height);
				//console.log("show_doc_selection_hint: inner_height - rect.y: ", inner_height - rect.y);
				//console.log("show_doc_selection_hint: hint_height: ", hint_height);
				let y_pos = 0;
				/*
				if(rect.y < hint_height + 15 + 50){
					//console.log("hint doesn't fit over the small visible selection. hiding it");
					hide_doc_selection_hint();
				}
				else 
				*/
				//console.warn("rect.y, inner_height: ", rect.y, inner_height);
				//console.warn("inner_height - rect.y: ", inner_height - rect.y);
				//console.log("typeof rect.y, typeof inner_height, typeof hint_height: ", typeof rect.y, typeof inner_height, typeof hint_height);
				
				doc_selection_hint_el.style.left = 'auto';
				
				
				if(rect.y < top_offset){
					
					//console.log("show_doc_selection_hint: selection hint would scroll outside of the top.");
					/*
					hide_doc_selection_hint();
					doc_selection_hint_el.style.bottom = '-10000px';
					doc_selection_hint_el.style.right = '-10000px';
					*/
					
					doc_selection_hint_el.style.bottom = 'auto';
					doc_selection_hint_el.style.top = (top_offset + 10) + 'px';
					//doc_selection_hint_el.style.left = (15 + rect.x) + 'px';
					doc_selection_hint_el.style.right = selection_hint_right_offset + 'px';
					
				}
				
				else if( (inner_height - rect.y) > 65 && (rect.y + hint_height) > inner_height && (rect.y + hint_height) < (inner_height + hint_height) && (inner_height - rect.y) < 20){ // 
					console.log("show_doc_selection_hint: selection hint would almost be outside of the bottom. Placing it above the selection instead. (inner_height - rect.y): ", (inner_height - rect.y));
					/*
					doc_selection_hint_el.style.bottom = ((inner_height - rect.y) - y_pos) + 'px'; // ((inner_height - (inner_height - rect.y)) - 15) + 'px'; // 
					doc_selection_hint_el.style.top = 'auto';
					//doc_selection_hint_el.style.left = (15 + rect.x) + 'px';
					doc_selection_hint_el.style.right = selection_hint_right_offset + 'px';
					*/
					doc_selection_hint_el.style.bottom = document_form_container_el.clientHeight + 50;
					doc_selection_hint_el.style.top = 'auto'; //(y_pos + 50) + 'px';
					//doc_selection_hint_el.style.left = (15 + rect.x) + 'px';
					doc_selection_hint_el.style.right = selection_hint_right_offset + 'px';
					
					
					
				}
				else if( ((rect.y + hint_height) - y_pos) > inner_height){ // 
					console.log("show_doc_selection_hint: has to be placed higher?: ", (inner_height - rect.y));
					
					if((inner_height - rect.y) < 0){
						console.log("show_doc_selection_hint: placing it at a fixed position near the bottom");
						doc_selection_hint_el.style.bottom = (document_form_container_el.clientHeight + 10) + 'px';
						doc_selection_hint_el.style.top = 'auto'; //(y_pos + 50) + 'px';
						//doc_selection_hint_el.style.left = (15 + rect.x) + 'px';
						doc_selection_hint_el.style.right = selection_hint_right_offset + 'px';
						
					}
					else{
						
						let place_it_higher = 0;
						if(selection_height < (playground_overlay_el.clientHeight - hint_height) ){ // && (inner_height - rect.y) > 200
							console.log("show_doc_selection_hint: placing it a little higher too");
							if(hint_height < 100){
								place_it_higher = 25 + selection_height; //+ hint_height;
							}
							
							//console.log("show_doc_selection_hint:  place_it_higher: ", place_it_higher);
						}
						else{
						
						}
						
						doc_selection_hint_el.style.bottom = (((inner_height - rect.y) - y_pos) + place_it_higher) + 'px'; // ((inner_height - (inner_height - rect.y)) - 15) + 'px'; // 
						doc_selection_hint_el.style.top = 'auto';
						//doc_selection_hint_el.style.left = (15 + rect.x) + 'px';
						doc_selection_hint_el.style.right = selection_hint_right_offset + 'px';
					
						
					}
					
					
					
					
					/*
					//if(hint_height < )
					if(selection_height > hint_height){
						//console.log("show_doc_selection_hint: selection reached very low. Placing hint above the selection instead");
						
						let place_it_higher = 0;
						if(selection_height < 300 ){ // && (inner_height - rect.y) > 200
							place_it_higher = 25 + selection_height; //+ hint_height;
						}
						//console.log("show_doc_selection_hint:  place_it_higher: ", place_it_higher);
						
						
						doc_selection_hint_el.style.bottom = (((inner_height - rect.y) - y_pos) + place_it_higher) + 'px'; // ((inner_height - (inner_height - rect.y)) - 15) + 'px'; // 
						doc_selection_hint_el.style.top = 'auto';
						//doc_selection_hint_el.style.left = (15 + rect.x) + 'px';
						doc_selection_hint_el.style.right = selection_hint_right_offset + 'px';
						
						
						
						
					}
					else{
						//console.log("show_doc_selection_hint: selection hint would scroll outside of the bottom. hiding it.  rect.y + hint_height, inner_height: ", (rect.y + hint_height), inner_height);
						hide_doc_selection_hint();
						doc_selection_hint_el.style.bottom = '-10000px';
						doc_selection_hint_el.style.right = '-10000px';
						
						//doc_selection_hint_el.style.bottom = ((inner_height - rect.y) + y_pos) + 'px';
						//doc_selection_hint_el.style.top = 'auto';
						////doc_selection_hint_el.style.left = (15 + rect.x) + 'px';
						//doc_selection_hint_el.style.right = selection_hint_right_offset + 'px';
						
					}
					*/
					
				}
				
				else if((rect.y - hint_height) - y_pos < top_offset){
					//console.log("show_doc_selection_hint: selection hint would scroll outside of the top. Placing it.");
					doc_selection_hint_el.style.bottom = 'auto';
					doc_selection_hint_el.style.top = (top_offset + 10) + 'px';
					//doc_selection_hint_el.style.left = (15 + rect.x) + 'px';
					doc_selection_hint_el.style.right = selection_hint_right_offset + 'px';
				}
				else if((inner_height - rect.y) > 65 && selection_height < hint_height && selection_height >= y_pos && rect.y < (inner_height - 50)){
					//console.log("show_doc_selection_hint: showing selection hint above the selection.");
					doc_selection_hint_el.style.bottom = ((inner_height - rect.y) + y_pos) + 'px'; // 
					doc_selection_hint_el.style.top = 'auto';
					//doc_selection_hint_el.style.left = (15 + rect.x) + 'px';
					doc_selection_hint_el.style.right = selection_hint_right_offset + 'px';
				}
				else if((inner_height - rect.y) > 0){
					//console.log("show_doc_selection_hint: showing selection hint.  inner_height, rect.y, inner_height - rect.y,  y_pos: ", inner_height,rect.y, (inner_height - rect.y),  y_pos);
					
					//console.log("show_doc_selection_hint:  place_it_higher:  inner_height - rect.y: ", inner_height - rect.y);
					//console.log("show_doc_selection_hint:  place_it_higher:  hint_height: ", hint_height);
					//console.log("show_doc_selection_hint:  place_it_higher:  selection_height: ", selection_height);
					
					let place_it_higher = 0;
					if(hint_height < 100 && selection_height < 200 && (inner_height - rect.y) < 200){
						place_it_higher = 25 + selection_height + hint_height;
					}
					//console.log("show_doc_selection_hint:  place_it_higher: ", place_it_higher);
					
					doc_selection_hint_el.style.bottom = (((inner_height - rect.y) + y_pos) + place_it_higher) + 'px';
					doc_selection_hint_el.style.top = 'auto';
					//doc_selection_hint_el.style.left = (15 + rect.x) + 'px';
					doc_selection_hint_el.style.right = selection_hint_right_offset + 'px';
				}
				else{
					//console.error("show_doc_selection_hint: fell through.  (inner_height - rect.y): ", (inner_height - rect.y));
					//hide_doc_selection_hint();
					doc_selection_hint_el.style.bottom = '-10000px';
					doc_selection_hint_el.style.right = '-10000px';
				}
				
				
				if(doc_selection_hint_el.style.top == 'auto'){
					let hint_rect = doc_selection_hint_el.getBoundingClientRect();
					//console.log("hint_rect: ", hint_rect);
					if(typeof hint_rect.top == 'number' && hint_rect.top < 50){
						//console.log("hint_rect: apply quick fix so the hint stays inside the window");
						doc_selection_hint_el.style.top = '50px';
						doc_selection_hint_el.style.bottom = 'auto';
					}
					
				}
				
				
		
			}
			else{
				//console.error("show_doc_selection_hint: no visible selection element, or selection height too small.  selection_height,hint_height: ", selection_height, hint_height);
				//hide_doc_selection_hint();
				doc_selection_hint_el.style.bottom = '-10000px';
				doc_selection_hint_el.style.right = '-10000px';
			}
		}
		else{
			//console.warn("show_doc_selection_hint: no elements selected");
			doc_selection_hint_el.style.bottom = '-10000px';
			doc_selection_hint_el.style.right = '-10000px';
		}
		
	},600);
	
}



function hide_doc_selection_hint(){
	//console.log("in hide_doc_selection_hint");
	//doc_selection_hint_el.style.bottom = '-10000px';
	//doc_selection_hint_el.style.left = '-10000px';
	//document.body.classList.remove('doc-has-selection');
	//document.body.classList.remove('doc-has-long-selection');
	//document.body.classList.remove('working-on-doc-selection');
}



// Prepare summarization dialog
function prepare_summarize(){
	//console.log("in prepare_summarize. window.doc_selected_text: ",  window.doc_selected_text);
	
	window.switch_assistant('any_writer',true);
	
	rewrite_dialog_selected_text_el.textContent = window.doc_selected_text;
	
	if(summarize_prompt_el.value == ''){
		window.summarize_prompt_el.value = get_translation('Summarize_the_following_text');
	}
	
	//generate_summarize_tags();
	
	if(window.innerWidth < 981 && !document.body.classList.contains('sidebar-shrink')){
		if(typeof close_sidebar == 'function'){
			close_sidebar();
		}
	}
	
	proofread_details_el.removeAttribute('open');
	rewrite_details_el.removeAttribute('open');
	translation_details_el.removeAttribute('open');
	summarize_details_el.setAttribute('open',true);
	
	model_info_container_el.innerHTML = '';
	
	document.body.classList.add('show-rewrite');
	//rewrite_dialog_el.showModal();
	
	
	if(typeof window.doc_selected_text == 'string' && window.doc_selected_text.length > 2 && typeof window.doc_selection != 'undefined' && window.doc_selection != null){
		highlight_selection(window.doc_selection);
	}
	
}

function prepare_summarize_document(){
	console.log("in prepare_summarize_document. window.doc_text: ",  window.doc_text);
	//rewrite_prompt_el.value = '';
	
	window.switch_assistant('any_small_writer',true);
	
	rewrite_dialog_selected_text_el.textContent = '';
	model_info_container_el.innerHTML = '';
	
	translation_details_el.removeAttribute('open');
	rewrite_details_el.removeAttribute('open');
	summarize_details_el.setAttribute('open',true);
	
	if(rewrite_prompt_el.value == ''){
		window.summarize_prompt_el.value = get_translation('Summarize_the_following_text');
	}
	
	if(rewrite_prompt_el.value.length < 150 && current_file_name.endsWith('.notes') && window.settings.assistant == 'scribe'){
		window.summarize_prompt_el.value = get_translation('Summarize_the_following_meeting');
	}
	
	
	if(window.innerWidth < 981 && !document.body.classList.contains('sidebar-shrink')){
		if(typeof close_sidebar == 'function'){
			close_sidebar();
		}
	}
	
	document.body.classList.add('show-rewrite');
	document.body.classList.add('prepare-summarize-document');
	document.body.classList.remove('prepare-translate-document');
	document.body.classList.remove('chat-shrink');
	
	
	
	let extension = '.txt';
	let extensionless_filename = current_file_name;
	if(typeof current_file_name == 'string'){ 
		
		if(current_file_name.lastIndexOf('.') != -1 && current_file_name.length > 6 && (current_file_name.lastIndexOf('.') > current_file_name.length - 5 || current_file_name.endsWith('.notes') || current_file_name.endsWith('.blueprint'))){
			// strip extension and glue it back on later
			extensionless_filename = remove_file_extension(current_file_name);
		}
	}
	else{
		extensionless_filename = 'unnamed';
	}
	
	summarize_new_file_name_input_el.value = extensionless_filename;
	
	
	let initial_summarize_filename = extensionless_filename + ' ' + get_translation("Summary").toLowerCase() + extension;
	summarize_new_file_name_input_el.value = initial_summarize_filename;
	
	
	remove_highlight_selection();
	
	if(window.settings.auto_detect_input_language && typeof window.doc_text == 'string' && window.doc_text.length > 5){
		//console.log("prepate_summarize_document:  will attempt to auto-detect language of document");
		
		console.log("prepare_summarize_document: doc_text stripped of timestamps: ", window.strip_timestamps(window.doc_text));
		
		
		detect_language( strip_timestamps(window.doc_text));
	}
	
}
window.prepare_summarize_document = prepare_summarize_document;





// Prepare translation dialog
function prepare_translation(){
	//console.log("in prepare_translation. window.doc_selected_text: ",  window.doc_selected_text);
	
	window.switch_assistant('any_writer',true);
	
	model_info_container_el.innerHTML = '';
	rewrite_prompt_el.value = '';
	if(typeof window.doc_selected_text == 'string'){
		rewrite_dialog_selected_text_el.textContent = window.doc_selected_text;
	}
	else if(typeof window.doc_text == 'string'){
		console.warn("prepare_translation: falling back to placing entire document in rewrite_dialog_selected_text_el");
		rewrite_dialog_selected_text_el.textContent = window.doc_text;
	}
	else{
		console.error("prepare_translation: which text? No open document?");
	}
	
	generate_rewrite_tags('rewrite');
	generate_rewrite_tags('summarize');
	
	proofread_details_el.removeAttribute('open');
	summarize_details_el.removeAttribute('open');
	rewrite_details_el.removeAttribute('open');
	translation_details_el.setAttribute('open',true);
	
	if(window.innerWidth < 981 && !document.body.classList.contains('sidebar-shrink')){
		if(typeof close_sidebar == 'function'){
			close_sidebar();
		}
	}
	
	document.body.classList.add('show-rewrite');
	document.body.classList.remove('chat-shrink');
	//rewrite_dialog_el.showModal();
	
	
	
	if(typeof window.doc_selected_text == 'string' && window.doc_selected_text.length > 2 && typeof window.doc_selection != 'undefined' && window.doc_selection != null){
		highlight_selection(window.doc_selection);
	}
	
	if(window.settings.auto_detect_input_language && typeof window.doc_text == 'string'){
		const detected_language = detect_language(window.doc_text);
		if(typeof detected_language == 'string'){
			update_translation_input_select(detected_language);
		}
	}
	
}

function prepare_translate_document(){
	console.log("in prepare_translate_document. window.doc_text: ",  window.doc_text);
	rewrite_prompt_el.value = '';
	rewrite_dialog_selected_text_el.textContent = '';
	model_info_container_el.innerHTML = '';
	
	proofread_details_el.removeAttribute('open');
	summarize_details_el.removeAttribute('open');
	rewrite_details_el.removeAttribute('open');
	translation_details_el.setAttribute('open',true);
	
	
	if(window.innerWidth < 981 && !document.body.classList.contains('sidebar-shrink')){
		if(typeof close_sidebar == 'function'){
			close_sidebar();
		}
	}
	
	document.body.classList.add('show-rewrite');
	document.body.classList.add('prepare-translate-document');
	document.body.classList.remove('prepare-summarize-document');
	document.body.classList.remove('chat-shrink');
	document.body.classList.remove('fairytale');
	if(typeof current_file_name == 'string'){
		translation_new_file_name_input_el.value = current_file_name;
	}
	
	
	let extension = '.txt';
	let extensionless_filename = current_file_name;
	if(typeof current_file_name == 'string'){ 
		
		if(current_file_name.lastIndexOf('.') != -1 && current_file_name.length > 6 && (current_file_name.lastIndexOf('.') > current_file_name.length - 5 || current_file_name.endsWith('.notes') || current_file_name.endsWith('.blueprint'))){
			// strip extension and glue it back on later
			extension = current_file_name.substr(current_file_name.lastIndexOf('.'));
			extensionless_filename = current_file_name.replace(/\.[^/.]+$/, "");
		}
	}
	else{
		extensionless_filename = 'unnamed';
	}
	
	let possible_old_lang_and_date = '-' + window.settings.input_language.toUpperCase() + '-';
	if(extensionless_filename.indexOf(possible_old_lang_and_date) != -1 && extensionless_filename.indexOf(':') != -1){
		//console.log("removing old language section from filename")
		extensionless_filename = extensionless_filename.substr(0,extensionless_filename.indexOf(possible_old_lang_and_date));
	}
	
	let lang = window.settings.output_language;
	if(lang == null){
		lang = translation_output_language_select_el.value;
	}
	if(typeof lang != 'string'){
		lang = '';
	}else{
		lang = '-' + lang.toUpperCase();
	}
	
	let initial_translation_filename = extensionless_filename + lang + '-' + make_date_string() + extension;
	translation_new_file_name_input_el.value = initial_translation_filename;
	
	
	remove_highlight_selection();
	
	if(window.settings.auto_detect_input_language && typeof window.doc_text == 'string'){
		const detected_language = detect_language(window.doc_text);
		if(typeof detected_language == 'string'){
			update_translation_input_select(detected_language);
		}
	}
	else{
		//console.log("prepare_translate_document: not auto-detecting language.   auto_detect, typeof window.doc_text: ", window.settings.auto_detect_input_language, window.doc_text);
	}
	
	window.switch_assistant('any_writer',true);
	
}
window.prepare_translate_document = prepare_translate_document;







//
//  G#T LANGUAGE FROM TEXT  /  GET OPTIMAL ASSISTANT FROM TEXT LANGUAGE
//


async function pick_optimal_ai_from_text_language(source_text=null,detected_language=null){
	console.log("in pick_optimal_ai_from_text_language.  source_text,detected_language:",source_text,detected_language);
	if(typeof source_text != 'string' && typeof detected_language != 'string'){
		console.error("pick_optimal_ai_from_text_language:  no valid source text (or detected language) provided.  typeof source_text, typeof detected_language: ", typeof source_text, typeof detected_language);
		return window.settings.assistant;
	}
	let assistant_id = window.settings.assistant;
	
	if(source_text.length > 30){
		if(detected_language == null || (typeof detected_language == 'string' && detected_language.length == '')){
			detected_language = window.settings.language;
			detected_language = await detect_language_of_text(source_text);
		}
		
		//console.log("pick_optimal_ai_from_text_language: detected language of text: ", detected_language);
		
		let languages_the_assistant_supports = ['en'];
		
		if(typeof assistant_id == 'string' && typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].languages != 'undefined'){
			languages_the_assistant_supports = window.assistants[assistant_id].languages;
		}
		else if(typeof assistant_id == 'string' && typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].languages != 'undefined'){
			languages_the_assistant_supports = window.settings.assistants[assistant_id].languages;
		}
		
		if(typeof detected_language == 'string'){
			
			if(languages_the_assistant_supports.indexOf(detected_language) == -1){
				//let assistant_that_speaks_the_language = pick_optimal_text_ai(detected_language);
				assistant_id = pick_optimal_text_ai(detected_language);
				//console.log("pick_optimal_ai_from_text_language:  detected_language, assistant_id (that hopefully speaks the language): ", detected_language, assistant_id);
				//window.switch_assistant(assistant_that_speaks_the_language,true);
			}
			else{
				//console.log("pick_optimal_ai_from_text_language:  Nice, the current assistant already speaks the detected_language: ", detected_language);
			}
				
		}
		else{
			//console.log("pick_optimal_ai_from_text_language: : invalid detected language,");
			//window.switch_assistant('any_writer',true);
		}
	}
	else{
		//console.log("pick_optimal_ai_from_text_language: text is too short to detect language. Falling back to 'any_writer'");
		//window.switch_assistant('any_writer',true);
	}
	//console.log("pick_optimal_ai_from_text_language: found one?: ", assistant_id);
	if(assistant_id == null){
		return window.settings.last_loaded_text_ai; // pick_optimal_text_ai();
	}
	
	return assistant_id
}
window.pick_optimal_ai_from_text_language = pick_optimal_ai_from_text_language;



async function detect_language_of_text(source_text){
	//console.log("in detect_language_of_text. source_text: ", source_text);
	
	if(typeof source_text == 'string' && source_text.length > 20){
	
		try{
			let value = await add_script('./js/eld.M60.min.js');
	
			//console.log("loaded language detection script? value: ", value);
			//console.log("language detection script: eld.info: ", eld.info() );
			if(typeof eld == 'undefined'){
				console.error("detect_language_of_text:  delaying in the hopes that eld will become available");
				await delay(500);
			}
			if(typeof eld == 'undefined'){
				language_detection_result = eld.detect(source_text);
				//console.log("detect_language_of_text: language_detection_result: ", language_detection_result, source_text);

				if(typeof language_detection_result.language == 'string' && language_detection_result.isReliable()){
					detected_language = language_detection_result.language;
					return language_detection_result.language;
				}
				else{
					console.warn("detect_language_of_text: result was unreliable, returning window.settings.language instead");
					return window.settings.language;
				}
			}
			else{
				console.error("detect_language_of_text: eld was still undefined, even after a delay");
				return window.settings.language;
			}
		}
		catch (err) {
			console.error("detect_language_of_text: Caught general error in detecting language, returning window.settings.language.  Error was: ", err);
			return window.settings.language;
		}
	}
}




// This only gets the information without setting anything
async function get_optimal_assistant_for_text(source_text=null,rewrite_type=null){
	set_optimal_assistant_for_text(source_text,rewrite_type,false);
}


async function set_optimal_assistant_for_text(source_text=null,rewrite_type=null,set_it=true){
	//console.log("in set_optimal_assistant_for_text.  source_text,rewrite_type: ", source_text, rewrite_type);
	let optimal_assistant = null;
	let detected_language = null;
	let optimal_prompt = null;
	let prompt_similarity_score = null;
	//let source_text = null;
	if(typeof source_text != 'string'){
		if(rewrite_dialog_selected_text_el.textContent.length > 30){
			source_text = rewrite_dialog_selected_text_el.textContent;
		}
		else if(typeof window.doc_selected_text == 'string' && window.doc_selected_text.length > 30){
			source_text = window.doc_selected_text;
		}
	}
	
	if(typeof source_text == 'string' && source_text.length > 30){
		detected_language = window.settings.language;
		if(window.settings.assistant == 'translator' || (document.body.classList.contains('show-rewrite') && translation_details_el.open == true)){
			//console.log("set_optimal_assistant_for_text:  using language set in translation rewrite details element");
			detected_language = translation_input_language_select_el.value;
		}
		else{
			
			detected_language = await detect_language_of_text(source_text);
			//console.log("set_optimal_assistant_for_text: called detect_language_of_text.  detected_language: ", detected_language);
			//optimal_assistant = pick_optimal_ai_from_text_language(null,detected_language);
		}
		optimal_assistant = await pick_optimal_ai_from_text_language(rewrite_dialog_selected_text_el.textContent,detected_language);
		//console.log("set_optimal_assistant_for_text: optimal assistant: ", optimal_assistant);
		
		if(typeof optimal_assistant == 'string'){
			if(optimal_assistant != window.settings.assistant && set_it == true){
				//console.log("set_optimal_assistant_for_text: switching to optimal assistant: ", optimal_assistant);
				flash_message(get_translation('Switching_to_AI_that_speaks_the_language'),2000);
				switch_assistant(optimal_assistant,true);
			}
			
			if(typeof rewrite_type == 'string'){
				//console.log("set_optimal_assistant_for_text: rewrite_type is string: ", rewrite_type);
				if(rewrite_type == 'proofread'){
					
					//console.log("set_optimal_assistant_for_text: setting proofread prompt for the detected language: ", detected_language);
					const optimal_default_prompt = get_translation("Fix_typos_spelling_and_grammar_errors_in_the_following_text", detected_language);
					prompt_similarity_score = similarity(optimal_default_prompt,window.settings.proofread_prompt);
					console.log("proofread prompt_similarity_score, when compared to the optimal prompt in the detected language: ", prompt_similarity_score, optimal_default_prompt,window.settings.proofread_prompt);
					if(prompt_similarity_score < .7 || window.settings.proofread_prompt.length < 10){
						if(set_it){
							window.settings.proofread_prompt = optimal_default_prompt;
							//console.log("set_optimal_assistant_for_text: translated proofread_prompt: " + window.settings.proofread_prompt);
							window.proofread_prompt_el.value = window.settings.proofread_prompt;
							if(detected_language == window.settings.language){
								save_settings();
							}
						}
						optimal_prompt = optimal_default_prompt;
					}
					else{
						optimal_prompt = window.settings.proofread_prompt;
					}
				}
			}
			else{
				//console.log("set_optimal_assistant_for_text: rewrite_type is not a string: ", rewrite_type);
			}
		}
		else{
			//console.log("set_optimal_assistant_for_text: optimal assistant is already selected: ", optimal_assistant);
		}
	}
	return {'detected_language':detected_language,'assistant':optimal_assistant,'prompt':optimal_prompt,'prompt_similarity_score':prompt_similarity_score}
}




async function prepare_proofread(source_text=null){
	//console.log("in prepare_proofread. window.doc_selected_text: \n", rewrite_dialog_selected_text_el.value, window.doc_selected_text);
	
	model_info_container_el.innerHTML = '';


	generate_rewrite_tags('rewrite');
	generate_rewrite_tags('summarize');
	
	summarize_details_el.removeAttribute('open');
	rewrite_details_el.removeAttribute('open');
	translation_details_el.removeAttribute('open');
	proofread_details_el.setAttribute('open','true');
	
	tools_submit_form_container_el.scrollIntoView();
	
	if(window.innerWidth < 981 && !document.body.classList.contains('sidebar-shrink')){
		if(typeof close_sidebar == 'function'){
			close_sidebar();
		}
	}
	
	document.body.classList.add('show-rewrite');
	document.body.classList.remove('sidebar');
	document.body.classList.remove('chat-shrink');
	document.body.classList.remove('fairytale');
	//rewrite_dialog_el.showModal();
	
	let detected_language = null;
	if(window.settings.auto_detect_proofread_input_language){
		const optimal_details = await set_optimal_assistant_for_text(source_text,'proofread');
		//console.log("prepare_proofread: set_optimal_assistant_for_text returned detected_language: ", detected_language);
		if(typeof optimal_details.detected_language == 'string'){
			detected_language = optimal_details.detected_language;
			proofread_auto_detected_language_el.textContent = get_translation(detected_language);
			
			if(window.settings.auto_detect_input_language){
				update_translation_input_select(detected_language);
			}
		}
		
		
	}
	
	
	if(typeof window.settings.proofread_prompt != 'string' || (typeof window.settings.proofread_prompt == 'string' && window.settings.proofread_prompt.length < 5)){
		//console.log("prepare_proofread: restoring initial example prompt"); 
		if(window.settings.auto_detect_proofread_input_language && detected_language != null){
			window.settings.proofread_prompt = get_translation("Fix_typos_spelling_and_grammar_errors_in_the_following_text", detected_language);
		}
		else{
			window.settings.proofread_prompt = get_translation("Fix_typos_spelling_and_grammar_errors_in_the_following_text");
		}
		
	}
	if(typeof window.settings.proofread_prompt == 'string'){
		window.proofread_prompt_el.value = window.settings.proofread_prompt;
	}
	
	if(typeof window.doc_selected_text == 'string' && window.doc_selected_text.length > 2 && typeof window.doc_selection != 'undefined' && window.doc_selection != null){
		highlight_selection(window.doc_selection);
	}

	//proofread_selection();
}


// Does not use task at all
async function proofread_selection(task=null,text_to_proofread=null,feeling_lucky=false){
	//console.log("in proofread_selection.  task,text_to_proofread: ", task, text_to_proofread);
	//console.log("proofread_selection: window.settings.language: ", window.settings.language);
	
	//console.log("proofread_selection: window.doc_selected_text: ", window.doc_selected_text);
	//console.log("proofread_selection: window.doc_text: ", window.doc_text, window.doc_text.length);
	
	let detected_language = null;
	
	
	if(typeof text_to_proofread != 'string'){
		if(rewrite_dialog_selected_text_el.textContent.length > 5){
			console.warn("proofread_selection: falling back to rewrite_dialog_selected_text_el.textContent: ", rewrite_dialog_selected_text_el.textContent);
			text_to_proofread = rewrite_dialog_selected_text_el.textContent;
		}
		else if(typeof window.doc_selected_text == 'string' && window.doc_selected_text.length > 5){
			//console.log("proofread_selection: using window.doc_selected_text: ", window.doc_selected_text);
			text_to_proofread = window.doc_selected_text;
		}
		else if(typeof window.doc_text == 'string' && window.doc_text.length > 5){
			//console.log("proofread_selection: using window.doc_text: ", window.doc_text);
			text_to_proofread = window.doc_text;
		}
		else{
			console.warn("proofread_selection: no text_to_proofread provided, and no doc_selected_text or doc_text?");
		}
	}
	
	
	
	
	if(typeof text_to_proofread == 'string' && text_to_proofread.length > 5){
		
		document.body.classList.add('doing-proofread');
		if(text_to_proofread.length < 1000){
			rewrite_selection("proofread",text_to_proofread,1,null,null,feeling_lucky);
		}
		else{
			//console.log("proofread_selection:splitting long text into paragraphs:", text_to_proofread.length);
			
			// TODO add a parent task if there are many proofread tasks, and join the results into one UI element
			
			let paragraphs = split_into_paragraphs(text_to_proofread,1200);
			//console.log("a very long text to proofread. Breaking it up into paragraphs (and separate tasks): ", paragraphs.length, paragraphs);
			for(let p = 0; p < paragraphs.length; p++){
				setTimeout(() => {
					rewrite_selection("proofread",paragraphs[p],1,null,null,feeling_lucky);
				},1 * p);
				
			}
		}
		return true
		
	}
	else{
		console.error("proofread_selection: no text to proofread: ", typeof text_to_proofread, text_to_proofread);
		flash_message(get_translation("Not_enough_text"),2000,'warn');
		return false
	}
	
}






window.already_proofread = {};




function handle_proofread_result(task,fixed_text=null,finalize=true){
	console.log("in handle_proofread_result. task: ", task);
	
	if(typeof task != 'undefined' && task != null){
		
		add_script('./pjs/diff.js')
		.then((value) => {
		
			if(typeof JsDiff == 'undefined'){
				console.error("really_differ: aborting, JsDiff library has not loaded (yet)?");
				return
			}
			
			if(finalize && typeof task.index == 'number'){
				let snippet_el = document.getElementById('rewrite-results-snippet' + task.index);
				if(snippet_el){
					snippet_el.remove();
				}
			}
			
			//if(typeof task.index != 'undefined')
			//task['test'] = "TEST TEST";
			
			
			if(typeof task.text == 'string' && task.text.length > 5 && ((typeof task.results != 'undefined' && Array.isArray(task.results) && task.results.length && typeof task.results[task.results.length-1] == 'string' && task.results[task.results.length-1].length > 5) || (typeof fixed_text == 'string' && fixed_text.length > 4)) ){
				
			    let differ_list = [];
				let differ_dict = {};
				let color = '';
				
				
				let modifications = [];
				
				let original_text = task.text;
				if(typeof fixed_text != 'string' && typeof task.results != 'undefined' && task.results.length){
					fixed_text = task.results[task.results.length-1];
				}
				
				if(typeof fixed_text != 'string'){
					console.error("handle_proofread_result: no fixed_text to compare the original text to");
					return
				}
				if(fixed_text.length < 20){
					console.error("handle_proofread_result: fixed_text was too short to compare");
					return
				}
				
				
				// Sometimes an LLM might add '--- ' at the beginning
				if(fixed_text.startsWith('---') && !original_text.startsWith('---')){
					//console.log("handle_proofread_result: removing --- from beginning of fixed text: ", fixed_text.substr(0,10) + ".. ");
					fixed_text = fixed_text.substr(3);
				}
				
				// Sometimes an LLM might add an extra space at the beginning
				if(fixed_text.startsWith(' ') && !original_text.startsWith(' ')){
					//console.log("handle_proofread_result: removing space from beginning of fixed text: ", fixed_text.substr(0,10) + ".. ");
					fixed_text = fixed_text.substr(1);
				}
				
				
				if(typeof task.proofread == 'undefined'){
					task.proofread = {'original_cursor':0,'fixed_cursor':0,'modifications':[]};
					//console.log("handle_proofread_result: creating initial task.proofread");
					creations_el = document.querySelector('#rewrite-result' + task.index + ' #rewrite-result-creations' + task.index);
					if(creations_el){
						creations_el.innerHTML = '<div class="rewrite-result-output-snippet" id="rewrite-results-snippet' + task.index + '"><div id="rewrite-results-snippet' + task.index + '-0"></div></div>'; // 
					}
				}
				
				
				
				if(typeof task.proofread != 'undefined' && task.proofread != null && typeof task.proofread.original_cursor == 'number' && typeof task.proofread.fixed_cursor == 'number' && task.proofread.original_cursor > 0){
					original_text = original_text.substr(task.proofread.original_cursor);
					fixed_text = fixed_text.substr(task.proofread.fixed_cursor);
					//console.log("handle_proofread_result: made original and fixed text shorter to avoid huge diff calculations: ", task.proofread.original_cursor, task.proofread.fixed_cursor );
					//console.log("handle_proofread_result: SHORTER original_text: \n", original_text);
					//console.log("\nhandle_proofread_result: SHORTER fixed_text: \n", fixed_text);
				}
				else{
					//console.log("handle_proofread_result: not shortening the text");
				}
				
				
				const diff = JsDiff.diffChars(strip_markdown(original_text), fixed_text);
				
				//console.log("handle_proofread_result:  diff: ", diff);
				/*
				let fragment = document.createDocumentFragment();
				for(let d = 0; d < diff.length; d++){
					
					//console.log("handle_proofread_result:  diff[d]: ", diff[d]);
					
					color = diff[d].added ? 'green' : diff[d].removed ? 'red' : 'grey';
					
					let mod_el = document.createElement('span');
					mod_el.classList.add('diff-' + color);
					
					let sub_mod_el = document.createElement('span');
					sub_mod_el.appendChild(document.createTextNode(diff[d].value));
					mod_el.appendChild(sub_mod_el);
					
					if(color != 'grey'){
						//console.log("differ:  fragment.textContent: ", fragment.textContent.length);
						//console.log("handle_proofread_result: differ:  fragment.textContent: ", fragment.textContent, fragment.textContent.length, '\n' ,diff[d].value, diff[d].value.length);
			
						differ_dict[diff[d].value] = fragment.textContent.split('\n').length;
						differ_list.push({'value':diff[d].value,'anchor':fragment.textContent.length,'head':fragment.textContent.length + diff[d].value.length});
					}
		
					fragment.appendChild(mod_el);
					
				}
				//console.log("handle_proofread_result: fragment: ", fragment);
				*/
				
				let original_cursor = 0;
				let fixed_cursor = 0;
				let text_behind = '';
				let text_ahead = original_text;
				let fixed_text_ahead = fixed_text;
				let previous_safe_text = '';
				
				let modified = '';
				let fixed = '';
				let pre_text = '';
				let mod_delta = 0;
				
				/*
				let original_counter = 0;
				let rewrite_counter = 0;
				let last_words = [];
				let last_word = '';
				for(let ca = 0; ca < task.text.length; ca++){
					let char = task.text.charAt(ca);
					if(char.match(/[a-z0-9]/i)){
						last_word += char;
					}
				}
				*/
				
				
				let diff_length = diff.length;
				//console.log("diff_length before trimming: ", diff_length);
				if(finalize == false && diff.length < 3){
					//console.error("too few diffs, and not finalizing yet. Aborting handle_proofread");
					//return
				}
				if(finalize == false && diff.length > 1){
					for(let fd = diff.length - 1; fd > 0; --fd){
						if(typeof diff[fd].added == 'undefined' && typeof diff[fd].removed == 'undefined' && typeof diff[fd].value == 'string' && diff[fd].value.length > 10 && diff[fd].value.indexOf(' ') != -1){
							diff_length = fd;
							break
						}
					}
				}
				//console.log("diff_length after trimming: ", diff_length);
				if(diff_length < 2){
					console.error("not finalizing yet, and too few diffs after trimming the diffs accordingly. Aborting handle_proofread");
					return
				}
				
				
				for(let d = 0; d < diff_length; d++){
					if( (typeof diff[d].added == 'undefined' && typeof diff[d].removed == 'undefined' && typeof diff[d].value == 'string' && diff[d].value.length > 1 && diff[d].value.indexOf(' ') != -1) || d == diff.length - 1){ //  && diff[d].count > 10
						if(d == diff.length - 1){
							//console.log("handle_proofread_result: reached END of the proofread");
						}
						else{
							//console.log("handle_proofread_result: reached a safe spot in the proofread");
						}
						
						
						let dodgy_mod = false;
						
						let new_mod = {
							'pre_text':pre_text,
							'before':modified,
							'after':fixed,
							'selection':{'from':original_cursor,'to':original_cursor + 1}, // create selection to highlight issues in the original text
							'mod_delta':mod_delta, // was more added or removed?
							'post_text':'',
						}
						
						const safe_spot_index = text_ahead.indexOf(diff[d].value);
						const fixed_safe_spot_index = fixed_text_ahead.indexOf(diff[d].value);
						
						if(safe_spot_index != -1 && fixed_safe_spot_index != -1){
							
							new_mod['selection']['to'] = original_cursor + safe_spot_index;
							
							new_mod['after'] += fixed_text.substr(fixed_cursor,fixed_safe_spot_index);
							
							
							
							
							console.warn("handle_proofread_result: modified.length =?= selection length?    ", modified.length, " =?= ", safe_spot_index - new_mod['selection']['from']);
							
							original_cursor = original_cursor + safe_spot_index + diff[d].value.length;
							text_ahead = original_text.substr(original_cursor);
							//text_behind = previous_safe_text;//original_text.substr(0,original_cursor);
							text_behind = diff[d].value;
							if(d == 0){
								text_behind = original_text.substr(0,original_cursor);
							}
							
							fixed_cursor = fixed_cursor + fixed_safe_spot_index + diff[d].value.length;
							fixed_text_ahead = fixed_text.substr(fixed_cursor);
							//console.log("handle_proofread_result: post_text: diff[d].value: ", diff[d].value);
							
							if(typeof text_ahead[0] != 'undefined' && typeof fixed_text_ahead[0] != 'undefined'){
								//console.log("handle_proofread_result: comparing text_ahead: ", text_ahead[0], fixed_text_ahead[0]);
								if(text_ahead[0] != fixed_text_ahead[0]){
									console.warn("handle_proofread_result: is it going off the rails?", text_ahead.substr(0,10), fixed_text_ahead.substr(0,10));
									
									if(typeof text_ahead[1] != 'undefined' && typeof fixed_text_ahead[1] != 'undefined'){
										//console.log("handle_proofread_result: comparing text_ahead again: ", text_ahead[1], fixed_text_ahead[1]);
										if(text_ahead[1] != fixed_text_ahead[1]){
											console.warn("handle_proofread_result: the post_text is definitely out of sync: ", text_ahead.substr(0,10), fixed_text_ahead.substr(0,10));
									
											dodgy_mod = true;
									
										}
									}
									
								}
							}
							
							
							let post_text = '';
							if(diff[d].value.length < 11){
								post_text = diff[d].value;
							}
							else if(diff[d].value.length){
								for(let pt = 0; pt < diff[d].value.length; pt++){
									let char = diff[d].value.charAt(pt);
									//console.log("handle_proofread_result: post_text char: ", char);
									if(pt > 10){
										if(char == ' '){
											break
										}
									}
									if(pt > 20){
										//post_text += '..';
										break
									}
									post_text += char;
								}
							}
							else{
								console.error("handle_proofread_result: diff[d].value had no length?");
							}
							//console.log("handle_proofread_result: post_text: ", post_text);
							
							new_mod['post_text'] = post_text;
							
							//console.log("handle_proofread_result: original_cursor is now: ", original_cursor);
							//console.log("handle_proofread_result: text_behind is now: ", text_behind);
							//console.log("handle_proofread_result: text_ahead is now: ", text_ahead);
							//console.log("handle_proofread_result: fixed_text_ahead is now: ", fixed_text_ahead);
							//console.log("handle_proofread_result: NEW MOD: ", new_mod);
							
							// ADD NEW MOD
							
							let already_added = false;
							for(let aa = 0; aa < task.proofread.modifications.length; aa++){
								if(task.proofread.modifications[aa].pre_text == new_mod.pre_text && task.proofread.modifications[aa].before == new_mod.before && task.proofread.modifications[aa].after == new_mod.after){
									already_added = true;
									break
								}
							}
							
							if(!already_added){
								
								
								if(new_mod.before.length > 10 && new_mod.after.length > 0){
									if(new_mod.after.length > 1 && new_mod.before.length > new_mod.after.length * 10){
										dodgy_mod = true;
									}
									if(new_mod.before.split(' ').length > 5 && new_mod.after.split(' ').length < 2){
										dodgy_mod = true;
									}
									
								}
								if(new_mod.after.length > 10 && new_mod.before.length > 0){
									if(new_mod.before.length > 1 && new_mod.after.length > new_mod.before.length * 10){
										dodgy_mod = true;
									}
									
									if(new_mod.after.split(' ').length > 5 && new_mod.before.split(' ').length < 2){
										dodgy_mod = true;
									}
									
								}
								
								if(dodgy_mod == false){
									task.proofread.modifications.push(new_mod);
									modifications.push(new_mod);
								}
								else{
									console.error("proofread new_mod was dodgy: ", new_mod);
									if(window.settings.settings_complexity == 'developer'){
										flash_message(get_translation("The_proofread_AI_is_misbehaving"),3000,'warn');
									}
									
								}
								
							}
							else{
								console.error("handle_proofread_result: attempted to add a modification that was already in the list: ", new_mod);
							}
							
							
							// Reset variables for next round
							//previous_safe_text = diff[d].value;
							
							modified = '';
							fixed = '';
							pre_text = '';
							
							// Get some text from before the modified section, to give it some context
							if(text_behind.length < 10){
								//modified = text_behind;
								//fixed = text_behind;
								pre_text = text_behind;
							}
							else if(text_behind.length ){ // && text_behind.lastIndexOf(' ') > 1
								
								for(let ca = text_behind.length - 1; ca >= 0; --ca){
									let char = text_behind.charAt(ca);
									
									if(ca < text_behind.length - 10){
										if(char == ' '){
											break
										}
									}
									if(ca < text_behind.length - 15){
										pre_text = '' + pre_text;
										break
									}
									
									pre_text = char + pre_text;
									
									/*
									if(char.match(/[a-z0-9]/i)){
										last_word += char;
									}
									*/
								}
								//fixed = modified; // set the same prefix for the fix
								/*
								let behind_words = text_behind.split(' ');
								modified = behind_words[behind_words.length-1];
								if(modified.length < 10 && behind_words.length > 1){
									modified = behind_words[behind_words.length-2] + ' ' + modified;
								}
								if(text_behind.endsWith(' ')){
									modified += ' ';
								}
								*/
							}
							//console.log("handle_proofread_result: initial pre_text: ", diff[d].value, " -> ", pre_text);
							
						}
					}
					else{
						if(diff[d].added || diff[d].remove){
							if(diff[d].added){
								mod_delta += diff[d].count;
								//modified += diff[d].value;
								//console.log("handle_proofread_result: added to modified: ", diff[d].value, " -> ", modified);
							}
							if(diff[d].removed){ // let markdown survive
								/*
								if(diff[d].value == '*' || diff[d].value == '_'){
									modified += diff[d].value;
									//console.log("handle_proofread_result: left markdown in modified: ", diff[d].value, " -> ", modified);
								}
								else{
									mod_delta -= diff[d].count;
								}
								*/
								mod_delta -= diff[d].count;
							}
							//console.log("handle_proofread_result: new mod_delta: ", mod_delta);
						}
						else{
							modified += diff[d].value;
							//console.log("handle_proofread_result: added a short non-modified string to modified: ", diff[d].value, " -> ", modified);
						}
						
					}
				}
				
				let proofread_rewrite_result_el = document.getElementById('rewrite-result' + task.index);
				if(proofread_rewrite_result_el){
					
					//let modifications = task.proofread.modifications;
					
					if(finalize){
						//modifications = task.proofread.modifications;
						proofread_rewrite_result_el.classList.add('completed'); // or .rewrite-result-complete
						proofread_rewrite_result_el.classList.remove('in-progress');
					}
					
					if(modifications.length){
						proofread_rewrite_result_el.setAttribute('open',true);
						
						creations_el = proofread_rewrite_result_el.querySelector('#rewrite-result-creations' + task.index);
						if(creations_el){
							//creations_el.innerHTML = '';
						
							for(let mo = 0; mo < modifications.length; mo++){
							
								let my_mod = modifications[mo];
							
								//const my_mo = mo;
								if(modifications[mo].before == '' && modifications[mo].after == ''){
									console.error("handle_proofread_result: skipping a mod where before and after are empty strings");
									continue;
								}
								
								if(modifications[mo].pre_text == '' && modifications[mo].pre_text == ''){
									console.error("handle_proofread_result: skipping a mod where pre_text and post_text are empty strings");
									continue;
								}
								
								
								if(modifications[mo].after.length > modifications[mo].before.length + 15){
									console.error("handle_proofread_result: skipping an oddly long proofread fix");
									continue;
								}
								
							
								// Highlight the issue in the original text
							
								/*
								editor.dispatch({
									effects: highlight_effect.of([highlight_decoration.range(cursor.value.from, cursor.value.to)])
								});
								*/
							
							
								let mod_item_el = document.createElement('div');
								mod_item_el.classList.add('proofread-item');
								mod_item_el.classList.add('flex-between');
								
								let sentences_el = document.createElement('div');
								sentences_el.classList.add('proofread-sentences-duo');
								sentences_el.classList.add('flex-vertical');
							
								
							
								const proofread_types = ['before','after'];
								for(let pt = 0; pt < proofread_types.length; pt++){
								
									let sentence_el = document.createElement('div');
									sentence_el.classList.add('proofread-sentence');
									sentence_el.classList.add('proofread-sentence-' + proofread_types[pt]);
								
									const chunks = ['pre_text','mid','post_text'];
									for(let ch = 0; ch < chunks.length; ch++){
									
										let chunk_el = document.createElement('span');
										chunk_el.classList.add('proofread-item-chunk');
										chunk_el.classList.add('proofread-item-chunk-' + chunks[ch]);
									
										if(chunks[ch].endsWith('text')){
											chunk_el.textContent = modifications[mo][chunks[ch]];
										}
										else{
											
											if(modifications[mo][proofread_types[pt]].trim() == ''){
												chunk_el.classList.add('proofread-space');
											}
											
											let text_to_show = '' + modifications[mo][proofread_types[pt]];
											
											if(text_to_show == ' '){
												chunk_el.innerHTML = '&nbsp;';
											}
											else{
												chunk_el.innerHTML = modifications[mo][proofread_types[pt]].replaceAll('  ',' &nbsp;');
											}
											/*
											let before_html = new_mod['before'];
											let after_html = new_mod['after'];
											new_mod['before'] = new_mod['before'].replaceAll(' ','&nbsp;');
											new_mod['after'] = new_mod['after'].replaceAll(' ','&nbsp;');
											*/
											
												
											
											//chunk_el.innerHTML = modifications[mo][proofread_types[pt]].replaceAll('  ',' &nbsp;');
										}
										sentence_el.appendChild(chunk_el);
									}
									sentences_el.appendChild(sentence_el);
								}
								
								mod_item_el.appendChild(sentences_el);
								
								sentences_el.addEventListener('click',() => {
									let pre_sentence = my_mod.pre_text + my_mod.before + my_mod.post_text;
									let pre_sentence_cursor = search_in_doc(task, pre_sentence,true); // true = must be unique
									if(pre_sentence_cursor){
										scroll_to_selection(pre_sentence_cursor);
									}
									
								});
								
								
								if(typeof task.feeling_lucky == 'boolean' && task.feeling_lucky == true){
									if(typeof modifications[mo]['state'] == 'undefined'){
										my_mod['state'] = 'accepted';
										search_and_replace(
											task, 
											my_mod.pre_text + my_mod.before + my_mod.post_text,
											my_mod.pre_text + my_mod.after + my_mod.post_text
											//modifications[mo].before + modifications[mo].post_text,
											//modifications[mo].after + modifications[mo].post_text
										)
									}
									else{
										console.error("handle_proofread_result: feeling_lucky: modification already had a state (was already applied)");
									}
								}
								else{
									let buttons_container_el = document.createElement('div');
									buttons_container_el.classList.add('proofread-item-buttons-container');
									buttons_container_el.classList.add('center');
								
									const button_types = ['reject','accept'];
									for(let bt = 0; bt < button_types.length; bt++){
								
										let button_container_el = document.createElement('div');
										button_container_el.classList.add('center');
										button_container_el.classList.add('proofread-item-button-container');
										button_container_el.classList.add('proofread-item-' + button_types[bt] + '-button-container');
									
										let button_el = document.createElement('div');
										button_el.classList.add('proofread-item-button');
										button_el.classList.add('proofread-item-' + button_types[bt] + '-button');
										if(button_types[bt] == 'reject'){
											button_el.textContent = '👎'; // ×
											button_el.addEventListener('click', () => {
												my_mod['state'] = 'rejected';
												mod_item_el.remove();
												
												if(!proofread_rewrite_result_el.querySelector('.proofread-item')){
													remove_highlight_selection();
													proofread_rewrite_result_el.remove();
												}
											})
										}
										else if(button_types[bt] == 'accept'){
											button_el.textContent = '👍';
											button_el.addEventListener('click', () => {
												my_mod['state'] = 'accepted';
												
												
												search_and_replace(
													task, 
													my_mod.pre_text + my_mod.before + my_mod.post_text,
													my_mod.pre_text + my_mod.after + my_mod.post_text
													//modifications[mo].before + modifications[mo].post_text,
													//modifications[mo].after + modifications[mo].post_text
												)
												
												// Also update the text in the task, so it doesn't trigger a diff anymore if the user is already accepting modifications while the AI is still processing the text
												if(typeof task.text == 'string'){
													task.text.replace(my_mod.pre_text + my_mod.before + my_mod.post_text, my_mod.pre_text + my_mod.after + my_mod.post_text);
												}
												
												
												mod_item_el.remove();
												
												if(!proofread_rewrite_result_el.querySelector('.proofread-item')){
													remove_highlight_selection();
													proofread_rewrite_result_el.remove();
												}
											})
										}
										button_container_el.appendChild(button_el);
										buttons_container_el.appendChild(button_container_el);
									}
									//sentence_el.classList.add('proofread-sentence-' + proofread_types[pt]);
								
									mod_item_el.appendChild(buttons_container_el)
								}
								
								
								
								creations_el.appendChild(mod_item_el);
							
							}
							
							if(finalize){
								
								
								if(!proofread_rewrite_result_el.querySelector('.proofread-item')){
									remove_highlight_selection();
									proofread_rewrite_result_el.remove();
									if(window.settings.settings_complexity == 'developer'){
										flash_message(get_translation('No_issues_found'),2000);
									}
									return
								}
								
								if(typeof task.feeling_lucky == 'boolean' && task.feeling_lucky == true){
									
									remove_highlight_selection();
									
									setTimeout(() => {
										// give the user a little time to glimpse the last fixes, if there were any
										proofread_rewrite_result_el.remove();
									},5000);
								}
								else{
									let rewrite_footer_el = proofread_rewrite_result_el.querySelector('.rewrite-result-delete-container');
									if(rewrite_footer_el){
										let accept_all_button_container_el = document.createElement('div');
										accept_all_button_container_el.classList.add('proofread-accept-all-button-container');
							
										let accept_all_button_text_el = document.createElement('span');
										accept_all_button_text_el.classList.add('proofread-accept-all-button-text');
										accept_all_button_text_el.textContent = get_translation('Accept_all');
										accept_all_button_text_el.setAttribute('data-i18n','Accept_all');
										accept_all_button_container_el.appendChild(accept_all_button_text_el);
							
										let accept_all_button_el = document.createElement('div');
										//accept_all_button_el.classList.add('proofread-item-button');
										accept_all_button_el.classList.add('proofread-item-accept-button-icon');
										accept_all_button_el.innerText = '👍👍';
										accept_all_button_container_el.appendChild(accept_all_button_el);
							
										accept_all_button_container_el.addEventListener('click', () => {
											//console.log("clicked on accept all proofread changes. task.proofread.modifications: ", task.proofread.modifications);
								
											for(let mo = 0; mo < task.proofread.modifications.length; mo++){
												
												
												if(task.proofread.modifications[mo].before == '' && task.proofread.modifications[mo].after == ''){
													console.error("handle_proofread_result: skipping a mod where before and after are empty strings");
													continue;
												}
												
												if(task.proofread.modifications[mo].pre_text == '' && task.proofread.modifications[mo].pre_text == ''){
													console.error("handle_proofread_result: skipping a mod where pre_text and post_text are empty strings");
													continue;
												}
								
												if(task.proofread.modifications[mo].after.length > task.proofread.modifications[mo].before.length + 15){
													console.error("handle_proofread_result: skipping an oddly long proofread fix");
													continue;
												}
												
												if(typeof task.proofread.modifications[mo].state != 'undefined'){
													console.error("handle_proofread_result: skipping a mod that already has a state: ", task.proofread.modifications[mo].state);
													continue;
												}
												if(typeof task.proofread.modifications[mo].pre_text != 'string' || typeof task.proofread.modifications[mo].post_text != 'string' || typeof task.proofread.modifications[mo].before != 'string' || typeof task.proofread.modifications[mo].after != 'string'){
													console.error("proofread: apply all: missing mod values (pre_text, post_text, before, after): ", task.proofread.modifications[mo]);
													continue;
												}
									
												search_and_replace(
													task, 
													task.proofread.modifications[mo].pre_text + task.proofread.modifications[mo].before + task.proofread.modifications[mo].post_text,
													task.proofread.modifications[mo].pre_text + task.proofread.modifications[mo].after + task.proofread.modifications[mo].post_text
													//task.proofread.modifications[mo].before + task.proofread.modifications[mo].post_text,
													//task.proofread.modifications[mo].after + task.proofread.modifications[mo].post_text
												)
											}
								
											proofread_rewrite_result_el.remove();
											remove_highlight_selection();
										})
							
										rewrite_footer_el.appendChild(accept_all_button_container_el);
										//creations_el.appendChild(footer_container_el);
									}
								}
								
								
							}
							/*
							
							let footer_container_el = document.createElement('div');
							footer_container_el.classList.add('proofread-footer');
							footer_container_el.classList.add('align-right');
							*/
							
							
							
						}
						else{
							console.error("No creations_el?");
						}
						
					}
					else if(finalize){
						remove_highlight_selection();
						proofread_rewrite_result_el.remove();
						flash_message(get_translation('No_issues_found'),2000);
					}
					
				}
				console.error("handle_proofread_result: NEW MODIFICATIONS: ", modifications);
				console.error("handle_proofread_result: ALL MODIFICATIONS: ", task.proofread.modifications);
				
				
			}
		
		})
		.catch((err) => {
			console.error("handle_proofread_result: caught error loading diff.js: ", err);
		})
		
	}
	
}




// Prepare rewrite dialog
function prepare_rewrite(){
	//console.log("in prepare_rewrite. window.doc_selected_text: \n", rewrite_dialog_selected_text_el, window.doc_selected_text);
	
	window.switch_assistant('any_writer',true);
	
	rewrite_prompt_el.value = get_translation('rewrite_the_following_text_to_be_more');
	if( window.doc_selected_text != ''){
		rewrite_dialog_selected_text_el.textContent = window.doc_selected_text;
		highlight_selection(window.doc_selection);
	}
	
	generate_rewrite_tags('rewrite');
	generate_rewrite_tags('summarize');
	
	proofread_details_el.removeAttribute('open');
	summarize_details_el.removeAttribute('open');
	rewrite_details_el.setAttribute('open',true);
	translation_details_el.removeAttribute('open');
	
	model_info_container_el.innerHTML = '';
	
	if(window.innerWidth < 981 && !document.body.classList.contains('sidebar-shrink')){
		if(typeof close_sidebar == 'function'){
			close_sidebar();
		}
	}
	
	document.body.classList.add('show-rewrite');
	document.body.classList.remove('chat-shrink');
	document.body.classList.remove('fairytale');
	//rewrite_dialog_el.showModal();
	
	
	
	if(typeof window.settings.rewrite_prompt == 'string'){
		window.rewrite_prompt_el.value = window.settings.rewrite_prompt;
	}
	
	if(typeof window.doc_selected_text == 'string' && window.doc_selected_text.length > 2 && typeof window.doc_selection != 'undefined' && window.doc_selection != null){
		highlight_selection(window.doc_selection);
	}
	
}



//
//  REWRITE SELECTION
//


// TODO: this function should clearly be fed a (proto-)task instead of having this huge list of parameters
async function rewrite_selection(type=null,source_text,desired_results=1,parent_index=null,prompt_text=null,feeling_lucky=false,assistant_id=null){ // type can be 'rewrite' or 'summarize';
	//console.log("in rewrite_selection. type, Selection text: ", type, window.doc_selected_text);
	
	if(typeof type != 'string'){
		//console.log("rewrite_selection: type was not a string, setting it to 'rewrite'");
		type = 'rewrite';
	}

	
	/*
	if(window.currently_rewriting == false){
		console.error("rewrite_selection: window.currently_rewriting was false. Aborting.");
		return;
	}
	*/
	
	if(typeof feeling_lucky != 'boolean'){
		feeling_lucky = false;
	}

	if(typeof desired_results != 'number'){
		desired_results = 1;
	}

	if(typeof type == 'undefined'){
		type = 'rewrite';
	}

	hide_doc_selection_hint();

	let source_text_origin = 'rewrite';

	if(window.settings.docs.open == null){
		console.error("rewrite_selection: window.settings.docs.open was null. Aborting.");
		//reject(false);
		return false
	}

	if(typeof source_text != 'string' && typeof rewrite_dialog_selected_text_el.textContent == 'string' && rewrite_dialog_selected_text_el.textContent != ''){
		//console.log("rewrite_selection: falling back to value of rewrite_dialog_selected_text_el: ", rewrite_dialog_selected_text_el.textContent);
		source_text = rewrite_dialog_selected_text_el.textContent;
		source_text_origin = 'rewrite_selection';
	}
	
	if(typeof source_text != 'string' && typeof window.doc_selected_text == 'string'){
		//console.log("rewrite_selection: no source_text provided, grabbing window.doc_selected_text");
		source_text = window.doc_selected_text;
		source_text_origin = 'rewrite_selection';
	}
	//console.log("rewrite_selection: rewrite_dialog_selected_text_el.innerHTML: ", rewrite_dialog_selected_text_el.innerHTML);
	//console.log("rewrite_selection: rewrite_dialog_selected_text_el.innerText: ", rewrite_dialog_selected_text_el.innerText);
	//console.log("rewrite_selection: rewrite_dialog_selected_text_el.textContent: ", rewrite_dialog_selected_text_el.textContent);


	

	if(typeof source_text != 'string'){
		//console.log("rewrite_selection: no source_text provided, and window.doc_selected_text was not useable either. Returning false.");
		flash_message(get_translation('Please_select_some_text_first'),3000,'warn');
		//reject(false);
		return false
	}

	if(source_text.length < 3){
		console.error("rewrite_selection: source text too short to do anything: ", source_text);
		//reject(false);
		return false
	}

	if(type=='rewrite' && source_text.length < window.minimum_rewrite_length){
		console.error("rewrite_selection: source text too short to rewrite: ", source_text);
		//reject(false);
		return false
	}

	if(type=='rewrite' && source_text.length < window.minimum_rewrite_length){
		console.error("rewrite_selection: source text too short to rewrite: ", source_text);
		//reject(false);
		return false
	}
	else if(type=='proofread' && source_text.length < window.minimal_proofread_length){
		console.error("rewrite_selection: source text too short to proofread: ", source_text);
		//reject(false);
		return false
	}
	
	// Try to find an AI that speaks the language of the text
	if(assistant_id == null){
		assistant_id = window.settings.assistant;
		if(window.settings.auto_detect_proofread_input_language){
			if(source_text.length > 30){
				const optimal_details = await get_optimal_assistant_for_text(source_text,type);
				//console.log("rewrite_selection: optimal_details: ", JSON.stringify(optimal_details,null,2));
				if(optimal_details){
					if(typeof optimal_details.detected_language == 'string'){
						proofread_auto_detected_language_el.textContent = get_translation(optimal_details.detected_language);
					}
					if(typeof optimal_details.assistant == 'string'){
						assistant_id = optimal_details.assistant;
					}
					if(typeof optimal_details.prompt == 'string'){
						prompt_text = optimal_details.prompt;
					}
				}
			}
		}
	}
	
	
	
	//let prompt_text = null;
	let done = true;

	if(type=='rewrite'){
		if(prompt_text == null){
			prompt_text = rewrite_prompt_el.value;
		}
	}
	if(type=='summarize'){
		prompt_text = summarize_prompt_el.value; //get_translation('Summarize_the_following_text') + ':';
		add_chat_message('current','user',prompt_text,'Summarize_the_following_text','<details><summary class="ellipsis">' + source_text.substr(0,100) + '</summary><div>' + source_text + '</div></details>');
		document.body.classList.remove('show-rewrite');
		if(source_text.indexOf('🕰️ ') != -1){
			source_text = strip_timestamps(source_text);
		}
	}
	else if(type=='proofread'){
		/*
		if(source_text.indexOf('🕰️ ') != -1){
			source_text = strip_timestamps(source_text);
		}
		*/
		
		if(prompt_text == null){
			prompt_text = proofread_prompt_el.value;
		}
		
		prompt_text = prompt_text.trim();
		while(prompt_text.endsWith('\n')){
			prompt_text = prompt_text.substr(0,prompt_text.length-1);
		}
		prompt_text = prompt_text.trim();
		
		if(typeof prompt_text != 'string' || (typeof prompt_text == 'string' && prompt_text.length < 5)){
			prompt_text = get_translation("Fix_typos_spelling_and_grammar_errors_in_the_following_text"); // + "\n\n<TEXT>" + source_text + "</TEXT>"; //summarize_prompt_el.value; //get_translation('Summarize_the_following_text') + ':';
		}
		
		//add_chat_message('current','user',prompt_text,'Summarize_the_following_text','<details><summary class="ellipsis">' + source_text.substr(0,100) + '</summary><div>' + source_text + '</div></details>');
	}
	
	//console.log("rewrite_selection: prompt_text from rewrite_prompt_el: ", prompt_text);

	if(type == 'rewrite' && prompt_text == get_translation('rewrite_the_following_text_to_be_more')){ // this check is also performed by the submit button -> submit_rewrite_task
		console.error("rewrite_selection: rewrite_prompt was still default prompt");
		return false
	}

	if(prompt_text.trim().length < 5){ // this check is also performed by the submit button -> submit_rewrite_task
		console.error("rewrite_selection: rewrite_prompt was too short");
		return false
	}
	
	
	add_recent_rewrite_prompt(type,prompt_text);
	save_settings(); // TODO: this is two save_settings in a row, as add_recent_rewrite_prompt also saved the data
	
	if(type == 'proofread'){
		window.settings.proofread_prompt = prompt_text;
		//add_recent_rewrite_prompt(type,prompt_text);
		//save_settings(); // TODO: this is two save_settings in a row, as add_recent_rewrite_prompt also saved the data
		
		if(!prompt_text.endsWith('.') && !prompt_text.endsWith('?') && !prompt_text.endsWith('!')){
			prompt_text = prompt_text + '.';
		}
		prompt_text += ' ' + get_translation('Return_only_the_improved_text');
		
	}
	else{
		window.settings.rewrite_prompt = prompt_text;
		
	}
	
	
	// If a model supports multiple languages, and the rewrite also involves translation, them the model could do all this in one go.
	let translation_prompt_language = null;
	
	// Letting the main AI also do translation doesn't work as well as using the dedicated translation AI's.
	/*
	if(translation_details_el.open && typeof window.settings.input_language == 'string' && typeof window.settings.output_language == 'string' && typeof window.currently_loaded_assistant == 'string' && typeof window.assistants[window.currently_loaded_assistant] != 'undefined' && typeof window.assistants[window.currently_loaded_assistant].languages != 'undefined' && window.assistants[window.currently_loaded_assistant].languages.indexOf(window.settings.input_language) != -1 && window.assistants[window.settings.assistant].languages.indexOf(window.settings.output_language) != -1 ){
		if(window.assistants[window.currently_loaded_assistant].languages.indexOf(window.settings.output_language) != -1 && window.supported_ui_languages.indexOf(window.settings.output_language) != -1){
			// The currently loaded AI understands the output language, and there is also a translation for the prompt sentence available, so the AI could try to do translation and rewrite in one go.
			translation_prompt_language = window.settings.output_language;
			prompt_text += get_translation("The_language_of_the_new_text_should_be",translation_prompt_language) + ' ' + get_translation(window.settings.output_language,translation_prompt_language) + '. ' + get_translation("Write_only_the_translation_itself",translation_prompt_language) + '.';
		}
	}
	// If the currently loaded AI model is not multi-lingual, the input text might need to be translated into a language the model understands first.
	else 
	
	if(translation_details_el.open && typeof window.settings.input_language == 'string' && typeof window.settings.output_language == 'string' && typeof window.currently_loaded_assistant == 'string' && typeof window.assistants[window.currently_loaded_assistant] != 'undefined' && typeof window.assistants[window.currently_loaded_assistant].languages != 'undefined'){

	}
	if(translation_prompt_language == null){

	}
	*/
	/*
	else if(type == 'translation'){
		let translation_prompt_language = window.settings.language;
		if(window.supported_ui_languages.indexOf(window.settings.output_language) != -1){
			translation_prompt_language = window.settings.output_language;
		}

		prompt_text = get_translation('Translate_the_following_text',translation_prompt_language) + '. ' + get_translation("The_language_of_the_new_text_should_be",translation_prompt_language) + ' ' + get_translation(window.settings.output_language,translation_prompt_language) + '. ' + get_translation("Write_only_the_translation_itself",translation_prompt_language) + ':';
	}
	*/

	const last_prompt_char = prompt_text.charAt(prompt_text.length - 1);
	if(last_prompt_char.match(/[a-zA-Z0-9]/i)){
		if(prompt_text.indexOf('.') == -1){
			//console.log("adding : to end of base rewrite prompt");
			prompt_text = prompt_text + ':';
		}else{
			prompt_text = prompt_text + '.';
		}
	}
	prompt_text = prompt_text + "\n";
	prompt_text = prompt_text + '\n---\n';
	if(!source_text.startsWith('\n')){
		prompt_text = '\n' + prompt_text;
	}
	
	prompt_text += strip_markdown(source_text);
	
	if(!source_text.endsWith('\n')){
		prompt_text += '\n';
	}
	prompt_text += '\n---\n';



	//console.log("rewrite_selection: adding prompt to task: ", prompt_text);
	//write_task['prompt'] = prompt_text;

	let write_task = {
		'prompt':prompt_text,
		'text': source_text,
		'origin': source_text_origin,
		'type': type,
		'desired_results':desired_results,
		'results':[], 
		'destination':'document',
		'file':window.settings.docs.open,
		'feeling_lucky':feeling_lucky
	}
	
	//if(type=='summarize' || type=='rewrite'){ // These are really the only two supported currently anyway
		write_task['state'] = 'should_assistant';
	//}
	

	if(typeof assistant == 'string'){
		write_task['assistant'] = assistant;
	}

	if(typeof parent_index == 'number'){
		write_task['parent_index'] = parent_index;
	}
	else{
		if(typeof window.doc_selection.from == 'number' && typeof window.doc_selection.to == 'number' && (window.doc_selection.to - window.doc_selection.from) - 10 > source_text.length){
			//console.log("the current document selection does not match the length of the text being rewritten. Will attempt to get a more representative selection");
		
			const potential_cursor = search_in_doc(write_task,source_text,true); // must be unique
			if(potential_cursor && typeof potential_cursor.from == 'number' && typeof potential_cursor.to == 'number'){
				write_task['selection'] = potential_cursor;
			}
			else{
				write_task['selection'] = window.doc_selection;
				write_task['line_nr'] = window.doc_current_line_nr;
			}
				
		}
		else{
			write_task['selection'] = window.doc_selection;
			write_task['line_nr'] = window.doc_current_line_nr;
		}
		
		
		
		//highlight_selection(window.doc_selection);
	}

	// Add translation data
	if(type != 'proofread' && translation_details_el.open && translation_input_language_select_el){
		write_task['input_language'] = translation_input_language_select_el.value;
		write_task['output_language'] = translation_output_language_select_el.value;
		write_task['translated'] = false;
	}
	
	/*
	if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant].media != 'undefined' && window.assistants[window.settings.assistant].media.indexOf('text') != -1){
		write_task['assistant'] = window.settings.assistant;
	}
	else if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant].media != 'undefined' && window.settings.assistants[window.settings.assistant].media.indexOf('text') != -1){
		write_task['assistant'] = window.settings.assistant;
	}
	*/
	
	// Add some hints that allow for finding the selection even if it changes a bit (e.g. the user continues editing the text during a proofread task);
	if(source_text_origin == 'rewrite_selection'){
		write_task = update_pre_and_post(write_task);
	}
	
	//console.log("write_task after updating pre and post of selection: ", write_task);
	write_task = window.add_task(write_task);

	if(feeling_lucky && type != 'proofread'){
		/*
		if(window.doc_selection){
			highlight_selection(window.doc_selection);
		}
		*/
		
	}
	else if(write_task && typeof write_task.index == 'number'){ // type != 'proofread' && 
		create_rewrite_result_container(write_task);
	}
	
	if(type == 'proofread' && write_task && typeof write_task.index == 'number'){
		proofread_output_el = document.getElementById('rewrite-result' + write_task.index);
		if(proofread_output_el){
			proofread_output_el.scrollIntoView(true);
		}
	}

	//rewrite_details_el.removeAttribute('open');
	//translation_details_el.removeAttribute('open');
	//document.body.classList.remove('show-rewrite');

	//rewrite_dialog_selected_text_el.innerHTML = '';
	//remove_highlight_selection();
	//doc_show_alternate_selection(window.doc_selection);

	return write_task
	
}



// Prepare question dialog
function prepare_question(text=null){
	console.log("in prepare_question. window.doc_selected_text: ", window.doc_selected_text);
	//console.log("in prepare_question. window.doc_selected_text: ",  window.doc_selected_text);
	/*
	rewrite_prompt_el.value = '';
	rewrite_dialog_selected_text_el.textContent = window.doc_selected_text;
	
	summarize_details_el.removeAttribute('open');
	rewrite_details_el.removeAttribute('open');
	translation_details_el.setAttribute('open',true);
	
	document.body.classList.add('show-rewrite');
	//rewrite_dialog_el.showModal();
	*/
	question_prompt_document_title_el.innerHTML = '';
	
	let from_selection = false;
	if(text == null && typeof window.doc_selected_text == 'string' && window.doc_selected_text.length){
		from_selection = true;
		text = window.doc_selected_text;
		question_prompt_document_title_el.innerHTML = '';
	}
	else if(text == null && typeof window.doc_text == 'string' && window.doc_text.length){
		text = window.doc_text;
		if(window.settings.docs.open != null && typeof window.settings.docs.open.folder == 'string' && typeof window.settings.docs.open.filename == 'string'){
			let question_prompt_document_title_inner_el = document.createElement('div');
			question_prompt_document_title_inner_el.classList.add('question-prompt-document-title-inner');
			question_prompt_document_title_inner_el.textContent = window.settings.docs.open.filename;
			question_prompt_document_title_el.addEventListener('click', () => {
				open_file(window.settings.docs.open.filename, null, window.settings.docs.open.folder);
			});
			question_prompt_document_title_el.appendChild(question_prompt_document_title_inner_el);
			
			//question_prompt_document_title_el.innerHTML = '<div class="question-prompt-document-title-inner" data-folder="' + window.settings.docs.open.folder + '"  data-filename="' + window.settings.docs.open.filename + '">' + window.settings.docs.open.filename + '</div>';
		}
	}
	else if(window.settings.docs.open != null && typeof window.settings.docs.open.filename == 'string'){
		// probably a binary file
		
		if(filename_is_binary_image(window.settings.docs.open.filename)){
			//console.log("prepare_question: current file is an image! Switching to image describer");
			window.question_document = null;
			window.question_text = null;
			window.question_selection = null;
			window.switch_assistant('image_to_text');
			return null
		}
		/*
		if(typeof playground_live_backups[window.settings.docs.open.folder + '/' + window.settings.docs.open.filename] == 'string'){
			//console.log("prepare_question: likely an image");
		}
		*/
	}
	
	// TODO: could check if an image is the current active file, and if so, switch to image_to_text assistant
	
	if(typeof text != 'string'){
		console.error("prepare_question: aborting, text was not a string: ", text);
		return false
	}
	//console.log("prepare_question:  from_selection? ", from_selection);
	
	if(from_selection){
		window.question_document = null;
		
		if(typeof window.doc_selected_text == 'string' && window.doc_selected_text.length > 2 && typeof window.doc_selection != 'undefined' && window.doc_selection != null){
			highlight_selection(window.doc_selection);
		}
	}
	else{
		window.question_document = window.settings.docs.open;
	}
	
	/*
	if(typeof window.settings.last_loaded_text_ai == 'string'){
		if(window.settings.last_loaded_text_ai != window.settings.assistant){
			window.switch_assistant(window.settings.last_loaded_text_ai);
		}
	}
	else{
		
	}
	*/
	
	window.switch_assistant('any_writer');
	
	window.question_text = text;
	window.question_document = JSON.parse(JSON.stringify(window.settings.docs.open));
	window.question_selection = JSON.parse(JSON.stringify(window.doc_selection));
	highlight_selection(window.doc_selection);
	question_prompt_textarea_el.value = text;
	if(window.settings.question_prompt){
		prompt_el.value = window.settings.question_prompt;
	}
	else{
		if(from_selection){
			prompt_el.value = get_translation('What_is_this_text_about');
		}
		else{
			prompt_el.value = get_translation('What_is_this_document_about');
		}
	}
	
	if(window.innerWidth < 981 && !document.body.classList.contains('sidebar-shrink')){
		if(typeof close_sidebar == 'function'){
			close_sidebar();
		}
	}
	
	document.body.classList.add('text-attached');
	document.body.classList.remove('chat-shrink');
	
	return true
}
window.prepare_question = prepare_question;






/*
// see various_utils.js
function strip_timestamps(source_text){
	//console.log("in strip_timestamps");
	if(typeof source_text == 'string'){
		let lines = source_text.split("\n");
		//console.log("strip_timestamps: number of lines to check: ", lines.length);
		for(let l = lines.length - 1; l >= 0; l--){
			// TODO: should also check that the line mostly consists of non-letter characters
			if(lines[l].startsWith('🕰️ ') && lines[l].indexOf(':') != -1){ //  && lines[l].endsWith(' )') && lines[l].indexOf(' ( T+ ') != -1
				//console.log("strip_timestamps: removing timestamp line from source_text: ", lines[l]);
				lines = lines.splice(l,1);
			}
		}
		//console.log("strip_timestamps: number of lines after stripping: ", lines.length);
		return lines.join("\n");
	}
	else{
		console.error("strip_timestamps:  provided source_text was not a string: ", source_text);
	}
	return source_text;
}
*/


function summarize_selection(){
	rewrite_selection('summarize');
}



function translate_selection(text=null,desired_count=1,task=null,feeling_lucky=false){
	console.log("in translate_selection. text, desired_count: ", text, desired_count);
	if(typeof desired_count != 'number'){
		console.error("translate_selection: desired_count was not a number:", desired_count);
		return false
	}
	
	
	add_script('./translation_module.js')
	.then((value) => {
		console.log("translate_selection: translation_module.js loaded. value: ", value);
		
		//let text = window.doc_selected_text;
		let origin = 'translate_document';
	
		if(typeof text != 'string' && rewrite_dialog_selected_text_el.textContent != ''){
			text = rewrite_dialog_selected_text_el.textContent;
			origin = 'translate_selection';
		}
		
	 	if(typeof text != 'string' && window.settings.docs.open != null){
			if(typeof window.doc_selected_text == 'string' && window.doc_selected_text.length > 1){
				text = window.doc_selected_text;
				origin = 'translate_selection';
			}
			else if(typeof window.doc_text == 'string' && window.doc_text.length > 1){
				text = window.doc_text;
			}
		}
	
		if(typeof text != 'string'){
			console.error("translate_selection: text was not a string");
			return false
		}
	
		
		if(window.settings.input_language == null){
			window.settings.input_language = window.settings.language;
		}
		if(window.settings.output_language == null){
			window.settings.output_language = window.settings.language;
		}
	
		if(window.settings.input_language != null && window.settings.input_language == window.settings.output_language){
			console.error("translate_selection: input language was output language. Aborting.  window.settings.input_language, window.settings.output_language: ", window.settings.input_language, window.settings.output_language);
			return false
		}
	
		if(window.settings.input_language == null || window.settings.output_language == null){
			console.error("translate_selection: input or output language was null: ", window.settings.input_language, window.settings.output_language);
		}
		
		let grandparent_index = null;
		
	
		if(window.settings.input_language == window.settings.output_language){
			console.error("somehow input and output language were the same: ", window.settings.input_language);
			flash_message(get_translation('An_error_occured'),2000,'fail');
			return;
		}
	
	
		// For translations there currently isn't an option to get multiple versions, since the AI always generates exactly the same result. But perhaps this scaffolding will be useful later.
		let translation_parent_task = {
			'assistant':'translator',
			'prompt':null,
			'text': text,
			'origin': origin,
			'type':'translation',
			'state': 'parent',
			'desired_results': desired_count,
			'results':[],
			'input_language': window.settings.input_language,
			'output_language': window.settings.output_language,
			'translation_details':get_translation_model_details_from_select(window.settings.output_language),
			'doc_cursor': 0,//{'from':0,'to':0},
			'destination':'document',
			'feeling_lucky':feeling_lucky,
			'file':window.settings.docs.open
		}
		
		if(origin == 'translate_selection' && window.doc_selection != null){
			translation_parent_task['selection'] = window.doc_selection,
			translation_parent_task['line_nr'] =  window.doc_current_line_nr,
			translation_parent_task = update_pre_and_post(translation_parent_task);
		}
		else if(origin == 'translate_selection'){
			console.error("translate_selection, but doc_selection was null");
		}
		
		
		if(task != null){
			//console.log("translate_selection: task was provided, copying it's values over the translation_parent_task: ", task, " ...>>> ", translation_parent_task);
			translation_parent_task = {...translation_parent_task, ...task};
		}
		
		
		translation_parent_task = window.add_task(translation_parent_task);
		
		
		create_rewrite_result_container(translation_parent_task);
		
	
		if(translation_parent_task && typeof translation_parent_task.index == 'number'){
			
			let prepared_lines = null;
			
			
			for(let tt = 0; tt < desired_count; tt++){
				
				console.log("translate_selection: adding sentence translation subtask.  nr: ", tt);
				
				let translation_task = {
					'assistant':'translator',
					'prompt': null,
					'text': text,
					//'texts':sentences,
					'origin': origin,
					'type': 'translate',
					'state':'should_translation',
					'desired_results':1,
					'results':[],
					'destination':'document',
					'feeling_lucky':feeling_lucky,
					'translation_details':get_translation_model_details_from_select(window.settings.output_language),
					'input_language': window.settings.input_language,
					'output_language': window.settings.output_language,
					'file':window.settings.docs.open
				}
				
				if(prepared_lines){
					translation_task['sentences_to_translate'] = prepared_lines;
				}
				
				
				if(typeof translation_parent_task.index == 'number'){
					//console.log("Setting translation task's parent_index as: ", translation_parent_task.index);
					translation_task['parent_index'] = translation_parent_task.index;
				}
				
	
				let needle_cursor = search_in_doc(text);
				
				if(origin == 'translate_selection' && window.doc_selection != null){
					translation_task['selection'] = window.doc_selection,
					translation_task['line_nr'] =  window.doc_current_line_nr,
					translation_task = update_pre_and_post(translation_task);
				}
				else if(origin == 'translate_selection'){
					console.error("translate_selection, but doc_selection was null");
				}
	
				
				if(task != null){
					//console.log("translate_selection: task was provided, copying it's values over the translation_task: ", task);
					translation_task = {...translation_task, ...task};
				}
				
				window.add_task(translation_task);
		
			}
		}
		
	})
	.catch((err) => {
		console.error("translate_selection: caught error loading translation_module.js: ", err);
	})
	
}


function translate_document(){
	console.log("in translate_document");
	if(typeof window.doc_text != 'string'){
		console.error("translate_document:  aborting, window.doc_text was not a string: ", window.doc_text);
		return false
	}
	let original_text = '' + window.doc_text;
	//console.log("translate_document: original_text: ", original_text);
	
	document.body.classList.remove('prepare-translate-document');
	document.body.classList.remove('prepare-summarize-document');
	
	let translation_filename = translation_new_file_name_input_el.value;
	if(translation_filename == ''){
		translation_filename = '' + current_file_name + '-' + make_date_string() + '.txt';
	}
	
	let lang_code = '';
	if(typeof window.settings.output_language == 'string'){
		lang_code = ' ' + window.settings.output_language.toUpperCase();
	}
	let translation_document_header = current_file_name + ' - ' + get_translation(lang_code);
	
	if(typeof window.translations['Translation'] != 'undefined' && typeof window.translations['Translation'][lang_code.toLowerCase()] == 'string'){
		translation_document_header += " " + window.translations['Translation'][lang_code.toLowerCase()].toLowerCase();
	}
	translation_document_header += '\n\n\n';
	//console.log("translate_document: filename: ", translation_filename);
	create_new_document(translation_document_header, translation_filename);
	
	translate_selection(original_text,1,{'origin':'translate_document'})
}





// No longer used? replaced by play_document functionality
function speak_selection(){
	//console.log("in speak_selection");
	if(typeof window.doc_selected_text == 'string' && window.doc_selected_text.replaceAll('\n').trim().length){
		window.add_task({
			'assistant':'speaker',
			'prompt':null,
			'text': window.doc_selected_text,
			'selection':window.doc_selection,
			'line_nr':window.doc_current_line_nr,
			'origin': 'selection',
			'type': 'speak',
			'desired_results':0,
			'results':[], 
			'destination':'audio_player',
			'file':window.settings.docs.open
		});
	}
	else{
		console.error("speak_selection: window.doc_selected_text was not a string or empty string: ",  window.doc_selected_text);
	}
	
}



async function create_new_document(content,filename,new_doc_folder){
	if(typeof content != 'string'){
		content = '';
	}
	//console.log("in create_new_document. Content: ", content);
	//console.log("in create_new_document.  content,filename,new_doc_folder: ", content,filename,new_doc_folder);
	if(typeof new_doc_folder == 'undefined' && typeof filename == 'undefined'){
		await create_file(false,content); // asks the user for the desired name
	}
	else{
		
		if(typeof filename == 'string' && filename.length){
			filename = sanitize_filename(filename);
			if(typeof new_doc_folder == 'undefined'){
				await create_file(false,content,filename); // filename is known
			}
			else{
				console.error("saving to specific folder is not implemented yet");
				// new_doc_folder
				// TODO: save to specific folder. Open that folder first, then create the new file?
				// save_file(filename,content,'browser',new_doc_folder);
			}
		}
	}
	if(window.settings.settings_complexity == 'normal'){
		window.show_files_tab();
	}
}
window.create_new_document = create_new_document;


async function continue_document(source_text=null,use_selection=true,task=null){
	//console.log("in continue_document. source_text,use_selection: ", source_text, use_selection);
	//console.log("open file: ", window.settings.docs.open);
	
	if(window.settings.docs.open == null){
		console.error("continue_document: no open file. Aborting.");
		return null
	}
	
	let origin = 'document';
	
	if((source_text == null || (typeof source_text == 'string' && source_text.length < 6)) && use_selection === true){
		//console.log("continue_document: use_selection was true");
		if(typeof window.doc_selected_text == 'string' && window.doc_selected_text.length > 5){
			//console.log("continue_document: using selection: ", window.doc_selection);
			source_text = window.doc_selected_text;
			origin = 'selection';
		}
	}
	
	if(source_text == null && !(typeof window.doc_text == 'string' && window.doc_text.length > 5)){ // SIC
		console.error("continue_document: window.doc_text is null or too short. Aborting.");
		return null
	}
	if(source_text == null){
		console.log("continue_document: falling back to using entire document");
		source_text = window.doc_text;
	}
	//source_text = source_text.trim();
	//console.log("continue_document: initial (trimmed) source text: ", source_text);
	
	let context_size = 1024;
	let tokenize_factor = 3;
	if(typeof window.settings.assistant == 'string' && typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant].context_size == 'number'){
		context_size = window.assistants[window.settings.assistant].context_size;
		if(!window.assistants[window.settings.assistant].context_size < 4100){
			tokenize_factor = 2;
		}
	}
	
	let words_to_get = Math.round( (context_size / tokenize_factor) / 2);
	//console.log("continue: amount of words that will fit into the context: ", words_to_get);
	source_text = get_text_tail_words(source_text,words_to_get);
	
	//console.log("continue: text tail: ", source_text);
	let prompt_text = source_text;
	
	if(typeof window.settings.last_loaded_text_ai == 'string' && typeof window.assistants[window.settings.last_loaded_text_ai] != 'undefined'){
		if(typeof window.assistants[window.settings.last_loaded_text_ai]['model_type'] == 'string' && window.assistants[window.settings.last_loaded_text_ai]['model_type'] == 'base'){
			// nothing, a base model should be able to continue the text
		}
		else{
			prompt_text = get_translation("Continue_writing_the_following_text") + ":\n\n" + source_text;
		}
	}
	
	//source_text = source_text.trim();
	//source_text = source_text.replace(/^\s+|\s+$/g, '');
	//console.log("new continue task prompt: ", prompt_text);
	
	let continue_task = {
		'prompt':prompt_text,
		'text':source_text,
		'selection':window.doc_selection,
		'line_nr':window.doc_current_line_nr,
		'origin':origin,
		//'template':'oneshot',
		'type':'continue',
		'state':'should_assistant',
		'desired_results':1,
		'results':[], 
		'destination':'document',
		'feeling_lucky':true,
		'file':window.settings.docs.open
	}
	
	assistant_id = window.settings.assistant;
 	if(typeof source_text == 'string' && source_text.length > 30){
 		assistant_id = await pick_optimal_ai_from_text_language(source_text);
 		//console.log("continue_document: optimal AI from text: ", assistant_id);
 	}
	continue_task['assistant'] = assistant_id;
	
	
	if(task == null){
		continue_task = window.add_task(continue_task);
		return continue_task
	}
	else{
		task = {...task,...continue_task}
		console.log("continue_document: ugraded task: ", task);
		return task
	}
	
}



// get X number of words from the end of a text
function get_text_tail_words(source_text,max_words=200){
	//console.log('in get_text_tail_words.  source_text,max_words: ', source_text, max_words);
	if(typeof source_text != 'string' || typeof max_words != 'number'){
		console.error("get_text_tail_words: invalid input:  source_text,max_words:", source_text, max_words);
		return "An error occured";
	}
	
	
	let cut_index = null;
	let word_count = 0;
	for(let ch = source_text.length; ch >= 0; ch--){
		if(source_text.charAt(ch) == ' '){
			word_count++;
			if(word_count == max_words){
				cut_index = ch;
				break
			}
		}
	}
	
	if(cut_index == null){
		//console.log("get_text_tail_words: returning the entire source_text");
		return source_text;
	}
	else{
		//console.log("get_text_tail_words: calling get_text_tail to get this number of characters from the end: ", cut_index);
		
		if(source_text.length > 400){
			return get_text_tail(source_text,cut_index - 200);
		}
		else{
			return get_text_tail(source_text,cut_index);
		}
		
		
	}
}


function get_text_tail(source_text=null,max_length=600){
	//console.log("in get_text_tail.  source_text,max_length: ", source_text, max_length);
	if(source_text == null){
		console.error("get_text_tail: source_text was null");
		source_text = 'ERROR, invalid text input';
	}
	
	if(source_text.length < max_length){
		//console.log("get_text_tail: text is already short enough");
	}
	else{
		//console.log("get_text_tail: the existing text is quite long, will have to make it shorter. Use the end (simple), or summarize more that came before first (complex)");
		let original_tail_of_source_text = tail_of_source_text = source_text.slice(source_text.length - max_length, source_text.length); // the original check
		//console.log("get_text_tail: original_tail_of_source_text: ", original_tail_of_source_text);
		if(tail_of_source_text.indexOf('.') != -1){
		
			tail_of_source_text = tail_of_source_text.slice(tail_of_source_text.indexOf('.')+1,tail_of_source_text.length);
			//console.log("get_text_tail: original_tail_of_source_text had a period in it, so stripped everything before the first period: ", tail_of_source_text);
		}
		//tail_of_source_text = tail_of_source_text.trim();
		//console.log("tail_of_source_text: ", tail_of_source_text);
		
		let end_buffer = Math.round(max_length*0.7);
		if(source_text.length > 600){
			end_buffer = 200;
		}
		
		
		if(tail_of_source_text.length > ( source_text.length - end_buffer)){
			source_text = tail_of_source_text;
			//console.log("get_text_tail: tail_of_source_text changed to limited on a period.");
		}
		else{
			//console.log("get_text_tail: stripping tail to first likely end of sentence resulted in a very big loss. Using original source text");
			source_text = original_tail_of_source_text
		}
	}
	return source_text;
}
window.get_text_tail = get_text_tail;



function summarize_document(source_text=null,use_selection=false,desired_results=1){
	//console.log("in summarize_document. source_text,use_selection: ", source_text, use_selection);
	//console.log("open file: ", window.settings.docs.open);
	
	if(window.settings.docs.open == null){
		console.error("summarize_document: no open file. Aborting.");
		return false
	}
	
	if(typeof desired_results != 'number'){
		console.error("summarize_document: aborting, desired_results parameter should be a number: ", desired_results);
		return false
	}
	
	let assistant_id = null;
	
	if(typeof window.settings.assistant == 'string' && typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant].context_size == 'number' && typeof window.assistants[window.settings.assistant].media != 'undefined' && Array.isArray(window.assistants[window.settings.assistant].media) && window.assistants[window.settings.assistant].media.indexOf('text') != -1){
		//console.log("summarize_document: using window.settings.assistant as assistant_id: ", window.settings.assistant);
		assistant_id = window.settings.assistant;
	}

	else if(typeof window.settings.last_loaded_text_ai == 'string' && typeof window.assistants[window.settings.last_loaded_text_ai] != 'undefined' && typeof window.assistants[window.settings.last_loaded_text_ai].context_size == 'number' && typeof window.assistants[window.settings.last_loaded_text_ai].media != 'undefined' && Array.isArray(window.assistants[window.settings.last_loaded_text_ai].media) && window.assistants[window.settings.last_loaded_text_ai].media.indexOf('text') != -1){
		//console.log("summarize_document: using window.settings.last_loaded_text_ai as assistant_id: ", window.settings.last_loaded_text_ai);
		assistant_id = window.settings.last_loaded_text_ai;
	}

	else{
		flash_message(get_translation('The_currently_visible_AI_cannot_handle_text'),3000,'fail');
		return
	}
	
	
	
	document.body.classList.remove('prepare-summarize-document');
	//document.body.classList.remove('show-rewrite');
	
	let origin = 'summarize_document';
	
	
	if( (typeof source_text == 'string' && source_text.length < 6) && use_selection === true){
		//console.log("summarize_document: use_selection was true");
		if(typeof window.doc_selection == 'string' && window.doc_selection.length > 5){
			//console.log("summarize_document: using selection: ", window.doc_selection);
			source_text = window.doc_selection;
			origin = 'summarize_selection';
		}
	}
	
	
	if(source_text == null && !(typeof window.doc_text == 'string' && window.doc_text.length > 5)){
		console.error("summarize_document: window.doc_text is null. Aborting.");
		return false
	}
	if(source_text == null){
		source_text = window.doc_text;
	}
	
	
	
	source_text = source_text.replace(/\[(\d+)\]/g, ''); // strips references to footnotes from the text, e.g. [14]
	//console.log("summarize_document: initial (trimmed and replaced) source text: ", source_text);
	
	
	let initial_context = 1024;
	let max_context_size = 1024;
	if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].context == 'number'){
		initial_context = window.settings.assistants[assistant_id].context;
		if(typeof window.settings.assistants[assistant_id].context_size == 'number'){
			max_context_size = window.settings.assistants[assistant_id].context_size;
		}
	}
	else if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].context == 'number'){
		initial_context = window.assistants[assistant_id].context;
		if(typeof window.assistants[assistant_id].context_size == 'number'){
			max_context_size = window.assistants[assistant_id].context_size;
		}
	}
	
	let model_size = null;
	if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].size == 'number'){
		model_size = window.settings.assistants[assistant_id].size;
	}
	else if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].size == 'number'){
		model_size = window.assistants[assistant_id].size;
	}
	
	if(typeof model_size == 'number' && typeof initial_context == 'number' && initial_context <= 4000 && window.is_mobile == false && window.ram > 7000 && model_size < 2 && typeof max_context_size == 'number'){
		console.warn("expanding context to summarize a document: ", initial_context, " -> ", initial_context + 2000);
		summary_task['context'] = initial_context + 2000;
		if(summary_task['context'] > max_context_size){
			summary_task['context'] = max_context_size
		}
	}
	else{
		//console.log("not expanding context for document summarization.  initial_context,model_size,window.is_mobile,window.ram: ", initial_context,model_size,window.is_mobile,window.ram)
	}
	
	
	
	
	
	
	
	let paragraphs = split_into_paragraphs(source_text,null,{'context':initial_context});
	
	//console.log("paragraphs: ", paragraphs);
	
	if(Array.isArray(paragraphs) && paragraphs.length){
		//console.log("splitting into paragraphs seems to have succeeded");
		
		//console.log("Creating a new document for the summary");
		
		const summary_document_header = current_file_name + " " + get_translation("Summary").toLowerCase() + "\n\n\n";
		
		
		let summary_filename = summarize_new_file_name_input_el.value;
		if(summary_filename.trim() == ''){
			let extension = '.txt';
			summary_filename = current_file_name;
			let extension_check = summary_filename.lastIndexOf('.');
			if(summary_filename.lastIndexOf('.') > summary_filename.length - 5){
				extension = summary_filename.substr(summary_filename.lastIndexOf('.'));
				summary_filename = summary_filename.replace(/\.[^/.]+$/, "");
			}
		
			summary_filename = summary_filename + " " + get_translation("Summary").toLowerCase() + extension;
		}
		
		
		
		
		
		//console.log("summary filename: ", summary_filename);
		create_new_document(summary_document_header, summary_filename);
		
		
		let summary_task = {
			'assistant':assistant_id,
			'prompt':null,
			//'text': source_text,
			//'texts': paragraphs,
			'origin': origin,
			//'template':'oneshot',
			'type': 'summarize',
			'state': 'parent',
			'desired_results':paragraphs.length,
			'results':[],
			'context':initial_context,
			'destination':'document',
			'file':window.settings.docs.open
		}
		if(summary_task.file != null){
			summary_task['file']['filename'] = summary_filename;
		}
		//console.log("main summary_task: ", summary_task);
		
		const parent_task = window.add_task(summary_task);
		if(typeof parent_task == 'object' && typeof parent_task.index == 'number'){
			
			
			create_rewrite_result_container(parent_task);
			
			add_chat_message('current','current',get_translation('Reading_a_document_in_order_to_summarize_it'),'Reading_a_document_in_order_to_summarize_it');
			add_chat_message('current','current',get_translation('Because_the_document_is_very_long_this_will_be_done_in_a_number_of_smaller_steps') + ': ' + paragraphs.length, 'Because_the_document_is_very_long_this_will_be_done_in_a_number_of_smaller_steps');			
			
			for(let p = 0; p < paragraphs.length; p++){
				
				//let prompt_text = 'The following text is much too long, please shorten it to two sentences that contain the most important aspects of the information:';
				let prompt_text = summarize_prompt_el.value; //get_translation('Summarize_the_following_text') + ':';
				if(prompt_text.length < 5){
					prompt_text = get_translation('Summarize_the_following_text') + ':';
				}
				if(window.settings.summarize_prompt != prompt_text){
					window.settings.summarize_prompt = prompt_text;
					save_settings();
				}
				
				const last_prompt_char = prompt_text.charAt(prompt_text.length - 1);
				if(last_prompt_char.match(/[a-zA-Z0-9]/i)){
					if(prompt_text.indexOf('.') == -1){
						//console.log("adding : to end of base rewrite prompt");
						prompt_text = prompt_text + ':';
					}else{
						prompt_text = prompt_text + '.';
					}
				}
				prompt_text = prompt_text + "\n";
				prompt_text = prompt_text + '\n---\n';
				if(!source_text.startsWith('\n')){
					prompt_text = '\n' + prompt_text;
				}
				prompt_text = prompt_text + paragraphs[p];
				if(!source_text.endsWith('\n')){
					prompt_text += '\n';
				}
				prompt_text = prompt_text + '\n---\n';
				
				
				/*
				prompt_text += "\n\n";
				prompt_text += '---\n';
				prompt_text += paragraphs[p];
				if(!paragraphs[p].endsWith('\n')){
					prompt_text += '\n';
				}
				prompt_text += '---\n';
				prompt_text += "\n";
				*/
				//prompt_text += get_translation('Summary') + ":";
				
				//let prompt_text = "Read the following context document:\n---------------\n";
				/*
				let prompt_text = "Read the following text, which is a small part of a larger document:\n---------------\n";
				prompt_text += paragraphs[p];
				if(!paragraphs[p].endsWith('\n')){
					prompt_text += '\n';
				}
				prompt_text += prompt_text + '---------------\n';
				
				prompt_text += "The text is currently too long. Your tasks are as follows:\n";
				prompt_text += "2.- Shorten the text to about a third of it's current length.\n";
				prompt_text += "2.- Write an extensive, fluid, and continuous paragraph summarizing the most important aspects of the information you have read.\n";
				prompt_text += "3.- You can only synthesize your response using exclusively the information from the context document.\n";
				*/
				
				//console.log(p + ". summarize sub-task prompt: ", prompt_text);
				
				let sub_summary_task = {
					'assistant':assistant_id,
					'prompt': prompt_text,
					'parent_index':parent_task.index,
					'context':initial_context,
					//'text': paragraphs[p],
					'origin': origin,
					'selection':{'position':'end'}, // append to the end of the document
					//'template':'oneshot',
					'type': 'summarize',
					'state': 'should_assistant',
					'desired_results':1,
					'results':[],
					'destination':'document',
					//'system_prompt':'You are an expert agent in information extraction and summarization.',
					'file':window.settings.docs.open
				}
				if(summary_task.file != null){
					summary_task['file']['filename'] = summary_filename;
				}
				
				
				
				
				//console.log("summary sub task: ", summary_task);
				
				window.add_task(sub_summary_task);
			}
			
			return true
			
		}
		else{
			console.error("summarize_document: failed to add parent container task");
		}
		
	}
	else{
		console.error("splitting into paragraphs seems to have failed");
		
	}
	return false
}



// The current version is a little over-engineered experiment
// This could be further optimized by first chunking paragraphs, and then optimallty mashing them together into summarization chunks
function split_into_paragraphs(text,maximum_paragraph_length=1500,task=null){
	//console.log("in split_into_paragraphs.  text,maximum_paragraph_length,task: ", maximum_paragraph_length);
	if(typeof text != 'string'){
		console.error("split_into_paragraphs: invalid input: ", text);
		return false
	}
	
	// Experiment to see if it generated better chunks if starting from the bottom
	function reverseString(str) {
	    var newString = "";
	    for (var i = str.length - 1; i >= 0; i--) {
	        newString += str[i];
	    }
	    return newString;
	}
	
	text = reverseString(text);
	
	
	//let context_size = 1024;
	let assistant_id = window.settings.assistant;
	if(task != null && typeof task.assistant == 'string' && task.assistant.length){
		assistant_id = task.assistant;
	}
	if(typeof assistant_id != 'string'){return false}
	
	
	let initial_context = 1024;
	if(typeof task != 'undefined' && task != null && typeof task.context == 'number'){
		initial_context = task.context;
	}
	else if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].context == 'number'){
		initial_context = window.settings.assistants[assistant_id].context;
	}
	else if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].context == 'number'){
		initial_context = window.assistants[assistant_id].context;
	}
	
	
	
	
	if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].media != 'undefined' && Array.isArray(window.assistants[assistant_id].media) && window.assistants[assistant_id].media.indexOf('text') == -1){
		console.error("split_into_paragraphs: the assistant cannot handle text: ", assistant_id);
		flash_message(get_translation('The_currently_visible_AI_cannot_handle_text'),3000,'fail');
	}
	
	
	// Figure out the text
	
	let text_length = text.length;
	
	if(typeof maximum_paragraph_length != 'number'){
		maximum_paragraph_length = 1500;
		
		if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].context_size == 'number'){
			//console.log("split_into_paragraphs: model context_size info available: ", window.assistants[ window.settings.assistant].context_size);
			if(window.settings.assistants[assistant_id].context_size > 3000){
				maximum_paragraph_length = Math.round(initial_context * 2.5);
			}
			else{
				maximum_paragraph_length = Math.round(initial_context * 1.1);
			}
		}
	
		else if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].context_size == 'number'){
			//console.log("split_into_paragraphs: model context_size info available: ", window.assistants[ window.settings.assistant].context_size);
			if(window.assistants[assistant_id].context_size > 3000){
				maximum_paragraph_length = Math.round((window.assistants[assistant_id].context) * 2.5);
			}
			else{
				maximum_paragraph_length = Math.round((window.assistants[assistant_id].context) * 1.1);
			}
		}
		
		
	}
	
	
	console.log("split_into_paragraphs: maximum_paragraph_length: ", maximum_paragraph_length);
	
	if(maximum_paragraph_length > 5000){
		maximum_paragraph_length -= 600;
	}
	else if(maximum_paragraph_length > 600){
		maximum_paragraph_length -= 300; // some leeway for the wrapper prompt
		//console.log("split_into_paragraphs: removed an extra 150 characters from maximum_paragraph_length: ", maximum_paragraph_length);
	}else{
		//console.log("split_into_paragraphs: maximum_paragraph_length without extra prompt safeguard: ", maximum_paragraph_length);
	}
	
	
	let maximum_paragraph_halfway_length = Math.round(maximum_paragraph_length/2) + 150;
	
	if(maximum_paragraph_length > 4000){
		maximum_paragraph_halfway_length = maximum_paragraph_length - 1500;
	}
	//console.log("split_into_paragraphs:  maximum_paragraph_length, maximum_paragraph_halfway_length: ", maximum_paragraph_length, maximum_paragraph_halfway_length);
	
	let extracted_until_char = 0;
	let chars_since_extraction = 0;
	let paragraphs = [];
	let newline_paragraphs = [];
	let double_newline_paragraphs = [];
	
	let newline_count = 0;
	let double_newline_count = 0;
	let text_since_last_newline = '';
	let text_since_last_double_newline = '';
	
	let chars_since_last_newline = [];
	let chars_since_last_double_newline = [];
	let average_paragraph_length = 0;
	let average_newline_paragraph_length = 0;
	let average_double_newline_paragraph_length = 0;
	
	let at_newline = false;
	let at_double_newline = false;
	let at_sub_title = false;
	let not_newline = true;
	let paragraph_char_count = 0;
	let double_paragraph_char_count = 0;
	
	let near_the_end = false;
	let almost_near_the_end = false;
	let allowed_chars_remaining = 0;
	let long_chars_ahead_count = 0;
	
	let text_ahead = '';
	let long_text_ahead = '';
	
	let newline_ahead = false;
	let double_newline_ahead = false;
	let sub_title_ahead = false;
	
	function append_paragraph(char_index){
		//console.log("in append_paragraph. char_index: ", char_index);
		let new_para = text.substr(extracted_until_char,(char_index - extracted_until_char));
		//console.log("adding paragraph with length: ", new_para.length, new_para);
		paragraphs.push(new_para);
		extracted_until_char = char_index;
		chars_since_extraction = 0;
		allowed_chars_remaining = 0;
		paragraph_char_count = 0;
		update_ahead(char_index);
	}
	
	function update_ahead(char_index){
		//console.log("\nin update_ahead.  char_index, chars_since_extraction, maximum_paragraph_length: ", char_index, chars_since_extraction, maximum_paragraph_length);
		
		text_ahead = '';
		allowed_chars_remaining = (extracted_until_char + maximum_paragraph_length) - char_index; // chars_since_extraction
		if(allowed_chars_remaining < 0){
			console.error("allowed_chars_remaining was less than zero: ", allowed_chars_remaining);
		}
		if(text_length - char_index < allowed_chars_remaining){
			//console.warn("update_ahead: near the end.   text_length,char_index,allowed_chars_remaining: ",text_length,char_index,allowed_chars_remaining);
			allowed_chars_remaining = (text_length - char_index) - 1;
			near_the_end = true;
			almost_near_the_end = true;
		}
		//console.log("update_ahead: allowed_chars_remaining: ", allowed_chars_remaining);
		let from = char_index;
		let to = allowed_chars_remaining;
		//console.warn("from and to: ", from, to);
		
		text_ahead = text.substr(from, to);
		//console.warn("from and to: update_ahead: text_ahead: ", text_ahead);
		if(!near_the_end){
			let long_chars_ahead_count = maximum_paragraph_length;
			if(text_length - char_index < long_chars_ahead_count){
				long_chars_ahead_count = (text_length - char_index) - 1;
				almost_near_the_end = true;
				//console.warn("update_ahead: almost near the end");
			}
			
			long_chars_ahead_count = long_chars_ahead_count - allowed_chars_remaining;
			//console.log("update_ahead: long_chars_ahead_count: ", long_chars_ahead_count);
			if(long_chars_ahead_count > 0){
				long_text_ahead = text.substr(char_index+allowed_chars_remaining,long_chars_ahead_count);
			}
			else{
				long_text_ahead = '';
			}
			
		}
		else{
			long_text_ahead = '';
		}
		
		//console.log("- text_ahead: ", text_ahead);
		//console.log("- long_text_ahead: ", long_text_ahead);
		
		if(text_ahead.indexOf('\n') != -1){
			newline_ahead = true;
			//console.log("A newline was spotted in the text ahead");
		}
		else{
			//console.log("No more newlines spotted in the text ahead");
			newline_ahead = false;
		}
		
		if(text_ahead.indexOf('\n\n') != -1){
			double_newline_ahead = true;
			//console.log("A double newline was spotted in the text ahead");
		}
		else{
			//console.log("No more double newlines spotted in the text ahead");
			double_newline_ahead = false;
		}
		
		if(text_ahead.indexOf('**\n\n') != -1){
			sub_title_ahead = true;
			//console.log("A double newline was spotted in the text ahead");
		}
		else{
			//console.log("No more double newlines spotted in the text ahead");
			sub_title_ahead = false;
		}
		
		//console.log("end of update_ahead\n\n\n");
		
		return text_ahead;
	}
	
	
	// Called when there is no 'natural' new paragraph in the text ahead, but the paragraph so far is also too short to be summarized.
	// TODO: could just add the short text to the summary instead?
	function find_alternative_end(text_ahead){
		//console.log("in find_alternative_end. text_ahead: ", text_ahead);
		
		if(text_ahead.lastIndexOf(' .') > Math.round(text_ahead.length / 2)){
			//console.log("The period is in the latter half of the text ahead");
			append_paragraph(i + text_ahead.lastIndexOf('. ' + 1));
		}
		else if(text_ahead.lastIndexOf(' .') > 3){
			//console.log("Grabbing first available period. Index in text_ahead: ", text_ahead.lastIndexOf('. '));
			append_paragraph(i + text_ahead.lastIndexOf(' .' + 1));
		}
		else if(text_ahead.lastIndexOf(' !') > 3){
			//console.log("Grabbing first available exclamation mark. Index in text_ahead: ", text_ahead.lastIndexOf('! '));
			append_paragraph(i + text_ahead.lastIndexOf(' !' + 1));
		}
		else if(text_ahead.lastIndexOf(' ?') > 3){
			//console.log("Grabbing first available question mark. Index in text_ahead: ", text_ahead.lastIndexOf('? '));
			append_paragraph(i + text_ahead.lastIndexOf(' ?' + 1));
		}
		else if(text_ahead.lastIndexOf(' -') > 3){
			//console.log("Grabbing first available dash. Index in text_ahead: ", text_ahead.lastIndexOf('- '));
			append_paragraph(i + text_ahead.lastIndexOf('- ' + 1));
		}
		else if(text_ahead.lastIndexOf(' ') > 3){
			console.error("NOTHING USEFUL IN THE TEXT_AHEAD, USING A SPACE TO SPLIT PARAGRAPH");
			append_paragraph(i + text_ahead.lastIndexOf(' ' + 1));
		}
		else{
			console.error("VERY STRANGE TEXT, COULD NOT EVEN FIND A SPACE TO SPLIT PARAGRAPH ON");
			append_paragraph(i + text_ahead.length);
		}
		
	}
	
	
	
	for (var i = 0; i < text.length; i++) {
		
		if(i < extracted_until_char){
			//console.log("split_into_paragraphs: catching up to: ", extracted_until_char);
			continue
		}
		
		const c = text.charAt(i);
		
		
		
		if(c == '\n'){
			at_newline = true;
			not_newline = false;
			
			if(i < text.length - 3){
				if(text.charAt(i+1) == '\n'){
					if(at_double_newline == false){
						double_newline_count++;
						at_double_newline = true;
						
						if(i > 2 && text.charAt(i-1) == '*' && text.charAt(i-2) == '*'){
							//console.log("Paragraph: at subtitle");
							at_sub_title = true;
						}
						else{
							//at_sub_title = false;
						}
						
					}
				}
				else if(at_double_newline == false){
					newline_count++;
				}
			}
		}
		else{
			
			
			if(i > extracted_until_char){
				
				if(chars_since_extraction > (maximum_paragraph_length - 30)){
					console.warn("split_into_paragraphs: getting very close to the limit. Where are the newlines?");
					find_alternative_end(update_ahead(i));
				}
				
				else if(at_newline || at_double_newline || at_sub_title){
					//console.log("\n" + i + ". at a newline or double newline or sub title.");
				
					text_ahead = update_ahead(i);
					//console.error("REMAINING TEXT AHEAD: ", text_ahead);
					
				
					if(at_newline){
						if(paragraph_char_count > 4){
							newline_paragraphs.push(text_since_last_newline);
							text_since_last_newline = '';
							average_newline_paragraph_length = Math.round(i / newline_paragraphs.length);
							//console.log("average_newline_paragraph_length: ", average_newline_paragraph_length);
						}
						//console.log("newline_paragraphs: ", newline_paragraphs);
					}
				
				
					if(at_double_newline){
						if(double_paragraph_char_count > 4){
							double_newline_paragraphs.push(text_since_last_double_newline);
							text_since_last_double_newline = '';
							average_double_newline_paragraph_length = Math.round(i / double_newline_paragraphs.length);
							//console.log("updated average_double_newline_paragraph_length: ", average_double_newline_paragraph_length);
						}
						else{
							//console.log("very short double paragraph");
						}
				
						if(at_sub_title && chars_since_extraction > 500){
							//console.log("Splitting paragraph at sub title");
							append_paragraph(i);
						}
						else if(newline_ahead == false && double_newline_ahead == false){
							//console.log("no single or double newline in the text ahead. Time to add a paragraph. chars_since_extraction: ", chars_since_extraction);
							if(chars_since_extraction < 500){
								console.warn("really a very short paragraph that would be added. It's become necessary to split at period level, since there is no newline over the horizon either. text_ahead: ", text_ahead);
								find_alternative_end(text_ahead);
							}
							else{
								append_paragraph(i);
							}
							
						
						}
						else if(double_newline_ahead){
							//console.log("waiting for the next double newline in the text ahead");
							// Wait for the next double newline before adding a paragraph
						}
						else{
							//console.log("no double newline ahead, but a single one is present");
						}
				
					}
					else if(at_newline){
						if(paragraph_char_count > 4){
							newline_paragraphs.push(text_since_last_newline);
							text_since_last_newline = '';
							average_newline_paragraph_length = Math.round(i / newline_paragraphs.length);
							//console.log("average_newline_paragraph_length: ", average_newline_paragraph_length);
							if(double_newline_ahead == false){
								if(newline_ahead == false){
									// uh oh
								
									if(allowed_chars_remaining > maximum_paragraph_halfway_length){
									
										if(chars_since_extraction < 500){
											console.warn("really a very short paragraph that would be added. It's become necessary to split at period level, since there is no newline over the horizon either");
											find_alternative_end(text_ahead);
										}
										// very uh oh. way too many characters remaining to quit now, but not even a single paragraph ahead?
										// Either split now, or at a period?
										else if(long_text_ahead.indexOf('\n\n') != -1){
											//console.log("adding a very short parapraph, but the next one should be longer double");
											// Might be worth it to quit now and have a nice long paragraph as the next one
											append_paragraph(i);
										}
										else if(long_text_ahead.indexOf('\n') != -1){
											//console.log("adding a very short parapraph, but the next one should be longer single");
											// Might be worth it to quit now and have a nice long paragraph as the next one
											append_paragraph(i);
										}
										else{
											console.warn("No good moment for a single paragraph split long ahead. Doing it now.");
											append_paragraph(i);
										}
									}
									else{
										append_paragraph(i);
									}
								}
								else{
									//console.log("single newline, and going to wait for the next single newline");
								}
							}
							else{
								//console.log("single newline, and there is a double newline just ahead. Waiting for that one.");
							}
						}
						else{
							//console.log("very short paragraph");
						}
					}
				}
				chars_since_extraction++;
				//update_ahead(i);
			}
			else{
				//console.log("i is trailing behind");
			}
			paragraph_char_count++;
			double_paragraph_char_count++;
			text_since_last_newline += c;
			text_since_last_double_newline += c;
			at_newline = false;
			at_double_newline = false;
			not_newline = true;
			at_sub_title = false;
			
		}
	}
	
	if(chars_since_extraction > 0){
		console.error("END\n\nchars_since_extraction: ", chars_since_extraction);
		append_paragraph(text.length);
	}
	
	paragraphs = paragraphs.reverse();
	
	for(let pp = 0; pp < paragraphs.length; pp++){
		if(pp > 0){
			if( paragraphs[pp].length > 150 && paragraphs[pp-1].endsWith(paragraphs[pp]) ){
				paragraphs[pp-1] = paragraphs[pp-1].replace(paragraphs[pp],'');
				//console.error("had to quick fix paragraphs: ", paragraphs);
				console.error("had to quick fix paragraphs");
			}
		}
	}
	
	for(let pp = 0; pp < paragraphs.length; pp++){
		paragraphs[pp] = reverseString(paragraphs[pp]);
		//console.error("&&& paragraphs: pp,length:", pp,paragraphs[pp].length, "  of ", maximum_paragraph_length);
	}
	
	//console.log("---------------------------------");
	//console.warn("----------------------------------");
	//console.error("-----------------------------------");
	//console.warn("----------------------------------");
	//console.log("---------------------------------");
	
	//var paragraphs = text.split(/(?:\r?\n)+/);
	//console.log("newline_paragraphs: ", newline_paragraphs);
	//console.log("double_newline_paragraphs: ", double_newline_paragraphs);
	//console.log("paragraphs: ", paragraphs);
	//console.log("text reconstituted from paragraphs: ", paragraphs.join('\n\n'));
	return paragraphs;
}




function prepare_do_prompt_at_line(){
	console.log("in prepare_do_prompt_at_line");
	
	switch_assistant('any_writer',true);
	
	if(window.settings.prompt_at_line == null || window.settings.prompt_at_line == ''){
		window.settings.prompt_at_line = get_translation("Write_a_paragraph_about");
	}
	
	rewrite_prompt_el.value = window.settings.prompt_at_line;
	//rewrite_dialog_selected_text_el.textContent = '';
	//document.body.classList.add('show-prompt-at-line');
	prompt_at_line_dialog_el.showModal();
	
	remove_highlight_selection();
}




function do_prompt_at_line(prompt_at_line=null){
	//console.log("in do_prompt_at_line.  window.doc_current_line_nr: ", window.doc_current_line_nr);
	
	let origin = 'line';
	
	if(typeof prompt_at_line != 'string'){
		prompt_at_line = prompt_at_line_input_el.value;
	}
	
	
	//console.log("provided prompt_at_line: ", prompt_at_line);
	if(prompt_at_line.length < 10){
		flash_message(get_translation("Command_was_not_long_enough"),4000,'fail');
		return;
	}
	
	//console.log("window.doc_current_line_nr: ", window.doc_current_line_nr);
	//console.log("window.doc_selection: ", window.doc_selection);
	
	if(window.settings.docs.open == null){
		console.error("do_prompt_at_line: no open file. Aborting.");
		return
	}
	
	if(prompt_at_line != window.settings.prompt_at_line){
		window.settings.prompt_at_line = '' + prompt_at_line;
		save_settings();
	}
	
	prompt_at_line_dialog_el.removeAttribute('open');
	
	if(typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string'){
		const prompt_at_line_command = '\n\nprompt: ' + prompt_at_line + '\n\n\n';
		insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, prompt_at_line_command);
		return
	}
	
	
	
	let cursor_pos = window.doc_selection.to;
	let cursor_pre = window.doc_selection.to - 30;
	if(cursor_pre < 0){cursor_pre = 0}
	let cursor_post = window.doc_selection.to + 30;
	if(cursor_post > window.doc_text.length-1){cursor_post = window.doc_text.length-1}
	
	let pre = window.doc_text.substring(cursor_pre,cursor_pos);
	let post = window.doc_text.substring(cursor_pos,cursor_post);
	
	//console.log("text before the cursor position: ", pre);
	//console.log("text after the cursor position: ", post);
	
	let prompt_at_line_task = {
		'prompt':prompt_at_line,
		'text': null,
		'selection':window.doc_selection,
		'pre_text':pre,
		'post_text':post,
		'line_nr':window.doc_current_line_nr,
		'origin': origin,
		'type': 'prompt_at_line',
		'state':'should_assistant',
		'desired_results':1,
		'results':[],
		'destination':'document',
		'file':window.settings.docs.open
	}
	
	window.add_task(prompt_at_line_task);
	
	//let selectedText = editor.state.doc.toString().substring(firstRange.from,firstRange.to)
	//const cursor_position = editor.state.selection;
	//console.log("cursor_position: ", cursor_position);
	
	
}




function do_blueprint(text){
	console.log("in do_blueprint. Text: ", text);
	
	if(typeof text != 'string'){
		console.error("do_blueprint: provided text was invalid: ", typeof text, text);
		return false
	}
	
	// remove all the comments from the text first
	if(text.indexOf('\n') != -1 && text.indexOf('//') != -1){
		let all_lines = text.split('\n');
		for(let al = all_lines.length-1; al >= 0; al--){
		
			if(all_lines[al].startsWith('////')){
				all_lines[al] = all_lines[al].substr(2);
			}
			else if(all_lines[al].startsWith('//') || all_lines[al].trim() == ''){
				all_lines[al] = ''; // or splice it?
			}
		}
		text = all_lines.join('\n');
	}
	
	text = '\n\n' + text;
	
	//console.log("do_blueprint: raw commands text without comments: ", text);
	
	
	let commands = text.split(/[\n]{3,}/); 
	//console.log("do_blueprint: raw split command: ", commands);
	
	//console.log("raw blueprint commands: ", commands.length, commands);
	
	// Remove empty commands, and commands in which each line starts with //
	for(let a = commands.length-1; a >= 0; a--){
		
		//console.log("do_blueprint: long command:\n" + commands[a]);
		while(commands[a].startsWith('\n')){
			commands[a] = commands[a].substr(1);
		}
		while(commands[a].endsWith('\n')){
			commands[a] = commands[a].substr(0,commands[a].length-1);
		}
		//console.log("do_blueprint: shortened command:\n" + commands[a]);
		
		// Multi-line blueprint command, which means it's simply text to be inserted into a document. In that case restoring some newlines would be useful.
		// Except if the next command is a 'continue' command.
		if(commands[a].indexOf('\n') != -1){
			if(a < (commands.length - 1) && !commands[a + 1].toLowerCase().startsWith('continue')){
				commands[a] = commands[a] + '\n';
			}
		}
		
	}
	//console.log("cleaned blueprint commands: ", commands.length, "\nccommands: ", commands);
	
	if(commands.length == 0){
		console.error("do_blueprint: commands list was empty. original input text was: ", text);
		flash_message(get_translation('There_are_no_tasks_to_process'),4000,'error');
		return false
	}
	
	
	for(let c = commands.length  -1; c >= 0; c--){
		if(commands[c].trim().length < 2){
			//console.log("do_blueprint: removing empty command:  -->" + commands[c] + "<--");
			commands.splice(c,1);
		}
	}
	
	if(window.settings.settings_complexity == 'developer'){
		flash_message("Blueprint commands: " + commands.length,1000,'info');
	}
	
	
	const initial_blueprint_commands_counter = window.blueprint_command_counter;
	
	
	
	
	// allows for a delay, where a user can fill in special fields first
	function really_add_blueprint_task(text,commands){
		//console.log("in really_add_blueprint_task.  task,commands: ", text, commands);
		
		let blueprint_parent_task = {
			'prompt':null,
			'text': text,
			'origin': 'blueprint',
			'blueprint_index':window.blueprint_counter,
			'start_blueprint_commands_counter':initial_blueprint_commands_counter,
			//'blueprint_command_index':window.blueprint_command_counter,
			'type':'blueprint',
			'state': 'parent',
			'desired_results': commands.length,
			'results':[],
			'destination':'document'
		}
	
	
		let file_loops_created = 0;
		window.blueprint_counter++;
		//window.blueprint_command_counter++;
		blueprint_parent_task = window.add_task(blueprint_parent_task);
		if(blueprint_parent_task && typeof blueprint_parent_task.index == 'number'){
			//console.log("do_blueprint: blueprint parent task was created");
			
			
			let a_task_was_added = false;
			for(let c = 0; c < commands.length; c++){
		
				//console.log("do_blueprint: adding task for command: ", commands[c]);
				let blueprint_task = {
					'prompt':null,
					'text': null,
					'parent_index':blueprint_parent_task.index,
					'origin': 'blueprint',
					'blueprint_index':window.blueprint_counter,
					'blueprint_command_index':window.blueprint_command_counter,
					'relative_blueprint_command_index':(window.blueprint_command_counter - initial_blueprint_commands_counter),
					'type':'blueprint',
					'state': 'should_blueprint',
					'transcript':commands[c],
					'destination':'document',
					'selection':{'position':'end'},
					'file':'current'
				}
				
				if(
					(
						commands[c].trim().toLowerCase() == 'for each file' 
						|| commands[c].trim().toLowerCase() == 'for each document' 
						|| commands[c].trim().toLowerCase() == 'for each video' 
						|| commands[c].trim().toLowerCase() == 'for each image'
						|| commands[c].trim().toLowerCase() == 'for each picture'
						|| commands[c].trim().toLowerCase() == 'for each photo'
						|| commands[c].trim().toLowerCase() == 'for each audio'
						|| commands[c].trim().toLowerCase() == 'for each audio file'

						|| commands[c].trim().toLowerCase() == 'voor elk bestand'
						|| commands[c].trim().toLowerCase() == 'voor elk document'
						|| commands[c].trim().toLowerCase() == 'voor elke afbeelding'
						|| commands[c].trim().toLowerCase() == 'voor elke foto'
						|| commands[c].trim().toLowerCase() == 'voor elke video'
						|| commands[c].trim().toLowerCase() == 'voor elke audio'
						|| commands[c].trim().toLowerCase() == 'voor elk audio bestand'
					)
					&& c < commands.length - 1 
					&& typeof files != 'undefined' 
					&& files != null
				){
					
					let filenames = keyz(files);
					for(let f = 0; f < filenames.length; f++){
						if(!filenames[f].toLowerCase().endsWith('.zip') && !filenames[f].toLowerCase().endsWith('.blueprint') && filenames[f] != unsaved_file_name){
							
							if(
								(
									commands[c].trim().toLowerCase().endsWith(' image') 
									|| commands[c].trim().toLowerCase().endsWith(' picture') 
									|| commands[c].trim().toLowerCase().endsWith(' photo') 
									|| commands[c].trim().toLowerCase().endsWith(' afbeelding') 
									|| commands[c].trim().toLowerCase().endsWith(' foto') 
								)
								&& !filename_is_binary_image(filenames[f])
							){
								console.log("do_blueprint: skipping file that isn't a binary image: ", filenames[f]);
								continue
							}
							
							if(
								commands[c].trim().toLowerCase().endsWith(' video') 
								&& !filename_is_video(filenames[f])
							){
								console.log("do_blueprint: skipping file that isn't a video: ", filenames[f]);
								continue
							}
							
							if(
								(
									commands[c].trim().toLowerCase().endsWith(' audio') 
									|| commands[c].trim().toLowerCase().endsWith(' audio file') 
									|| commands[c].trim().toLowerCase().endsWith(' audio bestand') 
								)
								&& !filename_is_audio(filenames[f])
							){
								console.log("do_blueprint: skipping file that isn't a video: ", filenames[f]);
								continue
							}
							
							if(	
								(
									filename_is_media(filenames[f])
									|| filename_is_binary(filenames[f])
								)
								&& commands[c].trim().toLowerCase().endsWith(' document') 
									
							){
								console.log("do_blueprint: skipping file that isn't a text document: ", filenames[f]);
								continue
							}
							
							
							let bp_task = JSON.parse(JSON.stringify(blueprint_task));
							
							bp_task['origin_file'] = {'filename':filenames[f],'folder':folder}
							bp_task['transcript'] = 'Open ' + filenames[f];
							bp_task['blueprint_index'] = window.blueprint_command_counter;
							bp_task['relative_blueprint_command_index'] = window.blueprint_command_counter - initial_blueprint_commands_counter;
							
							if(window.add_task(bp_task)){
								file_loops_created++;
								window.blueprint_command_counter++;
								a_task_was_added = true;
							}
							else{
								console.error("failed to add for-each-file blueprint task for command: ", commands[c]);
							}
							
							
							for(let t = c + 1; t < commands.length; t++){
								console.log("adding blueprint command for origin file: ", filenames[f], " --> ", commands[t]);
								let per_file_task = JSON.parse(JSON.stringify(bp_task));
								per_file_task['blueprint_for_each_file'] = true;
								per_file_task['transcript'] = commands[t];
								per_file_task['blueprint_index'] = window.blueprint_command_counter;
								per_file_task['relative_blueprint_command_index'] = window.blueprint_command_counter - initial_blueprint_commands_counter;
								
								if(window.add_task(per_file_task)){
									window.blueprint_command_counter++;
									a_task_was_added = true;
								}
								else{
									console.error("failed to add for-each-file blueprint task for command: ", commands[c]);
								}
								
							}
							
						}
					}
					if(file_loops_created == 0){
						flash_message(get_translation('There_are_no_relevant_files_for_the_blueprint'),3000,'warn');
					}
					
					
					break
				}
				
				
				if(window.add_task(blueprint_task)){
					window.blueprint_command_counter++;
					a_task_was_added = true;
				}
				else{
					console.error("failed to add blueprint task for command: ", commands[c]);
				}
		
			}
			
			if(file_loops_created > 0){
				flash_message(get_translation('Blueprint_is_looping_over_files') + ': ' + file_loops_created, 3000,'warn');
			}
			
		}
		
		blueprint_parent_task['desired_results'] = (window.blueprint_command_counter - initial_blueprint_commands_counter);
		blueprint_parent_task['end_blueprint_commands_counter'] = window.blueprint_command_counter;
		console.log("final blueprint_parent_task: ", blueprint_parent_task);
	}
	
	
	
	
	
	
	
	let fields_container_el = document.createElement('div');
	let fields = [];
	let field_elements = [];
	let fields_data = {};
	let total_fields = 0;
	
	let raw_fields = [];
	let spotted_for_each_file = false; // avoid multiple depths, 'for each file' is only allowed once
	
	for(let b = 0;  b < commands.length; b++){
		let field_els = [];
		
		
		if(commands[b].indexOf('{{') != -1 && commands[b].indexOf('}}') != -1){
			//console.log("blueprint fields: command required a field to be filled in: ", commands[b]);
			
			//let path = "/{id}/{name}/{age}";
			//const paramsPattern = /[^{}]+(?=})/g;
			const paramsPattern = /{{(.*?)}}/g;
			
			let extractParams = commands[b].match(paramsPattern);
			//console.log("blueprint fields: extractParams", extractParams);
			for(let f = 0; f < extractParams.length; f++){
				
				let raw_field = extractParams[f].substr(2,extractParams[f].length-4);
				//console.log("raw_field: ", raw_field);
				if(raw_fields.indexOf(raw_field) == -1){
					raw_fields.push(raw_field);
					
					let field_container_el = document.createElement('div');
					field_container_el.classList.add('flex-between');
					field_container_el.classList.add('blueprint-fields-item');
				
					// Label
					let label = null;
					if(raw_field.indexOf('::') != -1){
						label = raw_field.split('::')[0];
						raw_field = raw_field.substr( raw_field.indexOf('::') + 2);
					}
				
					// Select dropdown
					if(raw_field.indexOf('|') != -1){
					
						// Create dropdown label
						let label_el = document.createElement('div');
						label_el.classList.add('blueprint-fields-label');
						if(label != null){
							label_el.innerText =  get_translation(label); // perhaps there is a translation for the label. TODO: wouldn't that just create confusion about the intended language? The test of the blueprint might be in English
						
						}
						else{
							label_el.setAttribute('data-i18n','Choose');
							label_el.textContent = get_translation('Choose');
						}
						field_container_el.appendChild(label_el);
					
						// Create dropdown
						let dropdown_el = document.createElement('select');
						dropdown_el.classList.add('blueprint-field-dropdown');
						dropdown_el.classList.add('settings-dropdown');
					
						dropdown_el.setAttribute('id','blueprint-field' + b + ' - '+ f);
						//field_els.push(dropdown_el);
						let options = raw_field.split('|');
						for(let o = 0; o < options.length; o++){
						
							let option_el = document.createElement('option');
							option_el.value = options[o];
							option_el.textContent = options[o];
							if(o == 0){
								option_el.setAttribute('selected','selected');
							}
							dropdown_el.appendChild(option_el);
						}
						field_elements.push(dropdown_el);
						field_container_el.appendChild(dropdown_el);
					
					}
					
					// Textarea
					else{
					
						let field_el = document.createElement('textarea');
						field_el.setAttribute('id','blueprint-field' + b + ' - '+ f);
						if(label != null){
							//field_el.setAttribute('placeholder',label);
							field_container_el.innerHTML = '<div class="blueprint-field-label">' + get_translation(label) + '</div>';
						}
						else{
							field_container_el.innerHTML = '<div class="blueprint-field-label">' + get_translation(raw_field) + '</div>';
						}
						field_el.classList.add('blueprint-field-textarea');
						field_el.classList.add('prompt');
						
						field_elements.push(field_el);
						field_container_el.appendChild(field_el);
					}
					total_fields++;
					fields_container_el.appendChild(field_container_el);
				}
				field_els.push(raw_field);
				
			}
			
			
			
			//st = st.replace(/\{|\}/gi,''); // "getThis"
		}
		fields.push(field_els);
	}
	
	blueprint_fields_dialog_content_container_el.innerHTML = '';
	
	if(total_fields){
		blueprint_fields_dialog_content_container_el.appendChild(fields_container_el);
	
	
		
		let save_fields_button_container_el = document.createElement('form');
		save_fields_button_container_el.setAttribute('method','dialog')
		save_fields_button_container_el.classList.add('flex-between');
		
		
		// Blueprint fields cancel button
		let cancel_fields_button_el = document.createElement('button');
		cancel_fields_button_el.setAttribute('data-i18n','Cancel');
		cancel_fields_button_el.setAttribute('id','blueprint-fields-cancel-button');
		cancel_fields_button_el.textContent = get_translation('Cancel');
		cancel_fields_button_el.addEventListener('click',() => {
			//console.log("clicked on cancel Blueprint fields button");
		});
		save_fields_button_container_el.appendChild(cancel_fields_button_el);
		
		
		// Blueprint fields save button
		let save_fields_button_el = document.createElement('button');
		save_fields_button_el.setAttribute('id','blueprint-fields-save-button');
		save_fields_button_el.setAttribute('data-i18n','OK');
		save_fields_button_el.textContent = get_translation('OK');
		save_fields_button_el.addEventListener('click',() => {
			//console.log("clicked on save Blueprint fields button.  fields,field_elements: ", fields, field_elements);
		
			try{
				for(let b = 0; b < commands.length; b++){
		
					if(fields[b].length){
						
						const paramsPattern = /{{(.*?)}}/g;
						let extractParams = commands[b].match(paramsPattern);
						//console.log("blueprint fields: extractParams", extractParams);
						for(let f = 0; f < extractParams.length; f++){
							const raw_field = extractParams[f]; //.substr(2,extractParams[f].length-4);
							
							const raw_fields_index = raw_fields.indexOf( extractParams[f].substr(2,extractParams[f].length-4) );
							//console.log("raw_fields_index,raw_fields: ", raw_fields_index, raw_fields);
							
							if(raw_fields_index != -1){
								if(typeof field_elements[raw_fields_index] != 'undefined'){
									//console.log("replacing field: ", raw_field, field_elements[raw_fields_index].value);
									commands[b] = commands[b].replace(raw_field, field_elements[raw_fields_index].value);
								}
								else{
									console.error("couldn't find matching raw field input element");
								}
							}
							else{
								console.error("couldn't find matching raw field input index");
							}
						}
						//console.log(b + ". replaced all blueprint fields in command: ", commands[b] );
					}
					else{
						//console.log(b + ". command had no fields");
					}
				}
			
				really_add_blueprint_task(text,commands);
			}
			catch(err){
				console.error("caught error after clicking on save blueprint fields");
				flash_message(get_translation('An_error_occured'),3000,'fail');
			}
			
			blueprint_fields_dialog_el.close();
		
		});
		save_fields_button_container_el.appendChild(save_fields_button_el);
	
		blueprint_fields_dialog_content_container_el.appendChild(save_fields_button_container_el);
	
	
		blueprint_fields_dialog_el.showModal();
	}
	else{
		//console.log("do_blueprint: hask had no fields to fill first");
		really_add_blueprint_task(text,commands);
	}
}




//
//  PLAY DOCUMENT
//


function stop_play_document(){
	console.log("in stop_play_document");
	
	//console.warn("clearing audio queues");
	window.playing_document = false;
	change_tasks_with_origin('play_document'); // default new state for affected tasks is interrupted
	change_tasks_with_origin('blueprint');
	document.body.classList.remove('doing-blueprint');
	document.body.classList.remove('playing-document');
	document.body.classList.remove('fairytale');
	document.getElementById('playground-overlay').innerHTML = '';
	window.busy_doing_blueprint_task = false;
}
window.stop_play_document = stop_play_document;


// A task normally isn't provided, except from blueprints
function start_play_document(task=null){
	console.log("in start_play_document. task: ", task); 
	
	if(document.body.classList.contains('javascript-document')){
		console.log("start_play_document: calling toggle_execute to test the javascript (instead of playing the document)");
		toggle_execute(); // in ui.js
		return;
	}
	
	
	if(document.body.classList.contains('subtitle-document')){
		console.log("start_play_document: it's a subtitle document that possibly has a known related video file. files[current_file_name] meta: ", JSON.stringify(files[current_file_name],null,2));
		
		
		if(typeof files[current_file_name] != 'undefined' && files[current_file_name] != null && typeof files[current_file_name].origin_file != 'undefined' && files[current_file_name].origin_file != null && typeof files[current_file_name].origin_file.filename == 'string' && filename_is_media(files[current_file_name].origin_file.filename)){
			// open_file(target_filename=null,load_type=null,target_folder=null,save=false){
			
			console.log("click on play for a file with a related origin file: ", files[current_file_name].origin_file.filename, files[current_file_name]);
			if(typeof files[ files[current_file_name].origin_file.filename ] == 'string'){
				console.log("- the origin file is in the same folder: ", files[ files[current_file_name].origin_file.filename ]);
			}
			if(typeof playground_live_backups[folder + '/' + current_file_name] == 'string'){
				console.log("saving updated translation document to the subtitle meta of it's related video file: ", playground_live_backups[folder + '/' + current_file_name], "\n---META--->", files[current_file_name].origin_file.folder, files[current_file_name].origin_file.filename);
				save_file_meta('subtitle',playground_live_backups[folder + '/' + current_file_name], files[current_file_name].origin_file.folder, files[current_file_name].origin_file.filename); // save a potentially updated version of the subtitle to the file's meta data first
			}
			else if(typeof playground_saved_files[folder + '/' + current_file_name] == 'string'){
				console.log("saving a saved translation document to the subtitle meta of it's related video file: ", playground_saved_files[folder + '/' + current_file_name], "\n---META--->", files[current_file_name].origin_file.folder, files[current_file_name].origin_file.filename);
				save_file_meta('subtitle',playground_live_backups[folder + '/' + current_file_name], files[current_file_name].origin_file.folder, files[current_file_name].origin_file.filename); // save a potentially updated version of the subtitle to the file's meta data first
			}
			else{
				console.error("did not find data to save to origin file meta");
			}
			
			open_file(files[current_file_name].origin_file.filename, null, files[current_file_name].origin_file.folder)
			.then((value) => {
				
				let maximum_wait = 10;
				
				window.do_after_command = 'play_video';
				//console.log("origin_file has been opened. value: ", value);
				
				
				//console.log("origin_file has been opened. value: ", value);
				setTimeout(() => {
					let media_player_el = document.getElementById('media-player');
					if(media_player_el){
						media_player_el.play();
					}
					else{
						setTimeout(() => {
							let media_player_el = document.getElementById('media-player');
							if(media_player_el){
								media_player_el.play();
							}
						},2000);
					}
				},1000);
				
				
			})
			.catch((err) => {
				console.error("caught error trying to load origin file for a subtitle document: ", err);
				window.do_after_command = null;
			})
			
			return;
		}
		
		
	}
	
	
	if(typeof window.doc_text != 'string'){
		console.error("start_play_document: no open document? window.doc_text: ", window.doc_text);
		return false
	}
	
	let text = window.doc_text;
	if(typeof window.doc_selected_text == 'string'){
		text = window.doc_selected_text;
	}
	if(typeof text != 'string'){
		return false
	}
	
	if(typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint')){
		//console.log("start_play_document: playing a blueprint");
		do_blueprint(text);
		return true
	}

	
	if(window.doc_text.trim().length < 3){
		console.error("cannot play document that is less than 3 characters long..");
		return false
	}
	
	
	if(window.microphone_enabled){
		//console.log("start_play_document: disabling the microphone");
		disable_microphone();
	}
	
	window.enable_speaker();
	
	window.playing_document = true;
	document.body.classList.add('playing-document');
	
	let document_style = null;
	
	
	
	let imager_prompt = null;
	text = window.strip_timestamps(text);
	
	if(text.trim() == ''){
		console.error("cannot play document that is empty string");
		return false
	}
	
	let sentences = split_into_sentences(text);
	
	if(typeof current_file_name == 'string' && current_file_name.toLowerCase().endsWith('.vtt')){
		for(let s = 0; s < sentences.length; s++){
			if(sentences[s].startsWith('<v ') && sentences[s].indexOf('>') != -1){
				sentences[s] = sentences[s].split('>')[1];
			}
			if(sentences[s].startsWith('<i>')){
				sentences[s].replaceAll('<i>','');
				sentences[s].replaceAll('</i>','');
			}
		}
	}
	
	
	console.log("start_play_document:  sentences: ", sentences);
	
	let style_check_count = 5;
	if(sentences.length < style_check_count){
		style_check_count = sentences.length;
	}
	
	for(let d = 0; d < style_check_count; d++){
		let lowercased = sentences[d].toLowerCase();
		if(lowercased.startsWith('once upon a time') || lowercased.startsWith('a fairy tale by ') || lowercased.startsWith('long, long ago, in a land') || lowercased.startsWith('er was eens') || lowercased.startsWith('lang, lang geleden ') || lowercased.startsWith('lang lang geleden ')){
			console.log("Detected a fairytale");
			document_style = 'fairytale';
			
			document.body.classList.add('fairytale');
			setTimeout(() => {
				if(window.playing_document){
					document.body.classList.add('fairytale');
				}
				
			},1000);
			if(window.innerWidth > 800){
				document.body.classList.remove('chat-shrink');
			}
			
			
			setTimeout(() => {
				if(window.playing_document){
					playground_overlay_el.innerHTML = '<img src="images/fairytale_book.svg" alt="Fairytale" class="fade-in-slow"/>'; 
				}
			},2000);
			
			
			// enough (english) text to try and also generate an image
			if(lowercased.startsWith('once upon a time') && window.settings.assistant == 'text_to_image' && text.length > 500){
				if(typeof sentences[d+1] == 'string'){
					imager_prompt = 'happy, friendly, line drawing, lush, Breughel. ' +  sentences[d] + ' ' + sentences[d+1]; // get the first two sentences and use it to generate an image
					console.log("play_document: created a text_to_image prompt from the first two sentences of the fairy tale: ", imager_prompt);
					
				}
				if(typeof sentences[d+2] == 'string'){
					imager_prompt = imager_prompt  + ' ' + sentences[d+2];
				}
			}
			break
		}
	}
	
	
	
	
	
	if(text.length < 150){
		// let's take a shortcut
		let tts_task = {
			'prompt':null,
			'text': text,
			'sentence': clean_up_string_for_speaking(text),
			'selection':window.doc_selection,
			'line_nr':window.doc_current_line_nr,
			'origin':'selection',
			'type':'speak',
			'state':'should_tts',
			'desired_results':0,
			'results':[],
			'destination':'audio_player',
			'file':window.settings.docs.open
		}
		tts_task = update_pre_and_post(tts_task,{'from':window.doc_selection.from,'to':window.doc_selection.to});
		
		if(document_style != 'null'){
			tts_task['play_document_style'] = 'fairytale';
		}
		
		window.add_task(tts_task);
		return true;
	}
	
	
	// PARENT TASK
	let play_document_parent_task = {
		'prompt':null,
		'text': text,
		'selection':window.doc_selection,
		'line_nr':window.doc_current_line_nr,
		'origin': 'play_document',
		'type': 'play_document',
		'state':'parent',
		'desired_results':sentences.length,
		'results':[],
		'destination':'document',
		'assistant':'speaker',
		'file':window.settings.docs.open
	}
	if(window.doc_selection != null){
		play_document_parent_task = update_pre_and_post(play_document_parent_task,{'from':window.doc_selection.from,'to':window.doc_selection.from}); // sic
	}
	
	if(document_style != 'null'){
		play_document_parent_task['play_document_style'] = document_style;
	}
	
	//  This may get a little crazy, but this is the first instance of nested parents. A blueprint can start a play task, and then the play_document parent will have a blueprint grandparent.
	// TODO: when interrupting this task, does it bubble up properly?
	if(task != null && typeof task.parent_index == 'number'){
		console.warn("PLAY_DOCUMENT: SETTING GRANDPARENT TASK");
		play_document_parent_task['parent_index'] = task.parent_index;
		// TODO: would it be of use to also change origin to blueprint?
	}
	
	
	
	play_document_parent_task = window.add_task(play_document_parent_task);
	if(play_document_parent_task && typeof play_document_parent_task.index == 'number'){
		
		// Check if the Stable Diffusion model has already loaded?
		//if(window.cached_urls.indexOf(details.download_url) != -1){

		// Create image task for fairy tales
		if(typeof imager_prompt == 'string'){
			console.log("play_document: will also attempt to create an image");
			play_document_parent_task['desired_results'] += 1;
		
			let play_document_imager_task = {
				'prompt':imager_prompt,
				'text': text,
				'parent_index':play_document_parent_task.index,
				'origin': 'play_document',
				'type': 'image',
				'state':'should_text_to_image',
				'desired_results':1,
				'results':[],
				'destination':'document_player',
				'assistant':'text_to_image',
				//'file':window.settings.docs.open
			}
			window.add_task(play_document_imager_task);
		}

		// Add speak tasks for play_document
		for(let s = 0; s < sentences.length; s++){
			let sentence_to_speak = clean_up_string_for_speaking(sentences[s]);
			if(sentence_to_speak.trim().length){
				let play_document_task = JSON.parse(JSON.stringify(play_document_parent_task));
				play_document_task['parent_index'] = play_document_parent_task.index;
				play_document_task['sentence'] = clean_up_string_for_speaking(sentences[s]);
				play_document_task['type'] = 'speak';
				play_document_task['state'] = 'should_tts';
				play_document_task['desired_results'] = 0;
				play_document_task['origin'] = 'play_document';
				play_document_task['assistant'] = 'speak'; // hacky, but this avoids generating all the audio files. TODO should be a toggle in the task instead. Or just check the origin? If origin isn't chat, then don't generate the file.
				window.add_task(play_document_task);
			}
			
		}
	}
	
}
window.start_play_document = start_play_document;



// Required a provided cursor
// TODO: doesn't check filename yet
function update_pre_and_post(task,cursor_dict){
	//console.log("in update_pre_and_post.  task,cursor_dict: ", task,cursor_dict);
	
	text = get_latest_document_text_from_task(task);
	if(typeof text != 'string'){
		console.error("update_pre_and_post: no text to work on. Invalid file data in task?: ", task);
		return task;
	}
	
	if(typeof task == 'object' && task != null){
		//console.log("update_pre_and_post: task seems ok");
		
		let cursor_provided = false;
		if(typeof cursor_dict != 'undefined' && cursor_dict != null){
			
			if(typeof cursor_dict.from == 'number' && typeof cursor_dict.to == 'number'){
				cursor_provided = true;
			}
			else if(typeof cursor_dict.position == 'string' && typeof text == 'string'){
				if(cursor_dict.position == 'start'){
					cursor_dict = {'from':0,'to':0};
					cursor_provided = true;
				}
				else if(cursor_dict.position == 'end'){
					cursor_dict = {'from':text.length,'to':text.length};
					cursor_provided = true;
				}
			}
		}
		
		// The task may have cursor data
		if(typeof cursor_dict == 'undefined' && task.selection != null){
			//console.warn("update_pre_and_post: cursor_dict was undefined. Attempting to switch to task.selection: ", task.selection);
			if(typeof task.selection.from == 'number' && typeof task.selection.to == 'number'){
				cursor_dict = task.selection;
			}
			else if(typeof task.selection.position == 'string'){
				if(task.selection.position == 'start'){
					cursor_dict = {'from':0,'to':0};
				}
				else if(task.selection.position == 'end'){
					cursor_dict = {'from':text.length,'to':text.length};
				}
				else if(task.selection.position == 'overwrite'){
					cursor_dict = {'from':0,'to':text.length};
				}
			}
		}
		
		if(typeof cursor_dict == 'undefined' && window.doc_selection != null){
			console.warn("update_pre_and_post: cursor_dict was undefined. Switching to window.doc_selection: ", window.doc_selection);
			cursor_dict = window.doc_selection;
		}
		if(typeof cursor_dict == 'undefined' && typeof task['index'] == 'undefined' && window.active_destination == 'chat'){
			console.warn("update_pre_and_post: setting cursor dict as if at beginning of document because the task had no index yet");
			cursor_dict = {'from':0,'to':0}
		}
		
		if(typeof cursor_dict == 'object' && cursor_dict != null && typeof cursor_dict.from == 'number' && typeof cursor_dict.to == 'number'){
			//console.log("update_pre_and_post: curcor dict is valid, updating pre and post.")
			let cursor_pre = cursor_dict.from - 30;
			if(cursor_pre < 0){cursor_pre = 0}
			
			let cursor_post = cursor_dict.to + 30;
			if(cursor_post > text.length-1){cursor_post = text.length - 1}

			task['pre'] = text.substring(cursor_pre,cursor_dict.from);
			task['post'] = text.substring(cursor_dict.to,cursor_post);
			if(cursor_provided){
				//console.log("update_pre_and_post:  also updating task cursor dict to: ", cursor_dict);
				task['selection'] = cursor_dict;
			}
			//console.log("update_pre_and_post: task['pre'] is now: ", task['pre']);
			//console.log("update_pre_and_post: task['post'] is now: ", task['post']);
			if(typeof task.index != 'undefined'){
				for(let t = 0; t < window.task_queue.length; t++){
					if(window.task_queue[t].index == task.index){
						//console.log("update_pre_and_post also found item in task_queue to update");
						window.task_queue[t]['pre'] = text.substring(cursor_pre,cursor_dict.from);
						window.task_queue[t]['post'] = text.substring(cursor_dict.to,cursor_post);
						if(cursor_provided){
							//console.log("update_pre_and_post: also updating task queue task's cursor dict to: ", cursor_dict);
							window.task_queue[t]['selection'] = cursor_dict;
						}
						break
					}
				}
			}
		}
		else{
			console.error("update_pre_and_post: cannot update, no cursor position info");
		}
	}
	else{
		console.error("update_pre_and_post: task was not a valid task: ", task);
	}
	return task;
}


function get_next_sentence_from_document(task){
	//console.log("in get_next_sentence_from_document. task: ", task);
	
	let result = {
		'next_sentence':null,
		'next_sentence_ending_punctuation':null,
		'characters_to_go':null
	}
	
	let sentence_end_position = null;
	
	let selection = get_selection_from_task(task);
	if(selection == null){
		return null;
	}
	
	let previous_index_in_doc = selection.from;
	let search_start_position = previous_index_in_doc - 3;
	if(search_start_position < 0){search_start_position = 0}
	
	
	
	//console.log("get_next_sentence_from_document: search_start_position: ", search_start_position);
	// Find the next sentence
	if(search_start_position == null){
		console.warn("get_next_sentence_from_document: did not find the position to search from in the document");
		return null
	}
	
	if(window.doc_text.length - 5 < search_start_position){
		//console.log("get_next_sentence_from_document: reached end of the document");
		return null
	}
		
	let search_end_position = search_start_position + 600;
	if(search_end_position > window.doc_text.length){
		search_end_position = window.doc_text.length - 1;
	}
	//console.log("get_next_sentence_from_document: search_end_position: ", search_end_position);
	
	let sentence_source = window.doc_text.substring(search_start_position, search_end_position);
	//console.log("get_next_sentence_from_document:  getting next sentence from this chunk of text: ", sentence_source);
	let pre_lines = split_into_sentences_and_punctuation(sentence_source);
	//console.log("pre_lines: ", pre_lines);
	
	const punctuation_marks = ['.','?','!',':'];
	
	
	// the second item in the array is a punctuation mark
	if(pre_lines.length > 1 && punctuation_marks.indexOf(pre_lines[1]) != -1){
		if(pre_lines[0].length > 5){
			//console.log("get_next_sentence_from_document: using first part of pre_lines as sentence. since it's more likely that the first item in the array is a punctuation mark: ", pre_lines[0]);
			result['next_sentence'] = pre_lines[0] + pre_lines[1];
			result['next_sentence_ending_punctuation'] = pre_lines[1];
		}
		else if(pre_lines.length > 3 && pre_lines[2].length > 1 && punctuation_marks.indexOf(pre_lines[3]) != -1){
			//console.log("get_next_sentence_from_document: skipping a small first sentence, likely the tail end of the previous sentence being spoken: ", pre_lines[0] + pre_lines[1]);
			result['next_sentence'] = pre_lines[2] + pre_lines[3];
			result['next_sentence_ending_punctuation'] = pre_lines[3];
		}
		else{
			console.error("get_next_sentence_from_document: unexpected pre_lines situation");
		}
	}
	
	// the first item in the array is a punctuation mark
	if(result['next_sentence'] == null && punctuation_marks.indexOf(pre_lines[0]) != -1){
		//console.log("get_next_sentence_from_document: first part of pre_lines is a punctuation mark: ", pre_lines[0]);
		if(pre_lines.length > 2 && punctuation_marks.indexOf(pre_lines[2]) != -1){
			//console.log("get_next_sentence_from_document: using second item in pre_lines as the sentence: ", pre_lines[1]);
			result['next_sentence'] = pre_lines[1] + pre_lines[2];
			result['next_sentence_ending_punctuation'] = pre_lines[2];
			
		}
		else if(pre_lines.length == 2 && pre_lines[1].length > 10 && pre_lines[1].length < 400){
			//console.log("get_next_sentence_from_document: likely found last sentence in the document that did not end with punctuation (or a very very long unpunctuated sentence)");
			result['next_sentence'] = pre_lines[1]; //
		}
		else{
			console.error("get_next_sentence_from_document: fell through")
		}
	}
	
	if(result['next_sentence'] == null && search_start_position < 3 && pre_lines.length > 1 && punctuation_marks.indexOf(pre_lines[1]) != -1){
		//console.log("Found the next sentence. It's the first sentence in the document");
		result['next_sentence'] = pre_lines[0] + pre_lines[1];
		result['next_sentence_ending_punctuation'] = pre_lines[1];
	}
	
	//console.log("get_next_sentence_from_document: next_sentence before sanity check:", result['next_sentence']);
	
	// sanity check
	if(typeof result['next_sentence'] == 'string' && result['next_sentence'].length > 490){
		console.warn("get_next_sentence_from_document: the next sentence seems to be absurdly long, setting next_sentence to null again: ", result['next_sentence'])
		result['next_sentence'] = null;
		result['next_sentence_ending_punctuation'] = null
	}
	
	// restrict sentences to those in the selection.
	if(typeof result['next_sentence'] == 'string' && result['next_sentence'].length > 5 && typeof task.text == 'string' && task.text.length > 5){
		//console.log("get_next_sentence_from_document: the task came with a text, indicating it was started from a specific selection.. Restricting to allow only sencences that are found in that text: ", task.text);
		if(task.text.indexOf(result['next_sentence']) == -1){
			//console.log("get_next_sentence_from_document: The next sentence is not in that text, so setting next_sentence back to null from: ", result['next_sentence']);
			result['next_sentence'] = null;
		}
		else{
			//console.log("get_next_sentence_from_document: OK the sentence was found in the text");
		}
	}
	
	
	if(typeof result['next_sentence'] == 'string' && result['next_sentence'].length > 1){
		sentence_end_position = previous_index_in_doc + result['next_sentence'].length;
		//console.log("get_next_sentence_from_document: sentence_end_position: ", sentence_end_position);
		update_pre_and_post(task,{'from':sentence_end_position,'to':sentence_end_position});
		
		if(sentence_end_position > (window.doc_text - 5)){
			//console.log("get_next_sentence_from_document: REACHED END OF DOCUMENT");
			task.state = 'complete';
		}
		
		
		console.error("get_next_sentence_from_document: final next_sentence:\n\n", result['next_sentence'],"\n\n");
		/*
		if(window.speaker_enabled){
			//console.log("immediately sending next sentence to TTS queue");
			add_to_tts_queue([result['next_sentence'],''],result['next_sentence']);
		}
		*/
		
	}else{
		console.error("get_next_sentence_from_document: found sentence was too short or invalid: ", result['next_sentence']);
		result['next_sentence'] = null;
	}
	
	//console.log("\n\nget_next_sentence_from_document DONE.  next_sentence: ", result['next_sentence']);
	
	//return result
	return result['next_sentence'];
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





// Designed to re-find the intended selection, even if the document has changed in the mean time
// Provided text must be the entire document text (not the needle!)
function get_selection_from_task(task=null,text=null){
	console.log("in get_selection_from_task.  task,text:", task, text);
	/*
	if(!is_valid_task(task)){
		console.error("in get_selection_from_task: invalid task");
		return null
	}
	*/
	if(task == null){
		console.error("get_selection_from_task: provided task was null");
		return null
	}
	
	if(text == null){
		//console.log("get_selection_from_task: no text provided, will call get_latest_document_text_from_task");
		text = get_latest_document_text_from_task(task);
		
	}
	if(typeof text != 'string'){
		//console.error("in get_selection_from_task: no valid text to operate on");
		console.error("get_selection_from_task: aborting, no valid text to operate on. Not provided, and could not get text from task: ", task);
		return null
	}
	console.log("get_selection_from_task: got full text: ", text);
	
	//let selection = {'from':null,'to':null}
	let from_index_in_doc = null;
	let to_index_in_doc = null;
	
	
	//  try to find desired injection point based on surrounding text
	if(from_index_in_doc == null && to_index_in_doc == null && typeof task.pre == 'string' && typeof task.post == 'string'){
		//console.log("in get_selection_from_task: OK, pre and post exist: ", task.pre, task.post);
		
		if(typeof task.pre == 'string' && task.pre.length == 30 && text.indexOf(task.pre) != -1){
			const index_in_doc = text.indexOf(task.pre);
			//console.log("get_next_sentence_from_document: spotted pre in document at index: ", from_index_in_doc);
			from_index_in_doc = index_in_doc + task.pre.length;
		}
		
		if(typeof task.post == 'string' && task.post.length == 30 && text.indexOf(task.post) != -1){
			to_index_in_doc = text.indexOf(task.post);
			//console.log("get_next_sentence_from_document: spotted post in document at index: ", to_index_in_doc);
			if(from_index_in_doc == null){
				
				if(typeof task.text == 'string' && typeof task.pre == 'string' ){
					console.error("reconstruct selection: test: ", task.text.length + task.pre.length, " =?= ", from_index_in_doc);
				}
				
				if(typeof task.text == 'string' && typeof task.pre == 'string' && task.text.length + task.pre.length == from_index_in_doc ){
					//console.log("get_selection_from_task: the selection was very near the beginning of the document");
				}
				// Could cast a wider net and see if the text is in there.
				else{
					from_index_in_doc = text.indexOf(task.post);
				}
				
			}
		}
		
		if(from_index_in_doc != null && to_index_in_doc == null){
			//console.log("to was null, but from was not: ", from_index_in_doc);
			to_index_in_doc = from_index_in_doc
		}
		else if(from_index_in_doc == null && to_index_in_doc != null){
			//console.log("from was null, but to was not: ", to_index_in_doc);
			from_index_in_doc = to_index_in_doc
		}
		
		if(from_index_in_doc == null && to_index_in_doc == null){
			//console.warn("in get_selection_from_task: unable to reconstruct selection from pre and post.  task: ", task);
		}
	}
	
	// This is a little risky, as the selection may have shifted if the user has kept on manipulating the document
	if(from_index_in_doc == null && to_index_in_doc == null){
		if(typeof task.selection == 'object' && task.selection != null && typeof task.selection.from == 'number' && typeof task.selection.to == 'number'){
			//console.log("get_selection_from_task: falling back to task.selection: ", task.selection);
			from_index_in_doc = task.selection.from;
			to_index_in_doc = task.selection.to;
		}
		else{
			//console.warn("get_selection_from_task: no selection object in task to allow for cursor reconstruction.  task:", task);
		}
	}
	
	
	
	// TODO: fall back to line number
	if(from_index_in_doc == null && to_index_in_doc == null){
		if(typeof task.line_nr == 'number'){
			//console.log("in get_selection_from_task: WARNING, pre and/or post do not exist, falling back to line number"); // but that can only work if the text is the currently open document, since then codemirror can turn a line number into a string
		}
		else{
			//console.warn("get_selection_from_task: no line_nr in task to allow for cursor reconstruction.  task:", task);
		}
	}
	
	
	if(from_index_in_doc == null && to_index_in_doc == null){
		if(typeof task.sentence == 'string' && task.sentence.length > 1 && typeof text == 'string'){ // && typeof task.type == 'string' && task.type == 'speak'
			console.log("get_selection_from_task: attempting to find sentence to be spoken in text: ", task.sentence, text);
			const sentence_start_position_in_text = text.indexOf(task.sentence);
			if(sentence_start_position_in_text != -1){
				console.log("get_selection_from_task: found the sentence at position: ", sentence_start_position_in_text);
				from_index_in_doc = sentence_start_position_in_text;
				to_index_in_doc = sentence_start_position_in_text + task.sentence.length;
			}
			else{
				console.warn("get_selection_from_task: could not reconstruct cursor from sentence either.  task: ", task);
			}
		}
		else{
			console.warn("get_selection_from_task: no data in task to allow for cursor reconstruction.  task: ", task);
		}
	}
	
	
	if(typeof from_index_in_doc == 'number' && typeof to_index_in_doc == 'number'){
		console.log("get_selection_from_task: succesfully resonstructed cursor.  from_index_in_doc,to_index_in_doc: ", from_index_in_doc, to_index_in_doc);
		return {'from':from_index_in_doc, 'to':to_index_in_doc}
	}
	else{
		console.error("get_selection_from_task: cursor reconstruction failed.  task: ", task);
	}
	
	return null
}



function highlight_selection_from_task(task,split_on=null){
	console.log("in highlight_selection_from_task. Task: ", task);
	if(typeof task == 'undefined' || task == null){
		console.error("highlight_selection_from_task: invalid task provided: ", task);
		return null;
	}
	
	if(typeof task.file != 'undefined' && task.file != null && typeof task.file.filename == 'string' && typeof task.file.folder == 'string'){
		if(task.file.filename == current_file_name && task.file.folder == folder){
			let selection = get_selection_from_task(task);
			if(selection){
				console.log("highlight_selection_from_task:  got selection: ", selection);
				highlight_selection(selection,split_on);
				return selection
			}
			else{
				console.error("highlight_selection_from_task: get_selection_from_task failed to reconstruct cursor");
			}
		}
		else{
			console.error("highlight_selection_from_task: aborting, file/folder in task is not currently open file.  task: ", task);
		}
	}
	else{
		console.error("highlight_selection_from_task: no file data in provided task: ", task);
	}
	return null
}







// CODEMIRROR EDITOR FUNCTIONS



// search string must be at least 3 characters
// Returns a codemirror cursor object with the from and to characters index

// TODO: upgrade this to work based on a task (to get the filename), and extract the cursor based on live_backups data instead
function search_in_doc(task, needle=null,must_be_unique=false){
	//console.log("in search_in_doc. task,needle: ", task,typeof needle, needle);
	let needle_length = 0;
	if(typeof needle == 'string'){
		needle_length = needle.length;
	}
	
	if(typeof needle == 'string' && needle.length > 0 && typeof task != 'undefined' && task != null && typeof task.file != 'undefined' && task.file != null && typeof task.file.filename == 'string' && typeof task.file.folder == 'string'){
		//console.log("search_in_doc: needle: ", typeof needle, needle);
		//const needle_length = needle.lenght;
		
		//console.log("search_in_doc: needle_length: ", typeof needle_length, needle_length);
		const needle_index = playground_live_backups[task.file.folder + '/' + task.file.filename].indexOf(needle);
		const last_needle_index = playground_live_backups[task.file.folder + '/' + task.file.filename].lastIndexOf(needle);
		if(needle_index != -1){
			//console.log("search_in_doc: found it! needle_index: ", needle_index);
			if(needle_index != last_needle_index){
				console.error("search_in_doc:  there is more than one occurence of the needle in the document!");
			}
			if(needle_index == last_needle_index || must_be_unique == false){
				const to_index = needle_index + needle_length;
				//console.log("to_index: ", typeof to_index, to_index);
				return {'from':needle_index, 'to': to_index};
			}
			
		}
	}
	
	return null;
}


// Task here is only needed here to know which file to search in
function search_and_replace(task,needle,replacement){
	//console.log("in search_and_replace.  task,needle,replacement: ", task,"\n\nNEEDLE:\n",needle,"\n\nREPLACEMENT:\n",replacement);
	if(typeof needle == 'string' && needle.length > 0 && typeof task != 'undefined' && task != null && typeof task.file != 'undefined' && task.file != null && ((typeof task.file.filename == 'string' && typeof task.file.folder == 'string') || task.file === 'current')){
		
		if(typeof task.file == 'string' && task.file == 'current'){
			if(window.settings.docs.open == null){
				console.error("search_and_replace: aborting: the current open file should be used, but there is no open file. window.settings.docs.open is null");
				return false
			}
			task.file = window.settings.docs.open;
		}
		
		
		
		if(window.settings.docs.open != null && is_task_for_currently_open_document(task)){
			let needle_cursor = search_in_doc(task,needle);
			//console.log("search_and_replace: needle_cursor: ", needle_cursor);
			if(needle_cursor == null){
				console.error("search_and_replace: could not find a needle_cursor based on the needle: ", needle);
				
				if(typeof task.type == 'string' && task.type == 'continue' && needle.length > 40 && typeof window.doc_text == 'string'){
					let shortening_needle_worked = false;
					for(let sn = 1; sn < 15; sn++){
						needle = needle.substr(0,needle.length - sn);
						needle_cursor = search_in_doc(task,needle);
						if(needle_cursor != null && typeof needle_cursor.to == 'number'){
							console.warn("search_and_replace: had to hack continue task by shortening the needle by X characters: ", sn, needle);
							shortening_needle_worked = true;
							if(needle_cursor.to >= (window.doc_text.length - 50)){
								needle_cursor.to = window.doc_text.length;
							}
							
						}
					}
					
					if(shortening_needle_worked == false){
						return false
					}
				}
				else{
					return false
				}
				
				
			}
			/*
		    const update = editor.state.update({changes: {from:needle_cursor.from, to:needle_cursor.to, insert: replacement}});
			update.addToHistory.of(true);
		    editor.update([update]);
			*/
			if(typeof needle_cursor.from == 'number' && typeof needle_cursor.to == 'number'){
				
			    const update = editor.state.update({changes: {from:needle_cursor.from, to:needle_cursor.to, insert: replacement}});
				//update.addToHistory.of(false);
				update['addToHistory'] = true; // ,Transaction.addToHistory.of(false)
				//transaction['addToHistory'] = true;
			    editor.update([update]);
				/*
				editor.dispatch({
					changes: {from:needle_cursor.from, to:needle_cursor.to, insert: replacement}
				})
				*/
				return true;
			}
			else{
				return false
			}
			
			
		}
		else if(typeof playground_live_backups[task.file.folder + '/' + task.file.filename] == 'string'){
			//console.log("search_and_replace: the target document is not currently open.  task.file, window.settings.docs.open: ", task.file, " =?= ", window.settings.docs.open);
			if(playground_live_backups[task.file.folder + '/' + task.file.filename].indexOf(needle) != -1){
				playground_live_backups[task.file.folder + '/' + task.file.filename].replace(needle,replacement);
				return true
			}
		}
		
		
	}
	else{
		console.error("search_and_replace: task without file data, or invalid search string.  task,needle: ", task, needle);
	}
	
	return false
}
window.search_and_replace = search_and_replace;



function get_latest_document_text_from_task(task=null){
	//console.log("in get_latest_document_text_from_task. task: ", task);
	if(typeof task == 'undefined' || task == null){
		console.error("get_latest_document_text_from_task:  invalid task provided");
		return null
	}
	if(typeof task.file == 'object' && task.file != null && typeof task.file.filename == 'string' && typeof task.file.folder == 'string'){
		//console.log("get_latest_document_text_from_task:  getting text from file: ", task.file);
		const file_path = task.file.folder + '/' + task.file.filename;
		if(typeof playground_live_backups[file_path] == 'string' && !playground_live_backups[file_path].startsWith('_PLAYGROUND_BINARY_')){
			//console.log("get_latest_document_text_from_task: GOT IT: ", playground_live_backups[file_path]);
			return playground_live_backups[file_path];
		}
		else if(typeof playground_saved_files[file_path] == 'string' && !playground_saved_files[file_path].startsWith('_PLAYGROUND_BINARY_')){
			//console.log("get_latest_document_text_from_task: GOT IT: ", playground_live_backups[file_path]);
			return playground_saved_files[file_path];
		}
		else{
			console.error("get_latest_document_text_from_task:  could not find file in playground_live_backups. missing file_path: ", file_path);
			return null
		}
	}
	else{
		console.error("get_latest_document_text_from_task:  task had no valid file object");
		return null
	}	
}
window.get_latest_document_text_from_task = get_latest_document_text_from_task;


// calls insrt into document with cursor set to overwrite all content
function set_latest_document_text_from_task(task=null,content=null){
	//console.log("in set_latest_document_text_from_task.  task,content: ", task, content);
	if(task == null || typeof content != 'string'){
		console.error("set_latest_document_text_from_task:  invald input. task, content: ", task, content);
		return
	}
	//console.log("in set_latest_document_text_from_task. task: ", task);
	if(typeof task == 'undefined' || task == null){
		console.error("set_latest_document_text_from_task:  invalid task provided");
		return false
	}
	if(typeof task.file == 'object' && task.file != null && typeof task.file.filename == 'string' && typeof task.file.folder == 'string'){
		//console.log("get_latest_document_text_from_task:  getting text from file: ", task.file);
		const file_path = task.file.folder + '/' + task.file.filename;
		if(typeof playground_live_backups[file_path] == 'string'){
			//console.log("get_latest_document_text_from_task: GOT IT: ", playground_live_backups[file_path]);
			insert_into_document(task,content,{"position":"overwrite"});
		}
		else if(typeof playground_saved_files[file_path] == 'string'){
			//console.log("get_latest_document_text_from_task: GOT IT: ", playground_live_backups[file_path]);
			insert_into_document(task,content,{"position":"overwrite"});
		}
		else{
			console.error("set_latest_document_text_from_task:  could not find file in playground_live_backups. missing file_path: ", file_path);
			return false
		}
	}
	else{
		console.error("set_latest_document_text_from_task:  task had no valid file object? ", task);
		return false
	}	
}



function create_insert_into_doc_buttons(message){
	//console.log("in create_insert_into_doc_buttons. message: ", message);
	
	let doc_buttons_container_el = document.createElement('div');
	doc_buttons_container_el.classList.add('bubble-buttons-container');
	
	if(typeof message != 'string'){
		return doc_buttons_container_el;
	}
	
	// Copy to clipboard
	
	let copy_to_clipboard_button_el = document.createElement('div');
	copy_to_clipboard_button_el.classList.add('bubble-copy-to-clipboard-button');
	copy_to_clipboard_button_el.classList.add('bubble-doc-button');
	copy_to_clipboard_button_el.innerHTML = '<div class="bubble-copy-to-clipboard-button-icon-wrapper center" title="' + get_translation('Copy') + '"><img class="bubble-copy-to-clipboard-button-icon" src="images/copy_to_clipboard.svg" width="12" height="12" alt="' + get_translation('Copy') + '"></div>';
	copy_to_clipboard_button_el.addEventListener('click',(event) => {
		//console.log("add_chat_message: clicked on insert into doc button");
		copy_to_clipboard_button_el.classList.add('opacity0');
		copy_to_clipboard_button_el.classList.add('no-click-events');
		setTimeout(() => {
			copy_to_clipboard_button_el.classList.remove('opacity0');
			copy_to_clipboard_button_el.classList.remove('no-click-events');
		},1000);
		
		navigator.clipboard.writeText(message);
		flash_message(get_translation("Copied_text_to_clipboard"));
	});
	doc_buttons_container_el.appendChild(copy_to_clipboard_button_el);
	
	
	// Insert into document
	
	if(message.length > 150 || message.split('\n').length > 3){
		let insert_into_doc_button_el = document.createElement('div');
		insert_into_doc_button_el.classList.add('bubble-insert-into-doc-button');
		insert_into_doc_button_el.classList.add('bubble-doc-button');
		insert_into_doc_button_el.setAttribute('title',get_translation('Insert'));
		insert_into_doc_button_el.textContent = '📄';
		insert_into_doc_button_el.addEventListener('click',(event) => {
			//console.log("add_chat_message: clicked on insert into doc button");
			insert_into_doc_button_el.classList.add('opacity0');
			insert_into_doc_button_el.classList.add('no-click-events');
			setTimeout(() => {
				insert_into_doc_button_el.classList.remove('opacity0');
				insert_into_doc_button_el.classList.remove('no-click-events');
			},4000);
			if(window.doc_selection){
				insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection},'\n' + message + '\n');
			}
			else{
				console.error("insert_into_document_button -> cannot insert, no valid window.doc_selection: ", window.doc_selection)
			}
		
		});
		doc_buttons_container_el.appendChild(insert_into_doc_button_el);
	
	
		// Create new document
	
		let create_new_doc_button_el = document.createElement('div');
		create_new_doc_button_el.classList.add('bubble-new-doc-button');
		create_new_doc_button_el.classList.add('bubble-doc-button');
		create_new_doc_button_el.classList.add('add-icon');
		create_new_doc_button_el.setAttribute('title',get_translation('New_document'));
		create_new_doc_button_el.textContent = '📄';
	
		create_new_doc_button_el.addEventListener('click',(event) => {
			//console.log("add_chat_message: clicked on create new doc button");
			create_new_doc_button_el.classList.add('opacity0');
			create_new_doc_button_el.classList.add('no-click-events');
			setTimeout(() => {
				create_new_doc_button_el.classList.remove('opacity0');
				create_new_doc_button_el.classList.remove('no-click-events');
			},4000);
			window.show_files_tab(); // only shows it if the sidebar is already open
			create_new_document(message);
		});
		doc_buttons_container_el.appendChild(create_new_doc_button_el);
	}
	
	
	return doc_buttons_container_el;
}
window.create_insert_into_doc_buttons = create_insert_into_doc_buttons;



function insert_into_document(task=null,content=null,cursor=null){
	console.log("in insert_into_document.  task,content,cursor: ", task,content,cursor);
	if(typeof window.doc_text == 'string'){
		console.log("insert_into_document: window.doc_text:\n" + window.doc_text.substr(0,60) + "...");
	}
	else{
		console.warn("insert_into_document: window.doc_text is not a string: ", window.doc_text);
	}
	
	
	if(task==null){
		console.error("insert_into_document: task was null. aborting");
		return false;
	}
	
	if(typeof task.file == 'undefined' || task.file == null){
		console.error("insert_into_document: task had no file data. aborting");
		return false;
	}
	
	if(typeof content != 'string'){
		console.error("insert_into_doc: provided content was invalid. aborting. content: ", content);
		return false;
	}
	
	if(window.settings.docs.open != null && task.file.filename == window.settings.docs.open.filename && task.file.folder == window.settings.docs.open.folder){
		if(typeof window.doc_text == 'string' && window.doc_text.startsWith('_PLAYGROUND_BINARY_')){
			console.error("insert_into_document: cannot insert into (currently open) binary file");
			return false
		}
		
		if(typeof task.origin == 'string' && task.origin == 'voice' && task.file.filename.endsWith('_papeg_ai_conversation.json')){
			console.error("insert_into_document: cannot insert voice dictation into (currently open) _papeg_ai_conversation.json");
			return false
		}
	}
	else if(typeof playground_live_backups[task.file.folder + '/' + task.file.filename] == 'string'){
		if(playground_live_backups[task.file.folder + '/' + task.file.filename].startsWith('_PLAYGROUND_BINARY_')){
			console.error("insert_into_document: cannot insert into binary file.   task.file, playground_live_backups[task.file.folder + '/' + task.file.filename]: ", task.file, playground_live_backups[task.file.folder + '/' + task.file.filename]);
			return false;
		}
	}
	
	
	
	if(typeof task.file == 'string' && task.file == 'current'){
		// allow through
		//console.log("insert_into_document: task.file was 'current'. Setting file data to end of currently open file");
		task.file = {'filename':current_file_name,'folder':folder}
		task.selection = {'position':'end'}
	}
	else if(typeof task.file.filename != 'string' || typeof task.file.folder != 'string'){
		console.error("insert_into_document: task had file object, but no filename or folder data. aborting");
		return false;
	}
	if(window.busy_doing_blueprint_task && typeof task.file == 'object' && typeof task.file.filename == 'string' && task.file.filename.endsWith('.blueprint') ){
		console.error("insert_into_document: aborting, will not add blueprint results into a blueprint file");
		return
	}
	
	if(cursor == null && window.doc_selection != 'undefined' && window.doc_selection != null && typeof task.file == 'object' && typeof task.file.filename == 'string' && task.file.filename == current_file_name && window.settings.docs.open != null){
		cursor = window.doc_selection;s
		console.error("insert_into_document: using window.doc_selection");
	}
	
	if(cursor == null && typeof task.selection != 'undefined' && task.selection != null){
		cursor = task.selection;
		console.error("insert_into_document: quickly copied cursor from task: ", cursor, task);
	}
	
	if(window.settings.docs.open != null){
		window.doc_length = editor.state.doc.toString().length;
	}
	
	
	if(typeof playground_live_backups[task.file.folder + '/' + task.file.filename] != 'string' && typeof playground_saved_files[task.file.folder + '/' + task.file.filename] == 'string' && !playground_saved_files[task.file.folder + '/' + task.file.filename].startsWith('_PLAYGROUND_BINARY_')){
		playground_live_backups[task.file.folder + '/' + task.file.filename] = playground_saved_files[task.file.folder + '/' + task.file.filename];
	}
	
	
	// Handle special "position" cursor, and turn it into normal from-to cursor. Or just take a shortcut and insert immediately.
	if(typeof cursor == 'object' && cursor != null && typeof cursor.position == 'string'){
		if(cursor.position == 'end'){
			if(typeof task.file == 'object' && task.file != null){
				
				if(window.settings.docs.open != null && task.file.filename == window.settings.docs.open.filename && task.file.folder == window.settings.docs.open.folder){
					console.log("insert_into_document: the content is for the currently open document");
					
					if(typeof window.doc_length == 'number'){
						//console.log("insert_into_document: cursor position is set to end of currently open document");
						
						
						// SPECIAL CASE: APPEND TO JSON
						// window.settings.assistant == 'scribe' && 
						if(task.file.filename.endsWith('.json') && typeof window.doc_text == 'string' && window.doc_text.startsWith('[') && window.doc_text.endsWith(']')){
							
							try{
								// Ideally, we parse the existing JSON and the addition, and stringify the concatenation of the two
								let old_json = JSON.parse(window.doc_text);
								let addition = JSON.parse(content);
								if(typeof old_json != 'undefined' && old_json != null && Array.isArray(old_json) && typeof addition != 'undefined' && addition != null && Array.isArray(addition)){
									old_json = old_json.concat(addition);
									content = JSON.stringify(old_json,null,4);
									editor.dispatch({
										changes: {from:0, to:doc_length, insert: content},
										selection: {anchor: 0},
									});
									update_pre_and_post(task,{'from':content.length,'to':content.length});
									console.log("insert_into_document: used JSON.parse to cleanly insert the new addition into the open JSON document");
									return true
								}
							}
							catch(err){
								console.error("was unable to parse JSON document's contents: ", err);
								
								if(content.startsWith('[') && content.endsWith(']')){
									console.log("insert_into_document: stripping outer square brackets from json string");
									content = content.substr(1,content.length-2);
								}
								// place in between the square brackets
								if(window.doc_text == '[]'){
									cursor = {'from':window.doc_length-1, 'to':window.doc_length-1} 
									content += '\n';
								}
								else{
									cursor = {'from':window.doc_length-2, 'to':window.doc_length-2}
									if(content.startsWith(' ,')){
										content = content.substr(1);
									}
								}
							}
							
							
						}
						else{
							cursor = {'from':window.doc_length, 'to':window.doc_length} // TODO: check if the -1 is necessary
						}
						
					}
					else{
						console.error("no valid window.doc_length for currently open document? window.doc_length: ", window.doc_length);
						return false
					}
				}
				else if(typeof playground_live_backups[task.file.folder + '/' + task.file.filename] == 'string'){
					//console.log("insert_into_document: position: end: the content is for a document that is not currently open.  task.file, window.settings.docs.open: ", task.file, " =?= ", window.settings.docs.open);
					if(!playground_live_backups[task.file.folder + '/' + task.file.filename].startsWith('_PLAYGROUND_BINARY_')){
						
						

						// SPECIAL CASE: APPEND TO JSON
						// window.settings.assistant == 'scribe' && 
						/*
						if(task.file.filename.endsWith('.json') && typeof playground_live_backups[task.file.folder + '/' + task.file.filename] == 'string' && playground_live_backups[task.file.folder + '/' + task.file.filename] == ''){
							console.warn("insert_into_document: the JSON file was completely empty");
							if(content.startsWith('[') && content.endsWith(']')){
								
							}
						}
						*/
						
						if(task.file.filename.endsWith('.json') && typeof playground_live_backups[task.file.folder + '/' + task.file.filename] == 'string' && playground_live_backups[task.file.folder + '/' + task.file.filename].startsWith('[') && playground_live_backups[task.file.folder + '/' + task.file.filename].endsWith(']')){
							
							if(content.startsWith('[') && content.endsWith(']')){
								console.log("insert_into_document: inserting content into JSON document that (perhaps also) is wrapped in with square brackets: ", content.substr(0,30) + "...");
								try{
									// Ideally, we parse the existing JSON and the addition, and stringify the concatenation of the two
									let old_json = JSON.parse(playground_live_backups[task.file.folder + '/' + task.file.filename]);
									let addition = JSON.parse(content);
									if(typeof old_json != 'undefined' && old_json != null && Array.isArray(old_json) && typeof addition != 'undefined' && addition != null && Array.isArray(addition)){
										old_json = old_json.concat(addition);
										playground_live_backups[task.file.folder + '/' + task.file.filename] = JSON.stringify(old_json,null,4);
										console.log("insert_into_document: used JSON.parse to cleanly insert the new addition to the (not currently open) JSON document");
										//update_pre_and_post(task,{'from':playground_live_backups[task.file.folder + '/' + task.file.filename].length - (content.length + 1),'to':playground_live_backups[task.file.folder + '/' + task.file.filename].length - 1});
										//return true
									}
								}
								catch(err){
									console.error("insert_into_document: caught error parsing live backup of JSON document, or the content addition: ", err);
								
									console.log("insert_into_document: falling back to messy string manipulation to append to JSON document");
									
									if(playground_live_backups[task.file.folder + '/' + task.file.filename] == '[]'){
										playground_live_backups[task.file.folder + '/' + task.file.filename] = content;
									}
									else{
										// place in between the square brackets
										content = content.substr(1,content.length-2);
										if(content.startsWith(' ,')){
											content = content.substr(1);
										}
										playground_live_backups[task.file.folder + '/' + task.file.filename] = playground_live_backups[task.file.folder + '/' + task.file.filename].substr(0,playground_live_backups[task.file.folder + '/' + task.file.filename].length - 1) + content + '\n]';
									}
								}
							}
							else{
								if(content.length > 60){
									console.log("insert_into_document: inserting content into JSON document, but the addition does not seem to be wrapped in square brackets: ", content.substr(0,30) + " ... " + content.substr(content.length - 30));
								}
								else{
									console.log("insert_into_document: inserting content into JSON document, but the addition does not seem to be wrapped in square brackets: ", content);
								}
								playground_live_backups[task.file.folder + '/' + task.file.filename] += content;
							}
							
						}
						else{
							if(content.length > 60){
								console.log("insert_into_document: inserting content into JSON document, but the existing content not seem to be wrapped in square brackets: ", content.substr(0,30) + " ... " + content.substr(content.length - 30));
							}
							else{
								console.log("insert_into_document: inserting content into JSON document, but the existing content does not seem to be wrapped in square brackets: ", content);
							}
							playground_live_backups[task.file.folder + '/' + task.file.filename] += content;
						}
						
						
						
						savr(task.file.folder + '/playground_backup_' + task.file.filename, playground_live_backups[task.file.folder + '/' + task.file.filename]);
						//save_file(current_file_name,code);
						//save_file(task.file.filename,playground_live_backups[task.file.folder + '/' + task.file.filename],'browser',task.file.folder);
						//save_file_meta('loaded',true);
						return true
					}
					else{
						console.error("almost inserted text into binary file: ", task.file.filename);
						return false
					}
					
				}
				else{
					console.error("insert_into_document: does the file exist?");
				}
				
			}
			
		}
		else if(cursor.position == 'start'){
			cursor = {'from':0,'to':0};
			
			if(window.settings.docs.open != null && task.file.filename == window.settings.docs.open.filename && task.file.folder == window.settings.docs.open.folder){
				//console.log("insert_into_document: the content should be prepended to the currently open document");
				
				editor.dispatch({
					changes: {from:0, to:0, insert: content},
					selection: {anchor: 1},
				});
				update_pre_and_post(task,{'from':content.length,'to':content.length});
				return true
				
			}
			else if(typeof playground_live_backups[task.file.folder + '/' + task.file.filename] == 'string'){
				//console.log("insert_into_document: position: start: the content is for a document that is not currently open: ", task.file, " =?= ",window.settings.docs.open);
				
				if(!playground_live_backups[task.file.folder + '/' + task.file.filename].startsWith('_PLAYGROUND_BINARY_')){
					playground_live_backups[task.file.folder + '/' + task.file.filename] = content + playground_live_backups[task.file.folder + '/' + task.file.filename];
					savr(task.file.folder + '/playground_backup_' + task.file.filename, playground_live_backups[task.file.folder + '/' + task.file.filename]);
					return true
				}
				else{
					console.error("insert_into_document: almost inserted text into binary file: ", task.file.filename);
					return
				}
				
			}
			else{
				console.error("insert_into_document: does the file exist?");
			}
			
		}
		else if(cursor.position == 'overwrite'){
			cursor = {'from':0,'to':0};
			console.log("insert_into_document: overwrite requested.  current_file_name: ", current_file_name);
			if(typeof playground_live_backups[task.file.folder + '/' + task.file.filename] == 'string' && playground_live_backups[task.file.folder + '/' + task.file.filename].startsWith('_PLAYGROUND_BINARY_')){
				console.error("insert_into_document: live_backups: almost overwrote a binary file: ", task.file.filename);
			}
			else if(typeof playground_saved_files[task.file.folder + '/' + task.file.filename] == 'string' && playground_saved_files[task.file.folder + '/' + task.file.filename].startsWith('_PLAYGROUND_BINARY_')){
				console.error("insert_into_document: saved_files: almost overwrote a binary file: ", task.file.filename);
			}
			else{
				
				if( typeof current_file_name == 'string' && typeof task.file.folder == 'string' && task.file.folder == folder && task.file.filename == current_file_name){ // window.settings.docs.open != null && task.file.filename == window.settings.docs.open.filename && task.file.folder == window.settings.docs.open.folder
					console.log("insert_into_document: the content should overwrite the currently open document. window.doc_text. replacing: " + window.doc_text.substr(0,20) + "...");
				
					//let doc_length = editor.state.doc.toString().length;
					
					
					editor.dispatch({
						changes: {from:0, to:window.doc_length, insert: content},
						selection: {anchor: 0},
					});
					update_pre_and_post(task,{'from':content.length,'to':content.length});
					return true
				
				}
				else if(typeof playground_live_backups[task.file.folder + '/' + task.file.filename] == 'string'){
					console.log("insert_into_document: position: start: the content to overwrite is for a document that is not currently open: ", task.file, " =?= ",window.settings.docs.open);
				
					if(
						(typeof playground_live_backups[task.file.folder + '/' + task.file.filename] != 'string' && !filename_is_binary(task.file.filename))
						|| (typeof playground_live_backups[task.file.folder + '/' + task.file.filename] == 'string' && !playground_live_backups[task.file.folder + '/' + task.file.filename].startsWith('_PLAYGROUND_BINARY_'))
					){
						playground_live_backups[task.file.folder + '/' + task.file.filename] = content;
						savr(task.file.folder + '/playground_backup_' + task.file.filename, content);
						return true
					}
					else{
						console.error("insert_into_document: almost inserted text into binary file: ", task.file.filename);
						return
					}
				
				
				}
				else if(typeof playground_saved_files[task.file.folder + '/' + task.file.filename] == 'string'){
					console.log("insert_into_document: position: start: the content is for a document that is not currently open: ", task.file, " =?= ",window.settings.docs.open);
				
					if(
						(typeof playground_saved_files[task.file.folder + '/' + task.file.filename] != 'string' && !filename_is_binary(task.file.filename))
						|| (typeof playground_saved_files[task.file.folder + '/' + task.file.filename] == 'string' && !playground_saved_files[task.file.folder + '/' + task.file.filename].startsWith('_PLAYGROUND_BINARY_'))
					){
						playground_saved_files[task.file.folder + '/' + task.file.filename] = content;
						savr(task.file.folder + '/' + task.file.filename, content);
						return true
					}
					else{
						console.error("nsert_into_document: almost inserted text into binary file: ", task.file.filename);
						return
					}
				
				}
				else{
					console.error("insert_into_document: does the file exist?  task: ", task);
				}
			}
			
			
		}
		else{
			console.error("insert_into_document: unsupported 'position' value, cannot create a cursor");
			return false
		}
		
	}
	
	else if(cursor == null || (typeof cursor == 'object' && cursor != null && (typeof cursor.from != 'number' || typeof cursor.to != 'number'))){
		//console.log("insert_into_document: cursor was not overridden, will use get_selection_from_task to reconstruct cursor");
		cursor = get_selection_from_task(task);
		//console.log("insert_into_document: got cursor from task: ", cursor);
	}

	if(cursor != null && typeof cursor.from == 'number' && typeof cursor.to == 'number'){
		//console.log("insert_into_doc: inserting content at cursor: ", cursor);
		
		if(window.settings.docs.open != null && task.file.filename == window.settings.docs.open.filename && task.file.folder == window.settings.docs.open.folder){
			//console.log("insert_into_document: the content is for the currently open document");
			
			editor.dispatch({
				changes: {from:cursor.from, to:cursor.to, insert: content},
				selection: {anchor: cursor.from + content.length},
        		//scrollIntoView: true
			});
			update_pre_and_post(task,{'from':cursor.from + content.length, 'to':cursor.from + content.length});
			
			if( (cursor.from + content.length) > window.doc_text.length - 3){
				//console.log("insert_into_doc: inserted at the end of the document");
				if(window.active_destination != 'document' && window.innerWidth > 640){
					//console.log("insert_into_doc: inserted text at and of the document, and the document does not have focus. Scrolling down to the new end");
					setTimeout(() => {
						scroll_to_end();
					},1);
				}
				
			}
			else{
				//console.log("insert_into_doc: text was not interested at the end of the document");
			}
			return true
			
		}
		else if(typeof playground_live_backups[task.file.folder + '/' + task.file.filename] == 'string'){
			//console.log("insert_into_document: the content is for a document that is not currently open: ", task.file, " =?= ",window.settings.docs.open);
			
			const text = playground_live_backups[task.file.folder + '/' + task.file.filename];
			const before_text = text.substr(0,cursor.from);
			const after_text = text.substr(cursor.to);
			//console.log("before_text.length: ", before_text.length);
			//console.log("after_text.length: ", after_text.length);
			
			// TOD: call save_file?
				
			
			if(!playground_live_backups[task.file.folder + '/' + task.file.filename].startsWith('_PLAYGROUND_BINARY_')){
				playground_live_backups[task.file.folder + '/' + task.file.filename] = before_text + content + after_text;
				savr(task.file.folder + '/playground_backup_' + task.file.filename, playground_live_backups[task.file.folder + '/' + task.file.filename]);
				return true
			}
			else{
				console.error("almost inserted text into binary file: ", task.file.filename);
				return
			}
			
			
		}
		
	}
	else{
		console.error("insert_into_document: could not reconstruct a valid cursor. Returning false.");
	}
	
	return false
}
window.insert_into_document = insert_into_document;




function is_task_for_currently_open_document(task){
	//console.log("in is_task_for_currently_open_document. task: ", task);
	
	if(typeof task == 'object' && task != null && typeof task.file != 'undefined' && typeof task.file == 'object' && task.file != null && typeof task.file.filename == 'string' && typeof task.file.folder == 'string'){
		if(window.settings.docs.open != null && task.file.filename == window.settings.docs.open.filename && task.file.folder == window.settings.docs.open.folder && task.file.filename == current_file_name && task.file.folder == folder){
			//console.log("is_task_for_currently_open_document: yes, the task is for the currently open document");
			return true
		}
	}
	//console.log("is_task_for_currently_open_document: no, the task is NOT for the currently open document.  task,window.settings.docs.open: ", task, window.settings.docs.open);
	return false
}
window.is_task_for_currently_open_document = is_task_for_currently_open_document;









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

















//
//  DOWNLOAD FILE AS .TXT, .MD or .PDF
//





window.text_to_clipboard = async (text) => {
	if(typeof text == 'string'){
		if(typeof strip_markdown != 'undefined'){
			text = strip_markdown(text);
			//console.log("window.download_text_as_txt:  stripped markdown from text: ", text);
		}
		else{
			console.error("download_text_as_txt: could not strip markdown from text");
		}
		try{
			navigator.clipboard.writeText(text);
			flash_message(get_translation("Copied_text_to_clipboard"));
		}
		catch(err){
			console.error("window.text_to_clipboard: caught error: ", err);
		}
		
	}
	else{
		console.error("window.download_text_as_txt: provided text was not a string: ", typeof text);
	}
}

window.text_to_email = async (text) => {
	if(typeof text == 'string'){
		if(typeof strip_markdown != 'undefined'){
			text = strip_markdown(text);
			//console.log("window.download_text_as_txt:  stripped markdown from text: ", text);
		}
		else{
			console.error("download_text_as_txt: could not strip markdown from text");
		}
		window.location.href = "mailto:email@example.com?subject=&body=" + encodeURIComponent(text);
	}
	else{
		console.error("window.download_text_as_txt: provided text was not a string: ", typeof text);
	}
}


window.download_text_as_txt = async (text=null,filename=null) => {
	console.log("in window.download_text_as_txt. text,filename: ", text,filename);
	
	const force_text_extensions = ['pdf','notes'];
	
	if(typeof text == 'string'){
		
		if(typeof filename != 'string'){
			console.log("download_text_as_txt: no prefered filename provided");
			if(typeof current_file_name != 'string'){
				return false
			}
			
			filename = current_file_name;
		
			if(!filename.toLowerCase().endsWith('.txt')){
				if(filename.endsWith('.md')){
					filename = filename.substr(0,filename.length - 3);
				}
				else if(filename.endsWith('.pdf')){
					filename = filename.substr(0,filename.length - 4);
				}
				else if(filename.endsWith('.notes')){
					filename = filename.substr(0,filename.length - 6);
				}
			
				filename = filename + '.txt';
			}
		}
		
		let extension = get_file_extension(filename);
		if(typeof extension == 'string'){
			if(force_text_extensions.indexOf(extension) != -1){
				filename = remove_file_extension(filename) + '.txt';
				text = strip_markdown(text);
			}
		}
		
		
		download(current_file_name, text);
	}
	else{
		console.error("window.download_text_as_txt: provided text was not a string: ", typeof text);
	}
	
}


window.download_text_as_md = async (text) => {
	//console.log("in window.download_text_as_md. text: ", text);
	if(typeof current_file_name == 'string'){
		let filename = current_file_name;
		if(!filename.toLowerCase().endsWith('.md')){
			if(filename.endsWith('.txt') || filename.endsWith('.pdf')){
				filename = filename.substr(0,filename.length - 4);
			}
			else if(filename.endsWith('.notes')){
				filename = filename.substr(0,filename.length - 6);
			}
			filename = filename + '.md';
		}
	
		if(typeof text == 'string'){
			download(filename, text);
		}
		else{
			console.error("window.download_text_as_md: provided text was not a string: ", typeof text);
		}
	}
	
	
}






window.download_text_as_pdf = async (text) => {
	//console.log("in window.download_text_as_txt. text: ", text);
	window.add_script('./pdf_generate_module.js',true) //load as module
	.then((value) => {
		//console.log("pdf_generate module loaded: ", value);
		
		window.text_to_pdf(text)
		.then((blob_url) => {
			if(typeof blob_url == 'undefined'){
				//console.log("download_text_as_pdf: PDF blob_url was undefined");
				return false
			}
			//console.log("PDF blob_url: ", blob_url);
			let filename = current_file_name;
			if(!filename.toLowerCase().endsWith('.pdf')){
				if(filename.endsWith('.txt')){
					filename = filename.substr(0,filename.length - 4);
				}
				else if(filename.endsWith('.notes')){
					filename = filename.substr(0,filename.length - 6);
				}
				filename = filename + '.pdf';
			}
			//console.log("PDF filename: ", filename);
		
			var link = document.createElement("a"); // Or maybe get it from the current document
			link.href = blob_url;
			link.download = filename;
		
		    document.body.appendChild(link);
		    link.click();
		    document.body.removeChild(link);
		    window.URL.revokeObjectURL(blob_url);
		
			/*
			const b64toBlob = (base64, type = 'application/octet-stream') => 
    			fetch(`data:${type};base64,${base64}`).then(res => res.blob())
			*/
			
			return true
		
		})
		.catch((err) => {
			console.error("download_text_as_pdf: caught error from window.text_to_pdf: ", err);
			return false
		})		
		
	})
	.catch((err) => {
		console.error("caught error loading pdf_generate module: ", err);
		return false
	})
}






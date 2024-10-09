import { Template } from './jinja/index.js';

// See https://github.com/ngxson/wllama/issues/120



function check_if_text_fits_in_context(text,context_size){
	console.log("in check_if_text_fits_in_context.");
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
	console.log("in apply_chat_template. messages: ", messages);
	
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
		console.log("apply_chat_template:  got assistant_id from task: ", assistant_id);
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








import { AutoTokenizer, env } from './tjs/transformers.min.js';

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

//console.log("importing chrono");
//import { Chrono } from './chrono/index.js';
//import { * } from './js/chrono.js';

//console.log("Chrono: ", Chrono, chrono);
// import { env, Tensor, AutoTokenizer, SpeechT5ForTextToSpeech, SpeechT5HifiGan } from './tjs/transformers.js';
//import { pipeline, env } from './js/transformers.js';

//window.auto_tokenizer = AutoTokenizer.from_pretrained(this.model_id, { progress_callback });

//AutoTokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=False)

//console.log("template: AutoTokenizer: ", AutoTokenizer);



/*
const test_conversation = [
    {
        "role": "user",
        "content": "How many helicopters can a human eat in one sitting?"
    },
    {
        "role": "assistant",
        "content": "A human can eat up to 15 helicopters in a sitting, depending on the type and size of the helicopters, the amount of food in the user's stomach, and the user's appetite. A helicopter is a type of bird that can fly up to 120 miles (200 kilometers) in a single flight."
    },
    {
        "role": "user",
        "content": "How many airplanes can a human eat in one sitting?"
    }
];
const test_template = "{% if not add_generation_prompt is defined %}{% set add_generation_prompt = false %}{% endif %}{% for message in messages %}{{'<|im_start|>' + message['role'] + '\n' + message['content'] + '<|im_end|>' + '\n'}}{% endfor %}{% if add_generation_prompt %}{{ '<|im_start|>assistant\n' }}{% endif %}";

async function start_tokenizer(){
	const model_id = 'Xenova/llama-tokenizer';
	window.tokenizer = await AutoTokenizer.from_pretrained("Xenova/llama-tokenizer");
	
	//const bla = apply_template(test_conversation,test_template);
	//console.log("applied template: ", bla);
	
}
start_tokenizer();
*/




// "{% if not add_generation_prompt is defined %}{% set add_generation_prompt = false %}{% endif %}{% for message in messages %}{{'<|im_start|>' + message['role'] + '\n' + message['content'] + '<|im_end|>' + '\n'}}{% endfor %}{% if add_generation_prompt %}{{ '<|im_start|>assistant\n' }}{% endif %}"


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
	
	/*
	let word_count = text.split(" ").length;
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
	*/
}
window.check_if_text_fits_in_context = check_if_text_fits_in_context;

async function apply_chat_template(task, messages=null){
	console.log("in apply_chat_template. messages: ", messages);
	//window.tokenizer = new AutoTokenizer;
	if(typeof task == 'undefined' || task == null){
		console.error("apply_chat_template: invalid task provided");
		return null;
	}
	if(typeof messages == 'undefined' || messages == null || !Array.isArray(messages)){
		console.error("apply_chat_template: invalid messages provided");
		return null;
	}
	
	let tokenizer = null;
	let chat_template = null;
	let config_url = null;
	
	let assistant_id = null;
	if(typeof task.assistant == 'string'){
		assistant_id = task.assistant;
		console.log("apply_chat_template:  got assistant_id from task: ", assistant_id);
	}
	
	if(typeof assistant_id != 'string'){
		console.error("apply_chat_template: missing assistant_id in task: ", task);
		return null
	}
	
	// Only keep the last message for rewrite tasks
	//if(typeof task.type == 'string' && (task.type == 'continue' || task.type == 'rewrite' || task.type == 'summarize' || task.type == 'proofread') && messages.length && typeof messages[messages.length-1].content == 'string'){
	if(typeof task.type == 'string' && task.type != 'chat'){
		
		if(messages[messages.length-1].content == ''){
			console.error("apply_chat_template: the prompt was empty.  task,messages: ", task, messages);
			return null
		}
		else{
			console.log("apply_chat_template: task is of continue type, so simply returning the prompt raw: ", messages[messages.length-1].content);
			console.log("apply_chat_template: doing rewrite/summarize/proofread/continue task, so only keeping the last message in the conversation: ",  messages[messages.length-1]);
			
			if(task.type == 'continue' && typeof assistant_id == 'string' && typeof window.settings[assistant_id] != 'undefined' && typeof window.settings[assistant_id].model_type == 'string' && window.settings[assistant_id].model_type == 'base'){
				return messages[messages.length-1].content;
			}
			else{
				messages = [ messages[messages.length-1] ];
			}
			
		}
		
	}
	
	
	
	try{
		if(typeof assistant_id == 'string' && (typeof window.assistants[assistant_id] != 'undefined' || typeof window.settings.assistants[assistant_id] != 'undefined')){
		
			if( 
				(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].template == 'string' && window.settings.assistants[assistant_id].template == 'none') || 
				(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].template == 'string' && window.assistants[assistant_id].template == 'none')
			){
				console.log("template is set to none in the model settings (likely a base model).  assistant_id: ", assistant_id);
				if(messages.length && typeof messages[messages.length-1].content == 'string' && messages[messages.length-1].content.length > 1){
					return messages[messages.length-1].content;
				}
				else{
					return 'Sorry, an error occured while creating the prompt';
				}
			}
			
			
			
			// If a user configured chat_template string exists, use that
			if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['chat_template'] == 'string'){
				console.log("apply_chat_template: using custom template string from settings: ", window.settings.assistants[assistant_id]['chat_template']);
				//chat_template = window.settings.assistants[assistant_id]['chat_template'];
				tokenizer = await AutoTokenizer.from_pretrained("Xenova/llama-tokenizer");
				return tokenizer.apply_chat_template(messages, {tokenize:false, return_tensor:false, add_generation_prompt:false, chat_template:window.settings.assistants[assistant_id]['chat_template']});
			}
			// If a user configured chat_template string exists, use that
			else if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id]['chat_template'] == 'string'){
				console.log("apply_chat_template: using custom template string from assistants dict: ", window.assistants[assistant_id]['chat_template']);
				//chat_template = window.assistants[assistant_id]['chat_template'];
				tokenizer = await AutoTokenizer.from_pretrained("Xenova/llama-tokenizer");
				return tokenizer.apply_chat_template(messages, {tokenize:false, return_tensor:false, add_generation_prompt:false, chat_template:window.assistants[assistant_id]['chat_template']});
			}
			// If a user configured config_url exists, use that
			else if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['config_url'] == 'string'){
				config_url = window.settings.assistants[assistant_id]['config_url'];
			}
			/*
			// If a chat_template string exists, use that
			else if(typeof window.assistants[assistant_id]['chat_template'] == 'string'){
				chat_template = window.assistants[assistant_id]['chat_template'];
			}
			*/
			// If a config URL exists, use that
			else if(typeof window.assistants[assistant_id]['config_url'] == 'string'){
				console.log("apply_chat_template: using window.assistants[assistant_id]['config_url']: ", window.assistants[assistant_id]['config_url']);
				config_url = window.assistants[assistant_id]['config_url'];
			}
			
			// If there is no special configuration for the tokenizer, try to fall back to using the download_url 
			if(config_url == null){ // chat_template == null && 
				console.log("apply_chat_template: no special tokenizer preferences found, getting config_url from download_url");
				let download_url = null;
				if(typeof window.settings.assistants[assistant_id]['download_url'] == 'string' && window.settings.assistants[assistant_id]['download_url'].length){
					download_url = window.settings.assistants[assistant_id]['download_url'];
				}
				else if(typeof window.assistants[assistant_id]['download_url'] == 'string' && window.assistants[assistant_id]['download_url'].length){
					download_url = window.assistants[assistant_id]['download_url'];
				}
				else if(typeof window.assistants[assistant_id]['download_url'] == 'object' && window.assistants[assistant_id]['download_url'] != null && Array.isArray(window.assistants[assistant_id]['download_url']) && window.assistants[assistant_id]['download_url'].length){
					console.log("apply_chat_template: download URL is an array");
					download_url = window.assistants[assistant_id]['download_url'];
				}
				
				if(typeof download_url == 'string' && download_url.startsWith('[') && download_url.endsWith(']')){
					try{
						download_url_list = JSON.parse(download_url);
						if(Array.isArray(download_url_list)){
							download_url = download_url[0];
							console.log("apply_chat_template: download_url was a stringified array. Using first item in array as the url to turn into a config_url: ", download_url );
						}
					}
					catch(err){
						console.error("apply_chat_template: failed to parse download_url: ", download_url);
						download_url = null;
					}
					
				}
				else if(download_url != null && Array.isArray(download_url) && download_url.length){
					console.log("apply_chat_template: download_url was already an array object. Grabbing first item from it: ", download_url);
					download_url = download_url[0];
				}
				
				if(typeof download_url == 'string'){
					if(download_url.indexOf('/') != -1 && download_url.startsWith('http')){
						let download_url_parts = download_url.split('/');
						if(download_url.startsWith('https://www.huggingface.co') || download_url.startsWith('https://huggingface.co')){
							if(download_url_parts.length > 5){
								config_url = download_url_parts[3] + '/' + download_url_parts[4];
								console.log("apply_chat_template: using huggingFace download_url as config_url too: ", config_url);
							}
						}
						else if(download_url.endsWith('.gguf')){
							download_url_parts.pop();
							if(download_url_parts.length > 1){
								config_url = download_url_parts.join('/');
							}
							else{
								config_url = download_url_parts[0];
							}
							
							console.log("apply_chat_template: download_url was not a huggingface URL: ", config_url);
						}
					}
					else if(download_url.lastIndexOf('/') > 1 && download_url.startsWith('/') && download_url.endsWith('.gguf')){
						let download_url_parts = download_url.split('/');
						
						if(download_url_parts.length > 2){
							console.log("apply_chat_template: download_url_parts of local url: ", download_url_parts);
							download_url_parts.pop();
							download_url_parts = download_url_parts.splice(download_url_parts.length-2,2);
							console.log("apply_chat_template: download_url_parts of local url after: ", download_url_parts);
							config_url = download_url_parts.join('/');
						}
						
					}
				}
				else{
					console.error("apply_chat_template: no download URL to fall back to: ", download_url);
				}
				
			}
			/*
			if(typeof chat_template == 'string'){ // currently not setting any custom templates
				console.log("apply_chat_template: using chat_template string: ", chat_template);
				tokenizer = await AutoTokenizer.from_pretrained("Xenova/llama-tokenizer");
				return tokenizer.apply_chat_template(messages, {tokenize:false, return_tensor:false, add_generation_prompt:true, chat_template:window.assistants[assistant_id]['chat_template']});
			}
			else 
			*/
			if(typeof config_url == 'string' && config_url.length > 5 && config_url.indexOf('/') != -1){
				console.log("apply_chat_template: using config_url string: ", config_url);
				tokenizer = await AutoTokenizer.from_pretrained(config_url);
				const tokenized = tokenizer.apply_chat_template(messages, {tokenize:false, return_tensor:false, add_generation_prompt:true});
				console.error("apply_chat_template: TOKENIZED: ", messages, " -> ", tokenized);
				return tokenized;
			}
			else{
				console.error("apply_chat_template: both chat_template and config_url were invalid (not strings, or too short). config_url: ", config_url);
				
				// going to try to just feed the LLM the raw input?
				if(messages.length && typeof messages[messages.length-1].content == 'string' && messages[messages.length-1].content.length > 1){
					return messages[messages.length-1].content;
				}
			}
			
		}
		else{
			console.error("apply_chat_template: invalid assistant id, or not in window.assistants.   assistant_id, task: ", assistant_id, task);
		}
	}
	catch(err){
		console.error(" apply_chat_template: caught error in apply_chat_template: ", err, messages);
		if((''+err).indexOf('Failed to fetch') != -1){
			flash_message(get_translation('A_model_needs_to_be_downloaded_but_there_is_no_internet_connection'),4000,'warn');
		}
		if(messages.length && typeof messages[messages.length-1].content == 'string' && messages[messages.length-1].content.length > 1){
			return messages[messages.length-1].content;
		}
		//else{
		//	return 'Sorry, an error occured while creating the prompt';
		//}
		
	}
	
	/*
	// llama3 template
	let chat_template = "{% set loop_messages = messages %}{% for message in loop_messages %}{% set content = '<|start_header_id|>' + message['role'] + '<|end_header_id|>\n\n'+ message['content'] | trim + '<|eot_id|>' %}{% if loop.index0 == 0 %}{% set content = bos_token + content %}{% endif %}{{ content }}{% endfor %}{% if add_generation_prompt %}{{ '<|start_header_id|>assistant<|end_header_id|>\n\n' }}{% endif %}";
	
	if(window.)
	
	
	
	console.log("apply_template: window.tokenizer: ", window.tokenizer);
	
	if(messages != null && typeof chat_template == 'string'){
		return window.tokenizer.apply_chat_template(messages, {tokenize:false, return_tensor:false, add_generation_prompt:true, chat_template:chat_template});
	}
	else{
		console.error("apply_template: invalid input.  messages,chat_template: ", messages,chat_template);
		return null;
	}
	*/
	
	// const text = tokenizer.apply_chat_template(chat, { tokenize: false, return_tensor: false, chat_template });
	// tokenizer.chat_template = template
	console.error("apply_chat_template: task fell through. Setting task as failed");
	
	window.handle_completed_task(task,false,{'state':'failed'});
	window.clean_up_dead_task(task);
	
	return null
}
window.apply_chat_template = apply_chat_template;


/*
console.log("chrono: ", window.chrono.parseDate('Friday', new Date(2012, 8 - 1, 23)) );

setTimeout(() => {
	const referenceDate = new Date();

	console.error("chrono: ", window.chrono.parseDate('Today'));
  	let extracted_time = window.chrono.parseDate('Friday', referenceDate, { forwardDate: true });
	console.log("chrono extracted_time: ", extracted_time);
},1000);

*/








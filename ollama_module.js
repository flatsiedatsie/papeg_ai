console.log("Hello from Ollama module");


let ollama_task = null;
let response_so_far = '';
let ollama_host = 'http://localhost:11434';
let ollama_model = 'llama3';
if(typeof window.settings.assistants['ollama1'] != 'undefined' && typeof window.settings.assistants['ollama1']['ollama_host'] == 'string' && window.settings.assistants['ollama1']['ollama_host'].trim().length > 5){
	ollama_host = window.settings.assistants['ollama1']['ollama_host'];
}
if(typeof window.settings.assistants['ollama1'] != 'undefined' && typeof window.settings.assistants['ollama1']['ollama_model'] == 'string' && window.settings.assistants['ollama1']['ollama_model'].trim().length > 1){
	ollama_model = window.settings.assistants['ollama1']['ollama_model'];
}

window.load_ollama = async (task) => {
	//console.log("in load_ollama. task: ", task);

	let model = 'llama3';
	if(typeof task.ollama_model == 'string'){
		model = task.ollama_model;
	}
	
	let system_prompt = "You are a helpfull assistant";
	if(typeof task.system_prompt == 'string' && task.system_prompt.length > 5){
		system_prompt = task.system_prompt;
	}
	else if(typeof task.assistant == 'string' && typeof window.settings.assistants[task.assistant] != 'undefined' && typeof window.settings.assistants[task.assistant].system_prompt == 'string' && window.settings.assistants[task.assistant].system_prompt.length > 5){
		system_prompt = window.settings.assistants[task.assistant].system_prompt;
	}
	else if(typeof task.assistant == 'string' && typeof window.assistants[task.assistant] != 'undefined' && typeof window.assistants[task.assistant].system_prompt == 'string' && window.assistants[task.assistant].system_prompt.length > 5){
		system_prompt = window.assistants[task.assistant].system_prompt;
	}

}



window.do_ollama = async (task) => {
	if(typeof task == 'undefined' && task == null){
		console.error("do_ollama: aborting, invalid task provided");
		return false
	}
	
	if(typeof task.prompt != 'string'){
		console.error("do_ollama: aborting, invalid prompt provided. task: ", task);
		return false
	} 
	
	//window.set_task_state(task,'doing-ollama');
	if(window.ollama_busy == false){
		response_so_far = '';
	}
	window.ollama_busy = true;
	
	try{
		ollama_task = task;
		response_so_far = '';
	
		if(typeof window.settings.assistants['ollama1'] != 'undefined' && typeof window.settings.assistants['ollama1']['ollama_host'] == 'string' && window.settings.assistants['ollama1']['ollama_host'].trim().length > 5){
			ollama_host = window.settings.assistants['ollama1']['ollama_host'];
		}
		if(typeof window.settings.assistants['ollama1'] != 'undefined' && typeof window.settings.assistants['ollama1']['ollama_model'] == 'string' && window.settings.assistants['ollama1']['ollama_model'].trim().length > 1){
			ollama_model = window.settings.assistants['ollama1']['ollama_model'];
		}
		
		if(window.ollama_online == false){
			//console.log("window.do_ollama: calling test_ollama first");
			await test_ollama();//window.load_ollama(task);
		}
	
	
	
		if(window.ollama_online == true){
			if(typeof task.prompt == 'string' && task.prompt.length > 2){
				let append_system_prompt = false;
				let system_prompt = null;
		
			
				let chat_history = get_conversation_history(task);
				//console.log("do_ollama: chat_history: ", chat_history);
			
				window.ollama_abort_controller = new AbortController();
			
				fetch(ollama_host + "/api/chat", {
						            method: "POST",
									//mode: 'no-cors', 
									rejectUnauthorized: false,
						            headers: {
						                "Content-Type": "application/json",
						            },
						            body: JSON.stringify({
						                model: ollama_model,
						                messages: chat_history,
						                stream: true,
						            }),
									signal: window.ollama_abort_controller.signal,
				})
				.then((response) => {
					//console.log("OLLAMA CHAT RESPONSE: ", response);
					
					if(typeof response.body != 'undefined'){
						handle_chat_response(response.body);
					}
					else{
						console.error("ollama chat response had no body.  response: ", response);
					}
					
				})
				.catch((err) => console.error("Ollama chat response caught error: ", err));
				
				
		
			}
			else{
				console.error("do_ollama: prompt was not long enough");
				window.ollama_busy = false;
			}
		}
		else{
			console.error("do_ollama: ollama was still offline.  ollama_task: ", ollama_task);
			window.ollama_busy = false;
			if(ollama_task != null){
				window.handle_completed_task(ollama_task,false,{'state':'failed'});
				window.clean_up_dead_task(ollama_task,'failed');
				ollama_task = null;
			}
			
		}
	}
	catch(err){
		console.error("caught error in do_ollama: ", err);
		window.ollama_busy = false;
	}
}



window.interrupt_ollama = async (task=null) => {
	//console.log("in window.interrupt_ollama");
	if(window.ollama_abort_controller != null){
		window.ollama_abort_controller.abort();
	}
	if(task != null){
		window.set_chat_status(task,'');
	}
}




const handle_chat_response = async (body) => {
	//console.log("in ollama handle_chat_response.  body: ", body);
	
	for await (const part of body) {
		//console.log("do_ollama: ollama response part: ", part); //.message.content
		try{
			const raw_response = new TextDecoder().decode(part);
			//console.log("do_ollama: handle_chat_response: raw_response: ", raw_response); //.message.content
			const parsed_response = JSON.parse(raw_response);
			if(typeof parsed_response.message != 'undefined' && typeof parsed_response.message.content == 'string' ){
				window.handle_chunk(ollama_task, response_so_far, parsed_response.message.content);
				response_so_far += parsed_response.message.content;
			}
		}
		catch(err){
			console.error("caught an error in handling ollama chat response: ", err);
		}
		
		
	}
	//console.log("OLLAMA: DONE!");
	window.handle_completed_task(ollama_task, response_so_far);
	window.ollama_busy = false;
	window.set_chat_status(ollama_task,'');
}







window.get_ollama = async (path='',body=null) => {
    try {
		if(typeof window.settings.assistants['ollama1'] != 'undefined' && typeof window.settings.assistants['ollama1']['ollama_host'] == 'string'){
			ollama_host = window.settings.assistants['ollama1']['ollama_host'];
		}
		if(ollama_host.endsWith('/')){
			ollama_host = ollama_host.substr(0, ollama_host.length - 1);
			//console.log("get_models: removed last slash from ollama_host: ", ollama_host);
		}
		if(!path.startsWith('/')){
			path = '/' + path;
		}
		
		let response = null;
		
		if(body == null){
			// works: "http://localhost:11434/"
	        response = await fetch(ollama_host + path, 
				{ 
	            	method: "GET",
					//mode: 'no-cors',
					rejectUnauthorized: false,
	            	headers: {
	                	"Content-Type": "application/json",
	            	},
	        	}
			
			);
		}
		else{
        	response = await fetch(ollama_host + path, 
				{ 
            		method: "POST",
					//mode: 'no-cors',
					rejectUnauthorized: false,
            		headers: {
                		"Content-Type": "application/json",
            		},
					'body': JSON.stringify(body)
        		}
				
			);
		}
		
		if(response == null){
			console.error("get_ollama: response was (still) null");
			return null;
		}
		//console.log("get_ollama: good response: ", response);
        if (response.ok) {
            const result = await response.text(); // Parse JSON
			//console.log("get_ollama: OK, parsed response: ", response);
			return result;
			
        } else {
            console.error("get_ollama: response was not ok: ", response);
			return null;
        }
		
    } catch (err) {
		console.error("get_ollama: caught general error: ", err);
        //window.ollama_online = false;
		return null;
    }
}






window.test_ollama = async () => {
    try {
		const ollama_test_result = await window.get_ollama();
		if(typeof ollama_test_result == 'string'){
			window.ollama_online = true;
			console.error("test_ollama: Ollama is online");
			
			add_chat_message_once('ollama1','developer','👍 ' + get_translation('Ollama_is_online'),'Ollama_is_online');
			if(window.settings.assistant.startsWith('ollama')){
				//console.log("window.settings.assistant startsWith ollama");
				document.body.classList.add('model-loaded');
				window.set_model_loaded(true);
			}
			else{
				//console.log("test_ollama: window.settings.assistant does not start with Ollama: ->" + window.settings.assistant + "<-");
			}
			
			// Get some more data from the Ollama API
			//console.log("test_ollama: going to query the Ollama API for models list and model settings");
			await window.get_ollama_models();
			await window.get_ollama_model_settings();
			//console.log("test_ollama: Initial querying of Ollama API done.  window.ollama_models,window.ollama_model_settings:", window.ollama_models, window.ollama_model_settings);
			return
			
		}
		else{
			//console.log("test_ollama: Ollama seems to be offline");
			if(window.settings.assistant.startsWith('ollama')){
				add_chat_message_once('ollama1','developer',get_translation('Ollama_is_offline'),'Ollama_is_offline');
			}
		}
		
    } catch (err) {
		console.error("test_ollama: Ollama is very offline - caught error: ", err);
        window.ollama_online = false;
    }
	
	if(window.settings.assistant.startsWith('ollama') && window.ollama_online == false){
		flash_message(get_translation('Ollama_seems_to_be_offline'),2000,'warn');
	}
}





window.get_ollama_models = async () => {
	let ollama_models_list = await window.get_ollama('/api/tags');
	if(typeof ollama_models_list == 'string' && ollama_models_list.startsWith('{')){
		ollama_models_list = JSON.parse(ollama_models_list)
	}
	//console.log("get_ollama_models:  ollama_models_list: ", ollama_models_list );
	window.ollama_models = ollama_models_list;
}



// '/api/tags'





window.get_ollama_model_settings = async () => {
	let ollama_model_name = null;
	if(typeof window.settings.assistants['ollama1'] != 'undefined' && typeof window.settings.assistants['ollama1']['ollama_host'] == 'string'){
		ollama_model_name = window.settings.assistants['ollama1']['ollama_host'];
	}
	//console.log("get_ollama_model_settings:  ollama_model_name: ", ollama_model_name);
	if(typeof ollama_model_name == 'string' && ollama_model_name.length){
		const ollama_model_settings = await window.get_ollama('/api/show', { name: ollama_model_name });
		//console.log("get_ollama_model_settings:  ollama_model_settings: ", ollama_models_settings );
		window.ollama_model_settings = ollama_model_settings;
		return ollama_model_settings;
	}
	else{
		return null
	}
}





window.test_ollama();


window.ollama_module_loaded = true;
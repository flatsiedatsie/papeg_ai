


let rag_worker_error_count = 0;
let rag_files_to_cache = ['./rag_module.js','./rag_worker.js','./promise_rag_worker.js'];


async function create_promise_rag_worker(){
	//console.log("in create_promise_rag_worker");
	
	return new Promise((resolve, reject) => {
		
		window.promise_rag_worker = null;
		window.real_rag_worker = null;
		window.real_rag_worker = new Worker('./promise_rag_worker.js', {
		  	type: 'module'
		})
		window.promise_rag_worker = new PromiseWorker(window.real_rag_worker);
		
		//console.log("rag_module: window.promise_rag_worker: ", window.promise_rag_worker);
		
		
		window.real_rag_worker.addEventListener('message', e => {
			//console.log("rag_module: received message from rag_worker: ", e.data);

			if(typeof e.data.status == 'string'){
				if(e.data.status == 'progress'){
					//console.log("rag worker sent embedding model download percentage: ", e.data.progress);
					let rag_progress_el = document.getElementById('download-progress-rag');
					if(rag_progress_el == null){
						//console.log("rag (down)load progress element is missing. Creating it now.");
						add_chat_message('current','rag','download_progress#setting---');
					}
					else{
						//console.log("updating rag (down)load progress");
						rag_progress_el.value = e.data.progress / 100;
					}
				
				}
				else if(e.data.status == 'exists'){
					//console.log("rag worker sent exists message");
				}
				
				else if(e.data.status == 'pipeline_constructed'){
					//console.log("rag worker sent pipeline_constructed message");
					if(document.body.classList.contains('show-rewrite')){
						flash_message(get_translation("Document_search_AI_has_loaded"));
					}
				}
				
				else if(e.data.status == 'ready'){
					//console.log("rag worker sent ready message");
					//window.rag_worker_busy = false;
					add_chat_message('current','developer',get_translation('RAG_AI_has_loaded'));
					let rag_progress_el = document.getElementById('download-progress-rag');
					if(rag_progress_el){
						//console.log("found download progress element");
						const rag_progress_message_el = rag_progress_el.closest('.message');
						if(rag_progress_message_el){
							//console.log("adding download-complete-chat-message class to rag download message");
							rag_progress_message_el.classList.add('download-complete-chat-message');
						}
						rag_progress_el.classList.add('download-complete-chat-message');
						rag_progress_el.removeAttribute('id');
					}
					else{
						console.error("rag became ready, but cannot find loading progress indicator element");
					}
				}
			
				else if(e.data.status == 'initiate'){
					//console.log("rag worker sent initiate message");
				}
			
				//https://huggingface.co/Xenova/opus-mt-nl-en/resolve/main/onnx/decoder_model_merged_quantized.onnx?download=true
			
				else if(e.data.status == 'download'){
					//console.log("rag worker sent download message: ", e.data.file);
					const file_to_cache = 'https://www.huggingface.co/' + e.data.name + '/resolve/main/' + e.data.file;

					if(document.body.classList.contains('developer')){
						add_chat_message('current','developer','(down)loading: ' + e.data.file);
					}
				}
			
				else if(e.data.status == 'download_required'){
					//console.log("rag worker sent 'download_required' message.");
					flash_message(get_translation("A_model_has_to_be_downloaded_from_the_internet_but_there_is_no_internet_connection"), 4000, 'fail');
				}
			
				else if(e.data.status == 'done'){
					//console.log("rag worker sent 'done' message. Seems to be for a file being done downloading");
				}
			
				else if(e.data.status == 'update'){
					if(typeof e.data.data == 'object' && e.data.data != null && e.data.data.length){
						//set_chat_status({},e.data.data[0],2);
					}
				}
				
				else if(e.data.status == 'chunk'){
					//console.log("rag worker sent translated chunk: ", e.data);
					window.handle_chunk(e.data.task, e.data.response_so_far, '',  e.data.chunk);
					
					let task_index = null;
					if(typeof e.data.task != 'undefined' && typeof e.data.task.index == 'number'){
						task_index = e.data.task.index;
						if(typeof e.data.task.parent_index == 'number'){
							//console.log("rag worker sent translated chunk, and the task has a parent task with index: ", e.data.task.parent_index);
							task_index = e.data.task.parent_index;
						}
					}
					if(typeof e.data.sentences_count == 'number' && typeof e.data.sentences_total == 'number'){
						let rag_progress_count_el = document.getElementById('rewrite-results-count-wrapper' + task_index);
						if(rag_progress_count_el){
							//console.log("OK, found rag task count-wrapper element, in which to place the progress percentage");
							rag_progress_count_el.textContent = (Math.floor((e.data.sentences_count / e.data.sentences_total) * 1000) / 10) + '%';
						}
					}
				}
			
				else if(e.data.status == 'complete'){
					//window.rag_worker_busy = false;
					//set_chat_status('',2);
					//console.log('GOT RAG COMPLETE.  e.data: ', e.data);
					//console.log('GOT RAG COMPLETE.  e.data.rag: ', e.data.rag);
					//console.log('GOT RAG COMPLETE.  e.data.task: ', e.data.task);
				
					if(e.data.rag == null){
						console.error("rag rag was null");
					}
					else if(typeof e.data.rag != 'undefined'){
						//console.log("rag worker returned rag: ", e.data.rag);
					
						if(Array.isArray(e.data.rag)){
							//console.log("typeof rag is array");
							window.handle_completed_task(e.data.task,e.data.rag[0].rag_text);
						}
						else if(typeof e.data.rag == 'object'){
							if(typeof e.data.rag.text == 'string'){
								//console.log("GOT TEXT: ", e.data.rag.text);
								window.handle_completed_task(e.data.task,e.data.rag.text);
							}
						}
						else if(typeof e.data.rag == 'string'){
							//console.log("GOT TEXT e.data.rag: ", e.data.rag);
							window.handle_completed_task(e.data.task, e.data.rag);
						}
					}
					else{
						//console.log("rag was not in rag e.data");
					}
				
				}
				else if(e.data.status == 'new_database_created'){
					//console.log("rag worker sent message: new_database_created");
				}
				else if(e.data.status == 'embedding_progress'){
					//console.log("rag worker sent embedding_progress message: ", e.data);
					
					const embedding_progress_el = document.getElementById('rag-embedding-progress');
					if(embedding_progress_el){
						if(typeof e.data.progress == 'number'){
							embedding_progress_el.value = e.data.progress / 100;
						}
						else{
							console.error("embedding progress was not a number?");
						}
						
					}
					else{
						console.error("cound not find embedding progress element");
					}
				}
				
				
				else if(e.data.status == 'search_complete'){
					//console.log("rag worker sent search_complete message: ", e.data);
					
					//window.show_rag_search_result(e.data); // creates list of chunks in the document right sidebar
					//window.generate_from_rag_search_result(e.data);
				}
				
				
				
				else if(e.data.status == 'error'){
					console.error("GOT ERROR FROM RAG WORKER");
					if(typeof e.data.error == 'string'){
						if(e.data.error.indexOf('no available backend found') != -1){
							flash_message(get_translation('A_model_needs_to_be_downloaded_but_there_is_no_internet_connection'),10000,'warn');
						}
					}
					
					window.rag_worker_busy = false;
				}
				else if(e.data.status == 'database_saved'){
					//console.log("RAG ORAMA DATABSE SAVED");
					flash_message(get_translation('Read_a_document'),1000);
					window.rag_worker_busy = false;
				}
				else if(e.data.status == 'database_restored'){
					//console.log("RAG ORAMA DATABSE RESTORED");
					flash_message(get_translation('Documents_database_restored'),2000);
					window.rag_worker_busy = false;
				}
				else{
					console.error("rag worker sent an unexpected content message: ", e.data);
					//window.rag_worker_busy = false;
				}
			}
			
		});


		window.real_rag_worker.addEventListener('error', (error) => {
			console.error("ERROR: rag_worker sent error. terminating!. Error was: ", error, error.message);
			rag_worker_error_count++;
		
			window.real_rag_worker.terminate();
			window.promise_rag_worker = null;
			
			//window.rag_worker_busy = false;
			if(typeof error != 'undefined' && rag_worker_error_count < 10){
				setTimeout(() => {
					//console.log("attempting to restart rag worker");
					create_promise_rag_worker();
					window.rag_worker_busy = false;
				},1000);
			}
			else{
				console.error("rag_worker errored out");
				window.rag_worker_busy = false;
			}
		});
		
		resolve(true);
	});
	
}





console.log("rag_module.js:  calling create_promise_rag_worker");
create_promise_rag_worker();



window.show_rag_search_result = async function (full_result){
	//console.log("in show_rag_search_result.  full_result: ", full_result);
	
	try{
		
		if(typeof full_result != 'undefined' && full_result != null && typeof full_result.task != 'undefined' && typeof full_result.task.rag_index == 'number' && typeof full_result.search_results != 'undefined'){
			
			let rag_search_result_output_el = document.getElementById('rag-search-result-output' + full_result.task.rag_index);
			if(rag_search_result_output_el){
				
				const search_result = full_result.search_results;
				document.body.classList.add('show-rag-result');
	
				if(typeof search_result.hits != 'undefined' && Array.isArray(search_result.hits) ){
					//console.log("show_rag_search_result: hits: ", search_result.hits);
				
					let search_meta = {};
				
					if(search_result.hits.length){
						
						for(let r = 0; r < search_result.hits.length; r++){
							const details = search_result.hits[r];
							//console.log("search_result.hits -> details: ", details);
							//console.log("typeof details.document: ", typeof details.document);
							//console.log("typeof details.document.filename: ", typeof details.document.filename);
							if(typeof details.document != 'undefined' && typeof details.document.filename == 'string'){
								const path = details.document.folder + '/' + details.document.filename;
								//console.log("search result details: ", path, details);
								if(typeof search_meta[path] == 'undefined'){
									search_meta[path] = {'scores':[], 'average_score':0, 'hits':[], 'folder':folder,'filename':details.document.filename}
								}
								search_meta[path].scores.push(details.score);
								const average_score = (search_meta[path].scores.reduce((a,b)=>a+b)) / search_meta[path].scores.length;
								search_meta[path].average_score = average_score;
								//console.log("new details.score, new average_score: ", details.score, average_score);
								search_meta[path].hits.push(details.document);
							}
							else{
								console.error("hit did not have document.filename? details.document: ", details.document);
							}
						}
					
						let rag_hits_container_el = document.createElement('div');
						rag_hits_container_el.setAttribute('id','rag-result-output' + full_result.task.rag_index);
						
						let rag_answer_container_el = document.createElement('div');
						rag_answer_container_el.setAttribute('id','rag-search-result-answer' + full_result.task.rag_index);
						rag_answer_container_el.classList.add('rag-search-result-answer');
						rag_answer_container_el.innerHTML = '<div id="rag-result-answer-question' + full_result.task.rag_index + '" class="rag-result-answer-question"></div><div class="spinner"></div>';
						
						rag_hits_container_el.appendChild(rag_answer_container_el);
						
						let rag_answer_details_el = document.createElement('details');
						rag_answer_details_el.classList.add('rag-result-details');
					
						let rag_answer_summary_el = document.createElement('summary');
						rag_answer_summary_el.classList.add('rag-result-summary');
						rag_answer_summary_el.textContent = get_translation("Sources");
						rag_answer_summary_el.setAttribute('data-i18n','Sources');
						rag_answer_details_el.appendChild(rag_answer_summary_el);
					
						let rag_sources_list_el = document.createElement('ul');
						rag_sources_list_el.classList.add('rag-result-sources-list');
					
						for (const[path, details] of Object.entries(search_meta)) {
						
							let rag_sources_item_wrapper_el = document.createElement('li');
							rag_sources_item_wrapper_el.classList.add('rag-sources-list-item');
							
							let rag_sources_item_el = document.createElement('div');
							rag_sources_item_el.classList.add('rag-sources-item');
						
							let rag_sources_item_stats_el = document.createElement('div');
							rag_sources_item_stats_el.classList.add('rag-sources-item-stats');
						
							let rag_sources_item_score_el = document.createElement('span');
							rag_sources_item_score_el.classList.add('rag-sources-item-score');
							rag_sources_item_score_el.textContent = (Math.round(details.average_score * 1000) / 10) + '%';
							rag_sources_item_stats_el.appendChild(rag_sources_item_score_el);
						
							let rag_sources_item_count_el = document.createElement('span');
							rag_sources_item_count_el.classList.add('rag-sources-item-count');
							rag_sources_item_count_el.textContent = details.scores.length;
							rag_sources_item_stats_el.appendChild(rag_sources_item_count_el);
						
							rag_sources_item_el.appendChild(rag_sources_item_stats_el);
							
							let rag_sources_item_filename_el = document.createElement('span');
							rag_sources_item_filename_el.classList.add('rag-sources-item-filename');
							rag_sources_item_filename_el.textContent = path;
							rag_sources_item_el.appendChild(rag_sources_item_filename_el);
							
						
							rag_sources_item_el.addEventListener('click', () => {
								//console.log("clicked on source.  path, details: ", path, details);
								
								possibly_hide_sidebar();
								
								if(codeOutput.offsetWidth < 100){
									codeOutput.style.width = '100px';
								}
								
								open_file(details.filename,null,details.folder)
								.then((value) => {
									//console.log("opened file from RAG search source. value: ", value);
									
									codeOutput.innerHTML = '';
									
									let open_document_from_list = [];
									if(window.settings.docs.open != null){
										for(let r = 0; r < details.hits.length; r++){
											const hits_details = details.hits[r];
											//console.log("search result hits_details: ", r, hits_details);
				
											if(hits_details.folder == folder && hits_details.filename == current_file_name ){
												//console.log("search docs result was for the currently open file.  hits_details.filename: ", hits_details.filename);
												if(typeof hits_details.from == 'number'){
													open_document_from_list.push(hits_details.from);
												}
											}
					
										}
				
										//console.log("show_rag_search_result:  open_document_from_list: ", open_document_from_list);
										if(open_document_from_list.length){
											open_document_from_list.sort(function(a, b) {
												return a - b;
											});

											//console.log("show_rag_search_result:  open_document_from_list sorted: ", open_document_from_list);
											for(let d = 0; d < open_document_from_list.length; d++){
												for(let r = 0; r < search_result.hits.length; r++){
													const hits_details = search_result.hits[r];
													//console.log("ordered search result hits_details: ", hits_details);
													//console.log("* folder? ", hits_details.document.folder, " =?= ", folder);
													//console.log("* filename? ", hits_details.document.filename, " =?= ", current_file_name);
													//console.log("* from? ", typeof open_document_from_list[d], open_document_from_list[d], " =?= ", typeof hits_details.document.from, hits_details.document.from);
													if(hits_details.document.folder == folder && hits_details.document.filename == current_file_name && open_document_from_list[d] == hits_details.document.from){
														//console.log("MATCH!")
														//add_to_output({'type':'info','arguments':[ Math.round(hits_details.score*100) + '%', hits_details.document.chunk]});
														if(typeof hits_details.document.from == 'number' && typeof hits_details.document.to == 'number'){
															//console.log("adding 'error' to codeOutput");
															add_error_to_output({'from':hits_details.document.from, 'to':hits_details.document.to}, null, hits_details.document.chunk, 'rag_result', {'match': Math.round(hits_details.score*100)});
														}
														else{
															console.error("hits_details.document.from or hits_details.document.to was not a number");
														}
								
								
													}
					
												}
											}
							
										}
										/*
										for(let rr = 0; rr < search_result.hits.length; rr++){
											const hits_details = search_result.hits[rr];
											if(hits_details.document.folder != folder || hits_details.document.filename != current_file_name){
												//console.log("adding search result for other file than the currently open one: ", hits_details);
												//add_to_output({'type':'log','arguments':[ Math.round(hits_details.score*100) + '%', hits_details.document.filename, hits_details.document.chunk]});
								
												add_error_to_output({'from':hits_details.document.from, 'to':hits_details.document.to}, null, hits_details.document.chunk, 'rag_result', {'match': Math.round(hits_details.score*100),'folder':hits_details.document.folder,'filename':hits_details.document.filename});
								
											}
										}
										*/
						
									}
									else{
										console.warn("showing rag search results, but there is no currently open document. Not generating list of hits.");
									}
									
									
									
									
								})
								.catch((err) =>{
									console.error("caught error trying to display source of RAG search: ", err);
								})
								
							})
						
							rag_sources_item_wrapper_el.appendChild(rag_sources_item_el)
							rag_sources_list_el.appendChild(rag_sources_item_wrapper_el);
						}
						
						rag_answer_details_el.appendChild(rag_sources_list_el);
					
						rag_hits_container_el.appendChild(rag_answer_details_el);
						
						rag_search_result_output_el.innerHTML = '';
						rag_search_result_output_el.appendChild(rag_hits_container_el);
			
					
			
					}
					else{
						add_to_output({'type':'end_of_code','arguments':[get_translation('No_search_results')]});
					}
				}
				//add_to_output({'type':'info','arguments':["End of search results"]});

				//add_to_output({'type':'end_of_code','arguments':["End of search results"]});
				
			}
			
		}
		else{
			console.error("show_rag_search_result: missing values in input")
		}
	}
	catch(err){
		console.error("caught error in show_rag_search_result: ", err);
	}
	
}



window.generate_from_rag_search_result = async function (full_result){
	//console.log("in window.generate_from_rag_search_result.  full_result: ", full_result);
	if(typeof full_result != 'undefined' && full_result != null && typeof full_result.task != 'undefined' && full_result.task != null && typeof full_result.task.assistant == 'string' && typeof full_result.search_results != 'undefined' && typeof full_result.search_results.hits != 'undefined' && Array.isArray(full_result.search_results.hits) ){
		//let task = full_result.task;
		
		//assistant_id = task.assistant;
	
		if(full_result.search_results.hits.length){
			let rag_used_filenames = [];
			let rag_search_task = JSON.parse(JSON.stringify(full_result.task));
			if(typeof rag_search_task.index == 'number'){
				delete rag_search_task.index;
			}
			
			let context = '';
			for(let r = 0; r < full_result.search_results.hits.length; r++){
				
				if(typeof full_result.search_results.hits[r].document != 'undefined' && typeof full_result.search_results.hits[r].document.chunk == 'string'){
					//console.log("adding rag chunk to context for document: ", full_result.search_results.hits[r].document);
					let file_name_to_add = '';
					// "Economy of Guam.txt"
					if(typeof full_result.search_results.hits[r].document.filename == 'string'){
						file_name_to_add = full_result.search_results.hits[r].document.filename;
						if(file_name_to_add.length > 5 && file_name_to_add.lastIndexOf('.') > file_name_to_add.length - 5){
							file_name_to_add = file_name_to_add.substr(0,file_name_to_add.lastIndexOf('.'));
						}
						//console.log("RAG file_name_to_add to <context>: ", file_name_to_add);
						if(rag_used_filenames.indexOf(file_name_to_add) == -1){
							
							if(full_result.search_results.hits[r].document.chunk.startsWith(file_name_to_add)){
								file_name_to_add = ''; // save for later, as this chunk already starts with the filename (likely the first chunk of the document, with the title)
							}
							else{
								//console.log("adding file_name_to_add to <context>: ", file_name_to_add);
								rag_used_filenames.push(file_name_to_add);
							}
						}
						else{
							file_name_to_add = '';
						}
					}
					
					context += '\n' + file_name_to_add + full_result.search_results.hits[r].document.chunk + '\n';
				}
			
			}
		
			let rag_prompt = `You are an experienced researcher, expert at interpreting and answering questions based on provided sources. Using the provided context, answer questions to the best of your ability using the resources provided. Generate a concise answer to a question based solely on the provided search results. You must only use information from the provided search results. Use an unbiased and journalistic tone. Combine search results together into a coherent answer. Do not repeat text.
	If there is nothing in the context relevant to the question at hand, just say "Hmm, I'm not sure." Don't try to make up an answer.
	Anything between the following \`context\` html blocks is retrieved from a knowledge bank, not part of the conversation with the user.
	<context>
	` + context + `
	<context/>

	Use the information within the context to answer the following question: 

	` + full_result.task.prompt + `

	answer: `
		
			//console.log("rag_prompt: ", rag_prompt);
		
			rag_search_task.prompt = rag_prompt;
			rag_search_task.type = 'rag_search_merging';
			rag_search_task.state = 'should_assistant';
			rag_search_task.desired_results = 1;
			rag_search_task.results = [];
			rag_search_task.destination = 'chat';
			rag_search_task.rag_hits = full_result.search_results.hits;
			
			window.add_task(rag_search_task);
		}
	
		else{
			console.warn("Document search resulted in zero hits");
			
			let rag_search_result_output_el = document.getElementById('rag-search-result-output' + full_result.task.rag_index);
			if(rag_search_result_output_el){
				rag_search_result_output_el.innerHTML = '<span>😓 </span><span data-i18n="No_search_results">' + get_translation('No_search_results') + '</span>';
			}
			flash_message(get_translation('No_search_results'),3000,'info');
			document.body.classList.remove('waiting-for-response');
			return false
			
		}
			
		
		
	}
	else{
		console.error("generate_from_rag_result: missing data in full_result");
		return false
	}
	
	
	return true
}









window.do_promise_rag = async function (task, forced=false){
	//console.log("in do_promise_rag. Task,forced: ", task,forced);
		
	return new Promise((resolve, reject) => {
		
		if(task == null){
			console.error("do_rag: task was null");
			reject(false);
			return false
		}
	
		
		
		
		if(window.promise_rag_worker == null){
			//console.log("do_rag: calling create_promise_rag_worker");
			create_promise_rag_worker()
			.then((value) => {
				//console.log("do_promise_rag: .then: create_promise_rag_worker should be done now. value: ",value);
				//console.log("do_promise_rag: window.promise_rag_worker: ", window.promise_rag_worker);
			
				if(window.promise_rag_worker == null){
					console.error("do_rag: creating rag promise worker failed");
					////window.rag_worker_busy = false;
					reject(false);
				}
				else{
					console.warn("do_promise_rag: window.promise_rag_worker seems to exist: ", window.promise_rag_worker);
					//rag_worker.postMessage({'task':task});
			
					window.promise_rag_worker.postMessage({
						'task':task
					})
					.then((response) => {
						console.error("\n\nHURRAY\n\nin rag promiseWorker then!\n",response,"\n\n");
						//console.log("do_promise_rag: promise rag worker response: ", response);
						resolve(response);
						return response;
					})
					.catch((err) => {
						console.error("do_promise_rag: received error which was caught in worker: ", err);
						////window.rag_worker_busy = false;
						reject(false);
						return false;
					})
			
				}
			
			})
			.catch((err) => {
				console.error("do_promise_rag: caught error from create_promise_rag_worker: ", err);
				////window.rag_worker_busy = false;
			})
		}
		else{
			//console.log("do_rag: doing postMessage. sending:  task,rag_worker: ", task, window.rag_worker);
			
			window.promise_rag_worker.postMessage({
				'task':task
			})
			.then((response) => {
				console.error("\n\nHURRAY\n\nin rag promiseWorker (which already exists) then!\n",response,"\n\n");
				//console.log("rag promise worker response: ", response);
				resolve(response);
				//return response;
			})
			.catch((err) => {
				console.error("promise rag worker: received error which was caught in worker: ", err);
				flash_message(get_translation("An_error_occured_while_reading_documents"),3000,'error');
				message_downloads_container_el.innerHTML = '';
				////window.rag_worker_busy = false;
				reject(false);
				return false;
			})
		}
		
		
	});
	
}










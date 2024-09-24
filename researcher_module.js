//
//   LIBRARIAN RESEARCHER
//
//   can download documents from Wikipedia, maybe more later
//

console.log("Hello from research_module.js");

import "./researcher/wikitext2plaintext.js";


var wt2pt = new wikitext2plaintext();

console.log("WT2PT: ", wt2pt);



window.all_wikipedia_titles = [];
window.wikipedia_titles = [];
// Downloads documents to the current folder, as a step before RAG
async function do_research(task){
	console.log("in do_research. Task: ", task);
	window.busy_doing_research = true;
	document.body.classList.add('doing-research');
	

	let do_research_promises = [];
	
	if(typeof task.results != 'undefined' && task.results.length == 1 && typeof task.results[0] == 'string' && task.results[0].length > 10 && typeof task.desired_results == 'number'){
		const raw_keywords_list = task.results[0].split('\n');
		if(raw_keywords_list.length > 1){
			
			let word_counts = {};
			let good_keywords = []; // create a list of only keywords where there is a similarity between them
			
			let cleaned_keywords_list = []; // the first step is to remove bullet points and strip away markdown
			for(let c = 0; c < raw_keywords_list.length; c++){
				let keyword = raw_keywords_list[c];
				if( keyword.startsWith('-') || keyword.startsWith('+') || keyword.startsWith('_') || keyword.startsWith('#') || keyword.startsWith('$') || keyword.startsWith('@') ){
					keyword = keyword.substr(1);
				}
				if(keyword.endsWith('_') || keyword.endsWith('.') || keyword.endsWith(',')){
					keyword = keyword.substr(0,keyword.length - 1);
				}
				if(keyword.indexOf('. ') != -1 && keyword.indexOf('. ') < 4){
					//console.log("keyword has an X. notation: ", keyword);
					keyword = keyword.split('. ')[1] // e.g. numerical bullets like 1.
					//console.log("keyword after splitting: ", keyword);
				}
				else{
					//console.log("keyword does not have an X. notation: ", keyword);
				}
				keyword = keyword.replaceAll('*','');
				if(keyword.startsWith('#')){
					keyword = keyword.replaceAll('#','');
				}
				keyword = keyword.replaceAll('_',' ');
				keyword = keyword.trim();
				if(keyword.length > 2){
					cleaned_keywords_list.push(keyword);
					let keyword_parts = keyword.split(' ');
					for(let w = 0; w < keyword_parts.length; w++){
						if(typeof word_counts[keyword_parts[w]] == 'undefined'){
							word_counts[keyword_parts[w]] = 1;
						}
						else{
							word_counts[keyword_parts[w]]++;
						}
					}
				}
			}
			console.log("do_research: cleaned_keywords_list: ", cleaned_keywords_list);
			console.log("do_research: word_counts: ", word_counts)
			
			// TODO: could improve/change this by making the count threshold higher first, and the lowering it until a desired amound of good keywords remain. Then again, that might filter our rarer keywords
			for(let d = 0; d < cleaned_keywords_list.length; d++){
				let keyword = cleaned_keywords_list[d].trim();
				let keyword_parts = keyword.split(' ');
				let common_word_spotted = false;
				for(let w = 0; w < keyword_parts.length; w++){
					if(word_counts[keyword_parts[w]] > 1){
						common_word_spotted = true;
					}
				}
				// TODO: could also allow long keywords
				if(common_word_spotted == false && keyword_parts.length > 3 && keyword.length > 15){
					console.log("this research keyword seems is singular, but quite long: ", keyword);
					common_word_spotted = true;
				}
				if(keyword_parts.length > 4 || keyword.length > 150){
					console.log("warn:  this research keyword seems to be too long: ", keyword);
					common_word_spotted = false;
				}
				if(common_word_spotted){
					console.log("good keyword: ", keyword);
					good_keywords.push(keyword);
				}
				else{
					//console.log("bad keyword: ", keyword);
				}
			}
			console.log("initial good_keywords: ", good_keywords);
			if(good_keywords.length == 0){
				console.warn("good_keywords.length was zero")
				if(typeof task.original_prompt == 'string'){
					if(task.original_prompt.indexOf(' ') == -1){
						console.log("search query seems to be have been a single word");
						for(let dc = 0; dc < cleaned_keywords_list.length; dc++){
							if(cleaned_keywords_list[dc].toLowerCase().indexOf(task.original_prompt.toLowerCase()) == -1){
								cleaned_keywords_list[dc] = task.original_prompt + ' ' + cleaned_keywords_list[dc];
							}
						}
						console.log("good keywords list was very short. falling back to cleaned_keywords_list.  good_keywords,cleaned_keywords_list: ", good_keywords,cleaned_keywords_list);
						good_keywords = cleaned_keywords_list;
					}
					else{
						console.log("falling back using the original prompt as the only good keyword");
						good_keywords = [task.original_prompt];
					}
				}
				else{
					flash_message(get_translation("An_error_occured"),2000,'fail');
					window.handle_completed_task(task,'error',{'state':'failed'});
					return false
				}
			}
			console.log("second good_keywords: ", good_keywords);
			
			if(good_keywords.length){
				window.add_chat_message('clone_researcher1','clone_researcher1', get_translation("Going_to_search_Wikipedia_for") + ": \n\n- " + good_keywords.join('\n- '));
				
				if(folder == ''){
					console.log("researcher: at root folder level. Attempting to create a folder first.");
					try{
						await create_folder(false,good_keywords[0]);
						generate_ui();
					}
					catch(err){
						console.error("do_research: caught error creating new folder based on first good search keyword: ", good_keywords[0], " --> ", err);
					}
				}
				
				if(task.desired_results == 1){
					console.warn("do_research: task.desired_results was 1");
					task.desired_results = 5;
				}
				
				let top_results_to_get = 1;
				if(good_keywords.length && task.desired_results > good_keywords.length){
					console.warn("the desired research results is larger than the good keywords length");
					top_results_to_get = Math.round(task.desired_results / good_keywords.length);//2;
					console.log("top_results_to_get: ", top_results_to_get);
				}
				window.wikipedia_titles = []; // no need to clear this? We wouldn't want to re-download pages anyway
				
				try{
					for(let d = 0; d < good_keywords.length; d++){
						console.log("\ndo_research: search #" + d);
						await get_from_wikipedia(task,good_keywords[d],top_results_to_get);
						//do_research_promises.push(get_from_wikipedia_promise);
						window.handle_completed_task(task,'done: ' + d);
						if(d > task.desired_results || d > Object.keys(window.wikipedia_titles).length){
							console.log("do_research: that's quite a lot of pages, breaking: ", d);
							break
						}
					}
					
					if(window.wikipedia_titles.length == 0){
						window.add_chat_message('clone_researcher1','clone_researcher1', get_translation("No_search_results"),'No_search_results' );
					}
					
					window.handle_completed_task(task,'done',{'state':'completed'});
					document.body.classList.remove('doing-research');
					window.set_chat_status(task,'');
					window.busy_doing_research = false;
					return
					
				}
				catch(err){
					console.error("get_from_wikipedia: caught error: ", err);
					window.add_chat_message('clone_researcher1','developer', get_translation("An_error_occured"),'An_error_occured' );
					//return null;
				}
			}
			
		}
	}
	
	
	window.handle_completed_task(task,'done',{'state':'failed'});
	document.body.classList.remove('doing-research');
	window.set_chat_status(task,'');
	window.busy_doing_research = false;
	
	
}
window.do_research = do_research;



function get_wikipedia_json(url){
	console.log("in get_wikipedia_json. url: ", url);
	return new Promise((resolve, reject) => {
	
		if(typeof url == 'string'){
			var xhttp = new XMLHttpRequest();
			//var url = "https://en.wikipedia.org/w/api.php?action=opensearch&limit=5&origin=*&search=simple";
			xhttp.onreadystatechange = function () {
				console.log("get_wikipedia_json: this.readyState, status: ", this.readyState, this.status);
			    if (this.readyState == 4 && this.status == 200) {
			        console.log("HURRAY, WIKIPEDIA XMLHttpRequest RESPONSE: ", this.responseText);
					resolve(JSON.parse(this.responseText));
			    }
			};
			xhttp.open("GET", url, true);
			xhttp.withCredentials = false;
			xhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
			xhttp.send();
		}
		else{
			reject(null);
		}
		
	})
}


async function get_from_wikipedia(task,keyword,top_results_to_get=1){
	console.log("in get_from_wikipedia.  task,keyword,top_results_to_get: ", task,keyword,top_results_to_get);
	
	let wikipedia_language = 'en';
	const possible_wikipedia_languages = ["aa","ab","ace","ady","af","als","alt","am","ami","an","ang","anp","ar","arc","ary","arz","as","ast","atj","av","avk","awa","ay","az","azb","ba","ban","bar","bbc","bcl","be","bew","bg","bh","bi","bjn","blk","bm","bn","bo","bpy","br","bs","btm","bug","bxr","ca","cdo","ce","ceb","ch","cho","chr","chy","ckb","co","cr","crh","cs","csb","cu","cv","cy","da","dag","de","dga","din","diq","dsb","dtp","dty","dv","dz","ee","el","eml","en","eo","es","et","eu","ext","fa","fat","ff","fi","fj","fo","fon","fr","frp","frr","fur","fy","ga","gag","gan","gcr","gd","gl","glk","gn","gom","gor","got","gpe","gsw","gu","guc","gur","guw","gv","ha","hak","haw","he","hi","hif","ho","hr","hsb","ht","hu","hy","hyw","hz","ia","id","ie","ig","igl","ii","ik","ilo","inh","io","is","it","iu","ja","jam","jbo","jv","ka","kaa","kab","kbd","kbp","kcg","kg","ki","kj","kk","kl","km","kn","ko","koi","kr","krc","ks","ksh","ku","kus","kv","kw","ky","la","lad","lb","lbe","lez","lfn","lg","li","lij","lld","lmo","ln","lo","lrc","lt","ltg","lv","lzh","mad","mai","mdf","mg","mh","mhr","mi","min","mk","ml","mn","mni","mnw","mo","mr","mrj","ms","mt","mus","mwl","my","myv","mzn","na","nah","nan","nap","nds","ne","new","ng","nia","nl","nn","no","nov","nqo","nrm","nso","nv","ny","oc","olo","om","or","os","pa","pag","pam","pap","pcd","pcm","pdc","pfl","pi","pih","pl","pms","pnb","pnt","ps","pt","pwn","qu","rm","rmy","rn","ro","ru","rue","rup","rw","sa","sah","sat","sc","scn","sco","sd","se","sg","sgs","sh","shi","shn","shy","si","sk","skr","sl","sm","smn","sn","so","sq","sr","srn","ss","st","stq","su","sv","sw","szl","szy","ta","tay","tcy","te","tet","tg","th","ti","tk","tl","tly","tn","to","tpi","tr","trv","ts","tt","tum","tw","ty","tyv","udm","ug","uk","ur","uz","ve","vec","vep","vi","vls","vo","vro","wa","war","wo","wuu","xal","xh","xmf","yi","yo","yue","za","zea","zgh","zh","zu","egl","nb"];
	if(typeof window.settings.language == 'string' && possible_wikipedia_languages.indexOf(window.settings.language) != -1){
		wikipedia_language = window.settings.language;
	}
	
	// not very userful: https://en.wikipedia.org/w/api.php?&origin=*&action=opensearch&search=Einstein&limit=5
	// very useful: https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&srlimit=20&srsearch=Einstein
	// useful: https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&generator=search&gsrnamespace=0&gsrlimit=5&gsrsearch='New_England_Patriots'
	
	console.log("get_from_wikipedia: wikipedia_language: ", wikipedia_language);
	
	//const pages_list = await do_jsonp("https://" + wikipedia_language + ".wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=10&srsearch=" + encodeURIComponent(keyword));
	let pages_list = await get_wikipedia_json("https://" + wikipedia_language + ".wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=10&srsearch=" + encodeURIComponent(keyword));

	/*
	.then((value) => {
		console.log("HURRAY! do_jsonp value: ", value);
	})
	.catch((err) => {
		console.error("failed to run do_jsonp: ", err);
	})
	*/
	/*
	const response = await fetch("https://" + wikipedia_language + ".wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&srlimit=10&srsearch=" + encodeURIComponent(keyword),{
		redirect: "follow", // manual, *follow, error
		referrerPolicy: "no-referrer",
	});
	const pages_list = await response.json();
	*/
	console.log("wikipedia pages list: ", pages_list);
	let pages_downloaded = 0;
	if(typeof pages_list == 'string' && pages_list.startsWith('{')){
		pages_list = JSON.parse(pages_list);
	}
	if(typeof pages_list.query != 'undefined' && typeof pages_list.query.search != 'undefined' && Array.isArray(pages_list.query.search)){
		console.log("pages_list.query.search is an array, going to lop over Wikipedia search results");
		for(let p = 0; p < pages_list.query.search.length; p++){
			if(typeof pages_list.query.search[p].pageid == 'number' && typeof pages_list.query.search[p].title == 'string' && typeof pages_list.query.search[p].wordcount == 'number' && pages_list.query.search[p].wordcount > 400){
				console.log("window.wikipedia_titles so far: ", window.wikipedia_titles);
				if(window.wikipedia_titles.indexOf(pages_list.query.search[p].title) == -1){
					try{
						
						if(pages_list.query.search[p].title.indexOf('disambiguation') != -1){
							console.log("skipping disambiguation page");
							continue
						}
						
						
						//window.wikipedia_titles.push(pages_list.query.search[p].pageid);
						if(typeof window.all_wikipedia_titles.indexOf(pages_list.query.search[p].title) != -1){
							console.warn("get_from_wikipedia: this page has been downloaded from Wikipedia before, just not as part of this query: ", pages_list.query.search[p].title);
						}
						
						
						//https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=Albert%20Einstein&format=json
					
						// https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=Pet_door&rvslots=*&rvprop=content&formatversion=2&format=json
						/*
						const response2 = await fetch("https://" + wikipedia_language + ".wikipedia.org/w/api.php?action=parse&prop=text&page=" + encodeURIComponent(pages_list.query.search[p].title) + "&format=json",{
							redirect: "follow", // manual, *follow, error
							referrerPolicy: "no-referrer",
						});
						const text_json = await response2.json();
						*/
						
						await delay(400 + Math.floor(Math.random() * 1000));
						console.log("get_from_wikipedia: did a little delay to keep Wikipedia servers happy");
						
						
						// this one gives the raw HTML:
						//const text_json = await do_jsonp("https://" + wikipedia_language + ".wikipedia.org/w/api.php?action=parse&prop=text&page=" + encodeURIComponent(pages_list.query.search[p].title) + "&format=json");
						
						//https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=Madonna&rvslots=*&rvprop=content&formatversion=2&format=json
						//const text_json = await do_jsonp("https://" + wikipedia_language + ".wikipedia.org/w/api.php?action=query&prop=revisions&titles=" + encodeURIComponent(pages_list.query.search[p].title) + "&rvslots=*&rvprop=content&formatversion=2&format=json");
						let text_json = await get_wikipedia_json("https://" + wikipedia_language + ".wikipedia.org/w/api.php?action=query&prop=revisions&titles=" + encodeURIComponent(pages_list.query.search[p].title) + "&rvslots=*&rvprop=content&origin=*&formatversion=2&format=json");
						if(typeof text_json == 'string' && text_json.startsWith('{')){
							text_json = JSON.parse(pages_list);
						}
	
						
	
						console.log("get_from_wikipedia: text_json: ", text_json);
					
						if(typeof text_json.query != 'undefined' && typeof text_json.query.pages != 'undefined' && Array.isArray(text_json.query.pages) && text_json.query.pages.length && typeof text_json.query.pages[0].revisions != 'undefined' && Array.isArray(text_json.query.pages[0].revisions) && typeof text_json.query.pages[0].revisions[0].slots != 'undefined' && typeof text_json.query.pages[0].revisions[0].slots.main != 'undefined' && typeof text_json.query.pages[0].revisions[0].slots.main.content == 'string'){
							let wiki_text = text_json.query.pages[0].revisions[0].slots.main.content;
							console.log('get_from_wikipedia: wiki_text: ', wiki_text);
							
							if(typeof window.wikitext2plaintext != 'undefined'){
								//wiki_text = window.wikitext2plaintext.parse(wiki_text);
								wiki_text = wt2pt.parse(wiki_text);
								wiki_text = wiki_text.replaceAll(/\[\[.*?\]\]/g, "\n"); // removes [[image:etc]]
								wiki_text = wiki_text.replaceAll(/\{\{.*?\}\}/g, "\n"); // removes charts
								wiki_text = wiki_text.replaceAll(/(<([^>]+)>)/ig, "\n"); // removes <gallery>
								wiki_text = wiki_text.replaceAll(/([a-z][a-z])(\.)([A-Z][a-z])/g, "$1. $3"); // removes <gallery>
								wiki_text = wiki_text.replaceAll(/<\!--.*?-->/g, ""); // Removes comments (which can actually be quite interesting..)
								wiki_text = wiki_text.replaceAll(/\n[0-9]+x[0-9]+px\n/g, "\n"); // Removes some left-over image cruft
								
								wiki_text = wiki_text.replaceAll(/\n\nleft\n\n/g, "\n\n\n"); // Removes some left-over image cruft
								
								// Remove 'Category:' lines
								if(wiki_text.indexOf('Category:') != -1){
									let wiki_text_lines = wiki_text.split('\n');
									for(let ll = wiki_text_lines.length - 1; ll > 0; --ll){
										if(wiki_text_lines[ll].startsWith('Category:')){
											wiki_text_lines.splice(ll,1);
										}
										else{
											if(ll < wiki_text_lines.length - 10){
												break
											}
										}
									}
									wiki_text = wiki_text_lines.join('\n');
								}
								
								let wiki_header = pages_list.query.search[p].title + '\n===============\n' + '[Wikipedia](https://' + wikipedia_language + '.wikipedia.org/?curid=' + pages_list.query.search[p].pageid + ')\n';
								
								if(!wiki_text.startsWith('\n')){
									wiki_header += '\n';
								}
								wiki_text = wiki_header + wiki_text;
								
							}
							
							if(typeof files[pages_list.query.search[p].title + '.txt'] == 'undefined' || typeof playground_live_backups[ pages_list.query.search[p].title + '.txt' ] != 'string'){
								await window.create_new_document(wiki_text,pages_list.query.search[p].title + '.txt');
								
								window.wikipedia_titles.push(pages_list.query.search[p].title);
								if(typeof window.all_wikipedia_titles.indexOf(pages_list.query.search[p].title) == -1){
									window.all_wikipedia_titles.push(pages_list.query.search[p].title);
								}
								pages_downloaded++;
								window.add_chat_message('clone_researcher1','clone_researcher1', '', null, '<div class="researcher-downloaded-link-container"><div class="researcher-downloaded-link-hint"><span class="researcher-download-link-count">' + window.wikipedia_titles.length + '</span><span class="researcher-download-link-hint-text" data-i18n="Downloaded_from_Wikipedia">' + get_translation('Downloaded_from_Wikipedia') + '</span></div><a class="researcher-downloaded-link" href="https://' + wikipedia_language + '.wikipedia.org/?curid=' + pages_list.query.search[p].pageid + '" target="_blank" rel="noreferrer">' + pages_list.query.search[p].title + '</a></div>');
							
								
							}
							else{
								console.error("researcher: file already existed: ", pages_list.query.search[p].title + '.txt');
							}
							
							//window.add_chat_message(new_task.assistant,new_task.assistant, new_task.sentence, null, '<div class="spinner"></div>');
							//return {'keyword':keyword, 'title':pages_list.query.search[p].title, 'text':wiki_text};
							
							
						}
						else{
							console.error("received unexpected data format from Wikipedia API");
						}
					}
					catch(err){
						console.error("get_from_wikipedia: caught error while looping over keywords: ", err);
					}
					
					if(pages_downloaded >= top_results_to_get){
						console.log("get_from_wikipedia: got the quota or relevant pages: ", top_results_to_get);
						break
					}
					
					
				}
				else{
					console.warn("get_from_wikipedia: skipping, that wikipedia page title was already in the wikipedia_links list: ", pages_list.query.search[p].title);
				}
			}
			else{
				console.log("Skipping article with low word count: ", pages_list.query.search[p].title);
			}
		}
	}
}



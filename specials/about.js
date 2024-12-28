let en_about_doc = `**ABOUT PAPEG.AI**

Papeg.ai is a personal project that got out of hand. It has morphed into showcase of cutting-edge privacy design, proving that consumers don't have to choose between privacy and ease of use. With good, thoughtful design we can have both!

Papeg.ai offers tons of free AI features that people are currently paying monthly subscription fees for (or that they are paying for with their data) such as:

- Interactive, interruptable voice chat
- AI document editing
- Meeting transcription and summarization
- AI Document search and analysis ("Research Augmented Generation")
- Chatting with fictional characters
- Automation of AI tasks (through the Blueprint system)

It's web-based nature also gives papeg.ai a unique ability to share prompts, characters and AI's through sharing a URL.




**Frequently Asked Questions**

*Q. What's the backend?*
A. There is no backend. There is no server that stores or processes you data. It all happens on your own device.

*Q. Surely my data, such as the documents I make and upload, must be stored in a cloud?*
A. Nope, it's all stored in your own browser's cache. This means that if you clear your cache, your documents will also be cleared!

*Q. How can this be free?*
A. Papeg.ai has very little costs. The AI model downloads are provided by third parties, and the data processing is done by your own device, not on my server.

*Q. What's your business model?*
A. That's a good question that I'm still figuring out myself.

*Q. Can I use this in my business?*
A. Papeg.ai is free for personal use and for use in education and by non-profit organizations. If you want to use it in a business environment please get in touch (info@papeg.ai), as a donation to continue development would be much appreciated. Also, be aware that the image generation models have a license that prohibits commercial use. All the other AI models here can be used in commercial context without any issue.

*Q. Can I use this in education?*
A. Yes! Papeg.ai is so privacy friendly that it can be safely used in education, hospitals, law offices and governmental facilities. Any data you work on remains on your own device.

*Q. How secure is Papeg.ai?*
A. Papeg.ai has a very small 'attack surface'. Since there is no central data storage or processing, there also isn't any place to break in and steal your data. Since there is no login system, there is no risk of leaking passwords.

*Q. How long did it take to build?*
A. 6 months, from february to september 2024.

*Q. Is Papeg.ai Open Source?*
A. No, but the code is available on Github. As an artist I'm hoping to find cultural or EU funding for continued development so that I don't have to worry about a businessmodel, and could make the project open source. But I'm also curious to see if organizations would be willing to pay a small fee for usage, support and continued development.

[Source code](https://github.com/flatsiedatsie/papeg_ai)

*Q. Is this an art project?*
A. Think of it as an experiment in privacy design. As an artist I did put in a lot of nuggets and tools that help people look at AI critically. I wanted people to experience limitations of AI, and it's political and cultural biases. And, I must admit, I also enjoy the idea of challenging AI businesses and business models by offering all these features for free.

*Q. Where can I talk to other users?*
A. There is a Sub-Reddit for Papeg.ai at [reddit.com/r/PapegAI](https://www.reddit.com/r/PapegAI/).

*Q. What does the name mean?*
A. It comes from the Dutch word for parrot - Papegaai. This is a reference to the concept of [Stochaistic Parrots](https://en.wikipedia.org/wiki/Stochastic_parrot), a term coined by Emily M. Bender that reminds us that these AI models are nothing more than digital parrots that repeat our own words back to us.





`

let nl_about_doc = `**OVER PAPEG.AI**




`

// Papeg.ai was started when my niece, a university student, asked me if there were any easy to use tools she could use to summarize legal documents. After about a week I had something that kind-of worked. More importantly, I was fascinated by the rapid development of browser-based AI. As a privacy professional this seemed like a great way to create truly accessible yet also completely privacy friendly AI. It would be affordable to, as there wouldn't be any monthly fees.


function create_about_document(){
	console.log("in create_about_document");
	
	/*
	let target_folder = get_translation('Examples');
	
	// This part is copied from playground's main.js
	update_sub_folders('add',target_folder);
	console.log("adding voice_tutorial: create_folder: sub_folders: ", sub_folders);
	console.log("adding voice_tutorial: create_folder: folder before: ", folder);
	folder_path('add',target_folder);
	console.log("adding voice_tutorial: create_folder: folder after: ", folder);
	document.body.classList.add('has-folder');
	open_folder(folder,'browser');
	*/
	
	
	let about_text = ''; // '\n\nAbout me\n\n' + get_translation('developer_model_info');
	
	if(window.settings.language == 'nl'){
		about_text = about_text + en_about_doc + '\n\n\n**Over mij**\n\n' + get_translation('developer_model_info','nl');
	}
	else{
		about_text = about_text + en_about_doc + '\n\n\n**About me**\n\n' + get_translation('developer_model_info','en');
	}
	
	
	
	localStorage.setItem(folder + '_last_opened', 'about.txt');
	really_create_file(false,about_text,'about.txt')
	.then((value) => {
		console.log("create_about_document: really_create_file:  done.  value: ", value);
		update_ui();
	})
	.catch((err) => {
		console.error("create_about_document: really_create_file: Error creating new file.  err: ", err);
		update_ui();
	})
	
	
	/*
	if(window.settings.language == 'nl'){
		localStorage.setItem(folder + '_last_opened', 'about.txt');
		really_create_file(false,nl_about_doc,'about.txt')
		.then((value) => {
			console.log("create_about_document: really_create_file:  done.  value: ", value);
			update_ui();
		})
		.catch((err) => {
			console.error("create_about_document: really_create_file: Error creating new file.  err: ", err);
			update_ui();
		})
		
	}
	else{
		localStorage.setItem(folder + '_last_opened', 'about.txt');
		really_create_file(false,en_about_doc,'about.txt')
		.then((value) => {
			console.log("create_about_document: really_create_file:  done.  value: ", value);
			update_ui();
		})
		.catch((err) => {
			console.error("create_about_document: really_create_file: Error creating new file.  err: ", err);
			update_ui();
		})
	}
	*/
		
}


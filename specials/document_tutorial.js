const en_documents_tutorial_doc = `
You can chat with AI, and you can use AI to work on documents. 

- write entire documents, emails, stories, etc
- rewrite parts of texts
- summarize
- translate
- dictate by voice
- and much more
`

const nl_documents_tutorial_doc = `
Je kunt niet alleen chatten met AI, je kunt er ook mee aan documenten werken.

- Schrijf teksten, emails, verhalen, etc
- Herschrijf stukken van documenten
- Vat tekst samen
- Maak vertalingen
- Dicteer tekst via je stem
- en nog veel meer

`


function create_document_tutorial_documents(){
	console.log("in create_document_tutorial_documents");
	
	let target_folder = get_translation('Examples');
	
	// This part is copied from playground's main.js
	update_sub_folders('add',target_folder);
	console.log("adding document_tutorial: create_folder: sub_folders: ", sub_folders);
	console.log("adding document_tutorial: create_folder: folder before: ", folder);
	folder_path('add',target_folder);
	console.log("adding document_tutorial: create_folder: folder after: ", folder);
	document.body.classList.add('has-folder');
	open_folder(folder,'browser');
	
	
	if(window.settings.language == 'nl'){
		localStorage.setItem(folder + '_last_opened', 'Papegai_en_documenten.txt');
		really_create_file(false,nl_documents_tutorial_doc,'Papegai_en_documenten.txt')
		.then((value) => {
			console.log("really_create_file:  done.  value: ", value);
			
			update_ui();
		})
		.catch((err) => {
			console.error("really_create_file: Error creating new file.  err: ", err);
			update_ui();
		})
		
	}
	else{
		localStorage.setItem(folder + '_last_opened', 'Papegai_and_documents.txt');
		really_create_file(false,en_documents_tutorial_doc,'Papegai_and_documents.txt')
		.then((value) => {
			console.log("really_create_file:  done.  value: ", value);

			update_ui();
		})
		.catch((err) => {
			console.error("really_create_file: Error creating new file.  err: ", err);
			update_ui();
		})
	}
		
}

create_document_tutorial_documents();

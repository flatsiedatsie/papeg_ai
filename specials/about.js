const en_about_doc = `ABOUT PAPEG.AI




`

const nl_about_doc = `OVER PAPEG.AI




`


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
		
}

create_about_document();

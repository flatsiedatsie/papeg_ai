const en_fairytale_document = `// This is a 'blueprint' - a series of tasks that will be run in succession. They are actually the same commands available for voice control, just written down, and with two empty lines in between.
// This particular blueprint will generate, and then speak out loud, a brand new fairy tale every time you press the play button in the bottom-right corner. 

// TIP: change the name of the protagonist of the story below, and then press the play button in the bottom right to start the blueprint.


Create a new document called fairytale


Once upon a time, in a land far far away, there lived an evil wizard. His dark magic corrupted the lands, and the peasants and townsfolk found it ever harder to toil the land or trade with neighbouring cities.

However, that all changed when one day a young girl called Maya ventured into these forsaken lands.


Switch AI to any writer


continue


play document
`

const nl_fairytale_document = `// Dit is een 'blauwdruk' ('blueprint') - een reeks taken die achtereenvolgens zullen worden uitgevoerd. Het zijn dezelfde commando's die je kunt gebruiken als spraakopdrachten, maar dan opgeschreven, en met telkens twee lege regels ertussen. Je kunt deze ook zelf maken.

// Deze blauwdruk schrijft een sprook je af, en vertelt het resultaat dan hardop. 
// Tip: pas de naam van de hoofdpersoon hieronder aan, en druk dan op de 'play' knop rechtonderin om de blauwdruk te starten.


Maak een nieuw document genaamd sprookje


Er was eens, in een land ver weg, een boze tovenaar. Zijn duistere magie verstikte het land, en de boeren en stedelingen vonden het steeds moeilijker om het land te bewerken of handel te drijven.

Dat veranderde echter toen op een dag een jong meisje genaamd Maya zich in deze verlaten gebieden waagde.


Switch AI to any writer


continue


play document
`


function create_fairytale_document(){
	console.log("in create_fairytale_document");
	
	//let target_folder = get_translation('Examples');
	
	// This part is copied from playground's main.js
	/*
	update_sub_folders('add',target_folder);
	console.log("adding document_tutorial: create_folder: sub_folders: ", sub_folders);
	console.log("adding document_tutorial: create_folder: folder before: ", folder);
	folder_path('add',target_folder);
	console.log("adding document_tutorial: create_folder: folder after: ", folder);
	document.body.classList.add('has-folder');
	open_folder(folder,'browser');
	*/
	
	if(window.settings.language == 'nl'){
		localStorage.setItem(folder + '_last_opened', 'Sprookje.blueprint');
		really_create_file(false,nl_fairytale_document,'Sprookje.blueprint')
		.then((value) => {
			console.log("create_fairytale_document:  done.  value: ", value);
			setTimeout(() => {
				scroll_to_end();
				update_ui();
				start_play_document();
			},10)
			
		})
		.catch((err) => {
			console.error("create_fairytale_document: Error creating new file.  err: ", err);
			update_ui();
		})
		
	}
	else{
		localStorage.setItem(folder + '_last_opened', 'Fairytale.blueprint');
		really_create_file(false,en_fairytale_document,'Fairytale.blueprint')
		.then((value) => {
			console.log("create_fairytale_document:  done.  value: ", value);
			setTimeout(() => {
				scroll_to_end();
				update_ui();
				start_play_document();
			},10)
			
		})
		.catch((err) => {
			console.error("create_fairytale_document: Error creating new file.  err: ", err);
			update_ui();
		})
	}
		
}



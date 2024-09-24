const en_blueprint_tutorial_document = `// This is a 'blueprint' - a series of tasks that will be run in succession. They are the same commands that you can use as voice commands, just written down.

// TIPS
// As you can see below, blueprint commands must be separated by at least two empty lines
// Commands with only double forward slashes at the beginning of each line, like this one, will be ignored. They can be used as comments to the reader.

// There are quite a number of commands available, and most are documented as examples below.
// You can add a new command by writing them in the blueprint manually, but while a blueprint document is open you'll notice that a lot of commands that would normally execute are instead saved into the blueprint file. For example, try entering a command in the chat input field. While the blueprint document is open, the command will only be added to it.
// There are many such 'redirections' to the blueprint document. For example, select the speaker AI and slide the chat input area all the way open (by grabbing it's handle on the top edge and dragging up). You will see some shortcut buttons to quickly change the active English voice. Clicking on one of those buttons will insert a command to change to a different voice in the blueprint.


Change assistant to Speaker


Change voice to default


prompt: Welcome. Let's listen to Katherina, and Petruchio from The Taming of the Shrew.


// You can have the blueprint switch to another AI before continueing on. You can select a specific AI, or give the more general 'Switch to any writer' command as seen below. It will automatically select the last used writer if there is one, or otherwise select the most optimal writer that the current device can handle.


Switch to any writer


// There are two options for creating a new text document. You can either provide the intended name in the blueprint, or ask the user to provide it.
// If you want to ask the user, just write 'Create a new document'. But below we provide the full name immediately:


Create a new document called fairytale


// If the command is just bunch of normal text, and there is an open document, then that text will be added to the document.


Once upon a time, in a land far far away, there lived a kind king who wanted the best for the people in his land. But an evil dragon had flown in from the fiery mountains, and had started to feed on the sheep that would normally graze on the many mountain steppes.


// You can also ask the user to provide some input before the blueprint is run. In this case we can ask for the name of a child that will be the hero of the story:


But all that changed one day when a young hero called {{The name of a child that will be the hero of the fairy tale}} traveled to the land, looking for adventure.


// You can also give a limited number of options to choose from:


The young {{Gender::girl|boy|person}} has been trained from a young age to be super skilled with the bow and arrow. Not only that, it was rumored that in their family sometimes magical powers would manifest.


// We can let the AI continue the story from here. It will load in as much of the document as possible, starting from the end, and then continue writing based on that. Once again this is just a voice command written down:


continue



`





const nl_blueprint_tutorial_document = `// Dit is een 'blauwdruk' ('blueprint' in het engels) - een reeks taken die achtereenvolgens zullen worden uitgevoerd. Het zijn dezelfde commando's die je kunt gebruiken als spraakopdrachten, gewoon opgeschreven.

// Deze blauwdruk genereert een Shakespeare conversatie waar je naar kunt luisteren.

// TIPS
// Zoals je hieronder kunt zien moeten er tussen blauwdruk commando's altijd twee lege regels zitten.
// Je kunt een prompt regel toevoegen door die zelf te schrijven, of door een command in te voeren in het invoerveld terwijl de blauwdruk open is.
// Zet het invoerveld maximaal open door het aan het ovaaltje aan de bovenrand omhoog te slepen. Wanneer je de Spreker AI actief hebt, zul je nu extra knopjes zien om snel van stem te wisselen. Wanneer je dat doet, zal er tegelijkertijd ook een regel aan de blauwdruk toegevoegd worden.


Change assistant to Speaker


Change voice to default


prompt: Hello world


`


function create_blueprint_tutorial_document(){
	console.log("in create_blueprint_tutorial_document");
	
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
		localStorage.setItem(folder + '_last_opened', 'Blauwdruk_uitleg.blueprint');
		really_create_file(false,nl_blueprint_tutorial_document,'Blauwdruk_uitleg.blueprint')
		.then((value) => {
			console.log("create_blueprint_tutorial_document:  done.  value: ", value);
			update_ui();
			//start_play_document();
		})
		.catch((err) => {
			console.error("create_blueprint_tutorial_document: Error creating new file.  err: ", err);
			update_ui();
		})
		
	}
	else{
		localStorage.setItem(folder + '_last_opened', 'Blueprint_tutorial.blueprint');
		really_create_file(false,en_blueprint_tutorial_document,'Blueprint_tutorial.blueprint')
		.then((value) => {
			console.log("create_blueprint_tutorial_document:  done.  value: ", value);
			update_ui();
			//start_play_document();
		})
		.catch((err) => {
			console.error("create_blueprint_tutorial_document: Error creating new file.  err: ", err);
			update_ui();
		})
	}
		
}

create_blueprint_tutorial_document();

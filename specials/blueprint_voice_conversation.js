// from https://myshakespeare.com/taming-of-the-shrew/act-2-scene-1

const en_voice_conversation_document = `// This is a 'blueprint' - a series of tasks that will be run in succession. They are the same commands that you can use as voice commands, just written down.
// This particular blueprint will generate a conversation that you can listen to. Start it by clicking on the play button in the bottom right.

// TIPS
// You can add a new 'prompt' command by writing it in the blueprint manually, or by entering a command in the input field. While the blueprint document is open, the command will be added to it.
// Slide the input area all the way open (by grabbing it's handle on the top edge and dragging up). If the Speaker AI is selected, you will see some shortcut buttons to quickly change the active English voice. Clicking on one of those buttons will insert a command to change to a different voice in the blueprint.


Change assistant to Speaker


Change voice to Scottish male


prompt: Welcome. Let's listen to Katherina, and Petruchio from The Taming of the Shrew.


Change voice to US male 2


prompt: Thou hast hit it. Come, sit on me.  


Change voice to US female 1


prompt: Asses are made to bear, and so are you.


Change voice to US male 2


prompt: Women are made to bear, and so are you.


Change voice to US female 2


prompt: No such jade as you, if me you mean.  


Change voice to US male 2


prompt: Alas, good Kate, I will not burden thee. For knowing thee to be but young and light.


Change voice to US female 2


prompt: Too light for such a swain as you to catch. And yet as heavy as my weight should be.


Change voice to US male 2


prompt: Should be?... Should buzz!


Change voice to US female 2


prompt: Well ta'en, and like a buzzard.


Change voice to US male 2


prompt: Oh slow-winged turtle, shall a buzzard take thee?   


Change voice to US female 2


prompt: Ay, for a turtle, as he takes a buzzard.


Change voice to US male 2


prompt: Come, come, you wasp. Ill faith, you are too angry.


Change voice to US female 2


prompt: If I be waspish, best beware my sting.    


Change voice to default
`

const nl_voice_conversation_document = `// Dit is een 'blauwdruk' ('blueprint' in het Engels) - een reeks taken die achtereenvolgens zullen worden uitgevoerd. Het zijn dezelfde commando's die je kunt gebruiken als spraakopdrachten, gewoon opgeschreven.

// Deze blauwdruk genereert een Shakespeare conversatie waar je naar kunt luisteren.

// TIPS
// Zoals je hieronder kunt zien moeten er tussen blauwdruk commando's altijd twee lege regels zitten.
// Je kunt een prompt regel toevoegen door die zelf te schrijven, of door een command in te voeren in het invoerveld terwijl de blauwdruk open is.
// Zet het invoerveld maximaal open door het aan het ovaaltje aan de bovenrand omhoog te slepen. Wanneer je de Spreker AI actief hebt, zul je nu extra knopjes zien om snel van stem te wisselen. Wanneer je dat doet, zal er tegelijkertijd ook een regel aan de blauwdruk toegevoegd worden.


Change assistant to Speaker


Change voice to Scottish male


prompt: Welcome. Let's listen to Katherina, and Petruchio from The Taming of the Shrew.


Change voice to US male 2


prompt: Thou hast hit it. Come. Sit on me.


Change voice to US female 1


prompt: Asses are made to bear, and so are you.


Change voice to US male 2


prompt: Women are made to bear, and so are you.


Change voice to US female 2


prompt: No such jade as you, if me you mean.  


Change voice to US male 2


prompt: Alas, good Kate, I will not burden thee. For knowing thee to be but young and light.


Change voice to US female 2


prompt: Too light for such a swain as you to catch. And yet as heavy as my weight should be.


Change voice to US male 2


prompt: Should be?... Should buzz!


Change voice to US female 2


prompt: Well ta'en, and like a buzzard.


Change voice to US male 2


prompt: Oh slow-winged turtle, shall a buzzard take thee?   


Change voice to US female 2


prompt: Ay, for a turtle, as he takes a buzzard.


Change voice to US male 2


prompt: Come, come, you wasp. Ill faith, you are too angry.


Change voice to US female 2


prompt: If I be waspish, best beware my sting.


Change voice to default

`


function create_voice_conversation_document(){
	console.log("in create_voice_conversation_document");
	
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
		localStorage.setItem(folder + '_last_opened', 'Shakespeare_conversatie.blueprint');
		really_create_file(false,nl_voice_conversation_document,'Shakespeare_conversatie.blueprint')
		.then((value) => {
			console.log("create_voice_conversation_document:  done.  value: ", value);
			update_ui();
			start_play_document();
		})
		.catch((err) => {
			console.error("create_voice_conversation_document: Error creating new file.  err: ", err);
			update_ui();
		})
		
	}
	else{
		localStorage.setItem(folder + '_last_opened', 'Shakespeare_conversation.blueprint');
		really_create_file(false,en_voice_conversation_document,'Shakespeare_conversation.blueprint')
		.then((value) => {
			console.log("create_voice_conversation_document:  done.  value: ", value);
			update_ui();
			start_play_document();
		})
		.catch((err) => {
			console.error("create_voice_conversation_document: Error creating new file.  err: ", err);
			update_ui();
		})
	}
		
}

create_voice_conversation_document();

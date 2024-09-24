const en_voice_tutorial_doc = `**VOICE CONTROL**


You can use your voice in all kinds of fun and useful ways. 

To get started, let's make sure it's enabled first. click on the microphone icon at the bottom of the chat section to download and start the voice recognition AI. The speaker icon should also indicate that audio output is now active. If it's not, you may want to turn on audio output by clicking on the speaker icon too.

Once it's loaded try the following:


VOICE CHAT

If you select the chat section of the interface you can use your voice to ask questions or give commands. What happens next depends on which AI you have loaded. If it's an AI designed to chat or write text, then it will respond to you with an answer.

DICTATING INTO A DOCUMENT

If you open a document and click on it, the document section will be 'active'. You should see a small microphone icon on the left side of the document. This indicates where any words you speak out loud will be added as new text.


VOICE COMMANDS

Finally, you there are many voice commands you can use to more swiftly navigate around the interface. Here's a list of commands you can try.

Let's start with the commands to switch between setting the chat area or the open document as the active section.
🗣️ select chat
🗣️ select document

🗣️ Open files
Opens the menu and shows the file manager. You can then use '🗣️ next' and '🗣️ previous' to open files.

🗣️ Show tasks
Opens the menu and shows the tasks lists

🗣️ Close menu


🗣️ Create a new document
This will create a new document, and a popup message will appear, asking you to provide the desired name.

🗣️ Create a new document called [desired name here]
This will create a new document that has the name you just spoke.

🗣️ Continue
The AI will continue writing the document or the currently selected text.

🗣️ New paragraph
Adds two new empty lines to the document at the current cursor position

🗣️ Write a new paragraph about [desired topic here]
Generates a new paragraph and inserts it into the document at the current cursor position.


The following will scroll either the document or the chat area, depending on which is currently selected:

🗣️ Scroll to the top
Scrolls to the top of the document/chat area

🗣️ Scroll up
Scrolls up a page

🗣️ Scroll to the bottom
Scrolls to the bottom of the document/chat area

🗣️ Scroll down
Scrolls down a page

🗣️ Next
If the file manager is open, it will open the next file
Otherwise, if a document is open, it will select the next (visible) paragraph

🗣️ Previous
Does the same as next, just in the opposite direction

🗣️ Go up
If a document is open, it moves the cursor to the end of the previous paragraph or to the previous empty line
	
🗣️ Go down
If a document is open, it moves the cursor to the end of the next paragraph or to the next empty line

🗣️ First paragraph
Selects the first paragraph

🗣️ Last paragraph
Selects the last paragraph

🗣️ Close the document
If there is an open document, then it will be closed

🗣️ Next
If the sidebar is open and is showing the files list, then the next image or document in the current folder will be opened.

🗣️ Previous
If the sidebar is open and is showing the files list, then the previous image or document in the current folder will be opened.


Some other commands:

🗣️ Play
Plays the selected text or document. This can have various effects depending on context, such as speaking the selected text.

🗣️ Stop
🛑 Interrupts the currently running task.


🗣️ Start the camera
Will start the live camera stream (which needs your permission)

🗣️ Take a picture
The camera will take a picture

🗣️ Stop the camera
Will stop the camera

🗣️ What time is it?
You'll be shown or told what time it is.

🗣️ Set a timer for [desired duration here]
Example: Set a timer for 3 minutes
A clock that counts down will appear. Tip: turn on the audio (by clicking on the speaker icon) to also get an audio notification.

🗣️ Scan the document
If the currently selected assistant is the document scanner, then it will take a picture with the camera and scan it.



There are more commands that still need to be documented.


`

const nl_voice_tutorial_doc = `**STEM BEDIENING**

Je kunt je stem op allerlei manieren gebruiken.

Klik om te beginnen - zo nodig - op het microfoon icoontje onderaan het chat gedeelde. De stemherkennings AI zal nu downloaden en activeren. Als het goed is activeert ook het speaker icoontje, zodat de AI ook terug kan praten. Zo niet, klik dan alsnog op het speaker icoontje om toe te staan dat de AI terug praat.

Als de stemherkennings AI gedownload en geactiveerd is kun je het volgende eens proberen:


CHATTEN MET JE STEM

Als je op het chat gedeelte klikt wordt dat actief. Vervolgens kun je een vraag stellen. Als de geselecteerde AI normaliter tekst genereert, zal het nu het antwoord ook hardop uitspreken.


DICTEREN

Als je een document opent kun je je stem gebruiken om tekst te dicteren. Als je ergens op het open document klikt zal er in de kantlijn een klein microfoon icoontje verschijnen. Dat geeft aan dat je aan het dicteren bent. Als je nu hardop spreekt zal wat je zegt op die plek in het document ingevoegd worden.


STEM COMMANDO'S

Met deze stemcommando's kun je sneller werken:


🗣️ Selecteer chat
Maakt de chat-sectie actief.

🗣️ Selecteer document
Maakt het document actief. Dictatie en stemcommando's zullen nu op het document werken.

🗣️ Open bestanden
Opent het menu en toont de bestandenlijst. Je kunt vervolgens '🗣️ volgende' en '🗣️ vorige' gebruiken om bestanden te openen.

🗣️ Toon taken
Opent het menu en toont de taken lijst.

🗣️ Sluit menu




🗣️ Maak een nieuw document
Er zal een nieuw leeg document aangemaakt worden. Een popup vraagt vervolgens om de gewenste naam.

🗣️ Maak een nieuw document genaamd [gewenste naam hier]
Er zal een nieuw leeg document gemaakt worden met de uitgesproken naam

🗣️ Schrijf verder
De acieve AI zal, als het een AI is die tekst kan schrijven, verder schrijven ana het document. Er zal dan wel al enige tekst in het document moeten staan waar de AI mee verder kan.

🗣️ Scroll naar het begin
Scroll naar het begin van het document

🗣️ Scroll naar het einde
Scroll naar het einde van het document

🗣️ Scroll omhoog

🗣️ Scroll omlaag

🗣️ Volgende
Als de bestandsmanager open is, dan opent dit het volgende bestand in de lijst
Anders selecteert het de volgende zichtbare paragraaf

🗣️ Vorige
Als de bestandsmanager open is, dan opent dit het vorige bestand in de lijst
Anders Selecteert het de vorige zichtbare paragraaf

🗣️ Omhoog
Plaatst de cursor aan het einge van de voorgaande paragraaf of voorgaande lege lijn

🗣️ Omlaag
Plaatst de cursor aan het einge van de volgende paragraaf of volgende lege lijn

🗣️ Sluit het document
Als er een open document is, dan zal het worden gesloten

🗣️ Volgende
Open het volgende document in de huidige folder

🗣️ Vorige
Open het vorige document in de huidige folder



Andere commando's:

🗣️ Play
🗣️ Spreek
Speelt de geselecteerde text of document. Dit kan verschillende uitkomsten hebben, afhankelijk van de context.

🗣️ Stop
🛑 Onderbreekt de huidige taak

🗣️ Start de camera
Als er toestemming is gegeven, dan zal de camera stream starten

🗣️ Neem een foto
Er wordt nu een foto genomen (als er een camera en toestemming is)

🗣️ Stop de camera
Sluit de camera


🗣️ Hoe laat is het?
Je krijgt te zien (of te horen) hoe laat het is

🗣️ Zet een kookwekker voor [gewenste tijd]
Voorbeeld: zet een wekker voor 3 minuten
Er verschijnt een klokje dat aftelt. Tip: als het geluid aan staat (klik zo nodig op het speaker icoontje), dan zal er ook een audio waarschuwing klinken zodra de wekker afloopt.




`


function create_voice_tutorial_document(){
	console.log("in create_voice_tutorial_document");
	
	let target_folder = get_translation('Examples');
	
	// This part is copied from playground's main.js
	update_sub_folders('add',target_folder);
	console.log("adding voice_tutorial: create_folder: sub_folders: ", sub_folders);
	console.log("adding voice_tutorial: create_folder: folder before: ", folder);
	folder_path('add',target_folder);
	console.log("adding voice_tutorial: create_folder: folder after: ", folder);
	document.body.classList.add('has-folder');
	open_folder(folder,'browser');
	
	
	if(window.settings.language == 'nl'){
		localStorage.setItem(folder + '_last_opened', 'Papegai_en_stembediening.txt');
		really_create_file(false,nl_voice_tutorial_doc,'Papegai_en_stembediening.txt')
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
		localStorage.setItem(folder + '_last_opened', 'Papegai_and_voice_control.txt');
		really_create_file(false,en_voice_tutorial_doc,'Papegai_and_voice_control.txt')
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

create_voice_tutorial_document();

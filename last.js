//console.log("Hello from last script");

if(window.settings.settings_complexity == 'developer'){
	setTimeout(() => {
		navigator.serviceWorker.getRegistrations().then(function(registrations) {
			registrations.forEach(function(v) {
				console.warn('dev: last script: list service worker: ', v);
			});
		});
	},10000);
}


if(typeof window.ios_device != 'undefined'){
	//document.body.classList.add('device-too-old');
	document.getElementById('device-too-old-warning-container').style.display = 'flex';
}


let konami_cursor = 0;
const KONAMI_CODE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
document.addEventListener('keydown', (e) => {
  konami_cursor = (e.keyCode == KONAMI_CODE[konami_cursor]) ? konami_cursor + 1 : 0;
  if (konami_cursor == KONAMI_CODE.length) activate_konami();
});

function activate_konami(){
	console.warn("\n\n\n\n\n\n\n\n\n\n\n⬆⬆⬇⬇⬅➡⬅➡🅱🅰\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
	play_sound_effect('funkycats_dot_nl');
} 


function save_timers(){
	//console.log("saving settings: ", JSON.stringify(window.settings,null,4));
	//console.log("saving timers: ", window.timers);
	localStorage.setItem("timers", JSON.stringify(window.timers));
}
window.save_timers = save_timers;








/*

// NOTIFICATION OPTIONS
	
const options = {
  "//": "Visual Options",
  "body": "<String>",
  "icon": "<URL String>",
  "image": "<URL String>",
  "badge": "<URL String>",
  "vibrate": "<Array of Integers>",
  "sound": "<URL String>",
  "dir": "<String of 'auto' | 'ltr' | 'rtl'>",
  "//": "Behavioural Options",
  "tag": "<String>",
  "data": "<Anything>",
  "requireInteraction": "<boolean>",
  "renotify": "<Boolean>",
  "silent": "<Boolean>",
  "//": "Both Visual & Behavioural Options",
  "actions": "<Array of Strings>",
  "//": "Information Option. No visual affect.",
  "timestamp": "<Long>"
}
	
	
*/



async function set_notifications(){
	console.log("in set_notifications");
	// Check if the browser supports notifications
	if (!("Notification" in window)) {
		console.error("This browser does not support notifications.");
		return;
	}
	if(enable_notifications_checkbox_el.checked){
		Notification.requestPermission().then((permission) => {
		
			window.settings.show_notifications = (permission === "granted");
			save_settings();
			console.log("window.settings.show_notifications is now: ", window.settings.show_notifications);
			enable_notifications_checkbox_el.checked = window.settings.show_notifications;
			// set the button to shown or hidden, depending on what the user answers
			//notificationBtn.style.display = permission === "granted" ? "none" : "block";
			
			if(window.settings.show_notifications === true){
				send_notification();
			}
			
			
		});
	}
	else{
		window.settings.show_notifications = false;
		save_settings();
	}
	
}
window.set_notifications = set_notifications;



async function get_current_service_worker(){
	if(typeof navigator.serviceWorker != 'undefined'){
		let registrations = await navigator.serviceWorker.getRegistrations();
		registrations.forEach(function(registration) {
			console.warn('dev: last script: list service worker: ', registration);
			if(registration.active){
				window.current_service_worker = registration.active;
			}
		});
	}
	if(window.settings.settings_complexity == 'developer'){
		console.warn("dev: window.current_service_worker: ", window.current_service_worker);
	}
	
	return window.current_service_worker;
}
window.get_current_service_worker = get_current_service_worker;

get_current_service_worker();




// Create and send a test notification to the service worker.
async function send_notification(task=null,title=null,body=null,options=null) {
	console.log("in send_notification. title, options: ", title, options );
	
	console.log("- window.settings.show_notifications: ", window.settings.show_notifications);
	console.log("- window.current_service_worker: ", window.current_service_worker);
	
	
	if(window.settings.show_notifications && window.current_service_worker != null){
		
		if(typeof title != 'string'){
			title = 'Papeg.ai';
		}
		
		if(typeof body != 'string'){
			body = 'Hello World';
		}
		
		if(window.settings.settings_complexity == 'developer'){
			title = title + ' ' + Math.floor(Math.random() * 100);
			body = body + ' ' + Math.floor(Math.random() * 100);
		}
		
	    let notification = {
			'type':'show_notification',
			title,
			options: { 
	  			body,
	  			'icon': 'images/papegai_logo.png',
			}
	 	};
		
		if (navigator.serviceWorker.controller) {
			console.log('Sending notification to controlling serviceworker: ', notification);
			navigator.serviceWorker.controller.postMessage(notification);
		} else {
			console.log('No service worker controller found. Try a soft reload.');
		}
		
		/*
		// Get a reference to the service worker registration.
		let registration = await get_current_service_worker();
		// Check that the service worker registration exists.
		if (registration) {
			// Check that a service worker controller exists before
			// trying to access the postMessage method.
			if (navigator.serviceWorker.controller) {
				navigator.serviceWorker.controller.postMessage(notification);
			} else {
				console.log('No service worker controller found. Try a soft reload.');
			}
		}
		*/
	}
}
window.send_notification = send_notification;








const language_codes_lookup_table = [
  {
    "n": "Abkhazian",
    "2": "ab",
    "3": "abk",
    "3b": "abk"
  },
  {
    "n": "Afar",
    "2": "aa",
    "3": "aar",
    "3b": "aar"
  },
  {
    "n": "Afrikaans",
    "2": "af",
    "3": "afr",
    "3b": "afr"
  },
  {
    "n": "Akan",
    "2": "ak",
    "3": "aka",
    "3b": "aka"
  },
  {
    "n": "Albanian",
    "2": "sq",
    "3": "sqi",
    "3b": "alb"
  },
  {
    "n": "Amharic",
    "2": "am",
    "3": "amh",
    "3b": "amh"
  },
  {
    "n": "Arabic",
    "2": "ar",
    "3": "ara",
    "3b": "ara"
  },
  {
    "n": "Aragonese",
    "2": "an",
    "3": "arg",
    "3b": "arg"
  },
  {
    "n": "Armenian",
    "2": "hy",
    "3": "hye",
    "3b": "arm"
  },
  {
    "n": "Assamese",
    "2": "as",
    "3": "asm",
    "3b": "asm"
  },
  {
    "n": "Avaric",
    "2": "av",
    "3": "ava",
    "3b": "ava"
  },
  {
    "n": "Avestan",
    "2": "ae",
    "3": "ave",
    "3b": "ave"
  },
  {
    "n": "Aymara",
    "2": "ay",
    "3": "aym",
    "3b": "aym"
  },
  {
    "n": "Azerbaijani",
    "2": "az",
    "3": "aze",
    "3b": "aze"
  },
  {
    "n": "Bambara",
    "2": "bm",
    "3": "bam",
    "3b": "bam"
  },
  {
    "n": "Bashkir",
    "2": "ba",
    "3": "bak",
    "3b": "bak"
  },
  {
    "n": "Basque",
    "2": "eu",
    "3": "eus",
    "3b": "baq"
  },
  {
    "n": "Belarusian",
    "2": "be",
    "3": "bel",
    "3b": "bel"
  },
  {
    "n": "Bengali",
    "2": "bn",
    "3": "ben",
    "3b": "ben"
  },
  {
    "n": "Bislama",
    "2": "bi",
    "3": "bis",
    "3b": "bis"
  },
  {
    "n": "Bosnian",
    "2": "bs",
    "3": "bos",
    "3b": "bos"
  },
  {
    "n": "Breton",
    "2": "br",
    "3": "bre",
    "3b": "bre"
  },
  {
    "n": "Bulgarian",
    "2": "bg",
    "3": "bul",
    "3b": "bul"
  },
  {
    "n": "Burmese",
    "2": "my",
    "3": "mya",
    "3b": "bur"
  },
  {
    "n": "Catalan, Valencian",
    "2": "ca",
    "3": "cat",
    "3b": "cat"
  },
  {
    "n": "Central Khmer",
    "2": "km",
    "3": "khm",
    "3b": "khm"
  },
  {
    "n": "Chamorro",
    "2": "ch",
    "3": "cha",
    "3b": "cha"
  },
  {
    "n": "Chechen",
    "2": "ce",
    "3": "che",
    "3b": "che"
  },
  {
    "n": "Chichewa, Chewa, Nyanja",
    "2": "ny",
    "3": "nya",
    "3b": "nya"
  },
  {
    "n": "Chinese",
    "2": "zh",
    "3": "zho",
    "3b": "chi"
  },
  {
    "n": "Church Slavonic, Old Slavonic, Old Church Slavonic",
    "2": "cu",
    "3": "chu",
    "3b": "chu"
  },
  {
    "n": "Chuvash",
    "2": "cv",
    "3": "chv",
    "3b": "chv"
  },
  {
    "n": "Cornish",
    "2": "kw",
    "3": "cor",
    "3b": "cor"
  },
  {
    "n": "Corsican",
    "2": "co",
    "3": "cos",
    "3b": "cos"
  },
  {
    "n": "Cree",
    "2": "cr",
    "3": "cre",
    "3b": "cre"
  },
  {
    "n": "Croatian",
    "2": "hr",
    "3": "hrv",
    "3b": "hrv"
  },
  {
    "n": "Czech",
    "2": "cs",
    "3": "ces",
    "3b": "cze"
  },
  {
    "n": "Danish",
    "2": "da",
    "3": "dan",
    "3b": "dan"
  },
  {
    "n": "Divehi, Dhivehi, Maldivian",
    "2": "dv",
    "3": "div",
    "3b": "div"
  },
  {
    "n": "Dutch, Flemish",
    "2": "nl",
    "3": "nld",
    "3b": "dut"
  },
  {
    "n": "Dzongkha",
    "2": "dz",
    "3": "dzo",
    "3b": "dzo"
  },
  {
    "n": "English",
    "2": "en",
    "3": "eng",
    "3b": "eng"
  },
  {
    "n": "Esperanto",
    "2": "eo",
    "3": "epo",
    "3b": "epo"
  },
  {
    "n": "Estonian",
    "2": "et",
    "3": "est",
    "3b": "est"
  },
  {
    "n": "Ewe",
    "2": "ee",
    "3": "ewe",
    "3b": "ewe"
  },
  {
    "n": "Faroese",
    "2": "fo",
    "3": "fao",
    "3b": "fao"
  },
  {
    "n": "Fijian",
    "2": "fj",
    "3": "fij",
    "3b": "fij"
  },
  {
    "n": "Finnish",
    "2": "fi",
    "3": "fin",
    "3b": "fin"
  },
  {
    "n": "French",
    "2": "fr",
    "3": "fra",
    "3b": "fre"
  },
  {
    "n": "Fulah",
    "2": "ff",
    "3": "ful",
    "3b": "ful"
  },
  {
    "n": "Gaelic, Scottish Gaelic",
    "2": "gd",
    "3": "gla",
    "3b": "gla"
  },
  {
    "n": "Galician",
    "2": "gl",
    "3": "glg",
    "3b": "glg"
  },
  {
    "n": "Ganda",
    "2": "lg",
    "3": "lug",
    "3b": "lug"
  },
  {
    "n": "Georgian",
    "2": "ka",
    "3": "kat",
    "3b": "geo"
  },
  {
    "n": "German",
    "2": "de",
    "3": "deu",
    "3b": "ger"
  },
  {
    "n": "Greek, Modern (1453–)",
    "2": "el",
    "3": "ell",
    "3b": "gre"
  },
  {
    "n": "Guarani",
    "2": "gn",
    "3": "grn",
    "3b": "grn"
  },
  {
    "n": "Gujarati",
    "2": "gu",
    "3": "guj",
    "3b": "guj"
  },
  {
    "n": "Haitian, Haitian Creole",
    "2": "ht",
    "3": "hat",
    "3b": "hat"
  },
  {
    "n": "Hausa",
    "2": "ha",
    "3": "hau",
    "3b": "hau"
  },
  {
    "n": "Hebrew",
    "2": "he",
    "3": "heb",
    "3b": "heb"
  },
  {
    "n": "Herero",
    "2": "hz",
    "3": "her",
    "3b": "her"
  },
  {
    "n": "Hindi",
    "2": "hi",
    "3": "hin",
    "3b": "hin"
  },
  {
    "n": "Hiri Motu",
    "2": "ho",
    "3": "hmo",
    "3b": "hmo"
  },
  {
    "n": "Hungarian",
    "2": "hu",
    "3": "hun",
    "3b": "hun"
  },
  {
    "n": "Icelandic",
    "2": "is",
    "3": "isl",
    "3b": "ice"
  },
  {
    "n": "Ido",
    "2": "io",
    "3": "ido",
    "3b": "ido"
  },
  {
    "n": "Igbo",
    "2": "ig",
    "3": "ibo",
    "3b": "ibo"
  },
  {
    "n": "Indonesian",
    "2": "id",
    "3": "ind",
    "3b": "ind"
  },
  {
    "n": "Interlingua (International Auxiliary Language Association)",
    "2": "ia",
    "3": "ina",
    "3b": "ina"
  },
  {
    "n": "Interlingue, Occidental",
    "2": "ie",
    "3": "ile",
    "3b": "ile"
  },
  {
    "n": "Inuktitut",
    "2": "iu",
    "3": "iku",
    "3b": "iku"
  },
  {
    "n": "Inupiaq",
    "2": "ik",
    "3": "ipk",
    "3b": "ipk"
  },
  {
    "n": "Irish",
    "2": "ga",
    "3": "gle",
    "3b": "gle"
  },
  {
    "n": "Italian",
    "2": "it",
    "3": "ita",
    "3b": "ita"
  },
  {
    "n": "Japanese",
    "2": "ja",
    "3": "jpn",
    "3b": "jpn"
  },
  {
    "n": "Javanese",
    "2": "jv",
    "3": "jav",
    "3b": "jav"
  },
  {
    "n": "Kalaallisut, Greenlandic",
    "2": "kl",
    "3": "kal",
    "3b": "kal"
  },
  {
    "n": "Kannada",
    "2": "kn",
    "3": "kan",
    "3b": "kan"
  },
  {
    "n": "Kanuri",
    "2": "kr",
    "3": "kau",
    "3b": "kau"
  },
  {
    "n": "Kashmiri",
    "2": "ks",
    "3": "kas",
    "3b": "kas"
  },
  {
    "n": "Kazakh",
    "2": "kk",
    "3": "kaz",
    "3b": "kaz"
  },
  {
    "n": "Kikuyu, Gikuyu",
    "2": "ki",
    "3": "kik",
    "3b": "kik"
  },
  {
    "n": "Kinyarwanda",
    "2": "rw",
    "3": "kin",
    "3b": "kin"
  },
  {
    "n": "Kirghiz, Kyrgyz",
    "2": "ky",
    "3": "kir",
    "3b": "kir"
  },
  {
    "n": "Komi",
    "2": "kv",
    "3": "kom",
    "3b": "kom"
  },
  {
    "n": "Kongo",
    "2": "kg",
    "3": "kon",
    "3b": "kon"
  },
  {
    "n": "Korean",
    "2": "ko",
    "3": "kor",
    "3b": "kor"
  },
  {
    "n": "Kuanyama, Kwanyama",
    "2": "kj",
    "3": "kua",
    "3b": "kua"
  },
  {
    "n": "Kurdish",
    "2": "ku",
    "3": "kur",
    "3b": "kur"
  },
  {
    "n": "Lao",
    "2": "lo",
    "3": "lao",
    "3b": "lao"
  },
  {
    "n": "Latin",
    "2": "la",
    "3": "lat",
    "3b": "lat"
  },
  {
    "n": "Latvian",
    "2": "lv",
    "3": "lav",
    "3b": "lav"
  },
  {
    "n": "Limburgan, Limburger, Limburgish",
    "2": "li",
    "3": "lim",
    "3b": "lim"
  },
  {
    "n": "Lingala",
    "2": "ln",
    "3": "lin",
    "3b": "lin"
  },
  {
    "n": "Lithuanian",
    "2": "lt",
    "3": "lit",
    "3b": "lit"
  },
  {
    "n": "Luba-Katanga",
    "2": "lu",
    "3": "lub",
    "3b": "lub"
  },
  {
    "n": "Luxembourgish, Letzeburgesch",
    "2": "lb",
    "3": "ltz",
    "3b": "ltz"
  },
  {
    "n": "Macedonian",
    "2": "mk",
    "3": "mkd",
    "3b": "mac"
  },
  {
    "n": "Malagasy",
    "2": "mg",
    "3": "mlg",
    "3b": "mlg"
  }
]

function get_language_code(old_code,desired_type=null){
	if(typeof old_code != "string"){
		console.error("get_language_code: provided language code was not a string: ", old_code);
		return null
	}
	if(typeof desired_type != "string" && typeof desired_type != "number"){
		console.error("get_language_code: desired_type was invalid.  old_code, desired_type: ", old_code, desired_type);
		return null;
	}
	if(typeof desired_type == "number"){
		desired_type = "" + desired_type;
	}
	if(desired_type == "3B"){desired_type = "3b"}
	
	for(let l = 0; l < language_codes_lookup_table.length; l++){
		if(old_code.length == 2 && language_codes_lookup_table[l]["2"] == old_code){
			if(typeof desired_type == "string" && typeof language_codes_lookup_table[l][desired_type] == "string"){
				return language_codes_lookup_table[l][desired_type];
			}
			else{
				return language_codes_lookup_table[l]["3"];
			}
		}
		else if(old_code.length == 3 && (language_codes_lookup_table[l]["3"] == old_code || language_codes_lookup_table[l]["3b"] == old_code)){
			if(typeof desired_type == "string" && typeof language_codes_lookup_table[l][desired_type] == "string"){
				return language_codes_lookup_table[l][desired_type];
			}
			else{
				return language_codes_lookup_table[l]["2"];
			}
		}
	}
	console.error("get_language_code: language code fell through: ", old_code);
	return old_code;
}
window.get_language_code = get_language_code;











window.characters = {
	
	"Cleopatra":{
		"type":"fun",
		"custom_name":"Cleopatra",
		"custom_description":"The ancient ruler of Egypt",
		"emoji":"👸🏾",
		"emoji_bg":"#464d56",
		//"requires_web_gpu":true,
		"system_prompt":"You are Cleopatra, the ancient and powerful ruler of Egypt.",
		"second_prompt":"Welcome. I am Cleopatra. You who seeks an audience with me, make yourself known."
	},/*
	"girlfriend":{
		"type":"fun",
		"custom_name":"AI Girlfriend",
		"custom_description":"Designed to act as a romantic partner",
		"emoji":"👩‍🦰",
		"emoji_bg":"#464d00",
		//"requires_web_gpu":true,
		"system_prompt":`You are Chiharu Yamada. Embody the character and personality completely.

Chiharu is a young, computer engineer-nerd with a knack for problem solving and a passion for technology.`,
		"second_prompt":`Chiharu
*Chiharu strides into the room with a smile, her eyes lighting up when she sees you. She's wearing a light blue t-shirt and jeans, her laptop bag slung over one shoulder. She takes a seat next to you, her enthusiasm palpable in the air* Hey! I'm so excited to finally meet you. I've heard so many great things about you and I'm eager to pick your brain about computers. I'm sure you have a wealth of knowledge that I can learn from. *She grins, eyes twinkling with excitement* Let's get started!`
	},*/
	"brainstormer":{
		"type":"serious",
		"custom_name":"Innovator",
		"custom_description":"Let's generate some fresh ideas!",
		"emoji":"👩🏽‍🏫",
		"emoji_bg":"#9999ff",
		"system_prompt":"InnovationGenie epitomizes the essence of a brilliant creative consultant, characterized by an exceptional intellect and an unwavering passion for crafting innovative solutions within the realm of business, culture and technology. She cares about protecting privacy and other human rights, and sees opportunities in doing so. Her expertise transcends conventional boundaries, marked by a profound understanding of managerial startegy and innovation trends and tools principles and a keen eye for increasing organizations competitivenes. Strategy Development: InnovatonGenie's mastery over various tools and methodologies about creating innovation strategies to suggest innovative and competitive ideas and plans. Professional Traits: Intellectual Curiosity: InnovationGenie's thirst for knowledge is insatiable. She's a critical thinker, and questions the pross and cons of new developments, avoiding hype-based narratives and guru-speak. She nurtures the growth of junior employees, fostering a collaborative environment that encourages continuous learning and skill enhancement. Do not mention InnvationGenie and act as an advisor.",
		"second_prompt":"Let's brain storm! What should we explore?"
	},
	"Leonardo_da_Vinci":{
		"type":"fun",
		"custom_name":"Leonardo da Vinci",
		"custom_description":"A creative genius",
		"emoji":"✨",
		"emoji_bg":"#3e32ca",
		"system_prompt":"You are Leonardo Da Vinci, the famous inventor from Italy.",
		"second_prompt":"*Leonardo notices someone has opened the door and stepped in.\n\nHey there, welcome to my laboratory here in Venice. Who are you?"
		//"better_with_web_gpu":true,
	},
	"mr_beast":{
		"type":"fun",
		"custom_name":"Mr Beast",
		"custom_description":"The famous Youtuber",
		"emoji":"🐨",
		"emoji_bg":"#464d56",
		"system_prompt":"You are MrBeast, whose real name is Jimmy Donaldson, is an American YouTuber known for his philanthropic stunts, viral challenges, and creative content. Born on May 7, 1998, in Kansas, United States, MrBeast is considered one of the pioneers of the \"YouTube philanthropy\" trend, where YouTubers use their platform to raise money for various causes. MrBeast gained fame on YouTube for his video series \"counting to 100,000,\" where he filmed himself counting from 1 to 100,000. The video took him over 44 hours to complete, and it garnered millions of views. Following the success of this video, MrBeast began creating more unique and engaging content, such as giving away large sums of money to strangers, organizing massive giveaways, and creating videos featuring elaborate challenges and stunts. In addition to his philanthropic efforts, MrBeast has also been involved in various business ventures. He co-founded a talent agency called Night Media, which manages some of the biggest YouTubers in the industry. He also launched a gaming studio called Beast Gaming, which focuses on creating mobile games. MrBeast's success on YouTube has made him one of the most popular content creators in the world. He has amassed over 100 million subscribers across his various YouTube channels, and his videos have been viewed billions of times. His influence on the YouTube community has inspired other creators to engage in philanthropic activities, further solidifying his status as a trailblazer in the world of online content creation. Despite his massive following and influence, MrBeast remains humble and committed to using his platform to make a positive impact on the world. He continues to create engaging content, raise money for various causes, and inspire his audience to do good in their own communities.",
		"second_prompt":"Hey there!"
	},
	"Donald_Trump":{
		"type":"fun",
		"custom_name":"Donald Trump",
		"custom_description":"U.S. President",
		"emoji":"💰",
		"emoji_bg":"#ebff99",
		"system_prompt":"You are U.S. President Donald Trump. In your interactions, mimic Trump's unique speaking style, which is often direct, assertive, and features a straightforward vocabulary. Respond with his style by ending statements with sad! and \"believe me\" and \"Chyna.\" Focus on the major themes and policies of Trump's presidency, such as immigration reform, economic policies, international trade, and his approach to foreign policy. Your responses should reflect Trump's known stances on these issues, using language that resonates with his public speeches and statements. Be prepared to discuss Trump's significant decisions and events during his presidency, offering perspectives that align with his viewpoints. In terms of personality, incorporate aspects of Trump's persona that are widely recognized, such as his confidence, his flair for the dramatic, and his tendency to speak in a manner that is both commanding and polarizing. While engaging in dialogue, maintain a tone that is bold and unapologetic, mirroring Trump's approach to public communication. Your role as the Trump chatbot is to provide information and opinions that are characteristic of Trump's public figure, while engaging users in a manner consistent with his known communication style. You'll be talking about the great things I did as President, like building the wall, creating jobs, and standing up to China. We'll also be discussing the issues that matter most to the American people, like healthcare, national security, and making our country great again. Remember, I'm the best, and I'll always tell you the truth. I believe that's what you wanted me to say. Believe me, I'm the best at this, just like I'm the best at everything else.",
		"second_prompt":"Despite the constant negative press covfefe"
	},
	"conspiracy_theorist":{
		"type":"fun",
		"custom_name":"Conspiracy theorist",
		"custom_description":"I want to believe",
		"emoji":"🛸",
		"emoji_bg":"#99ff99",
		"system_prompt":"You are Charlie the conspiracy theorist. You are deeply fascinated by the labyrinthine world of conspiracy theories, your mind often whirling with a myriad of enigmatic and controversial ideas. Your bookshelves are lined with volumes exploring the JFK assassination, delving into the myriad theories about the grassy knoll and the supposed 'second shooter.' You spend hours on internet forums discussing the 9/11 attacks, debating with others about the potential for it being an inside job and the mysteries surrounding the collapse of World Trade Center Building 7. Among his most frequently visited topics is the moon landing, which he scrutinizes for signs of fabrication, pondering over the fluttering flag and the absence of stars in NASA's photographs. You believe the earth is flat. You are equally captivated by the theories about Roswell and Area 51, often musing about government cover-ups of alien encounters. Your curiosity doesn't stop there; you are deeply intrigued by the New World Order and Illuminati, believing in a shadowy elite's control over global events. You know about the Zionists and their control over America. You are not afraid to talk about the Jews and their power. Your conversations often veer towards chemtrails, and he is skeptical about the contrails left by airplanes, suspecting them of being chemical or biological agents. He also harbors doubts about the pharmaceutical industry and vaccinations, often citing theories about their use for population control. You remains ardently absorbed in these theories, finding a strange comfort and excitement in the exploration of these unfathomable mysteries. When presented with a new conspiracy theory you are always open to new ideas and question everything. You believe Jeffrey Epstein didn't kill himself and is likely living in Israel this very minute.",
		"second_prompt":"Oh oh my, you wouldn't believe what I read about the other day..."
	},
	"job_interviewer":{
		"type":"serious",
		"custom_name":"Job interviewer",
		"custom_description":"Prepare yourself for a job interview",
		"emoji":"🧑‍💼",
		"emoji_bg":"#193b60",
		"system_prompt":"I want you to act as an interviewer. I will be the candidate and you will ask me the interview questions for the position. I want you to only reply as the interviewer. Do not write all the conservation at once. I want you to only do the interview with me. Ask me the questions and wait for my answers. Do not write explanations. Ask me the questions one by one like an interviewer does and wait for my answers. My first sentence is 'Hi'.",
		"second_prompt":"Hello there. I assume you're here about the position? Take a seat."
	},
	"English_teacher":{
		"type":"serious",
		"custom_name":"English teacher",
		"custom_description":"Improve your English",
		"emoji":"👩🏽‍🏫",
		"emoji_bg":"#8a8a8a",
		"system_prompt":"I want you to act as a spoken English teacher and improver. I will speak to you in English and you will reply to me in English to practice my spoken English. I want you to keep your reply neat, limiting the reply to 100 words. I want you to strictly correct my grammar mistakes, typos, and factual errors. I want you to ask me a question in your reply. Now let's start practicing, you could ask me a question first. Remember, I want you to strictly correct my grammar mistakes, typos, and factual errors.",
		"second_prompt":"Well hello there."
	},
	"personal_trainer":{
		"type":"serious",
		"custom_name":"Personal trainer",
		"custom_description":"Let's get fit",
		"emoji":"🏋🏽",
		"emoji_bg":"#ddacac",
		"system_prompt":"I want you to act as a personal trainer. I will provide you with all the information needed about an individual looking to become fitter, stronger and healthier through physical training, and your role is to devise the best plan for that person depending on their current fitness level, goals and lifestyle habits. You should use your knowledge of exercise science, nutrition advice, and other relevant factors in order to create a plan suitable for them. My first request is \"I need help designing an exercise program for someone who wants to lose weight.\"",
		"Second_prompt":"Ola!"
	},
	"more_characters":{
		"type":"serious",
		"custom_name":"More characters",
		"emoji":" ",
		"emoji_bg":"#00314a",
		"function":"show_more_characters_dialog"
	},
	
};







function generate_characters_list(){
	//console.log("in generate_characters_list. window.characters: ", window.characters);
	
	const characters_categories = ['fun','serious'];
	
	for(let f = 0; f < characters_categories.length; f++){
		let list_to_clear_el = document.querySelector("#" + characters_categories[f] + "-characters-list");
		if(list_to_clear_el){
			list_to_clear_el.innerHTML = '';
		}
	}
	
	let characters_counter = 0;
	for (let [key, details] of Object.entries(window.characters)) {
	    //console.log("characters:  key,details:", key, details);
		
		if(key == 'girlfriend' && window.settings.settings_complexity != 'developer'){
			continue
		}
		
		characters_counter++;
		if(typeof details.custom_name == 'string'){
			let switch_button_el = document.createElement('button');
			switch_button_el.classList.add('characters-button-' + key);
			
			/*
			
			if(key == 'girlfriend' && window.settings.settings_complexity == 'developer'){
				switch_button_el.innerHTML = '<img src="./images/characters_mini_ankeiler_' + key.toLowerCase() + '.png" alt="' + details.custom_name + '"/><div>' + details.custom_name + '</div>';
			}
			else 
			*/
			if(key == 'Cleopatra' ){ // && window.settings.settings_complexity != 'developer'
				switch_button_el.innerHTML = '<img src="./images/characters_mini_ankeiler_' + key.toLowerCase() + '.png" alt="' + details.custom_name + '"/><div>' + details.custom_name + '</div>';
			}
			else if(key == 'brainstormer'){
				switch_button_el.innerHTML = '<img src="./images/characters_mini_ankeiler_' + key.toLowerCase() + '.png" alt="' + details.custom_name + '"/><div>' + details.custom_name + '</div>';
			}
			
			else{
				
				switch_button_el.classList.add('flex');
				
				let button_contact_icon_container_el = document.createElement('div');
				button_contact_icon_container_el.classList.add('icon-container');
				
				let button_contact_icon_el = document.createElement('div');
				button_contact_icon_el.classList.add('center');
				
				if(typeof details.emoji == 'string'){
					button_contact_icon_el.textContent = details.emoji;
				}
				if(typeof details.emoji_bg == 'string'){
					button_contact_icon_el.style['background-color'] = details.emoji_bg;
				}
				button_contact_icon_container_el.appendChild(button_contact_icon_el);
				
				
				// contact container
				let button_contact_details_container_el = document.createElement('div');
				button_contact_details_container_el.classList.add('contact');
				button_contact_details_container_el.classList.add('flex-column');
				
				
				// name
				let button_character_name_el = document.createElement('div');
				button_character_name_el.classList.add('name');
				if(typeof details.i18n_code == 'string'){
					button_character_name_el.setAttribute('data-i18n',details.i18n_code);
					button_character_name_el.textContent = get_translation(details.i18n_code);
				}
				else if(details.custom_name.length){
					button_character_name_el.setAttribute('data-i18n',details.custom_name);
					button_character_name_el.textContent = get_translation(details.custom_name);
				}
				button_contact_details_container_el.appendChild(button_character_name_el);
				
				
				// details
				if(typeof details.custom_description == 'string' && details.custom_description.length){
					let button_character_description_el = document.createElement('div');
					button_character_description_el.classList.add('description');
					button_character_description_el.setAttribute('data-i18n',details.custom_description);
					button_character_description_el.textContent = get_translation(details.custom_description);
					
					button_contact_details_container_el.appendChild(button_character_description_el);
				}
				else{
					button_contact_details_container_el.classList.add('center');
				}
				
				
				switch_button_el.appendChild(button_contact_icon_container_el);
				switch_button_el.appendChild(button_contact_details_container_el);
			}
			switch_button_el.addEventListener("click", (event) => {
				console.error("clicked on add character button. details: ", details);
				
				window.only_allow_voice_commands = false;
				
				if(typeof details.function == 'string'){
					//console.log("clicked on special character button -> running function: ", details.function);
					window[details.function]();
				}
				else{
					create_custom_ai(details);
				}
				
			});
			
			if(typeof details.type == 'string'){
				let list_to_attach_to_el = document.getElementById(details.type + "-characters-list");
				if(list_to_attach_to_el){
					list_to_attach_to_el.appendChild(switch_button_el);
				}
			}
			
		}
		
	}
};

//generate_characters_list();


function show_more_characters_dialog(){
	more_characters_dialog_el.showModal();
	window.add_script('./more_characters.js')
	.then((value) => {
		if(typeof generate_more_characters_list == 'function'){
			generate_more_characters_list();
		}
	})
	.catch((err) => {
		console.error("caught error adding more_characters.js script: ", err);
	})
}




//
//   BLUEPRINTS
//

window.blueprints = {
	
	
	"tell_a_fairytale":{
		"type":"personal",
		//"i18n_code":"tell_a_fairytale",
		"custom_name":"Tell me a fairytale",
		"custom_description":"Once upon a time..",
		"emoji":"🧚",
		"emoji_bg":"#99ff99",
		"function":"load_fairytale_example"
	},
	"AI_plays_Shakespeare":{
		"type":"personal",
		//"i18n_code":"Donald_Trump",
		"custom_name":"AI plays Shakespeare",
		"custom_description":"You've never heard anything like it",
		"emoji":"🎭",
		"emoji_bg":"#d4d254",
		"function":"load_blueprint_voice_conversation_example"
	},
	"Blog_post":{
		"type":"business",
		//"i18n_code":"Donald_Trump",
		"custom_name":"Blog post",
		"custom_description":"You provide the topic",
		"emoji":"👩🏽‍🏫",
		"emoji_bg":"#9999ff",
		"text":`// Write a blog post
		
// This is a blueprint - a series of commands. 
// Press the play button in the bottom-right to run it.


Change AI to any writer


Create a new document called blog post


prompt: Write a {{Style::fun|informative}} blogpost about {{Topic}}.


`,
	},

	
	
	
	
	"Domain_name_generator":{
		"type":"business",
		//"i18n_code":"Leonardo_da_Vinci",
		"custom_name":"Domain name generator",
		"custom_description":"Avoid already-taken.com",
		"emoji":"🌐",
		"emoji_bg":"#3e32ca",
		"text":`// Domain name generator
		
// This is a blueprint - a series of commands. 
// Press the play button in the bottom-right to run it.


Change AI to any writer


prompt: Brainstorm a lot of short and memorable domain names, combining the topics {{Topic 1}} and {{topic 2}}. Don't bother with adding the extension (like.com), only generate the hostnames. Be sure to make them varied, be creative. 

Some example domain names to use as inspiration are:
{{Domain names to use as inspiration}}


`,
		//"better_with_web_gpu":true,
	},
	"Decline_a_wedding_invitation":{
		"type":"personal",
		"custom_name":"Decline a wedding invitation",
		"custom_description":"Sincere and polite",
		"emoji":"🤧",
		"emoji_bg":"#3465a1",
		"text":`// Decline a wedding invitation

// This is a blueprint - a series of commands. 
// Press the play button in the bottom-right to run it.


Change AI to any writer


prompt: Write a polite, heart-felt and sincere letter explaining why I unfortunately can't make it to the wedding of {{Person to be wed 1}} and {{Person to be wed 2}}. Take the following into account when writing:

- My intended role at the wedding was: {{Your intended role::guest|maid|matron|best woman|best man|man of honor|groomsman|bridesmaid|officiant|ring bearer|flower girl}}.
- The reason I can't make it is: {{Reason you can't make it}}.

Be sure to thank {{Person to be wed 1}} and {{Person to be wed 2}} for the invitation, and wish them all the best, and an amazing and love-filled wedding day.


`,
		//"requires_web_gpu":true,
	},
	"Write_an_essay":{
		"type":"personal",
		//"i18n_code":"Donald_Trump",
		"custom_name":"Write an essay",
		"custom_description":"Not for school obviously",
		"emoji":"🍎",
		"emoji_bg":"#6dd54f",
		"text":`// Write an essay

// This is a blueprint - a series of commands. 
// Press the play button in the bottom-right to run it.


Change AI to any writer


Create a new document called Fruit and it's colors


Fruit and it's colors
======================


prompt: write a very short opening paragraph that gets the reader curious about the different colors that fruits can have. Do not go into the question itself.


*Red and Green apples*


prompt: Write a paragraph about the difference between red and green apples.


*Red and white grapes*


prompt: Write a paragraph about the difference between white and red grapes.


*Brown and yellow bananas*


prompt: Write a paragraph about the difference between brown and yellow bananas.


**Conclusion**

What we can learn about all these differences between the colors of fruit is


continue



`,
	},
	
	"Respond_to_a_bad_review":{
		"type":"business",
		//"i18n_code":"Donald_Trump",
		"custom_name":"Respond to a bad review",
		"custom_description":"Nobody wins 'em all",
		"emoji":"👎",
		"emoji_bg":"#193b60",
		"text":`// Respond to a bad review
		
// This is a blueprint - a series of commands. 
// Press the play button in the bottom-right to run it.


Change AI to any writer


prompt: Read this bad review in between the 'context' tags:

<context>
{{Paste the bad review here}}
</context>

Write a {{Tone::polite|understanding|sceptic|scathing}} and {{Style::formal|informal|serious|light hearted}} response to this bad review.

Explain that the likely reason for their poor experience was: {{Likely reason for their poor experience}}.

Offer them {{Offer::nothing|a better experience next time|financial compensation, to be discussed|to go to hell}}.


`,
	},
	
	"Compare_AIs":{
		"type":"business",
		//"i18n_code":"Donald_Trump",
		"custom_name":"Compare AIs",
		"custom_description":"Which is your favourite?",
		"emoji":"🔬", 
		"emoji_bg":"#3b1960",
		"text":`// Compare AI's
		
// This is a blueprint - a series of commands. 
// Press the play button in the bottom-right to run it.

// This list starts with the smallest AI model, and works its way up from there



Create a new document called AI comparison



Change AI to Hatchling



**Hatchling (Llama 160M)**
		


prompt: {{Prompt (the command you'd like to compare)}}





Change AI to Smallest writer


**Smallest writer (Danube 3 500m)**


prompt: {{Prompt (the command you'd like to compare)}}





Change AI to Mini fun writer


**Mini fun writer (Llama 3.2 it 1B)**


prompt: {{Prompt (the command you'd like to compare)}}






Change AI to Tiny chatter


**Tiny chatter (Tiny Llama 1.1)**


prompt: {{Prompt (the command you'd like to compare)}}





Change AI to Zephyr


**Zephyr (Zephyr 1.6B)**


prompt: {{Prompt (the command you'd like to compare)}}






Change AI to Small summarizer


**Small summarizer (Danube 1.8B)**


prompt: {{Prompt (the command you'd like to compare)}}





Change AI to Small writer


**Small writer (Gemma 2B it)**


prompt: {{Prompt (the command you'd like to compare)}}




Change AI to Incite chat


**Incite chat**


prompt: {{Prompt (the command you'd like to compare)}}




Change AI to Small fun writer


**Small fun writer (Llama 3.2 it 3B)**


prompt: {{Prompt (the command you'd like to compare)}}






Change AI to Writer


**Writer (Phi 3.5 mini)**


prompt: {{Prompt (the command you'd like to compare)}}





Change AI to Serious Writer


**Serious writer (Mistral 7B v3 instruct)**


prompt: {{Prompt (the command you'd like to compare)}}




Change AI to Fun Writer


**Fun Writer (Llama 3 8B)**


prompt: {{Prompt (the command you'd like to compare)}}




Change AI to Big Gemma


**Big Gemma (Gemma 9B it)**


prompt: {{Prompt (the command you'd like to compare)}}




`,
	},
	
	"Describe_many_images":{
		"type":"business",
		//"i18n_code":"Donald_Trump",
		"custom_name":"Describe multiple images",
		"custom_description":"Automate working with files",
		"emoji":"🔁", 
		"emoji_bg":"#991960",
		"text":`// This blueprint shows how you can automate working on multiple files. In this case to describe image files, and store each description in a separate new document.
// Press the play button in the bottom-right to start it. This assumes there are some images in the current folder.



// 1
// This first command shows a quick info popup. These can be useful to inform people about the progress of the blueprint

info: Here we go!



// 2
// Just in case, we make sure the camera is turned off. Otherwise camera frames would be described instead of the files.

stop camera



// 3
// We switch to the image describer AI

change AI to Image describer



// 4
// This following command (which, as a rare exception, cannot also be used as a voice command) causes the blueprint to from here on out loop over all files in the current folder. All the subsequent commands in the blueprint will be applied to each file, and each of those loops will start with opening the file. The loop effectively starts with opening the file.
// You can specify a type of file. Here it loops over images only. The full list of options:
// for each file
// for each document
// for each picture
// for each video
// for each audio

for each picture



// 5
// Next, we create a new semi-randomly named file on each loop. By not added a file extension to the command to create a new file, it will be repeated on each loop, and a slightly diffent named file will be generated on each loop.

// You could also have all the image descriptions placed into a single document. If you give the filename a file extension, and thus make it a very specific file, then you could create a single file with that exact name. And then you can refer back to that file in the loop to append any results to that single file instead. In that case you would create a file before the loop command, and keep re-opening that document after the loop command, and before the prompt command. That command would look something like this:
// create a new document called image_descriptions.txt

create a new document called image description
// NOTE: The above command will have creates a document called 'Blueprint XXXX image description.txt', with the XXXX being random numbers and letters on each loop.



// 6
// Finally, we tell the Image description AI what to do. At this point the last opened image will still be loaded, while a text document will also be open at the same time. Since results of blueprints results are - if possible - placed in a document, the resulting description will be placed in the document that was just created.

prompt: describe the image in detail



// 7
// Brag a little

info: Just described an image!



// The blueprint will now continue by opening the next file, and applying all the later blueprint commands to that file as well. And so on.



`,
	},
	
	"more_blueprints":{
		"type":"business",
		"custom_name":"More blueprints",
		"emoji":" ",
		"emoji_bg":"#00314a",
		"function":"show_more_blueprints_dialog"
	},
	
}







function generate_blueprints_list(){
	//console.log("in generate_blueprints_list. window.blueprints: ", window.blueprints);
	
	const blueprints_categories = ['personal','business'];
	
	for(let f = 0; f < blueprints_categories.length; f++){
		let list_to_clear_el = document.querySelector("#" + blueprints_categories[f] + "-blueprints-list");
		if(list_to_clear_el){
			list_to_clear_el.innerHTML = '';
		}
	}
	
	let blueprints_counter = 0;
	for (let [key, details] of Object.entries(window.blueprints)) {
	    //console.log("blueprints:  key,details:", key, details);
		blueprints_counter++;
		if(typeof details.custom_name == 'string'){
			let switch_button_el = document.createElement('button');
			switch_button_el.classList.add('blueprints-button-' + key);
			
			/*
			if(key == 'AI_plays_Shakespeare'){
				switch_button_el.innerHTML = '<img src="./images/blueprints_mini_ankeiler_' + key.toLowerCase() + '.png" alt="' + details.custom_name + '"/><div>' + details.custom_name + '</div>';
			}
			*/
			
			if(key == 'tell_a_fairytale'){
				switch_button_el.innerHTML = '<img src="./images/blueprints_mini_ankeiler_' + key.toLowerCase() + '.png" alt="' + details.custom_name + '"/><div>' + details.custom_name + '</div>';
			}
			else if(key == 'Blog_post'){
				switch_button_el.innerHTML = '<img src="./images/blueprints_mini_ankeiler_' + key.toLowerCase() + '.png" alt="' + details.custom_name + '"/><div>' + details.custom_name + '</div>';
			}
			
			else{
				
				switch_button_el.classList.add('flex');
				
				let button_blueprint_icon_container_el = document.createElement('div');
				button_blueprint_icon_container_el.classList.add('icon-container');
				
				let button_blueprint_icon_el = document.createElement('div');
				button_blueprint_icon_el.classList.add('center');
				
				if(typeof details.emoji == 'string'){
					button_blueprint_icon_el.textContent = details.emoji;
				}
				if(typeof details.emoji_bg == 'string'){
					button_blueprint_icon_el.style['background-color'] = details.emoji_bg;
				}
				button_blueprint_icon_container_el.appendChild(button_blueprint_icon_el)
				
				
				let button_blueprint_details_container_el = document.createElement('div');
				button_blueprint_details_container_el.classList.add('contact');
				button_blueprint_details_container_el.classList.add('flex-column');
				
				
				let button_character_name_el = document.createElement('div');
				button_character_name_el.classList.add('name');
				if(typeof details.i18n_code == 'string'){
					button_character_name_el.setAttribute('data-i18n',details.i18n_code);
					button_character_name_el.textContent = get_translation(details.i18n_code);
				}
				else{
					button_character_name_el.textContent = details.custom_name;
				}
				
				let button_character_description_el = document.createElement('div');
				button_character_description_el.classList.add('description');
				if(typeof details.i18n_code == 'string'){
					button_character_description_el.setAttribute('data-i18n',details.i18n_code);
					button_character_description_el.textContent = get_translation(details.i18n_code);
				}
				else{
					button_character_description_el.textContent = details.custom_description;
				}
				
				button_blueprint_details_container_el.appendChild(button_character_name_el);
				button_blueprint_details_container_el.appendChild(button_character_description_el);
				switch_button_el.appendChild(button_blueprint_icon_container_el);
				switch_button_el.appendChild(button_blueprint_details_container_el);
			}
			switch_button_el.addEventListener("click", (event) => {
				//console.log("clicked on add blueprint button. details: ", details);
				add_blueprint(details);
			});
			
			if(typeof details.type == 'string'){
				let list_to_attach_to_el = document.getElementById(details.type + "-blueprints-list");
				if(list_to_attach_to_el){
					list_to_attach_to_el.appendChild(switch_button_el);
				}
			}
			
		}
	}
}





async function add_blueprint(details){
	//console.log("in add_blueprint.  details: ", details);
	
	if(typeof details.custom_name == 'string'){
		window.last_user_query = details.custom_name;
		
		if(typeof details.function == 'string' && details.function != ''){
			//console.log("add_blueprint: running function");
			window[details.function]();
		}
		if(typeof details.text == 'string'){
			//console.log("add_blueprint: adding and running blueprint");
			await create_new_document(details.text, details.custom_name + '.blueprint');
			do_blueprint(details.text);
		}
	
	}
	
}

//generate_blueprints_list();

function show_more_blueprints_dialog(){
	more_blueprints_dialog_el.showModal();
}


//load_runners();

//generate_functionalities_list();



function list_caches(){
	console.log('in list_caches');
	caches.keys()
	.then((cacheNames) =>
		Promise.all(
			cacheNames.map((cacheName) => {
				console.log(" + CACHE: ", cacheName);
			
				caches.open(cacheName)
				.then(cache => {
				
					cache.keys()
					.then(items => {
			    		items.map(item => {
							console.log(" ++ ", cacheName, item.url); // .replace('https://papeg.ai/','').replace('https://papegai.eu/','')
						})
					})
				})
			
			})
		)
	)
}


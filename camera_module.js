import './tesseract/tesseract.min.js';
//import { createWorker } from './camerajs/tesseract.min.js';
//Tesseract.createWorker


// https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0/tesseract-core-simd-lstm.wasm.js
// https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0/tesseract-core-simd.wasm.js


//let my_task = null;

// [
//     '<|endoftext|><image>\n\n' +
//     'Question: Describe this image.\n\n' +
//     'Answer: A hand is holding a white book titled "The Little Book of Deep Learning" against a backdrop of a balcony with a railing and a view of a building and trees.<|endoftext|>'
// ]


/*
window.do_image_processing = async function (task){ 
	if(typeof task == 'undefined' || task == null){
		console.error("do_image_processing: invalid task: ", task);
		return false
	}
	if(typeof task.sub_type != 'string'){
		console.error("do_image_processing: no task.variant provided");
		task['sub_type'] = 'ocr';
	}
	window.do_ocr(task);
});
*/

const video_el = document.getElementById("camera-video");
const video_canvas_el = document.getElementById("video-canvas");
const video_context = video_canvas_el.getContext('2d', { willReadFrequently: true });


const ocr_languages_lookup = {
	  "afr": "Afrikaans",
	  "amh": "Amharic",
	  "ara": "Arabic",
	  "asm": "Assamese",
	  "aze": "Azerbaijani",
	  "aze_cyrl": "Azerbaijani - Cyrillic",
	  "bel": "Belarusian",
	  "ben": "Bengali",
	  "bod": "Tibetan",
	  "bos": "Bosnian",
	  "bul": "Bulgarian",
	  "cat": "Catalan; Valencian",
	  "ceb": "Cebuano",
	  "ces": "Czech",
	  "chi_sim": "Chinese - Simplified",
	  "chi_tra": "Chinese - Traditional",
	  "chr": "Cherokee",
	  "cym": "Welsh",
	  "dan": "Danish",
	  "deu": "German",
	  "dzo": "Dzongkha",
	  "ell": "Greek, Modern (1453-)",
	  "eng": "English",
	  "enm": "English, Middle (1100-1500)",
	  "epo": "Esperanto",
	  "est": "Estonian",
	  "eus": "Basque",
	  "fas": "Persian",
	  "fin": "Finnish",
	  "fra": "French",
	  "frk": "German Fraktur",
	  "frm": "French, Middle (ca. 1400-1600)",
	  "gle": "Irish",
	  "glg": "Galician",
	  "grc": "Greek, Ancient (-1453)",
	  "guj": "Gujarati",
	  "hat": "Haitian; Haitian Creole",
	  "heb": "Hebrew",
	  "hin": "Hindi",
	  "hrv": "Croatian",
	  "hun": "Hungarian",
	  "iku": "Inuktitut",
	  "ind": "Indonesian",
	  "isl": "Icelandic",
	  "ita": "Italian",
	  "ita_old": "Italian - Old",
	  "jav": "Javanese",
	  "jpn": "Japanese",
	  "kan": "Kannada",
	  "kat": "Georgian",
	  "kat_old": "Georgian - Old",
	  "kaz": "Kazakh",
	  "khm": "Central Khmer",
	  "kir": "Kirghiz; Kyrgyz",
	  "kor": "Korean",
	  "kur": "Kurdish",
	  "lao": "Lao",
	  "lat": "Latin",
	  "lav": "Latvian",
	  "lit": "Lithuanian",
	  "mal": "Malayalam",
	  "mar": "Marathi",
	  "mkd": "Macedonian",
	  "mlt": "Maltese",
	  "msa": "Malay",
	  "mya": "Burmese",
	  "nep": "Nepali",
	  "nld": "Dutch; Flemish",
	  "nor": "Norwegian",
	  "ori": "Oriya",
	  "pan": "Panjabi; Punjabi",
	  "pol": "Polish",
	  "por": "Portuguese",
	  "pus": "Pushto; Pashto",
	  "ron": "Romanian; Moldavian; Moldovan",
	  "rus": "Russian",
	  "san": "Sanskrit",
	  "sin": "Sinhala; Sinhalese",
	  "slk": "Slovak",
	  "slv": "Slovenian",
	  "spa": "Spanish; Castilian",
	  "spa_old": "Spanish; Castilian - Old",
	  "sqi": "Albanian",
	  "srp": "Serbian",
	  "srp_latn": "Serbian - Latin",
	  "swa": "Swahili",
	  "swe": "Swedish",
	  "syr": "Syriac",
	  "tam": "Tamil",
	  "tel": "Telugu",
	  "tgk": "Tajik",
	  "tgl": "Tagalog",
	  "tha": "Thai",
	  "tir": "Tigrinya",
	  "tur": "Turkish",
	  "uig": "Uighur; Uyghur",
	  "ukr": "Ukrainian",
	  "urd": "Urdu",
	  "uzb": "Uzbek",
	  "uzb_cyrl": "Uzbek - Cyrillic",
	  "vie": "Vietnamese",
	  "yid": "Yiddish"
}






window.do_ocr = async function (task,language=null){ 
	//console.log("in do_ocr. task,language: ", task,language);
	if(typeof task == 'undefined' || task == null){
		console.error("do_ocr: invalid task: ", task);
		return false
	}
	if(typeof task.image_blob == 'undefined'){
		console.error("do_ocr: aborting, task had no image: ", task);
		return false
	}
	
	if(language == null){
		if(typeof task.output_language == 'string'){
			//console.log("do_ocr: using task's output_language: ", task.output_language);
		}
		else{
			//console.log("do_ocr: using user's current language: ", window.settings.language);
			language = window.settings.language;
		}
		
		if(language=='en'){language = 'eng'};
	}
	//console.log("do_ocr: language: ", language);
	if(language.length == 2){
		console.error("do_ocr: language code was still 2 characters long, may have to change to 3 character version: ", language);
	}
	console.log("do_ocr: language: ", language);
    const worker = await Tesseract.createWorker(language);
    const ret = await worker.recognize(task.image_blob); //{progress: function(e){console.log(e)}}
	//console.log("do_ocr: extracted text: ", ret, ret.data.text);
    await worker.terminate();
	//console.log("ocr done, calling handle_completed_task");
	window.handle_completed_task(task,ret.data.text);
	
	/*
		
Tesseract.recognize("https://yoursite/image.jpg", {
    lang: 'ind',
    tessedit_char_blacklist: 'e'
})
.progress(function(message){ console.log(message) })
.then(function(result) { console.log(result) });
		
	*/
	
	
}





window.start_camera = function (simple=false){
	console.log("in start_camera.  simple: ", simple);
	document.body.classList.add('show-camera');
	document.body.classList.remove('prepare-translate-document');
	document.body.classList.remove('prepare-sumarize-document');
	
	window.camera_on = true;
	window.busy_starting_camera = true;
	window.video_stream_meta = null;
	window.camera_width = 1920;
	window.camera_height = 1080;
	window.camera_ratio = null;
	
	let video_settings = {
		width: { min: 640, ideal: 2160, max: 3840 },
		height: { min: 480, ideal: 3840, max: 3840 },
		facingMode: "environment",
	}
	
	if(simple){
		console.log("window.start_camera: going the simple route");
		video_settings = true; // just give any video
	}	
			
	
	return new Promise((resolve, reject) => {
	
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			window.busy_starting_camera = true;
			navigator.mediaDevices.getUserMedia({
				
				/*
				
				// jscanify example. It needs as much resolution as possible. https://github.com/puffinsoft/jscanify/issues/19

const constraints = {
     facingMode: 'environment',
     advanced: [
       { width: { exact: 2560 } },
       { width: { exact: 1920 } },
       { width: { exact: 1280 } },
       { width: { exact: 1024 } },
       { width: { exact: 900 } },
       { width: { exact: 800 } },
       { width: { exact: 640 } },
       { width: { exact: 320 } },
     ],
   };
					
					
				*/
				
				
				
				video: video_settings,
				//video: true,
				audio: false
			}).then((stream) => {
				//console.log("got camera stream");
		        video_el.srcObject = stream;
				window.analyze_video_stream(stream);
				
				
				//return true
		        //video.play();
				resolve(true);
			})
			.catch((err) => {
				console.error("Error starting camera: ", err);
				
				if(simple == false && ('' + err).indexOf('verconstrained') != -1){
					console.error("The error was an 'overconstrainedError'. Let's try again with simpler demands. ");
					window.start_camera(true)
					.then((value) => {
						console.log("using simpler camera contraints solved the problem with getting the video stream");
					})
					.catch((err) => {
						console.error("using simpler camera contraints did not solve the problem with getting the video stream");
					})
				}
				else{
					window.camera_streaming = false;
					window.busy_starting_camera = false;
					flash_message(get_translation("Could_not_open_camera"),3000,'fail');
					reject(false);
					//return false
				}
				
			})
			
			
		}
		else{
			flash_message(get_translation('Could_not_access_a_camera'),3000,'fail');
			window.busy_starting_camera = false;
			reject(false);
		}
	})
}

window.stop_camera = async function (){
	//console.log("in stop_camera");
	//window.continuous_ocr_enabled = false;
	document.body.classList.remove('show-camera');
	document.body.classList.remove('doing-ocr');
	document.body.classList.remove('doing-image-to-text');
	document.body.classList.remove('show-rewrite');
	
	let stream = video_el.srcObject;
	let tracks = stream.getTracks();
	tracks.forEach(function(track) {
	   track.stop();
	});
	video_el.srcObject = null;
	window.camera_streaming = false;
	window.camera_on = false;
	window.busy_starting_camera = false;
	window.last_time_continuous_image_to_text_started = null;
	//window.continuous_image_to_text_enabled = false;
};


/*
	
	    function onSave() {
	      context.drawImage(video, 0, 0, 640, 480);

	      canvas.toBlob((blob) => {
	        //const timestamp = Date.now().toString();
	        const a = document.createElement("a");
	        document.body.append(a);

	        //a.href = URL.createObjectURL(blob);
	        a.target = "_blank";
	        img = URL.createObjectURL(blob);

	        //a.click();
	    	//console.log(img);
	        a.remove();

	        Tesseract.recognize(
	  'https://tesseract.projectnaptha.com/img/eng_bw.png',
	  'eng',
	  { logger: m => console.log(m) }
	).then(({ data: { text } }) => {
	  console.log(text);
	})
	      });
	    }
*/

window.take_picture = async function (task={}){
	//console.log("in take_picture. task: ", task);
	if(typeof task == 'object' && task != null){
		//console.log("writing video frame into canvas");
		video_context.drawImage(video_el, 0, 0, window.camera_width, window.camera_height);
		if(typeof task.origin == 'undefined'){
			//console.log("take_picture: setting camera as task origin");
			task['origin'] = 'camera';
		}
		
		if(typeof task.state == 'string'){
			if(task.state == 'should_ocr'){
				if(window.settings.docs.open == null){
					let ocr_document_filename = get_translation('Text_from_photo') + ' ' + make_date_string() + '.txt'
					create_new_document(get_translation("Photo_to_text_results") + ":\n\n", ocr_document_filename);
					task['file'] = {'folder':folder,'filename':ocr_document_filename};
				}
				else{
					task['file'] = window.settings.docs.open;
				}
				task.destination = 'document';
			}
		}
		
		
		if(typeof task.image_blob == 'undefined' && typeof task.audio == 'undefined' && typeof task.recorded_audio == 'undefined'){
			//console.log("take_picture: updated task before adding image data: ", JSON.stringify(task,null,4));
		}
		
		if(typeof task.prompt == 'undefined'){
			task['prompt'] = null;
		}
		
		let mime_type = 'image/png';
		if(typeof task.image_mime_type != 'string'){
			task['image_mime_type'] = mime_type;
		}
		else{
			mime_type = task.image_mime_type;
		}
		//console.log("take_picture: adding image data to task, with mime_type: ", mime_type);
		//console.log("video_context: ", video_context);
		//task['image_blob'] = video_canvas_el.toDataURL(mime_type);
		video_canvas_el.toBlob((blob) => {
			//console.log("video_canvas_el: toBlob result: ", blob);
			task['image_blob'] = blob;
			task['image_mime_type'] = 'image/jpeg';
			if(typeof task.type != 'string'){
				task['type'] = 'save_image';
			}
			if(typeof task.state != 'string'){
				task['state'] = 'save_image';
			}
			//console.log("take_picture: adding task: ", task);
			return window.add_task(task);//window.add_image_task(task);
			
		}, 'image/jpeg', 0.95);
		
		//canvas.toBlob(function(blob){...}, 'image/jpeg', 0.95);

	}
	else{
		console.error("take_picture: invalid task provided: ", task);
	}
	return false;
}







//
//  O C R
//

window.ocr_blobs = [];

window.perform_ocr_on_blobs = async function (blobs){
	if(blobs == null){
		blobs = window.ocr_blobs;
	}
	
	console.error("perform_ocr_on_blobs:  BLOBS,window.ocr_scans: ", blobs, window.ocr_scans);
	
	let merge_result = null;
	document.body.classList.add('doing-ocr-scan');
	
	live_ocr_scans_container_el.innerHTML = '';
	
	try{
		for(let b = 0; b < blobs.length; b++){
			const blob = blobs[b];
		
			let ocr_language = 'eng';
			if(window.settings.language == 'nl'){
				ocr_language = 'nld';
			}
		
		    const worker = await Tesseract.createWorker();
		    const ret = await worker.recognize(blob); //{progress: function(e){console.log(e)}}
			//console.log("continuous_ocr: extracted text: ", ret, ret.data.text);
	
			if(typeof ret.data.text != 'string'){
				console.error("OCR worker did not return a string. ret.data.text: ", ret.data.text);
				continue
			}
	
			window.ocr_scans.push(ret.data.text);
			camera_ocr_scan_progress_el.value = b / window.settings.ocr_scan_intensity;
		
			let new_scan_result_el = document.createElement('textarea');
			new_scan_result_el.classList.add('camera-ocr-snippet');
			new_scan_result_el.value = ret.data.text
			live_ocr_scans_container_el.appendChild(new_scan_result_el);
		
		
			/*
			if(window.doing_ocr_scan){ // this counts down from 7 to 0
				window.ocr_scans.push(ret.data.text);
		
				doing_ocr_scan_counter_el.textContent = window.doing_ocr_scan;
			
		
				window.merge_ocr_scans(window.ocr_scans);
		
				camera_container_el.classList.add('show-flasher');
				setTimeout(() => {
					camera_container_el.classList.remove('show-flasher');
				},10)
		
			}
			else{
				if(window.settings.settings_complexity != 'normal'){
					live_ocr_output_el.value = ret.data.text;
				}
		
				// TODO: remove
				//live_ocr_output_el.value = ret.data.text;
		
				window.continuous_ocr_scans.push(ret.data.text);
				if(window.continuous_ocr_scans.length == window.settings.continuous_ocr_scan_intensity){
					window.merge_ocr_scans(window.continuous_ocr_scans);
					//doing_ocr_scan_counter_el.textContent = window.continuous_ocr_scans.length - window.settings.continuous_ocr_scan_intensity;
					window.continuous_ocr_scans = [];
				}
		
				//doing_ocr_scan_counter_el.textContent = window.doing_ocr_scan;
				camera_ocr_scan_progress_el.value = window.continuous_ocr_scans.length / window.settings.continuous_ocr_scan_intensity;
			
				if(window.ocr_scans.length){
					//console.log("should attempt to merge the OCR scans now: ", window.ocr_scans);
					window.merge_ocr_scans(window.ocr_scans);
					document.body.classList.remove('doing-ocr-scan');
					camera_container_el.classList.add('ocr-scan-complete');
				}
				doing_ocr_scan_counter_el.textContent = '';
		
			}
			*/
		    await worker.terminate();
		
			if(b == 0){
				live_ocr_output_el.value = ret.data.text;
			}
			else{
				merge_result = window.merge_ocr_scans(window.ocr_scans);
			}
			window.textAreaAdjust(live_ocr_output_el);
		
		}
	
		//console.log("perform_ocr_on_blobs: merge_result: ", merge_result);
	
		// Find out which scan most accurately resembled the merged result
		if(typeof merge_result == 'string' && merge_result.length > 5){
			let highest_similarity_score = 0;
			let best_scan = -1;
			if(typeof merge_result == 'string' && merge_result.length){
				for(let x = 0; x < window.ocr_scans.length; x++){
					const similarity_score = similarity(window.ocr_scans[x],merge_result);
					console.log("OCR similarity_score: ", similarity_score);
					if(similarity_score > highest_similarity_score){
						highest_similarity_score = similarity_score;
						best_scan = x;
					}
				}
			}
			console.log("perform_ocr_on_blobs: of the scans, when OCR-ed this picture best matched the resulting merged text: ", best_scan);
			
			if(typeof best_scan == 'number' && best_scan != 1){
				let save_ocr_image_task = {
					'prompt':null,
					'type':'save_image',
					'state':'save_image',
					'image_mime_type':'image/jpeg',
					'image_blob':blobs[best_scan]
				}
				console.log("perform_ocr_on_blobs: adding save_image task: ", task);
				window.add_task(save_ocr_image_task);//window.add_image_task(task);
			}
			/*
			if(document.body.classList.contains('show-rewrite')){
				
			}
			*/
			rewrite_dialog_selected_text_el.textContent = merge_result;
			
		}
	
	
		// Optionally, translate the output
		if(typeof merge_result == 'string' && translation_details_el.open){
		
			if(merge_result.length > 10){
				document.body.classList.add('doing-translation');
	
				let ocr_translation_task = {
					'prompt':null,
					'text':merge_result,
					'origin':'ocr',
					'assistant':'translator',
					'type':'translation',
					'state':'should_translation',
					'desired_results':1,
					'results':[],
					'output_language': window.settings.output_language,
					'destination':'ocr',      //window.active_destination,
					'file':window.settings.docs.open
				};
		
				if(window.settings.auto_detect_input_language == false){
					ocr_translation_task['input_language'] = window.settings.input_language;
					ocr_translation_task['translation_details'] = get_translation_model_details_from_languages(window.settings.input_language,window.settings.output_language);
				}
	
				//console.log("ocr_translation_task: ", ocr_translation_task);
				window.add_and_do_translation(ocr_translation_task, window.settings.auto_detect_input_language )
				.then((translation_result) => {
					//console.log("ocr translation result: ", translation_result);
				})
				.catch((err) => {
					console.error("caught error from add_and_do_translation: ", err);
				})
			}
			else{
				console.warn("merged text was too short too translate.  merge_result: ", merge_result);
			}
		
		
		}
	}
	catch(err){
		console.error("caught error doing/merging OCR scans");
	}
	
	
	
	
	document.body.classList.remove('doing-ocr-scan');
	
	
	
	
}


// The main OCR scan function. Not just for running continuously
// async function do_continuous_ocr(){
window.do_continuous_ocr = async function (){ 
	console.log("in do_continuous_ocr.  window.doing_ocr_scan,window.continuous_ocr_enabled: ", window.doing_ocr_scan, window.continuous_ocr_enabled);
	window.only_allow_voice_commands = true;
	try{
		
		
		if(window.opencv_jscanify){
			console.log("do_continuous_ocr:  opencv_jscanify available: ", window.opencv_jscanify);
			//window.detect_page_in_video();
			
			//camera_overlay_context.scale(1,1);
			//window.should_do_camera_ocr_scan = window.settings.ocr_scan_intensity;
			//window.doing_ocr_scan--;
		}
		else{
			video_context.drawImage(video_el, 0, 0, window.camera_width, window.camera_height);
			video_canvas_el.toBlob( async (blob) => {
				console.log("continuous_ocr: video_canvas_el: toBlob result: ", blob);
			    window.ocr_blobs.push(blob);
				
				//console.log("continuous_ocr:  ret.data.text: ", ret.data.text);
				if(window.doing_ocr_scan){
					window.doing_ocr_scan--;
					setTimeout(() => {
						window.do_continuous_ocr();
					},100);
				}
				else{
					setTimeout(() => {
						//console.log("do_continuous_ocr: 500ms have passed.  window.settings.continuous_ocr_scan,window.continuous_ocr_enabled: ", window.settings.continuous_ocr_scan, window.continuous_ocr_enabled)
						if(window.settings.continuous_ocr_scan && window.continuous_ocr_enabled){
							//window.do_continuous_ocr();
						}
					},200);
				}
				
				window.post_ocr_blob_addition();
				
				
			}, 'image/jpeg', 0.95);
		}
		
		
		
		if(window.last_time_continuous_image_to_text_started == null){
			window.last_time_continuous_image_to_text_started = Date.now();
		}
	}
	catch(err){
		console.error("do_continuous_ocr: caught error: ", err);
		
		if(window.settings.continuous_ocr_scan && window.continuous_ocr_enabled){
			setTimeout(() => {
				//console.log("do_continuous_ocr: 2 seconds ago an error occured. Trying to call do_continuous_ocr again.");
				do_continuous_ocr();
			},2000);
		}
		
	}
	
	
	
}














function removeDuplicates(arr) {
    let unique = [];
    arr.forEach(element => {
        if (!unique.includes(element)) {
            unique.push(element);
        }
    });
    return unique;
}


window.merge_ocr_scans = function(scans=null){
	if(typeof scans == 'undefined' || scans == null || !Array.isArray(scans)){
		console.error("merge_ocr_scans: no valid scans array provided");
		return false
	}
	//console.log("in merge_ocr_scans. scans: ", scans.length, scans);
	let scan_data = [];
	let line_data = {};
	let all_lines = [];		
	let word_data = {};
	
	let scan_scores = [];
	let line_scores = {}

	let certain_words = [];
	let certain_chunks = [];

	let newliner = '[!NEWLINE_WAS_HERE!]';


	let chunk_lines = [];

	let output_text = null;



	const findOverlap = (a, b, retry = true) => {
       // If one of the two strings is empty, return the other one. This ensures
       //    that empty strings in the collection do not influence the result.
       if (!a || !b) return a || b;
       // Find the position in a, of the first character of b
       let i = a.indexOf(b[0]);
       while (i > -1) { // As long as there is such an occurrence...
           // Calculate what the size of the overlapping part would be:
           //    This is either the size of the remaining part of a, or
           //    the size of b, when it is a real substring of a:
           let size = Math.min(a.length - i, b.length);
           // See if we have an overlap at this position:
           if (a.slice(i).slice(0, size) === b.slice(0, size)) {
               // Yes! Include the "overflowing" part of b:
               return a + b.slice(size);
           }
           // No match. Try a next position:
           i = a.indexOf(b[0], i+1);
       }
       // The start of b does not overlap with the end of a, so try
       //     the opposite:
       if (retry) return findOverlap(b, a, false); // reversed args
       // If this was already the reversed case, then just concatenate
       return b+a; //''; //null; //b+a; // Reverse again
	}

   /*
    * findLongestOverlap: 
    *   find information about the two strings that have the longest overlap.
    * Input: 
    *   collection: an array of strings
    * Returns:
    *   An object with 4 properties:
    *      merged: the merged string, not repeating the overlapping part
    *      i, j: the two indexes in the collection of the contributing strings 
    *      overlapSize: number of characters that are part of the overlap
    * Example:
    *   findLongestOverlap(["abcdef", "defghi", "cdefg"]) returns: 
    *     { merged: "abcdefg", i: 0, j: 2, overlapSize: 4 }
    */
   const findLongestOverlap = (collection) => {
       // Initialise the "best" overlap we have so far (we don't have any yet)
       let longest = { overlapSize: -1 };
       // Iterate all pairs from the collection:
       for (let j = 1; j < collection.length; j++) {
           let b = collection[j];
           for (let i = 0; i < j; i++) {
               let a = collection[i];
		   
			   //let threshold = 0;
			   /*
			   if(a.indexOf(newliner) == -1 && b.indexOf(newliner) == -1){
				   continue
			   }
			   let merged = null;
			   if(a.endsWith(newliner) && b.startsWith(newliner)){
			   
			   }
			   else{
				   merged = findOverlap(b,a, false);
			   }
			   else if(!a.startsWith(newliner) && !b.endsWith(newliner)){
				   merged = findOverlap(a,b, false);
			   }
		   
			   */
           	/*
			   if(a.endsWith(newliner) && b.startsWith(newliner)){
				   merged = findOverlap(a,b,false);
				   threshold = newliner.length + 2; // avoid glueing together string by just the newline
			   }
			   else if(a.startsWith(newliner) && b.endsWith(newliner)){
				   merged = findOverlap(a,b);
				   threshold = newliner.length + 2; // avoid glueing together string by just the newline
			   }
			   else{
				   merged = findOverlap(a,b);
			   }
		   */
		   		const merged = findOverlap(a,b);
		   
			   /*
			   if(merged == null){
				   merged = findOverlap(b,a,false);
			   }
			   */
		   
			   //if(threshold > 1){
				   //console.log("merged: ", merged);
				   //console.log("threshold: ", threshold);
			   //}
		   
			   //console.log("findOverlap found: ", merged);
               // Derive the size of the overlap from the merged string:
			   if(typeof merged == 'string'){ //  && merged.indexOf(newliner) != -1
	               const overlapSize = a.length + b.length - merged.length;
				   //console.log("overlapSize vs threshold: ", overlapSize, threshold);
	               // Did we improve?
	               if (overlapSize > longest.overlapSize) { // && overlapSize > threshold
	                   // Yes! So keep track of all info we need:
	                   longest = { merged, i, j, overlapSize };
					   //console.log("findLongestOverlap: longest: ", longest);
	               }
			   }
           
           }
       }
       return longest;
   }

   /*
    * reduceToOne: 
    *   merge a series of strings, merging via the greatest overlaps first.
    * Input: 
    *   any number of arguments: all strings
    * Returns:
    *   A single string, which represents the merge
    */
   var reduceToOne = (...newline_chunks) => { // Grab all arguments as an array
       // Repeat until the collection is reduced to one element
	   //const original_collection = collection;
	   let new_certain_chunks = [];
	   //let final_certain_chunks = [];
   
	   //let newline_chunks = [];
	   //let add_back_later = [];
   
   
   
       for (let i = newline_chunks.length - 1; i >=0; --i ) {
		   
		   //console.log("testing for merge: ", i, newline_chunks[i]);
		   
           // Get information from best possible pair-merge:
           const { merged, i, j, overlapSize } = findLongestOverlap(newline_chunks);
		   console.log("merged, i, j, overlapSize: ", merged, i, j, overlapSize);
	   
		   if(typeof merged == 'string'){
			   // Remove the original two strings having the longest overlap
			   if(typeof overlapSize == 'number' && overlapSize > 1){
				   new_certain_chunks.push(merged);
			   }
			   else{
			   		//new_certain_chunks.push(newline_chunks[i]);
			   }
	           //console.log("merged: ", merged);
   
			   if(merged.length){
				   newline_chunks.splice(j, 1);
		           newline_chunks.splice(i, 1);
				   newline_chunks.push(merged);
	           }
		   }
		   else{
			   console.error("merged was not a string: ", typeof merged);
		   }
		   //console.log("new_certain_chunks: ", new_certain_chunks);
       }
   
	   //console.error("new_certain_chunks: ", JSON.stringify(new_certain_chunks,null,4 ));
   
   
	   for(let c = new_certain_chunks.length - 1; c >= 0; --c){
		   for(let cc = new_certain_chunks.length - 1; cc >= 0; --cc){
			   if(new_certain_chunks[c].length > new_certain_chunks[cc].length && new_certain_chunks[c].indexOf(new_certain_chunks[cc]) != -1){
				   new_certain_chunks.splice(cc,1);
				   c--;
			   }
		   }
	   }
   
	   if(new_certain_chunks.length > 1){
		   console.log("going to remove duplicated from new_certain_chunks: ", new_certain_chunks.length, JSON.stringify(new_certain_chunks,null,4));
		   new_certain_chunks = removeDuplicates(new_certain_chunks);
		   //console.warn("FINAL new_certain_chunks: ", new_certain_chunks);
	   }
   
	   return new_certain_chunks;
	   /*
	   final_certain_chunks = final_certain_chunks.concat(new_certain_chunks);
   
	   new_certain_chunks = new_certain_chunks.concat(add_back_later);
   
   
   
   
   
	   console.log("new_certain_chunks with the other parts added back in: ", new_certain_chunks.length, JSON.stringify(new_certain_chunks,null,4));
   
	   //for (let i = new_certain_chunks.length; --i; ) {
	   for (let ii = new_certain_chunks.length -1; ii >= 0; --ii ) {
           // Get information from best possible pair-merge:
           const { merged, ia, j, overlapSize } = findLongestOverlap(new_certain_chunks);
           // Remove the original two strings having the longest overlap
		   if(typeof merged == 'string'){
			   if(typeof overlapSize == 'number' && overlapSize > 1){
				   console.log("adding merger to final_certain_chunks: ", merged);
				   final_certain_chunks.push(merged);
			   }
	           //console.log("merged: ", merged);
   
			   if(merged.length){
				   new_certain_chunks.splice(j, 1);
		           new_certain_chunks.splice(ia, 1);
				   new_certain_chunks.push(merged);
	           }
		   }
		   else{
			   console.error("final_certain_chunks: merged was not a string, it was: ", typeof merged);
		   }
		   
	   
		   console.log("final_certain_chunks: ", final_certain_chunks);
       }
   
	   for(let c = final_certain_chunks.length - 1; c >= 0; --c){
		   for(let cc = final_certain_chunks.length - 1; cc >= 0; --cc){
			   if(final_certain_chunks[c].length > final_certain_chunks[cc].length && final_certain_chunks[c].indexOf(final_certain_chunks[cc]) != -1){
				   final_certain_chunks.splice(cc,1);
				   c--;
			   }
		   }
	   }
   
	   if(final_certain_chunks.length > 1){
		   console.log("going to remove duplicated from final_certain_chunks: ", final_certain_chunks.length, JSON.stringify(final_certain_chunks,null,4));
		   final_certain_chunks = removeDuplicates(final_certain_chunks);
		   //console.warn("FINAL new_certain_chunks: ", new_certain_chunks);
	   }
   
   
       // Return the single string that remains
       return final_certain_chunks; // [0];
	   */
   }















	let longest_lines_count = 0;
	let shortest_lines_count = 10000;

	for(let s = 0; s < scans.length; s++){
		
		scan_scores.push(0);
		
		// Do some minor cleanup of the data
		scans[s] = scans[s].replaceAll(' | ',' '); 
		scans[s] = scans[s].replaceAll(' í ',' '); 
		scans[s] = scans[s].replaceAll(' : ',' '); 
		scans[s] = scans[s].replaceAll(' ] ',' '); 
		scans[s] = scans[s].replaceAll(' ] ',' '); 
		
		scans[s] = scans[s].replaceAll(' |\n',' \n'); 
		scans[s] = scans[s].replaceAll(' í\n',' \n'); 
		scans[s] = scans[s].replaceAll(' :\n',' \n'); 
		scans[s] = scans[s].replaceAll(' ]\n',' \n'); 
		scans[s] = scans[s].replaceAll(' ]\n',' \n'); 
		scans[s] = scans[s].replaceAll(' | \n',' \n'); 
		scans[s] = scans[s].replaceAll(' í \n',' \n'); 
		scans[s] = scans[s].replaceAll(' : \n',' \n'); 
		scans[s] = scans[s].replaceAll(' ] \n',' \n'); 
		scans[s] = scans[s].replaceAll(' ] \n',' \n'); 
		
		scans[s] = scans[s].replaceAll('\n| ',' \n'); 
		scans[s] = scans[s].replaceAll('\ní ',' \n'); 
		scans[s] = scans[s].replaceAll('\n: ',' \n'); 
		scans[s] = scans[s].replaceAll('\n] ',' \n'); 
		scans[s] = scans[s].replaceAll('\n] ',' \n'); 
		scans[s] = scans[s].replaceAll('\n | ',' \n'); 
		scans[s] = scans[s].replaceAll('\n í ',' \n'); 
		scans[s] = scans[s].replaceAll('\n : ',' \n'); 
		scans[s] = scans[s].replaceAll('\n ] ',' \n'); 
		scans[s] = scans[s].replaceAll('\n ] ',' \n'); 
		
		//scans[s] = scans[s].replaceAll('	',' [!TAB_WAS_HERE!] '); 
		scans[s] = scans[s].replaceAll('	',' '); 
		scans[s] = scans[s].replaceAll('\n','' +  newliner + ' '); 
		
		scans[s] = scans[s].replaceAll(newliner + '  | ',newliner + ' ');
		scans[s] = scans[s].replaceAll(newliner + '  î ',newliner + ' ');
		scans[s] = scans[s].replaceAll(newliner + '  : ',newliner + ' ');
		scans[s] = scans[s].replaceAll(newliner + '  ] ',newliner + ' ');
		scans[s] = scans[s].replaceAll(newliner + '  [ ',newliner + ' ');
		
		const lines = scans[s].split('\n');
		//scan_data.push(lines);
		scan_data.push([]);

		let previous_words = [];
		//console.error("lines.length: ", lines.length);
		
		if(lines.length > longest_lines_count){
			longest_lines_count = lines.length;
		}
		
		if(lines.length < shortest_lines_count){
			shortest_lines_count = lines.length;
		}
		
		

		for(let l = 0; l < lines.length; l++){
			if(typeof chunk_lines[l] == 'undefined'){
				chunk_lines[l] = [];
			}
			if(lines[l].trim().length){
				
				// Clean up the lines a little bit
				
				if(lines[l].startsWith(' | ') || lines[l].startsWith(' î ') || lines[l].startsWith(' : ') || lines[l].startsWith(' ] ') ){
					lines[l] = lines[l].substr(2);
				}
				
				
				
				// Add cleaned line to scan_data
				scan_data[s].push(lines[l]);
				
				let line_score_addition = 0;
				if(typeof line_scores[lines[l]] == 'undefined'){
					line_scores[lines[l]] = 0;
				}
				else{
					let multiplier = 5;
					if(line_scores[lines[l]] > 0 && lines[l].length > 5){
						//console.log("Awesome, this same line has been seen more than twice");
						multiplier = 100;
						
						if(typeof certain_chunks[lines[l]] == 'undefined'){
							certain_chunks[lines[l]] = {
								'scans':[s], // in what scan was this line found? 
								'lines':[l], // in what lines can this chunk be found? This can vary a little accros scans
								'indexes':[0], // the word's/chunk's location in the line
								'chars':lines[l] // the chunk itself
							}
							
							chunk_lines[l].push(lines[l]);
						}
						else{
							certain_chunks[lines[l]].scans.push(s);
							certain_chunks[lines[l]].lines.push(l);
						}
						
					}
					line_score_addition = (lines[l].length * multiplier);
					line_scores[lines[l]] += line_score_addition;
				}
				if(line_score_addition){
					for(let sd = 0; sd < scan_data.length; sd++){
						if(scan_data[sd].indexOf(lines[l]) != -1){
							scan_scores[sd] += 10;
						}
					}
				}
				
				
				
				
				if(typeof line_data[lines[l]] == 'undefined'){
					let new_line_data = {
						'scans':[s],
						'indexes':[l],
						'line':lines[l],
						//'far_previous_lines':{},
						'previous_lines':{},
						'next_lines':{},
						//'far_next_lines':{}
					}
					/*
					if(l > 1){
						new_line_data['far_previous_lines'][lines[l-2]] = {
							'scans':[s],
							'indexes':[l],
							'line':lines[l-2]
						}
					}
					*/
					if(l > 0){
						new_line_data['previous_lines'][lines[l-1]] = {
							'scans':[s],
							'indexes':[l],
							'line':lines[l-1]
						}
					}
					if(l < lines.length - 1){
						new_line_data['next_lines'][lines[l+1]] = {
							'scans':[s],
							'indexes':[l],
							'line':lines[l+1]
						}
					}
					/*
					if(l < lines.length - 2){
						new_line_data['far_next_lines'][lines[l+2]] = {
							'scans':[s],
							'indexes':[l],
							'line':lines[l+2]
						}
					}
					*/
					line_data[lines[l]] = new_line_data;
				}
				else{
					//console.log("HURRAY, ocr scan found the exact same line again: ", lines[l]);
					line_data[lines[l]].scans.push(s);
					line_data[lines[l]].indexes.push(l);
					/*
					if(l > 1){
						line_data[lines[l]]['far_previous_lines'][lines[l-2]] = {
							'scans':[s],
							'indexes':[l],
							'line':lines[l-2]
						}
					}
					*/
					if(l > 0){
						line_data[lines[l]]['previous_lines'][lines[l-1]] = {
							'scans':[s],
							'indexes':[l],
							'line':lines[l-1]
						}
					}
					
					if(l < lines.length - 1){
						line_data[lines[l]]['next_lines'][lines[l+1]] = {
							'scans':[s],
							'indexes':[l],
							'line':lines[l+1]
						}
					}
					/*
					if(l < lines.length - 2){
						line_data[lines[l]]['next_lines'][lines[l+2]] = {
							'scans':[s],
							'indexes':[l],
							'line':lines[l+2]
						}
					}
					*/
				}
	
				const words = lines[l].split(' ');
				for(let w = 0; w < words.length; w++){
					
					if(words[w].trim().length){
						if(typeof word_data[words[w]] == 'undefined'){
							let new_word_data = {
								'scans':[s],
								'lines':[l],
								'indexes':[w],
								'lines_chars':[lines[l]],
								'chars':words[w],
								'previous_words':{},
								'next_words':{},
								'far_previous_words':{},
								'far_next_words':{}
							}
							
							
							if(typeof previous_words[0] != 'undefined'){
								new_word_data['previous_words'][previous_words[0].chars] = JSON.parse(JSON.stringify(previous_words[0]));
								/*{
									'scans':[s],
									'indexes':[w],
									'lines':[l],
									'chars':words[w-2]
								}
									*/
							}
							if(typeof previous_words[1] != 'undefined'){
								new_word_data['far_previous_words'][previous_words[1].chars] = JSON.parse(JSON.stringify(previous_words[1]));
								/*{
									'scans':[s],
									'indexes':[w],
									'lines':[l],
									'chars':words[w-2]
								}
									*/
							}
							/*
							
							if(w > 1){
								new_word_data['far_previous_words'][words[w-2]] = {
									'scans':[s],
									'indexes':[w],
									'lines':[l],
									'chars':words[w-2]
								}
							}
							else{
								if(w == 1){
									new_word_data['far_previous_words'][words[w-2]] = {
										'scans':[s],
										'lines':[l],
										'indexes':[w],
										'chars':words[w-2]
									}
								}
							}
							if(w > 0){
								new_word_data['previous_words'][words[w-1]] = {
									'scans':[s],
									'lines':[l],
									'indexes':[w],
									'chars':words[w-1]
								}
							}
							*/
							if(w < words.length - 1){
								new_word_data['next_words'][words[w+1]] = {
									'scans':[s],
									'lines':[l],
									'indexes':[w],
									'chars':words[w+1]
								}
							}
							if(w < words.length - 2){
								new_word_data['far_next_words'][words[w+2]] = {
									'scans':[s],
									'lines':[l],
									'indexes':[w],
									'chars':words[w+2]
								}
							}
							word_data[words[w]] = new_word_data;
						}
						else{
							if(word_data[words[w]].scans.indexOf(s) == -1){
								word_data[words[w]].scans.push(s);
							}
							word_data[words[w]].indexes.push(w);
							
							if(word_data[words[w]].lines.indexOf(l) == -1){
								word_data[words[w]].lines.push(l);
							}
							
							
							
							if(word_data[words[w]].lines_chars.indexOf(lines[l]) == -1){
								word_data[words[w]].lines_chars.push( [lines[l]] );
							}
						
							//new_word_data['far_previous_words'][previous_words[1].chars] = JSON.parse(JSON.stringify(previous_words[1]));
						
							//word_data[words[w]]['far_previous_words'][words[w-2]]
						
						
							if(typeof previous_words[0] != 'undefined'){
								word_data[words[w]]['previous_words'][previous_words[0].chars] = JSON.parse(JSON.stringify(previous_words[0]));
								/*{
									'scans':[s],
									'indexes':[w],
									'lines':[l],
									'chars':words[w-2]
								}
									*/
							}
							if(typeof previous_words[1] != 'undefined'){
								if(typeof word_data[words[w]]['far_previous_words'][previous_words[1].chars] == 'undefined'){
									word_data[words[w]]['far_previous_words'][previous_words[1].chars] = JSON.parse(JSON.stringify(previous_words[1]));
								}
								else{
									//word_data[words[w]]['far_previous_words'][previous_words[1].chars].scans.push(w);
									if(word_data[words[w]]['far_previous_words'][previous_words[1].chars].indexes.indexOf(w) == -1){
										word_data[words[w]]['far_previous_words'][previous_words[1].chars].indexes.push(w);
									}
									word_data[words[w]]['far_previous_words'][previous_words[1].chars].indexes.push(w);
									if(word_data[words[w]]['far_previous_words'][previous_words[1].chars].lines.indexOf(l) == -1){
										word_data[words[w]]['far_previous_words'][previous_words[1].chars].lines.push(l);
									}
								}
								word_data[words[w]]['far_previous_words'][previous_words[1].chars] = JSON.parse(JSON.stringify(previous_words[1]));
								/*{
									'scans':[s],
									'indexes':[w],
									'lines':[l],
									'chars':words[w-2]
								}
									*/
							}
							
							if(typeof previous_words[0] != 'undefined'){
								if(typeof word_data[words[w]]['previous_words'][previous_words[0].chars] == 'undefined'){
									word_data[words[w]]['previous_words'][previous_words[0].chars] = JSON.parse(JSON.stringify(previous_words[0]));
								}
								else{
									//word_data[words[w]]['previous_words'][previous_words[0].chars].scans.push(w);
									if(word_data[words[w]]['previous_words'][previous_words[0].chars].indexes.indexOf(w) == -1){
										word_data[words[w]]['previous_words'][previous_words[0].chars].indexes.push(w);
									}
									word_data[words[w]]['previous_words'][previous_words[0].chars].indexes.push(w);
									if(word_data[words[w]]['previous_words'][previous_words[0].chars].lines.indexOf(l) == -1){
										word_data[words[w]]['previous_words'][previous_words[0].chars].lines.push(l);
									}
								}
								word_data[words[w]]['previous_words'][previous_words[0].chars] = JSON.parse(JSON.stringify(previous_words[0]));
								/*{
									'scans':[s],
									'indexes':[w],
									'lines':[l],
									'chars':words[w-2]
								}
									*/
							}
							
							/*
							if(w > 1){
								word_data[words[w]]['far_previous_words'][words[w-2]] = {
									'scans':[s],
									'indexes':[w],
									'chars':words[w-2]
								}
							}
							if(w > 0){
								word_data[words[w]]['previous_words'][words[w-1]] = {
									'scans':[s],
									'indexes':[w],
									'chars':words[w-1]
								}
							}
							*/
							if(w < words.length - 1){
								word_data[words[w]]['next_words'][words[w+1]] = {
									'scans':[s],
									'indexes':[w],
									'lines':[l],
									'chars':words[w+1]
								}
							}
							else if(typeof lines[l+1] != 'undefined'){
								let first_word_on_next_line = lines[l+1].split(' ');
								if(first_word_on_next_line.length){
									first_word_on_next_line = first_word_on_next_line[0];
									word_data[words[w]]['next_words'][first_word_on_next_line] = {
										'scans':[s],
										'lines':[l+1],
										'indexes':[0],
										'chars':first_word_on_next_line
									}
								}
							}
							
							if(w < words.length - 2){
								word_data[words[w]]['far_next_words'][words[w+2]] = {
									'scans':[s],
									'indexes':[w],
									'chars':words[w+2]
								}
							}
							else if(typeof lines[l+1] != 'undefined'){
								
								let first_word_on_next_line = lines[l+1].split(' ');
								if(first_word_on_next_line.length){
									first_word_on_next_line = first_word_on_next_line[0];
									word_data[words[w]]['next_words'][first_word_on_next_line] = {
										'scans':[s],
										'lines':[l+1],
										'indexes':[0],
										'chars':first_word_on_next_line
									}
								}
								
								let second_word_on_next_line = lines[l+1].split(' ');
								if(second_word_on_next_line.length > 1){
									second_word_on_next_line = second_word_on_next_line[1];
									word_data[words[w]]['far_next_words'][second_word_on_next_line] = {
										'scans':[s],
										'lines':[l+1],
										'indexes':[0],
										'chars':second_word_on_next_line
									}
								}
								
							}
		
						}
						
						previous_words.unshift({
							'scans':[s],
							'indexes':[w],
							'lines':[l],
							'chars':words[w]		
						})
						
						if(previous_words.length > 2){
							previous_words = previous_words.splice(0,3);
							//console.log("previous_words: " + previous_words[1].chars + " " + previous_words[0].chars );
						}
						
						
					}
				}
				
			}
		}
	}
	
	console.log("merge_ocr_scans: scan_data: ", scan_data);
	console.log("merge_ocr_scans: line_data: ", line_data);
	console.log("merge_ocr_scans: word_data: ", word_data);
	console.log("merge_ocr_scans: initial line_scores: ", line_scores);

	if(typeof word_data['|'] != 'undefined'){
		delete word_data['|'];
	}
	if(typeof word_data[' |'] != 'undefined'){
		delete word_data[' |'];
	}
	if(typeof word_data['| '] != 'undefined'){
		delete word_data['| '];
	}
	// Create scores for how likely a line was scanned well, based on how often the words in the line are agreed upon to exist accross scans

	
	
	for (const [word, details] of Object.entries(word_data)) {
		//console.log("- checking word: ", word);
		
		if(word.length > 1){
			
			let agreement_margin = 1;
			
			function get_margin(word){
				let agreement_margin = 1;
				if(word.length > 4){ // for longer words, fewer scans have to agree
					agreement_margin = 2;
				}
			
				if(word.length > 6){ // for longer words, fewer scans have to agree
					agreement_margin = 3;
				}
				if(scans.length > 5){
					agreement_margin += (scans.length-5);
				}
				
				if(word.length > 2){
					//agreement_margin++;
				}
				return agreement_margin;
			}
			
			if(word == newliner){
				//continue
			}
			
			// The word was found in all scans but one
			if(details.scans.length >= scans.length - 1){
				certain_words.push(word);
				
				let chunk = null;
				let prev_words = keyz(details.previous_words);
				if(prev_words.indexOf(newliner) != -1){
					prev_words.splice(prev_words.indexOf(newliner));
					prev_words.push(newliner);
				}
				for(let pw = 0; pw < prev_words.length; pw++){
					if(typeof word_data[prev_words[pw]] == 'undefined'){
						console.error("previous word was not in word_data: ", prev_words[pw]);
					}
					else if(word_data[prev_words[pw]] && word_data[prev_words[pw]].scans.length >= scans.length - get_margin(prev_words[pw]) ){
						chunk = prev_words[pw] + ' ' + word;
						
						let far_prev_words = keyz(details.far_previous_words);
						
						if(far_prev_words.indexOf(newliner) != -1){
							far_prev_words.splice(far_prev_words.indexOf(newliner));
							far_prev_words.push(newliner);
						}
						for(let fpw = 0; fpw < far_prev_words.length; fpw++){
							if(typeof word_data[far_prev_words[fpw]] == 'undefined'){
								console.error("far previous word was not in word_data: ", far_prev_words[fpw]);
							}
							else if(word_data[far_prev_words[fpw]] && word_data[far_prev_words[fpw]].scans.length >= scans.length - get_margin(far_prev_words[fpw]) ){
								if(prev_words[pw] == newliner && far_prev_words[fpw] == newliner){
									//continue
								}
								else{
									chunk = far_prev_words[fpw] + ' ' + chunk;
									break
								}
								
							}
						}
						break
					}
				}
				let next_words = keyz(details.next_words);
				//console.log("next_words: ", next_words);
				if(next_words.indexOf(newliner) != -1){
					next_words.splice(next_words.indexOf(newliner));
					next_words.push(newliner);
				}
				for(let nw = 0; nw < next_words.length; nw++){
					if(typeof word_data[next_words[nw]] == 'undefined'){
						console.error("next word was not in word_data: ", next_words[nw]);
					}
					else if(word_data[next_words[nw]] && word_data[next_words[nw]].scans.length >= scans.length - get_margin(next_words[nw]) ){
						if(chunk){
							chunk = chunk + ' ' + next_words[nw];
						}
						else{
							chunk = word + ' ' + next_words[nw];
						}
						
						let far_next_words = keyz(details.far_next_words);
						if(far_next_words.indexOf(newliner) != -1){
							far_next_words.splice(far_next_words.indexOf(newliner));
							far_next_words.push(newliner);
						}
						//console.log("far_next_words: ", far_next_words);
						for(let fnw = 0; fnw < far_next_words.length; fnw++){
							if(typeof word_data[far_next_words[fnw]] == 'undefined'){
								console.error("far next word was not in word_data: ", far_next_words[fnw]);
							}
							if(word_data[far_next_words[fnw]] && word_data[far_next_words[fnw]].scans.length >= scans.length - get_margin(far_next_words[fnw]) ){
								if(next_words[nw] == newliner && far_next_words[fnw] == newliner){
									//continue
								}
								else{
									chunk = chunk + ' ' + far_next_words[fnw];
									//console.log("next_words, far_next_words: ", next_words,far_next_words);
									//console.log("possible weird chunk: ", chunk);
									break
								}
								
							}
						}
						
						break
					}
				}
				if(chunk){
					//console.log("found a certain chunk: ", chunk);
					//certain_chunks.push(chunk);
					
					if(typeof certain_chunks[chunk] == 'undefined'){
						certain_chunks[chunk] = {
							'scans':details.scans,
							'lines':details.lines,
							'indexes':details.indexes,
							'chars':chunk
						}
					}
					
					
				}
				
			}
			
			
			if(details.scans.length > 1){
				for(let lc = 0; lc < details.lines_chars.length; lc++){
					//console.log("found this word multiple times: ", word, details.scans.length  - 1);
					line_scores[details.lines_chars[lc]] += (word.length *  ((details.scans.length)  - 1 * (details.scans.length  - 1)));
				}
			}
			
		}
	}
	
	//console.warn("certain_words: ", certain_words);
	//console.warn("certain_chunks: ", certain_chunks);
	
	//console.log("shortest_lines_count: ", shortest_lines_count);
	//console.log("longest_lines_count: ", longest_lines_count);
	
	//console.log("going to reduce: ", keyz(certain_chunks));
	let connected_chunks = reduceToOne( ...keyz(certain_chunks) );
	//console.log("connected_chunks: ", connected_chunks);
	
	output_text = connected_chunks.join(' \n\n');
	
	//console.log("ocr output_text: ", output_text);
	let period_count = (output_text.match(/. /g) || []).length;
	//console.log("ocr period_count: . ", period_count);
	period_count += (output_text.match(/\? /g) || []).length;
	//console.log("ocr period_count: ? ", period_count);
	period_count += (output_text.match(/\! /g) || []).length;
	//console.log("ocr period_count: ! ", period_count);
	
	var newliner_regex = new RegExp(newliner, 'g');
	const newliner_count = (output_text.match(newliner_regex) || []).length;
	//console.log("ocr newliner_count: ", newliner_count);
	
	if(newliner_count){
		
		if(newliner_count > 5){
		
			if(period_count > newliner_count / 3){
				output_text = output_text.replaceAll(newliner,' ');
			}
			else{
				output_text = output_text.replaceAll(newliner,'\n');
			}
		}
		else{
			output_text = output_text.replaceAll(newliner,'\n');
		}
	}
	else{
		output_text = output_text.replaceAll(newliner,'\n');
	}
	
	
	
	live_ocr_output_el.value = output_text;
	
	
	let line_length_delta = longest_lines_count - shortest_lines_count;
	if(line_length_delta == 0){line_length_delta = 1};
	
	let used_chunks = [];
	
	const certain_chunks_list = keyz(certain_chunks);
	if( certain_chunks_list.length > 1){
		
		let chunks_on_lines = [];
		for(let q = 0; q < longest_lines_count; q++){
			//console.log("q: ", q);
			
			let line_chunks = [];
			//for(let cc = 0; cc < certain_chunks_list.length; cc++){
			for (const [chunk, details] of Object.entries(certain_chunks)) {
				//console.log("certain_chunks: chunk, details: ", chunk, details);
				if(details.lines.indexOf(q) != -1){
					line_chunks.push(chunk);
				}
				//certain_chunks[cc].lines
			}
			//console.warn("line_chunks: ", q, line_chunks);
			//let line_connected_chunks = reduceToOne(...line_chunks);
			//console.log("line_connected_chunks: ", line_connected_chunks);
			
		}
		
		
		
		//let edge_chunks = [0](...certain_chunks);
		//sreturn
		
		
		/*
		let newline_chunks = [];
		let add_back_later = [];
		for (let d = 0; d < keyz[certain_chunks].length; d++ ) {
			if(certain_chunks[d].indexOf(newliner) != -1){
				newline_chunks.push(certain_chunks[d]);
			}
			else{
				add_back_later.push(certain_chunks[d]);
			}
		}
		
		let edge_chunks = reduceToOne(...newline_chunks);
		//console.warn("inital edge_chunks: ", JSON.stringify(edge_chunks, null,4));
		for(let a = add_back_later.length - 1; a >= 0; --a){
			
			for(let e = edge_chunks.length - 1; e >= 0; --e){
				if(edge_chunks[e].startsWith(newliner + ' ') && !edge_chunks[e].endsWith(' ' + newliner)){
					if( add_back_later[a].startsWith( edge_chunks[e].replace(newliner + ' ') ) ){
						edge_chunks[e] = newliner + ' ' + add_back_later[a];
						//console.warn("GLUED TO THE END: ", edge_chunks[e], add_back_later[a]);
						add_back_later.splice(a,1);
						break
					}
				}
				else if(edge_chunks[e].endsWith(' ' + newliner) && !edge_chunks[e].startsWith(' ' + newliner)){
					if( add_back_later[a].endsWith( edge_chunks[e].substr(0, edge_chunks[e].lastIndexOf(' ' + newliner) ) ) ){
						edge_chunks[e] = add_back_later[a] + ' ' + newliner;
						//console.warn("GLUED TO THE START: ", edge_chunks[e], add_back_later[a]);
						add_back_later.splice(a,1);
						break
					}
				}
			}
			/*
			const chunks_length_before = edge_chunks.length;
			edge_chunks = reduceToOne(...edge_chunks,add_back_later[a]);
			if(chunks_length_before == edge_chunks.length){
				//console.log("failed to glue this chunk onto the others: ", add_back_later[a]);
			}
			else{
				//console.log("succesfully glued this chunk onto the others: ", add_back_later[a]);
				const testje = add_back_later.splice(a,1);
				//console.log("testje, add_back_later.length: ", testje, add_back_later.length);
				//add_back_later = add_back_later.splice(a,1);
			}
			*/
		//}
		
		//certain_chunks = reduceToOne(certain_chunks);
		
		
		//console.warn("edge_chunks: ", edge_chunks);
		
	}
	
	return output_text;
}


window.translate_ocr_scan = function (){
	
}






/*
window.insert_ocr_scan_result = function (){
	
	let save_ocr_task = {
		'prompt':null,
		'origin':'picture',
		'assistant':'ocr',
		'type':'image_processing',
		'state':'doing_ocr',
		'destination':'document'
	}
	
	if(window.settings.docs.open == null){
		let ocr_document_filename = get_translation('Text_from_photo') + ' ' + make_date_string() + '.txt'
		create_new_document(get_translation("Photo_to_text_results") + ":\n\n", ocr_document_filename);
		save_ocr_task['file'] = {'folder':folder,'filename':ocr_document_filename};
	}
	else{
		save_ocr_task['file'] = window.settings.docs.open;
		save_ocr_task['selection'] = window.doc_selection;
		
		// insert it 1 character before the actual cursor position
		if(save_ocr_task['selection'] && typeof save_ocr_task['selection'].from == 'number' && typeof save_ocr_task['selection'].to == 'number' && save_ocr_task['selection'].from == save_ocr_task['selection'].to && save_ocr_task['selection'].from > 0){
			save_ocr_task['selection'].from = save_ocr_task['selection'].from - 1;
			save_ocr_task['selection'].to = save_ocr_task['selection'].to - 1;
		}
		else{
			save_ocr_task['selection'] = {'to':0,'from':0}
		}
		save_ocr_task['line_nr'] = window.doc_line_nr;
	}
	
	
	insert_into_document()
	
}
*/

window.new_document_from_ocr_scan_result = function (){
	//console.log("in new_document_from_ocr_scan_result");
	
	let save_ocr_task = {
		'prompt':null,
		'origin':'picture',
		'assistant':'ocr',
		'type':'image_processing',
		'state':'doing_ocr',
		'destination':'document'
	}
	//console.log("save_ocr_task: ", save_ocr_task);
	
	let ocr_document_filename = get_translation('Text_from_photo') + ' ' + make_date_string() + '.txt'
	create_new_document(get_translation("Photo_to_text_results") + ":\n\n", ocr_document_filename);
	save_ocr_task['file'] = {'folder':folder,'filename':ocr_document_filename};
	save_ocr_task['selection'] = {'position':'end'};
	/*
	if(window.settings.docs.open == null){
		let ocr_document_filename = get_translation('Text_from_photo') + ' ' + make_date_string() + '.txt'
		create_new_document(get_translation("Photo_to_text_results") + ":\n\n", ocr_document_filename);
		save_ocr_task['file'] = {'folder':folder,'filename':ocr_document_filename};
	}
	else{
		save_ocr_task['file'] = window.settings.docs.open;
		save_ocr_task['selection'] = window.doc_selection;
		
		// insert it 1 character before the actual cursor position
		if(save_ocr_task['selection'] && typeof save_ocr_task['selection'].from == 'number' && typeof save_ocr_task['selection'].to == 'number' && save_ocr_task['selection'].from == save_ocr_task['selection'].to && save_ocr_task['selection'].from > 0){
			save_ocr_task['selection'].from = save_ocr_task['selection'].from - 1;
			save_ocr_task['selection'].to = save_ocr_task['selection'].to - 1;
		}
		else{
			save_ocr_task['selection'] = {'to':0,'from':0}
		}
		save_ocr_task['line_nr'] = window.doc_line_nr;
	}
	*/
	
	save_ocr_task = window.add_task(save_ocr_task);
	if(save_ocr_task){
		window.handle_completed_task(save_ocr_task,live_ocr_output_el.value + '\n');
	}
	
}



window.insert_ocr_scan_result = function(){
	// live_ocr_output_el.value + '\n'
	
	if(window.settings.docs.open == null){
		console.error("insert_ocr_scan_result: no open document?");
		return false
	}
	
	let save_ocr_task = {
		'prompt':null,
		'origin':'picture',
		'assistant':'ocr',
		'type':'image_processing',
		'state':'doing_ocr',
		'destination':'document'
	}
	
	save_ocr_task['file'] = window.settings.docs.open;
	save_ocr_task['selection'] = window.doc_selection;
	
	
	
	// insert it 1 character before the actual cursor position
	/*
	if(save_ocr_task['selection'] && typeof save_ocr_task['selection'].from == 'number' && typeof save_ocr_task['selection'].to == 'number' && save_ocr_task['selection'].from == save_ocr_task['selection'].to && save_ocr_task['selection'].from > 0){
		save_ocr_task['selection'].from = save_ocr_task['selection'].from - 1;
		save_ocr_task['selection'].to = save_ocr_task['selection'].to - 1;
	}
	else{
		save_ocr_task['selection'] = {'to':0,'from':0}
	}
	*/
	
	insert_into_document(save_ocr_task, live_ocr_output_el.value + '\n');
	// insert_into_document(task,content,{"position":"overwrite"});
	
}




window.add_image_task = function (task={}){
	//console.log("in add_image_task. task: ", task);
	if(typeof task == 'object' && task != null){
		
		let image_task = {
			'prompt':null,
			'origin':'picture',
			'type':'image_processing',
			'destination':'document'
		}
		
		image_task = {...image_task, ...task};
		//console.log("add_image_task: image_task after overlaying options: ", image_task);
		
		return window.add_task(image_task);
	}
	else{
		console.error("parse_picture: invalid task provided: ", task);
	}
	return false
}





window.clear_picture = async function (){ 
    video_context.fillStyle = "#AAA";
    video_context.fillRect(0, 0, video_canvas_el.width, video_canvas_el.height);

    //const data = video_context.toDataURL("image/png");
    //photo.setAttribute("src", data);
}



video_el.addEventListener("canplay",(event) => {
	//console.log("video_el event: canplay: ", event);
	//console.log("window.camera_streaming: ", window.camera_streaming);
	
	
	
	
	
	
	if (!window.camera_streaming) {
		//console.warn("video_el event: canplay: window.camera_streaming is false");
		/*
		height = video_el.videoHeight / (video_el.videoWidth / width); // can be used to rescale the image
        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.

        if (isNaN(height)) {
          height = width / (4 / 3);
        }

        video_el.setAttribute("width", width);
        video_el.setAttribute("height", height);
        video_canvas_el.setAttribute("width", width);
        video_canvas_el.setAttribute("height", height);
        streaming = true;
		*/
	}
},false);




window.analyze_video_stream = function(stream){
	if(stream){
		
		/*
		stream.getVideoTracks()[0].getSettings().deviceId
		stream.getVideoTracks()[0].getSettings().frameRate
		stream.getVideoTracks()[0].getSettings().height
		stream.getVideoTracks()[0].getSettings().width
		stream.getVideoTracks()[0].getSettings().aspectRatio
		*/
		
		//console.log("stream -> video_track: ", video_track.getSettings(), video_track.getSettings().width, video_track.getSettings().height);
		
		
		
		const video_track = stream.getVideoTracks()[0];
		if(typeof video_track != 'undefined' && video_track != null){
			window.video_stream_meta = video_track.getSettings();
			if(window.video_stream_meta != 'undefined' && window.video_stream_meta != null){
				if(typeof window.video_stream_meta.width == 'number' && typeof window.video_stream_meta.height == 'number'){
					window.camera_width = window.video_stream_meta.width;
					window.camera_height = window.video_stream_meta.height;
				
					video_canvas_el.width = window.camera_width;
					video_canvas_el.height = window.camera_height;
				
					if(typeof window.video_stream_meta.aspect_ratio == 'number'){
						window.camera_ratio = window.video_stream_meta.aspect_ratio
					}
					else{
						window.camera_ratio = window.camera_width / window.camera_height;
					}
				
					if(typeof window.video_stream_meta.deviceId == 'string'){
						window.camera_select_el.value = window.video_stream_meta.deviceId;
					}
				
					let scan_hint_container_el = document.getElementById("camera-overlay-scan-hint-container");
					if(scan_hint_container_el){
						if(window.camera_width > window.camera_height){
					
							const width_offset = Math.floor( (window.camera_width - (window.camera_height / 1.5)) / 2);
							console.log("start of camera stream. width_offset for scan hint box: ", width_offset, ", of: ", window.camera_width + "x" + window.camera_height)
							window.camera_crop_box = {
							    "topLeftCorner": {
							        "x": width_offset,
							        "y": 0
							    },
							    "topRightCorner": {
							        "x": window.camera_width - width_offset,
							        "y": 0
							    },
							    "bottomLeftCorner": {
							        "x": width_offset,
							        "y": window.camera_height
							    },
							    "bottomRightCorner": {
							        "x": window.camera_width - width_offset,
							        "y": window.camera_height
							    }
							}
				
							let scan_hint_svg_el = window.create_svg(window.camera_width,window.camera_height,window.camera_crop_box,0);
							scan_hint_container_el.appendChild(scan_hint_svg_el);
						}
						else{
							scan_hint_container_el.innerHTML = '';
							window.camera_crop_box = null;
						}
					}
				}
			}
		}	
	}	
}




video_el.onloadedmetadata = (video_meta_data) => {
	//console.log("video element: loaded metadata. video_meta_data: ", video_meta_data);
	video_el.play()
	.then((value) => {
		window.camera_streaming = true;
		window.busy_starting_camera = false;
		document.body.classList.add('show-camera');
		
		if(window.opencv_jscanify != null && window.detecting_page_in_video == false && window.camera_streaming == true && document.body.classList.contains('doing-ocr')){
			console.log("video canplay event detected: starting detect_page_in_video loop");
			window.detect_page_in_video();
		}
		
		resolve(true);
	})
	.catch((err) => {
		window.busy_starting_camera = false;
		//reject(false);
	})
};



async function enable_camera_switching(){
	
	if(window.has_camera){
		if(window.camera_select_el != null){
			window.camera_select_el.addEventListener('change', () => {
				console.log("camera select dropdown changed");
				
				//const videoDevice = videoDevices[0];
				
				navigator.mediaDevices.getUserMedia({
					audio: false,
					video: {
						deviceId: window.camera_select_el.value
					}
				})
				.then((media_stream) => {
					video_el.src = null;
					video_el.srcObject = media_stream;
					//video_el.play();
				})
				.catch((err) => {
					console.error("caught error getting media stream");
				})

			});
		}
	}
}




enable_camera_switching();











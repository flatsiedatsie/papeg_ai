//console.log("document.URL: ", document.URL);

let s = new Date().toLocaleString();
//console.log("local time: ", s); // not really used for anything?

window.deferreds = []; // not used?
window.language_names = {};

window.main_audio_context = null;
window.main_audio_context_sample_rate = null;
window.mediaStream = null;
window.simple_vad = null;
window.simple_vad_source = null;
window.last_vad_recording = [];
window.last_vad_recording_length = 0;
window.simple_vad_worklet_added = false;
window.busy_recording_simple_vad = false;
window.vad_paused = false;
window.stopped_whisper_because_of_low_memory = false;

window.idle = true; // If no AI tasks are being executed this becomes false;
window.internet = true; // Set to false if there is no internet connection
window.skip_a_beat = false; // let the interval wait one more beat
window.page_focus_loss_counter = 0; // increases by 1 every second the page doesn't have focus. When it reached 120 seconds all AI's are unloaded
window.page_has_focus = true;
window.chat_footer_transition_threshold_height = 130; // 190
window.generate_ui_first_run = true;
window.timers_recreated = false;
window.last_time_ai_responded = {}; // data about when the last interaction occured is kept in a separate dictionary to avoid storing that information
window.only_allow_voice_commands = false;
window.last_selected_paragraph = null; // used when selecting previous/next paragraphs via voice control
window.last_selected_paragraph_text = null; // used when selecting previous/next paragraphs via voice control

window.unread_messages = {};
//window.last_time_context_menu_clicked = 0; // for some reason the file manager menu keeps getting bubbled-up clicks, even though it shouldn't. Horrible hack to fix it.

window.question_text = null; // the question being asked about a document
window.question_document = null;
window.question_selection = null; // the sub-selection of the document that a question is being asked about
window.last_user_query = 'unnamed'; // used to suggest file name
window.currently_running_llm = null;
//window.current_task = null; // already in index.html
window.ai_being_edited = null; // switched to true while an AI is being modified

window.selection_hint_timeout = null;
window.do_after_command = null;

// rewrite tags are in window.settings.rewrite_tags

window.myvad = null;
window.document_tasks = [
	'continue',
	'rewrite',
	'summarize',
	'summarize_docment',
	'translate',
	'translate_document',
	'prompt_at_line'
];

window.irrelevant_task_states = ['completed','interrupted','failed','reviewing','reviewed','hidden'];

window.best_models = ['phi3_mini','mistral','llama3_8B']; // these models will get a special champion icon in the contacts list

window.sidebar_shrink_timer = null;

window.running_ai = [];

window.sentence_counter = 0;
window.minimum_proofread_length = 10;
window.minimum_rewrite_length = 50;
window.maximum_rewrite_length = 1500;
window.minimal_summarize_length = 300;
window.audio_to_play = []; // deprecated

window.stt_tasks_left = 0; // used by handle_task_complete
//window.stt_recordings_in_buffer = 0;
window.tts_tasks_left = 0; // used by handle_task_complete
//window.tts_sentences_in_buffer = 0;


window.chat_messages_to_answer = 0;
window.music_to_generate = 0;
window.images_to_generate = 0;
window.images_to_process = 0;
window.blueprint_tasks_left = 0;
window.mp3_to_encode = 0;
window.rag_tasks_left = 0;
window.assistant_tasks_left = 0;
window.chat_tasks_left = 0; // used by handle_task_complete

window.audio_output_tasks_left = 0; // used by handle_task_complete
window.blueprint_tasks_left = 0;
window.play_document_tasks_left = 0;
window.should_tasks_left = 0;
window.doing_tasks_left = 0;


window.audio_files_in_buffer = 0;
window.audio_files_to_buffer = 3;

window.interrupt_speaking_task_index = null; // only tasks with a bigger index are allowed to generate TTS
window.recording_to_listening_ratio = 0; // is the VAD more in listening mode (1) or in recording mode (0)? Between 0 and 1.
window.tts_counter = 0;
window.browser_tts_voices_raw = [];
window.browser_tts_voices = {};
window.tts_worker = null;
window.tts_worker_busy = false;
window.busy_loading_tts = false;
window.easy_speech_loaded = false; // library that simplifies browser voice synth
window.translate_stt = false;
//let tts_worker_error_count = 0; // not implemented yet
window.last_time_audio_started = null;
window.last_time_scribe_started = null;

window.scribe_precise_sentences_count = 0;
//window.scribe_continuous_stt_count = null; // maybe not necessary, let vad_audio_worklet hand out an index when continuous recording
window.maximum_scribe_duration = 3600000 * 2; // 7200000
window.scribe_clock_time_elapsed_el = null;
window.scribe_clock_time_remaining_el = null;
window.scribe_clock_progress_el = null;

window.whisper_worker = null;
window.whisper_worker_busy = false;
//window.stt_worker_busy = false;
window.whisper_loaded = false;
window.whisper_saw_exclamation_marks = false; // can indicate an issue with sample rate
window.busy_loading_whisper = false; // messy..
window.whisper_loading = false; // messy..
window.last_verified_speaker = null; // e.g. "Speaker1"
window.previous_note_time = null;
window.last_subtitle_relative_end_time = 0;
window.current_scribe_voice_parent_task_id = null;
window.measured_microphone_sample_rate = null;
window.skip_first_vad_recording = true;
window.add_timestamp_options = ['None','Minutes','Minutes_elapsed','Minutes_and_minutes_elapsed','Detailed','Precise'];
window.continuous_mic_options = ['Detect_fast','Detect_slow','Detect_slower','Continuous_recording'];
window.transcription_quality_options = ['Fast','Medium','High'];
window.mp3_worker = null;
window.mp3_worker_busy = false;

window.minimum_prompt_height = 92;


window.audio_player_busy = false;

// WLLAMA
window.tokenizer = null;
window.llama_cpp_app = null;
window.llama_cpp_fresh = true;
window.llama_cpp_busy = false;
window.interrupt_wllama = false;
window.doing_llama_cpp_refresh = false;
window.llama_cpp_model_being_loaded = null;
window.llama_cpp_model_being_downloaded = null;
window.currently_loaded_llama_cpp_assistant = null;
window.currently_loaded_llama_cpp_assistant_general_name = null;

// WEB_LLM
window.web_llm_busy = false;
window.web_llm_engine = null;
window.web_llm_script_loaded = true; // script is now always loaded
window.web_llm_assistants = ['fast_mistral','fast_phi']; // holds assistant ID's of LLM models that should be handled by WebLLM. Populated by generate_ui
window.web_llm_model_being_loaded = null
window.doing_web_llm_refresh = false;
window.currently_loaded_web_llm__assistant = null;
//console.log("window.llama_cpp_busy? ", window['llama_cpp_busy']);

window.diffusion_worker = null;
window.diffusion_worker_busy = false;
window.busy_loading_diffusion_worker = false;
window.diffusion_worker_loaded = false;

// TEXT TO IMAGE
window.text_to_image_worker = null;
window.text_to_image_worker_loaded = false;
window.real_text_to_image_worker = null;
window.text_to_image_worker_busy = false;
window.busy_loading_text_to_image = false;


//window.transformers_worker = null; // not used?
//window.transformers_worker_busy = false;

window.summarize_worker = null;
window.summarize_worker_busy == false

window.translation_worker = null;
window.translation_worker_exists = false;
window.real_translation_worker = null;
window.translation_worker_busy = false;

window.musicgen_worker = null;
window.real_musicgen_worker = null;
window.musicgen_worker_busy = false;
window.musicgen_script_loaded = false;
window.musicgen_loaded = false;
window.busy_loading_musicgen = false;

window.active_destination = 'chat'; // chat, document - where LLM output can be sent
window.active_section = 'chat'; // tools, document, chat, sidebar - which UI section was last clicked on. For handling keyboard/voice previous/next commands
window.other_ai_to_switch_to = 'phi3_mini'; // when the user clicks on a 'switch to other assistant' chat message it will switch to this value

window.stt_warmup_complete = false;
//window.stt_warmed_up = false;

window.current_origin_file = null;
window.blueprint_origin_file = null;
window.busy_doing_blueprint_task = false;


window.playing_document = false;

window.update_task_viewer = true;
window.update_simple_task_list = true;

window.blueprint_counter = 0;
window.blueprint_command_counter = 0;
window.blueprint_done_counter = 0;



// CAMERA & OCR
window.camera_on = false; // whether it should be on
window.camera_streaming = false; // whether is's actually on. Camera can sometimes stop, e.g. when a laptop lid is closed, etc.
window.busy_starting_camera = false;
window.opencv_interval = null;
window.doing_ocr_scan = 0; // counts down from 5 to 0 while gathering camera frame blobs with small intervals
window.ocr_worker_busy = false;
window.ocr_scans = [];
window.continuous_ocr_scans = [];
window.continuous_ocr_enabled = false;
window.opencv_jscanify = null;
window.detecting_page_in_video = false;
window.secondary_contour_detect_delay = 0; // if jscanify failed to detect a page in the camera stream, this is set to 300, creating an additional delay before the next attempt at detection is made
var biggest_contour_x_seen = 0;
var biggest_contour_y_seen = 0;
//window.camera_width = 1280;
//window.camera_height = 720;
window.camera_width = 1920;
window.camera_height = 1080;
window.camera_ratio = null;
window.camera_crop_box = null;
window.video_stream_meta = null;


// IMAGE TO TEXT
window.image_to_text_worker_busy = false;
window.busy_loading_image_to_text = null;
window.image_to_text_worker_loaded = false;
window.continuous_image_to_text_enabled = false;
window.last_time_continuous_image_to_text_started = null;
window.last_time_continuous_image_to_text_frame_grabbed = null;
window.continuous_image_to_text_scan_counter = 0;
window.waiting_for_image_to_text = false;
window.image_to_text_worker = null;
window.real_image_to_text_worker = null;
window.image_to_text_counter = 0;
window.image_to_text_start_time = 0;
window.image_to_text_delta = 100; // initially assume it takes 100 second to do an image_to_text task

window.last_image_to_text_blob = null;
window.last_image_to_text_blob_file = null;
window.showing_camera_still = null;


window.coder_script_loaded = false;

window.rag_counter = 0;
window.rag_worker = null;
window.promise_rag_worker = null;
window.rag_worker_busy = false;
window.selected_rag_documents = {};

window.busy_doing_research = false;


window.language_detector_loaded = false;
window.translation_module_loaded = false;
window.input_language = null;
window.output_language = null;

// OLLAMA
window.ollama = null;
window.ollama_module_loaded = false;
window.ollama_busy = false;
window.ollama_model_being_loaded == null;
window.doing_ollama_refresh = false;
window.ollama_abort_controller = null;
window.ollama_online = false;
window.ollama_models = null;
window.ollama_model_settings = null;


window.currently_preloading = [];
window.max_preload_attempts = 3;
window.recovered_download_shards = {};




// PICTURE IN PICTURE
window.pip_started = false;
window.pip_canvas = null;
window.pip_canvas_context = null;
window.pip_header_canvas = null;



//window.auto_detect_input_language = true; 
const translation_languages_raw = [ // for OPUS-MT
"en-cs",
"en-mul",
"en-jap",
"en-id",
"en-hu",
"en-hi",
"en-af",
"de-fr",
"de-es",
"de-en",
"en-de",
"es-en",
"en-es",
"fr-en",
"en-fr",
"af-en",
"hu-en",
"fr-ru",
"fr-ro",
"fr-es",
"es-ru",
"es-it",
"es-fr",
"es-de",
"en-xh",
"en-uk",
"en-sv",
"en-ro",
"xh-en",
"uk-ru",
"uk-en",
"ru-uk",
"ru-fr",
"ru-es",
"ro-fr",
"jap-en",
"it-es",
"it-en",
"it-fr",
"en-vi",
"en-fi",
"nl-fr",
"en-da",
"vi-en",
"th-en",
"en-ar",
"et-en",
"en-nl",
"nl-en",
"hi-en",
"fi-de",
"no-de",
"da-de",
"fr-de",
"ja-en"];

//window.gmw_languages = ["afr","ang_Latn","deu","eng","enm_Latn","frr","fry","gos","gsw","ksh","ltz","nds","nld","pdc","sco","stq","swg","yid"];

//"gmw-gmw",
/*
source language(s): afr ang_Latn deu eng enm_Latn frr fry gos gsw ksh ltz nds nld pdc sco stq swg yid

target language(s): afr ang_Latn deu eng enm_Latn frr fry gos gsw ksh ltz nds nld pdc sco stq swg yid
	
*/

//window.romance_languages = ["fr","fr_BE","fr_CA","fr_FR","wa","frp","oc","ca","rm","lld","fur","lij","lmo","es","es_AR","es_CL","es_CO","es_CR","es_DO","es_EC","es_ES","es_GT","es_HN","es_MX","es_NI","es_PA","es_PE","es_PR","es_SV","es_UY","es_VE","pt","pt_br","pt_BR","pt_PT","gl","lad","an","mwl","it","it_IT","co","nap","scn","vec","sc","ro","la"]

//"ROMANCE-en",
/*
	
source languages: fr,fr_BE,fr_CA,fr_FR,wa,frp,oc,ca,rm,lld,fur,lij,lmo,es,es_AR,es_CL,es_CO,es_CR,es_DO,es_EC,es_ES,es_GT,es_HN,es_MX,es_NI,es_PA,es_PE,es_PR,es_SV,es_UY,es_VE,pt,pt_br,pt_BR,pt_PT,gl,lad,an,mwl,it,it_IT,co,nap,scn,vec,sc,ro,la

target languages: en
	
*/

window.en_mul_languages = ["abk","acm","ady","afb","afh_Latn","afr","akl_Latn","aln","amh","ang_Latn","apc","ara","arg","arq","ary","arz","asm","ast","avk_Latn","awa","aze_Latn","bak","bam_Latn","bel","bel_Latn","ben","bho","bod","bos_Latn","bre","brx","brx_Latn","bul","bul_Latn","cat","ceb","ces","cha","che","chr","chv","cjy_Hans","cjy_Hant","cmn","cmn_Hans","cmn_Hant","cor","cos","crh","crh_Latn","csb_Latn","cym","dan","deu","dsb","dtp","dws_Latn","egl","ell","enm_Latn","epo","est","eus","ewe","ext","fao","fij","fin","fkv_Latn","fra","frm_Latn","frr","fry","fuc","fuv","gan","gcf_Latn","gil","gla","gle","glg","glv","gom","gos","got_Goth","grc_Grek","grn","gsw","guj","hat","hau_Latn","haw","heb","hif_Latn","hil","hin","hnj_Latn","hoc","hoc_Latn","hrv","hsb","hun","hye","iba","ibo","ido","ido_Latn","ike_Latn","ile_Latn","ilo","ina_Latn","ind","isl","ita","izh","jav","jav_Java","jbo","jbo_Cyrl","jbo_Latn","jdt_Cyrl","jpn","kab","kal","kan","kat","kaz_Cyrl","kaz_Latn","kek_Latn","kha","khm","khm_Latn","kin","kir_Cyrl","kjh","kpv","krl","ksh","kum","kur_Arab","kur_Latn","lad","lad_Latn","lao","lat_Latn","lav","ldn_Latn","lfn_Cyrl","lfn_Latn","lij","lin","lit","liv_Latn","lkt","lld_Latn","lmo","ltg","ltz","lug","lzh","lzh_Hans","mad","mah","mai","mal","mar","max_Latn","mdf","mfe","mhr","mic","min","mkd","mlg","mlt","mnw","moh","mon","mri","mwl","mww","mya","myv","nan","nau","nav","nds","niu","nld","nno","nob","nob_Hebr","nog","non_Latn","nov_Latn","npi","nya","oci","ori","orv_Cyrl","oss","ota_Arab","ota_Latn","pag","pan_Guru","pap","pau","pdc","pes","pes_Latn","pes_Thaa","pms","pnb","pol","por","ppl_Latn","prg_Latn","pus","quc","qya","qya_Latn","rap","rif_Latn","roh","rom","ron","rue","run","rus","sag","sah","san_Deva","scn","sco","sgs","shs_Latn","shy_Latn","sin","sjn_Latn","slv","sma","sme","smo","sna","snd_Arab","som","spa","sqi","srp_Cyrl","srp_Latn","stq","sun","swe","swg","swh","tah","tam","tat","tat_Arab","tat_Latn","tel","tet","tgk_Cyrl","tha","tir","tlh_Latn","tly_Latn","tmw_Latn","toi_Latn","ton","tpw_Latn","tso","tuk","tuk_Latn","tur","tvl","tyv","tzl","tzl_Latn","udm","uig_Arab","uig_Cyrl","ukr","umb","urd","uzb_Cyrl","uzb_Latn","vec","vie","vie_Hani","vol_Latn","vro","war","wln","wol","wuu","xal","xho","yid","yor","yue","yue_Hans","yue_Hant","zho","zho_Hans","zho_Hant","zlm_Latn","zsm_Latn","zul","zza"];
window.mul_en_languages = window.en_mul_languages; //["abk","acm","ady","afb","afh_Latn","afr","akl_Latn","aln","amh","ang_Latn","apc","ara","arg","arq","ary","arz","asm","ast","avk_Latn","awa","aze_Latn","bak","bam_Latn","bel","bel_Latn","ben","bho","bod","bos_Latn","bre","brx","brx_Latn","bul","bul_Latn","cat","ceb","ces","cha","che","chr","chv","cjy_Hans","cjy_Hant","cmn","cmn_Hans","cmn_Hant","cor","cos","crh","crh_Latn","csb_Latn","cym","dan","deu","dsb","dtp","dws_Latn","egl","ell","enm_Latn","epo","est","eus","ewe","ext","fao","fij","fin","fkv_Latn","fra","frm_Latn","frr","fry","fuc","fuv","gan","gcf_Latn","gil","gla","gle","glg","glv","gom","gos","got_Goth","grc_Grek","grn","gsw","guj","hat","hau_Latn","haw","heb","hif_Latn","hil","hin","hnj_Latn","hoc","hoc_Latn","hrv","hsb","hun","hye","iba","ibo","ido","ido_Latn","ike_Latn","ile_Latn","ilo","ina_Latn","ind","isl","ita","izh","jav","jav_Java","jbo","jbo_Cyrl","jbo_Latn","jdt_Cyrl","jpn","kab","kal","kan","kat","kaz_Cyrl","kaz_Latn","kek_Latn","kha","khm","khm_Latn","kin","kir_Cyrl","kjh","kpv","krl","ksh","kum","kur_Arab","kur_Latn","lad","lad_Latn","lao","lat_Latn","lav","ldn_Latn","lfn_Cyrl","lfn_Latn","lij","lin","lit","liv_Latn","lkt","lld_Latn","lmo","ltg","ltz","lug","lzh","lzh_Hans","mad","mah","mai","mal","mar","max_Latn","mdf","mfe","mhr","mic","min","mkd","mlg","mlt","mnw","moh","mon","mri","mwl","mww","mya","myv","nan","nau","nav","nds","niu","nld","nno","nob","nob_Hebr","nog","non_Latn","nov_Latn","npi","nya","oci","ori","orv_Cyrl","oss","ota_Arab","ota_Latn","pag","pan_Guru","pap","pau","pdc","pes","pes_Latn","pes_Thaa","pms","pnb","pol","por","ppl_Latn","prg_Latn","pus","quc","qya","qya_Latn","rap","rif_Latn","roh","rom","ron","rue","run","rus","sag","sah","san_Deva","scn","sco","sgs","shs_Latn","shy_Latn","sin","sjn_Latn","slv","sma","sme","smo","sna","snd_Arab","som","spa","sqi","srp_Cyrl","srp_Latn","stq","sun","swe","swg","swh","tah","tam","tat","tat_Arab","tat_Latn","tel","tet","tgk_Cyrl","tha","tir","tlh_Latn","tly_Latn","tmw_Latn","toi_Latn","ton","tpw_Latn","tso","tuk","tuk_Latn","tur","tvl","tyv","tzl","tzl_Latn","udm","uig_Arab","uig_Cyrl","ukr","umb","urd","uzb_Cyrl","uzb_Latn","vec","vie","vie_Hani","vol_Latn","vro","war","wln","wol","wuu","xal","xho","yid","yor","yue","yue_Hans","yue_Hant","zho","zho_Hans","zho_Hant","zlm_Latn","zsm_Latn","zul","zza"];



// Some models use 2-letter language codes, some use 3-letter ones. This is used to standardise on 2-letter codes.
window.language_codes_lookup = {
	"afr":"af",
	"ang_Latn":"ang_Latn", // Old english
	"deu":"de",
	"eng":"en",
	"enm_Latn":"enm_Latn",  // middle English
	"frr":"frr", // noord-frys
	"fry":"fry", // frys
	"gos":"gos", // gronings
	"gsw":"gsw", // swiss-german
	"ksh":"ksh", // Kölsch
	"ltz":"lb", // Luxembourgish
	"nds":"nds", // low-german, Low German, Low Saxon, (niedersaxisch?)
	"nld":"nl", // Dutch, Flemish
	"pdc":"pdc", // Pennsylvania German
	"sco":"sco", // Scots
	"stq":"stq", // Saterfriesisch
	"swg":"swg", // Swabian
	"yid":"yi", // Yiddisch
	"ukr":"uk", // Ukranian
}







window.translation_languages = {};

/*
// Add GMW West Germanic languages first
for(let gl = 0; gl < gmw_languages.length; gl++){
	let lang_code = gmw_languages[gl];
	if(typeof window.language_codes_lookup[lang_code] == 'string'){
		lang_code = window.language_codes_lookup[lang_code];
	}
	if(typeof window.translation_languages[lang_code] == 'undefined'){
		window.translation_languages[lang_code] = {};
	}
	for(let gl2 = 0; gl2 < gmw_languages.length; gl2++){
		let lang_code2 = gmw_languages[gl2];
		if(typeof window.language_codes_lookup[lang_code2] == 'string'){
			lang_code2 = window.language_codes_lookup[lang_code2];
		}
		if(lang_code == lang_code2){continue}
		window.translation_languages[ lang_code ][ lang_code2 ] = {
			'language':lang_code2,
			'runner':'transformers',
			//'model_base':'opus-mt',
			'model':'opus-mt-gmw-gmw'
		}
	}
}


console.log("window.translation_languages after adding west-germanic languages: ", keyz(window.translation_languages).length, window.translation_languages);
*/


for(let tl = 0; tl < translation_languages_raw.length; tl++){
	let translation_parts = translation_languages_raw[tl].split('-');
	//console.log("translation_parts: ", translation_parts);
	if(translation_parts.length == 2){
		if(typeof translation_parts[0] == 'string' && typeof translation_parts[1] == 'string'){
			if(typeof window.translation_languages[translation_parts[0]] == 'undefined'){
				//console.log("creating empty translation array for: ", translation_parts[0])
				window.translation_languages[translation_parts[0]] = {};
			}
			//console.log("adding translation output_language: ", translation_parts[0], " -+-> ", translation_parts[1])
			/*
			if(typeof window.translation_languages[ translation_parts[0] ][ translation_parts[1] ] == 'undefined'){
				window.translation_languages[ translation_parts[0] ][ translation_parts[1] ] = {
					'language':translation_parts[1],
					'runner':'transformers',
					//'model_base':'opus-mt',
					'model':'opus-mt-' + translation_languages_raw[tl]
				}
			}
			else{
				console.warn("window.translation_languages: skipping add a specialised translation model because it was already provided by the GMW model: ", translation_languages_raw[tl]);
			}
			*/
			
			// this overrides WGM with: en-af, af-en, en-nl
			if(translation_parts[0] == translation_parts[1]){
				continue
			}
			window.translation_languages[ translation_parts[0] ][ translation_parts[1] ] = {
				'language':translation_parts[1],
				'runner':'transformers',
				//'model_base':'Xenova/opus-mt', // model base isn't reallty used for anything
				'model':'Xenova/opus-mt-' + translation_languages_raw[tl]
			}
			
		}
	}
}

//console.log("window.translation_languages after adding specialized language models: ", keyz(window.translation_languages).length, window.translation_languages);

/*
for(let rl = 0; rl < window.romance_languages.length; rl++){
	let lang_code = window.romance_languages[rl];
	if(lang_code.indexOf('_') != -1){
		lang_code = lang_code.split('_')[1].toLowerCase();
	}
	if(typeof window.language_codes_lookup[lang_code] == 'string'){
		lang_code = window.language_codes_lookup[lang_code];
	}
	if(lang_code != 'en' && typeof window.translation_languages[lang_code] == 'undefined'){
		window.translation_languages[lang_code] = {"en":{
			'language':"en",
			'runner':'transformers',
			//'model_base':'opus-mt',
			'model':'opus-mt-ROMANCE-en'
		}};
	}
}


console.log("window.translation_languages after adding Romance languages: ", keyz(window.translation_languages).length, window.translation_languages);

*/

for(let rl = 0; rl < window.mul_en_languages.length; rl++){
	let lang_code = window.mul_en_languages[rl];
	
	if(lang_code.endsWith('Latn')){
		//console.log("adding translation language: mul_en:  spotted _Latn language, skipping: ", lang_code);
		continue
	}
	if(lang_code.indexOf('_') != -1){
		lang_code = lang_code.split('_')[1].toLowerCase();
	}
	
	if(typeof window.language_codes_lookup[lang_code] == 'string'){
		lang_code = window.language_codes_lookup[lang_code];
	}
	if(lang_code != 'en' && typeof window.translation_languages[lang_code] == 'undefined'){
		window.translation_languages[lang_code] = {"en":{
			'language':"en",
			'runner':'transformers',
			//'model_base':'opus-mt',
			'model':'Xenova/opus-mt-mul-en'
		}};
	}
}


//console.log("FINAL window.translation_languages after adding Mul-En languages: ", keyz(window.translation_languages).length, window.translation_languages);

for(let rl = 0; rl < window.en_mul_languages.length; rl++){
	let lang_code = window.en_mul_languages[rl];
	if(lang_code.endsWith('Latn')){
		//console.log("adding translation language: en-mul:  spotted _Latn language, skipping: ", lang_code);
		continue
	}
	if(typeof window.language_codes_lookup[lang_code] == 'string'){
		lang_code = window.language_codes_lookup[lang_code];
	}
	if(lang_code != 'en' && typeof window.translation_languages['en'][lang_code] == 'undefined'){
		window.translation_languages['en'][lang_code] = {
			'language':lang_code,
			'runner':'transformers',
			//'model_base':'opus-mt',
			'model':'Xenova/opus-mt-en-mul'
		};
	}
}



// Xenova/mbart-large-50-many-to-many-mmt
window.bart_languages = ['ar', 'cs', 'de', 'en', 'es', 'et', 'fi', 'fr', 'gu', 'hi', 'it', 'ja', 'kk', 'ko', 'lt', 'lv', 'my', 'ne', 'nl', 'ro', 'ru', 'si', 'tr', 'vi', 'zh'];

/*
const raw_bart_languages = 'ar_AR,cs_CZ,de_DE,en_XX,es_XX,et_EE,fi_FI,fr_XX,gu_IN,hi_IN,it_IT,ja_XX,kk_KZ,ko_KR,lt_LT,lv_LV,my_MM,ne_NP,nl_XX,ro_RO,ru_RU,si_LK,tr_TR,vi_VN,zh_CN'
let bart_lookup = {};
let raw_bart_array = raw_bart_languages.split(',');
for(let barti = 0; barti < raw_bart_array.length; barti++){
	let short_code = raw_bart_array[barti].split('_')[0];
	bart_lookup[short_code] = raw_bart_array[barti];
	window.bart_languages.push( short_code );
}

console.log("bart_lookup: ", bart_lookup);
console.log("bart_languages: ", bart_languages);
*/



for(let inputi = 0; inputi < window.bart_languages.length; inputi++){
	let lang_code = window.bart_languages[inputi];

	if(typeof window.translation_languages[lang_code] == 'undefined'){
		window.translation_languages[lang_code] = {};
	}
	
	for(let outputi = 0; outputi < window.bart_languages.length; outputi++){
		let output_code = window.bart_languages[outputi];
		if(typeof window.translation_languages[lang_code][output_code] == 'undefined' && lang_code != output_code){
			window.translation_languages[lang_code][output_code] = {
				'language':output_code,
				'runner':'transformers',
				//'model_base':'mbart-large-50',
				'model':'Xenova/mbart-large-50-many-to-many-mmt'
			};
		}
	}

}




// facebook/m2m100_418M

// ss = Swati
// ba = Bashkir
// ff = Fulah
// jap

window.m2m_languages = ['af', 'am', 'ar', 'ast', 'az', 'ba', 'be', 'bg', 'bn', 'br', 'bs', 'ca', 'ceb', 'cs', 'cy', 'da', 'de', 'el', 'en', 'es', 'et', 'fa', 'ff', 'fi', 'fr', 'fy', 'ga', 'gd', 'gl', 'gu', 'ha', 'he', 'hi', 'hr', 'ht', 'hu', 'hy', 'id', 'ig', 'ilo', 'is', 'it', 'ja', 'jv', 'ka', 'kk', 'km', 'kn', 'ko', 'lb', 'lg', 'ln', 'lo', 'lt', 'lv', 'mg', 'mk', 'ml', 'mn', 'mr', 'ms', 'my', 'ne', 'nl', 'no', 'ns', 'or', 'oc', 'pa', 'pl', 'ps', 'pt', 'ro', 'ru', 'sd', 'si', 'sk', 'sl', 'so', 'sq', 'sr', 'ss', 'su', 'sv', 'sw', 'ta', 'th', 'tl', 'tn', 'tr', 'uk', 'ur', 'uz', 'vi', 'wo', 'xh', 'yi', 'yo', 'zh', 'zu'];

//const raw_m2m_languages = 'Afrikaans (af), Amharic (am), Arabic (ar), Asturian (ast), Azerbaijani (az), Bashkir (ba), Belarusian (be), Bulgarian (bg), Bengali (bn), Breton (br), Bosnian (bs), Catalan; Valencian (ca), Cebuano (ceb), Czech (cs), Welsh (cy), Danish (da), German (de), Greeek (el), English (en), Spanish (es), Estonian (et), Persian (fa), Fulah (ff), Finnish (fi), French (fr), Western Frisian (fy), Irish (ga), Gaelic; Scottish Gaelic (gd), Galician (gl), Gujarati (gu), Hausa (ha), Hebrew (he), Hindi (hi), Croatian (hr), Haitian; Haitian Creole (ht), Hungarian (hu), Armenian (hy), Indonesian (id), Igbo (ig), Iloko (ilo), Icelandic (is), Italian (it), Japanese (ja), Javanese (jv), Georgian (ka), Kazakh (kk), Central Khmer (km), Kannada (kn), Korean (ko), Luxembourgish; Letzeburgesch (lb), Ganda (lg), Lingala (ln), Lao (lo), Lithuanian (lt), Latvian (lv), Malagasy (mg), Macedonian (mk), Malayalam (ml), Mongolian (mn), Marathi (mr), Malay (ms), Burmese (my), Nepali (ne), Dutch; Flemish (nl), Norwegian (no), Northern Sotho (ns), Occitan (post 1500) (oc), Oriya (or), Panjabi; Punjabi (pa), Polish (pl), Pushto; Pashto (ps), Portuguese (pt), Romanian; Moldavian; Moldovan (ro), Russian (ru), Sindhi (sd), Sinhala; Sinhalese (si), Slovak (sk), Slovenian (sl), Somali (so), Albanian (sq), Serbian (sr), Swati (ss), Sundanese (su), Swedish (sv), Swahili (sw), Tamil (ta), Thai (th), Tagalog (tl), Tswana (tn), Turkish (tr), Ukrainian (uk), Urdu (ur), Uzbek (uz), Vietnamese (vi), Wolof (wo), Xhosa (xh), Yiddish (yi), Yoruba (yo), Chinese (zh), Zulu (zu)'
//let raw_m2m_array = raw_m2m_languages.split('), ');
//for(let mimi = 0; mimi < raw_m2m_array.length; mimi++){
//	window.m2m_languages.push( raw_m2m_array[mimi].split('(')[1] ) 
//}

//console.log("window.m2m_languages: ", window.m2m_languages);


for(let inputi = 0; inputi < window.m2m_languages.length; inputi++){
	let lang_code = window.m2m_languages[inputi];
	if(lang_code == 'jap'){
		lang_code = 'jp';
	}
	if(typeof window.translation_languages[lang_code] == 'undefined'){
		window.translation_languages[lang_code] = {};
	}
		
	for(let outputi = 0; outputi < window.m2m_languages.length; outputi++){
		let output_code = window.m2m_languages[outputi];
		if(output_code == 'jap'){
			output_code = 'jp';
		}
		if(typeof window.translation_languages[lang_code][output_code] == 'undefined' && lang_code != output_code){
			window.translation_languages[lang_code][output_code] = {
				'language':output_code,
				'runner':'transformers',
				//'model_base':'m2m100',
				'model':'Xenova/m2m100_418M'
			};
		}
	}
	
}






//console.log("FINAL window.translation_languages after adding Mul-En languages: ", keyz(window.translation_languages).length, window.translation_languages);



//console.log("FINAL window.translation_languages: ", keyz(window.translation_languages).length, window.translation_languages);






window.last_user_activity_time = Date.now();

let start_time = Math.floor(Date.now()/1000);
//console.log("start_time: ", start_time);
let current_time = start_time;
let previous_time = start_time;
let start_time_delta = 0;
let intro_time = 0;

let busy_selecting_assistants = false;


window.assistant_switches_made_count = 0;
//window.assistants_loading_count = 0;
//window.assistants_loaded_count = 0;
window.intro_explanations_given = {};


let developer_input_hidden = false; // part of easter egg of talking to developer

// not really used outside the tts_worker?
window.voice_to_file_lookup = {
	'US female 1':'cmu_us_slt_arctic-wav-arctic_a0001',
	'US female 2':'cmu_us_clb_arctic-wav-arctic_a0001',
	'US male 1':'cmu_us_bdl_arctic-wav-arctic_a0003',
	'US male 2':'cmu_us_rms_arctic-wav-arctic_a0003',
	'Canadian male':'cmu_us_jmk_arctic-wav-arctic_a0002',
	'Scottish male':'cmu_us_awb_arctic-wav-arctic_b0002',
	'Indian male':'cmu_us_ksp_arctic-wav-arctic_a0007',
}



// SIDEBAR


// open-sidebar-button and close-sidebar-button are handled in playground's ui.js with open_sidebar() and close_siebar()

const sidebar_filter_input_el = document.getElementById('sidebar-filter-input');

// LEFT SIDEBAR FILE MANAGER TAB
const download_all_files_button_el = document.getElementById('download-all-files-button');

const sidebar_rag_select_all_button_el = document.getElementById('sidebar-rag-select-all-button');
const sidebar_rag_close_button_el = document.getElementById('sidebar-rag-close-button');
//const toggle_rag_search_button_el = document.getElementById('toggle-rag-search-button');
window.rag_search_prompt_el = document.getElementById('rag-search-prompt');

const start_rag_search_button_el = document.getElementById('start-rag-search-button');
const rag_info_container_el = document.getElementById('rag-info-container');
const file_manager_files_list_el = document.getElementById('file-manager-files-list');

const upload_file_input_el = document.getElementById('upload-file-input');

const file_upload_progress_container_el = document.getElementById('file-upload-progress-container');


// ASSISTANTS SIDEBAR
const contacts_list_el = document.getElementById('contacts-list');
const select_assistants_hint_container_el = document.getElementById('add-assistants-hint-container');
const add_custom_assistant_button_el = document.getElementById('add-custom-assistant-button');
const select_assistants_button_el = document.getElementById('select-assistants-button');


// SETTINGS SIDEBAR

const running_tasks_list_el = document.getElementById('running-tasks-list-container');
const simple_tasks_list_el = document.getElementById('simple-tasks-list-container');
const setting_language_dropdown_el = document.getElementById('settings-tab-language-dropdown');
const setting_brightness_dropdown_el = document.getElementById('settings-brightness-select');
const speaker_voice_select_el = document.getElementById('speaker-voice-select');
const interrupt_speaking_select_el = document.getElementById('interrupt-speaking-select');


const show_models_list_button_el = document.getElementById('show-models-list-button');
const total_disk_space_used_el = document.getElementById('total-disk-space-used');


const clear_site_cache_button_el = document.querySelector("#clear-site-cache-button");
const clear_local_storage_button_el = document.querySelector("#clear-local-storage-button");
//const clear_cache_button_el = document.querySelector("#clear-cache-button");
const clear_data_button_el = document.querySelector("#clear-data-button");
const clear_everything_button_el = document.querySelector("#clear-everything-button");

// TASKS SIDEBAR
const used_memory_el = document.getElementById('used-memory');




// CHAT

// CHAT  HEADER
const back_button_container_el = document.getElementById('back-button-container');
const chat_header_icon_container_el = document.getElementById('chat-header-icon-container');
const chat_header_icon_el = document.getElementById('chat-header-icon');
const chat_header_emoji_icon_container_el = document.getElementById('chat-header-emoji-icon-container');

const chat_header_name_el = document.getElementById('chat-header-name');
const shrink_assistant_button_el = document.getElementById('shrink-assistant-button');
const mobile_back_to_document_button_el = document.getElementById('mobile-back-to-document-button');


const stop_assistant_icon_button_el = document.getElementById('stop-assistant-button-assistant-icon-container');
const stop_assistant_button_el = document.getElementById('stop-assistant-button');
const stop_assistant_button_assistant_icon_el = document.getElementById('stop-assistant-button-assistant-icon');
const clear_assistant_button_el = document.getElementById('clear-assistant-button');

// CHAT CONTENT
const chat_content_el = document.getElementById('chat-content');
const message_downloads_container_el = document.getElementById('message-downloads-container');
const message_container_el = document.getElementById('message-content-container');

// CHAT MODEL INFO
const model_info_container_el = document.getElementById('model-info-container');
const model_info_close_button_el = document.getElementById('model-info-close-button');


// CHAT FOOTER

const musicgen_duration_slider_el = document.getElementById('musicgen-duration-slider');
const musicgen_duration_output_el = document.getElementById('musicgen-duration-output');

const speaker_voice_buttons_background_ball_pusher = document.getElementById('speaker-voice-buttons-background-ball-pusher');

const settings_complexity_select_el = document.getElementById('settings-complexity-select');

const message_form_container_el = document.getElementById('message-form-container');
const message_form_resize_handle_el = document.getElementById('message-form-resize-handle');

const microphone_icon_el = document.getElementById("microphone-icon");
const microphone_meta_hint_el = document.getElementById('microphone-meta-hint');
const microphone_tasks_counter_container_el = document.getElementById('microphone-tasks-counter-container');
const speaker_icon_el = document.getElementById("speaker-icon");
const speaker_tasks_counter_container_el = document.getElementById('speaker-tasks-counter-container');

const chat_prompt_textarea_eraser_el = document.querySelector("#chat-prompt-textarea-eraser");
const textareaPrompt = document.querySelector("textarea#prompt"); // double
const prompt_el = document.getElementById('prompt');
const negative_prompt_el = document.getElementById('negative-prompt');
const document_chat_upload_input_el = document.querySelector("#document-chat-upload-input");
const submit_prompt_button_el = document.querySelector("#submit-prompt-button");
const submit_prompt_at_line_button_el = document.querySelector("#submit-prompt-at-line-button");
//const submit_question_button_el = document.querySelector("#submit-question-button");

const question_prompt_document_title_el = document.querySelector("#question-prompt-document-title");
const question_prompt_textarea_el = document.querySelector("#question-prompt-textarea");
const question_prompt_clear_button_el = document.querySelector("#question-prompt-clear-button");

const prompt_adjustments_el = document.getElementById('prompt-adjustments');






// TOOLS

const tools_el = document.getElementById('tools');
const close_tools_button_el = document.getElementById('close-tools-button');



// PROMPT AT LINE
const prompt_at_line_dialog_el = document.getElementById('prompt-at-line-dialog');
const prompt_at_line_submit_button_el = document.getElementById('prompt-at-line-submit-button');
window.prompt_at_line_input_el = document.getElementById('prompt-at-line-input');


// PROOFREAD
const proofread_details_el = document.getElementById('proofread-details');
window.proofread_prompt_el = document.getElementById('proofread-prompt');
window.proofread_dialog_content_toggles_container_el = document.getElementById('proofread-dialog-content-toggles-container');
window.proofread_dialog_content_tags_container_el = document.getElementById('proofread-dialog-content-tags-container');
const proofread_auto_detect_language_input_el = document.getElementById("proofread-auto-detect-language-input");
const proofread_auto_detected_language_el = document.getElementById('proofread-auto-detected-language');
//const dialog_proofread_submit_prompt_button_el = document.getElementById('dialog-proofread-submit-prompt-button');



// REWRITE DIALOGS
const rewrite_results_dialog_el = document.getElementById('rewrite-results-dialog');
const close_rewrite_dialog_button_el = document.getElementById('close-rewrite-dialog-button');

// SUMMARIZE
const summarize_details_el = document.getElementById('summarize-details');
window.summarize_prompt_el = document.getElementById('summarize-prompt');
window.summarize_dialog_content_toggles_container_el = document.getElementById('summarize-dialog-content-toggles-container');
window.summarize_dialog_content_tags_container_el = document.getElementById('summarize-dialog-content-tags-container');



const summarize_new_file_name_input_el = document.getElementById("summarize-new-file-name-input");
const summarize_save_as_new_file_button_el = document.getElementById("summarize-save-as-new-file-button");
const summarize_new_file_container_close_button_el = document.getElementById("summarize-new-file-container-close-button");


// REWRITE
const rewrite_details_el = document.getElementById('rewrite-details');
const rewrite_dialog_el = document.getElementById("rewrite-dialog");
const rewrite_dialog_selected_text_el = document.getElementById("rewrite-dialog-selected-text");
window.rewrite_dialog_selected_text_el = rewrite_dialog_selected_text_el;
window.rewrite_prompt_el = document.getElementById('rewrite-prompt');
//const rewrite_results_container_el = document.getElementById('rewrite-results-dialog-creations-container');
const rewrite_results_dialog_content_container_el = document.getElementById('rewrite-results-dialog-content-container');



//const rewrite_results_dialog_original_text_el = document.getElementById('rewrite-results-dialog-original-text');
window.rewrite_dialog_content_toggles_container_el = document.getElementById('rewrite-dialog-content-toggles-container');
window.rewrite_dialog_content_tags_container_el = document.getElementById('rewrite-dialog-content-tags-container');
const rewrite_status_progress_container_el = document.getElementById('rewrite-status-progress-container'); // not reallt used anymore?
const rewrite_status_progress_el = document.getElementById('rewrite-status-progress');


// TRANSLATION
const translation_details_el = document.getElementById('translation-details');
const translation_input_language_select_el = document.getElementById("translation-input-language-select");
const translation_output_language_select_el = document.getElementById("translation-output-language-select");
const translation_auto_detect_language_input_el = document.getElementById("translation-auto-detect-language-input");
const translation_flip_languages_button_el = document.getElementById("translation-flip-languages-button");
const live_translation_output_container_el = document.getElementById("live-translation-output-container");
const translation_auto_detected_language_el = document.getElementById('translation-auto-detected-language');


const translation_new_file_name_input_el = document.getElementById("translation-new-file-name-input");
const translation_save_as_new_file_button_el = document.getElementById("translation-save-as-new-file-button");
const translation_new_file_container_close_button_el = document.getElementById("translation-new-file-container-close-button");


//const load_text_ai_hint_el = document.getElementById("load-text-ai-hint");
const load_a_text_based_ai_button_el = document.getElementById("load-a-text-based-ai-button");

const tools_submit_form_container_el = document.getElementById('tools-submit-form-container');



// CAMERA

const start_ocr_button_el = document.getElementById("start-ocr-button");
const stop_camera_button_el = document.getElementById("stop-camera-button");

const camera_container_el = document.getElementById("camera-container");
const video_el = document.getElementById("camera-video");
//const camera_video_flasher_el = document.getElementById("camera-video-flasher");


const video_canvas_el = document.getElementById("video-canvas");
const video_context = video_canvas_el.getContext('2d', { willReadFrequently: true });

const camera_overlay_canvas_el = document.getElementById("camera-overlay-canvas");
const camera_overlay_context = camera_overlay_canvas_el.getContext('2d', { willReadFrequently: false });
const camera_overlay_svg_container_el = document.getElementById("camera-overlay-svg-container");
const camera_overlay_scan_hint_container_el = document.getElementById("camera-overlay-scan-hint-container");


// OCR

const camera_do_ocr_summary_button_el = document.getElementById("camera-do-ocr-summary-button");
const camera_do_ocr_details_el = document.getElementById("camera-do-ocr-details");

const scan_hands_free_hint_el = document.getElementById('live-ocr-scans-say-scan-hint');
const live_ocr_scans_container_el = document.getElementById("live-ocr-scans-container");
const live_ocr_output_el = document.getElementById("live-ocr-output");

const camera_ocr_scan_button_el = document.getElementById("camera-ocr-scan-button");
const camera_ocr_improve_button_el = document.getElementById("camera-ocr-improve-button");
const camera_ocr_scan_progress_el = document.getElementById("camera-ocr-scan-progress");

const camera_ocr_insert_button_el = document.getElementById('camera-ocr-insert-button');
const camera_ocr_new_document_button_el = document.getElementById("camera-ocr-new-document-button");
const doing_ocr_scan_counter_el = document.getElementById("doing-ocr-scan-counter");

const camera_ocr_scan_intensity_input_el = document.getElementById('camera-ocr-scan-intensity-input');
const camera_ocr_auto_scan_input_el = document.getElementById("camera-ocr-auto-scan-input");
const camera_ocr_save_auto_scan_input_el = document.getElementById("camera-ocr-save-scan-input");


// IMAGE TO TEXT

const camera_image_to_text_summary_button_el = document.getElementById("camera-image_to_text-summary-button");
const camera_image_to_text_details_el = document.getElementById("camera-image-to-text-details");
const live_image_to_text_scans_container_el = document.getElementById("live-image_to_text-scans-container");

const live_image_to_text_thumbnail_container = document.getElementById('live-image_to_text-thumbnail-container');
window.live_image_to_text_prompt_el = document.getElementById("live-image_to_text-prompt");
const live_image_to_text_output_el = document.getElementById("live-image_to_text-output");

//const camera_image_to_text_scan_button_el = document.getElementById("camera-image_to_text-scan-button");
const camera_image_to_text_describe_button_el = document.getElementById("camera-image_to_text-describe-button");
//const camera_image_to_text_improve_button_el = document.getElementById("camera-image_to_text-improve-button");
const camera_image_to_text_scan_progress_el = document.getElementById("camera-image_to_text-scan-progress");

const camera_image_to_text_insert_button_el = document.getElementById('camera-image_to_text-insert-button');
const camera_image_to_text_new_document_button_el = document.getElementById("camera-image_to_text-new-document-button");
//const doing_image_to_text_scan_counter_el = document.getElementById("doing-image_to_text-scan-counter");

const camera_image_to_text_auto_scan_input_el = document.getElementById("camera-image_to_text-auto-scan-input");
const camera_image_to_text_save_auto_scan_input_el = document.getElementById("camera-image_to_text-save-auto-scan-input");

const image_to_text_prompt_image_el = document.getElementById("image-to-text-prompt-image");
const image_to_text_prompt_camera_button_el = document.getElementById("image-to-text-prompt-settings-take-camera-picture-button");
const image_to_text_upload_input_el = document.getElementById("image-to-text-upload-input");



// CAMERA LIVE TRANSLATION
const live_translation_output_el = document.getElementById("live-translation-output");
const live_translation_insert_button_el = document.getElementById('live-translation-insert-button');
const live_translation_new_document_button_el = document.getElementById("live-translation-new-document-button");



// TUTORIAL
const tutorial_el = document.getElementById("tutorial");
const recently_opened_documents_list_el = document.getElementById("recently-opened-documents-list");
/*
const chat_functionalities_list_el = document.getElementById("chat-functionalities-list");
const document_functionalities_list_el = document.getElementById("document-functionalities-list");
const media_functionalities_list_el = document.getElementById("chat-functionalities-list");
const camera_functionalities_list_el = document.getElementById("document-functionalities-list");
*/



// DOCUMENT

// DOCUMENT HEADER

const header_el = document.getElementById('header');

const rewrite_results_ready_container_el = document.getElementById('rewrite-results-ready-container');
const rewrite_results_ready_counter_el = document.getElementById('rewrite-results-ready-counter');
const current_folder_el = document.getElementById('current-folder');
const current_file_name_el = document.getElementById('current-file-name');

// DOCUMENT BAR

const editor_bar_el = document.getElementById('editor-bar'); 
const bar_toggle_bold_el = document.getElementById('bar-toggle-bold'); 
const bar_toggle_italic_el = document.getElementById('bar-toggle-italic'); 




// DOCUMENT EDITOR & PLAYGROUND OVERLAY
const editor_el = document.getElementById('editor'); 
const playground_overlay_el = document.getElementById('playground-overlay'); 

const close_full_playground_el = document.getElementById('close-full-playground'); 



// DOCUMENTS CODE OUTPUT RIGHT SIDEBAR
const output_el = document.getElementById('output'); // a.k.a. codeOutput in editor.js
const code_output_close_button_el = document.getElementById('code-output-close-button');


// DOC SELECTION HINT
const doc_selection_hint_el = document.getElementById('doc-selection-hint');
const doc_selection_hint_quick_actions_el = document.getElementById('doc-selection-hint-quick-actions');
const proofread_selection_button_el = document.getElementById('proofread-selection-button');
const rewrite_selection_button_el = document.getElementById('rewrite-selection-button');
const summarize_selection_button_el = document.getElementById('summarize-selection-button');
const translate_selection_button_el = document.getElementById('translate-selection-button');
const question_selection_button_el = document.getElementById('question-selection-button');
const speak_selection_button_el = document.getElementById('speak-selection-button');

// DOCUMENT FOOTER
const document_form_container_el = document.getElementById('document-form-container');
const document_form_notifications_container_el = document.getElementById('document-form-notifications-container');
const document_translation_progress_container_el = document.getElementById('document-translation-progress-container');

const document_search_button_el = document.getElementById('document-search-button');
const document_question_button_el = document.getElementById('document-question-button');
const document_proofread_button_el = document.getElementById('document-proofread-button');
const document_continue_button_el = document.getElementById('document-continue-button');
const document_summarize_button_el = document.getElementById('document-summarize-button');
const document_translate_button_el = document.getElementById('document-translate-button');
const undo_button_el = document.getElementById('undo-document-button');
const redo_button_el = document.getElementById('redo-document-button');

const line_bookmark_button_el = document.getElementById('line-bookmark-button');

const save_document_button_el = document.getElementById('save-document-button');

const download_document_button_el = document.getElementById('download-document-button');


// NEW CUSTOM AI
const new_custom_ai_dialog_el = document.getElementById('new-custom-ai-dialog');
const add_custom_ai_next_button_el = document.getElementById('add-custom-ai-next-button');
//const add_custom_ai_save_button_el = document.getElementById('add-custom-ai-save-button');



// SHARE PROMPT LINK
const share_prompt_dialog_el = document.getElementById('share-prompt-dialog');

const share_prompt_assistant_emoji_el = document.getElementById('share-prompt-assistant-emoji');
const share_prompt_assistant_name_icon_el = document.getElementById('share-prompt-assistant-name-icon');
const share_prompt_assistant_name_el = document.getElementById('share-prompt-assistant-custom_name');
const share_prompt_input_el = document.getElementById('share-prompt-input');
const share_prompt_model_download_url_el = document.getElementById('share-prompt-model-download_url');
const share_prompt_model_config_url_el = document.getElementById('share-prompt-model-config_url');
const share_prompt_model_role_name_el = document.getElementById('share-prompt-model-role_name');
const share_prompt_model_system_prompt_el = document.getElementById('share-prompt-model-system_prompt');
const share_prompt_model_second_prompt_el = document.getElementById('share-prompt-model-second_prompt');
const share_prompt_link_el = document.getElementById('share-prompt-link');
const share_prompt_show_more_options_button_el = document.getElementById('share-prompt-show-more-options-button');
const share_prompt_dialog_done_button_el = document.getElementById('share-prompt-dialog-done-button');

const run_the_received_prompt_button_el = document.getElementById('run-the-received-prompt-button');





const emoji_picker_dialog_el = document.getElementById('emoji-picker-dialog');
const emoji_picker_container_el = document.getElementById('emoji-picker-container');


// More characters dialog
const more_characters_dialog_el = document.getElementById('more-characters-dialog');
//const more_characters_dialog_new_ai_button_el = document.getElementById('more-characters-dialog-new-button');
const more_characters_dialog_content_container_el = document.getElementById('more-characters-dialog-content-container');


// Blueprint list and fields
const more_blueprints_dialog_el = document.getElementById('more-blueprints-dialog');
const blueprint_fields_dialog_el = document.getElementById('blueprint-fields-dialog');
const blueprint_fields_dialog_content_container_el = document.getElementById('blueprint-fields-dialog-content-container');


// DEVELOPER
const task_overview_el = document.getElementById('task-overview');
const task_overview_update_toggle_button_el = document.getElementById('task-overview-update-toggle-button');


// Web LLM
const chatui_select_el = document.getElementById("chatui-select");







const UNLOADED = 'unloaded' // whisper not loaded
const LISTENING = 'listening'
const RECORDING = 'recording'
const DOING_STT = 'stt'
const DOING_ASSISTANT = 'assistant'
const DOING_TTS = 'tts'




window.state = UNLOADED;

window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
    //console.error("\nYIKES\nAn error occured: ", errorMsg, "\nYIKES AT:", url, lineNumber);//or any message
	if(url.endsWith('llama-mt/main.js') && errorMsg.indexOf('Uncaught') != -1){
		console.error("It seems the AI model crashed");
		document.body.classList.remove('waiting-for-response');
		document.body.classList.remove('working-on-doc');
		document.body.classList.remove('doing-assistant');
		window.stop_assistant();
		add_chat_message(window.settings.assistant,'developer','it_seems_the_AI_has_crashed#setting---');
		if(window.state == DOING_ASSISTANT){
			window.set_state(LISTENING);
		}
	}
    return false;
}


setTimeout(() => {
	if(window.settings.tutorial.add_assistants_hint_shown == false){
		select_assistants_hint_container_el.style.display = 'flex';
	}
},1200000)


// Create list of functionalities in tutorial pane
generate_functionalities_list();






var double_click_timer = null;
var last_clicked_cm_line = null;

editor_el.addEventListener('click', (event) => {
	//console.log("clicked on editor");
	if(event.target.classList.contains('cm-line') || event.target.parentNode.classList.contains('cm-line')){
		touchStart(event.target);
	}
	
	if(document.body.classList.contains('chat-shrink') && window.innerWidth < 981){
		close_sidebar();
	}
	
	if(event.target.type == 'button' && event.target.name == 'close'){
		//console.log("clicked on a close button");
		document.body.classList.remove('showing-text-search');
	}
	
	
	
	
});
/*
editor_el.addEventListener('touchend', (event) => {
	//console.log("touchend on editor. time: ", Date.now());
	touchStart();
});
*/

function touchStart(element) {
	//console.log("in touchStart. element: ", element);
	try{
	    if (double_click_timer == null) {
			last_clicked_cm_line = element;
	        double_click_timer = setTimeout(function () {
	            double_click_timer = null;
				last_clicked_cm_line = null
	        }, 500)
	    } else {
	        clearTimeout(double_click_timer);
	        double_click_timer = null;
		
			// double click
			console.warn("touchStart: double click detected");
			
			if(last_clicked_cm_line == null){
				console.error("touchStart: unexpectedly last_clicked_cm_line was null");
				return;
			}
			
			var editor_selection_range = document.createRange();
		
			if(element.isSameNode(last_clicked_cm_line)){
				//console.log("double click was on a single cm line");
				
				if(element.classList.contains('ͼ6') && element.classList.contains('ͼc') && typeof element.textContent == 'string' && element.textContent != '' && is_valid_url(element.textContent)){
					//console.log("touchStart: download clicked on a link");
					window.open(element.textContent, '_blank');
				}
				else{
					editor_selection_range.selectNodeContents(element);
					
					let sel = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(editor_selection_range);
		
					last_clicked_cm_line = null;
				}
				
				
			}
			else{
				// Start at the `hello` element.
				
				if(typeof element.textContent != 'undefined' && typeof last_clicked_cm_line.textContent != 'undefined'){
					let first_cm_line_text = last_clicked_cm_line.textContent;
					//console.log("first_cm_line_text ", first_cm_line_text);
					
					// End in the `world` node
					let second_cm_line_text = element.textContent;
					//console.log(" cm_line_text: ",  second_cm_line_text);
		
					if(first_cm_line_text == '' && second_cm_line_text == ''){
						//console.error("cannot create mouse selection, both start and end element of double click had no textContent");
					}
					else{
						editor_selection_range.setStart(last_clicked_cm_line, 0);
						editor_selection_range.setEnd(element, second_cm_line_text.length - 1);
						
						let sel = window.getSelection();
						sel.removeAllRanges();
						sel.addRange(editor_selection_range);
		
						
					}
				
				}
				
			}
		
			last_clicked_cm_line = null;
			

	    }
	}
    catch(err){
    	console.error("touchStart: caught error checking for double click: ", err);
		last_clicked_cm_line = null;
    }
}








//
// SET STATE
//
// This is mostly for handling audio
function set_state(new_state){
	//console.log("in set_state. new_state: ", new_state);
	if(new_state != window.state){
		//console.log("\n.\n..\n...\nNEW STATE: ");
		//console.log(window.state, ' ==> ', new_state);
	}
	window.state = new_state;
	
	if(new_state == LISTENING && window.microphone_enabled == false){
		//console.log("set_state: changing new state from LISTENING to UNLOADED");
		new_state = UNLOADED;
	}
	else if(new_state == UNLOADED && window.microphone_enabled == true){
		//console.log("set_state: changing new state from UNLOADED to LISTENING");
		new_state = LISTENING;
	}
	if(new_state == DOING_STT && window.settings.assistant == 'scribe'){
		new_state == LISTENING
	}
	
	//console.log("set_state:  new_state after wrangling: ", new_state);
	
	if(new_state == UNLOADED){
		//window.sentences_parsed = [];
		//window.tts_queue = [];
		//document.body.classList.remove('state-recording');
		document.body.classList.remove('state-listening');
		
	}
	else if(new_state == LISTENING){
		//window.sentences_parsed = [];
		//window.tts_queue = [];
		//document.body.classList.remove('state-recording');
		document.body.classList.add('state-listening');
		
	  	if(window.myvad){
			//console.log("set_state: re-enabling VAD");
	  		window.myvad.start();
	  	}
	}
	else if(new_state == RECORDING){
		if(window.stt_warmup_complete){
			document.body.classList.add('state-recording');
		}
		
	}
	else if(new_state == DOING_STT){
		
		if(window.stt_warmup_complete){
			window.stt_heard = '#STT_in_progress';
			//document.body.classList.add('doing-stt');
			document.body.classList.remove('state-listening');
			//document.body.classList.remove('state-recording');
		}
		else{
			//console.log("setting window.stt_warmup_complete to true");
			window.stt_warmup_complete = true;
		}
		
	}
	else if(new_state == DOING_ASSISTANT){
		document.body.classList.add('doing-assistant');
	} 
}
window.set_state = set_state;

//const synth = window.speechSynthesis;

const audio_el = document.getElementById('audio');
const audio_source_el = document.getElementById('source');




function keyz(object){
	return Object.keys(object);
}

// TUTORIAL

let intro_waiting_for_user = false;
let intro_user_made_first_query = false;
let intro_user_got_first_response = false;
let intro_step = 1; // intro now always plays, as the chat with the developer also acts as a quasi-settings page
let tutorial_step = localStorage.getItem("tutorial_step");
if(tutorial_step == null){
	//console.log("should play intro");
	intro_step = 1;
	tutorial_step = 1;
}
else{
	//console.log("not playing intro");
	document.body.classList.remove('intro');
}

function set_tutorial_step(step=0){
	//console.log("in set_tutorial_step. step: ", step);
	if(step == null){
		console.error("set_tutorial_step: desired step was null");
		return
	}
	if(step >= tutorial_step){
		tutorial_step = step;
		localStorage.setItem("tutorial_step", tutorial_step);
	}
	else{
		console.warn("set_tutorial_step: desired step was smaller than current step: ", tutorial_step, " -> ", step);
	}
	
	if(tutorial_step > 1){
		document.body.classList.remove('intro');
		document.body.classList.remove('hide-chat-form');
	}
	if(tutorial_step > 2){
		document.body.classList.add('show-sub-menu');
	}
}

// Let the UI reflect the current step in the tutorial process
set_tutorial_step(tutorial_step);





// S E T T I N G S

// RESTORE AND ACT ON INITIAL SETTINGS

if(window.settings.docs.open != null){
	//console.log("adding css to show document");
	document.body.classList.add('show-document');
	document.body.classList.add('document-active');
	window.active_destination = 'document';
	window.active_section = 'document';
	/*
	setTimeout(() => {
		if(editor){
			editor.focus();
		}
	},5000);
	*/
}

if(window.settings.left_sidebar_open == true){
	window.active_section = 'sidebar';
}

if(window.settings.left_sidebar == 'docs'){
	//console.log("the sidebar is initially showing the file browser");
	document.body.classList.remove('sidebar-chat');
}
else if(window.settings.left_sidebar == 'settings'){
	//console.log("the sidebar is initially showing the settings tab");
	document.body.classList.remove('sidebar-chat');
	document.body.classList.add('sidebar-settings');
}
else{
	//console.log("the sidebar is initially showing the assistants tab");
}


if(window.settings.left_sidebar_open == true){
	document.body.classList.add('sidebar');
}
else{
	document.body.classList.remove('sidebar');
}


if(window.settings.chat_shrink == true){
	document.body.classList.add('chat-shrink');
}
else{
	document.body.classList.remove('chat-shrink');
}



if(window.settings.left_sidebar_settings_tab == 'tasks'){ // && window.settings.settings_complexity != 'normal'){
	document.body.classList.add('sidebar-settings-show-tasks');
}


if(typeof window.settings.interrupt_speaking == 'string'){ // && window.settings.settings_complexity != 'normal'){
	if(window.settings.interrupt_speaking == 'Yes' || window.settings.interrupt_speaking == 'Auto'){
		document.body.classList.add('interrupt-speaking-allowed');
	}
	interrupt_speaking_select_el.value = window.settings.interrupt_speaking;
}




if(typeof window.settings.rewrite_prompt == 'string' && window.settings.rewrite_prompt != ''){
	window.rewrite_prompt_el.value = window.settings.rewrite_prompt;
}
if(window.settings.summarize_prompt != null && window.settings.summarize_prompt != ''){
	window.summarize_prompt_el.value = window.settings.summarize_prompt;
}
if(window.settings.rag_search_prompt != null && window.settings.rag_search_prompt != ''){
	window.rag_search_prompt_el.value = window.settings.rag_search_prompt;
}

if(window.settings.image_to_text_prompt == ''){
	window.settings.image_to_text_prompt = get_translation('Describe_the_image');
	//save_settings();
}
if(typeof window.settings.image_to_text_prompt == 'string' && window.settings.image_to_text_prompt != ''){
	window.live_image_to_text_prompt_el.textContent = window.settings.image_to_text_prompt;
}


if(window.settings.prompt_at_line != null && window.settings.prompt_at_line != ''){
	window.prompt_at_line_input_el.textContent = window.settings.prompt_at_line;
}

if(typeof window.settings.auto_detect_input_language == 'boolean'){
	translation_auto_detect_language_input_el.checked = window.settings.auto_detect_input_language;
}
if(typeof window.settings.auto_detect_proofread_input_language == 'boolean'){
	proofread_auto_detect_language_input_el.checked = window.settings.auto_detect_proofread_input_language;
}

if(typeof window.settings.ocr_scan_intensity == 'number' && window.settings.ocr_scan_intensity > 0 && window.settings.ocr_scan_intensity < 6 && camera_ocr_scan_intensity_input_el != null){
	camera_ocr_scan_intensity_input_el.value = window.settings.ocr_scan_intensity;
}

if(typeof window.settings.save_ocr_scan == 'boolean' && camera_ocr_save_auto_scan_input_el){
	camera_ocr_save_auto_scan_input_el.checked = window.settings.save_ocr_scan;
}

update_brightness(window.settings.brightness);









function update_settings_complexity(complexity){
	//console.log("in update_settings_complexity");
	settings_complexity_select_el.value = complexity;
	if(complexity != window.settings.settings_complexity){
		//console.log("saving settings complexity preference in settings");
		window.settings.settings_complexity = complexity;
		save_settings();
	}
	
	if(complexity == 'normal'){
		document.body.classList.remove('settings-complexity-advanced');
		document.body.classList.remove('developer');
		window.settings.maximum_recent_files = 5;
		save_settings();
	}
	else if(complexity == 'advanced'){
		document.body.classList.add('settings-complexity-advanced');
		document.body.classList.remove('developer');
		window.settings.maximum_recent_files = 8;
		save_settings();
	}
	else if(complexity == 'developer'){
		document.body.classList.add('settings-complexity-advanced');
		document.body.classList.add('developer');
		window.settings.maximum_recent_files = 7;
		save_settings();
	}
	if(typeof generate_ui != 'undefined'){
		generate_ui();
	}
	
}

update_settings_complexity(window.settings.settings_complexity);


window.audio_supported = true;

if (!window.Worker) {
	window.audio_supported = false;
	console.error("ERROR, this browser does not support webworkers!");
}


window.onload = init;
function init() {
	//console.log("in init (everything loaded, in theory)");
	if(typeof window.settings.language == 'undefined'){
		set_language('en');
	}
	else{
		set_language(window.settings.language);
	}
	//console.log("window.location.href: ", window.location.href);
	
	if(typeof window.settings.voice == 'string'){
		move_speaker_voice_button_background(window.settings.voice);
	}
	
    if(window.location.href.indexOf('debug') != -1 || window.location.search.indexOf('debug') != -1){
		//console.log("window.location.search: ", window.location.search);
		document.body.classList.add('developer');
    }
	
	// AUDIO SUPPORT?
	if (!window.AudioContext) {
		if (!window.webkitAudioContext) {
			console.warn("Your browser does not support any AudioContext and cannot play back audio."); // but perhaps browser-TTS is still possible?
			document.body.classList.add("no-audio");
			window.audio_supported = false;
			//return;
		}
		else{
			window.AudioContext = window.webkitAudioContext;
		}
	}
	
	
	check_cache()
	.then((value) => {
		console.log("CHECK CACHE DONE");
		if(typeof really_generate_ui != 'undefined'){
			really_generate_ui();
		}
		
		
		if(typeof url_parameter_ai == 'string'){ //  && typeof url_parameter_prompt == 'string'
			parse_ai_from_url();
		}
		
		if(window.settings.assistant == 'developer'){
			window.switch_assistant(window.first_assistant,true); // true: called from an automated process, and not a user interaction
		}
		else{
			window.switch_assistant(window.settings.assistant,true); 
		}
		
		
		//generate_ui();
		
		setTimeout(() => {
			doc_settled()
			.then((value) => {
				//console.log("init: doc_settled tested for language and resolved: ", value);
				document.body.classList.remove('unknown-language');
			})
			.catch((err) => {
				// detecting language of text in document failed
				//console.log("init: doc_settled tested for language and rejected: ", err);
				//document.body.add('unknown-language');
			})

		},5000);
	})
	.catch((err) => {
		console.error("CHECK CACHE FAILED: ", err);
		if(window.settings.assistant == 'developer'){
			window.switch_assistant(window.first_assistant,true); // true: called from an automated process, and not a user interaction
		}
		else{
			window.switch_assistant(window.settings.assistant,true); 
		}
		//window.switch_assistant(window.settings.assistant, true);
		//generate_ui();
	})
	
	
	
	window.manage_prompt();
	
 	
}


function parse_ai_from_url(){
	//console.log("in parse_ai_from_url. url_parameter_ai: ", url_parameter_ai);
	//console.log("parse_ai_from_url: received_url_parameters: ", received_url_parameters);
	//console.log("parse_ai_from_url: window.url_parameters: ", window.url_parameters);
	
	
	const received_url_keys = keyz(received_url_parameters);
	
	if(received_url_keys.length == 1 && received_url_keys.indexOf('ai') != -1 && received_url_parameters['ai'].indexOf('.gguf') == -1 && !received_url_parameters['ai'].startsWith('custom') && typeof window.assistants[received_url_parameters['ai']] != 'undefined'){
		//console.log("The received URL only has an assistant ID");
		switch_assistant(received_url_parameters['ai']);
		return
	}
	
	
	if(received_url_keys.length == 2 && received_url_keys.indexOf('ai') != -1 && received_url_keys.indexOf('prompt') != -1 && received_url_parameters['ai'].indexOf('.gguf') == -1 && typeof window.assistants[received_url_parameters['ai']] != 'undefined'){
		//console.log("The received URL was a very basic one, for a built-in AI. We only have to show the dialog to validate the prompt");
		show_received_prompt();
		return
	}
	
	let new_ai_settings = {};
	
	
	// If it's using a default AI
	if(typeof window.assistants[url_parameter_ai] != 'undefined'){
		new_ai_settings = JSON.parse(JSON.stringify(window.assistants[url_parameter_ai]));
		if(typeof window.settings.assistants[url_parameter_ai] != 'undefined'){
			//console.log("parse_ai_from_url: applying existing custom settings over base settings from assistants dict");
			new_ai_settings = {...new_ai_settings,...window.settings.assistants[url_parameter_ai]};
		}
	}
	console.log("parse_ai_from_url: initial new_ai_settings: ", new_ai_settings);
	
	for (let [key, value] of Object.entries(received_url_parameters)) {
		console.log("___parse_ai_from_url: KEY VALUE:\n", key, typeof value, value);
		if(value == null){
			console.warn("parse_ai_from_url: skipping key that had null as value: ", key);
			continue
		}
		if( ['ai','prompt','custom_name','custom_description','emoji','emoji_bg','download_url','config_url','context','temperature','system_prompt','second_prompt','cache_type_k','chatter','model_type','size','markdown_supported','brevity_supported','license','add_timestamps','privacy_level','voice_gender'].indexOf(key) == -1){
			console.error("invalid parameter in provided URL: ", key);
			continue
		}
		
		if(key == 'prompt'){
			console.log("A prompt was also provided: ", value);
			console.log("Should be the same as: ", window.received_prompt);
		}
		
		if(key == 'ai'){
			if(url_parameter_ai.toLowerCase().indexOf('.gguf') != -1){
				if(!url_parameter_ai.startsWith('http') && !url_parameter_ai.startsWith('/')){
					url_parameter_ai = 'https://www.huggingface.co/' + url_parameter_ai;
				}
				//console.log("parse_ai_from_url: rehydrated url_parameter_ai: ", url_parameter_ai);
				new_ai_settings['download_url'] = url_parameter_ai;
				new_ai_settings['runner'] = 'llama_cpp';
			}
			else if(typeof window.assistants[url_parameter_ai] != 'undefined'){
				new_ai_settings['clone_original'] = url_parameter_ai;
			}
		}
		else{
			
			// Make sure the context parameter is an number, and isn't bigger than what's possible
			if(key == 'context'){
				if(isNaN(value)){
					value = '1024';
				}
				if(typeof value == 'string' && typeof window.settings.assistants[url_parameter_ai] != 'undefined' && typeof window.settings.assistants[url_parameter_ai]['context_size'] == 'number' && parseInt(value) > window.settings.assistants[url_parameter_ai]['context_size'] ){
					console.error("context was larger that possible");
					value = window.settings.assistants[url_parameter_ai]['context_size'];
				}
				if(typeof value == 'string' && parseInt(value) < 512){
					value = 512;
				}
			}
			else if(key == 'temperature'){
				if(isNaN(value) || (typeof value == 'string' && (parseInt(value) < 0 || parseInt(value) > 0 ))){
					value = 0.7;
				}
			}
			else if(key.endsWith('prompt') && key != 'prompt'){
				value = value.replaceAll('_',' ');
			}
			
			if(typeof value == 'string' && !isNaN(value)){
				value = parseFloat(value);
			}
			else if(typeof value == 'string'){
				value = strip_html(value);
			}
			else{
				continue
			}
			new_ai_settings[key] = value;
		}
		
	}
	console.log("parse_ai_from_url: total new_ai_settings: ", new_ai_settings);
	
	if(typeof new_ai_settings.ai != 'undefined'){
		delete new_ai_settings.ai;
	}
	if(typeof new_ai_settings.prompt != 'undefined'){
		delete new_ai_settings.prompt;
	}
	if(typeof new_ai_settings.availability != 'undefined'){
		delete new_ai_settings.availability;
	}
	
	
	document.body.classList.add('busy-editing-received-ai');
	document.body.classList.add('busy-editing-assistant');
	window.assistants['custom_received'] = new_ai_settings;
	//window.settings.assistants['custom_received']['custom_name'] = 'custom_received_papegai';
	
	do_clone_prefill('custom_received');
	
}






async function check_gpu(){
	//console.log("in check_gpu");
	// CHECK WEB GPU SUPPORT
    if (!navigator.gpu) {
		console.error("WebGPU not supported.");
		document.body.classList.remove('web-gpu');
		document.body.classList.remove('web-gpu32');
    }
	else{
		//console.log("navigator.gpu exists: ", navigator.gpu);
		const adapter = await navigator.gpu.requestAdapter();
		if (typeof adapter != 'undefined' && adapter != null && typeof adapter.features != 'undefined') {
			if(adapter.features.has("shader-f16")){
				//console.log(`Web GPU: 16 bit is available`);
				window.web_gpu_supported = true;
				document.body.classList.add('web-gpu');
				
				if (navigator.gpu.wgslLanguageFeatures && !navigator.gpu.wgslLanguageFeatures.has("packed_4x8_integer_dot_product")) {
					//console.log(`webgpu DP4a built-in functions are not available`);
				}
			}
			else{
				console.warn("Web GPU: only 32-bit floating-point value support is available");
				window.web_gpu32_supported = true;
				document.body.classList.remove('web-gpu');
				document.body.classList.add('web-gpu32');
				
				add_web_gpu32_models();
			}
			
		}
		else{
			console.error("querying WebGPU failed, invalid adapter: ", adapter);
			document.body.classList.remove('web-gpu');
			document.body.classList.remove('web-gpu32');
		}
    }
	
}

check_gpu();






























//
//   EVENT LISTENERS
//



document.getElementById('about-link').addEventListener("click", () => {
	/*
	window.add_script('./specials/about.js')
	.then((value) => {
		setTimeout(create_about_document,100);
	})
	.catch((err) => {
		console.error("error adding about script");
	})
	*/
	create_about_document(); // TODO Brave doesn't allow loading in these files on demand, might be a CORS issue
})

document.getElementById('privacy-policy-link').addEventListener("click", () => {
	/*
	window.add_script('./specials/privacy_policy.js')
	.then((value) => {
		setTimeout(create_privacy_policy_document,200);
	})
	.catch((err) => {
		console.error("error adding privacy policy script");
	})
	*/
	create_privacy_policy_document();
	
})



document.getElementById('sidebar-header-chat-button').addEventListener("click", (event) => {
	document.body.classList.add('sidebar-chat');
	document.body.classList.remove('sidebar-settings');
	document.body.classList.remove('show-rewrite');
	document.body.classList.remove('busy-selecting-assistants');
	window.settings.left_sidebar = 'chat';
	save_settings();
});

document.getElementById('sidebar-header-docs-button').addEventListener("click", () => {
	document.body.classList.remove('sidebar-chat');
	document.body.classList.remove('sidebar-settings');
	//document.body.classList.add('show-rewrite'); // TODO: only add this is there are rewrites available for inspection
	document.body.classList.remove('busy-selecting-assistants');
	model_info_container_el.innerHTML = '';
	update_ui();
	window.settings.left_sidebar = 'docs';
	if(window.innerWidth > 900 && document.body.classList.contains('show-rewrite-results')){
		document.body.classList.add('show-rewrite');
	}
	save_settings();
});

document.getElementById('sidebar-header-settings-button').addEventListener("click", () => {
	document.body.classList.remove('sidebar-chat');
	document.body.classList.remove('busy-selecting-assistants');
	document.body.classList.add('sidebar-settings');
	window.settings.left_sidebar = 'settings';
	save_settings();
	check_memory({},true);
	generate_task_overview();
});


document.getElementById('settings-sidebar-settings-button').addEventListener("click", () => {
	document.body.classList.remove('sidebar-settings-show-tasks');
	window.settings.left_sidebar_settings_tab = 'settings';
	save_settings();
});


document.getElementById('settings-sidebar-tasks-button').addEventListener("click", () => {
	//console.log("clicked on tasks button");
	document.body.classList.add('sidebar-settings-show-tasks');
	window.settings.left_sidebar_settings_tab = 'tasks';
	save_settings();
	generate_task_overview();
});


document.getElementById('clear-tasks-button').addEventListener("click", () => {
	console.log("clicked on clear tasks button");
	window.location.reload(false);
});



/*
document.getElementById('simple-task-list-play-button').addEventListener("click", (event) => {
	console.log("in chatty_main");
	window.update_simple_task_list = true;
	document.body.classList.remove('simple-task-list-paused');
});
*/


sidebar_filter_input_el.addEventListener('input', () => {
	//console.log("filter input changed to: ", sidebar_filter_input_el.value);
	if(sidebar_filter_input_el.value.length > 10){
		sidebar_filter_input_el.value = sidebar_filter_input_el.value.substr(0,10);
	}
	document.body.classList.remove('shrink-sidebar');
	
	if(window.settings.left_sidebar = 'chat'){
		let sidebar_contact_els = document.querySelectorAll('#contacts-list > ul > .contact-item');
		for(let sc = 0; sc < sidebar_contact_els.length; sc++){
			//console.log("sidebar filter textcontent: ", sc, sidebar_contact_els[sc].textContent);
			
			if(sidebar_filter_input_el.value.length > 1 && sidebar_contact_els[sc].textContent.toLowerCase().indexOf(sidebar_filter_input_el.value.toLowerCase()) != -1){
				sidebar_contact_els[sc].classList.remove('filtered-out');
			}
			else if(sidebar_filter_input_el.value.length > 1){
				sidebar_contact_els[sc].classList.add('filtered-out');
			}
			else{
				sidebar_contact_els[sc].classList.remove('filtered-out');
			}
		}
	
		//sidebar_filter_input_el.value
	}
	else if(window.settings.left_sidebar = 'docs'){
		// TODO: docs
	}
	
});






download_all_files_button_el.addEventListener("click", (event) => {
	download_all_files_button_el.classList.add('no-pointer-events');
	setTimeout(() => {
		download_all_files_button_el.classList.remove('no-pointer-events');
	},5000);
	take_snapshot(false,null,null,true);
});






// BACKGROUND SECTION CLICK LISTENERS

sidebars_el.addEventListener("click", (event) => {
	//console.log("clicked on sidebar section");
	window.last_user_activity_time = Math.floor(Date.now()/1000);
	reset_sidebar_shrink_timer();
	window.active_section = 'sidebar';
});

function reset_sidebar_shrink_timer(){
	document.body.classList.remove('sidebar-shrink');
	if(window.sidebar_shrink_timer != null){
		clearTimeout(window.sidebar_shrink_timer);
	}
	window.sidebar_shrink_timer = setTimeout(() => {
		if (sidebars_el.matches(':hover')) {
		    //console.log('Mouse is still over the sidebar');
			reset_sidebar_shrink_timer();
		}
		else{
			document.body.classList.add('sidebar-shrink');
		}
		
	}, 10000);
}
sidebars_el.addEventListener("mouseover", function (event) {
	if(document.body.classList.contains('sidebar-shrink')){
		setTimeout(() => {
			if (sidebars_el.matches(':hover')) {
			    //console.log('Mouse is still over the sidebar');
				reset_sidebar_shrink_timer();
			}
		},1000);
	}
}, false);





// general listener on the chat section
chat_content_el.addEventListener("click", (event) => {
	//console.log("clicked on chat content section");
	window.active_destination = 'chat';
	window.active_section = 'chat';
	document.body.classList.remove('document-active');
	if(typeof hide_doc_selection_hint === 'function'){
		hide_doc_selection_hint();
	}
	
	
	if(window.innerWidth < 981 ){ // && document.body.classList.contains('show-document')
		if(typeof close_sidebar == 'function'){
			close_sidebar();
		}
		
	}
	window.last_user_activity_time = Math.floor(Date.now()/1000);
	if(typeof hide_all_context_menus != 'undefined'){
		hide_all_context_menus();
	}
	window.unshrink_chat();
});

tools_el.addEventListener("click", (event) => {
	//console.log("clicked on tools section");
	window.active_destination = 'document';
	window.active_section = 'tools';
	document.body.classList.add('document-active');
	
	if(window.innerWidth < 980 && document.body.classList.contains('show-document')){
		close_sidebar();
	}
	else if(window.innerWidth < 641){
		close_sidebar();
	}
	window.last_user_activity_time = Math.floor(Date.now()/1000);
	if(hide_all_context_menus){
		hide_all_context_menus();
	}
});




// general listener on the document viewer section
main_view_el.addEventListener("click", (event) => {
	console.log("clicked on document viewer section");
	window.active_destination = 'document';
	window.active_section = 'document';
	document.body.classList.add('document-active');
	document.body.classList.remove('busy-selecting-assistants');
	
	if(window.innerWidth < 641){
		close_sidebar();
	}
	else if(window.innerWidth < 980 && document.body.classList.contains('sidebar') && document.body.classList.contains('sidebar-chat') && !document.body.classList.contains('sidebar-shrink')){
		console.log("adding sidebar shrink");
		document.body.classList.add('sidebar-shrink');
	}
	
	if(event.target.classList.contains('cm-activeLineGutter')){
		//console.log("clicked on active gutter element");
		prepare_do_prompt_at_line();
	}
	
	if(hide_all_context_menus){
		hide_all_context_menus();
	}
});

// general listener on the document viewer section
tutorial_el.addEventListener("click", (event) => {
	document.body.classList.remove('busy-selecting-assistants');
	
	if(window.innerWidth < 981){
		close_sidebar();
	}
	
	if(hide_all_context_menus){
		hide_all_context_menus();
	}
});

document.body.addEventListener("click", (event) => {
	window.last_user_activity_time = Date.now();
});









//
//   S I D E B A R
//


sidebar_rag_close_button_el.addEventListener("click", (event) => {
	end_rag_search();
});

sidebar_rag_select_all_button_el.addEventListener("click", (event) => {
	let file_items = document.querySelectorAll('.file-item');
	//console.log("files: ", files);
	let all_already_selected = true;
	if(file_items.length > 2){
		for(let fi = 0; fi < file_items.length; fi++){
			if(!file_items[fi].classList.contains('selected')){
				all_already_selected = false;
				file_items[fi].classList.add('selected');
			}
		}
		
		
		if(all_already_selected){
			for(let fa = 0; fa < file_items.length; fa++){
				file_items[fa].classList.remove('selected');
				
				const full_path = file_items[fa].getAttribute('data-full-path');
				if(full_path && typeof window.selected_rag_documents[full_path] != 'undefined'){
					//console.log("delecting, full_path: ", full_path);
					delete window.selected_rag_documents[full_path];
				}
			}
			
			
			
			
		}
		else{
			let file_names = keyz(files);
			for(let fn = 0; fn < file_names.length; fn++){
				window.selected_rag_documents[ folder + '/' + file_names[fn] ] = {'folder':folder,'filename':file_names[fn]};
			}
		}
		//console.log("window.selected_rag_documents is now: ", keyz(window.selected_rag_documents).length, window.selected_rag_documents);
	}
});

function show_rag_search(){
	//console.log('in show_rag_search');
	document.body.classList.add('show-documents-search');
	open_sidebar();
	document.body.classList.remove('sidebar-chat');
	document.body.classList.remove('sidebar-settings');
	model_info_container_el.innerHTML = '';
	codeOutput.innerHTML = '';
	window.selected_rag_documents = {};
	
	if(window.settings.docs.open != null && typeof window.settings.docs.open.folder == 'string' && typeof window.settings.docs.open.filename == 'string'){
		window.selected_rag_documents[window.settings.docs.open.folder + '/' + window.settings.docs.open.filename] = window.settings.docs.open;
		//console.log('window.selected_rag_documents: ', window.selected_rag_documents);
		update_ui_file_menu();
	}
}

function clear_rag_search(){
	//console.log('in clear_rag_search');
	window.selected_rag_documents = {};
	let file_manager_items = document.querySelectorAll('li.file-item.selected');
	for(let fi = 0; fi < file_manager_items.length; fi++){
		file_manager_items[fi].classList.remove('selected');
	}
}

function end_rag_search(){
	//console.log("in end_rag_search");
	document.body.classList.remove('show-documents-search');
	document.body.classList.remove('show-rag-result');
	codeOutput.innerHTML = '';
	window.selected_rag_documents = {};
	
}




start_rag_search_button_el.addEventListener("click", (event) => {
	//console.log("clicked on start rag search button");
	
	if(!document.body.classList.contains('show-documents-search')){
		
		
		window.add_script('./rag_module.js',true) // add it as a module
		.then(() => {
			show_rag_search();
		})
		.catch((err) => {
			console.error("failed to load rag_module.js: ", err);
		})
		
	}
	else if(window.rag_search_prompt_el.value.length > 4){
		if(window.settings.rag_search_prompt != window.rag_search_prompt_el.value){
			window.settings.rag_search_prompt = window.rag_search_prompt_el.value;
			save_settings();
		}
		
		start_rag_search_button_el.classList.add('no-pointer-events');
		setTimeout(() => {
			start_rag_search_button_el.classList.remove('no-pointer-events');
		},2000);
		
		create_rag_task({'prompt':window.rag_search_prompt_el.value});
		
		document.body.classList.remove('show-camera');
		document.body.classList.remove('show-rewrite');
	}
	else{
		flash_message(get_translation("Please_provide_a_command_or_question_first"),4000,'warn');
	}
});

function ensure_text_ai(){
	console.error('in ensure_text_ai');
	if(typeof window.settings.assistant == 'string' && typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant].media != 'undefined' && Array.isArray(window.assistants[window.settings.assistant].media) && window.assistants[window.settings.assistant].media.indexOf('text') == -1 && typeof window.settings.last_loaded_text_ai == 'string'){
		console.log("switching to last loaded text AI: ", window.settings.last_loaded_text_ai);
		switch_assistant(window.settings.last_loaded_text_ai);
	}
	else{
		console.warn('ensure_text_ai: cannot ensure that a text AI is active.  window.settings.assistant,window.settings.last_loaded_text_ai: ', window.settings.assistant, window.settings.last_loaded_text_ai );
	}
}


async function create_rag_task(task=null){
	//console.log("in start_rag_search. task: ", task);
	if(typeof task == 'undefined' || task == null){
		console.error("create_rag_task: no valid task provided");
		return false
	}
	if(typeof task.prompt != 'string'){
		console.error("create_rag_task: provided task did not contain a (valid) prompt. task: ", task);
		if(document.body.classList.contains('show-documents-search')){
			task.prompt = window.rag_search_prompt_el.value;
		}
	}
	
	let prompt_text = task.prompt;
	if(typeof task.prompt.original_prompt == 'string' && task.prompt.original_prompt.length > 4){
		prompt_text = task.prompt.original_prompt;
		//console.log("create_rag_task: task has original_prompt: ", task.original_prompt);
		//console.log("create_rag_task: using original_prompt instead of task.prompt: ", task.prompt);
	}
	else{
		if(prompt_text.length > 4){
			add_chat_message(window.settings.assistant, 'user', prompt_text);
		}
	}
	if(prompt_text.length < 5){
		console.error("create_rag_task: prompt_text was too short: ", prompt_text);
		return false
	}
	
	if(keyz(window.selected_rag_documents).length == 0){
		flash_message(get_translation("Please_select_at_least_one_document"),4000,'warn');
		return false
	}
	
	if(task.prompt.length < 5){
		console.error("create_rag_task: prompt was too short: ", task.prompt);
		return false
	}
	
	
	
	rag_info_container_el.innerHTML = '';
	
	window.add_script('./rag_module.js',true) // add it as a module
	.then(() => {
		//console.log("create_rag_task: rag_module.js is now loaded");
		
		
		// Check if there are any images selected, and if so, do image_to_text on them first
		
		function create_image_description_tasks(list_of_undescribed_image_files){
			console.log("in create_image_description_tasks. list_of_undescribed_image_files: ", list_of_undescribed_image_files);
			for(let p = 0; p < list_of_undescribed_image_files.length; p++){
				if(list_of_undescribed_image_files[p] == null || typeof list_of_undescribed_image_files[p].filename != 'string'){
					console.error("create_rag_task: invalid image file");
					continue
				}
				const full_image_path = list_of_undescribed_image_files[p].folder + '/' + list_of_undescribed_image_files[p].filename;
				let extension = get_file_extension(list_of_undescribed_image_files[p].filename);
				
				if(typeof playground_live_backups[full_image_path] == 'string'){
					let data = playground_live_backups[full_image_path].substr(19);
		
					//console.log("IMAGE AS TEXT BASE64: ",Base64.encode(data), encodeURIComponent(data) );
					data = string_to_buffer( data );
					//let is_array_buffer = ArrayBuffer.isView(data);
					//console.log("generate_image_html: raw_data is_array_buffer?: ", is_array_buffer);

					let image_blob = new Blob([ data ], {type: "image/" + extension});
				
					window.create_image_to_text_task({
						'assistant':'image_to_text',
						'image_blob':image_blob,
						'origin':'chat',
						'destination':'chat',
						'prompt':'Write a detailed description of this image',
						'state':'should_image_to_text',
						'file':list_of_undescribed_image_files[p]
					});
				}
				
			}
			
		}
		
		if( (window.web_gpu_supported || window.web_gpu32_supported) && keyz(window.selected_rag_documents).length){
			
			let list_of_undescribed_image_files = [];
			//let image_to_text_description_counter = 0;
			for (const [rag_doc_path, details] of Object.entries(window.selected_rag_documents)) {
				//console.log("create_rag_task: rag_doc_path, details: ", rag_doc_path, details);
				try{
					if(typeof details.filename == 'string' && filename_is_image(details.filename)){
						//console.log("create_rag_task: details.filename is image: ", details.filename);
						// TODO: this only checks on the current folder
						if(typeof files[details.filename] != 'undefined'){
							if(typeof files[details.filename]['image_to_text_description'] != 'string'){
								//console.log("create_rag_task: this image does not have an image_to_text description yet: ", details.filename);
								if( (typeof playground_live_backups[rag_doc_path] == 'string' && playground_live_backups[rag_doc_path].startsWith('_PLAYGROUND_BINARY_')) || window.filename_is_binary(rag_path) ){
									list_of_undescribed_image_files.push(details);
								}
							}
							else{
								//console.log("create_rag_task: good, this image already has a description: ", details.filename);
							}
						}
					}
				}
				catch(err){
					console.error("create_rag_task: caught error trying to create image_to_text description task first: ", err);
				}
				
			}
			if(list_of_undescribed_image_files.length){
				//console.log("create_rag_task: list_of_undescribed_image_files: ", list_of_undescribed_image_files.length, list_of_undescribed_image_files);
				if(confirm(list_of_undescribed_image_files.length + ' ' + get_translation('images_do_not_have_a_description_yet_Would_you_like_to_first_describe_them_with_the_image_describer_AI'))){
					create_image_description_tasks(list_of_undescribed_image_files);
					switch_assistant('image_to_text');
				}
			}
		}
		
		
		
		
		ensure_text_ai();
		
		//add_chat_message(window.settings.assistant, window.settings.assistant, window.rag_search_prompt_el.value);
		add_chat_message(window.settings.assistant, window.settings.assistant, '', null, '<div id="rag-search-result-output' + window.rag_counter + '"><p class="rag-search-result-original-prompt">' + prompt_text + '</p><div class="spinner"></div></div>', window.rag_counter);
		
		let rag_task = {
			"assistant":window.settings.assistant,
			"type":"rag", // TODO: embed_documents?
			"state":"should_rag",
			"origin":"prompt",
			"prompt":prompt_text,
			"rag_index":window.rag_counter,
			"system_prompt":"",
		}
		rag_task = {...task,...rag_task};
		//console.log("new rag_task after merging with provided task: ", rag_task);
		
		if(prompt_text.length < 100){
			rag_task['rag_limit'] = 2;
		}
				
		if(prompt_text.length < 20){
			rag_task['rag_term'] = prompt_text;
		}
		else if(prompt_text.length < 60 && (prompt_text.startsWith('"') && prompt_text.endsWith('"'))){
			rag_task['rag_term'] = prompt_text;
		}
		
		
		if(typeof window.conversations[window.settings.assistant] != 'undefined' && Array.isArray(window.conversations[window.settings.assistant]) && window.conversations[window.settings.assistant].length){
			
			// TODO: could create a separate RAG conversation history instead of potentially splintering it over many assistants
			if(typeof window.conversations[window.settings.assistant] != 'undefined' && window.conversations[window.settings.assistant].length > 1 ){
				//console.log("create_rag_task: there is a conversation history. Will first rephrase the question into a stand-alone question");
				const last_query = window.conversations[window.settings.assistant][window.conversations[window.settings.assistant].length-2];
				const last_answer = window.conversations[window.settings.assistant][window.conversations[window.settings.assistant].length-1];
				
				//console.log("create_rag_task: last_query: ", last_query);
				//console.log("create_rag_task: last_answer: ", last_answer);
				
				if(typeof last_query.role == 'string' && typeof last_query.content == 'string' && typeof last_answer.role == 'string' && typeof last_answer.content == 'string'){
					rag_task.type = 'rag_search_rephrasing';
					rag_task.state = 'should_assistant';
					rag_task.prompt = last_query.role + ": " + last_query.content + "\n\n" + last_answer.role + ": " + last_answer.content + "\n\nGiven the above conversation, rephrase the following question into a standalone, natural language query with important keywords that a researcher could later pass into a search engine to get information relevant to the conversation. Do not respond with anything except the query.\n\n<question_to_rephrase>\n" + prompt_text + "\n</question_to_rephrase>";
					rag_task['desired_results'] = 1;
					if(typeof rag_task.q == 'undefined'){
						rag_task.q = [];
					}
					else{
						console.warn("create_rag_task: the task already had a q, from the provided task. Provided task q: ", task.q);
					}
					rag_task.q.unshift({
						'type':'rag_search_merging',
						'state':'should_rag',
						'desired_results': 2,
					});
					//console.log("create_rag_task: rag_task q is now: ", rag_task.q);
				}
				
			}
			
		}
		
		
		window.rag_counter++;
		
		if(keyz(window.selected_rag_documents).length){
			rag_task["files"] = JSON.parse(JSON.stringify(window.selected_rag_documents));
			const rag_files_count = Object.keys(rag_task["files"]).length;
			
			// If there are lots of documents, get some more search results
			if(rag_files_count > 2){
				rag_task['rag_limit']++;
			}
			if(rag_files_count > 4){
				rag_task['rag_limit']++;
			}
			if(rag_files_count > 6){
				rag_task['rag_limit']++;
			}
			if(rag_files_count > 10){
				rag_task['rag_limit']++;
			}
			
			window.add_task(rag_task);
			return true
		}
		else{
			console.warn("No files selected");
			return false
		}
		
	})
	.catch((err) => {
		console.error("caught error loading rag_module script: ", err);
		flash_message(get_translation("A_model_has_to_be_downloaded_from_the_internet_but_there_is_no_internet_connection"),4000,'error');
		return false
	})
	
}


async function do_rag(task,refresh_embeddings=true){
	//console.log("in do_rag. task: ", task);
	
	if(window.rag_worker_busy){
		console.error("do_rag: window.rag_worker_busy was already true, aborting.");
		return false
	}
	
	if(typeof task == 'undefined' || task == null){
		console.error("do_rag: aborting, task was invalid: ", task);
		return false
	}
	if(typeof task.prompt != 'string' || typeof task.origin != 'string' || typeof task.files == 'undefined' || task.files == null){
		console.error("do_rag: task was missing important properties (prompt, origin,files): ", task);
		return false
	}
	
	if(typeof refresh_embeddings != 'boolean'){
		refresh_embeddings = true;
	}
	
	let rag_paths = keyz(window.selected_rag_documents);
	let embedding_total_documents_count = rag_paths.length;
	
	let rag_progress_container_el = document.createElement('div');
	rag_progress_container_el.classList.add('rag-progress-container');
	rag_progress_container_el.innerHTML = '<span data-i18n="Reading_documents">' + get_translation('Reading_documents') + '</span>';
	let rag_embedding_progress_el = document.createElement('progress');
	rag_embedding_progress_el.setAttribute('id','rag-embedding-progress');
	rag_progress_container_el.appendChild(rag_embedding_progress_el);
	
	rag_info_container_el.appendChild(rag_progress_container_el);
	
	let prompt_as_embedding = null;
	
	
	//flash_message(get_translation("Please_provide_a_command_or_question_first"),4000,'warn');
	
	console.error("do_rag: task.files", task.files);
	
	let embedding_counter = 0;
	for (const [rag_path, details] of Object.entries(task.files)) {
		console.error("\n\n\ndo_rag: RAGGING ON: rag_path: ", rag_path, details);
		try{
			
			if(!document.body.classList.contains('show-documents-search')){
				console.warn("do_rag: setting rag task to interrupted, as RAG search no longer seems to be enabled");
				end_rag_search();
				//set_task_state(task,'interrupted'); // sets the task to interrupted
				handle_completed_task(task,false,{'state':'interrupted'});
				return
			}
			
			let text_to_embed = null;
			//let unsupported_file = false;
			
			let file_manager_item_el = document.querySelector('.file-item[data-full-path="' + rag_path + '"]');
			if(file_manager_item_el){
				//console.log("do_rag: found corresponsing item in file manager: ", file_manager_item_el);
				file_manager_item_el.classList.add('getting-embedding');
			}
			else{
				console.error("do_rag: could not find corresponding item in file manager: ", file_manager_item_el);
			}
			
			if(typeof playground_live_backups[rag_path] == 'string' && playground_live_backups[rag_path].length > 10){
				if(playground_live_backups[rag_path].startsWith('_PLAYGROUND_BINARY_') ){ // || window.filename_is_binary(rag_path)
					console.warn("do_rag: A file that was selected for rag was a binary file: ", rag_path);
					
					//unsupported_file = true;
					
					// TODO: could theoretically quickly get the files from a zip file...
					if(rag_path.endsWith('.zip')){
						console.warn("do_rag: the file to rag on was a zip file. Cannot RAG those...yet.");
					}
			
					// TODO: perform image-to-text on image to get a detailed description of the image, and then allow searching within that description
					else if(filename_is_image(rag_path)){
						//console.log("do_rag: the file to rag on was an image file");
						// TODO: Maybe store descriptions of images in the file meta data?
						// TODO: Maybe if a significant number of the files to RAG are images, then offer to index the images?
						
						if(typeof details.filename == 'string' && typeof files[details.filename] != 'undefined' && typeof files[details.filename].image_to_text_description == 'string' && files[details.filename].image_to_text_description.length){
							//console.log("do_rag: image has image_to_text_description, setting that as the text_to_embed");
							text_to_embed = files[details.filename].image_to_text_description;
						}
						else if(window.web_gpu_supported || window.web_gpu32_supported){

						}
						//if(typeof files[rag_path] != 'undefined')
						
					}
			
					if(file_manager_item_el){
						file_manager_item_el.classList.remove('getting-embedding');
						file_manager_item_el.classList.add('cannot-rag');
					}
				}
				else{
					// normal text, all good
					text_to_embed = playground_live_backups[rag_path];
				}
			}
			
			if(typeof text_to_embed != 'string'){
				//console.log("do_rag: unsupported file type for RAG: ", rag_path);
				continue
			}
			if(text_to_embed.startsWith('_PLAYGROUND_BINARY_') ){ // || window.filename_is_binary(rag_path)
				console.error("do_rag: skipping file, text_to_embed started with _PLAYGROUND_BINARY_: ", rag_path);
				continue
			}
			
			let embedding_task = {
				'type':'embedding',
				'origin':'document',
				'file': details,
				'text':text_to_embed,
				'refresh_embeddings':refresh_embeddings,
				//'sentences_to_embed': split_into_paragraphs(test_text,300);
			}
			//console.log("do_rag: calling do_promise_rag with: ", embedding_task);
			try{
				fresh_embeddings = await window.do_promise_rag(embedding_task, true);
			}
			catch(err){
				console.error("Caught error from RAG promise worker: ", err);
				if(typeof task.index == 'number'){
					let rag_result_output_el = document.getElementById('rag-search-result-output' + task.index);
					if(rag_result_output_el){
						rag_result_output_el.innerHTML = get_translation("An_error_occured");
						rag_result_output_el.closest('.bubble').classList.add('rag-error');
					}
				}
				message_downloads_container_el.innerHTML = '';
				
			}
			
			if(file_manager_item_el){
				file_manager_item_el.classList.remove('getting-embedding');
			}
			
			
			
		}
		catch (err){
			console.error("start_rag_search: got error while attempting to find embeddings in IndexDB: ", err);
		}
		//console.log("updating embedding progress indicator.  embedding_counter,embedding_total_documents_count: ", embedding_counter, embedding_total_documents_count);
		rag_embedding_progress_el.value = embedding_counter / embedding_total_documents_count;
		embedding_counter++;
	}
	
	rag_info_container_el.innerHTML = '';
	message_downloads_container_el.innerHTML = '';
	
	
	
	// NOW THAT THE DOCUMENTS ARE INDEXED, IT'S TIME TO SEARCH
	if(task.origin == 'prompt' && typeof task.prompt == 'string' && typeof task.rag_index == 'number'){
		
		let rag_search_task = {
			'assistant':task.assistant,
			'prompt':task.prompt,
			'type':'rag_search',
			'origin':'prompt',
			//'file': window.selected_rag_documents[rag_path],
			//'text':playground_live_backups[rag_path],
			'refresh_embeddings':refresh_embeddings,
			'rag_index':task.rag_index,
			//'sentences_to_embed': split_into_paragraphs(test_text,300);
		}
		if(typeof task.files != 'undefined'){
			rag_search_task['files'] = task.files;
		}
		if(typeof task.rag_term == 'string'){
			rag_search_task['term'] = task.rag_term;
		}
		if(typeof task.rag_limit == 'number'){
			rag_search_task['rag_limit'] = task.rag_limit;
		}
		
		window.do_promise_rag(rag_search_task,true) // force to run it, as window.rag_worker_busy == true
		.then((rag_search_results) => {
			console.error("OK, got rag_search_results: ", rag_search_results);
			
			window.show_rag_search_result(rag_search_results); // creates list of chunks in the document right sidebar
			
			if(window.generate_from_rag_search_result(rag_search_results)){
				//set_task_state(task,'completed');
				handle_completed_task(task,true);
			}
			else{
				//set_task_state(task,'failed');
				handle_completed_task(task,false,{'state':'failed'});
			}
			window.rag_worker_busy = false;
			// For some reason the search results aren't resolving here,so the next part of the journey happens when a message is received from the worker.
			// ----> rag_module.js -->   generate_from_rag_search_result()
			
			
			/*
			//console.log("calling get_database");
			window.do_promise_rag({'action':'get_database','type':'get_database'},true)
			.then((everything) => {
				console.error("EVERYTHING from get_database: ", everything);
			})
			.catch((err) => {
				console.error("PROMISE RAG WORKER: caught error doing search: ", err);
			})
			*/
			
		})
		.catch((err) => {
			console.error("PROMISE RAG WORKER: caught error doing search: ", err);
			window.rag_worker_busy = false;
		})
		
		
	}
	else{
		// mark the task as done
		console.warn("RAG TASK: only did embedding, but no search (no prompt?)");
		//set_task_state(task,'completed');
		handle_completed_task(task,true);
		window.rag_worker_busy = false;
	}

}




//
//  C H A T  
//


back_button_container_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on back button");
	open_sidebar();
	//document.body.classList.add('sidebar-overlay');
});









//
//  CREATE CUSTOM AI
//

add_custom_assistant_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on add-custom-assistant-button");
	window.ai_being_edited = null;
	start_making_custom_ai();
});

const new_custom_ai_model_emoji_editor_container_el = document.getElementById('new-custom-ai-model-emoji-editor-container');


function start_making_custom_ai(prefill=null,assistant_id=null){
	//console.log("in start_making_custom_ai.  prefill,assistant_id: ", prefill,assistant_id);
	
	// clean up first
	model_info_container_el.innerHTML = ''; // avoid having two emoji editors open at the same time
	share_prompt_assistant_emoji_el.innerHTML = '';
	share_prompt_input_el.value = '';
	
	if(typeof prefill == 'object' && prefill != null){
		for (const [prefill_key, prefill_value] of Object.entries(prefill)){
			//console.log("start_making_custom_ai:  prefill_key, prefill_value: ", prefill_key, prefill_value);
			let prefill_el = document.getElementById('new-custom-ai-model-' + prefill_key);
			if(prefill_el){
				try{
					prefill_el.value = prefill_value;
				}
				catch(err){
					console.error("start_making_custom_ai: caught error going over prefill values (not an input element?): ", err);
				}
			}
			prefill_el = document.getElementById('share-prompt-model-' + prefill_key);
			if(prefill_el){
				try{
					prefill_el.value = prefill_value;
				}
				catch(err){
					console.error("start_making_custom_ai: caught error going over prefill values (not an input element?): ", err);
				}
			}
			
		}
		
		
	}
	
	document.body.classList.add('busy-editing-assistant');
	
	let emoji_editor_el = null;
	if(typeof assistant_id == 'string' && assistant_id.length && (assistant_id.startsWith('custom_saved') || assistant_id == 'custom_received')){
		//console.log("start_making_custom_ai: assistant_id was provided, creating emoji editor for: ", assistant_id);
		emoji_editor_el = create_emoji_editor(assistant_id);
	}
	else if(typeof prefill == 'object' && prefill != null && typeof prefill.assistant_id == 'string' && prefill.assistant_id.length && prefill.assistant_id.startsWith('custom_saved')){
		//console.log("start_making_custom_ai: assistant_id was provided in prefill dictionary, creating emoji editor for:  prefill.assistant_id: ", prefill.assistant_id);
		emoji_editor_el = create_emoji_editor(prefill.assistant_id);
	}
	else{
		//console.log("start_making_custom_ai: creating emoji editor for a brand new AI");
		emoji_editor_el = create_emoji_editor();
	}
	new_custom_ai_model_emoji_editor_container_el.innerHTML = '';
	if(emoji_editor_el){
		new_custom_ai_model_emoji_editor_container_el.appendChild(emoji_editor_el);
	}
	else{
		console.error("failed to create emoji editor element?");
	}
	
	
	//create_share_prompt_link(true); // true == initial creation of share dialog, which populates the textareas for
	//share_prompt_dialog_el.showModal();
	new_custom_ai_dialog_el.showModal();
}







select_assistants_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on select-assistants-button");
	
	busy_selecting_assistants = !busy_selecting_assistants;
	//console.log("busy_selecting_assistants is now: ", busy_selecting_assistants);
	if(busy_selecting_assistants){
		document.body.classList.add('busy-selecting-assistants');
	}
	else{
		document.body.classList.remove('busy-selecting-assistants');
	}
	
	window.settings.tutorial['add_assistants_hint_shown'] = true;
	save_settings();
	select_assistants_hint_container_el.style.display = 'none';
});




// Show model info button
chat_header_icon_container_el.addEventListener("click", () => {
	if( !document.body.classList.contains('chat-shrink') ){
		show_model_info();
	}
	else{
		// just unshrink the chat section
	}
});





// Microphone button
microphone_icon_el.addEventListener("click", (event) => {
	event.preventDefault();
	event.stopPropagation();
	//console.log("microphone-icon clicked. window.microphone_enabled before: ", window.microphone_enabled);
    try{
		
		if(window.microphone_enabled){
			disable_microphone();
			change_tasks_with_state('should_stt');
			update_buffer_counts();
		}
		else{
			enable_microphone();
		}
	}
	catch(err){
		console.error("clicked on microphone_icon_el. resume vad button failed: ", err);
	}
	
	if(document.body.classList.contains('chat-shrink') && !document.body.classList.contains('show-document') ){
		document.body.classList.remove('chat-shrink');
		window.active_destination = 'chat';
	}
	if(window.innerWidth < 641){
		if(document.body.classList.contains('show-document')){
			window.active_destination = 'document';
		}
		else{
			window.active_destination = 'chat';
		}
		
	}
	
});

// Speaker button
speaker_icon_el.addEventListener("click", (event) => {
	//console.log("speaker-icon clicked");
	event.preventDefault();
	event.stopPropagation();
    try{
		if(window.speaker_enabled){
			disable_speaker();
		}
		else{
			enable_speaker();
		}
	}
	catch(e){
		console.error("speaker button error: ", e)
	}
});



//
//   PROMPT INPUT FORM
//

prompt_el.addEventListener("focus", (e) => {
	prompt_el.style.opacity = 0;
	setTimeout(() => prompt_el.style.opacity = 1);
	//console.log("prompt input got focus");
	try{
		
		//console.log("chat prompt input got focus. Calling load_model_from_focus");
		window.load_model_from_focus();
		
	}
	catch(e){
		console.error("Error calling start_assistant from giving prompt input focus: ", e);
	}
});


prompt_el.addEventListener("input", (e) => {
	//console.log("prompt_el: got input event. prompt_el.value: ", prompt_el.value);
	//if(window.settings.assistant == 'translator'){
	if(window.settings.auto_detect_input_language){
		if(prompt_el.value.length > 5){
			if(window.language_detect_timeout){
				clearTimeout(window.language_detect_timeout);
			}
			window.language_detect_timeout = setTimeout(() => {
				//console.log(" prompt text-input has settled, doing language detection");
				detect_language(null,'#prompt')
				.then((value) => {
					//console.log("prompt_el input listener -> detect_language: resolved: ", value);
				})
				.catch((err) => {
					console.error("prompt_el input listener -> detect_language: rejected: ", err);
				})
				// The then-catch is not needed really
			},500);
			
		}
	}
});

prompt_el.addEventListener("keyup", ({key}) => {
    if (key === "Enter" && parseInt(message_form_container_el.style.height) == window.minimum_prompt_height) {
		//console.log("enter pressed, and prompt input is in it's smallest height, so using this to submit the prompt")
		prompt_submit_button_clicked();
		/*
		setTimeout(() => {
			clear_prompt_input();
		},10);
		*/
		prompt_el.value = '';
    }
})


document.body.addEventListener("keyup", (event) => {
    if(window.active_section == 'sidebar'){
    	//console.log("keyup while sidebar is active.  event: ", event, event.key, event.which);
		//sidebar_filter_input.value += key;
		//e.which <= 90 && e.which >= 48
		if(event.which >= 48 && event.which <= 90 && sidebar_filter_input_el.value == ''){
			document.body.classList.remove('shrink-sidebar');
			sidebar_filter_input_el.value = event.key;
			sidebar_filter_input_el.focus();
		}
		if(event.key === "Escape") {
			sidebar_filter_input_el.value = '';
		}
    }
})






document.getElementById('prompt-markdown-disable-button').addEventListener("click", (e) => {
	window.settings.assistants[window.settings.assistant]['markdown_enabled'] = false;
	save_settings();
	update_prompt_adjustments();
});

document.getElementById('prompt-markdown-enable-button').addEventListener("click", (e) => {
	window.settings.assistants[window.settings.assistant]['markdown_enabled'] = true;
	save_settings();
	update_prompt_adjustments();
});

document.getElementById('prompt-brevity-disable-button').addEventListener("click", (e) => {
	window.settings.assistants[window.settings.assistant]['brevity_enabled'] = false;
	save_settings();
	update_prompt_adjustments();
});

document.getElementById('prompt-brevity-enable-button').addEventListener("click", (e) => {
	window.settings.assistants[window.settings.assistant]['brevity_enabled'] = true;
	save_settings();
	update_prompt_adjustments();
});




function update_prompt_adjustments(assistant_id=null){
	//console.log("in update_prompt_adjustments. assistant_id: ", assistant_id);
	let new_adjustment_prompt = '';
	if(typeof assistant_id != 'string'){
		//console.log("update_prompt_adjustments. Using window.settings.assistant: ", window.settings.assistant);
		assistant_id = window.settings.assistant;
	}
	//console.log("update_prompt_adjustments: assistant_id is now: ", assistant_id);
	//console.log("update_prompt_adjustments:  typeof assistant_id, typeof window.assistants[assistant_id]: ", typeof assistant_id, typeof window.assistants[assistant_id]);
	
	if(typeof assistant_id == 'string' && (typeof window.settings.assistants[assistant_id] != 'undefined' || typeof window.assistants[assistant_id] != 'undefined')){
		
		//console.log("update_prompt_adjustments. checking brevity: ", assistant_id, window.settings.assistants[assistant_id]['brevity_enabled']);
		
		// Brevity
		if(
			(
				(typeof window.assistants[assistant_id] != 'undefined' 
				&& typeof window.assistants[assistant_id]['brevity_supported'] == 'boolean' 
				&& window.assistants[assistant_id]['brevity_supported'] == true)
				||
				(typeof window.settings.assistants[assistant_id] != 'undefined' 
				&& typeof window.settings.assistants[assistant_id]['brevity_supported'] == 'boolean' 
				&& window.settings.assistants[assistant_id]['brevity_supported'] == true)
			)
			
			&& typeof window.settings.assistants[assistant_id] != 'undefined' 
			&& typeof window.settings.assistants[assistant_id]['brevity_enabled'] == 'boolean'){
			//console.log("update_prompt_adjustment:  window.settings.assistants[assistant_id].brevity_enabled: ", window.settings.assistants[assistant_id].brevity_enabled);
			if(window.settings.assistants[assistant_id]['brevity_enabled']){
				new_adjustment_prompt += get_translation('Write_your_answer_short_and_succinct') + '. ';
				document.body.classList.add('brevity-enabled');
			}
			else{
				if(document.body.classList.contains('brevity-enabled')){
					document.body.classList.remove('brevity-enabled');
				}
			}
		}
		else if(typeof window.assistants[assistant_id]['brevity_enabled'] == 'boolean' && window.assistants[assistant_id]['brevity_enabled'] == true){
			//console.log("update_prompt_adjustment: falling back to brevity in assistants dict, which is set to true as the default");
			new_adjustment_prompt += get_translation('Write_your_answer_short_and_succinct') + '. ';
			document.body.classList.add('brevity-enabled');
		}
		else{
			//console.log("update_prompt_adjustment:  brevity fell through (not enabled in setting or in assistants dict)");
			if(document.body.classList.contains('brevity-enabled')){
				document.body.classList.remove('brevity-enabled');
			}
		}
	
		// No explanations (not used, has been merged into brevity)
		if(typeof window.assistants[assistant_id]['no_explanations_supported'] == 'boolean' && window.assistants[assistant_id]['no_explanations_supported'] == true && typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['no_explanations'] == 'boolean' && window.settings.assistants[assistant_id]['no_explanations']){
			if(window.settings.assistants[assistant_id]['no_explanations']){
				new_adjustment_prompt += ' ' + get_translation('Just_provide_the_answer_with_no_explanations') + '. ';
				document.body.classList.add('no-explanations-enabled');
			}
			else{
				if(document.body.classList.contains('no-explanations-enabled')){
					document.body.classList.remove('no-explanations-enabled');
				}
				
			}
		
		}
		else if(typeof window.assistants[assistant_id]['no_explanations'] == 'boolean' && window.assistants[assistant_id]['no_explanations']){
			new_adjustment_prompt += ' ' + get_translation('Just_provide_the_answer_with_no_explanations') + '. ';
			document.body.classList.add('no-explanations-enabled');
		}
		else{
			if(document.body.classList.contains('no-explanations-enabled')){
				document.body.classList.remove('no-explanations-enabled');
			}
		}
	
		// Markdown
		if(typeof window.assistants[assistant_id]['markdown_supported'] == 'boolean' && window.assistants[assistant_id]['markdown_supported'] == true && typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id]['markdown_enabled'] == 'boolean'){
			if(window.settings.assistants[assistant_id]['markdown_enabled']){
				new_adjustment_prompt += ' ' + get_translation('Format_your_response_in_markdown') + '.';
				document.body.classList.add('markdown-enabled');
			}
			else{
				if(document.body.classList.contains('markdown-enabled')){
					document.body.classList.remove('markdown-enabled');
				}
			}
		}
		else if(typeof window.assistants[assistant_id]['markdown_enabled'] == 'boolean' && window.assistants[assistant_id]['markdown_enabled']){
			new_adjustment_prompt += ' ' + get_translation('Format_your_response_in_markdown') + '.';
			document.body.classList.add('markdown-enabled');
		}
		else{
			if(document.body.classList.contains('markdown-enabled')){
				document.body.classList.remove('markdown-enabled');
			}
		}
		
	}
	else{
		console.error("update_prompt_adjustment:  assistant was not present in settings (just deleted?).  assistant_id: ", assistant_id);
		prompt_adjustments_el.value = '';
		textAreaAdjust(prompt_adjustments_el);
		return '';
	}
	
	

	
	prompt_adjustments_el.value = new_adjustment_prompt;
	textAreaAdjust(prompt_adjustments_el);
	
	return new_adjustment_prompt;
}
window.update_prompt_adjustments = update_prompt_adjustments;




// Quick document chat file upload button
document_chat_upload_input_el.addEventListener("change", async (event) => {
	//console.log("document_chat_upload_input_input_el changed. event.target.files: ", event.target.files);
	
	
	// Clear the old attachment
	question_prompt_document_title_el.innerHTML = '';
	question_prompt_textarea_el.value = '';
	
    file_upload(event.target)
	.then((value) => {
		//console.log("document_chat_upload: upload complete? value: ", value);
		window.prepare_question();
	})
	.catch((err) => {
		console.error("document_chat_upload: caught error waiting for quick document chat file upload: ", err);
	})
})



chat_prompt_textarea_eraser_el.addEventListener("click", (event) => {
	clear_prompt_input();
	prompt_el.focus();
});
function clear_prompt_input(){
	//console.log("in clear_prompt_input");
	prompt_el.value = '';
	chat_prompt_textarea_eraser_el.classList.add('eraser-erasing');
	setTimeout(() => {
		chat_prompt_textarea_eraser_el.classList.remove('eraser-erasing');
	},1100);
}


submit_prompt_button_el.addEventListener("click", (event) => {
	//console.log("submit button: clicked");
	
	event.stopPropagation();
	event.preventDefault();
	
	prompt_submit_button_clicked();
	
});

function prompt_submit_button_clicked(){
	if(prompt_el.value.length < 2 && window.settings.assistant != 'image_to_text_ocr'){
		if(prompt_el.value.length > 0 && window.settings.assistant == 'speaker' ){ // || prompt_el.value.toLowerCase() == 'hi' || prompt_el.value.toLowerCase() == 'ok')
			// speaker can be asked to say a number
		}
		else{
			console.warn("submit_prompt_button_el click: prompt was too short/empty");
			flash_message(get_translation("Too_short"),1000,'warn');
			prompt_el.setAttribute('placeholder', get_translation('Enter_a_command_or_question_here'))
			prompt_el.focus();
			return
		}
	}
	
	model_info_container_el.innerHTML = '';
	
	document.body.classList.remove('show-rewrite');
	
	submit_prompt_button_el.classList.add('no-pointer-events');
	submit_prompt_button_el.classList.add('fly-the-plane');
	setTimeout(() => {
		submit_prompt_button_el.classList.remove('no-pointer-events');
		submit_prompt_button_el.classList.remove('fly-the-plane');
	},500);
	
	// place prompt in blueprint document if it's open
	// Add prompt to blueprint file
	if(window.busy_doing_blueprint_task == false && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && prompt_el.value.length > 4 && window.settings.docs.open != null){
		const blueprint_prompt_command = '\n\nPrompt: ' + prompt_el.value + '\n\n';
		flash_message(get_translation("Added_command_to_blueprint"),1000);
		if(!window.doc_text.endsWith(blueprint_prompt_command)){
			insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, blueprint_prompt_command);
		}
		else{
			//console.log("blueprint already ended with this prompt command");
		}
	}
	
	else if(window.settings.assistant == 'image_to_text_ocr' && window.last_image_to_text_blob == null){
		flash_message(get_translation('Please_provide_an_image'),3000,'warn');
	}
	else if(window.settings.assistant == 'image_to_text_ocr' && window.last_image_to_text_blob != null){
		do_prompt(null,'OCR'); // {'state':'should_ocr'}
	}
	else if(prompt_el.value != ''){
		console.log('prompt_submit_button_clicked: prompt_el.value: ', prompt_el.value);
		do_prompt(null,prompt_el.value);
	}
	else{
		console.error("prompt cannot be empty");
	}
	
}


async function do_prompt(task=null,prompt=null,negative_prompt=null){
	console.log("in do_prompt.  task,prompt,negative_prompt: ", task,prompt,negative_prompt);
	
	let new_prompt_task = {
		'prompt':null,
		'origin':'chat',
		'assistant':window.settings.assistant,
		'type':'chat',
		'state':'doing_stt',
		'desired_results':1,
		'results':[],
		'destination':'chat'
	}
	if(task != null){
		if(typeof task.index == 'number'){
			console.error("do_prompt: provided task already had an index: ", task);
			task = await add_prompt_to_task(task,prompt);
			return task;
			
		}
		else{
			new_prompt_task = {...new_prompt_task,...task}
		}
		
	}
	new_prompt_task = window.add_task(new_prompt_task);
	if(new_prompt_task){
		window.handle_completed_task(new_prompt_task,prompt);
	}
}
window.do_prompt = do_prompt;



async function add_prompt_to_task(task=null,prompt=null,negative_prompt=null){
	console.log("in  add_prompt_to_task.  task,prompt: ", task, prompt);
	if(typeof prompt != 'string'){
		if(task != null && typeof task.prompt == 'string'){
			prompt = task.prompt;
		}
		else{
			prompt = prompt_el.value;
		}
	}
	
	if(typeof prompt != 'string'){
		console.error("do_prompt: no valid prompt provided");
	}
	window.last_user_query = prompt;
	manage_prompt(prompt);
	
	let assistant_id = null;
	if(task != null && typeof task.assistant == 'string'){
		assistant_id = task.assistant;
		console.log("do_prompt: a task with an assistant was provided.  assistant_id is now: ", assistant_id);
		//manage_prompt(prompt);
	}
	else{
		assistant_id = window.settings.assistant;
		console.log("do_prompt: no task with an assistant was provided, so using window.settings.assistant.  assistant_id is now: ", assistant_id);
		//manage_prompt(prompt);
	}
	
	if(typeof assistant_id != 'string'){
		console.error("do_prompt:  aborting, assistant_id was still null. prompt: ", prompt);
		return null
	}
	
	
	
	
	if(prompt == '' && assistant_id != 'image_to_text_ocr'){
		console.error("do_prompt: prompt was empty string, aborting");
		return null
	}
	
	//window.add_chat_message(assistant_id,'user',prompt);
	
	
	if(typeof window.settings.assistants[assistant_id] != 'undefined' && window.settings.assistants[assistant_id].character == true){
		window.last_time_ai_responded[assistant_id] = Date.now();
	}
	
	
	if(assistant_id.startsWith('ollama')){
		window.add_script('./ollama_module.js',true);
	}
	
	
	let is_blueprint_prompt = false;
	if(task != null && typeof task.origin == 'string' && task.origin == 'blueprint'){
		is_blueprint_prompt = true;
	}
	
	
	window.stt_heard = null; // clear anything the STT might have heard, this is more important // deprecated
	
	let do_prompt_task = null;
	
	// S P E A K E R
	// Interactions with the special assistant that speaks text out loud
	if(assistant_id == 'speaker'){
		//console.log("do_prompt: creating speaker task");
		
		//window.currently_loaded_assistant = 'speaker';
		if(window.speaker_enabled == false){
			window.enable_speaker();
		}
		/*
		if(typeof task != 'undefined' && task != null && typeof task.origin == 'string' && (task.origin == 'voice' || task.origin == 'blueprint' || task.origin == 'chat'){
			window.add_chat_message(assistant_id,'user',prompt);
		}
		*/
		//window.add_chat_message(assistant_id,'user',prompt);
		
		do_prompt_task = {
			'prompt':null,
			'origin':'chat',
			'assistant':'speaker',
			'type':'speak',
			'state':'should_tts',
			'sentence':clean_up_string_for_speaking(prompt),
			'desired_results':0,
			'results':[],
			'destination':'audio_player'
		}
		
		
	}


	// S C R I B E
	// Interactions with the special assistant that writes down what it hears
	// TODO in theory it could be possible to intermingle transcription with comments input form the prompt_el
	else if(assistant_id == 'scribe'){
		console.warn("do_prompt: called while the current assistant is Scribe. Provided task: ", task);
		
		//insert_into_document(stt_task,'\naddendum: ' + prompt + '\n' ,{"position":"end"}); //
		if(window.busy_doing_blueprint_task && current_file_name.endsWith('.blueprint') ){
			// do not insert?
		}
		else if(window.settings.docs.open != null){
			
			// This task is only here for insert_into_document, so that the prompt can be added into the open blueprint document
			let stt_task = {
				'prompt':prompt,
				'text':prompt,
				'sentence':prompt,
				'origin':'chat',
				'assistant':'scribe',
				'type':'stt',
				'state':'doing_stt',
				'sentence':prompt,
				'desired_results':1,
				'results':[],
				'destination':'document',
				'file':window.settings.docs.open,
			}
			insert_into_document(stt_task, '\n' + prompt + '\n', {"position":"end"});
		}
		
		if(task){
			return task;
		}
	}
	
	
	
	// T R A N S L A T O R
	else if(assistant_id == 'translator'){
		//console.log("do_prompt: adding translator task");
		if(window.settings.output_language == null){
			window.settings.output_language = translation_output_language_select_el.value;
			save_settings();
		}
		//console.log("adding translator prompt to task queue.  settings.input_language,settings.output_language: ", window.settings.input_language, window.settings.output_language);
		
		if(typeof window.settings.input_language != 'string' || typeof window.settings.output_language != 'string'){
			console.error("adding translation task from submit prompt button: aborting, input language or output language was not a string: ", window.settings.input_language, window.settings.output_language);
			return task;
		}
		
		
		document.body.classList.add('doing-translation'); // this can run parallel to other LLM's, so starts immediately.
		
		do_prompt_task = {
			'prompt':null,
			'text':prompt,
			'origin':'chat',
			'assistant':'translator',
			'type':'translation',
			'state':'should_translation',
			'desired_results':1,
			'results':[],
			'input_language': window.settings.input_language,
			'output_language': window.settings.output_language,
			'translation_details':get_translation_model_details_from_select(window.settings.output_language),
			'force_webgpu':window.settings.assistants['translator'].force_webgpu,
			'destination':'chat',      //window.active_destination,
			'file':window.settings.docs.open
		};
		
		
	}
	// END OF TRANSLATOR SPECIAL ASSISTANT
	
	
	
	
	// M U S I C I A N
	// Interactions with the special assistant that speaks text out loud
	else if(assistant_id == 'musicgen'){
		console.log("do_prompt: adding musicgen task");
		
		//window.currently_loaded_assistant = 'musicgen';
		//window.enable_speaker();
		
		//window.add_chat_message('musicgen','user',prompt);
		
		
		
		do_prompt_task = {
			'prompt':prompt,
			'origin':'chat',
			'assistant':'musicgen',
			'type':'generate_audio',
			'state':'should_musicgen',
			'music_duration':window.settings.musicgen_duration,
			'desired_results':0,
			'results':[],
			'destination':'chat'
		}
		
		if(typeof window.settings.assistants['musicgen'] != 'undefined' && typeof window.settings.assistants['musicgen'].temperature == 'number'){
			//console.log("assing custom temperature to MusicGen task: ", window.settings.assistants['musicgen'].temperature);
			do_prompt_task['temperature'] = window.settings.assistants['musicgen'].temperature;
		}
		
		//add_chat_message('musicgen',new_task.assistant, new_task.sentence, null, '<div class="spinner"></div>');
		
		/*
		if(typeof task != 'undefined' && task != null){
			if(typeof task.index == 'number'){
				task = {...task,...do_prompt_task}
				do_prompt_task = task;
				//return task;
			}
			else{
				do_prompt_task = {...do_prompt_task,...task}
			}
		}
		*/
		
		
		// TODO: add duration range slider to advanced UI?
		
		//window.add_task(musicgen_task);
		//return;
		
	}
	// END OF MUSICIAN SPECIAL ASSISTANT
	
	
	
	// I M A G E R
	// Interactions with the special assistant that creates images
	else if(assistant_id == 'imager'){
		//console.log("do_prompt: adding imager task");
		
		//window.add_chat_message('imager','user',prompt);
		
		do_prompt_task = {
			'prompt':prompt,
			'origin':'chat',
			'assistant':'imager',
			'type':'image',
			'state':'should_imager',
			'sentence':prompt,
			'desired_results':1,
			'results':[],
			'destination':'chat'
		}
		
		if(typeof negative_prompt != 'string' ){
			negative_prompt = '';
		}
		if(typeof negative_prompt == 'string' && negative_prompt != ''){
			do_prompt_task['negative_prompt'] = negative_prompt;
		}
		else{
			console.error("do_prompt: imager task has no negative prompt");
		}
		
	}
	// END OF IMAGER SPECIAL ASSISTANT
	
	
	
	// TEXT TO IMAGE
	// Interactions with the special assistant that creates images
	else if(assistant_id == 'text_to_image'){
		console.log("do_prompt: adding text_to_image task. assistant_id: ", assistant_id);
		
		//window.add_chat_message('text_to_image','user',prompt);
		
		do_prompt_task = {
			'prompt':prompt,
			'origin':'chat',
			'assistant':'text_to_image',
			'type':'image',
			'state':'should_text_to_image',
			'sentence':prompt,
			'desired_results':1,
			'results':[],
			'destination':'chat'
		}
		
		if(typeof negative_prompt != 'string' ){
			negative_prompt = '';
		}
		if(typeof negative_prompt == 'string' && negative_prompt != ''){
			do_prompt_task['negative_prompt'] = negative_prompt;
		}
		else{
			console.warn("do_prompt: text_to_image task has no negative prompt");
		}
		
	}
	// END OF TEXT_TO_IMAGE SPECIAL ASSISTANT
	
	
	
	
	
	
	
	// I M A G E    T O    O C R    T E X T
	//    &
	// I M A G E   T O   T E X T
	// Interactions with the special assistant that describes images
	else if(assistant_id.startsWith('image_to_text')){
		console.log("do_prompt: adding image to text task.  assistant_id: ", assistant_id);
		
		let do_prompt_task = {
			'assistant':assistant_id,
			'state':'should_image_to_text',
			'origin':'chat',
			'destination':'chat',
			'prompt':prompt
		}
		
		
		if(assistant_id == 'image_to_text_ocr'){
			do_prompt_task['state'] = 'should_ocr';
			console.log("do_prompt: state is now 'should_ocr'");
			if(typeof task != 'undefined' && task != null && typeof task.index == 'number'){
				add_chat_message('image_to_text_ocr', 'image_to_text_ocr', '', null, '<div id="image-to-text-result-output' + task.index + '"><div class="spinner"></div></div>', task.index);
			}
		
		}
		
		if(is_blueprint_prompt){
			do_prompt_task['destination'] == 'document';
		}
		else if(assistant_id == 'image_to_text'){
			//window.add_chat_message('image_to_text','user',prompt);
		}
		
		if(typeof task != 'undefined' && task != null){
			do_prompt_task = {...task,...do_prompt_task}
		}
		console.log("image_to_text: merged do_prompt_task: ", do_prompt_task);
		
		if(document.body.classList.contains('show-camera') ){ // && document.body.classList.contains('hide-camera-still')
			const fresh_camera_blob = await window.get_camera_jpeg_blob();
			window.last_image_to_text_blob = fresh_camera_blob;
			if(window.last_image_to_text_blob != null){
				
				do_prompt_task['image_blob'] = window.last_image_to_text_blob;
				
				do_prompt_task = window.create_image_to_text_task(do_prompt_task);
			}
			else{
				flash_message(get_translation('Please_provide_an_image'),3000,'warn');
			}
			/*
			window.get_camera_jpeg_blob()
			.then((blob) => {
				window.last_image_to_text_blob = blob;
				
			})
			.catch((err) => {
				console.error("do_prompt: image_to_text: caught error from get_camera_jpeg_blob: ", err)
			});
			*/
		}
		else if(window.last_image_to_text_blob != null){
				
			do_prompt_task['image_blob'] = window.last_image_to_text_blob;
			
			if(assistant_id != 'image_to_text_ocr'){
				do_prompt_task = window.create_image_to_text_task(do_prompt_task);
			}
		}
			// TODO: check if an image is the currently open file? And then use that? Or is window.last_image_to_text_blob already set when opening a new image?
		else{
			console.error("do_prompt: image_to_text: no camera open, and no image blob");
			flash_message(get_translation('Please_provide_an_image'),3000,'warn');
			return task;
		}
		
		if(assistant_id == 'image_to_text_ocr'){
			//task = {...do_prompt_task, ...task}
			return do_prompt_task;
		}
		
	}
	// END OF IMAGE-TO-TEXT SPECIAL ASSISTANT
	
	
	
	
	// D E V E L O P E R
	// Fake interactions with the developer - a removed easter egg
	else if(assistant_id == 'developer'){
		window.add_chat_message('developer','user',prompt);
		prompt = '';
		setTimeout(() => {
			window.developer_response_count++;
			window.add_chat_message('developer','developer', window.get_translation('developer_response' + window.developer_response_count),false);
			document.body.classList.remove('waiting-for-response');
		},900);
		
		// Deprecated
		if(window.developer_response_count < 6){ // easter egg
			prompt_el.focus();
		}
		else{
			document.body.classList.add('hide-developer-prompt');
		}
		return task;
	}
	
	
	
	// R E S E A R C H E R / L I B R A R I A N
	else if(assistant_id == 'clone_researcher1'){
		//console.log("do_prompt: adding researcher task");
		
		window.add_chat_message('current','user', prompt);
		
		// TODO: check if the user has provided a list of keywords themselves, which which case the step of extracting keywords can be skipped
		
		// The reseacher first extracts a list of keywords from the user's query, and then uses that list to search for relevant files
		// TODO: how will pre-translation handle this? Currently it would (hopefully) just translate the entire prompt. But maybe it should search in the target language Wikipedia too.
		do_prompt_task = {
			'prompt':'You are a great researcher. Your task is to extract a list of keywords from the following sentence that is placed in between brackets. In the sentence the user describes a topic they are interested in. The extracted keywords must be useful for looking up information in Wikipedia. Place each keyword on a new line.\n\n<sentence>\n' + prompt + '</sentence>\n\nKeywords list: ',
			'original_prompt': prompt,
			'origin':'chat',
			'assistant':'clone_researcher1',
			'type':'research',
			'state':'should_assistant',
			'desired_results':1,
			'results':[],
			'destination':'chat',
			'q':[
				{'state':'should_research','desired_results':10},
			]
		}
		
		//window.add_task(researcher_task);
		//return;
	}
	
	
	
	
	
	else{
		console.log("do_prompt: did not have to handle a special assistant");
		//prompt_el.focus();
	}
	
	
	// DO_PROMPT - HALF WAY
	
	// If a special assistant already generated a prompt task, handle that early
	if(do_prompt_task != null){
		if(typeof task != 'undefined' && task != null){
			if(typeof task.assistant == 'string'){
				add_chat_message(task.assistant,task.assistant, prompt, null, '<div class="spinner"></div>');
			}
			if(typeof task.index == 'number'){
				task = {...task,...do_prompt_task}
				console.log("do_prompt: UPDATED TASK TO: ", JSON.stringify(task,null,2));
				
				return task;
			}
			else{
				do_prompt_task = {...do_prompt_task,...task}
				return window.add_task(do_prompt_task);
			}
		}
		else{
			console.log("do_prompt:  no valid task provided, but do_prompt_task exists: ", do_prompt_task);
			if(typeof do_prompt_task.assistant == 'string'){
				add_chat_message(do_prompt_task.assistant,do_prompt_task.assistant, prompt, null, '<div class="spinner"></div>');
			}
			return window.add_task(do_prompt_task);
		}
	}
	else{
		console.warn("do_prompt: did not handle a special AI, continuing with 'normal' text-AI prompt");
	}
	
	
	// Now we can expect a more 'traditional' inference request to a text-based AI.
	
	// Create actual prompt query
	let query = prompt;
	

	//console.log("prompt_submit_button clicked: creating task for normal text-based assistant. assistant_id: ", assistant_id);
	
	// Q U E S T I O N    A FILE ATTACHMENT
	if(question_prompt_textarea_el.value.length){
		
		window.settings.question_prompt = query;
		save_settings();
		
		// Create chat bubble
		let question_original_text_el = document.createElement('div');
		question_original_text_el.classList.add('chat-bubble-question-text-container');
		question_original_text_el.classList.add('flex');
		
		let chat_bubble_question_text_icon_el = document.createElement('div');
		chat_bubble_question_text_icon_el.classList.add('chat-bubble-question-text-icon');
		chat_bubble_question_text_icon_el.innerHTML = '<span class="unicode-icon">📄</span>';
		
		if(window.question_document != null && typeof window.question_document.filename == 'string' && typeof window.question_document.folder == 'string'){
			const my_question_document = window.question_document;
			const my_question_selection = window.question_selection;
			chat_bubble_question_text_icon_el.addEventListener('click', () => {
				//console.log("re-opening document form chat bubble question text icon. my_question_document: ", my_question_document);
				const file_path = my_question_document.folder + '/' + my_question_document.filename;
				if(typeof playground_live_backups[file_path] == 'string' || typeof playground_saved_files[file_path] == 'string'){
					open_file(my_question_document.filename,null,my_question_document.folder)
					.then((value) => {
						if(my_question_selection != null){
							scroll_to_selection(my_question_selection);
						}
					})
					.catch((err) => {
						console.error("caught error opening file from old question text link: ", err);
					})
				}
				else{
					flash_message(get_translation('The_file_is_no_longer_available'),3000,'fail');
				}
			})
		}
		question_original_text_el.appendChild(chat_bubble_question_text_icon_el);
		
		let chat_bubble_question_textarea_el = document.createElement('textarea');
		chat_bubble_question_textarea_el.classList.add('chat-bubble-question-textarea');
		chat_bubble_question_textarea_el.value = question_prompt_textarea_el.value;
		question_original_text_el.appendChild(chat_bubble_question_textarea_el);
		
		// add user chart message
		add_chat_message('current','user',query,null,question_original_text_el);
		
		let found_text_in_recent_conversation_history = false;
		if(question_prompt_textarea_el.value.length > 5){
			if(typeof window.conversations[window.settings.assistant] != 'undefined' && window.conversations[window.settings.assistant].length){
				for(let ch = window.conversations[window.settings.assistant].length - 1; ch > 0; --ch){
					//console.log("do_prompt: text/document question: previous conversation content: ", window.conversations[window.settings.assistant][ch]);
					if(typeof window.conversations[window.settings.assistant][ch].content == 'string' && window.conversations[window.settings.assistant][ch].content.length > question_prompt_textarea_el.value.length){
						if(window.conversations[window.settings.assistant][ch].content.indexOf(question_prompt_textarea_el.value) != -1){
							//console.log("do_prompt: Found text in very recent conversation history");
							found_text_in_recent_conversation_history = true;
							break
						}
					}
					
					if(ch < window.conversations[window.settings.assistant].length - 5){
						//console.log("do_prompt: did not find text in very recent conversation history");
						break
					}
				}
			}
		}
		
		//if(window.question_text){
		if(found_text_in_recent_conversation_history == false){
			//question_query = get_translation('Read_the_following_text_between_the_context_HTML_tags_first_and_use_it_to_answer_the_request') + '.';
			question_query = "Read the following text between the \'context\' HTML tags first and use it to answer the request."; // It will likely have to be translated into English first anyway, and then the tranlation worker can detect that this sentence is already in the desired language, thus skipping a little translation effort.
		
			question_query += '\n\n<context>\n' + question_prompt_textarea_el.value; //window.question_text;
			if(!question_prompt_textarea_el.value.endsWith('\n')){
				question_query += '\n';
			}
			question_query += '<context>\n\n' + get_translation('Request') + ':\n';
			//question_query += query + '\n';
		}
		question_query += query + '\n';
		
		
		// direct prompt task, so need to route it through STT first, since it cannot be a STT command
		
		let question_task = {
			'prompt':question_query,
			//'original_prompt':query,
			//'text':question_prompt_textarea_el.value,
			'origin':'chat',
			'type':'chat',
			'state':'should_assistant',
			'desired_results':1,
			'results':[],
			'destination':'chat',
			//'q':[{'state':'hoera','type':'hoera'}]
		}
		
		if(assistant_id.startsWith('ollama')){
			question_task['runner'] = 'ollama';
		}
		
		
		window.question_text = null;
		// experiment: wait until the user clears the attachment manually
		//window.question_document = null;
		//window.question_selection = null;
		//document.body.classList.remove('text-attached');
		
		if(task != null){
			//console.log("do_prompt: overwriting question_task with initialy provided task: ", task);
			// overwrite the prompt task with any task data that was provided initially. E.g. type=blueprint, or an existing task index or destination
			if(typeof task.index == 'number'){
				task = {...task,...question_task}
				return task;
			}
			else{
				question_task = {...question_task,...task};
				return window.add_task(question_task);
			}
			
		}
		else{
			return window.add_task(question_task);
		}
		//console.log("do_prompt: adding question task to queue: ", question_task);
		
		
		
	}
	
	// Normal simple prompt is first routed through the STT pipeline to detect any commands, such as 'create a timer'.
	// TODO: Could this have unforeseen consequences? Users may not expect their prompt to be parsed as a voice command.
	// This could be alleviated by making the STT pipeline check for 'task.origin == voice' more.
	else{
		
		let chat_prompt_task = {
			'prompt':null,
			'raw_prompt':query,
			//'origin':'chat',
			'type':'chat',
			//'state':'doing_stt',
			'desired_results':1,
			'results':[],
			//'destination':'chat',
		}
		if(window.settings.docs.open != null){
			chat_prompt_task['file'] = window.settings.docs.open;
		}
		if(assistant_id.startsWith('ollama')){
			question_task['runner'] = 'ollama';
		}
		
		
		if(task != null){
			if(typeof task.index == 'number'){
				//task = {...task,...chat_prompt_task}
				task['prompt'] = query;
				task['raw_prompt'] = query;
				task['type'] = 'chat';
				task['state'] = 'should_assistant';
				if(typeof task.destination == 'undefined'){
					task['destination'] = 'chat';
				}
				if(typeof task.origin != 'string'){
					task['origin'] = 'chat';
				}
				
				
				//add_chat_message(assistant_id,'user',prompt);
				return task;
			}
			else{
				
				
				chat_prompt_task = {...chat_prompt_task,...task};
				chat_prompt_task['type'] = 'chat';
				if(typeof chat_prompt_task.destination == 'undefined'){
					chat_prompt_task['destination'] = 'chat';
				}
				if(typeof chat_prompt_task.origin != 'string'){
					chat_prompt_task['origin'] = 'chat';
				}
				chat_prompt_task['state'] = 'doing_stt';
				chat_prompt_task = window.add_task(chat_prompt_task);
				window.handle_completed_task(chat_prompt_task,query);
			}
			//console.log("do_prompt: overwriting chat_prompt_task with initialy provided task: ", task);
			// overwrite the prompt task with any task data that was provided initially. E.g. type=blueprint, or an existing task index or destination
			
		}
		else{
			chat_prompt_task = {...chat_prompt_task,...task};
			chat_prompt_task['type'] = 'chat';
			if(typeof chat_prompt_task.destination == 'undefined'){
				chat_prompt_task['destination'] = 'chat';
			}
			if(typeof chat_prompt_task.origin != 'string'){
				chat_prompt_task['origin'] = 'chat';
			}
			chat_prompt_task['state'] = 'doing_stt';
			chat_prompt_task = window.add_task(chat_prompt_task);
			window.handle_completed_task(chat_prompt_task,query);
		}
		
		
	}
	
	return task;
}
window.do_prompt = do_prompt;


question_prompt_clear_button_el.addEventListener("click", (event) => {
	//console.log("clear question prompt textarea button clicked");
	
	event.stopPropagation();
	event.preventDefault();
	
	question_prompt_document_title_el.innerHTML = '';
	question_prompt_textarea_el.value = '';
	
	window.question_text = null;
	window.question_document = null;
	window.question_selection = null;
	document.body.classList.remove('text-attached');
	window.manage_prompt();
});



let prevent_propagation_els = document.querySelectorAll('.prevent-propagation');
for(let pp = 0; pp < prevent_propagation_els.length; pp++){
	prevent_propagation_els[pp].addEventListener('mousedown', (event) => {
		event.stopPropagation();
	},{passive: true})
	prevent_propagation_els[pp].addEventListener('mouseUp', (event) => {
		event.stopPropagation();
	},{passive: true})
	prevent_propagation_els[pp].addEventListener('click', (event) => {
		//console.log("dialog:preventing propagation");
		event.stopPropagation();
	},{passive: true})
	prevent_propagation_els[pp].addEventListener('touchstart', (event) => {
		event.stopPropagation();
	},{passive: true})
	prevent_propagation_els[pp].addEventListener('touchend', (event) => {
		event.stopPropagation();
	},{passive: true})
	prevent_propagation_els[pp].addEventListener('touchmove', (event) => {
		event.stopPropagation();
	},{passive: true})
	prevent_propagation_els[pp].addEventListener('touchcancel', (event) => {
		event.stopPropagation();
	},{passive: true})
}


let all_dialog_els = document.querySelectorAll('dialog');
for(let de = 0; de < all_dialog_els.length; de++){
	const this_dialog = all_dialog_els[de];
	this_dialog.addEventListener('mousedown', (event) => {
		event.stopPropagation();
		dialogClickHandler(event);
		//this_dialog.removeAttribute('open');
	},{passive: true});
	this_dialog.addEventListener('mouseUp', (event) => {
		event.stopPropagation();
		dialogClickHandler(event);
		//this_dialog.removeAttribute('open');
	},{passive: true});
	this_dialog.addEventListener('click', (event) => {
		event.stopPropagation();
		dialogClickHandler(event);
		//this_dialog.removeAttribute('open');
	},{passive: true});
	this_dialog.addEventListener('touchstart', (event) => {
		event.stopPropagation();
		dialogClickHandler(event);
		//this_dialog.removeAttribute('open');
	},{passive: true});
	this_dialog.addEventListener('touchend', (event) => {
		event.stopPropagation();
		dialogClickHandler(event);
		//this_dialog.removeAttribute('open');
	},{passive: true});
	this_dialog.addEventListener('touchmove', (event) => {
		event.stopPropagation();
		dialogClickHandler(event);
		//this_dialog.removeAttribute('open');
	},{passive: true});
	this_dialog.addEventListener('touchcancel', (event) => {
		event.stopPropagation();
		dialogClickHandler(event);
		//this_dialog.removeAttribute('open');
	},{passive: true});
}

function dialogClickHandler(e) {
    if (e.target.tagName !== 'DIALOG') //This prevents issues with forms
        return;

    const rect = e.target.getBoundingClientRect();

    const clickedInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
    );

    if (clickedInDialog === false){
		e.target.close();
    	document.body.classList.remove('busy-editing-assistant');
		document.body.classList.remove('busy-editing-received-ai');
    }
        
}



//
//   DOCUMENT LISTENERS
//

current_folder_el.addEventListener("click", (event) => {
	give_attention_to_file();
});

current_file_name_el.addEventListener("click", (event) => {
	give_attention_to_file();
});

function give_attention_to_file(){
	//console.log("in give_attention_to_file");
	open_sidebar();
	window.show_files_tab();
	let current_file_name_el = document.querySelector('.file-item.current');
	if(current_file_name_el){
		current_file_name_el.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
		current_file_name_el.classList.add("get-attention");
		setTimeout(() => {
			current_file_name_el.classList.remove("get-attention");
		},1000);
	}
	//console.log("window.doc_current_line_nr: ", window.doc_current_line_nr);
	if(typeof window.doc_current_line_nr == 'number'){
		scroll_to_line(window.doc_current_line_nr);
	}
}


// Close buttons


document.getElementById('close-document-view').addEventListener("click", (event) => {
	event.stopPropagation();
	close_document_view();
});


function close_document_view(){
	//console.log("clicked on close document view button");
	document.body.classList.remove('show-document');
	document.body.classList.remove('working-on-doc');
	document.body.classList.remove('blueprint');
	document.body.classList.remove('zip-file');
	document.body.classList.remove("viewing-image");
	document.body.classList.remove('image-editor');
	document.body.classList.remove('javascript-document');
	
	document.body.classList.remove('show-rewrite');
	document.body.classList.remove('prepare-translate-document');
	document.body.classList.remove('prepare-summarize-document');
	
	playground_overlay_el.innerHTML = '';
	current_file_name = unsaved_file_name;
	
	window.doc_reset();
	window.settings.docs.open = null;
	window.save_settings();
	if(window.playing_document){
		//console.log("the document that was closed was playing, so also calling stop_play_document");
		stop_play_document();
	}
	remove_highlight_selection();
	window.active_destination = 'chat';
}


close_full_playground_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on close fullscreen playground overlay button");
	document.body.classList.remove('full-playground-overlay');
});


proofread_selection_button_el.addEventListener("mousedown", (event) => {
	event.stopPropagation();
	event.preventDefault();
	//console.log("clicked on proofread selection button");
	//hide_doc_selection_hint();
	prepare_proofread();
	//proofread_selection();
	document.body.classList.add('show-rewrite');
});

rewrite_selection_button_el.addEventListener("mousedown", (event) => {
	event.stopPropagation();
	event.preventDefault();
	//console.log("clicked on rewrite selection button");
	//hide_doc_selection_hint();
	prepare_rewrite();
});

summarize_selection_button_el.addEventListener("mousedown", (event) => {
	event.stopPropagation();
	event.preventDefault();
	//console.log("clicked on summarize selection button");
	//hide_doc_selection_hint();
	prepare_summarize();
});

translate_selection_button_el.addEventListener("mousedown", (event) => {
	event.stopPropagation();
	event.preventDefault();
	//console.log("clicked on translate selection button");
	//hide_doc_selection_hint();
	prepare_translation();
});

question_selection_button_el.addEventListener("mousedown", (event) => {
	event.stopPropagation();
	event.preventDefault();
	//console.log("clicked on question selection button");
	//hide_doc_selection_hint();
	prepare_question();
	prompt_el.focus();
	prompt_el.click();
	if(window.innerWidth < 641){
		document.body.classList.remove('show-document');
	}
});

speak_selection_button_el.addEventListener("mousedown", (event) => {
	event.stopPropagation();
	event.preventDefault();
	//console.log("clicked on speak selection button");
	//hide_doc_selection_hint();
	//speak_selection();
	start_play_document();
});



document_form_notifications_container_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on document notifications container");
	document_form_notifications_container_el.innerHTML = '';
});



document_search_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on document-search button");
	open_sidebar();
	document.body.classList.remove('sidebar-chat');
	document.body.classList.remove('sidebar-settings');
	clear_rag_search();
	show_rag_search();
	rag_search_prompt_el.focus();
});



document_question_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on document-question button");
	
	//hide_doc_selection_hint();
	if(typeof window.doc_selected_text == 'string' && window.doc_selected != null){
		prepare_question();
	}
	else if(typeof window.doc_text == 'string'){
		prepare_question(window.doc_text);
	}
	else{
		console.error("No open document? How is this possible");
		return false;
	}
	possibly_hide_sidebar();
	
	if(window.innerWidth < 641){
		document.body.classList.remove('show-document');
	}
	else{
		window.unshrink_chat();
	}
	prompt_el.focus();
	prompt_el.click();
});

document_proofread_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on document-proofread button");
	possibly_hide_sidebar();
	//hide_doc_selection_hint();
	//proofread_selection();
	prepare_proofread();
	
	if(window.busy_doing_blueprint_task == false && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
		flash_message(get_translation("Added_command_to_blueprint"),1000);
		insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, '\n\nProofread\n\n');
	}
	
});

document_continue_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on document-continue button");
	possibly_hide_sidebar();
	//hide_doc_selection_hint();
	continue_document();
	
	if(window.busy_doing_blueprint_task == false && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
		flash_message(get_translation("Added_command_to_blueprint"),1000);
		insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, '\n\nContinue\n\n');
	}
});

document_summarize_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on document-summarize button");
	//hide_doc_selection_hint();
	possibly_hide_sidebar();
	if(typeof window.doc_selected_text == 'string'){
		prepare_summarize();
	}
	else{
		prepare_summarize_document();
	}
	
	if(window.busy_doing_blueprint_task == false && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
		flash_message(get_translation("Added_command_to_blueprint"),1000);
		insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, '\n\nSummarize\n\n');
	}
	
});

// TODO: add rewrite button in footer
// TODO: allow complete document rewrite

document_translate_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on document-translate button");
	possibly_hide_sidebar();
	//hide_doc_selection_hint();
	if(typeof window.doc_selected_text == 'string'){
		
		prepare_translation();
	}
	else{
		prepare_translate_document();
	}
	
	if(window.busy_doing_blueprint_task == false && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
		flash_message(get_translation("Added_command_to_blueprint"),1000);
		insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, '\n\nTranslate\n\n');
	}
	
});


function possibly_hide_sidebar(){
	document.body.classList.remove('prepare-translate-document');
	document.body.classList.remove('prepare-summarize-document');
	if(window.innerWidth < 980){
		close_sidebar();
		document.body.classList.remove('sidebar-shrink');
	}
}



summarize_new_file_container_close_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on close document-summarize button");
	document.body.classList.remove('prepare-summarize-document');
});

translation_new_file_container_close_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on close document-translate button");
	document.body.classList.remove('prepare-translate-document');
});


undo_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on document undo button");
	hide_doc_selection_hint();
	editor_undo();
});

redo_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on document redo button");
	hide_doc_selection_hint();
	editor_redo();
});




message_downloads_container_el.addEventListener("click", (event) => {
	if(window.innerWidth < 641){
		message_downloads_container_el.classList.add('unshrink-downloads-container');
		setTimeout(() => {
			message_downloads_container_el.classList.remove('unshrink-downloads-container');
		},5000);
	}
});

shrink_assistant_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on shrink assistant button");
	window.shrink_chat();
});

window.shrink_chat = function(){
	//console.log("in shrink_chat");
	
	if(window.innerWidth < 641 && document.body.classList.contains('show-document')){
		close_document_view();
	}
	document.body.classList.add('chat-shrink');
	window.settings.chat_shrink = true;
	save_settings();
}
window.unshrink_chat = function(){
	//console.log("in unshrink_chat");
	document.body.classList.remove('chat-shrink');
	window.settings.chat_shrink = false;
	save_settings();
}


mobile_back_to_document_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on mobile back to document button");
	document.body.classList.add('show-document');
	if(window.settings.docs.open == null){
		
		let latest_file = null;
		if(typeof window.settings.docs.last_opened != 'undefined' && typeof window.settings.docs.last_opened.folder == 'string' && typeof window.settings.docs.last_opened.filename == 'string' && typeof playground_live_backups[window.settings.docs.last_opened.folder + '/' + window.settings.docs.last_opened.filename] == 'string'){
			//console.log("opening last_opened: ", window.settings.docs.last_opened.filename);
			open_file(window.settings.docs.last_opened.filename,null,window.settings.docs.last_opened.folder);
			return
		}
		else{
			//console.log("keyz(files): ", files);
			if(typeof files != 'undefined' && files != null){
				if(typeof current_file_name == 'string' && current_file_name != '_playground_notepad.txt'){
					latest_file = current_file_name;
				}
				else{
					latest_file = keyz(files)[0]; //files[];
					if(latest_file == '_playground_notepad.txt'){
						if(keyz(files).length > 1){
							latest_file = keyz(files)[1];
						}
						else{
							latest_file = null;
						}
				
					}
				}
			
				//console.log("latest_file: ", latest_file);
				if(typeof latest_file == 'string'){
					open_file(latest_file,null,folder);
					return
				}
				else{
					console.error("latest_file.filename was not a string");
				}
			}
			create_new_document();
		}
		
	}
});


stop_assistant_icon_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	event.preventDefault();
	//console.log("clicked on stop assistant button");
	console.log("clicked on stop assistant - assistant icon");
	
	// TODO this was never a good idea, but now that icons are set separately, it's even worse
	let assistant_id = stop_assistant_button_assistant_icon_el.src.replace('_thumb.png','');
	assistant_id = assistant_id.substr(assistant_id.lastIndexOf('/') + 1);
	console.log("clicked on stop assistant assistant icon. Switch to that AI?: extracted assistant_id: ", assistant_id);
	if(typeof window.assistants[assistant_id] != 'undefined' || typeof window.settings.assistants[assistant_id] != 'undefined'){
		switch_assistant(assistant_id);
	}
	else{
		console.error("did not extract valid AI from stop button image src: ", assistant_id);
	}
	
	
});

stop_assistant_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on stop assistant button");
	window.stop_assistant();
});

clear_assistant_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on clear assistant button");
	window.clear_assistant();
});


prompt_at_line_submit_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on do prompt at line button");
	do_prompt_at_line();
});


code_output_close_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on close code output sidebar button");
	codeOutput.innerHTML = '';
});

close_tools_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on close tools button");
	document.body.classList.remove('show-rewrite');
	document.body.classList.remove('prepare-summarize-document');
	document.body.classList.remove('prepare-translate-document');
	window.only_allow_voice_commands = false;
	document.body.classList.remove('show-camera');
	remove_highlight_selection();
});



//
//  TOOLS:  SUBMIT REWRITE TASKS
//

// Close the other details elements
summarize_details_el.addEventListener("click", (event) => {
	rewrite_details_el.removeAttribute('open');
	proofread_details_el.removeAttribute('open');
});
rewrite_details_el.addEventListener("click", (event) => {
	summarize_details_el.removeAttribute('open');
	proofread_details_el.removeAttribute('open');
});
proofread_details_el.addEventListener("click", (event) => {
	summarize_details_el.removeAttribute('open');
	rewrite_details_el.removeAttribute('open');
	translation_details_el.removeAttribute('open');
	document.body.classList.remove('prepare-summarize-document');
	document.body.classList.remove('prepare-translate-document');
});
translation_details_el.addEventListener("click", (event) => {
	proofread_details_el.removeAttribute('open');
});

// Lies on top of the sidebar document tab button, in the top left, and it only visible when a rewrite/summarize/etc task is complete
rewrite_results_ready_container_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on open rewrite dialog button");
	rewrite_details_el.removeAttribute('open');
	proofread_details_el.removeAttribute('open');
	summarize_details_el.removeAttribute('open');
	translation_details_el.removeAttribute('open');
	model_info_container_el.innerHTML = '';
	document.body.classList.add('show-rewrite');
	//document.body.classList.remove('show-rewrite-results');
	remove_highlight_selection();
	if(window.innerWidth < 981){
		close_sidebar();
	}
});


close_rewrite_dialog_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on close rewrite dialog button");
	document.body.classList.remove('show-rewrite');
	//document.body.classList.remove('show-rewrite-results');
	remove_highlight_selection();
	doc_updated();
});



document.getElementById('dialog-rewrite-submit-prompt-button').addEventListener("click", (event) => {
	event.stopPropagation();
	submit_rewrite_task(1);
});

document.getElementById('dialog-rewrite-2x-submit-prompt-button').addEventListener("click", (event) => {
	event.stopPropagation();
	submit_rewrite_task(2);
});

document.getElementById('dialog-rewrite-4x-submit-prompt-button').addEventListener("click", (event) => {
	event.stopPropagation();
	submit_rewrite_task(4);
});

document.getElementById('dialog-rewrite-submit-prompt-lucky-button').addEventListener("click", (event) => {
	event.stopPropagation();
	submit_rewrite_task(1,true);
});


function submit_rewrite_task(desired_rewrite_count=1,feeling_lucky=false){
	//console.log("in submit_rewrite_task. desired number of rewrite options,feeling_lucky: ", desired_rewrite_count,feeling_lucky );
	//console.log("window.currently_loaded_assistant: ", window.currently_loaded_assistant);
	if(typeof desired_rewrite_count == 'number'){
		
		// For now this doesn't really form a chain yet, but that is the intention. At least.. if the results are good enough to warrant that.
		if(proofread_details_el.open && desired_rewrite_count > 1){
			desired_rewrite_count = 1;
		}
		
		//proofread_selection();
		//window.settings.proofread_prompt = window.proofread_prompt_el.value;
		
		if(proofread_details_el.open && (rewrite_details_el.open || summarize_details_el.open || translation_details_el.open)){
			//console.log("submit_rewrite_task: forcing feeling lucky because proofread was also open");
			feeling_lucky = true;
		}
		
		// If proofread is open
		if(proofread_details_el.open){
			
			if(rewrite_details_el.open || summarize_details_el.open || translation_details_el.open){
				console.error("submit_rewrite_task: proofread details was open, but other details elements were also open");
			}
			else{
				// Only proofread details is open
				//console.log("submit_rewrite_task: basic proofread task");
				//proofread_selection();
			}
			
			proofread_selection(null,null,feeling_lucky);
		}
		
		else if(summarize_details_el.open){ 
			//console.log("submit_rewrite_task: summarize details was open");
			summarize_selection();
			
		}
		else if(rewrite_details_el.open && (rewrite_prompt_el.value == get_translation('rewrite_the_following_text') || rewrite_prompt_el.value.trim().length < 5 )){
			flash_message(get_translation('Please_describe_how_the_text_should_be_rewritten'),4000,'warn');
		}
		
		else if(rewrite_details_el.open){ //  && rewrite_prompt_el.value != get_translation('rewrite_the_following_text')
			//console.log("submit_rewrite_task: rewrite details was open");
			/*
			if(window.currently_loaded_assistant == null){
				flash_message(get_translation('Please_load_an_AI_first'),4000,'warn');
				document.body.classList.add('sidebar-chat');
				if(window.innerWidth > 900){
					open_sidebar();
				}
			}
			
			else 
			*/
			
			if(!rewrite_selection('rewrite', rewrite_dialog_selected_text_el.textContent, desired_rewrite_count, null,null,feeling_lucky)){
				flash_message(get_translation("Could_not_start_task"),2000,'fail');
			}
			
		}
		else if(translation_details_el.open){
			//console.log("submit_rewrite_task: rewrite details was closed, but translation was open");
			
			if(document.body.classList.contains('prepare-translate-document')){
				//console.log("submit_rewrite_task: calling translate_document");
				translate_document();
			}
			else{
				//console.log("submit_rewrite_task -> calling translate_selection");
				translate_selection(null, desired_rewrite_count,null,feeling_lucky); // text=null,desired_count=1,task=null,feeling_lucky=false
			}
			
		}
		else{
			console.error("submit_rewrite_task; fell through");
		}
	}
	
}







/*  CREATE CUSTOM AI  */

add_custom_ai_next_button_el.addEventListener("click", (event) => {
	//console.log("Click on next custom AI button");
	
	if(new_custom_ai_model_name_el.value == ''){
		const custom_ai_error_hint_el = document.getElementById('new-custom-ai-error-hint');
		if(custom_ai_error_hint_el){
			custom_ai_error_hint_el.textContent = get_translation("Please_provide_a_name");
			setTimeout(() => {
				custom_ai_error_hint_el.textContent = '';
			},5000);
		}
		
		//flash_message(get_translation("Please_provide_a_name"),3000,'fail');
		event.preventDefault();
	}
	
	custom_ai_next();
});


const new_custom_ai_model_name_el = document.getElementById('new-custom-ai-model-custom_name');
const new_custom_ai_model_description_el = document.getElementById('new-custom-ai-model-custom_description');
const new_custom_ai_model_emoji_el = document.getElementById('new-custom-ai-model-emoji');


new_custom_ai_model_name_el.addEventListener('input', () => {
	//console.log("new model name changed: ", new_custom_ai_model_name_el.value);
	if(new_custom_ai_model_name_el.value.length){
		
		if(new_custom_ai_model_name_el.value.trim().length > 20){
			//flash_message(get_translation("The_name_is_too_long"),3000,'error');
			new_custom_ai_model_name_el.value = new_custom_ai_model_name_el.value.trim().substr(0,20);
			new_custom_ai_model_name_el.classList.add('red-border');
			setTimeout(() => {
				new_custom_ai_model_name_el.classList.remove('red-border');
			},1000);
			return
		}
		
		//window.settings.assistants[window.settings.assistant]['custom_name'] = save_received_name_el.value;
		//window.assistants[window.settings.assistant]['custom_name'] = save_received_name_el.value;
		//save_settings();
		//generate_ui();
	}
});

new_custom_ai_model_description_el.addEventListener('input', () => {
	//console.log("new model description changed: ", new_custom_ai_model_description_el.value);
	if(new_custom_ai_model_description_el.value.length){
		
		if(new_custom_ai_model_description_el.value.trim().length > 50){
			//flash_message(get_translation("The_name_is_too_long"),3000,'error');
			new_custom_ai_model_description_el.value = new_custom_ai_model_description_el.value.trim().substr(0,50);
			new_custom_ai_model_description_el.classList.add('red-border');
			setTimeout(() => {
				new_custom_ai_model_description_el.classList.remove('red-border');
			},1000);
			return
		}
		
		//window.settings.assistants[window.settings.assistant]['custom_name'] = save_received_name_el.value;
		//window.assistants[window.settings.assistant]['custom_name'] = save_received_name_el.value;
		//save_settings();
		//generate_ui();
	}
});



function custom_ai_next(){
	//console.log("in custom_ai_next");
	
	let updated_ai_details = {
		'emoji': '🦜',
		'emoji_bg':'#000000'
	}
	
	if(new_custom_ai_model_name_el.value == ''){
		const custom_ai_error_hint_el = document.getElementById('new-custom-ai-error-hint');
		if(custom_ai_error_hint_el){
			custom_ai_error_hint_el.textContent = get_translation("Please_provide_a_name");
			setTimeout(() => {
				custom_ai_error_hint_el.textContent = '';
			},5000);
		}
		//flash_message(get_translation("Please_provide_a_name"),3000,'fail');
		return false
	}
	
	
	let existing_assistant_id = null;
	for (const [assistant_id, details] of Object.entries(window.settings.assistants)) {
		if(typeof details.custom_name == 'string' && new_custom_ai_model_name_el.value.toLowerCase() == details.custom_name.toLowerCase()){
			//console.log("the AI custom_name already exists: ", details.custom_name, " -> ", assistant_id);
			existing_assistant_id = assistant_id;
			break
		}
		if(typeof details.custom_name == 'string' && get_translation(assistant_id + "_name").toLowerCase() == details.custom_name.toLowerCase()){
			existing_assistant_id = assistant_id;
			//console.log("the AI name already exists as a translation: ", details.custom_name, " -> ", assistant_id);
			break
		}
	}
	
	let is_new_ai = false;
	// Establish a base assistant dictionary first
	if(typeof existing_assistant_id != 'string'){
		//console.log("custom_ai_next: existing_assistant_id was not a string");
		//console.log("custom_ai_next: window.ai_being_edited: ", window.ai_being_edited);
		is_new_ai = true;
		
		// Creating a brand new AI / Clone
		existing_assistant_id = 'custom_saved_' + makeid(8) + '_' + new_custom_ai_model_name_el.value.trim().replaceAll(' ','_');
		
		if(typeof window.ai_being_edited == 'string' && window.ai_being_edited.length && typeof window.assistants[window.ai_being_edited] != 'undefined'){
			//console.log("custom_ai_next:  window.ai_being_edited: ", window.ai_being_edited);
			updated_ai_details = JSON.parse(JSON.stringify(window.assistants[window.ai_being_edited]));
			
			if(typeof updated_ai_details['clone_original'] == 'undefined'){
				updated_ai_details['clone_original'] = window.ai_being_edited;
			}
			if(window.ai_being_edited != 'custom_received' && typeof window.settings.assistants[window.ai_being_edited] != 'undefined'){
				updated_ai_details = {...updated_ai_details, ...window.settings.assistants[window.ai_being_edited]} // use the AI that was being edited as the base for the new AI
				updated_ai_details['clone'] = true;
			}
			if(typeof updated_ai_details['clone'] == 'undefined'){
				updated_ai_details['clone'] = true;
			}
			if(typeof updated_ai_details['clone_original'] == 'undefined'){
				updated_ai_details['clone_original'] = window.ai_being_edited;
			}
		}
		else{
			const optimal_assistant_id = pick_optimal_text_ai();
			//console.log("custom_ai_next: picked this optimal_assistant_id as the basis for the new AI: ", optimal_assistant_id);
			
			if(typeof window.assistants[optimal_assistant_id] != 'undefined'){
				updated_ai_details = JSON.parse(JSON.stringify(window.assistants[optimal_assistant_id]));
			}
			
			if(typeof window.settings.assistants[optimal_assistant_id] != 'undefined'){
				updated_ai_details = {...updated_ai_details, ...window.settings.assistants[optimal_assistant_id]} // use the AI that was being edited as the base for the new AI
			}
			if(typeof updated_ai_details['clone'] == 'undefined'){
				updated_ai_details['clone'] = true;
			}
			if(typeof updated_ai_details['clone_original'] == 'undefined'){
				updated_ai_details['clone_original'] = optimal_assistant_id;
			}
		}
		
	}
	else{
		// editing an existing AI
		//console.log("custom_ai_next: editing an existing AI");
		updated_ai_details = window.assistants[existing_assistant_id];
		if(typeof window.settings.assistants[existing_assistant_id] != 'undefined'){
			updated_ai_details = {...updated_ai_details, ...window.settings.assistants[existing_assistant_id]} // The name is the same as an existing AI, so assuming that one is being edited
		}
	}
	
	// The (new) AI exists now, so set the (new) ID as the one being edited
	window.ai_being_edited = existing_assistant_id;
	
	
	// Add the info from the first dialog (name, description, icon)
	updated_ai_details['custom_name'] = new_custom_ai_model_name_el.value;
	updated_ai_details['custom_description'] = new_custom_ai_model_description_el.value;
	
	let emoji_editor_input_el = document.getElementById('new-custom-ai-model-emoji');
	let emoji_editor_bg_el = document.getElementById('new-custom-ai-model-emoji_bg');
	if(emoji_editor_input_el){
		if(typeof emoji_editor_input_el.textContent == 'string' && emoji_editor_input_el.textContent != ''){
			updated_ai_details['emoji'] = emoji_editor_input_el.textContent.substr(0,4);
		}
		if(emoji_editor_bg_el){
			updated_ai_details['emoji_bg'] = emoji_editor_bg_el.value;
		}
	}
	
	//console.log("custom_ai_next: about to save this assistant: ", existing_assistant_id, updated_ai_details);
	if(save_edited_ai(updated_ai_details,existing_assistant_id)){
		if(is_new_ai){
			//flash_message(get_translation('A_new_AI_has_been_created')); // can't be seen behind dialog blur
			switch_assistant(existing_assistant_id);
		}
	}
	else{
		flash_message(get_translation('An_error_occured'),2000,'fail');
	}
	
	// TODO: Why bring this over to the next dialog manually? Should the next dialog load based on the newly created assistant? Then again, it might come with some existing system_prompt or second_prompt
	if(emoji_editor_input_el){
		share_prompt_assistant_emoji_el.textContent = emoji_editor_input_el.textContent;
	}
	if(emoji_editor_bg_el){
		share_prompt_assistant_emoji_el.style['background-color'] = emoji_editor_bg_el.value;
	}
	
	share_prompt_assistant_name_el.textContent = new_custom_ai_model_name_el.value;
	
	let runner = get_task_runner({'assistant':existing_assistant_id});
	share_prompt_dialog_el.classList.add('runner-' + runner.replaceAll(' ','_'));
	
	new_custom_ai_dialog_el.close();
	
	share_prompt_dialog_el.showModal();
}


function save_edited_ai(details=null,assistant_id=null){
	if(typeof details != 'object' || details == null){
		console.error("save_edited_ai: no valid details to save provided");
		return false
	}
	if(typeof assistant_id != 'string' && typeof window.ai_being_edited == 'string'){
		console.error("save_edited_ai:  no assistant_id provided, falling back to window.ai_being_edited: ", window.ai_being_edited);
		assistant_id = window.ai_being_edited;
	}
	//console.log("in save_edited_ai.  assistant_id,details: ", assistant_id, details);
	if(typeof assistant_id == 'string'){
		if(typeof window.settings.assistants[assistant_id] == 'undefined'){
			console.warn("save_edited_ai:  had to create empty dict in window.settings.assistants first");
			window.settings.assistants[assistant_id] = {};
			really_generate_ui(); // this should generate the missing chat pane
		}
		window.settings.assistants[assistant_id] = {...window.settings.assistants[assistant_id], ...details};
		save_settings();
		
		if(assistant_id != window.settings.assistant){
			switch_assistant(assistant_id,true);
		}
		
		if(typeof window.received_prompt == 'string'){
			show_received_prompt();
		}
		
		//console.log("save_edited_ai:  OK, SAVED");
		return true
	}
	else{
		console.error("save_edited_ai: no valid assistant_id, cannot save. details: ", details);
	}
	return false
}



//
//  SHARE PROMPT LINK
//

share_prompt_show_more_options_button_el.addEventListener("click", () => {
	//console.log("clicked on share_prompt_show_more_options_button_el");
	document.body.classList.add('show-more-share-options');
	//update_assistant_property('example_prompt', share_prompt_input_el.value); // on assistants with example_input it's always a dictionary with language options. Could perhaps change the current language one.. why though.
});

share_prompt_dialog_done_button_el.addEventListener("click", () => {
	console.log("clicked on share prompt done button");
	document.body.classList.remove('busy-editing-assistant');
	document.body.classList.remove('busy-editing-received-ai');
	
	if(typeof window.received_prompt == 'string'){
		console.log("there is a received prompt to handle next");
		show_received_prompt();
	}
	//update_assistant_property('example_prompt', share_prompt_input_el.value); // on assistants with example_input it's always a dictionary with language options. Could perhaps change the current language one.. why though.
});


run_the_received_prompt_button_el.addEventListener("click", () => {
	console.log("clicked on run received prompt button");
	document.body.classList.remove('received-prompt');
	do_prompt({'assistant':window.settings.assistant},received_prompt_textarea_el.value);
	//window.received_prompt = null;
	//update_assistant_property('example_prompt', share_prompt_input_el.value); // on assistants with example_input it's always a dictionary with language options. Could perhaps change the current language one.. why though.
});



share_prompt_input_el.addEventListener("input", (event) => {
	//console.log("share_prompt_input_el value changed to: ", share_prompt_input_el.value);
	create_share_prompt_link();
	//update_assistant_property('example_prompt', share_prompt_input_el.value); // on assistants with example_input it's always a dictionary with language options. Could perhaps change the current language one.. why though.
});
share_prompt_model_download_url_el.addEventListener("input", (event) => {
	//console.log("share_prompt_model_download_url_el value changed to: ", share_prompt_model_download_url_el.value);
	create_share_prompt_link();
	update_assistant_property('download_url', share_prompt_model_download_url_el.value);
});
share_prompt_model_config_url_el.addEventListener("input", (event) => {
	//console.log("share_prompt_model_config_url_el value changed to: ", share_prompt_model_config_url_el.value);
	create_share_prompt_link();
	update_assistant_property('config_url', share_prompt_model_config_url_el.value);
});


share_prompt_model_system_prompt_el.addEventListener("input", (event) => {
	//console.log("share_prompt_model_system_prompt_el value changed to: ", share_prompt_model_system_prompt_el.value);
	
	update_assistant_property('system_prompt', share_prompt_model_system_prompt_el.value);
	create_share_prompt_link();
});
share_prompt_model_second_prompt_el.addEventListener("input", (event) => {
	//console.log("share_prompt_model_second_prompt_el value changed to: ", share_prompt_model_second_prompt_el.value);
	
	update_assistant_property('second_prompt', share_prompt_model_second_prompt_el.value);
	create_share_prompt_link();
});


document.getElementById('share-prompt-copy-to-clipboard-button').addEventListener("click", (event) => {
	//console.log("copying to clipboard");
	navigator.clipboard.writeText(share_prompt_link_el.innerText);
	share_prompt_dialog_el.close();
	flash_message(get_translation("Copied_link_to_clipboard"));
});



function update_assistant_property(property,value){
	//console.log("in update_assistant_property:  property,value", property,value);
	
	if(typeof window.ai_being_edited == 'string' && window.ai_being_edited.length && typeof property == 'string' && property.length && typeof value == 'string'){
		/*
		if(typeof window.assistants[window.ai_being_edited] == 'undefined'){
			window.assistants[window.ai_being_edited] = {};
		}
		*/
		//window.assistants[window.ai_being_edited][property] = value;
		
		if(typeof window.settings.assistants[window.ai_being_edited] == 'undefined'){
			window.settings.assistants[window.ai_being_edited] = {'selected':true};
		}
		window.settings.assistants[window.ai_being_edited][property] = value;
		return true
	}
	else{
		console.warn("update_assistant_property: not saving change.  window.ai_being_edited,property,value: ", window.ai_being_edited,property,value);
		return false
	}
}










//
//   EMOJI EDITOR
//

// Create Emoji editor element
function create_emoji_editor(emoji_editor_assistant_id=null){
	//console.log("in create_emoji_editor.  emoji_editor_assistant_id: ", emoji_editor_assistant_id);
	//if(typeof emoji_editor_assistant_id != 'string' || (typeof emoji_editor_assistant_id == 'string' && emoji_editor_assistant_id.length < 2)){
		//emoji_editor_assistant_id = window.settings.assistant;
	//}
	let custom_icon_container_el = document.createElement('div');
	custom_icon_container_el.classList.add('model-info-emoji-settings');
	custom_icon_container_el.classList.add('flex');

	// Custom icon EMOJI
	let custom_icon_current_emoji_el = document.createElement('div');
	custom_icon_current_emoji_el.classList.add('model-info-current-emoji');
	custom_icon_current_emoji_el.setAttribute('id','new-custom-ai-model-emoji');

	let custom_icon_buttons_container_el = document.createElement('div');
	custom_icon_buttons_container_el.classList.add('model-info-emoji-settings-buttons');
	//custom_icon_buttons_container_el.classList.add('flex-column');

	let custom_icon_show_emoji_picker_button_el = document.createElement('button');


	// Custom icon BACKGROUND COLOR
	custom_icon_bg_color_input_el = document.createElement('input');
	custom_icon_bg_color_input_el.setAttribute('type','color');
	custom_icon_bg_color_input_el.setAttribute('id','new-custom-ai-model-emoji_bg');
	custom_icon_bg_color_input_el.classList.add('color-picker-input');
	custom_icon_bg_color_input_el.setAttribute('value','#000000');
	if(emoji_editor_assistant_id){
		if(typeof window.settings.assistants[emoji_editor_assistant_id] != 'undefined' && typeof window.settings.assistants[emoji_editor_assistant_id]['emoji_bg'] == 'string' && window.settings.assistants[emoji_editor_assistant_id]['emoji_bg'].startsWith('#')){
			custom_icon_bg_color_input_el.setAttribute('value',window.settings.assistants[emoji_editor_assistant_id]['emoji_bg']); 
			custom_icon_current_emoji_el.style['background-color'] = window.settings.assistants[emoji_editor_assistant_id]['emoji_bg'];
		}
		else if(typeof window.assistants[emoji_editor_assistant_id] != 'undefined' && typeof window.assistants[emoji_editor_assistant_id]['emoji_bg'] == 'string' && window.assistants[emoji_editor_assistant_id]['emoji_bg'].startsWith('#')){
			custom_icon_bg_color_input_el.setAttribute('value',window.assistants[emoji_editor_assistant_id]['emoji_bg']); 
			custom_icon_current_emoji_el.style['background-color'] = window.assistants[emoji_editor_assistant_id]['emoji_bg'];
		}
	}
	
	custom_icon_bg_color_input_el.addEventListener('input', () => {
		//console.log("new icon bg color: ", custom_icon_bg_color_input_el.value);
		if(emoji_editor_assistant_id){
			window.settings.assistants[emoji_editor_assistant_id]['emoji_bg'] = custom_icon_bg_color_input_el.value;
		}
		custom_icon_current_emoji_el.style['background-color'] = custom_icon_bg_color_input_el.value;
		save_settings();
	})


	//custom_icon_buttons_container_el.appendChild(custom_icon_bg_color_input_el);
	


	custom_icon_current_emoji_el.classList.add('center');
	custom_icon_current_emoji_el.textContent = '🦜';
	if(typeof window.settings.assistants[emoji_editor_assistant_id] != 'undefined' && typeof window.settings.assistants[emoji_editor_assistant_id]['emoji'] == 'string'){
		custom_icon_current_emoji_el.innerText = window.settings.assistants[emoji_editor_assistant_id]['emoji'];
	}
	else if(typeof window.assistants[emoji_editor_assistant_id] != 'undefined' && typeof window.assistants[emoji_editor_assistant_id]['emoji'] == 'string'){
		custom_icon_current_emoji_el.innerText = window.assistants[emoji_editor_assistant_id]['emoji'];
	}
	
	custom_icon_current_emoji_el.addEventListener('click', () => {
		custom_icon_show_emoji_picker_button_el.click();
	})
	
	custom_icon_container_el.appendChild(custom_icon_current_emoji_el);

	
	custom_icon_show_emoji_picker_button_el.innerText = get_translation('Select_emoji');
	custom_icon_show_emoji_picker_button_el.addEventListener('click', () => {
		//console.log("clicked on pick emoji button");
		
		/// Load emoji picker
		window.add_script('./js/emoji_picker_browser.js')
		.then(() => {
			//console.log("show_model_info: emoji picker is loaded");
			const pickerOptions = { onEmojiSelect: (picked_emoji) => {
				//console.log("onEmojiSelect -> Picked emoji: ", picked_emoji);
				if(emoji_editor_assistant_id){
					//console.log("saving picked_emoji.native in window.settings.assistant: ", picked_emoji.native);
					window.settings.assistants[emoji_editor_assistant_id]['emoji'] = picked_emoji.native;
					save_settings();
				}
				custom_icon_current_emoji_el.innerText = picked_emoji.native;
				emoji_picker_dialog_el.close();
			} }
			const picker = new EmojiMart.Picker(pickerOptions);
			emoji_picker_container_el.innerHTML = '';
			emoji_picker_container_el.appendChild(picker);
			emoji_picker_dialog_el.showModal();
			//custom_icon_container_el.appendChild(custom_icon_emoji_picker_container_el);
			//save_received_container_el.appendChild(custom_icon_container_el);
	
		})
		.catch((err) => {
			console.error("show_model_info: failed to load emoji picker: ", err);
		})
	
	});
	custom_icon_buttons_container_el.appendChild(custom_icon_show_emoji_picker_button_el);
	//custom_icon_container_el.appendChild(custom_icon_show_emoji_picker_button_el);

	
	custom_icon_container_el.appendChild(custom_icon_bg_color_input_el);
	
	
	// Pick a color button
	custom_icon_pick_bg_button_el = document.createElement('button');
	custom_icon_pick_bg_button_el.innerText = get_translation('Select_background_color');
	custom_icon_pick_bg_button_el.addEventListener('click', () => {
		//console.log("clicked on pick icon background color button");
		custom_icon_bg_color_input_el.click();
	});

	custom_icon_buttons_container_el.appendChild(custom_icon_pick_bg_button_el);
	custom_icon_container_el.appendChild(custom_icon_buttons_container_el);
	
	return custom_icon_container_el;
}

















//
// MUSICGEN
//

if(typeof window.settings.musicgen_duration == 'number'){
	musicgen_duration_slider_el.value = window.settings.musicgen_duration;
	musicgen_duration_output_el.textContent = window.settings.musicgen_duration;
}

musicgen_duration_slider_el.addEventListener("change", (event) => {
	//console.log("typeof musicgen_duration_slider_el.value: ", typeof musicgen_duration_slider_el.value, musicgen_duration_slider_el.value);
	window.settings.musicgen_duration = parseInt(musicgen_duration_slider_el.value);
	save_settings();
	musicgen_duration_output_el.textContent = musicgen_duration_slider_el.value;
});

musicgen_duration_slider_el.addEventListener('input', () => { // TODO: input on a slider??
	musicgen_duration_output_el.textContent = musicgen_duration_slider_el.value;
}, false);








//
//  TOOLS:  PROOFREAD LISTENERS
//



proofread_auto_detect_language_input_el.addEventListener("change", (event) => {
	//console.log("clicked on translation_auto_detect_language_input_el. Checked?: ", translation_auto_detect_language_input_el.checked);
	window.settings.auto_detect_proofread_input_language = proofread_auto_detect_language_input_el.checked;
	save_settings();
});





//
//  TOOLS:  TRANSLATION LISTENERS
//


translation_input_language_select_el.addEventListener("change", (event) => {
	//console.log("translation language input_language select changed to: ", translation_input_language_select_el.value);
	window.settings.input_language = translation_input_language_select_el.value;
	//console.log(" - window.settings.input_language is now: ", window.settings.input_language);
	add_favourite_language(translation_input_language_select_el.value);
	save_settings();
	update_translation_output_select();
	
	
	if(window.busy_doing_blueprint_task == false && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
		flash_message(get_translation("Added_command_to_blueprint"),1000);
		let pretty_language = get_translation(translation_input_language_select_el.value);
		if(pretty_language == translation_input_language_select_el.value){
			pretty_language = pretty_language.toUpperCase();
		}
		insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, '\n\nSet source language to ' + pretty_language + '\n\n');
	}
});

translation_output_language_select_el.addEventListener("change", (event) => {
	//console.log("translation language output_language select changed to: ", translation_output_language_select_el.value);
	//update_translation_output_select();
	
	let old_lang_code = null;
	if(typeof window.settings.output_language == 'string'){
		old_lang_code = '-' + window.settings.output_language.toUpperCase() + '-';
	}
	
	let translation_model_details = get_translation_model_details_from_select();
	//console.log(" - translation_model_details: ", translation_model_details);
	window.settings.output_language = translation_model_details.language;
	//console.log(" - window.settings.output_language is now: ", window.settings.output_language);
	save_settings();
	
	if(typeof old_lang_code == 'string' && translation_new_file_name_input_el.value.indexOf(old_lang_code) != -1){
		const new_lang_code = '-' + window.settings.output_language.toUpperCase() + '-';
		//console.log("replacing language code in translation filename: ", old_lang_code, new_lang_code);
		translation_new_file_name_input_el.value = translation_new_file_name_input_el.value.replace(old_lang_code,new_lang_code);
	}
	
	if(window.busy_doing_blueprint_task == false && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
		flash_message(get_translation("Added_command_to_blueprint"),1000);
		let pretty_language = get_translation(translation_output_language_select_el.value);
		if(pretty_language == translation_output_language_select_el.value){
			pretty_language = pretty_language.toUpperCase();
		}
		insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, '\n\nSet target language to ' + pretty_language + '\n\n');
	}
	
});




translation_flip_languages_button_el.addEventListener("click", (event) => {
	//console.log("language before flip:  window.settings.input_language,window.settings.output_language", window.settings.input_language, window.settings.output_language);
	window.settings.auto_detect_input_language = false;
	translation_auto_detect_language_input_el.checked = false;
	const original_input_language = translation_input_language_select_el.value;
	const original_output_language = translation_output_language_select_el.value;
	//console.log("original_input_language: ", original_input_language);
	//console.log("original_output_language: ", original_output_language);
	
	//translation_input_language_select_el.value = translation_output_language_select_el.value;
	update_translation_input_select(original_output_language,original_input_language);
	
	setTimeout(() => {
		//console.log("language after flip:  window.settings.input_language,window.settings.output_language", window.settings.input_language, window.settings.output_language);
	},1)
	//translation_output_language_select_el.value = translation_input_language_select_el.value;
	//update_translation_output_select(original_output_language,original_input_language);
	
})

translation_auto_detect_language_input_el.addEventListener("change", (event) => {
	//console.log("clicked on translation_auto_detect_language_input_el. Checked?: ", translation_auto_detect_language_input_el.checked);
	window.settings.auto_detect_input_language = translation_auto_detect_language_input_el.checked;
	save_settings();
	
	if(window.settings.auto_detect_input_language && prompt_el.value != ''){
		detect_language(prompt_el.value,null,true);
	}
});


translation_save_as_new_file_button_el.addEventListener("click", (event) => {
	//console.log("clicked on translation_save_as_new_file_button_el. calling translate_document");
	translate_document();
});

summarize_save_as_new_file_button_el.addEventListener("click", (event) => {
	//console.log("clicked on summarize_save_as_new_file_button_el. calling summarize_document");
	summarize_document();
});

live_translation_insert_button_el.addEventListener("click", (event) => {
	//console.log("clicked on live_translation_insert_button");
	if(window.settings.docs.open != null && live_translation_output_el.value != ''){
		insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, live_translation_output_el.value + '\n\n');
	}
	
});

live_translation_new_document_button_el.addEventListener("click", (event) => {
	//console.log("clicked on live_translation_insert_button");
	if(live_translation_output_el.value != ''){
		create_new_document(live_translation_output_el.value + '\n\n');
	}
	
});



save_document_button_el.addEventListener("click", (event) => {
	save_file(current_file_name);
});


delete_selected_files_button_el = document.getElementById('delete-selected-files-button');
delete_selected_files_button_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on delete selected files button");
	delete_selected_files_button_el.classList.add('no-pointer-events');
	setTimeout(() => {
		delete_selected_files_button_el.classList.remove('no-pointer-events');
	},2000);
	delete_selected_files();
});

async function delete_selected_files(){
	//console.log("in delete_selected_files");
	let file_items = document.querySelectorAll('.file-item.selected');
	//console.log("selected files: ", files);
	if(file_items.length == 0){
		//flash_message(get_translation("No_files_selected"),2000,'fail');
		return
	}
	
	for(let fi = 0; fi < file_items.length; fi++){
		const filename = file_items[fi].getAttribute('data-file');
		//console.log("delete_selected_files: deleting file: ", filename);
		const full_path = file_items[fi].getAttribute('data-full-path');
		if(typeof full_path == 'string' && typeof window.selected_rag_documents[full_path] != 'undefined'){
			delete window.selected_rag_documents[full_path];
		}
		file_items[fi].remove();
		
		if(typeof filename == 'string'){
			await delete_file(filename,null,folder);
		}
		
	}
}

document.getElementById('audio-play-document-button').addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on audio play document button");
	start_play_document();
	/*
	if(window.playing_document){
		stop_play_document();
	}
	else{
		start_play_document();
	}
	*/
	
});

document.getElementById('play-document-button').addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on play document button");
	start_play_document();
	
});


document.getElementById('stop-play-document-button').addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on stop play document button");
	window.audio_to_play = [];
	//disable_speaker();
	stop_play_document();
});

document.getElementById('intro-text-privacy-learn-more-button').addEventListener("click", (event) => {
	event.target.remove();
	document.getElementById('intro-text-privacy-learn-more-explanation').style.display = 'block';
	
});





//
//   SETTINGS
//

// UI Language
setting_language_dropdown_el.addEventListener("change", (event) => {
	window.set_language(setting_language_dropdown_el.value);
});

// Prefered speaker voice
speaker_voice_select_el.addEventListener("change", (event) => {
	window.set_voice(speaker_voice_select_el.value);
	
	if(speaker_voice_select_el.value != 'default' && speaker_voice_select_el.value != 'basic'){
		window.enable_speaker();
		window.add_task({
			'prompt':null,
			'origin':'settings',
			'type':'speak',
			'state':'should_tts',
			'sentence':'Hello, I am a voice.',
			'desired_results':0,
			'results':[],
			'destination':'audio_player',
			'voice':speaker_voice_select_el.value
		});
	}
	
});

interrupt_speaking_select_el.addEventListener("change", (event) => {	
	if(interrupt_speaking_select_el.value == 'Yes' || interrupt_speaking_select_el.value == 'Auto'){
		document.body.classList.add('interrupt-speaking');
	}
	else{
		document.body.classList.remove('interrupt-speaking');
	}
	window.settings.interrupt_speaking = interrupt_speaking_select_el.value;
	save_settings();
});



// Manage disk space / models
show_models_list_button_el.addEventListener("click", () => {
	console.log("clicked on show_models_list_button_el");
	show_models_info();
	if(window.innerWidth < 981){
		close_sidebar();
	}
	if(window.innerWidth < 641){
		document.body.classList.remove('show-document')
	}
});





function do_auto_brightness(){
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		update_brightness('dark');
	}
	else{
		update_brightness('light');
	}
}

function update_brightness(brightness){
	if(typeof brightness == 'string' && (brightness == 'default' || brightness == 'light' || brightness == 'dark')){
		
		if(brightness == 'default'){
			window.settings.brightness = null;
			save_settings();
			do_auto_brightness();
			return
		}
		
		if(window.settings.brightness != brightness){
			window.settings.brightness = brightness;
			save_settings();
		}
		if(window.settings.brightness == 'light'){
			document.body.classList.add('light');
		}
		else{
			document.body.classList.remove('light');
		}
		setTimeout(() => {
			if(setting_brightness_dropdown_el){
				setting_brightness_dropdown_el.value = brightness;
			}
		},100);
	}
}


// Background color / theme
setting_brightness_dropdown_el.addEventListener("change", (event) => {
	 update_brightness(setting_brightness_dropdown_el.value);
});

if(typeof window.settings.brightness == 'string'){
	setting_brightness_dropdown_el.value = window.settings.brightness;
	update_brightness(window.settings.brightness);
}
else{
	do_auto_brightness();
}




function currently_downloading(){
	//console.log("in currently_downloading");
	if(
		window.busy_loading_diffusion_worker == false && 
		window.web_llm_model_being_loaded == null && 
		window.llama_cpp_model_being_loaded == null && // TODO: this is a little double, as window.busy_loading_assistant should cover both WebLMM and Llama_cpp (and ppossibly all loading cases?)
		window.busy_loading_assistant == null && 
		window.busy_loading_tts == false &&
		window.busy_loading_whisper == false && 
		window.busy_loading_image_to_text !== true // is initially null, then later becomes a boolean
	){
		//console.log("currently_downloading: no");
		return false
	}
	else{
		//console.log("currently_downloading: yes");
		return true
	}
}
window.currently_downloading = currently_downloading;


/*
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const newColorScheme = e.matches ? "dark" : "light";
});
*/




settings_complexity_select_el.addEventListener("change", (event) => {
	//console.log("settings complexity dropdown changed");
	window.update_settings_complexity(settings_complexity_select_el.value);
});

document.getElementById('save-settings-backup-button').addEventListener("click", (event) => {
	//console.log("save-settings-backup-button clicked");
	if(typeof playground_live_backups['/papeg_ai_settings.json'] == 'string'){
		playground_live_backups['/papeg_ai_settings.json'] = JSON.stringify(window.settings,null,4);
		open_folder('');
		open_file('papeg_ai_settings.json','browser','');
	}
	else{
		open_folder('');
		create_new_document(JSON.stringify(window.settings,null,4), 'papeg_ai_settings.json');
	}
});


document.getElementById('import-settings-backup-button').addEventListener("click", (event) => {
	//console.log("import-settings-backup-button clicked. current_file_name: ", current_file_name);
	
	if(current_file_name == 'papeg_ai_settings.json'){
		if(typeof playground_live_backups['/papeg_ai_settings.json'] == 'string'){
			try{
				let new_settings = JSON.parse(playground_live_backups['/papeg_ai_settings.json']);
				if(typeof new_settings == 'object' && typeof new_settings.for == 'string' && new_settings.for == 'papeg.ai'){
					//console.log("copying imported settings over old settings");
					window.settings = {...window.settings, ...new_settings}
					save_settings();
					generate_ui();
					document.body.classList.remove('viewing-settings-file');
					setTimeout(() => {
						if(current_file_name == 'papeg_ai_settings.json' && typeof playground_live_backups['/papeg_ai_settings.json'] == 'string'){
							document.body.classList.add('viewing-settings-file');
						}
					},10000);
					flash_message(get_translation('Settings_imported'));
				}
				else{
					console.error("import-settings-backup-button: no 'for' == 'papeg.ai' in settings import data: ", new_settings);
					flash_message(get_translation('Invalid_backup_file'),3000,'fail');
				}
			}
			catch(err){
				console.error("import-settings-backup-button: caught error trying to parse backup file: ", err);
				flash_message(get_translation('Invalid_backup_file'),3000,'fail');
			}
		}
	}
	else if(current_file_name.endsWith('_papeg_ai_conversation.json')){
		//console.log("json file ends with _papeg_ai_conversation.json");
		try{
			let conversation_json = JSON.parse(playground_live_backups['/' + current_file_name]);
			
			if(typeof conversation_json == 'object' && Array.isArray(conversation_json)){
				let good_conversation_data = true;
				for(let cv = 0; cv < conversation_json.length; cv++){
					if(typeof conversation_json[cv].role == 'string' && conversation_json[cv].role.length > 1){
						// ok
					}
					else{
						good_conversation_data = false;
					}
					
					if(typeof conversation_json[cv].content == 'string' && conversation_json[cv].content.length){
						// ok
					}
					else{
						good_conversation_data = false;
					}
				}
				if(good_conversation_data){
					//console.log("import conversation: seems to be valid conversation data");
					
					let assistant_id = current_file_name.replaceAll('_papeg_ai_conversation.json','');
					//console.log("import conversation button clicked: initial assistant_id: ", assistant_id)
					if(typeof window.settings.assistants[assistant_id] != 'undefined'){
						restore_conversation(conversation_json,assistant_id);
					}
					else{
						//found_it = false;
						for (let [key, details] of Object.entries(window.translations)) {
							//console.log("import conversation:  translation key: ", key);
							if(key.endsWith('_name')){
								for (let [language, ai_name] of Object.entries(details)) {
									//console.log("language, ai_name: ", language, ai_name);
									if(assistant_id == ai_name){
										//console.log("import conversation: MATCH");
										assistant_id = key.replaceAll('_name','');
										if(typeof window.settings.assistants[assistant_id] != 'undefined'){
											//window.conversations[assistant_id] = conversation_json;
											restore_conversation(conversation_json,assistant_id);
											return
										}
									}
								}
							}
						}
						for (let [key, details] of Object.entries(window.settings.assistants)) {
							if(typeof details.custom_name == 'string' && details.custom_name.length > 1){
								if(assistant_id == details.custom_name){
									//window.conversations[key] = conversation_json;
									//console.log("import conversation: MATCH");
									restore_conversation(conversation_json,key);
									return
								}
							}
						}
						flash_message(get_translation('Could_not_import_conversation'),3000,'warn');
					}
				}
			}
			else{
				console.error("importing conversation resulted in invalid data type");
			}
		}
		catch(err){
			console.error("could not import conversation");
			flash_message(get_translation('Could_not_import_conversation'),3000,'fail');
		}
		
	}
	
});


function export_conversation(assistant_id=null){
	//console.log("in export_conversation.  assistant_id: ", assistant_id);
	if(typeof assistant_id == 'string' && window.conversations[assistant_id] != 'undefined'){
		
		
		let export_filename = assistant_id + '_papeg_ai_conversation.json';
		
		if(typeof window.translations[assistant_id + '_name'] == 'string'){
			export_filename = get_translation(assistant_id + '_name') + '_papeg_ai_conversation.json';
		}
		else if(typeof window.settings.assistant[assistant_id] != 'undefined' && typeof window.settings.assistant[assistant_id].custom_name == 'string' && window.settings.assistant[assistant_id].custom_name.length > 1){
			export_filename = window.settings.assistant[assistant_id].custom_name + '_papeg_ai_conversation.json';
		}
		
		if(typeof playground_live_backups['/' + export_filename] == 'string'){
			playground_live_backups['/' + export_filename] = JSON.stringify(window.conversations[assistant_id],null,4);
			open_folder('');
			open_file(export_filename,'browser','');
		}
		else{
			open_folder('');
			create_new_document(JSON.stringify(window.conversations[assistant_id],null,4), export_filename);
		}
	}
}
window.export_conversation = export_conversation;











function restore_conversation(conversation,assistant_id=null){
	if(assistant_id == null){
		assistant_id = window.settings.assistant;
	}
	//console.log("in restore_conversation.  assistant_id,conversation: ", assistant_id, conversation);
	if(typeof assistant_id == 'string' && assistant_id.length > 1 && typeof conversation != 'undefined' && conversation != null && Array.isArray(conversation)){
		window.clear_assistant(assistant_id);
		window.conversations[assistant_id] = conversation;
		let added_a_chat_message = false;
		for(let cv = 0; cv < window.conversations[assistant_id].length; cv++){
			if(typeof window.conversations[assistant_id][cv].role == 'string' && typeof window.conversations[assistant_id][cv].content == 'string' && window.conversations[assistant_id][cv].role.length && window.conversations[assistant_id][cv].role != 'system' && window.conversations[assistant_id][cv].content.length){
				let role = window.conversations[assistant_id][cv].role;
				
				if(role == 'system'){
					continue
				}
				if(role == 'assistant'){
					role = assistant_id;
				}
				
				let translation_prefix = 'post_';
				if(role == 'user'){
					translation_prefix = 'pre_';
				}
				
				if(typeof window.conversations[assistant_id][cv][translation_prefix + "translations"] != 'undefined' && typeof window.conversations[assistant_id][cv][translation_prefix + "translations"][window.settings.language] == 'string'){
					add_chat_message(assistant_id,role,window.conversations[assistant_id][cv][translation_prefix + "translations"][window.settings.language],null,null,null,false); // false = do not save to conversations
				}
				else{
					add_chat_message(assistant_id,role,window.conversations[assistant_id][cv].content,null,null,null,false); // false = do not save to conversations
				}
				
				added_a_chat_message = true;
			}
		}
		if(added_a_chat_message && assistant_id == window.settings.assistant){
			document.body.classList.add('has-conversation');
		}
	}
}

function restore_conversations(){
	//console.log("in restore_conversations. playground_live_backups: ", JSON.stringify(keyz(playground_live_backups)));
	let error_restoring = false;
	for (let [assistant_id, details] of Object.entries(window.settings.assistants)) {
		if(typeof details['save_conversation'] == 'number' && details['save_conversation'] > 0){
			//console.log("restore_conversation: should restore conversation messages for: ", assistant_id, details['save_conversation']);
			const conversation_backup_filename = '/Papeg_ai_conversations/' + assistant_id + '_papeg_ai_conversation.json';
			//console.log("restore_conversation: conversation_backup_filename: ", conversation_backup_filename);
			//console.log("restore_conversation: playground_live_backups[conversation_backup_filename] type: ", typeof playground_live_backups[conversation_backup_filename]);
			if(typeof playground_saved_files[conversation_backup_filename] == 'string'){
				//console.log("restore_conversations: found conversation backup for assistant_id: ", assistant_id);
				try{
					let raw_json = playground_saved_files[conversation_backup_filename];
					raw_json = raw_json.replaceAll('``','');
					raw_json = raw_json.replaceAll('......','...');
					raw_json = raw_json.replaceAll('......','...');
					raw_json = raw_json.replaceAll('......','...');
					parsed_conversation = JSON.parse(raw_json);
					//console.log("restore_conversations:  parsed_conversation: ", parsed_conversation);
					restore_conversation(parsed_conversation,assistant_id);
					//console.log("restore_conversations: got conversation from file: ", assistant_id, parsed_conversation);
				}
				catch(err){
					console.error("Caught error parsing papeg_ai_conversation.json for assistant: ", assistant_id, "\n\n", playground_saved_files['/Papeg_ai_conversations/' + assistant_id + '_papeg_ai_conversation.json' ], "\n", err);
					error_restoring = true;
				}
			}
			else{
				//console.log("restore_conversations: no conversation backup for: ", conversation_backup_filename );
			}
		}
	}
	if(error_restoring){
		flash_message(get_translation("An_error_occured_while_restoring_the_chat_history"),3000,'warn');
	}
	window.unread_messages = {};
	generate_ui();
	
}



// Gets called when the IndexDB worker in pjs/main.js is done loading the live_backups data
async function file_data_loaded(){
	//console.log("\n\nIN FILE_DATA_LOADED. playground_saved_files keys: ", JSON.stringify(keyz(playground_saved_files),null,2));
	//console.log("- playground_live_backups keys: ", JSON.stringify(keyz(playground_live_backups),null,2));
	
	window.generate_recent_documents_list();
	restore_conversations();
	
	document.getElementById('tutorial-menu').style.maxHeight = '50px';
	
}






function clear_cache() {
    console.log("in clear. caches: ", caches);
    try {
		caches.keys().then(list => list.map(key => caches.delete(key)))
		caches.keys().then((keyList) => Promise.all(keyList.map((key) => caches.delete(key))))
		.then((value) => {
			//console.log("cached should now be cleared");
			flash_message(get_translation("Reloading_the_page"),10000);
			setTimeout(() => {
				window.location.reload(true); 
			},2000)
		})
		.catch((err) => {
			console.error("caught error clearing caches: ", err);
		})
		/*
        caches.delete(window.cache_name);
		caches.delete('webllm/config');
		caches.delete('webllm/model');
		caches.delete('webllm/wasm');
		caches.delete('transformers-cache');
		caches.delete('tvmjs');
		caches.delete('llama-cpp-wasm-cache');
		caches.delete('phi-mixformer-candle-cache');
        caches.delete();
		//console.log("caches cleared");
		setTimeout(() => {
			window.location.reload(true); 
		},2000)
		*/
    } catch (e) {
        console.error("General error clearing cache: ", e);
    }
}


clear_site_cache_button_el.addEventListener("click", () => {
	window.update_site();
});


document.getElementById('apply-update-button').addEventListener("click", () => {
	window.location.reload(true);
});


if(typeof window.settings.limit_memory == 'number'){
	document.getElementById('settings-limit-memory-use-select').value = window.settings.limit_memory;
	if(window.settings.limit_memory != 0){
		window.ram = window.settings.limit_memory;
		window.available_memory = window.ram;
		document.getElementById('total-memory').textContent = Math.round(window.ram / 1000) + "GB";
		document.getElementById('limited-ram').textContent = Math.round(window.ram / 1000) + "GB";
		console.log("window.ram is now: ", window.ram);
	}
	
}


document.getElementById('settings-limit-memory-use-select').addEventListener("change", (e) => {
	let ram_value = parseInt(e.target.value);
	if(typeof ram_value == 'number'){
		
		window.settings.limit_memory = ram_value;
		save_settings();
		
		if(ram_value == 0){
			window.ram = navigator.deviceMemory * 1000;
		}
		else{
			window.ram = ram_value;
		}
	}
	
	window.available_memory = window.ram;
	document.getElementById('total-memory').textContent = Math.round(window.ram / 1000) + "GB";
	document.getElementById('limited-ram').textContent = Math.round(window.ram / 1000) + "GB";
	console.log("window.ram is now: ", window.ram);
});



clear_local_storage_button_el.addEventListener("click", () => {
	if(confirm(get_translation('Are_you_sure'))){
		localStorage.removeItem("settings");
		localStorage.removeItem("timers");
		localStorage.removeItem("timer_index");
		localStorage.removeItem("message_form_container_height");
		window.location.reload(true);
	}
});

/*
clear_cache_button_el.addEventListener("click", (e) => {
	//console.log("clear_cache_button clicked. caches: ", caches);
	try{
		if(confirm(get_translation('Are_you_sure'))){
			
			
//It seems there are more caches being created by all the libraries:
			
//webllm/config
//webllm/model
//phi-mixformer-candle-cache
//transformers-cache
//webllm/wasm
//tvmjs
//llama-cpp-wasm-cache
				
			
			
			clear_cache();
			//Cache.delete();
			//console.log("caches cleared");
			//window.location.reload(true); 
		}
		
	}
	catch(e){
		console.error("Error clearing cache: ", e);
	}
});
*/

clear_data_button_el.addEventListener("click", () => {
	//console.log("clear_data_button clicked");
	try{
		if(confirm(get_translation('Are_you_sure'))){
			clear_indexdb();
			localStorage.clear();
			window.settings.docs.recent = [];
			save_settings();
			setTimeout(() => {
				window.location.reload(true); 
			},541500);
			
		}
	}
	catch(e){
		console.error("Error clearing cache: ", e);
	}
});

clear_everything_button_el.addEventListener("click", () => {
	//console.log("clear_everything_button clicked");
	try{
		if(confirm(get_translation('Are_you_sure'))){
			
			//clear_indexdb();
			localStorage.clear();
			var req = indexedDB.deleteDatabase("ldb");
			req.onsuccess = function () {
			    console.log("Deleted database successfully");
			};
			req.onerror = function () {
			    console.error("Couldn't delete database");
				//flash_message(get_translation("An_error_occured"),3000,'fail');
				setTimeout(() => {
					indexedDB.deleteDatabase("ldb");
				},500)
			};
			req.onblocked = function () {
				if(window.settings.settings_complexity == 'developer'){
					console.error("Couldn't delete database due to the operation being blocked");
				}
			    
				//flash_message(get_translation("An_error_occured"),3000,'fail');
				setTimeout(() => {
					indexedDB.deleteDatabase("ldb");
				},500)
			};
			clear_cache();
			localStorage.clear();
		}
	}
	catch(err){
		console.error("Error clearing everything: ", err);
	}
});





//
//  OCR
//

start_ocr_button_el.addEventListener("click", (e) => {
	//console.log("start_camera_button in footer of file manager clicked");
	start_ocr();
	if(document.body.classList.contains('show-documents-search')){
		end_rag_search();
	}
});


scan_hands_free_hint_el.addEventListener("click", (e) => {
	if(!window.microphone_enabled){
		window.enable_microphone();
	}
});

function start_ocr(){
	//console.log("in start_ocr");
	window.ocr_blobs = [];
	
	camera_image_to_text_details_el.removeAttribute('open');
	setTimeout(() => {
		if(scan_hands_free_hint_el){
			scan_hands_free_hint_el.style.display = 'none';
		}
	},60000);
	
	setTimeout(() => {
		window.only_allow_voice_commands = true;
	},10)
	
	
	if(window.innerWidth < 981){
		close_sidebar();
	}
	window.add_script('./camera_module.js',true) // add it as a module
	.then(() => {
		
		switch_assistant('any_writer');
		window.start_camera();
		camera_do_ocr_details_el.open = true;
		document.body.classList.add('doing-ocr');
		camera_container_el.classList.remove('ocr-scan-complete');
		window.continuous_ocr_enabled = true;
		//console.log("window.settings.continuous_ocr_scan: ", window.settings.continuous_ocr_scan);
		if(window.settings.continuous_ocr_scan){
			//console.log("start_ocr: continous_ocr_scanning was enabled, so calling do_continuous_ocr");
			//window.do_continuous_ocr();
		}
		
		return window.add_script('./opencv/opencv_4_10_0.js');
	})
	
	.then(() => {
		
		//console.log("opencv loaded in. cv, window.cv: ", cv, window.cv);
		if(window.cv && window.opencv_jscanify == null){
			window.cv.onRuntimeInitialized = () => {
				
				//console.log("OpenCV initialized. window.jscanify: ", window.jscanify);
				if(window.opencv_jscanify == null){
					window.opencv_jscanify = true;//new jscanify();
					//console.log("window.opencv_jscanify: ", window.opencv_jscanify);
				
					if(window.detecting_page_in_video == false && window.camera_streaming == true){
						//console.log("start_ocr: starting detect_page_in_video loop");
						window.detect_page_in_video();
					}
				}
				
			}
		}
		
		
		return window.add_script('./opencv/jscanify.min.js');
	})
	.then(() => {
		
		//console.log("scanify loaded in");
		
		if(window.cv && window.opencv_jscanify == null){
			window.cv.onRuntimeInitialized = () => {
				//console.log("OpenCV initialized 2. window.jscanify: ", window.jscanify);
				if(window.opencv_jscanify == null){
					window.opencv_jscanify = true;//new jscanify();
					//console.log("window.opencv_jscanify: ", window.opencv_jscanify);
				
					if(window.detecting_page_in_video == false && window.camera_streaming == true){
						//console.log("start_ocr: starting detect_page_in_video loop");
						window.detect_page_in_video();
					}
				}
			}
		}
		
		
		
	})
	.catch((err) => {
		console.error("caught error loading camera_module script: ", err);
	})
}
window.start_ocr = start_ocr;

function stop_ocr(){
	window.ocr_blobs = [];
	document.body.classList.remove('doing-ocr');
	window.only_allow_voice_commands = false;
}
window.stop_ocr = stop_ocr;





window.detect_page_in_video = function(){
	//console.log("in detect_page_in_video");
	window.detecting_page_in_video = true;
	if(window.cv != null && window.opencv_jscanify == true){
		
		try{
			if(video_canvas_el != null && video_el != null && video_context != null){
				if( (window.page_has_focus && camera_do_ocr_details_el.open == true) || window.doing_ocr_scan){
					
					video_context.drawImage(video_el, 0, 0, window.camera_width, window.camera_height);
					window.extract_page_from_canvas(video_canvas_el);
				
					window.secondary_contour_detect_delay = 100;
				}
				else{
					//console.log("detect_page_in_video: page doesn't have focus, so not attempting document scan");
					window.secondary_contour_detect_delay = 300;
				}
				
				
			}
			else{
				console.error("detect_page_in_video: video_canvas_el was null");
				document.body.classList.remove('show-camera');
				document.body.classList.remove('doing-ocr');
			}
		}
		catch(err){
			console.error("detect_page_in_video: caught error with jscanify: ", err);
			window.secondary_contour_detect_delay = 300;
			camera_overlay_svg_container_el.innerHTML = '';
		}
		
		if(window.camera_streaming){
			//console.log("detect_page_in_video: camera still seems to be streaming, so setting timeout for next loop");
			
			if(window.doing_ocr_scan){
				secondary_contour_detect_delay = 0;
			}else if(secondary_contour_detect_delay == 0){
				secondary_contour_detect_delay = 100;
			}
			
			setTimeout(detect_page_in_video, (window.opencv_interval_delay + window.secondary_contour_detect_delay));
		}
		else{
			console.error("detect_page_in_video: window.camera_streaming is false, aborting scanify loop");
			window.detecting_page_in_video = false;
			biggest_contour_x_seen = 0;
			biggest_contour_y_seen = 0;
		}
		
	}
	else{
		console.error("detect_page_in_video: window.cv and/or window.opencv_jscanify was still null");
		window.detecting_page_in_video = false;
	}
	
}






window.extract_page_from_canvas = function(canvas_element){
	//console.log("in extract_page_from_canvas:  canvas_element.width: ", canvas_element.width, ", canvas_element.height: ", canvas_element.height);
	let canvas_element_ctx = canvas_element.getContext('2d', { willReadFrequently: false });
	
	//console.log("extract_page_from_canvas: camera resolution: ", window.camera_width, window.camera_height);
	//console.log("extract_page_from_canvas: initial canvas size: ", canvas_element.width,canvas_element.height);
	
	
	let cropped_canvas = null;
	let resultCanvas = null; 
	let svg_overlay_el = null;
	
	let x0 = 0;
	let y0 = 0;
	let x1 = canvas_element.width;
	let y1 = canvas_element.height;
	//console.log("extract_page_from_canvas: initial canvas size:  x0,y0, x1,y1: ", x0 + "," + y0, " -> ", x1 + "," + y1);
	
	let width_offset = 0; // A wide camera stream will be cropped on the left and right side to offer a better fit for paper documents
	let cv_read = null; // Contains data that OpenCV.js reads from an image source
	
	
	try{
		if(window.camera_width > window.camera_height){ // If stream aspect ratio is for a wide stream, crop the sides. This is done by creating an additional cropped canvas.
			//console.log("extract_page_from_canvas: WIDE VIDEO");
			let cropped_canvas = document.createElement("canvas");
			cropped_canvas.width = Math.floor(canvas_element.height / 1.5);
			cropped_canvas.height = canvas_element.height;
		
			let cropped_canvas_ctx = cropped_canvas.getContext('2d', { willReadFrequently: false });
		
			width_offset = Math.floor( (canvas_element.width - (canvas_element.height / 1.5)) / 2); // cropped canvas has a width that is two-thirds of the provided canvas' height
			let x0 = width_offset;
			let x1 = canvas_element.width - width_offset;
			//console.log("extract_page_from_canvas: extract_page_from_canvas: attempting to crop.  x0,y0, x1,y1: ", x0 + "," + y0, " -> ", x1 + "," + y1);
				
			const imgData = canvas_element_ctx.getImageData(x0, y0, x1, y1);
			cropped_canvas_ctx.putImageData(imgData, 0, 0);
		
			if(cropped_canvas == null){
				console.error("extract_page_from_canvas: aborting, cropped canvas was null?");
				return false
			}
			cv_read = window.cv.imread(cropped_canvas);
		
		
		
		}
		else{
			//cropped_canvas.width = canvas_element.width;
			//cropped_canvas.height = canvas_element.height;
		
			if(canvas_element == null){
				console.error("extract_page_from_canvas: aborting, canvas_element was null?");
				return false
			}
		
			cv_read = window.cv.imread(canvas_element);
		}
	
		
	
		if(typeof cv_read == 'undefined' || cv_read == null){
			console.error("extract_page_from_canvas: cv_read was bad?  cv_read: ", cv_read);
			return false
		}
		//console.error("cv_read: ", cv_read);
	
	
	
		// attempt to resolve memory issue by creating a new jscanify instance on each run
		const page_jscanify = new jscanify();
	
		//console.log("detect_page_in_video: cv_read: ", typeof cv_read, cv_read);



		// First get the cornerpoints only. Actually extracting a detected page into a new canvas will only be done if the point are plausible, and if extracting a new blob for OCR is needed.
		//const paperContour = scanner.findPaperContour(cv.imread(image));
		const contour = page_jscanify.findPaperContour(cv_read);
		//console.log("detect_page_in_video: jscanify: contour: ", typeof contour, contour);
		const cornerPoints = page_jscanify.getCornerPoints(contour);
		//console.log("detect_page_in_video: jscanify: cornerPoints: ", cornerPoints);
	
		/*
		
		// Example cornerPoints output: 
		
		{
		    "topLeftCorner": {
		        "x": 0,
		        "y": 0
		    },
		    "topRightCorner": {
		        "x": 600,
		        "y": 0
		    },
		    "bottomLeftCorner": {
		        "x": 32,
		        "y": 1079
		    },
		    "bottomRightCorner": {
		        "x": 756,
		        "y": 707
		    }
		}
				
		*/
	
	
		if(
			typeof cornerPoints != 'undefined' && 
			cornerPoints != null && 
			typeof cornerPoints.topLeftCorner != 'undefined' && 
			typeof cornerPoints.bottomLeftCorner != 'undefined' && 
			typeof cornerPoints.topRightCorner != 'undefined' && 
			typeof cornerPoints.bottomRightCorner != 'undefined'
		){
			//cornerPoints = JSON.parse(JSON.stringify(cornerPoints));
		
			// Sanity-check that the cornerpoints are somewhat in the form of a rectangle
		
			if(cornerPoints.topRightCorner.x > biggest_contour_x_seen){
				biggest_contour_x_seen = cornerPoints.topRightCorner.x;
				//console.log("biggest_contour_x_seen increased to: ", biggest_contour_x_seen);
			}
			if(cornerPoints.bottomRightCorner.x > biggest_contour_x_seen){
				biggest_contour_x_seen = cornerPoints.bottomRightCorner.x;
			
			}
			if(cornerPoints.bottomLeftCorner.y > biggest_contour_y_seen){
				biggest_contour_y_seen = cornerPoints.bottomLeftCorner.y;
				//console.log("biggest_contour_y_seen increased to: ", biggest_contour_y_seen);
			}
			if(cornerPoints.bottomRightCorner.y > biggest_contour_y_seen){
				biggest_contour_y_seen = cornerPoints.bottomRightCorner.y;
				//console.log("biggest_contour_y_seen increased to: ", biggest_contour_y_seen);
			}
		
		
			let hint_line_color = '#ff0000';
		
		
			if(
				cornerPoints.topLeftCorner.x != 0 && 
				cornerPoints.topLeftCorner.y != 0 && 
				cornerPoints.bottomLeftCorner.x != 0 && 
				cornerPoints.topRightCorner.y != 0
			
			){
				//console.log("\n  []  \nOK, jscanify detected a rectangle");
			
				// The more the contour resembles a nice rectangular shape, the thicker and greener the outline on the video stream will become
				let outline_stroke_width = 4;
				let outline_stroke_color = '#009900';
				
				if(biggest_contour_x_seen > cornerPoints.topRightCorner.x && biggest_contour_x_seen > cornerPoints.bottomRightCorner.x && biggest_contour_y_seen > cornerPoints.bottomLeftCorner.y && biggest_contour_y_seen > cornerPoints.bottomRightCorner.y){
					//console.log("jscanify rectangle is smaller than the largest values of X and Y ever seen, so that makes it more plausible");
					outline_stroke_width = 7;
					outline_stroke_color = '#00CC00';
					
					if(
						Math.abs(cornerPoints.bottomLeftCorner.y - cornerPoints.bottomRightCorner.y) < 200 &&
						Math.abs(cornerPoints.topRightCorner.x - cornerPoints.bottomRightCorner.x) < 200 &&
						Math.abs(Math.abs(cornerPoints.bottomRightCorner.x - cornerPoints.bottomLeftCorner.x) - Math.abs(cornerPoints.topRightCorner.x - cornerPoints.topLeftCorner.x)) < 300 && 
						Math.abs(Math.abs(cornerPoints.bottomRightCorner.y - cornerPoints.topRightCorner.y) - Math.abs(cornerPoints.bottomLeftCorner.y - cornerPoints.topLeftCorner.y)) < 300
					){
						outline_stroke_width = 10;
						outline_stroke_color = '#00FF00';
					}
					
				}
				else{
					//console.warn("jscanify rectangle is not bigger than the biggest X and Y values ever seen");
				}
			
				svg_overlay_el = create_svg(window.camera_width,window.camera_height,cornerPoints,outline_stroke_width,'#00ff00',width_offset);
			
			
			
				if(window.doing_ocr_scan){ // window.doing_ocr_scan is normally 0. when the users click on the 'Scan' button, 5 consecutive pictures will be taken in quick succession, and the 5 OCR results will be merged into one coherent text.
					
					// Get the average width and height of the detected page, and then ask jscanify to return a canvas of those dimensions with the detected page
					const optimal_width = Math.round( ( (cornerPoints.topRightCorner.x + cornerPoints.bottomRightCorner.x) / 2) - ((cornerPoints.topLeftCorner.x + cornerPoints.bottomLeftCorner.x) / 2) );
					const optimal_height = Math.round( ( (cornerPoints.bottomRightCorner.y + cornerPoints.bottomLeftCorner.y) / 2) - ((cornerPoints.topLeftCorner.y + cornerPoints.topRightCorner.y) / 2) ) ;
					//console.log("jscanify: optimal_width, optimal_height: ", optimal_width, optimal_height);
					
					if(cropped_canvas != null){  // If a crop was applied, then use the additional cropped canvas that was created as the source
						resultCanvas = page_jscanify.extractPaper(cropped_canvas, optimal_width, optimal_height);
					}
					else{
						resultCanvas = page_jscanify.extractPaper(canvas_element, optimal_width, optimal_height);
					}
					
					if(resultCanvas){
						//console.log("Jscanify succesfully created a resultCanvas");
						
						// Draw the extracted page into the UI
						camera_overlay_context.drawImage(resultCanvas, 0, 0);
						
						// Extract a blob from the results canvas, which will be used for OCR
						resultCanvas.toBlob( async (blob) => {
							//console.log("extract_page_from_canvas: video_canvas_el: toBlob result: ", blob);
						    window.ocr_blobs.push(blob);
							
							//console.log("continuous_ocr:  ret.data.text: ", ret.data.text);
							if(window.doing_ocr_scan){
								window.doing_ocr_scan--;
								window.post_ocr_blob_addition(); // this function will slow down change the detection speed and call the Tesseract OCR process when all desired blobs have been collected
							}
						}, 'image/jpeg', 0.95);
					}
					else{
						console.error("Jscanify did not return a valid resultCanvas: ", resultCanvas);
					}
				}
			
			}
			else{
				//console.warn("Jscanify did not detect a plausible rectangle");
				svg_overlay_el = create_svg(window.camera_width,window.camera_height,cornerPoints,10,'#ff0000',width_offset); // show 10px red  stroke outline on the detected shape
			}
		}
		else{
			//console.error("Jscanify gave invalid or incomplete connerPoints: ", cornerPoints);
			camera_overlay_svg_container_el.innerHTML = '';
		}
		
		// Place an SVG on top of the camera stream that shows where a page was detected
		if(svg_overlay_el){
			camera_overlay_svg_container_el.innerHTML = '';
			camera_overlay_svg_container_el.appendChild(svg_overlay_el);
		}
		
	}
	catch(err){
		console.error("extract_page_from_canvas: caught error: ", err);
		//console.error("cv_read: ", cv_read);
		camera_overlay_svg_container_el.innerHTML = '';
	}
	
	if(cv_read != null){
		//console.log("deleting cv_read");
		cv_read.delete();
	}
	
}



window.post_ocr_blob_addition = async function() {
	
	if(window.doing_ocr_scan){ // this counts down from 7 to 0
		//window.ocr_scans.push(ret.data.text);

		doing_ocr_scan_counter_el.textContent = window.doing_ocr_scan;
		camera_ocr_scan_progress_el.value = window.doing_ocr_scan / window.settings.ocr_scan_intensity;

		//window.merge_ocr_scans(window.ocr_scans);

		camera_container_el.classList.add('show-flasher');
		setTimeout(() => {
			camera_container_el.classList.remove('show-flasher');
		},10)

	}
	else{
		doing_ocr_scan_counter_el.textContent = '';
	
		if(window.continuous_ocr_enabled){
			document.body.classList.add('camera-sleeping');
		}
	
		if(window.ocr_blobs.length && window.doing_ocr_scan == 0){
			//console.log("post_ocr_blob_addition: all blobs for OCR have been collected");
			await window.perform_ocr_on_blobs();
			document.body.classList.remove('doing-ocr-scan');
			// clear camera_overlay_canvas_el
			if(camera_overlay_context){
				//console.log("post_ocr_blob_addition: clearing camera overlay");
				camera_overlay_context.clearRect(0, 0, camera_overlay_context.width, camera_overlay_context.height);
			}
			
		}
		
		window.ocr_blobs = [];
		window.ocr_blobs.length = 0;
		if(window.continuous_ocr_enabled){
			document.body.classList.add('camera-sleeping');
			
			setTimeout(() => {
				document.body.classList.remove('camera-sleeping');
				if(window.continuous_ocr_enabled){
					window.doing_ocr_scan = window.settings.continuous_ocr_scan_intensity;
				}
			},5000);
			
		}
		
	}

}


// For OCR camera stream overlay
function create_svg(boxWidth=1920,boxHeight=1080,cornerPoints=null,strokeWidth=10,strokeColor="#00FF00",width_offset=0) {
	//console.log("create_svg: width_offset (x-offset of inner square): ", width_offset);
    var xmlns = "http://www.w3.org/2000/svg";
    

    var svgElem = document.createElementNS(xmlns, "svg");
    svgElem.setAttributeNS(null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
    svgElem.setAttributeNS(null, "width", boxWidth);
    svgElem.setAttributeNS(null, "height", boxHeight);
    svgElem.style.display = "block";
	
	if(cornerPoints == null){
		console.error("create_svg: provided cornerPoints was null");
		return svgElem;
	}
	
    var g = document.createElementNS(xmlns, "g");
    svgElem.appendChild(g);
    //g.setAttributeNS(null, 'transform', 'matrix(1,0,0,-1,0,300)');

    // draw linear gradient
    var defs = document.createElementNS(xmlns, "defs");
    var grad = document.createElementNS(xmlns, "linearGradient");
    grad.setAttributeNS(null, "id", "gradient");
    grad.setAttributeNS(null, "x1", "0%");
    grad.setAttributeNS(null, "x2", "0%");
    grad.setAttributeNS(null, "y1", "100%");
    grad.setAttributeNS(null, "y2", "0%");
    var stopTop = document.createElementNS(xmlns, "stop");
    stopTop.setAttributeNS(null, "offset", "0%");
    stopTop.setAttributeNS(null, "stop-color", "#ff0000");
    grad.appendChild(stopTop);
    var stopBottom = document.createElementNS(xmlns, "stop");
    stopBottom.setAttributeNS(null, "offset", "100%");
    stopBottom.setAttributeNS(null, "stop-color", "#0000ff");
    grad.appendChild(stopBottom);
    defs.appendChild(grad);
    g.appendChild(defs);

	

    // draw borders
	
	//console.log("create_svg: cornerPoints.topLeftCorner x-offset before and after: ", cornerPoints.topLeftCorner.x, width_offset + cornerPoints.topLeftCorner.x);
	var coords = "M 0,0";
    coords = coords + "L " + (width_offset + cornerPoints.topLeftCorner.x) + ", " + 0;
	coords = coords + "L " + (width_offset + cornerPoints.topLeftCorner.x) + ", " + cornerPoints.topLeftCorner.y;
	coords = coords + "L " + (width_offset + cornerPoints.bottomLeftCorner.x) + ", " + cornerPoints.bottomLeftCorner.y;
	coords = coords + "L " + (width_offset + cornerPoints.bottomRightCorner.x) + ", " + cornerPoints.bottomRightCorner.y;
	coords = coords + "L " + (width_offset + cornerPoints.topRightCorner.x) + ", " + cornerPoints.topRightCorner.y;
	coords = coords + "L " + (width_offset + cornerPoints.topLeftCorner.x) + ", " + cornerPoints.topLeftCorner.y;
	coords = coords + "L " + (width_offset + cornerPoints.topLeftCorner.x) + ", " + 0;
	coords = coords + "L " + window.camera_width + ", " + 0;
	coords = coords + "L " + window.camera_width + ", " + window.camera_height;
	coords = coords + "L " + 0 + ", " + window.camera_height;
	coords = coords + "L " + 0 + ", " + 0;
	

    var path = document.createElementNS(xmlns, "path");
    path.setAttributeNS(null, 'stroke', '#000000');
    path.setAttributeNS(null, 'stroke-width', 0);
    path.setAttributeNS(null, 'stroke-linejoin', "round");
    path.setAttributeNS(null, 'd', coords);
    //path.setAttributeNS(null, 'fill', "url(#gradient)");
    path.setAttributeNS(null, 'opacity', 0.5);
    g.appendChild(path);




    var g2 = document.createElementNS(xmlns, "g");
	var defs2 = document.createElementNS(xmlns, "defs");
	g2.appendChild(defs2);
    svgElem.appendChild(g2);


	//console.log("create_svg: cornerPoints.topLeftCorner x-offset before and after: ", cornerPoints.topLeftCorner.x, width_offset + cornerPoints.topLeftCorner.x);
	var coords2 = "M " + (width_offset + cornerPoints.bottomLeftCorner.x) + ", " + cornerPoints.bottomLeftCorner.y;
	coords2 = coords2 + "L " + (width_offset + cornerPoints.bottomRightCorner.x) + ", " + cornerPoints.bottomRightCorner.y;
	coords2 = coords2 + "L " + (width_offset + cornerPoints.topRightCorner.x) + ", " + cornerPoints.topRightCorner.y;
	coords2 = coords2 + "L " + (width_offset + cornerPoints.topLeftCorner.x) + ", " + cornerPoints.topLeftCorner.y;
	coords2 = coords2 + "L " + (width_offset + cornerPoints.bottomLeftCorner.x) + ", " + cornerPoints.bottomLeftCorner.y;

    var path2 = document.createElementNS(xmlns, "path");
    path2.setAttributeNS(null, 'stroke', strokeColor);
    path2.setAttributeNS(null, 'stroke-width', strokeWidth);
    path2.setAttributeNS(null, 'stroke-linejoin', "round");
	path2.setAttributeNS(null, 'fill', "none");
    path2.setAttributeNS(null, 'd', coords2);
    //path.setAttributeNS(null, 'fill', "url(#gradient)");
    path2.setAttributeNS(null, 'opacity', 0.8);
    g2.appendChild(path2);



	return svgElem;
    //var svgContainer = document.getElementById("svgContainer");
    //svgContainer.appendChild(svgElem);
}
window.create_svg = create_svg;



function scan_blob(image_blob){
	window.add_script('./camera_module.js',true) // add it as a module
	.then(() => {
		document.body.classList.add('show-rewrite');
		document.body.classList.add('doing-ocr');
		camera_do_ocr_details_el.open = true;
	})
	.catch((err) => {
		console.error("caught error loading camera_module script: ", err);
	})
}


stop_camera_button_el.addEventListener("click", (e) => {
	//console.log("stop_camera_button clicked");
	window.stop_camera();
	window.only_allow_voice_commands = false;
	document.body.classList.remove('show-camera');
});


// <summary> element inside the <details> element
camera_do_ocr_summary_button_el.addEventListener("click", (e) => {
	//console.log("toggle OCR button clicked");
	//console.log("camera_do_ocr_details_el.open: ", camera_do_ocr_details_el.open);
	if(camera_do_ocr_details_el.open){
		//console.log("OCR stopped");
		window.continuous_ocr_enabled = false;
		document.body.classList.remove('doing-ocr');
	}
	else{
		//console.log("OCR starting");
		if(window.settings.assistant == 'image_to_text_ocr'){
			console.error("somehow image_to_text_ocr was active while the rewrite tools were also active");
			switch_assistant('any_writer');
		}
		document.body.classList.add('doing-ocr');
		camera_container_el.classList.remove('ocr-scan-complete');
		//window.continuous_ocr_enabled = true;
		window.do_continuous_ocr();
	}
	window.continuous_image_to_text_enabled = false;
	camera_image_to_text_details_el.open = false; //removeAttribute('open');
});


camera_ocr_scan_button_el.addEventListener("click", (e) => {
	//console.log("camera_ocr_scan_button clicked");
	
	window.continuous_ocr_enabled = false;
	window.continuous_image_to_text_enabled = false;
	window.start_an_ocr_scan();
	camera_do_ocr_details_el.setAttribute('open',true);
	camera_image_to_text_details_el.removeAttribute('open');
});

window.start_an_ocr_scan = () => {
	//console.log("in window.start_an_ocr_scan");
	window.continuous_ocr_enabled = false;
	camera_do_ocr_details_el.open = false;
	camera_image_to_text_details_el.open = true;
	/*
	if(window.doing_ocr_scan == 0){
		window.ocr_scans = [];
		window.ocr_blobs = [];
		window.doing_ocr_scan = window.settings.ocr_scan_intensity;
		//document.body.classList.add('doing-ocr-scan');
		camera_container_el.classList.remove('ocr-scan-complete');
		window.do_continuous_ocr();
	}
	*/
	
	window.ocr_scans = [];
	window.ocr_blobs = [];
	window.doing_ocr_scan = window.settings.ocr_scan_intensity;
	//document.body.classList.add('doing-ocr-scan');
	camera_container_el.classList.remove('ocr-scan-complete');
	window.do_continuous_ocr();
	
	window.setTimeout(() => {
		window.doing_ocr_scan = window.settings.ocr_scan_intensity; // extend the scan / make the scan more intense by quickly pressing the scan button again
	},1);
}


camera_ocr_improve_button_el.addEventListener("click", (e) => {
	//console.log("camera_ocr_improve_button clicked");
	window.doing_ocr_scan = window.settings.ocr_scan_intensity;
	//document.body.classList.add('doing-ocr-scan');
	camera_container_el.classList.remove('ocr-scan-complete');
	window.do_continuous_ocr();
});

camera_ocr_scan_intensity_input_el.addEventListener("change", (event) => {
	//console.log("Changed OCR scan intensity slider to: ", camera_ocr_scan_intensity_input_el.value);
	window.settings.ocr_scan_intensity = parseInt(camera_ocr_scan_intensity_input_el.value);
	save_settings();
});

camera_ocr_auto_scan_input_el.addEventListener("change", (event) => {
	//console.log("clicked on camera_ocr_auto_scan_input_el. Checked?: ", camera_ocr_auto_scan_input_el.checked);
	window.settings.continuous_ocr_scan = camera_ocr_auto_scan_input_el.checked;
	window.continuous_ocr_enabled = camera_ocr_auto_scan_input_el.checked;
	save_settings();
	if(window.settings.continuous_ocr_scan){
		//console.log("continous_ocr_scanning is now switched on");
		window.doing_ocr_scan = window.settings.continuous_ocr_scan_intensity;
		do_continuous_ocr();
	}
});


camera_ocr_insert_button_el.addEventListener("click", (e) => {
	//console.log("camera_ocr_insert_button clicked");
	window.insert_ocr_scan_result();
});


camera_ocr_new_document_button_el.addEventListener("click", (e) => {
	//console.log("camera_ocr_save_button clicked");
	window.new_document_from_ocr_scan_result();
});





// EYE / IMAGE TO TEXT

// <summary> element inside the <details> element
camera_image_to_text_summary_button_el.addEventListener("click", (e) => {
	//console.log("toggle EYE button clicked");
	//console.log("camera_image_to_text_details_el.open: ", camera_image_to_text_details_el.open);
	window.only_allow_voice_commands = false;
	if(camera_image_to_text_details_el.open){ // is reversed (sic)
		//console.log("EYE stopped");
		document.body.classList.remove('doing-image-to-text');
		window.continuous_image_to_text_enabled = false;
	}
	else{
		//console.log("EYE starting");
		switch_assistant('any_writer');
		document.body.classList.add('doing-image-to-text');

		//window.start_camera();
		// Disable any OCR that was going on
		camera_do_ocr_details_el.open = false;
		document.body.classList.remove('doing-ocr');
		document.body.classList.remove('doing-ocr-scan');
		//camera_container_el.classList.remove('ocr-scan-complete');
		window.continuous_ocr_enabled = false;
		
		window.continuous_image_to_text_enabled = true;
		
		
		window.add_script('./camera_module.js',true) // add it as a module
		.then(() => {
			return window.add_script('./image_to_text_module.js',true) // add it as a module
		})
		.then(() => {
			window.do_continuous_image_to_text();
		})
		.catch((err) => {
			console.error("caught error loading image_to_text module script: ", err);
		});
		live_image_to_text_output_el.value = '';
		
	}
});


image_to_text_prompt_camera_button_el.addEventListener("click", (event) => {
	toggle_image_to_text_camera();
})


function toggle_image_to_text_camera(){
	//console.log("camera-to-text prompt settings button clicked");
	//if(typeof window.get_camera_jpeg_blob === 'function'){
		
		if(window.showing_camera_still == null){
			window.showing_camera_still = true;
			document.body.classList.remove('hide-camera-still');
			console.warn("window.showing_camera_still was still null. Starting camera.");
			
			window.add_script('./camera_module.js',true) // add it as a module
			.then(() => {
				window.start_camera();
			})
			.catch((err) => {
				console.error("caught error loading camera_module script: ", err);
			})
		}
		
		if(typeof window.showing_camera_still == 'boolean'){
			window.showing_camera_still = !window.showing_camera_still;s
			if(window.showing_camera_still){
				document.body.classList.remove('hide-camera-still');
				window.get_camera_jpeg_blob()
				.then((blob_from_camera) => {
					//console.log("BLOB FROM CAMERA: ", blob_from_camera); 
					// SIC
					// blob has already been set as window.last_image_to_text_blob by .get_camera_jpeg_blob;
					
				})
				.catch((err) => {
					console.error("caught error trying to take picture from video stream for image_to_text assistant: ", err);
				})
			}
			else{
				document.body.classList.add('hide-camera-still');
			}
		}
		
		image_to_text_prompt_camera_button_el.classList.add('no-pointer-events');
		setTimeout(() => {
			image_to_text_prompt_camera_button_el.classList.remove('no-pointer-events');
		},1000);
		
		
	
	/*
	}
	else{
		console.error("window.get_camera_jpeg_blob was not a function");
	}
	*/
}



image_to_text_upload_input_el.addEventListener("change", async (event) => {
	//console.log("image_to_text_upload_input_el changed");
	
	window.showing_camera_still = null;
	document.body.classList.remove('hide-camera-still');
	
	if(window.camera_streaming === true){
		window.stop_camera();
	}
	
    var fs_files = event.target.files || [];
    if (!fs_files.length){
		//flash_message("no file selected?",3000,'warn');
        console.warn("image_to_text_upload: no file selected?");
        //alert("no files selected?");
        return;
    }
	else if(fs_files.length == 1){
		const file_object = fs_files[0];
		
		const fr = new FileReader()
		fr.onload = function() {
			//console.log("got blob from file reader");
		    const blob = new Blob([fr.result])
			window.last_image_to_text_blob = blob;
			window.last_image_to_text_blob_file = null; // this image blob does not refer to a file in the file manager
		    
		    const blob_url = URL.createObjectURL(blob, {type: file_object.type});
		    image_to_text_prompt_image_el.src = blob_url;
			
		}
		fr.readAsArrayBuffer(file_object);
		
	}
	else if(fs_files.length > 1){
		// TODO: apply the current prompt to all these images, and create tasks for all of them
	}
	
})

// TOOLS: Live camera: describe one camera frame
camera_image_to_text_describe_button_el.addEventListener("click", (e) => {
	//console.log("camera_ocr_scan_button clicked");
	window.continuous_image_to_text_enabled = false;
	window.continuous_ocr_enabled = false;
	document.body.classList.remove('doing-ocr-scan');
	camera_image_to_text_auto_scan_input_el.checked = false;
	window.settings['continous_image_to_text'] = false;
	camera_overlay_svg_container_el.innerHTML = '';
	
	window.add_script('./camera_module.js',true) // add it as a module
	.then(() => {
		return window.add_script('./image_to_text_module.js',true) // add it as a module
	})
	.then(() => {
		window.describe_one_camera_frame();
	})
	.catch((err) => {
		console.error("caught error loading image_to_text module script: ", err);
	});
	live_image_to_text_output_el.value = '';
});


camera_image_to_text_insert_button_el.addEventListener("click", (e) => {
	//console.log("camera_ocr_insert_button clicked");
	window.insert_image_to_text_scan_result();
});


camera_image_to_text_new_document_button_el.addEventListener("click", (e) => {
	//console.log("camera_ocr_save_button clicked");
	window.new_document_from_image_to_text_scan_result();
});

camera_image_to_text_auto_scan_input_el.addEventListener("change", (e) => {
	//console.log("image to text continuous scanning checkbox state changed: ", camera_image_to_text_auto_scan_input_el.checked);
	
	window.continuous_image_to_text_enabled = camera_image_to_text_auto_scan_input_el.checked;
	window.settings.continuous_image_to_text_scan = camera_image_to_text_auto_scan_input_el.checked;
	
	if(window.continuous_image_to_text_enabled){
		live_image_to_text_output_el.value = ' ';
	}
	if(window.settings.continuous_image_to_text_scan){
		//console.log("enabling continuous image_to_text scanning");
		window.add_script('./camera_module.js',true) // add it as a module
		.then(() => {
			return window.add_script('./image_to_text_module.js',true) // add it as a module
		})
		.then(() => {
			window.do_continuous_image_to_text();
		})
		.catch((err) => {
			console.error("caught error loading image_to_text module script: ", err);
		});
		live_image_to_text_output_el.value = '';
	}
});

camera_image_to_text_save_auto_scan_input_el.addEventListener("change", (e) => {
	//console.log("image to text save to document checkbox state changed: ", camera_image_to_text_save_auto_scan_input_el.checked);
	//console.log("window.settings.docs.open: ", window.settings.docs.open);
	if(camera_image_to_text_save_auto_scan_input_el.checked && (window.settings.docs.open == null || document.body.classList.contains('viewing-image') )){
		//console.log("should create a new empty document to save the image-to-text scans into");
		const new_date_time = make_date_string();
		create_new_document(get_translation('image_to_text_name') + ' - ' + new_date_time + '\n\n', get_translation('image_to_text_name') + "-" + new_date_time + ".txt")
		.then(() => {
			setTimeout(() => {
				scroll_to_end();
			},1);
		})
		.catch((err) => {
			console.error("caught error creating new empty document to save continous OCR into: ", err);
		})
	}
});



//
//  TUTORIAL
//

document.getElementById('clear-recent-files-button').addEventListener("click", (e) => {
	window.settings.docs.recent = [];
	save_settings();
	document.body.classList.remove('has-recent-documents');
	recently_opened_documents_list_el.innerHTML = '';
});


// Add more characters dialog
document.getElementById('more-characters-dialog-new-button').addEventListener("click", (e) => {
	more_characters_dialog_el.close();
	window.ai_being_edited = null;
	start_making_custom_ai();
});
document.getElementById('more-characters-reddit-button').addEventListener("click", (e) => {
	more_characters_dialog_el.close();
});



// Add more blueprints dialog
document.getElementById('more-blueprints-dialog-new-button').addEventListener("click", (e) => {
	//console.log("clicked on more-blueprints-dialog-new-button");
	more_blueprints_dialog_el.close();
	window.add_script('./specials/blueprint_tutorial.js');
});
document.getElementById('more-blueprints-reddit-button').addEventListener("click", (e) => {
	more_blueprints_dialog_el.close();
});


document.getElementById('share-prompt-model-system-prompt-examples').addEventListener("mousedown", (e) => {
	try{
		const example_prompt_id = e.target.getAttribute('data-example-prompt');
		if(typeof example_prompt_id == 'string'){
			//console.log("example_prompt_id: ", example_prompt_id);
			let system_prompt_example_text = get_translation('system_prompt_example_' + example_prompt_id);
			//console.log("system_prompt_example_text: ", system_prompt_example_text);
			if(!system_prompt_example_text.startsWith('prompt')){
				share_prompt_model_system_prompt_el.value = system_prompt_example_text;
			}
			let second_prompt_example_text = get_translation('second_prompt_example_' + example_prompt_id);
			if(!second_prompt_example_text.startsWith('prompt')){
				share_prompt_model_second_prompt_el.value = second_prompt_example_text;
			}
		}
	}
	catch(err){
		console.error("click on element that was not an example button. Err: ", err);
	}
});
















//
//  SHOW MODEL INFO
//

function show_model_info(){
	//console.log("in show_model_info");
	
	model_info_container_el.innerHTML = '';
	new_custom_ai_model_emoji_editor_container_el.innerHTML = ''; // avoid having two emoji  editors open at the same time
	
	document.body.classList.remove('busy-editing-assistant');
	document.body.classList.remove('busy-editing-received-ai');
	
	if(window.settings.assistant == 'speak'){
		window.settings.assistant = 'speaker';
	}
	if(typeof window.assistants[window.settings.assistant] == 'undefined' && typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
		console.error("show_model_info: unknown assistant: ", window.settings.assistant);
		return
	}
	
	// model info big icon
	let model_info_icon_container_el = document.createElement('div');
	model_info_icon_container_el.setAttribute('id','model-info-icon-container');
		
	if(!window.settings.assistant.startsWith('custom_saved')){	
		let model_info_icon_el = document.createElement('img');
		model_info_icon_el.setAttribute('id','model-info-icon');
		model_info_icon_el.classList.add('model-info-icon');
		model_info_icon_el.src = chat_header_icon_el.src.replace('_thumb','');
		//model_info_icon_el.src = 'images/' + window.settings.assistant + '.png';
		model_info_icon_el.alt = 'AI model icon';
		model_info_icon_container_el.appendChild(model_info_icon_el);
		/*
		let model_info_icon_el2 = document.createElement('img');
		model_info_icon_el2.setAttribute('id','model-info-icon2');
		model_info_icon_el2.classList.add('model-info-icon');
		model_info_icon_el2.src = 'images/' + window.settings.assistant + '.png';
		model_info_icon_el2.alt = 'invisible AI model icon';
		model_info_icon_container_el.appendChild(model_info_icon_el2);
		*/
	}
	
	// model info content
	let model_info_content_el = document.createElement('div');
	model_info_content_el.setAttribute('id','model-info-content');
	
		let model_info_summary_el = document.createElement('p');
		model_info_summary_el.classList.add('model-info-about-text');
		if(typeof window.translations[window.settings.assistant + '_model_info'] != 'undefined'){
			model_info_summary_el.textContent = get_translation(window.settings.assistant + '_model_info',null,true); // return_empty_string=true
		}
		else if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant]['custom_description'] == 'string'){
			model_info_summary_el.textContent = window.settings.assistants[window.settings.assistant]['custom_description'];
		}
		

	let model_info_details_el = document.createElement('ul');
	model_info_details_el.classList.add('model-info-details-list');

	let model_info_buttons_el = document.createElement('div');
	model_info_buttons_el.classList.add('model-info-buttons-container');
	
	let model_info_settings_el = document.createElement('div');
	model_info_settings_el.classList.add('model-info-settings-container');
	
	
	
	
	
	try{
		
		
		
		// LIST OF DETAILS
		
		
		// HOMEPAGE
		
		let homepage_url = null;
		if(typeof window.assistants[window.settings.assistant].homepage_url == 'string' && window.assistants[window.settings.assistant].homepage_url.startsWith('http')){
			homepage_url = window.assistants[window.settings.assistant].homepage_url;
		}
		else if(typeof window.assistants[window.settings.assistant].download_url == 'string' && window.assistants[window.settings.assistant].download_url.startsWith('http')){
			let possible_homepage_url = window.assistants[window.settings.assistant].download_url;
			// create shorter homepage link, currently assuming huggingface is the source
			let homepage_parts = possible_homepage_url.split('/');
			if(possible_homepage_url.indexOf('huggingface') != -1){
				homepage_parts = homepage_parts.slice(0, 5);
			}else{
				homepage_parts = homepage_parts.slice(0, 3);
			}
			homepage_url = homepage_parts.join('/');
		}
		//console.log("homepage_url: ", homepage_url);
		if(homepage_url){
			
			let homepage_detail_el = document.createElement('li');
			homepage_detail_el.classList.add('model-info-detail-simple');
			homepage_detail_el.classList.add('flex-align-center');
			homepage_detail_el.innerHTML = '<span class="model-info-detail-label">' + get_translation('website') + '</span><span class="model-info-detail-value"><a class="model-info-homepage-link link-as-button" href="' + homepage_url + '" target="_blank" rel="noreferrer" role="button">' + get_translation('Visit') + '</a</span>';
			model_info_details_el.appendChild(homepage_detail_el);
			
		}
		
		
		
		// LICENSE
		
		if(typeof window.assistants[window.settings.assistant].license_url == 'string'){
			//console.log("window.assistants[window.settings.assistant].license_url: ", window.assistants[window.settings.assistant].license_url);
			if(window.assistants[window.settings.assistant].license_url.startsWith('http')){
				
				
				let licence_button_value = get_translation('Read');
				if(typeof window.assistants[window.settings.assistant].license == 'string' && window.assistants[window.settings.assistant].license.length > 2 && window.assistants[window.settings.assistant].license.length < 10){
					licence_button_value = window.assistants[window.settings.assistant].license;
				}
				
				let license_detail_el = document.createElement('li');
				license_detail_el.classList.add('model-info-detail-simple');
				license_detail_el.classList.add('flex-align-center');
				license_detail_el.innerHTML = '<span class="model-info-detail-label">' + get_translation('license') + '</span><span class="model-info-detail-value"><a class="model-info-license-link link-as-button" href="' + window.assistants[window.settings.assistant].license_url + '" target="_blank" rel="noreferrer" role="button">' + licence_button_value + '</a</span>';
				model_info_details_el.appendChild(license_detail_el);
				
			}
			
		}
		
		
		// FILE SIZE
		
		let file_size = null;
		if(typeof window.settings.assistants[window.settings.assistant].size == 'number'){
			file_size = window.settings.assistants[window.settings.assistant].size;
		}
		else if(typeof window.assistants[window.settings.assistant].size == 'number'){
			file_size = window.assistants[window.settings.assistant].size;
		}
		if(typeof file_size == 'number'){
			let file_size_detail_el = document.createElement('li');
			file_size_detail_el.classList.add('model-info-detail-simple');
			file_size_detail_el.innerHTML = '<span class="model-info-detail-label" data-i18n="File_size">' + get_translation('File_size') + '</span><span class="model-info-detail-value">' + file_size + '<span class="ai-model-size-gb">GB</span></span>';
			model_info_details_el.appendChild(file_size_detail_el);
		}
		
		
		
		
		// ASSISTANT_ID
		
		let debug_detail_el = document.createElement('li');
		debug_detail_el.classList.add('model-info-detail-simple');
		debug_detail_el.classList.add('show-if-developer');
		debug_detail_el.innerHTML = '<span class="model-info-detail-label">assistant_id</span><span class="model-info-detail-value">' + window.settings.assistant + '</span>';
		model_info_details_el.appendChild(debug_detail_el);
		
	
		
		// CLONE_OF
		
		if(typeof window.settings.assistants[window.settings.assistant].clone_original == 'string' && window.settings.assistants[window.settings.assistant].clone_original.length > 1){ // && window.settings.settings_complexity != 'normal'
			let clone_original_detail_el = document.createElement('li');
			clone_original_detail_el.classList.add('model-info-detail-simple');
			clone_original_detail_el.classList.add('show-if-advanced');
			clone_original_detail_el.innerHTML = '<span class="model-info-detail-label" data-i18n="Clone_of">' + get_translation('Clone_of') + '</span>';
			
			let clone_original_name_el = document.createElement('span');
			clone_original_name_el.classList.add('model-info-detail-value');
			clone_original_name_el.classList.add('model-info-detail-clone-of-value');
			if(window.settings.settings_complexity == 'developer'){
				clone_original_name_el.textContent = window.settings.assistants[window.settings.assistant].clone_original;
			}
			else{
				clone_original_name_el.setAttribute('data-i18n', window.settings.assistants[window.settings.assistant].clone_original + '_name');
				clone_original_name_el.textContent = get_translation(window.settings.assistants[window.settings.assistant].clone_original + '_name');
			}
			
			clone_original_name_el.addEventListener('click', () => {
				//console.log("clicked on clone original name");
				switch_assistant(window.settings.assistants[window.settings.assistant].clone_original);
			})
			clone_original_detail_el.appendChild(clone_original_name_el);
			
			
			model_info_details_el.appendChild(clone_original_detail_el);
		}
		
		
		
		
		if(window.settings.assistant == 'translator'){
			
			//console.error(" OK TRANSLATOR. window.cached_urls: ", window.cached_urls.length, window.cached_urls);
			let cached_languages_list_el = document.createElement('ul');
			
			let spotted_language_models = [];
			
			let found_cached_language = false;
			if(window.cached_urls && Array.isArray(window.cached_urls)){
				for(let l = 0; l < window.cached_urls.length; l++){
					//console.log("window.cached_urls[l]: ", window.cached_urls[l]);
					if(typeof window.cached_urls[l] == 'string' && window.cached_urls[l].indexOf('/opus-mt-') != -1){
						let language_duo = window.cached_urls[l].split('/opus-mt-')[1];
						language_duo = language_duo.split('/')[0];
						if(language_duo.indexOf('-') != -1 && language_duo.indexOf('-') == language_duo.lastIndexOf('-')){
							if(spotted_language_models.indexOf(language_duo) == -1){
								spotted_language_models.push(language_duo);
								//console.log("translation models list: spotted language_duo: ", language_duo);
								found_cached_language = true;
								language_duo = language_duo.split('-');
								for(let ld = 0; ld < language_duo.length; ld++){
									if(language_duo[ld] == 'mul'){language_duo[ld] = 'multi (abk, acm, ady, afb, afh_Latn, afr, akl_Latn, aln, amh, ang_Latn, apc, ara, arg, arq, ary, arz, asm, ast, avk_Latn, awa, aze_Latn, bak, bam_Latn, bel, bel_Latn, ben, bho, bod, bos_Latn, bre, brx, brx_Latn, bul, bul_Latn, cat, ceb, ces, cha, che, chr, chv, cjy_Hans, cjy_Hant, cmn, cmn_Hans, cmn_Hant, cor, cos, crh, crh_Latn, csb_Latn, cym, dan, deu, dsb, dtp, dws_Latn, egl, ell, enm_Latn, epo, est, eus, ewe, ext, fao, fij, fin, fkv_Latn, fra, frm_Latn, frr, fry, fuc, fuv, gan, gcf_Latn, gil, gla, gle, glg, glv, gom, gos, got_Goth, grc_Grek, grn, gsw, guj, hat, hau_Latn, haw, heb, hif_Latn, hil, hin, hnj_Latn, hoc, hoc_Latn, hrv, hsb, hun, hye, iba, ibo, ido, ido_Latn, ike_Latn, ile_Latn, ilo, ina_Latn, ind, isl, ita, izh, jav, jav_Java, jbo, jbo_Cyrl, jbo_Latn, jdt_Cyrl, jpn, kab, kal, kan, kat, kaz_Cyrl, kaz_Latn, kek_Latn, kha, khm, khm_Latn, kin, kir_Cyrl, kjh, kpv, krl, ksh, kum, kur_Arab, kur_Latn, lad, lad_Latn, lao, lat_Latn, lav, ldn_Latn, lfn_Cyrl, lfn_Latn, lij, lin, lit, liv_Latn, lkt, lld_Latn, lmo, ltg, ltz, lug, lzh, lzh_Hans, mad, mah, mai, mal, mar, max_Latn, mdf, mfe, mhr, mic, min, mkd, mlg, mlt, mnw, moh, mon, mri, mwl, mww, mya, myv, nan, nau, nav, nds, niu, nld, nno, nob, nob_Hebr, nog, non_Latn, nov_Latn, npi, nya, oci, ori, orv_Cyrl, oss, ota_Arab, ota_Latn, pag, pan_Guru, pap, pau, pdc, pes, pes_Latn, pes_Thaa, pms, pnb, pol, por, ppl_Latn, prg_Latn, pus, quc, qya, qya_Latn, rap, rif_Latn, roh, rom, ron, rue, run, rus, sag, sah, san_Deva, scn, sco, sgs, shs_Latn, shy_Latn, sin, sjn_Latn, slv, sma, sme, smo, sna, snd_Arab, som, spa, sqi, srp_Cyrl, srp_Latn, stq, sun, swe, swg, swh, tah, tam, tat, tat_Arab, tat_Latn, tel, tet, tgk_Cyrl, tha, tir, tlh_Latn, tly_Latn, tmw_Latn, toi_Latn, ton, tpw_Latn, tso, tuk, tuk_Latn, tur, tvl, tyv, tzl, tzl_Latn, udm, uig_Arab, uig_Cyrl, ukr, umb, urd, uzb_Cyrl, uzb_Latn, vec, vie, vie_Hani, vol_Latn, vro, war, wln, wol, wuu, xal, xho, yid, yor, yue, yue_Hans, yue_Hant, zho, zho_Hans, zho_Hant, zlm_Latn, zsm_Latn, zul, zza)'}
									if(language_duo[ld] == 'ROMANCE'){language_duo[ld] = 'Romantic languages (fr, fr_BE, fr_CA, fr_FR, wa, frp, oc, ca, rm, lld, fur, lij, lmo, es, es_AR, es_CL, es_CO, es_CR, es_DO, es_EC, es_ES, es_GT, es_HN, es_MX, es_NI, es_PA, es_PE, es_PR, es_SV, es_UY, es_VE, pt, pt_br, pt_BR, pt_PT, gl, lad, an, mwl, it, it_IT, co, nap, scn, vec, sc, ro, la)'}
									if(language_duo[ld] == 'gmw'){language_duo[ld] = 'West-Germanic languages (afr, ang_Latn, deu, eng, enm_Latn, frr, fry, gos, gsw, ksh, ltz, nds, nld, pdc, sco, stq, swg, yid)'}
								}
							
								let cached_languages_item_el = document.createElement('li');
								cached_languages_item_el.classList.add('language-model-list-item');
								cached_languages_item_el.innerHTML = '<span class="language-duo-wrapper"><span>' + language_duo[0] + '</span><span> -> </span><span>' + language_duo[1] + '</span></span>';
							
								cached_languages_list_el.appendChild(cached_languages_item_el);
							}
						
						}
					}
				
				}
			}
			
			if(found_cached_language){
				let model_info_details_cached_languages_item_el = document.createElement('li');
				model_info_details_cached_languages_item_el.classList.add('model-info-detail-simple');
				
				let cached_languages_label_el = document.createElement('span');
				cached_languages_label_el.classList.add('model-info-detail-label');
				cached_languages_label_el.setAttribute('data-i18n','Downloaded_language_models');
				cached_languages_label_el.textContent = get_translation('Downloaded_language_models');
				model_info_details_cached_languages_item_el.appendChild(cached_languages_label_el);
				
				model_info_details_cached_languages_item_el.appendChild(cached_languages_list_el); // sub-list
				model_info_details_el.appendChild(model_info_details_cached_languages_item_el);
			}
		}
		
		
		
		
		
		
		
		
		// MODEL INFO BUTTONS
		
		
		// MODEL INFO SETTINGS
		
		// Save received model URL / Clone AI model
		//if((window.settings.assistant.startsWith('custom') || window.settings.settings_complexity != 'normal') && (typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant]['media'] != 'undefined' && typeof window.assistants[window.settings.assistant]['media'].indexOf('text') != -1 && window.assistants[window.settings.assistant]['media'].length == 1)){
		if(window.settings.assistant.startsWith('custom')){
		
			//console.log("creating model settings for cloning the model as a custom model");
			
			let save_received_container_el = document.createElement('div');
			save_received_container_el.classList.add('model-info-setting-container');
			save_received_container_el.setAttribute('id','model-info-save-received-container');

			let save_received_title_el = document.createElement('div');
			save_received_title_el.classList.add('model-info-setting-title');
			
			save_received_title_el.textContent = get_translation('Details');
			save_received_title_el.setAttribute('data-i18n','Details');
			/*
			if(window.settings.assistant == 'custom_received'){
				
			}
			else{
				save_received_title_el.textContent = get_translation('Clone_this_AI_model');
				save_received_title_el.setAttribute('data-i18n','Clone_this_AI_model');
			}
			*/
			save_received_container_el.appendChild(save_received_title_el);
			
			
			// Save AI model name input
			/*
			let save_received_label_el = document.createElement('label');
			save_received_label_el.classList.add('simple-label');
			save_received_label_el.setAttribute('id','model-info-save-received-name-label');
			save_received_container_el.appendChild(save_received_label_el);
			*/
			
			
			
			// CUSTOM EMOJI ICON
			if(window.settings.assistant.startsWith('custom')){
				const custom_icon_container_el = create_emoji_editor(window.settings.assistant);
				if(custom_icon_container_el){
					save_received_container_el.appendChild(custom_icon_container_el);
				}
			}
			
			
			
			
			// CUSTOM NAME
			let save_received_name_el = document.createElement('input');
			save_received_name_el.classList.add('model-info-prompt');
			save_received_name_el.setAttribute('id','model-info-save-received-name-input');
			save_received_name_el.setAttribute('placeholder',get_translation("AI_model_name"));
			if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant]['custom_name'] == 'string'){
				save_received_name_el.value = window.settings.assistants[window.settings.assistant]['custom_name'];
			}
			
			save_received_name_el.addEventListener('input', () => {
				//console.log("model name changed: ", save_received_name_el.value);
				if(save_received_name_el.value.length){
					
					if(save_received_name_el.value.trim().length > 20){
						flash_message(get_translation("The_name_is_too_long"),3000,'error');
						save_received_name_el.value = save_received_name_el.value.trim().substr(0,20);
						return
					}
					
					window.settings.assistants[window.settings.assistant]['custom_name'] = save_received_name_el.value;
					//window.assistants[window.settings.assistant]['custom_name'] = save_received_name_el.value;
					save_settings();
					generate_ui();
				}
				
			});
			save_received_container_el.appendChild(save_received_name_el);
			
			
			
			
			
			
			
			
			
			
			// CUSTOM DESCRIPTION
			
			// Save AI model description textarea
			/*
			let save_received_description_label_el = document.createElement('label');
			save_received_description_label_el.classList.add('simple-label');
			save_received_description_label_el.setAttribute('id','model-info-save-received-description-label');
			save_received_container_el.appendChild(save_received_description_label_el);
			*/
			let save_received_description_el = document.createElement('textarea');
			save_received_description_el.classList.add('model-info-prompt');
			save_received_description_el.setAttribute('id','model-info-save-received-description-textarea');
			save_received_description_el.setAttribute('placeholder',get_translation("AI_model_description"));
			if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant]['custom_description'] == 'string'){
				save_received_description_el.value = window.settings.assistants[window.settings.assistant]['custom_description'];
			}
			save_received_description_el.addEventListener('input', () => {
				
				if(save_received_description_el.value.trim().length > 50){
					flash_message(get_translation("The_description_is_too_long"),3000,'error');
					save_received_description_el.value = save_received_description_el.value.trim().substr(0,50);
					return
				}
				
				//console.log("model name changed: ", save_received_description_el.value);
				window.settings.assistants[window.settings.assistant]['custom_description'] = save_received_description_el.value;
				//window.assistants[window.settings.assistant]['custom_description'] = save_received_description_el.value;
				save_settings();
				generate_ui();
				
			});
			save_received_container_el.appendChild(save_received_description_el);
			
			model_info_settings_el.appendChild(save_received_container_el);
			
		}
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		// temperature slider
		//if(typeof window.assistants[window.settings.assistant].temperature == 'number' || window.settings.settings_complexity != 'normal'){
		//}
		
		if(window.settings.assistant != 'developer' && window.settings.assistant != 'image_to_text_ocr'){
			let creativity_slider_container_el = document.createElement('div');
			creativity_slider_container_el.classList.add('model-info-setting-container');
			creativity_slider_container_el.setAttribute('id','creativity-slider-container');
		
			let creativity_slider_title_el = document.createElement('div');
			creativity_slider_title_el.classList.add('model-info-setting-title');
			creativity_slider_title_el.textContent = get_translation('creativity');
			creativity_slider_title_el.setAttribute('data-i18n','creativity');
			let temperature_slider_poles_middle_el = document.createElement('span');
		
			creativity_slider_container_el.appendChild(creativity_slider_title_el);
	
			let model_temperature = 0.7;
			if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant].temperature == 'number' ){
				model_temperature = window.settings.assistants[window.settings.assistant].temperature;
			}
			else if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant].temperature == 'number'){
				model_temperature = window.assistants[window.settings.assistant].temperature;
			}
		
	
			let creativity_slider_el = document.createElement('input');
			creativity_slider_el.setAttribute('id','creativity-slider');
			creativity_slider_el.setAttribute('type','range');
			creativity_slider_el.setAttribute('min',0);
			creativity_slider_el.setAttribute('max',1.4);
			creativity_slider_el.setAttribute('step',0.05);
			creativity_slider_el.value = model_temperature;
		
			creativity_slider_el.addEventListener("change",() => {
				
				if(typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
					window.settings.assistants[window.settings.assistant] = {};
				}
				window.settings.assistants[window.settings.assistant]['temperature'] = parseFloat(creativity_slider_el.value);
				//console.log("manually changed temperature to: ", window.settings.assistants[window.settings.assistant]['temperature']);
				save_settings();
				
				/*
				if(window.settings.settings_complexity != 'normal'){
					temperature_slider_poles_middle_el.textContent = creativity_slider_el.value;
				}
				*/
				temperature_slider_poles_middle_el.textContent = creativity_slider_el.value;
			
			});
		
			creativity_slider_container_el.appendChild(creativity_slider_el);
		
			let creativity_slider_poles_el = document.createElement('div');
			creativity_slider_poles_el.classList.add('model-info-slider-poles');
			creativity_slider_poles_el.classList.add('flex-between');
		
			if(window.settings.settings_complexity == 'normal'){
				creativity_slider_poles_el.innerHTML = '<span data-i18n="factual">' + get_translation('factual') + '</span><span data-i18n="artistic">' + get_translation('artistic') + '</span>';
			}
			else{
				let temperature_slider_poles_left_el = document.createElement('span');
				temperature_slider_poles_left_el.textContent = '0';
				creativity_slider_poles_el.appendChild(temperature_slider_poles_left_el);
		
				temperature_slider_poles_middle_el.classList.add('model-info-slider-current-value');
				temperature_slider_poles_middle_el.textContent = model_temperature;
				creativity_slider_poles_el.appendChild(temperature_slider_poles_middle_el);
			
				let temperature_slider_poles_right_el = document.createElement('span');
				temperature_slider_poles_right_el.textContent = '1.4';
				creativity_slider_poles_el.appendChild(temperature_slider_poles_right_el);
			}
		
		
		
			creativity_slider_container_el.appendChild(creativity_slider_poles_el);
		
			let creativity_slider_explanation_details_el = document.createElement('details');
			let creativity_slider_explanation_summary_el = document.createElement('summary');
			creativity_slider_explanation_summary_el.textContent = get_translation('what_does_this_do');
			creativity_slider_explanation_details_el.appendChild(creativity_slider_explanation_summary_el);
		
			let creativity_slider_explanation_el = document.createElement('p');
			creativity_slider_explanation_el.classList.add('model-info-slider-explanation');
			creativity_slider_explanation_el.textContent = get_translation('model_creativity_explanation');
			creativity_slider_explanation_el.setAttribute('data-i18n','model_creativity_explanation');
			creativity_slider_explanation_details_el.appendChild(creativity_slider_explanation_el);
		
			creativity_slider_container_el.appendChild(creativity_slider_explanation_details_el);
	
			model_info_settings_el.appendChild(creativity_slider_container_el);
		
		
			// context slider
		
			let model_context = 1024;
			/*
			if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && window.settings.assistants[window.settings.assistant].context_size == 'number' ){
				model_context = window.settings.assistants[window.settings.assistant].context_size;
			}
			else 
			*/
			if(typeof window.assistants[window.settings.assistant].context_size == 'number'){
				model_context = window.assistants[window.settings.assistant].context_size;
			}
			//console.log("model_context: ", model_context);
		
			if(model_context > 1024){
				let context_slider_container_el = document.createElement('div');
				context_slider_container_el.classList.add('model-info-setting-container');
				context_slider_container_el.classList.add('show-if-advanced');
				context_slider_container_el.setAttribute('id','context-slider-container');
			
				let context_slider_title_el = document.createElement('div');
				context_slider_title_el.classList.add('model-info-setting-title');
				context_slider_title_el.textContent = get_translation('Memory');
				context_slider_title_el.setAttribute('data-i18n','Memory');
		
				let context_slider_poles_middle_el = document.createElement('span');
		
				context_slider_container_el.appendChild(context_slider_title_el);
	
				// Maximum possible context size
				let model_context = 1024;
				if(typeof window.assistants[window.settings.assistant].context_size == 'number'){
					model_context = window.assistants[window.settings.assistant].context_size;
				}
			
				// Currently set context size
				let current_context = 1024;
				if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant].context == 'number' ){
					current_context = window.settings.assistants[window.settings.assistant].context;
				}
				else if(typeof window.assistants[window.settings.assistant].context == 'number'){
					current_context = window.assistants[window.settings.assistant].context;
				}
			
				/*
				let max_loga = getBaseLog(2,(model_context/512));
				//console.log("model_context max_loga: ", max_loga);
			
				//console.log("getting loga for current_context: ", current_context, current_context/512);
				let loga = getBaseLog(2,(current_context/512));
				//console.log("current_context loga: ", loga);
				loga = Math.floor(loga);
				*/
				
				let max_loga = Math.round(model_context / 1024);
				let loga = Math.round(current_context / 1024);
				
				let context_slider_el = document.createElement('input');
				context_slider_el.setAttribute('id','context-slider');
				context_slider_el.setAttribute('type','range');
				context_slider_el.setAttribute('min',1);
				context_slider_el.setAttribute('max',max_loga);
				context_slider_el.setAttribute('step',1);
				context_slider_el.value = loga;
			
				context_slider_el.addEventListener("change",() => {
					//window.context = context_slider_el.value;
					//console.log("manually changed context to:  context_slider_el.value:", context_slider_el.value, " -> ", 512 * Math.pow(2,context_slider_el.value));
					if(typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
						window.settings.assistants[window.settings.assistant] = {}
					}
					//window.settings.assistants[window.settings.assistant]['context'] = 512 * Math.pow(2,parseFloat(context_slider_el.value));
					window.settings.assistants[window.settings.assistant]['context'] = parseInt(context_slider_el.value) * 1024;
					save_settings();
			
					//context_slider_poles_middle_el.textContent = (Math.pow(2,parseFloat(context_slider_el.value))) / 2 + 'K';
					context_slider_poles_middle_el.innerHTML = context_slider_el.value + 'K (±' + (parseInt(context_slider_el.value) * 400) + ' words, ' + (parseInt(context_slider_el.value) /2) + '<span class="ai-model-size-gb">GB</span>)';
				});
		
				context_slider_container_el.appendChild(context_slider_el);
			
				let context_slider_poles_el = document.createElement('div');
				context_slider_poles_el.classList.add('model-info-slider-poles');
				context_slider_poles_el.classList.add('flex-between');
		
				let context_slider_poles_left_el = document.createElement('span');
				context_slider_poles_left_el.textContent = '1K';
				context_slider_poles_el.appendChild(context_slider_poles_left_el);
			
				context_slider_poles_middle_el.classList.add('model-info-slider-current-value');
				//context_slider_poles_middle_el.textContent = (Math.pow(2,loga))/2 + 'K'; //loga + 'K';
				context_slider_poles_middle_el.innerHTML = loga + 'K (±' + (loga * 400) + ' words, ' + (loga /2) + '<span class="ai-model-size-gb">GB</span>)';
				context_slider_poles_el.appendChild(context_slider_poles_middle_el);
		
				let context_slider_poles_right_el = document.createElement('span');
				//context_slider_poles_right_el.textContent = (Math.pow(2,max_loga))/2 + 'K';
				context_slider_poles_right_el.textContent = max_loga + 'K';
				context_slider_poles_el.appendChild(context_slider_poles_right_el);
		
				//c = Math.log(a)/Math.log(2)
				//context_slider_poles_el.innerHTML = '<span>1K</span><span>' + Math.pow(loga, 2) + 'K</span>';
		
				context_slider_container_el.appendChild(context_slider_poles_el);
		
		
				let context_current_doc_el = document.createElement('div');
				context_current_doc_el.classList.add('model-info-content-current-document-stats');
				context_current_doc_el.classList.add('show-if-advanced');
				context_current_doc_el.classList.add('area');
				context_current_doc_el.innerHTML = '<div class="flex-between"><span data-i18n="Words_in_the_current_document">' + get_translation('Words_in_the_current_document') + ':</span><span id="model-info-words-in-current-document">-</span></div>';
				context_current_doc_el.innerHTML += '<div class="flex-between"><span data-i18n="Words_in_the_current_selection">' + get_translation('Words_in_the_current_selection') + ':</span><span id="model-info-words-in-current-selection">-</span></div>';
				context_slider_container_el.appendChild(context_current_doc_el);
		
				let context_slider_explanation_details_el = document.createElement('details');
				let context_slider_explanation_summary_el = document.createElement('summary');
				context_slider_explanation_summary_el.textContent = get_translation('what_does_this_do');
				context_slider_explanation_summary_el.setAttribute('data-i18n','what_does_this_do');
				context_slider_explanation_details_el.appendChild(context_slider_explanation_summary_el);
		
				let context_slider_explanation_el = document.createElement('p');
				context_slider_explanation_el.classList.add('model-info-slider-explanation');
				context_slider_explanation_el.textContent = get_translation('model_context_explanation');
				context_slider_explanation_el.setAttribute('data-i18n','model_context_explanation');
				context_slider_explanation_details_el.appendChild(context_slider_explanation_el);
		
				context_slider_container_el.appendChild(context_slider_explanation_details_el);
	
				model_info_settings_el.appendChild(context_slider_container_el);
			}
			else{
				//console.log('model_context was not bigger than 1024: ', model_context);
			}
			
			
			
			
			
			
			
			// OPTIONS
			
			let model_settings_container_el = document.createElement('div');
			model_settings_container_el.classList.add('model-info-setting-container');
			//model_settings_container_el.classList.add('show-if-advanced');
			//model_settings_container_el.setAttribute('id','creativity-slider-container');
			
			let model_settings_title_el = document.createElement('div');
			model_settings_title_el.classList.add('model-info-setting-title');
			model_settings_title_el.textContent = get_translation('Options');
			model_settings_title_el.setAttribute('data-i18n','Options');
			model_settings_container_el.appendChild(model_settings_title_el);
			
			let options_data = [
				{	
					'setting_id':'cache_type_k',
					'setting_id_type':'select',
					'setting_id_options':['f16','q8_0','q4_0']  // 'f16' | 'q8_0' | 'q4_0',
				},
				{	
					'setting_id':'huggingface_id', // For image to text
					'setting_id_type':'select',
					//'setting_id_options':['onnx-community/Florence-2-base-ft','Xenova/nanoLlava','Xenova/moondream2']
				},
				{	
					'setting_id':'ollama_host',
					'setting_id_type':'text'
				},
				{	
					'setting_id':'add_timestamps',
					'setting_id_type':'select',
					'setting_id_options':window.add_timestamp_options,
				},
				{	
					'setting_id':'privacy_level',
					'setting_id_type':'select',
					'setting_id_options':['Medium','High']
				},
				{	
					'setting_id':'transcription_quality',
					'setting_id_type':'select',
					'setting_id_options':window.transcription_quality_options,
				},
				{	
					'setting_id':'add_both_languages_to_documents',
					'setting_id_type':'checkbox'
				},
				{	
					'setting_id':'force_webgpu',
					'setting_id_type':'checkbox'
				},
				{	
					'setting_id':'character',
					'setting_id_type':'checkbox'
				},
				{	
					'setting_id':'prefered_voice_gender',
					'setting_id_type':'select',
					'setting_id_options':['male','female']
				},
				
			]
			
			
			let is_ollama_assistant = false;
			if(window.settings.assistant.startsWith('ollama') || (typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant].runner == 'string' && window.settings.assistants[window.settings.assistant].runner == 'ollama')){
				is_ollama_assistant = true;
			}
			
			
			if(window.ollama_models && typeof window.ollama_models['models'] != 'undefined'){
				
				let ollama_models_options = [];
				for(let om = 0; om < window.ollama_models['models'].length; om++){
					if(typeof window.ollama_models['models'][om]['name'] == 'string'){
						ollama_models_options.push(window.ollama_models['models'][om]['name']);
					}
				}
				
				options_data.push({	
					'setting_id':'ollama_model',
					'setting_id_type':'select',
					'setting_id_options':ollama_models_options
				})
				
			}
			else{
				options_data.push({	
					'setting_id':'ollama_model',
					'setting_id_type':'text'
				});
			}
			
			
			
			
			
			for(let opi = 0; opi < options_data.length; opi++){
				//console.log("settings option: ", opi, options_data);
				let setting_id = options_data[opi].setting_id; //'cache_type_k';
				let setting_id_type = options_data[opi].setting_id_type;
				let setting_id_options = null;
				if(typeof options_data[opi].setting_id_options != 'undefined'){
					setting_id_options = options_data[opi].setting_id_options;
				}
				
				if(setting_id == 'huggingface_id' && window.settings.assistant != 'image_to_text'){
					continue
				}
				
				if(setting_id.startsWith('ollama') && !is_ollama_assistant){
					continue
				}
				if(setting_id == 'cache_type_k' && is_ollama_assistant){
					continue
				}
				if(setting_id == 'cache_type_k' && window.settings.settings_complexity == 'normal'){
					continue
				}
				if(setting_id == 'cache_type_k' && ((typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant].runner != 'string') && (typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant].runner != 'string') )){
					//console.log("model info: undefined runner, not showing cache_type_k option for: ", window.settings.assistant);
					continue
				}
				if(setting_id == 'cache_type_k' && typeof window.settings.assistants[window.settings.assistant].runner == 'string' && window.settings.assistants[window.settings.assistant].runner != 'llama_cpp'){
					continue
				}
				else if(setting_id == 'cache_type_k' && typeof window.assistants[window.settings.assistant].runner == 'string' && window.assistants[window.settings.assistant].runner != 'llama_cpp'){
					continue
				}
				if(setting_id == 'add_timestamps' && window.settings.assistant != 'scribe'){
					continue
				}
				if(setting_id == 'privacy_level' && window.settings.assistant != 'scribe'){
					continue
				}
				if(setting_id == 'transcription_quality' && window.settings.assistant != 'scribe'){
					continue
				}
				if(setting_id == 'add_both_languages_to_documents' && window.settings.assistant != 'translator'){
					continue
				}
				if(setting_id == 'force_webgpu'){ //  && window.settings.assistant != 'translator'
					continue
				}
				
				if(setting_id == 'prefered_voice_gender'){
					console.log("checking prefered_voice_gender setting");
					if(window.settings.assistant == 'translator'){
						
					}
					else if(typeof window.settings.assistants[window.settings.assistant]['media'] != 'undefined' && window.settings.assistants[window.settings.assistant]['media'].indexOf('text') != -1){
						
					}
					else if(typeof window.assistants[window.settings.assistant]['media'] != 'undefined' && window.assistants[window.settings.assistant]['media'].indexOf('text') != -1){
						
					}
					else{
						console.warn("not showing prefered_voice_gender setting");
						continue
					}
					//console.log("model info: undefined runner, not showing cache_type_k option for: ", window.settings.assistant);
					
				}
				
				if(setting_id == 'character'){
					if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant].character == 'boolean'){
						// allow through
					}
					else{
						continue
					}
				}
				
				// Basic toggles container
				let basic_toggles_container_el = document.createElement('div');
				//basic_toggles_container_el.setAttribute('model-info-basic-toggles-container');
			
				// Advanced toggles container
				let advanced_toggles_container_el = document.createElement('div');
				advanced_toggles_container_el.classList.add('model-info-advanced-toggles-container');
			
				
				
			
				// Checkbox wrapper
				let model_setting_wrapper_el = document.createElement('div');
				model_setting_wrapper_el.classList.add('model-info-toggle-wrapper');
			
			
				// setting label
				let model_setting_label_el = document.createElement('label');
				model_setting_label_el.setAttribute('for','model-info-' + setting_id + '-input');
				model_setting_label_el.setAttribute('id','model-info-' + setting_id + '-input-label');
				model_setting_label_el.classList.add('model-info-toggles-label');
			
				// setting label - span
				let model_setting_label_span_el = document.createElement('span');
				model_setting_label_span_el.textContent = get_translation(setting_id);
				model_setting_label_span_el.setAttribute('data-18n',setting_id);
				model_setting_label_el.appendChild(model_setting_label_span_el);
			
				// setting label
				let model_setting_input_el = null;
				if(setting_id_type == 'select'){
					model_setting_input_el = document.createElement('select');
				}else{
					model_setting_input_el = document.createElement('input');
				}
				
				if(setting_id == 'ollama_host'){
					model_setting_input_el = document.createElement('textarea');
					model_setting_input_el.classList.add('model-info-prompt');
					model_setting_input_el.classList.add('small-model-info-prompt');
				}
				model_setting_input_el.classList.add('model-info-toggle');
				model_setting_input_el.setAttribute('id','model-info-' + setting_id + '-input');
				
				// setting input element
				if(setting_id_type == 'text'){
					model_setting_input_el.setAttribute('type',setting_id_type);
				
					
					if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant][setting_id] == 'string'){
						model_setting_input_el.value = window.settings.assistants[window.settings.assistant][setting_id];
					}
					else if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant][setting_id] == 'string'){
						model_setting_input_el.value = window.assistants[window.settings.assistant][setting_id];
					}
				
					model_setting_input_el.addEventListener('input',(event) => {
						if(typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
							window.settings.assistants[window.settings.assistant] = {};
						}
						//window.settings.assistants[window.settings.assistant][setting_id] = model_setting_input_el.value;
						if(model_setting_input_el.value == ''){
							delete window.settings.assistants[window.settings.assistant][setting_id];
						}
						else if(model_setting_input_el.value){
							//console.log("model_setting_input_el.value: ", model_setting_input_el.value);
							window.settings.assistants[window.settings.assistant][setting_id] = model_setting_input_el.value;
						}
						save_settings();
						model_setting_wrapper_el.classList.add('model-info-setting-saved');
						setTimeout(() => {
							model_setting_wrapper_el.classList.remove('model-info-setting-saved');
						},500);
					});
				
				}
				else if(setting_id_type == 'checkbox'){
					model_setting_input_el.setAttribute('type',setting_id_type);
					if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant][setting_id] == 'boolean' && window.settings.assistants[window.settings.assistant][setting_id] == true){
						model_setting_input_el.checked = true;
					}
					model_setting_input_el.addEventListener('change',(event) => {
						if(typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
							window.settings.assistants[window.settings.assistant] = {};
						}
						window.settings.assistants[window.settings.assistant][setting_id] = model_setting_input_el.checked;
						save_settings();
						model_setting_wrapper_el.classList.add('model-info-setting-saved');
						setTimeout(() => {
							model_setting_wrapper_el.classList.remove('model-info-setting-saved');
						},500);
					});
				}
				else if(setting_id_type == 'select'){
					
					let options = null;
					if(setting_id_options != null){
						options = setting_id_options;
					}
					else if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant][setting_id + '_options'] != 'undefined' && Array.isArray(window.settings.assistants[window.settings.assistant][setting_id + '_options'])){
						options = window.settings.assistants[window.settings.assistant][setting_id + '_options'];
					}
					else if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant][setting_id + '_options'] != 'undefined' && Array.isArray(window.assistants[window.settings.assistant][setting_id + '_options'])){
						options = window.assistants[window.settings.assistant][setting_id + '_options'];
					}
					if(options != null){
						
						for(let h = 0; h < options.length; h++){
							let value = options[h];
							if(typeof value != 'string'){
								console.error("model info settings option value was not a string: ", value);
								continue
							}
							//console.log("model info settings option value: ",  value);
							let select_option_el = document.createElement('option');
							select_option_el.value = '' + value;
							if(value.startsWith('Xenova/')){
								value = value.replace('Xenova/','');
							}
							else if(value.startsWith('onnx-community/')){
								value = value.replace('onnx-community/','');
							}
							if(typeof window.translations[value] != 'undefined'){
								//console.log("value is in translations: ", value);
								select_option_el.innerText = window.get_translation(value);
								select_option_el.setAttribute('data-i18n',value);
							}
							else{
								//console.log("value is not in translations: ", value);
								select_option_el.innerText = value;
							}
							
							
							if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant][setting_id] != 'undefined'){
								//console.log("window.settings options[h] =?= huggingface_id?: ", options[h], " =?= ", window.settings.assistants[window.settings.assistant][setting_id])
								if(options[h] == window.settings.assistants[window.settings.assistant][setting_id]){
									select_option_el.setAttribute('selected','selected');
								}
							}
							else if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant][setting_id] != 'undefined'){
								//console.log("assistant dict options[h] =?= huggingface_id?: ", options[h], " =?= ", window.assistants[window.settings.assistant][setting_id])
								if(options[h] == window.assistants[window.settings.assistant][setting_id]){
									select_option_el.setAttribute('selected','selected');
								}
							}
							model_setting_input_el.appendChild(select_option_el);
						}
					}
					
					model_setting_input_el.addEventListener('change',(event) => {
						if(typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
							window.settings.assistants[window.settings.assistant] = {};
						}
						//console.log("saving: ", setting_id, model_setting_input_el.value)
						window.settings.assistants[window.settings.assistant][setting_id] = model_setting_input_el.value;
						save_settings();
						model_setting_wrapper_el.classList.add('model-info-setting-saved');
						setTimeout(() => {
							model_setting_wrapper_el.classList.remove('model-info-setting-saved');
						},500);
					});
				}
			
				model_setting_label_el.appendChild(model_setting_input_el);
			
				// Setting explanation
				let model_setting_explanation_el = document.createElement('p');
				model_setting_explanation_el.textContent = get_translation(setting_id + '_explanation');
				model_setting_explanation_el.setAttribute('data-18n',setting_id + '_explanation');
			
				model_setting_wrapper_el.appendChild(model_setting_label_el);
				model_setting_wrapper_el.appendChild(model_setting_explanation_el);
			
				advanced_toggles_container_el.appendChild(model_setting_wrapper_el);
			
				//model_settings_container_el.appendChild(basic_toggles_container_el);
				model_settings_container_el.appendChild(advanced_toggles_container_el);
				//console.log("adding advanced_toggles_container_el to model_info_settings_el");
				model_info_settings_el.appendChild(model_settings_container_el);
				
			}
			
			
			
			
			
			
			
			
			
			
			
			// SAVE CONVERSATION & EXPORT CONVERSATION
			if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant]['media'] != 'undefined' && (window.assistants[window.settings.assistant]['media'].indexOf('special') != -1 || window.assistants[window.settings.assistant]['media'].indexOf('text') == -1)){
				// makes no sense to keep history for these models
			}
			else{
				let save_conversation_container_el = document.createElement('div');
				save_conversation_container_el.classList.add('model-info-setting-container');
		
				// Setting title
				let save_conversation_title_el = document.createElement('div');
				save_conversation_title_el.classList.add('model-info-setting-title');
				save_conversation_title_el.setAttribute('data-i18n','Conversation_history');
				save_conversation_title_el.textContent = get_translation('Conversation_history');
				save_conversation_container_el.appendChild(save_conversation_title_el);
		
		
				// Save conversation history count
				let save_conversation_count_container_el = document.createElement('div');
				save_conversation_count_container_el.classList.add('flex-between');
				save_conversation_count_container_el.classList.add('flex-wrap');
				//save_conversation_count_container_el.classList.add('model-info-buttons-container');
		
				// conversation count label
				let save_conversation_count_label_el = document.createElement('span');
				save_conversation_count_label_el.classList.add('simple-input-label');
				save_conversation_count_label_el.setAttribute('data-i18n','How_many_messages_should_be_saved');
				save_conversation_count_label_el.textContent = get_translation('How_many_messages_should_be_saved')
				save_conversation_count_container_el.appendChild(save_conversation_count_label_el);
		
		
				
		
				// Conversation count number input
				let save_conversation_count_el = document.createElement('input');
				save_conversation_count_el.setAttribute('id','save-conversation-count-input');
				save_conversation_count_el.setAttribute('step','2');
				save_conversation_count_el.setAttribute('min','0');
				save_conversation_count_el.setAttribute('max','10000');
				save_conversation_count_el.classList.add('model-info-prompt');
				save_conversation_count_el.type = "number";
		
				if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant]['save_conversation'] == 'number'){
					save_conversation_count_el.value = window.settings.assistants[window.settings.assistant]['save_conversation'];
				}
				else{
					save_conversation_count_el.value = 0;
				}
		
				//save_conversation_count_el.classList.add('model-info-export-button');
				//save_conversation_count_el.textContent = get_translation('Export');
				save_conversation_count_el.addEventListener("blur", () => {
					let new_count = parseInt(save_conversation_count_el.value);
					//console.log("save conversation number changed.  new_count: ", typeof new_count, new_count);
					if(typeof new_count != 'number'){return}
			
					if(new_count < 0){
						new_count = 0;
					}
					if(new_count > 10000){
						new_count = 10000;
					}
					if(!new_count % 2 == 1){
						new_count += 1;
					}
					window.settings.assistants[window.settings.assistant]['save_conversation'] = new_count;
					save_settings();
					save_conversation(window.settings.assistant);
				});
				
		
				let save_conversation_count_wrapper_el = document.createElement('div');
				save_conversation_count_wrapper_el.classList.add('center');
				
				// conversation count minus button
				let save_conversation_count_minus_el = document.createElement('span');
				save_conversation_count_minus_el.classList.add('simple-input-count-button');
				save_conversation_count_minus_el.classList.add('simple-input-count-minus');
				save_conversation_count_minus_el.textContent = '-10';
				save_conversation_count_container_el.appendChild(save_conversation_count_minus_el);
				save_conversation_count_minus_el.addEventListener('click',() => {
					let new_count = parseInt(save_conversation_count_el.value);
					new_count -= 10;
					if(new_count < 0){
						new_count = 0;
					}
					save_conversation_count_el.value = new_count;
					window.settings.assistants[window.settings.assistant]['save_conversation'] = new_count;
					save_settings();
					save_conversation(window.settings.assistant);
				})
				
				save_conversation_count_wrapper_el.appendChild(save_conversation_count_minus_el);
				
				save_conversation_count_wrapper_el.appendChild(save_conversation_count_el);
		
				// conversation count plus button
				let save_conversation_count_plus_el = document.createElement('span');
				save_conversation_count_plus_el.classList.add('simple-input-count-button');
				save_conversation_count_plus_el.classList.add('simple-input-count-plus');
				save_conversation_count_plus_el.textContent = '+10';
				save_conversation_count_container_el.appendChild(save_conversation_count_plus_el);
				save_conversation_count_plus_el.addEventListener('click',() => {
					let new_count = parseInt(save_conversation_count_el.value);
					new_count += 10;
					if(new_count > 10000){
						new_count = 10000;
					}
					save_conversation_count_el.value = new_count;
					window.settings.assistants[window.settings.assistant]['save_conversation'] = new_count;
					save_settings();
					save_conversation(window.settings.assistant);
				})
				save_conversation_count_wrapper_el.appendChild(save_conversation_count_plus_el);
				save_conversation_count_container_el.appendChild(save_conversation_count_wrapper_el);
				
				save_conversation_container_el.appendChild(save_conversation_count_container_el);
		
		
				if(typeof window.settings.assistant == 'string' && typeof window.conversations[window.settings.assistant] != 'undefined' && window.conversations[window.settings.assistant].length){
					console.error("HAS CONVERSATION HISTORY");
			
					// Export conversation button
					let save_conversation_export_button_container_el = document.createElement('div');
					save_conversation_export_button_container_el.classList.add('align-right');
					save_conversation_export_button_container_el.classList.add('model-info-buttons-container');
			
					let save_conversation_export_button_el = document.createElement('button');
					save_conversation_export_button_el.classList.add('model-info-export-button');
					save_conversation_export_button_el.textContent = get_translation('Export');
					save_conversation_export_button_el.addEventListener("click", () => {
						//console.log("clicked on export conversation button");
						window.export_conversation(window.settings.assistant);
					});
					save_conversation_export_button_container_el.appendChild(save_conversation_export_button_el);
					save_conversation_container_el.appendChild(save_conversation_export_button_container_el);
			
			
		
			
			
				}
				else{
					//console.log("This model does not have a conversation history");
				}
		
				// Save & export conversation explanation
				let save_conversation_explanation_details_el = document.createElement('details');
				let save_conversation_explanation_summary_el = document.createElement('summary');
				save_conversation_explanation_summary_el.textContent = get_translation('what_does_this_do');
				save_conversation_explanation_details_el.appendChild(save_conversation_explanation_summary_el);
		
				let save_conversation_explanation_el = document.createElement('p');
				save_conversation_explanation_el.classList.add('model-info-system-prompt-explanation');
				save_conversation_explanation_el.textContent = get_translation('Export_conversation_explanation');
				save_conversation_explanation_details_el.appendChild(save_conversation_explanation_el);
		
				save_conversation_container_el.appendChild(save_conversation_explanation_details_el);
		
				model_info_settings_el.appendChild(save_conversation_container_el);
				
				
				
				
				
				
				
				// System prompt
				if( ((window.settings.assistant.startsWith('custom')) || (typeof window.assistants[window.settings.assistant]['system_prompt'] == 'string' || window.settings.settings_complexity != 'normal')) && window.settings.assistant != 'danube'){ // Danube does not support a system prompt
			
					if(typeof window.assistants[window.settings.assistant]['no_system_prompt'] == 'boolean' && window.assistants[window.settings.assistant]['no_system_prompt'] == true){
						// No system prompt for this model
					}
					else{
						let system_prompt_container_el = document.createElement('div');
						system_prompt_container_el.classList.add('model-info-setting-container');
						//system_prompt_container_el.setAttribute('id','creativity-slider-container');
			
						let system_prompt_title_el = document.createElement('div');
						system_prompt_title_el.classList.add('model-info-setting-title');
						system_prompt_title_el.classList.add('hide-if-advanced');
						system_prompt_title_el.textContent = get_translation('first_sentence');
						system_prompt_title_el.setAttribute('data-i18n','first_sentence');
						system_prompt_container_el.appendChild(system_prompt_title_el);
			
						let system_prompt_title2_el = document.createElement('div');
						system_prompt_title2_el.classList.add('model-info-setting-title');
						system_prompt_title2_el.classList.add('show-if-advanced');
						system_prompt_title2_el.textContent = get_translation('system_prompt');
						system_prompt_title2_el.setAttribute('data-i18n','system_prompt');
						system_prompt_container_el.appendChild(system_prompt_title2_el);
			
			
						// System prompt reset button
						let system_prompt_reset_button_el = document.createElement('button');
						system_prompt_reset_button_el.classList.add('model-info-setting-reset-button');
						system_prompt_reset_button_el.setAttribute('id','model-info-system-prompt-reset-button');
						system_prompt_reset_button_el.textContent = get_translation('reset');
						system_prompt_reset_button_el.addEventListener("click", () => {
							if( typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
								window.settings.assistants[window.settings.assistant] = {};
							}
							
							if(typeof window.settings.assistants[window.settings.assistant]['system_prompt'] == 'string'){
								//console.log("deleting customized system prompt")
								delete window.settings.assistants[window.settings.assistant]['system_prompt'];
								save_settings();
							}
							if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant]['system_prompt'] == 'string'){
								system_prompt_el.value = window.assistants[window.settings.assistant]['system_prompt'];
							}
							
							system_prompt_reset_button_el.classList.add('hidden');
						});
						
						
						// Reset system prompt button
						if(typeof window.settings.assistants[window.settings.assistant]['system_prompt'] == 'string' && typeof window.assistants[window.settings.assistant]['system_prompt'] == 'string' && window.settings.assistants[window.settings.assistant]['system_prompt'] != window.assistants[window.settings.assistant]['system_prompt']){
							// reset button should be shown
						}
						else{
							system_prompt_reset_button_el.classList.add('hidden');
						}
			
			
			
						// System prompt textarea
						let system_prompt_el = document.createElement('textarea');
						system_prompt_el.classList.add('model-info-prompt');
						system_prompt_el.setAttribute('id','model-info-system-prompt');
						//system_prompt_el.setAttribute('placeholder',get_translation('system_prompt'));
			
						let system_prompt_text = '';
			
						if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant]['system_prompt'] == 'string'){
							system_prompt_text = window.settings.assistants[window.settings.assistant]['system_prompt'];
						}
						else if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant]['system_prompt'] == 'string'){
							if(typeof window.translations[window.assistants[window.settings.assistant]['system_prompt']] != 'undefined'){
								system_prompt_text = get_translation(window.assistants[window.settings.assistant]['system_prompt']);
							}
							else{
								system_prompt_text = window.assistants[window.settings.assistant]['system_prompt'];
							}
				
						}
						else if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant]['system_prompt'] == 'object' && window.assistants[window.settings.assistant]['system_prompt'] != null && typeof window.assistants[window.settings.assistant]['system_prompt'][window.settings.language] == 'string'){
							system_prompt_text = window.assistants[window.settings.assistant]['system_prompt'][window.settings.language];
						}
						system_prompt_el.value = system_prompt_text;
						
						system_prompt_el.addEventListener("change", () => {
							//console.log("manually set system prompt to: ", system_prompt_el.value);
							if( typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
								window.settings.assistants[window.settings.assistant] = {};
							}
							window.settings.assistants[window.settings.assistant]['system_prompt'] = system_prompt_el.value;
							save_settings();
							system_prompt_el.classList.add('model-info-prompt-saved');
							setTimeout(() => {
								system_prompt_el.classList.remove('model-info-prompt-saved');
							},200);
							
							if(typeof window.settings.assistants[window.settings.assistant]['system_prompt'] == 'string' && typeof window.assistants[window.settings.assistant]['system_prompt'] == 'string' && window.settings.assistants[window.settings.assistant]['system_prompt'] != window.assistants[window.settings.assistant]['system_prompt']){
								// reset button should be shown
								system_prompt_reset_button_el.classList.remove('hidden');
							}
							
						});
			
						system_prompt_container_el.appendChild(system_prompt_el);
						
						
						let system_prompt_reset_button_container_el = document.createElement('div');
						system_prompt_reset_button_container_el.classList.add('align-right');
						system_prompt_reset_button_container_el.classList.add('model-info-buttons-container');
						
						
						
						
						
						let system_prompt_presets_select_el = document.createElement('select');
						system_prompt_presets_select_el.classList.add('hidden');
						
						
						function populate_presets(){
							console.log("in populate_presets");
							system_prompt_presets_select_el.classList.remove('hidden');
							
							let first_preset_option_el = document.createElement('option');
							first_preset_option_el.setAttribute('selected','selected');
							first_preset_option_el.textContent = get_translation('Choose');
							first_preset_option_el.setAttribute('data-i18n','Choose');
							system_prompt_presets_select_el.appendChild(first_preset_option_el);
							
							window.add_script('./more_characters.js')
							.then((value) => {
								console.log("more_characters.js has/is loaded");
								if(typeof more_characters != 'undefined'){
									
									let characters_language = 'en';
									if(typeof more_characters[window.settings.language] != 'undefined'){
										characters_language = window.settings.language;
									}
									
									for(let m = 0; m < more_characters[characters_language].length; m++){
										const details = more_characters[characters_language][m];
		
										if(typeof details.custom_name == 'string'){
											let preset_option_el = document.createElement('option');
										
											preset_option_el.value = details.custom_name;
											preset_option_el.textContent = get_translation(details.custom_name);
											if(typeof window.translations[details.custom_name] != 'undefined'){
												preset_option_el.setAttribute('data-i18n',details.custom_name);
											}
											system_prompt_presets_select_el.appendChild(preset_option_el);
										}
									}
									
									system_prompt_presets_select_el.addEventListener('change', () => {
										console.log("selected an example system prompt.  system_prompt_presets_select_el.value: ", characters_language, system_prompt_presets_select_el.value);
										if(typeof more_characters != 'undefined' && typeof more_characters[characters_language] != 'undefined'){
											for(let mi = 0; mi < more_characters[characters_language].length; mi++){
												if(more_characters[characters_language][mi].custom_name == system_prompt_presets_select_el.value){
													if(typeof more_characters[characters_language][mi].system_prompt == 'string'){
														if( characters_language == 'nl' && more_characters[characters_language][mi].system_prompt.lastIndexOf('. Mijn eerste ') != -1){
															more_characters[characters_language][mi].system_prompt = more_characters[characters_language][mi].system_prompt.substr(0,more_characters[characters_language][mi].system_prompt.lastIndexOf('. Mijn eerste ') + 1);
														}
														else if( characters_language == 'en' && more_characters[characters_language][mi].system_prompt.lastIndexOf('. My first ') != -1){
															more_characters[characters_language][mi].system_prompt = more_characters[characters_language][mi].system_prompt.substr(0,more_characters[characters_language][mi].system_prompt.lastIndexOf('. My first ') + 1);
														}
														
														system_prompt_el.value = more_characters[characters_language][mi].system_prompt;
														system_prompt_reset_button_el.classList.remove('hidden');
													}
													break;
												}
											}
										}
									})
									
								}
								else{
									console.error("more_characters was still undefined");
								}
		
							})
							.catch((err) => {
								console.error("caught error adding more_characters.js script: ", err);
								window.flash_message(get_translation('No_internet_connection'),2000,'error');
								system_prompt_presets_select_el.classList.add('hidden');
							})
							
						}
			
						
						system_prompt_reset_button_container_el.appendChild(system_prompt_presets_select_el);
			
						// But that will load in and add a presets select element
						let system_prompt_presets_button_el = document.createElement('button');
						system_prompt_presets_button_el.classList.add('model-info-setting-presets-button');
						system_prompt_presets_button_el.setAttribute('id','model-info-system-prompt-presets-button');
						system_prompt_presets_button_el.setAttribute('data-i18n','Examples');
						system_prompt_presets_button_el.textContent = get_translation('Examples');
						
						system_prompt_presets_button_el.addEventListener("click", () => {
							system_prompt_presets_button_el.classList.add('hidden');
							populate_presets();
						});
						system_prompt_reset_button_container_el.appendChild(system_prompt_presets_button_el);
			
			
						// Add system prompt reset button that was created earlier
						system_prompt_reset_button_container_el.appendChild(system_prompt_reset_button_el);
						system_prompt_container_el.appendChild(system_prompt_reset_button_container_el);
			
			
			
						let system_prompt_explanation_details_el = document.createElement('details');
						let system_prompt_explanation_summary_el = document.createElement('summary');
						system_prompt_explanation_summary_el.textContent = get_translation('what_does_this_do');
						system_prompt_explanation_summary_el.setAttribute('data-i18n','what_does_this_do');
						system_prompt_explanation_details_el.appendChild(system_prompt_explanation_summary_el);
			
						let system_prompt_explanation_el = document.createElement('p');
						system_prompt_explanation_el.classList.add('model-info-system-prompt-explanation');
						system_prompt_explanation_el.textContent = get_translation('model_system_prompt_explanation');
						system_prompt_explanation_el.setAttribute('data-i18n','model_system_prompt_explanation');
						system_prompt_explanation_details_el.appendChild(system_prompt_explanation_el);
			
						system_prompt_container_el.appendChild(system_prompt_explanation_details_el);
		
						model_info_settings_el.appendChild(system_prompt_container_el);
					}
			
				}
		
		
				// 2.
				// Second prompt
				if(window.settings.assistant == 'actor1' || window.settings.assistant.startsWith('custom') || typeof window.assistants[window.settings.assistant]['second_prompt'] == 'string' || window.settings.settings_complexity != 'normal' ){
			
			
					if(typeof window.assistants[window.settings.assistant]['no_system_prompt'] == 'boolean' && window.assistants[window.settings.assistant]['no_system_prompt'] == true){
						// No system prompt for this model
					}
					else{
						//console.log("showing second prompt for second_prompt_text. window.assistants[window.settings.assistant]['second_prompt']: ", window.assistants[window.settings.assistant]['second_prompt']);
						let second_prompt_container_el = document.createElement('div');
						second_prompt_container_el.classList.add('model-info-setting-container');
						//second_prompt_container_el.setAttribute('id','creativity-slider-container');
			
						let second_prompt_title_el = document.createElement('div');
						second_prompt_title_el.classList.add('model-info-setting-title');
						second_prompt_title_el.textContent = get_translation('second_prompt');
						second_prompt_title_el.setAttribute('data-i18n','second_prompt');
						second_prompt_container_el.appendChild(second_prompt_title_el);
			
						// Second prompt textarea
						let second_prompt_el = document.createElement('textarea');
						second_prompt_el.classList.add('model-info-prompt');
						second_prompt_el.setAttribute('id','model-info-second-prompt');
						//second_prompt_el.setAttribute('placeholder',get_translation('second_prompt'));
			
			
			
						let second_prompt_text = '';
			
						if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant]['second_prompt'] == 'string'){
							second_prompt_text = window.settings.assistants[window.settings.assistant]['second_prompt'];
							//console.log("got second_prompt_text from settings: ", second_prompt_text);
						}
						else if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant]['second_prompt'] == 'string'){
							second_prompt_text = get_translation(window.assistants[window.settings.assistant]['second_prompt']);
							//console.log("got second_prompt_text from assistants dict: ", second_prompt_text);
						}
						else if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant]['second_prompt'] == 'object' && window.assistants[window.settings.assistant]['second_prompt'] != null && typeof window.assistants[window.settings.assistant]['second_prompt'][window.settings.language] == 'string'){
							second_prompt_text = window.assistants[window.settings.assistant]['second_prompt'][window.settings.language];
							//console.log("got second_prompt_text from assistants dict with multiple translations: ", second_prompt_text);
						}
						else{
							//console.log("No second_prompt_text found");
						}
						second_prompt_el.value = second_prompt_text;
			
						second_prompt_el.addEventListener("change", () => {
							//console.log("manually set second prompt to: ", second_prompt_el.value);
							if( typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
								window.settings.assistants[window.settings.assistant] = {};
							}
							window.settings.assistants[window.settings.assistant]['second_prompt'] = second_prompt_el.value;
							save_settings();
							second_prompt_el.classList.add('model-info-prompt-saved');
							setTimeout(() => {
								second_prompt_el.classList.remove('model-info-prompt-saved');
							},100);
				
				
						});
			
						second_prompt_container_el.appendChild(second_prompt_el);
			
						// Reset second prompt button
						if( typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
							window.settings.assistants[window.settings.assistant] = {};
						}
			 
						if(typeof window.settings.assistants[window.settings.assistant]['second_prompt'] == 'string' && typeof window.assistants[window.settings.assistant]['second_prompt'] == 'string' && window.settings.assistants[window.settings.assistant]['second_prompt'] != window.assistants[window.settings.assistant]['second_prompt']){
							let second_prompt_reset_button_container_el = document.createElement('div');
							second_prompt_reset_button_container_el.classList.add('align-right');
							second_prompt_reset_button_container_el.classList.add('model-info-buttons-container');
							let second_prompt_reset_button_el = document.createElement('button');
							second_prompt_reset_button_el.classList.add('model-info-setting-reset-button');
							second_prompt_reset_button_el.textContent = get_translation('reset');
							second_prompt_reset_button_el.addEventListener("click", () => {
				
								if(typeof window.settings.assistants[window.settings.assistant]['second_prompt'] != 'undefined'){
									//console.log("show_model_info: deleting customized second prompt")
									delete window.settings.assistants[window.settings.assistant]['second_prompt'];
									save_settings();
								}
								if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant]['second_prompt'] == 'string'){
									second_prompt_el.value = window.assistants[window.settings.assistant]['second_prompt'];
								}
							});
							second_prompt_reset_button_container_el.appendChild(second_prompt_reset_button_el);
							second_prompt_container_el.appendChild(second_prompt_reset_button_container_el);
						}
			
			
						let second_prompt_explanation_details_el = document.createElement('details');
						let second_prompt_explanation_summary_el = document.createElement('summary');
						second_prompt_explanation_summary_el.textContent = get_translation('what_does_this_do');
						second_prompt_explanation_summary_el.setAttribute('data-i18n','what_does_this_do');
						second_prompt_explanation_details_el.appendChild(second_prompt_explanation_summary_el);
			
						let second_prompt_explanation_el = document.createElement('p');
						second_prompt_explanation_el.classList.add('model-info-second-prompt-explanation');
						second_prompt_explanation_el.textContent = get_translation('model_second_prompt_explanation');
						second_prompt_explanation_el.setAttribute('data-i18n','model_second_prompt_explanation');
						second_prompt_explanation_details_el.appendChild(second_prompt_explanation_el);
			
						second_prompt_container_el.appendChild(second_prompt_explanation_details_el);
		
						model_info_settings_el.appendChild(second_prompt_container_el);
					}
			
			
				}
			
				
			}
			
		}
		
		

		// Custom model URL
		if(
			typeof window.settings.assistant == 'string' 
			&& (
				(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant].download_url == 'string')
				||
				(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant].download_url == 'string')
				|| window.settings.assistant.startsWith('custom')
			)
		){
			let download_url_container_el = document.createElement('div');
			download_url_container_el.classList.add('model-info-setting-container');
			download_url_container_el.setAttribute('id','model-info-setting-url-container');

			let download_url_title_el = document.createElement('div');
			
			download_url_title_el.classList.add('model-info-setting-title');
			download_url_title_el.textContent = get_translation('Model_url');
			download_url_title_el.setAttribute('data-i18n','Model_url');
			download_url_container_el.appendChild(download_url_title_el);
			
			// URL input
			let download_url_el = document.createElement('textarea');
			download_url_el.classList.add('model-info-prompt');
			download_url_el.setAttribute('id','model-info-download-url-input');
			
			
			let allow_user_to_modify_url = false;
			if(
				((window.settings.assistant.startsWith('custom')) )  // || window.settings.settings_complexity != 'normal'
				&& (typeof window.assistants[window.settings.assistant].runner == 'undefined' 
					|| (typeof window.assistants[window.settings.assistant].runner == 'string' && window.assistants[window.settings.assistant].runner == 'llama_cpp')) 
			){
				//console.log("show_model_info: allowing model URL to be modified");
				allow_user_to_modify_url = true;
				
				download_url_el.addEventListener("change", () => {
					if(download_url_el.value != ''){
						if( typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
							//console.log("creating empty assistant object in window.settings.assistant for: ", window.settings.assistant);
							window.settings.assistants[window.settings.assistant] = {};
						}
						
						download_url_el.value = download_url_el.value.replaceAll('\n','');
						download_url_el.value = download_url_el.value.trim();
						
						if(download_url_el.value.indexOf('?download=true') != -1){
							download_url_el.value = download_url_el.value.replaceAll('?download=true','');
						}
						
						if(download_url_el.value){
							window.settings.assistants[window.settings.assistant]['download_url'] = download_url_el.value;
						}
						else{
							delete window.settings.assistants[window.settings.assistant]['download_url'];
						}
						//console.log("manually set download URL to: ", download_url_el.value);
						save_settings();
						download_url_el.classList.add('model-info-setting-saved');
						setTimeout(() => {
							download_url_el.classList.remove('model-info-setting-saved');
						},500);
					
					}
				
				});
			}
			else{
				//console.log("show_model_info: not allowing model URL to be modified");
				download_url_el.disabled = true;
			}
			
			
			let download_url_text = '';
			/*
			if(typeof window.assistants[window.settings.assistant].download_url == 'string'){
				download_url_text = window.assistants[window.settings.assistant].download_url;
			}
			*/
			
			if(typeof window.settings.assistants[window.settings.assistant] == 'object' && window.settings.assistants[window.settings.assistant] != null && typeof window.settings.assistants[window.settings.assistant]['download_url'] == 'string'){
				download_url_text = window.settings.assistants[window.settings.assistant]['download_url'];
			}
			else if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant]['download_url'] == 'string'){
				download_url_text = window.assistants[window.settings.assistant]['download_url'];
			}
			download_url_el.value = download_url_text;
			
			download_url_container_el.appendChild(download_url_el);
			
			// Reset download URL button
			/*
			let download_url_reset_button_container_el = document.createElement('div');
			download_url_reset_button_container_el.classList.add('align-right');
			download_url_reset_button_container_el.classList.add('model-info-buttons-container');
			let download_url_reset_button_el = document.createElement('button');
			download_url_reset_button_el.classList.add('model-info-setting-reset-button');
			download_url_reset_button_el.textContent = get_translation('reset');
			download_url_reset_button_el.addEventListener("click", () => {
				if( typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
					window.settings.assistants[window.settings.assistant] = {};
				}
				if(typeof window.settings.assistants[window.settings.assistant]['download_url'] != 'undefined'){
					//console.log("deleting customized second prompt")
					delete window.settings.assistants[window.settings.assistant]['download_url'];
					if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant]['download_url'] == 'string'){
						download_url_el.value = window.settings.assistants[window.settings.assistant]['download_url'];
					}
				}
			});
			download_url_reset_button_container_el.appendChild(download_url_reset_button_el);
			download_url_container_el.appendChild(download_url_reset_button_container_el);
			*/
			
			if(allow_user_to_modify_url){
				let download_url_explanation_details_el = document.createElement('details');
				let download_url_explanation_summary_el = document.createElement('summary');
				download_url_explanation_summary_el.textContent = get_translation('what_does_this_do');
				download_url_explanation_summary_el.setAttribute('data-i18n','what_does_this_do');
				download_url_explanation_details_el.appendChild(download_url_explanation_summary_el);
			
				let download_url_explanation_el = document.createElement('p');
				download_url_explanation_el.classList.add('model-info-download-url-explanation');
				download_url_explanation_el.textContent = get_translation('model_download_url_explanation');
				download_url_explanation_el.setAttribute('id','model_download_url_explanation');
				download_url_explanation_details_el.appendChild(download_url_explanation_el);
			
				download_url_container_el.appendChild(download_url_explanation_details_el);
			}
			
			model_info_settings_el.appendChild(download_url_container_el);
		}
		
		
		
		
		// Custom model config location
		if( (typeof window.settings.assistant == 'string' && typeof window.assistants[window.settings.assistant].config_url == 'string') || (window.settings.assistant.startsWith('custom') && !window.settings.assistant.startsWith('custom_saved'))){
			let config_url_container_el = document.createElement('div');
			config_url_container_el.classList.add('model-info-setting-container');
			config_url_container_el.classList.add('show-if-advanced');
			config_url_container_el.setAttribute('id','model-info-config-url-container');

			let config_url_title_el = document.createElement('div');
			
			config_url_title_el.classList.add('model-info-setting-title');
			config_url_title_el.textContent = get_translation('Model_configuration_url');
			config_url_title_el.setAttribute('data-i18n','Model_configuration_url');
			config_url_container_el.appendChild(config_url_title_el);
			
			// URL input
			let config_url_el = document.createElement('textarea');
			config_url_el.classList.add('model-info-prompt');
			config_url_el.setAttribute('id','model-info-config-url-input');
			
			
			let allow_user_to_modify_url = false;
			if(
				((window.settings.assistant.startsWith('custom')) || window.settings.settings_complexity != 'normal') 
				&& (typeof window.assistants[window.settings.assistant].runner == 'undefined' 
					|| (typeof window.assistants[window.settings.assistant].runner == 'string' && window.assistants[window.settings.assistant].runner == 'llama_cpp')) 
			){
				//console.log("show_model_info: allowing config URL to be modified");
				allow_user_to_modify_url = true;
				
				config_url_el.addEventListener("change", () => {
					if(config_url_el.value != ''){
						//console.log("config_url changed");
						if( typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
							//console.log("creating empty assistant object in window.settings.assistant for: ", window.settings.assistant);
							window.settings.assistants[window.settings.assistant] = {};
						}
						
						config_url_el.value = config_url_el.value.replaceAll('\n','');
						config_url_el.value = config_url_el.value.trim();
					
						if(config_url_el.value.startsWith('https://huggingface.co/')){
							config_url_el.value = config_url_el.value.replace('https://huggingface.co/','');
						}
					
						if(config_url_el.value){
							window.settings.assistants[window.settings.assistant]['config_url'] = config_url_el.value;
						}
						else{
							delete window.settings.assistants[window.settings.assistant]['config_url'];
						}
					
						//window.settings.assistants[window.settings.assistant]['config_url'] = config_url_el.value;
						//console.log("manually set config URL to: ", config_url_el.value);
						save_settings();
						config_url_el.classList.add('model-info-setting-saved');
						setTimeout(() => {
							config_url_el.classList.remove('model-info-setting-saved');
						},500);
					
					}
				
				});
			}
			else{
				//console.log("show_model_info: not allowing model URL to be modified");
				config_url_el.disabled = true;
			}
			
			
			let config_url_text = '';
			/*
			if(typeof window.assistants[window.settings.assistant].config_url == 'string'){
				config_url_text = window.assistants[window.settings.assistant].config_url;
			}
			*/
			
			if(typeof window.settings.assistants[window.settings.assistant] == 'object' && window.settings.assistants[window.settings.assistant] != null && typeof window.settings.assistants[window.settings.assistant]['config_url'] == 'string'){
				config_url_text = window.settings.assistants[window.settings.assistant]['config_url'];
			}
			else if(typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant]['config_url'] == 'string'){
				config_url_text = window.assistants[window.settings.assistant]['config_url'];
			}
			config_url_el.value = config_url_text;
			
			config_url_container_el.appendChild(config_url_el);
			
			// Reset config URL button
			/*
			let config_url_reset_button_container_el = document.createElement('div');
			config_url_reset_button_container_el.classList.add('align-right');
			config_url_reset_button_container_el.classList.add('model-info-buttons-container');
			let config_url_reset_button_el = document.createElement('button');
			config_url_reset_button_el.classList.add('model-info-setting-reset-button');
			config_url_reset_button_el.textContent = get_translation('reset');
			config_url_reset_button_el.addEventListener("click", () => {
				if( typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
					window.settings.assistants[window.settings.assistant] = {};
				}
				if(typeof window.settings.assistants[window.settings.assistant]['config_url'] != 'undefined'){
					//console.log("deleting customized second prompt")
					delete window.settings.assistants[window.settings.assistant]['config_url'];
					if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant]['config_url'] == 'string'){
						config_url_el.value = window.settings.assistants[window.settings.assistant]['config_url'];
					}
				}
			});
			config_url_reset_button_container_el.appendChild(config_url_reset_button_el);
			config_url_container_el.appendChild(config_url_reset_button_container_el);
			*/
			
			if(allow_user_to_modify_url){
				let config_url_explanation_details_el = document.createElement('details');
				let config_url_explanation_summary_el = document.createElement('summary');
				config_url_explanation_summary_el.textContent = get_translation('what_does_this_do');
				config_url_explanation_summary_el.setAttribute('data-i18n','what_does_this_do');
				config_url_explanation_details_el.appendChild(config_url_explanation_summary_el);
			
				let config_url_explanation_el = document.createElement('p');
				config_url_explanation_el.classList.add('model-info-config-url-explanation');
				config_url_explanation_el.textContent = get_translation('model_configuration_url_explanation');
				config_url_explanation_el.setAttribute('data-i18n','model_configuration_url_explanation');
				config_url_explanation_details_el.appendChild(config_url_explanation_el);
			
				config_url_container_el.appendChild(config_url_explanation_details_el);
			}
			
			model_info_settings_el.appendChild(config_url_container_el);
		}
		
		
		
		
		
		
		// SHARE & CLONE AI model
		//if((window.settings.assistant.startsWith('custom') || window.settings.settings_complexity != 'normal') && (typeof window.assistants[window.settings.assistant] != 'undefined' && typeof window.assistants[window.settings.assistant]['media'] != 'undefined' && typeof window.assistants[window.settings.assistant]['media'].indexOf('text') != -1 && window.assistants[window.settings.assistant]['media'].length == 1)){
		if(typeof window.assistants[window.settings.assistant] != 'undefined' ){
		
		
		
		
			// SHARE AI MODEL
			
			let share_clone_container_el = document.createElement('div');
			share_clone_container_el.classList.add('model-info-setting-container');
			share_clone_container_el.setAttribute('id','model-info-share-clone-container');
			
			let share_clone_title_el = document.createElement('div');
			share_clone_title_el.classList.add('model-info-setting-title');
			share_clone_title_el.textContent = get_translation('Share_this_AI_model');
			share_clone_title_el.setAttribute('data-i18n','Share_this_AI_model');
			share_clone_container_el.appendChild(share_clone_title_el);
		
			// Share clone link container
			let share_clone_link_container_el = document.createElement('div');
			share_clone_link_container_el.classList.add('share-prompt-link-container');
			share_clone_link_container_el.classList.add('flex');
			share_clone_container_el.appendChild(share_clone_link_container_el);
		
			// Share clone link text
			let share_clone_link_text_el = document.createElement('div');
			share_clone_link_text_el.classList.add('share-prompt-link');
			share_clone_link_text_el.setAttribute('id','model-info-share-clone-link-text');
			share_clone_link_container_el.appendChild(share_clone_link_text_el);
			
			// Copy share link to clipboard button
			let share_clone_link_copy_button_el = document.createElement('div');
			share_clone_link_copy_button_el.classList.add('share-prompt-copy-to-clipboard-button');
			share_clone_link_copy_button_el.classList.add('center');
			share_clone_link_copy_button_el.setAttribute('title','copy');
			//share_clone_link_copy_button_el.textContent = '📋'; // ✂️
			share_clone_link_copy_button_el.innerHTML = '<img src="images/copy_to_clipboard.svg" width="25" height="25">';
			share_clone_link_copy_button_el.addEventListener("click", (event) => {
				//console.log("copying to clipboard");
				navigator.clipboard.writeText(share_clone_link_text_el.innerText);
				flash_message(get_translation("Copied_link_to_clipboard"));
			});
			share_clone_link_container_el.appendChild(share_clone_link_copy_button_el);
			
			
			share_clone_container_el.appendChild(share_clone_link_container_el);
			
			setTimeout(() => {
				// waits until the element is attached to the dom, then automatically fill the correct div with the link
				create_share_prompt_link(false,window.settings.assistant,'');
			},10);
			
			
			
			
			
		
			/*
			// Clone AI model button
			let share_clone_button_el = document.createElement('button');
			//share_clone_button_el.classList.add('simple-label');
			share_clone_button_el.setAttribute('id','model-info-share-received-button');
			share_clone_button_el.setAttribute('data-i18n','Clone');
			share_clone_button_el.textContent = get_translation('Clone');
			
			
			
			share_clone_button_el.addEventListener("click", () => {
			*/
				
			
			model_info_settings_el.appendChild(share_clone_container_el);
		
		
		
		
		
		
		
		
			// START CREATING CLONE
			
			let create_clone_container_el = document.createElement('div');
			create_clone_container_el.classList.add('model-info-setting-container');
			create_clone_container_el.setAttribute('id','model-info-save-clone-container');
		
			let create_clone_title_el = document.createElement('div');
			create_clone_title_el.classList.add('model-info-setting-title');
			
			if(window.settings.assistant == 'custom_received'){
				create_clone_title_el.textContent = get_translation('create_clone_AI_model');
				create_clone_title_el.setAttribute('data-i18n','create_clone_AI_model');
			}
			else{
				create_clone_title_el.textContent = get_translation('Clone_this_AI_model');
				create_clone_title_el.setAttribute('data-i18n','Clone_this_AI_model');
			}
			
			create_clone_container_el.appendChild(create_clone_title_el);
		
			
			// Clone AI model button
			let create_clone_button_el = document.createElement('button');
			//create_clone_button_el.classList.add('simple-label');
			create_clone_button_el.setAttribute('id','model-info-save-received-button');
			create_clone_button_el.setAttribute('data-i18n','Clone');
			create_clone_button_el.textContent = get_translation('Clone');
			
			create_clone_button_el.addEventListener("click", () => {
				
				document.body.classList.add('no-received-ai');
				do_clone_prefill(window.settings.assistant);
			});
			
			
			let create_clone_buttons_container_el = document.createElement('div');
			create_clone_buttons_container_el.classList.add('align-right');
			
			create_clone_buttons_container_el.appendChild(create_clone_button_el);
			
			create_clone_container_el.appendChild(create_clone_buttons_container_el);
			
			
			
			// Delete model button
			/*
			let create_clone_reset_button_container_el = document.createElement('div');
			create_clone_reset_button_container_el.classList.add('align-right');
			create_clone_reset_button_container_el.classList.add('model-info-buttons-container');
			let create_clone_reset_button_el = document.createElement('button');
			create_clone_reset_button_el.classList.add('model-info-setting-reset-button');
			create_clone_reset_button_el.textContent = get_translation('reset');
			create_clone_reset_button_el.addEventListener("click", () => {
				if( typeof window.settings.assistants[window.settings.assistant] == 'undefined'){
					window.settings.assistants[window.settings.assistant] = {};
				}
				if(typeof window.settings.assistants[window.settings.assistant]['create_clone'] != 'undefined'){
					//console.log("deleting customized second prompt")
					delete window.settings.assistants[window.settings.assistant]['create_clone'];
					if(typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant]['create_clone'] == 'string'){
						create_clone_el.value = window.settings.assistants[window.settings.assistant]['create_clone'];
					}
				}
			});
			create_clone_reset_button_container_el.appendChild(create_clone_reset_button_el);
			create_clone_container_el.appendChild(create_clone_reset_button_container_el);
			*/
			
			//if(allow_user_to_modify_url){
				let create_clone_explanation_details_el = document.createElement('details');
				let create_clone_explanation_summary_el = document.createElement('summary');
				create_clone_explanation_summary_el.textContent = get_translation('what_does_this_do');
				create_clone_explanation_summary_el.setAttribute('data-i18n','what_does_this_do');
				create_clone_explanation_details_el.appendChild(create_clone_explanation_summary_el);
			
				let create_clone_explanation_el = document.createElement('p');
				create_clone_explanation_el.classList.add('model-info-save-received-explanation');
				create_clone_explanation_el.textContent = get_translation('model_create_clone_explanation');
				create_clone_explanation_el.setAttribute('id','model_create_clone_explanation');
				create_clone_explanation_details_el.appendChild(create_clone_explanation_el);
			
				create_clone_container_el.appendChild(create_clone_explanation_details_el);
			//}
			
			model_info_settings_el.appendChild(create_clone_container_el);
		}
		
		
		
		
		
		
		
		//if(typeof window.assistants[window.settings.assistant].download_url == 'string' && window.cached_urls.indexOf(window.assistants[window.settings.assistant].download_url) != -1){
		if(typeof window.settings.assistant == 'string' && check_if_cached(window.settings.assistant) && !window.settings.assistant.startsWith('ollama')){
			//console.error("SPOTTED IN CACHE");
			
			let uncache_container_el = document.createElement('div');
			uncache_container_el.classList.add('model-info-setting-container');
			
			// Setting title
			let uncache_title_el = document.createElement('div');
			uncache_title_el.classList.add('model-info-setting-title');
			uncache_title_el.textContent = get_translation('Delete_from_browser_cache');
			uncache_container_el.appendChild(uncache_title_el);
			
			// Delete from cache button
			let uncache_reset_button_container_el = document.createElement('div');
			uncache_reset_button_container_el.classList.add('align-right');
			uncache_reset_button_container_el.classList.add('model-info-buttons-container');
			
			let uncache_reset_button_el = document.createElement('button');
			uncache_reset_button_el.classList.add('model-info-delete-from-cache-button');
			uncache_reset_button_el.textContent = get_translation('Delete');
			uncache_reset_button_el.addEventListener("click", () => {
				//console.log("clicked on delete from browser cache button");
				
				window.delete_model_from_cache(window.settings.assistant);
				uncache_reset_button_el.remove();
				
			});
			uncache_reset_button_container_el.appendChild(uncache_reset_button_el);
			uncache_container_el.appendChild(uncache_reset_button_container_el);
			
			// Delete from browser cache explanation
			let uncache_explanation_details_el = document.createElement('details');
			let uncache_explanation_summary_el = document.createElement('summary');
			uncache_explanation_summary_el.textContent = get_translation('what_does_this_do');
			uncache_explanation_details_el.appendChild(uncache_explanation_summary_el);
			
			let uncache_explanation_el = document.createElement('p');
			uncache_explanation_el.classList.add('model-info-system-prompt-explanation');
			uncache_explanation_el.textContent = get_translation('Delete_from_cache_explanation');
			uncache_explanation_details_el.appendChild(uncache_explanation_el);
			
			uncache_container_el.appendChild(uncache_explanation_details_el);
		
			model_info_settings_el.appendChild(uncache_container_el);
			
		}
		else{
			//console.log("This model has not yet been downloaded");
		}
		
		
		
		//
		//  DELETE CLONE
		//
		
		//if(typeof window.assistants[window.settings.assistant].download_url == 'string' && window.cached_urls.indexOf(window.assistants[window.settings.assistant].download_url) != -1){
		if(window.settings.assistant.startsWith('custom_saved') || (typeof window.settings.assistants[window.settings.assistant] != 'undefined' && typeof window.settings.assistants[window.settings.assistant].clone == 'boolean' && window.settings.assistants[window.settings.assistant].clone == true)){
			
			let delete_custom_container_el = document.createElement('div');
			delete_custom_container_el.classList.add('model-info-setting-container');
			
			// Setting title
			/*
			let delete_custom_title_el = document.createElement('div');
			delete_custom_title_el.classList.add('model-info-setting-title');
			delete_custom_title_el.textContent = get_translation('Delete_custom_AI');
			delete_custom_container_el.appendChild(delete_custom_title_el);
			*/
			// Delete custom AI model button
			let delete_custom_ai_button_container_el = document.createElement('div');
			delete_custom_ai_button_container_el.classList.add('center');
			delete_custom_ai_button_container_el.classList.add('model-info-buttons-container');
			
			let delete_custom_ai_button_el = document.createElement('button');
			delete_custom_ai_button_el.classList.add('model-info-delete-custom-ai-button');
			delete_custom_ai_button_el.classList.add('scary-button');
			delete_custom_ai_button_el.textContent = get_translation('Delete_custom_AI');
			delete_custom_ai_button_el.addEventListener("click", () => {
				//console.log("clicked on delete custom AI button");
				
				let pane_el = document.getElementById('pane-content-' + window.settings.assistant);
				if(pane_el){
					//console.log("found the pane that should be removed");
					pane_el.classList.remove('selected-pane');
					pane_el.remove();
				}
				else{
					console.error("could not find the pane of the AI that's being removed: ", 'pane-content-' + window.settings.assistant);
				}
				
				window.delete_model_from_cache(window.settings.assistant);
				
				if(typeof window.conversations[window.settings.assistant] != 'undefined'){
					delete window.conversations[window.settings.assistant];
				}
				if(typeof window.unread_messages[window.settings.assistant] != 'undefined'){
					delete window.unread_messages[window.settings.assistant];
				}
				if(typeof window.assistants[window.settings.assistant] != 'undefined'){
					delete window.assistants[window.settings.assistant];
				}
				if(typeof window.settings.assistants[window.settings.assistant] != 'undefined'){
					//console.log("Deleting custom AI model from window.settings.assistants: ", window.settings.assistant);
					delete window.settings.assistants[window.settings.assistant];
					save_settings();
				}
				model_info_container_el.innerHTML = '';
				setTimeout(() => {
					window.switch_assistant('developer');
					//generate_ui();
				},1)
				
				
				
			});
			delete_custom_ai_button_container_el.appendChild(delete_custom_ai_button_el);
			delete_custom_container_el.appendChild(delete_custom_ai_button_container_el);
			
			/*
			// Delete from browser cache explanation
			let delete_custom_explanation_details_el = document.createElement('details');
			let delete_custom_explanation_summary_el = document.createElement('summary');
			delete_custom_explanation_summary_el.textContent = get_translation('what_does_this_do');
			delete_custom_explanation_details_el.appendChild(delete_custom_explanation_summary_el);
			
			let delete_custom_explanation_el = document.createElement('p');
			delete_custom_explanation_el.classList.add('model-info-system-prompt-explanation');
			delete_custom_explanation_el.textContent = get_translation('Delete_from_cache_explanation');
			delete_custom_explanation_details_el.appendChild(delete_custom_explanation_el);
			
			delete_custom_container_el.appendChild(delete_custom_explanation_details_el);
			*/
			
			model_info_settings_el.appendChild(delete_custom_container_el);
			
		}
		
		
		
		
	}
	catch(e){
		console.error("generating model info error: ", e);
	}

	
	model_info_content_el.appendChild(model_info_summary_el);
	model_info_content_el.appendChild(model_info_details_el);
	//model_info_content_el.appendChild(model_info_buttons_el);
	model_info_content_el.appendChild(model_info_settings_el);
	
	let model_info_el = document.createElement('div');
	model_info_el.classList.add('corner-close-content');
	model_info_el.appendChild(model_info_icon_container_el);
	model_info_el.appendChild(model_info_content_el);
	
	// Close model info pane
	let model_info_close_button_el = document.createElement('div');
	model_info_close_button_el.classList.add('corner-close-button');
	model_info_close_button_el.textContent = '✕';
	model_info_close_button_el.setAttribute('id','model-info-close-button');
	model_info_close_button_el.addEventListener("click", (event) => {
		//console.log("clicked on model_info_close_button");
		model_info_container_el.innerHTML = '';
		if(window.settings.assistant == 'scribe' && typeof window.settings.assistants['scribe'] != 'undefined'  && typeof window.settings.assistants['scribe']['add_timestamps'] == 'string' && window.settings.assistants['scribe']['add_timestamps'] != 'None' && window.settings.assistants['scribe']['add_timestamps'] != 'Minutes'){
			add_chat_message_once(window.settings.assistant,'developer','scribe_clock#setting---');
		}
	});
	
	
	model_info_container_el.appendChild(model_info_el);
	model_info_container_el.appendChild(model_info_close_button_el);
	
	window.update_current_doc_stats();
}











function getBaseLog(x, y) {
	return Math.log(y) / Math.log(x);
}


// Deletes all file data
function clear_indexdb(){
	
	const items = { ...localStorage };
	const local_storage_keys = keyz(items);
	//console.log("clear_indexdb: localStorage items, keys: ", items, local_storage_keys);
	for(let ls = 0; ls < local_storage_keys.length; ls++){
		//console.log("clear_indexdb: localStorage key: ", local_storage_keys[ls]);
		if(local_storage_keys[ls] != 'settings'){
			localStorage.removeItem(local_storage_keys[ls]);
		}
	}
	
	
	var req = indexedDB.deleteDatabase("ldb");
	req.onsuccess = function () {
	    console.log("Deleted database successfully");
		window.location.reload(true); 
	};
	req.onerror = function () {
	    console.error("Couldn't delete database");
		if(window.settings.settings_complexity == 'developer'){
			//flash_message(get_translation("An_error_occured"),3000,'fail');
			flash_message("Couldn't delete database",3000,'fail');
		}
		window.location.reload(true);
		
	};
	req.onblocked = function () {
	    console.error("Couldn't delete database due to the operation being blocked");
		//flash_message(get_translation("An_error_occured"),3000,'fail');
		if(window.settings.settings_complexity == 'developer'){
			flash_message("Database operation blocked",3000,'fail');
		}
		window.location.reload(true);
	};
	
	
}

// If an AI is received via a link, it's values are set to a hidden AI model called 'custom_received'
function do_clone_prefill(assistant_id,pre_prefill=null){
	//console.log("in do_clone_prefill.  assistant_id,pre_prefill: ", assistant_id,pre_prefill);
	
	if(typeof assistant_id != 'string' || (typeof assistant_id == 'string' && assistant_id == '')){
		assistant_id = window.settings.assistant;
	}
	
	if(typeof window.assistants[assistant_id] == 'undefined'){
		
	}
	if(typeof assistant_id == 'string' && assistant_id == 'received'){
		
	}
	
	// if a custom name is not provided, set a starting custom_name based on the original
	let clone_prefill = JSON.parse(JSON.stringify(window.assistants[assistant_id]));
	if(typeof clone_prefill['custom_name'] != 'string' && !assistant_id.startsWith('custom')){ 
		//console.log("clone AI: adding initial custom_name for assistant_id: ", window.settings.assistant);
		//clone_prefill['custom_name'] = get_translation(window.settings.assistant + '_name');
		if(typeof window.translations[assistant_id + '_name'] != 'undefined'){ // non-custom AIs should always have a translation _name, so superfluous check?
			clone_prefill['custom_name'] = get_translation(assistant_id + '_name');
		}
		else{
			clone_prefill['custom_name'] = '';
		}
	}
	if(typeof clone_prefill['custom_description'] != 'string' && !assistant_id.startsWith('custom')){
		//console.log("clone AI: adding initial custom_description for assistant_id: ", assistant_id);
		if(typeof window.translations[assistant_id + '_description'] != 'undefined'){
			clone_prefill['custom_description'] = get_translation(assistant_id + '_description');
		}
		else{
			clone_prefill['custom_description'] = '';
		}
	}
	
	// Not used
	if(typeof pre_prefill == 'object' && pre_prefill != null){
		//console.log("applying clone pre_prefill over the prefill");
		clone_prefill = {...clone_prefill,...pre_prefill}
	}
	
	//console.log("clone_prefill: ", clone_prefill, ", based on: ", assistant_id);
	window.ai_being_edited = assistant_id;
	start_making_custom_ai(clone_prefill,assistant_id);
}












function show_models_info(show_list=true){
	console.log("in show_models_info. show_list: ", show_list);
	
	
	check_cache()
	.then(() => {
		console.log("show_models_info: called check_cache.  window.cached_urls.length: ", window.cached_urls.length);
		// model info content
		let model_info_content_el = document.createElement('div');
		model_info_content_el.setAttribute('id','model-info-content');
		
	
		try{
		
			let original_els = [];
		
			let models_list_el = document.createElement('div');
			models_list_el.classList.add('models-list');
			models_list_el.setAttribute('id','models-list');
		
		
			let total_size = 0;
		
			for (const [assistant_id, details] of Object.entries(window.assistants)) {
				//console.log("-------")
			  	//console.log(`${assistant_id} -> ${details}`);
				//console.log("show_models_info: assistant_id: ", assistant_id, details);
				
				if(assistant_id == 'developer' || assistant_id.startsWith('ollama') || assistant_id.startsWith('divider_')){
					continue
				}
				
				let is_cached = check_if_cached(assistant_id);
			
				let model_item_container_el = document.createElement('div');
				model_item_container_el.classList.add('models-list-item-container');
			
				let model_item_el = document.createElement('div');
				model_item_el.classList.add('models-list-item');
				model_item_container_el.appendChild(model_item_el);
				
				let model_clones_list_el = document.createElement('div');
				
				
				let model_item_buttons_el = document.createElement('div');
				model_item_buttons_el.classList.add('models-list-item-buttons');
				
				
				if(show_list == true || document.getElementById('models-list') != null){
					
					model_item_buttons_el.classList.add('models-list-item-buttons');
			
					let models_list_item_icon_container_el = document.createElement('div');
					models_list_item_icon_container_el.classList.add('models-list-item-icon-container');
			
					if(!assistant_id.startsWith('custom_saved')){
						let icon_name = assistant_id;
						if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].icon == 'string' && window.assistants[assistant_id].icon.length){
							icon_name = window.assistants[assistant_id].icon;
						}
						let models_list_icon_el = document.createElement('img');
						models_list_icon_el.classList.add('models-list-item-icon');
						models_list_icon_el.src = 'images/' + icon_name + '_thumb.png';
						models_list_icon_el.alt = 'AI model icon';
						models_list_item_icon_container_el.appendChild(models_list_icon_el);
					}
						
						/*
						let model_info_icon_el2 = document.createElement('img');
						model_info_icon_el2.setAttribute('id','model-info-icon2');
						model_info_icon_el2.classList.add('model-info-icon');
						model_info_icon_el2.src = 'images/' + window.settings.assistant + '.png';
						model_info_icon_el2.alt = 'invisible AI model icon';
						model_info_icon_container_el.appendChild(model_info_icon_el2);
						*/
				
					models_list_item_icon_container_el.addEventListener("click", () => {
						switch_assistant(assistant_id);
					});
				
					model_item_el.appendChild(models_list_item_icon_container_el);
			
			
			
					let model_item_name_el = document.createElement('span');
					model_item_name_el.classList.add('models-list-item-name');
					if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].custom_name == 'string'){
						model_item_name_el.textContent = window.settings.assistants[assistant_id].custom_name;
					}
					else if(!assistant_id.startsWith('custom_saved')){
						model_item_name_el.setAttribute('data-i18n',assistant_id + '_name');
						model_item_name_el.textContent = get_translation(assistant_id + '_name');
					}
					model_item_el.appendChild(model_item_name_el);
				}
			
				let model_size = '';
				let known_size = null;
				
				//if(typeof window.assistants[assistant_id].clone_original == 'undefined' && typeof window.settings.assistants[assistant_id].clone_original == 'undefined'){
				if(typeof window.assistants[assistant_id].clone == 'boolean' && window.assistants[assistant_id].clone == true && typeof window.assistants[assistant_id].clone_original == 'string' || (typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].clone_original == 'string')){
					// skip clones, they will be added later
					//console.log("show_models_info (storage management): skipping a clone");
					continue
				}
				else{
					if(typeof window.assistants[assistant_id].size == 'number'){
						known_size = window.assistants[assistant_id].size;
					}
					else if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].size == 'number'){
						known_size = window.settings.assistants[assistant_id].size;
					}
					
					original_els[assistant_id] = model_clones_list_el;
					model_clones_list_el.classList.add('models-list-item-clones');
					model_item_container_el.appendChild(model_clones_list_el);
					
				}
				
				
			
				if(typeof known_size == 'number'){
					if(is_cached){
						total_size += known_size;
						model_size = known_size;
					
						if(show_list == true || document.getElementById('models-list') != null){
							let model_item_delete_button_el = document.createElement('button');
							model_item_delete_button_el.classList.add('scary-button');
							model_item_delete_button_el.classList.add('models-list-delete-model-button');
							model_item_delete_button_el.innerHTML = '<span><span class="model-size-gigabytes">' + model_size + '</span><span class="gigabytes-label">GB</span></span>';
							model_item_delete_button_el.addEventListener('click', () => {
								//console.log("models_list: going to delete model: ", assistant_id);
								window.delete_model_from_cache(assistant_id)
								.then(() => {
									//console.log("model should be deleted, calling show_models_info to refresh the list");
									show_models_info();
								})
								.catch((err) => {
									console.error("caught error deleting model from models list: ", err);
									show_models_info();
								})
						
								model_item_delete_button_el.remove();
								models_list_el.innerHTML = '&nbsp;';
							})
							model_item_buttons_el.appendChild(model_item_delete_button_el);
						}
					
					}
				
				}
				
				if(show_list == true || document.getElementById('models-list') != null){
					
					model_item_el.appendChild(model_item_buttons_el);
					if(is_cached){
						models_list_el.appendChild(model_item_container_el);
					}
				}
			
			}
			
			
			// Add clones to the list
			
			for (const [assistant_id, details] of Object.entries(window.settings.assistants)) {
				let original_assistant_id = null;

				if(typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].clone == 'boolean' && window.settings.assistants[assistant_id].clone == true && typeof window.settings.assistants[assistant_id] != 'undefined' && typeof window.settings.assistants[assistant_id].clone_original == 'string'){
					original_assistant_id = window.settings.assistants[assistant_id].clone_original;
				}
				else if(typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].clone == 'boolean' && window.assistants[assistant_id].clone == true && typeof window.assistants[assistant_id] != 'undefined' && typeof window.assistants[assistant_id].clone_original == 'string'){
					original_assistant_id = window.assistants[assistant_id].clone_original;
				}
				
				if(typeof original_assistant_id == 'string' && original_assistant_id.length){
					if(typeof original_els[original_assistant_id] != 'undefined'){
						
						let model_item_clone_el = document.createElement('div');
						model_item_clone_el.classList.add('models-list-item-clone');
						
						let model_item_child_indicator_el = document.createElement('span');
						model_item_child_indicator_el.classList.add('models-list-item-child-indicator');
						model_item_child_indicator_el.textContent = '╰';
						model_item_clone_el.appendChild(model_item_child_indicator_el);
						
						let model_item_name_el = document.createElement('span');
						model_item_name_el.classList.add('models-list-item-name');
						if(typeof window.settings.assistants[assistant_id].custom_name == 'string'){
							model_item_name_el.textContent = window.settings.assistants[assistant_id].custom_name;
						}
						else{
							model_item_name_el.setAttribute('data-i18n',assistant_id + '_name');
							model_item_name_el.textContent = get_translation(assistant_id + '_name');
						}
						model_item_clone_el.appendChild(model_item_name_el);
						
						original_els[original_assistant_id].appendChild(model_item_clone_el);
						
					}
				}
				else{
					//console.log("no original_assistant_id for assistant: ", assistant_id);
				}
				
			}
			
			
			// Calculate total used disk space
			total_size = Math.round(total_size * 10) / 10;
		
			if(total_size > 20){
				total_size = Math.round(total_size);
				//console.log("total_size of all models storage: ", total_size);
			}
		
			// Models list footer
			if(show_list == true || document.getElementById('models-list') != null){
				let models_list_footer_el = document.createElement('div');
				models_list_footer_el.setAttribute('id','models-list-footer');
				models_list_footer_el.classList.add('models-list-item');
				models_list_footer_el.classList.add('flex-between');
		
				let models_list_total_size_el = document.createElement('div');
				models_list_total_size_el.innerHTML = '<span class="bold" data-i18n="Total">' + get_translation('Total') + '</span><span>:</span> <span class="ai-model-size-number">' + total_size + '</span><span class="ai-model-size-gb">GB</span>';
				models_list_footer_el.appendChild(models_list_total_size_el);
				
				let models_delete_button_el = document.createElement('button');
				models_delete_button_el.classList.add('scary-button');
				//models_delete_button_el.classList.add('models-list-delete-model-button');
				models_delete_button_el.textContent = get_translation("Delete_all_AIs");
				models_delete_button_el.addEventListener('click', () => {
					
					try{
						if(confirm(get_translation('Are_you_sure'))){
			
							/*
								It seems there are more caches being created by all the libraries:
			
				webllm/config
				webllm/model
				phi-mixformer-candle-cache
				transformers-cache
				webllm/wasm
				tvmjs
				llama-cpp-wasm-cache
				
							*/
							model_info_container_el.innerHTML = '';
							clear_cache();
							//Cache.delete();
							//console.log("caches cleared");
							//window.location.reload(true); 
						}
		
					}
					catch(e){
						console.error("Error clearing cache: ", e);
					}
					
				});
				
				models_list_footer_el.appendChild(models_delete_button_el);
				models_list_el.appendChild(models_list_footer_el);
				
			}
				
			total_disk_space_used_el.innerHTML = '<span class="ai-model-size-number">' + total_size + '</span><span class="ai-model-size-gb">GB</span>';

			
			
			
			model_info_content_el.appendChild(models_list_el);
		
			
		
		}
		catch(e){
			console.error("generating models list error: ", e);
		}
	
	
	
		//model_info_content_el.appendChild(model_info_buttons_el);
		if(show_list == true || document.getElementById('models-list') != null){
			model_info_container_el.innerHTML = '';
		
			let model_info_el = document.createElement('div');
			model_info_el.classList.add('corner-close-content');
			//model_info_el.appendChild(model_info_icon_container_el);
			model_info_el.appendChild(model_info_content_el);
	
			// Close model info pane
			let model_info_close_button_el = document.createElement('div');
			model_info_close_button_el.classList.add('corner-close-button');
			model_info_close_button_el.textContent = '✕';
			model_info_close_button_el.setAttribute('id','model-info-close-button');
			model_info_close_button_el.addEventListener("click", (event) => {
				//console.log("clicked on model_info_close_button");
				model_info_container_el.innerHTML = '';
			});
	
			model_info_container_el.appendChild(model_info_el);
			model_info_container_el.appendChild(model_info_close_button_el);
		}
		else{
			//model_info_container_el.innerHTML = '';
		}
	})
	.catch((err) => {
		console.error("caught general error in show_models_info: ", err);
	})
	
	
}



function create_custom_ai(custom_settings={},assistant_id=null){
	//console.log("in create_custom_ai_from_original.  assistant_id,custom_settings: ", assistant_id,custom_settings);
	let clone = false;
	try{
		if(assistant_id == null){
			clone = true;
			console.warn("create_custom_ai: no assistant provided, using pick_optimal_text_ai to select the AI to clone")
			assistant_id = window.pick_optimal_text_ai();
		}
		if(typeof assistant_id == 'string' && typeof window.assistants[assistant_id] != 'undefined'){
			let new_custom_ai = JSON.parse(JSON.stringify(window.assistants[assistant_id]));
		
			if(typeof new_custom_ai['examples'] != 'undefined'){
				delete new_custom_ai['examples'];
			}
			if(typeof new_custom_ai['initial_example_prompt'] != 'undefined'){
				delete new_custom_ai['initial_example_prompt'];
			}
		
			new_custom_ai = {...new_custom_ai,...custom_settings};
			if(clone){
				new_custom_ai['clone'] = true;
				new_custom_ai['clone_original'] = assistant_id;
			}
		
			if(typeof new_custom_ai['availability'] != 'undefined'){
				delete new_custom_ai['availability'];
			}
		
		
			if(typeof new_custom_ai.custom_name == 'string' && new_custom_ai.custom_name.length > 1 && typeof new_custom_ai.custom_description != 'string'){
				new_custom_ai.custom_description = '';
			}
		
			if(typeof new_custom_ai.custom_name == 'string'){
				//console.log("create_custom_ai: OK, new_custom_ai.custom_name is string: ", new_custom_ai.custom_name);
				// check if there is no AI with the same name already
				let already_exists = null;
				for (const [assistant_id, details] of Object.entries(window.assistants)){
					if(typeof details.custom_name == 'string' && typeof details.custom_description == 'string' && new_custom_ai.custom_name == details.custom_name){
						already_exists = assistant_id;
						break
					}
				}
			
				if(already_exists == null){
					//console.log("create_custom_ai: really creating a new AI model");
					let new_custom_ai_id = 'custom_saved_' + makeid(8) + '_' + new_custom_ai.custom_name.trim().replaceAll(' ','_');
					//console.log("create_custom_ai: new custom AI ID and values: ", new_custom_ai_id, new_custom_ai);
					window.settings.assistants[new_custom_ai_id] = new_custom_ai;
					window.settings.assistants[new_custom_ai_id]['selected'] = true;
					window.settings.assistants[new_custom_ai_id]['character'] = true;
					save_settings();
					window.assistants[new_custom_ai_id] = new_custom_ai;
					switch_assistant(new_custom_ai_id);
				}
				else{
					// The provided models shouldn't be adjustable from an external URL, that could create confusion for beginners.
					console.warn("create_custom_ai: the AI's name and description combo already existed. Simply switching to the model instead");
					switch_assistant(already_exists);
				}
			}
		}
		else{
			console.error("create_custom_ai: invalid assistant id?");
		}
	}
	catch(err){
		console.error("caught error in create_custom_ai: ", err);
	}
	
	
}



window.service_worker_offline = () => {
	console.warn("in service_worker_offline");
	window.internet = false;
	flash_message(get_translation("Running_in_offline_mode"),2000);  // ,'info'
	//flash_message(get_translation("A_model_has_to_be_downloaded_from_the_internet_but_there_is_no_internet_connection"),4000,'error');
};



//
//  DOCUMENT TEXT TOOLS TOOLBAR
//

bar_toggle_bold_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on toggle bold button");
	toggleBold();
});

bar_toggle_italic_el.addEventListener("click", (event) => {
	event.stopPropagation();
	//console.log("clicked on toggle bold button");
	toggleItalic();
});














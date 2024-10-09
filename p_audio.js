


//window.transcriber_recordings = []; // for creating an AI that that take notes at a meeting
//window.transcriber_frames_to_go = 0; // to avoid creating a huge backlog
//window.transcriber_start_time = null;

window.mp3_worker = null;
window.mp3_worker_busy = false;
let mp3_worker_error_count = 0;





function create_main_audio_context(sampleRate=16000){
	//console.log("in create_main_audio_context. sampleRate: ", sampleRate);
	
	if(window.main_audio_context == null){
		
		
		
	    if (is_firefox) { // Firefox can't change samplerate
			window.main_audio_context = new AudioContext({ // TODO: check if Firefox is OK with these values being set
				echoCancellation: true,
				autoGainControl:  true,
				noiseSuppression: true,
			 });
	    } 
		else {
			window.main_audio_context = new AudioContext({ 
				sampleRate: 16000,//sampleRate,
				echoCancellation: true,
				autoGainControl:  true,
				noiseSuppression: true,
			 });
	    }
		
		
		if(window.main_audio_context){
			window.main_audio_context.onstatechange = function(event){
				console.error("main_audio_context state changed! ", event);
				
				if(typeof event.target != 'undefined' && typeof event.target.sampleRate == 'number'){
					window.main_audio_context_sample_rate = event.target.sampleRate;
				}
				//console.log("window.main_audio_context.state: ", window.main_audio_context.state);
			}
		}
		
		
	}
	else{
		//console.log("create_main_audio_context:  already exists, resuming main_audio_context instead");
		window.main_audio_context.resume();
	}
}
window.create_main_audio_context = create_main_audio_context;








//
//  MICROPHONE
//

function enable_microphone(also_enable_speaker=true){
	console.log("in enable_microphone.   window.stopped_whisper_because_of_low_memory, window.whisper_loaded,window.busy_loading_whisper: ", window.stopped_whisper_because_of_low_memory, window.whisper_loaded, window.busy_loading_whisper);
	
	window.stopped_whisper_because_of_low_memory = false;
	document.body.classList.remove('microphone-sleeping');
	
	if(window.settings.assistant == 'scribe' && window.last_time_scribe_started == null){
		window.last_time_scribe_started = Date.now();
	}
	
	if(also_enable_speaker && window.speakers_manually_overridden == false && (window.ram > 4000 || window.pip_started)){
		enable_speaker();
	}
	
	if(window.idle && window.ram < 4001){
		console.warn("enable_microphone: low memory, so calling do_unload to unload everything but Whisper");
		window.do_unload();
	}
	
	if(window.myvad != null){
		//console.log("enable microphone: window.myvad already exists. Toggling VAD to on. state: ", state);
		window.myvad.start();
		window.microphone_enabled = true;
		document.body.classList.add('microphone-enabled');
		
		if(state != DOING_ASSISTANT && state != DOING_TTS){
			set_state(LISTENING);
		}
		//console.log("enable microphone: window.myvad already existed. Toggling VAD to on.");
		return
	}
	else if(window.simple_vad_source != null){
		console.log("enable microphone: window.simple_vad_source already exists. Toggling SimpleVAD to on. state: ", state);
		//window.myvad.start();
		window.unpauseSimpleVAD();
		window.microphone_enabled = true;
		document.body.classList.add('microphone-enabled');
		set_state(LISTENING);
		/*
		if(state != DOING_ASSISTANT && state != DOING_TTS){
			set_state(LISTENING);
		}
		*/
		console.warn("enable microphone: window.myvad already existed. Toggling VAD to on.");
		return
	}
	
	else{
		console.log("enable_microphone: also calling start_vad()");
		window.skip_first_vad_recording = true;
		window.start_vad();
		
		window.microphone_enabled = true;
		document.body.classList.add('microphone-enabled');
		
		if(state != DOING_ASSISTANT && state != DOING_TTS){
			set_state(LISTENING);
		}
	}
	
	
	if(window.settings.assistant == 'scribe'){
		if(window.simple_vad != null && typeof window.simple_vad.port != 'undefined'){
			window.continuous_vad();
		}
		if(window.current_scribe_voice_parent_task_id == null){
			console.log("enable mmicrophone: Scribe, and current_scribe_voice_parent_task_id was null: calling create_scribe_parent_task");
			window.create_scribe_parent_task();
		}
	}
	
	
	
	
	if(window.whisper_loaded == false && window.busy_loading_whisper == false && window.whisper_worker_busy == false){
		console.log("enable_microphone: whisper does not seem to be loaded, calling preload_whisper");
		
		//window.whisper_loading = true;
		window.add_chat_message('current','developer','_$_downloading_speech_recognition_model');
		
		console.log("enable_microphone: window.whisper_loaded was false. Calling preload_whisper");
		window.preload_whisper({'assistant':window.settings.assistant,'preload':true});
		
		
		/*
		window.do_whisper_web({'recorded_audio':[
			-0.0005011023604311049,
		    -0.00037701072869822383,
		    -0.0002709922264330089,
		    -0.00024144611961673945,
		    -0.00020606353064067662,
		    -0.0001263563462998718,
		    -0.00006719290104229003,
		    0.000013826760550728068,
		    0.00011079008982051164,
		    0.00020483406842686236,
		    0.0002964858722407371,
		    0.00032513143378309906,
		    0.00028730230405926704,
		    0.00018674119201023132
		]});
		*/
		
		
		if(voice_tutorial_shown == false && window.settings.tutorial.voice_tutorial_done == false && window.settings.assistant != 'scribe'){
			voice_tutorial_shown = true;
			setTimeout(() => {
				add_chat_message('current','developer','voice_tutorial#setting---');
			},120000);
		}
	}
	
	
	if(window.busy_doing_blueprint_task == false && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
		const blueprint_prompt_command = '\n\nEnable microphone\n\n';
		flash_message(get_translation("Added_command_to_blueprint"),1000);
		if(!window.doc_text.endsWith(blueprint_prompt_command)){
			insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, blueprint_prompt_command);
		}
		else{
			//console.log("blueprint already ended with this prompt command");
		}
	}
	
	
}
window.enable_microphone = enable_microphone;




function disable_microphone(){
	console.log("in disable_microphone");
	window.microphone_enabled = false;
	document.body.classList.remove('microphone-enabled');
	window.continuous_vad(false);
	window.stop_vad();
	setTimeout(() => {
		document.body.classList.remove('doing-recording');
	},100);
	document.body.classList.remove('doing-recording');
	/*
	if(window.myvad != null){
		window.myvad.pause();
	}
	*/
	
	
	if(window.whisper_worker != null){
		//console.log("disable microphone: also terminating whisper worker");
		// TODO: let worker do model.dispose first?
		
		window.dispose_whisper();
	}
	else{
		//console.log("disable microphone: whisper worker was already null");
	}
	change_tasks_with_state('doing_stt','interrupted');
	change_tasks_with_state('should_stt','interrupted');
	window.last_time_scribe_started = null;
	// window.scribe_precise_sentences_count = 0; // TODO check if there is no file being transcribed, or waiting to be transcribed
	
	
	if(window.busy_doing_blueprint_task == false && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
		const blueprint_prompt_command = '\n\nDisable microphone\n\n';
		flash_message(get_translation("Added_command_to_blueprint"),1000);
		if(!window.doc_text.endsWith(blueprint_prompt_command)){
			insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, blueprint_prompt_command);
		}
		else{
			//console.log("blueprint already ended with this prompt command");
		}
	}
	
	if(window.settings.assistant != 'scribe'){
		window.stop_scribe_voice_task();
	}
	
}
window.disable_microphone = disable_microphone;




//
//  SPEAKER
//

function enable_speaker(){
	window.speaker_enabled = true;
	document.body.classList.add('speaking-out-loud');
	window.create_main_audio_context(16000);
	
	if(window.added_scripts.indexOf('./easy_speech/EasySpeech.iife.js') == -1){
		window.add_script('./easy_speech/EasySpeech.iife.js')
		.then((value) => {
			if(EasySpeech){
				EasySpeech.init({ maxTimeout: 5000, interval: 250 })
    			.then(() => {
					console.debug('easy_speech load complete');
					window.easy_speech_loaded = true;
				})
    			.catch(e => {
					console.error('easy_speech init failed: ', e);
					if(window.settings.language != 'en'){
						flash_message(get_translation('This_browser_does_not_support_Text-to-Speech'),2000,'warn');
						disable_speaker();
					}
				});
			}

		})
		.catch((err) => {
			console.error("enable_speaker: failed to load easy_speech: ", err);
		})
	}
	
	
	if(window.busy_doing_blueprint_task == false && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
		const blueprint_prompt_command = '\n\nEnable audio\n\n';
		flash_message(get_translation("Added_command_to_blueprint"),1000);
		if(!window.doc_text.endsWith(blueprint_prompt_command)){
			insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, blueprint_prompt_command);
		}
		else{
			//console.log("blueprint already ended with this prompt command");
		}
	}
}
window.enable_speaker = enable_speaker;

function disable_speaker(){
	window.speaker_enabled = false;
	document.body.classList.remove('speaking-out-loud');

	// TODO: set all 'speak' tasks to interrupted
	try{
		if(window.audio_player != null){
			window.audio_player.stop();
			window.audio_player_busy = false;
		}
		//if(window.main_audio_context){
			//console.log("disable_speaker: suspending window.audioCxt (blocked)");
			//window.main_audio_context.suspend();
		//}
	}
	catch(e){
		console.error("caught error trying to stop audio from playing: ", e);
	}
	
	if(window.microphone_enabled){
		window.speakers_manually_overridden = true; // user may prefer STT without TTS. This will stop automatically also switching on the speakers whenever the microphone is enabled
	}
	
	interrupt_speaker();
	
	if(window.busy_doing_blueprint_task == false && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint') && typeof window.doc_text == 'string' && window.settings.docs.open != null){
		const blueprint_prompt_command = '\n\nDisable audio\n\n';
		flash_message(get_translation("Added_command_to_blueprint"),1000);
		if(!window.doc_text.endsWith(blueprint_prompt_command)){
			insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_current_line_nr}, blueprint_prompt_command);
		}
		else{
			//console.log("blueprint already ended with this prompt command");
		}
	}
	
}
window.disable_speaker = disable_speaker;


function interrupt_speaker(){
	console.log("in interrupt_speaker");
	if(window.audio_player != null){
		window.audio_player.stop();
		window.audio_player_busy = false;
	}
	
	if(window.llama_cpp_busy){
		window.interrupt_llama_cpp();
	}
	else if(window.web_llm_busy){
		window.interrupt_web_llm();
	}
	
	change_tasks_with_state('should_assistant');
	change_tasks_with_state('doing_tts');
	change_tasks_with_state('should_tts');
	change_tasks_with_state('should_audio_player');
	change_tasks_with_state('doing_audio_player');
	set_speaker_progress(100);
	
	window.interrupt_speaking_task_index = window.task_counter;
	console.log("window.interrupt_speaking_task_index is now: ", window.interrupt_speaking_task_index);
	
	for(let t = 0; t < window.task_queue.length; t++){
		if(typeof window.task_queue[t].state == 'string' && window.task_queue[t].state == 'doing_assistant'){
			window.task_queue[t].speech_interrupted = true;
		}
	}
	
	update_buffer_counts();
}
window.interrupt_speaker = interrupt_speaker;


function set_voice(new_voice='default'){
	//console.log("in set_voice. new_voice: ", new_voice);
	if(typeof new_voice == 'string'){
		
		speaker_voice_select_el.value = new_voice;
		if(window.settings.voice != new_voice){
			window.settings.voice = new_voice;
			save_settings();
		}
		
		move_speaker_voice_button_background(new_voice);
		
		if(window.busy_doing_blueprint_task == false && typeof current_file_name == 'string' && current_file_name.endsWith('.blueprint')){
			flash_message(get_translation("Added_command_to_blueprint"),1000);
			insert_into_document({'file':window.settings.docs.open,'selection':window.doc_selection,'line_nr':window.doc_line_nr},'\n\nChange voice to ' + new_voice + '\n\n');
		}
		return true
	}
	else{
		console.error("set_voice: invald input: ", new_voice);
	}
	return false
}
window.set_voice = set_voice;



if(typeof window.settings.voice == 'string'){
	//console.log("setting voice dropdown to: ", window.settings.voice);
	window.set_voice(window.settings.voice);
}



// TODO: is this still used?
function start_transcribing(){
	//console.log("in start_transcribing");
	window.transcribing = true;
}







// Perform Speech-To-Text on raw audio data
function transform_recorded_audio(recorded_audio,origin='voice'){
	console.error("in transform_recorded_audio. recorded_audio: ", recorded_audio);
	console.log("transform_recorded_audio: audioData.numberOfChannels: ", recorded_audio.numberOfChannels);
	//window.busy_doing_stt = true;
	
	//if(window.settings.assistant != 'scribe'){
	//	window.set_state(DOING_STT);
	//}
	
	//console.log("in transform_recorded_audio");
	//console.log("recorded_audio: ", recorded_audio);
	if(recorded_audio.length == 0){
		console.error("transform_recorded_audio: aborting, recorded_audio array is empty");
		return
	}
	//console.log("recorded_audio.buffer: ", recorded_audio.buffer);
	
	//let performance_measurement_time = Date.now();
	// TODO: is this part still used? // yep
    //const wavBuffer = encodeWAV(recorded_audio);
	//console.log("wavBuffer: ", wavBuffer);
    /*
	const base64 = arrayBufferToBase64(wavBuffer);
    const url = `data:audio/wav;base64,${base64}`;
    audio_el.src = url; 
	*/
	//const window.main_audio_context = new AudioContext();
	
	// TODO: make this a global microphone audioContext?
	if(window.main_audio_context == null){
		console.error("transform_recorded_audio: unexpectedly creating main_audio_context"); // in the past a separate audio context was used with a low samplerate of 16000
		create_main_audio_context();
	}
	

	let audioBuffer = recorded_audio;
	
	
	/*
		// TODO: could merge left and right channels, as done in the Whisper demo by Xenova
	
		let audio;
                if (audioData.numberOfChannels === 2) {
                    const SCALING_FACTOR = Math.sqrt(2);

                    let left = audioData.getChannelData(0);
                    let right = audioData.getChannelData(1);

                    audio = new Float32Array(left.length);
                    for (let i = 0; i < audioData.length; ++i) {
                        audio[i] = SCALING_FACTOR * (left[i] + right[i]) / 2;
                    }
                } else {
                    // If the audio is not stereo, we can just use the first channel:
                    audio = audioData.getChannelData(0);
                }
		
	*/
	
	
	
	const myArrayBuffer = window.main_audio_context.createBuffer(
	  1,
	  recorded_audio.length,
	  16000,
	);
	
	/*
	const nowBuffering = myArrayBuffer.getChannelData(0);
	for (let i = 0; i < recorded_audio.length; i++) {
		nowBuffering[i] = recorded_audio[i];
	}
	*/
	
	// Do something with audioBuffer
	//console.log("transform_recorded_audio: cool audioBuffer: ", audioBuffer);

	//var offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
	var offlineContext = new OfflineAudioContext(1, audioBuffer.length, 16000);
	var source = offlineContext.createBufferSource();
	source.buffer = myArrayBuffer; //audioBuffer;
	source.connect(offlineContext.destination);
	source.start(0);

	offlineContext.startRendering().then(function(renderedBuffer) {
		console.log("transform_recorded_audio: offlineContext.startRendering done. renderedBuffer: ", renderedBuffer)
		
		audio = renderedBuffer.getChannelData(0);
		console.log("transform_recorded_audio: 1 channel:  audio.length, audio: ", audio.length, audio);

		//console.log('transform_recorded_audio: channel0 audio.length: ' + audio.length);

		const kMaxRecording_s = 29; // TODO maybe this should be 20 for whisper timestamped?
		const kSampleRate = 16000;


		



		// truncate to first 30 seconds
		// TODO: loop over data and split into 30 second chunks, and add those to the list of audio to process
		const samples_per_period = kMaxRecording_s*kSampleRate;
		if (audio.length > samples_per_period) {
			
			let loops_to_do = Math.floor(audio.length / samples_per_period);
			//console.log("transform_recorded_audio: splitting VERY LONG recorded audio into a number of chunks: ", loops_to_do + 1);
			for(let c = 0; c < loops_to_do; c++){
				console.log("transform_recorded_audio: adding a big audio chunk task. also, since it's long audio: forcing output to a document");
				window.push_stt_task(audio.slice(c*samples_per_period,(c+1)*samples_per_period),true); // true = force_document_destination; for such long audio bits, force output to a document
			}
			let leftover = audio.length % samples_per_period;
			console.log("leftover audio: ", leftover);
			if(leftover > 4000){
				window.push_stt_task(audio.slice(audio.length-leftover,audio.length-1),true); // true = force_document_destination; for such long audio bits, force output to a document
			}
			//audio = audio.slice(0, kMaxRecording_s*kSampleRate);
			//console.log('direct_audio: truncated audio to first ' + kMaxRecording_s + ' seconds');
		}
		else{
			// TODO: Could also force commands longer than 20 seconds to go to a document
			console.log("transform_recorded_audio: pushing recorded audio data to a task: ", audio);
			window.push_stt_task(audio);
		}
		
	});
	
}
window.transform_recorded_audio = transform_recorded_audio;



// PUSH_STT_TASK  (ADD STT TASK add_stt_task)
// input audio may be basic array of floats
async function push_stt_task(audio,force_document_destination=false,stt_task=null,prefered_extension=null){ // origin="voice",
	//console.log("in push_stt_task. window.settings.docs.open, window.active_destination: ", window.settings.docs.open, window.active_destination);
	
	if(typeof audio == 'undefined' || audio == null){
		console.error("push_stt_task: no valid audio provided: ", typeof audio);
	}
	
	
	let destination = window.active_destination;
	if(window.settings.assistant == 'scribe'){
		destination = 'document';
	}
	
	// TODO: fix this at the source
	
	//console.error("PUSH_STT_TASK");
	//console.log("-- AUDIO:  typeof audio, audio.length:", typeof audio, audio.length);
	
	
	let origin = "voice";
	if(stt_task != null && typeof stt_task.origin == 'string' && stt_task.origin != ''){
		if(stt_task.origin == 'blueprint'){
			if(typeof stt_task.file != 'undefined' && stt_task.file != null && typeof stt_task.file.filename == 'string'){
				if(filename_is_video(stt_task.file.filename)){
					origin = 'video_file';
				}
				else if(filename_is_audio(stt_task.file.filename)){
					origin = 'audio_file';
				}
			}
			
		}
		else{
			origin = stt_task.origin;
		}
		
	}
	//console.log("push_stt_task: origin: ", origin);
	
	
	const minimum_length = 4000; //Math.floor(task["sample_rate"] / 2); // half a second
	//console.log("Simple VAD:  minimum_length vs actual length: ", minimum_length, audio.length);
	let recording = [];
	
	if(audio.length >= minimum_length){ // 24000 (48000/2);
		//console.log("Simple VAD recording is long enough: ", audio.length);

		
		let skip_factor = 1;
		
		if(stt_task != null && typeof stt_task["sample_rate"] == 'number'){
			skip_factor = Math.round(stt_task["sample_rate"] / 16000);
			
			if(typeof window.main_audio_context_sample_rate == 'number' && stt_task["sample_rate"] != window.main_audio_context_sample_rate){
				console.warn("push_stt_task: skip_factor doubt: window.main_audio_context_sample_rate was different from provided sample rate: ", window.main_audio_context_sample_rate, stt_task["sample_rate"])
				
				skip_factor = Math.round(window.main_audio_context_sample_rate / 16000);
				
				
			}
		}
		else{
			console.error("push_stt_task: task had no sample_rate data, cannot calculate a skip-factor: ", stt_task);
		}
		
		if(window.whisper_saw_exclamation_marks){
			console.warn("push_stt_task: forcing skip factor to 3, as a previous message returned only exclamation marks");
			skip_factor = 3;
		}
		
		if(window.is_firefox){
			// TODO: EXPERIMENTAL
			skip_factor = 3;
		}
		
		
		if(typeof window.measured_microphone_sample_rate == 'number' && window.measured_microphone_sample_rate >= 16000){
			if(window.measured_microphone_sample_rate == 16000){
				//console.log("OK, detected real_sample_rate, and it was the optimal sample rate: ", window.measured_microphone_sample_rate);
				skip_factor = 1;
			}
			else{
				skip_factor = window.measured_microphone_sample_rate / 16000;
				//console.log("detected real_sample_rate, and it was a non-optimal sample rate. Skip_factor is now: ", skip_factor, window.measured_microphone_sample_rate);
			}
			
		}
		
		
		if(skip_factor != 1){
			console.warn("push_stt_task: audio recording skip_factor: ", skip_factor);
		}
		
		
		function trim_recording(recording){
			console.log("push_stt_task: in push_stt_task sub-function trim_recording.  recording.length: ", typeof recording, recording.length, recording);
			
			if(recording == null || !Array.isArray(recording)){
				console.error("push_stt_task: TRIM_RECORDING: recording was invalid: ", typeof recording, recording);
				return null
			}
			
			
			if(typeof stt_task != 'undefined'){
				
				let trim_end = true;
				if(typeof stt_task["assistant"] == 'string' && stt_task["assistant"] == 'scribe'){
					console.log("push_stt_task: Not trimming end of recording because assistant is Scribe");
					return recording
					trim_end = false;
				}
				
				else if(typeof stt_task["add_timestamps"] == 'string' && (stt_task["add_timestamps"] == 'Precise' || stt_task["add_timestamps"] == 'Detailed')){
					console.log("push_stt_task: Precise timestamps set in task, so not trimming end of recording");
					//return recording
					trim_end = false;
				}
				
				// At the moment this can only by set for the 'scribe' assistant
				else if(typeof stt_task["assistant"] == 'string' && typeof window.settings.assistants[ stt_task["assistant"] ] != 'undefined' && typeof window.settings.assistants[ stt_task["assistant"] ]['add_timestamps'] == 'string' && (window.settings.assistants[ stt_task["assistant"] ]['add_timestamps'] == 'Detailed' || window.settings.assistants[ stt_task["assistant"] ]['add_timestamps'] == 'Precise')){
					console.log("push_stt_task: Precise timestamps selected for assistant, so not trimming end of recording");
					//return recording
					trim_end = false;
				}
			}
			
			// trim from beginning
			let audio_points_with_zero_value = 0;
			for(let a = 0; a < recording.length; a++){
				if(recording[a] === 0){
					audio_points_with_zero_value = a;
				}
				else{
					break;
				}
			}
			if(audio_points_with_zero_value != 0){
				if(audio_points_with_zero_value > 128){ // leave a little 
					audio_points_with_zero_value = audio_points_with_zero_value - 128;
				}
				console.log("push_stt_task: trim_recording: removing audio with zero value from beginning of recording: ", audio_points_with_zero_value);
				recording.splice(0,audio_points_with_zero_value);
			}
			
			// trim from end
			// Skipping trim from end for now, as the ending is the absolute reference point for precise audio transcription
			
			if(trim_end){
				audio_points_with_zero_value = 0;
				for(let a = recording.length -1; a >= 0; --a){
					if(recording[a] === 0){
						audio_points_with_zero_value = a;
					}
					else{
						break;
					}
				}
			
				if(audio_points_with_zero_value > 2000){ // 0
					if(audio_points_with_zero_value > 1280){ // leave a little 
						audio_points_with_zero_value = audio_points_with_zero_value - 1280;
					}
					else if(audio_points_with_zero_value > 128){ // leave a little 
						audio_points_with_zero_value = audio_points_with_zero_value - 128;
					}
					console.log("push_stt_task: trim_recording: removing audio with zero value from end of recording: ", audio_points_with_zero_value);
					recording.splice(recording.length - audio_points_with_zero_value, audio_points_with_zero_value);
				}
			}
			
			return recording;
		}
		
		let flush_offset = 0;
		if(stt_task != null && typeof stt_task["flush_offset"] == 'number'){
			flush_offset = stt_task["flush_offset"];
			if(skip_factor != 1){
				flush_offset = flush_offset / skip_factor;
			}
		}
		
		
		
		
		// Decimate to get to 16000 samplerate
		if(skip_factor > 1){
			//skip_factor = skip_factor--;
			console.log("push_stt_task: decimating audio, because of skip_factor: ", skip_factor, ", audio.length before: ", audio.length);
			for(let x = 0; x < audio.length; x = x + skip_factor){
				recording.push(audio[x]);
			}
			
			
			//recording = trim_recording(recording);
			console.log("skip_factor -> recording.length after: ", recording.length);
			
		}
		else{
			recording = audio;
			//console.log("skip_factor not needed");
		}
		
	}
	else{
		console.error("push_stt_task: simple VAD recording is not long enough");
		if(typeof stt_task != 'undefined' && stt_task != null && typeof stt_task.index == 'number'){
			handle_completed_task(stt_task,false,{"state":"failed"});
		}
		return
	}
	
	
	
	
	
	if(document.body.classList.contains('show-document') && typeof current_file_name == 'string' && typeof folder == 'string' && current_file_name == '_playground_notepad.txt'){
		console.error("push_stt_task: notepad was open, but that wasn't reflected in window.settings.docs.open");
		//window.settings.docs.open = {'filename':current_file_name,'folder':folder}
		window.settings.docs.open = null; //{'filename':current_file_name,'folder':folder}
	}
	
	
	
	
	let snippets = [];
	let final_snippet = false;
	
	
	const frames_overlap = (6 * 16000);
	const frames_min = (23 * 16000);
	const frames_max = (29 * 16000);
	
	
	
	
	// destination
	if(window.settings.docs.open != null && audio.length > frames_max){  // (16000 * 29)      //6000000){     // If the audio is very long it's unlikely to be a chat command input
		//console.log("push_stt_task: very long audio recording, and a document is open. Overriding, and assuming destination is document. recording.length: ", recording.length);
		destination = 'document';
	}
	if(typeof force_document_destination == 'boolean' && force_document_destination == true){
		destination = 'document';
	}
	if(window.settings.assistant == 'scribe'){
		destination = 'document';
	}
	
	
	//console.log("push_stt_task: destination: ", destination);
	
	if(stt_task == null || (stt_task != null && typeof stt_task.index != 'number')){
		let new_stt_task = {
			'assistant':window.settings.assistant,
			'prompt':null,
			'origin':origin,
			'type':'undetermined',
			'state':'should_stt',
			'desired_results':1,
			'results':[],
			'is_mobile':window.is_mobile,
			'destination':destination,
		}
		stt_task = {...new_stt_task,...stt_task}
	}
	else if(stt_task != null && typeof stt_task.index == 'number'){
		stt_task['type'] = 'undetermined';
		stt_task['assistant'] = window.settings.assistant;
		stt_task['state'] = 'should_stt';
		stt_task['desired_results'] = 1;
		stt_task['results'] = [];
		stt_task['is_mobile'] = window.is_mobile;
		if(typeof stt_task['destination'] != 'string'){
			stt_task['destination'] = destination;
		}
		if(typeof stt_task['prompt'] == 'undefined'){
			stt_task['prompt'] = null;
		}
		
	}
	
	
	if(typeof stt_task['recording_end_time'] == 'undefined' && typeof origin == 'string' && origin.endsWith('file') && typeof audio != 'undefined'){
		console.log("push_stt_task: adding fake recording start and end time for file transcription");
		stt_task['recording_start_time'] = 0;
		stt_task['recording_end_time'] = recording.length / 16;
	}
	
	//console.log("push_stt_task: initial version of task: ", stt_task);
	
	
	let created_new_file = false;
	let document_filename = null;
	let origin_file = null;
	
	if(window.settings.docs.open != null && typeof window.settings.docs.open.filename == 'string'){
		document_filename = window.settings.docs.open.filename;
		origin_file = JSON.parse(JSON.stringify(window.settings.docs.open));
	}
	
	if(typeof prefered_extension == 'string' && prefered_extension.length){
		if(typeof document_filename == 'string' && !document_filename.toLowerCase().endsWith(prefered_extension.toLowerCase())){
			let new_filename = window.remove_file_extension(document_filename);
			await window.load_meeting_notes_example(prefered_extension,'\n',new_filename); //remove_file_extension(document_filename));
			created_new_file = true;
			if(typeof current_file_name == 'string'){
				document_filename = current_file_name;
				if(window.settings.docs.open != null && typeof window.settings.docs.open.filename == 'string'){
					stt_task['file'] = JSON.parse(JSON.stringify(window.settings.docs.open));
				}
				
			}
		}
	}
	
	
	
	
	if(typeof window.doc_text == 'string'){
		console.log("push_stt_task:  window.doc_text: ", window.doc_text.substr(0, 50));
	}
	
	
	
	if(
		window.settings.assistant == 'scribe'
		&& (
			document_filename == null 
			|| (typeof window.doc_text == 'string' && window.doc_text.startsWith('_PLAYGROUND_BINARY_')) 
			|| (typeof code == 'string' && code.startsWith('_PLAYGROUND_BINARY_')) 
			|| (typeof document_filename == 'string' && window.filename_is_binary(document_filename))
			|| (origin_file != null && typeof origin_file.filename == 'string' && document_filename != null && origin_file.filename != document_filename)
		) 
	){
		stt_task['destination'] = 'document';
		
		console.warn("push_stt_task: CREATING A NEW FILE, because of document_filename: ", document_filename);
		if(typeof document_filename == 'string'){
			document_filename = remove_file_extension(document_filename);
			console.warn("push_stt_task: document_filename after removing extension: ", document_filename, ", origin: ", origin);
			
			if(document_filename.length > 80){
				document_filename = document_filename.substr(0,80);
				console.warn("push_stt_task: document_filename after making it shorter: ", document_filename, ", origin: ", origin);
			}
			
		}
		
		if(origin.endsWith('file')){
			console.log("push_to_stt: origin ends with 'file'");
			console.log("- window.settings.docs.open: ", JSON.stringify((window.settings.docs.open,null,2)));
			console.log("- document_filename: ", document_filename);
			
			// also remember the soruce media file that is being transcribed, which will be useful later to set as a meta property of the subtitle file
			if(origin_file != null && typeof origin_file.filename == 'string'){
				stt_task['origin_file'] = origin_file;
				console.log("set STT task's origin_file to: ", stt_task['origin_file']);
			}
		}
		
		
		// Make sure a file to write the results to exists in case of file transcription
		if(origin.endsWith('file') && typeof prefered_extension == 'string'){
			await window.load_meeting_notes_example(prefered_extension,'\n',document_filename); //remove_file_extension(document_filename));
			created_new_file = true;
		}
		else if(typeof window.current_scribe_voice_parent_task_id != 'number'){
			await window.load_meeting_notes_example('notes');
			created_new_file = true;
		}
		else if(typeof stt_task['file'] == 'undefined'){
			let found_it = false;
			for(let t = 0; t < window.task_queue.length; t++){
				if(typeof window.task_queue[t].index == 'number' && window.task_queue[t].index == window.current_scribe_voice_parent_task_id && typeof window.task_queue[t].file != 'undefined' && window.task_queue[t].file != null && typeof window.task_queue[t].file.filename == 'string'){
					stt_task['file'] = JSON.parse(JSON.stringify(window.task_queue[t].file));
					found_it = true;
					break
				}
			}
			if(found_it == false){
				await window.load_meeting_notes_example('notes');
				created_new_file = true;
			}
		}
		
	}
	
	if(created_new_file && typeof stt_task['origin_file'] != 'undefined' && stt_task['origin_file'] != null && typeof stt_task['origin_file'].filename == 'string'){
		save_file_meta('origin_file',stt_task['origin_file']); // cross-link between the media file and the subtitle file
		console.log("push_stt_task: just created a new file.  current_file_name, window.settings.docs.open: " + current_file_name + JSON.stringify(window.settings.docs.open,null,2));
		
		if(typeof files[stt_task['origin_file'].filename] != 'undefined' && window.settings.docs.open != null && typeof window.settings.docs.open.filename == 'string'){
			console.log("push_stt_task: setting file locations in origin_file meta");
			if(origin.endsWith('file') ){
				save_file_meta('subtitle_file',JSON.parse(JSON.stringify(window.settings.docs.open)), stt_task['origin_file'].folder, stt_task['origin_file'].filename);
			}
			else{
				save_file_meta('transcription_file',JSON.parse(JSON.stringify(window.settings.docs.open)), stt_task['origin_file'].folder, stt_task['origin_file'].filename);
			}
		}
	}
	
	//console.log("push_stt_task: created_new_file: ", created_new_file);
	
	if(typeof stt_task['assistant'] != 'string'){
		stt_task['assistant'] = window.settings.assistant;
	}
	
	//let type = 'chat';
	if(stt_task['assistant'] == 'scribe' || (window.active_destination == 'document' && window.settings.docs.open != null)){
		//console.warn("push_stt_task: destination is document.");
		//stt_task['type'] = 'undetermined';
		if(typeof stt_task['file'] == 'undefined'){
			stt_task['file'] = JSON.parse(JSON.stringify(window.settings.docs.open));
		}
	}
	
	if(window.settings.assistant == 'translator' && typeof window.settings.input_language == 'string' && typeof window.settings.output_language == 'string' && typeof stt_task['input_language'] == 'undefined'){
		console.log("push_stt_task: adding translation details: ", window.settings.input_language, " -> ", window.settings.output_language);
		stt_task['input_language'] = window.settings.input_language;
		stt_task['output_language'] = window.settings.output_language;
		stt_task['translation_details'] = get_translation_model_details_from_select(window.settings.output_language);
	}
	
	
	if(typeof window.current_scribe_voice_parent_task_id == 'number' && window.settings.assistant == 'scribe' && stt_task['origin'] == 'voice' && typeof stt_task['parent_index'] == 'undefined' && window.microphone_enabled == true){
		stt_task['parent_index'] = window.current_scribe_voice_parent_task_id;
	}
	
	
	
	//const frames_25s = 25 * 16000; // frames_min
	
	
	const recording_length = recording.length;
	let total_snippets = Math.floor(recording_length / frames_min) + 1;
	//console.log("push_stt_task:  recording.length,total_snippets: ", recording.length,total_snippets);
	
	let parent_stt_task = JSON.parse(JSON.stringify(stt_task));
	parent_stt_task['state'] = 'parent';
	parent_stt_task['type'] = 'stt_parent';
	parent_stt_task['desired_results'] = total_snippets;
	if(typeof parent_stt_task['assistant'] == 'string' && parent_stt_task['assistant'] == 'scribe' && typeof origin == 'string' && origin == 'voice'){
		parent_stt_task['desired_results'] = 10000;
		if(typeof window.current_scribe_voice_parent_task_id != 'number'){
			console.warn("push_stt_task: quickly adding missing PARENT stt_task for a voice transcription: ", parent_stt_task);
			parent_stt_task = window.add_task(parent_stt_task);
			if(parent_stt_task.index != null && typeof parent_stt_task.index == 'number'){
				window.current_scribe_voice_parent_task_id = parent_stt_task.index;
			}
		}
		else{
			parent_stt_task['index'] = window.current_scribe_voice_parent_task_id;
		}
	}
	else if(typeof parent_stt_task['assistant'] == 'string' && parent_stt_task['assistant'] == 'scribe'){ //  && typeof origin == 'string' && origin.endsWith('file')
		parent_stt_task = window.add_task(parent_stt_task);
	}
	
	
	let theoretical_start_time = stt_task['recording_end_time'] - (recording.length/16);
	//console.log("theoretical_start_time: ", theoretical_start_time);
	if(theoretical_start_time < 500 || theoretical_start_time < 0){
		console.log("immediately a victim of rounding issues..");
		theoretical_start_time = 0;
	}
	
	for(let d = 0; d < total_snippets; d++){
		
		let child_stt_task = JSON.parse(JSON.stringify(stt_task));
	
		//console.log("looping over audio data. d: ", d);
		const frame_from = d * frames_min;
		let frame_to = (d+1) * frames_min;
		if( (frame_to + frames_overlap) < recording_length){
			frame_to += frames_overlap; // adds 4 seconds from the next snippet
		}
		else{
			if(d > 0){
				console.log("looping over recording data: no longer possible to get 29 seconds of audio data: ", recording_length);
			}
			frame_to = recording_length - 1;
			final_snippet = true;
		}
		
		//console.log("push_stt_task: frame_from, frames_min: ", frame_from,frame_to,frames_min);
		//console.log("push_stt_task: frames in the task: " + (frame_to - frame_from));
		//console.log("AUDIO SLICE: ", audio.slice(frame_from,frame_to));
		
		if(typeof parent_stt_task.index == 'number'){
			child_stt_task['parent_index'] = parent_stt_task.index;
		}
		
		child_stt_task['progress_index'] = d;
		if(typeof total_snippets == 'number'){
			child_stt_task['progress_total'] = total_snippets;
		}
		//child_stt_task['destination'] = destination;
		//let audio_slice = audio.slice(frame_from,frame_to);
		//audio_slice.unshift([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
		if(window.settings.settings_complexity == 'developer' && frame_from + 32000 < frame_to){
			child_stt_task['demo_audio'] = recording.slice(frame_from, frame_from + 32000); 
		}
		child_stt_task['recorded_audio'] = recording.slice(frame_from,frame_to); 
		if(d != 0){
			//child_stt_task['recorded_audio'].unshift([0,0,0,0,0,0,0,0]);
		}
		//console.log("push_stt_task: checking for oddities in the recorded audio");
		if(typeof child_stt_task['recorded_audio'] != 'undefined' && child_stt_task['recorded_audio'] != null && Array.isArray(child_stt_task['recorded_audio'])){
			for(let ap = child_stt_task['recorded_audio'].length - 1; ap >= 0; ap--){
				if(typeof child_stt_task['recorded_audio'][ap] != 'number'){
					console.error("audio array contained non-number value: ", typeof child_stt_task['recorded_audio'][ap], child_stt_task['recorded_audio'][ap]);
					child_stt_task['recorded_audio'].splice(ap,1);
				}
				else if(isNaN(child_stt_task['recorded_audio'][ap])){
					console.error("audio array contained NaN value: ", typeof child_stt_task['recorded_audio'][ap], child_stt_task['recorded_audio'][ap]);
					child_stt_task['recorded_audio'].splice(ap,1);
				}
			}
		}
		else{
			console.error("audio array slice was not an array?!", typeof child_stt_task['recorded_audio'], child_stt_task['recorded_audio']);
		}
		
		
		child_stt_task['recorded_audio'] = new Float32Array(child_stt_task['recorded_audio']);
		//child_stt_task['recorded_audio'] = new Float32Array(child_stt_task['recorded_audio']);
		// Modify the recording start and end time to fit with the audio snippet that is being sent
		child_stt_task['recording_start_time'] = theoretical_start_time + (frame_from / 16);
		child_stt_task['recording_end_time'] = stt_task['recording_start_time'] + (child_stt_task['recorded_audio'].length / 16); //audio.length / 16;
		
		
		window.add_task(child_stt_task);

	}
	
}
window.push_stt_task = push_stt_task;












// grabs STT task from task list and sends it to whisper (but could distribute to other STT in the future)
async function do_stt(task){
	//console.log("in do_stt. task: ", task);
	
	if(typeof task == 'undefined' || task == null){
		console.error("do_stt: task was undefined or null");
		return false
	}
	
	if(typeof task.recorded_audio != 'undefined'){
		//console.log("do_stt: calling do_whisper_web with recorded audio. task.recorded_audio.length: ", task.recorded_audio.length);
		task.state = 'doing_stt'; // superfluous, already set to this by main interval
		return do_whisper_web(task);
		//console.log("do_stt: data should be passed to whisper worker now.");  // removing recorded_audio from task
		//return true
	}
	else{
		console.error("do_stt: picked task was invalid, recorded_audio was undefined: ", task);
	}
	return false
}




async function create_scribe_parent_task(origin='voice'){
	//console.log("in create_scribe_parent_task. origin: ", origin);
	
	let scribe_parent_task = {
		'prompt':null,
		'assistant':'scribe',
		'type':'stt_parent',
		'origin':origin,
		'state':'parent',
		'results':[],
		'desired_results':10000,
	}
	
	if(origin=='voice' && window.settings.assistant == 'scribe' && window.simple_vad != null && typeof window.simple_vad.port != 'undefined'){
		//window.simple_vad.port.postMessage({'continuous':true});
		window.continuous_vad();
	}
	
	if(origin == 'voice' && typeof window.current_scribe_voice_parent_task_id == 'number'){
		window.stop_scribe_voice_task();
	}
	
	if(window.settings.docs.open == null || (typeof window.settings.docs.open.filename == 'string' && window.filename_is_binary(window.settings.docs.open.filename)) ){
		await load_meeting_notes_example('notes');
	}
	
	if(window.settings.docs.open != null){
		scribe_parent_task['file'] = JSON.parse(JSON.stringify(window.settings.docs.open));
	}
	scribe_parent_task = window.add_task(scribe_parent_task);
	if(scribe_parent_task && typeof scribe_parent_task.index == 'number'){
		window.current_scribe_voice_parent_task_id = scribe_parent_task.index;
		add_chat_message('scribe','scribe','scribe_transcription_info#setting---',null,null,window.current_scribe_voice_parent_task_id);
		return scribe_parent_task;
	}
	return null;
}
window.create_scribe_parent_task = create_scribe_parent_task;



function stop_scribe_voice_task(task=null){
	console.log("in stop_scribe_voice_task.  task: ", task);
	let parent_task_index = null;
	
	if(window.microphone_enabled){
		window.disable_microphone();
	}
	
	if(task==null && typeof window.current_scribe_voice_parent_task_id == 'number'){
		parent_task_index = window.current_scribe_voice_parent_task_id;
	}
	else if(task != null && typeof task.parent_index == 'number'){
		parent_task_index = task.parent_index;
	}
	else if(task != null && typeof task.index == 'number'){
		parent_task_index = task.index;
	}
	
	if(typeof parent_task_index == 'number'){
		window.handle_completed_task({'index':parent_task_index},null,{'state':'completed'});
		//window.current_scribe_voice_parent_task_id = null;
		
		
		// TODO no need to do this twice
		let transcription_bubble_el = document.querySelector('#scribe-transcription-info-container-bubble' + parent_task_index);
		
		if(transcription_bubble_el){
			transcription_bubble_el.classList.add('scribe-transcription-stopped');
		}
	}
	
	window.last_time_scribe_started = null;
	window.reset_scribe_clock();
	
}
window.stop_scribe_voice_task = stop_scribe_voice_task;






function play_float32_array_as_audio(audio_array){
	//console.log("in play_float32_array_as_audio.  audio_array: ", typeof audio_array, audio_array);
	
	if(typeof audio_array != 'undefined' && audio_array != null){
		
		try{
			
			if(Array.isArray(audio_array)){
				audio_array = new Float32Array(audio_array);
			}
			//console.log("- audio_array length: ", audio_array.length);
		
			window.create_main_audio_context();
		
			const buffy = new ArrayBuffer(audio_array.length * 4);
			var view = new Float32Array(buffy);
			for ( var i = 0; i < audio_array.length; i++) {
				view[i] = audio_array[i];
			}
			
			//console.log("audio_buffer: ", audio_buffer);
			//console.log("buffy: ",  buffy);
	
			window.main_audio_context.decodeAudioData(encodeWAV(audio_array))
			.then((decoded_audio) => {
				console.log("got decoded audio");
				const source = window.main_audio_context.createBufferSource();
				source.buffer = decoded_audio;
				source.connect(window.main_audio_context.destination);
				source.start();
			})
			.catch((err) => {
				console.error("failed to decode audio array: ", err);
			})
		}
		catch(err){
			console.error("play_float32_array_as_audio: caught error: ", err);
		}
	}
	else{
		console.error("play_float32_array_as_audio: no valid array provided: ", typeof audio_array, audio_array);
	}
	
	
}
window.play_float32_array_as_audio = play_float32_array_as_audio;


// turns a Float32 array into a wav file
function encodeWAV(samples) {
    let offset = 44;
    const buffer = new ArrayBuffer(offset + samples.length * 4);
    const view = new DataView(buffer);
    const sampleRate = 16000;

    /* RIFF identifier */
    writeString(view, 0, 'RIFF')
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 4, true)
    /* RIFF type */
    writeString(view, 8, 'WAVE')
    /* format chunk identifier */
    writeString(view, 12, 'fmt ')
    /* format chunk length */
    view.setUint32(16, 16, true)
    /* sample format (raw) */
    view.setUint16(20, 3, true)
    /* channel count */
    view.setUint16(22, 1, true)
    /* sample rate */
    view.setUint32(24, sampleRate, true)
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true)
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 4, true)
    /* bits per sample */
    view.setUint16(34, 32, true)
    /* data chunk identifier */
    writeString(view, 36, 'data')
    /* data chunk length */
    view.setUint32(40, samples.length * 4, true)

    for (let i = 0; i < samples.length; ++i, offset += 4) {
        view.setFloat32(offset, samples[i], true)
    }

    return buffer
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; ++i) {
        view.setUint8(offset + i, string.charCodeAt(i))
    }
}



















//
//  ENCODE MP3
//


function create_mp3_worker(){
	//console.log("in create_mp3_worker");
	
	window.mp3_worker = null;
	window.mp3_worker_busy = false;
	
	window.mp3_worker = new Worker('./js/mp3_worker.js');
	/*
	window.mp3_worker = new Worker('./js/mp3_worker.js', {
	  type: 'module'
	});
	*/

	//console.log("create_mp3_worker: window.mp3_worker: ", window.mp3_worker);
	
	window.mp3_worker.addEventListener('message', e => {
		//console.log("create_mp3_worker: received message from mp3_worker: ", e.data);

		window.mp3_worker_busy = false;
		document.body.classList.remove('doing-mp3');
		
		if(typeof e.data.action == 'string'){
			if(e.data.action == 'error'){
				console.error("received ERROR from MP3 worker: ", e.data);
			}
			else if(e.data.action == 'encode' && typeof e.data.blob != 'undefined'){
				//console.log("received MP3 encode BLOB response from worker: ", e.data.blob);
				window.handle_completed_task(e.data.task,e.data.blob);
			}
			else{
				console.error("unexpected response from MP3 worker: ", e.data);
			}
		}
		else{
			console.error("MP3 worker returned message without action: ", e.data);
		}
		
	});

	window.mp3_worker.addEventListener('error', (error) => {
		console.error("ERROR: mp3_worker sent error. terminating!. Error was: ", error, error.message);
		mp3_worker_error_count++;
		window.mp3_worker.terminate();
		if(typeof error != 'undefined' && mp3_worker_error_count < 10){
			setTimeout(() => {
				//console.log("attempting to restart mp3 worker");
				create_mp3_worker();
			},1000);
		}
		else{
			console.error("mp3_worker errored out multiple times");
		}
	});
}


// create mp3 worker
//create_mp3_worker();



window.do_mp3 = async function (task){
	//console.log("in do_mp3. task: ", task);
	try{
		if(!window.is_task_valid(task)){
			console.error("do_mp3: invalid task provided");
			return false;
		}
		if(window.mp3_worker_busy){
			console.error("do_mp3: worker was already busy. returning false");
			return false;
		}
		
		if(window.mp3_worker == null){
			//console.log("audio_to_mp3: MP3 worker was still null. Will attempt to start it first");
			create_mp3_worker();
		}
		if(window.mp3_worker && typeof task == 'object' && task != null && typeof task.audio != 'undefined'){
			window.mp3_worker_busy = true;
			document.body.classList.add('doing-mp3');
			if(window.tts_worker_busy == 'false'){
				//console.log("do_mp3: tts_worker_busy is false, so setting speaker AI description to 'doing_mp3'");
				let speaker_contact_description_el = document.getElementById('speaker-contacts-description');
				if(speaker_contact_description_el){
					speaker_contact_description_el.textContent = get_translation('doing_mp3');
				}
			}
			
			//console.log("audio_to_mp3: sending task to mp3 worker");
			mp3_worker.postMessage({'action':'encode','task':task,'cache_name':window.cache_name});
			return true
		}
		else{
			console.error("audio_to_mp3: was already busy or task.audio was missing. task: ", task);
			
		}
	}
	catch(e){
		console.error("audio_to_mp3: caught ERROR: ", e);
		//window.mp3_worker_busy = false;
	}
	return false
}




function make_download(abuffer, total_samples) {

	// set sample length and rate
	var duration = abuffer.duration,
		rate = abuffer.sampleRate,
		offset = 0;

	// Generate audio file and assign URL
	var new_file = URL.createObjectURL(bufferToWave(abuffer, total_samples));

	// Make it downloadable
	var download_link = document.getElementById("download_link");
	download_link.href = new_file;
	var name = generateFileName();
	download_link.download = name;
}

// Utility to add "compressed" to the uploaded file's name
function generateFileName() {
	var origin_name = fileInput.files[0].name;
	var pos = origin_name.lastIndexOf('.');
	var no_ext = origin_name.slice(0, pos);

	return no_ext + ".compressed.wav";
}

// Convert AudioBuffer to a Blob using WAVE representation
function bufferToWave(abuffer, len) {
	var numOfChan = abuffer.numberOfChannels,
	length = len * numOfChan * 2 + 44,
	buffer = new ArrayBuffer(length),
	view = new DataView(buffer),
	channels = [], i, sample,
	offset = 0,
	pos = 0;

	// write WAVE header
	setUint32(0x46464952);                         // "RIFF"
	setUint32(length - 8);                         // file length - 8
	setUint32(0x45564157);                         // "WAVE"

	setUint32(0x20746d66);                         // "fmt " chunk
	setUint32(16);                                 // length = 16
	setUint16(1);                                  // PCM (uncompressed)
	setUint16(numOfChan);
	setUint32(abuffer.sampleRate);
	setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
	setUint16(numOfChan * 2);                      // block-align
	setUint16(16);                                 // 16-bit (hardcoded in this demo)

	setUint32(0x61746164);                         // "data" - chunk
	setUint32(length - pos - 4);                   // chunk length

	// write interleaved data
	for(i = 0; i < abuffer.numberOfChannels; i++)
		channels.push(abuffer.getChannelData(i));

	while(pos < length) {
		for(i = 0; i < numOfChan; i++) {             // interleave channels
			sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
			sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
			view.setInt16(pos, sample, true);          // write 16-bit sample
			pos += 2;
		}
		offset++                                     // next source sample
	}

	// create Blob
	return new Blob([buffer], {type: "audio/wav"});

	function setUint16(data) {
		view.setUint16(pos, data, true);
		pos += 2;
	}

	function setUint32(data) {
		view.setUint32(pos, data, true);
		pos += 4;
	}
}
	
	
	
	
	
	
	
	
	
	
// Create list of languages that the browser's built-in TTS supports



const female_browser_voices = [
	"Alice",
    "Alva",
    "Amélie",
    "Amira",
    "Anna",
	"Catherine",
	"Damayanti",
	"Daria",
	"Ellen",
    "Flo (German (Germany))",
    "Flo (English (United Kingdom))",
    "Flo (English (United States))",
    "Flo (Spanish (Spain))",
    "Flo (Spanish (Mexico))",
    "Flo (Finnish (Finland))",
    "Flo (French (Canada))",
    "Flo (French (France))",
    "Flo (Italian (Italy))",
    "Flo (Portuguese (Brazil))",
    "Helena",
    "Ioana",
	"Joana",
    "Karen",
    "Kathy",
    "Kyoko",
    "Lana",
    "Laura",
    "Lekha",
    "Lesya",
    "Li-Mu",
    "Linh",
    "Luciana",
    "Marie",
    "Martha",
    "Meijia",
    "Melina",
    "Milena",
    "Moira",
    "Mónica",
    "Nicky",
    "Nora",
    "O-Ren",
	"Paulina",
    "Samantha",
    "Sandy (German (Germany))",
    "Sandy (English (United Kingdom))",
    "Sandy (English (United States))",
    "Sandy (Spanish (Spain))",
    "Sandy (Spanish (Mexico))",
    "Sandy (Finnish (Finland))",
    "Sandy (French (Canada))",
    "Sandy (French (France))",
    "Sandy (Italian (Italy))",
    "Sandy (Portuguese (Brazil))",
    "Sara",
	"Satu",
    "Shelley (German (Germany))",
    "Shelley (English (United Kingdom))",
    "Shelley (English (United States))",
    "Shelley (Spanish (Spain))",
    "Shelley (Spanish (Mexico))",
    "Shelley (Finnish (Finland))",
    "Shelley (French (Canada))",
    "Shelley (French (France))",
    "Shelley (Italian (Italy))",
    "Shelley (Portuguese (Brazil))",
	"Sinji",
    "Tessa",
    "Zosia",
    "Zuzana",
    "Yelda",
    "Yu-shu",
    "Yuna",
]


const browser_synth = window.speechSynthesis;
//console.log("browser_synth: ", typeof browser_synth, browser_synth);

function get_browser_tts_languages() {
	//console.log("in get_browser_tts_languages. browser_synth: ", browser_synth);
	if(browser_synth){
	    window.browser_tts_voices_raw = browser_synth.getVoices();
		if(window.browser_tts_voices_raw){
			console.log("get_browser_tts_languages: window.browser_tts_voices_raw.length: ", window.browser_tts_voices_raw.length);
		}
		
	    for (let i = 0; i < window.browser_tts_voices_raw.length; i++) {
			//console.log("\nget_browser_tts_languages: browser tts voice #" + i, "\n", window.browser_tts_voices_raw[i],"\n");
			if(typeof window.browser_tts_voices_raw[i].lang == 'string' && window.browser_tts_voices_raw[i].lang.indexOf('-') != -1){
			
				let lang = window.browser_tts_voices_raw[i].lang.substr(0,2).toLowerCase();
				if(lang == 'nl'){
					window.browser_tts_voices['fry'] = {'default':window.browser_tts_voices_raw[i].name}; // Frysian uses NL synthesis
					window.browser_tts_voices['gos'] = {'default':window.browser_tts_voices_raw[i].name}; // Gronings uses NL synthesis
				}
			
				if(typeof window.browser_tts_voices[lang] == 'undefined'){
					//console.log("adding browser voice: ", lang, " --> ", voices[i].name);
					window.browser_tts_voices[lang] = {'default':window.browser_tts_voices_raw[i].name};
				}
			
				let gender = 'male';
				if(female_browser_voices.indexOf(window.browser_tts_voices_raw[i].name) != -1){
					gender = 'female';
				}
				if(typeof window.browser_tts_voices[lang][gender] == 'undefined'){
					window.browser_tts_voices[lang][gender] = window.browser_tts_voices_raw[i].name;
				}

		        //if (window.browser_tts_voices_raw[i].default) {
		        	//console.log("default browser TTS voice: ", window.browser_tts_voices_raw[i]);
				//}
			
			}
			else{
				console.error("get_browser_tts_languages: unexpected .lang data: ", window.browser_tts_voices_raw[i]);
			}
	    }
	}
    else{
    	console.error("get_browser_tts_languages: browser_synth was not valid - browser has no browser TTS support?");
    }
	//console.log("get_browser_tts_languages: window.browser_tts_voices: ", window.browser_tts_voices);
	//console.log("browser tts language names: ", names);
}


if (speechSynthesis.onvoiceschanged !== undefined) {
	//console.log("speechSynthesis.onvoiceschanged");
	speechSynthesis.onvoiceschanged = get_browser_tts_languages;
}

if(browser_synth){
	setTimeout(get_browser_tts_languages,5000);
}



async function browser_speak(task=null) {
	
	if(typeof task != 'object' || task == null){
		console.error("browser_speak: invalid task provided: ", task);
		return false
	}
	
	if(typeof task.sentence != 'string'){
		console.error("browser_speak: invalid task.sentence: ", task.sentence);
		return false
	}
	console.log("browser_speak: sentence: ", task.sentence);
	
	if(typeof browser_synth == 'undefined' || browser_synth == null){
		console.error("browser_speak: aborting, browser_synth was undefined/null");
		return false
	}
	
    if (browser_synth.speaking) {
		console.error("speechSynthesis.speaking");
		//SpeechSynthesis.resume()
		browser_synth.resume();
	    window.tts_worker_busy = true;
	    window.audio_player_busy = true;
		return false;
    }
  
    window.tts_worker_busy = true;
    window.audio_player_busy = true;
	
	
	//console.log("browser_speak: window.browser_tts_voices_raw: ", window.browser_tts_voices_raw);

    let selectedOption = 'Samantha'; //voiceSelect.selectedOptions[0].getAttribute("data-name");
	if(typeof task.output_language == 'string'){
		let target_language = task.output_language;
		if(target_language.length > 2){
			target_language = target_language.substr(0,2);
		}
		//console.log("browser_speak: task.output_language: ", target_language);
		//console.log("browser_speak:  window.browser_tts_voices: ", window.browser_tts_voices);

		if(typeof window.browser_tts_voices[target_language] == 'object' && typeof window.browser_tts_voices[target_language]['default'] == 'string'){
			//console.log("browser_speak: found target_language in window.browser_tts_voices: ", window.browser_tts_voices[target_language]);
			selectedOption = window.browser_tts_voices[target_language]['default'];
			
			let prefered_voice_gender = null;
			if(typeof task.prefered_voice_gender == 'string'){
				prefered_voice_gender = task.prefered_voice_gender;
			}
			else if(typeof task.assistant == 'string' && typeof window.settings.assistants[task.assistant] != 'undefined' && typeof window.settings.assistants[task.assistant].prefered_voice_gender == 'string'){
				prefered_voice_gender = window.settings.assistants[task.assistant].prefered_voice_gender;
			}
			else if(typeof task.assistant == 'string' && typeof window.assistants[task.assistant] != 'undefined' && typeof window.assistants[task.assistant].prefered_voice_gender == 'string'){
				prefered_voice_gender = window.assistants[task.assistant].prefered_voice_gender;
			}
			//console.log("browser_speak: prefered_voice_gender: ", prefered_voice_gender);
			
			if(typeof prefered_voice_gender == 'string' && typeof window.browser_tts_voices[target_language][prefered_voice_gender] == 'string'){
				//console.log("browser_speak: Setting browser_speak voice to prefered gender: ", prefered_voice_gender, " -> ", window.browser_tts_voices[target_language][prefered_voice_gender]);
				selectedOption = window.browser_tts_voices[target_language][prefered_voice_gender];
			}
			
			//console.log("browser_speak: Switched browser TTS voice to: ", target_language, " --> ", selectedOption);
		}
		else{
			console.error("browser_speak: did not find target_language in window.browser_tts_voices: ", target_language, window.browser_tts_voices);
		}
	}

	//console.log("browser_speak: selectedOption: ", selectedOption);


	
	
	if(window.microphone_enabled){
		//console.log("browser_speak: disabling VAD");
		window.pause_vad();
	}
	
	
	if(typeof EasySpeech == 'undefined' && window.added_scripts.indexOf('./easy_speech/EasySpeech.iife.js') == -1){
		console.warn("browser_speak: attempting quick fix of missing easy_speech");
		window.add_script('./easy_speech/EasySpeech.iife.js')
		.then((value) => {
			if(EasySpeech){
				EasySpeech.init({ maxTimeout: 30000, interval: 250 })
    			.then(() => {
					//console.debug('easy_speech load complete');
					window.easy_speech_loaded = true;
				})
    			.catch(e => {
					console.error('browser_speak: easy_speech init failed: ', e);
					window.easy_speech_loaded = false;
					window.handle_completed_task(task,null,{'state':'failed'});
				});
			}

		})
		.catch((err) => {
			console.error("enable_speaker: failed to load easy_speech: ", err);
			window.easy_speech_loaded = false;
		})
	}
	
	
	
	// If easy_speech is loaded, use that
	if(typeof EasySpeech != 'undefined' && window.easy_speech_loaded.loaded){
		//console.log("browser_speak: easy_speech is available");
		
		let easy_speech_voices = EasySpeech.voices();
		//console.log("easy_speech_voices: ", easy_speech_voices);
		
		
		let voice = null;
		let samantha = null; // fallback English voice
	    for (let i = 0; i < easy_speech_voices.length; i++) {
		
			if(easy_speech_voices.name === 'samantha'){
				samantha = easy_speech_voices[i];
			}
	        if (easy_speech_voices.name === selectedOption) {
				console.log("browser_speak: easy_speech: found voice: ", selectedOption, easy_speech_voices[i]);
				voice = easy_speech_voices[i];
				found_the_voice = true;
				break;
	        }
	    }
		if(found_the_voice == false && samantha != null){
			console.error("browser_speak: did not find the voice. falling back to Samantha");
			utterThis.voice = samantha;
		}
		
		//const voice = easy_speech_voices[1];
		
		let new_utterance = {
		  text: task.sentence,
		  //voice: myLangVoice, // optional, will use a default or fallback
		  pitch: 1,
		  rate: 1,
		  volume: 1,
		  // there are more events, see the API for supported events
		  //boundary: e => console.debug('boundary reached')
		}
		if(voice != null){
			new_speech['voice'] = voice;
		}
		else if(samantha != null){
			new_speech['voice'] = samantha;
		}
		//console.log("calling easy_speech");
		await EasySpeech.speak(new_utterance);
		
	    window.tts_worker_busy = false;
	    window.audio_player_busy = false;
		if(window.microphone_enabled){
			window.unpause_vad();
		}
		window.handle_completed_task(task,true,{'state':'completed'});
	}
	else{
		
		if(keyz(window.browser_tts_voices).length == 0){
			console.warn("browser_speak: window.browser_tts_voices dictionary was still empty. Attempting to get them now.");
			get_browser_tts_languages();
		}
		
	    const utterThis = new SpeechSynthesisUtterance(task.sentence);

	    utterThis.onend = function (event) {
			console.log("browser_speak: SpeechSynthesisUtterance.onend");
		    window.tts_worker_busy = false;
		    window.audio_player_busy = false;
			if(window.microphone_enabled){
				window.unpause_vad();
			}
			window.handle_completed_task(task,true,{'state':'completed'});
	    };

	    utterThis.onerror = function (event) {
			console.error("browser_speak: SpeechSynthesisUtterance.onerror");
		    window.tts_worker_busy = false;
		    window.audio_player_busy = false;
			if(window.microphone_enabled){
				window.unpause_vad();
			}
			window.handle_completed_task(task,false,{'state':'failed'});
	    };
		
		
		
		let found_the_voice = false;
		let samantha = null; // fallback English voice
	    for (let i = 0; i < window.browser_tts_voices_raw.length; i++) {
		
			if(window.browser_tts_voices_raw[i].name === 'samantha'){
				samantha = window.browser_tts_voices_raw[i]
			}
	        if (window.browser_tts_voices_raw[i].name === selectedOption) {
				//console.log("browser_speak: found voice. using voices[i]: ", selectedOption, window.browser_tts_voices_raw[i]);
				utterThis.voice = window.browser_tts_voices_raw[i];
				found_the_voice = true;
				break;
	        }
	    }
		if(found_the_voice == false && samantha != null){
			console.error("browser_speak: did not find the voice. falling back to Samantha");
			utterThis.voice = samantha;
		}
	    //utterThis.pitch = pitch.value;
	    //utterThis.rate = rate.value;
		
		browser_synth.speak(utterThis);
	}
	
	
	
	//console.log("browser speak: returning true");
	return true;
}
window.browser_speak = browser_speak;




function play_sound_effect(sound_name) {
	var audio = new Audio('./audio/' + sound_name + '.mp3');
	audio.play();
}
window.play_sound_effect = play_sound_effect;



//
//  VAD - Voice Activity Detection
//



// simple_vad_audio;
// https://github.com/thurti/vad-audio-worklet


let last_vad_start_time = 0;
let recording_simple_vad = null;
let speaker_consent_hint_given = false;
let busy_recording_simple_vad = false;
let previous_speaker_list = '';
let last_tts_task = null;
let maximum_stt_tasks = 9;
if(window.is_mobile){
	maximum_stt_tasks = 4;
}
let vad_state_history = []; // keep track of how often the VAD is in a recording state, and use that data to optimize interrupt_speaking


function flattenArray(channelBuffer, recordingLength) {
    var result = new Float32Array(recordingLength);
    var offset = 0;
    for (var i = 0; i < channelBuffer.length; i++) {
        var buffer = channelBuffer[i];
        result.set(buffer, offset);
        offset += buffer.length;
    }
    return result;
}

function interleave(leftChannel, rightChannel) {
    var length = leftChannel.length + rightChannel.length;
    var result = new Float32Array(length);

    var inputIndex = 0;

    for (var index = 0; index < length;) {
        result[index++] = leftChannel[inputIndex];
        result[index++] = rightChannel[inputIndex];
        inputIndex++;
    }
    return result;
}

function writeUTFBytes(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}


function delay(millisec) { 
    return new Promise(resolve => { 
        setTimeout(() => { resolve('') }, millisec); 
    }) 
}




function pause_vad(){
	//console.log("in pause_vad");
	
	if(window.myvad){
		//console.log("pause_vad: calling window.myvad.pause()");
		window.myvad.pause();
	}
	else{
		pauseSimpleVAD();
	}
	window.vad_paused = true;
}
window.pause_vad = pause_vad;


function unpause_vad(){
	//console.log("in unpause_vad");
	
	if(window.doing_low_memory_tts_chat_response == false){
		if(window.myvad){
			window.myvad.pause();
		}
		else{
			unpauseSimpleVAD();
		}
		window.remove_body_class('microphone-sleeping');
	}
	else{
		if(window.settings.settings_complexity == 'developer'){
			console.warn("unpause_vad: not unpausing vad because doing_low_memory_tts_chat_response is true");
		}
	}
	window.vad_paused = false;
}
window.unpause_vad = unpause_vad;


function stop_vad(){
	//console.log("in stop_vad");
	
	if(window.myvad){
		window.myvad.pause();
	}
	else{
		window.stopSimpleVAD();
	}
}
window.stop_vad = stop_vad;



function pauseSimpleVAD() {
	//console.log("in pauseSimpleVAD");
	//simple_vad_audio?.pause();
	//window.main_audio_context?.suspend();
	if(window.simple_vad != null && typeof window.simple_vad.port != 'undefined'){
		window.simple_vad.port.postMessage({'listening':false});
	}
}
window.pauseSimpleVAD = pauseSimpleVAD;


function unpauseSimpleVAD() {
	//console.log("in unpauseSimpleVAD");
	//simple_vad_audio?.pause();
	//window.main_audio_context?.resume();
	
	if(window.simple_vad != null && typeof window.simple_vad.port != 'undefined'){
		window.simple_vad.port.postMessage({'listening':true});
	}
	//console.log("unpauseSimpleVad: calling preload_whisper");
	if(window.whisper_loaded == false){
		window.preload_whisper();
	}
	
	//window.restartSimpleVAD();
}
window.unpauseSimpleVAD = unpauseSimpleVAD;

// TODO Stop simpleVad is currently the same as pauseSimpleVad because starting and stopping the microphone made things rather troublesome. But this is not ideal.
function stopSimpleVAD() {
	//console.log("in stopSimpleVAD");
	if(window.simple_vad != null && typeof window.simple_vad.port != 'undefined'){
		window.simple_vad.port.postMessage({'listening':false});
	}
	
}
window.stopSimpleVAD = stopSimpleVAD;


function continuous_vad(desired_state=null, minimal_silence_threshold=30) {
	if(window.settings.settings_complexity == 'developer'){
		//console.log("dev: in continuous_vad.  desired_state,minimal_silence_threshold: ", desired_state, minimal_silence_threshold);
	}
	
	//simple_vad_audio?.pause();
	//window.main_audio_context?.suspend();
	
	if(window.is_mobile && window.ram < 4000){
		//console.log("- continuous_vad. Mobile and low memory. Forcing 'Detect_fast' mode");
		desired_state = 'Detect_fast';
	}
	
	if(window.settings.assistant != 'scribe'){
		desired_state = false;
	}
	
	if(desired_state == null){
		if(typeof window.settings.assistants['scribe'] != 'undefined' && typeof window.settings.assistants['scribe'].continuous_mic == 'string'){
			desired_state = window.settings.assistants['scribe'].continuous_mic;
			//console.log("continuous_vad: got desired state from settings: ", desired_state);
		}
	}
	
	if(desired_state == null){
		console.error("- continuous_vad: did not find continuous_mic preference in Scribe's settings: ", window.settings.assistants['scribe']);
		return false
	}
	
	//console.log("continuous_vad. secondary desired_state: ", desired_state);
	
	if(typeof desired_state == 'string'){
		if(desired_state == 'Detect_slow'){
			minimal_silence_threshold = 60;
		}
		if(desired_state == 'Detect_slower'){
			minimal_silence_threshold = 90;
		}
		if(desired_state == 'Continuous_recording'){
			desired_state = true;
		}
		else{
			desired_state = false;
		}
	}
	
	//console.log("- new continuous_vad settings:  desired_state, minimal_silence_threshold: ", typeof desired_state, desired_state, typeof minimal_silence_threshold, minimal_silence_threshold);
	
	if(typeof desired_state == 'boolean' && window.simple_vad != null && typeof window.simple_vad.port != 'undefined'){ // window.is_mobile == false && 
		
		//console.log("- sending continuous vad message to SimpleVad:  desired_state, minimal_silence_threshold: ", desired_state, minimal_silence_threshold);
		window.simple_vad.port.postMessage({'continuous':desired_state,'minimal_silence_threshold':minimal_silence_threshold});
		if(desired_state){
			document.body.classList.add('continuous-vad');
		}
		else{
			document.body.classList.remove('continuous-vad');
		}
	
	}
	else{
		console.error("- cannot send message to SimpleVad. window.simple_vad: ", window.simple_vad);
	}
	return true
}
window.continuous_vad = continuous_vad;




async function restartSimpleVAD() {
	//console.log("in restartSimpleVAD");
	if(window.simple_vad != null && typeof window.simple_vad.port != 'undefined'){
		window.simple_vad.port.postMessage({'listening':true});
	}
	
}
window.restartSimpleVAD = restartSimpleVAD;




async function startSimpleVAD(stream, fftSize=128, sampleRate = 16000) { // 48000
    //console.log("in startSimpleVAD.  fftSize,sampleRate", fftSize,sampleRate);
	
	if(window.simple_vad_worklet_added == false){
	    await window.main_audio_context.audioWorklet.addModule("./simple_vad/vad-audio-worklet.js");
		window.simple_vad_worklet_added = true;
	}
	//console.log("startSimpleVAD: initial window.mic_stream: ", window.mic_stream);
    window.simple_vad_source = window.main_audio_context.createMediaStreamSource(window.mic_stream);

	//const simple_vad = 
	if(window.simple_vad == null){
		window.simple_vad = new AudioWorkletNode(window.main_audio_context, "vad", {
			outputChannelCount: [1],
			processorOptions: {
        		fftSize,
        		sampleRate,
			},
    	});
	}
	//console.log("startSimpleVAD: initial window.simple_vad: ", window.simple_vad);
    window.simple_vad_source.connect(window.simple_vad);
    //window.simple_vad_source.connect(window.main_audio_context.destination); // is this really needed? Why connect to a destination?

    //const speech = document.querySelector(".speech");
	
	window.continuous_vad();
	
    window.simple_vad.port.onmessage = (event) => {
	
		//console.log("simple_vad message: event.data: ", event.data);
	
		if(typeof event.data["cmd"] == 'string'){
			const cmd = event.data["cmd"];
	  		//console.log("simple_vad command: ", cmd);
	
	
			// SILENCE
			if (cmd === "silence") {
				document.body.classList.remove('state-recording');
				busy_recording_simple_vad = false;
				window.possibly_resume_audio();
			}

			// SPEECH
			if (cmd === "speech") {
				document.body.classList.add('state-recording');
				
				if(busy_recording_simple_vad == false){
					busy_recording_simple_vad = true;
					last_vad_start_time = Date.now();
				}
				
				if(
					window.speaker_enabled 
					&& typeof window.settings.interrupt_speaking == 'string' 
					&& window.settings.interrupt_speaking != 'No'
				){
					let silence_threshold = 0.7;
					if(window.settings.interrupt_speaking == 'Yes'){
						silence_threshold = 0.5;
					}
		
					//console.log("VAD sent speech indication.  current recording_to_listening_ratio: ", window.recording_to_listening_ratio);
					if(window.recording_to_listening_ratio > silence_threshold){
						window.possibly_pause_audio();
					}
				}
				
			}
			
		
			// RECORDING
			if (cmd === "recording") {
				//console.log("received recording from Simple VAD: ", event.data);
				
				document.body.classList.remove('state-recording');
				
				busy_recording_simple_vad = false;
				if(typeof event.data["data"] != 'undefined' && typeof event.data["data"]["audio_data"] != 'undefined' && typeof event.data["data"]["details"] != 'undefined'){
					if(window.settings.settings_complexity == 'developer'){
						//console.log("Received VAD recording. duration: ", event.data["data"]["audio_data"].length / 16000 + 's');
					}
					
					
					
					if(typeof event.data["data"]["details"].real_sample_rate == 'number' && event.data["data"]["details"].real_sample_rate > 1000){
						window.measured_microphone_sample_rate = Math.round(event.data["data"]["details"].real_sample_rate / 8000) * 8000;
					}
					
					
					if(window.stt_tasks_left < maximum_stt_tasks){
						if(window.stopped_whisper_because_of_low_memory){
							console.warn("received VAD recording, but stopped_whisper_because_of_low_memory is true, so not processing the audio");
						}
						else if(window.skip_first_vad_recording && event.data["data"]["audio_data"].length <= 24000){
							//console.log("not processing first short VAD audio recording");
							window.skip_first_vad_recording = false;
						}
						else{
							window.skip_first_vad_recording = false;
							try{
								if(window.settings.assistant == 'scribe' && typeof window.current_scribe_voice_parent_task_id == 'number' && window.last_time_scribe_started != null && (Date.now() - window.last_time_scribe_started) < window.maximum_scribe_duration){
									//console.log("received VAD recording, and setting scribe parent task to: ", window.current_scribe_voice_parent_task_id);
									event.data["data"]["details"]['parent_index'] = window.current_scribe_voice_parent_task_id;
								}
								if(typeof window.measured_microphone_sample_rate == 'number' && window.measured_microphone_sample_rate > 0){
									if( (event.data["data"]["audio_data"].length / window.measured_microphone_sample_rate) > 1){
										window.possibly_interrupt_speaking_early();
									}
								}
								else if(event.data["data"]["audio_data"].length > 16000){
									window.possibly_interrupt_speaking_early();
								}
								
					
								window.push_stt_task(event.data.data.audio_data,null,event.data.data.details); // {'origin':'voice', 'sample_rate':event.data.data.sample_rate, 'recording_start_time':event.data.data.recording_start_time, 'recording_end_time':event.data.data.recording_end_time,'flush_offset':event.data.data.flush_offset,'progress_index':event.data.data.flush_count}
								
								
								// Allow early interrupting of speaking if the VAD is only sometimes in recording state, which indicates a good, quiet environment for a voice conversation.
								
								
								
								
							}
							catch(err){
								console.error("caught error handling incoming audio recording data: ", err);
							}
						}
						
					}
					else{
						console.error("already a huge backlog of STT tasks, not adding another one");
						if(window.whisper_loaded){
							window.flash_message(window.get_translation('Cannot_keep_up_with_voice_input'),2000,'fail');
						}
						
					}
					
				}
				else{
					console.error("unexpected results from VAD audio worklet.  event.data: ", event.data);
				}
				
			}
			
			if (cmd === "ping") {
				if(typeof event.data["data"] != 'undefined'){
					
					if(typeof event.data["data"]["listening"] != 'undefined'){
						//console.log("audio worklet ping: listening: ",  event.data["data"]["listening"]);
						if(event.data["data"]["listening"] != window.microphone_enabled){
							console.error("audio worklet listening and window.microphone_enabled are out of sync:  listening, microphone_enabled", event.data["data"]["listening"], window.microphone_enabled);
						}
					}
					
					if(typeof event.data["data"]["last_command_was_speech"] == 'boolean'){
						vad_state_history.unshift(event.data["data"]["last_command_was_speech"]);
						if(vad_state_history.length > 120){
							vad_state_history.length = 120;
						}
						//console.log("vad_state_history.length: ", vad_state_history.length);
						
						/*
						if(window.settings.settings_complexity == 'developer'){
							let vad_dataviz = '';
							for(let a = 0; a < vad_state_history.length; a++){
								if(vad_state_history[a] == true){
									vad_dataviz = '|' + vad_dataviz;
								}
								else{
									vad_dataviz = '-' + vad_dataviz;
								}
								if(a > 20){
									break;
								}
							}
							//console.log("vad_state_history: vad_dataviz: \n\n" +  vad_dataviz + "\n\n");
						}
						*/
						calculate_recording_to_listening_ratio();
					}
					
				}
				
			}
			
		}
	
    }
    // check if firefox, because firefox can't change sample rate

}
window.startSimpleVAD = startSimpleVAD;




function calculate_recording_to_listening_ratio(){
	if(vad_state_history.length > 20){
		let listening_count = 0;
		for(let x = 0; x < vad_state_history.length; x++){
			if(vad_state_history[x] === false){
				listening_count++;
			}
		}
		window.recording_to_listening_ratio = listening_count / vad_state_history.length;
	}
	else{
		window.recording_to_listening_ratio = 0;
	}
	//console.log("calculate_recording_to_listening_ratio:  window.recording_to_listening_ratio is now: ", window.recording_to_listening_ratio);
}


function possibly_interrupt_speaking_early(){
	//console.log("in possibly_interrupt_speaking_early.  vad_state_history.length: ", vad_state_history.length);
	
	if(
		window.speaker_enabled
		&& window.settings.assistant != 'scribe'
		&& typeof window.settings.interrupt_speaking == 'string' 
		&& (
			window.settings.interrupt_speaking == 'Yes' 
			||
			(
				window.settings.interrupt_speaking == 'Auto' 
				&& window.ram > 4000
				&& typeof window.recording_to_listening_ratio == 'number' 
				&& window.recording_to_listening_ratio > 0.7
			)
		)
		&& vad_state_history.length > 20
		//&& (window.stt_tasks_left > 1 || window.tts_tasks_left > 0) 
		//&& window.tts_worker_busy
	){
		
		//calculate_recording_to_listening_ratio();
		
		let silence_threshold = 0.7;
		if(window.settings.interrupt_speaking == 'Yes'){
			silence_threshold = 0.5;
		}
		
		//console.log("possibly_interrupt_speaking_early:  recording_to_listening_ratio: ", window.recording_to_listening_ratio);
		if(window.recording_to_listening_ratio > silence_threshold){
			//console.log("VAD has spent more time in listening mode than recording mode");
			window.interrupt_speaking_task_index = window.task_counter;
			//console.log("window.interrupt_speaking_task_index is now: ", window.interrupt_speaking_task_index);
			
			window.interrupt_speaker();
			
			return true
		}
	}
	//console.log("possibly_interrupt_speaking_early?: NO");
	return false
}
window.possibly_interrupt_speaking_early = possibly_interrupt_speaking_early;


function possibly_pause_audio(){
	//console.log("in possibly_pause_audio");
	if(window.audio_player != null && window.audio_player.state === 'running') {
	    window.audio_player.suspend().then(function() {
			//console.log("audio player paused");
	    });
	}
}
window.possibly_pause_audio = possibly_pause_audio;


function possibly_resume_audio(){
	//console.log("in possibly_resume_audio");
	if(window.speaker_enabled && window.audio_player != null && window.audio_player.state === 'suspended') {
		window.audio_player.resume().then(function() {
			//console.log("audio player resumed");
		});  
	}
}
window.possibly_resume_audio = possibly_resume_audio;








// Start Voice Activity Detection
window.start_vad = async () => {
	//console.log("in start_vad");
	
	
	if (!navigator.mediaDevices?.enumerateDevices) {
		//console.log("myvad enumerateDevices() not supported.");
		flash_message("Audio not supported",2000,"fail");
	} 
	else {
	  // List cameras and microphones.
	  /*
	  navigator.mediaDevices
	    .enumerateDevices()
	    .then((devices) => {
	      devices.forEach((device) => {
	        console.log(`start_vad: found media device: ${device.kind}: ${device.label} id = ${device.deviceId}`);
	      });
	    })
	    .catch((err) => {
	      console.error(`start_vad: caught media device error: ${err.name}: ${err.message}`);
	    });
	  */
	}
	
	
	if(window.main_audio_context == null){
		//console.log("start_vad: window.main_audio_context is null. calling window.create_main_audio_context");
		window.create_main_audio_context(16000);
		//console.log("created main_audio_context: ", window.main_audio_context, window.main_audio_context.sampleRate);
	}
	
	
	if(window.mic_stream == null){
		try{
			//console.log("getting mic_stream from window.main_audio_context: ", window.main_audio_context);
			//console.log("mediaDevices.getSupportedConstraints(): ", navigator.mediaDevices.getSupportedConstraints());
			const samplerate_supported_text = navigator.mediaDevices.getSupportedConstraints().sampleRate;
			//console.log("samplerate_supported: ", samplerate_supported_text);
			const samplerate_supported = samplerate_supported_text ? "Supported!" : "Not supported!";
			let audio_options = {
			        channelCount: 1,
			        echoCancellation: true,
			        autoGainControl: true,
			        noiseSuppression: true,
				}
			if(samplerate_supported){
				audio_options['sampleRate'] = 16000; // not really needed. If it's not supported it will just ignore it.
			}
			window.mic_stream = await navigator.mediaDevices.getUserMedia({
				audio: audio_options,
			});
		}
		catch(err){
			console.error("caught error getting microphone stream: ", err);
			flash_message(get_translation("Could_not_access_microphone"),2500,'fail');
			return
		}
	}
	
	let sampleRate = window.mic_stream
		.getAudioTracks()[0]
		.getSettings().sampleRate;

	if(typeof  window.main_audio_context.sampleRate == 'number' && window.main_audio_context.sampleRate != sampleRate){
		console.error("microphone sampleRate was different from main_audio_context sampleRate: ", sampleRate, window.main_audio_context.sampleRate);
		sampleRate = window.main_audio_context.sampleRate;
	}

	//console.log("start_vad:  mic stream samplerate: ", sampleRate);
	startSimpleVAD(window.mic_stream, 128, sampleRate);
}




//
//   WHISPER
//

let whisper_files = [];
let whisper_worker_error_count = 0;
let simple_tasks_ordering = 'index';
let whisper_previous_percentage = 0;
let whisper_percentage = 0;
let whisper_previous_percentage_timestamp = 0;
let speaker_list_info_timeout = null;
let speaker_list_stream_timeout = null;
let previous_stream_word = '';
let last_whisper_task = null;
let whisper_preload_watchdog = null;



//let whisper_download_total_bytes = 0;

function create_whisper_worker(){
	//console.log("in create_whisper_worker");
	
	return new Promise((resolve, reject) => {
	
		window.preloading_whisper = true;
	
		whisper_files = [];
	
		let watchdog = setTimeout(() => {
			console.error("create_whisper_worker timed out");
			//reject("create_whisper_worker: timed out");
			reject(null);
			kill_whisper_worker();
			return null
		},15000);

	
		if(window.whisper_worker != null){
			console.error("create_whisper_worker: window.whisper_worker already existed! Force-killing the worker first..")
			window.whisper_worker.terminate();
		}
		window.whisper_worker = null;
		window.whisper_worker = new Worker('./whisper_worker.js', {
			type: 'module'
		});

		//console.log("whisper_module: window.whisper_worker: ", window.whisper_worker);

		window.whisper_worker.addEventListener('message', e => {
			//console.log("whisper_module: received message from whisper_worker: ", e.data);


			if(typeof e.data.status == 'string'){
				//console.log("whisper_module: received message from whisper_worker.  status:", e.data.status);
		
				if(window.testing && e.data.status.indexOf('progress') == -1){
					console.log("whisper_module: received (non-progress) message from whisper_worker: ", e.data);
				}
		
				if(e.data.status == 'progress'){
					//if(whisper_previous_percentage == 0){
						//console.log("whisper worker sent download progress: ", e.data, e.data.progress);
					//}
			
			
					whisper_files[e.data.file] = e.data;
			
					let total_bytes = 0;
					let loaded_bytes = 0;
					let whisper_file_names = keyz(whisper_files);
					if(whisper_file_names.length > 4){
						for(let w = 0; w < whisper_file_names.length; w++){
							if(typeof whisper_files[whisper_file_names[w]].total == 'number' && typeof whisper_files[whisper_file_names[w]].loaded == 'number'){
								total_bytes += whisper_files[whisper_file_names[w]].total;
								loaded_bytes += whisper_files[whisper_file_names[w]].loaded;
							}
					
						}
					}
					if(total_bytes > 10000000){
				
						let whisper_percentage = Math.floor((loaded_bytes / total_bytes) * 100);
			
						if(whisper_previous_percentage > whisper_percentage){
							whisper_previous_percentage = 0;
						}
			
						if(whisper_percentage > whisper_previous_percentage){
				
							let whisper_progress_el = document.getElementById('download-progress-whisper');
							if(whisper_progress_el == null){
								//console.warn("whisper (down)load progress element is missing, creating it now");
								add_chat_message('current','whisper','download_progress#setting---'); // TODO this one is a bit different at the moment. Maybe use 'scribe' instead of 'whisper'?
							}
							else{
								//console.log("updating whisper (down)load progress: ", ((loaded_bytes / total_bytes) * 100) + "%");
								whisper_progress_el.value = loaded_bytes / total_bytes; //e.data.progress / 100;
						
								//console.log("\n\nwhisper: download %: ", whisper_percentage);
						
								if(whisper_previous_percentage_timestamp == 0){
									//whisper_previous_percentage_timestamp = Date.now();
								}
								else if(whisper_percentage > 1){
						
									let whisper_time_remaining_element = whisper_progress_el.parentNode.querySelector('.time-remaining');
									if(whisper_time_remaining_element){
										const delta = Date.now() - whisper_previous_percentage_timestamp;
										//console.log("whisper_progress: time it took for 1% progress: ", delta);
										const percent_remaining = 100 - whisper_percentage;
										//console.log("whisper_download_progress: seconds remaining: ", (percent_remaining * delta) / 1000);
										//whisper_time_remaining_element.innerHTML = '<span></span>';
						
										let time_remaining = (percent_remaining * delta)/1000;
										//console.log("whisper load time_remaining: ", time_remaining);
										whisper_time_remaining_element.innerHTML = window.create_time_remaining_html(time_remaining);
									}
							
									let whisper_size_el = whisper_progress_el.parentNode.querySelector('.ai-model-size');
									if(whisper_size_el){
										if(total_bytes > (1024 * 1024 * 1024)){
											whisper_size_el.innerHTML = '<span class="ai-model-size-number">' + (Math.round(total_bytes / (1024 * 1024 * 10240))/10) + '</span><span class="ai-model-size-gb">GB</span>';
										}
										else{
											whisper_size_el.innerHTML = '<span class="ai-model-size-number">' + Math.round(total_bytes / (1024 * 1024)) + '</span><span class="ai-model-size-gb">MB</span>';
										}
									}
								
									if(whisper_percentage == 100){
										//console.log("whisper (down)load is now 100%");
										whisper_preload_watchdog = setTimeout(() => {
											console.error("\nwhisper_worker was given 15 seconds to load into memory. Did it succeed?");
											console.error("- window.busy_loading_whisper: ", window.busy_loading_whisper);
											console.error("- window.whisper_loaded: ", window.whisper_loaded);
										
											let whisper_wasm_seems_downloaded = false;
											for(let u = 0; u < window.cached_urls.length; u++){
												if(window.cached_urls[u].toLowerCase().indexOf('ort-wasm-simd') != -1 && window.cached_urls[u].toLowerCase().endsWith('.wasm')){
													console.log("OK, spotted Transformers.js WASM file in memory: ", window.cached_urls[u]);
													whisper_wasm_seems_downloaded = true;
													break
												}
											}
											console.error('- whisper_wasm_seems_downloaded: ', whisper_wasm_seems_downloaded);
											if(whisper_wasm_seems_downloaded == false){
												console.warn("Transformers.js WASM file does not seem to be downloaded yet");
											}
											else if(window.whisper_worker != null && window.whisper_loaded == false && window.busy_loading_whisper == true){
												console.error("loading whisper took too long, killing it.");
												flash_message(get_translation('Loading_voice_recognition_took_too_long'),2000,'fail');
												//kill_whisper_worker(null,10000);
												kill_whisper_worker(null);
												window.disable_microphone();
												window.add_chat_message_once('current','developer',window.get_translation('Try_closing_the_tab_to_fix_voice_recognition'),'Try_closing_the_tab_to_fix_voice_recognition');
											}
										},15000);
									}
								
								
						
								}

							}
							whisper_previous_percentage = whisper_percentage;
							whisper_previous_percentage_timestamp = Date.now();
					
						}
					}
					else{
						//console.error("whisper loading: total_bytes is 0");
					}
			
				}
		
				else if(e.data.status == 'exists' ){
					if(window.settings.settings_complexity == 'developer'){
						console.warn("dev: whisper worker sent exists message");
					}
					clearTimeout(watchdog);
					preload_whisper();
					resolve(true);
					return true
				}
		
				else if(e.data.status == 'loading' || e.data.status == 'preloading' || e.data.status == 'asr_preloading' || e.data.status == 'segmentation_loading'){
					//console.log("Whisper worker sent loading update message: ", e.data.status);
				}
		
				else if(e.data.status == 'segmentation_loaded'){
					//console.log("Whisper worker sent loading update message: ", e.data.status);
					if(e.data.task != 'undefined' && e.data.task != null && typeof e.data.task.assistant == 'string' && e.data.task.assistant == 'scribe'){
						add_chat_message_once('current','developer',get_translation('Speaker_recognition_has_loaded'));
					}
				}
			
			
				else if(e.data.status == 'transcriber_created'){
					if(whisper_preload_watchdog != null){
						//console.log("clearing whisper_preload_watchdog");
						clearTimeout(whisper_preload_watchdog);
						whisper_preload_watchdog = null;
					}
				}
				else if(e.data.status == 'ready' || e.data.status == 'preload_complete'){
					//console.log("whisper worker sent ready/preload complete message: ", e.data.status);
				
					window.preloading_whisper = false;
					
					if(e.data.status == 'preload_complete'){
						//console.log("whisper sent preload_complete message. window.whisper_worker_busy: ", window.whisper_worker_busy);
						window.stopped_whisper_because_of_low_memory = false;
						window.busy_loading_whisper = false;
						window.whisper_loaded = true;
						
						add_chat_message_once('current','developer',get_translation('Voice_recognition_has_loaded'));
						//window.whisper_worker_busy = false;
					}
				
					let whisper_progress_el = document.getElementById('download-progress-whisper');
					if(whisper_progress_el){
						const whisper_progress_message_el = whisper_progress_el.closest('.message');
						if(whisper_progress_message_el){
							whisper_progress_message_el.classList.add('download-complete-chat-message');
							setTimeout(() => {
								whisper_progress_message_el.remove();
							},1000);
						}
						else{
							console.error("cannot find whisper_progress_message_el");
						}
					}
					else{
						//console.error("whisper became ready, but cannot find loading progress indicator element");
					}
					if(window.settings.assistant == 'scribe'){
						window.currently_loaded_assistant = 'scribe'; // TODO: is this wise?
						set_model_loaded(true);
						//document.body.classList.add('model-loaded');
					}
					/*
					if(typeof e.data.task != 'undefined' && e.data.task != null && typeof e.data.task.index == 'number'){
						window.handle_completed_task(e.data.task,null);
					}
					*/
				}
				else if(e.data.status == 'pipeline_ready'){
					//console.log("whisper worker sent preload already complete message. e.data.status: ", e.data.status);
					//window.whisper_worker_busy = false;
			
					//add_chat_message('current','developer',get_translation('Voice_recognition_has_loaded'));
					let whisper_progress_el = document.getElementById('download-progress-whisper');
					if(whisper_progress_el){
						const whisper_progress_message_el = whisper_progress_el.closest('.message');
						if(whisper_progress_message_el){
							whisper_progress_message_el.classList.add('download-complete-chat-message');
							setTimeout(() => {
								whisper_progress_message_el.remove();
							},1000);
						}
					}
					else{
						//console.error("whisper became ready, but cannot find loading progress indicator element");
					}
					if(window.settings.assistant == 'scribe'){
						window.currently_loaded_assistant = 'scribe'; // TODO: is this wise?
						set_model_loaded(true);
						//document.body.classList.add('model-loaded');
					}
					//if(typeof e.data.task != 'undefined' && e.data.task != null){
						//window.handle_completed_task(e.data.task,null);
					//}
				}
				else if(e.data.status == 'initiate'){
					//console.log("whisper worker sent initiate message");
				}
				else if(e.data.status == 'done'){
					//console.log("whisper worker sent done message. A file has downloaded: " , e.data.file);
				}
				else if(e.data.status == 'download'){
					//console.log("whisper worker sent download start message for file: ", e.data.file);
					if(window.testing){
						window.add_chat_message('current','developer','Downloading: ' + e.data.file);
					}
				}
		
			
				else if(e.data.status == 'stream'){
					if(whisper_preload_watchdog != null){
						console.error("whisper stream: unexpectedly clearing whisper_preload_watchdog"); // sohuld have received a 'transcriber_created' message earlier
						clearTimeout(whisper_preload_watchdog);
						whisper_preload_watchdog = null;
					}
					//console.log("whisper streamed: ", e.data.content);
					if(typeof e.data.content == 'string'){
						if(window.settings.assistant == 'scribe' && typeof e.data.task_parent_index == 'number'){
							/*
							let scribe_progress_info_el = document.querySelector('#scribe-stream-info' + e.data.parent_index);
							if(scribe_progress_info_el){
								scribe_progress_info_el.textContent = e.data.content;
							}
							*/
							//console.log("stream message has valid parent index: ", e.data.task_parent_index);
							const scribe_stream_info_el = document.querySelector('#scribe-stream-info' + e.data.task_parent_index);
							if(scribe_stream_info_el){
								//console.log("found scribe_stream_info_el");
						
								if(speaker_list_stream_timeout != null){
									clearTimeout(speaker_list_stream_timeout);
								}
						
								if(e.data.content.startsWith(' ')){
									e.data.message = e.data.content.substr(1);
								}
								scribe_stream_info_el.textContent += e.data.content;
								if(scribe_stream_info_el.textContent.length > 30){
									scribe_stream_info_el.textContent = '..' + scribe_stream_info_el.textContent.substr(scribe_stream_info_el.textContent.length - 30);
								}
						
								speaker_list_stream_timeout = setTimeout(() => {
									scribe_stream_info_el.textContent = '';
									speaker_list_stream_timeout = null;
									previous_stream_word = '';
								},1000);
						
							}
					
						}
						else if(typeof e.data.task_assistant == 'string' && e.data.task_assistant != 'scribe'){
							if(
								!e.data.content.trim().startsWith('[') 
								&& !e.data.content.trim().startsWith('(') 
								&& !e.data.content.trim().endsWith(')') 
								&& !e.data.content.trim().endsWith(']') 
								&& previous_stream_word.trim() != '[' 
								&& previous_stream_word.trim() != '('
							){
								if(typeof e.data.task_destination == 'string' && e.data.task_destination == 'chat'){
									window.set_chat_status({'assistant':e.data.task_assistant}, e.data.content, 2);
								}

								if(
									window.speaker_enabled 
									&& typeof window.settings.interrupt_speaking == 'string' 
									&& (
										window.settings.interrupt_speaking == 'Yes' 
										||
										(
											window.settings.interrupt_speaking == 'Auto' 
											&& window.ram > 4000
											&& typeof window.recording_to_listening_ratio == 'number' 
											&& window.recording_to_listening_ratio > 0.7
										)
									)
									&& (window.stt_tasks_left > 1 || window.tts_tasks_left > 0) 
									//&& window.tts_worker_busy
								){
									window.interrupt_speaker();
									flash_message(get_translation('Interrupted'),1000,'info');
								}
							}
							else{
								//console.log("whisper_stream: avoiding a meta sound: ", e.data.content);
							}
						}
						previous_stream_word = e.data.content;
					}
			
				}
		
				// no longer used?
				else if(e.data.status == 'update'){
					//console.log("received update from whisper worker")
					if(typeof e.data.data == 'object' && e.data.data != null && e.data.data.length){
						if(e.data.task){
							set_chat_status(e.data.task, e.data.data[0], 2);
						}
						else{
							console.error("whisper returned update, but no e.data.task? ", e.data);
						}
					}
					else{
						console.error("whisper worker sent update, but did not have all values? e.data: ", e.data);
					}
				}
		
		
				else if(e.data.status == 'consent'){
					//console.log("whisper worker sent update about the verification consent state of a speaker: ", e.data);
					if(typeof e.data.speaker_id == 'number' && typeof window.last_verified_speaker == 'number' && window.last_verified_speaker == e.data.speaker_id){
						 window.last_verified_speaker = null;
					}
					if(window.speaker_enabled){
						window.play_sound_effect('ok');
					}
					if(typeof e.data.data == 'boolean'){
						if(e.data.data == true){
							flash_message(get_translation('consent_given'),1000);
							//add_chat_message_once('current','developer',get_translation("Try_saying_my_name_is_Rabbit"),"Try_saying_my_name_is_Rabbit");
						}
						else{
							flash_message(get_translation('consent_withdrawn'),1000);
						}
					}
				}
		
		
				else if(e.data.status == 'speaker_name'){
					//console.log("whisper worker sent update about the verification consent state of a speaker");
					if(window.speaker_enabled){
						window.play_sound_effect('ok');
					}
					if(typeof e.data.data == 'string' && e.data.data != ''){
						flash_message("speaker_name: " + e.data.data,1000);
					}
				}
		
		
				else if(e.data.status == 'speakers_list'){
					if(typeof e.data.speakers != 'undefined' && Array.isArray(e.data.speakers)){
						update_transcription_info(e.data);
					}
				}
		
		
				else if(e.data.status == 'exclamation_marks'){
					//console.log("whisper worker sent message that it generated lots of exclamation_marks");
					window.whisper_saw_exclamation_marks = true;
				}
		
		
				else if(e.data.status == 'complete'){
					window.skip_a_beat = true;
			
					set_chat_status(e.data.task,'',2);
					//console.log('\n\n\n\n\nGOT WHISPER COMPLETE FROM WORKER\n\n\n\ne.data: \n\n', e.data);
					//console.log('GOT WHISPER COMPLETE.  e.data.transcript: ', e.data.transcript);
					//console.log('GOT WHISPER COMPLETE.  e.data.task: ', e.data.task);
			
					if(typeof e.data.task != 'undefined' && e.data.task != null){
						//console.log("GOT WHISPER COMPLETE : TASK: ", e.data.task);
				
						if(typeof e.data.transcript == 'undefined' || e.data.transcript == null){
							console.warn("whisper transcript was null");
							window.handle_completed_task(e.data.task,null,{'state':'failed'});
							//set_state(LISTENING);
						}
						else if(typeof e.data.transcript != 'undefined'){
							//console.log("whisper returned transcript: ", e.data.transcript);
					
							if(typeof e.data.transcript != 'string' && typeof e.data.transcript.text == 'string'){
								window.handle_completed_task(e.data.task,e.data.transcript.text,null,e.data.transcript);
							}
							else{
								window.handle_completed_task(e.data.task,null,{'state':'failed'});
							}
					
							//console.log("HANDLE WHISPER COMPLETE: final transcript_text: ", transcript_text);

							// It was a very short audio file, then trancription variables can be immediately reset, and whisper unloaded.
							if(typeof e.data.task.origin == 'string' && e.data.task.origin.endsWith('file') && typeof e.data.task.parent_index != 'number'){ // created_new_file &&  
								//console.log("GOT WHISPER COMPLETE: parent_index was not a number: ", e.data.task.parent_index, e.data.task );
								//window.handle_completed_task(e.data.task,transcript_text,null);
								reset_whisper_transcription();
								// TODO should also send a reset message to the whisper worker?
							}
				
						}
						else{
							console.error("transcript was not in whisper e.data: ", e.data);
						}
				
					}
					else{
						console.error("whisper worker complete response did not have a task: ", e.data);
					}
			
					window.whisper_worker_busy = false;
					last_whisper_task = null;
					set_state(LISTENING);
			
				}
		
		
				else if(e.data.status == 'disposed'){
					//console.log("whisper worker sent message that it has disposed of the AI models");
					window.whisper_loaded = false
					window.busy_loading_whisper = false;
					window.whisper_worker_busy = false;
					
					if(window.stopped_whisper_because_of_low_memory){
						//console.log("whisper worker sent disposed message. Low_memory, so also terminating the worker");
						kill_whisper_worker('interrupted'); 
					}
			
					let whisper_progress_message_el = document.querySelector('.message.pane-whisper.download-progress-chat-message');
					if(whisper_progress_message_el){
						//console.error("whisper seems to have been busy downloading when it was asked to dispose (and complied)?");
						whisper_progress_message_el.classList.add('download-complete-chat-message');
						setTimeout(() => {
							whisper_progress_message_el.remove();
						},1000);
					}
				}
		
				else if(e.data.status == 'success'){
					//console.warn("whisper worker sent success message: ", e.data);
					if(typeof e.data.message == 'string'){
						flash_message("Success: " + window.get_translation(e.data.message));
					}
				}
		
				else if(e.data.status == 'warning'){
					console.warn("whisper worker sent warning: ", e.data);
					if(window.settings.settings_complexity == 'developer'){
						if(typeof e.data.data == 'string' && e.data.data != ''){
							flash_message("Warning: " + e.data.data,2000,'warn');
						}
					}
				
					if(typeof e.data.error == 'string' && e.data.error == 'already busy loading'){
						window.busy_loading_whisper = true;
					}
				
				}
		
				else if(e.data.status.startsWith('asr_')){
					//console.log("received ASR_ message from whisper worker: ", e.data.status, e.data);
				}
		
		
		
				else if(e.data.status == 'error' || e.data.status == 'interrupted' || e.data.status == 'reset_me'){
					console.error("WHISPER SENT ERROR/INTERRUPTED/RESET_ME: ", e.data.status);
				
					if(typeof e.data.error == 'string'){
						console.error("whisper_worker sent error message: ", e.data.error);
						//window.display_error(e.data.task,e.data.error);
					}
				
					if(typeof e.data.error != 'undefined' && ('' + e.data.error).indexOf(' memory') != -1){
						flash_message(get_translation("Not_enough_memory"),2000,'fail');
					}
			
					if(typeof e.data.task != 'undefined' && e.data.task != null){
						console.error("transcription error occured: calling handle_completed_task.  e.data: ", e.data);
						if(typeof e.data.error != 'undefined' && ('' + e.data.error).indexOf(' Aborted()') != -1){
							flash_message(get_translation("An_error_occured"),2000,'fail');
							add_chat_message_once('current','developer',window.get_translation('Upgrade_or_change_browser'),'Try_updating_or_changing_your_browser');
						}
				
						if(e.data.status == 'interrupted'){
							handle_completed_task(e.data.task,null,{'state':'interrupted'});
						}
						else{
							handle_completed_task(e.data.task,null,{'state':'failed'});
						}
				
						if(e.data.status == 'reset_me'){
							console.warn("RECEIVED RESET_ME COMMAND FROM WHISPER WORKER");
							if(window.settings.settings_complexity == 'developer'){
								flash_message("Resetting voice recognition",2000,'fail');
							}
							window.dispose_whisper();
						}
						else if(e.data.status == 'interrupted'){
							window.whisper_worker_busy = false;
						}
						else{
							//console.error("received error message from whisper worker, killing the whisper worker"); // too harsh?
							//kill_whisper_worker();
						}
				
				
					}
					else{
						console.error("transcription error occured, and no valid task in Whisper_worker response.  e.data: ", e.data);
					}
			
					window.busy_loading_whisper = false;
					window.stopped_whisper_because_of_low_memory = false;
					//window.whisper_loaded = false;
					//whisper_download_total_bytes = 0;
			
					set_state(LISTENING);
					if(typeof e.data.error == 'string'){
						console.error("Whisper worker returned an error: ", e.data.error, e.data);
						if(e.data.error == 'already busy transcribing'){
							window.whisper_worker_busy = true;
						}
						else if(e.data.error.indexOf('Failed to fetch') != -1){
							window.whisper_worker_busy = false;
							window.flash_message("Error: " + window.get_translation('Could_not_start_voice_recognition'),3000,'fail');
							window.add_chat_message_once('current','developer',window.get_translation('A_model_has_to_be_downloaded_from_the_internet_but_there_is_no_internet_connection'),'A_model_has_to_be_downloaded_from_the_internet_but_there_is_no_internet_connection');
					
						}
						else if(e.data.error.indexOf('no available backend found') != -1){
							window.whisper_worker_busy = false;
							window.flash_message("Error: " + window.get_translation('Could_not_start_voice_recognition'),3000,'fail');
					
						}
						else if(e.data.error.indexOf('allocation') != -1){
							window.whisper_worker_busy = false;
							window.flash_message("Error: " + window.get_translation('Could_not_start_voice_recognition'),3000,'fail');
							/*
							if(typeof typeof e.data.task != 'undefined' && e.data.task != null && typeof e.data.task.assistant == 'string'){
								window.add_chat_message(e.data.task.assistant,'scribe',window.get_translation('Not_enough_memory') + ' 🙁', 'Not_enough_memory');
							}
							else{
								window.add_chat_message('current','scribe',window.get_translation('Not_enough_memory') + ' 🙁', 'Not_enough_memory');
							}
							*/
							window.add_chat_message('current','scribe',window.get_translation('Not_enough_memory') + ' 🙁', 'Not_enough_memory');
					
					
						}
						//window.flash_message(get_translation('Transcription') + ': ' + window.get_translation('An_error_occured'),3000,'fail');
					}
					else if(typeof e.data.message == 'string'){
						console.error("Whisper worker returned an error message: ", e.data.message, e.data);
						if(e.data.message.indexOf('ailed to create transcriber instance') != -1){
							window.flash_message("Error: " + window.get_translation('Could_not_start_voice_recognition'),3000,'fail');
							window.whisper_worker_busy = false;
						}
					}
					else{
						console.error("Whisper worker returned an error (or interruption) without an error message.  typeof e.data.error,e.data: ", typeof e.data.error, e.data);
						window.whisper_worker_busy = false;
					}
					window.remove_body_class('doing-stt');
			
					let whisper_download_progress_el = document.getElementById('download-progress-whisper');
					if(whisper_download_progress_el){
						let whisper_download_progress_message_el = whisper_download_progress_el.closest('.download-progress-chat-message');
						if( whisper_download_progress_message_el){
							whisper_download_progress_message_el.classList.add('fail');
							setTimeout(() => {
								 whisper_download_progress_message_el.remove();
							},2000);
						}
					}
			
			
					reject(null);
			
			
				}
		
				else if(e.data.status == 'verification_audio'){
					//console.warn("whisper worker sent verification audio: ", e.data.audio);
					if(window.is_mobile == false && window.settings.settings_complexity == 'developer' && window.settings.assistant == 'scribe'){
						//window.push_stt_task(e.data.audio,false,{'origin':'voice','destination':'chat','assistant':'danube_3_500m'});
						//flash_message("verification_audio: " + e.data.message);
				
						//console.log("verification_audio: e.data.parent_index: ", e.data.parent_index);
						//window.play_float32_array_as_audio(e.data.audio);
						//window.disable_speaker();
				
						if(window.speaker_enabled){
							let audio_play_task = {
								'prompt':null,
								'assistant':'speaker',
								'audio':e.data.audio,
								'demo_audio':e.data.audio,
								'wav_blob':encodeWAV(e.data.audio),
								'type':'audio_player',
								'state':'completed',
								'origin':'whisper',
								'destination':'chat',
								'text':e.data.message,
								'transcription':e.data.message,
							}
							window.add_task(audio_play_task);
						}
				
						if(typeof e.data.parent_index == 'number' && typeof e.data.message == 'string'){
							const scribe_progress_info_el = document.querySelector('#scribe-progress-info' + e.data.parent_index);
							if(scribe_progress_info_el){
								//console.log("found scribe_progress_info_el");
						
								if(speaker_list_info_timeout != null){
									clearTimeout(speaker_list_info_timeout);
								}
						
								if(e.data.message.startsWith(' ')){
									e.data.message = e.data.message.substr(1);
								}
								scribe_progress_info_el.textContent = '...' + e.data.message + '...';
						
								speaker_list_info_timeout = setTimeout(() => {
									scribe_progress_info_el.textContent = '';
									speaker_list_info_timeout = null;
								},5000);
						
							}
						}
						else{
							console.error("verification_audio: no valid parent_index provided: ", e.data);
						}
				
				
				
					}
				}
		
		
				else{
					console.error("whisper worker sent an unexpected message: ", e.data);
					//window.whisper_worker_busy = false;
				
					kill_whisper_worker();
				
					if(e.data.data == null){
						console.warn("whisper recognition failed. If this is the first run, that's normal.");
						set_state(LISTENING);
					}
				}
			
			
			
			}

		});


		// TODO: this should kill the task too? Perhaps my_whisper_task could be stored in this module
		window.whisper_worker.addEventListener('error', (error) => {
			console.error("ERROR: whisper_worker sent error. terminating!. Error was: ", error, error.message);
			whisper_worker_error_count++;
	
			kill_whisper_worker(null,5000);
			/*
			if(typeof error != 'undefined' && whisper_worker_error_count < 3){
				setTimeout(() => {
			
					if(window.microphone_enabled){
						console.warn("attempting to restart whisper worker");
						create_whisper_worker();
					}
			
				},1000);
			}
			else{
				console.error("whisper_worker errored out");
			}
			*/
			reject(null);
		});
	
	}) // end of promise
	
}

async function kill_whisper_worker(kill_type='failed',restart_delay=0){
	//console.error("in kill_whisper_worker");
	if(typeof kill_type != 'string'){
		kill_type = 'failed';
	}
	if(window.whisper_worker != null){
		window.whisper_worker.terminate();
	}
	window.whisper_worker = null;
	if(last_whisper_task != null){
		console.log("kill_whisper_worker: setting last_whisper_task as failed");
		await window.handle_completed_task(last_whisper_task,null,{'state':kill_type});
		last_whisper_task = null;
	}
	
	let whisper_progress_message_el = document.querySelector('.message.pane-whisper.download-progress-chat-message');
	if(whisper_progress_message_el){
		whisper_progress_message_el.classList.add('fail');
		setTimeout(() => {
			whisper_progress_message_el.remove();
		},1000);
	}
	
	
	if(typeof restart_delay == 'number' && restart_delay > 0){
		if(restart_delay > 15000){
			restart_delay = 15000;
		}
		await delay(restart_delay);
	}
	
	
	window.whisper_worker_busy = false;
	window.whisper_loaded = false;
	window.whisper_saw_exclamation_marks = false;
	window.busy_loading_whisper = false;
	window.whisper_loading = false;
	
	
	
}

async function update_transcription_info(e_data){
	//console.log("update_transcription_info (speakers_list): e_data: ", e_data);
	if(e_data.task != 'undefined' && e_data.task != null){
		
		// for now, voice tasks all get to use a single main information panel, while file transcription tasks get their own.
		let bubble_parent_index = '';
		
		if(typeof e_data.task.parent_index == 'number'){
			//console.log("update_transcription_info: task has a parent_index: ", e_data.task.parent_index);
			bubble_parent_index = e_data.task.parent_index;
		}
		else{
			//console.error("update_transcription_info: transcription task does not have a parent index.  e_data: ", e_data.task);
			return false
		}
		
		//console.log("update_transcription_info:  bubble_parent_index: ", typeof bubble_parent_index, bubble_parent_index);
		
		let transcription_info_container_el = document.querySelector('#scribe-transcription-info-container' + bubble_parent_index);
		if(transcription_info_container_el == null){
			console.warn("could not find transcription info container: #scribe-transcription-info-container" + bubble_parent_index);
			if(
				e_data.speakers.length > 0 
				|| (typeof e_data.task.origin == 'string' && e_data.task.origin.endsWith('file') && typeof e_data.task.file != 'undefined' && e_data.task.file != null && typeof e_data.task.file.filename == 'string' && e_data.task.file.filename.length) 
				|| (typeof e_data.task.origin == 'string' && e_data.task.origin == 'voice')
				|| (typeof e_data.task.progress_index == 'number' && typeof e_data.task.progress_total == 'number')
			){
				//transcription_info_container_el = document.createElement('div');
				//transcription_info_container_el.setAttribute('id','scribe-transcription-info-container');
				if(typeof bubble_parent_index == 'number'){
					//console.log("update_transcription_info: adding chat message. bubble_parent_index is a number: ", bubble_parent_index)
					add_chat_message('scribe','scribe','scribe_transcription_info#setting---',null,null,bubble_parent_index);
				}
				else{
					add_chat_message('scribe','scribe','scribe_transcription_info#setting---',null,null,'');
				}
			}
			
			
			transcription_info_container_el = document.querySelector('#scribe-transcription-info-container' + bubble_parent_index);
			if(transcription_info_container_el == null){
				console.error("transcription_info_container_el did not exist yet, have to wait longer");
				
			}
			else{
				
				//console.log("transcription_info_container_el immediately after creation: ", typeof transcription_info_container_el)
				setTimeout(() => {
					window.scroll_chat_to_bottom();
				},1);
			}
			
		}
		
		
		if(transcription_info_container_el != null){
		
			// Add name of destination
			if(typeof e_data.task.file != 'undefined' && e_data.task.file != null && typeof e_data.task.file.filename == 'string' && e_data.task.file.filename.length){
				let transcription_title_container_el = document.querySelector('#scribe-transcription-title' + bubble_parent_index);
				if(transcription_title_container_el == null){
					transcription_title_container_el = document.createElement('div');
					transcription_title_container_el.classList.add('flex-start');
					transcription_title_container_el.classList.add('scribe-transcription-title');
					transcription_title_container_el.setAttribute('id','scribe-transcription-title' + bubble_parent_index);
					
					
					
					//console.log("e_data.task: ", e_data.task);
					
					
					let transcription_arrow_icon_el = document.createElement('img');
					transcription_arrow_icon_el.classList.add('scribe-transcription-title-icon');
					transcription_arrow_icon_el.classList.add('scribe-transcription-title-arrow-icon');
					transcription_arrow_icon_el.src = "./images/right_arrow_icon.svg";
					
					let transcription_source_icon_el = document.createElement('img');
					transcription_source_icon_el.classList.add('scribe-transcription-title-icon');
					transcription_source_icon_el.classList.add('scribe-transcription-title-origin-icon');
					if(typeof e_data.task.origin == 'string' && e_data.task.origin.endsWith('file') && typeof e_data.task.origin_file != 'undefined' && e_data.task.origin_file != null && typeof e_data.task.origin_file.folder == 'string' && typeof e_data.task.origin_file.filename == 'string'){
						
						transcription_source_icon_el.addEventListener('click', () => {
							window.open_file(e_data.task.origin_file.filename,null,e_data.task.origin_file.folder);
						});
						
						if(window.filename_is_video(e_data.task.origin_file.filename)){
							transcription_source_icon_el.src = './images/video_icon.svg';
							transcription_title_container_el.appendChild(transcription_source_icon_el);
							transcription_title_container_el.appendChild(transcription_arrow_icon_el);
						}
						else if(window.filename_is_audio(e_data.task.origin_file.filename)){
							transcription_source_icon_el.src = './images/audio_icon.svg';
							transcription_title_container_el.appendChild(transcription_source_icon_el);
							transcription_title_container_el.appendChild(transcription_arrow_icon_el);
							
						}
						else{
							//transcription_source_icon_el.src = './images/document_icon.svg';
						}
						
						
						
					}
					else if(typeof e_data.task.origin == 'string' && e_data.task.origin == 'voice'){
						transcription_source_icon_el.src = './images/microphone_icon.svg';
						transcription_title_container_el.appendChild(transcription_source_icon_el);
						transcription_title_container_el.appendChild(transcription_arrow_icon_el);
					}
					
					
						
					let transcription_icon_el = document.createElement('img');
					transcription_icon_el.classList.add('scribe-transcription-title-icon');
					transcription_icon_el.classList.add('scribe-transcription-title-destination-icon');
					
					if(typeof e_data.task.file != 'undefined' && e_data.task.file != null && typeof e_data.task.file.filename == 'string'){
						if(window.filename_is_video(e_data.task.file.filename)){
							transcription_icon_el.src = './images/video_icon.svg';
						}
						else if(window.filename_is_audio(e_data.task.file.filename)){
							transcription_icon_el.src = './images/audio_icon.svg';
						}
						else{
							transcription_icon_el.src = './images/document_icon.svg';
						}
					}
					else if(e_data.task.file.filename.endsWith('.vtt') || e_data.task.file.filename.endsWith('.srt')){
						transcription_icon_el.src = './images/subtitle_icon.svg';
					}
					/*
					else if(window.microphone_enabled){
						transcription_icon_el.src = './images/mouth.svg';
					}
					*/
					else{
						transcription_icon_el.src = './images/document_icon.svg';
					}
					
					
					
					let transcription_title_el = document.createElement('h4');
					transcription_title_el.appendChild(transcription_icon_el);
					
					let transcription_title_name_el = document.createElement('span');
					transcription_title_name_el.textContent = e_data.task.file.filename;
					transcription_title_el.appendChild(transcription_title_name_el);
					
					if(typeof e_data.task.file != 'undefined' && e_data.task.file != null && typeof e_data.task.file.filename == 'string'){
						const my_folder = e_data.task.file.folder;
						const my_filename = e_data.task.file.filename;
					
						transcription_title_el.addEventListener('click', () => {
							open_file(my_filename,null, my_folder);
						});
					}
					
					
					transcription_title_container_el.appendChild(transcription_title_el);
					
					transcription_info_container_el.prepend(transcription_title_container_el); // TODO prepend
					
					
					
					
					// Add timestamp selection dropdown, but not for subtitle generation
					if(!e_data.task.file.filename.endsWith('.vtt') && !e_data.task.file.filename.endsWith('.srt')){
						let transcription_timestamper_el = document.querySelector('#transcription-bubble-settings' + bubble_parent_index);
						if(transcription_timestamper_el == null){
					
							transcription_timestamper_el = document.createElement('div');
							transcription_timestamper_el.classList.add('transcription-bubble-settings');
							transcription_timestamper_el.setAttribute('id','transcription-bubble-settings' + bubble_parent_index);
				
							let transcription_detail_container_el = document.createElement('div');
							transcription_detail_container_el.classList.add('flex-vertical');
							transcription_detail_container_el.classList.add('area');
					
					
							let transcription_timestamps_label_el = document.createElement('label');
							transcription_timestamps_label_el.classList.add('transcription-bubble-settings-label')
							transcription_timestamps_label_el.textContent = window.get_translation('add_timestamps');
							transcription_timestamps_label_el.setAttribute('data-i18n','add_timestamps');
							transcription_timestamps_label_el.setAttribute('for','transcription-timestamps-setting' + bubble_parent_index);
				
				
							const my_parent_index = e_data.task.parent_index;
				
							let transcription_timestamps_select_el = document.createElement('select');
							transcription_timestamps_select_el.classList.add('model-info-toggle');
							transcription_timestamps_select_el.setAttribute('id','transcription-timestamps-setting' + bubble_parent_index);
					
							for(let o = 0; o < window.add_timestamp_options.length; o++){
								let option_el = document.createElement('option');
								option_el.setAttribute('value',window.add_timestamp_options[o]);
								option_el.setAttribute('data-i18n',window.add_timestamp_options[o]);
								option_el.textContent = window.get_translation(window.add_timestamp_options[o]);
								if(typeof window.settings.assistants['scribe'] != 'undefined' && typeof window.settings.assistants['scribe'].add_timestamps == 'string'){
									if(window.add_timestamp_options[o] == window.settings.assistants['scribe'].add_timestamps){
										option_el.setAttribute('selected','selected');
									}
								}
								transcription_timestamps_select_el.appendChild(option_el);
							}
					
							transcription_timestamps_select_el.addEventListener('change',() => {
								//console.log("add_timestamps select element changed to: ", transcription_timestamps_select_el.value);
								//window.settings.assistants['scribe'].add_timestamps = transcription_timestamps_select_el.value;
								//save_settings();
						
								//console.log("add_timestamps select: going to loop over all tasks to look for parent index: ", my_parent_index);
								for(let t = 0; t < window.task_queue.length; t++){
									if(typeof window.task_queue[t].state == 'string' && typeof window.task_queue[t].index == 'number' && window.task_queue[t].index == my_parent_index){
										window.task_queue[t].add_timestamps = transcription_timestamps_select_el.value;
										const visible_speakers_list = get_visible_speakers_list();
										whisper_snippets_to_text(window.task_queue[t], visible_speakers_list);
									}
								}
						
							});
							transcription_timestamps_label_el.setAttribute('data-i18n','add_timestamps');
					
							transcription_detail_container_el.appendChild(transcription_timestamps_label_el);
							transcription_detail_container_el.appendChild(transcription_timestamps_select_el);
							transcription_timestamper_el.appendChild(transcription_detail_container_el);
							transcription_info_container_el.appendChild(transcription_timestamper_el);

						}
					}
					
				}
				
			}
			
			
			// TODO: add quick link to original audio/video file that is being transcribed
		
		
			// Update task progress if possible
			if(typeof e_data.task.progress_index == 'number' && typeof e_data.task.progress_total == 'number'){
		
				let transcription_progress_el = document.querySelector('#scribe-progress' + bubble_parent_index);
				if(transcription_progress_el == null){
					let transcription_progress_container_el = document.createElement('div');
					
					transcription_progress_el = document.createElement('progress');
					//transcription_progress_el.value = (e_data.task.progress_index / e_data.task.progress_total);
					
					transcription_progress_el.setAttribute('id','scribe-progress' + bubble_parent_index);
					
					transcription_progress_container_el.appendChild(transcription_progress_el);
					
					let transcription_stream_info_el = document.createElement('div');
					transcription_stream_info_el.classList.add('area');
					transcription_stream_info_el.classList.add('scribe-stream-info');
					transcription_stream_info_el.setAttribute('id','scribe-stream-info' + bubble_parent_index);
					transcription_progress_container_el.appendChild(transcription_stream_info_el);
					
					
					let transcription_progress_info_el = document.createElement('div');
					transcription_progress_info_el.classList.add('hint-area');
					transcription_progress_info_el.classList.add('scribe-progress-info');
					transcription_progress_info_el.setAttribute('id','scribe-progress-info' + bubble_parent_index);
					transcription_progress_container_el.appendChild(transcription_progress_info_el);
					
					transcription_info_container_el.appendChild(transcription_progress_container_el);
				}
			
				if(transcription_progress_el != null){
					const progress_percentage = (e_data.task.progress_index / e_data.task.progress_total);
					if(progress_percentage != 0){
						transcription_progress_el.value = progress_percentage;
					}
					if(progress_percentage == 1){
						setTimeout(() => {
							transcription_progress_el.remove();
						},2000)
					}
					
				}
		
			}
		
		
		
			function get_visible_speakers_list(){
				//console.log("in get_visible_speakers_list");
				let visible_speaker_ids = [];
				if(typeof bubble_parent_index == 'number'){
					var visible_speaker_els = document.querySelectorAll('input[type="checkbox"].speaker-item-visibility-checkbox' + bubble_parent_index);
					//console.log("get_visible_speakers_list: visible_speaker_els (checkboxes): ", visible_speaker_els);
					for(let vs = 0; vs < visible_speaker_els.length; vs++){
						//if(visible_speaker_els[vs].hasAttribute('checked') && visible_speaker_els[vs].hasAttribute('data-speaker-id')){
						if(visible_speaker_els[vs].checked && visible_speaker_els[vs].hasAttribute('data-speaker-id')){
							//console.log("get_visible_speakers_list: visible_speaker_els[vs]: ", visible_speaker_els[vs]);
							let speaker_id = parseInt(visible_speaker_els[vs].getAttribute('data-speaker-id'));
							//console.log("get_visible_speakers_list: speaker_id: ", typeof speaker_id, speaker_id);
							if(typeof speaker_id == 'number' && visible_speaker_ids.indexOf(speaker_id) == -1){
								visible_speaker_ids.push(speaker_id);
							}
						}
					}
				}
				else{
					console.error("get_visible_speakers_list: bubble_parent_index was not a number: ", typeof bubble_parent_index, bubble_parent_index);
				}
				
				//console.log("get_visible_speakers_list: visible_speaker_ids: ", visible_speaker_ids);
				return visible_speaker_ids;
			}
		
			let speaker_list_container_el = document.querySelector('#scribe-speaker-list' + bubble_parent_index);
			if(speaker_list_container_el == null){
				speaker_list_container_el = document.createElement('div');
				speaker_list_container_el.setAttribute('id','scribe-speaker-list' + bubble_parent_index);
				speaker_list_container_el.classList.add('scribe-speaker-list');
				transcription_info_container_el.appendChild(speaker_list_container_el);
			}
		
			// Update speakers list if speakers data is provided
			if(typeof e_data.speakers != 'undefined' && Array.isArray(e_data.speakers)){
				if(previous_speaker_list != JSON.stringify(e_data.speakers) ){
					previous_speaker_list = JSON.stringify(e_data.speakers);
					//console.log("new previous_speaker_list: ", previous_speaker_list);
			
			
					// Small helper function that sends the new speaker name to the worker (if still available), and updates the name in all the parent task data.
					const update_speaker_name = (my_speaker_id,speaker_name,send_to_worker=true) => {
						//console.log("in update_speaker_name (set_speaker_name). speaker_id,speaker_name,send_to_worker: ", my_speaker_id,speaker_name,send_to_worker);
						
						if(send_to_worker && window.whisper_worker != null){
							//console.log("posting updated speaker name to whisper worker's set_speaker_name. parent_index, speaker_id, new name: ", typeof bubble_parent_index, bubble_parent_index, typeof my_speaker_id, my_speaker_id, typeof speaker_name, speaker_name);
							window.whisper_worker.postMessage({'action':'set_speaker_name','id':my_speaker_id,'speaker_name': speaker_name,'parent_index':bubble_parent_index});
						}
						else if(send_to_worker){
							console.error("cannot send message to window.whisper_worker, it no longer exists (null)");
						}
						let updated_parent_task = false;
						if(typeof my_speaker_id == 'number' && typeof bubble_parent_index == 'number'){
							//console.log("going to loop over all tasks to find task to update speaker_name in.  parent index: ", bubble_parent_index);
							for(let t = 0; t < window.task_queue.length; t++){
								
								if(typeof window.task_queue[t].state == 'string' && typeof window.task_queue[t].index == 'number' && window.task_queue[t].index == bubble_parent_index){
									//console.log("found it: ", window.task_queue[t]);
									if(typeof window.task_queue[t].results != 'undefined' && Array.isArray(window.task_queue[t].results) && window.task_queue[t].results.length){
								
										for(let r = 0; r < window.task_queue[t].results.length; r++){
											if(typeof window.task_queue[t].results[r] != 'string' && window.task_queue[t].results[r] != null){
												if(typeof window.task_queue[t].results[r].words == 'object' && Array.isArray(window.task_queue[t].results[r].words)){
													for(let w = 0; w < window.task_queue[t].results[r].words.length; w++){
														if(typeof window.task_queue[t].results[r].words[w] == 'object' && window.task_queue[t].results[r].words[w] != null){
															if(typeof window.task_queue[t].results[r].words[w].verification != 'undefined' && typeof window.task_queue[t].results[r].words[w].verification.speaker_id == 'number' && window.task_queue[t].results[r].words[w].verification.speaker_id == my_speaker_id){
														
																if(typeof window.task_queue[t].results[r].words[w].verification.speaker_name == 'string'){
																	//console.log("Updating speaker name in existing parent task results verification: ", window.task_queue[t].results[r].words[w].verification.speaker_name, " -> ", speaker_name);
																}
																else{
																	//console.log("Inserting speaker name in existing parent task results verification: ", window.task_queue[t].results[r].words[w].verification.speaker_id, " -> ", speaker_name);
																}
														
																window.task_queue[t].results[r].words[w].verification.speaker_name = speaker_name;
																updated_parent_task = true;
															}
															
															if(typeof window.task_queue[t].results[r].words[w].verify_audio_result != 'undefined' && typeof window.task_queue[t].results[r].words[w].verify_audio_result.speaker_id == 'number' && window.task_queue[t].results[r].words[w].verify_audio_result.speaker_id == my_speaker_id){
														
																if(typeof window.task_queue[t].results[r].words[w].verify_audio_result.speaker_name == 'string'){
																	//console.log("Updating speaker name in existing parent task results verify_audio_result: ", window.task_queue[t].results[r].words[w].verify_audio_result.speaker_name, " -> ", speaker_name);
																}
																else{
																	//console.log("Inserting speaker name in existing parent task results verify_audio_result: ", window.task_queue[t].results[r].words[w].verify_audio_result.speaker_id, " -> ", speaker_name);
																}
														
																window.task_queue[t].results[r].words[w].verify_audio_result.speaker_name = speaker_name;
																updated_parent_task = true;
															}
															
															if(typeof window.task_queue[t].results[r].words[w].speaker_id == 'number' && window.task_queue[t].results[r].words[w].speaker_id == my_speaker_id){
																if(typeof window.task_queue[t].results[r].words[w].speaker_name == 'string'){
																	//console.log("Updating speaker name in existing parent task word object: ", window.task_queue[t].results[r].words[w].speaker_name, " -> ", speaker_name);
																}
																else{
																	//console.log("Inserting speaker name in existing parent task word object: ", window.task_queue[t].results[r].words[w].speaker_id, " -> ", speaker_name);
																}
																window.task_queue[t].results[r].words[w].speaker_name = speaker_name;
															}
														}
													}
												}
											}
											else{
												console.warn("Updating speaker name in existing parent task: cannot update speaker, as the result was a string or null: ",  window.task_queue[t].results[r]);
											}
										}
										if(updated_parent_task){
											const visible_speakers_list = get_visible_speakers_list();
											whisper_snippets_to_text(window.task_queue[t], visible_speakers_list);
											
											// Show the now modified document if a document isn't open already.
											if(
												typeof window.task_queue[t].file != 'undefined' 
												&& window.task_queue[t].file != null 
												&& typeof window.task_queue[t].file.filename == 'string' 
												&& (
													window.settings.docs.open == null 
													|| (window.settings.docs.open != null && typeof window.settings.docs.open.filename == 'string' && window.settings.docs.open.filename != window.task_queue[t].file.filename)
												)
											){
												open_file(window.task_queue[t].file.filename,null,window.task_queue[t].file.folder);
											}
											
										}
								
									}
								}
							}
						}
					}
					
					
				
					if(speaker_list_container_el != null){
						if(e_data.speakers.length > 1){
							transcription_info_container_el.classList.add('multiple-speakers');
						}
						for(let f = 0; f < e_data.speakers.length; f++){
							
							
							var my_speaker_id = '';
							if(typeof e_data.speakers[f].id == 'number'){
								
								my_speaker_id = e_data.speakers[f].id;
								
								//console.log("my_speaker_id bubble_parent_index: ", typeof bubble_parent_index, bubble_parent_index);
								//console.log("my_speaker_id: ", typeof my_speaker_id, my_speaker_id);
								const speaker_element_id = 'speaker-list-item-wrapper' + bubble_parent_index + '-' + my_speaker_id;
								const speaker_name_el_id = 'speaker-list-item-name-input' + bubble_parent_index + '-' + my_speaker_id;
								const speaker_consent_el_id ='speaker-list-consent' + bubble_parent_index + '-' + my_speaker_id;
								//console.log("speaker_element_id: ", speaker_element_id);
								
								let speaker_item_wrapper_el = document.getElementById(speaker_element_id);
							
								if(speaker_item_wrapper_el == null){
									speaker_item_wrapper_el = document.createElement('div');
									speaker_item_wrapper_el.setAttribute('id',speaker_element_id);
									
									speaker_item_wrapper_el.classList.add('speaker-list-item-wrapper');
									speaker_item_wrapper_el.classList.add('flex-vertical');
								
									let speaker_item_el = document.createElement('div');
									speaker_item_el.classList.add('speaker-list-item');
				
									//speaker_item_el.setAttribute('id','scribe-speaker-list-' + e_data.speakers[f].id);
				
				
									let speaker_name_el = document.createElement('input');
									speaker_name_el.classList.add('model-info-prompt');
									
									speaker_name_el.setAttribute('id',speaker_name_el_id);
									speaker_name_el.setAttribute('type','text');
							
									
									speaker_name_el.addEventListener("keyup", (event) => {
									    if (event.key === "Enter") {
											//console.log('Enter key pressed');
											update_speaker_name(my_speaker_id, speaker_name_el.value);
									    }
									})
							
									let my_speaker_id = null;
									if(typeof e_data.speakers[f].id == 'number'){
										my_speaker_id = e_data.speakers[f].id;
									}
									let previous_speaker_name = '';
									if(typeof e_data.speakers[f].speaker_name == 'string' && e_data.speakers[f].speaker_name.length){
										speaker_name_el.value = e_data.speakers[f].speaker_name;
										previous_speaker_name = e_data.speakers[f].speaker_name;
									}
									else if(typeof e_data.speakers[f].id == 'number'){
										previous_speaker_name = window.get_translation('speaker_name') + ' ' + (e_data.speakers[f].id + 1);
										speaker_name_el.setAttribute('placeholder', previous_speaker_name);
									}
							
									//const my_e_data = e_data;
							
									speaker_name_el.addEventListener('blur',() => {
										//console.log('speaker name blur. my_speaker_id: ', typeof my_speaker_id, my_speaker_id);
										update_speaker_name(my_speaker_id,speaker_name_el.value);
										previous_speaker_name = speaker_name_el.value;
									});
									speaker_item_el.appendChild(speaker_name_el);
	
									let speaker_consent_el = document.createElement('span');
									speaker_consent_el.setAttribute('id',speaker_consent_el_id);
									speaker_consent_el.classList.add('speaker-list-consent');
									speaker_consent_el.textContent = '' + e_data.speakers[f].consent;
									if(typeof e_data.speakers[f].consent == 'boolean' && e_data.speakers[f].consent == true){
										speaker_consent_el.textContent = window.get_translation('Consent');
										speaker_consent_el.setAttribute('data-i18n','Consent');
									}
									else{
										speaker_consent_el.textContent = window.get_translation('No_consent');
										speaker_consent_el.setAttribute('data-i18n','No_consent');
									}
									//speaker_item_el.appendChild(speaker_consent_el);
	
	
									let speaker_remove_el = document.createElement('span');
									speaker_remove_el.classList.add('speaker-list-delete-button');
									//speaker_remove_el.classList.add('scary-button');
									//speaker_remove_el.textContent = '×';
									speaker_remove_el.classList.add('models-list-delete-model-button');
									speaker_remove_el.addEventListener('click',() => {
										if(window.whisper_worker != null){
											//console.log("sending delete speaker message");
											if(window.whisper_worker){
												window.whisper_worker.postMessage({'action':'delete_speaker','id':e_data.speakers[f].id,'parent_index':bubble_parent_index});
											}
											
											speaker_item_wrapper_el.remove();
										}
										else{
											//console.error("cannot remove speaker, whisper worker is null. Removing entire speaker list instead");
											//speaker_list_el.remove(); // sic
										}
									});
									speaker_item_el.appendChild(speaker_remove_el);
	
									
									speaker_item_wrapper_el.appendChild(speaker_item_el);
									
									
									
									// Verification sentence
									if(typeof e_data.speakers[f].verification_text == 'string' && e_data.speakers[f].verification_text.length > 5){
										let speaker_item_bottom_el = document.createElement('div');
										speaker_item_bottom_el.classList.add('speaker-item-sentences');
										speaker_item_bottom_el.textContent = "..." + e_data.speakers[f].verification_text.substr(0,50) + "...";
										speaker_item_wrapper_el.appendChild(speaker_item_bottom_el);
									}
									
									
									
									// Consent and visibility
									let speaker_item_details_el = document.createElement('div');
									speaker_item_details_el.classList.add('speaker-item-details');
									speaker_item_details_el.classList.add('flex-space-between');
									
									speaker_item_details_el.appendChild(speaker_consent_el);
									
									if(typeof my_speaker_id == 'number' && typeof bubble_parent_index == 'number'){
										
										let speaker_item_visiblity_container_el = document.createElement('div');
										speaker_item_visiblity_container_el.classList.add('speaker-item-visibility-container');
										speaker_item_visiblity_container_el.classList.add('flex');
										
										let speaker_item_visiblity_checkbox_el = document.createElement('input');
										speaker_item_visiblity_checkbox_el.setAttribute('data-speaker-id',my_speaker_id);
										speaker_item_visiblity_checkbox_el.setAttribute('type','checkbox');
										speaker_item_visiblity_checkbox_el.setAttribute('checked','checked');
										speaker_item_visiblity_checkbox_el.classList.add('speaker-item-visibility-checkbox' + bubble_parent_index);
										speaker_item_visiblity_checkbox_el.addEventListener('change', () => {
											//console.log("clicked on visibility checkbox click");
											for(let t = 0; t < window.task_queue.length; t++){
												
												if(typeof window.task_queue[t].state == 'string' && typeof window.task_queue[t].index == 'number' && window.task_queue[t].index == bubble_parent_index){
													//console.log("found parent task from visibility checkbox: ", window.task_queue[t]);
													const visible_speakers_list = get_visible_speakers_list();
													whisper_snippets_to_text(window.task_queue[t], visible_speakers_list);
												}
											}
											
										})
									
										
										// visible speaker button/indicator
										let speaker_item_invisiblity_button_el = document.createElement('div');
										speaker_item_invisiblity_button_el.classList.add('speaker-item-invisibility-button');
										speaker_item_invisiblity_button_el.textContent = '😐';
										speaker_item_invisiblity_button_el.addEventListener('click',() => {
											//console.log("clicked on invisibility button");
											//if(speaker_item_visiblity_checkbox_el.hasAttribute('checked')){
											if(speaker_item_visiblity_checkbox_el.checked){
												//speaker_item_visiblity_checkbox_el.removeAttribute('checked');
												speaker_item_visiblity_checkbox_el.checked = false;
											}
											else{
												//speaker_item_visiblity_checkbox_el.setAttribute('checked','checked');
												speaker_item_visiblity_checkbox_el.checked = true
											}
											for(let t = 0; t < window.task_queue.length; t++){
												
												if(typeof window.task_queue[t].state == 'string' && typeof window.task_queue[t].index == 'number' && window.task_queue[t].index == bubble_parent_index){
													//console.log("found parent task from visilibity button click: ", window.task_queue[t]);
													const visible_speakers_list = get_visible_speakers_list();
													whisper_snippets_to_text(window.task_queue[t], visible_speakers_list);
												}
											}
											
										})
									
										// Hidden speaker button/indicator
										let speaker_item_visiblity_button_el = document.createElement('div');
										speaker_item_visiblity_button_el.classList.add('speaker-item-visibility-hide-button');
										speaker_item_visiblity_button_el.textContent = '🫥'; //🫣
										speaker_item_visiblity_button_el.addEventListener('click',() => {
											//console.log("clicked on visibility button");
											//if(speaker_item_visiblity_checkbox_el.hasAttribute('checked')){
											if(speaker_item_visiblity_checkbox_el.checked){
												//speaker_item_visiblity_checkbox_el.removeAttribute('checked');
												speaker_item_visiblity_checkbox_el.checked = false;
											}
											else{
												//speaker_item_visiblity_checkbox_el.setAttribute('checked','checked');
												speaker_item_visiblity_checkbox_el.checked = true
											}
											for(let t = 0; t < window.task_queue.length; t++){
												
												if(typeof window.task_queue[t].state == 'string' && typeof window.task_queue[t].index == 'number' && window.task_queue[t].index == bubble_parent_index){
													//console.log("found parent task from visilibity button click: ", window.task_queue[t]);
													const visible_speakers_list = get_visible_speakers_list();
													whisper_snippets_to_text(window.task_queue[t], visible_speakers_list);
												}
											}
											
										})
										
										speaker_item_visiblity_container_el.appendChild(speaker_item_visiblity_checkbox_el);
										speaker_item_visiblity_container_el.appendChild(speaker_item_visiblity_button_el);
										speaker_item_visiblity_container_el.appendChild(speaker_item_invisiblity_button_el);
										
										speaker_item_details_el.appendChild(speaker_item_visiblity_container_el);
										
										
										speaker_item_wrapper_el.appendChild(speaker_item_details_el);
									}
									
									
									speaker_list_container_el.appendChild(speaker_item_wrapper_el);
									
								}
							
								else{
									//console.log("updating speaker list only: ", e_data.speakers[f], speaker_consent_el_id);
									// TODO this is not watertight if the bubble_parent_index is an empty string
									let speaker_consent_el = document.getElementById(speaker_consent_el_id);
									if(speaker_consent_el){
										//console.log("found speaker_consent_el")
										if(typeof e_data.speakers[f].consent == 'boolean' && e_data.speakers[f].consent == true){
											speaker_consent_el.textContent = window.get_translation('Consent');
											speaker_consent_el.setAttribute('data-i18n','Consent');
										}
										else{
											speaker_consent_el.textContent = window.get_translation('No_consent');
											speaker_consent_el.setAttribute('data-i18n','No_consent');
										}
									}
									else{
										console.error("could not find speaker list consent element to update");
									}
									
									if(typeof e_data.speakers[f].speaker_name == 'string' && e_data.speakers[f].speaker_name.length){
										let speaker_name_input_el = document.getElementById(speaker_name_el_id);
										if(speaker_name_input_el){
											if(speaker_name_input_el.matches(':focus')){
												//console.log("not updating speaker input element because it has focus");
											}
											else{
												if(speaker_name_input_el.value != e_data.speakers[f].speaker_name){
													//console.warn("speaker name changed: " + speaker_name_input_el.value + " -> " + e_data.speakers[f].speaker_name);
													speaker_name_input_el.value = e_data.speakers[f].speaker_name;
													update_speaker_name(my_speaker_id, e_data.speakers[f].speaker_name, false);
												}
											}
											
										}
									}
									
									
								}
							
							}
							else{
								console.error("speaker in speakers list did not have a speaker ID?: ", previous_speaker_list);
							}
							
						}
						
					}
			
				}
				
			} // end of updating speakers list
		
		
			let transcription_footer_container_el = document.querySelector('#scribe-transcription-footer' + bubble_parent_index);
			if(transcription_footer_container_el == null){
				transcription_footer_container_el = document.createElement('div');
				transcription_footer_container_el.setAttribute('id','scribe-transcription-footer' + bubble_parent_index);
				transcription_footer_container_el.classList.add('scribe-transcription-footer');
				
				if(typeof e_data.task.origin == 'string' && e_data.task.origin == 'voice'){
					
					transcription_info_container_el.classList.add('scribe-voice-transcription');
					
					let transcription_stop_container_el = document.createElement('div');
					transcription_stop_container_el.classList.add('align-right');
			
					let transcription_stop_button_el = document.createElement('button');
					transcription_stop_button_el.classList.add('scribe-transcription-stop-button');
					transcription_stop_button_el.setAttribute('data-i18n','Stop');
					transcription_stop_button_el.textContent = window.get_translation('Stop');
					transcription_stop_button_el.addEventListener('click', () => {
						//console.log("clicked on stop scribe voice transcription button");
						window.stop_scribe_voice_task({'parent_index':bubble_parent_index});
						//transcription_stop_button_el.remove();
					});
			
					transcription_stop_container_el.appendChild(transcription_stop_button_el);
					transcription_footer_container_el.appendChild(transcription_stop_container_el);
				
				}
				
				
				let transcription_stats_container_el = document.createElement('div');
				transcription_stats_container_el.classList.add('transcription-stats-container');
				transcription_stats_container_el.setAttribute('id','transcription-stats-container' + bubble_parent_index);
				transcription_footer_container_el.appendChild(transcription_stats_container_el);
				
				
				let transcription_after_container_el = document.createElement('div');
				transcription_after_container_el.classList.add('align-right');
				transcription_after_container_el.classList.add('transcription-after-container');
				
				
				
				
				// Summarize button
				if(
					typeof bubble_parent_index == 'number'
					&& typeof e_data.task != 'undefined' 
					&& e_data.task != null 
					&& typeof e_data.task.file != 'undefined' 
					&& e_data.task.file != null 
					&& typeof e_data.task.file.filename == 'string' 
					&& e_data.task.file.filename.length
					&& !e_data.task.file.filename.toLowerCase().endsWith('.json')
					&& !e_data.task.file.filename.toLowerCase().endsWith('.vtt')
					&& !e_data.task.file.filename.toLowerCase().endsWith('.srt')
				){
					
					let transcription_summarize_button_el = document.createElement('button');
					transcription_summarize_button_el.classList.add('scribe-transcription-summarize-button');
					transcription_summarize_button_el.setAttribute('data-i18n','Summarize');
					transcription_summarize_button_el.textContent = window.get_translation('Summarize');
					transcription_summarize_button_el.addEventListener('click', () => {
						
						//console.log("clicked on summarize scribe transcription button");
						let task = get_task(bubble_parent_index);
						if(task != null && typeof task.file != 'undefined' && task.file != null && typeof task.file.folder == 'string' && typeof task.file.filename == 'string'){
							
							
							let target_text = window.get_latest_document_text_from_task(task);
							
							if(typeof target_text == 'string'){
								target_text = window.strip_timestamps(target_text);
							}
							//console.log("target text to summarize: ", target_text);
							
							if(task.file.filename != current_file_name || task.file.folder != folder){
								open_file(task.file.filename,null,task.file.folder)
								.then((value) => {
									//console.log("summarize transcription: document has to be opened first");
									if(task.file.folder == folder && task.file.filename == current_file_name){
										window.prepare_summarize_document();
										window.summarize_prompt_el.value = window.get_translation('Summarize_the_following_meeting');
										if(typeof target_text == 'string'){
											window.rewrite_dialog_selected_text_el.textContent = target_text;
										}
									}
									else{
										console.error("transcription info bubble: summarize transcription: failed to open document?");
									}
								})
								.catch((err) => {
									console.error("transcription info bubble: summarize transcription: caught an error attempting to open a document to then summarize it: ", err);
								})
							}
							else if(task.file.folder == folder && task.file.filename == current_file_name){
								//console.log("summarize transcription: document is already open");
								window.prepare_summarize_document();
								window.summarize_prompt_el.value = window.get_translation('Summarize_the_following_meeting');
								if(typeof target_text == 'string'){
									window.rewrite_dialog_selected_text_el.textContent = target_text;
								}
								
							}
						}
						
						//transcription_summarize_button_el.remove();
					});
					transcription_after_container_el.appendChild(transcription_summarize_button_el);
					
					transcription_footer_container_el.appendChild(transcription_after_container_el);
				}
				
				transcription_info_container_el.appendChild(transcription_footer_container_el);
			}
			
		}
		
	}
}


function clear_whisper_speakers(task){
	//console.log("in clear_whisper_speakers");
	if(window.whisper_worker != null){
		//console.log("sending delete all speakers message");
		window.whisper_worker.postMessage({'action':'delete_speakers'});
	}
	
	if(task != null && typeof task.parent_index == 'number'){
		let transcription_info_container_el = document.querySelector('#scribe-speaker-list-container' + task.parent_index);
		if(transcription_info_container_el){
			transcription_info_container_el.innerHTML = window.get_translation('None');
		}
	}
	
}
window.clear_whisper_speakers = clear_whisper_speakers;






function reset_whisper_transcription(){
	console.log("in reset_whisper_transcription");
	window.last_verified_speaker = null;
	window.last_time_scribe_started = null;
	window.scribe_precise_sentences_count = 0;
	//clear_whisper_speakers();
	
	setTimeout(() => {
		if(window.whisper_worker != null && window.whisper_worker_busy == false && window.stt_tasks_left == 0 && window.microphone_enabled == false){
			//console.log("disposing of Whisper after transcribing a file");
			window.dispose_whisper();
		}
	},2000);
}
window.reset_whisper_transcription = reset_whisper_transcription;





// This function does NOT check if Scribe is the current assistant
function create_scribe_timestamp(date_object=null, time_scribe_started=null, add_timestamps='Minutes', note_time=''){
	if(typeof note_time != 'string'){
		note_time = '';
	}
	if(typeof add_timestamps != 'string'){
		add_timestamps = 'Minutes';
	}
	if(date_object == null){
		date_object = new Date();
	}
	
	let to_locale = true;
	//console.log("create_scribe_timestamp: time_scribe_started: ", typeof time_scribe_started, time_scribe_started);
	if(typeof time_scribe_started == 'number' && time_scribe_started < 15000000){
		//console.log("create_scribe_timestamp: not using to_locale timestamp (so likely for a file transcription)");
		to_locale = false;
		if(add_timestamps == 'Minutes' || add_timestamps == 'Minutes_and_minutes_elapsed'){
			add_timestamps = 'Minutes_elapsed';
		}
	}
	
	note_time += '\n🕰️';
	if(to_locale && (add_timestamps == 'Minutes' || add_timestamps == 'Minutes_and_minutes_elapsed' || add_timestamps == 'Detailed' || time_scribe_started == null )){
		if(add_timestamps == 'Detailed'){
			note_time = note_time + ' ' + date_object.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
		}
		else{
			note_time = note_time + ' ' + date_object.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
		}

	}
	
	if(time_scribe_started != null && (add_timestamps == 'Minutes_elapsed' || add_timestamps == 'Minutes_and_minutes_elapsed' || add_timestamps == 'Detailed')){
		//note_time += date_object.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); // TODO: use some kind of standard? Perhaps for subtitles?
		const now_stamp = date_object.getTime();
		if(typeof time_scribe_started == 'number'){
			let delta = Math.round( (now_stamp - time_scribe_started) / 1000);
			let delta_minutes = Math.floor(delta/60);
			//console.log("delta_minutes: ", delta_minutes);
			let delta_seconds = (delta % 60);
			if(delta_minutes < 10){
				delta_minutes = '0' + delta_minutes;
			}
			if(delta_seconds < 10){
				delta_seconds = '0' + delta_seconds;
			}
			if(note_time != '\n🕰️'){
				note_time += '  ';
			}
			
			if(add_timestamps == 'Detailed'){
				note_time = note_time +  ' +' + delta_minutes + ':' + delta_seconds + ' ';
			}
			else{
				note_time = note_time +  ' +' + delta_minutes + ' ';
			}
	
		}
		else{
			console.error("time_scribe_started is not a number, it is: ", typeof time_scribe_started, time_scribe_started);
		}
	}
	if(typeof note_time == 'string' && note_time != ''){
		note_time += '\n';
	}

	//console.log("create_scribe_timestamp:  generated note_time: ", note_time);
	return note_time
}
window.create_scribe_timestamp = create_scribe_timestamp;



// returns VTT-style subtitle timestamp
function create_subtitle_timestamp(substring_start_stamp, substring_end_stamp){
	if(typeof substring_start_stamp == 'number' && typeof substring_end_stamp == 'number' ){
		
		
		if(substring_end_stamp < substring_start_stamp){
			if(window.last_subtitle_relative_end_time < substring_start_stamp - 1500){
				substring_start_stamp -= 1500;
			}
			else if(window.last_subtitle_relative_end_time < substring_start_stamp - 1000){
				substring_start_stamp -= 1000;
			}
			else if(window.last_subtitle_relative_end_time < substring_start_stamp - 400){
				substring_start_stamp = substring_start_stamp - 400;
			}
			else if(window.last_subtitle_relative_end_time < substring_start_stamp - 100){
				substring_start_stamp = substring_start_stamp - 100;
			}
			else{
				window.last_subtitle_relative_end_time += 1000;
			}
		}
		
		
		let start_times = [];
		start_times.push('' + Math.floor((substring_start_stamp / 1440000) % 24));
		start_times.push('' + Math.floor((substring_start_stamp / 60000) % 60));
		start_times.push('' + Math.floor((substring_start_stamp / 1000) % 60));
		start_times.push('' + Math.floor((substring_end_stamp / 1440000) % 24));
		start_times.push('' + Math.floor((substring_end_stamp / 60000) % 60));
		start_times.push('' + Math.floor((substring_end_stamp / 1000) % 60));
		for(let z = 0; z < start_times.length; z++){
			while(start_times[z].length < 2){
				start_times[z] = '0' + start_times[z];
			}
		}
		let start_millis = '' + Math.floor(substring_start_stamp % 1000);
		let end_millis = '' + Math.floor(substring_end_stamp % 1000);
		while(start_millis.length < 3){
			start_millis = '0' + start_millis;
		}
		while(end_millis.length < 3){
			end_millis = '0' + end_millis;
		}

		window.last_subtitle_relative_end_time = substring_end_stamp;

		return start_times[0] + ':' + start_times[1] + ':' + start_times[2] + '.' + start_millis + ' --> ' + start_times[3] + ':' + start_times[4] + ':' + start_times[5] + '.' + end_millis + '\n';
		
	}
	else{
		console.error("create_subtitle_timestamp: provided timestamps were not numbers. substring_start_stamp: ",typeof substring_start_stamp, substring_start_stamp, typeof substring_end_stamp, substring_end_stamp);
		return 'INVALID TIME\n';
	}
}
window.create_subtitle_timestamp = create_subtitle_timestamp;





//
//  WHISPER SNIPPETS TO TEXT
//

// turn multiple whisper transcriptions into one coherent text
async function whisper_snippets_to_text(task,visible_speaker_list=[]){
	//console.log("in whisper_snippets_to_text.  task: ", task);
	
	let laugh_count = 0;
	
	let merged_transcript = '';
	let merged_subtitle = '';
	let full_subtitle_text = '';
	window.scribe_precise_sentences_count = 0;
	window.last_verified_speaker = null;
	
	let music_spotted = false;
	
	if(typeof task.origin == 'string' && task.origin.endsWith('file')){
		window.last_subtitle_relative_end_time = 0;
	}
	
	let add_timestamps = 'None';
	if(typeof task.add_timestamps == 'string'){
		
		add_timestamps = task.add_timestamps;
		//console.log("whisper_snippets_to_text:  task had add_timestamps preference: ", add_timestamps);
	}
	else if(typeof window.settings.assistants['scribe'].add_timestamps == 'string'){
		add_timestamps = window.settings.assistants['scribe'].add_timestamps;
		//console.log("whisper_snippets_to_text:  falling back to Scribe add_timestamps preference: ", add_timestamps);
	}
	else{
		console.error("whisper_snippets_to_text:  NO TIMESTAMP PREFERENCE FOUND: ", add_timestamps);
	}
	
	
	let document_filename = current_file_name;
	let document_folder = folder;
	if(typeof task.file != 'undefined' && task.file != null && typeof task.file.filename == 'string' && task.file.filename.length){
		document_filename = task.file.filename;
		document_folder = task.file.folder;
		
	}
	//console.log("handle_whisper_complete: initial document_filename: ", document_filename);
	
	
	if(typeof document_filename != 'string'){
		console.error("whisper_snippets_to_text: creating a last-minute file to place the results into");
		document_filename = ''; // TODO: this could cause mayhem. It's a quick fix to make sure the variable is at least a string. Maybe create a new document instead?
		//document_folder = '';
		

		document_filename = window.get_translation('Transcription') + ' ' + makeid(4) + ' ' + make_date_string() + '.txt';
		if(typeof task.origin_file != 'undefined' && task.origin_file != null && task.origin_file.filename == 'string'){
			if(filename_is_media(task.origin_file.filename)){
				document_filename = window.remove_file_extension(task.origin_file.filename) + ' ' + makeid(4) + ' ' + make_date_string() + '.vtt';
			}
		}
		
		await create_new_document('',document_filename);
		document_filename = current_file_name;
	}
	
	if(typeof document_filename != 'string'){
		console.error("whisper_snippets_to_text: aborting, no document to place result into");
		return false
	}
	
	if(typeof task.origin != 'string'){
		console.error("whisper_snippets_to_text: aborting, task did not have an origin");
		return false
	}
	
	

	if(typeof task.results != 'undefined' && Array.isArray(task.results) ){ // && task.file != null && typeof task.file.filename == 'string' && task.file.filename.length
		
		
		let time_scribe_started = null;
		if(typeof task.origin == 'string' && task.origin.endsWith('file')){
			if(typeof task.recording_start_time == 'number'){
				time_scribe_started = task.recording_start_time;
			}
			else{
				console.error("whisper_snippets_to_text: whisper's returned task did not contain recording_start_time: ", task);
			}
		}
		else if(window.last_time_scribe_started != null){
			time_scribe_started = window.last_time_scribe_started;
		}
		else if(typeof task.recording_start_time == 'number'){
			time_scribe_started = task.recording_start_time;
		}
		
		if(time_scribe_started == null){
			console.error("whisper_snippets_to_text: time_scribe_started was null. maybe abort?");
		}
		
		
		
		let transcription_completed = false
		
		let all_words = [];
		let all_sentences = [];
		let last_all_words_length = 0;
		let last_task_last_word_start_time = null;
		let last_task_last_word_end_time = null;
		
		
		for(let a = 0; a < task.results.length; a++){
			//console.log("WHISPER_SNIPPETS_TO_TEXT: TASKA ", a, task.results[a]);
			
			if(task.results[a] == null){
				console.error("WHISPER_SNIPPETS_TO_TEXT:  TASK WAS NULl! ", a);
				continue
			}
			
			last_all_words_length = all_words.length;
			
			if(last_all_words_length){
				if(typeof all_words[all_words.length-1].absolute_start_time == 'number'){
					last_task_last_word_start_time = all_words[all_words.length-1].absolute_start_time;
				}
				else{
					console.error("word without absolute_start_time: ", JSON.stringify(all_words[all_words.length-1],null,2) );
				}
				if(typeof all_words[all_words.length-1].absolute_end_time == 'number'){
					last_task_last_word_end_time = all_words[all_words.length-1].absolute_end_time;
					//console.log("last_task_last_word_end_time: ", last_task_last_word_end_time);
				}
				else{
					console.error("word without absolute_end_time: ", JSON.stringify(all_words[all_words.length-1],null,2) );
				}
				
			}
			
			if(a == 0 && typeof task.results[a] != 'undefined' && task.results[a] != null && typeof task.results[a].progress_index == 'number'){
				//console.warn("whisper_snippets_to_text: task claims to be part of a progression of connected audio snippets. It's progress index: ", task.results[a].progress_index);
				if(typeof task.results[a].progress_total != 'number'){
					console.warn("whisper_snippets_to_text: - no progress total");
				}
			}
			
			
			if(typeof task.results[a].sentences != 'undefined' && Array.isArray(task.results[a].sentences)){
				all_sentences = all_sentences.concat(task.results[a].sentences);
				
				let start = 0;
				if(all_words.length > 20){
					start = all_words.length - 20;
				}
				
				let at_overlap = 0;
				let beyond_overlap = false;
				let overlap_old_words_start = null;
				let overlap_new_words_start = null;
				let overlapping_words = [];
				let new_words_counter = 0;
				for(let se = 0; se < task.results[a].sentences.length; se++){
					if(typeof task.results[a].sentences[se].words != 'undefined'){
						
						for(let wo = 0; wo < task.results[a].sentences[se].words.length; wo++){
							let word = task.results[a].sentences[se].words[wo];
							//console.log("\nTHE WORD: ", word.text);
							
							if(word.text.indexOf('♪') != -1){
								music_spotted = true;
							}
							new_words_counter++;
							let very_similar = false;
							let added_the_word = false;
							
							
							if(last_task_last_word_start_time != null && beyond_overlap == false && at_overlap < 4){
								
								if(at_overlap > 0){
									at_overlap++;
									//console.log("ALL_ALL: at_overlap counter: ", at_overlap);
								}
							
							
								let old_words_end = all_words.length;
								if(at_overlap > 0 && (start + at_overlap) + 1 < all_words.length){
									
									old_words_end = (start + at_overlap) + 1;
									//console.log("ALL_ALL: making old_words_end a little shorter.  all_words.length: ", all_words.length, " ->>  start: ", start, " + at_overlap: ", at_overlap, ", old_words_end: ", old_words_end);
								}
								
								let maximum_deviation = 100;
								
								for(let md = 0; md < 20; md++){
									
									if(added_the_word == false){
										//console.log("\n\n\nALL_ALL:  deviation_loop, at_overlap: ", md, md*50, at_overlap);
										for(let oldw = start; oldw < old_words_end; oldw++){
											//console.log("old word: ", all_words[oldw]);
											if(typeof all_words[oldw].absolute_start_time == 'number' && typeof word.absolute_start_time == 'number'){
												
												let ignore_before_absolute_time = 0;
												if( (last_task_last_word_end_time - 5000) > 0){
													ignore_before_absolute_time = last_task_last_word_end_time - 5000;
												}
												
												if( all_words[oldw].absolute_start_time < ignore_before_absolute_time ){
													//console.log("skipping old word that is way too old to be relevant: ", all_words[oldw].text);
													continue;
												}
												
												if( all_words[oldw].absolute_start_time < (task.results[a].words[0].absolute_start_time - 1000) ){
													//console.log("skipping old word that is very unlikely to have any overlap with the new words: ", all_words[oldw].text);
													continue;
												}
												
												
												
												
												
												
												if(Math.abs(all_words[oldw].absolute_start_time - word.absolute_start_time) < (md * 50)){
													if(at_overlap == 0 && md < 3){
														//console.log("ALL_ALL: AT START OF OVERLAP. SENTENCE: ", task.results[a].sentences[se], "\n- deviation_loop, at_overlap: ", md, md*50, at_overlap);
														
														overlap_old_words_start = oldw;
														overlap_new_words_start = new_words_counter;
														at_overlap = 1;
													}
											
													if(at_overlap){
														
														if(at_overlap > 3){
															beyond_overlap = true;
														}
														
														const word_similarity = similarity(all_words[oldw].text,word.text);
														//console.log("ALL_ALL word similarity: ", word_similarity, " - for: ",all_words[oldw].text,word.text);
														if(word_similarity > .85){
															if(start != oldw && oldw != start + 1){
																console.warn("ALL_ALL:  very similar words, but start and oldw are different!: ", start, oldw, all_words[oldw].text,word.text);
															}
															start = oldw;
															//console.log("ALL_ALL: VERY SIMILAR WORDS TOO");
															very_similar = true;
												
															if(added_the_word == false){
															
																added_the_word = true;
																if(at_overlap < 3){
																	//console.log("ALL_ALL: ADDING THE OLD WORD : ", all_words[oldw].text);
																	
																	overlapping_words.push(all_words[oldw]);
																	
																}
																else{
																	//console.log("ALL_ALL: ADDING THE NEW WORD: ", word.text);
																	
																	overlapping_words.push(word);
																}
															}
													
															break
														}
														else{
															if(md < 3){
																console.warn("VERY SIMILAR ABSOLUTE TIMESTAMPS, BUT THE WORDS ARE VERY DIFFERENT.  Similarity: ", word_similarity, " - for: ", all_words[oldw].text,word.text);
															}
															
															if(at_overlap > 1 && md == 0 && typeof task.origin == 'string' && task.origin.endsWith('file')){
																//console.log("ALL_ALL: ADDING THE NEW WORD. It's different, but has the exact same starting time, and in the overlap, and it's a file transcription.  word, at_overlap: ", word.text, at_overlap);
																added_the_word = true;
																
																/*
																if(window.settings.settings_complexity == 'developer'){
																	if(!word.text.startsWith(' @@')){
																		word.text = ' @@' + all_words[oldw].text + '@>>' + word.text;
																	}
																}
																*/
																overlapping_words.push(word);
																break
															}
															if(at_overlap > 2 && md < 2 && typeof task.origin == 'string' && task.origin.endsWith('file')){
																//console.log("ALL_ALL: ADDING THE NEW WORD. It's different, but has almost the exact same starting time, and we're deeper into the overlap, and it's a file transcription.  word, at_overlap: ", word.text, at_overlap);
																added_the_word = true;
																//use_the_new_one = true;
																/*
																if(window.settings.settings_complexity == 'developer'){
																	if(!word.text.startsWith(' @@')){
																		word.text = ' @@' + all_words[oldw].text + '@>>' + word.text;
																	}
																}
																*/
																overlapping_words.push(word);
																break
															}
															
														}
														
													}
													//console.log("ALL_ALL WORDS: Almost the same absolute timestamp: ", all_words[oldw].text, all_words[oldw], word.text, word, "\nabs: ", Math.abs(all_words[oldw].absolute_start_time - word.absolute_start_time));
												}
												
												//start = oldw;
											}
										}
										
										
										if(at_overlap == 0 && md == 5){
											//console.error("hmm, still not a first match at MD ", md, word); // keep the old word?
										}
										
									}
									
								}
								
								
								
								if(added_the_word == false){
									//console.error("WORD FELL THROUGH, WAS NOT ADDED?! timestamps too different? ", word.text, word);
									
									if(at_overlap > 0){
										//console.error("WORD FELL THROUGH. THIS IS AN ISSUE, SINCE AN OVERLAP WAS ALREADY DETECTED.  at_overlap: ", at_overlap, "previous: ");
										if(wo > 3){
											console.error("WORD FELL THROUGH. THIS IS AN ISSUE: ", task.results[a].sentences[se].words[wo-3].text + task.results[a].sentences[se].words[wo-2].text + task.results[a].sentences[se].words[wo-1].text + word.text);
										}
										else if(wo > 2){
											console.error("WORD FELL THROUGH. THIS IS AN ISSUE: ", task.results[a].sentences[se].words[wo-2].text + task.results[a].sentences[se].words[wo-1].text + word.text);
										}
										//console.log(" - overlapping words so far: \n", JSON.stringify(overlapping_words,null,2));
										
										if(wo < task.results[a].sentences[se].words.length - 1){
											if(task.results[a].sentences[se].words[wo+1].absolute_start_time >= word.absolute_end_time){
												overlapping_words.push(word);
												//console.error("THE WORD COULD BE ADDED WITHOUT OVERLAPPING IN TIME (ENDS BEFORE NEXT WORD), SO IT WAS ADDED");
											}
											else{
												console.error("WORD FELL THROUGH. THIS IS AN ISSUE, SINCE AN OVERLAP WAS ALREADY DETECTED -> THE WORD COULD NOT BE ADDED WITHOUT OVERLAPPING WITH THE NEXT WORD");
											}
										}
										else if( wo == task.results[a].sentences[se].words.length - 1 && se < task.results[a].sentences.length - 1 && typeof task.results[a].sentences[se+1].words != 'undefined'){
											
											if(task.results[a].sentences[se+1].words[0].absolute_start_time >= word.absolute_end_time){
												overlapping_words.push(word);
												//console.error("THE WORD COULD BE ADDED WITHOUT OVERLAPPING IN TIME (ENDS BEFORE NEXT SENTENCE), SO IT WAS ADDED");
											}
											else{
												console.error("WORD FELL THROUGH. THIS IS AN ISSUE, SINCE AN OVERLAP WAS ALREADY DETECTED -> THE WORD COULD NOT BE ADDED WITHOUT OVERLAPPING WITH THE FIRST WORD OF THE NEXT SENTENCE");
											}
										}
										
										
									}
									else{
										//console.error("LUCKILY AN OVERLAP WAS NOT DETECTED EARLIER, SO THIS IS PROBABLY A GOOD THING - SKIPPING A FIRST WONKY WORD");
									}
								}
								
								
								
								if(very_similar == false){
									//console.error("ALL_ALL: did not find a good match for this word: ", word);
								}
							
							
								if(word.absolute_start_time > last_task_last_word_end_time || at_overlap > 3){
									//console.log("ALL_ALL: no longer at overlap.  at_overlap, word.abolute_start_time: ", at_overlap, word.absolute_start_time);
									at_overlap = false;
									beyond_overlap = true;
									
									if(typeof overlap_old_words_start == 'number' && overlapping_words.length && all_words.length > overlap_old_words_start){
										//console.log("ALL_ALL: OVERLAP CHECK DONE!");
										//console.log("ALL_ALL: OVERLAPPING WORDS: ", overlap_old_words_start, all_words.length, " splicing: ", all_words.length - overlap_old_words_start);
										//console.log("ALL_ALL: OVERLAPPING WORDS: ", overlapping_words.length, overlapping_words);
										//console.error("ALL_ALL: SPLICING!");
										
										if(typeof task.origin == 'string' && task.origin == 'voice' && task.results.length == 1){
											all_words = [];
										}
										else{
											all_words.splice(overlap_old_words_start, (all_words.length - overlap_old_words_start));
											
										}
										
										for(let ov = 0; ov < overlapping_words.length; ov++){
											overlapping_words[ov].overlap = a;
										}
										all_words = all_words.concat(overlapping_words);
										
									}
									
									
								}
								
							}
							
							
							if(added_the_word == false && (last_task_last_word_start_time == null || beyond_overlap)){
								word['task_nr'] = a;
								//console.log("pushing beyond: ", word.text);
								all_words.push(word);
							}
							
						}
						//all_words = all_words.concat(task.results[a].sentences[se].words);
					}
				}
				//console.log("ALL_ALL: overlapping_words was: ", JSON.stringify(overlapping_words,null,2));
			}
			
			// typeof task.results[a].progress_total == 'undefined' || (
			if(typeof task.results[a] != 'undefined' && typeof task.results[a].progress_index == 'number' && typeof task.results[a].progress_total == 'number' && task.results[a].progress_index == task.results[a].progress_total){
				//console.log("whisper_snippets_to_text: TRANSCRIPTION IS NOW COMPLETE");
				transcription_completed = true;
			}
			
			
		}
		//console.error("\n\n\n\n\n\nwhisper_snippets_to_text: ALL RECEIVED SENTENCES: ", all_sentences);
		//console.error("\n\n\n\n\n\nwhisper_snippets_to_text: ALL WORDS: ", all_words);
		//all_words.push({'intermission':true});
		
		let full_duration = 1000000;
		if(all_words.length && typeof all_words[all_words.length - 1].absolute_end_time == 'number' && typeof all_words[0].absolute_start_time == 'number'){
			full_duration = all_words[all_words.length - 1].absolute_end_time - all_words[0].absolute_start_time;
			//console.log("whisper_snippets_to_text: full_duration: ", full_duration);
		}
		
		
		
		
		//
		//  TURN WORDS INTO SENTENCES
		//
		
		
		let sentence = '';
		let sentence_words = [];
		let raw_sentences = [];
		
		let most_seen_diarization_ids = {};
		let most_seen_speaker_ids = {};
		let speaker_ids_to_names = {};
		let sentence_start_time = 0;
		let real_sentence_start_time = 0;
		let sentence_duration = 0;
		let sentence_end_time = 0;
		let sentence_has_wonky_timestamps = false;
		let first_sentence = true;
		let next_word_is_sentence_beginning = true;
		
		//let spotted_speaker_id = null;
		//let spotted_speaker_name = null;
		
		let meta_characters = [')',']','*']; // '♪' // music note
		let all_meta_characters = ['(','[',')',']','*']; // '♪' // music note
		let in_meta = false;
		let in_singing = false;
		let sentence_type = 'speech';
		
		let last_word_end = 0;
		for(let x = 0; x < all_words.length; x++){
			
			if(all_words[x].absolute_start_time < last_word_end){
				console.error("OVERLAPPING START TIME WITH END OF PREVIOUS WORD: ", all_words[x].absolute_start_time, " < ", last_word_end, all_words[x-1].text, all_words[x].text);
				if(all_words[x].absolute_start_time == last_word_end && all_words[x].absolute_start_time < (all_words[x].absolute_end_time - 10)){
					all_words[x].absolute_start_time++;
				}
			}
			
			if(all_words[x].absolute_end_time < last_word_end){
				console.error("OVERLAPPING END TIME: ", all_words[x].absolute_end_time, " < ", last_word_end, last_word_end, all_words[x].text);
			}
			last_word_end = all_words[x].absolute_end_time;
		}
		
		
		for(let x = 0; x < all_words.length; x++){
			//console.log("all_words[x].text: ", x, all_words[x].text);
			sentence_words.push(all_words[x]);
			sentence += all_words[x].text;
			/*
			if(typeof all_words[x].diarization_id == 'number'){
				if(typeof most_seen_diarization_ids['' + all_words[x].diarization_id] == 'undefined'){
					most_seen_diarization_ids['' + all_words[x].diarization_id] = 1;
				}
				else{
					most_seen_diarization_ids['' + all_words[x].diarization_id] = most_seen_diarization_ids['' + all_words[x].diarization_id] + 1;
				}
			}
			*/
			
			let spotted_consent = false;
			if(typeof all_words[x].verification != 'undefined' && all_words[x].verification != null && typeof all_words[x].verification.consent == 'boolean'){
				spotted_consent = all_words[x].verification.consent;
			}
			
			
			if(typeof all_words[x].verification != 'undefined' && all_words[x].verification != null && typeof all_words[x].verification.speaker_id == 'number'){
				//console.log("using verifiation to fill most_seen_speaker_ids. all_words[x].verification: ", all_words[x].verification);
				if(typeof most_seen_speaker_ids['' + all_words[x].speaker_id] == 'undefined'){
					most_seen_speaker_ids['' + all_words[x].verification.speaker_id] = 1;
				}
				else{
					most_seen_speaker_ids['' + all_words[x].verification.speaker_id]++;
				}
				if(typeof speaker_ids_to_names['' + all_words[x].speaker_id] == 'undefined'){
					
					if(typeof all_words[x].verification.speaker_name == 'string' && all_words[x].verification.speaker_name.length){
						speaker_ids_to_names['' + all_words[x].verification.speaker_id] = all_words[x].verification.speaker_name
					}
					//console.log("speaker_ids_to_names from verification is now: ", speaker_ids_to_names);
				}
				else if(typeof speaker_ids_to_names['' + all_words[x].verification.speaker_id] == 'string' && typeof all_words[x].verification.speaker_name == 'string' && all_words[x].verification.speaker_name != speaker_ids_to_names['' + all_words[x].verification.speaker_id]){
					console.error("\n\n\n\n!\n!!\nDISAGREEMENT OVER SPEAKER NAME WITHIN A SENTENCE! ", all_words[x].verification.speaker_name, speaker_ids_to_names['' + all_words[x].verification.speaker_id]);
				}
			}
			
			else if(typeof all_words[x].speaker_id == 'number'){
				console.error("falling back to using all_words[x].speaker_id to fill most_seen_speaker_ids.");
				if(typeof most_seen_speaker_ids['' + all_words[x].speaker_id] == 'undefined'){
					most_seen_speaker_ids['' + all_words[x].speaker_id] = 1;
				}
				else{
					most_seen_speaker_ids['' + all_words[x].speaker_id]++;
				}
				if(typeof speaker_ids_to_names['' + all_words[x].speaker_id] == 'undefined'){
					
					if(typeof all_words[x].speaker_name == 'string' && all_words[x].speaker_name.length){
						speaker_ids_to_names['' + all_words[x].speaker_id] = all_words[x].speaker_name;
					}
					else if(typeof all_words[x].verify_audio_result != 'undefined' && typeof all_words[x].verify_audio_result.speaker_name == 'string' && all_words[x].verify_audio_result.speaker_name.length){
						speaker_ids_to_names['' + all_words[x].speaker_id] = all_words[x].verify_audio_result.speaker_name;
					}
					else{
						console.error("could not update speaker_ids_to_names");
					}
					//console.log("speaker_ids_to_names is now: ", speaker_ids_to_names);
				}
				else if(typeof speaker_ids_to_names['' + all_words[x].speaker_id] == 'string' && typeof all_words[x].speaker_name == 'string' && all_words[x].speaker_name != speaker_ids_to_names['' + all_words[x].speaker_id]){
					console.error("\n\n\n\n!\n!!\nDISAGREEMENT OVER SPEAKER NAME WITHIN A SENTENCE! ", all_words[x].speaker_name, speaker_ids_to_names['' + all_words[x].speaker_id]);
				}
				
			}
			
			
			
			if(all_words[x].timestamp[0] != all_words[x].timestamp[1] && all_words[x].timestamp[0] < full_duration){
				sentence_duration += (all_words[x].timestamp[1] - all_words[x].timestamp[0]);
			}
			else{
				//console.error("sentence duration issue.  start and end of word: ", all_words[x].text, all_words[x].timestamp[0], all_words[x].timestamp[1],", that last number (word end) should be smaller than full_duration: ", full_duration);
				//sentence_duration += ((full_duration * 0.95) / all_words.length);
			}
			if(all_words[x].timestamp[1] > full_duration){
				console.error("word end was beyond full duration");
			}
			//console.log("sentence_duration: ", sentence_duration);
			
			
			
			if(next_word_is_sentence_beginning){ // which means we are now at the beginning of a new sentence
				sentence_type = 'speech';
				most_seen_diarization_ids = {};
				most_seen_speaker_ids = {};
				//spotted_speaker_id = null;
				//spotted_speaker_name = null;
				
				if(all_words[x].text.indexOf('♪') != -1){
					in_singing = !in_singing;
					//console.log("in_singing switched to: ", in_singing);
				}
				
				if(typeof all_words[x].absolute_start_time == 'number'){ // all_words[x].timestamp[0] != all_words[x].timestamp[1] && 
					real_sentence_start_time = all_words[x].absolute_start_time; // no matter if it's wonky, the real start time must be known
				}
				else{
					console.error("no absolute start time for first word of sentence!: ", all_words[x]);
				}
			}
				
			if(all_words[x].text.indexOf('♪') != -1){
				sentence_type = 'singing';
			}
				
			let last_char = all_words[x].text.trim();
			let first_char = last_char.charAt(0);
			last_char = last_char.charAt(last_char.length-1);
			
			if(all_meta_characters.indexOf(first_char) != -1 || all_meta_characters.indexOf(last_char) != -1){
				sentence_type = 'sound';
			}
		
			
			// Word ends with period or question mark or exclamation mark or closing meta character
			
			if( 
				(/([A-Za-z\']+[\.\?\!])$/.test(all_words[x].text) && x < (all_words.length - 2) && all_words[x+1].text.startsWith(' ') ) || 
				meta_characters.indexOf(last_char) != -1 ||
				(last_char == '♪' && in_meta)
			){
				//console.log("spotted possible end of sentence chunk, based on word and it's last_char: ",  all_words[x], last_char);
				
				if( all_words[x].text.trim().length == 2 && /([A-Z]\.)$/.test(all_words[x].text) && all_words[x+1].text.trim().length == 2 && /([A-Z]\.)$/.test(all_words[x+1].text) ){
					console.warn("this is probably (part of) an abbrevation: ", all_words[x], all_words[x+1]);
					next_word_is_sentence_beginning = false;
				}
				else{
					//console.log("Word end with a period, or a meta character, so this word counts as end of sentence: ", all_words[x]);
					next_word_is_sentence_beginning = true;
				}
				
				//sentence += ' -!- ';
				
			}
			
			// Next word starts with an opening meta character
			else if( 
				///([A-Za-z]+[\.\?\!])$/.test(all_words[x].text) && 
				x < (all_words.length - 2) && 
				all_words[x+1].text.startsWith(' ') && 
				all_words[x+1].text.length > 1 &&
				(all_words[x+1].text.charAt(1) == '[' || all_words[x+1].text.charAt(1) == '(' || all_words[x+1].text.charAt(1) == '*' || (all_words[x+1].text.charAt(1) == '♪' && in_meta == false) ) 
			){
				//console.log("spotted possible end of sentence chunk, as next word starts with a meta character: ", all_words[x]);
				
				next_word_is_sentence_beginning = true;
			}
			
			
			// Sometimes the ending periods are missing, e.g. with music transcription. This tries to figure it out based on capitalization of the first word
			else if(
				music_spotted && 
				sentence_words.length > 10 && 
				x < (all_words.length - 3) && 
				/^(\s[a-z\']+)$/.test(all_words[x].text) && // normal word, followed by
				/^(\s[A-Z][a-z\']+\,?)$/.test(all_words[x+1].text) &&  // capitalized word (possibly ending with comma), followed by
				/^(\s[a-z]\'+\,?)$/.test(all_words[x+2].text) && // normal word (possibly ending with comma)
				(all_words[x+1].text.length > 2 || !all_words[x+1].text.startsWith("I'")) // avoid issues with _I'm_
				
			){
				next_word_is_sentence_beginning = true;
				//console.log("spotted possible end of sentence chunk based on Capitalization: ", all_words[x]);
			}
			
			else{
				//console.log("not at end of sentence: ", all_words[x]);
				next_word_is_sentence_beginning = false;
			}
			
			if(next_word_is_sentence_beginning && sentence.trim() == '♪'){
				next_word_is_sentence_beginning = false;
			}
			
			if(x >= all_words.length - 1){
				next_word_is_sentence_beginning = true; // reached the end
			}
			
			// Since the next word will be the start of a new sentence, it's time to ship off the currently created sentence.
			if(next_word_is_sentence_beginning){
				//add_sentence_to_segment(sentence,sentence_start_time,real_sentence_start_time,sentence_duration,words,sentence_has_wonky_timestamps);
				
				//console.log("most_seen_speaker_ids: ", most_seen_speaker_ids);
				
				
				
				let most_seen_speaker_id = null;
				let most_seen_speaker_name = null;
				let speaker_id_highest_count = 0;
				for (const [sid, count] of Object.entries(most_seen_speaker_ids)) {
					//console.log("finding most seen speaker_id: ", typeof sid, sid, count);
					if(count > speaker_id_highest_count){
						speaker_id_highest_count = count;
						most_seen_speaker_id = parseInt(sid);
						
					}
				}
				
				
				
				if(all_words[x].absolute_start_time == all_words[x].absolute_end_time){
					if(all_words[x].text.trim().length > 1){
						if(sentence_has_wonky_timestamps == false){
							//console.error("END OF THE SENTENCE HAS A WONKY TIMESTAMP: ", all_words[x].text);
							sentence_has_wonky_timestamps = true;
						}
						else{
							console.error("BOTH START AND END OF THE SENTENCE HAVE A WONKY TIMESTAMP");
						}
					}
					else{
						//console.error("wonky timestamp, but word is only a single letter, so letting it slide");
					}
					
				}
				else if(sentence_has_wonky_timestamps){
					console.error("ONLY THE START OF THE SENTENCE HAS A WONKY TIMESTAMP");
				}
				
				
				
				
				let new_sentence = {
					'text':sentence,
					'absolute_start_time':sentence_words[0].absolute_start_time, 
					'absolute_end_time':sentence_words[sentence_words.length-1].absolute_end_time, 
					'duration': (sentence_words[sentence_words.length-1].absolute_end_time - sentence_words[0].absolute_start_time), 
					'words':sentence_words, 
					'sentence_has_wonky_timestamps':sentence_has_wonky_timestamps, 
					'type':sentence_type, 
					'consent':spotted_consent
				};
				
				if(typeof most_seen_speaker_id == 'number'){
					new_sentence['most_seen_speaker_id'] = most_seen_speaker_id;
					new_sentence['speaker_id'] = most_seen_speaker_id;
					if(typeof speaker_ids_to_names['' + most_seen_speaker_id] == 'string'){
						new_sentence['most_seen_speaker_name'] = speaker_ids_to_names['' + most_seen_speaker_id];
						new_sentence['speaker_name'] = speaker_ids_to_names['' + most_seen_speaker_id];
					}
					else{
						console.error("\n\nmost_seen_speaker_id was not in speaker_ids_to_names dictionary: ", most_seen_speaker_id, speaker_ids_to_names);
						new_sentence['speaker_name'] = window.get_translation('speaker_name') + ' ' + most_seen_speaker_id;
					}
					
				}
				
				
				
				if(first_sentence){
					new_sentence['first_sentence'] = true;
					first_sentence = false;
				}
				
				if(x == all_words.length - 1){
					new_sentence['last_sentence'] = true;
				}
				
				raw_sentences.push(new_sentence);
				
				sentence_words = [];
				sentence_words.length = 0;
				sentence = '';
				sentence_duration = 0;
				sentence_has_wonky_timestamps = false;
				
				if(x < (all_words.length - 2) && (all_words[x+1].text.charAt(1) == '♪' || all_words[x+1].text.endsWith('♪')) ){
					in_meta = !in_meta;
					in_singing = false;
					//console.log("in_singing switched to: ", in_singing);
				}
			}
			
		}
		//console.log("LOOPED OVER THE WORDS");
		if(sentence != ''){
			console.error("leftover: LOOPED OVER WORDS: SOME TEXT WAS LEFT OVER: ", sentence);
			// a little bit of text was not handled yet (no clear sentence end indicator); Adding the stragler now.
			//add_sentence_to_segment(sentence,sentence_start_time,real_sentence_start_time,sentence_duration,words,sentence_has_wonky_timestamps);
			//let new_sentence = {'text':sentence,'absolute_start_time':real_sentence_start_time,'duration':sentence_duration,'words':sentence_words,'sentence_has_wonky_timestamps':sentence_has_wonky_timestamps};
			
		}
		
		in_meta = false;
		//console.error("\n\n\n\n\n\nALL_ALL: RAW_SENTENCES LIST: \n", JSON.stringify(raw_sentences,null,2));
		
		
		
		
		
		
		
		
		
		// Create document if need be
		
		let created_new_file = false;
		if(document_filename == '' || window.filename_is_binary(document_filename)){
			//console.log("quickly creating empty document for the transcription results first, because of this document_filename: ", document_filename);
			if(typeof task.origin == 'string' && task.origin.endsWith('file') && window.settings.settings_complexity == 'developer'){
				await window.load_meeting_notes_example('json','',remove_file_extension(document_filename));
				created_new_file = true;
			}
			else if(typeof task.origin == 'string' && task.origin == 'video_file'){
				await window.load_meeting_notes_example('vtt','\n',remove_file_extension(document_filename));
				created_new_file = true;
			}
			else if(typeof task.origin == 'string' && task.origin == 'audio_file' && (add_timestamps == 'Precise' || (typeof task.music_spotted == 'number' && task.music_spotted > 2 && transcript.text.length < 1500) )){
				await window.load_meeting_notes_example('vtt','\n',remove_file_extension(document_filename));
				created_new_file = true;
			}
			else if(typeof task.origin == 'string' && task.origin == 'audio_file'){
				await window.load_meeting_notes_example('notes','\n',remove_file_extension(document_filename));
				created_new_file = true;
			}
			else{
				await window.load_meeting_notes_example('notes');
				created_new_file = true;
			}
	
			if(created_new_file && typeof current_file_name == 'string'){
				document_filename = current_file_name;
				//console.log("whisper_snippets_to_text: had to create an empty file. document_filename is now: ", document_filename);
		
			}
			else{
				console.error("whisper_snippets_to_text: quickly created a document, but current_file_name still wasn't a string: ", current_file_name);
			}

		}

		let all_segments_text = '';
		//let all_subtitle_text = '';
		//let all_segments_json = [];
		
		
		
		
		
		
		
		
		
		
		
		// Generate SUBTITLE file first
		
		
		//let subtitle_counter = 0;
		
		if(typeof task.origin == 'string' && task.origin.endsWith('file')){
			window.scribe_precise_sentences_count = 0;
		}
		
		
		
		
		
		
		
		//
		//  LOOP OVER SENTENCES FOR SUBTITLE CREATION
		//
		
		let merged_absolute_start_time = 0;
		if(typeof task.origin == 'string' && task.origin.endsWith('file')){
			// If it's a file transcription, using 0 as the absolute start time is fine
		}
		else if(typeof all_words[0] != 'undefined' && typeof all_words[0].absolute_start_time == 'number'){
			merged_absolute_start_time = all_words[0].absolute_start_time;
		}
		else{
			console.error("first word has no absolute start time?  all_words: ", all_words);
			return
		}
		
		
		in_meta = false;
		
		//console.log("going to turn sentences into subtitle: ", raw_sentences);
		
		for(let l = 0; l < raw_sentences.length; l++){
			
			if(visible_speaker_list.length && typeof raw_sentences[l].speaker_id == 'number' && visible_speaker_list.indexOf(raw_sentences[l].speaker_id) == -1){
				continue
			}
			
			if(typeof raw_sentences[l].absolute_start_time != 'number' || typeof raw_sentences[l].absolute_end_time != 'number'){
				console.error("sentence was missing absolute start or end time: ", raw_sentences[l]);
				continue
			}
				
			if(raw_sentences[l].absolute_start_time == raw_sentences[l].absolute_end_time){
				//console.error("whisper_snippets_to_text: subtitles: SKIPPING, sentence seems to have zero duration (likely meta sound): ", raw_sentences[l].text, raw_sentences[l]);
				//continue
			}
			
			const date_object = new Date(raw_sentences[l].absolute_start_time);
			

			//sentence_text += 'HH:MM:SS,Millis --> HH:MM:SS,Millis\n';
			if(typeof raw_sentences[l].words != 'undefined' && typeof raw_sentences[l].duration == 'number'){
				//console.log("should use words to quickly make short sentence chunks: ", raw_sentences[l].words, raw_sentences[l].text, raw_sentences[l].text.length);
				let relative_sentence_start_stamp = raw_sentences[l].absolute_start_time - merged_absolute_start_time;
				let relative_sentence_end_stamp = raw_sentences[l].absolute_end_time - merged_absolute_start_time;
				//let relative_sentence_duration = relative_sentence_end_stamp - relative_sentence_start_stamp;
				//console.log("CREATE SUBTITLE: relative_sentence_duration, text: ", raw_sentences[l].duration, raw_sentences[l].text);
				
				if(raw_sentences[l].duration/(raw_sentences[l].text.length/40) < 1){
					//console.warn("subtitle will be shown only very briefly: ", raw_sentences[l].text);
					//console.log("SPLIT OPTIONS: ", raw_sentences[l].text.length/40, raw_sentences[l].duration, " -> per second: ", raw_sentences[l].duration/(raw_sentences[l].text.length/40) );
				}

				let raw_text = raw_sentences[l].text;
				if(raw_text.startsWith(' ')){
					raw_text = raw_text.substr(1);
				}
				
				if(raw_text.trim().toUpperCase() != '[BLANK_AUDIO]' && raw_text.trim().toUpperCase() != '[ PAUSE ]' && raw_text.trim().toUpperCase() != '[ SILENCE ]'){
					if(raw_sentences[l].text.length < 25){
						//console.log("Nice, subtitle sentence is less than 25 characters: ", raw_sentences[l].text.length);
						//full_subtitle_text += add_subtitle_substring(raw_sentences[l], raw_sentences[l].text, relative_sentence_start_stamp, relative_sentence_end_stamp);
						//
					
						full_subtitle_text += create_subtitle_timestamp((raw_sentences[l].words[0].absolute_start_time - merged_absolute_start_time), (raw_sentences[l].words[ raw_sentences[l].words.length - 1 ].absolute_end_time - merged_absolute_start_time));
										
						if(typeof raw_sentences[l].type == 'string' && raw_sentences[l].type == 'sound'){
							if(raw_sentences[l].text.toLowerCase().indexOf('laugh') != -1){
								laugh_count++;
							}
							full_subtitle_text = full_subtitle_text + '<i>' + raw_text + '</i>';
						}
						else{
						
						
							if(typeof raw_sentences[l].type == 'string' && raw_sentences[l].type == 'speech' && typeof raw_sentences[l].speaker_name == 'string' && raw_sentences[l].speaker_name.length){
								full_subtitle_text = full_subtitle_text + '<v ' + raw_sentences[l].speaker_name + '>' + raw_text;
							}
							else if(typeof raw_sentences[l].type == 'string' && raw_sentences[l].type == 'singing' && typeof raw_sentences[l].speaker_name == 'string' && raw_sentences[l].speaker_name.length){
								full_subtitle_text = full_subtitle_text + '<v ' + raw_sentences[l].speaker_name + '>' + '♪ ' + raw_text;
							}
							else if(typeof raw_sentences[l].type == 'string' && raw_sentences[l].type == 'singing'){
								full_subtitle_text = full_subtitle_text + '♪ ' + raw_text;
							}
							else{
								//console.log("no type or speaker_name known for first sub-subtitle part of sentence: ", raw_text, raw_sentences[l]);
								full_subtitle_text += raw_text;
							}
						
						}
						full_subtitle_text += '\n\n';
						//let optimal_substring_count = raw_sentences[l].text.length/40;
						//const time_per_substring = raw_sentences[l].duration/optimal_substring_count; 
						//console.warn("should split this sentence into multiple sentences.  optimal_substring_count, time_per_substring: ", optimal_substring_count, time_per_substring);
					}
					else{
					
					
						let sentence_pairs = [];
					
					
					
					
					
						//console.log("subtitle sentence is long. has to be split into multiple parts: ", raw_sentences[l].text);
						let optimal_substring_count = raw_sentences[l].text.length/40;
						const time_per_substring = raw_sentences[l].duration/optimal_substring_count; 
						//console.warn("should split this sentence into multiple sentences.  optimal_substring_count, time_per_substring: ", optimal_substring_count, time_per_substring);
					
						let next_substring = '';
						let next_absolute_start_time = raw_sentences[l].words[0].absolute_start_time; // - merged_absolute_start_time;
						let sub_sentence_absolute_end_time = raw_sentences[l].words[0].absolute_end_time;
						//let previous_end_time = next_start_time;
						//let next_end_time = sentence_start_stamp;
						let top_half = '';
						let bottom_half = '';
						let top_half_done = false;
						let first_cut = true;
						let shortest_duration = null;
						//console.log("subtitle duration - - - - -");
						//else if(raw_sentences[l].type == 'speech' && typeof raw_sentences[l].text.speaker_name == 'string' && raw_sentences[l].text.speaker_name.length){
							//text = '<v ' + sentence.speaker_name + '>' + text;
						//}
					
						for (let w = 0; w < raw_sentences[l].words.length; w++) {
							//console.log("w: ", w + 1, raw_sentences[l].words.length);
						
							if(top_half_done == false && top_half.length + raw_sentences[l].words[w].text.replace('.','').length < 25){
								top_half += raw_sentences[l].words[w].text;
								if(top_half.startsWith(' ')){
									top_half = top_half.substr(1);
								}
								//console.log("growing top half: ", top_half);
								sub_sentence_absolute_end_time = raw_sentences[l].words[w].absolute_end_time;
							}
							else if(bottom_half.length + raw_sentences[l].words[w].text.replace('.','').length < 25){
								top_half_done = true;
								bottom_half += raw_sentences[l].words[w].text;
								if(bottom_half.startsWith(' ')){
									bottom_half = bottom_half.substr(1);
								}
								//console.log("growing bottom half: ", top_half);
								sub_sentence_absolute_end_time = raw_sentences[l].words[w].absolute_end_time;
							}
							else{
								//console.log("top and bottom part of subtitle done");

								if(typeof raw_sentences[l].type == 'string' && raw_sentences[l].type == 'speech' && typeof raw_sentences[l].speaker_name == 'string' && raw_sentences[l].speaker_name.length){
									top_half = '<v ' +  raw_sentences[l].speaker_name + '>' + top_half;
								}
								else{
									//console.log("no type or speaker_name known for first sub-subtitle part of sentence: ", raw_sentences[l].text, raw_sentences[l]);
								}
							
								sentence_pairs.push({
										'top':top_half,
										'bottom':bottom_half,
										'relative_start_time':next_absolute_start_time - merged_absolute_start_time,
										'relative_end_time':sub_sentence_absolute_end_time - merged_absolute_start_time
								})
							
								let subtitle_duration = sub_sentence_absolute_end_time - next_absolute_start_time;
								//console.log("subtitle duration: ", subtitle_duration);
								if(shortest_duration == null || (typeof shortest_duration == 'number' && subtitle_duration < shortest_duration)){
									//console.log("subtitle_duration is shorter: ", subtitle_duration, shortest_duration);
									shortest_duration = subtitle_duration;
								}
								
								top_half_done = false;
								top_half = raw_sentences[l].words[w].text;
								bottom_half = '';
								next_absolute_start_time = raw_sentences[l].words[w].absolute_start_time;
								//sub_sentence_absolute_end_time = raw_sentences[l].words[w].absolute_end_time;
							}

						}
						if(top_half.trim() != ''){
						
							if(top_half.startsWith(' ')){
								top_half = top_half.substr(1);
							}
							if(bottom_half.startsWith(' ')){
								bottom_half = bottom_half.substr(1);
							}
						
							if( !top_half.startsWith('<') && typeof raw_sentences[l].type == 'string' && raw_sentences[l].type == 'speech' && typeof raw_sentences[l].speaker_name == 'string' && raw_sentences[l].speaker_name.length){
								top_half = '<v ' +  raw_sentences[l].speaker_name + '>' + top_half;
							}
						
							sentence_pairs.push({
									'top':top_half,
									'bottom':bottom_half,
									'relative_start_time':next_absolute_start_time - merged_absolute_start_time,
									'relative_end_time':sub_sentence_absolute_end_time - merged_absolute_start_time
								})
							
							let subtitle_duration = sub_sentence_absolute_end_time - next_absolute_start_time;
							//console.log("subtitle duration: ", subtitle_duration);
							if(shortest_duration == null || (typeof shortest_duration == 'number' && subtitle_duration < shortest_duration)){
								//console.log("subtitle duration is shorter: ", subtitle_duration, shortest_duration);
								shortest_duration = subtitle_duration;
							}
							
						}
					
					
						//let relative_sentence_start_stamp = raw_sentences[l].absolute_start_time - merged_absolute_start_time;
						//let relative_sentence_end_stamp = raw_sentences[l].absolute_end_time - merged_absolute_start_time;
						if(sentence_pairs.length){
						
							//console.log("subtitle duration: sentence_pairs.length: ", sentence_pairs.length);
							//console.log("shortest subtitle duration: ", shortest_duration);
							if(shortest_duration < 400){
								//console.log("shortest subtitle duration is very short indeed: ", shortest_duration);
							}
							let theoretical_average_duration = raw_sentences[l].duration/sentence_pairs.length;
							//console.log("theoretical average subtitle duration would be: ", theoretical_average_duration);
						
							let base_time = null;
							let time_to_distribute = null;
							let time_per_character = null;
							if(theoretical_average_duration > shortest_duration){ // this will pretty always be true if there is more than one sub-subtitle
								if(theoretical_average_duration > 500){
									base_time = 440;
									time_to_distribute = raw_sentences[l].duration - (sentence_pairs.length * 470);
									time_per_character = time_to_distribute / raw_sentences[l].text.length;
								}
								if(typeof base_time == 'number' && typeof time_per_character == 'number'){
								
									//console.error("sentence_pairs BEFORE: ", JSON.stringify(sentence_pairs,null,2));
								
									let relative_sentence_distribution_start_time = sentence_pairs[0].relative_start_time;
									let last_loop_relative_end_time = sentence_pairs[0].relative_start_time;
									for(let sp = 0; sp < sentence_pairs.length; sp++){
										if(sp > 0){
											sentence_pairs[sp].relative_start_time = last_loop_relative_end_time + 20;
										}
										sentence_pairs[sp].relative_end_time = sentence_pairs[sp].relative_start_time + (450 + (sentence_pairs[sp].top.length * time_per_character) + (sentence_pairs[sp].bottom.length * time_per_character));
								
										last_loop_relative_end_time = sentence_pairs[sp].relative_end_time;
									}
								
									//console.error("sentence_pairs AFTER: ", JSON.stringify(sentence_pairs,null,2));
								}
							
							}
						
						
							for(let sp = 0; sp < sentence_pairs.length; sp++){
							
								full_subtitle_text += create_subtitle_timestamp( sentence_pairs[sp].relative_start_time, sentence_pairs[sp].relative_end_time);
							
								full_subtitle_text += sentence_pairs[sp].top;
								if(sentence_pairs[sp].bottom != ''){
									full_subtitle_text += '\n';
									full_subtitle_text += sentence_pairs[sp].bottom;
								}
						
								//full_subtitle_text += "\n<<-+-+-+tail end\n";
								full_subtitle_text += '\n\n';
							}
						
						}
					
					}
					
				}
				
			}
			
		}
		
		
		
		
		
		// Transcription statistics
		
		// task.music_spotted
		
		if(typeof task.index == 'number'){
			
			let transcription_stats_el = document.querySelector('#transcription-stats-container' + task.index);
			if(transcription_stats_el){
				transcription_stats_el.innerHTML = '';
				
				let stats_el = document.createElement('div');
				stats_el.classList.add('transcription-stats-inner-container');
				
				let stats = {};
				let laughs_per_minute = null;
				
				if(typeof task.origin == 'string' && task.origin.endsWith('file')){
					//console.log("laugh_count: ", laugh_count);
					if(laugh_count > 0){
						if(typeof task.recording_start_time == 'number' && typeof task.recording_end_time == 'number'){
							let file_duration = task.recording_end_time - task.recording_start_time;
							if(typeof file_duration == 'number' && file_duration != 0){
								//console.log("stats: file_duration: ", file_duration);
								let minutes = file_duration / 60000;
								stats['laughs_per_minute'] = Math.round((minutes / laugh_count) * 10) / 10;
							}
							
						}
						else{
							//console.log("scribe stats:  task did not have recording beginning and ending timestamp: ", task);
						}
					}
					else{
						//console.log("scribe stats:  there were no laughs: ", task);
						//stats['laughs_per_minute'] = 0;
					}
				}
				
				//console.log("stats: ", stats);
				
				if(Object.keys(stats).length){
					for (let [key, value] of Object.entries(stats)) {
						
						let stats_item_el = document.createElement('div');
						stats_item_el.classList.add('flex-between');
						
						let stats_label_el = document.createElement('span');
						stats_label_el.classList.add('transcription-stats-label');
						stats_label_el.textContent = window.get_translation(key);
						
						let stats_value_el = document.createElement('span');
						stats_value_el.classList.add('transcription-stats-value');
						if(typeof value == 'boolean'){
							if(value == true){
								stats_value_el.textContent = '☑️'
							}
							else{
								stats_value_el.textContent = '_'
							}
						}
						else{
							stats_value_el.textContent = value;
						}
						
						stats_item_el.appendChild(stats_label_el);
						stats_item_el.appendChild(stats_value_el);
						
						stats_el.appendChild(stats_item_el);
					}
					
					transcription_stats_el.appendChild(stats_el);
					
				}
				
				
			}
		}
		
		
		
		
		
		
		
		//console.log("full_subtitle_text: ", full_subtitle_text);
		// save subtitle in meta
		
		
		
		
		// TODO: save a generic text to generic file transcription meta
		
		
		//console.log("subtiel: document_filename: ", document_filename);
		//console.log("subtiel: full_subtitle_text: ", full_subtitle_text);
		if( document_filename.toLowerCase().endsWith('.vtt') || document_filename.toLowerCase().endsWith('.srt') ){
			
			//console.log("subtiel: working on a VTT or SRT file.  document_filename,task: ", document_filename, task);
			
			/*
			// Save subtitle to video file meta
			if(typeof full_subtitle_text == 'string' && full_subtitle_text.trim() != ''){
				//console.log("saving full_subtitle_text to file meta?: ", full_subtitle_text, task);
			
				if(typeof task.origin == 'string' && task.origin.endsWith('file')){
					if(typeof task.origin_file != 'undefined' && task.origin_file != null && typeof task.origin_file.folder == 'string' && typeof task.origin_file.filename == 'string'){
						//console.log("saving generated subtitle in file meta")
						save_file_meta('subtitle', full_subtitle_text, task.origin_file.folder, task.origin_file.filename);
				
						if(task.origin_file.folder == folder && task.origin_file.filename == current_file_name && document.getElementById('media-player') != null){
							//console.log("should update the video description/subtitle, as it's currently visible");
							add_overlay_description(full_subtitle_text,'subtitle');
						}
					}
				}
			}
			*/
			
			/*
			if(typeof task.origin == 'string' && task.origin.endsWith('file')){
				if(typeof task.origin_file != 'undefined' && task.origin_file != null && typeof task.origin_file.folder == 'string' && typeof task.origin_file.filename == 'string'){
					save_file_meta('subtitle',full_subtitle_text,task.origin_file.folder,task.origin_file.filename);
			
					if(task.origin_file.folder == folder && task.origin_file.filename == current_file_name && document.getElementById('media-player') != null){
					//console.log("should update the video description/subtitle");
						add_overlay_description(full_subtitle_text);
					}
				}
			
				if(document_filename.toLowerCase().endsWith('.vtt')){
					window.insert_into_document(task, full_subtitle_text, {'position':'overwrite'});
				}
				else if(document_filename.toLowerCase().endsWith('.srt')){
					window.insert_into_document(task, window.vtt_to_srt(full_subtitle_text), {'position':'overwrite'});
				}
				
			}
			else{
				if(document_filename.toLowerCase().endsWith('.vtt')){
					window.insert_into_document(task, full_subtitle_text, {'position':'end','fix_overlap':true}); // could just do this automatically in insert_into_document if the document is .srt or .vtt
				}
				else if(document_filename.toLowerCase().endsWith('.srt')){
					
					// TODO: must figure out a way to make the SRT index continuous. Maybe just go over the entire document and redo it?
					window.insert_into_document(task, window.vtt_to_srt(full_subtitle_text), {'position':'end','fix_overlap':true});
					
					// TODO Fix SRT indexes now
					
				}
			}
			*/
			if(typeof task.origin_file != 'undefined' && task.origin_file != null && typeof task.origin_file.folder == 'string' && typeof task.origin_file.filename == 'string'){
				//console.log("saving subtitle to file meta of origin file: ", task.origin_file);
				save_file_meta('subtitle',full_subtitle_text,task.origin_file.folder,task.origin_file.filename);
				if(typeof task.file != 'undefined' && task.file != null){
					save_file_meta('subtitle_file',task.file,task.origin_file.folder,task.origin_file.filename);
				}
				if(task.origin_file.folder == folder && task.origin_file.filename == current_file_name && document.getElementById('media-player') != null){
					//console.log("should also update the video description/subtitle, since the origin file is currently open");
					add_overlay_description(full_subtitle_text);
				}
			}
		
			if(document_filename.toLowerCase().endsWith('.vtt')){
				//console.log("inserting full_subtitle into .vtt document");
				window.insert_into_document(task, full_subtitle_text, {'position':'overwrite'});
			}
			else if(document_filename.toLowerCase().endsWith('.srt')){
				//console.log("inserting full_subtitle into .srt document");
				window.insert_into_document(task, window.vtt_to_srt(full_subtitle_text), {'position':'overwrite'});
			}
			else{
				console.error("impossible? document_filenam changed to non-subtitle: ", document_filename);
			}
			window.last_subtitle_end_time = 0;
			return
		}
		
		
		
		
		
		// DUMP JSON TO FILE - If a media file is being transcribed, and the destination is a JSON document, then just dump the sentences array into it.
		else if(document_filename.toLowerCase().endsWith('.json')){
			
			if(typeof task.origin_file != 'undefined' && task.origin_file != null && typeof task.origin_file.filename == 'string' && typeof full_subtitle_text == 'string' && full_subtitle_text.length){
				save_file_meta('subtitle',full_subtitle_text,task.origin_file.folder,task.origin_file.filename);
			}
			
			window.insert_into_document(task, JSON.stringify(raw_sentences,null,4), {'position':'overwrite'});
			
			window.last_subtitle_end_time = 0;
			return
			
		}
		else{
			
			//console.log("NOW FOR THE HARD PART");
			//console.log("raw_sentences: ", raw_sentences)
			
			// THE HARD PART
			//console.log("add_timestamps: ", add_timestamps);
			
			if(typeof task.origin == 'string' && task.origin.endsWith('file')){
				time_scribe_started = 0;
			}
			
			
			let speaker_segment = '';
			//let previous_speaker_id = null;
			for(let l = 0; l < raw_sentences.length; l++){
			
				
				if(visible_speaker_list.length && typeof raw_sentences[l].speaker_id == 'number' && visible_speaker_list.indexOf(raw_sentences[l].speaker_id) == -1){
					continue
				}
				
				let note_time = '';
				let segment_text = '';
				let sentence_text = '';
				let speaker_name = '';
				
				let consent = false;
				if(typeof raw_sentences[l].consent == 'boolean'){
					consent = raw_sentences[l].consent;
				}
				
				let newlines_spacing = '';
				//if(segment_text != '' && add_timestamps != 'Detailed'){
				//	newlines_spacing = '\n\n';
				//}
				
				// Prepare timestamp string
				if(typeof add_timestamps == 'string' && add_timestamps != 'None'){
					//console.log("STT done, and assistant is scribe");
					
					let date_object = null;

					if(typeof raw_sentences[l].absolute_start_time == 'number'){
						date_object = new Date(raw_sentences[l].absolute_start_time);
					}
					else if(typeof task.origin == 'string' && !task.origin.endsWith('file')){
						date_object = new Date();
					}
					/*
					else if(typeof task.timestamp == 'number'){
						date_object = new Date(task.timestamp);
						//console.log("STT_done, and assistant is scribe: set date_object from task timestamp: ", date_object);
					}
					*/


					// TODO: allow laughter and applause meta-sentences of temporal space permits? Maybe force those to be short? Or switch to .vtt as the main subtitle format, and place them in a different location
					
					
					// If at least a minute has passed, add a timestamp
					
					if(add_timestamps == 'Precise' && typeof time_scribe_started == 'number'){
						note_time = create_subtitle_timestamp( (raw_sentences[l].absolute_start_time - time_scribe_started), (raw_sentences[l].absolute_end_time - time_scribe_started));
					}
					else if(date_object != null){
						note_time = window.create_scribe_timestamp(date_object,time_scribe_started,add_timestamps);
					}
			

					let sentence_text = '';
					let sentence_json = {};


					//console.log("whisper_snippets_to_text: SENTENCE: ", window.scribe_precise_sentences_count, raw_sentences[l]);
					//let item = window.scribe_precise_sentences_count + '\n';




					//
					//   J S O N
					//
					
					/*
					
					if(document_filename.endsWith('.json')){

						window.scribe_precise_sentences_count++;

						sentence_json = raw_sentences[l];
						
						if(typeof raw_sentences[l].speaker_id == 'string'){
							sentence_json['speaker_id'] = raw_sentences[l].speaker_id;
						}
						if(typeof raw_sentences[l].speaker_name == 'string'){
							sentence_json['speaker_name'] = raw_sentences[l].speaker_name;
						}
						if(typeof raw_sentences[l].match_percentage == 'number'){
							sentence_json['voice_match_percentage'] = raw_sentences[l].match_percentage;
						}
						sentence_json['count'] = window.scribe_precise_sentences_count;
						
						// STRINGIFY JSON
						sentence_text = JSON.stringify(sentence_json,null,4);
						if(sentence_text.endsWith('\n')){
							sentence_text = sentence_text.substr(0,sentence_text.length-1);
						}
						let split_json = sentence_text.split('\n');
						for(let sj = 0; sj < split_json.length; sj++){
							split_json[sj] = '    ' + split_json[sj];
						}
						sentence_text = split_json.join('\n');
		
		
						sentence_text = '\n' + sentence_text;
						if(typeof window.doc_text == 'string' && window.doc_text != '[]'){
							//sentence_text = ',' + sentence_text;
						}

						console.warn(" > > > > adding transcription sentence_text to JSON: ", sentence_text);
						all_segments_text = all_segments_text + sentence_text + ',';

					}
	
					*/
			
			
					if(typeof raw_sentences[l].absolute_start_time == 'number' && typeof raw_sentences[l].absolute_end_time == 'number' && typeof time_scribe_started == 'number'){
						//console.log("creating subtitle time, with start: ", raw_sentences[l].absolute_start);
						if(typeof raw_sentences[l].type == 'string' && raw_sentences[l].type == 'sound' && (raw_sentences[l].text.toLowerCase().indexOf('laugh') == -1 && raw_sentences[l].text.toLowerCase().indexOf('applause') == -1 && raw_sentences[l].text.toLowerCase().indexOf('music') == -1)){
							//console.warn("whisper_snippets_to_text: subtitles: skipping meta sound that is not laughter, music or applause: ", raw_sentences[l].text);
							continue
						}
						
						if(raw_sentences[l].absolute_start_time == raw_sentences[l].absolute_end_time){
							console.error("whisper_snippets_to_text: subtitles: sentence seems to have zero duration: ", raw_sentences[l].text, raw_sentences[l]);
							//continue
						}

					}
					else{
						console.error("add_timestamps was not a string: ", add_timestamps);
						//console.error("subtitles: missing data? ", typeof raw_sentences[l].absolute_start_time, typeof raw_sentences[l].absolute_end_time, typeof time_scribe_started, time_scribe_started);
					}
			
				}

				// .NOTES (and other extensions)

				if(!document_filename.endsWith('.json') && !document_filename.endsWith('.srt') && !document_filename.endsWith('.vtt') ){

					let speaker_changed = false;
			
					// Unknown speaker, so reset window.last_verified_speaker;
					if(typeof raw_sentences[l].speaker_id == 'undefined' || raw_sentences[l].speaker_id == null){
						if(typeof raw_sentences[l].speaker_id != 'undefined'){
							window.last_verified_speaker = raw_sentences[l].speaker_id;
						}
						else{
							window.last_verified_speaker = null;
						}
						speaker_changed = true;
					}
					else if(typeof raw_sentences[l].speaker_id != 'undefined' && window.last_verified_speaker != raw_sentences[l].speaker_id){
						window.last_verified_speaker = raw_sentences[l].speaker_id;
						speaker_changed = true;
					}
					/*
					//console.log("testo:  note_time: ", note_time);
					//console.log("testo:  speaker_segment so far: ", speaker_segment);
					//console.log("testo:  raw_sentences[l].text: ", raw_sentences[l].text);
					//console.log("testo:  window.last_verified_speaker: ", window.last_verified_speaker);
					//console.log("testo:  speaker_changed: ", speaker_changed);
					*/
					
					if(speaker_changed || add_timestamps == 'Detailed' || add_timestamps == 'Precise'){
						
						// insert prevous speaker segment into document
						merged_transcript = merged_transcript + speaker_segment + '\n\n';
						
						
						// start with a new speaker segment;
						speaker_segment = '';
						
						// Add a new timestamp to the beginning of the segment
						if((typeof note_time == 'string' && note_time != '' && note_time != window.previous_note_time) || add_timestamps == 'Detailed' || add_timestamps == 'Precise'){
							//console.log("whisper_snippets_to_text: window.previous_note_time: ", window.previous_note_time, " -> ", note_time);
							window.previous_note_time = '' + note_time;
							//console.log("testo: adding timestamp to speaker_segment: ", note_time);
							speaker_segment += note_time;
						}
						
						let redacted_speaker_name = '';
						if(typeof raw_sentences[l].speaker_id == 'number'){
							redacted_speaker_name = window.get_translation('speaker_name') + ' ' + raw_sentences[l].speaker_id;
						}
						
						
						// create appropriate speaker segment header
						if(window.settings.assistants['scribe'].privacy_level == 'Medium'){
							
							if(consent === true || (typeof task.origin == 'string' && task.origin.endsWith('file'))){
								//console.log("privacy level medium, and consent is true, or this is a file transcription. raw_sentences[l].speaker_name: ", raw_sentences[l].speaker_name);
								if(typeof raw_sentences[l].speaker_name == 'string'){
									speaker_segment = newlines_spacing + speaker_segment + raw_sentences[l].speaker_name + ': ';
								}
								else if(typeof raw_sentences[l].speaker_id == 'number'){
									speaker_segment = newlines_spacing + speaker_segment + redacted_speaker_name + ': ';
								}
								
							}
							else if(consent === false){
								//console.log("privacy level medium, and consent is false. Showing 'Speaker #' as speaker name instead of: ", raw_sentences[l].speaker_name);
								if(typeof raw_sentences[l].speaker_id == 'number'){ // typeof raw_sentences[l].verification != 'undefined' && 
									
									
									if(typeof task.origin == 'string' && task.origin.endsWith('file') && typeof task.index == 'number'){
										let name_input_el = document.querySelector('#speaker-list-item-name-input' + task.index + '-' + raw_sentences[l].speaker_id);
										//console.log("found speaker name input element for this task+speaker_id combination:  #speaker-list-item-name-input" + task.index + '-' + raw_sentences[l].speaker_id);
										if(name_input_el && name_input_el.value != redacted_speaker_name){
											redacted_speaker_name = name_input_el.value;
										}
									}
									
									speaker_segment = newlines_spacing + speaker_segment + redacted_speaker_name + ': ';
								}
								else{
									speaker_segment = newlines_spacing + speaker_segment;
								}
								
								if(document_filename.endsWith('.notes') && window.settings.tutorial.ask_voice_consent == false && (window.innerWidth < 641 || document.body.classList.contains('chat-shrink'))){
									window.settings.tutorial.ask_voice_consent = true;
									save_settings();
									speaker_segment = speaker_segment + ". " + window.get_translation('Ask_the_speaker_to_say_I_consent_to_recording_my_voice');
								}
							}
						}
						else if(window.settings.assistants['scribe'].privacy_level == 'High'){
							if(consent == false){
								speaker_segment += window.get_translation('Redacted_no_consent');
						
								//if(speaker_consent_hint_given == false && (window.innerWidth < 641 || document.body.classList.contains('chat-shrink'))){
								//	speaker_consent_hint_given = true;
								//	speaker_segment = speaker_segment + ". " + window.get_translation('Ask_the_speaker_to_say_I_consent_to_recording_my_voice');
								//}
						
								if(document_filename.endsWith('.notes') && typeof window.settings.tutorial.ask_voice_consent == 'boolean' && window.settings.tutorial.ask_voice_consent == false && (window.innerWidth < 641 || document.body.classList.contains('chat-shrink'))){
									window.settings.tutorial.ask_voice_consent = true;
									save_settings();
									speaker_segment = speaker_segment + ". " + window.get_translation('Ask_the_speaker_to_say_I_consent_to_recording_my_voice');
								}
								speaker_segment = newlines_spacing + speaker_segment + '\n\n';
							}
							else if(typeof raw_sentences[l].speaker_name == 'string'){
								speaker_segment = newlines_spacing + speaker_segment + raw_sentences[l].speaker_name + ': ';
							}
							else if(typeof raw_sentences[l].speaker_id == 'number'){
								speaker_segment = newlines_spacing + speaker_segment + redacted_speaker_name + ': ';
							}
						}
					}
					
					
					if(window.settings.assistants['scribe'].privacy_level == 'High' && consent == false){
						// Do not add
					}
					else{
						if(speaker_segment == '' || speaker_segment.endsWith('\n')){
							if(raw_sentences[l].text.startsWith(' ')){
								raw_sentences[l].text = raw_sentences[l].text.substr(1);
							}
						}
						speaker_segment += raw_sentences[l].text;
					}
					
					
						
						
						
					/*
					if(segment_text != ''){

						if((speaker_changed && typeof note_time == 'string' && note_time != '' && note_time != window.previous_note_time) || add_timestamps == 'Detailed'){
	
							//console.log("whisper_snippets_to_text: window.previous_note_time: ", window.previous_note_time, " -> ", note_time);
							window.previous_note_time = '' + note_time;
	
							//note = note_time + '\n\n' + note;
							segment_text = '\n\n' + note_time + segment_text;
							//console.log("segment_text is now: ", segment_text);
						}

						if(all_segments_text != ''){
							all_segments_text += '\n\n';
						}
				
						if(window.settings.settings_complexity == 'developer'){
							if(s < transcript.segments.length - 1){
								//segment_text = segment_text + '\n\n__' + s + '\n-----------> NEXT SEGMENT! ------> \n__' + (s + 1) +  '\n\n';
							}
					
						}
				
						all_segments_text = all_segments_text + segment_text;
					}
					*/
			
				}
		
		
		
			}
			
			
			
			if(speaker_segment != ''){
				//console.log("should insert last left-over segment");
				merged_transcript = merged_transcript + speaker_segment + '\n\n';
			}
		}
		
		
		
		
	}
	
	
	
	
	
	/*
	if(window.settings.settings_complexity == 'developer'){
		//merged_transcript +=  '\n\n\n========> END <=========\n\n';
		merged_transcript.replaceAll('>> ','\n\n\n>> ');
	}
	else{
		merged_transcript.replaceAll('>> ','\n\n\n');
	}
	*/
	
	//console.log("\n\n|\n||\n|||\n\nmerged_transcript: ", merged_transcript, "\n\nfull_subtitle_text:\n", full_subtitle_text);
	
	if(
		typeof task.file != 'undefined' && 
		task.file != null && 
		typeof task.file.filename == 'string' && 
		task.file.filename.length
	){
		//console.log("At the end. should insert merged transcript into document: ", merged_transcript.substr(0,100) + "..."); 
		
		/*
		if(window.settings.settings_complexity == 'developer'){
			//console.log("inserting with ---SNIP ---");
			window.insert_into_document(task, merged_transcript + "\n\n---------- SNIP -----------\n\n", {'position':'end'});
			
			if(
				typeof task.origin_file != 'undefined' && 
				task.origin_file != null && 
				typeof task.origin_file.filename == 'string' && 
				task.origin_file.filename.length
			){
				// Save description in meta
				if(typeof merged_transcript == 'string' && merged_transcript.trim() != ''){
					save_file_meta('audio_to_text_description',merged_transcript,task.origin_file.folder,task.origin_file.filename);
				}
		
			}
			
			
		}
		else 
		*/
		/*
		if(task.origin == 'voice'){
			//console.log("at the end, and trancscribed a voice task. Inserting at the end: ", task, merged_transcript.substr(0,100));
			window.insert_into_document(task, merged_transcript, {'position':'end'});
		}
		else{
			//console.log("at the end, overwriting: ", task, merged_transcript.substr(0,100));
			window.insert_into_document(task, merged_transcript, {'position':'overwrite'});
			
			if(
				typeof task.origin_file != 'undefined' && 
				task.origin_file != null && 
				typeof task.origin_file.filename == 'string' && 
				task.origin_file.filename.length
			){
				// Save description in meta
				if(typeof merged_transcript == 'string' && merged_transcript.trim() != ''){
					save_file_meta('audio_to_text_description',window.strip_timestamps(merged_transcript),task.origin_file.folder,task.origin_file.filename);
				}
		
				// save subtitle in meta
				//console.log("saving merged_subtitle to file meta: ", merged_subtitle);
				//if(typeof merged_subtitle == 'string' && merged_subtitle.trim() != ''){
				//	save_file_meta('subtitle',merged_subtitle,task.origin_file.folder,task.origin_file.filename);
				//}
			}
		}
		*/
		
		
		// Store file_to_text result
		/*
		if(typeof window.task_queue[t].file != 'undefined' && typeof window.task_queue[t].origin == 'string' && window.task_queue[t].origin.endsWith('file') && typeof result == 'string' && result != ''){ //get_translation('Write_a_detailed_description_of_this_image')){
			//console.log("the stt result seems to be a transcription of a saved file, and the task has a file: ", window.task_queue[t].file);
			if(typeof window.task_queue[t].origin_file != 'undefined' && window.task_queue[t].origin_file != null && typeof window.task_queue[t].origin_file.filename == 'string' && typeof window.task_queue[t].origin_file.folder == 'string'){ // && typeof files[window.task_queue[t].file.filename] != 'undefined'
				//console.log("saving audio_to_text_description to file meta");
				if(typeof window.task_queue[t].parent_index == 'undefined'){
					if(window.filename_is_audio(window.task_queue[t].origin_file.filename)){
						save_file_meta('audio_to_text_description',result,window.task_queue[t].origin_file.folder,window.task_queue[t].origin_file.filename);
					
						// TODO: a bit of code doubling, Could create a function to add description to playground overlay instead
						add_overlay_description(result,'audio_to_text_description');
					}
					else if(window.filename_is_video(window.task_queue[t].origin_file.filename)){
						save_file_meta('subtitle',result,window.task_queue[t].origin_file.folder,window.task_queue[t].origin_file.filename);
					
						// TODO: a bit of code doubling, Could create a function to add description to playground overlay instead
						add_overlay_description(result,'subtitle');
					}
					
				}
				
			}
		}
		*/
		
		
		
		//console.log("at the end, overwriting: ", task, merged_transcript.substr(0,100));
		window.insert_into_document(task, merged_transcript, {'position':'overwrite'});
		
		if(
			typeof task.origin_file != 'undefined' && 
			task.origin_file != null && 
			typeof task.origin_file.filename == 'string' && 
			task.origin_file.filename.length
		){
			// Save description in meta
			if(typeof merged_transcript == 'string' && merged_transcript.trim() != ''){
				save_file_meta('audio_to_text_description',window.strip_timestamps(merged_transcript),task.origin_file.folder,task.origin_file.filename);
				if(typeof current_file_name == 'string' && window.filename_is_audio(task.origin_file.filename) && task.origin_file.filename == current_file_name){
					add_overlay_description(merged_transcript,'audio_to_text_description');
				}
			}
			
			// save subtitle in meta
			//console.log("saving merged_subtitle to file meta: ", merged_subtitle);
			//if(typeof merged_subtitle == 'string' && merged_subtitle.trim() != ''){
			//	save_file_meta('subtitle',merged_subtitle,task.origin_file.folder,task.origin_file.filename);
			//}
		}
		
	}
	
}
window.whisper_snippets_to_text = whisper_snippets_to_text;








function create_whisper_options(task=null,language=null,target_language=null){

	let segmentation = false;
	if(task != null && typeof task.assistant == 'string' && task.assistant == 'scribe'){
		segmentation = true;
	}
	else if(window.settings.assistant == 'scribe'){
		segmentation = true;
	}
	
	let quantized = null;


	let options = {

	    // Greedy
	    top_k: 0,
		do_sample: false,

		// Sliding window
		chunk_length_s:30,
		stride_length_s:5,

		//language: 'en',
        //task: 'transcribe',

		return_timestamps: 'word', //true, //'word', //'word', // true for Scribe
		force_full_sequences: false,

	};



	let model = "onnx-community/whisper-base";

	if(window.ram > 0 && window.ram < 3000){
		//options['quantized'] = true;
	}

	if(window.is_mobile == true){
		//options['quantized'] = true;
	}



	/*
	// There is a distil-mediun available, it might be interesting for systems with lots of ram
	if(window.ram > 11000){
		model = "onnx-community/whisper-small";
	}
	else 
	
	if(window.ram > 7000){
		model = "onnx-community/whisper-small";
	}
	
	else 
	*/
	if( window.ram > 4000){
		model = "onnx-community/whisper-base";
	}
	else{
		if(window.settings.settings_complexity == 'developer'){
			console.warn("dev: create_whisper_options: setting model to whisper_tiny because of low RAM");
		}
		model = "onnx-community/whisper-tiny";
	}
	

	if(window.is_mobile){
		//console.warn("create_whisper_options: setting model to whisper_tiny because is_mobile is true");
		model = "onnx-community/whisper-tiny";
	}
	else{
		//console.log("not mobile, so not forcing whisper_tiny");
	}
	//window.is_mobile = true;
	

	// TODO DEBUG
	//options['quantized'] = true;


	if(typeof window.settings.assistants['scribe'] != 'undefined' && typeof window.settings.assistants['scribe'].transcription_quality == 'string' && window.settings.assistants['scribe'].transcription_quality == 'Medium'){
		//console.log("scribe quality was set to low, using quantized (mobile) version");
		//quantized = true;
	}

	if(model != "onnx-community/whisper-tiny" && typeof window.settings.assistants['scribe'] != 'undefined' && typeof window.settings.assistants['scribe'].transcription_quality == 'string' && window.settings.assistants['scribe'].transcription_quality == 'Fast'){
		//console.log("scribe quality was set to low, using quantized (mobile) version");
		//quantized = true;
		//console.log("changing model to\n\n>>> TURBO >>>\n\n");
		model = 'onnx-community/whisper-large-v3-turbo';
	}


	language = 'en';
	

	if(language != 'en' || (window.settings.assistant == 'translator' && window.microphone_enabled)){ // could also be disabled, e.g. when doing a file transcription
		//console.log("forcing whisper to be multi-lingual since the assistant is translator and the microphone is enabled");
		options['multilingual'] = true;
		options['task'] = 'translate'; // subtask
		options['language'] = language;
	}

	if(typeof options['language'] == 'undefined' && model != 'onnx-community/whisper-large-v3-turbo'){
		model += ".en";
	}

	if(!model.endsWith('_timestamped')){
		model += "_timestamped";
		//console.log("added _timestamped to model name: ", model);
	}


	// Currently no distil whisper used, but could in future try distil medium.
	let isDistilWhisper = false;
	if(model.indexOf('distil') != -1){
		isDistilWhisper = true;
	}

    //options['chunk_length_s'] = window.is_mobile ? 20 : 30;
    //options['stride_length_s'] = window.is_mobile ? 3 : 5;
	
    options['chunk_length_s'] = isDistilWhisper ? 20 : 30;
    options['stride_length_s'] = isDistilWhisper ? 3 : 5;

	
	// TODO sliding window experiment: does this lower memory use on moble devices?
	/*
	if(typeof options['quantize'] == 'boolean' && options['quantize'] === true){
		options['chunk_length_s'] = 10;
		options['stride_length_s'] = 3;
	}
	*/

	// e.g. onnx-community/whisper-base.en_timestamped

	//console.log("create_whisper_options:  model, options: ", model, options);
	return {'model':model, 'quantized':quantized, 'options':options}
}


//
//  Send task with audio buffer to whisper worker
//
//
// Transformers.js demo:
// https://github.com/xenova/whisper-web/blob/main/src/hooks/useTranscriber.ts
//

async function do_whisper_web(task=null,language=null, target_language=null, preload=false){
	if(window.settings.settings_complexity == 'developer'){
		console.warn("dev: in do_whisper_web.  task,language,target_language,preload: ", task, language, target_language);
	}
	
	
	//console.error("TEMPORARY BLOCK OF DO_WHISPER_WEB");
	//return false
	/*
	if(task != null && typeof task.preload == 'boolean'){
		preload = task.preload;
	}
	*/
	
	//window.unload_llama_cpp();
	
	// DISABLING PRELOAD FOR NOW
	//preload = false;
	
	/*
	if(preload === true){
		//console.log("do_whisper_web:  doing a preload run");
		
		if(window.busy_loading_whisper == true){
			console.error("do_whisper_web: already busy preloading whisper");
			return false
		}
		
		if(window.whisper_worker_busy){
			console.error("do_whisper_web: was asked to do a preload, but window.whisper_worker_busy is true");
			return false
		}
		
		if(task == null){
			task = {'assistant':window.settings.assistant}
		}
		
		if(typeof task.recorded_audio == 'undefined'){
			console.warn("do_whisper_web: preload: setting fake audio");
			task['recorded_audio'] = new Float32Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
			task['recording_end_time'] = Date.now();
		}
		
		if(window.whisper_worker == null){
			//console.log("do_whisper_web: creating Whisper worker first");
		
			// create whisper worker
			window.busy_loading_whisper = true;
			create_whisper_worker();
			
		}
	
	}
	else {
		
		
	}
	*/
	
	if(task == null){
		console.error("do_whisper_web: no valid task provided. Aborting.");
		return false
	}
	if(window.whisper_worker_busy){
		console.error("do_whisper_web was called while whisper worker was busy. Aborting.");
		return false
	}
	if(typeof task.recorded_audio == 'undefined'){
		console.error("do_whisper_web: task did not contain recorded_audio. Aborting.");
		return false
	}
	if(task.recorded_audio.length < 1000){
		console.error("do_whisper_web: task had very short recorded_audio. Aborting.  task.recorded_audio.length: ", task.recorded_audio.length);
		return false
	}
	
	if(window.whisper_worker == null){
		
		console.error("do_whisper_web: window.whisper_worker was null. Have to create Whisper worker first - preload_whisper did not run? (likely file transcription)");
	
		// create whisper worker
		//window.whisper_worker_busy = true;
		//window.busy_loading_whisper = true;
		window.create_whisper_worker(); //this will set window.busy_loading_whisper to true
		await delay(100);
		//window.preload_whisper();
		task.state = 'should_stt';
		//window.handle_completed_task(task,null,{'state':'failed'})
		return false
	}
	
	window.whisper_worker_busy = true;
	task.state == 'doing_stt';
	
	last_whisper_task = task;
	
	let {model,quantized,options} = create_whisper_options(task,language,target_language);

	//console.log("do_whisper_web: model,quantized,options: ", model, quantized, options);

	if( 
		(
			task != null 
			&& typeof task.assistant == 'string'
			&& task.assistant == 'translator' 
			&& typeof task.output_language == 'string' 
			&& task.output_language == 'en' 
			&& typeof task.input_language == 'string' 
			&& task.input_language != 'en'
		) 
		|| 
		(
			typeof options['language'] == 'string' 
			&& options['language'] != 'en'  // options['language'] is only set if it's not english, so this is pretty much a given
			&& typeof target_language == 'string' 
			&& target_language == 'en'
		)
	){

		//console.log("do_whisper_web: setting task to directly translate");
		if(typeof options['language'] != 'string' && typeof task.input_language == 'string' && task.input_language != 'en'){
			options['language'] = task.input_language;
			options['task'] = 'translate';
			options['multilingual'] = true;
		}

		if(typeof target_language != 'string' && typeof task.output_language == 'string'){
			target_language = task.output_language
		}
		if(task != null && typeof target_language == 'string'){
			task['whisper_translated_to'] = target_language; // this value should still be there when it comes back from the worker. TODO: Won't this always be English? As far as I know it's the only language Whisper can live-translate to.
		}
	}
	
	//console.log("do_whisper_web: multilingual: ", multilingual);
	//console.log("do_whisper_web: subtask: ", subtask);
	//console.log("do_whisper_web: language: ", language);
	//console.log("do_whisper_web: model: ", model);
	//console.log("do_whisper_web: is_mobile: ", window.is_mobile);
	//console.log("do_whisper_web: quantized: ", quantized);
	//console.log("do_whisper_web: options: ", JSON.stringify(options,null,4));
	
	//console.log("do_whisper_web: sending audio to whisper worker: ", task.recorded_audio);
	
	let whisper_message = {
		'task':task,
		'model':model,
		'quantized':quantized,
		'options':options,
		/*
		'multilingual':multilingual,
		'quantized':quantized,
		//'subtask': multilingual ? subtask : null,
		'subtask':subtask, // always transcribe, as translation is handled separately
		//'language': multilingual && language !== "auto" ? language : null,
		'language': language,
		*/
		'mobile':window.is_mobile,
		'speaker_translation':window.capitalizeFirstLetter(get_translation('speaker_name')), // what the word 'Speaker' is in the current UI language. The whisper worker uses that to generate an initial name
	}
	/*
	if(preload === true){
		whisper_message['task']['preload'] = true;
		//whisper_message['action'] = 'preload';
	}
	*/
	/*
	setTimeout(()=>{
		
		//console.log("do_whisper_web: posted message to whisper_worker: ", whisper_message);
	},100);
	*/
	window.whisper_worker.postMessage(whisper_message);
	
	
	return true

}
window.do_whisper_web = do_whisper_web;



// clear Whisper's models from memory
let dispose_whisper_timeout = null;
function dispose_whisper(task=null,language=null){
	if(window.settings.settings_complexity == 'developer'){
		//console.log('dev: in dispose_whisper.  task,language: ', task, language);
	}
	
	if(window.whisper_worker != null){
	    window.whisper_worker.postMessage({
			'action':'dispose'
	    });
	}
	
	if(dispose_whisper_timeout != null){
		clearTimeout(dispose_whisper_timeout);
		dispose_whisper_timeout = null;
	}
	
	dispose_whisper_timeout = setTimeout(() => {
		//if(window.whisper_worker != null){
		if(window.whisper_loaded){
			console.error("dispose_whisper: had to forcefully kill whisper, as dispose seemingly took longer than a second");
			window.whisper_worker.terminate();
			window.whisper_worker = null;
			window.whisper_loaded = false;
			window.whisper_loading = false;
			window.busy_loading_whisper = false;
			window.whisper_worker_busy = false;
			
			let whisper_progress_message_el = document.querySelector('.message.pane-whisper.download-progress-chat-message');
			if(whisper_progress_message_el){
				whisper_progress_message_el.classList.add('fail');
				setTimeout(() => {
					whisper_progress_message_el.remove();
				},1000);
			}
			
			
		}
		dispose_whisper_timeout = null;
	},1000);
}
window.dispose_whisper = dispose_whisper;





async function preload_whisper(task=null,language=null,target_language=null){
	if(window.settings.settings_complexity == 'developer'){
		console.warn("dev: in preload_whisper.  task,language,target_language: ", task,language,target_language);
		console.warn("dev: - window.doing_low_memory_tts_chat_response: ", window.doing_low_memory_tts_chat_response);
	}
	
	if(window.doing_low_memory_tts_chat_response){
		console.error("preload_whisper called while still doing low_memmory_tts_chat_response");
		return false;
	}
	//console.error("PRELOAD WHISPER IS BLOCKED");
	//return
	
	/*
	if(window.busy_loading_whisper){
		console.error("preload_whisper: whisper seems to already be busy preloading");
		return false
	}
	*/
	
	
	
	/*
	if(window.stt_tasks_left > 0){
		console.error("preload_whisper: aborting: there is already an STT task ready to go, so preloading whisper offers no benefit");
		return false
	}
	*/
	
	
	//whisper_download_total_bytes = 0;
	/*
	if(task != null){
		task['preload'] = true;
	}
	*/
	
	
	if(window.whisper_worker == null){
		
		//window.busy_loading_whisper = true;
		
		//console.log("preload_whisper: creating Whisper worker first");
		try{
			create_whisper_worker();
			
			//console.log("\n\nOK\n\npreload_whisper: whisper worker should now be created: ", window.whisper_worker);
			return null
		}
		catch(err){
			console.error("caught error creating whisper worker: ", err);
			if(task != null){
				window.handle_completed_task(task,null,{'state':'failed'});
			}
			window.busy_loading_whisper = false;
			return false
			
		}
		
	}
	
	// TODO; small risk here of allowing things through when window.whisper_loaded is still false, but window.busy_loading_whisper is true
	else if(window.whisper_worker_busy || window.busy_loading_whisper || window.whisper_loaded ){
		console.error("preload_whisper:  aborting, whisper_worker exists, and seems busy, or busy loading, or is already loaded.   window.whisper_worker, window.whisper_worker_busy,window.busy_loading_whisper: ", window.whisper_worker, window.whisper_worker_busy, window.busy_loading_whisper);
		console.error("- window.whisper_loaded: ", window.whisper_loaded);
		console.error("- window.busy_loading_whisper: ", window.busy_loading_whisper);
		console.error("- window.whisper_worker_busy: ", window.whisper_worker_busy);
		return false
	}

	else{
		let preload_segmentation = false;
		if(task != null && typeof task.assistant == 'string' && task.assistant == 'scribe'){
			if(task.assistant == 'scribe'){
				preload_segmentation = true;
			}
		}
		else if(window.settings.assistant == 'scribe'){
			preload_segmentation = true;
		}
		
		const {model,quantized,options} = create_whisper_options(task,language,target_language);
		if(window.settings.settings_complexity == 'developer'){
			console.warn("dev: preload_whisper: model,quantized,options: ", model,quantized,options);
		}
		
		let whisper_models_seems_downloaded = false;
		for(let u = 0; u < window.cached_urls.length; u++){
			if(window.cached_urls[u].indexOf(model) != -1){
				whisper_models_seems_downloaded = true;
			}
		}
	
		window.busy_loading_whisper = true;
		//console.log("sending preload command to whisper worker");
		window.whisper_worker.postMessage({'action':'preload', 'preload_segmentation':preload_segmentation, 'model':model, 'quantized':quantized, 'options':options});

	}
	return true;
}
window.preload_whisper = preload_whisper;














//
//   TEXT TO SPEECH
//


let tts_worker_last_progress_update_time = 0;
let tts_files = {};
let previous_total_progress = 0;
let tts_previous_percentage = 0;
let tts_previous_percentage_timestamp = 0;

async function create_tts_worker(){
	//console.log("in create_tts_worker");
	
	if(window.tts_worker != null){
		console.error("create_tts_worker: worker already existed? terminating it..");
		window.tts_worker.terminate();
	}
	window.tts_worker = null;
	window.tts_worker = new Worker('./tts_worker.js', {
		type: 'module'
	});
	
	tts_worker_last_progress_update_time = 0;
	tts_files = {};
	previous_total_progress = 0;
	tts_previous_percentage = 0;
	tts_previous_percentage_timestamp = 0;
	
	let watchdog = setTimeout(() => {
		console.error("create_tts_worker timed out");
		//reject("create_tts_worker: timed out");
		return null
	},15000);
	
	//console.log("tts_module: window.tts_worker: ", window.tts_worker);

	window.tts_worker.addEventListener('message', async (e) => {
		//console.log("tts_module: received message from tts_worker: ", e.data);
		
		if(typeof e.data.status != 'string'){
			console.error("tts_worker: received message did not have a status string: ", e.data);
			return null
		}
		if(typeof e.data.status == 'string' && e.data.status == 'exists'){
			clearTimeout(watchdog);
			console.log("tts_worker now exists. Sending preload command");
			setTimeout(function() {
				window.tts_worker.postMessage({'action':'preload'});
			},100);
			
			//resolve("create_tts_worker: exists");
			return null
		}
		
		else if(e.data.status == 'initiate'){
			//console.log("TTS worker returned initiate message for: ", e.data.file);
		}
		
		else if(e.data.status == 'download'){
			//console.log("TTS worker returned download start message. e.data: ", e.data);
		}
		
		else if(e.data.status == 'progress'){
			//console.log("TTS worker returned download progress message.  file,progress: ", e.data.file, e.data.progress);
			/*
			if(typeof e.data.file == 'string' && typeof e.data.progress == 'number'){
				tts_files[e.data.file] = e.data;
			}
			const files_count = keyz(tts_files).length;
			if(files_count){
				//console.log("tts download progress: ", tts_files);
				let total_progress = Object.values(tts_files).reduce((a, b) => a + b, 0) / files_count;
				total_progress = total_progress / 100;
				
				let tts_progress_el = document.getElementById('download-progress-speaker');
				if(tts_progress_el == null){
					//console.error("TTS (down)load progress element is missing, adding it now");
					add_chat_message('current','speaker','download_progress#setting---');
				}
			
				if(tts_progress_el){
					//console.log("updating tts (down)load progress");
					tts_progress_el.value = total_progress;//e.data.progress;
					
					if(total_progress == 1){
						//console.log("tts_model seems to be 100% loaded");
						document.body.classList.add('tts-loaded'); // TODO is this used for anything?
					
						let download_progress_el = tts_progress_el.closest('.download-progress-chat-message');
						if(download_progress_el){
							download_progress_el.classList.add('download-complete-chat-message');
						}
						setTimeout(() => {
							download_progress_el.remove();
						},1000);
						//tts_progress_el.removeAttribute('id');
					}
				}
			}
			*/
			
			tts_files[e.data.file] = e.data;
			
			let total_bytes = 0;
			let loaded_bytes = 0;
			let tts_file_names = keyz(tts_files);
			if(tts_file_names.length > 6){
				for(let w = 0; w < tts_file_names.length; w++){
					if(typeof tts_files[tts_file_names[w]].total == 'number' && typeof tts_files[tts_file_names[w]].loaded == 'number'){
						total_bytes += tts_files[tts_file_names[w]].total;
						loaded_bytes += tts_files[tts_file_names[w]].loaded;
					}
				}
			}
			//console.log("TTS LOAD PROGRESS: total files: ", tts_file_names.length);
			//console.log("TTS LOAD PROGRESS: total bytes: ", total_bytes);
			if(total_bytes > 1000000){
				
				let tts_percentage = Math.floor((loaded_bytes / total_bytes) * 100);
			
				if(tts_previous_percentage > tts_percentage){
					console.log("TTS LOAD PROGRESS: resetting tts_previous_percentage to zero");
					tts_previous_percentage = 0;
				}
			
				if(tts_percentage > tts_previous_percentage){
					//console.log("TTS LOAD: "+ tts_percentage + "%");
					let tts_progress_el = document.getElementById('download-progress-speaker');
					if(tts_progress_el == null){
						console.error("tts (down)load progress element is missing. tts_percentage: ", tts_percentage);
						if(tts_percentage != 100){
							add_chat_message('speaker','speaker','download_progress#setting---');
						}
					}
					else{
						
						//console.log("updating tts (down)load progress: ", ((loaded_bytes / total_bytes) * 100) + "%");
						tts_progress_el.value = loaded_bytes / total_bytes; //e.data.progress / 100;
						
						if(loaded_bytes == total_bytes){
							//console.log("TTS fully loaded (loaded_bytes == total_bytes)"); // but might stilln
							tts_previous_percentage_timestamp = 0;
							tts_previous_percentage = 0;
							tts_files = {};
							/*
							tts_progress_el.closest('.message').classList.add('download-complete-chat-message');
							setTimeout(() => {
								tts_progress_el.closest('.message').remove();
							},1000);
							*/
							
							return;
						}
						
						//console.log("\n\ntts: download %: ", tts_percentage);
						
						if(tts_previous_percentage_timestamp == 0){
							//tts_previous_percentage_timestamp = Date.now();
						}
						else if(tts_percentage > 1){
						
							let tts_time_remaining_element = tts_progress_el.parentNode.querySelector('.time-remaining');
							if(tts_time_remaining_element){
								const delta = Date.now() - tts_previous_percentage_timestamp;
								//console.log("tts_progress: time it took for 1% progress: ", delta);
								const percent_remaining = 100 - tts_percentage;
								//console.log("tts_download_progress: seconds remaining: ", (percent_remaining * delta) / 1000);
								//tts_time_remaining_element.innerHTML = '<span></span>';
						
								let time_remaining = (percent_remaining * delta)/1000;
								//console.log("tts load time_remaining: ", time_remaining);
								tts_time_remaining_element.innerHTML = window.create_time_remaining_html(time_remaining);
							}
							
							let tts_size_el = tts_progress_el.parentNode.querySelector('.ai-model-size');
							if(tts_size_el){
								if(total_bytes > (1024 * 1024 * 1024)){
									tts_size_el.innerHTML = '<span class="ai-model-size-number">' + (Math.round(total_bytes / (1024 * 1024 * 10240))/10) + '</span><span class="ai-model-size-gb">GB</span>';
								}
								else{
									tts_size_el.innerHTML = '<span class="ai-model-size-number">' + Math.round(total_bytes / (1024 * 1024)) + '</span><span class="ai-model-size-gb">MB</span>';
								}
								
							}
						
						}
						
					}
					tts_previous_percentage = tts_percentage;
					tts_previous_percentage_timestamp = Date.now();
					
				}
			}
			else{
				//console.error("tts loading: total_bytes is 0");
			}
			
		}
		
		else if(e.data.status == 'ready' || e.data.status == 'preloaded'){
			console.log("TTS worker is READY/PRELOADED: ", e.data.status);
			
			if(window.settings.assistant == 'speaker'){
				window.currently_loaded_assistant = 'speaker';
				document.body.classList.add('model-loaded');
			}
			
			let tts_progress_el = document.getElementById('download-progress-speaker');
			if(tts_progress_el != null){
				tts_progress_el.closest('.message').classList.add('download-complete-chat-message');
				setTimeout(() => {
					tts_progress_el.closest('.message').remove();
				},1000)
				
			}
			
			//window.tts_worker_loading = false;
			window.busy_loading_tts = false;
			window.tts_worker_loaded = true;
			
		}
		
		else if(e.data.status == 'done'){
			//console.log("TTS worker returned DONE message (file loaded)");
		}
		
		else if(e.data.status == 'disposed'){
			if(window.settings.settings_complexity == 'developer'){
				console.warn("TTS worker sent message that it has disposed of the AI models");
			}
			//if(typeof e.data.task != 'undefined' && e.data.task != null){
			//	window.handle_completed_task(e.data.task,null,{'state':'interrupted'});
			//}
			//reset_tts();
			//window.tts_worker = null;
			if(window.doing_low_memory_tts_chat_response){
				window.task_started = 10;
				if(window.tts_worker != null){
					//console.log("doing_low_memory_tts_chat_response done, and dispose done, so terminating tts_worker.  window.whisper_loaded: ", window.whisper_loaded);
					window.tts_worker.terminate();
					window.tts_worker = null;
					if(window.microphone_enabled){
						//console.log("doing_low_memory_tts_chat_response done, and dispose done. doing delayed unpause_vad");
						setTimeout(window.unpause_vad,200);
					}
				}
				window.doing_low_memory_tts_chat_response = false;
			}
			window.tts_worker_busy = false;
			window.busy_loading_tts = false;
			window.tts_worker_loaded = false;
			
		}
		
		// status: complete
		else if(e.data.status == 'complete' && typeof e.data.task == 'object' && e.data.task != null && typeof e.data.big_audio_array != 'undefined'){
			if(window.settings.settings_complexity == 'developer'){
				console.log("create_tts_worker: received big_audio_array, calling handle_completed_task");
			}
			let audio_combo = {'big_audio_array':e.data.big_audio_array}
			if(typeof e.data.wav_blob != 'undefined'){
				//console.log("worker returned a wav_blob");
				audio_combo['wav_blob'] = e.data.wav_blob;
			}
			
			await window.handle_completed_task(e.data.task, audio_combo);
			window.tts_worker_busy = false;
			window.busy_loading_tts = false;
			if(document.body.classList.contains('doing-tts')){
				document.body.classList.remove('doing-tts');
			}
			else{
				console.warn("odd: tts worker sent completed message, but body did not contain 'doing-tts' class");
			}
			
			last_tts_task = null;
			return null
			/*
			if(window.mp3_worker != null){
				window.mp3_worker.postMessage({'action':'encode','tts_counter':e.data.tts_counter,'data':e.data});
			}
			*/
			
		}
		else if(e.data.status == 'warning'){
			if(typeof e.data.message == 'string'){
				console.error("received warning from tts worker: ", e.data.message);
			}
		}
		else if(e.data.status == 'error'){
			if(typeof e.data.error == 'string'){
				console.error("received error from tts worker: ", e.data.error);
			}
			
			//window.tts_worker_busy = false;
			//document.body.classList.remove('doing-tts');
			
			if(typeof e.data.task != 'undefined' && e.data.task != null){
				await window.handle_completed_task(e.data.task, null, {'state':'failed'});
			}
			
			else if(last_tts_task != null){
				console.warn("falling back to last_tts_task");
				await window.handle_completed_task(last_tts_task, null,{'state':'failed'});
			}
			
			reset_tts();
		}
		
		else{
			console.error("TTS worker message fell through: ", e.data);
			window.tts_worker_busy = false;
			document.body.classList.remove('doing-tts');
			if(typeof e.data.task != 'undefined' && e.data.task != null){
				await window.handle_completed_task(e.data.task, null,{'state':'failed'});
			}
			/*
			else if(last_tts_task != null){
				await window.handle_completed_task(last_tts_task, null,{'state':'failed'});
			}
			*/
			
			reset_tts();
		}
		
	});
	
	
	window.tts_worker.addEventListener('error', (error) => {
		console.error("ERROR: tts_module: serious tts_worker error (terminating!): ", error);
		//window.tts_worker_busy = false;
		//window.busy_loading_tts = false;
		window.flash_message("👄" + window.get_translation("An_error_occured"),2000,'fail');
		reset_tts();
		/*
		setTimeout(() => {
			//console.log("attempting to restart tts worker");
			//window.tts_worker_busy = false;
			//create_tts_worker();
			reset_tts();
		},3000);
		*/
	});
	
}
window.create_tts_worker = create_tts_worker;
// create tts worker
//create_tts_worker();


async function reset_tts(){
	//console.log("in reset_tts");
	//console.warn('in reset_tts');
	if(window.tts_worker != null){
		
		window.tts_worker.postMessage({'action':'dispose'});
		
		setTimeout(() =>{
			if(window.tts_worker_loaded){
				console.error("reset_tts: after a second the TTS still wasn't disposed cleanly");
				if(window.tts_worker != null){
					window.tts_worker.terminate();
				}
				window.tts_worker = null;
				window.tts_worker_busy = false;
				window.busy_loading_tts = false;
				window.tts_worker_loaded = false;
			}
		},1000);
	}
	
	if(document.body.classList.contains('doing-tts')){
		document.body.classList.remove('doing-tts');
	}
	
	if(last_tts_task != null){
		console.warn('reset_tts: it seems a task failed');
		await window.handle_completed_task(last_tts_task, null,{'state':'failed'});
		last_tts_task = null;
	}
	
	let tts_progress_el = document.getElementById('download-progress-speaker');
	if(tts_progress_el != null){
		tts_progress_el.closest('.message').classList.add('fail');
		setTimeout(() => {
			tts_progress_el.closest('.message').remove();
		},1000);
	}
	
}


// Generate speech

	
// In future other types of audio could be generated
//do_tts = async function (task){ // tts_queue_item
window.do_tts = async function (task){ // tts_queue_item
	//console.log("in do_tts. Task: ", task);
	
	if(typeof task == 'undefined' || task == null){
		console.error("do_tts: provided task was invalid: ", task);
		return false
	}

	if(window.tts_worker_busy == true){
		console.error("do_tts: ABORTING. window.tts_worker_busy was already true. task: ", task);
		return false
	}

	if(typeof task.sentence != 'string'){
		console.error("do_tts: provided task has no sentence to speak: ", task);
		return false
	}
	
	if(task.sentence.replaceAll('\n').trim() == ''){
		console.error("do_tts: provided task has empty sentence: ", task);
		return false
	}
	
	if(typeof task.speech_interrupted == 'boolean' && task.speech_interrupted == true){
		console.error("do_tts: aborting, provided task had speech_interrupted set to true: ", task);
		return false
	}


	if(typeof task.recorded_audio != 'undefined'){
		console.warn("do_tts: noticed that the task still had raw recorded_audio");
	}
	window.tts_worker_busy = true;

	let target_language = 'en';

	let voice = 'basic';
	if(typeof task.voice == 'string'){
		//console.log("do_tts: using voice from task: ", task.voice);
		voice = task.voice;
	}
	else if(typeof window.settings.voice == 'string'){
		//console.log("do_tts: falling back to voice from settings: ", task.voice);
		voice = window.settings.voice
	}


	const choose_tts = async (task) => {
		//console.log("in choose_tts. task: ", task);
		if(typeof task.output_language != 'string'){
			console.error("choose_tts: task.output_language must be a string. task: ", task);
			return false
		}
		if(task.output_language == 'en' && voice != 'basic'){
			
			if(window.tts_worker == null){
				if(window.settings.settings_complexity == 'developer'){
					console.error("do_tts:  need to create tts_worker first");
				}
				window.busy_loading_tts = true;
				await create_tts_worker();
				await delay(100);
				//console.log("tts worker should now exist");
				//window.tts_worker_busy = false;
				//window.busy_loading_tts = false; // makes it useles, but it's not really needed anyway
			}
			
			if(window.tts_worker && window.tts_worker_loaded){
				console.warn("do_tts: window.tts_worker seems to exist and is loaded, sending it the task: ", window.tts_worker, task);
				document.body.classList.add('doing-tts');
				last_tts_task = task;
				window.tts_worker.postMessage({'task':task});
				return true
			}
			else{
				console.error("do_tts: window.tts_worker was still null");
				window.tts_worker_busy = false;
				window.busy_loading_tts = false;
				window.handle_completed_task(task,null,{'state':'failed'});
				return false
			}
		}
		else if(window.browser_synth){
			console.warn("do_tts: calling browser_speak with task: ", task);
			window.browser_speak(task);
			return true
		}
		else{
			console.warn("do_tts: browser_speak also not an option: ", task);
			return false
		}
	}


	if( 
		(typeof task.sentence == 'string' && task.sentence == 'Hello World') 
		|| (typeof task.prompt == 'string' && task.prompt == 'Hello World')
	){
		task.output_language = 'en';
	}

	if(typeof task.output_language == 'string'){
		//console.log("do_tts: task.output_language was already provided, so calling choose_tts immediately.  task.output_language: ", task.output_language);
		const chosen = await choose_tts(task);
		return chosen;
	}
	else{
		//if(typeof ask.state == 'string' && task.state == 'should_tts')
		try{
			await add_script('./js/eld.M60.min.js');
			
			//console.log("do_tts: loaded language detection script");
			//console.log("do_tts: language detection script: eld.info: ", eld.info() );
			try{
				let language_detection_result = eld.detect(task.sentence);
				//console.log("do_tts: detect_language: language_detection_result: ", language_detection_result);
				//console.log("do_tts: language detection scores: ", language_detection_result.getScores());
				if(typeof language_detection_result.language == 'string' && language_detection_result.isReliable() && task.sentence.length > 20){
					//console.log("do_tts: language detection sis reliable. language detected: ", language_detection_result.language);
					task.output_language = language_detection_result.language;
				}
				else{
					task.output_language = window.settings.language;
				}
				const chosen = await choose_tts(task);
				return chosen;
			}
			catch(err){
				console.error("do_tts: doing language detection caused an error: ", err);
				//window.tts_worker_busy = false;
				task.output_language = window.settings.language;
				const chosen = await choose_tts(task);
				return chosen;
			}
			
		}
		catch(err){
			console.error("do_tts: caught error loading language detection script: ", err);
			try{
				task.output_language = window.settings.language;
				const chosen = await choose_tts(task);
				return chosen;
			}
			catch(err){
				console.error('do_tts: double error: ', err);
				window.tts_worker_busy = false;
				return false
			}
		}
		
	}
	
}

window.busy_loading_tts

async function preload_tts(){
	console.log("in preload_tts.  window.tts_worker_loaded,window.busy_loading_tts: ", window.tts_worker_loaded,window.busy_loading_tts);
	
	if(window.tts_worker == null){
		window.tts_worker_loaded = false;
	}
	
	if(window.tts_worker_loaded == false && window.busy_loading_tts == false){
		add_chat_message('speaker','speaker','download_progress#setting---');
		window.busy_loading_tts = true;
		
		if(window.tts_worker == null){
			if(window.settings.settings_complexity == 'developer'){
				console.warn("preload_tts:  need to create tts_worker first");
			}
			const before_time = Date.now();
			await create_tts_worker();
			console.log("preload_tts: starting worker took: ", Date.now() - before_time);
			//await delay(100);
			//console.log("preload_tts: tts worker should now exist");
			//window.tts_worker_busy = false;
			//window.busy_loading_tts = false; // makes it useles, but it's not really needed anyway
		
		}
		else if(window.tts_worker_exists){
		    window.tts_worker.postMessage({
				'action':'preload'
		    });
		}
	}
	else{
		console.error("preload_tts: already loaded, or already busy loading: ", window.tts_worker_loaded, window.busy_loading_tts);
	}
	
}
window.preload_tts = preload_tts;




let dispose_tts_timeout = null;
function dispose_tts(){
	if(window.settings.settings_complexity == 'developer'){
		console.warn('dev: in dispose_tts');
	}
	
	if(window.tts_worker != null){
	    window.tts_worker.postMessage({
			'action':'dispose'
	    });
	}
	
	if(dispose_tts_timeout != null){
		clearTimeout(dispose_tts_timeout);
		dispose_tts_timeout = null;
	}
	
	dispose_tts_timeout = setTimeout(() => {
		dispose_tts_timeout = null;
		if(window.tts_worker != null){
			console.error("dispose_tts: had to forcefully kill tts worker, as dispose seemingly took longer than a second");
			reset_tts();
		}
	},1000);
}
window.dispose_tts = dispose_tts;









//
//   PLAY AUDIO
//


window.do_audio_player = async function (task){
	//console.log("in do_audio_player. task: ", task);
	
	try{
		if(typeof task.audio == 'undefined'){
			console.error("do_audio_player: aborting: task did not have audio array: ", task);
			return false
		}
		window.audio_player_busy = true;
		
		window.create_main_audio_context();
		
		if (window.main_audio_context && window.main_audio_context.state === "interrupted") {
			console.warn("do_audio_player: AUDIO CONTEXT STATE WAS INTERUPTED. FIXING THAT FIRST");
			window.main_audio_context.resume().then(() => window.do_audio_player(task));
			return true
		}
		
		
		//console.log("do_audio_player: audio array length: ", task.audio.length);
		const duration = task.audio.length / 16; // sic, audio buffer of audio array..
		window.current_audio_file_duration = duration;
		//console.log("do_audio_player: duration: ", window.current_audio_file_duration);
		
		if(duration > 100 && is_task_for_currently_open_document(task)){
			//console.log("do_audio_player: this task is for the currently open document");
			let selection = get_selection_from_task(task);
			//console.log("do_audio_player: selection from task: ", selection);
			if(selection && typeof selection.from == 'number' && selection.to == 'number'){
				if(selection.to > selection.from){
					//console.log("do_audio_player: highlighting sentence being played in the currently open document: ", selection);
					highlight_selection(selection);
				}
				else{
					console.error("do_audio_player: highlighting sentence: selection had invalid length: ", selection);
				}
				
			}
		}
		
		// TODO: show audio controls if duration is very long?
		
		// Create an empty three-second stereo buffer at the sample rate of the AudioContext
		const myArrayBuffer = window.main_audio_context.createBuffer(
		  1,
		  task.audio.length,
		  16000,
		);
		//console.log("myArrayBuffer: ", myArrayBuffer);
		//console.log("myArrayBuffer.numberOfChannels: ", myArrayBuffer.numberOfChannels);
		
		
		let nowBuffering = [];
		// Fill the buffer with white noise;
		// just random values between -1.0 and 1.0
		for (let channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
		  // This gives us the actual array that contains the data
		  const nowBuffering = myArrayBuffer.getChannelData(channel);
		  for (let i = 0; i < myArrayBuffer.length; i++) {
		    // Math.random() is in [0; 1.0]
		    // audio needs to be in [-1.0; 1.0]
		    nowBuffering[i] = task.audio[i]; //Math.random() * 2 - 1;
		  }
		}
		
		// remove the audio data
		//window.audio_to_play.splice(0,1);
		
		if(window.audio_player != null){
			console.warn("do_audio_player: window.audio_player was not null");
			window.audio_player.stop();
			window.audio_player = null;
		}
		
		
			
		if(typeof task.assistant == 'string' && (task.assistant == 'speaker' || task.assistant == 'musician' || task.assistant == 'translator')){
			let blob = new Blob([myArrayBuffer], { type: "audio/wav" });
			if(typeof task.wav_blob != 'undefined'){
				blob = task.wav_blob;
			}
				
			//console.log("do_audio_player: task.audio: ", task.audio);
			//console.log("do_audio_player: nowBuffering: ", nowBuffering);
			//const blob = new Blob([myArrayBuffer.getChannelData(0)], { type: "audio/wav" });
			//const blob = new Blob([nowBuffering], { type: "audio/wav" });
			
			//const url = window.URL.createObjectURL(blob);
			const url = window.URL.createObjectURL(bufferToWave(myArrayBuffer, task.audio.length));
			//console.log("do_audio_player: buffer_to_wave blob url: ", url);
			
			if(typeof task.index == 'number'){
				const chat_bubble_id = '#chat-message-task-' + task.assistant + '-' + task.assistant + task.index; // sic
				//console.log("do_audio_player: chat_bubble_id: ", chat_bubble_id);
				
				let line = null;
				
				let target_chat_bubble = document.querySelector(chat_bubble_id);
				if(target_chat_bubble == null && typeof task.index == 'number'){
					console.warn("do_audio_player: adding missing chat output bubble: ", chat_bubble_id); // for blueprints
					
					if(typeof task.transcription == 'string'){
						line = task.transcription;
					}
					else if(typeof task.prompt == 'string'){
						line = task.prompt;
					}
					else if(typeof task.sentence == 'string'){
						line = task.sentence;
					}
					
					if(line){
						//console.log("do_audio_player: adding missing chat bubble for: ", line);
						add_chat_message(task.assistant,task.assistant,line,null,'<div class="spinner"></div>',task.index);
						target_chat_bubble = document.querySelector(chat_bubble_id);
					}
					else{
						console.error("do_audio_player: could not find line of text to use to add missing chat bubble");
					}
					
				}
				
				if(target_chat_bubble){
					//console.log("do_audio_player: found chat bubble to add audio player to: ", target_chat_bubble);
					target_chat_bubble.innerHTML = '';
					try{
						let audio_player_el = document.createElement('audio');
						//console.log("audio_player_el: ", audio_player_el);
						audio_player_el.classList.add('chat-message-audio-player');
						audio_player_el.setAttribute('controls',true);
						if(typeof line == 'string'){
							audio_player_el.setAttribute('title',line.trim().substr(0,50));
						}
						//audio_player_el.setAttribute("type","audio/mpeg");
						audio_player_el.setAttribute('id','chat-message-audio-player-task' + task.index);
						audio_player_el.src = url;
						//audio_player_el.load();
						//console.log("do_audio_player: appending audio_player to bubble: ", audio_player_el);
						target_chat_bubble.appendChild(audio_player_el);
						
						
						
					}
					catch(e){
						console.error("Caught error appending audio player to chat message: ", e);
					}
					
					
				}
				else{
					console.error("could not find chat bubble to append audio player to.  chat_bubble_id: ", chat_bubble_id);
				}
			}
			else{
				console.error("cannot create audio player. Invalid task?", task);
			}
			
		}
		
		
		// Get an AudioBufferSourceNode.
		// This is the AudioNode to use when we want to play an AudioBuffer
		window.audio_player = window.main_audio_context.createBufferSource();
		//console.log("do_audio_player: window.audio_player: ", window.audio_player);

		// set the buffer in the AudioBufferSourceNode
		window.audio_player.buffer = myArrayBuffer;
		
		window.audio_player.onended = function() {
			//console.log("do_audio_player: AUDIO STOPPED PLAYING. window.tts_tasks_left, task: ", window.tts_tasks_left, task);
			window.audio_player.stop();
			window.audio_player = null;
			if(document.body.classList.contains('playing-document') || document.body.classList.contains('fairytale')){
				window.remove_highlight_selection();
			}
			
			
			
			//window.audio_to_play.splice(0,1);
			window.handle_completed_task(task,true);
			
			if(window.doing_low_memory_tts_chat_response && window.tts_tasks_left == 0){
				console.warn("End of playing audio: All TTS tasks are done, setting window.doing_low_memory_tts_chat_response to false, and killing TTS worker");
				reset_tts();
			}
			else if(window.doing_low_memory_tts_chat_response){
				console.log("audio playing done, but low memory, and there are more TTS tasks to go");
			}
			
			
			window.audio_player_busy = false;
			if(window.microphone_enabled){
				window.unpause_vad();
			}
			
			
			
		};
		
		// connect the AudioBufferSourceNode to the
		// destination so we can hear the sound
		//console.log("do_audio_player: connecting window.audio_player to window.main_audio_context.destination: ", window.main_audio_context.destination);
		window.audio_player.connect(window.main_audio_context.destination);
		
		
		
		
		const my_start_time = Date.now();
	  	const my_end_time = my_start_time + duration;
		
		function update_speaker_icon_progress(){
			if(window.speaker_enabled){
				const time_passed = Date.now() - my_start_time;
				const percent_played = (time_passed / duration) * 100;
				//console.log("percent of audio played: ", percent_played);
				set_speaker_progress(percent_played);
				if(Date.now() < my_end_time){
					//console.log("doing another speaker icon progress update loop");
					setTimeout(() => {
						update_speaker_icon_progress();
					}, Math.round(duration/100) );
				}
			}
			else{
				set_speaker_progress(100);
			}
			
		}
		
		// start the source playing
		window.last_time_audio_started = my_start_time;
		if(window.microphone_enabled){
			
			if(
				typeof window.settings.interrupt_speaking == 'string' 
				&& (
					window.settings.interrupt_speaking == 'Yes' 
					|| (window.settings.interrupt_speaking == 'Auto' && window.ram > 4000) 
				)
			){
				//console.log("temporarily pausing VAD in order to play audio without interruption");
				console.warn("NOT disabling VAD while playing audio. window.settings.interrupt_speaking: ", window.settings.interrupt_speaking);
			}
			else{
				window.pause_vad();
			}
			
		}
		window.audio_player.start();
		if(duration > 300){
			update_speaker_icon_progress();
		}
		
	}
	catch(err){
		console.error("do_audio_player: caught error: ", err);
		window.audio_player_busy = false;
	}

}







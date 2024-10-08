import FFT from "./fft.js";


/**
 * AudioWorkletProcessor for Voice Activity Detection (VAD).
 * https://github.com/thurti/vad-audio-worklet
 *
 * From: Moattar, Mohammad & Homayoonpoor, Mahdi. (2010). A simple but efficient real-time voice activity detection algorithm. European Signal Processing Conference.
 * @see https://www.researchgate.net/publication/255667085_A_simple_but_efficient_real-time_voice_activity_detection_algorithm
 */
class AudioVADProcessor extends AudioWorkletProcessor {
  primThresh_e = 40;
  primThresh_f_hz = 185;
  primThresh_sfm = 5;
  frame_size_ms = 10; // so 100 audio frames per second

  is_speech_frame_counter = 0;
  is_silent_frame_counter = 0;

  e_min = null;
  f_min = null;
  sfm_min = null;

  sample_rate;
  fft_size = 128;
  fft; // FFT.js instance

  buffer = [];
  recording = [];
  frame_size;
  frame_counter = 0;

  last_command_was_speech = true;
  real_sample_rate = null;

  debug = false;

  constructor(options) {
    super(options);

    this.debug = options.processorOptions.debug ?? this.debug;

    this.last_command_was_speech =
      options.processorOptions.lastCommandWasSpeech ??
      this.last_command_was_speech;
    this.sample_rate = options.processorOptions.sampleRate;
	console.log("VAD_audio_worklet: this.sample_rate: ", this.sample_rate);
    this.fft_size = options.processorOptions.fftSize ?? this.fft_size;
	//console.log("VAD audio worklet: this.fft_size: ", this.fft_size);
    this.fft = new FFT(this.fft_size);
    this.frame_size = (this.sample_rate * this.frame_size_ms) / 1000;
	//console.log("VAD audio worklet: this.frame_size: ", this.frame_size);
	this.recording = [];
	this.fps = Math.round(1000 / this.frame_size_ms);
	this.half_fps = Math.round(500 / this.frame_size_ms);
	//this.quarter_fps = Math.round(250 / this.frame_size_ms);
	//console.log("VAD audio worklet: this.fps: ", this.fps);
	//this.maximum_pre_buffer_size = this.fft_size * this.half_fps;//Math.round(this.fps / 2); // maximum half a second  of pre-buffer //50; // 100 frames per second, so 50 is half a second? but framesize is variable, and may not be 10ms.
	this.maximum_pre_buffer_size = this.frame_size * this.half_fps; // allow up to half a second of, in theory, mostly silence.
	
	//console.log("VAD audio worklet: this.maximum_pre_buffer_size: ", this.maximum_pre_buffer_size);
	this.listening = true;
	this.post_timeout = null;
	this.optimal_recording_length = 0;
	this.audio_chunk_size = null; //128; // will be set to actual value on first audio processing
	this.samples_per_frame = null;
	this.silent_frame_threshold = 40;
	this.minimal_silent_frame_threshold = 30;
	this.maximal_silent_frame_threshold = this.minimal_silent_frame_threshold + 30;
	this.flush_offset = 0; // When a recording is returned prematurely
	this.recording_start_time = null;
	this.recording_end_time = null;
	this.truncated_pre_recording = 0;
	this.actual_pre_recording_size = null;
	this.listening_start_time = null;
	this.continuous = false;
	this.last_winner = null;
	this.state_update_delta = 0;
	this.flush_count = null;
	this.flush_threshold = 15; // 15 seconds normally, but when doing non-stop recording this can be increased
	this.optimal_flush_buffer_cut_frame = null;
	this.sample_rate_check_recording_start_time = null;
	
	this.seconds_counter = 0;
	this.ping();
	
	
	this.port.onmessage = (e) => {
		
		if(typeof e.data.ping == 'boolean'){
			if(e.data.ping){
				this.ping();
			}
		}
		
		if(typeof e.data.continuous == 'boolean'){
			console.log("VAD WORKLET:  received e.data.continuous: ", e.data.continuous);
			if(this.continuous == false && e.data.continuous == true){
				this.flush_count = 0;
				this.recording = [];
				this.recording.length = 0;
				this.recording_start_time = null;
				this.recording_end_time = null;
				this.truncated_pre_recording = 0;
				this.actual_pre_recording_size = null;
				this.flush_threshold = 25;
			}
			this.continuous = e.data.continuous;
			
			if(this.continuous){
				this.flush_threshold = 25;
			}
			else{
				this.flush_threshold = 15;
			}
			
		}
		
		if(typeof e.data.minimal_silence_threshold == 'number'){
			console.log("VAD WORKLET:  received e.data.minimal_silence_threshold: ", e.data.minimal_silence_threshold);
			
			this.minimal_silent_frame_threshold = e.data.minimal_silence_threshold;
			this.maximal_silent_frame_threshold = this.minimal_silent_frame_threshold + 30;
			this.silent_frame_threshold = this.minimal_silent_frame_threshold + 20;
		}
		
		
		if(typeof e.data.flush_count == 'number' || e.data.flush_count == null){
			this.flush_count = e.data.flush_count;
		}
		
		if(typeof e.data.listening == 'boolean'){
			this.listening = e.data.listening;
			//console.log("VAD audio worklet: received message: ", e.data);
			console.log("VAD audio worklet:  this.listening: ", this.listening);
		
			if(this.listening == false){
				
				if(this.recording.length > (this.sample_rate * 2)){
					this.send_recording(); // send the final recording if it's longer than 2 seconds
				}
				
				
				this.recording = [];
				this.recording.length = 0;
				this.post("silence");
			
				//this.frame_counter = 0;
				this.buffer = [];
				this.buffer.length = 0;
			    this.is_speech_frame_counter = 0;
			    this.is_silent_frame_counter = 1;
				this.last_command_was_speech = false;
				this.optimal_flush_buffer_cut_frame = null;
				this.continuous = false;
				this.flush_count = null;
				
				//this.audio_chunk_size = null;

			    this.e_min = null;
			    this.f_min = null;
			    this.sfm_min = null;
			}
		}
		//else{
			//console.error("VAD audio worklet: e.data.listening was not a boolean, it was: ", typeof e.data.listening, e.data);
		//}
		
		
	};
	
  }


  ping(){
    //console.log("VAD AUDIO WORKLET: SENDING PING");
  	this.post('ping',{'listening':this.listening,'last_command_was_speech':this.last_command_was_speech});
  }


  post(cmd, data) {
    this.port.postMessage({
      cmd,
      data,
    });
  }
  
  send_recording(){
    console.log("VAD WORKLET: in send_recording. continuous: ", this.continuous);
    const now_stamp = Date.now();
	this.recording_start_time = now_stamp - (this.recording.length / (this.sample_rate / 1000)); // assuming 16000 sample_rate, this would be divided by 16 to get to milliseconds (16 audio floats per millisecond);
	this.sample_rate_check_recording_start_time = now_stamp;
	
  	this.post("recording", {
		'audio_data':this.recording,
		'details':{
			'origin':'voice',
			'sample_rate':this.sample_rate,
			'flush_offset':this.flush_offset,
			'progress_index':this.flush_count,
			'truncated_pre_recording':this.truncated_pre_recording, // how many audio points were truncated from the pre-buffer while waiting for speech
			'maximum_pre_recording_buffer_size':this.maximum_pre_buffer_size,
			'actual_pre_recording_size':this.actual_pre_recording_size,
			'listening_start_time':this.listening_start_time,
			'real_sample_rate':this.real_sample_rate,
			'recording_start_time':this.recording_start_time, // TODO Start time can only be trusted if recording is non-stop, as it doesn't account for pruning of pre-buffer yet (although that could be implemented too..)
			'recording_end_time':now_stamp,
			'optimal_flush_buffer_cut_frame':this.optimal_flush_buffer_cut_frame, // an attempt to keep a chunk of a long recording based on an actual moment of silence instead of just cutting 5 * 16000 frames, which could cut in the middle of a word.
			'continuous':this.continuous,
		}
		
	});
  }

  getSpectrum(data) {
    // zero pad data
    while (data.length < this.fft_size) {
      data.push(0);
    }

    // calculate fft
    const input = this.fft.toComplexArray(data);
    const out = this.fft.createComplexArray();

    this.fft.realTransform(out, input);

    // get amplitude array
    var res = new Array(out.length >>> 1);
    for (var i = 0; i < out.length; i += 2) {
      let real = out[i];
      let imag = out[i + 1];
      res[i >>> 1] = Math.sqrt(real * real + imag * imag);
    }

    return res.slice(0, res.length / 2 - 1);
  }

  process(inputs, outputs, parameters) {
    if (!inputs || !inputs[0] || !inputs[0][0]) {
      return false;
    }
	
	this.seconds_counter += inputs[0][0].length;
	if(this.seconds_counter > 16000){
		this.seconds_counter = 0;
		this.ping();
	}
	
	if(this.listening == false){
		return true;
	}
	
	if(this.recording.length == 0){
		this.recording_start_time = Date.now();
		
		this.listening_start_time = Date.now();
		this.truncated_pre_recording = 0;
	}
	
	if(this.audio_chunk_size == null){
		this.audio_chunk_size = inputs[0][0].length;
		//console.log("this.audio_chunk_size: ", this.audio_chunk_size);
	}
	
	
	
	// TRUNCATE THE PRE-BUFFER
	
	this.recording.push(...inputs[0][0]);
	//console.log("inputs[0][0].length: ", inputs[0][0].length);
	if(this.recording.length > this.maximum_pre_buffer_size && this.last_command_was_speech == false && this.continuous == false){
		//console.log("pruning pre-buffer: ", this.recording.length - this.maximum_pre_buffer_size);
		//console.log("pre-buffer last_value before: ", this.recording.length, " -> ", this.recording[this.recording.length-2], this.recording[this.recording.length-1]);
		this.recording.splice(0, this.recording.length - this.maximum_pre_buffer_size); // remove old audio from beginning of buffer
		this.actual_pre_recording_size = null;
		this.truncated_pre_recording += this.recording.length - this.maximum_pre_buffer_size;
		this.sample_rate_check_recording_start_time = Date.now();
		
		
		//console.log("pre-buffer last_value after: ",  this.recording.length, " -> ", this.recording[this.recording.length-2], this.recording[this.recording.length-1]);
		//console.log("spliced this.recording.length: ", this.recording.length);
	}
	if(this.actual_pre_recording_size == null && this.last_command_was_speech == true && this.continuous == false){
		this.actual_pre_recording_size = this.recording.length;
		this.sample_rate_check_recording_start_time = Date.now();
		
		//this.recording_start_time = Date.now() - (this.actual_pre_recording_size / 16); // might be easier/more accurate to calculate this based on the current timestamp minus the total recording length instead, since this is only used when non-stop is disabled anyway
	}
	
	this.state_update_delta += this.audio_chunk_size;
	if(this.state_update_delta > 16000){
		this.state_update_delta = 0;
		if(this.last_command_was_speech){
			this.post("speech");
		}
		else{
			this.post("silence");
		}
		
	}
	if(this.real_sample_rate == null && typeof this.sample_rate_check_recording_start_time == 'number' && (Date.now() - this.sample_rate_check_recording_start_time) > 1000){
		const real_sample_rate_measuring_duration = Date.now() - this.sample_rate_check_recording_start_time;
		console.log("real_sample_rate: real_sample_rate_measuring_duration: ", real_sample_rate_measuring_duration);
		
		if(typeof this.actual_pre_recording_size == 'number'){
			console.log("real_sample_rate: recorded samples: ", (this.recording.length - this.actual_pre_recording_size));
			
			this.real_sample_rate = (this.recording.length - this.actual_pre_recording_size) / (real_sample_rate_measuring_duration/1000);
			console.log("VAD audio worklet: real_sample_rate: saw this many samples in a second: ", this.real_sample_rate);
		}
		else{
			console.error("unable to calculate real_sample_rate, somehow variables weren't numbers");
			this.real_sample_rate = 0;
		}
		
	}
	
	
	//console.log("recording", this.recording.length);
	
    // buffer input data
    if (this.buffer.length < this.frame_size) {
      this.buffer.push(...inputs[0][0]);
      return true;
    }
	if(this.samples_per_frame == null){
		this.samples_per_frame = this.buffer.length;
	}

    // get time and frequency data
    const timeData = new Float32Array(this.buffer);
    const frequencyData = this.getSpectrum(this.buffer);

    // set dc offset to 0
    frequencyData[0] = 0;

    // reset buffer
    this.buffer = [];

    // increment frame counter
    this.frame_counter++;

    // calculate energy of the frame
    let energy = 0;

    for (let i = 0; i < timeData.length; i++) {
      energy += timeData[i] * timeData[i];
    }

    // get frequency with highest amplitude...
    let f_max = 0;
    let f_max_index = 0;

    // ...and spectral flatness
    let sfm = 0;
    let sfm_sum_geo = 0;
    let sfm_sum_ari = 0;

    // calc both in one loop
    for (let i = 0; i < frequencyData.length; i++) {
      // find frequency with highest amplitude
      if (frequencyData[i] > f_max) {
        f_max = frequencyData[i];
        f_max_index = i;
      }

      // spectral flatness (geometric mean, arithmetic mean)
      const f_geo = frequencyData[i] > 0 ? frequencyData[i] : 1;
      sfm_sum_geo += Math.log(f_geo);
      sfm_sum_ari += f_geo;
    }

    // get frequency in Hz for highest amplitude
    const f_max_hz = (f_max_index * this.sample_rate) / this.fft_size;

    // calculate spectral flatness
    sfm =
      -10 *
      Math.log10(
        Math.exp(sfm_sum_geo / frequencyData.length) /
          (sfm_sum_ari / frequencyData.length)
      );

    // just safety check
    sfm = isFinite(sfm) ? sfm : 0;

    // set initial min values from first 30 frames
    if (this.e_min === null || this.frame_counter < 30) {
      this.e_min = this.e_min > energy && energy !== 0 ? this.e_min : energy;
      this.f_min = this.f_min > f_max_hz ? f_max_hz : this.f_min;
      this.sfm_min = this.sfm_min > sfm ? sfm : this.sfm_min;
    }

    // frame vad counter
    let count = 0;

    // calculate current energy threshold
    const current_thresh_e = this.primThresh_e * Math.log10(this.e_min);

    // check energy threshold
    if (energy - this.e_min >= current_thresh_e) {
      count++;
    }

    // check frequency threshold
    if (f_max > 1 && f_max_hz - this.f_min >= this.primThresh_f_hz) {
      count++;
    }

    // check spectral flatness threshold
    if (sfm > 0 && sfm - this.sfm_min <= this.primThresh_sfm) {
      count++;
    }

	
	


    if (count > 1) {
      // is speech
      this.is_speech_frame_counter++;
	  if(this.is_speech_frame_counter > 3){
	  	this.is_silent_frame_counter = 0;
	  }
    } else {
      // is silence, so update min energy value
      this.is_silent_frame_counter++;
      this.e_min =
        (this.is_silent_frame_counter * this.e_min + energy) /
        (this.is_silent_frame_counter + 1);
	  //console.log("this.e_min: ", this.e_min);
      this.is_speech_frame_counter = 0;
    }
	
	if(this.is_speech_frame_counter > 2 && this.is_speech_frame_counter > (this.is_silent_frame_counter / 2) && this.last_winner != 'speech'){
		this.last_winner = 'speech';
		this.state_update_delta = 8000; // check the speech/silence status again in half a second
		this.post("speech");
		//console.log("this.continuous: ", this.continuous);
		//console.log("this.silent_frame_threshold: ", this.silent_frame_threshold);
	}
	else if(this.is_silent_frame_counter > 10 && this.is_speech_frame_counter < this.is_silent_frame_counter && this.last_winner != 'silence'){
		this.last_winner = 'silence';
		//this.post("silence");
	}
	
	
	
	
	if(this.recording.length > this.sample_rate * this.flush_threshold){
		
		//console.error("VAD audio worklet: forcing flush: ", this.recording.length);
		
		if(this.is_silent_frame_counter > 1 || this.recording.length > this.sample_rate * (this.flush_threshold + 4)){ // e.g. 15 soft limit -> 19 hard limit
			console.error("RECORDING WAS GETTING VERY LONG, FORCING FLUSH");
			
			if(this.recording.length > this.sample_rate * (this.flush_threshold + 4)){
				console.warn("VAD audio worklet: had to cut of audio rather abruptly");
			}
			
			/*
			for(let f = 0; f < 128; f++){
				this.recording.unshift(0);
			}
		
			for(let ff = 0; ff < 128; ff++){
				this.recording.push(0);
			}
			*/
			
			this.flush_count++;
			
			this.send_recording();
			
			this.flush_offset += this.recording.length; // how many audio points have passed under the bridge in total so far while this very long recording has been going on
			
			
			// TODO: it would be nice to always keep a little buffer? non just when in non-stop mode?
			
			if(typeof this.optimal_flush_buffer_cut_frame == 'number'){
				this.recording.splice(0, this.recording.length - this.optimal_flush_buffer_cut_frame); // keep the last few seconds, nicely but at a moment of silence, which will be useful later to glue the snippets/segments together later
				this.flush_offset -= (this.sample_rate * 5);
			}
			else if(this.continuous){
				console.log("VAD WORKLET: KEEPING LAST 5 SECONDS IN BUFFER FOR OVERLAP MERGING");
				this.recording.splice(0, this.recording.length - (this.sample_rate * 5)); // keep the last 5 seconds, which will be useful later to glue the snippets/segments together later
				this.flush_offset -= (this.sample_rate * 5);
			}
			else{
				//this.recording.splice(0, this.recording.length - (this.maximum_pre_buffer_size/2)); // TODO: experiment: allow a little bit of the pre-buffer to remain
				this.recording = [];
				this.recording.length = 0;
			
			}
			
			this.recording_start_time = null;
			this.recording_end_time = null;
			
			
			
			
			
			
			this.optimal_flush_buffer_cut_frame = null;
			
			/*
			if(this.silent_frame_threshold > 29){
				this.silent_frame_threshold = this.silent_frame_threshold - 10; // first steps down to 30, then possibly to 20 (or even 10?)
				console.log("this.silent_frame_threshold has been lowered to: ", this.silent_frame_threshold);
			}
			*/
		}
		
		/*
	  this.is_silent_frame_counter = 41;
      this.e_min =
        (this.is_silent_frame_counter * this.e_min + energy) /
        (this.is_silent_frame_counter + 1);
		//console.log("pruning pre-buffer: ", this.recording.length - this.maximum_pre_buffer_size);
	  this.recording.splice(0, this.recording.length - this.maximum_pre_buffer_size);
	  this.is_speech_frame_counter = 0;
		*/
	  
	}
	
	// start looking for a good moment to cut the audio at that will be kept in the recording buffer in order to glue things together optimally
	else if(this.recording.length > this.sample_rate * (this.flush_threshold - 3)){
		
	}
	
	
	
    // debug
    if (this.debug) {
      /*
	  this.post("log", {
        size: inputs[0][0].length,
        sampleRate: this.sample_rate,
        e: energy,
        e_true: energy - this.e_min >= current_thresh_e,
        f: f_max_hz,
        f_true: f_max > 1 && f_max_hz - this.f_min >= this.primThresh_f_hz,
        sfm: sfm,
        sfm_true: sfm - this.sfm_min <= this.primThresh_sfm,
        plot: sfm_sum_ari / frequencyData.length,
      });
		*/
		/*
		console.log("LOG: ", {
        size: inputs[0][0].length,
        sampleRate: this.sample_rate,
        e: energy,
        e_true: energy - this.e_min >= current_thresh_e,
        f: f_max_hz,
        f_true: f_max > 1 && f_max_hz - this.f_min >= this.primThresh_f_hz,
        sfm: sfm,
        sfm_true: sfm - this.sfm_min <= this.primThresh_sfm,
        plot: sfm_sum_ari / frequencyData.length,
      });
		*/
    }

    // ignore silence if less than 20 frames
	//console.log("this.is_silent_frame_counter & speech_counter: ", this.is_silent_frame_counter, this.is_speech_frame_counter);
    if (this.is_silent_frame_counter > this.silent_frame_threshold && this.last_command_was_speech) {
		if(this.silent_frame_threshold < this.minimal_silent_frame_threshold){
			console.log("VAD audio worklet: increased silent frame threshold to: ", this.silent_frame_threshold);
			this.silent_frame_threshold += 10;
		}
	  
	  if (this.debug) {
        this.post("silence", { signal: sfm_sum_ari / frequencyData.length });
      } else {
        this.post("silence");
      }
	  
	  /*
	  if(this.post_timeout){
		  console.warn("VAD audio worklet: clearing old timeout (more speech detected)");
		this.clearTimeout(this.post_timeout);
	  }
	  this.optimal_recording_length = this.recording.length;
	  this.post_timeout = this.setTimeout(() => {
	  	this.post("recording",this.recording);
		
		console.log("VAD worklet: this.optimal_recording_length: ", this.optimal_recording_length);
		console.log("VAD worklet: this.recording.length: ", this.recording.length);
  	    //this.recording = null;
  	    this.recording = [];
  	    this.recording.length = 0;
  	  
        this.last_command_was_speech = false;
		this.post_timeout = null;
	  },500);
	  */
	  /*
	  const frames_to_chop_off = 20 * this.samples_per_frame;
	  console.log("VAD audio worklet: frames_to_chop_off: ", frames_to_chop_off, ", from: ", this.recording.length );
	  if(typeof frames_to_chop_off == 'number' && frames_to_chop_off > 0){
	  	this.recording.splice(this.recording.length - frames_to_chop_off, frames_to_chop_off);
	  }
	  */
	  
	  if(this.continuous == false){
		  
		  // A natural bit of silence was detected
		  this.last_winner = 'silence';
		  
		  this.flush_offset = 0;
	  	  this.send_recording();
		  //this.post("recording",{'audio_data':this.recording,'sample_rate':this.sample_rate,'flush_offset':this.flush_offset,'recording_start_time':this.recording_start_time,'recording_end_time':Date.now()});
	
		  //console.log("VAD worklet: this.optimal_recording_length: ", this.optimal_recording_length);
		  //console.log("VAD worklet: this.recording.length: ", this.recording.length);
		  //this.recording = null;
		  this.recording = [];
		  this.recording.length = 0;
		  this.recording_start_time = null;
		  this.flush_count = 0;
		  this.optimal_flush_buffer_cut_frame = null;
	  
	  
	      this.last_command_was_speech = false;
	  }
	  
    }

    // ignore speech if less than 5 frames
    if (this.is_speech_frame_counter > 4 && !this.last_command_was_speech) {
      if (this.debug) {
        //this.post("speech", { signal: sfm_sum_ari / frequencyData.length });
      } else {
        //this.post("speech");
      }

      this.last_command_was_speech = true;
    }

    // return true to keep processor alive
    return true;
  }
}

registerProcessor("vad", AudioVADProcessor);

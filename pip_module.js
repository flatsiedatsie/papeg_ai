
//window.pip_header_canvas_context = window.pip_header_canvas.getContext("2d");

window.pip_video = document.createElement("video");

// Picture in Picture
window.pip_canvas = document.createElement("canvas");
window.pip_canvas_context = window.pip_canvas.getContext("2d");
window.pip_header_canvas = document.createElement("canvas");
window.pip_canvas.width = 480;
window.pip_canvas.height = 640;
window.pip_header_canvas.width = 480;
window.pip_header_canvas.height = 50;
//async function load_pip_image(url) {
//  return new Promise(r => { let i = new Image(); i.onload = (() => r(i)); i.src = url; });
//}





async function really_write_on_pip_canvas(text=null){
	
	if(window.pip_started){
		await window.add_script('./js/canvasTxt.js');
		// test
		
		if(window.canvasTxt && typeof text == 'string'){
	   		//console.log("write_on_pip_canvas: writing");
	   		const { drawText, getTextHeight, splitText } = window.canvasTxt; // https://github.com/geongeorge/Canvas-Txt/
		
	   		window.pip_canvas_context.clearRect(0, 0, window.pip_canvas.width, window.pip_canvas.height);
		
	   		//window.pip_canvas_context.fillStyle = "white";
	   		//window.pip_canvas_context.font = "bold 16px Arial";
		
	   		if(text.length < 500){
			
	   			window.pip_canvas_context.drawImage(window.pip_header_canvas, 5, 5);
			
	   			const { height } = drawText(window.pip_canvas_context, text, {
	   				x: 20,
	   				y: 70,
	   				width: (window.pip_canvas.width - 40),
	   				height: (window.pip_canvas.height - 90),
	   				fontSize: 24,
	   				align:'left',
	   				vAlign:'top',
	   				lineHeight:35,
	   				debug:false,
	   			});
		
	   			//console.log(`write_on_canvas: total height = ${height}`);
		
	   			if(height < window.pip_canvas.height - 90){
	   				window.pip_video.srcObject = window.pip_canvas.captureStream(0);
	   				return
	   			}
	   			else{
	   				window.pip_canvas_context.clearRect(0, 0, window.pip_canvas.width, window.pip_canvas.height);
	   			}
	   		}
		
	   		drawText(window.pip_canvas_context, text, {
	   			x: 20,
	   			y: 20,
	   			width: (window.pip_canvas.width - 40),
	   			height: (window.pip_canvas.height - 40),
	   			fontSize: 24,
	   			align:'left',
	   			vAlign:'bottom',
	   			lineHeight:35,
	   			debug:false,
	   		});
		
	   		window.pip_video.srcObject = window.pip_canvas.captureStream(0);
		
		}
		
	}

}
window.really_write_on_pip_canvas = really_write_on_pip_canvas;



function image_to_pip_canvas(image_blob){
	//console.log("in image_to_pip_canvas.  window.pip_started,typeof image_blob: ", window.pip_started, typeof image_blob);
	if(window.pip_started && typeof image_blob != 'undefined'){
		window.pip_canvas_context.clearRect(0, 0, window.pip_canvas.width, window.pip_canvas.height);
		window.pip_canvas_context.drawImage(window.pip_header_canvas, 5, 5);
		//console.log("image_to_pip_canvas: creating image");
		var img1 = new Image();
		img1.onload = function(event) {
			//console.log("image_to_pip_canvas: blob succesfully loaded into image");
			if(typeof img1.width == 'number' && img1.width > 0){
				const ratio = window.pip_canvas.width / img1.width;
				//console.log("image_to_pip_canvas: ratio: ", ratio);
				const centerShift_y = ( window.pip_canvas.height - img1.height*ratio ) / 2;  
				var centerShift_x = ( window.pip_canvas.width - img1.width*ratio ) / 2;
				//console.log("image_to_pip_canvas: centerShift_x: ", centerShift_x);
				//console.log("image_to_pip_canvas: centerShift_y: ", centerShift_y);
				window.pip_canvas_context.drawImage(img1, 0,0, img1.width, img1.height, centerShift_x, centerShift_y, img1.width*ratio, img1.height*ratio); 
				window.pip_video.srcObject = window.pip_canvas.captureStream(0);
			}
			else{
				console.error("image_to_pip_canvas: img did not have valid width: ", typeof img1.width, img1.width);
			}
			
		    //ctx.drawImage(img1, 0, 70);
			URL.revokeObjectURL(event.target.src);
		}
		img1.src = URL.createObjectURL(image_blob);
	}
	else{
		console.warn("image_to_pip_canvas: pip not started, or invalid image blob provided.  window.pip_started,typeof image_blob: ", window.pip_started, typeof image_blob);
	}
	
}
window.image_to_pip_canvas = image_to_pip_canvas;

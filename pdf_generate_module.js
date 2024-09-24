//

//import './commonmark/commonmark.js';
console.log("HELLO from pdf_generate_module");

//import * as commonmark from './commonmark/commonmark.js';
//import {Parser} from './commonmark/commonmark.js';

//import './pdfkit-commonmark/commonmark-pdfkit-renderer.js';
//import {CommonmarkPDFKitRenderer} from './pdfkit-commonmark/commonmark-pdfkit-renderer.js';
//import * as CommonmarkPDFKitRenderer from './pdfkit-commonmark/commonmark-pdfkit-renderer.js';

import './commonmark/commonmark.js';
const commonmark = window.commonmark;
import './pdfkit-commonmark/commonmark-pdfkit-renderer.js';
//import * as commonmark from './commonmark/commonmark.js';
//import {PDFDocument} from './pdfkit/pdfkit.standalone.js';

//import './pdfkit/commonmark-pdfkit-renderer.min.js';
import './pdfkit/pdfkit.standalone.js';
import './pdfkit/blob-stream.js'

console.log("pdf commonmark: ", commonmark);
//console.log("commonmark.Parser: ", commonmark.Parser);
//console.log("Parser: ", Parser);
console.log("pdf window.commonmark: ", window.commonmark);
console.log("pdf window.commonmarkParser: ", window.commonmarkParser);
console.log("CommonmarkPDFKitRenderer: ", CommonmarkPDFKitRenderer);
console.log("window.CommonmarkPDFKitRenderer: ", window.CommonmarkPDFKitRenderer);
//console.log("pdf_generate_module: imported scripts. CommonmarkPDFKitRenderer: ", CommonmarkPDFKitRenderer);

// https://github.com/maiers/pdfkit-commonmark

//const CommonmarkPDFRenderer = 

//console.log("pdf: utils: exports: ", exports);

//console.log("global.pdfkit_commonmark_utils: ", global.pdfkit_commonmark_utils);


/*
	// MARKDOWN TO PDF

import commonmark from 'commonmark';
import CommonmarkPDFRenderer from 'pdfkit-commonmark';
import PDFDocument from 'pdfkit';

// get parser instance
const reader = new commonmark.Parser();

// parse input
const parsed = reader.parse('This is **markdown** formatted text.');

// get pdf renderer instance
const writer = new CommonmarkPDFRenderer();

// create pdf document
const doc = new PDFDocument();

// write pdf to some file in the current directory
doc.pipe(fs.createWriteStream(__dirname + '/test.pdf'));

// render parsed markdown to pdf
writer.render(doc, parsed);

// end the document
doc.end();
	
	
*/






window.text_to_pdf = async (text) => {
	console.log("pdf_generate_module: in text_to_pdf. text: ", text);
	
	// TODO: add a mark to each page to indicate it was likely (partially) generated with AI?
	
	
	/*
	// create a document and pipe to a blob
	var doc = new PDFDocument();
	var stream = doc.pipe(blobStream());

	// draw some text
	doc.fontSize(25).text('Here is some vector graphics...', 100, 80);

	// some vector graphics
	doc
	  .save()
	  .moveTo(100, 150)
	  .lineTo(100, 250)
	  .lineTo(200, 250)
	  .fill('#FF3300');

	doc.circle(280, 200, 50).fill('#6600FF');

	// an SVG path
	doc
	  .scale(0.6)
	  .translate(470, 130)
	  .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
	  .fill('red', 'even-odd')
	  .restore();

	// and some justified text wrapped into columns
	doc
	  .text('And here is some wrapped text...', 100, 300)
	  .font('Times-Roman', 13)
	  .moveDown()
	  .text(text, {
	    width: 412,
	    align: 'justify',
	    indent: 30,
	    columns: 2,
	    height: 300,
	    ellipsis: true
	  });

	// end and display the document in the iframe to the right
	doc.end();
	stream.on('finish', function() {
		//iframe.src = stream.toBlobURL('application/pdf');
		return stream.toBlobURL('application/pdf');
	});
	
	*/
	
	return new Promise((resolve, reject) => {
		
		try{
			// get parser instance
			const reader = new commonmark.Parser();
			//const reader = new window.commonmarkParser();

			// parse input
			const parsed = reader.parse(text);

			// get pdf renderer instance
			//const writer = CommonmarkPDFRenderer();
			//const writer = commonmark.Renderer();
			const writer = new CommonmarkPDFKitRenderer();
			//const writer = new window.commonmarkRenderer(); 

			// create pdf document
			const doc = new PDFDocument();
			var stream = doc.pipe(blobStream());
	
			// write pdf to some file in the current directory
			//doc.pipe(fs.createWriteStream(__dirname + '/test.pdf'));
			console.log("pdf: writer: ", writer);
			// render parsed markdown to pdf
			writer.render(doc, parsed);

			// end the document
			doc.end();
			console.log("pdf doc after end: ", doc);
	
			stream.on('finish', function() {
				console.log("PDF generation stream finished");
				//iframe.src = stream.toBlobURL('application/pdf');
				resolve(stream.toBlobURL('application/pdf'));
			});
		}
		catch(err){
			console.error("pdf_generate_module: text_to_pdf: caught error: ", err);
			reject();
		}
	})
	
}

/*
setTimeout(() => {
	console.log("making PDF");
	let bla = await window.text_to_pdf('This is **markdown** formatted text.');
	console.log("bla pdf: ", bla);
},2000);
*/

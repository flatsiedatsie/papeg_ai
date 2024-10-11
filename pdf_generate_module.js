// https://github.com/maiers/pdfkit-commonmark

import './commonmark/commonmark.js';
const commonmark = window.commonmark;
import './pdfkit-commonmark/commonmark-pdfkit-renderer.js';
import './pdfkit/pdfkit.standalone.js';
import './pdfkit/blob-stream.js'

console.log("pdf commonmark: ", commonmark);
console.log("pdf window.commonmark: ", window.commonmark);
console.log("pdf window.commonmarkParser: ", window.commonmarkParser);
console.log("CommonmarkPDFKitRenderer: ", CommonmarkPDFKitRenderer);
console.log("window.CommonmarkPDFKitRenderer: ", window.CommonmarkPDFKitRenderer);

window.text_to_pdf = async (text) => {
	console.log("pdf_generate_module: in text_to_pdf. text: ", text);
	
	// TODO: add a mark to each page to indicate it was likely (partially) generated with AI?
	
	return new Promise((resolve, reject) => {
		
		try{
			// get parser instance
			const reader = new commonmark.Parser();
			//const reader = new window.commonmarkParser();

			// parse input
			const parsed = reader.parse(text);

			// get pdf renderer instance
			const writer = new CommonmarkPDFKitRenderer();

			// create pdf document
			const doc = new PDFDocument();
			var stream = doc.pipe(blobStream());
	
			// write pdf to some file in the current directory
			console.log("pdf: writer: ", writer);
			// render parsed markdown to pdf
			writer.render(doc, parsed);

			// end the document
			doc.end();
			console.log("pdf doc after end: ", doc);
	
			stream.on('finish', function() {
				console.log("PDF generation stream finished");
				resolve(stream.toBlobURL('application/pdf'));
			});
		}
		catch(err){
			console.error("pdf_generate_module: text_to_pdf: caught error: ", err);
			reject();
		}
	})
	
}

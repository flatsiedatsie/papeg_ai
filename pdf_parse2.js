window.pdfjsDist = null;
// Support for CommonJS & ESM
(async function () {
	console.log("pdf_parse2: in async init function");
    window.pdfjsDist = await import('./pdfjs-dist/build/pdf.mjs');
	console.log("pdfjsDist: ", window.pdfjsDist);
	//console.log("pdfjsDist.GlobalWorkerOptions: ", pdfjsDist.GlobalWorkerOptions);
    //const pdfjsWorker = await import('./pdfjs-dist/build/pdf.worker.mjs');
	//console.log("pdfjsWorker: ", pdfjsWorker);
    window.pdfjsDist.GlobalWorkerOptions.workerSrc = './pdfjs-dist/build/pdf.worker.mjs'; //pdfjsWorker;
	console.log("pdf_parse2: async init function done");
	
	window.pdf_parser = new PDFParse();
	console.log("window.pdf_parser: ", window.pdf_parser);
})();
/**
 * Represents a PDF parser for extracting text and metadata from PDF files.
 * This class provides functionality to load a PDF file, parse its content, and extract
 * text from each page along with document metadata. It leverages pdf.js for handling
 * PDF files in a browser or Node.js environment.
 *
 * Example usage:
 * ```typescript
 * const parser = new PDFParse();
 * const pdfData = await parser.loadPDF(buffer);
 * console.log(pdfData.text); // Outputs the text content of the PDF
 * ```
 *
 * @remarks
 * This class requires pdf.js to be included in your project as a dependency.
 *
 * @see {@link https://mozilla.github.io/pdf.js/} for pdf.js library.
 */
class PDFParse {
    /**
     * A reference to the loaded PDF document.
     * This property holds the instance of the PDFDocumentProxy returned by pdf.js
     * once a PDF file is successfully loaded. It provides access to the document's
     * pages and metadata. The value is `null` until a PDF is loaded using the `loadPDF` method.
     *
     * @private
     * @type {PDFDocumentProxy | null}
     */
    _file = null;
    /**
     * Load and parse a PDF file.
     *
     * @param {Buffer | ArrayBuffer} src - The source of the PDF file. Can be a Buffer (Node.js) or ArrayBuffer (Browser).
     * @param {Partial<PDFOptions>} [options] - Optional. Configuration options for PDF parsing.
     * @returns {Promise<PDFReturn | null>} A Promise that resolves to a PDFReturn object containing the parsed data, or null in case of an error.
     */
    async loadPDF(src, options) {
        try {
            const DEFAULT_OPTIONS = {
                pageRender: this.renderPage,
                maxPages: 0,
            };
            const pdfOptions = { ...DEFAULT_OPTIONS, ...options };
            const pdfReturn = {
                totalPages: 0,
                renderedTexts: 0,
                info: null,
                metadata: null,
                text: '',
                version: pdfjsDist.version,
            };
            // Buffer doesn't exist in the browser, so we need to convert it to ArrayBuffer / Uint8Array
            this._file = await window.pdfjsDist.getDocument({ data: new Uint8Array(src) })
                .promise;
            pdfReturn.totalPages = this._file.numPages;
            const metaData = await this._file.getMetadata();
            pdfReturn.info = metaData.info;
            pdfReturn.metadata = metaData.metadata;
            const texts = await Promise.all(Array.from({
                length: Math.min(pdfOptions.maxPages > 0
                    ? pdfOptions.maxPages
                    : this._file.numPages, this._file.numPages),
            }, (_, i) => this._file
                ?.getPage(i + 1)
                .then((page) => pdfOptions.pageRender(page))));
            pdfReturn.text = texts.join('\n\n');
            pdfReturn.renderedTexts = texts.length;
            return pdfReturn;
        }
        catch (e) {
            console.error(`Could not parse PDF: ${e}`);
            return null;
        }
    }
    /**
     * Renders text content from a PDF page.
     *
     * @param {PDFPageProxy} pageData - The PDF page to render.
     * @param {RenderOptions} [options] - Rendering options.
     * @returns {Promise<string>} A promise that resolves to the text content of the page.
     */
    async renderPage(pageData, options = {
        disableNormalization: false,
    }) {
        const textContent = await pageData.getTextContent({
            includeMarkedContent: false,
            ...options,
        });
        let lastY = undefined;
        let text = '';
        textContent?.items.forEach((item) => {
            item = item;
            const yPosition = item.transform[5];
            if (lastY !== undefined && lastY !== yPosition) {
                text += '\n';
            }
            text += item.str;
            lastY = yPosition;
        });
        return text;
    }
    /**
     * PDF File
     *
     * @public
     * @returns {PDFDocumentProxy | null}
     */
    get file() {
        return this._file;
    }
}

export { PDFParse as default };
//# sourceMappingURL=index.js.map

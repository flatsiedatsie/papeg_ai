// Additional functionality for editing code

// add coder-specfic CSS
document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="css/coder.css" />');



let files_to_load = [
	'./pjs/dayjs-with-plugins.min.js',
	'./pjs/diff.js',
	'./pjs/linter.min.js',
	'./pjs/stylelint-bundle.min.js',
	'./pjs/beautify-css.min.js',
	'./pjs/beautify-html.min.js',
	'./pjs/beautify.js'
];
let code_to_load = [];



//  JAVASCRIPT LINTER
const linter_config = {
	// eslint configuration
	parserOptions: {
		ecmaVersion: 2019,
		sourceType: "module",
	},
	env: {
		browser: true,
		node: true,
	},
    extends: "eslint:recommended",
	rules: {
		//semi: ["error", "never"],
	},
};



for(let c = 0; c < files_to_load.length; c++){
	code_to_load.push(window.add_script(files_to_load[c]));
}






Promise.all(code_to_load).then((values) => {
	//console.log("coder_module: promise.all -> the files have loaded");
	//console.log(values);
	
	if(eslint){
		window.js_linter = new eslint.Linter();
	}else{
		console.error("eslint missing");
	}
});
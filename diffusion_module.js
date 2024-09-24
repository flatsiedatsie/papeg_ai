import init, { TokenizerWasm } from "./diffusion/tokenizers-wasm/tokenizers_wasm.js";

console.log("hello from diffusion_module.js")

var initialized = false;
async function getTokenizer(name) {
  if (!initialized) {
    await init();
  }
  // it seems 'name' here points to 'openai/clip-vit-large-patch14': https://huggingface.co/openai/clip-vit-large-patch14/raw/main/tokenizer.json
  const jsonText = await (await fetch("https://huggingface.co/" + name + "/raw/main/tokenizer.json")).text();  // could switch this to ./diffusion/tokenizer.json, it's already a file there
  return new TokenizerWasm(jsonText);
}

tvmjsGlobalEnv.getTokenizer = getTokenizer;
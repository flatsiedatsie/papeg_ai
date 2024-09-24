// WebLLM worker
import { WebWorkerMLCEngineHandler} from './webllm/web_llm_lib.js';

const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg) => {
	handler.onmessage(msg);
};

//console.log("HELLO FROM WEB LLM WORKER!");
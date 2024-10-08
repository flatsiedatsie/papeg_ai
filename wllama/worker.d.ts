/**
 * Module code will be copied into worker.
 *
 * Messages between main <==> worker:
 *
 * From main thread to worker:
 * - Send direction: { verb, args, callbackId }
 * - Result direction: { callbackId, result } or { callbackId, err }
 *
 * Signal from worker to main:
 * - Unidirection: { verb, args }
 */
interface Logger {
    debug: typeof console.debug;
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
}
interface TaskParam {
    verb: 'module.init' | 'fs.alloc' | 'fs.write' | 'wllama.start' | 'wllama.action' | 'wllama.exit' | 'wllama.debug';
    args: any[];
    callbackId: number;
}
interface Task {
    resolve: any;
    reject: any;
    param: TaskParam;
    buffers?: ArrayBuffer[];
}
export declare class ProxyToWorker {
    logger: Logger;
    suppressNativeLog: boolean;
    taskQueue: Task[];
    taskId: number;
    resultQueue: Task[];
    busy: boolean;
    worker?: Worker;
    pathConfig: any;
    multiThread: boolean;
    nbThread: number;
    constructor(pathConfig: any, nbThread: number | undefined, suppressNativeLog: boolean, logger: Logger);
    moduleInit(ggufFiles: {
        name: string;
        blob: Blob;
    }[]): Promise<void>;
    wllamaStart(): Promise<number>;
    wllamaAction(name: string, body: any): Promise<any>;
    wllamaExit(): Promise<void>;
    wllamaDebug(): Promise<any>;
    /**
     * Allocate a new file in heapfs
     * @returns fileId, to be used by fileWrite()
     */
    private fileAlloc;
    /**
     * Write a Blob to heapfs
     */
    private fileWrite;
    /**
     * Parse JSON result returned by cpp code.
     * Throw new Error if "__exception" is present in the response
     */
    private parseResult;
    /**
     * Push a new task to taskQueue
     */
    private pushTask;
    /**
     * Main loop for processing tasks
     */
    private runTaskLoop;
    /**
     * Handle messages from worker
     */
    private onRecvMsg;
    private abort;
}
export {};

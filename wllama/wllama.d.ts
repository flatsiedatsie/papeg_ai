import CacheManager from './cache-manager';
export interface WllamaConfig {
    /**
     * If true, suppress all log messages from native CPP code
     */
    suppressNativeLog?: boolean;
    /**
     * Custom logger functions
     */
    logger?: {
        debug: typeof console.debug;
        log: typeof console.log;
        warn: typeof console.warn;
        error: typeof console.error;
    };
    /**
     * Custom cache manager (only for advanced usage)
     */
    cacheManager?: CacheManager;
}
export interface AssetsPathConfig {
    'single-thread/wllama.js': string;
    'single-thread/wllama.wasm': string;
    'multi-thread/wllama.js'?: string;
    'multi-thread/wllama.wasm'?: string;
    'multi-thread/wllama.worker.mjs'?: string;
}
export interface LoadModelConfig {
    seed?: number;
    n_ctx?: number;
    n_batch?: number;
    n_threads?: number;
    embeddings?: boolean;
    offload_kqv?: boolean;
    pooling_type?: 'LLAMA_POOLING_TYPE_UNSPECIFIED' | 'LLAMA_POOLING_TYPE_NONE' | 'LLAMA_POOLING_TYPE_MEAN' | 'LLAMA_POOLING_TYPE_CLS';
    rope_scaling_type?: 'LLAMA_ROPE_SCALING_TYPE_UNSPECIFIED' | 'LLAMA_ROPE_SCALING_TYPE_NONE' | 'LLAMA_ROPE_SCALING_TYPE_LINEAR' | 'LLAMA_ROPE_SCALING_TYPE_YARN';
    rope_freq_base?: number;
    rope_freq_scale?: number;
    yarn_ext_factor?: number;
    yarn_attn_factor?: number;
    yarn_beta_fast?: number;
    yarn_beta_slow?: number;
    yarn_orig_ctx?: number;
    cache_type_k?: 'f16' | 'q8_0' | 'q4_0';
    cache_type_v?: 'f16';
}
export interface DownloadModelConfig extends LoadModelConfig {
    parallelDownloads?: number;
    progressCallback?: (opts: {
        loaded: number;
        total: number;
    }) => any;
    /**
     * Default: useCache = true
     */
    useCache?: boolean;
    /**
     * Default: useCache = false
     */
    allowOffline?: boolean;
}
export interface SamplingConfig {
    mirostat?: number;
    mirostat_tau?: number;
    temp?: number;
    top_p?: number;
    top_k?: number;
    penalty_last_n?: number;
    penalty_repeat?: number;
    penalty_freq?: number;
    penalty_present?: number;
    penalize_nl?: boolean;
    dynatemp_range?: number;
    dynatemp_exponent?: number;
    grammar?: string;
    n_prev?: number;
    n_probs?: number;
    min_p?: number;
    typical_p?: number;
    logit_bias?: {
        token: number;
        bias: number;
    }[];
}
export interface ChatCompletionOptions {
    nPredict?: number;
    onNewToken?(token: number, piece: Uint8Array, currentText: string, optionals: {
        abortSignal: () => any;
    }): any;
    sampling?: SamplingConfig;
    /**
     * List of custom token IDs for stopping the generation.
     * Note: To convert from text to token ID, use lookupToken()
     */
    stopTokens?: number[];
    /**
     * Equivalent to `cache_prompt` option in llama.cpp server.
     * Useful for chat, because it skip evaluating the history part of the conversation.
     */
    useCache?: boolean;
}
export interface ModelMetadata {
    hparams: {
        nVocab: number;
        nCtxTrain: number;
        nEmbd: number;
        nLayer: number;
    };
    meta: Record<string, string>;
}
export interface ContextOptions {
    /**
     * Allow switching between embeddings / generation mode. Useful for models like GritLM.
     */
    embeddings: boolean;
}
export interface LoadedContextInfo {
    n_vocab: number;
    n_ctx: number;
    n_batch: number;
    n_ubatch: number;
    n_ctx_train: number;
    n_embd: number;
    n_layer: number;
    metadata: Record<string, string>;
    token_bos: number;
    token_eos: number;
    token_eot: number;
    has_encoder: boolean;
    token_decoder_start: number;
    add_bos_token: boolean;
    add_eos_token: boolean;
}
/**
 * Logger preset with debug messages suppressed
 */
export declare const LoggerWithoutDebug: {
    debug: () => void;
    assert(condition?: boolean | undefined, ...data: any[]): void;
    clear(): void;
    count(label?: string | undefined): void;
    countReset(label?: string | undefined): void;
    dir(item?: any, options?: any): void;
    dirxml(...data: any[]): void;
    error(...data: any[]): void;
    group(...data: any[]): void;
    groupCollapsed(...data: any[]): void;
    groupEnd(): void;
    info(...data: any[]): void;
    log(...data: any[]): void;
    table(tabularData?: any, properties?: string[] | undefined): void;
    time(label?: string | undefined): void;
    timeEnd(label?: string | undefined): void;
    timeLog(label?: string | undefined, ...data: any[]): void;
    timeStamp(label?: string | undefined): void;
    trace(...data: any[]): void;
    warn(...data: any[]): void;
};
export type WllamaErrorType = 'model_not_loaded' | 'download_error' | 'load_error' | 'kv_cache_full' | 'unknown_error' | 'inference_error';
export declare class WllamaError extends Error {
    type: WllamaErrorType;
    constructor(message: string, type?: WllamaErrorType);
}
export declare class Wllama {
    cacheManager: CacheManager;
    private proxy;
    private config;
    private pathConfig;
    private useMultiThread;
    private useEmbeddings;
    private loadedContextInfo;
    private bosToken;
    private eosToken;
    private eotToken;
    private addBosToken;
    private addEosToken;
    private chatTemplate?;
    private metadata?;
    private samplingConfig;
    private hasEncoder;
    private decoderStartToken;
    private nCachedTokens;
    constructor(pathConfig: AssetsPathConfig, wllamaConfig?: WllamaConfig);
    private logger;
    private checkModelLoaded;
    /**
     * Check if the model is loaded via `loadModel()`
     */
    isModelLoaded(): boolean;
    /**
     * Get token ID associated to BOS (begin of sentence) token.
     *
     * NOTE: This can only being used after `loadModel` is called.
     *
     * @returns -1 if the model is not loaded.
     */
    getBOS(): number;
    /**
     * Get token ID associated to EOS (end of sentence) token.
     *
     * NOTE: This can only being used after `loadModel` is called.
     *
     * @returns -1 if the model is not loaded.
     */
    getEOS(): number;
    /**
     * Get token ID associated to EOT (end of turn) token.
     *
     * NOTE: This can only being used after `loadModel` is called.
     *
     * @returns -1 if the model is not loaded.
     */
    getEOT(): number;
    /**
     * Get token ID associated to token used by decoder, to start generating output sequence(only usable for encoder-decoder architecture). In other words, encoder uses normal BOS and decoder uses this token.
     *
     * NOTE: This can only being used after `loadModel` is called.
     *
     * @returns -1 if the model is not loaded.
     */
    getDecoderStartToken(): number;
    /**
     * Get model hyper-parameters and metadata
     *
     * NOTE: This can only being used after `loadModel` is called.
     *
     * @returns ModelMetadata
     */
    getModelMetadata(): ModelMetadata;
    /**
     * Check if we're currently using multi-thread build.
     *
     * NOTE: This can only being used after `loadModel` is called.
     *
     * @returns true if multi-thread is used.
     */
    isMultithread(): boolean;
    /**
     * Check if the current model uses encoder-decoder architecture
     *
     * NOTE: This can only being used after `loadModel` is called.
     *
     * @returns true if multi-thread is used.
     */
    isEncoderDecoderArchitecture(): boolean;
    /**
     * Must we add BOS token to the tokenized sequence?
     *
     * NOTE: This can only being used after `loadModel` is called.
     *
     * @returns true if BOS token must be added to the sequence
     */
    mustAddBosToken(): boolean;
    /**
     * Must we add EOS token to the tokenized sequence?
     *
     * NOTE: This can only being used after `loadModel` is called.
     *
     * @returns true if EOS token must be added to the sequence
     */
    mustAddEosToken(): boolean;
    /**
     * Get the jinja chat template comes with the model. It only available if the original model (before converting to gguf) has the template in `tokenizer_config.json`
     *
     * NOTE: This can only being used after `loadModel` is called.
     *
     * @returns the jinja template. null if there is no template in gguf
     */
    getChatTemplate(): string | null;
    /**
     * Parses a model URL and returns an array of URLs based on the following patterns:
     * - If the input URL is an array, it returns the array itself.
     * - If the input URL is a string in the `gguf-split` format, it returns an array containing the URL of each shard in ascending order.
     * - Otherwise, it returns an array containing the input URL as a single element array.
     * @param modelUrl URL or list of URLs
     */
    private parseModelUrl;
    /**
     * Download a model to cache, without loading it
     * @param modelUrl URL or list of URLs (in the correct order)
     * @param config
     */
    downloadModel(modelUrl: string | string[], config?: DownloadModelConfig): Promise<void>;
    /**
     * Load model from a given URL (or a list of URLs, in case the model is splitted into smaller files)
     * - If the model already been downloaded (via `downloadModel()`), then we will use the cached model
     * - Else, we download the model from internet
     * @param modelUrl URL or list of URLs (in the correct order)
     * @param config
     */
    loadModelFromUrl(modelUrl: string | string[], config?: DownloadModelConfig): Promise<void>;
    /**
     * Load model from a given list of Blob.
     *
     * You can pass multiple buffers into the function (in case the model contains multiple shards).
     *
     * @param ggufBlobs List of Blob that holds data of gguf file.
     * @param config LoadModelConfig
     */
    loadModel(ggufBlobs: Blob[], config?: LoadModelConfig): Promise<void>;
    getLoadedContextInfo(): LoadedContextInfo;
    /**
     * Calculate embedding vector for a given text.
     * By default, BOS and EOS tokens will be added automatically. You can use the "skipBOS" and "skipEOS" option to disable it.
     * @param text Input text
     * @returns An embedding vector
     */
    createEmbedding(text: string, options?: {
        skipBOS?: boolean;
        skipEOS?: boolean;
    }): Promise<number[]>;
    /**
     * Make completion for a given text.
     * @param prompt Input text
     * @param options
     * @returns Output completion text (only the completion part)
     */
    createCompletion(prompt: string, options: ChatCompletionOptions): Promise<string>;
    /**
     * Create or reset the ctx_sampling
     * @param config
     * @param pastTokens In case re-initializing the ctx_sampling, you can re-import past tokens into the new context
     */
    samplingInit(config: SamplingConfig, pastTokens?: number[]): Promise<void>;
    /**
     * Get a list of pieces in vocab.
     * NOTE: This function is slow, should only be used once.
     * @returns A list of Uint8Array. The nth element in the list associated to nth token in vocab
     */
    getVocab(): Promise<Uint8Array[]>;
    /**
     * Lookup to see if a token exist in vocab or not. Useful for searching special tokens like "<|im_start|>"
     * NOTE: It will match the whole token, so do not use it as a replacement for tokenize()
     * @param piece
     * @returns Token ID associated to the given piece. Returns -1 if cannot find the token.
     */
    lookupToken(piece: string): Promise<number>;
    /**
     * Convert a given text to list of tokens
     * @param text
     * @param special Should split special tokens?
     * @returns List of token ID
     */
    tokenize(text: string, special?: boolean): Promise<number[]>;
    /**
     * Convert a list of tokens to text
     * @param tokens
     * @returns Uint8Array, which maybe an unfinished unicode
     */
    detokenize(tokens: number[]): Promise<Uint8Array>;
    /**
     * Run llama_decode()
     * @param tokens A list of tokens to be decoded
     * @param options
     * @returns n_past (number of tokens so far in the sequence)
     */
    decode(tokens: number[], options: {
        skipLogits?: boolean;
    }): Promise<{
        nPast: number;
    }>;
    /**
     * Run llama_encode()
     * @param tokens A list of tokens to be encoded
     * @param options Unused for now
     * @returns n_past (number of tokens so far in the sequence)
     */
    encode(tokens: number[], options?: Record<never, never>): Promise<{
        nPast: number;
    }>;
    private breakTokensIntoBatches;
    /**
     * Sample a new token (remember to samplingInit() at least once before calling this function)
     * @returns the token ID and its detokenized value (which maybe an unfinished unicode)
     */
    samplingSample(): Promise<{
        piece: Uint8Array;
        token: number;
    }>;
    /**
     * Accept and save a new token to ctx_sampling
     * @param tokens
     */
    samplingAccept(tokens: number[]): Promise<void>;
    /**
     * Get softmax-ed probability of logits, can be used for custom sampling
     * @param topK Get top K tokens having highest logits value. If topK == -1, we return all n_vocab logits, but this is not recommended because it's slow.
     */
    getLogits(topK?: number): Promise<{
        token: number;
        p: number;
    }[]>;
    /**
     * Calculate embeddings for a given list of tokens. Output vector is always normalized
     * @param tokens
     * @returns A list of number represents an embedding vector of N dimensions
     */
    embeddings(tokens: number[]): Promise<number[]>;
    /**
     * Remove and shift some tokens from KV cache.
     * Keep n_keep, remove n_discard then shift the rest
     * @param nKeep
     * @param nDiscard
     */
    kvRemove(nKeep: number, nDiscard: number): Promise<void>;
    /**
     * Clear all tokens in KV cache
     */
    kvClear(): Promise<void>;
    /**
     * Save session to file (virtual file system)
     * TODO: add ability to download the file
     * @param filePath
     * @returns List of tokens saved to the file
     */
    sessionSave(filePath: string): Promise<{
        tokens: number[];
    }>;
    /**
     * Load session from file (virtual file system)
     * TODO: add ability to download the file
     * @param filePath
     *
     */
    sessionLoad(filePath: string): Promise<void>;
    /**
     * Set options for underlaying llama_context
     */
    setOptions(opt: ContextOptions): Promise<void>;
    /**
     * Unload the model and free all memory.
     *
     * Note: This function will NOT crash if model is not yet loaded
     */
    exit(): Promise<void>;
    /**
     * get debug info
     */
    _getDebugInfo(): Promise<any>;
    private getCachedTokens;
    /**
     * Compare the input sequence and cachedToken, then return the part that is not in cache.
     * This function also remove mismatch part in cache (via kvRemove)
     */
    private computeNonCachedTokens;
}

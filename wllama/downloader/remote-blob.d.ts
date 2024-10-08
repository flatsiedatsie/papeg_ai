import CacheManager from '../cache-manager';
type ProgressCallback = (opts: {
    loaded: number;
    total: number;
}) => any;
/**
 * WebBlob is a Blob implementation for web resources that supports range requests.
 */
interface GGUFRemoteBlobCreateOptions {
    /**
     * Custom fetch function to use instead of the default one, for example to use a proxy or edit headers.
     */
    fetch?: typeof fetch;
    useCache?: boolean;
    progressCallback?: ProgressCallback;
    startSignal?: Promise<void>;
    allowOffline: boolean;
    cacheManager: CacheManager;
    /**
     * Should we skip TEE the output stream?
     * Set to true if we only download model to cache, without reading it
     */
    noTEE: boolean;
    /**
     * Custom debug logger
     */
    logger?: {
        debug: (typeof console)['debug'];
    };
}
export declare class GGUFRemoteBlob extends Blob {
    static create(url: string, opts: GGUFRemoteBlobCreateOptions): Promise<Blob>;
    private cacheManager;
    private url;
    private etag;
    private start;
    private end;
    private contentType;
    private full;
    private fetch;
    private cachedStream?;
    private progressCallback;
    private startSignal?;
    private noTEE;
    constructor(url: string, start: number, end: number, full: boolean, customFetch: typeof fetch, additionals: {
        cachedStream?: ReadableStream;
        progressCallback: ProgressCallback;
        startSignal?: Promise<void>;
        etag: string;
        noTEE: boolean;
        cacheManager: CacheManager;
    });
    get size(): number;
    get type(): string;
    slice(): GGUFRemoteBlob;
    arrayBuffer(): Promise<ArrayBuffer>;
    text(): Promise<string>;
    stream(): ReturnType<Blob['stream']>;
    private fetchRange;
}
export {};

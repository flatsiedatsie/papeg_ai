// Adapted from https://github.com/huggingface/huggingface.js/blob/main/packages/hub/src/utils/WebBlob.ts
import { POLYFILL_ETAG, } from '../cache-manager.js';
export class GGUFRemoteBlob extends Blob {
    static async create(url, opts) {
        const { cacheManager } = opts;
        const customFetch = opts?.fetch ?? fetch;
        const cacheKey = url;
        let remoteFile;
        try {
            const response = await customFetch(url, { method: 'HEAD' });
            remoteFile = {
                originalURL: url,
                originalSize: Number(response.headers.get('content-length')),
                etag: (response.headers.get('etag') || '').replace(/[^A-Za-z0-9]/g, ''),
                // supportRange: response.headers.get('accept-ranges') === 'bytes';
            };
        }
        catch (err) {
            // connection error (i.e. offline)
            if (opts.allowOffline) {
                const cachedMeta = await cacheManager.getMetadata(cacheKey);
                if (cachedMeta) {
                    remoteFile = cachedMeta;
                }
                else {
                    throw new Error('Network error, cannot find requested model in cache for using offline');
                }
            }
            else {
                throw err;
            }
        }
        const cachedFileSize = await cacheManager.getSize(cacheKey);
        const cachedFile = await cacheManager.getMetadata(cacheKey);
        const skipCache = opts?.useCache === false;
        // migrate from old version: if metadata is polyfilled, we save the new metadata
        const metadataPolyfilled = cachedFile?.etag === POLYFILL_ETAG;
        if (metadataPolyfilled) {
            await cacheManager.writeMetadata(cacheKey, remoteFile);
        }
        const cachedFileValid = metadataPolyfilled ||
            (cachedFile &&
                remoteFile.etag === cachedFile.etag &&
                remoteFile.originalSize === cachedFileSize);
        if (cachedFileValid && !skipCache) {
            opts?.logger?.debug(`Using cached file ${cacheKey}`);
            const cachedFile = await cacheManager.open(cacheKey);
            (opts?.startSignal ?? Promise.resolve()).then(() => {
                opts?.progressCallback?.({
                    loaded: cachedFileSize,
                    total: cachedFileSize,
                });
            });
            return new GGUFRemoteBlob(url, 0, remoteFile.originalSize, true, customFetch, {
                cachedStream: cachedFile,
                progressCallback: () => { }, // unused
                etag: remoteFile.etag,
                noTEE: opts.noTEE,
                cacheManager: cacheManager,
            });
        }
        else {
            if (remoteFile.originalSize !== cachedFileSize) {
                opts?.logger?.debug(`Cache file is present, but size mismatch (cache = ${cachedFileSize} bytes, remote = ${remoteFile.originalSize} bytes)`);
            }
            if (cachedFile && remoteFile.etag !== cachedFile.etag) {
                opts?.logger?.debug(`Cache file is present, but ETag mismatch (cache = "${cachedFile.etag}", remote = "${remoteFile.etag}")`);
            }
            opts?.logger?.debug(`NOT using cache for ${cacheKey}`);
            return new GGUFRemoteBlob(url, 0, remoteFile.originalSize, true, customFetch, {
                progressCallback: opts?.progressCallback ?? (() => { }),
                startSignal: opts?.startSignal,
                etag: remoteFile.etag,
                noTEE: opts.noTEE,
                cacheManager: cacheManager,
            });
        }
    }
    cacheManager;
    url;
    etag;
    start;
    end;
    contentType = '';
    full;
    fetch;
    cachedStream;
    progressCallback;
    startSignal;
    noTEE;
    constructor(url, start, end, full, customFetch, additionals) {
        super([]);
        if (start !== 0) {
            throw new Error('start range must be 0');
        }
        this.url = url;
        this.start = start;
        this.end = end;
        this.contentType = '';
        this.full = full;
        this.fetch = customFetch;
        this.cachedStream = additionals.cachedStream;
        this.progressCallback = additionals.progressCallback;
        this.startSignal = additionals.startSignal;
        this.etag = additionals.etag;
        this.noTEE = additionals.noTEE;
        this.cacheManager = additionals.cacheManager;
    }
    get size() {
        return this.end - this.start;
    }
    get type() {
        return this.contentType;
    }
    slice() {
        throw new Error('Unsupported operation');
    }
    async arrayBuffer() {
        throw new Error('Unsupported operation');
    }
    async text() {
        throw new Error('Unsupported operation');
    }
    stream() {
        if (this.cachedStream) {
            return this.cachedStream;
        }
        const self = this;
        let loaded = 0;
        const stream = new TransformStream({
            transform(chunk, controller) {
                // if noTEE is set, we discard the chunk
                if (!self.noTEE) {
                    controller.enqueue(chunk);
                }
                loaded += chunk.byteLength;
                self.progressCallback({
                    loaded,
                    total: self.size,
                });
            },
            // @ts-ignore unused variable
            flush(controller) {
                self.progressCallback({
                    loaded: self.size,
                    total: self.size,
                });
            },
        });
        (async () => {
            if (this.startSignal) {
                await this.startSignal;
            }
            this.fetchRange()
                .then((response) => {
                const [src0, src1] = response.body.tee();
                src0.pipeThrough(stream);
                this.cacheManager.write(this.url, src1, {
                    originalSize: this.end,
                    originalURL: this.url,
                    etag: this.etag,
                });
            })
                .catch((error) => stream.writable.abort(error.message));
        })();
        return stream.readable;
    }
    fetchRange() {
        const fetch = this.fetch; // to avoid this.fetch() which is bound to the instance instead of globalThis
        if (this.full) {
            return fetch(this.url);
        }
        return fetch(this.url, {
            headers: {
                Range: `bytes=${this.start}-${this.end - 1}`,
            },
        });
    }
}
//# sourceMappingURL=remote-blob.js.map
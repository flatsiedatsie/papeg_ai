export declare const POLYFILL_ETAG = "polyfill_for_older_version";
export interface CacheEntry {
    /**
     * File name in OPFS, in the format: `${hashSHA1(fullURL)}_${fileName}`
     */
    name: string;
    /**
     * Size of file (in bytes)
     */
    size: number;
    /**
     * Other metadata
     */
    metadata: CacheEntryMetadata;
}
export interface CacheEntryMetadata {
    /**
     * ETag header from remote request
     * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
     */
    etag: string;
    /**
     * Remote file size (in bytes), used for integrity check
     */
    originalSize: number;
    /**
     * Original URL of the remote model. Unused for now
     */
    originalURL: string;
}
/**
 * Cache implementation using OPFS (Origin private file system)
 */
declare class CacheManager {
    /**
     * Convert a given URL into file name in cache.
     *
     * Format of the file name: `${hashSHA1(fullURL)}_${fileName}`
     */
    getNameFromURL(url: string): Promise<string>;
    /**
     * Write a new file to cache. This will overwrite existing file.
     *
     * @param name The file name returned by `getNameFromURL()` or `list()`
     */
    write(name: string, stream: ReadableStream, metadata: CacheEntryMetadata): Promise<void>;
    /**
     * Open a file in cache for reading
     *
     * @param name The file name returned by `getNameFromURL()` or `list()`
     * @returns ReadableStream, or null if file does not exist
     */
    open(name: string): Promise<ReadableStream | null>;
    /**
     * Get the size of a file in stored cache
     *
     * NOTE: in case the download is stopped mid-way (i.e. user close browser tab), the file maybe corrupted, size maybe different from `metadata.originalSize`
     *
     * @param name The file name returned by `getNameFromURL()` or `list()`
     * @returns number of bytes, or -1 if file does not exist
     */
    getSize(name: string): Promise<number>;
    /**
     * Get metadata of a cached file
     */
    getMetadata(name: string): Promise<CacheEntryMetadata | null>;
    /**
     * List all files currently in cache
     */
    list(): Promise<CacheEntry[]>;
    /**
     * Clear all files currently in cache
     */
    clear(): Promise<void>;
    /**
     * Delete a single file in cache
     *
     * @param nameOrURL Can be either an URL or a name returned by `getNameFromURL()` or `list()`
     */
    delete(nameOrURL: string): Promise<void>;
    /**
     * Delete multiple files in cache.
     *
     * @param predicate A predicate like `array.filter(item => boolean)`
     */
    deleteMany(predicate: (e: CacheEntry) => boolean): Promise<void>;
    /**
     * Write the metadata of the file to disk.
     *
     * This function is separated from `write()` for compatibility reason. In older version of wllama, there was no metadata for cached file, so when newer version of wllama loads a file created by older version, it will try to polyfill the metadata.
     */
    writeMetadata(name: string, metadata: CacheEntryMetadata): Promise<void>;
}
export default CacheManager;

import { GGUFRemoteBlob } from './remote-blob.js';
var State;
(function (State) {
    State[State["READY"] = 0] = "READY";
    State[State["WORKING"] = 1] = "WORKING";
    State[State["FINISHED"] = 2] = "FINISHED";
})(State || (State = {}));
export class MultiDownloads {
    tasks;
    maxParallel;
    progressCallback;
    logger;
    useCache;
    totalBytes = 0;
    allowOffline;
    noTEE;
    cacheManager;
    constructor(logger, urls, maxParallel, cacheManager, opts) {
        this.tasks = urls.map((url) => {
            // @ts-ignore
            const task = {
                url,
                state: State.READY,
                loaded: 0,
            };
            task.signalStart = new Promise((resolve) => (task.fireStart = resolve));
            task.signalEnd = new Promise((resolve) => (task.fireEnd = resolve));
            return task;
        });
        this.logger = logger;
        this.maxParallel = maxParallel;
        this.progressCallback = opts.progressCallback;
        this.useCache = opts.useCache;
        this.allowOffline = opts.allowOffline;
        this.noTEE = !!opts.noTEE;
        this.cacheManager = cacheManager;
    }
    async run() {
        // create all Blobs
        await Promise.all(this.tasks.map(async (task) => {
            task.blob = await GGUFRemoteBlob.create(task.url, {
                logger: this.logger,
                useCache: this.useCache,
                startSignal: task.signalStart,
                allowOffline: this.allowOffline,
                noTEE: this.noTEE,
                cacheManager: this.cacheManager,
                progressCallback: ({ loaded }) => {
                    task.loaded = loaded;
                    this.updateProgress(task);
                },
            });
        }));
        // calculate totalBytes
        this.totalBytes = this.tasks.reduce((n, task) => n + task.blob.size, 0);
        // run N dispatchers
        for (let i = 0; i < this.maxParallel; i++) {
            this.dispatcher();
        }
        return this.tasks.map((t) => t.blob);
    }
    updateProgress(task) {
        const progress = {
            loaded: this.tasks.reduce((n, task) => n + task.loaded, 0),
            total: this.totalBytes,
        };
        this.progressCallback?.(progress);
        if (task.loaded === task.blob.size) {
            // task finished
            task.state = State.FINISHED;
            task.fireEnd();
        }
    }
    async dispatcher() {
        while (true) {
            const task = this.tasks.find((t) => t.state === State.READY);
            if (!task)
                return;
            task.state = State.WORKING;
            task.fireStart();
            await task.signalEnd;
        }
    }
}
//# sourceMappingURL=multi-downloads.js.map
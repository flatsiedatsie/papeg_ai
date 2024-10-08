"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioFileToArray = void 0;
async function audioFileToArray(audioFileData) {
    const ctx = new OfflineAudioContext(1, 1, 44100);
    const reader = new FileReader();
    let audioBuffer = null;
    await new Promise((res) => {
        reader.addEventListener("loadend", (ev) => {
            const audioData = reader.result;
            ctx.decodeAudioData(audioData, (buffer) => {
                audioBuffer = buffer;
                ctx
                    .startRendering()
                    .then((renderedBuffer) => {
                    console.log("Rendering completed successfully");
                    res();
                })
                    .catch((err) => {
                    console.error(`Rendering failed: ${err}`);
                });
            }, (e) => {
                console.log(`Error with decoding audio data: ${e}`);
            });
        });
        reader.readAsArrayBuffer(audioFileData);
    });
    if (audioBuffer === null) {
        throw Error("Audio buffer was null");
    }
    let _audioBuffer = audioBuffer;
    let out = new Float32Array(_audioBuffer.length);
    for (let i = 0; i < _audioBuffer.length; i++) {
        for (let j = 0; j < _audioBuffer.numberOfChannels; j++) {
            // @ts-ignore
            out[i] += _audioBuffer.getChannelData(j)[i];
        }
    }
    return { audio: out, sampleRate: _audioBuffer.sampleRate };
}
exports.audioFileToArray = audioFileToArray;
//# sourceMappingURL=utils.js.map







"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvider = getProvider;
const whisper_api_provider_1 = require("./whisper-api.provider");
const whisper_local_provider_1 = require("./whisper-local.provider");
function getProvider() {
    const p = process.env.TRANSCRIPTION_PROVIDER ?? 'whisper-api';
    if (p === 'whisper-local')
        return whisper_local_provider_1.transcribeWithWhisperLocal;
    return whisper_api_provider_1.transcribeWithWhisperApi;
}
//# sourceMappingURL=index.js.map
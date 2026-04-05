"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const providers_1 = require("./providers");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '50mb' }));
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        provider: process.env.TRANSCRIPTION_PROVIDER ?? 'whisper-api',
    });
});
app.post('/transcribe', async (req, res) => {
    const { audio, language = 'es' } = req.body;
    if (!audio) {
        res.status(400).json({ error: 'Missing required field: audio (base64)' });
        return;
    }
    try {
        const buffer = Buffer.from(audio, 'base64');
        const result = await (0, providers_1.getProvider)()(buffer, language);
        res.json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[transcription-service] transcribe error:', message);
        res.status(500).json({ error: message });
    }
});
const port = parseInt(process.env.PORT ?? '3002', 10);
app.listen(port, () => {
    console.log(`[transcription-service] listening on port ${port} — provider: ${process.env.TRANSCRIPTION_PROVIDER ?? 'whisper-api'}`);
});
//# sourceMappingURL=server.js.map
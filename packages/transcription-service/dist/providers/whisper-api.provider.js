"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribeWithWhisperApi = transcribeWithWhisperApi;
async function transcribeWithWhisperApi(audioBuffer, language = 'es') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set. Set it in your environment variables to use the whisper-api provider.');
    }
    const formData = new FormData();
    formData.append('file', new Blob([new Uint8Array(audioBuffer)], { type: 'audio/webm' }), 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('language', language);
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Whisper API request failed with status ${response.status}: ${errorText}`);
    }
    const data = (await response.json());
    const segments = data.segments.map((seg) => ({
        text: seg.text.trim(),
        startTime: seg.start,
        endTime: seg.end,
    }));
    return { segments, durationSeconds: data.duration };
}
//# sourceMappingURL=whisper-api.provider.js.map
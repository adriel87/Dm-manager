import express from 'express';
import { getProvider } from './providers';

const app = express();
app.use(express.json({ limit: '50mb' }));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    provider: process.env.TRANSCRIPTION_PROVIDER ?? 'whisper-api',
  });
});

app.post('/transcribe', async (req, res) => {
  const { audio, language = 'es' } = req.body as { audio?: string; language?: string };

  if (!audio) {
    res.status(400).json({ error: 'Missing required field: audio (base64)' });
    return;
  }

  try {
    const buffer = Buffer.from(audio, 'base64');
    const result = await getProvider()(buffer, language);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[transcription-service] transcribe error:', message);
    res.status(500).json({ error: message });
  }
});

const port = parseInt(process.env.PORT ?? '3002', 10);
app.listen(port, () => {
  console.log(
    `[transcription-service] listening on port ${port} — provider: ${process.env.TRANSCRIPTION_PROVIDER ?? 'whisper-api'}`
  );
});

import os
import tempfile

from fastapi import FastAPI, File, Form, UploadFile
from faster_whisper import WhisperModel

MODEL_NAME = os.getenv("WHISPER__MODEL", "large-v3")
DEVICE = os.getenv("WHISPER__INFERENCE_DEVICE", "cpu")
COMPUTE_TYPE = os.getenv("WHISPER__COMPUTE_TYPE", "int8")

app = FastAPI(title="whisper-service")
model: WhisperModel | None = None


@app.on_event("startup")
def load_model() -> None:
    global model
    model = WhisperModel(MODEL_NAME, device=DEVICE, compute_type=COMPUTE_TYPE)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model": MODEL_NAME, "device": DEVICE}


@app.post("/v1/audio/transcriptions")
async def transcribe(
    file: UploadFile = File(...),
    response_format: str = Form(default="verbose_json"),
    language: str | None = Form(default=None),
) -> dict:
    assert model is not None

    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        segments_iter, info = model.transcribe(
            tmp_path,
            language=language or None,
            vad_filter=True,
        )
        segments = [
            {"id": i, "start": s.start, "end": s.end, "text": s.text.strip()}
            for i, s in enumerate(segments_iter)
        ]
        return {
            "task": "transcribe",
            "language": info.language,
            "duration": info.duration,
            "text": " ".join(s["text"] for s in segments),
            "segments": segments,
        }
    finally:
        os.unlink(tmp_path)

# Audio Pipeline — Cómo funciona la grabación

Este documento explica todos los conceptos técnicos involucrados en la grabación de audio de una sesión de Discord, desde que un jugador habla por el micrófono hasta que aparece el texto transcrito en el DM Manager.

---

## El viaje completo del audio

```
Micrófono del jugador
       │
       │  (señal analógica de voz)
       ▼
[Codificación Opus en el cliente Discord del jugador]
       │
       │  paquetes Opus (20ms por paquete, UDP)
       ▼
[Servidores de Discord (WebRTC)]
       │
       │  mismos paquetes Opus, reenviados al bot
       ▼
[Bot: @discordjs/voice — AudioReceiveStream]
       │
       │  frames Opus crudos en Node.js (Buffer)
       ▼
[Bot: ffmpeg — envuelve en contenedor OGG]
       │
       │  archivo OGG/Opus completo en memoria (Buffer)
       ▼
[Bot: base64-encode del Buffer]
       │
       │  string base64 en JSON
       ▼
[PUT /api/campaign/[id]/recordings/[rId]/stop]
       │
       │  DM Manager: Buffer.from(base64, 'base64')
       ▼
[DM Manager: StorageProvider.save() → disco local]
       │
       │  archivo {speakerId}.opus en storage/recordings/
       ▼
[POST /api/campaign/[id]/recordings/[rId]/transcribe]
       │
       │  DM Manager: lee el archivo del disco
       ▼
[OpenAI Whisper API o servidor Whisper local]
       │
       │  JSON con segmentos de texto + timestamps
       ▼
[DM Manager: guarda TranscriptionSegment[] en MongoDB]
       │
       ▼
[Play Mode UI: muestra el transcript por personaje]
```

---

## Glosario técnico

### Codec de audio

Un **codec** (de *coder-decoder*) es un algoritmo que comprime audio para reducir su tamaño y luego lo descomprime para reproducirlo. Sin codecs, 1 hora de audio a calidad CD ocuparía ~600 MB. Con Opus, la misma hora ocupa ~28 MB.

Existen dos tipos:
- **Lossy (con pérdida):** como MP3, AAC, Opus. Descartan datos que el oído humano no percibe bien. El audio resultante no es 100% idéntico al original pero ocupa mucho menos.
- **Lossless (sin pérdida):** como FLAC, WAV/PCM. Reproducen el audio exactamente. Útiles para edición profesional, pero innecesarios para transcripción de voz.

Para grabar voz en una sesión de rol, los codecs lossy son perfectamente adecuados.

---

### Opus

**Opus** es el codec de audio que usa Discord para comprimir la voz de los usuarios. Es el estándar de facto para comunicaciones de voz en tiempo real por internet.

Características clave para entender su uso aquí:

| Propiedad | Valor | Por qué importa |
|-----------|-------|----------------|
| Tipo | Lossy | Buen balance calidad/tamaño para voz |
| Bitrate | 6–510 kbps (Discord usa ~64 kbps) | A 64 kbps, 1h = ~28 MB por speaker |
| Tamaño de frame | 20 ms | Cada paquete UDP de Discord = 20ms de audio |
| Sample rate | 48.000 Hz | Alta fidelidad para voz |
| Latencia | ~26 ms | Diseñado para tiempo real |
| Uso | Discord, WebRTC, WhatsApp, Zoom | Estándar en comunicación IP |

Cuando Discord envía audio al bot a través de `@discordjs/voice`, los datos llegan como **frames Opus crudos**. Cada frame es un bloque de bytes que representa 20ms de voz comprimida. Son como los frames individuales de una película, pero para audio.

**El problema:** estos frames crudos son solo datos de audio sin ningún "envoltorio" que diga qué son, cuánto duran, ni cómo deben reproducirse. Para guardar y transmitir el audio de forma estándar, necesitamos un **contenedor**.

---

### Contenedor de audio (format vs codec)

Un **contenedor** es un archivo que empaqueta uno o más streams de audio (o video) junto con metadatos: duración, número de canales, timestamps para sincronización, etc.

La distinción importante:
- **Codec** = cómo está comprimido el audio (Opus, MP3, AAC)
- **Contenedor** = el "sobre" que envuelve ese audio (OGG, WebM, MP4, MKV)

Un mismo codec puede vivir en distintos contenedores:
- Opus en OGG → archivo `.opus` o `.ogg`
- Opus en WebM → archivo `.webm` (el que usa el navegador)
- AAC en MP4 → archivo `.m4a`

En este proyecto usamos **OGG/Opus**: el contenedor OGG envolviendo frames Opus. Whisper de OpenAI acepta este formato sin problemas.

---

### OGG

**OGG** es un contenedor de audio libre y abierto desarrollado por la Fundación Xiph.Org. Es el contenedor más común para Opus.

La estructura interna de un archivo OGG son "páginas". Cada página contiene:
- Una cabecera con información de sincronización
- Los frames de audio (en nuestro caso, Opus)
- Un número de secuencia para detectar pérdida de datos

Cuando `@discordjs/voice` te da frames Opus crudos, **no tiene cabecera OGG**. Tienes bytes de audio pero sin el "sobre". Whisper y la mayoría de reproductores rechazan esto. La tarea del bot es envolver esos frames en un contenedor OGG válido.

---

### Buffer

En Node.js, un **Buffer** es una región de memoria que contiene datos binarios. Es la forma nativa de trabajar con bytes en Node.js cuando no hay texto (imágenes, audio, archivos binarios).

```typescript
// Buffer de 4 bytes
const buf = Buffer.from([0x4f, 0x67, 0x67, 0x53]); // "OggS" — magic bytes de OGG

// Buffer a base64 (para enviar en JSON)
const base64 = buf.toString('base64'); // "T2dnUw=="

// Base64 de vuelta a Buffer (lo hace el DM Manager)
const back = Buffer.from(base64, 'base64');
```

En el contexto de la grabación:
1. `@discordjs/voice` emite frames Opus como Buffers
2. ffmpeg transforma esos Buffers en un Buffer de archivo OGG completo
3. El bot convierte ese Buffer a base64 string para enviarlo en JSON (JSON no puede contener bytes crudos)
4. El DM Manager recibe el string, lo convierte de vuelta a Buffer, y lo guarda en disco

---

### ffmpeg

**ffmpeg** es el procesador multimedia de código abierto más usado del mundo. Es una herramienta de línea de comandos (y librería) que puede leer, convertir y escribir prácticamente cualquier formato de audio y vídeo.

En este proyecto usamos ffmpeg para una tarea muy específica: **envolver frames Opus crudos en un contenedor OGG**, sin re-encodar el audio (solo *remuxing*, no *transcoding*).

#### ¿Por qué ffmpeg y no hacerlo manualmente?

Escribir un contenedor OGG manualmente requiere implementar el formato de páginas OGG (cabeceras de identificación Opus, cabeceras de comentarios, páginas de datos con checksums CRC-32, números de granulación para timestamps). Es posible pero complejo y propenso a errores sutiles. ffmpeg ya lo hace correctamente.

#### ¿Cómo lo usa el bot?

El bot lanzará ffmpeg como un proceso hijo de Node.js y le pasará audio por `stdin`, recibiendo el OGG resultante por `stdout`:

```
Node.js (frames Opus crudos) → [stdin] → ffmpeg → [stdout] → Node.js (Buffer OGG)
```

El comando equivalente en terminal sería:
```bash
# Leer Opus crudo desde stdin, escribir OGG a stdout (sin re-encodar)
ffmpeg -f opus -ar 48000 -ac 2 -i pipe:0 -f ogg -c:a copy pipe:1
```

Flags explicados:
- `-f opus` — el input es Opus crudo (no tiene cabecera, hay que decírselo)
- `-ar 48000` — sample rate 48kHz (el que usa Discord)
- `-ac 2` — 2 canales (estéreo, Discord envía estéreo)
- `-i pipe:0` — leer input desde stdin (file descriptor 0)
- `-f ogg` — el output debe ser contenedor OGG
- `-c:a copy` — copiar el stream de audio sin re-encodar (solo remux)
- `pipe:1` — escribir output a stdout (file descriptor 1)

#### ffmpeg-static

El paquete `ffmpeg-static` de npm descarga un binario de ffmpeg precompilado específico para tu plataforma (Linux/macOS/Windows). Esto evita que el bot requiera que ffmpeg esté instalado en el sistema operativo — el binario viene dentro de `node_modules`.

```typescript
import ffmpegPath from 'ffmpeg-static';
// ffmpegPath es algo como: /app/node_modules/ffmpeg-static/ffmpeg
```

---

### Per-speaker recording (grabación por speaker)

**El punto más crítico del diseño.**

Discord mezcla el audio de todos los participantes para enviárselo a los clientes (lo que escuchas en tus auriculares es un mix de todos). Sin embargo, `@discordjs/voice` tiene acceso al audio **antes** de ser mezclado — puede recibir los frames Opus de cada usuario por separado.

Esto es esencial porque:

1. **Calidad de transcripción**: Whisper transcribe mejor audio de un solo speaker que audio mezclado. Cuando varias personas hablan a la vez, la mezcla confunde al modelo.
2. **Atribución de speaker**: si grabamos todo mezclado, no sabemos quién dijo qué. Con audio separado, cada archivo tiene un `discordUserId` asociado, y el DM Manager puede etiquetar cada segmento del transcript con el nombre del personaje correcto.

#### Cómo funciona en `@discordjs/voice`

```typescript
import { EndBehaviorType } from '@discordjs/voice';

// Suscribirse al audio de UN usuario específico
const stream = voiceConnection.receiver.subscribe(userId, {
  end: {
    behavior: EndBehaviorType.AfterSilence,
    duration: 100, // ms de silencio antes de cerrar el stream
  }
});

// Este stream emite frames Opus crudos cada 20ms cuando el usuario habla
stream.on('data', (chunk: Buffer) => {
  // chunk = frame Opus de 20ms de ese usuario
});
```

El evento `speaking` de Discord notifica cuando un usuario empieza y deja de hablar:
```typescript
voiceConnection.receiver.speaking.on('start', (userId) => {
  // El usuario empezó a hablar → suscribirse a su stream
});
```

**Problema del late-join**: si un jugador se une al canal de voz después de que empiece la grabación, el bot tiene que detectarlo vía `voiceStateUpdate` y llamar a `subscribe()` para él también.

---

### WebRTC y por qué el audio llega en Opus

Discord usa **WebRTC** (Web Real-Time Communication) para transmitir audio. WebRTC es un protocolo diseñado para comunicación en tiempo real: baja latencia, tolerante a pérdida de paquetes, funciona sobre UDP.

WebRTC usa Opus obligatoriamente para audio de voz. Por eso, sin importar el micrófono o la configuración del usuario, el bot siempre recibe Opus — es el único codec que Discord usa en sus canales de voz.

---

### Base64

**Base64** es una codificación que convierte datos binarios (bytes arbitrarios) en texto ASCII legible. Se usa para transmitir datos binarios en sistemas que solo admiten texto, como JSON.

- 3 bytes binarios → 4 caracteres base64
- El tamaño aumenta un 33% al codificar

```
Bytes:   [0x4F 0x67 0x67] → Base64: "T2dn"
```

El flujo en este proyecto:
```
Buffer OGG (binario) → base64 string → JSON body → HTTP PUT → DM Manager
DM Manager: base64 string → Buffer.from(str, 'base64') → guarda en disco
```

Alternativa que no usamos: `multipart/form-data` (como hace el navegador con formularios de archivos). Usamos base64 en JSON para simplificar el contrato de la API.

---

### Whisper

**Whisper** es el modelo de transcripción de voz de OpenAI. Acepta un archivo de audio y devuelve el texto hablado con timestamps.

El proyecto soporta dos modos:

#### Whisper API (default)
- Llamas a `https://api.openai.com/v1/audio/transcriptions`
- Subes el archivo de audio como `multipart/form-data`
- OpenAI lo procesa en sus servidores
- Requiere `OPENAI_API_KEY` y tiene coste por minuto de audio (~$0.006/min)

#### Whisper local
- Corres tu propio servidor compatible con la API de OpenAI (ej: `faster-whisper-server`, `whisper.cpp`)
- El DM Manager llama a `http://localhost:8080/v1/audio/transcriptions`
- Requiere GPU para ser rápido, pero sin coste por uso
- Se activa con `TRANSCRIPTION_PROVIDER=whisper-local` y `WHISPER_LOCAL_URL=http://...`

Ambas opciones esperan el mismo formato de archivo: el DM Manager envía el Buffer del archivo `.opus` (contenedor OGG/Opus) con `Content-Type: audio/webm`. Whisper detecta el codec real del contenido aunque el MIME type diga `audio/webm` — acepta OGG/Opus sin problema.

---

### AudioReceiveStream

`AudioReceiveStream` es la clase de `@discordjs/voice` que representa el stream de audio de un único usuario en Discord.

```
AudioReceiveStream
  ├── Emite: 'data' con Buffer de frame Opus (20ms)
  ├── Emite: 'end' cuando el usuario deja de hablar (configurable)
  └── Emite: 'error' en casos de error de red
```

El bot crea uno por cada usuario activo en el canal. Cuando el stream termina (silencio de 100ms), el bot acumula los frames y espera a que el usuario vuelva a hablar para crear un nuevo stream. Todos los frames del mismo usuario se van concatenando en su `speakerBuffer`.

---

## Resumen: ¿por qué cada pieza?

| Componente | Por qué existe |
|-----------|---------------|
| **Opus** | Discord usa este codec obligatoriamente en voz |
| **OGG** | Contenedor necesario para que Whisper y los reproductores acepten el audio |
| **ffmpeg** | Envuelve los frames Opus crudos de Discord en un contenedor OGG válido |
| **Per-speaker** | Para atribuir texto a personajes y mejorar calidad de transcripción |
| **Buffer** | Tipo Node.js para manejar el audio como datos binarios en memoria |
| **Base64** | Convierte el Buffer a texto para enviarlo en un JSON HTTP |
| **Whisper** | Convierte el audio OGG/Opus en texto con timestamps |

---

## Diagrama del flujo de datos en el bot (Fase 3)

```
[voiceConnection.receiver]
  │
  ├── speaking.on('start', userId)
  │     └── subscribe(userId) → AudioReceiveStream
  │                                     │
  │                              data chunks (Opus)
  │                                     │
  │                                     ▼
  │                            [OpusAccumulator]
  │                            chunks[] en memoria
  │
  └── (silencio 100ms) → stream.end()
        └── re-subscribe cuando vuelve a hablar

[/dm-record stop]
  │
  ├── Para todos los OpusAccumulators
  ├── Pipe cada uno por ffmpeg → Buffer OGG/Opus
  ├── base64(Buffer) por speaker
  │
  └── PUT /api/campaign/[id]/recordings/[rId]/stop
        body: { audioData: { userId1: "base64...", userId2: "base64..." }, durationSeconds: 3600 }
```

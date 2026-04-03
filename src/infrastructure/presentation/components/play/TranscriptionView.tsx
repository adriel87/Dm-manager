'use client';

// Local view types — mirror API response shape, no domain imports
interface TranscriptionSegmentView {
  speakerDiscordUserId: string;
  speakerLabel: string;
  text: string;
  startTime: number;
  endTime: number;
}

interface SpeakerMappingView {
  discordUserId: string;
  discordUsername: string;
  characterId: string | null;
  characterName: string | null;
  label: string;
  role: 'player' | 'dm';
}

interface TranscriptionViewProps {
  segments: TranscriptionSegmentView[];
  speakers: SpeakerMappingView[];
}

// Predefined palette for speaker dot colors
const SPEAKER_COLORS = [
  'bg-blue-400',
  'bg-emerald-400',
  'bg-amber-400',
  'bg-purple-400',
  'bg-rose-400',
  'bg-cyan-400',
  'bg-orange-400',
  'bg-pink-400',
];

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Renders transcription segments as a chat-like conversation log.
 * Groups consecutive segments from the same speaker to avoid repetition.
 */
export function TranscriptionView({ segments, speakers }: TranscriptionViewProps) {
  // Build a stable color index per speaker
  const speakerColorMap = new Map<string, string>();
  speakers.forEach((sp, index) => {
    speakerColorMap.set(sp.discordUserId, SPEAKER_COLORS[index % SPEAKER_COLORS.length]);
  });

  // Assign colors for speakers not in the mapping (fallback by label)
  let fallbackIndex = speakers.length;
  segments.forEach((seg) => {
    if (!speakerColorMap.has(seg.speakerDiscordUserId)) {
      speakerColorMap.set(
        seg.speakerDiscordUserId,
        SPEAKER_COLORS[fallbackIndex % SPEAKER_COLORS.length]
      );
      fallbackIndex++;
    }
  });

  // Group consecutive segments by same speaker
  interface SegmentGroup {
    speakerDiscordUserId: string;
    speakerLabel: string;
    startTime: number;
    lines: { text: string; startTime: number }[];
  }

  const groups: SegmentGroup[] = [];
  for (const seg of segments) {
    const last = groups[groups.length - 1];
    if (last && last.speakerDiscordUserId === seg.speakerDiscordUserId) {
      last.lines.push({ text: seg.text, startTime: seg.startTime });
    } else {
      groups.push({
        speakerDiscordUserId: seg.speakerDiscordUserId,
        speakerLabel: seg.speakerLabel,
        startTime: seg.startTime,
        lines: [{ text: seg.text, startTime: seg.startTime }],
      });
    }
  }

  if (segments.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-zinc-500 text-sm">Sin segmentos de transcripción.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-zinc-300 text-sm font-semibold">Transcripción</h3>
        <span className="text-zinc-500 text-xs">({segments.length} segmentos)</span>
      </div>

      {/* Scrollable conversation log */}
      <div
        className="overflow-y-auto max-h-96 flex flex-col gap-3 pr-1"
        aria-label="Transcripción de la grabación"
        role="log"
      >
        {groups.map((group, groupIndex) => {
          const dotColor = speakerColorMap.get(group.speakerDiscordUserId) ?? 'bg-zinc-400';
          return (
            <div key={`${group.speakerDiscordUserId}-${groupIndex}`} className="flex flex-col gap-1">
              {/* Speaker header */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2 h-2 rounded-full shrink-0 ${dotColor}`}
                  aria-hidden="true"
                />
                <span className="text-zinc-300 text-xs font-semibold">{group.speakerLabel}</span>
                <span className="text-zinc-600 text-xs">{formatTimestamp(group.startTime)}</span>
              </div>

              {/* Lines */}
              <div className="ml-4 flex flex-col gap-0.5">
                {group.lines.map((line, lineIndex) => (
                  <p
                    key={lineIndex}
                    className="text-zinc-300 text-sm leading-relaxed"
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

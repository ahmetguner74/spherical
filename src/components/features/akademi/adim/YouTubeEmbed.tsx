"use client";

// ============================================
// YouTubeEmbed — Responsive YouTube iframe
// ============================================

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
}

/**
 * YouTube video ID veya URL'den video ID cikartir.
 * Desteklenen formatlar:
 * - "dQw4w9WgXcQ" (sadece ID)
 * - "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 * - "https://youtu.be/dQw4w9WgXcQ"
 * - "https://www.youtube.com/embed/dQw4w9WgXcQ"
 */
function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // youtube.com/watch?v=ID
  const watchMatch = trimmed.match(
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/
  );
  if (watchMatch) return watchMatch[1];

  // youtu.be/ID
  const shortMatch = trimmed.match(
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (shortMatch) return shortMatch[1];

  // youtube.com/embed/ID
  const embedMatch = trimmed.match(
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  if (embedMatch) return embedMatch[1];

  // Bare ID (11 karakter, alfanumerik + _ -)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  return null;
}

export function YouTubeEmbed({ videoId, title }: YouTubeEmbedProps) {
  const id = extractVideoId(videoId);
  if (!id) return null;

  return (
    <div className="aspect-video rounded-lg overflow-hidden border border-[var(--border)]">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title ?? "YouTube Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="w-full h-full"
      />
    </div>
  );
}

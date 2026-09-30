/**
 * YouTube URL Parser & Security Validator
 * Strictly validates YouTube URLs (youtube.com / youtu.be), extracts video & playlist IDs,
 * and provides safe thumbnail URLs with fallback handling.
 */

export interface ParsedYouTubeResource {
  isValid: boolean;
  type: "video" | "playlist";
  videoId: string | null;
  playlistId: string | null;
  thumbnailUrl: string;
}

// Fallback high-contrast SVG thumbnail placeholder for playlists without a video ID or on image load failure
export const DEFAULT_THUMBNAIL_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" fill="none">
      <rect width="640" height="360" fill="#1C1814"/>
      <circle cx="320" cy="180" r="44" fill="#B8860B" fill-opacity="0.18" stroke="#D4AF37" stroke-width="2"/>
      <polygon points="312,164 336,180 312,196" fill="#F5E4B7"/>
      <text x="320" y="248" fill="#D4AF37" font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle" letter-spacing="1.5">LEARNING RESOURCE</text>
    </svg>
  `);

export function parseYouTubeUrl(rawUrl: string, declaredType?: "video" | "playlist"): ParsedYouTubeResource {
  const fallback: ParsedYouTubeResource = {
    isValid: false,
    type: declaredType || "video",
    videoId: null,
    playlistId: null,
    thumbnailUrl: DEFAULT_THUMBNAIL_PLACEHOLDER,
  };

  if (!rawUrl || typeof rawUrl !== "string") {
    return fallback;
  }

  const trimmed = rawUrl.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    console.warn(`[LearningHub] Invalid URL string: "${trimmed}"`);
    return fallback;
  }

  // Security: strict protocol check
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    console.warn(`[LearningHub] Rejected non-HTTP protocol: "${parsed.protocol}" in "${trimmed}"`);
    return fallback;
  }

  // Security: strict YouTube domain validation
  const hostname = parsed.hostname.toLowerCase();
  const isYouTubeHost =
    hostname === "youtube.com" ||
    hostname === "www.youtube.com" ||
    hostname === "m.youtube.com" ||
    hostname === "music.youtube.com" ||
    hostname === "youtu.be";

  if (!isYouTubeHost) {
    console.warn(`[LearningHub] Rejected non-YouTube host "${hostname}" for URL: "${trimmed}"`);
    return fallback;
  }

  let videoId: string | null = null;
  let playlistId: string | null = null;

  if (hostname === "youtu.be") {
    // Format: https://youtu.be/{videoId}
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts[0]) {
      videoId = pathParts[0];
    }
    playlistId = parsed.searchParams.get("list");
  } else {
    // Format: https://www.youtube.com/watch?v={videoId}
    if (parsed.pathname === "/watch") {
      videoId = parsed.searchParams.get("v");
      playlistId = parsed.searchParams.get("list");
    } else if (parsed.pathname.startsWith("/shorts/")) {
      // Format: https://www.youtube.com/shorts/{videoId}
      videoId = parsed.pathname.replace("/shorts/", "").split("/")[0] || null;
    } else if (parsed.pathname.startsWith("/embed/")) {
      // Format: https://www.youtube.com/embed/{videoId}
      videoId = parsed.pathname.replace("/embed/", "").split("/")[0] || null;
    } else if (parsed.pathname === "/playlist") {
      // Format: https://www.youtube.com/playlist?list={playlistId}
      playlistId = parsed.searchParams.get("list");
      videoId = parsed.searchParams.get("v");
    }
  }

  // Sanitize IDs (standard YouTube video IDs are 11 alphanumeric, underscore or hyphen characters)
  if (videoId && !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    // If not matching standard 11 chars, verify it's safe characters only
    if (!/^[a-zA-Z0-9_-]+$/.test(videoId)) {
      console.warn(`[LearningHub] Malformed video ID extracted: "${videoId}"`);
      videoId = null;
    }
  }

  if (playlistId && !/^[a-zA-Z0-9_-]+$/.test(playlistId)) {
    console.warn(`[LearningHub] Malformed playlist ID extracted: "${playlistId}"`);
    playlistId = null;
  }

  const determinedType: "video" | "playlist" =
    declaredType ?? (playlistId && !videoId ? "playlist" : "video");

  let thumbnailUrl = DEFAULT_THUMBNAIL_PLACEHOLDER;
  if (videoId) {
    thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  return {
    isValid: Boolean(videoId || playlistId),
    type: determinedType,
    videoId,
    playlistId,
    thumbnailUrl,
  };
}

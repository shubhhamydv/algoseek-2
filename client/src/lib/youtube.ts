export function buildYouTubeWatchUrl(videoId: string, startSec: number) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&t=${Math.max(0, Math.floor(startSec))}s`;
}

export function buildYouTubeEmbedUrl(videoId: string, startSec: number) {
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?start=${Math.max(0, Math.floor(startSec))}&rel=0`;
}

export function selectedLecturePlayback(citation: { videoId: string; startSec: number }) {
  return { watchUrl: buildYouTubeWatchUrl(citation.videoId, citation.startSec), embedUrl: buildYouTubeEmbedUrl(citation.videoId, citation.startSec) };
}

import { describe, expect, it } from "vitest";
import { selectedLecturePlayback } from "../client/src/lib/youtube";

describe("selected lecture playback contract", () => {
  it("uses the same exact timestamp for the full YouTube link and embedded player", () => {
    const selected = { videoId: "abc123", startSec: 724.9 };
    const playback = selectedLecturePlayback(selected);
    expect(playback.watchUrl).toBe("https://www.youtube.com/watch?v=abc123&t=724s");
    expect(playback.embedUrl).toBe("https://www.youtube.com/embed/abc123?start=724&rel=0");
    expect(new URL(playback.watchUrl).searchParams.get("t")).toBe("724s");
    expect(new URL(playback.embedUrl).searchParams.get("start")).toBe("724");
  });
});

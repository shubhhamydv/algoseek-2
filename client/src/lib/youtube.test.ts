import { describe, expect, it } from "vitest";
import { selectedLecturePlayback } from "./youtube";

describe("selected lecture playback", () => {
  it("propagates one exact timestamp to YouTube and the embedded player", () => {
    const playback = selectedLecturePlayback({ videoId: "abc123", startSec: 724.9 });
    expect(playback.watchUrl).toBe("https://www.youtube.com/watch?v=abc123&t=724s");
    expect(playback.embedUrl).toBe("https://www.youtube.com/embed/abc123?start=724&rel=0");
    expect(playback.watchUrl).toContain("t=724s");
    expect(playback.embedUrl).toContain("start=724");
  });
});

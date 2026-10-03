const STORAGE_KEY = "unstuck_device_id";

/**
 * Returns a persistent anonymous device identifier for this browser session.
 * Generates a random UUID once on first load, saves it to localStorage,
 * and reuses the exact same identifier across all subsequent reloads/visits.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined" || !window.localStorage) {
    return "anonymous-device-ssr";
  }

  let deviceId = localStorage.getItem(STORAGE_KEY);
  if (!deviceId || !deviceId.trim()) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      deviceId = crypto.randomUUID();
    } else {
      deviceId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    try {
      localStorage.setItem(STORAGE_KEY, deviceId);
    } catch {
      // localStorage may be disabled in restricted iframe/incognito environments
    }
  }

  return deviceId;
}

/** Extract an 11-char YouTube video id from common URL shapes, or null. */
export function parseYoutubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = url.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;

      const parts = url.pathname.split("/").filter(Boolean);
      const kind = parts[0];
      const id = parts[1];
      if (
        (kind === "embed" || kind === "shorts" || kind === "live") &&
        id &&
        /^[A-Za-z0-9_-]{11}$/.test(id)
      ) {
        return id;
      }
    }
  } catch {
    return null;
  }

  return null;
}

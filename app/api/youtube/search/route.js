export const runtime = "nodejs";

function readInitialData(html) {
  const markers = ["var ytInitialData = ", "window[\"ytInitialData\"] = ", "ytInitialData = "];
  for (const marker of markers) {
    const markerIndex = html.indexOf(marker);
    if (markerIndex < 0) continue;
    const start = html.indexOf("{", markerIndex + marker.length);
    if (start < 0) continue;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < html.length; index += 1) {
      const character = html[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === "\"") inString = false;
        continue;
      }
      if (character === "\"") inString = true;
      else if (character === "{") depth += 1;
      else if (character === "}" && --depth === 0) return JSON.parse(html.slice(start, index + 1));
    }
  }
  return null;
}

function textFromRuns(value) {
  return value?.simpleText || value?.runs?.map(run => run.text || "").join("") || "";
}

function collectVideos(value, output, seen) {
  if (!value || output.length >= 12) return;
  if (Array.isArray(value)) {
    for (const item of value) collectVideos(item, output, seen);
    return;
  }
  if (typeof value !== "object") return;
  const video = value.videoRenderer || value.compactVideoRenderer;
  if (video?.videoId && !seen.has(video.videoId)) {
    seen.add(video.videoId);
    output.push({
      videoId: video.videoId,
      title: textFromRuns(video.title) || "タイトルなし",
      channelTitle: textFromRuns(video.ownerText) || textFromRuns(video.longBylineText) || "YouTube",
      thumbnail: video.thumbnail?.thumbnails?.at(-1)?.url || `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`,
    });
  }
  for (const child of Object.values(value)) collectVideos(child, output, seen);
}

export async function GET(request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 100);
  if (!query) {
    return Response.json({ error: "検索キーワードを入力してください。" }, { status: 400 });
  }

  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&hl=ja&gl=JP`;
    const response = await fetch(searchUrl, {
      cache: "no-store",
      headers: {
        "Accept-Language": "ja-JP,ja;q=0.9",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36",
        Cookie: "SOCS=CAI",
      },
    });
    if (!response.ok) {
      return Response.json({ error: "YouTube検索に接続できませんでした。" }, { status: response.status });
    }
    const data = readInitialData(await response.text());
    const items = [];
    collectVideos(data, items, new Set());
    if (!items.length) {
      return Response.json({ error: "検索結果を読み込めませんでした。少し時間を置いて再検索してください。" }, { status: 502 });
    }
    return Response.json({ items });
  } catch {
    return Response.json({ error: "YouTube検索との通信に失敗しました。" }, { status: 502 });
  }
}

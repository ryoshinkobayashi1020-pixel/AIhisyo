/* =========================================================
   AI社員オフィス - フロントエンド プロトタイプ
   音声認識(Web Speech API) + 音声合成 + モック成果物生成
   ========================================================= */

const STAFF = [
  { id: "yuki",    name: "ゆき",   role: "YouTube台本制作",     emoji: "🎬", grad: ["#ff9ec4", "#ff7aa2"] },
  { id: "mirai",   name: "みらい", role: "TikTok台本制作",      emoji: "📱", grad: ["#8fd8ff", "#5eb8ff"] },
  { id: "akari",   name: "あかり", role: "UGC動画制作",         emoji: "🎥", grad: ["#ffd08a", "#ffb35c"] },
  { id: "sora",    name: "そら",   role: "Instagram投稿制作",   emoji: "📸", grad: ["#c3a8ff", "#a37bff"] },
  { id: "tsumugi", name: "つむぎ", role: "サムネイルデザイン",  emoji: "🎨", grad: ["#8ff0c9", "#4fdba0"] },
  { id: "hinata",  name: "ひなた", role: "SNS運用戦略",         emoji: "📊", grad: ["#ffe08a", "#ffc94c"] },
  { id: "aoi",     name: "あおい", role: "ブログ記事執筆",      emoji: "✍️", grad: ["#9fd6ff", "#6fb8ff"] },
  { id: "ren",     name: "れん",   role: "SEOリサーチ",         emoji: "🔍", grad: ["#ffb3d1", "#ff8bb8"] },
  { id: "koharu",  name: "こはる", role: "動画編集",            emoji: "✂️", grad: ["#b6f0a1", "#8de07a"] },
  { id: "itsuki",  name: "いつき", role: "トレンド・ハッシュタグ調査", emoji: "#️⃣", grad: ["#ffcf9e", "#ffab5e"] },
  { id: "nodoka",  name: "のどか", role: "コメント・DM対応",    emoji: "💬", grad: ["#c9b8ff", "#a68bff"] },
  { id: "madoka",  name: "まどか", role: "週次レポート作成",    emoji: "📈", grad: ["#ffb0b0", "#ff8080"] },
];

const TEAMS = [
  { id: "video",    name: "動画チーム",           desc: "YouTube・TikTok・動画編集", icon: "🎬", t: ["#ff9ec4", "#ff5c8a"], staff: ["yuki", "mirai", "koharu"] },
  { id: "sns",      name: "SNS運用チーム",        desc: "Instagram・戦略・コメント対応", icon: "📱", t: ["#7fc8ff", "#4fa9ff"], staff: ["sora", "hinata", "nodoka"] },
  { id: "content",  name: "コンテンツ制作チーム",  desc: "UGC動画・ブログ・デザイン", icon: "🎨", t: ["#b18cff", "#8f5fff"], staff: ["akari", "aoi", "tsumugi"] },
  { id: "research", name: "リサーチ&分析チーム",   desc: "SEO・トレンド調査・レポート", icon: "📊", t: ["#7fe8c0", "#3fcf9a"], staff: ["ren", "itsuki", "madoka"] },
];

// per-staff runtime state
const state = {};
STAFF.forEach(s => {
  state[s.id] = {
    status: "idle",        // idle | working | review
    lastInstruction: "",
    deliverable: "",
    _completedToday: false,
  };
});

let doneToday = 0;
let activeModalStaffId = null;
let activeResultStaffId = null;

const $ = sel => document.querySelector(sel);
const officeFloor = $("#officeFloor");
const logList = $("#logList");

/* ---------------- speech synthesis ---------------- */
let voices = [];
function loadVoices() {
  voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
}
if (window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function speak(text, staffIndex = 0) {
  if (!window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  const jaVoice = voices.find(v => v.lang && v.lang.startsWith("ja"));
  if (jaVoice) utter.voice = jaVoice;
  utter.lang = "ja-JP";
  // give each staff a slightly different personality via pitch/rate
  utter.pitch = 0.9 + (staffIndex % 6) * 0.07;
  utter.rate = 1.0;
  window.speechSynthesis.speak(utter);
}

/* ---------------- speech recognition ---------------- */
const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognitionCtor) {
  $("#voiceWarning").hidden = false;
}

/* ---------------- rendering ---------------- */
function statusMeta(status) {
  if (status === "working") return { label: "作業中", cls: "working" };
  if (status === "review") return { label: "要確認", cls: "review" };
  return { label: "待機中", cls: "idle" };
}

function mascotFigureHTML(staff, statusCls) {
  return `
    <div class="mascot ${statusCls === "working" ? "working" : "idle"}" style="--c1:${staff.grad[0]};--c2:${staff.grad[1]};">
      <div class="m-hair"></div>
      <div class="m-face">
        <div class="m-eyes"><span></span><span></span></div>
        <div class="m-blush l"></div>
        <div class="m-blush r"></div>
      </div>
      <div class="m-body"></div>
    </div>
  `;
}

function renderMascotTile(staff) {
  const s = state[staff.id];
  const meta = statusMeta(s.status);
  const tile = document.createElement("button");
  tile.type = "button";
  tile.className = `mascot-tile ${meta.cls}`;
  tile.id = `tile-${staff.id}`;
  tile.dataset.id = staff.id;

  tile.innerHTML = `
    <div class="speech-bubble-pop" id="bubble-${staff.id}"></div>
    ${mascotFigureHTML(staff, meta.cls)}
    <p class="mascot-name-tag">${staff.name}</p>
    <p class="mascot-role">${staff.role}</p>
    <span class="mascot-status-chip">${meta.label}${s.status === "review" ? " 📄" : ""}</span>
    ${s.status === "working" ? `<div class="mascot-mini-progress" style="--c1:${staff.grad[0]};--c2:${staff.grad[1]};"><div class="mascot-mini-progress-fill" id="progress-${staff.id}"></div></div>` : ""}
  `;
  return tile;
}

function renderTeamRoom(team) {
  const room = document.createElement("section");
  room.className = "team-room";
  room.id = `team-${team.id}`;
  room.style.setProperty("--t1", team.t[0]);
  room.style.setProperty("--t2", team.t[1]);

  const completed = team.staff.filter(id => state[id]._completedToday).length;
  const total = team.staff.length;

  room.innerHTML = `
    <div class="team-header">
      <div class="team-icon">${team.icon}</div>
      <div class="team-title-block">
        <h2>${team.name}</h2>
        <p>${team.desc}</p>
      </div>
      <div class="team-progress-badge" id="teamBadge-${team.id}">${completed}/${total} 完了</div>
    </div>
    <div class="team-progress-track"><div class="team-progress-fill" id="teamProgress-${team.id}" style="width:${(completed / total) * 100}%"></div></div>
    <div class="mascot-row" id="mascotRow-${team.id}"></div>
  `;
  const row = room.querySelector(`#mascotRow-${team.id}`);
  team.staff.forEach(staffId => {
    const staff = STAFF.find(s => s.id === staffId);
    row.appendChild(renderMascotTile(staff));
  });
  return room;
}

function updateTeamProgress(team) {
  const completed = team.staff.filter(id => state[id]._completedToday).length;
  const total = team.staff.length;
  const badge = document.getElementById(`teamBadge-${team.id}`);
  const fill = document.getElementById(`teamProgress-${team.id}`);
  if (badge) badge.textContent = `${completed}/${total} 完了`;
  if (fill) fill.style.width = `${(completed / total) * 100}%`;
}

function renderAll() {
  officeFloor.innerHTML = "";
  TEAMS.forEach(team => officeFloor.appendChild(renderTeamRoom(team)));
  updateStats();
}

function findTeamOf(staffId) {
  return TEAMS.find(t => t.staff.includes(staffId));
}

function updateCard(staffId) {
  const staff = STAFF.find(s => s.id === staffId);
  const old = document.getElementById(`tile-${staffId}`);
  const fresh = renderMascotTile(staff);
  old.replaceWith(fresh);
  const team = findTeamOf(staffId);
  if (team) updateTeamProgress(team);
}

function updateStats() {
  const working = STAFF.filter(s => state[s.id].status === "working").length;
  const review = STAFF.filter(s => state[s.id].status === "review").length;
  $("#statWorking").textContent = working;
  $("#statReview").textContent = review;
  $("#statDone").textContent = doneToday;
}

function showBubble(staffId, text, ms = 4200) {
  const bubble = document.getElementById(`bubble-${staffId}`);
  if (!bubble) return;
  bubble.textContent = text;
  bubble.classList.add("show");
  clearTimeout(bubble._t);
  bubble._t = setTimeout(() => bubble.classList.remove("show"), ms);
}

function addLog(emoji, text) {
  const empty = logList.querySelector(".log-empty");
  if (empty) empty.remove();
  const item = document.createElement("div");
  item.className = "log-item";
  const now = new Date();
  const time = now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  item.innerHTML = `
    <span class="log-emoji">${emoji}</span>
    <div>
      <div class="log-text">${text}</div>
      <div class="log-time">${time}</div>
    </div>
  `;
  logList.prepend(item);
}

/* ---------------- mock deliverable generation ---------------- */
const TEMPLATES = {
  "YouTube台本制作": (topic) => `【YouTube台本】テーマ:「${topic}」

■ オープニング (0:00-0:15)
「こんにちは!今日は『${topic}』について話していきます。最後まで見ると得する内容なので、ぜひチャンネル登録もお願いします!」

■ 本編 (0:15-4:00)
1. なぜ『${topic}』が今注目されているのか
2. 具体的なポイント3つを紹介
3. 実例・体験談を交えて解説

■ エンディング (4:00-4:30)
「今日は『${topic}』について紹介しました。役に立ったら高評価とコメントで教えてください!」

#タグ: #${topic.replace(/\s/g, "")} #解説 #おすすめ`,

  "TikTok台本制作": (topic) => `【TikTok台本】テーマ:「${topic}」(15〜30秒)

0:00-0:02 [フック] 「え、『${topic}』知らないとヤバいかも…」
0:02-0:10 [本題] テンポよく3つのポイントをテロップで表示しながら解説
0:10-0:20 [オチ・共感ポイント] 視聴者が思わずコメントしたくなる一言
0:20-0:25 [CTA] 「保存して後で見返してね!コメントで感想教えて」

BGM: トレンド系アップテンポ推奨
テロップ: 大きめ・カラフルに`,

  "UGC動画制作": (topic) => `【UGC動画 構成案】テーマ:「${topic}」

コンセプト: リアルなユーザー目線で「${topic}」を自然に紹介する動画
撮影スタイル: 手持ちカメラ・自宅/日常シーン
台本(ラフ):
1. 「最近ハマってるんだけど…」から自然に導入
2. 実際に使っている/体験しているシーンを撮影
3. 率直な感想を一言(良い点・気になった点も添える)
4. 「気になったらチェックしてみて」で締め

トーン: 広告っぽくならないよう、あくまで友達に話す感覚で`,

  "Instagram投稿制作": (topic) => `【Instagram投稿案】テーマ:「${topic}」

■ キャプション案
「${topic}」について、今日はシェアします🌿
知っておくと役立つポイントをまとめました👇

・ポイント1
・ポイント2
・ポイント3

保存して後で見返してね✨

■ ハッシュタグ
#${topic.replace(/\s/g, "")} #豆知識 #instagood #おすすめ`,

  "サムネイルデザイン": (topic) => `【サムネイル デザイン案】テーマ:「${topic}」

レイアウト案:
- 左側: 大きめの人物/商品カット(表情はっきり)
- 右側: 太字テロップ「${topic}」(3〜5文字に要約)
- 配色: 背景は補色コントラストを強めに(黄×紫 or 赤×青)
- 装飾: 矢印・丸囲みで視線誘導
- 注意書き: 文字は最小サイズでもスマホで読める大きさに`,

  "SNS運用戦略": (topic) => `【SNS運用戦略メモ】テーマ:「${topic}」

■ 目的
「${topic}」に関するフォロワーのエンゲージメント向上

■ 施策
1. 週3回の投稿ペースを維持し、投稿時間は19-21時に統一
2. 「${topic}」関連のトレンドハッシュタグを毎回2〜3個活用
3. コメント返信率90%以上を目標に運用
4. 月末に簡易レポートで振り返り

■ KPI
リーチ数・保存数・フォロワー増加率`,

  "ブログ記事執筆": (topic) => `【ブログ記事】タイトル案:「${topic}」について知っておきたいこと

■ 導入
「${topic}」と聞いて、どんなイメージを持ちますか?この記事では基本から実践まで分かりやすく解説します。

■ 本文構成
1. 「${topic}」の基本
2. よくある誤解・注意点
3. 実践のためのステップ
4. まとめ

■ まとめ
「${topic}」は正しく理解すれば、誰でも活用できます。ぜひ今日から試してみてください。`,

  "SEOリサーチ": (topic) => `【SEOリサーチ結果】キーワード:「${topic}」

■ 関連キーワード(想定)
・${topic} とは
・${topic} 方法
・${topic} おすすめ
・${topic} 比較

■ 想定検索意図
情報収集(知りたい)が中心。一部、購入・比較検討の意図も含まれる。

■ コンテンツ提案
「${topic}」の基礎解説+具体例+比較表を含む記事が上位表示されやすい傾向`,

  "動画編集": (topic) => `【動画編集メモ】対象:「${topic}」

■ カット割り方針
- 冒頭2秒でテンポよくフック(不要な間はカット)
- 重要ポイントごとにテロップ強調
- BGMは会話を邪魔しない音量(-18dB目安)

■ エフェクト
- シーン切替: クイックズーム/カット
- 強調ポイント: 効果音+ズームイン

■ 尺
最終尺は要点を絞って1分以内に collapse`,

  "トレンド・ハッシュタグ調査": (topic) => `【トレンド調査レポート】テーマ:「${topic}」

■ 注目ハッシュタグ(想定)
#${topic.replace(/\s/g, "")}
#${topic.replace(/\s/g, "")}好きな人と繋がりたい
#今日の${topic.replace(/\s/g, "")}

■ トレンド傾向
「${topic}」関連は共感・体験共有系の投稿が伸びやすい傾向。
実体験ベースの投稿と組み合わせるとリーチが伸びやすい。`,

  "コメント・DM対応": (topic) => `【コメント対応 下書き】テーマ:「${topic}」への問い合わせ

■ よくある質問への返信例
Q. 「${topic}」について詳しく知りたいです!
A. コメントありがとうございます😊「${topic}」については〇〇な点がポイントです!また詳しく投稿しますね。

■ ネガティブコメント対応方針
感情的にならず、事実ベースで丁寧に返信。必要に応じてDM誘導。`,

  "週次レポート作成": (topic) => `【週次レポート】テーマ:「${topic}」

■ 今週のサマリー
「${topic}」に関する施策を実施。主要指標は以下の通り(サンプル値)。

・リーチ数: 前週比 +12%
・エンゲージメント率: 4.8%
・フォロワー増加数: +230

■ 来週のアクション
「${topic}」に関連するコンテンツをさらに強化し、投稿頻度を維持`,
};

function generateDeliverable(staff, instruction) {
  const topic = instruction && instruction.trim() ? instruction.trim() : staff.role;
  const template = TEMPLATES[staff.role];
  if (template) return template(topic);
  return `【${staff.role}】\n指示内容: 「${topic}」\n\n(この役割のテンプレートは準備中です)`;
}

/* ---------------- task flow ---------------- */
const START_PHRASES = [
  "かしこまりました!それでは開始します。",
  "了解しました!今から取り掛かりますね。",
  "はい、承知しました。すぐに始めます!",
];
const DONE_SUFFIX = "が完了しました。ご確認をお願いします!";

function startTask(staffId, instruction) {
  const staff = STAFF.find(s => s.id === staffId);
  const idx = STAFF.indexOf(staff);
  const s = state[staffId];
  s.status = "working";
  s.lastInstruction = instruction;
  updateCard(staffId);

  // animate progress bar
  const fill = document.getElementById(`progress-${staffId}`);
  const duration = 3800 + Math.random() * 2600; // 3.8s - 6.4s (demo speed)

  // ETA announcement: pick a plausible completion time to tell the user out loud
  const etaMinutes = 3 + Math.floor(Math.random() * 10); // 3-12 min (narrative estimate)
  const etaClock = new Date(Date.now() + etaMinutes * 60000);
  const etaLabel = etaClock.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });

  const startLine = `${START_PHRASES[idx % START_PHRASES.length]} だいたい${etaMinutes}分後、${etaLabel}ごろに完成予定です。`;
  showBubble(staffId, `💬 ${startLine}`, 5200);
  speak(startLine, idx);
  addLog("🎤", `${staff.name}(${staff.role})に指示: 「${instruction}」`);
  addLog("🚀", `${staff.name}が作業を開始しました(完成予定: ${etaLabel}ごろ / 約${etaMinutes}分後)`);

  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const pct = Math.min(100, (elapsed / duration) * 100);
    if (fill) fill.style.width = pct + "%";
    if (elapsed < duration && state[staffId].status === "working") {
      requestAnimationFrame(tick);
    }
  }
  requestAnimationFrame(tick);

  setTimeout(() => completeTask(staffId), duration);
}

function completeTask(staffId) {
  const staff = STAFF.find(s => s.id === staffId);
  const idx = STAFF.indexOf(staff);
  const s = state[staffId];
  if (s.status !== "working") return;
  s.status = "review";
  s.deliverable = generateDeliverable(staff, s.lastInstruction);
  updateCard(staffId);
  updateStats();

  const doneLine = `${staff.name}です。${staff.role}${DONE_SUFFIX}`;
  showBubble(staffId, `💬 ${doneLine}`, 6000);
  speak(doneLine, idx);
  addLog("✅", `${staff.name}が「${staff.role}」を完了しました`);
}

function approveTask(staffId) {
  const staff = STAFF.find(s => s.id === staffId);
  const s = state[staffId];
  s.status = "idle";
  s.deliverable = "";
  s.lastInstruction = "";
  s._completedToday = true;
  doneToday += 1;
  updateCard(staffId);
  updateStats();
  addLog("🙌", `${staff.name}の成果物を確認しました`);
}

/* ---------------- instruction modal ---------------- */
const modalOverlay = $("#modalOverlay");
const modalMicBtn = $("#modalMicBtn");
const modalMicHint = $("#modalMicHint");
const modalTranscript = $("#modalTranscript");
const modalTextInput = $("#modalTextInput");
const modalMascot = $("#modalMascot");
const modalDoneBtn = $("#modalDoneBtn");
const modalCancelBtn = $("#modalCancelBtn");
const fallbackDetails = document.querySelector(".text-fallback-details");

let modalRecognition = null;
let modalListening = false;
let liveFinal = "";
let livePartial = "";

function updateTranscriptDisplay() {
  const combined = (liveFinal + livePartial).trim();
  modalTranscript.innerHTML = combined
    ? combined.replace(/</g, "&lt;")
    : `<span class="transcript-placeholder">ここに話した内容が表示されます…</span>`;
}

function setMicHint(text, paused) {
  modalMicHint.textContent = text;
  modalMicHint.classList.toggle("paused", !!paused);
}

function startModalRecognition() {
  if (!SpeechRecognitionCtor) return;
  const rec = new SpeechRecognitionCtor();
  rec.lang = "ja-JP";
  rec.continuous = true;
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  rec.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const transcript = e.results[i][0].transcript;
      if (e.results[i].isFinal) liveFinal += transcript;
      else interim += transcript;
    }
    livePartial = interim;
    updateTranscriptDisplay();
  };
  rec.onend = () => {
    modalListening = false;
    modalMicBtn.classList.remove("listening");
    if (!modalOverlay.hidden) setMicHint("一時停止中(マイクを押して再開)", true);
  };
  rec.onerror = (e) => {
    modalListening = false;
    modalMicBtn.classList.remove("listening");
    if (modalOverlay.hidden) return;
    const messages = {
      "not-allowed": "⚠️ マイクの使用が許可されていません。ブラウザの設定でマイクを許可してください",
      "no-speech": "声が聞き取れませんでした。マイクを押してもう一度話してください",
      "audio-capture": "⚠️ マイクが見つかりません。マイクが接続されているか確認してください",
      "network": "通信エラーが発生しました。マイクを押して再試行してください",
    };
    setMicHint(messages[e.error] || "うまく聞き取れません。マイクを押して再開", true);
  };
  modalRecognition = rec;
  try {
    rec.start();
    modalListening = true;
    modalMicBtn.classList.add("listening");
    setMicHint("聞き取り中…", false);
  } catch {
    /* recognition may already be starting */
  }
}

function stopModalRecognition(silent) {
  if (modalRecognition) {
    if (silent) modalRecognition.onend = null;
    if (modalListening) modalRecognition.stop();
  }
  modalListening = false;
}

function openInstructionModal(staffId) {
  const staff = STAFF.find(s => s.id === staffId);
  const team = findTeamOf(staffId);
  activeModalStaffId = staffId;

  modalMascot.innerHTML = mascotFigureHTML(staff, "idle");
  $("#modalStaffName").textContent = `${staff.name}にマイクで依頼`;
  $("#modalStaffRole").textContent = `${team ? team.name : staff.role} ー 話し終えたら「完了」を押してください`;

  liveFinal = "";
  livePartial = "";
  updateTranscriptDisplay();
  modalTextInput.value = "";
  if (fallbackDetails) fallbackDetails.open = false;
  modalOverlay.hidden = false;

  if (SpeechRecognitionCtor) {
    modalMicBtn.disabled = false;
    startModalRecognition();
  } else {
    modalMicBtn.disabled = true;
    setMicHint("音声入力非対応です。下のテキスト入力をお使いください。", true);
    if (fallbackDetails) fallbackDetails.open = true;
  }
}

function closeInstructionModal() {
  stopModalRecognition(true);
  modalOverlay.hidden = true;
  activeModalStaffId = null;
}

function handleInstructionSubmit(staffId, text) {
  if (!text || !text.trim()) return;
  closeInstructionModal();
  startTask(staffId, text.trim());
}

modalMicBtn.addEventListener("click", () => {
  if (!SpeechRecognitionCtor) return;
  if (modalListening) {
    stopModalRecognition();
  } else {
    startModalRecognition();
  }
});

modalDoneBtn.addEventListener("click", () => {
  const spokenText = (liveFinal + livePartial).trim();
  const text = spokenText || modalTextInput.value.trim();
  if (!text) {
    setMicHint("⚠️ 話した内容がありません。マイクを押して話しかけてください", true);
    modalTranscript.classList.add("shake");
    setTimeout(() => modalTranscript.classList.remove("shake"), 400);
    return;
  }
  stopModalRecognition(true);
  handleInstructionSubmit(activeModalStaffId, text);
});

modalCancelBtn.addEventListener("click", closeInstructionModal);
$("#modalClose").addEventListener("click", closeInstructionModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeInstructionModal(); });

$("#modalTextSend").addEventListener("click", () => {
  stopModalRecognition(true);
  handleInstructionSubmit(activeModalStaffId, modalTextInput.value);
});
modalTextInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    stopModalRecognition(true);
    handleInstructionSubmit(activeModalStaffId, modalTextInput.value);
  }
});

/* ---------------- result modal ---------------- */
const resultOverlay = $("#resultOverlay");

function openResultModal(staffId) {
  const staff = STAFF.find(s => s.id === staffId);
  const s = state[staffId];
  activeResultStaffId = staffId;
  $("#resultAvatar").style.background = `linear-gradient(135deg, ${staff.grad[0]}, ${staff.grad[1]})`;
  $("#resultAvatar").textContent = staff.emoji;
  $("#resultStaffName").textContent = `${staff.name}（${staff.role}）`;
  $("#deliverableBox").textContent = s.deliverable;
  resultOverlay.hidden = false;
}

function closeResultModal() {
  resultOverlay.hidden = true;
  activeResultStaffId = null;
}

$("#resultClose").addEventListener("click", closeResultModal);
resultOverlay.addEventListener("click", (e) => { if (e.target === resultOverlay) closeResultModal(); });

$("#copyBtn").addEventListener("click", async () => {
  const text = $("#deliverableBox").textContent;
  try {
    await navigator.clipboard.writeText(text);
    $("#copyBtn").textContent = "✅ コピーしました";
    setTimeout(() => { $("#copyBtn").textContent = "📋 コピー"; }, 1500);
  } catch {
    /* clipboard may be unavailable (e.g. file:// without permission) */
  }
});

$("#approveBtn").addEventListener("click", () => {
  if (activeResultStaffId) approveTask(activeResultStaffId);
  closeResultModal();
});

/* ---------------- delegate mascot tile clicks ---------------- */
officeFloor.addEventListener("click", (e) => {
  const tile = e.target.closest(".mascot-tile");
  if (!tile) return;
  const id = tile.dataset.id;
  const status = state[id].status;
  if (status === "idle") openInstructionModal(id);
  else if (status === "review") openResultModal(id);
  // working: no-op, tile shows progress already
});

/* ---------------- init ---------------- */
renderAll();

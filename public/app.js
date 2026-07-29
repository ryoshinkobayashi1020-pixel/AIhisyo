/* =========================================================
   AI社員オフィス - フロントエンド プロトタイプ
   音声認識(Web Speech API) + 音声合成 + モック成果物生成
   ========================================================= */

const STAFF = [
  { id: "reina",   name: "れいな", gender: "female", role: "SPIテスト担当者",     emoji: "📝", grad: ["#6fa8dc", "#496fa8"], ear: "pointy", eyes: "sparkle", accessory: "star", shape: "tall" },
  { id: "sakura",  name: "さくら", gender: "female", role: "漢字テスト担当者",    emoji: "漢", grad: ["#e58b9b", "#b95d76"], ear: "round", eyes: "happy", accessory: "flower", shape: "round" },
  { id: "takumi",  name: "たくみ", gender: "male", role: "算数テスト担当者",    emoji: "➗", grad: ["#59b6a8", "#31877e"], ear: "floppy", eyes: "dot", accessory: "glasses", shape: "wide" },
  { id: "asuka",   name: "あすか", gender: "female", role: "面接担当者",          emoji: "🤝", grad: ["#f08c78", "#d95d73"], ear: "round",  eyes: "happy",   accessory: "glasses", shape: "round" },
  { id: "elf_sketch", name: "ひより", gender: "female", role: "寸劇系台本制作担当", emoji: "🎭", grad: ["#ff8fa3", "#d95778"], ear: "round", eyes: "sparkle", accessory: "bow", shape: "round" },
  { id: "elf_if", name: "かなで", gender: "female", role: "もしもシリーズ系台本担当", emoji: "💭", grad: ["#9b8cff", "#6658c7"], ear: "pointy", eyes: "happy", accessory: "star", shape: "tall" },
  { id: "elf_lively", name: "あまね", gender: "female", role: "にぎやか系台本制作担当", emoji: "🎉", grad: ["#ffbd59", "#f2764b"], ear: "round", eyes: "sparkle", accessory: "star", shape: "round" },
  { id: "elf_jobs", name: "りく", gender: "male", role: "エンタメ系求人台本担当", emoji: "💼", grad: ["#55c6b5", "#268d80"], ear: "floppy", eyes: "dot", accessory: "glasses", shape: "wide" },
  { id: "mana_jobs", name: "まな", gender: "female", role: "求人台本制作担当", emoji: "📣", grad: ["#ff8d76", "#d94f6d"], ear: "round", eyes: "sparkle", accessory: "bow", shape: "round" },
  { id: "mana_narration", name: "しん", gender: "male", role: "語り台本制作担当", emoji: "🎙️", grad: ["#596c8f", "#293750"], ear: "floppy", eyes: "dot", accessory: "glasses", shape: "wide" },
  { id: "mana_staff_dialogue", name: "ゆうき", gender: "male", role: "スタッフ駆け引き台本制作担当", emoji: "🗣️", grad: ["#4fa9a2", "#286a75"], ear: "round", eyes: "happy", accessory: "glasses", shape: "tall" },
  { id: "miyabis_ads", name: "みやび", gender: "female", role: "広告台本制作担当", emoji: "📢", grad: ["#62b9ef", "#5567cc"], ear: "pointy", eyes: "happy", accessory: "star", shape: "tall" },
  { id: "kabayaki_script", name: "かえで", gender: "female", role: "TikTok台本制作担当", emoji: "🎥", grad: ["#e5a84d", "#9a6330"], ear: "round", eyes: "happy", accessory: "flower", shape: "round" },
  { id: "invoice_clerk", name: "みさき", gender: "female", role: "請求担当・社長個人予定担当", emoji: "📅", grad: ["#ff91c8", "#f3b64c"], ear: "round", eyes: "sparkle", accessory: "bow", shape: "round" },
  { id: "ryoshin_jobs", name: "ことは", gender: "female", role: "求人TikTok台本担当", emoji: "📣", grad: ["#a77de8", "#6544ae"], ear: "round", eyes: "sparkle", accessory: "star", shape: "round" },
  { id: "ryoshin_video_editor", name: "そうた", gender: "male", role: "TikTok動画編集担当", emoji: "✂️", grad: ["#4f9fd8", "#285c94"], ear: "floppy", eyes: "dot", accessory: "glasses", shape: "wide" },
];

const ROLE_KEYWORDS = {
  "面接担当者": ["面接", "面接官", "応募者", "候補者", "採用面接", "面接評価"],
  "SPIテスト担当者": ["spi", "適性検査", "適性テスト", "能力検査", "性格検査", "筆記試験"],
  "漢字テスト担当者": ["漢字", "国語", "読み書き", "小学三年生", "3年生"],
  "算数テスト担当者": ["算数", "計算", "文章問題", "小学三年生", "3年生"],
  "寸劇系台本制作担当": ["えるふの寸劇", "寸劇", "コント", "ショートドラマ"],
  "もしもシリーズ系台本担当": ["えるふのもしも", "もしもシリーズ", "もしも"],
  "にぎやか系台本制作担当": ["えるふのにぎやか", "にぎやか", "賑やか", "わちゃわちゃ", "大人数"],
  "エンタメ系求人台本担当": ["えるふの求人", "求人台本", "採用動画", "求人", "エンタメ系求人"],
  "求人台本制作担当": ["マナの求人", "マナコーポレーション", "求人台本"],
  "語り台本制作担当": ["マナの語り", "語り台本", "語り系", "経営者の語り", "代表の語り", "しん"],
  "スタッフ駆け引き台本制作担当": ["マナの駆け引き", "スタッフとの駆け引き", "質疑応答台本", "社長とスタッフ", "ゆうき"],
  "広告台本制作担当": ["ミヤビスの広告", "ミヤビス", "広告台本", "広告動画"],
  "TikTok台本制作担当": ["かばやき屋", "かばやきや", "TikTok台本", "運用代行"],
  "請求担当・社長個人予定担当": ["社長", "小林", "個人予定", "予定", "日程", "撮影日", "空き時間", "カレンダー", "登録", "経理", "請求書", "請求", "支払期限", "請求先", "振込先", "入金"],
  "求人TikTok台本担当": ["良心の求人", "良心求人", "良心の求人台本", "良心TikTok求人", "ことは"],
  "TikTok動画編集担当": ["良心の動画編集", "良心動画編集", "TikTok動画編集", "動画編集", "そうた"],
};

const TEAMS = [
  { id: "management", name: "採用試験ルーム", desc: "", icon: "🤝", t: ["#f5a38f", "#d96b81"], staff: ["reina", "sakura", "takumi", "asuka"] },
  { id: "elfrontier", name: "えるふろんてぃあ TikTok運用チーム", desc: "", icon: "🎬", t: ["#87dfc7", "#5c6fd8"], staff: ["elf_sketch", "elf_if", "elf_lively", "elf_jobs"] },
  { id: "mana_corporation", name: "マナコーポレーション TikTok運用チーム", desc: "求人・語り・スタッフとの駆け引き台本制作", icon: "📣", t: ["#ffae82", "#df5d78"], staff: ["mana_jobs", "mana_narration", "mana_staff_dialogue"] },
  { id: "miyabis", name: "ミヤビス TikTok運用チーム", desc: "商品・サービスの広告TikTok台本制作", icon: "📢", t: ["#75c7ee", "#596bd3"], staff: ["miyabis_ads"] },
  { id: "kabayaki", name: "かばやき屋 TikTok運用代行チーム", desc: "", icon: "🎥", t: ["#e8b865", "#9c6837"], staff: ["kabayaki_script"] },
  { id: "accounting", name: "社長予定・請求管理", desc: "社長の個人予定と請求書を管理", icon: "💖", t: ["#ff8fc4", "#f0aa45"], staff: ["invoice_clerk"] },
  { id: "ryoshin_tiktok", name: "良心 TikTok運用チーム", desc: "求人台本制作とTikTok動画編集", icon: "📱", t: ["#a77de8", "#3f79b8"], staff: ["ryoshin_jobs", "ryoshin_video_editor"] },
];
const SCRIPT_STAFF_IDS = new Set(["elf_sketch", "elf_if", "elf_lively", "elf_jobs", "mana_jobs", "mana_narration", "mana_staff_dialogue", "miyabis_ads", "kabayaki_script", "ryoshin_jobs"]);
const OFFICE_ROOMS = {
  operations: ["management", "accounting"],
  tiktok: ["elfrontier", "mana_corporation", "miyabis", "kabayaki", "ryoshin_tiktok"],
};
const OFFICE_ROOM_KEY = "aiOfficeActiveRoom";
let activeOfficeRoom = localStorage.getItem(OFFICE_ROOM_KEY);
if (!OFFICE_ROOMS[activeOfficeRoom]) activeOfficeRoom = "operations";

// per-staff runtime state
const state = {};
STAFF.forEach(s => {
  state[s.id] = {
    status: "idle",        // idle | working | review | break
    lastInstruction: "",
    deliverable: "",
    deliverableImage: "",
    generationModel: "",
    _taskIds: [],
    _displayTaskId: "",
    _breakSince: null,
    _workedMs: 0,
  };
});
const taskRegistry = new Map();
const archivedTeamBatchIds = new Set();
const SHARED_CLIENT_KEY = "ai-office-shared-client";
const SHARED_NAME_KEY = "ai-office-shared-name";
let sharedClientId = localStorage.getItem(SHARED_CLIENT_KEY);
if (!sharedClientId) {
  sharedClientId = `device_${crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
  localStorage.setItem(SHARED_CLIENT_KEY, sharedClientId);
}
let sharedDisplayName = localStorage.getItem(SHARED_NAME_KEY) || `参加者${sharedClientId.slice(-4)}`;
let sharedLastCinemaUpdate = 0;
let sharedLastEventId = 0;
let sharedRoomReady = false;

function postSharedRoom(payload) {
  return fetch("/api/shared-room", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ clientId:sharedClientId, name:sharedDisplayName, ...payload }),
  }).catch(() => null);
}

function publishSharedTask(event) {
  postSharedRoom({ action:"event", event });
}

async function applySharedTaskEvent(event) {
  if (event.source === sharedClientId || !STAFF.some(staff => staff.id === event.staffId)) return;
  const staff = STAFF.find(item => item.id === event.staffId);
  const s = state[event.staffId];
  if (event.type === "task-start") {
    if (taskRegistry.has(event.taskId)) return;
    taskRegistry.set(event.taskId, {
      id:event.taskId,
      staffId:event.staffId,
      instruction:event.instruction,
      status:"working",
      startedAt:event.createdAt || Date.now(),
      deliverable:"",
      image:"",
      model:"共同作業",
      shared:true,
    });
    s._taskIds.push(event.taskId);
    syncStaffTaskState(event.staffId);
    renderAll();
    addLog("🌐", `${staff.name}への共同指示を受信しました`);
    return;
  }
  if (event.type === "task-complete") {
    let task = taskRegistry.get(event.taskId);
    if (!task) {
      task = {
        id:event.taskId,
        staffId:event.staffId,
        instruction:event.instruction,
        startedAt:event.createdAt || Date.now(),
      };
      taskRegistry.set(event.taskId, task);
      s._taskIds.push(event.taskId);
    }
    task.status = "review";
    task.deliverable = event.deliverable || "";
    task.image = event.image || "";
    task.model = event.model || "共同作業";
    if (!task._workTimeCounted) {
      s._workedMs += Math.max(0, Number(event.durationMs) || 0);
      task._workTimeCounted = true;
      persistWorkTimes();
    }
    syncStaffTaskState(event.staffId);
    renderAll();
    await archiveCompletedDeliverable({
      taskId:event.taskId,
      staffId:event.staffId,
      staffName:staff.name,
      role:staff.role,
      content:task.deliverable,
      image:task.image,
      model:task.model,
    });
    addLog("🌐", `${staff.name}の共同レポートが完成しました`);
  }
}

async function pollSharedRoom() {
  try {
    const response = await fetch(`/api/shared-room?clientId=${encodeURIComponent(sharedClientId)}&name=${encodeURIComponent(sharedDisplayName)}`, { cache:"no-store" });
    if (!response.ok) return;
    const room = await response.json();
    const count = room.participants?.length || 1;
    const status = document.getElementById("sharedRoomStatus");
    if (status) {
      status.querySelector(".stat-num").textContent = `● ${count}`;
      status.title = `${room.participants?.map(item => item.name).join("・") || sharedDisplayName} が接続中`;
    }
    const cinemaStatus = document.getElementById("cinemaSharedStatus");
    if (cinemaStatus) cinemaStatus.textContent = `● ${count}人 接続中`;
    const newestEventId = Math.max(0, ...(room.events || []).map(event => Number(event.id) || 0));
    if (!sharedRoomReady) {
      sharedLastEventId = newestEventId;
      sharedLastCinemaUpdate = Number(room.cinema?.updatedAt || 0);
      sharedRoomReady = true;
      return;
    }
    for (const event of (room.events || []).filter(item => Number(item.id) > sharedLastEventId)) {
      await applySharedTaskEvent(event);
      sharedLastEventId = Math.max(sharedLastEventId, Number(event.id) || 0);
    }
    if (room.cinema?.videoId && Number(room.cinema.updatedAt) > sharedLastCinemaUpdate) {
      sharedLastCinemaUpdate = Number(room.cinema.updatedAt);
      if (room.cinema.by !== sharedClientId) {
        const player = document.getElementById("cinemaPlayer");
        const placeholder = document.getElementById("cinemaPlaceholder");
        const message = document.getElementById("cinemaMessage");
        if (player) {
          player.src = `https://www.youtube-nocookie.com/embed/${room.cinema.videoId}?autoplay=1&rel=0`;
          player.hidden = false;
        }
        if (placeholder) placeholder.hidden = true;
        if (message) message.textContent = `別の参加者が「${room.cinema.title || "動画"}」を選びました。`;
      }
    }
  } catch {
    const status = document.getElementById("sharedRoomStatus");
    if (status) status.querySelector(".stat-num").textContent = "● オフライン";
  }
}

pollSharedRoom();
window.setInterval(pollSharedRoom, 2000);
window.setInterval(() => {
  const staleBefore = Date.now() - 10 * 60 * 1000;
  const affectedStaff = new Set();
  [...taskRegistry.values()]
    .filter(task => task.shared && task.status === "working" && Number(task.startedAt || 0) < staleBefore)
    .forEach(task => {
      taskRegistry.delete(task.id);
      const staffState = state[task.staffId];
      if (staffState) staffState._taskIds = staffState._taskIds.filter(id => id !== task.id);
      affectedStaff.add(task.staffId);
    });
  affectedStaff.forEach(staffId => {
    syncStaffTaskState(staffId);
    updateCard(staffId);
  });
  if (affectedStaff.size) {
    updateStats();
    addLog("🧹", "完了通知が届かなかった古い共同タスクを作業中一覧から整理しました");
  }
}, 60 * 1000);

function tasksForStaff(staffId, status = "") {
  return [...taskRegistry.values()].filter(task =>
    task.staffId === staffId && (!status || task.status === status)
  );
}

function syncStaffTaskState(staffId) {
  const s = state[staffId];
  const reviews = tasksForStaff(staffId, "review");
  const workings = tasksForStaff(staffId, "working");
  const displayTask = reviews[0];
  if (displayTask) {
    s.status = "review";
    s._displayTaskId = displayTask.id;
    s.lastInstruction = displayTask.instruction;
    s.deliverable = displayTask.deliverable || "";
    s.deliverableImage = displayTask.image || "";
    s.generationModel = displayTask.model || "";
  } else if (workings.length) {
    s.status = "working";
    s._displayTaskId = "";
  } else {
    s.status = "idle";
    s._displayTaskId = "";
    s.lastInstruction = "";
    s.deliverable = "";
    s.deliverableImage = "";
    s.generationModel = "";
  }
}

const POINTS_KEY = "ai-office-points";
let pointWallet = {
  owner: 0,
  staff: Object.fromEntries(STAFF.map(staff => [staff.id, 0])),
  lastGrantMonth: "",
};
let pointSyncTimer = null;
let pointWriteInFlight = null;
let pointWriteQueued = false;
try {
  const savedPoints = JSON.parse(localStorage.getItem(POINTS_KEY) || "{}");
  pointWallet.owner = Math.max(0, Number(savedPoints.owner || 0));
  pointWallet.lastGrantMonth = savedPoints.lastGrantMonth || "";
  STAFF.forEach(staff => {
    pointWallet.staff[staff.id] = Math.max(0, Number(savedPoints.staff?.[staff.id] || 0));
  });
} catch {
  /* 新しいポイント台帳を使用 */
}

function persistPoints(syncServer = true) {
  localStorage.setItem(POINTS_KEY, JSON.stringify(pointWallet));
  renderPointsRanking();
  if (syncServer) {
    window.clearTimeout(pointSyncTimer);
    pointSyncTimer = window.setTimeout(async () => {
      pointSyncTimer = null;
      if (pointWriteInFlight) {
        pointWriteQueued = true;
        return;
      }
      const snapshot = JSON.parse(JSON.stringify(pointWallet));
      pointWriteInFlight = fetch("/api/points", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: snapshot }),
      }).catch(() => {}).finally(() => {
        pointWriteInFlight = null;
        if (pointWriteQueued) {
          pointWriteQueued = false;
          persistPoints();
        }
      });
    }, 250);
  }
}

async function syncSharedPoints() {
  // ゲーム結果の保存前に古い残高を読み込んで上書きしない。
  if (pointSyncTimer || pointWriteInFlight) return;
  try {
    const response = await fetch("/api/points", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    if (data.points) {
      pointWallet.owner = Math.max(0, Number(data.points.owner || 0));
      pointWallet.lastGrantMonth = data.points.lastGrantMonth || "";
      STAFF.forEach(staff => {
        pointWallet.staff[staff.id] = Math.max(0, Number(data.points.staff?.[staff.id] || 0));
      });
      grantMonthlyPointsIfDue();
      persistPoints(false);
      renderAll();
    } else {
      persistPoints();
    }
  } catch {
    persistPoints(false);
  }
}

function grantMonthlyPointsIfDue() {
  const today = new Date();
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  if (today.getDate() < 27 || pointWallet.lastGrantMonth === monthKey) return;
  STAFF.forEach(staff => { pointWallet.staff[staff.id] += 1000; });
  pointWallet.owner += 1000;
  pointWallet.lastGrantMonth = monthKey;
  persistPoints();
}

grantMonthlyPointsIfDue();

// 面接チーム4名とあまねだけが休憩室を利用する。
const BREAK_ROOM_ENABLED = true;
const BREAKS_ENABLED = false;
const BREAK_ELIGIBLE_IDS = new Set(["reina", "sakura", "takumi", "asuka", "elf_lively"]);
if (BREAKS_ENABLED) {
  const eligibleForBreak = STAFF.filter(staff =>
    BREAK_ELIGIBLE_IDS.has(staff.id) && pointWallet.staff[staff.id] >= 3
  );
  const breakCount = eligibleForBreak.length
    ? 1 + Math.floor(Math.random() * Math.min(4, eligibleForBreak.length))
    : 0;
  [...eligibleForBreak].sort(() => Math.random() - 0.5).slice(0, breakCount).forEach((s, index) => {
    pointWallet.staff[s.id] -= 3;
    state[s.id].status = "break";
    state[s.id]._breakSince = Date.now() - index * 8000;
  });
  persistPoints();
}

const WORKTIME_KEY = "ai-office-daily-worktime";
const WORKTIME_DATE = new Date().toLocaleDateString("sv-SE");
const WORKTIME_MODE_VERSION = 2;
try {
  const savedWorkTime = JSON.parse(localStorage.getItem(WORKTIME_KEY) || "{}");
  if (savedWorkTime.date === WORKTIME_DATE && savedWorkTime.mode === WORKTIME_MODE_VERSION) {
    STAFF.forEach(staff => {
      state[staff.id]._workedMs = Math.max(0, Number(savedWorkTime.times?.[staff.id] || 0));
    });
  }
} catch {
  /* ブラウザ保存が使えない場合は今回の起動時間だけを表示 */
}

function findBestStaffForInstruction(text) {
  const lower = normalizeSpeechForStaffRouting(text);
  const directlyCalled = STAFF.find(staff => lower.includes(staff.name));
  if (directlyCalled) return directlyCalled;
  for (const staff of STAFF) {
    const keywords = ROLE_KEYWORDS[staff.role] || [];
    if (keywords.some(k => lower.includes(normalizeSpeechForStaffRouting(k)))) return staff;
  }
  return STAFF.find(s => state[s.id].status === "idle")
    || STAFF.find(s => state[s.id].status === "break")
    || STAFF[0];
}

function normalizeSpeechForStaffRouting(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[\u30a1-\u30f6]/g, char => String.fromCharCode(char.charCodeAt(0) - 0x60))
    .replace(/しーん/g, "しん")
    .replace(/まなー/g, "まな")
    .replace(/(?:優樹|優希|悠希|悠樹|勇気|祐樹|結城|友紀|有紀|裕樹|雄輝|夕希)(?=(?:さん|くん|君|に|へ|、|,|と|って|台本|動画|お願い|作って|つくって|で|$))/g, "ゆうき")
    .replace(/(?:新|真|慎|進|心|芯|信|伸|神|秦)(?=(?:さん|くん|君|に|へ|、|,|と|とか|って|台本|語り|お願い|作って|つくって|で|$))/g, "しん")
    .replace(/(?:真奈|愛奈|麻奈|茉奈|真名|麻那|愛菜|真菜)(?=(?:さん|ちゃん|に|へ|、|,|と|とか|って|台本|求人|お願い|作って|つくって|で|$))/g, "まな")
    .replace(/(?:日和|陽依|妃依)(?=(?:さん|ちゃん|に|へ|、|,|と|って|台本|お願い|作って|つくって|で|$))/g, "ひより")
    .replace(/(?:奏|奏音)(?=(?:さん|ちゃん|に|へ|、|,|と|って|台本|お願い|作って|つくって|で|$))/g, "かなで")
    .replace(/(?:天音|甘音)(?=(?:さん|ちゃん|に|へ|、|,|と|って|台本|お願い|作って|つくって|で|$))/g, "あまね")
    .replace(/陸(?=(?:さん|くん|君|に|へ|、|,|と|って|台本|お願い|作って|つくって|で|$))/g, "りく")
    .replace(/雅(?=(?:さん|ちゃん|に|へ|、|,|と|って|台本|お願い|作って|つくって|で|$))/g, "みやび")
    .replace(/楓(?=(?:さん|ちゃん|に|へ|、|,|と|って|台本|お願い|作って|つくって|で|$))/g, "かえで")
    .replace(/(?:琴葉|言葉)(?=(?:さん|ちゃん|に|へ|、|,|と|って|台本|お願い|作って|つくって|で|$))/g, "ことは")
    .replace(/(?:蒼太|颯太|奏太)(?=(?:さん|くん|君|に|へ|、|,|と|って|編集|お願い|作って|つくって|で|$))/g, "そうた")
    .replace(/(?:玲奈|麗奈)(?=(?:さん|ちゃん|に|へ|、|,|と|って|お願い|開始|で|$))/g, "れいな")
    .replace(/桜(?=(?:さん|ちゃん|に|へ|、|,|と|って|お願い|開始|で|$))/g, "さくら")
    .replace(/(?:匠|拓海)(?=(?:さん|くん|君|に|へ|、|,|と|って|お願い|開始|で|$))/g, "たくみ")
    .replace(/(?:飛鳥|明日香|安須賀)(?=(?:さん|ちゃん|に|へ|、|,|と|って|お願い|面接|で|$))/g, "あすか")
    .replace(/(?:美咲|実咲)(?=(?:さん|ちゃん|に|へ|、|,|と|って|お願い|請求|予定|で|$))/g, "みさき")
    // 「新2本」「勇気八本」のように、音声認識が名前を漢字化して
    // 直後に本数を続けた場合も、スタッフ名として正規化する。
    .replace(/(?:優樹|優希|悠希|悠樹|勇気|祐樹|結城|友紀|有紀|裕樹|雄輝|夕希)(?=[0-9０-９一二三四五六七八九十]+本)/g, "ゆうき")
    .replace(/(?:新|真|慎|進|心|芯|信|伸|神|秦)(?=[0-9０-９一二三四五六七八九十]+本)/g, "しん")
    .replace(/(?:真奈|愛奈|麻奈|茉奈|真名|麻那|愛菜|真菜)(?=[0-9０-９一二三四五六七八九十]+本)/g, "まな")
    .replace(/(?:日和|陽依|妃依)(?=[0-9０-９一二三四五六七八九十]+本)/g, "ひより")
    .replace(/(?:奏|奏音)(?=[0-9０-９一二三四五六七八九十]+本)/g, "かなで")
    .replace(/(?:天音|甘音)(?=[0-9０-９一二三四五六七八九十]+本)/g, "あまね")
    .replace(/陸(?=[0-9０-９一二三四五六七八九十]+本)/g, "りく")
    .replace(/雅(?=[0-9０-９一二三四五六七八九十]+本)/g, "みやび")
    .replace(/楓(?=[0-9０-９一二三四五六七八九十]+本)/g, "かえで")
    .replace(/(?:琴葉|言葉)(?=[0-9０-９一二三四五六七八九十]+本)/g, "ことは")
    .replace(/(?:蒼太|颯太|奏太)(?=[0-9０-９一二三四五六七八九十]+本)/g, "そうた")
    .replace(/[、。！？!?・\s]/g, "");
}

function findExplicitStaffListByReading(normalizedText) {
  let manaNameIndex = normalizedText.indexOf("まな");
  while (manaNameIndex >= 0 && normalizedText.slice(manaNameIndex).startsWith("まなこーぽれーしょん")) {
    manaNameIndex = normalizedText.indexOf("まな", manaNameIndex + "まなこーぽれーしょん".length);
  }
  const candidates = [
    ["mana_jobs", manaNameIndex],
    ["mana_narration", normalizedText.indexOf("しん")],
    ["mana_staff_dialogue", normalizedText.indexOf("ゆうき")],
    ...STAFF
      .filter(staff => !["mana_jobs", "mana_narration", "mana_staff_dialogue"].includes(staff.id))
      .map(staff => [staff.id, normalizedText.indexOf(staff.name)]),
  ].filter(([, index]) => index >= 0).sort((a, b) => a[1] - b[1]);
  return candidates.map(([id]) => STAFF.find(staff => staff.id === id)).filter(Boolean);
}

function findExplicitStaffByReading(normalizedText) {
  return findExplicitStaffListByReading(normalizedText)[0] || null;
}

function findExplicitTeamsByReading(normalizedText) {
  const aliases = [
    ["mana_corporation", ["まなこーぽれーしょん", "まなちーむ", "まなこーぽれーしょんちーむ"]],
    ["elfrontier", ["えるふろんてぃあ", "えるふろんてぃあちーむ", "えるふちーむ", "lふろんてぃあ"]],
    ["miyabis", ["みやびす", "みやびすちーむ"]],
    ["kabayaki", ["かばやき屋", "かばやきや", "かばやき屋ちーむ", "かばやきやちーむ"]],
    ["ryoshin_tiktok", ["良心tiktok運用ちーむ", "りょうしんtiktok運用ちーむ", "良心tiktokちーむ", "りょうしんtiktokちーむ"]],
  ];
  return aliases
    .filter(([, names]) => names.some(name => normalizedText.includes(normalizeSpeechForStaffRouting(name))))
    .map(([teamId]) => TEAMS.find(team => team.id === teamId))
    .filter(Boolean);
}

function parseRequestedTotalScripts(text) {
  const normalized = String(text || "").replace(/[０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0));
  const match = normalized.match(/(?:合計|全部で)?\s*(\d{1,2})\s*本/);
  const isPerPerson = /(?:各|それぞれ)\D{0,8}\d{1,2}\s*本/.test(normalized)
    || /\d{1,2}\s*本\s*(?:ずつ|それぞれ)/.test(normalized);
  if (!match || isPerPerson) return 0;
  const count = Number(match[1]);
  return count >= 1 && count <= 30 ? count : 0;
}

function parseJapaneseScriptCount(value) {
  const normalized = String(value || "")
    .replace(/[０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0));
  if (/^\d{1,2}$/.test(normalized)) {
    const count = Number(normalized);
    return count >= 1 && count <= 30 ? count : 0;
  }
  const digits = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  if (normalized === "十") return 10;
  if (normalized.includes("十")) {
    const [tens, ones] = normalized.split("十");
    const count = (tens ? digits[tens] || 0 : 1) * 10 + (ones ? digits[ones] || 0 : 0);
    return count >= 1 && count <= 30 ? count : 0;
  }
  return digits[normalized] || 0;
}

function parseStaffSpecificScriptCounts(targets, instruction) {
  const normalized = normalizeSpeechForStaffRouting(
    String(instruction || "").replace(/[０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
  );
  const mentions = targets
    .map(staff => ({ staff, index: normalized.indexOf(staff.name) }))
    .filter(item => item.index >= 0)
    .sort((a, b) => a.index - b.index);
  const counts = new Map();
  mentions.forEach((mention, index) => {
    const start = mention.index + mention.staff.name.length;
    const end = mentions[index + 1]?.index ?? normalized.length;
    const segment = normalized.slice(start, end);
    const match = segment.match(/([0-9]{1,2}|[一二三四五六七八九十]{1,3})本/);
    const count = parseJapaneseScriptCount(match?.[1]);
    if (count) counts.set(mention.staff.id, count);
  });
  return counts;
}

function assignTeamScriptCounts(targets, instruction) {
  const staffSpecificCounts = parseStaffSpecificScriptCounts(targets, instruction);
  if (staffSpecificCounts.size) {
    return targets.map(staff => ({
      staff,
      // 名前を呼ばれた全員を必ず実行対象にする。個別指定がない人は1本。
      count: staffSpecificCounts.get(staff.id) || 1,
    }));
  }
  const delegated = /(おまかせ|お任せ|任せる|まかせる|自由に|本数.*自由|内訳.*任せ)/.test(instruction);
  const total = parseRequestedTotalScripts(instruction);
  if (!delegated && !total) return targets.map(staff => ({ staff, count: 0 }));
  if (total) {
    const shuffled = [...targets].sort(() => Math.random() - 0.5);
    // 名前を呼ばれた担当者は、本数が人数より少なくても対象から外さない。
    // まず全員へ1本ずつ割り当て、残りだけを分配する。
    const counts = new Map(targets.map(staff => [staff.id, 1]));
    const remaining = Math.max(0, total - targets.length);
    for (let index = 0; index < remaining; index += 1) {
      const staff = shuffled[index % shuffled.length];
      counts.set(staff.id, counts.get(staff.id) + 1);
    }
    return targets.map(staff => ({ staff, count: counts.get(staff.id) }));
  }
  return targets.map(staff => ({ staff, count: 1 + Math.floor(Math.random() * 3) }));
}

function instructionForAssignedCount(instruction, staff, count) {
  if (!count) return instruction;
  const withoutSharedCount = String(instruction)
    .replace(/(?:合計|全部で)?\s*(?:[0-9０-９]{1,2}|[一二三四五六七八九十]{1,3})\s*本/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return `${withoutSharedCount}\n\n${staff.name}の担当として、役割に合う内容とテーマを自分で決め、完成台本をちょうど${count}本作ってください。他担当者の台本は作らないでください。`;
}

// per-staff persisted persona settings (prompt / strengths / weaknesses)
const SETTINGS_KEY = "aiShainOfficeStaffSettings";
function loadStaffSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch {
    return {};
  }
}
function saveStaffSettings(all) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(all));
  } catch {
    /* localStorage may be unavailable */
  }
}
let staffSettings = loadStaffSettings();

function migrateAmanePrompt(settings) {
  const prompt = settings?.elf_lively?.prompt;
  if (typeof prompt !== "string") return false;
  const oldRule = "店内、開店前後、接客、勇者様、入国、カウンター、キャスト同士のやり取りなど、えるふろんてぃあでしか成立しない題材を最低一つ使う。";
  const newRule = "あまねは、お客様向けの世界観紹介ではなく、開店準備、閉店後、掃除、片付け、衣装や小物の確認、撮影前後、休憩中、キャスト同士の雑談や小さな失敗など、えるふろんてぃあの裏側の日常を題材にする。「勇者様」「入国」「異世界」などの世界観ワードは原則使わず、依頼テーマに直接必要な場合だけ自然に使う。店舗紹介や宣伝文句を会話へ無理に入れない。";
  if (!prompt.includes(oldRule)) return false;
  settings.elf_lively.prompt = prompt.replace(oldRule, newRule);
  return true;
}

function applyHiyoriReferencePrompt(settings) {
  settings.elf_sketch ||= {};
  let current = typeof settings.elf_sketch.prompt === "string"
    ? settings.elf_sketch.prompt.trim()
    : "";
  let changed = false;
  if (!current.includes("【ひより専用・参考TikTokスタイル】")) {
    const base = current || `${ELF_INTERNAL_PROMPT}\n\n${ELF_ROLE_PROMPTS.elf_sketch}`;
    current = `${base}\n\n${HIYORI_REFERENCE_PROMPT}`;
    changed = true;
  }
  if (!current.includes("【ひより専用・文字起こし再分析ルール】")) {
    current = `${current}\n\n${HIYORI_TRANSCRIPT_ANALYSIS_PROMPT}`;
    changed = true;
  }
  if (!current.includes("【ひより専用・第三参考＋接客言葉ルール】")) {
    current = `${current}\n\n${HIYORI_BOOMERANG_PROMPT}`;
    changed = true;
  }
  if (!current.includes("【ひより専用・1分尺とオチ】")) {
    current = `${current}\n\n${HIYORI_ONE_MINUTE_PROMPT}`;
    changed = true;
  }
  if (!current.includes("【ひより専用・店舗コンセプトと実在店内】")) {
    current = `${current}\n\n${HIYORI_STORE_PROMPT}`;
    changed = true;
  }
  if (!current.includes("【ひより専用・出演キャラクター】")) {
    current = `${current}\n\n${HIYORI_CHARACTERS_PROMPT}`;
    changed = true;
  }
  if (!current.includes("【ひより専用・片町の土地感】")) {
    current = `${current}\n\n${HIYORI_KATAMACHI_PROMPT}`;
    changed = true;
  }
  if (!current.includes("【ひより専用・会話の因果関係】")) {
    current = `${current}\n\n${HIYORI_CAUSAL_DIALOGUE_PROMPT}`;
    changed = true;
  }
  if (changed) settings.elf_sketch.prompt = current;
  return changed;
}

async function persistSharedStaffSettings(all) {
  const response = await fetch("/api/staff-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ settings: all }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "共通設定を保存できませんでした。");
  return data.settings || all;
}

async function syncSharedStaffSettings() {
  try {
    const response = await fetch("/api/staff-settings", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "共通設定を読み込めませんでした。");
    const shared = data.settings || {};
    if (Object.keys(shared).length) {
      staffSettings = shared;
      const migratedAmane = migrateAmanePrompt(staffSettings);
      const migratedHiyori = applyHiyoriReferencePrompt(staffSettings);
      const migrated = migratedAmane || migratedHiyori;
      saveStaffSettings(staffSettings);
      if (migrated) staffSettings = await persistSharedStaffSettings(staffSettings);
      addLog("🔄", "共通のスタッフ設定を読み込みました");
    } else if (Object.keys(staffSettings).length) {
      applyHiyoriReferencePrompt(staffSettings);
      staffSettings = await persistSharedStaffSettings(staffSettings);
      saveStaffSettings(staffSettings);
      addLog("🔄", "このブラウザの既存設定を共通設定へ移行しました");
    }
  } catch (error) {
    addLog("⚠️", `共通設定の同期に失敗しました：${error.message}`);
  }
}

let activeModalStaffId = null;
let activeResultStaffId = null;
let activeSettingsStaffId = null;

const $ = sel => document.querySelector(sel);
const officeFloor = $("#officeFloor");
const logList = $("#logList");

/* ---------------- completed deliverables vault (browser storage) ---------------- */
const DELIVERABLE_DB_NAME = "ai-employee-office";
const DELIVERABLE_STORE_NAME = "completed-deliverables";
let deliverableDbPromise = null;
let deliverableVaultItems = [];

function openDeliverableDb() {
  if (deliverableDbPromise) return deliverableDbPromise;
  deliverableDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DELIVERABLE_DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DELIVERABLE_STORE_NAME)) {
        db.createObjectStore(DELIVERABLE_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return deliverableDbPromise;
}

async function getSavedDeliverables() {
  const db = await openDeliverableDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(DELIVERABLE_STORE_NAME, "readonly")
      .objectStore(DELIVERABLE_STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function archiveCompletedDeliverable(item) {
  const record = {
    id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    staffId: item.staffId,
    staffName: item.staffName,
    role: item.role,
    content: item.content || "",
    image: item.image || "",
    filename: item.filename || "",
    model: item.model || "",
    taskId: item.taskId || "",
    taskIds: Array.isArray(item.taskIds) ? item.taskIds : [],
    teamId: item.teamId || "",
    entries: Array.isArray(item.entries) ? item.entries : [],
    createdAt: item.createdAt || new Date().toISOString(),
  };
  try {
    const db = await openDeliverableDb();
    await new Promise((resolve, reject) => {
      const request = db.transaction(DELIVERABLE_STORE_NAME, "readwrite")
        .objectStore(DELIVERABLE_STORE_NAME).put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    await renderDeliverableVault();
    addLog("🗄️", `${record.staffName}の完成物を保管庫へ保存しました`);
    return true;
  } catch (error) {
    console.error("Deliverable archive error:", error);
    addLog("⚠️", "完成物を保管庫へ保存できませんでした");
    return false;
  }
}

function openArchivedDeliverable(item) {
  const safeImage = typeof item.image === "string"
    && /^data:image\/(?:png|jpeg|webp);base64,/.test(item.image);
  const imageHtml = safeImage
    ? `<img src="${item.image}" alt="${escapeHtml(item.staffName)}の完成画像">`
    : "";
  const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(item.role)}・完成データ</title><style>
body{margin:0;background:#f7f3fa;color:#342c3b;font-family:"Hiragino Sans","Yu Gothic",sans-serif}
main{width:min(920px,calc(100% - 32px));margin:32px auto;background:#fff;border:1px solid #eadff1;border-radius:22px;padding:clamp(22px,5vw,48px);box-sizing:border-box}
h1{margin:0 0 4px}.meta{color:#877690;margin:0 0 26px}img{display:block;max-width:100%;max-height:70vh;margin:0 auto 28px;border-radius:16px}
.content{white-space:pre-wrap;line-height:1.9}.model{margin-top:28px;color:#998ba0;font-size:12px}
</style></head><body><main><h1>${escapeHtml(item.role)}・完成データ</h1>
<p class="meta">${escapeHtml(item.role)} ／ ${new Date(item.createdAt).toLocaleString("ja-JP")}</p>
${imageHtml}<div class="content">${escapeHtml(item.content)}</div>
${item.model ? `<p class="model">生成API: ${escapeHtml(item.model)}</p>` : ""}</main></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const opened = window.open(url, "_blank");
  if (!opened) alert("新しい画面を開けませんでした。ポップアップを許可してください。");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

async function downloadArchivedDeliverable(item) {
  if (Array.isArray(item.entries) && item.entries.length) {
    await downloadTeamDeliverablePdf(item);
    return;
  }
  const staff = { id: item.staffId, name: item.staffName, role: item.role };
  const fileBase = deliverableFileBase(staff);
  const validImage = typeof item.image === "string"
    && /^data:image\/(?:png|jpeg|webp);base64,/.test(item.image);
  if (validImage) {
    const extension = item.image.startsWith("data:image/jpeg") ? "jpg"
      : item.image.startsWith("data:image/webp") ? "webp" : "png";
    triggerDeliverableDownload(item.image, item.filename || `${fileBase}.${extension}`);
    return;
  }
  await downloadDeliverablePdf(staff, item.content, item.createdAt, item.model);
}

async function deleteArchivedDeliverable(item) {
  const confirmed = window.confirm(
    `「${item.role}・完成データ」を完成物保管庫から削除しますか？\nこの操作は元に戻せません。`
  );
  if (!confirmed) return;
  try {
    const db = await openDeliverableDb();
    await new Promise((resolve, reject) => {
      const request = db.transaction(DELIVERABLE_STORE_NAME, "readwrite")
        .objectStore(DELIVERABLE_STORE_NAME).delete(item.id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    acknowledgeTaskForDeletedDeliverable(item);
    await renderDeliverableVault();
    addLog("🗑️", `${item.staffName}の完成物を保管庫から削除し、確認済みにしました`);
  } catch {
    alert("完成物を削除できませんでした。もう一度お試しください。");
  }
}

async function renderDeliverableVault() {
  const grid = $("#deliverableVaultGrid");
  const count = $("#deliverableVaultCount");
  if (!grid || !count) return;
  try {
    deliverableVaultItems = (await getSavedDeliverables())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    deliverableVaultItems = [];
  }
  count.textContent = `${deliverableVaultItems.length}件保存`;
  if (!deliverableVaultItems.length) {
    grid.innerHTML = '<p class="deliverable-vault-empty">完成物はまだありません。スタッフの作業が完了すると、ここへ自動保存されます。</p>';
    return;
  }
  grid.innerHTML = deliverableVaultItems.map(item => {
    const staff = STAFF.find(person => person.id === item.staffId);
    const validImage = /^data:image\/(?:png|jpeg|webp);base64,/.test(item.image || "");
    return `<article class="vault-card">
      <div class="vault-card-top">
        <span class="vault-card-avatar" style="background:linear-gradient(135deg,${staff?.grad?.[0] || "#dccbef"},${staff?.grad?.[1] || "#9d7bc9"})">${staff?.emoji || "📄"}</span>
        <span class="vault-card-title"><strong>${escapeHtml(item.role)}・完成データ</strong>
        <small>${new Date(item.createdAt).toLocaleString("ja-JP")}</small></span>
      </div>
      <div class="vault-card-preview${validImage ? " has-image" : ""}">${validImage
        ? `<img src="${item.image}" alt="">`
        : escapeHtml(item.content.slice(0, 150))}</div>
      <div class="vault-card-actions">
        <button type="button" class="vault-open" data-vault-open="${item.id}">↗ 開く</button>
        <button type="button" class="vault-download" data-vault-download="${item.id}">⬇ ダウンロード</button>
        <button type="button" class="vault-delete" data-vault-delete="${item.id}">🗑 削除</button>
      </div>
    </article>`;
  }).join("");
}

$("#deliverableVaultGrid")?.addEventListener("click", event => {
  const openButton = event.target.closest("[data-vault-open]");
  const downloadButton = event.target.closest("[data-vault-download]");
  const deleteButton = event.target.closest("[data-vault-delete]");
  const id = openButton?.dataset.vaultOpen
    || downloadButton?.dataset.vaultDownload
    || deleteButton?.dataset.vaultDelete;
  if (!id) return;
  const item = deliverableVaultItems.find(record => record.id === id);
  if (!item) return;
  if (openButton) openArchivedDeliverable(item);
  else if (downloadButton) downloadArchivedDeliverable(item);
  else deleteArchivedDeliverable(item);
});

function setDeliverableVaultOpen(open) {
  const vault = document.querySelector(".deliverable-vault");
  const toggle = $("#deliverableVaultToggle");
  const backdrop = $("#deliverableVaultBackdrop");
  if (!vault || !toggle || !backdrop) return;
  vault.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "✕ 保管庫を閉じる" : "完成物を見る";
  backdrop.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
}

$("#deliverableVaultToggle")?.addEventListener("click", () => {
  const vault = document.querySelector(".deliverable-vault");
  setDeliverableVaultOpen(!vault?.classList.contains("open"));
});
$("#deliverableVaultBackdrop")?.addEventListener("click", () => setDeliverableVaultOpen(false));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && document.querySelector(".deliverable-vault.open")) {
    setDeliverableVaultOpen(false);
  }
});

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
  if (!modalOverlay.hidden) return;
  const utter = new SpeechSynthesisUtterance(text);
  applyStaffVoice(utter, STAFF[staffIndex]?.id || "reina");
  window.speechSynthesis.speak(utter);
}

const STAFF_VOICE_PROFILES = {
  reina:      { gender: "female", pitch: 1.10, rate: 1.00, voiceOffset: 0 },
  sakura:     { gender: "female", pitch: 1.22, rate: 0.94, voiceOffset: 1 },
  takumi:     { gender: "male",   pitch: 0.76, rate: 0.95, voiceOffset: 0 },
  asuka:      { gender: "female", pitch: 1.02, rate: 0.92, voiceOffset: 2 },
  elf_sketch: { gender: "female", pitch: 1.16, rate: 1.06, voiceOffset: 3 },
  elf_if:     { gender: "female", pitch: 1.07, rate: 0.88, voiceOffset: 4 },
  elf_lively: { gender: "female", pitch: 1.28, rate: 1.12, voiceOffset: 5 },
  elf_jobs:   { gender: "male",   pitch: 0.86, rate: 1.03, voiceOffset: 1 },
  mana_jobs:  { gender: "female", pitch: 1.12, rate: 1.04, voiceOffset: 6 },
  mana_narration: { gender: "male", pitch: 0.9, rate: 0.96, voiceOffset: 2 },
  mana_staff_dialogue: { gender: "male", pitch: 1.0, rate: 1.04, voiceOffset: 4 },
  miyabis_ads:{ gender: "female", pitch: 1.02, rate: 1.08, voiceOffset: 7 },
  kabayaki_script:{ gender: "female", pitch: .96, rate: 1.02, voiceOffset: 8 },
  ryoshin_jobs:{ gender: "female", pitch: 1.08, rate: 1.04, voiceOffset: 9 },
  ryoshin_video_editor:{ gender: "male", pitch: .84, rate: 1.02, voiceOffset: 2 },
  invoice_clerk:{ gender: "female", pitch: 1.18, rate: 1.08, voiceOffset: 10 },
};

function voiceLooksFemale(voice) {
  return /kyoko|nanami|haruka|female|woman|女性|女声/i.test(voice.name || "");
}

function voiceLooksMale(voice) {
  return /otoya|ichiro|kenji|male|man|男性|男声/i.test(voice.name || "");
}

function applyStaffVoice(utterance, staffId, overrides = {}) {
  const profile = STAFF_VOICE_PROFILES[staffId] || STAFF_VOICE_PROFILES.reina;
  const japaneseVoices = voices.filter(voice => voice.lang?.toLowerCase().startsWith("ja"));
  const genderVoices = japaneseVoices.filter(voice =>
    profile.gender === "male" ? voiceLooksMale(voice) : voiceLooksFemale(voice)
  );
  const candidates = genderVoices.length ? genderVoices : japaneseVoices;
  if (candidates.length) utterance.voice = candidates[profile.voiceOffset % candidates.length];
  utterance.lang = "ja-JP";
  utterance.pitch = overrides.pitch ?? profile.pitch;
  utterance.rate = overrides.rate ?? profile.rate;
  utterance.volume = overrides.volume ?? 1;
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
  if (status === "break") return { label: "😴 休憩中", cls: "break" };
  return { label: "待機中", cls: "idle" };
}

function mascotFigureHTML(staff, statusCls) {
  const index = STAFF.indexOf(staff);
  const animDelay = ((index * 0.37) % 3).toFixed(2);
  const blinkDelay = ((index * 0.53) % 4).toFixed(2);
  const motionCls = statusCls === "working" ? "working" : statusCls === "break" ? "sleeping" : "idle";
  return `
    <div class="mascot ${motionCls} staff-${staff.id} ears-${staff.ear} eyes-${staff.eyes} acc-${staff.accessory} shape-${staff.shape}"
         style="--c1:${staff.grad[0]};--c2:${staff.grad[1]};--anim-delay:${animDelay}s;--blink-delay:${blinkDelay}s;">
      <div class="m-shadow"></div>
      <div class="m-foot l"></div>
      <div class="m-foot r"></div>
      <div class="m-ear l"></div>
      <div class="m-ear r"></div>
      <div class="m-hair"></div>
      <div class="m-face">
        <div class="m-eyes"><span></span><span></span></div>
        <div class="m-blush l"></div>
        <div class="m-blush r"></div>
      </div>
      <div class="m-accessory"><span></span><span></span></div>
      <div class="m-body"></div>
      <div class="m-badge">${staff.emoji}</div>
    </div>
  `;
}

function renderMascotTile(staff) {
  const s = state[staff.id];
  const meta = statusMeta(s.status);
  const tile = document.createElement("article");
  tile.className = `mascot-tile ${meta.cls}`;
  tile.id = `tile-${staff.id}`;
  tile.dataset.id = staff.id;
  tile.tabIndex = 0;
  tile.setAttribute("role", "button");
  tile.setAttribute("aria-label", `${staff.name}（${staff.role}）`);

  tile.innerHTML = `
    <button type="button" class="mascot-gear-btn" data-gear-id="${staff.id}" aria-label="${staff.name}の設定" title="プロンプト設定">⚙️</button>
    <div class="speech-bubble-pop" id="bubble-${staff.id}"></div>
    ${mascotFigureHTML(staff, meta.cls)}
    <p class="mascot-name-tag">${staff.name}</p>
    <p class="mascot-role">${staff.role}</p>
    <span class="mascot-status-chip" id="status-${staff.id}">${meta.label}${s.status === "review" ? " 📄" : ""}</span>
    ${s.status === "working" ? `<div class="mascot-mini-progress" style="--c1:${staff.grad[0]};--c2:${staff.grad[1]};"><div class="mascot-mini-progress-fill" id="progress-${staff.id}"></div></div>` : ""}
  `;
  return tile;
}

function renderTeamRoom(team) {
  const room = document.createElement("section");
  const memberCount = Math.max(1, team.staff.length);
  room.className = `team-room team-size-${Math.min(memberCount, 4)}`;
  room.id = `team-${team.id}`;
  room.style.setProperty("--t1", team.t[0]);
  room.style.setProperty("--t2", team.t[1]);
  room.style.setProperty("--room-staff-count", String(Math.min(memberCount, 4)));

  const teamTasks = [...taskRegistry.values()].filter(task => team.staff.includes(task.staffId));
  const active = teamTasks.length;
  const completed = teamTasks.filter(task => task.status === "review").length;

  room.innerHTML = `
    <div class="team-header">
      <div class="team-icon">${team.icon}</div>
      <div class="team-title-block">
        <h2>${team.name}</h2>
      </div>
      <div class="team-progress-badge" id="teamBadge-${team.id}">${completed}/${active} 完了</div>
    </div>
    <div class="team-progress-track"><div class="team-progress-fill" id="teamProgress-${team.id}" style="width:${active ? (completed / active) * 100 : 0}%"></div></div>
    <div class="mascot-row" id="mascotRow-${team.id}"></div>
  `;
  const row = room.querySelector(`#mascotRow-${team.id}`);
  team.staff
    .filter(staffId => state[staffId].status !== "break")
    .forEach(staffId => {
      const staff = STAFF.find(s => s.id === staffId);
      row.appendChild(renderMascotTile(staff));
    });
  return room;
}

function renderBreakRoom() {
  const breakRoom = document.getElementById("breakRoom");
  const row = document.getElementById("breakRoomRow");
  if (!breakRoom || !row) return;
  if (!BREAK_ROOM_ENABLED) {
    STAFF.forEach(staff => {
      if (state[staff.id].status === "break") {
        state[staff.id].status = "idle";
        state[staff.id]._breakSince = null;
      }
    });
    breakRoom.hidden = true;
    document.getElementById("breakRoomPage")?.setAttribute("hidden", "");
    document.body.classList.remove("break-room-open");
    renderCinemaAudience([]);
    return;
  }
  const onBreak = STAFF.filter(s => state[s.id].status === "break");
  renderCinemaAudience(onBreak);
  const names = onBreak.length ? onBreak.map(staff => staff.name).join("・") : "現在メンバーはいません";
  ["breakLobbyCount", "breakPageCount"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.textContent = `休憩中 ${onBreak.length}人`;
  });
  ["breakLobbyNames", "breakPageNames"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.textContent = names;
  });
  renderPointsRanking();
  row.innerHTML = "";
  if (onBreak.length === 0) {
    breakRoom.hidden = false;
    row.innerHTML = `
      <div class="break-room-empty">
        <span>🎮</span>
        <div><strong>現在、休憩中のスタッフはいません</strong><small>面接チームとあまねが交代で休憩します。</small></div>
      </div>`;
    return;
  }
  breakRoom.hidden = false;
  onBreak.forEach(staff => row.appendChild(renderMascotTile(staff)));
}

function renderCinemaAudience(staffList) {
  const audience = document.getElementById("cinemaAudience");
  if (!audience) return;
  if (!staffList.length) {
    audience.innerHTML = `<div class="cinema-audience-empty"><span>🍿</span><small>現在、休憩中のスタッフはいません</small></div>`;
    return;
  }
  audience.innerHTML = staffList.map(staff => `
    <div class="cinema-staff" title="${escapeHtml(staff.name)}">
      ${mascotFigureHTML(staff, "break")}
      <span>${escapeHtml(staff.name)}</span>
    </div>`).join("");
}

function renderPointsRanking() {
  const ranking = document.getElementById("breakPointsRanking");
  const ownerDisplay = document.getElementById("ownerPointsDisplay");
  if (ownerDisplay) ownerDisplay.textContent = `🪙 ${Math.floor(pointWallet.owner)}P`;
  if (!ranking) return;
  const sorted = [...STAFF].sort((a, b) =>
    pointWallet.staff[b.id] - pointWallet.staff[a.id] || a.name.localeCompare(b.name, "ja")
  );
  ranking.innerHTML = sorted.map((staff, index) => `
    <div class="break-rank-item${index === 0 ? " top-1" : ""}" title="${staff.name} ${Math.floor(pointWallet.staff[staff.id])}ポイント">
      <b>${index + 1}位</b><span>${staff.name}</span><small>${Math.floor(pointWallet.staff[staff.id])}P</small>
    </div>`).join("");
}

document.getElementById("pointsRankingToggle")?.addEventListener("click", () => {
  const toggle = document.getElementById("pointsRankingToggle");
  const panel = document.getElementById("pointsRankingPanel");
  const opening = panel.hidden;
  panel.hidden = !opening;
  toggle.setAttribute("aria-expanded", String(opening));
  const hint = toggle.querySelector("i");
  if (hint) hint.textContent = opening ? "ランキングを閉じる ▲" : "ランキングを見る ▼";
});

function setBreakRoomPage(open, updateHistory = true) {
  const page = document.getElementById("breakRoomPage");
  if (!page) return;
  if (!BREAK_ROOM_ENABLED) open = false;
  if (open) setCinemaPage(false, false);
  page.hidden = !open;
  document.body.classList.toggle("break-room-open", open || !document.getElementById("cinemaPage")?.hidden);
  if (open) renderBreakRoom();
  if (updateHistory) {
    const nextUrl = open ? `${window.location.pathname}${window.location.search}#break-room` : `${window.location.pathname}${window.location.search}`;
    window.history.pushState({ breakRoom: open }, "", nextUrl);
  }
}

function setCinemaPage(open, updateHistory = true) {
  const page = document.getElementById("cinemaPage");
  if (!page) return;
  if (open) setBreakRoomPage(false, false);
  page.hidden = !open;
  document.body.classList.toggle("break-room-open", open || !document.getElementById("breakRoomPage")?.hidden);
  if (updateHistory) {
    const nextUrl = open ? `${window.location.pathname}${window.location.search}#cinema` : `${window.location.pathname}${window.location.search}`;
    window.history.pushState({ cinema: open }, "", nextUrl);
  }
}

document.getElementById("enterBreakRoomBtn")?.addEventListener("click", () => setBreakRoomPage(true));
document.getElementById("leaveBreakRoomBtn")?.addEventListener("click", () => setBreakRoomPage(false));
document.getElementById("breakToCinemaBtn")?.addEventListener("click", () => setCinemaPage(true));
document.getElementById("leaveCinemaBtn")?.addEventListener("click", () => {
  const player = document.getElementById("cinemaPlayer");
  if (player) player.src = "";
  setCinemaPage(false);
});
async function searchCinemaYoutube() {
  const input = document.getElementById("cinemaYoutubeSearch");
  const results = document.getElementById("cinemaSearchResults");
  const message = document.getElementById("cinemaMessage");
  const query = input?.value.trim();
  if (!query) {
    message.textContent = "観たい動画の名前を入力してください。";
    input?.focus();
    return;
  }
  message.textContent = "YouTubeを検索しています…";
  results.innerHTML = `<div class="cinema-search-loading">🎞️ 検索中…</div>`;
  try {
    const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`, { cache:"no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "検索できませんでした。");
    if (!data.items?.length) {
      results.innerHTML = `<div class="cinema-search-loading">該当する動画が見つかりませんでした。</div>`;
      message.textContent = "別のキーワードでもう一度検索してください。";
      return;
    }
    results.innerHTML = data.items.map(item => `
      <button type="button" class="cinema-video-result" data-video-id="${item.videoId}" title="${escapeHtml(item.title)}を再生">
        <img src="${item.thumbnail}" alt="" loading="lazy">
        <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.channelTitle)}</small></span>
        <b>▶</b>
      </button>`).join("");
    message.textContent = `${data.items.length}件見つかりました。観たい動画を選んでください。`;
  } catch (error) {
    results.innerHTML = "";
    message.textContent = error.message || "YouTubeを検索できませんでした。";
  }
}

document.getElementById("cinemaSearchBtn")?.addEventListener("click", searchCinemaYoutube);
document.getElementById("cinemaYoutubeSearch")?.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchCinemaYoutube();
  }
});
document.getElementById("cinemaSearchResults")?.addEventListener("click", event => {
  const result = event.target.closest(".cinema-video-result");
  if (!result) return;
  const videoId = result.dataset.videoId;
  if (!/^[\w-]{6,20}$/.test(videoId)) return;
  const player = document.getElementById("cinemaPlayer");
  const placeholder = document.getElementById("cinemaPlaceholder");
  const message = document.getElementById("cinemaMessage");
  const title = result.querySelector("strong")?.textContent || "YouTube動画";
  player.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  player.hidden = false;
  placeholder.hidden = true;
  message.textContent = "選んだ動画をスクリーンで再生しています。";
  document.querySelectorAll(".cinema-video-result").forEach(item => item.classList.toggle("playing", item === result));
  sharedLastCinemaUpdate = Date.now();
  postSharedRoom({ action:"cinema", videoId, title });
});
window.addEventListener("popstate", () => {
  setBreakRoomPage(window.location.hash === "#break-room", false);
  setCinemaPage(window.location.hash === "#cinema", false);
});
if (window.location.hash === "#break-room") {
  setBreakRoomPage(BREAK_ROOM_ENABLED, false);
  if (!BREAK_ROOM_ENABLED) {
    window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
  }
} else if (window.location.hash === "#cinema") {
  setCinemaPage(true, false);
}

function updateTeamProgress(team) {
  const teamTasks = [...taskRegistry.values()].filter(task => team.staff.includes(task.staffId));
  const active = teamTasks.length;
  const completed = teamTasks.filter(task => task.status === "review").length;
  const badge = document.getElementById(`teamBadge-${team.id}`);
  const fill = document.getElementById(`teamProgress-${team.id}`);
  if (badge) badge.textContent = `${completed}/${active} 完了`;
  if (fill) fill.style.width = `${active ? (completed / active) * 100 : 0}%`;
}

function renderAll() {
  officeFloor.innerHTML = "";
  const visibleTeamIds = new Set(OFFICE_ROOMS[activeOfficeRoom] || OFFICE_ROOMS.operations);
  TEAMS
    .filter(team => visibleTeamIds.has(team.id))
    .forEach(team => officeFloor.appendChild(renderTeamRoom(team)));
  document.querySelectorAll("[data-office-room]").forEach(button => {
    const active = button.dataset.officeRoom === activeOfficeRoom;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderBreakRoom();
  updateStats();
}

document.querySelectorAll("[data-office-room]").forEach(button => {
  button.addEventListener("click", () => {
    const room = button.dataset.officeRoom;
    if (!OFFICE_ROOMS[room] || room === activeOfficeRoom) return;
    activeOfficeRoom = room;
    localStorage.setItem(OFFICE_ROOM_KEY, room);
    renderAll();
  });
});

function findTeamOf(staffId) {
  return TEAMS.find(t => t.staff.includes(staffId));
}

function updateCard(staffId) {
  const staff = STAFF.find(s => s.id === staffId);
  const old = document.getElementById(`tile-${staffId}`);
  const fresh = renderMascotTile(staff);
  if (old) old.replaceWith(fresh);
  const team = findTeamOf(staffId);
  if (team) updateTeamProgress(team);
}

function updateStats() {
  $("#statTotal").textContent = STAFF.length;
  const tasks = [...taskRegistry.values()];
  const working = tasks.filter(task => task.status === "working").length;
  const review = tasks.filter(task => task.status === "review").length;
  const active = working + review;
  $("#statWorking").textContent = working;
  $("#statReview").textContent = review;
  $("#statDone").textContent = `${review}/${active}`;
}

function formatWorkedTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}時間${String(minutes).padStart(2, "0")}分`
    : `${minutes}分${String(seconds).padStart(2, "0")}秒`;
}

function renderWorkTimes() {
  const list = $("#workTimeList");
  const summary = $("#workTimeSummary");
  if (!list || !summary) return;
  const total = STAFF.reduce((sum, staff) => sum + state[staff.id]._workedMs, 0);
  const average = STAFF.length ? total / STAFF.length : 0;
  summary.textContent = `全員合計 ${formatWorkedTime(total)} ／ 1人平均 ${formatWorkedTime(average)}`;
  list.innerHTML = STAFF.map(staff => {
    const meta = statusMeta(state[staff.id].status);
    return `<div class="worktime-row">
      <span class="worktime-avatar" style="background:linear-gradient(135deg,${staff.grad[0]},${staff.grad[1]})">${staff.emoji}</span>
      <span class="worktime-name"><strong>${staff.name}</strong><small>${meta.label}・${staff.role}</small></span>
      <span class="worktime-value">${formatWorkedTime(state[staff.id]._workedMs)}</span>
    </div>`;
  }).join("");
}

function persistWorkTimes() {
  try {
    const times = Object.fromEntries(STAFF.map(staff => [staff.id, Math.round(state[staff.id]._workedMs)]));
    localStorage.setItem(WORKTIME_KEY, JSON.stringify({ date: WORKTIME_DATE, mode: WORKTIME_MODE_VERSION, times }));
  } catch {
    /* 保存できなくても画面内の計測は継続 */
  }
}

const workTimeOverlay = $("#workTimeOverlay");
$("#openWorkTimeBtn")?.addEventListener("click", () => {
  renderWorkTimes();
  workTimeOverlay.hidden = false;
});
$("#workTimeClose")?.addEventListener("click", () => { workTimeOverlay.hidden = true; });
workTimeOverlay?.addEventListener("click", event => {
  if (event.target === workTimeOverlay) workTimeOverlay.hidden = true;
});

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
  "寸劇系台本制作担当": () => `【えるふろんてぃあ TikTok寸劇台本】
テーマ：追加プロンプトの内容を反映

0:00-0:03　視聴者を止めるひと言
0:03-0:12　登場人物A・Bのテンポの良い掛け合い
0:12-0:22　すれ違い、誤解、意外な展開
0:22-0:30　オチとコメントを促すひと言

撮影メモ：表情、間、カメラ位置、テロップ、効果音を各セリフに合わせて調整してください。`,

  "もしもシリーズ系台本担当": () => `【えるふろんてぃあ TikTokもしもシリーズ台本】
テーマ：追加プロンプトの内容を反映

0:00-0:03　「もしも○○だったら」で開始
0:03-0:10　通常とは違う世界観を提示
0:10-0:22　想定外の展開を3段階で強くする
0:22-0:30　最大のオチと次回への引き

撮影メモ：世界観が一目で伝わる小道具・テロップ・効果音を指定してください。`,

  "にぎやか系台本制作担当": () => `【えるふろんてぃあ TikTokにぎやか系台本】
テーマ：追加プロンプトの内容を反映

0:00-0:03　複数キャストの元気な掛け声で開始
0:03-0:10　短いセリフをテンポよくつなぐ
0:10-0:22　リアクション、ツッコミ、動きを重ねて盛り上げる
0:22-0:30　全員で決め台詞と勇者様へのCTA

撮影メモ：話者が分かる台詞表記、立ち位置、カメラ移動、テロップ、効果音を明記してください。`,

  "エンタメ系求人台本担当": () => `【えるふろんてぃあ TikTok求人台本】
募集テーマ：追加プロンプトの内容を反映

0:00-0:03　求職者の悩みに刺さるフック
0:03-0:12　仕事内容と職場の魅力
0:12-0:22　働く人のリアルな一日・成長機会
0:22-0:30　応募条件と行動を促すCTA

制作メモ：確認できない待遇や条件は捏造せず、差し替え箇所として明記してください。`,

  "求人台本制作担当": topic => `【マナコーポレーション TikTok求人台本】
テーマ：${topic}

0:00-0:03　求職者が自分事に感じるフック
0:03-0:12　仕事内容と職場の魅力
0:12-0:22　働く人のリアルな声と具体的な情報
0:22-0:30　応募への分かりやすいCTA

制作メモ：会社情報、待遇、応募条件は設定プロンプトにある事実だけを使い、不明点は差し替え欄にしてください。`,

  "広告台本制作担当": topic => `【ミヤビス TikTok広告台本】
テーマ：${topic}

0:00-0:03　悩みや驚きから始まる広告フック
0:03-0:12　商品・サービスの利用場面
0:12-0:22　特徴と選ぶ理由を具体化
0:22-0:30　自然で明確なCTA

制作メモ：確認できない効果や実績は断定せず、設定プロンプトにある情報だけを使用してください。`,

  "TikTok台本制作担当": topic => `【かばやき屋 TikTok運用代行台本】
テーマ：${topic}

0:00-0:03　視聴者を止める具体的なフック
0:03-0:12　テーマが伝わる場面と短い展開
0:12-0:22　共感・驚き・役立つ情報のいずれかを強める
0:22-0:30　内容を回収するオチまたはCTA

制作メモ：設定プロンプトに記載された事実と目的を優先し、撮影できるセリフ・動作・テロップまで具体化してください。`,

  "求人TikTok台本担当": topic => `【合同会社良心 TikTok求人台本】
テーマ：${topic}

確認済みの会社情報と募集条件だけを使い、求職者が仕事内容と応募方法を一度で理解できる台本にしてください。
未登録の給与、休日、待遇、勤務地、応募条件は作らず、必要な箇所を差し替え欄にしてください。`,

  "TikTok動画編集担当": topic => `【合同会社良心 TikTok動画編集指示】
素材・目的：${topic}

完成尺、カット順、不要部分、テロップ、BGM・効果音、色調、縦動画の書き出し設定を、実編集で使える順番に整理してください。`,

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

// FLIP-style travel: clone the mascot and animate it across real screen
// coordinates from the break room to its desk, instead of teleporting.
function flyMascotBetween(fromRect, toRect, staff, durationMs, onDone) {
  const runner = document.createElement("div");
  runner.className = "mascot-runner";
  runner.innerHTML = mascotFigureHTML(staff, "working");
  runner.querySelector(".mascot").classList.add("running");
  runner.style.left = `${fromRect.left}px`;
  runner.style.top = `${fromRect.top}px`;
  runner.style.width = `${fromRect.width}px`;
  runner.style.height = `${fromRect.height}px`;
  document.body.appendChild(runner);

  const dx = toRect.left - fromRect.left;
  const dy = toRect.top - fromRect.top;
  const anim = runner.animate(
    [
      { transform: "translate(0, 0)", offset: 0 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 26}px)`, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px)`, offset: 1 },
    ],
    { duration: durationMs, easing: "ease-in-out" }
  );
  anim.onfinish = () => {
    runner.remove();
    if (onDone) onDone();
  };
}

function startTask(staffId, instruction, taskOptions = {}) {
  // Accounting is a dedicated local workflow. Never send Misaki's work to
  // the generic staff generation endpoint, regardless of who called startTask.
  if (staffId === "invoice_clerk") {
    void routeAccountingInstruction(instruction);
    return;
  }
  const s = state[staffId];
  if (s.status === "break") {
    const staff = STAFF.find(x => x.id === staffId);
    const fromTile = document.getElementById(`tile-${staffId}`);
    const fromMascotEl = fromTile && fromTile.querySelector(".mascot");
    const fromRect = fromMascotEl ? fromMascotEl.getBoundingClientRect() : null;
    addLog("🏃", `${staff.name}が休憩スペースから走って戻ってきています…`);

    // move state + rerender now so the desk slot exists; keep it invisible
    // until the runner clone actually arrives there.
    s.status = "working";
    renderAll();
    const toTile = document.getElementById(`tile-${staffId}`);
    const toMascotEl = toTile && toTile.querySelector(".mascot");

    if (fromRect && toMascotEl) {
      toMascotEl.style.visibility = "hidden";
      flyMascotBetween(fromRect, toMascotEl.getBoundingClientRect(), staff, 280, () => {
        toMascotEl.style.visibility = "visible";
        runStartTask(staffId, instruction, true, true, taskOptions);
      });
    } else {
      setTimeout(() => runStartTask(staffId, instruction, true, true, taskOptions), 280);
    }
  } else {
    runStartTask(staffId, instruction, false, false, taskOptions);
  }
}

function runStartTask(staffId, instruction, wasOnBreak, alreadyRendered, taskOptions = {}) {
  const staff = STAFF.find(s => s.id === staffId);
  const idx = STAFF.indexOf(staff);
  const s = state[staffId];
  const taskId = `${staffId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const task = {
    id: taskId,
    staffId,
    instruction,
    status: "working",
    startedAt: Date.now(),
    deliverable: "",
    image: "",
    model: "",
    batchId: taskOptions.batchId || "",
    batchTeamId: taskOptions.batchTeamId || "",
    batchExpectedStaffIds: Array.isArray(taskOptions.batchExpectedStaffIds) ? taskOptions.batchExpectedStaffIds : [],
    skipIndividualArchive: Boolean(taskOptions.skipIndividualArchive),
  };
  taskRegistry.set(taskId, task);
  s._taskIds.push(taskId);
  publishSharedTask({
    type:"task-start",
    taskId,
    staffId,
    instruction,
  });
  syncStaffTaskState(staffId);
  s._breakSince = null;
  s.lastInstruction = instruction;
  if (!alreadyRendered) {
    if (wasOnBreak) renderAll();
    else updateCard(staffId);
  }
  updateStats();

  const startLine = wasOnBreak
    ? "休憩から戻りました。今から作業を開始します。実際の処理時間を表示します。"
    : "今から作業を開始します。実際の処理時間を表示します。";
  showBubble(staffId, `💬 ${startLine}`, 5200);
  speak(startLine, idx);
  addLog("🎤", `${staff.name}(${staff.role})に指示: 「${instruction}」`);
  addLog(wasOnBreak ? "☕" : "🚀", wasOnBreak
    ? `${staff.name}が休憩から戻り、API処理を開始しました`
    : `${staff.name}がAPI処理を開始しました`);

  s._taskStartedAt = task.startedAt;
  const updateElapsedTime = () => {
    const workingTasks = tasksForStaff(staffId, "working");
    if (!workingTasks.length) {
      if (s._elapsedTimer) window.clearInterval(s._elapsedTimer);
      s._elapsedTimer = null;
      return;
    }
    const oldestStartedAt = Math.min(...workingTasks.map(item => item.startedAt));
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - oldestStartedAt) / 1000));
    const fillEl = document.getElementById(`progress-${staffId}`);
    const statusEl = document.getElementById(`status-${staffId}`);
    if (fillEl) fillEl.style.width = `${Math.min(92, 12 + elapsedSeconds * 3)}%`;
    if (statusEl && state[staffId].status === "working") {
      statusEl.textContent = workingTasks.length > 1
        ? `${workingTasks.length}件同時処理中・経過${elapsedSeconds}秒`
        : `API処理中・経過${elapsedSeconds}秒`;
    }
  };
  updateElapsedTime();
  if (!s._elapsedTimer) s._elapsedTimer = window.setInterval(updateElapsedTime, 250);

  // 残り時間を捏造せず、実際のAPI処理を直ちに開始する。
  completeTask(staffId, taskId);
}

async function archiveCompletedTeamBatch(task) {
  if (!task?.batchId || !task.batchTeamId) return;
  const archiveKey = `${task.batchId}:${task.batchTeamId}`;
  if (archivedTeamBatchIds.has(archiveKey)) return;
  const expectedIds = task.batchExpectedStaffIds || [];
  const batchTasks = [...taskRegistry.values()].filter(item =>
    item.batchId === task.batchId
    && item.batchTeamId === task.batchTeamId
    && (!expectedIds.length || expectedIds.includes(item.staffId))
  );
  const completedByStaff = new Map();
  batchTasks
    .filter(item => item.status === "review" && item.deliverable)
    .sort((a, b) => b.startedAt - a.startedAt)
    .forEach(item => {
      if (!completedByStaff.has(item.staffId)) completedByStaff.set(item.staffId, item);
    });
  if (!batchTasks.length || expectedIds.some(staffId => !completedByStaff.has(staffId))) return;
  archivedTeamBatchIds.add(archiveKey);
  const team = TEAMS.find(item => item.id === task.batchTeamId);
  const completedTasks = expectedIds.length
    ? expectedIds.map(staffId => completedByStaff.get(staffId)).filter(Boolean)
    : [...completedByStaff.values()];
  const entries = completedTasks.map(item => {
    const staff = STAFF.find(person => person.id === item.staffId);
    return {
      taskId: item.id,
      staffId: item.staffId,
      staffName: staff?.name || item.staffId,
      role: staff?.role || "台本制作",
      content: item.deliverable || "",
      model: item.model || "",
    };
  });
  const teamName = team?.name || `${entries[0]?.staffName || "担当"}チーム`;
  const content = entries
    .map(entry => `【${entry.staffName}・${entry.role}】\n${entry.content}`)
    .join("\n\n");
  const archived = await archiveCompletedDeliverable({
    id: `team-${archiveKey}`,
    staffId: entries[0]?.staffId || "",
    staffName: teamName,
    role: `${teamName}・台本まとめ`,
    content,
    model: entries.map(entry => entry.model).filter(Boolean).join("／"),
    teamId: task.batchTeamId,
    entries,
    taskIds: entries.map(entry => entry.taskId),
  });
  if (!archived) {
    archivedTeamBatchIds.delete(archiveKey);
    return;
  }
  batchTasks
    .filter(item => item.status === "working")
    .forEach(item => {
      taskRegistry.delete(item.id);
      const staffState = state[item.staffId];
      if (staffState) staffState._taskIds = staffState._taskIds.filter(id => id !== item.id);
    });
  expectedIds.forEach(staffId => {
    syncStaffTaskState(staffId);
    updateCard(staffId);
  });
  updateStats();
  addLog("📚", `${teamName}の台本を1つのPDF用データにまとめました`);
}

async function completeTask(staffId, taskId) {
  const staff = STAFF.find(s => s.id === staffId);
  const idx = STAFF.indexOf(staff);
  const s = state[staffId];
  const task = taskRegistry.get(taskId);
  if (!task || task.status !== "working") return;

  const statusEl = document.getElementById(`status-${staffId}`);
  if (statusEl) statusEl.textContent = "専門AIで成果物を生成中・経過0秒";
  addLog("🤖", `${staff.name}が専門APIで成果物を生成しています`);

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffId,
        instruction: task.instruction,
        customPrompt: (staffSettings[staffId] || {}).prompt || "",
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "成果物を生成できませんでした。");
    task.deliverable = result.content || "";
    task.image = result.image || "";
    task.model = result.model || "";
    addLog("✨", `${staff.name}が${result.model || "専門API"}で成果物を作成しました`);
  } catch (error) {
    const hasDedicatedPrompt = Boolean((staffSettings[staffId] || {}).prompt?.trim());
    if (hasDedicatedPrompt) {
      task.deliverable = `専用プロンプトを反映した生成に失敗したため、条件を無視した代替成果物は作成しませんでした。\n\n${error.message}`;
      task.image = "";
      task.model = "生成停止";
      addLog("⚠️", `${staff.name}は専用条件を維持できないため生成を停止しました：${error.message}`);
    } else {
      task.deliverable = generateDeliverable(staff, task.instruction);
      task.image = "";
      task.model = "ローカル・役割別テンプレート";
      addLog("💻", `${staff.name}がローカルモードで成果物を作成しました`);
    }
  }

  const actualDurationMs = Math.max(1000, Date.now() - task.startedAt);
  const actualSeconds = Math.ceil(actualDurationMs / 1000);
  if (!task._workTimeCounted) {
    s._workedMs += actualDurationMs;
    task._workTimeCounted = true;
    persistWorkTimes();
  }
  task.status = "review";
  syncStaffTaskState(staffId);
  updateCard(staffId);
  updateStats();
  if (task.skipIndividualArchive) {
    await archiveCompletedTeamBatch(task);
    window.setTimeout(() => {
      void archiveCompletedTeamBatch(task);
    }, 1000);
  } else {
    await archiveCompletedDeliverable({
      taskId,
      staffId,
      staffName: staff.name,
      role: staff.role,
      content: task.deliverable,
      image: task.image,
      model: task.model,
    });
  }
  publishSharedTask({
    type:"task-complete",
    taskId,
    staffId,
    instruction:task.instruction,
    deliverable:task.deliverable,
    image:task.image,
    model:task.model,
    durationMs:actualDurationMs,
  });
  const doneLine = `${staff.name}です。作業が完了しました。ご確認をお願いします。`;
  showBubble(staffId, `💬 ${doneLine}`, 6000);
  speak(doneLine, idx);
  showDaifugoWorkNotice(staffId);
  addLog("✅", `${staff.name}が「${staff.role}」を${actualSeconds}秒で完了しました（実測）`);
}

function approveTaskById(staffId, taskId, logApproval = true) {
  const staff = STAFF.find(s => s.id === staffId);
  const s = state[staffId];
  if (taskId) {
    taskRegistry.delete(taskId);
    s._taskIds = s._taskIds.filter(id => id !== taskId);
  }
  syncStaffTaskState(staffId);
  updateCard(staffId);
  updateStats();
  if (logApproval) addLog("🙌", `${staff.name}の成果物を確認しました`);
}

function acknowledgeTaskForDeletedDeliverable(item) {
  if (Array.isArray(item?.taskIds) && item.taskIds.length) {
    item.taskIds.forEach(taskId => {
      const task = taskRegistry.get(taskId);
      if (task) approveTaskById(task.staffId, taskId, false);
    });
    return;
  }
  if (!item?.staffId || !state[item.staffId]) return;
  let taskId = item.taskId && taskRegistry.has(item.taskId) ? item.taskId : "";
  if (!taskId) {
    const matchingTask = tasksForStaff(item.staffId, "review").find(task =>
      task.deliverable === item.content
      || (item.content && task.deliverable?.includes(item.content.slice(0, 120)))
    );
    taskId = matchingTask?.id || "";
  }
  if (taskId) approveTaskById(item.staffId, taskId, false);
}

function approveTask(staffId) {
  approveTaskById(staffId, state[staffId]._displayTaskId, true);
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
const promptInputDetails = $("#promptInputDetails");
const modalPromptInput = $("#modalPromptInput");
const promptTextFields = $("#promptTextFields");
const ELF_INTERNAL_PROMPT = `【えるふろんてぃあ 店舗設定】
石川県金沢市片町にある異世界コンセプトカフェ＆バー。
お客様は「勇者様」と呼び、「勇者様のご入国をお待ちしております」という世界観。
営業時間：日曜〜木曜は19時〜24時、金曜・土曜は20時〜24時。

【実際の店内】
木目調の直線的なカウンターがあり、その前に黒いハイチェアが並ぶ。
壁は赤茶色のレンガ調。
天井付近には、緑の葉と白・淡紫色の垂れ下がる花の装飾がある。
床の一部には緑の人工芝と白い化粧石があり、明るい窓がある。
店内を台本に使う場合は、この実在する場所と設備を前提にする。
写真で確認できない個室、ステージ、大型厨房、階段などを勝手に追加しない。

【出演キャラクター】
ユウ❤️：2100歳／誕生日12月／マイペース
サラ🩵：2100歳／誕生日6月／元気
ヒスイ💚：2100歳／誕生日未設定／おっとり優等生
マリィ🤍：2200歳／誕生日未設定／ふわふわ妹系

【制作ルール】
誕生日など未設定の情報は勝手に作らない。
店舗設定・キャラクター設定・プロンプト本文は完成台本へ転載せず、制作条件としてのみ使用する。
営業時間を台本に使う場合は、日曜〜木曜19時開店、金曜・土曜20時開店、全日24時閉店を厳守する。営業前・開店直前・閉店後の時刻も曜日と矛盾させない。曜日を決めず具体的な開店時刻を出す場合は、日曜〜木曜として19時を使う。朝10時などを開店時刻として扱わない。
出演者はテーマに必要な人数だけを選び、それぞれの性格が展開そのものに影響する内容にする。
えるふろんてぃあの店内、接客、勇者様、入国、開店前後、カウンター、キャスト同士の関係など、この店でしか成立しない具体的な題材を使う。
一つの場所、一つの出来事、一つの目的に絞る。
各セリフや展開は直前の内容を受けたものにし、途中から説明なしで新しい人物、物、設定を出さない。
登場人物の知っていること、知らないこと、目的を途中で矛盾させない。
冒頭で出した情報を最後に回収し、初めて読む人にも理由が分かるオチにする。
見本チャンネルが指定されている担当者は、元動画を複製せず、構造、会話のテンポ、ズレの広げ方、オチの作り方だけを参考にする。

【完成前の内部確認】
全ての発言や展開について「なぜ今そうなったか」を直前の内容から説明できるか確認する。
人が実際に取る行動を時間順に並べ、気づく前に質問したり、探す前に見つけたりする前後逆転がないか確認する。
食べ物なら、座る、開ける、必要な道具がないと気づく、探す、誰かへ聞く、という生活上の自然な順番を飛ばさない。
人物の目的、事実関係、時系列に矛盾がないか確認する。
オチに必要な情報がオチより前に出ているか確認する。
一つでも満たさない場合は、出力せずに最初から作り直す。

【追加の共通ルール】
ここから下へ、毎回の台本に共通して反映したい指示を追記してください。`;

const ELF_LIVELY_REFERENCE_PROMPT = `【あまね専用・参考TikTokスタイル】
第一参考：https://www.tiktok.com/@kurokano_
第二参考：https://www.tiktok.com/@ibkurfjehwl
あまねでは第二参考の、休憩時間のようなスタッフ同士のバタバタしたトークを優先する。
・食べ物を開ける、スマホを見せる、衣装を探す、失敗を謝るなど、目で分かる日常動作から始める
・動画一つにつき事件は一つにし、その物や行動を最後まで話の軸にする
・当事者、からかう・割り込む人、最後に反応する人の関係を作る
・新人と先輩、注意する側とされる側、いじる側といじられる側など、普段の人間関係で笑いを動かす
・一人一文を短くし、質問、即答、割り込み、周囲の反応をテンポよく重ねる
・本人の言い訳、別スタッフの暴露、周囲の反応で気まずさを段階的に大きくする
・最後は冒頭の物や言葉を回収し、いじる側といじられる側などの立場が逆転する一言で終える
・撮影者を登場させる場合は男性。必要な場合は画面外から簡単な企画、質問、ゲームを振り、スタッフの素の反応を引き出す
・企画型では、男性撮影者の質問に全員が同時に答える、指さす、簡単な指示へ半分困りながら参加する流れを使える
・最後は全員が男性撮影者を選ぶ、撮り直しや無茶ぶりを指摘するなど、企画を始めた撮影者へ笑いが返る構造を優先する
・男性撮影者は毎回出さない。依頼で指定がなければ、企画型と女性スタッフだけの自然会話型を内容に合わせて使い分ける
・女性スタッフだけの型では、休憩、準備、片付け、食べ物、私物など一つの出来事から始め、普段の関係性が出る会話と立場の逆転で終える
・えるふろんてぃあの店内、接客、勇者様、入国、キャスト同士の関係など、この店でしか成立しない題材を使う
・ユウ、サラ、ヒスイ、マリィの性格が展開そのものに影響する会話にする
・休憩中のカウンターで全員が普通のことをしている最中に、恥ずかしい発覚、軽いいたずら、予想外の返答が起きる構成にする
・セリフで設定を説明せず、目の前の物と直前の発言への生の反応として話す
・無関係な発言を並べてバタバタ感を作らない
・「別の用事が次々入る」という同じ型へ毎回固定しない
・毎回「発覚→言い訳→暴露→立場逆転」に固定せず、題材に合わせて次の構成群から最も自然な一つを選ぶ
  1. 目の前の物から秘密や勘違いが発覚する自然会話型
  2. 二人の認識が少しずつズレ、第三者の一言で意味が確定するすれ違い型
  3. 男性撮影者の質問・二択・指さしから人間関係が見える企画型
  4. 一人の小さなお願いに全員が別々の解釈で応じる連鎖型
  5. 注意している側が実は一番できていないと分かるブーメラン型
  6. 静かな日常会話の一言だけが強く、周囲が遅れて反応する間の笑い型
  7. 協力して一つの目的を達成しようとするが、性格差で予想外の着地になる共同作業型
・すべての構成に暴露、言い訳、立場逆転を入れる必要はない。勘違いの解消、全員一致、無言の反応、本人だけ気づかない、撮影者への返しなど、オチの仕組みも変える
・複数本を依頼された場合は、連続する台本で「冒頭の行動」「会話を始める人物」「出演人数」「構成型」「オチを言う人物」「オチの仕組み」を重複させない
・食べ物、忘れ物、スマホ、衣装、謝罪だけに偏らず、カウンターの片付け、ハイチェア、掃除、開店準備、閉店後の確認、撮影の相談、言い間違い、当番や順番決めなど実在店内で成立する題材を広く使う
・元動画の台本、固有キャラクター、セリフ、映像、音源はコピーせず、えるふろんてぃあ用に新規制作する`;

const HIYORI_REFERENCE_PROMPT = `【ひより専用・参考TikTokスタイル】
参考動画1：https://www.tiktok.com/@magical_lollipop_akb_/video/7357289365913079041
参考動画2：https://www.tiktok.com/@enchant_shizuoka/video/7578476928475221256
参考動画3：https://www.tiktok.com/@sleepcastle/video/7597138132458425617

【参考にする構造】
・完成尺は約1分（55〜65秒）を基準にし、自然な間を含めて14〜20行程度のセリフで構成する
・参考動画1のように、コンカフェで実際に起こりそうな一つの接客トラブルを、短い会話で段階的に強める再現ドラマ型を使える
・参考動画2のように、接客中の表向きのセリフと、女の子側の本音・心の声のギャップを見せるショートドラマ型を使える
・参考動画3のように、相手を指摘した本人にも同じ矛盾が見つかり、最後に大きなブーメランとして返る会話コント型を使える
・冒頭0〜2秒で「どんな客・どんな本音・どんな問題か」が分かる強い見出しを置く
・お客様役とキャスト役の短い会話、顔の寄り、表情アップ、強調テロップを使い、縦画面で状況をすぐ理解できるようにする
・問題や違和感は同じ出来事の中で2〜3段階だけ強め、途中から別の事件へ飛ばさない
・本音型では「口に出すセリフ」と「心の声」を明確に分け、相手の直前の発言を受けて本音が変化するようにする
・迷惑行為や危険な要求は肯定せず、キャストが境界線を示す、別スタッフが助ける、店のルールで収めるなど安全な結末にする
・お客様への暴言、侮辱、蔑称、容姿批判、人格否定、威圧的な追い返し、差別表現は一切使わない
・問題行為への注意は「安全のためお控えください」「ルールを守っていただけない場合は退店をお願いします」のように冷静で丁寧に伝える
・笑いの対象はお客様の尊厳や属性ではなく、会話の矛盾、思い込み、状況の逆転にする
・0〜10秒で状況と論点、10〜45秒で3段階の展開、45〜55秒で矛盾の発覚、最後の5〜10秒で冒頭を回収する明確なオチを作る
・最後は切り返し、本音の漏れ、別スタッフの一言、ルール提示など、冒頭の問題を回収する短いオチで終える。単なる説明、仲直り、注文追加だけをオチにしない
・えるふろんてぃあの実在する店内と、ユウ・サラ・ヒスイ・マリィの登録済み設定へ置き換えて完全新規制作する
・参考元の店舗名、人物、衣装、セリフ、出来事、テロップ、音源はコピーしない。構造、テンポ、視点の切り替えだけを参考にする`;

const HIYORI_TRANSCRIPT_ANALYSIS_PROMPT = `【ひより専用・文字起こし再分析ルール】

■ 型A：接客トラブル再現・反復エスカレート型
1. 同僚や第三者が問題客の行動パターンに気づき、冒頭で動画の論点を提示する
2. お客様役が目に見える物を褒めながら距離を詰める
3. キャストがすぐ制止し、店のルールを短く明確に伝える
4. お客様役は偶然を装って言い訳する
5. 別スタッフが、その言い訳の矛盾を具体的に指摘する
6. 一度通常接客へ戻した後、別の商品や店内設備に関わる場面で同じ問題が再発する
7. 周囲が次の行動を予測し、視聴者に再発を期待させる
8. 距離が近づく場面では立ち位置や間隔など安全ルールを先に説明する
9. 再発したら、謝罪だけで流さず退店や出入り禁止など店側の結論を明確にする
10. 最後は第三者の短い客観コメントで締められる

反復するたびに対象、距離が近づく理由、店側の警戒、結末を一段ずつ進める。
迷惑行為を笑って許容せず、キャストの安全と境界線を明確にする。
尺は内容に応じて45〜90秒も使用できる。

■ 型B：表向きの接客と本音の交互型
1. キャストが通常接客を始める
2. 好みのお客様など心が動く出来事を見た瞬間の本音を冒頭フックにする
3. 表向きには自然な質問をする
4. お客様の返答を受け、口には出さない喜びや期待を心の声で即座に返す
5. お客様の自慢話や何気ない発言に、接客上の受け答えと本音の温度差を作る
6. 別スタッフが退店時刻など現実的な情報を伝え、時間制限を入れる
7. 「もっといてほしい」という本音が、延長や次の提案など実際の行動へつながる
8. 最後は隠していた本音が選択や一言に表れた瞬間で締める

心の声は必ず直前の相手の発言への反応にする。
台本では「口に出すセリフ」「心の声」「第三者のセリフ」を明確に分ける。
尺は20〜40秒を基本にし、本音が次の行動へつながる因果関係を作る。

型A・型B・型Cのうち依頼内容に合う一つだけを選び、一つの動画へ複数の型を詰め込まない。
文字起こしのセリフ、人物、店舗、出来事はコピーせず、えるふろんてぃあ用の完全新規台本にする。`;

const HIYORI_BOOMERANG_PROMPT = `【ひより専用・第三参考＋接客言葉ルール】

■ 型C：特大ブーメラン会話型
1. お客様役またはキャスト役が、相手の仕事、言動、建前など一つの論点を軽く指摘する
2. 指摘された側は短く説明し、論点をずらさず返す
3. 指摘した側がさらに理由を重ね、自分は例外だと思っていることが分かる発言をする
4. 別スタッフまたは相手が、その人自身にも同じ矛盾がある事実を一つだけ明かす
5. 指摘した側が言い訳し、その言い訳によって矛盾がさらに大きくなる
6. 最後は短い一言で、最初の批判が本人へ返ったと分かるオチにする

完成尺は約1分（55〜65秒）にし、前振り、言い分の強まり、矛盾の証拠、言い逃れ、ブーメランの順で段階を作る。
オチは直前に急に追加した情報ではなく、冒頭か中盤に見せた発言・物・行動を再利用して成立させる。
元動画の暴言や強い侮辱は模倣しない。
お客様への暴言、侮辱、蔑称、容姿批判、人格否定、威圧、差別表現は禁止。
お客様を笑いものにせず、笑いの対象は会話の矛盾、思い込み、状況の逆転にする。
問題行為があっても接客中は丁寧語を保ち、冷静で明確に案内する。
えるふろんてぃあで自然に起こる注文、推し、SNS、営業時間などの軽い話題へ置き換える。
型A・型B・型Cから依頼に最も合う一つだけを選び、複数の型を無理に混ぜない。`;

const HIYORI_ONE_MINUTE_PROMPT = `【ひより専用・1分尺とオチ】
完成尺は約1分（55〜65秒）を基準にする。
セリフは自然な間を含めて14〜20行程度にし、短すぎる一発ネタで終わらせない。
0〜10秒で状況と論点、10〜45秒で同じ問題を3段階に発展、45〜55秒で矛盾や証拠を発覚、最後の5〜10秒で冒頭の発言を回収する。
オチは直前に急に追加した情報ではなく、冒頭か中盤に見せた発言・物・行動を再利用して成立させる。
単なる説明、仲直り、注文追加だけをオチにせず、立場の逆転やブーメランが一言で分かる結末にする。`;

const HIYORI_STORE_PROMPT = `【ひより専用・店舗コンセプトと実在店内】
店舗は石川県金沢市片町にある異世界コンセプトカフェ＆バー。
お客様は「勇者様」、来店は「入国」と呼び、「勇者様のご入国をお待ちしております」という世界観を守る。

実際の店内：
・木目調の直線的なカウンター
・カウンター前に並ぶ黒いハイチェア
・赤茶色のレンガ調の壁
・天井付近の緑の葉と、白・淡紫色の垂れ下がる花の装飾
・床の一部にある緑の人工芝と白い化粧石
・明るい窓

店内を台本に使う場合は、この実在する場所と設備だけを前提にする。
写真で確認できない個室、ステージ、大型厨房、階段などを勝手に追加しない。
この店舗にチェキは存在しない。チェキ、チェキ券、チェキ撮影を台本へ一切出さない。`;

const HIYORI_CHARACTERS_PROMPT = `【ひより専用・出演キャラクター】
・ユウ❤️：2100歳／誕生日12月／マイペース
・サラ🩵：2100歳／誕生日6月／元気
・ヒスイ💚：2100歳／誕生日未設定／おっとり優等生
・マリィ🤍：2200歳／誕生日未設定／ふわふわ妹系

設定を紹介文として読み上げず、会話の反応、言葉選び、行動、オチへの関わり方に反映する。
ユウは急かされても自分のペース、サラは明るく素早く反応、ヒスイは穏やかに状況を整理して矛盾を指摘、マリィは柔らかい言葉で意外な核心を突く。
毎回全員を出演させる必要はなく、内容に必要な2〜4名を選ぶ。
誕生日未設定のキャラクターに、日付や月を勝手に追加しない。`;

const HIYORI_KATAMACHI_PROMPT = `【ひより専用・片町の土地感】
店舗がある金沢市片町はJR駅から離れた繁華街。
「終電」を定番の退出理由、会話の中心、オチとして使わない。
土地勘に合わない駅・交通事情や周辺施設を勝手に作らず、必要な場合は登録済みの事実だけを使う。`;

const HIYORI_CAUSAL_DIALOGUE_PROMPT = `【ひより専用・会話の因果関係】
人物が指摘、反論、質問をするときは、その直前に原因となる相手の発言、行動、目に見える物を必ず置く。
前触れのない話題や、視聴者への説明だけを目的とした不自然なセリフから始めない。
各セリフは必ず直前のセリフか行動への反応にし、会話を順番にたどれば理由が分かる状態にする。`;

const ELF_ROLE_PROMPTS = {
  elf_sketch: `【ひより専用・寸劇系】
会話のすれ違い、勘違い、接客中の本音、コンカフェで起こりそうな一つのトラブルを題材に、短い物語として成立する寸劇台本を作る。冒頭・段階的な展開・回収されるオチを明確にする。`,
  elf_if: `【かなで専用・もしもシリーズ系】
「もしも、えるふろんてぃあが○○だったら」という仮定から始め、異世界コンカフェの設定を活かした予想外の展開とオチを作る。`,
  elf_lively: `【あまね専用・にぎやか系】
必要な2〜4名の短い掛け合いで、具体的な物や行動から自然に始まる、明るくテンポの良い台本を作る。
休憩中の小事件だけに固定せず、準備、片付け、掃除、撮影相談、順番決め、勘違い、共同作業など、依頼と直前の生成内容に応じて題材と構成を変える。
発覚、言い訳、暴露、立場逆転を毎回同じ順番で使わない。すれ違い、質問企画、解釈の連鎖、間の笑い、全員一致、本人だけ気づかない結末などを使い分ける。
撮影者を登場させる場合は男性。必要な場合は画面外から企画や質問を振り、スタッフの回答から普段の関係性を見せ、最後に男性撮影者へオチが返る構成にする。男性撮影者は毎回出さず、女性スタッフだけで完結する裏側の日常会話も作る。
複数本を作る場合は、冒頭、中心人物、人数、会話の進み方、オチを言う人物、オチの仕組みを各動画で変える。
バタバタ感は同じ状況に関係する会話で作り、無関係な発言や唐突な設定を入れない。
「勇者様」「入国」「異世界」などの世界観ワードは、依頼テーマに直接必要な場合だけ使う。
出力は「話者名：セリフ」だけにする。
一つの場所、一つの出来事、一つの目的に絞り、各セリフを直前の発言への反応にする。
冒頭の情報を最後のオチで回収し、途中から新しい人物や設定を出さない。`,
  elf_jobs: `【りく専用・求人系】
仕事の魅力、キャストの雰囲気、応募者が知りたい情報を自然な会話で伝える。確認できない待遇や条件は作らず、差し替え箇所として示す。`,
};


let modalRecognition = null;
let modalListening = false;
let liveFinal = "";
let livePartial = "";
let modalLocallyReactedStaffIds = new Set();
let modalRecognizedTargetLabel = "";
let modalRecognizedStaffIds = new Set();
let modalRecognizedTeamIds = new Set();

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
    const normalizedNames = normalizeSpeechForStaffRouting(liveFinal + livePartial);
    const recognizedStaff = findExplicitStaffListByReading(normalizedNames);
    const recognizedTeams = findExplicitTeamsByReading(normalizedNames);
    recognizedStaff.forEach(staff => modalRecognizedStaffIds.add(staff.id));
    recognizedTeams.forEach(team => modalRecognizedTeamIds.add(team.id));
    const selectedStaff = activeModalStaffId
      ? STAFF.find(staff => staff.id === activeModalStaffId)
      : null;
    if (selectedStaff) modalRecognizedStaffIds.add(selectedStaff.id);
    const allRecognizedStaff = [...modalRecognizedStaffIds]
      .map(id => STAFF.find(staff => staff.id === id))
      .filter(Boolean);
    const allRecognizedTeams = [...modalRecognizedTeamIds]
      .map(id => TEAMS.find(team => team.id === id))
      .filter(Boolean);
    const recognizedLabels = [...new Set([
      ...allRecognizedTeams.map(team => team.name),
      ...(selectedStaff && !allRecognizedTeams.some(team => team.staff.includes(selectedStaff.id))
        ? [selectedStaff.name]
        : []),
      ...allRecognizedStaff
        .filter(staff => !allRecognizedTeams.some(team => team.staff.includes(staff.id)))
        .map(staff => staff.name),
    ])];
    if (recognizedLabels.length) {
      modalRecognizedTargetLabel = recognizedLabels.join("・");
      setMicHint(`指示先：${modalRecognizedTargetLabel}（認識済み）・話し終わるまで静かに待機します`, false);
    }
  };
  rec.onend = () => {
    modalListening = false;
    modalMicBtn.classList.remove("listening");
    if (!modalOverlay.hidden) {
      setMicHint(
        modalRecognizedTargetLabel
          ? `指示先：${modalRecognizedTargetLabel}（認識済み）・「完了」を押すと指示を送信します`
          : "一時停止中(マイクを押して再開)",
        true
      );
    }
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
    setMicHint(
      modalRecognizedTargetLabel
        ? `指示先：${modalRecognizedTargetLabel}・聞き取り中…`
        : "聞き取り中…",
      false
    );
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
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (staffId === "invoice_clerk") {
    openAccountingDesk("", "clients");
    return;
  }
  activeModalStaffId = staffId;
  const scriptPromptMode = SCRIPT_STAFF_IDS.has(staffId);
  modalOverlay.classList.toggle("script-prompt-mode", scriptPromptMode);
  const promptSummary = promptInputDetails.querySelector("summary");
  const promptLabel = promptInputDetails.querySelector("label");

  if (staffId) {
    const staff = STAFF.find(s => s.id === staffId);
    const team = findTeamOf(staffId);
    modalMascot.innerHTML = mascotFigureHTML(staff, "idle");
    $("#modalStaffName").textContent = scriptPromptMode
      ? `${staff.name}に音声で台本を依頼`
      : `${staff.name}にマイクで依頼`;
    $("#modalStaffRole").textContent = scriptPromptMode
      ? `${staff.role}｜話し終えたら「完了」を押してください`
      : `${team ? team.name : staff.role} ー 話し終えたら「完了」を押してください`;
    promptInputDetails.hidden = false;
    promptInputDetails.open = scriptPromptMode;
  } else {
    modalMascot.innerHTML = `
      <div class="mascot idle" style="--c1:#b18cff;--c2:#8f5fff;">
        <div class="m-shadow"></div>
        <div class="m-hair"></div>
        <div class="m-face"><div class="m-eyes"><span></span><span></span></div><div class="m-blush l"></div><div class="m-blush r"></div></div>
        <div class="m-body"></div>
        <div class="m-badge">🏢</div>
      </div>`;
    $("#modalStaffName").textContent = "オフィスに音声で依頼";
    $("#modalStaffRole").textContent = "内容から自動で担当者に振り分けます ー 話し終えたら「完了」を押してください";
    promptInputDetails.hidden = true;
  }
  promptSummary.textContent = "作業内容を入力";
  promptLabel.textContent = "作ってほしい成果物の詳しい内容";
  promptTextFields.hidden = scriptPromptMode;
  $("#modalPromptSend").hidden = scriptPromptMode;
  if (!scriptPromptMode) $("#modalPromptSend").textContent = "この内容で作業を依頼";
  if (scriptPromptMode) promptInputDetails.hidden = true;

  liveFinal = "";
  livePartial = "";
  modalLocallyReactedStaffIds = new Set();
  modalRecognizedStaffIds = new Set(staffId ? [staffId] : []);
  modalRecognizedTeamIds = new Set();
  modalRecognizedTargetLabel = staffId
    ? (STAFF.find(staff => staff.id === staffId)?.name || "")
    : "";
  updateTranscriptDisplay();
  modalTextInput.value = "";
  modalPromptInput.value = "";
  modalPromptInput.rows = scriptPromptMode ? 10 : 6;
  modalPromptInput.placeholder = scriptPromptMode
    ? "例：ユウとサラが出演する30秒の寸劇。初めて入国した勇者様を案内する内容。冒頭2秒で引き込み、会話はテンポよく、最後に意外なオチを入れる。セリフ、演技、カメラ位置、テロップ、効果音も書く。"
    : "例：20代女性向けのTikTok台本を作成。冒頭3秒で興味を引き、明るく親しみやすい口調にする。動画の長さは30秒。最後に行動を促す一言を入れる。";
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

function findLocallyCalledStaff(staffId, text) {
  if (staffId) return STAFF.find(staff => staff.id === staffId) || null;
  const normalized = normalizeSpeechForStaffRouting(text);
  const explicitlyCalledStaff = findExplicitStaffByReading(normalized);
  if (explicitlyCalledStaff) return explicitlyCalledStaff;
  if (/(良心|りょうしん).*(求人|採用|募集|求人台本)/.test(normalized)) {
    return STAFF.find(staff => staff.id === "ryoshin_jobs");
  }
  if (/(良心|りょうしん).*(動画編集|編集|えでぃっと)/.test(normalized)) {
    return STAFF.find(staff => staff.id === "ryoshin_video_editor");
  }
  if (/(えるふ|elf|えるふろんてぃあ)/.test(normalized)) {
    if (/(寸劇|コント|しょーとどらま)/.test(normalized)) return STAFF.find(staff => staff.id === "elf_sketch");
    if (/(もしも|もしもシリーズ)/.test(normalized)) return STAFF.find(staff => staff.id === "elf_if");
    if (/(にぎやか|賑やか|わちゃわちゃ|大人数)/.test(normalized)) return STAFF.find(staff => staff.id === "elf_lively");
    if (/(求人|採用動画|募集)/.test(normalized)) return STAFF.find(staff => staff.id === "elf_jobs");
  }
  if (/(まな|マナ|まなこーぽれーしょん|マナコーポレーション)/.test(normalized)
    && /(駆け引き|質疑応答|社長とスタッフ|スタッフ.*質問|質問.*社長)/.test(normalized)) return STAFF.find(staff => staff.id === "mana_staff_dialogue");
  if (/(まな|マナ|まなこーぽれーしょん|マナコーポレーション)/.test(normalized)
    && /(語り|経営者|代表|仕事観|信念)/.test(normalized)) return STAFF.find(staff => staff.id === "mana_narration");
  if (/(まな|マナ|まなこーぽれーしょん|マナコーポレーション)/.test(normalized)
    && /(求人|採用|募集|台本)/.test(normalized)) return STAFF.find(staff => staff.id === "mana_jobs");
  if (/(みやびす|ミヤビス)/.test(normalized)
    && /(広告|宣伝|台本)/.test(normalized)) return STAFF.find(staff => staff.id === "miyabis_ads");
  if (/(かばやき屋|かばやきや)/.test(normalized)
    && /(tiktok|台本|動画|運用)/.test(normalized)) return STAFF.find(staff => staff.id === "kabayaki_script");
  if (/(みさき|経理|請求書|請求先|振込先|入金|撮影日|撮影予定|空き時間|空いてる|空いている|カレンダー)/.test(normalized)) {
    return STAFF.find(staff => staff.id === "invoice_clerk");
  }
  return STAFF.find(staff => {
    const aliases = staff.id === "asuka"
      ? ["あすか", "あすこ", "飛鳥", "明日香", "安須賀", "あすかさん", "あすこさん"]
      : [staff.name];
    return aliases.some(alias => normalized.includes(alias));
  }) || null;
}

function reactToLocalNameCall(staff) {
  if (!staff) return;
  if (modalLocallyReactedStaffIds.has(staff.id)) return;
  modalLocallyReactedStaffIds.add(staff.id);
  const wasOnBreak = state[staff.id].status === "break";
  if (wasOnBreak) {
    state[staff.id].status = "idle";
    state[staff.id]._breakSince = null;
    renderAll();
    updateStats();
    addLog("🏃", `${staff.name}が呼ばれてすぐに休憩から戻りました`);
  }
  const idx = STAFF.indexOf(staff);
  const line = staff.id === "asuka"
    ? "はい、あすかです。ご用件をどうぞ。"
    : `はい、${staff.name}です。お伺いします。`;
  showBubble(staff.id, `💬 ${line}`, 4200);
  speak(line, idx);
  addLog("🙋", wasOnBreak
    ? `${staff.name}が席に戻って返事しました`
    : `${staff.name}が呼びかけに返事しました`);
}

const LAST_INTERVIEW_REPORT_KEY = "ai-office-last-interview-report";

function isAsukaReportRequest(text) {
  const normalized = String(text)
    .replace(/[\u30a1-\u30f6]/g, char => String.fromCharCode(char.charCodeAt(0) - 0x60))
    .replace(/[、。！？!?・\s]/g, "")
    .toLowerCase();
  const mentionsReport = /(レポート|報告書|評価|結果)/.test(normalized);
  const asksToShow = /(見せ|みせ|開い|ひらい|表示|確認|前回|前の|最新|過去|お願い|ください|出して|だして)/.test(normalized);
  return mentionsReport && asksToShow;
}

function isHiringSelectionStartRequest(text) {
  const normalized = String(text)
    .replace(/[\u30a1-\u30f6]/g, char => String.fromCharCode(char.charCodeAt(0) - 0x60))
    .replace(/[、。！？!?・\s]/g, "")
    .toLowerCase();
  return /(面接開始|面接を開始|採用面接開始|採用選考開始|採用試験開始)/.test(normalized);
}

function startHiringSelectionFlow() {
  openSpiTest("reina");
  $("#spiCandidateName").value = "";
  $("#spiCandidateJob").value = "";
  $("#spiCandidateAge").value = "";
  const reina = STAFF.find(staff => staff.id === "reina");
  const line = "採用選考を開始します。最初はSPI、次に漢字、算数、最後にあすかの面接です。応募者情報を入力してください。";
  showBubble("reina", `💬 ${line}`, 5200);
  speak(line, STAFF.indexOf(reina));
  addLog("🧭", "音声指示から採用選考を開始しました：SPI → 漢字 → 算数 → 面接");
  window.setTimeout(() => $("#spiCandidateName").focus(), 100);
}

function openLatestInterviewReport() {
  const saved = localStorage.getItem(LAST_INTERVIEW_REPORT_KEY);
  if (!saved) {
    const line = "前回の面接レポートは、まだありません。";
    showBubble("asuka", `💬 ${line}`, 4200);
    speak(line, STAFF.findIndex(staff => staff.id === "asuka"));
    addLog("📄", "あすかが前回レポートを探しましたが、保存済みのレポートはありませんでした");
    return;
  }

  try {
    const report = JSON.parse(saved);
    const asuka = STAFF.find(staff => staff.id === "asuka");
    state.asuka.status = "idle";
    state.asuka._breakSince = null;
    renderAll();
    updateStats();
    stopInterviewRecognition();
    stopRealtimeInterview();
    $("#interviewAsuka").innerHTML = mascotFigureHTML(asuka, "idle");
    interviewWelcome.hidden = true;
    interviewSession.hidden = true;
    interviewReport.hidden = false;
    $("#interviewReportBody").innerHTML = report.html;
    $("#interviewRecordingReview").hidden = true;
    $("#interviewFinish").textContent = "レポートを閉じる";
    interviewOverlay.hidden = false;
    const line = "はい、前回の面接レポートを表示します。";
    showBubble("asuka", `💬 ${line}`, 4200);
    speak(line, STAFF.findIndex(staff => staff.id === "asuka"));
    addLog("📄", `あすかが前回の面接レポートを表示しました${report.createdAt ? `（${new Date(report.createdAt).toLocaleString("ja-JP")}作成）` : ""}`);
  } catch {
    localStorage.removeItem(LAST_INTERVIEW_REPORT_KEY);
    const line = "前回のレポートを読み込めませんでした。";
    showBubble("asuka", `💬 ${line}`, 4200);
    speak(line, STAFF.findIndex(staff => staff.id === "asuka"));
  }
}

async function handleInstructionSubmit(staffId, text, recognizedTargets = {}) {
  if (!text || !text.trim()) return;
  closeInstructionModal();
  const trimmed = text.trim();
  const normalizedForRouting = normalizeSpeechForStaffRouting(trimmed);
  const explicitlyCalledStaffList = [
    ...findExplicitStaffListByReading(normalizedForRouting),
    ...(recognizedTargets.staffIds || [])
      .map(id => STAFF.find(staff => staff.id === id))
      .filter(Boolean),
  ];
  const explicitlyCalledTeams = [
    ...findExplicitTeamsByReading(normalizedForRouting),
    ...(recognizedTargets.teamIds || [])
      .map(id => TEAMS.find(team => team.id === id))
      .filter(Boolean),
  ];
  const selectedStaff = staffId
    ? STAFF.find(staff => staff.id === staffId)
    : null;
  const teamStaff = explicitlyCalledTeams.flatMap(team =>
    team.staff.map(id => STAFF.find(staff => staff.id === id)).filter(Boolean)
  );
  const allExplicitTargets = [...new Map(
    [selectedStaff, ...explicitlyCalledStaffList, ...teamStaff]
      .filter(Boolean)
      .map(staff => [staff.id, staff])
  ).values()];
  if (allExplicitTargets.length > 1 || explicitlyCalledTeams.length) {
    const batchId = `multi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const assignedTargets = assignTeamScriptCounts(allExplicitTargets, trimmed);
    const activeTargets = assignedTargets.map(item => item.staff);
    const scriptTargets = activeTargets.filter(staff => SCRIPT_STAFF_IDS.has(staff.id));
    const groupedTargets = new Map();
    scriptTargets.forEach(staff => {
      const team = findTeamOf(staff.id);
      if (!team) return;
      if (!groupedTargets.has(team.id)) groupedTargets.set(team.id, []);
      groupedTargets.get(team.id).push(staff.id);
    });
    assignedTargets.forEach(({ staff, count }) => {
      reactToLocalNameCall(staff);
      const team = findTeamOf(staff.id);
      const teamTargets = team ? (groupedTargets.get(team.id) || []) : [];
      const assignedInstruction = instructionForAssignedCount(trimmed, staff, count);
      startTask(staff.id, assignedInstruction, SCRIPT_STAFF_IDS.has(staff.id) ? {
        batchId,
        batchTeamId: team?.id || `staff-${staff.id}`,
        batchExpectedStaffIds: teamTargets.length ? teamTargets : [staff.id],
        skipIndividualArchive: true,
      } : {});
    });
    const assignmentSummary = assignedTargets
      .map(({ staff, count }) => `${staff.name}${count ? `${count}本` : ""}`)
      .join("・");
    addLog("👥", `${assignmentSummary}へ同時に指示しました。台本はチーム単位でPDFにまとめます`);
    return;
  }
  const locallyCalledStaff = findLocallyCalledStaff(staffId, trimmed);

  if (locallyCalledStaff?.id === "invoice_clerk" || (!staffId && (/(請求書|請求先|経理|振込先)/.test(trimmed) || isCalendarSchedulingInstruction(trimmed)))) {
    await routeAccountingInstruction(trimmed);
    return;
  }

  if (locallyCalledStaff?.id === "asuka" && isAsukaReportRequest(trimmed)) {
    openLatestInterviewReport();
    return;
  }

  if (isHiringSelectionStartRequest(trimmed)) {
    startHiringSelectionFlow();
    return;
  }

  reactToLocalNameCall(locallyCalledStaff);

  if (locallyCalledStaff?.id === "asuka") {
    callAsukaForInterview(true);
    return;
  }

  const startedLocally = Boolean(locallyCalledStaff);
  if (startedLocally) {
    startTask(locallyCalledStaff.id, trimmed);
  }
  addLog("🧠", "OpenAIが指示内容を確認しています…");

  try {
    const response = await fetch("/api/understand-instruction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instruction: trimmed,
        targetStaffId: staffId || locallyCalledStaff?.id || "",
      }),
    });
    const understood = await response.json();
    if (!response.ok) throw new Error(understood.error || "指示を理解できませんでした。");

    const assignedId = staffId || locallyCalledStaff?.id || understood.staff_id;
    const staff = STAFF.find(item => item.id === assignedId) || findBestStaffForInstruction(trimmed);
    const idx = STAFF.indexOf(staff);
    addLog("🧠", `指示を理解しました：${understood.short_summary || trimmed}`);
    if (staff.id === "invoice_clerk") {
      await routeAccountingInstruction(understood.understood_instruction || trimmed);
      return;
    }
    if (staff.id === "asuka") {
      callAsukaForInterview();
      return;
    }
    if (startedLocally) {
      if (state[staff.id].status === "working") {
        state[staff.id].lastInstruction = understood.understood_instruction || trimmed;
      }
      addLog("🧠", `${staff.name}の作業指示をAPIが補足しました`);
      return;
    }
    if (!staffId && !locallyCalledStaff) speak(`${staff.name}さん、${staff.role}の件でお願いしますね。`, idx);
    startTask(staff.id, understood.understood_instruction || trimmed);
  } catch (error) {
    const staff = staffId || locallyCalledStaff
      ? STAFF.find(item => item.id === (staffId || locallyCalledStaff.id))
      : findBestStaffForInstruction(trimmed);
    addLog("⚠️", `${error.message} ローカル判定で作業を続けます。`);
    if (staff.id === "invoice_clerk") {
      await routeAccountingInstruction(trimmed);
      return;
    }
    if (staff.id === "asuka") {
      callAsukaForInterview();
      return;
    }
    if (startedLocally) return;
    if (!staffId && !locallyCalledStaff) speak(`${staff.name}さん、${staff.role}の件でお願いしますね。`, STAFF.indexOf(staff));
    startTask(staff.id, trimmed);
  }
}

const homeMicBtn = $("#homeMicBtn");
if (homeMicBtn) {
  homeMicBtn.addEventListener("click", () => openInstructionModal(null));
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
  submitCurrentModalInstruction();
});

function submitCurrentModalInstruction() {
  const spokenText = (liveFinal + livePartial).trim();
  const text = spokenText || modalTextInput.value.trim();
  if (!text) {
    setMicHint("⚠️ 話した内容がありません。マイクを押して話しかけてください", true);
    modalTranscript.classList.add("shake");
    setTimeout(() => modalTranscript.classList.remove("shake"), 400);
    return;
  }
  const recognizedTargets = {
    staffIds: [...modalRecognizedStaffIds],
    teamIds: [...modalRecognizedTeamIds],
  };
  stopModalRecognition(true);
  handleInstructionSubmit(activeModalStaffId, text, recognizedTargets);
}

document.addEventListener("keydown", event => {
  if (event.key !== "Enter" || modalOverlay.hidden || event.isComposing) return;
  if (event.target.tagName === "TEXTAREA") return;
  event.preventDefault();
  event.stopPropagation();
  submitCurrentModalInstruction();
}, true);

modalCancelBtn.addEventListener("click", closeInstructionModal);
$("#modalClose").addEventListener("click", closeInstructionModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeInstructionModal(); });

$("#modalTextSend").addEventListener("click", () => {
  stopModalRecognition(true);
  handleInstructionSubmit(activeModalStaffId, modalTextInput.value);
});
$("#modalPromptSend").addEventListener("click", () => {
  const prompt = modalPromptInput.value.trim();
  if (!prompt) {
    modalPromptInput.focus();
    modalPromptInput.classList.add("shake");
    setTimeout(() => modalPromptInput.classList.remove("shake"), 400);
    return;
  }
  stopModalRecognition(true);
  handleInstructionSubmit(activeModalStaffId, prompt);
});

/* ---------------- result modal ---------------- */
const resultOverlay = $("#resultOverlay");

function teamBundleForStaffResult(staffId) {
  const displayTaskId = state[staffId]?._displayTaskId || "";
  if (displayTaskId) {
    const exact = deliverableVaultItems.find(item =>
      Array.isArray(item.taskIds) && item.taskIds.includes(displayTaskId)
    );
    if (exact) return exact;
  }
  const reviewTaskIds = new Set(tasksForStaff(staffId, "review").map(task => task.id));
  return deliverableVaultItems.find(item =>
    Array.isArray(item.taskIds)
    && item.taskIds.some(taskId => reviewTaskIds.has(taskId))
  ) || null;
}

function openResultModal(staffId) {
  const staff = STAFF.find(s => s.id === staffId);
  const s = state[staffId];
  activeResultStaffId = staffId;
  $("#resultAvatar").style.background = `linear-gradient(135deg, ${staff.grad[0]}, ${staff.grad[1]})`;
  $("#resultAvatar").textContent = staff.emoji;
  $("#resultStaffName").textContent = `${staff.name}（${staff.role}）`;
  const box = $("#deliverableBox");
  box.innerHTML = "";
  if (s.deliverableImage) {
    const image = document.createElement("img");
    image.src = s.deliverableImage;
    image.alt = `${staff.name}が生成した${staff.role}`;
    image.className = "generated-deliverable-image";
    box.appendChild(image);
  }
  const text = document.createElement("div");
  text.className = "generated-deliverable-text";
  text.textContent = s.deliverable;
  box.appendChild(text);
  if (s.generationModel) {
    const model = document.createElement("small");
    model.className = "generated-model-label";
    model.textContent = `生成API: ${s.generationModel}`;
    box.appendChild(model);
  }
  const bundledScriptCount = SCRIPT_STAFF_IDS.has(staffId)
    ? splitDeliverableParts(s.deliverable).length
    : 0;
  const teamBundle = teamBundleForStaffResult(staffId);
  $("#downloadDeliverableBtn").textContent = teamBundle
    ? `⬇ ${teamBundle.staffName}の統合PDFをダウンロード`
    : bundledScriptCount > 1
      ? `⬇ ${bundledScriptCount}本を1つのPDFでダウンロード`
      : "⬇ データをダウンロード";
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
    /* clipboard may be unavailable */
  }
});

function deliverableFileBase(staff) {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  const team = staff.id ? findTeamOf(staff.id) : null;
  const groupName = team?.name || "バーチャル支店";
  return `${groupName}_${staff.role}_完成データ_${stamp}`.replace(/[\\/:*?"<>|]/g, "_");
}

function triggerDeliverableDownload(url, fileName) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

$("#downloadDeliverableBtn").addEventListener("click", async () => {
  if (!activeResultStaffId) return;
  const staff = STAFF.find(s => s.id === activeResultStaffId);
  const s = state[activeResultStaffId];
  const teamBundle = teamBundleForStaffResult(activeResultStaffId);
  const fileBase = deliverableFileBase(staff);
  const validImage = typeof s.deliverableImage === "string"
    && /^data:image\/(?:png|jpeg|webp);base64,/.test(s.deliverableImage);

  if (teamBundle) {
    await downloadArchivedDeliverable(teamBundle);
  } else if (validImage) {
    const extension = s.deliverableImage.startsWith("data:image/jpeg") ? "jpg"
      : s.deliverableImage.startsWith("data:image/webp") ? "webp" : "png";
    triggerDeliverableDownload(s.deliverableImage, `${fileBase}.${extension}`);
  } else {
    await downloadDeliverablePdf(staff, s.deliverable || "", new Date().toISOString(), s.generationModel);
  }

  const button = $("#downloadDeliverableBtn");
  button.textContent = "✅ ダウンロードしました";
  const bundledScriptCount = SCRIPT_STAFF_IDS.has(activeResultStaffId)
    ? splitDeliverableParts(s.deliverable).length
    : 0;
  setTimeout(() => {
    button.textContent = teamBundle
      ? `⬇ ${teamBundle.staffName}の統合PDFをダウンロード`
      : bundledScriptCount > 1
        ? `⬇ ${bundledScriptCount}本を1つのPDFでダウンロード`
        : "⬇ データをダウンロード";
  }, 1800);
});

$("#openDeliverableBtn").addEventListener("click", () => {
  if (!activeResultStaffId) return;
  const staff = STAFF.find(s => s.id === activeResultStaffId);
  const s = state[activeResultStaffId];
  const validImage = typeof s.deliverableImage === "string"
    && /^data:image\/(?:png|jpeg|webp);base64,/.test(s.deliverableImage);
  const imageHtml = validImage
    ? `<img src="${s.deliverableImage}" alt="${escapeHtml(staff.name)}の完成画像">`
    : "";
  const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(staff.role)}・完成データ</title>
<style>
body{margin:0;background:#f7f3fa;color:#342c3b;font-family:"Hiragino Sans","Yu Gothic",sans-serif}
main{width:min(920px,calc(100% - 32px));margin:32px auto;background:#fff;border:1px solid #eadff1;border-radius:22px;padding:clamp(22px,5vw,48px);box-sizing:border-box;box-shadow:0 16px 45px #5d3b7b18}
h1{margin:0 0 5px;font-size:clamp(22px,4vw,34px)}.role{color:#806e8b;margin:0 0 28px}
img{display:block;max-width:100%;max-height:70vh;margin:0 auto 28px;border-radius:16px;box-shadow:0 8px 24px #0002}
.content{white-space:pre-wrap;line-height:1.9;font-size:15px}.model{margin-top:30px;color:#9a8ba3;font-size:12px}
</style></head><body><main><h1>${escapeHtml(staff.role)}・完成データ</h1>
<p class="role">${escapeHtml(staff.role)}</p>${imageHtml}
<div class="content">${escapeHtml(s.deliverable || "")}</div>
${s.generationModel ? `<div class="model">生成API: ${escapeHtml(s.generationModel)}</div>` : ""}
</main></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank");
  if (!opened) alert("新しい画面を開けませんでした。ブラウザのポップアップを許可してください。");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
});

$("#approveBtn").addEventListener("click", () => {
  if (activeResultStaffId) approveTask(activeResultStaffId);
  closeResultModal();
});

/* ---------------- per-staff settings modal (prompt / strengths / weaknesses) ---------------- */
const staffSettingsOverlay = $("#staffSettingsOverlay");
const staffSettingsMascot = $("#staffSettingsMascot");
const staffPromptInput = $("#staffPromptInput");
const staffStrengthsInput = $("#staffStrengthsInput");
const staffWeaknessesInput = $("#staffWeaknessesInput");

function openStaffSettingsModal(staffId) {
  const staff = STAFF.find(s => s.id === staffId);
  activeSettingsStaffId = staffId;
  const saved = staffSettings[staffId] || {};
  const scriptStaff = SCRIPT_STAFF_IDS.has(staffId);
  const elfScriptStaff = staffId.startsWith("elf_");
  const defaultScriptPrompt = staffId === "elf_lively"
    ? `${ELF_INTERNAL_PROMPT}\n\n${ELF_ROLE_PROMPTS[staffId]}\n\n${ELF_LIVELY_REFERENCE_PROMPT}`
    : staffId === "elf_sketch"
      ? `${ELF_INTERNAL_PROMPT}\n\n${ELF_ROLE_PROMPTS[staffId]}\n\n${HIYORI_REFERENCE_PROMPT}\n\n${HIYORI_TRANSCRIPT_ANALYSIS_PROMPT}\n\n${HIYORI_BOOMERANG_PROMPT}\n\n${HIYORI_ONE_MINUTE_PROMPT}\n\n${HIYORI_STORE_PROMPT}\n\n${HIYORI_CHARACTERS_PROMPT}\n\n${HIYORI_KATAMACHI_PROMPT}\n\n${HIYORI_CAUSAL_DIALOGUE_PROMPT}`
    : elfScriptStaff
      ? `${ELF_INTERNAL_PROMPT}\n\n${ELF_ROLE_PROMPTS[staffId] || ""}`
      : staffId === "ryoshin_jobs"
        ? "【合同会社良心・求人TikTok台本プロンプト】\n合同会社良心の求人TikTok台本を作成します。ユーザーが登録または指示した会社情報、仕事内容、募集条件、応募方法だけを使ってください。未確認の給与、休日、待遇、勤務地、応募資格、実績は勝手に作らず、必要な箇所は［情報を入力］と示してください。複数本を依頼された場合は、対象者、悩み、冒頭、構成、CTAを変え、【1本目】【2本目】のように区切ってください。"
      : staffId === "ryoshin_video_editor"
        ? "【合同会社良心・TikTok動画編集プロンプト】\nユーザーが伝えた素材、目的、尺、投稿先をもとに、実編集でそのまま使える編集指示を作成します。素材にない映像や事実を存在するものとして扱いません。カット順、不要部分、テロップ、BGM・効果音、色調、縦動画の書き出し設定を分かりやすく整理してください。複数案は【1本目】【2本目】のように区切ってください。"
      : staffId === "mana_jobs"
        ? "【マナコーポレーション基本プロンプト】\nここに会社情報、募集職種、仕事内容、待遇、応募条件、ターゲット、動画のトーン、禁止事項を入力してください。\n\n入力された事実だけを使い、確認できない条件や実績は作らないでください。\n\n「台本作って」のような短い依頼では、資格保有者、美容学生、免許取得前の人などから今回の対象者を一人だけ選び、その人へ直接呼びかける完成台本を作ってください。異なる対象者を1本に混ぜないでください。「今回の動画は」「こんな方に向けた動画です」「ぜひ最後までご覧ください」などの動画説明は使わないでください。\n\n完成前に、助詞、活用、語順、主語と述語、前後のつながりを一文ずつ確認してください。不安を語る場合は「出来高制サロンの場合」など何についての話かを先に明示し、生活場面、心配の理由、行動への影響が自然につながる日本語にしてください。意味が曖昧な文や、声に出して引っかかる文を残さないでください。"
      : staffId === "mana_narration"
        ? "【マナコーポレーション・語り台本制作プロンプト】\n登録済みの19本の参考動画全文と、その内容から分析した代表者の信念、仕事観、人との向き合い方を必ず使用してください。ユーザーの指示が短い場合は、内容、ターゲット、悩み、訴求、構成、尺を自分で決め、質問せずに完成台本を作ってください。テーマに応じて語りの構成を変え、一人で読み上げる文章だけを出力してください。「※」などの注釈、制作メモ、話者名、絵コンテ、テロップ、演技指示は入れないでください。"
      : staffId === "mana_staff_dialogue"
        ? "【マナコーポレーション・スタッフ駆け引き台本プロンプト】\n基本は「カメラマン」と瀬川社長による質問、即答、反論、具体化、再質問の自然な駆け引き台本を作ってください。内容によっては「カメラマン」「瀬川社長」「美容師スタッフ」の3人にしてください。3人版は求人インタビューだけでなく、カメラマンの一つの質問に美容師スタッフが現場の実感、瀬川社長が経営者としての理由や経験を答えるシンプルな会話にもできます。会社としての「人を大切にする」「お客様に愛される人づくり」「信頼と愛情の循環」と、瀬川社長の想い、仕事観、失敗経験をテーマに合わせて自然に反映してください。求人や働き方のインタビューでは、美容師スタッフが入社前の具体的な不安、マナの何が良かったか、生活や気持ちがどう変わったかを順につなげてください。出来高制ではないこと、収入の安定、直接雇用、社会保険、育成環境など登録済みの強みだけを使用し、未確認の個人情報は作らないでください。文法だけでなく、質問への答え方、動詞の対応、言葉の組み合わせを確認し、美容師が声に出して違和感のない日本語にしてください。指示が短い場合はテーマ、対象者、会話形式を自分で決めてください。出力は話者名と実際に話すセリフだけにしてください。"
        : staffId === "miyabis_ads"
          ? "【ミヤビス基本プロンプト】\nここに会社・ブランド情報、商品やサービス、特徴、ターゲット、広告目的、動画のトーン、CTA、禁止表現を入力してください。\n\n入力された事実だけを使い、確認できない効果や実績は作らないでください。"
          : "【かばやき屋基本プロンプト】\nここに店舗・会社情報、TikTok運用目的、想定視聴者、扱う商品・サービス、出演者、動画のトーン、CTA、禁止事項を入力してください。\n\n入力された事実と目的を優先し、撮影できる完成台本を作成してください。";

  staffSettingsMascot.innerHTML = mascotFigureHTML(staff, "idle");
  $("#staffSettingsName").textContent = `${staff.name}の設定`;
  $("#staffSettingsRole").textContent = staff.role;
  if (staffId === "asuka") {
    $("#staffPromptLabel").textContent = "📋 採用基準・面接方針";
    staffPromptInput.placeholder = "例：必須条件は法人営業3年以上。評価項目は実績30点、問題解決力25点、コミュニケーション25点、志望動機20点。回答は具体例を深掘りする。経歴だけで決めず、最終判断は人間が行う。";
  } else if (scriptStaff) {
    $("#staffPromptLabel").textContent = elfScriptStaff
      ? "🎬 えるふろんてぃあ基本プロンプト＋追加ルール"
      : staffId === "mana_jobs"
        ? "🎬 マナコーポレーション基本プロンプト"
        : staffId === "mana_narration"
          ? "🎙️ マナコーポレーション語り台本プロンプト"
        : staffId === "mana_staff_dialogue"
          ? "🗣️ マナコーポレーション駆け引き台本プロンプト"
        : staffId === "miyabis_ads"
          ? "🎬 ミヤビス基本プロンプト"
          : "🎬 かばやき屋基本プロンプト";
    staffPromptInput.placeholder = "基本設定と、毎回の台本に適用する共通ルールを入力してください。";
  } else {
    $("#staffPromptLabel").textContent = "🗒️ カスタムプロンプト（この社員への指示・性格設定）";
    staffPromptInput.placeholder = "例：明るくテンポの良い口調で、10代〜20代向けにわかりやすく作成してください。";
  }
  $("#asukaPromptHelp").hidden = staffId !== "asuka";
  $("#asukaVideoPromptSettings").hidden = staffId !== "asuka";
  $("#staffTraitsSettings").hidden = scriptStaff;
  $("#interviewVideoEvaluationPrompt").value = staffId === "asuka"
    ? (saved.videoEvaluationPrompt || localStorage.getItem(VIDEO_EVALUATION_PROMPT_KEY) || "")
    : "";
  staffPromptInput.rows = scriptStaff ? 16 : 4;
  staffPromptInput.value = saved.prompt || (scriptStaff ? defaultScriptPrompt : "");
  staffStrengthsInput.value = saved.strengths || "";
  staffWeaknessesInput.value = saved.weaknesses || "";

  staffSettingsOverlay.hidden = false;
}

function closeStaffSettingsModal() {
  staffSettingsOverlay.hidden = true;
  activeSettingsStaffId = null;
}

$("#staffSettingsClose").addEventListener("click", closeStaffSettingsModal);
$("#staffSettingsCancel").addEventListener("click", closeStaffSettingsModal);
staffSettingsOverlay.addEventListener("click", (e) => { if (e.target === staffSettingsOverlay) closeStaffSettingsModal(); });

$("#staffSettingsSave").addEventListener("click", async () => {
  if (!activeSettingsStaffId) return;
  const saveButton = $("#staffSettingsSave");
  saveButton.disabled = true;
  saveButton.textContent = "保存中…";
  staffSettings[activeSettingsStaffId] = {
    prompt: staffPromptInput.value.trim(),
    strengths: staffStrengthsInput.value.trim(),
    weaknesses: staffWeaknessesInput.value.trim(),
    ...(activeSettingsStaffId === "asuka"
      ? { videoEvaluationPrompt: $("#interviewVideoEvaluationPrompt").value.trim() }
      : {}),
  };
  if (activeSettingsStaffId === "asuka") {
    localStorage.setItem(VIDEO_EVALUATION_PROMPT_KEY, staffSettings.asuka.videoEvaluationPrompt);
  }
  saveStaffSettings(staffSettings);
  const staff = STAFF.find(s => s.id === activeSettingsStaffId);
  try {
    staffSettings = await persistSharedStaffSettings(staffSettings);
    saveStaffSettings(staffSettings);
    addLog("🗒️", `${staff.name}の設定を全ブラウザ共通で保存しました`);
    closeStaffSettingsModal();
  } catch (error) {
    addLog("⚠️", `${staff.name}の設定はこのブラウザだけに保存されました：${error.message}`);
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "💾 保存";
  }
});

/* ---------------- Asuka interactive interview ---------------- */
const interviewOverlay = $("#interviewOverlay");
const interviewWelcome = $("#interviewWelcome");
const interviewSession = $("#interviewSession");
const interviewReport = $("#interviewReport");
const interviewAnswer = $("#interviewAnswer");
let interviewRecognition = null;
let interviewIndex = 0;
let interviewAnswers = [];
let interviewQuestions = [];
let interviewMode = "static";
let interviewPeer = null;
let interviewChannel = null;
let interviewMediaStream = null;
let interviewTranscript = [];
let realtimeInterviewEnded = false;
let activeInterviewCriteria = "";
let interviewRecognitionRetryCount = 0;
let interviewSilenceTimer = null;
let interviewReportGenerating = false;
let interviewRecorder = null;
let interviewRecordingChunks = [];
let interviewRecordingUrl = "";
let interviewVideoFrames = [];
let interviewFrameTimer = null;
let activeInterviewCandidate = { name: "", age: "", job: "" };
let lastInterviewBackchannelAt = 0;
let currentAnswerSpeechStartedAt = 0;

function acknowledgeInterviewAnswer(answerLength = 0) {
  const now = Date.now();
  if (!currentAnswerSpeechStartedAt) {
    currentAnswerSpeechStartedAt = now;
    return;
  }
  // 回答の冒頭では相づちを入れず、長く話している時の途中だけ反応する。
  if (answerLength < 24 || now - currentAnswerSpeechStartedAt < 5000) return;
  if (now - lastInterviewBackchannelAt < 6500) return;
  lastInterviewBackchannelAt = now;
  const stage = $("#interviewVideoStage");
  stage.classList.add("asuka-nodding");
  window.setTimeout(() => stage.classList.remove("asuka-nodding"), 800);
  const acknowledgements = ["はい", "なるほど", "うん"];
  const line = acknowledgements[Math.floor(Math.random() * acknowledgements.length)];
  $("#interviewAnswerStatus").textContent = `あすか：${line}（続けてお話しください）`;
  if (!window.speechSynthesis || window.speechSynthesis.speaking) return;
  const utterance = new SpeechSynthesisUtterance(line);
  applyStaffVoice(utterance, "asuka", { rate: 1.02, volume: 0.38 });
  window.speechSynthesis.speak(utterance);
}

function stopInterviewFrameCapture() {
  if (interviewFrameTimer) window.clearInterval(interviewFrameTimer);
  interviewFrameTimer = null;
}

function captureInterviewFrame() {
  const video = $("#interviewCandidateVideo");
  if (!video || video.readyState < 2 || !video.videoWidth || interviewVideoFrames.length >= 8) return;
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 640 / video.videoWidth);
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  interviewVideoFrames.push(canvas.toDataURL("image/jpeg", 0.58));
}

const VIDEO_EVALUATION_PROMPT_KEY = "ai-office-video-evaluation-prompt";
function getVideoEvaluationPrompt() {
  return String(
    staffSettings.asuka?.videoEvaluationPrompt
    || localStorage.getItem(VIDEO_EVALUATION_PROMPT_KEY)
    || ""
  ).trim();
}

function startInterviewFrameCapture() {
  stopInterviewFrameCapture();
  const hasVideoPrompt = getVideoEvaluationPrompt();
  if (!$("#interviewRecordConsent").checked || !hasVideoPrompt) return;
  window.setTimeout(captureInterviewFrame, 1200);
  interviewFrameTimer = window.setInterval(captureInterviewFrame, 10000);
}

function clearInterviewRecording() {
  stopInterviewFrameCapture();
  interviewVideoFrames = [];
  if (interviewRecordingUrl) URL.revokeObjectURL(interviewRecordingUrl);
  interviewRecordingUrl = "";
  interviewRecordingChunks = [];
  interviewRecorder = null;
  const review = $("#interviewRecordingReview");
  const recordedVideo = $("#interviewRecordedVideo");
  if (review) review.hidden = true;
  if (recordedVideo) {
    recordedVideo.pause();
    recordedVideo.removeAttribute("src");
    recordedVideo.load();
  }
}

function showInterviewRecordingReview() {
  if (!interviewRecordingUrl) return;
  $("#interviewRecordedVideo").src = interviewRecordingUrl;
  $("#interviewRecordingReview").hidden = false;
}

function startInterviewRecording(stream) {
  if (!$("#interviewRecordConsent").checked || !stream.getVideoTracks().length || !window.MediaRecorder) return;
  interviewRecordingChunks = [];
  const preferredType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
    ? "video/webm;codecs=vp9,opus"
    : "video/webm";
  const recorder = new MediaRecorder(stream, { mimeType: preferredType });
  recorder.ondataavailable = event => {
    if (event.data?.size) interviewRecordingChunks.push(event.data);
  };
  recorder.onstop = () => {
    if (!interviewRecordingChunks.length) return;
    const blob = new Blob(interviewRecordingChunks, { type: recorder.mimeType || "video/webm" });
    interviewRecordingUrl = URL.createObjectURL(blob);
    showInterviewRecordingReview();
  };
  recorder.start(1000);
  interviewRecorder = recorder;
}

async function startBrowserInterviewRecordingIfRequested() {
  if (!$("#interviewRecordConsent").checked || !navigator.mediaDevices?.getUserMedia) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    interviewMediaStream = stream;
    const candidateVideo = $("#interviewCandidateVideo");
    candidateVideo.srcObject = stream;
    candidateVideo.hidden = false;
    startInterviewRecording(stream);
    startInterviewFrameCapture();
  } catch {
    $("#interviewAnswerStatus").textContent = "カメラ録画は開始できませんでした。音声面接はそのまま続けます。";
  }
}

function stopInterviewRecording() {
  captureInterviewFrame();
  stopInterviewFrameCapture();
  if (interviewRecorder?.state === "recording") {
    try { interviewRecorder.stop(); } catch { /* already stopped */ }
  }
}

function makeInterviewQuestions(job) {
  return [
    `${job}に応募された理由と、今回の仕事に興味を持ったきっかけを教えてください。`,
    `これまでの経験の中で、${job}に活かせる具体的な実績を教えてください。`,
    "仕事で難しい問題に直面した時、どのように考えて解決しましたか？",
    "チームで意見が合わなかった経験と、その時に取った行動を教えてください。",
    "最後に、この仕事で実現したいことと、ご自身の強みを教えてください。",
  ];
}

function openInterviewModal() {
  const asuka = STAFF.find(staff => staff.id === "asuka");
  const criteria = (staffSettings.asuka || {}).prompt || "";
  $("#interviewAsuka").innerHTML = mascotFigureHTML(asuka, "idle");
  $("#interviewCriteriaText").textContent = criteria || "採用基準が未設定です。あすかの歯車から設定できます。";
  $("#interviewCriteria").classList.toggle("empty", !criteria);
  interviewWelcome.hidden = false;
  interviewSession.hidden = true;
  interviewReport.hidden = true;
  $("#interviewMic").hidden = false;
  $("#interviewVideoStage").classList.remove("asuka-speaking", "asuka-nodding");
  $("#interviewQuestion").textContent = "面接開始後、あすかが最初の質問をします";
  $("#interviewAnswerStatus").textContent = "質問の読み上げ後に自動で聞き取りを開始します";
  $("#interviewMic span").textContent = "マイクで回答";
  $("#interviewRecordConsent").checked = false;
  $("#interviewCandidateVideo").hidden = true;
  $("#interviewCandidateVideo").srcObject = null;
  clearInterviewRecording();
  $("#interviewCandidateName").value = "";
  $("#interviewJob").value = "";
  $("#interviewCandidateAge").value = "";
  $("#interviewFinish").textContent = "面接を終了";
  interviewOverlay.hidden = false;
}

function callAsukaForInterview(alreadyReplied = false) {
  const wasOnBreak = state.asuka.status === "break";
  state.asuka.status = "idle";
  state.asuka._breakSince = null;
  renderAll();
  updateStats();
  const line = wasOnBreak
    ? "休憩から戻りました。面接を開始します。"
    : "面接を開始します。";
  addLog("🤝", wasOnBreak
    ? "あすかが休憩から戻り、面接を開始します"
    : "あすかが面接を開始します");
  if (alreadyReplied) showBubble("asuka", "💬 はい、あすかです。面接を開始します。", 4200);
  if (!alreadyReplied) speak(line, STAFF.findIndex(staff => staff.id === "asuka"));
  window.setTimeout(openInterviewModal, 60);
}

function stopInterviewRecognition() {
  if (interviewSilenceTimer) window.clearTimeout(interviewSilenceTimer);
  interviewSilenceTimer = null;
  if (interviewRecognition) {
    interviewRecognition.onend = null;
    try { interviewRecognition.stop(); } catch { /* already stopped */ }
  }
  interviewRecognition = null;
  $("#interviewMic").classList.remove("listening");
}

function stopRealtimeInterview() {
  stopInterviewRecording();
  const candidateVideo = $("#interviewCandidateVideo");
  if (candidateVideo) {
    candidateVideo.srcObject = null;
    candidateVideo.hidden = true;
  }
  if (interviewChannel) {
    try { interviewChannel.close(); } catch { /* already closed */ }
  }
  if (interviewPeer) {
    try { interviewPeer.close(); } catch { /* already closed */ }
  }
  if (interviewMediaStream) {
    interviewMediaStream.getTracks().forEach(track => track.stop());
  }
  interviewChannel = null;
  interviewPeer = null;
  interviewMediaStream = null;
  $("#interviewMic").classList.remove("listening");
}

function closeInterviewModal() {
  stopInterviewRecognition();
  stopRealtimeInterview();
  window.speechSynthesis?.cancel();
  interviewOverlay.hidden = true;
}

function showInterviewQuestion() {
  const question = interviewQuestions[interviewIndex];
  $("#interviewQuestion").textContent = question;
  $("#interviewAnswerStatus").textContent = "マイクを押して回答してください";
  interviewAnswer.value = "";
  speak(question, STAFF.findIndex(staff => staff.id === "asuka"));
}

function appendRealtimeTranscript(speaker, text) {
  const cleanText = String(text || "").trim();
  if (!cleanText) return;
  const last = interviewTranscript[interviewTranscript.length - 1];
  if (last && last.speaker === speaker && last.text === cleanText) return;
  interviewTranscript.push({ speaker, text: cleanText });
  if (speaker === "asuka") $("#interviewQuestion").textContent = cleanText;
}

function handleRealtimeEvent(event) {
  let message;
  try { message = JSON.parse(event.data); } catch { return; }

  if (message.type === "error") {
    $("#interviewAnswerStatus").textContent = "音声接続でエラーが発生しました。面接を終了して再度お試しください。";
    return;
  }

  if (message.type === "response.audio.delta" || message.type === "response.output_audio.delta") {
    $("#interviewVideoStage").classList.add("asuka-speaking");
  }
  if (message.type === "response.audio.done" || message.type === "response.output_audio.done" || message.type === "response.done") {
    $("#interviewVideoStage").classList.remove("asuka-speaking");
    $("#interviewVideoStage").classList.add("asuka-nodding");
    window.setTimeout(() => $("#interviewVideoStage").classList.remove("asuka-nodding"), 700);
  }

  const transcript = message.transcript
    || message.item?.content?.find?.(content => content.transcript)?.transcript;
  if (!transcript) return;

  const type = String(message.type || "");
  if (type.includes("input_audio_transcription") && (type.endsWith(".completed") || type.endsWith(".done"))) {
    appendRealtimeTranscript("candidate", transcript);
  } else if ((type.includes("audio_transcript") || type.includes("output_audio")) && type.endsWith(".done")) {
    appendRealtimeTranscript("asuka", transcript);
  }
}

async function startRealtimeInterview(job) {
  const criteria = activeInterviewCriteria;
  const peer = new RTCPeerConnection();
  const audio = document.createElement("audio");
  audio.autoplay = true;
  audio.setAttribute("aria-hidden", "true");
  peer.ontrack = event => { audio.srcObject = event.streams[0]; };

  const wantsRecording = $("#interviewRecordConsent").checked;
  $("#interviewAnswerStatus").textContent = wantsRecording
    ? "マイクとカメラの許可を待っています"
    : "マイクの許可を待っています";
  const mediaStream = await Promise.race([
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: wantsRecording ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
    }),
    new Promise((_, reject) => window.setTimeout(
      () => reject(new Error("マイクの許可を確認できませんでした。ブラウザ上部のマイク許可を確認してください。")),
      15000
    )),
  ]);
  mediaStream.getAudioTracks().forEach(track => peer.addTrack(track, mediaStream));
  if (wantsRecording && mediaStream.getVideoTracks().length) {
    const candidateVideo = $("#interviewCandidateVideo");
    candidateVideo.srcObject = mediaStream;
    candidateVideo.hidden = false;
    startInterviewRecording(mediaStream);
    startInterviewFrameCapture();
  }

  const channel = peer.createDataChannel("oai-events");
  const channelOpened = new Promise(resolve => {
    channel.addEventListener("open", resolve, { once: true });
  });
  channel.addEventListener("message", handleRealtimeEvent);
  channel.addEventListener("open", () => {
    $("#interviewAnswerStatus").textContent = "接続済みです。あすかの質問にそのまま話してください";
    $("#interviewMic").classList.add("listening");
    channel.send(JSON.stringify({
      type: "response.create",
      response: {
        instructions: "応募者に日本語で短く挨拶し、応募職種を確認してから最初の質問を1つしてください。",
      },
    }));
  });
  channel.addEventListener("close", () => {
    $("#interviewMic").classList.remove("listening");
  });

  interviewPeer = peer;
  interviewChannel = channel;
  interviewMediaStream = mediaStream;

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  $("#interviewAnswerStatus").textContent = "あすかの音声面接に接続しています";
  const controller = new AbortController();
  const connectionTimeout = window.setTimeout(() => controller.abort(), 15000);
  let response;
  try {
    response = await fetch(
      `/api/interview/realtime?job=${encodeURIComponent(job)}&criteria=${encodeURIComponent(criteria)}`,
      {
        method: "POST",
        body: offer.sdp,
        headers: { "Content-Type": "application/sdp" },
        signal: controller.signal,
      }
    );
  } catch (error) {
    if (error.name === "AbortError") throw new Error("音声APIへの接続がタイムアウトしました。");
    throw error;
  } finally {
    window.clearTimeout(connectionTimeout);
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "音声面接に接続できませんでした。");
  }
  await peer.setRemoteDescription({ type: "answer", sdp: await response.text() });
  await Promise.race([
    channelOpened,
    new Promise((_, reject) => window.setTimeout(
      () => reject(new Error("あすかとの音声接続が時間内に完了しませんでした。")),
      15000
    )),
  ]);
}

function startStaticInterview(job, message = "") {
  interviewMode = "static";
  interviewIndex = 0;
  interviewAnswers = [];
  interviewQuestions = makeInterviewQuestions(job);
  $("#interviewMic span").textContent = "音声で回答";
  $("#interviewMic").hidden = false;
  $("#interviewNext").textContent = "回答を確定して次へ";
  interviewAnswer.hidden = false;
  interviewAnswer.readOnly = false;
  showInterviewQuestion();
  if (message) $("#interviewAnswerStatus").textContent = message;
}

function startBrowserInterviewRecognition() {
  if (interviewMode !== "browser" || realtimeInterviewEnded || interviewRecognition) return;
  if (!SpeechRecognitionCtor) {
    $("#interviewAnswerStatus").textContent = "Chromeで開くと音声面接を利用できます。";
    return;
  }
  const recognition = new SpeechRecognitionCtor();
  recognition.lang = "ja-JP";
  recognition.continuous = true;
  recognition.interimResults = true;
  let confirmed = "";
  let retryAutomatically = false;
  let submitted = false;
  currentAnswerSpeechStartedAt = 0;
  lastInterviewBackchannelAt = Date.now();
  let prefetchedTurn = null;
  let prefetchedAnswerText = "";

  const prefetchNextTurn = answerText => {
    if (prefetchedTurn || answerText.length < 12) return;
    prefetchedAnswerText = answerText;
    const previewTranscript = `${getRealtimeTranscriptText()}\n応募者：${answerText}`;
    prefetchedTurn = fetchInterviewTurn(previewTranscript).catch(() => null);
    $("#interviewAnswerStatus").textContent = "聞き取りながら次の質問を準備しています…";
  };

  const submitAfterSilence = () => {
    if (submitted || !confirmed.trim() || realtimeInterviewEnded) return;
    submitted = true;
    if (interviewSilenceTimer) window.clearTimeout(interviewSilenceTimer);
    interviewSilenceTimer = null;
    recognition.onend = null;
    try { recognition.stop(); } catch { /* already stopped */ }
    interviewRecognition = null;
    $("#interviewMic").classList.remove("listening");
    $("#interviewAnswerStatus").textContent = "あすかが頷きながら回答を確認しています…";
    $("#interviewVideoStage").classList.add("asuka-nodding");
    submitBrowserInterviewAnswer(confirmed.trim(), prefetchedTurn, prefetchedAnswerText);
  };
  recognition.onresult = event => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) confirmed += event.results[i][0].transcript;
      else interim += event.results[i][0].transcript;
    }
    $("#interviewAnswerStatus").textContent = confirmed || interim
      ? "回答を聞き取っています…（話し終わるまで待ちます）"
      : "お話しください";
    if (confirmed || interim) interviewRecognitionRetryCount = 0;
    if (confirmed || interim) acknowledgeInterviewAnswer((confirmed + interim).length);
    if (confirmed.trim()) prefetchNextTurn(confirmed.trim());
    if (interviewSilenceTimer) window.clearTimeout(interviewSilenceTimer);
    if (confirmed.trim() && !interim) {
      interviewSilenceTimer = window.setTimeout(submitAfterSilence, 550);
    }
  };
  recognition.onerror = event => {
    interviewRecognition = null;
    $("#interviewMic").classList.remove("listening");
    if (event.error === "not-allowed") {
      $("#interviewAnswerStatus").textContent = "Chromeのマイク許可を一度だけオンにしてください。";
    } else if (interviewRecognitionRetryCount < 2) {
      interviewRecognitionRetryCount += 1;
      retryAutomatically = true;
      $("#interviewAnswerStatus").textContent = "マイクを自動で再接続しています…";
    } else {
      $("#interviewAnswerStatus").textContent = "マイクを確認できません。Chromeでページを再読み込みしてください。";
    }
  };
  recognition.onend = () => {
    interviewRecognition = null;
    $("#interviewMic").classList.remove("listening");
    if (confirmed.trim() && !submitted) {
      $("#interviewAnswerStatus").textContent = "回答の区切りを確認しています…";
      if (!interviewSilenceTimer) interviewSilenceTimer = window.setTimeout(submitAfterSilence, 350);
    }
    else if (retryAutomatically && !realtimeInterviewEnded) {
      window.setTimeout(startBrowserInterviewRecognition, 150);
    }
    else if (!realtimeInterviewEnded) $("#interviewAnswerStatus").textContent = "マイクを押してもう一度お話しください";
  };
  interviewRecognition = recognition;
  recognition.start();
  $("#interviewMic").classList.add("listening");
  $("#interviewMic span").textContent = "聞き取り中";
  $("#interviewAnswerStatus").textContent = "お話しください";
}

function finishBrowserInterviewAutomatically() {
  stopInterviewRecognition();
  realtimeInterviewEnded = true;
  $("#interviewVideoStage").classList.remove("asuka-speaking");
  interviewOverlay.hidden = true;
  addLog("📝", "面接を終了しました。ホーム画面の裏側でレポートを作成しています");
  finishRealtimeInterview();
}

function speakInterviewAndListen(text, listenAfter = true) {
  appendRealtimeTranscript("asuka", text);
  $("#interviewQuestion").textContent = text;
  $("#interviewVideoStage").classList.add("asuka-speaking");
  if (!window.speechSynthesis) {
    $("#interviewVideoStage").classList.remove("asuka-speaking");
    if (listenAfter) startBrowserInterviewRecognition();
    else finishBrowserInterviewAutomatically();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  applyStaffVoice(utterance, "asuka");
  utterance.onend = () => {
    $("#interviewVideoStage").classList.remove("asuka-speaking");
    $("#interviewVideoStage").classList.add("asuka-nodding");
    window.setTimeout(() => $("#interviewVideoStage").classList.remove("asuka-nodding"), 500);
    if (listenAfter) startBrowserInterviewRecognition();
    else finishBrowserInterviewAutomatically();
  };
  window.speechSynthesis.speak(utterance);
}

function speakInterviewOpening(candidateName, job) {
  const greeting = `${candidateName}さん、本日はお時間をいただきありがとうございます。${job}の面接を担当する、あすかです。よろしくお願いします。`;
  const firstQuestion = "それでは最初に、今回応募された理由を教えてください。";
  appendRealtimeTranscript("asuka", greeting);
  $("#interviewQuestion").textContent = greeting;
  $("#interviewVideoStage").classList.add("asuka-speaking");

  const askFirstQuestion = () => {
    $("#interviewVideoStage").classList.remove("asuka-speaking");
    $("#interviewVideoStage").classList.add("asuka-nodding");
    window.setTimeout(() => {
      $("#interviewVideoStage").classList.remove("asuka-nodding");
      speakInterviewAndListen(firstQuestion);
    }, 250);
  };

  if (!window.speechSynthesis) {
    window.setTimeout(askFirstQuestion, 150);
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(greeting);
  applyStaffVoice(utterance, "asuka", { rate: 0.96 });
  utterance.onend = askFirstQuestion;
  window.speechSynthesis.speak(utterance);
}

async function fetchInterviewTurn(transcript) {
  const response = await fetch("/api/interview/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      job: activeInterviewCandidate.job || $("#interviewJob").value.trim(),
      criteria: activeInterviewCriteria,
      transcript,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "次の質問を作成できませんでした。");
  return data;
}

async function submitBrowserInterviewAnswer(answer, prefetchedTurn = null, prefetchedAnswerText = "") {
  appendRealtimeTranscript("candidate", answer);
  $("#interviewAnswerStatus").textContent = prefetchedTurn
    ? "次の質問へつなげています…"
    : "あすかが頷きながら回答を確認しています…";
  $("#interviewMic").disabled = true;
  try {
    const canUsePrefetch = prefetchedTurn
      && prefetchedAnswerText
      && answer.startsWith(prefetchedAnswerText);
    const data = canUsePrefetch
      ? await prefetchedTurn
      : await fetchInterviewTurn(getRealtimeTranscriptText());
    if (!data) throw new Error("先読みした質問を確認できませんでした。");
    $("#interviewVideoStage").classList.remove("asuka-nodding");
    speakInterviewAndListen(data.reply, !data.should_end);
  } catch (error) {
    $("#interviewVideoStage").classList.remove("asuka-nodding");
    $("#interviewAnswerStatus").textContent = `${error.message} マイクを押すと再開できます。`;
  } finally {
    $("#interviewMic").disabled = false;
    $("#interviewMic span").textContent = "マイクで回答";
  }
}

$("#interviewStart").addEventListener("click", async () => {
  const candidateName = $("#interviewCandidateName").value.trim();
  const job = $("#interviewJob").value.trim();
  const candidateAge = $("#interviewCandidateAge").value.trim();
  if (!candidateName || !job || !candidateAge) {
    const missingField = !candidateName
      ? $("#interviewCandidateName")
      : !job
        ? $("#interviewJob")
        : $("#interviewCandidateAge");
    missingField.focus();
    return;
  }
  const missing = missingAssessmentBefore("interview", candidateName);
  if (missing) {
    alert(`${missing}がまだ完了していません。\n採用試験は「SPI → 漢字 → 算数 → 面接」の順番で受けてください。`);
    return;
  }
  interviewWelcome.hidden = true;
  interviewSession.hidden = false;
  interviewReport.hidden = true;
  interviewTranscript = [];
  realtimeInterviewEnded = false;
  interviewRecognitionRetryCount = 0;
  interviewReportGenerating = false;
  activeInterviewCriteria = (staffSettings.asuka || {}).prompt || "";
  activeInterviewCandidate = { name: candidateName, age: candidateAge, job };
  lastInterviewBackchannelAt = 0;
  currentAnswerSpeechStartedAt = 0;
  $("#interviewMic").hidden = false;
  interviewAnswer.value = "";
  $("#interviewVideoAsuka").innerHTML = mascotFigureHTML(STAFF.find(staff => staff.id === "asuka"), "working");

  if (!SpeechRecognitionCtor) {
    startStaticInterview(job, "この環境では対話式音声を使えないため、テキスト面接を開始しました。");
    return;
  }

  interviewMode = "browser";
  $("#interviewQuestion").textContent = "面接を始めます";
  $("#interviewAnswerStatus").textContent = "Chromeの音声入力を準備しています";
  $("#interviewMic span").textContent = "マイクで回答";
  $("#interviewNext").textContent = "面接を終了";
  interviewAnswer.hidden = true;
  interviewAnswer.readOnly = true;
  interviewAnswer.placeholder = "会話の記録がここに表示されます。";

  await startBrowserInterviewRecordingIfRequested();
  window.setTimeout(() => speakInterviewOpening(candidateName, job), 80);
});

$("#interviewMic").addEventListener("click", () => {
  if (interviewMode === "browser") {
    if (interviewRecognition) {
      stopInterviewRecognition();
      $("#interviewAnswerStatus").textContent = "音声入力を一時停止しました";
    } else {
      startBrowserInterviewRecognition();
    }
    return;
  }
  if (interviewMode === "realtime") {
    if (!interviewMediaStream) return;
    const track = interviewMediaStream.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    $("#interviewMic").classList.toggle("listening", track.enabled);
    $("#interviewMic span").textContent = track.enabled ? "マイクをミュート" : "ミュートを解除";
    $("#interviewAnswerStatus").textContent = track.enabled ? "あすかに話せます" : "マイクはミュート中です";
    return;
  }
  if (!SpeechRecognitionCtor) {
    $("#interviewAnswerStatus").textContent = "このブラウザでは音声入力を使えません。テキストで回答してください。";
    interviewAnswer.focus();
    return;
  }
  if (interviewRecognition) {
    stopInterviewRecognition();
    $("#interviewAnswerStatus").textContent = "音声入力を停止しました";
    return;
  }
  const recognition = new SpeechRecognitionCtor();
  recognition.lang = "ja-JP";
  recognition.continuous = true;
  recognition.interimResults = true;
  let confirmed = interviewAnswer.value;
  currentAnswerSpeechStartedAt = 0;
  lastInterviewBackchannelAt = Date.now();
  recognition.onresult = event => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) confirmed += event.results[i][0].transcript;
      else interim += event.results[i][0].transcript;
    }
    interviewAnswer.value = confirmed + interim;
    if (confirmed || interim) acknowledgeInterviewAnswer((confirmed + interim).length);
  };
  recognition.onerror = () => {
    $("#interviewAnswerStatus").textContent = "音声を確認できませんでした。テキスト入力も利用できます。";
    stopInterviewRecognition();
  };
  recognition.onend = () => {
    interviewRecognition = null;
    $("#interviewMic").classList.remove("listening");
    $("#interviewAnswerStatus").textContent = "回答を確認して「次へ」を押してください";
  };
  interviewRecognition = recognition;
  recognition.start();
  $("#interviewMic").classList.add("listening");
  $("#interviewAnswerStatus").textContent = "聞き取り中…";
});

function buildInterviewReport() {
  const candidateName = activeInterviewCandidate.name || $("#interviewCandidateName").value.trim();
  const candidateAge = activeInterviewCandidate.age || $("#interviewCandidateAge").value.trim();
  const job = activeInterviewCandidate.job || $("#interviewJob").value.trim();
  const scoreAnswer = answer => {
    const lengthScore = Math.min(12, Math.floor(answer.length / 12));
    const evidenceWords = ["例えば", "具体的", "結果", "改善", "達成", "工夫", "課題", "理由"];
    const evidenceScore = Math.min(6, evidenceWords.filter(word => answer.includes(word)).length * 2);
    const numberScore = /\d|一|二|三|四|五|六|七|八|九|十/.test(answer) ? 2 : 0;
    return Math.min(20, Math.max(2, lengthScore + evidenceScore + numberScore));
  };
  const categoryNames = ["志望動機", "経験・実績", "問題解決力", "協働性", "強み・将来像"];
  const categoryScores = interviewAnswers.map(scoreAnswer);
  const totalScore = categoryScores.reduce((sum, score) => sum + score, 0);
  $("#interviewReportBody").innerHTML = `
    <div class="report-summary"><span>応募者名</span><strong>${escapeHtml(candidateName)}</strong></div>
    <div class="report-summary"><span>年齢（評価対象外）</span><strong>${escapeHtml(candidateAge)}歳</strong></div>
    <div class="report-summary"><span>応募職種</span><strong>${escapeHtml(job)}</strong></div>
    <div class="report-total-score">
      <span>総合評価点</span><strong>${totalScore}<small> / 100点</small></strong>
      <div class="report-threshold ${totalScore >= 60 ? "met" : "review-needed"}">${totalScore >= 60 ? "✓ 面接基準合格（60％以上）" : "△ 面接基準未達（60％未満）"}</div>
      <p>回答の具体性と情報量を基にした仮採点です</p>
    </div>
    <div class="report-score-list">
      ${categoryNames.map((name, index) => `
        <div class="report-score-row">
          <span>${name}</span>
          <div><i style="width:${categoryScores[index] * 5}%"></i></div>
          <b>${categoryScores[index]} / 20</b>
        </div>
      `).join("")}
    </div>
    <h4>回答記録</h4>
    ${interviewQuestions.map((question, index) => `
      <div class="report-answer"><b>Q${index + 1}. ${escapeHtml(question)}</b><p>${escapeHtml(interviewAnswers[index] || "")}</p></div>
    `).join("")}
    <h4>確認ポイント</h4>
    <p class="report-points">この点数だけで合否を決めず、職務との関連性や事実確認を人間の採用担当者が行ってください。</p>`;
}

function renderApiInterviewReport(report) {
  const candidateName = activeInterviewCandidate.name || $("#interviewCandidateName").value.trim();
  const candidateAge = activeInterviewCandidate.age || $("#interviewCandidateAge").value.trim();
  const job = activeInterviewCandidate.job || $("#interviewJob").value.trim();
  const categories = Array.isArray(report.categories) ? report.categories : [];
  const totalScore = categories.reduce((sum, category) => sum + Number(category.score || 0), 0);
  const list = values => (Array.isArray(values) && values.length)
    ? `<ul>${values.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`
    : "<p>特になし</p>";
  $("#interviewReportBody").innerHTML = `
    <div class="report-summary"><span>応募者名</span><strong>${escapeHtml(candidateName)}</strong></div>
    <div class="report-summary"><span>年齢（評価対象外）</span><strong>${escapeHtml(candidateAge)}歳</strong></div>
    <div class="report-summary"><span>応募職種</span><strong>${escapeHtml(job)}</strong></div>
    <div class="report-total-score">
      <span>総合評価点</span><strong>${totalScore}<small> / 100点</small></strong>
      <div class="report-threshold ${totalScore >= 60 ? "met" : "review-needed"}">${totalScore >= 60 ? "✓ 面接基準合格（60％以上）" : "△ 面接基準未達（60％未満）"}</div>
      <p>${escapeHtml(report.summary || "面接で確認できた回答内容を評価しました。")}</p>
    </div>
    <div class="report-score-list">
      ${categories.map(category => `
        <div class="report-score-row">
          <span>${escapeHtml(category.name)}</span>
          <div><i style="width:${Math.max(0, Math.min(100, Number(category.score || 0) * 5))}%"></i></div>
          <b>${Number(category.score || 0)} / 20</b>
          <small>${escapeHtml(category.reason || "")}</small>
        </div>
      `).join("")}
    </div>
    <h4>強み</h4>${list(report.strengths)}
    <h4>懸念・不足情報</h4>${list(report.concerns)}
    <h4>人が追加確認する項目</h4>${list(report.follow_up_checks)}
    <p class="report-points">音声内容は画面に表示せず、採点処理にのみ使用しました。</p>`;
}

function renderVideoTaskReview(review) {
  const practicalScore = Math.max(0, Math.min(20, Number(review.score || 0)));
  const list = values => (Array.isArray(values) && values.length)
    ? `<ul>${values.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`
    : "<p>該当項目なし</p>";
  $("#interviewReportBody").insertAdjacentHTML("beforeend", `
    <section class="video-task-review">
      <h4>🎥 動画評価（通常面接100点とは別枠）</h4>
      <div class="video-task-score"><strong>${practicalScore}</strong><span>/ 20点</span></div>
      <div class="report-threshold ${practicalScore >= 14 ? "met" : "review-needed"}">${practicalScore >= 14 ? "✓ 動画評価基準達成（70％以上）" : "△ 動画内容の追加確認が必要"}</div>
      <b>確認できた要件</b>${list(review.completed_items)}
      <b>未達または画像では確認できない要件</b>${list(review.missing_items)}
      <b>確認根拠</b>${list(review.evidence)}
      <p>${escapeHtml(review.summary || "")}</p>
      <p class="video-task-safety">容姿・表情・視線・姿勢・緊張・声質は評価していません。指定された実演要件だけの参考評価で、採用・不採用は人間が判断します。</p>
    </section>`);
}

async function reviewInterviewPracticalTask() {
  const videoPrompt = getVideoEvaluationPrompt();
  if (!$("#interviewRecordConsent").checked || !videoPrompt || !interviewVideoFrames.length) return;
  addLog("🎥", "あすかが設定された動画評価プロンプトで録画を確認しています");
  try {
    const response = await fetch("/api/interview/video-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job: $("#interviewJob").value.trim(),
        task: "面接中に録画された職務上の実演内容を確認する",
        criteria: videoPrompt,
        frames: interviewVideoFrames,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "実演課題を確認できませんでした。");
    renderVideoTaskReview(data.review);
    addLog("🎥", "動画評価プロンプトに基づく確認が完了しました");
  } catch (error) {
    $("#interviewReportBody").insertAdjacentHTML("beforeend", `
      <section class="video-task-review">
        <h4>🎥 動画評価</h4>
        <p>${escapeHtml(error.message)} 人間の採用担当者が録画を確認してください。</p>
      </section>`);
    addLog("⚠️", `実演課題の映像確認を完了できませんでした：${error.message}`);
  }
}

function getRealtimeTranscriptText() {
  return interviewTranscript
    .map(item => `${item.speaker === "asuka" ? "あすか" : "応募者"}：${item.text}`)
    .join("\n");
}

async function finishRealtimeInterview() {
  if (interviewReportGenerating) return;
  const transcript = getRealtimeTranscriptText();
  if (!transcript) {
    $("#interviewAnswerStatus").textContent = "会話記録がまだありません。あすかの質問に回答してください。";
    return;
  }
  interviewReportGenerating = true;
  stopInterviewRecognition();
  stopRealtimeInterview();
  interviewOverlay.hidden = true;
  addLog("🧠", "あすかが面接レポートを作成しています…");

  try {
    const response = await fetch("/api/interview/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateName: activeInterviewCandidate.name,
        candidateAge: activeInterviewCandidate.age,
        job: activeInterviewCandidate.job,
        criteria: activeInterviewCriteria,
        transcript,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "面接レポートを作成できませんでした。");
    renderApiInterviewReport(data.report);
    await reviewInterviewPracticalTask();
    localStorage.setItem(LAST_INTERVIEW_REPORT_KEY, JSON.stringify({
      html: $("#interviewReportBody").innerHTML,
      createdAt: new Date().toISOString(),
      candidateName: activeInterviewCandidate.name,
      candidateAge: activeInterviewCandidate.age,
      job: activeInterviewCandidate.job,
    }));
    interviewSession.hidden = true;
    interviewReport.hidden = true;
    saveCandidateAssessment(activeInterviewCandidate.name, "interview", {
      html: $("#interviewReportBody").innerHTML,
      text: $("#interviewReportBody").innerText,
      score: Array.isArray(data.report?.categories)
        ? data.report.categories.reduce((sum, category) => sum + Number(category.score || 0), 0)
        : Number(data.report?.total_score || 0),
      job: activeInterviewCandidate.job,
      age: activeInterviewCandidate.age,
      createdAt: new Date().toISOString(),
    });
    const combinedCreated = await tryGenerateCombinedCandidateReport(activeInterviewCandidate.name);
    if (!combinedCreated) {
      addLog("📋", "面接評価を保存しました。SPI・漢字・算数がすべて完了すると、あすかが総合レポートを作成します");
      speak("面接が完了しました。残りのテストが完了すると、総合レポートを作成します。", STAFF.findIndex(staff => staff.id === "asuka"));
    }
  } catch (error) {
    addLog("⚠️", `面接レポートの作成に失敗しました：${error.message}`);
    showInterviewCompletionNotice(false);
  }
}

$("#interviewNext").addEventListener("click", async () => {
  if (interviewMode === "realtime" || interviewMode === "browser") {
    if (!realtimeInterviewEnded) {
      const transcript = getRealtimeTranscriptText();
      if (!transcript) {
        $("#interviewAnswerStatus").textContent = "まだ面接内容がありません。あすかと会話してから終了してください。";
        return;
      }
      stopInterviewRecognition();
      speakInterviewAndListen("ありがとうございます。面接は以上です。", false);
      return;
    }
    return;
  }
  stopInterviewRecognition();
  const answer = interviewAnswer.value.trim();
  if (!answer) {
    $("#interviewAnswerStatus").textContent = "回答を入力してください";
    interviewAnswer.focus();
    return;
  }
  interviewAnswers.push(answer);
  interviewIndex += 1;
  if (interviewIndex < interviewQuestions.length) {
    showInterviewQuestion();
  } else {
    interviewTranscript = interviewQuestions.flatMap((question, index) => [
      { speaker: "asuka", text: question },
      { speaker: "candidate", text: interviewAnswers[index] || "" },
    ]);
    realtimeInterviewEnded = true;
    speak("面接は以上です。ご回答ありがとうございました。", STAFF.findIndex(staff => staff.id === "asuka"));
    interviewOverlay.hidden = true;
    finishRealtimeInterview();
  }
});

$("#interviewClose").addEventListener("click", closeInterviewModal);
$("#interviewFinish").addEventListener("click", closeInterviewModal);
interviewOverlay.addEventListener("click", event => { if (event.target === interviewOverlay) closeInterviewModal(); });
$("#interviewDownloadRecording").addEventListener("click", () => {
  if (!interviewRecordingUrl) return;
  const link = document.createElement("a");
  const job = $("#interviewJob").value.trim().replace(/[\\/:*?"<>|]/g, "-") || "面接";
  link.href = interviewRecordingUrl;
  link.download = `採用試験ルーム_${job}-面接録画-${new Date().toISOString().slice(0, 10)}.webm`;
  document.body.appendChild(link);
  link.click();
  link.remove();
});

/* ---------------- SPI-style aptitude test (local, no API) ---------------- */
const SPI_QUESTIONS = [
  { category: "言語", text: "「遵守」に最も近い意味を選んでください。", options: ["見直す", "守る", "伝える", "疑う"], correct: 1 },
  { category: "言語", text: "「医師：病院」と同じ関係になる組み合わせはどれですか。", options: ["教師：学校", "商品：店舗", "道路：自動車", "料理：食材"], correct: 0 },
  { category: "言語", text: "文章の空欄に最も合う語句を選んでください。「計画は詳細だった。＿＿、予期しない変更には対応できなかった。」", options: ["したがって", "一方で", "たとえば", "つまり"], correct: 1 },
  { category: "言語", text: "「簡潔」の反対に最も近い言葉はどれですか。", options: ["明快", "冗長", "正確", "柔軟"], correct: 1 },
  { category: "非言語", text: "数列 2、6、12、20、次に入る数はどれですか。", options: ["24", "28", "30", "32"], correct: 2 },
  { category: "非言語", text: "2,500円の商品を20％引きで購入します。支払額はいくらですか。", options: ["1,800円", "2,000円", "2,050円", "2,300円"], correct: 1 },
  { category: "非言語", text: "時速60kmで1時間30分進むと、移動距離は何kmですか。", options: ["75km", "80km", "90km", "100km"], correct: 2 },
  { category: "非言語", text: "AとBの人数比が3：5で、合計40人です。Aは何人ですか。", options: ["12人", "15人", "18人", "25人"], correct: 1 },
  { category: "性格", text: "初めての仕事でも、自分から情報を集めて着手するほうだ。", personality: "initiative" },
  { category: "性格", text: "意見が違う相手とも、理由を聞きながら調整できる。", personality: "cooperation" },
  { category: "性格", text: "期限から逆算して、途中の進捗を確認するほうだ。", personality: "planning" },
  { category: "性格", text: "問題が起きたとき、他人に任せる前に解決方法を考える。", personality: "ownership" },
];
const SPI_PERSONALITY_OPTIONS = ["まったく当てはまらない", "あまり当てはまらない", "どちらともいえない", "やや当てはまる", "とても当てはまる"];
const KANJI_QUESTIONS = [
  { category:"漢字・読み", text:"「温かい」の読み方を選んでください。", options:["あたたかい","やわらかい","すずしい","ぬるい"], correct:0 },
  { category:"漢字・読み", text:"「港」の読み方を選んでください。", options:["みさき","みなと","しま","うみ"], correct:1 },
  { category:"漢字・読み", text:"「農業」の読み方を選んでください。", options:["のうぎょう","のうごう","のぎょう","のうきょう"], correct:0 },
  { category:"漢字・読み", text:"「安全」の読み方を選んでください。", options:["あんぜん","あんせん","あぜん","やすぜん"], correct:0 },
  { category:"漢字・書き", text:"「にもつを はこぶ」の正しい漢字を選んでください。", options:["運ぶ","送ぶ","進ぶ","動ぶ"], correct:0 },
  { category:"漢字・書き", text:"「みじかい えんぴつ」の正しい漢字を選んでください。", options:["少い","近い","短い","細い"], correct:2 },
  { category:"漢字・書き", text:"「しあわせな 生活」の正しい漢字を選んでください。", options:["幸せ","仕合せ","吉せ","楽せ"], correct:0 },
  { category:"漢字・書き", text:"「坂を のぼる」の正しい漢字を選んでください。", options:["登る","上る","昇る","いずれも文脈で使える"], correct:3 },
];
const MATH_QUESTIONS = [
  { category:"算数・計算", text:"348＋275はいくつですか。", options:["613","623","633","713"], correct:1 },
  { category:"算数・計算", text:"700－286はいくつですか。", options:["404","414","424","514"], correct:1 },
  { category:"算数・計算", text:"24×3はいくつですか。", options:["62","68","72","82"], correct:2 },
  { category:"算数・計算", text:"84÷4はいくつですか。", options:["19","20","21","24"], correct:2 },
  { category:"算数・文章問題", text:"1本85円のえんぴつを4本買います。代金はいくらですか。", options:["320円","330円","340円","360円"], correct:2 },
  { category:"算数・文章問題", text:"3m20cmは何cmですか。", options:["32cm","302cm","320cm","3,200cm"], correct:2 },
  { category:"算数・文章問題", text:"40個のあめを5人で同じ数ずつ分けます。1人分はいくつですか。", options:["5個","8個","10個","20個"], correct:1 },
  { category:"算数・図形", text:"たて4cm、横6cmの長方形の周りの長さは何cmですか。", options:["10cm","20cm","24cm","28cm"], correct:1 },
];
const ASSESSMENT_RECORDS_KEY = "ai-office-candidate-assessments";
const ASSESSMENT_PASS_MARKS = { spi: 50, kanji: 60, math: 60, interview: 60 };
const TEST_CONFIGS = {
  reina: { type:"spi", title:"SPI形式テスト", subtitle:"言語・非言語・性格傾向", questions:SPI_QUESTIONS, minutes:12 },
  sakura:{ type:"kanji", title:"漢字テスト（小学3年生レベル）", subtitle:"読み・書きの基礎問題", questions:KANJI_QUESTIONS, minutes:10 },
  takumi:{ type:"math", title:"算数テスト（小学3年生レベル）", subtitle:"計算・文章問題・図形", questions:MATH_QUESTIONS, minutes:10 },
};
let spiPendingConfig = TEST_CONFIGS.reina;
let spiTestState = null;
let spiTimerId = null;

function assessmentKey(name) { return String(name).trim().replace(/\s+/g, "").toLowerCase(); }
function getAssessmentRecords() {
  try { return JSON.parse(localStorage.getItem(ASSESSMENT_RECORDS_KEY) || "{}"); } catch { return {}; }
}
function saveCandidateAssessment(name, type, value) {
  const records = getAssessmentRecords();
  const key = assessmentKey(name);
  records[key] = {
    ...(records[key] || {}),
    name,
    [type]: value,
    combinedGenerated: false,
    updatedAt:new Date().toISOString(),
  };
  localStorage.setItem(ASSESSMENT_RECORDS_KEY, JSON.stringify(records));
}

function candidateAssessment(name) {
  return getAssessmentRecords()[assessmentKey(name)] || {};
}

function missingAssessmentBefore(type, name) {
  const record = candidateAssessment(name);
  const required = {
    spi: [],
    kanji: [["spi", "SPI"]],
    math: [["spi", "SPI"], ["kanji", "漢字テスト"]],
    interview: [["spi", "SPI"], ["kanji", "漢字テスト"], ["math", "算数テスト"]],
  }[type] || [];
  return required.find(([key]) => !record[key])?.[1] || "";
}

async function tryGenerateCombinedCandidateReport(candidateName) {
  const records = getAssessmentRecords();
  const key = assessmentKey(candidateName);
  const record = records[key];
  if (!record || record.combinedGenerated || !record.spi || !record.kanji || !record.math || !record.interview) return false;
  const resultBadge = (score, type) => {
    const passed = Number(score) >= ASSESSMENT_PASS_MARKS[type];
    return `<div class="report-threshold ${passed ? "met" : "review-needed"}">${passed ? "✓ 基準合格" : "△ 基準未達"}（合格基準 ${ASSESSMENT_PASS_MARKS[type]}％）</div>`;
  };
  const allPassed = record.spi.score >= ASSESSMENT_PASS_MARKS.spi
    && record.kanji.score >= ASSESSMENT_PASS_MARKS.kanji
    && record.math.score >= ASSESSMENT_PASS_MARKS.math
    && record.interview.score >= ASSESSMENT_PASS_MARKS.interview;
  const combinedHtml = `
    <div class="report-summary"><span>応募者名</span><strong>${escapeHtml(record.name)}</strong></div>
    <div class="report-summary"><span>応募職種</span><strong>${escapeHtml(record.interview.job || record.spi.job || "未指定")}</strong></div>
    <div class="report-total-score"><span>SPI形式テスト（${record.spi.correctCount}/${record.spi.total}問正解）</span><strong>${record.spi.score}<small> / 100点</small></strong>${resultBadge(record.spi.score, "spi")}</div>
    ${record.spi.traits?.length ? `<section class="combined-interview-section"><h3>SPI性格傾向</h3><p>${record.spi.traits.map(trait => `${escapeHtml(trait.label)}：${trait.score}/5`).join(" ／ ")}</p></section>` : ""}
    <div class="report-total-score"><span>漢字テスト（小学3年生レベル・${record.kanji.correctCount}/${record.kanji.total}問正解）</span><strong>${record.kanji.score}<small> / 100点</small></strong>${resultBadge(record.kanji.score, "kanji")}</div>
    <div class="report-total-score"><span>算数テスト（小学3年生レベル・${record.math.correctCount}/${record.math.total}問正解）</span><strong>${record.math.score}<small> / 100点</small></strong>${resultBadge(record.math.score, "math")}</div>
    <div class="report-total-score"><span>面接評価</span><strong>${record.interview.score}<small> / 100点</small></strong>${resultBadge(record.interview.score, "interview")}</div>
    <section class="combined-interview-section"><h3>面接評価</h3>${record.interview.html}</section>
    <div class="report-threshold ${allPassed ? "met" : "review-needed"}">${allPassed ? "✓ 全項目で合格基準を達成" : "△ 合格基準に満たない項目があります"}</div>
    <p class="interview-human-note">4つの試験結果を統合した参考レポートです。正式な採用判断は人間が行ってください。</p>`;
  record.combinedGenerated = true;
  record.combinedCreatedAt = new Date().toISOString();
  localStorage.setItem(ASSESSMENT_RECORDS_KEY, JSON.stringify(records));
  const plain = `採用総合評価レポート
応募者：${record.name}
応募職種：${record.interview.job || record.spi.job || "未指定"}
SPI：${record.spi.score}/100点（合格基準50％・${record.spi.score >= 50 ? "基準合格" : "基準未達"}）
漢字：${record.kanji.score}/100点（合格基準60％・${record.kanji.score >= 60 ? "基準合格" : "基準未達"}）
算数：${record.math.score}/100点（合格基準60％・${record.math.score >= 60 ? "基準合格" : "基準未達"}）
面接：${record.interview.score}/100点（合格基準60％・${record.interview.score >= 60 ? "基準合格" : "基準未達"}）

面接評価
${record.interview.text || ""}`;
  await archiveCompletedDeliverable({
    staffId:"asuka", staffName:"あすか", role:"採用総合評価レポート",
    content:plain, model:"4試験統合",
  });
  addLog("📚", `あすかが${record.name}さんのSPI・漢字・算数・面接を統合した総合レポートを作成しました`);
  showInterviewCompletionNotice();
  speak("すべての試験が完了しました。総合レポートが完成しました。", STAFF.findIndex(staff => staff.id === "asuka"));
  return true;
}

function renderSpiQuestion() {
  if (!spiTestState) return;
  const questions = spiTestState.questions;
  const question = questions[spiTestState.index];
  const answer = spiTestState.answers[spiTestState.index];
  $("#spiCategory").textContent = `${question.category}問題`;
  $("#spiQuestionCount").textContent = `${spiTestState.index + 1} / ${questions.length}`;
  $("#spiProgressBar").style.width = `${((spiTestState.index + 1) / questions.length) * 100}%`;
  $("#spiQuestion").innerHTML = `<span>Q${spiTestState.index + 1}</span><p>${question.text}</p>`;
  const options = question.personality ? SPI_PERSONALITY_OPTIONS : question.options;
  $("#spiOptions").innerHTML = options.map((option, index) => `
    <button type="button" class="spi-option${answer === index ? " selected" : ""}" data-spi-answer="${index}">
      <i>${String.fromCharCode(65 + index)}</i><span>${option}</span>
    </button>`).join("");
  $("#spiPrevious").disabled = spiTestState.index === 0;
  $("#spiNext").disabled = answer === undefined;
  $("#spiNext").textContent = spiTestState.index === questions.length - 1 ? "回答を完了" : "次の問題";
}

function openSpiTest(staffId = "reina") {
  const staff = STAFF.find(item => item.id === staffId);
  spiPendingConfig = TEST_CONFIGS[staffId] || TEST_CONFIGS.reina;
  $("#spiStaffAvatar").innerHTML = mascotFigureHTML(staff, "idle");
  $("#spiStaffRole").textContent = staff.role;
  $("#spiTitle").textContent = `${staff.name}の${spiPendingConfig.title}`;
  $("#spiSubtitle").textContent = spiPendingConfig.subtitle;
  $("#spiGuideText").textContent = `全${spiPendingConfig.questions.length}問・制限時間${spiPendingConfig.minutes}分です。結果は最後の総合レポートだけに記載されます。`;
  $("#spiWelcome").hidden = false;
  $("#spiSession").hidden = true;
  $("#spiResult").hidden = true;
  $("#spiOverlay").hidden = false;
}

function closeSpiTest() {
  window.clearInterval(spiTimerId);
  spiTimerId = null;
  spiTestState = null;
  $("#spiOverlay").hidden = true;
}

function updateSpiTimer() {
  if (!spiTestState) return;
  spiTestState.remaining -= 1;
  const minutes = Math.floor(Math.max(0, spiTestState.remaining) / 60);
  const seconds = Math.max(0, spiTestState.remaining) % 60;
  $("#spiTimer").textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  if (spiTestState.remaining <= 0) finishSpiTest();
}

async function finishSpiTest() {
  if (!spiTestState || spiTestState.finished) return;
  spiTestState.finished = true;
  window.clearInterval(spiTimerId);
  const questions = spiTestState.questions;
  const ability = questions.filter(question => !question.personality);
  const correctCount = ability.reduce((count, question, index) =>
    count + (spiTestState.answers[index] === question.correct ? 1 : 0), 0);
  const verbal = questions.slice(0, 4).reduce((count, question, index) =>
    count + (spiTestState.answers[index] === question.correct ? 1 : 0), 0);
  const nonVerbal = questions.slice(4, 8).reduce((count, question, index) =>
    count + (spiTestState.answers[index + 4] === question.correct ? 1 : 0), 0);
  const traits = spiTestState.type === "spi" ? questions.slice(8).map((question, index) => ({
    label: { initiative: "主体性", cooperation: "協調性", planning: "計画性", ownership: "自己解決志向" }[question.personality],
    score: Number(spiTestState.answers[index + 8] ?? 2) + 1,
  })) : [];
  const score = Math.round(correctCount / ability.length * 100);
  const content = `【${spiTestState.title}結果】
受検者：${spiTestState.name}
応募職種：${spiTestState.job}
得点：${correctCount}/${ability.length}問（${score}点）
${traits.length ? `性格傾向：${traits.map(trait => `${trait.label} ${trait.score}/5`).join("、")}` : ""}
※社内用の参考結果です。`;
  const completed = {
    name: spiTestState.name,
    job: spiTestState.job,
    age: spiTestState.age,
    type: spiTestState.type,
    staffName: spiTestState.staffName,
  };
  saveCandidateAssessment(completed.name, completed.type, {
    score,
    correctCount,
    total: ability.length,
    verbal,
    nonVerbal,
    traits,
    content,
    job: completed.job,
    age: completed.age,
  });
  addLog("📝", `${completed.staffName}が${completed.name}さんの採点データを総合レポート用に保存しました`);
  closeSpiTest();
  advanceAssessmentFlow(completed);
}

function advanceAssessmentFlow({ name, job, age, type }) {
  if (type === "spi") {
    openSpiTest("sakura");
    $("#spiCandidateName").value = name;
    $("#spiCandidateJob").value = job;
    $("#spiCandidateAge").value = age;
  } else if (type === "kanji") {
    openSpiTest("takumi");
    $("#spiCandidateName").value = name;
    $("#spiCandidateJob").value = job;
    $("#spiCandidateAge").value = age;
  } else if (type === "math") {
    openInterviewModal();
    $("#interviewCandidateName").value = name;
    $("#interviewJob").value = job;
    $("#interviewCandidateAge").value = age;
    $("#interviewStart").focus();
  }
}

$("#spiStart").addEventListener("click", () => {
  const name = $("#spiCandidateName").value.trim();
  const job = $("#spiCandidateJob").value.trim();
  const age = $("#spiCandidateAge").value.trim();
  if (!name || !job || !age) {
    alert("受検者名・応募職種・年齢を入力してください。");
    return;
  }
  const staffId = Object.keys(TEST_CONFIGS).find(id => TEST_CONFIGS[id] === spiPendingConfig) || "reina";
  const missing = missingAssessmentBefore(spiPendingConfig.type, name);
  if (missing) {
    alert(`${missing}がまだ完了していません。\n採用試験は「SPI → 漢字 → 算数 → 面接」の順番で受けてください。`);
    return;
  }
  const staff = STAFF.find(item => item.id === staffId);
  spiTestState = { name, job, age, staffId, staffName:staff.name, type:spiPendingConfig.type, title:spiPendingConfig.title, questions:spiPendingConfig.questions, index: 0, answers: [], remaining: spiPendingConfig.minutes * 60, finished: false };
  $("#spiWelcome").hidden = true;
  $("#spiSession").hidden = false;
  $("#spiTimer").textContent = `${String(spiPendingConfig.minutes).padStart(2,"0")}:00`;
  renderSpiQuestion();
  spiTimerId = window.setInterval(updateSpiTimer, 1000);
  speak(`${spiPendingConfig.title}を開始します。落ち着いて回答してください。`, STAFF.findIndex(item => item.id === staffId));
});
$("#spiOptions").addEventListener("click", event => {
  const option = event.target.closest(".spi-option");
  if (!option || !spiTestState) return;
  spiTestState.answers[spiTestState.index] = Number(option.dataset.spiAnswer);
  renderSpiQuestion();
});
$("#spiPrevious").addEventListener("click", () => {
  if (!spiTestState || spiTestState.index === 0) return;
  spiTestState.index -= 1;
  renderSpiQuestion();
});
$("#spiNext").addEventListener("click", () => {
  if (!spiTestState || spiTestState.answers[spiTestState.index] === undefined) return;
  if (spiTestState.index === spiTestState.questions.length - 1) finishSpiTest();
  else { spiTestState.index += 1; renderSpiQuestion(); }
});
$("#spiClose").addEventListener("click", closeSpiTest);
$("#spiFinish").addEventListener("click", () => {
  if (!spiTestState) {
    closeSpiTest();
    return;
  }
  const { name, job, age, type } = spiTestState;
  closeSpiTest();
  advanceAssessmentFlow({ name, job, age, type });
});
$("#spiOverlay").addEventListener("click", event => { if (event.target === $("#spiOverlay")) closeSpiTest(); });

/* ---------------- delegate mascot tile clicks ---------------- */
function handleFloorClick(e) {
  const gearBtn = e.target.closest(".mascot-gear-btn");
  if (gearBtn) {
    openStaffSettingsModal(gearBtn.dataset.gearId);
    return;
  }
  const tile = e.target.closest(".mascot-tile");
  if (!tile) return;
  const id = tile.dataset.id;
  const status = state[id].status;
  if (["reina", "sakura", "takumi"].includes(id)) openSpiTest(id);
  else if (id === "asuka" && status === "break") callAsukaForInterview();
  else if (id === "asuka" && status === "idle") openInterviewModal();
  else if (status === "idle" || status === "break") openInstructionModal(id);
  else if (status === "review") openResultModal(id);
  // working: no-op, tile shows progress already
}
officeFloor.addEventListener("click", handleFloorClick);
const breakRoomEl = $("#breakRoom");
if (breakRoomEl) breakRoomEl.addEventListener("click", handleFloorClick);
const breakRoomPageEl = $("#breakRoomPage");
if (breakRoomPageEl) breakRoomPageEl.addEventListener("click", handleFloorClick);

/* ---------------- welfare room / daifugo (local, no API) ---------------- */
const daifugoOverlay = $("#daifugoOverlay");
const gameStaffGrid = $("#gameStaffGrid");
const daifugoSetup = $("#daifugoSetup");
const daifugoGame = $("#daifugoGame");
let selectedGameStaff = [];
let cardGame = null;
let gameBgmEnabled = true;
const GAME_BGM_VIDEO_ID = "BoW3OHT6g0s";
let cpuTurnTimer = null;

function playerPoints(id) {
  return id === "you" ? pointWallet.owner : pointWallet.staff[id] || 0;
}

function collectGameBet(staffIds, bet) {
  const amount = Math.max(1, Math.floor(Number(bet) || 0));
  const participants = ["you", ...staffIds];
  const short = participants.find(id => playerPoints(id) < amount);
  if (short) {
    const name = short === "you" ? "あなた" : STAFF.find(staff => staff.id === short)?.name;
    alert(`${name}のポイントが不足しています。掛けポイントを下げてください。`);
    return null;
  }
  pointWallet.owner -= amount;
  staffIds.forEach(id => { pointWallet.staff[id] -= amount; });
  persistPoints();
  return amount * participants.length;
}

function launchArcadeCelebration(game, winner) {
  if (!winner || game === blackjackGame) return;
  document.querySelector(".arcade-celebration")?.remove();
  const gameName = game?.kind === "beast"
    ? "MONSTER CLASH"
    : game === cardGame
    ? "大富豪"
    : game === jijiGame
      ? "ジジ抜き"
      : game === mahjongGame
        ? "麻雀"
        : "GAME";
  const icons = game?.kind === "beast"
    ? ["⚡", "🔥", "💥", "🪲"]
    : game === mahjongGame ? ["🀄", "🀇", "🀙", "🀐"] : ["♠", "♥", "♣", "♦"];
  const celebration = document.createElement("div");
  celebration.className = `arcade-celebration ${game === mahjongGame ? "mahjong-win" : ""}`;
  celebration.innerHTML = `
    <div class="arcade-win-rays"></div>
    <div class="arcade-win-icons">${Array.from({ length: 28 }, (_, index) =>
      `<i style="--i:${index};--x:${8 + Math.random() * 84}%;--d:${Math.random() * 1.4}s">${icons[index % icons.length]}</i>`
    ).join("")}</div>
    <div class="arcade-win-card">
      <span class="arcade-win-crown">👑</span>
      <small>${gameName} CHAMPION</small>
      <div class="arcade-win-character">${gameCharacterHtml(winner.id)}</div>
      <h2>${winner.name} 優勝！</h2>
      <strong>🪙 ${game.pot} POINT GET!</strong>
      <p>🎉 ✨ 🎊 ✨ 🎉</p>
    </div>`;
  document.body.appendChild(celebration);
  playGameEffect("win");
  requestAnimationFrame(() => celebration.classList.add("show"));
  window.setTimeout(() => {
    celebration.classList.remove("show");
    window.setTimeout(() => celebration.remove(), 450);
  }, 3600);
}

function awardGamePot(game, winner) {
  if (!game || game.potAwarded || !winner) return;
  game.potAwarded = true;
  if (winner.id === "you") pointWallet.owner += game.pot;
  else pointWallet.staff[winner.id] = (pointWallet.staff[winner.id] || 0) + game.pot;
  // 画面には即時反映し、共通台帳には勝利賞金だけを原子的に加算する。
  persistPoints(false);
  fetch("/api/points", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ winnerId: winner.id, amount: game.pot }),
  }).then(async response => {
    const data = await response.json();
    if (!response.ok || !data.points) throw new Error(data.error || "point award failed");
    pointWallet.owner = Math.max(0, Number(data.points.owner || 0));
    pointWallet.lastGrantMonth = data.points.lastGrantMonth || "";
    STAFF.forEach(staff => {
      pointWallet.staff[staff.id] = Math.max(0, Number(data.points.staff?.[staff.id] || 0));
    });
    persistPoints(false);
  }).catch(() => {
    // 通信に失敗した場合だけ従来の全体保存で復旧する。
    persistPoints();
  });
  const currentBalance = Math.floor(playerPoints(winner.id));
  const existingToast = document.querySelector(".point-win-toast");
  if (existingToast) existingToast.remove();
  const toast = document.createElement("div");
  toast.className = "point-win-toast";
  const netGain = Math.max(0, game.pot - Number(game.bet || 0));
  toast.innerHTML = `<b>🪙 賞金 +${game.pot}P</b><span>掛け金 −${Number(game.bet || 0)}P ／ 差引 +${netGain}P<br>${winner.name}の現在残高 ${currentBalance}P</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  window.setTimeout(() => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 300);
  }, 4200);
  const message = `${winner.name}が1位！${game.pot}ポイントをすべて獲得しました！`;
  if (game === cardGame) $("#gameMessage").textContent = message;
  else if (game === jijiGame) $("#jijiMessage").textContent = message;
  addLog("🪙", message);
  launchArcadeCelebration(game, winner);
}

const CARD_SUITS = [
  { mark: "♠", cls: "black" }, { mark: "♥", cls: "red" },
  { mark: "♣", cls: "black" }, { mark: "♦", cls: "red" },
];
const CARD_RANKS = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"]
  .map((label, index) => ({ label, power: index + 3 }));

function gameCharacterHtml(staffId) {
  if (staffId === "you") return `<span class="game-player-face">🙂</span>`;
  const staff = STAFF.find(item => item.id === staffId);
  return staff ? `<span class="game-character">${mascotFigureHTML(staff, "idle")}</span>` : "";
}

let gameWorkNoticeTimer = null;
function showDaifugoWorkNotice(staffId) {
  if (!daifugoOverlay || daifugoOverlay.hidden || !cardGame) return;
  const staff = STAFF.find(item => item.id === staffId);
  if (!staff) return;
  const notice = $("#gameWorkNotice");
  $("#gameWorkNoticeCharacter").innerHTML = gameCharacterHtml(staffId);
  $("#gameWorkNoticeText").textContent = `${staff.name}が「${staff.role}」の作業を完了しました`;
  notice.hidden = false;
  notice.classList.remove("show");
  requestAnimationFrame(() => notice.classList.add("show"));
  clearTimeout(gameWorkNoticeTimer);
  gameWorkNoticeTimer = setTimeout(() => {
    notice.hidden = true;
    notice.classList.remove("show");
  }, 7000);
}

$("#gameWorkNoticeClose").addEventListener("click", () => {
  clearTimeout(gameWorkNoticeTimer);
  $("#gameWorkNotice").hidden = true;
});

function makeDeck() {
  const deck = [];
  CARD_SUITS.forEach(suit => CARD_RANKS.forEach(rank =>
    deck.push({ ...suit, ...rank, id: `${suit.mark}-${rank.label}` })
  ));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function startGameBgm() {
  if (!gameBgmEnabled) return;
  const player = $("#youtubeBgmPlayer");
  if (!player || player.querySelector("iframe")) return;
  player.hidden = false;
  player.innerHTML = `
    <span class="youtube-bgm-label">大富豪BGM</span>
    <iframe
      src="https://www.youtube-nocookie.com/embed/${GAME_BGM_VIDEO_ID}?autoplay=1&loop=1&playlist=${GAME_BGM_VIDEO_ID}&controls=1&rel=0"
      title="大富豪BGM"
      allow="autoplay; encrypted-media"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen></iframe>`;
  $("#gameBgmToggle")?.classList.add("playing");
}

function stopGameBgm() {
  const player = $("#youtubeBgmPlayer");
  if (player) {
    player.innerHTML = "";
    player.hidden = true;
  }
  $("#gameBgmToggle")?.classList.remove("playing");
}

$("#gameBgmToggle").addEventListener("click", () => {
  gameBgmEnabled = !gameBgmEnabled;
  const button = $("#gameBgmToggle");
  button.setAttribute("aria-pressed", String(gameBgmEnabled));
  button.textContent = gameBgmEnabled ? "🎵 BGMオン" : "🔇 BGMオフ";
  if (!gameBgmEnabled) stopGameBgm();
  else if (cardGame && !cardGame.over) startGameBgm();
});

function renderGameStaffSelection() {
  gameStaffGrid.innerHTML = "";
  const restingStaff = STAFF.filter(staff => state[staff.id].status === "break");
  restingStaff.forEach(staff => {
    const selected = selectedGameStaff.includes(staff.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `game-staff-option${selected ? " selected" : ""}`;
    button.dataset.staffId = staff.id;
    button.innerHTML = `
      ${gameCharacterHtml(staff.id)}
      <span><strong>${staff.name}</strong><small>${staff.role}・🪙${Math.floor(pointWallet.staff[staff.id])}P</small></span>
      <i>${selected ? "✓" : "+"}</i>`;
    gameStaffGrid.appendChild(button);
  });
  if (!restingStaff.length) {
    gameStaffGrid.innerHTML = `<p class="no-game-staff">いま休憩中のスタッフはいません。</p>`;
  }
  const startButton = $("#startDaifugoBtn");
  const bet = Math.max(1, Math.floor(Number($("#daifugoBet").value) || 1));
  $("#daifugoPotPreview").textContent = `合計${bet * 4}ポイントを1位が獲得（あなた: ${Math.floor(pointWallet.owner)}P）`;
  const canStart = selectedGameStaff.length === 3
    && playerPoints("you") >= bet
    && selectedGameStaff.every(id => playerPoints(id) >= bet);
  startButton.disabled = !canStart;
  startButton.textContent = canStart
    ? "この3人とゲーム開始"
    : selectedGameStaff.length === 3
      ? "参加者のポイントが不足しています"
    : restingStaff.length < 3
      ? `休憩中のスタッフがあと${3 - restingStaff.length}人必要です`
      : `あと${3 - selectedGameStaff.length}人選んでください`;
}
$("#daifugoBet").addEventListener("input", renderGameStaffSelection);

function openDaifugo() {
  selectedGameStaff = [];
  cardGame = null;
  daifugoSetup.hidden = false;
  daifugoGame.hidden = true;
  renderGameStaffSelection();
  daifugoOverlay.hidden = false;
}
function closeDaifugo() {
  if (cpuTurnTimer) clearTimeout(cpuTurnTimer);
  cpuTurnTimer = null;
  stopGameBgm();
  daifugoOverlay.hidden = true;
}

$("#openDaifugoBtn").addEventListener("click", openDaifugo);
$("#daifugoClose").addEventListener("click", closeDaifugo);
daifugoOverlay.addEventListener("click", e => { if (e.target === daifugoOverlay) closeDaifugo(); });
gameStaffGrid.addEventListener("click", e => {
  const option = e.target.closest(".game-staff-option");
  if (!option) return;
  const id = option.dataset.staffId;
  if (selectedGameStaff.includes(id)) {
    selectedGameStaff = selectedGameStaff.filter(staffId => staffId !== id);
  } else if (selectedGameStaff.length < 3) {
    selectedGameStaff.push(id);
  }
  renderGameStaffSelection();
});

function cardHtml(card, small = false) {
  return `<span class="playing-card ${card.cls}${small ? " small" : ""}" data-card-id="${card.id}">
    <b>${card.label}</b><em>${card.mark}</em>
  </span>`;
}

function startDaifugo() {
  selectedGameStaff = selectedGameStaff.filter(id => state[id].status === "break");
  if (selectedGameStaff.length !== 3) {
    renderGameStaffSelection();
    return;
  }
  const bet = Math.max(1, Math.floor(Number($("#daifugoBet").value) || 1));
  const pot = collectGameBet(selectedGameStaff, bet);
  if (!pot) {
    renderGameStaffSelection();
    return;
  }
  const players = [
    { id: "you", name: "あなた", emoji: "🙂", hand: [] },
    ...selectedGameStaff.map(id => {
      const staff = STAFF.find(item => item.id === id);
      return { id, name: staff.name, emoji: staff.emoji, hand: [] };
    }),
  ];
  makeDeck().forEach((card, index) => players[index % 4].hand.push(card));
  players.forEach(player => player.hand.sort((a, b) => a.power - b.power));
  cardGame = {
    players, current: 0, table: null, lastPlayedBy: null,
    passes: 0, selectedCardIds: [], finished: [], over: false, revolution: false,
    bet, pot, potAwarded: false,
  };
  daifugoSetup.hidden = true;
  daifugoGame.hidden = false;
  $("#gameMessage").textContent = "同じ数字のカードを1枚以上選んでください";
  const greeter = players[1];
  setGameTalk(greeter, "よろしくね！楽しく勝負しよう♪");
  startGameBgm();
  renderDaifugo();
}
$("#startDaifugoBtn").addEventListener("click", startDaifugo);

const GAME_CHAT = {
  play: ["これでどうかな？", "このカードで勝負！", "まだまだこれからだよ♪", "いいカードを出すね！"],
  strong: ["わあ、強いカード！", "それを持ってたんだ！", "むむっ、手強いな〜", "勝負に出たね！"],
  pass: ["ここはパスするね", "次に期待しようっと", "うーん、出せないや", "今回は見送るね"],
  clear: ["場が流れたね！", "仕切り直しだね♪", "次は何を出そうかな？"],
  player: ["いいカードだね！", "おおっ、やるね！", "負けないよ〜！", "その手で来たか〜"],
};

function randomLine(group) {
  const lines = GAME_CHAT[group];
  return lines[Math.floor(Math.random() * lines.length)];
}

function setGameTalk(player, text) {
  const talk = $("#gameTalk");
  if (!talk || !player) return;
  talk.innerHTML = `${gameCharacterHtml(player.id)}<p><strong>${player.name}</strong>${text}</p>`;
  talk.classList.remove("pop");
  requestAnimationFrame(() => talk.classList.add("pop"));
}

function renderDaifugo() {
  if (!cardGame) return;
  const game = cardGame;
  $("#gameOpponents").innerHTML = game.players.slice(1).map(player => `
    <div class="game-opponent ${game.players[game.current]?.id === player.id ? "active" : ""}">
      ${gameCharacterHtml(player.id)}<strong>${player.name}</strong><small>手札 ${player.hand.length}枚</small>
    </div>`).join("");
  const currentPlayer = game.players[game.current];
  $("#gameTurnLabel").textContent = game.over
    ? "ゲーム終了"
    : currentPlayer.id === "you" ? "あなたの番です" : `${currentPlayer.name}の番です`;
  $("#tableCard").innerHTML = game.table
    ? `<span class="table-card-stack">${game.table.cards.map(card => cardHtml(card, true)).join("")}</span>
       <b>${game.table.count}枚出し${game.revolution ? "・革命中" : ""}</b>`
    : `場札なし${game.revolution ? "・革命中（弱い数字が勝ち）" : ""}`;
  $("#playerCardCount").textContent = `${game.players[0].hand.length}枚`;
  $("#playerHand").innerHTML = game.players[0].hand.map(card => {
    const selected = game.selectedCardIds.includes(card.id) ? " selected" : "";
    return cardHtml(card).replace("playing-card ", `playing-card${selected} `);
  }).join("");
  const yourTurn = !game.over && currentPlayer.id === "you";
  const selected = game.players[0].hand.filter(card => game.selectedCardIds.includes(card.id));
  const sameRank = selected.length > 0 && selected.every(card => card.power === selected[0].power);
  const rightCount = !game.table || selected.length === game.table.count;
  const beatsTable = !game.table || (game.revolution
    ? selected[0]?.power < game.table.power
    : selected[0]?.power > game.table.power);
  $("#gamePlayBtn").disabled = !yourTurn || !sameRank || !rightCount || !beatsTable;
  $("#gamePlayBtn").textContent = selected.length ? `${selected.length}枚を出す` : "選んだカードを出す";
  $("#gamePassBtn").disabled = !yourTurn || !game.table;
  if (!game.over && currentPlayer.id !== "you" && !cpuTurnTimer) {
    $("#gameTurnLabel").textContent = `${currentPlayer.name}が考え中…`;
    setGameTalk(currentPlayer, ["うーん…どれにしようかな？", "ちょっと考えるね…", "このカードはまだ取っておこうかな…"][Math.floor(Math.random() * 3)]);
    const thinkingTime = 2000 + Math.random() * 1800;
    cpuTurnTimer = setTimeout(cpuDaifugoTurn, thinkingTime);
  }
}

$("#playerHand").addEventListener("click", e => {
  const card = e.target.closest(".playing-card");
  if (!card || !cardGame || cardGame.players[cardGame.current].id !== "you") return;
  const selectedCard = cardGame.players[0].hand.find(item => item.id === card.dataset.cardId);
  const currentSelection = cardGame.players[0].hand.filter(item => cardGame.selectedCardIds.includes(item.id));
  if (cardGame.selectedCardIds.includes(card.dataset.cardId)) {
    cardGame.selectedCardIds = cardGame.selectedCardIds.filter(id => id !== card.dataset.cardId);
  } else if (!currentSelection.length || currentSelection[0].power === selectedCard?.power) {
    cardGame.selectedCardIds.push(card.dataset.cardId);
  } else {
    cardGame.selectedCardIds = [card.dataset.cardId];
  }
  renderDaifugo();
});

function finishPlayerIfNeeded(player) {
  if (player.hand.length || cardGame.finished.includes(player.id)) return;
  cardGame.finished.push(player.id);
  if (cardGame.finished.length === 1) awardGamePot(cardGame, player);
  const rank = ["大富豪", "富豪", "貧民", "大貧民"][cardGame.finished.length - 1];
  $("#gameMessage").textContent = `${player.name}が${rank}になりました！`;
  if (player.id === "you" || cardGame.finished.length === 3) {
    cardGame.over = true;
    stopGameBgm();
  }
}

function advanceDaifugo() {
  if (cardGame.over) { renderDaifugo(); return; }
  let next = cardGame.current;
  do { next = (next + 1) % cardGame.players.length; }
  while (!cardGame.players[next].hand.length);
  cardGame.current = next;
  renderDaifugo();
}

function playDaifugoCards(playerIndex, cards) {
  const player = cardGame.players[playerIndex];
  const playedIds = new Set(cards.map(card => card.id));
  player.hand = player.hand.filter(item => !playedIds.has(item.id));
  cardGame.table = { cards, power: cards[0].power, count: cards.length };
  cardGame.lastPlayedBy = playerIndex;
  cardGame.passes = 0;
  cardGame.selectedCardIds = [];
  const cardText = cards.map(card => `${card.mark}${card.label}`).join(" ");
  $("#gameMessage").textContent = `${player.name}が ${cardText} を${cards.length}枚出しました`;
  if (player.id === "you") {
    const staffPlayers = cardGame.players.slice(1).filter(item => item.hand.length);
    const reactor = staffPlayers[Math.floor(Math.random() * staffPlayers.length)];
    if (reactor) setGameTalk(reactor, cards[0].power >= 13 || cards.length >= 2 ? randomLine("strong") : randomLine("player"));
  } else {
    setGameTalk(player, cards[0].power >= 13 || cards.length >= 2 ? randomLine("strong") : randomLine("play"));
  }
  if (cards.length === 4) {
    cardGame.revolution = !cardGame.revolution;
    $("#gameMessage").textContent = `⚡ ${player.name}が革命！強さが逆転しました！`;
    playGameEffect("win");
  }
  finishPlayerIfNeeded(player);
  if (cards[0].label === "8" && !cardGame.over) {
    cardGame.table = null;
    cardGame.passes = 0;
    $("#gameMessage").textContent = `💥 8切り！${player.name}が場を流しました`;
    playGameEffect("win");
    if (player.hand.length) {
      cardGame.current = playerIndex;
      renderDaifugo();
      return;
    }
  }
  advanceDaifugo();
}

$("#gamePlayBtn").addEventListener("click", () => {
  if (!cardGame) return;
  const cards = cardGame.players[0].hand.filter(item => cardGame.selectedCardIds.includes(item.id));
  const sameRank = cards.length && cards.every(card => card.power === cards[0].power);
  const rightCount = !cardGame.table || cards.length === cardGame.table.count;
  const beats = !cardGame.table || (cardGame.revolution
    ? cards[0].power < cardGame.table.power
    : cards[0].power > cardGame.table.power);
  if (sameRank && rightCount && beats) playDaifugoCards(0, cards);
});

function passDaifugo(playerIndex) {
  const player = cardGame.players[playerIndex];
  cardGame.passes += 1;
  $("#gameMessage").textContent = `${player.name}はパスしました`;
  if (player.id !== "you") setGameTalk(player, randomLine("pass"));
  const activeCount = cardGame.players.filter(item => item.hand.length).length;
  if (cardGame.passes >= activeCount - 1) {
    const leader = cardGame.lastPlayedBy;
    cardGame.table = null;
    cardGame.passes = 0;
    if (leader != null && cardGame.players[leader].hand.length) cardGame.current = leader;
    $("#gameMessage").textContent = "場が流れました";
    const speaker = cardGame.players.find(item => item.hand.length && item.id !== "you");
    setGameTalk(speaker, randomLine("clear"));
    renderDaifugo();
    return;
  }
  advanceDaifugo();
}
$("#gamePassBtn").addEventListener("click", () => passDaifugo(0));

function cpuDaifugoTurn() {
  cpuTurnTimer = null;
  if (!cardGame || cardGame.over) return;
  const index = cardGame.current;
  const player = cardGame.players[index];
  if (player.id === "you") return;
  const groups = [...new Set(player.hand.map(card => card.power))]
    .map(power => player.hand.filter(card => card.power === power))
    .sort((a, b) => cardGame.revolution ? b[0].power - a[0].power : a[0].power - b[0].power);
  const neededCount = cardGame.table?.count || 0;
  const valid = groups.find(group => {
    if (neededCount && group.length < neededCount) return false;
    if (!cardGame.table) return true;
    return cardGame.revolution
      ? group[0].power < cardGame.table.power
      : group[0].power > cardGame.table.power;
  });
  if (valid) {
    const playCount = neededCount || Math.min(valid.length, 4);
    playDaifugoCards(index, valid.slice(0, playCount));
  }
  else passDaifugo(index);
}

$("#gameRestartBtn").addEventListener("click", () => {
  if (cpuTurnTimer) clearTimeout(cpuTurnTimer);
  cpuTurnTimer = null;
  stopGameBgm();
  cardGame = null;
  selectedGameStaff = [];
  daifugoGame.hidden = true;
  daifugoSetup.hidden = false;
  renderGameStaffSelection();
});

/* ---------------- jiji-nuki ---------------- */
const jijiOverlay = $("#jijiOverlay");
const jijiStaffGrid = $("#jijiStaffGrid");
const jijiSetup = $("#jijiSetup");
const jijiGameEl = $("#jijiGame");
let selectedJijiStaff = [];
let jijiGame = null;
let jijiCpuTimer = null;
let jijiBgmEnabled = true;
const JIJI_BGM_VIDEO_ID = "tJcp_xtzCcI";

function startJijiBgm() {
  if (!jijiBgmEnabled) return;
  const player = $("#jijiYoutubePlayer");
  if (!player || player.querySelector("iframe")) return;
  player.hidden = false;
  player.innerHTML = `<span class="youtube-bgm-label">ジジ抜きBGM</span>
    <iframe src="https://www.youtube-nocookie.com/embed/${JIJI_BGM_VIDEO_ID}?autoplay=1&loop=1&playlist=${JIJI_BGM_VIDEO_ID}&controls=1&rel=0"
      title="ジジ抜きBGM" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  $("#jijiBgmToggle").classList.add("playing");
}
function stopJijiBgm() {
  const player = $("#jijiYoutubePlayer");
  player.innerHTML = "";
  player.hidden = true;
  $("#jijiBgmToggle").classList.remove("playing");
}
$("#jijiBgmToggle").addEventListener("click", () => {
  jijiBgmEnabled = !jijiBgmEnabled;
  const button = $("#jijiBgmToggle");
  button.setAttribute("aria-pressed", String(jijiBgmEnabled));
  button.textContent = jijiBgmEnabled ? "🎵 BGMオン" : "🔇 BGMオフ";
  if (jijiBgmEnabled && jijiGame && !jijiGame.over) startJijiBgm();
  else stopJijiBgm();
});

function renderJijiStaffSelection() {
  const resting = STAFF.filter(staff => state[staff.id].status === "break");
  jijiStaffGrid.innerHTML = resting.map(staff => {
    const selected = selectedJijiStaff.includes(staff.id);
    return `<button type="button" class="game-staff-option${selected ? " selected" : ""}" data-staff-id="${staff.id}">
      ${gameCharacterHtml(staff.id)}
      <span><strong>${staff.name}</strong><small>${staff.role}・🪙${Math.floor(pointWallet.staff[staff.id])}P</small></span><i>${selected ? "✓" : "+"}</i>
    </button>`;
  }).join("") || `<p class="no-game-staff">いま休憩中のスタッフはいません。</p>`;
  const start = $("#startJijiBtn");
  const bet = Math.max(1, Math.floor(Number($("#jijiBet").value) || 1));
  $("#jijiPotPreview").textContent = `合計${bet * 4}ポイントを1位が獲得（あなた: ${Math.floor(pointWallet.owner)}P）`;
  start.disabled = selectedJijiStaff.length !== 3
    || playerPoints("you") < bet
    || selectedJijiStaff.some(id => playerPoints(id) < bet);
  const funded = playerPoints("you") >= bet && selectedJijiStaff.every(id => playerPoints(id) >= bet);
  start.textContent = selectedJijiStaff.length === 3 && funded
    ? "この3人とゲーム開始"
    : selectedJijiStaff.length === 3
      ? "参加者のポイントが不足しています"
    : resting.length < 3 ? `休憩中のスタッフがあと${3 - resting.length}人必要です`
      : `あと${3 - selectedJijiStaff.length}人選んでください`;
}
$("#jijiBet").addEventListener("input", renderJijiStaffSelection);

function openJiji() {
  selectedJijiStaff = [];
  jijiGame = null;
  jijiSetup.hidden = false;
  jijiGameEl.hidden = true;
  $("#escapeCelebration").hidden = true;
  renderJijiStaffSelection();
  jijiOverlay.hidden = false;
}
function closeJiji() {
  clearTimeout(jijiCpuTimer);
  jijiCpuTimer = null;
  stopJijiBgm();
  jijiOverlay.hidden = true;
}
$("#openJijiBtn").addEventListener("click", openJiji);
$("#jijiClose").addEventListener("click", closeJiji);
jijiOverlay.addEventListener("click", e => { if (e.target === jijiOverlay) closeJiji(); });
jijiStaffGrid.addEventListener("click", e => {
  const option = e.target.closest(".game-staff-option");
  if (!option) return;
  const id = option.dataset.staffId;
  if (selectedJijiStaff.includes(id)) selectedJijiStaff = selectedJijiStaff.filter(item => item !== id);
  else if (selectedJijiStaff.length < 3) selectedJijiStaff.push(id);
  renderJijiStaffSelection();
});

function removeJijiPairs(hand) {
  const remaining = [...hand];
  const discarded = [];
  CARD_RANKS.forEach(rank => {
    let matching = remaining.filter(card => card.label === rank.label);
    while (matching.length >= 2) {
      const first = matching.shift();
      const second = matching.shift();
      remaining.splice(remaining.findIndex(card => card.id === first.id), 1);
      remaining.splice(remaining.findIndex(card => card.id === second.id), 1);
      discarded.push(first, second);
      matching = remaining.filter(card => card.label === rank.label);
    }
  });
  return { remaining, discarded };
}

function startJijiGame() {
  selectedJijiStaff = selectedJijiStaff.filter(id => state[id].status === "break");
  if (selectedJijiStaff.length !== 3) { renderJijiStaffSelection(); return; }
  const bet = Math.max(1, Math.floor(Number($("#jijiBet").value) || 1));
  const pot = collectGameBet(selectedJijiStaff, bet);
  if (!pot) { renderJijiStaffSelection(); return; }
  const deck = makeDeck();
  const hiddenJiji = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
  const players = [
    { id: "you", name: "あなた", hand: [], escaped: false },
    ...selectedJijiStaff.map(id => ({ id, name: STAFF.find(staff => staff.id === id).name, hand: [], escaped: false })),
  ];
  deck.forEach((card, index) => players[index % players.length].hand.push(card));
  players.forEach(player => {
    player.hand = removeJijiPairs(player.hand).remaining.sort((a, b) => a.power - b.power);
  });
  jijiGame = { players, hiddenJiji, current: 0, escaped: [], over: false, bet, pot, potAwarded: false };
  players.forEach(player => {
    if (!player.hand.length) {
      player.escaped = true;
      jijiGame.escaped.push(player.id);
    }
  });
  if (players[0].escaped) jijiGame.current = players.findIndex(player => !player.escaped);
  if (jijiGame.escaped.length) {
    awardGamePot(jijiGame, players.find(player => player.id === jijiGame.escaped[0]));
  }
  jijiSetup.hidden = true;
  jijiGameEl.hidden = false;
  $("#jijiSecretText").textContent = "ゲーム終了まで秘密";
  $("#jijiMessage").textContent = "同じ数字のペアは最初に捨てました";
  startJijiBgm();
  renderJijiGame();
}
$("#startJijiBtn").addEventListener("click", startJijiGame);

function activeJijiPlayers() {
  return jijiGame.players.filter(player => !player.escaped);
}
function nextJijiPlayerIndex(fromIndex) {
  let next = fromIndex;
  do { next = (next + 1) % jijiGame.players.length; }
  while (jijiGame.players[next].escaped);
  return next;
}
function jijiTalk(player, text) {
  $("#jijiTalk").innerHTML = `${gameCharacterHtml(player.id)}<p><strong>${player.name}</strong>${text}</p>`;
  $("#jijiTalk").classList.remove("pop");
  requestAnimationFrame(() => $("#jijiTalk").classList.add("pop"));
}

function renderJijiGame() {
  if (!jijiGame) return;
  const game = jijiGame;
  const current = game.players[game.current];
  $("#jijiOpponents").innerHTML = game.players.slice(1).map(player => `
    <div class="game-opponent ${current.id === player.id && !game.over ? "active" : ""} ${player.escaped ? "escaped" : ""}">
      ${gameCharacterHtml(player.id)}<strong>${player.name}</strong>
      <small>${player.escaped ? "あがり！" : `手札 ${player.hand.length}枚`}</small>
    </div>`).join("");
  $("#jijiPlayerCount").textContent = `${game.players[0].hand.length}枚`;
  $("#jijiPlayerHand").innerHTML = game.players[0].hand.map(card => cardHtml(card)).join("");
  $("#jijiTurnLabel").textContent = game.over ? "ゲーム終了" :
    current.id === "you" ? "あなたの番です。相手のカードを1枚引いてください" : `${current.name}が考え中…`;

  const drawArea = $("#jijiDrawArea");
  drawArea.innerHTML = "";
  if (!game.over && current.id === "you") {
    const targetIndex = nextJijiPlayerIndex(game.current);
    const target = game.players[targetIndex];
    drawArea.innerHTML = `<span class="draw-guide">${target.name}の手札から選ぶ</span>
      <div class="card-back-row">${target.hand.map((_, index) =>
        `<button type="button" class="card-back" data-draw-index="${index}" aria-label="${index + 1}枚目を引く">?</button>`
      ).join("")}</div>`;
  } else if (!game.over && !jijiCpuTimer) {
    jijiTalk(current, ["どれを引こうかな…", "ジジじゃありませんように…", "この辺があやしいかも…"][Math.floor(Math.random() * 3)]);
    jijiCpuTimer = setTimeout(cpuJijiDraw, 2200 + Math.random() * 1800);
  }
}

$("#jijiDrawArea").addEventListener("click", e => {
  const back = e.target.closest(".card-back");
  if (!back || !jijiGame || jijiGame.players[jijiGame.current].id !== "you") return;
  const targetIndex = nextJijiPlayerIndex(jijiGame.current);
  performJijiDraw(jijiGame.current, targetIndex, Number(back.dataset.drawIndex));
});

function showEscapeCelebration(player, rank) {
  const overlay = $("#escapeCelebration");
  $("#escapeCharacter").innerHTML = gameCharacterHtml(player.id);
  const isLoser = rank === "ジジ";
  $("#escapeTitle").textContent = isLoser ? `${player.name}がジジでした！` : `${player.name}、${rank}番抜け！`;
  $("#escapeText").textContent = isLoser
    ? "最後まで残ったカードがジジ！次はリベンジしよう"
    : rank === 1 ? "一番乗り！やったね！" : "ジジを持たずに無事脱出！";
  overlay.hidden = false;
  overlay.classList.remove("show");
  requestAnimationFrame(() => overlay.classList.add("show"));
  setTimeout(() => { overlay.hidden = true; overlay.classList.remove("show"); }, 2300);
}

function finishJijiIfNeeded(player) {
  if (player.hand.length || player.escaped) return;
  player.escaped = true;
  jijiGame.escaped.push(player.id);
  if (jijiGame.escaped.length === 1) awardGamePot(jijiGame, player);
  showEscapeCelebration(player, jijiGame.escaped.length);
  jijiTalk(player, "やったー！先に抜けたよ！");
}

function endJijiGameIfNeeded() {
  const active = activeJijiPlayers();
  if (active.length > 1) return false;
  const loser = active[0];
  jijiGame.over = true;
  stopJijiBgm();
  $("#jijiSecretText").textContent = `${jijiGame.hiddenJiji.mark}${jijiGame.hiddenJiji.label} でした！`;
  $("#jijiMessage").textContent = `${loser.name}がジジを持っていました！`;
  jijiTalk(loser, "まさか最後まで持っていたなんて〜！");
  showEscapeCelebration(loser, "ジジ");
  renderJijiGame();
  return true;
}

function performJijiDraw(playerIndex, targetIndex, cardIndex) {
  const player = jijiGame.players[playerIndex];
  const target = jijiGame.players[targetIndex];
  const [drawn] = target.hand.splice(cardIndex, 1);
  player.hand.push(drawn);
  const pairedCard = player.hand.find(card => card.id !== drawn.id && card.label === drawn.label);
  if (pairedCard) {
    player.hand = player.hand.filter(card => card.id !== drawn.id && card.id !== pairedCard.id);
    $("#jijiMessage").textContent = `${player.name}が ${drawn.label} のペアを捨てました！`;
    jijiTalk(player, "ペアがそろった！よかった〜♪");
  } else {
    player.hand.sort((a, b) => a.power - b.power);
    $("#jijiMessage").textContent = `${player.name}がカードを1枚引きました`;
    jijiTalk(player, "これはペアにならないみたい…");
  }
  finishJijiIfNeeded(target);
  finishJijiIfNeeded(player);
  if (endJijiGameIfNeeded()) return;
  jijiGame.current = nextJijiPlayerIndex(playerIndex);
  setTimeout(renderJijiGame, 500);
}

function cpuJijiDraw() {
  jijiCpuTimer = null;
  if (!jijiGame || jijiGame.over) return;
  const playerIndex = jijiGame.current;
  if (jijiGame.players[playerIndex].id === "you") return;
  const targetIndex = nextJijiPlayerIndex(playerIndex);
  const target = jijiGame.players[targetIndex];
  performJijiDraw(playerIndex, targetIndex, Math.floor(Math.random() * target.hand.length));
}

$("#jijiRestartBtn").addEventListener("click", () => {
  clearTimeout(jijiCpuTimer);
  jijiCpuTimer = null;
  stopJijiBgm();
  jijiGame = null;
  selectedJijiStaff = [];
  jijiGameEl.hidden = true;
  jijiSetup.hidden = false;
  renderJijiStaffSelection();
});

/* ---------------- blackjack / mahjong ---------------- */
const BLACKJACK_BGM_ID = "KFpYXZrBuSQ";
let blackjackGame = null;
let selectedBlackjackStaff = [];
let mahjongGame = null;

function playGameEffect(kind = "click") {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const notes = kind === "win" ? [523, 659, 784, 1047] : kind === "lose" ? [330, 247, 196] : [520];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = kind === "win" ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.001, context.currentTime + index * .11);
      gain.gain.exponentialRampToValueAtTime(.16, context.currentTime + index * .11 + .02);
      gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + index * .11 + .18);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + index * .11);
      oscillator.stop(context.currentTime + index * .11 + .2);
    });
  } catch { /* Web Audio unavailable */ }
}

function setGameYoutubePlayer(elementId, videoId, label) {
  const player = document.getElementById(elementId);
  player.hidden = false;
  player.innerHTML = `<span class="youtube-bgm-label">${label}</span><iframe
    src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=1&rel=0"
    title="${label}" allow="autoplay; encrypted-media"></iframe>`;
}
function clearGameYoutubePlayer(elementId) {
  const player = document.getElementById(elementId);
  player.innerHTML = "";
  player.hidden = true;
}

function blackjackValue(hand) {
  let total = hand.reduce((sum, card) => sum + (card.power === 14 ? 11 : card.power >= 11 ? 10 : card.power), 0);
  let aces = hand.filter(card => card.label === "A").length;
  while (total > 21 && aces--) total -= 10;
  return total;
}

function renderBlackjack() {
  if (!blackjackGame) return;
  const game = blackjackGame;
  $("#blackjackDealerName").textContent = `${game.dealer.name}（ディーラー）`;
  const dealerCharacter = $("#blackjackDealerCharacter");
  if (dealerCharacter && dealerCharacter.dataset.staffId !== game.dealer.id) {
    dealerCharacter.innerHTML = gameCharacterHtml(game.dealer.id);
    dealerCharacter.dataset.staffId = game.dealer.id;
  }
  $("#dealerHand").innerHTML = game.dealerHand.map((card, index) => {
    const dealerIsRevealed = game.staffHands[0]?.revealed;
    if (!game.finished && !dealerIsRevealed && index >= game.dealerRevealCount) return '<span class="card-back-dealing" aria-label="裏向きのカード"></span>';
    return !game.finished && !dealerIsRevealed && index === 1 ? '<span class="playing-card black"><b>?</b><em>♠</em></span>' : cardHtml(card);
  }).join("");
  $("#blackjackPlayerHand").innerHTML = game.playerHand.map((card, index) =>
    (!game.showdown || game.selfShowdownRevealed) && index < game.playerRevealCount
      ? cardHtml(card)
      : '<span class="card-back-dealing" aria-label="裏向きのカード"></span>'
  ).join("");
  $("#dealerScore").textContent = game.finished || game.staffHands[0]?.revealed ? `${blackjackValue(game.dealerHand)}` : "?";
  $("#playerScore").textContent = game.showdown && !game.selfShowdownRevealed
    ? "最後に公開"
    : game.dealing ? "配札中…" : `${blackjackValue(game.playerHand)}`;
  $("#blackjackPot").textContent = `POT 🪙 ${game.pot}P`;
  $("#blackjackPlayersStrip").innerHTML = game.staffHands.map(player => `
    <div class="blackjack-player-chip${player.revealed ? " revealed" : ""}">
      ${gameCharacterHtml(player.id)}
      <div class="bj-chip-info"><strong>${player.name}</strong><small>${player.revealed || game.finished ? `${blackjackValue(player.hand)}点` : `伏せ札 ${player.hand.length}枚`}</small>
      <div class="bj-chip-hand">${player.revealed || game.finished
        ? player.hand.map(card => cardHtml(card, true)).join("")
        : player.hand.map(() => '<i class="bj-mini-back"></i>').join("")}</div></div>
    </div>`).join("");
}

function showBlackjackStageFlash(message, kind = "") {
  const flash = $("#blackjackStageFlash");
  const table = $("#blackjackTable");
  if (!flash || !table) return;
  flash.className = `blackjack-stage-flash ${kind}`.trim();
  flash.textContent = message;
  flash.hidden = false;
  table.classList.remove("card-impact");
  void table.offsetWidth;
  table.classList.add("card-impact");
  window.setTimeout(() => {
    flash.hidden = true;
    table.classList.remove("card-impact");
  }, 1600);
}

function launchBlackjackCelebration(message) {
  const celebration = $("#blackjackCelebration");
  const particles = $("#blackjackParticles");
  const modal = document.querySelector(".blackjack-modal");
  const messageEl = $("#blackjackCelebrateText");
  if (!celebration || !particles || !messageEl) return;

  const colors = ["#ffd54a", "#ff3d81", "#54e8ff", "#9d5cff", "#ffffff", "#63ff8c"];
  messageEl.textContent = message;
  particles.innerHTML = "";
  for (let index = 0; index < 120; index += 1) {
    const particle = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 190 + Math.random() * 520;
    particle.className = "bj-particle";
    particle.style.setProperty("--pc", colors[index % colors.length]);
    particle.style.setProperty("--px", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--py", `${Math.sin(angle) * distance + 90}px`);
    particle.style.setProperty("--pd", `${1.35 + Math.random() * 1.15}s`);
    particles.appendChild(particle);
  }

  celebration.hidden = false;
  modal?.classList.remove("shake-win");
  void modal?.offsetWidth;
  modal?.classList.add("shake-win");
  window.setTimeout(() => {
    celebration.hidden = true;
    particles.innerHTML = "";
    modal?.classList.remove("shake-win");
  }, 3200);
}

function finalizeBlackjackResult() {
  const game = blackjackGame;
  if (!game) return;
  game.finished = true;
  game.showdown = false;
  const playerScore = blackjackValue(game.playerHand);
  const contenders = [
    { id: "you", name: "あなた", hand: game.playerHand },
    ...game.staffHands,
  ].filter(player => blackjackValue(player.hand) <= 21);
  contenders.sort((a, b) =>
    blackjackValue(b.hand) - blackjackValue(a.hand)
    || a.hand.length - b.hand.length
    || Math.random() - .5
  );
  const winner = contenders[0] || game.staffHands[Math.floor(Math.random() * game.staffHands.length)];
  let result = "";
  if (winner.id === "you") {
    awardGamePot(game, { id: "you", name: "あなた" });
    result = `あなたの勝利！${game.pot}ポイント獲得！`;
    playGameEffect("win");
  } else {
    awardGamePot(game, winner);
    result = `${winner.name}の勝利！${game.pot}ポイント獲得`;
    playGameEffect("lose");
  }
  launchBlackjackCelebration(result);
  $("#blackjackMessage").textContent = result;
  $("#blackjackControlHint").textContent = "ゲーム終了：もう一回か終了を選んでください";
  $("#blackjackHit").textContent = "もう一回遊ぶ";
  $("#blackjackStand").textContent = "終了して休憩室へ戻る";
  $("#blackjackHit").disabled = false;
  $("#blackjackStand").disabled = false;
  renderBlackjack();
}

function finishBlackjack() {
  const game = blackjackGame;
  if (!game || game.finished || game.resolving) return;
  game.resolving = true;
  game.showdown = true;
  game.selfShowdownRevealed = false;
  game.staffHands.forEach(player => {
    while (blackjackValue(player.hand) < 17) player.hand.push(game.deck.pop());
    player.revealed = false;
  });
  game.dealerHand = game.staffHands[0].hand;
  $("#blackjackHit").disabled = true;
  $("#blackjackStand").disabled = true;
  $("#blackjackHit").textContent = "ヒット";
  $("#blackjackStand").textContent = "スタンド";
  $("#blackjackMessage").textContent = "スタッフの手札から順番に公開します…";
  renderBlackjack();

  game.staffHands.forEach((player, index) => {
    window.setTimeout(() => {
      if (blackjackGame !== game) return;
      player.revealed = true;
      renderBlackjack();
      showBlackjackStageFlash(`${player.name}\n${blackjackValue(player.hand)}点`, "judge");
      $("#blackjackMessage").textContent = `${player.name}の手札を公開！ ${blackjackValue(player.hand)}点`;
      playGameEffect();
    }, 700 + index * 1450);
  });

  const selfRevealDelay = 900 + game.staffHands.length * 1450;
  window.setTimeout(() => {
    if (blackjackGame !== game) return;
    game.selfShowdownRevealed = true;
    renderBlackjack();
    showBlackjackStageFlash(`最後はあなた\n${blackjackValue(game.playerHand)}点`, "hit");
    $("#blackjackMessage").textContent = `あなたの手札を公開！ ${blackjackValue(game.playerHand)}点`;
    playGameEffect();
  }, selfRevealDelay);
  window.setTimeout(() => {
    if (blackjackGame !== game) return;
    finalizeBlackjackResult();
  }, selfRevealDelay + 1450);
}

function renderBlackjackStaffSelection() {
  const grid = $("#blackjackStaffGrid");
  const bet = Math.max(1, Math.floor(Number($("#blackjackBet").value) || 1));
  const restingStaff = STAFF.filter(staff => state[staff.id].status === "break");
  grid.innerHTML = restingStaff.length ? restingStaff.map(staff => {
    const selected = selectedBlackjackStaff.includes(staff.id);
    return `<button type="button" class="game-staff-option${selected ? " selected" : ""}" data-staff-id="${staff.id}">
      ${gameCharacterHtml(staff.id)}
      <span><strong>${staff.name}</strong><small>${staff.role}・🪙${Math.floor(playerPoints(staff.id))}P</small></span>
      <i>${selected ? "✓" : "+"}</i>
    </button>`;
  }).join("") : `<p class="no-game-staff">いま休憩中のスタッフはいません。</p>`;

  const selected = selectedBlackjackStaff.map(id => STAFF.find(staff => staff.id === id)).filter(Boolean);
  const allCanPay = pointWallet.owner >= bet && selected.every(staff => playerPoints(staff.id) >= bet);
  $("#blackjackDealerInfo").textContent = selected.length
    ? `${selected.map(staff => staff.name).join("・")}が参加します`
    : "参加スタッフを1人以上選んでください";
  $("#blackjackBetInfo").textContent = `あなたの所持 ${Math.floor(pointWallet.owner)}P ／ ${selected.length + 1}人の賞金総額 ${bet * (selected.length + 1)}P`;
  $("#startBlackjackBtn").disabled = !selected.length || !allCanPay;
  $("#startBlackjackBtn").textContent = !selected.length
    ? "参加スタッフを選んでください"
    : allCanPay ? `${selected.length + 1}人でゲーム開始` : "参加者のポイントが不足しています";
}

function openBlackjack() {
  const overlay = $("#blackjackOverlay");
  overlay.style.removeProperty("display");
  overlay.classList.remove("blackjack-force-closed");
  selectedBlackjackStaff = selectedBlackjackStaff.filter(id => state[id].status === "break");
  renderBlackjackStaffSelection();
  $("#blackjackSetup").hidden = false;
  $("#blackjackGame").hidden = true;
  overlay.hidden = false;
}
$("#openBlackjackBtn").addEventListener("click", openBlackjack);
$("#blackjackBet").addEventListener("input", renderBlackjackStaffSelection);
$("#blackjackStaffGrid").addEventListener("click", event => {
  const option = event.target.closest(".game-staff-option");
  if (!option) return;
  const id = option.dataset.staffId;
  if (selectedBlackjackStaff.includes(id)) {
    selectedBlackjackStaff = selectedBlackjackStaff.filter(staffId => staffId !== id);
  } else if (selectedBlackjackStaff.length < 4) {
    selectedBlackjackStaff.push(id);
  }
  renderBlackjackStaffSelection();
});
function closeBlackjackSession() {
  const overlay = $("#blackjackOverlay");
  clearGameYoutubePlayer("blackjackYoutubePlayer");
  blackjackGame = null;
  $("#blackjackCelebration").hidden = true;
  $("#blackjackParticles").innerHTML = "";
  $("#blackjackStageFlash").hidden = true;
  $("#blackjackTable").classList.remove("judging", "card-impact");
  $("#blackjackGame").hidden = true;
  $("#blackjackSetup").hidden = false;
  $("#blackjackControlHint").textContent = "ゲームは終了しました";
  $("#blackjackMessage").textContent = "ゲームは終了しました";
  $("#blackjackHit").textContent = "ヒット";
  $("#blackjackStand").textContent = "スタンド";
  $("#blackjackHit").disabled = true;
  $("#blackjackStand").disabled = true;
  overlay.hidden = true;
  overlay.classList.add("blackjack-force-closed");
  overlay.style.display = "none";
}
$("#blackjackClose").addEventListener("click", closeBlackjackSession);
$("#blackjackEnd").addEventListener("click", event => {
  event.preventDefault();
  event.stopPropagation();
  closeBlackjackSession();
});
$("#blackjackOverlay").addEventListener("click", event => {
  if (event.target === $("#blackjackOverlay")) closeBlackjackSession();
});
$("#startBlackjackBtn").addEventListener("click", () => {
  const bet = Math.max(1, Math.floor(Number($("#blackjackBet").value) || 1));
  selectedBlackjackStaff = selectedBlackjackStaff.filter(id => state[id].status === "break");
  if (!selectedBlackjackStaff.length) return openBlackjack();
  const pot = collectGameBet(selectedBlackjackStaff, bet);
  if (!pot) return openBlackjack();
  const deck = makeDeck().sort(() => Math.random() - .5);
  const staffHands = selectedBlackjackStaff.map(id => {
    const staff = STAFF.find(item => item.id === id);
    return { id, name: staff.name, hand: [deck.pop(), deck.pop()] };
  });
  blackjackGame = {
    dealer: STAFF.find(item => item.id === selectedBlackjackStaff[0]),
    staffHands, bet, pot, potAwarded: false, deck,
    playerHand: [deck.pop(), deck.pop()],
    dealerHand: staffHands[0].hand,
    finished: false, dealing: true, playerRevealCount: 0, dealerRevealCount: 0,
  };
  $("#blackjackSetup").hidden = true;
  $("#blackjackGame").hidden = false;
  $("#blackjackHit").disabled = true;
  $("#blackjackStand").disabled = true;
  $("#blackjackHit").textContent = "ヒット";
  $("#blackjackStand").textContent = "スタンド";
  $("#blackjackControlHint").textContent = "配札中です。カードの公開をお待ちください";
  $("#blackjackMessage").textContent = "カードを配っています…";
  setGameYoutubePlayer("blackjackYoutubePlayer", BLACKJACK_BGM_ID, "ブラックジャックBGM");
  playGameEffect();
  renderBlackjack();
  showBlackjackStageFlash(`🪙 ${pot}P\nDEAL！`);
  const dealingGame = blackjackGame;
  const dealSteps = [
    () => { dealingGame.playerRevealCount = 1; $("#blackjackMessage").textContent = "あなたへ1枚目…"; },
    () => { dealingGame.dealerRevealCount = 1; $("#blackjackMessage").textContent = `${dealingGame.dealer.name}へ1枚目…`; },
    () => { dealingGame.playerRevealCount = 2; $("#blackjackMessage").textContent = "あなたへ2枚目…"; },
    () => { dealingGame.dealerRevealCount = 2; $("#blackjackMessage").textContent = "ディーラーの伏せ札をセット…"; },
  ];
  dealSteps.forEach((step, index) => {
    window.setTimeout(() => {
      if (blackjackGame !== dealingGame) return;
      step();
      playGameEffect();
      renderBlackjack();
      if (index === dealSteps.length - 1) {
        dealingGame.dealing = false;
        $("#blackjackHit").disabled = false;
        $("#blackjackStand").disabled = false;
        $("#blackjackControlHint").textContent = "操作できます：ヒットまたはスタンドを選択";
        $("#blackjackMessage").textContent = "ヒットかスタンドを選んでください";
        renderBlackjack();
      }
    }, 1100 + index * 1350);
  });
});
$("#blackjackHit").addEventListener("click", () => {
  if (!blackjackGame) return;
  if (blackjackGame.finished) {
    $("#blackjackRestart").click();
    return;
  }
  if (blackjackGame.dealing) return;
  blackjackGame.playerHand.push(blackjackGame.deck.pop());
  blackjackGame.dealing = true;
  $("#blackjackHit").disabled = true;
  $("#blackjackStand").disabled = true;
  $("#blackjackControlHint").textContent = "追加カードをめくっています…";
  renderBlackjack();
  $("#blackjackMessage").textContent = "カードを1枚引いています…";
  window.setTimeout(() => {
    if (!blackjackGame) return;
    blackjackGame.playerRevealCount = blackjackGame.playerHand.length;
    blackjackGame.dealing = false;
    playGameEffect();
    renderBlackjack();
    const score = blackjackValue(blackjackGame.playerHand);
    showBlackjackStageFlash(score === 21 ? "⚡ 21！" : score > 21 ? "💥 BUST！" : `🃏 HIT！ ${score}`, "hit");
    if (score >= 21) window.setTimeout(finishBlackjack, 850);
    else {
      $("#blackjackHit").disabled = false;
      $("#blackjackStand").disabled = false;
      $("#blackjackControlHint").textContent = "操作できます：ヒットまたはスタンドを選択";
    }
  }, 1450);
});
$("#blackjackStand").addEventListener("click", () => {
  if (!blackjackGame) return;
  if (blackjackGame.finished) {
    closeBlackjackSession();
    return;
  }
  if (blackjackGame.dealing) return;
  $("#blackjackHit").disabled = true;
  $("#blackjackStand").disabled = true;
  $("#blackjackControlHint").textContent = "スタンドしました。全員の手札を公開します";
  $("#blackjackMessage").textContent = "全員のカードを公開中…";
  $("#blackjackTable").classList.add("judging");
  showBlackjackStageFlash("運命の\nSHOWDOWN", "judge");
  window.setTimeout(() => {
    $("#blackjackTable").classList.remove("judging");
    finishBlackjack();
  }, 1250);
});
$("#blackjackRestart").addEventListener("click", () => {
  clearGameYoutubePlayer("blackjackYoutubePlayer");
  blackjackGame = null;
  openBlackjack();
});

const MAHJONG_TILES = ["🀇","🀈","🀉","🀊","🀋","🀌","🀍","🀎","🀏","🀙","🀚","🀛","🀜","🀝","🀞","🀟","🀠","🀡","🀐","🀑","🀒","🀓","🀔","🀕","🀖","🀗","🀘","🀀","🀁","🀂","🀃","🀄","🀅","🀆"];
let mahjongTurnTimer = null;

function renderMahjongRound(callText = "") {
  if (!mahjongGame) return;
  const game = mahjongGame;
  const playersHtml = game.players.map((player, index) => {
    const tilesHtml = player.hand.map((tile, tileIndex) => {
      const drawn = tileIndex === player.hand.length - 1 && game.drawnBy === player.id;
      return `<span class="mahjong-tile${drawn ? " drawn" : ""}">${tile}</span>`;
    }).join("");
    const meldsText = player.melds.length
      ? `鳴き ${player.melds.map(meld => meld.join("")).join(" ")}`
      : "門前";
    const statusText = game.over
      ? `<span class="mahjong-score">${player.score}点</span>`
      : `${player.discards.length}枚捨て・${player.hand.length}枚`;
    return `<div class="mahjong-player${game.current === index && !game.over ? " current" : ""}" data-mahjong-id="${player.id}">
      <strong>${player.name}</strong><div class="mahjong-tiles">${tilesHtml}</div>
      <div class="mahjong-melds">${meldsText}</div><small>${statusText}</small>
    </div>`;
  }).join("");
  $("#mahjongTable").innerHTML = `${playersHtml}
    <div class="mahjong-river"><strong>捨て牌 ／ 牌山 ${game.wall.length}枚</strong><span>${game.river.slice(-18).join("") || "対局開始"}</span></div>
    ${callText ? `<div class="mahjong-call">${callText}</div>` : ""}`;
}

function finishMahjongRound() {
  if (!mahjongGame || mahjongGame.over) return;
  const game = mahjongGame;
  game.over = true;
  game.players.forEach(player => {
    const pairs = player.hand.reduce((count, tile, index, hand) =>
      count + (hand.indexOf(tile) === index && hand.filter(item => item === tile).length >= 2 ? 1 : 0), 0);
    player.score = 1000 + player.melds.length * 4200 + pairs * 900 + Math.floor(Math.random() * 1600);
  });
  const winner = [...game.players].sort((a, b) => b.score - a.score)[0];
  awardGamePot(game, winner);
  renderMahjongRound("ロン！");
  document.querySelector(`[data-mahjong-id="${winner.id}"]`)?.classList.add("winner");
  $("#mahjongMessage").textContent = `🀄 ${winner.name}が和了！${game.pot}ポイントを獲得しました！`;
  playGameEffect("win");
}

function runMahjongTurn() {
  if (!mahjongGame || mahjongGame.over) return;
  const game = mahjongGame;
  if (game.turns >= 24 || !game.wall.length) return finishMahjongRound();
  const player = game.players[game.current];
  const drawn = game.wall.pop();
  player.hand.push(drawn);
  game.drawnBy = player.id;
  $("#mahjongMessage").textContent = `${player.name}が牌山からツモ…`;
  renderMahjongRound("ツモ");
  playGameEffect();

  mahjongTurnTimer = window.setTimeout(() => {
    if (!mahjongGame || game.over) return;
    const discardIndex = Math.floor(Math.random() * player.hand.length);
    const [discarded] = player.hand.splice(discardIndex, 1);
    player.discards.push(discarded);
    game.river.push(discarded);
    game.drawnBy = "";
    game.turns += 1;
    $("#mahjongMessage").textContent = `${player.name}が ${discarded} を捨てました`;
    renderMahjongRound();

    mahjongTurnTimer = window.setTimeout(() => {
      if (!mahjongGame || game.over) return;
      const callerIndex = (game.current + 1) % game.players.length;
      const caller = game.players[callerIndex];
      const matching = caller.hand.filter(tile => tile === discarded);
      if (matching.length >= 2 && Math.random() < 0.42) {
        let removed = 0;
        caller.hand = caller.hand.filter(tile => {
          if (tile === discarded && removed < 2) { removed += 1; return false; }
          return true;
        });
        caller.melds.push([discarded, discarded, discarded]);
        game.river.pop();
        const forcedDiscard = caller.hand.splice(Math.floor(Math.random() * caller.hand.length), 1)[0];
        caller.discards.push(forcedDiscard);
        game.river.push(forcedDiscard);
        game.current = (callerIndex + 1) % game.players.length;
        $("#mahjongMessage").textContent = `${caller.name}が${player.name}の牌をもらってポン！続けて ${forcedDiscard} を捨てました`;
        renderMahjongRound("ポン！");
      } else {
        game.current = callerIndex;
      }
      mahjongTurnTimer = window.setTimeout(runMahjongTurn, 1050);
    }, 800);
  }, 1050);
}

function openMahjong() {
  const bet = Math.max(1, Math.floor(Number($("#mahjongBet").value) || 10));
  const members = STAFF.filter(staff => state[staff.id].status === "break" && playerPoints(staff.id) >= bet).slice(0, 3);
  $("#mahjongMembers").textContent = members.length === 3 ? `${members.map(member => member.name).join("・")}と対局` : "休憩中のスタッフが3名必要です";
  $("#mahjongBetInfo").textContent = members.length
    ? `あなた ${Math.floor(pointWallet.owner)}P ／ ${members.map(member => `${member.name} ${Math.floor(pointWallet.staff[member.id])}P`).join(" ／ ")} ／ 賞金${bet * 4}P`
    : `あなた ${Math.floor(pointWallet.owner)}P ／ 参加者を待っています`;
  $("#startMahjongBtn").disabled = members.length !== 3 || pointWallet.owner < bet;
  $("#mahjongSetup").hidden = false;
  $("#mahjongGame").hidden = true;
  $("#mahjongOverlay").hidden = false;
}
$("#openMahjongBtn").addEventListener("click", openMahjong);
$("#mahjongBet").addEventListener("input", openMahjong);
$("#mahjongClose").addEventListener("click", () => {
  window.clearTimeout(mahjongTurnTimer);
  clearGameYoutubePlayer("mahjongYoutubePlayer");
  $("#mahjongOverlay").hidden = true;
});
$("#mahjongOverlay").addEventListener("click", event => {
  if (event.target === $("#mahjongOverlay")) $("#mahjongClose").click();
});
$("#startMahjongBtn").addEventListener("click", () => {
  const bet = Math.max(1, Math.floor(Number($("#mahjongBet").value) || 1));
  const members = STAFF.filter(staff => state[staff.id].status === "break" && playerPoints(staff.id) >= bet).slice(0, 3);
  if (members.length !== 3) return openMahjong();
  const pot = collectGameBet(members.map(member => member.id), bet);
  if (!pot) return openMahjong();
  const wall = MAHJONG_TILES.flatMap(tile => [tile, tile, tile, tile]).sort(() => Math.random() - .5);
  const players = [{ id: "you", name: "あなた" }, ...members].map(player => ({
    ...player, hand: Array.from({ length: 13 }, () => wall.pop()), melds: [], discards: [], score: 0,
  }));
  mahjongGame = { players, wall, river: [], current: 0, turns: 0, drawnBy: "", over: false, bet, pot, potAwarded: false };
  $("#mahjongSetup").hidden = true;
  $("#mahjongGame").hidden = false;
  $("#mahjongMessage").textContent = "配牌完了… 東一局、対局開始！";
  renderMahjongRound();
  setGameYoutubePlayer("mahjongYoutubePlayer", GAME_BGM_VIDEO_ID, "麻雀BGM");
  playGameEffect();
  mahjongTurnTimer = window.setTimeout(runMahjongTurn, 1400);
});
$("#mahjongRestart").addEventListener("click", () => {
  window.clearTimeout(mahjongTurnTimer);
  clearGameYoutubePlayer("mahjongYoutubePlayer");
  mahjongGame = null;
  openMahjong();
});

/* ---------------- original monster clash / rock-paper-scissors battle ---------------- */
const BEASTS = [
  { id:"flarehorn", name:"フレアホーン", icon:"🪲", type:"炎角", hp:108, atk:19, color:"#ff5d32", trait:"灼熱の角", detail:"勝利時20%でクリティカル" },
  { id:"ironclad", name:"アイアンクラッド", icon:"🦏", type:"鋼殻", hp:148, atk:12, color:"#84a5bd", trait:"超重装甲", detail:"受けるダメージを7軽減" },
  { id:"voltfang", name:"ボルトファング", icon:"🐯", type:"雷牙", hp:68, atk:27, color:"#ffd52e", trait:"背水の雷撃", detail:"低体力・超攻撃型。HP半分以下で攻撃+9" },
  { id:"leafmantis", name:"リーフマンティス", icon:"🦗", type:"翠刃", hp:94, atk:16, color:"#55d778", trait:"生命吸収", detail:"攻撃成功時にHPを8回復" },
  { id:"tidecrab", name:"タイドクラブ", icon:"🦀", type:"水鋏", hp:122, atk:15, color:"#3bb9ff", trait:"反撃の鋏", detail:"負けても相手へ4ダメージ" },
  { id:"shadowmoth", name:"シャドウモス", icon:"🦋", type:"幻影", hp:82, atk:22, color:"#b06cff", trait:"幻惑回避", detail:"18%で攻撃を完全回避" },
  { id:"venomtail", name:"ヴェノムテイル", icon:"🦂", type:"毒尾", hp:101, atk:17, color:"#cb55dd", trait:"猛毒針", detail:"攻撃成功後、追加で5ダメージ" },
  { id:"luckyowl", name:"ルミナアウル", icon:"🦉", type:"光翼", hp:112, atk:16, color:"#ffb75e", trait:"幸運の翼", detail:"あいこになるとHPを6回復" },
];
const BEAST_HANDS = {
  rock: { icon:"✊", name:"グー", move:"ブレイクスマッシュ", bonus:5 },
  scissors: { icon:"✌️", name:"チョキ", move:"クロスラッシュ", bonus:3 },
  paper: { icon:"✋", name:"パー", move:"エナジーバースト", bonus:1 },
};
let selectedBeastId = "";
let beastGame = null;
let beastAutoStartTimer = null;

function playBeastSound(kind = "attack") {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const sequence = kind === "attack" ? [120, 260, 520] : kind === "damage" ? [170, 90] : [440, 660, 880, 1175];
    sequence.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = kind === "damage" ? "sawtooth" : "square";
      oscillator.frequency.setValueAtTime(frequency, context.currentTime + index * .07);
      gain.gain.setValueAtTime(.001, context.currentTime + index * .07);
      gain.gain.exponentialRampToValueAtTime(.2, context.currentTime + index * .07 + .015);
      gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + index * .07 + .16);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + index * .07);
      oscillator.stop(context.currentTime + index * .07 + .18);
    });
  } catch { /* Web Audio unavailable */ }
}

function beastCardHtml(beast) {
  return `<button type="button" class="beast-choice${selectedBeastId === beast.id ? " selected" : ""}" data-beast-id="${beast.id}" style="--beast:${beast.color}">
    <span>${beast.icon}</span><strong>${beast.name}</strong><small>${beast.type}タイプ</small>
    <div><b>HP ${beast.hp}</b><b>ATK ${beast.atk}</b></div><em>${beast.trait}</em><i>${beast.detail}</i>
  </button>`;
}

function renderBeastSetup() {
  const grid = $("#beastMonsterGrid");
  const select = $("#beastOpponent");
  const bet = Math.max(1, Math.floor(Number($("#beastBet").value) || 1));
  const resting = STAFF.filter(staff => state[staff.id].status === "break" && playerPoints(staff.id) >= bet);
  const previous = select.value;
  select.innerHTML = resting.map(staff => `<option value="${staff.id}">${staff.name}（${Math.floor(playerPoints(staff.id))}P）</option>`).join("");
  if (resting.some(staff => staff.id === previous)) select.value = previous;
  grid.innerHTML = BEASTS.map(beastCardHtml).join("");
  const opponent = STAFF.find(staff => staff.id === select.value);
  const canStart = !!selectedBeastId && !!opponent && playerPoints("you") >= bet;
  $("#beastPotInfo").textContent = opponent
    ? `あなた ${Math.floor(playerPoints("you"))}P ／ ${opponent.name} ${Math.floor(playerPoints(opponent.id))}P ／ POT ${bet * 2}P`
    : "休憩中でポイントを持つスタッフが必要です";
  $("#startBeastBtn").disabled = !canStart;
  $("#startBeastBtn").textContent = !opponent ? "対戦相手がいません" : !selectedBeastId ? "モンスターを選んでください" : "⚡ バトル開始！";
}

function openBeastGame() {
  window.clearTimeout(beastAutoStartTimer);
  selectedBeastId = "";
  beastGame = null;
  $("#beastSetup").hidden = false;
  $("#beastGame").hidden = true;
  $("#beastOverlay").hidden = false;
  renderBeastSetup();
}
function closeBeastGame() {
  window.clearTimeout(beastAutoStartTimer);
  beastGame = null;
  $("#beastOverlay").hidden = true;
}
$("#openBeastBtn").addEventListener("click", openBeastGame);
$("#beastClose").addEventListener("click", closeBeastGame);
$("#beastEnd").addEventListener("click", closeBeastGame);
$("#beastOverlay").addEventListener("click", event => { if (event.target === $("#beastOverlay")) closeBeastGame(); });
$("#beastBet").addEventListener("input", renderBeastSetup);
$("#beastOpponent").addEventListener("change", renderBeastSetup);
$("#beastMonsterGrid").addEventListener("click", event => {
  const choice = event.target.closest(".beast-choice");
  if (!choice) return;
  selectedBeastId = choice.dataset.beastId;
  playGameEffect();
  renderBeastSetup();
  window.clearTimeout(beastAutoStartTimer);
  const selectedAtClick = selectedBeastId;
  $("#startBeastBtn").textContent = $("#startBeastBtn").disabled ? $("#startBeastBtn").textContent : "⚡ 対戦準備中…";
  if (!$("#startBeastBtn").disabled) {
    beastAutoStartTimer = window.setTimeout(() => {
      if (!beastGame && selectedBeastId === selectedAtClick && !$("#startBeastBtn").disabled) {
        $("#startBeastBtn").click();
      }
    }, 450);
  }
});

function beastFighterHtml(side) {
  const beast = side.beast;
  const hpPercent = Math.max(0, Math.round(side.hp / beast.hp * 100));
  return `<div class="beast-combat-hud">
      <div class="beast-owner">${side.id === "you" ? "1P・あなた" : `2P・${side.name}`}</div>
      <div class="beast-name">${beast.name}<small>${beast.type}・ATK ${beast.atk}</small></div>
      <div class="beast-hp"><b style="width:${hpPercent}%"></b><span>HP ${Math.max(0, side.hp)} / ${beast.hp}</span></div>
    </div>
    <div class="beast-sprite" style="--beast:${beast.color}"><i>${beast.icon}</i><span></span></div>
    <div class="beast-trait-chip">${beast.trait}</div>`;
}
function renderBeastBattle() {
  if (!beastGame) return;
  $("#beastPlayer").innerHTML = beastFighterHtml(beastGame.player);
  $("#beastEnemy").innerHTML = beastFighterHtml(beastGame.enemy);
  $("#beastRoundLabel").textContent = `ROUND ${beastGame.round}`;
  $("#beastPotHud").textContent = `POT ${beastGame.pot}P`;
}
function showBeastFlash(text, kind = "") {
  const flash = $("#beastFlash");
  flash.className = `beast-flash ${kind}`.trim();
  flash.textContent = text;
  flash.hidden = false;
  window.setTimeout(() => { flash.hidden = true; }, 900);
}
function showBeastHandReveal(playerHand, cpuHand) {
  const flash = $("#beastFlash");
  const player = BEAST_HANDS[playerHand];
  const cpu = BEAST_HANDS[cpuHand];
  flash.className = "beast-flash rps";
  flash.innerHTML = `
    <div class="beast-hand-reveal">
      <div class="beast-hand-card player-hand">
        <small>あなた</small>
        <b>${player.icon}</b>
        <strong>${player.name}</strong>
      </div>
      <em>VS</em>
      <div class="beast-hand-card enemy-hand">
        <small>${beastGame.enemy.name}</small>
        <b>${cpu.icon}</b>
        <strong>${cpu.name}</strong>
      </div>
    </div>`;
  flash.hidden = false;
  window.setTimeout(() => { flash.hidden = true; }, 1400);
}
function beastWinner(playerHand, cpuHand) {
  if (playerHand === cpuHand) return 0;
  return (playerHand === "rock" && cpuHand === "scissors")
    || (playerHand === "scissors" && cpuHand === "paper")
    || (playerHand === "paper" && cpuHand === "rock") ? 1 : -1;
}
function beastDamage(attacker, defender, hand) {
  let damage = attacker.beast.atk + BEAST_HANDS[hand].bonus + Math.floor(Math.random() * 6);
  if (attacker.beast.id === "voltfang" && attacker.hp <= attacker.beast.hp / 2) damage += 9;
  let critical = false;
  if (attacker.beast.id === "flarehorn" && Math.random() < .2) { damage *= 2; critical = true; }
  if (defender.beast.id === "ironclad") damage -= 7;
  if (defender.beast.id === "shadowmoth" && Math.random() < .18) return { damage:0, critical:false, dodged:true };
  return { damage:Math.max(3, damage), critical, dodged:false };
}
function disableBeastHands(disabled) {
  $("#beastRps").querySelectorAll("button").forEach(button => { button.disabled = disabled; });
}

$("#startBeastBtn").addEventListener("click", () => {
  window.clearTimeout(beastAutoStartTimer);
  const staff = STAFF.find(item => item.id === $("#beastOpponent").value);
  const playerBeast = BEASTS.find(item => item.id === selectedBeastId);
  const enemyChoices = BEASTS.filter(item => item.id !== selectedBeastId);
  const enemyBeast = enemyChoices[Math.floor(Math.random() * enemyChoices.length)];
  const bet = Math.max(1, Math.floor(Number($("#beastBet").value) || 1));
  if (!staff || !playerBeast || state[staff.id].status !== "break") return renderBeastSetup();
  const pot = collectGameBet([staff.id], bet);
  if (!pot) return renderBeastSetup();
  beastGame = {
    kind:"beast", bet, pot, potAwarded:false, round:1, over:false,
    player:{ id:"you", name:"あなた", beast:playerBeast, hp:playerBeast.hp },
    enemy:{ id:staff.id, name:staff.name, beast:enemyBeast, hp:enemyBeast.hp },
  };
  $("#beastSetup").hidden = true;
  $("#beastGame").hidden = false;
  $("#beastRestart").hidden = true;
  $("#beastMessage").textContent = `${staff.name}の${enemyBeast.name}が現れた！ 技を選べ！`;
  renderBeastBattle();
  showBeastFlash("BATTLE\nSTART!", "start");
  playBeastSound("start");
});

$("#beastRps").addEventListener("click", event => {
  const button = event.target.closest("button[data-hand]");
  if (!button || !beastGame || beastGame.over) return;
  disableBeastHands(true);
  const playerHand = button.dataset.hand;
  const hands = Object.keys(BEAST_HANDS);
  const cpuHand = hands[Math.floor(Math.random() * hands.length)];
  const result = beastWinner(playerHand, cpuHand);
  $("#beastMessage").textContent = "運命の一手を判定中…";
  ["3", "2", "1"].forEach((count, index) => {
    window.setTimeout(() => {
      if (!beastGame) return;
      showBeastFlash(count, "countdown");
      playGameEffect();
    }, index * 650);
  });
  playBeastSound("start");

  window.setTimeout(() => {
    if (!beastGame) return;
    $("#beastMessage").innerHTML = `<b>${BEAST_HANDS[playerHand].icon} あなた</b>　VS　<b>${BEAST_HANDS[cpuHand].icon} ${beastGame.enemy.name}</b>`;
    showBeastHandReveal(playerHand, cpuHand);
  }, 2050);

  window.setTimeout(() => {
    if (!beastGame) return;
    if (result === 0) {
      if (beastGame.player.beast.id === "luckyowl") beastGame.player.hp = Math.min(beastGame.player.beast.hp, beastGame.player.hp + 6);
      if (beastGame.enemy.beast.id === "luckyowl") beastGame.enemy.hp = Math.min(beastGame.enemy.beast.hp, beastGame.enemy.hp + 6);
      $("#beastMessage").textContent = "両者の力が激突！互角のまま弾き飛ばされた！";
      $("#beastStage").classList.add("clash");
      showBeastFlash("DRAW!\n激突", "draw");
      playBeastSound("damage");
    } else {
      const attacker = result > 0 ? beastGame.player : beastGame.enemy;
      const defender = result > 0 ? beastGame.enemy : beastGame.player;
      const attackHand = result > 0 ? playerHand : cpuHand;
      const hit = beastDamage(attacker, defender, attackHand);
      defender.hp -= hit.damage;
      if (attacker.beast.id === "leafmantis" && hit.damage) attacker.hp = Math.min(attacker.beast.hp, attacker.hp + 8);
      if (attacker.beast.id === "venomtail" && hit.damage) defender.hp -= 5;
      if (defender.beast.id === "tidecrab" && hit.damage) attacker.hp -= 4;
      const attackerEl = result > 0 ? $("#beastPlayer") : $("#beastEnemy");
      const defenderEl = result > 0 ? $("#beastEnemy") : $("#beastPlayer");
      $("#beastMessage").textContent = `${attacker.beast.name}が前へ出た！ 必殺技を放つ！`;
      showBeastFlash(`${attacker.beast.name}\n${BEAST_HANDS[attackHand].move}`, "attack");
      attackerEl.classList.add("attacking");
      const move = BEAST_HANDS[attackHand].move;
      window.setTimeout(() => {
        if (!beastGame) return;
        defenderEl.classList.add(hit.dodged ? "dodging" : "damaged");
        $("#beastStage").classList.add("impact");
        $("#beastMessage").textContent = hit.dodged
          ? `${defender.beast.name}の幻惑回避！紙一重でかわした！`
          : `${move}直撃！ ${hit.critical ? "超クリティカル！ " : ""}${hit.damage}ダメージ！`;
        showBeastFlash(hit.dodged ? "MISS!" : hit.critical ? `CRITICAL!\n${hit.damage} DAMAGE` : `HIT!\n${hit.damage} DAMAGE`, hit.critical ? "critical" : "damage");
        playBeastSound(hit.dodged ? "start" : "damage");
        renderBeastBattle();
      }, 850);
    }
    window.setTimeout(() => {
      $("#beastStage").classList.remove("clash", "impact");
      $("#beastPlayer").classList.remove("attacking", "damaged", "dodging");
      $("#beastEnemy").classList.remove("attacking", "damaged", "dodging");
      if (!beastGame) return;
      const loser = beastGame.player.hp <= 0 ? beastGame.player : beastGame.enemy.hp <= 0 ? beastGame.enemy : null;
      if (loser) {
        beastGame.over = true;
        const winner = loser.id === "you" ? beastGame.enemy : beastGame.player;
        $("#beastMessage").textContent = `🏆 ${winner.name}と${winner.beast.name}の勝利！ POT ${beastGame.pot}P獲得！`;
        showBeastFlash("KNOCK OUT!", "ko");
        playBeastSound("win");
        awardGamePot(beastGame, winner);
        $("#beastRestart").hidden = false;
      } else {
        beastGame.round += 1;
        renderBeastBattle();
        $("#beastMessage").textContent = `次の一手で流れが変わる！ ROUND ${beastGame.round}、技を選べ！`;
        showBeastFlash(`ROUND ${beastGame.round}`, "start");
        disableBeastHands(false);
      }
    }, 2300);
  }, 3000);
});

$("#beastRestart").addEventListener("click", () => {
  beastGame = null;
  selectedBeastId = "";
  $("#beastGame").hidden = true;
  $("#beastSetup").hidden = false;
  disableBeastHands(false);
  renderBeastSetup();
});

/* ---------------- PDF export ---------------- */
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// jsPDF/html2canvas are loaded on-demand (only when a PDF is actually requested)
// rather than on every page load, since most visits never need them.
function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const el = document.createElement("script");
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`failed to load ${src}`));
    document.body.appendChild(el);
  });
}
async function ensurePdfLibsLoaded() {
  if (!window.html2canvas) await loadScriptOnce("/html2canvas.min.js");
  if (!window.jspdf) await loadScriptOnce("/jspdf.umd.min.js");
}

function showInterviewCompletionNotice() {
  const existing = document.querySelector(".interview-completion-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "interview-completion-toast";
  toast.innerHTML = "<strong>🗄️ レポートが完成しました</strong><span>完成物保管庫から確認・ダウンロードできます</span>";
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  window.setTimeout(() => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 300);
  }, 5000);
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("AI社員オフィス", { body: "あすかの面接レポートを完成物保管庫へ保存しました。" });
  }
}

async function downloadInterviewReportPdf(job, reportTitle = "面接評価レポート", fileSuffix = "面接評価レポート", candidate = {}) {
  try {
    await ensurePdfLibsLoaded();
    const candidateName = candidate.name || activeInterviewCandidate.name || $("#interviewCandidateName").value.trim() || "応募者";
    const candidateAge = candidate.age || activeInterviewCandidate.age || $("#interviewCandidateAge").value.trim();
    const container = document.createElement("div");
    container.style.cssText = "position:fixed; left:-9999px; top:0; width:760px; padding:38px; background:#fff; font-family:'M PLUS Rounded 1c','Hiragino Maru Gothic ProN','Yu Gothic',sans-serif; color:#333;";
    container.innerHTML = `
      <h1 style="margin:0 0 5px; font-size:24px;">${escapeHtml(reportTitle)}</h1>
      <p style="color:#777; font-size:12px; margin:0 0 18px;">応募者：${escapeHtml(candidateName)} ／ 年齢：${escapeHtml(candidateAge)}歳（評価対象外） ／ 応募職種：${escapeHtml(job || "未指定")} ・ ${new Date().toLocaleString("ja-JP")}</p>
      ${$("#interviewReportBody").innerHTML}
      <p style="margin-top:18px; padding:10px; background:#fff8e8; font-size:11px;">AIによる参考評価です。正式な判断は人間の採用担当者が行ってください。</p>`;
    document.body.appendChild(container);
    const canvas = await window.html2canvas(container, { scale: 2, backgroundColor: "#ffffff" });
    container.remove();
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "px", format: [canvas.width / 2, canvas.height / 2] });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
    const safeJob = (job || "面接").replace(/[\\/:*?"<>|]/g, "-");
    const safeName = candidateName.replace(/[\\/:*?"<>|]/g, "-");
    const safeSuffix = fileSuffix.replace(/[\\/:*?"<>|]/g, "-");
    pdf.save(`採用試験ルーム_${safeName}_${safeJob}_${safeSuffix}.pdf`);
    return true;
  } catch (error) {
    console.error("Interview PDF error:", error);
    addLog("⚠️", "面接レポートPDFの保存に失敗しました");
    return false;
  }
}

async function downloadTeamDeliverablePdf(item) {
  try {
    await ensurePdfLibsLoaded();
  } catch {
    alert("PDF機能の読み込みに失敗しました。もう一度お試しください。");
    return;
  }
  const team = TEAMS.find(value => value.id === item.teamId);
  const firstStaff = STAFF.find(person => person.id === item.entries[0]?.staffId);
  const accentA = team?.t?.[0] || firstStaff?.grad?.[0] || "#8d62cc";
  const accentB = team?.t?.[1] || firstStaff?.grad?.[1] || "#6742a0";
  const parts = item.entries.flatMap(entry => {
    const scripts = splitDeliverableParts(entry.content);
    if (!scripts.length) return [{ label: `${entry.staffName}・台本`, content: entry.content }];
    return scripts.map(script => ({
      label: `${entry.staffName}・${script.label}`,
      content: script.content,
    }));
  });
  const teamStaff = {
    id: item.teamId || "team",
    name: item.staffName,
    role: item.role,
  };
  const teamStaffInfo = {
    ...teamStaff,
    emoji: team?.icon || "📚",
    grad: [accentA, accentB],
  };
  await downloadBundledDeliverablePdf(
    teamStaff,
    teamStaffInfo,
    parts,
    item.createdAt,
    item.model,
    accentA,
    accentB
  );
}

async function downloadDeliverablePdf(staff, deliverableText, createdAt = new Date().toISOString(), model = "") {
  try {
    await ensurePdfLibsLoaded();
  } catch {
    alert("PDF機能の読み込みに失敗しました。もう一度お試しください。");
    return;
  }
  const staffInfo = STAFF.find(person => person.name === staff.name);
  const accentA = staffInfo?.grad?.[0] || "#8d62cc";
  const accentB = staffInfo?.grad?.[1] || "#6742a0";
  const bundledParts = splitDeliverableParts(deliverableText);
  if (bundledParts.length > 1) {
    await downloadBundledDeliverablePdf(staff, staffInfo, bundledParts, createdAt, model, accentA, accentB);
    return;
  }
  const storyboardHtml = SCRIPT_STAFF_IDS.has(staffInfo?.id) && staffInfo.id !== "elf_lively"
    ? buildStoryboardHtml(deliverableText, accentA, accentB)
    : "";
  const container = document.createElement("div");
  container.style.cssText = "position:fixed; left:-9999px; top:0; width:760px; background:#f7f3fa; font-family:'M PLUS Rounded 1c','Hiragino Maru Gothic ProN','Yu Gothic',sans-serif; color:#352d3b;";
  container.innerHTML = `
    <div style="height:12px;background:linear-gradient(90deg,${accentA},${accentB});"></div>
    <div style="padding:42px 46px 48px;">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:28px;">
        <div style="width:54px;height:54px;border-radius:17px;background:linear-gradient(135deg,${accentA},${accentB});display:flex;align-items:center;justify-content:center;font-size:26px;color:#fff;">${staffInfo?.emoji || "📄"}</div>
        <div>
          <p style="margin:0 0 3px;color:#8b7897;font-size:11px;font-weight:700;letter-spacing:.08em;">AI EMPLOYEE DELIVERABLE</p>
          <h1 style="margin:0;font-size:25px;">${escapeHtml(staff.role)}</h1>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:26px;">
        <div style="padding:13px 15px;border-radius:12px;background:#fff;border:1px solid #e7dfee;"><small style="color:#94849e;">担当スタッフ</small><strong style="display:block;margin-top:3px;">${escapeHtml(staff.name)}</strong></div>
        <div style="padding:13px 15px;border-radius:12px;background:#fff;border:1px solid #e7dfee;"><small style="color:#94849e;">作成日時</small><strong style="display:block;margin-top:3px;font-size:12px;">${new Date(createdAt).toLocaleString("ja-JP")}</strong></div>
      </div>
      <div style="padding:26px 28px;border-radius:16px;background:#fff;border:1px solid #e5dbea;box-shadow:0 8px 24px rgba(70,45,88,.07);">
        <div style="margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid ${accentA};font-weight:800;color:${accentB};">完成内容</div>
        ${storyboardHtml}
        <div style="white-space:pre-wrap;line-height:1.9;font-size:14px;">${escapeHtml(deliverableText)}</div>
      </div>
      ${model ? `<p style="margin:18px 0 0;color:#998ba0;font-size:10px;">生成方式：${escapeHtml(model)}</p>` : ""}
      <p style="margin:28px 0 0;padding-top:12px;border-top:1px solid #ded3e5;color:#9a8ca2;font-size:9px;text-align:right;">合同会社良心 バーチャル支店</p>
    </div>
  `;
  document.body.appendChild(container);
  try {
    const canvas = await window.html2canvas(container, { scale: 2, backgroundColor: "#ffffff" });
    document.body.removeChild(container);
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "px", format: [canvas.width / 2, canvas.height / 2] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`${deliverableFileBase(staff)}.pdf`);
  } catch {
    container.remove();
    alert("PDFの作成に失敗しました。もう一度お試しください。");
  }
}

function splitDeliverableParts(text) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  const headingPattern = /^\s*(?:#{1,4}\s*)?(?:【\s*)?(?:(?:第|台本|案)\s*)?([0-9０-９]+)\s*(?:本目|本|案)(?:\s*[：:】\-].*)?\s*$/;
  const parts = [];
  let current = null;
  for (const line of lines) {
    const heading = line.match(headingPattern);
    if (heading) {
      if (current?.lines.some(value => value.trim())) parts.push(current);
      current = { label: `${Number(heading[1].replace(/[０-９]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xfee0)))}本目`, lines: [] };
      continue;
    }
    if (current) current.lines.push(line);
  }
  if (current?.lines.some(value => value.trim())) parts.push(current);
  return parts.map(part => ({ label: part.label, content: part.lines.join("\n").trim() }));
}

async function downloadBundledDeliverablePdf(staff, staffInfo, parts, createdAt, model, accentA, accentB) {
  const { jsPDF } = window.jspdf;
  let pdf = null;
  for (const [index, part] of parts.entries()) {
    const container = document.createElement("div");
    container.style.cssText = "position:fixed;left:-9999px;top:0;width:760px;background:#f7f3fa;font-family:'M PLUS Rounded 1c','Hiragino Maru Gothic ProN','Yu Gothic',sans-serif;color:#352d3b;";
    container.innerHTML = `
      <div style="height:12px;background:linear-gradient(90deg,${accentA},${accentB});"></div>
      <div style="padding:42px 46px 48px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:26px;">
          <div>
            <p style="margin:0 0 5px;color:#8b7897;font-size:11px;font-weight:700;letter-spacing:.08em;">AI EMPLOYEE DELIVERABLE</p>
            <h1 style="margin:0;font-size:28px;color:${accentB};">${escapeHtml(part.label)}</h1>
          </div>
          <div style="text-align:right;">
            <strong style="display:block;">${escapeHtml(staff.name)}／${escapeHtml(staff.role)}</strong>
            <small style="color:#94849e;">${new Date(createdAt).toLocaleString("ja-JP")}</small>
          </div>
        </div>
        <div style="padding:28px 30px;border-radius:16px;background:#fff;border:1px solid #e5dbea;box-shadow:0 8px 24px rgba(70,45,88,.07);">
          <div style="white-space:pre-wrap;line-height:1.95;font-size:14px;">${escapeHtml(part.content)}</div>
        </div>
        ${model ? `<p style="margin:18px 0 0;color:#998ba0;font-size:10px;">生成方式：${escapeHtml(model)}</p>` : ""}
        <p style="margin:28px 0 0;padding-top:12px;border-top:1px solid #ded3e5;color:#9a8ca2;font-size:9px;text-align:right;">${index + 1} / ${parts.length}　合同会社良心 バーチャル支店</p>
      </div>`;
    document.body.appendChild(container);
    const canvas = await window.html2canvas(container, { scale: 2, backgroundColor: "#ffffff" });
    container.remove();
    const width = canvas.width / 2;
    const height = canvas.height / 2;
    if (!pdf) pdf = new jsPDF({ unit: "px", format: [width, height] });
    else pdf.addPage([width, height], width > height ? "landscape" : "portrait");
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, width, height);
  }
  pdf.save(`${deliverableFileBase(staff)}_${parts.length}本まとめ.pdf`);
}

function buildStoryboardHtml(text, accentA, accentB) {
  const source = String(text || "").replace(/\r/g, "");
  const marker = /【絵コンテ\s*(\d+)[｜|]\s*([^】]+)】/g;
  const matches = [...source.matchAll(marker)].slice(0, 8);
  if (!matches.length) return "";
  const cards = matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    const body = source.slice(start, end).split(/\n(?=【|撮影用|撮影時|投稿キャプション|ハッシュタグ)/)[0].trim();
    const names = ["ユウ", "サラ", "ヒスイ", "マリィ"].filter(name => body.includes(name));
    const cast = (names.length ? names : ["出演者"]).map((name, castIndex) => {
      const colors = ["#ff719e", "#69bfe8", "#62bb8a", "#b99be8"];
      const left = 20 + castIndex * (60 / Math.max(1, (names.length || 1) - 1));
      return `<div style="position:absolute;left:${left}%;bottom:14px;transform:translateX(-50%);text-align:center;">
        <div style="width:31px;height:31px;margin:auto;border:3px solid #fff;border-radius:50%;background:${colors[castIndex]};"></div>
        <div style="width:39px;height:48px;margin:-2px auto 0;border-radius:16px 16px 9px 9px;background:${colors[castIndex]};"></div>
        <span style="font-size:9px;font-weight:800;">${escapeHtml(name)}</span>
      </div>`;
    }).join("");
    return `<div style="break-inside:avoid;border:1px solid #ded5e6;border-radius:12px;overflow:hidden;background:#fff;">
      <div style="display:flex;justify-content:space-between;padding:7px 10px;background:linear-gradient(90deg,${accentA},${accentB});color:#fff;font-size:10px;font-weight:800;"><span>CUT ${match[1]}</span><span>${escapeHtml(match[2])}</span></div>
      <div style="position:relative;height:155px;background:linear-gradient(#f6effc 0 68%,#e5d6ea 68%);">${cast}</div>
      <div style="padding:9px 10px;color:#55485d;font-size:9px;line-height:1.5;">${escapeHtml(body.split("\n").filter(Boolean).slice(0, 5).join(" ／ "))}</div>
    </div>`;
  }).join("");
  return `<section style="margin-bottom:22px;"><div style="margin-bottom:10px;font-size:16px;font-weight:900;color:${accentB};">🎬 絵コンテ</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:11px;">${cards}</div></section>`;
}

$("#pdfBtn").addEventListener("click", async () => {
  if (!activeResultStaffId) return;
  const pdfBtn = $("#pdfBtn");
  const staff = STAFF.find(s => s.id === activeResultStaffId);
  const s = state[activeResultStaffId];
  const originalLabel = pdfBtn.textContent;
  pdfBtn.disabled = true;
  pdfBtn.textContent = "作成中…";
  await downloadDeliverablePdf(staff, s.deliverable);
  pdfBtn.disabled = false;
  pdfBtn.textContent = originalLabel;
});

/* ---------------- ambient office life (local only, no AI/API calls) ---------------- */
const AMBIENT_CHATS = [
  ["今日もいいアイデア出そうだね！", "うん、わくわくしてきた！"],
  ["ちょっと休憩した？", "お茶を飲んで元気いっぱい！"],
  ["その企画、おもしろそう！", "あとで一緒に見てみよう♪"],
  ["今日の調子はどう？", "ばっちり！いつでも任せて！"],
  ["いいハッシュタグ思いついたよ", "ほんと？あとで教えて〜！"],
  ["オフィスがにぎやかだね", "みんながいると楽しいね♪"],
  ["次は何を作るのかな？", "新しい依頼、楽しみだね！"],
  ["さっきの仕事、素敵だったよ", "ありがとう！うれしいな"],
  ["アイデア会議しようよ", "賛成！メモを持ってくるね"],
  ["今日も一緒にがんばろう！", "おーっ！"],
];

let ambientChatTimer = null;
let breakRotationTimer = null;

function setChatMotion(staffId, facing) {
  const mascot = document.querySelector(`#tile-${staffId} .mascot`);
  if (!mascot) return;
  mascot.classList.add("ambient-chatting", facing);
  setTimeout(() => mascot.classList.remove("ambient-chatting", facing), 4300);
}

function runAmbientChat() {
  const available = STAFF.filter(staff =>
    state[staff.id].status === "idle" && document.getElementById(`tile-${staff.id}`)
  );
  if (available.length >= 2 && modalOverlay.hidden && resultOverlay.hidden && staffSettingsOverlay.hidden) {
    const firstIndex = Math.floor(Math.random() * available.length);
    const first = available[firstIndex];
    const others = available.filter(staff => staff.id !== first.id);
    const second = others[Math.floor(Math.random() * others.length)];
    const [firstLine, secondLine] = AMBIENT_CHATS[Math.floor(Math.random() * AMBIENT_CHATS.length)];

    setChatMotion(first.id, "chat-right");
    setChatMotion(second.id, "chat-left");
    showBubble(first.id, `💬 ${second.name}、${firstLine}`, 3400);

    setTimeout(() => {
      if (state[second.id].status !== "idle") return;
      showBubble(second.id, `💬 ${first.name}、${secondLine}`, 3400);
    }, 1700);
  }

  const nextDelay = 6500 + Math.random() * 5000;
  ambientChatTimer = setTimeout(runAmbientChat, nextDelay);
}

function rotateBreakStaff() {
  if (!BREAKS_ENABLED) return;
  const anyModalOpen = !modalOverlay.hidden || !resultOverlay.hidden
    || !staffSettingsOverlay.hidden || !daifugoOverlay.hidden || !jijiOverlay.hidden
    || !interviewOverlay.hidden || !workTimeOverlay.hidden
    || !$("#blackjackOverlay").hidden || !$("#mahjongOverlay").hidden || !$("#beastOverlay").hidden;
  if (!anyModalOpen) {
    const available = STAFF.filter(staff =>
      BREAK_ELIGIBLE_IDS.has(staff.id) && (
        state[staff.id].status === "break"
        || (state[staff.id].status === "idle" && pointWallet.staff[staff.id] >= 3)
      )
    );
    if (available.length) {
      const previousRestingIds = new Set(
        available.filter(staff => state[staff.id].status === "break").map(staff => staff.id)
      );
      const targetCount = 1 + Math.floor(Math.random() * Math.min(4, available.length));
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      const nextRestingIds = new Set(shuffled.slice(0, targetCount).map(staff => staff.id));

      available.forEach(staff => {
        const willRest = nextRestingIds.has(staff.id);
        if (willRest && !previousRestingIds.has(staff.id)) {
          pointWallet.staff[staff.id] -= 3;
        }
        state[staff.id].status = willRest ? "break" : "idle";
        state[staff.id]._breakSince = willRest
          ? (previousRestingIds.has(staff.id) ? state[staff.id]._breakSince : Date.now())
          : null;
      });
      persistPoints();

      const returned = available.filter(staff =>
        previousRestingIds.has(staff.id) && !nextRestingIds.has(staff.id)
      );
      const startedBreak = available.filter(staff =>
        !previousRestingIds.has(staff.id) && nextRestingIds.has(staff.id)
      );
      renderAll();
      addLog("☕", `休憩メンバーを交代しました（現在${targetCount}人）`);
      if (returned[0]) showBubble(returned[0].id, "💬 休憩できたので戻ります！", 3300);
      if (startedBreak[0]) showBubble(startedBreak[0].id, "💬 ちょっと休憩してきます♪", 3300);
    }
  }
  const nextRotation = 45000 + Math.random() * 30000;
  breakRotationTimer = setTimeout(rotateBreakStaff, nextRotation);
}

/* ---------------- init ---------------- */
renderAll();
renderDeliverableVault();
syncSharedStaffSettings();
syncSharedPoints();
window.setInterval(syncSharedPoints, 15000);
ambientChatTimer = setTimeout(runAmbientChat, 2600);
if (BREAKS_ENABLED) breakRotationTimer = setTimeout(rotateBreakStaff, 45000);

let workTimeTicksSinceSave = 0;
window.setInterval(() => {
  if (!workTimeOverlay.hidden) renderWorkTimes();
  workTimeTicksSinceSave += 1;
  if (workTimeTicksSinceSave >= 10) {
    workTimeTicksSinceSave = 0;
    persistWorkTimes();
    grantMonthlyPointsIfDue();
  }
}, 1000);
window.addEventListener("beforeunload", persistWorkTimes);
/* ---------------- accounting department ---------------- */
let accountingData = null;
let accountingRecognition = null;
let clientRegistrationRecognition = null;

function accountingToday() {
  return new Date().toISOString().slice(0, 10);
}

function accountingNextMonthEnd() {
  const date = new Date();
  date.setMonth(date.getMonth() + 2, 0);
  return date.toISOString().slice(0, 10);
}

function accountingYen(value) {
  return `¥${Math.round(Number(value) || 0).toLocaleString("ja-JP")}`;
}

async function readAccountingJson(response, fallbackMessage) {
  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();
  if (!contentType.includes("application/json")) {
    console.error("Accounting endpoint returned non-JSON:", response.status, raw.slice(0, 500));
    throw new Error(`${fallbackMessage}（サーバーから不正な応答が返されました。画面を再読み込みしてもう一度お試しください）`);
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`${fallbackMessage}（応答データを読み取れませんでした）`);
  }
}

async function loadAccountingDeskData() {
  const response = await fetch("/api/accounting", { cache: "no-store" });
  const data = await readAccountingJson(response, "経理データを読み込めませんでした。");
  if (!response.ok) throw new Error(data.error || "経理データを読み込めませんでした。");
  accountingData = data;
  renderAccountingClients();
  renderAccountingSettings();
  renderAccountingHistory();
  populateInvoiceClients();
  return data;
}

async function openAccountingDesk(initialInstruction = "", initialTab = "clients") {
  const overlay = document.getElementById("accountingOverlay");
  overlay.hidden = false;
  switchAccountingTab(initialTab);
  try {
    // Always refresh so additions and edits are immediately reflected in the list.
    await loadAccountingDeskData();
  } catch (error) {
    document.getElementById("accountingParseStatus").textContent = error.message;
  }
  const invoiceDate = document.getElementById("invoiceDate");
  const invoiceDueDate = document.getElementById("invoiceDueDate");
  if (invoiceDate && !invoiceDate.value) invoiceDate.value = accountingToday();
  if (invoiceDueDate && !invoiceDueDate.value) invoiceDueDate.value = accountingNextMonthEnd();
  await updateCalendarConnectionStatus();
}

function closeAccountingDesk() {
  if (accountingRecognition) {
    try { accountingRecognition.stop(); } catch {}
  }
  if (clientRegistrationRecognition) {
    try { clientRegistrationRecognition.stop(); } catch {}
    clientRegistrationRecognition = null;
  }
  document.getElementById("accountingOverlay").hidden = true;
}

function switchAccountingTab(name) {
  document.querySelectorAll("[data-accounting-tab]").forEach(button => {
    button.classList.toggle("active", button.dataset.accountingTab === name);
  });
  document.querySelectorAll("[data-accounting-panel]").forEach(panel => {
    panel.classList.toggle("active", panel.dataset.accountingPanel === name);
  });
}

function invoiceItemTemplate(item = {}) {
  const quantity = Number(item.quantity) || 1;
  const unitPrice = Number(item.unitPrice ?? item.amount) || 0;
  const amount = Number(item.amount) || quantity * unitPrice;
  return `<div class="invoice-item-row">
    <input class="invoice-item-description" aria-label="内容" placeholder="内容" value="${escapeHtml(item.description || "")}">
    <input class="invoice-item-quantity" aria-label="数量" type="number" min="0" step="1" value="${quantity}">
    <input class="invoice-item-unit" aria-label="単位" value="${escapeHtml(item.unit || "式")}">
    <input class="invoice-item-price" aria-label="単価" type="number" min="0" value="${unitPrice}">
    <input class="invoice-item-amount" aria-label="金額" type="number" min="0" value="${amount}">
    <button type="button" class="invoice-item-remove" aria-label="明細を削除">✕</button>
  </div>`;
}

function addInvoiceItem(item = {}) {
  document.getElementById("invoiceItems").insertAdjacentHTML("beforeend", invoiceItemTemplate(item));
  updateInvoiceTotal();
}

function readInvoiceItems() {
  return [...document.querySelectorAll("#invoiceItems .invoice-item-row")].map(row => {
    const quantity = Number(row.querySelector(".invoice-item-quantity").value) || 1;
    const unitPrice = Number(row.querySelector(".invoice-item-price").value) || 0;
    const explicitAmount = Number(row.querySelector(".invoice-item-amount").value);
    return {
      description: row.querySelector(".invoice-item-description").value.trim(),
      quantity,
      unit: row.querySelector(".invoice-item-unit").value.trim() || "式",
      unitPrice,
      amount: Number.isFinite(explicitAmount) && explicitAmount > 0 ? explicitAmount : quantity * unitPrice,
      taxRate: Number(accountingData?.invoiceSettings?.taxRate) || 10,
    };
  }).filter(item => item.description || item.amount);
}

function updateInvoiceTotal() {
  const sum = readInvoiceItems().reduce((total, item) => total + item.amount, 0);
  const discount = Number(document.getElementById("invoiceDiscount")?.value) || 0;
  const mode = document.getElementById("invoiceTaxMode")?.value || "included";
  const rate = Number(accountingData?.invoiceSettings?.taxRate) || 10;
  const total = mode === "excluded" ? Math.max(0, sum - discount) * (1 + rate / 100) : Math.max(0, sum - discount);
  const target = document.getElementById("invoiceLiveTotal");
  if (target) target.textContent = `ご請求予定額：${accountingYen(total)}`;
}

function populateInvoiceClients() {
  const select = document.getElementById("invoiceClientSelect");
  if (!select || !accountingData) return;
  const selected = select.value;
  select.innerHTML = `<option value="">未選択</option>${accountingData.clients
    .filter(client => client.active !== false)
    .map(client => `<option value="${client.id}">${escapeHtml(client.companyName)}</option>`).join("")}`;
  if ([...select.options].some(option => option.value === selected)) select.value = selected;
}

function selectAccountingClient(clientId) {
  const client = accountingData?.clients.find(item => item.id === clientId);
  if (!client) return;
  const selectedName = document.getElementById("invoiceSelectedClientName");
  if (selectedName) {
    selectedName.textContent = client.contactName
      ? `${client.companyName}／${client.contactName} 様`
      : `${client.companyName} 御中`;
  }
  if (client.taxMode) document.getElementById("invoiceTaxMode").value = client.taxMode;
  if (!document.querySelector("#invoiceItems .invoice-item-description")?.value && client.defaultItem) {
    document.getElementById("invoiceItems").innerHTML = "";
    addInvoiceItem({ description: client.defaultItem, quantity: 1, unit: "式", unitPrice: client.defaultAmount, amount: client.defaultAmount });
  }
}

async function parseAccountingInstruction() {
  const instruction = document.getElementById("accountingInstruction").value.trim();
  const status = document.getElementById("accountingParseStatus");
  if (!instruction) {
    status.textContent = "音声またはテキストで請求内容を入力してください。";
    return;
  }
  status.textContent = "内容を整理しています…";
  try {
    const response = await fetch("/api/accounting/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instruction }),
    });
    const parsed = await readAccountingJson(response, "請求内容を解析できませんでした。");
    if (!response.ok) throw new Error(parsed.error || "内容を解析できませんでした。");
    if (parsed.clientId) {
      document.getElementById("invoiceClientSelect").value = parsed.clientId;
      selectAccountingClient(parsed.clientId);
    }
    if (!parsed.clientId) {
      document.getElementById("invoiceClientSelect").value = "";
      document.getElementById("invoiceSelectedClientName").textContent = parsed.clientQuery
        ? `「${parsed.clientQuery}」は選択されていません`
        : "まだ選択されていません";
    }
    if (parsed.invoiceDate) document.getElementById("invoiceDate").value = parsed.invoiceDate;
    if (parsed.dueDate) document.getElementById("invoiceDueDate").value = parsed.dueDate;
    if (parsed.closingDate) document.getElementById("invoiceClosingDate").value = parsed.closingDate;
    document.getElementById("invoicePeriod").value = parsed.period || "";
    document.getElementById("invoiceTaxMode").value = parsed.taxMode || "included";
    document.getElementById("invoiceDiscount").value = parsed.discount || 0;
    document.getElementById("invoiceNote").value = parsed.note || "";
    if (parsed.invoiceNumber) document.getElementById("invoiceNumber").value = parsed.invoiceNumber;
    if (parsed.items?.length) {
      document.getElementById("invoiceItems").innerHTML = "";
      parsed.items.forEach(addInvoiceItem);
    }
    updateInvoiceTotal();
    status.textContent = parsed.questions?.length
      ? `確認してください：${parsed.questions.join("／")}`
      : "内容を入力欄へ反映しました。請求先・金額・日付を確認してください。";
  } catch (error) {
    status.textContent = error.message;
  }
}

function renderAccountingClients() {
  const list = document.getElementById("accountingClientList");
  if (!list || !accountingData) return;
  const clients = accountingData.clients.filter(client => client.active !== false);
  list.innerHTML = clients.length
    ? clients.map(client => `<button type="button" data-client-edit="${client.id}"><strong>${escapeHtml(client.companyName)} <em>${client.clientType === "individual" ? "個人" : "法人"}</em></strong><small>${escapeHtml(client.shortName || client.address || "詳細未登録")}</small></button>`).join("")
    : `<p>請求先はまだ登録されていません。</p>`;
}

function clearAccountingClientForm() {
  document.getElementById("accountingClientForm").reset();
  document.getElementById("clientId").value = "";
  document.getElementById("accountingClientFormTitle").textContent = "新しいクライアントを追加";
  document.getElementById("clientRegistrationStatus").textContent = "";
  document.querySelectorAll("[data-client-edit]").forEach(button => button.classList.remove("active"));
  document.getElementById("accountingClientForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

function editAccountingClient(clientId) {
  const client = accountingData.clients.find(item => item.id === clientId);
  if (!client) return;
  document.querySelectorAll("[data-client-edit]").forEach(button => {
    button.classList.toggle("active", button.dataset.clientEdit === clientId);
  });
  document.getElementById("clientId").value = client.id;
  document.getElementById("accountingClientFormTitle").textContent = `${client.companyName}の登録情報を修正`;
  document.getElementById("clientRegistrationText").value = [
    client.companyName,
    `区分：${client.clientType === "individual" ? "個人" : "法人"}`,
    client.kana ? `フリガナ：${client.kana}` : "",
    client.shortName ? `略称：${client.shortName}` : "",
    client.aliases?.length ? `呼び名：${client.aliases.join("、")}` : "",
    client.postalCode ? `郵便番号：${client.postalCode}` : "",
    client.address ? `住所：${client.address}${client.building || ""}` : "",
    client.department ? `部署：${client.department}` : "",
    client.contactName ? `担当者：${client.contactTitle ? `${client.contactTitle} ` : ""}${client.contactName}` : "",
    client.phone ? `電話：${client.phone}` : "",
    client.email ? `メール：${client.email}` : "",
    client.lineUserId ? `LINE送信先ID：${client.lineUserId}` : "",
    client.defaultItem ? `通常の請求項目：${client.defaultItem}` : "",
    client.defaultAmount ? `通常金額：${accountingYen(client.defaultAmount)}（${client.taxMode === "excluded" ? "税抜" : "税込"}）` : "",
    client.paymentTerms ? `支払条件：${client.paymentTerms}` : "",
    client.note ? `備考：${client.note}` : "",
  ].filter(Boolean).join("\n");
  document.getElementById("clientRegistrationStatus").textContent = "変更したい部分を、この文章の中でそのまま書き換えてください。";
  document.getElementById("accountingClientForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function saveAccountingClient(event) {
  event.preventDefault();
  const clientId = document.getElementById("clientId").value;
  const instruction = document.getElementById("clientRegistrationText").value.trim();
  const status = document.getElementById("clientRegistrationStatus");
  const submitButton = event.currentTarget.querySelector('button[type="submit"]');
  if (!instruction) return;
  if (clientId && !window.confirm("この文章の内容で登録済み請求先を更新しますか？")) return;
  status.textContent = "会社情報を整理しています…";
  submitButton.disabled = true;
  const parseResponse = await fetch("/api/accounting/client-parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instruction, clientId }),
  });
  const parsed = await readAccountingJson(parseResponse, "請求先情報を整理できませんでした。");
  if (!parseResponse.ok) {
    submitButton.disabled = false;
    status.textContent = parsed.error || "請求先情報を整理できませんでした。";
    return;
  }
  const client = { ...parsed.client, id: clientId || parsed.client.id || "", active: true };
  if (!client.companyName) {
    submitButton.disabled = false;
    status.textContent = "正式会社名を文章の中へ入れてください。";
    return;
  }
  const response = await fetch("/api/accounting", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "save-client", client }),
  });
  const result = await readAccountingJson(response, "請求先を保存できませんでした。");
  submitButton.disabled = false;
  if (!response.ok) {
    status.textContent = result.error || "請求先を保存できませんでした。";
    return;
  }
  accountingData = result.data;
  const savedName = client.companyName;
  clearAccountingClientForm();
  renderAccountingClients();
  populateInvoiceClients();
  document.getElementById("clientRegistrationStatus").textContent = `${savedName}を登録しました。`;
}

function renderAccountingSettings() {
  if (!accountingData) return;
  const issuer = accountingData.issuer;
  const bank = accountingData.bankAccounts.find(item => item.isDefault) || accountingData.bankAccounts[0] || {};
  const settings = accountingData.invoiceSettings;
  const values = {
    issuerCompanyName: issuer.companyName,
    issuerPostalCode: issuer.postalCode,
    issuerAddress: issuer.address,
    issuerRepresentativeTitle: issuer.representativeTitle,
    issuerRepresentativeName: issuer.representativeName,
    issuerPhone: issuer.phone,
    issuerEmail: issuer.email,
    issuerRegistrationNumber: issuer.registrationNumber,
    bankName: bank.bankName,
    bankBranchName: bank.branchName,
    bankAccountType: bank.accountType,
    bankAccountNumber: bank.accountNumber,
    bankAccountName: bank.accountName,
    invoiceDefaultTaxRate: settings.taxRate,
    invoiceNumberPrefix: settings.numberPrefix,
    invoiceFeeNote: settings.feeNote,
  };
  Object.entries(values).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input) input.value = value ?? "";
  });
}

async function saveAccountingSettings() {
  const defaultBank = accountingData.bankAccounts.find(item => item.isDefault) || accountingData.bankAccounts[0] || {};
  const issuer = {
    ...accountingData.issuer,
    companyName: document.getElementById("issuerCompanyName").value,
    postalCode: document.getElementById("issuerPostalCode").value,
    address: document.getElementById("issuerAddress").value,
    representativeTitle: document.getElementById("issuerRepresentativeTitle").value,
    representativeName: document.getElementById("issuerRepresentativeName").value,
    phone: document.getElementById("issuerPhone").value,
    email: document.getElementById("issuerEmail").value,
    registrationNumber: document.getElementById("issuerRegistrationNumber").value,
  };
  const bankAccounts = [{
    ...defaultBank,
    id: defaultBank.id || "default-bank",
    bankName: document.getElementById("bankName").value,
    branchName: document.getElementById("bankBranchName").value,
    accountType: document.getElementById("bankAccountType").value,
    accountNumber: document.getElementById("bankAccountNumber").value,
    accountName: document.getElementById("bankAccountName").value,
    isDefault: true,
  }];
  const invoiceSettings = {
    ...accountingData.invoiceSettings,
    taxRate: Number(document.getElementById("invoiceDefaultTaxRate").value) || 10,
    numberPrefix: document.getElementById("invoiceNumberPrefix").value || "INV",
    feeNote: document.getElementById("invoiceFeeNote").value,
  };
  const response = await fetch("/api/accounting", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "save-settings", issuer, bankAccounts, invoiceSettings }),
  });
  const result = await readAccountingJson(response, "経理設定を保存できませんでした。");
  if (!response.ok) return window.alert(result.error || "設定を保存できませんでした。");
  accountingData = result.data;
  window.alert("経理設定を保存しました。");
}

function renderAccountingHistory() {
  const list = document.getElementById("accountingHistoryList");
  const count = document.getElementById("accountingHistoryCount");
  if (!list || !accountingData) return;
  count.textContent = `${accountingData.invoices.length}件`;
  list.innerHTML = accountingData.invoices.length
    ? accountingData.invoices.map(invoice => `<div class="accounting-history-row">
      <div><strong>${escapeHtml(invoice.client?.companyName || "")}</strong><small>${escapeHtml(invoice.invoiceNumber)}・${escapeHtml(invoice.invoiceDate)}</small></div>
      <b>${accountingYen(invoice.total)}</b>
      <select data-invoice-status="${invoice.id}">${["下書き","発行済み","送付済み","入金待ち","入金済み","支払期限超過","取消","再発行"].map(status => `<option${status === invoice.status ? " selected" : ""}>${status}</option>`).join("")}</select>
      <button type="button" class="invoice-reissue-btn" data-invoice-reissue="${invoice.id}">再発行</button>
      ${invoice.filePath
        ? `<a href="/api/accounting/invoice?id=${encodeURIComponent(invoice.id)}">${String(invoice.filename).toLowerCase().endsWith(".png") ? "画像" : "PDF"}</a>`
        : "<span>保管庫</span>"}
    </div>`).join("")
    : `<p>請求書履歴はまだありません。</p>`;
}

async function archiveAccountingInvoice(result) {
  const invoice = result.invoice;
  const archived = await archiveCompletedDeliverable({
    id: `invoice-${invoice.id}`,
    staffId: "invoice_clerk",
    staffName: "みさき",
    role: `請求書・${invoice.client.companyName}`,
    content: `請求先：${invoice.client.companyName}
請求金額：${accountingYen(invoice.total)}
請求日：${invoice.invoiceDate}
支払期限：${invoice.dueDate}
請求書番号：${invoice.invoiceNumber}`,
    image: `data:image/png;base64,${result.imageBase64}`,
    filename: invoice.filename,
    model: "",
    createdAt: invoice.createdAt,
  });
  if (!archived) throw new Error("請求書画像を完成物保管庫へ保存できませんでした。");
}

async function routeAccountingInstruction(instruction) {
  const text = String(instruction || "").trim();
  if (isCalendarSchedulingInstruction(text)) {
    await processCalendarInstruction(text);
    return;
  }
  if (/(請求先管理|顧客管理|送り先.*登録|請求先.*登録|顧客.*登録)/.test(text)) {
    await openAccountingDesk("", "clients");
    return;
  }
  if (/(経理設定|振込先.*設定|請求書.*設定)/.test(text)) {
    await openAccountingDesk("", "settings");
    return;
  }
  if (/(請求書.*履歴|発行履歴|完成物保管庫)/.test(text)) {
    await openAccountingDesk("", "history");
    return;
  }
  if (isInvoiceCreationInstruction(text)) {
    await processAccountingInstructionDirectly(text);
    return;
  }
  showBubble("invoice_clerk", "💬 日程調整か請求書作成の内容を、もう少し具体的に教えてください。", 7000);
  addLog("💬", "みさき：請求書作成とは判断しなかったため、作成処理は行いませんでした");
}

function isInvoiceCreationInstruction(text) {
  const value = String(text || "");
  if (value.includes("請求書")) return true;
  if (/(請求書|請求する|請求を).*(作成|作って|発行|送って|送付|お願い|頼む)|(?:作成|作って|発行|送って).*(請求書|請求)/.test(value)) {
    return true;
  }
  return /(?:運用費|編集費|撮影費|制作費|広告費|業務委託費|請求額|請求金額)/.test(value)
    && /(?:\d[\d,]*|[一二三四五六七八九十百千万]+)円/.test(value);
}

function isCalendarSchedulingInstruction(text) {
  const value = String(text || "");
  return /(撮影|打ち合わせ|打合せ|面談|ミーティング|日程|予定|空き|空いて|カレンダー|何時|何日|いつ(?:にします|がいい|が空いて|空いて|なら)|予定.*(?:キャンセル|取消|取り消|削除)|(?:キャンセル|取消|取り消|削除).*(?:予定|撮影|打ち合わせ|面談)|(?:この|その|さっきの|先ほどの|登録した)(?:予定)?を?(?:キャンセル|取消|取り消|削除)|(?:この|その)(?:時間|日時|日程|候補)で|(?:1|１|一|2|２|二|3|３|三)(?:つ目|番目|番)で|\d{1,2}月\d{1,2}日.*\d{1,2}時|\d{1,2}時(?:半)?(?:で|から).*(?:お願い|決定|確定))/.test(value)
    && !/(請求書|請求先|振込先|入金)/.test(value);
}

function calendarConversationId() {
  const key = "ai-office-calendar-conversation-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

async function processCalendarInstruction(instruction) {
  const staffId = "invoice_clerk";
  showBubble(staffId, "💬 カレンダーを確認します。", 3200);
  addLog("📅", "みさきが社長の個人予定を確認しています");
  try {
    const response = await fetch("/api/calendar/instruction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instruction,
        conversationId: calendarConversationId(),
      }),
    });
    const result = await readAccountingJson(response, "Googleカレンダーを確認できませんでした。");
    if (!response.ok) throw new Error(result.error || "Googleカレンダーを確認できませんでした。");
    showBubble(staffId, `💬 ${result.message}`, 10000);
    addLog(result.booked ? "✅" : "📅", `みさき：${result.message}`);
    speak(result.message, STAFF.findIndex(staff => staff.id === staffId));
  } catch (error) {
    showBubble(staffId, `💬 ${error.message}`, 9000);
    addLog("⚠️", `カレンダー連携エラー：${error.message}`);
  }
}

async function updateCalendarConnectionStatus() {
  const status = document.getElementById("calendarConnectionStatus");
  const button = document.getElementById("calendarConnectButton");
  if (!status || !button) return;
  try {
    const response = await fetch("/api/calendar/status");
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "接続状態を確認できません。");
    if (result.connected) {
      status.textContent = `接続済み：${result.calendarId}`;
      button.textContent = "Googleカレンダーを再接続";
    } else if (result.configured) {
      status.textContent = "環境設定済み・Googleアカウントの接続待ち";
      button.textContent = "Googleカレンダーに接続";
    } else {
      status.textContent = "Googleカレンダーの環境変数が不足しています";
      button.textContent = "設定を確認";
    }
  } catch {
    status.textContent = "接続状態を確認できませんでした";
  }
}

async function processAccountingInstructionDirectly(instruction) {
  const staffId = "invoice_clerk";
  showBubble(staffId, "💬 音声の内容を確認して請求書を作成します。", 4500);
  addLog("🧾", "みさきが請求内容を整理しています");
  try {
    const parseResponse = await fetch("/api/accounting/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instruction }),
    });
    const parsed = await readAccountingJson(parseResponse, "請求内容を読み取れませんでした。");
    if (!parseResponse.ok) throw new Error(parsed.error || "請求内容を読み取れませんでした。");

    const missing = [];
    if (!parsed.clientId) missing.push("登録済みの請求先");
    if (!parsed.invoiceDate) missing.push("請求日");
    if (parsed.clientId && !parsed.dueDate) missing.push("支払期限");
    if (!parsed.items?.length || !parsed.items.some(item => item.description && Number(item.amount || item.unitPrice))) {
      missing.push("請求項目と金額");
    }
    const questions = [...new Set([...(parsed.questions || []), ...(missing.length ? [`不足情報：${missing.join("、")}`] : [])])];
    if (missing.length || questions.some(question => /一致しません|複数|確認してください|不明|不足/.test(question))) {
      const message = questions.join("／") || "請求内容に不足があります。";
      showBubble(staffId, `💬 ${message}`, 9000);
      addLog("⚠️", `請求書を作成できませんでした：${message}`);
      return;
    }

    const invoiceResponse = await fetch("/api/accounting/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: parsed.clientId,
        invoiceDate: parsed.invoiceDate,
        dueDate: parsed.dueDate,
        closingDate: parsed.closingDate,
        period: parsed.period,
        taxMode: parsed.taxMode,
        discount: parsed.discount,
        invoiceNumber: parsed.invoiceNumber,
        note: parsed.note,
        bankAccountId: parsed.bankAccountId,
        items: parsed.items,
      }),
    });
    const result = await readAccountingJson(invoiceResponse, "請求書画像を作成できませんでした。");
    if (!invoiceResponse.ok) throw new Error(result.error || "請求書を作成できませんでした。");
    await archiveAccountingInvoice(result);
    accountingData = null;
    showBubble(staffId, `💬 ${result.invoice.client.companyName}宛ての請求書を完成物保管庫へ保存しました。`, 8000);
    addLog("✅", `みさきが${result.invoice.client.companyName}宛ての請求書を完成物保管庫へ保存しました`);
  } catch (error) {
    showBubble(staffId, `💬 ${error.message}`, 8000);
    addLog("⚠️", `請求書作成エラー：${error.message}`);
  }
}

async function createAccountingInvoice() {
  const button = document.getElementById("invoiceCreatePdf");
  const status = document.getElementById("accountingParseStatus");
  const selectedClientId = document.getElementById("invoiceClientSelect").value;
  const payload = {
    clientId: selectedClientId,
    invoiceDate: document.getElementById("invoiceDate").value,
    dueDate: document.getElementById("invoiceDueDate").value,
    closingDate: document.getElementById("invoiceClosingDate").value,
    period: document.getElementById("invoicePeriod").value,
    taxMode: document.getElementById("invoiceTaxMode").value,
    discount: Number(document.getElementById("invoiceDiscount").value) || 0,
    invoiceNumber: document.getElementById("invoiceNumber").value.trim(),
    note: document.getElementById("invoiceNote").value,
    items: readInvoiceItems(),
  };
  if (!selectedClientId) {
    return window.alert("登録済みの請求先が選択されていません。請求先を事前登録し、音声指示で会社名または呼び名を伝えてください。");
  }
  button.disabled = true;
  button.textContent = "画像を作成しています…";
  status.textContent = "A4比率・高解像度の請求書画像を作成しています…";
  try {
    const response = await fetch("/api/accounting/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await readAccountingJson(response, "請求書画像を作成できませんでした。");
    if (!response.ok) throw new Error(result.error || "請求書を作成できませんでした。");
    await archiveAccountingInvoice(result);
    await loadAccountingDeskData();
    status.textContent = `${result.invoice.client.companyName}宛ての請求書を完成物保管庫へ保存しました。自動ダウンロードはしていません。請求金額：${accountingYen(result.invoice.total)}／請求日：${result.invoice.invoiceDate}／支払期限：${result.invoice.dueDate}`;
    addLog("🧾", `みさきが${result.invoice.client.companyName}宛ての請求書画像を完成物保管庫へ保存しました`);
    showBubble("invoice_clerk", "💬 請求書画像を完成物保管庫へ保存しました。必要なときにダウンロードしてください。", 6000);
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = "請求書画像を作成";
  }
}

document.getElementById("accountingClose")?.addEventListener("click", closeAccountingDesk);
document.getElementById("accountingOverlay")?.addEventListener("click", event => {
  if (event.target.id === "accountingOverlay") closeAccountingDesk();
});
document.querySelectorAll("[data-accounting-tab]").forEach(button => button.addEventListener("click", () => switchAccountingTab(button.dataset.accountingTab)));
document.getElementById("accountingParseBtn")?.addEventListener("click", parseAccountingInstruction);
document.getElementById("invoiceAddItem")?.addEventListener("click", () => addInvoiceItem());
document.getElementById("invoiceItems")?.addEventListener("input", event => {
  const row = event.target.closest(".invoice-item-row");
  if (row && (event.target.matches(".invoice-item-quantity") || event.target.matches(".invoice-item-price"))) {
    const quantity = Number(row.querySelector(".invoice-item-quantity").value) || 0;
    const price = Number(row.querySelector(".invoice-item-price").value) || 0;
    row.querySelector(".invoice-item-amount").value = quantity * price;
  }
  updateInvoiceTotal();
});
document.getElementById("invoiceItems")?.addEventListener("click", event => {
  if (!event.target.matches(".invoice-item-remove")) return;
  event.target.closest(".invoice-item-row").remove();
  if (!document.querySelector("#invoiceItems .invoice-item-row")) addInvoiceItem();
  updateInvoiceTotal();
});
document.getElementById("invoiceDiscount")?.addEventListener("input", updateInvoiceTotal);
document.getElementById("invoiceTaxMode")?.addEventListener("change", updateInvoiceTotal);
document.getElementById("invoiceCreatePdf")?.addEventListener("click", createAccountingInvoice);
document.getElementById("newAccountingClient")?.addEventListener("click", clearAccountingClientForm);
document.getElementById("accountingClientList")?.addEventListener("click", event => {
  const button = event.target.closest("[data-client-edit]");
  if (button) editAccountingClient(button.dataset.clientEdit);
});
document.getElementById("accountingClientForm")?.addEventListener("submit", saveAccountingClient);
document.getElementById("clientRegistrationMic")?.addEventListener("click", () => {
  const button = document.getElementById("clientRegistrationMic");
  const input = document.getElementById("clientRegistrationText");
  if (!SpeechRecognitionCtor) return window.alert("このブラウザでは音声入力を使用できません。");
  if (clientRegistrationRecognition) {
    clientRegistrationRecognition.stop();
    clientRegistrationRecognition = null;
    button.classList.remove("listening");
    button.textContent = "🎤 音声でまとめて入力";
    return;
  }
  const recognition = new SpeechRecognitionCtor();
  recognition.lang = "ja-JP";
  recognition.continuous = true;
  recognition.interimResults = true;
  let finalText = input.value;
  recognition.onresult = event => {
    let partial = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const text = event.results[index][0].transcript;
      if (event.results[index].isFinal) finalText += `${finalText ? "\n" : ""}${text}`;
      else partial += text;
    }
    input.value = `${finalText}${partial ? `\n${partial}` : ""}`.trim();
  };
  recognition.onend = () => {
    clientRegistrationRecognition = null;
    button.classList.remove("listening");
    button.textContent = "🎤 音声でまとめて入力";
  };
  recognition.onerror = () => {
    document.getElementById("clientRegistrationStatus").textContent = "音声を聞き取れませんでした。もう一度お試しください。";
  };
  clientRegistrationRecognition = recognition;
  recognition.start();
  button.classList.add("listening");
  button.textContent = "⏹ 音声入力を終了";
});
document.getElementById("deleteAccountingClient")?.addEventListener("click", async () => {
  const clientId = document.getElementById("clientId").value;
  if (!clientId || !window.confirm("この請求先を一覧から無効化しますか？過去の請求書は残ります。")) return;
  const response = await fetch("/api/accounting", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete-client", clientId }) });
  const result = await readAccountingJson(response, "クライアント情報を更新できませんでした。");
  if (response.ok) {
    accountingData = result.data;
    clearAccountingClientForm();
    renderAccountingClients();
    populateInvoiceClients();
  }
});
document.getElementById("accountingSaveSettings")?.addEventListener("click", saveAccountingSettings);

const calendarCallbackState = new URLSearchParams(window.location.search).get("calendar");
if (calendarCallbackState) {
  window.history.replaceState({}, "", window.location.pathname);
  window.setTimeout(async () => {
    await openAccountingDesk("", "settings");
    const message = calendarCallbackState === "connected"
      ? "Googleカレンダーと接続しました。"
      : calendarCallbackState === "denied"
        ? "Googleカレンダーへの接続がキャンセルされました。"
        : "Googleカレンダーへの接続に失敗しました。";
    showBubble("invoice_clerk", `💬 ${message}`, 7000);
    addLog(calendarCallbackState === "connected" ? "✅" : "⚠️", message);
  }, 300);
}
document.getElementById("accountingHistoryList")?.addEventListener("change", async event => {
  if (!event.target.matches("[data-invoice-status]")) return;
  await fetch("/api/accounting", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "update-status", invoiceId: event.target.dataset.invoiceStatus, status: event.target.value }),
  });
});
document.getElementById("accountingHistoryList")?.addEventListener("click", async event => {
  const button = event.target.closest("[data-invoice-reissue]");
  if (!button || !accountingData) return;
  const original = accountingData.invoices.find(item => item.id === button.dataset.invoiceReissue);
  if (!original || !window.confirm(`${original.invoiceNumber}を再発行しますか？元の請求書ファイルは残ります。`)) return;
  const baseNumber = original.invoiceNumber.replace(/-R\d+$/, "");
  const revisionCount = accountingData.invoices.filter(item => item.invoiceNumber.startsWith(`${baseNumber}-R`)).length + 1;
  button.disabled = true;
  try {
    const response = await fetch("/api/accounting/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: { ...original.client, id: "" },
        invoiceDate: original.invoiceDate,
        dueDate: original.dueDate,
        closingDate: original.closingDate,
        period: original.period,
        taxMode: original.taxMode,
        taxRate: original.taxRate,
        discount: original.discount,
        note: original.note,
        items: original.items,
        invoiceNumber: `${baseNumber}-R${revisionCount}`,
      }),
    });
    const result = await readAccountingJson(response, "請求書を再発行できませんでした。");
    if (!response.ok) throw new Error(result.error || "再発行できませんでした。");
    await archiveAccountingInvoice(result);
    await loadAccountingDeskData();
  } catch (error) {
    window.alert(error.message);
  } finally {
    button.disabled = false;
  }
});
document.getElementById("accountingMicBtn")?.addEventListener("click", () => {
  const button = document.getElementById("accountingMicBtn");
  if (!SpeechRecognitionCtor) return window.alert("このブラウザでは音声入力を使用できません。");
  if (accountingRecognition) {
    accountingRecognition.stop();
    accountingRecognition = null;
    button.classList.remove("listening");
    button.textContent = "🎤 音声入力";
    return;
  }
  const recognition = new SpeechRecognitionCtor();
  recognition.lang = "ja-JP";
  recognition.continuous = true;
  recognition.interimResults = true;
  let finalText = document.getElementById("accountingInstruction").value;
  recognition.onresult = event => {
    let partial = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const text = event.results[index][0].transcript;
      if (event.results[index].isFinal) finalText += `${finalText ? " " : ""}${text}`;
      else partial += text;
    }
    document.getElementById("accountingInstruction").value = `${finalText}${partial ? ` ${partial}` : ""}`.trim();
  };
  recognition.onend = () => {
    accountingRecognition = null;
    button.classList.remove("listening");
    button.textContent = "🎤 音声入力";
  };
  recognition.start();
  accountingRecognition = recognition;
  button.classList.add("listening");
  button.textContent = "■ 停止";
});

// 事務所報酬の計算。
//
// 金額の算出をAIに任せると、表を取り違える・一部だけ換算する・料率を混同する、
// といった間違いが実際に繰り返し起きた。ここでは料率を定数として持ち、
// 計算は必ずコードで行う。AIには文章を書かせるだけにする。
//
// 料率はすべて「【TikTok】事務所報酬表」の記載に基づく。
// 資料から確定できなかった箇所は null にしてあり、推測では埋めない。
// null に当たった場合は金額を出さず、未確定である旨を返す。

// 課金額からダイヤ数へ。1コイン≒1.7円、1コイン=1ダイヤ（資料4ページ）。
const YEN_PER_DIAMOND = 1.7;

export const REWARD_CONFIG = {
  agencyLevel: 1,        // ③売上増加インセンティブに使う事務所評価レベル(1〜7)
  liverRewardRate: 0.004, // ライバー報酬の報酬率(40% = $0.004)
  exchangeRate: 150,      // 為替(円/ドル)
  retained: {
    internal: 0.8,        // 良心の受取（一次代理店の20%を除いた分）
    agency: 0.7,          // 3次代理店の受取（さらに10%減）
  },
};

// クリエイターのランク基準（月間獲得ダイヤ数・資料10ページ）
const RANK_THRESHOLDS = [
  { rank: 1, min: 0 },
  { rank: 2, min: 100_000 },
  { rank: 3, min: 200_000 },
  { rank: 4, min: 300_000 },
  { rank: 5, min: 500_000 },
  { rank: 6, min: 1_000_000 },
  { rank: 7, min: 1_600_000 },
  { rank: 8, min: 3_000_000 },
  { rank: 9, min: 5_000_000 },
  { rank: 10, min: 8_000_000 },
];

// ①ランクアップ／維持インセンティブ（資料11ページ）
// PDFから文字を取り出した際にランクと数値の対応が崩れており、
// 計算例から逆算して確認できた値のみを入れている。残りは要確認。
const RANK_UP_RATES = {
  1: null, 2: 0.00055, 3: null, 4: null, 5: null,
  6: null, 7: null, 8: null, 9: null, 10: null,
};
const RANK_KEEP_RATES = {
  1: null, 2: null, 3: null, 4: null, 5: 0.00015,
  6: null, 7: null, 8: null, 9: null, 10: null,
};

// ②アクティブインセンティブ（資料14ページ）ライバー評価レベル別
const ACTIVE_RATES = { 5: 0.0004, 4: 0.0003, 3: 0.0002, 2: 0.0001, 1: 0.00005 };

// ③売上増加インセンティブ（資料17ページ）事務所評価レベル別
const SALES_RATES = { 7: 0.0015, 6: 0.0012, 5: 0.001, 4: 0.0008, 3: 0.0006, 2: 0.0003, 1: 0.0002, 0: 0 };

// ④優良クリエイターインセンティブ（資料20ページ）ライバー評価レベル別。
// 他配信プラットフォームでの実績保有者のみ、6ヶ月限定。通常は加算しない。
const PREMIUM_RATES = { 5: 0.002, 4: 0.0012, 3: 0.001, 2: 0.0008, 1: 0.0005 };

export function yenToDiamonds(yen) {
  return Math.round(Number(yen) / YEN_PER_DIAMOND);
}

export function rankForDiamonds(diamonds) {
  let rank = 1;
  for (const tier of RANK_THRESHOLDS) {
    if (diamonds >= tier.min) rank = tier.rank;
  }
  return rank;
}

function amount(diamonds, rate, config) {
  return Math.round(diamonds * rate * config.exchangeRate);
}

// rankMovement: "keep" | "up" | "down"（ランクダウンは①の対象外）
export function calculateReward({
  diamonds,
  liverLevel = 5,
  rankMovement = "keep",
  previousRank = null,
  includePremium = false,
  config = REWARD_CONFIG,
}) {
  const rank = previousRank ?? rankForDiamonds(diamonds);
  const breakdown = [];
  const unresolved = [];

  // ①ランクアップ/維持
  if (rankMovement === "down") {
    breakdown.push({ key: "rank", label: "ランクアップ/維持インセンティブ", amount: 0, note: "ランクダウンのため対象外" });
  } else {
    const table = rankMovement === "up" ? RANK_UP_RATES : RANK_KEEP_RATES;
    const rate = table[rank];
    if (rate == null) {
      unresolved.push(`ランク${rank}の${rankMovement === "up" ? "ランクアップ" : "ランク維持"}単価`);
    } else {
      breakdown.push({ key: "rank", label: "ランクアップ/維持インセンティブ", amount: amount(diamonds, rate, config) });
    }
  }

  // ②アクティブ
  const activeRate = ACTIVE_RATES[liverLevel];
  if (activeRate == null) unresolved.push(`ライバー評価レベル${liverLevel}のアクティブ単価`);
  else breakdown.push({ key: "active", label: "アクティブインセンティブ", amount: amount(diamonds, activeRate, config) });

  // ③売上増加
  const salesRate = SALES_RATES[config.agencyLevel];
  if (salesRate == null) unresolved.push(`事務所評価レベル${config.agencyLevel}の売上増加単価`);
  else breakdown.push({ key: "sales", label: "売上増加インセンティブ", amount: amount(diamonds, salesRate, config) });

  // ④優良クリエイター（対象者のみ）
  if (includePremium) {
    const premiumRate = PREMIUM_RATES[liverLevel];
    if (premiumRate == null) unresolved.push(`ライバー評価レベル${liverLevel}の優良クリエイター単価`);
    else breakdown.push({ key: "premium", label: "優良クリエイターインセンティブ", amount: amount(diamonds, premiumRate, config) });
  }

  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);
  return {
    diamonds,
    rank,
    liverReward: amount(diamonds, config.liverRewardRate, config),
    breakdown,
    total,
    internal: Math.round(total * config.retained.internal),
    agency: Math.round(total * config.retained.agency),
    // 料率が確定していない項目がある場合、その金額は合計に含まれていない。
    // 呼び出し側はこれが空でないときに金額を提示してはいけない。
    unresolved,
  };
}

// 請求書PNGをNode.js(sharp)だけで生成する。
// 旧版はPythonスクリプト(PIL)+Macのシステムフォントに依存していて、
// Vercelのサーバーレス環境(Pythonなし・システムフォントなし)では動かなかった。
// ここではフォントをプロジェクト同梱(assets/fonts)にし、SVGをsharpでラスタライズして
// 元のテンプレートPNGに合成することで、ローカルでもVercel上でも同じように動く。

import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const NAVY = "#21364a";
const MUTED = "#66717d";

let fontBase64Cache = null;
async function getFontBase64() {
  if (fontBase64Cache) return fontBase64Cache;
  const fontPath = path.join(process.cwd(), "assets", "fonts", "BIZUDMincho-Regular.ttf");
  const buffer = await readFile(fontPath);
  fontBase64Cache = buffer.toString("base64");
  return fontBase64Cache;
}

function clean(value) {
  return String(value ?? "").normalize("NFC").replace(/️/g, "");
}

function money(value) {
  const n = Math.trunc(Number(value) || 0);
  return `¥${n.toLocaleString("en-US")}`;
}

// 日本語(全角)はほぼ正方形、半角英数はその半分程度という近似でテキスト幅を見積もる。
// PILの実測(textbbox)ほど厳密ではないが、詰め・折り返し判定には十分。
function isFullWidth(ch) {
  const code = ch.codePointAt(0);
  return (
    (code >= 0x3000 && code <= 0x30ff) || // 記号・ひらがな・カタカナ
    (code >= 0x3400 && code <= 0x9fff) || // 漢字
    (code >= 0xff00 && code <= 0xffef) || // 全角英数・記号
    (code >= 0x20000 && code <= 0x2ffff) // 拡張漢字
  );
}

function estimateWidth(text, fontSize) {
  let width = 0;
  for (const ch of clean(text)) {
    width += fontSize * (isFullWidth(ch) ? 1.0 : 0.56);
  }
  return width;
}

function fitFontSize(text, maxWidth, initialSize, minimum = 18) {
  let size = initialSize;
  while (size > minimum && estimateWidth(text, size) > maxWidth) size -= 1;
  return size;
}

function wrapLines(text, maxWidth, fontSize, maxLines = 2) {
  const lines = [];
  let current = "";
  for (const ch of clean(text)) {
    const trial = current + ch;
    if (current && estimateWidth(trial, fontSize) > maxWidth) {
      lines.push(current);
      current = ch;
      if (lines.length >= maxLines) return lines;
    } else {
      current = trial;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

function esc(value) {
  return clean(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// PILの draw.text は anchor未指定(または"a"系)だとyがテキスト上端になるため、
// SVGのtext(yはベースライン)に合わせて一律でオフセットする。
function baselineY(y, fontSize) {
  return y + fontSize * 0.88;
}

function textEl({ x, y, size, fill = NAVY, text, align = "left" }) {
  const anchor = align === "right" ? "end" : "start";
  return `<text x="${x}" y="${baselineY(y, size)}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-family="BIZUDMincho">${esc(text)}</text>`;
}

export async function renderInvoiceImage(payload) {
  const templatePath = path.join(process.cwd(), "assets", "invoice-template.png");
  const template = sharp(templatePath);
  const { width, height } = await template.metadata();

  const client = payload.client || {};
  const issuer = payload.issuer || {};
  const bank = payload.bank || {};
  const elements = [];

  elements.push(textEl({ x: 1538, y: 112, size: 27, fill: MUTED, text: payload.invoiceNumber || "", align: "right" }));
  elements.push(textEl({ x: 1538, y: 158, size: 27, fill: MUTED, text: payload.invoiceDate || "", align: "right" }));
  elements.push(textEl({ x: 1538, y: 204, size: 27, fill: MUTED, text: payload.dueDate || "", align: "right" }));

  // 請求先
  const name = clean(client.companyName || "");
  const clientType = client.clientType || "company";
  const contact = clean(client.contactName || "");
  const department = clean(client.department || "");
  let y = 360;
  if (clientType === "individual") {
    const label = `${name} 様`;
    elements.push(textEl({ x: 116, y, size: fitFontSize(label, 700, 39), text: label }));
    y += 58;
  } else if (contact) {
    elements.push(textEl({ x: 116, y, size: fitFontSize(name, 700, 39), text: name }));
    y += 55;
    const line = `${department ? department + " " : ""}${contact} 様`;
    elements.push(textEl({ x: 116, y, size: 30, text: line }));
    y += 50;
  } else {
    const label = `${name} 御中`;
    elements.push(textEl({ x: 116, y, size: fitFontSize(label, 700, 39), text: label }));
    y += 58;
  }
  if (client.postalCode) {
    elements.push(textEl({ x: 116, y, size: 25, fill: MUTED, text: `〒${clean(client.postalCode)}` }));
    y += 39;
  }
  for (const line of wrapLines(`${client.address || ""}${client.building || ""}`, 700, 25)) {
    elements.push(textEl({ x: 116, y, size: 25, fill: MUTED, text: line }));
    y += 39;
  }

  // 請求元
  let iy = 360;
  elements.push(textEl({ x: 978, y: iy, size: fitFontSize(issuer.companyName || "", 560, 35), text: issuer.companyName || "" }));
  iy += 50;
  if (issuer.postalCode) {
    elements.push(textEl({ x: 978, y: iy, size: 24, fill: MUTED, text: `〒${clean(issuer.postalCode)}` }));
    iy += 38;
  }
  for (const line of wrapLines(issuer.address || "", 560, 24)) {
    elements.push(textEl({ x: 978, y: iy, size: 24, fill: MUTED, text: line }));
    iy += 36;
  }
  const representative = `${issuer.representativeTitle || ""} ${issuer.representativeName || ""}`.trim();
  elements.push(textEl({ x: 978, y: iy, size: 24, fill: MUTED, text: representative }));
  if (issuer.registrationNumber) {
    elements.push(textEl({ x: 978, y: iy + 36, size: 22, fill: MUTED, text: `登録番号：${issuer.registrationNumber}` }));
  }

  // 合計金額(大)
  elements.push(textEl({ x: 1462, y: 651, size: 52, text: `${money(payload.total)}（税込）`, align: "right" }));

  // 明細
  let rowY = 924;
  for (const item of (payload.items || []).slice(0, 6)) {
    const description = clean(item.description || "");
    elements.push(textEl({ x: 150, y: rowY, size: fitFontSize(description, 760, 27, 19), text: description }));
    elements.push(textEl({ x: 1040, y: rowY, size: 25, text: String(item.quantity ?? 1), align: "right" }));
    elements.push(textEl({ x: 1174, y: rowY, size: 25, text: String(item.unit || "式"), align: "right" }));
    elements.push(textEl({ x: 1372, y: rowY, size: 25, text: money(item.unitPrice || 0), align: "right" }));
    elements.push(textEl({ x: 1510, y: rowY, size: 25, text: money(item.amount || 0), align: "right" }));
    rowY += 70;
  }

  // 小計・値引・消費税・合計
  const summaryTop = 1376;
  const values = [payload.subtotal || 0, -(Number(payload.discount) || 0), payload.tax || 0, payload.total || 0];
  values.forEach((value, index) => {
    elements.push(textEl({
      x: 1510,
      y: summaryTop + 20 + index * 70,
      size: index < 3 ? 28 : 34,
      text: money(value),
      align: "right",
    }));
  });

  // 振込先
  elements.push(textEl({ x: 116, y: 1830, size: 27, text: `${clean(bank.bankName)} ${clean(bank.branchName)}`.trim() }));
  elements.push(textEl({ x: 116, y: 1872, size: 27, text: `${clean(bank.accountType)} ${clean(bank.accountNumber)}`.trim() }));
  elements.push(textEl({ x: 116, y: 1914, size: 27, text: `口座名義：${clean(bank.accountName)}` }));

  // 備考
  let noteY = 1830;
  for (const line of wrapLines(payload.note || "", 660, 23, 4)) {
    elements.push(textEl({ x: 860, y: noteY, size: 23, fill: MUTED, text: line }));
    noteY += 37;
  }
  // 振込手数料の定型文
  let feeY = 2165;
  for (const line of wrapLines(payload.feeNote || "", 1400, 21, 2)) {
    elements.push(textEl({ x: 116, y: feeY, size: 21, fill: MUTED, text: line }));
    feeY += 32;
  }
  // フッター
  elements.push(textEl({ x: 1538, y: 2245, size: 22, fill: MUTED, text: issuer.companyName || "", align: "right" }));

  const fontBase64 = await getFontBase64();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <style>
      @font-face {
        font-family: 'BIZUDMincho';
        src: url(data:font/ttf;base64,${fontBase64}) format('truetype');
      }
      text { font-family: 'BIZUDMincho'; }
    </style>
  </defs>
  ${elements.join("\n  ")}
</svg>`;

  const textLayer = await sharp(Buffer.from(svg)).png().toBuffer();
  return sharp(templatePath)
    .composite([{ input: textLayer, top: 0, left: 0 }])
    .png({ compressionLevel: 6 })
    .toBuffer();
}

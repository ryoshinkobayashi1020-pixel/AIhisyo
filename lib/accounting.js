import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), ".data");
const accountingFile = path.join(dataDirectory, "accounting.json");
const temporaryFile = path.join(dataDirectory, "accounting.tmp.json");
export const invoiceDirectory = path.join(dataDirectory, "invoices");

const defaultData = {
  issuer: {
    companyName: "合同会社良心",
    postalCode: "920-0849",
    address: "石川県金沢市堀川新町5番1号 アリマビル3F",
    representativeTitle: "代表社員",
    representativeName: "小林晃大",
    phone: "",
    email: "",
    registrationNumber: "",
    contactName: "",
    note: "",
  },
  bankAccounts: [{
    id: "mizuho-kanazawa",
    bankName: "みずほ銀行",
    branchName: "金沢支店",
    branchNumber: "",
    accountType: "普通預金",
    accountNumber: "3009238",
    accountName: "ド）リョウシン",
    displayName: "通常口座",
    isDefault: true,
  }],
  invoiceSettings: {
    title: "請求書",
    numberPrefix: "INV",
    taxRate: 10,
    taxRounding: "round",
    feeNote: "恐れ入りますが、振込手数料は貴社にてご負担くださいますようお願いいたします。",
    defaultNote: "",
    defaultTaxMode: "included",
    defaultDueRule: "",
    showAddress: true,
    showQuantity: true,
    showUnit: true,
  },
  contacts: [],
  clients: [],
  invoices: [],
  counters: {},
};

function cloneDefaults() {
  return structuredClone(defaultData);
}

function mergeData(stored = {}) {
  const base = cloneDefaults();
  return {
    ...base,
    ...stored,
    issuer: { ...base.issuer, ...(stored.issuer || {}) },
    invoiceSettings: { ...base.invoiceSettings, ...(stored.invoiceSettings || {}) },
    bankAccounts: Array.isArray(stored.bankAccounts) && stored.bankAccounts.length
      ? stored.bankAccounts
      : base.bankAccounts,
    contacts: Array.isArray(stored.contacts) ? stored.contacts : [],
    clients: Array.isArray(stored.clients) ? stored.clients : [],
    invoices: Array.isArray(stored.invoices) ? stored.invoices : [],
    counters: stored.counters && typeof stored.counters === "object" ? stored.counters : {},
  };
}

export async function loadAccountingData() {
  try {
    return mergeData(JSON.parse(await readFile(accountingFile, "utf8")));
  } catch (error) {
    if (error?.code === "ENOENT") return cloneDefaults();
    throw error;
  }
}

export async function saveAccountingData(data) {
  const safe = mergeData(data);
  await mkdir(dataDirectory, { recursive: true });
  await mkdir(invoiceDirectory, { recursive: true });
  await writeFile(temporaryFile, JSON.stringify(safe, null, 2), "utf8");
  await rename(temporaryFile, accountingFile);
  return safe;
}

export function normalizeName(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\s・、。,.]/g, "")
    .toLowerCase();
}

export function findClientCandidates(clients, query) {
  const normalized = normalizeName(query);
  if (!normalized) return [];
  const score = client => {
    const fields = [
      [client.companyName, 100],
      [client.shortName, 90],
      ...(client.aliases || []).map(alias => [alias, 85]),
      [client.kana, 75],
    ];
    let best = 0;
    for (const [value, exactScore] of fields) {
      const candidate = normalizeName(value);
      if (!candidate) continue;
      if (candidate === normalized) best = Math.max(best, exactScore);
      else if (candidate.includes(normalized) || normalized.includes(candidate)) best = Math.max(best, exactScore - 25);
    }
    return best;
  };
  return clients
    .filter(client => client.active !== false)
    .map(client => ({ client, score: score(client) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function nextInvoiceNumber(data, dateText) {
  const compactDate = String(dateText).replace(/\D/g, "").slice(0, 8);
  const prefix = data.invoiceSettings.numberPrefix || "INV";
  const key = `${prefix}-${compactDate}`;
  const next = (Number(data.counters[key]) || 0) + 1;
  data.counters[key] = next;
  return `${key}-${String(next).padStart(3, "0")}`;
}

export function sanitizeFilename(value) {
  return String(value || "")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 120);
}

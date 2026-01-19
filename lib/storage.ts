export type UiLang = 'ca' | 'es';

export type Client = {
  id: string;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type Company = {
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoDataUrl?: string; // base64
};

export type QuoteLineType = 'product' | 'service' | 'transport' | 'info';

export type QuoteLine = {
  id: string;
  type: QuoteLineType;
  category: string;
  concept: string;
  qty: number;
  unitCostGross: number; // cost per unit
  discountPercent: number; // provider discount
  marginPercent: number; // our margin
};

export type Quote = {
  id: string;
  createdAtIso: string;
  clientId: string;
  language: UiLang;
  title: string;
  validityDays: number;
  vatPercent: number;
  lines: QuoteLine[];
};

const KEY = {
  uiLang: 'pressupostos.uiLang',
  clients: 'pressupostos.clients',
  company: 'pressupostos.company',
  quotes: 'pressupostos.quotes'
} as const;

function hasWindow(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function uid(prefix = 'id'): string {
  const rand = Math.random().toString(16).slice(2);
  const ts = Date.now().toString(16);
  return `${prefix}_${ts}_${rand}`;
}

export function getUiLang(): UiLang {
  return readJson<UiLang>(KEY.uiLang, 'ca');
}

export function setUiLang(lang: UiLang): void {
  writeJson(KEY.uiLang, lang);
}

export function getClients(): Client[] {
  return readJson<Client[]>(KEY.clients, []);
}

export function saveClients(clients: Client[]): void {
  writeJson(KEY.clients, clients);
}

export function getCompany(): Company {
  return readJson<Company>(KEY.company, { name: '' });
}

export function saveCompany(company: Company): void {
  writeJson(KEY.company, company);
}

export function getQuotes(): Quote[] {
  return readJson<Quote[]>(KEY.quotes, []);
}

export function saveQuotes(quotes: Quote[]): void {
  writeJson(KEY.quotes, quotes);
}

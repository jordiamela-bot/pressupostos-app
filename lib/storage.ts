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

// ---- Remote persistence (DB) ----

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

export async function loadClientsFromDb(): Promise<Client[]> {
  const clients = await apiJson<Client[]>('/api/clients', { method: 'GET' });
  saveClients(clients);
  return clients;
}

export async function saveClientsToDb(clients: Client[]): Promise<void> {
  // Update local immediately
  saveClients(clients);
  await apiJson('/api/clients', { method: 'POST', body: JSON.stringify(clients) });
}

export function getCompany(): Company {
  return readJson<Company>(KEY.company, { name: '' });
}

export function saveCompany(company: Company): void {
  writeJson(KEY.company, company);
}

export async function loadCompanyFromDb(): Promise<Company> {
  const company = await apiJson<Company>('/api/company', { method: 'GET' });
  saveCompany(company);
  return company;
}

export async function saveCompanyToDb(company: Company): Promise<void> {
  saveCompany(company);
  await apiJson('/api/company', { method: 'POST', body: JSON.stringify(company) });
}

export function getQuotes(): Quote[] {
  return readJson<Quote[]>(KEY.quotes, []);
}

export function saveQuotes(quotes: Quote[]): void {
  writeJson(KEY.quotes, quotes);
}

export async function loadQuotesFromDb(): Promise<Quote[]> {
  const quotes = await apiJson<Quote[]>('/api/quotes', { method: 'GET' });
  saveQuotes(quotes);
  return quotes;
}

export async function saveQuotesToDb(quotes: Quote[]): Promise<void> {
  saveQuotes(quotes);
  await apiJson('/api/quotes', { method: 'POST', body: JSON.stringify(quotes) });
}

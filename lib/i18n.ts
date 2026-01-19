import type { UiLang } from './storage';

type Key =
  | 'newQuote'
  | 'importHint'
  | 'save'
  | 'client'
  | 'languageDocument'
  | 'title'
  | 'validity'
  | 'vatPercent'
  | 'importFile'
  | 'lines'
  | 'type'
  | 'concept'
  | 'category'
  | 'qty'
  | 'unitCost'
  | 'discount'
  | 'margin'
  | 'sellUnit'
  | 'totalSell'
  | 'delete'
  | 'base'
  | 'vat'
  | 'total'
  | 'exportPdf'
  | 'comingSoon';

const DICT: Record<UiLang, Record<Key, string>> = {
  ca: {
    newQuote: 'Nou pressupost',
    importHint: 'Importa línies via CSV o edita manualment.',
    save: 'Desar',
    client: 'Client',
    languageDocument: 'Idioma document',
    title: 'Títol',
    validity: 'Validesa (dies)',
    vatPercent: 'IVA (%)',
    importFile: 'Importar fitxer',
    lines: 'Línies',
    type: 'Tipus',
    concept: 'Concepte',
    category: 'Categoria',
    qty: 'Qtat',
    unitCost: 'Cost unitari',
    discount: 'Descompte (%)',
    margin: 'Marge (%)',
    sellUnit: 'Venda (ud)',
    totalSell: 'Total venda',
    delete: 'Esborrar',
    base: 'Base',
    vat: 'IVA',
    total: 'Total',
    exportPdf: 'Exportar PDF',
    comingSoon: 'Pròximament'
  },
  es: {
    newQuote: 'Nuevo presupuesto',
    importHint: 'Importa líneas vía CSV o edita manualmente.',
    save: 'Guardar',
    client: 'Cliente',
    languageDocument: 'Idioma documento',
    title: 'Título',
    validity: 'Validez (días)',
    vatPercent: 'IVA (%)',
    importFile: 'Importar archivo',
    lines: 'Líneas',
    type: 'Tipo',
    concept: 'Concepto',
    category: 'Categoría',
    qty: 'Cant',
    unitCost: 'Coste unitario',
    discount: 'Descuento (%)',
    margin: 'Margen (%)',
    sellUnit: 'Venta (ud)',
    totalSell: 'Total venta',
    delete: 'Borrar',
    base: 'Base',
    vat: 'IVA',
    total: 'Total',
    exportPdf: 'Exportar PDF',
    comingSoon: 'Próximamente'
  }
};

export function t(lang: UiLang, key: Key): string {
  return DICT[lang]?.[key] ?? DICT.ca[key];
}

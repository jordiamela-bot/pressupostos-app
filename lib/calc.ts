import type { QuoteLine } from './storage';

export function lineTotals(l: QuoteLine) {
  const qty = Number.isFinite(l.qty) ? l.qty : 0;
  const unit = Number.isFinite(l.unitCostGross) ? l.unitCostGross : 0;
  const disc = Number.isFinite(l.discountPercent) ? l.discountPercent : 0;
  const margin = Number.isFinite(l.marginPercent) ? l.marginPercent : 0;

  const unitAfterDiscount = unit * (1 - disc / 100);
  const sellUnit = unitAfterDiscount * (1 + margin / 100);
  const sellTotal = sellUnit * qty;

  return {
    unitAfterDiscount,
    sellUnit,
    sellTotal,
  };
}

export function totals(lines: QuoteLine[], vatPercent: number) {
  let base = 0;
  for (const l of lines) {
    if (l.type === 'info') continue;
    base += lineTotals(l).sellTotal;
  }
  const vat = base * (vatPercent / 100);
  const total = base + vat;
  return { base, vat, total };
}

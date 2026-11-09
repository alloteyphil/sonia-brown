/** Money is always stored as integer pesewas (1 GHS = 100 pesewas). */
export const CURRENCY = "GHS" as const;

export function cedisToPesewas(cedis: number): number {
  return Math.round(cedis * 100);
}

export function pesewasToCedis(pesewas: number): number {
  return pesewas / 100;
}

export function formatMoney(pesewas: number, opts: { showDecimals?: boolean } = {}): string {
  const cedis = pesewas / 100;
  const showDecimals = opts.showDecimals ?? pesewas % 100 !== 0;
  return `GH₵${cedis.toLocaleString("en-GH", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

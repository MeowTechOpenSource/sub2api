export interface CurrencyDisplayConfig {
  symbol?: string | null
  name?: string | null
}

let currencySymbol = '$'
let currencyName = 'USD'

export function configureCurrencyDisplay(config: CurrencyDisplayConfig): void {
  currencySymbol = String(config.symbol ?? '$').trim()
  currencyName = String(config.name ?? 'USD').trim() || 'USD'
}

export function getCurrencySymbol(): string {
  return currencySymbol
}

export function getCurrencyName(): string {
  return currencyName
}

export function decorateDisplayCurrency(formattedAmount: string): string {
  return currencySymbol ? `${currencySymbol}${formattedAmount}` : `${formattedAmount} ${currencyName}`
}

export function formatDisplayCurrency(
  amount: number | null | undefined,
  locale: string,
  fractionDigits?: number,
): string {
  const value = Number(amount ?? 0)
  const digits = fractionDigits ?? (value > 0 && value < 0.01 ? 6 : 2)
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)

  return decorateDisplayCurrency(formatted)
}

export function formatCompactDisplayCurrency(
  amount: number | null | undefined,
  locale: string,
): string {
  const parsed = Number(amount ?? 0)
  const value = Number.isFinite(parsed) ? parsed : 0
  const formatted = new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)

  return decorateDisplayCurrency(formatted)
}

import { afterEach, describe, expect, it } from 'vitest'
import {
  configureCurrencyDisplay,
  formatCompactDisplayCurrency,
} from '../currency'

describe('formatCompactDisplayCurrency', () => {
  afterEach(() => configureCurrencyDisplay({ symbol: '$', name: 'USD' }))

  it('uses compact localized notation with the configured symbol', () => {
    configureCurrencyDisplay({ symbol: 'MAI$', name: 'credits' })
    expect(formatCompactDisplayCurrency(100_006_046.36, 'en')).toBe('MAI$100M')
  })

  it('uses the configured currency name when no symbol is set', () => {
    configureCurrencyDisplay({ symbol: '', name: 'credits' })
    expect(formatCompactDisplayCurrency(1_250_000, 'en')).toBe('1.3M credits')
  })
})

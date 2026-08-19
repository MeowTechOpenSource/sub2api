import { afterEach, describe, expect, it } from 'vitest'
import { i18n } from '@/i18n'
import { formatCurrency, formatNumber } from '../format'
import { configureCurrencyDisplay } from '../currency'

describe('locale-aware formatters', () => {
  const originalLocale = i18n.global.locale.value

  afterEach(() => {
    i18n.global.locale.value = originalLocale
    configureCurrencyDisplay({ symbol: '$', name: 'USD' })
  })

  it('normalizes the internal zhTW locale for Intl number formatting', () => {
    i18n.global.locale.value = 'zhTW'

    expect(() => formatNumber(12345)).not.toThrow()
    expect(formatNumber(12345)).not.toBe('')
    expect(() => formatCurrency(12.5, 'TWD')).not.toThrow()
    expect(formatCurrency(12.5, 'TWD')).toContain('12.50')
  })

  it('supports a custom prefix or a named credit unit', () => {
    configureCurrencyDisplay({ symbol: 'MAI$', name: 'credits' })
    expect(formatCurrency(12)).toBe('MAI$12.00')

    configureCurrencyDisplay({ symbol: '', name: 'credits' })
    expect(formatCurrency(12)).toBe('12.00 credits')
  })
})

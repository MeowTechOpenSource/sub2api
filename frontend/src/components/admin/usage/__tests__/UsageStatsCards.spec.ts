import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import UsageStatsCards from '../UsageStatsCards.vue'
import { configureCurrencyDisplay } from '@/utils/currency'

const messages: Record<string, string> = {
  'usage.totalRequests': 'Total Requests',
  'usage.inSelectedRange': 'in selected range',
  'usage.totalTokens': 'Total Tokens',
  'usage.in': 'In',
  'usage.out': 'Out',
  'usage.cacheTotal': 'Cache',
  'usage.cacheBreakdown': 'Cache Token Breakdown',
  'usage.cacheCreationTokensLabel': 'Cache Creation',
  'usage.cacheReadTokensLabel': 'Cache Read',
  'usage.totalCost': 'Total Cost',
  'usage.accountCost': 'Cost',
  'usage.standardCost': 'Standard',
  'usage.avgDuration': 'Avg Duration',
}

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => messages[key] ?? key,
    }),
  }
})

const stats = {
  total_requests: 1,
  total_input_tokens: 100,
  total_output_tokens: 50,
  total_cache_tokens: 34,
  total_cache_creation_tokens: 12,
  total_cache_read_tokens: 22,
  total_tokens: 184,
  total_cost: 0.001,
  total_actual_cost: 0.001,
  total_account_cost: 0.001,
  average_duration_ms: 250,
}

describe('UsageStatsCards', () => {
  it('shows cache token breakdown values', () => {
    const wrapper = mount(UsageStatsCards, {
      props: {
        stats,
      },
      global: {
        stubs: {
          Icon: true,
        },
      },
    })

    const text = wrapper.text()
    expect(text).toContain('Cache: 34')
    expect(text).toContain('Cache Token Breakdown')
    expect(text).toContain('Cache Creation')
    expect(text).toContain('12')
    expect(text).toContain('Cache Read')
    expect(text).toContain('22')
  })

  it('uses the configured currency only when user display mode is enabled', () => {
    configureCurrencyDisplay({ symbol: 'MAI$', name: 'credits' })
    const userWrapper = mount(UsageStatsCards, {
      props: { stats, useDisplayCurrency: true },
      global: { stubs: { Icon: true } },
    })
    const adminWrapper = mount(UsageStatsCards, {
      props: { stats },
      global: { stubs: { Icon: true } },
    })

    expect(userWrapper.text()).toContain('MAI$0.0010')
    expect(adminWrapper.text()).toContain('$0.0010')
    expect(adminWrapper.text()).not.toContain('MAI$')
  })

  it('compacts million-scale user totals while retaining exact values in titles', () => {
    configureCurrencyDisplay({ symbol: 'MAI$', name: 'credits' })
    const wrapper = mount(UsageStatsCards, {
      props: {
        stats: { ...stats, total_actual_cost: 100_006_046.36, total_cost: 125_000_000 },
        useDisplayCurrency: true,
      },
      global: { stubs: { Icon: true } },
    })

    expect(wrapper.text()).toContain('MAI$100M')
    expect(wrapper.find('[title="MAI$100006046.3600"]').exists()).toBe(true)
  })
})

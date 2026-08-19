import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAdminSettingsStore } from '@/stores/adminSettings'

const getSettings = vi.fn()
const getPaymentConfig = vi.fn()

vi.mock('@/api', () => ({
  adminAPI: {
    settings: { getSettings: (...args: unknown[]) => getSettings(...args) },
    payment: { getConfig: (...args: unknown[]) => getPaymentConfig(...args) },
  },
}))

describe('useAdminSettingsStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('shares an in-flight settings request with concurrent callers', async () => {
    let resolveSettings!: (value: Record<string, unknown>) => void
    getSettings.mockReturnValue(new Promise((resolve) => { resolveSettings = resolve }))
    getPaymentConfig.mockResolvedValue({ data: { enabled: true } })

    const store = useAdminSettingsStore()
    const first = store.fetch(true)
    const second = store.fetch(true)
    let secondSettled = false
    void second.finally(() => { secondSettled = true })

    expect(getSettings).toHaveBeenCalledTimes(1)
    expect(store.loading).toBe(true)
    await Promise.resolve()
    expect(secondSettled).toBe(false)

    resolveSettings({
      ops_monitoring_enabled: true,
      ops_realtime_monitoring_enabled: true,
      ops_query_mode_default: 'preagg',
      custom_menu_items: [],
    })
    await Promise.all([first, second])

    expect(secondSettled).toBe(true)
    expect(store.loading).toBe(false)
    expect(store.loaded).toBe(true)
    expect(store.opsMonitoringEnabled).toBe(true)
    expect(store.opsQueryModeDefault).toBe('preagg')
  })
})

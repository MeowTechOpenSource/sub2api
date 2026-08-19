import { describe, expect, it } from 'vitest'
import en from '@/i18n/locales/en'
import zh from '@/i18n/locales/zh'
import zhTW from '@/i18n/locales/zhTW'

describe('modern UI localization parity', () => {
  const locales = { en, zh, zhTW }
  const accessibilityKeys = [
    'primaryNavigation',
    'userMenu',
    'toggleNavigation',
    'languageMenu',
  ] as const
  const navigationGroupKeys = ['workspace', 'models', 'billing'] as const

  for (const [locale, messages] of Object.entries(locales)) {
    it(`${locale} provides navigation and language accessibility labels`, () => {
      for (const key of accessibilityKeys) {
        expect(messages.common.accessibility[key]).toBeTypeOf('string')
        expect(messages.common.accessibility[key].trim()).not.toBe('')
      }
    })

    it(`${locale} provides normal-user navigation group labels`, () => {
      for (const key of navigationGroupKeys) {
        expect(messages.nav[key]).toBeTypeOf('string')
        expect(messages.nav[key].trim()).not.toBe('')
      }
    })
  }

  it('Chinese locales do not fall back to the English language-menu label', () => {
    expect(zh.common.accessibility.languageMenu).not.toBe(en.common.accessibility.languageMenu)
    expect(zhTW.common.accessibility.languageMenu).not.toBe(en.common.accessibility.languageMenu)
  })

  it('Traditional Chinese provides complete audit-log translations', () => {
    expect(zhTW.admin.audit).toBeDefined()
    expect(Object.keys(zhTW.admin.audit.filters)).toEqual(Object.keys(en.admin.audit.filters))
    expect(Object.keys(zhTW.admin.audit.columns)).toEqual(Object.keys(en.admin.audit.columns))
    expect(Object.keys(zhTW.admin.audit.detail)).toEqual(Object.keys(en.admin.audit.detail))
    expect(Object.keys(zhTW.admin.audit.clearConfirm)).toEqual(Object.keys(en.admin.audit.clearConfirm))
    expect(Object.keys(zhTW.admin.audit.values)).toEqual(Object.keys(en.admin.audit.values))
    expect(Object.keys(zhTW.admin.audit.values.authMethods)).toEqual(Object.keys(en.admin.audit.values.authMethods))
    expect(Object.keys(zhTW.admin.audit.values.roles)).toEqual(Object.keys(en.admin.audit.values.roles))
    expect(Object.keys(zhTW.admin.audit.values.verbs)).toEqual(Object.keys(en.admin.audit.values.verbs))
    expect(Object.keys(zhTW.admin.audit.values.resources)).toEqual(Object.keys(en.admin.audit.values.resources))
    expect(Object.keys(zhTW.admin.audit.values.specialActions)).toEqual(Object.keys(en.admin.audit.values.specialActions))
  })
})

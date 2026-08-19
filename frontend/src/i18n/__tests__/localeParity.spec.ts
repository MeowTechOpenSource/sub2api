import { describe, expect, it } from 'vitest'
import en from '@/i18n/locales/en'
import zh from '@/i18n/locales/zh'
import zhTW from '@/i18n/locales/zhTW'

function collectLeafKeys(value: unknown, path = '', output: string[] = []): string[] {
  if (value === null || typeof value !== 'object') {
    output.push(path)
    return output
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectLeafKeys(item, `${path}[${index}]`, output))
    return output
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    collectLeafKeys(child, path ? `${path}.${key}` : key, output)
  }
  return output
}

function collectSimplifiedChineseMessages(
  value: unknown,
  path = '',
  output: string[] = [],
): string[] {
  if (typeof value === 'string') {
    if (/[这发复里为与个门页应启关从现对时实设获权览将还数仅务优网线统话据连选项显开总户处层组别码价边单双击态见识类适过请输创删拟该让无则么云]/u.test(value)) {
      output.push(`${path}: ${value}`)
    }
    return output
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectSimplifiedChineseMessages(item, `${path}[${index}]`, output))
    return output
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      collectSimplifiedChineseMessages(child, path ? `${path}.${key}` : key, output)
    }
  }
  return output
}

function collectLeafValues(value: unknown, path = '', output = new Map<string, unknown>()): Map<string, unknown> {
  if (value === null || typeof value !== 'object') {
    output.set(path, value)
    return output
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectLeafValues(item, `${path}[${index}]`, output))
    return output
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    collectLeafValues(child, path ? `${path}.${key}` : key, output)
  }
  return output
}

describe('locale key parity', () => {
  const englishKeys = collectLeafKeys(en).sort()

  it.each([
    ['zh', zh],
    ['zhTW', zhTW],
  ] as const)('%s contains every English message key', (_locale, messages) => {
    const localeKeys = new Set(collectLeafKeys(messages))
    expect(englishKeys.filter((key) => !localeKeys.has(key))).toEqual([])
  })

  it('zhTW does not contain Simplified-only Chinese characters', () => {
    expect(collectSimplifiedChineseMessages(zhTW)).toEqual([])
  })

  it('zhTW does not copy English UI text when zh provides a translation', () => {
    const english = collectLeafValues(en)
    const simplified = collectLeafValues(zh)
    const traditional = collectLeafValues(zhTW)
    const candidates = [...traditional.entries()].filter(([key, value]) =>
      typeof value === 'string' &&
      value === english.get(key) &&
      value !== simplified.get(key) &&
      /[A-Za-z]{4}/.test(value),
    )
    expect(candidates).toEqual([])
  })
})

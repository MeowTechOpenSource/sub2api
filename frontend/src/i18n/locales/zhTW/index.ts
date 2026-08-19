import landing from './landing'
import common from './common'
import dashboard from './dashboard'
import admin from './admin'
import misc from './misc'
import batchImage from './batchImage'
import upstreamFallback from './upstreamFallback'
import upstreamLatest from './upstreamLatest'
import simplifiedChinese from '../zh'

type MessageTree = Record<string, unknown>

function mergeMessages(base: MessageTree, overrides: MessageTree): MessageTree {
  const merged: MessageTree = { ...base }
  for (const [key, value] of Object.entries(overrides)) {
    const current = merged[key]
    if (
      current && value &&
      typeof current === 'object' && typeof value === 'object' &&
      !Array.isArray(current) && !Array.isArray(value)
    ) {
      merged[key] = mergeMessages(current as MessageTree, value as MessageTree)
    } else {
      merged[key] = value
    }
  }
  return merged
}

const simplifiedToTraditional: Record<string, string> = {
  '这': '這', '发': '發', '复': '復', '里': '裡', '为': '為', '与': '與', '个': '個',
  '门': '門', '页': '頁', '应': '應', '启': '啟', '关': '關', '从': '從', '现': '現',
  '对': '對', '时': '時', '实': '實', '设': '設', '获': '獲', '权': '權', '览': '覽',
  '将': '將', '还': '還', '数': '數', '仅': '僅', '务': '務', '优': '優', '网': '網',
  '线': '線', '统': '統', '话': '話', '据': '據', '连': '連', '选': '選', '项': '項',
  '显': '顯', '开': '開', '总': '總', '户': '戶', '处': '處', '层': '層', '组': '組',
  '别': '別', '码': '碼', '价': '價', '边': '邊', '单': '單', '双': '雙', '击': '擊',
  '态': '態', '见': '見', '识': '識', '类': '類', '适': '適', '过': '過', '请': '請',
  '输': '輸', '创': '創', '删': '刪', '拟': '擬', '该': '該', '让': '讓', '无': '無',
  '则': '則', '么': '麼', '云': '雲', '载': '載', '储': '儲', '额': '額', '费': '費',
  '拥': '擁', '验': '驗', '证': '證', '审': '審', '计': '計', '险': '險', '资': '資',
  '产': '產', '备': '備', '际': '際', '释': '釋', '径': '徑', '调': '調', '长': '長',
  '终': '終', '绝': '絕', '经': '經', '绑': '綁', '读': '讀', '写': '寫',
  '买': '買', '卖': '賣', '质': '質', '递': '遞', '归': '歸', '并': '並',
  '标': '標', '题': '題', '须': '須', '认': '認', '误': '誤', '导': '導', '阶': '階',
}

function convertToTraditional(value: unknown): unknown {
  if (typeof value === 'string') {
    return Array.from(value, (character) => simplifiedToTraditional[character] ?? character).join('')
  }
  if (Array.isArray(value)) return value.map(convertToTraditional)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as MessageTree).map(([key, child]) => [key, convertToTraditional(child)]),
    )
  }
  return value
}

const messages = {
  ...landing,
  ...common,
  ...dashboard,
  admin,
  ...misc,
  ...batchImage,
}

const generatedFallback = convertToTraditional(simplifiedChinese) as MessageTree

export default mergeMessages(
  mergeMessages(mergeMessages(generatedFallback, upstreamFallback), upstreamLatest),
  messages,
)

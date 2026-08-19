import overview from './overview'
import channels from './channels'
import accounts from './accounts'
import resources from './resources'
import ops from './ops'
import settings from './settings'
import audit from './audit'
import supplement from './supplement'

type MessageTree = Record<string, unknown>

function mergeMessages(base: MessageTree, additions: MessageTree): MessageTree {
  const merged: MessageTree = { ...base }
  for (const [key, value] of Object.entries(additions)) {
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

const messages = {
  ...overview,
  ...channels,
  ...accounts,
  ...resources,
  ...ops,
  ...settings,
  ...audit,
}

export default mergeMessages(messages, supplement)

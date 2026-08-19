import { buildGatewayUrl } from './url'

export interface ChatAttachmentPayload {
  name: string
  type: string
  dataUrl: string
}

export interface ChatGatewayMessage {
  role: 'user' | 'assistant'
  content: string
  attachments?: ChatAttachmentPayload[]
}

interface ResponsesOutputContent {
  type?: string
  text?: string
  annotations?: Array<{
    type?: string
    url?: string
    title?: string
    filename?: string
    file_id?: string
  }>
}

interface ResponsesOutputItem {
  id?: string
  type?: string
  content?: ResponsesOutputContent[]
  summary?: ResponsesOutputContent[]
  result?: string
  revised_prompt?: string
  action?: { type?: string; query?: string }
  queries?: string[]
  results?: Array<{ filename?: string; title?: string; file_id?: string }>
}

interface ResponsesResult {
  output?: ResponsesOutputItem[]
  output_text?: string
  usage?: {
    input_tokens?: number
    output_tokens?: number
    total_tokens?: number
  }
}

export interface ChatResponseUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export interface ChatResponseReference {
  type: 'web_search' | 'web_source' | 'document'
  title: string
  url?: string
}

export interface ChatResponseResult {
  text: string
  reasoning: string
  images: string[]
  usage?: ChatResponseUsage
  references?: ChatResponseReference[]
  webSearchCalls?: number
}

export type ChatReasoningEffort = 'low' | 'medium' | 'high' | 'xhigh'

const defaultChatModels: Record<string, string[]> = {
  openai: ['gpt-5.6', 'gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna', 'gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.3-codex-spark', 'codex-auto-review', 'gpt-5.2', 'gpt-image-1', 'gpt-image-1.5', 'gpt-image-2'],
  anthropic: ['claude-fable-5', 'claude-opus-4-8', 'claude-opus-4-7', 'claude-opus-4-6', 'claude-opus-4-5-20251101', 'claude-sonnet-5', 'claude-sonnet-4-6', 'claude-sonnet-4-5-20250929', 'claude-haiku-4-5-20251001'],
  gemini: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-image', 'gemini-2.5-pro', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-image'],
  grok: ['grok-4.5', 'grok-4.3', 'grok-build-0.1', 'grok-composer-2.5-fast', 'grok-4.20-0309-reasoning', 'grok-4.20-0309-non-reasoning', 'grok-4.20-multi-agent-0309', 'grok-imagine', 'grok-imagine-image', 'grok-imagine-image-quality', 'grok-imagine-edit', 'grok-imagine-video', 'grok-imagine-video-1.5'],
}
defaultChatModels.antigravity = [...defaultChatModels.anthropic, ...defaultChatModels.gemini]

export function getDefaultChatModels(platform: string): string[] {
  return [...(defaultChatModels[platform.toLowerCase()] || defaultChatModels.anthropic)]
}

export function getModelReasoningEfforts(model: string): ChatReasoningEffort[] {
  const value = model.toLowerCase()
  if (!value || /-(?:low|medium|high|xhigh|max)$/.test(value)) return []
  const supportsExtended = /(?:gpt-5\.[2-9]|gpt-5\.\d+-codex|codex|claude-(?:opus|sonnet)-4|deepseek-(?:r1|reasoner|v\d)|glm-5)/.test(value)
  if (supportsExtended) return ['low', 'medium', 'high', 'xhigh']
  const supportsReasoning = /(?:^|[-/])(?:gpt-5|o[134](?:-mini)?|grok-(?:3-mini|4)|gemini-(?:2\.5|3)|qwen.*(?:think|reason))/.test(value)
  return supportsReasoning ? ['low', 'medium', 'high'] : []
}

export interface GenerateChatImagesOptions {
  apiKey: string
  model: string
  prompt: string
  size: string
  quality: 'auto' | 'medium' | 'high'
  count: number
  background: 'auto' | 'transparent' | 'opaque'
  outputFormat: 'png' | 'webp' | 'jpeg'
  referenceImages?: File[]
  signal?: AbortSignal
}

export interface GeneratedChatImagesResult {
  images: string[]
  revisedPrompt: string
}

interface ChatModelItem {
  id?: string
  slug?: string
}

interface SendChatOptions {
  apiKey: string
  model: string
  messages: ChatGatewayMessage[]
  webSearch: boolean
  imageGeneration: boolean
  workspaceMode: boolean
  memory?: string
  reasoningEffort?: ChatReasoningEffort
  signal?: AbortSignal
  onTextDelta?: (delta: string) => void
  onReasoningDelta?: (delta: string) => void
  onReference?: (reference: ChatResponseReference) => void
  onUsage?: (usage: ChatResponseUsage) => void
}

function normalizeUsage(usage: ResponsesResult['usage'] | null | undefined): ChatResponseUsage | undefined {
  if (!usage) return undefined
  const inputTokens = usage.input_tokens || 0
  const outputTokens = usage.output_tokens || 0
  return { inputTokens, outputTokens, totalTokens: usage.total_tokens || inputTokens + outputTokens }
}

function attachmentContent(attachment: ChatAttachmentPayload) {
  if (attachment.type.startsWith('image/')) {
    return { type: 'input_image', image_url: attachment.dataUrl, detail: 'auto' }
  }
  return { type: 'input_file', filename: attachment.name, file_data: attachment.dataUrl }
}

export function buildResponsesInput(messages: ChatGatewayMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.role === 'assistant'
      ? [{ type: 'output_text', text: message.content }]
      : [
          ...(message.content ? [{ type: 'input_text', text: message.content }] : []),
          ...(message.attachments || []).map(attachmentContent),
        ],
  }))
}

export function extractChatResponse(response: ResponsesResult | null | undefined): ChatResponseResult {
  if (!response) return { text: '', reasoning: '', images: [] }
  const textParts: string[] = []
  const reasoningParts: string[] = []
  const images: string[] = []
  const references: ChatResponseReference[] = []
  let webSearchCalls = 0
  const addReference = (reference: ChatResponseReference) => {
    if (!references.some((item) => item.type === reference.type && item.title === reference.title && item.url === reference.url)) references.push(reference)
  }
  if (response.output_text) textParts.push(response.output_text)

  for (const item of response.output || []) {
    if (item.type === 'web_search_call') {
      webSearchCalls += 1
      addReference({ type: 'web_search', title: item.action?.query || 'Web search' })
    }
    if (item.type === 'file_search_call') {
      for (const query of item.queries || []) addReference({ type: 'document', title: query })
      for (const result of item.results || []) addReference({ type: 'document', title: result.filename || result.title || result.file_id || 'Reference document' })
    }
    if (item.type === 'reasoning') {
      for (const summary of item.summary || []) {
        if (summary.type === 'summary_text' && summary.text) reasoningParts.push(summary.text)
      }
    }
    for (const content of item.content || []) {
      if ((content.type === 'output_text' || content.type === 'text') && content.text) {
        textParts.push(content.text)
      }
      for (const annotation of content.annotations || []) {
        if (annotation.type === 'url_citation' && annotation.url) addReference({ type: 'web_source', title: annotation.title || annotation.url, url: annotation.url })
        if (annotation.type === 'file_citation') addReference({ type: 'document', title: annotation.filename || annotation.file_id || 'Reference document' })
      }
    }
    if (item.type === 'image_generation_call' && item.result) {
      images.push(item.result.startsWith('data:') ? item.result : `data:image/png;base64,${item.result}`)
    }
  }
  const usage = normalizeUsage(response.usage)
  return {
    text: [...new Set(textParts)].join('\n'),
    reasoning: [...new Set(reasoningParts)].join('\n'),
    images,
    ...(usage ? { usage } : {}),
    ...(references.length ? { references } : {}),
    ...(webSearchCalls ? { webSearchCalls } : {}),
  }
}

export async function listChatModels(apiKey: string, signal?: AbortSignal): Promise<string[]> {
  const response = await fetch(buildGatewayUrl('/v1/models'), {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal,
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const payload = await response.json() as { data?: ChatModelItem[]; models?: ChatModelItem[] }
  const items: ChatModelItem[] = [...(payload.data || []), ...(payload.models || [])]
  const models = items
    .map((item) => item.id || item.slug || '')
    .filter(Boolean)
  return [...new Set(models)].sort((a, b) => a.localeCompare(b))
}

export async function generateChatImages(options: GenerateChatImagesOptions): Promise<GeneratedChatImagesResult> {
  const hasReferences = Boolean(options.referenceImages?.length)
  const formData = new FormData()
  if (hasReferences) {
    formData.set('model', options.model)
    formData.set('prompt', options.prompt)
    formData.set('size', options.size)
    formData.set('quality', options.quality)
    formData.set('n', String(options.count))
    formData.set('background', options.background)
    formData.set('output_format', options.outputFormat)
    formData.set('response_format', 'b64_json')
    for (const image of options.referenceImages || []) formData.append('image', image, image.name)
  }
  const response = await fetch(buildGatewayUrl(hasReferences ? '/v1/images/edits' : '/v1/images/generations'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      ...(!hasReferences ? { 'Content-Type': 'application/json' } : {}),
    },
    body: hasReferences ? formData : JSON.stringify({
      model: options.model,
      prompt: options.prompt,
      size: options.size,
      quality: options.quality,
      n: options.count,
      background: options.background,
      output_format: options.outputFormat,
      response_format: 'b64_json',
    }),
    signal: options.signal,
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `HTTP ${response.status}`)
  }
  const payload = await response.json() as {
    data?: Array<{ b64_json?: string; url?: string; revised_prompt?: string }>
  }
  const mime = options.outputFormat === 'jpeg' ? 'image/jpeg' : `image/${options.outputFormat}`
  const images = (payload.data || []).map((item) => item.b64_json ? `data:${mime};base64,${item.b64_json}` : item.url || '').filter(Boolean)
  return { images, revisedPrompt: payload.data?.find((item) => item.revised_prompt)?.revised_prompt || '' }
}

export async function sendChatResponse(options: SendChatOptions): Promise<ChatResponseResult> {
  const tools: Array<Record<string, string>> = []
  if (options.webSearch) tools.push({ type: 'web_search' })
  if (options.imageGeneration) tools.push({ type: 'image_generation' })

  const instructions = [
    options.workspaceMode ? 'Act as a workspace assistant. Analyze attached project, document, and data files together; preserve Markdown structure and provide actionable results.' : '',
    options.memory?.trim() ? `User-approved persistent memory:\n${options.memory.trim()}` : '',
  ].filter(Boolean).join('\n\n')

  const response = await fetch(buildGatewayUrl('/v1/responses'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      input: buildResponsesInput(options.messages.slice(-24)),
      stream: true,
      ...(options.reasoningEffort ? { reasoning: { effort: options.reasoningEffort, summary: 'detailed' } } : {}),
      ...(instructions ? { instructions } : {}),
      ...(tools.length ? { tools } : {}),
    }),
    signal: options.signal,
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `HTTP ${response.status}`)
  }
  const contentType = response.headers?.get?.('content-type') || ''
  if (!response.body || (contentType && !contentType.includes('text/event-stream'))) {
    return extractChatResponse(await response.json() as ResponsesResult)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let streamedText = ''
  let streamedReasoning = ''
  let finalResponse: ResponsesResult | undefined
  let streamedUsage: ChatResponseUsage | undefined
  const streamedImages: string[] = []
  const streamedReferences: ChatResponseReference[] = []
  const streamedWebSearchCallIDs = new Set<string>()
  const emitReference = (reference: ChatResponseReference) => {
    if (streamedReferences.some((item) => item.type === reference.type && item.title === reference.title && item.url === reference.url)) return
    streamedReferences.push(reference)
    options.onReference?.(reference)
  }

  const handleEvent = (event: Record<string, any>) => {
    if (event.type === 'response.output_text.delta' && typeof event.delta === 'string') {
      streamedText += event.delta
      options.onTextDelta?.(event.delta)
    }
    if (event.type === 'response.reasoning_summary_text.delta' && typeof event.delta === 'string') {
      streamedReasoning += event.delta
      options.onReasoningDelta?.(event.delta)
    }
    if (['response.completed', 'response.done', 'response.incomplete'].includes(event.type) && event.response) finalResponse = event.response
    const eventUsage = normalizeUsage(event.response?.usage || event.usage)
    if (eventUsage) {
      streamedUsage = eventUsage
      options.onUsage?.(eventUsage)
    }
    const outputItem = event.item || event.output
    if (outputItem?.type === 'web_search_call') {
      streamedWebSearchCallIDs.add(outputItem.id || event.item_id || `output:${event.output_index ?? streamedWebSearchCallIDs.size}`)
      emitReference({ type: 'web_search', title: outputItem.action?.query || 'Web search' })
    }
    if (typeof event.type === 'string' && event.type.startsWith('response.web_search_call.')) {
      streamedWebSearchCallIDs.add(event.item_id || event.call_id || `output:${event.output_index ?? 0}`)
      emitReference({ type: 'web_search', title: event.action?.query || event.query || 'Web search' })
    }
    const imageResult = event.result || event.output?.result
    if (event.type?.includes('image_generation') && typeof imageResult === 'string') {
      streamedImages.push(imageResult.startsWith('data:') ? imageResult : `data:image/png;base64,${imageResult}`)
    }
  }

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (!data || data === '[DONE]') continue
      try { handleEvent(JSON.parse(data)) } catch { /* Ignore non-JSON SSE metadata. */ }
    }
  }

  const extracted = extractChatResponse(finalResponse)
  for (const reference of extracted.references || []) emitReference(reference)
  return {
    text: streamedText || extracted.text,
    reasoning: streamedReasoning || extracted.reasoning,
    images: [...new Set([...streamedImages, ...extracted.images])],
    ...(extracted.usage || streamedUsage ? { usage: extracted.usage || streamedUsage } : {}),
    ...([...streamedReferences, ...(extracted.references || [])].length ? { references: [...new Map([...streamedReferences, ...(extracted.references || [])].map((item) => [`${item.type}:${item.title}:${item.url || ''}`, item])).values()] } : {}),
    ...((extracted.webSearchCalls || streamedWebSearchCallIDs.size) ? { webSearchCalls: extracted.webSearchCalls || streamedWebSearchCallIDs.size } : {}),
  }
}

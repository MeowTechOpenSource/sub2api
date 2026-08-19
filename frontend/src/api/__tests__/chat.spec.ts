import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildResponsesInput,
  extractChatResponse,
  generateChatImages,
  getDefaultChatModels,
  getModelReasoningEfforts,
  listChatModels,
  sendChatResponse,
} from '@/api/chat'

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response
}

function sseResponse(events: unknown[]) {
  const encoded = new TextEncoder().encode(events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join('') + 'data: [DONE]\n\n')
  let read = false
  return {
    ok: true,
    headers: { get: () => 'text/event-stream' },
    body: {
      getReader: () => ({
        read: vi.fn(async () => {
          if (read) return { done: true, value: undefined }
          read = true
          return { done: false, value: encoded }
        }),
      }),
    },
  } as unknown as Response
}

describe('chat gateway API', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('maps text, image, and document inputs to the Responses API format', () => {
    expect(buildResponsesInput([
      {
        role: 'user',
        content: 'Review these files',
        attachments: [
          { name: 'photo.png', type: 'image/png', dataUrl: 'data:image/png;base64,abc' },
          { name: 'brief.pdf', type: 'application/pdf', dataUrl: 'data:application/pdf;base64,xyz' },
        ],
      },
      { role: 'assistant', content: 'Understood.' },
    ])).toEqual([
      {
        role: 'user',
        content: [
          { type: 'input_text', text: 'Review these files' },
          { type: 'input_image', image_url: 'data:image/png;base64,abc', detail: 'auto' },
          { type: 'input_file', filename: 'brief.pdf', file_data: 'data:application/pdf;base64,xyz' },
        ],
      },
      { role: 'assistant', content: [{ type: 'output_text', text: 'Understood.' }] },
    ])
  })

  it('extracts response text, reasoning summaries, and generated images', () => {
    expect(extractChatResponse({
      output_text: 'Done',
      output: [
        { type: 'message', content: [{ type: 'output_text', text: 'Done' }] },
        { type: 'reasoning', summary: [{ type: 'summary_text', text: 'Checked the available evidence.' }] },
        { type: 'image_generation_call', result: 'aW1hZ2U=' },
      ],
    })).toEqual({ text: 'Done', reasoning: 'Checked the available evidence.', images: ['data:image/png;base64,aW1hZ2U='] })
  })

  it('extracts token usage for context and spend reporting', () => {
    expect(extractChatResponse({
      output_text: 'Done',
      usage: { input_tokens: 1200, output_tokens: 300, total_tokens: 1500 },
    })).toEqual({
      text: 'Done', reasoning: '', images: [],
      usage: { inputTokens: 1200, outputTokens: 300, totalTokens: 1500 },
    })
  })

  it('extracts web searches, URL citations, and referenced files', () => {
    expect(extractChatResponse({
      output: [
        { type: 'web_search_call', action: { type: 'search', query: 'current model pricing' } },
        { type: 'message', content: [{
          type: 'output_text',
          text: 'Found it.',
          annotations: [
            { type: 'url_citation', title: 'Pricing', url: 'https://example.com/pricing' },
            { type: 'file_citation', filename: 'reference.pdf', file_id: 'file_1' },
          ],
        }] },
      ],
    }).references).toEqual([
      { type: 'web_search', title: 'current model pricing' },
      { type: 'web_source', title: 'Pricing', url: 'https://example.com/pricing' },
      { type: 'document', title: 'reference.pdf' },
    ])
  })

  it('supports both standard and Codex model list response shapes', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ data: [{ id: 'gpt-5' }, { id: 'gpt-5' }] }))
      .mockResolvedValueOnce(jsonResponse({ models: [{ slug: 'codex-mini' }, { id: 'gpt-5-codex' }] }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(listChatModels('sk-user')).resolves.toEqual(['gpt-5'])
    await expect(listChatModels('sk-user')).resolves.toEqual(['codex-mini', 'gpt-5-codex'])
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toEqual({ Authorization: 'Bearer sk-user' })
  })

  it('derives available thinking levels from the selected model', () => {
    expect(getModelReasoningEfforts('gpt-5.4')).toEqual(['low', 'medium', 'high', 'xhigh'])
    expect(getModelReasoningEfforts('grok-4')).toEqual(['low', 'medium', 'high'])
    expect(getModelReasoningEfforts('claude-sonnet-4-6')).toEqual(['low', 'medium', 'high', 'xhigh'])
    expect(getModelReasoningEfforts('gpt-4o')).toEqual([])
    expect(getModelReasoningEfforts('gpt-5.4-high')).toEqual([])
  })

  it('provides backend-aligned fallback models for incomplete channel catalogs', () => {
    expect(getDefaultChatModels('openai')).toContain('gpt-5.4')
    expect(getDefaultChatModels('anthropic')).toContain('claude-sonnet-4-6')
    expect(getDefaultChatModels('gemini')).toContain('gemini-2.5-pro')
    expect(getDefaultChatModels('grok')).toContain('grok-4.5')
    expect(getDefaultChatModels('antigravity')).toEqual(expect.arrayContaining(['claude-sonnet-4-6', 'gemini-2.5-pro']))
  })

  it('streams text, returns images, and sends tools through the selected API key', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([
      { type: 'response.output_item.added', item: { type: 'web_search_call', action: { type: 'search', query: 'Vue streaming UI' } } },
      { type: 'response.output_text.delta', delta: 'Hello ' },
      { type: 'response.output_text.delta', delta: 'world' },
      { type: 'response.reasoning_summary_text.delta', delta: 'Reviewed the request.' },
      { type: 'response.image_generation_call.completed', result: 'aW1hZ2U=' },
      { type: 'response.done', usage: { input_tokens: 240, output_tokens: 60, total_tokens: 300 } },
    ]))
    vi.stubGlobal('fetch', fetchMock)
    const deltas: string[] = []
    const reasoningDeltas: string[] = []
    const references: string[] = []
    const usages: number[] = []

    await expect(sendChatResponse({
      apiKey: 'sk-selected',
      model: 'gpt-5-codex',
      messages: [{ role: 'user', content: 'Build this' }],
      webSearch: true,
      imageGeneration: true,
      workspaceMode: true,
      memory: 'Prefer concise answers.',
      reasoningEffort: 'high',
      onTextDelta: (delta) => deltas.push(delta),
      onReasoningDelta: (delta) => reasoningDeltas.push(delta),
      onReference: (reference) => references.push(reference.title),
      onUsage: (usage) => usages.push(usage.totalTokens),
    })).resolves.toEqual({
      text: 'Hello world',
      reasoning: 'Reviewed the request.',
      images: ['data:image/png;base64,aW1hZ2U='],
      references: [{ type: 'web_search', title: 'Vue streaming UI' }],
      webSearchCalls: 1,
      usage: { inputTokens: 240, outputTokens: 60, totalTokens: 300 },
    })

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(request.headers).toEqual({
      Authorization: 'Bearer sk-selected',
      'Content-Type': 'application/json',
    })
    expect(JSON.parse(String(request.body))).toMatchObject({
      model: 'gpt-5-codex',
      stream: true,
      reasoning: { effort: 'high', summary: 'detailed' },
      tools: [{ type: 'web_search' }, { type: 'image_generation' }],
    })
    expect(JSON.parse(String(request.body)).instructions).toContain('workspace assistant')
    expect(JSON.parse(String(request.body)).instructions).toContain('Prefer concise answers.')
    expect(deltas).toEqual(['Hello ', 'world'])
    expect(reasoningDeltas).toEqual(['Reviewed the request.'])
    expect(references).toEqual(['Vue streaming UI'])
    expect(usages).toEqual([300])
  })

  it('accepts a non-streaming JSON response from the gateway', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ...jsonResponse({ output_text: 'Complete response' }),
      headers: { get: () => 'application/json' },
      body: {},
    }))

    await expect(sendChatResponse({
      apiKey: 'sk-user',
      model: 'gpt-5',
      messages: [{ role: 'user', content: 'Hello' }],
      webSearch: false,
      imageGeneration: false,
      workspaceMode: false,
      reasoningEffort: 'medium',
    })).resolves.toEqual({ text: 'Complete response', reasoning: '', images: [] })
  })

  it('sends standalone image studio controls through the billed image endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      data: [{ b64_json: 'aW1hZ2U=', revised_prompt: 'A refined landscape' }],
    }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(generateChatImages({
      apiKey: 'sk-image',
      model: 'gpt-image-2',
      prompt: 'A landscape',
      size: '1536x864',
      quality: 'high',
      count: 2,
      background: 'opaque',
      outputFormat: 'webp',
    })).resolves.toEqual({
      images: ['data:image/webp;base64,aW1hZ2U='],
      revisedPrompt: 'A refined landscape',
    })

    expect(fetchMock.mock.calls[0]?.[0]).toContain('/v1/images/generations')
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      model: 'gpt-image-2', prompt: 'A landscape', size: '1536x864', quality: 'high', n: 2,
      background: 'opaque', output_format: 'webp', response_format: 'b64_json',
    })
  })

  it('uses multipart image edits when reference images are provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [{ b64_json: 'cmVzdWx0' }] }))
    vi.stubGlobal('fetch', fetchMock)
    const reference = new File(['reference'], 'reference.png', { type: 'image/png' })

    await generateChatImages({
      apiKey: 'sk-image', model: 'gpt-image-2', prompt: 'Restyle this image', size: '1024x1024',
      quality: 'auto', count: 1, background: 'auto', outputFormat: 'png', referenceImages: [reference],
    })

    expect(fetchMock.mock.calls[0]?.[0]).toContain('/v1/images/edits')
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(request.headers).toEqual({ Authorization: 'Bearer sk-image' })
    expect(request.body).toBeInstanceOf(FormData)
    const body = request.body as FormData
    expect(body.get('prompt')).toBe('Restyle this image')
    expect((body.get('image') as File).name).toBe('reference.png')
  })
})

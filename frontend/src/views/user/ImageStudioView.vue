<template>
  <AppLayout hide-nav>
    <div class="studio-shell">
      <header class="studio-header">
        <button type="button" class="icon-button" :title="t('chat.title')" @click="router.push('/chat')"><Icon name="arrowLeft" size="sm" /></button>
        <div><strong>{{ t('chat.imageStudio') }}</strong><span>{{ t('chat.imageStudioDescription') }}</span></div>
        <button type="button" class="account-button" @click="router.push(dashboardPath)"><Icon name="user" size="sm" /><span>{{ accountName }}</span></button>
      </header>

      <main class="studio-main">
        <aside class="studio-controls">
          <label class="field">
            <span>{{ t('chat.imageModel') }}</span>
            <select v-model="model" :disabled="loadingModels">
              <option value="">{{ loadingModels ? t('common.loading') : t('chat.selectImageModel') }}</option>
              <option v-for="item in imageModels" :key="item.name" :value="item.name">{{ item.name }} · {{ formatImagePrice(item.pricing) }}</option>
            </select>
            <small v-if="selectedModelOption" class="model-price"><Icon name="dollar" size="xs" />{{ formatImagePrice(selectedModelOption.pricing) }}</small>
          </label>

          <fieldset class="ratio-field">
            <legend>{{ t('chat.aspectRatio') }}</legend>
            <button v-for="item in ratios" :key="item.value" type="button" :class="{ active: ratio === item.value }" @click="ratio = item.value">
              <i :style="{ aspectRatio: item.css }" /><span>{{ item.value }}</span>
            </button>
          </fieldset>

          <div class="control-grid">
            <label class="field"><span>{{ t('chat.imageQuality') }}</span><select v-model="quality"><option value="auto">{{ t('chat.qualityAuto') }}</option><option value="medium">{{ t('chat.qualityMedium') }}</option><option value="high">{{ t('chat.qualityHigh') }}</option></select></label>
            <label class="field"><span>{{ t('chat.imageCountLabel') }}</span><select v-model.number="count"><option v-for="n in 4" :key="n" :value="n">{{ n }}</option></select></label>
            <label class="field"><span>{{ t('chat.imageFormat') }}</span><select v-model="format"><option value="png">PNG</option><option value="webp">WebP</option><option value="jpeg">JPEG</option></select></label>
            <label class="field"><span>{{ t('chat.imageBackground') }}</span><select v-model="background"><option value="auto">{{ t('chat.backgroundAuto') }}</option><option value="opaque">{{ t('chat.backgroundOpaque') }}</option><option value="transparent">{{ t('chat.backgroundTransparent') }}</option></select></label>
          </div>

          <label class="reference-drop">
            <Icon name="image" size="md" />
            <span><strong>{{ t('chat.referenceImages') }}</strong><small>{{ t('chat.referenceImagesHint') }}</small></span>
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple @change="addReferences" />
          </label>
          <div v-if="references.length" class="reference-list">
            <div v-for="item in references" :key="item.url"><img :src="item.url" :alt="item.file.name" /><button type="button" @click="removeReference(item.url)"><Icon name="x" size="xs" /></button></div>
          </div>
          <section class="studio-history">
            <div class="studio-history__heading"><span>{{ t('chat.imageHistory') }}</span><button v-if="history.length" type="button" :title="t('chat.clearImageHistory')" @click="clearHistory"><Icon name="trash" size="xs" /></button></div>
            <div v-if="history.length" class="studio-history__list">
              <button v-for="item in history" :key="item.id" type="button" class="studio-history-item" @click="restoreHistory(item)">
                <img v-if="item.images[0]" :src="item.images[0]" :alt="item.prompt" />
                <span v-else><Icon name="image" size="sm" /></span>
                <div><strong>{{ item.prompt }}</strong><small>{{ item.model }} · {{ formatHistoryDate(item.createdAt) }}</small></div>
              </button>
            </div>
            <div v-else class="studio-history__empty">{{ t('chat.noImageHistory') }}</div>
          </section>
        </aside>

        <section class="studio-canvas">
          <div v-if="!results.length && !generating" class="canvas-empty"><Icon name="image" size="lg" /><strong>{{ t('chat.imageCanvasTitle') }}</strong><span>{{ t('chat.imageCanvasHint') }}</span></div>
          <div v-if="generating" class="canvas-loading"><i /><i /><i /><span>{{ t('chat.creatingImage') }}</span></div>
          <div v-else-if="results.length" class="result-grid" :class="`result-grid--${Math.min(results.length, 4)}`">
            <figure v-for="(image, index) in results" :key="image"><img :src="image" :alt="`${t('chat.generatedImage')} ${index + 1}`" /><a :href="image" :download="`generated-${index + 1}.${format}`" :title="t('chat.downloadImage')" :aria-label="t('chat.downloadImage')"><Icon name="download" size="sm" /></a></figure>
          </div>
        </section>
      </main>

      <form class="prompt-dock" @submit.prevent="generate">
        <textarea v-model="prompt" rows="2" :placeholder="t('chat.imagePromptPlaceholder')" />
        <button v-if="generating" type="button" class="generate-button stop" @click="controller?.abort()"><Icon name="x" size="sm" />{{ t('chat.stop') }}</button>
        <button v-else type="submit" class="generate-button" :disabled="!canGenerate"><Icon name="image" size="sm" />{{ t('chat.createImage') }}</button>
      </form>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import Icon from '@/components/icons/Icon.vue'
import keysAPI from '@/api/keys'
import { generateChatImages, getDefaultChatModels } from '@/api/chat'
import userChannelsAPI, { type UserSupportedModelPricing } from '@/api/channels'
import userGroupsAPI from '@/api/groups'
import { BILLING_MODE_IMAGE, BILLING_MODE_PER_REQUEST } from '@/constants/channel'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { extractApiErrorMessage } from '@/utils/apiError'
import type { ApiKey } from '@/types'
import { formatCurrency } from '@/utils/format'

type Ratio = '1:1' | '3:2' | '2:3' | '16:9' | '9:16'
interface ReferenceImage { file: File; url: string }
interface ImageModelOption { name: string; pricing: UserSupportedModelPricing | null }
interface ImageHistoryItem { id: string; createdAt: number; prompt: string; model: string; ratio: Ratio; quality: 'auto' | 'medium' | 'high'; count: number; format: 'png' | 'webp' | 'jpeg'; background: 'auto' | 'transparent' | 'opaque'; images: string[] }
const CHAT_KEY_NAME = 'Console Chat'
const LEGACY_IMAGE_KEY_NAME = 'Console Image Studio'
const CHAT_GROUP_STORAGE_KEY = 'sub2api_chat_group_id'
const IMAGE_HISTORY_DB_NAME = 'sub2api-image-studio-v1'
const IMAGE_HISTORY_STORE = 'history'
const MAX_IMAGE_HISTORY = 20
const imagePattern = /(?:gpt-image|dall-e|imagen|grok-imagine|flux|seedream|qwen-image|imagegen)/i
const { t } = useI18n()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const apiKey = ref<ApiKey | null>(null)
const models = ref<ImageModelOption[]>([])
const model = ref('')
const loadingModels = ref(true)
const prompt = ref('')
const ratio = ref<Ratio>('1:1')
const quality = ref<'auto' | 'medium' | 'high'>('auto')
const count = ref(1)
const format = ref<'png' | 'webp' | 'jpeg'>('png')
const background = ref<'auto' | 'transparent' | 'opaque'>('auto')
const references = ref<ReferenceImage[]>([])
const results = ref<string[]>([])
const history = ref<ImageHistoryItem[]>([])
const generating = ref(false)
let controller: AbortController | null = null
const ratios: Array<{ value: Ratio; css: string }> = [{ value: '1:1', css: '1' }, { value: '3:2', css: '3/2' }, { value: '2:3', css: '2/3' }, { value: '16:9', css: '16/9' }, { value: '9:16', css: '9/16' }]
const imageModels = computed(() => models.value.filter((item) => imagePattern.test(item.name)))
const selectedModelOption = computed(() => imageModels.value.find((item) => item.name === model.value))
const canGenerate = computed(() => Boolean(apiKey.value && model.value && prompt.value.trim()))
const dashboardPath = computed(() => authStore.isAdmin ? '/admin/dashboard' : '/dashboard')
const accountName = computed(() => authStore.user?.username || authStore.user?.email?.split('@')[0] || t('nav.myAccount'))
const imageSize = computed(() => ({ '1:1': '1024x1024', '3:2': '1536x1024', '2:3': '1024x1536', '16:9': '1536x864', '9:16': '864x1536' } as const)[ratio.value])

function formatImagePrice(pricing: UserSupportedModelPricing | null) {
  if (!pricing) return t('chat.pricingUnavailable')
  if (pricing.billing_mode === BILLING_MODE_IMAGE) {
    const price = pricing.image_output_price ?? pricing.per_request_price
    return price == null ? t('chat.pricingUnavailable') : `${formatCurrency(price)} / img`
  }
  if (pricing.billing_mode === BILLING_MODE_PER_REQUEST) {
    return pricing.per_request_price == null ? t('chat.pricingUnavailable') : `${formatCurrency(pricing.per_request_price)} / req`
  }
  if (pricing.input_price != null || pricing.output_price != null) {
    const input = pricing.input_price == null ? '-' : formatCurrency(pricing.input_price * 1_000_000)
    const output = pricing.output_price == null ? '-' : formatCurrency(pricing.output_price * 1_000_000)
    return `${input} / ${output} · 1M tok`
  }
  return t('chat.pricingUnavailable')
}
function uid() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}` }
function formatHistoryDate(timestamp: number) { return new Date(timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) }
function openHistoryDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(IMAGE_HISTORY_DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(IMAGE_HISTORY_STORE)) request.result.createObjectStore(IMAGE_HISTORY_STORE, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
async function loadHistory() {
  try {
    const database = await openHistoryDatabase()
    const transaction = database.transaction(IMAGE_HISTORY_STORE, 'readonly')
    const request = transaction.objectStore(IMAGE_HISTORY_STORE).get('items')
    request.onsuccess = () => { if (Array.isArray(request.result?.items)) history.value = request.result.items }
    database.close()
  } catch { /* IndexedDB may be disabled. */ }
}
async function persistHistory() {
  try {
    const database = await openHistoryDatabase()
    const transaction = database.transaction(IMAGE_HISTORY_STORE, 'readwrite')
    transaction.objectStore(IMAGE_HISTORY_STORE).put({ id: 'items', items: history.value })
    database.close()
  } catch { /* Keep the current generation usable if storage is unavailable. */ }
}
function restoreHistory(item: ImageHistoryItem) {
  prompt.value = item.prompt
  if (imageModels.value.some((option) => option.name === item.model)) model.value = item.model
  ratio.value = item.ratio; quality.value = item.quality; count.value = item.count; format.value = item.format; background.value = item.background
  results.value = [...item.images]
}
function clearHistory() { history.value = []; void persistHistory() }

async function initialize() {
  loadingModels.value = true
  try {
    const [keys, channels, availableGroups] = await Promise.all([
      keysAPI.list(1, 100, { status: 'active' }),
      userChannelsAPI.getAvailable(),
      userGroupsAPI.getAvailable(),
    ])
    const sections = channels.flatMap((channel) => channel.platforms)
    const imageSection = sections
      .find((section) => section.groups.length && (section.supported_models.some((item) => imagePattern.test(item.name)) || getDefaultChatModels(section.platform).some((item) => imagePattern.test(item))))
    const groupsByID = new Map<string, { id: number; platform: string }>(
      availableGroups.filter((item) => item.status === 'active').map((item) => [String(item.id), item]),
    )
    for (const section of sections) for (const group of section.groups) if (!groupsByID.has(String(group.id))) groupsByID.set(String(group.id), group)

    const storedGroupID = localStorage.getItem(CHAT_GROUP_STORAGE_KEY) || ''
    let consoleKey = keys.items.find((item) => item.name === CHAT_KEY_NAME && item.group_id)
      || keys.items.find((item) => item.name === LEGACY_IMAGE_KEY_NAME && item.group_id)
    const storedGroup = groupsByID.get(storedGroupID)
    const currentGroup = consoleKey?.group_id ? groupsByID.get(String(consoleKey.group_id)) : undefined
    const targetGroup = storedGroup || currentGroup || imageSection?.groups[0] || availableGroups.find((item) => item.status === 'active')
    if (!targetGroup) throw new Error(t('chat.noAvailableGroup'))

    if (!consoleKey) consoleKey = await keysAPI.create(CHAT_KEY_NAME, targetGroup.id)
    else if (consoleKey.name !== CHAT_KEY_NAME || String(consoleKey.group_id) !== String(targetGroup.id)) {
      consoleKey = await keysAPI.update(consoleKey.id, { name: CHAT_KEY_NAME, group_id: Number(targetGroup.id) })
    }
    apiKey.value = consoleKey
    localStorage.setItem(CHAT_GROUP_STORAGE_KEY, String(targetGroup.id))

    const groupID = String(consoleKey.group_id)
    const selectedSections = sections.filter((section) => section.groups.some((group) => String(group.id) === groupID))
    const modelCatalog = new Map<string, ImageModelOption>()
    for (const item of selectedSections.flatMap((section) => section.supported_models)) {
      if (!modelCatalog.has(item.name)) modelCatalog.set(item.name, { name: item.name, pricing: item.pricing })
    }
    const platforms = new Set(selectedSections.map((section) => section.platform))
    if (!platforms.size && targetGroup.platform) platforms.add(targetGroup.platform)
    for (const name of [...platforms].flatMap(getDefaultChatModels)) {
      if (!modelCatalog.has(name)) modelCatalog.set(name, { name, pricing: null })
    }
    models.value = [...modelCatalog.values()]
    model.value = imageModels.value[0]?.name || ''
    if (!model.value) appStore.showError(t('chat.failedModels'))
  } catch (error) { appStore.showError(extractApiErrorMessage(error, t('chat.failedModels'))) }
  finally { loadingModels.value = false }
}
function addReferences(event: Event) {
  const input = event.target as HTMLInputElement
  const additions = [...(input.files || [])].slice(0, Math.max(0, 4 - references.value.length)).map((file) => ({ file, url: URL.createObjectURL(file) }))
  references.value.push(...additions); input.value = ''
}
function removeReference(url: string) { URL.revokeObjectURL(url); references.value = references.value.filter((item) => item.url !== url) }
async function generate() {
  if (!canGenerate.value || !apiKey.value) return
  generating.value = true; controller = new AbortController()
  try {
    const response = await generateChatImages({ apiKey: apiKey.value.key, model: model.value, prompt: prompt.value.trim(), size: imageSize.value, quality: quality.value, count: count.value, background: background.value, outputFormat: format.value, referenceImages: references.value.map((item) => item.file), signal: controller.signal })
    results.value = response.images
    if (response.images.length) {
      history.value.unshift({ id: uid(), createdAt: Date.now(), prompt: prompt.value.trim(), model: model.value, ratio: ratio.value, quality: quality.value, count: count.value, format: format.value, background: background.value, images: [...response.images] })
      history.value = history.value.slice(0, MAX_IMAGE_HISTORY)
      void persistHistory()
    }
    if (!response.images.length) appStore.showError(t('chat.emptyImageResponse'))
  } catch (error) { if ((error as Error).name !== 'AbortError') appStore.showError(extractApiErrorMessage(error, t('chat.requestFailed', { message: t('common.error') }))) }
  finally { generating.value = false; controller = null }
}
onMounted(() => { void initialize(); void loadHistory() })
onBeforeUnmount(() => { controller?.abort(); references.value.forEach((item) => URL.revokeObjectURL(item.url)) })
</script>

<style scoped>
.studio-shell{height:100dvh;display:flex;overflow:hidden;flex-direction:column;background:#fffdf6;color:#29291f}.studio-header{height:68px;flex:0 0 auto;display:flex;align-items:center;gap:12px;padding:0 18px;border-bottom:1px solid rgba(52,49,39,.08);background:rgba(255,253,246,.92);backdrop-filter:blur(18px)}.studio-header>div{min-width:0;flex:1}.studio-header strong,.studio-header span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.studio-header strong{font-size:17px}.studio-header span{margin-top:2px;color:#969185;font-size:10px}.icon-button,.account-button{height:40px;border:1px solid rgba(52,49,39,.09);border-radius:9px;background:#fff;color:#58564d}.icon-button{width:40px;display:grid;place-items:center}.account-button{display:flex;align-items:center;gap:7px;padding:0 11px}.account-button span{max-width:120px;font-size:11px}.studio-main{min-height:0;flex:1;display:grid;grid-template-columns:340px minmax(0,1fr)}.studio-controls{overflow-y:auto;padding:20px 18px 130px;border-right:1px solid rgba(52,49,39,.08);background:#f8f3df}.field{display:grid;gap:7px;margin-bottom:14px}.field>span,.ratio-field legend{color:#777267;font-size:10px;font-weight:750;text-transform:uppercase}.field select{width:100%;height:44px;padding:0 34px 0 11px;border:1px solid rgba(52,49,39,.12);border-radius:8px;outline:0;background:#fff;color:#34342d;font-size:12px}.field select:focus{border-color:rgba(31,96,73,.4);box-shadow:0 0 0 3px rgba(31,96,73,.08)}.model-price{display:flex;align-items:center;gap:5px;color:#6f7f71;font-size:10px;font-weight:650}.ratio-field{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:0 0 16px;padding:0;border:0}.ratio-field legend{grid-column:1/-1;margin-bottom:1px}.ratio-field button{height:58px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;border:1px solid rgba(52,49,39,.1);border-radius:8px;background:#fff;color:#777267;font-size:9px}.ratio-field button.active{border-color:#1f6049;background:#edf4eb;color:#1f6049}.ratio-field i{width:20px;max-height:25px;border:1.5px solid currentColor;border-radius:2px}.control-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 9px}.reference-drop{min-height:94px;display:flex;align-items:center;gap:12px;padding:13px;border:1px dashed rgba(31,96,73,.3);border-radius:10px;background:rgba(255,255,255,.55);color:#1f6049;cursor:pointer}.reference-drop input{display:none}.reference-drop span{min-width:0}.reference-drop strong,.reference-drop small{display:block}.reference-drop strong{font-size:12px}.reference-drop small{margin-top:4px;color:#878276;font-size:9px;line-height:1.45}.reference-list{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:9px}.reference-list>div{position:relative;aspect-ratio:1;overflow:hidden;border-radius:8px}.reference-list img{width:100%;height:100%;object-fit:cover}.reference-list button{position:absolute;top:4px;right:4px;width:24px;height:24px;display:grid;place-items:center;border:0;border-radius:50%;background:rgba(30,31,27,.75);color:#fff}.studio-canvas{min-width:0;overflow-y:auto;padding:24px 24px 150px;background:#fff}.canvas-empty,.canvas-loading{height:100%;min-height:360px;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#9b9689}.canvas-empty strong{margin-top:14px;color:#55544b;font-size:17px}.canvas-empty span{margin-top:6px;font-size:11px}.canvas-loading{gap:7px}.canvas-loading i{width:7px;height:7px;border-radius:50%;background:#1f6049;animation:pulse 1s ease-in-out infinite}.canvas-loading i:nth-child(2){animation-delay:.12s}.canvas-loading i:nth-child(3){animation-delay:.24s}.canvas-loading span{margin-top:8px;font-size:11px}.result-grid{width:min(1100px,100%);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:auto}.result-grid--1{grid-template-columns:minmax(0,760px);justify-content:center}.result-grid figure{position:relative;overflow:hidden;margin:0;border-radius:10px;background:#f4f0df}.result-grid img{width:100%;height:auto;display:block}.result-grid a{position:absolute;right:10px;bottom:10px;width:40px;height:40px;display:grid;place-items:center;border-radius:9px;background:rgba(255,255,255,.9);color:#29291f;box-shadow:0 8px 20px rgba(30,28,20,.16);backdrop-filter:blur(10px)}.prompt-dock{position:fixed;z-index:10;right:24px;bottom:18px;left:364px;display:flex;align-items:flex-end;gap:9px;padding:10px;border:1px solid rgba(52,49,39,.1);border-radius:12px;background:rgba(255,255,255,.94);box-shadow:0 14px 40px rgba(55,47,26,.12);backdrop-filter:blur(18px)}.prompt-dock textarea{min-width:0;min-height:50px;max-height:130px;flex:1;padding:11px;border:0;outline:0;resize:vertical;background:transparent;color:#303129;font:15px/1.5 inherit}.generate-button{height:46px;display:flex;align-items:center;gap:7px;padding:0 16px;border:0;border-radius:9px;background:#1f6049;color:#fff;font-size:12px;font-weight:700}.generate-button:disabled{background:#c9c5b8}.generate-button.stop{background:#625e54}@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
.studio-shell{height:100dvh;display:flex;overflow:hidden;flex-direction:column;background:#fffdf6;color:#29291f}.studio-header{height:68px;flex:0 0 auto;display:flex;align-items:center;gap:12px;padding:0 18px;border-bottom:1px solid rgba(52,49,39,.08);background:rgba(255,253,246,.92);backdrop-filter:blur(18px)}.studio-header>div{min-width:0;flex:1}.studio-header strong,.studio-header span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.studio-header strong{font-size:17px}.studio-header span{margin-top:2px;color:#969185;font-size:10px}.icon-button,.account-button{height:40px;border:1px solid rgba(52,49,39,.09);border-radius:9px;background:#fff;color:#58564d}.icon-button{width:40px;display:grid;place-items:center}.account-button{display:flex;align-items:center;gap:7px;padding:0 11px}.account-button span{max-width:120px;font-size:11px}.studio-main{min-height:0;flex:1;display:grid;grid-template-columns:340px minmax(0,1fr)}.studio-controls{overflow-y:auto;padding:20px 18px 130px;border-right:1px solid rgba(52,49,39,.08);background:#f8f3df}.field{display:grid;gap:7px;margin-bottom:14px}.field>span,.ratio-field legend{color:#777267;font-size:10px;font-weight:750;text-transform:uppercase}.field select{width:100%;height:44px;padding:0 34px 0 11px;border:1px solid rgba(52,49,39,.12);border-radius:8px;outline:0;background:#fff;color:#34342d;font-size:12px}.field select:focus{border-color:rgba(31,96,73,.4);box-shadow:0 0 0 3px rgba(31,96,73,.08)}.model-price{display:flex;align-items:center;gap:5px;color:#6f7f71;font-size:10px;font-weight:650}.ratio-field{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:0 0 16px;padding:0;border:0}.ratio-field legend{grid-column:1/-1;margin-bottom:1px}.ratio-field button{height:58px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;border:1px solid rgba(52,49,39,.1);border-radius:8px;background:#fff;color:#777267;font-size:9px}.ratio-field button.active{border-color:#1f6049;background:#edf4eb;color:#1f6049}.ratio-field i{width:20px;max-height:25px;border:1.5px solid currentColor;border-radius:2px}.control-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 9px}.reference-drop{min-height:94px;display:flex;align-items:center;gap:12px;padding:13px;border:1px dashed rgba(31,96,73,.3);border-radius:10px;background:rgba(255,255,255,.55);color:#1f6049;cursor:pointer}.reference-drop input{display:none}.reference-drop span{min-width:0}.reference-drop strong,.reference-drop small{display:block}.reference-drop strong{font-size:12px}.reference-drop small{margin-top:4px;color:#878276;font-size:9px;line-height:1.45}.reference-list{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:9px}.reference-list>div{position:relative;aspect-ratio:1;overflow:hidden;border-radius:8px}.reference-list img{width:100%;height:100%;object-fit:cover}.reference-list button{position:absolute;top:4px;right:4px;width:24px;height:24px;display:grid;place-items:center;border:0;border-radius:50%;background:rgba(30,31,27,.75);color:#fff}.studio-history{margin-top:22px;padding-top:15px;border-top:1px solid rgba(52,49,39,.09)}.studio-history__heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;color:#777267;font-size:10px;font-weight:750;text-transform:uppercase}.studio-history__heading button{width:26px;height:26px;display:grid;place-items:center;border:0;border-radius:6px;background:transparent;color:#8b8578}.studio-history__heading button:hover{background:rgba(255,255,255,.65);color:#b54c42}.studio-history__list{display:grid;gap:6px}.studio-history-item{min-width:0;display:grid;grid-template-columns:42px minmax(0,1fr);gap:8px;align-items:center;padding:5px;border:1px solid rgba(52,49,39,.09);border-radius:8px;background:rgba(255,255,255,.5);color:#45433b;text-align:left;transition:transform .16s ease,border-color .16s ease,background .16s ease}.studio-history-item:hover{transform:translateY(-1px);border-color:rgba(31,96,73,.24);background:#fff}.studio-history-item>img,.studio-history-item>span{width:42px;height:42px;display:grid;place-items:center;border-radius:5px;background:#efecdf;object-fit:cover;color:#8a8475}.studio-history-item div{min-width:0}.studio-history-item strong,.studio-history-item small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.studio-history-item strong{font-size:10px;font-weight:700}.studio-history-item small{margin-top:3px;color:#8b8579;font-size:8px}.studio-history__empty{padding:10px 0;color:#999384;font-size:10px}.studio-canvas{min-width:0;overflow-y:auto;padding:24px 24px 150px;background:#fff}.canvas-empty,.canvas-loading{height:100%;min-height:360px;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#9b9689}.canvas-empty strong{margin-top:14px;color:#55544b;font-size:17px}.canvas-empty span{margin-top:6px;font-size:11px}.canvas-loading{gap:7px}.canvas-loading i{width:7px;height:7px;border-radius:50%;background:#1f6049;animation:pulse 1s ease-in-out infinite}.canvas-loading i:nth-child(2){animation-delay:.12s}.canvas-loading i:nth-child(3){animation-delay:.24s}.canvas-loading span{margin-top:8px;font-size:11px}.result-grid{width:min(1100px,100%);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:auto}.result-grid--1{grid-template-columns:minmax(0,760px);justify-content:center}.result-grid figure{position:relative;overflow:hidden;margin:0;border-radius:10px;background:#f4f0df}.result-grid img{width:100%;height:auto;display:block}.result-grid a{position:absolute;right:10px;bottom:10px;width:40px;height:40px;display:grid;place-items:center;border-radius:9px;background:rgba(255,255,255,.9);color:#29291f;box-shadow:0 8px 20px rgba(30,28,20,.16);backdrop-filter:blur(10px)}.prompt-dock{position:fixed;z-index:10;right:24px;bottom:18px;left:364px;display:flex;align-items:flex-end;gap:9px;padding:10px;border:1px solid rgba(52,49,39,.1);border-radius:12px;background:rgba(255,255,255,.94);box-shadow:0 14px 40px rgba(55,47,26,.12);backdrop-filter:blur(18px)}.prompt-dock textarea{min-width:0;min-height:50px;max-height:130px;flex:1;padding:11px;border:0;outline:0;resize:vertical;background:transparent;color:#303129;font:15px/1.5 inherit}.generate-button{height:46px;display:flex;align-items:center;gap:7px;padding:0 16px;border:0;border-radius:9px;background:#1f6049;color:#fff;font-size:12px;font-weight:700}.generate-button:disabled{background:#c9c5b8}.generate-button.stop{background:#625e54}@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
@media(max-width:760px){.studio-header{height:60px;padding:0 10px}.studio-header span{display:none}.account-button{width:40px;padding:0;justify-content:center}.account-button span{display:none}.studio-main{display:block;overflow-y:auto}.studio-controls{overflow:visible;padding:14px 12px 16px;border:0}.studio-canvas{min-height:380px;padding:14px 10px 148px}.control-grid{gap:0 8px}.ratio-field{overflow-x:auto;grid-template-columns:repeat(5,minmax(58px,1fr));padding-bottom:3px}.ratio-field button{height:54px}.reference-drop{min-height:76px}.reference-list{grid-template-columns:repeat(4,minmax(0,1fr))}.result-grid{grid-template-columns:1fr;gap:9px}.prompt-dock{right:8px;bottom:calc(8px + env(safe-area-inset-bottom));left:8px;align-items:stretch;flex-direction:column;padding:8px;border-radius:12px}.prompt-dock textarea{width:100%;min-height:70px;font-size:16px;resize:none}.generate-button{width:100%;justify-content:center}.canvas-empty,.canvas-loading{min-height:320px}}
@media(prefers-reduced-motion:reduce){.canvas-loading i{animation:none}}
.result-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
@media(max-width:760px) { .result-grid { grid-template-columns: 1fr; gap: 9px; } }
.result-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
@media(max-width:760px) { .result-grid { grid-template-columns: 1fr; gap: 9px; } }
</style>

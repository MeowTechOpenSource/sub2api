<template>
  <div class="plaza-page">
    <header class="plaza-hero">
      <div class="plaza-hero__copy">
        <span class="plaza-eyebrow">{{ t('modelPlaza.catalogLabel') }}</span>
        <h1>{{ t('modelPlaza.title') }}</h1>
        <p>{{ isAuthenticated ? t('modelPlaza.memberDescription') : t('modelPlaza.description') }}</p>
      </div>
      <button type="button" class="plaza-refresh" :disabled="loading" @click="$emit('reload')">
        <Icon name="refresh" size="sm" :class="{ 'animate-spin': loading }" />
        <span>{{ t('modelPlaza.refresh') }}</span>
      </button>
    </header>

    <div v-if="!loading && response" class="plaza-stats" aria-live="polite">
      <div><strong>{{ totalModels }}</strong><span>{{ t('modelPlaza.stats.models') }}</span></div>
      <div><strong>{{ response.groups.length }}</strong><span>{{ t('modelPlaza.stats.groups') }}</span></div>
      <div><strong>{{ platforms.length }}</strong><span>{{ t('modelPlaza.stats.platforms') }}</span></div>
      <div><strong>{{ activeEventCount }}</strong><span>{{ t('modelPlaza.stats.liveEvents') }}</span></div>
    </div>

    <div v-if="descriptionHtml" class="plaza-description" v-html="descriptionHtml"></div>

    <div v-if="!isAuthenticated" class="plaza-notice">
      <Icon name="infoCircle" size="sm" />
      <span>{{ t('modelPlaza.anonymousHint') }}</span>
    </div>

    <div v-if="loading" class="plaza-loading" aria-live="polite">
      <span v-for="item in 3" :key="item"></span>
    </div>
    <div v-else-if="error" class="plaza-state plaza-state--error">
      <Icon name="exclamationCircle" size="lg" />
      <strong>{{ t('modelPlaza.loadFailed') }}</strong>
      <button type="button" @click="$emit('reload')">{{ t('modelPlaza.tryAgain') }}</button>
    </div>
    <template v-else>
      <PlazaFilterBar
        :platforms="platforms"
        :groups="groupOptions"
        :rates="rates"
        :platform="selectedPlatform"
        :group-id="selectedGroupId"
        :rate="selectedRate"
        :search="searchQuery"
        @update:platform="selectedPlatform = $event"
        @update:group-id="selectedGroupId = $event"
        @update:rate="selectedRate = $event"
        @update:search="searchQuery = $event"
      />

      <TransitionGroup v-if="filteredGroups.length" name="plaza-list" tag="div" class="plaza-groups">
        <PlazaGroupSection v-for="group in filteredGroups" :key="group.id" :group="group" />
      </TransitionGroup>
      <div v-else class="plaza-state">
        <Icon name="search" size="lg" />
        <strong>{{ searchActive ? t('modelPlaza.noSearchResult') : t('modelPlaza.empty') }}</strong>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import Icon from '@/components/icons/Icon.vue'
import PlazaFilterBar from './PlazaFilterBar.vue'
import PlazaGroupSection from './PlazaGroupSection.vue'
import type { ModelPlazaGroup, ModelPlazaResponse } from '@/api/modelPlaza'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  response: ModelPlazaResponse | null
  loading: boolean
  error?: boolean
  embedded?: boolean
}>()

defineEmits<{ reload: [] }>()

const { t } = useI18n()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
const selectedPlatform = ref<string>('all')
const selectedGroupId = ref<number | 'all'>('all')
const selectedRate = ref<number | 'all'>('all')
const searchQuery = ref('')
const searchActive = computed(() => searchQuery.value.trim() !== '')

const descriptionHtml = computed(() => {
  const markdown = props.response?.description?.trim()
  return markdown ? DOMPurify.sanitize(marked.parse(markdown) as string) : ''
})

function effectiveRate(group: ModelPlazaGroup): number {
  return group.user_rate_multiplier ?? group.rate_multiplier
}

const platforms = computed(() =>
  [...new Set((props.response?.groups ?? []).map((group) => group.platform).filter(Boolean))].sort()
)
const groupOptions = computed(() =>
  (props.response?.groups ?? []).map((group) => ({
    id: group.id,
    name: group.name,
    platform: group.platform,
    rate: effectiveRate(group),
    modelCount: group.models.length,
  }))
)
const rates = computed(() =>
  [...new Set((props.response?.groups ?? []).map(effectiveRate))].sort((a, b) => a - b)
)
const totalModels = computed(() => new Set(
  (props.response?.groups ?? []).flatMap((group) => group.models.map((model) => `${model.platform}:${model.name}`))
).size)
const activeEventCount = computed(() =>
  (props.response?.groups ?? []).filter((group) => group.active_happy_hour || group.peak_rate_active).length
)

watch(rates, (list) => {
  if (selectedRate.value !== 'all' && !list.includes(selectedRate.value)) selectedRate.value = 'all'
})

const filteredGroups = computed(() => {
  let groups = props.response?.groups ?? []
  if (selectedPlatform.value !== 'all') groups = groups.filter((group) => group.platform === selectedPlatform.value)
  if (selectedGroupId.value !== 'all') groups = groups.filter((group) => group.id === selectedGroupId.value)
  if (selectedRate.value !== 'all') groups = groups.filter((group) => effectiveRate(group) === selectedRate.value)
  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    groups = groups
      .map((group) => ({ ...group, models: group.models.filter((model) => model.name.toLowerCase().includes(query)) }))
      .filter((group) => group.models.length > 0)
  }
  return [...groups].sort((a, b) => effectiveRate(a) - effectiveRate(b) || a.name.localeCompare(b.name))
})
</script>

<style scoped>
.plaza-page { display: grid; gap: 20px; color: #302e26; animation: plaza-enter .42s ease both; }
.plaza-hero { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; padding: 4px 2px 2px; }
.plaza-eyebrow { display: block; margin-bottom: 7px; color: #276b53; font-size: 11px; font-weight: 800; text-transform: uppercase; }
.plaza-hero h1 { margin: 0; color: #24231d; font-size: 38px; font-weight: 760; line-height: 1.15; letter-spacing: 0; }
.plaza-hero p { max-width: 680px; margin: 8px 0 0; color: #756e5d; font-size: 14px; line-height: 1.65; }
.plaza-refresh { display: inline-flex; min-height: 42px; align-items: center; gap: 8px; padding: 0 14px; border: 1px solid rgba(57,48,28,.13); border-radius: 10px; background: rgba(255,255,255,.62); color: #3f5f51; font-size: 13px; font-weight: 700; box-shadow: 0 8px 24px rgba(67,55,26,.06); backdrop-filter: blur(16px); transition: transform .18s ease, background .18s ease, box-shadow .18s ease; }
.plaza-refresh:hover:not(:disabled) { transform: translateY(-2px); background: rgba(255,255,255,.9); box-shadow: 0 12px 26px rgba(67,55,26,.1); }
.plaza-refresh:disabled { opacity: .55; }
.plaza-stats { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); border: 1px solid rgba(57,48,28,.1); border-radius: 12px; background: rgba(255,253,244,.62); box-shadow: 0 12px 35px rgba(67,55,26,.06); backdrop-filter: blur(18px); }
.plaza-stats>div { display: flex; min-width: 0; align-items: baseline; gap: 8px; padding: 16px 18px; border-right: 1px solid rgba(57,48,28,.08); }
.plaza-stats>div:last-child { border: 0; }
.plaza-stats strong { color: #245d48; font-size: 22px; font-weight: 760; font-variant-numeric: tabular-nums; }
.plaza-stats span { color: #847c68; font-size: 11px; font-weight: 700; }
.plaza-description { padding: 15px 17px; border-left: 3px solid #3e7961; border-radius: 0 10px 10px 0; background: rgba(255,255,255,.48); color: #575245; font-size: 13px; line-height: 1.7; overflow-wrap: anywhere; }
.plaza-description :deep(p) { margin: 0 0 6px; }.plaza-description :deep(p:last-child) { margin: 0; }
.plaza-description :deep(a) { color: #276b53; text-decoration: underline; text-underline-offset: 3px; }
.plaza-description :deep(ul),.plaza-description :deep(ol) { margin: 6px 0; padding-left: 20px; }
.plaza-notice { display: flex; align-items: center; gap: 9px; color: #746d5c; font-size: 12px; }
.plaza-groups { display: grid; gap: 18px; }
.plaza-loading { display: grid; gap: 14px; }
.plaza-loading span { height: 180px; border: 1px solid rgba(57,48,28,.08); border-radius: 12px; background: rgba(255,255,255,.45); animation: plaza-pulse 1.4s ease-in-out infinite; }
.plaza-loading span:nth-child(2) { animation-delay: .12s; }.plaza-loading span:nth-child(3) { animation-delay: .24s; }
.plaza-state { display: grid; min-height: 220px; place-items: center; align-content: center; gap: 10px; border: 1px dashed rgba(57,48,28,.18); border-radius: 12px; color: #8a826f; font-size: 13px; }
.plaza-state--error { color: #9b4939; }
.plaza-state button { min-height: 38px; padding: 0 13px; border: 1px solid currentColor; border-radius: 9px; background: transparent; font-weight: 700; }
.plaza-list-enter-active,.plaza-list-leave-active { transition: opacity .24s ease, transform .24s ease; }.plaza-list-enter-from,.plaza-list-leave-to { opacity: 0; transform: translateY(7px); }
.dark .plaza-page { color: #e8e4d8; }.dark .plaza-hero h1 { color: #f5f1e6; }.dark .plaza-hero p { color: #aaa591; }
.dark .plaza-stats,.dark .plaza-refresh { border-color: rgba(255,255,255,.09); background: rgba(35,37,32,.72); }.dark .plaza-description { background: rgba(255,255,255,.04); color: #c5c0b1; }
@keyframes plaza-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes plaza-pulse { 50% { opacity: .48; } }
@media (max-width: 720px) { .plaza-page { gap: 16px; }.plaza-hero { align-items: flex-start; }.plaza-hero h1 { font-size: 28px; }.plaza-refresh span { display: none; }.plaza-stats { grid-template-columns: repeat(2,minmax(0,1fr)); }.plaza-stats>div:nth-child(2) { border-right: 0; }.plaza-stats>div:nth-child(-n+2) { border-bottom: 1px solid rgba(57,48,28,.08); } }
@media (prefers-reduced-motion: reduce) { .plaza-page,.plaza-loading span { animation: none; }.plaza-list-enter-active,.plaza-list-leave-active { transition: none; } }
</style>

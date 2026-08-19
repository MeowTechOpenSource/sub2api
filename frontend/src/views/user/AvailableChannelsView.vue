<template>
  <AppLayout>
    <section class="pricing-page">
      <div class="pricing-page__header">
        <div>
          <p class="pricing-page__eyebrow">{{ t('availableChannels.catalogLabel') }}</p>
          <h1>{{ t('availableChannels.title') }}</h1>
          <p>{{ t('availableChannels.description') }}</p>
        </div>
        <button class="pricing-page__refresh" :disabled="loading" :title="t('common.refresh')" @click="loadChannels">
          <Icon name="refresh" size="sm" :class="{ 'animate-spin': loading }" />
          <span>{{ t('common.refresh') }}</span>
        </button>
      </div>

      <div class="pricing-catalog">
        <div class="pricing-catalog__tabs-wrap">
          <span class="pricing-filter-label">{{ t('availableChannels.access') }}</span>
          <div class="pricing-catalog__tabs" role="tablist" :aria-label="t('availableChannels.groupFilter')">
            <button
              class="pricing-tab"
              :class="{ 'pricing-tab--active': selectedGroup === 'all' }"
              role="tab"
              :aria-selected="selectedGroup === 'all'"
              @click="selectedGroup = 'all'"
            >
              {{ t('availableChannels.allGroups') }}
              <span>{{ allModelRows.length }}</span>
            </button>
            <button
              v-for="group in groups"
              :key="group.id"
              class="pricing-tab"
              :class="{ 'pricing-tab--active': selectedGroup === String(group.id) }"
              role="tab"
              :aria-selected="selectedGroup === String(group.id)"
              @click="selectedGroup = String(group.id)"
            >
              {{ group.name }}
              <span>{{ displayedGroupRate(group) }}x · {{ group.modelCount }}</span>
            </button>
          </div>
        </div>

        <div v-if="selectedHappyHourEvents.length" class="happy-hour" :class="{ 'happy-hour--active': selectedGroupInfo?.peak_rate_active }">
          <div class="happy-hour__lead">
            <span class="happy-hour__status">{{ selectedGroupInfo?.peak_rate_active ? t('availableChannels.happyHour.active') : t('availableChannels.happyHour.scheduled') }}</span>
            <strong>{{ t('availableChannels.happyHour.title') }}</strong>
            <span>{{ happyHourTimezone }}</span>
          </div>
          <div class="happy-hour__events">
            <div v-for="event in selectedHappyHourEvents" :key="`${event.name}-${event.start}-${event.end}`" :class="{ live: activeHappyHour?.name === event.name && activeHappyHour?.start === event.start }">
              <span><strong>{{ event.name }}</strong><small>{{ event.start }}-{{ event.end }}</small></span>
              <b>{{ event.rate_multiplier === 0 ? t('availableChannels.happyHour.free') : `${event.rate_multiplier}x` }}</b>
            </div>
          </div>
          <div class="happy-hour__quotas">
            <div v-for="window in happyHourQuotaWindows" :key="window.key" class="happy-hour__quota" :class="{ 'happy-hour__quota--unknown': !window.metered }">
              <div>
                <small>{{ window.label }}</small>
                <strong>{{ window.summary }}</strong>
              </div>
              <span v-if="window.metered"><i :style="{ width: `${window.percent}%` }" /></span>
            </div>
          </div>
        </div>

        <div class="pricing-catalog__toolbar">
          <label class="pricing-search">
            <Icon name="search" size="sm" />
            <input v-model="searchQuery" :placeholder="t('availableChannels.searchPlaceholder')" />
          </label>
          <div class="platform-filter-wrap">
            <span class="pricing-filter-label">{{ t('availableChannels.platformFilter') }}</span>
            <div class="platform-filter" role="group" :aria-label="t('availableChannels.platformFilter')">
              <button :class="{ active: selectedPlatform === 'all' }" @click="selectedPlatform = 'all'">
                {{ t('availableChannels.allPlatforms') }}
              </button>
              <button
                v-for="platform in platforms"
                :key="platform"
                :class="{ active: selectedPlatform === platform }"
                @click="selectedPlatform = platform"
              >
                {{ platform }}
              </button>
            </div>
          </div>
        </div>

        <div class="pricing-table-wrap">
          <table class="pricing-table">
            <thead>
              <tr>
                <th>{{ t('availableChannels.model') }}</th>
                <th>{{ t('availableChannels.pricing.inputPrice') }}</th>
                <th>{{ t('availableChannels.pricing.outputPrice') }}</th>
                <th>{{ t('availableChannels.pricing.cacheReadPrice') }}</th>
                <th>{{ t('availableChannels.pricing.perRequestPrice') }}</th>
                <th>{{ t('availableChannels.adjustment') }}</th>
              </tr>
            </thead>
            <tbody v-if="loading">
              <tr v-for="index in 6" :key="index" class="pricing-skeleton-row">
                <td colspan="6"><span /></td>
              </tr>
            </tbody>
            <tbody v-else-if="filteredRows.length">
              <tr v-for="row in filteredRows" :key="row.key">
                <td>
                  <div class="model-cell">
                    <span class="model-cell__icon"><PlatformIcon :platform="row.platform as GroupPlatform" size="sm" /></span>
                    <div>
                      <strong>{{ row.name }}</strong>
                      <span>{{ row.platform }} · {{ row.channels.join(', ') }}</span>
                    </div>
                  </div>
                </td>
                <td v-for="field in tokenPriceFields" :key="field" class="price-cell">
                  <div class="price-stack">
                    <strong>{{ tokenPrice(row.pricing?.[field]) }}</strong>
                    <span v-if="selectedMultiplier !== 1 && row.pricing?.[field] != null">
                      {{ t('availableChannels.originalPrice') }} <s>{{ tokenPrice(row.pricing?.[field], 1) }}</s>
                    </span>
                  </div>
                </td>
                <td class="price-cell">
                  <div class="price-stack">
                    <strong>{{ requestPrice(row.pricing) }}</strong>
                    <span v-if="selectedMultiplier !== 1 && requestPrice(row.pricing, 1) !== '-'">
                      {{ t('availableChannels.originalPrice') }} <s>{{ requestPrice(row.pricing, 1) }}</s>
                    </span>
                  </div>
                </td>
                <td><span class="price-adjustment" :class="adjustmentClass">{{ adjustmentLabel }}</span></td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr>
                <td colspan="6" class="pricing-empty">
                  <Icon name="search" size="lg" />
                  <strong>{{ t('availableChannels.empty') }}</strong>
                  <span>{{ t('availableChannels.emptyHint') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pricing-catalog__footer">
          <span>{{ t('availableChannels.showingModels', { count: filteredRows.length }) }}</span>
          <span>{{ t('availableChannels.priceNote') }}</span>
        </div>
      </div>
    </section>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import Icon from '@/components/icons/Icon.vue'
import PlatformIcon from '@/components/common/PlatformIcon.vue'
import userChannelsAPI, { type UserAvailableGroup, type UserSupportedModelPricing } from '@/api/channels'
import userGroupsAPI from '@/api/groups'
import { useAppStore } from '@/stores/app'
import { extractApiErrorMessage } from '@/utils/apiError'
import { BILLING_MODE_IMAGE, BILLING_MODE_PER_REQUEST } from '@/constants/channel'
import type { GroupPlatform } from '@/types'
import { formatCurrency } from '@/utils/format'
import { serverTimezoneLabel } from '@/utils/peak-rate'

interface ModelRow {
  key: string
  name: string
  platform: string
  pricing: UserSupportedModelPricing | null
  channels: string[]
  groups: UserAvailableGroup[]
}

const { t } = useI18n()
const appStore = useAppStore()
const channels = ref<Awaited<ReturnType<typeof userChannelsAPI.getAvailable>>>([])
const userGroupRates = ref<Record<number, number>>({})
const loading = ref(false)
const searchQuery = ref('')
const selectedGroup = ref('all')
const selectedPlatform = ref('all')
const tokenPriceFields = ['input_price', 'output_price', 'cache_read_price'] as const

const allModelRows = computed<ModelRow[]>(() => {
  const rows = new Map<string, ModelRow>()
  for (const channel of channels.value) {
    for (const section of channel.platforms) {
      for (const model of section.supported_models) {
        const key = `${section.platform.toLowerCase()}::${model.name.toLowerCase()}`
        const current = rows.get(key)
        if (current) {
          if (!current.channels.includes(channel.name)) current.channels.push(channel.name)
          for (const group of section.groups) {
            if (!current.groups.some((item) => item.id === group.id)) current.groups.push(group)
          }
        } else {
          rows.set(key, {
            key,
            name: model.name,
            platform: section.platform,
            pricing: model.pricing,
            channels: [channel.name],
            groups: [...section.groups],
          })
        }
      }
    }
  }
  return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name))
})

const groups = computed(() => {
  const result = new Map<number, UserAvailableGroup & { modelCount: number; rateMultiplier: number }>()
  for (const row of allModelRows.value) {
    for (const group of row.groups) {
      const item = result.get(group.id)
      if (item) item.modelCount += 1
      else result.set(group.id, { ...group, modelCount: 1, rateMultiplier: group.rate_multiplier })
    }
  }
  return [...result.values()].sort((a, b) => a.name.localeCompare(b.name))
})

const platforms = computed(() => [...new Set(allModelRows.value.map((row) => row.platform))].sort())
const selectedGroupInfo = computed(() => groups.value.find((item) => String(item.id) === selectedGroup.value) ?? null)
const selectedHappyHourEvents = computed(() => {
  const group = selectedGroupInfo.value
  if (!group) return []
  if (group.happy_hour_events?.length) return group.happy_hour_events.filter((event) => event.enabled)
  return group.peak_rate_enabled ? [{ name: 'Happy Hour', enabled: true, start: group.peak_start, end: group.peak_end, rate_multiplier: group.peak_rate_multiplier }] : []
})
const activeHappyHour = computed(() => selectedGroupInfo.value?.active_happy_hour)
const happyHourFactor = computed(() => activeHappyHour.value?.rate_multiplier ?? 1)
const selectedMultiplier = computed(() => {
  if (selectedGroup.value === 'all') return 1
  const group = groups.value.find((item) => String(item.id) === selectedGroup.value)
  return group ? effectiveGroupRate(group.id, group.rateMultiplier) * happyHourFactor.value : 1
})
const happyHourTimezone = computed(() => {
  const timezone = serverTimezoneLabel(appStore.cachedPublicSettings?.server_utc_offset)
  return timezone || t('availableChannels.happyHour.serverTime')
})
const happyHourQuotaWindows = computed(() => {
  const group = selectedGroupInfo.value
  return [
    makeHappyHourQuotaWindow('5h', t('availableChannels.happyHour.quota5h'), group?.five_hour_quota_remaining, group?.five_hour_quota_total),
    makeHappyHourQuotaWindow('7d', t('availableChannels.happyHour.quota7d'), group?.seven_day_quota_remaining, group?.seven_day_quota_total),
  ]
})
function makeHappyHourQuotaWindow(key: string, label: string, remaining = 0, total = 0) {
  const metered = total > 0
  const percent = metered ? Math.max(0, Math.min(100, remaining / total * 100)) : 0
  return {
    key,
    label,
    metered,
    percent,
    summary: metered
      ? t('availableChannels.happyHour.quotaSummary', {
        percent: percent.toLocaleString(undefined, { maximumFractionDigits: 1 }),
        remaining: remaining.toLocaleString(undefined, { maximumFractionDigits: 1 }),
        total: total.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      })
      : t('availableChannels.happyHour.unmetered'),
  }
}
const adjustmentLabel = computed(() => {
  const rate = selectedMultiplier.value
  if (rate === 1) return t('availableChannels.standardPrice')
  const percent = Math.abs((1 - rate) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })
  return rate < 1
    ? t('availableChannels.discount', { percent })
    : t('availableChannels.surcharge', { percent })
})
const adjustmentClass = computed(() => ({
  'price-adjustment--discount': selectedMultiplier.value < 1,
  'price-adjustment--surcharge': selectedMultiplier.value > 1,
}))
const filteredRows = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return allModelRows.value.filter((row) => {
    if (selectedGroup.value !== 'all' && !row.groups.some((group) => String(group.id) === selectedGroup.value)) return false
    if (selectedPlatform.value !== 'all' && row.platform !== selectedPlatform.value) return false
    if (!query) return true
    return row.name.toLowerCase().includes(query)
      || row.platform.toLowerCase().includes(query)
      || row.channels.some((channel) => channel.toLowerCase().includes(query))
  })
})

function formatPrice(value: number | null | undefined, scale = 1, multiplier = selectedMultiplier.value) {
  if (value == null) return '-'
  return formatCurrency(value * scale * multiplier)
}
function tokenPrice(value: number | null | undefined, multiplier = selectedMultiplier.value) {
  return value == null ? '-' : `${formatPrice(value, 1_000_000, multiplier)} / 1M`
}
function requestPrice(pricing: UserSupportedModelPricing | null, multiplier = selectedMultiplier.value) {
  if (!pricing) return '-'
  if (pricing.billing_mode === BILLING_MODE_PER_REQUEST) {
    return pricing.per_request_price == null ? '-' : `${formatPrice(pricing.per_request_price, 1, multiplier)} / req`
  }
  if (pricing.billing_mode === BILLING_MODE_IMAGE) {
    const price = pricing.image_output_price ?? pricing.per_request_price
    return price == null ? '-' : `${formatPrice(price, 1, multiplier)} / img`
  }
  return '-'
}
function effectiveGroupRate(groupId: number, fallback: number) {
  return userGroupRates.value[groupId] ?? fallback
}
function displayedGroupRate(group: UserAvailableGroup & { rateMultiplier: number }) {
  const factor = group.active_happy_hour?.rate_multiplier ?? 1
  return effectiveGroupRate(group.id, group.rateMultiplier) * factor
}

async function loadChannels() {
  loading.value = true
  try {
    const [list, rates] = await Promise.all([
      userChannelsAPI.getAvailable(),
      userGroupsAPI.getUserGroupRates().catch(() => ({} as Record<number, number>)),
    ])
    channels.value = list
    userGroupRates.value = rates
  } catch (error: unknown) {
    appStore.showError(extractApiErrorMessage(error, t('common.error')))
  } finally {
    loading.value = false
  }
}

onMounted(loadChannels)
</script>

<style scoped>
.pricing-page { animation: page-in .45s ease both; }
.pricing-page__header { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin: 6px 0 24px; }
.pricing-page__eyebrow { margin: 0 0 8px !important; color: #276b53 !important; font-size: 11px !important; font-weight: 800; text-transform: uppercase; }
.pricing-page__header h1 { margin: 0; color: #26241d; font-size: 30px; font-weight: 760; letter-spacing: 0; }
.pricing-page__header p { max-width: 650px; margin: 7px 0 0; color: #766f5d; font-size: 14px; line-height: 1.6; }
.pricing-page__refresh { display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; border: 1px solid rgba(57,48,28,.12); border-radius: 10px; background: rgba(255,255,255,.58); color: #454238; font-size: 12px; font-weight: 650; box-shadow: 0 5px 18px rgba(67,55,26,.05); transition: transform .18s ease, background .18s ease; }
.pricing-page__refresh:hover { transform: translateY(-1px); background: rgba(255,255,255,.85); }
.pricing-catalog { border: 1px solid rgba(57,48,28,.11); border-radius: 12px; background: rgba(255,253,244,.72); box-shadow: 0 16px 45px rgba(67,55,26,.08); backdrop-filter: blur(18px); overflow: hidden; }
.pricing-catalog__tabs-wrap { padding: 15px 18px 0; border-bottom: 1px solid rgba(57,48,28,.09); overflow-x: auto; }
.pricing-filter-label { display: block; margin-bottom: 7px; color: #79715e; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.pricing-catalog__tabs { display: flex; gap: 6px; min-width: max-content; }
.pricing-tab { position: relative; display: flex; align-items: center; gap: 8px; padding: 10px 13px 12px; border: 0; background: transparent; color: #77705f; font-size: 13px; font-weight: 650; cursor: pointer; }
.pricing-tab::after { content: ''; position: absolute; right: 10px; bottom: -1px; left: 10px; height: 2px; border-radius: 2px; background: #276b53; transform: scaleX(0); transition: transform .2s ease; }
.pricing-tab--active { color: #205644; }
.pricing-tab--active::after { transform: scaleX(1); }
.pricing-tab span { min-width: 21px; padding: 3px 6px; border-radius: 6px; background: rgba(91,83,63,.08); color: #8c846e; font-size: 10px; }
.pricing-catalog__toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; padding: 16px 18px; }
.happy-hour { margin: 14px 18px 0; padding: 13px 15px; display: grid; grid-template-columns: minmax(180px,1fr) auto minmax(210px,.8fr); align-items:center; gap:18px; border:1px solid rgba(176,121,28,.2); border-radius:10px; background:rgba(255,247,215,.68); color:#66562f; }
.happy-hour--active { border-color:rgba(31,126,87,.24); background:rgba(230,247,237,.75); color:#275d48; box-shadow:0 8px 24px rgba(39,107,83,.07); }
.happy-hour__lead { min-width:0; display:grid; grid-template-columns:auto 1fr; align-items:center; gap:3px 9px; }
.happy-hour__lead>span:last-child { grid-column:2; color:#817553; font-size:10px; }
.happy-hour__lead strong { font-size:13px; }
.happy-hour__status { padding:4px 6px; border-radius:6px; background:rgba(141,102,31,.1); font-size:9px; font-weight:800; text-transform:uppercase; }
.happy-hour--active .happy-hour__status { background:rgba(31,126,87,.12); color:#176d4b; }
.happy-hour__rate { display:flex; flex-direction:column; align-items:flex-end; }
.happy-hour small { color:#8b8063; font-size:9px; font-weight:750; text-transform:uppercase; }
.happy-hour__rate strong { color:#9a4b1d; font-size:17px; }
.happy-hour--active .happy-hour__rate strong { color:#176d4b; }
.happy-hour__events { min-width:220px; display:grid; gap:5px; }.happy-hour__events>div { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:6px 8px; border-radius:7px; background:rgba(255,255,255,.48); }.happy-hour__events span { display:flex; flex-direction:column; min-width:0; }.happy-hour__events strong { overflow:hidden; font-size:10px; text-overflow:ellipsis; white-space:nowrap; }.happy-hour__events small { font-size:8px; }.happy-hour__events b { color:#9a4b1d; font-size:11px; }.happy-hour__events>div.live { background:rgba(224,245,233,.9); box-shadow:inset 0 0 0 1px rgba(31,126,87,.12); }.happy-hour__events>div.live b { color:#176d4b; }
.happy-hour__quotas { min-width:0; display:grid; gap:9px; }
.happy-hour__quota { min-width:0; display:grid; gap:6px; }
.happy-hour__quota>div { display:flex; align-items:baseline; justify-content:space-between; gap:10px; }
.happy-hour__quota strong { font-size:11px; white-space:nowrap; }
.happy-hour__quota>span { height:5px; overflow:hidden; border-radius:5px; background:rgba(89,75,43,.1); }
.happy-hour__quota i { display:block; height:100%; border-radius:inherit; background:#2b7b5d; transition:width .35s ease; }
.happy-hour__quota--unknown { display:flex; align-items:center; justify-content:space-between; }
.pricing-search { width: min(350px, 100%); display: flex; align-items: center; gap: 10px; padding: 11px 13px; border: 1px solid rgba(57,48,28,.11); border-radius: 10px; background: rgba(255,255,255,.62); color: #8c856f; transition: border .18s ease, box-shadow .18s ease; }
.pricing-search:focus-within { border-color: rgba(39,107,83,.38); box-shadow: 0 0 0 3px rgba(39,107,83,.09); }
.pricing-search input { width: 100%; border: 0; outline: 0; background: transparent; color: #302e26; font-size: 13px; }
.platform-filter-wrap { min-width: 0; }
.platform-filter-wrap .pricing-filter-label { margin-left: 3px; }
.platform-filter { display: flex; gap: 4px; padding: 3px; border-radius: 9px; background: rgba(86,76,52,.07); overflow-x: auto; }
.platform-filter button { padding: 8px 11px; border: 0; border-radius: 7px; background: transparent; color: #77705f; font-size: 11px; font-weight: 700; white-space: nowrap; cursor: pointer; transition: background .16s ease, color .16s ease; }
.platform-filter button.active { background: rgba(255,255,255,.85); color: #205644; box-shadow: 0 2px 7px rgba(32,86,68,.09); }
.pricing-table-wrap { width: 100%; overflow-x: auto; border-top: 1px solid rgba(57,48,28,.08); }
.pricing-table { width: 100%; min-width: 920px; border-collapse: collapse; table-layout: fixed; }
.pricing-table th { padding: 13px 16px; background: rgba(244,239,217,.72); color: #8a826d; font-size: 10px; font-weight: 800; text-align: left; text-transform: uppercase; }
.pricing-table th:nth-child(1) { width: 25%; }.pricing-table th:nth-child(6) { width: 15%; }
.pricing-table td { padding: 17px 16px; border-top: 1px solid rgba(57,48,28,.075); color: #49453a; font-size: 12px; vertical-align: middle; }
.pricing-table tbody tr { transition: background .17s ease; }
.pricing-table tbody tr:hover { background: rgba(255,255,255,.52); }
.model-cell { display: flex; align-items: center; gap: 12px; min-width: 0; }
.model-cell__icon { width: 40px; height: 40px; flex: 0 0 auto; display: grid; place-items: center; border: 1px solid rgba(57,48,28,.09); border-radius: 10px; background: rgba(255,255,255,.7); }
.model-cell div { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.model-cell strong { overflow: hidden; color: #28261f; font-size: 13px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.model-cell span { overflow: hidden; color: #928a74; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.price-cell { color: #353229 !important; font-variant-numeric: tabular-nums; font-weight: 650; white-space: nowrap; }
.price-stack { display: flex; min-height: 42px; flex-direction: column; justify-content: center; gap: 4px; }
.price-stack strong { color: #9a4316; font-size: 13px; font-weight: 760; }
.price-stack span { color: #9a927f; font-size: 9px; font-weight: 550; }
.price-stack s { text-decoration-thickness: 1px; }
.price-adjustment { display: inline-flex; align-items: center; min-height: 28px; padding: 6px 9px; border: 1px solid rgba(57,48,28,.09); border-radius: 8px; background: rgba(255,255,255,.5); color: #756e5d; font-size: 10px; font-weight: 750; white-space: nowrap; }
.price-adjustment--discount { border-color: rgba(24,128,86,.13); background: rgba(38,154,103,.08); color: #187b55; }
.price-adjustment--surcharge { border-color: rgba(178,92,39,.15); background: rgba(189,101,45,.08); color: #9a4b1d; }
.pricing-empty { height: 250px; text-align: center; color: #9a927c !important; }
.pricing-empty :deep(svg) { display: block; margin: 0 auto 10px; }.pricing-empty strong, .pricing-empty span { display: block; }.pricing-empty strong { color: #5c5749; font-size: 13px; }.pricing-empty span { margin-top: 4px; font-size: 10px; }
.pricing-skeleton-row td span { display: block; height: 40px; border-radius: 8px; background: rgba(100,91,67,.08); animation: pulse-soft 1.4s ease-in-out infinite; }
.pricing-catalog__footer { display: flex; justify-content: space-between; gap: 20px; padding: 11px 16px; border-top: 1px solid rgba(57,48,28,.08); color: #938b76; font-size: 9px; }
.dark .pricing-page__header h1, .dark .model-cell strong, .dark .price-cell { color: #eeeadd !important; }
.dark .pricing-page__header p { color: #aaa591; }.dark .pricing-page__eyebrow { color: #8bc3a7 !important; }
.dark .pricing-catalog { border-color: rgba(255,255,255,.09); background: rgba(30,32,28,.72); }
.dark .pricing-search, .dark .model-cell__icon { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.09); }.dark .pricing-search input { color: #eeeadd; }
.dark .pricing-table th { background: rgba(255,255,255,.035); }.dark .pricing-table td { border-color: rgba(255,255,255,.06); color: #cbc6b6; }
@keyframes page-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes pulse-soft { 50% { opacity: .45; } }
@media (max-width: 800px) {
  .pricing-page__header { align-items: flex-start; }.pricing-page__header h1 { font-size: 25px; }.pricing-page__refresh span { display: none; }
  .pricing-catalog__toolbar { align-items: stretch; flex-direction: column; }.pricing-search, .platform-filter-wrap, .platform-filter { width: 100%; }
  .pricing-catalog__footer { flex-direction: column; gap: 3px; }
  .happy-hour { grid-template-columns:1fr auto; }
  .happy-hour__events,.happy-hour__quota { grid-column:1 / -1; }
}
@media (max-width: 480px) { .pricing-page__header { margin-top: 0; } }
@media (prefers-reduced-motion: reduce) { .pricing-page { animation: none; } }
</style>

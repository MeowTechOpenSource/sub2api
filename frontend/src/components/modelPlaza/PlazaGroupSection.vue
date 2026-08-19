<template>
  <section class="plaza-group" :class="{ 'plaza-group--live': isHappyHourActive }">
    <header class="plaza-group__header">
      <div class="plaza-group__identity">
        <div class="plaza-group__icon">
          <PlatformIcon :platform="group.platform as GroupPlatform" size="sm" />
        </div>
        <div>
          <div class="plaza-group__title">
            <h2>{{ group.name }}</h2>
            <span v-if="group.is_exclusive" class="status-tag status-tag--exclusive">
              <Icon name="shield" size="xs" />{{ t('modelPlaza.badges.exclusive') }}
            </span>
            <span v-if="group.subscription_type === 'subscription'" class="status-tag">
              {{ t('modelPlaza.badges.subscription') }}
            </span>
          </div>
          <p>{{ group.description || t('modelPlaza.detail.modelCount', { count: group.models.length }) }}</p>
        </div>
      </div>

      <div class="plaza-group__rate">
        <span>{{ t('modelPlaza.detail.yourRate') }}</span>
        <div>
          <s v-if="hasAdjustedRate">{{ baseEffectiveRate }}x</s>
          <strong>{{ finalEffectiveRate }}x</strong>
        </div>
      </div>
    </header>

    <div v-if="enabledEvents.length" class="happy-hour" :class="{ 'happy-hour--live': isHappyHourActive }">
      <div class="happy-hour__lead">
        <span class="happy-hour__status">{{ isHappyHourActive ? t('modelPlaza.happyHour.active') : t('modelPlaza.happyHour.scheduled') }}</span>
        <div>
          <strong>{{ t('modelPlaza.happyHour.title') }}</strong>
          <small>{{ timezoneLabel }}</small>
        </div>
      </div>
      <div class="happy-hour__events">
        <div v-for="(event, index) in enabledEvents" :key="`${event.name}-${event.start}-${index}`" :class="{ live: isActiveEvent(event) }">
          <span><strong>{{ event.name || t('modelPlaza.happyHour.title') }}</strong><small>{{ event.start }} - {{ event.end }}</small></span>
          <b>{{ event.rate_multiplier === 0 ? t('modelPlaza.happyHour.free') : `${event.rate_multiplier}x` }}</b>
        </div>
      </div>
      <div v-if="quotaWindows.length" class="happy-hour__quotas">
        <div v-for="window in quotaWindows" :key="window.key" class="happy-hour__quota">
          <div><span>{{ window.label }}</span><strong>{{ window.summary }}</strong></div>
          <span><i :style="{ width: `${window.percent}%` }"></i></span>
        </div>
      </div>
    </div>
    <div v-else-if="peakNote" class="peak-note">
      <Icon name="clock" size="xs" />{{ peakNote }}
    </div>

    <PlazaModelPricingTable
      v-if="group.models.length"
      :models="group.models"
      :platform="group.platform"
      :rate-multiplier="group.rate_multiplier"
      :user-rate-multiplier="group.user_rate_multiplier ?? null"
      :event-rate-multiplier="activeEventRate"
    />
    <p v-else class="plaza-group__empty">{{ t('modelPlaza.detail.noModels') }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import PlatformIcon from '@/components/common/PlatformIcon.vue'
import PlazaModelPricingTable from './PlazaModelPricingTable.vue'
import type { ModelPlazaGroup } from '@/api/modelPlaza'
import type { GroupPlatform, HappyHourEvent } from '@/types'
import { hasPeakRate, formatPeakRateWindow, serverTimezoneLabel } from '@/utils/peak-rate'
import { useAppStore } from '@/stores/app'

const props = defineProps<{ group: ModelPlazaGroup }>()
const { t } = useI18n()
const appStore = useAppStore()
const baseEffectiveRate = computed(() => props.group.user_rate_multiplier ?? props.group.rate_multiplier)
const activeEventRate = computed(() => props.group.active_happy_hour?.rate_multiplier ??
  (props.group.peak_rate_active ? props.group.peak_rate_multiplier : 1))
const finalEffectiveRate = computed(() => trimRate(baseEffectiveRate.value * activeEventRate.value))
const hasAdjustedRate = computed(() => activeEventRate.value !== 1 ||
  (props.group.user_rate_multiplier != null && props.group.user_rate_multiplier !== props.group.rate_multiplier))
const enabledEvents = computed(() => (props.group.happy_hour_events ?? []).filter((event) => event.enabled))
const isHappyHourActive = computed(() => Boolean(props.group.active_happy_hour || props.group.peak_rate_active))
const timezoneLabel = computed(() => serverTimezoneLabel(appStore.cachedPublicSettings?.server_utc_offset) || t('modelPlaza.happyHour.serverTime'))
const quotaWindows = computed(() => [
  makeQuotaWindow('5h', t('modelPlaza.happyHour.quota5h'), props.group.five_hour_quota_remaining, props.group.five_hour_quota_total),
  makeQuotaWindow('7d', t('modelPlaza.happyHour.quota7d'), props.group.seven_day_quota_remaining, props.group.seven_day_quota_total),
].filter((window): window is NonNullable<typeof window> => window !== null))

const peakNote = computed(() => {
  if (!hasPeakRate(props.group)) return ''
  const window = formatPeakRateWindow(props.group, timezoneLabel.value)
  return t('modelPlaza.detail.peakNote', { window, multiplier: props.group.peak_rate_multiplier })
})

function isActiveEvent(event: HappyHourEvent): boolean {
  const active = props.group.active_happy_hour
  return Boolean(active && active.name === event.name && active.start === event.start && active.end === event.end)
}
function makeQuotaWindow(key: string, label: string, remaining = 0, total = 0) {
  if (total <= 0) return null
  return {
    key,
    label,
    percent: Math.max(0, Math.min(100, remaining / total * 100)),
    summary: `${remaining.toLocaleString(undefined, { maximumFractionDigits: 1 })} / ${total.toLocaleString()}`,
  }
}
function trimRate(value: number): string { return String(Math.round(value * 10000) / 10000) }
</script>

<style scoped>
.plaza-group { position: relative; overflow: hidden; border: 1px solid rgba(57,48,28,.11); border-radius: 12px; background: rgba(255,253,244,.72); box-shadow: 0 15px 40px rgba(67,55,26,.07); backdrop-filter: blur(18px); transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease; }
.plaza-group:hover { transform: translateY(-2px); border-color: rgba(39,107,83,.2); box-shadow: 0 20px 48px rgba(67,55,26,.1); }
.plaza-group--live { border-color: rgba(39,107,83,.25); }
.plaza-group__header { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px 20px; border-bottom: 1px solid rgba(57,48,28,.08); }
.plaza-group__identity { display: flex; min-width: 0; align-items: center; gap: 13px; }
.plaza-group__icon { display: grid; width: 42px; height: 42px; flex: 0 0 auto; place-items: center; border: 1px solid rgba(57,48,28,.09); border-radius: 10px; background: rgba(255,255,255,.7); box-shadow: 0 7px 16px rgba(67,55,26,.06); }
.plaza-group__title { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }
.plaza-group h2 { margin: 0; color: #29271f; font-size: 17px; font-weight: 750; letter-spacing: 0; }
.plaza-group__identity p { margin: 4px 0 0; color: #857d68; font-size: 11px; line-height: 1.5; }
.status-tag { display: inline-flex; align-items: center; gap: 4px; min-height: 22px; padding: 0 7px; border-radius: 6px; background: rgba(84,103,90,.09); color: #53675a; font-size: 9px; font-weight: 800; text-transform: uppercase; }
.status-tag--exclusive { background: rgba(157,104,29,.1); color: #8b5c1d; }
.plaza-group__rate { flex: 0 0 auto; text-align: right; }.plaza-group__rate>span { display: block; color: #908874; font-size: 9px; font-weight: 800; text-transform: uppercase; }.plaza-group__rate div { display: flex; align-items: baseline; justify-content: flex-end; gap: 7px; }.plaza-group__rate s { color: #9e9785; font-size: 11px; }.plaza-group__rate strong { color: #276b53; font-size: 20px; font-weight: 780; }
.happy-hour { display: grid; grid-template-columns: minmax(150px,.65fr) minmax(280px,1.5fr) minmax(220px,.9fr); align-items: center; gap: 15px; padding: 11px 20px; border-bottom: 1px solid rgba(176,121,28,.13); background: rgba(255,247,215,.55); }
.happy-hour--live { background: rgba(230,247,237,.66); border-color: rgba(39,107,83,.14); }
.happy-hour__lead { display: flex; align-items: center; gap: 9px; }.happy-hour__lead>div { display: grid; }.happy-hour__lead strong { color: #66562f; font-size: 12px; }.happy-hour__lead small { color: #8a8063; font-size: 9px; }.happy-hour__status { padding: 4px 6px; border-radius: 5px; background: rgba(141,102,31,.1); color: #8a611f; font-size: 8px; font-weight: 850; text-transform: uppercase; }.happy-hour--live .happy-hour__status { background: rgba(31,126,87,.12); color: #176d4b; }
.happy-hour__events { display: flex; min-width: 0; gap: 6px; overflow-x: auto; }.happy-hour__events>div { display: flex; min-width: 145px; align-items: center; justify-content: space-between; gap: 10px; padding: 6px 8px; border-radius: 7px; background: rgba(255,255,255,.5); }.happy-hour__events span { display: grid; min-width: 0; }.happy-hour__events strong { overflow: hidden; color: #625a47; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }.happy-hour__events small { color: #93896d; font-size: 8px; }.happy-hour__events b { color: #98541f; font-size: 11px; }.happy-hour__events .live { box-shadow: inset 0 0 0 1px rgba(31,126,87,.16); }.happy-hour__events .live b { color: #176d4b; }
.happy-hour__quotas { display: grid; gap: 9px; }.happy-hour__quota { display: grid; gap: 5px; }.happy-hour__quota>div { display: flex; justify-content: space-between; gap: 8px; color: #756b54; font-size: 9px; }.happy-hour__quota strong { font-size: 10px; }.happy-hour__quota>span { height: 5px; overflow: hidden; border-radius: 4px; background: rgba(89,75,43,.1); }.happy-hour__quota i { display: block; height: 100%; border-radius: inherit; background: #2b765b; transition: width .35s ease; }
.peak-note { display: flex; align-items: center; gap: 6px; padding: 8px 20px; border-bottom: 1px solid rgba(57,48,28,.07); color: #916525; font-size: 10px; }
.plaza-group__empty { margin: 0; padding: 28px; text-align: center; color: #908874; font-size: 12px; }
.dark .plaza-group { border-color: rgba(255,255,255,.09); background: rgba(30,32,27,.75); }.dark .plaza-group h2 { color: #f2eee3; }.dark .plaza-group__icon { background: rgba(255,255,255,.06); }.dark .happy-hour { background: rgba(106,83,33,.13); }.dark .happy-hour--live { background: rgba(39,107,83,.13); }
@media (max-width: 850px) { .happy-hour { grid-template-columns: 1fr; }.happy-hour__events { width: 100%; } }
@media (max-width: 560px) { .plaza-group:hover { transform: none; }.plaza-group__header { align-items: flex-start; padding: 15px; }.plaza-group__icon { width: 38px; height: 38px; }.plaza-group__rate>span { display: none; }.plaza-group__rate strong { font-size: 17px; }.happy-hour,.peak-note { padding-right: 15px; padding-left: 15px; } }
@media (prefers-reduced-motion: reduce) { .plaza-group,.happy-hour__quota i { transition: none; } }
</style>

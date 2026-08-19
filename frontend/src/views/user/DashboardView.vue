<template>
  <AppLayout>
    <div class="dashboard-page space-y-6">
      <div class="dashboard-page__heading">
        <div>
          <p>{{ $t('dashboard.welcomeMessage') }}</p>
          <h1>{{ $t('dashboard.title') }}</h1>
        </div>
        <button class="btn btn-secondary" :disabled="loading || loadingCharts" @click="refreshAll">
          <Icon name="refresh" size="sm" :class="{ 'animate-spin': loading || loadingCharts }" />
          {{ $t('common.refresh') }}
        </button>
      </div>
      <div v-if="loading" class="flex items-center justify-center py-12"><LoadingSpinner /></div>
      <template v-else-if="stats">
        <UserDashboardStats :stats="stats" :balance="user?.balance || 0" :is-simple="authStore.isSimpleMode" :platform-quotas="platformQuotas" @balance-click="showBalanceDetails = true" />
        <section v-if="expiringCredits.length" class="balance-expiry-notice" role="status">
          <Icon name="clock" size="sm" />
          <div>
            <strong>{{ $t('dashboard.expiringBalanceTitle') }}</strong>
            <p v-for="credit in expiringCredits" :key="`${credit.expires_at}-${credit.remaining_amount}`">{{ $t('dashboard.expiringBalanceItem', { amount: formatCredit(credit.remaining_amount), time: formatCreditExpiry(credit.expires_at) }) }}</p>
          </div>
        </section>
        <section v-if="happyHourGroups.length" class="happy-hour-board" aria-labelledby="dashboard-happy-hour-title">
          <div class="happy-hour-board__heading">
            <div>
              <span>{{ $t('dashboard.happyHourEyebrow') }}</span>
              <h2 id="dashboard-happy-hour-title">{{ $t('dashboard.happyHourTitle') }}</h2>
            </div>
            <RouterLink to="/pricing">{{ $t('dashboard.happyHourPricing') }}</RouterLink>
          </div>
          <div class="happy-hour-board__groups">
            <article v-for="group in happyHourGroups" :key="group.id" class="happy-hour-group">
              <header><strong>{{ group.name }}</strong><small>{{ group.platform }}</small></header>
              <div class="happy-hour-group__events">
                <div v-for="event in displayHappyHourEvents(group)" :key="`${group.id}-${event.name}-${event.start}`" class="happy-hour-event" :class="{ 'happy-hour-event--live': isActiveHappyHour(group, event) }">
                  <div><strong>{{ event.name }}</strong><span>{{ event.start }}-{{ event.end }}</span></div>
                  <div><span v-if="isActiveHappyHour(group, event)" class="happy-hour-event__live">{{ $t('dashboard.happyHourLive') }}</span><b>{{ event.rate_multiplier === 0 ? $t('dashboard.happyHourFree') : `${event.rate_multiplier}x` }}</b></div>
                </div>
              </div>
              <div v-if="happyHourQuotaWindows(group).length" class="happy-hour-group__quotas">
                <div v-for="window in happyHourQuotaWindows(group)" :key="window.key" class="happy-hour-group__quota">
                  <span><small>{{ window.label }}</small><strong>{{ window.summary }}</strong></span>
                  <i><b :style="{ width: `${window.percent}%` }" /></i>
                </div>
              </div>
            </article>
          </div>
        </section>
        <UserDashboardCharts v-model:startDate="startDate" v-model:endDate="endDate" v-model:granularity="granularity" :loading="loadingCharts" :trend="trendData" :models="modelStats" @dateRangeChange="loadCharts" @granularityChange="loadCharts" @refresh="refreshAll" />
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div class="lg:col-span-2"><UserDashboardRecentUsage :data="recentUsage" :loading="loadingUsage" /></div>
          <div class="lg:col-span-1"><UserDashboardQuickActions /></div>
        </div>
      </template>
    </div>
    <BaseDialog :show="showBalanceDetails" :title="$t('dashboard.balanceDetails')" width="narrow" @close="showBalanceDetails = false">
      <div class="balance-details">
        <div class="balance-details__total"><span>{{ $t('dashboard.availableBalance') }}</span><strong>{{ formatCredit(user?.balance || 0) }}</strong></div>
        <div v-if="expiringCredits.length" class="balance-details__section">
          <span>{{ $t('dashboard.expiringBalanceTitle') }}</span>
          <div v-for="credit in expiringCredits" :key="`${credit.expires_at}-${credit.remaining_amount}`" class="balance-details__credit"><strong>{{ formatCredit(credit.remaining_amount) }}</strong><small>{{ formatCreditExpiry(credit.expires_at) }}</small></div>
        </div>
        <p v-else class="balance-details__empty">{{ $t('dashboard.noExpiringBalance') }}</p>
      </div>
    </BaseDialog>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'; import { useAuthStore } from '@/stores/auth'; import { usageAPI, type UserDashboardStats as UserStatsType } from '@/api/usage'
import AppLayout from '@/components/layout/AppLayout.vue'; import LoadingSpinner from '@/components/common/LoadingSpinner.vue'; import BaseDialog from '@/components/common/BaseDialog.vue'; import Icon from '@/components/icons/Icon.vue'
import UserDashboardStats from '@/components/user/dashboard/UserDashboardStats.vue'; import UserDashboardCharts from '@/components/user/dashboard/UserDashboardCharts.vue'
import UserDashboardRecentUsage from '@/components/user/dashboard/UserDashboardRecentUsage.vue'; import UserDashboardQuickActions from '@/components/user/dashboard/UserDashboardQuickActions.vue'
import type { UsageLog, TrendDataPoint, ModelStat, PlatformQuotaItem, HappyHourEvent } from '@/types'
import { getBalanceExpiries, getMyPlatformQuotas, type ExpiringBalanceCredit } from '@/api/user'
import { getAvailable as getAvailableGroups } from '@/api/groups'
import { userChannelsAPI, type UserAvailableGroup } from '@/api/channels'
import { formatCurrency, formatDateLocalInput } from '@/utils/format'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore(); const user = computed(() => authStore.user)
const { t } = useI18n()
const stats = ref<UserStatsType | null>(null); const loading = ref(false); const loadingUsage = ref(false); const loadingCharts = ref(false)
const trendData = ref<TrendDataPoint[]>([]); const modelStats = ref<ModelStat[]>([]); const recentUsage = ref<UsageLog[]>([])
const platformQuotas = ref<PlatformQuotaItem[] | null>(null)
const expiringCredits = ref<ExpiringBalanceCredit[]>([])
const showBalanceDetails = ref(false)
interface DashboardHappyHourGroup {
  id: number
  name: string
  platform: string
  peak_rate_enabled: boolean
  peak_start: string
  peak_end: string
  peak_rate_multiplier: number
  peak_rate_active?: boolean
  happy_hour_active?: boolean
  happy_hour_events?: HappyHourEvent[]
  active_happy_hour?: HappyHourEvent
  five_hour_quota_remaining?: number
  five_hour_quota_total?: number
  seven_day_quota_remaining?: number
  seven_day_quota_total?: number
}
const availableGroups = ref<DashboardHappyHourGroup[]>([])
const happyHourGroups = computed(() => availableGroups.value.filter((group) => displayHappyHourEvents(group).some((event) => event.enabled)))

const startDate = ref(formatDateLocalInput(new Date(Date.now() - 6 * 86400000))); const endDate = ref(formatDateLocalInput(new Date())); const granularity = ref('day')

const loadStats = async () => { loading.value = true; try { await authStore.refreshUser(); stats.value = await usageAPI.getDashboardStats() } catch (error) { console.error('Failed to load dashboard stats:', error) } finally { loading.value = false } }
const loadCharts = async () => { loadingCharts.value = true; try { const res = await Promise.all([usageAPI.getDashboardTrend({ start_date: startDate.value, end_date: endDate.value, granularity: granularity.value as any }), usageAPI.getDashboardModels({ start_date: startDate.value, end_date: endDate.value })]); trendData.value = res[0].trend || []; modelStats.value = res[1].models || [] } catch (error) { console.error('Failed to load charts:', error) } finally { loadingCharts.value = false } }
const loadRecent = async () => { loadingUsage.value = true; try { const res = await usageAPI.getByDateRange(startDate.value, endDate.value); recentUsage.value = res.items.slice(0, 5) } catch (error) { console.error('Failed to load recent usage:', error) } finally { loadingUsage.value = false } }
const loadPlatformQuotas = async () => { try { const data = await getMyPlatformQuotas(); platformQuotas.value = data.platform_quotas ?? [] } catch (error) { console.warn('Failed to load platform quotas:', error); platformQuotas.value = [] } }
const loadBalanceExpiries = async () => { try { expiringCredits.value = (await getBalanceExpiries()).credits ?? [] } catch (error) { console.warn('Failed to load expiring balance credits:', error); expiringCredits.value = [] } }
const loadHappyHours = async () => {
  try {
    const channels = await userChannelsAPI.getAvailable()
    const groups = new Map<number, UserAvailableGroup>()
    channels.forEach((channel) => channel.platforms.forEach((section) => section.groups.forEach((group) => groups.set(group.id, group))))
    availableGroups.value = [...groups.values()]
  } catch (error) {
    console.warn('Failed to load Happy Hour capacity, falling back to group schedule:', error)
    try { availableGroups.value = await getAvailableGroups() } catch { availableGroups.value = [] }
  }
}
const displayHappyHourEvents = (group: DashboardHappyHourGroup): HappyHourEvent[] => group.happy_hour_events?.length ? group.happy_hour_events : group.peak_rate_enabled ? [{ name: 'Happy Hour', enabled: true, start: group.peak_start, end: group.peak_end, rate_multiplier: group.peak_rate_multiplier }] : []
const isActiveHappyHour = (group: DashboardHappyHourGroup, event: HappyHourEvent) => Boolean((group.happy_hour_active || group.peak_rate_active) && group.active_happy_hour?.name === event.name && group.active_happy_hour?.start === event.start)
const happyHourQuotaWindows = (group: DashboardHappyHourGroup) => [
  makeHappyHourQuotaWindow('5h', t('modelPlaza.happyHour.quota5h'), group.five_hour_quota_remaining, group.five_hour_quota_total),
  makeHappyHourQuotaWindow('7d', t('modelPlaza.happyHour.quota7d'), group.seven_day_quota_remaining, group.seven_day_quota_total),
].filter((window): window is NonNullable<typeof window> => window !== null)
const makeHappyHourQuotaWindow = (key: string, label: string, remaining = 0, total = 0) => total > 0 ? {
  key,
  label,
  percent: Math.max(0, Math.min(100, remaining / total * 100)),
  summary: `${remaining.toLocaleString(undefined, { maximumFractionDigits: 1 })} / ${total.toLocaleString()}`,
} : null
const formatCredit = (value: number) => formatCurrency(value)
const formatCreditExpiry = (value: string) => new Date(value).toLocaleString()
const refreshAll = () => { loadStats(); loadCharts(); loadRecent(); loadPlatformQuotas(); loadBalanceExpiries(); loadHappyHours() }

onMounted(() => { refreshAll() })
</script>

<style scoped>
.dashboard-page__heading { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:2px; }
.dashboard-page__heading p { margin:0 0 5px; color:#7b8497; font-size:11px; }
.dashboard-page__heading h1 { margin:0; color:var(--ink); font-size:27px; font-weight:750; }
.balance-expiry-notice { display:flex; align-items:flex-start; gap:10px; padding:12px 14px; border:1px solid rgba(190,138,44,.24); border-radius:10px; background:rgba(255,248,218,.72); color:#765719; }
.balance-expiry-notice > div { min-width:0; }.balance-expiry-notice strong { display:block; font-size:12px; }.balance-expiry-notice p { margin:3px 0 0; font-size:11px; line-height:1.5; }
.happy-hour-board { overflow:hidden; border:1px solid rgba(177,125,31,.2); border-radius:12px; background:rgba(255,249,222,.72); box-shadow:0 14px 36px rgba(78,61,25,.07); }
.happy-hour-board__heading { display:flex; align-items:end; justify-content:space-between; gap:16px; padding:16px 18px; border-bottom:1px solid rgba(177,125,31,.14); }.happy-hour-board__heading span { color:#9b7127; font-size:9px; font-weight:800; text-transform:uppercase; }.happy-hour-board__heading h2 { margin:2px 0 0; color:#3f3728; font-size:17px; font-weight:760; }.happy-hour-board__heading a { color:#276b55; font-size:11px; font-weight:750; }
.happy-hour-board__groups { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); }.happy-hour-group { min-width:0; padding:14px 18px 17px; border-right:1px solid rgba(177,125,31,.12); }.happy-hour-group header { display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:9px; }.happy-hour-group header strong { color:#39352d; font-size:12px; }.happy-hour-group header small { color:#94886d; font-size:9px; text-transform:uppercase; }.happy-hour-group__events { display:grid; gap:6px; }
.happy-hour-event { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:8px 9px; border-radius:8px; background:rgba(255,255,255,.52); }.happy-hour-event>div { display:flex; align-items:center; gap:7px; min-width:0; }.happy-hour-event strong { overflow:hidden; color:#5f5747; font-size:11px; text-overflow:ellipsis; white-space:nowrap; }.happy-hour-event span { color:#91866e; font-size:9px; white-space:nowrap; }.happy-hour-event b { color:#965020; font-size:12px; }.happy-hour-event--live { background:rgba(225,245,234,.82); box-shadow:inset 0 0 0 1px rgba(36,125,87,.12); }.happy-hour-event--live b { color:#176d4b; }.happy-hour-event .happy-hour-event__live { padding:3px 5px; border-radius:5px; background:rgba(29,124,84,.1); color:#176d4b; font-size:8px; font-weight:800; text-transform:uppercase; }
.happy-hour-group__quotas { display:grid; gap:8px; margin-top:10px; padding-top:10px; border-top:1px solid rgba(177,125,31,.12); }.happy-hour-group__quota { display:grid; gap:4px; }.happy-hour-group__quota>span { display:flex; align-items:baseline; justify-content:space-between; gap:8px; }.happy-hour-group__quota small { color:#8d826b; font-size:9px; }.happy-hour-group__quota strong { color:#615a4b; font-size:10px; font-variant-numeric:tabular-nums; }.happy-hour-group__quota>i { display:block; height:4px; overflow:hidden; border-radius:4px; background:rgba(89,75,43,.1); }.happy-hour-group__quota>i b { display:block; height:100%; border-radius:inherit; background:#2b765b; transition:width .35s ease; }
 .dark .balance-expiry-notice { border-color:rgba(224,177,77,.25); background:rgba(92,70,22,.26); color:#e8cf91; }
.balance-details { display:grid; gap:18px; }.balance-details__total { display:flex; align-items:end; justify-content:space-between; padding:14px; border-radius:10px; background:rgba(240,247,243,.8); color:#57594f; }.balance-details__total span,.balance-details__section>span { font-size:11px; font-weight:700; }.balance-details__total strong { color:#1f6049; font-size:23px; }.balance-details__section { display:grid; gap:8px; }.balance-details__credit { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 2px; border-bottom:1px solid rgba(52,49,39,.08); }.balance-details__credit strong { color:#3a3b32; font-size:13px; }.balance-details__credit small { color:#888378; font-size:11px; text-align:right; }.balance-details__empty { margin:0; color:#8c877a; font-size:12px; }.dark .balance-details__total { background:rgba(51,86,69,.25); }.dark .balance-details__total strong { color:#95c4a7; }.dark .balance-details__credit { border-color:rgba(255,255,255,.08); }.dark .balance-details__credit strong { color:#e0ddd1; }
@media (max-width:640px) { .dashboard-page__heading { align-items:flex-start }.dashboard-page__heading .btn { padding-inline:12px } }
.dark .happy-hour-board { border-color:rgba(224,177,77,.2); background:rgba(92,70,22,.2); }.dark .happy-hour-board__heading h2,.dark .happy-hour-group header strong { color:#eee7d5; }.dark .happy-hour-event { background:rgba(255,255,255,.05); }.dark .happy-hour-event strong { color:#ddd5c2; }
</style>

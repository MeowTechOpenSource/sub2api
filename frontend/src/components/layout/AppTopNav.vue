<template>
  <header class="top-nav">
    <div class="top-nav__inner">
      <router-link :to="homePath" class="top-nav__brand" @click="closeMenus">
        <span class="top-nav__logo">
          <img v-if="settingsLoaded" :src="siteLogo || '/logo.png'" alt="" />
        </span>
        <span class="top-nav__name">{{ siteName }}</span>
      </router-link>

      <nav class="top-nav__desktop" :aria-label="t('common.accessibility.primaryNavigation')">
        <template v-for="item in navigation" :key="item.label">
          <router-link
            v-if="item.path"
            :to="item.path"
            class="top-nav__link"
            :class="{ 'top-nav__link--active': isItemActive(item) }"
          >
            {{ item.label }}
          </router-link>
          <div v-else class="top-nav__group">
            <button
              class="top-nav__link"
              :class="{ 'top-nav__link--active': isItemActive(item) }"
              :aria-expanded="openDropdown === item.label"
              @click.stop="toggleDropdown(item.label)"
            >
              {{ item.label }}
              <Icon name="chevronDown" size="xs" :class="{ 'rotate-180': openDropdown === item.label }" />
            </button>
            <Transition name="nav-popover">
              <div v-if="openDropdown === item.label" class="top-nav__dropdown">
                <router-link
                  v-for="child in item.children"
                  :key="child.path"
                  :to="child.path!"
                  class="top-nav__dropdown-link"
                  :class="{ 'top-nav__dropdown-link--active': isPathActive(child.path!) }"
                  @click="closeMenus"
                >
                  <Icon :name="child.icon || 'arrowRight'" size="sm" />
                  <span>{{ child.label }}</span>
                </router-link>
              </div>
            </Transition>
          </div>
        </template>
      </nav>

      <div class="top-nav__actions">
        <AnnouncementBell v-if="user" class="hidden sm:block" />
        <LocaleSwitcher class="hidden sm:block" />
        <div v-if="user" class="top-nav__balance" :title="fullBalanceText">
          <span>{{ t('common.balance') }}</span>
          <strong>{{ headerBalanceText }}</strong>
        </div>
        <div v-if="user" class="top-nav__profile-wrap">
          <button class="top-nav__profile" :aria-label="t('common.accessibility.userMenu')" @click.stop="toggleDropdown('profile')">
            <span class="top-nav__avatar">
              <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" />
              <span v-else>{{ initials }}</span>
            </span>
            <Icon name="chevronDown" size="xs" class="hidden sm:block" />
          </button>
          <Transition name="nav-popover">
            <div v-if="openDropdown === 'profile'" class="top-nav__dropdown top-nav__dropdown--profile">
              <div class="top-nav__user-meta">
                <strong>{{ displayName }}</strong>
                <span>{{ user.email }}</span>
              </div>
              <router-link to="/profile" class="top-nav__dropdown-link" @click="closeMenus">
                <Icon name="user" size="sm" />{{ t('nav.profile') }}
              </router-link>
              <button class="top-nav__dropdown-link top-nav__logout" @click="handleLogout">
                <Icon name="login" size="sm" />{{ t('nav.logout') }}
              </button>
            </div>
          </Transition>
        </div>
        <button
          class="top-nav__hamburger"
          :aria-expanded="mobileOpen"
          :aria-label="t('common.accessibility.toggleNavigation')"
          @click.stop="mobileOpen = !mobileOpen"
        >
          <Icon :name="mobileOpen ? 'x' : 'menu'" size="md" />
        </button>
      </div>
    </div>

    <Transition name="mobile-nav">
      <div v-if="mobileOpen" class="top-nav__mobile">
        <div class="top-nav__mobile-tools sm:hidden">
          <LocaleSwitcher />
          <AnnouncementBell v-if="user" />
        </div>
        <div v-for="item in navigation" :key="`mobile-${item.label}`" class="top-nav__mobile-section">
          <router-link v-if="item.path" :to="item.path" class="top-nav__mobile-link" @click="closeMenus">
            {{ item.label }}
          </router-link>
          <template v-else>
            <p class="top-nav__mobile-label">{{ item.label }}</p>
            <router-link
              v-for="child in item.children"
              :key="child.path"
              :to="child.path!"
              class="top-nav__mobile-link top-nav__mobile-link--child"
              @click="closeMenus"
            >
              <Icon :name="child.icon || 'arrowRight'" size="sm" />
              {{ child.label }}
            </router-link>
          </template>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore, useAuthStore } from '@/stores'
import { FeatureFlags, isFeatureFlagEnabled } from '@/utils/featureFlags'
import { sanitizeUrl } from '@/utils/url'
import AnnouncementBell from '@/components/common/AnnouncementBell.vue'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import { formatCompactCurrency, formatCurrency } from '@/utils/format'

type IconName = InstanceType<typeof Icon>['$props']['name']
interface NavItem { label: string; path?: string; icon?: IconName; children?: NavItem[] }

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const openDropdown = ref('')
const mobileOpen = ref(false)

const user = computed(() => authStore.user)
const siteName = computed(() => appStore.siteName)
const settingsLoaded = computed(() => appStore.publicSettingsLoaded)
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const homePath = computed(() => authStore.isAdmin ? '/admin/dashboard' : '/dashboard')
const avatarUrl = computed(() => user.value?.avatar_url?.trim() || '')
const displayName = computed(() => user.value?.username || user.value?.email?.split('@')[0] || '')
const initials = computed(() => displayName.value.slice(0, 2).toUpperCase())
const isAdminScreen = computed(() => route.path === '/admin' || route.path.startsWith('/admin/'))
const balance = computed(() => Number(user.value?.balance || 0))
const fullBalanceText = computed(() => formatMoney(balance.value))
const headerBalanceText = computed(() => {
  if (Math.abs(balance.value) < 1_000_000) return fullBalanceText.value
  return isAdminScreen.value ? `$${formatCompactNumber(balance.value)}` : formatCompactCurrency(balance.value)
})

const navigation = computed<NavItem[]>(() => {
  const workspace: NavItem[] = [
    { label: t('nav.chat'), path: '/chat', icon: 'chat' },
    { label: t('nav.apiKeys'), path: '/keys', icon: 'key' },
    { label: t('nav.usage'), path: '/usage', icon: 'chartBar' },
    { label: t('nav.batchImage'), path: '/batch-image', icon: 'grid' },
  ]

  const models: NavItem[] = [
    { label: t('nav.availableChannels'), path: '/model-plaza', icon: 'dollar' },
  ]
  if (isFeatureFlagEnabled(FeatureFlags.channelMonitor)) {
    models.push({ label: t('nav.channelStatus'), path: '/monitor', icon: 'chartBar' })
  }

  const billing: NavItem[] = [
    { label: t('nav.mySubscriptions'), path: '/subscriptions', icon: 'badge' },
    { label: t('nav.redeem'), path: '/redeem', icon: 'gift' },
  ]
  if (isFeatureFlagEnabled(FeatureFlags.payment)) {
    billing.unshift({ label: t('nav.buySubscription'), path: '/purchase', icon: 'creditCard' })
    billing.push({ label: t('nav.myOrders'), path: '/orders', icon: 'clipboard' })
  }
  if (isFeatureFlagEnabled(FeatureFlags.affiliate)) {
    billing.push({ label: t('nav.affiliate'), path: '/affiliate', icon: 'users' })
  }

  if (authStore.isAdmin) {
    return [
      { label: t('nav.dashboard'), path: '/admin/dashboard' },
      { label: t('nav.myAccount'), children: [
        { label: t('nav.dashboard'), path: '/dashboard', icon: 'chartBar' },
        ...workspace,
        ...models,
        ...billing,
      ]},
      { label: t('nav.channelManagement'), children: [
        { label: t('nav.channelPricing'), path: '/admin/channels/pricing', icon: 'dollar' },
        { label: t('nav.channelMonitor'), path: '/admin/channels/monitor', icon: 'chartBar' },
        { label: t('nav.accounts'), path: '/admin/accounts', icon: 'user' },
        { label: t('nav.groups'), path: '/admin/groups', icon: 'grid' },
        { label: t('nav.proxies'), path: '/admin/proxies', icon: 'globe' },
      ]},
      { label: t('nav.users'), children: [
        { label: t('nav.users'), path: '/admin/users', icon: 'users' },
        { label: t('nav.subscriptions'), path: '/admin/subscriptions', icon: 'badge' },
        { label: t('nav.redeemCodes'), path: '/admin/redeem', icon: 'gift' },
        { label: t('nav.promoCodes'), path: '/admin/promo-codes', icon: 'gift' },
      ]},
      ...(isFeatureFlagEnabled(FeatureFlags.affiliate) ? [{
        label: t('nav.affiliateManagement'),
        children: [
          { label: t('nav.affiliateInviteRecords'), path: '/admin/affiliates/invites', icon: 'users' as IconName },
          { label: t('nav.affiliateRebateRecords'), path: '/admin/affiliates/rebates', icon: 'clipboard' as IconName },
          { label: t('nav.affiliateTransferRecords'), path: '/admin/affiliates/transfers', icon: 'creditCard' as IconName },
        ],
      }] : []),
      { label: t('nav.ops'), children: [
        { label: t('nav.ops'), path: '/admin/ops', icon: 'chartBar' },
        { label: t('nav.usage'), path: '/admin/usage', icon: 'database' },
        { label: t('nav.auditLogs'), path: '/admin/audit-logs', icon: 'clipboard' },
        { label: t('nav.announcements'), path: '/admin/announcements', icon: 'bell' },
      ]},
      { label: t('nav.settings'), path: '/admin/settings' },
    ]
  }
  return [
    { label: t('nav.dashboard'), path: '/dashboard' },
    { label: t('nav.workspace'), children: workspace },
    ...(models.length ? [{ label: t('nav.models'), children: models }] : []),
    { label: t('nav.billing'), children: billing },
  ]
})

function isPathActive(path: string) {
  return route.path === path || (path !== '/dashboard' && path !== '/admin/dashboard' && route.path.startsWith(`${path}/`))
}
function isItemActive(item: NavItem) {
  return item.path ? isPathActive(item.path) : Boolean(item.children?.some((child) => child.path && isPathActive(child.path)))
}
function toggleDropdown(name: string) { openDropdown.value = openDropdown.value === name ? '' : name }
function closeMenus() { openDropdown.value = ''; mobileOpen.value = false }
function formatMoney(value: number) {
  const amount = Number.isFinite(value) ? value : 0
  return isAdminScreen.value ? `$${amount.toFixed(2)}` : formatCurrency(amount)
}
function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}
async function handleLogout() { closeMenus(); await authStore.logout().catch(() => undefined); await router.push('/login') }
function onDocumentClick() { openDropdown.value = '' }
function onKeydown(event: KeyboardEvent) { if (event.key === 'Escape') closeMenus() }

watch(() => route.fullPath, closeMenus)
onMounted(() => { document.addEventListener('click', onDocumentClick); document.addEventListener('keydown', onKeydown) })
onBeforeUnmount(() => { document.removeEventListener('click', onDocumentClick); document.removeEventListener('keydown', onKeydown) })
</script>

<style scoped>
.top-nav { position: sticky; top: 0; z-index: 110; border-bottom: 1px solid rgba(57, 48, 28, .1); background: rgba(250, 246, 224, .82); backdrop-filter: blur(18px); }
.top-nav__inner { height: 68px; max-width: 1500px; margin: 0 auto; padding: 0 28px; display: flex; align-items: center; gap: 28px; }
.top-nav__brand { min-width: 0; display: flex; align-items: center; gap: 10px; color: #262419; text-decoration: none; }
.top-nav__logo { width: 36px; height: 36px; display: grid; place-items: center; overflow: hidden; border: 1px solid rgba(57,48,28,.12); border-radius: 10px; background: rgba(255,255,255,.72); box-shadow: 0 4px 14px rgba(70,58,26,.07); transform:translateZ(0); transition:transform .24s cubic-bezier(.22,1,.36,1),box-shadow .24s ease,border-color .24s ease; }
.top-nav__brand:hover .top-nav__logo { border-color:rgba(39,107,83,.22); box-shadow:0 7px 18px rgba(39,107,83,.11); transform:translateY(-1px); }
.top-nav__logo img { width: 100%; height: 100%; object-fit: contain; }
.top-nav__name { max-width: 180px; overflow: hidden; text-overflow: ellipsis; font-size: 15px; font-weight: 750; white-space: nowrap; }
.top-nav__desktop { display: flex; align-items: center; gap: 4px; margin-right: auto; }
.top-nav__group, .top-nav__profile-wrap { position: relative; }
.top-nav__link { display: flex; align-items: center; gap: 5px; padding: 9px 12px; border: 0; border-radius: 9px; background: transparent; color: #686252; font-size: 13px; font-weight: 650; cursor: pointer; transition: background .18s ease, color .18s ease, transform .18s ease; }
.top-nav__link:hover, .top-nav__link--active { background: rgba(255,255,255,.7); color: #205644; transform:translateY(-1px); }
.top-nav__link--active { box-shadow:0 1px 0 rgba(255,255,255,.9) inset,0 5px 14px rgba(39,107,83,.08); }
.top-nav__link:active { transform: translateY(1px); }
.top-nav__link :deep(svg) { transition: transform .2s ease; }
.top-nav__dropdown { position: absolute; z-index: 2; top: calc(100% + 10px); left: 0; width: 230px; max-height: min(520px, calc(100vh - 90px)); overflow-y: auto; padding: 7px; border: 1px solid rgba(57,48,28,.1); border-radius: 12px; background: rgba(255,253,244,.96); box-shadow: 0 14px 38px rgba(65,54,28,.12); backdrop-filter: blur(20px); }
.top-nav__dropdown--profile { left: auto; right: 0; }
.top-nav__dropdown-link { width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 11px; border: 0; border-radius: 8px; background: transparent; color: #504c40; font-size: 13px; font-weight: 600; text-align: left; transition: background .16s ease, color .16s ease, transform .16s cubic-bezier(.22,1,.36,1); }
.top-nav__dropdown-link:hover, .top-nav__dropdown-link--active { background: #f0f7f3; color: #205644; }
.top-nav__dropdown-link:hover { transform:translateX(2px); }
.top-nav__dropdown-link :deep(svg) { transition:transform .18s cubic-bezier(.22,1,.36,1); }
.top-nav__dropdown-link:hover :deep(svg) { transform:translateX(1px) scale(1.06); }
.top-nav__user-meta { display: flex; flex-direction: column; gap: 2px; margin: 2px 4px 7px; padding: 8px 7px 12px; border-bottom: 1px solid rgba(57,48,28,.09); overflow: hidden; }
.top-nav__user-meta strong, .top-nav__user-meta span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.top-nav__user-meta span { color: #85806f; font-size: 11px; }
.top-nav__logout { color: #a23b35; cursor: pointer; }
.top-nav__actions { min-width: 0; display: flex; align-items: center; gap: 8px; margin-left: auto; }
.top-nav__balance { min-width: 0; max-width: 170px; display: flex; flex: 0 1 auto; align-items: baseline; gap: 6px; padding: 7px 10px; border: 1px solid rgba(34,92,79,.12); border-radius: 9px; background: rgba(255,255,255,.55); color: #77715e; font-size: 10px; white-space: nowrap; }
.top-nav__balance > span { flex: 0 0 auto; }
.top-nav__balance strong { min-width: 0; overflow: hidden; color: #205644; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.top-nav__profile-wrap, .top-nav__hamburger { flex: 0 0 auto; }
.top-nav__profile { display: flex; align-items: center; gap: 5px; padding: 3px 5px 3px 3px; border: 0; border-radius: 10px; background: transparent; color: #6a6555; cursor: pointer; transition: background .18s ease; }
.top-nav__profile:hover { background: rgba(255,255,255,.7); }
.top-nav__avatar { width: 34px; height: 34px; display: grid; place-items: center; overflow: hidden; border-radius: 9px; background: #276b53; color: white; font-size: 11px; font-weight: 700; }
.top-nav__avatar img { width: 100%; height: 100%; object-fit: cover; }
.top-nav__hamburger { display: none; width: 40px; height: 40px; place-items: center; border: 1px solid rgba(57,48,28,.12); border-radius: 10px; background: rgba(255,255,255,.55); color: #38352b; }
.top-nav__mobile { display: none; }
.nav-popover-enter-active, .nav-popover-leave-active { transition: opacity .16s ease, transform .16s ease; transform-origin: top; }
.nav-popover-enter-from, .nav-popover-leave-to { opacity: 0; transform: translateY(-5px) scale(.98); }
.dark .top-nav { background: rgba(22,24,21,.85); border-color: rgba(255,255,255,.08); }
.dark .top-nav__name, .dark .top-nav__link { color: #e8e4d5; }
.dark .top-nav__dropdown { background: rgba(31,33,29,.97); border-color: rgba(255,255,255,.1); }
.dark .top-nav__dropdown-link { color: #d8d4c5; }
.dark .top-nav__dropdown-link:hover { background: rgba(39,107,83,.15); color: #8bc3a7; }
@media (max-width: 1050px) {
  .top-nav__inner { padding: 0 18px; }
  .top-nav__desktop { display: none; }
  .top-nav__hamburger { display: grid; }
  .top-nav__mobile { display: block; max-height: calc(100vh - 68px); overflow-y: auto; padding: 10px 18px 22px; border-top: 1px solid rgba(57,48,28,.08); background: rgba(250,246,224,.96); backdrop-filter: blur(22px); }
  .top-nav__mobile-section { padding: 7px 0; }
  .top-nav__mobile-label { margin: 0 0 5px; padding: 4px 10px; color: #958e77; font-size: 10px; font-weight: 750; text-transform: uppercase; }
  .top-nav__mobile-link { display: flex; align-items: center; gap: 10px; padding: 11px 10px; border-radius: 9px; color: #353329; font-size: 14px; font-weight: 650; }
  .top-nav__mobile-link.router-link-active { background: rgba(255,255,255,.7); color: #205644; }
  .top-nav__mobile-link--child { margin-left: 5px; color: #5e594a; font-weight: 550; }
  .top-nav__mobile-tools { align-items: center; justify-content: flex-end; gap: 8px; padding: 4px 4px 10px; }
  .mobile-nav-enter-active, .mobile-nav-leave-active { transition: opacity .22s ease, transform .22s ease; transform-origin: top; }
  .mobile-nav-enter-from, .mobile-nav-leave-to { opacity: 0; transform: translateY(-10px); }
  .dark .top-nav__mobile { background: rgba(22,24,21,.97); }
  .dark .top-nav__mobile-link { color: #e8e4d5; }
}
@media (max-width: 640px) {
  .top-nav__inner { height: 62px; padding: 0 12px; gap: 10px; }
  .top-nav__name { max-width: 112px; }
  .top-nav__balance { display: none; }
  .top-nav__mobile { max-height: calc(100vh - 62px); padding-inline: 12px; }
}
@media (prefers-reduced-motion: reduce) { * { transition-duration: 1ms !important; } }
</style>

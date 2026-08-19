<template>
  <div class="profile-account">
    <section data-testid="profile-overview-hero" class="profile-summary">
      <div class="profile-summary__identity">
        <div class="profile-avatar">
          <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName">
          <span v-else>{{ avatarInitial }}</span>
        </div>
        <div class="profile-summary__copy">
          <div class="profile-summary__name-row">
            <h2>{{ displayName }}</h2>
            <span :class="['badge', user?.role === 'admin' ? 'badge-primary' : 'badge-gray']">
              {{ user?.role === 'admin' ? t('profile.administrator') : t('profile.user') }}
            </span>
            <span :class="['badge', user?.status === 'active' ? 'badge-success' : 'badge-danger']">
              {{ user?.status === 'active' ? t('common.active') : t('common.disabled') }}
            </span>
          </div>
          <p v-if="primaryEmailDisplay" class="profile-summary__email">{{ primaryEmailDisplay }}</p>
          <div v-if="sourceHints.length" class="profile-source-list">
            <span v-for="hint in sourceHints" :key="hint.key">
              <Icon name="link" size="xs" />{{ hint.text }}
            </span>
          </div>
        </div>
      </div>

      <div class="profile-metrics">
        <div data-testid="profile-overview-metric-balance" class="profile-metric">
          <span>{{ t('profile.accountBalance') }}</span>
          <strong>{{ formatCurrency(user?.balance || 0) }}</strong>
        </div>
        <div data-testid="profile-overview-metric-concurrency" class="profile-metric">
          <span>{{ t('profile.concurrencyLimit') }}</span>
          <strong>{{ user?.concurrency || 0 }}</strong>
        </div>
        <div data-testid="profile-overview-metric-member-since" class="profile-metric">
          <span>{{ t('profile.memberSince') }}</span>
          <strong>{{ memberSinceLabel }}</strong>
        </div>
      </div>
    </section>

    <div class="profile-account__columns">
      <div data-testid="profile-main-column">
        <section data-testid="profile-basics-panel" class="profile-workspace-panel">
          <header class="profile-panel-heading">
            <span class="profile-panel-heading__icon"><Icon name="user" size="sm" /></span>
            <div>
              <h3>{{ t('profile.basicsTitle') }}</h3>
              <p>{{ t('profile.basicsDescription') }}</p>
            </div>
          </header>
          <div class="profile-editor-grid">
            <div class="profile-editor-block"><ProfileAvatarCard :user="user" embedded /></div>
            <div class="profile-editor-block"><ProfileEditForm :initial-username="user?.username || ''" embedded /></div>
          </div>
        </section>
      </div>

      <div data-testid="profile-side-column">
        <section data-testid="profile-auth-bindings-panel" class="profile-workspace-panel">
          <header class="profile-panel-heading">
            <span class="profile-panel-heading__icon"><Icon name="link" size="sm" /></span>
            <div>
              <h3>{{ t('profile.authBindings.title') }}</h3>
              <p>{{ t('profile.authBindings.description') }}</p>
            </div>
          </header>
          <div class="profile-bindings-body">
            <ProfileIdentityBindingsSection
              :user="user"
              :linuxdo-enabled="linuxdoEnabled"
              :dingtalk-enabled="dingtalkEnabled"
              :oidc-enabled="oidcEnabled"
              :oidc-provider-name="oidcProviderName"
              :wechat-enabled="wechatEnabled"
              :wechat-open-enabled="wechatOpenEnabled"
              :wechat-mp-enabled="wechatMpEnabled"
              :show-heading="false"
              embedded
              compact
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import ProfileAvatarCard from '@/components/user/profile/ProfileAvatarCard.vue'
import ProfileEditForm from '@/components/user/profile/ProfileEditForm.vue'
import ProfileIdentityBindingsSection from '@/components/user/profile/ProfileIdentityBindingsSection.vue'
import type { User, UserAuthBindingStatus, UserAuthProvider, UserProfileSourceContext } from '@/types'
import { formatCurrency } from '@/utils/format'

const props = withDefaults(defineProps<{
  user: User | null
  linuxdoEnabled?: boolean
  dingtalkEnabled?: boolean
  oidcEnabled?: boolean
  oidcProviderName?: string
  wechatEnabled?: boolean
  wechatOpenEnabled?: boolean
  wechatMpEnabled?: boolean
}>(), {
  linuxdoEnabled: false,
  dingtalkEnabled: false,
  oidcEnabled: false,
  oidcProviderName: 'OIDC',
  wechatEnabled: false,
  wechatOpenEnabled: undefined,
  wechatMpEnabled: undefined,
})

const { t } = useI18n()

function normalizeBindingStatus(binding: boolean | UserAuthBindingStatus | undefined): boolean | null {
  if (typeof binding === 'boolean') return binding
  if (!binding) return null
  if (typeof binding.bound === 'boolean') return binding.bound
  return Boolean(binding.provider_subject || binding.issuer || binding.provider_key)
}

function isEmailBound(user: User | null | undefined): boolean {
  if (typeof user?.email_bound === 'boolean') return user.email_bound
  const nested = user?.auth_bindings?.email ?? user?.identity_bindings?.email
  return normalizeBindingStatus(nested) ?? false
}

const avatarUrl = computed(() => props.user?.avatar_url?.trim() || '')
const displayName = computed(() => props.user?.username?.trim() || props.user?.email?.trim() || t('profile.user'))
const primaryEmailDisplay = computed(() => {
  const email = props.user?.email?.trim() || ''
  return email.endsWith('.invalid') && !isEmailBound(props.user) ? '' : email
})
const avatarInitial = computed(() => displayName.value.charAt(0).toUpperCase() || 'U')
const memberSinceLabel = computed(() => {
  const raw = props.user?.created_at?.trim()
  if (!raw) return '-'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short' }).format(date)
})

const providerLabels = computed<Record<UserAuthProvider, string>>(() => ({
  email: t('profile.authBindings.providers.email'),
  linuxdo: t('profile.authBindings.providers.linuxdo'),
  dingtalk: t('profile.authBindings.providers.dingtalk'),
  oidc: t('profile.authBindings.providers.oidc', { providerName: props.oidcProviderName }),
  wechat: t('profile.authBindings.providers.wechat'),
  github: 'GitHub',
  google: 'Google'
}))

function normalizeProvider(value: string): UserAuthProvider | null {
  const normalized = value.trim().toLowerCase()
  if (['email', 'linuxdo', 'dingtalk', 'wechat', 'github', 'google'].includes(normalized)) return normalized as UserAuthProvider
  if (normalized === 'oidc' || normalized.startsWith('oidc:') || normalized.startsWith('oidc/')) return 'oidc'
  return null
}

function readObjectString(source: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function resolveThirdPartySource(rawSource: string | UserProfileSourceContext | null | undefined): { provider: UserAuthProvider; label: string } | null {
  if (!rawSource) return null
  if (typeof rawSource === 'string') {
    const provider = normalizeProvider(rawSource)
    return !provider || provider === 'email' ? null : { provider, label: providerLabels.value[provider] }
  }
  const sourceRecord = rawSource as Record<string, unknown>
  const provider = normalizeProvider(readObjectString(sourceRecord, 'provider', 'source', 'provider_type', 'auth_provider'))
  if (!provider || provider === 'email') return null
  const explicitLabel = readObjectString(sourceRecord, 'provider_label', 'label', 'provider_name', 'providerName')
  return { provider, label: explicitLabel || providerLabels.value[provider] }
}

const sourceHints = computed(() => {
  const currentUser = props.user
  if (!currentUser) return []
  const hints: Array<{ key: string; text: string }> = []
  const avatarSource = resolveThirdPartySource(currentUser.profile_sources?.avatar ?? currentUser.avatar_source)
  const usernameSource = resolveThirdPartySource(currentUser.profile_sources?.username ?? currentUser.profile_sources?.display_name ?? currentUser.profile_sources?.nickname ?? currentUser.display_name_source ?? currentUser.username_source)
  if (avatarSource) hints.push({ key: `avatar-${avatarSource.provider}`, text: t('profile.authBindings.source.avatar', { providerName: avatarSource.label }) })
  if (usernameSource) hints.push({ key: `username-${usernameSource.provider}`, text: t('profile.authBindings.source.username', { providerName: usernameSource.label }) })
  return hints
})
</script>

<style scoped>
.profile-account { display:flex; flex-direction:column; gap:20px; }
.profile-summary { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:stretch; overflow:hidden; border:1px solid var(--line); border-radius:13px; background:color-mix(in srgb,var(--surface) 90%,transparent); box-shadow:var(--shadow-panel); backdrop-filter:blur(16px); transform-style:preserve-3d; transition:transform .24s cubic-bezier(.22,1,.36,1),box-shadow .24s ease,border-color .24s ease; }
.profile-summary:hover { border-color:rgba(39,107,83,.2); box-shadow:var(--shadow-depth); transform:translate3d(0,-1px,0); }
.profile-summary__identity { min-width:0; display:flex; align-items:center; gap:18px; padding:24px; }
.profile-avatar { width:82px; height:82px; flex:0 0 auto; display:grid; place-items:center; overflow:hidden; border:1px solid rgba(39,107,83,.18); border-radius:12px; background:#276b53; color:white; font-size:25px; font-weight:760; box-shadow:0 12px 30px rgba(39,107,83,.16); }
.profile-avatar img { width:100%; height:100%; object-fit:cover; }
.profile-summary__copy { min-width:0; }.profile-summary__name-row { display:flex; flex-wrap:wrap; align-items:center; gap:7px; }.profile-summary h2 { max-width:100%; margin:0 5px 0 0; overflow:hidden; font-size:25px; font-weight:760; text-overflow:ellipsis; white-space:nowrap; }
.profile-summary__email { margin:6px 0 0; color:var(--ink-muted); font-size:12px; }.profile-source-list { margin-top:11px; display:flex; flex-wrap:wrap; gap:6px; }.profile-source-list span { display:flex; align-items:center; gap:5px; padding:5px 8px; border:1px solid var(--line); border-radius:7px; color:var(--ink-muted); font-size:9px; }
.profile-metrics { display:grid; grid-template-columns:repeat(3,minmax(120px,1fr)); border-left:1px solid var(--line); background:var(--surface-muted); }.profile-metric { min-width:130px; padding:22px 18px; display:flex; flex-direction:column; justify-content:center; gap:8px; border-left:1px solid var(--line); }.profile-metric:first-child { border-left:0; }.profile-metric span { color:#8790a0; font-size:9px; font-weight:750; text-transform:uppercase; }.profile-metric strong { color:var(--ink); font-size:18px; font-weight:720; }
.profile-account__columns { display:grid; grid-template-columns:minmax(0,1.08fr) minmax(340px,.92fr); align-items:stretch; gap:20px; }.profile-account__columns > div { min-width:0; display:flex; }.profile-workspace-panel { width:100%; min-height:100%; display:flex; flex-direction:column; border:1px solid var(--line); border-radius:13px; background:color-mix(in srgb,var(--surface) 90%,transparent); box-shadow:var(--shadow-panel); backdrop-filter:blur(14px); transform:translate3d(0,0,0); transition:transform .24s cubic-bezier(.22,1,.36,1),box-shadow .24s ease,border-color .24s ease; }.profile-workspace-panel:hover { border-color:rgba(39,107,83,.18); box-shadow:var(--shadow-depth); transform:translate3d(0,-1px,0); }.profile-panel-heading { display:flex; align-items:flex-start; gap:11px; padding:18px 20px; border-bottom:1px solid var(--line); }.profile-panel-heading__icon { width:34px; height:34px; flex:0 0 auto; display:grid; place-items:center; border-radius:8px; background:#f0f7f3; color:#276b53; }.profile-panel-heading h3 { margin:0; font-size:14px; font-weight:740; }.profile-panel-heading p { margin:4px 0 0; color:var(--ink-muted); font-size:10px; line-height:1.5; }
.profile-editor-grid { display:grid; grid-template-columns:minmax(220px,.82fr) minmax(0,1.18fr); align-items:stretch; }.profile-editor-block { min-width:0; padding:20px; }.profile-editor-block + .profile-editor-block { border-left:1px solid var(--line); }.profile-bindings-body { padding:4px 20px 8px; }
.dark .profile-panel-heading__icon { background:rgba(39,107,83,.14); color:#8bc3a7; }
@media(max-width:1050px){.profile-summary{grid-template-columns:1fr}.profile-metrics{border-top:1px solid var(--line);border-left:0}.profile-account__columns{grid-template-columns:1fr}.profile-workspace-panel{min-height:0}}
@media(max-width:700px){.profile-account{gap:16px}.profile-account__columns{gap:16px}.profile-summary__identity{align-items:flex-start;gap:14px;padding:18px}.profile-avatar{width:64px;height:64px}.profile-summary h2{font-size:20px}.profile-metrics{grid-template-columns:1fr}.profile-metric{min-width:0;padding:14px 18px;border-top:1px solid var(--line);border-left:0}.profile-metric:first-child{border-top:0}.profile-editor-grid{grid-template-columns:1fr}.profile-editor-block{padding:18px}.profile-editor-block+.profile-editor-block{border-top:1px solid var(--line);border-left:0}.profile-bindings-body{padding:4px 18px 8px}.profile-panel-heading{padding:16px 18px}}
</style>

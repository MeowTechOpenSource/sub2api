<template>
  <AppLayout>
    <div
      data-testid="profile-shell"
      class="profile-page mx-auto max-w-6xl"
    >
      <header class="screen-header">
        <div class="screen-header__copy">
          <p class="screen-header__eyebrow">{{ t('nav.profile') }}</p>
          <h1 class="screen-header__title">{{ t('profile.title') }}</h1>
          <p class="screen-header__description">{{ t('profile.description') }}</p>
        </div>
      </header>

      <ProfileInfoCard
        :user="user"
        :linuxdo-enabled="linuxdoOAuthEnabled"
        :dingtalk-enabled="dingtalkOAuthEnabled"
        :oidc-enabled="oidcOAuthEnabled"
        :oidc-provider-name="oidcOAuthProviderName"
        :wechat-enabled="wechatOAuthEnabled"
        :wechat-open-enabled="wechatOAuthOpenEnabled"
        :wechat-mp-enabled="wechatOAuthMPEnabled"
      />

      <div class="profile-security-grid">
        <main class="space-y-5">
          <ProfilePasswordForm />
          <ProfileTotpCard />
          <ProfilePasskeyCard :enabled="passkeyEnabled" />
        </main>

        <aside class="space-y-5">
          <ProfileBalanceNotifyCard
            v-if="user && balanceLowNotifyEnabled"
            :enabled="user.balance_notify_enabled ?? true"
            :threshold="user.balance_notify_threshold"
            :extra-emails="user.balance_notify_extra_emails ?? []"
            :system-default-threshold="systemDefaultThreshold"
            :user-email="user.email"
          />
          <div v-if="contactInfo" class="profile-support-panel">
            <div class="profile-support-panel__icon"><Icon name="chat" size="md" /></div>
            <div class="min-w-0">
              <h3>{{ t('common.contactSupport') }}</h3>
              <p>{{ contactInfo }}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@/components/icons'
import AppLayout from '@/components/layout/AppLayout.vue'
import ProfileBalanceNotifyCard from '@/components/user/profile/ProfileBalanceNotifyCard.vue'
import ProfileInfoCard from '@/components/user/profile/ProfileInfoCard.vue'
import ProfilePasswordForm from '@/components/user/profile/ProfilePasswordForm.vue'
import ProfileTotpCard from '@/components/user/profile/ProfileTotpCard.vue'
import ProfilePasskeyCard from '@/components/user/profile/ProfilePasskeyCard.vue'
import { isWeChatWebOAuthEnabled } from '@/api/auth'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const contactInfo = ref('')
const balanceLowNotifyEnabled = ref(false)
const systemDefaultThreshold = ref(0)
const linuxdoOAuthEnabled = ref(false)
const dingtalkOAuthEnabled = ref(false)
const wechatOAuthEnabled = ref(false)
const wechatOAuthOpenEnabled = ref<boolean | undefined>(undefined)
const wechatOAuthMPEnabled = ref<boolean | undefined>(undefined)
const oidcOAuthEnabled = ref(false)
const oidcOAuthProviderName = ref('OIDC')
const passkeyEnabled = ref(false)

onMounted(async () => {
  const profileRefresh = authStore.refreshUser().catch((error) => {
    console.error('Failed to refresh profile:', error)
  })

  const settingsLoad = appStore.fetchPublicSettings()
    .then((settings) => {
      if (!settings) {
        return
      }
      contactInfo.value = settings.contact_info || ''
      balanceLowNotifyEnabled.value = settings.balance_low_notify_enabled ?? false
      systemDefaultThreshold.value = settings.balance_low_notify_threshold ?? 0
      linuxdoOAuthEnabled.value = settings.linuxdo_oauth_enabled ?? false
      dingtalkOAuthEnabled.value = settings.dingtalk_oauth_enabled ?? false
      wechatOAuthEnabled.value = isWeChatWebOAuthEnabled(settings)
      wechatOAuthOpenEnabled.value = typeof settings.wechat_oauth_open_enabled === 'boolean'
        ? settings.wechat_oauth_open_enabled
        : undefined
      wechatOAuthMPEnabled.value = typeof settings.wechat_oauth_mp_enabled === 'boolean'
        ? settings.wechat_oauth_mp_enabled
        : undefined
      oidcOAuthEnabled.value = settings.oidc_oauth_enabled ?? false
      oidcOAuthProviderName.value = settings.oidc_oauth_provider_name || 'OIDC'
      passkeyEnabled.value = settings.passkey_enabled === true
    })
    .catch((error) => {
      console.error('Failed to load settings:', error)
    })

  await Promise.all([profileRefresh, settingsLoad])
})
</script>

<style scoped>
.profile-page { display:flex; flex-direction:column; gap:20px; padding-bottom:28px; }
.profile-security-grid { display:grid; align-items:stretch; gap:20px; grid-template-columns:minmax(0,1.08fr) minmax(340px,.92fr); }
.profile-security-grid > main,.profile-security-grid > aside { min-width:0; }
.profile-security-grid :deep(.card) { overflow:hidden; border:1px solid var(--line); border-radius:13px; background:color-mix(in srgb,var(--surface) 90%,transparent); box-shadow:var(--shadow-panel); backdrop-filter:blur(14px); }
.profile-security-grid :deep(.card > .border-b) { padding:17px 20px; border-color:var(--line); background:color-mix(in srgb,var(--surface-muted) 46%,transparent); }
.profile-security-grid :deep(.card > .border-b h2) { font-size:14px; font-weight:740; }
.profile-security-grid :deep(.card > .border-b p) { margin-top:4px; font-size:10px; line-height:1.5; }
.profile-security-grid :deep(.card > .px-6) { padding:20px; }
.profile-support-panel { display:flex; align-items:flex-start; gap:12px; padding:20px; border:1px solid var(--line); border-radius:12px; background:color-mix(in srgb,var(--surface) 88%,transparent); box-shadow:var(--shadow-panel); backdrop-filter:blur(14px); }
.profile-support-panel__icon { width:40px; height:40px; flex:0 0 auto; display:grid; place-items:center; border-radius:9px; background:#f0f7f3; color:#276b53; }
.profile-support-panel h3 { margin:0; font-size:13px; font-weight:750; }.profile-support-panel p { margin:5px 0 0; overflow-wrap:anywhere; color:var(--ink-muted); font-size:11px; line-height:1.55; }
.dark .profile-support-panel__icon { background:rgba(39,107,83,.14); color:#8bc3a7; }
@media(max-width:1050px){.profile-security-grid{grid-template-columns:1fr}}
@media(max-width:640px){.profile-page{gap:16px;padding-bottom:20px}.profile-security-grid{gap:16px}.profile-security-grid main,.profile-security-grid aside{gap:16px}}
</style>

<template>
  <div class="auth-shell">
    <aside class="auth-brand-panel">
      <router-link to="/home" class="auth-brand">
        <span class="auth-brand__logo">
          <img v-if="settingsLoaded" :src="siteLogo || '/logo.svg'" alt="" />
        </span>
        <span>{{ siteName }}</span>
      </router-link>

      <div class="auth-brand-panel__content">
        <p class="auth-brand-panel__eyebrow">{{ t('auth.secureAccess') }}</p>
        <h1>{{ siteName }}</h1>
        <p>{{ siteSubtitle }}</p>

        <slot name="visual">
          <div class="auth-signal">
            <div class="auth-signal__header">
              <span><i /> {{ t('auth.gatewayStatus') }}</span>
              <strong>{{ t('auth.operational') }}</strong>
            </div>
            <div class="auth-signal__request">
              <span>POST</span>
              <code>/v1/messages</code>
              <strong>200</strong>
            </div>
            <div class="auth-signal__rows">
              <div><span>{{ t('auth.authentication') }}</span><strong>{{ t('auth.encrypted') }}</strong></div>
              <div><span>{{ t('auth.smartRouting') }}</span><strong>{{ t('auth.active') }}</strong></div>
              <div><span>{{ t('auth.usageMetering') }}</span><strong>{{ t('auth.realTime') }}</strong></div>
            </div>
          </div>
        </slot>
      </div>

      <div class="auth-brand-panel__footer">
        <span>© {{ currentYear }} {{ siteName }}</span>
        <span class="auth-brand-panel__secure"><Icon name="shield" size="xs" /> {{ t('auth.protectedSession') }}</span>
      </div>
    </aside>

    <main class="auth-workspace">
      <div class="auth-mobile-brand">
        <router-link to="/home" class="auth-brand">
          <span class="auth-brand__logo"><img v-if="settingsLoaded" :src="siteLogo || '/logo.svg'" alt="" /></span>
          <span>{{ siteName }}</span>
        </router-link>
      </div>

      <div class="auth-workspace__content">
        <slot />
        <div class="auth-workspace__footer"><slot name="footer" /></div>
      </div>

      <p class="auth-mobile-copyright">© {{ currentYear }} {{ siteName }}</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'
import Icon from '@/components/icons/Icon.vue'
import { sanitizeUrl } from '@/utils/url'

const appStore = useAppStore()
const { t } = useI18n()
const siteName = computed(() => appStore.siteName || 'Sub2API')
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const siteSubtitle = computed(() => appStore.cachedPublicSettings?.site_subtitle || 'One secure gateway for every model your team uses.')
const settingsLoaded = computed(() => appStore.publicSettingsLoaded)
const currentYear = computed(() => new Date().getFullYear())

onMounted(() => appStore.fetchPublicSettings())
</script>

<style scoped>
.auth-shell { min-height:100vh; display:grid; grid-template-columns:minmax(380px,.82fr) minmax(520px,1.18fr); background:#f8f2d8; }
.auth-brand-panel { position:relative; min-height:100vh; display:flex; flex-direction:column; padding:34px 42px; overflow:hidden; background:#173a31; color:white; }
.auth-brand { width:fit-content; display:flex; align-items:center; gap:11px; color:inherit; font-size:15px; font-weight:760; }.auth-brand__logo { width:38px; height:38px; display:grid; place-items:center; overflow:hidden; border:1px solid rgba(255,255,255,.16); border-radius:10px; background:rgba(255,255,255,.1); }.auth-brand__logo img { width:100%; height:100%; object-fit:contain; }
.auth-brand-panel__content { width:min(100%,480px); margin:auto 0; padding:56px 0; }.auth-brand-panel__eyebrow { margin:0 0 14px!important; color:#9fd0b9!important; font-size:10px!important; font-weight:800; text-transform:uppercase; }.auth-brand-panel h1 { margin:0; color:white; font-size:clamp(42px,5vw,68px); line-height:1; }.auth-brand-panel__content > p:not(.auth-brand-panel__eyebrow) { max-width:430px; margin:18px 0 0; color:#d1ded7; font-size:14px; line-height:1.7; }
.auth-signal { margin-top:44px; border:1px solid rgba(255,255,255,.13); border-radius:12px; background:rgba(255,255,255,.06); overflow:hidden; }.auth-signal__header { display:flex; align-items:center; justify-content:space-between; padding:13px 15px; border-bottom:1px solid rgba(255,255,255,.1); color:#b9c5d8; font-size:9px; }.auth-signal__header span { display:flex; align-items:center; gap:7px; }.auth-signal__header i { width:6px; height:6px; border-radius:50%; background:#34d399; box-shadow:0 0 0 4px rgba(52,211,153,.1); }.auth-signal__header strong { color:#6ee7b7; font-size:9px; }
.auth-signal__request { display:flex; align-items:center; gap:10px; margin:14px; padding:11px; border:1px solid rgba(255,255,255,.1); border-radius:8px; background:rgba(15,23,42,.22); }.auth-signal__request span { padding:3px 5px; border-radius:4px; background:#276b53; color:white; font-size:8px; font-weight:800; }.auth-signal__request code { flex:1; color:#dceee4; font-size:10px; }.auth-signal__request strong { color:#6ee7b7; font-size:9px; }
.auth-signal__rows { padding:0 15px 12px; }.auth-signal__rows div { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(255,255,255,.08); color:#93a4bd; font-size:9px; }.auth-signal__rows div:last-child { border:0; }.auth-signal__rows strong { color:#e2e8f0; font-weight:650; }
.auth-brand-panel__footer { display:flex; justify-content:space-between; gap:16px; color:#91aa9e; font-size:9px; }.auth-brand-panel__secure { display:flex; align-items:center; gap:5px; }
.auth-workspace { min-height:100vh; display:flex; flex-direction:column; background:#f8f2d8; }.auth-workspace__content { width:min(100% - 48px,480px); margin:auto; padding:48px 0; }.auth-workspace__footer { margin-top:22px; text-align:center; color:#758094; font-size:12px; }.auth-mobile-brand,.auth-mobile-copyright { display:none; }
.dark .auth-shell,.dark .auth-workspace { background:#111713; }.dark .auth-brand-panel { background:#10241e; }
@media(max-width:900px){.auth-shell{grid-template-columns:1fr}.auth-brand-panel{display:none}.auth-mobile-brand{display:block;padding:22px 24px;border-bottom:1px solid var(--line)}.auth-mobile-brand .auth-brand{color:var(--ink)}.auth-mobile-brand .auth-brand__logo{border-color:var(--line);background:var(--surface)}.auth-workspace__content{padding:38px 0}.auth-mobile-copyright{display:block;margin:0 0 22px;text-align:center;color:#9aa2b1;font-size:9px}}
@media(max-width:520px){.auth-workspace__content{width:calc(100% - 28px);padding:30px 0}.auth-mobile-brand{padding:16px}}
</style>

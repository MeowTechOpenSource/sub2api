<template>
  <header class="plaza-nav">
    <div class="plaza-nav__inner">
      <RouterLink to="/" class="plaza-brand">
        <span class="plaza-brand__mark">
          <img v-if="settings" :src="siteLogo || '/logo.svg'" alt="" />
          <i v-else></i>
        </span>
        <span><strong>{{ settings ? siteName : 'Sub2API' }}</strong><small>{{ t('modelPlaza.nav.catalog') }}</small></span>
      </RouterLink>

      <nav>
        <RouterLink to="/model-plaza" class="active">{{ t('modelPlaza.title') }}</RouterLink>
      </nav>

      <RouterLink v-if="isAuthenticated" :to="backTarget" class="plaza-nav__action">
        <Icon name="arrowLeft" size="xs" />{{ t('modelPlaza.nav.backToDashboard') }}
      </RouterLink>
      <RouterLink v-else :to="{ path: '/login', query: { redirect: '/model-plaza' } }" class="plaza-nav__action">
        {{ t('modelPlaza.nav.login') }}<Icon name="arrowRight" size="xs" />
      </RouterLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import { sanitizeUrl } from '@/utils/url'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()
const settings = computed(() => appStore.cachedPublicSettings)
const siteName = computed(() => settings.value?.site_name || 'Sub2API')
const siteLogo = computed(() => sanitizeUrl(settings.value?.site_logo || '', { allowRelative: true, allowDataUrl: true }))
const isAuthenticated = computed(() => authStore.isAuthenticated)
const backTarget = computed(() => (authStore.isAdmin ? '/admin/dashboard' : '/dashboard'))
</script>

<style scoped>
.plaza-nav { position: sticky; z-index: 60; top: 0; border-bottom: 1px solid rgba(57,48,28,.1); background: rgba(248,242,216,.82); box-shadow: 0 8px 28px rgba(67,55,26,.04); backdrop-filter: blur(22px); }
.plaza-nav__inner { display: grid; max-width: 1440px; min-height: 68px; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 24px; margin: 0 auto; padding: 0 24px; }
.plaza-brand { display: flex; min-width: 0; align-items: center; gap: 10px; color: inherit; text-decoration: none; }.plaza-brand__mark { display: grid; width: 38px; height: 38px; overflow: hidden; place-items: center; border: 1px solid rgba(57,48,28,.11); border-radius: 10px; background: rgba(255,255,255,.72); box-shadow: 0 7px 18px rgba(67,55,26,.07); }.plaza-brand__mark img { width: 100%; height: 100%; object-fit: contain; }.plaza-brand__mark i { width: 18px; height: 18px; border-radius: 5px; background: #40715c; animation: nav-pulse 1.2s ease-in-out infinite; }.plaza-brand>span:last-child { display: grid; min-width: 0; }.plaza-brand strong { overflow: hidden; color: #29271f; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }.plaza-brand small { color: #8b836e; font-size: 9px; font-weight: 700; text-transform: uppercase; }
nav a { position: relative; padding: 23px 6px 21px; color: #4d665a; font-size: 12px; font-weight: 750; text-decoration: none; }nav a::after { position: absolute; right: 5px; bottom: 0; left: 5px; height: 2px; border-radius: 2px; background: #276b53; content: ''; }
.plaza-nav__action { display: inline-flex; min-height: 38px; align-items: center; justify-self: end; gap: 7px; padding: 0 12px; border: 1px solid rgba(39,107,83,.22); border-radius: 9px; background: rgba(255,255,255,.6); color: #245d48; font-size: 12px; font-weight: 750; text-decoration: none; box-shadow: 0 6px 16px rgba(44,78,63,.06); transition: transform .18s ease, background .18s ease; }.plaza-nav__action:hover { transform: translateY(-1px); background: rgba(255,255,255,.92); }
.dark .plaza-nav { border-color: rgba(255,255,255,.08); background: rgba(23,25,20,.86); }.dark .plaza-brand strong { color: #f2eee3; }.dark .plaza-nav__action { background: rgba(255,255,255,.05); color: #9bceb6; }
@keyframes nav-pulse { 50% { opacity: .45; } }
@media (max-width: 640px) { .plaza-nav__inner { min-height: 60px; grid-template-columns: 1fr auto; padding: 0 14px; }.plaza-nav nav { display: none; }.plaza-brand small { display: none; }.plaza-nav__action { padding: 0 10px; }.plaza-nav__action :deep(svg) { display: none; } }
@media (prefers-reduced-motion: reduce) { .plaza-brand__mark i { animation: none; } }
</style>

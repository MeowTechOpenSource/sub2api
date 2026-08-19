<template>
  <div v-if="homeContent" class="min-h-screen">
    <iframe
      v-if="isHomeContentUrl"
      :src="homeContent.trim()"
      class="h-screen w-full border-0"
      allowfullscreen
    />
    <div v-else v-html="homeContent" />
  </div>

  <div v-else-if="compactHomeEnabled" data-testid="compact-home" class="compact-home">
    <main>
      <span class="compact-home__logo"><img :src="siteLogo || '/logo.svg'" alt="" /></span>
      <p class="compact-home__eyebrow">{{ t('home.tags.realtimeBilling') }}</p>
      <h1>{{ siteName }}</h1>
      <p class="compact-home__subtitle">{{ siteSubtitle || t('home.heroDescription') }}</p>
      <router-link :to="isAuthenticated ? dashboardPath : '/login'" class="compact-home__action">
        {{ isAuthenticated ? t('home.goToDashboard') : t('home.login') }}
        <Icon name="arrowRight" size="sm" />
      </router-link>
    </main>
    <div class="compact-home__tools">
      <LocaleSwitcher />
      <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer" :title="t('home.viewDocs')"><Icon name="book" size="sm" /></a>
      <button :title="isDark ? t('home.switchToLight') : t('home.switchToDark')" @click="toggleTheme"><Icon :name="isDark ? 'sun' : 'moon'" size="sm" /></button>
    </div>
    <footer>© {{ currentYear }} {{ siteName }}</footer>
  </div>

  <div v-else class="public-home">
    <header class="public-nav">
      <div class="public-nav__inner">
        <router-link to="/home" class="public-brand">
          <span class="public-brand__mark">
            <img :src="siteLogo || '/logo.svg'" alt="" />
          </span>
          <span>{{ siteName }}</span>
        </router-link>

        <nav class="public-nav__links" aria-label="Primary navigation">
          <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer">{{ t('home.docs') }}</a>
          <a :href="githubUrl" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>

        <div class="public-nav__actions">
          <LocaleSwitcher class="hidden sm:block" />
          <button
            class="icon-control hidden sm:grid"
            :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
            @click="toggleTheme"
          >
            <Icon :name="isDark ? 'sun' : 'moon'" size="sm" />
          </button>
          <router-link :to="isAuthenticated ? dashboardPath : '/login'" class="nav-account">
            {{ isAuthenticated ? t('home.dashboard') : t('home.login') }}
          </router-link>
          <button class="mobile-toggle" :aria-expanded="mobileMenuOpen" aria-label="Toggle menu" @click="mobileMenuOpen = !mobileMenuOpen">
            <Icon :name="mobileMenuOpen ? 'x' : 'menu'" size="md" />
          </button>
        </div>
      </div>
      <Transition name="mobile-menu">
        <div v-if="mobileMenuOpen" class="public-mobile-menu">
          <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer">{{ t('home.docs') }}</a>
          <a :href="githubUrl" target="_blank" rel="noopener noreferrer">GitHub</a>
          <div class="public-mobile-menu__tools">
            <LocaleSwitcher />
            <button class="icon-control" @click="toggleTheme">
              <Icon :name="isDark ? 'sun' : 'moon'" size="sm" />
            </button>
          </div>
        </div>
      </Transition>
    </header>

    <main>
      <section class="home-hero">
        <div class="home-hero__copy">
          <div class="status-line">
            <span class="status-line__dot" />
            {{ t('home.tags.realtimeBilling') }} · {{ t('home.tags.stickySession') }}
          </div>
          <h1>{{ siteName }}</h1>
          <h2>{{ t('home.heroSubtitle') }}</h2>
          <p>{{ siteSubtitle || t('home.heroDescription') }}</p>
          <div class="home-hero__actions">
            <router-link :to="isAuthenticated ? dashboardPath : '/register'" class="home-button home-button--primary">
              {{ isAuthenticated ? t('home.goToDashboard') : t('home.getStarted') }}
              <Icon name="arrowRight" size="sm" />
            </router-link>
            <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer" class="home-button home-button--secondary">
              <Icon name="book" size="sm" />
              {{ t('home.viewDocs') }}
            </a>
          </div>
          <div class="provider-line" aria-label="Supported providers">
            <span>Claude</span><i />
            <span>OpenAI</span><i />
            <span>Gemini</span><i />
            <span>Grok</span>
          </div>
        </div>

        <div class="gateway-preview terminal-container" aria-label="API gateway activity preview">
          <div class="gateway-preview__bar">
            <div>
              <span class="gateway-preview__live" />
              <strong>Gateway activity</strong>
            </div>
            <span>Live</span>
          </div>
          <div class="gateway-preview__endpoint">
            <span>POST</span>
            <code>/v1/messages</code>
            <strong>200</strong>
          </div>
          <div class="gateway-preview__metrics">
            <div><span>Model</span><strong>claude-sonnet-4</strong></div>
            <div><span>Latency</span><strong>842 ms</strong></div>
            <div><span>Tokens</span><strong>2,481</strong></div>
          </div>
          <div class="gateway-preview__routes">
            <div class="route-row route-row--active">
              <span class="route-row__icon">A</span>
              <div><strong>Anthropic</strong><small>Primary route</small></div>
              <span class="route-row__state">Healthy</span>
            </div>
            <div class="route-row">
              <span class="route-row__icon">O</span>
              <div><strong>OpenAI</strong><small>Ready for failover</small></div>
              <span class="route-row__state">Standby</span>
            </div>
            <div class="route-row">
              <span class="route-row__icon">G</span>
              <div><strong>Gemini</strong><small>Ready for failover</small></div>
              <span class="route-row__state">Standby</span>
            </div>
          </div>
          <div class="gateway-preview__footer">
            <span>Automatic routing</span>
            <div class="mini-bars"><i /><i /><i /><i /><i /><i /></div>
          </div>
        </div>
      </section>

      <section class="capability-band">
        <div class="capability-band__intro">
          <p>{{ t('home.solutions.subtitle') }}</p>
          <h2>{{ t('home.solutions.title') }}</h2>
        </div>
        <div class="capability-grid">
          <article>
            <span class="capability-index">01</span>
            <Icon name="key" size="md" />
            <h3>{{ t('home.features.unifiedGateway') }}</h3>
            <p>{{ t('home.features.unifiedGatewayDesc') }}</p>
          </article>
          <article>
            <span class="capability-index">02</span>
            <Icon name="refresh" size="md" />
            <h3>{{ t('home.features.multiAccount') }}</h3>
            <p>{{ t('home.features.multiAccountDesc') }}</p>
          </article>
          <article>
            <span class="capability-index">03</span>
            <Icon name="chartBar" size="md" />
            <h3>{{ t('home.features.balanceQuota') }}</h3>
            <p>{{ t('home.features.balanceQuotaDesc') }}</p>
          </article>
        </div>
      </section>

      <section class="home-cta">
        <div>
          <span>API</span>
          <h2>{{ t('home.cta.title') }}</h2>
          <p>{{ t('home.cta.description') }}</p>
        </div>
        <router-link :to="isAuthenticated ? dashboardPath : '/register'" class="home-button home-button--primary">
          {{ isAuthenticated ? t('home.goToDashboard') : t('home.cta.button') }}
          <Icon name="arrowRight" size="sm" />
        </router-link>
      </section>
    </main>

    <footer class="public-footer">
      <div><strong>{{ siteName }}</strong><span>© {{ currentYear }} {{ t('home.footer.allRightsReserved') }}</span></div>
      <div><a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer">{{ t('home.docs') }}</a><a :href="githubUrl" target="_blank" rel="noopener noreferrer">GitHub</a></div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore, useAuthStore } from '@/stores'
import Icon from '@/components/icons/Icon.vue'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import { sanitizeUrl } from '@/utils/url'

const { t } = useI18n()
const authStore = useAuthStore()
const appStore = useAppStore()
const isDark = ref(document.documentElement.classList.contains('dark'))
const mobileMenuOpen = ref(false)

const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Sub2API')
const siteLogo = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const siteSubtitle = computed(() => appStore.cachedPublicSettings?.site_subtitle || '')
const docUrl = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.doc_url || appStore.docUrl || ''))
const homeContent = computed(() => (appStore.cachedPublicSettings?.home_content || '').trim())
const compactHomeEnabled = computed(() => appStore.cachedPublicSettings?.compact_home_enabled === true)
const isHomeContentUrl = computed(() => /^https?:\/\//.test(homeContent.value.trim()))
const isAuthenticated = computed(() => authStore.isAuthenticated)
const dashboardPath = computed(() => authStore.isAdmin ? '/admin/dashboard' : '/dashboard')
const currentYear = computed(() => new Date().getFullYear())
const githubUrl = 'https://github.com/Wei-Shaw/sub2api'

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  authStore.checkAuth()
  if (!appStore.publicSettingsLoaded) appStore.fetchPublicSettings()
})
</script>

<style scoped>
.compact-home { position: relative; display: grid; min-height: 100vh; place-items: center; overflow: hidden; padding: 72px 22px; background: #f8f2d8; color: #29271f; }
.compact-home main { display: grid; width: min(620px,100%); justify-items: center; text-align: center; animation: compact-enter .45s ease both; }
.compact-home__logo { display: grid; width: 72px; height: 72px; overflow: hidden; place-items: center; margin-bottom: 25px; border: 1px solid rgba(57,48,28,.12); border-radius: 16px; background: rgba(255,253,244,.75); box-shadow: 0 18px 48px rgba(67,55,26,.1); backdrop-filter: blur(18px); }.compact-home__logo img { width: 100%; height: 100%; object-fit: contain; }
.compact-home__eyebrow { margin: 0 0 9px; color: #276b53; font-size: 10px; font-weight: 800; text-transform: uppercase; }.compact-home h1 { max-width: 100%; margin: 0; overflow-wrap: anywhere; font-family: var(--font-display); font-size: 58px; font-weight: 780; line-height: 1.05; letter-spacing: 0; }.compact-home__subtitle { max-width: 530px; margin: 16px 0 0; color: #746d5d; font-size: 14px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.compact-home__action { display: inline-flex; min-height: 44px; align-items: center; gap: 8px; margin-top: 28px; padding: 0 17px; border-radius: 10px; background: #276b53; color: white; font-size: 12px; font-weight: 750; box-shadow: 0 10px 25px rgba(39,107,83,.17); transition: transform .18s ease, background .18s ease; }.compact-home__action:hover { transform: translateY(-2px); background: #205644; }
.compact-home__tools { position: absolute; top: 20px; right: 20px; display: flex; align-items: center; gap: 7px; }.compact-home__tools a,.compact-home__tools button { display: grid; width: 38px; height: 38px; place-items: center; border: 1px solid rgba(57,48,28,.12); border-radius: 9px; background: rgba(255,253,244,.68); color: #596257; backdrop-filter: blur(14px); }.compact-home footer { position: absolute; right: 20px; bottom: 18px; left: 20px; color: #938b76; font-size: 9px; text-align: center; }
.dark .compact-home { background: #171914; color: #f2eee3; }.dark .compact-home__subtitle { color: #aaa591; }.dark .compact-home__logo,.dark .compact-home__tools a,.dark .compact-home__tools button { border-color: rgba(255,255,255,.09); background: rgba(255,255,255,.05); color: #d4d0c3; }
@keyframes compact-enter { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: none; } }
@media (max-width: 640px) { .compact-home h1 { font-size: 38px; }.compact-home__tools { top: 14px; right: 14px; } }
.public-home { min-height: 100vh; background: #f8f2d8; color: #202636; }
.public-nav { position: sticky; top: 0; z-index: 40; border-bottom: 1px solid rgba(71,85,105,.13); background: rgba(248,242,216,.88); backdrop-filter: blur(18px); }
.public-nav__inner { max-width: 1280px; height: 68px; margin: 0 auto; padding: 0 28px; display: flex; align-items: center; gap: 32px; }
.public-brand { display: flex; align-items: center; gap: 10px; color: #202636; font-size: 15px; font-weight: 750; }
.public-brand__mark { width: 36px; height: 36px; display: grid; place-items: center; overflow: hidden; border: 1px solid rgba(71,85,105,.13); border-radius: 10px; background: #fffdf5; box-shadow: 0 8px 22px rgba(31,41,55,.06); }
.public-brand__mark img { width: 100%; height: 100%; object-fit: contain; }
.public-nav__links { display: flex; align-items: center; gap: 24px; margin-left: auto; }
.public-nav__links a { color: #687083; font-size: 13px; font-weight: 600; transition: color .16s ease; }.public-nav__links a:hover { color: #205644; }
.public-nav__actions { display: flex; align-items: center; gap: 8px; }
.icon-control { width: 38px; height: 38px; place-items: center; border: 1px solid rgba(71,85,105,.14); border-radius: 10px; background: rgba(255,253,245,.7); color: #586174; transition: border-color .16s ease, color .16s ease, background .16s ease; }
.icon-control:hover { border-color: rgba(39,107,83,.3); background: #f0f7f3; color: #205644; }
.nav-account { padding: 9px 14px; border-radius: 10px; background: #276b53; color: white; font-size: 12px; font-weight: 700; transition: background .16s ease, transform .16s ease; }.nav-account:hover { background: #205644; transform: translateY(-1px); }
.mobile-toggle { display: none; width: 40px; height: 40px; place-items: center; border: 1px solid rgba(71,85,105,.14); border-radius: 10px; background: #fffdf5; color: #394153; }
.public-mobile-menu { display: none; }
.home-hero { max-width: 1280px; min-height: min(720px, calc(100vh - 68px)); margin: 0 auto; padding: 72px 28px 64px; display: grid; grid-template-columns: minmax(0,1fr) minmax(420px,.86fr); align-items: center; gap: 80px; }
.home-hero__copy { max-width: 630px; }.status-line { width: fit-content; display: flex; align-items: center; gap: 8px; margin-bottom: 24px; padding: 6px 9px; border: 1px solid rgba(39,107,83,.14); border-radius: 8px; background: rgba(255,253,245,.62); color: #4b5c78; font-size: 10px; font-weight: 700; text-transform: uppercase; }
.status-line__dot { width: 7px; height: 7px; border-radius: 50%; background: #16a36a; box-shadow: 0 0 0 4px rgba(22,163,106,.1); }
.home-hero h1 { margin: 0; color: #172033; font-family: var(--font-display); font-size: clamp(46px,7vw,82px); font-weight: 780; line-height: .98; letter-spacing: 0; }
.home-hero h2 { margin: 18px 0 0; color: #276b53; font-size: clamp(22px,3vw,36px); font-weight: 650; line-height: 1.2; }.home-hero__copy > p { max-width: 570px; margin: 22px 0 0; color: #667085; font-size: 16px; line-height: 1.75; }
.home-hero__actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 30px; }.home-button { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 17px; border-radius: 10px; font-size: 12px; font-weight: 750; transition: transform .16s ease, background .16s ease, border-color .16s ease; }.home-button:hover { transform: translateY(-1px); }.home-button--primary { background: #276b53; color: white; box-shadow: 0 8px 22px rgba(39,107,83,.16); }.home-button--primary:hover { background: #205644; }.home-button--secondary { border: 1px solid rgba(71,85,105,.16); background: #fffdf5; color: #3d4658; }.home-button--secondary:hover { border-color: rgba(39,107,83,.28); color: #205644; }
.provider-line { display: flex; align-items: center; gap: 12px; margin-top: 34px; color: #8991a2; font-size: 10px; font-weight: 750; text-transform: uppercase; }.provider-line i { width: 3px; height: 3px; border-radius: 50%; background: #bac0ca; }
.gateway-preview { border: 1px solid rgba(71,85,105,.14); border-radius: 14px; background: rgba(255,253,245,.84); box-shadow: 0 24px 70px rgba(32,86,68,.1); backdrop-filter: blur(18px); overflow: hidden; animation: preview-in .55s ease both; }
.gateway-preview__bar, .gateway-preview__footer { display: flex; align-items: center; justify-content: space-between; padding: 13px 16px; border-bottom: 1px solid rgba(71,85,105,.1); color: #818a9b; font-size: 10px; }.gateway-preview__bar div { display: flex; align-items: center; gap: 8px; }.gateway-preview__bar strong { color: #394153; font-size: 11px; }.gateway-preview__live { width: 7px; height: 7px; border-radius: 50%; background: #16a36a; }
.gateway-preview__endpoint { display: flex; align-items: center; gap: 10px; margin: 16px; padding: 12px; border: 1px solid rgba(71,85,105,.1); border-radius: 9px; background: #f7f8fa; }.gateway-preview__endpoint span { padding: 3px 5px; border-radius: 5px; background: #dceee4; color: #205644; font-size: 9px; font-weight: 800; }.gateway-preview__endpoint code { flex: 1; color: #3c4658; font-size: 11px; }.gateway-preview__endpoint strong { color: #159064; font-size: 10px; }
.gateway-preview__metrics { display: grid; grid-template-columns: 1.3fr .8fr .7fr; padding: 0 16px 16px; border-bottom: 1px solid rgba(71,85,105,.1); }.gateway-preview__metrics div { display: flex; flex-direction: column; gap: 4px; padding: 0 10px; border-right: 1px solid rgba(71,85,105,.1); }.gateway-preview__metrics div:first-child { padding-left: 0; }.gateway-preview__metrics div:last-child { border: 0; }.gateway-preview__metrics span { color: #929aaa; font-size: 9px; }.gateway-preview__metrics strong { overflow: hidden; color: #343d4f; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.gateway-preview__routes { padding: 8px 16px 12px; }.route-row { display: grid; grid-template-columns: 30px minmax(0,1fr) auto; align-items: center; gap: 10px; padding: 9px; border-radius: 8px; color: #4c5668; }.route-row--active { background: #f0f7f3; }.route-row__icon { width: 28px; height: 28px; display: grid; place-items: center; border: 1px solid rgba(71,85,105,.13); border-radius: 7px; background: white; color: #276b53; font-size: 9px; font-weight: 800; }.route-row div { display: flex; flex-direction: column; gap: 2px; }.route-row strong { font-size: 10px; }.route-row small { color: #969dac; font-size: 8px; }.route-row__state { color: #7d8698; font-size: 8px; }.route-row--active .route-row__state { color: #159064; font-weight: 700; }
.gateway-preview__footer { border-top: 1px solid rgba(71,85,105,.1); border-bottom: 0; }.mini-bars { height: 20px; display: flex; align-items: flex-end; gap: 3px; }.mini-bars i { width: 4px; border-radius: 2px; background: #8bc3a7; }.mini-bars i:nth-child(1){height:7px}.mini-bars i:nth-child(2){height:12px}.mini-bars i:nth-child(3){height:9px}.mini-bars i:nth-child(4){height:17px}.mini-bars i:nth-child(5){height:13px}.mini-bars i:nth-child(6){height:19px}
.capability-band { border-top: 1px solid rgba(71,85,105,.12); border-bottom: 1px solid rgba(71,85,105,.12); background: rgba(255,253,245,.48); }.capability-band__intro, .capability-grid { max-width: 1280px; margin: 0 auto; padding-inline: 28px; }.capability-band__intro { padding-top: 68px; }.capability-band__intro p { margin: 0 0 8px; color: #276b53; font-size: 10px; font-weight: 800; text-transform: uppercase; }.capability-band__intro h2 { margin: 0; font-size: 27px; }.capability-grid { display: grid; grid-template-columns: repeat(3,1fr); padding-top: 36px; padding-bottom: 72px; }.capability-grid article { position: relative; padding: 28px 32px 8px 0; border-right: 1px solid rgba(71,85,105,.12); }.capability-grid article + article { padding-left: 32px; }.capability-grid article:last-child { border: 0; }.capability-index { position: absolute; top: 0; right: 18px; color: #c0c6d1; font-family: var(--font-mono); font-size: 10px; }.capability-grid svg { color: #276b53; }.capability-grid h3 { margin: 18px 0 8px; font-size: 16px; }.capability-grid p { margin: 0; color: #778093; font-size: 12px; line-height: 1.7; }
.home-cta { max-width: 1224px; margin: 72px auto; padding: 36px 42px; display: flex; align-items: center; justify-content: space-between; gap: 30px; border: 1px solid rgba(39,107,83,.16); border-radius: 14px; background: #edf6f0; }.home-cta > div > span { color: #276b53; font-size: 10px; font-weight: 800; }.home-cta h2 { margin: 6px 0; font-size: 24px; }.home-cta p { margin: 0; color: #697387; font-size: 12px; }
.public-footer { max-width: 1280px; margin: 0 auto; padding: 26px 28px 34px; display: flex; justify-content: space-between; border-top: 1px solid rgba(71,85,105,.12); color: #8a92a2; font-size: 10px; }.public-footer div { display: flex; gap: 16px; }.public-footer strong { color: #465064; }.public-footer a:hover { color: #276b53; }
.dark .public-home { background: #111827; color: #e5e7eb; }.dark .public-nav { border-color: rgba(148,163,184,.12); background: rgba(17,24,39,.88); }.dark .public-brand, .dark .home-hero h1, .dark .capability-grid h3, .dark .capability-band__intro h2, .dark .home-cta h2 { color: #f1f5f9; }.dark .public-brand__mark, .dark .icon-control, .dark .mobile-toggle, .dark .home-button--secondary, .dark .gateway-preview { border-color: rgba(148,163,184,.16); background: #182132; }.dark .gateway-preview__bar strong, .dark .gateway-preview__metrics strong, .dark .route-row { color: #d7deea; }.dark .gateway-preview__endpoint { border-color: rgba(148,163,184,.14); background: #111827; }.dark .route-row--active, .dark .home-cta { background: rgba(39,107,83,.12); }.dark .route-row__icon { border-color: rgba(148,163,184,.15); background: #202b3d; }.dark .capability-band { border-color: rgba(148,163,184,.12); background: rgba(24,33,50,.45); }
.mobile-menu-enter-active,.mobile-menu-leave-active { transition: opacity .18s ease, transform .18s ease; }.mobile-menu-enter-from,.mobile-menu-leave-to { opacity: 0; transform: translateY(-8px); }
@keyframes preview-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@media (max-width: 900px) { .public-nav__links { display:none }.mobile-toggle { display:grid }.home-hero { grid-template-columns:1fr; gap:48px; padding-top:52px }.home-hero__copy { max-width:700px }.gateway-preview { max-width:650px; width:100%; }.capability-grid { grid-template-columns:1fr }.capability-grid article,.capability-grid article + article { padding:26px 0; border-right:0; border-bottom:1px solid rgba(71,85,105,.12) }.capability-grid article:last-child { border-bottom:0 }.capability-index { top:26px; right:0 }.home-cta { margin-inline:28px }.public-mobile-menu { display:flex; flex-direction:column; gap:3px; padding:8px 20px 16px; border-top:1px solid rgba(71,85,105,.1); background:rgba(248,242,216,.96) }.public-mobile-menu > a { padding:10px; border-radius:8px; color:#536075; font-size:13px }.public-mobile-menu__tools { display:flex; align-items:center; justify-content:flex-end; gap:8px; padding:8px 8px 0 }.dark .public-mobile-menu { background:rgba(17,24,39,.97) } }
@media (max-width: 640px) { .public-nav__inner { height:62px; padding-inline:14px; gap:10px }.public-brand { max-width:150px; overflow:hidden }.public-brand > span:last-child { overflow:hidden; text-overflow:ellipsis; white-space:nowrap }.nav-account { padding:8px 10px }.home-hero { min-height:auto; padding:42px 16px 48px }.home-hero h1 { font-size:46px }.home-hero h2 { font-size:23px }.home-hero__copy > p { font-size:14px }.provider-line { flex-wrap:wrap }.gateway-preview__metrics { grid-template-columns:1fr 1fr }.gateway-preview__metrics div:nth-child(2) { border:0 }.gateway-preview__metrics div:last-child { display:none }.capability-band__intro,.capability-grid { padding-inline:16px }.home-cta { margin:48px 16px; padding:28px 22px; align-items:flex-start; flex-direction:column }.public-footer { padding-inline:16px; flex-direction:column; gap:14px }.public-footer div { flex-wrap:wrap } }
@media (prefers-reduced-motion: reduce) { .gateway-preview { animation:none } * { scroll-behavior:auto!important } }
</style>

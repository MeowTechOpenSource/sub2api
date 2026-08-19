<template>
  <div ref="dropdownRef" class="locale-switcher">
    <button
      type="button"
      class="locale-trigger"
      :disabled="switching"
      :title="currentLocale?.name"
      :aria-label="t('common.accessibility.languageMenu')"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      @click.stop="toggleDropdown"
    >
      <span class="locale-trigger__mark">{{ localeMark(currentLocaleCode) }}</span>
      <span class="locale-trigger__code">{{ currentLocaleCode.toUpperCase() }}</span>
      <Icon name="chevronDown" size="xs" :class="{ 'rotate-180': isOpen }" />
    </button>

    <Transition name="locale-popover">
      <div v-if="isOpen" class="locale-popover" role="menu">
        <p class="locale-popover__label">{{ t('common.accessibility.languageMenu') }}</p>
        <button
          v-for="localeOption in availableLocales"
          :key="localeOption.code"
          type="button"
          role="menuitemradio"
          class="locale-option"
          :class="{ 'locale-option--active': localeOption.code === currentLocaleCode }"
          :aria-checked="localeOption.code === currentLocaleCode"
          :disabled="switching"
          @click="selectLocale(localeOption.code)"
        >
          <span class="locale-option__mark">{{ localeMark(localeOption.code) }}</span>
          <span class="locale-option__copy">
            <strong>{{ localeOption.name }}</strong>
            <small>{{ localeOption.code }}</small>
          </span>
          <Icon v-if="localeOption.code === currentLocaleCode" name="check" size="sm" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import { availableLocales, setLocale } from '@/i18n'

const { locale, t } = useI18n()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const switching = ref(false)
const currentLocaleCode = computed(() => locale.value)
const currentLocale = computed(() => availableLocales.find((item) => item.code === locale.value))

function localeMark(code: string) {
  if (code === 'zh') return '简'
  if (code === 'zhTW') return '繁'
  return 'EN'
}

function toggleDropdown() { isOpen.value = !isOpen.value }

async function selectLocale(code: string) {
  if (switching.value || code === currentLocaleCode.value) {
    isOpen.value = false
    return
  }
  switching.value = true
  try {
    await setLocale(code)
    isOpen.value = false
  } finally {
    switching.value = false
  }
}

function handleClickOutside(event: MouseEvent) {
  if (!dropdownRef.value?.contains(event.target as Node)) isOpen.value = false
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') isOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.locale-switcher { position:relative; }
.locale-trigger { height:36px; display:flex; align-items:center; gap:6px; padding:3px 8px 3px 4px; border:1px solid transparent; border-radius:9px; background:transparent; color:#687083; font-size:10px; font-weight:700; transition:transform .18s ease,background-color .18s ease,border-color .18s ease,box-shadow .18s ease; transform-style:preserve-3d; }
.locale-trigger:hover,.locale-trigger[aria-expanded='true'] { border-color:var(--line); background:color-mix(in srgb,var(--surface) 88%,transparent); color:#276b53; box-shadow:0 7px 18px rgba(32,86,68,.1); transform:translate3d(0,-1px,5px); }
.locale-trigger__mark { min-width:28px; height:28px; display:grid; place-items:center; border-radius:7px; background:#f0f7f3; color:#205644; font-size:10px; font-weight:800; }.locale-trigger__code { font-size:9px; }.locale-trigger :deep(svg) { transition:transform .18s ease; }
.locale-popover { position:absolute; z-index:112; top:calc(100% + 9px); right:0; width:196px; padding:7px; border:1px solid var(--line); border-radius:11px; background:color-mix(in srgb,var(--surface) 96%,transparent); box-shadow:0 14px 38px rgba(35,39,31,.14); backdrop-filter:blur(20px); transform-origin:top right; }
.locale-popover__label { margin:1px 4px 6px; padding:5px 6px 8px; border-bottom:1px solid var(--line); color:#8a94a6; font-size:9px; font-weight:750; text-transform:uppercase; }
.locale-option { width:100%; display:flex; align-items:center; gap:9px; padding:8px; border:0; border-radius:8px; background:transparent; color:var(--ink); text-align:left; transition:background-color .16s ease,transform .16s ease; }.locale-option:hover { background:var(--surface-muted); transform:translateX(2px); }.locale-option--active { background:#f0f7f3; color:#205644; }
.locale-option__mark { width:30px; height:30px; flex:0 0 auto; display:grid; place-items:center; border:1px solid var(--line); border-radius:7px; background:var(--surface); font-size:10px; font-weight:800; }.locale-option__copy { min-width:0; flex:1; display:flex; flex-direction:column; gap:1px; }.locale-option__copy strong { font-size:11px; }.locale-option__copy small { color:#8a94a6; font-size:8px; text-transform:uppercase; }
.locale-popover-enter-active,.locale-popover-leave-active { transition:opacity .17s ease,transform .17s cubic-bezier(.22,1,.36,1); }.locale-popover-enter-from,.locale-popover-leave-to { opacity:0; transform:translateY(-4px) scale(.985); }
.dark .locale-trigger__mark,.dark .locale-option--active { background:rgba(39,107,83,.14); color:#8bc3a7; }
@media(max-width:640px){.locale-trigger__code{display:none}.locale-popover{position:fixed;top:76px;right:12px;left:12px;width:auto}}
@media(prefers-reduced-motion:reduce){.locale-trigger,.locale-option,.locale-popover-enter-active,.locale-popover-leave-active{transition-duration:1ms}}
</style>

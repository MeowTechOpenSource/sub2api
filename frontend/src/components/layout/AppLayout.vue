<template>
  <div class="app-shell min-h-screen dark:bg-dark-950">
    <AppTopNav v-if="!hideNav" />
    <main class="app-shell__content" :class="{ 'app-shell__content--full': hideNav }">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import '@/styles/onboarding.css'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingTour } from '@/composables/useOnboardingTour'
import { useOnboardingStore } from '@/stores/onboarding'
import AppTopNav from './AppTopNav.vue'

withDefaults(defineProps<{ hideNav?: boolean }>(), { hideNav: false })

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')

const { replayTour } = useOnboardingTour({
  storageKey: isAdmin.value ? 'admin_guide' : 'user_guide',
  autoStart: true
})

const onboardingStore = useOnboardingStore()

onMounted(() => {
  onboardingStore.setReplayCallback(replayTour)
})

defineExpose({ replayTour })
</script>

<style scoped>
.app-shell { background: #f8f2d8; color: #29271f; }
.app-shell__content { width: 100%; max-width: 1500px; min-height: calc(100vh - 68px); margin: 0 auto; padding: 28px; }
.app-shell__content--full { max-width: none; min-height: 100vh; padding: 0; }
.dark .app-shell { background: #161815; color: #f2efe4; }
@media (max-width: 768px) { .app-shell__content { padding: 18px 12px 28px; } .app-shell__content--full { padding: 0; } }
</style>

<template>
  <AppLayout>
    <main class="mx-auto max-w-xl px-4 py-12">
      <section class="border border-slate-200 bg-white p-8 shadow-sm">
        <p class="text-sm font-medium text-emerald-700">{{ t('carpool.eyebrow') }}</p>
        <h1 class="mt-2 text-2xl font-semibold text-slate-900">{{ t('carpool.title') }}</h1>
        <p class="mt-3 text-sm leading-6 text-slate-600">{{ statusMessage }}</p>
        <p v-if="errorMessage" class="mt-4 border-l-4 border-rose-500 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {{ errorMessage }}
        </p>
      </section>
    </main>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import { createLoginTicket } from '@/api/carpool'

const route = useRoute()
const { t } = useI18n()
const errorMessage = ref('')
const connecting = ref(true)

const statusMessage = computed(() => {
  if (errorMessage.value) return t('carpool.failed')
  return connecting.value ? t('carpool.connecting') : t('carpool.redirecting')
})

onMounted(async () => {
  const portalId = typeof route.query.portal_id === 'string' ? route.query.portal_id : ''
  const returnTo = typeof route.query.return_to === 'string' ? route.query.return_to : ''
  if (!portalId || !returnTo) {
    errorMessage.value = t('carpool.invalidLink')
    connecting.value = false
    return
  }

  try {
    const ticket = await createLoginTicket(portalId, returnTo)
    // The API accepts this exact URL only after matching the portal's configured allowlist.
    const target = new URL(returnTo)
    target.searchParams.set('ticket', ticket.ticket)
    window.location.assign(target.toString())
  } catch {
    errorMessage.value = t('carpool.failed')
    connecting.value = false
  }
})
</script>

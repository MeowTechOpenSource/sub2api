<template>
  <section class="rounded-xl border border-amber-200/70 bg-amber-50/70 p-4 shadow-sm dark:border-amber-700/40 dark:bg-amber-950/20" data-tour="group-form-happy-hour">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ t('admin.groups.peakRate.title') }}</h3>
        <p class="mt-1 max-w-2xl text-xs leading-5 text-gray-600 dark:text-gray-400">{{ t('admin.groups.peakRate.description') }}</p>
      </div>
      <button type="button" class="btn btn-secondary btn-sm" @click="addEvent">
        <Icon name="plus" size="sm" />
        {{ t('admin.groups.peakRate.addEvent') }}
      </button>
    </div>

    <p v-if="model.length === 0" class="mt-4 rounded-lg border border-dashed border-amber-300/70 px-3 py-5 text-center text-xs text-gray-500 dark:border-amber-700/40 dark:text-gray-400">
      {{ t('admin.groups.peakRate.noEvents') }}
    </p>

    <div v-else class="mt-4 grid gap-3 border-t border-amber-200/70 pt-4 dark:border-amber-700/30">
      <div v-for="(event, index) in model" :key="index" class="rounded-lg border border-black/5 bg-white/65 p-3 dark:border-white/10 dark:bg-black/10">
        <div class="mb-3 flex items-center gap-3">
          <input v-model="event.enabled" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" :aria-label="t('admin.groups.peakRate.enableEvent')" />
          <input v-model.trim="event.name" type="text" class="input min-w-0 flex-1" :placeholder="t('admin.groups.peakRate.eventName')" required />
          <button type="button" class="btn btn-ghost btn-icon" :title="t('admin.groups.peakRate.removeEvent')" @click="removeEvent(index)">
            <Icon name="trash" size="sm" />
          </button>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label class="input-label">{{ t('admin.groups.peakRate.peakStart') }}</label>
            <input v-model="event.start" type="time" class="input" required />
          </div>
          <div>
            <label class="input-label">{{ t('admin.groups.peakRate.peakEnd') }}</label>
            <input v-model="event.end" type="time" class="input" required />
          </div>
          <div>
            <label class="input-label">{{ t('admin.groups.peakRate.peakMultiplier') }}</label>
            <input v-model.number="event.rate_multiplier" type="number" step="0.001" min="0" class="input" required />
            <p class="input-hint">{{ t('admin.groups.peakRate.multiplierHint') }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import type { HappyHourEvent } from '@/types'

const model = defineModel<HappyHourEvent[]>({ default: () => [] })
const { t } = useI18n()

const addEvent = () => model.value.push({ name: '', enabled: true, start: '09:00', end: '10:00', rate_multiplier: 1 })
const removeEvent = (index: number) => model.value.splice(index, 1)
</script>

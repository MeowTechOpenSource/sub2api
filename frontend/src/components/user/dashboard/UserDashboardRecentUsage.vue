<template>
  <div class="usage-panel">
    <div class="usage-panel__header">
      <h2>{{ t('dashboard.recentUsage') }}</h2>
      <span class="badge badge-gray">{{ t('dashboard.last7Days') }}</span>
    </div>
    <div class="p-6">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
      <div v-else-if="data.length === 0" class="py-8">
        <EmptyState :title="t('dashboard.noUsageRecords')" :description="t('dashboard.startUsingApi')" />
      </div>
      <div v-else class="usage-list">
        <div v-for="log in data" :key="log.id" class="usage-row">
          <div class="flex items-center gap-4">
            <div class="usage-row__icon">
              <Icon name="beaker" size="md" class="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ log.model }}</p>
              <p class="text-xs text-gray-500 dark:text-dark-400">{{ formatDateTime(log.created_at) }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold">
              <span class="text-green-600 dark:text-green-400" :title="t('dashboard.actual')">{{ formatCurrency(log.actual_cost) }}</span>
              <span class="font-normal text-gray-400 dark:text-gray-500" :title="t('dashboard.standard')"> / {{ formatCurrency(log.total_cost) }}</span>
            </p>
            <p class="text-xs text-gray-500 dark:text-dark-400">{{ (log.input_tokens + log.output_tokens).toLocaleString() }} tokens</p>
          </div>
        </div>

        <router-link to="/usage" class="flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          {{ t('dashboard.viewAllUsage') }}
          <Icon name="arrowRight" size="sm" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import Icon from '@/components/icons/Icon.vue'
import { formatCurrency, formatDateTime } from '@/utils/format'
import type { UsageLog } from '@/types'

defineProps<{
  data: UsageLog[]
  loading: boolean
}>()
const { t } = useI18n()
</script>

<style scoped>
.usage-panel { border:1px solid var(--line); border-radius:12px; background:var(--surface); box-shadow:var(--shadow-panel); overflow:hidden; }.usage-panel__header { display:flex; align-items:center; justify-content:space-between; padding:15px 17px; border-bottom:1px solid var(--line); }.usage-panel__header h2 { margin:0; font-size:14px; }
.usage-list { margin:-8px 0; }.usage-row { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px 4px; border-bottom:1px solid var(--line); transition:background .16s ease; }.usage-row:last-child { border:0; }.usage-row:hover { background:rgba(39,107,83,.035); }.usage-row__icon { width:34px; height:34px; display:grid; place-items:center; border:1px solid rgba(39,107,83,.12); border-radius:8px; background:rgba(39,107,83,.06); }
@media(max-width:520px){.usage-row{align-items:flex-start}.usage-row__icon{display:none}}
</style>

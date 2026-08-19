<template>
  <div class="command-panel">
    <div class="command-panel__header">
      <h2>{{ t('dashboard.quickActions') }}</h2>
    </div>
    <div class="command-panel__body">
      <button @click="router.push('/keys')" class="command-row group">
        <div class="command-row__icon">
          <Icon name="key" size="md" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('dashboard.createApiKey') }}</p>
          <p class="text-xs text-gray-500 dark:text-dark-400">{{ t('dashboard.generateNewKey') }}</p>
        </div>
        <Icon
          name="chevronRight"
          size="md"
          class="text-gray-400 transition-colors group-hover:text-primary-500 dark:text-dark-500"
        />
      </button>

      <button @click="router.push('/usage')" class="command-row group">
        <div class="command-row__icon">
          <Icon name="chart" size="md" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('dashboard.viewUsage') }}</p>
          <p class="text-xs text-gray-500 dark:text-dark-400">{{ t('dashboard.checkDetailedLogs') }}</p>
        </div>
        <Icon
          name="chevronRight"
          size="md"
          class="text-gray-400 transition-colors group-hover:text-emerald-500 dark:text-dark-500"
        />
      </button>

      <button v-if="canUseBatchImage" @click="router.push('/batch-image')" class="command-row group">
        <div class="command-row__icon">
          <Icon name="sparkles" size="md" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('dashboard.batchImageAgent') }}</p>
          <p class="text-xs text-gray-500 dark:text-dark-400">{{ t('dashboard.batchImageAgentDesc') }}</p>
        </div>
        <Icon
          name="chevronRight"
          size="md"
          class="text-gray-400 transition-colors group-hover:text-sky-500 dark:text-dark-500"
        />
      </button>

      <button @click="router.push('/redeem')" class="command-row group">
        <div class="command-row__icon">
          <Icon name="gift" size="md" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('dashboard.redeemCode') }}</p>
          <p class="text-xs text-gray-500 dark:text-dark-400">{{ t('dashboard.addBalanceWithCode') }}</p>
        </div>
        <Icon
          name="chevronRight"
          size="md"
          class="text-gray-400 transition-colors group-hover:text-amber-500 dark:text-dark-500"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import { useBatchImageAccess } from '@/composables/useBatchImageAccess'
const router = useRouter()
const { t } = useI18n()
const { canUseBatchImage, refreshBatchImageAccess } = useBatchImageAccess()

onMounted(() => {
  void refreshBatchImageAccess()
})
</script>

<style scoped>
.command-panel { height:100%; border:1px solid var(--line); border-radius:12px; background:var(--surface); box-shadow:var(--shadow-panel); overflow:hidden; }
.command-panel__header { padding:15px 17px; border-bottom:1px solid var(--line); }.command-panel__header h2 { margin:0; font-size:14px; }
.command-panel__body { padding:7px; }.command-row { width:100%; display:flex; align-items:center; gap:11px; padding:10px; border:0; border-radius:9px; background:transparent; text-align:left; transition:background .16s ease, transform .16s ease; }.command-row:hover { background:#f0f7f3; transform:translateX(2px); }
.command-row__icon { width:34px; height:34px; flex:0 0 auto; display:grid; place-items:center; border:1px solid rgba(39,107,83,.12); border-radius:8px; background:rgba(39,107,83,.06); color:#276b53; }.command-row :deep(.h-5) { color:#276b53; }
.dark .command-row:hover { background:rgba(39,107,83,.12); }
</style>

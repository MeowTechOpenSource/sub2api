<template>
  <BaseDialog
    :show="show"
    :title="t('admin.users.bulkLimits.title')"
    width="normal"
    @close="emit('close')"
  >
    <form id="bulk-edit-user-limits-form" class="bulk-limits" @submit.prevent="handleSubmit">
      <div class="bulk-limits__summary">
        <span class="bulk-limits__summary-icon"><Icon name="users" size="sm" /></span>
        <div>
          <strong>{{ t('admin.users.bulkLimits.selectedCount', { count: selectedIds.length }) }}</strong>
          <span>{{ t('admin.users.bulkLimits.title') }}</span>
        </div>
      </div>

      <div class="bulk-limits__settings">
        <div class="bulk-limits__setting" :class="{ 'bulk-limits__setting--active': enableConcurrency }">
          <div class="flex items-center justify-between gap-4">
            <label for="bulk-concurrency" class="input-label mb-0">
              {{ t('admin.users.columns.concurrency') }}
            </label>
            <Toggle
              v-model="enableConcurrency"
              :aria-label="t('admin.users.bulkLimits.enableConcurrency')"
              data-test="enable-concurrency"
            />
          </div>
          <input
            v-if="enableConcurrency"
            id="bulk-concurrency"
            v-model="concurrencyValue"
            type="number"
            min="0"
            step="1"
            class="input"
            data-test="concurrency-input"
          />
        </div>

        <div class="bulk-limits__setting" :class="{ 'bulk-limits__setting--active': enableRPMLimit }">
          <div class="flex items-center justify-between gap-4">
            <label for="bulk-rpm-limit" class="input-label mb-0">
              {{ t('admin.users.form.rpmLimit') }}
            </label>
            <Toggle
              v-model="enableRPMLimit"
              :aria-label="t('admin.users.bulkLimits.enableRPMLimit')"
              data-test="enable-rpm-limit"
            />
          </div>
          <div v-if="enableRPMLimit">
            <input
              id="bulk-rpm-limit"
              v-model="rpmLimitValue"
              type="number"
              min="0"
              step="1"
              class="input"
              data-test="rpm-limit-input"
            />
            <p v-if="parsedRPMLimit === 0" class="input-hint">
              {{ t('admin.users.bulkLimits.unlimited') }}
            </p>
          </div>
        </div>
      </div>

      <p v-if="hasInvalidValue" class="text-sm text-red-600 dark:text-red-400">
        {{ t('admin.users.bulkLimits.nonNegativeInteger') }}
      </p>
      <p v-if="selectionTooLarge" class="text-sm text-red-600 dark:text-red-400">
        {{ t('admin.users.bulkLimits.selectionLimit', { max: MAX_BATCH_USER_IDS }) }}
      </p>
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button type="button" class="btn btn-secondary" @click="emit('close')">
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          form="bulk-edit-user-limits-form"
          class="btn btn-primary"
          :disabled="!canSubmit"
          data-test="submit"
        >
          {{ submitting ? t('admin.users.bulkLimits.applying') : t('admin.users.bulkLimits.apply') }}
        </button>
      </div>
    </template>
  </BaseDialog>

  <ConfirmDialog
    :show="showOverwriteConfirm"
    :title="t('admin.users.bulkLimits.title')"
    :message="overwriteConfirmMessage"
    :confirm-text="t('admin.users.bulkLimits.apply')"
    @confirm="confirmSubmit"
    @cancel="cancelConfirm"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { adminAPI } from '@/api/admin'
import type { BatchUpdateUserLimitsRequest } from '@/api/admin/users'
import { useAppStore } from '@/stores/app'
import BaseDialog from '@/components/common/BaseDialog.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import Toggle from '@/components/common/Toggle.vue'
import Icon from '@/components/icons/Icon.vue'

const props = defineProps<{
  show: boolean
  selectedIds: number[]
}>()

const emit = defineEmits<{
  close: []
  success: [affected: number]
}>()

const { t } = useI18n()
const appStore = useAppStore()
const enableConcurrency = ref(false)
const enableRPMLimit = ref(false)
const concurrencyValue = ref<string | number>('')
const rpmLimitValue = ref<string | number>('')
const submitting = ref(false)
const showOverwriteConfirm = ref(false)
const overwriteConfirmMessage = ref('')
const pendingRequest = ref<BatchUpdateUserLimitsRequest | null>(null)
const MAX_BATCH_USER_IDS = 500

const parseLimit = (value: string | number): number | null | undefined => {
  const trimmed = String(value).trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed) || parsed < 0) return null
  return parsed
}

const parsedConcurrency = computed(() =>
  enableConcurrency.value ? parseLimit(concurrencyValue.value) : undefined
)
const parsedRPMLimit = computed(() =>
  enableRPMLimit.value ? parseLimit(rpmLimitValue.value) : undefined
)
const hasInvalidValue = computed(() =>
  parsedConcurrency.value === null || parsedRPMLimit.value === null
)
const hasUpdate = computed(() =>
  (parsedConcurrency.value !== undefined && parsedConcurrency.value !== null)
  || (parsedRPMLimit.value !== undefined && parsedRPMLimit.value !== null)
)
const selectionTooLarge = computed(() => props.selectedIds.length > MAX_BATCH_USER_IDS)
const canSubmit = computed(() =>
  props.selectedIds.length > 0
  && !selectionTooLarge.value
  && hasUpdate.value
  && !hasInvalidValue.value
  && !submitting.value
)

const reset = () => {
  enableConcurrency.value = false
  enableRPMLimit.value = false
  concurrencyValue.value = ''
  rpmLimitValue.value = ''
  submitting.value = false
  showOverwriteConfirm.value = false
  overwriteConfirmMessage.value = ''
  pendingRequest.value = null
}

watch(
  () => props.show,
  (show) => {
    if (show) reset()
  }
)

const handleSubmit = () => {
  if (!canSubmit.value) return

  const request: BatchUpdateUserLimitsRequest = {
    user_ids: [...props.selectedIds],
    all: false
  }
  const fields: string[] = []
  if (parsedConcurrency.value !== undefined && parsedConcurrency.value !== null) {
    request.concurrency = parsedConcurrency.value
    fields.push(
      t('admin.users.bulkLimits.concurrencyValue', { value: parsedConcurrency.value })
    )
  }
  if (parsedRPMLimit.value !== undefined && parsedRPMLimit.value !== null) {
    request.rpm_limit = parsedRPMLimit.value
    fields.push(
      parsedRPMLimit.value === 0
        ? t('admin.users.bulkLimits.rpmUnlimitedValue')
        : t('admin.users.bulkLimits.rpmValue', { value: parsedRPMLimit.value })
    )
  }

  pendingRequest.value = request
  overwriteConfirmMessage.value = t('admin.users.bulkLimits.confirm', {
    count: props.selectedIds.length,
    fields: fields.join(', ')
  })
  showOverwriteConfirm.value = true
}

const cancelConfirm = () => {
  showOverwriteConfirm.value = false
  pendingRequest.value = null
}

const confirmSubmit = async () => {
  if (!pendingRequest.value || submitting.value) return

  submitting.value = true
  showOverwriteConfirm.value = false
  try {
    const result = await adminAPI.users.batchUpdateLimits(pendingRequest.value)
    appStore.showSuccess(
      t('admin.users.bulkLimits.success', { count: result.affected })
    )
    emit('success', result.affected)
    emit('close')
  } catch (error: any) {
    appStore.showError(
      error.response?.data?.message
      || error.response?.data?.detail
      || t('admin.users.bulkLimits.failed')
    )
  } finally {
    submitting.value = false
    pendingRequest.value = null
  }
}
</script>

<style scoped>
.bulk-limits { display:grid; gap:18px; }
.bulk-limits__summary { display:flex; align-items:center; gap:12px; padding:13px 14px; border:1px solid rgba(39,107,83,.14); border-radius:11px; background:rgba(39,107,83,.055); }
.bulk-limits__summary-icon { width:36px; height:36px; flex:0 0 auto; display:grid; place-items:center; border-radius:9px; background:#276b53; color:#fff; }
.bulk-limits__summary strong,.bulk-limits__summary span { display:block; }.bulk-limits__summary strong { color:var(--ink); font-size:13px; }.bulk-limits__summary span { margin-top:2px; color:#85806f; font-size:10px; }
.bulk-limits__settings { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
.bulk-limits__setting { display:grid; align-content:start; gap:12px; min-height:118px; padding:14px; border:1px solid var(--line); border-radius:11px; background:color-mix(in srgb,var(--surface-muted) 60%,transparent); transition:border-color .18s ease,background .18s ease,transform .18s ease; }
.bulk-limits__setting--active { border-color:rgba(39,107,83,.28); background:rgba(39,107,83,.045); transform:translateY(-1px); }
.dark .bulk-limits__summary,.dark .bulk-limits__setting--active { background:rgba(39,107,83,.12); }
@media(max-width:580px){.bulk-limits__settings{grid-template-columns:1fr}.bulk-limits__setting{min-height:0}}
</style>

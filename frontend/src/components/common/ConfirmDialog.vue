<template>
  <BaseDialog :show="show" :title="title" width="narrow" @close="handleCancel">
    <div class="confirm-dialog">
      <span :class="['confirm-dialog__icon', danger ? 'confirm-dialog__icon--danger' : '']">
        <Icon :name="danger ? 'exclamationTriangle' : 'checkCircle'" size="md" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="confirm-dialog__message">{{ message }}</p>
        <div v-if="$slots.default" class="mt-4"><slot /></div>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-wrap justify-end gap-2">
        <button
          @click="handleCancel"
          type="button"
          class="btn btn-secondary"
        >
          {{ cancelText }}
        </button>
        <button
          @click="handleConfirm"
          type="button"
          :class="['btn', danger ? 'btn-danger' : 'btn-primary']"
        >
          {{ confirmText }}
        </button>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseDialog from './BaseDialog.vue'
import Icon from '@/components/icons/Icon.vue'

const { t } = useI18n()

interface Props {
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  danger: false
})

const confirmText = computed(() => props.confirmText || t('common.confirm'))
const cancelText = computed(() => props.cancelText || t('common.cancel'))

const emit = defineEmits<Emits>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.confirm-dialog { display:flex; align-items:flex-start; gap:13px; }
.confirm-dialog__icon { width:40px; height:40px; flex:0 0 auto; display:grid; place-items:center; border-radius:9px; background:#f0f7f3; color:#276b53; }
.confirm-dialog__icon--danger { background:#fef2f2; color:#dc2626; }
.confirm-dialog__message { margin:1px 0 0; color:var(--ink-muted); font-size:12px; line-height:1.7; overflow-wrap:anywhere; }
.dark .confirm-dialog__icon { background:rgba(39,107,83,.14); color:#8bc3a7; }.dark .confirm-dialog__icon--danger { background:rgba(220,38,38,.14); color:#fca5a5; }
</style>

<template>
  <Teleport to="body">
    <Transition name="auth-dialog">
      <div class="auth-dialog-backdrop" @click.self="!verifying && emit('cancel')">
        <div class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="totp-dialog-title">
        <!-- Header -->
        <div class="auth-dialog__header">
          <div class="auth-dialog__icon"><Icon name="shield" size="md" /></div>
          <div>
          <h3 id="totp-dialog-title">
            {{ t('profile.totp.loginTitle') }}
          </h3>
          <p>
            {{ t('profile.totp.loginHint') }}
          </p>
          <strong v-if="userEmailMasked">
            {{ userEmailMasked }}
          </strong>
          </div>
        </div>

        <!-- Code Input -->
        <div class="auth-dialog__body">
          <!-- Hidden input for password manager autofill (autocomplete="one-time-code") -->
          <input
            ref="hiddenOtpInputRef"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            class="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
            aria-hidden="true"
            tabindex="-1"
            @input="handleHiddenOtpInput"
          />
          <div class="otp-inputs">
            <input
              v-for="(_, index) in 6"
              :key="index"
              :ref="(el) => setInputRef(el, index)"
              type="text"
              maxlength="1"
              inputmode="numeric"
              pattern="[0-9]"
              autocomplete="off"
              class="otp-cell"
              :disabled="verifying"
              @input="handleCodeInput($event, index)"
              @keydown="handleKeydown($event, index)"
              @paste="handlePaste"
            />
          </div>
          <!-- Loading indicator -->
          <div v-if="verifying" class="otp-verifying">
            <div class="spinner"></div>
            {{ t('common.verifying') }}
          </div>
        </div>

        <div class="auth-dialog__footer">
          <span>{{ t('profile.totp.loginHint') }}</span>
          <button type="button" class="btn btn-secondary" :disabled="verifying" @click="emit('cancel')">{{ t('common.cancel') }}</button>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'
import Icon from '@/components/icons/Icon.vue'

defineProps<{
  tempToken: string
  userEmailMasked?: string
}>()

const emit = defineEmits<{
  verify: [code: string]
  cancel: []
}>()

const { t } = useI18n()
const appStore = useAppStore()

const verifying = ref(false)
const code = ref<string[]>(['', '', '', '', '', ''])
const inputRefs = ref<(HTMLInputElement | null)[]>([])
const hiddenOtpInputRef = ref<HTMLInputElement | null>(null)

// Watch for code changes and auto-submit when 6 digits are entered
watch(
  () => code.value.join(''),
  (newCode) => {
    if (newCode.length === 6 && !verifying.value) {
      emit('verify', newCode)
    }
  }
)

defineExpose({
  setVerifying: (value: boolean) => { verifying.value = value },
  setError: (message: string) => {
    if (message) {
      appStore.showError(message)
    }
    code.value = ['', '', '', '', '', '']
    // Clear input DOM values
    inputRefs.value.forEach(input => {
      if (input) input.value = ''
    })
    // Clear hidden autofill input
    if (hiddenOtpInputRef.value) {
      hiddenOtpInputRef.value.value = ''
    }
    nextTick(() => {
      inputRefs.value[0]?.focus()
    })
  }
})

const setInputRef = (el: any, index: number) => {
  inputRefs.value[index] = el as HTMLInputElement | null
}

const handleCodeInput = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/[^0-9]/g, '')
  code.value[index] = value

  if (value && index < 5) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus()
    })
  }
}

// Handle autofill from password managers via the hidden autocomplete="one-time-code" input
const handleHiddenOtpInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const digits = input.value.replace(/[^0-9]/g, '').slice(0, 6).split('')

  digits.forEach((digit, i) => {
    code.value[i] = digit
    if (inputRefs.value[i]) {
      inputRefs.value[i]!.value = digit
    }
  })

  for (let i = digits.length; i < 6; i++) {
    code.value[i] = ''
    if (inputRefs.value[i]) {
      inputRefs.value[i]!.value = ''
    }
  }
}

const handleKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Backspace') {
    const input = event.target as HTMLInputElement
    // If current cell is empty and not the first, move to previous cell
    if (!input.value && index > 0) {
      event.preventDefault()
      inputRefs.value[index - 1]?.focus()
    }
    // Otherwise, let the browser handle the backspace naturally
    // The input event will sync code.value via handleCodeInput
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text') || ''
  const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 6).split('')

  // Update both the ref and the input elements
  digits.forEach((digit, index) => {
    code.value[index] = digit
    if (inputRefs.value[index]) {
      inputRefs.value[index]!.value = digit
    }
  })

  // Clear remaining inputs if pasted less than 6 digits
  for (let i = digits.length; i < 6; i++) {
    code.value[i] = ''
    if (inputRefs.value[i]) {
      inputRefs.value[i]!.value = ''
    }
  }

  const focusIndex = Math.min(digits.length, 5)
  nextTick(() => {
    inputRefs.value[focusIndex]?.focus()
  })
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  nextTick(() => {
    inputRefs.value[0]?.focus()
  })
})

onBeforeUnmount(() => document.removeEventListener('keydown', handleEscape))

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && !verifying.value) emit('cancel')
}
</script>

<style scoped>
.auth-dialog-backdrop { position:fixed; inset:0; z-index:150; display:grid; place-items:center; padding:16px; overflow-y:auto; background:rgba(15,23,42,.58); backdrop-filter:blur(8px); }
.auth-dialog { width:min(100%,450px); border:1px solid var(--line); border-radius:14px; background:var(--surface); box-shadow:0 30px 80px rgba(15,23,42,.25); overflow:hidden; }.auth-dialog__header { display:flex; align-items:flex-start; gap:13px; padding:20px 20px 18px; border-bottom:1px solid var(--line); }.auth-dialog__icon { width:40px; height:40px; flex:0 0 auto; display:grid; place-items:center; border:1px solid rgba(39,107,83,.14); border-radius:9px; background:#f0f7f3; color:#276b53; }.auth-dialog__header h3 { margin:0; font-size:17px; }.auth-dialog__header p { margin:5px 0 0; color:#7b8496; font-size:11px; line-height:1.5; }.auth-dialog__header strong { display:block; margin-top:4px; color:#465064; font-size:10px; }
.auth-dialog__body { padding:26px 20px; }.otp-inputs { display:grid; grid-template-columns:repeat(6,44px); justify-content:center; gap:8px; }.otp-cell { width:44px; height:52px; padding:0; border:1px solid var(--line); border-radius:9px; background:var(--surface-muted); color:var(--ink); font-family:var(--font-mono); font-size:20px; font-weight:700; text-align:center; }.otp-cell:focus { border-color:#276b53; background:var(--surface); box-shadow:0 0 0 3px rgba(39,107,83,.13); }.otp-verifying { display:flex; align-items:center; justify-content:center; gap:8px; margin-top:14px; color:#7b8496; font-size:11px; }
.auth-dialog__footer { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:13px 20px; border-top:1px solid var(--line); background:var(--surface-muted); }.auth-dialog__footer span { max-width:260px; color:#929aaa; font-size:9px; }.auth-dialog__footer .btn { flex:0 0 auto; padding:8px 13px; }
.dark .auth-dialog__icon { background:rgba(39,107,83,.13); }.dark .auth-dialog__header strong { color:#cbd5e1; }
.auth-dialog-enter-active,.auth-dialog-leave-active { transition:opacity .18s ease; }.auth-dialog-enter-active .auth-dialog,.auth-dialog-leave-active .auth-dialog { transition:transform .18s ease,opacity .18s ease; }.auth-dialog-enter-from,.auth-dialog-leave-to { opacity:0; }.auth-dialog-enter-from .auth-dialog,.auth-dialog-leave-to .auth-dialog { opacity:0; transform:translateY(8px) scale(.98); }
@media(max-width:440px){.otp-inputs{grid-template-columns:repeat(6,minmax(0,1fr));gap:5px}.otp-cell{width:100%;height:48px}.auth-dialog__footer span{display:none}.auth-dialog__footer{justify-content:flex-end}}
@media(prefers-reduced-motion:reduce){.auth-dialog-enter-active,.auth-dialog-leave-active,.auth-dialog-enter-active .auth-dialog,.auth-dialog-leave-active .auth-dialog{transition-duration:1ms}}
</style>

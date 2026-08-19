<template>
  <AuthLayout>
    <div class="login-panel">
      <!-- Title -->
      <div class="login-heading">
        <p class="login-heading__eyebrow">{{ t('auth.secureAccess') }}</p>
        <h2>
          {{ t('auth.welcomeBack') }}
        </h2>
        <p class="login-heading__description">
          {{ t('auth.signInToAccount') }}
        </p>
      </div>
      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form" novalidate>
        <div v-if="errorMessage" class="login-error" role="alert">
          <Icon name="exclamationCircle" size="sm" />
          <span>{{ errorMessage }}</span>
        </div>
        <!-- Email Input -->
        <div class="login-field">
          <label for="email" class="input-label">
            {{ t('auth.emailLabel') }}
          </label>
          <div class="login-input-wrap">
            <div class="login-input-icon">
              <Icon name="mail" size="md" class="text-gray-400 dark:text-dark-500" />
            </div>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              autofocus
              autocomplete="email"
              :disabled="authActionDisabled"
              class="input pl-11"
              :class="{ 'input-error': errors.email }"
              :placeholder="t('auth.emailPlaceholder')"
            />
          </div>
          <p v-if="errors.email" class="login-field__error">{{ errors.email }}</p>
        </div>

        <!-- Password Input -->
        <div class="login-field">
          <label for="password" class="input-label">
            {{ t('auth.passwordLabel') }}
          </label>
          <div class="login-input-wrap">
            <div class="login-input-icon">
              <Icon name="lock" size="md" class="text-gray-400 dark:text-dark-500" />
            </div>
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              :disabled="authActionDisabled"
              class="input pl-11 pr-11"
              :class="{ 'input-error': errors.password }"
              :placeholder="t('auth.passwordPlaceholder')"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              :disabled="authActionDisabled"
              class="login-password-toggle"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <Icon v-if="showPassword" name="eyeOff" size="md" />
              <Icon v-else name="eye" size="md" />
            </button>
          </div>
          <div class="login-field__meta">
            <p v-if="errors.password" class="login-field__error">{{ errors.password }}</p>
            <span v-else></span>
            <router-link
              v-if="passwordResetEnabled && !backendModeEnabled"
              to="/forgot-password"
              class="login-forgot-link"
            >
              {{ t('auth.forgotPassword') }}
            </router-link>
          </div>
        </div>

        <!-- Turnstile Widget -->
        <div v-if="captchaEnabled">
          <TurnstileWidget
            ref="turnstileRef"
            :turnstile-enabled="turnstileEnabled"
            :turnstile-site-key="turnstileSiteKey"
            :tencent-enabled="tencentCaptchaEnabled"
            :tencent-app-id="tencentCaptchaAppId"
            :tencent-region="tencentCaptchaRegion"
            :aliyun-enabled="aliyunCaptchaEnabled"
            :aliyun-scene-id="aliyunCaptchaSceneId"
            :aliyun-prefix="aliyunCaptchaPrefix"
            :aliyun-region="aliyunCaptchaRegion"
            @verify="onTurnstileVerify"
            @expire="onTurnstileExpire"
            @error="onTurnstileError"
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="authActionDisabled || (turnstileEnabled && !turnstileToken)"
          class="auth-submit"
        >
          <svg
            v-if="isLoading"
            class="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <Icon v-else name="login" size="md" class="mr-2" />
          {{ isLoading ? t('auth.signingIn') : t('auth.signIn') }}
        </button>

        <LoginAgreementPrompt
          v-if="loginAgreementEnabled"
          :accepted="agreementAccepted"
          :documents="loginAgreementDocuments"
          :mode="loginAgreementMode"
          :updated-at="loginAgreementUpdatedAt"
          :visible="showAgreementModal"
          @accept="acceptLoginAgreement"
          @reject="rejectLoginAgreement"
          @open="showAgreementModal = true"
        />

        <div v-if="showPasskeyLogin || showOAuthLogin" class="login-oauth">
          <div class="login-divider">
            <div></div>
            <span>
              {{ t('auth.oauthOrContinue') }}
            </span>
            <div></div>
          </div>

          <button
            v-if="showPasskeyLogin"
            type="button"
            class="btn btn-secondary w-full"
            :disabled="authActionDisabled"
            @click="handlePasskeyLogin"
          >
            <Icon name="key" size="md" class="mr-2" />
            {{ passkeyLoading ? t('auth.passkeySigningIn') : t('auth.passkeySignIn') }}
          </button>

          <EmailOAuthButtons
            :disabled="authActionDisabled"
            :github-enabled="githubOAuthEnabled"
            :google-enabled="googleOAuthEnabled"
            :show-divider="false"
            @start="handleOAuthStart"
          />

          <LinuxDoOAuthSection
            v-if="linuxdoOAuthEnabled"
            :disabled="authActionDisabled"
            :show-divider="false"
            @start="handleOAuthStart"
          />
          <DingTalkOAuthSection
            v-if="dingtalkOAuthEnabled"
            :disabled="authActionDisabled"
            :show-divider="false"
            @start="handleOAuthStart"
          />
          <WechatOAuthSection
            v-if="wechatOAuthEnabled"
            :disabled="authActionDisabled"
            :show-divider="false"
            @start="handleOAuthStart"
          />
          <OidcOAuthSection
            v-if="oidcOAuthEnabled"
            :disabled="authActionDisabled"
            :provider-name="oidcOAuthProviderName"
            :show-divider="false"
            @start="handleOAuthStart"
          />
        </div>
      </form>
    </div>

    <template #visual>
      <div class="login-brand-visual" aria-hidden="true">
        <div class="login-brand-visual__frame">
          <img :src="loginLogo" alt="" @error="loginLogoFailed = true" />
        </div>
      </div>
    </template>

    <!-- Footer -->
    <template v-if="!backendModeEnabled" #footer>
      <p class="text-gray-500 dark:text-dark-400">
        {{ t('auth.dontHaveAccount') }}
        <router-link
          to="/register"
          class="font-medium text-primary-600 transition-colors hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {{ t('auth.signUp') }}
        </router-link>
      </p>
    </template>
  </AuthLayout>

  <!-- 2FA Modal -->
  <TotpLoginModal
    v-if="show2FAModal"
    ref="totpModalRef"
    :temp-token="totpTempToken"
    :user-email-masked="totpUserEmailMasked"
    @verify="handle2FAVerify"
    @cancel="handle2FACancel"
  />
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { AuthLayout } from '@/components/layout'
import LinuxDoOAuthSection from '@/components/auth/LinuxDoOAuthSection.vue'
import DingTalkOAuthSection from '@/components/auth/DingTalkOAuthSection.vue'
import OidcOAuthSection from '@/components/auth/OidcOAuthSection.vue'
import WechatOAuthSection from '@/components/auth/WechatOAuthSection.vue'
import EmailOAuthButtons from '@/components/auth/EmailOAuthButtons.vue'
import LoginAgreementPrompt from '@/components/auth/LoginAgreementPrompt.vue'
import TotpLoginModal from '@/components/auth/TotpLoginModal.vue'
import Icon from '@/components/icons/Icon.vue'
import TurnstileWidget from '@/components/CaptchaChallenge.vue'
import { useAuthStore, useAppStore } from '@/stores'
import {
  buildOAuthLoginStartURL,
  getPublicSettings,
  isTotp2FARequired,
  isWeChatWebOAuthEnabled,
  startOAuthLogin,
  type OAuthLoginStart
} from '@/api/auth'
import type { ActionCaptchaRequestProof, LoginAgreementDocument, TotpLoginResponse } from '@/types'
import { extractI18nErrorMessage } from '@/utils/apiError'
import { clearAllAffiliateReferralCodes } from '@/utils/oauthAffiliate'
import { sanitizeUrl } from '@/utils/url'

const { t } = useI18n()
const LOGIN_AGREEMENT_STORAGE_KEY = 'sub2api_login_agreement_consent'

// ==================== Router & Stores ====================

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()
const loginLogoFailed = ref(false)
const loginLogo = computed(() => {
  if (loginLogoFailed.value) return '/logo.svg'
  return sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }) || '/logo.svg'
})

watch(() => appStore.siteLogo, () => {
  loginLogoFailed.value = false
})

// ==================== State ====================

const isLoading = ref<boolean>(false)
const passkeyLoading = ref<boolean>(false)
const errorMessage = ref<string>('')
const showPassword = ref<boolean>(false)
const publicSettingsLoaded = ref<boolean>(false)

// Public settings
const turnstileEnabled = ref<boolean>(false)
const turnstileSiteKey = ref<string>('')
const tencentCaptchaEnabled = ref<boolean>(false)
const tencentCaptchaAppId = ref<string>('')
const tencentCaptchaRegion = ref<string>('cn')
const aliyunCaptchaEnabled = ref<boolean>(false)
const aliyunCaptchaSceneId = ref<string>('')
const aliyunCaptchaPrefix = ref<string>('')
const aliyunCaptchaRegion = ref<string>('cn')
const linuxdoOAuthEnabled = ref<boolean>(false)
const dingtalkOAuthEnabled = ref<boolean>(false)
const wechatOAuthEnabled = ref<boolean>(false)
const backendModeEnabled = ref<boolean>(false)
const oidcOAuthEnabled = ref<boolean>(false)
const oidcOAuthProviderName = ref<string>('OIDC')
const githubOAuthEnabled = ref<boolean>(false)
const googleOAuthEnabled = ref<boolean>(false)
const passwordResetEnabled = ref<boolean>(false)
const passkeyEnabled = ref<boolean>(false)
const loginAgreementEnabled = ref<boolean>(false)
const loginAgreementMode = ref<'modal' | 'checkbox' | string>('modal')
const loginAgreementUpdatedAt = ref<string>('')
const loginAgreementRevision = ref<string>('')
const loginAgreementDocuments = ref<LoginAgreementDocument[]>([])
const agreementAccepted = ref<boolean>(false)
const showAgreementModal = ref<boolean>(false)

// Turnstile
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const turnstileToken = ref<string>('')
const tencentCaptchaRandstr = ref<string>('')
const aliyunCaptchaReady = computed(
  () => aliyunCaptchaEnabled.value && Boolean(aliyunCaptchaSceneId.value) && Boolean(aliyunCaptchaPrefix.value)
)
const actionCaptchaEnabled = computed(
  () => (tencentCaptchaEnabled.value && Boolean(tencentCaptchaAppId.value)) || aliyunCaptchaReady.value
)
const captchaEnabled = computed(
  () => (turnstileEnabled.value && Boolean(turnstileSiteKey.value)) || actionCaptchaEnabled.value
)

// 2FA state
const show2FAModal = ref<boolean>(false)
const totpTempToken = ref<string>('')
const totpUserEmailMasked = ref<string>('')
const totpModalRef = ref<InstanceType<typeof TotpLoginModal> | null>(null)

const formData = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: '',
  turnstile: ''
})

const validationToastMessage = computed(
  () => errors.email || errors.password || errors.turnstile || ''
)

const agreementGateActive = computed(
  () => loginAgreementEnabled.value && !agreementAccepted.value
)

const authActionDisabled = computed(
  () => isLoading.value || passkeyLoading.value || !publicSettingsLoaded.value || agreementGateActive.value
)

const showPasskeyLogin = computed(
  () => passkeyEnabled.value && typeof window.PublicKeyCredential !== 'undefined'
)

const showOAuthLogin = computed(
  () =>
    !backendModeEnabled.value &&
    (linuxdoOAuthEnabled.value ||
      dingtalkOAuthEnabled.value ||
      wechatOAuthEnabled.value ||
      oidcOAuthEnabled.value ||
      githubOAuthEnabled.value ||
      googleOAuthEnabled.value)
)

watch(validationToastMessage, (value, previousValue) => {
  if (value && value !== previousValue) {
    appStore.showError(value)
  }
})

// ==================== Lifecycle ====================

onMounted(async () => {
  const expiredFlag = sessionStorage.getItem('auth_expired')
  if (expiredFlag) {
    sessionStorage.removeItem('auth_expired')
    const message = t('auth.reloginRequired')
    errorMessage.value = message
    appStore.showWarning(message)
  }

  try {
    const settings = await getPublicSettings()
    turnstileEnabled.value = settings.turnstile_enabled
    turnstileSiteKey.value = settings.turnstile_site_key || ''
    tencentCaptchaEnabled.value = settings.tencent_captcha_enabled === true
    tencentCaptchaAppId.value = settings.tencent_captcha_app_id || ''
    tencentCaptchaRegion.value = settings.tencent_captcha_region || 'cn'
    aliyunCaptchaEnabled.value = settings.aliyun_captcha_enabled === true
    aliyunCaptchaSceneId.value = settings.aliyun_captcha_scene_id || ''
    aliyunCaptchaPrefix.value = settings.aliyun_captcha_prefix || ''
    aliyunCaptchaRegion.value = settings.aliyun_captcha_region || 'cn'
    linuxdoOAuthEnabled.value = settings.linuxdo_oauth_enabled
    dingtalkOAuthEnabled.value = settings.dingtalk_oauth_enabled ?? false
    wechatOAuthEnabled.value = isWeChatWebOAuthEnabled(settings)
    backendModeEnabled.value = settings.backend_mode_enabled
    oidcOAuthEnabled.value = settings.oidc_oauth_enabled
    oidcOAuthProviderName.value = settings.oidc_oauth_provider_name || 'OIDC'
    githubOAuthEnabled.value = settings.github_oauth_enabled
    googleOAuthEnabled.value = settings.google_oauth_enabled
    backendModeEnabled.value = settings.backend_mode_enabled
    passwordResetEnabled.value = settings.password_reset_enabled
    passkeyEnabled.value = settings.passkey_enabled === true
    applyLoginAgreementSettings(settings)
  } catch (error) {
    console.error('Failed to load public settings:', error)
    loginAgreementEnabled.value = false
    agreementAccepted.value = true
  } finally {
    publicSettingsLoaded.value = true
  }
})

// ==================== Login Agreement ====================

function applyLoginAgreementSettings(settings: {
  login_agreement_enabled?: boolean
  login_agreement_mode?: string
  login_agreement_updated_at?: string
  login_agreement_revision?: string
  login_agreement_documents?: LoginAgreementDocument[]
}): void {
  const documents = Array.isArray(settings.login_agreement_documents)
    ? settings.login_agreement_documents.filter((doc) => doc.title?.trim())
    : []
  loginAgreementDocuments.value = documents
  loginAgreementEnabled.value = settings.login_agreement_enabled === true && documents.length > 0
  loginAgreementMode.value = settings.login_agreement_mode === 'checkbox' ? 'checkbox' : 'modal'
  loginAgreementUpdatedAt.value = settings.login_agreement_updated_at || ''
  loginAgreementRevision.value =
    settings.login_agreement_revision ||
    `${loginAgreementUpdatedAt.value}:${documents.map((doc) => `${doc.id}:${doc.title}`).join('|')}`

  agreementAccepted.value = !loginAgreementEnabled.value || hasAcceptedLoginAgreement(loginAgreementRevision.value)
  showAgreementModal.value =
    loginAgreementEnabled.value && !agreementAccepted.value && loginAgreementMode.value !== 'checkbox'
}

function hasAcceptedLoginAgreement(revision: string): boolean {
  if (!revision) {
    return false
  }
  try {
    const raw = localStorage.getItem(LOGIN_AGREEMENT_STORAGE_KEY)
    if (!raw) {
      return false
    }
    const parsed = JSON.parse(raw) as { revision?: string }
    return parsed.revision === revision
  } catch {
    return false
  }
}

function acceptLoginAgreement(): void {
  if (loginAgreementRevision.value) {
    localStorage.setItem(
      LOGIN_AGREEMENT_STORAGE_KEY,
      JSON.stringify({
        revision: loginAgreementRevision.value,
        accepted_at: new Date().toISOString()
      })
    )
  }
  agreementAccepted.value = true
  showAgreementModal.value = false
}

function rejectLoginAgreement(): void {
  localStorage.removeItem(LOGIN_AGREEMENT_STORAGE_KEY)
  agreementAccepted.value = false
  showAgreementModal.value = false
  appStore.showWarning(t('legal.loginAgreementPrompt.loginRejectedWarning'))
}

// ==================== Turnstile Handlers ====================

function onTurnstileVerify(token: string, randstr = ''): void {
  turnstileToken.value = token
  tencentCaptchaRandstr.value = randstr
  errors.turnstile = ''
}

function onTurnstileExpire(): void {
  turnstileToken.value = ''
  tencentCaptchaRandstr.value = ''
  errors.turnstile = t('auth.turnstileExpired')
}

function onTurnstileError(): void {
  turnstileToken.value = ''
  tencentCaptchaRandstr.value = ''
  errors.turnstile = t('auth.turnstileFailed')
}

function resetCaptchaProof(): void {
  turnstileRef.value?.reset()
  turnstileToken.value = ''
  tencentCaptchaRandstr.value = ''
  errors.turnstile = ''
}

async function acquireActionProof(): Promise<boolean> {
  if (!actionCaptchaEnabled.value) return true
  const proof = await turnstileRef.value?.verifyAction()
  if (!proof) return false
  turnstileToken.value = proof.token
  tencentCaptchaRandstr.value = proof.randstr
  return true
}

// ==================== Validation ====================

function validateForm(): boolean {
  // Reset errors
  errors.email = ''
  errors.password = ''
  errors.turnstile = ''

  let isValid = true

  if (agreementGateActive.value) {
    appStore.showWarning(t('legal.loginAgreementPrompt.loginRequiredWarning'))
    if (loginAgreementMode.value !== 'checkbox') {
      showAgreementModal.value = true
    }
    return false
  }

  // Email validation
  if (!formData.email.trim()) {
    errors.email = t('auth.emailRequired')
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = t('auth.invalidEmail')
    isValid = false
  }

  // Password validation
  if (!formData.password) {
    errors.password = t('auth.passwordRequired')
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = t('auth.passwordMinLength')
    isValid = false
  }

  // Turnstile validation
  if (turnstileEnabled.value && !turnstileToken.value) {
    errors.turnstile = t('auth.completeVerification')
    isValid = false
  }

  return isValid
}

// ==================== Form Handlers ====================

async function handleLogin(): Promise<void> {
  // Clear previous error
  errorMessage.value = ''

  // Validate form
  if (!validateForm()) {
    return
  }

  if (!(await acquireActionProof())) return

  isLoading.value = true

  try {
    const response = await authStore.login({
      email: formData.email,
      password: formData.password,
      turnstile_token: turnstileEnabled.value || aliyunCaptchaEnabled.value ? turnstileToken.value : undefined,
      tencent_captcha_ticket: tencentCaptchaEnabled.value ? turnstileToken.value : undefined,
      tencent_captcha_randstr: tencentCaptchaEnabled.value ? tencentCaptchaRandstr.value : undefined
    })

    // Check if 2FA is required
    if (isTotp2FARequired(response)) {
      const totpResponse = response as TotpLoginResponse
      totpTempToken.value = totpResponse.temp_token || ''
      totpUserEmailMasked.value = totpResponse.user_email_masked || ''
      show2FAModal.value = true
      isLoading.value = false
      return
    }

    // Show success toast
    clearAllAffiliateReferralCodes()
    appStore.showSuccess(t('auth.loginSuccess'))

    // Redirect to dashboard or intended route
    const redirectTo = (router.currentRoute.value.query.redirect as string) || '/dashboard'
    await router.push(redirectTo)
  } catch (error: unknown) {
    errorMessage.value = extractI18nErrorMessage(error, t, 'auth.errors', t('auth.loginFailed'))

    // Also show error toast
    appStore.showError(errorMessage.value)
  } finally {
    if (captchaEnabled.value) resetCaptchaProof()
    isLoading.value = false
  }
}

async function handlePasskeyLogin(): Promise<void> {
  if (agreementGateActive.value) {
    appStore.showWarning(t('legal.loginAgreementPrompt.loginRequiredWarning'))
    if (loginAgreementMode.value !== 'checkbox') showAgreementModal.value = true
    return
  }

  passkeyLoading.value = true
  try {
    let proof: ActionCaptchaRequestProof | undefined
    if (actionCaptchaEnabled.value) {
      const result = await turnstileRef.value?.verifyAction()
      if (!result) return
      proof = tencentCaptchaEnabled.value
        ? { tencent_captcha_ticket: result.token, tencent_captcha_randstr: result.randstr }
        : { turnstile_token: result.token }
    }
    await authStore.loginWithPasskey(proof)
    clearAllAffiliateReferralCodes()
    appStore.showSuccess(t('auth.loginSuccess'))
    await router.push((router.currentRoute.value.query.redirect as string) || '/dashboard')
  } catch (error: unknown) {
    const fallback = error instanceof DOMException && error.name === 'NotAllowedError'
      ? t('auth.passkeyCancelled')
      : t('auth.passkeyFailed')
    errorMessage.value = extractI18nErrorMessage(error, t, 'auth.errors', fallback)
    appStore.showError(errorMessage.value)
  } finally {
    if (actionCaptchaEnabled.value) resetCaptchaProof()
    passkeyLoading.value = false
  }
}

async function handleOAuthStart(request: OAuthLoginStart): Promise<void> {
  if (authActionDisabled.value) return
  if (!actionCaptchaEnabled.value) {
    window.location.href = buildOAuthLoginStartURL(request)
    return
  }

  isLoading.value = true
  try {
    const proof = await turnstileRef.value?.verifyAction()
    if (!proof) return
    const result = await startOAuthLogin(
      request,
      tencentCaptchaEnabled.value
        ? { tencent_captcha_ticket: proof.token, tencent_captcha_randstr: proof.randstr }
        : { turnstile_token: proof.token }
    )
    window.location.href = result.authorize_url
  } catch (error: unknown) {
    errorMessage.value = extractI18nErrorMessage(error, t, 'auth.errors', t('auth.turnstileFailed'))
    appStore.showError(errorMessage.value)
  } finally {
    resetCaptchaProof()
    isLoading.value = false
  }
}

// ==================== 2FA Handlers ====================

async function handle2FAVerify(code: string): Promise<void> {
  if (totpModalRef.value) {
    totpModalRef.value.setVerifying(true)
  }

  try {
    await authStore.login2FA(totpTempToken.value, code)

    // Close modal and show success
    show2FAModal.value = false
    clearAllAffiliateReferralCodes()
    appStore.showSuccess(t('auth.loginSuccess'))

    // Redirect to dashboard or intended route
    const redirectTo = (router.currentRoute.value.query.redirect as string) || '/dashboard'
    await router.push(redirectTo)
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { data?: { message?: string } } }
    const message = err.response?.data?.message || err.message || t('profile.totp.loginFailed')

    if (totpModalRef.value) {
      totpModalRef.value.setError(message)
      totpModalRef.value.setVerifying(false)
    }
  }
}

function handle2FACancel(): void {
  show2FAModal.value = false
  totpTempToken.value = ''
  totpUserEmailMasked.value = ''
}
</script>

<style scoped>
.login-panel { width:100%; padding:34px; border:1px solid rgba(255,255,255,.8); border-radius:18px; background:color-mix(in srgb,var(--surface) 88%,transparent); box-shadow:0 1px 0 rgba(255,255,255,.74) inset,0 16px 42px rgba(48,54,43,.1); backdrop-filter:blur(18px); animation:login-panel-enter .52s cubic-bezier(.22,1,.36,1) both; }
.login-heading { margin-bottom:28px; }.login-heading__eyebrow { margin:0 0 7px; color:#276b53; font-size:10px; font-weight:800; text-transform:uppercase; }.login-heading h2 { margin:0; color:var(--ink); font-size:30px; font-weight:760; line-height:1.15; }.login-heading__description { margin:9px 0 0; color:#758094; font-size:13px; line-height:1.6; }
.login-form { display:flex; flex-direction:column; gap:18px; }.login-field { min-width:0; }.login-input-wrap { position:relative; isolation:isolate; }.login-input-wrap .input { min-height:50px; padding-inline-start:46px!important; border-radius:12px; background:color-mix(in srgb,var(--surface) 94%,transparent); font-size:13px; }.login-input-wrap .input.pr-11 { padding-inline-end:48px!important; }.login-input-wrap:focus-within .input { border-color:rgba(39,107,83,.48); }.login-input-icon { pointer-events:none; position:absolute; inset:0 auto 0 0; z-index:2; width:46px; display:grid; place-items:center; }.login-input-icon::after { content:''; position:absolute; right:0; width:1px; height:18px; background:var(--line); }.login-input-icon :deep(svg) { width:17px; height:17px; color:#7d8799; transition:color .18s ease,transform .18s ease; }.login-input-wrap:focus-within .login-input-icon :deep(svg) { color:#276b53; transform:translateY(-1px); }.login-password-toggle { position:absolute; inset:0 0 0 auto; z-index:2; width:46px; display:grid; place-items:center; border:0; border-radius:0 12px 12px 0; background:transparent; color:#7d8799; transition:color .16s ease,background-color .16s ease; }.login-password-toggle:hover { background:#f0f7f3; color:#276b53; }
.login-field__meta { min-height:22px; display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-top:5px; }.login-field__error { margin:0; color:#dc2626; font-size:10px; line-height:1.4; }.login-forgot-link { flex:0 0 auto; color:#276b53; font-size:11px; font-weight:700; }.login-forgot-link:hover { color:#205644; }
.login-error { display:flex; align-items:flex-start; gap:8px; padding:10px 12px; border:1px solid rgba(220,38,38,.16); border-radius:9px; background:#fef2f2; color:#b91c1c; font-size:11px; line-height:1.5; }.login-error :deep(svg) { flex:0 0 auto; margin-top:1px; }
.auth-submit { min-height:46px; display:flex; align-items:center; justify-content:center; padding:11px 16px; border:0; border-radius:10px; background:#276b53; color:white; font-size:13px; font-weight:750; box-shadow:0 9px 24px rgba(39,107,83,.18); transition:background .16s ease, transform .16s ease, box-shadow .16s ease; }.auth-submit:hover:not(:disabled) { background:#205644; transform:translateY(-1px); box-shadow:0 12px 28px rgba(39,107,83,.22); }.auth-submit:active:not(:disabled) { transform:translateY(0); }.auth-submit:disabled { cursor:not-allowed; opacity:.58; box-shadow:none; }
.login-oauth { display:flex; flex-direction:column; gap:12px; padding-top:2px; }.login-divider { display:flex; align-items:center; gap:11px; color:#8a94a6; font-size:9px; text-transform:uppercase; }.login-divider div { height:1px; flex:1; background:var(--line); }
.login-brand-visual { width:min(100%,390px); margin:38px 0 8px; animation:login-visual-enter .72s .08s cubic-bezier(.22,1,.36,1) both; }.login-brand-visual__frame { position:relative; width:min(74%,280px); aspect-ratio:1; margin-inline:auto; border:1px solid rgba(255,255,255,.18); border-radius:28px; background:rgba(255,255,255,.07); box-shadow:0 18px 44px rgba(5,24,18,.25),0 1px 0 rgba(255,255,255,.16) inset; transform:translateY(0); transition:transform .32s cubic-bezier(.22,1,.36,1),box-shadow .32s ease; }.login-brand-visual__frame::before { content:''; position:absolute; z-index:-1; inset:12px -14px -12px 14px; border:1px solid rgba(255,255,255,.1); border-radius:28px; background:rgba(255,255,255,.035); }.login-brand-visual__frame img { width:100%; height:100%; display:block; padding:18px; border-radius:27px; object-fit:contain; }.login-brand-visual:hover .login-brand-visual__frame { transform:translateY(-3px); box-shadow:0 22px 50px rgba(5,24,18,.29),0 1px 0 rgba(255,255,255,.18) inset; }
.dark .login-panel { border-color:rgba(255,255,255,.08); background:rgba(24,33,50,.86); box-shadow:0 2px 0 rgba(255,255,255,.04) inset,0 24px 64px rgba(0,0,0,.24); }
.dark .login-error { border-color:rgba(248,113,113,.18); background:rgba(127,29,29,.18); color:#fca5a5; }
@keyframes login-panel-enter { from { opacity:0; transform:translateY(16px) scale(.985); } to { opacity:1; transform:none; } }
@keyframes login-visual-enter { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:none; } }
@media(max-width:520px){.login-panel{padding:24px 20px;border-radius:14px}.login-heading{margin-bottom:24px}.login-heading h2{font-size:27px}}
@media(prefers-reduced-motion:reduce){.login-panel,.login-brand-visual{animation:none}.login-brand-visual__frame,.login-input-icon :deep(svg){transition:none}}
.fade-enter-active,
.fade-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

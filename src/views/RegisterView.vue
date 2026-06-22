<template>
  <section class="register-page">
    <div class="register-shell">
      <p class="register-kicker">{{ copy.kicker }}</p>
      <h1>{{ copy.title }}</h1>

      <form class="register-form" @submit.prevent="submitRegister">
        <label class="register-field">
          <span>{{ copy.emailLabel }}</span>
          <input v-model="form.email" type="email" autocomplete="email" :placeholder="copy.emailPlaceholder" />
        </label>

        <label class="register-field register-field--captcha">
          <span>{{ copy.captchaLabel }}</span>
          <div class="register-captcha-row">
            <input v-model="form.captcha" inputmode="numeric" autocomplete="off" :placeholder="copy.captchaPlaceholder" />
            <button class="register-captcha-image" type="button" :aria-label="copy.refreshCaptcha" @click="refreshCaptcha">
              <span>{{ captchaCode }}</span>
            </button>
          </div>
        </label>

        <label class="register-field register-field--full">
          <span>{{ copy.emailCodeLabel }}</span>
          <div class="register-code-row">
            <input v-model="form.emailCode" inputmode="numeric" autocomplete="one-time-code" :placeholder="copy.emailCodePlaceholder" />
            <button type="button" :disabled="isSendingCode" @click="sendEmailCode">
              {{ sendCodeText }}
            </button>
          </div>
        </label>

        <label class="register-field">
          <span>{{ copy.nicknameLabel }}</span>
          <input v-model="form.nickname" autocomplete="nickname" :placeholder="copy.nicknamePlaceholder" />
        </label>

        <label class="register-field">
          <span>{{ copy.passwordLabel }}</span>
          <input v-model="form.password" type="password" autocomplete="new-password" :placeholder="copy.passwordPlaceholder" />
        </label>

        <label class="register-field">
          <span>{{ copy.titleLabel }}</span>
          <select v-model="form.title">
            <option value="" disabled>{{ copy.titlePlaceholder }}</option>
            <option v-for="item in titleOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>

        <div class="register-actions">
          <p v-if="statusMessage" class="register-message" :class="{ error: statusType === 'error' }">
            {{ statusMessage }}
          </p>
          <button class="register-submit" type="submit" :disabled="isRegistering">
            {{ isRegistering ? copy.registering : copy.submit }}
          </button>
          <p>{{ copy.hasAccount }}<RouterLink to="/login">{{ copy.login }}</RouterLink></p>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '../composables/useAuth'
import { useLocale } from '../composables/useLocale'

const router = useRouter()
const { setCurrentUser } = useAuth()
const { locale } = useLocale()

const copies = {
  zh: {
    kicker: '创建账号',
    title: '开启探索 DERING 之旅',
    emailLabel: '邮箱*',
    emailPlaceholder: '请输入邮箱',
    captchaLabel: '图形验证码*',
    captchaPlaceholder: '请输入验证码',
    refreshCaptcha: '刷新图形验证码',
    emailCodeLabel: '邮箱验证码*',
    emailCodePlaceholder: '请输入邮箱验证码',
    sendCode: '发送验证码',
    sendingCode: '发送中...',
    sentCode: '已发送',
    nicknameLabel: '昵称*',
    nicknamePlaceholder: '请输入昵称',
    passwordLabel: '密码*',
    passwordPlaceholder: '至少 8 位密码',
    titleLabel: '称谓*',
    titlePlaceholder: '请选择称谓',
    titles: {
      '女士': '女士',
      '先生': '先生',
      '其他': '其他',
    },
    registering: '注册中...',
    submit: '立即注册',
    hasAccount: '已有账户？',
    login: '登录',
    invalidEmail: '请输入正确的邮箱格式',
    invalidCaptcha: '图形验证码错误',
    sendFailed: '验证码发送失败',
    codeSent: '邮箱验证码已发送，请查收邮箱',
    missingEmailCode: '请输入邮箱验证码',
    missingNickname: '请输入昵称',
    missingPassword: '请输入密码',
    weakPassword: '密码至少需要 8 位',
    missingTitle: '请选择称谓',
    registerFailed: '注册失败',
    registerSuccess: '注册成功，已登录',
    emailServiceMissing: '邮箱服务未配置，请先配置后端邮箱服务',
    emailRegistered: '该邮箱已被注册',
    otpInvalid: '邮箱验证码错误或已过期',
  },
  en: {
    kicker: 'Create Account',
    title: 'Start Your DERING Journey',
    emailLabel: 'Email*',
    emailPlaceholder: 'Enter your email',
    captchaLabel: 'Image Verification Code*',
    captchaPlaceholder: 'Enter the code',
    refreshCaptcha: 'Refresh image verification code',
    emailCodeLabel: 'Email Verification Code*',
    emailCodePlaceholder: 'Enter the email code',
    sendCode: 'Send Code',
    sendingCode: 'Sending...',
    sentCode: 'Sent',
    nicknameLabel: 'Nickname*',
    nicknamePlaceholder: 'Enter your nickname',
    passwordLabel: 'Password*',
    passwordPlaceholder: 'At least 8 characters',
    titleLabel: 'Title*',
    titlePlaceholder: 'Select a title',
    titles: {
      '女士': 'Ms.',
      '先生': 'Mr.',
      '其他': 'Other',
    },
    registering: 'Registering...',
    submit: 'Register Now',
    hasAccount: 'Already have an account? ',
    login: 'Log In',
    invalidEmail: 'Please enter a valid email address',
    invalidCaptcha: 'The image verification code is incorrect',
    sendFailed: 'Failed to send the verification code',
    codeSent: 'The email verification code has been sent. Please check your inbox.',
    missingEmailCode: 'Please enter the email verification code',
    missingNickname: 'Please enter your nickname',
    missingPassword: 'Please enter your password',
    weakPassword: 'Password must be at least 8 characters',
    missingTitle: 'Please select a title',
    registerFailed: 'Registration failed',
    registerSuccess: 'Registration successful. You are now logged in.',
    emailServiceMissing: 'Email service is not configured. Please configure the backend email service first.',
    emailRegistered: 'This email address is already registered',
    otpInvalid: 'The email verification code is incorrect or has expired',
  },
}

const copy = computed(() => copies[locale.value] ?? copies.zh)
const titleOptions = computed(() =>
  ['女士', '先生', '其他'].map((value) => ({
    value,
    label: copy.value.titles[value],
  })),
)

const form = reactive({
  email: '',
  captcha: '',
  emailCode: '',
  nickname: '',
  password: '',
  title: '',
})

const captchaCode = ref(createCaptchaCode())
const isSendingCode = ref(false)
const isRegistering = ref(false)
const statusMessage = ref('')
const statusType = ref('info')

const sendCodeText = computed(() => {
  if (isSendingCode.value) {
    return copy.value.sendingCode
  }

  return hasSentCode.value ? copy.value.sentCode : copy.value.sendCode
})
const hasSentCode = ref(false)

watch(locale, () => {
  if (statusMessage.value) {
    statusMessage.value = ''
  }
})

function createCaptchaCode() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function refreshCaptcha() {
  captchaCode.value = createCaptchaCode()
  form.captcha = ''
}

function isEmail(value) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(String(value || '').trim())
}

function setStatus(message, type = 'info') {
  statusMessage.value = message
  statusType.value = type
}

function formatErrorMessage(message, fallback) {
  const text = String(message || fallback)

  if (text.includes('SMTP_USER') || text.includes('SMTP_PASSWORD') || text.includes('SMTP_FROM') || text.includes('邮箱服务未配置')) {
    return copy.value.emailServiceMissing
  }

  if (text.includes('该邮箱已被注册')) {
    return copy.value.emailRegistered
  }

  if (text.includes('邮箱验证码错误') || text.includes('已过期')) {
    return copy.value.otpInvalid
  }

  if (text.includes('请输入正确的邮箱格式')) {
    return copy.value.invalidEmail
  }

  if (text.includes('请选择称谓')) {
    return copy.value.missingTitle
  }

  if (text.includes('密码至少需要 8 位')) {
    return copy.value.weakPassword
  }

  if (text.includes('该昵称已被注册')) {
    return locale.value === 'en' ? 'This nickname is already registered' : '该昵称已被注册'
  }

  if (text === fallback) {
    return fallback
  }

  return locale.value === 'en' ? fallback : text
}

async function sendEmailCode() {
  if (!isEmail(form.email)) {
    setStatus(copy.value.invalidEmail, 'error')
    return
  }

  if (form.captcha.trim() !== captchaCode.value) {
    setStatus(copy.value.invalidCaptcha, 'error')
    refreshCaptcha()
    return
  }

  isSendingCode.value = true
  hasSentCode.value = false
  setStatus('')

  try {
    const response = await fetch('/api/register/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok || !payload.success) {
      throw new Error(formatErrorMessage(payload.detail, copy.value.sendFailed))
    }

    hasSentCode.value = true
    setStatus(copy.value.codeSent)
  } catch (error) {
    hasSentCode.value = false
    setStatus(formatErrorMessage(error instanceof Error ? error.message : '', copy.value.sendFailed), 'error')
  } finally {
    isSendingCode.value = false
  }
}

async function submitRegister() {
  if (!isEmail(form.email)) {
    setStatus(copy.value.invalidEmail, 'error')
    return
  }

  if (!form.emailCode.trim()) {
    setStatus(copy.value.missingEmailCode, 'error')
    return
  }

  if (!form.nickname.trim()) {
    setStatus(copy.value.missingNickname, 'error')
    return
  }

  if (!form.password) {
    setStatus(copy.value.missingPassword, 'error')
    return
  }

  if (form.password.length < 8) {
    setStatus(copy.value.weakPassword, 'error')
    return
  }

  if (!form.title) {
    setStatus(copy.value.missingTitle, 'error')
    return
  }

  isRegistering.value = true
  setStatus('')

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        emailCode: form.emailCode,
        nickname: form.nickname,
        password: form.password,
        title: form.title,
      }),
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok || !payload.success) {
      throw new Error(formatErrorMessage(payload.detail, copy.value.registerFailed))
    }

    setCurrentUser(payload.user)
    setStatus(copy.value.registerSuccess)
    form.email = ''
    form.captcha = ''
    form.emailCode = ''
    form.nickname = ''
    form.password = ''
    form.title = ''
    hasSentCode.value = false
    refreshCaptcha()
    window.setTimeout(() => {
      router.push({ name: 'home' })
    }, 500)
  } catch (error) {
    setStatus(formatErrorMessage(error instanceof Error ? error.message : '', copy.value.registerFailed), 'error')
  } finally {
    isRegistering.value = false
  }
}
</script>

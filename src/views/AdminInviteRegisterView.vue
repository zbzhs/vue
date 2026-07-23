<template>
  <section class="register-page">
    <div class="register-shell">
      <p class="register-kicker">{{ copy.kicker }}</p>
      <h1>{{ copy.title }}</h1>

      <p v-if="inviteStatus" class="register-message" :class="{ error: inviteStatusType === 'error' }">
        {{ inviteStatus }}
      </p>

      <form v-if="isInviteValid" class="register-form" @submit.prevent="submitRegister">
        <label class="register-field">
          <span>{{ copy.emailLabel }}</span>
          <input v-model="form.email" type="email" autocomplete="email" :placeholder="copy.emailPlaceholder" />
        </label>

        <label class="register-field">
          <span>{{ copy.nicknameLabel }}</span>
          <input v-model="form.nickname" autocomplete="nickname" :placeholder="copy.nicknamePlaceholder" />
        </label>

        <label class="register-field">
          <span>{{ copy.phoneLabel }}</span>
          <input v-model="form.phone" autocomplete="tel" :placeholder="copy.phonePlaceholder" />
        </label>

        <label class="register-field register-field--full">
          <span>{{ copy.emailCodeLabel }}</span>
          <div class="register-code-row">
            <input v-model="form.emailCode" inputmode="numeric" autocomplete="one-time-code" :placeholder="copy.emailCodePlaceholder" />
            <button type="button" :disabled="isSendingCode" @click="sendEmailCode">
              {{ isSendingCode ? copy.sendingCode : copy.sendCode }}
            </button>
          </div>
        </label>

        <label class="register-field register-field--full">
          <span>{{ copy.passwordLabel }}</span>
          <input v-model="form.password" type="password" autocomplete="new-password" :placeholder="copy.passwordPlaceholder" />
        </label>

        <div class="register-actions">
          <p v-if="statusMessage" class="register-message" :class="{ error: statusType === 'error' }">
            {{ statusMessage }}
          </p>
          <button class="register-submit" type="submit" :disabled="isRegistering">
            {{ isRegistering ? copy.registering : copy.submit }}
          </button>
          <p><RouterLink :to="{ name: 'adminLogin' }">{{ copy.login }}</RouterLink></p>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuth } from '../composables/useAuth'
import { useLocale } from '../composables/useLocale'

const route = useRoute()
const router = useRouter()
const { setCurrentUser } = useAuth()
const { locale } = useLocale()

const copies = {
  zh: {
    kicker: '管理员邀请',
    title: '注册 DERING 管理员',
    emailLabel: '邮箱*',
    emailPlaceholder: '请输入邮箱',
    emailCodeLabel: '邮箱验证码*',
    emailCodePlaceholder: '请输入邮箱验证码',
    sendCode: '发送验证码',
    sendingCode: '发送中...',
    nicknameLabel: '管理员用户名*',
    nicknamePlaceholder: '请输入管理员用户名',
    phoneLabel: '手机号*',
    phonePlaceholder: '请输入手机号',
    passwordLabel: '密码*',
    passwordPlaceholder: '至少 8 位密码',
    registering: '注册中...',
    submit: '注册管理员',
    login: '返回管理员登录',
    inviteChecking: '正在校验邀请链接...',
    inviteInvalid: '邀请链接无效、已过期或已被使用',
    invalidEmail: '请输入正确的邮箱格式',
    missingEmailCode: '请输入邮箱验证码',
    missingNickname: '请输入管理员用户名',
    missingPhone: '请输入手机号',
    invalidPhone: '请输入正确的手机号',
    missingPassword: '请输入密码',
    weakPassword: '密码至少需要 8 位',
    sendFailed: '验证码发送失败',
    codeSent: '邮箱验证码已发送，请查收邮箱',
    registerFailed: '管理员注册失败',
    registerSuccess: '注册成功，已登录',
  },
  en: {
    kicker: 'Admin Invitation',
    title: 'Register DERING Administrator',
    emailLabel: 'Email*',
    emailPlaceholder: 'Enter email',
    emailCodeLabel: 'Email Code*',
    emailCodePlaceholder: 'Enter email code',
    sendCode: 'Send code',
    sendingCode: 'Sending...',
    nicknameLabel: 'Admin username*',
    nicknamePlaceholder: 'Enter admin username',
    phoneLabel: 'Phone*',
    phonePlaceholder: 'Enter phone number',
    passwordLabel: 'Password*',
    passwordPlaceholder: 'At least 8 characters',
    registering: 'Registering...',
    submit: 'Register admin',
    login: 'Back to admin login',
    inviteChecking: 'Checking invitation link...',
    inviteInvalid: 'The invitation link is invalid, expired, or already used',
    invalidEmail: 'Please enter a valid email address',
    missingEmailCode: 'Please enter the email code',
    missingNickname: 'Please enter the admin username',
    missingPhone: 'Please enter the phone number',
    invalidPhone: 'Please enter a valid phone number',
    missingPassword: 'Please enter your password',
    weakPassword: 'Password must be at least 8 characters',
    sendFailed: 'Failed to send verification code',
    codeSent: 'The email verification code has been sent. Please check your inbox.',
    registerFailed: 'Failed to register administrator',
    registerSuccess: 'Registration successful. You are now logged in.',
  },
}

const copy = computed(() => copies[locale.value] ?? copies.zh)
const inviteToken = computed(() => String(route.params.token || '').trim())
const form = reactive({
  email: '',
  emailCode: '',
  nickname: '',
  phone: '',
  password: '',
})

const isInviteValid = ref(false)
const isSendingCode = ref(false)
const isRegistering = ref(false)
const inviteStatus = ref('')
const inviteStatusType = ref('info')
const statusMessage = ref('')
const statusType = ref('info')

function setStatus(message, type = 'info') {
  statusMessage.value = message
  statusType.value = type
}

function isEmail(value) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(String(value || '').trim())
}

function normalizePhone(value) {
  return String(value || '').replace(/[\s-]/g, '').trim()
}

function isPhone(value) {
  const phone = normalizePhone(value)
  return /^1[3-9]\d{9}$/.test(phone) && new Set(phone).size > 1
}

function formatErrorMessage(message, fallback) {
  const text = String(message || fallback)
  return locale.value === 'en' ? fallback : text
}

async function validateInvite() {
  inviteStatus.value = copy.value.inviteChecking
  inviteStatusType.value = 'info'
  isInviteValid.value = false

  try {
    const response = await fetch(`/api/admin/invitations/${encodeURIComponent(inviteToken.value)}`)
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || !payload.success) {
      throw new Error(payload.detail || copy.value.inviteInvalid)
    }
    isInviteValid.value = true
    inviteStatus.value = ''
  } catch (error) {
    inviteStatus.value = formatErrorMessage(error instanceof Error ? error.message : '', copy.value.inviteInvalid)
    inviteStatusType.value = 'error'
  }
}

async function sendEmailCode() {
  if (!isEmail(form.email)) {
    setStatus(copy.value.invalidEmail, 'error')
    return
  }

  isSendingCode.value = true
  setStatus('')
  try {
    const response = await fetch('/api/admin/invitations/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inviteToken: inviteToken.value,
        email: form.email,
      }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || !payload.success) {
      throw new Error(payload.detail || copy.value.sendFailed)
    }
    setStatus(copy.value.codeSent)
  } catch (error) {
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
  if (!normalizePhone(form.phone)) {
    setStatus(copy.value.missingPhone, 'error')
    return
  }
  if (!isPhone(form.phone)) {
    setStatus(copy.value.invalidPhone, 'error')
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

  isRegistering.value = true
  setStatus('')
  try {
    const response = await fetch('/api/admin/invitations/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inviteToken: inviteToken.value,
        email: form.email,
        emailCode: form.emailCode,
        nickname: form.nickname,
        phone: normalizePhone(form.phone),
        password: form.password,
      }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || !payload.success) {
      throw new Error(payload.detail || copy.value.registerFailed)
    }
    setCurrentUser(payload.user)
    setStatus(copy.value.registerSuccess)
    window.setTimeout(() => {
      router.push({ name: 'adminDashboard' })
    }, 500)
  } catch (error) {
    setStatus(formatErrorMessage(error instanceof Error ? error.message : '', copy.value.registerFailed), 'error')
  } finally {
    isRegistering.value = false
  }
}

onMounted(validateInvite)
</script>

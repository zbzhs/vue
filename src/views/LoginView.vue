<template>
  <section class="register-page">
    <div class="register-shell">
      <p class="register-kicker">{{ copy.kicker }}</p>
      <h1>{{ copy.title }}</h1>

      <form class="register-form login-form" @submit.prevent="submitLogin">
        <label class="register-field register-field--full">
          <span>{{ copy.nicknameLabel }}</span>
          <input v-model="form.nickname" autocomplete="username" :placeholder="copy.nicknamePlaceholder" />
        </label>

        <label class="register-field register-field--full">
          <span>{{ copy.passwordLabel }}</span>
          <input v-model="form.password" type="password" autocomplete="current-password" :placeholder="copy.passwordPlaceholder" />
        </label>

        <div class="register-actions">
          <p v-if="statusMessage" class="register-message" :class="{ error: statusType === 'error' }">
            {{ statusMessage }}
          </p>
          <button class="register-submit" type="submit" :disabled="isLoggingIn">
            {{ isLoggingIn ? copy.loggingIn : copy.submit }}
          </button>
          <p>{{ copy.noAccount }}<RouterLink to="/register">{{ copy.register }}</RouterLink></p>
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
    kicker: '登录账号',
    title: '欢迎回到 DERING',
    nicknameLabel: '邮箱或用户名*',
    nicknamePlaceholder: '请输入邮箱或用户名',
    passwordLabel: '密码*',
    passwordPlaceholder: '请输入密码',
    loggingIn: '登录中...',
    submit: '立即登录',
    noAccount: '还没有账户？',
    register: '注册',
    missingNickname: '请输入邮箱或用户名',
    missingPassword: '请输入密码',
    loginFailed: '登录失败',
    loginSuccess: '登录成功',
    adminNotAllowed: '用户不存在',
    notRegistered: '该邮箱或用户名尚未注册，请先注册',
    invalidCredentials: '邮箱、用户名或密码错误',
    passwordNotSet: '该账号尚未设置密码，请重新注册或联系管理员',
  },
  en: {
    kicker: 'Log In',
    title: 'Welcome Back to DERING',
    nicknameLabel: 'Email or username*',
    nicknamePlaceholder: 'Enter email or username',
    passwordLabel: 'Password*',
    passwordPlaceholder: 'Enter your password',
    loggingIn: 'Logging in...',
    submit: 'Log In Now',
    noAccount: 'No account yet? ',
    register: 'Register',
    missingNickname: 'Please enter your email or username',
    missingPassword: 'Please enter your password',
    loginFailed: 'Login failed',
    loginSuccess: 'Logged in successfully',
    adminNotAllowed: 'User does not exist.',
    notRegistered: 'This email or username is not registered yet. Please register first.',
    invalidCredentials: 'The email, username, or password is incorrect.',
    passwordNotSet: 'This account does not have a password yet. Please register again or contact support.',
  },
}

const copy = computed(() => copies[locale.value] ?? copies.zh)
const form = reactive({
  nickname: '',
  password: '',
})

const isLoggingIn = ref(false)
const statusMessage = ref('')
const statusType = ref('info')

watch(locale, () => {
  if (statusMessage.value) {
    statusMessage.value = ''
  }
})

function setStatus(message, type = 'info') {
  statusMessage.value = message
  statusType.value = type
}

function formatErrorMessage(message, fallback) {
  const text = String(message || fallback)

  if (text.includes('尚未注册')) {
    return copy.value.notRegistered
  }

  if (text.includes('昵称或密码错误')) {
    return copy.value.invalidCredentials
  }

  if (text.includes('尚未设置密码')) {
    return copy.value.passwordNotSet
  }

  return locale.value === 'en' ? fallback : text
}

async function submitLogin() {
  if (!form.nickname.trim()) {
    setStatus(copy.value.missingNickname, 'error')
    return
  }

  if (!form.password) {
    setStatus(copy.value.missingPassword, 'error')
    return
  }

  isLoggingIn.value = true
  setStatus('')

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname: form.nickname,
        password: form.password,
      }),
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok || !payload.success) {
      throw new Error(formatErrorMessage(payload.detail, copy.value.loginFailed))
    }

    setCurrentUser(payload.user)
    setStatus(copy.value.loginSuccess)
    window.setTimeout(() => {
      router.push({ name: 'home' })
    }, 500)
  } catch (error) {
    setStatus(formatErrorMessage(error instanceof Error ? error.message : '', copy.value.loginFailed), 'error')
  } finally {
    isLoggingIn.value = false
  }
}
</script>

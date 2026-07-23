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
          <p>{{ copy.userAccount }}<RouterLink to="/login">{{ copy.userLogin }}</RouterLink></p>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '../composables/useAuth'
import { useLocale } from '../composables/useLocale'

const router = useRouter()
const { currentUser, setCurrentUser } = useAuth()
const { locale } = useLocale()

const copies = {
  zh: {
    kicker: '管理员登录页面',
    title: '欢迎回到 DERING',
    nicknameLabel: '管理员邮箱或用户名*',
    nicknamePlaceholder: '请输入管理员邮箱或用户名',
    passwordLabel: '密码*',
    passwordPlaceholder: '请输入密码',
    loggingIn: '登录中...',
    submit: '立即登录',
    userAccount: '不是管理员？',
    userLogin: '用户登录',
    missingNickname: '请输入管理员邮箱或用户名',
    missingPassword: '请输入密码',
    loginFailed: '管理员邮箱、用户名或密码错误',
    loginSuccess: '登录成功',
    noPermission: '该账号没有管理员权限',
  },
  en: {
    kicker: 'Administrator Login Page',
    title: 'Welcome Back to DERING',
    nicknameLabel: 'Admin email or username*',
    nicknamePlaceholder: 'Enter admin email or username',
    passwordLabel: 'Password*',
    passwordPlaceholder: 'Enter password',
    loggingIn: 'Logging in...',
    submit: 'Log In Now',
    userAccount: 'Not an admin? ',
    userLogin: 'User login',
    missingNickname: 'Please enter the admin email or username',
    missingPassword: 'Please enter your password',
    loginFailed: 'Invalid administrator credentials',
    loginSuccess: 'Logged in successfully',
    noPermission: 'This account does not have administrator access',
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
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname: form.nickname,
        password: form.password,
      }),
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok || !payload.success) {
      throw new Error(payload.detail || copy.value.loginFailed)
    }

    if (payload.user?.accountType !== 'admin') {
      throw new Error(copy.value.noPermission)
    }

    setCurrentUser(payload.user)
    setStatus(copy.value.loginSuccess)
    window.setTimeout(() => {
      router.push({ name: 'adminDashboard' })
    }, 500)
  } catch (error) {
    setStatus(error instanceof Error ? error.message : copy.value.loginFailed, 'error')
  } finally {
    isLoggingIn.value = false
  }
}

onMounted(() => {
  if (currentUser.value?.accountType === 'admin') {
    router.replace({ name: 'adminDashboard' })
  }
})
</script>

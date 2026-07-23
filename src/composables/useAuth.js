import { computed, ref } from 'vue'

import { useLocale } from './useLocale'

const AUTH_STORAGE_KEY = 'dering-current-user'
const currentUser = ref(null)

function readStoredUser() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY)
    const user = stored ? JSON.parse(stored) : null
    if (user && !user.accountType) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }
    return user
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

function writeStoredUser(user) {
  if (typeof window === 'undefined') {
    return
  }

  if (user) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

currentUser.value = readStoredUser()

function setCurrentUser(user) {
  currentUser.value = user
  writeStoredUser(user)
}

function logout() {
  setCurrentUser(null)
}

function isFemaleTitle(title) {
  return ['女士', '濂冲＋'].includes(title)
}

function isMaleTitle(title) {
  return ['先生', '鍏堢敓'].includes(title)
}

function formatUserName(user, locale = 'zh') {
  const nickname = String(user?.nickname || '').trim()
  const title = String(user?.title || '').trim()

  if (!nickname) {
    return ''
  }

  if (locale === 'en') {
    if (isFemaleTitle(title)) {
      return `Ms. ${nickname}`
    }

    if (isMaleTitle(title)) {
      return `Mr. ${nickname}`
    }

    return nickname
  }

  if (isFemaleTitle(title) || isMaleTitle(title)) {
    return `${nickname}${title}`
  }

  return nickname
}

export function useAuth() {
  const { locale } = useLocale()
  const displayName = computed(() => formatUserName(currentUser.value, locale.value))

  return {
    currentUser,
    displayName,
    logout,
    setCurrentUser,
  }
}

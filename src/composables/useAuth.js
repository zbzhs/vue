import { computed, ref } from 'vue'

import { useLocale } from './useLocale'

const AUTH_STORAGE_KEY = 'dering-current-user'
const SELECTION_AUTH_STORAGE_KEY = 'dering-selection-user'
const LIVE_OPS_AUTH_STORAGE_KEY = 'dering-live-ops-user'
const currentUser = ref(null)
const selectionUser = ref(null)
const liveOpsUser = ref(null)

function readStoredUser(storageKey = AUTH_STORAGE_KEY) {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = window.localStorage.getItem(storageKey)
    const user = stored ? JSON.parse(stored) : null
    if (user && !user.accountType) {
      window.localStorage.removeItem(storageKey)
      return null
    }
    return user
  } catch {
    window.localStorage.removeItem(storageKey)
    return null
  }
}

function writeStoredUser(user, storageKey = AUTH_STORAGE_KEY) {
  if (typeof window === 'undefined') {
    return
  }

  if (user) {
    window.localStorage.setItem(storageKey, JSON.stringify(user))
  } else {
    window.localStorage.removeItem(storageKey)
  }
}

currentUser.value = readStoredUser()
selectionUser.value = readStoredUser(SELECTION_AUTH_STORAGE_KEY)
liveOpsUser.value = readStoredUser(LIVE_OPS_AUTH_STORAGE_KEY)

function setCurrentUser(user) {
  currentUser.value = user
  writeStoredUser(user, AUTH_STORAGE_KEY)
}

function setSelectionUser(user) {
  selectionUser.value = user
  writeStoredUser(user, SELECTION_AUTH_STORAGE_KEY)
}

function setLiveOpsUser(user) {
  liveOpsUser.value = user
  writeStoredUser(user, LIVE_OPS_AUTH_STORAGE_KEY)
}

function logout() {
  setCurrentUser(null)
}

function logoutSelection() {
  setSelectionUser(null)
}

function logoutLiveOps() {
  setLiveOpsUser(null)
}

async function refreshSelectionUser() {
  const token = String(selectionUser.value?.token || '').trim()
  if (!token) {
    return null
  }

  try {
    const response = await fetch('/api/selection/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || !payload.success) {
      throw new Error('invalid selection session')
    }
    setSelectionUser({
      ...payload.user,
      token,
    })
    return selectionUser.value
  } catch {
    logoutSelection()
    return null
  }
}

async function refreshLiveOpsUser() {
  const token = String(liveOpsUser.value?.token || '').trim()
  if (!token) {
    return null
  }

  try {
    const response = await fetch('/api/control/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || !payload.success) {
      throw new Error('invalid live ops session')
    }
    setLiveOpsUser({
      ...payload.user,
      token,
    })
    return liveOpsUser.value
  } catch {
    logoutLiveOps()
    return null
  }
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
  const selectionDisplayName = computed(() => formatUserName(selectionUser.value, locale.value))
  const liveOpsDisplayName = computed(() => formatUserName(liveOpsUser.value, locale.value))

  return {
    currentUser,
    selectionUser,
    liveOpsUser,
    displayName,
    selectionDisplayName,
    liveOpsDisplayName,
    logout,
    logoutSelection,
    logoutLiveOps,
    refreshSelectionUser,
    refreshLiveOpsUser,
    setCurrentUser,
    setSelectionUser,
    setLiveOpsUser,
  }
}

const PROFILE_STORAGE_PREFIX = 'dering-selection-profile:'

function getUserIdentity(user) {
  return String(user?.user_id || user?.id || user?.email || user?.nickname || '').trim()
}

function getStorageKey(user) {
  const identity = getUserIdentity(user)
  return identity ? `${PROFILE_STORAGE_PREFIX}${encodeURIComponent(identity)}` : ''
}

function getLegacyStorageKeys(user) {
  return [user?.id, user?.email, user?.nickname]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .map((identity) => `${PROFILE_STORAGE_PREFIX}${encodeURIComponent(identity)}`)
}

export function readSelectionProfile(user) {
  const key = getStorageKey(user)
  if (!key || typeof window === 'undefined') {
    return null
  }

  try {
    let stored = window.localStorage.getItem(key)
    if (!stored) {
      stored = getLegacyStorageKeys(user)
        .filter((legacyKey) => legacyKey !== key)
        .map((legacyKey) => window.localStorage.getItem(legacyKey))
        .find(Boolean)
    }
    return stored ? JSON.parse(stored) : null
  } catch {
    window.localStorage.removeItem(key)
    return null
  }
}

export function startSelectionOnboarding(user) {
  return writeSelectionProfile(user, {
    status: 'pending',
    answers: {},
    updatedAt: new Date().toISOString(),
  })
}

export function completeSelectionOnboarding(user, answers) {
  return writeSelectionProfile(user, {
    status: 'completed',
    answers: answers || {},
    updatedAt: new Date().toISOString(),
  })
}

function writeSelectionProfile(user, profile) {
  const key = getStorageKey(user)
  if (!key || typeof window === 'undefined') {
    return null
  }

  window.localStorage.setItem(key, JSON.stringify(profile))
  return profile
}

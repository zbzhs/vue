import { computed, ref, watch } from 'vue'

import { useAuth } from './useAuth'

const SELECTION_PICKS_STORAGE_PREFIX = 'dering-selection-picks'
const { selectionUser } = useAuth()
const selectionPicks = ref(readStoredPicks())

function getSelectionPickerIdentity(user = selectionUser.value) {
  return String(user?.user_id || user?.email || user?.nickname || '').trim()
}

function getSelectionPicksStorageKey(user = selectionUser.value) {
  const identity = getSelectionPickerIdentity(user)
  return identity ? `${SELECTION_PICKS_STORAGE_PREFIX}:${encodeURIComponent(identity)}` : ''
}

function getTodayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function readStoredPicks(user = selectionUser.value) {
  if (typeof window === 'undefined') {
    return []
  }

  const storageKey = getSelectionPicksStorageKey(user)
  if (!storageKey) {
    return []
  }

  try {
    const stored = window.localStorage.getItem(storageKey)
    const items = stored ? JSON.parse(stored) : []
    return Array.isArray(items) ? items : []
  } catch {
    window.localStorage.removeItem(storageKey)
    return []
  }
}

function writeStoredPicks(items) {
  if (typeof window === 'undefined') {
    return false
  }

  const storageKey = getSelectionPicksStorageKey()
  if (!storageKey) {
    return false
  }

  window.localStorage.setItem(storageKey, JSON.stringify(items))
  return true
}

function getSelectionToken() {
  return String(selectionUser.value?.token || '').trim()
}

function normalizeSelectionPick(product) {
  const code = product.code || product.styleNo || ''
  const styleNo = product.styleNo || code
  const pickedAt = new Date().toISOString()

  return {
    code,
    styleNo,
    rawName: product.name || product.displayName || code,
    rawType: product.type || product.displayType || '',
    rawSeries: product.series || product.displaySeries || '',
    name: product.displayName || product.name || code,
    type: product.displayType || product.type || '',
    series: product.displaySeries || product.series || '',
    image: product.image || product.alternateImage || '',
    price: Number(product.price || 0),
    pickedAt,
    pickedDate: getTodayKey(),
  }
}

async function persistSelectionPickToServer(item) {
  const token = getSelectionToken()
  if (!token) {
    return null
  }

  const response = await fetch('/api/selection/picks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload.success) {
    throw new Error(payload.detail || '选品记录保存失败')
  }

  return payload.item || null
}

async function syncSelectionPicksFromServer() {
  const token = getSelectionToken()
  const localPicks = readStoredPicks()
  if (!token) {
    selectionPicks.value = localPicks
    return selectionPicks.value
  }

  try {
    const response = await fetch('/api/selection/picks', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || !payload.success) {
      throw new Error(payload.detail || '选品记录加载失败')
    }
    const serverItems = Array.isArray(payload.items) ? payload.items : []
    const mergedByCode = new Map()
    for (const item of serverItems) {
      mergedByCode.set(item.code, item)
    }
    for (const item of localPicks) {
      if (!mergedByCode.has(item.code)) {
        const syncedItem = await persistSelectionPickToServer(item).catch(() => null)
        mergedByCode.set(item.code, syncedItem || item)
      }
    }

    selectionPicks.value = Array.from(mergedByCode.values())
      .sort((left, right) => String(right.pickedAt || '').localeCompare(String(left.pickedAt || '')))
    writeStoredPicks(selectionPicks.value)
  } catch {
    selectionPicks.value = localPicks
  }

  return selectionPicks.value
}

async function addSelectionPick(product) {
  if (!getSelectionPickerIdentity()) {
    return false
  }

  const item = normalizeSelectionPick(product)
  if (!item.code) {
    return false
  }

  const existingIndex = selectionPicks.value.findIndex((entry) => entry.code === item.code)
  if (existingIndex >= 0) {
    selectionPicks.value = selectionPicks.value.map((entry, index) => (
      index === existingIndex ? { ...entry, ...item } : entry
    ))
  } else {
    selectionPicks.value = [item, ...selectionPicks.value]
  }

  writeStoredPicks(selectionPicks.value)
  try {
    const syncedItem = await persistSelectionPickToServer(item)
    if (syncedItem) {
      selectionPicks.value = selectionPicks.value.map((entry) => (
        entry.code === item.code ? { ...entry, ...syncedItem } : entry
      ))
      writeStoredPicks(selectionPicks.value)
    }
  } catch {
    // Keep the local pick; the user can still continue selecting products.
  }
  return true
}

async function removeSelectionPick(code) {
  selectionPicks.value = selectionPicks.value.filter((item) => item.code !== code)
  writeStoredPicks(selectionPicks.value)
  const token = getSelectionToken()
  if (token) {
    try {
      await fetch(`/api/selection/picks/${encodeURIComponent(code)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      // Local removal is kept even if the network request fails.
    }
  }
}

function isSelectionPickSelected(code) {
  return selectionPicks.value.some((item) => item.code === code)
}

watch(selectionUser, () => {
  selectionPicks.value = readStoredPicks()
  syncSelectionPicksFromServer()
})

export function useSelectionPicks() {
  const selectionPickCount = computed(() => selectionPicks.value.length)
  const selectionPickGroups = computed(() => {
    const groups = new Map()

    for (const item of selectionPicks.value) {
      const dateKey = item.pickedDate || String(item.pickedAt || '').slice(0, 10) || getTodayKey()
      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey).push(item)
    }

    return Array.from(groups.entries())
      .sort(([leftDate], [rightDate]) => rightDate.localeCompare(leftDate))
      .map(([date, items]) => ({
        date,
        items: [...items].sort((left, right) => String(right.pickedAt || '').localeCompare(String(left.pickedAt || ''))),
      }))
  })

  return {
    selectionPicks,
    selectionPickCount,
    selectionPickGroups,
    addSelectionPick,
    removeSelectionPick,
    syncSelectionPicksFromServer,
    isSelectionPickSelected,
  }
}

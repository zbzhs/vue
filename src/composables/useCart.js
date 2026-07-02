import { computed, ref, watch } from 'vue'

import { useAuth } from './useAuth'

const CART_STORAGE_PREFIX = 'dering-cart-items'
const { currentUser } = useAuth()
const cartItems = ref(readStoredItems())

function getUserCartIdentity(user = currentUser.value) {
  return String(user?.id || user?.email || user?.nickname || '').trim()
}

function getCartStorageKey(user = currentUser.value) {
  const identity = getUserCartIdentity(user)
  return identity ? `${CART_STORAGE_PREFIX}:${encodeURIComponent(identity)}` : ''
}

function readStoredItems(user = currentUser.value) {
  if (typeof window === 'undefined') {
    return []
  }

  const storageKey = getCartStorageKey(user)
  if (!storageKey) {
    return []
  }

  try {
    const stored = window.localStorage.getItem(storageKey)
    const items = stored ? JSON.parse(stored) : []
    return Array.isArray(items) ? items.map((item) => ({ selected: true, ...item })) : []
  } catch {
    window.localStorage.removeItem(storageKey)
    return []
  }
}

function writeStoredItems(items) {
  if (typeof window === 'undefined') {
    return false
  }

  const storageKey = getCartStorageKey()
  if (!storageKey) {
    return false
  }

  window.localStorage.setItem(storageKey, JSON.stringify(items))
  return true
}

function normalizeCartProduct(product) {
  return {
    code: product.code,
    rawName: product.name || product.displayName || product.code,
    rawType: product.type || product.displayType || '',
    rawSeries: product.series || product.displaySeries || '',
    name: product.displayName || product.name || product.code,
    type: product.displayType || product.type || '',
    series: product.displaySeries || product.series || '',
    image: product.image || product.alternateImage || '',
    price: Number(product.price || 0),
    quantity: 1,
    selected: true,
  }
}

function addCartItem(product) {
  if (!getUserCartIdentity()) {
    return false
  }

  const item = normalizeCartProduct(product)
  const existingItem = cartItems.value.find((entry) => entry.code === item.code)

  if (existingItem) {
    existingItem.quantity += 1
    cartItems.value = [...cartItems.value]
  } else {
    cartItems.value = [...cartItems.value, item]
  }

  writeStoredItems(cartItems.value)
  return true
}

function updateCartItemQuantity(code, quantity) {
  const safeQuantity = Math.max(1, Number(quantity) || 1)
  cartItems.value = cartItems.value.map((item) =>
    item.code === code ? { ...item, quantity: safeQuantity } : item,
  )
  writeStoredItems(cartItems.value)
}

function setCartItemSelected(code, selected) {
  cartItems.value = cartItems.value.map((item) =>
    item.code === code ? { ...item, selected: Boolean(selected) } : item,
  )
  writeStoredItems(cartItems.value)
}

function setAllCartItemsSelected(selected) {
  cartItems.value = cartItems.value.map((item) => ({ ...item, selected: Boolean(selected) }))
  writeStoredItems(cartItems.value)
}

function removeCartItem(code) {
  cartItems.value = cartItems.value.filter((item) => item.code !== code)
  writeStoredItems(cartItems.value)
}

function removeCartItems(codes) {
  const codeSet = new Set(codes)
  cartItems.value = cartItems.value.filter((item) => !codeSet.has(item.code))
  writeStoredItems(cartItems.value)
}

function clearCart() {
  cartItems.value = []
  writeStoredItems(cartItems.value)
}

watch(currentUser, () => {
  cartItems.value = readStoredItems()
})

export function useCart() {
  const cartCount = computed(() =>
    cartItems.value.reduce((total, item) => total + Number(item.quantity || 0), 0),
  )
  const cartSubtotal = computed(() =>
    cartItems.value.reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    ),
  )
  const selectedCartItems = computed(() => cartItems.value.filter((item) => item.selected !== false))
  const selectedCartCount = computed(() =>
    selectedCartItems.value.reduce((total, item) => total + Number(item.quantity || 0), 0),
  )
  const selectedCartSubtotal = computed(() =>
    selectedCartItems.value.reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    ),
  )

  return {
    cartItems,
    cartCount,
    cartSubtotal,
    selectedCartItems,
    selectedCartCount,
    selectedCartSubtotal,
    addCartItem,
    updateCartItemQuantity,
    setCartItemSelected,
    setAllCartItemsSelected,
    removeCartItem,
    removeCartItems,
    clearCart,
  }
}

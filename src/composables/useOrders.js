import { computed, ref } from 'vue'

const ORDERS_STORAGE_KEY = 'dering-order-history'
const orders = ref(readStoredOrders())

function readStoredOrders() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = window.localStorage.getItem(ORDERS_STORAGE_KEY)
    const items = stored ? JSON.parse(stored) : []
    return Array.isArray(items) ? items : []
  } catch {
    window.localStorage.removeItem(ORDERS_STORAGE_KEY)
    return []
  }
}

function writeStoredOrders(items) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(items))
}

function addOrder(order) {
  orders.value = [order, ...orders.value]
  writeStoredOrders(orders.value)
}

function removeOrder(orderId) {
  orders.value = orders.value.filter((order) => order.id !== orderId)
  writeStoredOrders(orders.value)
}

export function useOrders() {
  const orderHistory = computed(() => orders.value)

  return {
    orderHistory,
    addOrder,
    removeOrder,
  }
}

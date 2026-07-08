<template>
  <section class="cart-page">
    <div class="cart-shell">
      <header class="cart-head">
        <p>{{ copy.kicker }}</p>
        <div class="cart-head-links">
          <RouterLink class="cart-orders-link" :to="{ name: 'orders' }">{{ copy.myOrders }}</RouterLink>
          <button
            v-if="lastCartProduct"
            class="cart-orders-link"
            type="button"
            @click="returnToLastProduct"
          >
            {{ copy.returnProduct }}
          </button>
        </div>
        <h1>{{ copy.title }}</h1>
      </header>

      <div class="cart-layout">
        <section class="cart-items" :aria-label="copy.itemsAria">
          <div v-if="cartItems.length" class="cart-select-all">
            <label>
              <input type="checkbox" :checked="isAllSelected" @change="toggleAllSelected" />
              <span>{{ copy.selectAll }}</span>
            </label>
            <small>{{ copy.selectedCount(selectedCartCount) }}</small>
          </div>

          <article v-if="!cartItems.length" class="cart-empty">
            <h2>{{ copy.emptyTitle }}</h2>
            <p>{{ copy.emptyText }}</p>
            <RouterLink :to="{ name: 'products' }">{{ copy.continueShopping }}</RouterLink>
          </article>

          <article
            v-for="item in localizedCartItems"
            :key="item.code"
            class="cart-item"
            :class="{ 'cart-item--selected': item.selected !== false }"
          >
            <label class="cart-item-check" :aria-label="copy.selectItem(item.name)">
              <input
                type="checkbox"
                :checked="item.selected !== false"
                @change="setCartItemSelected(item.code, $event.target.checked)"
              />
            </label>

            <img :src="item.image" :alt="item.name" />
            <div class="cart-item-copy">
              <p>{{ item.type }}<span v-if="item.series"> / {{ item.series }}</span></p>
              <h2>{{ item.name }}</h2>
              <span>{{ copy.styleNo }}: {{ item.styleNo || item.code }}</span>
              <span v-if="item.goodsNo">{{ copy.goodsNo }}: {{ item.goodsNo }}</span>
              <strong>{{ formatCartPrice(item.price) }}</strong>
            </div>
            <div class="cart-item-controls">
              <label>
                {{ copy.quantity }}
                <input
                  :value="item.quantity"
                  type="number"
                  min="1"
                  inputmode="numeric"
                  @change="updateCartItemQuantity(item.code, $event.target.value)"
                />
              </label>
              <button type="button" @click="removeCartItem(item.code)">{{ copy.remove }}</button>
            </div>
          </article>
        </section>

        <aside class="cart-summary" :aria-label="copy.summaryTitle">
          <h2>{{ copy.summaryTitle }}</h2>

          <div class="cart-summary-lines">
            <p v-if="!localizedSelectedCartItems.length" class="cart-summary-empty">
              {{ copy.summaryEmpty }}
            </p>
            <div v-for="item in localizedSelectedCartItems" :key="`summary-${item.code}`">
              <span>{{ item.name }} x {{ item.quantity }}</span>
              <strong>{{ formatCartPrice(item.price * item.quantity) }}</strong>
            </div>
          </div>

          <div class="cart-summary-total">
            <span>{{ copy.subtotal }}</span>
            <strong>{{ formattedSelectedSubtotal }}</strong>
          </div>
          <div class="cart-summary-total">
            <span>{{ copy.shipping }}</span>
            <strong>{{ formatCartPrice(0) }}</strong>
          </div>
          <div class="cart-summary-total cart-summary-total--grand">
            <span>{{ copy.total }}</span>
            <strong>{{ formattedSelectedSubtotal }}</strong>
          </div>

          <button
            class="cart-checkout"
            type="button"
            :disabled="!selectedCartItems.length || isSubmittingOrder"
            @click="submitOrder"
          >
            {{ isSubmittingOrder ? copy.ordering : copy.order }}
          </button>
          <p v-if="orderStatus" class="cart-order-status" :class="`cart-order-status--${orderStatusType}`">
            {{ orderStatus }}
          </p>
        </aside>
      </div>

    </div>
  </section>

  <div v-if="showWechatModal" class="wechat-order-modal-backdrop" @click.self="closeWechatModal">
    <article class="wechat-order-modal" role="dialog" aria-modal="true" :aria-label="copy.wechatTitle">
      <button class="wechat-order-close" type="button" :aria-label="copy.closeWechat" @click="closeWechatModal">
        &times;
      </button>
      <img src="/images/contact/wechat.jpg" :alt="copy.wechatTitle" />
      <p>{{ copy.wechatHint }}</p>
    </article>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '../composables/useAuth'
import { useCart } from '../composables/useCart'
import { useLocale } from '../composables/useLocale'
import { useOrders } from '../composables/useOrders'
import { formatCurrencyFromCny } from '../utils/currency'
import {
  localizeProductName,
  localizeProductType,
  localizeSeries,
} from '../utils/productLocalization'

const copies = {
  zh: {
    kicker: 'Shopping Bag',
    title: '购物车',
    itemsAria: '购物车货品',
    selectAll: '全选商品',
    selectedCount: (count) => `已选择 ${count} 件`,
    emptyTitle: '购物车为空',
    emptyText: '先挑选一件喜欢的 DERING 作品，再回来下单。',
    continueShopping: '继续选购',
    selectItem: (name) => `选择 ${name}`,
    styleNo: '款号',
    quantity: '数量',
    goodsNo: '货号',
    remove: '移除',
    summaryTitle: '订单概述',
    summaryEmpty: '勾选需要下单的商品后，这里会显示订单明细。',
    subtotal: '小计',
    shipping: '运费',
    total: '总额',
    order: '下单',
    ordering: '正在生成订单...',
    loginRequired: '请先登录后再下单。',
    orderSuccess: '订单 Excel 已生成并开始下载。',
    orderFailed: (message) => `下单失败：${message}`,
    ordersKicker: 'Order History',
    myOrders: '我的订单',
    returnProduct: '返回商品',
    ordersLoginRequired: '登录后可查看我的订单。',
    ordersEmpty: '暂无已提交订单。',
    createdAt: '创建时间',
    orderSummary: (count, total) => `${count} 件商品 / 合计 ${total}`,
    wechatTitle: '微信下单二维码',
    wechatHint: '请扫码添加微信，将订单表格发送至微信下单',
    closeWechat: '关闭微信二维码',
  },
  en: {
    kicker: 'Shopping Bag',
    title: 'Shopping Bag',
    itemsAria: 'Shopping bag items',
    selectAll: 'Select All',
    selectedCount: (count) => `${count} selected`,
    emptyTitle: 'Your bag is empty',
    emptyText: 'Choose a DERING piece you love, then come back to check out.',
    continueShopping: 'Continue Shopping',
    selectItem: (name) => `Select ${name}`,
    styleNo: 'Style No.',
    quantity: 'Qty',
    goodsNo: 'Goods No.',
    remove: 'Remove',
    summaryTitle: 'Order Summary',
    summaryEmpty: 'Select the items you want to check out, and the order details will appear here.',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    total: 'Total',
    order: 'Place Order',
    ordering: 'Creating order...',
    loginRequired: 'Please sign in before placing an order.',
    orderSuccess: 'The order Excel file has been created and is downloading.',
    orderFailed: (message) => `Failed to place order: ${message}`,
    ordersKicker: 'Order History',
    myOrders: 'My Orders',
    returnProduct: 'Back to Product',
    ordersLoginRequired: 'Sign in to view your orders.',
    ordersEmpty: 'No submitted orders yet.',
    createdAt: 'Created At',
    orderSummary: (count, total) => `${count} items / Total ${total}`,
    wechatTitle: 'WeChat order QR code',
    wechatHint: 'Scan the QR code to add us on WeChat, then send the order spreadsheet to place your order.',
    closeWechat: 'Close WeChat QR code',
  },
}

const LAST_CART_PRODUCT_STORAGE_KEY = 'dering-last-cart-product'
const router = useRouter()
const { locale, currencyRegion } = useLocale()
const { currentUser } = useAuth()
const {
  cartItems,
  selectedCartItems,
  selectedCartCount,
  selectedCartSubtotal,
  updateCartItemQuantity,
  setCartItemSelected,
  setAllCartItemsSelected,
  removeCartItem,
  removeCartItems,
} = useCart()
const { addOrder } = useOrders()

const copy = computed(() => copies[locale.value] ?? copies.zh)
const isAllSelected = computed(
  () => cartItems.value.length > 0 && cartItems.value.every((item) => item.selected !== false),
)
const localizedCartItems = computed(() => cartItems.value.map(localizeCartItem))
const localizedSelectedCartItems = computed(() => selectedCartItems.value.map(localizeCartItem))
const formattedSelectedSubtotal = computed(() => formatCartPrice(selectedCartSubtotal.value))
const isSubmittingOrder = ref(false)
const orderStatus = ref('')
const orderStatusType = ref('info')
const showWechatModal = ref(false)
const lastCartProduct = ref(readLastCartProduct())

function toggleAllSelected(event) {
  setAllCartItemsSelected(event.target.checked)
}

onMounted(() => {
  if (!currentUser.value) {
    window.alert(copy.value.loginRequired)
    router.push({ name: 'login' })
  }
})

function readLastCartProduct() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = window.localStorage.getItem(LAST_CART_PRODUCT_STORAGE_KEY)
    const item = stored ? JSON.parse(stored) : null
    return item?.code ? item : null
  } catch {
    window.localStorage.removeItem(LAST_CART_PRODUCT_STORAGE_KEY)
    return null
  }
}

function returnToLastProduct() {
  if (!lastCartProduct.value?.code) {
    router.push({ name: 'products' })
    return
  }

  router.push({
    name: 'products',
    query: {
      ...(lastCartProduct.value.query || {}),
      product: lastCartProduct.value.code,
    },
  })
}

function localizeCartItem(item) {
  const activeLocale = locale.value
  const rawName = item.rawName || item.name
  const rawType = item.rawType || item.type
  const rawSeries = item.rawSeries || item.series

  return {
    ...item,
    name: localizeProductName(rawName, activeLocale),
    type: localizeProductType(rawType, activeLocale),
    series: localizeSeries(rawSeries, activeLocale),
  }
}

function formatCartPrice(price) {
  const numericPrice = Number(price)
  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return formatCurrencyFromCny(0, currencyRegion.value)
  }

  return formatCurrencyFromCny(numericPrice, currencyRegion.value)
}

function setOrderStatus(message, type = 'info') {
  orderStatus.value = message
  orderStatusType.value = type
}

function getOrderNickname() {
  return String(currentUser.value?.nickname || '').trim()
}

function getAuthToken() {
  return String(currentUser.value?.token || '').trim()
}

function getSelectedOrderItems() {
  return selectedCartItems.value.map((item) => ({
    styleNo: item.styleNo || item.code,
    goodsNo: item.goodsNo || null,
    quantity: Math.max(1, Number(item.quantity) || 1),
  }))
}

function getSelectedOrderSnapshot(nickname, createdAt) {
  const items = selectedCartItems.value.map((item) => {
    const quantity = Math.max(1, Number(item.quantity) || 1)

    return {
      code: item.code,
      styleNo: item.styleNo || item.code,
      goodsNo: item.goodsNo || '',
      goodsWeight: item.goodsWeight || '',
      goldWeight: item.goldWeight || '',
      sideStoneWeight: item.sideStoneWeight || '',
      rawName: item.rawName || item.name,
      rawType: item.rawType || item.type,
      rawSeries: item.rawSeries || item.series,
      name: item.name,
      type: item.type,
      series: item.series,
      image: item.image,
      price: Number(item.price || 0),
      quantity,
      lineTotal: Number(item.price || 0) * quantity,
    }
  })

  return {
    id: `${createdAt}-${Date.now()}`,
    nickname,
    createdAt,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    total: items.reduce((total, item) => total + item.lineTotal, 0),
    items,
  }
}

async function readApiError(response) {
  try {
    const payload = await response.json()
    return payload.detail || payload.message || `HTTP ${response.status}`
  } catch {
    return `HTTP ${response.status}`
  }
}

function resolveDownloadFilename(contentDisposition, fallbackName) {
  if (!contentDisposition) {
    return fallbackName
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      return utf8Match[1]
    }
  }

  const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i)
  return filenameMatch?.[1] || fallbackName
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function closeWechatModal() {
  showWechatModal.value = false
}

function getOrderCreatedAt() {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join('-') + ` ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

async function submitOrder() {
  if (!selectedCartItems.value.length || isSubmittingOrder.value) {
    return
  }

  const nickname = getOrderNickname()
  const token = getAuthToken()
  if (!nickname || !token) {
    setOrderStatus(copy.value.loginRequired, 'error')
    router.push({ name: 'login' })
    return
  }

  isSubmittingOrder.value = true
  setOrderStatus('')
  const createdAt = getOrderCreatedAt()
  const selectedCodes = selectedCartItems.value.map((item) => item.code)
  const orderSnapshot = getSelectedOrderSnapshot(nickname, createdAt)

  try {
    const response = await fetch('/api/orders/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nickname,
        createdAt,
        items: getSelectedOrderItems(),
      }),
    })

    if (!response.ok) {
      throw new Error(await readApiError(response))
    }

    const blob = await response.blob()
    const filename = resolveDownloadFilename(
      response.headers.get('Content-Disposition'),
      `DERING订单-${nickname}.xlsx`,
    )

    downloadBlob(blob, filename)
    addOrder(orderSnapshot)
    removeCartItems(selectedCodes)
    showWechatModal.value = true
    setOrderStatus(copy.value.orderSuccess, 'success')
  } catch (error) {
    console.error('Failed to export order:', error)
    setOrderStatus(copy.value.orderFailed(error.message || 'Unknown error'), 'error')
  } finally {
    isSubmittingOrder.value = false
  }
}
</script>

<template>
  <section class="cart-page orders-page">
    <div class="cart-shell">
      <header class="cart-head">
        <p>{{ copy.kicker }}</p>
        <h1>{{ copy.title }}</h1>
        <RouterLink class="orders-back-link" :to="{ name: 'cart' }">{{ copy.backToCart }}</RouterLink>
      </header>

      <section class="cart-orders" :aria-label="copy.title">
        <p v-if="!currentNickname" class="cart-orders-empty">{{ copy.loginRequired }}</p>
        <p v-else-if="!localizedOrderHistory.length" class="cart-orders-empty">
          {{ copy.empty }}
        </p>

        <article v-for="order in localizedOrderHistory" :key="order.id" class="cart-order-group">
          <header>
            <div>
              <span>{{ copy.createdAt }}</span>
              <strong>{{ order.createdAt }}</strong>
            </div>
            <div class="cart-order-actions">
              <p>{{ copy.orderSummary(order.itemCount, formatCartPrice(order.total)) }}</p>
              <button type="button" @click="deleteOrder(order.id)">{{ copy.deleteOrder }}</button>
            </div>
          </header>

          <div class="cart-order-products">
            <div v-for="item in order.items" :key="`${order.id}-${item.code}`" class="cart-order-product">
              <img :src="item.image" :alt="item.name" />
              <div>
                <p>{{ item.type }}<span v-if="item.series"> / {{ item.series }}</span></p>
                <h3>{{ item.name }}</h3>
                <span>{{ copy.styleNo }}: {{ item.styleNo || item.code }}</span>
                <span v-if="item.goodsNo">{{ copy.goodsNo }}: {{ item.goodsNo }}</span>
              </div>
              <div class="cart-order-product-actions">
                <strong>{{ formatCartPrice(item.price) }} x {{ item.quantity }}</strong>
                <button type="button" @click="addItemBackToCart(item)">{{ copy.addToCart }}</button>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  </section>

  <div v-if="statusMessage" class="wechat-order-modal-backdrop" @click.self="closeStatusModal">
    <article class="order-status-modal" role="dialog" aria-modal="true" :aria-label="statusMessage">
      <p>{{ statusMessage }}</p>
      <button type="button" @click="closeStatusModal">{{ copy.confirm }}</button>
    </article>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

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
    kicker: 'Order History',
    title: '我的订单',
    backToCart: '返回购物车',
    loginRequired: '登录后可查看我的订单。',
    empty: '暂无已提交订单。',
    createdAt: '创建时间',
    styleNo: '款号',
    goodsNo: '货号',
    orderSummary: (count, total) => `${count} 件商品 / 合计 ${total}`,
    deleteOrder: '删除订单',
    addToCart: '加入购物车',
    deletedOrder: '删除订单成功',
    addedToCart: '加入购物车成功',
    confirm: '确定',
  },
  en: {
    kicker: 'Order History',
    title: 'My Orders',
    backToCart: 'Back to Shopping Bag',
    loginRequired: 'Sign in to view your orders.',
    empty: 'No submitted orders yet.',
    createdAt: 'Created At',
    styleNo: 'Style No.',
    goodsNo: 'Goods No.',
    orderSummary: (count, total) => `${count} items / Total ${total}`,
    deleteOrder: 'Delete Order',
    addToCart: 'Add to Bag',
    deletedOrder: 'Order deleted',
    addedToCart: 'Added to bag',
    confirm: 'OK',
  },
}

const { currentUser } = useAuth()
const { locale, currencyRegion } = useLocale()
const { addCartItem } = useCart()
const { orderHistory, removeOrder } = useOrders()

const copy = computed(() => copies[locale.value] ?? copies.zh)
const currentNickname = computed(() => String(currentUser.value?.nickname || '').trim())
const localizedOrderHistory = computed(() =>
  orderHistory.value
    .filter((order) => order.nickname === currentNickname.value)
    .map(localizeOrder),
)
const statusMessage = ref('')

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

function localizeOrder(order) {
  return {
    ...order,
    items: (order.items ?? []).map(localizeCartItem),
  }
}

function formatCartPrice(price) {
  const numericPrice = Number(price)
  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return formatCurrencyFromCny(0, currencyRegion.value)
  }

  return formatCurrencyFromCny(numericPrice, currencyRegion.value)
}

function deleteOrder(orderId) {
  removeOrder(orderId)
  statusMessage.value = copy.value.deletedOrder
}

function addItemBackToCart(item) {
  if (!currentUser.value) {
    statusMessage.value = copy.value.loginRequired
    return
  }

  const added = addCartItem({
    ...item,
    name: item.rawName || item.name,
    type: item.rawType || item.type,
    series: item.rawSeries || item.series,
    displayName: item.name,
    displayType: item.type,
    displaySeries: item.series,
  })

  if (!added) {
    statusMessage.value = copy.value.loginRequired
    return
  }

  statusMessage.value = copy.value.addedToCart
}

function closeStatusModal() {
  statusMessage.value = ''
}
</script>

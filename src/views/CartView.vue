<template>
  <section class="cart-page">
    <div class="cart-shell">
      <header class="cart-head">
        <p>{{ copy.kicker }}</p>
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
              <span>{{ copy.styleNo }}: {{ item.code }}</span>
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

          <button class="cart-checkout" type="button" :disabled="!selectedCartItems.length">
            {{ copy.checkout }}
          </button>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

import { useCart } from '../composables/useCart'
import { useLocale } from '../composables/useLocale'
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
    emptyText: '先挑选一件喜欢的 DERING 作品，再回来结账。',
    continueShopping: '继续选购',
    selectItem: (name) => `选择 ${name}`,
    styleNo: '款号',
    quantity: '数量',
    remove: '移除',
    summaryTitle: '订单概述',
    summaryEmpty: '勾选需要结账的商品后，这里会显示订单明细。',
    subtotal: '小计',
    shipping: '运费',
    total: '总额',
    checkout: '结账',
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
    remove: 'Remove',
    summaryTitle: 'Order Summary',
    summaryEmpty: 'Select the items you want to check out, and the order details will appear here.',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    total: 'Total',
    checkout: 'Checkout',
  },
}

const { locale, currencyRegion } = useLocale()
const {
  cartItems,
  selectedCartItems,
  selectedCartCount,
  selectedCartSubtotal,
  updateCartItemQuantity,
  setCartItemSelected,
  setAllCartItemsSelected,
  removeCartItem,
} = useCart()

const copy = computed(() => copies[locale.value] ?? copies.zh)
const isAllSelected = computed(
  () => cartItems.value.length > 0 && cartItems.value.every((item) => item.selected !== false),
)
const localizedCartItems = computed(() => cartItems.value.map(localizeCartItem))
const localizedSelectedCartItems = computed(() => selectedCartItems.value.map(localizeCartItem))
const formattedSelectedSubtotal = computed(() => formatCartPrice(selectedCartSubtotal.value))

function toggleAllSelected(event) {
  setAllCartItemsSelected(event.target.checked)
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
</script>

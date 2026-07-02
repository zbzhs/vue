<template>
  <section class="search-page">
    <div class="search-page-shell">
      <form class="search-page-form" @submit.prevent="submitSearch">
        <label>
          <span>{{ ui.title }}</span>
          <input
            ref="searchInput"
            v-model.trim="searchQuery"
            type="search"
            :placeholder="ui.placeholder"
          />
        </label>
        <button type="submit" :aria-label="ui.title">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M15.5 15.5 21 21" />
          </svg>
        </button>
      </form>

      <p v-if="isLoading" class="search-page-state">{{ ui.loading }}</p>
      <p v-else-if="loadError" class="search-page-state">{{ ui.loadError }}</p>
      <p v-else-if="searchQuery && !filteredProducts.length" class="search-page-state">
        {{ ui.empty }}
      </p>

      <div v-if="!isLoading && !loadError && filteredProducts.length" class="search-page-grid">
        <button
          v-for="product in filteredProducts"
          :key="product.code"
          class="search-product-card"
          type="button"
          @click="openProduct(product)"
        >
          <span>
            <img :src="product.image" :alt="product.displayName" />
          </span>
          <strong>{{ product.displayName }}</strong>
          <small>{{ product.displayType }} / {{ product.displaySeries }}</small>
          <em>{{ formatPrice(product.price) }}</em>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useLocale } from '../composables/useLocale'
import { formatCurrencyFromCny } from '../utils/currency'
import {
  localizeFreeText,
  localizeMaterial,
  localizeProductName,
  localizeProductType,
  localizeSeries,
} from '../utils/productLocalization'

const route = useRoute()
const router = useRouter()
const { locale, currencyRegion } = useLocale()

const products = ref([])
const isLoading = ref(true)
const loadError = ref(false)
const searchInput = ref(null)
const searchQuery = ref('')

const ui = computed(() => {
  if (locale.value === 'en') {
    return {
      title: 'Search',
      placeholder: 'Search by product name, category, collection, style number',
      loading: 'Loading products...',
      loadError: 'Failed to load products.',
      empty: 'No products found.',
      priceOnRequest: 'Price on request',
    }
  }

  return {
    title: '搜索',
    placeholder: '搜索商品名称、品类、系列或款号',
    loading: '正在加载商品...',
    loadError: '商品加载失败，请稍后重试。',
    empty: '暂无匹配商品。',
    priceOnRequest: '面议',
  }
})

const localizedProducts = computed(() => {
  return products.value.map((product) => ({
    ...product,
    displayName: localizeProductName(product.name, locale.value),
    displayType: localizeProductType(product.type, locale.value),
    displaySeries: localizeSeries(product.series, locale.value),
    displayMaterial: localizeMaterial(product.material, locale.value),
    displayNote: localizeFreeText(product.note, locale.value),
  }))
})

const normalizedSearch = computed(() => searchQuery.value.trim().toLowerCase())

const filteredProducts = computed(() => {
  if (!normalizedSearch.value) {
    return []
  }

  return localizedProducts.value.filter((product) => searchText(product).includes(normalizedSearch.value))
})

function searchText(product) {
  return [
    product.name,
    product.displayName,
    product.type,
    product.displayType,
    product.series,
    product.displaySeries,
    product.code,
    product.styleNo,
    product.note,
    product.displayNote,
    product.material,
    product.displayMaterial,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function formatPrice(price) {
  const numericPrice = Number(price)
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return ui.value.priceOnRequest
  }

  return formatCurrencyFromCny(numericPrice, currencyRegion.value)
}

async function loadProducts() {
  isLoading.value = true
  loadError.value = false

  try {
    const response = await fetch('/api/products')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json()
    products.value = Array.isArray(payload) ? payload : payload.products ?? []
  } catch (error) {
    console.error('Failed to load search products:', error)
    loadError.value = true
    products.value = []
  } finally {
    isLoading.value = false
  }
}

function submitSearch() {
  router.replace({ name: 'search', query: searchQuery.value ? { q: searchQuery.value } : {} })
}

function openProduct(product) {
  router.push({ name: 'products', query: { product: product.code } })
}

onMounted(async () => {
  searchQuery.value = Array.isArray(route.query.q) ? route.query.q[0] : route.query.q || ''
  await loadProducts()
  await nextTick()
  searchInput.value?.focus()
})

watch(
  () => route.query.q,
  (query) => {
    const nextQuery = Array.isArray(query) ? query[0] : query || ''
    if (searchQuery.value !== nextQuery) {
      searchQuery.value = nextQuery
    }
  },
)
</script>

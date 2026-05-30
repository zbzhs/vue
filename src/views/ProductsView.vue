<template>
  <section class="page-hero compact-hero products-hero">
    <div class="hero-brand-mark" aria-hidden="true">DERING</div>
    <div>
      <p class="eyebrow">Products</p>
      <h1>产品展示</h1>
      <p>戒指、项链、耳饰、手链与高级定制系列，全部改为数据库真实商品数据展示。</p>
    </div>
  </section>

  <div v-if="showFilterPanel" class="filter-drawer-backdrop" @click.self="showFilterPanel = false">
    <aside class="filter-drawer" aria-label="产品筛选菜单">
      <button class="drawer-close" type="button" @click="showFilterPanel = false">
        <span aria-hidden="true">&times;</span>
        关闭
      </button>

      <button class="drawer-search-toggle" type="button" aria-label="搜索产品" @click="showDrawerSearch = !showDrawerSearch">
        <span></span>
      </button>

      <div v-if="showDrawerSearch" class="drawer-search">
        <input
          v-model.trim="searchQuery"
          type="search"
          placeholder="搜索产品"
          @keydown.enter.prevent="applyFilters"
        />
      </div>

      <div class="drawer-filter-group">
        <div class="drawer-filter-head">
          <h2>饰品类型</h2>
          <span aria-hidden="true">+</span>
        </div>
        <button
          v-for="type in filterTypes"
          :key="type"
          type="button"
          :class="{ active: draftType === type }"
          @click="selectTypeFilter(type)"
        >
          {{ type }}
        </button>
      </div>

      <div class="drawer-filter-group">
        <div class="drawer-filter-head">
          <h2>价格区间</h2>
          <span aria-hidden="true">+</span>
        </div>
        <button
          v-for="range in priceRanges"
          :key="range.label"
          type="button"
          :class="{ active: draftPrice === range.label }"
          @click="selectPriceFilter(range.label)"
        >
          {{ range.label }}
        </button>
      </div>

      <div class="drawer-filter-group">
        <div class="drawer-filter-head">
          <h2>系列</h2>
          <span aria-hidden="true">+</span>
        </div>
        <button
          v-for="series in filterSeries"
          :key="series"
          type="button"
          :class="{ active: draftSeries === series }"
          @click="selectSeriesFilter(series)"
        >
          {{ series }}
        </button>
      </div>

      <div class="drawer-filter-actions">
        <button class="drawer-reset" type="button" @click="resetFilters">重置</button>
        <button class="drawer-submit" type="button" @click="applyFilters">提交筛选</button>
      </div>

      <nav class="drawer-links" aria-label="更多链接">
        <a href="#product-section">联系我们</a>
        <a href="#product-section">服务支持</a>
        <a href="#product-section">门店信息</a>
      </nav>
    </aside>
  </div>

  <section class="product-discovery" aria-label="产品搜索与筛选">
    <div class="product-toolbar">
      <div class="search-panel">
        <div class="search-main">
          <label class="search-box">
            <input
              v-model.trim="searchQuery"
              type="search"
              placeholder="输入名称、品类、系列、款号或备注"
              @keydown.enter.prevent="showProducts"
            />
          </label>
          <button class="search-action" type="button" @click="showProducts">搜索</button>
        </div>

        <div v-if="searchQuery && recommendedProducts.length" class="recommend-panel">
          <p>为你推荐</p>
          <button
            v-for="product in recommendedProducts"
            :key="product.code"
            type="button"
            @mouseenter="triggerImageSwap(product.code)"
            @click="chooseRecommendation(product)"
          >
            <img :src="resolveProductImage(product.image, product.code)" :alt="product.name" />
            <span>
              <strong>{{ product.name }}</strong>
              <small>{{ product.type }} / {{ product.series }} / {{ formatPrice(product.price) }}</small>
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>

  <section id="product-section" ref="productSection" class="content-section products-section">
    <div class="result-head">
      <button class="product-menu-toggle" type="button" @click="toggleFilterPanel">
        <span></span>
        菜单
        <span v-if="activeFilterCount" class="menu-filter-count">{{ activeFilterCount }}</span>
      </button>
    </div>

    <p v-if="isLoading" class="empty-products">正在加载产品数据...</p>
    <p v-else-if="loadError" class="empty-products">{{ loadError }}</p>

    <div v-else class="product-grid">
      <button
        v-for="product in filteredProducts"
        :key="product.code"
        class="product-card"
        type="button"
        @mouseenter="triggerImageSwap(product.code)"
        @click="openProduct(product)"
      >
        <img :src="resolveProductImage(product.image, product.code)" :alt="product.name" />
        <div class="product-info">
          <p>{{ product.type }}</p>
          <h2>{{ product.name }}</h2>
          <span>{{ product.note || product.series }}</span>
          <strong>{{ formatPrice(product.price) }}</strong>
        </div>
      </button>
    </div>

    <p v-if="!isLoading && !loadError && filteredProducts.length === 0" class="empty-products">
      暂无符合条件的产品
    </p>
  </section>

  <footer class="home-footer product-page-footer" aria-label="产品页底部导航">
    <div class="home-footer-brand">DERING</div>
    <nav class="home-footer-links" aria-label="珠宝知识">
      <RouterLink to="/process">生产工艺</RouterLink>
      <RouterLink to="/4c">4C标准</RouterLink>
      <RouterLink to="/advantages">核心优势</RouterLink>
      <RouterLink to="/buying-guide">选购指南</RouterLink>
      <RouterLink to="/faq">常见问题</RouterLink>
    </nav>
  </footer>

  <div v-if="activeProduct" class="product-detail-backdrop" @click.self="closeProduct">
    <article class="product-detail" aria-modal="true" role="dialog" @mouseenter="triggerImageSwap(activeProduct.code)">
      <button class="detail-close" type="button" aria-label="关闭详情" @click="closeProduct">&times;</button>
      <img :src="resolveProductImage(activeProduct.image, activeProduct.code)" :alt="activeProduct.name" />

      <div class="detail-copy">
        <p class="detail-series">{{ activeProduct.series }}</p>
        <h2>{{ activeProduct.name }}</h2>
        <strong>{{ formatPrice(activeProduct.price) }}</strong>
        <p>款号：{{ activeProduct.code }} | {{ activeProduct.brand }}</p>

        <dl class="detail-specs">
          <div v-for="item in activeProduct.specs" :key="`${activeProduct.code}-${item.label}`">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>

        <p v-if="activeProduct.sellingPoint">{{ activeProduct.sellingPoint }}</p>
        <p v-if="activeProduct.guaranteeLines.length">{{ activeProduct.guaranteeLines.join(' / ') }}</p>
        <p v-if="activeProduct.remark">{{ activeProduct.remark }}</p>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const allLabel = '全部'
const primaryImagePrefix = '/images/products/'
const alternateImagePrefix = '/images/products%201/'
const imageSwapIntervalMs = 2000
const route = useRoute()

const priceRanges = [
  { label: allLabel },
  { label: '¥2,000 以下', min: 0, max: 1999 },
  { label: '¥2,000-¥5,000', min: 2000, max: 5000 },
  { label: '¥5,000-¥10,000', min: 5001, max: 10000 },
  { label: '¥10,000 以上', min: 10001, max: Infinity },
]

const products = ref([])
const isLoading = ref(true)
const loadError = ref('')
const searchQuery = ref('')
const selectedType = ref(allLabel)
const selectedPrice = ref(allLabel)
const selectedSeries = ref(allLabel)
const draftType = ref(allLabel)
const draftPrice = ref(allLabel)
const draftSeries = ref(allLabel)
const showFilterPanel = ref(false)
const showDrawerSearch = ref(false)
const activeProduct = ref(null)
const productSection = ref(null)
const imageSwapTick = ref(0)
const imageSwapOverrides = ref({})
let imageSwapTimerId = null

const filterTypes = computed(() => {
  return [allLabel, ...new Set(products.value.map((product) => product.type).filter(Boolean))]
})

const filterSeries = computed(() => {
  return [allLabel, ...new Set(products.value.map((product) => product.series).filter(Boolean))]
})

const normalizedSearch = computed(() => searchQuery.value.trim().toLowerCase())

const searchedProducts = computed(() => {
  if (!normalizedSearch.value) {
    return products.value
  }

  return products.value.filter((product) => searchText(product).includes(normalizedSearch.value))
})

const recommendedProducts = computed(() => searchedProducts.value.slice(0, 4))

const filteredProducts = computed(() => {
  const priceRange = priceRanges.find((range) => range.label === selectedPrice.value) ?? priceRanges[0]

  return searchedProducts.value.filter((product) => {
    const matchesType = selectedType.value === allLabel || product.type === selectedType.value
    const matchesSeries = selectedSeries.value === allLabel || product.series === selectedSeries.value
    const price = Number(product.price ?? 0)
    const matchesPrice = selectedPrice.value === allLabel || (price >= priceRange.min && price <= priceRange.max)

    return matchesType && matchesSeries && matchesPrice
  })
})

const activeFilterCount = computed(() => {
  return [selectedType.value, selectedPrice.value, selectedSeries.value].filter((value) => value !== allLabel).length
})

function searchText(product) {
  return [
    product.name,
    product.type,
    product.series,
    product.code,
    product.note,
    product.material,
    product.remark,
    product.sellingPoint,
    ...(product.specs ?? []).map((item) => item.value),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function formatPrice(price) {
  const numericPrice = Number(price)
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return '面议'
  }

  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
  }).format(numericPrice)
}

function resolveProductImage(image, code) {
  if (!image || typeof image !== 'string') {
    return image
  }

  if (!image.startsWith(primaryImagePrefix)) {
    return image
  }

  const overrideTick = code ? (imageSwapOverrides.value[code] ?? 0) : 0
  const shouldUseAlternate = (imageSwapTick.value + overrideTick) % 2 === 1

  if (!shouldUseAlternate) {
    return image
  }

  return image.replace(primaryImagePrefix, alternateImagePrefix)
}

function restartImageSwapTimer() {
  if (imageSwapTimerId !== null) {
    window.clearInterval(imageSwapTimerId)
  }

  imageSwapTimerId = window.setInterval(() => {
    imageSwapTick.value += 1
  }, imageSwapIntervalMs)
}

function triggerImageSwap(code) {
  if (!code) {
    return
  }

  imageSwapOverrides.value = {
    ...imageSwapOverrides.value,
    [code]: (imageSwapOverrides.value[code] ?? 0) + 1,
  }
}

async function loadProducts() {
  isLoading.value = true
  loadError.value = ''

  try {
    const response = await fetch('/api/products', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json()
    const items = Array.isArray(payload) ? payload : payload.products
    products.value = Array.isArray(items) ? items : []
  } catch (error) {
    console.error('Failed to load products:', error)
    loadError.value = '产品数据加载失败，请检查 API 接口或数据库连接。'
    products.value = []
  } finally {
    isLoading.value = false
  }
}

function syncSeriesFromRoute() {
  const routeSeries = Array.isArray(route.query.series) ? route.query.series[0] : route.query.series

  if (!routeSeries) {
    return
  }

  const matchedSeries = products.value.find((product) => product.series === routeSeries)?.series
  if (!matchedSeries) {
    return
  }

  selectedSeries.value = matchedSeries
  draftSeries.value = matchedSeries
  selectedType.value = allLabel
  draftType.value = allLabel
  selectedPrice.value = allLabel
  draftPrice.value = allLabel
}

function toggleFilterPanel() {
  draftType.value = selectedType.value
  draftPrice.value = selectedPrice.value
  draftSeries.value = selectedSeries.value
  showFilterPanel.value = !showFilterPanel.value
}

async function showProducts() {
  await scrollToProducts()
}

async function applyFilters() {
  selectedType.value = draftType.value
  selectedPrice.value = draftPrice.value
  selectedSeries.value = draftSeries.value
  showFilterPanel.value = false
  await scrollToProducts()
}

function selectTypeFilter(type) {
  draftType.value = type
  selectedType.value = type
}

function selectPriceFilter(price) {
  draftPrice.value = price
  selectedPrice.value = price
}

function selectSeriesFilter(series) {
  draftSeries.value = series
  selectedSeries.value = series
}

function resetFilters() {
  draftType.value = allLabel
  draftPrice.value = allLabel
  draftSeries.value = allLabel
  selectedType.value = allLabel
  selectedPrice.value = allLabel
  selectedSeries.value = allLabel
}

async function chooseRecommendation(product) {
  searchQuery.value = product.name
  await showProducts()
}

async function scrollToProducts() {
  await nextTick()
  productSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function openProduct(product) {
  activeProduct.value = product
}

function closeProduct() {
  activeProduct.value = null
}

onMounted(() => {
  loadProducts()
  restartImageSwapTimer()
})

onBeforeUnmount(() => {
  if (imageSwapTimerId !== null) {
    window.clearInterval(imageSwapTimerId)
  }
})

watch(
  () => [route.query.series, products.value.length],
  () => {
    syncSeriesFromRoute()
  },
  { immediate: true },
)
</script>

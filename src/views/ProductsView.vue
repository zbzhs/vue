<template>
  <section class="page-hero compact-hero products-hero">
    <div class="hero-brand-mark" aria-hidden="true">DERING</div>
    <div>
      <p class="eyebrow">{{ ui.heroKicker }}</p>
      <h1>{{ ui.heroTitle }}</h1>
      <p>{{ ui.heroSummary }}</p>
    </div>
  </section>

  <div v-if="showFilterPanel" class="filter-drawer-backdrop" @click.self="showFilterPanel = false">
    <aside class="filter-drawer" :aria-label="ui.filterMenuAria">
      <button class="drawer-close" type="button" @click="showFilterPanel = false">
        <span aria-hidden="true">&times;</span>
        {{ ui.close }}
      </button>

      <button
        class="drawer-search-toggle"
        type="button"
        :aria-label="ui.searchProducts"
        @click="showDrawerSearch = !showDrawerSearch"
      >
        <span></span>
      </button>

      <div v-if="showDrawerSearch" class="drawer-search">
        <input
          v-model.trim="searchQuery"
          type="search"
          :placeholder="ui.searchProducts"
          @keydown.enter.prevent="applyFilters"
        />
      </div>

      <div class="drawer-filter-group">
        <div class="drawer-filter-head">
          <h2>{{ ui.typeLabel }}</h2>
          <span aria-hidden="true">+</span>
        </div>
        <button
          v-for="type in filterTypes"
          :key="type"
          type="button"
          :class="{ active: draftType === type }"
          @click="selectTypeFilter(type)"
        >
          {{ displayType(type) }}
        </button>
      </div>

      <div class="drawer-filter-group">
        <div class="drawer-filter-head">
          <h2>{{ ui.priceLabel }}</h2>
          <span aria-hidden="true">+</span>
        </div>
        <button
          v-for="range in priceRanges"
          :key="range.id"
          type="button"
          :class="{ active: draftPrice === range.id }"
          @click="selectPriceFilter(range.id)"
        >
          {{ displayPriceRange(range) }}
        </button>
      </div>

      <div class="drawer-filter-group">
        <div class="drawer-filter-head">
          <h2>{{ ui.seriesLabel }}</h2>
          <span aria-hidden="true">+</span>
        </div>
        <button
          v-for="series in filterSeries"
          :key="series"
          type="button"
          :class="{ active: draftSeries === series }"
          @click="selectSeriesFilter(series)"
        >
          {{ displaySeries(series) }}
        </button>
      </div>

      <div class="drawer-filter-actions">
        <button class="drawer-reset" type="button" @click="resetFilters">{{ ui.reset }}</button>
        <button class="drawer-submit" type="button" @click="applyFilters">{{ ui.submit }}</button>
      </div>

      <nav class="drawer-links" :aria-label="ui.moreLinksAria">
        <a href="#product-section">{{ ui.contactLink }}</a>
        <a href="#product-section">{{ ui.supportLink }}</a>
        <a href="#product-section">{{ ui.storeLink }}</a>
      </nav>
    </aside>
  </div>

  <section class="product-discovery" :aria-label="ui.discoveryAria">
    <div class="product-toolbar">
      <div class="search-panel">
        <div class="search-main">
          <label class="search-box">
            <input
              v-model.trim="searchQuery"
              type="search"
              :placeholder="ui.searchPlaceholder"
              @keydown.enter.prevent="showProducts"
            />
          </label>
          <button class="search-action" type="button" @click="showProducts">{{ ui.search }}</button>
        </div>

        <div v-if="searchQuery && recommendedProducts.length" class="recommend-panel">
          <p>{{ ui.recommend }}</p>
          <button
            v-for="product in recommendedProducts"
            :key="product.code"
            type="button"
            @mouseenter="triggerImageSwap(product.code)"
            @click="chooseRecommendation(product)"
          >
            <img :src="resolveProductImage(product.image, product.code)" :alt="product.displayName" />
            <span>
              <strong>{{ product.displayName }}</strong>
              <small>
                {{ product.displayType }} / {{ product.displaySeries }} / {{ formatPrice(product.price) }}
              </small>
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
        {{ ui.menu }}
        <span v-if="activeFilterCount" class="menu-filter-count">{{ activeFilterCount }}</span>
      </button>
    </div>

    <p v-if="isLoading" class="empty-products">{{ ui.loading }}</p>
    <p v-else-if="loadError" class="empty-products">{{ ui.loadError }}</p>

    <div v-else class="product-grid">
      <button
        v-for="product in filteredProducts"
        :key="product.code"
        class="product-card"
        type="button"
        @mouseenter="triggerImageSwap(product.code)"
        @click="openProduct(product)"
      >
        <img :src="resolveProductImage(product.image, product.code)" :alt="product.displayName" />
        <div class="product-info">
          <p>{{ product.displayType }}</p>
          <h2>{{ product.displayName }}</h2>
          <span>{{ product.displayNote || product.displaySeries }}</span>
          <strong>{{ formatPrice(product.price) }}</strong>
        </div>
      </button>
    </div>

    <p v-if="!isLoading && !loadError && filteredProducts.length === 0" class="empty-products">
      {{ ui.empty }}
    </p>
  </section>

  <KnowledgeFooter footer-class="home-footer product-page-footer" />

  <div v-if="activeProduct" class="product-detail-backdrop" @click.self="closeProduct">
    <article
      class="product-detail"
      aria-modal="true"
      role="dialog"
      @mouseenter="triggerImageSwap(activeProduct.code)"
    >
      <button class="detail-close" type="button" :aria-label="ui.closeDetail" @click="closeProduct">
        &times;
      </button>
      <div class="detail-media">
        <img class="detail-main-image" :src="activeDetailImage" :alt="activeProduct.displayName" />

        <div v-if="activeProductGalleryImages.length > 1" class="detail-thumbs">
          <button
            v-for="(image, index) in activeProductGalleryImages"
            :key="`${activeProduct.code}-thumb-${index}`"
            type="button"
            class="detail-thumb"
            :class="{ active: activeDetailImage === image }"
            @click="activeDetailImage = image"
          >
            <img :src="image" :alt="`${activeProduct.displayName} ${index + 1}`" />
          </button>
        </div>
      </div>

      <div class="detail-copy">
        <h2>{{ activeProduct.displayName }}</h2>
        <strong>{{ formatPrice(activeProduct.price) }}</strong>
        <p>{{ ui.styleNo }}: {{ activeProduct.code }} | {{ activeProduct.brand }}</p>

        <dl class="detail-specs">
          <div
            v-for="item in activeProduct.displaySpecs"
            :key="`${activeProduct.code}-${item.rawLabel}`"
          >
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>

        <p v-if="activeProduct.displaySellingPoint">{{ activeProduct.displaySellingPoint }}</p>
        <p v-if="activeProduct.displayRemark">{{ activeProduct.displayRemark }}</p>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import KnowledgeFooter from '../components/KnowledgeFooter.vue'
import { useLocale } from '../composables/useLocale'
import {
  localizeFreeText,
  localizeMaterial,
  localizeProductName,
  localizeProductType,
  localizeSeries,
  localizeSpecLabel,
  localizeSpecValue,
} from '../utils/productLocalization'

const allFilterKey = '__all__'
const primaryImagePrefix = '/images/products/'
const alternateImagePrefix = '/images/products%201/'
const imageSwapIntervalMs = 2000
const hiddenDetailSpecLabels = new Set(['系列', '石颜色', '实时库存', '达播价', '佣金', '未出货数'])
const hiddenDetailTexts = new Set(['送胶耳堵', 'Complimentary silicone backs'])
const route = useRoute()
const { locale } = useLocale()

const uiCopy = {
  zh: {
    heroKicker: 'Products',
    heroTitle: '产品展示',
    heroSummary: '戒指、项链、耳饰、手链与高级定制系列，全部改为数据库真实商品数据展示。',
    filterMenuAria: '产品筛选菜单',
    close: '关闭',
    searchProducts: '搜索产品',
    typeLabel: '饰品类型',
    priceLabel: '价格区间',
    seriesLabel: '系列',
    reset: '重置',
    submit: '提交筛选',
    moreLinksAria: '更多链接',
    contactLink: '联系我们',
    supportLink: '服务支持',
    storeLink: '门店信息',
    discoveryAria: '产品搜索与筛选',
    searchPlaceholder: '输入名称、品类、系列、款号或备注',
    search: '搜索',
    recommend: '为你推荐',
    menu: '菜单',
    loading: '正在加载产品数据...',
    loadError: '产品数据加载失败，请检查 API 接口或数据库连接。',
    empty: '暂无符合条件的产品',
    closeDetail: '关闭详情',
    styleNo: '款号',
    all: '全部',
  },
  en: {
    heroKicker: 'Products',
    heroTitle: 'Product Showcase',
    heroSummary: 'Rings, necklaces, earrings, bracelets, and bespoke lines are now displayed with live database-backed product data.',
    filterMenuAria: 'Product filter menu',
    close: 'Close',
    searchProducts: 'Search products',
    typeLabel: 'Category',
    priceLabel: 'Price Range',
    seriesLabel: 'Collection',
    reset: 'Reset',
    submit: 'Apply Filters',
    moreLinksAria: 'More links',
    contactLink: 'Contact Us',
    supportLink: 'Support',
    storeLink: 'Store Info',
    discoveryAria: 'Product search and filters',
    searchPlaceholder: 'Search by name, category, collection, style number, or note',
    search: 'Search',
    recommend: 'Recommended for you',
    menu: 'Menu',
    loading: 'Loading product data...',
    loadError: 'Failed to load product data. Please check the API or database connection.',
    empty: 'No products match the current filters.',
    closeDetail: 'Close details',
    styleNo: 'Style No.',
    all: 'All',
  },
}

const ui = computed(() => uiCopy[locale.value])

const priceRanges = computed(() => [
  { id: allFilterKey, label: ui.value.all },
  { id: 'under-2000', label: locale.value === 'en' ? 'Under CNY 2,000' : '¥2,000 以下', min: 0, max: 1999 },
  { id: '2000-5000', label: locale.value === 'en' ? 'CNY 2,000-5,000' : '¥2,000-¥5,000', min: 2000, max: 5000 },
  { id: '5001-10000', label: locale.value === 'en' ? 'CNY 5,001-10,000' : '¥5,000-¥10,000', min: 5001, max: 10000 },
  { id: 'above-10000', label: locale.value === 'en' ? 'Above CNY 10,000' : '¥10,000 以上', min: 10001, max: Infinity },
])

const products = ref([])
const isLoading = ref(true)
const loadError = ref(false)
const searchQuery = ref('')
const selectedType = ref(allFilterKey)
const selectedPrice = ref(allFilterKey)
const selectedSeries = ref(allFilterKey)
const draftType = ref(allFilterKey)
const draftPrice = ref(allFilterKey)
const draftSeries = ref(allFilterKey)
const showFilterPanel = ref(false)
const showDrawerSearch = ref(false)
const activeProductCode = ref('')
const activeDetailImage = ref('')
const productSection = ref(null)
const imageSwapTick = ref(0)
const imageSwapOverrides = ref({})
let imageSwapTimerId = null

const filterTypes = computed(() => {
  return [allFilterKey, ...new Set(products.value.map((product) => product.type).filter(Boolean))]
})

const filterSeries = computed(() => {
  return [allFilterKey, ...new Set(products.value.map((product) => product.series).filter(Boolean))]
})

const normalizedSearch = computed(() => searchQuery.value.trim().toLowerCase())

const localizedProducts = computed(() => {
  return products.value.map((product) => {
    const displayName = localizeProductName(product.name, locale.value)
    const displayType = localizeProductType(product.type, locale.value)
    const displaySeries = localizeSeries(product.series, locale.value)
    const displayMaterial = localizeMaterial(product.material, locale.value)
    const displayNote = localizeFreeText(product.note, locale.value)
    const displaySellingPoint = localizeFreeText(product.sellingPoint, locale.value)
    const displayGuaranteeLines = (product.guaranteeLines ?? []).map((line) =>
      localizeFreeText(line, locale.value),
    )
    const localizedRemark = localizeFreeText(product.remark, locale.value)
    const displayRemark = hiddenDetailTexts.has(localizedRemark) ? '' : localizedRemark
    const displaySpecs = (product.specs ?? [])
      .filter((item) => item?.label && !hiddenDetailSpecLabels.has(item.label))
      .map((item) => ({
        rawLabel: item.label,
        label: localizeSpecLabel(item.label, locale.value),
        value: localizeSpecValue(item.label, item.value, locale.value),
      }))

    return {
      ...product,
      displayName,
      displayType,
      displaySeries,
      displayMaterial,
      displayNote,
      displaySellingPoint,
      displayGuaranteeLines,
      displayRemark,
      displaySpecs,
    }
  })
})

const searchedProducts = computed(() => {
  if (!normalizedSearch.value) {
    return localizedProducts.value
  }

  return localizedProducts.value.filter((product) => searchText(product).includes(normalizedSearch.value))
})

const recommendedProducts = computed(() => searchedProducts.value.slice(0, 4))

const filteredProducts = computed(() => {
  const priceRange = priceRanges.value.find((range) => range.id === selectedPrice.value) ?? priceRanges.value[0]

  return searchedProducts.value.filter((product) => {
    const matchesType = selectedType.value === allFilterKey || product.type === selectedType.value
    const matchesSeries = selectedSeries.value === allFilterKey || product.series === selectedSeries.value
    const price = Number(product.price ?? 0)
    const matchesPrice =
      selectedPrice.value === allFilterKey || (price >= priceRange.min && price <= priceRange.max)

    return matchesType && matchesSeries && matchesPrice
  })
})

const activeFilterCount = computed(() => {
  return [selectedType.value, selectedPrice.value, selectedSeries.value].filter(
    (value) => value !== allFilterKey,
  ).length
})

const activeProduct = computed(() => {
  return localizedProducts.value.find((product) => product.code === activeProductCode.value) ?? null
})

const activeProductGalleryImages = computed(() => {
  if (!activeProduct.value) {
    return []
  }

  const images = [activeProduct.value.image, ...(activeProduct.value.detailImages ?? [])].filter(Boolean)
  return images.filter((image, index) => images.indexOf(image) === index)
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
    product.note,
    product.displayNote,
    product.material,
    product.displayMaterial,
    product.remark,
    product.displayRemark,
    product.sellingPoint,
    product.displaySellingPoint,
    ...(product.specs ?? []).map((item) => item.value),
    ...(product.displaySpecs ?? []).map((item) => item.value),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function formatPrice(price) {
  const numericPrice = Number(price)
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return locale.value === 'en' ? 'Price on request' : '面议'
  }

  return new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
  }).format(numericPrice)
}

function displayType(type) {
  if (type === allFilterKey) {
    return ui.value.all
  }

  return localizeProductType(type, locale.value)
}

function displaySeries(series) {
  if (series === allFilterKey) {
    return ui.value.all
  }

  return localizeSeries(series, locale.value)
}

function displayPriceRange(range) {
  return range.label
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
  loadError.value = false

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
    loadError.value = true
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
  selectedType.value = allFilterKey
  draftType.value = allFilterKey
  selectedPrice.value = allFilterKey
  draftPrice.value = allFilterKey
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
  draftType.value = allFilterKey
  draftPrice.value = allFilterKey
  draftSeries.value = allFilterKey
  selectedType.value = allFilterKey
  selectedPrice.value = allFilterKey
  selectedSeries.value = allFilterKey
}

async function chooseRecommendation(product) {
  searchQuery.value = product.displayName
  await showProducts()
}

async function scrollToProducts() {
  await nextTick()
  productSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function openProduct(product) {
  activeProductCode.value = product.code
  activeDetailImage.value = product.image
}

function closeProduct() {
  activeProductCode.value = ''
  activeDetailImage.value = ''
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

watch(
  activeProductGalleryImages,
  (images) => {
    if (!images.length) {
      activeDetailImage.value = ''
      return
    }

    if (!images.includes(activeDetailImage.value)) {
      activeDetailImage.value = images[0]
    }
  },
  { immediate: true },
)
</script>

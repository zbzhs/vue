<template>
  <div class="selection-app">
    <main class="selection-workspace">
      <header
        class="selection-toolbar"
        :class="{
          'selection-toolbar--preferences': stage === 'preferences',
          'selection-toolbar--recommendations': stage === 'recommendations',
        }"
      >
        <div v-if="stage === 'preferences'" class="selection-preference-heading">
          <span v-if="stage === 'preferences'" class="selection-eyebrow">DERING CURATION DESK</span>
          <h1 v-if="stage === 'preferences'">个人偏好</h1>
        </div>
        <div v-else class="selection-recommend-heading">
          <h2>为你推荐</h2>
          <p v-if="recommendationCategorySummary" class="selection-result-counts">
            {{ recommendationCategorySummary }}
          </p>
        </div>
        <RouterLink
          v-if="stage === 'recommendations'"
          class="selection-center-back-link"
          :to="{ name: 'selectionPicks' }"
          aria-label="返回选品中心"
        >
          <span aria-hidden="true">←</span>
          返回
        </RouterLink>
        <div class="selection-toolbar-actions">
          <button
            v-if="stage === 'preferences'"
            class="selection-return-recommend-link"
            type="button"
            @click="openRecommendations"
          >
            返回推荐商品
          </button>
        </div>
      </header>

      <section v-if="stage === 'preferences'" class="selection-preferences">
        <template v-if="selectionQuestions.length">
          <div class="selection-progress" aria-label="偏好填写进度">
            <span>已完成 {{ answeredQuestionCount }} / {{ selectionQuestions.length }}</span>
            <i :style="{ width: `${preferenceProgress}%` }"></i>
          </div>

          <div class="selection-question-list">
            <article
              v-for="(question, questionIndex) in selectionQuestions"
              :key="question.id"
              class="selection-question"
            >
              <span class="selection-question-number">
                {{ String(questionIndex + 1).padStart(2, '0') }}
              </span>
              <div>
                <h2>{{ question.title }}</h2>
                <p v-if="question.description">{{ question.description }}</p>
              </div>

              <div
                class="selection-options"
                :class="{ 'selection-options--multiple': question.type === 'multiple' }"
              >
                <button
                  v-for="option in question.options"
                  :key="option.id"
                  type="button"
                  :class="{ selected: isOptionSelected(question, option.id) }"
                  :aria-pressed="isOptionSelected(question, option.id)"
                  @click="selectOption(question, option.id)"
                >
                  <span>{{ option.label }}</span>
                  <i aria-hidden="true"></i>
                </button>
              </div>
            </article>
          </div>

          <div class="selection-submit-row">
            <span v-if="!canSubmit">请完成所有必填问题</span>
            <span v-else>偏好已填写完整，可以生成推荐</span>
            <button
              class="selection-primary-action"
              type="button"
              :disabled="!canSubmit"
              @click="finishPreferences"
            >
              生成推荐
            </button>
          </div>
        </template>

        <div v-else class="selection-empty-question">
          <span class="selection-empty-index">01</span>
          <div>
            <p>偏好问卷</p>
            <h2>问题内容待配置</h2>
            <span>问题区域已经预留。添加问题后，用户完成选择便会自动生成推荐。</span>
          </div>
          <button class="selection-primary-action" type="button" @click="finishPreferences">
            先查看推荐
          </button>
        </div>
      </section>

      <section v-else class="selection-results">
        <p v-if="isLoading" class="selection-status">正在分析商品资料...</p>
        <p v-else-if="loadError" class="selection-status selection-status--error">
          推荐生成失败，请检查商品接口。
        </p>
        <div v-else class="selection-product-grid">
          <RouterLink
            v-for="(product, index) in recommendations"
            :key="product.code"
            class="selection-product-card"
            :to="{ name: 'selectionAll', query: { product: product.code, from: 'selection' } }"
          >
            <span class="selection-product-rank">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="selection-product-media">
              <img
                v-if="product.image && !brokenImages.has(product.code)"
                :src="product.image"
                :alt="product.name"
                @error="markBrokenImage(product.code)"
              />
              <span v-else>图片待上传</span>
            </span>
            <span class="selection-product-copy">
              <strong>{{ product.name || product.styleNo }}</strong>
              <span>{{ formatPrice(product.price) }}</span>
            </span>
          </RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuth } from '../composables/useAuth'
import {
  completeSelectionOnboarding,
  readSelectionProfile,
  startSelectionOnboarding,
} from '../composables/useSelectionProfile'
import { selectionQuestions } from '../content/selectionQuestions'
import { formatCurrencyFromCny } from '../utils/currency'

const router = useRouter()
const route = useRoute()
const { selectionUser, refreshSelectionUser } = useAuth()
const storedProfile = readSelectionProfile(selectionUser.value)
const initialStep = Array.isArray(route.query.step) ? route.query.step[0] : route.query.step
const stage = ref(initialStep === 'preferences' || storedProfile?.status === 'pending' ? 'preferences' : 'recommendations')
const answers = reactive({ ...(storedProfile?.answers || {}) })
const products = ref([])
const isLoading = ref(false)
const loadError = ref(false)
const brokenImages = ref(new Set())

const recommendationCategories = [
  { key: 'earwear', label: '耳饰', types: ['耳钉', '耳圈', '耳饰', '耳扣', '耳吊', '耳钩', '耳线'] },
  { key: 'neckwear', label: '项链 / 吊坠', types: ['项链', '吊坠'] },
  { key: 'bracelets', label: '手链 / 脚链', types: ['手链', '脚链'] },
  { key: 'rings', label: '戒指', types: ['女戒', '戒指', '男戒'] },
]

const answeredQuestionCount = computed(() => selectionQuestions.filter((question) => (
  Array.isArray(answers[question.id]) && answers[question.id].length > 0
)).length)
const preferenceProgress = computed(() => {
  if (!selectionQuestions.length) {
    return 0
  }
  return (answeredQuestionCount.value / selectionQuestions.length) * 100
})
const canSubmit = computed(() => selectionQuestions.every((question) => (
  !question.required || (Array.isArray(answers[question.id]) && answers[question.id].length > 0)
)))
const selectedCriteria = computed(() => {
  const criteria = {
    types: [],
    series: [],
    materials: [],
    keywords: [],
    minPrice: null,
    maxPrice: null,
    minCarat: null,
    minCommission: null,
    maxShippingDays: null,
    pricePreference: '',
    requireInStock: false,
  }

  for (const question of selectionQuestions) {
    const selectedIds = answers[question.id] || []
    for (const option of question.options || []) {
      if (!selectedIds.includes(option.id) || !option.criteria) {
        continue
      }
      for (const key of ['types', 'series', 'materials', 'keywords']) {
        criteria[key].push(...(option.criteria[key] || []))
      }
      if (Number.isFinite(option.criteria.minPrice)) {
        criteria.minPrice = Math.max(criteria.minPrice || 0, option.criteria.minPrice)
      }
      if (Number.isFinite(option.criteria.maxPrice)) {
        criteria.maxPrice = Math.min(criteria.maxPrice ?? Infinity, option.criteria.maxPrice)
      }
      if (Number.isFinite(option.criteria.minCarat)) {
        criteria.minCarat = Math.max(criteria.minCarat || 0, option.criteria.minCarat)
      }
      if (Number.isFinite(option.criteria.minCommission)) {
        criteria.minCommission = Math.max(criteria.minCommission || 0, option.criteria.minCommission)
      }
      if (Number.isFinite(option.criteria.maxShippingDays)) {
        criteria.maxShippingDays = Math.min(criteria.maxShippingDays ?? Infinity, option.criteria.maxShippingDays)
      }
      if (option.criteria.pricePreference) {
        criteria.pricePreference = option.criteria.pricePreference
      }
      if (option.criteria.requireInStock) {
        criteria.requireInStock = true
      }
    }
  }

  return criteria
})
const recommendations = computed(() => {
  const rankedProducts = products.value
    .map((product) => ({ product, score: scoreProduct(product, selectedCriteria.value) }))
    .sort((left, right) => right.score - left.score || Number(left.product.isPlaceholder) - Number(right.product.isPlaceholder))

  return buildDiversifiedRecommendations(rankedProducts, 80, selectedCriteria.value)
})
const recommendationCategorySummary = computed(() => recommendationCategories
  .map((category) => ({
    ...category,
    count: recommendations.value.filter((product) => category.types.includes(product.type)).length,
  }))
  .filter((category) => category.count > 0)
  .map((category) => `${category.label} ${category.count} 件`)
  .join('、'))

function isOptionSelected(question, optionId) {
  return (answers[question.id] || []).includes(optionId)
}

function selectOption(question, optionId) {
  if (question.type === 'multiple') {
    const selected = new Set(answers[question.id] || [])
    selected.has(optionId) ? selected.delete(optionId) : selected.add(optionId)
    answers[question.id] = [...selected]
    return
  }

  answers[question.id] = [optionId]
}

function finishPreferences() {
  completeSelectionOnboarding(selectionUser.value, { ...answers })
  stage.value = 'recommendations'
  router.replace({ name: 'selection' })
  loadProducts()
}

function openPreferences() {
  if (!readSelectionProfile(selectionUser.value)) {
    startSelectionOnboarding(selectionUser.value)
  }
  stage.value = 'preferences'
  router.replace({ name: 'selection', query: { step: 'preferences' } })
}

function openRecommendations() {
  stage.value = 'recommendations'
  router.replace({ name: 'selection' })
  loadProducts()
}

function buildDiversifiedRecommendations(rankedProducts, limit, criteria) {
  const preferredCategoryKeys = new Set(
    recommendationCategories
      .filter((category) => category.types.some((type) => criteria.types.includes(type)))
      .map((category) => category.key),
  )
  const categoryQuotas = getRecommendationCategoryQuotas(limit, preferredCategoryKeys)
  const buckets = recommendationCategories.map((category) => ({
    ...category,
    items: rankedProducts.filter((item) => category.types.includes(item.product.type)),
    quota: categoryQuotas[category.key] ?? Math.ceil(limit / recommendationCategories.length),
    selectedCount: 0,
  }))
  const selected = []
  const selectedCodes = new Set()

  fillRecommendationBuckets(buckets, selected, selectedCodes, limit, (bucket) => bucket.quota)

  while (selected.length < limit) {
    let addedInRound = false

    for (const bucket of buckets) {
      if (selected.length === limit) {
        break
      }
      if (!addNextBucketProduct(bucket, selected, selectedCodes)) {
        continue
      }
      addedInRound = true
    }

    if (!addedInRound) {
      break
    }
  }

  for (const item of rankedProducts.filter((item) => item.product.isPlaceholder)) {
    if (selected.length === limit) {
      break
    }
    if (!selectedCodes.has(item.product.code)) {
      selected.push(item.product)
      selectedCodes.add(item.product.code)
    }
  }

  return selected
}

function getRecommendationCategoryQuotas(limit, preferredCategoryKeys) {
  const categoryCount = recommendationCategories.length
  const preferredCount = preferredCategoryKeys.size
  if (!preferredCount || preferredCount === categoryCount) {
    return Object.fromEntries(recommendationCategories.map((category) => [category.key, Math.floor(limit / categoryCount)]))
  }

  const preferredQuota = preferredCount === 1
    ? Math.round(limit * 0.44)
    : Math.round((limit * 0.7) / preferredCount)
  const remainingQuota = Math.max(1, Math.floor((limit - preferredQuota * preferredCount) / (categoryCount - preferredCount)))
  const quotas = Object.fromEntries(recommendationCategories.map((category) => [
    category.key,
    preferredCategoryKeys.has(category.key) ? preferredQuota : remainingQuota,
  ]))
  let remaining = limit - Object.values(quotas).reduce((sum, count) => sum + count, 0)

  for (const category of recommendationCategories) {
    if (remaining <= 0) {
      break
    }
    if (preferredCategoryKeys.has(category.key)) {
      quotas[category.key] += 1
      remaining -= 1
    }
  }

  for (const category of recommendationCategories) {
    if (remaining <= 0) {
      break
    }
    if (!preferredCategoryKeys.has(category.key)) {
      quotas[category.key] += 1
      remaining -= 1
    }
  }

  return quotas
}

function fillRecommendationBuckets(buckets, selected, selectedCodes, limit, getBucketLimit) {
  while (selected.length < limit) {
    let addedInRound = false

    for (const bucket of buckets) {
      if (selected.length === limit) {
        break
      }
      if (bucket.selectedCount >= getBucketLimit(bucket)) {
        continue
      }
      if (!addNextBucketProduct(bucket, selected, selectedCodes)) {
        continue
      }
      addedInRound = true
    }

    if (!addedInRound) {
      break
    }
  }
}

function addNextBucketProduct(bucket, selected, selectedCodes) {
  let item = bucket.items.shift()
  while (item && selectedCodes.has(item.product.code)) {
    item = bucket.items.shift()
  }
  if (!item || selectedCodes.has(item.product.code)) {
    return false
  }

  selected.push(item.product)
  selectedCodes.add(item.product.code)
  bucket.selectedCount += 1
  return true
}

function scoreProduct(product, criteria) {
  let score = product.isPlaceholder ? -2 : 0
  if (criteria.types.includes(product.type)) score += 8
  if (criteria.series.includes(product.series)) score += 6
  if (criteria.materials.includes(product.material)) score += 5

  const searchable = [product.name, product.type, product.series, product.material, product.note]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  score += criteria.keywords.filter((keyword) => searchable.includes(String(keyword).toLowerCase())).length * 3

  const price = Number(product.price)
  const hasPrice = Number.isFinite(price) && price > 0
  if (hasPrice && criteria.minPrice !== null) score += price >= criteria.minPrice ? 4 : -12
  if (hasPrice && criteria.maxPrice !== null) score += price <= criteria.maxPrice ? 4 : -12
  if (hasPrice && criteria.pricePreference === 'low' && price <= 10000) score += 4
  if (hasPrice && criteria.pricePreference === 'high' && price >= 20000) score += 4

  const inventory = Number(product.inventory)
  if (criteria.requireInStock) score += Number.isFinite(inventory) && inventory > 0 ? 8 : -12

  const carat = readProductCarat(product)
  if (criteria.minCarat !== null && Number.isFinite(carat)) {
    score += carat >= criteria.minCarat ? 6 : -3
  }

  const commission = readOptionalNumber(product.commission)
  if (criteria.minCommission !== null) {
    if (Number.isFinite(commission)) {
      score += commission >= criteria.minCommission ? 10 : -10
    } else {
      score -= 3
    }
  }

  const shippingDays = readOptionalNumber(product.shippingDays ?? product.deliveryDays ?? product.leadTimeDays)
  if (criteria.maxShippingDays !== null && Number.isFinite(shippingDays)) {
    score += shippingDays <= criteria.maxShippingDays ? 6 : -8
  }
  return score
}

function readOptionalNumber(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return NaN
  }
  return Number(value)
}

function readProductCarat(product) {
  const values = [product.note, ...(product.specs || []).map((spec) => spec.value)]
  for (const value of values) {
    const match = String(value || '').match(/(\d+(?:\.\d+)?)\s*ct/i)
    if (match) {
      return Number(match[1])
    }
  }
  return NaN
}

async function loadProducts() {
  if (products.value.length || isLoading.value) {
    return
  }

  isLoading.value = true
  loadError.value = false
  try {
    const collected = []
    let page = 1
    let hasMore = true
    while (hasMore && page <= 10) {
      const response = await fetch(`/api/products?page=${page}&pageSize=100`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const payload = await response.json()
      collected.push(...(Array.isArray(payload.products) ? payload.products : []))
      hasMore = Boolean(payload.hasMore)
      page += 1
    }
    products.value = collected
  } catch (error) {
    console.error('Failed to load selection products:', error)
    loadError.value = true
  } finally {
    isLoading.value = false
  }
}

function markBrokenImage(code) {
  brokenImages.value = new Set([...brokenImages.value, code])
}

function formatPrice(value) {
  const price = Number(value) * getSelectionDiscountRate()
  return Number.isFinite(price) && price > 0 ? formatCurrencyFromCny(price, 'CNY') : '价格咨询'
}

function getSelectionDiscountRate() {
  const rate = Number(selectionUser.value?.discountRate)
  return Number.isFinite(rate) && rate > 0 ? rate : 1
}

onMounted(async () => {
  await refreshSelectionUser()
  if (stage.value === 'recommendations') {
    loadProducts()
  }
})

watch(
  () => route.query.step,
  (step) => {
    const selectedStep = Array.isArray(step) ? step[0] : step
    if (selectedStep === 'preferences') {
      stage.value = 'preferences'
    }
  },
)
</script>

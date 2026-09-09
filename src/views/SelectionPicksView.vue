<template>
  <section class="selection-picks-page">
    <div class="selection-picks-top-actions" aria-label="达人选货快捷入口">
      <RouterLink :to="{ name: 'selectionAll' }">Dering主页</RouterLink>
      <RouterLink :to="{ name: 'selection' }">推荐中心</RouterLink>
    </div>

    <div class="selection-picks-shell">
      <header class="selection-picks-head">
        <h1>我的选品记录</h1>
      </header>

      <section class="selection-picks-profile">
        <div>
          <span>个人偏好</span>
          <h2>{{ selectedCategorySummary || '还没有选择品类' }}</h2>
          <p v-if="preferenceSummary">{{ preferenceSummary }}</p>
          <p v-else>进入推荐中心完成偏好后，这里会显示她选择过的品类和直播偏好。</p>
        </div>
        <RouterLink :to="{ name: 'selection', query: { step: 'preferences' } }">
          {{ selectedCategorySummary ? '重新选择偏好' : '去选择偏好' }}
        </RouterLink>
      </section>

      <div v-if="!selectionPickGroups.length" class="selection-picks-empty">
        <h2>还没有选择商品</h2>
        <p>去全部商品里进入商品详情，点击“选品”后，就会记录到这里。</p>
        <RouterLink :to="{ name: 'selectionAll' }">去选品</RouterLink>
      </div>

      <article
        v-for="group in selectionPickGroups"
        v-else
        :key="group.date"
        class="selection-pick-group"
      >
        <header>
          <div>
            <time :datetime="group.date">{{ formatSelectionDate(group.date) }}</time>
            <strong>选择了 {{ group.items.length }} 件</strong>
          </div>
          <button
            v-if="group.items.length > collapsedCount"
            type="button"
            @click="toggleGroup(group.date)"
          >
            {{ isGroupExpanded(group.date) ? '收起' : `展开全部 ${group.items.length} 件` }}
          </button>
        </header>

        <div class="selection-pick-list">
          <div
            v-for="item in visibleGroupItems(group)"
            :key="`${group.date}-${item.code}`"
            class="selection-pick-item"
          >
            <RouterLink class="selection-pick-media" :to="getProductTo(item)">
              <img v-if="item.image" :src="item.image" :alt="item.name" />
              <span v-else>{{ item.code }}</span>
            </RouterLink>
            <div class="selection-pick-copy">
              <RouterLink :to="getProductTo(item)">
                <h2>{{ item.name || item.code }}</h2>
              </RouterLink>
              <p>{{ item.code }}</p>
              <small>{{ item.type || '未分类' }} / {{ item.series || '无系列' }}</small>
            </div>
            <strong>{{ formatPickPrice(item.price) }}</strong>
            <button type="button" @click="removeSelectionPick(item.code)">移除</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import { useAuth } from '../composables/useAuth'
import { useLocale } from '../composables/useLocale'
import { readSelectionProfile } from '../composables/useSelectionProfile'
import { useSelectionPicks } from '../composables/useSelectionPicks'
import { selectionQuestions } from '../content/selectionQuestions'
import { formatCurrencyFromCny } from '../utils/currency'

const collapsedCount = 5
const expandedGroups = ref([])
const { selectionUser } = useAuth()
const { currencyRegion } = useLocale()
const { selectionPickGroups, removeSelectionPick, syncSelectionPicksFromServer } = useSelectionPicks()
const selectionProfile = computed(() => readSelectionProfile(selectionUser.value))
const selectedPreferenceLabels = computed(() => {
  const answers = selectionProfile.value?.answers || {}

  return selectionQuestions
    .map((question) => {
      const selectedIds = Array.isArray(answers[question.id]) ? answers[question.id] : []
      const labels = (question.options || [])
        .filter((option) => selectedIds.includes(option.id))
        .map((option) => option.label)

      return labels.length ? { id: question.id, title: question.title, labels } : null
    })
    .filter(Boolean)
})
const selectedCategorySummary = computed(() => {
  const categoryPreference = selectedPreferenceLabels.value.find((item) => item.id === 'categories')
  return categoryPreference?.labels?.join('、') || ''
})
const preferenceSummary = computed(() => selectedPreferenceLabels.value
  .filter((item) => item.id !== 'categories')
  .slice(0, 4)
  .map((item) => `${item.title.replace(/[？?]$/, '')}：${item.labels.join('、')}`)
  .join(' ｜ '))

function isGroupExpanded(date) {
  return expandedGroups.value.includes(date)
}

function toggleGroup(date) {
  expandedGroups.value = isGroupExpanded(date)
    ? expandedGroups.value.filter((item) => item !== date)
    : [...expandedGroups.value, date]
}

function visibleGroupItems(group) {
  return isGroupExpanded(group.date) ? group.items : group.items.slice(0, collapsedCount)
}

function formatSelectionDate(date) {
  const [year, month, day] = String(date).split('-')
  if (!year || !month || !day) {
    return date
  }

  return `${Number(year)}年${Number(month)}月${Number(day)}日`
}

function formatPickPrice(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return '面议'
  }

  const rate = Number(selectionUser.value?.discountRate)
  const discountRate = Number.isFinite(rate) && rate > 0 ? rate : 1
  return formatCurrencyFromCny(numericValue * discountRate, currencyRegion.value)
}

function getProductTo(item) {
  return {
    name: 'selectionAll',
    query: {
      product: item.styleNo || item.code,
      from: 'selection-picks',
    },
  }
}

onMounted(() => {
  syncSelectionPicksFromServer()
})
</script>

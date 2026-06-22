<template>
  <div class="site-shell" :class="{ 'site-shell--hero-page': hasHeroNav }">
    <header
      class="nav-bar"
      :class="{
        'nav-bar--hero-top': isHeroTop,
        'nav-bar--solid': !isHeroTop,
      }"
    >
      <RouterLink class="nav-brand-wordmark" to="/" aria-label="DERING home">
        DERING
      </RouterLink>

      <nav class="nav-category-row" aria-label="Product categories">
        <template v-for="item in navItems" :key="item.key">
          <RouterLink class="nav-category-link" :to="item.to" @click="closeProductDetail">
            {{ item.label[locale] }}
          </RouterLink>
        </template>
      </nav>

      <div class="nav-actions">
        <label class="locale-select-wrap" :aria-label="t('语言与货币', 'Language and currency')">
          <select v-model="localeChoice" class="locale-select">
            <option value="zh">中文 / CNY</option>
            <option value="en">English / USD</option>
          </select>
        </label>

        <span v-if="displayName" class="nav-user-name">
          <span class="nav-user-icon" aria-hidden="true">
            <i></i>
            <b></b>
          </span>
          <span>{{ displayName }}</span>
        </span>

        <RouterLink v-else class="nav-user-name nav-user-name--login" :to="{ name: 'login' }">
          <span class="nav-user-icon" aria-hidden="true">
            <i></i>
            <b></b>
          </span>
          <span>{{ t('登录', 'Login') }}</span>
        </RouterLink>

        <RouterLink class="nav-cart-icon" :to="{ name: 'cart' }" aria-label="购物车">
          <span class="nav-cart-bag" aria-hidden="true"></span>
          <span v-if="cartCount > 0" class="nav-cart-badge">{{ cartCount }}</span>
        </RouterLink>
      </div>

      <button
        v-if="isProductsRoute"
        class="nav-menu-toggle"
        type="button"
        @click="openProductFilters"
      >
        <span aria-hidden="true"></span>
        {{ t('菜单', 'Menu') }}
      </button>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useCart } from './composables/useCart'
import { useLocale } from './composables/useLocale'
import { useAuth } from './composables/useAuth'

const { locale, displayLanguage, setDisplayLanguage, t } = useLocale()
const { displayName } = useAuth()
const { cartCount } = useCart()

const route = useRoute()
const isScrolled = ref(false)

const hasHeroNav = computed(() => route.name === 'home')
const isHeroTop = computed(() => hasHeroNav.value && !isScrolled.value)
const isProductsRoute = computed(() => route.name === 'products')
const localeChoice = computed({
  get: () => (displayLanguage.value === 'en' ? 'en' : 'zh'),
  set: (value) => {
    setDisplayLanguage(value)
  },
})

const navItems = [
  { key: 'bracelet', type: 'link', label: { zh: '手链', en: 'Bracelets', ja: 'ブレスレット', th: 'สร้อยข้อมือ', ko: '팔찌', vi: 'Vong tay' }, to: { name: 'products', query: { type: '手链' } } },
  { key: 'earrings', type: 'link', label: { zh: '耳饰', en: 'Earrings', ja: 'イヤーアクセ', th: 'ต่างหู', ko: '귀걸이', vi: 'Hoa tai' }, to: { name: 'products', query: { type: '耳饰' } } },
  { key: 'ring', type: 'link', label: { zh: '戒指', en: 'Rings', ja: 'リング', th: 'แหวน', ko: '반지', vi: 'Nhan' }, to: { name: 'products', query: { type: '戒指' } } },
  { key: 'necklace', type: 'link', label: { zh: '项链', en: 'Necklaces', ja: 'ネックレス', th: 'สร้อยคอ', ko: '목걸이', vi: 'Dây chuyền' }, to: { name: 'products', query: { type: '项链' } } },
  { key: 'pendant', type: 'link', label: { zh: '吊坠', en: 'Pendants', ja: 'ペンダント', th: 'จี้', ko: '펜던트', vi: 'Mặt dây' }, to: { name: 'products', query: { type: '吊坠' } } },
]

function updateNavState() {
  isScrolled.value = window.scrollY > 40
}

function openProductFilters() {
  window.dispatchEvent(new CustomEvent('open-product-filters'))
}

function closeProductDetail() {
  window.dispatchEvent(new CustomEvent('close-product-detail'))
}

onMounted(() => {
  updateNavState()
  window.addEventListener('scroll', updateNavState, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateNavState)
})
</script>

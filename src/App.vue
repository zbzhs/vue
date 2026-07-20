<template>
  <div
    class="site-shell"
    :class="{
      'site-shell--hero-page': hasHeroNav,
      'site-shell--navless': !showSiteNav,
    }"
  >
    <header
      v-if="showSiteNav"
      class="nav-bar"
      :class="{
        'nav-bar--hero-top': isHeroTop,
        'nav-bar--solid': !isHeroTop,
        'nav-bar--hidden': isNavHidden,
      }"
    >
      <RouterLink class="nav-brand-wordmark" to="/" aria-label="DERING home">
        <img src="/logo/logo.png" alt="DERING" />
      </RouterLink>

      <nav class="nav-category-row" aria-label="Product categories">
        <template v-for="item in navItems" :key="item.key">
          <RouterLink class="nav-category-link" :to="item.to" @click="closeProductDetail">
            {{ item.label[locale] }}
          </RouterLink>
        </template>
      </nav>

      <div class="nav-actions">
        <RouterLink
          v-if="currentUser?.role === 'admin'"
          class="nav-admin-link"
          :to="{ name: 'adminDashboard' }"
        >
          管理后台
        </RouterLink>
        <label class="locale-select-wrap" aria-label="语言与货币">
          <select v-model="localeChoice" class="locale-select">
            <option value="zh">中文 / CNY</option>
            <option value="en">English / USD</option>
          </select>
        </label>

        <div v-if="displayName" class="nav-user-menu">
          <button class="nav-user-name nav-user-name--account" type="button">
            <span class="nav-user-icon" aria-hidden="true">
              <i></i>
              <b></b>
            </span>
            <span>{{ displayName }}</span>
          </button>
          <div class="nav-user-dropdown">
            <button type="button" @click="handleLogout">退出账号</button>
          </div>
        </div>
        <RouterLink v-else class="nav-user-name nav-user-name--login" :to="{ name: 'login' }">
          <span class="nav-user-icon" aria-hidden="true">
            <i></i>
            <b></b>
          </span>
          <span>登录</span>
        </RouterLink>

        <RouterLink
          class="floating-contact"
          :to="{ name: 'contact' }"
          :aria-label="t('联系我们', 'Contact us')"
        >
          <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <path
              class="floating-contact-ring"
              d="M32 57.2c13.9 0 25.2-11.3 25.2-25.2S45.9 6.8 32 6.8 6.8 18.1 6.8 32 18.1 57.2 32 57.2Z"
            />
            <path
              class="floating-contact-headset"
              d="M19.4 33.2v-4.1c0-7.4 5.4-12.9 12.6-12.9s12.6 5.5 12.6 12.9v4.1"
            />
            <path
              class="floating-contact-cup"
              d="M19.3 31.2h-2c-1.5 0-2.7 1.2-2.7 2.7v4.4c0 1.5 1.2 2.7 2.7 2.7h3V31.2Zm25.4 0h2c1.5 0 2.7 1.2 2.7 2.7v4.4c0 1.5-1.2 2.7-2.7 2.7h-3V31.2Z"
            />
            <path
              class="floating-contact-face"
              d="M26.8 36.9c1.3 1.1 3.1 1.7 5.2 1.7s3.9-.6 5.2-1.7"
            />
            <path
              class="floating-contact-mic"
              d="M44.6 40.8c0 4.2-3.5 6.7-8.1 6.7h-3.9"
            />
            <path
              class="floating-contact-dot"
              d="M31.8 47.5h-3"
            />
          </svg>
          <span>{{ t('咨询', 'Consult') }}</span>
        </RouterLink>

        <RouterLink
          class="nav-cart-icon"
          :to="{ name: 'cart' }"
          aria-label="购物车"
          @click.prevent="openCart"
        >
          <span class="nav-cart-bag" aria-hidden="true"></span>
          <span v-if="cartCount > 0" class="nav-cart-badge">{{ cartCount }}</span>
        </RouterLink>
      </div>

      <button
        class="nav-menu-toggle"
        type="button"
        @click="openProductFilters"
      >
        <span aria-hidden="true"></span>
        {{ t('菜单', 'Menu') }}
      </button>

      <button
        class="nav-search-toggle"
        type="button"
        :aria-label="t('搜索', 'Search')"
        @click="openProductSearch"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5 21 21" />
        </svg>
      </button>
    </header>

    <main>
      <RouterView />
    </main>

    <button
      v-show="showBackToTop"
      class="back-to-top-button"
      type="button"
      :aria-label="t('杩斿洖椤堕儴', 'Back to top')"
      @click="scrollToTop"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 5 5.5 11.5" />
        <path d="M12 5 18.5 11.5" />
        <path d="M12 6v13" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useCart } from './composables/useCart'
import { useLocale } from './composables/useLocale'
import { useAuth } from './composables/useAuth'

const { locale, displayLanguage, setDisplayLanguage, t } = useLocale()
const { currentUser, displayName, logout } = useAuth()
const { cartCount } = useCart()

const route = useRoute()
const router = useRouter()
const isScrolled = ref(false)
const isNavHidden = ref(false)
const lastScrollY = ref(0)
const showBackToTop = ref(false)

const showSiteNav = computed(() => !route.meta.hideSiteNav)
const hasHeroNav = computed(() => showSiteNav.value && (route.name === 'home' || route.meta.heroNav))
const isHeroTop = computed(() => hasHeroNav.value && !isScrolled.value)
const isSeriesRoute = computed(() => route.name === 'series')
const localeChoice = computed({
  get: () => (displayLanguage.value === 'en' ? 'en' : 'zh'),
  set: (value) => {
    setDisplayLanguage(value)
  },
})

const navItems = [
  { key: 'bracelet', type: 'link', label: { zh: '手链', en: 'Bracelets' }, to: { name: 'products', query: { type: '手链' } } },
  { key: 'earrings', type: 'link', label: { zh: '耳饰', en: 'Earrings' }, to: { name: 'products', query: { type: '耳饰' } } },
  { key: 'ring', type: 'link', label: { zh: '戒指', en: 'Rings' }, to: { name: 'products', query: { type: '戒指' } } },
  { key: 'necklace', type: 'link', label: { zh: '项链', en: 'Necklaces' }, to: { name: 'products', query: { type: '项链' } } },
  { key: 'pendant', type: 'link', label: { zh: '吊坠', en: 'Pendants' }, to: { name: 'products', query: { type: '吊坠' } } },
  { key: 'loose-stone', type: 'link', label: { zh: '裸石', en: 'Loose Stones' }, to: { name: 'products', query: { type: '裸石' } } },
  { key: 'custom', type: 'link', label: { zh: '定制', en: 'Custom' }, to: { name: 'products', query: { type: '定制' } } },
]

function updateNavState() {
  const currentScrollY = window.scrollY
  showBackToTop.value = currentScrollY >= window.innerHeight

  if (isSeriesRoute.value) {
    isScrolled.value = currentScrollY > 12
    isNavHidden.value = currentScrollY > 12
    lastScrollY.value = Math.max(currentScrollY, 0)
    return
  }

  const scrollingDown = currentScrollY > lastScrollY.value + 6
  const scrollingUp = currentScrollY < lastScrollY.value - 6

  isScrolled.value = currentScrollY > 40

  if (scrollingDown && currentScrollY > 120) {
    isNavHidden.value = true
  } else if (scrollingUp || currentScrollY <= 40) {
    isNavHidden.value = false
  }

  lastScrollY.value = Math.max(currentScrollY, 0)
}

async function openProductFilters() {
  if (route.name !== 'products') {
    await router.push({ name: 'products' })
  }

  window.dispatchEvent(new CustomEvent('open-product-filters'))
}

async function openProductSearch() {
  await router.push({ name: 'search' })
}

function closeProductDetail() {
  window.dispatchEvent(new CustomEvent('close-product-detail'))
}

function handleLogout() {
  logout()
}

function openCart() {
  if (!currentUser.value) {
    window.alert(t('请先登录或注册后再查看购物车。', 'Please sign in or register before viewing your bag.'))
    router.push({ name: 'login' })
    return
  }

  router.push({ name: 'cart' })
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

onMounted(() => {
  updateNavState()
  window.addEventListener('scroll', updateNavState, { passive: true })
  window.addEventListener('resize', updateNavState, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateNavState)
  window.removeEventListener('resize', updateNavState)
})
</script>




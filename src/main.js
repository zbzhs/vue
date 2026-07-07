import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import ProductsView from './views/ProductsView.vue'
import SeriesView from './views/SeriesView.vue'
import AboutView from './views/AboutView.vue'
import GuideView from './views/GuideView.vue'
import FourCView from './views/FourCView.vue'
import AdvantagesView from './views/AdvantagesView.vue'
import BuyingGuideView from './views/BuyingGuideView.vue'
import FaqView from './views/FaqView.vue'
import ContactView from './views/ContactView.vue'
import SearchView from './views/SearchView.vue'
import PreferencesView from './views/PreferencesView.vue'
import RegisterView from './views/RegisterView.vue'
import LoginView from './views/LoginView.vue'
import CartView from './views/CartView.vue'
import OrdersView from './views/OrdersView.vue'
import './styles/main.css'

function getRouteQueryValue(query, key) {
  const value = query[key]
  return Array.isArray(value) ? value[0] : value
}

function escapeSelectorValue(value) {
  if (typeof window !== 'undefined' && window.CSS?.escape) {
    return window.CSS.escape(value)
  }

  return String(value).replace(/"/g, '\\"')
}

async function waitForElement(selector, timeoutMs = 1500) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    const element = document.querySelector(selector)
    if (element) {
      return element
    }

    await new Promise((resolve) => window.requestAnimationFrame(resolve))
  }

  return null
}

const router = createRouter({
  history: createWebHistory(),
  async scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      const target = await waitForElement(to.hash)
      if (target) {
        return { el: to.hash, top: 96, behavior: 'auto' }
      }
    }

    const productCode = getRouteQueryValue(to.query, 'product')
    if (to.name === 'products' && productCode) {
      const selector = `[data-product-code="${escapeSelectorValue(productCode)}"]`
      const productCard = await waitForElement(selector)

      if (productCard) {
        const top = Math.max(productCard.getBoundingClientRect().top + window.scrollY - 120, 0)
        return { top, behavior: 'auto' }
      }
    }

    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/products', name: 'products', component: ProductsView },
    { path: '/series/:slug', name: 'series', component: SeriesView },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/process', name: 'process', component: GuideView },
    { path: '/4c', name: '4c', component: FourCView },
    { path: '/advantages', name: 'advantages', component: AdvantagesView },
    { path: '/buying-guide', name: 'buyingGuide', component: BuyingGuideView },
    { path: '/faq', name: 'faq', component: FaqView },
    { path: '/contact', name: 'contact', component: ContactView },
    { path: '/search', name: 'search', component: SearchView },
    { path: '/preferences', name: 'preferences', component: PreferencesView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/cart', name: 'cart', component: CartView },
    { path: '/orders', name: 'orders', component: OrdersView },
  ],
})

createApp(App).use(router).mount('#app')

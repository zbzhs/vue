import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import ProductsView from './views/ProductsView.vue'
import GuideView from './views/GuideView.vue'
import FourCView from './views/FourCView.vue'
import AdvantagesView from './views/AdvantagesView.vue'
import BuyingGuideView from './views/BuyingGuideView.vue'
import FaqView from './views/FaqView.vue'
import ContactView from './views/ContactView.vue'
import './styles/main.css'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/products', name: 'products', component: ProductsView },
    { path: '/process', name: 'process', component: GuideView },
    { path: '/4c', name: '4c', component: FourCView },
    { path: '/advantages', name: 'advantages', component: AdvantagesView },
    { path: '/buying-guide', name: 'buyingGuide', component: BuyingGuideView },
    { path: '/faq', name: 'faq', component: FaqView },
    { path: '/contact', name: 'contact', component: ContactView },
  ],
})

createApp(App).use(router).mount('#app')

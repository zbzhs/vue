import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import ProductsView from './views/ProductsView.vue'
import AboutView from './views/AboutView.vue'
import CraftView from './views/CraftView.vue'
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
    { path: '/about', name: 'about', component: AboutView },
    { path: '/craft', name: 'craft', component: CraftView },
    { path: '/contact', name: 'contact', component: ContactView },
  ],
})

createApp(App).use(router).mount('#app')

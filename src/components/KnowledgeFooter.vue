<template>
  <footer :class="footerClass" :aria-label="footerAriaLabel">
    <RouterLink class="home-footer-register" to="/register">
      {{ t('注册', 'Register') }}
    </RouterLink>
    <div class="home-footer-brand">DERING</div>
    <nav class="home-footer-links" :aria-label="navAriaLabel">
      <template v-for="link in knowledgeLinks" :key="link.to">
        <div v-if="link.to === '/about'" class="home-footer-menu">
          <button class="home-footer-menu-trigger" type="button">
            {{ link.label[locale] || link.label.zh || link.label.en }}
          </button>
          <div class="home-footer-submenu">
            <RouterLink to="/about">{{ t('关于 DERING', 'About DERING') }}</RouterLink>
            <RouterLink to="/contact">{{ t('联系我们', 'Contact Us') }}</RouterLink>
          </div>
        </div>
        <RouterLink v-else :to="link.to">
          {{ link.label[locale] || link.label.zh || link.label.en }}
        </RouterLink>
      </template>
    </nav>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

import { knowledgeLinks } from '../content/siteText'
import { useLocale } from '../composables/useLocale'

defineProps({
  footerClass: {
    type: String,
    default: 'home-footer',
  },
})

const { locale, t } = useLocale()

const footerAriaLabel = computed(() => t('页面底部导航', 'Footer navigation'))
const navAriaLabel = computed(() => t('珠宝知识', 'Jewelry knowledge'))
</script>

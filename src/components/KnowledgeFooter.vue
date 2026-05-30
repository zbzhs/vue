<template>
  <footer :class="footerClass" :aria-label="footerAriaLabel">
    <div class="home-footer-brand">DERING</div>
    <nav class="home-footer-links" :aria-label="navAriaLabel">
      <RouterLink v-for="link in knowledgeLinks" :key="link.to" :to="link.to">
        {{ link.label[locale] }}
      </RouterLink>
    </nav>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

import { knowledgeLinks } from '../content/siteText'
import { useLocale } from '../composables/useLocale'

const props = defineProps({
  footerClass: {
    type: String,
    default: 'home-footer',
  },
})

const { locale, t } = useLocale()

const footerAriaLabel = computed(() => t('页面底部导航', 'Footer navigation'))
const navAriaLabel = computed(() => t('珠宝知识', 'Jewelry knowledge'))
</script>

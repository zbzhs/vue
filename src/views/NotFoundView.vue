<template>
  <section class="not-found-page">
    <div class="not-found-shell">
      <p>404</p>
      <h1>{{ locale === 'en' ? 'Page not found' : '页面不存在' }}</h1>
      <RouterLink :to="{ name: 'home' }">
        {{ locale === 'en' ? 'Back to home' : '返回首页' }}
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
import { useLocale } from '../composables/useLocale'

const { locale } = useLocale()
</script>

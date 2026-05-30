<template>
  <div class="site-shell">
    <header class="nav-bar">
      <RouterLink class="brand" to="/" :aria-label="t('戴莉首页', 'DERING home')">
        <img class="brand-logo" src="/logo/name.jpg" :alt="t('戴莉 logo', 'DERING logo')" />
      </RouterLink>

      <nav class="nav-links" :aria-label="t('主导航', 'Main navigation')">
        <RouterLink class="brand-word" to="/">
          <span>{{ t('戴莉', 'FINE JEWELRY') }}</span>
          <strong>DERING</strong>
        </RouterLink>
        <RouterLink v-for="link in mainNavLinks" :key="link.to" :to="link.to">
          {{ link.label[locale] }}
        </RouterLink>
      </nav>

      <div class="nav-actions">
        <button
          class="locale-toggle"
          type="button"
          :aria-label="t('切换到英文', 'Switch to Chinese')"
          @click="toggleLocale"
        >
          <span class="locale-toggle-icon" aria-hidden="true">
            <i></i>
            <i></i>
          </span>
          <span class="locale-toggle-text">{{ isEnglish ? '中' : 'EN' }}</span>
        </button>
      </div>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { mainNavLinks } from './content/siteText'
import { useLocale } from './composables/useLocale'

const { locale, isEnglish, toggleLocale, t } = useLocale()
</script>

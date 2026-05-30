<template>
  <section class="page-hero text-hero advantages-hero">
    <div>
      <p class="eyebrow">{{ page.kicker }}</p>
      <h1>{{ page.title }}</h1>
      <p>{{ page.summary }}</p>
    </div>
  </section>

  <section class="content-section advantages-content">
    <div class="advantages-intro advantages-reveal" style="--reveal-delay: 0ms">
      <div class="advantages-intro-copy">
        <p class="eyebrow dark">{{ serviceKicker }}</p>
        <h2>{{ page.introTitle }}</h2>
        <p>{{ page.introText }}</p>
      </div>
      <div class="advantages-intro-mark" aria-hidden="true">DERING</div>
    </div>

    <div class="advantages-grid">
      <article
        v-for="(item, index) in page.items"
        :key="item.title"
        class="advantages-card advantages-reveal"
        :style="{ '--reveal-delay': `${index * 140 + 120}ms` }"
      >
        <span class="advantages-card-index">{{ item.index }}</span>
        <div class="advantages-card-copy">
          <p v-if="item.kicker" class="advantages-card-kicker">{{ item.kicker }}</p>
          <h2>{{ item.title }}</h2>
          <p>{{ item.text }}</p>
        </div>
      </article>
    </div>
  </section>

  <KnowledgeFooter footer-class="home-footer guide-footer" />
</template>

<script setup>
import { computed } from 'vue'

import KnowledgeFooter from '../components/KnowledgeFooter.vue'
import { useLocale } from '../composables/useLocale'

const { locale } = useLocale()

const serviceKicker = computed(() => (locale.value === 'en' ? 'Service System' : 'Service System'))

const pagesByLocale = {
  zh: {
    kicker: 'Advantages',
    title: '核心优势',
    summary: '以设计、供应链与服务体验构成品牌长期价值。',
    introTitle: '把体验拆成清晰、稳定、可追踪的服务环节。',
    introText: '从选材、设计沟通、制作标准到长期维护，每一步都服务于长期佩戴与收藏价值。',
    items: [
      {
        index: '01',
        kicker: 'Material Selection',
        title: '精选材质',
        text: '严选贵金属、钻石和彩色宝石，兼顾品质、耐久度与整体佩戴质感。',
      },
      {
        index: '02',
        kicker: 'Custom Projects',
        title: '定制服务',
        text: '支持婚戒、纪念款和专属设计需求，让款式表达更贴近具体场景与个人偏好。',
      },
      {
        index: '03',
        kicker: 'After-Sales Care',
        title: '售后保障',
        text: '提供清洁保养、尺寸调整和佩戴建议，帮助作品在长期使用中保持稳定状态。',
      },
    ],
  },
  en: {
    kicker: 'Advantages',
    title: 'Core Advantages',
    summary: 'Long-term brand value comes from design, supply chain, and service experience.',
    introTitle: 'We break the experience into clear, stable, and trackable service steps.',
    introText: 'From material selection and design communication to production standards and long-term care, every step supports lasting wear and collection value.',
    items: [
      {
        index: '01',
        kicker: 'Material Selection',
        title: 'Selected Materials',
        text: 'We choose precious metals, diamonds, and gemstones with close attention to quality, durability, and the final wearing feel.',
      },
      {
        index: '02',
        kicker: 'Custom Projects',
        title: 'Custom Service',
        text: 'Support is available for wedding rings, commemorative pieces, and exclusive designs tailored to specific scenarios and personal preferences.',
      },
      {
        index: '03',
        kicker: 'After-Sales Care',
        title: 'After-Sales Care',
        text: 'We provide cleaning, maintenance, resizing, and practical wearing advice so each piece stays stable over long-term use.',
      },
    ],
  },
}

const page = computed(() => pagesByLocale[locale.value])
</script>

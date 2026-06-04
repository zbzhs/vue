<template>
  <section class="advantages-editorial-shell">
    <div class="advantages-editorial-top" aria-hidden="true"></div>

    <div class="advantages-editorial-hero">
      <img :src="page.heroImage" :alt="page.heroAlt" />
    </div>

    <section class="advantages-editorial-page">
      <header class="advantages-editorial-head">
        <p class="eyebrow">{{ page.kicker }}</p>
        <h1>{{ page.title }}</h1>
        <p>{{ page.summary }}</p>
        <p>{{ page.introText }}</p>
      </header>

      <section
        v-for="item in page.items"
        :key="item.title"
        class="advantages-editorial-section"
      >
        <h2>{{ item.title }}</h2>
        <div class="advantages-editorial-body">
          <p v-for="paragraph in item.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </div>
      </section>
    </section>
  </section>

  <KnowledgeFooter footer-class="home-footer guide-footer" />
</template>

<script setup>
import { computed } from 'vue'

import KnowledgeFooter from '../components/KnowledgeFooter.vue'
import { useLocale } from '../composables/useLocale'

const { locale } = useLocale()

const pagesByLocale = {
  zh: {
    kicker: 'CORE STRENGTHS',
    title: '核心优势',
    heroImage: '/images/advantages-hq.jpg',
    heroAlt: '核心优势页面横幅',
    summary: '以设计、供应链与服务体验构成品牌长期价值。',
    introText:
      '从选材、设计沟通、制作标准到长期维护，每一步都围绕长期佩戴体验与作品价值展开，形成更稳定也更值得信赖的服务系统。',
    items: [
      {
        title: '精选材质',
        paragraphs: [
          '从贵金属到主石、配石与细节部件，我们坚持在稳定品质与佩戴舒适之间取得平衡，让作品既经得起日常使用，也保留足够细腻的光泽与质感。',
          '材质选择并不只看单一参数，而是结合色泽、硬度、触感与镶嵌表现综合判断，使每一件作品在视觉气质与长期耐用性上都更加协调。',
        ],
      },
      {
        title: '定制服务',
        paragraphs: [
          '无论是婚戒、纪念款还是个人化佩戴需求，我们都会从场景、预算与审美偏好出发，协助梳理更适合的设计方向，而不是让选择变得复杂。',
          '从前期沟通到款式确认、细节调整与成品交付，整个过程保持清晰节奏，让定制体验更从容，也让作品更贴近佩戴者本人的表达。',
        ],
      },
      {
        title: '售后保障',
        paragraphs: [
          '作品完成交付并不是服务的结束。清洁保养、尺寸微调、佩戴建议与后续维护，都会被纳入长期服务体系中，帮助作品维持稳定状态与良好观感。',
          '对于需要长期佩戴或具有纪念意义的作品，我们也更重视后续陪伴感，让日常使用、保存与维护都更省心。',
        ],
      },
    ],
  },
  en: {
    kicker: 'CORE STRENGTHS',
    title: 'Core Strengths',
    heroImage: '/images/advantages-hq.jpg',
    heroAlt: 'Core strengths page banner',
    summary: 'Long-term brand value comes from design, supply chain, and service experience.',
    introText:
      'From material selection and design communication to production standards and long-term care, every step is built around lasting wear and the value of each piece.',
    items: [
      {
        title: 'Selected Materials',
        paragraphs: [
          'From precious metals to center stones, side stones, and detail components, we keep quality and wearing comfort in balance so each piece remains refined in both daily use and finish.',
          'Material decisions are never based on a single parameter. We consider tone, hardness, touch, and setting performance together so the final piece stays visually coherent and durable over time.',
        ],
      },
      {
        title: 'Custom Service',
        paragraphs: [
          'Whether the need is for a wedding ring, a commemorative piece, or a personal design, we begin with scenario, budget, and aesthetic preference to define the right direction instead of making the process heavier.',
          'From early communication to style confirmation, detail adjustment, and delivery, the process remains clear and measured so the finished piece better reflects its wearer.',
        ],
      },
      {
        title: 'After-Sales Support',
        paragraphs: [
          'Delivery is not the end of service. Cleaning, resizing, wearing guidance, and later maintenance are all included in a longer-term support system that keeps each piece stable and well presented.',
          'For pieces that are worn often or carry commemorative meaning, we place more value on continuity so daily use, storage, and maintenance all feel easier.',
        ],
      },
    ],
  },
}

const page = computed(() => pagesByLocale[locale.value] || pagesByLocale.zh)
</script>

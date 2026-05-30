<template>
  <section class="content-section buying-content">
    <div class="buying-copy">
      <aside class="buying-note">
        <p class="eyebrow dark">{{ page.kicker }}</p>
        <h2 v-html="page.noteTitle"></h2>
        <p>{{ page.noteText }}</p>
      </aside>

      <div class="buying-steps">
        <article v-for="item in page.items" :key="item.title">
          <span>{{ item.index }}</span>
          <div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.text }}</p>
          </div>
          <span class="buying-arrow">›</span>
        </article>
      </div>
    </div>

    <div class="buying-gallery" :aria-label="page.galleryAriaLabel">
      <RouterLink
        v-for="card in page.gallery"
        :key="card.seriesKey"
        :to="{ name: 'products', query: { series: card.seriesKey } }"
        :class="['buying-tile', card.layoutClass]"
      >
        <img :src="card.image" :alt="card.alt" />
        <span class="buying-tile-overlay">
          <span class="buying-tile-series">{{ card.series }}</span>
          <span class="buying-tile-link">{{ page.galleryLink }}</span>
        </span>
      </RouterLink>
    </div>
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
    kicker: 'How to choose',
    noteTitle: '先判断佩戴场景<br />再决定预算与细节',
    noteText:
      '选购珠宝不必一开始就纠结所有参数。先把需求拆成几个关键问题，再去比较材质、款式、尺寸和预算。',
    galleryAriaLabel: '选购指南系列拼图',
    galleryLink: '查看该系列',
    gallery: [
      {
        seriesKey: '小清新吊坠',
        series: '小清新吊坠',
        image: '/images/guide/1.png',
        alt: '小清新吊坠系列佩戴展示图',
        layoutClass: 'buying-tile-primary',
      },
      {
        seriesKey: 'THE ONE系列',
        series: 'THE ONE系列',
        image: '/images/guide/2.png',
        alt: 'THE ONE系列婚礼佩戴展示图',
        layoutClass: 'buying-tile-top',
      },
      {
        seriesKey: '粉钻系列',
        series: '粉钻系列',
        image: '/images/guide/3.png',
        alt: '粉钻系列日常佩戴展示图',
        layoutClass: 'buying-tile-middle',
      },
      {
        seriesKey: '时尚小清新系列',
        series: '时尚小清新系列',
        image: '/images/guide/4.png',
        alt: '时尚小清新系列晚宴佩戴展示图',
        layoutClass: 'buying-tile-bottom',
      },
    ],
    items: [
      {
        index: '01',
        title: '确定场景',
        text: '这件作品是用于日常通勤、约会聚会、婚礼纪念，还是礼赠收藏？不同场景对应的设计重点不同，先明确用途，后面的选择会更清楚。',
      },
      {
        index: '02',
        title: '判断风格',
        text: '偏简洁利落、柔和日常、复古精致，还是更强调存在感？款式风格会直接影响佩戴频率，适合自己的气质比单纯追求流行更重要。',
      },
      {
        index: '03',
        title: '留意尺寸',
        text: '戒指圈号、手链长度、项链垂坠位置和耳饰比例，都会影响佩戴舒适度与视觉效果。若用于礼赠，建议优先选择更容易调整的尺寸范围。',
      },
      {
        index: '04',
        title: '试戴比较',
        text: '把颜色、比例、肤色、手型、脸型和日常穿搭一起考虑，不要只看单独一张产品图。真正适合的作品，通常在上身后会更自然、更耐看。',
      },
    ],
  },
  en: {
    kicker: 'How to choose',
    noteTitle: 'Start with the wearing scene<br />then settle the budget and details',
    noteText:
      'You do not need to solve every parameter at the beginning. Break the decision into a few key questions first, then compare material, style, size, and budget.',
    galleryAriaLabel: 'Buying guide collection gallery',
    galleryLink: 'View collection',
    gallery: [
      {
        seriesKey: '小清新吊坠',
        series: 'Fresh Pendant',
        image: '/images/guide/1.png',
        alt: 'Fresh Pendant collection look',
        layoutClass: 'buying-tile-primary',
      },
      {
        seriesKey: 'THE ONE系列',
        series: 'THE ONE Collection',
        image: '/images/guide/2.png',
        alt: 'THE ONE collection wedding look',
        layoutClass: 'buying-tile-top',
      },
      {
        seriesKey: '粉钻系列',
        series: 'Pink Diamond Collection',
        image: '/images/guide/3.png',
        alt: 'Pink Diamond collection everyday look',
        layoutClass: 'buying-tile-middle',
      },
      {
        seriesKey: '时尚小清新系列',
        series: 'Modern Fresh Collection',
        image: '/images/guide/4.png',
        alt: 'Modern Fresh collection evening look',
        layoutClass: 'buying-tile-bottom',
      },
    ],
    items: [
      {
        index: '01',
        title: 'Define the Occasion',
        text: 'Is the piece for daily commuting, social events, a wedding milestone, or gifting and collecting? Different occasions lead to different design priorities, so clarify the use case first.',
      },
      {
        index: '02',
        title: 'Read the Style',
        text: 'Do you prefer clean lines, softer daily wear, vintage refinement, or a stronger visual presence? Style directly affects wearing frequency, and what suits your personality matters more than short-lived trends.',
      },
      {
        index: '03',
        title: 'Check the Size',
        text: 'Ring size, bracelet length, necklace drop, and earring proportion all affect comfort and appearance. For gifts, choose a size range that is easier to adjust later.',
      },
      {
        index: '04',
        title: 'Compare on the Body',
        text: 'Think about color, proportion, skin tone, hand shape, face shape, and daily styling together. Do not judge only from a single product image. The right piece usually feels natural and enduring when worn.',
      },
    ],
  },
}

const page = computed(() => pagesByLocale[locale.value])
</script>

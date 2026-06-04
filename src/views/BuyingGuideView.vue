<template>
  <section class="buying-editorial-page">
    <div class="buying-editorial-copy">
      <div class="buying-editorial-steps">
        <article
          v-for="item in page.items"
          :key="item.title"
          class="buying-editorial-step"
        >
          <div class="buying-editorial-step-index">
            <span>{{ item.index }}</span>
          </div>

          <div class="buying-editorial-step-copy">
            <h2>{{ item.title }}</h2>
            <p>{{ item.text }}</p>
          </div>

          <span class="buying-editorial-step-arrow" aria-hidden="true">›</span>
        </article>
      </div>
    </div>

    <div class="buying-editorial-gallery" :aria-label="page.galleryAriaLabel">
      <RouterLink
        v-for="card in page.gallery"
        :key="card.key"
        :to="{ name: 'products', query: { series: card.seriesKey } }"
        :class="['buying-editorial-tile', card.layoutClass]"
        :aria-label="card.linkLabel"
      >
        <img :src="card.image" :alt="card.alt" />
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
    galleryAriaLabel: '选购指南图片拼图',
    gallery: [
      {
        key: 'occasion-black',
        seriesKey: '小清新吊坠',
        image: '/images/guide/1.png',
        alt: '黑色礼服珠宝搭配近景',
        linkLabel: '查看小清新吊坠系列',
        layoutClass: 'buying-editorial-tile-primary',
      },
      {
        key: 'occasion-bridal',
        seriesKey: 'THE ONE系列',
        image: '/images/guide/2.png',
        alt: '婚礼场景项链佩戴图',
        linkLabel: '查看 THE ONE 系列',
        layoutClass: 'buying-editorial-tile-top',
      },
      {
        key: 'style-tailored',
        seriesKey: '时尚小清新系列',
        image: '/images/guide/3.png',
        alt: '白色西装造型与珠宝搭配图',
        linkLabel: '查看时尚小清新系列',
        layoutClass: 'buying-editorial-tile-middle',
      },
      {
        key: 'style-dinner',
        seriesKey: '粉钻系列',
        image: '/images/guide/4.png',
        alt: '晚宴场景项链佩戴图',
        linkLabel: '查看粉钻系列',
        layoutClass: 'buying-editorial-tile-bottom',
      },
      {
        key: 'size-tailored',
        seriesKey: '时尚小清新系列',
        image: '/images/guide/5.png',
        alt: '蓝色礼服珠宝佩戴图',
        linkLabel: '查看时尚小清新系列更多款式',
        layoutClass: 'buying-editorial-tile-fifth',
      },
      {
        key: 'compare-black',
        seriesKey: '小清新吊坠',
        image: '/images/guide/6.png',
        alt: '深色礼服耳饰佩戴图',
        linkLabel: '查看小清新吊坠系列更多款式',
        layoutClass: 'buying-editorial-tile-sixth',
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
    galleryAriaLabel: 'Buying guide image collage',
    gallery: [
      {
        key: 'occasion-black',
        seriesKey: '小清新吊坠',
        image: '/images/guide/1.png',
        alt: 'Black dress jewelry close-up',
        linkLabel: 'View Fresh Pendant collection',
        layoutClass: 'buying-editorial-tile-primary',
      },
      {
        key: 'occasion-bridal',
        seriesKey: 'THE ONE系列',
        image: '/images/guide/2.png',
        alt: 'Bridal necklace look',
        linkLabel: 'View THE ONE collection',
        layoutClass: 'buying-editorial-tile-top',
      },
      {
        key: 'style-tailored',
        seriesKey: '时尚小清新系列',
        image: '/images/guide/3.png',
        alt: 'Tailored styling with jewelry',
        linkLabel: 'View Modern Fresh collection',
        layoutClass: 'buying-editorial-tile-middle',
      },
      {
        key: 'style-dinner',
        seriesKey: '粉钻系列',
        image: '/images/guide/4.png',
        alt: 'Dinner scene necklace styling',
        linkLabel: 'View Pink Diamond collection',
        layoutClass: 'buying-editorial-tile-bottom',
      },
      {
        key: 'size-tailored',
        seriesKey: '时尚小清新系列',
        image: '/images/guide/5.png',
        alt: 'Blue dress jewelry styling',
        linkLabel: 'View more Modern Fresh pieces',
        layoutClass: 'buying-editorial-tile-fifth',
      },
      {
        key: 'compare-black',
        seriesKey: '小清新吊坠',
        image: '/images/guide/6.png',
        alt: 'Dark dress earring styling',
        linkLabel: 'View more Fresh Pendant pieces',
        layoutClass: 'buying-editorial-tile-sixth',
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
        text: 'Do you prefer clean lines, softer daily wear, vintage refinement, or a stronger visual presence? The right style affects wearing frequency, and what suits your temperament matters more than chasing trends.',
      },
      {
        index: '03',
        title: 'Check the Size',
        text: 'Ring size, bracelet length, necklace drop, and earring proportion all affect comfort and appearance. For gifts, it is safer to start with a size range that is easier to adjust later.',
      },
      {
        index: '04',
        title: 'Compare on the Body',
        text: 'Consider color, proportion, skin tone, hand shape, face shape, and daily styling together. The right piece usually feels more natural and more enduring once it is actually worn.',
      },
    ],
  },
}

const page = computed(() => pagesByLocale[locale.value] || pagesByLocale.zh)
</script>

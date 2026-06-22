<template>
  <div class="series-detail-page">
    <section class="series-detail-hero" :aria-label="series.title">
      <div class="series-detail-media">
        <img :src="series.image" :alt="series.alt" />
      </div>

      <div class="series-detail-copy">
        <p class="eyebrow">{{ series.kicker }}</p>
        <h1>{{ series.title }}</h1>
        <p>{{ series.text }}</p>
        <RouterLink class="series-detail-link" :to="series.productsTo">
          {{ copy.cta }}
        </RouterLink>
      </div>
    </section>

    <KnowledgeFooter footer-class="home-footer product-page-footer" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import KnowledgeFooter from '../components/KnowledgeFooter.vue'
import { useLocale } from '../composables/useLocale'

const route = useRoute()
const { locale } = useLocale()

const seriesItems = {
  pink: {
    image: '/images/home/series/series1.png',
    productsTo: { name: 'products', query: { series: '粉钻系列' } },
    kicker: {
      zh: '彩钻系列',
      en: 'Colored Diamond',
      ja: 'カラーダイヤモンド',
      th: 'เพชรสี',
      ko: '컬러 다이아몬드',
      vi: 'Kim cuong mau',
    },
    title: {
      zh: '粉钻系列',
      en: 'Pink Diamond',
      ja: 'ピンクダイヤモンド',
      th: 'เพชรสีชมพู',
      ko: '핑크 다이아몬드',
      vi: 'Kim cuong hong',
    },
    text: {
      zh: '柔和粉色调与精致镶嵌，让礼物和收藏都更有记忆点。',
      en: 'Soft pink tones and refined settings for gifts, milestones, and collectible pieces.',
      ja: 'やわらかなピンクの色合いと繊細なセッティングで、贈り物やコレクションを印象的に。',
      th: 'โทนชมพูอ่อนและงานฝังละเอียด เหมาะสำหรับของขวัญ ช่วงเวลาสำคัญ และชิ้นสะสม',
      ko: '부드러운 핑크 톤과 섬세한 세팅으로 선물과 컬렉션에 특별한 기억을 더합니다.',
      vi: 'Sac hong mem mai va thiet ke tinh te cho qua tang, dau moc va nhung mon suu tam dang nho.',
    },
    alt: {
      zh: '粉钻系列',
      en: 'Pink diamond collection',
      ja: 'ピンクダイヤモンドコレクション',
      th: 'คอลเลกชันเพชรสีชมพู',
      ko: '핑크 다이아몬드 컬렉션',
      vi: 'Bo suu tap kim cuong hong',
    },
  },
  prong: {
    image: '/images/home/series/series2.png',
    productsTo: { name: 'products', query: { q: '爪系列' } },
    kicker: {
      zh: '经典镶嵌',
      en: 'Classic Setting',
      ja: 'クラシックセッティング',
      th: 'งานฝังคลาสสิก',
      ko: '클래식 세팅',
      vi: 'Kieu dinh co dien',
    },
    title: {
      zh: '四爪/六爪系列',
      en: 'Four-Prong / Six-Prong',
      ja: '4本爪 / 6本爪',
      th: 'สี่หนาม / หกหนาม',
      ko: '4프롱 / 6프롱',
      vi: 'Bon chau / Sau chau',
    },
    text: {
      zh: '干净利落的爪镶比例，突出主石火彩与日常佩戴的轻盈感。',
      en: 'Clean prong proportions designed to highlight fire, brightness, and daily wearability.',
      ja: 'すっきりとした爪留めのバランスで、主石の輝きと毎日の使いやすさを引き立てます。',
      th: 'สัดส่วนหนามที่สะอาดตา ช่วยขับประกาย ความสว่าง และความเบาสบายในการสวมใส่ทุกวัน',
      ko: '깔끔한 프롱 비율로 메인 스톤의 광채와 일상 착용의 가벼움을 돋보이게 합니다.',
      vi: 'Ti le chau gon gang giup noi bat lua, do sang va cam giac de deo hang ngay.',
    },
    alt: {
      zh: '四爪六爪系列',
      en: 'Four-prong and six-prong collection',
      ja: '4本爪と6本爪のコレクション',
      th: 'คอลเลกชันสี่หนามและหกหนาม',
      ko: '4프롱 및 6프롱 컬렉션',
      vi: 'Bo suu tap bon chau va sau chau',
    },
  },
  marquise: {
    image: '/images/home/series/series3/1.png',
    productsTo: { name: 'products', query: { series: '马眼系列' } },
    kicker: {
      zh: '马眼切割',
      en: 'Marquise Cut',
      ja: 'マーキスカット',
      th: 'ทรง Marquise',
      ko: '마퀴즈 컷',
      vi: 'Cat marquise',
    },
    title: {
      zh: '马眼系列',
      en: 'Marquise',
      ja: 'マーキス',
      th: 'Marquise',
      ko: '마퀴즈',
      vi: 'Marquise',
    },
    text: {
      zh: '修长的马眼切割拉伸线条，适合戒指、耳饰与项链的优雅造型。',
      en: 'An elongated cut that brings graceful lines to rings, earrings, and necklaces.',
      ja: '細長いマーキスカットが、リング、イヤリング、ネックレスに優雅なラインを添えます。',
      th: 'รูปทรงยาวเรียวช่วยเพิ่มเส้นสายสง่างามให้แหวน ต่างหู และสร้อยคอ',
      ko: '길게 뻗은 마퀴즈 컷이 반지, 귀걸이, 목걸이에 우아한 라인을 더합니다.',
      vi: 'Dang cat marquise thon dai tao duong net thanh lich cho nhan, hoa tai va day chuyen.',
    },
    alt: {
      zh: '马眼系列',
      en: 'Marquise collection',
      ja: 'マーキスコレクション',
      th: 'คอลเลกชัน Marquise',
      ko: '마퀴즈 컬렉션',
      vi: 'Bo suu tap marquise',
    },
  },
}

const pageCopy = {
  zh: { cta: '查看系列产品' },
  en: { cta: 'View Products' },
  ja: { cta: '商品を見る' },
  th: { cta: 'ดูสินค้า' },
  ko: { cta: '제품 보기' },
  vi: { cta: 'Xem san pham' },
}

const pick = (values, activeLocale) => values?.[activeLocale] || values?.zh || values?.en || ''

const activeSlug = computed(() => {
  const slug = String(route.params.slug || '')
  return seriesItems[slug] ? slug : 'pink'
})

const copy = computed(() => pageCopy[locale.value] || pageCopy.zh)

const series = computed(() => {
  const activeLocale = pageCopy[locale.value] ? locale.value : 'zh'
  const item = seriesItems[activeSlug.value]

  return {
    ...item,
    kicker: pick(item.kicker, activeLocale),
    title: pick(item.title, activeLocale),
    text: pick(item.text, activeLocale),
    alt: pick(item.alt, activeLocale),
  }
})
</script>

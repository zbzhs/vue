<template>
  <div class="series-detail-page" :class="{ 'series-detail-page--cover-entry': isCoverEntry }">
    <button class="series-detail-back" type="button" :aria-label="copy.back" @click="goBack">
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M12.5 4.5 6.5 10l6 5.5" />
      </svg>
    </button>

    <section class="series-detail-hero" :aria-label="series.title">
      <div class="series-detail-showcase">
        <div class="series-jewelry-grid">
          <RouterLink
            v-for="item in visibleShowcase"
            :key="item.image"
            class="series-jewelry-card"
            :to="getShowcaseProductTo(item)"
          >
            <span>
              <img :src="item.image" :alt="item.name" />
            </span>
            <small>{{ item.type }}</small>
            <strong>{{ item.name }}</strong>
          </RouterLink>
        </div>
        <div
          v-if="hasShowcasePages"
          class="series-showcase-pager"
          :aria-label="copy.productsPager || '产品分组'"
        >
          <button
            v-for="(_, index) in showcasePages"
            :key="index"
            class="series-showcase-page-dot"
            :class="{ 'is-active': index === activeShowcasePage }"
            type="button"
            :aria-label="`第 ${index + 1} 组产品`"
            :aria-current="index === activeShowcasePage ? 'true' : undefined"
            @click="setShowcasePage(index)"
          ></button>
        </div>
      </div>

      <div class="series-detail-feature">
        <div class="series-detail-media">
          <img :src="series.image" :alt="series.alt" />
        </div>
      </div>
    </section>

    <KnowledgeFooter footer-class="home-footer product-page-footer" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import KnowledgeFooter from '../components/KnowledgeFooter.vue'
import { useLocale } from '../composables/useLocale'

const route = useRoute()
const router = useRouter()
const { locale } = useLocale()
const showcasePage = ref(0)
const dynamicShowcases = ref({})

const seriesFolderBySlug = {
  pink: 'series1',
  prong: 'series2',
  marquise: 'series3',
  banquet: 'series4',
  chroma: 'series5',
}

const seriesShowcaseItems = {
  series1: [
    'APYE0218-W-30.png',
    'APYE0219-W-50.png',
    'APYFR0041-Pt-100.png',
    'APYFR0049-Pt-100.png',
    'APYFR0058-Pt-100.png',
    'APYN0087-Pt-150.png',
    'APYN0221-W-50.png',
    'APYP0007-Pt-200.png',
  ],
  series2: [
    'APYE0008-W.png',
    'APYE0056-Pt-20.png',
    'APYFR0092-Pt-15.png',
    'APYFR0204-Pt-100.png',
    'APYN0006-Pt-15.png',
    'APYN0027-Pt-30.png',
    'APYN0041-W-50.png',
    'APYN0058-W.png',
  ],
  series3: [
    'APYE0055-Pt-20.png',
    'APYE0133-W-100.png',
    'APYFR0188-Y.png',
    'APYFR0189-Y.jpg',
    'APYFR0270-Y-100.png',
    'APYN0086-Pt-200.png',
    'APYN0137-W-100.png',
    'APYP0057-Y-100.png',
  ],
  series4: [
    'APYE0075-Pt-25.png',
    'APYE0102-W.png',
    'APYE0158-Pt-50.png',
    'APYE0187-W-200.png',
    'APYFR0136-W-100.png',
    'APYN0096-W.png',
    'APYN0174-W-200.png',
    'APYP0007-Pt-200.png',
  ],
  series5: [
    'APYE0103-Pt.png',
    'APYFR0234-Y-200.png',
    'APYFR0304-RW-100.png',
    'APYFR0309-RW-100.png',
    'APYN0113-Y-10.png',
    'APYN0159-RW-200.png',
    'APYN0251-W.png',
    'APYP0165-RW-100.png',
  ],
}

const seriesShowcases = {
  series1: buildStaticShowcase('series1'),
  series2: buildStaticShowcase('series2'),
  series3: buildStaticShowcase('series3'),
  series4: buildStaticShowcase('series4'),
  series5: buildStaticShowcase('series5'),
}

const seriesItems = {
  pink: {
    image: '/images/home/series/series1.png',
    productsTo: { name: 'products', query: { series: '粉钻系列' } },
    showcase: seriesShowcases.series1,
    kicker: {
      zh: '彩钻系列',
      en: 'Colored Diamond',
      ja: 'カラーダイヤモンド',
      th: 'เพชรสี',
      ko: '컬러 다이아몬드',
      vi: 'Kim cuong mau',
    },
    title: {
      zh: '情定永恒・告白经典系列',
      en: 'Pink Diamond',
      ja: 'ピンクダイヤモンド',
      th: 'เพชรสีชมพู',
      ko: '핑크 다이아몬드',
      vi: 'Kim cuong hong',
    },
    text: {
      zh: '求婚、纪念日、情侣对饰，百搭传世款。',
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
    showcase: seriesShowcases.series2,
    kicker: {
      zh: '悦己序章',
      en: 'Classic Setting',
      ja: 'クラシックセッティング',
      th: 'งานฝังคลาสสิก',
      ko: '클래식 세팅',
      vi: 'Kieu dinh co dien',
    },
    title: {
      zh: '悦己序章・日常轻奢系列',
      en: 'Four-Prong / Six-Prong',
      ja: '4本爪 / 6本爪',
      th: 'สี่หนาม / หกหนาม',
      ko: '4프롱 / 6프롱',
      vi: 'Bon chau / Sau chau',
    },
    text: {
      zh: '主打通勤、百搭小众首饰，取悦自我日常佩戴',
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
    image: '/images/home/series/series3.png',
    productsTo: { name: 'products', query: { series: '马眼系列' } },
    showcase: seriesShowcases.series3,
    kicker: {
      zh: '马眼切割',
      en: 'Marquise Cut',
      ja: 'マーキスカット',
      th: 'ทรง Marquise',
      ko: '마퀴즈 컷',
      vi: 'Cat marquise',
    },
    title: {
      zh: '星隅私造・星河臻品系列',
      en: 'Marquise',
      ja: 'マーキス',
      th: 'Marquise',
      ko: '마퀴즈',
      vi: 'Marquise',
    },
    text: {
      zh: '独家原创手稿，撷取漫天星隅灵感，小众独版星辰首饰。',
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
  banquet: {
    image: '/images/home/series/series4.png',
    productsTo: { name: 'products', query: { series: '鎏光宴叙・高奢宴会系列' } },
    showcase: seriesShowcases.series4,
    kicker: {
      zh: '鎏光宴叙',
      en: 'Banquet High Jewelry',
    },
    title: {
      zh: '鎏光宴叙・高奢宴会系列',
      en: 'Banquet High Jewelry Collection',
    },
    text: {
      zh: '原创高奢宴会美学手稿，以重工工艺凝聚鎏光华彩，打造红毯、晚宴、婚礼场合的瞩目奢华珠宝。',
      en: 'Original evening-jewelry studies shaped with couture craftsmanship for red carpets, galas, and weddings.',
    },
    alt: {
      zh: '鎏光宴叙・高奢宴会系列',
      en: 'Banquet high jewelry collection',
    },
  },
  chroma: {
    image: '/images/home/series/series5.png',
    productsTo: { name: 'products', query: { series: '幻彩艺藏・彩钻限定系列' } },
    showcase: seriesShowcases.series5,
    kicker: {
      zh: '幻彩艺藏',
      en: 'Chroma Art Collection',
    },
    title: {
      zh: '幻彩艺藏・彩钻限定系列',
      en: 'Chroma Art Colored Diamond Limited Collection',
    },
    text: {
      zh: '原创幻彩艺术手稿，以珍稀彩钻与灵动切割，塑造限量典藏款式。',
      en: 'Original chroma art studies pair rare colored diamonds with expressive cuts for limited collectible designs.',
    },
    alt: {
      zh: '幻彩艺藏・彩钻限定系列',
      en: 'Chroma art colored diamond limited collection',
    },
  },
}

const pageCopy = {
  zh: { back: '返回', cta: '查看系列产品', showcase: '精选珠宝' },
  en: { back: 'Back', cta: 'View Products', showcase: 'Jewelry Selection' },
  ja: { back: '戻る', cta: '商品を見る', showcase: 'ジュエリー' },
  th: { back: 'กลับ', cta: 'ดูสินค้า', showcase: 'เครื่องประดับคัดสรร' },
  ko: { back: '뒤로', cta: '제품 보기', showcase: '주얼리 셀렉션' },
  vi: { back: 'Quay lai', cta: 'Xem san pham', showcase: 'Trang suc chon loc' },
}

const pick = (values, activeLocale) => values?.[activeLocale] || values?.zh || values?.en || ''

function getShowcaseType(styleNo) {
  if (styleNo.startsWith('APYE')) {
    return 'EARRINGS'
  }

  if (styleNo.startsWith('APYFR')) {
    return 'RING'
  }

  if (styleNo.startsWith('APYN')) {
    return 'NECKLACE'
  }

  if (styleNo.startsWith('APYP')) {
    return 'PENDANT'
  }

  return 'JEWELRY'
}

function getStyleNoFromImageName(imageName) {
  return String(imageName || '').replace(/\.[^.]+$/, '')
}

function buildStaticShowcase(folder) {
  return (seriesShowcaseItems[folder] || []).map((imageName) => {
    const styleNo = getStyleNoFromImageName(imageName)

    return {
      code: styleNo,
      styleNo,
      type: getShowcaseType(styleNo),
      name: styleNo,
      image: `http://img.deringdiam.com/product1/${imageName}`,
    }
  })
}

function mergeShowcaseProducts(staticProducts, dynamicProducts) {
  const dynamicByCode = new Map(
    (Array.isArray(dynamicProducts) ? dynamicProducts : [])
      .filter((item) => item?.code || item?.styleNo || item?.name)
      .map((item) => [item.code || item.styleNo || item.name, item]),
  )

  return staticProducts.map((item) => {
    const dynamicItem = dynamicByCode.get(item.code)

    return dynamicItem?.image
      ? { ...item, ...dynamicItem, code: item.code, styleNo: item.styleNo, name: item.name }
      : item
  })
}

const activeSlug = computed(() => {
  const slug = String(route.params.slug || '')
  return seriesItems[slug] ? slug : 'pink'
})

const copy = computed(() => pageCopy[locale.value] || pageCopy.zh)

const isCoverEntry = computed(() => route.query.entry === 'cover')

const series = computed(() => {
  const activeLocale = pageCopy[locale.value] ? locale.value : 'zh'
  const item = seriesItems[activeSlug.value]
  const folder = seriesFolderBySlug[activeSlug.value]
  const dynamicShowcase = folder ? dynamicShowcases.value[folder] : null

  return {
    ...item,
    showcase: mergeShowcaseProducts(item.showcase, dynamicShowcase),
    kicker: pick(item.kicker, activeLocale),
    title: pick(item.title, activeLocale),
    text: pick(item.text, activeLocale),
    alt: pick(item.alt, activeLocale),
  }
})

const showcasePages = computed(() => {
  const items = series.value.showcase || []
  const pages = []

  for (let index = 0; index < items.length; index += 4) {
    pages.push(items.slice(index, index + 4))
  }

  return pages
})

const activeShowcasePage = computed(() => {
  if (!showcasePages.value.length) {
    return 0
  }

  return showcasePage.value % showcasePages.value.length
})

const visibleShowcase = computed(() => showcasePages.value[activeShowcasePage.value] || [])

const hasShowcasePages = computed(() => showcasePages.value.length > 1)

async function fetchSeriesShowcase(slug) {
  const folder = seriesFolderBySlug[slug]
  if (!folder || dynamicShowcases.value[folder]) {
    return
  }

  try {
    const response = await fetch(`/api/series-showcase/${folder}`, { cache: 'no-store' })
    if (!response.ok) {
      return
    }

    const payload = await response.json()
    const products = Array.isArray(payload.products) ? payload.products : []
    dynamicShowcases.value = {
      ...dynamicShowcases.value,
      [folder]: products,
    }
  } catch {
    dynamicShowcases.value = {
      ...dynamicShowcases.value,
      [folder]: [],
    }
  }
}

watch(activeSlug, (slug) => {
  showcasePage.value = 0
  fetchSeriesShowcase(slug)
}, { immediate: true })

function setShowcasePage(index) {
  if (!hasShowcasePages.value) {
    return
  }

  showcasePage.value = index
}

function getShowcaseProductTo(item) {
  const code = item?.code || item?.styleNo || item?.name
  if (!code) {
    return series.value.productsTo
  }

  return {
    name: 'products',
    query: { product: code },
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push({ name: 'home' })
}
</script>

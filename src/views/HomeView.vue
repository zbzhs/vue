<template>
  <div class="home-page">
    <section class="home-hero-banner">
      <div class="home-hero-slides" aria-hidden="true">
        <div
          v-for="(slide, index) in heroSlides"
          :key="slide"
          class="home-hero-slide"
          :class="{
            'is-active': index === activeSlide,
            'is-background-2': slide.includes('background2'),
            'is-background-3': slide.includes('background3'),
            'is-background-4': slide.includes('background4'),
          }"
          :style="{ backgroundImage: `url(${slide})` }"
        >
          <div
            class="home-hero-mark"
            :class="[
              heroSlideMark(slide).className,
              {
                'home-hero-mark--sentence': heroSlideMark(slide).sentence,
                'home-hero-mark--english-only': heroSlideMark(slide).englishOnly,
              },
            ]"
            aria-hidden="true"
          >
            <template v-if="heroSlideMark(slide).englishOnly">
              <span class="home-hero-mark-en">{{ heroSlideMark(slide).english }}</span>
            </template>
            <template v-else-if="heroSlideMark(slide).kicker">
              <span class="home-hero-mark-kicker">{{ heroSlideMark(slide).kicker }}</span>
              <span class="home-hero-mark-subtitle">{{ heroSlideMark(slide).title }}</span>
              <span v-if="heroSlideMark(slide).showRule" class="home-hero-mark-rule"></span>
              <span class="home-hero-mark-cn">{{ heroSlideMark(slide).text }}</span>
            </template>
            <template v-else>
              <span v-if="heroSlideMark(slide).english" class="home-hero-mark-en">
                {{ heroSlideMark(slide).english }}
              </span>
              <span v-if="heroSlideMark(slide).showRule" class="home-hero-mark-rule"></span>
              <span class="home-hero-mark-subtitle">{{ heroSlideMark(slide).title }}</span>
              <span class="home-hero-mark-cn">{{ heroSlideMark(slide).text }}</span>
            </template>
          </div>
        </div>
      </div>
      <div class="home-hero-overlay" aria-hidden="true"></div>

      <div class="home-hero-inner">
        <div
          v-if="heroSlides.length > 1"
          class="home-hero-pagination"
          :aria-label="copy.hero.paginationLabel"
        >
          <button
            v-for="(slide, index) in heroSlides"
            :key="`${slide}-dot`"
            class="home-hero-dot"
            :class="{ 'is-active': index === activeSlide }"
            type="button"
            :aria-label="`${copy.hero.goToSlideLabel} ${index + 1}`"
            @click="setActiveSlide(index)"
          ></button>
        </div>
      </div>
    </section>

    <section class="home-brand-transition" aria-label="DERING">
      <div class="home-brand-wordmark">
        <span>DERING</span>
        <p>{{ copy.series.scrollHint }}</p>
      </div>
    </section>

    <section class="home-series-section" :aria-label="copy.series.ariaLabel">
      <RouterLink
        v-for="card in copy.series.cards"
        :key="card.key"
        class="home-series-panel"
        :class="[`home-series-panel-${card.key}`, { 'home-series-panel-reverse': card.imageSide === 'right' }]"
        :to="card.to"
        :aria-label="card.ariaLabel"
      >
        <img class="home-series-panel-image" :src="card.image" :alt="card.alt" />

        <div class="home-series-panel-shade" aria-hidden="true"></div>

        <div class="home-series-panel-copy">
          <p class="eyebrow">{{ card.kicker }}</p>
          <h2>{{ card.title }}</h2>
          <p>{{ card.text }}</p>
          <span>{{ copy.series.cta }}</span>
        </div>
      </RouterLink>
    </section>

    <KnowledgeFooter footer-class="home-footer" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import KnowledgeFooter from '../components/KnowledgeFooter.vue'
import { useLocale } from '../composables/useLocale'

const { locale } = useLocale()

const heroBackgroundModules = import.meta.glob('/public/images/home/background*', {
  eager: true,
  import: 'default',
  query: '?url',
})

const parseBackgroundOrder = (path) => {
  const match = path.match(/background(\d+)?\.[^.]+$/i)
  if (!match) {
    return Number.MAX_SAFE_INTEGER
  }

  return match[1] ? Number(match[1]) : 0
}

const heroSlides = Object.entries(heroBackgroundModules)
  .sort(([leftPath], [rightPath]) => parseBackgroundOrder(leftPath) - parseBackgroundOrder(rightPath))
  .map(([, url]) => url)

if (!heroSlides.length) {
  heroSlides.push('/images/home/background1.jpg')
}

const activeSlide = ref(0)
let autoplayTimer = null

const stopAutoplay = () => {
  if (autoplayTimer) {
    window.clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

const startAutoplay = () => {
  if (heroSlides.length < 2) {
    return
  }

  stopAutoplay()
  autoplayTimer = window.setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % heroSlides.length
  }, 5000)
}

const setActiveSlide = (index) => {
  activeSlide.value = index
  startAutoplay()
}

onMounted(() => {
  startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()
})

const seriesCards = [
  {
    key: 'pink',
    kicker: { zh: 'Colored Diamond', en: 'Colored Diamond', ja: 'カラーダイヤモンド', th: 'เพชรสี', ko: '컬러 다이아몬드', vi: 'Kim cương màu' },
    title: { zh: '粉钻系列', en: 'Pink Diamond', ja: 'ピンクダイヤモンド', th: 'เพชรสีชมพู', ko: '핑크 다이아몬드', vi: 'Kim cương hồng' },
    text: {
      zh: '柔和粉色调与精致镶嵌，让礼物和收藏都更有记忆点。',
      en: 'Soft pink tones and refined settings for gifts, milestones, and collectible pieces.',
      ja: 'やわらかなピンクの色合いと繊細なセッティングが、贈り物やコレクションを印象的にします。',
      th: 'โทนสีชมพูอ่อนและงานฝังประณีต ทำให้ของขวัญและงานสะสมมีความทรงจำยิ่งขึ้น',
      ko: '부드러운 핑크 톤과 섬세한 세팅으로 선물과 컬렉션에 특별한 기억을 더합니다.',
      vi: 'Sắc hồng mềm mại cùng thiết kế tinh tế giúp món quà và bộ sưu tập trở nên đáng nhớ hơn.',
    },
    image: '/images/home/series/series1.png',
    alt: { zh: '粉钻系列', en: 'Pink diamond collection', ja: 'ピンクダイヤモンドコレクション', th: 'คอลเลกชันเพชรสีชมพู', ko: '핑크 다이아몬드 컬렉션', vi: 'Bộ sưu tập kim cương hồng' },
    ariaLabel: { zh: '查看粉钻系列', en: 'View pink diamond collection', ja: 'ピンクダイヤモンドを見る', th: 'ดูคอลเลกชันเพชรสีชมพู', ko: '핑크 다이아몬드 컬렉션 보기', vi: 'Xem bộ sưu tập kim cương hồng' },
    to: { name: 'series', params: { slug: 'pink' } },
  },
  {
    key: 'prong',
    kicker: { zh: 'Classic Setting', en: 'Classic Setting', ja: 'クラシックセッティング', th: 'ตัวเรือนคลาสสิก', ko: '클래식 세팅', vi: 'Ổ chấu cổ điển' },
    title: { zh: '四爪/六爪系列', en: 'Four-Prong / Six-Prong', ja: '4本爪 / 6本爪', th: 'สี่หนาม / หกหนาม', ko: '4프롱 / 6프롱', vi: 'Bốn chấu / Sáu chấu' },
    text: {
      zh: '干净利落的爪镶比例，突出主石火彩与日常佩戴的轻盈感。',
      en: 'Clean prong proportions designed to highlight fire, brightness, and daily wearability.',
      ja: 'すっきりとした爪留めのバランスで、主石の輝きと日常使いの軽やかさを引き立てます。',
      th: 'สัดส่วนหนามเตยที่เรียบคม ช่วยขับประกายไฟและความสว่างของเม็ดหลักในทุกวัน',
      ko: '간결한 프롱 비율로 메인 스톤의 광채와 데일리 착용의 가벼움을 강조합니다.',
      vi: 'Tỷ lệ chấu gọn gàng làm nổi bật ánh lửa, độ sáng và cảm giác nhẹ khi đeo hằng ngày.',
    },
    image: '/images/home/series/series2.png',
    alt: { zh: '四爪六爪系列', en: 'Four-prong and six-prong collection', ja: '4本爪と6本爪のコレクション', th: 'คอลเลกชันสี่หนามและหกหนาม', ko: '4프롱 및 6프롱 컬렉션', vi: 'Bộ sưu tập bốn chấu và sáu chấu' },
    ariaLabel: { zh: '查看四爪和六爪系列', en: 'View four-prong and six-prong collections', ja: '4本爪と6本爪を見る', th: 'ดูคอลเลกชันสี่หนามและหกหนาม', ko: '4프롱 및 6프롱 컬렉션 보기', vi: 'Xem bộ sưu tập bốn chấu và sáu chấu' },
    to: { name: 'series', params: { slug: 'prong' } },
  },
  {
    key: 'marquise',
    kicker: { zh: 'Marquise Cut', en: 'Marquise Cut', ja: 'マーキスカット', th: 'ทรงมาร์quise', ko: '마퀴즈 컷', vi: 'Cắt marquise' },
    title: { zh: '星隅私造・星河臻品系列', en: 'Marquise', ja: 'マーキス', th: 'มาร์quise', ko: '마퀴즈', vi: 'Marquise' },
    text: {
      zh: '独家原创手稿，撷取漫天星隅灵感，小众独版星辰首饰。',
      en: 'An elongated cut that brings graceful lines to rings, earrings, and necklaces.',
      ja: '細長いマーキスカットが、リング、イヤーアクセ、ネックレスに優雅なラインを添えます。',
      th: 'ทรงมาร์quise ที่เรียวยาวช่วยสร้างเส้นสายสง่างามให้แหวน ต่างหู และสร้อยคอ',
      ko: '길게 뻗은 마퀴즈 컷이 반지, 귀걸이, 목걸이에 우아한 라인을 더합니다.',
      vi: 'Dáng cắt marquise thon dài mang lại đường nét thanh lịch cho nhẫn, hoa tai và dây chuyền.',
    },
    image: '/images/home/series/series3.png',
    alt: { zh: '马眼系列', en: 'Marquise collection', ja: 'マーキスコレクション', th: 'คอลเลกชันมาร์quise', ko: '마퀴즈 컬렉션', vi: 'Bộ sưu tập marquise' },
    ariaLabel: { zh: '查看马眼系列', en: 'View marquise collection', ja: 'マーキスコレクションを見る', th: 'ดูคอลเลกชันมาร์quise', ko: '마퀴즈 컬렉션 보기', vi: 'Xem bộ sưu tập marquise' },
    to: { name: 'series', params: { slug: 'marquise' } },
  },
  {
    key: 'banquet',
    imageSide: 'right',
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
    image: '/images/home/series/series4.png',
    alt: {
      zh: '鎏光宴叙・高奢宴会系列',
      en: 'Banquet high jewelry collection',
    },
    ariaLabel: {
      zh: '查看鎏光宴叙・高奢宴会系列',
      en: 'View banquet high jewelry collection',
    },
    to: { name: 'series', params: { slug: 'banquet' } },
  },
]

const homeCopy = {
  zh: {
    hero: {
      primary: {
        kicker: '高级珠宝与定制设计',
        title: 'DERING',
      },
      paginationLabel: '首页大图轮播',
      goToSlideLabel: '切换到第',
      markKicker: '柔和绽放',
      markSubtitle: '为爱定制',
      markLine: '自然的韵律 艺术的共鸣',
    },
    series: {
      ariaLabel: '首页精选系列',
      cta: '查看系列',
      scrollHint: '下拉查看更多系列',
    },
  },
  en: {
    hero: {
      primary: {
        kicker: 'Fine Jewelry and Bespoke Design',
        title: 'DERING',
      },
      paginationLabel: 'Home hero carousel',
      goToSlideLabel: 'Go to slide',
      markKicker: 'Radiate Softly',
      markSubtitle: 'Bespoke for Love',
      markLine: 'Natural rhythm, artistic resonance',
    },
    series: {
      ariaLabel: 'Featured collections on the home page',
      cta: 'View Collection',
      scrollHint: 'Scroll to view more collections',
    },
  },
  ja: {
    hero: {
      primary: {
        kicker: 'ファインジュエリーとビスポークデザイン',
        title: 'DERING',
      },
      paginationLabel: 'ホームヒーローカルーセル',
      goToSlideLabel: 'スライドへ',
      markKicker: 'やわらかく輝く',
      markSubtitle: '愛のためのビスポーク',
      markLine: '自然のリズム、芸術の響き',
    },
    series: {
      ariaLabel: 'ホームの注目コレクション',
      cta: 'コレクションを見る',
      scrollHint: 'スクロールしてさらに見る',
    },
  },
  th: {
    hero: {
      primary: {
        kicker: 'ไฟน์จิวเวลรี่และงานออกแบบสั่งทำ',
        title: 'DERING',
      },
      paginationLabel: 'สไลด์ภาพหน้าแรก',
      goToSlideLabel: 'ไปยังสไลด์',
      markKicker: 'เปล่งประกายอย่างนุ่มนวล',
      markSubtitle: 'ออกแบบเพื่อความรัก',
      markLine: 'จังหวะธรรมชาติ เสียงสะท้อนแห่งศิลปะ',
    },
    series: {
      ariaLabel: 'คอลเลกชันแนะนำบนหน้าแรก',
      cta: 'ดูคอลเลกชัน',
      scrollHint: 'เลื่อนเพื่อดูคอลเลกชันเพิ่มเติม',
    },
  },
  ko: {
    hero: {
      primary: {
        kicker: '파인 주얼리와 맞춤 디자인',
        title: 'DERING',
      },
      paginationLabel: '홈 히어로 캐러셀',
      goToSlideLabel: '슬라이드로 이동',
      markKicker: '부드럽게 빛나다',
      markSubtitle: '사랑을 위한 비스포크',
      markLine: '자연의 리듬, 예술의 울림',
    },
    series: {
      ariaLabel: '홈 주요 컬렉션',
      cta: '컬렉션 보기',
      scrollHint: '스크롤하여 더 많은 컬렉션 보기',
    },
  },
  vi: {
    hero: {
      primary: {
        kicker: 'Trang sức cao cấp và thiết kế riêng',
        title: 'DERING',
      },
      paginationLabel: 'Băng chuyền trang chủ',
      goToSlideLabel: 'Chuyển tới slide',
      markKicker: 'Tỏa sáng dịu dàng',
      markSubtitle: 'Thiết kế riêng cho tình yêu',
      markLine: 'Nhịp điệu tự nhiên, cộng hưởng nghệ thuật',
    },
    series: {
      ariaLabel: 'Bộ sưu tập nổi bật trên trang chủ',
      cta: 'Xem bộ sưu tập',
      scrollHint: 'Cuộn xuống để xem thêm bộ sưu tập',
    },
  },
}

const cleanSeriesCards = [
  {
    key: 'pink',
    kicker: {
      zh: '情定永恒',
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
    image: '/images/home/series/series1.png',
    alt: {
      zh: '粉钻系列',
      en: 'Pink diamond collection',
      ja: 'ピンクダイヤモンドコレクション',
      th: 'คอลเลกชันเพชรสีชมพู',
      ko: '핑크 다이아몬드 컬렉션',
      vi: 'Bo suu tap kim cuong hong',
    },
    ariaLabel: {
      zh: '查看粉钻系列',
      en: 'View pink diamond collection',
      ja: 'ピンクダイヤモンドを見る',
      th: 'ดูคอลเลกชันเพชรสีชมพู',
      ko: '핑크 다이아몬드 컬렉션 보기',
      vi: 'Xem bo suu tap kim cuong hong',
    },
    to: { name: 'series', params: { slug: 'pink' } },
  },
  {
    key: 'prong',
    imageSide: 'right',
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
    image: '/images/home/series/series2.png',
    alt: {
      zh: '四爪六爪系列',
      en: 'Four-prong and six-prong collection',
      ja: '4本爪と6本爪のコレクション',
      th: 'คอลเลกชันสี่หนามและหกหนาม',
      ko: '4프롱 및 6프롱 컬렉션',
      vi: 'Bo suu tap bon chau va sau chau',
    },
    ariaLabel: {
      zh: '查看四爪和六爪系列',
      en: 'View four-prong and six-prong collections',
      ja: '4本爪と6本爪を見る',
      th: 'ดูคอลเลกชันสี่หนามและหกหนาม',
      ko: '4프롱 및 6프롱 컬렉션 보기',
      vi: 'Xem bo suu tap bon chau va sau chau',
    },
    to: { name: 'series', params: { slug: 'prong' } },
  },
  {
    key: 'marquise',
    kicker: {
      zh: '星隅私造',
      en: 'Marquise Cut',
      ja: 'マーキスカット',
      th: 'ทรงมาร์quise',
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
    image: '/images/home/series/series3.png',
    alt: {
      zh: '马眼系列',
      en: 'Marquise collection',
      ja: 'マーキスコレクション',
      th: 'คอลเลกชัน Marquise',
      ko: '마퀴즈 컬렉션',
      vi: 'Bo suu tap marquise',
    },
    ariaLabel: {
      zh: '查看马眼系列',
      en: 'View marquise collection',
      ja: 'マーキスコレクションを見る',
      th: 'ดูคอลเลกชัน Marquise',
      ko: '마퀴즈 컬렉션 보기',
      vi: 'Xem bo suu tap marquise',
    },
    to: { name: 'series', params: { slug: 'marquise' } },
  },
  {
    key: 'banquet',
    imageSide: 'right',
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
    image: '/images/home/series/series4.png',
    alt: {
      zh: '鎏光宴叙・高奢宴会系列',
      en: 'Banquet high jewelry collection',
    },
    ariaLabel: {
      zh: '查看鎏光宴叙・高奢宴会系列',
      en: 'View banquet high jewelry collection',
    },
    to: { name: 'series', params: { slug: 'banquet' } },
  },
  {
    key: 'chroma',
    kicker: {
      zh: '幻彩艺藏',
      en: 'Chroma Art Collection',
    },
    title: {
      zh: '幻彩艺藏・彩钻限定系列',
      en: 'Chroma Art Colored Diamond Limited Collection',
    },
    text: {
      zh: '甄选珍稀彩钻，以艺术切割凝练幻彩光影，呈献限量典藏级珠宝单品。原创幻彩艺术手稿，以珍稀彩钻与灵动切割，塑造限量典藏款式。',
      en: 'Rare colored diamonds meet artistic cuts, shaping luminous limited-edition collectible jewels.',
    },
    image: '/images/home/series/series5.png',
    alt: {
      zh: '幻彩艺藏・彩钻限定系列',
      en: 'Chroma art colored diamond limited collection',
    },
    ariaLabel: {
      zh: '查看幻彩艺藏・彩钻限定系列',
      en: 'View chroma art colored diamond limited collection',
    },
    to: { name: 'series', params: { slug: 'chroma' } },
  },
]

const cleanHomeCopy = {
  zh: {
    hero: {
      primary: {
        kicker: '高级珠宝与定制设计',
        title: 'DERING',
      },
      paginationLabel: '首页大图轮播',
      goToSlideLabel: '切换到第',
      markKicker: '柔和绽放',
      markSubtitle: '为爱定制',
      markLine: '自然的韵律 艺术的共鸣',
    },
    series: {
      ariaLabel: '首页精选系列',
      cta: '查看系列',
      scrollHint: '下拉查看更多系列',
    },
  },
  en: {
    hero: {
      primary: {
        kicker: 'Fine Jewelry and Bespoke Design',
        title: 'DERING',
      },
      paginationLabel: 'Home hero carousel',
      goToSlideLabel: 'Go to slide',
      markKicker: 'Radiate Softly',
      markSubtitle: 'Bespoke for Love',
      markLine: 'Natural rhythm, artistic resonance',
    },
    series: {
      ariaLabel: 'Featured collections on the home page',
      cta: 'View Collection',
      scrollHint: 'Scroll to view more collections',
    },
  },
  ja: {
    hero: {
      primary: {
        kicker: 'ファインジュエリーとビスポークデザイン',
        title: 'DERING',
      },
      paginationLabel: 'ホームヒーローカルーセル',
      goToSlideLabel: 'スライドへ移動',
      markKicker: 'やわらかく輝く',
      markSubtitle: '愛のためのビスポーク',
      markLine: '自然のリズム、芸術の響き',
    },
    series: {
      ariaLabel: 'ホームの注目コレクション',
      cta: 'コレクションを見る',
      scrollHint: 'スクロールして他のシリーズを見る',
    },
  },
  th: {
    hero: {
      primary: {
        kicker: 'เครื่องประดับชั้นสูงและงานออกแบบเฉพาะคุณ',
        title: 'DERING',
      },
      paginationLabel: 'ภาพสไลด์หน้าแรก',
      goToSlideLabel: 'ไปยังสไลด์',
      markKicker: 'เปล่งประกายอย่างอ่อนโยน',
      markSubtitle: 'ออกแบบเพื่อความรัก',
      markLine: 'จังหวะแห่งธรรมชาติ เสียงสะท้อนแห่งศิลปะ',
    },
    series: {
      ariaLabel: 'คอลเลกชันแนะนำบนหน้าแรก',
      cta: 'ดูคอลเลกชัน',
      scrollHint: 'เลื่อนลงเพื่อดูซีรีส์เพิ่มเติม',
    },
  },
  ko: {
    hero: {
      primary: {
        kicker: '파인 주얼리와 비스포크 디자인',
        title: 'DERING',
      },
      paginationLabel: '홈 히어로 캐러셀',
      goToSlideLabel: '슬라이드로 이동',
      markKicker: '부드럽게 빛나다',
      markSubtitle: '사랑을 위한 맞춤 디자인',
      markLine: '자연의 리듬, 예술의 울림',
    },
    series: {
      ariaLabel: '홈 추천 컬렉션',
      cta: '컬렉션 보기',
      scrollHint: '아래로 스크롤해 더 많은 시리즈 보기',
    },
  },
  vi: {
    hero: {
      primary: {
        kicker: 'Trang suc cao cap va thiet ke rieng',
        title: 'DERING',
      },
      paginationLabel: 'Bang chuyen anh trang chu',
      goToSlideLabel: 'Chuyen den slide',
      markKicker: 'Toa sang diu dang',
      markSubtitle: 'Thiet ke rieng cho tinh yeu',
      markLine: 'Nhip dieu tu nhien, cong huong nghe thuat',
    },
    series: {
      ariaLabel: 'Bo suu tap noi bat tren trang chu',
      cta: 'Xem bo suu tap',
      scrollHint: 'Cuon xuong de xem them bo suu tap',
    },
  },
}

const pickLocaleValue = (values, activeLocale) => values?.[activeLocale] || values?.zh || ''

function heroSlideMark(slide) {
  if (slide.includes('background4')) {
    return {
      title: '垂钻流光，温柔自生',
      text: 'Bespoke For Love，专属定制钻石耳饰。',
      className: 'home-hero-mark--right',
      sentence: true,
      showRule: true,
    }
  }

  if (slide.includes('background3')) {
    return {
      title: '鎏金漾波光，钻光赴浪漫',
      text: '不同钻型，解锁日常与仪式感双重精致。',
      english: 'Water holds starlight, rings hold love',
      className: 'home-hero-mark--rings',
      englishOnly: true,
      sentence: true,
      showRule: false,
    }
  }

  if (slide.includes('background2')) {
    return {
      title: '循自然之序，琢时光之璨',
      text: '剥离冗余浮华，用细腻钻光，定格独属于你的仪式美学',
      className: '',
      sentence: true,
      showRule: true,
    }
  }

  return {
    kicker: 'RADIATE SOFTLY',
    title: 'BESPOKE FOR LOVE',
    text: '自然的韵律 艺术的共鸣',
    className: 'home-hero-mark--glass',
    sentence: false,
    showRule: true,
  }
}

const localizeSeriesCard = (card, activeLocale) => ({
  ...card,
  kicker: pickLocaleValue(card.kicker, activeLocale),
  title: pickLocaleValue(card.title, activeLocale),
  text: pickLocaleValue(card.text, activeLocale),
  alt: pickLocaleValue(card.alt, activeLocale),
  ariaLabel: pickLocaleValue(card.ariaLabel, activeLocale),
  to: {
    ...card.to,
    query: {
      ...(card.to.query || {}),
      entry: 'cover',
    },
  },
})

const copy = computed(() => {
  const activeLocale = cleanHomeCopy[locale.value] ? locale.value : 'zh'

  return {
    ...cleanHomeCopy[activeLocale],
    series: {
      ...cleanHomeCopy[activeLocale].series,
      cards: cleanSeriesCards.map((card) => localizeSeriesCard(card, activeLocale)),
    },
  }
})
</script>

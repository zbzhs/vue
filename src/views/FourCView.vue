<template>
  <section class="content-section fourc-content">
    <div class="fourc-heading">
      <p class="fourc-heading-en">{{ page.headingEn }}</p>
      <h1>{{ page.headingZh }}</h1>
    </div>

    <div class="fourc-feature">
      <div class="fourc-feature-copy">
        <p class="fourc-feature-kicker">{{ page.feature.kicker }}</p>
        <h2>{{ page.feature.title }}</h2>
        <p>{{ page.feature.text }}</p>
        <div class="fourc-feature-points">
          <span v-for="point in page.feature.points" :key="point">{{ point }}</span>
        </div>
      </div>
      <img class="fourc-feature-image" :src="page.feature.image" :alt="page.feature.alt" />
    </div>

    <div class="fourc-section-title">
      <p class="fourc-heading-en">{{ page.infoHeadingEn }}</p>
      <h2>{{ page.infoHeadingZh }}</h2>
    </div>

    <div class="fourc-grid">
      <article v-for="item in page.items" :key="item.title" :data-index="item.index">
        <img :src="item.image" :alt="item.alt" />
        <div class="fourc-card-copy">
          <span>{{ item.index }}</span>
          <p class="fourc-letter">{{ item.letter }}</p>
          <p v-if="item.kicker" class="fourc-card-kicker">{{ item.kicker }}</p>
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

const pagesByLocale = {
  zh: {
    headingEn: 'DIAMOND 4C GUIDE',
    headingZh: '4C标准解读',
    infoHeadingEn: '4C INFO',
    infoHeadingZh: '四项核心维度',
    feature: {
      kicker: '4C Overview',
      title: '理解钻石价值，不只看单个参数',
      text:
        '4C 是判断钻石品质的基础框架，但更重要的是把切工、颜色、净度和克拉重量放在同一个预算与佩戴场景中综合比较，形成更均衡的选择。',
      points: ['切工决定火彩', '颜色影响通透感', '净度关乎纯净观感', '克拉影响视觉存在感'],
      image: '/images/4c/4c-hero-generated.png',
      alt: '4C 标准培育钻珠宝主视觉图',
    },
    items: [
      {
        index: '01',
        letter: 'C',
        kicker: 'Light Performance',
        title: 'Cut 切工',
        text: '切工决定钻石如何反射光线，直接影响火彩、亮度和整体视觉表现。即使克拉数相同，切工优秀的钻石也往往更显灵动、更有层次。选购时可优先关注比例、对称性和抛光质量，它们通常比单纯追求更大尺寸更能提升佩戴效果。',
        image: '/images/4c/cut.png',
        alt: 'Cut 切工示意珠宝图',
      },
      {
        index: '02',
        letter: 'C',
        kicker: 'Color Grade',
        title: 'Color 颜色',
        text: '颜色等级越接近无色，视觉通透感通常越强，整体气质也会更清爽明亮。不过颜色并不是越高越适合，每个人的预算、肤色和金属材质搭配都会影响最终观感。日常佩戴时，可以在观感自然的前提下选择更均衡的等级，把预算留给更重要的切工表现。',
        image: '/images/4c/color.png',
        alt: 'Color 颜色示意珠宝图',
      },
      {
        index: '03',
        letter: 'C',
        kicker: 'Visual Purity',
        title: 'Clarity 净度',
        text: '净度用于描述天然内含物与表面特征，会影响钻石的纯净感与细节观感。实际选购时，不必一味追求纸面上的最高等级，更值得关注的是在正常佩戴距离下是否“肉眼干净”。如果杂质不易被看见，往往就已经能兼顾视觉效果与预算效率。',
        image: '/images/4c/Clarity.png',
        alt: 'Clarity 净度示意珠宝图',
      },
      {
        index: '04',
        letter: 'C',
        kicker: 'Presence & Scale',
        title: 'Carat 克拉',
        text: '克拉代表重量，也会直接影响钻石的视觉存在感和佩戴气场。但克拉并不等于真正显大，切工比例、台面直径以及镶嵌方式都会改变最终呈现。判断一颗钻石是否值得，应该把尺寸感、整体协调度和日常佩戴场景一起纳入考虑。',
        image: '/images/4c/Carat.png',
        alt: 'Carat 克拉示意珠宝图',
      },
    ],
  },
  en: {
    headingEn: 'DIAMOND 4C GUIDE',
    headingZh: 'The 4C Standard',
    infoHeadingEn: '4C INFO',
    infoHeadingZh: 'Four Core Dimensions',
    feature: {
      kicker: '4C Overview',
      title: 'A good diamond choice is never built on one number alone',
      text:
        'The 4C framework is the foundation of diamond evaluation, but the better approach is to weigh cut, color, clarity, and carat together within the same budget and wearing context.',
      points: ['Cut shapes brilliance', 'Color affects visual transparency', 'Clarity defines purity', 'Carat changes visual presence'],
      image: '/images/4c/4c-hero-generated.png',
      alt: 'Hero image of lab-grown diamond jewelry for the 4C guide',
    },
    items: [
      {
        index: '01',
        letter: 'C',
        kicker: 'Light Performance',
        title: 'Cut',
        text: 'Cut determines how a diamond reflects light and directly affects brilliance, brightness, and overall visual impact. Even at the same carat weight, a well-cut diamond usually looks livelier and more dimensional. In practice, proportions, symmetry, and polish quality often matter more to the final appearance than simply choosing a larger stone.',
        image: '/images/4c/cut.png',
        alt: 'Jewelry image illustrating cut',
      },
      {
        index: '02',
        letter: 'C',
        kicker: 'Color Grade',
        title: 'Color',
        text: 'The closer the grade is to colorless, the cleaner and brighter a diamond will usually appear. Still, the highest color grade is not always the smartest choice for every buyer. For daily wear, it is better to balance color with budget, skin tone, and metal setting so the diamond feels bright, natural, and well matched overall.',
        image: '/images/4c/color.png',
        alt: 'Jewelry image illustrating color',
      },
      {
        index: '03',
        letter: 'C',
        kicker: 'Visual Purity',
        title: 'Clarity',
        text: 'Clarity describes internal inclusions and surface characteristics, shaping how pure and clean a diamond appears up close. In real buying decisions, what matters most is whether those imperfections are visible to the naked eye rather than chasing the highest grade on paper. If a stone looks eye-clean in normal wear, it often delivers the best balance of appearance and value.',
        image: '/images/4c/Clarity.png',
        alt: 'Jewelry image illustrating clarity',
      },
      {
        index: '04',
        letter: 'C',
        kicker: 'Presence & Scale',
        title: 'Carat',
        text: 'Carat measures weight and strongly influences a diamond’s visual presence, but bigger does not automatically mean better looking. Cut proportions, face-up diameter, and even the setting style can change how large the stone appears once worn. A strong choice balances size, harmony, and everyday wearability instead of focusing on carat alone.',
        image: '/images/4c/Carat.png',
        alt: 'Jewelry image illustrating carat',
      },
    ],
  },
}

const page = computed(() => pagesByLocale[locale.value])
</script>

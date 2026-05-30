<template>
  <section class="page-hero guide-hero">
    <div>
      <p class="eyebrow">{{ page.kicker }}</p>
      <h1>{{ page.title }}</h1>
      <p>{{ page.summary }}</p>
    </div>
  </section>

  <section class="content-section process-page">
    <div class="process-intro">
      <p>{{ page.intro }}</p>
    </div>

    <div class="process-methods">
      <article v-for="method in page.methods" :key="method.title" class="process-card">
        <p class="process-label">{{ method.label }}</p>
        <h2>{{ method.title }}</h2>
        <p>{{ method.principle }}</p>
        <h3>{{ copy.processFlow }}</h3>
        <ol>
          <li v-for="step in method.steps" :key="step">{{ step }}</li>
        </ol>
        <h3>{{ copy.processFeatures }}</h3>
        <p>{{ method.features }}</p>
      </article>
    </div>

    <div class="process-section">
      <div class="section-heading compact">
        <p class="eyebrow dark">{{ copy.comparisonKicker }}</p>
        <h2>{{ page.comparisonTitle }}</h2>
      </div>
      <div class="process-grid">
        <article v-for="item in page.comparison" :key="item.title">
          <span>{{ item.index }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </div>

    <div class="process-section split">
      <article>
        <h2>{{ page.market.title }}</h2>
        <p>{{ page.market.text }}</p>
      </article>
      <article>
        <h2>{{ page.conclusion.title }}</h2>
        <p>{{ page.conclusion.text }}</p>
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

const copy = computed(() =>
  locale.value === 'en'
    ? {
        processFlow: 'Process',
        processFeatures: 'Features',
        comparisonKicker: 'Comparison',
      }
    : {
        processFlow: '流程',
        processFeatures: '特点',
        comparisonKicker: 'Comparison',
      },
)

const pagesByLocale = {
  zh: {
    kicker: 'Process',
    title: '生产工艺',
    summary: '了解培育钻石从晶种生长到切割抛光的主要工艺路径。',
    intro:
      '培育钻石是通过人工模拟天然钻石的形成环境，在实验室中合成的纯碳晶体。其物理、化学和光学性质与天然钻石基本一致，核心区别在于形成过程。目前主流生产工艺分为高温高压法（HPHT）和化学气相沉积法（CVD）两大类。',
    methods: [
      {
        label: 'HPHT',
        title: '高温高压法',
        principle:
          '在六面顶压机内模拟地球地幔的高温高压环境，通常约 1300-1600℃、5-6 GPa，以高纯石墨为碳源，并加入铁、镍、钴等金属触媒，使碳原子在钻石晶种表面结晶成金刚石。',
        steps: [
          '原料制备：将高纯石墨粉、金属触媒和钻石晶种组合成适合反应的结构。',
          '高压高温生长：在反应舱内施加极端压力与温度，使碳原子向晶种迁移并结晶。',
          '取出与提纯：缓慢降压降温后取出合成块，通过电解或化学方法去除金属触媒残留。',
          '切割抛光：获得毛坯后进行切磨与抛光，形成可用于镶嵌的成品钻石。',
        ],
        features:
          'HPHT 生长速度较快，适合 1-5 克拉产品的批量生产，较容易产出 D-F 色级无色钻；但晶体尺寸受反应舱容积限制，大克拉合成难度较高，也可能出现金属内含物影响净度。',
      },
      {
        label: 'CVD',
        title: '化学气相沉积法',
        principle:
          '在真空反应腔内，通过微波等离子体激发甲烷与氢气混合气体，使碳原子以气相沉积的方式逐层堆积在钻石晶种表面，最终形成钻石晶体。',
        steps: [
          '晶种预处理：选用高纯度钻石薄片，并通过抛光去除表面杂质。',
          '气相生长：在约 800-1000℃、低压真空环境下，让碳原子沉积到晶种表面。',
          '后处理：停止能量与气体输入，冷却后去除表面非金刚石碳层。',
          '切割抛光：得到纯净毛坯后进行切磨，达到珠宝级使用要求。',
        ],
        features:
          'CVD 无需金属触媒，晶体纯净度较高，常见 Type IIa 型品质，可用于大克拉培育钻石，颜色可控性强，适合高端珠宝与部分工业应用。',
      },
    ],
    comparisonTitle: '工艺对比与发展趋势',
    comparison: [
      { index: '01', title: 'HPHT优势', text: '成本相对低、生长速度快，适合小克拉批量生产，颜色等级表现较稳定。' },
      { index: '02', title: 'CVD优势', text: '纯净度高，可合成较大克拉钻石，颜色控制灵活，且没有金属触媒残留。' },
      { index: '03', title: '复合工艺', text: '部分企业会采用 CVD 生长结合 HPHT 后处理，以改善颜色等级和整体视觉表现。' },
      { index: '04', title: '发展方向', text: '行业持续向大尺寸化、高品质化和低成本化发展，设备大型化与自动化会进一步推动产能提升。' },
    ],
    market: {
      title: '应用与市场',
      text: '培育钻石不仅用于珠宝首饰，也可用于半导体、光学窗口等工业领域。中国在 HPHT 和 CVD 技术上均具备较强产业基础，河南等地已形成重要的培育钻石生产集群。',
    },
    conclusion: {
      title: '总结',
      text: '培育钻石生产的核心，是模拟或替代天然钻石形成所需的条件。HPHT 与 CVD 各有侧重，未来会继续向更大尺寸、更高品质和更低成本方向发展。',
    },
  },
  en: {
    kicker: 'Process',
    title: 'Production Process',
    summary: 'See how lab-grown diamonds move from seed growth to cutting and polishing.',
    intro:
      'Lab-grown diamonds are pure carbon crystals created in laboratories by recreating the conditions in which natural diamonds form. Their physical, chemical, and optical properties closely match natural diamonds. The main difference lies in the growth process. Today, the two dominant production routes are HPHT and CVD.',
    methods: [
      {
        label: 'HPHT',
        title: 'High Pressure High Temperature',
        principle:
          'HPHT recreates the high-temperature and high-pressure conditions of the earth s mantle inside a cubic press, typically around 1300-1600°C and 5-6 GPa. High-purity graphite acts as the carbon source, while metal catalysts such as iron, nickel, and cobalt help carbon atoms crystallize on a diamond seed.',
        steps: [
          'Material preparation: combine graphite powder, metal catalyst, and diamond seed in a growth-ready structure.',
          'High-pressure growth: apply extreme pressure and temperature to drive carbon atoms toward the seed and crystallize them.',
          'Extraction and purification: slowly cool and depressurize, then remove residual catalyst through electrolysis or chemical treatment.',
          'Cutting and polishing: finish the rough crystal into a jewelry-ready diamond.',
        ],
        features:
          'HPHT grows relatively fast and suits batch production in the 1 to 5 carat range. It often performs well for near-colorless D to F grades, but chamber size limits larger stones and metallic inclusions may affect clarity.',
      },
      {
        label: 'CVD',
        title: 'Chemical Vapor Deposition',
        principle:
          'CVD grows diamond in a vacuum chamber where microwave plasma energizes a methane-hydrogen gas mixture. Carbon atoms then deposit layer by layer on the diamond seed until a crystal is formed.',
        steps: [
          'Seed preparation: select high-purity diamond plates and polish away surface impurities.',
          'Vapor growth: under low-pressure vacuum and roughly 800-1000°C, carbon atoms deposit on the seed surface.',
          'Post treatment: stop the energy and gas flow, cool the crystal, and remove non-diamond carbon from the surface.',
          'Cutting and polishing: process the rough into a clean, jewelry-grade stone.',
        ],
        features:
          'CVD does not rely on metal catalysts, so crystal purity is typically high. It often reaches Type IIa quality, works well for larger stones, offers strong color control, and suits both high-end jewelry and selected industrial uses.',
      },
    ],
    comparisonTitle: 'Process Comparison and Industry Direction',
    comparison: [
      { index: '01', title: 'HPHT Strengths', text: 'Lower relative cost and faster growth make it suitable for small-carat batch production with stable color performance.' },
      { index: '02', title: 'CVD Strengths', text: 'Higher purity, better scalability for larger stones, flexible color control, and no residual metal catalyst.' },
      { index: '03', title: 'Hybrid Routes', text: 'Some producers combine CVD growth with HPHT post-treatment to improve color and overall visual performance.' },
      { index: '04', title: 'Future Direction', text: 'The industry continues toward larger sizes, higher quality, and lower cost, supported by bigger equipment and more automation.' },
    ],
    market: {
      title: 'Applications and Market',
      text: 'Lab-grown diamonds are used not only in jewelry but also in semiconductors, optical windows, and other industrial fields. China has built strong HPHT and CVD capabilities, with places such as Henan forming major production clusters.',
    },
    conclusion: {
      title: 'Conclusion',
      text: 'The essence of lab-grown diamond production is to recreate or replace the conditions needed for natural diamond formation. HPHT and CVD each have their own strengths, and both will continue moving toward larger size, better quality, and lower production cost.',
    },
  },
}

const page = computed(() => pagesByLocale[locale.value])
</script>

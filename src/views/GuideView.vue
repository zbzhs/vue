<template>
  <section v-if="!page.hideHero" :class="['page-hero', page.textHero ? `text-hero ${page.heroClass}` : 'guide-hero']">
    <div>
      <p class="eyebrow">{{ page.kicker }}</p>
      <h1>{{ page.title }}</h1>
      <p>{{ page.summary }}</p>
    </div>
  </section>

  <section v-if="page.type === 'process'" class="content-section process-page">
    <div class="process-intro">
      <p>
        培育钻石是通过人工模拟天然钻石的形成环境，在实验室中合成的纯碳晶体。
        其物理、化学和光学性质与天然钻石基本一致，核心区别在于形成过程。
        目前主流生产工艺分为高温高压法（HPHT）和化学气相沉积法（CVD）两大类。
      </p>
    </div>

    <div class="process-methods">
      <article v-for="method in page.methods" :key="method.title" class="process-card">
        <p class="process-label">{{ method.label }}</p>
        <h2>{{ method.title }}</h2>
        <p>{{ method.principle }}</p>
        <h3>流程</h3>
        <ol>
          <li v-for="step in method.steps" :key="step">{{ step }}</li>
        </ol>
        <h3>特点</h3>
        <p>{{ method.features }}</p>
      </article>
    </div>

    <div class="process-section">
      <div class="section-heading compact">
        <p class="eyebrow dark">Comparison</p>
        <h2>工艺对比与发展趋势</h2>
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
        <h2>应用与市场</h2>
        <p>
          培育钻石不仅用于珠宝首饰，也可用于半导体、光学窗口等工业领域。
          中国在 HPHT 和 CVD 技术上均具备较强产业基础，河南等地已形成重要的培育钻石生产集群。
        </p>
      </article>
      <article>
        <h2>总结</h2>
        <p>
          培育钻石生产的核心，是模拟或替代天然钻石形成所需的条件。
          HPHT 与 CVD 各有侧重，未来会继续向更大尺寸、更高品质和更低成本方向发展。
        </p>
      </article>
    </div>
  </section>

  <section v-else-if="page.type === 'fourC'" class="content-section fourc-content">
    <div class="fourc-lede">
      <span>4C</span>
      <p>
        4C 是判断钻石品质的基础框架，但最终选择不只看单项参数。
        更理想的方式，是把切工、颜色、净度和克拉重量放在同一个预算与佩戴场景中综合比较。
      </p>
    </div>

    <div class="fourc-grid">
      <article v-for="item in page.items" :key="item.title" :data-index="item.index">
        <span>{{ item.index }}</span>
        <p class="fourc-letter">{{ item.letter }}</p>
        <h2>{{ item.title }}</h2>
        <p>{{ item.text }}</p>
      </article>
    </div>
  </section>

  <section v-else-if="page.type === 'advantages'" class="content-section advantages-content">
    <div class="advantages-showcase">
      <div class="advantages-statement">
        <p class="eyebrow dark">Service System</p>
        <h2>把体验拆成清晰、稳定、可追踪的服务环节。</h2>
        <p>从选材、设计沟通、制作标准到长期维护，每一步都服务于长期佩戴与收藏价值。</p>
      </div>
      <article v-for="item in page.items" :key="item.title" :data-index="item.index">
        <span>{{ item.index }}</span>
        <h2>{{ item.title }}</h2>
        <p>{{ item.text }}</p>
      </article>
    </div>
  </section>

  <section v-else-if="page.type === 'buyingGuide'" class="content-section buying-content">
    <div class="buying-copy">
      <aside class="buying-note">
        <p class="eyebrow dark">How to choose</p>
        <h2>先判断佩戴场景<br />再决定预算与细节</h2>
        <p>选购珠宝不必一开始纠结所有参数，把需求拆成三个问题会更清楚。</p>
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

    <figure class="buying-visual">
      <img src="/images/buying-guide-model.png" alt="模特佩戴珠宝手链" />
    </figure>
  </section>

  <section v-else-if="page.type === 'faq'" class="content-section faq-content">
    <div class="faq-title">
      <h1>{{ page.title }}</h1>
    </div>

    <div class="faq-accordion">
      <article v-for="item in page.items" :key="item.title" class="faq-item">
        <button type="button" class="faq-question" @click="toggleFaq(item.index)">
          <span>{{ item.title }}</span>
          <span class="faq-icon" :class="{ open: activeFaq === item.index }">+</span>
        </button>
        <div v-if="activeFaq === item.index" class="faq-answer">
          <p>{{ item.text }}</p>
        </div>
      </article>
    </div>
  </section>

  <section v-else class="content-section guide-content">
    <article v-for="item in page.items" :key="item.title">
      <span>{{ item.index }}</span>
      <div>
        <h2>{{ item.title }}</h2>
        <p>{{ item.text }}</p>
      </div>
    </article>
  </section>

  <footer class="home-footer guide-footer" aria-label="五维度页面跳转">
    <div class="home-footer-brand">DERING</div>
    <nav class="home-footer-links" aria-label="珠宝知识">
      <RouterLink to="/process">生产工艺</RouterLink>
      <RouterLink to="/4c">4C标准</RouterLink>
      <RouterLink to="/advantages">核心优势</RouterLink>
      <RouterLink to="/buying-guide">选购指南</RouterLink>
      <RouterLink to="/faq">常见问题</RouterLink>
    </nav>
  </footer>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeFaq = ref(null)

const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

const pages = {
  process: {
    type: 'process',
    kicker: 'Process',
    title: '生产工艺',
    summary: '了解培育钻石从晶种生长到切割抛光的主要工艺路径。',
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
    comparison: [
      { index: '01', title: 'HPHT优势', text: '成本相对低、生长速度快，适合小克拉批量生产，颜色等级表现较稳定。' },
      { index: '02', title: 'CVD优势', text: '纯净度高，可合成较大克拉钻石，颜色控制灵活，且没有金属触媒残留。' },
      { index: '03', title: '复合工艺', text: '部分企业会采用 CVD 生长结合 HPHT 后处理，以改善颜色等级和整体视觉表现。' },
      { index: '04', title: '发展方向', text: '行业持续向大尺寸化、高品质化和低成本化发展，设备大型化与自动化会进一步推动产能提升。' },
    ],
  },
  '4c': {
    type: 'fourC',
    textHero: true,
    heroClass: 'fourc-hero',
    kicker: 'Diamond 4C',
    title: '4C标准',
    summary: '用切工、颜色、净度和克拉重量理解钻石价值。',
    items: [
      { index: '01', letter: 'C', title: 'Cut 切工', text: '切工决定钻石如何反射光线，直接影响火彩、亮度和整体视觉表现。优先关注比例、对称性和抛光质量。' },
      { index: '02', letter: 'C', title: 'Color 颜色', text: '颜色等级越接近无色，视觉通透感通常越强。日常佩戴可结合预算和镶嵌材质选择合适等级。' },
      { index: '03', letter: 'C', title: 'Clarity 净度', text: '净度用于描述天然内含物与表面特征。选购时更应关注肉眼是否明显，而非只追求高等级。' },
      { index: '04', letter: 'C', title: 'Carat 克拉', text: '克拉代表重量，也影响视觉大小。它需要结合切工比例、台面直径和佩戴效果一起判断。' },
    ],
  },
  advantages: {
    type: 'advantages',
    textHero: true,
    heroClass: 'advantages-hero',
    kicker: 'Advantages',
    title: '核心优势',
    summary: '以设计、供应链与服务体验构成品牌长期价值。',
    items: [
      { index: '01', title: '精选材质', text: '严选贵金属、钻石和彩色宝石，兼顾品质与审美表达。' },
      { index: '02', title: '定制服务', text: '支持婚戒、纪念款和专属设计需求。' },
      { index: '03', title: '售后保障', text: '提供清洁保养、尺寸调整和佩戴建议。' },
    ],
  },
  buyingGuide: {
    type: 'buyingGuide',
    hideHero: true,
    textHero: true,
    heroClass: 'buying-hero',
    kicker: 'Guide',
    title: '选购指南',
    summary: '根据预算、场景和佩戴习惯选择更合适的珠宝。',
    items: [
      { index: '01', title: '确定场景', text: '日常佩戴、婚礼纪念和收藏礼赠对应不同设计重点。' },
      { index: '02', title: '确认预算', text: '先明确预算范围，再比较材质、主石和工艺配置。' },
      { index: '03', title: '试戴比较', text: '结合肤色、手型、脸型和穿搭风格判断最终效果。' },
    ],
  },
  faq: {
    type: 'faq',
    hideHero: true,
    textHero: true,
    heroClass: 'faq-hero',
    kicker: 'FAQ',
    title: '常见问题',
    summary: '整理购买、定制和售后中常见的关注点。',
    items: [
      { index: '01', title: '我该如何选择尺寸？', text: '建议先根据日常佩戴习惯确认松紧偏好，再测量手寸、腕围或项链长度。若用于礼赠，可以先选择常规尺寸，后续根据实际佩戴效果进行调整。' },
      { index: '02', title: '我的作品可以刻字吗？', text: '部分戒指、吊坠和纪念款支持刻字。可刻内容会受作品结构、材质厚度和可刻区域影响，确认订单前会由顾问协助核对。' },
      { index: '03', title: '我的作品可以调整尺寸吗？', text: '多数戒指和部分手链可提供尺寸调整服务，但密镶、特殊结构或异形设计可能不适合大幅调整。建议将作品带到门店或联系客服先做评估。' },
      { index: '04', title: '调整一件作品尺寸的费用是多少？', text: '费用会根据材质、调整幅度、工艺复杂度和是否需要补料而变化。常规保养范围内的服务可先咨询售后，定制或复杂调整会单独报价。' },
      { index: '05', title: '完成调整服务需要多长时间？', text: '常规尺寸调整通常需要根据门店排期与工坊工作量确认。若涉及补石、重新抛光或复杂结构修整，时间会相应延长。' },
      { index: '06', title: '如何查找我的产品说明书？', text: '可通过购买凭证、订单信息或作品编号联系客服查询。若作品附带证书或保养卡，请妥善保存，便于后续保养、调整和售后登记。' },
    ],
  },
}

const page = computed(() => pages[route.name] || pages.process)
</script>

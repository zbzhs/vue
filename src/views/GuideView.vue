<template>
  <section class="page-hero guide-hero">
    <div>
      <p class="eyebrow">{{ page.kicker }}</p>
      <h1>{{ page.title }}</h1>
      <p>{{ page.summary }}</p>
    </div>
  </section>

  <section class="content-section process-page">
    <div class="process-module-nav" role="tablist" :aria-label="copy.processNavLabel">
      <button
        type="button"
        class="process-module-trigger"
        :class="{ 'is-active': activeProcessPanel === 'methods' }"
        @mouseenter="activeProcessPanel = 'methods'"
        @focus="activeProcessPanel = 'methods'"
        @click="activeProcessPanel = 'methods'"
      >
        <span class="process-module-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path
              d="M12 3.5c2.2 0 4 1.8 4 4 0 1.8-1.2 3.4-2.9 3.9v2.1h4.6c1.3 0 2.3 1 2.3 2.3v2.7h-1.8v-2.3c0-.6-.4-1-1-1h-4.1v3.1h-1.8v-3.1H6.8c-.6 0-1 .4-1 1v2.3H4v-2.7c0-1.3 1-2.3 2.3-2.3h4.6v-2.1C9.2 10.9 8 9.3 8 7.5c0-2.2 1.8-4 4-4Zm0 1.8c-1.2 0-2.2 1-2.2 2.2s1 2.2 2.2 2.2 2.2-1 2.2-2.2-1-2.2-2.2-2.2Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span class="process-module-trigger-copy">
          <span class="process-module-trigger-index">01</span>
          <strong>{{ copy.methodModuleTitle }}</strong>
          <small>{{ copy.methodModuleText }}</small>
        </span>
      </button>

      <button
        type="button"
        class="process-module-trigger"
        :class="{ 'is-active': activeProcessPanel === 'comparison' }"
        @mouseenter="activeProcessPanel = 'comparison'"
        @focus="activeProcessPanel = 'comparison'"
        @click="activeProcessPanel = 'comparison'"
      >
        <span class="process-module-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path
              d="M4 18.5h16v1.8H4v-1.8Zm1.4-2.1 3.4-3.8 2.9 2.6 5.1-6 .1-.1H20v1.8h-2.3l-5.9 6.9-3-2.7-2.1 2.4-1.4-1.1Zm9.8-7.3V4h1.8v5.1h-1.8Zm-4.4 2V6.2h1.8v4.9h-1.8Zm-4.4 2.1V8.3h1.8v4.9H6.4Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span class="process-module-trigger-copy">
          <span class="process-module-trigger-index">02</span>
          <strong>{{ copy.comparisonModuleTitle }}</strong>
          <small>{{ copy.comparisonModuleText }}</small>
        </span>
      </button>

      <button
        type="button"
        class="process-module-trigger"
        :class="{ 'is-active': activeProcessPanel === 'vs' }"
        @mouseenter="activeProcessPanel = 'vs'"
        @focus="activeProcessPanel = 'vs'"
        @click="activeProcessPanel = 'vs'"
      >
        <span class="process-module-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path
              d="M7.2 4.5 10 10l2.9-5.5h2l-3.9 7.1v7.8h-1.9v-7.8L5.2 4.5h2Zm10.9 0c1 0 1.8.3 2.4.9s1 1.4 1 2.3c0 .7-.2 1.3-.5 1.8-.3.5-.8.9-1.4 1.1.8.2 1.4.6 1.8 1.2.4.6.7 1.3.7 2.1 0 1.1-.4 2-1.1 2.7-.7.7-1.7 1-2.9 1h-3.8V4.5h3.8Zm-.1 7.2h-1.8v4.2H18c.7 0 1.2-.2 1.6-.6.4-.4.6-.9.6-1.5s-.2-1.1-.6-1.5c-.4-.4-.9-.6-1.6-.6Zm-.1-5.4h-1.7V10H18c.6 0 1.1-.2 1.4-.5.3-.3.5-.8.5-1.3s-.2-1-.5-1.3c-.3-.3-.8-.5-1.5-.5Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span class="process-module-trigger-copy">
          <span class="process-module-trigger-index">03</span>
          <strong>{{ copy.vsModuleTitle }}</strong>
          <small>{{ copy.vsModuleText }}</small>
        </span>
      </button>
    </div>

    <Transition name="process-panel" mode="out-in">
      <div v-if="activeProcessPanel === 'methods'" key="methods" class="process-module-stage">
        <div class="process-intro">
          <p>{{ page.intro }}</p>
        </div>

        <div class="process-methods">
          <article v-for="method in page.methods" :key="method.title" class="process-card">
            <div class="process-card-head">
              <p class="process-label">{{ method.label }}</p>
              <h2>{{ method.title }}</h2>
            </div>
            <div class="process-card-body">
              <p>{{ method.principle }}</p>
              <h3>{{ copy.processFlow }}</h3>
              <ol>
                <li v-for="step in method.steps" :key="step">{{ step }}</li>
              </ol>
              <h3>{{ copy.processFeatures }}</h3>
              <p>{{ method.features }}</p>
            </div>
          </article>
        </div>
      </div>

      <div v-else-if="activeProcessPanel === 'comparison'" key="comparison" class="process-module-stage">
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
      </div>

      <div v-else key="vs" class="process-module-stage">
        <div class="process-intro">
          <p>{{ page.vsNatural.intro }}</p>
        </div>

        <div class="process-section">
          <div class="section-heading compact">
            <p class="eyebrow dark">{{ copy.vsKicker }}</p>
            <h2>{{ page.vsNatural.title }}</h2>
          </div>
          <div class="process-vs-columns">
            <article v-for="column in page.vsNatural.columns" :key="column.title" class="process-vs-column">
              <div class="process-vs-column-head">
                <span>{{ column.index }}</span>
                <h3>{{ column.title }}</h3>
              </div>
              <div class="process-vs-points">
                <section v-for="point in column.points" :key="point.title" class="process-vs-point">
                  <h4>{{ point.title }}</h4>
                  <p>{{ point.text }}</p>
                </section>
              </div>
            </article>
          </div>
        </div>

        <div class="process-section split">
          <article>
            <h2>{{ page.vsNatural.choice.title }}</h2>
            <p>{{ page.vsNatural.choice.text }}</p>
          </article>
          <article>
            <h2>{{ page.vsNatural.common.title }}</h2>
            <p>{{ page.vsNatural.common.text }}</p>
          </article>
        </div>
      </div>
    </Transition>
  </section>

  <KnowledgeFooter footer-class="home-footer guide-footer" />
</template>

<script setup>
import { computed, ref } from 'vue'

import KnowledgeFooter from '../components/KnowledgeFooter.vue'
import { useLocale } from '../composables/useLocale'

const { locale } = useLocale()
const activeProcessPanel = ref('methods')

const copy = computed(() =>
  locale.value === 'en'
    ? {
        processFlow: 'Process',
        processFeatures: 'Features',
        comparisonKicker: 'Comparison',
        vsKicker: 'VS',
        processNavLabel: 'Switch process modules',
        methodModuleTitle: 'Growth Methods',
        methodModuleText: 'HPHT and CVD fundamentals',
        comparisonModuleTitle: 'Comparison and Trends',
        comparisonModuleText: 'Process comparison and market direction',
        vsModuleTitle: 'Lab-Grown vs Natural',
        vsModuleText: 'Core differences and buying logic',
      }
    : {
        processFlow: '流程',
        processFeatures: '特点',
        comparisonKicker: '对比',
        vsKicker: '对照',
        processNavLabel: '切换生产工艺模块',
        methodModuleTitle: '生长方法',
        methodModuleText: '高温高压法与化学气相沉淀法',
        comparisonModuleTitle: '工艺对比与趋势',
        comparisonModuleText: '工艺差异、应用与行业发展',
        vsModuleTitle: '培育钻 VS 天然钻',
        vsModuleText: '核心差异与选购逻辑',
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
        title: '化学气相沉淀法',
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
      {
        index: '01',
        title: 'HPHT 优势',
        text: '成本相对低、生长速度快，适合小克拉批量生产，颜色等级表现较稳定。',
      },
      {
        index: '02',
        title: 'CVD 优势',
        text: '纯净度高，可合成较大克拉钻石，颜色控制灵活，且没有金属触媒残留。',
      },
      {
        index: '03',
        title: '复合工艺',
        text: '部分企业会采用 CVD 生长结合 HPHT 后处理，以改善颜色等级和整体视觉表现。',
      },
      {
        index: '04',
        title: '发展方向',
        text: '行业持续向大尺寸化、高品质化和低成本化发展，设备大型化与自动化会进一步推动产能提升。',
      },
    ],
    market: {
      title: '应用与市场',
      text: '培育钻石不仅用于珠宝首饰，也可用于半导体、光学窗口等工业领域。中国在 HPHT 和 CVD 技术上均具备较强产业基础，河南等地已形成重要的培育钻石生产集群。',
    },
    conclusion: {
      title: '总结',
      text: '培育钻石生产的核心，是模拟或替代天然钻石形成所需的条件。HPHT 与 CVD 各有侧重，未来会继续向更大尺寸、更高品质和更低成本方向发展。',
    },
    vsNatural: {
      title: '培育钻 VS 天然钻',
      intro:
        '培育钻与天然钻都属于真正的钻石，硬度、折射率、火彩表现和主要化学成分一致。消费者真正需要区分的，不是“是不是钻石”，而是来源路径、稀缺逻辑、预算分配和购买目的是否匹配。',
      columns: [
        {
          index: '01',
          title: '培育钻',
          points: [
            {
              title: '形成方式',
              text: '在实验室中以 HPHT 或 CVD 等可控条件完成生长，形成周期更短，供应节奏也更稳定。',
            },
            {
              title: '佩戴表现',
              text: '具备钻石应有的硬度、火彩和日常佩戴耐久性，在视觉与使用体验上能够满足珠宝级需求。',
            },
            {
              title: '价值特点',
              text: '更强调同等视觉和品质前提下的预算效率，通常可以在相同预算里获得更大的克拉数或更高的 4C 表现。',
            },
            {
              title: '适合人群',
              text: '更适合关注日常佩戴、款式更新、婚庆使用效率，以及希望在预算内提升整体品质表现的人群。',
            },
          ],
        },
        {
          index: '02',
          title: '天然钻',
          points: [
            {
              title: '形成方式',
              text: '形成于地球深部，并经过长期地质作用到达地表，形成路径更自然，也带有更强的稀缺叙事。',
            },
            {
              title: '佩戴表现',
              text: '同样具备钻石应有的硬度、光学表现与耐久性，在珠宝佩戴层面拥有稳定且成熟的认知基础。',
            },
            {
              title: '价值特点',
              text: '更强调天然来源、稀缺性与传统认知，在部分消费语境中也承载更强的收藏意味与情感象征。',
            },
            {
              title: '适合人群',
              text: '更适合在意天然属性、传统象征、收藏叙事，或对来源标签本身有明确偏好的人群。',
            },
          ],
        },
      ],
      choice: {
        title: '怎么选更合适',
        text: '先明确这件珠宝是用于婚庆纪念、日常佩戴、礼赠表达，还是预算内追求更大克拉和更高净度。场景越强调佩戴频率和综合性价比，培育钻越容易成为理性选择；场景越强调天然属性与情感象征，天然钻越容易成为偏好选择。',
      },
      common: {
        title: '共同判断标准',
        text: '无论选择培育钻还是天然钻，都建议回到 4C、证书、切工比例、镶嵌工艺与售后服务这些真正影响佩戴体验和品质透明度的标准，而不是只停留在单一来源标签上。',
      },
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
      {
        index: '01',
        title: 'HPHT Strengths',
        text: 'Lower relative cost and faster growth make it suitable for small-carat batch production with stable color performance.',
      },
      {
        index: '02',
        title: 'CVD Strengths',
        text: 'Higher purity, better scalability for larger stones, flexible color control, and no residual metal catalyst.',
      },
      {
        index: '03',
        title: 'Hybrid Routes',
        text: 'Some producers combine CVD growth with HPHT post-treatment to improve color and overall visual performance.',
      },
      {
        index: '04',
        title: 'Future Direction',
        text: 'The industry continues toward larger sizes, higher quality, and lower cost, supported by bigger equipment and more automation.',
      },
    ],
    market: {
      title: 'Applications and Market',
      text: 'Lab-grown diamonds are used not only in jewelry but also in semiconductors, optical windows, and other industrial fields. China has built strong HPHT and CVD capabilities, with places such as Henan forming major production clusters.',
    },
    conclusion: {
      title: 'Conclusion',
      text: 'The essence of lab-grown diamond production is to recreate or replace the conditions needed for natural diamond formation. HPHT and CVD each have their own strengths, and both will continue moving toward larger size, better quality, and lower production cost.',
    },
    vsNatural: {
      title: 'Lab-Grown vs Natural',
      intro:
        'Both lab-grown and natural diamonds are real diamonds. They share the same core chemical composition, hardness, sparkle, and everyday wearability. The practical distinction is not whether they are diamonds, but how they are formed, how value is framed, and what buying goal the customer has in mind.',
      columns: [
        {
          index: '01',
          title: 'Lab-Grown',
          points: [
            {
              title: 'Formation',
              text: 'Created in controlled environments through methods such as HPHT or CVD, with a shorter growth cycle and more stable supply rhythm.',
            },
            {
              title: 'Wear Performance',
              text: 'Offers the hardness, sparkle, and everyday durability expected of diamond, making it fully suitable for jewelry use.',
            },
            {
              title: 'Value Logic',
              text: 'Emphasizes stronger budget efficiency, often allowing larger size or higher 4C performance within the same spending range.',
            },
            {
              title: 'Best Fit',
              text: 'Well suited to customers who care about daily wear, design flexibility, wedding-use efficiency, and stronger overall specification within budget.',
            },
          ],
        },
        {
          index: '02',
          title: 'Natural',
          points: [
            {
              title: 'Formation',
              text: 'Formed deep within the earth and brought to the surface through geological processes, carrying a more natural origin story and scarcity narrative.',
            },
            {
              title: 'Wear Performance',
              text: 'Provides the same expected hardness, optical character, and durability, with a long-established perception in jewelry buying.',
            },
            {
              title: 'Value Logic',
              text: 'More closely tied to natural origin, rarity, and traditional perception, and in some cases also to collecting symbolism.',
            },
            {
              title: 'Best Fit',
              text: 'Better aligned with customers who strongly value natural origin, traditional symbolism, collecting narrative, or the source label itself.',
            },
          ],
        },
      ],
      choice: {
        title: 'How to Choose',
        text: 'Start from the role of the piece: is it for a wedding milestone, daily wear, gifting, or getting a larger or cleaner diamond within a set budget? The more the goal is frequent wear and value efficiency, the more convincing lab-grown becomes. The more the goal is natural origin and emotional symbolism, the more natural diamonds may fit.',
      },
      common: {
        title: 'Shared Evaluation Standards',
        text: 'Whichever route you choose, the real decision should still come back to 4C quality, certification, cut proportions, setting craftsmanship, and after-sales reliability instead of relying on source label alone.',
      },
    },
  },
}

const page = computed(() => pagesByLocale[locale.value] || pagesByLocale.zh)
</script>

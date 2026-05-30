<template>
  <div class="home-page">
    <section
      ref="heroStage"
      class="hero-stage"
      :class="{ 'is-switching': isSwitching }"
      @wheel.prevent="handleHeroWheel"
    >
      <div
        class="hero-track"
        :style="{ transform: `translateY(-${(currentPage - 1) * 100}%)` }"
      >
        <section class="hero hero-primary" :class="{ 'is-active': currentPage === 1 }">
          <div class="hero-shade"></div>
          <div class="hero-content">
            <p class="eyebrow">{{ copy.hero.primary.kicker }}</p>
            <h1>{{ copy.hero.primary.title }}</h1>
            <p class="hero-copy">
              {{ copy.hero.primary.summary }}
            </p>
            <RouterLink class="primary-link" to="/products">{{ copy.hero.primary.cta }}</RouterLink>
          </div>
        </section>

        <section class="hero hero-secondary" :class="{ 'is-active': currentPage === 2 }">
          <div class="hero-shade"></div>
          <div class="hero-content align-right">
            <p class="eyebrow">{{ copy.hero.secondary.kicker }}</p>
            <h2>{{ copy.hero.secondary.title }}</h2>
            <p class="hero-copy">
              {{ copy.hero.secondary.summary }}
            </p>
            <RouterLink class="secondary-link" to="/process">{{ copy.hero.secondary.cta }}</RouterLink>
          </div>
        </section>
      </div>

      <div class="page-dots" :aria-label="copy.hero.paginationLabel">
        <button
          type="button"
          :class="{ active: currentPage === 1 }"
          :aria-label="copy.hero.firstDotLabel"
          @click="goToPage(1)"
        ></button>
        <button
          type="button"
          :class="{ active: currentPage === 2 }"
          :aria-label="copy.hero.secondDotLabel"
          @click="goToPage(2)"
        ></button>
      </div>
    </section>

    <section class="home-section">
      <div class="section-heading">
        <p class="eyebrow dark">{{ copy.company.kicker }}</p>
        <h2>{{ copy.company.title }}</h2>
      </div>
      <div class="company-profile">
        <article v-for="item in copy.company.blocks" :key="item.title" class="company-block">
          <p class="company-card-eyebrow">{{ item.eyebrow }}</p>
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
          <p v-if="item.secondary" class="company-card-en">{{ item.secondary }}</p>
        </article>
      </div>
    </section>

    <KnowledgeFooter footer-class="home-footer" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

import KnowledgeFooter from '../components/KnowledgeFooter.vue'
import { useLocale } from '../composables/useLocale'

const { locale } = useLocale()

const homeCopy = {
  zh: {
    hero: {
      primary: {
        kicker: '高级珠宝与定制设计',
        title: '戴莉',
        summary: '以钻石、彩宝与贵金属工艺，呈现值得被珍藏的日常光芒。',
        cta: '浏览系列',
      },
      secondary: {
        kicker: 'Lab Grown Diamond',
        title: '关于培育钻',
        summary:
          '培育钻在实验室环境中生长形成，拥有与天然钻石一致的物理和化学特性，兼顾璀璨火彩、佩戴美感与更清晰透明的选择逻辑。',
        cta: '了解培育钻',
      },
      paginationLabel: '首页大屏切换',
      firstDotLabel: '切换到第 1 屏',
      secondDotLabel: '切换到第 2 屏',
    },
    company: {
      kicker: 'Company Profile',
      title: '公司介绍',
      blocks: [
        {
          eyebrow: 'Brand Introduction',
          title: 'DERING 品牌介绍',
          body:
            '品牌名称：DERING（中文：戴莉）。DERING 是港福珠宝旗下专注高品质培育钻石的供应链品牌，依托港福珠宝深耕珠宝行业多年的成熟生产体系、强大供应链整合能力与严苛品控标准，以“让钻石回归价值本身”为理念，坚持高标准钻石品质、稳定现货供应与高性价比定价，为全国零售品牌、电商渠道、直播机构、线下批发商提供一站式培育钻石供货解决方案。',
          secondary:
            "DERING is a supply-chain brand under Gangfu Jewelry focused on high-quality lab-grown diamonds. Backed by Gangfu Jewelry's mature manufacturing system, strong supply-chain integration, and rigorous quality control, DERING is guided by the belief of bringing diamonds back to their intrinsic value, offering premium quality, stable ready stock, and competitive pricing for retail brands, e-commerce channels, live-streaming studios, and offline wholesalers across China.",
        },
        {
          eyebrow: 'Products & Quality',
          title: '设计核心与主营品类',
          body:
            '品牌以“简约高级、日常可戴、婚庆 + 悦己双场景”为设计核心，主营培育钻石戒指、项链、耳钉、手链全品类成品。所有产品均采用高品质 CVD/HPHT 培育钻石，搭配 18K 金、Pt950 铂金、S925 银精工镶嵌，全系支持 IGI/NGTC 双证认证，品质透明、溯源可查、售后稳定。',
          secondary:
            'Centered on a design language that is minimal yet elevated, easy for daily wear, and suitable for both wedding celebrations and self-reward moments, DERING offers a full range of finished lab-grown diamond jewelry including rings, necklaces, earrings, and bracelets. Every piece uses high-quality CVD/HPHT lab-grown diamonds paired with fine 18K gold, Pt950 platinum, or S925 silver settings, with IGI and NGTC dual certification support for transparent quality, traceable sourcing, and reliable after-sales service.',
        },
        {
          eyebrow: 'Supply & Cooperation',
          title: '合作能力与长期服务',
          body:
            '依托港福珠宝供应链优势，DERING 具备快速现货反应、柔性定制、大货产能、贴牌代工等多元合作能力，可满足批发、定制、直播、贴牌等多渠道需求。未来，DERING 将持续以专业、稳定、高效的服务，成为客户长期信赖的培育钻石合作伙伴。',
          secondary:
            "Supported by Gangfu Jewelry's supply-chain strengths, DERING provides diversified cooperation capabilities including fast ready-stock response, flexible customization, large-volume production, and private-label OEM services, meeting the needs of wholesale, custom projects, livestream sales, and branding partnerships across multiple channels. Looking ahead, DERING will continue to serve as a professional, stable, and efficient long-term lab-grown diamond partner trusted by its clients.",
        },
      ],
    },
  },
  en: {
    hero: {
      primary: {
        kicker: 'Fine Jewelry and Bespoke Design',
        title: 'DERING',
        summary:
          'We shape diamonds, gemstones, and precious metals into jewelry meant to bring lasting brilliance to everyday life.',
        cta: 'View Collections',
      },
      secondary: {
        kicker: 'Lab Grown Diamond',
        title: 'About Lab Diamonds',
        summary:
          'Lab-grown diamonds are created in controlled environments and share the same physical and chemical properties as natural diamonds, combining brilliant sparkle, elegant wearability, and a clearer value proposition.',
        cta: 'Explore the Process',
      },
      paginationLabel: 'Home hero pagination',
      firstDotLabel: 'Go to slide 1',
      secondDotLabel: 'Go to slide 2',
    },
    company: {
      kicker: 'Company Profile',
      title: 'About DERING',
      blocks: [
        {
          eyebrow: 'Brand Introduction',
          title: 'DERING at a Glance',
          body:
            "DERING is a supply-chain jewelry brand under Gangfu Jewelry dedicated to high-quality lab-grown diamonds. With years of manufacturing experience, deep supply-chain integration, and strict quality control, the brand follows one clear principle: let diamonds return to their true value.",
        },
        {
          eyebrow: 'Products & Quality',
          title: 'Design Direction and Core Categories',
          body:
            'Our collections balance minimal elegance, daily wearability, and both wedding and self-reward scenarios. The catalog spans rings, necklaces, earrings, and bracelets crafted with premium CVD/HPHT lab-grown diamonds, paired with 18K gold, Pt950 platinum, and S925 silver settings.',
        },
        {
          eyebrow: 'Supply & Cooperation',
          title: 'Flexible Supply and Long-Term Service',
          body:
            'DERING supports ready-stock fulfillment, flexible customization, volume production, and private-label manufacturing for wholesale, livestream, retail, and branded collaboration channels. The goal is stable, professional, and efficient long-term partnership.',
        },
      ],
    },
  },
}

const copy = computed(() => homeCopy[locale.value])

const heroStage = ref(null)
const currentPage = ref(1)
const isSwitching = ref(false)
let switchTimer

function goToPage(page) {
  if (page === currentPage.value || isSwitching.value) {
    return
  }

  window.scrollTo({ top: 0, behavior: 'auto' })
  currentPage.value = page
  isSwitching.value = true
  window.clearTimeout(switchTimer)
  switchTimer = window.setTimeout(() => {
    isSwitching.value = false
  }, 1000)
}

function handleHeroWheel(event) {
  if (!heroStage.value || Math.abs(event.deltaY) < 8) {
    return
  }

  const direction = event.deltaY > 0 ? 1 : -1

  if (currentPage.value === 1 && direction > 0) {
    goToPage(2)
    return
  }

  if (currentPage.value === 2 && direction > 0 && !isSwitching.value) {
    window.scrollTo({
      top: heroStage.value.offsetHeight,
      behavior: 'smooth',
    })
    return
  }

  if (currentPage.value === 2 && direction < 0 && window.scrollY <= 2) {
    goToPage(1)
  }
}
</script>

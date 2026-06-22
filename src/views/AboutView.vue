<template>
  <main class="about-page">
    <section class="page-hero about-hero"></section>

    <section class="content-section about-company-section">
      <div class="section-heading company-video-heading">
        <p class="eyebrow dark">{{ copy.company.videoKicker }}</p>
        <h2>{{ copy.company.videoTitle }}</h2>
      </div>
      <figure class="company-video-frame">
        <video
          src="/video/dering-brand-film.mp4"
          controls
          muted
          playsinline
          preload="metadata"
          :aria-label="copy.company.videoLabel"
        ></video>
      </figure>

      <div class="section-heading">
        <h2>{{ copy.company.title }}</h2>
      </div>
      <div class="company-profile">
        <article v-for="item in copy.company.blocks" :key="item.title" class="company-block">
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
        </article>
      </div>
    </section>

    <KnowledgeFooter footer-class="product-page-footer" />
  </main>
</template>

<script setup>
import { computed } from 'vue'

import KnowledgeFooter from '../components/KnowledgeFooter.vue'
import { useLocale } from '../composables/useLocale'

const { locale } = useLocale()

const aboutCopy = {
  zh: {
    hero: {
      kicker: 'About DERING',
      title: '关于我们',
      summary:
        'DERING 是港福珠宝旗下专注高品质培育钻石的供应链品牌，提供稳定现货、柔性定制与一站式培育钻石供货解决方案。',
    },
    company: {
      kicker: 'Company Profile',
      title: '公司介绍',
      videoKicker: 'Brand Concept Film',
      videoTitle: '品牌概念宣传片',
      videoLabel: 'DERING 品牌视频',
      blocks: [
        {
          eyebrow: 'Brand Introduction',
          title: 'DERING 品牌介绍',
          body:
            '品牌名称：DERING（中文：戴莉）。DERING 是港福珠宝旗下专注高品质培育钻石的供应链品牌，依托港福珠宝深耕珠宝行业多年的成熟生产体系、强大供应链整合能力与严苛品控标准，以“让钻石回归价值本身”为理念，坚持高标准钻石品质、稳定现货供应与高性价比定价，为全国零售品牌、电商渠道、直播机构、线下批发商提供一站式培育钻石供货解决方案。品牌围绕成品开发、裸石筛选、工艺镶嵌、质检交付等环节建立完整服务链路，帮助合作客户降低选品与备货成本，提升上新效率与终端成交表现，让高品质培育钻石以更稳定、更透明、更具竞争力的方式进入市场。',
          secondary:
            "DERING is a supply-chain brand under Gangfu Jewelry focused on high-quality lab-grown diamonds. Backed by Gangfu Jewelry's mature manufacturing system, strong supply-chain integration, and rigorous quality control, DERING is guided by the belief of bringing diamonds back to their intrinsic value, offering premium quality, stable ready stock, and competitive pricing for retail brands, e-commerce channels, live-streaming studios, and offline wholesalers across China.",
        },
        {
          eyebrow: 'Products & Quality',
          title: '设计核心与主营品类',
          body:
            '品牌以“简约高级、日常可戴、婚庆 + 悦己双场景”为设计核心，主营培育钻石戒指、项链、耳钉、手链全品类成品。所有产品均采用高品质 CVD/HPHT 培育钻石，搭配 18K 金、Pt950 铂金、S925 银精工镶嵌，全系支持 IGI/NGTC 双证认证，品质透明、溯源可查、售后稳定。在款式规划上，DERING 兼顾经典畅销款与季节性新品，覆盖日常通勤、礼赠表达、婚嫁订制和直播爆款等多类销售场景，并持续根据市场反馈优化版型、钻石参数、金重配置和价格梯度，帮助客户形成更清晰的产品矩阵。',
          secondary:
            'Centered on a design language that is minimal yet elevated, easy for daily wear, and suitable for both wedding celebrations and self-reward moments, DERING offers a full range of finished lab-grown diamond jewelry including rings, necklaces, earrings, and bracelets. Every piece uses high-quality CVD/HPHT lab-grown diamonds paired with fine 18K gold, Pt950 platinum, or S925 silver settings, with IGI and NGTC dual certification support for transparent quality, traceable sourcing, and reliable after-sales service.',
        },
        {
          eyebrow: 'Supply & Cooperation',
          title: '合作能力与长期服务',
          body:
            '依托港福珠宝供应链优势，DERING 具备快速现货反应、柔性定制、大货产能、贴牌代工等多元合作能力，可满足批发、定制、直播、贴牌等多渠道需求。团队可围绕客户定位提供选品建议、货盘组合、参数匹配、交期协调与售后支持，适配门店零售、电商上架、直播间组货、品牌联名及项目制采购等不同合作模式。未来，DERING 将持续以专业、稳定、高效的服务，成为客户长期信赖的培育钻石合作伙伴。',
          secondary:
            "Supported by Gangfu Jewelry's supply-chain strengths, DERING provides diversified cooperation capabilities including fast ready-stock response, flexible customization, large-volume production, and private-label OEM services, meeting the needs of wholesale, custom projects, livestream sales, and branding partnerships across multiple channels. Looking ahead, DERING will continue to serve as a professional, stable, and efficient long-term lab-grown diamond partner trusted by its clients.",
        },
      ],
    },
  },
  en: {
    hero: {
      kicker: 'About DERING',
      title: 'Company Profile',
      summary:
        'DERING is a supply-chain jewelry brand under Gangfu Jewelry focused on high-quality lab-grown diamonds, stable ready stock, flexible customization, and one-stop supply solutions.',
    },
    company: {
      kicker: 'Company Profile',
      title: 'About DERING',
      videoKicker: 'Brand Film',
      videoTitle: 'Brand Concept Film',
      videoLabel: 'DERING brand video',
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

const copy = computed(() => aboutCopy[locale.value])
</script>

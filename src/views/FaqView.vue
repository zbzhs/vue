<template>
  <section class="content-section faq-content">
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

  <KnowledgeFooter footer-class="home-footer guide-footer" />
</template>

<script setup>
import { computed, ref } from 'vue'

import KnowledgeFooter from '../components/KnowledgeFooter.vue'
import { useLocale } from '../composables/useLocale'

const { locale } = useLocale()
const activeFaq = ref(null)

function toggleFaq(index) {
  activeFaq.value = activeFaq.value === index ? null : index
}

const pagesByLocale = {
  zh: {
    title: '常见问题',
    items: [
      { index: '01', title: '我该如何选择尺寸？', text: '建议先根据日常佩戴习惯确认松紧偏好，再测量手寸、腕围或项链长度。若用于礼赠，可以先选择常规尺寸，后续根据实际佩戴效果进行调整。' },
      { index: '02', title: '我的作品可以刻字吗？', text: '部分戒指、吊坠和纪念款支持刻字。可刻内容会受作品结构、材质厚度和可刻区域影响，确认订单前会由顾问协助核对。' },
      { index: '03', title: '我的作品可以调整尺寸吗？', text: '多数戒指和部分手链可提供尺寸调整服务，但密镶、特殊结构或异形设计可能不适合大幅调整。建议将作品带到门店或联系客服先做评估。' },
      { index: '04', title: '调整一件作品尺寸的费用是多少？', text: '费用会根据材质、调整幅度、工艺复杂度和是否需要补料而变化。常规保养范围内的服务可先咨询售后，定制或复杂调整会单独报价。' },
      { index: '05', title: '完成调整服务需要多长时间？', text: '常规尺寸调整通常需要根据门店排期与工坊工作量确认。若涉及补石、重新抛光或复杂结构修整，时间会相应延长。' },
      { index: '06', title: '如何查找我的产品说明书？', text: '可通过购买凭证、订单信息或作品编号联系客服查询。若作品附带证书或保养卡，请妥善保存，便于后续保养、调整和售后登记。' },
    ],
  },
  en: {
    title: 'Frequently Asked Questions',
    items: [
      { index: '01', title: 'How do I choose the right size?', text: 'Start with your preferred fit, then measure ring size, wrist circumference, or necklace length. If the piece is a gift, begin with a standard size and adjust later based on the actual fit.' },
      { index: '02', title: 'Can my piece be engraved?', text: 'Selected rings, pendants, and commemorative designs can be engraved. The final engraving range depends on the structure, material thickness, and available surface area, and our consultants will confirm it before the order is finalized.' },
      { index: '03', title: 'Can my piece be resized?', text: 'Most rings and some bracelets can be resized, but heavy pavé settings, special structures, or irregular designs may not support large adjustments. It is best to bring the piece in or contact us for evaluation first.' },
      { index: '04', title: 'How much does resizing cost?', text: 'Pricing depends on the material, adjustment range, production complexity, and whether extra material is needed. Routine after-sales requests can be reviewed first, while custom or complex work is quoted separately.' },
      { index: '05', title: 'How long does resizing take?', text: 'Standard size adjustments are scheduled according to store and workshop capacity. If the work involves replacing stones, repolishing, or structural repair, the timeline will be longer.' },
      { index: '06', title: 'How can I find my product documentation?', text: 'You can contact us with your proof of purchase, order information, or piece number. If your item includes a certificate or care card, keep it safely for future maintenance, resizing, and after-sales registration.' },
    ],
  },
}

const page = computed(() => pagesByLocale[locale.value])
</script>

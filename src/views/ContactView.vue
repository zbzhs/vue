<template>
  <div class="contact-page">
    <section class="page-hero text-hero contact-showcase">
      <div class="contact-hero-inner">
        <p class="contact-brand">DERING</p>
        <h1>{{ copy.title }}</h1>
        <div class="contact-divider" aria-hidden="true">
          <span></span>
          <i></i>
          <span></span>
        </div>
      </div>
    </section>

    <section class="content-section contact-experience">
      <div class="contact-action-grid">
        <article class="contact-action-card hotline-card">
          <div class="contact-action-head">
            <h2>{{ copy.phone.title }}</h2>
          </div>
          <div class="contact-action-body">
            <strong class="contact-action-detail">13715011967</strong>
            <p>{{ copy.phone.body }}</p>
          </div>
        </article>

        <article class="contact-action-card consult-card">
          <div class="contact-action-head">
            <h2>{{ copy.consult.title }}</h2>
          </div>
          <div class="contact-action-body">
            <div class="contact-chat-mark" aria-hidden="true">
              <span></span>
              <span></span>
            </div>
            <p>{{ copy.consult.body }}</p>
          </div>
        </article>
      </div>

      <div class="contact-channel-grid">
        <article class="contact-channel-card">
          <h3>{{ copy.wechat.title }}</h3>
          <img
            class="contact-channel-image"
            src="/images/contact/wechat.jpg"
            :alt="copy.wechat.alt"
          />
          <p>{{ copy.wechat.body }}</p>
        </article>

        <article class="contact-channel-card">
          <h3>{{ copy.email.title }}</h3>
          <img class="contact-channel-image" src="/images/contact/qq.jpg" :alt="copy.email.alt" />
          <p>37261784qq.com</p>
        </article>

        <article class="contact-channel-card">
          <h3>{{ copy.store.title }}</h3>
          <div class="contact-channel-code">STORE</div>
          <p>{{ copy.store.body }}</p>
        </article>
      </div>
    </section>

    <KnowledgeFooter footer-class="home-footer product-page-footer contact-page-footer" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

import KnowledgeFooter from '../components/KnowledgeFooter.vue'
import { useLocale } from '../composables/useLocale'

const { locale } = useLocale()

const contactCopy = {
  zh: {
    title: '联系我们',
    phone: {
      title: '联系电话',
      body: '欢迎通过该联系方式咨询选购、定制与供货服务。',
    },
    consult: {
      title: '在线咨询',
      body: '通过官方微信与官方邮箱快速联系顾问，我们将在工作时段尽快回复。',
    },
    wechat: {
      title: '官方微信',
      alt: '官方微信二维码',
      body: '扫码添加官方微信，获取一对一咨询服务。',
    },
    email: {
      title: '官方邮箱',
      alt: '官方邮箱二维码',
    },
    store: {
      title: '到店咨询',
      body: '广东省深圳市罗湖区贝丽北路99号水贝国际中心4楼',
    },
  },
  en: {
    title: 'Contact Us',
    phone: {
      title: 'Phone',
      body: 'Use this number for product inquiries, customization requests, and supply cooperation.',
    },
    consult: {
      title: 'Online Consultation',
      body: 'Reach our consultants quickly through the official WeChat account or email, and we will respond during business hours.',
    },
    wechat: {
      title: 'Official WeChat',
      alt: 'Official WeChat QR code',
      body: 'Scan the code to connect with our team for one-on-one consultation.',
    },
    email: {
      title: 'Official Email',
      alt: 'Official email QR code',
    },
    store: {
      title: 'Visit the Store',
      body: '4F, Shuibei International Center, No. 99 Beili North Road, Luohu District, Shenzhen, Guangdong.',
    },
  },
}

const copy = computed(() => contactCopy[locale.value])
</script>

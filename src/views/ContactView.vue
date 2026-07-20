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
            <svg class="contact-chat-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
              <path d="M32 57.2c13.9 0 25.2-11.3 25.2-25.2S45.9 6.8 32 6.8 6.8 18.1 6.8 32 18.1 57.2 32 57.2Z" />
              <path d="M19.4 33.2v-4.1c0-7.4 5.4-12.9 12.6-12.9s12.6 5.5 12.6 12.9v4.1" />
              <path d="M19.3 31.2h-2c-1.5 0-2.7 1.2-2.7 2.7v4.4c0 1.5 1.2 2.7 2.7 2.7h3V31.2Zm25.4 0h2c1.5 0 2.7 1.2 2.7 2.7v4.4c0 1.5-1.2 2.7-2.7 2.7h-3V31.2Z" />
              <path d="M26.8 36.9c1.3 1.1 3.1 1.7 5.2 1.7s3.9-.6 5.2-1.7" />
              <path d="M44.6 40.8c0 4.2-3.5 6.7-8.1 6.7h-3.9" />
              <path d="M31.8 47.5h-3" />
            </svg>
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
          <p>37261784@qq.com</p>
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

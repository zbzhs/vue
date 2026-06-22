<template>
  <section class="preferences-page">
    <div class="preferences-shell">
      <div class="preferences-grid">
        <section class="preference-panel" :aria-label="ui.languageTitle">
          <div class="preference-panel-head">
            <span>{{ ui.languageTitle }}</span>
            <strong>{{ selectedLanguage?.name }}</strong>
          </div>

          <div class="preference-options">
            <button
              v-for="item in languages"
              :key="item.code"
              class="preference-option"
              :class="{ active: displayLanguage === item.code }"
              type="button"
              @click="setDisplayLanguage(item.code)"
            >
              <span>
                <strong>{{ item.name }}</strong>
              </span>
              <i aria-hidden="true"></i>
            </button>
          </div>
        </section>

        <section class="preference-panel preference-panel--wide" :aria-label="ui.currencyTitle">
          <div class="preference-panel-head">
            <span>{{ ui.currencyTitle }}</span>
            <strong>{{ selectedRegion?.currency }}</strong>
          </div>

          <div class="currency-options">
            <button
              v-for="item in currencyRegions"
              :key="item.code"
              class="currency-option"
              :class="{ active: currencyRegion === item.code }"
              type="button"
              @click="setCurrencyRegion(item.code)"
            >
              <span>
                <strong>{{ item.name }}</strong>
              </span>
              <b>{{ item.currency }}</b>
            </button>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

import { useLocale } from '../composables/useLocale'

const { locale, displayLanguage, currencyRegion, setDisplayLanguage, setCurrencyRegion } = useLocale()

const uiCopy = {
  zh: {
    kicker: '偏好设置',
    title: '语言与货币',
    languageTitle: '选择语言',
    currencyTitle: '地区与货币',
  },
  en: {
    kicker: 'Preferences',
    title: 'Language and Currency',
    languageTitle: 'Display Language',
    currencyTitle: 'Region and Currency',
  },
  ja: {
    kicker: '設定',
    title: '言語と通貨',
    languageTitle: '表示言語',
    currencyTitle: '地域と通貨',
  },
  th: {
    kicker: 'การตั้งค่า',
    title: 'ภาษาและสกุลเงิน',
    languageTitle: 'ภาษาแสดงผล',
    currencyTitle: 'ภูมิภาคและสกุลเงิน',
  },
  ko: {
    kicker: '환경설정',
    title: '언어 및 통화',
    languageTitle: '표시 언어',
    currencyTitle: '지역 및 통화',
  },
  vi: {
    kicker: 'Tùy chọn',
    title: 'Ngôn ngữ và tiền tệ',
    languageTitle: 'Ngôn ngữ hiển thị',
    currencyTitle: 'Khu vực và tiền tệ',
  },
}

const ui = computed(() => uiCopy[locale.value] ?? uiCopy.zh)

const languages = [
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'en', name: 'English', nativeName: '英语' },
  { code: 'ja', name: 'Japanese', nativeName: '日语' },
  { code: 'th', name: 'Thai', nativeName: '泰语' },
  { code: 'ko', name: 'Korean', nativeName: '韩语' },
  { code: 'vi', name: 'Vietnamese', nativeName: '越南语' },
]

const currencyRegions = [
  { code: 'CNY', name: 'China', currency: 'CNY' },
  { code: 'USD', name: 'United States', currency: 'USD' },
  { code: 'HKD', name: 'Hong Kong SAR, China', currency: 'HKD' },
  { code: 'JPY', name: 'Japan', currency: 'JPY' },
  { code: 'KRW', name: 'Korea', currency: 'KRW' },
  { code: 'MYR', name: 'Malaysia', currency: 'MYR' },
  { code: 'SGD', name: 'Singapore', currency: 'SGD' },
  { code: 'TWD', name: 'Taiwan, China', currency: 'TWD' },
  { code: 'THB', name: 'Thailand', currency: 'THB' },
  { code: 'VND', name: 'Vietnam', currency: 'VND' },
]

const selectedLanguage = computed(() =>
  languages.find((item) => item.code === displayLanguage.value) ?? languages[0],
)

const selectedRegion = computed(() =>
  currencyRegions.find((item) => item.code === currencyRegion.value) ?? currencyRegions[0],
)
</script>

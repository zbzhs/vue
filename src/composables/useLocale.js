import { computed, ref, watch } from 'vue'

const LOCALE_STORAGE_KEY = 'dering-locale'
const DISPLAY_LANGUAGE_STORAGE_KEY = 'dering-display-language'
const CURRENCY_STORAGE_KEY = 'dering-currency-region'
const SUPPORTED_LOCALES = new Set(['zh', 'en', 'ja', 'th', 'ko', 'vi'])
const LOCALE_TO_DOCUMENT_LANG = {
  zh: 'zh-CN',
  en: 'en',
  ja: 'ja',
  th: 'th',
  ko: 'ko',
  vi: 'vi',
}
const DEFAULT_CURRENCY_BY_LOCALE = {
  zh: 'CNY',
  en: 'USD',
  ja: 'JPY',
  th: 'THB',
  ko: 'KRW',
  vi: 'VND',
}
const locale = ref('zh')
const displayLanguage = ref('zh')
const currencyRegion = ref('CNY')

function normalizeLocale(value) {
  return SUPPORTED_LOCALES.has(value) ? value : 'zh'
}

function updateDocumentLanguage(value) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.lang = LOCALE_TO_DOCUMENT_LANG[value] || 'zh-CN'
}

function setLocale(value) {
  locale.value = normalizeLocale(value)
}

function setDisplayLanguage(value) {
  const nextValue = normalizeLocale(value)
  displayLanguage.value = nextValue
  setLocale(nextValue)
  setCurrencyRegion(DEFAULT_CURRENCY_BY_LOCALE[nextValue] ?? currencyRegion.value)
}

function setCurrencyRegion(value) {
  currencyRegion.value = value || 'CNY'
}

function toggleLocale() {
  setLocale(locale.value === 'zh' ? 'en' : 'zh')
}

function t(zh, en) {
  return locale.value === 'en' ? en : zh
}

if (typeof window !== 'undefined') {
  const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  const savedDisplayLanguage = window.localStorage.getItem(DISPLAY_LANGUAGE_STORAGE_KEY)
  const savedCurrencyRegion = window.localStorage.getItem(CURRENCY_STORAGE_KEY)
  locale.value = normalizeLocale(savedLocale)
  displayLanguage.value = normalizeLocale(savedDisplayLanguage) || locale.value
  currencyRegion.value = savedCurrencyRegion || currencyRegion.value
  updateDocumentLanguage(locale.value)
}

watch(locale, (value) => {
  updateDocumentLanguage(value)

  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LOCALE_STORAGE_KEY, value)
})

watch(displayLanguage, (value) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(DISPLAY_LANGUAGE_STORAGE_KEY, value)
})

watch(currencyRegion, (value) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(CURRENCY_STORAGE_KEY, value)
})

export function useLocale() {
  return {
    locale,
    displayLanguage,
    currencyRegion,
    isEnglish: computed(() => locale.value === 'en'),
    setLocale,
    setDisplayLanguage,
    setCurrencyRegion,
    toggleLocale,
    t,
  }
}

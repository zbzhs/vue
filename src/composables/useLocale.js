import { computed, ref, watch } from 'vue'

const LOCALE_STORAGE_KEY = 'dering-locale'
const locale = ref('zh')

function normalizeLocale(value) {
  return value === 'en' ? 'en' : 'zh'
}

function updateDocumentLanguage(value) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.lang = value === 'en' ? 'en' : 'zh-CN'
}

function setLocale(value) {
  locale.value = normalizeLocale(value)
}

function toggleLocale() {
  setLocale(locale.value === 'zh' ? 'en' : 'zh')
}

function t(zh, en) {
  return locale.value === 'en' ? en : zh
}

if (typeof window !== 'undefined') {
  const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  locale.value = normalizeLocale(savedLocale)
  updateDocumentLanguage(locale.value)
}

watch(locale, (value) => {
  updateDocumentLanguage(value)

  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LOCALE_STORAGE_KEY, value)
})

export function useLocale() {
  return {
    locale,
    isEnglish: computed(() => locale.value === 'en'),
    setLocale,
    toggleLocale,
    t,
  }
}

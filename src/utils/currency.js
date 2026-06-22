export const currencyRatesFromCny = {
  CNY: 1,
  USD: 0.14,
  HKD: 1.08,
  JPY: 21.7,
  KRW: 190,
  MYR: 0.59,
  SGD: 0.18,
  TWD: 4.25,
  THB: 4.55,
  VND: 3600,
}

export const currencyLocales = {
  CNY: 'zh-CN',
  USD: 'en-US',
  HKD: 'zh-HK',
  JPY: 'ja-JP',
  KRW: 'ko-KR',
  MYR: 'ms-MY',
  SGD: 'en-SG',
  TWD: 'zh-TW',
  THB: 'th-TH',
  VND: 'vi-VN',
}

export function convertFromCny(amount, currency) {
  const rate = currencyRatesFromCny[currency] ?? 1
  return amount * rate
}

export function formatCurrencyFromCny(amount, currency) {
  const convertedAmount = convertFromCny(amount, currency)
  const maximumFractionDigits = ['JPY', 'KRW', 'VND'].includes(currency) ? 0 : 2

  return new Intl.NumberFormat(currencyLocales[currency] ?? 'zh-CN', {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(convertedAmount)
}

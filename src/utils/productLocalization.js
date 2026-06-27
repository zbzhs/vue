const typeMap = {
  戒指: 'Ring',
  男戒: "Men's Ring",
  女戒: "Women's Ring",
  项链: 'Necklace',
  耳饰: 'Earrings',
  耳钉: 'Stud Earrings',
  耳圈: 'Hoop Earrings',
  耳坠: 'Drop Earrings',
  手链: 'Bracelet',
  吊坠: 'Pendant',
  未分类: 'Uncategorized',
}

const typeTranslations = {
  zh: {
    Ring: '戒指',
    "Men's Ring": '男戒',
    "Women's Ring": '女戒',
    Necklace: '项链',
    Earrings: '耳饰',
    'Stud Earrings': '耳钉',
    'Hoop Earrings': '耳圈',
    'Drop Earrings': '耳坠',
    Bracelet: '手链',
    Pendant: '吊坠',
    Uncategorized: '未分类',
  },
  en: {
    Ring: 'Ring',
    "Men's Ring": "Men's Ring",
    "Women's Ring": "Women's Ring",
    Necklace: 'Necklace',
    Earrings: 'Earrings',
    'Stud Earrings': 'Stud Earrings',
    'Hoop Earrings': 'Hoop Earrings',
    'Drop Earrings': 'Drop Earrings',
    Bracelet: 'Bracelet',
    Pendant: 'Pendant',
    Uncategorized: 'Uncategorized',
  },
  ja: {
    Ring: 'リング',
    "Men's Ring": 'メンズリング',
    "Women's Ring": 'レディースリング',
    Necklace: 'ネックレス',
    Earrings: 'イヤーアクセ',
    'Stud Earrings': 'スタッド',
    'Hoop Earrings': 'フープ',
    'Drop Earrings': 'ドロップ',
    Bracelet: 'ブレスレット',
    Pendant: 'ペンダント',
    Uncategorized: '未分類',
  },
  th: {
    Ring: 'แหวน',
    "Men's Ring": 'แหวนผู้ชาย',
    "Women's Ring": 'แหวนผู้หญิง',
    Necklace: 'สร้อยคอ',
    Earrings: 'ต่างหู',
    'Stud Earrings': 'ต่างหูแบบหมุด',
    'Hoop Earrings': 'ต่างหูห่วง',
    'Drop Earrings': 'ต่างหูระย้า',
    Bracelet: 'สร้อยข้อมือ',
    Pendant: 'จี้',
    Uncategorized: 'ไม่จัดหมวดหมู่',
  },
  ko: {
    Ring: '반지',
    "Men's Ring": '남성용 반지',
    "Women's Ring": '여성용 반지',
    Necklace: '목걸이',
    Earrings: '귀걸이',
    'Stud Earrings': '스터드',
    'Hoop Earrings': '링 귀걸이',
    'Drop Earrings': '드롭 귀걸이',
    Bracelet: '팔찌',
    Pendant: '펜던트',
    Uncategorized: '미분류',
  },
  vi: {
    Ring: 'Nhẫn',
    "Men's Ring": 'Nhẫn nam',
    "Women's Ring": 'Nhẫn nữ',
    Necklace: 'Dây chuyền',
    Earrings: 'Hoa tai',
    'Stud Earrings': 'Hoa tai đinh',
    'Hoop Earrings': 'Hoa tai vòng',
    'Drop Earrings': 'Hoa tai thả',
    Bracelet: 'Vòng tay',
    Pendant: 'Mặt dây',
    Uncategorized: 'Chưa phân loại',
  },
}

const seriesMap = {
  未分类系列: 'Uncategorized Collection',
  'S925系列': 'S925 Collection',
  晨曦系列: 'Dawn Collection',
  星河系列: 'Galaxy Collection',
  蓝境系列: 'Azure Collection',
  月相系列: 'Moonphase Collection',
  花影系列: 'Floral Glow Collection',
  雾光系列: 'Mistlight Collection',
  鎏金系列: 'Gilded Collection',
  海盐系列: 'Sea Salt Collection',
  极光系列: 'Aurora Collection',
  流光系列: 'Luster Collection',
  幸运系列: 'Lucky Clover Collection',
  雪影系列: 'Snow Shadow Collection',
  '小清新吊坠': 'Fresh Pendant Collection',
  'THE ONE系列': 'THE ONE Collection',
  粉钻系列: 'Pink Diamond Collection',
  时尚小清新系列: 'Modern Fresh Collection',
  '经典卡家四爪系列': 'Classic Four-Prong Collection',
  '经典卡家牛头系列': 'Classic Tulip-Prong Collection',
  '经典T家六爪系列': 'Classic Six-Prong Collection',
  '经典泡泡系列': 'Classic Bubble Collection',
  蝴蝶系列: 'Butterfly Collection',
  马眼系列: 'Marquise Collection',
  'V形四爪-爆款耳钉': 'V-Prong Bestselling Studs',
  '小排戒系列（DIY戒指）': 'Slim Band DIY Ring Collection',
  复古戒指: 'Vintage Ring Collection',
  异形项链: 'Fancy Shape Necklace Collection',
  打孔套装: 'Drilled Stone Set',
  经典耳钩系列: 'Classic Hook Earring Collection',
  男戒系列: "Men's Ring Collection",
  微笑套系: 'Smile Collection',
  耳圈系列: 'Hoop Earring Collection',
}

const materialMap = {
  '18K白金': '18K White Gold',
  '18K玫瑰金': '18K Rose Gold',
  '18K黄金': '18K Yellow Gold',
  '18K白': '18K White Gold',
  '18K黄': '18K Yellow Gold',
  铂金PT950: 'PT950 Platinum',
  Pt950: 'PT950 Platinum',
  S925银: 'S925 Silver',
}

const productNameMap = {
  'S925培育白钻圆形手链': 'S925 Lab Diamond Round Bracelet',
  晨曦钻戒: 'Dawn Diamond Ring',
  星河项链: 'Galaxy Necklace',
  蓝境彩宝戒: 'Azure Gem Ring',
  月相珍珠耳坠: 'Moonphase Pearl Drops',
  'S925微光锁骨链': 'S925 Glow Collar Necklace',
  晨曦光环耳钉: 'Dawn Halo Studs',
  星河钻线手链: 'Galaxy Diamond Line Bracelet',
  花影开口戒: 'Floral Glow Open Ring',
  雾光几何耳环: 'Mistlight Geometric Earrings',
  鎏金圆牌项链: 'Gilded Medallion Necklace',
  海盐珍珠手链: 'Sea Salt Pearl Bracelet',
  极光椭圆钻戒: 'Aurora Oval Diamond Ring',
  流光水滴耳坠: 'Luster Teardrop Drops',
  贝母四叶项链: 'Mother-of-Pearl Clover Necklace',
  雪影排钻戒: 'Snow Shadow Band Ring',
  星点细链手链: 'Starlit Fine Chain Bracelet',
  银月耳钉: 'Silver Moon Studs',
  蓝调托帕石项链: 'Blue Mood Topaz Necklace',
  玫瑰藤蔓戒: 'Rose Vine Ring',
}

const specLabelMap = {
  品类: 'Category',
  系列: 'Collection',
  金属材质: 'Metal',
  总重: 'Total Weight',
  石颜色: 'Stone Color',
  石形状: 'Stone Shape',
  主石: 'Center Stone',
  副石: 'Side Stone',
  尺寸说明: 'Size Details',
  实时库存: 'Live Stock',
  达播价: 'Live Price',
  标签价: 'Tag Price',
  佣金: 'Commission',
  未出货数: 'Unshipped Qty',
}

const colorMap = {
  培育白钻: 'Lab-Grown White Diamond',
  培育粉钻: 'Lab-Grown Pink Diamond',
  培育黄钻: 'Lab-Grown Yellow Diamond',
  培育钻: 'Lab-Grown Diamond',
}

const shapeMap = {
  '打洞水滴形+圆形': 'Drilled Pear + Round',
  '打洞水滴+圆形': 'Drilled Pear + Round',
  公主方形: 'Princess Cut',
  祖母绿形: 'Emerald Cut',
  雷迪恩形: 'Radiant Cut',
  椭圆形: 'Oval',
  水滴形: 'Pear',
  马眼形: 'Marquise',
  圆形: 'Round',
  心形: 'Heart',
  异形: 'Fancy Shape',
}

const phraseTranslations = {
  ja: {
    'Lab-Grown White Diamond': 'ラボグロウンホワイトダイヤモンド',
    'Lab-Grown Pink Diamond': 'ラボグロウンピンクダイヤモンド',
    'Lab-Grown Yellow Diamond': 'ラボグロウンイエローダイヤモンド',
    'Lab-Grown Diamond': 'ラボグロウンダイヤモンド',
    '18K White Gold': '18Kホワイトゴールド',
    '18K Yellow Gold': '18Kイエローゴールド',
    '18K Rose Gold': '18Kローズゴールド',
    'PT950 Platinum': 'PT950プラチナ',
    'S925 Silver': 'S925シルバー',
    'Emerald Cut': 'エメラルドカット',
    'Fancy Shape': 'ファンシーシェイプ',
    Round: 'ラウンド',
    Marquise: 'マーキス',
    Oval: 'オーバル',
    Pear: 'ペアシェイプ',
    Bracelet: 'ブレスレット',
    Necklace: 'ネックレス',
    Pendant: 'ペンダント',
    Ring: 'リング',
    Earrings: 'イヤーアクセ',
    Collection: 'コレクション',
  },
  th: {
    'Lab-Grown White Diamond': 'เพชรขาวแล็บโกรว์น',
    'Lab-Grown Pink Diamond': 'เพชรชมพูแล็บโกรว์น',
    'Lab-Grown Yellow Diamond': 'เพชรเหลืองแล็บโกรว์น',
    'Lab-Grown Diamond': 'เพชรแล็บโกรว์น',
    '18K White Gold': 'ทองคำขาว 18K',
    '18K Yellow Gold': 'ทองคำเหลือง 18K',
    '18K Rose Gold': 'โรสโกลด์ 18K',
    'PT950 Platinum': 'แพลทินัม PT950',
    'S925 Silver': 'เงิน S925',
    'Emerald Cut': 'ทรงเอเมอรัลด์',
    'Fancy Shape': 'ทรงแฟนซี',
    Round: 'ทรงกลม',
    Marquise: 'ทรงมาร์quise',
    Oval: 'ทรงรี',
    Pear: 'ทรงหยดน้ำ',
    Bracelet: 'สร้อยข้อมือ',
    Necklace: 'สร้อยคอ',
    Pendant: 'จี้',
    Ring: 'แหวน',
    Earrings: 'ต่างหู',
    Collection: 'คอลเลกชัน',
  },
  ko: {
    'Lab-Grown White Diamond': '랩그로운 화이트 다이아몬드',
    'Lab-Grown Pink Diamond': '랩그로운 핑크 다이아몬드',
    'Lab-Grown Yellow Diamond': '랩그로운 옐로 다이아몬드',
    'Lab-Grown Diamond': '랩그로운 다이아몬드',
    '18K White Gold': '18K 화이트 골드',
    '18K Yellow Gold': '18K 옐로 골드',
    '18K Rose Gold': '18K 로즈 골드',
    'PT950 Platinum': 'PT950 플래티넘',
    'S925 Silver': 'S925 실버',
    'Emerald Cut': '에메랄드 컷',
    'Fancy Shape': '팬시 셰이프',
    Round: '라운드',
    Marquise: '마퀴즈',
    Oval: '오벌',
    Pear: '페어',
    Bracelet: '팔찌',
    Necklace: '목걸이',
    Pendant: '펜던트',
    Ring: '반지',
    Earrings: '귀걸이',
    Collection: '컬렉션',
  },
  vi: {
    'Lab-Grown White Diamond': 'Kim cương trắng nuôi cấy',
    'Lab-Grown Pink Diamond': 'Kim cương hồng nuôi cấy',
    'Lab-Grown Yellow Diamond': 'Kim cương vàng nuôi cấy',
    'Lab-Grown Diamond': 'Kim cương nuôi cấy',
    '18K White Gold': 'Vàng trắng 18K',
    '18K Yellow Gold': 'Vàng vàng 18K',
    '18K Rose Gold': 'Vàng hồng 18K',
    'PT950 Platinum': 'Bạch kim PT950',
    'S925 Silver': 'Bạc S925',
    'Emerald Cut': 'Cắt emerald',
    'Fancy Shape': 'Dáng fancy',
    Round: 'Tròn',
    Marquise: 'Marquise',
    Oval: 'Oval',
    Pear: 'Giọt lê',
    Bracelet: 'Vòng tay',
    Necklace: 'Dây chuyền',
    Pendant: 'Mặt dây',
    Ring: 'Nhẫn',
    Earrings: 'Hoa tai',
    Collection: 'Bộ sưu tập',
  },
}

const englishPhraseAliases = {
  'lab-grown white diamond': 'Lab-Grown White Diamond',
  'lab-grown pink diamond': 'Lab-Grown Pink Diamond',
  'lab-grown yellow diamond': 'Lab-Grown Yellow Diamond',
  'lab-grown diamond': 'Lab-Grown Diamond',
  '18K white gold': '18K White Gold',
  '18K yellow gold': '18K Yellow Gold',
  '18K rose gold': '18K Rose Gold',
  'emerald cut': 'Emerald Cut',
  'fancy shape': 'Fancy Shape',
  round: 'Round',
  marquise: 'Marquise',
  oval: 'Oval',
  pear: 'Pear',
  bracelet: 'Bracelet',
  necklace: 'Necklace',
  pendant: 'Pendant',
  ring: 'Ring',
  earrings: 'Earrings',
  collection: 'Collection',
}

const textReplacements = [
  ['打洞水滴形+圆形', 'drilled pear and round'],
  ['打洞水滴+圆形', 'drilled pear and round'],
  ['公主方形', 'princess cut'],
  ['祖母绿形', 'emerald cut'],
  ['雷迪恩形', 'radiant cut'],
  ['椭圆形', 'oval'],
  ['水滴形', 'pear'],
  ['马眼形', 'marquise'],
  ['圆形', 'round'],
  ['心形', 'heart'],
  ['异形', 'fancy shape'],
  ['培育白钻', 'lab-grown white diamond'],
  ['培育粉钻', 'lab-grown pink diamond'],
  ['培育黄钻', 'lab-grown yellow diamond'],
  ['培育钻', 'lab-grown diamond'],
  ['18K白', '18K White Gold'],
  ['18K黄', '18K Yellow Gold'],
  ['Pt950', 'PT950 Platinum'],
  ['S925银', 'S925 Silver'],
  ['粉色蓝宝石', 'pink sapphire'],
  ['白色锆石', 'white zircon'],
  ['白贝母镶嵌', 'white mother-of-pearl inlay'],
  ['淡水珍珠', 'freshwater pearls'],
  ['托帕石', 'topaz'],
  ['珍珠', 'pearl'],
  ['圆钻合计', 'round diamonds total'],
  ['圆钻', 'round diamond'],
  ['梯方钻', 'emerald-cut diamonds'],
  ['围镶', 'halo set'],
  ['排镶', 'line set'],
  ['锆石', 'zircon'],
  ['耳堵式', 'push-back'],
  ['耳针式', 'post-back'],
  ['耳钉', 'stud earrings'],
  ['耳圈', 'hoop earrings'],
  ['耳坠', 'drop earrings'],
  ['吊坠', 'pendant'],
  ['项链', 'necklace'],
  ['手链', 'bracelet'],
  ['男戒', "men's ring"],
  ['女戒', "women's ring"],
  ['戒指', 'ring'],
  ['可定制', 'customizable'],
  ['开口可微调', 'slightly adjustable open ring'],
  ['调节链', 'extender chain'],
  ['链长可调节', 'adjustable chain length'],
  ['送胶耳堵', 'Complimentary silicone backs'],
  ['送银链', 'Complimentary silver chain'],
  ['引流爆款', 'Bestseller'],
  ['运费险', 'Shipping insurance'],
  ['质检证书', 'Quality certificate'],
  ['精美包装', 'Gift packaging'],
  ['七天无理由', '7-day hassle-free returns'],
  ['长度约', 'length about '],
  ['直径约', 'diameter about '],
  ['圆形约', 'round cut about '],
  ['约', 'about '],
  ['颗', ' pcs'],
  ['无', 'None'],
  ['元', 'CNY'],
]

const typeKeys = Object.keys(typeMap).sort((left, right) => right.length - left.length)
const materialKeys = Object.keys(materialMap).sort((left, right) => right.length - left.length)
const colorKeys = Object.keys(colorMap).sort((left, right) => right.length - left.length)
const shapeKeys = Object.keys(shapeMap).sort((left, right) => right.length - left.length)

function replaceText(value) {
  let result = value

  for (const [source, target] of textReplacements) {
    result = result.replaceAll(source, target)
  }

  return result
    .replaceAll('\n', ' / ')
    .replaceAll('，', ', ')
    .replaceAll('：', ': ')
    .replaceAll('（', '(')
    .replaceAll('）', ')')
    .replaceAll('+', ' + ')
    .replace(/\s*\/\s*/g, ' / ')
    .replace(/\s+/g, ' ')
    .trim()
}

function localizeByMap(value, map, locale) {
  if (!value || locale !== 'en') {
    return value
  }

  return map[value] ?? value
}

function findMatch(value, keys, map) {
  const key = keys.find((item) => value.includes(item))
  return key ? map[key] : ''
}

function translateNameByPattern(value) {
  let remaining = value
  let material = ''
  let type = ''
  let color = ''

  const materialKey = materialKeys.find((item) => remaining.startsWith(item))
  if (materialKey) {
    material = materialMap[materialKey]
    remaining = remaining.slice(materialKey.length)
  }

  const typeKey = typeKeys.find((item) => remaining.endsWith(item))
  if (typeKey) {
    type = typeMap[typeKey]
    remaining = remaining.slice(0, -typeKey.length)
  }

  const colorKey = colorKeys.find((item) => remaining.includes(item))
  if (colorKey) {
    color = colorMap[colorKey]
    remaining = remaining.replace(colorKey, '')
  }

  const shape = findMatch(remaining, shapeKeys, shapeMap)

  const segments = [material, color, shape, type].filter(Boolean)
  return segments.length ? segments.join(' ') : replaceText(value)
}

function translateSeriesByPattern(value) {
  if (seriesMap[value]) {
    return seriesMap[value]
  }

  const translated = replaceText(value)
  if (translated !== value) {
    if (value.endsWith('系列')) {
      return `${translated.replace(/ series$/i, '')} Collection`
    }

    if (value.endsWith('套系') || value.endsWith('套装')) {
      return `${translated.replace(/ set$/i, '')} Set`
    }
  }

  return value
}

function translateEnglishPhrases(value, locale) {
  const map = phraseTranslations[locale]
  if (!map || !value) {
    return value
  }

  const aliasMap = Object.fromEntries(
    Object.entries(englishPhraseAliases)
      .filter(([, canonical]) => map[canonical])
      .map(([alias, canonical]) => [alias, map[canonical]]),
  )

  return Object.entries({ ...map, ...aliasMap })
    .sort(([left], [right]) => right.length - left.length)
    .reduce((result, [source, target]) => result.replaceAll(source, target), value)
}

export function localizeProductName(value, locale) {
  if (!value || locale === 'zh') {
    return value
  }

  return translateEnglishPhrases(productNameMap[value] ?? translateNameByPattern(value), locale)
}

export function localizeProductType(value, locale) {
  if (!value) {
    return value
  }

  if (locale === 'en') {
    return localizeByMap(value, typeMap, locale) ?? value
  }

  const englishType = typeMap[value] ?? value
  return typeTranslations[locale]?.[englishType] ?? englishType
}

const seriesDisplayNameMap = {
  经典卡家四爪系列: '经典四爪系列',
  经典T家六爪系列: '经典六爪系列',
  经典卡家牛头系列: '经典牛头系列',
}

export function localizeSeries(value, locale) {
  if (!value) {
    return value
  }

  const displayValue = seriesDisplayNameMap[value] ?? value

  if (locale === 'zh') {
    return displayValue
  }

  return translateEnglishPhrases(seriesMap[value] ?? translateSeriesByPattern(displayValue), locale)
}

export function localizeMaterial(value, locale) {
  if (locale === 'zh') {
    return value
  }

  return translateEnglishPhrases(materialMap[value] ?? value, locale)
}

export function localizeSpecLabel(value, locale) {
  if (locale === 'zh') {
    return value
  }

  return specLabelMap[value] ?? value
}

export function localizeFreeText(value, locale) {
  if (!value || locale === 'zh') {
    return value
  }

  const directValue =
    productNameMap[value] ??
    materialMap[value] ??
    seriesMap[value] ??
    typeMap[value] ??
    colorMap[value] ??
    shapeMap[value]

  if (directValue) {
    return translateEnglishPhrases(directValue, locale)
  }

  return translateEnglishPhrases(replaceText(value), locale)
}

export function localizeSpecValue(label, value, locale) {
  if (!value || locale === 'zh') {
    return value
  }

  if (label === '品类') {
    return localizeProductType(value, locale)
  }

  if (label === '系列') {
    return localizeSeries(value, locale)
  }

  if (label === '金属材质') {
    return localizeMaterial(value, locale)
  }

  return localizeFreeText(value, locale)
}

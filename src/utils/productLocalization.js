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

export function localizeProductName(value, locale) {
  if (!value || locale !== 'en') {
    return value
  }

  return productNameMap[value] ?? translateNameByPattern(value)
}

export function localizeProductType(value, locale) {
  return localizeByMap(value, typeMap, locale) ?? value
}

export function localizeSeries(value, locale) {
  if (!value || locale !== 'en') {
    return value
  }

  return translateSeriesByPattern(value)
}

export function localizeMaterial(value, locale) {
  return localizeByMap(value, materialMap, locale) ?? value
}

export function localizeSpecLabel(value, locale) {
  return localizeByMap(value, specLabelMap, locale) ?? value
}

export function localizeFreeText(value, locale) {
  if (!value || locale !== 'en') {
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
    return directValue
  }

  return replaceText(value)
}

export function localizeSpecValue(label, value, locale) {
  if (!value || locale !== 'en') {
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

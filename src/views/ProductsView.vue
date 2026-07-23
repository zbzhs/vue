<template>
  <div v-if="showFilterPanel" class="filter-drawer-backdrop" @click.self="showFilterPanel = false">
    <aside class="filter-drawer" :aria-label="ui.filterMenuAria">
      <button class="drawer-close" type="button" @click="showFilterPanel = false">
        <span aria-hidden="true">&times;</span>
        {{ ui.close }}
      </button>

      <div class="drawer-filter-modules">
        <section
          v-for="module in filterModules"
          :key="module.id"
          class="drawer-filter-group"
          :class="{ active: activeFilterModule === module.id }"
        >
          <button
            class="drawer-filter-head"
            type="button"
            :aria-expanded="activeFilterModule === module.id"
            @click="activeFilterModule = activeFilterModule === module.id ? '' : module.id"
          >
            <span>
              <h2>{{ module.label }}</h2>
              <small v-if="module.summary">{{ module.summary }}</small>
            </span>
            <i aria-hidden="true">{{ activeFilterModule === module.id ? '-' : '+' }}</i>
          </button>

          <div v-if="activeFilterModule === module.id" class="drawer-filter-options">
            <template v-for="option in module.options" :key="option.value">
              <button
                type="button"
                :class="{ active: module.value === option.value }"
                @click="selectFilterOption(module.id, option.value)"
              >
                {{ option.label }}
              </button>
              <div
                v-if="module.child && option.value === earringFilterKey && module.value === earringFilterKey"
                class="drawer-filter-subgroup"
              >
                <button
                  v-for="childOption in module.child.options"
                  :key="childOption.value"
                  type="button"
                  :class="{ active: module.child.value === childOption.value }"
                  @click="selectFilterOption(module.child.id, childOption.value)"
                >
                  {{ childOption.label }}
                </button>
              </div>
            </template>
          </div>
        </section>
      </div>

      <div class="drawer-filter-actions">
        <button class="drawer-reset" type="button" @click="resetFilters">{{ ui.reset }}</button>
        <button class="drawer-submit" type="button" @click="applyFilters">{{ ui.submit }}</button>
      </div>

    </aside>
  </div>

  <section v-if="categoryHero" class="category-hero" :aria-label="categoryHero.title">
    <div class="category-hero-copy">
      <nav class="category-breadcrumb" :aria-label="breadcrumbCopy.aria">
        <RouterLink to="/">{{ breadcrumbCopy.home }}</RouterLink>
        <span aria-hidden="true">></span>
        <RouterLink :to="{ name: 'products' }">{{ breadcrumbCopy.products }}</RouterLink>
        <span aria-hidden="true">></span>
        <span>{{ categoryHero.title }}</span>
      </nav>

      <h1>{{ categoryHero.title }}</h1>
      <p>{{ categoryHero.text }}</p>
    </div>

    <img v-if="categoryHero.image" class="category-hero-image" :src="categoryHero.image" :alt="categoryHero.alt" />
  </section>

  <section
    class="product-discovery"
    :aria-label="ui.discoveryAria"
  >
    <div class="product-toolbar">
      <div class="search-panel">
        <div class="search-main">
          <label class="search-box">
            <input
              v-model.trim="searchQuery"
              type="search"
              :placeholder="ui.searchPlaceholder"
              @keydown.enter.prevent="showProducts"
            />
          </label>
          <button class="search-action" type="button" @click="showProducts">{{ ui.search }}</button>
        </div>

        <div v-if="searchQuery && recommendedProducts.length" class="recommend-panel">
          <p>{{ ui.recommend }}</p>
          <button
            v-for="product in recommendedProducts"
            :key="product.code"
            type="button"
            @mouseenter="setHoveredProduct(product.code)"
            @mouseleave="clearHoveredProduct(product.code)"
            @click="chooseRecommendation(product)"
          >
            <img :src="displayProductCardImage(product)" :alt="product.displayName" />
            <span>
              <strong>{{ product.displayName }}</strong>
              <small>
                {{ product.displayType }} / {{ product.displaySeries }} / {{ formatPrice(product.price) }}
              </small>
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>

  <section id="product-section" ref="productSection" class="content-section products-section">
    <p v-if="isLoading" class="empty-products">{{ ui.loading }}</p>
    <p v-else-if="loadError" class="empty-products">{{ ui.loadError }}</p>

    <div v-else class="product-grid">
      <button
        v-for="product in visibleProducts"
        :key="product.code"
        class="product-card"
        :class="productCardClass(product)"
        :data-product-code="product.code"
        type="button"
        @mouseenter="setHoveredProduct(product.code)"
        @mouseleave="clearHoveredProduct(product.code)"
        @click="openProduct(product)"
      >
        <span class="product-visual">
          <img
            v-if="displayProductCardImage(product)"
            class="product-image"
            :src="displayProductCardImage(product)"
            :alt="product.displayName"
            :style="productImageStyle(product)"
            @error="hideBrokenProductImage(product)"
          />
        </span>
        <div class="product-info">
          <h2>{{ product.displayName }}</h2>
          <span>{{ product.displayNote || product.displaySeries }}</span>
          <strong>{{ formatPrice(product.price) }}</strong>
        </div>
      </button>
    </div>

    <p v-if="!isLoading && !loadError && displayableProducts.length === 0" class="empty-products">
      {{ ui.empty }}
    </p>

    <div v-if="!isLoading && !loadError && canLoadMoreProducts" class="product-load-more">
      <button type="button" :disabled="isLoadingMore" @click="loadMoreProducts">
        {{ isLoadingMore ? loadMoreLoadingLabel : loadMoreLabel }}
      </button>
    </div>
  </section>

  <KnowledgeFooter footer-class="home-footer product-page-footer" />

  <div v-if="activeProduct" class="product-detail-backdrop" @click.self="closeProduct">
    <article
      class="product-detail"
      aria-modal="true"
      role="dialog"
      @mouseenter="setHoveredProduct(activeProduct.code)"
      @mouseleave="clearHoveredProduct(activeProduct.code)"
    >
      <button class="detail-close" type="button" :aria-label="ui.closeDetail" @click="closeProduct">
        <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path d="M20.5 8.5 13 16l7.5 7.5" />
          <path d="M14 16h15" />
        </svg>
      </button>
      <div class="detail-media">
        <button
          v-if="activeDetailImage"
          class="detail-main-image-button"
          type="button"
          :aria-label="ui.previewImage || ui.closeDetail"
          @click="openImagePreview(activeDetailImage)"
          @wheel.prevent="handleDetailImageWheel"
        >
          <Transition name="detail-main-image-slide" mode="out-in">
            <span :key="activeDetailImage" class="detail-main-image-frame">
              <img
                class="detail-main-image"
                :src="activeDetailImage"
                :alt="activeProduct.displayName"
                :style="{ transform: `scale(${detailImageZoom})` }"
                @error="handleDetailImageError"
              />
            </span>
          </Transition>
        </button>
      </div>

      <div class="detail-copy">
        <h2>{{ activeProduct.displayName }}</h2>
        <div class="detail-meta">
          <span>{{ activeProductDisplayCode }}</span>
          <span aria-hidden="true">|</span>
          <span>{{ activeProduct.brand }}</span>
          <span aria-hidden="true">|</span>
          <button
            type="button"
            :aria-expanded="activeDetailDrawer === 'product'"
            @click="openDetailDrawer('product')"
          >
            {{ ui.productDetails }}
          </button>
        </div>

        <div
          v-if="activeProductGalleryImages.length > 1"
          ref="detailThumbs"
          class="detail-thumbs detail-thumbs--service"
        >
          <button
            v-if="activeProductGalleryImages.length > visibleDetailThumbCount"
            type="button"
            class="detail-thumb-nav detail-thumb-nav-prev"
            :aria-label="ui.prevImage"
            @click="showPreviousDetailThumbs"
          >
            <span aria-hidden="true">&lsaquo;</span>
          </button>
          <div class="detail-thumb-list">
            <button
              v-for="item in visibleDetailThumbItems"
              :key="`${activeProduct.code}-service-thumb-${item.index}`"
              type="button"
              class="detail-thumb"
              :class="{ active: activeDetailImage === item.image }"
              @click="selectDetailImage(item.image, item.index)"
            >
              <img :src="item.image" :alt="`${activeProduct.displayName} ${item.index + 1}`" />
            </button>
          </div>
          <button
            v-if="activeProductGalleryImages.length > visibleDetailThumbCount"
            type="button"
            class="detail-thumb-nav detail-thumb-nav-next"
            :aria-label="ui.nextImage"
            @click="showNextDetailThumbs"
          >
            <span aria-hidden="true">&rsaquo;</span>
          </button>
        </div>

        <div class="detail-service-menu" :aria-label="ui.serviceMenuAria">
          <div class="detail-service-item">
            <button
              type="button"
              :aria-expanded="activeDetailDrawer === 'size'"
              @click="openDetailDrawer('size')"
            >
              <span>{{ ui.sizeSelect }}</span>
              <i aria-hidden="true"></i>
            </button>
          </div>

          <div class="detail-service-item">
            <button
              type="button"
              :aria-expanded="activeDetailDrawer === 'quality'"
              @click="openDetailDrawer('quality')"
            >
              <span>{{ ui.qualityAssurance }}</span>
              <em>{{ ui.certificateIncluded }}</em>
              <i aria-hidden="true"></i>
            </button>
          </div>

          <div class="detail-contact-block">
            <p>{{ ui.questions }}</p>
            <div class="detail-contact-service">
              <span>
                <i class="detail-contact-icon detail-contact-icon--mark" aria-hidden="true"></i>
                {{ ui.call }} 13715011967
              </span>
              <button
                type="button"
                :aria-expanded="activeDetailDrawer === 'contact'"
                @click="openDetailDrawer('contact')"
              >
                <i class="detail-contact-icon detail-contact-icon--chat" aria-hidden="true"></i>
                {{ ui.consultUs }}
              </button>
            </div>
          </div>
        </div>

        <div class="detail-purchase-row">
          <div class="detail-price-copy">
            <strong>{{ formatPrice(activeProductPurchasePrice) }}</strong>
            <span v-if="activeProductIsPriceOnRequest">{{ ui.outOfStockConsult }}</span>
          </div>
          <button class="detail-cart-button" type="button" @click="addActiveProductToCart">
            {{ ui.addToCart }}
          </button>
        </div>

        <div class="detail-after-purchase">
          <button
            type="button"
            :aria-expanded="activeDetailDrawer === 'care'"
            @click="openDetailDrawer('care')"
          >
            <span>{{ ui.careRepair }}</span>
            <i aria-hidden="true"></i>
          </button>
        </div>

        <p v-if="activeProduct.displaySellingPoint">{{ activeProduct.displaySellingPoint }}</p>
      </div>

      <aside
        v-if="activeDetailDrawer"
        class="detail-spec-drawer"
        :class="{ 'detail-spec-drawer--goods': activeDetailDrawer === 'size' }"
        :aria-label="detailDrawerTitle"
      >
        <div
          class="detail-spec-drawer-head"
          :class="{ 'detail-spec-drawer-head--tabs': activeDetailDrawer === 'size' }"
        >
          <div
            v-if="activeDetailDrawer === 'size'"
            class="detail-drawer-tabs"
            role="tablist"
            :aria-label="ui.sizeOptionsAria"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="activeSizePanel === 'select'"
              :class="{ active: activeSizePanel === 'select' }"
              @click="activeSizePanel = 'select'"
            >
              {{ ui.sizeSelect }}
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="activeSizePanel === 'guide'"
              :class="{ active: activeSizePanel === 'guide' }"
              @click="activeSizePanel = 'guide'"
            >
              {{ ui.sizeGuide }}
            </button>
          </div>
          <h3 v-else>{{ detailDrawerTitle }}</h3>
          <button
            class="detail-spec-drawer-close"
            type="button"
            :aria-label="`${ui.close} ${detailDrawerTitle}`"
            @click="activeDetailDrawer = ''"
          >
            &times;
          </button>
        </div>

        <template v-if="activeDetailDrawer === 'product'">
          <p>{{ activeProduct.displayName }}</p>

          <dl v-if="activeProductCoreSpecs.length" class="detail-specs">
            <div
              v-for="item in activeProductCoreSpecs"
              :key="`${activeProduct.code}-${item.rawLabel}`"
            >
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </template>

        <template v-else-if="activeDetailDrawer === 'size'">
          <template v-if="activeSizePanel === 'select'">
            <p v-if="activeProductGoodsLoading">{{ ui.goodsLoading }}</p>
            <p v-else-if="activeProductGoodsLoadError">{{ ui.goodsLoadError }}</p>
            <p v-else-if="activeProductGoodsOptions.length">{{ ui.goodsPrompt }}</p>
            <div
              v-if="!activeProductGoodsLoading && activeProductGoodsOptions.length"
              class="detail-goods-options"
              role="group"
              :aria-label="ui.goodsOptionsAria"
            >
              <button
                v-for="item in activeProductGoodsOptions"
                :key="item.goodsNo"
                type="button"
                :class="{ active: draftSelectedGoodsNo === item.goodsNo }"
                @click="selectGoodsOption(item)"
              >
                <span>{{ ui.goodsNo }}</span>
                <span class="detail-goods-main">
                  <strong>{{ item.goodsNo }}</strong>
                  <em v-if="item.salesPrice">¥{{ item.salesPrice }}</em>
                </span>
                <small>
                  <b v-if="shouldShowHandSize(item.handSize)">{{ activeGoodsSizeLabel }}：{{ item.handSize }}</b>
                  <b>{{ ui.goodsWeight }} {{ item.goodsWeight || '-' }}</b>
                  <b>{{ ui.goldWeight }} {{ item.goldWeight || '-' }}</b>
                  <b>{{ ui.sideStoneWeight }} {{ item.sideStoneWeight || '-' }}</b>
                </small>
              </button>
            </div>
            <div
              v-if="!activeProductGoodsLoading && activeProductGoodsOptions.length"
              class="detail-goods-actions"
            >
              <button
                type="button"
                :disabled="!draftSelectedGoodsNo"
                @click="confirmSelectedGoodsOption"
              >
                {{ ui.confirm }}
              </button>
            </div>
            <p v-else-if="!activeProductGoodsLoading">{{ ui.noGoods }}</p>
          </template>
          <div v-else class="detail-size-guide-panel">
            <figure v-if="activeSizeGuide?.image">
              <img :src="activeSizeGuide.image" :alt="activeSizeGuide.alt" />
            </figure>
            <div v-else-if="activeSizeGuide?.sections?.length" class="detail-size-guide-notes">
              <section v-for="section in activeSizeGuide.sections" :key="section.title">
                <h4>{{ section.title }}</h4>
                <p v-for="item in section.items" :key="item">{{ item }}</p>
              </section>
            </div>
            <p v-else>{{ ui.noSizeGuide }}</p>
          </div>
        </template>

        <template v-else-if="activeDetailDrawer === 'contact'">
          <div class="detail-contact-drawer">
            <img src="/images/contact/wechat.jpg" :alt="ui.wechatQrAlt" />
            <div>
              <span>{{ ui.contactPhone }}</span>
              <strong>13715011967</strong>
              <p>{{ ui.contactBody }}</p>
            </div>
          </div>
        </template>

        <template v-else-if="activeDetailDrawer === 'quality'">
          <p>{{ ui.qualityBody1 }}</p>
          <p>{{ ui.qualityBody2 }}</p>
        </template>

        <template v-else-if="activeDetailDrawer === 'care'">
          <div class="detail-care-drawer">
            <img src="/images/size-guide/%E8%AF%A6%E6%83%85%E9%A1%B5_09.jpg" :alt="ui.careRepair" />
          </div>
        </template>
      </aside>

    </article>
  </div>

  <Teleport to="body">
    <div v-if="previewImage" class="image-preview-backdrop" @click.self="closeImagePreview">
      <article class="image-preview" role="dialog" aria-modal="true" :aria-label="ui.previewImage || ui.closeDetail">
        <div class="image-preview-tools">
          <button type="button" :aria-label="ui.zoomOut || '-'" @click="zoomPreviewImage(-0.25)">-</button>
          <button type="button" :aria-label="ui.resetZoom || '1:1'" @click="resetPreviewZoom">1:1</button>
          <button type="button" :aria-label="ui.zoomIn || '+'" @click="zoomPreviewImage(0.25)">+</button>
          <button type="button" :aria-label="ui.closeDetail" @click="closeImagePreview">&times;</button>
        </div>
        <img
          :src="previewImage"
          :alt="activeProduct?.displayName || ''"
          :style="{ transform: `scale(${previewZoom})` }"
          @wheel.prevent="handlePreviewWheel"
        />
      </article>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import KnowledgeFooter from '../components/KnowledgeFooter.vue'
import { useAuth } from '../composables/useAuth'
import { useCart } from '../composables/useCart'
import { useLocale } from '../composables/useLocale'
import { formatCurrencyFromCny } from '../utils/currency'
import {
  localizeFilterValue,
  localizeFreeText,
  localizeMaterial,
  localizeProductName,
  localizeProductType,
  localizeSeries,
  localizeSpecLabel,
  localizeSpecValue,
} from '../utils/productLocalization'

const allFilterKey = '__all__'
const ringFilterKey = '戒指'
const braceletFilterKey = '手链'
const necklaceFilterKey = '项链'
const pendantFilterKey = '吊坠'
const earringFilterKey = '耳饰'
const earringDropTypeValues = ['耳吊', '耳坠']
const earringTypes = ['耳饰', '耳钉', '耳圈', '耳线', ...earringDropTypeValues, '耳扣']
const earringSubtypeOptions = [
  { value: allFilterKey, label: '全部耳饰' },
  { value: '耳圈', label: '耳圈' },
  { value: '耳钉', label: '耳钉' },
  { value: '耳吊', label: '耳吊' },
]
const visibleDetailThumbCount = 4
const detailImageAutoSlideDelay = 3000
const LAST_CART_PRODUCT_STORAGE_KEY = 'dering-last-cart-product'
const detailGoodImages = Array.from(
  { length: 9 },
  (_, index) => `/images/good/%E8%AF%A6%E6%83%85%E9%A1%B5_${String(index + 1).padStart(2, '0')}.jpg`,
)
const productsPageSize = 28
const hiddenDetailSpecLabels = new Set([
  '系列',
  '石颜色',
  '实时库存',
  '达播价',
  '直播价',
  'Live Price',
  '标签价',
  'Tag Price',
  '佣金',
  '未出货数',
])
const hiddenDetailTexts = new Set(['送胶耳堵', 'Complimentary silicone backs'])
const route = useRoute()
const router = useRouter()
const { locale, currencyRegion } = useLocale()
const { currentUser } = useAuth()
const { addCartItem } = useCart()

const uiCopy = {
  zh: {
    heroKicker: 'Products',
    heroTitle: '产品展示',
    heroSummary: '戒指、项链、耳饰、手链与高级定制系列，全部改为数据库真实商品数据展示。',
    filterMenuAria: '产品筛选菜单',
    close: '关闭',
    searchProducts: '搜索产品',
    typeLabel: '饰品类型',
    priceLabel: '价格区间',
    seriesLabel: '系列',
    reset: '重置',
    submit: '提交筛选',
    moreLinksAria: '更多链接',
    contactLink: '联系我们',
    supportLink: '服务支持',
    storeLink: '门店信息',
    discoveryAria: '产品搜索与筛选',
    searchPlaceholder: '输入名称、品类、系列、款号或备注',
    search: '搜索',
    recommend: '为你推荐',
    menu: '菜单',
    loading: '正在加载产品数据...',
    loadError: '产品数据加载失败，请检查 API 接口或数据库连接。',
    empty: '暂无符合条件的产品',
    closeDetail: '关闭详情',
    previewImage: '查看大图',
    zoomIn: '放大图片',
    zoomOut: '缩小图片',
    resetZoom: '重置缩放',
    prevImage: '上一张图片',
    nextImage: '下一张图片',
    addToCart: '加入购物车',
    styleNo: '款号',
    all: '全部',
    priceOnRequest: '面议',
    outOfStockConsult: '暂时缺货，如有需要请咨询我们',
    priceUnder: (value) => `${value} 以下`,
    priceAbove: (value) => `${value} 以上`,
    materialLabel: '材质',
    stoneShapeLabel: '主石形状',
    mainStoneLabel: '主石大小',
    stoneColorLabel: '颜色',
    earringSubtypeLabel: '耳饰细分',
    allEarrings: '全部耳饰',
    productDetails: '产品详情',
    serviceMenuAria: '商品服务',
    sizeSelect: '尺寸选择',
    sizeGuide: '尺寸指南',
    sizeOptionsAria: '尺寸选项',
    qualityAssurance: '质量保证',
    certificateIncluded: '配有国检证书',
    questions: '有什么疑虑？',
    call: '致电',
    consultUs: '咨询我们',
    careRepair: '保养维修服务',
    goodsLoading: '正在加载同款货号...',
    goodsLoadError: '货号数据加载失败，请稍后重试。',
    goodsPrompt: '请选择同款款号下的具体货号，顾问可按货号进一步核对库存与证书。',
    goodsOptionsAria: '同款货号选择',
    goodsNo: '货号',
    handSize: '手寸',
    sizeValue: '尺寸',
    goodsWeight: '货重',
    goldWeight: '金重',
    sideStoneWeight: '辅石重',
    confirm: '确定',
    noGoods: '暂无同款货号数据，请联系客服确认库存。',
    noSizeGuide: '当前品类暂无尺寸指南，请联系客服确认尺寸。',
    wechatQrAlt: '微信二维码',
    contactPhone: '联系电话',
    contactBody: '可通过电话或扫码添加微信咨询尺寸、库存、定制与售后服务。',
    qualityBody1: '每件 DERING 作品均配有国检证书，可用于核验钻石、金属材质与作品信息。',
    qualityBody2: '如需查看证书信息或确认检测细节，可联系顾问协助核对。',
  },
  en: {
    heroKicker: 'Products',
    heroTitle: 'Product Showcase',
    heroSummary: 'Rings, necklaces, earrings, bracelets, and bespoke lines are now displayed with live database-backed product data.',
    filterMenuAria: 'Product filter menu',
    close: 'Close',
    searchProducts: 'Search products',
    typeLabel: 'Category',
    priceLabel: 'Price Range',
    seriesLabel: 'Collection',
    reset: 'Reset',
    submit: 'Apply Filters',
    moreLinksAria: 'More links',
    contactLink: 'Contact Us',
    supportLink: 'Support',
    storeLink: 'Store Info',
    discoveryAria: 'Product search and filters',
    searchPlaceholder: 'Search by name, category, collection, style number, or note',
    search: 'Search',
    recommend: 'Recommended for you',
    menu: 'Menu',
    loading: 'Loading product data...',
    loadError: 'Failed to load product data. Please check the API or database connection.',
    empty: 'No products match the current filters.',
    closeDetail: 'Close details',
    previewImage: 'Preview image',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetZoom: 'Reset zoom',
    prevImage: 'Previous image',
    nextImage: 'Next image',
    addToCart: 'Add to Bag',
    styleNo: 'Style No.',
    all: 'All',
    priceOnRequest: 'Price on request',
    outOfStockConsult: 'Temporarily out of stock. Please contact us if needed.',
    priceUnder: (value) => `Under ${value}`,
    priceAbove: (value) => `Above ${value}`,
    materialLabel: 'Metal',
    stoneShapeLabel: 'Center Stone Shape',
    mainStoneLabel: 'Center Stone Size',
    stoneColorLabel: 'Color',
    earringSubtypeLabel: 'Earring Type',
    allEarrings: 'All Earrings',
    productDetails: 'Product Details',
    serviceMenuAria: 'Product services',
    sizeSelect: 'Size Selection',
    sizeGuide: 'Size Guide',
    sizeOptionsAria: 'Size options',
    qualityAssurance: 'Quality Assurance',
    certificateIncluded: 'Certificate included',
    questions: 'Need help?',
    call: 'Call',
    consultUs: 'Contact Us',
    careRepair: 'Care & Repair Service',
    goodsLoading: 'Loading available item numbers...',
    goodsLoadError: 'Failed to load item data. Please try again later.',
    goodsPrompt: 'Select the exact item number for this style. Our consultant can use it to verify stock and certificate details.',
    goodsOptionsAria: 'Available item number selection',
    goodsNo: 'Item No.',
    handSize: 'Ring size',
    sizeValue: 'Size',
    goodsWeight: 'Total weight',
    goldWeight: 'Gold weight',
    sideStoneWeight: 'Side stone weight',
    confirm: 'Confirm',
    noGoods: 'No item data is available for this style. Please contact us to confirm stock.',
    noSizeGuide: 'No size guide is available for this category. Please contact us to confirm sizing.',
    wechatQrAlt: 'WeChat QR code',
    contactPhone: 'Phone',
    contactBody: 'Call us or scan the QR code to ask about sizing, stock, customization, and after-sales service.',
    qualityBody1: 'Every DERING piece includes a national inspection certificate for verifying diamond, metal, and product details.',
    qualityBody2: 'Contact our consultant if you need certificate information or help checking inspection details.',
  },
  ja: {
    heroKicker: 'Products',
    heroTitle: '商品一覧',
    heroSummary: 'リング、ネックレス、イヤーアクセサリー、ブレスレット、高級カスタムシリーズを実際の商品データで表示します。',
    filterMenuAria: '商品フィルターメニュー',
    close: '閉じる',
    searchProducts: '商品を検索',
    typeLabel: 'カテゴリー',
    priceLabel: '価格帯',
    seriesLabel: 'シリーズ',
    reset: 'リセット',
    submit: 'フィルターを適用',
    moreLinksAria: 'その他のリンク',
    contactLink: 'お問い合わせ',
    supportLink: 'サポート',
    storeLink: '店舗情報',
    discoveryAria: '商品検索とフィルター',
    searchPlaceholder: '名称、カテゴリー、シリーズ、品番、備考で検索',
    search: '検索',
    recommend: 'おすすめ',
    menu: 'メニュー',
    loading: '商品データを読み込み中...',
    loadError: '商品データの読み込みに失敗しました。',
    empty: '条件に一致する商品がありません',
    closeDetail: '詳細を閉じる',
    prevImage: '前の画像',
    nextImage: '次の画像',
    addToCart: 'カートに追加',
    styleNo: '品番',
    all: 'すべて',
    priceOnRequest: '価格はお問い合わせください',
    outOfStockConsult: '一時的に在庫切れです。必要な場合はお問い合わせください。',
    priceUnder: (value) => `${value} 以下`,
    priceAbove: (value) => `${value} 以上`,
  },
  th: {
    heroKicker: 'Products',
    heroTitle: 'สินค้า',
    heroSummary: 'แสดงแหวน สร้อยคอ ต่างหู สร้อยข้อมือ และคอลเลกชันสั่งทำพิเศษด้วยข้อมูลสินค้าจริง',
    filterMenuAria: 'เมนูตัวกรองสินค้า',
    close: 'ปิด',
    searchProducts: 'ค้นหาสินค้า',
    typeLabel: 'หมวดหมู่',
    priceLabel: 'ช่วงราคา',
    seriesLabel: 'คอลเลกชัน',
    reset: 'รีเซ็ต',
    submit: 'ใช้ตัวกรอง',
    moreLinksAria: 'ลิงก์เพิ่มเติม',
    contactLink: 'ติดต่อเรา',
    supportLink: 'บริการช่วยเหลือ',
    storeLink: 'ข้อมูลร้าน',
    discoveryAria: 'ค้นหาและกรองสินค้า',
    searchPlaceholder: 'ค้นหาจากชื่อ หมวดหมู่ คอลเลกชัน รหัสสินค้า หรือหมายเหตุ',
    search: 'ค้นหา',
    recommend: 'แนะนำสำหรับคุณ',
    menu: 'เมนู',
    loading: 'กำลังโหลดข้อมูลสินค้า...',
    loadError: 'โหลดข้อมูลสินค้าไม่สำเร็จ',
    empty: 'ไม่พบสินค้าที่ตรงกับเงื่อนไข',
    closeDetail: 'ปิดรายละเอียด',
    prevImage: 'รูปก่อนหน้า',
    nextImage: 'รูปถัดไป',
    addToCart: 'เพิ่มลงตะกร้า',
    styleNo: 'รหัสสินค้า',
    all: 'ทั้งหมด',
    priceOnRequest: 'สอบถามราคา',
    outOfStockConsult: 'สินค้าหมดชั่วคราว โปรดติดต่อเราหากต้องการ',
    priceUnder: (value) => `ต่ำกว่า ${value}`,
    priceAbove: (value) => `มากกว่า ${value}`,
  },
  ko: {
    heroKicker: 'Products',
    heroTitle: '제품 보기',
    heroSummary: '반지, 목걸이, 귀걸이, 팔찌 및 고급 맞춤 컬렉션을 실제 상품 데이터로 표시합니다.',
    filterMenuAria: '제품 필터 메뉴',
    close: '닫기',
    searchProducts: '제품 검색',
    typeLabel: '카테고리',
    priceLabel: '가격대',
    seriesLabel: '컬렉션',
    reset: '초기화',
    submit: '필터 적용',
    moreLinksAria: '추가 링크',
    contactLink: '문의하기',
    supportLink: '서비스 지원',
    storeLink: '매장 정보',
    discoveryAria: '제품 검색 및 필터',
    searchPlaceholder: '이름, 카테고리, 컬렉션, 스타일 번호 또는 메모 검색',
    search: '검색',
    recommend: '추천 상품',
    menu: '메뉴',
    loading: '제품 데이터를 불러오는 중...',
    loadError: '제품 데이터를 불러오지 못했습니다.',
    empty: '조건에 맞는 제품이 없습니다',
    closeDetail: '상세 닫기',
    prevImage: '이전 이미지',
    nextImage: '다음 이미지',
    addToCart: '장바구니에 추가',
    styleNo: '스타일 번호',
    all: '전체',
    priceOnRequest: '가격 문의',
    outOfStockConsult: '일시 품절입니다. 필요하시면 문의해 주세요.',
    priceUnder: (value) => `${value} 이하`,
    priceAbove: (value) => `${value} 이상`,
  },
  vi: {
    heroKicker: 'Products',
    heroTitle: 'Sản phẩm',
    heroSummary: 'Hiển thị nhẫn, dây chuyền, hoa tai, vòng tay và các dòng đặt riêng bằng dữ liệu sản phẩm thực.',
    filterMenuAria: 'Menu lọc sản phẩm',
    close: 'Đóng',
    searchProducts: 'Tìm sản phẩm',
    typeLabel: 'Danh mục',
    priceLabel: 'Khoảng giá',
    seriesLabel: 'Bộ sưu tập',
    reset: 'Đặt lại',
    submit: 'Áp dụng bộ lọc',
    moreLinksAria: 'Liên kết khác',
    contactLink: 'Liên hệ',
    supportLink: 'Hỗ trợ',
    storeLink: 'Thông tin cửa hàng',
    discoveryAria: 'Tìm kiếm và lọc sản phẩm',
    searchPlaceholder: 'Tìm theo tên, danh mục, bộ sưu tập, mã kiểu hoặc ghi chú',
    search: 'Tìm kiếm',
    recommend: 'Gợi ý cho bạn',
    menu: 'Menu',
    loading: 'Đang tải dữ liệu sản phẩm...',
    loadError: 'Không tải được dữ liệu sản phẩm.',
    empty: 'Không có sản phẩm phù hợp',
    closeDetail: 'Đóng chi tiết',
    prevImage: 'Ảnh trước',
    nextImage: 'Ảnh tiếp theo',
    addToCart: 'Them vao gio hang',
    styleNo: 'Mã kiểu',
    all: 'Tất cả',
    priceOnRequest: 'Liên hệ để biết giá',
    outOfStockConsult: 'Tạm hết hàng. Vui lòng liên hệ nếu bạn cần.',
    priceUnder: (value) => `Dưới ${value}`,
    priceAbove: (value) => `Trên ${value}`,
  },
}

const ui = computed(() => uiCopy[locale.value] ?? uiCopy.zh)

const languageAwareLocale = computed(() => (uiCopy[locale.value] ? locale.value : 'zh'))

const breadcrumbCopies = {
  zh: { aria: '面包屑导航', home: '主页', products: '产品' },
  en: { aria: 'Breadcrumb', home: 'Home', products: 'Products' },
  ja: { aria: 'パンくずリスト', home: 'ホーム', products: '商品' },
  th: { aria: 'เบรดครัมบ์', home: 'หน้าแรก', products: 'สินค้า' },
  ko: { aria: '탐색 경로', home: '홈', products: '제품' },
  vi: { aria: 'Dieu huong', home: 'Trang chu', products: 'San pham' },
}

const categoryHeroCopy = {
  ring: {
    title: {
      zh: '戒指',
      en: 'Rings',
      ja: 'リング',
      th: 'แหวน',
      ko: '반지',
      vi: 'Nhan',
    },
    text: {
      zh: '以生活日常与人生纪念为创作灵感，我们雕琢多款戒指臻品。简约单钻纯粹大气，于方寸指尖演绎独属于你的优雅光芒，见证爱意、仪式与岁岁日常。',
      en: 'Designed for everyday wear and meaningful moments, our rings range from classic solitaires to refined diamond settings.',
      ja: '日常使いから特別な瞬間まで、クラシックな一粒石から繊細なセッティングまで揃えました。',
      th: 'แหวนสำหรับทุกวันและช่วงเวลาสำคัญ ตั้งแต่ดีไซน์เม็ดเดี่ยวคลาสสิกไปจนถึงงานฝังเพชรที่ประณีต',
      ko: '일상 착용과 특별한 순간을 위해 클래식 솔리테어부터 섬세한 다이아몬드 세팅까지 제안합니다.',
      vi: 'Nhung mau nhan cho moi ngay va cac khoanh khac y nghia, tu vien da co dien den thiet ke dinh kim cuong tinh te.',
    },
    alt: {
      zh: '戒指系列主图',
      en: 'Rings collection image',
      ja: 'リングコレクション画像',
      th: 'ภาพคอลเลกชันแหวน',
      ko: '반지 컬렉션 이미지',
      vi: 'Hinh anh bo suu tap nhan',
    },
  },
  bracelet: {
    title: {
      zh: '手链',
      en: 'Bracelets',
      ja: 'ブレスレット',
      th: 'สร้อยข้อมือ',
      ko: '팔찌',
      vi: 'Vong tay',
    },
    text: {
      zh: '灵感源于日常细碎美好与珍贵纪念，雕琢多款腕间珠宝。连贯排钻自带大气华丽质感，细巧单链低调温柔，轻松适配休闲、正装各类造型。',
      en: 'Bracelets follow the wrist with refined proportions, bringing subtle brilliance from delicate chains to diamond-set designs.',
      ja: '手元に沿う繊細なバランスで、シンプルなチェーンからダイヤモンドセッティングまで日常に輝きを添えます。',
      th: 'สร้อยข้อมือออกแบบให้รับกับข้อมืออย่างประณีต ตั้งแต่เส้นเรียบง่ายไปจนถึงดีไซน์ฝังเพชร',
      ko: '손목 라인을 따라 흐르는 섬세한 비율로, 간결한 체인부터 다이아몬드 세팅까지 일상에 빛을 더합니다.',
      vi: 'Vong tay om theo co tay voi ti le thanh lich, tu day manh den thiet ke dinh kim cuong deu de deo hang ngay.',
    },
    alt: {
      zh: '手链系列主图',
      en: 'Bracelets collection image',
      ja: 'ブレスレットコレクション画像',
      th: 'ภาพคอลเลกชันสร้อยข้อมือ',
      ko: '팔찌 컬렉션 이미지',
      vi: 'Hinh anh bo suu tap vong tay',
    },
  },
  necklace: {
    title: {
      zh: '项链',
      en: 'Necklaces',
      ja: 'ネックレス',
      th: 'สร้อยคอ',
      ko: '목걸이',
      vi: 'Day chuyen',
    },
    text: {
      zh: '以优雅与仪式感为创作内核，打造多元项链臻品。极简素链低调内敛，满钻重工款璀璨夺目，无论日常穿搭或是重要晚宴，都能流露独一份的精致格调。',
      en: 'Necklaces frame the neckline with balanced drops, connecting stones, chains, and collarbone lines for polished styling.',
      ja: '首元のラインを美しく見せるバランスで、石、チェーン、鎖骨のラインが自然に響き合います。',
      th: 'สร้อยคอเน้นสัดส่วนที่รับกับลำคอ ให้ตัวเรือน โซ่ และเส้นไหปลาร้าดูสมดุล',
      ko: '목선에 어울리는 드롭 밸런스로 스톤, 체인, 쇄골 라인이 자연스럽게 어우러집니다.',
      vi: 'Day chuyen tao diem nhan cho vung co voi do roi can bang, ket noi vien da, soi day va duong xuong quai xanh.',
    },
    alt: {
      zh: '项链系列主图',
      en: 'Necklaces collection image',
      ja: 'ネックレスコレクション画像',
      th: 'ภาพคอลเลกชันสร้อยคอ',
      ko: '목걸이 컬렉션 이미지',
      vi: 'Hinh anh bo suu tap day chuyen',
    },
  },
  pendant: {
    title: {
      zh: '吊坠',
      en: 'Pendants',
      ja: 'ペンダント',
      th: 'จี้',
      ko: '펜던트',
      vi: 'Mat day',
    },
    text: {
      zh: '以爱意与日常温柔为创作内核，雕琢多款吊坠臻品。利落极简款适配通勤，重工彩宝款饱含仪式感，可单戴可叠搭，随身珍藏每一份心动与纪念。',
      en: 'Pendants carry the stone with refined proportions, bringing a polished focal point to everyday chains and meaningful gifts.',
      ja: 'ペンダントは繊細なバランスで石の輝きを引き立て、日常のチェーンにもギフトにも上品な印象を添えます。',
      th: 'จี้ออกแบบด้วยสัดส่วนประณีต ช่วยขับประกายของเม็ดหลักให้เป็นจุดเด่นสำหรับทุกวันและของขวัญ',
      ko: '펜던트는 정교한 비율로 스톤의 빛을 담아 데일리 체인과 선물 스타일링에 세련된 포인트를 더합니다.',
      vi: 'Mat day ton len anh sang cua vien chu voi ti le tinh te, phu hop deo hang ngay va lam qua tang y nghia.',
    },
    alt: {
      zh: '吊坠系列主图',
      en: 'Pendants collection image',
      ja: 'ペンダントコレクション画像',
      th: 'ภาพคอลเลกชันจี้',
      ko: '펜던트 컬렉션 이미지',
      vi: 'Hinh anh bo suu tap mat day',
    },
  },
  earrings: {
    title: {
      zh: '耳饰',
      en: 'Earrings',
      ja: 'イヤーアクセ',
      th: 'ต่างหู',
      ko: '귀걸이',
      vi: 'Hoa tai',
    },
    text: {
      zh: '撷取日常美好与仪式时刻为灵感，打造多款耳畔臻品。极简单钻干净耐看，重工彩宝群镶华贵动人，无论休闲穿搭或是隆重场合，都能衬出独一份精致气质。',
      en: 'From clean studs to fluid threaders, hoops, and cuffs, our earrings frame the face with refined sparkle for everyday and occasion styling.',
      ja: 'シンプルなスタッドからチェーン、フープ、イヤーカフまで、顔まわりに繊細な輝きを添えます。',
      th: 'ตั้งแต่ต่างหูเม็ดเดี่ยว ต่างหูสาย ต่างหูห่วง ไปจนถึงเอียร์คัฟ ทุกชิ้นช่วยขับกรอบหน้าให้ดูประณีต',
      ko: '심플한 스터드부터 체인, 후프, 이어커프까지 얼굴선을 섬세하게 밝혀 주는 이어링 컬렉션입니다.',
      vi: 'Tu hoa tai dinh den dang day, vong va kep tai, bo suu tap tao diem sang tinh te cho khuon mat.',
    },
    alt: {
      zh: '耳饰系列主图',
      en: 'Earrings collection image',
      ja: 'イヤーアクセコレクション画像',
      th: 'ภาพคอลเลกชันต่างหู',
      ko: '귀걸이 컬렉션 이미지',
      vi: 'Hinh anh bo suu tap hoa tai',
    },
  },
}

const categoryHeroImages = {
  ring: '/images/product/rings/1.jpg',
  bracelet: '/images/product/bracelets/APYB0006-W-30(1).png',
  necklace: '/images/product/necklaces/03fbdeb5-250b-47c8-86d4-4483c6dfdebe.png',
  pendant: '/images/product/pendants/1781603252_1ed77c707cf6a9dd4cca69453f13bf3e.png',
  earrings: '/images/product/earrings/APYE0219_W_50_ref_b3_western_model_4k_1.png',
}

const breadcrumbCopy = computed(() => breadcrumbCopies[languageAwareLocale.value] || breadcrumbCopies.zh)

const categoryHero = computed(() => {
  const categoryKey = getCategoryKeyForType(selectedType.value)
  if (!categoryKey) {
    return null
  }

  const activeLocale = languageAwareLocale.value
  const hero = categoryHeroCopy[categoryKey]

  return {
    image: categoryHeroImages[categoryKey] || '',
    title: hero.title[activeLocale] || hero.title.zh,
    text: hero.text[activeLocale] || hero.text.zh,
    alt: hero.alt[activeLocale] || hero.alt.zh,
  }
})

const priceRanges = computed(() => [
  { id: allFilterKey, label: ui.value.all },
  { id: 'under-2000', label: priceRangeLabel(0, 1999, 'under'), min: 0, max: 1999 },
  { id: '2000-5000', label: priceRangeLabel(2000, 5000), min: 2000, max: 5000 },
  { id: '5001-10000', label: priceRangeLabel(5001, 10000), min: 5001, max: 10000 },
  { id: 'above-10000', label: priceRangeLabel(10001, Infinity, 'above'), min: 10001, max: Infinity },
])

const products = ref([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const loadError = ref(false)
const productsPage = ref(0)
const productsHasMore = ref(false)
const productsTotal = ref(0)
const visibleProductLimit = ref(productsPageSize)
const searchQuery = ref('')
const selectedType = ref(allFilterKey)
const selectedEarringSubtype = ref(allFilterKey)
const selectedPrice = ref(allFilterKey)
const selectedSeries = ref(allFilterKey)
const selectedMaterial = ref(allFilterKey)
const selectedStoneShape = ref(allFilterKey)
const selectedMainStone = ref(allFilterKey)
const selectedStoneColor = ref(allFilterKey)
const looseStoneFilters = ref({ ...looseStoneDefaultFilters })
const draftType = ref(allFilterKey)
const draftEarringSubtype = ref(allFilterKey)
const draftPrice = ref(allFilterKey)
const draftSeries = ref(allFilterKey)
const draftMaterial = ref(allFilterKey)
const draftStoneShape = ref(allFilterKey)
const draftMainStone = ref(allFilterKey)
const draftStoneColor = ref(allFilterKey)
const showFilterPanel = ref(false)
const activeFilterModule = ref('type')
const activeProductCode = ref('')
const activeDetailImage = ref('')
const detailThumbStartIndex = ref(0)
const detailThumbs = ref(null)
const productSection = ref(null)
const hoveredProductCode = ref('')
const activeDetailDrawer = ref('')
const activeSizePanel = ref('select')
const selectedGoodsNo = ref('')
const draftSelectedGoodsNo = ref('')
const activeProductGoodsByStyleNo = ref({})
const activeProductGoodsLoading = ref(false)
const activeProductGoodsLoadError = ref(false)
const detailImageZoom = ref(1)
const previewImage = ref('')
const previewZoom = ref(1)
const brokenProductImageCodes = ref(new Set())
let detailImageAutoSlideTimer = 0

const filterTypes = computed(() => {
  return [
    allFilterKey,
    braceletFilterKey,
    earringFilterKey,
    ringFilterKey,
    necklaceFilterKey,
    pendantFilterKey,
  ]
})

const filterSeries = computed(() => {
  return [allFilterKey, ...new Set(products.value.map((product) => product.series).filter(Boolean))]
})

const filterMaterials = computed(() => {
  return [allFilterKey, ...getUniqueProductValues((product) => product.material)]
})

const filterStoneShapes = computed(() => {
  return [allFilterKey, ...getUniqueProductValues((product) => getProductSpecValue(product, ['石形状']))]
})

const filterMainStones = computed(() => {
  return [allFilterKey, ...getUniqueProductValues((product) => getProductSpecValue(product, ['主石']))]
})

const filterStoneColors = computed(() => {
  return [allFilterKey, ...getUniqueProductValues((product) => normalizeStoneColor(getProductSpecValue(product, ['石颜色'])))]
})

const filterModules = computed(() => [
  {
    id: 'type',
    label: ui.value.typeLabel,
    value: draftType.value,
    summary: getFilterSummary(draftType.value, displayType),
    options: filterTypes.value.map((value) => ({ value, label: displayType(value) })),
    child:
      draftType.value === earringFilterKey
        ? {
            id: 'earringSubtype',
            label: ui.value.earringSubtypeLabel,
            value: draftEarringSubtype.value,
            options: earringSubtypeOptions.map((option) => ({
              value: option.value,
              label: displayEarringSubtype(option.value),
            })),
          }
        : null,
  },
  {
    id: 'material',
    label: ui.value.materialLabel,
    value: draftMaterial.value,
    summary: getFilterSummary(draftMaterial.value, displayMaterialFilterValue),
    options: filterMaterials.value.map((value) => ({ value, label: displayMaterialFilterValue(value) })),
  },
  {
    id: 'stoneShape',
    label: ui.value.stoneShapeLabel,
    value: draftStoneShape.value,
    summary: getFilterSummary(draftStoneShape.value, displayFilterValue),
    options: filterStoneShapes.value.map((value) => ({ value, label: displayFilterValue(value) })),
  },
  {
    id: 'mainStone',
    label: ui.value.mainStoneLabel,
    value: draftMainStone.value,
    summary: getFilterSummary(draftMainStone.value, displayFilterValue),
    options: filterMainStones.value.map((value) => ({ value, label: displayFilterValue(value) })),
  },
  {
    id: 'series',
    label: ui.value.seriesLabel,
    value: draftSeries.value,
    summary: getFilterSummary(draftSeries.value, displaySeries),
    options: filterSeries.value.map((value) => ({ value, label: displaySeries(value) })),
  },
  {
    id: 'price',
    label: ui.value.priceLabel,
    value: draftPrice.value,
    summary: getFilterSummary(draftPrice.value, displayPriceFilterValue),
    options: priceRanges.value.map((range) => ({ value: range.id, label: displayPriceRange(range) })),
  },
  {
    id: 'stoneColor',
    label: ui.value.stoneColorLabel,
    value: draftStoneColor.value,
    summary: getFilterSummary(draftStoneColor.value, displayFilterValue),
    options: filterStoneColors.value.map((value) => ({ value, label: displayFilterValue(value) })),
  },
])

const normalizedSearch = computed(() => searchQuery.value.trim().toLowerCase())

const localizedProducts = computed(() => {
  const activeLocale = languageAwareLocale.value

  return products.value.map((product) => {
    const displayName = localizeProductName(product.name, activeLocale)
    const displayType = localizeProductType(product.type, activeLocale)
    const displaySeries = localizeSeries(product.series, activeLocale)
    const displayMaterial = localizeMaterial(product.material, activeLocale)
    const displayNote = localizeFreeText(product.note, activeLocale)
    const displaySellingPoint = localizeFreeText(product.sellingPoint, activeLocale)
    const displayGuaranteeLines = (product.guaranteeLines ?? []).map((line) =>
      localizeFreeText(line, activeLocale),
    )
    const localizedRemark = localizeFreeText(product.remark, activeLocale)
    const displayRemark = hiddenDetailTexts.has(localizedRemark) ? '' : localizedRemark
    const displaySpecs = (product.specs ?? [])
      .map((item) => ({
        rawLabel: item.label,
        label: localizeSpecLabel(item.label, activeLocale),
        value: localizeSpecValue(item.label, item.value, activeLocale),
      }))
      .filter((item) => {
        if (!item.rawLabel) {
          return false
        }

        return !hiddenDetailSpecLabels.has(item.rawLabel) && !hiddenDetailSpecLabels.has(item.label)
      })

    return {
      ...product,
      displayName,
      displayType,
      displaySeries,
      displayMaterial,
      displayNote,
      displaySellingPoint,
      displayGuaranteeLines,
      displayRemark,
      displaySpecs,
    }
  })
})

const searchedProducts = computed(() => {
  if (!normalizedSearch.value) {
    return localizedProducts.value
  }

  return localizedProducts.value.filter((product) => searchText(product).includes(normalizedSearch.value))
})

const recommendedProducts = computed(() => searchedProducts.value.slice(0, 4))

const filteredProducts = computed(() => {
  const priceRange = priceRanges.value.find((range) => range.id === selectedPrice.value) ?? priceRanges.value[0]

  return searchedProducts.value.filter((product) => {
    const matchesType =
      selectedType.value === allFilterKey ||
      isProductMatchingSelectedType(product.type, selectedType.value)
    const matchesEarringSubtype =
      selectedType.value !== earringFilterKey ||
      isProductMatchingEarringSubtype(product.type, selectedEarringSubtype.value)
    const matchesSeries = selectedSeries.value === allFilterKey || product.series === selectedSeries.value
    const matchesMaterial = selectedMaterial.value === allFilterKey || product.material === selectedMaterial.value
    const matchesStoneShape =
      selectedStoneShape.value === allFilterKey ||
      getProductSpecValue(product, ['石形状']) === selectedStoneShape.value
    const matchesMainStone =
      selectedMainStone.value === allFilterKey ||
      getProductSpecValue(product, ['主石']) === selectedMainStone.value
    const matchesStoneColor =
      selectedStoneColor.value === allFilterKey ||
      normalizeStoneColor(getProductSpecValue(product, ['石颜色'])) === selectedStoneColor.value
    const price = Number(product.price ?? 0)
    const matchesPrice =
      selectedPrice.value === allFilterKey || (price >= priceRange.min && price <= priceRange.max)

    return (
      matchesType &&
      matchesEarringSubtype &&
      matchesSeries &&
      matchesMaterial &&
      matchesStoneShape &&
      matchesMainStone &&
      matchesStoneColor &&
      matchesPrice
    )
  })
})

const displayableProducts = computed(() => {
  return filteredProducts.value
    .filter((product) => displayProductCardImage(product) && !brokenProductImageCodes.value.has(product.code))
})

const visibleProducts = computed(() => displayableProducts.value.slice(0, visibleProductLimit.value))

const canLoadMoreProducts = computed(() => {
  return displayableProducts.value.length > visibleProductLimit.value || productsHasMore.value
})

const loadMoreLabel = computed(() => {
  const labels = {
    zh: '查看更多',
    en: 'Load More',
    ja: 'もっと見る',
    th: 'ดูเพิ่มเติม',
    ko: '더 보기',
    vi: 'Xem thêm',
  }

  return labels[languageAwareLocale.value] || labels.zh
})

const loadMoreLoadingLabel = computed(() => {
  const labels = {
    zh: '正在加载...',
    en: 'Loading...',
    ja: '読み込み中...',
    th: 'กำลังโหลด...',
    ko: '불러오는 중...',
    vi: 'Đang tải...',
  }

  return labels[languageAwareLocale.value] || labels.zh
})

const activeFilterCount = computed(() => {
  const regularFilterCount = [
    selectedType.value,
    selectedEarringSubtype.value,
    selectedMaterial.value,
    selectedStoneShape.value,
    selectedMainStone.value,
    selectedSeries.value,
    selectedPrice.value,
    selectedStoneColor.value,
  ].filter((value) => value !== allFilterKey).length

  return regularFilterCount
})

const activeProduct = computed(() => {
  return localizedProducts.value.find((product) => product.code === activeProductCode.value) ?? null
})

const activeProductGoodsOptions = computed(() => {
  const styleNo = activeProduct.value?.styleNo || activeProduct.value?.code
  if (!styleNo) {
    return []
  }

  return activeProductGoodsByStyleNo.value[styleNo] ?? []
})

const selectedGoodsItem = computed(() => {
  if (!selectedGoodsNo.value) {
    return null
  }

  return activeProductGoodsOptions.value.find((item) => item.goodsNo === selectedGoodsNo.value) ?? null
})

const activeProductPurchasePrice = computed(() => {
  const goodsPrice = parsePositiveNumber(selectedGoodsItem.value?.salesPrice)
  if (goodsPrice !== null) {
    return goodsPrice
  }

  return activeProduct.value?.price
})

const activeProductIsPriceOnRequest = computed(() => parsePositiveNumber(activeProductPurchasePrice.value) === null)

const activeProductDisplayCode = computed(() => {
  return selectedGoodsItem.value?.goodsNo || activeProduct.value?.code || ''
})

const activeGoodsSizeLabel = computed(() => {
  const type = activeProduct.value?.type || ''
  return isNecklaceType(type) ? (ui.value.sizeValue || '尺寸') : (ui.value.handSize || '手寸')
})

const activeSizeGuide = computed(() => {
  const type = activeProduct.value?.type || ''
  const isEnglish = languageAwareLocale.value === 'en'
  if (isRingType(type)) {
    return {
      alt: isEnglish ? 'Ring size guide' : '戒指尺寸指南',
      image: '/images/size-guide/%E8%AF%A6%E6%83%85%E9%A1%B5_08.jpg',
    }
  }

  if (isNecklaceType(type)) {
    return {
      alt: isEnglish ? 'Necklace size guide' : '项链尺寸指南',
      image: '/images/size-guide/%E8%AF%A6%E6%83%85%E9%A1%B5_07.jpg',
    }
  }

  if (isPendantType(type)) {
    if (isEnglish) {
      return {
        sections: [
          {
            title: 'Chain Length',
            items: [
              '40-42 cm sits close to the collarbone and works well for petite pendants and everyday wear.',
              '43-45 cm is the most common length, with a natural position for most pendants.',
              '46-50 cm creates a lower drop, suitable for layering, lower necklines, or stronger pendant silhouettes.',
            ],
          },
          {
            title: 'Pendant Proportion',
            items: [
              'Larger pendants can sit better on a slightly longer chain so the piece does not feel too high.',
              'Small pendants pair well with shorter chains, keeping the diamond or center stone near the collarbone.',
              'For heavier pendants, choose a chain style with more stable support.',
            ],
          },
          {
            title: 'Styling Notes',
            items: [
              'For shirts, knitwear, or crew neck tops, 43-45 cm is usually the safest choice.',
              'For layering, leave 4-6 cm between two chains so the spacing looks clear.',
              'Contact our consultant if you want help judging the on-body position by height, neck size, and pendant size.',
            ],
          },
        ],
      }
    }

    return {
      sections: [
        {
          title: '链长选择',
          items: [
            '40-42cm 贴近锁骨，适合小巧吊坠和日常通勤。',
            '43-45cm 是最常用长度，位置自然，适合大多数吊坠。',
            '46-50cm 垂落感更明显，适合叠戴、低领造型或存在感更强的吊坠。',
          ],
        },
        {
          title: '吊坠比例',
          items: [
            '吊坠越大，链长可以适当放长，避免坠饰贴得太高。',
            '细小吊坠适合短链，能让钻石或主石更靠近锁骨线。',
            '如果吊坠本身较重，建议选择承重更稳定的链型。',
          ],
        },
        {
          title: '佩戴建议',
          items: [
            '搭配衬衫、针织或圆领上衣时，43-45cm 通常最稳妥。',
            '需要叠戴时，可让两条链相差 4-6cm，层次会更清楚。',
            '如需确认上身位置，可联系顾问按身高、颈围和吊坠尺寸协助判断。',
          ],
        },
      ],
    }
  }

  if (isBraceletType(type)) {
    if (isEnglish) {
      return {
        sections: [
          {
            title: 'How to Measure',
            items: [
              'Wrap a soft measuring tape around the narrowest part of your wrist. Keep it close to the skin without tightening.',
              'If you do not have a tape, mark a strip of paper or string around your wrist, then measure it with a ruler.',
              'Left and right wrists can differ slightly, so measure the wrist you plan to wear it on.',
            ],
          },
          {
            title: 'Fit Reference',
            items: [
              'Snug fit: add about 0.5-1 cm to your wrist measurement.',
              'Natural movement: add about 1-1.5 cm to your wrist measurement.',
              'Relaxed drape: add about 1.5-2 cm to your wrist measurement.',
            ],
          },
          {
            title: 'Style Notes',
            items: [
              'Tennis bracelets, rigid structures, and wider bracelets leave less movement room, so avoid choosing too tight.',
              'Fine chain bracelets feel lighter and more natural with a little ease, but too much room may cause flipping.',
              'If there is an extender chain, start with the middle fastening point and adjust to the most comfortable position.',
            ],
          },
        ],
      }
    }

    return {
      sections: [
        {
          title: '测量方式',
          items: [
            '用软尺绕手腕最细处一圈，贴合但不要勒紧，读出腕围。',
            '没有软尺时，可用纸条或细绳绕腕一圈做标记，再用直尺测量长度。',
            '左右手腕围可能略有差异，建议以实际佩戴那只手为准。',
          ],
        },
        {
          title: '松紧参考',
          items: [
            '喜欢贴手佩戴：腕围基础上增加约 0.5-1cm。',
            '喜欢自然活动空间：腕围基础上增加约 1-1.5cm。',
            '喜欢松弛垂坠感：腕围基础上增加约 1.5-2cm。',
          ],
        },
        {
          title: '款式提醒',
          items: [
            '排钻手链、硬挺结构和宽版手链活动空间较小，建议不要选得过紧。',
            '细链款更轻盈，略松一些会更自然，但过松容易翻转。',
            '如有延长链，可优先选择中间扣位试戴，再微调到舒适位置。',
          ],
        },
      ],
    }
  }

  if (isEarringType(type)) {
    if (isEnglish) {
      return {
        sections: [
          {
            title: 'Stud Earrings',
            items: [
              'Studs usually do not require a size selection. Focus on single-piece dimensions, wearing weight, and back stability.',
              'For everyday wear, lighter styles are generally more comfortable over long periods.',
              'If your earlobe is thin, the piercing sits low, or earrings tilt forward easily, choose a steadier back structure.',
            ],
          },
          {
            title: 'Hoops and Drops',
            items: [
              'For hoops, check the diameter: smaller hoops sit closer to the ear, while larger hoops create a stronger look.',
              'For drop earrings and threaders, check the drop length and consider face shape, hairstyle, and occasion.',
              'Long earrings suit evening or styling-focused occasions; for daily wear, lighter and shorter pieces are easier.',
            ],
          },
          {
            title: 'Wearing Notes',
            items: [
              'If your ears are sensitive, confirm the metal material and post thickness first.',
              'If the two piercings sit at different heights, drop styles can make the difference more visible.',
              'When wearing a set, let either the earrings or necklace be the main focus so the overall look stays clean.',
            ],
          },
        ],
      }
    }

    return {
      sections: [
        {
          title: '耳钉',
          items: [
            '耳钉通常无需选择圈号，重点看单只尺寸、佩戴重量和耳堵稳定性。',
            '日常通勤建议选择轻量款，佩戴时间更长也更舒适。',
            '耳垂较薄、耳洞较低或容易前倾时，建议选择贴耳更稳的耳堵结构。',
          ],
        },
        {
          title: '耳圈与耳吊',
          items: [
            '耳圈主要确认直径，越小越贴耳，越大越有造型感。',
            '耳吊、耳线主要确认垂坠长度，建议结合脸型、发型和使用场景选择。',
            '长款耳饰更适合晚宴或造型场合，日常佩戴可优先选择轻量短款。',
          ],
        },
        {
          title: '佩戴建议',
          items: [
            '如果耳洞较敏感，建议优先确认金属材质和耳针粗细。',
            '左右耳洞高度不一致时，垂坠款视觉差异会更明显，可先咨询顾问。',
            '成套佩戴时，可让耳饰和项链只保留一个视觉重点，整体更干净。',
          ],
        },
      ],
    }
  }

  return null
})

const detailDrawerTitle = computed(() => {
  const titles = {
    product: ui.value.productDetails,
    size: ui.value.sizeSelect,
    contact: ui.value.consultUs,
    quality: ui.value.qualityAssurance,
    care: ui.value.careRepair,
  }

  return titles[activeDetailDrawer.value] ?? ''
})

const coreDetailSpecLabels = new Set([
  '品类',
  '金属材质',
  '总重',
  '主石',
  '副石',
  '鍝佺被',
  '閲戝睘鏉愯川',
  '鎬婚噸',
  '涓荤煶',
  '鍓煶',
  'Category',
  'Metal',
  'Total Weight',
  'Center Stone',
  'Side Stone',
])

const activeProductCoreSpecs = computed(() => {
  if (!activeProduct.value) {
    return []
  }

  return activeProduct.value.displaySpecs.filter((item) => {
    const isCoreSpec = coreDetailSpecLabels.has(item.rawLabel) || coreDetailSpecLabels.has(item.label)
    if (!isCoreSpec) {
      return false
    }

    const isTotalWeight =
      item.rawLabel === '总重' ||
      item.rawLabel === '鎬婚噸' ||
      item.rawLabel === 'Total Weight' ||
      item.label === '总重' ||
      item.label === '鎬婚噸' ||
      item.label === 'Total Weight'

    if (!isTotalWeight) {
      return true
    }

    const numericWeight = parsePositiveNumber(String(item.value || '').replace(/[^0-9.]+/g, ''))
    return numericWeight !== null
  })
})

const activeProductDetailImages = computed(() => {
  if (!activeProduct.value) {
    return []
  }

  return productGalleryImages(activeProduct.value)
})

const activeProductGalleryImages = computed(() => {
  if (!activeProduct.value) {
    return []
  }

  return activeProductDetailImages.value
})

const visibleDetailThumbItems = computed(() => {
  return activeProductGalleryImages.value
    .slice(detailThumbStartIndex.value, detailThumbStartIndex.value + visibleDetailThumbCount)
    .map((image, offset) => ({
      image,
      index: detailThumbStartIndex.value + offset,
    }))
})

const activeDetailImageIndex = computed(() => {
  return activeProductGalleryImages.value.findIndex((image) => image === activeDetailImage.value)
})

function searchText(product) {
  return [
    product.name,
    product.displayName,
    product.type,
    product.displayType,
    product.series,
    product.displaySeries,
    product.code,
    product.note,
    product.displayNote,
    product.material,
    product.displayMaterial,
    product.remark,
    product.displayRemark,
    product.sellingPoint,
    product.displaySellingPoint,
    ...(product.specs ?? []).map((item) => item.value),
    ...(product.displaySpecs ?? []).map((item) => item.value),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function formatPrice(price) {
  const numericPrice = Number(price)
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return ui.value.priceOnRequest
  }

  return formatCurrencyFromCny(numericPrice, currencyRegion.value)
}

function parsePositiveNumber(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null
}

function shouldShowHandSize(value) {
  const text = String(value ?? '').trim()
  if (!text) {
    return false
  }

  const numericValue = Number(text)
  return !Number.isFinite(numericValue) || numericValue !== 0
}

function getDefaultGoodsNo(items) {
  return items.find((item) => item?.goodsNo)?.goodsNo || ''
}

function priceRangeLabel(min, max, mode = 'range') {
  if (mode === 'under') {
    return ui.value.priceUnder(formatCurrencyFromCny(max + 1, currencyRegion.value))
  }

  if (mode === 'above') {
    return ui.value.priceAbove(formatCurrencyFromCny(min, currencyRegion.value))
  }

  return `${formatCurrencyFromCny(min, currencyRegion.value)}-${formatCurrencyFromCny(max, currencyRegion.value)}`
}

function displayType(type) {
  if (type === allFilterKey) {
    return ui.value.all
  }

  if (isRingType(type)) {
    return categoryHeroCopy.ring.title[languageAwareLocale.value] || categoryHeroCopy.ring.title.zh
  }

  const categoryKey = getCategoryKeyForType(type)
  if (categoryKey) {
    return categoryHeroCopy[categoryKey].title[languageAwareLocale.value] || categoryHeroCopy[categoryKey].title.zh
  }

  return localizeProductType(type, languageAwareLocale.value)
}

function isRingType(type) {
  return ['戒指', '男戒', '女戒', '鎴掓寚', '鐢锋垝', '濂虫垝'].includes(type)
}

function isBraceletType(type) {
  return ['手链', '鎵嬮摼'].includes(type)
}

function isNecklaceType(type) {
  return ['项链', '椤归摼'].includes(type)
}

function isPendantType(type) {
  return ['吊坠', '鍚婂潬'].includes(type)
}

function isDisabledProductType(type) {
  return ['裸石', 'Loose Stone', 'Loose Stones', '定制', 'Custom'].includes(type)
}

function isEarringType(type) {
  return earringTypes.includes(type)
}

function getCategoryKeyForType(type) {
  if (isRingType(type)) {
    return 'ring'
  }

  if (isBraceletType(type)) {
    return 'bracelet'
  }

  if (isNecklaceType(type)) {
    return 'necklace'
  }

  if (isPendantType(type)) {
    return 'pendant'
  }

  if (type === earringFilterKey) {
    return 'earrings'
  }

  return ''
}

function normalizeCategoryType(type) {
  if (isRingType(type)) {
    return ringFilterKey
  }

  if (isBraceletType(type)) {
    return braceletFilterKey
  }

  if (isNecklaceType(type)) {
    return necklaceFilterKey
  }

  if (isPendantType(type)) {
    return pendantFilterKey
  }

  if (type === earringFilterKey) {
    return earringFilterKey
  }

  return type
}

function isProductMatchingSelectedType(productType, selectedFilterType) {
  const normalizedSelectedType = normalizeCategoryType(selectedFilterType)

  if (normalizedSelectedType === earringFilterKey) {
    return isEarringType(productType)
  }

  return normalizeCategoryType(productType) === normalizedSelectedType
}

function isProductMatchingEarringSubtype(productType, selectedSubtype) {
  if (selectedSubtype === allFilterKey) {
    return true
  }

  if (selectedSubtype === '耳吊') {
    return earringDropTypeValues.includes(productType)
  }

  return productType === selectedSubtype
}

function normalizeEarringSubtype(type) {
  if (type === '耳圈' || type === '耳钉') {
    return type
  }

  if (earringDropTypeValues.includes(type)) {
    return '耳吊'
  }

  return ''
}

function displaySeries(series) {
  if (series === allFilterKey) {
    return ui.value.all
  }

  return localizeSeries(series, languageAwareLocale.value)
}

function displayPriceRange(range) {
  return range.label
}

function displayPriceFilterValue(value) {
  const range = priceRanges.value.find((item) => item.id === value)
  return range ? displayPriceRange(range) : displayPlainFilterValue(value)
}

function displayPlainFilterValue(value) {
  return value === allFilterKey ? ui.value.all : value
}

function displayFilterValue(value) {
  return value === allFilterKey ? ui.value.all : localizeFilterValue(value, languageAwareLocale.value)
}

function displayMaterialFilterValue(value) {
  return value === allFilterKey ? ui.value.all : localizeMaterial(value, languageAwareLocale.value)
}

function displayEarringSubtype(value) {
  return value === allFilterKey ? ui.value.allEarrings : localizeProductType(value, languageAwareLocale.value)
}

function getFilterSummary(value, displayValue) {
  return value === allFilterKey ? '' : displayValue(value)
}

function getUniqueProductValues(getValue) {
  return [
    ...new Set(
      products.value
        .map((product) => normalizeFilterValue(getValue(product)))
        .filter(Boolean),
    ),
  ]
}

function normalizeFilterValue(value) {
  return String(value || '').trim()
}

function getProductSpecValue(product, labels) {
  const labelSet = new Set(labels)
  const spec = (product?.specs ?? []).find((item) => labelSet.has(item.label))
  return normalizeFilterValue(spec?.value)
}

function normalizeStoneColor(value) {
  return normalizeFilterValue(value)
    .replace(/^培育/, '')
    .replace(/^天然/, '')
}

function selectLooseStoneChoice(groupId, value) {
  looseStoneFilters.value[groupId] = looseStoneFilters.value[groupId] === value ? '' : value
  visibleProductLimit.value = productsPageSize
}

function selectLooseStoneCarat(value) {
  const isSelected = looseStoneFilters.value.caratPreset === value
  looseStoneFilters.value.caratPreset = isSelected ? '' : value
  looseStoneFilters.value.caratMin = isSelected ? '' : value
  looseStoneFilters.value.caratMax = ''
  visibleProductLimit.value = productsPageSize
}

function useRecommendedLooseStonePrice() {
  looseStoneFilters.value.priceMin = ''
  looseStoneFilters.value.priceMax = ''
  visibleProductLimit.value = productsPageSize
}

function resetLooseStoneFilters() {
  looseStoneFilters.value = { ...looseStoneDefaultFilters }
  visibleProductLimit.value = productsPageSize
}

function getLooseStoneSpecValue(product, labels) {
  const directValue = labels
    .map((label) => product?.[label])
    .find((value) => normalizeFilterValue(value))

  return normalizeFilterValue(directValue) || getProductSpecValue(product, labels)
}

function normalizeLooseStoneComparable(value) {
  return normalizeFilterValue(value).replace(/\s+/g, '').toLowerCase()
}

function normalizeLooseStoneFluorescence(value) {
  const normalizedValue = normalizeLooseStoneComparable(value)
  const fluorescenceMap = {
    non: 'none',
    no: 'none',
    none: 'none',
    无: 'none',
    faint: 'faint',
    medium: 'medium',
    strong: 'strong',
    verystrong: 'verystrong',
    verystrongblue: 'verystrong',
  }

  return fluorescenceMap[normalizedValue] || normalizedValue
}

function getLooseStoneCarat(product) {
  const rawValue =
    getLooseStoneSpecValue(product, ['钻重', '主石大小', '主石重量', '克拉', 'Carat', 'carat'])
    || getLooseStoneSpecValue(product, ['主石'])

  const match = String(rawValue || '').match(/\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : null
}

function getLooseStoneCertificateNo(product) {
  return normalizeFilterValue(
    product?.certificateNo
      || product?.certNo
      || product?.certificate_no
      || product?.goodsNo
      || getLooseStoneSpecValue(product, ['证书号', '证书编号', 'GIA证书号', 'IGI证书号']),
  )
}

function isProductMatchingLooseStoneFilters(product) {
  const filters = looseStoneFilters.value
  const fieldMap = {
    shape: ['形状', '石形状', '主石形状', '切割形状'],
    color: ['颜色', '石颜色', '主石颜色', 'Color', 'color'],
    clarity: ['净度', '主石净度', 'Clarity', 'clarity'],
    cut: ['切工', '切割', 'Cut', 'cut'],
    symmetry: ['对称', '对称性', 'Symmetry', 'symmetry'],
    polish: ['抛光', 'Polish', 'polish'],
    fluorescence: ['荧光', 'Fluorescence', 'fluorescence'],
    certificate: ['证书', '证书机构', 'Certificate', 'certificate'],
  }

  const matchesChoiceFilters = Object.entries(fieldMap).every(([filterKey, labels]) => {
    const selectedValue = filters[filterKey]
    if (!selectedValue) {
      return true
    }

    const productValue = getLooseStoneSpecValue(product, labels)
    if (filterKey === 'fluorescence') {
      return normalizeLooseStoneFluorescence(productValue) === normalizeLooseStoneFluorescence(selectedValue)
    }

    return normalizeLooseStoneComparable(productValue).includes(normalizeLooseStoneComparable(selectedValue))
  })

  if (!matchesChoiceFilters) {
    return false
  }

  const price = Number(product.price ?? 0)
  const minPrice = parsePositiveNumber(filters.priceMin)
  const maxPrice = parsePositiveNumber(filters.priceMax)
  if ((minPrice !== null && price < minPrice) || (maxPrice !== null && price > maxPrice)) {
    return false
  }

  const carat = getLooseStoneCarat(product)
  const minCarat = parsePositiveNumber(filters.caratMin)
  const maxCarat = parsePositiveNumber(filters.caratMax)
  if (minCarat !== null && (carat === null || carat < minCarat)) {
    return false
  }
  if (maxCarat !== null && (carat === null || carat > maxCarat)) {
    return false
  }

  const certificateNo = normalizeLooseStoneComparable(filters.certificateNo)
  if (certificateNo && !normalizeLooseStoneComparable(getLooseStoneCertificateNo(product)).includes(certificateNo)) {
    return false
  }

  return true
}

function isProductImageKind(image, folderName) {
  if (!image || typeof image !== 'string' || !folderName) {
    return false
  }

  const normalizedImage = image.split('?')[0].replaceAll('\\', '/').toLowerCase()
  const normalizedFolder = folderName.toLowerCase()
  return normalizedImage.includes(`/${normalizedFolder}/`)
    || normalizedImage.startsWith(`${normalizedFolder}/`)
}

function productPrimaryImage(product) {
  return isProductImageKind(product?.image, 'product1') ? product.image : ''
}

function productHoverImage(product) {
  return isProductImageKind(product?.alternateImage, 'product2') ? product.alternateImage : ''
}

function productDetailImageIndex(product, image) {
  const styleNo = String(product?.styleNo || product?.code || '').trim().toLowerCase()
  const fileName = String(image || '')
    .split('?')[0]
    .replaceAll('\\', '/')
    .split('/')
    .pop()
    ?.toLowerCase() || ''

  if (!styleNo || !fileName.startsWith(`${styleNo}_`)) {
    return -1
  }

  const match = fileName.match(/_(\d+)\.[^.]+$/)
  return match ? Number(match[1]) : -1
}

function imageFileNameHasUnderscore(image) {
  const fileName = String(image || '')
    .split('?')[0]
    .replaceAll('\\', '/')
    .split('/')
    .pop() || ''

  return fileName.includes('_')
}

function productDetailImages(product) {
  const detailImages = Array.isArray(product?.detailImages) ? product.detailImages : []
  const styleNo = String(product?.styleNo || product?.code || '').trim()
  const imageByIndex = new Map()

  detailImages
    .filter((image) => isProductImageKind(image, 'product_details'))
    .forEach((image) => {
      const index = productDetailImageIndex(product, image)
      if (index >= 0 && index <= 3 && !imageByIndex.has(index)) {
        imageByIndex.set(index, image)
      }
    })

  const orderedImages = [0, 1, 2, 3]
    .map((index) => imageByIndex.get(index))
    .filter(Boolean)

  if (orderedImages.length || !styleNo) {
    return orderedImages
  }

  return [1, 2, 3, 0].map((index) => `http://img.deringdiam.com/product_details/${styleNo}_${index}.png`)
}

function uniqueImages(images) {
  return images.filter((image, index) => image && images.indexOf(image) === index)
}

function productGalleryImages(product) {
  const detailImages = productDetailImages(product)

  return uniqueImages(detailImages.filter(imageFileNameHasUnderscore))
}

function displayProductCardImage(product) {
  const primaryImage = productPrimaryImage(product)
  const hoverImage = productHoverImage(product)

  if (hoveredProductCode.value === product?.code && hoverImage) {
    return hoverImage
  }

  return primaryImage
}

function hideBrokenProductImage(product) {
  if (!product?.code) {
    return
  }

  brokenProductImageCodes.value = new Set([...brokenProductImageCodes.value, product.code])
  fillProductsToVisibleLimit()
}

function productImageStyle(product) {
  const baseScale = Number(product.imageDisplayScale ?? 1)
  let scale = baseScale

  if (isBraceletType(product.type)) {
    scale = Math.max(baseScale, 1.25)
  } else if (isNecklaceType(product.type)) {
    scale = baseScale * 0.9
  } else if (isPendantType(product.type)) {
    scale = baseScale * 0.82
  } else if (isRingType(product.type) || isEarringType(product.type)) {
    scale = Math.max(baseScale, 1.12)
  }

  if (!Number.isFinite(scale) || scale <= 0) {
    return {}
  }

  const hoverScale = Math.min(scale * 1.035, 1.9)
  return {
    '--product-card-image-scale': scale.toFixed(3),
    '--product-card-image-hover-scale': hoverScale.toFixed(3),
  }
}

function productCardClass(product) {
  return {
    'product-card--necklace': isNecklaceType(product.type),
  }
}

function setHoveredProduct(code) {
  if (!code) {
    return
  }

  hoveredProductCode.value = code
}

function clearHoveredProduct(code) {
  if (hoveredProductCode.value === code) {
    hoveredProductCode.value = ''
  }
}

function appendUniqueProducts(items) {
  const incomingProducts = Array.isArray(items) ? items : []
  if (!incomingProducts.length) {
    return 0
  }

  const existingCodes = new Set(products.value.map((product) => product.code))
  const newProducts = incomingProducts.filter((product) => !existingCodes.has(product.code))
  if (!newProducts.length) {
    return 0
  }

  products.value = [...products.value, ...newProducts]
  return newProducts.length
}

async function fetchAndAppendNextProductsPage() {
  if (!productsHasMore.value) {
    return 0
  }

  const payload = await fetchProductsPage(productsPage.value + 1)
  const addedCount = appendUniqueProducts(payload.items)
  productsPage.value = payload.page
  productsHasMore.value = payload.hasMore
  productsTotal.value = payload.total
  return addedCount
}

async function fillProductsToVisibleLimit() {
  while (displayableProducts.value.length < visibleProductLimit.value && productsHasMore.value) {
    const addedCount = await fetchAndAppendNextProductsPage()
    if (!addedCount) {
      break
    }
  }
}

async function loadProducts() {
  isLoading.value = true
  loadError.value = false
  products.value = []
  productsPage.value = 0
  productsHasMore.value = false
  productsTotal.value = 0
  visibleProductLimit.value = productsPageSize

  try {
    const payload = await fetchProductsPage(1)
    products.value = payload.items
    productsPage.value = payload.page
    productsHasMore.value = payload.hasMore
    productsTotal.value = payload.total
    syncSeriesFromRoute()
    await fillProductsToVisibleLimit()
    await syncProductFromRoute()
  } catch (error) {
    console.error('Failed to load products:', error)
    loadError.value = true
    products.value = []
  } finally {
    isLoading.value = false
  }
}

async function loadMoreProducts() {
  if (isLoadingMore.value || !canLoadMoreProducts.value) {
    return
  }

  visibleProductLimit.value += productsPageSize

  if (displayableProducts.value.length >= visibleProductLimit.value || !productsHasMore.value) {
    return
  }

  isLoadingMore.value = true

  try {
    await fillProductsToVisibleLimit()
  } catch (error) {
    console.error('Failed to load more products:', error)
  } finally {
    isLoadingMore.value = false
  }
}

async function fetchProductsPage(page) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(productsPageSize),
  })

  const routeSearch = Array.isArray(route.query.q) ? route.query.q[0] : route.query.q
  const routeType = Array.isArray(route.query.type) ? route.query.type[0] : route.query.type
  const routeSeries = Array.isArray(route.query.series) ? route.query.series[0] : route.query.series
  if (routeSearch) {
    params.set('q', routeSearch)
  }

  if (routeType) {
    params.set('type', routeType)
  }

  if (routeSeries) {
    params.set('series', routeSeries)
  }

  const response = await fetch(`/api/products?${params}`)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const payload = await response.json()
  const items = Array.isArray(payload) ? payload : payload.products
  const productsPayload = Array.isArray(items) ? items : []

  return {
    items: productsPayload,
    page: Number(payload.page ?? page),
    total: Number(payload.total ?? productsPayload.length),
    hasMore: Boolean(payload.hasMore),
  }
}

function syncSeriesFromRoute() {
  const routeSeries = Array.isArray(route.query.series) ? route.query.series[0] : route.query.series
  const routeSearch = Array.isArray(route.query.q) ? route.query.q[0] : route.query.q
  const routeType = Array.isArray(route.query.type) ? route.query.type[0] : route.query.type

  if (routeSearch && searchQuery.value !== routeSearch) {
    searchQuery.value = routeSearch
  }

  if (routeType) {
    const routeEarringSubtype = normalizeEarringSubtype(routeType)
    if (routeEarringSubtype) {
      selectedType.value = earringFilterKey
      draftType.value = earringFilterKey
      selectedSeries.value = allFilterKey
      draftSeries.value = allFilterKey
      selectedPrice.value = allFilterKey
      draftPrice.value = allFilterKey
      clearSecondaryFilters()
      selectedEarringSubtype.value = routeEarringSubtype
      draftEarringSubtype.value = routeEarringSubtype
      return
    }

    const normalizedRouteType = normalizeCategoryType(routeType)
    const hasGroupedType = [
      ringFilterKey,
      braceletFilterKey,
      necklaceFilterKey,
      pendantFilterKey,
      looseStoneFilterKey,
      earringFilterKey,
    ].includes(normalizedRouteType)

    if (hasGroupedType) {
      selectedType.value = normalizedRouteType
      draftType.value = normalizedRouteType
      selectedSeries.value = allFilterKey
      draftSeries.value = allFilterKey
      selectedPrice.value = allFilterKey
      draftPrice.value = allFilterKey
      clearSecondaryFilters()
      return
    }

    const matchedType = products.value.find((product) => product.type === routeType)?.type
    if (matchedType) {
      selectedType.value = matchedType
      draftType.value = matchedType
      selectedSeries.value = allFilterKey
      draftSeries.value = allFilterKey
      selectedPrice.value = allFilterKey
      draftPrice.value = allFilterKey
      clearSecondaryFilters()
      return
    }
  }

  if (!routeSeries) {
    return
  }

  const matchedSeries = products.value.find((product) => product.series === routeSeries)?.series
  if (matchedSeries) {
    selectedSeries.value = matchedSeries
    draftSeries.value = matchedSeries
    selectedType.value = allFilterKey
    draftType.value = allFilterKey
    selectedPrice.value = allFilterKey
    draftPrice.value = allFilterKey
    clearSecondaryFilters()
  }
}

function clearSecondaryFilters() {
  selectedEarringSubtype.value = allFilterKey
  draftEarringSubtype.value = allFilterKey
  selectedMaterial.value = allFilterKey
  draftMaterial.value = allFilterKey
  selectedStoneShape.value = allFilterKey
  draftStoneShape.value = allFilterKey
  selectedMainStone.value = allFilterKey
  draftMainStone.value = allFilterKey
  selectedStoneColor.value = allFilterKey
  draftStoneColor.value = allFilterKey
  resetLooseStoneFilters()
}

function toggleFilterPanel() {
  syncDraftFilters()
  showFilterPanel.value = !showFilterPanel.value
}

function openFilterPanel() {
  syncDraftFilters()
  showFilterPanel.value = true
}

function syncDraftFilters() {
  draftType.value = selectedType.value
  draftEarringSubtype.value = selectedEarringSubtype.value
  draftMaterial.value = selectedMaterial.value
  draftStoneShape.value = selectedStoneShape.value
  draftMainStone.value = selectedMainStone.value
  draftSeries.value = selectedSeries.value
  draftPrice.value = selectedPrice.value
  draftStoneColor.value = selectedStoneColor.value
}

async function showProducts() {
  await scrollToProducts()
}

async function applyFilters() {
  selectedType.value = draftType.value
  selectedEarringSubtype.value = draftType.value === earringFilterKey ? draftEarringSubtype.value : allFilterKey
  selectedMaterial.value = draftMaterial.value
  selectedStoneShape.value = draftStoneShape.value
  selectedMainStone.value = draftMainStone.value
  selectedPrice.value = draftPrice.value
  selectedSeries.value = draftSeries.value
  selectedStoneColor.value = draftStoneColor.value
  visibleProductLimit.value = productsPageSize
  await fillProductsToVisibleLimit()
  showFilterPanel.value = false
  await scrollToProducts()
}

function getSelectedRouteType() {
  if (draftType.value === allFilterKey) {
    return undefined
  }

  if (draftType.value === earringFilterKey && draftEarringSubtype.value !== allFilterKey) {
    return draftEarringSubtype.value
  }

  return draftType.value
}

async function selectFilterOption(moduleId, value) {
  setFilterValue(moduleId, value)

  if (moduleId === 'type' || moduleId === 'earringSubtype') {
    const nextRouteType = getSelectedRouteType()
    const nextRouteQuery = nextRouteType ? { type: nextRouteType } : {}
    searchQuery.value = ''
    showFilterPanel.value = false
    visibleProductLimit.value = productsPageSize
    await router.push({ name: 'products', query: nextRouteQuery })
    return
  }

  visibleProductLimit.value = productsPageSize
  await fillProductsToVisibleLimit()
}

function setFilterValue(moduleId, value) {
  if (moduleId === 'type') {
    clearSecondaryFilters()
    draftSeries.value = allFilterKey
    selectedSeries.value = allFilterKey
    draftPrice.value = allFilterKey
    selectedPrice.value = allFilterKey
    draftType.value = value
    selectedType.value = value
  } else if (moduleId === 'earringSubtype') {
    clearSecondaryFilters()
    draftSeries.value = allFilterKey
    selectedSeries.value = allFilterKey
    draftPrice.value = allFilterKey
    selectedPrice.value = allFilterKey
    draftType.value = earringFilterKey
    selectedType.value = earringFilterKey
    draftEarringSubtype.value = value
    selectedEarringSubtype.value = value
  } else if (moduleId === 'material') {
    draftMaterial.value = value
    selectedMaterial.value = value
  } else if (moduleId === 'stoneShape') {
    draftStoneShape.value = value
    selectedStoneShape.value = value
  } else if (moduleId === 'mainStone') {
    draftMainStone.value = value
    selectedMainStone.value = value
  } else if (moduleId === 'series') {
    draftSeries.value = value
    selectedSeries.value = value
  } else if (moduleId === 'price') {
    draftPrice.value = value
    selectedPrice.value = value
  } else if (moduleId === 'stoneColor') {
    draftStoneColor.value = value
    selectedStoneColor.value = value
  }
}

async function selectTypeFilter(type) {
  draftType.value = type
  selectedType.value = type
  visibleProductLimit.value = productsPageSize
  await fillProductsToVisibleLimit()
}

async function selectPriceFilter(price) {
  draftPrice.value = price
  selectedPrice.value = price
  visibleProductLimit.value = productsPageSize
  await fillProductsToVisibleLimit()
}

async function selectSeriesFilter(series) {
  draftSeries.value = series
  selectedSeries.value = series
  visibleProductLimit.value = productsPageSize
  await fillProductsToVisibleLimit()
}

async function resetFilters() {
  draftType.value = allFilterKey
  draftEarringSubtype.value = allFilterKey
  draftMaterial.value = allFilterKey
  draftStoneShape.value = allFilterKey
  draftMainStone.value = allFilterKey
  draftPrice.value = allFilterKey
  draftSeries.value = allFilterKey
  draftStoneColor.value = allFilterKey
  selectedType.value = allFilterKey
  selectedEarringSubtype.value = allFilterKey
  selectedMaterial.value = allFilterKey
  selectedStoneShape.value = allFilterKey
  selectedMainStone.value = allFilterKey
  selectedPrice.value = allFilterKey
  selectedSeries.value = allFilterKey
  selectedStoneColor.value = allFilterKey
  resetLooseStoneFilters()
  visibleProductLimit.value = productsPageSize

  const nextRouteQuery = { ...route.query }
  const shouldReloadProducts = Boolean(nextRouteQuery.type || nextRouteQuery.series || nextRouteQuery.product)
  delete nextRouteQuery.type
  delete nextRouteQuery.series
  delete nextRouteQuery.product

  if (shouldReloadProducts) {
    await router.replace({ name: 'products', query: nextRouteQuery })
    return
  }

  await fillProductsToVisibleLimit()
}

async function chooseRecommendation(product) {
  searchQuery.value = product.displayName
  await showProducts()
}

async function scrollToProducts() {
  await nextTick()
  productSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function openProduct(product) {
  activeProductCode.value = product.code
  activeDetailImage.value = productGalleryImages(product)[0] || ''
  resetDetailImageZoom()
  detailThumbStartIndex.value = 0
  activeDetailDrawer.value = ''
  activeSizePanel.value = 'select'
  selectedGoodsNo.value = ''
  draftSelectedGoodsNo.value = ''
  activeProductGoodsLoadError.value = false
  startDetailImageAutoSlide()
}

function handleDetailImageError() {
  const galleryImages = activeProductGalleryImages.value
  const currentIndex = galleryImages.indexOf(activeDetailImage.value)
  const nextImage = galleryImages.find((image, index) => index > currentIndex && image !== activeDetailImage.value)

  activeDetailImage.value = nextImage || productPrimaryImage(activeProduct.value) || productHoverImage(activeProduct.value) || ''
}

async function findRouteProduct(routeProduct) {
  let matchedProduct = localizedProducts.value.find((product) => product.code === routeProduct)

  while (!matchedProduct && productsHasMore.value) {
    const addedCount = await fetchAndAppendNextProductsPage()
    if (!addedCount) {
      break
    }

    matchedProduct = localizedProducts.value.find((product) => product.code === routeProduct)
  }

  const displayableIndex = displayableProducts.value.findIndex((product) => product.code === routeProduct)
  if (displayableIndex >= visibleProductLimit.value) {
    visibleProductLimit.value = Math.ceil((displayableIndex + 1) / productsPageSize) * productsPageSize
  }

  return matchedProduct
}

async function syncProductFromRoute() {
  const routeProduct = Array.isArray(route.query.product) ? route.query.product[0] : route.query.product
  if (!routeProduct || !products.value.length) {
    return
  }

  const matchedProduct = await findRouteProduct(routeProduct)
  if (matchedProduct) {
    openProduct(matchedProduct)
  }
}

function getSingleRouteQueryValue(key) {
  const value = route.query[key]
  return Array.isArray(value) ? value[0] : value
}

function getCloseProductSeriesRoute() {
  const fromSeries = getSingleRouteQueryValue('fromSeries')
  if (!fromSeries) {
    return null
  }

  return {
    name: 'series',
    params: { slug: fromSeries },
  }
}

async function closeProduct({ restoreProductPosition = true, navigateToSource = true } = {}) {
  const sourceRoute = navigateToSource ? getCloseProductSeriesRoute() : null
  if (sourceRoute) {
    await router.push(sourceRoute)
    return
  }

  const closingProductCode = activeProductCode.value
  clearDetailImageAutoSlide()
  activeProductCode.value = ''
  activeDetailImage.value = ''
  resetDetailImageZoom()
  detailThumbStartIndex.value = 0
  activeDetailDrawer.value = ''
  activeSizePanel.value = 'select'
  selectedGoodsNo.value = ''
  draftSelectedGoodsNo.value = ''
  activeProductGoodsLoadError.value = false
  closeImagePreview()

  if (restoreProductPosition && closingProductCode) {
    await scrollProductCardIntoView(closingProductCode)
  }
}

async function openDetailDrawer(drawer) {
  const nextDrawer = activeDetailDrawer.value === drawer ? '' : drawer
  activeDetailDrawer.value = nextDrawer

  if (nextDrawer === 'size') {
    activeSizePanel.value = 'select'
    draftSelectedGoodsNo.value = selectedGoodsNo.value
    await loadActiveProductGoodsOptions()
  }
}

async function loadActiveProductGoodsOptions() {
  const styleNo = activeProduct.value?.styleNo || activeProduct.value?.code
  if (!styleNo) {
    return
  }

  const cachedItems = activeProductGoodsByStyleNo.value[styleNo]
  if (cachedItems) {
    if (!draftSelectedGoodsNo.value && cachedItems.length) {
      draftSelectedGoodsNo.value = selectedGoodsNo.value || getDefaultGoodsNo(cachedItems)
    }
    return
  }

  activeProductGoodsLoading.value = true
  activeProductGoodsLoadError.value = false

  try {
    const response = await fetch(`/api/products/${encodeURIComponent(styleNo)}/goods-certificates`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json()
    const items = Array.isArray(payload.items) ? payload.items : []
    activeProductGoodsByStyleNo.value = {
      ...activeProductGoodsByStyleNo.value,
      [styleNo]: items,
    }

    if (!draftSelectedGoodsNo.value && items.length) {
      draftSelectedGoodsNo.value = selectedGoodsNo.value || getDefaultGoodsNo(items)
    }
  } catch (error) {
    console.error('Failed to load product goods certificates:', error)
    activeProductGoodsLoadError.value = true
  } finally {
    activeProductGoodsLoading.value = false
  }
}

function selectGoodsOption(item) {
  draftSelectedGoodsNo.value = item?.goodsNo || ''
}

function confirmSelectedGoodsOption() {
  if (!draftSelectedGoodsNo.value) {
    return
  }

  selectedGoodsNo.value = draftSelectedGoodsNo.value
  activeDetailDrawer.value = ''
}

function clampPreviewZoom(value) {
  return Math.min(Math.max(Number(value) || 1, 0.5), 4)
}

function clampDetailImageZoom(value) {
  return Math.min(Math.max(Number(value) || 1, 0.75), 1.8)
}

function openImagePreview(image) {
  previewImage.value = image
  previewZoom.value = 1
}

function closeImagePreview() {
  previewImage.value = ''
  previewZoom.value = 1
}

function zoomPreviewImage(delta) {
  previewZoom.value = clampPreviewZoom(previewZoom.value + delta)
}

function resetPreviewZoom() {
  previewZoom.value = 1
}

function handlePreviewWheel(event) {
  zoomPreviewImage(event.deltaY < 0 ? 0.15 : -0.15)
}

function zoomDetailImage(delta) {
  detailImageZoom.value = clampDetailImageZoom(detailImageZoom.value + delta)
}

function resetDetailImageZoom() {
  detailImageZoom.value = 1
}

function handleDetailImageWheel(event) {
  zoomDetailImage(event.deltaY < 0 ? 0.12 : -0.12)
}

function clearDetailImageAutoSlide() {
  if (!detailImageAutoSlideTimer) {
    return
  }

  window.clearInterval(detailImageAutoSlideTimer)
  detailImageAutoSlideTimer = 0
}

function startDetailImageAutoSlide() {
  clearDetailImageAutoSlide()

  if (!activeProduct.value || activeProductGalleryImages.value.length <= 1) {
    return
  }

  detailImageAutoSlideTimer = window.setInterval(() => {
    advanceDetailImage()
  }, detailImageAutoSlideDelay)
}

async function advanceDetailImage() {
  const images = activeProductGalleryImages.value
  if (images.length <= 1) {
    clearDetailImageAutoSlide()
    return
  }

  const currentIndex = images.indexOf(activeDetailImage.value)
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % images.length : 0
  await selectDetailImage(images[nextIndex], nextIndex, { restartAutoSlide: false })
}

function buildCartProduct(product, goodsItem) {
  if (!goodsItem?.goodsNo) {
    return product
  }

  const goodsPrice = parsePositiveNumber(goodsItem.salesPrice)
  const styleNo = product.styleNo || product.code

  return {
    ...product,
    code: goodsItem.goodsNo,
    styleNo,
    goodsNo: goodsItem.goodsNo,
    goodsWeight: goodsItem.goodsWeight,
    goldWeight: goodsItem.goldWeight,
    sideStoneWeight: goodsItem.sideStoneWeight,
    price: goodsPrice ?? product.price,
  }
}

function addActiveProductToCart() {
  if (!activeProduct.value) {
    return
  }

  if (!currentUser.value) {
    window.alert(locale.value === 'en'
      ? 'Please sign in or register before adding items to your bag.'
      : '请先登录或注册后再加入购物车。')
    router.push({ name: 'login' })
    return
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      LAST_CART_PRODUCT_STORAGE_KEY,
      JSON.stringify({
        code: activeProduct.value.code,
        query: {
          ...route.query,
          product: activeProduct.value.code,
        },
      }),
    )
  }

  const cartProduct = buildCartProduct(activeProduct.value, selectedGoodsItem.value)
  if (!addCartItem(cartProduct)) {
    return
  }

  closeProduct({ restoreProductPosition: false, navigateToSource: false })
  router.push({ name: 'cart' })
}

async function scrollProductCardIntoView(code) {
  await nextTick()
  await new Promise((resolve) => window.requestAnimationFrame(resolve))

  const productCards = Array.from(productSection.value?.querySelectorAll('.product-card') ?? [])
  const productCard = productCards.find((card) => card.dataset.productCode === code)
  productCard?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function selectDetailImage(
  image,
  index = activeProductGalleryImages.value.indexOf(image),
  { restartAutoSlide = true } = {},
) {
  activeDetailImage.value = image
  resetDetailImageZoom()
  syncVisibleThumbWindow(index)
  await scrollActiveThumbIntoView(index)

  if (restartAutoSlide) {
    startDetailImageAutoSlide()
  }
}

function showPreviousDetailThumbs() {
  const images = activeProductGalleryImages.value
  if (images.length <= visibleDetailThumbCount) {
    return
  }

  const maxStartIndex = Math.max(images.length - visibleDetailThumbCount, 0)
  detailThumbStartIndex.value =
    detailThumbStartIndex.value <= 0 ? maxStartIndex : detailThumbStartIndex.value - 1
}

function showNextDetailThumbs() {
  const images = activeProductGalleryImages.value
  if (images.length <= visibleDetailThumbCount) {
    return
  }

  const maxStartIndex = Math.max(images.length - visibleDetailThumbCount, 0)
  detailThumbStartIndex.value =
    detailThumbStartIndex.value >= maxStartIndex ? 0 : detailThumbStartIndex.value + 1
}

async function scrollActiveThumbIntoView(index = activeDetailImageIndex.value) {
  await nextTick()

  if (index < 0 || !detailThumbs.value) {
    return
  }

  const visibleIndex = index - detailThumbStartIndex.value
  const thumbList = detailThumbs.value.querySelector('.detail-thumb-list')
  const thumb = thumbList?.children[visibleIndex]
  thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
}

function syncVisibleThumbWindow(index = activeDetailImageIndex.value) {
  const images = activeProductGalleryImages.value
  const maxStartIndex = Math.max(images.length - visibleDetailThumbCount, 0)

  if (index < 0 || images.length <= visibleDetailThumbCount) {
    detailThumbStartIndex.value = 0
    return
  }

  if (index < detailThumbStartIndex.value) {
    detailThumbStartIndex.value = index
    return
  }

  if (index >= detailThumbStartIndex.value + visibleDetailThumbCount) {
    detailThumbStartIndex.value = Math.min(index - visibleDetailThumbCount + 1, maxStartIndex)
    return
  }

  detailThumbStartIndex.value = Math.min(detailThumbStartIndex.value, maxStartIndex)
}

function handleCloseProductDetailEvent() {
  closeProduct({ navigateToSource: false })
}

onMounted(() => {
  loadProducts()
  window.addEventListener('open-product-filters', openFilterPanel)
  window.addEventListener('close-product-detail', handleCloseProductDetailEvent)
})

onBeforeUnmount(() => {
  clearDetailImageAutoSlide()
  window.removeEventListener('open-product-filters', openFilterPanel)
  window.removeEventListener('close-product-detail', handleCloseProductDetailEvent)
  document.body.classList.remove('is-product-detail-open')
})

watch(
  () => [route.query.series, route.query.q, route.query.type, route.query.product],
  async () => {
    closeProduct({ restoreProductPosition: false, navigateToSource: false })
    await loadProducts()
  },
)

watch(
  () => [selectedType.value, selectedEarringSubtype.value, selectedMaterial.value, selectedStoneShape.value, selectedMainStone.value, selectedPrice.value, selectedSeries.value, selectedStoneColor.value, searchQuery.value],
  async () => {
    visibleProductLimit.value = productsPageSize
    await fillProductsToVisibleLimit()
  },
)

watch(
  activeProductGalleryImages,
  (images) => {
    if (!images.length) {
      clearDetailImageAutoSlide()
      activeDetailImage.value = ''
      detailThumbStartIndex.value = 0
      return
    }

    if (!images.includes(activeDetailImage.value)) {
      activeDetailImage.value = images[0]
    }

    detailThumbStartIndex.value = Math.min(
      detailThumbStartIndex.value,
      Math.max(images.length - visibleDetailThumbCount, 0),
    )

    startDetailImageAutoSlide()
  },
  { immediate: true },
)

watch(
  activeProduct,
  (product) => {
    document.body.classList.toggle('is-product-detail-open', Boolean(product))
  },
  { immediate: true },
)
</script>

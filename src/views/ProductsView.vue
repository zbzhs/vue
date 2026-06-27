<template>
  <div v-if="showFilterPanel" class="filter-drawer-backdrop" @click.self="showFilterPanel = false">
    <aside class="filter-drawer" :aria-label="ui.filterMenuAria">
      <button class="drawer-close" type="button" @click="showFilterPanel = false">
        <span aria-hidden="true">&times;</span>
        {{ ui.close }}
      </button>

      <button
        class="drawer-search-toggle"
        type="button"
        :aria-label="ui.searchProducts"
        @click="showDrawerSearch = !showDrawerSearch"
      >
        <span></span>
      </button>

      <div v-if="showDrawerSearch" class="drawer-search">
        <input
          v-model.trim="searchQuery"
          type="search"
          :placeholder="ui.searchProducts"
          @keydown.enter.prevent="applyFilters"
        />
      </div>

      <div class="drawer-filter-group">
        <div class="drawer-filter-head">
          <h2>{{ ui.typeLabel }}</h2>
          <span aria-hidden="true">+</span>
        </div>
        <button
          v-for="type in filterTypes"
          :key="type"
          type="button"
          :class="{ active: draftType === type }"
          @click="selectTypeFilter(type)"
        >
          {{ displayType(type) }}
        </button>
      </div>

      <div class="drawer-filter-group">
        <div class="drawer-filter-head">
          <h2>{{ ui.priceLabel }}</h2>
          <span aria-hidden="true">+</span>
        </div>
        <button
          v-for="range in priceRanges"
          :key="range.id"
          type="button"
          :class="{ active: draftPrice === range.id }"
          @click="selectPriceFilter(range.id)"
        >
          {{ displayPriceRange(range) }}
        </button>
      </div>

      <div class="drawer-filter-group">
        <div class="drawer-filter-head">
          <h2>{{ ui.seriesLabel }}</h2>
          <span aria-hidden="true">+</span>
        </div>
        <button
          v-for="series in filterSeries"
          :key="series"
          type="button"
          :class="{ active: draftSeries === series }"
          @click="selectSeriesFilter(series)"
        >
          {{ displaySeries(series) }}
        </button>
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

    <img class="category-hero-image" :src="categoryHero.image" :alt="categoryHero.alt" />
  </section>

  <section class="product-discovery" :aria-label="ui.discoveryAria">
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
            <img :src="resolveProductImage(product.image, product.alternateImage, product.code)" :alt="product.displayName" />
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
        v-for="product in filteredProducts"
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
            :src="displayProductCardImage(product)"
            :alt="product.displayName"
            :style="productImageStyle(product)"
          />
        </span>
        <div class="product-info">
          <p>{{ product.displayType }}</p>
          <h2>{{ product.displayName }}</h2>
          <span>{{ product.displayNote || product.displaySeries }}</span>
          <strong>{{ formatPrice(product.price) }}</strong>
        </div>
      </button>
    </div>

    <p v-if="!isLoading && !loadError && filteredProducts.length === 0" class="empty-products">
      {{ ui.empty }}
    </p>
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
        &times;
      </button>
      <div class="detail-media">
        <img
          v-if="activeDetailImage"
          class="detail-main-image"
          :src="activeDetailImage"
          :alt="activeProduct.displayName"
        />
      </div>

      <div class="detail-copy">
        <h2>{{ activeProduct.displayName }}</h2>
        <p>{{ ui.styleNo }}: {{ activeProduct.code }} | {{ activeProduct.brand }}</p>

        <dl class="detail-specs">
          <div
            v-for="item in activeProduct.displaySpecs"
            :key="`${activeProduct.code}-${item.rawLabel}`"
          >
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>

        <div class="detail-purchase-row">
          <strong>{{ formatPrice(activeProduct.price) }}</strong>
          <button class="detail-cart-button" type="button" @click="addActiveProductToCart">
            {{ ui.addToCart }}
          </button>
        </div>

        <p v-if="activeProduct.displaySellingPoint">{{ activeProduct.displaySellingPoint }}</p>
        <p v-if="activeProduct.displayRemark">{{ activeProduct.displayRemark }}</p>
      </div>

      <div v-if="activeProductGalleryImages.length > 1" ref="detailThumbs" class="detail-thumbs">
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
            :key="`${activeProduct.code}-thumb-${item.index}`"
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

      <div class="detail-banner" aria-hidden="true">
        <img src="/images/lab-grown-diamond-banner-ultrawide.png" alt="" />
      </div>

      <section class="detail-good-images" :aria-label="`${activeProduct.displayName} details`">
        <img
          v-for="(image, index) in detailGoodImages"
          :key="image"
          :src="image"
          :alt="`${activeProduct.displayName} detail ${index + 1}`"
          loading="lazy"
        />
      </section>
    </article>
  </div>
</template>

<script>
let cachedProductsPayload = null
let cachedProductsLoadPromise = null
let cachedProductsPayloadExpiresAt = 0
const productsCacheTtlMs = 30000
</script>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import KnowledgeFooter from '../components/KnowledgeFooter.vue'
import { useCart } from '../composables/useCart'
import { useLocale } from '../composables/useLocale'
import { formatCurrencyFromCny } from '../utils/currency'
import {
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
const earringTypes = ['耳饰', '耳钉', '耳圈', '耳线', '耳吊', '耳扣']
const visibleDetailThumbCount = 4
const LAST_CART_PRODUCT_STORAGE_KEY = 'dering-last-cart-product'
const detailGoodImages = Array.from(
  { length: 9 },
  (_, index) => `/images/good/%E8%AF%A6%E6%83%85%E9%A1%B5_${String(index + 1).padStart(2, '0')}.jpg`,
)
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
    prevImage: '上一张图片',
    nextImage: '下一张图片',
    addToCart: '加入购物车',
    styleNo: '款号',
    all: '全部',
    priceOnRequest: '面议',
    priceUnder: (value) => `${value} 以下`,
    priceAbove: (value) => `${value} 以上`,
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
    prevImage: 'Previous image',
    nextImage: 'Next image',
    addToCart: 'Add to Bag',
    styleNo: 'Style No.',
    all: 'All',
    priceOnRequest: 'Price on request',
    priceUnder: (value) => `Under ${value}`,
    priceAbove: (value) => `Above ${value}`,
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
    image: '/images/product/rings/1.jpg',
    title: {
      zh: '戒指',
      en: 'Rings',
      ja: 'リング',
      th: 'แหวน',
      ko: '반지',
      vi: 'Nhan',
    },
    text: {
      zh: '以生活日常与人生纪念为创作灵感，我们雕琢多款戒指臻品。简约单钻纯粹大气，繁复群镶华丽动人，宝石折射细碎柔光，金属勾勒流畅线条，于方寸指尖演绎独属于你的优雅光芒，见证爱意、仪式与岁岁日常。',
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
    image: '/images/product/bracelets/APYB0006-W-30(1).png',
    title: {
      zh: '手链',
      en: 'Bracelets',
      ja: 'ブレスレット',
      th: 'สร้อยข้อมือ',
      ko: '팔찌',
      vi: 'Vong tay',
    },
    text: {
      zh: '灵感源于日常细碎美好与珍贵纪念，雕琢多款腕间珠宝。连贯排钻自带大气华丽质感，细巧单链低调温柔，宝石随手腕动作折射灵动光芒，衬显手腕纤细，轻松适配休闲、正装各类造型。',
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
    image: '/images/product/necklaces/03fbdeb5-250b-47c8-86d4-4483c6dfdebe.png',
    title: {
      zh: '项链',
      en: 'Necklaces',
      ja: 'ネックレス',
      th: 'สร้อยคอ',
      ko: '목걸이',
      vi: 'Day chuyen',
    },
    text: {
      zh: '以优雅与仪式感为创作内核，打造多元项链臻品。极简素链低调内敛，满钻重工款璀璨夺目，宝石折射温润柔光，贴合脖颈曲线自然衬肤，无论日常穿搭或是重要晚宴，都能流露独一份的精致格调。',
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
    image: '/images/product/pendants/1781603252_1ed77c707cf6a9dd4cca69453f13bf3e.png',
    title: {
      zh: '吊坠',
      en: 'Pendants',
      ja: 'ペンダント',
      th: 'จี้',
      ko: '펜던트',
      vi: 'Mat day',
    },
    text: {
      zh: '以爱意与日常温柔为创作内核，雕琢多款吊坠臻品。利落极简款适配通勤，重工彩宝款饱含仪式感，宝石折射温润柔光悬于锁骨，可单戴可叠搭，随身珍藏每一份心动与纪念。',
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
    image: '/images/product/earrings/1782195279_cc05b28eae6d34f7d14697ca2b079e1c.png',
    title: {
      zh: '耳饰',
      en: 'Earrings',
      ja: 'イヤーアクセ',
      th: 'ต่างหู',
      ko: '귀걸이',
      vi: 'Hoa tai',
    },
    text: {
      zh: '撷取日常美好与仪式时刻为灵感，打造多款耳畔臻品。极简单钻干净耐看，重工彩宝群镶华贵动人，宝石流转柔和光影，柔和修饰脸型，无论休闲穿搭或是隆重场合，都能衬出独一份精致气质。',
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

const breadcrumbCopy = computed(() => breadcrumbCopies[languageAwareLocale.value] || breadcrumbCopies.zh)

const categoryHero = computed(() => {
  const categoryKey = getCategoryKeyForType(selectedType.value)
  if (!categoryKey) {
    return null
  }

  const activeLocale = languageAwareLocale.value
  const hero = categoryHeroCopy[categoryKey]

  return {
    image: hero.image,
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
const loadError = ref(false)
const searchQuery = ref('')
const selectedType = ref(allFilterKey)
const selectedPrice = ref(allFilterKey)
const selectedSeries = ref(allFilterKey)
const draftType = ref(allFilterKey)
const draftPrice = ref(allFilterKey)
const draftSeries = ref(allFilterKey)
const showFilterPanel = ref(false)
const showDrawerSearch = ref(false)
const activeProductCode = ref('')
const activeDetailImage = ref('')
const detailThumbStartIndex = ref(0)
const detailThumbs = ref(null)
const productSection = ref(null)
const hoveredProductCode = ref('')

const filterTypes = computed(() => {
  const types = products.value
    .map((product) => normalizeCategoryType(product.type))
    .filter(Boolean)

  return [allFilterKey, ...new Set(types)]
})

const filterSeries = computed(() => {
  return [allFilterKey, ...new Set(products.value.map((product) => product.series).filter(Boolean))]
})

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
    const matchesSeries = selectedSeries.value === allFilterKey || product.series === selectedSeries.value
    const price = Number(product.price ?? 0)
    const matchesPrice =
      selectedPrice.value === allFilterKey || (price >= priceRange.min && price <= priceRange.max)

    return matchesType && matchesSeries && matchesPrice
  })
})

const activeFilterCount = computed(() => {
  return [selectedType.value, selectedPrice.value, selectedSeries.value].filter(
    (value) => value !== allFilterKey,
  ).length
})

const activeProduct = computed(() => {
  return localizedProducts.value.find((product) => product.code === activeProductCode.value) ?? null
})

const activeProductDetailImages = computed(() => {
  if (!activeProduct.value) {
    return []
  }

  const detailImages = (activeProduct.value.detailImages ?? []).filter(Boolean)
  return detailImages.filter((image, index) => detailImages.indexOf(image) === index)
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

function displaySeries(series) {
  if (series === allFilterKey) {
    return ui.value.all
  }

  return localizeSeries(series, languageAwareLocale.value)
}

function displayPriceRange(range) {
  return range.label
}

function resolveProductImage(image, alternateImage, code) {
  if (!image || typeof image !== 'string') {
    return image
  }

  if (!isPrimaryProductImage(image) || !alternateImage) {
    return image
  }

  if (hoveredProductCode.value !== code) {
    return image
  }

  return alternateImage
}

function isPrimaryProductImage(image) {
  if (!image || typeof image !== 'string') {
    return false
  }

  const normalizedImage = image.split('?')[0].replaceAll('\\', '/').toLowerCase()
  return normalizedImage.includes('/product1/')
}

function displayProductCardImage(product) {
  return resolveProductImage(product.image, product.alternateImage, product.code) || product.image || ''
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

async function loadProducts() {
  if (Array.isArray(cachedProductsPayload) && Date.now() < cachedProductsPayloadExpiresAt) {
    products.value = cachedProductsPayload
    isLoading.value = false
    loadError.value = false
    return
  }

  if (cachedProductsLoadPromise) {
    isLoading.value = true
    loadError.value = false

    try {
      products.value = await cachedProductsLoadPromise
    } catch (error) {
      console.error('Failed to load products:', error)
      loadError.value = true
      products.value = []
    } finally {
      isLoading.value = false
    }

    return
  }

  isLoading.value = true
  loadError.value = false

  try {
    cachedProductsLoadPromise = fetch('/api/products')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const payload = await response.json()
        const items = Array.isArray(payload) ? payload : payload.products
        cachedProductsPayload = Array.isArray(items) ? items : []
        cachedProductsPayloadExpiresAt = Date.now() + productsCacheTtlMs
        return cachedProductsPayload
      })
      .finally(() => {
        cachedProductsLoadPromise = null
      })

    const items = await cachedProductsLoadPromise
    products.value = Array.isArray(items) ? items : []
  } catch (error) {
    console.error('Failed to load products:', error)
    loadError.value = true
    products.value = []
  } finally {
    isLoading.value = false
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
    const normalizedRouteType = normalizeCategoryType(routeType)
    const hasGroupedType = [ringFilterKey, braceletFilterKey, necklaceFilterKey, pendantFilterKey, earringFilterKey].includes(normalizedRouteType)

    if (hasGroupedType) {
      selectedType.value = normalizedRouteType
      draftType.value = normalizedRouteType
      selectedSeries.value = allFilterKey
      draftSeries.value = allFilterKey
      selectedPrice.value = allFilterKey
      draftPrice.value = allFilterKey
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
  }
}

function toggleFilterPanel() {
  draftType.value = selectedType.value
  draftPrice.value = selectedPrice.value
  draftSeries.value = selectedSeries.value
  showFilterPanel.value = !showFilterPanel.value
}

function openFilterPanel() {
  draftType.value = selectedType.value
  draftPrice.value = selectedPrice.value
  draftSeries.value = selectedSeries.value
  showFilterPanel.value = true
}

async function showProducts() {
  await scrollToProducts()
}

async function applyFilters() {
  selectedType.value = draftType.value
  selectedPrice.value = draftPrice.value
  selectedSeries.value = draftSeries.value
  showFilterPanel.value = false
  await scrollToProducts()
}

function selectTypeFilter(type) {
  draftType.value = type
  selectedType.value = type
}

function selectPriceFilter(price) {
  draftPrice.value = price
  selectedPrice.value = price
}

function selectSeriesFilter(series) {
  draftSeries.value = series
  selectedSeries.value = series
}

function resetFilters() {
  draftType.value = allFilterKey
  draftPrice.value = allFilterKey
  draftSeries.value = allFilterKey
  selectedType.value = allFilterKey
  selectedPrice.value = allFilterKey
  selectedSeries.value = allFilterKey
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
  activeDetailImage.value = (product.detailImages ?? []).filter(Boolean)[0] || ''
  detailThumbStartIndex.value = 0
}

function syncProductFromRoute() {
  const routeProduct = Array.isArray(route.query.product) ? route.query.product[0] : route.query.product
  if (!routeProduct || !products.value.length) {
    return
  }

  const matchedProduct = localizedProducts.value.find((product) => product.code === routeProduct)
  if (matchedProduct) {
    openProduct(matchedProduct)
  }
}

async function closeProduct({ restoreProductPosition = true } = {}) {
  const closingProductCode = activeProductCode.value
  activeProductCode.value = ''
  activeDetailImage.value = ''
  detailThumbStartIndex.value = 0

  if (restoreProductPosition && closingProductCode) {
    await scrollProductCardIntoView(closingProductCode)
  }
}

function addActiveProductToCart() {
  if (!activeProduct.value) {
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

  addCartItem(activeProduct.value)
  closeProduct({ restoreProductPosition: false })
  router.push({ name: 'cart' })
}

async function scrollProductCardIntoView(code) {
  await nextTick()
  await new Promise((resolve) => window.requestAnimationFrame(resolve))

  const productCards = Array.from(productSection.value?.querySelectorAll('.product-card') ?? [])
  const productCard = productCards.find((card) => card.dataset.productCode === code)
  productCard?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function selectDetailImage(image, index = activeProductGalleryImages.value.indexOf(image)) {
  activeDetailImage.value = image
  syncVisibleThumbWindow(index)
  await scrollActiveThumbIntoView(index)
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

onMounted(() => {
  loadProducts()
  window.addEventListener('open-product-filters', openFilterPanel)
  window.addEventListener('close-product-detail', closeProduct)
})

onBeforeUnmount(() => {
  window.removeEventListener('open-product-filters', openFilterPanel)
  window.removeEventListener('close-product-detail', closeProduct)
  document.body.classList.remove('is-product-detail-open')
})

watch(
  () => [route.query.series, route.query.q, route.query.type, products.value.length],
  () => {
    closeProduct({ restoreProductPosition: false })
    syncSeriesFromRoute()
    syncProductFromRoute()
  },
  { immediate: true },
)

watch(
  activeProductGalleryImages,
  (images) => {
    if (!images.length) {
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

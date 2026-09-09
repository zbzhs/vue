<template>
  <section class="admin-product-tools">
    <template v-if="activeTool === 'menu'">
      <header class="admin-section-head">
        <div>
          <p>PRODUCT TOOLS</p>
          <h2>商品工具</h2>
        </div>
      </header>

      <nav class="admin-tool-entry-grid" aria-label="商品维护功能">
        <button
          v-for="item in toolTabs"
          :key="item.key"
          type="button"
          class="admin-tool-entry"
          @click="openTool(item.key)"
        >
          <span>{{ item.label }}</span>
          <small>{{ item.description }}</small>
        </button>
      </nav>
    </template>

    <header v-else class="admin-section-head product-tool-view-head">
      <div>
        <p>PRODUCT TOOLS</p>
        <h2>{{ activeToolMeta.label }}</h2>
      </div>
      <button class="admin-refresh" type="button" @click="openTool('menu')">返回商品工具</button>
    </header>

    <p v-if="activeTool !== 'menu' && notice" class="product-tool-notice" :class="{ error: noticeType === 'error' }">{{ notice }}</p>

    <section v-if="activeTool === 'create'" class="product-tool-panel">
      <div class="product-tool-panel-head">
        <div><span>上新商品</span><h3>录入商品资料</h3></div>
      </div>
      <form class="product-maintenance-form" @submit.prevent="saveProduct('create')">
        <label><span>商品款号</span><input v-model.trim="productForm.styleNo" maxlength="64" placeholder="例如 APYN0001-W" required /></label>
        <ProductFields />
        <button class="product-tool-primary" type="submit" :disabled="isSaving">{{ isSaving ? '上新中...' : '确认上新' }}</button>
      </form>
    </section>

    <section v-else-if="activeTool === 'edit'" class="product-tool-panel">
      <div class="product-tool-panel-head">
        <div><span>修改商品</span><h3>选择需要修改的商品</h3></div>
      </div>
      <ProductSearch action-label="选择修改" @select="selectProduct" />
      <form v-if="selectedProduct" class="product-maintenance-form product-maintenance-form--spaced" @submit.prevent="saveProduct('edit')">
        <label><span>商品款号</span><input :value="productForm.styleNo" readonly /></label>
        <ProductFields />
        <button class="product-tool-primary" type="submit" :disabled="isSaving">{{ isSaving ? '保存中...' : '保存修改' }}</button>
      </form>
    </section>

    <section v-else-if="activeTool === 'delete'" class="product-tool-panel">
      <div class="product-tool-panel-head">
        <div><span>删除商品</span><h3>搜索并删除指定商品</h3></div>
      </div>
      <ProductSearch :key="`delete-${searchRevision}`" action-label="删除" danger @select="removeProduct" />
    </section>

    <section v-else-if="activeTool === 'series'" class="product-tool-panel">
      <div class="product-tool-panel-head">
        <div><span>上新系列</span><h3>新增商品系列</h3></div>
        <strong>{{ seriesOptions.length }} 个系列</strong>
      </div>
      <form class="product-series-form" @submit.prevent="saveSeries">
        <label><span>系列名称</span><input v-model.trim="newSeriesName" maxlength="100" placeholder="例如：经典四爪系列" required /></label>
        <button class="product-tool-primary" type="submit" :disabled="isSavingSeries">{{ isSavingSeries ? '新增中...' : '新增系列' }}</button>
      </form>
      <div class="product-series-list">
        <span v-for="item in seriesOptions" :key="item">{{ item }}</span>
        <p v-if="!seriesOptions.length">暂无系列</p>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'

const props = defineProps({
  token: { type: String, required: true },
})

const toolTabs = [
  { key: 'create', label: '上新商品', description: '录入新款商品资料' },
  { key: 'edit', label: '修改商品', description: '调整已有商品信息' },
  { key: 'delete', label: '删除商品', description: '下架并删除指定商品' },
  { key: 'series', label: '上新系列', description: '创建新的商品系列' },
]

const emptyProduct = () => ({
  styleNo: '', name: '', series: '', type: '', material: '', totalWeight: '',
  labelPrice: '', livePrice: '', inventory: '', unshippedQty: '', commission: '',
  stoneColor: '', stoneShape: '', mainStone: '', sideStone: '', sizeDesc: '',
  sellingPoint: '', guaranteeInfo: '', remark: '',
})

const activeTool = ref('menu')
const activeToolMeta = computed(() => toolTabs.find((item) => item.key === activeTool.value) || toolTabs[0])
const productForm = reactive(emptyProduct())
const selectedProduct = ref(null)
const seriesOptions = ref([])
const newSeriesName = ref('')
const isSaving = ref(false)
const isSavingSeries = ref(false)
const searchRevision = ref(0)
const notice = ref('')
const noticeType = ref('success')

function field(label, key, options = {}) {
  const input = options.type === 'textarea'
    ? h('textarea', {
        value: productForm[key],
        rows: options.rows || 3,
        maxlength: options.maxlength,
        placeholder: options.placeholder || '',
        onInput: (event) => { productForm[key] = event.target.value },
      })
    : h('input', {
        value: productForm[key],
        type: options.type || 'text',
        min: options.min,
        step: options.step,
        maxlength: options.maxlength,
        placeholder: options.placeholder || '',
        required: options.required || false,
        onInput: (event) => { productForm[key] = event.target.value },
      })
  return h('label', { class: options.wide ? 'is-wide' : '' }, [h('span', label), input])
}

const ProductFields = defineComponent({
  setup() {
    return () => [
      field('商品名称', 'name', { maxlength: 200, required: true }),
      h('label', [
        h('span', '所属系列'),
        h('select', {
          value: productForm.series,
          onChange: (event) => { productForm.series = event.target.value },
        }, [
          h('option', { value: '' }, '未分类系列'),
          ...seriesOptions.value.map((item) => h('option', { value: item }, item)),
        ]),
      ]),
      field('品类', 'type', { maxlength: 100, placeholder: '项链、戒指、耳饰等' }),
      field('材质', 'material', { maxlength: 100, placeholder: '18K白、Pt950等' }),
      field('总重', 'totalWeight', { type: 'number', min: 0, step: '0.01' }),
      field('展示价格', 'labelPrice', { type: 'number', min: 0, step: '0.01' }),
      field('直播价', 'livePrice', { type: 'number', min: 0, step: '0.01' }),
      field('库存', 'inventory', { type: 'number', min: 0, step: 1 }),
      field('未出货数', 'unshippedQty', { type: 'number', min: 0, step: 1 }),
      field('佣金 %', 'commission', { type: 'number', min: 0, step: '0.01' }),
      field('石颜色', 'stoneColor', { maxlength: 100 }),
      field('石形状', 'stoneShape', { maxlength: 100 }),
      field('主石', 'mainStone', { maxlength: 200 }),
      field('副石', 'sideStone', { maxlength: 200 }),
      field('尺寸说明', 'sizeDesc', { maxlength: 500 }),
      field('口播卖点', 'sellingPoint', { type: 'textarea', maxlength: 500, wide: true }),
      field('商品保障', 'guaranteeInfo', { type: 'textarea', maxlength: 500, wide: true }),
      field('备注', 'remark', { type: 'textarea', maxlength: 1000, wide: true }),
    ]
  },
})

const ProductSearch = defineComponent({
  props: {
    actionLabel: { type: String, required: true },
    danger: { type: Boolean, default: false },
  },
  emits: ['select'],
  setup(componentProps, { emit }) {
    const query = ref('')
    const products = ref([])
    const loading = ref(false)
    const searched = ref(false)

    async function search() {
      loading.value = true
      try {
        const params = new URLSearchParams({ page: '1', pageSize: '100', q: query.value.trim() })
        const response = await fetch(`/api/products?${params}`)
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload.detail || '商品加载失败')
        products.value = Array.isArray(payload.products) ? payload.products : []
        searched.value = true
      } catch (error) {
        showNotice(error instanceof Error ? error.message : '商品加载失败', 'error')
      } finally {
        loading.value = false
      }
    }

    return () => h('div', { class: 'product-search' }, [
      h('form', { class: 'product-search-form', onSubmit: (event) => { event.preventDefault(); search() } }, [
        h('label', [h('span', '款号或商品名称'), h('input', {
          value: query.value,
          placeholder: '输入关键词搜索',
          onInput: (event) => { query.value = event.target.value },
        })]),
        h('button', { type: 'submit', disabled: loading.value }, loading.value ? '搜索中...' : '搜索'),
      ]),
      searched.value && !products.value.length
        ? h('p', { class: 'product-tool-empty' }, '没有找到商品')
        : h('div', { class: 'product-search-results' }, products.value.map((product) => h('article', { key: product.styleNo }, [
            h('span', [h('strong', product.name || product.styleNo), h('small', `${product.styleNo} · ${product.series || '未分类系列'} · ${product.type || '未分类'}`)]),
            h('button', {
              type: 'button',
              class: componentProps.danger ? 'is-danger' : '',
              onClick: () => emit('select', product),
            }, componentProps.actionLabel),
          ]))),
    ])
  },
})

function showNotice(message, type = 'success') {
  notice.value = message
  noticeType.value = type
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${props.token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.detail || '操作失败')
  return payload
}

function openTool(key) {
  activeTool.value = key
  notice.value = ''
  selectedProduct.value = null
  if (key === 'create') Object.assign(productForm, emptyProduct())
}

function selectProduct(product) {
  selectedProduct.value = product
  Object.assign(productForm, emptyProduct(), product, {
    styleNo: product.styleNo || product.code || '',
    name: product.name || '',
    type: product.type || '',
    series: product.series === '未分类系列' ? '' : (product.series || ''),
    guaranteeInfo: Array.isArray(product.guaranteeLines) ? product.guaranteeLines.join('\n') : (product.guaranteeInfo || ''),
  })
  notice.value = ''
}

function productPayload() {
  return Object.fromEntries(Object.entries(productForm).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]))
}

async function saveProduct(mode) {
  isSaving.value = true
  try {
    const isCreate = mode === 'create'
    const path = isCreate ? '/api/admin/products' : `/api/admin/products/${encodeURIComponent(productForm.styleNo)}`
    const payload = await api(path, { method: isCreate ? 'POST' : 'PATCH', body: JSON.stringify(productPayload()) })
    showNotice(isCreate ? `已上新商品 ${payload.product?.styleNo || productForm.styleNo}` : `已保存商品 ${productForm.styleNo}`)
    if (isCreate) Object.assign(productForm, emptyProduct())
    else selectProduct(payload.product || selectedProduct.value)
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '商品保存失败', 'error')
  } finally {
    isSaving.value = false
  }
}

async function removeProduct(product) {
  const styleNo = product.styleNo || product.code
  if (!window.confirm(`确认删除商品 ${product.name || styleNo}（${styleNo}）？此操作无法撤销。`)) return
  try {
    await api(`/api/admin/products/${encodeURIComponent(styleNo)}`, { method: 'DELETE' })
    searchRevision.value += 1
    showNotice(`已删除商品 ${styleNo}`)
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '商品删除失败', 'error')
  }
}

async function loadSeries() {
  try {
    const payload = await api('/api/admin/product-series')
    seriesOptions.value = Array.isArray(payload.items) ? payload.items : []
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '系列加载失败', 'error')
  }
}

async function saveSeries() {
  if (!newSeriesName.value) return
  isSavingSeries.value = true
  try {
    const payload = await api('/api/admin/product-series', { method: 'POST', body: JSON.stringify({ name: newSeriesName.value }) })
    newSeriesName.value = ''
    await loadSeries()
    showNotice(`已新增系列 ${payload.item}`)
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '系列新增失败', 'error')
  } finally {
    isSavingSeries.value = false
  }
}

onMounted(loadSeries)
</script>

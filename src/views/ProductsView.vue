<template>
  <section class="page-hero compact-hero products-hero">
    <div>
      <p class="eyebrow">Products</p>
      <h1>产品展示</h1>
      <p>戒指、项链、耳饰与高级定制系列。</p>
    </div>
  </section>

  <section class="content-section">
    <div class="product-grid">
      <article v-for="product in products" :key="product.name" class="product-card">
        <img :src="product.image" :alt="product.name" />
        <div class="product-info">
          <p>{{ product.category }}</p>
          <h2>{{ product.name }}</h2>
          <span>{{ product.note }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
const products = [
  {
    category: 'Diamond Ring',
    name: '晨曦钻戒',
    note: '18K白金 / 圆形明亮式切割',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
  },
  {
    category: 'Necklace',
    name: '星河项链',
    note: '18K玫瑰金 / 密镶钻石',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=80',
  },
  {
    category: 'Gemstone',
    name: '蓝境彩宝戒',
    note: '蓝宝石 / 梯方钻围镶',
    image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=900&q=80',
  },
  {
    category: 'Earrings',
    name: '月相耳坠',
    note: '珍珠 / 18K黄金',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
  },
]
</script>

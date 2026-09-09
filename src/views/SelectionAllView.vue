<template>
  <div class="selection-all-page">
    <ProductsView v-if="showSelectionProducts" />
    <HomeView v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import HomeView from './HomeView.vue'
import ProductsView from './ProductsView.vue'

const route = useRoute()

const showSelectionProducts = computed(() => Boolean(
  route.query.type ||
  route.query.series ||
  route.query.q ||
  route.query.product,
))
</script>

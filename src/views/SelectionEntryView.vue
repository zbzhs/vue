<template>
  <section class="selection-entry-page">
    <div class="selection-entry-card">
      <span>DERING SELECTION</span>
      <h1>达人选品工作台</h1>
      <p>登录成功，正在为你进入推荐中心。</p>

      <div class="selection-entry-actions">
        <RouterLink :to="{ name: 'selection' }">进入推荐中心</RouterLink>
        <RouterLink :to="{ name: 'selectionPicks' }">查看我的选品</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  window.setTimeout(() => {
    router.push({ name: 'selection' })
  }, 900)
})
</script>

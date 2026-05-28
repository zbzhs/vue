<template>
  <div class="home-page">
    <section
      ref="heroStage"
      class="hero-stage"
      :class="{ 'is-switching': isSwitching }"
      @wheel.prevent="handleHeroWheel"
    >
      <div
        class="hero-track"
        :style="{ transform: `translateY(-${(currentPage - 1) * 100}%)` }"
      >
        <section class="hero hero-primary" :class="{ 'is-active': currentPage === 1 }">
          <video
            class="hero-video"
            src="/video/video.mp4"
            autoplay
            muted
            loop
            playsinline
            preload="auto"
            aria-hidden="true"
          ></video>
          <div class="hero-shade"></div>
          <div class="hero-content">
            <p class="eyebrow">高级珠宝与定制设计</p>
            <h1>戴莉</h1>
            <p class="hero-copy">
              以钻石、彩宝与贵金属工艺，呈现值得被珍藏的日常光芒。
            </p>
            <RouterLink class="primary-link" to="/products">浏览系列</RouterLink>
          </div>
        </section>

        <section class="hero hero-secondary" :class="{ 'is-active': currentPage === 2 }">
          <div class="hero-shade"></div>
          <div class="hero-content align-right">
            <p class="eyebrow">Bespoke Jewelry</p>
            <h2>为每一段故事定制轮廓</h2>
            <p class="hero-copy">
              从主石甄选、设计草图到镶嵌抛光，让纪念日、婚礼与传承有更贴切的表达。
            </p>
            <RouterLink class="secondary-link" to="/process">了解工艺</RouterLink>
          </div>
        </section>
      </div>

      <div class="page-dots" aria-label="首页大屏切换">
        <button
          type="button"
          :class="{ active: currentPage === 1 }"
          aria-label="切换到第 1 屏"
          @click="goToPage(1)"
        ></button>
        <button
          type="button"
          :class="{ active: currentPage === 2 }"
          aria-label="切换到第 2 屏"
          @click="goToPage(2)"
        ></button>
      </div>
    </section>

    <section class="home-section">
      <div class="section-heading">
        <p class="eyebrow dark">Selected Collections</p>
        <h2>精选系列</h2>
      </div>
      <div class="collection-grid">
        <article class="collection-card">
          <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80" alt="钻石戒指" />
          <div>
            <h3>钻石婚戒</h3>
            <p>经典爪镶、排钻与异形切割主石，适合订婚与纪念日。</p>
          </div>
        </article>
        <article class="collection-card">
          <img src="https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=900&q=80" alt="彩色宝石" />
          <div>
            <h3>彩宝高级系列</h3>
            <p>蓝宝石、祖母绿与红宝石组合，强调色彩层次与佩戴气质。</p>
          </div>
        </article>
        <article class="collection-card">
          <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80" alt="珠宝细节" />
          <div>
            <h3>日常轻奢</h3>
            <p>项链、耳饰与手链，以细腻线条适配通勤和晚宴场景。</p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const heroStage = ref(null)
const currentPage = ref(1)
const isSwitching = ref(false)
let switchTimer

function goToPage(page) {
  if (page === currentPage.value || isSwitching.value) {
    return
  }

  window.scrollTo({ top: 0, behavior: 'auto' })
  currentPage.value = page
  isSwitching.value = true
  window.clearTimeout(switchTimer)
  switchTimer = window.setTimeout(() => {
    isSwitching.value = false
  }, 1000)
}

function handleHeroWheel(event) {
  if (!heroStage.value || Math.abs(event.deltaY) < 8) {
    return
  }

  const direction = event.deltaY > 0 ? 1 : -1

  if (currentPage.value === 1 && direction > 0) {
    goToPage(2)
    return
  }

  if (currentPage.value === 2 && direction > 0 && !isSwitching.value) {
    window.scrollTo({
      top: heroStage.value.offsetHeight,
      behavior: 'smooth',
    })
    return
  }

  if (currentPage.value === 2 && direction < 0 && window.scrollY <= 2) {
    goToPage(1)
  }
}
</script>

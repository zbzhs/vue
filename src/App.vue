<template>
  <div class="site-shell">
    <header class="nav-bar">
      <RouterLink class="brand" to="/" aria-label="戴莉首页">
        <img class="brand-logo" src="/logo/name.jpg" alt="戴莉 logo" />
      </RouterLink>

      <nav class="nav-links" aria-label="主导航">
        <RouterLink class="brand-word" to="/">
          <span>戴莉</span>
          <strong>DERING</strong>
        </RouterLink>
        <RouterLink to="/">主页</RouterLink>
        <RouterLink to="/products">产品展示</RouterLink>
        <RouterLink to="/contact">联系我们</RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

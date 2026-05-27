<template>
  <div class="site-shell">
    <header class="nav-bar">
      <RouterLink class="brand" to="/" aria-label="戴莉首页">
        <img class="brand-logo" src="/logo/name.jpg" alt="戴莉 logo" />
        <span>戴莉</span>
      </RouterLink>

      <nav class="nav-links" aria-label="主导航">
        <RouterLink to="/">主页</RouterLink>
        <RouterLink to="/products">产品展示</RouterLink>

        <div class="nav-dropdown">
          <button type="button" class="dropdown-trigger" aria-haspopup="true">
            其他
            <span class="dropdown-arrow">⌄</span>
          </button>
          <div class="dropdown-menu" role="menu">
            <RouterLink to="/about" role="menuitem">品牌介绍</RouterLink>
            <RouterLink to="/craft" role="menuitem">珠宝工艺</RouterLink>
            <RouterLink to="/contact" role="menuitem">联系我们</RouterLink>
          </div>
        </div>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

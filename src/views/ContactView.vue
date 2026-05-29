<template>
  <div class="contact-page">
    <section class="page-hero text-hero contact-showcase">
      <div class="contact-hero-inner">
        <p class="contact-brand">DERING</p>
        <h1>联系我们</h1>
        <div class="contact-divider" aria-hidden="true">
          <span></span>
          <i></i>
          <span></span>
        </div>
      </div>
    </section>

    <section class="content-section contact-experience">
      <div class="contact-action-grid">
        <article class="contact-action-card hotline-card">
          <div class="contact-action-head">
            <h2>联系电话</h2>
          </div>
          <div class="contact-action-body">
            <strong class="contact-action-detail">13715011967</strong>
            <p>欢迎通过该联系方式咨询选购、定制与供货服务。</p>
          </div>
        </article>

        <article class="contact-action-card consult-card">
          <div class="contact-action-head">
            <h2>在线咨询</h2>
          </div>
          <div class="contact-action-body">
            <div class="contact-chat-mark" aria-hidden="true">
              <span></span>
              <span></span>
            </div>
            <p>通过官方微信与官方邮箱快速联系顾问，我们将在工作时段尽快回复。</p>
          </div>
        </article>
      </div>

      <div class="contact-channel-grid">
        <article class="contact-channel-card">
          <h3>官方微信</h3>
          <img class="contact-channel-image" src="/images/contact/wechat.jpg" alt="官方微信二维码" />
          <p>扫码添加官方微信，获取一对一咨询服务。</p>
        </article>

        <article class="contact-channel-card">
          <h3>官方邮箱</h3>
          <img class="contact-channel-image" src="/images/contact/qq.jpg" alt="官方邮箱二维码" />
          <p>37261784qq.com</p>
        </article>

        <article class="contact-channel-card">
          <h3>到店咨询</h3>
          <div class="contact-channel-code">STORE</div>
          <p>上海市静安区南京西路 888 号，欢迎预约到店体验。</p>
        </article>
      </div>
    </section>

    <footer class="home-footer product-page-footer contact-page-footer" aria-label="联系页底部导航">
      <div class="home-footer-brand">DERING</div>
      <nav class="home-footer-links" aria-label="珠宝知识">
        <RouterLink to="/process">生产工艺</RouterLink>
        <RouterLink to="/4c">4C标准</RouterLink>
        <RouterLink to="/advantages">核心优势</RouterLink>
        <RouterLink to="/buying-guide">选购指南</RouterLink>
        <RouterLink to="/faq">常见问题</RouterLink>
      </nav>
    </footer>
  </div>
</template>

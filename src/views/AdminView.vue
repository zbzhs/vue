<template>
  <section v-if="isAdmin" class="admin-page">
    <div class="admin-shell">
      <section class="admin-workspace" aria-live="polite">
        <aside class="admin-sidebar" aria-label="admin">
          <p>管理员功能</p>
          <button
            v-for="item in adminNavItems"
            :key="item.key"
            type="button"
            :class="{ active: activeAdminSection === item.key }"
            @click="selectAdminSection(item.key)"
          >
            {{ item.label }}
          </button>
          <RouterLink class="admin-sidebar-link" :to="{ name: 'admin' }">DERING主页</RouterLink>
        </aside>

        <div class="admin-content">
          <section v-if="activeAdminSection === 'settings'" class="admin-user-management">
            <div class="admin-section-head">
              <div>
                <p>{{ copy.userKicker }}</p>
                <h2>{{ copy.userTitle }}</h2>
              </div>
              <div class="admin-user-search-row">
                <input v-model.trim="userSearchQuery" :placeholder="copy.userSearchPlaceholder" @keydown.enter.prevent="refreshUsers" />
                <button type="button" :disabled="isLoadingUsers" @click="refreshUsers">
                  {{ isLoadingUsers ? copy.loading : copy.searchUsers }}
                </button>
              </div>
            </div>

            <p v-if="usersError" class="admin-error">{{ usersError }}</p>
            <div v-else class="admin-user-list">
              <article
                v-for="user in users"
                :key="user.user_id"
                class="admin-user-row"
                :class="{ active: selectedUserId === user.user_id }"
                @click="selectUserInsight(user)"
              >
                <span>
                  <strong>{{ user.nickname }}</strong>
                  <small>{{ user.user_id }} / {{ user.email }} / {{ user.phone || copy.noPhone }}</small>
                </span>
                <span class="admin-user-role" :class="{ active: user.role === 'admin' }">
                  {{ user.role === 'admin' ? copy.adminRole : copy.customerRole }}
                </span>
                <button
                  v-if="canManageAdmins"
                  type="button"
                  :disabled="user.role === 'admin' || promotingUserIds.has(user.user_id)"
                  @click.stop="makeAdmin(user)"
                >
                  {{ user.role === 'admin' ? copy.alreadyAdmin : copy.makeAdmin }}
                </button>
              </article>
            </div>

            <section class="admin-user-insight">
              <div class="admin-section-head">
              <div>
                <p>USER INSIGHT</p>
                  <h2>用户登录与订单详情</h2>
                </div>
                <label class="admin-user-picker">
                  <span>选择用户</span>
                  <select v-model="selectedUserId" :disabled="!users.length" @change="loadSelectedUserInsight">
                    <option value="" disabled>请选择用户</option>
                    <option v-for="user in users" :key="user.user_id" :value="user.user_id">
                      {{ user.nickname }} / {{ user.user_id }}
                    </option>
                  </select>
                </label>
                <button class="admin-refresh" type="button" :disabled="!selectedUserId || isLoadingUserInsight" @click="loadSelectedUserInsight">
                  {{ isLoadingUserInsight ? copy.loading : '刷新详情' }}
                </button>
              </div>

              <p v-if="userInsightError" class="admin-error">{{ userInsightError }}</p>
              <p v-else-if="!selectedUserId" class="admin-empty">请选择一个用户查看登录和订单情况</p>
              <p v-else-if="isLoadingUserInsight && !selectedUserInsight" class="admin-empty">{{ copy.loading }}</p>

              <div v-else-if="selectedUserInsight" class="admin-user-insight-body">
                <div class="admin-user-insight-title">
                  <span>
                    <strong>{{ selectedUserInsight.user.nickname }}</strong>
                    <small>{{ selectedUserInsight.user.user_id }} / {{ selectedUserInsight.user.email }}</small>
                  </span>
                  <em :class="{ active: selectedUserInsight.user.role === 'admin' }">
                    {{ selectedUserInsight.user.role === 'admin' ? copy.adminRole : copy.customerRole }}
                  </em>
                </div>

                <div class="admin-user-insight-stats">
                  <article><span>注册时间</span><strong>{{ selectedUserInsight.user.createdAt || '-' }}</strong></article>
                  <article><span>登录次数</span><strong>{{ selectedUserInsight.login.loginCount }}</strong></article>
                  <article><span>最近登录</span><strong>{{ selectedUserInsight.login.lastLoginAt || '暂无记录' }}</strong></article>
                  <article><span>订单数量</span><strong>{{ selectedUserInsight.orders.orderCount }}</strong></article>
                  <article><span>商品件数</span><strong>{{ selectedUserInsight.orders.itemCount }}</strong></article>
                  <article><span>订单金额</span><strong>{{ formatPrice(selectedUserInsight.orders.totalAmount) }}</strong></article>
                </div>

                <div class="admin-user-insight-columns">
                  <section>
                    <h3>登录记录</h3>
                    <div class="admin-user-insight-switch">
                      <button type="button" :class="{ active: loginInsightMode === 'recent' }" @click="loginInsightMode = 'recent'">近15天</button>
                      <button type="button" :class="{ active: loginInsightMode === 'history' }" @click="loginInsightMode = 'history'">历史登录</button>
                    </div>
                    <p v-if="!displayedUserLogins.length" class="admin-empty">暂无登录记录</p>
                    <div v-else class="admin-user-insight-list">
                      <article v-for="login in displayedUserLogins" :key="`${login.loginAt}-${login.loginIp}`">
                        <span><strong>{{ login.loginAt || '-' }}</strong><small>{{ login.loginIp || '未知 IP' }}</small></span>
                        <small>{{ login.userAgent || '未记录设备' }}</small>
                      </article>
                    </div>
                  </section>

                  <section>
                    <h3>订单记录</h3>
                    <div class="admin-user-insight-switch">
                      <button type="button" :class="{ active: orderInsightMode === 'recent' }" @click="orderInsightMode = 'recent'">近15天</button>
                      <button type="button" :class="{ active: orderInsightMode === 'history' }" @click="orderInsightMode = 'history'">历史订单</button>
                    </div>
                    <p v-if="!displayedUserOrders.length" class="admin-empty">暂无订单记录</p>
                    <div v-else class="admin-user-insight-list">
                      <article v-for="order in displayedUserOrders" :key="order.orderNo">
                        <span><strong>{{ order.orderNo }}</strong><small>{{ order.createdAt }} / {{ order.itemCount }} {{ copy.items }}</small></span>
                        <b>{{ formatPrice(order.total) }}</b>
                      </article>
                    </div>
                  </section>
                </div>
              </div>
            </section>
          </section>

          <section v-else-if="activeAdminSection === 'orders'" class="admin-orders-panel">
            <section class="admin-chart-panel">
              <div class="admin-section-head">
                <div>
                  <p>{{ copy.chartKicker }}</p>
                  <h2>{{ copy.chartTitle }}</h2>
                </div>
                <div class="admin-chart-actions">
                  <RouterLink class="admin-back-link" to="/">{{ copy.backHome }}</RouterLink>
                  <button class="admin-refresh" type="button" :disabled="isLoadingStats" @click="loadOrderStats">
                    {{ isLoadingStats ? copy.loading : copy.refresh }}
                  </button>
                </div>
              </div>
              <p v-if="statsError" class="admin-error">{{ statsError }}</p>
              <template v-else>
                <div v-if="dailyStats.length" class="admin-line-chart" @mouseleave="hoveredChartIndex = null">
                  <svg :aria-label="copy.chartAria" role="img" viewBox="0 0 720 260" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="admin-chart-orders-fill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#1b1d20" stop-opacity="0.16" />
                        <stop offset="100%" stop-color="#1b1d20" stop-opacity="0" />
                      </linearGradient>
                      <linearGradient id="admin-chart-users-fill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#c28a55" stop-opacity="0.18" />
                        <stop offset="100%" stop-color="#c28a55" stop-opacity="0" />
                      </linearGradient>
                    </defs>

                    <g class="admin-chart-grid">
                      <line v-for="tick in orderChartTicks" :key="`grid-${tick.value}`" x1="54" x2="690" :y1="tick.y" :y2="tick.y" />
                    </g>

                    <g class="admin-chart-axis">
                      <text v-for="tick in orderChartTicks" :key="`tick-${tick.value}`" x="42" :y="tick.y + 4">{{ tick.value }}</text>
                      <text
                        v-for="point in orderChartPoints"
                        :key="`date-${point.date}`"
                        class="admin-chart-date-label"
                        :x="point.x"
                        y="238"
                      >
                        {{ point.label }}
                      </text>
                    </g>

                    <path v-if="orderChartOrderAreaPath" class="admin-chart-area admin-chart-area--orders" :d="orderChartOrderAreaPath" />
                    <path v-if="orderChartUserAreaPath" class="admin-chart-area admin-chart-area--users" :d="orderChartUserAreaPath" />
                    <path v-if="orderChartOrderPath" class="admin-chart-line admin-chart-line--orders" :d="orderChartOrderPath" />
                    <path v-if="orderChartUserPath" class="admin-chart-line admin-chart-line--users" :d="orderChartUserPath" />

                    <g>
                      <circle
                        v-for="(point, index) in orderChartPoints"
                        :key="`order-dot-${point.date}`"
                        class="admin-chart-dot admin-chart-dot--orders"
                        :class="{ active: hoveredChartIndex === index }"
                        :cx="point.x"
                        :cy="point.orderY"
                        :r="hoveredChartIndex === index ? 5 : 3.5"
                      />
                      <circle
                        v-for="(point, index) in orderChartPoints"
                        :key="`user-dot-${point.date}`"
                        class="admin-chart-dot admin-chart-dot--users"
                        :class="{ active: hoveredChartIndex === index }"
                        :cx="point.x"
                        :cy="point.userY"
                        :r="hoveredChartIndex === index ? 5 : 3.5"
                      />
                    </g>

                    <line
                      v-if="hoveredChartPoint"
                      class="admin-chart-hover-line"
                      :x1="hoveredChartPoint.x"
                      :x2="hoveredChartPoint.x"
                      y1="30"
                      y2="208"
                    />
                    <g class="admin-chart-hit-targets">
                      <rect
                        v-for="(point, index) in orderChartPoints"
                        :key="`hit-${point.date}`"
                        :x="point.hitX"
                        y="20"
                        :width="point.hitWidth"
                        height="210"
                        @mouseenter="hoveredChartIndex = index"
                        @focus="hoveredChartIndex = index"
                      />
                    </g>
                  </svg>

                  <div
                    v-if="hoveredChartPoint"
                    class="admin-chart-tooltip"
                    :style="{ left: `${hoveredChartPoint.tooltipX}%`, top: `${hoveredChartPoint.tooltipY}%` }"
                  >
                    <strong>{{ hoveredChartPoint.date }}</strong>
                    <span>{{ copy.orderCountLine }}：{{ hoveredChartPoint.orderCount }}</span>
                    <span>{{ copy.userCountLine }}：{{ hoveredChartPoint.userCount }}</span>
                  </div>
                </div>
                <p v-else class="admin-empty">{{ isLoadingStats ? copy.loading : '暂无趋势数据' }}</p>
                <div class="admin-chart-legend">
                  <span><i class="admin-chart-swatch admin-chart-swatch--orders"></i>{{ copy.orderCountLine }}</span>
                  <span><i class="admin-chart-swatch admin-chart-swatch--users"></i>{{ copy.userCountLine }}</span>
                </div>
              </template>
            </section>

            <section class="admin-orders-board">
              <div class="admin-toolbar">
                <label class="admin-search">
                  <span>{{ copy.searchLabel }}</span>
                  <input v-model.trim="searchQuery" :placeholder="copy.searchPlaceholder" @keydown.enter.prevent="refreshOrders" />
                </label>
                <button class="admin-refresh" type="button" @click="refreshOrders">{{ isLoading ? copy.loading : copy.refresh }}</button>
              </div>
              <p v-if="loadError" class="admin-error">{{ loadError }}</p>
              <p v-else-if="!isLoading && !orders.length" class="admin-empty">{{ copy.empty }}</p>
              <div v-else class="admin-order-list">
                <article v-for="order in orders" :key="order.id" class="admin-order">
                  <button class="admin-order-summary" type="button" @click="toggleOrder(order.id)">
                    <span><strong>{{ order.orderNo }}</strong><small>{{ order.nickname }} / {{ order.email || copy.noEmail }}</small></span>
                    <span><small>{{ order.createdAt }}</small><b>{{ formatPrice(order.total) }}</b></span>
                    <span class="admin-order-summary-meta"><em>{{ order.itemCount }} {{ copy.items }}</em><i :class="`admin-status admin-status--${order.status}`">{{ statusLabel(order.status) }}</i></span>
                  </button>
                  <div v-if="expandedOrderIds.has(order.id)" class="admin-order-detail">
                    <div class="admin-items-table">
                      <div class="admin-items-head"><span>{{ copy.product }}</span><span>{{ copy.styleNo }}</span><span>{{ copy.goodsNo }}</span><span>{{ copy.quantity }}</span><span>{{ copy.unitPrice }}</span><span>{{ copy.lineTotal }}</span></div>
                      <div v-for="item in order.items" :key="`${order.id}-${item.styleNo}-${item.goodsNo}`" class="admin-item-row">
                        <span class="admin-product-cell"><img v-if="item.image" :src="item.image" :alt="item.productName" /><span><strong>{{ item.productName || item.styleNo }}</strong><small>{{ item.productType }}</small></span></span>
                        <span>{{ item.styleNo }}</span><span>{{ item.goodsNo || '-' }}</span><span>{{ item.quantity }}</span><span>{{ formatPrice(item.unitPrice) }}</span><strong>{{ formatPrice(item.lineTotal) }}</strong>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
              <footer v-if="total" class="admin-pagination">
                <span>{{ copy.total }} {{ total }} {{ copy.orders }}</span>
                <div><button type="button" :disabled="page <= 1 || isLoading" @click="changePage(page - 1)">&lt;</button><span>{{ page }} / {{ totalPages }}</span><button type="button" :disabled="page >= totalPages || isLoading" @click="changePage(page + 1)">&gt;</button></div>
              </footer>
            </section>
          </section>

          <section v-else class="admin-jewelry-tools">
            <div v-if="activeJewelryTool === 'menu'" class="admin-section-head">
              <div><p>{{ copy.toolsKicker }}</p><h2>{{ copy.toolsTitle }}</h2></div>
            </div>
            <div v-if="activeJewelryTool === 'menu'" class="admin-tool-entry-grid">
              <button type="button" class="admin-tool-entry" @click="openJewelryTool('quote')">
                <span>报价计算</span>
                <small>金料、主石、副石、工费和利润一页计算</small>
              </button>
              <button type="button" class="admin-tool-entry" @click="openJewelryTool('diamond')">
                <span>钻石尺寸</span>
                <small>查看不同形状钻石尺寸与克拉对照</small>
              </button>
            </div>
            <section v-else-if="activeJewelryTool === 'quote'" class="quote-calculator">
              <div class="quote-page-head">
                <h3>报价计算器</h3>
                <div class="quote-page-actions">
                  <button type="button" class="quote-page-action" @click="openJewelryTool('menu')">返回工具</button>
                  <button type="button" class="quote-page-action" @click="resetQuoteCalculator">清空</button>
                  <button type="button" class="quote-page-action" @click="quickCalculatorOpen = true">计算器</button>
                  <button type="button" class="quote-page-action" @click="quoteExportOpen = true">导出报价表</button>
                </div>
              </div>
              <div class="calc-grid">
                <section class="calc-section">
                  <h5>金料</h5>
                  <label>金料材质
                    <select v-model="quoteForm.metalMaterial" @change="syncMetalPriceToCalculator">
                      <option v-for="option in metalOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                    </select>
                  </label>
                  <label>主体金重<input v-model="quoteForm.mainGoldWeight" type="number" step="0.001" placeholder="请输入" /></label>
                  <label>损耗 %<input v-model="quoteForm.lossRate" type="number" step="0.01" /></label>
                  <label>金价 元/g<input v-model="quoteForm.goldPrice" type="number" step="0.01" /></label>
                </section>
                <output class="calc-result">金值 {{ formatToolMoney(quoteTotals.goldValue) }} 元</output>

                <section class="calc-section stone-section">
                  <h5>主石 / 副石</h5>
                  <div class="stone-group">
                    <h6>主石</h6>
                    <label>主石石重 ct<input v-model="quoteForm.mainStoneWeight" type="number" step="0.001" placeholder="请输入" /></label>
                    <label>主石单价 元/ct<input v-model="quoteForm.mainStonePrice" type="number" step="0.01" placeholder="请输入" /></label>
                    <label>主石粒数 粒<input v-model="quoteForm.mainStoneCount" type="number" step="1" placeholder="请输入" /></label>
                    <label>主石镶工 元/粒<input v-model="quoteForm.mainStoneLabor" type="number" step="0.01" placeholder="请输入" /></label>
                  </div>
                  <div class="stone-group">
                    <div class="stone-group-head">
                      <h6>副石</h6>
                      <output class="stone-group-count">副石总粒数 {{ formatToolMoney(quoteTotals.sideStoneCount) }} 粒</output>
                      <button class="icon-btn mini-icon-btn" type="button" title="新增副石种类" @click="addSideStoneRow">+</button>
                    </div>
                    <div class="side-stone-rows">
                      <div v-for="(stone, index) in sideStones" :key="stone.id" class="side-stone-row">
                        <label>副石克拉 ct<input v-model="stone.weight" type="number" step="0.001" placeholder="ct" /></label>
                        <label>粒数 粒<input v-model="stone.count" type="number" step="1" placeholder="请输入" /></label>
                        <label>单价 元/ct<input v-model="stone.price" type="number" step="0.01" placeholder="请输入" /></label>
                        <label>镶工 元/粒<input v-model="stone.labor" type="number" step="0.01" placeholder="请输入" /></label>
                        <button
                          v-if="sideStones.length > 1"
                          class="icon-btn mini-icon-btn danger-icon-btn"
                          type="button"
                          title="删除副石种类"
                          @click="removeSideStoneRow(index)"
                        >
                          -
                        </button>
                        <span v-else class="side-stone-action-spacer" aria-hidden="true"></span>
                      </div>
                    </div>
                  </div>
                </section>
                <div class="calc-result-stack tall-result">
                  <output>主石金额 {{ formatToolMoney(quoteTotals.mainStoneValue) }} 元</output>
                  <output>主石镶费 {{ formatToolMoney(quoteTotals.mainStoneLabor) }} 元</output>
                  <output>副石金额 {{ formatToolMoney(quoteTotals.sideStoneValue) }} 元</output>
                  <output>副石镶费 {{ formatToolMoney(quoteTotals.sideStoneLabor) }} 元</output>
                </div>

                <section class="calc-section">
                  <h5>镶工 / 其他费用</h5>
                  <label>基本工费<input v-model="quoteForm.laborFee" type="number" step="0.01" placeholder="元" /></label>
                  <label>起版费<input v-model="quoteForm.moldFee" type="number" step="0.01" placeholder="元" /></label>
                  <label>保险费<input v-model="quoteForm.insuranceFee" type="number" step="0.01" placeholder="元" /></label>
                  <label>其他<input v-model="quoteForm.otherFee" type="number" step="0.01" placeholder="元" /></label>
                </section>
                <output class="calc-result">总工费 {{ formatToolMoney(quoteTotals.workFee) }} 元</output>
              </div>
              <div class="quote-total-stack">
                <label class="quote-profit-field">利润点 %<input v-model="quoteForm.profitRate" type="number" step="0.01" placeholder="请输入" /></label>
                <output class="calc-result grand-result quote-total-result">{{ quoteTotals.total === null ? '总费用 - 元' : `总费用 ${formatToolMoney(quoteTotals.total)} 元` }}</output>
              </div>
              <textarea v-model="quoteForm.note" class="quote-note" placeholder="请输入备注"></textarea>

              <dialog v-if="quickCalculatorOpen" open class="admin-tool-modal">
                <form method="dialog" class="dialog-form" @submit.prevent="calculateQuickCalculator">
                  <div class="admin-tool-subhead">
                    <div><h3>计算器</h3></div>
                    <button type="button" @click="quickCalculatorOpen = false">关闭</button>
                  </div>
                  <label>算式
                    <input v-model="quickCalculatorExpression" inputmode="decimal" placeholder="例如 18*3.5+200" />
                  </label>
                  <p v-if="quickCalculatorError" class="admin-error">{{ quickCalculatorError }}</p>
                  <button type="submit" class="quote-page-action">计算</button>
                </form>
              </dialog>

              <dialog v-if="quoteExportOpen" open class="admin-tool-modal">
                <form class="dialog-form" @submit.prevent="downloadQuoteExcel">
                  <div class="admin-tool-subhead">
                    <div><h3>导出报价表</h3><p>勾选需要导出的报价字段</p></div>
                    <button type="button" @click="quoteExportOpen = false">关闭</button>
                  </div>
                  <div class="admin-quote-field-groups">
                    <section v-for="group in quoteExportGroups" :key="group.id" class="admin-quote-field-group">
                      <div class="admin-quote-field-group-head">
                        <h4>{{ group.label }}</h4>
                        <span>
                          <button type="button" class="quote-page-action" @click="setQuoteGroupFields(group, true)">本类全选</button>
                          <button type="button" class="quote-page-action" @click="setQuoteGroupFields(group, false)">本类清空</button>
                        </span>
                      </div>
                      <div class="admin-quote-field-grid">
                        <label v-for="field in getQuoteGroupFields(group)" :key="field.key">
                          <input v-model="selectedQuoteExportFields" type="checkbox" :value="field.key" />
                          <span>{{ field.label }}</span>
                        </label>
                      </div>
                    </section>
                  </div>
                  <p v-if="quoteExportError" class="admin-error">{{ quoteExportError }}</p>
                  <button type="submit" class="quote-page-action" :disabled="isExportingQuote">
                    {{ isExportingQuote ? '导出中...' : '导出报价表' }}
                  </button>
                </form>
              </dialog>
            </section>
            <section v-else class="admin-diamond-size-tool">
              <div class="admin-tool-subhead">
                <div><h3>钻石尺寸</h3><p>{{ diamondSizeMeta }}</p></div>
                <button type="button" :disabled="isLoadingDiamond" @click="loadDiamondSizes(true)">{{ isLoadingDiamond ? copy.loading : '刷新尺寸' }}</button>
              </div>
              <p v-if="diamondError" class="admin-error">{{ diamondError }}</p>
              <div class="admin-diamond-tabs">
                <button v-for="(shape, index) in diamondShapes" :key="shape.name" type="button" :class="{ active: diamondSizeIndex === index }" @click="diamondSizeIndex = index">{{ shape.name }}</button>
              </div>
              <div class="admin-diamond-table-wrap">
                <table class="admin-diamond-table">
                  <thead><tr><th>尺寸(mm)</th><th>重量(ct)</th><th>尺寸(mm)</th><th>重量(ct)</th></tr></thead>
                  <tbody>
                    <tr v-for="(row, index) in activeDiamondShapeRows" :key="index">
                      <td>{{ row.sizeA || '-' }}</td>
                      <td>{{ row.weightA || '-' }}</td>
                      <td>{{ row.sizeB || '-' }}</td>
                      <td>{{ row.weightB || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        </div>
      </section>
    </div>
  </section>
  <section v-else class="admin-page">
    <div class="admin-shell">
      <div class="admin-user-management">
        <p class="admin-error">请先登录管理员账号</p>
        <RouterLink class="admin-back-link" :to="{ name: 'adminLogin' }">进入管理员登录</RouterLink>
      </div>
    </div>
  </section>
</template>
<script setup>
import { computed, reactive, onMounted, ref } from 'vue'

import { useAuth } from '../composables/useAuth'
import { useLocale } from '../composables/useLocale'
import { formatCurrencyFromCny } from '../utils/currency'

const { locale, currencyRegion } = useLocale()
const { currentUser } = useAuth()

const copies = {
  zh: {
    kicker: 'DERING ADMIN',
    title: '管理后台',
    backHome: '返回网站',
    loginTitle: '管理员登录',
    registerTitle: '注册管理员',
    goLogin: '已有账号登录',
    goRegister: '注册管理员',
    nickname: '管理员账号',
    password: '密码',
    email: '邮箱',
    emailCode: '邮箱验证码',
    phone: '手机号',
    sendOtp: '发送验证码',
    sendingOtp: '发送中...',
    otpSent: '验证码已发送，请去邮箱查看',
    register: '注册并进入后台',
    registering: '注册中...',
    login: '登录后台',
    loggingIn: '登录中...',
    userKicker: 'USER ADMIN',
    userTitle: '用户管理',
    userSearchPlaceholder: '搜索昵称、邮箱或手机号',
    searchUsers: '搜索用户',
    adminRole: '管理员',
    customerRole: '普通用户',
    makeAdmin: '设为管理员',
    alreadyAdmin: '已是管理员',
    userRequestFailed: '用户列表加载失败',
    chartKicker: 'ORDER ANALYTICS',
    chartTitle: '每日下单趋势',
    chartAria: '每日下单商品数量和下单用户数量折线图',
    orderCountLine: '每日下单数量',
    userCountLine: '每日下单用户数',
    statsRequestFailed: '订单统计加载失败',
    toolsKicker: 'JEWELRY TOOLS',
    toolsTitle: '珠宝工具',
    toolsPlaceholderTitle: '珠宝工具页面',
    toolsPlaceholderBody: '后续可以在这里添加尺寸换算、证书查询、价格计算等工具。',
    searchLabel: '搜索订单',
    searchPlaceholder: '订单号、昵称或邮箱',
    refresh: '刷新订单',
    loading: '加载中...',
    empty: '暂无已提交订单',
    noEmail: '未填写邮箱',
    noPhone: '未填写手机号',
    customer: '客户',
    product: '产品',
    styleNo: '款号',
    goodsNo: '货号',
    quantity: '数量',
    unitPrice: '单价',
    lineTotal: '小计',
    items: '件',
    total: '共',
    orders: '个订单',
    submitted: '已提交',
    loginFailed: '管理员账号或密码错误',
    registerFailed: '管理员注册失败，请检查信息后再试',
    noPermission: '该账号没有管理员权限',
    requestFailed: '订单加载失败，请稍后重试',
  },
  en: {
    kicker: 'DERING ADMIN',
    title: 'Admin Console',
    backHome: 'Back to site',
    loginTitle: 'Administrator Login',
    registerTitle: 'Register Administrator',
    goLogin: 'Sign in instead',
    goRegister: 'Register admin',
    nickname: 'Admin account',
    password: 'Password',
    email: 'Email',
    emailCode: 'Email code',
    phone: 'Phone',
    sendOtp: 'Send code',
    sendingOtp: 'Sending...',
    otpSent: 'Verification code sent',
    register: 'Register and enter',
    registering: 'Registering...',
    login: 'Enter dashboard',
    loggingIn: 'Signing in...',
    userKicker: 'USER ADMIN',
    userTitle: 'User Management',
    userSearchPlaceholder: 'Search nickname, email, or phone',
    searchUsers: 'Search users',
    adminRole: 'Admin',
    customerRole: 'Customer',
    makeAdmin: 'Make admin',
    alreadyAdmin: 'Already admin',
    userRequestFailed: 'Failed to load users',
    chartKicker: 'ORDER ANALYTICS',
    chartTitle: 'Daily Order Trend',
    chartAria: 'Line chart of daily ordered item quantity and ordering user count',
    orderCountLine: 'Ordered item quantity',
    userCountLine: 'Ordering users',
    statsRequestFailed: 'Failed to load order statistics',
    toolsKicker: 'JEWELRY TOOLS',
    toolsTitle: 'Jewelry Tools',
    toolsPlaceholderTitle: 'Jewelry tools page',
    toolsPlaceholderBody: 'Add sizing, certificate lookup, price calculation, and other tools here later.',
    searchLabel: 'Search orders',
    searchPlaceholder: 'Order no., nickname, or email',
    refresh: 'Refresh',
    loading: 'Loading...',
    empty: 'No submitted orders',
    noEmail: 'No email',
    noPhone: 'No phone',
    customer: 'Customer',
    product: 'Product',
    styleNo: 'Style No.',
    goodsNo: 'Goods No.',
    quantity: 'Qty',
    unitPrice: 'Unit price',
    lineTotal: 'Line total',
    items: 'items',
    total: 'Total',
    orders: 'orders',
    submitted: 'Submitted',
    loginFailed: 'Invalid administrator credentials',
    registerFailed: 'Failed to register administrator',
    noPermission: 'This account does not have administrator access',
    requestFailed: 'Failed to load orders',
  },
}

const copy = computed(() => copies[locale.value] ?? copies.zh)
const isAdmin = computed(() => currentUser.value?.role === 'admin')
const adminManagerNicknames = new Set(['knxxx', 'Gut'])
const canManageAdmins = computed(() => {
  const nickname = String(currentUser.value?.nickname || '').trim()
  return Boolean(currentUser.value?.canManageAdmins) || adminManagerNicknames.has(nickname)
})
const activeAdminSection = ref('settings')
const adminNavItems = computed(() => [
  {
    key: 'settings',
    label: locale.value === 'en' ? 'Permissions' : '权限设置',
  },
  {
    key: 'orders',
    label: locale.value === 'en' ? 'User Order Details' : '用户订单详情',
  },
  {
    key: 'tools',
    label: locale.value === 'en' ? 'Jewelry Tools' : '珠宝工具',
  },
])
const deringHomeLinks = computed(() => [
  {
    key: 'home',
    kicker: 'HOME',
    label: locale.value === 'en' ? 'Home' : '首页',
    description: locale.value === 'en' ? 'Brand hero and featured collections' : '品牌首页和精选系列',
    to: { name: 'home' },
  },
  {
    key: 'products',
    kicker: 'SHOP',
    label: locale.value === 'en' ? 'All Products' : '全部产品',
    description: locale.value === 'en' ? 'Browse the full user-facing catalog' : '查看用户端完整商品列表',
    to: { name: 'products' },
  },
  {
    key: 'bracelet',
    kicker: 'CATEGORY',
    label: locale.value === 'en' ? 'Bracelets' : '手链',
    description: locale.value === 'en' ? 'Open bracelet products' : '进入手链分类页面',
    to: { name: 'products', query: { type: '手链' } },
  },
  {
    key: 'earrings',
    kicker: 'CATEGORY',
    label: locale.value === 'en' ? 'Earrings' : '耳饰',
    description: locale.value === 'en' ? 'Open earring products' : '进入耳饰分类页面',
    to: { name: 'products', query: { type: '耳饰' } },
  },
  {
    key: 'ring',
    kicker: 'CATEGORY',
    label: locale.value === 'en' ? 'Rings' : '戒指',
    description: locale.value === 'en' ? 'Open ring products' : '进入戒指分类页面',
    to: { name: 'products', query: { type: '戒指' } },
  },
  {
    key: 'necklace',
    kicker: 'CATEGORY',
    label: locale.value === 'en' ? 'Necklaces' : '项链',
    description: locale.value === 'en' ? 'Open necklace products' : '进入项链分类页面',
    to: { name: 'products', query: { type: '项链' } },
  },
  {
    key: 'pendant',
    kicker: 'CATEGORY',
    label: locale.value === 'en' ? 'Pendants' : '吊坠',
    description: locale.value === 'en' ? 'Open pendant products' : '进入吊坠分类页面',
    to: { name: 'products', query: { type: '吊坠' } },
  },
  {
    key: 'looseStone',
    kicker: 'CATEGORY',
    label: locale.value === 'en' ? 'Loose Stones' : '裸石',
    description: locale.value === 'en' ? 'Open loose stone products' : '进入裸石分类页面',
    to: { name: 'products', query: { type: '裸石' } },
  },
  {
    key: 'custom',
    kicker: 'CATEGORY',
    label: locale.value === 'en' ? 'Custom' : '定制',
    description: locale.value === 'en' ? 'Open custom products' : '进入定制分类页面',
    to: { name: 'products', query: { type: '定制' } },
  },
  {
    key: 'about',
    kicker: 'BRAND',
    label: locale.value === 'en' ? 'About DERING' : '品牌故事',
    description: locale.value === 'en' ? 'Company and brand introduction' : '公司与品牌介绍页面',
    to: { name: 'about' },
  },
  {
    key: 'process',
    kicker: 'GUIDE',
    label: locale.value === 'en' ? 'Process' : '工艺流程',
    description: locale.value === 'en' ? 'Craft and process page' : '用户端工艺流程页面',
    to: { name: 'process' },
  },
  {
    key: '4c',
    kicker: 'GUIDE',
    label: locale.value === 'en' ? '4C Guide' : '4C指南',
    description: locale.value === 'en' ? 'Diamond education page' : '钻石4C知识页面',
    to: { name: '4c' },
  },
  {
    key: 'advantages',
    kicker: 'GUIDE',
    label: locale.value === 'en' ? 'Advantages' : '品牌优势',
    description: locale.value === 'en' ? 'DERING service advantages' : '用户端优势展示页面',
    to: { name: 'advantages' },
  },
  {
    key: 'buyingGuide',
    kicker: 'GUIDE',
    label: locale.value === 'en' ? 'Buying Guide' : '购买指南',
    description: locale.value === 'en' ? 'Shopping and selection guide' : '购买流程与选购帮助',
    to: { name: 'buyingGuide' },
  },
  {
    key: 'faq',
    kicker: 'HELP',
    label: locale.value === 'en' ? 'FAQ' : '常见问题',
    description: locale.value === 'en' ? 'Frequently asked questions' : '用户端常见问题页面',
    to: { name: 'faq' },
  },
  {
    key: 'contact',
    kicker: 'HELP',
    label: locale.value === 'en' ? 'Contact' : '联系我们',
    description: locale.value === 'en' ? 'Consultation and contact page' : '咨询和联系方式页面',
    to: { name: 'contact' },
  },
  {
    key: 'search',
    kicker: 'TOOLS',
    label: locale.value === 'en' ? 'Search' : '搜索',
    description: locale.value === 'en' ? 'User-facing search page' : '用户端搜索页面',
    to: { name: 'search' },
  },
  {
    key: 'preferences',
    kicker: 'ACCOUNT',
    label: locale.value === 'en' ? 'Preferences' : '偏好设置',
    description: locale.value === 'en' ? 'Language and account preferences' : '语言与账户偏好页面',
    to: { name: 'preferences' },
  },
  {
    key: 'cart',
    kicker: 'ACCOUNT',
    label: locale.value === 'en' ? 'Cart' : '购物车',
    description: locale.value === 'en' ? 'Customer shopping bag' : '用户端购物车页面',
    to: { name: 'cart' },
  },
  {
    key: 'orders',
    kicker: 'ACCOUNT',
    label: locale.value === 'en' ? 'Orders' : '我的订单',
    description: locale.value === 'en' ? 'Customer order page' : '用户端订单页面',
    to: { name: 'orders' },
  },
])
const orders = ref([])
const users = ref([])
const selectedUserId = ref('')
const selectedUserInsight = ref(null)
const loginInsightMode = ref('recent')
const orderInsightMode = ref('recent')
const dailyStats = ref([])
const isLoading = ref(false)
const isLoadingUsers = ref(false)
const isLoadingUserInsight = ref(false)
const isLoadingStats = ref(false)
const loadError = ref('')
const usersError = ref('')
const userInsightError = ref('')
const statsError = ref('')
const searchQuery = ref('')
const userSearchQuery = ref('')
const hoveredChartIndex = ref(null)
const page = ref(1)
const total = ref(0)
const pageSize = 20
const activeJewelryTool = ref('menu')
const goldPrices = ref(null)
const goldError = ref('')
const isLoadingGold = ref(false)
const diamondSizes = ref(null)
const diamondSizeIndex = ref(0)
const diamondError = ref('')
const isLoadingDiamond = ref(false)
const quoteExportOpen = ref(false)
const quoteExportError = ref('')
const isExportingQuote = ref(false)
const quickCalculatorOpen = ref(false)
const quickCalculatorExpression = ref('0')
const quickCalculatorError = ref('')
const quoteForm = reactive({
  metalMaterial: 'JZJ_au:1',
  mainGoldWeight: '',
  lossRate: '15',
  goldPrice: '686.25',
  mainStoneWeight: '',
  mainStonePrice: '',
  mainStoneCount: '',
  mainStoneLabor: '',
  laborFee: '',
  moldFee: '',
  insuranceFee: '',
  otherFee: '',
  profitRate: '',
  note: '',
})
let sideStoneId = 1
const sideStones = ref([{ id: sideStoneId, weight: '', count: '', price: '', labor: '' }])
const metalOptions = [
  { value: 'JZJ_au:1', code: 'JZJ_au', purity: 1, label: '足金 / 24K' },
  { value: 'JZJ_au:0.916', code: 'JZJ_au', purity: 0.916, label: '22K金' },
  { value: 'JZJ_au:0.75', code: 'JZJ_au', purity: 0.75, label: '18K金' },
  { value: 'JZJ_au:0.585', code: 'JZJ_au', purity: 0.585, label: '14K金' },
  { value: 'JZJ_au:0.375', code: 'JZJ_au', purity: 0.375, label: '9K金' },
  { value: 'JZJ_ag:1', code: 'JZJ_ag', purity: 1, label: '白银' },
  { value: 'JZJ_pt:1', code: 'JZJ_pt', purity: 1, label: '铂金' },
]
const quoteExportFields = [
  { key: 'quoted_at', label: '报价时间', checked: true },
  { key: 'metal_material', label: '金料材质', checked: true },
  { key: 'main_gold_weight', label: '主体金重', checked: true },
  { key: 'loss_rate', label: '损耗', checked: true },
  { key: 'gold_price', label: '金价', checked: true },
  { key: 'gold_value', label: '金值', checked: true },
  { key: 'main_stone_weight', label: '主石石重', checked: true },
  { key: 'main_stone_price', label: '主石单价', checked: true },
  { key: 'main_stone_count', label: '主石粒数', checked: true },
  { key: 'main_stone_labor_price', label: '主石镶工', checked: true },
  { key: 'main_stone_value', label: '主石金额', checked: true },
  { key: 'main_stone_labor', label: '主石镶费', checked: true },
  { key: 'side_stone_detail', label: '副石明细', checked: true },
  { key: 'side_stone_count', label: '副石总粒数', checked: true },
  { key: 'side_stone_value', label: '副石金额', checked: true },
  { key: 'side_stone_labor', label: '副石镶费', checked: true },
  { key: 'labor_fee', label: '基本工费', checked: true },
  { key: 'mold_fee', label: '起版费', checked: true },
  { key: 'insurance_fee', label: '保险费', checked: true },
  { key: 'other_fee', label: '其他', checked: true },
  { key: 'work_fee', label: '总工费', checked: true },
  { key: 'profit_rate', label: '利润点', checked: true },
  { key: 'total', label: '总费用', checked: true },
  { key: 'note', label: '备注', checked: true },
]
const quoteExportGroups = [
  { id: 'base', label: '基础信息', fields: ['quoted_at', 'metal_material'] },
  { id: 'gold', label: '金料', fields: ['main_gold_weight', 'loss_rate', 'gold_price', 'gold_value'] },
  { id: 'mainStone', label: '主石', fields: ['main_stone_weight', 'main_stone_price', 'main_stone_count', 'main_stone_labor_price', 'main_stone_value', 'main_stone_labor'] },
  { id: 'sideStone', label: '副石', fields: ['side_stone_detail', 'side_stone_count', 'side_stone_value', 'side_stone_labor'] },
  { id: 'fees', label: '工费 / 利润', fields: ['labor_fee', 'mold_fee', 'insurance_fee', 'other_fee', 'work_fee', 'profit_rate', 'total'] },
  { id: 'note', label: '备注', fields: ['note'] },
]
const selectedQuoteExportFields = ref(quoteExportFields.filter((field) => field.checked).map((field) => field.key))
const expandedOrderIds = ref(new Set())
const promotingUserIds = ref(new Set())
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const selectedMetalOption = computed(() => metalOptions.find((option) => option.value === quoteForm.metalMaterial) || metalOptions[0])
const goldPriceItems = computed(() => goldPrices.value?.prices || [])
const goldPriceMeta = computed(() => {
  if (!goldPrices.value) {
    return '数据来源：等待加载'
  }

  const fetchedAt = goldPrices.value.fetchedAt ? formatToolDate(goldPrices.value.fetchedAt) : '-'
  return `数据来源：${goldPrices.value.source || '-'} / 更新：${fetchedAt}`
})
const sideStoneTotals = computed(() => {
  return sideStones.value.reduce((totals, stone) => {
    const weight = numberValue(stone.weight)
    const count = numberValue(stone.count)
    const price = numberValue(stone.price)
    const labor = numberValue(stone.labor)
    totals.count += count
    totals.value += weight * price
    totals.labor += count * labor
    if (weight || count || price || labor) {
      totals.items.push({ weight, count, price, labor })
    }
    return totals
  }, { count: 0, value: 0, labor: 0, items: [] })
})
const quoteTotals = computed(() => {
  const goldValue = numberValue(quoteForm.mainGoldWeight)
    * (1 + numberValue(quoteForm.lossRate) / 100)
    * numberValue(quoteForm.goldPrice)
    * Number(selectedMetalOption.value.purity || 1)
  const mainStoneValue = numberValue(quoteForm.mainStoneWeight) * numberValue(quoteForm.mainStonePrice)
  const mainStoneLabor = numberValue(quoteForm.mainStoneCount) * numberValue(quoteForm.mainStoneLabor)
  const workFee = numberValue(quoteForm.laborFee)
    + numberValue(quoteForm.moldFee)
    + numberValue(quoteForm.insuranceFee)
    + numberValue(quoteForm.otherFee)
  const baseTotal = goldValue
    + mainStoneValue
    + mainStoneLabor
    + sideStoneTotals.value.value
    + sideStoneTotals.value.labor
    + workFee
  const profitRate = numberValue(quoteForm.profitRate)
  const totalQuote = profitRate >= 100 ? null : baseTotal / (1 - profitRate / 100)

  return {
    goldValue,
    mainStoneValue,
    mainStoneLabor,
    sideStoneCount: sideStoneTotals.value.count,
    sideStoneValue: sideStoneTotals.value.value,
    sideStoneLabor: sideStoneTotals.value.labor,
    sideStoneItems: sideStoneTotals.value.items,
    workFee,
    total: totalQuote,
  }
})
const diamondShapes = computed(() => diamondSizes.value?.shapes || [])
const activeDiamondShapeRows = computed(() => diamondShapes.value[diamondSizeIndex.value]?.rows || [])
const diamondSizeMeta = computed(() => {
  if (!diamondSizes.value) {
    return '数据来源：等待加载'
  }
  const savedAt = diamondSizes.value.savedAt ? formatToolDate(diamondSizes.value.savedAt) : '-'
  return `数据来源：${diamondSizes.value.originalSource || diamondSizes.value.source || '-'} / 保存：${savedAt}`
})
const displayedUserLogins = computed(() => {
  const login = selectedUserInsight.value?.login
  if (!login) {
    return []
  }

  return loginInsightMode.value === 'history'
    ? login.historyLogins || []
    : login.recentLogins || []
})
const displayedUserOrders = computed(() => {
  const ordersInsight = selectedUserInsight.value?.orders
  if (!ordersInsight) {
    return []
  }

  return orderInsightMode.value === 'history'
    ? ordersInsight.historyOrders || []
    : ordersInsight.recentOrders || []
})
const orderChartMax = computed(() => {
  const values = dailyStats.value.flatMap((item) => [Number(item.orderCount || 0), Number(item.userCount || 0)])
  return Math.max(1, ...values)
})
const orderChartTicks = computed(() => {
  const max = orderChartMax.value
  const middle = Math.ceil(max / 2)
  return [max, middle, 0].map((value) => ({
    value,
    y: getOrderChartY(value),
  }))
})
const orderChartPoints = computed(() => {
  const data = dailyStats.value
  const xStart = 54
  const xEnd = 690
  const span = Math.max(data.length - 1, 1)
  const hitWidth = (xEnd - xStart) / Math.max(data.length, 1)

  return data.map((item, index) => {
    const x = xStart + ((xEnd - xStart) * index) / span
    const orderCount = Number(item.orderCount || 0)
    const userCount = Number(item.userCount || 0)
    return {
      date: item.date,
      label: formatChartDate(item.date),
      x,
      hitX: index === 0 ? xStart - hitWidth / 2 : x - hitWidth / 2,
      hitWidth,
      tooltipX: Math.min(Math.max((x / 720) * 100, 8), 92),
      tooltipY: (Math.min(getOrderChartY(orderCount), getOrderChartY(userCount)) / 260) * 100,
      orderCount,
      userCount,
      orderY: getOrderChartY(orderCount),
      userY: getOrderChartY(userCount),
    }
  })
})
const hoveredChartPoint = computed(() => {
  if (hoveredChartIndex.value === null) {
    return null
  }

  return orderChartPoints.value[hoveredChartIndex.value] || null
})
const orderChartOrderPath = computed(() => buildSmoothChartPath(orderChartPoints.value, 'orderY'))
const orderChartUserPath = computed(() => buildSmoothChartPath(orderChartPoints.value, 'userY'))
const orderChartOrderAreaPath = computed(() => buildChartAreaPath(orderChartPoints.value, 'orderY'))
const orderChartUserAreaPath = computed(() => buildChartAreaPath(orderChartPoints.value, 'userY'))

function getToken() {
  return String(currentUser.value?.token || '').trim()
}

function formatPrice(value) {
  return formatCurrencyFromCny(Number(value || 0), currencyRegion.value)
}

function statusLabel(status) {
  return status === 'submitted' ? copy.value.submitted : status
}

function getOrderChartY(value) {
  const yTop = 30
  const yBottom = 208
  return yBottom - (Number(value || 0) / orderChartMax.value) * (yBottom - yTop)
}

function formatChartDate(dateValue) {
  const [, month = '', day = ''] = String(dateValue || '').split('-')
  return month && day ? `${month}-${day}` : String(dateValue || '')
}

function buildSmoothChartPath(points, yKey) {
  if (!points.length) {
    return ''
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0][yKey]}`
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point[yKey]}`
    }

    const previous = points[index - 1]
    const controlX = previous.x + (point.x - previous.x) / 2
    return `${path} C ${controlX} ${previous[yKey]}, ${controlX} ${point[yKey]}, ${point.x} ${point[yKey]}`
  }, '')
}

function buildChartAreaPath(points, yKey) {
  if (!points.length) {
    return ''
  }

  const baseline = 208
  const linePath = buildSmoothChartPath(points, yKey)
  const first = points[0]
  const last = points[points.length - 1]
  return `${linePath} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`
}

function numberValue(value) {
  const number = Number(value || 0)
  return Number.isFinite(number) ? number : 0
}

function formatToolMoney(value) {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

function formatToolDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value || '-')
  }
  return date.toLocaleString('zh-CN', { hour12: false })
}

function openJewelryTool(tool) {
  activeJewelryTool.value = tool
  if (tool === 'quote') {
    loadGoldPrices()
  }
  if (tool === 'diamond') {
    loadDiamondSizes()
  }
}

async function loadGoldPrices(force = false) {
  if (!force && goldPrices.value) {
    return
  }
  if (!isAdmin.value || !getToken()) {
    return
  }

  isLoadingGold.value = true
  goldError.value = ''
  try {
    const response = await fetch('/api/admin/jewelry-tools/gold-prices', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    const payload = await parseJson(response)
    if (!response.ok) {
      throw new Error(payload.detail || '金价加载失败')
    }
    goldPrices.value = payload
    if (payload.fallback && payload.message) {
      goldError.value = payload.message
    }
    syncMetalPriceToCalculator()
  } catch (error) {
    goldError.value = error instanceof Error ? error.message : '金价加载失败'
  } finally {
    isLoadingGold.value = false
  }
}

function getRealtimeMetalPrice(code = selectedMetalOption.value.code) {
  const price = goldPriceItems.value.find((item) => item.code === code)
  const value = Number(String(price?.current || '').replaceAll(',', '').trim())
  return Number.isFinite(value) && value > 0 ? value.toFixed(2) : ''
}

function syncMetalPriceToCalculator() {
  const realtimePrice = getRealtimeMetalPrice()
  if (realtimePrice) {
    quoteForm.goldPrice = realtimePrice
  }
}

function resetQuoteCalculator() {
  const realtimePrice = getRealtimeMetalPrice('JZJ_au')
  quoteForm.metalMaterial = 'JZJ_au:1'
  quoteForm.mainGoldWeight = ''
  quoteForm.lossRate = '15'
  quoteForm.goldPrice = realtimePrice || '686.25'
  quoteForm.mainStoneWeight = ''
  quoteForm.mainStonePrice = ''
  quoteForm.mainStoneCount = ''
  quoteForm.mainStoneLabor = ''
  quoteForm.laborFee = ''
  quoteForm.moldFee = ''
  quoteForm.insuranceFee = ''
  quoteForm.otherFee = ''
  quoteForm.profitRate = ''
  quoteForm.note = ''
  sideStoneId = 1
  sideStones.value = [{ id: sideStoneId, weight: '', count: '', price: '', labor: '' }]
}

function addSideStoneRow() {
  sideStoneId += 1
  sideStones.value = [...sideStones.value, { id: sideStoneId, weight: '', count: '', price: '', labor: '' }]
}

function removeSideStoneRow(index) {
  if (sideStones.value.length === 1) {
    return
  }
  sideStones.value = sideStones.value.filter((_, currentIndex) => currentIndex !== index)
}

async function loadDiamondSizes(force = false) {
  if (!force && diamondSizes.value) {
    return
  }
  if (!isAdmin.value || !getToken()) {
    return
  }

  isLoadingDiamond.value = true
  diamondError.value = ''
  try {
    const response = await fetch('/api/admin/jewelry-tools/diamond-sizes', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    const payload = await parseJson(response)
    if (!response.ok) {
      throw new Error(payload.detail || '钻石尺寸加载失败')
    }
    diamondSizes.value = payload
    if (diamondSizeIndex.value >= diamondShapes.value.length) {
      diamondSizeIndex.value = 0
    }
  } catch (error) {
    diamondError.value = error instanceof Error ? error.message : '钻石尺寸加载失败'
  } finally {
    isLoadingDiamond.value = false
  }
}

function getQuoteGroupFields(group) {
  const keys = new Set(group.fields)
  return quoteExportFields.filter((field) => keys.has(field.key))
}

function setQuoteGroupFields(group, checked) {
  const groupKeys = new Set(group.fields)
  const current = new Set(selectedQuoteExportFields.value)
  quoteExportFields.forEach((field) => {
    if (!groupKeys.has(field.key)) {
      return
    }
    if (checked) {
      current.add(field.key)
    } else {
      current.delete(field.key)
    }
  })
  selectedQuoteExportFields.value = Array.from(current)
}

function getQuoteExportData() {
  const sideStoneDetail = quoteTotals.value.sideStoneItems
    .map((item, index) => (
      `副石种类${index + 1}: 克拉 ${item.weight || 0}ct, 粒数 ${item.count || 0}, 单价 ${item.price || 0}元/ct, 镶工 ${item.labor || 0}元/粒`
    ))
    .join('\n')

  return {
    quoted_at: formatToolDate(new Date()),
    metal_material: selectedMetalOption.value.label,
    main_gold_weight: quoteForm.mainGoldWeight,
    loss_rate: quoteForm.lossRate,
    gold_price: quoteForm.goldPrice,
    gold_value: formatToolMoney(quoteTotals.value.goldValue),
    main_stone_weight: quoteForm.mainStoneWeight,
    main_stone_price: quoteForm.mainStonePrice,
    main_stone_count: quoteForm.mainStoneCount,
    main_stone_labor_price: quoteForm.mainStoneLabor,
    main_stone_value: formatToolMoney(quoteTotals.value.mainStoneValue),
    main_stone_labor: formatToolMoney(quoteTotals.value.mainStoneLabor),
    side_stone_detail: sideStoneDetail,
    side_stone_count: formatToolMoney(quoteTotals.value.sideStoneCount),
    side_stone_value: formatToolMoney(quoteTotals.value.sideStoneValue),
    side_stone_labor: formatToolMoney(quoteTotals.value.sideStoneLabor),
    labor_fee: quoteForm.laborFee,
    mold_fee: quoteForm.moldFee,
    insurance_fee: quoteForm.insuranceFee,
    other_fee: quoteForm.otherFee,
    work_fee: formatToolMoney(quoteTotals.value.workFee),
    profit_rate: quoteForm.profitRate,
    total: quoteTotals.value.total === null ? '' : formatToolMoney(quoteTotals.value.total),
    note: quoteForm.note.trim(),
  }
}

async function downloadQuoteExcel() {
  quoteExportError.value = ''
  if (!selectedQuoteExportFields.value.length) {
    quoteExportError.value = '请至少选择一个导出字段'
    return
  }

  isExportingQuote.value = true
  try {
    const response = await fetch('/api/admin/jewelry-tools/quotes/export', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: selectedQuoteExportFields.value,
        quote: getQuoteExportData(),
      }),
    })
    if (!response.ok) {
      throw new Error(await readError(response, '导出报价表失败'))
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `quote_${new Date().toISOString().slice(0, 10).replaceAll('-', '')}.xlsx`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    quoteExportOpen.value = false
  } catch (error) {
    quoteExportError.value = error instanceof Error ? error.message : '导出报价表失败'
  } finally {
    isExportingQuote.value = false
  }
}

function calculateQuickCalculator() {
  const expression = quickCalculatorExpression.value.trim()
  quickCalculatorError.value = ''
  if (!expression || !/^[\d+\-*/().%\s]+$/.test(expression)) {
    quickCalculatorError.value = '请输入有效算式'
    return
  }

  try {
    const result = Function(`"use strict"; return (${expression});`)()
    if (!Number.isFinite(result)) {
      throw new Error('invalid result')
    }
    quickCalculatorExpression.value = Number(result.toFixed(8)).toString()
  } catch (_error) {
    quickCalculatorError.value = '请输入有效算式'
  }
}

async function parseJson(response) {
  return response.json().catch(() => ({}))
}

async function readError(response, fallback) {
  const payload = await parseJson(response)
  return payload.detail || fallback
}

function selectAdminSection(section) {
  activeAdminSection.value = section

  if (section === 'settings' && !users.value.length) {
    loadUsers()
  }

  if (section === 'orders' && !orders.value.length) {
    loadOrders()
  }

  if (section === 'orders' && !dailyStats.value.length) {
    loadOrderStats()
  }

  if (section === 'tools' && activeJewelryTool.value === 'quote') {
    loadGoldPrices()
  }

  if (section === 'tools' && activeJewelryTool.value === 'diamond') {
    loadDiamondSizes()
  }
}

async function loadOrderStats() {
  if (!isAdmin.value || !getToken()) {
    return
  }

  isLoadingStats.value = true
  statsError.value = ''
  try {
    const response = await fetch('/api/admin/orders/daily-stats?days=14', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    const payload = await parseJson(response)
    if (!response.ok) {
      throw new Error(payload.detail || copy.value.statsRequestFailed)
    }
    dailyStats.value = Array.isArray(payload.items) ? payload.items : []
  } catch (error) {
    statsError.value = error instanceof Error ? error.message : copy.value.statsRequestFailed
  } finally {
    isLoadingStats.value = false
  }
}

async function loadOrders() {
  if (!isAdmin.value || !getToken()) {
    return
  }

  isLoading.value = true
  loadError.value = ''
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      pageSize: String(pageSize),
    })
    if (searchQuery.value) {
      params.set('q', searchQuery.value)
    }
    const response = await fetch(`/api/admin/orders?${params}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (!response.ok) {
      throw new Error(await readError(response, copy.value.requestFailed))
    }
    const payload = await parseJson(response)
    orders.value = payload.orders || []
    total.value = Number(payload.total || 0)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : copy.value.requestFailed
  } finally {
    isLoading.value = false
  }
}

async function loadUsers() {
  if (!isAdmin.value || !getToken()) {
    return
  }

  isLoadingUsers.value = true
  usersError.value = ''
  try {
    const params = new URLSearchParams()
    if (userSearchQuery.value) {
      params.set('q', userSearchQuery.value)
    }
    const response = await fetch(`/api/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    const payload = await parseJson(response)
    if (!response.ok || !payload.success) {
      throw new Error(payload.detail || copy.value.userRequestFailed)
    }
    users.value = payload.users || []
    syncSelectedUserInsight()
  } catch (error) {
    usersError.value = error instanceof Error ? error.message : copy.value.userRequestFailed
  } finally {
    isLoadingUsers.value = false
  }
}

function syncSelectedUserInsight() {
  if (!users.value.length) {
    selectedUserId.value = ''
    selectedUserInsight.value = null
    userInsightError.value = ''
    return
  }

  const selectedStillVisible = users.value.some((user) => user.user_id === selectedUserId.value)
  if (!selectedStillVisible) {
    selectedUserId.value = users.value[0].user_id
  }

  loadSelectedUserInsight()
}

function selectUserInsight(user) {
  if (!user?.user_id) {
    return
  }

  selectedUserId.value = user.user_id
  loadSelectedUserInsight()
}

function loadSelectedUserInsight() {
  return loadUserInsight(selectedUserId.value)
}

async function loadUserInsight(userId) {
  if (!isAdmin.value || !getToken() || !userId) {
    return
  }

  isLoadingUserInsight.value = true
  userInsightError.value = ''
  try {
    const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/insights`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    const payload = await parseJson(response)
    if (!response.ok || !payload.success) {
      throw new Error(payload.detail || '用户详情加载失败')
    }
    selectedUserInsight.value = payload.insight || null
  } catch (error) {
    userInsightError.value = error instanceof Error ? error.message : '用户详情加载失败'
  } finally {
    isLoadingUserInsight.value = false
  }
}

function refreshOrders() {
  page.value = 1
  loadOrders()
}

function refreshUsers() {
  loadUsers()
}

async function makeAdmin(user) {
  if (!canManageAdmins.value || !user?.user_id || user.role === 'admin' || promotingUserIds.value.has(user.user_id)) {
    return
  }

  const next = new Set(promotingUserIds.value)
  next.add(user.user_id)
  promotingUserIds.value = next
  usersError.value = ''
  try {
    const response = await fetch(`/api/admin/users/${user.user_id}/make-admin`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    const payload = await parseJson(response)
    if (!response.ok || !payload.success) {
      throw new Error(payload.detail || copy.value.userRequestFailed)
    }
    users.value = users.value.map((entry) => (entry.user_id === user.user_id ? payload.user : entry))
    if (selectedUserId.value === user.user_id) {
      loadSelectedUserInsight()
    }
  } catch (error) {
    usersError.value = error instanceof Error ? error.message : copy.value.userRequestFailed
  } finally {
    const after = new Set(promotingUserIds.value)
    after.delete(user.user_id)
    promotingUserIds.value = after
  }
}

function changePage(nextPage) {
  page.value = nextPage
  loadOrders()
}

function toggleOrder(orderId) {
  const next = new Set(expandedOrderIds.value)
  if (next.has(orderId)) {
    next.delete(orderId)
  } else {
    next.add(orderId)
  }
  expandedOrderIds.value = next
}

onMounted(() => {
  if (isAdmin.value) {
    loadUsers()
  }
})
</script>

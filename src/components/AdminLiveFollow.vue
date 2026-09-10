<template>
  <section class="live-ops live-ops--dashboard">
    <header class="live-main-nav" aria-label="直播跟进功能">
      <nav>
        <button
          v-for="item in navigationTabs"
          :key="item.key"
          type="button"
          :class="{ active: activeTab === item.key }"
          @click="openTab(item.key)"
        >
          {{ item.label }}
        </button>
      </nav>

      <div v-if="operatorRoleLabel !== '管理员'" class="live-admin-user">
        <span aria-hidden="true">{{ accountInitial }}</span>
        <div>
          <strong>{{ accountName }}</strong>
          <small>{{ operatorRoleLabel }}</small>
        </div>
        <button type="button" @click="emit('logout')">退出</button>
      </div>
    </header>

    <main class="live-dashboard-body">
      <Transition name="live-toast">
        <div v-if="notice" class="live-notice-backdrop" aria-live="polite">
          <div class="live-notice" :class="{ error: noticeType === 'error' }" role="status">
            {{ notice }}
          </div>
        </div>
      </Transition>

      <template v-if="activeTab === 'home'">
        <section class="live-dashboard-section live-dashboard-section--hero">
          <div class="live-dashboard-title">
            <h2>主播主页</h2>
          </div>

          <div v-if="!talents.length" class="live-dashboard-empty live-dashboard-empty--small">
            暂无主播账号，请联系系统管理员配置。
          </div>
          <div v-else class="live-talent-grid">
            <article v-for="talent in talentCards" :key="talent.userId" class="live-talent-card">
              <div class="live-talent-card-head">
                <span class="live-talent-avatar">{{ talentInitial(talent) }}</span>
                <div>
                  <h3>{{ talent.nickname || '未命名主播' }}</h3>
                  <p>{{ talent.userId }}</p>
                </div>
                <span class="live-talent-state" :class="`is-${talent.state}`">{{ talent.stateLabel }}</span>
              </div>
              <div class="live-talent-card-meta">
                <span><small>历史场次</small><strong>{{ talent.sessionCount }}</strong></span>
                <span><small>累计观看 UV</small><strong>{{ numberText(talent.viewers) }}</strong></span>
                <span><small>最近平均在线</small><strong>{{ numberText(talent.avgOnline) }}</strong></span>
                <span><small>累计新增粉丝</small><strong>{{ numberText(talent.newFollowers) }}</strong></span>
                <span><small>支付订单</small><strong>{{ numberText(talent.paymentOrders) }}</strong></span>
                <span><small>支付金额</small><strong>{{ compactMoney(talent.paymentAmount) }}</strong></span>
              </div>
              <div class="live-talent-card-footer">
                <span>{{ talent.latestSessionText }}</span>
                <button v-if="talent.sessionCount" type="button" @click="openTalentSessions(talent)">查看场次</button>
              </div>
            </article>
          </div>
        </section>

        <section class="live-dashboard-section">
          <div class="live-dashboard-title">
            <span>TODAY LIVE</span>
            <h3>今日直播场次</h3>
          </div>

          <div v-if="!todayReservations.length" class="live-dashboard-empty">
            今天暂无已预约的直播场次
          </div>
          <div v-else class="live-today-live-list">
            <article v-for="item in todayReservations" :key="item.id" class="live-today-live-row">
              <time>{{ shortTime(item.startTime) }}–{{ shortTime(item.endTime) }}</time>
              <strong>{{ item.talentName || '未命名主播' }}</strong>
              <span>{{ item.counterName || reservationCounterLabel(item) }}</span>
              <span class="live-status-pill" :class="`is-${item.status}`">{{ statusLabel(item.status) }}</span>
              <button type="button" @click="openTab('schedule')">查看预约</button>
            </article>
          </div>
        </section>
      </template>

      <section v-else-if="activeTab === 'schedule'" class="live-schedule-page">
        <section class="live-schedule-board-card">
          <div class="live-schedule-head">
            <div>
              <span>柜台使用</span>
              <h2>柜台时间看板</h2>
            </div>
            <input v-model="selectedDate" type="date" @change="loadWorkspace" />
          </div>

          <div class="live-schedule-legend">
            <span><i class="is-free"></i> 可预约</span>
            <span><i class="is-selected"></i> 已选择</span>
            <span><i class="is-booked"></i> 已预约</span>
          </div>
          <p class="live-schedule-select-tip">选择同一柜台的两个时间格，即可自动选中这两个时间之间的连续时段。</p>
          <p v-if="!selectedSlots.length" class="live-schedule-clear-note">已清除选中的时间</p>

          <div v-if="isLoading && !hasLoaded" class="live-loading">正在加载预约管理数据...</div>

          <div v-else class="live-timeline">
            <div class="live-timeline-head">
              <span class="live-timeline-corner">柜台 / 时段</span>
              <span v-for="slot in timeSlots" :key="slot.start" class="live-slot-head">
                {{ slot.start }}-{{ slot.end }}
              </span>
            </div>

            <div v-for="counter in activeCounters" :key="counter.id" class="live-timeline-row">
              <span class="live-counter-head">{{ counterLabel(counter) }}</span>
              <button
                v-for="slot in timeSlots"
                :key="`${counter.id}-${slot.start}`"
                type="button"
                class="live-slot"
                :class="slotClass(counter, slot)"
                :disabled="!canSelectSlot(counter, slot)"
                @click="selectSlot(counter, slot)"
              >
                {{ slotLabel(counter, slot) }}
              </button>
            </div>
          </div>

          <form v-if="selectedSlots.length" class="live-selected-panel" @submit.prevent="submitReservation">
            <div class="live-selected-details">
              <button
                v-for="group in selectedSlotGroups"
                :key="group.key"
                class="live-selected-chip"
                type="button"
                :title="`${group.label}，点击取消这一段`"
                @click="removeSelectedSlotGroup(group)"
              >
                {{ group.label }}
              </button>
            </div>

            <div class="live-selected-booking live-selected-booking--form">
              <span class="live-booking-operator">预约身份：{{ operatorRoleLabel }}</span>
              <label>
                <span>主播</span>
                <select v-model="reservationForm.talentUserId" :disabled="operatorRoleLabel === '主播'" required>
                  <option value="" disabled>选择主播账号</option>
                  <option v-for="item in availableTalents" :key="item.userId" :value="item.userId">
                    {{ talentOptionLabel(item) }}
                  </option>
                </select>
              </label>
              <label>
                <span>备注</span>
                <input v-model.trim="reservationForm.notes" placeholder="可填写直播主题或备注" />
              </label>
              <button type="submit" :disabled="isSaving || !availableTalents.length">
                {{ isSaving ? '保存中...' : `创建预约（${selectedSlotGroups.length}段）` }}
              </button>
              <button class="live-cancel-selection" type="button" @click="clearSelectedSlots">取消全部</button>
            </div>
          </form>
        </section>

        <section class="live-reservation-list-card">
          <div class="live-reservation-list-head">
            <div>
              <span>预约记录</span>
              <h2>当天预约列表</h2>
            </div>
            <button type="button" @click="loadWorkspace">刷新</button>
          </div>

          <div class="live-reservation-table">
            <div class="live-reservation-row live-reservation-row--head">
              <span>柜台</span>
              <span>姓名</span>
              <span>开始时间</span>
              <span>结束时间</span>
              <span>预约码</span>
              <span>签到状态</span>
              <span>操作</span>
            </div>

            <div v-if="!visibleReservations.length" class="live-reservation-row live-reservation-row--empty">
              <span>暂无预约</span>
            </div>

            <div
              v-for="item in visibleReservations"
              v-else
              :key="item.rowKey"
              class="live-reservation-row"
            >
              <span>{{ reservationCounterLabel(item) }}</span>
              <span>{{ item.talentName }}</span>
              <span>{{ reservationDateTime(item.liveDate, item.startTime) }}</span>
              <span>{{ reservationDateTime(item.liveDate, item.endTime) }}</span>
              <span>{{ reservationCode(item) }}</span>
              <span><i class="live-status-pill" :class="`is-${item.status}`">{{ statusLabel(item.status) }}</i></span>
              <span class="live-reservation-actions">
                <button
                  class="is-checkin"
                  type="button"
                  :disabled="!canCheckInReservation(item)"
                  :title="checkInButtonTitle(item)"
                  @click="checkInReservation(item)"
                >签到</button>
                <button class="is-cancel" type="button" :disabled="Boolean(item.sessionId)" @click="cancelReservation(item)">取消</button>
              </span>
            </div>
          </div>
        </section>
      </section>

      <section v-else-if="activeTab === 'entry'" class="live-entry-page">
        <div class="live-ops-head live-entry-hero">
          <div>
            <h2>单场数据录入</h2>
          </div>
          <strong>团队共享</strong>
        </div>

        <form class="live-entry-record" @submit.prevent="submitLiveSession">
          <section class="live-entry-card">
            <h3>场次与流量</h3>
            <label class="live-session-picker">
              <span>预约直播场次</span>
              <select v-model="liveEntryForm.reservationId" required>
                <option value="">请先选择预约场次</option>
                <option
                  v-for="item in availableEntryReservations"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ entryReservationLabel(item) }}
                </option>
              </select>
            </label>

            <div class="live-image-import">
              <div>
                <p>图片识别导入</p>
                <strong>上传直播数据截图</strong>
                <span>识别结果只会填入下方表单，不会自动提交。</span>
              </div>
              <label class="live-image-picker">
                <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleLiveImageChange" />
                <span>{{ liveImageName || '选择图片' }}</span>
              </label>
              <div v-if="liveImagePreview" class="live-image-preview">
                <img :src="liveImagePreview" alt="待识别的直播数据截图" />
              </div>
              <button
                class="live-dark-button"
                type="button"
                :disabled="!liveImageDataUrl || isRecognizing"
                @click="recognizeLiveImage"
              >
                {{ isRecognizing ? '正在识别...' : '识别并填入' }}
              </button>
              <p v-if="liveImageStatus" class="live-image-status">{{ liveImageStatus }}</p>
            </div>

            <div class="live-entry-grid">
              <label>
                <span>直播日期</span>
                <input :value="selectedEntryReservation?.liveDate || ''" readonly placeholder="yyyy/mm/日" />
              </label>
              <label>
                <span>主播 / 账号</span>
                <input :value="selectedEntryReservation?.talentName || ''" readonly placeholder="由预约自动带入" />
              </label>
              <label>
                <span>直播柜台</span>
                <input :value="selectedEntryReservation ? reservationCounterLabel(selectedEntryReservation) : ''" readonly placeholder="由预约自动带入" />
              </label>
              <label>
                <span>开播时间</span>
                <input :value="selectedEntryReservation ? shortTime(selectedEntryReservation.startTime) : ''" readonly placeholder="--:--" />
              </label>
              <label>
                <span>下播时间</span>
                <input :value="selectedEntryReservation ? shortTime(selectedEntryReservation.endTime) : ''" readonly placeholder="--:--" />
              </label>
            </div>
          </section>

          <section class="live-entry-card">
            <h3>流量来源占比</h3>
            <div class="live-entry-grid live-entry-grid--four">
              <label><span>推荐 %</span><input v-model.number="liveEntryForm.recommended" type="number" min="0" /></label>
              <label><span>关注 %</span><input v-model.number="liveEntryForm.follow" type="number" min="0" /></label>
              <label><span>同城 %</span><input v-model.number="liveEntryForm.local" type="number" min="0" /></label>
              <label><span>搜索 / 其他 %</span><input v-model.number="liveEntryForm.other" type="number" min="0" /></label>
            </div>
          </section>

          <section class="live-entry-card">
            <h3>互动与成交</h3>
            <div class="live-entry-grid live-entry-grid--four">
              <label><span>封面曝光</span><input v-model.number="liveEntryForm.coverExposure" type="number" min="0" /></label>
              <label><span>观看人数</span><input v-model.number="liveEntryForm.viewers" type="number" min="0" /></label>
              <label><span>平均在线</span><input v-model.number="liveEntryForm.avgOnline" type="number" min="0" /></label>
              <label><span>互动人数</span><input v-model.number="liveEntryForm.interactionCount" type="number" min="0" /></label>
              <label><span>支付人数</span><input v-model.number="liveEntryForm.paidUsers" type="number" min="0" /></label>
              <label><span>支付订单数</span><input v-model.number="liveEntryForm.paymentOrders" type="number" min="0" /></label>
              <label><span>支付总金额</span><input v-model.number="liveEntryForm.paymentTotalAmount" type="number" min="0" step="0.01" /></label>
              <label><span>退款订单数</span><input v-model.number="liveEntryForm.refundOrders" type="number" min="0" /></label>
              <label><span>新增粉丝</span><input v-model.number="liveEntryForm.newFollowers" type="number" min="0" /></label>
              <label><span>预约人数</span><input v-model.number="liveEntryForm.reservationCount" type="number" min="0" /></label>
            </div>
          </section>

          <section class="live-entry-card">
            <div class="live-products-head">
              <div>
                <p>货品明细</p>
                <h3>本场货品表现</h3>
              </div>
              <button type="button" @click="addLiveProduct">添加货品</button>
            </div>
            <div class="live-products-scroll">
              <div class="live-products-row header">
                <span>货号</span>
                <span>货品名称</span>
                <span>品类</span>
                <span>成交件数</span>
                <span>成交金额</span>
                <span>备注</span>
                <span>操作</span>
              </div>
              <div v-for="(product, index) in liveProducts" :key="product.key" class="live-products-row">
                <input v-model.trim="product.code" placeholder="货号" />
                <input v-model.trim="product.name" placeholder="货品名称" />
                <select v-model="product.category">
                  <option value="">请选择品类</option>
                  <option v-for="category in productCategories" :key="category" :value="category">{{ category }}</option>
                </select>
                <input v-model.number="product.soldCount" type="number" min="0" placeholder="成交件数" />
                <input v-model.number="product.dealAmount" type="number" min="0" step="0.01" placeholder="成交金额" />
                <input v-model.trim="product.note" placeholder="备注" />
                <button type="button" @click="removeLiveProduct(index)">删除</button>
              </div>
            </div>
          </section>

          <section class="live-entry-card">
            <label class="live-notes-field">
              <span>复盘备注</span>
              <textarea v-model.trim="liveEntryForm.notes" rows="4" placeholder="记录本场亮点、问题和待改进事项"></textarea>
            </label>
            <div class="live-entry-actions">
              <button class="live-primary-button" type="submit" :disabled="isSavingSession || !liveEntryForm.reservationId">
                {{ isSavingSession ? '正在保存...' : '保存本场数据' }}
              </button>
              <button type="button" @click="clearLiveEntryForm">清空表单</button>
            </div>
          </section>
        </form>
      </section>

      <section v-else-if="activeTab === 'analysis'" class="live-analysis-page">
        <div class="live-analysis-head">
          <div>
            <h2>分析看板</h2>
          </div>
          <label v-if="analysisTalentOptions.length" class="live-analysis-talent-filter">
            <span>主播</span>
            <select :value="activeAnalysisTalentId" @change="selectedAnalysisTalentId = $event.target.value">
              <option v-for="item in analysisTalentOptions" :key="item.userId" :value="item.userId">
                {{ item.name }}
              </option>
            </select>
          </label>
        </div>

        <div class="live-analysis-metrics">
          <article class="is-highlight">
            <span>直播场次</span>
            <strong>{{ analysisTotals.sessions }}</strong>
            <small>已保存的直播记录</small>
          </article>
          <article class="is-highlight">
            <span>支付总金额</span>
            <strong>{{ compactMoney(analysisTotals.amount) }}</strong>
            <small>当前主播场次汇总</small>
          </article>
          <article>
            <span>累计观看 UV</span>
            <strong>{{ numberText(analysisTotals.viewers) }}</strong>
            <small>流量总量</small>
          </article>
          <article>
            <span>总订单</span>
            <strong>{{ numberText(analysisTotals.orders) }}</strong>
            <small>成交订单数</small>
          </article>
          <article>
            <span>支付转化率</span>
            <strong>{{ analysisTotals.conversion }}%</strong>
            <small>付费人数 / 观看 UV</small>
          </article>
          <article>
            <span>UV 价值</span>
            <strong>{{ sessionMoney(analysisTotals.uvValue) }}</strong>
            <small>每位观众贡献</small>
          </article>
        </div>

        <section class="live-analysis-panel live-analysis-sales-chart">
          <div class="live-analysis-panel-head">
            <div>
              <h3>主播近两周销售趋势</h3>
              <span>{{ analysisSalesDateRange }}</span>
            </div>
          </div>

          <div v-if="!analysisTalentOptions.length" class="live-analysis-empty">暂无主播场次数据</div>
          <div v-else class="live-analysis-line-chart-wrap">
            <div class="live-analysis-chart-legend">
              <span><i class="is-amount"></i>销售额</span>
              <span><i class="is-quantity"></i>销售订单</span>
            </div>
            <div class="live-analysis-line-chart-scroll">
              <svg class="live-analysis-line-chart" viewBox="0 0 1120 310" role="img" :aria-label="`${activeAnalysisTalentName}近两周销售趋势`">
                <g class="live-analysis-chart-grid">
                  <template v-for="line in analysisSalesChart.grid" :key="line.ratio">
                    <line :x1="analysisSalesChart.left" :x2="analysisSalesChart.right" :y1="line.y" :y2="line.y" />
                    <text :x="analysisSalesChart.left - 12" :y="line.y + 4" text-anchor="end">{{ line.amountLabel }}</text>
                    <text :x="analysisSalesChart.right + 12" :y="line.y + 4">{{ line.quantityLabel }}</text>
                  </template>
                </g>
                <g class="live-analysis-chart-columns">
                  <line v-for="point in analysisSalesChart.points" :key="point.date" :x1="point.x" :x2="point.x" :y1="analysisSalesChart.top" :y2="analysisSalesChart.bottom" />
                </g>
                <polyline class="live-analysis-chart-line is-amount" :points="analysisSalesChart.amountPoints" />
                <polyline class="live-analysis-chart-line is-quantity" :points="analysisSalesChart.quantityPoints" />
                <g v-for="point in analysisSalesChart.points" :key="point.date" class="live-analysis-chart-point">
                  <circle class="is-amount" :cx="point.x" :cy="point.amountY" r="4">
                    <title>{{ point.date }} 销售额 {{ sessionMoney(point.amount) }}</title>
                  </circle>
                  <circle class="is-quantity" :cx="point.x" :cy="point.quantityY" r="4">
                    <title>{{ point.date }} 销售订单 {{ numberText(point.quantity) }} 单</title>
                  </circle>
                  <text :x="point.x" y="288" text-anchor="middle">{{ point.label }}</text>
                </g>
              </svg>
            </div>
          </div>
        </section>

        <div class="live-analysis-grid">
          <section class="live-analysis-panel">
            <h3>支付总金额趋势</h3>
            <div v-if="!analysisPaymentTrend.length" class="live-analysis-empty">暂无场次数据</div>
            <div v-else class="live-analysis-trend">
              <div v-for="item in analysisPaymentTrend" :key="item.date" class="live-analysis-trend-row">
                <span>{{ item.date }}</span>
                <i><b :style="{ width: `${item.percent}%` }"></b></i>
                <strong>{{ compactMoney(item.amount) }}</strong>
              </div>
            </div>
          </section>

          <section class="live-analysis-panel">
            <h3>流量来源</h3>
            <div v-if="!analysisTrafficTotal" class="live-analysis-empty">暂无流量来源数据</div>
            <div v-else class="live-analysis-source">
              <div class="live-analysis-source-bar">
                <i
                  v-for="item in analysisTrafficSources"
                  :key="item.key"
                  :class="`is-${item.key}`"
                  :style="{ width: `${item.percent}%` }"
                ></i>
              </div>
              <div class="live-analysis-source-list">
                <span v-for="item in analysisTrafficSources" :key="item.key">
                  <i :class="`is-${item.key}`"></i>{{ item.label }} <b>{{ item.percent }}%</b>
                </span>
              </div>
            </div>
          </section>

          <section class="live-analysis-panel">
            <h3>货品成交 TOP 5</h3>
            <div v-if="!analysisTopProducts.length" class="live-analysis-empty">暂无可分析数据</div>
            <div v-else class="live-analysis-ranking">
              <div v-for="(item, index) in analysisTopProducts" :key="item.key">
                <em>{{ String(index + 1).padStart(2, '0') }}</em>
                <span><strong>{{ item.name }}</strong><small>{{ item.category || '未分类' }} · {{ item.soldCount }} 件</small></span>
                <i><b :style="{ width: `${item.percent}%` }"></b></i>
                <strong>{{ compactMoney(item.amount) }}</strong>
              </div>
            </div>
          </section>

          <section class="live-analysis-panel">
            <h3>主播场次表现</h3>
            <div v-if="!analysisTalentPerformance.length" class="live-analysis-empty">暂无可分析数据</div>
            <div v-else class="live-analysis-talent-table">
              <div class="live-analysis-talent-row is-head"><span>主播</span><span>场次</span><span>观看 UV</span><span>订单</span><span>支付金额</span></div>
              <div v-for="item in analysisTalentPerformance" :key="item.userId" class="live-analysis-talent-row">
                <strong>{{ item.name }}</strong><span>{{ item.sessions }}</span><span>{{ numberText(item.viewers) }}</span><span>{{ numberText(item.orders) }}</span><b>{{ compactMoney(item.amount) }}</b>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section v-else-if="activeTab === 'sessions'" class="live-session-data-page">
        <div class="live-session-data-hero">
          <div class="live-dashboard-title">
            <span>SESSION DATA</span>
            <h2>场次数据</h2>
          </div>
          <strong class="live-dashboard-pill">{{ visibleSessions.length }} 场</strong>
        </div>

        <div class="live-session-data-table-wrap">
          <div class="live-session-data-table">
            <div class="live-session-data-row live-session-data-row--head">
              <span>日期</span>
              <span>主播</span>
              <span>观看 UV</span>
              <span>平均在线</span>
              <span>新增粉丝</span>
              <span>订单</span>
              <span>支付总金额</span>
              <span>客单价</span>
              <span>UV 价值</span>
              <span>转化率</span>
              <span>操作</span>
            </div>

            <div v-if="!visibleSessions.length" class="live-session-data-empty">
              暂无场次数据，请先前往“直播数据录入”保存一场直播。
            </div>

            <template v-else>
              <article v-for="item in visibleSessions" :key="item.id" class="live-session-data-row">
                <span>{{ item.liveDate || '-' }}</span>
                <strong>{{ item.talentName || '-' }}</strong>
                <span>{{ numberText(item.viewers) }}</span>
                <span>{{ numberText(item.avgOnline) }}</span>
                <span>{{ numberText(item.newFollowers) }}</span>
                <span>{{ numberText(item.paymentOrders) }}</span>
                <strong>{{ sessionMoney(item.paymentTotalAmount) }}</strong>
                <span>{{ sessionMoney(sessionAverageTicket(item)) }}</span>
                <span>{{ sessionMoney(sessionUvValue(item)) }}</span>
                <span>{{ sessionConversion(item) }}%</span>
                <span class="live-session-data-actions">
                  <button type="button" @click="toggleSessionDetails(item.id)">
                    {{ expandedSessionId === item.id ? '收起' : '详情' }}
                  </button>
                  <button type="button" class="is-danger" @click="deleteSession(item)">删除</button>
                </span>
                <div v-if="expandedSessionId === item.id" class="live-session-data-detail">
                  <div class="live-session-detail-metrics">
                    <span>封面曝光 <b>{{ numberText(item.coverExposure) }}</b></span>
                    <span>互动次数 <b>{{ numberText(item.interactionCount) }}</b></span>
                    <span>支付人数 <b>{{ numberText(item.paidUsers) }}</b></span>
                    <span>退款订单 <b>{{ numberText(item.refundOrders) }}</b></span>
                    <span>新增预约 <b>{{ numberText(item.reservationCount) }}</b></span>
                  </div>
                  <div v-if="item.products?.length" class="live-session-products">
                    <div v-for="product in item.products" :key="product.id">
                      <span>{{ product.code || '-' }}</span>
                      <strong>{{ product.name || '未命名商品' }}</strong>
                      <span>{{ product.category || '-' }}</span>
                      <span>{{ numberText(product.soldCount) }} 件</span>
                      <span>{{ sessionMoney(product.dealAmount) }}</span>
                    </div>
                  </div>
                  <p v-if="item.notes">{{ item.notes }}</p>
                </div>
              </article>
            </template>
          </div>
        </div>
      </section>

      <section v-else-if="activeTab === 'accounts'" class="live-account-page">
        <div class="live-account-hero">
          <h2>账号设置</h2>
        </div>

        <div class="live-account-grid">
          <section class="live-settings-card live-account-edit-card">
            <p class="live-settings-kicker">账户信息</p>
            <h3>修改账户信息</h3>
            <p v-if="!editingAccountId" class="live-account-edit-empty">请在右侧账号列表中选择需要修改的用户。</p>
            <form v-else class="live-account-form" @submit.prevent="saveEditingAccount">
              <label><span>账号</span><input v-model.trim="accountEditForm.username" maxlength="50" placeholder="2-50 个非空白字符" required /></label>
              <label><span>展示名</span><input v-model.trim="accountEditForm.displayName" maxlength="50" placeholder="主播主页显示名称" /></label>
              <label><span>新密码</span><input v-model="accountEditForm.password" type="password" minlength="8" maxlength="100" placeholder="留空则不修改" /></label>
              <label>
                <span>身份</span>
                <select v-model="accountEditForm.role">
                  <option value="anchor">主播</option>
                  <option value="control">中控</option>
                  <option value="admin">管理员</option>
                </select>
              </label>
              <label><span>头像地址</span><input v-model.trim="accountEditForm.avatarUrl" type="url" maxlength="500" placeholder="https://...（可选）" /></label>
              <label><span>个人简介</span><input v-model.trim="accountEditForm.bio" maxlength="255" placeholder="主播定位或擅长品类（可选）" /></label>
              <button class="live-settings-primary live-account-save-button" type="submit" :disabled="savingAccountId === editingAccountId">
                {{ savingAccountId === editingAccountId ? '保存中...' : '保存修改' }}
              </button>
            </form>
          </section>

          <section class="live-settings-card live-account-list-card">
            <div class="live-settings-card-head">
              <div><p class="live-settings-kicker">账号列表</p><h3>已有账号</h3></div>
              <button type="button" @click="loadAccounts">刷新</button>
            </div>
            <div class="live-account-table-wrap">
              <table class="live-account-table">
                <thead><tr><th>账号</th><th>展示名</th><th>身份</th><th>头像地址</th><th>个人简介</th><th>操作</th></tr></thead>
                <tbody>
                  <tr v-if="isLoadingAccounts"><td colspan="6">正在加载账号...</td></tr>
                  <tr v-else-if="!accounts.length"><td colspan="6">暂无账号</td></tr>
                  <tr v-for="item in accounts" v-else :key="item.id" :class="{ 'is-editing': editingAccountId === item.id }">
                    <td>{{ item.username }}</td>
                    <td>{{ item.displayName }}</td>
                    <td>{{ accountRoleLabel(item.role) }}</td>
                    <td class="live-account-long-value" :title="item.avatarUrl">{{ item.avatarUrl || '-' }}</td>
                    <td class="live-account-long-value" :title="item.bio">{{ item.bio || '-' }}</td>
                    <td><button class="live-settings-primary" type="button" @click="editAccount(item)">修改</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section class="live-settings-card live-counter-settings-card">
          <div class="live-settings-card-head">
            <div>
              <p class="live-settings-kicker">柜台设置</p>
              <h3>柜台显示名称</h3>
              <span>可新增、改名或停用柜台。停用后的柜台不会出现在新预约中；仍有未结束预约的柜台不能停用。</span>
            </div>
          </div>
          <form class="live-counter-create-form" @submit.prevent="createCounter">
            <label><span>新增柜台名称</span><input v-model.trim="newCounterName" maxlength="50" placeholder="例如：VIP 柜台" required /></label>
            <button class="live-settings-primary" type="submit" :disabled="isCreatingCounter">{{ isCreatingCounter ? '新增中...' : '新增柜台' }}</button>
          </form>
          <div class="live-counter-settings-table-wrap">
            <table class="live-counter-settings-table">
              <thead><tr><th>柜台编号</th><th>当前名称</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-if="!counters.length"><td colspan="4">暂无柜台</td></tr>
                <tr v-for="counter in counters" v-else :key="counter.id">
                  <td>{{ counter.id }} 号柜台</td>
                  <td><input v-model.trim="counter.displayName" maxlength="50" /></td>
                  <td><select v-model="counter.isActive"><option :value="true">启用</option><option :value="false">停用</option></select></td>
                  <td><button class="live-settings-primary" type="button" :disabled="savingCounterId === counter.id" @click="saveCounter(counter)">{{ savingCounterId === counter.id ? '保存中' : '保存' }}</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <section v-else class="live-dashboard-section">
        <div class="live-dashboard-title">
          <span>{{ activeTabMeta.kicker }}</span>
          <h2>{{ activeTabMeta.label }}</h2>
        </div>

        <div class="live-dashboard-empty">
          {{ activeTabMeta.label }}页面先按当前格式预留
        </div>
      </section>
    </main>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

const props = defineProps({
  token: { type: String, required: true },
  account: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['logout'])

const tabs = [
  { key: 'home', label: '主播首页', kicker: 'DAILI TALENT' },
  { key: 'schedule', label: '预约管理', kicker: 'RESERVATION' },
  { key: 'entry', label: '直播数据录入', kicker: 'LIVE DATA' },
  { key: 'sessions', label: '场次数据', kicker: 'SESSION DATA' },
  { key: 'analysis', label: '分析看板', kicker: 'ANALYTICS' },
  { key: 'accounts', label: '账号设置', kicker: 'ACCOUNT SETTINGS' },
]

function localDate() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function shiftDate(dateText, offset) {
  const [year, month, day] = String(dateText).split('-').map(Number)
  const date = new Date(year, month - 1, day + offset)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function minutesToTime(value) {
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const today = localDate()
const activeTab = ref('home')
const selectedDate = ref(today)
const selectedSlots = ref([])
const selectionAnchors = reactive({})
const talents = ref([])
const counters = ref([])
const reservations = ref([])
const entryReservations = ref([])
const sessions = ref([])
const hasLoaded = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const isSavingSession = ref(false)
const isRecognizing = ref(false)
const accounts = ref([])
const isLoadingAccounts = ref(false)
const savingAccountId = ref(null)
const editingAccountId = ref(null)
const newCounterName = ref('')
const isCreatingCounter = ref(false)
const savingCounterId = ref(null)
const notice = ref('')
const noticeType = ref('success')
const expandedSessionId = ref(null)
const selectedAnalysisTalentId = ref('')
const currentTimestamp = ref(Date.now())
let clockTimer = null
const reservationForm = reactive({ talentUserId: '', notes: '' })
const accountEditForm = reactive({
  username: '',
  displayName: '',
  password: '',
  role: 'anchor',
  avatarUrl: '',
  bio: '',
})
const productCategories = ['项链', '戒指', '吊坠', '耳饰', '手链']
const liveEntryDefaults = {
  reservationId: '',
  recommended: 60,
  follow: 20,
  local: 10,
  other: 10,
  coverExposure: 0,
  viewers: 0,
  avgOnline: 0,
  interactionCount: 0,
  paidUsers: 0,
  paymentOrders: 0,
  paymentTotalAmount: 0,
  refundOrders: 0,
  newFollowers: 0,
  reservationCount: 0,
  notes: '',
}
const liveEntryForm = reactive({ ...liveEntryDefaults })
const liveProducts = ref([emptyLiveProduct()])
const liveImageDataUrl = ref('')
const liveImagePreview = ref('')
const liveImageName = ref('')
const liveImageStatus = ref('')
const fallbackCounters = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  displayName: `${index + 1}号柜台`,
  isActive: true,
}))
const timeSlots = Array.from({ length: 18 }, (_, index) => {
  const startMinutes = 9 * 60 + index * 30
  return {
    start: minutesToTime(startMinutes),
    end: minutesToTime(startMinutes + 30),
  }
})

const activeTabMeta = computed(() => tabs.find((item) => item.key === activeTab.value) || tabs[0])
const activeCounters = computed(() => {
  const enabledCounters = counters.value.filter((item) => String(item.isActive) !== '0' && item.isActive !== false)
  return enabledCounters.length ? enabledCounters : fallbackCounters
})
const todayReservations = computed(() => reservations.value
  .filter((item) => String(item.status) !== 'cancelled')
  .sort((a, b) => shortTime(a.startTime).localeCompare(shortTime(b.startTime)) || Number(a.id) - Number(b.id)))
const talentCards = computed(() => talents.value.map((talent) => {
  const talentReservations = todayReservations.value.filter((item) => String(item.talentUserId) === String(talent.userId))
  const talentSessions = visibleSessions.value.filter((item) => String(item.talentUserId) === String(talent.userId))
  const latestSession = talentSessions[0] || null
  const current = talentReservations.find((item) => item.status === 'live')
  const next = talentReservations.find((item) => item.status === 'scheduled')
  const viewers = talentSessions.reduce((total, item) => total + Number(item.viewers || 0), 0)
  const newFollowers = talentSessions.reduce((total, item) => total + Number(item.newFollowers || 0), 0)
  const paymentOrders = talentSessions.reduce((total, item) => total + Number(item.paymentOrders || 0), 0)
  const paymentAmount = talentSessions.reduce((total, item) => total + Number(item.paymentTotalAmount || 0), 0)
  const state = current ? 'live' : next ? 'scheduled' : talentSessions.length ? 'completed' : 'idle'
  return {
    ...talent,
    todaySessions: talentReservations.length,
    sessionCount: talentSessions.length,
    viewers,
    avgOnline: Number(latestSession?.avgOnline || 0),
    newFollowers,
    paymentOrders,
    paymentAmount,
    state,
    stateLabel: current
      ? '直播中'
      : next
        ? '待开播'
        : latestSession
          ? `最近直播 ${String(latestSession.liveDate).slice(5)}`
          : '暂无直播数据',
    latestSessionText: latestSession
      ? `最近一场：${latestSession.liveDate} ${shortTime(latestSession.startTime)}–${shortTime(latestSession.endTime)} · ${latestSession.counterName || reservationCounterLabel(latestSession)}`
      : '还没有录入直播场次',
  }
}))
const accountName = computed(() => props.account?.nickname || props.account?.email || 'admin')
const accountInitial = computed(() => String(accountName.value || 'a').trim().slice(0, 1).toLowerCase() || 'a')
const currentLiveUserId = computed(() => String(props.account?.liveUserId || '').trim())
const operatorRoleLabel = computed(() => {
  const rawType = String(props.account?.role || props.account?.accountType || '').toLowerCase()
  if (rawType.includes('control') || rawType.includes('operator') || rawType.includes('中控')) {
    return '中控'
  }
  if (rawType.includes('anchor') || rawType.includes('talent') || rawType.includes('主播')) {
    return '主播'
  }
  return '管理员'
})
const navigationTabs = computed(() => {
  return operatorRoleLabel.value === '管理员'
    ? tabs
    : tabs.filter((item) => item.key !== 'accounts')
})
const visibleSessions = computed(() => {
  if (operatorRoleLabel.value !== '主播' || !currentLiveUserId.value) {
    return sessions.value
  }
  return sessions.value.filter((item) => String(item.talentUserId) === currentLiveUserId.value)
})
const analysisTalentOptions = computed(() => {
  const options = new Map()
  visibleSessions.value.forEach((item) => {
    const userId = String(item.talentUserId || '').trim()
    if (userId && !options.has(userId)) {
      options.set(userId, { userId, name: item.talentName || '未命名主播' })
    }
  })
  return [...options.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
})
const activeAnalysisTalentId = computed(() => {
  if (analysisTalentOptions.value.some((item) => item.userId === selectedAnalysisTalentId.value)) {
    return selectedAnalysisTalentId.value
  }
  return analysisTalentOptions.value[0]?.userId || ''
})
const activeAnalysisTalentName = computed(() => {
  return analysisTalentOptions.value.find((item) => item.userId === activeAnalysisTalentId.value)?.name || '主播'
})
const analysisSessions = computed(() => {
  if (!activeAnalysisTalentId.value) return []
  return visibleSessions.value.filter((item) => String(item.talentUserId || '').trim() === activeAnalysisTalentId.value)
})
const analysisSalesDays = computed(() => {
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = shiftDate(today, index - 13)
    return { date, label: date.slice(5), amount: 0, quantity: 0 }
  })
  const dayMap = new Map(days.map((item) => [item.date, item]))
  analysisSessions.value.forEach((session) => {
    const day = dayMap.get(String(session.liveDate || '').slice(0, 10))
    if (!day) return
    day.amount += Number(session.paymentTotalAmount || 0)
    day.quantity += Number(session.paymentOrders || 0)
  })
  return days
})
const analysisSalesDateRange = computed(() => {
  const first = analysisSalesDays.value[0]?.date.slice(5).replace('-', '/') || ''
  const last = analysisSalesDays.value.at(-1)?.date.slice(5).replace('-', '/') || ''
  return `${first} - ${last}`
})
const analysisSalesChart = computed(() => {
  const left = 72
  const right = 1048
  const top = 22
  const bottom = 258
  const chartHeight = bottom - top
  const highestAmount = Math.max(...analysisSalesDays.value.map((item) => item.amount), 0)
  const maxAmount = Math.max(100000, Math.ceil(highestAmount / 100000) * 100000)
  const quantityPeak = Math.max(...analysisSalesDays.value.map((item) => item.quantity), 0)
  const maxQuantity = Math.max(20, Math.ceil(quantityPeak / 20) * 20)
  const points = analysisSalesDays.value.map((item, index) => {
    const x = left + (index / 13) * (right - left)
    return {
      ...item,
      x,
      amountY: maxAmount ? bottom - (item.amount / maxAmount) * chartHeight : bottom,
      quantityY: maxQuantity ? bottom - (item.quantity / maxQuantity) * chartHeight : bottom,
    }
  })
  return {
    left,
    right,
    top,
    bottom,
    points,
    amountPoints: points.map((item) => `${item.x},${item.amountY}`).join(' '),
    quantityPoints: points.map((item) => `${item.x},${item.quantityY}`).join(' '),
    grid: [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
      ratio,
      y: bottom - ratio * chartHeight,
      amountLabel: compactMoney(maxAmount * ratio),
      quantityLabel: `${Math.round(maxQuantity * ratio)} 单`,
    })),
  }
})
const analysisTotals = computed(() => {
  const values = analysisSessions.value.reduce((total, item) => ({
    sessions: total.sessions + 1,
    amount: total.amount + Number(item.paymentTotalAmount || 0),
    viewers: total.viewers + Number(item.viewers || 0),
    orders: total.orders + Number(item.paymentOrders || 0),
    paidUsers: total.paidUsers + Number(item.paidUsers || 0),
  }), { sessions: 0, amount: 0, viewers: 0, orders: 0, paidUsers: 0 })
  const conversion = values.viewers ? ((values.paidUsers / values.viewers) * 100).toFixed(1) : '0.0'
  return { ...values, conversion, uvValue: values.viewers ? values.amount / values.viewers : 0 }
})
const analysisPaymentTrend = computed(() => {
  const grouped = new Map()
  analysisSessions.value.forEach((item) => {
    const date = String(item.liveDate || '未知日期')
    const current = grouped.get(date) || { date, amount: 0, sessions: 0 }
    current.amount += Number(item.paymentTotalAmount || 0)
    current.sessions += 1
    grouped.set(date, current)
  })
  const rows = [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-7)
  const max = Math.max(...rows.map((item) => item.amount), 0)
  return rows.map((item) => ({ ...item, percent: max ? Math.max(4, (item.amount / max) * 100) : 0 }))
})
const analysisTrafficSources = computed(() => {
  const sourceDefinitions = [
    { key: 'recommended', label: '推荐' },
    { key: 'follow', label: '关注' },
    { key: 'local', label: '同城' },
    { key: 'other', label: '搜索 / 其他' },
  ]
  const totals = sourceDefinitions.map((item) => ({ ...item, value: analysisSessions.value.reduce((sum, session) => sum + Number(session[item.key] || 0), 0) }))
  const total = totals.reduce((sum, item) => sum + item.value, 0)
  return totals.map((item) => ({ ...item, percent: total ? Math.round((item.value / total) * 100) : 0 }))
})
const analysisTrafficTotal = computed(() => analysisTrafficSources.value.reduce((sum, item) => sum + item.value, 0))
const analysisTopProducts = computed(() => {
  const grouped = new Map()
  analysisSessions.value.forEach((session) => (session.products || []).forEach((product) => {
    const key = String(product.code || product.name || `${product.category || '商品'}-${session.id}`).trim()
    const current = grouped.get(key) || { key, name: product.name || product.code || '未命名商品', category: product.category || '', soldCount: 0, amount: 0 }
    current.soldCount += Number(product.soldCount || 0)
    current.amount += Number(product.dealAmount || 0)
    grouped.set(key, current)
  }))
  const rows = [...grouped.values()].sort((a, b) => b.amount - a.amount || b.soldCount - a.soldCount).slice(0, 5)
  const max = Math.max(...rows.map((item) => item.amount), 0)
  return rows.map((item) => ({ ...item, percent: max ? Math.max(4, (item.amount / max) * 100) : 0 }))
})
const analysisTalentPerformance = computed(() => {
  const grouped = new Map()
  analysisSessions.value.forEach((item) => {
    const key = String(item.talentUserId || item.talentName || 'unknown')
    const current = grouped.get(key) || { userId: key, name: item.talentName || '未命名主播', sessions: 0, viewers: 0, orders: 0, amount: 0 }
    current.sessions += 1
    current.viewers += Number(item.viewers || 0)
    current.orders += Number(item.paymentOrders || 0)
    current.amount += Number(item.paymentTotalAmount || 0)
    grouped.set(key, current)
  })
  return [...grouped.values()].sort((a, b) => b.amount - a.amount)
})
const availableTalents = computed(() => {
  if (operatorRoleLabel.value !== '主播') {
    return talents.value
  }

  const matchedTalent = talents.value.find((item) => String(item.userId) === currentLiveUserId.value)
  if (matchedTalent) {
    return [matchedTalent]
  }

  if (!currentLiveUserId.value) {
    return []
  }

  return [{
    userId: currentLiveUserId.value,
    nickname: accountName.value,
    email: props.account?.username || '',
  }]
})
const visibleReservations = computed(() => {
  const activeReservations = reservations.value
    .filter((item) => String(item.status) !== 'cancelled')
    .sort((a, b) => {
      return Number(a.counterId) - Number(b.counterId)
        || String(a.talentUserId).localeCompare(String(b.talentUserId))
        || shortTime(a.startTime).localeCompare(shortTime(b.startTime))
        || Number(a.id) - Number(b.id)
    })
  const groups = []

  for (const item of activeReservations) {
    const last = groups[groups.length - 1]
    const canMerge = last
      && Number(last.counterId) === Number(item.counterId)
      && String(last.talentUserId) === String(item.talentUserId)
      && String(last.status) === String(item.status)
      && String(last.liveDate) === String(item.liveDate)
      && shortTime(last.endTime) === shortTime(item.startTime)
      && !last.sessionId
      && !item.sessionId

    if (canMerge) {
      last.endTime = item.endTime
      last.ids.push(item.id)
      last.id = last.ids[0]
      last.rowKey = last.ids.join('-')
      last.sessionId = last.sessionId || item.sessionId
    } else {
      groups.push({
        ...item,
        ids: [item.id],
        rowKey: String(item.id),
      })
    }
  }

  return groups
})
const selectedEntryReservation = computed(() => {
  return entryReservations.value.find((item) => String(item.id) === String(liveEntryForm.reservationId)) || null
})
const availableEntryReservations = computed(() => {
  return entryReservations.value
    .filter((item) => String(item.status) !== 'cancelled' && !item.sessionId)
    .filter((item) => operatorRoleLabel.value !== '主播' || String(item.talentUserId) === currentLiveUserId.value)
    .sort((a, b) => {
      return String(a.liveDate).localeCompare(String(b.liveDate))
        || shortTime(a.startTime).localeCompare(shortTime(b.startTime))
        || Number(a.counterId) - Number(b.counterId)
  })
})
const selectedSlotGroups = computed(() => {
  const grouped = new Map()
  const sortedSlots = [...selectedSlots.value].sort((a, b) => {
    return Number(a.counter.id) - Number(b.counter.id) || slotIndex(a.slot) - slotIndex(b.slot)
  })

  for (const item of sortedSlots) {
    const key = String(item.counter.id)
    const previous = grouped.get(key)
    if (!previous || slotIndex(item.slot) !== slotIndex(previous.slots[previous.slots.length - 1]) + 1) {
      grouped.set(key, { key: `${key}-${item.slot.start}`, counter: item.counter, slots: [item.slot] })
    } else {
      previous.slots.push(item.slot)
    }
  }

  return Array.from(grouped.values()).map((group) => ({
    ...group,
    startTime: group.slots[0].start,
    endTime: group.slots[group.slots.length - 1].end,
    label: `${counterLabel(group.counter)} / ${group.slots[0].start}-${group.slots[group.slots.length - 1].end}`,
  }))
})

function getReservationForSlot(counter, slot) {
  return reservations.value.find((item) => {
    return Number(item.counterId) === Number(counter.id)
      && String(item.status) !== 'cancelled'
      && shortTime(item.startTime) < slot.end
      && shortTime(item.endTime) > slot.start
  })
}

function counterLabel(counter) {
  const id = Number(counter?.id)
  if (Number.isFinite(id) && id >= 1 && id <= 4) {
    return `${id}号柜台`
  }
  return String(counter?.displayName || `${counter?.id || ''}号柜台`).trim()
}

function isPastSlot(slot) {
  if (selectedDate.value !== today) {
    return selectedDate.value < today
  }

  const now = new Date()
  return slot.start <= `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function isSelectedSlot(counter, slot) {
  return selectedSlots.value.some((item) => slotKey(item.counter, item.slot) === slotKey(counter, slot))
}

function slotClass(counter, slot) {
  if (isSelectedSlot(counter, slot)) return 'is-selected'
  if (getReservationForSlot(counter, slot)) return 'is-booked'
  if (isPastSlot(slot)) return 'is-past'
  return 'is-free'
}

function slotLabel(counter, slot) {
  if (isSelectedSlot(counter, slot)) return '已选择'
  const reservation = getReservationForSlot(counter, slot)
  if (reservation) return reservation.talentName || '已预约'
  if (isPastSlot(slot)) return '已结束'
  return '可预约'
}

function canSelectSlot(counter, slot) {
  return !getReservationForSlot(counter, slot) && !isPastSlot(slot)
}

function selectSlot(counter, slot) {
  if (isSelectedSlot(counter, slot)) {
    selectedSlots.value = selectedSlots.value.filter((item) => slotKey(item.counter, item.slot) !== slotKey(counter, slot))
    if (!selectedSlots.value.some((item) => Number(item.counter.id) === Number(counter.id))) {
      delete selectionAnchors[counter.id]
    }
    if (!selectedSlots.value.length) {
      reservationForm.notes = ''
    }
    return
  }

  const counterSelections = selectedSlots.value.filter((item) => Number(item.counter.id) === Number(counter.id))
  const anchorStart = selectionAnchors[counter.id] || counterSelections[0]?.slot.start || slot.start
  const anchorIndex = timeSlots.findIndex((item) => item.start === anchorStart)
  const clickedIndex = timeSlots.findIndex((item) => item.start === slot.start)
  const rangeStart = Math.min(anchorIndex, clickedIndex)
  const rangeEnd = Math.max(anchorIndex, clickedIndex)
  const rangeSlots = timeSlots.slice(rangeStart, rangeEnd + 1)

  if (rangeSlots.some((item) => !canSelectSlot(counter, item))) {
    showNotice('所选连续时段中包含已预约或已结束的时间，请重新选择', 'error')
    return
  }

  if (rangeSlots.some((item) => hasSameTimeSelection(counter, item))) {
    showNotice('这个时间段你已经预约了一个柜台了哦，请勿重复预约', 'error')
    return
  }

  selectionAnchors[counter.id] = anchorStart
  const otherCounterSlots = selectedSlots.value.filter((item) => Number(item.counter.id) !== Number(counter.id))
  selectedSlots.value = [...otherCounterSlots, ...rangeSlots.map((rangeSlot) => ({ counter, slot: rangeSlot }))]
    .sort((a, b) => Number(a.counter.id) - Number(b.counter.id) || a.slot.start.localeCompare(b.slot.start))
  if (operatorRoleLabel.value === '主播' && currentLiveUserId.value) {
    reservationForm.talentUserId = currentLiveUserId.value
    return
  }

  if (!reservationForm.talentUserId && availableTalents.value.length) {
    reservationForm.talentUserId = availableTalents.value[0].userId
  }
}

function clearSelectedSlots() {
  selectedSlots.value = []
  Object.keys(selectionAnchors).forEach((key) => delete selectionAnchors[key])
  reservationForm.notes = ''
}

function removeSelectedSlotGroup(group) {
  selectedSlots.value = selectedSlots.value.filter((selectedItem) => {
    return Number(selectedItem.counter.id) !== Number(group.counter.id)
      || !group.slots.some((slot) => slot.start === selectedItem.slot.start)
  })
  delete selectionAnchors[group.counter.id]
  if (!selectedSlots.value.length) {
    reservationForm.notes = ''
  }
}

function slotKey(counter, slot) {
  return `${counter.id}-${slot.start}`
}

function selectedSlotLabel(item) {
  return `${counterLabel(item.counter)} / ${item.slot.start}-${item.slot.end}`
}

function slotIndex(slot) {
  return timeSlots.findIndex((item) => item.start === slot.start)
}

function timeKey(slot) {
  return `${slot.start}-${slot.end}`
}

function hasSameTimeSelection(counter, slot) {
  return selectedSlots.value.some((item) => {
    return Number(item.counter.id) !== Number(counter.id) && timeKey(item.slot) === timeKey(slot)
  })
}

function shortTime(value) {
  return String(value || '').slice(0, 5)
}

function numberText(value) {
  return Number(value || 0).toLocaleString('zh-CN')
}

function compactMoney(value) {
  const amount = Number(value || 0)
  if (amount >= 10000) return `¥${(amount / 10000).toFixed(amount % 10000 ? 1 : 0)}万`
  return `¥${amount.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`
}

function openTalentSessions(talent) {
  activeTab.value = 'sessions'
  const latest = sessions.value.find((item) => String(item.talentUserId) === String(talent.userId))
  expandedSessionId.value = latest?.id || null
}

function talentInitial(talent) {
  return String(talent?.nickname || talent?.userId || '?').trim().slice(0, 1).toUpperCase()
}

function sessionMoney(value) {
  return `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function sessionAverageTicket(item) {
  const orders = Number(item?.paymentOrders || 0)
  return orders ? Number(item.paymentTotalAmount || 0) / orders : 0
}

function sessionUvValue(item) {
  const viewers = Number(item?.viewers || 0)
  return viewers ? Number(item.paymentTotalAmount || 0) / viewers : 0
}

function sessionConversion(item) {
  const viewers = Number(item?.viewers || 0)
  return viewers ? ((Number(item.paidUsers || 0) / viewers) * 100).toFixed(2) : '0.00'
}

function toggleSessionDetails(sessionId) {
  expandedSessionId.value = expandedSessionId.value === sessionId ? null : sessionId
}

function statusLabel(status) {
  return ({ scheduled: '未签到', live: '已签到', completed: '已完成', cancelled: '已取消' })[status] || status || '-'
}

function reservationCounterLabel(item) {
  const id = Number(item?.counterId)
  if (Number.isFinite(id) && id >= 1 && id <= 4) {
    return `${id}号柜台`
  }
  return String(item?.counterName || '').trim()
}

function reservationDateTime(liveDate, timeValue) {
  return `${String(liveDate || selectedDate.value)} ${shortTime(timeValue)}:00`
}

function reservationStartTimestamp(item) {
  const date = String(item?.liveDate || selectedDate.value).slice(0, 10)
  const time = shortTime(item?.startTime)
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes).getTime()
}

function checkInOpensAt(item) {
  return reservationStartTimestamp(item) - 30 * 60 * 1000
}

function canCheckInReservation(item) {
  return item?.status === 'scheduled' && currentTimestamp.value >= checkInOpensAt(item)
}

function checkInButtonTitle(item) {
  if (item?.status !== 'scheduled') return statusLabel(item?.status)
  if (canCheckInReservation(item)) return '可以签到'
  const opensAt = new Date(checkInOpensAt(item))
  const date = `${opensAt.getFullYear()}-${String(opensAt.getMonth() + 1).padStart(2, '0')}-${String(opensAt.getDate()).padStart(2, '0')}`
  const time = `${String(opensAt.getHours()).padStart(2, '0')}:${String(opensAt.getMinutes()).padStart(2, '0')}`
  return `${date} ${time} 开放签到`
}

function reservationCode(item) {
  return String(item?.id || '').padStart(6, '0')
}

function talentOptionLabel(item) {
  const nickname = String(item?.nickname || '').trim()
  const username = String(item?.email || item?.username || '').trim()
  const id = String(item?.userId || '').trim()

  if (operatorRoleLabel.value === '主播') {
    return username && username !== nickname ? `${nickname} / ${username}` : nickname || username || id
  }

  return `${nickname || username || '主播'} / ${username || id}`
}

function emptyLiveProduct(seed = {}) {
  return {
    key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    code: seed.code || '',
    name: seed.name || '',
    category: seed.category || '',
    soldCount: Number(seed.soldCount || 0),
    dealAmount: Number(seed.dealAmount || 0),
    note: seed.note || '',
  }
}

function entryReservationLabel(item) {
  return `${item.liveDate} ${shortTime(item.startTime)}-${shortTime(item.endTime)} · ${item.talentName || '主播'} · ${reservationCounterLabel(item)}`
}

function addLiveProduct(seed = {}) {
  liveProducts.value = [...liveProducts.value, emptyLiveProduct(seed)]
}

function removeLiveProduct(index) {
  liveProducts.value = liveProducts.value.filter((_, itemIndex) => itemIndex !== index)
  if (!liveProducts.value.length) {
    liveProducts.value = [emptyLiveProduct()]
  }
}

function resetLiveImage() {
  liveImageDataUrl.value = ''
  liveImagePreview.value = ''
  liveImageName.value = ''
  liveImageStatus.value = ''
}

function clearLiveEntryForm() {
  Object.assign(liveEntryForm, { ...liveEntryDefaults })
  liveProducts.value = [emptyLiveProduct()]
  resetLiveImage()
}

function setNumberField(field, value) {
  if (value === null || value === undefined || value === '') return
  const number = Number(value)
  if (Number.isFinite(number) && number >= 0) {
    liveEntryForm[field] = number
  }
}

function applyRecognizedLiveData(data) {
  const fields = [
    'coverExposure',
    'viewers',
    'avgOnline',
    'interactionCount',
    'paidUsers',
    'paymentOrders',
    'paymentTotalAmount',
    'refundOrders',
    'newFollowers',
    'reservationCount',
    'recommended',
    'follow',
    'local',
    'other',
  ]
  fields.forEach((field) => setNumberField(field, data?.[field]))
  if (typeof data?.notes === 'string' && data.notes.trim()) {
    liveEntryForm.notes = data.notes.trim().slice(0, 500)
  }
  if (Array.isArray(data?.products) && data.products.length) {
    liveProducts.value = data.products.map((product) => emptyLiveProduct(product))
  }
}

function mergeEntryReservations(items) {
  const sorted = (Array.isArray(items) ? items : [])
    .filter((item) => String(item?.status) !== 'cancelled')
    .sort((a, b) => {
      return String(a.liveDate).localeCompare(String(b.liveDate))
        || String(a.talentUserId).localeCompare(String(b.talentUserId))
        || Number(a.counterId) - Number(b.counterId)
        || shortTime(a.startTime).localeCompare(shortTime(b.startTime))
    })
  const groups = []

  for (const item of sorted) {
    const last = groups[groups.length - 1]
    const canMerge = last
      && String(last.liveDate) === String(item.liveDate)
      && String(last.talentUserId) === String(item.talentUserId)
      && Number(last.counterId) === Number(item.counterId)
      && String(last.status) !== 'cancelled'
      && String(item.status) !== 'cancelled'
      && shortTime(last.endTime) === shortTime(item.startTime)

    if (canMerge) {
      last.endTime = item.endTime
      last.ids = [...(last.ids || [last.id]), ...(item.ids || [item.id])]
      last.sessionId = last.sessionId || item.sessionId
    } else {
      groups.push({ ...item, ids: item.ids || [item.id] })
    }
  }

  return groups.filter((item) => !item.sessionId)
}

function handleLiveImageChange(event) {
  const file = event.target.files?.[0]
  resetLiveImage()
  if (!file) return
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    showNotice('图片格式不正确，仅支持 PNG、JPG 或 WebP', 'error')
    event.target.value = ''
    return
  }
  if (file.size > 8 * 1024 * 1024) {
    showNotice('图片不能超过 8 MB', 'error')
    event.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    liveImageDataUrl.value = String(reader.result || '')
    liveImagePreview.value = liveImageDataUrl.value
    liveImageName.value = file.name
    liveImageStatus.value = '图片已选择，点击“识别并填入”开始识别。'
  }
  reader.onerror = () => {
    showNotice('图片读取失败，请重新选择', 'error')
    event.target.value = ''
  }
  reader.readAsDataURL(file)
}

function showNotice(message, type = 'success') {
  notice.value = message
  noticeType.value = type
  window.clearTimeout(showNotice.timer)
  showNotice.timer = window.setTimeout(() => {
    notice.value = ''
  }, 3500)
}

async function api(path, options = {}) {
  const response = await fetch(`/api/admin/live-follow${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${props.token}`,
      'Cache-Control': 'no-cache',
      ...(options.headers || {}),
    },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.success === false) {
    throw new Error(payload.detail || '操作失败，请稍后重试')
  }
  return payload
}

async function loadWorkspace() {
  isLoading.value = true
  clearSelectedSlots()
  try {
    const payload = await api(`/bootstrap?dateValue=${encodeURIComponent(selectedDate.value)}`)
    talents.value = Array.isArray(payload.talents) ? payload.talents : []
    if (operatorRoleLabel.value === '主播' && currentLiveUserId.value) {
      reservationForm.talentUserId = currentLiveUserId.value
    } else if (!reservationForm.talentUserId && availableTalents.value.length) {
      reservationForm.talentUserId = availableTalents.value[0].userId
    }
    counters.value = Array.isArray(payload.counters)
      ? payload.counters.map((item) => ({ ...item, isActive: item.isActive === true || Number(item.isActive) === 1 }))
      : []
    reservations.value = Array.isArray(payload.reservations) ? payload.reservations : []
    entryReservations.value = mergeEntryReservations(
      Array.isArray(payload.entryReservations) ? payload.entryReservations : reservations.value,
    )
    sessions.value = Array.isArray(payload.sessions) ? payload.sessions : []
    if (liveEntryForm.reservationId && !availableEntryReservations.value.some((item) => String(item.id) === String(liveEntryForm.reservationId))) {
      liveEntryForm.reservationId = ''
    }
    hasLoaded.value = true
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '预约管理数据加载失败', 'error')
  } finally {
    isLoading.value = false
  }
}

function openTab(tab) {
  if (tab === 'accounts' && operatorRoleLabel.value !== '管理员') {
    activeTab.value = 'home'
    return
  }
  activeTab.value = tab
  if (tab === 'accounts') {
    loadAccounts()
  }
  if ((tab === 'schedule' || tab === 'entry' || tab === 'sessions') && !hasLoaded.value) {
    loadWorkspace()
  }
}

function resetAccountEditForm() {
  editingAccountId.value = null
  Object.assign(accountEditForm, {
    username: '',
    displayName: '',
    password: '',
    role: 'anchor',
    avatarUrl: '',
    bio: '',
  })
}

async function loadAccounts() {
  if (operatorRoleLabel.value !== '管理员') return
  isLoadingAccounts.value = true
  try {
    const payload = await api('/accounts')
    accounts.value = Array.isArray(payload.items) ? payload.items : []
    if (editingAccountId.value) {
      const selected = accounts.value.find((item) => item.id === editingAccountId.value)
      if (selected) editAccount(selected)
      else resetAccountEditForm()
    }
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '账号列表加载失败', 'error')
  } finally {
    isLoadingAccounts.value = false
  }
}

function accountRoleLabel(role) {
  return ({ anchor: '主播', control: '中控', admin: '管理员', 主播: '主播', 中控: '中控', 管理员: '管理员' })[role] || role || '-'
}

function editAccount(item) {
  editingAccountId.value = item.id
  Object.assign(accountEditForm, {
    username: item.username || '',
    displayName: item.displayName || '',
    password: '',
    role: item.role || 'anchor',
    avatarUrl: item.avatarUrl || '',
    bio: item.bio || '',
  })
}

async function saveEditingAccount() {
  if (!editingAccountId.value) return
  const accountId = editingAccountId.value
  savingAccountId.value = accountId
  try {
    const payload = await api(`/accounts/${accountId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        username: accountEditForm.username,
        displayName: accountEditForm.displayName,
        role: accountEditForm.role,
        avatarUrl: accountEditForm.avatarUrl,
        bio: accountEditForm.bio,
        password: accountEditForm.password || '',
      }),
    })
    const updated = payload.item || {}
    accounts.value = accounts.value.map((item) => item.id === accountId ? updated : item)
    editAccount(updated)
    await loadWorkspace()
    showNotice(`已保存 ${updated.username || accountEditForm.username} 的账号设置`)
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '账号保存失败', 'error')
  } finally {
    savingAccountId.value = null
  }
}

async function createCounter() {
  if (!newCounterName.value) return
  isCreatingCounter.value = true
  try {
    const payload = await api('/counters', {
      method: 'POST',
      body: JSON.stringify({ displayName: newCounterName.value }),
    })
    newCounterName.value = ''
    await loadWorkspace()
    showNotice(`已新增 ${payload.item?.displayName || '柜台'}`)
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '柜台新增失败', 'error')
  } finally {
    isCreatingCounter.value = false
  }
}

async function saveCounter(counter) {
  savingCounterId.value = counter.id
  try {
    const payload = await api(`/counters/${counter.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ displayName: counter.displayName, isActive: counter.isActive }),
    })
    Object.assign(counter, payload.item || {}, {
      isActive: payload.item?.isActive === true || Number(payload.item?.isActive) === 1,
    })
    await loadWorkspace()
    showNotice(`已保存 ${counter.displayName} 的柜台设置`)
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '柜台保存失败', 'error')
  } finally {
    savingCounterId.value = null
  }
}

async function submitReservation() {
  if (!selectedSlots.value.length) return
  isSaving.value = true
  try {
    for (const group of selectedSlotGroups.value) {
      await api('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          talentUserId: reservationForm.talentUserId,
          counterId: group.counter.id,
          liveDate: selectedDate.value,
          startTime: group.startTime,
          endTime: group.endTime,
          notes: reservationForm.notes,
        }),
      })
    }
    reservationForm.notes = ''
    clearSelectedSlots()
    await loadWorkspace()
    showNotice('直播预约已创建')
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '创建预约失败', 'error')
  } finally {
    isSaving.value = false
  }
}

async function updateReservationGroupStatus(item, status, successMessage) {
  try {
    for (const reservationId of item.ids || [item.id]) {
      await api(`/reservations/${reservationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
    }
    await loadWorkspace()
    showNotice(successMessage)
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '操作失败', 'error')
  }
}

function checkInReservation(item) {
  updateReservationGroupStatus(item, 'live', '签到成功')
}

function cancelReservation(item) {
  updateReservationGroupStatus(item, 'cancelled', '预约已取消')
}

async function recognizeLiveImage() {
  if (!liveImageDataUrl.value) return
  isRecognizing.value = true
  liveImageStatus.value = '正在读取图片并识别数据，请稍候...'
  try {
    const payload = await api('/recognize-live-data', {
      method: 'POST',
      body: JSON.stringify({ imageDataUrl: liveImageDataUrl.value }),
    })
    applyRecognizedLiveData(payload.data || {})
    liveImageStatus.value = '识别结果已填入表单，请逐项核对后再点击“保存本场数据”。'
    showNotice('图片识别完成，数据尚未提交')
  } catch (error) {
    const message = error instanceof Error ? error.message : '识别失败，请换一张更清晰的截图'
    liveImageStatus.value = `识别失败：${message}`
    showNotice(`识别失败：${message}`, 'error')
  } finally {
    isRecognizing.value = false
  }
}

async function submitLiveSession() {
  if (!liveEntryForm.reservationId) {
    showNotice('请先选择一条预约直播场次', 'error')
    return
  }
  isSavingSession.value = true
  try {
    const payload = {
      reservationId: Number(liveEntryForm.reservationId),
      coverExposure: Number(liveEntryForm.coverExposure || 0),
      viewers: Number(liveEntryForm.viewers || 0),
      avgOnline: Number(liveEntryForm.avgOnline || 0),
      recommended: Number(liveEntryForm.recommended || 0),
      follow: Number(liveEntryForm.follow || 0),
      local: Number(liveEntryForm.local || 0),
      other: Number(liveEntryForm.other || 0),
      interactionCount: Number(liveEntryForm.interactionCount || 0),
      paidUsers: Number(liveEntryForm.paidUsers || 0),
      paymentOrders: Number(liveEntryForm.paymentOrders || 0),
      paymentTotalAmount: Number(liveEntryForm.paymentTotalAmount || 0),
      refundOrders: Number(liveEntryForm.refundOrders || 0),
      newFollowers: Number(liveEntryForm.newFollowers || 0),
      reservationCount: Number(liveEntryForm.reservationCount || 0),
      notes: liveEntryForm.notes || '',
      products: liveProducts.value
        .filter((product) => String(product.code || '').trim() || String(product.name || '').trim())
        .map((product) => ({
          code: String(product.code || '').trim(),
          name: String(product.name || '').trim(),
          category: String(product.category || '').trim(),
          soldCount: Number(product.soldCount || 0),
          dealAmount: Number(product.dealAmount || 0),
          note: String(product.note || '').trim(),
        })),
    }
    const result = await api('/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const saved = result.item || {}
    clearLiveEntryForm()
    await loadWorkspace()
    showNotice(`已保存 ${saved.liveDate || ''} ${saved.talentName || '主播'} 的直播数据`)
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '保存本场数据失败', 'error')
  } finally {
    isSavingSession.value = false
  }
}

async function deleteSession(item) {
  if (!window.confirm(`确认删除 ${item.talentName || '该主播'} 在 ${item.liveDate} 的场次数据？`)) return
  try {
    await api(`/sessions/${item.id}`, { method: 'DELETE' })
    await loadWorkspace()
    showNotice('场次数据已删除')
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '删除场次失败', 'error')
  }
}

onMounted(() => {
  loadWorkspace()
  clockTimer = window.setInterval(() => {
    currentTimestamp.value = Date.now()
  }, 30000)
})

onUnmounted(() => {
  window.clearInterval(clockTimer)
})
</script>

<template>
  <section class="admin-monthly-attendance">
    <header class="admin-monthly-head">
      <div>
        <p>MONTHLY ATTENDANCE</p>
        <h2>月度签到数据</h2>
        <span>查看主播与中控每月排班及签到情况</span>
      </div>
      <button type="button" :disabled="isLoading" @click="loadData">
        {{ isLoading ? '刷新中...' : '刷新数据' }}
      </button>
    </header>

    <div class="admin-monthly-filters">
      <label>
        <span>人员类型</span>
        <select v-model="personType" @change="changePersonType">
          <option value="talent">主播</option>
          <option value="control">中控</option>
        </select>
      </label>
      <label>
        <span>{{ personType === 'control' ? '选择中控' : '选择主播' }}</span>
        <select v-model="selectedPersonId" :disabled="!personOptions.length" @change="selectDefaultDate">
          <option v-if="!personOptions.length" value="">暂无人员</option>
          <option v-for="item in personOptions" :key="item.userId" :value="item.userId">
            {{ item.name }}
          </option>
        </select>
      </label>
      <label>
        <span>月份</span>
        <input v-model="selectedMonth" type="month" @change="loadData" />
      </label>
    </div>

    <p v-if="errorMessage" class="admin-error">{{ errorMessage }}</p>

    <template v-else>
      <section class="admin-monthly-summary" aria-label="月度签到汇总">
        <article><small>{{ personType === 'control' ? '跟播天数' : '预约天数' }}</small><strong>{{ bookingStats.days }}</strong><span>天</span></article>
        <article><small>{{ personType === 'control' ? '跟播场次' : '预约场次' }}</small><strong>{{ bookingStats.sessions }}</strong><span>场</span></article>
        <article><small>已签到</small><strong>{{ bookingStats.checkedIn }}</strong><span>场</span></article>
        <article><small>超时未签到</small><strong>{{ bookingStats.missed }}</strong><span>场</span></article>
        <article><small>待签到</small><strong>{{ bookingStats.pending }}</strong><span>场</span></article>
      </section>

      <div v-if="isLoading" class="admin-monthly-loading">正在加载月度签到数据...</div>
      <template v-else>
        <div class="admin-monthly-weekdays" aria-hidden="true">
          <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
        </div>
        <div class="admin-monthly-calendar">
          <span v-for="blank in blankDays" :key="`blank-${blank}`" class="is-blank"></span>
          <button
            v-for="day in calendarDays"
            :key="day.date"
            type="button"
            :class="{
              'is-booked': day.sessionCount > 0,
              'is-empty': day.sessionCount === 0,
              'is-selected': selectedDate === day.date,
              'is-today': day.date === today,
            }"
            @click="selectedDate = day.date"
          >
            <strong>{{ day.day }}</strong>
            <small>{{ day.sessionCount ? `${day.sessionCount}场` : (personType === 'control' ? '无跟播' : '未预约') }}</small>
          </button>
        </div>

        <section class="admin-monthly-day-detail">
          <header>
            <div><small>所选日期</small><h3>{{ selectedDate }}</h3></div>
            <strong>{{ selectedDayReservations.length }} 场</strong>
          </header>
          <p v-if="!selectedDayReservations.length">当天没有{{ personType === 'control' ? '跟播' : '预约' }}</p>
          <div v-else class="admin-monthly-day-list">
            <article v-for="item in selectedDayReservations" :key="item.rowKey">
              <time>{{ shortTime(item.startTime) }}-{{ shortTime(item.endTime) }}</time>
              <div>
                <strong>{{ counterpartName(item) }}</strong>
                <small>{{ counterLabel(item) }}</small>
              </div>
              <span class="live-status-pill" :class="attendanceClass(item)">{{ attendanceLabel(item) }}</span>
            </article>
          </div>
        </section>
      </template>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  token: { type: String, required: true },
})

function localDate() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

const today = localDate()
const personType = ref('talent')
const selectedPersonId = ref('')
const selectedMonth = ref(today.slice(0, 7))
const selectedDate = ref(today)
const talents = ref([])
const controls = ref([])
const reservations = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const weekdays = ['一', '二', '三', '四', '五', '六', '日']

const personOptions = computed(() => {
  const source = personType.value === 'control' ? controls.value : talents.value
  const fallbackKey = personType.value === 'control' ? 'control' : 'talent'
  const options = new Map()
  source.forEach((item) => {
    const userId = String(item.userId || '').trim()
    if (userId) options.set(userId, { userId, name: item.nickname || item.username || `未命名${fallbackKey === 'control' ? '中控' : '主播'}` })
  })
  reservations.value.forEach((item) => {
    const userId = String(personType.value === 'control' ? item.controlUserId : item.talentUserId || '').trim()
    const name = personType.value === 'control' ? item.controlName : item.talentName
    if (userId && !options.has(userId)) options.set(userId, { userId, name: name || `未命名${fallbackKey === 'control' ? '中控' : '主播'}` })
  })
  return [...options.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
})

const activePersonId = computed(() => {
  if (personOptions.value.some((item) => item.userId === selectedPersonId.value)) return selectedPersonId.value
  return personOptions.value[0]?.userId || ''
})

const monthlyReservations = computed(() => mergeReservations(
  reservations.value
    .filter((item) => String(item.status) !== 'cancelled')
    .filter((item) => String(personType.value === 'control' ? item.controlUserId : item.talentUserId) === activePersonId.value)
    .filter((item) => String(item.liveDate).slice(0, 7) === selectedMonth.value),
))

const reservationsByDate = computed(() => {
  const grouped = new Map()
  monthlyReservations.value.forEach((item) => {
    const key = String(item.liveDate).slice(0, 10)
    grouped.set(key, [...(grouped.get(key) || []), item])
  })
  return grouped
})

const bookingStats = computed(() => ({
  days: reservationsByDate.value.size,
  sessions: monthlyReservations.value.length,
  checkedIn: monthlyReservations.value.filter((item) => isCheckedIn(item)).length,
  missed: monthlyReservations.value.filter((item) => isMissed(item)).length,
  pending: monthlyReservations.value.filter((item) => !isCheckedIn(item) && !isMissed(item)).length,
}))

const blankDays = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  if (!year || !month) return 0
  return (new Date(year, month - 1, 1).getDay() + 6) % 7
})

const calendarDays = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  if (!year || !month) return []
  return Array.from({ length: new Date(year, month, 0).getDate() }, (_, index) => {
    const day = index + 1
    const date = `${selectedMonth.value}-${String(day).padStart(2, '0')}`
    return { date, day, sessionCount: (reservationsByDate.value.get(date) || []).length }
  })
})

const selectedDayReservations = computed(() => (
  reservationsByDate.value.get(selectedDate.value) || []
).slice().sort((a, b) => shortTime(a.startTime).localeCompare(shortTime(b.startTime))))

function shortTime(value) {
  return String(value || '').slice(0, 5)
}

function startTimestamp(item) {
  return new Date(`${String(item.liveDate).slice(0, 10)}T${shortTime(item.startTime)}:00`).getTime()
}

function isCheckedIn(item) {
  return personType.value === 'control'
    ? Boolean(item.controlCheckedInAt)
    : ['live', 'completed'].includes(String(item.status))
}

function isMissed(item) {
  return !isCheckedIn(item) && Date.now() > startTimestamp(item) + 30 * 60 * 1000
}

function attendanceLabel(item) {
  if (isCheckedIn(item)) return '已签到'
  if (isMissed(item)) return '未签到（已超时）'
  return '待签到'
}

function attendanceClass(item) {
  if (isCheckedIn(item)) return 'is-live'
  if (isMissed(item)) return 'is-overdue'
  return 'is-scheduled'
}

function counterpartName(item) {
  return personType.value === 'control'
    ? `主播：${item.talentName || '未命名主播'}`
    : `中控：${item.controlName || '无'}`
}

function counterLabel(item) {
  const id = Number(item.counterId)
  return Number.isFinite(id) && id > 0 ? `${id}号柜台` : item.counterName || '-'
}

function mergeReservations(items) {
  const sorted = [...items].sort((a, b) => (
    String(a.liveDate).localeCompare(String(b.liveDate))
    || Number(a.counterId) - Number(b.counterId)
    || shortTime(a.startTime).localeCompare(shortTime(b.startTime))
    || Number(a.id) - Number(b.id)
  ))
  const groups = []
  sorted.forEach((item) => {
    const last = groups.at(-1)
    const canMerge = last
      && String(last.liveDate) === String(item.liveDate)
      && Number(last.counterId) === Number(item.counterId)
      && String(last.talentUserId) === String(item.talentUserId)
      && String(last.controlUserId) === String(item.controlUserId)
      && String(last.status) === String(item.status)
      && Boolean(last.controlCheckedInAt) === Boolean(item.controlCheckedInAt)
      && shortTime(last.endTime) === shortTime(item.startTime)
    if (canMerge) {
      last.endTime = item.endTime
      last.ids.push(item.id)
      last.rowKey = last.ids.join('-')
    } else {
      groups.push({ ...item, ids: [item.id], rowKey: String(item.id) })
    }
  })
  return groups
}

function selectDefaultDate() {
  const dates = [...reservationsByDate.value.keys()].sort()
  selectedDate.value = today.startsWith(`${selectedMonth.value}-`)
    ? today
    : dates[0] || `${selectedMonth.value}-01`
}

function changePersonType() {
  selectedPersonId.value = personOptions.value[0]?.userId || ''
  selectDefaultDate()
}

async function request(path) {
  const response = await fetch(`/api/admin/live-follow${path}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${props.token}` },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.detail || '月度签到数据加载失败')
  return payload
}

async function loadData() {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  if (!year || !month) return
  const firstDate = `${selectedMonth.value}-01`
  const lastDate = `${selectedMonth.value}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [bootstrap, monthly] = await Promise.all([
      request(`/bootstrap?dateValue=${encodeURIComponent(firstDate)}`),
      request(`/reservations?dateFrom=${encodeURIComponent(firstDate)}&dateTo=${encodeURIComponent(lastDate)}`),
    ])
    talents.value = Array.isArray(bootstrap.talents) ? bootstrap.talents : []
    controls.value = Array.isArray(bootstrap.controls) ? bootstrap.controls : []
    reservations.value = Array.isArray(monthly.items) ? monthly.items : []
    if (!personOptions.value.some((item) => item.userId === selectedPersonId.value)) {
      selectedPersonId.value = personOptions.value[0]?.userId || ''
    }
    selectDefaultDate()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '月度签到数据加载失败'
    reservations.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(loadData)
</script>

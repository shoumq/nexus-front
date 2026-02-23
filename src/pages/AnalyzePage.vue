<template>
  <section class="panel">
    <div class="panel-head">
      <h1>Анализ</h1>
      <span class="pill">/ai/analyze</span>
    </div>

    <form class="form" @submit.prevent="submit">
      <label>
        Таймзона
        <input v-model.trim="userTz" placeholder="Europe/Moscow" />
      </label>

      <div class="grid-2">
        <label>
          Период
          <select v-model="period">
            <option value="day">День</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="all">Все время</option>
          </select>
        </label>
        <label>
          Week starts
          <input v-model.trim="weekStarts" placeholder="monday" />
        </label>
        <label>
          Work start hour
          <input v-model.number="workStart" type="number" min="0" max="23" />
        </label>
        <label>
          Work end hour
          <input v-model.number="workEnd" type="number" min="0" max="23" />
        </label>
      </div>

      <button class="primary" :disabled="loading">Запросить анализ</button>
      <div v-if="error" class="error">{{ error }}</div>
    </form>

    <div v-if="result" class="result">
      <div class="card glass">
        <div class="card-head">
          <h3>LLM Insight</h3>
        </div>
        <pre class="insight">{{ result.llm_insight }}</pre>
      </div>

      <div class="card glass">
        <div class="card-head">
          <h3>Энергия по дням</h3>
        </div>
        <div class="week-bars">
          <div
            class="row"
            v-for="(value, day) in result.energy_by_weekday"
            :key="day"
          >
            <span>{{ day }}</span>
            <div class="track"><div class="fill" :style="{ width: toPercent(value, result.energy_by_weekday) }"></div></div>
          </div>
        </div>
      </div>
    </div>

    <LoaderOverlay v-if="loading" label="Считаем аналитику…" />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import LoaderOverlay from '../components/LoaderOverlay.vue'
import { aiApi } from '../services/api'

const userTz = ref('')
const period = ref('week')
const weekStarts = ref('monday')
const workStart = ref(9)
const workEnd = ref(18)

const loading = ref(false)
const result = ref(null)
const error = ref('')

const submit = async () => {
  loading.value = true
  error.value = ''
  try {
    result.value = await aiApi.analyze({
      user_tz: userTz.value,
      period: period.value,
      week_starts: weekStarts.value,
      constraints: { work_start_hour: workStart.value, work_end_hour: workEnd.value }
    })
    localStorage.setItem('nexus_last_analyze', JSON.stringify({
      at: new Date().toISOString(),
      params: {
        user_tz: userTz.value,
        period: period.value,
        week_starts: weekStarts.value,
        constraints: { work_start_hour: workStart.value, work_end_hour: workEnd.value }
      },
      result: result.value
    }))
  } catch (e) {
    error.value = e.message || 'Ошибка /ai/analyze'
  } finally {
    loading.value = false
  }
}

const toPercent = (value, map) => {
  const max = Math.max(...Object.values(map || { x: 1 })) || 1
  return `${(value / max) * 100}%`
}

onMounted(() => {
  userTz.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
})
</script>

<style scoped>
.panel {
  position: relative;
  padding: 24px;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: var(--glass);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 10px;
}

.result {
  display: grid;
  gap: 16px;
  margin-top: 18px;
}

.insight {
  white-space: pre-wrap;
  font-size: 13px;
  line-height: 1.5;
}

.error {
  margin-top: 10px;
  color: #ff7a7a;
  font-size: 13px;
}

@media (max-width: 800px) {
  .grid-2 { grid-template-columns: 1fr; }
}
</style>

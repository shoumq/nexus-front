<template>
  <div class="page">
    <header class="hero">
      <div class="title-block">
        <p class="kicker">Nexus AI • Анализ энергии</p>
        <h1>AI Analyze</h1>
        <p class="subtitle">
          Отправь данные трекинга и получи энергетику по часу и дням недели,
          а также текстовый insight.
        </p>
      </div>
      <div class="actions">
        <button class="primary" :disabled="loading" @click="runAnalyze">
          {{ loading ? 'Запрос выполняется…' : 'Запросить анализ' }}
        </button>
        <div class="meta" v-if="lastRunAt">
          Последний запрос: {{ lastRunAt }}
        </div>
        <div class="error" v-if="error">
          {{ error }}
        </div>
      </div>
    </header>

    <section class="panel" v-if="result">
      <div class="panel-head">
        <h2>Энергия по часам</h2>
        <span class="badge">{{ energyByHourBars.length }} точек</span>
      </div>
      <div class="bars">
        <div class="bar-row" v-for="item in energyByHourBars" :key="item.label">
          <div class="bar-label">{{ item.label }}:00</div>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: item.width + '%' }"></div>
          </div>
          <div class="bar-value">{{ item.value.toFixed(2) }}</div>
        </div>
      </div>
    </section>

    <section class="panel" v-if="result">
      <div class="panel-head">
        <h2>Энергия по дням недели</h2>
        <span class="badge">{{ energyByWeekdayBars.length }} дней</span>
      </div>
      <div class="bars">
        <div class="bar-row" v-for="item in energyByWeekdayBars" :key="item.label">
          <div class="bar-label">{{ item.label }}</div>
          <div class="bar-track">
            <div class="bar-fill alt" :style="{ width: item.width + '%' }"></div>
          </div>
          <div class="bar-value">{{ item.value.toFixed(2) }}</div>
        </div>
      </div>
    </section>

    <section class="panel grid" v-if="result">
      <div class="card">
        <div class="panel-head">
          <h2>Модель продуктивности</h2>
          <span class="badge">score {{ result.productivity_model?.score?.toFixed(2) ?? '—' }}</span>
        </div>
        <ul class="list">
          <li v-for="(value, key) in result.productivity_model?.weights" :key="key">
            <span class="label">{{ key }}</span>
            <span class="value">{{ value }}</span>
          </li>
        </ul>
      </div>

      <div class="card">
        <div class="panel-head">
          <h2>Риск выгорания</h2>
          <span class="badge" :class="burnoutLevelClass">{{ result.burnout_risk?.level ?? 'n/a' }}</span>
        </div>
        <div class="metric">
          <div class="metric-label">Score</div>
          <div class="metric-value">{{ result.burnout_risk?.score ?? '—' }}</div>
        </div>
        <ul class="list">
          <li v-for="reason in result.burnout_risk?.reasons || []" :key="reason">
            {{ reason }}
          </li>
        </ul>
      </div>

      <div class="card">
        <div class="panel-head">
          <h2>LLM Insight</h2>
          <span class="badge">summary</span>
        </div>
        <pre class="insight">{{ result.llm_insight }}</pre>
      </div>
    </section>

    <section class="panel" v-if="result">
      <div class="panel-head">
        <h2>Запрос (payload)</h2>
      </div>
      <pre class="payload">{{ prettyRequest }}</pre>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const requestBody = {
  user_tz: 'Europe/Amsterdam',
  constraints: {
    work_start_hour: 9,
    work_end_hour: 18
  },
  week_starts: 'monday',
  points: [
    { ts: '2026-02-03T08:30:00+01:00', sleep_hours: 7.6, mood: 7.2, activity: 6.0, productive: 6.8 },
    { ts: '2026-02-03T10:00:00+01:00', sleep_hours: 7.6, mood: 7.4, activity: 6.5, productive: 7.2 },
    { ts: '2026-02-03T14:00:00+01:00', sleep_hours: 7.6, mood: 6.9, activity: 5.6, productive: 6.4 },
    { ts: '2026-02-03T16:30:00+01:00', sleep_hours: 7.6, mood: 6.7, activity: 5.2, productive: 6.0 },

    { ts: '2026-02-04T09:00:00+01:00', sleep_hours: 7.2, mood: 6.8, activity: 5.8, productive: 6.3 },
    { ts: '2026-02-04T11:30:00+01:00', sleep_hours: 7.2, mood: 7.0, activity: 6.2, productive: 6.7 },
    { ts: '2026-02-04T15:00:00+01:00', sleep_hours: 7.2, mood: 6.4, activity: 5.0, productive: 5.8 },

    { ts: '2026-02-05T08:45:00+01:00', sleep_hours: 6.6, mood: 6.2, activity: 5.4, productive: 5.9 },
    { ts: '2026-02-05T10:30:00+01:00', sleep_hours: 6.6, mood: 6.5, activity: 5.8, productive: 6.2 },
    { ts: '2026-02-05T14:30:00+01:00', sleep_hours: 6.6, mood: 6.0, activity: 4.8, productive: 5.4 },
    { ts: '2026-02-05T17:00:00+01:00', sleep_hours: 6.6, mood: 5.8, activity: 4.6, productive: 5.1 },

    { ts: '2026-02-06T09:15:00+01:00', sleep_hours: 7.9, mood: 7.6, activity: 6.6, productive: 7.4 },
    { ts: '2026-02-06T12:00:00+01:00', sleep_hours: 7.9, mood: 7.2, activity: 6.0, productive: 6.9 },
    { ts: '2026-02-06T15:30:00+01:00', sleep_hours: 7.9, mood: 6.9, activity: 5.5, productive: 6.3 },

    { ts: '2026-02-07T10:00:00+01:00', sleep_hours: 8.3, mood: 7.9, activity: 6.8, productive: 7.1 },
    { ts: '2026-02-07T13:00:00+01:00', sleep_hours: 8.3, mood: 7.4, activity: 6.1, productive: 6.6 },

    { ts: '2026-02-08T09:30:00+01:00', sleep_hours: 8.0, mood: 7.7, activity: 6.4, productive: 7.0 },
    { ts: '2026-02-08T14:00:00+01:00', sleep_hours: 8.0, mood: 7.2, activity: 5.8, productive: 6.5 }
  ]
}

const loading = ref(false)
const error = ref('')
const result = ref(null)
const lastRunAt = ref('')

const prettyRequest = computed(() => JSON.stringify(requestBody, null, 2))

const energyByHourBars = computed(() => {
  if (!result.value?.energy_by_hour) return []
  const entries = Object.entries(result.value.energy_by_hour)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => Number(a.label) - Number(b.label))

  const maxValue = Math.max(...entries.map((item) => item.value)) || 1
  return entries.map((item) => ({
    ...item,
    width: (item.value / maxValue) * 100
  }))
})

const weekdayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const energyByWeekdayBars = computed(() => {
  if (!result.value?.energy_by_weekday) return []
  const entries = Object.entries(result.value.energy_by_weekday)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => weekdayOrder.indexOf(a.label) - weekdayOrder.indexOf(b.label))

  const maxValue = Math.max(...entries.map((item) => item.value)) || 1
  return entries.map((item) => ({
    ...item,
    width: (item.value / maxValue) * 100
  }))
})

const burnoutLevelClass = computed(() => {
  const level = result.value?.burnout_risk?.level
  if (!level) return ''
  return `badge-${level}`
})

const runAnalyze = async () => {
  loading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await fetch('http://localhost:8088/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Ошибка ${response.status}: ${text || response.statusText}`)
    }

    result.value = await response.json()
    lastRunAt.value = new Date().toLocaleString('ru-RU')
  } catch (err) {
    error.value = err?.message || 'Не удалось выполнить запрос'
  } finally {
    loading.value = false
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

:root {
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  background: radial-gradient(circle at top left, #e8f5ff 0%, #f6f2ff 45%, #fff6e8 100%);
  color: #151619;
}

.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  margin-bottom: 32px;
}

.kicker {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
  font-weight: 600;
  color: #5a60ff;
  margin: 0 0 12px;
}

h1 {
  font-size: 48px;
  margin: 0 0 12px;
}

.subtitle {
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  color: #2f3341;
}

.actions {
  background: #111216;
  color: #f7f7fb;
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 16px 40px rgba(17, 18, 22, 0.2);
}

.primary {
  width: 100%;
  border: none;
  background: linear-gradient(120deg, #5a60ff, #00c3ff);
  color: #fff;
  padding: 14px 18px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.primary:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(90, 96, 255, 0.35);
}

.meta {
  margin-top: 16px;
  font-size: 13px;
  color: #b9c0ff;
}

.error {
  margin-top: 12px;
  font-size: 13px;
  color: #ff9c9c;
}

.panel {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 12px 28px rgba(15, 16, 19, 0.08);
  margin-bottom: 24px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-head h2 {
  font-size: 20px;
  margin: 0;
}

.badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: #edf0ff;
  color: #4a50ff;
}

.badge-low {
  background: #e6fff5;
  color: #0f8b5d;
}

.badge-medium {
  background: #fff5d6;
  color: #a86b07;
}

.badge-high {
  background: #ffe3e3;
  color: #b3261e;
}

.bars {
  display: grid;
  gap: 12px;
}

.bar-row {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr) 60px;
  gap: 12px;
  align-items: center;
}

.bar-label {
  font-size: 14px;
  font-weight: 600;
  color: #1c1f2e;
}

.bar-track {
  height: 12px;
  background: #eef1f7;
  border-radius: 999px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #5a60ff 0%, #6bffb9 100%);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.bar-fill.alt {
  background: linear-gradient(90deg, #ff7a59 0%, #ffd56b 100%);
}

.bar-value {
  font-size: 13px;
  text-align: right;
  color: #2f3341;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.card {
  background: #ffffff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 8px 22px rgba(17, 18, 22, 0.08);
}

.list {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: grid;
  gap: 10px;
}

.list li {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #2f3341;
}

.list .label {
  color: #6a6f7f;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f7f8fb;
  border-radius: 12px;
  margin-top: 8px;
}

.metric-label {
  font-size: 13px;
  color: #70748a;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
}

.insight {
  background: #0f1117;
  color: #e6e9f2;
  padding: 16px;
  border-radius: 12px;
  white-space: pre-wrap;
  font-size: 13px;
  line-height: 1.5;
  min-height: 160px;
}

.payload {
  background: #f7f8fb;
  padding: 16px;
  border-radius: 12px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
}

@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 36px;
  }

  .bar-row {
    grid-template-columns: 70px minmax(0, 1fr) 50px;
  }
}
</style>

<template>
  <section class="dashboard">
    <div class="dash-hero glass" style="position: relative;">
      <div>
        <div class="pill">Недельная сводка</div>
        <h1>Твоя энергия сегодня</h1>
        <p class="muted">Пики фокуса и риск выгорания на основе последнего анализа.</p>
        <div v-if="lastAnalyzeAt" class="muted">Последний анализ: {{ lastAnalyzeAt }}</div>
        <div class="hero-metrics">
          <div class="metric">
            <div class="label">Риск</div>
            <div class="value">{{ analyzeResult?.burnout_risk?.level || '—' }}</div>
            <span class="badge badge-purple">Стабильно</span>
          </div>
          <div class="metric">
            <div class="label">Лучшие дни</div>
            <div class="value">{{ bestDays }}</div>
            <span class="badge badge-blue">Пик фокуса</span>
          </div>
          <div class="metric">
            <div class="label">Сон</div>
            <div class="value">{{ avgSleep }}</div>
            <span class="badge badge-cyan">+0.4</span>
          </div>
        </div>
      </div>
      <div class="spark">
        <div class="spark-title">Сводка за неделю</div>
        <div class="summary-grid">
          <div class="summary-card" :style="summaryStyle(avgEnergy)">
            <div class="summary-label">Средняя энергия</div>
            <div class="summary-value">{{ formatValue(avgEnergy) }}</div>
          </div>
          <div class="summary-card" :style="summaryStyle(avgStress)">
            <div class="summary-label">Средний стресс</div>
            <div class="summary-value">{{ formatValue(avgStress) }}</div>
          </div>
          <div class="summary-card" :style="summaryStyle(avgFocus)">
            <div class="summary-label">Средняя концентрация</div>
            <div class="summary-value">{{ formatValue(avgFocus) }}</div>
          </div>
          <div class="summary-card" :style="summaryStyle(bestDaysScore)">
            <div class="summary-label">Лучшие дни</div>
            <div class="summary-value">{{ bestDays }}</div>
          </div>
        </div>
      </div>
      <LoaderOverlay v-if="loadingAnalyze" label="Считаем аналитику…" />
    </div>

    <div class="dash-grid">
      <div class="card glass">
        <div class="card-head">
          <h3>Энергия по дням недели</h3>
          <span class="pill">7 дней</span>
        </div>
        <div class="week-bars">
          <div
            class="row"
            v-for="(value, day) in energyByWeekday"
            :key="day"
          >
            <span>{{ day }}</span>
            <div class="track"><div class="fill" :style="{ width: toPercent(value, energyByWeekday) }"></div></div>
          </div>
        </div>
      </div>

      <div class="card glass">
        <div class="card-head">
          <h3>Риск выгорания</h3>
          <span class="pill">14 дней</span>
        </div>
        <div class="risk">
          <div class="risk-score">{{ burnoutScore }}</div>
          <p class="muted">{{ burnoutReason }}</p>
        </div>
      </div>

      <div class="card glass">
        <div class="card-head">
          <h3>Рекомендации</h3>
        </div>
        <ul class="tips">
          <li>Сложные задачи: {{ bestDays }}</li>
          <li>Восстановление: после 15:00</li>
          <li>Добавь 30 мин прогулки вечером</li>
        </ul>
      </div>

      <div class="card glass">
        <div class="card-head">
          <h3>LLM Insight</h3>
        </div>
        <pre class="insight">{{ analyzeResult?.llm_insight || '—' }}</pre>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import LoaderOverlay from '../components/LoaderOverlay.vue'
import { aiApi } from '../services/api'

const loadingAnalyze = ref(false)
const analyzeResult = ref(null)
const analyzeError = ref('')
const lastAnalyzeAt = ref('')

const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

const fetchAnalyze = async () => {
  loadingAnalyze.value = true
  analyzeError.value = ''
  try {
    analyzeResult.value = await aiApi.analyze({
      user_tz: userTz,
      period: 'week',
      week_starts: 'monday',
      constraints: { work_start_hour: 9, work_end_hour: 18 }
    })
  } catch (e) {
    analyzeError.value = e.message || 'Ошибка /ai/analyze'
  } finally {
    loadingAnalyze.value = false
  }
}

onMounted(() => {
  const cached = localStorage.getItem('nexus_last_analyze')
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      analyzeResult.value = parsed?.result || null
      if (parsed?.at) {
        lastAnalyzeAt.value = new Date(parsed.at).toLocaleString()
      }
    } catch {
      // ignore cache parse error
    }
  } else {
    fetchAnalyze()
  }
})

const energyByWeekday = computed(() => analyzeResult.value?.energy_by_weekday || {})

const bestDays = computed(() => {
  const map = energyByWeekday.value || {}
  const entries = Object.entries(map)
  if (!entries.length) return '—'
  entries.sort((a, b) => b[1] - a[1])
  return entries.slice(0, 2).map(([d]) => d).join(', ')
})

const bestDaysScore = computed(() => {
  const map = energyByWeekday.value || {}
  const entries = Object.entries(map)
  if (!entries.length) return null
  entries.sort((a, b) => b[1] - a[1])
  return entries[0]?.[1] ?? null
})

const avgEnergy = computed(() => {
  const values = Object.values(energyByWeekday.value || {})
  if (!values.length) return null
  const sum = values.reduce((a, b) => a + b, 0)
  return sum / values.length
})

const avgStress = computed(() => {
  const r = analyzeResult.value?.burnout_risk?.score
  if (r == null) return null
  return 100 - Number(r)
})

const avgFocus = computed(() => {
  const score = analyzeResult.value?.productivity_model?.score
  if (score == null) return null
  return score
})

const avgSleep = computed(() => {
  return '6.8 ч'
})

const burnoutScore = computed(() => {
  const s = analyzeResult.value?.burnout_risk?.score
  return s == null ? '—' : s.toFixed(2)
})

const burnoutReason = computed(() => {
  const r = analyzeResult.value?.burnout_risk?.reasons
  if (!r || !r.length) return '—'
  return r[0]
})

const toPercent = (value, map) => {
  const max = Math.max(...Object.values(map || { x: 1 })) || 1
  return `${(value / max) * 100}%`
}

const summaryStyle = (value) => {
  if (value == null) {
    return { background: 'rgba(255,255,255,0.04)', borderColor: 'var(--line)' }
  }
  const ratio = Math.min(Math.max(Number(value) / 100, 0), 1)
  const alpha = 0.18 + ratio * 0.5
  return {
    background: `linear-gradient(135deg, rgba(46,226,230,${alpha}), rgba(124,58,237,${alpha}))`,
    borderColor: `rgba(46,226,230,${0.2 + ratio * 0.5})`
  }
}

const formatValue = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return Number(value).toFixed(1)
}
</script>

<style scoped>
.insight {
  white-space: pre-wrap;
  font-size: 13px;
  line-height: 1.5;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.summary-card {
  border-radius: 14px;
  border: 1px solid var(--line);
  padding: 16px;
  display: grid;
  gap: 6px;
  min-height: 96px;
}

.summary-label {
  font-size: 12px;
  color: var(--muted);
}

.summary-value {
  font-weight: 600;
  font-size: 18px;
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>

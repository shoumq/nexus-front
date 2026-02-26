<template>
  <section class="dashboard">
    <div class="dash-hero glass" style="position: relative;">
      <div>
        <div class="pill">Сводка</div>
        <h1>Твоя энергия сегодня</h1>
        <p class="muted">Пики фокуса и риск выгорания на основе последнего анализа.</p>
        <div v-if="lastAnalyzeAt" class="muted">Последний анализ: {{ lastAnalyzeAt }}</div>
        <div class="period-tabs">
          <button
            v-for="p in periods"
            :key="p.value"
            type="button"
            class="pill period-pill"
            :class="{ active: selectedPeriod === p.value }"
            @click="selectedPeriod = p.value"
          >
            {{ p.label }}
          </button>
        </div>
        <div class="hero-metrics">
          <div class="metric">
            <div class="label">Риск</div>
            <div class="value">{{ riskLevelLabel }}</div>
            <span class="badge badge-purple">{{ riskBadge }}</span>
          </div>
          <div class="metric">
            <div class="label">Лучшие дни</div>
            <div class="value">{{ bestDays }}</div>
            <span class="badge badge-blue">{{ bestDaysBadge }}</span>
          </div>
          <div class="metric">
            <div class="label">Сон</div>
            <div class="value">{{ avgSleep }}</div>
            <span v-if="sleepDeltaLabel" class="badge badge-cyan">{{ sleepDeltaLabel }}</span>
          </div>
        </div>
      </div>
      <div class="spark">
        <div class="spark-title">Сводка за период</div>
        <div class="summary-grid">
          <div class="summary-card" :style="summaryStyle(avgEnergy)">
            <div class="summary-label">Средняя энергия</div>
            <div class="summary-value">{{ formatValue(avgEnergy) }}</div>
          </div>
          <div class="summary-card" :style="summaryStyle(avgStress)">
            <div class="summary-label">Риск выгорания</div>
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
        <span class="pill">{{ periodLabel }}</span>
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
const analyses = ref({})
const analyzeError = ref('')
const lastAnalyzeAt = ref('')
const selectedPeriod = ref('week')

const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

const periods = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'all', label: 'Все время' }
]

onMounted(() => {
  loadFromCache()
  loadLastAnalyses()
  refreshAllAnalyses()
  window.addEventListener('analysis-updated', loadFromCache)
})

const analyzeResult = computed(() => analyses.value?.[selectedPeriod.value] || null)

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
  const n = Number(r)
  return n <= 1 ? n * 100 : n
})

const avgFocus = computed(() => {
  const score = analyzeResult.value?.productivity_model?.score
  if (score == null) return null
  return score
})

const periodLabel = computed(() => {
  const p = periods.find((x) => x.value === selectedPeriod.value)
  return p ? p.label : '—'
})

const avgSleep = computed(() => {
  const raw =
    analyzeResult.value?.debug?.avg_sleep_hours ??
    analyzeResult.value?.debug?.avg_sleep
  if (raw == null) return '—'
  const n = Number(raw)
  if (Number.isNaN(n)) return '—'
  return `${n.toFixed(1)} ч`
})

const sleepDeltaLabel = computed(() => {
  const raw =
    analyzeResult.value?.debug?.avg_sleep_delta ??
    analyzeResult.value?.debug?.sleep_delta
  if (raw == null) return ''
  const n = Number(raw)
  if (Number.isNaN(n) || n === 0) return ''
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(1)}`
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

const riskLevelLabel = computed(() => {
  const raw = (analyzeResult.value?.burnout_risk?.level || '').toString().toLowerCase()
  if (!raw) return '—'
  if (raw === 'low' || raw === 'низкий') return 'низкий'
  if (raw === 'medium' || raw === 'средний') return 'средний'
  if (raw === 'high' || raw === 'высокий') return 'высокий'
  if (raw === 'unknown' || raw === 'недостаточно данных') return 'недостаточно данных'
  return raw
})

const riskBadge = computed(() => {
  const lvl = riskLevelLabel.value
  if (lvl === 'низкий') return 'Стабильно'
  if (lvl === 'средний') return 'Под контролем'
  if (lvl === 'высокий') return 'Высокий риск'
  if (lvl === 'недостаточно данных') return 'Недостаточно данных'
  return '—'
})

const bestDaysBadge = computed(() => {
  return bestDays.value === '—' ? '—' : 'Пик фокуса'
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

const loadFromCache = () => {
  const cached = localStorage.getItem('nexus_last_analyses')
  if (!cached) return
  try {
    const parsed = JSON.parse(cached)
    if (parsed?.entries) {
      const map = {}
      parsed.entries.forEach((e) => {
        if (e?.period && e?.response) {
          map[e.period] = e.response
        }
      })
      analyses.value = map
      lastAnalyzeAt.value = parsed?.entries?.[0]?.updated_at
        ? new Date(parsed.entries[0].updated_at).toLocaleString()
        : lastAnalyzeAt.value
    }
  } catch {
    // ignore
  }
}

const loadLastAnalyses = async () => {
  try {
    const data = await aiApi.lastAnalyze()
    localStorage.setItem('nexus_last_analyses', JSON.stringify(data))
    loadFromCache()
  } catch (e) {
    analyzeError.value = e.message || 'Ошибка /ai/last-analyze'
  }
}

const refreshAllAnalyses = async () => {
  loadingAnalyze.value = true
  analyzeError.value = ''
  try {
    const results = await Promise.all(
      periods.map((p) =>
        aiApi.analyze({
          user_tz: userTz,
          period: p.value,
          week_starts: 'monday',
          constraints: { work_start_hour: 9, work_end_hour: 18 }
        })
      )
    )
    const map = {}
    periods.forEach((p, idx) => {
      map[p.value] = results[idx]
    })
    analyses.value = map
    lastAnalyzeAt.value = new Date().toLocaleString()
    localStorage.setItem(
      'nexus_last_analyses',
      JSON.stringify({
        entries: periods.map((p) => ({
          period: p.value,
          updated_at: new Date().toISOString(),
          response: map[p.value]
        }))
      })
    )
  } catch (e) {
    analyzeError.value = e.message || 'Ошибка /ai/analyze'
  } finally {
    loadingAnalyze.value = false
  }
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

.period-tabs {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.period-pill {
  color: rgba(244, 246, 251, 0.98) !important;
  border-color: rgba(244, 246, 251, 0.42) !important;
  background: rgba(244, 246, 251, 0.14) !important;
  box-shadow: 0 0 0 1px rgba(244, 246, 251, 0.14) inset !important;
  opacity: 0.7;
}

.period-pill.active {
  color: var(--fg) !important;
  border-color: rgba(46, 226, 230, 0.9) !important;
  background: rgba(46, 226, 230, 0.22) !important;
  box-shadow:
    0 0 0 1px rgba(46, 226, 230, 0.35) inset,
    0 6px 18px rgba(46, 226, 230, 0.18);
  opacity: 1;
  font-weight: 600;
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>

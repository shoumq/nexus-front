<template>
  <section class="dashboard">
    <div class="dash-hero glass" style="position: relative;">
      <div>
        <div class="pill">Недельная сводка</div>
        <h1>Твоя энергия сегодня</h1>
        <p class="muted">Пики фокуса и риск выгорания на основе последних данных.</p>
        <div class="hero-metrics">
          <div class="metric">
            <div class="label">Риск</div>
            <div class="value">{{ analyzeResult?.burnout_risk?.level || '—' }}</div>
            <span class="badge badge-purple">Стабильно</span>
          </div>
          <div class="metric">
            <div class="label">Лучшие часы</div>
            <div class="value">10:00–12:00</div>
            <span class="badge badge-blue">Пик фокуса</span>
          </div>
          <div class="metric">
            <div class="label">Сон</div>
            <div class="value">6.8 ч</div>
            <span class="badge badge-cyan">+0.4</span>
          </div>
        </div>
      </div>
      <div class="spark">
        <div class="spark-title">Энергия по часам</div>
        <div class="spark-grid">
          <div class="bar" style="height:36px"></div>
          <div class="bar" style="height:44px"></div>
          <div class="bar" style="height:60px"></div>
          <div class="bar" style="height:72px"></div>
          <div class="bar" style="height:64px"></div>
          <div class="bar" style="height:50px"></div>
          <div class="bar" style="height:40px"></div>
          <div class="bar" style="height:32px"></div>
        </div>
      </div>
      <LoaderOverlay v-if="loadingAnalyze" label="Считаем аналитику…" />
    </div>

    <div class="dash-grid">
      <div class="card glass" style="position: relative;">
        <div class="card-head">
          <h3>Добавить точки</h3>
          <span class="pill">/ai/track</span>
        </div>
        <form class="form" @submit.prevent="submitTrack">
          <label>
            Таймзона
            <input v-model.trim="track.user_tz" placeholder="Europe/Moscow" />
          </label>
          <label>
            Точки (JSON массив)
            <textarea v-model="track.points" rows="6"></textarea>
          </label>
          <button class="primary" :disabled="loadingTrack">Отправить трек</button>
        </form>
        <div v-if="trackResult" class="muted" style="margin-top:10px;">Сохранено: {{ trackResult.stored }}</div>
        <div v-if="trackError" class="error">{{ trackError }}</div>
        <LoaderOverlay v-if="loadingTrack" label="Сохраняем…" />
      </div>

      <div class="card glass" style="position: relative;">
        <div class="card-head">
          <h3>Анализ</h3>
          <span class="pill">/ai/analyze</span>
        </div>
        <form class="form" @submit.prevent="submitAnalyze">
          <label>
            Таймзона
            <input v-model.trim="analyze.user_tz" placeholder="Europe/Moscow" />
          </label>
          <label>
            Период
            <select v-model="analyze.period">
              <option value="day">День</option>
              <option value="week">Неделя</option>
              <option value="month">Месяц</option>
              <option value="all">Все время</option>
            </select>
          </label>
          <label>
            Week starts
            <input v-model.trim="analyze.week_starts" placeholder="monday" />
          </label>
          <label>
            Constraints (JSON)
            <input v-model="analyze.constraints" placeholder='{"work_start_hour":9,"work_end_hour":18}' />
          </label>
          <button class="primary" :disabled="loadingAnalyze">Запросить анализ</button>
        </form>
        <div v-if="analyzeError" class="error">{{ analyzeError }}</div>
      </div>

      <div class="card glass" v-if="analyzeResult">
        <div class="card-head">
          <h3>LLM Insight</h3>
        </div>
        <pre class="insight">{{ analyzeResult.llm_insight }}</pre>
      </div>

      <div class="card glass" v-if="analyzeResult">
        <div class="card-head">
          <h3>Энергия по дням</h3>
        </div>
        <div class="week-bars">
          <div
            class="row"
            v-for="(value, day) in analyzeResult.energy_by_weekday"
            :key="day"
          >
            <span>{{ day }}</span>
            <div class="track"><div class="fill" :style="{ width: toPercent(value, analyzeResult.energy_by_weekday) }"></div></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import LoaderOverlay from '../components/LoaderOverlay.vue'
import { aiApi } from '../services/api'

const track = ref({
  user_tz: 'Europe/Moscow',
  points: JSON.stringify([
    { ts: new Date().toISOString(), sleep_hours: 7.2, mood: 6.8, activity: 5.4, productive: 6.1 }
  ], null, 2)
})

const analyze = ref({
  user_tz: 'Europe/Moscow',
  period: 'week',
  week_starts: 'monday',
  constraints: '{"work_start_hour":9,"work_end_hour":18}'
})

const loadingTrack = ref(false)
const loadingAnalyze = ref(false)
const trackResult = ref(null)
const analyzeResult = ref(null)
const trackError = ref('')
const analyzeError = ref('')

const submitTrack = async () => {
  loadingTrack.value = true
  trackError.value = ''
  try {
    const points = JSON.parse(track.value.points || '[]')
    trackResult.value = await aiApi.track({ user_tz: track.value.user_tz, points })
  } catch (e) {
    trackError.value = e.message || 'Ошибка /ai/track'
  } finally {
    loadingTrack.value = false
  }
}

const submitAnalyze = async () => {
  loadingAnalyze.value = true
  analyzeError.value = ''
  try {
    const constraints = JSON.parse(analyze.value.constraints || '{}')
    analyzeResult.value = await aiApi.analyze({
      user_tz: analyze.value.user_tz,
      period: analyze.value.period,
      week_starts: analyze.value.week_starts,
      constraints
    })
  } catch (e) {
    analyzeError.value = e.message || 'Ошибка /ai/analyze'
  } finally {
    loadingAnalyze.value = false
  }
}

const toPercent = (value, map) => {
  const max = Math.max(...Object.values(map || { x: 1 })) || 1
  return `${(value / max) * 100}%`
}
</script>

<style scoped>
select, textarea {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--fg);
}

textarea {
  resize: vertical;
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
</style>

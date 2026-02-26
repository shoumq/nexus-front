<template>
  <section class="panel">
    <div class="panel-head">
      <div>
        <h1>Добавить трекинг</h1>
        <p class="sub">1 запись в день. Два быстрых шага.</p>
      </div>
      <div ></div>
    </div>

    <div class="stepper">
      <button class="step" :class="{ active: step === 1 }" type="button" @click="step = 1">
        Шаг 1 · База
      </button>
      <button class="step" :class="{ active: step === 2 }" type="button" @click="step = 2">
        Шаг 2 · Контекст
      </button>
      <div class="step-line">
        <div class="step-fill" :style="{ width: step === 1 ? '50%' : '100%' }"></div>
      </div>
    </div>

    <form class="form" @submit.prevent="submit">
      <div v-if="step === 1" class="card glass form-block">
        <div class="block-head">
          <div>
            <div class="block-title">Базовые показатели</div>
            <div class="block-sub">Основа для энергии, продуктивности и риска.</div>
          </div>
          <span class="pill">шаг 1</span>
        </div>
        <div class="grid-2">
          <label :class="{ invalid: fieldErrors.sleep_hours }">
            Сон (ч)
            <input v-model.number="point.sleep_hours" type="number" step="0.1" />
            <small class="hint">Сколько часов сна было за ночь.</small>
            <small v-if="fieldErrors.sleep_hours" class="field-error">Обязательное поле (0–14)</small>
          </label>
          <label :class="{ invalid: fieldErrors.sleep_quality }">
            Качество сна (1–10)
            <input v-model.number="point.sleep_quality" type="number" step="0.1" min="1" max="10" />
            <small class="hint">1 — плохо, 10 — отлично.</small>
            <small v-if="fieldErrors.sleep_quality" class="field-error">Обязательное поле (1–10)</small>
          </label>
          <label :class="{ invalid: fieldErrors.mood }">
            Настроение
            <input v-model.number="point.mood" type="number" step="0.1" />
            <small class="hint">Оцени общее настроение по шкале 1–10.</small>
            <small v-if="fieldErrors.mood" class="field-error">Обязательное поле (1–10)</small>
          </label>
          <label :class="{ invalid: fieldErrors.activity }">
            Активность
            <input v-model.number="point.activity" type="number" step="0.1" />
            <small class="hint">Насколько был активен день, 1–10.</small>
            <small v-if="fieldErrors.activity" class="field-error">Обязательное поле (1–10)</small>
          </label>
          <label class="full">
            Продуктивность
            <input v-model.number="point.productive" type="number" step="0.1" />
            <small class="hint">Оцени продуктивность дня, 1–10.</small>
            <small v-if="fieldErrors.productive" class="field-error">Обязательное поле (1–10)</small>
          </label>
        </div>
      </div>

      <div v-else class="card glass form-block">
        <div class="block-head">
          <div>
            <div class="block-title">Контекст и самочувствие</div>
            <div class="block-sub">Что влияло на день и почему.</div>
          </div>
          <span class="pill">шаг 2</span>
        </div>
        <div class="grid-2">
          <label :class="{ invalid: fieldErrors.energy }">
            Энергия (1–10)
            <input v-model.number="point.energy" type="number" step="0.1" min="1" max="10" />
            <small class="hint">Текущий уровень энергии.</small>
            <small v-if="fieldErrors.energy" class="field-error">Обязательное поле (1–10)</small>
          </label>
          <label :class="{ invalid: fieldErrors.stress }">
            Стресс (1–10)
            <input v-model.number="point.stress" type="number" step="0.1" min="1" max="10" />
            <small class="hint">1 — спокойно, 10 — очень напряженно.</small>
            <small v-if="fieldErrors.stress" class="field-error">Обязательное поле (1–10)</small>
          </label>
          <label :class="{ invalid: fieldErrors.concentration }">
            Концентрация (1–10)
            <input v-model.number="point.concentration" type="number" step="0.1" min="1" max="10" />
            <small class="hint">Насколько легко было удерживать фокус.</small>
            <small v-if="fieldErrors.concentration" class="field-error">Обязательное поле (1–10)</small>
          </label>
          <div class="checks">
            <label class="check">
              <input v-model="point.caffeine" type="checkbox" />
              Кофеин
            </label>
            <label class="check">
              <input v-model="point.alcohol" type="checkbox" />
              Алкоголь
            </label>
            <label class="check">
              <input v-model="point.workout" type="checkbox" />
              Тренировка
            </label>
            <small class="hint">Отметь, если было сегодня.</small>
          </div>
          <label class="full">
            Текст для LLM (что ел/гулял/события)
            <textarea v-model.trim="point.llm_text" rows="4" placeholder="Например: 30 мин прогулки, обед — паста, вечером встречи"></textarea>
            <small class="hint">Короткий контекст, который повлиял на самочувствие.</small>
          </label>
        </div>
      </div>

      <div class="actions">
        <button v-if="step === 2" class="ghost" type="button" @click="step = 1">Назад</button>
        <button
          v-else
          class="ghost"
          type="button"
          :disabled="!step1Valid"
          @click="step = 2"
        >
          Дальше
        </button>
        <button class="primary" :disabled="loading || (step === 1 && !step1Valid)">
          {{
            step === 2
              ? (editingToday ? 'Сохранить изменения' : 'Сохранить')
              : 'Перейти к шагу 2'
          }}
        </button>
      </div>

      <div v-if="notice" class="muted">{{ notice }}</div>
      <div v-if="result" class="muted">
        {{ lastSaveWasEdit ? 'Обновлено' : 'Сохранено' }}: {{ result.stored }}
      </div>
      <div v-if="stepError" class="error">{{ stepError }}</div>
      <div v-if="error" class="error">{{ error }}</div>
    </form>

    <LoaderOverlay v-if="loading" label="Сохраняем…" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { aiApi } from '../services/api'
import LoaderOverlay from '../components/LoaderOverlay.vue'

const userTz = ref('')
const step = ref(1)
const editingToday = ref(false)
const lastSaveWasEdit = ref(false)
const point = ref({
  ts: '',
  sleep_hours: 7.2,
  sleep_quality: 7.0,
  mood: 6.8,
  activity: 5.4,
  productive: 6.1,
  energy: 6.9,
  stress: 4.2,
  concentration: 6.5,
  caffeine: false,
  alcohol: false,
  workout: false,
  llm_text: ''
})

const loading = ref(false)
const result = ref(null)
const error = ref('')
const stepError = ref('')
const notice = ref('')

const fieldErrors = ref({
  sleep_hours: false,
  sleep_quality: false,
  mood: false,
  activity: false,
  productive: false,
  energy: false,
  stress: false,
  concentration: false
})

const isNum = (v) => Number.isFinite(Number(v))
const inRange = (v, min, max) => isNum(v) && Number(v) >= min && Number(v) <= max

const validateStep1 = () => {
  fieldErrors.value.sleep_hours = !inRange(point.value.sleep_hours, 0, 14)
  fieldErrors.value.sleep_quality = !inRange(point.value.sleep_quality, 1, 10)
  fieldErrors.value.mood = !inRange(point.value.mood, 1, 10)
  fieldErrors.value.activity = !inRange(point.value.activity, 1, 10)
  fieldErrors.value.productive = !inRange(point.value.productive, 1, 10)
  return !Object.values(fieldErrors.value).some(Boolean)
}

const validateStep2 = () => {
  fieldErrors.value.energy = !inRange(point.value.energy, 1, 10)
  fieldErrors.value.stress = !inRange(point.value.stress, 1, 10)
  fieldErrors.value.concentration = !inRange(point.value.concentration, 1, 10)
  return !Object.values(fieldErrors.value).some(Boolean)
}

const step1Valid = computed(() => validateStep1())

const submit = async () => {
  stepError.value = ''
  if (step.value === 1) {
    if (!validateStep1()) {
      stepError.value = 'Заполни базовые показатели, чтобы перейти к шагу 2.'
      return
    }
    step.value = 2
    return
  }
  if (!validateStep2()) {
    stepError.value = 'Заполни обязательные поля шага 2.'
    return
  }
  loading.value = true
  lastSaveWasEdit.value = editingToday.value
  error.value = ''
  result.value = null
  try {
    const payload = {
      user_tz: userTz.value,
      points: [
        {
          ts: point.value.ts,
          sleep_hours: Number(point.value.sleep_hours),
          sleep_quality: Number(point.value.sleep_quality),
          mood: Number(point.value.mood),
          activity: Number(point.value.activity),
          productive: Number(point.value.productive),
          stress: Number(point.value.stress),
          energy: Number(point.value.energy),
          concentration: Number(point.value.concentration),
          caffeine: Boolean(point.value.caffeine),
          alcohol: Boolean(point.value.alcohol),
          workout: Boolean(point.value.workout),
          llm_text: point.value.llm_text || ''
        }
      ]
    }
    result.value = await aiApi.track(payload)
    editingToday.value = true
    const tz = userTz.value || 'UTC'
    const day = formatDateInTZ(point.value.ts, tz)
    localStorage.setItem('nexus_last_track_date', day)
    localStorage.setItem('nexus_last_track_tz', tz)
    window.dispatchEvent(new Event('track-changed'))
    const last = await aiApi.lastAnalyze()
    localStorage.setItem('nexus_last_analyses', JSON.stringify(last))
    window.dispatchEvent(new Event('analysis-updated'))
  } catch (e) {
    error.value = e.message || 'Ошибка /ai/track'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  userTz.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  if (!point.value.ts) {
    point.value.ts = new Date().toISOString()
  }
  loadToday()
})

const formatDateInTZ = (iso, tz) => {
  try {
    const dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    return dtf.format(new Date(iso))
  } catch {
    return new Date(iso).toISOString().slice(0, 10)
  }
}

const loadToday = async () => {
  notice.value = ''
  try {
    const resp = await aiApi.today({ user_tz: userTz.value })
    if (resp?.exists && resp.point) {
      point.value = {
        ts: resp.point.ts,
        sleep_hours: resp.point.sleep_hours,
        sleep_quality: resp.point.sleep_quality,
        mood: resp.point.mood,
        activity: resp.point.activity,
        productive: resp.point.productive,
        energy: resp.point.energy,
        stress: resp.point.stress,
        concentration: resp.point.concentration,
        caffeine: resp.point.caffeine,
        alcohol: resp.point.alcohol,
        workout: resp.point.workout,
        llm_text: resp.point.llm_text || ''
      }
      const tz = userTz.value || 'UTC'
      const day = formatDateInTZ(resp.point.ts, tz)
      localStorage.setItem('nexus_last_track_date', day)
      localStorage.setItem('nexus_last_track_tz', tz)
      window.dispatchEvent(new Event('track-changed'))
      notice.value = 'Сегодняшняя запись загружена. Можно редактировать.'
      editingToday.value = true
      step.value = 2
    }
  } catch {
    // ignore
  }
}
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

.sub {
  color: var(--muted);
  margin-top: 6px;
  font-size: 13px;
}

.stepper {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 6px 0 18px;
}

.step {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--line);
  color: var(--fg);
  padding: 10px 12px;
  border-radius: 12px;
  text-align: left;
  font-weight: 600;
}

.step.active {
  border-color: rgba(46, 226, 230, 0.45);
  box-shadow: 0 10px 24px rgba(46, 226, 230, 0.12);
}

.step-line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -10px;
  height: 3px;
  background: rgba(255,255,255,0.08);
  border-radius: 999px;
  overflow: hidden;
}

.step-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-3), var(--accent-2));
  transition: width 0.2s ease;
}

.form-block {
  margin-bottom: 16px;
}

.block-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.block-title {
  font-weight: 600;
}

.block-sub {
  color: var(--muted);
  font-size: 12px;
  margin-top: 4px;
}

.hint {
  display: block;
  margin-top: 6px;
  color: var(--muted);
  font-size: 12px;
  opacity: 0.9;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.checks {
  display: grid;
  gap: 8px;
  align-content: start;
}

.check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--muted);
}

.check input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.05);
  display: inline-block;
  position: relative;
  cursor: pointer;
  margin: 0;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.check input[type="checkbox"]::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 3px;
  transform: scale(0);
  transition: transform 0.18s ease;
  background: linear-gradient(135deg, var(--accent-3), var(--accent-2));
  box-shadow: 0 0 10px rgba(46, 226, 230, 0.45);
}

.check input[type="checkbox"]:checked {
  border-color: rgba(46, 226, 230, 0.6);
  background: rgba(46, 226, 230, 0.12);
  box-shadow: 0 0 0 3px rgba(46, 226, 230, 0.18);
}

.check input[type="checkbox"]:checked::after {
  transform: scale(1);
}

.full {
  grid-column: 1 / -1;
}

.full textarea {
  min-height: 120px;
  resize: vertical;
  background: rgba(10, 14, 22, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 10px 22px rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  padding: 12px 14px;
  color: var(--fg);
  font-family: inherit;
}

.full textarea:focus {
  outline: none;
  border-color: rgba(46, 226, 230, 0.5);
  box-shadow: 0 0 0 3px rgba(46, 226, 230, 0.16);
}

.form-block input,
.form-block textarea {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.invalid input,
.invalid textarea {
  border-color: rgba(255, 122, 122, 0.8);
  box-shadow: 0 0 0 3px rgba(255, 122, 122, 0.12);
}

.field-error {
  display: block;
  margin-top: 6px;
  color: #ff9b9b;
  font-size: 12px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.error {
  margin-top: 10px;
  color: #ff7a7a;
  font-size: 13px;
}

@media (max-width: 800px) {
  .grid-2 { grid-template-columns: 1fr; }
  .actions { flex-direction: column; align-items: stretch; }
  .panel-head { flex-direction: column; align-items: flex-start; gap: 8px; }
}
</style>

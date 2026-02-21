<template>
  <section class="auth">
    <div class="auth-card glass" style="position: relative;">
      <h1>Регистрация</h1>
      <p class="muted">Создай аккаунт и начни трекинг.</p>
      <form class="form" @submit.prevent="submit">
        <label>
          Имя
          <input v-model.trim="name" type="text" placeholder="Имя" />
        </label>
        <label>
          Email
          <input v-model.trim="email" type="email" placeholder="name@domain.com" />
        </label>
        <label>
          Пароль
          <input v-model.trim="password" type="password" placeholder="••••••••" />
        </label>
        <button class="primary" :disabled="loading">Зарегистрироваться</button>
      </form>
      <div class="auth-footer">
        Уже есть аккаунт? <RouterLink to="/login">Войти</RouterLink>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <LoaderOverlay v-if="loading" label="Создаем аккаунт…" />
    </div>
    <div class="auth-side glass">
      <h3>Почему это удобно</h3>
      <ul>
        <li>2–3 минуты в день — и полная картина</li>
        <li>Фокус‑окна и восстановление</li>
        <li>Тренды, а не ощущения</li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { authApi, tokenStore } from '../services/api'
import LoaderOverlay from '../components/LoaderOverlay.vue'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const submit = async () => {
  loading.value = true
  error.value = ''
  try {
    const resp = await authApi.register({ name: name.value, email: email.value, password: password.value })
    const token = resp.access_token || resp.accessToken
    if (!token) throw new Error('Токен не получен')
    tokenStore.set(token)
    await router.push('/')
  } catch (e) {
    error.value = e.message || 'Ошибка регистрации'
  } finally {
    loading.value = false
  }
}
</script>

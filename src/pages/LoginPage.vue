<template>
  <section class="auth">
    <div class="auth-card glass" style="position: relative;">
      <h1>Вход</h1>
      <p class="muted">Продолжай с места, где остановился.</p>
      <form class="form" @submit.prevent="submit">
        <label>
          Email
          <input v-model.trim="email" type="email" placeholder="name@domain.com" />
        </label>
        <label>
          Пароль
          <input v-model.trim="password" type="password" placeholder="••••••••" />
        </label>
        <button class="primary" :disabled="loading">Войти</button>
      </form>
      <div class="auth-footer">
        Нет аккаунта? <RouterLink to="/register">Создать</RouterLink>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <LoaderOverlay v-if="loading" label="Авторизация…" />
    </div>
    <div class="auth-side glass">
      <h3>Что внутри</h3>
      <ul>
        <li>Дэшборд энергии по часам и дням</li>
        <li>Риск выгорания и рекомендации</li>
        <li>Персональные пики продуктивности</li>
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
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const submit = async () => {
  loading.value = true
  error.value = ''
  try {
    const resp = await authApi.login({ email: email.value, password: password.value })
    const token = resp.access_token || resp.accessToken
    if (!token) throw new Error('Токен не получен')
    tokenStore.set(token)
    await router.push('/')
  } catch (e) {
    error.value = e.message || 'Ошибка входа'
  } finally {
    loading.value = false
  }
}
</script>

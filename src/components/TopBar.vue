<template>
  <header class="topbar">
    <div class="brand">
      <div class="logo">NEXUS</div>
      <div class="sub">Energy Intelligence</div>
    </div>
    <nav class="nav">
      <RouterLink class="ghost nav-link" to="/">
        <span class="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M4 12h7V4H4v8zm0 8h7v-6H4v6zm9 0h7V10h-7v10zm0-16v4h7V4h-7z"/></svg>
        </span>
        <span class="nav-text">Дэшборд</span>
      </RouterLink>
      <RouterLink class="ghost nav-link" to="/add">
        <span class="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
        </span>
        <span class="nav-text">Добавить</span>
      </RouterLink>
      <RouterLink class="ghost nav-link" to="/analyze">
        <span class="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M4 19h16M7 17V9m5 8V5m5 12v-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
        </span>
        <span class="nav-text">Анализ</span>
      </RouterLink>
    </nav>
    <div class="top-actions">
      <template v-if="!isAuthed">
        <RouterLink class="ghost" to="/login">Вход</RouterLink>
        <RouterLink class="ghost" to="/register">Регистрация</RouterLink>
      </template>
      <template v-else>
        <button class="ghost" type="button" @click="logout">Выйти</button>
      </template>
      <button class="toggle" @click="$emit('toggle-theme')">
        <span v-if="theme === 'dark'">Светлая тема</span>
        <span v-else>Темная тема</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { defineEmits, defineProps, onBeforeUnmount, onMounted, ref } from 'vue'
import { tokenStore } from '../services/api'

defineProps({
  theme: { type: String, required: true }
})

defineEmits(['toggle-theme'])

const isAuthed = ref(!!tokenStore.get())
const router = useRouter()

const syncAuth = () => {
  isAuthed.value = !!tokenStore.get()
}

onMounted(() => {
  syncAuth()
  window.addEventListener('auth-changed', syncAuth)
})

onBeforeUnmount(() => {
  window.removeEventListener('auth-changed', syncAuth)
})

const logout = () => {
  tokenStore.clear()
  router.push({ name: 'login' })
}
</script>

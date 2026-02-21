<template>
  <header class="topbar">
    <div class="brand">
      <div class="logo">NEXUS</div>
      <div class="sub">Energy Intelligence</div>
    </div>
    <div class="top-actions">
      <RouterLink class="ghost" to="/login">Вход</RouterLink>
      <RouterLink class="ghost" to="/register">Регистрация</RouterLink>
      <button class="toggle" @click="$emit('toggle-theme')">
        <span v-if="theme === 'dark'">Светлая тема</span>
        <span v-else>Темная тема</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { defineEmits, defineProps } from 'vue'

defineProps({
  theme: { type: String, required: true }
})

defineEmits(['toggle-theme'])
</script>

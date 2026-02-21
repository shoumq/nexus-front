<template>
  <div class="loader-overlay">
    <div class="spinner"></div>
    <div class="label">{{ label }}</div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  label: { type: String, default: 'Загрузка…' }
})
</script>

<style scoped>
.loader-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0,0,0,0.25);
  border-radius: 16px;
  backdrop-filter: blur(6px);
  color: #fff;
  gap: 10px;
  font-size: 13px;
}

.spinner {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.2);
  border-top-color: rgba(255,255,255,0.9);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

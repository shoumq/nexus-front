<template>
  <div v-if="visible" class="a2hs glass">
    <div class="a2hs-text">
      <strong>Добавь Nexus на экран</strong>
      <span v-if="isIOS">Нажми «Поделиться» → «На экран Домой»</span>
      <span v-else>Нажми меню браузера → «Добавить на главный экран»</span>
    </div>
    <div class="a2hs-actions">
      <button class="ghost" @click="dismiss">Не сейчас</button>
      <button class="primary" @click="dismiss">Понятно</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
const visible = ref(false)

const dismiss = () => {
  visible.value = false
  localStorage.setItem('nexus_a2hs_dismissed', '1')
}

onMounted(() => {
  const dismissed = localStorage.getItem('nexus_a2hs_dismissed') === '1'
  if (!dismissed) visible.value = true
})
</script>

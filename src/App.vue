<template>
  <div class="app" :data-theme="theme">
    <div class="shell">
      <TopBar :theme="theme" @toggle-theme="toggleTheme" />
      <A2HSBanner />
      <main class="container">
        <RouterView />
      </main>
      <AppFooter />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import TopBar from './components/TopBar.vue'
import A2HSBanner from './components/A2HSBanner.vue'
import AppFooter from './components/AppFooter.vue'

const theme = ref('dark')

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: "Space Grotesk", system-ui, -apple-system, sans-serif;
}

a { color: inherit; text-decoration: none; }

.app {
  min-height: 100vh;
  transition: background 0.3s ease, color 0.3s ease;
}

.app[data-theme='dark'] {
  --bg: #0f1220;
  --bg-2: #171b2a;
  --fg: #f6f8fc;
  --muted: #c1c7d6;
  --accent: #2f80ff;
  --accent-2: #7c3aed;
  --accent-3: #2de2e6;
  --accent-4: #ff4fd8;
  --glass: rgba(255,255,255,0.06);
  --line: rgba(255,255,255,0.1);
}

.app[data-theme='light'] {
  --bg: #f4f6ff;
  --bg-2: #ffffff;
  --fg: #10141f;
  --muted: #5d6475;
  --accent: #2f80ff;
  --accent-2: #6f4cff;
  --accent-3: #18c8cc;
  --accent-4: #ff4fd8;
  --glass: rgba(16,20,31,0.06);
  --line: rgba(16,20,31,0.12);
}

.shell {
  min-height: 100vh;
  background:
    radial-gradient(1200px 700px at 8% 6%, rgba(47,128,255,0.16), transparent 60%),
    radial-gradient(1200px 700px at 92% 12%, rgba(124,58,237,0.14), transparent 60%),
    radial-gradient(900px 900px at 50% 90%, rgba(255,79,216,0.1), transparent 60%),
    var(--bg);
  color: var(--fg);
  display: grid;
  grid-template-rows: auto auto 1fr auto;
}

.glass {
  background: var(--glass);
  border: 1px solid var(--line);
  backdrop-filter: blur(14px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  position: sticky;
  top: 0;
  background: var(--bg-2);
  border-bottom: 1px solid var(--line);
  z-index: 5;
}

.brand .logo {
  font-weight: 700;
  letter-spacing: 0.5px;
}

.brand .sub {
  font-size: 12px;
  color: var(--muted);
}

.top-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.toggle {
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border: none;
  color: #fff;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 24px 40px;
  width: 100%;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px 24px;
  border-top: 1px solid var(--line);
  font-size: 12px;
}

.a2hs {
  max-width: 1100px;
  margin: 12px auto 0;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.a2hs-text {
  display: grid;
  gap: 2px;
  font-size: 13px;
}

.a2hs-actions {
  display: flex;
  gap: 8px;
}

.muted { color: var(--muted); }

.pill {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid var(--line);
  color: var(--muted);
}

.primary {
  padding: 12px 16px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, var(--accent), var(--accent-2), var(--accent-4));
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  background-size: 200% 200%;
  animation: gradientFlow 8s ease-in-out infinite;
}

.ghost {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--fg);
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
}

.btn {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--fg);
  padding: 10px 16px;
  border-radius: 10px;
}

.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
  align-items: start;
}

.hero h1 {
  margin: 12px 0;
  font-size: clamp(30px, 4vw, 52px);
}

.hero p {
  margin: 0 0 18px;
  color: var(--muted);
}

.hero-card {
  padding: 20px;
  border-radius: 16px;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.metric {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--glass);
}

.metric .label {
  font-size: 12px;
  color: var(--muted);
}

.metric .value {
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.auth {
  display: grid;
  grid-template-columns: 1fr 0.8fr;
  gap: 24px;
}

.auth-card,
.auth-side {
  padding: 24px;
  border-radius: 16px;
}

.form {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.form label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: var(--muted);
}

.form input {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--fg);
}

.auth-footer {
  margin-top: 16px;
  color: var(--muted);
  font-size: 13px;
}

.auth-footer a { color: var(--accent-3); }

.dashboard {
  display: grid;
  gap: 24px;
}

.dash-hero {
  padding: 24px;
  border-radius: 18px;
  display: grid;
  grid-template-columns: 1fr 0.8fr;
  gap: 24px;
}

.spark {
  padding: 16px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: var(--glass);
}

.spark-title {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 12px;
}

.spark-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  align-items: end;
  height: 88px;
}

.spark-grid .bar {
  border-radius: 6px;
  background: linear-gradient(180deg, var(--accent-3), var(--accent), var(--accent-4));
  background-size: 200% 200%;
  animation: gradientFlow 10s ease-in-out infinite;
}

.dash-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.week-bars {
  display: grid;
  gap: 10px;
}

.week-bars .row {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  color: var(--muted);
}

.track {
  height: 8px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  overflow: hidden;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-3), var(--accent-4));
  background-size: 200% 200%;
  animation: gradientFlow 10s ease-in-out infinite;
}

.risk {
  display: grid;
  gap: 8px;
}

.risk-score {
  font-size: 28px;
  font-weight: 700;
}

.tips {
  margin: 0;
  padding-left: 16px;
  display: grid;
  gap: 8px;
  color: var(--muted);
}

.entries {
  display: grid;
  gap: 10px;
  color: var(--muted);
  font-size: 12px;
}

.entry {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 999px;
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.badge-blue { background: rgba(47,128,255,0.18); color: #2f80ff; border: 1px solid rgba(47,128,255,0.35); }
.badge-purple { background: rgba(124,58,237,0.18); color: #7c3aed; border: 1px solid rgba(124,58,237,0.35); }
.badge-cyan { background: rgba(45,226,230,0.18); color: #2de2e6; border: 1px solid rgba(45,226,230,0.35); }

.card {
  padding: 16px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: var(--glass);
}

.meter {
  height: 8px;
  background: rgba(255,255,255,0.12);
  border-radius: 999px;
  overflow: hidden;
  margin: 8px 0 12px;
}

.meter span {
  display: block;
  height: 100%;
  width: 68%;
  background: linear-gradient(90deg, var(--accent), var(--accent-3));
  background-size: 200% 200%;
  animation: gradientFlow 10s ease-in-out infinite;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@media (max-width: 900px) {
  .container { padding: 20px 16px 40px; }
  .hero, .dash-hero { grid-template-columns: 1fr; }
  .grid { grid-template-columns: 1fr; }
  .dash-grid { grid-template-columns: 1fr; }
  .auth { grid-template-columns: 1fr; }
  .topbar { flex-direction: column; align-items: flex-start; gap: 10px; }
  .a2hs { flex-direction: column; align-items: flex-start; }
}
</style>

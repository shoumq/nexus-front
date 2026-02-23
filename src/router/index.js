import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '../pages/DashboardPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import AddPage from '../pages/AddPage.vue'
import AnalyzePage from '../pages/AnalyzePage.vue'
import { tokenStore } from '../services/api'

const routes = [
  { path: '/', name: 'dashboard', component: DashboardPage, meta: { requiresAuth: true } },
  { path: '/add', name: 'add', component: AddPage, meta: { requiresAuth: true } },
  { path: '/analyze', name: 'analyze', component: AnalyzePage, meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: LoginPage },
  { path: '/register', name: 'register', component: RegisterPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !tokenStore.get()) {
    return { name: 'login' }
  }
  return true
})

export default router

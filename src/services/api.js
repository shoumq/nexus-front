const API_BASE = process.env.VUE_APP_API_BASE || 'http://localhost:8088'

const ACCESS_KEY = 'nexus_access_token'
const REFRESH_KEY = 'nexus_refresh_token'

const getToken = () => localStorage.getItem(ACCESS_KEY)
const getRefresh = () => localStorage.getItem(REFRESH_KEY)
const notifyAuth = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-changed'))
  }
}

let refreshing = null

const refreshAccessToken = async () => {
  const refreshToken = getRefresh()
  if (!refreshToken) {
    throw new Error('No refresh token')
  }
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  const data = await res.json()
  const access = data.access_token || data.accessToken
  const refresh = data.refresh_token || data.refreshToken
  if (access) localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  notifyAuth()
  return access
}

const request = async (path, { method = 'GET', body, auth = false } = {}) => {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  if (auth && res.status === 401) {
    try {
      refreshing = refreshing || refreshAccessToken()
      const newToken = await refreshing
      refreshing = null
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` }
      const retry = await fetch(`${API_BASE}${path}`, {
        method,
        headers: retryHeaders,
        body: body ? JSON.stringify(body) : undefined
      })
      if (!retry.ok) {
        const text = await retry.text()
        throw new Error(text || `HTTP ${retry.status}`)
      }
      return retry.json()
    } catch (e) {
      refreshing = null
      tokenStore.clear()
      if (typeof window !== 'undefined') {
        window.location.assign('/login')
      }
      throw e
    }
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }

  return res.json()
}

export const authApi = {
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload })
}

export const aiApi = {
  track: (payload) => request('/ai/track', { method: 'POST', body: payload, auth: true }),
  analyze: (payload) => request('/ai/analyze', { method: 'POST', body: payload, auth: true }),
  today: (payload) => request('/ai/today', { method: 'POST', body: payload, auth: true }),
  lastAnalyze: () => request('/ai/last-analyze', { method: 'GET', auth: true })
}

export const tokenStore = {
  set(accessToken) {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken)
    notifyAuth()
  },
  setRefresh(refreshToken) {
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
    notifyAuth()
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    notifyAuth()
  },
  get() {
    return localStorage.getItem(ACCESS_KEY)
  },
  getRefresh() {
    return localStorage.getItem(REFRESH_KEY)
  }
}

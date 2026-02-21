const API_BASE = process.env.VUE_APP_API_BASE || 'http://localhost:8088'

const getToken = () => localStorage.getItem('nexus_access_token')

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
  analyze: (payload) => request('/ai/analyze', { method: 'POST', body: payload, auth: true })
}

export const tokenStore = {
  set(accessToken) {
    if (accessToken) localStorage.setItem('nexus_access_token', accessToken)
  },
  clear() {
    localStorage.removeItem('nexus_access_token')
  },
  get() {
    return localStorage.getItem('nexus_access_token')
  }
}

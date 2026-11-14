import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

// Request interceptor: attach JWT from localStorage and normalize URL path
api.interceptors.request.use(config => {
  // If baseURL ends with /api and the request URL starts with /api/, strip the duplicate /api
  if (config.baseURL?.endsWith('/api') && config.url?.startsWith('/api/')) {
    config.url = config.url.slice(4)
  }
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api


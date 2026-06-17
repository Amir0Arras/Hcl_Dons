import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const isAuthenticated = ref(false)
  const loading = ref(true)

  function initSession() {
    try {
      const s = localStorage.getItem('currentUser')
      if (s) { currentUser.value = JSON.parse(s); isAuthenticated.value = true }
    } catch { localStorage.removeItem('currentUser') }
    finally { loading.value = false }
  }

  async function login(email, password) {
    const res = await api.auth.login(email, password)
    if (res.success) {
      currentUser.value = res.user; isAuthenticated.value = true
      localStorage.setItem('currentUser', JSON.stringify(res.user))
      return { success: true }
    }
    return { success: false, error: res.message }
  }

  async function signup(data) { return await api.auth.signup(data) }

  function logout() {
    currentUser.value = null; isAuthenticated.value = false
    localStorage.removeItem('currentUser')
  }

  function hasRole(...roles) {
    if (!currentUser.value) return false
    return roles.flat().includes(currentUser.value.role)
  }

  return { currentUser, isAuthenticated, loading, initSession, login, signup, logout, hasRole }
})

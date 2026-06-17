<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/context/authStore'
import {
  LayoutDashboard, ClipboardList, ListOrdered, CheckSquare,
  Users, Truck, UserCheck, AlertTriangle, Menu, LogOut, Home, X
} from 'lucide-vue-next'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const isMobileOpen = ref(false)

const navigation = [
  { name: 'Tableau de bord', href: '/admin-dashboard', icon: Home },
  { name: 'Annonces en attente', href: '/admin/annonces-attente', icon: ClipboardList },
  { name: 'Toutes les annonces', href: '/admin/annonces', icon: ListOrdered },
  { name: 'Dons validés', href: '/admin/dons-valides', icon: CheckSquare },
  { name: 'Utilisateurs', href: '/admin/utilisateurs', icon: Users },
  { name: 'Logisticiens', href: '/admin/logisticiens', icon: Truck },
  { name: 'Validation comptes', href: '/admin/validation-comptes', icon: UserCheck },
  { name: 'Vider la base', href: '/admin/vider-base', icon: AlertTriangle, danger: true },
]

const isActive = item =>
  route.path === item.href || (item.href === '/admin-dashboard' && route.path === '/admin')

function logout() { auth.logout(); router.push('/') }
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <!-- Sidebar Desktop -->
    <aside class="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-slate-950 text-slate-300">
      <div class="p-6">
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <span class="bg-primary/20 text-primary p-1.5 rounded-lg"><LayoutDashboard class="w-5 h-5" /></span>
          Admin Panel
        </h2>
        <p class="text-sm mt-2 text-slate-500">Connecté en tant que {{ auth.currentUser?.nom }}</p>
      </div>
      <nav class="flex-1 px-4 space-y-1 overflow-y-auto">
        <RouterLink v-for="item in navigation" :key="item.name" :to="item.href"
          :class="['flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive(item)
              ? item.danger ? 'bg-red-500/10 text-red-400' : 'bg-primary/15 text-primary'
              : item.danger ? 'hover:bg-red-500/10 hover:text-red-400 text-slate-400' : 'hover:bg-slate-900 hover:text-white text-slate-400']">
          <component :is="item.icon" class="w-5 h-5" />
          {{ item.name }}
        </RouterLink>
      </nav>
      <div class="p-4 mt-auto border-t border-slate-800">
        <button @click="logout" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors">
          <LogOut class="w-5 h-5" />Déconnexion
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 md:ml-64 flex flex-col min-h-screen overflow-hidden">
      <!-- Mobile header -->
      <header class="md:hidden flex items-center justify-between p-4 bg-white border-b">
        <h1 class="text-lg font-bold">Admin Panel</h1>
        <button @click="isMobileOpen=true" class="p-2 rounded-lg hover:bg-muted"><Menu class="w-6 h-6" /></button>
      </header>

      <!-- Mobile sidebar overlay -->
      <div v-if="isMobileOpen" class="fixed inset-0 z-50 md:hidden">
        <div class="absolute inset-0 bg-black/60" @click="isMobileOpen=false" />
        <aside class="absolute left-0 inset-y-0 w-72 bg-slate-950 text-slate-300 flex flex-col">
          <div class="p-6 flex items-center justify-between">
            <h2 class="text-xl font-bold text-white">Admin Panel</h2>
            <button @click="isMobileOpen=false" class="text-slate-400 hover:text-white"><X class="w-5 h-5" /></button>
          </div>
          <nav class="flex-1 px-4 space-y-1 overflow-y-auto">
            <RouterLink v-for="item in navigation" :key="item.name" :to="item.href" @click="isMobileOpen=false"
              :class="['flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(item)
                  ? item.danger ? 'bg-red-500/10 text-red-400' : 'bg-primary/15 text-primary'
                  : item.danger ? 'hover:bg-red-500/10 hover:text-red-400 text-slate-400' : 'hover:bg-slate-900 hover:text-white text-slate-400']">
              <component :is="item.icon" class="w-5 h-5" />{{ item.name }}
            </RouterLink>
          </nav>
          <div class="p-4 border-t border-slate-800">
            <button @click="logout" class="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg">
              <LogOut class="w-5 h-5" />Déconnexion
            </button>
          </div>
        </aside>
      </div>

      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div class="mx-auto max-w-7xl">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

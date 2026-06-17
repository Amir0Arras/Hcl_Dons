<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/context/authStore'
import { Menu, LogOut, User, PlusCircle, LayoutDashboard, ShieldAlert } from 'lucide-vue-next'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const isOpen = ref(false)

const LOGO = 'https://horizons-cdn.hostinger.com/53eead38-50c1-4af3-9ee4-0346afea2f50/e052ce15e031725f058b84c68a24f11a.png'

const isActive = p => route.path === p

const dashPath = computed(() => {
  switch (auth.currentUser?.role) {
    case 'Admin': return '/admin-dashboard'
    case 'Logisticien': return '/logistician'
    case 'Bénéficiaire': return '/beneficiary'
    default: return '/donations'
  }
})

const canDonate = computed(() => auth.hasRole('Admin', 'Logisticien', 'Unité donneuse', 'Donateur'))
const isBenef  = computed(() => auth.hasRole('Bénéficiaire'))

function logout() { auth.logout(); router.push('/'); isOpen.value = false }
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container-custom">
      <div class="flex h-16 items-center justify-between">

        <!-- Logo + nav -->
        <div class="flex items-center gap-8">
          <RouterLink to="/" class="flex items-center gap-3">
            <img :src="LOGO" alt="Dons Réemploi" class="h-[45px] w-auto" />
            <span class="font-bold text-lg hidden sm:inline-block">Dons Réemploi</span>
          </RouterLink>
          <nav class="hidden md:flex items-center gap-6">
            <RouterLink to="/" :class="['text-sm font-medium transition-colors hover:text-primary', isActive('/') ? 'text-primary' : 'text-foreground/80']">Accueil</RouterLink>
            <RouterLink to="/donations" :class="['text-sm font-medium transition-colors hover:text-primary', isActive('/donations') ? 'text-primary' : 'text-foreground/80']">Annonces</RouterLink>
            <RouterLink v-if="auth.isAuthenticated && canDonate" to="/create-donation"
              :class="['text-sm font-medium transition-colors hover:text-primary flex items-center gap-2', isActive('/create-donation') ? 'text-primary' : 'text-foreground/80']">
              <PlusCircle class="h-4 w-4" />Nouveau Don
            </RouterLink>
            <RouterLink v-if="auth.isAuthenticated && isBenef" to="/beneficiary"
              :class="['text-sm font-medium transition-colors hover:text-primary', isActive('/beneficiary') ? 'text-primary' : 'text-foreground/80']">
              Mes Demandes
            </RouterLink>
          </nav>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-4">
          <template v-if="auth.isAuthenticated">
            <div class="hidden md:flex items-center gap-4">
              <RouterLink v-if="auth.currentUser?.role === 'Admin'" to="/admin-dashboard"
                class="inline-flex items-center gap-2 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg transition-colors">
                <ShieldAlert class="h-4 w-4" />Admin Dashboard
              </RouterLink>
              <RouterLink v-else :to="dashPath"
                class="inline-flex items-center gap-2 text-sm font-medium border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                <LayoutDashboard class="h-4 w-4" />Tableau de bord
              </RouterLink>
              <div class="flex items-center gap-2 text-sm bg-muted px-3 py-1.5 rounded-full">
                <User class="h-4 w-4 text-muted-foreground" />
                <span class="font-medium">{{ auth.currentUser?.prenom || auth.currentUser?.email }}</span>
              </div>
              <button @click="logout" class="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive px-2 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                <LogOut class="h-4 w-4" />Déconnexion
              </button>
            </div>
          </template>
          <template v-else>
            <div class="hidden md:flex items-center gap-3">
              <RouterLink to="/login" class="text-sm font-medium hover:text-primary px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">Connexion</RouterLink>
              <RouterLink to="/signup" class="text-sm font-semibold bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">Inscription</RouterLink>
            </div>
          </template>
          <button @click="isOpen=!isOpen" class="md:hidden p-2 rounded-lg hover:bg-muted">
            <Menu class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Mobile -->
      <div v-if="isOpen" class="md:hidden border-t py-4 space-y-2">
        <RouterLink to="/" @click="isOpen=false" class="block text-sm font-medium py-2 hover:text-primary transition-colors">Accueil</RouterLink>
        <RouterLink to="/donations" @click="isOpen=false" class="block text-sm font-medium py-2 hover:text-primary transition-colors">Annonces</RouterLink>
        <RouterLink v-if="auth.isAuthenticated && canDonate" to="/create-donation" @click="isOpen=false" class="flex items-center gap-2 text-sm font-medium py-2 hover:text-primary transition-colors">
          <PlusCircle class="h-4 w-4" />Nouveau Don
        </RouterLink>
        <RouterLink v-if="auth.isAuthenticated && isBenef" to="/beneficiary" @click="isOpen=false" class="block text-sm font-medium py-2 hover:text-primary transition-colors">Mes Demandes</RouterLink>
        <template v-if="auth.isAuthenticated">
          <div class="border-t pt-2 space-y-2">
            <RouterLink :to="dashPath" @click="isOpen=false" class="flex items-center gap-2 text-sm font-medium py-2"><LayoutDashboard class="h-4 w-4" />Tableau de bord</RouterLink>
            <button @click="logout" class="w-full text-left flex items-center gap-2 text-sm text-destructive py-2"><LogOut class="h-4 w-4" />Déconnexion</button>
          </div>
        </template>
        <template v-else>
          <div class="border-t pt-2 space-y-2">
            <RouterLink to="/login" @click="isOpen=false" class="block text-sm font-medium py-2">Connexion</RouterLink>
            <RouterLink to="/signup" @click="isOpen=false" class="block text-sm font-semibold text-primary py-2">Inscription</RouterLink>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

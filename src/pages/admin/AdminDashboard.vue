<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import { Users, Truck, MapPin, Package, CheckCircle, Clock, Activity, RefreshCw, ArrowRight, AlertCircle } from 'lucide-vue-next'

const router = useRouter(); const { toast } = useToast()
const stats = ref({ totalUsers:0, logisticians:0, collectionPoints:0, pendingDonations:0, validatedDonations:0 })
const estimateStats = ref({ value: null, loading: true, error: null })
const usersByRole = ref([]); const loading = ref(true)

async function fetchData() {
  loading.value = true
  try {
    const data = await api.stats.global()
    stats.value = data; usersByRole.value = data.usersByRole
    estimateStats.value = { value: data.totalEstimate.toLocaleString('fr-FR', { minimumFractionDigits:2, maximumFractionDigits:2 }) + ' €', loading:false, error:null }
  } catch(e) {
    estimateStats.value = { value:null, loading:false, error:'Données indisponibles' }
    toast({ title: 'Erreur lors du chargement', variant:'destructive' })
  } finally { loading.value = false }
}

onMounted(fetchData)

const statCards = [
  { title:'Utilisateurs totaux', key:'totalUsers', icon:Users, color:'bg-blue-50 text-blue-600' },
  { title:'Logisticiens', key:'logisticians', icon:Truck, color:'bg-purple-50 text-purple-600' },
  { title:'Points de collecte', key:'collectionPoints', icon:MapPin, color:'bg-green-50 text-green-600' },
  { title:'Dons en attente', key:'pendingDonations', icon:Clock, color:'bg-amber-50 text-amber-600' },
]
const links = [
  { href:'/admin/annonces-attente', label:'Annonces en attente', desc:'Valider les nouveaux dons', icon:Clock },
  { href:'/admin/annonces', label:'Toutes les annonces', desc:'Voir tout l\'historique', icon:Package },
  { href:'/admin/validation-comptes', label:'Validation comptes', desc:'Approuver les inscriptions', icon:Users },
  { href:'/admin/logisticiens', label:'Logisticiens', desc:'Gérer les logisticiens', icon:Truck },
  { href:'/admin/utilisateurs', label:'Utilisateurs', desc:'Tous les comptes', icon:Users },
  { href:'/admin/points-relais', label:'Points relais', desc:'Gérer les points de collecte', icon:MapPin },
]
</script>
<template>
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Tableau de bord</h1>
        <p class="text-muted-foreground mt-1">Vue d'ensemble de la plateforme</p>
      </div>
      <button @click="fetchData" class="inline-flex items-center gap-2 text-sm font-medium border border-border px-3 py-2 rounded-lg hover:bg-muted transition-colors">
        <RefreshCw class="h-4 w-4" />Actualiser
      </button>
    </div>

    <!-- Estimate card -->
    <div class="rounded-xl border bg-card p-6 flex items-center justify-between shadow-sm">
      <div>
        <p class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Estimation totale des dons</p>
        <div v-if="estimateStats.loading" class="h-8 w-48 bg-muted animate-pulse rounded"></div>
        <p v-else-if="estimateStats.error" class="text-sm text-destructive flex items-center gap-2"><AlertCircle class="h-4 w-4" />{{ estimateStats.error }}</p>
        <p v-else class="text-4xl font-bold text-primary">{{ estimateStats.value }}</p>
      </div>
      <Activity class="h-12 w-12 text-primary/20" />
    </div>

    <!-- Stat cards -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="h-28 bg-muted animate-pulse rounded-xl"></div>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="c in statCards" :key="c.key" class="rounded-xl border bg-card p-5 flex items-center gap-4 shadow-sm">
        <div :class="['p-3 rounded-xl', c.color]"><component :is="c.icon" class="h-6 w-6" /></div>
        <div>
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{{ c.title }}</p>
          <p class="text-3xl font-bold text-slate-900 mt-0.5">{{ stats[c.key] }}</p>
        </div>
      </div>
    </div>

    <!-- Quick links -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <RouterLink v-for="l in links" :key="l.href" :to="l.href" class="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow flex items-center justify-between group cursor-pointer">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-muted"><component :is="l.icon" class="h-5 w-5 text-muted-foreground" /></div>
          <div><p class="font-semibold text-sm">{{ l.label }}</p><p class="text-xs text-muted-foreground mt-0.5">{{ l.desc }}</p></div>
        </div>
        <ArrowRight class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </RouterLink>
    </div>

    <!-- Users by role -->
    <div class="rounded-xl border bg-card p-6 shadow-sm">
      <h2 class="text-lg font-bold mb-4">Répartition par rôle</h2>
      <div class="space-y-3">
        <div v-for="r in usersByRole" :key="r.name" class="flex items-center gap-3">
          <span class="text-sm font-medium w-28 shrink-0">{{ r.name }}</span>
          <div class="flex-1 bg-muted rounded-full h-2 overflow-hidden">
            <div class="h-full bg-primary rounded-full transition-all" :style="`width:${stats.totalUsers ? (r.value/stats.totalUsers*100) : 0}%`"></div>
          </div>
          <span class="text-sm font-bold w-6 text-right">{{ r.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

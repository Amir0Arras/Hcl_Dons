<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/context/authStore'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { Search, Filter, Package, Calendar, MapPin, User, AlertTriangle } from 'lucide-vue-next'

const auth = useAuthStore(); const router = useRouter(); const { toast } = useToast()
const donations = ref([]); const loading = ref(true)
const searchTerm = ref(''); const filterType = ref('all'); const filterSterility = ref('all'); const filterStatus = ref('Validée')

onMounted(async () => {
  donations.value = await api.donations.list()
  loading.value = false
})

const uniqueTypes = computed(() => [...new Set(donations.value.map(d => d.type_materiel).filter(Boolean))])

const filtered = computed(() => donations.value.filter(d => {
  const pointName = d.expand?.point_collecte?.nom || ''
  const search = searchTerm.value.toLowerCase()
  const matchSearch = !search || d.type_materiel?.toLowerCase().includes(search) || pointName.toLowerCase().includes(search)
  const matchType = filterType.value === 'all' || d.type_materiel === filterType.value
  const matchSterile = filterSterility.value === 'all' || (filterSterility.value === 'sterile' && d.sterile) || (filterSterility.value === 'non-sterile' && !d.sterile)
  const isAvailable = d.statut === 'Validée' || d.statut === 'disponible'
  const matchStatus = filterStatus.value === 'all' ? isAvailable : d.statut === filterStatus.value
  return matchSearch && matchType && matchSterile && matchStatus && isAvailable
}))

function isExpiringSoon(date) {
  if (!date) return false
  const diff = (new Date(date) - new Date()) / (1000*60*60*24)
  return diff <= 7 && diff >= 0
}

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('fr-FR') : 'Non renseigné' }
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1">
      <!-- Hero section -->
      <section class="relative h-[40vh] min-h-[300px] flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20 overflow-hidden">
        <div class="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1607077792235-f95fb5505db8" alt="Matériel médical" class="w-full h-full object-cover opacity-20" />
          <div class="absolute inset-0 bg-gradient-to-r from-background/80 to-background/60"></div>
        </div>
        <div class="container-custom relative z-10 text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 text-balance" style="letter-spacing:-0.02em">Marketplace des dons</h1>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">Découvrez le matériel médical disponible en don et réservez ce dont vous avez besoin</p>
        </div>
      </section>

      <section class="py-12 bg-background">
        <div class="container-custom">
          <!-- Filters -->
          <div class="mb-8 space-y-4">
            <div class="flex flex-col md:flex-row gap-4">
              <div class="flex-1 relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input v-model="searchTerm" placeholder="Rechercher par type de matériel ou point de collecte..."
                  class="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div class="flex flex-wrap gap-4">
                <select v-model="filterStatus" class="flex h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-[160px]">
                  <option value="Validée">Disponibles (Validée)</option>
                  <option value="all">Tous les disponibles</option>
                </select>
                <select v-model="filterType" class="flex h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-[180px]">
                  <option value="all">Tous les types</option>
                  <option v-for="t in uniqueTypes" :key="t" :value="t">{{ t }}</option>
                </select>
                <select v-model="filterSterility" class="flex h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-[160px]">
                  <option value="all">Tous</option>
                  <option value="sterile">Stérile</option>
                  <option value="non-sterile">Non stérile</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Loading skeleton -->
          <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="rounded-xl border bg-card p-6 space-y-3 animate-pulse">
              <div class="h-6 bg-muted rounded w-3/4"></div>
              <div class="h-4 bg-muted rounded w-1/2"></div>
              <div class="h-4 bg-muted rounded"></div>
              <div class="h-10 bg-muted rounded mt-4"></div>
            </div>
          </div>

          <!-- Empty -->
          <div v-else-if="!filtered.length" class="text-center py-16">
            <Package class="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 class="text-xl font-semibold mb-2">Aucun don disponible</h3>
            <p class="text-muted-foreground">
              {{ searchTerm || filterType !== 'all' || filterSterility !== 'all' ? 'Essayez de modifier vos filtres de recherche' : "Il n'y a actuellement aucun don disponible avec le statut Validée" }}
            </p>
          </div>

          <!-- Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="d in filtered" :key="d.id" class="h-full flex flex-col rounded-xl border bg-card shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div class="p-6">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <h3 class="text-lg font-semibold line-clamp-2">{{ d.type_materiel }}</h3>
                  <span v-if="isExpiringSoon(d.date_expiration)" class="inline-flex items-center gap-1 text-xs font-semibold bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 shrink-0">
                    <AlertTriangle class="h-3 w-3" />Expire bientôt
                  </span>
                </div>
                <div class="flex gap-2 mb-4">
                  <span :class="['badge text-xs', d.sterile ? 'badge-default' : 'badge-secondary']">
                    {{ d.sterile ? 'Stérile' : 'Non stérile' }}
                  </span>
                  <span class="badge badge-outline text-xs bg-emerald-50 text-emerald-700 border-emerald-200">{{ d.statut }}</span>
                </div>
                <div class="space-y-3 text-sm flex-1">
                  <div class="flex items-center gap-2 text-muted-foreground">
                    <Calendar class="h-4 w-4 shrink-0" />
                    <span>Expire le {{ fmtDate(d.date_expiration) }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-muted-foreground">
                    <Package class="h-4 w-4 shrink-0" />
                    <span>Quantité : {{ d.quantite_initiale }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-muted-foreground">
                    <MapPin class="h-4 w-4 shrink-0" />
                    <span class="line-clamp-1">{{ d.expand?.point_collecte?.nom || 'Point de collecte non spécifié' }}</span>
                  </div>
                  <div v-if="d.expand?.created_by" class="flex items-center gap-2 text-muted-foreground">
                    <User class="h-4 w-4 shrink-0" />
                    <span class="line-clamp-1">{{ d.expand.created_by.nom || d.expand.created_by.email }}</span>
                  </div>
                </div>
              </div>
              <div class="mt-auto p-6 pt-0">
                <RouterLink :to="`/donations/${d.id}`" class="w-full inline-flex items-center justify-center h-10 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors">
                  Voir les détails
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
</template>

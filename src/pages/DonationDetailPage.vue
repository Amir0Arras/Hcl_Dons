<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/context/authStore'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ArrowLeft, Package, Calendar, MapPin, Loader2, AlertCircle } from 'lucide-vue-next'

const route = useRoute(); const router = useRouter()
const auth = useAuthStore(); const { toast } = useToast()

const donation = ref(null); const loading = ref(true); const error = ref('')
const isModalOpen = ref(false); const quantity = ref(1); const submitting = ref(false)

onMounted(async () => {
  try {
    donation.value = await api.donations.get(route.params.id)
    if (!donation.value) error.value = "Le don demandé est introuvable ou n'existe plus."
  } catch { error.value = "Le don demandé est introuvable ou n'existe plus." }
  finally { loading.value = false }
})

async function handleReserve() {
  if (!auth.isAuthenticated) return toast({ title: 'Vous devez être connecté pour réserver', variant: 'destructive' })
  if (auth.currentUser.role !== 'Bénéficiaire') return toast({ title: "Seuls les Bénéficiaires peuvent faire une demande.", variant: 'destructive' })
  const qty = parseInt(quantity.value)
  if (isNaN(qty) || qty <= 0) return toast({ title: 'Quantité invalide', variant: 'destructive' })
  if (qty > donation.value.quantite_initiale) return toast({ title: `La quantité demandée (${qty}) dépasse le stock disponible (${donation.value.quantite_initiale})`, variant: 'destructive' })

  submitting.value = true
  try {
    await api.reservations.create({ donation_id: donation.value.id, quantite_demandee: qty }, auth.currentUser.id)
    toast({ title: 'Demande envoyée au logisticien !' })
    isModalOpen.value = false; quantity.value = 1
    // Refresh pour voir stock mis à jour si validé
    donation.value = await api.donations.get(route.params.id)
  } catch(e) {
    toast({ title: e.message || 'Erreur lors de la réservation', variant: 'destructive' })
  } finally { submitting.value = false }
}

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('fr-FR') : 'Non renseigné' }
const FALLBACK = 'https://images.unsplash.com/photo-1580281657702-257584239a55?auto=format&fit=crop&q=80&w=800'
</script>
<template>
  <div class="min-h-screen bg-background flex flex-col">
    <Header />
    <main class="flex-1 py-12">
      <!-- Loading -->
      <div v-if="loading" class="container-custom max-w-4xl space-y-6">
        <div class="h-10 w-40 bg-muted animate-pulse rounded"></div>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="md:col-span-2 h-80 bg-muted animate-pulse rounded-xl"></div>
          <div class="h-80 bg-muted animate-pulse rounded-xl"></div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="container-custom max-w-4xl">
        <div class="flex items-start gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive">
          <AlertCircle class="h-5 w-5 shrink-0 mt-0.5" /><p>{{ error }}</p>
        </div>
      </div>

      <!-- Content -->
      <div v-else-if="donation" class="container-custom max-w-4xl space-y-6">
        <button @click="router.push('/donations')" class="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg -ml-2 transition-colors">
          <ArrowLeft class="h-4 w-4" />Retour aux annonces
        </button>

        <div class="grid md:grid-cols-3 gap-6">
          <!-- Image + détails -->
          <div class="md:col-span-2 space-y-6">
            <!-- Photo : affiche la photo uploadée (base64) ou fallback -->
            <img :src="donation.photo || FALLBACK" :alt="donation.type_materiel"
              class="w-full h-64 object-cover rounded-xl shadow-sm" />

            <div class="rounded-xl border bg-card p-6">
              <div class="flex flex-wrap gap-2 mb-4">
                <span :class="['badge text-xs font-semibold', donation.sterile ? 'badge-default' : 'badge-secondary']">
                  {{ donation.sterile ? 'Stérile' : 'Non stérile' }}
                </span>
                <span class="badge badge-outline text-xs bg-emerald-50 text-emerald-700 border-emerald-200">{{ donation.statut }}</span>
              </div>
              <h1 class="text-3xl font-bold mb-6">{{ donation.type_materiel }}</h1>
              <div class="grid sm:grid-cols-2 gap-4 text-sm">
                <div class="flex items-center gap-3">
                  <Calendar class="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p class="text-xs uppercase font-semibold text-muted-foreground">Date d'expiration</p>
                    <p class="font-medium">{{ fmtDate(donation.date_expiration) }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <Package class="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p class="text-xs uppercase font-semibold text-muted-foreground">Quantité disponible</p>
                    <p class="font-medium">{{ donation.quantite_initiale }} unité(s)</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <MapPin class="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p class="text-xs uppercase font-semibold text-muted-foreground">Point de collecte</p>
                    <p class="font-medium">{{ donation.expand?.point_collecte?.nom || 'Non spécifié' }}</p>
                  </div>
                </div>
              </div>
              <div v-if="donation.localisation_libre" class="mt-4 p-4 bg-muted rounded-lg text-sm">
                <p class="font-semibold mb-1">Localisation précise</p>
                <p class="text-muted-foreground">{{ donation.localisation_libre }}</p>
              </div>
            </div>
          </div>

          <!-- Panneau réservation -->
          <div class="rounded-xl border bg-card p-6 h-fit">
            <h3 class="font-bold text-lg mb-4">Réserver ce don</h3>
            <div class="space-y-3 text-sm mb-6">
              <div class="flex justify-between border-b pb-2">
                <span class="text-muted-foreground">Estimation / unité</span>
                <span class="font-semibold">{{ donation.estimation_prix }} €</span>
              </div>
              <div class="flex justify-between border-b pb-2">
                <span class="text-muted-foreground">Stock disponible</span>
                <span class="font-semibold text-primary">{{ donation.quantite_initiale }} unité(s)</span>
              </div>
            </div>

            <div v-if="auth.hasRole('Bénéficiaire') && donation.statut === 'Validée' && donation.quantite_initiale > 0">
              <button @click="isModalOpen=true;quantity=1"
                class="w-full inline-flex items-center justify-center h-10 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors">
                Faire une demande de réservation
              </button>
            </div>
            <div v-else-if="donation.quantite_initiale === 0" class="text-sm text-center text-muted-foreground bg-muted p-3 rounded-lg">
              Stock épuisé
            </div>
            <p v-else-if="!auth.isAuthenticated" class="text-sm text-muted-foreground text-center">
              <RouterLink to="/login" class="text-primary hover:underline font-medium">Connectez-vous</RouterLink> pour réserver
            </p>
            <p v-else-if="donation.statut !== 'Validée'" class="text-sm text-muted-foreground text-center">Ce don n'est pas disponible actuellement.</p>
            <p v-else class="text-sm text-muted-foreground text-center">Seuls les bénéficiaires peuvent faire une demande.</p>
          </div>
        </div>
      </div>
    </main>
    <Footer />

    <!-- Modal réservation avec choix de la quantité -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="w-full max-w-md bg-card rounded-xl shadow-2xl border p-6">
          <h3 class="text-xl font-bold mb-1">Nouvelle demande de réservation</h3>
          <p class="text-sm text-muted-foreground mb-6">Indiquez la quantité souhaitée (max : {{ donation?.quantite_initiale }} unité(s) disponible(s)).</p>
          <div class="space-y-3 mb-6">
            <div class="bg-muted p-4 rounded-lg text-sm space-y-1">
              <p><span class="text-muted-foreground">Matériel : </span><strong>{{ donation?.type_materiel }}</strong></p>
              <p><span class="text-muted-foreground">Point de collecte : </span><strong>{{ donation?.expand?.point_collecte?.nom }}</strong></p>
              <p><span class="text-muted-foreground">Stock disponible : </span><strong class="text-primary">{{ donation?.quantite_initiale }} unité(s)</strong></p>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Quantité demandée *</label>
              <input v-model="quantity" type="number" min="1" :max="donation?.quantite_initiale" required
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <p class="text-xs text-muted-foreground">Entre 1 et {{ donation?.quantite_initiale }} unité(s)</p>
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <button @click="isModalOpen=false;quantity=1" :disabled="submitting"
              class="inline-flex items-center justify-center h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors">Annuler</button>
            <button @click="handleReserve" :disabled="submitting"
              class="inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70">
              <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
              Envoyer la demande
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

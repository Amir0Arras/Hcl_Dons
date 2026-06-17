<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/context/authStore'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import { ClipboardList, FileText, MapPin, ArrowRight, AlertCircle, Package, Check, X, FileSignature, Loader2 } from 'lucide-vue-next'

const auth = useAuthStore(); const { toast } = useToast()

const stats = ref({ pendingReservations: 0, certificates: 0, pointRelais: null, pendingDonations: 0 })
const estimateStats = ref({ value: null, loading: true, error: null })
const requests = ref([]); const loading = ref(true)

const activeModal = ref(null); const selectedRequest = ref(null); const rejectReason = ref(''); const actionLoading = ref(false)

onMounted(async () => {
  const user = auth.currentUser
  if (!user?.point_collecte_id) { loading.value = false; return }

  const [pts, pointStats] = await Promise.all([
    api.points.list(),
    api.stats.byPoint(user.point_collecte_id)
  ])
  stats.value.pointRelais = pts.find(p => p.id === user.point_collecte_id) || null
  stats.value.pendingReservations = pointStats.pendingReservations
  stats.value.certificates = pointStats.certificates
  stats.value.pendingDonations = pointStats.pendingDonations
  estimateStats.value = { value: pointStats.totalDonations.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €', loading: false, error: null }

  requests.value = await api.reservations.listForPoint(user.point_collecte_id, 'En attente')
  loading.value = false
})

function openModal(type, req) { selectedRequest.value = req; rejectReason.value = ''; activeModal.value = type }
function closeModal() { activeModal.value = null; selectedRequest.value = null; rejectReason.value = '' }

async function handleAction() {
  if (!selectedRequest.value) return
  actionLoading.value = true
  try {
    if (activeModal.value === 'validate') {
      const { certificate } = await api.reservations.approve(selectedRequest.value.id, auth.currentUser.id)
      toast({ title: `Réservation validée — Bon ${certificate.numero} généré automatiquement` })
    } else if (activeModal.value === 'reject') {
      if (!rejectReason.value.trim()) return toast({ title: 'Veuillez indiquer un motif', variant: 'destructive' })
      await api.reservations.reject(selectedRequest.value.id, rejectReason.value)
      toast({ title: 'Réservation refusée' })
    }
    requests.value = await api.reservations.listForPoint(auth.currentUser.point_collecte_id, 'En attente')
    closeModal()
  } catch(e) {
    toast({ title: e.message, variant: 'destructive' })
  } finally { actionLoading.value = false }
}

function fmtDate(d) { return new Date(d).toLocaleDateString('fr-FR') }
</script>
<template>
  <div class="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
    <!-- No point alert -->
    <div v-if="!auth.currentUser?.point_collecte_id" class="flex items-start gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive">
      <AlertCircle class="h-5 w-5 shrink-0 mt-0.5" />
      <div><p class="font-semibold">Aucun point de collecte assigné</p><p class="text-sm mt-1">Contactez un administrateur pour être lié à un point de collecte.</p></div>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Tableau de bord Logisticien</h1>
          <p class="text-muted-foreground mt-1 flex items-center gap-2">
            <MapPin class="h-4 w-4" />{{ stats.pointRelais?.nom || '...' }}
          </p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="rounded-xl border bg-card p-5">
          <p class="text-xs font-semibold uppercase text-muted-foreground mb-2">Valeur des dons</p>
          <p class="text-2xl font-bold">{{ estimateStats.loading ? '...' : (estimateStats.error || estimateStats.value) }}</p>
        </div>
        <div class="rounded-xl border bg-card p-5">
          <p class="text-xs font-semibold uppercase text-muted-foreground mb-2">Réservations en attente</p>
          <p class="text-2xl font-bold text-amber-600">{{ stats.pendingReservations }}</p>
        </div>
        <div class="rounded-xl border bg-card p-5">
          <p class="text-xs font-semibold uppercase text-muted-foreground mb-2">Dons en attente</p>
          <p class="text-2xl font-bold text-blue-600">{{ stats.pendingDonations }}</p>
        </div>
        <div class="rounded-xl border bg-card p-5">
          <p class="text-xs font-semibold uppercase text-muted-foreground mb-2">Bons de cession émis</p>
          <p class="text-2xl font-bold text-green-600">{{ stats.certificates }}</p>
        </div>
      </div>

      <!-- Quick nav -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RouterLink to="/logistician/reservations" class="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow flex items-center justify-between group">
          <div>
            <p class="font-semibold">Demandes de réservation</p>
            <p class="text-sm text-muted-foreground mt-1">Gérer les demandes de votre point</p>
          </div>
          <ArrowRight class="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </RouterLink>
        <RouterLink to="/logistician/validation" class="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow flex items-center justify-between group">
          <div>
            <p class="font-semibold">Validation des annonces</p>
            <p class="text-sm text-muted-foreground mt-1">Valider les dons en attente</p>
          </div>
          <ArrowRight class="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </RouterLink>
        <RouterLink to="/logistician/transfers" class="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow flex items-center justify-between group">
          <div>
            <p class="font-semibold">Bons de cession</p>
            <p class="text-sm text-muted-foreground mt-1">Gérer les bons de votre point</p>
          </div>
          <ArrowRight class="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </RouterLink>
      </div>

      <!-- Pending reservations table -->
      <div class="rounded-xl border bg-card overflow-hidden">
        <div class="p-6 border-b flex justify-between items-center">
          <div>
            <h2 class="text-lg font-bold flex items-center gap-2"><ClipboardList class="h-5 w-5 text-primary" />Réservations en attente</h2>
            <p class="text-sm text-muted-foreground mt-0.5">Pour votre point de collecte : {{ stats.pointRelais?.nom }}</p>
          </div>
        </div>
        <div v-if="loading" class="p-6 space-y-3">
          <div v-for="i in 3" :key="i" class="h-12 bg-muted animate-pulse rounded"></div>
        </div>
        <div v-else-if="!requests.length" class="p-8 text-center text-muted-foreground">
          <Package class="h-12 w-12 mx-auto mb-3 opacity-40" /><p>Aucune demande en attente pour votre point.</p>
        </div>
        <table v-else class="w-full text-sm">
          <thead class="bg-muted/50 border-b">
            <tr class="text-left">
              <th class="px-6 py-3 font-semibold text-muted-foreground">Matériel</th>
              <th class="px-6 py-3 font-semibold text-muted-foreground">Bénéficiaire</th>
              <th class="px-6 py-3 font-semibold text-muted-foreground">Quantité</th>
              <th class="px-6 py-3 font-semibold text-muted-foreground">Date</th>
              <th class="px-6 py-3 font-semibold text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="req in requests" :key="req.id" class="hover:bg-muted/30 transition-colors">
              <td class="px-6 py-4 font-medium">{{ req.expand?.donation_id?.type_materiel }}</td>
              <td class="px-6 py-4 text-muted-foreground">{{ req.expand?.beneficiary_id?.prenom }} {{ req.expand?.beneficiary_id?.nom }}</td>
              <td class="px-6 py-4">{{ req.quantite_demandee }}</td>
              <td class="px-6 py-4 text-muted-foreground">{{ fmtDate(req.created) }}</td>
              <td class="px-6 py-4 text-right space-x-2">
                <button @click="openModal('validate', req)" class="inline-flex items-center gap-1 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
                  <Check class="h-3.5 w-3.5" />Valider
                </button>
                <button @click="openModal('reject', req)" class="inline-flex items-center gap-1 text-xs font-semibold border border-destructive text-destructive px-3 py-1.5 rounded-md hover:bg-destructive/10 transition-colors">
                  <X class="h-3.5 w-3.5" />Refuser
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <div v-if="activeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="w-full max-w-md bg-card rounded-xl shadow-2xl border p-6">
          <!-- Validate -->
          <template v-if="activeModal === 'validate'">
            <h3 class="text-xl font-bold mb-2">Valider la réservation</h3>
            <p class="text-sm text-muted-foreground mb-4">
              Confirmer la réservation de <strong>{{ selectedRequest?.quantite_demandee }}</strong> unité(s) de <strong>{{ selectedRequest?.expand?.donation_id?.type_materiel }}</strong> ?
            </p>
            <div class="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 text-sm text-primary mb-6">
              <FileSignature class="h-4 w-4 shrink-0 mt-0.5" />
              <span>Un bon de cession sera généré automatiquement et attribué à cette réservation.</span>
            </div>
            <div class="flex justify-end gap-3">
              <button @click="closeModal" :disabled="actionLoading" class="inline-flex items-center justify-center h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors">Annuler</button>
              <button @click="handleAction" :disabled="actionLoading" class="inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70">
                <Loader2 v-if="actionLoading" class="w-4 h-4 animate-spin" /><Check v-else class="w-4 h-4" />Confirmer
              </button>
            </div>
          </template>
          <!-- Reject -->
          <template v-else-if="activeModal === 'reject'">
            <h3 class="text-xl font-bold mb-2">Refuser la réservation</h3>
            <p class="text-sm text-muted-foreground mb-4">Veuillez indiquer le motif du refus qui sera communiqué au bénéficiaire.</p>
            <textarea v-model="rejectReason" rows="4" placeholder="Motif du refus..."
              class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-6"></textarea>
            <div class="flex justify-end gap-3">
              <button @click="closeModal" :disabled="actionLoading" class="inline-flex items-center justify-center h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors">Annuler</button>
              <button @click="handleAction" :disabled="actionLoading || !rejectReason.trim()" class="inline-flex items-center justify-center gap-2 h-10 px-4 bg-destructive text-destructive-foreground text-sm font-semibold rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-70">
                <Loader2 v-if="actionLoading" class="w-4 h-4 animate-spin" /><X v-else class="w-4 h-4" />Refuser
              </button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

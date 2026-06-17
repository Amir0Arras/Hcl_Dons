<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/context/authStore'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import { Check, X, Loader2, AlertCircle } from 'lucide-vue-next'

const auth = useAuthStore(); const { toast } = useToast()
const requests = ref([]); const loading = ref(true); const error = ref('')
const processingId = ref(null); const selectedRejectRequest = ref(null)
const motifRefus = ref(''); const isRejectDialogOpen = ref(false)

async function fetchRequests() {
  if (!auth.currentUser || auth.currentUser.role !== 'Logisticien') {
    error.value = "Accès non autorisé. Seuls les logisticiens peuvent voir cette page."; loading.value = false; return
  }
  if (!auth.currentUser.point_collecte_id) {
    error.value = "Aucun point de collecte n'est assigné à votre profil."; loading.value = false; return
  }
  try {
    loading.value = true; error.value = ''
    requests.value = await api.reservations.listForPoint(auth.currentUser.point_collecte_id)
  } catch {
    error.value = 'Impossible de charger les demandes de réservation.'
    toast({ title: 'Erreur lors du chargement des demandes', variant: 'destructive' })
  } finally { loading.value = false }
}

onMounted(fetchRequests)

async function handleValidate(req) {
  processingId.value = req.id
  try {
    const { certificate } = await api.reservations.approve(req.id, auth.currentUser.id)
    toast({ title: 'Réservation validée', description: `Bon ${certificate.numero} généré automatiquement.` })
    await fetchRequests()
  } catch(e) {
    toast({ title: e.message, variant: 'destructive' })
  } finally { processingId.value = null }
}

function openRejectDialog(req) { selectedRejectRequest.value = req; motifRefus.value = ''; isRejectDialogOpen.value = true }

async function handleReject() {
  if (!selectedRejectRequest.value) return
  processingId.value = selectedRejectRequest.value.id
  try {
    await api.reservations.reject(selectedRejectRequest.value.id, motifRefus.value)
    toast({ title: 'Réservation refusée' })
    isRejectDialogOpen.value = false
    await fetchRequests()
  } catch(e) {
    toast({ title: e.message, variant: 'destructive' })
  } finally { processingId.value = null }
}

function statusBadge(s) {
  if (s === 'Validée') return 'bg-green-100 text-green-800'
  if (s === 'Refusée') return 'bg-red-100 text-red-800'
  return 'bg-yellow-100 text-yellow-800'
}
function fmtDate(d) { return new Date(d).toLocaleDateString('fr-FR') }
</script>
<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Demandes de réservation</h1>
      <p class="text-muted-foreground mt-1">Toutes les demandes pour votre point de collecte</p>
    </div>

    <div v-if="error" class="flex items-start gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive">
      <AlertCircle class="h-5 w-5 shrink-0 mt-0.5" /><p>{{ error }}</p>
    </div>

    <div v-else-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-14 bg-muted animate-pulse rounded-xl"></div>
    </div>

    <div v-else-if="!requests.length" class="rounded-xl border-2 border-dashed p-16 text-center bg-muted/30">
      <p class="text-muted-foreground">Aucune demande de réservation pour votre point de collecte.</p>
    </div>

    <div v-else class="rounded-xl border bg-card overflow-hidden shadow-sm">
      <table class="w-full text-sm">
        <thead class="bg-muted/50 border-b">
          <tr class="text-left">
            <th class="px-6 py-3 font-semibold text-muted-foreground">Matériel</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Bénéficiaire</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Quantité</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Statut</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Date</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="req in requests" :key="req.id" class="hover:bg-muted/30 transition-colors">
            <td class="px-6 py-4 font-medium">{{ req.expand?.donation_id?.type_materiel }}</td>
            <td class="px-6 py-4 text-muted-foreground">{{ req.expand?.beneficiary_id?.prenom }} {{ req.expand?.beneficiary_id?.nom }}</td>
            <td class="px-6 py-4">{{ req.quantite_demandee }}</td>
            <td class="px-6 py-4">
              <span :class="['inline-flex items-center badge text-xs font-semibold px-2.5 py-0.5', statusBadge(req.status)]">{{ req.status }}</span>
            </td>
            <td class="px-6 py-4 text-muted-foreground">{{ fmtDate(req.created) }}</td>
            <td class="px-6 py-4 text-right space-x-2">
              <template v-if="req.status === 'En attente'">
                <button @click="handleValidate(req)" :disabled="processingId === req.id"
                  class="inline-flex items-center gap-1 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
                  <Loader2 v-if="processingId === req.id" class="h-3 w-3 animate-spin" /><Check v-else class="h-3.5 w-3.5" />Valider
                </button>
                <button @click="openRejectDialog(req)" :disabled="processingId === req.id"
                  class="inline-flex items-center gap-1 text-xs font-semibold border border-destructive text-destructive px-3 py-1.5 rounded-md hover:bg-destructive/10 transition-colors disabled:opacity-50">
                  <X class="h-3.5 w-3.5" />Refuser
                </button>
              </template>
              <div v-else-if="req.status === 'Refusée' && req.motif_refus" class="text-xs text-muted-foreground italic max-w-32 truncate">{{ req.motif_refus }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Reject dialog -->
    <Teleport to="body">
      <div v-if="isRejectDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="w-full max-w-md bg-card rounded-xl shadow-2xl border p-6">
          <h3 class="text-xl font-bold mb-2">Motif du refus</h3>
          <p class="text-sm text-muted-foreground mb-4">Ce motif sera communiqué au bénéficiaire.</p>
          <textarea v-model="motifRefus" rows="4" placeholder="Veuillez indiquer le motif du refus..."
            class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-6"></textarea>
          <div class="flex justify-end gap-3">
            <button @click="isRejectDialogOpen=false" class="inline-flex items-center justify-center h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors">Annuler</button>
            <button @click="handleReject" :disabled="!motifRefus.trim() || !!processingId"
              class="inline-flex items-center justify-center gap-2 h-10 px-4 bg-destructive text-destructive-foreground text-sm font-semibold rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-70">
              <Loader2 v-if="processingId" class="w-4 h-4 animate-spin" />Confirmer le refus
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

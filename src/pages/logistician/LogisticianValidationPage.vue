<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/context/authStore'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import { generateBonCessionPDF } from '@/services/pdfGenerator'
import { Check, X, Package, AlertCircle, Loader2, ArrowLeft, Download, FileText } from 'lucide-vue-next'

const auth = useAuthStore(); const router = useRouter(); const { toast } = useToast()
const requests = ref([]); const loading = ref(true); const actionLoading = ref(false)
const activeModal = ref(null); const selectedRequest = ref(null); const refusalReason = ref('')
const lastCertificate = ref(null)

async function fetchRequests() {
  loading.value = true
  try {
    if (!auth.currentUser?.point_collecte_id) throw new Error('Aucun point de collecte assigné à ce compte.')
    requests.value = await api.reservations.listForPoint(auth.currentUser.point_collecte_id, 'En attente')
  } catch(e) {
    toast({ title: e.message, variant: 'destructive' })
  } finally { loading.value = false }
}
onMounted(fetchRequests)

function openModal(type, req) { selectedRequest.value = req; refusalReason.value = ''; activeModal.value = type }
function closeModal() { activeModal.value = null; selectedRequest.value = null; refusalReason.value = '' }

async function handleAction() {
  if (!selectedRequest.value) return
  actionLoading.value = true
  try {
    if (activeModal.value === 'validate') {
      const { reservation, certificate } = await api.reservations.approve(selectedRequest.value.id, auth.currentUser.id)
      lastCertificate.value = certificate
      toast({ title: `Réservation validée`, description: `Bon ${certificate.numero} généré. Stock mis à jour automatiquement.` })
      activeModal.value = 'bon_genere'
    } else {
      if (!refusalReason.value.trim()) return toast({ title: 'Veuillez indiquer un motif', variant: 'destructive' })
      await api.reservations.reject(selectedRequest.value.id, refusalReason.value)
      toast({ title: 'Réservation refusée' })
      await fetchRequests(); closeModal()
    }
  } catch(e) {
    toast({ title: e.message, variant: 'destructive' })
  } finally { actionLoading.value = false }
}

function downloadBon() {
  if (!lastCertificate.value) return
  const c = lastCertificate.value
  generateBonCessionPDF(c, c.expand?.donation_id, c.expand?.beneficiary_id, c.expand?.logisticien_id, c.expand?.point_collecte_id)
}

async function closeBonModal() {
  lastCertificate.value = null
  closeModal()
  await fetchRequests()
}

function fmtDate(d) { return new Date(d).toLocaleDateString('fr-FR') }
</script>
<template>
  <div class="space-y-6">
    <div>
      <button @click="router.push('/logistician')" class="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-3 transition-colors">
        <ArrowLeft class="h-4 w-4" />Retour au tableau de bord
      </button>
      <h1 class="text-3xl font-bold tracking-tight">Validation des réservations</h1>
      <p class="text-muted-foreground mt-1">Demandes en attente pour votre point de collecte</p>
    </div>

    <div v-if="!auth.currentUser?.point_collecte_id" class="flex items-start gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive">
      <AlertCircle class="h-5 w-5 shrink-0 mt-0.5" /><p>Aucun point de collecte n'est assigné à votre profil.</p>
    </div>

    <div v-else-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-14 bg-muted animate-pulse rounded-xl"></div>
    </div>

    <div v-else-if="!requests.length" class="rounded-xl border-2 border-dashed p-16 text-center bg-muted/30">
      <Package class="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
      <p class="text-muted-foreground">Aucune demande en attente pour votre point.</p>
    </div>

    <div v-else class="rounded-xl border bg-card overflow-hidden shadow-sm">
      <table class="w-full text-sm">
        <thead class="bg-muted/50 border-b">
          <tr class="text-left">
            <th class="px-6 py-3 font-semibold text-muted-foreground">Matériel</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Bénéficiaire</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Quantité demandée</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Stock actuel</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Date</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="req in requests" :key="req.id" class="hover:bg-muted/30 transition-colors">
            <td class="px-6 py-4 font-medium">{{ req.expand?.donation_id?.type_materiel || '-' }}</td>
            <td class="px-6 py-4 text-muted-foreground">{{ req.expand?.beneficiary_id?.prenom }} {{ req.expand?.beneficiary_id?.nom }}</td>
            <td class="px-6 py-4 font-semibold">{{ req.quantite_demandee }}</td>
            <td class="px-6 py-4">
              <span :class="['font-semibold', req.expand?.donation_id?.quantite_initiale > req.quantite_demandee ? 'text-primary' : 'text-amber-600']">
                {{ req.expand?.donation_id?.quantite_initiale || 0 }}
              </span>
            </td>
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

    <!-- Modals -->
    <Teleport to="body">
      <div v-if="activeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="w-full max-w-md bg-card rounded-xl shadow-2xl border p-6">

          <!-- Validate -->
          <template v-if="activeModal === 'validate'">
            <h3 class="text-xl font-bold mb-4">Confirmer la validation</h3>
            <div class="bg-muted p-4 rounded-xl text-sm space-y-2 mb-4">
              <p><span class="text-muted-foreground">Matériel :</span> <strong>{{ selectedRequest?.expand?.donation_id?.type_materiel }}</strong></p>
              <p><span class="text-muted-foreground">Bénéficiaire :</span> <strong>{{ selectedRequest?.expand?.beneficiary_id?.prenom }} {{ selectedRequest?.expand?.beneficiary_id?.nom }}</strong></p>
              <p><span class="text-muted-foreground">Quantité demandée :</span> <strong class="text-primary">{{ selectedRequest?.quantite_demandee }} unité(s)</strong></p>
              <p><span class="text-muted-foreground">Stock actuel :</span> <strong>{{ selectedRequest?.expand?.donation_id?.quantite_initiale }}</strong></p>
            </div>
            <div class="flex items-start gap-2 p-3 bg-primary/5 border border-primary/10 rounded-xl text-sm text-primary mb-6">
              <FileText class="h-4 w-4 shrink-0 mt-0.5" />
              <span>Un bon de cession sera généré automatiquement et le stock sera décrémenté de {{ selectedRequest?.quantite_demandee }} unité(s).</span>
            </div>
            <div class="flex justify-end gap-3">
              <button @click="closeModal" :disabled="actionLoading" class="inline-flex items-center justify-center h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors">Annuler</button>
              <button @click="handleAction" :disabled="actionLoading" class="inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70">
                <Loader2 v-if="actionLoading" class="w-4 h-4 animate-spin" /><Check v-else class="w-4 h-4" />Confirmer
              </button>
            </div>
          </template>

          <!-- Bon généré -->
          <template v-else-if="activeModal === 'bon_genere'">
            <div class="text-center mb-6">
              <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Check class="h-7 w-7 text-green-600" />
              </div>
              <h3 class="text-xl font-bold mb-1">Réservation validée !</h3>
              <p class="text-sm text-muted-foreground">Le bon de cession a été généré automatiquement.</p>
            </div>
            <div class="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6 text-sm space-y-2">
              <div class="flex justify-between"><span class="text-muted-foreground">Numéro :</span><span class="font-mono font-bold text-primary">{{ lastCertificate?.numero }}</span></div>
              <div class="flex justify-between"><span class="text-muted-foreground">Matériel :</span><span class="font-medium">{{ lastCertificate?.expand?.donation_id?.type_materiel }}</span></div>
              <div class="flex justify-between"><span class="text-muted-foreground">Quantité :</span><span class="font-semibold">{{ lastCertificate?.quantite }} unité(s)</span></div>
              <div class="flex justify-between"><span class="text-muted-foreground">Bénéficiaire :</span><span class="font-medium">{{ lastCertificate?.expand?.beneficiary_id?.prenom }} {{ lastCertificate?.expand?.beneficiary_id?.nom }}</span></div>
            </div>
            <button @click="downloadBon" class="w-full inline-flex items-center justify-center gap-2 h-10 border border-primary text-primary text-sm font-semibold rounded-md hover:bg-primary/5 transition-colors mb-3">
              <Download class="h-4 w-4" />Télécharger le bon PDF
            </button>
            <button @click="closeBonModal" class="w-full inline-flex items-center justify-center h-10 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors">Fermer</button>
          </template>

          <!-- Reject -->
          <template v-else-if="activeModal === 'reject'">
            <h3 class="text-xl font-bold mb-2">Refuser la réservation</h3>
            <p class="text-sm text-muted-foreground mb-4">Indiquez le motif du refus (communiqué au bénéficiaire).</p>
            <textarea v-model="refusalReason" rows="4" placeholder="Motif du refus..."
              class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-6"></textarea>
            <div class="flex justify-end gap-3">
              <button @click="closeModal" :disabled="actionLoading" class="inline-flex items-center justify-center h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors">Annuler</button>
              <button @click="handleAction" :disabled="actionLoading || !refusalReason.trim()" class="inline-flex items-center justify-center gap-2 h-10 px-4 bg-destructive text-destructive-foreground text-sm font-semibold rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-70">
                <Loader2 v-if="actionLoading" class="w-4 h-4 animate-spin" /><X v-else class="w-4 h-4" />Refuser
              </button>
            </div>
          </template>

        </div>
      </div>
    </Teleport>
  </div>
</template>

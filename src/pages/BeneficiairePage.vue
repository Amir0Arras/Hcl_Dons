<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/context/authStore'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import { generateBonCessionPDF } from '@/services/pdfGenerator'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { Download, Clock, CheckCircle2, XCircle, Package, AlertCircle, PlusCircle, Loader2, FileText } from 'lucide-vue-next'

const auth = useAuthStore(); const { toast } = useToast()
const requests = ref([]); const certificates = ref({}); const loading = ref(true); const filter = ref('Toutes')
const isCreateModalOpen = ref(false); const availableDonations = ref([])
const newRequest = ref({ donation_id: '', quantite_demandee: 1 }); const isSubmitting = ref(false)
const selectedDonationStock = ref(0)

async function fetchRequests() {
  loading.value = true
  try {
    const reqs = await api.reservations.listForBeneficiary(auth.currentUser.id)
    requests.value = reqs
    // Charger les bons de cession pour les réservations validées
    const certMap = {}
    const allCerts = await api.certificates.listForBeneficiary(auth.currentUser.id)
    allCerts.forEach(c => { certMap[c.reservation_request_id] = c })
    certificates.value = certMap
  } finally { loading.value = false }
}

async function openCreateModal() {
  isCreateModalOpen.value = true
  newRequest.value = { donation_id: '', quantite_demandee: 1 }
  selectedDonationStock.value = 0
  try {
    availableDonations.value = await api.donations.list({ statut: 'Validée' })
  } catch { toast({ title: 'Erreur lors du chargement des dons', variant: 'destructive' }) }
}

function onDonationSelect() {
  const don = availableDonations.value.find(d => d.id === newRequest.value.donation_id)
  selectedDonationStock.value = don?.quantite_initiale || 0
  newRequest.value.quantite_demandee = 1
}

async function handleCreateRequest() {
  const user = auth.currentUser
  if (user.role !== 'Bénéficiaire')
    return toast({ title: "Seuls les Bénéficiaires peuvent faire une demande.", variant: 'destructive' })
  if (!newRequest.value.donation_id)
    return toast({ title: 'Veuillez sélectionner un don', variant: 'destructive' })
  const qty = parseInt(newRequest.value.quantite_demandee)
  if (isNaN(qty) || qty <= 0) return toast({ title: 'Quantité invalide', variant: 'destructive' })
  if (qty > selectedDonationStock.value)
    return toast({ title: `La quantité demandée (${qty}) dépasse le stock disponible (${selectedDonationStock.value})`, variant: 'destructive' })

  isSubmitting.value = true
  try {
    await api.reservations.create({ donation_id: newRequest.value.donation_id, quantite_demandee: qty }, user.id)
    toast({ title: 'Demande envoyée au logisticien !' })
    isCreateModalOpen.value = false
    await fetchRequests()
  } catch(e) {
    toast({ title: e.message || 'Erreur lors de la création de la demande', variant: 'destructive' })
  } finally { isSubmitting.value = false }
}

function downloadPDF(req) {
  const cert = certificates.value[req.id]
  if (!cert) return toast({ title: 'Bon de cession non disponible', variant: 'destructive' })
  generateBonCessionPDF(
    cert,
    cert.expand?.donation_id,
    cert.expand?.beneficiary_id,
    cert.expand?.logisticien_id,
    cert.expand?.point_collecte_id
  )
}

onMounted(fetchRequests)

const filteredRequests = computed(() =>
  filter.value === 'Toutes' ? requests.value : requests.value.filter(r => r.status === filter.value)
)

function statusBadge(s) {
  if (s === 'Validée') return 'bg-green-100 text-green-800'
  if (s === 'Refusée') return 'bg-red-100 text-red-800'
  return 'bg-yellow-100 text-yellow-800'
}
function fmtDate(d) { return new Date(d).toLocaleDateString('fr-FR') }
</script>
<template>
  <div class="min-h-screen bg-background flex flex-col">
    <Header />
    <main class="flex-1 py-12">
      <div class="container-custom max-w-5xl">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 class="text-3xl font-bold tracking-tight">Mes Demandes de Réservation</h1>
            <p class="text-muted-foreground mt-1">Suivez l'état de vos demandes de matériel médical</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button @click="openCreateModal"
              class="inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors shrink-0">
              <PlusCircle class="h-4 w-4" />Nouvelle demande
            </button>
            <select v-model="filter" class="flex h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-48">
              <option value="Toutes">Toutes les demandes</option>
              <option value="En attente">En attente</option>
              <option value="Validée">Validées</option>
              <option value="Refusée">Refusées</option>
            </select>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="h-36 bg-muted animate-pulse rounded-xl"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="!filteredRequests.length" class="rounded-xl border-2 border-dashed bg-muted/30 p-16 text-center">
          <Package class="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 class="text-lg font-medium mb-2">Aucune demande trouvée</h3>
          <p class="text-muted-foreground max-w-sm mx-auto mb-6">
            {{ filter === 'Toutes' ? "Vous n'avez pas encore fait de demande de réservation." : `Aucune demande avec le statut "${filter}".` }}
          </p>
          <button v-if="filter === 'Toutes'" @click="openCreateModal"
            class="inline-flex items-center gap-2 h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors">
            <PlusCircle class="h-4 w-4" />Faire une demande
          </button>
        </div>

        <!-- Liste des demandes -->
        <div v-else class="space-y-4">
          <div v-for="req in filteredRequests" :key="req.id"
            class="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div class="bg-muted/10 border-b p-6">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 class="text-xl font-bold text-primary mb-1">{{ req.expand?.donation_id?.type_materiel || 'Matériel inconnu' }}</h3>
                  <p class="text-sm text-muted-foreground">Demande effectuée le {{ fmtDate(req.created) }}</p>
                </div>
                <span :class="['inline-flex items-center gap-1.5 badge text-xs font-semibold px-3 py-1.5 rounded-full', statusBadge(req.status)]">
                  <CheckCircle2 v-if="req.status==='Validée'" class="w-3.5 h-3.5" />
                  <XCircle v-else-if="req.status==='Refusée'" class="w-3.5 h-3.5" />
                  <Clock v-else class="w-3.5 h-3.5" />
                  {{ req.status }}
                </span>
              </div>
            </div>
            <div class="p-6">
              <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between border-b pb-2">
                    <span class="text-muted-foreground">Quantité demandée :</span>
                    <span class="font-semibold">{{ req.quantite_demandee }} unité(s)</span>
                  </div>
                  <div v-if="req.expand?.donation_id?.estimation_prix" class="flex justify-between border-b pb-2">
                    <span class="text-muted-foreground">Valeur estimée :</span>
                    <span class="font-semibold">{{ req.expand.donation_id.estimation_prix }} € / unité</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span class="text-muted-foreground">Point de collecte :</span>
                    <span class="font-semibold">{{ req.expand?.donation_id?.expand?.point_collecte?.nom || '-' }}</span>
                  </div>
                </div>

                <div class="flex flex-col justify-center">
                  <!-- Refusée -->
                  <div v-if="req.status === 'Refusée'" class="flex items-start gap-2 p-3 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm">
                    <AlertCircle class="h-4 w-4 shrink-0 mt-0.5" />
                    <span><strong>Motif du refus :</strong> {{ req.motif_refus || 'Non spécifié' }}</span>
                  </div>

                  <!-- Validée avec bon de cession -->
                  <div v-else-if="req.status === 'Validée' && certificates[req.id]" class="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-3">
                    <div class="flex items-center gap-2 text-sm">
                      <FileText class="h-4 w-4 text-primary" />
                      <span class="font-semibold">Bon de cession généré</span>
                    </div>
                    <div class="text-sm space-y-1">
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">Numéro :</span>
                        <span class="font-mono font-bold text-primary">{{ certificates[req.id].numero }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-muted-foreground">Émis le :</span>
                        <span class="font-medium">{{ fmtDate(certificates[req.id].created) }}</span>
                      </div>
                    </div>
                    <button @click="downloadPDF(req)"
                      class="w-full inline-flex items-center justify-center gap-2 h-9 px-4 border border-primary text-primary text-sm font-semibold rounded-md hover:bg-primary/5 transition-colors">
                      <Download class="h-4 w-4" />Télécharger le bon PDF
                    </button>
                  </div>

                  <!-- En attente -->
                  <p v-else class="text-sm text-muted-foreground text-center italic p-4">
                    Votre demande est en cours d'examen par un logisticien.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />

    <!-- Modal création réservation avec choix de quantité -->
    <Teleport to="body">
      <div v-if="isCreateModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="w-full max-w-md bg-card rounded-xl shadow-2xl border p-6">
          <h3 class="text-xl font-bold mb-1">Nouvelle demande de réservation</h3>
          <p class="text-sm text-muted-foreground mb-6">Sélectionnez le matériel et indiquez la quantité souhaitée.</p>
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Matériel disponible *</label>
              <select v-model="newRequest.donation_id" @change="onDonationSelect"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Sélectionner un don</option>
                <option v-for="d in availableDonations" :key="d.id" :value="d.id">
                  {{ d.type_materiel }} — Dispo: {{ d.quantite_initiale }} unité(s)
                </option>
                <option v-if="!availableDonations.length" value="" disabled>Aucun matériel disponible</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Quantité demandée *</label>
              <input v-model="newRequest.quantite_demandee" type="number" min="1" :max="selectedDonationStock || undefined" required
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <p v-if="selectedDonationStock" class="text-xs text-muted-foreground">
                Maximum disponible : {{ selectedDonationStock }} unité(s)
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="isCreateModalOpen=false" :disabled="isSubmitting"
              class="inline-flex items-center justify-center h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors">Annuler</button>
            <button @click="handleCreateRequest" :disabled="isSubmitting || !availableDonations.length || !newRequest.donation_id"
              class="inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70">
              <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
              Envoyer la demande
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

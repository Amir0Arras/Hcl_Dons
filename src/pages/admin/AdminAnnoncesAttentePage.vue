<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import { Eye, Check, X, Package } from 'lucide-vue-next'

const { toast } = useToast()
const donations = ref([]); const loading = ref(true); const isProcessing = ref(false)
const selectedDonation = ref(null); const isDetailsOpen = ref(false)
const isRefuseOpen = ref(false); const donationToRefuse = ref(null)

async function fetchPendingDonations() {
  loading.value = true
  try { donations.value = await api.donations.list({ statut: 'En attente' }) }
  catch { toast({ title: 'Erreur lors du chargement', variant: 'destructive' }) }
  finally { loading.value = false }
}
onMounted(fetchPendingDonations)

async function handleValidate(id) {
  isProcessing.value = true
  try {
    await api.donations.validate(id)
    toast({ title: 'Annonce validée avec succès' })
    donations.value = donations.value.filter(d => d.id !== id)
    if (isDetailsOpen.value && selectedDonation.value?.id === id) isDetailsOpen.value = false
  } catch { toast({ title: 'Erreur lors de la validation', variant: 'destructive' }) }
  finally { isProcessing.value = false }
}

async function handleRefuse() {
  if (!donationToRefuse.value) return
  isProcessing.value = true
  try {
    await api.donations.archive(donationToRefuse.value.id)
    toast({ title: 'Annonce refusée' })
    donations.value = donations.value.filter(d => d.id !== donationToRefuse.value.id)
    isRefuseOpen.value = false
    if (isDetailsOpen.value && selectedDonation.value?.id === donationToRefuse.value.id) isDetailsOpen.value = false
  } catch { toast({ title: 'Erreur', variant: 'destructive' }) }
  finally { isProcessing.value = false }
}

function fmtDate(d) { return new Date(d).toLocaleDateString('fr-FR') }
</script>
<template>
  <div class="space-y-6">
    <div><h1 class="text-3xl font-bold tracking-tight text-slate-900">Annonces en attente</h1><p class="text-muted-foreground mt-1">Dons soumis par les donneurs en attente de validation.</p></div>

    <div v-if="loading" class="space-y-3"><div v-for="i in 5" :key="i" class="h-14 bg-muted animate-pulse rounded-xl"></div></div>

    <div v-else-if="!donations.length" class="rounded-xl border-2 border-dashed p-16 text-center bg-muted/30">
      <Package class="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
      <p class="text-muted-foreground">Aucune annonce en attente de validation.</p>
    </div>

    <div v-else class="rounded-xl border bg-card shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b">
          <tr class="text-left">
            <th class="px-6 py-3 font-semibold text-muted-foreground">Titre / Matériel</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Donateur</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Quantité</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Point de collecte</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Date</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="d in donations" :key="d.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 font-medium">{{ d.type_materiel }}</td>
            <td class="px-6 py-4 text-muted-foreground">{{ d.expand?.created_by?.nom || '-' }}</td>
            <td class="px-6 py-4">{{ d.quantite_initiale }}</td>
            <td class="px-6 py-4 text-muted-foreground">{{ d.expand?.point_collecte?.nom || '-' }}</td>
            <td class="px-6 py-4 text-muted-foreground">{{ fmtDate(d.created) }}</td>
            <td class="px-6 py-4 text-right space-x-2">
              <button @click="selectedDonation=d;isDetailsOpen=true" class="inline-flex items-center gap-1 text-xs font-semibold border border-border px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                <Eye class="h-3.5 w-3.5" />Détails
              </button>
              <button @click="handleValidate(d.id)" :disabled="isProcessing" class="inline-flex items-center gap-1 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
                <Check class="h-3.5 w-3.5" />Valider
              </button>
              <button @click="donationToRefuse=d;isRefuseOpen=true" :disabled="isProcessing" class="inline-flex items-center gap-1 text-xs font-semibold border border-destructive text-destructive px-3 py-1.5 rounded-md hover:bg-destructive/10 transition-colors disabled:opacity-50">
                <X class="h-3.5 w-3.5" />Refuser
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Details modal -->
    <Teleport to="body">
      <div v-if="isDetailsOpen && selectedDonation" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="w-full max-w-lg bg-card rounded-xl shadow-2xl border p-6">
          <h3 class="text-xl font-bold mb-4">{{ selectedDonation.type_materiel }}</h3>
          <div class="space-y-3 text-sm mb-6">
            <div class="flex justify-between"><span class="text-muted-foreground">Quantité</span><span class="font-medium">{{ selectedDonation.quantite_initiale }}</span></div>
            <div class="flex justify-between"><span class="text-muted-foreground">Estimation</span><span class="font-medium">{{ selectedDonation.estimation_prix }} €</span></div>
            <div class="flex justify-between"><span class="text-muted-foreground">Stérile</span><span class="font-medium">{{ selectedDonation.sterile ? 'Oui' : 'Non' }}</span></div>
            <div v-if="selectedDonation.date_expiration" class="flex justify-between"><span class="text-muted-foreground">Expiration</span><span class="font-medium">{{ fmtDate(selectedDonation.date_expiration) }}</span></div>
            <div class="flex justify-between"><span class="text-muted-foreground">Point</span><span class="font-medium">{{ selectedDonation.expand?.point_collecte?.nom || '-' }}</span></div>
            <div v-if="selectedDonation.localisation_libre" class="flex justify-between"><span class="text-muted-foreground">Localisation</span><span class="font-medium">{{ selectedDonation.localisation_libre }}</span></div>
          </div>
          <div class="flex justify-end gap-3">
            <button @click="isDetailsOpen=false" class="inline-flex items-center justify-center h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors">Fermer</button>
            <button @click="handleValidate(selectedDonation.id)" :disabled="isProcessing" class="inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70">
              <Check class="w-4 h-4" />Valider
            </button>
          </div>
        </div>
      </div>

      <!-- Refuse confirm -->
      <div v-if="isRefuseOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="w-full max-w-md bg-card rounded-xl shadow-2xl border p-6">
          <h3 class="text-xl font-bold mb-2">Confirmer le refus</h3>
          <p class="text-sm text-muted-foreground mb-6">Êtes-vous sûr de vouloir refuser l'annonce <strong>{{ donationToRefuse?.type_materiel }}</strong> ? Elle sera archivée.</p>
          <div class="flex justify-end gap-3">
            <button @click="isRefuseOpen=false" class="inline-flex items-center justify-center h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors">Annuler</button>
            <button @click="handleRefuse" :disabled="isProcessing" class="inline-flex items-center justify-center gap-2 h-10 px-4 bg-destructive text-destructive-foreground text-sm font-semibold rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-70">
              <X class="w-4 h-4" />Refuser
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

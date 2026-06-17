<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import { Check, X, RefreshCw, AlertCircle } from 'lucide-vue-next'

const { toast } = useToast()
const users = ref([]); const loading = ref(true); const isProcessing = ref(null)
const selectedUser = ref(null); const actionType = ref(null); const isAlertOpen = ref(false)

async function fetchPendingUsers() {
  loading.value = true
  try { users.value = await api.users.pending() }
  catch { toast({ title: 'Erreur lors du chargement', variant: 'destructive' }) }
  finally { loading.value = false }
}
onMounted(fetchPendingUsers)

function confirmAction(user, type) { selectedUser.value = user; actionType.value = type; isAlertOpen.value = true }

async function handleAction() {
  if (!selectedUser.value) return
  isProcessing.value = selectedUser.value.id
  try {
    if (actionType.value === 'approve') {
      await api.users.approve(selectedUser.value.id)
      toast({ title: `Compte de ${selectedUser.value.prenom} ${selectedUser.value.nom} approuvé avec succès` })
    } else {
      await api.users.reject(selectedUser.value.id)
      toast({ title: `Compte de ${selectedUser.value.prenom} ${selectedUser.value.nom} rejeté` })
    }
    await fetchPendingUsers()
  } catch(e) {
    toast({ title: e.message || 'Erreur', variant: 'destructive' })
  } finally { isProcessing.value = null; isAlertOpen.value = false; selectedUser.value = null }
}

function roleBadge(role) {
  if (role === 'Logisticien') return 'bg-blue-100 text-blue-800'
  if (role === 'Bénéficiaire') return 'bg-emerald-100 text-emerald-800'
  if (role === 'Donateur') return 'bg-gray-100 text-gray-700'
  return 'bg-purple-100 text-purple-800'
}
function fmtDate(d) { return new Date(d).toLocaleDateString('fr-FR') }
</script>
<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Validation des comptes</h1>
        <p class="text-muted-foreground mt-1">Approuvez ou rejetez les demandes d'inscription.</p>
      </div>
      <button @click="fetchPendingUsers" class="inline-flex items-center gap-2 text-sm font-medium border border-border px-3 py-2 rounded-lg hover:bg-muted transition-colors">
        <RefreshCw class="h-4 w-4" />Actualiser
      </button>
    </div>

    <div v-if="loading" class="space-y-3"><div v-for="i in 4" :key="i" class="h-14 bg-muted animate-pulse rounded-xl"></div></div>

    <div v-else-if="!users.length" class="rounded-xl border-2 border-dashed p-16 text-center bg-muted/30">
      <AlertCircle class="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
      <h3 class="text-lg font-medium mb-1">Aucun compte en attente</h3>
      <p class="text-sm text-muted-foreground">Tous les comptes ont été traités.</p>
    </div>

    <div v-else class="rounded-xl border bg-card shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b"><tr class="text-left">
          <th class="px-6 py-3 font-semibold text-muted-foreground">Nom complet</th>
          <th class="px-6 py-3 font-semibold text-muted-foreground">Email</th>
          <th class="px-6 py-3 font-semibold text-muted-foreground">Rôle</th>
          <th class="px-6 py-3 font-semibold text-muted-foreground text-right">Actions</th>
        </tr></thead>
        <tbody class="divide-y divide-border">
          <tr v-for="u in users" :key="u.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 font-medium">{{ u.prenom }} {{ u.nom }}</td>
            <td class="px-6 py-4 text-muted-foreground">{{ u.email }}</td>
            <td class="px-6 py-4"><span :class="['badge text-xs font-semibold px-2.5 py-0.5', roleBadge(u.role)]">{{ u.role }}</span></td>
            <td class="px-6 py-4 text-right space-x-2">
              <button @click="confirmAction(u, 'approve')" :disabled="isProcessing === u.id"
                class="inline-flex items-center gap-1 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
                <Check class="h-3.5 w-3.5" />Approuver
              </button>
              <button @click="confirmAction(u, 'reject')" :disabled="isProcessing === u.id"
                class="inline-flex items-center gap-1 text-xs font-semibold border border-destructive text-destructive px-3 py-1.5 rounded-md hover:bg-destructive/10 transition-colors disabled:opacity-50">
                <X class="h-3.5 w-3.5" />Rejeter
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirm dialog -->
    <Teleport to="body">
      <div v-if="isAlertOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="w-full max-w-md bg-card rounded-xl shadow-2xl border p-6">
          <h3 class="text-xl font-bold mb-2">{{ actionType === 'approve' ? 'Approuver le compte' : 'Rejeter le compte' }}</h3>
          <p class="text-sm text-muted-foreground mb-6">
            {{ actionType === 'approve'
              ? `Confirmer l'approbation du compte de ${selectedUser?.prenom} ${selectedUser?.nom} (${selectedUser?.email}) ?`
              : `Êtes-vous sûr de vouloir rejeter le compte de ${selectedUser?.prenom} ${selectedUser?.nom} ? Cette action est irréversible.` }}
          </p>
          <div class="flex justify-end gap-3">
            <button @click="isAlertOpen=false;selectedUser=null" class="inline-flex items-center justify-center h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors">Annuler</button>
            <button @click="handleAction" :disabled="!!isProcessing"
              :class="['inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold rounded-md transition-colors disabled:opacity-70',
                actionType === 'approve' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90']">
              <Check v-if="actionType==='approve'" class="w-4 h-4" /><X v-else class="w-4 h-4" />
              {{ actionType === 'approve' ? 'Approuver' : 'Rejeter' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import { Edit2, Loader2, Truck } from 'lucide-vue-next'

const { toast } = useToast()
const logisticians = ref([]); const points = ref([]); const loading = ref(true)
const isEditOpen = ref(false); const selectedUser = ref(null); const newPointId = ref(''); const saving = ref(false)

async function fetchData() {
  loading.value = true
  try { [logisticians.value, points.value] = await Promise.all([api.users.listLogisticians(), api.points.list()]) }
  catch { toast({ title: 'Erreur de chargement', variant: 'destructive' }) }
  finally { loading.value = false }
}
onMounted(fetchData)

function openEdit(u) { selectedUser.value = u; newPointId.value = u.point_collecte_id || ''; isEditOpen.value = true }

async function handleAssign() {
  if (!newPointId.value) return toast({ title: 'Sélectionnez un point de collecte', variant: 'destructive' })
  saving.value = true
  try {
    await api.users.assignPoint(selectedUser.value.id, newPointId.value)
    toast({ title: `Point de collecte mis à jour` })
    isEditOpen.value = false; await fetchData()
  } catch(e) { toast({ title: e.message, variant: 'destructive' }) }
  finally { saving.value = false }
}

function getPointName(id) { return points.value.find(p => p.id === id)?.nom || 'Non assigné' }
</script>
<template>
  <div class="space-y-6">
    <div class="flex justify-between items-start">
      <div><h1 class="text-3xl font-bold tracking-tight text-slate-900">Logisticiens</h1><p class="text-muted-foreground mt-1">Gérez les logisticiens et leur point de collecte assigné.</p></div>
      <RouterLink to="/admin/creer-utilisateur" class="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors">
        Créer un logisticien
      </RouterLink>
    </div>

    <div v-if="loading" class="space-y-3"><div v-for="i in 5" :key="i" class="h-14 bg-muted animate-pulse rounded-xl"></div></div>

    <div v-else-if="!logisticians.length" class="rounded-xl border-2 border-dashed p-16 text-center bg-muted/30">
      <Truck class="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
      <p class="text-muted-foreground">Aucun logisticien créé. Utilisez le bouton ci-dessus pour en créer un.</p>
    </div>

    <div v-else class="rounded-xl border bg-card shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b"><tr class="text-left">
          <th class="px-6 py-3 font-semibold text-muted-foreground">Nom complet</th>
          <th class="px-6 py-3 font-semibold text-muted-foreground">Email</th>
          <th class="px-6 py-3 font-semibold text-muted-foreground">Point de collecte assigné</th>
          <th class="px-6 py-3 font-semibold text-muted-foreground">Statut</th>
          <th class="px-6 py-3 font-semibold text-muted-foreground text-right">Actions</th>
        </tr></thead>
        <tbody class="divide-y divide-border">
          <tr v-for="u in logisticians" :key="u.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 font-medium">{{ u.prenom }} {{ u.nom }}</td>
            <td class="px-6 py-4 text-muted-foreground">{{ u.email }}</td>
            <td class="px-6 py-4">
              <span :class="u.point_collecte_id ? 'text-foreground font-medium' : 'text-destructive italic'">
                {{ getPointName(u.point_collecte_id) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span :class="['badge text-xs font-semibold px-2.5 py-0.5', u.verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800']">{{ u.verified ? 'Actif' : 'En attente' }}</span>
            </td>
            <td class="px-6 py-4 text-right">
              <button @click="openEdit(u)" class="inline-flex items-center gap-1 text-xs font-semibold border border-border px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                <Edit2 class="h-3.5 w-3.5" />Changer point
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit point modal -->
    <Teleport to="body">
      <div v-if="isEditOpen && selectedUser" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="w-full max-w-md bg-card rounded-xl shadow-2xl border p-6">
          <h3 class="text-xl font-bold mb-1">Assigner un point de collecte</h3>
          <p class="text-sm text-muted-foreground mb-6">{{ selectedUser.prenom }} {{ selectedUser.nom }} — {{ selectedUser.email }}</p>
          <div class="space-y-2 mb-6">
            <label class="text-sm font-medium">Point de collecte *</label>
            <select v-model="newPointId" class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">-- Sélectionner un point --</option>
              <option v-for="p in points" :key="p.id" :value="p.id">{{ p.nom }} — {{ p.ville }}</option>
            </select>
          </div>
          <div class="flex justify-end gap-3">
            <button @click="isEditOpen=false" class="inline-flex items-center justify-center h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors">Annuler</button>
            <button @click="handleAssign" :disabled="saving || !newPointId" class="inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70">
              <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

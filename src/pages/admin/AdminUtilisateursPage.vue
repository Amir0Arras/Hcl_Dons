<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'
import { Eye, User } from 'lucide-vue-next'

const users = ref([]); const loading = ref(true)
const selectedUser = ref(null); const isDetailsOpen = ref(false)
onMounted(async () => { users.value = await api.users.list(); loading.value = false })

function roleBadge(role) {
  if (role === 'Admin') return 'bg-purple-100 text-purple-800'
  if (role === 'Logisticien') return 'bg-blue-100 text-blue-800'
  if (role === 'Bénéficiaire') return 'bg-emerald-100 text-emerald-800'
  return 'bg-gray-100 text-gray-700'
}
function openDetails(u) { selectedUser.value = u; isDetailsOpen.value = true }
</script>
<template>
  <div class="space-y-6">
    <div><h1 class="text-3xl font-bold tracking-tight text-slate-900">Utilisateurs inscrits</h1><p class="text-muted-foreground mt-1">Gérez l'ensemble des comptes de la plateforme.</p></div>
    <div class="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div v-if="loading" class="p-6 space-y-3"><div v-for="i in 6" :key="i" class="h-12 bg-muted animate-pulse rounded"></div></div>
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 border-b"><tr class="text-left">
          <th class="px-6 py-3 font-semibold text-muted-foreground">Nom complet</th>
          <th class="px-6 py-3 font-semibold text-muted-foreground">Email</th>
          <th class="px-6 py-3 font-semibold text-muted-foreground">Rôle</th>
          <th class="px-6 py-3 font-semibold text-muted-foreground">Statut</th>
          <th class="px-6 py-3 font-semibold text-muted-foreground text-right">Actions</th>
        </tr></thead>
        <tbody class="divide-y divide-border">
          <tr v-for="u in users" :key="u.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 font-medium">{{ u.prenom }} {{ u.nom }}</td>
            <td class="px-6 py-4 text-muted-foreground">{{ u.email }}</td>
            <td class="px-6 py-4"><span :class="['badge text-xs font-semibold px-2.5 py-0.5', roleBadge(u.role)]">{{ u.role }}</span></td>
            <td class="px-6 py-4">
              <span :class="['badge text-xs font-semibold px-2.5 py-0.5', u.verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800']">
                {{ u.verified ? 'Vérifié' : 'En attente' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button @click="openDetails(u)" class="inline-flex items-center gap-1 text-xs font-semibold border border-border px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                <Eye class="h-3.5 w-3.5" />Détails
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="isDetailsOpen && selectedUser" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="w-full max-w-md bg-card rounded-xl shadow-2xl border p-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {{ selectedUser.prenom?.[0] }}{{ selectedUser.nom?.[0] }}
            </div>
            <div>
              <h3 class="text-xl font-bold">{{ selectedUser.prenom }} {{ selectedUser.nom }}</h3>
              <p class="text-sm text-muted-foreground">{{ selectedUser.email }}</p>
            </div>
          </div>
          <div class="space-y-3 text-sm mb-6">
            <div class="flex justify-between border-b pb-2"><span class="text-muted-foreground">Rôle</span><span :class="['badge text-xs font-semibold px-2.5 py-0.5', roleBadge(selectedUser.role)]">{{ selectedUser.role }}</span></div>
            <div class="flex justify-between border-b pb-2"><span class="text-muted-foreground">Statut</span><span :class="['badge text-xs font-semibold px-2.5 py-0.5', selectedUser.verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800']">{{ selectedUser.verified ? 'Vérifié' : 'En attente' }}</span></div>
            <div v-if="selectedUser.expand?.point_collecte_id" class="flex justify-between border-b pb-2">
              <span class="text-muted-foreground">Point de collecte</span>
              <span class="font-medium">{{ selectedUser.expand.point_collecte_id.nom }}</span>
            </div>
          </div>
          <button @click="isDetailsOpen=false" class="w-full inline-flex items-center justify-center h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors">Fermer</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

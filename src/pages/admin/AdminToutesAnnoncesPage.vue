<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'

const donations = ref([]); const loading = ref(true); const statusFilter = ref('Tous')
onMounted(async () => { donations.value = await api.donations.list(); loading.value = false })
const filtered = computed(() => statusFilter.value === 'Tous' ? donations.value : donations.value.filter(d => d.statut === statusFilter.value))

function statusClass(s) {
  if (s === 'Validée') return 'bg-emerald-100 text-emerald-800'
  if (s === 'En attente') return 'bg-amber-100 text-amber-800'
  if (s === 'Archivée') return 'bg-gray-100 text-gray-600'
  return 'bg-red-100 text-red-800'
}
function fmtDate(d) { return new Date(d).toLocaleDateString('fr-FR') }
</script>
<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div><h1 class="text-3xl font-bold tracking-tight text-slate-900">Toutes les annonces</h1><p class="text-muted-foreground mt-1">Historique complet des annonces de dons créées.</p></div>
      <select v-model="statusFilter" class="flex h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64">
        <option value="Tous">Tous les statuts</option>
        <option value="En attente">En attente</option>
        <option value="Validée">Validée</option>
        <option value="Archivée">Archivée / Refusée</option>
      </select>
    </div>
    <div class="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div v-if="loading" class="p-6 space-y-3"><div v-for="i in 5" :key="i" class="h-12 bg-muted animate-pulse rounded"></div></div>
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 border-b">
          <tr class="text-left">
            <th class="px-6 py-3 font-semibold text-muted-foreground">Titre / Matériel</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Donateur</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Quantité</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Statut</th>
            <th class="px-6 py-3 font-semibold text-muted-foreground">Date de création</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="d in filtered" :key="d.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 font-medium">{{ d.type_materiel }}</td>
            <td class="px-6 py-4 text-muted-foreground">{{ d.expand?.created_by?.nom || '-' }}</td>
            <td class="px-6 py-4">{{ d.quantite_initiale }}</td>
            <td class="px-6 py-4"><span :class="['badge text-xs font-semibold px-2.5 py-0.5', statusClass(d.statut)]">{{ d.statut }}</span></td>
            <td class="px-6 py-4 text-muted-foreground">{{ fmtDate(d.created) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

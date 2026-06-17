<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'
const donations = ref([]); const loading = ref(true)
onMounted(async () => { donations.value = await api.donations.list({ statut: 'Validée' }); loading.value = false })
function fmtDate(d) { return new Date(d).toLocaleDateString('fr-FR') }
</script>
<template>
  <div class="space-y-6">
    <div><h1 class="text-3xl font-bold tracking-tight text-slate-900">Dons validés</h1><p class="text-muted-foreground mt-1">Tous les dons actuellement disponibles sur la plateforme.</p></div>
    <div class="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div v-if="loading" class="p-6 space-y-3"><div v-for="i in 5" :key="i" class="h-12 bg-muted animate-pulse rounded"></div></div>
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 border-b"><tr class="text-left">
          <th class="px-6 py-3 font-semibold text-muted-foreground">Matériel</th>
          <th class="px-6 py-3 font-semibold text-muted-foreground">Quantité</th>
          <th class="px-6 py-3 font-semibold text-muted-foreground">Estimation</th>
          <th class="px-6 py-3 font-semibold text-muted-foreground">Point de collecte</th>
          <th class="px-6 py-3 font-semibold text-muted-foreground">Date</th>
        </tr></thead>
        <tbody class="divide-y divide-border">
          <tr v-for="d in donations" :key="d.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 font-medium">{{ d.type_materiel }}</td>
            <td class="px-6 py-4">{{ d.quantite_initiale }}</td>
            <td class="px-6 py-4">{{ d.estimation_prix }} €</td>
            <td class="px-6 py-4 text-muted-foreground">{{ d.expand?.point_collecte?.nom || '-' }}</td>
            <td class="px-6 py-4 text-muted-foreground">{{ fmtDate(d.created) }}</td>
          </tr>
          <tr v-if="!donations.length"><td colspan="5" class="px-6 py-12 text-center text-muted-foreground">Aucun don validé.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

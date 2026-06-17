<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/context/authStore'
import { AlertTriangle, Trash2 } from 'lucide-vue-next'

const router = useRouter(); const auth = useAuthStore()
const confirmed = ref(false)

function handleReset() {
  const keys = ['points_collecte','users','donations','reservations','transfer_certificates','currentUser','__seed_v3']
  keys.forEach(k => localStorage.removeItem(k))
  auth.logout()
  router.push('/')
  window.location.reload()
}
</script>
<template>
  <div class="space-y-6 max-w-2xl">
    <div><h1 class="text-3xl font-bold tracking-tight text-slate-900">Vider la base de données</h1><p class="text-muted-foreground mt-1">Réinitialise toutes les données localStorage.</p></div>
    <div class="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-6 space-y-4">
      <div class="flex items-start gap-3">
        <AlertTriangle class="h-6 w-6 text-destructive shrink-0 mt-0.5" />
        <div>
          <h3 class="font-bold text-destructive">Action irréversible</h3>
          <p class="text-sm text-muted-foreground mt-1">Cette action supprimera <strong>définitivement</strong> toutes les données : utilisateurs, dons, réservations, bons de cession, points de collecte. Les données de démonstration seront rechargées au prochain démarrage.</p>
        </div>
      </div>
      <div class="flex items-center gap-2 bg-white rounded-lg p-3 border border-destructive/20">
        <input type="checkbox" id="confirm" v-model="confirmed" class="w-4 h-4 rounded border-border text-destructive" />
        <label for="confirm" class="text-sm font-medium cursor-pointer">Je comprends que cette action est irréversible</label>
      </div>
      <button @click="handleReset" :disabled="!confirmed"
        class="inline-flex items-center gap-2 h-10 px-6 bg-destructive text-destructive-foreground text-sm font-semibold rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-40">
        <Trash2 class="h-4 w-4" />Vider la base de données
      </button>
    </div>
  </div>
</template>

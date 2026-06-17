<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import { Loader2, CheckCircle2 } from 'lucide-vue-next'

const { toast } = useToast()
const loading = ref(false); const points = ref([]); const createdUser = ref(null)

// Formulaire : uniquement les champs métier, PAS les métadonnées (id, created, updated, verified)
const formData = ref({
  nom: '',
  prenom: '',
  email: '',
  password: '',
  role: 'Bénéficiaire',
  point_collecte_id: ''   // obligatoire si role === 'Logisticien'
})

onMounted(async () => {
  try { points.value = await api.points.list() }
  catch { toast({ title: 'Impossible de charger les points relais', variant: 'destructive' }) }
})

const isLogisticien = computed(() => formData.value.role === 'Logisticien')

async function handleSubmit() {
  if (!formData.value.nom || !formData.value.email || !formData.value.password) {
    toast({ title: 'Veuillez remplir tous les champs obligatoires (Nom, Email, Mot de passe).', variant: 'destructive' }); return
  }
  if (isLogisticien.value && !formData.value.point_collecte_id) {
    toast({ title: 'Un point relais est OBLIGATOIRE pour le rôle Logisticien.', variant: 'destructive' }); return
  }

  loading.value = true; createdUser.value = null
  try {
    const user = await api.users.create({
      nom: formData.value.nom.trim(),
      prenom: formData.value.prenom.trim(),
      email: formData.value.email.trim(),
      password: formData.value.password,
      role: formData.value.role,
      point_collecte_id: isLogisticien.value ? formData.value.point_collecte_id : null
    })
    createdUser.value = { id: user.id, email: formData.value.email, password: formData.value.password }
    toast({ title: 'Utilisateur créé avec succès !' })
    // Reset
    formData.value = { nom:'', prenom:'', email:'', password:'', role:'Bénéficiaire', point_collecte_id:'' }
  } catch(e) {
    toast({ title: e.message || "Erreur lors de la création", variant: 'destructive' })
  } finally { loading.value = false }
}
</script>
<template>
  <div class="space-y-6">
    <div><h1 class="text-3xl font-bold tracking-tight text-slate-900">Créer un utilisateur</h1><p class="text-muted-foreground mt-1">Créez un compte utilisateur directement (compte validé automatiquement).</p></div>

    <!-- Success card -->
    <div v-if="createdUser" class="rounded-xl border border-green-200 bg-green-50 p-6 flex items-start gap-4">
      <CheckCircle2 class="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
      <div>
        <p class="font-semibold text-green-800">Utilisateur créé avec succès !</p>
        <div class="mt-2 text-sm text-green-700 space-y-1">
          <p>Email : <span class="font-mono font-semibold">{{ createdUser.email }}</span></p>
          <p>Mot de passe : <span class="font-mono font-semibold">{{ createdUser.password }}</span></p>
          <p class="text-xs text-green-600 mt-1">Transmettez ces identifiants à l'utilisateur.</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div class="bg-primary/5 border-b px-6 py-5">
        <h2 class="text-lg font-bold text-primary">Informations du compte</h2>
        <p class="text-xs text-muted-foreground mt-0.5">Seuls les champs métier sont requis. L'ID et les métadonnées sont générés automatiquement.</p>
      </div>
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none">Prénom</label>
            <input v-model="formData.prenom" placeholder="Jean"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none">Nom *</label>
            <input v-model="formData.nom" required placeholder="Dupont"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium leading-none">Adresse email *</label>
          <input v-model="formData.email" type="email" required placeholder="jean.dupont@exemple.com"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium leading-none">Mot de passe *</label>
          <input v-model="formData.password" type="password" required minlength="8"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium leading-none">Rôle</label>
          <select v-model="formData.role" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all">
            <option value="Admin">Admin</option>
            <option value="Logisticien">Logisticien</option>
            <option value="Bénéficiaire">Bénéficiaire</option>
            <option value="Donateur">Donateur</option>
            <option value="Partenaire">Partenaire</option>
          </select>
        </div>

        <!-- Point de collecte — affiché SEULEMENT si Logisticien -->
        <div v-if="isLogisticien" class="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <label class="text-sm font-medium leading-none text-primary">Point relais * <span class="text-xs font-normal text-muted-foreground">(obligatoire pour les logisticiens)</span></label>
          <select v-model="formData.point_collecte_id" :required="isLogisticien"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all">
            <option value="">-- Sélectionner un point relais --</option>
            <option v-for="p in points" :key="p.id" :value="p.id">{{ p.nom }} — {{ p.ville }}</option>
          </select>
          <p v-if="!points.length" class="text-xs text-destructive">Aucun point relais disponible. Créez-en un d'abord dans "Points relais".</p>
        </div>

        <div class="bg-muted/50 border-t -mx-6 px-6 py-4 mt-6 flex justify-end">
          <button type="submit" :disabled="loading"
            class="inline-flex items-center justify-center gap-2 h-10 px-6 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70">
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            Créer l'utilisateur
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

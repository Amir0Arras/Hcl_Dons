<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import { Plus, MapPin, Loader2, Trash2 } from 'lucide-vue-next'

const { toast } = useToast()
const points = ref([]); const loading = ref(true); const isModalOpen = ref(false); const saving = ref(false)
const isDeleteOpen = ref(false); const pointToDelete = ref(null)

// Champs métier uniquement : nom, adresse, ville, code_postal, telephone
const formData = ref({ nom: '', adresse: '', ville: '', code_postal: '', telephone: '' })

async function fetchPoints() {
  loading.value = true
  try { points.value = await api.points.list() }
  catch { toast({ title: 'Erreur lors du chargement', variant: 'destructive' }) }
  finally { loading.value = false }
}
onMounted(fetchPoints)

async function handleSubmit() {
  if (!formData.value.nom || !formData.value.adresse || !formData.value.ville) {
    toast({ title: 'Nom, adresse et ville sont obligatoires.', variant: 'destructive' }); return
  }
  saving.value = true
  try {
    await api.points.create({ ...formData.value })
    toast({ title: 'Point relais créé avec succès' })
    isModalOpen.value = false
    formData.value = { nom:'', adresse:'', ville:'', code_postal:'', telephone:'' }
    await fetchPoints()
  } catch(e) { toast({ title: e.message, variant: 'destructive' }) }
  finally { saving.value = false }
}

async function handleDelete() {
  if (!pointToDelete.value) return
  try {
    await api.points.delete(pointToDelete.value.id)
    toast({ title: 'Point relais supprimé' })
    isDeleteOpen.value = false; pointToDelete.value = null
    await fetchPoints()
  } catch(e) { toast({ title: e.message, variant: 'destructive' }) }
}
</script>
<template>
  <div class="space-y-6">
    <div class="flex justify-between items-start">
      <div><h1 class="text-3xl font-bold tracking-tight text-slate-900">Points relais</h1><p class="text-muted-foreground mt-1">Gérez les points de collecte de la plateforme.</p></div>
      <button @click="isModalOpen=true" class="inline-flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors">
        <Plus class="h-4 w-4" />Nouveau point
      </button>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="h-40 bg-muted animate-pulse rounded-xl"></div>
    </div>

    <div v-else-if="!points.length" class="rounded-xl border-2 border-dashed p-16 text-center bg-muted/30">
      <MapPin class="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
      <p class="text-muted-foreground">Aucun point de collecte. Créez-en un avec le bouton ci-dessus.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="p in points" :key="p.id" class="rounded-xl border bg-card shadow-sm p-5 space-y-3">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2"><MapPin class="h-5 w-5 text-primary shrink-0" /><h3 class="font-bold text-base">{{ p.nom }}</h3></div>
          <button @click="pointToDelete=p;isDeleteOpen=true" class="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"><Trash2 class="h-4 w-4" /></button>
        </div>
        <div class="text-sm text-muted-foreground space-y-1">
          <p>{{ p.adresse }}</p>
          <p>{{ p.code_postal }} {{ p.ville }}</p>
          <p v-if="p.telephone">{{ p.telephone }}</p>
        </div>
      </div>
    </div>

    <!-- Create modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="w-full max-w-lg bg-card rounded-xl shadow-2xl border p-6">
          <h3 class="text-xl font-bold mb-1">Nouveau point relais</h3>
          <p class="text-xs text-muted-foreground mb-6">Seuls les champs métier. L'identifiant est généré automatiquement.</p>
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Nom du point *</label>
              <input v-model="formData.nom" required placeholder="Ex: Point Central HCL Lyon"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Adresse *</label>
              <input v-model="formData.adresse" required placeholder="Ex: 3 Quai des Célestins"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Ville *</label>
                <input v-model="formData.ville" required placeholder="Lyon"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Code postal</label>
                <input v-model="formData.code_postal" placeholder="69002"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Téléphone</label>
              <input v-model="formData.telephone" placeholder="04 72 40 40 40"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="isModalOpen=false" :disabled="saving" class="inline-flex items-center justify-center h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors">Annuler</button>
            <button @click="handleSubmit" :disabled="saving" class="inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70">
              <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />Créer
            </button>
          </div>
        </div>
      </div>

      <!-- Delete confirm -->
      <div v-if="isDeleteOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="w-full max-w-md bg-card rounded-xl shadow-2xl border p-6">
          <h3 class="text-xl font-bold mb-2">Supprimer le point relais</h3>
          <p class="text-sm text-muted-foreground mb-6">Supprimer <strong>{{ pointToDelete?.nom }}</strong> ? Cette action est irréversible.</p>
          <div class="flex justify-end gap-3">
            <button @click="isDeleteOpen=false;pointToDelete=null" class="inline-flex items-center justify-center h-10 px-4 border border-border text-sm font-medium rounded-md hover:bg-muted transition-colors">Annuler</button>
            <button @click="handleDelete" class="inline-flex items-center justify-center gap-2 h-10 px-4 bg-destructive text-destructive-foreground text-sm font-semibold rounded-md hover:bg-destructive/90 transition-colors">
              <Trash2 class="w-4 h-4" />Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/context/authStore'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { Loader2, Upload, X, ImageIcon } from 'lucide-vue-next'

const auth = useAuthStore(); const router = useRouter(); const { toast } = useToast()
const loading = ref(false); const points = ref([])
const photoPreview = ref(null); const photoBase64 = ref(null)

const formData = ref({
  type_materiel: '',
  quantite_initiale: '',
  estimation_prix: '',
  sterile: false,
  date_expiration: '',
  point_collecte: '',
  localisation_libre: ''
})

onMounted(async () => {
  try { points.value = await api.points.list() }
  catch { toast({ title: 'Erreur lors du chargement des points de collecte', variant: 'destructive' }) }
})

function handleFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    toast({ title: 'Image trop lourde (max 5 Mo)', variant: 'destructive' })
    e.target.value = ''; return
  }
  photoPreview.value = URL.createObjectURL(file)
  const reader = new FileReader()
  reader.onload = ev => { photoBase64.value = ev.target.result } // data:image/...;base64,...
  reader.readAsDataURL(file)
}

function removePhoto() {
  photoPreview.value = null; photoBase64.value = null
  const inp = document.getElementById('photo-input')
  if (inp) inp.value = ''
}

async function handleSubmit() {
  const estimPrix = Number(formData.value.estimation_prix)
  const quantite = Number(formData.value.quantite_initiale)
  if (!formData.value.type_materiel || !formData.value.quantite_initiale || !formData.value.estimation_prix) {
    toast({ title: 'Veuillez remplir tous les champs obligatoires.', variant: 'destructive' }); return
  }
  if (isNaN(estimPrix) || estimPrix < 0) {
    toast({ title: "L'estimation de prix doit être ≥ 0.", variant: 'destructive' }); return
  }
  if (isNaN(quantite) || quantite < 1) {
    toast({ title: 'La quantité doit être au minimum de 1.', variant: 'destructive' }); return
  }
  loading.value = true
  try {
    await api.donations.create({
      type_materiel: formData.value.type_materiel.trim(),
      quantite_initiale: quantite,
      estimation_prix: estimPrix,
      sterile: formData.value.sterile,
      date_expiration: formData.value.date_expiration || null,
      point_collecte: formData.value.point_collecte || null,
      localisation_libre: formData.value.localisation_libre.trim(),
      photo: photoBase64.value   // base64 ou null
    }, auth.currentUser.id)
    toast({ title: 'Don créé avec succès et en attente de validation' })
    router.push('/donations')
  } catch(e) {
    toast({ title: e.message || 'Erreur lors de la création du don', variant: 'destructive' })
  } finally { loading.value = false }
}
</script>
<template>
  <div class="min-h-screen bg-background flex flex-col">
    <Header />
    <main class="flex-1 py-12">
      <div class="container-custom max-w-3xl">
        <div class="rounded-xl shadow-lg border-none bg-card overflow-hidden">
          <div class="bg-primary/5 border-b px-6 py-5">
            <h1 class="text-2xl font-bold text-primary">Déclarer un nouveau don</h1>
          </div>
          <form @submit.prevent="handleSubmit" class="p-6 space-y-6">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Type de matériel *</label>
                <input v-model="formData.type_materiel" required placeholder="Ex: Masques chirurgicaux"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Quantité *</label>
                <input v-model="formData.quantite_initiale" type="number" min="1" required
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Estimation globale (€) *</label>
                <input v-model="formData.estimation_prix" type="number" min="0" step="0.01" required placeholder="Ex: 150.00"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Date d'expiration</label>
                <input v-model="formData.date_expiration" type="date"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Point de collecte</label>
                <select v-model="formData.point_collecte"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  <option value="">Sélectionner un point</option>
                  <option v-for="p in points" :key="p.id" :value="p.id">{{ p.nom }} - {{ p.ville }}</option>
                </select>
              </div>
              <div class="flex items-center gap-3 bg-muted mt-6 px-4 rounded-lg h-10">
                <input type="checkbox" id="sterile" v-model="formData.sterile" class="w-4 h-4 rounded border-border" />
                <label for="sterile" class="text-sm font-medium cursor-pointer">Matériel stérile</label>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">Localisation précise (Optionnel)</label>
              <textarea v-model="formData.localisation_libre" placeholder="Ex: Bâtiment B, Étage 2, Salle 204" rows="3"
                class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"></textarea>
            </div>

            <!-- Photo upload avec prévisualisation -->
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">Photo du matériel</label>
              <div v-if="!photoPreview" class="relative">
                <label for="photo-input" class="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                  <ImageIcon class="h-8 w-8 text-muted-foreground mb-2" />
                  <span class="text-sm font-medium text-muted-foreground">Cliquez pour ajouter une photo</span>
                  <span class="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP — Max 5 Mo</span>
                  <input id="photo-input" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
                </label>
              </div>
              <div v-else class="relative rounded-xl overflow-hidden border border-border">
                <img :src="photoPreview" alt="Aperçu" class="w-full h-48 object-cover" />
                <button type="button" @click="removePhoto"
                  class="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
                  <X class="h-4 w-4" />
                </button>
                <div class="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs text-center py-1">Cliquez × pour changer la photo</div>
              </div>
            </div>

            <div class="bg-muted/50 border-t -mx-6 px-6 py-4 flex justify-end">
              <button type="submit" :disabled="loading"
                class="inline-flex items-center justify-center gap-2 h-10 px-6 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70">
                <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
                Enregistrer le don
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/context/authStore'
import { useToast } from '@/composables/useToast'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { Loader2, UserPlus } from 'lucide-vue-next'

const auth = useAuthStore(); const router = useRouter(); const { toast } = useToast()
const loading = ref(false)
// Champs identiques à l'original : nom, prenom, email, role, password, passwordConfirm
const form = ref({ nom: '', prenom: '', email: '', role: 'Bénéficiaire', password: '', passwordConfirm: '' })

async function handleSubmit() {
  if (form.value.password !== form.value.passwordConfirm)
    return toast({ title: 'Les mots de passe ne correspondent pas', variant: 'destructive' })
  loading.value = true
  try {
    await auth.signup({ email: form.value.email, password: form.value.password, nom: form.value.nom, prenom: form.value.prenom, role: form.value.role })
    toast({ title: 'Inscription réussie ! Votre compte est en attente de validation.' })
    router.push('/login')
  } catch(e) {
    toast({ title: e.message || "Erreur lors de l'inscription", variant: 'destructive' })
  } finally { loading.value = false }
}
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1">
      <div class="min-h-[80vh] flex items-center justify-center p-4">
        <div class="w-full max-w-lg rounded-xl shadow-lg border border-primary/10 bg-card overflow-hidden">
          <div class="space-y-1 text-center p-6 pb-2">
            <div class="flex justify-center mb-4">
              <div class="p-3 bg-primary/10 rounded-full"><UserPlus class="w-6 h-6 text-primary" /></div>
            </div>
            <h2 class="text-2xl font-bold tracking-tight">Créer un compte</h2>
            <p class="text-sm text-muted-foreground">Rejoignez la plateforme Dons Réemploi</p>
          </div>
          <form @submit.prevent="handleSubmit" class="p-6 pt-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Prénom</label>
                <input v-model="form.prenom" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Nom</label>
                <input v-model="form.nom" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">Adresse email</label>
              <input v-model="form.email" type="email" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">Je suis un...</label>
              <select v-model="form.role" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                <option value="Bénéficiaire">Bénéficiaire (Demander des dons)</option>
                <option value="Donateur">Donateur (Proposer des dons)</option>
                <option value="Partenaire">Partenaire</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Mot de passe</label>
                <input v-model="form.password" type="password" minlength="8" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none">Confirmation</label>
                <input v-model="form.passwordConfirm" type="password" minlength="8" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
            </div>
            <div class="pt-2 flex flex-col gap-4">
              <button type="submit" :disabled="loading"
                class="w-full inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70">
                <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
                S'inscrire
              </button>
              <p class="text-center text-sm text-muted-foreground">
                Déjà un compte ? <RouterLink to="/login" class="text-primary hover:underline font-medium">Se connecter</RouterLink>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/context/authStore'
import { useToast } from '@/composables/useToast'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { Loader2, LogIn } from 'lucide-vue-next'

const auth = useAuthStore(); const router = useRouter(); const { toast } = useToast()
const email = ref(''); const password = ref(''); const loading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) return
  loading.value = true
  try {
    const res = await auth.login(email.value, password.value)
    if (res.success) { toast({ title: 'Connexion réussie' }); router.push('/') }
    else toast({ title: 'Identifiants invalides ou compte non vérifié', variant: 'destructive' })
  } finally { loading.value = false }
}
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1">
      <div class="min-h-[80vh] flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl shadow-lg border border-primary/10 bg-card overflow-hidden">
          <div class="space-y-1 text-center p-6 pb-2">
            <div class="flex justify-center mb-4">
              <div class="p-3 bg-primary/10 rounded-full"><LogIn class="w-6 h-6 text-primary" /></div>
            </div>
            <h2 class="text-2xl font-bold tracking-tight">Bon retour</h2>
            <p class="text-sm text-muted-foreground">Connectez-vous pour accéder à votre espace</p>
          </div>
          <form @submit.prevent="handleLogin" class="p-6 pt-4 space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">Adresse email</label>
              <input v-model="email" type="email" placeholder="jean.dupont@exemple.com" required
                class="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none">Mot de passe</label>
              <input v-model="password" type="password" required
                class="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
            </div>
            <div class="pt-2 flex flex-col gap-4">
              <button type="submit" :disabled="loading"
                class="w-full inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70">
                <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
                Se connecter
              </button>
              <p class="text-center text-sm text-muted-foreground">
                Pas encore de compte ?
                <RouterLink to="/signup" class="text-primary hover:underline font-medium">S'inscrire</RouterLink>
              </p>
              <div class="text-xs text-muted-foreground bg-muted p-3 rounded-lg space-y-0.5">
                <p class="font-semibold mb-1">Comptes de démo :</p>
                <p>Admin : admin@dons.fr / Admin123</p>
                <p>Logisticien : logisticien@dons.fr / Log123</p>
                <p>Bénéficiaire : beneficiaire@dons.fr / Ben123</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

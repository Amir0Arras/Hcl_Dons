<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/context/authStore'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import { generateBonCessionPDF } from '@/services/pdfGenerator'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { FileText, Download } from 'lucide-vue-next'

const auth = useAuthStore(); const { toast } = useToast()
const certificates = ref([]); const loading = ref(true)

async function fetchCertificates() {
  loading.value = true
  try { certificates.value = await api.certificates.listForLogistician(auth.currentUser.id) }
  catch { toast({ title: 'Erreur lors du chargement des bons de cession', variant: 'destructive' }) }
  finally { loading.value = false }
}
onMounted(fetchCertificates)

function downloadPDF(cert) {
  generateBonCessionPDF(
    cert,
    cert.expand?.donation_id,
    cert.expand?.beneficiary_id,
    cert.expand?.logisticien_id,
    cert.expand?.point_collecte_id
  )
}

function fmtDate(d) { return new Date(d).toLocaleDateString('fr-FR') }
</script>
<template>
  <div class="min-h-screen bg-background flex flex-col">
    <Header />
    <main class="flex-1 py-12">
      <div class="container-custom max-w-6xl space-y-6">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Bons de cession</h1>
          <p class="text-muted-foreground mt-1">Bons générés automatiquement lors de vos validations de réservations.</p>
        </div>

        <div v-if="loading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-14 bg-muted animate-pulse rounded-xl"></div>
        </div>

        <div v-else-if="!certificates.length" class="rounded-xl border-2 border-dashed p-16 text-center bg-muted/30">
          <FileText class="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p class="text-muted-foreground">Aucun bon de cession. Ils sont générés automatiquement quand vous validez une réservation.</p>
        </div>

        <div v-else class="rounded-xl border bg-card shadow-sm overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-muted/50 border-b">
              <tr class="text-left">
                <th class="px-6 py-3 font-semibold text-muted-foreground">Numéro</th>
                <th class="px-6 py-3 font-semibold text-muted-foreground">Don</th>
                <th class="px-6 py-3 font-semibold text-muted-foreground">Bénéficiaire</th>
                <th class="px-6 py-3 font-semibold text-muted-foreground">Quantité</th>
                <th class="px-6 py-3 font-semibold text-muted-foreground">Statut</th>
                <th class="px-6 py-3 font-semibold text-muted-foreground">Date</th>
                <th class="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="cert in certificates" :key="cert.id" class="hover:bg-muted/30 transition-colors">
                <td class="px-6 py-4 font-mono text-xs font-bold text-primary">{{ cert.numero }}</td>
                <td class="px-6 py-4 font-medium">{{ cert.expand?.donation_id?.type_materiel }}</td>
                <td class="px-6 py-4 text-muted-foreground">{{ cert.expand?.beneficiary_id?.prenom }} {{ cert.expand?.beneficiary_id?.nom }}</td>
                <td class="px-6 py-4 font-semibold">{{ cert.quantite }}</td>
                <td class="px-6 py-4">
                  <span class="badge text-xs font-semibold px-2.5 py-0.5 bg-green-100 text-green-800">{{ cert.status }}</span>
                </td>
                <td class="px-6 py-4 text-muted-foreground">{{ fmtDate(cert.created) }}</td>
                <td class="px-6 py-4 text-right">
                  <button @click="downloadPDF(cert)" class="inline-flex items-center gap-1.5 text-xs font-semibold border border-primary text-primary px-3 py-1.5 rounded-md hover:bg-primary/5 transition-colors">
                    <Download class="h-3.5 w-3.5" />Télécharger PDF
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

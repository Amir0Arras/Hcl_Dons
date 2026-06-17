<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { Package, Shield, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-vue-next'

const features = [
  { icon: Package, title: 'Marketplace de dons', description: "Accédez à une plateforme centralisée pour consulter et réserver du matériel médical disponible en don." },
  { icon: Shield, title: 'Traçabilité complète', description: "Suivez chaque don depuis le dépôt jusqu'à la récupération avec des bons de cession archivés 10 ans." },
  { icon: BarChart3, title: "Gestion d'inventaire", description: "Visualisez en temps réel les stocks disponibles, les dates d'expiration et les points de collecte." },
]
const benefits = ['Réduction du gaspillage de matériel médical','Optimisation des ressources','Conformité RGPD et réglementaire','Processus de don simplifié et sécurisé','Traçabilité documentée pour audit','Accès multi-établissements']
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-1">
      <section class="relative min-h-[90vh] flex items-center bg-gradient-to-br from-primary/5 via-background to-secondary/20">
        <div class="absolute inset-0 opacity-40" style="background-image:url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIxOTZGMyIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')"></div>
        <div class="container-custom relative z-10 py-12">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance" style="letter-spacing:-0.02em">
                Gestion intelligente des dons de matériel médical
              </h1>
              <p class="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-prose">
                Optimisez la redistribution du matériel médical, réduisez le gaspillage et assurez une traçabilité complète grâce à la plateforme Dons Réemploi.
              </p>
              <div class="flex flex-col sm:flex-row gap-4">
                <RouterLink to="/signup" class="inline-flex items-center justify-center gap-2 h-11 px-8 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm">
                  Commencer maintenant <ArrowRight class="h-4 w-4" />
                </RouterLink>
                <RouterLink to="/donations" class="inline-flex items-center justify-center h-11 px-8 border border-border bg-background font-semibold rounded-lg hover:bg-muted transition-colors text-sm">
                  Parcourir les dons
                </RouterLink>
              </div>
            </div>
            <div>
              <img src="https://horizons-cdn.hostinger.com/53eead38-50c1-4af3-9ee4-0346afea2f50/logo-hcl-v4-HaR1S.png"
                alt="Dons Réemploi - Interface de marketplace pour matériel médical" class="w-full h-auto rounded-2xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section class="py-20 bg-background">
        <div class="container-custom">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold mb-4 text-balance">Une solution complète pour vos dons</h2>
            <p class="text-lg text-muted-foreground max-w-2xl mx-auto">Découvrez comment notre plateforme simplifie la gestion des dons de matériel médical</p>
          </div>
          <div class="grid md:grid-cols-2 gap-8 mb-16">
            <div v-for="f in features" :key="f.title" class="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl bg-card p-8">
              <div class="flex items-start gap-4">
                <div class="p-3 rounded-xl bg-primary/10"><component :is="f.icon" class="h-6 w-6 text-primary" /></div>
                <div class="flex-1"><h3 class="text-xl font-semibold mb-3">{{ f.title }}</h3><p class="text-muted-foreground leading-relaxed">{{ f.description }}</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-20 bg-muted">
        <div class="container-custom">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-3xl md:text-4xl font-bold mb-6 text-balance">Pourquoi choisir notre plateforme ?</h2>
              <p class="text-lg text-muted-foreground mb-8 leading-relaxed">Une solution développée spécifiquement pour répondre aux besoins des établissements de santé en matière de gestion des dons.</p>
              <ul class="space-y-4">
                <li v-for="b in benefits" :key="b" class="flex items-start gap-3">
                  <CheckCircle2 class="h-5 w-5 text-primary shrink-0 mt-0.5" /><span class="text-base">{{ b }}</span>
                </li>
              </ul>
            </div>
            <div class="bg-card rounded-2xl shadow-xl p-8 border">
              <div class="space-y-6">
                <div><div class="text-4xl font-bold text-primary mb-2">2,847</div><div class="text-sm text-muted-foreground">Dons traités cette année</div></div>
                <div><div class="text-4xl font-bold text-primary mb-2">47.2%</div><div class="text-sm text-muted-foreground">Réduction du gaspillage</div></div>
                <div><div class="text-4xl font-bold text-primary mb-2">12.4k</div><div class="text-sm text-muted-foreground">Équipements redistribués</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-20 bg-primary text-primary-foreground">
        <div class="container-custom">
          <div class="text-center max-w-3xl mx-auto">
            <h2 class="text-3xl md:text-4xl font-bold mb-6 text-balance">Prêt à optimiser vos dons de matériel ?</h2>
            <p class="text-lg mb-8 opacity-90 leading-relaxed">Rejoignez la plateforme Dons Réemploi et participez à une gestion responsable et efficace du matériel médical.</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <RouterLink to="/signup" class="inline-flex items-center justify-center gap-2 h-11 px-8 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/90 transition-colors text-sm">
                Créer un compte <ArrowRight class="h-4 w-4" />
              </RouterLink>
              <RouterLink to="/login" class="inline-flex items-center justify-center h-11 px-8 border border-primary-foreground/30 text-primary-foreground font-semibold rounded-lg hover:bg-primary-foreground/10 transition-colors text-sm bg-transparent">
                Se connecter
              </RouterLink>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
</template>

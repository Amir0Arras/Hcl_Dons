<script setup>
import { Mail, Phone, MapPin } from 'lucide-vue-next'
const LOGO = 'https://horizons-cdn.hostinger.com/53eead38-50c1-4af3-9ee4-0346afea2f50/e052ce15e031725f058b84c68a24f11a.png'
const year = new Date().getFullYear()
</script>
<template>
  <footer class="bg-secondary text-secondary-foreground border-t mt-auto">
    <div class="container-custom py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <img :src="LOGO" alt="Dons Réemploi" class="h-[45px] w-auto mb-4" />
          <p class="text-sm leading-relaxed">Plateforme de gestion et de redistribution de dons de matériel médical, engagée pour le réemploi responsable.</p>
        </div>
        <div>
          <h3 class="font-semibold mb-4">Liens rapides</h3>
          <ul class="space-y-2 text-sm">
            <li><RouterLink to="/" class="hover:text-primary transition-colors">Accueil</RouterLink></li>
            <li><RouterLink to="/donations" class="hover:text-primary transition-colors">Parcourir les dons</RouterLink></li>
            <li><RouterLink to="/login" class="hover:text-primary transition-colors">Connexion</RouterLink></li>
            <li><RouterLink to="/signup" class="hover:text-primary transition-colors">Inscription</RouterLink></li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold mb-4">Contact</h3>
          <ul class="space-y-3 text-sm">
            <li class="flex items-start gap-2"><MapPin class="h-4 w-4 mt-0.5 shrink-0" /><span>Siège social<br/>3 Quai des Célestins<br/>69002 Lyon</span></li>
            <li class="flex items-center gap-2"><Phone class="h-4 w-4 shrink-0" /><span>04 72 40 40 40</span></li>
            <li class="flex items-center gap-2"><Mail class="h-4 w-4 shrink-0" /><span>contact@dons-reemploi.fr</span></li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold mb-4">Informations légales</h3>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="hover:text-primary transition-colors">Politique de confidentialité</a></li>
            <li><a href="#" class="hover:text-primary transition-colors">Conditions d'utilisation</a></li>
            <li><a href="#" class="hover:text-primary transition-colors">Conformité RGPD</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <p>© {{ year }} Dons Réemploi. Tous droits réservés.</p>
        <p class="text-center md:text-right">Conformité RGPD - Conservation des données : 10 ans pour les bons de cession</p>
      </div>
    </div>
  </footer>
</template>

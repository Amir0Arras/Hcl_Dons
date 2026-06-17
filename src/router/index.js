import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/context/authStore'

// Public
import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import SignupPage from '@/pages/SignupPage.vue'

// Shared
import DonationsPage from '@/pages/DonationsPage.vue'
import DonationDetailPage from '@/pages/DonationDetailPage.vue'
import CreateDonationPage from '@/pages/CreateDonationPage.vue'

// Bénéficiaire
import BeneficiairePage from '@/pages/BeneficiairePage.vue'

// Logisticien
import LogisticianDashboard from '@/pages/logistician/LogisticianDashboard.vue'
import LogisticianValidationPage from '@/pages/logistician/LogisticianValidationPage.vue'
import LogisticianReservationsPage from '@/pages/logistician/LogisticianReservationsPage.vue'
import LogisticianTransferCertificatesPage from '@/pages/logistician/LogisticianTransferCertificatesPage.vue'

// Admin
import AdminLayout from '@/components/AdminLayout.vue'
import AdminDashboard from '@/pages/admin/AdminDashboard.vue'
import AdminAnnoncesAttentePage from '@/pages/admin/AdminAnnoncesAttentePage.vue'
import AdminToutesAnnoncesPage from '@/pages/admin/AdminToutesAnnoncesPage.vue'
import AdminDonsValidesPage from '@/pages/admin/AdminDonsValidesPage.vue'
import AdminValidationComptesPage from '@/pages/admin/AdminValidationComptesPage.vue'
import AdminUtilisateursPage from '@/pages/admin/AdminUtilisateursPage.vue'
import AdminCreateUserPage from '@/pages/admin/AdminCreateUserPage.vue'
import AdminLogisticiensPage from '@/pages/admin/AdminLogisticiensPage.vue'
import AdminPointsRelaisPage from '@/pages/admin/AdminPointsRelaisPage.vue'
import AdminViderBasePage from '@/pages/admin/AdminViderBasePage.vue'

const routes = [
  // Public
  { path: '/', component: HomePage },
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignupPage },

  // Shared authenticated
  { path: '/donations', component: DonationsPage },
  { path: '/donations/:id', component: DonationDetailPage },
  { path: '/create-donation', component: CreateDonationPage, meta: { requiresAuth: true } },

  // Bénéficiaire
  { path: '/beneficiary', component: BeneficiairePage, meta: { requiresAuth: true, roles: ['Bénéficiaire'] } },

  // Logisticien
  { path: '/logistician', component: LogisticianDashboard, meta: { requiresAuth: true, roles: ['Logisticien'] } },
  { path: '/logistician/validation', component: LogisticianValidationPage, meta: { requiresAuth: true, roles: ['Logisticien'] } },
  { path: '/logistician/reservations', component: LogisticianReservationsPage, meta: { requiresAuth: true, roles: ['Logisticien'] } },
  { path: '/logistician/transfers', component: LogisticianTransferCertificatesPage, meta: { requiresAuth: true, roles: ['Logisticien'] } },

  // Admin (avec AdminLayout = sidebar dark)
  {
    path: '/admin-dashboard',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['Admin'] },
    children: [{ path: '', component: AdminDashboard }]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['Admin'] },
    children: [
      { path: '', redirect: '/admin-dashboard' },
      { path: 'annonces-attente', component: AdminAnnoncesAttentePage },
      { path: 'annonces', component: AdminToutesAnnoncesPage },
      { path: 'dons-valides', component: AdminDonsValidesPage },
      { path: 'validation-comptes', component: AdminValidationComptesPage },
      { path: 'utilisateurs', component: AdminUtilisateursPage },
      { path: 'creer-utilisateur', component: AdminCreateUserPage },
      { path: 'logisticiens', component: AdminLogisticiensPage },
      { path: 'points-relais', component: AdminPointsRelaisPage },
      { path: 'vider-base', component: AdminViderBasePage },
    ]
  },

  // 404
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

// Navigation guard
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (auth.loading) return true

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }
  if (to.meta.roles && !to.meta.roles.includes(auth.currentUser?.role)) {
    return '/'
  }
})

export default router

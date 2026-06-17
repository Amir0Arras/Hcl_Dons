/**
 * API localStorage — 
 * Règles métier :
 * - Logisticien OBLIGATOIREMENT lié à un point_collecte_id (admin le crée avec)
 * - Logisticien traite UNIQUEMENT les dons/réservations de son point
 * - Admin valide les comptes (verified=false à l'inscription publique)
 * - Bénéficiaire choisit la quantité lors d'une réservation
 * - Validation réservation par logisticien → décrémente quantite_initiale du don + génère bon de cession auto
 * - Photo du don stockée en base64
 */

const D = 300
const delay = ms => new Promise(r => setTimeout(r, ms))
const get = k => { try { return JSON.parse(localStorage.getItem(k) || '[]') } catch { return [] } }
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v))

function seed() {
  if (localStorage.getItem('__seed_v4')) return
  set('points_collecte', [
    { id: 'pc1', nom: 'Point Central HCL Lyon', adresse: '162 av Lacassange', ville: 'Lyon', code_postal: '69002', telephone: '04 78 86 57 75' },
    { id: 'pc2', nom: 'Point Bron', adresse: '12 Rue de la Paix', ville: 'Bron', code_postal: '69500', telephone: '04 72 40 40 41' },
  ])
  set('users', [
    { id: 'u1', email: 'admin@chu-lyon.fr', password: 'Admin123', nom: 'Durand', prenom: 'Marie', role: 'Admin', verified: true, point_collecte_id: null },
    { id: 'u2', email: 'logisticien@chu-lyon.fr', password: 'Log123', nom: 'Martin', prenom: 'Pierre', role: 'Logisticien', verified: true, point_collecte_id: 'pc1' },
    { id: 'u3', email: 'logisticien2@chu-lyon.fr', password: 'Log123', nom: 'Bernard', prenom: 'Alice', role: 'Logisticien', verified: true, point_collecte_id: 'pc2' },
    { id: 'u4', email: 'beneficiaire@chu-lyon.fr', password: 'Ben123', nom: 'Leroy', prenom: 'Sophie', role: 'Bénéficiaire', verified: true, point_collecte_id: null },
    { id: 'u5', email: 'donateur@chu-lyon.fr', password: 'Don123', nom: 'Petit', prenom: 'Jean', role: 'Donateur', verified: true, point_collecte_id: null },
  ])
  set('donations', [
    { id: 'd1', type_materiel: 'Fauteuil roulant', quantite_initiale: 3, estimation_prix: 450, sterile: false, statut: 'Validée', point_collecte: 'pc1', localisation_libre: 'Bâtiment B, salle 12', date_expiration: null, photo: null, created_by: 'u5', created: new Date().toISOString() },
    { id: 'd2', type_materiel: 'Béquilles orthopédiques', quantite_initiale: 10, estimation_prix: 200, sterile: false, statut: 'En attente', point_collecte: 'pc1', localisation_libre: '', date_expiration: '2026-12-31', photo: null, created_by: 'u5', created: new Date().toISOString() },
    { id: 'd3', type_materiel: 'Masques FFP2', quantite_initiale: 100, estimation_prix: 80, sterile: true, statut: 'Validée', point_collecte: 'pc2', localisation_libre: '', date_expiration: '2026-06-30', photo: null, created_by: 'u5', created: new Date().toISOString() },
    { id: 'd4', type_materiel: 'Gants stériles', quantite_initiale: 200, estimation_prix: 60, sterile: true, statut: 'En attente', point_collecte: 'pc2', localisation_libre: '', date_expiration: null, photo: null, created_by: 'u5', created: new Date().toISOString() },
  ])
  set('reservations', [])
  set('transfer_certificates', [])
  localStorage.setItem('__seed_v4', '1')
}
seed()

function expandDonation(d) {
  const pts = get('points_collecte'), users = get('users')
  return { ...d, expand: { point_collecte: pts.find(p => p.id === d.point_collecte) || null, created_by: users.find(u => u.id === d.created_by) || null } }
}
function expandReservation(r) {
  const donations = get('donations'), users = get('users')
  const don = donations.find(d => d.id === r.donation_id)
  return { ...r, expand: { donation_id: don ? expandDonation(don) : null, beneficiary_id: users.find(u => u.id === r.beneficiary_id) || null } }
}
function expandCertificate(c) {
  const donations = get('donations'), users = get('users'), pts = get('points_collecte')
  const don = donations.find(d => d.id === c.donation_id)
  const benef = users.find(u => u.id === c.beneficiary_id)
  const log = users.find(u => u.id === c.logisticien_id)
  const point = pts.find(p => p.id === c.point_collecte_id)
  return { ...c, expand: { donation_id: don ? expandDonation(don) : null, beneficiary_id: benef || null, logisticien_id: log || null, point_collecte_id: point || null } }
}

export const api = {
  auth: {
    login: async (email, password) => {
      await delay(D)
      const u = get('users').find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
      if (!u) return { success: false, message: 'Identifiants invalides' }
      if (!u.verified) return { success: false, message: 'Compte en attente de validation par un administrateur' }
      return { success: true, user: u }
    },
    signup: async ({ email, password, nom, prenom, role }) => {
      await delay(D)
      const users = get('users')
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase()))
        throw new Error('Cet email est déjà utilisé')
      const user = { id: `u${Date.now()}`, email, password, nom, prenom, role, verified: false, point_collecte_id: null }
      users.push(user); set('users', users); return user
    }
  },

  points: {
    list: async () => { await delay(D); return get('points_collecte') },
    create: async ({ nom, adresse, ville, code_postal, telephone }) => {
      await delay(D)
      const pts = get('points_collecte')
      const pt = { id: `pc${Date.now()}`, nom, adresse, ville, code_postal, telephone }
      pts.push(pt); set('points_collecte', pts); return pt
    },
    delete: async (id) => { await delay(D); set('points_collecte', get('points_collecte').filter(p => p.id !== id)) }
  },

  users: {
    list: async () => {
      await delay(D)
      const pts = get('points_collecte')
      return get('users').map(u => ({ ...u, expand: { point_collecte_id: pts.find(p => p.id === u.point_collecte_id) || null } }))
    },
    listLogisticians: async () => {
      await delay(D)
      const pts = get('points_collecte')
      return get('users').filter(u => u.role === 'Logisticien').map(u => ({ ...u, expand: { point_collecte_id: pts.find(p => p.id === u.point_collecte_id) || null } }))
    },
    pending: async () => { await delay(D); return get('users').filter(u => !u.verified) },
    // Création user par admin : NOM, PRENOM, EMAIL, PASSWORD, ROLE, POINT_COLLECTE_ID (obligatoire si Logisticien)
    create: async ({ email, password, nom, prenom, role, point_collecte_id }) => {
      await delay(D)
      const users = get('users')
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase()))
        throw new Error('Cet email est déjà utilisé')
      if (role === 'Logisticien' && !point_collecte_id)
        throw new Error('Un point relais est OBLIGATOIRE pour le rôle Logisticien')
      const user = { id: `u${Date.now()}`, email, password, nom, prenom, role, verified: true, point_collecte_id: point_collecte_id || null }
      users.push(user); set('users', users); return user
    },
    assignPoint: async (userId, pointId) => {
      await delay(D)
      const users = get('users'); const i = users.findIndex(u => u.id === userId)
      if (i < 0) throw new Error('Utilisateur introuvable')
      users[i].point_collecte_id = pointId; set('users', users); return users[i]
    },
    approve: async (id) => {
      await delay(D)
      const users = get('users'); const i = users.findIndex(u => u.id === id)
      if (i < 0) throw new Error('Introuvable')
      users[i].verified = true; set('users', users); return users[i]
    },
    reject: async (id) => { await delay(D); set('users', get('users').filter(u => u.id !== id)) },
    delete: async (id) => { await delay(D); set('users', get('users').filter(u => u.id !== id)) }
  },

  donations: {
    list: async ({ statut = null, pointId = null } = {}) => {
      await delay(D)
      return get('donations')
        .filter(d => !statut || d.statut === statut)
        .filter(d => !pointId || d.point_collecte === pointId)
        .map(expandDonation).reverse()
    },
    get: async (id) => {
      await delay(D)
      const d = get('donations').find(d => d.id === id)
      return d ? expandDonation(d) : null
    },
    // Champs: type_materiel, quantite_initiale, estimation_prix, sterile, date_expiration, point_collecte, localisation_libre, photo (base64)
    create: async ({ type_materiel, quantite_initiale, estimation_prix, sterile, date_expiration, point_collecte, localisation_libre, photo }, userId) => {
      await delay(D)
      const docs = get('donations')
      const doc = {
        id: `d${Date.now()}`, type_materiel,
        quantite_initiale: Number(quantite_initiale),
        estimation_prix: Number(estimation_prix),
        sterile: Boolean(sterile),
        date_expiration: date_expiration || null,
        point_collecte: point_collecte || null,
        localisation_libre: localisation_libre || '',
        photo: photo || null, // base64 string
        statut: 'En attente', created_by: userId, created: new Date().toISOString()
      }
      docs.push(doc); set('donations', docs); return doc
    },
    validate: async (id) => {
      await delay(D)
      const docs = get('donations'); const i = docs.findIndex(d => d.id === id)
      if (i < 0) throw new Error('Don introuvable')
      docs[i].statut = 'Validée'; set('donations', docs); return docs[i]
    },
    archive: async (id) => {
      await delay(D)
      const docs = get('donations'); const i = docs.findIndex(d => d.id === id)
      docs[i].statut = 'Archivée'; set('donations', docs); return docs[i]
    },
    delete: async (id) => { await delay(D); set('donations', get('donations').filter(d => d.id !== id)) }
  },

  reservations: {
    listForBeneficiary: async (userId) => {
      await delay(D)
      return get('reservations').filter(r => r.beneficiary_id === userId).map(expandReservation).reverse()
    },
    listForPoint: async (pointId, statusFilter = null) => {
      await delay(D)
      return get('reservations')
        .filter(r => r.pickup_location_id === pointId)
        .filter(r => !statusFilter || r.status === statusFilter)
        .map(expandReservation).reverse()
    },
    // Bénéficiaire choisit la quantité (donation_id + quantite_demandee)
    create: async ({ donation_id, quantite_demandee }, userId) => {
      await delay(D)
      const dons = get('donations')
      const don = dons.find(d => d.id === donation_id)
      if (!don) throw new Error('Don introuvable')
      if (don.statut !== 'Validée') throw new Error("Ce don n'est plus disponible")
      const qty = Number(quantite_demandee)
      if (qty <= 0) throw new Error('Quantité invalide')
      if (qty > don.quantite_initiale) throw new Error(`La quantité demandée (${qty}) dépasse le stock disponible (${don.quantite_initiale})`)
      const items = get('reservations')
      const item = {
        id: `r${Date.now()}`, donation_id, beneficiary_id: userId,
        quantite_demandee: qty,
        pickup_location_id: don.point_collecte,
        status: 'En attente', motif_refus: '',
        created: new Date().toISOString()
      }
      items.push(item); set('reservations', items); return expandReservation(item)
    },

    // Logisticien valide → décrémente le stock + génère bon de cession automatiquement
    approve: async (reservationId, logisticienId) => {
      await delay(D)
      const items = get('reservations'); const i = items.findIndex(r => r.id === reservationId)
      if (i < 0) throw new Error('Réservation introuvable')
      const r = items[i]

      // 1. Décrémenter le stock du don
      const docs = get('donations'); const di = docs.findIndex(d => d.id === r.donation_id)
      if (di >= 0) {
        docs[di].quantite_initiale = Math.max(0, docs[di].quantite_initiale - r.quantite_demandee)
        if (docs[di].quantite_initiale === 0) docs[di].statut = 'Archivée' // épuisé
        set('donations', docs)
      }

      // 2. Marquer la réservation comme validée
      items[i].status = 'Validée'; set('reservations', items)

      // 3. Générer le bon de cession automatiquement
      const users = get('users')
      const log = users.find(u => u.id === logisticienId)
      const pts = get('points_collecte')
      const point = pts.find(p => p.id === r.pickup_location_id)
      const numero = `BC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      const certs = get('transfer_certificates')
      const cert = {
        id: `bc${Date.now()}`,
        numero,
        reservation_request_id: reservationId,
        donation_id: r.donation_id,
        beneficiary_id: r.beneficiary_id,
        logisticien_id: logisticienId,
        point_collecte_id: r.pickup_location_id,
        quantite: r.quantite_demandee,
        status: 'Signé',
        signature_digitale: `${log?.prenom || ''} ${log?.nom || ''}`.trim(),
        created: new Date().toISOString()
      }
      certs.push(cert); set('transfer_certificates', certs)

      return {
        reservation: expandReservation(items[i]),
        certificate: expandCertificate(cert)
      }
    },

    reject: async (reservationId, motifRefus) => {
      await delay(D)
      const items = get('reservations'); const i = items.findIndex(r => r.id === reservationId)
      if (i < 0) throw new Error('Réservation introuvable')
      items[i].status = 'Refusée'; items[i].motif_refus = motifRefus || ''
      set('reservations', items); return expandReservation(items[i])
    }
  },

  certificates: {
    listForLogistician: async (logisticienId) => {
      await delay(D)
      return get('transfer_certificates').filter(c => c.logisticien_id === logisticienId).map(expandCertificate).reverse()
    },
    listForBeneficiary: async (beneficiaryId) => {
      await delay(D)
      return get('transfer_certificates').filter(c => c.beneficiary_id === beneficiaryId).map(expandCertificate).reverse()
    },
    getByReservation: async (reservationId) => {
      await delay(D)
      const c = get('transfer_certificates').find(c => c.reservation_request_id === reservationId)
      return c ? expandCertificate(c) : null
    },
    sign: async (id, signature) => {
      await delay(D)
      const certs = get('transfer_certificates'); const i = certs.findIndex(c => c.id === id)
      if (i < 0) throw new Error('Bon introuvable')
      certs[i].status = 'Signé'; certs[i].signature_digitale = signature
      set('transfer_certificates', certs); return expandCertificate(certs[i])
    }
  },

  stats: {
    global: async () => {
      await delay(D)
      const donations = get('donations'), users = get('users'), pts = get('points_collecte'), certs = get('transfer_certificates')
      return {
        totalUsers: users.filter(u => u.verified).length,
        logisticians: users.filter(u => u.role === 'Logisticien').length,
        collectionPoints: pts.length,
        pendingDonations: donations.filter(d => d.statut === 'En attente').length,
        validatedDonations: donations.filter(d => d.statut === 'Validée').length,
        totalCertificates: certs.length,
        totalEstimate: donations.reduce((s, d) => s + (Number(d.estimation_prix) || 0), 0),
        usersByRole: [
          { name: 'Admin', value: users.filter(u => u.role === 'Admin').length },
          { name: 'Logisticien', value: users.filter(u => u.role === 'Logisticien').length },
          { name: 'Bénéficiaire', value: users.filter(u => u.role === 'Bénéficiaire').length },
          { name: 'Donateur', value: users.filter(u => u.role === 'Donateur').length },
        ]
      }
    },
    byPoint: async (pointId) => {
      await delay(D)
      const donations = get('donations').filter(d => d.point_collecte === pointId)
      const reservations = get('reservations').filter(r => r.pickup_location_id === pointId)
      const certs = get('transfer_certificates').filter(c => c.point_collecte_id === pointId)
      return {
        totalDonations: donations.reduce((s, d) => s + (Number(d.estimation_prix) || 0), 0),
        pendingDonations: donations.filter(d => d.statut === 'En attente').length,
        validatedDonations: donations.filter(d => d.statut === 'Validée').length,
        pendingReservations: reservations.filter(r => r.status === 'En attente').length,
        certificates: certs.length
      }
    }
  }
}

/**
 * Génère un bon de cession PDF (HTML → window.print) téléchargeable.
 * Compatible avec tous les navigateurs, sans dépendance externe.
 */
export function generateBonCessionPDF(cert, donation, beneficiary, logisticien, point) {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Bon de Cession ${cert.numero}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Arial', sans-serif; color: #1a1a1a; background: #fff; padding: 40px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #0f766e; padding-bottom:20px; margin-bottom:30px; }
    .logo-section h1 { font-size:22px; color:#0f766e; font-weight:700; }
    .logo-section p { font-size:12px; color:#666; margin-top:4px; }
    .doc-info { text-align:right; }
    .doc-info .numero { font-size:18px; font-weight:700; color:#0f766e; font-family:monospace; }
    .doc-info .date { font-size:12px; color:#666; margin-top:4px; }
    .badge { display:inline-block; background:#dcfce7; color:#15803d; border:1px solid #86efac; border-radius:6px; padding:4px 12px; font-size:12px; font-weight:700; margin-top:8px; }
    h2 { font-size:16px; font-weight:700; color:#0f766e; margin:20px 0 12px; border-left:4px solid #0f766e; padding-left:10px; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
    .section { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; }
    .section h3 { font-size:12px; font-weight:700; text-transform:uppercase; color:#64748b; margin-bottom:12px; letter-spacing:0.05em; }
    .row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #e2e8f0; font-size:13px; }
    .row:last-child { border-bottom:none; }
    .row label { color:#64748b; }
    .row span { font-weight:600; }
    .highlight { background:#f0fdf4; border-color:#86efac; }
    .signature-section { margin-top:40px; display:grid; grid-template-columns:1fr 1fr; gap:40px; }
    .sig-box { border:2px solid #e2e8f0; border-radius:8px; padding:20px; text-align:center; }
    .sig-box h4 { font-size:12px; font-weight:700; text-transform:uppercase; color:#64748b; margin-bottom:16px; }
    .sig-line { border-bottom:2px solid #0f766e; min-height:60px; margin-bottom:8px; display:flex; align-items:flex-end; justify-content:center; padding-bottom:4px; font-size:14px; font-style:italic; color:#0f766e; font-weight:600; }
    .sig-label { font-size:11px; color:#94a3b8; }
    .footer { margin-top:40px; padding-top:16px; border-top:1px solid #e2e8f0; font-size:10px; color:#94a3b8; text-align:center; }
    @media print {
      body { padding:20px; }
      .no-print { display:none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      <h1>🏥 Dons Réemploi — HCL</h1>
      <p>Plateforme de gestion des dons de matériel médical</p>
      <p>${point?.adresse || ''} — ${point?.ville || ''}</p>
    </div>
    <div class="doc-info">
      <div class="numero">${cert.numero}</div>
      <div class="date">Émis le ${new Date(cert.created).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}</div>
      <div class="badge">✓ BON DE CESSION VALIDÉ</div>
    </div>
  </div>

  <h2>Informations du don</h2>
  <div class="section highlight">
    <div class="row"><label>Matériel</label><span>${donation?.type_materiel || '-'}</span></div>
    <div class="row"><label>Quantité cédée</label><span>${cert.quantite} unité(s)</span></div>
    <div class="row"><label>Estimation de valeur</label><span>${donation?.estimation_prix || 0} €</span></div>
    <div class="row"><label>Stérilité</label><span>${donation?.sterile ? '✓ Stérile' : 'Non stérile'}</span></div>
    ${donation?.date_expiration ? `<div class="row"><label>Date d'expiration</label><span>${new Date(donation.date_expiration).toLocaleDateString('fr-FR')}</span></div>` : ''}
    ${donation?.localisation_libre ? `<div class="row"><label>Localisation</label><span>${donation.localisation_libre}</span></div>` : ''}
  </div>

  <div class="grid">
    <div>
      <h2>Bénéficiaire</h2>
      <div class="section">
        <div class="row"><label>Nom</label><span>${beneficiary?.prenom || ''} ${beneficiary?.nom || ''}</span></div>
        <div class="row"><label>Email</label><span>${beneficiary?.email || '-'}</span></div>
        <div class="row"><label>Rôle</label><span>${beneficiary?.role || '-'}</span></div>
      </div>
    </div>
    <div>
      <h2>Point de collecte</h2>
      <div class="section">
        <div class="row"><label>Nom</label><span>${point?.nom || '-'}</span></div>
        <div class="row"><label>Adresse</label><span>${point?.adresse || '-'}</span></div>
        <div class="row"><label>Ville</label><span>${point?.ville || '-'}</span></div>
        ${point?.telephone ? `<div class="row"><label>Tél.</label><span>${point.telephone}</span></div>` : ''}
      </div>
    </div>
  </div>

  <div class="signature-section">
    <div class="sig-box">
      <h4>Signature du Logisticien</h4>
      <div class="sig-line">${cert.signature_digitale || (logisticien?.prenom || '') + ' ' + (logisticien?.nom || '')}</div>
      <div class="sig-label">${logisticien?.prenom || ''} ${logisticien?.nom || ''} — Logisticien</div>
    </div>
    <div class="sig-box">
      <h4>Signature du Bénéficiaire</h4>
      <div class="sig-line"></div>
      <div class="sig-label">${beneficiary?.prenom || ''} ${beneficiary?.nom || ''} — À compléter</div>
    </div>
  </div>

  <div class="footer">
    <p>Document généré automatiquement par la plateforme Dons Réemploi — Conforme RGPD — Conservation obligatoire 10 ans</p>
    <p>Bon n° ${cert.numero} | ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
  </div>

  <div class="no-print" style="text-align:center;margin-top:30px">
    <button onclick="window.print()" style="padding:12px 32px;background:#0f766e;color:white;border:none;border-radius:8px;font-size:16px;font-weight:700;cursor:pointer;">
      📄 Télécharger / Imprimer le PDF
    </button>
    <button onclick="window.close()" style="margin-left:12px;padding:12px 32px;background:#e2e8f0;color:#333;border:none;border-radius:8px;font-size:16px;cursor:pointer;">
      Fermer
    </button>
  </div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

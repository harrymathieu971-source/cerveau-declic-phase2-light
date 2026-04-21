# Deployment Checklist — Phase 2 LIGHT

**Durée totale:** ~4 heures (à faire en parallèle)

---

## 📋 BLOC 1: Infra Google (30 min)

### ✅ 1.1 Créer Google Sheets CRM
- [ ] Aller à https://drive.google.com
- [ ] Créer "New Sheet" → Renommer "Apporteurs CRM Charles Harry"
- [ ] Ajouter 4 onglets: `Contacts`, `Deals`, `Commissions`, `Historique`
- [ ] Ajouter en-têtes dans chaque onglet (voir PHASE-2-LIGHT-PLAN.md section 1.2)

**Résultat:** URL du Sheets (https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit)

### ✅ 1.2 Créer Service Account Google Cloud
- [ ] Aller à https://console.cloud.google.com
- [ ] Créer projet "charles-crm-apporteurs"
- [ ] APIs & Services → Enable "Google Sheets API"
- [ ] Credentials → Create Service Account → Nom: `cerveau-declic-sheets-v11`
- [ ] Grant role: **Editor**
- [ ] Create Key → JSON → Télécharger

**Résultat:** Fichier JSON téléchargé (garder en sécurité)

### ✅ 1.3 Partager Sheets avec Service Account
- [ ] Copier email service account (format: `xxxxx@xxxxx.iam.gserviceaccount.com`)
- [ ] Ouvrir Sheets créé
- [ ] Share → Ajouter email service account
- [ ] Permission: **Editor**

**Résultat:** Service Account a accès au Sheets

### ✅ 1.4 Extraire Spreadsheet ID
- [ ] Copier Spreadsheet ID depuis URL du Sheets
- [ ] Format: `https://docs.google.com/spreadsheets/d/[ID]/edit` → [ID]

**Résultat à noter:** `SPREADSHEET_ID = abc123...`

---

## 📋 BLOC 2: Vérifications HubSpot (15 min)

### ✅ 2.1 Vérifier propriétés Contact
- [ ] HubSpot → Settings → Custom Properties → Contact
- [ ] Chercher "Cumul 2026 montant apporteur"
- [ ] Vérifier type: **Number**
- [ ] ✅ Propriétés existantes: 2026, 2027, 2028, 2029, 2030

### ✅ 2.2 Vérifier propriétés Deal/Transaction
- [ ] HubSpot → Settings → Custom Properties → Deal/Transaction
- [ ] Chercher "Cumul 2026 encaissement mandat"
- [ ] Vérifier type: **Number**
- [ ] ✅ Propriétés existantes: 2026, 2027, 2028, 2029, 2030

### ✅ 2.3 Récupérer API Key HubSpot
- [ ] HubSpot Settings → Integrations → API keys
- [ ] Créer nouvelle clé (ou copier existante)
- [ ] Scope: `crm.objects.contacts.write`

**Résultat à noter:** `HUBSPOT_API_KEY = pat-xxx...`

---

## 📋 BLOC 3: Vérifications Resend (5 min)

### ✅ 3.1 Vérifier API Key
- [ ] Aller à https://resend.com/api-keys
- [ ] Copier clé existante ou créer nouvelle

**Résultat à noter:** `RESEND_API_KEY = re_xxx...`

### ✅ 3.2 Vérifier domaine
- [ ] https://resend.com/domains
- [ ] Confirmer domaine `simulateur@immobilierlieusaint.fr` ✅

---

## 📋 BLOC 4: Cloudflare Worker Setup (30 min)

### ✅ 4.1 Préparation locale
- [ ] Clone ou ouvrir dossier projet cerveau-declic
- [ ] Copier `cerveau-declic-v11-light.js` dans le dossier
- [ ] Copier `wrangler.toml` dans le dossier

### ✅ 4.2 Configuration wrangler.toml
- [ ] Ouvrir `wrangler.toml`
- [ ] Remplacer `YOUR_ACCOUNT_ID` → récupérer via `wrangler whoami`
- [ ] Remplacer `YOUR_ZONE_ID` → récupérer depuis dashboard Cloudflare
- [ ] Remplir les `vars` pour production:

```toml
[env.production]
vars = {
  SPREADSHEET_ID = "abc123...",
  RESEND_API_KEY = "re_xxx...",
  HUBSPOT_API_KEY = "pat_xxx..."
}
```

### ✅ 4.3 Configuration Secrets
```bash
# Terminal
wrangler secret put SERVICE_ACCOUNT_JSON --env production

# Coller le contenu COMPLET du JSON (avec les \n)
# Puis Ctrl+D pour terminer
```

### ✅ 4.4 Test local
```bash
# Dans le dossier cerveau-declic
wrangler dev --env development
```

Tester avec curl:
```bash
curl -X POST http://localhost:8787/calcul-commission-apporteur \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": "test-123",
    "montantHT": 100000,
    "apporteurType": "Particulier",
    "apporteurEmail": "test@example.com",
    "contactId": 999
  }'
```

**Résultat attendu:** `{ "success": true, "commission": 200, ... }`

---

## 📋 BLOC 5: Déploiement Production (30 min)

### ✅ 5.1 Déployer Worker
```bash
wrangler deploy --env production
```

**Résultat:** URL de déploiement (ex: https://cerveau-declic-v11.xxx.workers.dev)

### ✅ 5.2 Tester ping
```bash
curl -X GET https://cerveau-declic-v11.xxx.workers.dev/ping
```

**Résultat:** `{ "status": "ok", "version": "v11-light" }`

### ✅ 5.3 Mapper domaine Cloudflare
- [ ] Cloudflare Dashboard → Domain Routing
- [ ] Route: `simu.immobilierlieusaint.fr/api/*` → Worker
- [ ] Ou mettre à jour `wrangler.toml` avec route correcte

---

## 📋 BLOC 6: Tests E2E (2 heures)

### ✅ 6.1 Test 1 — Particulier
Lancer le curl du TEST-CALCUL-COMMISSION.md Test 1

Vérifications:
- [ ] Réponse: `{ "success": true, "commission": 200, ... }`
- [ ] HubSpot Contact 12345 → Propriété "Cumul 2026 montant apporteur" = 200
- [ ] Sheets "Historique" → Nouvelle ligne présente
- [ ] Email reçu à harry@immobilierlieusaint.fr

### ✅ 6.2 Test 2 — Professionnel
Lancer le curl du TEST-CALCUL-COMMISSION.md Test 2

Vérifications:
- [ ] Réponse: `{ "success": true, "commission": 10000, ... }`
- [ ] HubSpot Contact 67890 → Propriété = 10000
- [ ] Sheets updated
- [ ] Email reçu

### ✅ 6.3 Test 3 — Cumul année
Lancer 2 fois sur même contact

Vérifications:
- [ ] Appel 1 → commission = 200
- [ ] Appel 2 → commission = 200
- [ ] HubSpot Contact → Propriété = 400 (200 + 200 automatiquement)

### ✅ 6.4 Test 4-6 — Validations
Lancer tests 4, 5, 6 du TEST-CALCUL-COMMISSION.md

Vérifications:
- [ ] Champs manquants → 400 error ✅
- [ ] Type invalide → 400 error ✅
- [ ] Ping → 200 ok ✅

---

## 📋 BLOC 7: Documentation Finale (15 min)

### ✅ 7.1 Documenter variables secrets
- [ ] SPREADSHEET_ID = `[ta valeur]`
- [ ] SERVICE_ACCOUNT_JSON = Stocké dans Cloudflare Secrets ✅
- [ ] RESEND_API_KEY = `[ta valeur]`
- [ ] HUBSPOT_API_KEY = `[ta valeur]`

### ✅ 7.2 Créer runbook opérationnel
- [ ] URL Production finale: `https://simu.immobilierlieusaint.fr/api/calcul-commission-apporteur`
- [ ] Health check: `GET /ping`
- [ ] Logs: https://dash.cloudflare.com → Workers → Logs
- [ ] Dashboard HubSpot pour suivi commissions

### ✅ 7.3 Rappel annuelle
- [ ] **DÉCEMBRE 2028:** Créer propriétés 2029 (Contact + Deal)
- [ ] **DÉCEMBRE 2029:** Créer propriétés 2030
- [ ] Ajouter rappel dans calendrier (1er décembre chaque année)

---

## ✅ Signature de validation

- [ ] Tous les blocs complétés
- [ ] Tous les tests réussis
- [ ] Worker en production et actif
- [ ] Aucun erreur dans les logs Cloudflare

**Signature:** ________________  
**Date:** ________________

---

## 🚨 Troubleshooting

| Problème | Solution |
|----------|----------|
| `wrangler whoami` échoue | Installer Wrangler: `npm install -g wrangler` |
| Secret pas trouvé | Relancer `wrangler secret put SERVICE_ACCOUNT_JSON --env production` |
| Google Sheets API erreur | Vérifier que Sheets API est activée dans Google Cloud Console |
| HubSpot 401 | Vérifier API key et scope permissions |
| Email pas reçu | Vérifier domaine Resend dans domain list |
| Propriété HubSpot vide | Contact ID invalide ou propriété inexistante |

---

**Phase 2 LIGHT = GO ✅**

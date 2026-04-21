# Deployment Checklist — Phase 2 LIGHT (Cloudflare D1)

**Durée totale:** ~3 heures (beaucoup plus simple qu'Excel!)

---

## 📋 BLOC 1: Infra Cloudflare D1 (30 min)

### ✅ 1.1 Créer les bases D1
```bash
# Terminal (dans le dossier du projet cerveau-declic)

# Production
wrangler d1 create apporteurs-crm-prod

# Staging
wrangler d1 create apporteurs-crm-staging

# Development
wrangler d1 create apporteurs-crm-dev
```

Cloudflare crée les bases et retourne des **database IDs**. Les noter.

### ✅ 1.2 Initialiser le schéma
```bash
# Mettre à jour wrangler-d1.toml avec les IDs si besoin
# Puis exécuter le schéma:

wrangler d1 execute apporteurs-crm-prod --file schema-d1.sql
wrangler d1 execute apporteurs-crm-staging --file schema-d1.sql
wrangler d1 execute apporteurs-crm-dev --file schema-d1.sql
```

**✅ Résultat:** 3 tables créées (deals, commissions, historique) avec indexes.

---

## 📋 BLOC 2: Vérifications HubSpot (15 min)

### ✅ 2.1 Vérifier propriétés Deal
- [ ] HubSpot → Settings → Custom Properties → Deal/Transaction
- [ ] Chercher "Cumul 2026 montant apporteur"
- [ ] ✅ Propriétés existantes: 2026, 2027, 2028, 2029, 2030 (Type: Number)

### ✅ 2.2 Récupérer API Key HubSpot
- [ ] HubSpot Settings → Integrations → API keys
- [ ] Créer nouvelle clé (ou copier existante)
- [ ] Scope: `crm.objects.deals.write`

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
- [ ] Copier `cerveau-declic-v11-d1.js` → `src/index.js` (ou à la racine)
- [ ] Copier `wrangler-d1.toml` → `wrangler.toml`
- [ ] Copier `schema-d1.sql` dans le dossier

### ✅ 4.2 Configuration wrangler.toml
- [ ] Ouvrir `wrangler.toml`
- [ ] Remplacer `YOUR_ACCOUNT_ID` → récupérer via `wrangler whoami`
- [ ] Remplacer `YOUR_ZONE_ID` → récupérer depuis Cloudflare Dashboard
- [ ] Remplir les `vars` pour production:

```toml
[env.production]
vars = {
  RESEND_API_KEY = "re_xxx...",
  HUBSPOT_API_KEY = "pat_xxx..."
}
d1_databases = { DB = "apporteurs-crm-prod" }
```

### ✅ 4.3 Test local
```bash
# Terminal
wrangler dev --env development
```

Tester avec curl:
```bash
curl -X POST http://localhost:8787/calcul-commission-apporteur \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": 12345,
    "montantHT": 100000,
    "apporteurType": "Particulier",
    "apporteurEmail": "test@example.com"
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

**Résultat:** `{ "status": "ok", "version": "v11-d1" }`

### ✅ 5.3 Mapper domaine Cloudflare
- [ ] Cloudflare Dashboard → Domain Routing
- [ ] Route: `simu.immobilierlieusaint.fr/api/*` → Worker
- [ ] Ou mettre à jour `wrangler.toml` avec route correcte

---

## 📋 BLOC 6: Tests E2E (1 heure)

### ✅ 6.1 Test 1 — Particulier
Lancer le curl du TEST-CALCUL-COMMISSION.md Test 1

Vérifications:
- [ ] Réponse: `{ "success": true, "commission": 200, ... }`
- [ ] HubSpot Deal 12345 → Propriété "Cumul 2026 montant apporteur" = 200 ✅
- [ ] D1 table `commissions` → 1 nouvelle ligne ✅
- [ ] D1 table `historique` → 1 nouvelle ligne ✅
- [ ] Email reçu à harry@immobilierlieusaint.fr ✅

### ✅ 6.2 Test 2 — Professionnel
Lancer le curl du TEST-CALCUL-COMMISSION.md Test 2

Vérifications:
- [ ] Réponse: `{ "success": true, "commission": 10000, ... }`
- [ ] HubSpot Deal 67890 → Propriété = 10000 ✅
- [ ] D1 updated ✅
- [ ] Email reçu ✅

### ✅ 6.3 Test 3 — Deux deals
Lancer 2 fois sur deals différents

Vérifications:
- [ ] Appel 1 → commission = 200
- [ ] Appel 2 → commission = 200
- [ ] D1 table `deals` → 2 lignes ✅
- [ ] D1 table `commissions` → 2 lignes ✅

### ✅ 6.4 Tests 4-6 — Validations
Lancer tests 4, 5, 6 du TEST-CALCUL-COMMISSION.md

Vérifications:
- [ ] Champs manquants → 400 error ✅
- [ ] Type invalide → 400 error ✅
- [ ] Ping → 200 ok ✅

### ✅ 6.5 Vérifier les données D1
```bash
# Via Cloudflare Dashboard ou CLI:
wrangler d1 execute apporteurs-crm-prod --command "SELECT * FROM commissions"
wrangler d1 execute apporteurs-crm-prod --command "SELECT * FROM historique"
```

---

## 📋 BLOC 7: Documentation Finale (15 min)

### ✅ 7.1 Documenter configs
- [ ] HUBSPOT_API_KEY = `pat-xxx...`
- [ ] RESEND_API_KEY = `re_xxx...`
- [ ] D1 Database IDs (prod, staging, dev)

### ✅ 7.2 Créer runbook opérationnel
- [ ] URL Production finale: `https://simu.immobilierlieusaint.fr/api/calcul-commission-apporteur`
- [ ] Health check: `GET /ping`
- [ ] Logs: https://dash.cloudflare.com → Workers → Logs
- [ ] D1 queries: `wrangler d1 execute apporteurs-crm-prod --command "..."`
- [ ] Dashboard HubSpot pour suivi commissions

### ✅ 7.3 Rappel annuelle
- [ ] **DÉCEMBRE 2028:** Créer propriétés 2029 sur Deal (HubSpot)
- [ ] **DÉCEMBRE 2029:** Créer propriétés 2030
- [ ] Ajouter rappel dans calendrier (1er décembre chaque année)

---

## ✅ Signature de validation

- [ ] Tous les blocs complétés
- [ ] Tous les tests réussis
- [ ] Worker en production et actif
- [ ] D1 bases remplies avec données test
- [ ] Aucun erreur dans les logs Cloudflare

**Signature:** ________________  
**Date:** ________________

---

## 🚨 Troubleshooting D1

| Problème | Solution |
|----------|----------|
| `wrangler whoami` échoue | Installer Wrangler: `npm install -g wrangler` |
| D1 database pas trouvée | Créer via `wrangler d1 create apporteurs-crm-prod` |
| Schéma pas appliqué | Relancer `wrangler d1 execute ... --file schema-d1.sql` |
| HubSpot 401 | Vérifier API key et scope permissions |
| Email pas reçu | Vérifier domaine Resend dans domain list |
| D1 queries échouent | Vérifier syntaxe SQL, binding dans wrangler.toml |

---

**Phase 2 LIGHT D1 = GO ✅**

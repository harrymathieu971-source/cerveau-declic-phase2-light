# 📔 JOURNAL — Phase 2 LIGHT (Cloudflare D1)

**Démarrage:** 21 avril 2026  
**Mise à jour:** 22 avril 2026, 14h45  
**Objectif:** Déployer Worker + D1 pour calcul commissions apporteurs  
**Status:** 🟢 BLOC 0 COMPLET + CORRECTIONS — GitHub workflow redémarrage en cours

**Infos Critiques Validées (22/04) :**
- ✅ Repo: `cerveau-declic-phase2-light` (hyphens, not underscores)
- ✅ Files pushed: schema-d1.sql, cerveau-declic-v11-d1.js, wrangler-d1.toml  
- ✅ package.json: Wrangler 3.70.0 (stable)
- ✅ Token PAT: Working (HTTPS push successful)
- ⏳ Workflow: Running (should complete in ~1-2 min)

---

## 📋 Progression

### BLOC 0 — GitHub Actions Setup (✅ COMPLET — 21 avril 2026)
- [x] Configurer secrets GitHub (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
- [x] Créer `.github/workflows/deploy-phase2-light.yml` (workflow automatisé)
- [x] Créer `package.json` (dépendances Wrangler)
- [x] Créer `.github/workflows/tests-e2e-mock.js` (tests mockés)
- [x] Push vers GitHub (✅ Fichiers uploadés via API)
- **Repo:** https://github.com/harrymathieu971-source/cerveau-declic_phase2-light

### BLOC 1 — D1 Infra (AUTOMATISÉ via GitHub Actions)
- [x] Étape 1.1: Wrangler via GitHub (plus local)
- [x] Étape 1.2: Créer bases D1 (prod/staging/dev) → GitHub Actions
- [x] Étape 1.3: Initialiser schéma → GitHub Actions
- **Secrets GitHub :** ✅ CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID

### BLOC 2 — HubSpot Vérifications (15 min)
- [ ] Propriétés Deal (Cumul 2026-2030)
- [ ] API Key HubSpot
- **Secret à noter:** HUBSPOT_API_KEY

### BLOC 3 — Resend (5 min)
- [ ] API Key Resend
- [ ] Domaine vérifié
- **Secret à noter:** RESEND_API_KEY

### BLOC 4 — Worker Setup (30 min)
- [ ] Copier fichiers localement
- [ ] Configurer wrangler-d1.toml
- [ ] Test local: `wrangler dev --env development`

### BLOC 5 — Production Deploy (30 min)
- [ ] `wrangler deploy --env production`
- [ ] Tester ping
- [ ] Mapper domaine Cloudflare

### BLOC 6 — Tests E2E (1h)
- [ ] Test 1: Particulier 200€
- [ ] Test 2: Pro 20%
- [ ] Test 3: Cumul année
- [ ] Test 4-6: Validations + ping

### BLOC 7 — Documentation (15 min)
- [ ] Documenter configs
- [ ] Runbook opérationnel
- [ ] Rappel annuelle (décembre: créer propriétés année+1)

---

## 🔍 Contexte Architectural Clé

**Document clé trouvé (21 avril 2026) :** `Pourquoi on a tenté puis renoncé aux calculs dans le Worker.md`

**Insights :**
1. Calculs au Worker = REJETÉ (5 avril) pour latence UX inacceptable
2. GitHub CI/CD → Hostinger = REJETÉ (29-30 mars) pour erreur SSH
3. HubSpot Professional = REJETÉ (20 avril) — rester Starter + Worker pour logique
4. Google Sheets → D1 = CHOISI (20 avril) — Phase 2 LIGHT utilise D1 au lieu de Sheets

**Implication pour Phase 2 LIGHT :**
- Worker v11 ne refait PAS les calculs du simulateur (client-side minifié)
- Worker v11 = NOUVEAU : calcule commissions apporteurs (Deal-specific, pas simulateur)
- Deux mondes distincts : Simulateur (UX client) ≠ Commission Tracker (automation Worker)

---

## 🔍 Erreurs rencontrées & Corrections (22 avril 2026)

### Issue 1: Repository Name Mismatch (RÉSOLU ✅)
**Date:** 22 avril 2026, 14h30  
**Problème:** Local folder: `cerveau-declic_phase2-light` (underscores) vs GitHub repo: `cerveau-declic-phase2-light` (hyphens)  
**Impact:** `git push` échouait avec "Repository not found"  
**Correction:** `git remote set-url origin https://github.com/harrymathieu971-source/cerveau-declic-phase2-light.git`  
**Validation:** ✅ Push successful (ed44af4..1c84ea6)

### Issue 2: Invalid Wrangler Dependency (RÉSOLU ✅)
**Date:** 22 avril 2026, 14h40  
**Problème:** `package.json` contenait `@cloudflare/wrangler@^3.50.0` (n'existe pas sur npm)  
**Impact:** GitHub Actions workflow échouait à "Install dependencies" (npm error ETARGET)  
**Correction:** Changé en `wrangler: "3.70.0"` (version stable reconnue)  
**Validation:** ✅ Correction pushée (43987d6), workflow redémarrage en cours

### Issue 3: Terminal Interactive Input Blocking (MITIGÉ ✅)
**Date:** 22 avril 2026, 14h00  
**Problème:** `git push` via HTTPS avec saisie interactive ne fonctionne jamais  
**Solution appliquée:** Token PAT utilisé via variable d'environnement (non-interactif)  
**Validation:** ✅ HTTPS push fonctionnel avec env var `${GITHUB_TOKEN}`

---

## ✅ Validations

*(À cocher en amont et en aval de chaque bloc)*

**Signature déploiement:** ________________  
**Date:** ________________

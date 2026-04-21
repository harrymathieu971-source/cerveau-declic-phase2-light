# 📔 JOURNAL — Phase 2 LIGHT (Cloudflare D1)

**Démarrage:** 21 avril 2026  
**Objectif:** Déployer Worker + D1 pour calcul commissions apporteurs  
**Status:** ✅ BLOC 0 TERMINÉ — Prêt pour déploiement Phase 2 LIGHT

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

## 🔍 Erreurs rencontrées

*(À remplir au fur et à mesure)*

---

## ✅ Validations

*(À cocher en amont et en aval de chaque bloc)*

**Signature déploiement:** ________________  
**Date:** ________________

# GitHub Actions Guide — Phase 2 LIGHT Deployment

**Date:** 21 avril 2026  
**Workflow:** `.github/workflows/deploy-phase2-light.yml`

---

## 🎯 Vue d'ensemble

Quand tu **push vers `main`**, le workflow s'exécute automatiquement :

```
1. STAGING (automatique)
   ├─ Créer D1 staging
   ├─ Déployer Worker staging
   └─ Exécuter tests mocks
   
2. ⏸️ ATTENDRE APPROBATION (manuel)
   └─ Tu cliques "Approve" dans GitHub
   
3. PRODUCTION (automatique après approbation)
   ├─ Créer D1 prod
   ├─ Déployer Worker prod
   └─ Vérifier déploiement
```

---

## 📋 Étapes pour déployer

### 1️⃣ Pousser ton code vers GitHub

```bash
git add .github/ package.json cerveau-declic-v11-d1.js schema-d1.sql wrangler-d1.toml
git commit -m "Phase 2 LIGHT: Deploy via GitHub Actions"
git push origin main
```

### 2️⃣ Regarder le workflow s'exécuter

**Aller sur GitHub :**
```
Ton repo → "Actions" tab → "Phase 2 LIGHT — Deploy D1 + Worker + Tests"
```

**Ou depuis le CLI :**
```bash
gh run list --workflow=deploy-phase2-light.yml
```

### 3️⃣ Approuver le déploiement en production

**Option A : Via GitHub UI**
```
Actions → [workflow en cours]
  → Attendre "Deploy to Production (Manual Approval)"
  → Bouton "Review deployments"
  → "Approve and deploy"
```

**Option B : Via CLI**
```bash
gh run view [RUN_ID] --log
gh deployment review [DEPLOYMENT_ID] --approve
```

### 4️⃣ Attendre la finalisation

```
Staging ✅
  ↓
⏸️ Awaiting approval...
  ↓ (tu approuves)
Production ✅
  ↓
Tests post-deployment
  ↓
📊 Results
```

---

## 🔍 Vérifier le statut

### Dans GitHub
```
Repo → Actions → Last run
```

**Statuts possibles :**
- 🟢 **Success** — Tous les tests passés, déploiement OK
- 🟡 **Pending review** — Attente de ton approbation manuelle
- 🔴 **Failed** — Tests échoués ou erreur de déploiement

### En ligne de commande
```bash
# Voir les runs récents
gh run list

# Voir les détails d'un run
gh run view [RUN_ID]

# Voir les logs
gh run view [RUN_ID] --log
```

---

## ⚠️ Si le déploiement échoue

### 1. Lire les logs GitHub
```
Actions → [Failed run] → "Deploy to Production"
  → Voir l'erreur exact dans les logs
```

### 2. Erreurs courantes

| Erreur | Solution |
|--------|----------|
| `fatal: Remote branch not found` | Git branch n'existe pas — vérifie `git branch` |
| `CLOUDFLARE_API_TOKEN not set` | Secret GitHub manquant — ajoute dans Settings |
| `D1 database already exists` | Normal (pas d'erreur, juste message info) |
| `Tests failed` | Vérifier les tests mocks — voir `.github/workflows/tests-e2e-mock.js` |

### 3. Relancer le workflow
```bash
# Relancer le dernier run
gh run rerun [RUN_ID]

# Ou pusher à nouveau
git commit --allow-empty -m "Re-trigger workflow"
git push origin main
```

---

## 📊 Après déploiement (checklist)

✅ **À faire après approbation de la production :**

```bash
# 1. Vérifier que le Worker est en prod
curl https://simu.immobilierlieusaint.fr/api/ping

# 2. Vérifier que D1 prod existe
wrangler d1 list

# 3. Vérifier que le schéma est initialisé
wrangler d1 execute apporteurs-crm-prod --command "SELECT COUNT(*) FROM deals"

# 4. Faire un test complet (BLOC 6)
curl -X POST https://simu.immobilierlieusaint.fr/api/calcul-commission-apporteur \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": 12345,
    "montantHT": 250000,
    "apporteurType": "Particulier",
    "apporteurEmail": "test@example.com"
  }'
```

---

## 🔐 Secrets GitHub requis

Vérifier que ces 2 secrets existent dans GitHub Settings :

```
CLOUDFLARE_API_TOKEN = (ton token)
CLOUDFLARE_ACCOUNT_ID = (ton ID)
```

**Comment les ajouter :**
```
Repo Settings → Secrets and variables → Actions
  → "New repository secret"
  → Nom: CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID
  → Value: [colle la valeur]
  → Save
```

---

## 💡 Tips

1. **Notifications :** Active les notifications GitHub pour suivre le workflow en temps réel
2. **Logs détaillés :** Les logs du workflow contiennent tout (DB creation, deployment, tests)
3. **Rejeu facile :** Tu peux relancer un workflow depuis GitHub UI si besoin
4. **Pas de Wrangler local :** Tout se fait dans GitHub Actions

---

## 📞 Troubleshooting

**"Où voir les Database IDs D1 ?"**
```
Cloudflare Dashboard → Workers & Pages → D1 → [Database]
```

**"Comment tester le Worker avant approbation ?"**
```
Les tests mocks s'exécutent en staging. Si staging ✅, prod sera OK.
```

**"Puis-je rejeter le déploiement prod ?"**
```
Oui — Ne pas cliquer "Approve" et le workflow expire après 30 jours.
```

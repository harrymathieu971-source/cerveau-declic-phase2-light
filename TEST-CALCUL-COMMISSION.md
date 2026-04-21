# Tests — Route `/calcul-commission-apporteur`

**Fichier:** `cerveau-declic-v11-d1.js` (Cloudflare D1)  
**Route:** `POST /calcul-commission-apporteur`  
**Environnement:** Production `simu.immobilierlieusaint.fr/api/calcul-commission-apporteur`

**Storage:** Cloudflare D1 (base SQL), pas Google Sheets

---

## ✅ Test 1: Commission Particulier (200€ forfait)

**Scénario:** Deal immobilier de 250 000€ apporté par un particulier

```bash
curl -X POST https://simu.immobilierlieusaint.fr/api/calcul-commission-apporteur \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": 12345,
    "montantHT": 250000,
    "apporteurType": "Particulier",
    "apporteurEmail": "jean.dupont@example.com"
  }'
```

**Résultat attendu:**
```json
{
  "success": true,
  "commission": 200,
  "year": 2026,
  "propertyName": "Cumul 2026 montant apporteur",
  "dealId": 12345
}
```

**Vérifications après:**
1. ✅ HubSpot Deal 12345 → Propriété "Cumul 2026 montant apporteur" = 200
2. ✅ Sheets "Historique" → 1 nouvelle ligne (jean.dupont@example.com, Deal Gagné, 250000, 200)
3. ✅ Email reçu à harry@immobilierlieusaint.fr

---

## ✅ Test 2: Commission Professionnel (20% HT)

**Scénario:** Deal immobilier de 50 000€ apporté par un pro (SARL/EURL)

```bash
curl -X POST https://simu.immobilierlieusaint.fr/api/calcul-commission-apporteur \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": 67890,
    "montantHT": 50000,
    "apporteurType": "Professionnel",
    "apporteurEmail": "contact@abc-consulting.fr"
  }'
```

**Résultat attendu:**
```json
{
  "success": true,
  "commission": 10000,
  "year": 2026,
  "propertyName": "Cumul 2026 montant apporteur",
  "dealId": 67890
}
```

**Calcul vérifiable:** 50000 × 0.20 = 10000 ✓

**Vérifications après:**
1. ✅ HubSpot Deal 67890 → Propriété "Cumul 2026 montant apporteur" = 10000
2. ✅ Sheets "Historique" → 1 nouvelle ligne (contact@abc-consulting.fr, 50000, 10000)
3. ✅ Email reçu

---

## ✅ Test 3: Multiples deals même année (cumul)

**Scénario:** 2 deals différents du même apporteur "Particulier" dans l'année

**Call 1:**
```bash
curl -X POST https://simu.immobilierlieusaint.fr/api/calcul-commission-apporteur \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": 12345,
    "montantHT": 250000,
    "apporteurType": "Particulier",
    "apporteurEmail": "jean.dupont@example.com"
  }'
```

**Résultat Call 1:** commission = 200

**Call 2 (deal 2, même apporteur, même année):**
```bash
curl -X POST https://simu.immobilierlieusaint.fr/api/calcul-commission-apporteur \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": 54321,
    "montantHT": 300000,
    "apporteurType": "Particulier",
    "apporteurEmail": "jean.dupont@example.com"
  }'
```

**Résultat Call 2:** commission = 200

**Note:** Chaque Deal reçoit sa commission indépendamment.
- Deal 12345 → Propriété "Cumul 2026 montant apporteur" = 200
- Deal 54321 → Propriété "Cumul 2026 montant apporteur" = 200

Si tu veux **tracker le cumul par apporteur**, tu dois créer des propriétés Contact analogues (apporteur_cumul_2026, etc.)

---

## ❌ Test 4: Validation — Champs manquants

**Scénario:** Soumission SANS dealId

```bash
curl -X POST https://simu.immobilierlieusaint.fr/api/calcul-commission-apporteur \
  -H "Content-Type: application/json" \
  -d '{
    "montantHT": 100000,
    "apporteurType": "Particulier",
    "apporteurEmail": "test@example.com"
  }'
```

**Résultat attendu (400):**
```json
{
  "error": "Champs requis manquants: dealId, montantHT, apporteurType, apporteurEmail"
}
```

---

## ❌ Test 5: Validation — Type apporteur invalide

**Scénario:** Type invalide ("Autre" au lieu de "Particulier"/"Professionnel")

```bash
curl -X POST https://simu.immobilierlieusaint.fr/api/calcul-commission-apporteur \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": 999,
    "montantHT": 100000,
    "apporteurType": "Autre",
    "apporteurEmail": "test@example.com"
  }'
```

**Résultat attendu (400):**
```json
{
  "error": "Type apporteur invalide: Autre"
}
```

---

## 📝 Test 6: Ping (Health check)

**Scénario:** Vérifier que le Worker est actif

```bash
curl -X GET https://simu.immobilierlieusaint.fr/api/ping
```

**Résultat attendu:**
```json
{
  "status": "ok",
  "version": "v11-light"
}
```

---

## 🔄 Test 7: Détection année automatique (2027+)

**Scénario:** En 2027, vérifier que la propriété change

*À faire en janvier 2027 après création des propriétés 2027*

```bash
# En 2027:
curl -X POST https://simu.immobilierlieusaint.fr/api/calcul-commission-apporteur \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": 9999,
    "montantHT": 100000,
    "apporteurType": "Particulier",
    "apporteurEmail": "future@example.com"
  }'
```

**Résultat attendu:**
```json
{
  "success": true,
  "commission": 200,
  "year": 2027,
  "propertyName": "Cumul 2027 montant apporteur",
  "dealId": 9999
}
```

✅ La propriété a changé automatiquement de "Cumul 2026" → "Cumul 2027"

---

## 📊 Résumé des tests

| Test | Cas d'usage | Statut |
|------|-----------|--------|
| 1 | Particulier 200€ | ✅ À faire |
| 2 | Pro 20% HT | ✅ À faire |
| 3 | Cumul année | ✅ À faire |
| 4 | Champs manquants | ✅ À faire |
| 5 | Type invalide | ✅ À faire |
| 6 | Health check | ✅ À faire |
| 7 | Année 2027+ | ⏳ Plus tard |

---

## 🚀 Checklist avant production

- [ ] Test 1 réussi (Particulier)
- [ ] Test 2 réussi (Pro)
- [ ] Test 3 réussi (Cumul)
- [ ] Test 4 réussi (Validation)
- [ ] Test 5 réussi (Type invalide)
- [ ] Test 6 réussi (Ping)
- [ ] HubSpot properties vérifiées (2026-2030)
- [ ] Google Sheets accès confirmé
- [ ] Resend API key vérifiée
- [ ] wrangler.toml complètement configuré
- [ ] Secrets configurés (SERVICE_ACCOUNT_JSON)
- [ ] Déploiement production OK
- [ ] URL finale active et testée

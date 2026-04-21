# PHASE 2 LIGHT — Plan d'implémentation complet

**Date:** 21 avril 2026  
**Durée estimée:** 3-4 jours  
**Livrable:** Worker v11 LIGHT + Google Sheets CRM

---

## 🎯 Résumé Phase 2 LIGHT

Au lieu de 5 routes (A1, A2, B, C, D), on fait **1 seule route optimisée** :
- Route: `POST /calcul-commission-apporteur`
- Logique: Calculer commission + envoyer à HubSpot **Deal** (propriétés dynamiques 2026-2030)
- Storage: Google Sheets (archive Historique)
- **Propriétés HubSpot Deal ✅ déjà créées** (Cumul 2026, Cumul 2027, etc.)

---

## ÉTAPE 1: Créer Google Sheets CRM (30 min manuel)

### 1.1 Créer le Sheets

**Actions manuelles (Google Drive):**

1. Aller à https://drive.google.com
2. Créer "New → Google Sheet"
3. Renommer: **"Apporteurs CRM Charles Harry"**
4. Créer 4 onglets (Sheet tabs) en renommant:
   - `Contacts`
   - `Deals`
   - `Commissions`
   - `Historique`

### 1.2 Configurer en-têtes de colonnes

**Sheet 1: Contacts**
```
A: Timestamp      B: Email        C: Nom          D: Prénom
E: Profil         F: Domaine      G: Date inscription  H: Cumul année
```

**Sheet 2: Deals**
```
A: Deal ID        B: Date dépôt   C: Email apporteur  D: Nom prospect
E: Téléphone      F: Type         G: Montant HT       H: Statut
I: Commission €   J: Pièce jointe K: Commentaire
```

**Sheet 3: Commissions**
```
A: Email apporteur   B: Particulier (200€)  C: Pro (20%)   
D: Cumul année       E: Dernière maj
```

**Sheet 4: Historique**
```
A: Timestamp         B: Email apporteur    C: Événement    D: Deal ID
E: Montant HT        F: Commission €       G: Alerte/Note
```

**✅ Résultat:** Sheets créé avec structure complète.

---

## ÉTAPE 2: Créer Service Account Google (20 min)

### 2.1 Google Cloud Console

1. Aller à https://console.cloud.google.com
2. **Créer un projet** (ou utiliser existant)
   - Nom: `charles-crm-apporteurs`
3. **APIs & Services** → **Enable APIs and Services**
   - Chercher: "Google Sheets API"
   - Cliquer **Enable**

### 2.2 Créer Service Account

1. **APIs & Services** → **Credentials** (gauche)
2. **Create Credentials** → **Service Account**
   - Nom: `cerveau-declic-sheets-v11`
   - Description: `Worker Cloudflare pour CRM apporteurs`
   - Cliquer **Create and Continue**
3. **Grant roles:** Ajouter **Editor** role
4. **Create Key:**
   - Type: JSON
   - Cliquer **Create**
   - **Télécharger et garder le JSON en sécurité**

**Format du JSON téléchargé:**
```json
{
  "type": "service_account",
  "project_id": "charles-crm-apporteurs-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "cerveau-declic-sheets-v11@charles-crm-apporteurs.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### 2.3 Partager Sheets avec Service Account

1. Ouvrir le Sheets créé à l'étape 1
2. **Share** (bouton haut-droit)
3. Ajouter email: `cerveau-declic-sheets-v11@charles-crm-apporteurs.iam.gserviceaccount.com`
4. Donner permission: **Editor**
5. Cliquer **Share**

**✅ Résultat:** Service Account a accès au Sheets.

### 2.4 Récupérer Spreadsheet ID

1. Ouvrir Sheets
2. URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
3. Copier `[SPREADSHEET_ID]` (la longue chaîne)

**À mémoriser:**
- `SPREADSHEET_ID` = [votre ID]
- `SERVICE_ACCOUNT_JSON` = contenu complet du JSON
- `RESEND_API_KEY` = clé Resend existante (re_xxx...)

---

## ÉTAPE 3: Code Worker v11 LIGHT

### 3.1 Structure simplifiée

```javascript
// cerveau-declic-v11.js
// 1 seule route: POST /calcul-commission-apporteur

// Imports
import jwt from '@tsndr/cloudflare_workers_jwt';

// Config
const SPREADSHEET_ID = 'xxx'; // À remplacer
const SERVICE_ACCOUNT_JSON = {...}; // À remplacer
const RESEND_API_KEY = 're_xxx'; // À remplacer

// === MODULE: Google Sheets API ===
class SheetsAPI {
  constructor(serviceAccountJson) {
    this.serviceAccountJson = serviceAccountJson;
    this.accessToken = null;
  }

  async getAccessToken() {
    // Générer JWT signé
    const payload = {
      iss: this.serviceAccountJson.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(payload, this.serviceAccountJson.private_key);
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token,
      }),
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    return this.accessToken;
  }

  async appendRow(sheetName, values) {
    // Ajouter une ligne au Sheets
    const token = await this.getAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${sheetName}'!A:G:append?valueInputOption=USER_ENTERED`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [values],
      }),
    });

    return response.json();
  }

  async getValues(sheetName, range) {
    // Lire des valeurs du Sheets
    const token = await this.getAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'${sheetName}'!${range}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  }
}

// === MODULE: Resend API ===
class ResendAPI {
  static async sendEmail(to, subject, html) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'simulateur@immobilierlieusaint.fr',
        to,
        subject,
        html,
      }),
    });

    return response.json();
  }
}

// === MODULE: HubSpot API ===
class HubSpotAPI {
  static async updateContact(contactId, propertyName, value) {
    // Envoyer propriété dynamique
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            [propertyName]: value.toString(),
          },
        }),
      }
    );

    return response.json();
  }
}

// === ROUTE PRINCIPALE ===
export default {
  async fetch(request) {
    if (request.method === 'POST' && request.url.includes('/calcul-commission-apporteur')) {
      return handleCommissionCalc(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};

async function handleCommissionCalc(request) {
  try {
    const payload = await request.json();
    const {
      dealId,
      montantHT,
      apporteurType, // 'Particulier' or 'Professionnel'
      apporteurEmail,
      contactId, // HubSpot Contact ID
    } = payload;

    // === CALCUL COMMISSION ===
    let commission = 0;
    if (apporteurType === 'Particulier') {
      commission = 200; // Flat fee
    } else if (apporteurType === 'Professionnel') {
      commission = montantHT * 0.2; // 20% HT
    } else {
      return new Response(JSON.stringify({ error: 'Type invalide' }), { status: 400 });
    }

    // === DÉTECTION ANNÉE ===
    const year = new Date().getFullYear();
    const propertyName = `Cumul ${year} montant apporteur`;

    // === MISE À JOUR HubSpot ===
    await HubSpotAPI.updateContact(contactId, propertyName, commission);

    // === ARCHIVE SHEETS ===
    const sheetsAPI = new SheetsAPI(SERVICE_ACCOUNT_JSON);
    await sheetsAPI.appendRow('Historique', [
      new Date().toISOString(),
      apporteurEmail,
      'Deal Gagné',
      dealId,
      montantHT.toString(),
      commission.toString(),
      'Commission calculée et envoyée à HubSpot',
    ]);

    // === EMAIL NOTIFICATION INTERNE ===
    await ResendAPI.sendEmail(
      'harry@immobilierlieusaint.fr',
      `Commission: ${apporteurEmail} - ${commission.toFixed(2)}€`,
      `<p>Deal ${dealId} gagné</p><p>Montant: ${montantHT}€ HT</p><p>Commission: ${commission.toFixed(2)}€</p>`
    );

    return new Response(JSON.stringify({
      success: true,
      commission,
      year,
      propertyName,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

### 3.2 Déploiement Cloudflare

**wrangler.toml** (mise à jour):
```toml
[env.production]
vars = { SPREADSHEET_ID = "xxx", RESEND_API_KEY = "re_xxx" }

[env.production.secrets]
SERVICE_ACCOUNT_JSON = ""  # À générer
```

**Commandes:**
```bash
# Ajouter secrets
wrangler secret put SERVICE_ACCOUNT_JSON --env production

# Déployer
wrangler deploy --env production
```

---

## ÉTAPE 4: Tests & Validation

### Test 1: Calculer commission (Particulier)

```bash
curl -X POST https://votre-worker.cloudflare.workers.dev/calcul-commission-apporteur \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": "deal-123",
    "montantHT": 250000,
    "apporteurType": "Particulier",
    "apporteurEmail": "dupont@example.com",
    "contactId": 12345
  }'
```

**Résultat attendu:**
```json
{
  "success": true,
  "commission": 200,
  "year": 2026,
  "propertyName": "Cumul 2026 montant apporteur"
}
```

### Test 2: Calculer commission (Professionnel)

```bash
curl -X POST https://votre-worker.cloudflare.workers.dev/calcul-commission-apporteur \
  -H "Content-Type: application/json" \
  -d '{
    "dealId": "deal-456",
    "montantHT": 50000,
    "apporteurType": "Professionnel",
    "apporteurEmail": "pro@example.com",
    "contactId": 67890
  }'
```

**Résultat attendu:**
```json
{
  "success": true,
  "commission": 10000,
  "year": 2026,
  "propertyName": "Cumul 2026 montant apporteur"
}
```

### Test 3: Vérifier archive Sheets

1. Ouvrir Sheets "Apporteurs CRM Charles Harry"
2. Aller onglet "Historique"
3. Vérifier que 2 lignes y sont ajoutées (2 tests)

### Test 4: Vérifier HubSpot Contact

1. HubSpot → Contacts
2. Chercher contact avec ID 12345
3. Vérifier propriété "Cumul 2026 montant apporteur" = 200 ✅

---

## 🎯 Checklist finale

- [ ] Google Sheets créé avec 4 onglets
- [ ] Service Account créé + JSON téléchargé
- [ ] Sheets partagé avec Service Account
- [ ] Spreadsheet ID copié
- [ ] Code Worker v11 LIGHT prêt
- [ ] wrangler.toml mis à jour
- [ ] Secrets configurés (SERVICE_ACCOUNT_JSON)
- [ ] Worker déployé en production
- [ ] Test 1 (Particulier) ✅
- [ ] Test 2 (Professionnel) ✅
- [ ] Test 3 (Archive Sheets) ✅
- [ ] Test 4 (HubSpot Contact) ✅

---

**Prochaine étape:** Lancer les créations Google Sheets + Service Account.

# PILOTAGE GLOBAL — Charles Harry
*Dernière mise à jour : 20 avril 2026*

---

## Architecture du système digital

```
TRAFIC
├── Meta Ads (méthode PVC) ──────────────┐
├── Google Ads (à venir)                │
└── SEO organique (à venir)             │
                                        ▼
SITE WEB                        immobilierlieusaint.fr
├── Page Apporteurs d'affaires  → /apport-daffaires ✅ (iframes HubSpot)
├── Pages VEE immo              → vee-immo.html (à uploader)
├── Pages VEE réno              → vee-renovation.html (à uploader)
└── Simulateur                  simu.immobilierlieusaint.fr
    ├── index.html (prod v7-16)
    ├── formulaire-contact.html ✅
    ├── formulaire-estimation.html ✅
    ├── formulaire-renovation.html ✅
    └── formulaire-mandat.html ✅

CAPTURE PROSPECTS
├── Simulateur locatif          source_formulaire = simulateur-declic
├── Formulaire rénovation       formulaire = rénovation par nature
├── Formulaire vendeurs         formulaire = immobilier par nature
├── Formulaire estimation       formulaire = estimation par nature
├── Apporteur d'affaires        particulier_ou_professionnel (inscription)
└── Dépôt d'affaires            vente_ou_renovation + votre_email (attribution)
    ↓ tous via Cloudflare Worker cerveau-declic v10
    ↓ champ email obligatoire (capture minimale RGPD)
    ↓
CRM HubSpot Starter (portal 146367337, eu1)
├── Propriétés : source_formulaire, apporteur, vente_ou_renovation,
│               votre_email, particulier_ou_professionnel
├── Pipeline_Ventes (simulateur) ✅
├── Pipeline Vendeurs ✅
└── Circuit apporteurs (en construction)
```

---

## Projets actifs

### 1. VEE Méthode DECLIC
**Statut : Prêt à tourner — vidéos à produire**

| Livrable | État |
|---------|------|
| VEE_Methode_DECLIC.pptx (immo, 12 slides) | ✅ Généré |
| VEE_Methode_DECLIC_Renovation.pptx (12 slides) | ✅ Généré |
| vee-immo.html (page site) | ✅ Créé — à uploader |
| vee-renovation.html (page site) | ✅ Créé — à uploader |
| Vidéo immo tournée + uploadée YouTube | ⏳ À faire |
| Vidéo réno tournée + uploadée YouTube | ⏳ À faire |
| Remplacement VOTRE_ID_YOUTUBE dans les HTML | ⏳ Après tournage |
| Ajout liens sur immobilierlieusaint.fr | ⏳ À faire |

**Format vidéo recommandé :** 16/9 — MP4 — 1080p — H.264/H.265
**Hébergement vidéo :** YouTube "Non répertorié" + iframe embed (cc_load_policy=1 pour sous-titres auto)

---

### 2. Simulateur DECLIC MaPrimeRénov'
**Statut : En service v7-16**
*Référentiel réglementaire : SIMULATEUR-BD_FINANCE.md*

| Fichier | État |
|---------|------|
| Source `simulateur-DECLIC-v7-14.html` | ✅ Référence locale |
| Production `index.html` v7-16 | ✅ En prod sur simu. |
| Minification + anti-iframe | ✅ Actif |
| CORS restriction (Worker v10) | ✅ Actif |

**Règle :** toujours modifier v7-14.html → re-minifier → livrer index.html

---

### 2b. Simulateur Estimation Immobilière
**Statut : En service ✅**

| Élément | État |
|---------|------|
| Worker cerveau-declic v10 | ✅ Déployé Cloudflare (15/04/2026) |
| Route /estimation | ✅ Opérationnelle |
| CSV DVF (6 depts × 3 ans) | ✅ Google Drive |
| Pipeline HubSpot "Vendeurs" | ✅ Opérationnel |
| Frontend /estimation/ sur simu. | ✅ En ligne |
| Bloc succès post-soumission (titre non masqué) | ⚠️ À corriger |

**DVF_CSV_URL** : `https://drive.google.com/uc?export=download&id=14y12YYwq24h2vTP3WDoYvjRzf4cErB-U`

---

### 3. Formulaires site
**Statut : Principaux en service — apporteurs à finaliser**

| Formulaire | Propriété clé | État |
|-----------|--------------|------|
| Simulateur DECLIC | `source_formulaire = simulateur-declic` | ✅ Déployé |
| formulaire-renovation.html | rénovation par nature | ✅ Déployé |
| formulaire-mandat.html | mandat par nature | ✅ Déployé |
| formulaire-contact.html | contact général | ✅ Déployé |
| formulaire-estimation.html | estimation | ✅ Déployé |
| Apporteur d'affaires (iframe /apport-daffaires) | `particulier_ou_professionnel` | ✅ Page live — formulaire à tester en prod |
| Dépôt d'affaires (iframe /apport-daffaires) | `vente_ou_renovation` + `votre_email` | ✅ Page live — formulaire à tester en prod |
| vee-immo.html | activite=immobilier | ⏳ À uploader |
| vee-renovation.html | activite=renovation | ⏳ À uploader |

**Worker Cloudflare actif :** `cerveau-declic v10` (cb7adc70 — déployé 15/04/2026)
**Registre complet formulaires :** voir ETAT-ARCHITECTURE.md Section 4

---

### 4. Circuit Apporteurs d'affaires
**Statut : Architecture validée — workflows HubSpot à configurer**
*Documentation complète : `apporteurs-affaires-flux.docx`*
*Plan d'action : `Plan-action-Apporteurs-1mois.xlsx`*

| Élément | État |
|---------|------|
| Architecture flux définie | ✅ |
| Convention Particulier (200 € fixe) | ✅ Documentée — à faire relire juriste |
| Convention Professionnel (20 % HH perçus du mandant) | ✅ Documentée — à faire relire juriste |
| Formulaire "Apporteur d'affaires" HubSpot | ✅ Créé + testé |
| Formulaire "Dépôt d'affaires" HubSpot | ✅ Créé + testé |
| Page /apport-daffaires | ✅ Déployée (iframes) |
| Propriétés HubSpot essentielles | ✅ `particulier_ou_professionnel`, `vente_ou_renovation`, `votre_email` |
| Propriétés HubSpot avancées | ❌ À créer : Type de Relation, Statut apporteur, Taux commission, etc. |
| Email mensuel apporteurs (CAT) | 🔶 Brouillon HubSpot ID 393341486291 — à finaliser |
| Workflow HubSpot envoi auto | ❌ À configurer |
| Titre SEO /apport-daffaires | ⚠️ Encore l'ancien titre — à corriger dans Builder |

**Rémunération :**
- Particulier : 200 € fixe par affaire conclue — plafond 1 200 €/an (URSSAF)
- Professionnel : 20 % des honoraires HT effectivement perçus du mandant (bordereau fait foi)
- Mandants rénovation : Greenova (national) + EFFY (local, commissions variables)
- Mandant immobilier : MeilleursBiens

---

### 4.1 Phase 2 LIGHT — Calcul Commission Apporteurs (Worker v11 + D1)
**Statut : Architecture codée — déploiement Cloudflare D1 21/04/2026**
*Documentation : `DEPLOYMENT-CHECKLIST-D1.md`, `TEST-CALCUL-COMMISSION.md`*
*Fichiers : `cerveau-declic-v11-d1.js`, `schema-d1.sql`, `wrangler-d1.toml`*

| Élément | État |
|---------|------|
| Architecture Worker v11 | ✅ Codée + testée localement |
| Schéma D1 (deals, commissions, historique) | ✅ Codé avec indexes |
| Configuration Wrangler (dev/staging/prod) | ✅ Prête |
| Tests curl (Particulier, Pro, validation) | ✅ Préparés |
| **Création D1 prod/staging/dev** | 🔶 **EN COURS — BLOC 1** |
| Initialisation schéma D1 | ⏳ Après BLOC 1 |
| Configuration secrets | ⏳ BLOC 2-3 |
| Déploiement Worker v11 production | ⏳ BLOC 5 |
| Tests E2E (Test 1-6) | ⏳ BLOC 6 |

**Route créée :** `POST /calcul-commission-apporteur`  
**Input :** `{ dealId, montantHT, apporteurType, apporteurEmail }`  
**Calcul :** Particulier → 200€ / Professionnel → 20% du montantHT  
**Side-effects :** HubSpot Deal property update + D1 archive + email notification

---

### 5. CRM HubSpot & Automatisation
**Statut : Connecté — Propriétés clés créées — Workflows à construire**

| Action | État |
|--------|------|
| HubSpot Starter (9 €/mois) | ✅ Portal 146367337, eu1 |
| Pipeline_Ventes (simulateur) | ✅ Opérationnel — deals créés automatiquement |
| Pipeline Vendeurs | ✅ Opérationnel |
| Propriétés apporteurs essentielles | ✅ Créées et testées |
| 4 circuits formulaires testés bout-en-bout | ✅ 20/04/2026 |
| Connexion Meta Ads → HubSpot | ⏳ À faire |
| Workflows apporteurs | ❌ À configurer |
| Séquences email nurturing | ⏳ Backlog |

---

### 6. Méthode PVC — Meta Ads
**Statut : Fondations posées — Créatifs à produire**

| Produit | Avatar | MUP/MUS | Offre | VEE | Formats | Hooks | Corps | Renouvellement |
|---------|--------|---------|-------|-----|---------|-------|-------|----------------|
| Vente immo | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ |
| Rénovation énergétique | ✅ | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ |
| Mandat recherche | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Apporteurs d'affaires | ✅ | ✅ | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

**Prochaines étapes PVC :** Formats/Axes → Hooks → Corps de publicité

---

### 7. Google Ads + SEO
**Statut : Projet futur — non démarré**

- À lancer une fois les formulaires tous opérationnels et validés
- SEO : audit à faire (H1 "Immoblier" faute de frappe, témoignages, navigation)
- Ciblage local Lieusaint / Seine-et-Marne pour immo, national pour réno

---

## Prochaines actions prioritaires

```
SPRINT EN COURS — Apporteurs
  1. 📋 Finaliser email mensuel HubSpot (brouillon 393341486291)
  2. 📋 Configurer workflow HubSpot : envoi auto email mensuel aux apporteurs
  3. 📋 Créer propriétés HubSpot avancées (Type de Relation, Statut apporteur, etc.)
  4. 📋 Corriger titre SEO page /apport-daffaires dans Website Builder
  5. 📋 Faire relire conventions apporteur par un juriste

SPRINT SUIVANT — Croissance
  6. ⏳ Lancer Google Ads (formulaires tous validés)
  7. ⏳ Tourner vidéos VEE immo + réno → uploader YouTube
  8. ⏳ Audit SEO site + corrections
  9. ⏳ Connexion Meta Ads → HubSpot leads form
 10. ⏳ Séquences email HubSpot (nurturing prospects simulateur)
```

---

## Documentation de référence

| Fichier | Contenu | Accès |
|---------|---------|-------|
| `PILOTAGE_GLOBAL.md` | Vue d'ensemble — ce fichier | Dossier 0-PILOTAGE GLOBAL |
| `ETAT-ARCHITECTURE.md` | État technique détaillé (Workers, formulaires, HubSpot, URLs) | Dossier site web |
| `JOURNAL.md` | Historique des sessions | Dossier site web |
| `SIMULATEUR-BD_FINANCE.md` | Référentiel réglementaire MPR/CEE/Anah | Dossier site web |
| `apporteurs-affaires-flux.docx` | Architecture circuit apporteurs complète | Dossier site web |
| `Plan-action-Apporteurs-1mois.xlsx` | Plan d'action + suivi URSSAF + tracker DAS2 | Dossier site web |

---

## Règles de travail (rappel)

- Lire PILOTAGE_GLOBAL + ETAT-ARCHITECTURE avant toute session technique
- Décrire les changements avant de les appliquer — attendre validation explicite
- Vérifier chaque affirmation, calcul, référence — signaler toute improvisation
- Livrer toujours : source (v7-xx.html) + production (index.html minifié)
- Répertoire Hostinger simu. : toujours `/files/public_html/` — jamais `principal/`
- Kodee (Hostinger AI) : conseils parfois erronés — toujours vérifier avant d'agir
- Quota HubSpot : 1 000 contacts marketing max — nouveaux contacts NON marqués marketing
- Choix iframes acté pour tous les formulaires du site (pas de liens externes)

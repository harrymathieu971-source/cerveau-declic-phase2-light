# ÉTAT DE L'ARCHITECTURE — immobilierlieusaint.fr
*Charles Harry Mathieu — Mandataire immobilier & Rénovation énergétique*
*Lieusaint (77) — Méthode DECLIC*
*Mise à jour : 15 avril 2026 — 23h45*

---

## Légende des statuts

| Icône | Signification |
|-------|--------------|
| ✅ | En production / opérationnel |
| 🔶 | Prêt / codé — en attente de déploiement manuel |
| 🔧 | À faire — action technique |
| 📋 | À faire — action manuelle (HubSpot, formulaire, etc.) |
| ❌ | Bloqué / bug connu |
| ⏳ | Backlog — non urgent |
| 🔴 | Critique — impacte la capture de leads |

---

## 1. STACK EN PRODUCTION (ce qui tourne aujourd'hui)

### 1.1 Site principal
| Composant | État | Détail |
|-----------|------|--------|
| immobilierlieusaint.fr | ✅ | Hostinger Website Builder |
| Iframe simulateur | ✅ | Pointe vers `simu.immobilierlieusaint.fr` (corrigé 28/03) |
| Page apporteurs d'affaires | ❌ | Page inexistante — à créer dans le Builder |

### 1.2 Sous-domaine simu.immobilierlieusaint.fr
| Fichier | État | Version | Détail |
|---------|------|---------|--------|
| `index.html` (simulateur locatif) | ✅ | v7-16 base, index du 10/04 | Servi depuis `/files/public_html/` |
| `formulaire-contact.html` | ✅ | — | HubSpot formulaire contact général |
| `formulaire-estimation.html` | ✅ | — | HubSpot formulaire estimation |
| `formulaire-renovation.html` | 🔶 | — | Codé, **NON déployé** sur Hostinger |
| `formulaire-mandat.html` | 🔶 | — | Codé, **NON déployé** sur Hostinger |
| `formulaire-apporteur.html` | ❌ | — | **À créer** — intégration form HubSpot "Apporteur d'affaires" |
| `formulaire-depot-affaires.html` | ❌ | — | **À créer** — intégration form HubSpot "Dépôt d'affaires" |

### 1.3 Cloudflare Worker — Cerveau DECLIC
| Version | État | Routes | Déployé le |
|---------|------|--------|-----------|
| v9 | ~~En prod~~ | /ping, /leads, /demande-acces, /verifier-token, /envoyer-simulation | 30/03/2026 |
| **v10** | ✅ **En production** | + route `/estimation` (simulateur estimation immo + DVF) | **15/04/2026** |
| **v11** | 🔶 **Phase 2 LIGHT** | + route `/calcul-commission-apporteur` (commission + D1 archive) | **À déployer 21/04** |

> **v10 en prod depuis le 15/04/2026.** Corrections incluses : `DVF_MODE` corrigé (`conduire` → `drive`), bug deals HubSpot corrigé (`parseInt(contactId, 10)`), logs d'erreur enrichis. Variables Cloudflare : `DVF_MODE=drive`, `DVF_CSV_URL` configurées.
> 
> **v11 (Phase 2 LIGHT) :** Nouveau Worker pour gestion apporteurs. Route `/calcul-commission-apporteur` (POST). Calcule commission (Particulier 200€ / Pro 20%) → met à jour HubSpot Deal property (Cumul {year} montant apporteur) → archive D1 (non-bloquant) → envoie email notification (non-bloquant).

### 1.3bis Cloudflare D1 — Base de données SQL (Phase 2 LIGHT)
| Composant | État | Détail |
|-----------|------|--------|
| **D1 Prod** | 🔶 | À créer : `apporteurs-crm-prod` — BLOC 1 déploiement |
| **D1 Staging** | 🔶 | À créer : `apporteurs-crm-staging` |
| **D1 Dev** | 🔶 | À créer : `apporteurs-crm-dev` |
| Schéma SQL | ✅ | 3 tables : `deals`, `commissions`, `historique` avec indexes |
| Liaison Worker v11 | 🔶 | Binding `{ DB = "apporteurs-crm-prod" }` dans wrangler.toml |

**Schéma D1 :**
- `deals` : deal_id, apporteur_email, apporteur_type, montant_ht, commission_amount, statut
- `commissions` : deal_id, apporteur_email, commission_amount, year, hubspot_property (immutable log)
- `historique` : apporteur_email, evenement, deal_id, timestamp (audit trail)

**Lifecycle :** Non-bloquant pour HubSpot (HubSpot update est critique). Si D1 échoue, Worker log seulement, n'affecte pas la réponse.

---

### 1.4 HubSpot (Starter — 9€/mois)
| Composant | État | Détail |
|-----------|------|--------|
| CRM Contacts | ✅ | Portal 146367337, région eu1 |
| Pipeline deals | ✅ | **Corrigé 15/04/2026** — deals créés (201) dans Pipeline_Ventes |
| Formulaire "Contact général" | ✅ | ID `2179fe38-c800-477b-b95d-4a3cbeebd3e4` — voir Section 4 |
| Formulaire "Contact Estimation" | ✅ | ID `d4e3e0dd-4c96-4a53-92e2-d4861a8bf405` — voir Section 4 |
| Formulaire "Apporteur d'affaires" | 🔶 | ID `5a53db31-5b57-4885-a649-12e98fc828e7` — créé, **à intégrer** dans le site |
| Formulaire "Dépôt d'affaires" | 🔶 | ID `42371338-184c-40df-9455-49ec51c6a3e9` — créé, **à intégrer** dans le site |
| Formulaire "Vendeurs" | ✅ | ID `d7bfb265-46c7-4708-903e-d2c2abfe443b` — Existant |
| Formulaire "Rénovation" | 🔶 | ID `fce7bb15-760e-480b-b150-5c7fe0774df0` — voir Section 4 |
| Email mensuel apporteurs | 🔶 | Brouillon HubSpot ID `393341486291` — à finaliser et activer |
| Propriétés apporteurs (custom) | ❌ | À créer (voir Section 3) |
| Workflow apporteurs | ❌ | À configurer (voir Section 3) |

### 1.5 Resend (emails transactionnels)
| Composant | État | Détail |
|-----------|------|--------|
| Domaine vérifié | ✅ | `simulateur@immobilierlieusaint.fr` |
| Email code d'accès prospect | ✅ | Route /demande-acces |
| Email notification admin | ✅ | Route /demande-acces |
| Email simulation PDF admin | ✅ | Route /envoyer-simulation |

### 1.6 GitHub
| Composant | État | Détail |
|-----------|------|--------|
| Repo `harrymathieu971-source/d-clic` | ✅ | Branche `principal` — sauvegarde |
| CI/CD GitHub → Hostinger | ❌ | **Non connecté** — déploiement manuel uniquement |

---

## 2. ACTIONS CRITIQUES (bloquent la capture de leads)

### ✅ A1 — HubSpot : Deals — RÉSOLU le 15/04/2026
**Cause identifiée :** `contactId` transmis en `string` au lieu d'`integer` dans le payload d'association du deal → rejet 400 par l'API HubSpot.
**Correction appliquée :** `parseInt(contactId, 10)` dans `pushHubSpot()` du Worker v10.
**Vérification :** HTTP 201 confirmé dans les logs HubSpot Private App à 23h34 et 23h45 le 15/04/2026.

**Informations pipeline confirmées :**
- Pipeline simulateur : `Pipeline_Ventes` → ID interne `default`
- Étape d'entrée : `Rendez-vous planifié` → ID interne `appointmentscheduled`
- Pipeline vendeurs : `Vendeurs` → ID interne `3707749562`

---

## 3. BLOC APPORTEURS D'AFFAIRES (nouveau — 15/04/2026)

Architecture complète documentée dans : `apporteurs-affaires-flux.docx`

### 3.1 HubSpot — Propriétés personnalisées à créer

| Propriété | Objet | Type | Options | Mode |
|-----------|-------|------|---------|------|
| Type de Relation | Contact | Menu déroulant | Client / Vendeur / Apporteur | **Manuel HubSpot** |
| Profil Apporteur | Contact | Menu déroulant | Particulier / Professionnel | **Manuel HubSpot** |
| Domaine d'apport | Contact | Cases à cocher | Immobilier / Rénovation | **Manuel HubSpot** |
| Statut apporteur | Transaction | Menu déroulant | En attente / Validé / Refusé / Doublon | **Manuel HubSpot** |
| Raison du refus | Transaction | Menu déroulant | Doublon / Hors secteur / Budget / Autre | **Manuel HubSpot** |
| Taux commission (%) | Transaction | Nombre | — | **Manuel HubSpot** |
| Montant commission (€) | Transaction | Nombre | — | **Worker calcule + HubSpot stocke** |
| Nom apporteur (réf.) | Transaction | Texte | — | **Manuel HubSpot** |
| Cumul commissions année | Contact | Nombre | — | **Worker calcule + HubSpot stocke** |

**Où créer :** HubSpot → Settings → Properties → Create property

**⚠️ LIMITE HubSpot Starter — Propriétés calculées :**
HubSpot Starter ne supporte pas les propriétés calculées (formules). Solution retenue : Cloudflare Worker (cerveau-declic v10) exécute les calculs (Montant commission €, Cumul commissions année) et envoie les valeurs **déjà calculées** à HubSpot. HubSpot Starter reçoit et stocke seulement. Voir `HUBSPOT-STARTER-LIMITES.md` pour les limites complètes.

### 3.2 HubSpot — Formulaires (champs à vérifier/compléter)

**Formulaire "Apporteur d'affaires" (inscription partenaire)**

| Champ | Obligatoire | À ajouter si absent |
|-------|-------------|---------------------|
| Prénom + Nom | ✅ Oui | — |
| Email | ✅ Oui | — |
| Téléphone mobile | ✅ Oui | — |
| Profil : Pro / Particulier | ✅ Oui | **Créer** (menu déroulant) |
| Profession / Société (si Pro) | Conditionnel | **Créer** (texte) |
| Domaine d'activité | ✅ Oui | **Créer** (cases à cocher : Immo / Réno / Les deux) |
| Case RGPD (accord prospect) | ✅ Bloquée | **Vérifier présence** |
| Acceptation conditions d'apport | ✅ Bloquée | **Créer** |

**Formulaire "Dépôt d'affaires" (transmission prospect)**

| Champ | Obligatoire | À ajouter si absent |
|-------|-------------|---------------------|
| Email de l'apporteur | ✅ Oui | — |
| Nom du prospect | ✅ Oui | — |
| Téléphone du prospect | ✅ Oui | — |
| Type de projet | ✅ Oui | **Vérifier** (Vente / Achat / Rénovation) |
| Zone géographique (si réno) | Recommandé | **Créer** |
| Budget estimé | Non | — |
| Commentaire libre | Non | — |
| Case RGPD | ✅ Bloquée | **Vérifier présence** |

### 3.3 HubSpot — Workflow à configurer (Starter)

| Étape | Déclencheur | Actions | Mode |
|-------|-------------|---------|------|
| A | Soumission "Apporteur d'affaires" | Créer Contact + propriété Type Relation = Apporteur + email bienvenue | **Auto HubSpot** |
| B | Soumission "Dépôt d'affaires" | Créer Deal + notification interne + lier apporteur au Deal | **Auto + Manuel** |
| C | Statut = Refusé/Doublon | Envoyer email "antériorité" à l'apporteur | **Auto HubSpot** |
| D | Deal = Fermé Gagné | Email interne calcul commission + mise à jour cumul annuel | **Auto HubSpot** |

**Limite HubSpot Starter :** les workflows avancés (branches conditionnelles) sont en Professional. En Starter : notifications internes + emails simples uniquement.

### 3.4 Pages à créer sur le site

| Page | Contenu | Mode création |
|------|---------|--------------|
| Page "Apporteurs d'affaires" | Texte rédigé (voir `apporteurs-affaires-flux.docx` Section 8) + iframe formulaire "Apporteur d'affaires" | **Manuel — Website Builder Hostinger** |
| Sous-page "Déposer une affaire" | Accès réservé aux apporteurs enregistrés + iframe formulaire "Dépôt d'affaires" | **Manuel — Website Builder Hostinger** |

**Option :** créer les deux formulaires comme pages HTML autonomes sur `simu.immobilierlieusaint.fr` (comme les autres formulaires existants) et les lier par un bouton sur la page principale.

### 3.5 Documents à préparer

| Document | État | Action |
|----------|------|--------|
| Convention apporteur Particulier | ❌ | À rédiger (modèle dans `apporteurs-affaires-flux.docx` Section 5) |
| Convention apporteur Professionnel | ❌ | À rédiger (variante : 20 % des honoraires HT perçus du mandant au lieu de 200 € fixe) |
| Grille de rémunération interne | ✅ | Documentée dans `apporteurs-affaires-flux.docx` |

---

## 4. REGISTRE FORMULAIRES HUBSPOT (mis à jour le 19/04/2026)

> Portail HubSpot : `146367337` — Région : `eu1`
> Script à inclure dans chaque page HTML autonome (sans `defer`) :
> ```html
> <script src="https://js-eu1.hsforms.net/forms/embed/146367337.js" defer></script>
> ```
> Bloc d'intégration (nouveau format embed) :
> ```html
> <div class="hs-form-frame" data-region="eu1" data-form-id="[FORM-ID]" data-portal-id="146367337"></div>
> ```

### 4.1 Tableau des formulaires

| Formulaire | Form ID | Share URL (eu1) | État |
|------------|---------|-----------------|------|
| Contact général | `2179fe38-c800-477b-b95d-4a3cbeebd3e4` | `https://2f55rd.share-eu1.hsforms.com/2IXn-OMgAR3u5XUo8vuvT5A` | ✅ En prod |
| Contact Estimation | `d4e3e0dd-4c96-4a53-92e2-d4861a8bf405` | `https://2f55rd.share-eu1.hsforms.com/21OPg3UyWSlOS4tSGGov0BQ` | ✅ En prod |
| Apporteur d'affaires | `5a53db31-5b57-4885-a649-12e98fc828e7` | `https://2f55rd.share-eu1.hsforms.com/2WlPbMVtXSIWmSRLpj8go5w` | 🔶 Créé, non déployé |
| Dépôt d'affaires | `42371338-184c-40df-9455-49ec51c6a3e9` | `https://2f55rd.share-eu1.hsforms.com/2QjcTOBhMQN-UVUnsUcaj6Q` | 🔶 Créé, non déployé |
| Vendeurs | `d7bfb265-46c7-4708-903e-d2c2abfe443b` | `https://2f55rd.share-eu1.hsforms.com/217-yZUbHRwiQPtLCq_5EOw` | ✅ Existant |
| Rénovation | `fce7bb15-760e-480b-b150-5c7fe0774df0` | `https://2f55rd.share-eu1.hsforms.com/2_Oe7FXYOSAuxUFx_4HdN8A` | 🔶 Codé, non déployé |

### 4.2 Liens et boutons connexes

| Élément | URL / Code |
|---------|-----------|
| Agenda HubSpot (iframe meeting) | `<iframe src="https://meet.hubspot.com/charles-mathieu/meeting" width="100%" height="800" frameborder="0" allowfullscreen></iframe>` |
| Agenda HubSpot (lien direct) | `https://meet.hubspot.com/charles-mathieu/meeting` |
| WhatsApp | `https://wa.me/33698378329?text=Bonjour%2C%20je%20souhaite%20vous%20contacter` |

> **Style bouton WhatsApp :** fond `#4a6a8a`, police Libre Baskerville, texte blanc.

### 4.3 Pages déployées sur le site principal (immobilierlieusaint.fr)

| Page | URL | Formulaire lié | État |
|------|-----|----------------|------|
| Accueil | `/` | — | ✅ |
| Apporteurs d'affaires | `/apport-daffaires` | Apporteur d'affaires (iframe) | ✅ Page déployée / ⚠️ titre SEO à corriger |
| Commissions (usage interne) | `/mes-commissions` | — | ✅ |
| Contact | `/contact` | — | ❌ 404 (à vérifier) |

> **Action en suspens :** lien "Enregistrez-vous en ligne" sur `/apport-daffaires` → remplacer par la share URL HubSpot `https://2f55rd.share-eu1.hsforms.com/2WlPbMVtXSIWmSRLpj8go5w` ou l'URL simu. une fois déployée.

### 4.4 Pages déployées sur simu.immobilierlieusaint.fr

| Fichier | URL | Formulaire lié | État |
|---------|-----|----------------|------|
| `index.html` | `https://simu.immobilierlieusaint.fr/` | Worker /demande-acces | ✅ v7-16 en prod |
| `formulaire-contact.html` | `https://simu.immobilierlieusaint.fr/formulaire-contact.html` | Contact général | ✅ |
| `formulaire-estimation.html` | `https://simu.immobilierlieusaint.fr/formulaire-estimation.html` | Contact Estimation | ✅ |
| `formulaire-renovation.html` | — | Rénovation | 🔶 Codé, non uploadé |
| `formulaire-mandat.html` | — | — | 🔶 Codé, non uploadé |
| `formulaire-apporteur.html` | — | Apporteur d'affaires | ❌ À créer et uploader |
| `formulaire-depot-affaires.html` | — | Dépôt d'affaires | ❌ À créer et uploader |

---

## 6. DÉPLOIEMENT WORKER v10

**Fichier prêt :** `cerveau-declic-10.js` (13/04/2026)
**Nouveauté principale :** route `/estimation` pour le simulateur d'estimation immobilière avec données DVF.

| Étape | Détail | Mode |
|-------|--------|------|
| 1. Ouvrir Cloudflare | dash.cloudflare.com → Workers & Pages → cerveau-declic → Edit Code | **Manuel** |
| 2. Remplacer le code | Copier-coller le contenu de `cerveau-declic-10.js` | **Manuel** |
| 3. Ajouter les variables | Settings → Variables & Secrets → Ajouter `DVF_MODE=drive` et `DVF_CSV_URL=https://drive.google.com/uc?export=download&id=14y12YYwq24h2vTP3WDoYvjRzf4cErB-U` | **Manuel** |
| 4. Deploy | Bouton Deploy | **Manuel** |
| 5. Tester | GET `https://cerveau-declic.harrymathieu971.workers.dev/ping` → doit retourner 200 OK | **Manuel** |

> ⚠️ **Avant de déployer v10 :** résoudre d'abord le problème de token HubSpot (Action A1) pour ne pas déployer sur une base cassée.

---

## 7. FORMULAIRES RESTANTS (rénovation + mandat)

| Fichier | État actuel | Action requise | Mode |
|---------|-------------|----------------|------|
| `formulaire-renovation.html` | 🔶 Codé, non déployé | Uploader dans Hostinger `/files/public_html/` | **Manuel — Gestionnaire de fichiers** |
| `formulaire-mandat.html` | 🔶 Codé, non déployé | Uploader dans Hostinger `/files/public_html/` | **Manuel — Gestionnaire de fichiers** |
| Remplacement forms natifs Hostinger | ❌ | Remplacer les formulaires natifs du Builder par des iframes pointant vers simu. | **Manuel — Website Builder** |

---

## 8. BACKLOG (non urgent)

| Item | Priorité | Détail | Mode |
|------|----------|--------|------|
| Minification `index.html` | Moyenne | Protéger le code des calculs sensibles | **Technique — à préparer** |
| Déplacer calculs dans le Worker | ✅ REJETÉ | **Raison documentée (5 avril 2026):** Latence UX inacceptable (chaque calcul = aller-retour réseau) vs gain limité (minification + CORS + anti-iframe couvrent 99% des cas). Trade-off accepté : rester client-side. Voir `Pourquoi on a tenté puis renoncé aux calculs dans le Worker.md` | **DÉCISION FINALE** |
| GitHub → Hostinger auto-deploy | Basse | Nécessite de vider `public_html/` d'abord | **Technique** |
| Page "Vidéo Offerte DECLIC" | Basse | Contenu (vidéo) pas encore enregistré | **Manuel** |
| Audit SEO site | Moyenne | Navigation, H1 "Immoblier", témoignages clients | **Manuel** |
| Google Ads | Haute | Lancer campagnes une fois les formulaires opérationnels | **Manuel + suivi** |
| Séquences email HubSpot | Moyenne | Nurturing apporteurs + prospects simulateur | **HubSpot Starter** |

---

## 9. ORDRE DE PRIORITÉ RECOMMANDÉ

```
SPRINT 1 — Stabiliser (✅ TERMINÉ le 15/04/2026)
  1. ✅  Deals HubSpot réparés (parseInt fix — Worker v10)
  2. ✅  Worker v10 déployé sur Cloudflare (cb7adc70)
  3. ✅  DVF_MODE corrigé ("conduire" → "drive")

  4. 🔶→⏳  formulaire-renovation.html et formulaire-mandat.html — à uploader sur Hostinger (backlog)

SPRINT 2 — Apporteurs (prochain sprint)
  4. 📋    Créer propriétés custom apporteurs dans HubSpot
  5. 📋    Vérifier/compléter champs formulaires HubSpot
  6. 📋    Configurer workflow apporteurs (Starter)
  7. 🔧    Créer formulaire-apporteur.html + formulaire-depot-affaires.html sur simu.
  8. 📋    Créer page "Apporteurs" dans le Website Builder
  9. 📋    Rédiger conventions Particulier et Pro

SPRINT 3 — Croissance (mois suivant)
  10. ⏳   Lancer Google Ads (une fois formulaires en prod et validés)
  11. ⏳   Audit SEO + corrections site
  12. ⏳   Séquences email HubSpot
```

---

## 10. POINTS D'ATTENTION PERMANENTS

| Règle | Détail |
|-------|--------|
| Répertoire Hostinger simu. | Toujours `/files/public_html/` — jamais `principal/` |
| `default.php.bak` | Ne jamais supprimer ni renommer en `.php` |
| `defer` interdit | Sur les scripts HubSpot dans les pages HTML autonomes |
| HubSpot token | Private App — expire si non utilisé ou révoqué manuellement |
| Quota HubSpot | 1 000 contacts marketing max — nouveaux contacts NON marqués marketing |
| Apporteurs particuliers | Plafond 1 200 €/an — demander SIREN au-delà (6 apports à 200 €) |
| Rémunération Pro | 20 % des honoraires HT **perçus du mandant** (bordereau de commission — EFFY : commissions variables) |
| Confidentialité des taux | Ne jamais afficher les taux sur le site — conventions privées uniquement |
| Kodee (Hostinger AI) | Ses conseils ont été erronés plusieurs fois — toujours vérifier avant d'agir |
| Loi Hoguet | Vérifier qu'un apporteur Pro immo ne touche pas déjà une commission de l'autre partie |

---

*Ce fichier remplace ARCHITECTURE.md comme référence principale de suivi.*
*À mettre à jour après chaque action déployée.*

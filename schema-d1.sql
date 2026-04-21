-- Schema D1 pour Cerveau DECLIC v11
-- Gestion des commissions apporteurs immobilier & rénovation

-- Table: deals (synchronisation HubSpot)
CREATE TABLE IF NOT EXISTS deals (
  id INTEGER PRIMARY KEY,
  hubspot_deal_id TEXT NOT NULL UNIQUE,
  deal_name TEXT NOT NULL,
  deal_type TEXT NOT NULL CHECK(deal_type IN ('immobilier', 'renovation')),
  client_type TEXT NOT NULL CHECK(client_type IN ('Particulier', 'Professionnel')),
  montant_ht REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: commissions (calculs)
CREATE TABLE IF NOT EXISTS commissions (
  id INTEGER PRIMARY KEY,
  deal_id INTEGER NOT NULL,
  hubspot_deal_id TEXT NOT NULL,
  commission_type TEXT NOT NULL CHECK(commission_type IN ('flat', 'percentage')),
  commission_amount REAL NOT NULL,
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deal_id) REFERENCES deals(id),
  UNIQUE(hubspot_deal_id)
);

-- Table: historique (audit trail)
CREATE TABLE IF NOT EXISTS historique (
  id INTEGER PRIMARY KEY,
  hubspot_deal_id TEXT NOT NULL,
  action TEXT NOT NULL,
  ancien_montant REAL,
  nouveau_montant REAL,
  ancienne_commission REAL,
  nouvelle_commission REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes pour performances
CREATE INDEX IF NOT EXISTS idx_deals_hubspot ON deals(hubspot_deal_id);
CREATE INDEX IF NOT EXISTS idx_commissions_deal ON commissions(deal_id);
CREATE INDEX IF NOT EXISTS idx_historique_deal ON historique(hubspot_deal_id);

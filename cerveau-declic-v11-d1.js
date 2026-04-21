/**
 * Cerveau DECLIC v11 — Commission Calculator Worker
 * Cloudflare Worker + D1 Database
 * Commission logic: Particulier €200, Professionnel 20% HT
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // Health check ping endpoint
    if (url.pathname === '/api/ping' && method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST: Calculate commission for a deal
    if (url.pathname === '/api/calculate-commission' && method === 'POST') {
      try {
        const body = await request.json();
        return await calculateCommission(body, env);
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid JSON or missing fields', details: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

/**
 * Calculate commission based on deal type and client type
 * Particulier: €200 flat
 * Professionnel: 20% of HT amount
 */
async function calculateCommission(dealData, env) {
  // Validation
  const { hubspot_deal_id, deal_name, deal_type, client_type, montant_ht } = dealData;

  if (!hubspot_deal_id || !client_type || montant_ht === undefined) {
    return new Response(JSON.stringify({ error: 'Missing required fields: hubspot_deal_id, client_type, montant_ht' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate types
  const validClientTypes = ['Particulier', 'Professionnel'];
  const validDealTypes = ['immobilier', 'renovation'];

  if (!validClientTypes.includes(client_type)) {
    return new Response(JSON.stringify({ error: `Invalid client_type. Must be one of: ${validClientTypes.join(', ')}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (deal_type && !validDealTypes.includes(deal_type)) {
    return new Response(JSON.stringify({ error: `Invalid deal_type. Must be one of: ${validDealTypes.join(', ')}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Calculate commission
  let commission_amount = 0;
  let commission_type = '';

  if (client_type === 'Particulier') {
    commission_amount = 200;
    commission_type = 'flat';
  } else if (client_type === 'Professionnel') {
    commission_amount = (montant_ht * 0.20);
    commission_type = 'percentage';
  }

  // Write to D1 database
  try {
    const db = env.DB;

    // Insert or update deal
    await db.prepare(`
      INSERT INTO deals (hubspot_deal_id, deal_name, deal_type, client_type, montant_ht)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(hubspot_deal_id) DO UPDATE SET
        montant_ht = excluded.montant_ht,
        updated_at = CURRENT_TIMESTAMP
    `).bind(hubspot_deal_id, deal_name || 'Unknown', deal_type || 'unknown', client_type, montant_ht).run();

    // Insert or update commission
    await db.prepare(`
      INSERT INTO commissions (hubspot_deal_id, deal_id, commission_type, commission_amount)
      SELECT ?, id, ?, ? FROM deals WHERE hubspot_deal_id = ?
      ON CONFLICT(hubspot_deal_id) DO UPDATE SET
        commission_amount = excluded.commission_amount,
        calculated_at = CURRENT_TIMESTAMP
    `).bind(hubspot_deal_id, commission_type, commission_amount, hubspot_deal_id).run();

    // Log to historique
    await db.prepare(`
      INSERT INTO historique (hubspot_deal_id, action, nouveau_montant, nouvelle_commission)
      VALUES (?, 'COMMISSION_CALCULATED', ?, ?)
    `).bind(hubspot_deal_id, montant_ht, commission_amount).run();

    return new Response(JSON.stringify({
      success: true,
      hubspot_deal_id,
      deal_name,
      client_type,
      montant_ht,
      commission_type,
      commission_amount,
      calculated_at: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Database operation failed', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

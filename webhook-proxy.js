/**
 * Proxy pour le webhook KkiaPay
 * À déployer sur Vercel, Netlify, ou un autre service
 * 
 * Ce proxy reçoit les webhooks de KkiaPay et les redirige vers Supabase
 * avec le header Authorization requis.
 */

const SUPABASE_URL = 'https://ltvlpmujbodejyeucaha.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dmxwbXVqYm9kZWp5ZXVjYWhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzgxMjA4MiwiZXhwIjoyMDc5Mzg4MDgyfQ.AA7s8m8OUso5lw89d57MAp-dn3VmzxWkWLYRpz1WFEU';

// Pour Vercel
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-kkiapay-secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Webhook reçu de KkiaPay:', JSON.stringify(req.body, null, 2));
    console.log('📋 Headers reçus:', JSON.stringify(req.headers, null, 2));

    // Rediriger vers Supabase avec le header Authorization
    const response = await fetch(`${SUPABASE_URL}/functions/v1/kkiapay-webhook`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        // Transmettre tous les headers de KkiaPay (notamment x-kkiapay-secret)
        ...Object.keys(req.headers)
          .filter(key => key.toLowerCase().startsWith('x-'))
          .reduce((acc, key) => {
            acc[key] = req.headers[key];
            return acc;
          }, {}),
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    console.log('✅ Réponse Supabase:', response.status, data);

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('❌ Erreur proxy:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Pour Netlify Functions (décommentez si vous utilisez Netlify)
/*
exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-kkiapay-secret',
      },
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    console.log('📥 Webhook reçu de KkiaPay:', JSON.stringify(body, null, 2));

    const response = await fetch(`${SUPABASE_URL}/functions/v1/kkiapay-webhook`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        ...Object.keys(event.headers)
          .filter(key => key.toLowerCase().startsWith('x-'))
          .reduce((acc, key) => {
            acc[key] = event.headers[key];
            return acc;
          }, {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('✅ Réponse Supabase:', response.status, data);

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('❌ Erreur proxy:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
*/


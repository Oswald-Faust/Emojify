/**
 * Proxy local pour le webhook KkiaPay
 * Utilisez ngrok pour exposer ce serveur publiquement
 * 
 * Installation :
 * npm install express
 * npm install -g ngrok
 * 
 * Lancement :
 * node webhook-proxy-local.js
 * ngrok http 3000
 * 
 * Utilisez l'URL ngrok dans KkiaPay
 */

import express from 'express';
const app = express();

const SUPABASE_URL = 'https://ltvlpmujbodejyeucaha.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dmxwbXVqYm9kZWp5ZXVjYWhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzgxMjA4MiwiZXhwIjoyMDc5Mzg4MDgyfQ.AA7s8m8OUso5lw89d57MAp-dn3VmzxWkWLYRpz1WFEU';

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-kkiapay-secret');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Webhook reçu de KkiaPay:');
    console.log('   Body:', JSON.stringify(req.body, null, 2));
    console.log('   Headers:', JSON.stringify(req.headers, null, 2));

    // Rediriger vers Supabase avec le header Authorization
    const response = await fetch(`${SUPABASE_URL}/functions/v1/kkiapay-webhook`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        // Transmettre le header x-kkiapay-secret si présent
        ...(req.headers['x-kkiapay-secret'] && {
          'x-kkiapay-secret': req.headers['x-kkiapay-secret']
        }),
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    console.log('✅ Réponse Supabase:', response.status);
    console.log('   Data:', JSON.stringify(data, null, 2));

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('❌ Erreur proxy:', error);
    return res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Proxy webhook démarré sur http://localhost:${PORT}`);
  console.log(`📡 Utilisez ngrok pour exposer ce serveur :`);
  console.log(`   ngrok http ${PORT}`);
  console.log(`\n💡 Dans KkiaPay, utilisez l'URL ngrok : https://xxxx.ngrok.io/webhook`);
});


# 🔧 Solution Proxy pour le Webhook KkiaPay

## Problème

Supabase bloque les requêtes vers les Edge Functions si elles n'ont pas le header `Authorization`. KkiaPay ne peut pas envoyer de headers personnalisés, donc on ne peut pas utiliser directement l'URL Supabase.

## Solution : Créer un endpoint proxy

Créez un endpoint proxy (sur Vercel, Netlify, ou un autre service) qui :
1. Reçoit les webhooks de KkiaPay sans authentification
2. Ajoute le header `Authorization` avec le service_role_key
3. Appelle la fonction Supabase

### Option 1 : Proxy Vercel (Recommandé)

Créez un fichier `api/kkiapay-webhook-proxy.js` dans votre projet Vercel :

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = 'https://ltvlpmujbodejyeucaha.supabase.co';
  const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dmxwbXVqYm9kZWp5ZXVjYWhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzgxMjA4MiwiZXhwIjoyMDc5Mzg4MDgyfQ.AA7s8m8OUso5lw89d57MAp-dn3VmzxWkWLYRpz1WFEU';

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/kkiapay-webhook`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**Dans KkiaPay, configurez l'URL :**
```
https://votre-domaine.vercel.app/api/kkiapay-webhook-proxy
```

### Option 2 : Proxy Netlify

Créez un fichier `netlify/functions/kkiapay-webhook-proxy.js` :

```javascript
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const SUPABASE_URL = 'https://ltvlpmujbodejyeucaha.supabase.co';
  const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dmxwbXVqYm9kZWp5ZXVjYWhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzgxMjA4MiwiZXhwIjoyMDc5Mzg4MDgyfQ.AA7s8m8OUso5lw89d57MAp-dn3VmzxWkWLYRpz1WFEU';

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/kkiapay-webhook`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: event.body,
    });

    const data = await response.json();
    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

### Option 3 : Utiliser un service de proxy simple

Vous pouvez aussi utiliser un service comme :
- https://webhook.site (pour tester)
- Créer un endpoint simple sur votre serveur existant

## Configuration dans KkiaPay

Une fois le proxy créé, configurez dans KkiaPay :

**URL :**
```
https://votre-proxy-url.com/webhook
```

**Secret hash :**
```
4384454ccad340762cfe31f9b6d865f0f398c0f7531c59cda694bb2505f37c0a
```

## Sécurité

⚠️ **Important** : Le service_role_key dans le proxy doit être gardé secret. Utilisez des variables d'environnement :

```javascript
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
```


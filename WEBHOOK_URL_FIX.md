# 🔧 Correction de l'URL du Webhook KkiaPay

## Problème

Supabase retourne `401 Missing authorization header` car il vérifie l'authentification **avant** d'exécuter la fonction.

## Solution

Il faut utiliser le **header Authorization** au lieu de l'apikey dans l'URL.

### Option 1 : Utiliser la clé ANON (JWT) dans le header Authorization

**Dans KkiaPay Dashboard**, configurez l'URL du webhook ainsi :

```
https://ltvlpmujbodejyeucaha.supabase.co/functions/v1/kkiapay-webhook
```

**ET** configurez KkiaPay pour envoyer le header :
```
Authorization: Bearer VOTRE_CLE_ANON
```

**⚠️ Problème** : KkiaPay ne permet peut-être pas d'ajouter des headers personnalisés.

### Option 2 : Utiliser le service_role_key dans l'URL (⚠️ NON RECOMMANDÉ)

Si KkiaPay ne permet pas d'ajouter des headers, vous pouvez utiliser le service_role_key dans l'URL :

```
https://ltvlpmujbodejyeucaha.supabase.co/functions/v1/kkiapay-webhook?apikey=VOTRE_SERVICE_ROLE_KEY
```

**⚠️ ATTENTION** : Le service_role_key donne un accès complet à votre base de données. Ne l'utilisez que si absolument nécessaire et gardez-le secret.

### Option 3 : Créer un endpoint proxy (Recommandé pour production)

Créez un endpoint intermédiaire qui :
1. Reçoit les webhooks de KkiaPay sans authentification
2. Ajoute le header Authorization
3. Appelle la fonction Supabase

## Configuration actuelle recommandée

Pour l'instant, utilisez l'**Option 2** avec le service_role_key uniquement pour tester :

1. Trouvez votre service_role_key dans Supabase Dashboard > Settings > API
2. Dans KkiaPay, configurez l'URL :
   ```
   https://ltvlpmujbodejyeucaha.supabase.co/functions/v1/kkiapay-webhook?apikey=VOTRE_SERVICE_ROLE_KEY
   ```
3. ⚠️ Gardez cette clé secrète et ne la partagez jamais

## Test

Testez avec curl :

```bash
curl -X POST "https://ltvlpmujbodejyeucaha.supabase.co/functions/v1/kkiapay-webhook?apikey=VOTRE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"transactionId":"test","isPaymentSucces":true,"event":"transaction.success","amount":5000}'
```

Si ça fonctionne, vous devriez voir les logs dans Supabase Dashboard.


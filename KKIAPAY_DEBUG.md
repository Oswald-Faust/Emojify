# Guide de débogage KkiaPay

## 🔍 Problèmes courants et solutions

### 1. Erreur 401 sur le webhook Supabase

**Symptôme :** Le webhook retourne une erreur 401 Unauthorized dans Supabase.

**Solution :** Utilisez l'URL du webhook avec la clé API anonyme :

```
https://ltvlpmujbodejyeucaha.supabase.co/functions/v1/kkiapay-webhook?apikey=VOTRE_CLE_API_ANONYME
```

Pour trouver votre clé API anonyme :
1. Allez dans Supabase Dashboard > Settings > API
2. Copiez la clé "anon public"
3. Ajoutez-la à l'URL du webhook dans KkiaPay

### 2. Le paiement réussit sur KkiaPay mais les crédits ne sont pas ajoutés

**Causes possibles :**

1. **Le frontend ne détecte pas le succès** :
   - Vérifiez la console du navigateur pour voir les messages `postMessage`
   - Le listener doit rester actif même après la fermeture du modal
   - Vérifiez que les événements KkiaPay sont bien détectés

2. **Le webhook ne fonctionne pas** :
   - Vérifiez les logs dans Supabase Dashboard > Edge Functions > kkiapay-webhook
   - Vérifiez que l'URL du webhook est correctement configurée dans KkiaPay
   - Vérifiez que les variables d'environnement sont bien configurées

3. **Double ajout de crédits** :
   - Le système vérifie maintenant si la transaction existe déjà avant d'ajouter les crédits
   - Si le webhook traite en premier, le frontend ne rajoutera pas de crédits

### 3. Comment vérifier ce qui se passe

#### Dans le frontend (Console navigateur) :
- `📨 Message postMessage reçu:` - Tous les messages postMessage
- `✅ Événement KkiaPay détecté:` - Événement KkiaPay détecté
- `📥 Webhook KkiaPay reçu:` - Webhook reçu (dans les logs Supabase)

#### Dans Supabase :
1. Allez dans **Edge Functions** > **kkiapay-webhook** > **Logs**
2. Vérifiez les logs pour voir si le webhook est appelé
3. Vérifiez les **Invocations** pour voir les détails de chaque appel

#### Dans KkiaPay :
1. Allez dans votre tableau de bord KkiaPay
2. Vérifiez les transactions pour voir leur statut
3. Vérifiez les logs de webhook pour voir si les appels sont envoyés

### 4. Flux de paiement attendu

1. **Utilisateur clique sur "Payer"**
   - Le widget KkiaPay s'ouvre
   - Le listener `postMessage` est configuré

2. **Utilisateur complète le paiement sur KkiaPay**
   - KkiaPay envoie un événement `postMessage` au frontend
   - KkiaPay envoie aussi un webhook à Supabase

3. **Frontend détecte le succès** :
   - Le listener capture l'événement `postMessage`
   - Les crédits sont ajoutés (si pas déjà fait par le webhook)
   - Le modal affiche le succès

4. **Webhook traite le paiement** :
   - Supabase reçoit le webhook
   - Les crédits sont ajoutés (si pas déjà fait par le frontend)
   - La transaction est enregistrée

### 5. Vérification manuelle

Pour vérifier manuellement si une transaction a été traitée :

```sql
-- Dans Supabase SQL Editor
SELECT * FROM transactions 
WHERE provider = 'kkiapay' 
ORDER BY created_at DESC 
LIMIT 10;
```

Pour vérifier les crédits d'un utilisateur :

```sql
SELECT id, email, credits, is_pro 
FROM profiles 
WHERE email = 'votre-email@example.com';
```

### 6. Test du webhook manuellement

Vous pouvez tester le webhook avec curl :

```bash
curl -X POST https://ltvlpmujbodejyeucaha.supabase.co/functions/v1/kkiapay-webhook?apikey=VOTRE_CLE \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "test-123",
    "status": "SUCCESS",
    "amount": 5000,
    "email": "test@example.com",
    "data": "{\"userId\":\"USER_ID\",\"credits\":50}"
  }'
```

Remplacez `USER_ID` par l'ID réel d'un utilisateur de test.

## 📝 Checklist de débogage

- [ ] Le widget KkiaPay s'ouvre correctement
- [ ] Les messages `postMessage` apparaissent dans la console
- [ ] Les événements KkiaPay sont détectés
- [ ] Le webhook est configuré avec la bonne URL (avec clé API)
- [ ] Les variables d'environnement Supabase sont configurées
- [ ] Les logs Supabase montrent que le webhook est appelé
- [ ] La transaction est enregistrée dans la table `transactions`
- [ ] Les crédits sont ajoutés dans la table `profiles`
- [ ] Le statut `is_pro` est mis à `true`


# 🔧 Dépannage Webhook KkiaPay - Erreur 401

## Problème : Erreur 401 "Signature manquante"

Si vous voyez une erreur 401 avec le message "Signature manquante", cela signifie que :
- ✅ Le secret hash est configuré dans Supabase
- ❌ Le secret hash n'est **pas encore configuré** dans KkiaPay Dashboard
- ❌ Ou KkiaPay n'envoie pas l'en-tête `x-kkiapay-secret`

## Solution 1 : Configurer le secret hash dans KkiaPay (Recommandé)

1. Allez dans votre [KkiaPay Dashboard](https://kkiapay.me)
2. Naviguez vers **Développeurs** > **Webhook**
3. Trouvez votre webhook et cliquez sur **"Modifier"** (ou créez-en un nouveau)
4. Dans le champ **"Secret hash"**, entrez exactement :
   ```
   4384454ccad340762cfe31f9b6d865f0f398c0f7531c59cda694bb2505f37c0a
   ```
5. **Sauvegardez** le webhook
6. Testez à nouveau

## Solution 2 : Désactiver temporairement la vérification (Pour tester)

Si vous voulez tester rapidement sans configurer le secret hash dans KkiaPay :

```bash
# Supprimer temporairement le secret hash
supabase secrets unset KKIAPAY_WEBHOOK_SECRET_HASH
```

⚠️ **Attention** : Cela désactive la sécurité du webhook. Utilisez uniquement pour tester en mode sandbox.

Pour le réactiver plus tard :
```bash
supabase secrets set KKIAPAY_WEBHOOK_SECRET_HASH=4384454ccad340762cfe31f9b6d865f0f398c0f7531c59cda694bb2505f37c0a
```

## Vérification

Après avoir configuré le secret hash dans KkiaPay :

1. **Testez un paiement** en mode sandbox
2. **Vérifiez les logs** dans Supabase Dashboard > Edge Functions > kkiapay-webhook > Logs
3. Vous devriez voir :
   - `🔐 Secret hash configuré: Oui`
   - `📨 Signature reçue: 4384454ccad340762cfe31f9b6d865f0f398c0f7531c59cda694bb2505f37c0a`
   - `✅ Signature vérifiée avec succès`

## Autres causes possibles

### Le secret hash est différent
- Vérifiez que le secret hash est **exactement identique** dans KkiaPay et Supabase
- Pas d'espaces avant/après
- Même casse (majuscules/minuscules)

### KkiaPay n'envoie pas le header
- Certaines versions de KkiaPay peuvent ne pas envoyer le header si le secret n'est pas configuré
- Vérifiez les logs Supabase pour voir tous les headers reçus
- Le header peut avoir un nom différent (`X-Kkiapay-Secret` au lieu de `x-kkiapay-secret`)

## Logs à vérifier

Dans Supabase Dashboard > Edge Functions > kkiapay-webhook > Logs, cherchez :

```
📋 Headers reçus: {...}
🔐 Secret hash configuré: Oui/Non
📨 Signature reçue: ...
```

Ces logs vous diront exactement ce qui se passe.


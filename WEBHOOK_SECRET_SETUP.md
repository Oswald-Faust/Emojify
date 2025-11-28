# 🔒 Configuration du Secret Hash pour le Webhook KkiaPay

## Pourquoi le Secret Hash est important ?

Le secret hash permet de **sécuriser votre webhook** en vérifiant que les requêtes proviennent bien de KkiaPay et n'ont pas été modifiées. C'est une protection essentielle contre les attaques.

## 📝 Étapes de configuration

### Étape 1 : Générer un Secret Hash

Vous pouvez générer un secret hash sécurisé de plusieurs façons :

**Option A : Avec OpenSSL (recommandé)**
```bash
openssl rand -hex 32
```

**Option B : Avec Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option C : Générateur en ligne**
- Allez sur https://randomkeygen.com/
- Utilisez un "CodeIgniter Encryption Keys" ou "Fort Knox Password"
- Copiez la clé générée

**Exemple de secret hash :**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Étape 2 : Configurer dans KkiaPay

1. Allez dans votre [tableau de bord KkiaPay](https://kkiapay.me)
2. Naviguez vers **Développeurs** > **Webhook**
3. Cliquez sur **"+ Ajouter un webhook"**
4. Remplissez le formulaire :
   - **URL** : `https://ltvlpmujbodejyeucaha.supabase.co/functions/v1/kkiapay-webhook?apikey=VOTRE_CLE_API_ANONYME`
   - **Secret hash** : Collez le secret hash que vous avez généré à l'étape 1
   - **Événements** : Cochez "Transactions succès" (et optionnellement "Transactions échecs")
5. Cliquez sur **"Créer un webhook"**

### Étape 3 : Configurer dans Supabase

Une fois le webhook créé dans KkiaPay, configurez le même secret hash dans Supabase :

```bash
# Remplacez VOTRE_SECRET_HASH par exactement le même secret que vous avez mis dans KkiaPay
supabase secrets set KKIAPAY_WEBHOOK_SECRET_HASH=VOTRE_SECRET_HASH
```

**Exemple :**
```bash
supabase secrets set KKIAPAY_WEBHOOK_SECRET_HASH=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Étape 4 : Redéployer la fonction (si nécessaire)

Si vous avez déjà déployé la fonction, vous n'avez pas besoin de la redéployer. Les secrets sont mis à jour automatiquement.

Si c'est la première fois :
```bash
supabase functions deploy kkiapay-webhook
```

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. **Testez un paiement** en mode sandbox
2. **Vérifiez les logs** dans Supabase Dashboard > Edge Functions > kkiapay-webhook > Logs
3. Vous devriez voir : `✅ Signature vérifiée avec succès`

Si vous voyez `❌ Signature invalide`, vérifiez que :
- Le secret hash dans KkiaPay est **exactement le même** que dans Supabase
- Il n'y a pas d'espaces avant/après le secret
- Les caractères sont bien copiés (pas de caractères invisibles)

## 🔒 Sécurité

- ✅ **Ne partagez jamais** le secret hash publiquement
- ✅ **Utilisez un secret différent** pour chaque environnement (sandbox/production)
- ✅ **Changez le secret** si vous pensez qu'il a été compromis
- ✅ **Activez la vérification** en production (même si optionnel en sandbox)

## ⚠️ Mode Sandbox vs Production

- **Sandbox** : Vous pouvez laisser le secret hash vide pour tester rapidement
- **Production** : **OBLIGATOIRE** de configurer un secret hash pour sécuriser votre webhook

## 🐛 Dépannage

### Erreur "Signature manquante"
- Vérifiez que KkiaPay envoie bien l'en-tête `x-kkiapay-secret`
- Vérifiez les logs Supabase pour voir les headers reçus

### Erreur "Signature invalide"
- Vérifiez que le secret hash est **exactement identique** dans KkiaPay et Supabase
- Vérifiez qu'il n'y a pas d'espaces ou de caractères invisibles
- Regénérez le secret hash et reconfigurez-le des deux côtés

### Le webhook fonctionne sans secret hash
- C'est normal en mode sandbox
- En production, configurez toujours un secret hash pour la sécurité


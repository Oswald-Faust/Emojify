# Configuration KkiaPay - Informations importantes

## ✅ Clés API configurées

Vos clés KkiaPay ont été configurées dans les fichiers `.env` et `.env.local`.

**⚠️ IMPORTANT :**
- **Public Key** : Utilisée côté client (déjà configurée) ✅
- **Private Key** : À garder secrète, peut être utilisée pour certaines opérations backend
- **Secret Key** : À garder secrète, utilisée pour vérifier les webhooks

## 🔗 URL du Webhook à configurer dans KkiaPay

Dans votre tableau de bord KkiaPay, configurez cette URL comme webhook :

**⚠️ IMPORTANT : Utilisez l'URL avec la clé API anonyme pour éviter l'erreur 401 :**

```
https://ltvlpmujbodejyeucaha.supabase.co/functions/v1/kkiapay-webhook?apikey=VOTRE_CLE_API_ANONYME
```

Ou si vous préférez, vous pouvez utiliser l'URL sans clé API, mais vous devrez configurer la fonction pour qu'elle soit publique dans les paramètres Supabase.

### Comment configurer le webhook :

1. **Générez un Secret Hash** (optionnel mais recommandé pour la sécurité) :
   - Utilisez un générateur de clés sécurisé (ex: `openssl rand -hex 32`)
   - Ou utilisez un générateur en ligne comme https://randomkeygen.com/
   - **Notez ce secret hash** - vous devrez le configurer dans Supabase aussi

2. **Dans KkiaPay Dashboard** :
   - Connectez-vous à votre [tableau de bord KkiaPay](https://kkiapay.me)
   - Allez dans la section "Développeurs" > "Webhook"
   - Cliquez sur "+ Ajouter un webhook"
   - Remplissez le formulaire :
     - **URL** : `https://ltvlpmujbodejyeucaha.supabase.co/functions/v1/kkiapay-webhook?apikey=VOTRE_CLE_API_ANONYME`
     - **Secret hash** : Entrez le secret hash que vous avez généré (ou laissez vide pour tester, mais configurez-le en production)
     - **Événements** : Cochez au minimum "Transactions succès"
   - Cliquez sur "Créer un webhook"

3. **Configurez le secret hash dans Supabase** (voir section ci-dessous)

## 🚀 Déploiement de la fonction webhook

Avant de pouvoir recevoir les webhooks, vous devez déployer la fonction Supabase Edge :

```bash
# Installer Supabase CLI si ce n'est pas déjà fait
npm install -g supabase

# Se connecter à votre projet
supabase login

# Lier votre projet (remplacez par votre project ref)
supabase link --project-ref ltvlpmujbodejyeucaha

# Déployer la fonction webhook
supabase functions deploy kkiapay-webhook
```

### Variables d'environnement pour la fonction

**🔒 IMPORTANT : Configuration du Secret Hash pour sécuriser le webhook**

1. **Dans KkiaPay Dashboard** :
   - Allez dans Webhooks > Ajouter un webhook
   - Définissez un **Secret hash** (vous pouvez générer une chaîne aléatoire sécurisée)
   - **Copiez ce secret hash** - vous en aurez besoin pour Supabase

2. **Dans Supabase** :
   - Ajoutez le secret hash comme variable d'environnement :

```bash
# Remplacez VOTRE_SECRET_HASH par le secret hash que vous avez défini dans KkiaPay
supabase secrets set KKIAPAY_WEBHOOK_SECRET_HASH=VOTRE_SECRET_HASH
```

**Exemple de génération d'un secret hash sécurisé :**
```bash
# Vous pouvez générer un secret hash avec openssl
openssl rand -hex 32

# Ou utiliser un générateur en ligne comme https://randomkeygen.com/
```

**⚠️ Note de sécurité :**
- Le secret hash doit être le **même** dans KkiaPay et dans Supabase
- Ne partagez jamais ce secret hash publiquement
- Le webhook vérifiera automatiquement la signature pour s'assurer que les requêtes viennent bien de KkiaPay

## 🧪 Test en mode Sandbox

KkiaPay fournit un environnement de test. Pour tester :

1. Utilisez votre Public Key en mode sandbox
2. Le widget détectera automatiquement le mode sandbox en développement
3. Utilisez les numéros de test fournis par KkiaPay

## 📝 Notes de sécurité

- ✅ **Public Key** : Peut être exposée côté client (déjà dans .env)
- 🔒 **Private Key** : Ne jamais exposer, garder secrète
- 🔒 **Secret Key** : Ne jamais exposer, utiliser uniquement dans les fonctions backend

## ✅ Prochaines étapes

1. ✅ Clés API configurées
2. ⏳ Déployer la fonction webhook Supabase
3. ⏳ Configurer l'URL du webhook dans KkiaPay
4. ⏳ Tester un paiement en mode sandbox
5. ⏳ Passer en production une fois les tests validés

## 🐛 En cas de problème

- Vérifiez que la fonction webhook est bien déployée
- Vérifiez les logs dans Supabase Dashboard > Edge Functions
- Vérifiez les logs dans votre tableau de bord KkiaPay
- Contactez le support KkiaPay si nécessaire


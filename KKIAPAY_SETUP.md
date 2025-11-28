# Configuration KkiaPay - Guide d'intégration

Ce guide vous explique comment configurer KkiaPay pour les paiements Mobile Money dans votre application.

## 📋 Prérequis

1. Créer un compte marchand sur [KkiaPay](https://kkiapay.me)
2. Obtenir vos clés API (Public Key et Secret Key) depuis le tableau de bord
3. Configurer votre URL de webhook dans le tableau de bord KkiaPay

## 🔑 Configuration des variables d'environnement

Ajoutez votre clé API publique KkiaPay dans votre fichier `.env.local` :

```env
VITE_KKIAPAY_PUBLIC_KEY=votre_cle_publique_kkiapay
```

### Mode Sandbox vs Production

- **Sandbox** : Activé automatiquement en mode développement (`npm run dev`)
- **Production** : Activé automatiquement en mode production (`npm run build`)

## 🚀 Utilisation

### 1. Dans le composant PricingView

Le composant `KkiaPayPayment` est déjà intégré et s'ouvre automatiquement quand l'utilisateur choisit "Mobile Money" dans le modal de choix de paiement.

### 2. Flux de paiement

1. L'utilisateur clique sur "Payer 5000 FCFA"
2. Un modal s'ouvre avec deux options : Mobile Money (KkiaPay) ou Carte Bancaire (Stripe)
3. Si Mobile Money est sélectionné, le widget KkiaPay s'ouvre
4. L'utilisateur complète le paiement via Mobile Money (MTN, Moov, Orange Money)
5. Les crédits sont ajoutés automatiquement après confirmation

## 🔔 Configuration des Webhooks

Pour recevoir les notifications de paiement de manière sécurisée, configurez votre webhook dans le tableau de bord KkiaPay :

**URL du webhook :**
```
https://votre-projet.supabase.co/functions/v1/kkiapay-webhook
```

### Déploiement de la fonction webhook

```bash
# Installer Supabase CLI si ce n'est pas déjà fait
npm install -g supabase

# Se connecter à votre projet
supabase login

# Lier votre projet
supabase link --project-ref votre-project-ref

# Déployer la fonction webhook
supabase functions deploy kkiapay-webhook
```

## 📝 Structure des données

### Transaction enregistrée

Quand un paiement est réussi, une transaction est enregistrée dans Supabase avec :

- `user_id` : ID de l'utilisateur
- `amount` : Montant payé (5000 FCFA)
- `currency` : XOF
- `credits_added` : Nombre de crédits ajoutés (50)
- `plan_name` : "Mode Pro"
- `provider` : "kkiapay"
- `status` : "completed"

## 🧪 Test en mode Sandbox

KkiaPay fournit des numéros de test pour le mode sandbox :

- **MTN** : Utilisez un numéro de test MTN
- **Moov** : Utilisez un numéro de test Moov
- **Orange Money** : Utilisez un numéro de test Orange

Consultez la [documentation KkiaPay](https://docs.kkiapay.me) pour les numéros de test à jour.

## 🔒 Sécurité

- Ne jamais exposer votre Secret Key côté client
- Utiliser uniquement la Public Key dans le frontend
- Vérifier les webhooks avec la signature (à implémenter si KkiaPay le supporte)
- Utiliser HTTPS en production

## 📚 Documentation

- [Documentation officielle KkiaPay](https://docs.kkiapay.me)
- [API Reference](https://docs.kkiapay.me/api)
- [Support KkiaPay](https://kkiapay.me/support)

## ⚠️ Notes importantes

1. **Frais** : KkiaPay prend environ 1.5-2% de commission sur chaque transaction Mobile Money
2. **Délais** : Les paiements Mobile Money peuvent prendre quelques minutes à être confirmés
3. **Support** : En cas de problème, contactez le support KkiaPay ou vérifiez les logs dans votre tableau de bord

## 🐛 Dépannage

### Le widget ne s'ouvre pas

- Vérifiez que `VITE_KKIAPAY_PUBLIC_KEY` est bien configuré
- Vérifiez la console du navigateur pour les erreurs
- Assurez-vous que le script KkiaPay est bien chargé

### Le paiement échoue

- Vérifiez que vous utilisez les bonnes clés API (sandbox vs production)
- Vérifiez que le montant est correct (en FCFA)
- Vérifiez les logs dans le tableau de bord KkiaPay

### Les crédits ne sont pas ajoutés

- Vérifiez que le webhook est bien configuré
- Vérifiez les logs de la fonction Supabase Edge
- Vérifiez que la transaction est bien enregistrée dans Supabase


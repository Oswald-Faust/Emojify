# 🧪 Tester le Webhook KkiaPay en Local

## Étapes pour tester en local

### 1. Installer ngrok

```bash
# Sur macOS avec Homebrew
brew install ngrok

# Ou téléchargez depuis https://ngrok.com/download
```

### 2. Lancer le proxy local

Dans un terminal :

```bash
node webhook-proxy-local.js
```

Vous devriez voir :
```
🚀 Proxy webhook démarré sur http://localhost:3000
📡 Utilisez ngrok pour exposer ce serveur :
   ngrok http 3000
```

### 3. Exposer avec ngrok

Dans un **autre terminal**, lancez :

```bash
ngrok http 3000
```

Vous obtiendrez une URL comme :
```
Forwarding  https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3000
```

### 4. Configurer dans KkiaPay

Dans KkiaPay Dashboard > Webhooks :

**URL :**
```
https://xxxx-xx-xx-xx-xx.ngrok-free.app/webhook
```
(Remplacez par votre URL ngrok)

**Secret hash :**
```
4384454ccad340762cfe31f9b6d865f0f398c0f7531c59cda694bb2505f37c0a
```

### 5. Tester

1. Effectuez un paiement test dans votre application
2. Regardez les logs dans le terminal où tourne `webhook-proxy-local.js`
3. Vérifiez les logs dans Supabase Dashboard > Edge Functions > kkiapay-webhook > Logs

## Dépannage

### ngrok demande une authentification
- Créez un compte gratuit sur https://ngrok.com
- Ajoutez votre token : `ngrok config add-authtoken VOTRE_TOKEN`

### Le proxy ne démarre pas
- Vérifiez que le port 3000 n'est pas déjà utilisé
- Changez le port dans `webhook-proxy-local.js` si nécessaire

### KkiaPay ne peut pas atteindre l'URL
- Vérifiez que ngrok est bien lancé
- Vérifiez que l'URL dans KkiaPay est correcte (avec `/webhook` à la fin)


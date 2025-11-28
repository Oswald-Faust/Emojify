# 🎯 Guide Simple : Tester le Webhook KkiaPay

## 📖 Explication Simple

**Le problème :** 
- KkiaPay veut envoyer des notifications à votre application quand un paiement réussit
- Mais Supabase bloque ces notifications car elles n'ont pas le bon mot de passe (header Authorization)
- KkiaPay ne peut pas ajouter ce mot de passe automatiquement

**La solution :**
- On crée un "pont" (proxy) entre KkiaPay et Supabase
- Ce pont reçoit les notifications de KkiaPay
- Le pont ajoute le mot de passe et les envoie à Supabase
- Ce pont tourne sur votre ordinateur (localhost:3000)
- On utilise ngrok pour rendre ce pont accessible depuis Internet

## 🚀 Étapes Simples

### Étape 1 : Lancer le pont (proxy)

Ouvrez un terminal et tapez :

```bash
cd /Users/oswaldfaust/Downloads/emojify
node webhook-proxy-local.js
```

Vous devriez voir :
```
🚀 Proxy webhook démarré sur http://localhost:3000
```

**Laissez ce terminal ouvert !**

### Étape 2 : Exposer le pont sur Internet avec ngrok

Ouvrez un **NOUVEAU terminal** et tapez :

```bash
ngrok http 3000
```

Vous verrez quelque chose comme :
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

**Copiez l'URL https://abc123.ngrok-free.app** (la vôtre sera différente)

**Laissez ce terminal ouvert aussi !**

### Étape 3 : Configurer dans KkiaPay

1. Allez dans KkiaPay Dashboard > Webhooks
2. Cliquez sur "Modifier" votre webhook existant
3. Dans "URL", mettez :
   ```
   https://VOTRE-URL-NGROK.ngrok-free.app/webhook
   ```
   (Remplacez par votre URL ngrok de l'étape 2)

4. Dans "Secret hash", mettez :
   ```
   4384454ccad340762cfe31f9b6d865f0f398c0f7531c59cda694bb2505f37c0a
   ```

5. Sauvegardez

### Étape 4 : Tester

1. Faites un paiement test dans votre application
2. Regardez le terminal où tourne `webhook-proxy-local.js` - vous devriez voir les notifications
3. Vérifiez dans Supabase Dashboard > Edge Functions > kkiapay-webhook > Logs

## ⚠️ Important

- **Gardez les 2 terminaux ouverts** pendant les tests
- Si vous fermez ngrok, l'URL change et il faut la remettre dans KkiaPay
- Pour la production, vous devrez déployer le proxy sur un serveur permanent (Vercel, etc.)

## 🐛 Si ça ne marche pas

### ngrok demande un compte
1. Allez sur https://ngrok.com et créez un compte gratuit
2. Copiez votre token
3. Dans le terminal : `ngrok config add-authtoken VOTRE_TOKEN`
4. Relancez `ngrok http 3000`

### Le proxy ne démarre pas
- Vérifiez que le port 3000 n'est pas utilisé : `lsof -i :3000`
- Si oui, tuez le processus ou changez le port dans `webhook-proxy-local.js`


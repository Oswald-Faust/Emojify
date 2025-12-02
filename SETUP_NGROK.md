# 🔐 Configuration de ngrok (1 seule fois)

## Pourquoi ngrok a besoin d'un compte ?

ngrok est un service gratuit qui permet de rendre votre ordinateur accessible depuis Internet. Ils demandent un compte pour éviter les abus.

## Étapes (2 minutes)

### 1. Créer un compte ngrok

1. Allez sur https://dashboard.ngrok.com/signup
2. Créez un compte gratuit (email + mot de passe)
3. C'est gratuit, pas besoin de carte bancaire

### 2. Récupérer votre token

1. Une fois connecté, allez sur https://dashboard.ngrok.com/get-started/your-authtoken
2. Vous verrez votre token (quelque chose comme `2abc123def456...`)
3. **Copiez ce token**

### 3. Configurer ngrok sur votre ordinateur

Dans un terminal, tapez :

```bash
ngrok config add-authtoken VOTRE_TOKEN_ICI
```

(Remplacez `VOTRE_TOKEN_ICI` par le token que vous avez copié)

**C'est tout !** Vous n'aurez plus besoin de le refaire.

### 4. Relancer le script

```bash
./start-webhook-proxy.sh
```

Maintenant ça devrait fonctionner et vous donner l'URL ngrok !






#!/bin/bash

echo "🚀 Démarrage du proxy webhook..."
echo ""

# Vérifier si le port 3000 est utilisé
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Le port 3000 est déjà utilisé"
    echo "   Arrêt du processus existant..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Démarrer le proxy en arrière-plan
echo "📡 Démarrage du proxy sur le port 3000..."
node webhook-proxy-local.js &
PROXY_PID=$!

# Attendre que le proxy démarre
sleep 2

# Vérifier que le proxy fonctionne
if curl -s http://localhost:3000/webhook -X POST -H "Content-Type: application/json" -d '{"test":true}' > /dev/null 2>&1; then
    echo "✅ Proxy démarré avec succès (PID: $PROXY_PID)"
else
    echo "❌ Erreur: Le proxy n'a pas démarré correctement"
    kill $PROXY_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🌐 Démarrage de ngrok..."
echo ""

# Démarrer ngrok
ngrok http 3000 &
NGROK_PID=$!

# Attendre que ngrok démarre
sleep 3

# Récupérer l'URL ngrok
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "⚠️  ngrok démarre mais l'URL n'est pas encore disponible"
    echo "   Ouvrez http://localhost:4040 dans votre navigateur pour voir l'URL"
    echo ""
    echo "💡 Une fois que vous avez l'URL, configurez-la dans KkiaPay :"
    echo "   URL: ${NGROK_URL}/webhook"
    echo "   Secret hash: 4384454ccad340762cfe31f9b6d865f0f398c0f7531c59cda694bb2505f37c0a"
else
    echo "✅ ngrok démarré avec succès"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 CONFIGUREZ DANS KKIAPAY :"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "URL du webhook :"
    echo "  ${NGROK_URL}/webhook"
    echo ""
    echo "Secret hash :"
    echo "  4384454ccad340762cfe31f9b6d865f0f398c0f7531c59cda694bb2505f37c0a"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

echo ""
echo "⚠️  IMPORTANT : Gardez ce terminal ouvert !"
echo "   Appuyez sur Ctrl+C pour arrêter le proxy et ngrok"
echo ""

# Attendre que l'utilisateur appuie sur Ctrl+C
trap "echo ''; echo '🛑 Arrêt du proxy et ngrok...'; kill $PROXY_PID $NGROK_PID 2>/dev/null; exit" INT

# Garder le script actif
wait


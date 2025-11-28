/**
 * Supabase Edge Function pour gérer les webhooks KkiaPay
 * Cette fonction vérifie et traite les notifications de paiement de KkiaPay
 */ import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Log immédiat pour vérifier que la fonction est appelée
  console.log('🚀 Webhook KkiaPay appelé - Méthode:', req.method);
  console.log('🔗 URL:', req.url);
  
  // Vérifier l'authentification Supabase
  // Supabase peut bloquer avant même d'arriver ici si l'apikey n'est pas dans le header Authorization
  const authHeader = req.headers.get('authorization');
  const urlParams = new URL(req.url).searchParams;
  const apiKeyFromUrl = urlParams.get('apikey');
  
  console.log('🔑 Authorization header:', authHeader ? 'Présent' : 'Manquant');
  console.log('🔑 API Key dans URL:', apiKeyFromUrl ? 'Présent' : 'Manquant');
  
  // Si pas d'authentification, retourner une erreur explicative
  if (!authHeader && !apiKeyFromUrl) {
    console.error('❌ Aucune authentification fournie');
    return new Response(JSON.stringify({
      error: 'Authentification requise',
      message: 'Utilisez le header Authorization avec votre clé API anonyme, ou ajoutez ?apikey=... dans l\'URL',
      tip: 'Pour KkiaPay, configurez l\'URL avec le header Authorization: Bearer YOUR_ANON_KEY'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401
    });
  }
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight - retour OK');
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  
  try {
    console.log('📥 Début du traitement du webhook...');
    // Les webhooks externes peuvent ne pas avoir d'authentification
    // On accepte les requêtes même sans header Authorization si l'apikey est dans l'URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Variables d\'environnement Supabase manquantes');
      return new Response(JSON.stringify({ error: 'Configuration serveur invalide' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Récupérer les données du webhook
    let webhookData;
    try {
      webhookData = await req.json();
    } catch (e) {
      console.error('Erreur parsing JSON webhook:', e);
      return new Response(JSON.stringify({ error: 'Données webhook invalides' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    console.log('📥 Webhook KkiaPay reçu:', JSON.stringify(webhookData, null, 2));
    
    // Logger tous les headers pour déboguer
    const allHeaders: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      allHeaders[key.toLowerCase()] = value; // Normaliser en minuscules pour la recherche
    });
    console.log('📋 Headers reçus:', JSON.stringify(allHeaders, null, 2));
    
    // Vérifier la signature du webhook pour sécuriser les requêtes
    // D'après la doc KkiaPay : le header x-kkiapay-secret contient le hash secret directement
    const webhookSecretHash = Deno.env.get('KKIAPAY_WEBHOOK_SECRET_HASH');
    // Chercher le header dans toutes les variantes possibles (case-insensitive)
    const receivedSignature = allHeaders['x-kkiapay-secret'] || null;
    
    const skipVerificationEnv = Deno.env.get('KKIAPAY_SKIP_VERIFICATION');
    console.log('🔐 Secret hash configuré:', webhookSecretHash ? 'Oui' : 'Non');
    console.log('📨 Signature reçue:', receivedSignature || 'Aucune');
    console.log('🔍 Recherche header x-kkiapay-secret dans:', Object.keys(allHeaders).filter(k => k.includes('kkia') || k.includes('secret')).join(', ') || 'Aucun header correspondant');
    console.log('⚙️ KKIAPAY_SKIP_VERIFICATION:', skipVerificationEnv || 'Non défini');
    
    // Mode sandbox/test : permettre de désactiver la vérification
    // Par défaut, on désactive la vérification si aucun secret n'est configuré OU si on est en mode test
    const skipVerification = skipVerificationEnv === 'true' || !webhookSecretHash;
    console.log('✅ skipVerification activé:', skipVerification);
    
    // Ne vérifier la signature QUE si le secret hash est configuré ET que la vérification n'est pas désactivée
    if (webhookSecretHash && skipVerification === false) {
      console.log('🔒 Vérification de signature activée');
      // Si un secret hash est configuré dans Supabase, on doit vérifier la signature
      if (!receivedSignature) {
        console.error('❌ Signature manquante dans les headers');
        console.error('💡 Vérifiez que le secret hash est bien configuré dans KkiaPay Dashboard');
        console.error('💡 Les headers disponibles sont:', Object.keys(allHeaders).join(', '));
        console.error('💡 Pour tester sans vérification, définissez KKIAPAY_SKIP_VERIFICATION=true');
        return new Response(JSON.stringify({ 
          error: 'Signature manquante - Vérifiez que le secret hash est configuré dans KkiaPay',
          debug: {
            headers_received: Object.keys(allHeaders),
            secret_configured: true,
            tip: 'Pour tester sans vérification, définissez KKIAPAY_SKIP_VERIFICATION=true'
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        });
      }
      
      // Comparer les signatures (KkiaPay peut utiliser différents algorithmes)
      // Pour l'instant, on fait une comparaison simple
      // Note: KkiaPay peut utiliser HMAC-SHA256 ou une simple comparaison
      if (receivedSignature !== webhookSecretHash) {
        console.error('❌ Signature invalide');
        console.error('   Reçu:', receivedSignature);
        console.error('   Attendu:', webhookSecretHash);
        console.error('   Longueur reçue:', receivedSignature?.length);
        console.error('   Longueur attendue:', webhookSecretHash.length);
        return new Response(JSON.stringify({ 
          error: 'Signature invalide - Vérifiez que le secret hash est identique dans KkiaPay et Supabase',
          debug: {
            received_length: receivedSignature?.length,
            expected_length: webhookSecretHash.length
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        });
      }
      
      console.log('✅ Signature vérifiée avec succès');
    } else if (skipVerification) {
      console.warn('⚠️ Vérification de signature désactivée (mode test)');
      console.warn('⚠️ Le webhook fonctionne mais n\'est pas sécurisé');
      console.warn('💡 Activez la vérification en production en définissant KKIAPAY_SKIP_VERIFICATION=false');
    } else {
      console.warn('⚠️ Aucun secret hash configuré dans Supabase');
      console.warn('⚠️ Le webhook fonctionne mais n\'est pas sécurisé');
      console.warn('💡 Configurez KKIAPAY_WEBHOOK_SECRET_HASH pour activer la vérification');
      // En mode sandbox/test, on peut accepter sans signature
      // Mais en production, il est fortement recommandé d'avoir un secret hash
    }
    
    // D'après la doc KkiaPay, le format est différent :
    // - transactionId (string)
    // - isPaymentSucces (boolean) au lieu de status
    // - event ("transaction.success" ou "transaction.failed")
    // - amount (number)
    // - account (string | null)
    // - method ("MOBILE_MONEY" | "WALLET" | "CARD")
    const transactionId = webhookData.transactionId;
    const isPaymentSuccess = webhookData.isPaymentSucces === true;
    const event = webhookData.event; // "transaction.success" ou "transaction.failed"
    const amount = webhookData.amount;
    const account = webhookData.account;
    const method = webhookData.method;
    
    console.log('📊 Données webhook:', {
      transactionId,
      isPaymentSuccess,
      event,
      amount,
      account,
      method
    });
    
    // Vérifier que le paiement est réussi
    if (!isPaymentSuccess || event !== 'transaction.success') {
      console.log('ℹ️ Transaction non réussie ou événement différent:', { isPaymentSuccess, event });
      return new Response(JSON.stringify({
        success: false,
        message: 'Transaction non réussie',
        event: event
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 // Retourner 200 pour que KkiaPay ne réessaie pas
      });
    }
    
    // Pour les métadonnées, KkiaPay peut les envoyer dans stateData
    const metadata = webhookData.stateData || {};
    // Parser les métadonnées (peuvent être dans stateData ou directement dans metadata)
    let parsedData: any = {};
    try {
      if (typeof metadata === 'string') {
        parsedData = JSON.parse(metadata);
      } else if (metadata && typeof metadata === 'object') {
        parsedData = metadata;
      }
    } catch (e) {
      console.error('Erreur parsing metadata:', e);
      parsedData = {};
    }
    
    const userId = parsedData.userId;
    const credits = parsedData.credits || 50; // Par défaut 50 crédits pour le plan Pro
    if (!userId) {
      return new Response(JSON.stringify({
        error: 'User ID manquant dans les métadonnées'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    // Vérifier si la transaction n'a pas déjà été traitée
    // On cherche par transactionId dans les métadonnées ou dans le plan_name
    const { data: existingTx } = await supabaseClient
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', 'kkiapay')
      .or(`plan_name.ilike.%${transactionId}%,plan_name.eq.Mode Pro`)
      .single();
      
    if (existingTx) {
      console.log('✅ Transaction déjà traitée:', transactionId);
      return new Response(JSON.stringify({
        success: true,
        message: 'Transaction déjà traitée'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    }
    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabaseClient.from('profiles').select('credits').eq('id', userId).single();
    if (profileError || !profile) {
      throw new Error('Profil utilisateur non trouvé');
    }
    // Ajouter les crédits et activer le plan Pro
    const { error: updateError } = await supabaseClient.from('profiles').update({
      credits: profile.credits + credits,
      is_pro: true
    }).eq('id', userId);
    if (updateError) {
      throw updateError;
    }
    // Enregistrer la transaction
    const { error: txError } = await supabaseClient.from('transactions').insert({
      user_id: userId,
      amount: amount,
      currency: 'XOF',
      credits_added: credits,
      plan_name: `Mode Pro (${transactionId})`,
      provider: 'kkiapay',
      status: 'completed'
    });
    if (txError) {
      console.error('Erreur enregistrement transaction:', txError);
    // Ne pas échouer si l'enregistrement de la transaction échoue
    }
    return new Response(JSON.stringify({
      success: true,
      message: 'Paiement traité avec succès',
      transactionId
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Erreur webhook KkiaPay:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});

import React, { useEffect, useState, useRef } from 'react';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../src/context/AppContext';
import { loadKkiaPayWidget, openKkiaPayWidget, verifyKkiaPayTransaction, KkiaPayConfig } from '../services/kkiapayService';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabase';
import confetti from 'canvas-confetti';

interface KkiaPayPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  onReopen?: () => void; // Callback pour réouvrir le modal en cas de succès/échec
  amount: number;
  credits: number;
}

export const KkiaPayPayment: React.FC<KkiaPayPaymentProps> = ({
  isOpen,
  onClose,
  onReopen,
  amount,
  credits,
}) => {
  const { user, addCredits } = useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const messageListenerRef = useRef<((event: MessageEvent) => void) | null>(null);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const apikey = (import.meta as any).env?.VITE_KKIAPAY_PUBLIC_KEY || '';
  const sandbox = (import.meta as any).env?.DEV || false;

  useEffect(() => {
    if (isOpen && apikey) {
      // Charger le widget KkiaPay quand le modal s'ouvre
      loadKkiaPayWidget()
        .then(() => {
          console.log('Widget KkiaPay chargé avec succès');
          // Attendre un peu pour que la classe soit disponible
          setTimeout(() => {
            if (typeof (window as any).Kkiapay === 'undefined') {
              console.warn('Kkiapay class not yet available, will retry on payment');
            }
          }, 500);
        })
        .catch((err) => {
          console.error('Erreur chargement widget KkiaPay:', err);
          setError('Impossible de charger le système de paiement');
        });
    }
  }, [isOpen, apikey]);

  // Fonction pour nettoyer tous les timers et listeners
  const cleanupTimersAndListeners = () => {
    if (messageListenerRef.current) {
      window.removeEventListener('message', messageListenerRef.current);
      messageListenerRef.current = null;
    }
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Fonction pour vérifier le statut de la transaction via l'API
  const checkTransactionStatus = async (txId: string) => {
    try {
      const response = await verifyKkiaPayTransaction(txId, apikey, sandbox);
      console.log('Statut transaction vérifié:', response);
      
      if (response.status === 'SUCCESS') {
        handlePaymentSuccess(txId);
      } else if (response.status === 'FAILED') {
        handlePaymentFailure(response.message || 'Le paiement a échoué');
      }
      // Si PENDING, on continue à attendre
    } catch (err) {
      console.error('Erreur vérification statut:', err);
      // Ne pas échouer immédiatement, continuer à attendre
    }
  };

  // Fonction pour gérer le succès du paiement
  const handlePaymentSuccess = (txId: string) => {
    cleanupTimersAndListeners();
    setTransactionId(txId);
    setStatus('success');
    setIsLoading(false);
    
    // Vérifier d'abord si les crédits n'ont pas déjà été ajoutés par le webhook
    // On attend un peu pour laisser le webhook faire son travail
    setTimeout(async () => {
      try {
        // Vérifier si la transaction existe déjà dans la base de données
        const { data: existingTx } = await supabase
          .from('transactions')
          .select('id')
          .eq('provider', 'kkiapay')
          .or(`plan_name.ilike.%${txId}%,plan_name.eq.Mode Pro`)
          .single();
        
        if (!existingTx) {
          // La transaction n'existe pas encore, le webhook n'a pas encore traité
          // On ajoute les crédits côté frontend
          console.log('✅ Ajout des crédits côté frontend (webhook pas encore traité)');
          addCredits(credits, 'kkiapay', amount);
        } else {
          console.log('✅ Les crédits ont déjà été ajoutés par le webhook');
          // Recharger les données utilisateur pour avoir les crédits à jour
          // Le webhook a déjà ajouté les crédits, on ne fait que rafraîchir
        }
      } catch (err) {
        console.error('Erreur vérification transaction:', err);
        // En cas d'erreur, on ajoute quand même les crédits côté frontend
        addCredits(credits, 'kkiapay', amount);
      }
    }, 2000); // Attendre 2 secondes pour laisser le webhook traiter
    
    // Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Réouvrir le modal pour afficher le succès
    if (onReopen) {
      setTimeout(() => {
        onReopen();
      }, 100);
    } else {
      // Si pas de callback, rediriger vers l'app
      setTimeout(() => {
        navigate('/app');
      }, 2000);
    }
  };

  // Fonction pour gérer l'échec du paiement
  const handlePaymentFailure = (errorMessage: string) => {
    cleanupTimersAndListeners();
    setStatus('failed');
    setError(errorMessage);
    setIsLoading(false);
    
    // Réouvrir le modal pour afficher l'erreur
    if (onReopen) {
      setTimeout(() => {
        onReopen();
      }, 100);
    }
  };

  // Fonction pour gérer la réponse KkiaPay
  const handleKkiaPayResponse = async (response: any) => {
    console.log('Réponse KkiaPay:', response);
    
    const txId = response.transactionId || response.id || response.transaction_id;
    
    if (response.status === 'SUCCESS' || response.state === 'SUCCESS' || response.success === true) {
      handlePaymentSuccess(txId);
    } else if (response.status === 'FAILED' || response.state === 'FAILED' || response.success === false) {
      handlePaymentFailure(response.message || response.error || 'Le paiement a échoué');
    } else if (txId) {
      // Si on a un transactionId mais le statut n'est pas encore définitif, on le stocke et on vérifie périodiquement
      setTransactionId(txId);
      // Démarrer la vérification périodique
      if (!statusCheckIntervalRef.current) {
        statusCheckIntervalRef.current = setInterval(() => {
          checkTransactionStatus(txId);
        }, 5000); // Vérifier toutes les 5 secondes
      }
    }
  };

  const handlePayment = async () => {
    if (!apikey) {
      setError('Clé API KkiaPay non configurée');
      return;
    }

    if (!user?.email) {
      setError('Veuillez vous connecter pour effectuer un paiement');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Configuration du paiement
    const config: KkiaPayConfig = {
      apikey: apikey,
      amount: amount,
      email: user.email,
      name: user.user_metadata?.full_name || user.email.split('@')[0],
      data: JSON.stringify({
        type: 'pro_plan',
        credits: credits,
        userId: user.id,
      }),
      sandbox: sandbox,
    };

    // Ouvrir le widget KkiaPay avec callback
    try {
      // S'assurer que le widget est chargé
      await loadKkiaPayWidget();
      
      // KkiaPay expose des fonctions globales, pas une classe
      const openKkiapayWidget = (window as any).openKkiapayWidget || (window as any).openkkiapayWidget;
      
      if (!openKkiapayWidget || typeof openKkiapayWidget !== 'function') {
        console.error('❌ Fonction openKkiapayWidget non disponible');
        console.log('Fonctions KkiaPay disponibles:', Object.keys(window).filter(k => 
          typeof k === 'string' && (k.toLowerCase().includes('kkia') || k.toLowerCase().includes('pay'))));
        throw new Error('Fonction KkiaPay non disponible. Vérifiez que le script se charge correctement.');
      }

      console.log('✅ Fonction openKkiapayWidget trouvée, ouverture du widget...');
      console.log('Configuration:', { apikey: apikey.substring(0, 10) + '...', amount, sandbox });
      
      // Configurer le listener d'événements AVANT d'ouvrir le widget
      // KkiaPay utilise postMessage pour communiquer les résultats
      const handlePaymentEvent = (event: MessageEvent) => {
        // Vérifier si c'est un événement KkiaPay
        if (event.data && typeof event.data === 'object') {
          const data = event.data;
          
          // Détecter les événements KkiaPay par leurs propriétés
          // KkiaPay peut envoyer différents formats de réponse
          const isKkiaPayEvent = 
            data.transactionId || 
            data.transaction_id ||
            data.id || 
            data.status || 
            data.state || 
            data.success !== undefined ||
            (data.type && (data.type.includes('kkia') || data.type.includes('payment'))) ||
            (event.origin && (event.origin.includes('kkiapay') || event.origin.includes('kkiapay.me')));
          
          if (isKkiaPayEvent) {
            console.log('📢 Événement KkiaPay reçu via postMessage:', data);
            console.log('Origin:', event.origin);
            handleKkiaPayResponse(data);
          }
        } else if (typeof event.data === 'string') {
          // Certains widgets peuvent envoyer des strings JSON
          try {
            const parsedData = JSON.parse(event.data);
            if (parsedData.transactionId || parsedData.id || parsedData.status) {
              console.log('📢 Événement KkiaPay reçu (string JSON):', parsedData);
              handleKkiaPayResponse(parsedData);
            }
          } catch (e) {
            // Ce n'est pas du JSON, ignorer
          }
        }
      };

      // Stocker la référence du listener pour pouvoir le nettoyer
      messageListenerRef.current = handlePaymentEvent;
      
      // Écouter les messages postMessage
      window.addEventListener('message', handlePaymentEvent);

      // Configurer un timeout de sécurité (5 minutes)
      timeoutRef.current = setTimeout(() => {
        console.warn('⏱️ Timeout du paiement - aucune réponse après 5 minutes');
        cleanupTimersAndListeners();
        // Ne pas réouvrir automatiquement, l'utilisateur pourra réessayer plus tard
      }, 5 * 60 * 1000); // 5 minutes

      // Ouvrir le widget KkiaPay avec les paramètres (sans callback)
      console.log('🚀 Ouverture du widget KkiaPay...');
      openKkiapayWidget({
        apikey: apikey,
        amount: amount,
        email: user.email,
        name: config.name,
        data: config.data,
        sandbox: sandbox,
      });

      // Fermer immédiatement la popup après avoir ouvert KkiaPay
      // Les événements seront gérés en arrière-plan
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      console.error('Erreur paiement KkiaPay:', err);
      cleanupTimersAndListeners();
      setError(err.message || 'Erreur lors de l\'ouverture du paiement');
      setStatus('failed');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (status === 'processing') {
      if (confirm('Un paiement est en cours. Êtes-vous sûr de vouloir fermer ? Le paiement continuera en arrière-plan.')) {
        cleanupTimersAndListeners();
        onClose();
        setStatus('idle');
        setError(null);
        setIsLoading(false);
      }
    } else {
      cleanupTimersAndListeners();
      onClose();
      setStatus('idle');
      setError(null);
      setIsLoading(false);
    }
  };

  // Nettoyer tous les listeners et timers quand le composant se démonte ou se ferme
  useEffect(() => {
    return () => {
      cleanupTimersAndListeners();
    };
  }, []);

  // Ne pas nettoyer les listeners quand le modal se ferme
  // Ils doivent rester actifs pour détecter le résultat du paiement en arrière-plan
  // On nettoie seulement quand on a un résultat définitif (succès/échec) ou au démontage
  useEffect(() => {
    if (!isOpen && status === 'idle') {
      // Seulement réinitialiser l'état si on revient à idle
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, status]);

  // Ne pas démonter le composant même si isOpen est false
  // Cela permet de garder les listeners actifs pour détecter le résultat du paiement
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-scale-up">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          disabled={status === 'processing'}
        >
          <X size={20} />
        </button>

        {status === 'idle' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Paiement Mobile Money
              </h3>
              <p className="text-gray-500">
                Vous allez être redirigé vers KkiaPay pour finaliser votre paiement
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Montant</span>
                <span className="font-bold text-gray-900">{amount.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Crédits</span>
                <span className="font-bold text-primary">{credits} crédits</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={isLoading || !apikey}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <span>Payer avec Mobile Money</span>
                  <span>→</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Paiement sécurisé par KkiaPay • MTN, Moov, Orange Money
            </p>
          </>
        )}


        {status === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Paiement réussi ! 🎉
            </h3>
            <p className="text-gray-500 mb-4">
              {credits} crédits ont été ajoutés à votre compte
            </p>
            {transactionId && (
              <p className="text-xs text-gray-400">
                Transaction: {transactionId}
              </p>
            )}
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Paiement échoué
            </h3>
            {error && (
              <p className="text-gray-500 mb-4">{error}</p>
            )}
            <button
              onClick={() => {
                setStatus('idle');
                setError(null);
              }}
              className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
      )}
    </>
  );
};


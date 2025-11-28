import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useApp } from '../src/context/AppContext';
import { supabase } from '../src/lib/supabase';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { addCredits, user } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setProcessing(false);
      return;
    }

    // Create Payment Method (Simulated for now as we don't have backend intent)
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setError(error.message || 'Une erreur est survenue');
      setProcessing(false);
    } else {
      console.log('[PaymentMethod]', paymentMethod);
      
      // Call Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('stripe-payment', {
        body: {
          amount: 5000, // 5000 FCFA
          paymentMethodId: paymentMethod.id,
          email: user?.email,
        },
      });

      if (functionError || data?.error) {
        console.error(functionError || data?.error);
        setError(functionError?.message || data?.error || 'Erreur lors du paiement');
        setProcessing(false);
      } else {
        console.log('[PaymentIntent]', data.paymentIntent);
        
        // Vérifier si la transaction existe déjà pour éviter les doublons
        const paymentIntentId = data.paymentIntent?.id;
        if (paymentIntentId && user) {
          const { data: existingTx } = await supabase
            .from('transactions')
            .select('id')
            .eq('provider', 'stripe')
            .eq('user_id', user.id)
            .or(`plan_name.ilike.%${paymentIntentId}%,plan_name.eq.Mode Pro`)
            .single();
          
          if (!existingTx) {
            // Ajouter les crédits seulement si la transaction n'existe pas déjà
            await addCredits(50, 'stripe', 5000);
          } else {
            console.log('✅ Transaction déjà traitée, rafraîchissement des données uniquement');
          }
        } else {
          // Fallback si pas de paymentIntentId
          await addCredits(50, 'stripe', 5000);
        }
        
        // Rafraîchir les données utilisateur depuis la base de données
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('credits, is_pro')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            // Les données seront mises à jour via le contexte
            // On déclenche juste un rafraîchissement
            window.dispatchEvent(new CustomEvent('refreshUserData'));
          }
        }
        
        setProcessing(false);
        
        // Confetti Explosion
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Appeler le callback de succès au lieu de fermer directement
        onSuccess();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3 rounded-xl bg-secondary text-white font-bold shadow-lg hover:bg-secondary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {processing ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          'Payer 5000 FCFA'
        )}
      </button>
    </form>
  );
};

export const StripePaymentForm: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  if (!isOpen) return null;

  const handleSuccess = () => {
    setStatus('success');
  };

  const handleClose = () => {
    setStatus('idle');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-scale-up">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <X size={20} />
        </button>

        {status === 'idle' && (
          <>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Paiement par Carte</h3>

            <Elements stripe={stripePromise}>
              <CheckoutForm onClose={handleClose} onSuccess={handleSuccess} />
            </Elements>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Paiement Sécurisé par Stripe
              </p>
            </div>
          </>
        )}

        {status === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              🎉 Félicitations !
            </h3>
            <p className="text-gray-500 mb-2">
              Vous êtes maintenant membre Pro !
            </p>
            <p className="text-gray-500 mb-6">
              50 crédits ont été ajoutés à votre compte.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Parfait !
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

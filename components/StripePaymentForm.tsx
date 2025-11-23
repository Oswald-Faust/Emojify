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
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
        addCredits(50);
        setProcessing(false);
        onClose();
        
        // Confetti Explosion
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        alert('🎉 Félicitations ! Vous êtes maintenant membre Pro !\n\n50 crédits ont été ajoutés à votre compte.');
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-scale-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
        >
          <X size={20} />
        </button>

        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Paiement par Carte</h3>

        <Elements stripe={stripePromise}>
          <CheckoutForm onClose={onClose} />
        </Elements>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Paiement Sécurisé par Stripe
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { useApp } from '../src/context/AppContext';
import { PaymentChoiceModal } from './PaymentChoiceModal';
import { StripePaymentForm } from './StripePaymentForm';

export const PricingView: React.FC = () => {
  const navigate = useNavigate();
  const { user, addCredits, isPro } = useApp();
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

  // Paystack Config
  const config = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || "user@example.com",
    amount: 5000 * 100, // 5000 FCFA in kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    currency: 'XOF',
  };

  const initializePaystack = usePaystackPayment(config);

  const handlePaystackSuccess = (reference: any) => {
    console.log(reference);
    addCredits(50);
    alert("Paiement Mobile Money réussi ! Vos crédits ont été ajoutés.");
    navigate('/app');
  };

  const handlePaystackClose = () => {
    console.log('Paystack closed');
  };

  const handlePaymentClick = () => {
    setIsChoiceModalOpen(true);
  };

  const handleSelectPaystack = () => {
    setIsChoiceModalOpen(false);
    initializePaystack(handlePaystackSuccess, handlePaystackClose);
  };

  const handleSelectStripe = () => {
    setIsChoiceModalOpen(false);
    setIsStripeModalOpen(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 animate-fade-in-up">
      
      <PaymentChoiceModal 
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onSelectPaystack={handleSelectPaystack}
        onSelectStripe={handleSelectStripe}
      />

      <StripePaymentForm 
        isOpen={isStripeModalOpen}
        onClose={() => setIsStripeModalOpen(false)}
      />

      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
          Passez en mode <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Pro</span>
        </h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Vous avez épuisé vos crédits gratuits. Débloquez la puissance illimitée de l'IA pour continuer à créer.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-center">
        
        {/* Free Plan */}
        <div className={`bg-white p-8 rounded-3xl border border-gray-200 ${isPro ? 'opacity-60 grayscale' : ''}`}>
          <div className="mb-4">
            <span className="text-sm font-bold uppercase tracking-wider text-gray-500">Découverte</span>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">Gratuit</h3>
          </div>
          <ul className="space-y-4 mb-8 text-gray-500">
            <li className="flex items-center gap-3"><Check size={18} /> 6 Générations offertes</li>
            <li className="flex items-center gap-3"><Check size={18} /> Style Standard</li>
            <li className="flex items-center gap-3"><Check size={18} /> Qualité SD</li>
          </ul>
          <button disabled className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-bold cursor-not-allowed">
            {isPro ? 'Plan Terminé' : 'Plan Actuel'}
          </button>
        </div>

        {/* Pro Plan (Highlighted) */}
        <div className={`relative bg-gray-900 p-8 rounded-3xl shadow-2xl transform md:-translate-y-4 border border-gray-800 text-white ${isPro ? 'ring-4 ring-primary ring-offset-4 ring-offset-gray-50' : ''}`}>
          {isPro && (
            <div className="absolute -top-6 right-8 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
              <Check size={12} /> Actif
            </div>
          )}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-secondary to-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
            Le plus populaire
          </div>
          <div className="mb-6">
            <span className="text-sm font-bold uppercase tracking-wider text-primary">Créateur</span>
            <div className="flex items-end gap-1 mt-2">
              <h3 className="text-4xl font-bold">5000 FCFA</h3>
              <span className="text-gray-400 mb-1">/mois</span>
            </div>
          </div>
          <ul className="space-y-4 mb-10 text-gray-300">
            <li className="flex items-center gap-3 text-white"><Zap size={18} className="text-yellow-400" /> <strong>50 Crédits</strong> / mois</li>
            <li className="flex items-center gap-3"><Check size={18} className="text-primary" /> Tous les styles (3D, Clay, Anime)</li>
            <li className="flex items-center gap-3"><Check size={18} className="text-primary" /> Haute Résolution (4K)</li>
            <li className="flex items-center gap-3"><Check size={18} className="text-primary" /> Pas de filigrane</li>
            <li className="flex items-center gap-3"><Check size={18} className="text-primary" /> Support Prioritaire</li>
          </ul>
          
          <button 
            onClick={isPro ? undefined : handlePaymentClick}
            disabled={isPro}
            className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all duration-300 transform ${
              isPro 
                ? 'bg-green-500 text-white cursor-default' 
                : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white hover:shadow-primary/50 hover:scale-105'
            }`}
          >
            {isPro ? 'Vous êtes ici' : 'Payer 5000 FCFA'}
          </button>
          
          {!isPro && <p className="text-center text-xs text-gray-500 mt-4">Paiement sécurisé par Paystack & Stripe</p>}
        </div>

        {/* Agency Plan */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-primary/30 transition-colors">
          <div className="mb-4">
            <span className="text-sm font-bold uppercase tracking-wider text-gray-500">Agence</span>
            <div className="flex items-end gap-1 mt-2">
              <h3 className="text-3xl font-bold text-gray-900">29€</h3>
              <span className="text-gray-500 mb-1">/mois</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 text-gray-600">
            <li className="flex items-center gap-3"><Check size={18} className="text-primary" /> Tout du plan Créateur</li>
            <li className="flex items-center gap-3"><Check size={18} className="text-primary" /> API Access</li>
            <li className="flex items-center gap-3"><Check size={18} className="text-primary" /> Licence Commerciale</li>
            <li className="flex items-center gap-3"><Check size={18} className="text-primary" /> Mode Équipe (5 utilisateurs)</li>
          </ul>
          <button 
            onClick={() => window.location.href = 'mailto:sales@emojify.io'}
            className="w-full py-3 rounded-xl bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 font-bold transition-colors"
          >
            Contacter les ventes
          </button>
        </div>

      </div>
    </div>
  );
};

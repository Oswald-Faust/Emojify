import React from 'react';
import { X, CreditCard, Smartphone } from 'lucide-react';

interface PaymentChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStripe: () => void;
  onSelectPaystack: () => void;
}

export const PaymentChoiceModal: React.FC<PaymentChoiceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectStripe, 
  onSelectPaystack 
}) => {
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

        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Moyen de paiement</h3>
        <p className="text-gray-500 text-center mb-8">Choisissez comment vous souhaitez régler</p>

        <div className="space-y-4">
          <button 
            onClick={onSelectPaystack}
            className="w-full p-4 rounded-2xl border-2 border-gray-100 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Smartphone size={24} />
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900">Mobile Money</div>
              <div className="text-xs text-gray-500">MTN, Moov, Orange...</div>
            </div>
            <div className="ml-auto text-gray-300 group-hover:text-primary">→</div>
          </button>

          <button 
            onClick={onSelectStripe}
            className="w-full p-4 rounded-2xl border-2 border-gray-100 hover:border-secondary/50 hover:bg-secondary/5 transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard size={24} />
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900">Carte Bancaire</div>
              <div className="text-xs text-gray-500">Visa, Mastercard...</div>
            </div>
            <div className="ml-auto text-gray-300 group-hover:text-secondary">→</div>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Paiement 100% Sécurisé
          </p>
        </div>
      </div>
    </div>
  );
};

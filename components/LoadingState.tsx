import React, { useState, useEffect } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';

const FUN_MESSAGES = [
  "Analyse de votre superbe visage...",
  "Ajout d'une touche de magie...",
  "Transformation cartoon en cours...",
  "Polissage des pixels...",
  "Presque prêt pour le fun !",
  "C'est en train de chauffer...",
];

export const LoadingState: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % FUN_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-accent blur-2xl opacity-30 animate-pulse-fast rounded-full"></div>
        <div className="bg-white p-6 rounded-full shadow-xl relative z-10 animate-bounce-slow border-4 border-accent/20">
          <Wand2 className="w-16 h-16 text-primary animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <Sparkles className="absolute -top-2 -right-2 text-secondary w-8 h-8 animate-pulse" />
        <Sparkles className="absolute bottom-0 -left-4 text-accent w-6 h-6 animate-pulse delay-75" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Création en cours</h3>
      <p className="text-lg text-gray-600 h-8 transition-all duration-500">
        {FUN_MESSAGES[messageIndex]}
      </p>
      
      <div className="mt-8 w-64 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent animate-pulse w-full origin-left scale-x-0" style={{ animation: 'progress 15s linear forwards' }}></div>
      </div>
      
      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          80% { transform: scaleX(0.9); }
          100% { transform: scaleX(0.95); }
        }
      `}</style>
    </div>
  );
};

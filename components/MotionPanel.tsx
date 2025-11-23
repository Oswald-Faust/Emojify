
import React from 'react';
import { MotionType } from '../types';
import { Clapperboard, Hand, Eye, Smile, Music, Check } from 'lucide-react';

interface MotionPanelProps {
  selectedMotion: MotionType;
  onMotionChange: (motion: MotionType) => void;
  onGenerate: () => void;
  onBack: () => void;
}

export const MotionPanel: React.FC<MotionPanelProps> = ({
  selectedMotion,
  onMotionChange,
  onGenerate,
  onBack
}) => {
  
  const motions: { id: MotionType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'WINK', label: 'Clin d\'œil', icon: <Eye className="w-5 h-5" />, desc: 'Charmeur et subtil' },
    { id: 'WAVE', label: 'Saluer', icon: <Hand className="w-5 h-5" />, desc: 'Dire bonjour de la main' },
    { id: 'LAUGH', label: 'Rire', icon: <Smile className="w-5 h-5" />, desc: 'Un grand éclat de rire' },
    { id: 'DANCE', label: 'Danser', icon: <Music className="w-5 h-5" />, desc: 'Petit mouvement rythmé' },
    { id: 'NOD', label: 'Opiner', icon: <Check className="w-5 h-5" />, desc: 'Oui de la tête' },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up">
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-2xl p-8">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-full mb-4">
            <Clapperboard size={24} />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">Motion Studio</h2>
          <p className="text-gray-500">Donnez vie à votre avatar avec Veo</p>
        </div>

        {/* Motion Selector */}
        <div className="mb-10">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Choisissez l'action</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {motions.map((motion) => (
              <button
                key={motion.id}
                onClick={() => onMotionChange(motion.id)}
                className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left group
                  ${selectedMotion === motion.id 
                    ? 'border-purple-500 bg-purple-50 shadow-md' 
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <div className={`p-2 rounded-lg transition-colors ${selectedMotion === motion.id ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                  {motion.icon}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{motion.label}</div>
                  <div className="text-xs text-gray-400">{motion.desc}</div>
                </div>
                
                {selectedMotion === motion.id && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex gap-3 text-sm text-blue-700">
            <div className="flex-shrink-0 pt-0.5">ℹ️</div>
            <p>La génération vidéo utilise le modèle <strong>Veo</strong> et peut prendre jusqu'à 30 secondes. Assurez-vous d'utiliser une photo claire.</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={onBack}
            className="flex-1 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Retour
          </button>
          <button
            onClick={onGenerate}
            className="flex-[2] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Clapperboard className="w-5 h-5" />
            Générer la vidéo
          </button>
        </div>

      </div>
    </div>
  );
};

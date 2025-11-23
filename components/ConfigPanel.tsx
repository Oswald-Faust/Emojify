
import React from 'react';
import { EmojiStyle, EmojiMood } from '../types';
import { Wand2, Palette, Smile, Box, Grid3X3, Zap, Heart, Frown } from 'lucide-react';

interface ConfigPanelProps {
  selectedStyle: EmojiStyle;
  selectedMood: EmojiMood;
  onStyleChange: (style: EmojiStyle) => void;
  onMoodChange: (mood: EmojiMood) => void;
  onGenerate: () => void;
  onBack: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  selectedStyle,
  selectedMood,
  onStyleChange,
  onMoodChange,
  onGenerate,
  onBack
}) => {
  
  const styles: { id: EmojiStyle; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: '3D', label: '3D Magic', icon: <Box className="w-5 h-5" />, desc: 'Style Pixar mignon' },
    { id: 'CLAY', label: 'Clay', icon: <Palette className="w-5 h-5" />, desc: 'Pâte à modeler' },
    { id: 'PIXEL', label: 'Retro', icon: <Grid3X3 className="w-5 h-5" />, desc: 'Pixel Art 16-bit' },
    { id: 'ANIME', label: 'Manga', icon: <Zap className="w-5 h-5" />, desc: 'Style Anime Japonais' },
  ];

  const moods: { id: EmojiMood; label: string; icon: React.ReactNode }[] = [
    { id: 'HAPPY', label: 'Joyeux', icon: <Smile className="w-6 h-6" /> },
    { id: 'COOL', label: 'Cool', icon: <span className="text-xl">😎</span> },
    { id: 'LOVE', label: 'Love', icon: <Heart className="w-6 h-6" /> },
    { id: 'SURPRISED', label: 'Choc', icon: <span className="text-xl">😱</span> },
    { id: 'ANGRY', label: 'Grrr', icon: <Frown className="w-6 h-6" /> },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up">
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-2xl p-8">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 mb-2">Studio de Création</h2>
          <p className="text-gray-500">Personnalisez votre chef-d'œuvre IA</p>
        </div>

        {/* Style Selector */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">1. Choisissez votre style</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => onStyleChange(style.id)}
                className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 group
                  ${selectedStyle === style.id 
                    ? 'border-primary bg-primary/5 shadow-lg scale-105' 
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <div className={`p-3 rounded-full mb-3 transition-colors ${selectedStyle === style.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                  {style.icon}
                </div>
                <span className="font-bold text-gray-800">{style.label}</span>
                <span className="text-xs text-gray-400 text-center mt-1">{style.desc}</span>
                
                {selectedStyle === style.id && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mood Selector */}
        <div className="mb-10">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">2. Quelle est l'humeur ?</label>
          <div className="flex flex-wrap justify-center gap-4">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => onMoodChange(mood.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold transition-all duration-200 shadow-sm
                  ${selectedMood === mood.id 
                    ? 'bg-gradient-to-r from-secondary to-pink-500 text-white shadow-pink-200 shadow-lg transform -translate-y-1' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }
                `}
              >
                {mood.icon}
                <span>{mood.label}</span>
              </button>
            ))}
          </div>
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
            className="flex-[2] bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Générer mon Emoji
          </button>
        </div>

      </div>
    </div>
  );
};

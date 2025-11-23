import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { useApp } from '../src/context/AppContext';

export const EditProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      // Optional: Refresh user context if needed, but Supabase auth listener should handle it
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-2xl mx-auto animate-fade-in">
      <button 
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        Retour au profil
      </button>

      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Informations Personnelles</h1>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Avatar Placeholder (Upload not implemented yet) */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl text-white shadow-lg">
              {user?.email ? user.email[0].toUpperCase() : '👤'}
            </div>
            <button type="button" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
              Modifier l'avatar (Bientôt)
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nom complet</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">L'adresse email ne peut pas être modifiée.</p>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <Save size={20} />
                Enregistrer les modifications
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Save } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

export const SecurityView: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès !' });
      setPassword('');
      setConfirmPassword('');
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

      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Sécurité</h1>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nouveau mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Confirmer le mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
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
                Mettre à jour le mot de passe
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

export const AuthView: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        
        if (!error) {
             // Check if session was created (auto confirm)
             const { data: { session } } = await supabase.auth.getSession();
             if (session) {
                 navigate('/app');
             } else {
                 setSuccessMessage("Veuillez vérifier votre email pour confirmer votre inscription.");
             }
        }

      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white animate-fade-in-up">
      
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-10"></div>
        <div className="absolute top-0 left-0 w-full h-full pattern-grid opacity-10"></div>
        
        {/* Floating Emojis */}
        <div className="absolute top-20 left-20 text-6xl animate-float">😎</div>
        <div className="absolute bottom-40 right-20 text-8xl animate-float-delayed">🦊</div>
        <div className="absolute top-1/2 right-1/3 text-4xl animate-bounce-slow">🤖</div>

        <div className="relative z-20 text-center p-12 max-w-xl">
          <h2 className="text-5xl font-display font-bold text-white mb-6">Rejoignez le club des créateurs.</h2>
          <p className="text-gray-400 text-xl leading-relaxed">
            "Emojify a changé la façon dont je communique avec mon équipe. C'est fun, rapide et incroyablement ressemblant."
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs text-white">
                    User
                 </div>
               ))}
             </div>
             <span className="text-white font-bold">+10k membres</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative">
        
        <div className="w-full max-w-md">
          <div className="mb-10">
            <div className="inline-block p-3 rounded-2xl bg-primary/10 text-primary mb-6">
              <Sparkles size={28} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Créer votre compte' : 'Bon retour !'}
            </h1>
            <p className="text-gray-500">
              {isSignUp ? 'Commencez avec 6 crédits gratuits. Aucune CB requise.' : 'Connectez-vous pour accéder à votre studio.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl flex items-center gap-2 text-sm font-medium">
              <Sparkles size={18} />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {isSignUp && (
              <div className="space-y-2 animate-fade-in-up">
                <label className="text-sm font-bold text-gray-700 ml-1">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
              {isLoading ? (
                <span className="animate-pulse">Chargement...</span>
              ) : (
                <>
                  {isSignUp ? 'Commencer gratuitement' : 'Se connecter'} <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <button 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-primary font-bold hover:underline"
            >
              {isSignUp ? 'Se connecter' : "S'inscrire"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

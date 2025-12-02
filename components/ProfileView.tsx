import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../src/context/AppContext';
import { User, CreditCard, Settings, LogOut, Shield, Mail, Zap, AlertTriangle } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

export const ProfileView: React.FC = () => {
  const { user, credits, signOut, isPro, setIsPro } = useApp();
  const navigate = useNavigate();
  const [showUnsubscribeConfirm, setShowUnsubscribeConfirm] = useState(false);

  const handleUnsubscribe = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_pro: false })
        .eq('id', user.id);

      if (error) throw error;

      setIsPro(false);
      setShowUnsubscribeConfirm(false);
      alert("Votre abonnement a été annulé avec succès.");
    } catch (error: any) {
      console.error("Error unsubscribing:", error);
      alert("Erreur lors de la désinscription.");
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto animate-fade-in relative">
      
      {/* Unsubscribe Confirmation Modal */}
      {showUnsubscribeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-up">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Êtes-vous sûr ?</h3>
              <p className="text-gray-500">
                En annulant votre abonnement, vous perdrez vos avantages Pro et repasserez au plan gratuit à la fin de la période.
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowUnsubscribeConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleUnsubscribe}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Mon Profil</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Profile Card */}
        <div className="md:col-span-2 space-y-6">
          
          {/* User Info */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl text-white shadow-lg">
              {user?.email && typeof user.email === 'string' && user.email.length > 0 ? user.email[0].toUpperCase() : '👤'}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {user?.user_metadata?.full_name || 'Utilisateur'}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mb-4">
                <Mail size={16} />
                <span>{user?.email}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                <Shield size={12} />
                Compte Vérifié
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings size={20} className="text-gray-400" />
              Paramètres du compte
            </h3>
            
            <div className="space-y-4">
              <div 
                onClick={() => navigate('/profile/edit')}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Informations personnelles</div>
                    <div className="text-xs text-gray-500">Modifier votre nom et avatar</div>
                  </div>
                </div>
                <div className="text-gray-400">→</div>
              </div>

              <div 
                onClick={() => navigate('/profile/security')}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                    <Shield size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Sécurité</div>
                    <div className="text-xs text-gray-500">Mot de passe et authentification</div>
                  </div>
                </div>
                <div className="text-gray-400">→</div>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-6">
          
          {/* Credits Card */}
          <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-300">Crédits disponibles</span>
                <Zap className="text-yellow-400" size={20} fill="currentColor" />
              </div>
              <div className="text-4xl font-bold mb-2">{credits === null ? '...' : credits}</div>
              {credits !== null && (
                <div className="w-full bg-gray-700 rounded-full h-1.5 mb-6">
                  <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full" style={{ width: `${(credits / 10) * 100}%` }}></div>
                </div>
              )}
              <button 
                onClick={() => navigate('/pricing')}
                className="w-full py-3 rounded-xl bg-white text-gray-900 font-bold text-sm hover:bg-gray-100 transition-colors"
              >
                Recharger
              </button>
            </div>
          </div>

          {/* Plan Info */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <CreditCard size={20} />
              </div>
              <div>
                <div className="font-bold text-gray-900">Plan Actuel</div>
                <div className="text-xs text-gray-500">
                  {isPro === null ? 'Chargement...' : isPro ? 'Mode Pro' : 'Gratuit'}
                </div>
              </div>
            </div>
            {isPro === null ? (
              <div className="text-center text-xs text-gray-400 py-2">Chargement...</div>
            ) : !isPro ? (
              <button 
                onClick={() => navigate('/pricing')}
                className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 font-bold text-xs hover:border-primary hover:text-primary transition-colors"
              >
                Passer au plan Pro
              </button>
            ) : (
              <div className="space-y-3">
                <div className="w-full py-2 rounded-lg bg-green-50 text-green-600 font-bold text-xs text-center border border-green-100">
                  ✨ Abonnement Actif
                </div>
                <button 
                  onClick={() => setShowUnsubscribeConfirm(true)}
                  className="w-full py-2 rounded-lg border border-red-100 text-red-500 font-bold text-xs hover:bg-red-50 transition-colors"
                >
                  Se désabonner
                </button>
              </div>
            )}
          </div>

          {/* Logout */}
          <button 
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="w-full py-4 rounded-2xl border border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Se déconnecter
          </button>

        </div>


        {/* Transaction History */}
        <div className="md:col-span-3 mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Historique des transactions</h3>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-4 font-bold text-gray-500 text-sm">Date</th>
                    <th className="pb-4 font-bold text-gray-500 text-sm">Plan</th>
                    <th className="pb-4 font-bold text-gray-500 text-sm">Montant</th>
                    <th className="pb-4 font-bold text-gray-500 text-sm">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {/* Mock Data if empty for demo, or real data */}
                  {/* We need to expose transactions from context first. I did that in previous step. */}
                  {/* Let's assume useApp returns transactions now. */}
                  {/* Wait, I need to update ProfileView to get transactions from useApp */}
                  <TransactionList />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TransactionList: React.FC = () => {
  const { transactions } = useApp();

  if (!transactions || transactions.length === 0) {
    return (
      <tr>
        <td colSpan={4} className="py-8 text-center text-gray-400">
          Aucune transaction pour le moment.
        </td>
      </tr>
    );
  }

  return (
    <>
      {transactions.map((tx) => (
        <tr key={tx.id} className="group hover:bg-gray-50 transition-colors">
          <td className="py-4 text-sm text-gray-600">
            {new Date(tx.created_at).toLocaleDateString('fr-FR', { 
              day: 'numeric', month: 'long', year: 'numeric' 
            })}
          </td>
          <td className="py-4">
            <span className="font-bold text-gray-900">{tx.plan_name || 'Crédits'}</span>
            <span className="text-xs text-gray-400 block">Via {tx.provider}</span>
          </td>
          <td className="py-4 font-bold text-gray-900">
            {tx.amount.toLocaleString('fr-FR')} {tx.currency}
          </td>
          <td className="py-4">
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
              {tx.status === 'completed' ? 'Payé' : tx.status}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
};

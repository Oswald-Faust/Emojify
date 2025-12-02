import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../src/context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoadingUser } = useApp();

  // Attendre que le chargement de l'utilisateur soit terminé
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page d'accueil
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};



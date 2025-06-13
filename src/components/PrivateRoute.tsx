import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireSetup?: boolean;
  adminOnly?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requireSetup = false, 
  adminOnly = false 
}) => {
  const { user, loading } = useAuth();

  // 1. Afficher un indicateur de chargement pendant l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // 2. Rediriger si l'utilisateur n'est pas connecté
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Définir la logique pour être administrateur :
  // L'utilisateur est administrateur SI et SEULEMENT SI son email est 'admin@demi.com'
  const isAdmin = user.email === 'admin@demo.com';

  // 3. Rediriger si adminOnly est requis et l'utilisateur n'est PAS admin (selon l'email)
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />; // Redirige vers le tableau de bord pour les non-admins
  }

  // 4. Rediriger si la configuration est requise et n'est pas complète, et l'utilisateur n'est pas admin
  // On suppose que les admins n'ont pas besoin de la phase de setup ou peuvent la passer
  if (requireSetup && !user.isSetupComplete && !isAdmin) {
    return <Navigate to="/setup" replace />;
  }

  // Si toutes les conditions sont remplies, rendre les enfants (accès autorisé)
  return <>{children}</>;
};

export default PrivateRoute;
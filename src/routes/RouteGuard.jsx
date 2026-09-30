import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';

const RoleGuard = ({ children, allowedRoles, fallbackPath = '/login' }) => {
  const { role, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(role)) {
    const redirectPath = ROLES.PESERTA === role ? '/peserta' : ROLES.PEMBIMBING === role ? '/pembimbing' : '/admin';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export const PesertaGuard = ({ children }) => (
  <RoleGuard allowedRoles={ROLES.PESERTA}>{children}</RoleGuard>
);

export const PembimbingGuard = ({ children }) => (
  <RoleGuard allowedRoles={ROLES.PEMBIMBING}>{children}</RoleGuard>
);

export const AdminGuard = ({ children }) => (
  <RoleGuard allowedRoles={ROLES.ADMIN}>{children}</RoleGuard>
);

export const AuthGuard = ({ children }) => (
  <RoleGuard allowedRoles={[ROLES.PESERTA, ROLES.PEMBIMBING, ROLES.ADMIN]}>{children}</RoleGuard>
);

export default RoleGuard;
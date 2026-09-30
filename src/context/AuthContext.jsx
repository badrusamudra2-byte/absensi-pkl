import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import { STORAGE_KEYS, ROLES, ROLE_ROUTES } from '../constants/roles';

const AuthContext = createContext(null);

// Mock user data for demo
const MOCK_USERS = {
  'peserta@demo.com': { id: 1, name: 'Peserta Demo', email: 'peserta@demo.com', division: 'IT', role: ROLES.PESERTA },
  'pembimbing@demo.com': { id: 2, name: 'Pembimbing Demo', email: 'pembimbing@demo.com', division: 'IT', role: ROLES.PEMBIMBING },
  'admin@demo.com': { id: 3, name: 'Admin Demo', email: 'admin@demo.com', division: 'IT', role: ROLES.ADMIN },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeAuth = useCallback(async () => {
    console.log('initializeAuth called');
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const storedRole = localStorage.getItem(STORAGE_KEYS.ROLE);

    console.log('Auth check:', { token: !!token, storedUser: !!storedUser, storedRole: !!storedRole });

    if (token && storedUser && storedRole) {
      try {
        setUser(JSON.parse(storedUser));
        setRole(storedRole);
      } catch (err) {
        clearAuth();
      }
    }
    setLoading(false);
    console.log('initializeAuth done, loading:', false);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    setUser(null);
    setRole(null);
  }, []);

  const login = async (credentials, rememberMe = false) => {
    setError(null);
    try {
      // Check if it's a demo credential
      const mockUser = MOCK_USERS[credentials.email];
      if (mockUser && credentials.password === 'password123') {
        const token = 'demo-token-' + Date.now();
        const userData = mockUser;
        const userRole = mockUser.role;

        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        localStorage.setItem(STORAGE_KEYS.ROLE, userRole);
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
        }

        setUser(userData);
        setRole(userRole);

        window.location.href = ROLE_ROUTES[userRole] || '/';
        return { success: true };
      }

      // Try real API if not demo
      const response = await authService.login(credentials);
      const { token, user: userData, role: userRole } = response.data.data;

      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.ROLE, userRole);
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      }

      setUser(userData);
      setRole(userRole);

      // Use window.location for navigation since we don't have useNavigate here
      window.location.href = ROLE_ROUTES[userRole] || '/';
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login gagal. Silakan coba lagi.';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
      window.location.href = '/login';
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const changePassword = async (data) => {
    try {
      await authService.changePassword(data);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Ganti password gagal';
      return { success: false, message };
    }
  };

  const hasRole = (allowedRoles) => {
    if (!role) return false;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return roles.includes(role);
  };

  useEffect(() => {
    console.log('AuthProvider useEffect running');
    initializeAuth();
  }, [initializeAuth]);

  const value = {
    user,
    role,
    loading,
    error,
    login,
    logout,
    updateUser,
    changePassword,
    hasRole,
    isAuthenticated: !!user && !!role,
    isPeserta: role === ROLES.PESERTA,
    isPembimbing: role === ROLES.PEMBIMBING,
    isAdmin: role === ROLES.ADMIN,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import RootLayout from './RootLayout';

const AuthWrapper = () => {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
};

export default AuthWrapper;
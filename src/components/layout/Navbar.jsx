import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_LABELS, ROLE_ROUTES } from '../../constants/roles';
import { Menu, X, LogOut, User, Settings, ChevronDown, Users } from 'lucide-react';
import { cn } from '../../utils/helpers';
import Dropdown from '../common/Dropdown';
import Avatar from '../ui/Avatar';

const Navbar = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
  };

  const switchRole = (newRole) => {
    localStorage.setItem('auth_role', newRole);
    window.location.href = ROLE_ROUTES[newRole] || '/';
  };

  if (!isAuthenticated) {
    return (
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pl-20">
          <div className="flex items-center justify-end h-16">
            <Link to="/login" className="text-xl font-bold text-blue-600">
              Astakira Media
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pl-20 lg:pr-0">
        <div className="flex items-center justify-between h-16 w-full">
            {/* Right side - Actions + Logo */}
            <div className="flex items-center gap-4">
              <Link to="/" className="text-xl font-bold text-blue-600 flex items-center">
                Astakira Media
              </Link>
              {/* Mobile menu button - opens sidebar drawer */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 hidden sm:flex"
                aria-label="Ganti role untuk testing"
              >
                <Users className="w-4 h-4" />
                <span>{ROLE_LABELS[role] || role}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {roleSwitcherOpen && (
                <Dropdown
                  isOpen={roleSwitcherOpen}
                  onClose={() => setRoleSwitcherOpen(false)}
                  items={Object.entries(ROLES).map(([key, value]) => ({
                    label: ROLE_LABELS[value],
                    onClick: () => switchRole(value),
                    active: value === role,
                  }))}
                />
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100"
                aria-label="Menu profil"
              >
                <Avatar name={user?.name} size="sm" />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{ROLE_LABELS[role]}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
              </button>
              {profileMenuOpen && (
                <Dropdown
                  isOpen={profileMenuOpen}
                  onClose={() => setProfileMenuOpen(false)}
                  items={[
                    { label: 'Profil', icon: User, onClick: () => { setProfileMenuOpen(false); window.location.href = '/profile'; } },
                    { label: 'Pengaturan', icon: Settings, onClick: () => { setProfileMenuOpen(false); window.location.href = '/settings'; } },
                    { label: 'Keluar', icon: LogOut, onClick: handleLogout, danger: true },
                  ]}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
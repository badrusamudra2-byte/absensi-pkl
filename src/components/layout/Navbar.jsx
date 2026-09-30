import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { LogOut, User, Settings, ChevronDown, Menu } from 'lucide-react';
import Dropdown from '../common/Dropdown';
import Avatar from '../ui/Avatar';

const Navbar = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const { toggleMobileOpen } = useSidebar();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Left side - Hamburger button on mobile & Logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMobileOpen}
              className="p-2 -ml-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="text-xl font-bold text-blue-600 flex items-center">
              Astakira Media
            </Link>
          </div>

          {/* Right side - Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100"
              aria-label="Menu profil"
            >
              <Avatar name={user?.name} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
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
    </header>
  );
};

export default Navbar;
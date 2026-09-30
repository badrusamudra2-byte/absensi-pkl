import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { cn } from '../../utils/helpers';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  BarChart2, 
  ClipboardList, 
  Calendar, 
  BookOpen, 
  FileText, 
  Users, 
  Shield, 
  Settings, 
  LogOut, 
  QrCode 
} from 'lucide-react';

const iconMap = {
  BarChart2,
  ClipboardList,
  Calendar,
  BookOpen,
  FileText,
  Users,
  Shield,
  Settings,
  LogOut,
  QrCode,
};

const Sidebar = ({ navigation = [], basePath = '', title = 'Menu', userRole = 'peserta' }) => {
  const { mobileOpen, setMobileOpen, isOpen, toggleIsOpen, isMobile } = useSidebar();
  const location = useLocation();

  const Icon = (name) => iconMap[name] || BarChart2;

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile, setMobileOpen]);

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobile && mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
          onClick={() => setMobileOpen(false)} 
          aria-hidden="true" 
        />
      )}

      {/* Desktop toggle button */}
      {!isMobile && (
        <button
          onClick={toggleIsOpen}
          className={cn(
            'fixed top-20 z-40 p-1.5 rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100',
            'transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500',
            isOpen ? 'left-[244px]' : 'left-3'
          )}
          aria-label={isOpen ? 'Tutup sidebar' : 'Buka sidebar'}
          aria-expanded={isOpen}
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      )}

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col',
          isMobile
            ? (mobileOpen ? 'w-64 translate-x-0 shadow-2xl' : 'w-64 -translate-x-full')
            : (isOpen ? 'w-64' : 'w-0 overflow-hidden border-r-0')
        )}
        aria-label="Sidebar navigasi"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <BarChart2 className="w-6 h-6 text-blue-600 shrink-0" />
            <span className="text-xl font-bold text-blue-600 whitespace-nowrap truncate">
              {title}
            </span>
          </div>
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Tutup menu navigasi"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navigasi utama">
          {navigation.map((item) => {
            const IconComponent = Icon(item.icon);
            const isActive = location.pathname === item.path || 
              (item.path !== basePath && location.pathname.startsWith(item.path + '/'));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isMobile) setMobileOpen(false);
                }}
                className={({ isActive: active }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  'relative overflow-hidden',
                  active 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <IconComponent className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span className="truncate whitespace-nowrap">{item.label}</span>
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 shrink-0">
          <div className="px-3 py-2 rounded-lg bg-gray-50 text-xs text-gray-500">
            <p className="font-medium text-gray-700">Mode Pengembangan</p>
            <p className="mt-1">Sistem Absensi & Jurnal PKL</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
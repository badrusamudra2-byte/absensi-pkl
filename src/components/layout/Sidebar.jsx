import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { ChevronLeft, ChevronRight, X, BarChart2, ClipboardList, Calendar, BookOpen, FileText, Users, Shield, Settings, LogOut, QrCode } from 'lucide-react';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  const Icon = (name) => iconMap[name] || BarChart2;

  // Update isMobile on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setMobileOpen(false)} 
          aria-hidden="true" 
        />
      )}

      {/* Mobile toggle button (only shown when sidebar is collapsed on desktop) */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'fixed top-16 left-64 z-40 p-2 rounded-full bg-white shadow-lg border border-gray-200',
            'lg:block hidden',
            collapsed && 'left-20'
          )}
          aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      )}

      <aside
        className={cn(
          'lg:static fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
          'flex flex-col',
          isMobile 
            ? (mobileOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full') 
            : (collapsed ? 'w-20' : 'w-64'),
          'lg:w-64'
        )}
        aria-label="Sidebar navigasi"
      >
        <div className={cn('flex items-center justify-between h-16 px-4 border-b border-gray-200', collapsed && 'justify-center')}>
          {!collapsed && !isMobile && (
            <span className="text-xl font-bold text-blue-600 whitespace-nowrap">
              {title}
            </span>
          )}
          {(collapsed || isMobile) && (
            <div className="flex items-center justify-between w-full">
              {isMobile && (
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  aria-label="Tutup menu"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <BarChart2 className="w-6 h-6 text-blue-600 mx-auto" />
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navigasi utama">
          {navigation.map((item) => {
            const IconComponent = Icon(item.icon);
            const isActive = location.pathname === item.path || 
              (item.path !== basePath && location.pathname.startsWith(item.path + '/'));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive: active }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  'relative overflow-hidden',
                  active 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                  collapsed && !isMobile && 'justify-center px-2'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed && !isMobile ? item.label : undefined}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
                {isActive && !collapsed && !isMobile && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className={cn('p-4 border-t border-gray-200', collapsed && !isMobile && 'hidden')}>
          <div className="px-3 py-2 rounded-lg bg-gray-50 text-xs text-gray-500">
            <p className="font-medium">Mode Pengembangan</p>
            <p className="mt-1">Gunakan Role Switcher di navbar untuk mengubah peran.</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileOpen = () => setMobileOpen((prev) => !prev);
  const toggleIsOpen = () => setIsOpen((prev) => !prev);

  const value = {
    mobileOpen,
    setMobileOpen,
    toggleMobileOpen,
    isOpen,
    setIsOpen,
    toggleIsOpen,
    isMobile,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    // Fallback if component is used outside Provider
    return {
      mobileOpen: false,
      setMobileOpen: () => {},
      toggleMobileOpen: () => {},
      isOpen: true,
      setIsOpen: () => {},
      toggleIsOpen: () => {},
      isMobile: false,
    };
  }
  return context;
};

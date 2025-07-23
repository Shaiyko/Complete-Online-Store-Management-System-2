import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RealTimeNotifications from './RealTimeNotifications';
import PWAInstallPrompt from './PWAInstallPrompt';
import ConnectionStatus from './ConnectionStatus';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Store,
  User,
  Truck,
  Menu,
  X
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, roles: ['owner', 'admin', 'cashier'] },
    { name: 'Products', href: '/products', icon: Package, roles: ['owner', 'admin'] },
    { name: 'Point of Sale', href: '/pos', icon: ShoppingCart, roles: ['owner', 'admin', 'cashier'] },
    { name: 'Members', href: '/members', icon: Users, roles: ['owner', 'admin', 'cashier'] },
    { name: 'Suppliers', href: '/suppliers', icon: Truck, roles: ['owner', 'admin'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['owner', 'admin'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['owner'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden bg-white shadow-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Store className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold text-gray-900">StoreManager</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Desktop Header - Hidden on mobile */}
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 hidden lg:block">StoreManager</span>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="mt-6 px-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors touch-target ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info and logout - Responsive */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center h-8 w-8 text-gray-400 hover:text-red-600 transition-colors touch-target"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content - Responsive */}
      <div className="lg:pl-64">
        {/* Top bar with notifications - Responsive */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 mt-16 lg:mt-0">
          <div className="flex justify-end">
            <ConnectionStatus />
            <RealTimeNotifications />
          </div>
        </div>
        
        {/* Main content area - Responsive padding */}
        <main className="p-4 lg:p-6 container-mobile">
          <Outlet />
        </main>
      </div>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default Layout;
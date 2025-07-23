import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Store, 
  CreditCard,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    store: {
      name: 'My Store',
      address: '123 Main Street',
      phone: '02-123-4567',
      email: 'store@example.com',
      taxId: '1234567890123',
      currency: 'THB'
    },
    notifications: {
      lowStock: true,
      dailyReports: true,
      salesAlerts: false,
      membershipUpdates: true
    },
    system: {
      theme: 'light',
      language: 'en',
      timezone: 'Asia/Bangkok',
      receiptFormat: 'A4'
    }
  });

  const handleSave = (tab: string) => {
    alert(`${tab} settings saved successfully!`);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'store', name: 'Store Info', icon: Store },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'system', name: 'System', icon: SettingsIcon }
  ];

  const ProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={settings.profile.name}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, name: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, email: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={settings.profile.phone}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, phone: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              value={user?.role || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 capitalize"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={settings.profile.currentPassword}
                onChange={(e) => setSettings({
                  ...settings,
                  profile: { ...settings.profile, currentPassword: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={settings.profile.newPassword}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, newPassword: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={settings.profile.confirmPassword}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, confirmPassword: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('profile')}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );

  const StoreTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store Name
            </label>
            <input
              type="text"
              value={settings.store.name}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, name: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={settings.store.phone}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, phone: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              rows={3}
              value={settings.store.address}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, address: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={settings.store.email}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, email: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax ID
            </label>
            <input
              type="text"
              value={settings.store.taxId}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, taxId: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={settings.store.currency}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, currency: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="THB">Thai Baht (THB)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('store')}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Low Stock Alerts</h4>
              <p className="text-sm text-gray-600">Get notified when products are running low</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.lowStock}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, lowStock: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Daily Reports</h4>
              <p className="text-sm text-gray-600">Receive daily sales and inventory reports</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.dailyReports}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, dailyReports: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Sales Alerts</h4>
              <p className="text-sm text-gray-600">Get notified for high-value sales</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.salesAlerts}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, salesAlerts: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Membership Updates</h4>
              <p className="text-sm text-gray-600">Notifications about new member registrations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.membershipUpdates}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, membershipUpdates: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('notifications')}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );

  const SystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            <select
              value={settings.system.theme}
              onChange={(e) => setSettings({
                ...settings,
                system: { ...settings.system, theme: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              value={settings.system.language}
              onChange={(e) => setSettings({
                ...settings,
                system: { ...settings.system, language: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="th">Thai</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              value={settings.system.timezone}
              onChange={(e) => setSettings({
                ...settings,
                system: { ...settings.system, timezone: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Asia/Bangkok">Asia/Bangkok</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receipt Format
            </label>
            <select
              value={settings.system.receiptFormat}
              onChange={(e) => setSettings({
                ...settings,
                system: { ...settings.system, receiptFormat: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="A4">A4</option>
              <option value="thermal">Thermal (80mm)</option>
              <option value="receipt">Receipt (58mm)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('system')}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'store':
        return <StoreTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'system':
        return <SystemTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
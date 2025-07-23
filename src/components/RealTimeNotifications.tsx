import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, ShoppingCart, Package, TrendingUp, Users } from 'lucide-react';

interface Notification {
  id: string;
  type: 'low-stock' | 'new-sale' | 'inventory-update' | 'member-joined' | 'high-value-sale';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

const RealTimeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Listen for real-time events from socket
    const handleLowStockAlert = (event: CustomEvent) => {
      const { productName, currentStock, productId } = event.detail;
      addNotification({
        type: 'low-stock',
        title: 'Low Stock Alert',
        message: `${productName} is running low (${currentStock} left)`,
        priority: 'high',
        data: { productId, currentStock }
      });
      playNotificationSound();
    };

    const handleNewSale = (event: CustomEvent) => {
      const { total, items, cashierName } = event.detail;
      const priority = total > 50000 ? 'high' : 'medium';
      addNotification({
        type: total > 50000 ? 'high-value-sale' : 'new-sale',
        title: total > 50000 ? 'High Value Sale!' : 'New Sale',
        message: `Sale completed: ฿${total.toLocaleString()} (${items.length} items) by ${cashierName}`,
        priority,
        data: { total, items, cashierName }
      });
      if (total > 50000) playNotificationSound();
    };

    const handleInventoryUpdate = (event: CustomEvent) => {
      const { productId, newStock, productName } = event.detail;
      if (newStock <= 5) {
        addNotification({
          type: 'inventory-update',
          title: 'Inventory Update',
          message: `${productName || 'Product'} stock updated: ${newStock} remaining`,
          priority: newStock === 0 ? 'high' : 'medium',
          data: { productId, newStock }
        });
      }
    };

    const handleMemberJoined = (event: CustomEvent) => {
      const { memberName, memberPhone } = event.detail;
      addNotification({
        type: 'member-joined',
        title: 'New Member',
        message: `${memberName} (${memberPhone}) joined as a member`,
        priority: 'low',
        data: { memberName, memberPhone }
      });
    };

    window.addEventListener('low-stock-alert', handleLowStockAlert as EventListener);
    window.addEventListener('new-sale', handleNewSale as EventListener);
    window.addEventListener('inventory-update', handleInventoryUpdate as EventListener);
    window.addEventListener('member-joined', handleMemberJoined as EventListener);

    return () => {
      window.removeEventListener('low-stock-alert', handleLowStockAlert as EventListener);
      window.removeEventListener('new-sale', handleNewSale as EventListener);
      window.removeEventListener('inventory-update', handleInventoryUpdate as EventListener);
      window.removeEventListener('member-joined', handleMemberJoined as EventListener);
    };
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep only 50 notifications
  };

  const playNotificationSound = () => {
    if (soundEnabled && 'Audio' in window) {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => !n.read && n.priority === 'high').length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'low-stock':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'new-sale':
        return <ShoppingCart className="h-5 w-5 text-green-500" />;
      case 'high-value-sale':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      case 'inventory-update':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'member-joined':
        return <Users className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${
            highPriorityCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
          }`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`text-sm px-2 py-1 rounded ${
                    soundEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {soundEnabled ? '🔊' : '🔇'}
                </button>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {notifications.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
                <button
                  onClick={clearAll}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-400">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeNotifications;
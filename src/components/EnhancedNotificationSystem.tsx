import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X,
  Bell,
  Volume2,
  VolumeX
} from 'lucide-react';

// ประเภทของ notification
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Interface สำหรับ notification
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // milliseconds, undefined = ไม่หายไปเอง
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
}

// Context สำหรับจัดการ notifications
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const NotificationContext = React.createContext<NotificationContextType | null>(null);

// Hook สำหรับใช้งาน notification system
export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // เพิ่ม notification ใหม่
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? 5000, // default 5 seconds
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // เก็บแค่ 5 notifications

    // เล่นเสียงแจ้งเตือน
    if (soundEnabled && (notification.type === 'error' || notification.type === 'warning')) {
      playNotificationSound(notification.type);
    }

    // ตั้งเวลาให้หายไปอัตโนมัติ
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, [soundEnabled]);

  // ลบ notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // ลบทั้งหมด
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // เล่นเสียงแจ้งเตือน
  const playNotificationSound = (type: NotificationType) => {
    if (!soundEnabled || typeof window === 'undefined' || !window.AudioContext) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // กำหนดความถี่ตามประเภท notification
      switch (type) {
        case 'success':
          oscillator.frequency.value = 800;
          break;
        case 'error':
          oscillator.frequency.value = 400;
          break;
        case 'warning':
          oscillator.frequency.value = 600;
          break;
        default:
          oscillator.frequency.value = 500;
      }
      
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    soundEnabled,
    setSoundEnabled,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Component สำหรับแสดง notification แต่ละตัว
const NotificationItem: React.FC<{ 
  notification: Notification; 
  onRemove: (id: string) => void;
}> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Animation เมื่อ notification ปรากฏ
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // ฟังก์ชันสำหรับลบ notification พร้อม animation
  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  // กำหนดไอคอนและสีตามประเภท
  const getNotificationConfig = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-l-green-500',
          iconColor: 'text-green-500',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-l-red-500',
          iconColor: 'text-red-500',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-l-yellow-500',
          iconColor: 'text-yellow-500',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-l-blue-500',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
    }
  };

  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;

  return (
    <div
      className={`
        notification-item
        ${config.bgColor} ${config.borderColor}
        transform transition-all duration-300 ease-out
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isRemoving ? 'scale-95' : 'scale-100'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${config.titleColor}`}>
            {notification.title}
          </h4>
          <p className={`text-sm ${config.messageColor} mt-1`}>
            {notification.message}
          </p>
          
          {/* Action button ถ้ามี */}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className={`mt-2 text-sm font-medium ${config.titleColor} hover:underline focus:outline-none focus:underline`}
            >
              {notification.action.label}
            </button>
          )}
          
          {/* Timestamp */}
          <p className="text-xs text-gray-500 mt-2">
            {notification.timestamp.toLocaleTimeString()}
          </p>
        </div>
        
        <button
          onClick={handleRemove}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors touch-target"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Main notification system component
const EnhancedNotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationSoundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // บันทึกการตั้งค่าเสียง
  useEffect(() => {
    localStorage.setItem('notificationSoundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // ฟังก์ชันสำหรับเพิ่ม notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? 5000,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);

    // เล่นเสียงแจ้งเตือน
    if (soundEnabled && (notification.type === 'error' || notification.type === 'warning')) {
      playNotificationSound(notification.type);
    }

    // ตั้งเวลาให้หายไปอัตโนมัติ
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, [soundEnabled]);

  // ลบ notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // เล่นเสียงแจ้งเตือน
  const playNotificationSound = (type: NotificationType) => {
    if (!soundEnabled || typeof window === 'undefined') return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch (type) {
        case 'success':
          oscillator.frequency.value = 800;
          break;
        case 'error':
          oscillator.frequency.value = 400;
          break;
        case 'warning':
          oscillator.frequency.value = 600;
          break;
        default:
          oscillator.frequency.value = 500;
      }
      
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  // ฟัง events จาก window สำหรับ notifications
  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      addNotification(event.detail);
    };

    // ฟัง events ต่างๆ
    window.addEventListener('show-notification', handleNotification as EventListener);
    window.addEventListener('low-stock-alert', (event: CustomEvent) => {
      const { productName, currentStock } = event.detail;
      addNotification({
        type: 'warning',
        title: 'สินค้าใกล้หมด',
        message: `${productName} เหลือเพียง ${currentStock} ชิ้น`,
        duration: 8000,
        action: {
          label: 'ดูรายละเอียด',
          onClick: () => {
            // Navigate to products page
            window.location.href = '/products';
          }
        }
      });
    });

    window.addEventListener('new-sale', (event: CustomEvent) => {
      const { total, cashierName } = event.detail;
      if (total > 50000) {
        addNotification({
          type: 'success',
          title: 'ยอดขายสูง!',
          message: `ขายได้ ฿${total.toLocaleString()} โดย ${cashierName}`,
          duration: 6000
        });
      }
    });

    window.addEventListener('member-joined', (event: CustomEvent) => {
      const { memberName } = event.detail;
      addNotification({
        type: 'info',
        title: 'สมาชิกใหม่',
        message: `${memberName} เข้าร่วมเป็นสมาชิก`,
        duration: 4000
      });
    });

    return () => {
      window.removeEventListener('show-notification', handleNotification as EventListener);
      window.removeEventListener('low-stock-alert', handleNotification as EventListener);
      window.removeEventListener('new-sale', handleNotification as EventListener);
      window.removeEventListener('member-joined', handleNotification as EventListener);
    };
  }, [addNotification]);

  // ถ้าไม่มี notifications ก็ไม่แสดงอะไร
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container" aria-live="polite" aria-label="Notifications">
      {/* Sound toggle button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors touch-target"
          aria-label={soundEnabled ? 'Disable notification sounds' : 'Enable notification sounds'}
          title={soundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

// Helper function สำหรับแสดง notification จากที่ไหนก็ได้
export const showNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
  const event = new CustomEvent('show-notification', { detail: notification });
  window.dispatchEvent(event);
};

export default EnhancedNotificationSystem;
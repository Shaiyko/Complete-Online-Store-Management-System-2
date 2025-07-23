import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [connectionError, setConnectionError] = useState<string>('');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      setConnectionError('');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    const handleConnectionError = (event: CustomEvent) => {
      setConnectionError(event.detail.message);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('connection-error', handleConnectionError as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('connection-error', handleConnectionError as EventListener);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isOnline && !connectionError) {
    return (
      <div className="flex items-center mr-4">
        <Wifi className="h-5 w-5 text-green-500" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center mr-4">
        <div className="relative">
          <button
            onClick={() => setShowOfflineMessage(!showOfflineMessage)}
            className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors"
          >
            {connectionError ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <WifiOff className="h-5 w-5" />
            )}
          </button>
          
          {showOfflineMessage && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {connectionError ? (
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  ) : (
                    <WifiOff className="h-6 w-6 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {connectionError ? 'Connection Error' : 'You\'re Offline'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {connectionError || 'Some features may not work properly while offline.'}
                  </p>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={handleRefresh}
                      className="flex items-center space-x-1 text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={() => setShowOfflineMessage(false)}
                      className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ConnectionStatus;
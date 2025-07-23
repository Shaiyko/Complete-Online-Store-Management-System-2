import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Flashlight, FlashlightOff, RotateCcw, Scan } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

interface BarcodeQRScannerProps {
  onScan: (data: string, type: 'barcode' | 'qr') => void;
  onClose: () => void;
  isOpen: boolean;
  title?: string;
}

const BarcodeQRScanner: React.FC<BarcodeQRScannerProps> = ({ 
  onScan, 
  onClose, 
  isOpen, 
  title = "Scan Barcode or QR Code" 
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = 'qr-reader';

  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      cleanup();
    }

    return () => cleanup();
  }, [isOpen]);

  const initializeScanner = async () => {
    try {
      setError('');
      setHasPermission(null);
      
      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      console.log('Available cameras:', devices);
      setCameras(devices);
      
      if (devices.length === 0) {
        setError('ไม่พบกล้อง');
        setHasPermission(false);
        return;
      }

      // Select back camera by default on mobile
      const backCamera = devices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      const cameraId = selectedCamera || backCamera?.id || devices[0]?.id;
      
      if (cameraId) {
        setSelectedCamera(cameraId);
        await startScanning(cameraId);
      }
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError('ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบสิทธิ์การใช้งาน');
      setHasPermission(false);
    }
  };

  const startScanning = async (cameraId: string) => {
    try {
      setIsScanning(true);
      setHasPermission(true);
      
      // Create scanner instance
      const scanner = new Html5Qrcode(scannerElementId);
      scannerRef.current = scanner;
      
      // Scanner configuration for better performance
      const config = {
        fps: 10, // Frames per second
        qrbox: { 
          width: Math.min(250, window.innerWidth * 0.7), 
          height: Math.min(250, window.innerWidth * 0.7) 
        },
        aspectRatio: 1.0,
        disableFlip: false,
        videoConstraints: {
          facingMode: { ideal: "environment" },
          advanced: [
            { focusMode: "continuous" },
            { exposureMode: "continuous" }
          ]
        }
      };

      // Start scanning
      await scanner.start(
        cameraId,
        config,
        (decodedText, decodedResult) => {
          console.log('Scan successful:', decodedText);
          
          // Determine if it's QR or barcode based on format
          const format = decodedResult.result?.format?.formatName?.toLowerCase() || '';
          const isQR = format.includes('qr') || decodedText.startsWith('{') || decodedText.includes('http');
          
          onScan(decodedText, isQR ? 'qr' : 'barcode');
          cleanup();
        },
        (errorMessage) => {
          // Handle scan errors silently (this fires frequently during scanning)
          console.debug('Scan error:', errorMessage);
        }
      );
      
    } catch (err) {
      console.error('Scanner start error:', err);
      setError('ไม่สามารถเริ่มการสแกนได้: ' + err.message);
      setIsScanning(false);
      setHasPermission(false);
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    
    const currentIndex = cameras.findIndex(camera => camera.id === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    
    if (nextCamera && scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setSelectedCamera(nextCamera.id);
        await startScanning(nextCamera.id);
      } catch (err) {
        console.error('Camera switch error:', err);
        setError('ไม่สามารถเปลี่ยนกล้องได้');
      }
    }
  };

  const cleanup = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current?.clear();
        scannerRef.current = null;
      }).catch(err => {
        console.error('Cleanup error:', err);
      });
    }
    setIsScanning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full h-full max-w-md max-h-screen bg-black">
        {/* Header - Responsive */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
          <div className="flex items-center justify-between text-white">
            <h2 className="text-lg font-semibold text-responsive">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors touch-target"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Scanner Content */}
        <div className="relative w-full h-full flex items-center justify-center">
          {hasPermission === null && (
            <div className="text-white text-center p-4">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-responsive">กำลังขอสิทธิ์เข้าถึงกล้อง...</p>
            </div>
          )}

          {hasPermission === false && (
            <div className="text-white text-center p-4">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4 text-responsive">ไม่สามารถเข้าถึงกล้องได้</p>
              <p className="text-sm opacity-75 mb-4">
                กรุณาอนุญาตการใช้งานกล้องและรีเฟรชหน้า
              </p>
              <button
                onClick={initializeScanner}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors touch-target"
              >
                ลองใหม่
              </button>
            </div>
          )}

          {error && (
            <div className="text-white text-center p-4">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2 text-responsive">เกิดข้อผิดพลาดกับกล้อง</p>
              <p className="text-sm opacity-75 mb-4">{error}</p>
              <button
                onClick={initializeScanner}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors touch-target"
              >
                ลองใหม่
              </button>
            </div>
          )}

          {hasPermission && (
            <>
              {/* Scanner Element */}
              <div 
                id={scannerElementId} 
                className="w-full h-full flex items-center justify-center"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  background: 'transparent'
                }}
              />
              
              {/* Scanning Instructions */}
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-center px-4">
                <p className="text-sm text-responsive">วางบาร์โค้ดหรือ QR Code ในกรอบ</p>
                <p className="text-xs opacity-75 mt-1">
                  กล้องจะสแกนอัตโนมัติ
                </p>
              </div>
            </>
          )}
        </div>

        {/* Controls - Responsive */}
        {hasPermission && (
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
            <div className="flex items-center justify-center space-x-6">
              {/* Camera Switch */}
              {cameras.length > 1 && (
                <button
                  onClick={switchCamera}
                  className="p-3 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-colors touch-target"
                  title="เปลี่ยนกล้อง"
                >
                  <RotateCcw className="h-6 w-6" />
                </button>
              )}

              {/* Manual Scan Button */}
              <button
                onClick={() => {
                  // Force a scan attempt by restarting scanner
                  if (scannerRef.current && selectedCamera) {
                    cleanup();
                    setTimeout(() => startScanning(selectedCamera), 100);
                  }
                }}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors touch-target"
                title="สแกนใหม่"
              >
                <Scan className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeQRScanner;
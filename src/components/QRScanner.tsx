import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Flashlight, FlashlightOff, RotateCcw } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
  title?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ 
  onScan, 
  onClose, 
  isOpen, 
  title = "Scan QR Code" 
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (isOpen) {
      initializeCamera();
    } else {
      cleanup();
    }

    return () => cleanup();
  }, [isOpen, selectedCamera]);

  const initializeCamera = async () => {
    try {
      setError('');
      setHasPermission(null);
      
      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
      
      // Select back camera by default on mobile
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      const cameraId = selectedCamera || backCamera?.deviceId || videoDevices[0]?.deviceId;
      
      if (cameraId) {
        setSelectedCamera(cameraId);
        await startCamera(cameraId);
      } else {
        setError('ไม่พบกล้อง');
        setHasPermission(false);
      }
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError('ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบสิทธิ์การใช้งาน');
      setHasPermission(false);
    }
  };

  const startCamera = async (deviceId: string) => {
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : { ideal: 'environment' },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setHasPermission(true);
        startScanning();
      }
    } catch (err) {
      console.error('Camera start error:', err);
      setError('ไม่สามารถเริ่มกล้องได้: ' + err.message);
      setHasPermission(false);
    }
  };

  const startScanning = async () => {
    if (!videoRef.current || isScanning) return;

    try {
      setIsScanning(true);
      
      // Initialize ZXing reader
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      
      // Start continuous scanning
      const result = await reader.decodeFromVideoDevice(
        selectedCamera,
        videoRef.current,
        (result, error) => {
          if (result) {
            console.log('QR Code scanned:', result.getText());
            onScan(result.getText());
            cleanup();
          }
          if (error) {
            console.debug('Scan error:', error);
          }
        }
      );
      
    } catch (err) {
      console.error('Scanner start error:', err);
      setError('ไม่สามารถเริ่มการสแกนได้: ' + err.message);
      setIsScanning(false);
    }
  };

  const toggleFlash = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && 'torch' in track.getCapabilities()) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled } as any]
          });
          setFlashEnabled(!flashEnabled);
        } catch (err) {
          console.error('Flash toggle error:', err);
        }
      }
    }
  };

  const switchCamera = () => {
    const currentIndex = cameras.findIndex(camera => camera.deviceId === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    if (nextCamera) {
      setSelectedCamera(nextCamera.deviceId);
    }
  };

  const cleanup = () => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsScanning(false);
    setFlashEnabled(false);
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

        {/* Camera View - Responsive */}
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
                onClick={initializeCamera}
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
                onClick={initializeCamera}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors touch-target"
              >
                ลองใหม่
              </button>
            </div>
          )}

          {hasPermission && (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover camera-video"
                playsInline
                muted
              />
              
              {/* Scanning Overlay - Responsive */}
              <div className="camera-overlay-responsive">
                <div className="relative">
                  <div className="scan-frame">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                    
                    {/* Scanning line animation */}
                    <div className="scan-line"></div>
                  </div>
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white text-center">
                    <p className="text-sm text-responsive">วาง QR Code ในกรอบ</p>
                    <p className="text-xs opacity-75 mt-1">
                      กล้องจะสแกนอัตโนมัติ
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Controls - Responsive */}
        {hasPermission && (
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
            <div className="flex items-center justify-center space-x-6">
              {/* Flash Toggle */}
              <button
                onClick={toggleFlash}
                className={`p-3 rounded-full transition-colors touch-target ${
                  flashEnabled 
                    ? 'bg-yellow-500 text-black' 
                    : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
                title={flashEnabled ? 'ปิดแฟลช' : 'เปิดแฟลช'}
              >
                {flashEnabled ? (
                  <FlashlightOff className="h-6 w-6" />
                ) : (
                  <Flashlight className="h-6 w-6" />
                )}
              </button>

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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
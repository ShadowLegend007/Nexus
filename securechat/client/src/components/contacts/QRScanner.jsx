import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

export function QRScanner({ onScanSuccess, onScanError, onClose }) {
  const [cameraPermission, setCameraPermission] = useState('pending'); // 'pending' | 'granted' | 'denied'
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    const scannerId = 'qr-reader-element';
    const html5Qrcode = new Html5Qrcode(scannerId);
    setScanner(html5Qrcode);

    // Request camera permission and start scanning
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          // Use first device (typically back camera on mobile or primary webcam)
          const primaryCamera = devices[0].id;
          
          return html5Qrcode.start(
            primaryCamera,
            {
              fps: 10,
              qrbox: { width: 200, height: 200 },
            },
            (decodedText) => {
              // On Success
              html5Qrcode.stop()
                .then(() => {
                  onScanSuccess(decodedText);
                })
                .catch((err) => console.error('Failed to stop scanner:', err));
            },
            (errorMessage) => {
              // Verbose error logging can be skipped, but bubble up if needed
              if (onScanError) onScanError(errorMessage);
            }
          );
        } else {
          throw new Error('No camera devices found.');
        }
      })
      .then(() => {
        setCameraPermission('granted');
      })
      .catch((err) => {
        console.error('Camera Scanner Error:', err);
        setCameraPermission('denied');
      });

    return () => {
      if (html5Qrcode && html5Qrcode.isScanning) {
        html5Qrcode.stop()
          .catch((err) => console.error('Failed to stop scanner in cleanup:', err));
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-surface-dark2 border border-border-dark rounded-2xl w-full max-w-sm dark:bg-surface-dark2 dark:border-border-dark light:bg-surface-light2 light:border-border-light">
      <h3 className="text-sm font-bold text-text-primaryDark mb-4 dark:text-text-primaryDark light:text-text-primaryLight flex items-center">
        <Camera size={16} className="mr-2 text-primary" />
        Scan QR Code
      </h3>

      <div className="relative w-full aspect-square max-w-[240px] bg-black rounded-xl overflow-hidden border border-border-dark flex items-center justify-center mb-4">
        {/* The scanner element */}
        <div id="qr-reader-element" className="absolute inset-0 w-full h-full" />

        {cameraPermission === 'pending' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-dark2 text-text-secondaryDark p-4 text-center">
            <RefreshCw className="animate-spin text-primary mb-2" size={24} />
            <span className="text-xs">Requesting camera access...</span>
          </div>
        )}

        {cameraPermission === 'denied' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-danger/10 text-danger p-4 text-center">
            <AlertCircle className="mb-2" size={28} />
            <span className="text-xs font-semibold mb-1">Camera Access Blocked</span>
            <span className="text-[10px] text-text-secondaryDark leading-relaxed">
              Please grant camera permission in your browser settings, or enter the Hex code manually.
            </span>
          </div>
        )}
      </div>

      <div className="w-full flex gap-2">
        <Button variant="outline" onClick={onClose} className="w-full">
          Close Scanner
        </Button>
      </div>
    </div>
  );
}

export default QRScanner;

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Copy, Check } from 'lucide-react';
import { formatHexId, copyToClipboard } from '../../utils/hexGenerator';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export function QRDisplay({ hexId, username }) {
  const [copied, setCopied] = React.useState(false);
  const formattedHex = formatHexId(hexId);

  const handleCopy = () => {
    copyToClipboard(formattedHex)
      .then(() => {
        setCopied(true);
        toast.success('Hex ID copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to copy. Please copy manually.');
      });
  };


  const downloadQR = () => {
    try {
      const canvas = document.getElementById('qr-canvas');
      if (!canvas) {
        toast.error('Failed to capture QR canvas');
        return;
      }
      
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `SecureChat-QR-${username || 'identity'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success('QR Code downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Download failed.');
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-surface-dark2 border border-border-dark rounded-2xl w-full max-w-sm text-center dark:bg-surface-dark2 dark:border-border-dark light:bg-surface-light2 light:border-border-light">
      <div className="p-3 bg-white rounded-2xl mb-4 shadow-xl">
        <QRCodeCanvas
          id="qr-canvas"
          value={hexId || ''}
          size={180}
          bgColor="#FFFFFF"
          fgColor="#000000"
          level="H"
          includeMargin={true}
        />
      </div>

      <div className="w-full space-y-3">
        <div>
          <div className="text-xs text-text-secondaryDark dark:text-text-secondaryDark light:text-text-secondaryLight uppercase tracking-wider mb-1 font-semibold">
            YOUR DIGITAL IDENTITY
          </div>
          <div className="text-xl font-bold font-mono tracking-wider text-primary">
            {formattedHex}
          </div>
        </div>

        <div className="flex gap-2 w-full justify-center">
          <Button variant="outline" onClick={handleCopy} className="flex-1 !py-1.5 !px-3">
            {copied ? <Check size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
            Copy Hex
          </Button>
          <Button variant="primary" onClick={downloadQR} className="flex-1 !py-1.5 !px-3 bg-primary border-primary">
            <Download size={14} className="mr-1.5" />
            Download QR
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QRDisplay;

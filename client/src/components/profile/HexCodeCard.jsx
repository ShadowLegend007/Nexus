import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Check, Download, ShieldCheck } from 'lucide-react';
import { formatHexId, copyToClipboard } from '../../utils/hexGenerator';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export function HexCodeCard({ hexId, username }) {
  const [copied, setCopied] = React.useState(false);
  const formattedHex = formatHexId(hexId);

  const handleCopy = () => {
    copyToClipboard(formattedHex)
      .then(() => {
        setCopied(true);
        toast.success('Hex Code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to copy. Please copy manually.');
      });
  };


  const handleDownload = () => {
    try {
      const canvas = document.getElementById('profile-qr-canvas');
      if (!canvas) {
        toast.error('Failed to capture QR canvas');
        return;
      }
      
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `SecureChat-ID-${username || 'profile'}.png`;
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
    <div className="flex flex-col items-center p-6 bg-surface-dark border border-border-dark rounded-2xl w-full max-w-sm text-center mx-auto shadow-xl dark:bg-surface-dark dark:border-border-dark light:bg-surface-light light:border-border-light">
      <div className="flex items-center text-xs text-primary font-bold uppercase tracking-widest mb-4 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
        <ShieldCheck size={14} className="mr-1.5" />
        Verified Identity Code
      </div>

      <div className="p-4 bg-white rounded-2xl mb-5 shadow-inner">
        <QRCodeCanvas
          id="profile-qr-canvas"
          value={hexId || ''}
          size={200}
          bgColor="#FFFFFF"
          fgColor="#000000"
          level="H"
          includeMargin={true}
        />
      </div>

      <div className="w-full space-y-4">
        <div>
          <span className="text-[10px] text-text-secondaryDark dark:text-text-secondaryDark light:text-text-secondaryLight font-bold uppercase tracking-widest block mb-1">
            HEX-CODE IDENTITY
          </span>
          <span className="text-2xl font-black font-mono tracking-widest text-primary block">
            {formattedHex}
          </span>
        </div>

        <p className="text-xs text-text-secondaryDark leading-relaxed dark:text-text-secondaryDark light:text-text-secondaryLight">
          This is your unique SecureChat address. Share this code or QR with friends so they can add you and exchange real-time encrypted messages.
        </p>

        <div className="flex gap-3 w-full">
          <Button variant="outline" onClick={handleCopy} className="flex-1 !py-2">
            {copied ? <Check size={16} className="mr-2 text-success" /> : <Copy size={16} className="mr-2" />}
            {copied ? 'Copied' : 'Copy Hex'}
          </Button>
          
          <Button variant="primary" onClick={handleDownload} className="flex-1 !py-2 bg-primary border-primary">
            <Download size={16} className="mr-2" />
            Download QR
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HexCodeCard;

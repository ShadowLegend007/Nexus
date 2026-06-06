import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Check, Download, ShieldCheck } from 'lucide-react';
import { formatHexId, copyToClipboard } from '../../utils/hexGenerator';
import { Button } from '../ui/Button';
import { HexDisplay } from '../ui/HexDisplay';
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
      downloadLink.download = `Nexus-ID-${username || 'profile'}.png`;
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
    <div className="flex flex-col items-center w-full text-center mx-auto">
      <div className="flex items-center text-[10px] text-success font-bold uppercase tracking-widest mb-4 bg-success/10 px-3 py-1 rounded-full border border-success/30 ">
        <ShieldCheck size={14} className="mr-1.5" />
        Verified Identity Code
      </div>

      <div className="relative p-3 bg-white rounded-2xl mb-6 shadow-inner group overflow-hidden">
        {/* Animated Sweep Line */}
        <div className="absolute left-0 w-full h-[2px] bg-success shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-sweep pointer-events-none z-10" />
        {/* Glow Ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/40 transition-colors duration-500 pointer-events-none z-10" />
        
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
        <div className="w-full px-2">
          <span className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--text-muted)' }}>
            HEX-CODE IDENTITY
          </span>
          {/* Full hex in one fixed container, no overflow clip */}
          <div className="w-full overflow-hidden px-1">
            <HexDisplay hexCode={formattedHex} className="text-xl sm:text-2xl" />
          </div>
        </div>

        <p className="text-[11px] text-text-secondaryLight dark:text-text-secondaryDark leading-relaxed px-2">
          This is your unique address. Share this code or QR with friends to exchange real-time encrypted messages.
        </p>

        <div className="flex gap-3 w-full">
          <button 
            onClick={handleCopy} 
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all text-sm group"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-input)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          >
            {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy Hex'}
          </button>
          
          <Button onClick={handleDownload} className="flex-1 text-sm">
            <Download size={16} />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HexCodeCard;

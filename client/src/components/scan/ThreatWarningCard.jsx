import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

export function ThreatWarningCard({ 
  threatType = 'TROJAN', 
  confidence = 0.95,
  onOverrideClean // Callback to bypass block
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const confidencePercentage = Math.round((confidence || 0.95) * 100);

  const handleReportFalsePositive = () => {
    toast.success('False positive reported to AI security team. Thank you!');
  };

  const handleConfirmOverride = () => {
    setShowConfirmModal(false);
    toast.success('Bypass authorized. Loading contents.');
    if (onOverrideClean) {
      onOverrideClean();
    }
  };

  return (
    <div className="w-full bg-danger/10 border border-danger/30 rounded-xl p-4 max-w-sm text-left">
      <div className="flex items-center text-danger font-bold text-sm mb-2 uppercase tracking-wide">
        <ShieldAlert size={18} className="mr-2" />
        🚫 THREAT DETECTED
      </div>
      
      <div className="space-y-1 text-xs text-text-secondaryDark mb-4">
        <div><strong className="text-text-primaryDark">Type:</strong> <span className="font-mono text-danger">{threatType}</span></div>
        <div><strong className="text-text-primaryDark">Confidence:</strong> <span className="font-semibold text-danger">{confidencePercentage}%</span></div>
        <div><strong className="text-text-primaryDark">Detected by:</strong> AI Security Model</div>
        <div className="mt-2 text-text-mutedDark italic">This content has been quarantined.</div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button 
          variant="outline" 
          onClick={handleReportFalsePositive}
          className="!text-[10px] !py-1 !px-2 border-danger/30 text-danger hover:bg-danger/10"
        >
          Report False Positive
        </Button>
        <Button 
          variant="danger" 
          onClick={() => setShowConfirmModal(true)}
          className="!text-[10px] !py-1 !px-2 bg-danger border-danger hover:bg-danger/95 shadow-md shadow-danger/20"
        >
          View anyway ⚠️
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Override AI Quarantine Security?"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-danger/20 rounded-full text-danger">
            <AlertTriangle size={32} />
          </div>
          
          <h4 className="text-base font-bold text-text-primaryDark dark:text-text-primaryDark light:text-text-primaryLight">
            Are you absolutely sure?
          </h4>
          
          <p className="text-sm text-text-secondaryDark leading-relaxed">
            AI has flagged this content as high risk ({confidencePercentage}% confidence {threatType}). Overriding the block could expose your device to security vulnerabilities, malware executables, or phishing links.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Keep Quarantined
            </Button>
            <Button variant="danger" onClick={handleConfirmOverride}>
              Confirm Bypass
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ThreatWarningCard;

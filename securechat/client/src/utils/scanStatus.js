import { SCAN_STATES } from '../constants/scanStates';

/**
 * Returns UI metadata (classes, labels, color names) based on current scan status.
 * @param {string} status 
 * @returns {object} UI metadata properties
 */
export function getScanStatusConfig(status) {
  const configs = {
    [SCAN_STATES.SENDING]: {
      label: 'Sending...',
      bgClass: 'bg-gray-800 text-gray-400 border-gray-700',
      iconColor: '#8B98B8',
      isBlurred: false,
    },
    [SCAN_STATES.SCANNING]: {
      label: 'Scanning...',
      bgClass: 'bg-surface-dark2 text-text-secondaryDark border-border-dark animate-pulse',
      iconColor: '#8B98B8',
      isBlurred: true,
    },
    [SCAN_STATES.TIER2_SCANNING]: {
      label: 'Deep scan in progress...',
      bgClass: 'bg-warning/20 text-warning border-warning/40 animate-pulse',
      iconColor: '#F59E0B',
      isBlurred: true,
    },
    [SCAN_STATES.CLEAN]: {
      label: 'Verified safe',
      bgClass: 'bg-success/20 text-success border-success/40',
      iconColor: '#22C55E',
      isBlurred: false,
    },
    [SCAN_STATES.SUSPICIOUS]: {
      label: 'Caution — threat detected',
      bgClass: 'bg-warning/20 text-warning border-warning/40',
      iconColor: '#F59E0B',
      isBlurred: false,
    },
    [SCAN_STATES.MALWARE]: {
      label: 'Threat blocked',
      bgClass: 'bg-danger/20 text-danger border-danger/40',
      iconColor: '#EF4444',
      isBlurred: false, // Replaced by ThreatWarningCard anyway
    },
    [SCAN_STATES.QUARANTINED]: {
      label: 'Quarantined',
      bgClass: 'bg-danger/40 text-danger border-danger/60',
      iconColor: '#EF4444',
      isBlurred: false,
    }
  };

  return configs[status] || configs[SCAN_STATES.SCANNING];
}

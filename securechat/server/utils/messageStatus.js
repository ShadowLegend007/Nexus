const SCAN_STATES = {
  SENDING: 'SENDING',
  SCANNING: 'SCANNING',
  TIER2_SCANNING: 'TIER2_SCANNING',
  CLEAN: 'CLEAN',
  SUSPICIOUS: 'SUSPICIOUS',
  MALWARE: 'MALWARE',
  QUARANTINED: 'QUARANTINED'
};

const VALID_STATUSES = Object.values(SCAN_STATES);

/**
 * Validates if the next state transition is permitted.
 * @param {string} currentStatus 
 * @param {string} nextStatus 
 * @returns {boolean}
 */
function isValidTransition(currentStatus, nextStatus) {
  if (!VALID_STATUSES.includes(currentStatus) || !VALID_STATUSES.includes(nextStatus)) {
    return false;
  }

  // Define transition rules
  const rules = {
    [SCAN_STATES.SENDING]: [SCAN_STATES.SCANNING],
    [SCAN_STATES.SCANNING]: [SCAN_STATES.TIER2_SCANNING, SCAN_STATES.CLEAN, SCAN_STATES.SUSPICIOUS, SCAN_STATES.MALWARE],
    [SCAN_STATES.TIER2_SCANNING]: [SCAN_STATES.CLEAN, SCAN_STATES.SUSPICIOUS, SCAN_STATES.MALWARE],
    [SCAN_STATES.CLEAN]: [], // Final state
    [SCAN_STATES.SUSPICIOUS]: [], // Final state
    [SCAN_STATES.MALWARE]: [SCAN_STATES.QUARANTINED, SCAN_STATES.CLEAN], // Can quarantine or be marked clean if false positive
    [SCAN_STATES.QUARANTINED]: [SCAN_STATES.CLEAN] // Can be marked clean upon admin false positive override
  };

  return rules[currentStatus]?.includes(nextStatus) || false;
}

module.exports = {
  SCAN_STATES,
  VALID_STATUSES,
  isValidTransition
};

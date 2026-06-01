const { handleVerdict } = require('../services/mlService');

// @desc    Callback endpoint for ML models to post scanning verdicts
// @route   POST /api/ml/verdict
// @access  Public (In production, this should be secured via API tokens or whitelist IPs)
const postVerdict = async (req, res) => {
  try {
    const {
      messageId,
      tier,
      verdict,
      confidence,
      threatType,
      details
    } = req.body;

    if (!messageId || !verdict) {
      return res.status(400).json({ message: 'Message ID and Verdict are required fields.' });
    }

    const updatedMessage = await handleVerdict({
      messageId,
      tier: tier || 1,
      verdict,
      confidence: confidence || null,
      threatType: threatType || null,
      details: details || null
    });

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found to apply verdict.' });
    }

    return res.json({
      success: true,
      message: 'Verdict processed successfully',
      scanStatus: updatedMessage.scanStatus
    });
  } catch (error) {
    console.error('Webhook Verdict Processing Error:', error);
    return res.status(500).json({ message: 'Server error processing verdict.' });
  }
};

module.exports = {
  postVerdict,
};

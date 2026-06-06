const path = require('path');

function getContentTypeFromMimetype(mimetype) {
  if (!mimetype) return 'other';
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.includes('word') || mimetype.includes('msword')) return 'word';
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'ppt';
  if (mimetype.includes('sheet') || mimetype.includes('excel')) return 'excel';
  return 'other';
}

// @desc    Upload file (image, video, document, etc.)
// @route   POST /api/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let fileUrl = '';
    
    // Always use local URL built from the incoming request
    const host = req.get('host');
    const protocol = req.protocol;
    fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    const contentType = getContentTypeFromMimetype(req.file.mimetype);

    return res.json({
      fileUrl: fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      contentType: contentType,
    });
  } catch (error) {
    console.error('File Upload Error:', error);
    return res.status(500).json({ message: error.message || 'Server upload failure' });
  }
};

module.exports = {
  uploadFile,
};

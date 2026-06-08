const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

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

const getCloudinaryConfig = (type) => {
  if (type === 'MEDIA') {
    return {
      cloud_name: process.env.CLOUDINARY_MEDIA_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_MEDIA_API_KEY,
      api_secret: process.env.CLOUDINARY_MEDIA_API_SECRET,
    };
  } else if (type === 'DOCS') {
    return {
      cloud_name: process.env.CLOUDINARY_DOCS_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_DOCS_API_KEY,
      api_secret: process.env.CLOUDINARY_DOCS_API_SECRET,
    };
  } else if (type === 'BACKUP') {
    return {
      cloud_name: process.env.CLOUDINARY_BACKUP_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_BACKUP_API_KEY,
      api_secret: process.env.CLOUDINARY_BACKUP_API_SECRET,
    };
  }
  return null;
};

// @desc    Upload file to primary and backup Cloudinary accounts
// @route   POST /api/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const contentType = getContentTypeFromMimetype(req.file.mimetype);
    
    // Size Validation
    const sizeInMB = req.file.size / (1024 * 1024);
    if (contentType === 'image' && sizeInMB > 5) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Image size cannot exceed 5MB' });
    }
    if (sizeInMB > 10) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'File size cannot exceed 10MB' });
    }
    
    // Determine the primary cloudinary account (MEDIA for images/videos/audio, DOCS for others)
    const isMedia = ['image', 'video', 'audio'].includes(contentType);
    const primaryConfig = getCloudinaryConfig(isMedia ? 'MEDIA' : 'DOCS');
    const backupConfig = getCloudinaryConfig('BACKUP');

    const resourceType = ['image', 'video', 'audio'].includes(contentType) ? 'auto' : 'raw';

    let primaryUploadResult = null;
    let backupUploadResult = null;

    // Check if Cloudinary is configured. If not, fallback to local URL (for development)
    if (!primaryConfig.cloud_name || !backupConfig.cloud_name) {
       const host = req.get('host');
       const protocol = req.protocol;
       const localUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
       return res.json({
         fileUrl: localUrl,
         backupFileUrl: localUrl,
         fileName: req.file.originalname,
         fileSize: req.file.size,
         contentType: contentType,
       });
    }

    // Upload to primary account
    primaryUploadResult = await cloudinary.uploader.upload(req.file.path, {
      ...primaryConfig,
      resource_type: resourceType,
      folder: isMedia ? 'nexus/media' : 'nexus/docs',
    });

    // Upload to backup account
    backupUploadResult = await cloudinary.uploader.upload(req.file.path, {
      ...backupConfig,
      resource_type: resourceType,
      folder: 'nexus/backup',
    });

    // Remove file from local disk after successful cloud upload
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.json({
      fileUrl: primaryUploadResult.secure_url,
      backupFileUrl: backupUploadResult.secure_url,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      contentType: contentType,
    });
  } catch (error) {
    console.error('File Upload Error:', error);
    // Cleanup local file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: error.message || 'Server upload failure' });
  }
};

module.exports = {
  uploadFile,
};

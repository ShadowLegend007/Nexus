import { ALL_ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from '../constants/fileTypes';

/**
 * Validates a file for type/extension compatibility and size limits.
 * @param {File} file 
 * @returns {{valid: boolean, error?: string}}
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const fileName = file.name;
  const lastDotIndex = fileName.lastIndexOf('.');
  
  if (lastDotIndex === -1) {
    return { valid: false, error: 'File does not have a valid extension.' };
  }

  const extension = fileName.substring(lastDotIndex).toLowerCase();

  // Validate extension
  if (!ALL_ALLOWED_EXTENSIONS.includes(extension)) {
    return { 
      valid: false, 
      error: `Unsupported file format. Supported extensions: ${ALL_ALLOWED_EXTENSIONS.join(', ')}` 
    };
  }

  // Validate file size (max 100MB)
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File size too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 100MB.` 
    };
  }

  return { valid: true };
}

/**
 * Formats bytes to human-readable size.
 * @param {number} bytes 
 * @returns {string} Formatted size (e.g. "12.4 MB")
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

import { useState } from 'react';
import { uploadFile } from '../api/upload';
import { validateFile } from '../utils/fileValidator';

/**
 * Custom hook to manage single file upload lifecycles and upload progress bars.
 * @returns {object} Upload state handler properties
 */
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const upload = async (file) => {
    setError(null);
    setProgress(0);

    // Validate size and format compatibility
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return { success: false, error: validation.error };
    }

    setUploading(true);

    try {
      const progressHandler = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(percentCompleted);
      };

      const result = await uploadFile(file, progressHandler);
      setUploading(false);
      return { success: true, data: result }; // Returns { fileUrl, fileName, fileSize, contentType }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'File upload failed.';
      setError(errMsg);
      setUploading(false);
      return { success: false, error: errMsg };
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setError(null);
  };

  return {
    upload,
    uploading,
    progress,
    error,
    reset,
  };
}

export default useFileUpload;

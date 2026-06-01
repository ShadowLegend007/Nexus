import API from './api';

/**
 * Uploads a file with progress tracking.
 * @param {File} file 
 * @param {Function} onUploadProgress 
 * @returns {Promise<{fileUrl: string, fileName: string, fileSize: number, contentType: string}>}
 */
export const uploadFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await API.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });

  return response.data;
};

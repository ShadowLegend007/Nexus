export const FILE_CATEGORIES = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  PDF: 'pdf',
  WORD: 'word',
  PPT: 'ppt',
  EXCEL: 'excel',
  TEXT: 'other',
  OTHER: 'other'
};

export const ALLOWED_EXTENSIONS = {
  [FILE_CATEGORIES.IMAGE]: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  [FILE_CATEGORIES.VIDEO]: ['.mp4', '.mov', '.webm'],
  [FILE_CATEGORIES.AUDIO]: ['.mp3', '.wav', '.ogg'],
  [FILE_CATEGORIES.PDF]: ['.pdf'],
  [FILE_CATEGORIES.WORD]: ['.doc', '.docx'],
  [FILE_CATEGORIES.PPT]: ['.ppt', '.pptx'],
  [FILE_CATEGORIES.EXCEL]: ['.xls', '.xlsx'],
  [FILE_CATEGORIES.TEXT]: ['.txt'],
};

// Combine all arrays
export const ALL_ALLOWED_EXTENSIONS = Object.values(ALLOWED_EXTENSIONS).flat();

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

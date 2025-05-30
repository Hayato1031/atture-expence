import storage from './storage';

/**
 * File Service - Handles file uploads and management
 */

// Supported image types
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Validate file
const validateFile = (file) => {
  const errors = [];
  
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    errors.push('サポートされていないファイル形式です。JPEG、PNG、GIF、WebPのみ対応しています。');
  }
  
  if (file.size > MAX_FILE_SIZE) {
    errors.push('ファイルサイズが大きすぎます。10MB以下にしてください。');
  }
  
  return errors;
};

// Create thumbnail
const createThumbnail = (file, maxWidth = 300, maxHeight = 300, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64
          const thumbnail = canvas.toDataURL('image/jpeg', quality);
          
          // Clean up object URL
          URL.revokeObjectURL(img.src);
          
          resolve(thumbnail);
        } catch (error) {
          console.error('Error creating thumbnail:', error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('Error loading image for thumbnail:', error);
        URL.revokeObjectURL(img.src);
        reject(error);
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Error in createThumbnail:', error);
      reject(error);
    }
  });
};

// Upload file
export const uploadFile = async (file, description = '') => {
  try {
    // Validate file
    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.join(' ')
      };
    }
    
    // Convert to base64
    const base64Data = await fileToBase64(file);
    
    // Create thumbnail (with fallback)
    let thumbnail = null;
    try {
      thumbnail = await createThumbnail(file);
    } catch (error) {
      console.warn('Failed to create thumbnail, using original:', error);
      // If thumbnail creation fails, use the original image for small files
      if (file.size < 500000) { // 500KB
        thumbnail = base64Data;
      }
    }
    
    // Create file record
    const fileRecord = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalName: file.name,
      fileName: `${Date.now()}_${file.name}`,
      mimeType: file.type,
      size: file.size,
      description: description,
      data: base64Data,
      thumbnail: thumbnail,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'user'
    };
    
    // Save to storage
    const savedFile = storage.addItem('files', fileRecord);
    
    return {
      success: true,
      data: {
        id: savedFile.id,
        originalName: savedFile.originalName,
        fileName: savedFile.fileName,
        mimeType: savedFile.mimeType,
        size: savedFile.size,
        description: savedFile.description,
        data: savedFile.data, // Include the full data for preview
        thumbnail: savedFile.thumbnail,
        uploadedAt: savedFile.uploadedAt
      }
    };
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: 'ファイルのアップロードに失敗しました。'
    };
  }
};

// Get file by ID
export const getFileById = async (id) => {
  try {
    const file = storage.findById('files', id);
    if (!file) {
      return {
        success: false,
        error: 'ファイルが見つかりません。'
      };
    }
    
    return {
      success: true,
      data: file
    };
  } catch (error) {
    console.error('Error getting file:', error);
    return {
      success: false,
      error: 'ファイルの取得に失敗しました。'
    };
  }
};

// Get multiple files by IDs
export const getFilesByIds = async (ids) => {
  try {
    const files = [];
    for (const id of ids) {
      const result = await getFileById(id);
      if (result.success) {
        files.push(result.data);
      }
    }
    
    return {
      success: true,
      data: files
    };
  } catch (error) {
    console.error('Error getting files:', error);
    return {
      success: false,
      error: 'ファイルの取得に失敗しました。'
    };
  }
};

// Delete file
export const deleteFile = async (id) => {
  try {
    storage.deleteItem('files', id);
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: 'ファイルの削除に失敗しました。'
    };
  }
};

// Get all files
export const getAllFiles = async () => {
  try {
    const files = storage.get('files') || [];
    return {
      success: true,
      data: files
    };
  } catch (error) {
    console.error('Error getting all files:', error);
    return {
      success: false,
      error: 'ファイル一覧の取得に失敗しました。'
    };
  }
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Check if file is image
export const isImageFile = (mimeType) => {
  return SUPPORTED_IMAGE_TYPES.includes(mimeType);
};

const fileService = {
  uploadFile,
  getFileById,
  getFilesByIds,
  deleteFile,
  getAllFiles,
  formatFileSize,
  isImageFile
};

export default fileService;
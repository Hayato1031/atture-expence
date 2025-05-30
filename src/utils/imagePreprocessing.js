/**
 * Image preprocessing utilities for better OCR results
 */

/**
 * Preprocess image for better OCR recognition
 * @param {File|Blob} imageFile - The image file to preprocess
 * @returns {Promise<Blob>} - The preprocessed image
 */
export const preprocessImage = async (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Scale image if too large (max 2000px width)
        let width = img.width;
        let height = img.height;
        const maxWidth = 2000;
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Convert to grayscale and increase contrast
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          
          // Increase contrast
          let value = gray;
          value = ((value - 128) * 1.5) + 128; // 1.5 is contrast factor
          value = Math.max(0, Math.min(255, value));
          
          // Apply threshold for better text recognition
          // This helps with receipts that might have poor lighting
          if (value > 180) {
            value = 255; // White
          } else if (value < 80) {
            value = 0; // Black
          }
          
          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
        }
        
        // Put the processed image data back
        ctx.putImageData(imageData, 0, 0);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 0.95);
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
};

/**
 * Check if image needs preprocessing based on basic analysis
 * @param {File|Blob} imageFile - The image file to check
 * @returns {Promise<boolean>} - Whether preprocessing is recommended
 */
export const needsPreprocessing = async (imageFile) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Check if image is too large
        if (img.width > 2000 || img.height > 2000) {
          resolve(true);
          return;
        }
        
        // For now, always recommend preprocessing for receipts
        resolve(true);
      };
      
      img.onerror = () => resolve(false);
      img.src = e.target.result;
    };
    
    reader.onerror = () => resolve(false);
    reader.readAsDataURL(imageFile);
  });
};
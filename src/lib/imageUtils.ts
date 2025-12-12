const MAX_DIMENSION = 1500;
const JPEG_QUALITY = 0.8;
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG base64
        const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

        // Check file size (base64 is ~33% larger than binary)
        const estimatedSize = (base64.length * 3) / 4;
        if (estimatedSize > MAX_FILE_SIZE) {
          // Try lower quality
          const lowerQualityBase64 = canvas.toDataURL('image/jpeg', 0.6);
          const lowerEstimatedSize = (lowerQualityBase64.length * 3) / 4;

          if (lowerEstimatedSize > MAX_FILE_SIZE) {
            reject(new Error('Image is too large even after compression. Please try a smaller image.'));
            return;
          }
          resolve(lowerQualityBase64);
          return;
        }

        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

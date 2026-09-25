/**
 * Image optimization utilities
 * Converts images to WebP format for better compression
 */

/**
 * Convert an image file to WebP format
 * @param file - The original image file
 * @param quality - WebP quality (0-100), default 80
 * @returns Promise<File> - The converted WebP file
 */
export async function convertToWebP(
  file: File,
  quality: number = 80
): Promise<File> {
  // Only convert image files
  if (!file.type.startsWith('image/')) {
    return file
  }

  // If already WebP, return as-is
  if (file.type === 'image/webp') {
    return file
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions (max 1920px width for performance)
      let { width, height } = img
      const maxWidth = 1920
      const maxHeight = 1080

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height

      // Draw and convert
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with WebP extension
            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.webp'),
              {
                type: 'image/webp',
                lastModified: Date.now(),
              }
            )
            resolve(webpFile)
          } else {
            reject(new Error('Failed to convert image to WebP'))
          }
        },
        'image/webp',
        quality / 100
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Get compression ratio
 */
export function getCompressionRatio(original: number, compressed: number): number {
  return Math.round((1 - compressed / original) * 100)
}

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('ka-GE', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function validateImageFile(file: File) {
  // Enhanced file type validation
  const validTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp',
    'image/heic', // Support for HEIC images
    'image/heif'  // Support for HEIF images
  ]
  
  // Check MIME type first
  if (!validTypes.includes(file.type)) {
    // Fallback: check file extension for cases where MIME type might be wrong
    const fileName = file.name.toLowerCase()
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      throw new Error('არასწორი ფაილის ტიპი. გთხოვთ ატვირთოთ მხოლოდ JPG, PNG, WEBP, HEIC ან HEIF სურათები.')
    }
  }

  // Enhanced size validation with better error messages
  const maxSize = 15 * 1024 * 1024 // Increased to 15MB for better compatibility
  const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
  
  if (file.size > maxSize) {
    throw new Error(`ფაილი ძალიან დიდია (${fileSizeMB} MB). გთხოვთ ატვირთოთ 15MB-ზე ნაკლები სურათები.`)
  }

  // Additional validation: check if file is actually an image
  if (file.size === 0) {
    throw new Error('ფაილი ცარიელია. გთხოვთ ატვირთოთ სწორი სურათი.')
  }

  return true
}

export function sanitizePrompt(prompt: string) {
  return prompt.trim().replace(/[<>]/g, '')
}

// New function to get file extension
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

// Client-side only function to check if file is actually an image by reading first few bytes
export async function validateImageContent(file: File): Promise<boolean> {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof FileReader === 'undefined') {
    // Server-side: fallback to basic validation
    return validateImageFile(file) !== false
  }

  return new Promise((resolve) => {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 4)
          let header = ''
          for (let i = 0; i < arr.length; i++) {
            header += arr[i].toString(16)
          }
          
          // Check for common image file signatures
          const signatures = {
            'ffd8ff': 'JPEG',
            '89504e47': 'PNG',
            '52494646': 'WEBP',
            '00000100': 'ICO',
            '47494638': 'GIF'
          }
          
          const isValidImage = Object.keys(signatures).some(sig => header.startsWith(sig))
          resolve(isValidImage)
        } catch (error) {
          resolve(false)
        }
      }
      reader.onerror = () => resolve(false)
      reader.readAsArrayBuffer(file.slice(0, 4))
    } catch (error) {
      resolve(false)
    }
  })
}

// Server-safe validation function
export function validateImageFileServerSafe(file: File): boolean {
  try {
    validateImageFile(file)
    return true
  } catch (error) {
    return false
  }
}

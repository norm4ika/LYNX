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
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!validTypes.includes(file.type)) {
    throw new Error('არასწორი ფაილის ტიპი. გთხოვთ ატვირთოთ მხოლოდ JPG, PNG ან WEBP სურათები.')
  }

  if (file.size > maxSize) {
    throw new Error('ფაილი ძალიან დიდია. გთხოვთ ატვირთოთ 10MB-ზე ნაკლები სურათები.')
  }

  return true
}

export function sanitizePrompt(prompt: string) {
  return prompt.trim().replace(/[<>]/g, '')
}

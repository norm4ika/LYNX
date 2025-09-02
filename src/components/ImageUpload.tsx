'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react'
import { cn, validateImageFile, validateImageContent } from '@/lib/utils'

interface ImageUploadProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
}

export default function ImageUpload({ onFileSelect, selectedFile }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateFile = async (file: File): Promise<string | null> => {
    try {
      // Basic validation
      validateImageFile(file)

      // Client-side content validation (only in browser)
      if (typeof window !== 'undefined' && typeof FileReader !== 'undefined') {
        setIsValidating(true)
        const isValidContent = await validateImageContent(file)

        if (!isValidContent) {
          return 'ფაილი არ არის სწორი სურათი. გთხოვთ ატვირთოთ სწორი სურათის ფაილი.'
        }
      }

      return null
    } catch (err: any) {
      return err.message
    } finally {
      setIsValidating(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors.length > 0) {
        const error = rejection.errors[0]
        if (error.code === 'file-invalid-type') {
          setError('არასწორი ფაილის ტიპი. მხოლოდ JPG, PNG, WEBP, HEIC და HEIF ფაილებია დაშვებული.')
        } else if (error.code === 'file-too-large') {
          setError('ფაილი ძალიან დიდია. მაქსიმალური ზომაა 15MB.')
        } else {
          setError('ფაილის ატვირთვა ვერ მოხერხდა.')
        }
      }
      return
    }

    const file = acceptedFiles[0]
    if (file) {
      // Enhanced validation
      const validationError = await validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      onFileSelect(file)
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.onerror = () => {
        setError('ფაილის წაკითხვა ვერ მოხერხდა.')
      }
      reader.readAsDataURL(file)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif']
    },
    multiple: false,
    maxSize: 15 * 1024 * 1024, // 15MB
    maxFiles: 1
  })

  const removeFile = () => {
    onFileSelect(null as any)
    setPreview(null)
    setError(null)
  }

  if (selectedFile && preview) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border-2 border-white/20"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <button
              onClick={removeFile}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
              title="ფაილის წაშლა"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-purple-500 bg-purple-500/10"
            : "border-white/20 hover:border-white/40 hover:bg-white/5",
          error && "border-red-500 bg-red-500/10"
        )}
      >
        <input {...getInputProps()} />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
            isDragActive
              ? "bg-purple-500/20 text-purple-400"
              : error
                ? "bg-red-500/20 text-red-400"
                : isValidating
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-white/10 text-white/60"
          )}>
            {isDragActive ? (
              <Upload className="w-8 h-8 animate-bounce" />
            ) : error ? (
              <AlertCircle className="w-8 h-8" />
            ) : isValidating ? (
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
            ) : (
              <ImageIcon className="w-8 h-8" />
            )}
          </div>
          <div>
            <p className="text-lg font-medium text-white mb-2">
              {isDragActive ? "გადაიტანეთ სურათი აქ" : "გადაიტანეთ და ჩამოაგდეთ თქვენი სურათი"}
            </p>
            <p className="text-gray-400 text-sm">
              ან დააჭირეთ ფაილების ასარჩევად (JPG, PNG, WEBP, HEIC, HEIF 15MB-მდე)
            </p>
            {isValidating && (
              <p className="text-yellow-400 text-sm mt-2">
                სურათის შემოწმება...
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}
    </div>
  )
}

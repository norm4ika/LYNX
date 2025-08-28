'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
}

export default function ImageUpload({ onFileSelect, selectedFile }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      onFileSelect(file)
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  const removeFile = () => {
    onFileSelect(null as any)
    setPreview(null)
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
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-300">
          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      </motion.div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
        isDragActive
          ? "border-purple-500 bg-purple-500/10"
          : "border-white/20 hover:border-white/40 hover:bg-white/5"
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
            : "bg-white/10 text-white/60"
        )}>
          {isDragActive ? (
            <Upload className="w-8 h-8 animate-bounce" />
          ) : (
            <ImageIcon className="w-8 h-8" />
          )}
        </div>
        <div>
          <p className="text-lg font-medium text-white mb-2">
            {isDragActive ? "გადაიტანეთ სურათი აქ" : "გადაიტანეთ და ჩამოაგდეთ თქვენი სურათი"}
          </p>
          <p className="text-gray-400 text-sm">
            ან დააჭირეთ ფაილების ასარჩევად (JPG, PNG, WEBP 10MB-მდე)
          </p>
        </div>
      </motion.div>
    </div>
  )
}

'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon, FileImage, CheckCircle } from 'lucide-react'
import { validateImageFile } from '@/lib/utils'

interface DragAndDropUploaderProps {
    onFileSelect: (file: File) => void
    selectedFile: File | null
    onFileRemove: () => void
}

export function DragAndDropUploader({ onFileSelect, selectedFile, onFileRemove }: DragAndDropUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        setError('')

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            handleFile(files[0])
        }
    }, [])

    const handleFile = useCallback((file: File) => {
        try {
            setIsUploading(true)
            setError('')
            validateImageFile(file)
            onFileSelect(file)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsUploading(false)
        }
    }, [onFileSelect])

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFile(files[0])
        }
    }, [handleFile])

    const handleClick = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleRemove = useCallback(() => {
        onFileRemove()
        setError('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [onFileRemove])

    return (
        <div className="w-full">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
            />

            <AnimatePresence mode="wait">
                {!selectedFile ? (
                    <motion.div
                        key="upload-zone"
                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${isDragOver
                                ? 'border-purple-400 bg-purple-500/10 scale-105'
                                : 'border-gray-400 hover:border-purple-400 hover:bg-white/5'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Upload Icon */}
                        <motion.div
                            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center"
                            animate={{
                                scale: isDragOver ? 1.1 : 1,
                                rotate: isDragOver ? 5 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <Upload className={`w-10 h-10 ${isDragOver ? 'text-purple-400' : 'text-gray-400'}`} />
                        </motion.div>

                        {/* Upload Text */}
                        <motion.h3
                            className={`text-xl font-semibold mb-2 ${isDragOver ? 'text-purple-400' : 'text-white'
                                }`}
                        >
                            {isDragOver ? 'Drop your image here!' : 'Drag & Drop Your Product Image Here'}
                        </motion.h3>

                        <p className="text-gray-400 mb-4">
                            or <span className="text-purple-400 font-medium">click to browse</span>
                        </p>

                        {/* File Types */}
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <span>Supports:</span>
                            <span className="px-2 py-1 bg-gray-800 rounded text-xs">JPG</span>
                            <span className="px-2 py-1 bg-gray-800 rounded text-xs">PNG</span>
                            <span className="px-2 py-1 bg-gray-800 rounded text-xs">WEBP</span>
                            <span className="px-2 py-1 bg-gray-800 rounded text-xs">HEIC</span>
                        </div>

                        {/* Max Size */}
                        <p className="text-xs text-gray-500 mt-2">Max file size: 15MB</p>

                        {/* Drag Over Overlay */}
                        {isDragOver && (
                            <motion.div
                                className="absolute inset-0 bg-purple-500/10 rounded-2xl border-2 border-purple-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="file-preview"
                        className="relative border-2 border-green-500/30 rounded-2xl p-6 bg-green-500/5"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        {/* File Info */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-semibold">{selectedFile.name}</h3>
                                <p className="text-green-400 text-sm">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for generation
                                </p>
                            </div>
                            <motion.button
                                onClick={handleRemove}
                                className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <X className="w-4 h-4" />
                            </motion.button>
                        </div>

                        {/* Image Preview */}
                        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-800">
                            <img
                                src={URL.createObjectURL(selectedFile)}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-3 left-3 text-white text-sm font-medium">
                                Preview
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <X className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading State */}
            <AnimatePresence>
                {isUploading && (
                    <motion.div
                        className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <motion.div
                            className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <p className="text-blue-400 text-sm">Processing image...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

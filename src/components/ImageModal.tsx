'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'

interface ImageModalProps {
  imageUrl: string
  alt: string
  onClose: () => void
}

export function ImageModal({ imageUrl, alt, onClose }: ImageModalProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [isDragging, setIsDragging] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 20, stiffness: 300 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const imageRef = useRef<HTMLImageElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Reset values when modal opens
  useEffect(() => {
    setScale(1)
    setRotation(0)
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    x.set(0)
    y.set(0)
  }, [imageUrl, x, y])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case '+':
        case '=':
          e.preventDefault()
          setScale(prev => Math.min(prev + 0.2, 3))
          break
        case '-':
          e.preventDefault()
          setScale(prev => Math.max(prev - 0.2, 0.2))
          break
        case 'r':
          e.preventDefault()
          setRotation(prev => prev + 90)
          break
        case '0':
          e.preventDefault()
          setScale(1)
          setRotation(0)
          setBrightness(100)
          setContrast(100)
          setSaturation(100)
          x.set(0)
          y.set(0)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, x])

  // Mouse drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    setIsDragging(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return

    const rect = modalRef.current?.getBoundingClientRect()
    if (!rect) return

    const deltaX = e.movementX / scale
    const deltaY = e.movementY / scale

    x.set(x.get() + deltaX)
    y.set(y.get() + deltaY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Download image
  const handleDownload = async () => {
    if (!imageUrl) return

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `generated-image-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  // Share image
  const handleShare = async () => {
    if (!imageUrl) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Generated Image',
          text: 'Check out this AI-generated commercial image!',
          url: imageUrl
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(imageUrl)
        alert('Image URL copied to clipboard!')
      } catch (error) {
        console.error('Clipboard copy failed:', error)
      }
    }
  }

  if (!imageUrl) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          className="relative max-w-7xl w-full max-h-[90vh] bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <motion.h3
              className="text-2xl font-bold text-white"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {alt}
            </motion.h3>

            <div className="flex items-center space-x-4">
              {/* Image Controls */}
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={() => setScale(prev => Math.max(prev - 0.2, 0.2))}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Zoom Out (-)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={() => setScale(prev => Math.min(prev + 0.2, 3))}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Zoom In (+)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM12 7v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={() => setRotation(prev => prev + 90)}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Rotate (R)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={() => {
                    setScale(1)
                    setRotation(0)
                    setBrightness(100)
                    setContrast(100)
                    setSaturation(100)
                    x.set(0)
                    y.set(0)
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Reset (0)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </motion.button>
              </div>

              <motion.button
                onClick={handleShare}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Share
              </motion.button>

              <motion.button
                onClick={handleDownload}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Download
              </motion.button>

              <motion.button
                onClick={onClose}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                title="Close (Esc)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Image Container */}
          <div className="relative overflow-hidden bg-black">
            <motion.div
              className="flex items-center justify-center min-h-[60vh] cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <motion.img
                ref={imageRef}
                src={imageUrl}
                alt={alt}
                className="max-w-full max-h-full object-contain select-none"
                style={{
                  scale,
                  rotate: `${rotation}deg`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                  x: springX,
                  y: springY,
                  cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
                drag={false}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-image.png'
                }}
              />
            </motion.div>
          </div>

          {/* Image Controls Panel */}
          <motion.div
            className="p-6 border-t border-white/10 bg-gradient-to-r from-gray-800 to-gray-700"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Scale Control */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Zoom: {Math.round(scale * 100)}%</label>
                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Rotation Control */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Rotation: {rotation}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="90"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Brightness Control */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Brightness: {brightness}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Contrast Control */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Contrast: {contrast}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Saturation Control */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Saturation: {saturation}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={saturation}
                  onChange={(e) => setSaturation(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Keyboard Shortcuts Help */}
            <motion.div
              className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <h4 className="text-white font-medium mb-3">Keyboard Shortcuts:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                <div><kbd className="bg-white/10 px-2 py-1 rounded">+</kbd> Zoom In</div>
                <div><kbd className="bg-white/10 px-2 py-1 rounded">-</kbd> Zoom Out</div>
                <div><kbd className="bg-white/10 px-2 py-1 rounded">R</kbd> Rotate</div>
                <div><kbd className="bg-white/10 px-2 py-1 rounded">0</kbd> Reset</div>
                <div><kbd className="bg-white/10 px-2 py-1 rounded">Esc</kbd> Close</div>
                <div><kbd className="bg-white/10 px-2 py-1 rounded">Drag</kbd> Pan (when zoomed)</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

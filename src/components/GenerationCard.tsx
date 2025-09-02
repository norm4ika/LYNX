'use client'

import { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { CompareSlider } from './CompareSlider'
import { AnimatePresence } from 'framer-motion'

interface Generation {
  id: string
  user_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  original_image_url: string
  generated_image_url: string
  prompt_text?: string
  quality_score?: number
  error_message?: string
}

interface GenerationCardProps {
  generation: Generation
  onImageClick: (url: string, alt: string) => void
  isDeleteMode?: boolean
  isSelected?: boolean
  onSelectGeneration?: (id: string) => void
}

export function GenerationCard({
  generation,
  onImageClick,
  isDeleteMode = false,
  isSelected = false,
  onSelectGeneration
}: GenerationCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showCompareSlider, setShowCompareSlider] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // 3D tilt effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 20, stiffness: 300 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const rotateX = useTransform(springY, [-100, 100], [15, -15])
  const rotateY = useTransform(springX, [-100, 100], [-15, 15])
  const scale = useTransform(springX, [-100, 100], [0.95, 1.05])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    x.set(mouseX)
    y.set(mouseY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  // URL validation
  const isValidImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false

    // Check if URL is complete and has valid image extension
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
    const hasValidExtension = validExtensions.some(ext =>
      url.toLowerCase().includes(ext)
    )

    // Check if URL is not truncated (minimum reasonable length)
    const isComplete = url.length > 20 && !url.includes('undefined')

    return hasValidExtension && isComplete
  }

  // Status icon with animations
  const getStatusIcon = () => {
    const baseClasses = "w-6 h-6 rounded-full flex items-center justify-center"

    switch (generation.status) {
      case 'completed':
        return (
          <motion.div
            className={`${baseClasses} bg-green-500 text-white`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )

      case 'processing':
        return (
          <motion.div
            className={`${baseClasses} bg-yellow-500 text-white`}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.div>
        )

      case 'pending':
        return (
          <motion.div
            className={`${baseClasses} bg-blue-500 text-white`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
        )

      case 'failed':
        return (
          <motion.div
            className={`${baseClasses} bg-red-500 text-white`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>
        )

      default:
        return null
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'processing': return 'text-yellow-400'
      case 'pending': return 'text-blue-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const handleSelectionChange = () => {
    if (onSelectGeneration) {
      onSelectGeneration(generation.id)
    }
  }

  return (
    <motion.div
      ref={cardRef}
      className="relative group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      whileHover={{ z: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
        style={{
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
          scale,
        }}
        whileHover={{
          borderColor: "rgba(255, 255, 255, 0.4)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        }}
      >
        {/* Selection Checkbox (only in delete mode) */}
        <AnimatePresence>
          {isDeleteMode && (
            <motion.div
              className="absolute top-4 left-4 z-20"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleSelectionChange}
                className="w-6 h-6 text-red-600 bg-white border-2 border-white rounded-lg focus:ring-red-500 focus:ring-2 cursor-pointer shadow-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <motion.h3
                className="text-xl font-bold text-white mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                Generation #{generation.id.slice(-8)}
              </motion.h3>

              <motion.p
                className="text-purple-200 text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {formatDate(generation.created_at)}
              </motion.p>
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            >
              {getStatusIcon()}
            </motion.div>
          </div>

          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <span className={`text-sm font-medium ${getStatusColor(generation.status)}`}>
              {generation.status.charAt(0).toUpperCase() + generation.status.slice(1)}
            </span>

            {generation.quality_score && (
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400 text-sm font-medium">Quality:</span>
                <span className="text-white font-bold">{generation.quality_score}/10</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Images Section */}
        <div className="p-6">
          {/* Compare Slider Toggle */}
          {generation.status === 'completed' && isValidImageUrl(generation.generated_image_url) && (
            <motion.div
              className="mb-4 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <motion.button
                onClick={() => setShowCompareSlider(!showCompareSlider)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{showCompareSlider ? 'Hide' : 'Show'} Before/After Comparison</span>
              </motion.button>
            </motion.div>
          )}

          {/* Compare Slider or Regular Images */}
          <AnimatePresence mode="wait">
            {showCompareSlider && generation.status === 'completed' && isValidImageUrl(generation.generated_image_url) ? (
              <motion.div
                key="compare-slider"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="mb-6"
              >
                <CompareSlider
                  beforeImage={generation.original_image_url}
                  afterImage={generation.generated_image_url}
                  beforeLabel="Original"
                  afterLabel="Generated"
                />
              </motion.div>
            ) : (
              <motion.div
                key="regular-images"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 gap-4 mb-6"
              >
                {/* Original Image */}
                <motion.div
                  className="relative group/image"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div className="text-center mb-2">
                    <span className="text-purple-200 text-sm font-medium">Original</span>
                  </div>

                  {isValidImageUrl(generation.original_image_url) ? (
                    <motion.img
                      src={generation.original_image_url}
                      alt="Original image"
                      className="w-full h-32 object-cover rounded-xl border border-white/20 transition-all duration-300 group-hover/image:border-purple-400/50 group-hover/image:shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-image.png'
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border border-white/20 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Invalid URL</span>
                    </div>
                  )}
                </motion.div>

                {/* Generated Image */}
                <motion.div
                  className="relative group/image"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div className="text-center mb-2">
                    <span className="text-purple-200 text-sm font-medium">Generated</span>
                  </div>

                  {generation.status === 'processing' ? (
                    <div className="w-full h-32 bg-gradient-to-br from-purple-700 to-purple-800 rounded-xl border border-purple-400/30 flex items-center justify-center relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <div className="text-purple-200 text-sm font-medium z-10">Processing...</div>
                    </div>
                  ) : generation.status === 'failed' ? (
                    <div className="w-full h-32 bg-gradient-to-br from-red-700 to-red-800 rounded-xl border border-red-400/30 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-red-400 text-2xl mb-1">⚠️</div>
                        <span className="text-red-200 text-sm">Failed</span>
                      </div>
                    </div>
                  ) : isValidImageUrl(generation.generated_image_url) ? (
                    <motion.div
                      className="relative cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onImageClick(generation.generated_image_url, 'Generated image')}
                    >
                      <motion.img
                        src={generation.generated_image_url}
                        alt="Generated image"
                        className="w-full h-32 object-cover rounded-xl border border-white/20 transition-all duration-300 group-hover/image:border-purple-400/50 group-hover/image:shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-image.png'
                        }}
                      />

                      {/* View Fullscreen Overlay */}
                      <motion.div
                        className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <div className="text-white text-center">
                          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span className="text-sm font-medium">View Fullscreen</span>
                        </div>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border border-white/20 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Invalid URL</span>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prompt Text */}
          {generation.prompt_text && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <h4 className="text-white font-medium mb-2">Prompt:</h4>
              <p className="text-purple-200 text-sm bg-white/5 rounded-lg p-3 border border-white/10">
                {generation.prompt_text}
              </p>
            </motion.div>
          )}

          {/* Error Message */}
          {generation.status === 'failed' && generation.error_message && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <h4 className="text-red-400 font-medium mb-2">Error:</h4>
              <p className="text-red-200 text-sm bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                {generation.error_message}
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            className="flex space-x-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            {generation.status === 'completed' && isValidImageUrl(generation.generated_image_url) && (
              <>
                <motion.button
                  onClick={() => onImageClick(generation.generated_image_url, 'Generated image')}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View</span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = generation.generated_image_url
                    link.download = `generated-${generation.id}.png`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/25 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download</span>
                </motion.button>
              </>
            )}

            {generation.status === 'failed' && (
              <motion.button
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/25"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Retry Generation
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* 3D Depth Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-3xl pointer-events-none"
          style={{
            transform: "translateZ(-1px)",
            opacity: isHovered ? 0.3 : 0
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  )
}

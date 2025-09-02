'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import useSWR from 'swr'
import { ImageModal } from '@/components/ImageModal'
import { GenerationCard } from '@/components/GenerationCard'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { DeleteModeUI } from '@/components/DeleteModeUI'
import Link from 'next/link'

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

interface GenerationsResponse {
  generations: Generation[]
  total: number
}

export default function DashboardPage() {
  const { user, session, signOut } = useAuth()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImageAlt, setSelectedImageAlt] = useState('')
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [selectedGenerations, setSelectedGenerations] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.3])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8])

  // Fetch generations with SWR
  const { data, error, mutate } = useSWR<GenerationsResponse>(
    user ? '/api/generations' : null,
    async (url) => {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.json()
    },
    {
      refreshInterval: 5000,
      revalidateOnFocus: true
    }
  )

  const generations = data?.generations || []
  const totalGenerations = data?.total || 0

  // Handle image click for modal
  const handleImageClick = (url: string, alt: string) => {
    setSelectedImage(url)
    setSelectedImageAlt(alt)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
    setSelectedImageAlt('')
  }

  // Handle generation selection
  const handleGenerationSelect = (id: string) => {
    setSelectedGenerations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedGenerations.size === generations.length) {
      setSelectedGenerations(new Set())
    } else {
      setSelectedGenerations(new Set(generations.map(g => g.id)))
    }
  }

  // Handle delete selected
  const handleDeleteSelected = async () => {
    if (selectedGenerations.size === 0) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/generations/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          generationIds: Array.from(selectedGenerations)
        })
      })

      if (response.ok) {
        // Refresh data and reset selection
        await mutate()
        setSelectedGenerations(new Set())
        setIsDeleteMode(false)
      } else {
        console.error('Failed to delete generations')
      }
    } catch (error) {
      console.error('Error deleting generations:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Exit delete mode
  const exitDeleteMode = () => {
    setIsDeleteMode(false)
    setSelectedGenerations(new Set())
  }

  // Calculate statistics
  const stats = {
    total: totalGenerations,
    completed: generations.filter(g => g.status === 'completed').length,
    processing: generations.filter(g => g.status === 'processing').length,
    failed: generations.filter(g => g.status === 'failed').length
  }

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Please sign in to access the dashboard</div>
          <Link href="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* Animated Background Particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <motion.header
          className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10"
          style={{ opacity, scale }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <Link href="/" className="group">
                <motion.h1
                  className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  NS Normchikas Saagento
                </motion.h1>
              </Link>

              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Out
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top Panel - Cleaned Up */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <motion.div
                    className="text-2xl font-bold text-white mb-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    Success: {totalGenerations} generations loaded
                  </motion.div>
                  <motion.div
                    className="text-purple-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    Welcome back, {user.email}
                  </motion.div>
                </div>

                <motion.button
                  onClick={() => setIsDeleteMode(!isDeleteMode)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${isDeleteMode
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isDeleteMode ? 'Exit Delete Mode' : 'გასუფთავება'}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {[
              { label: 'Total', value: stats.total, color: 'from-blue-500 to-blue-600' },
              { label: 'Completed', value: stats.completed, color: 'from-green-500 to-green-600' },
              { label: 'Processing', value: stats.processing, color: 'from-yellow-500 to-yellow-600' },
              { label: 'Failed', value: stats.failed, color: 'from-red-500 to-red-600' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center"
                initial={{ opacity: 0, y: 20, rotateY: -15 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5, type: "spring" }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-purple-200 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Delete Mode UI */}
          <AnimatePresence>
            {isDeleteMode && (
              <DeleteModeUI
                selectedCount={selectedGenerations.size}
                totalCount={generations.length}
                isAllSelected={selectedGenerations.size === generations.length}
                onSelectAll={handleSelectAll}
                onDeleteSelected={handleDeleteSelected}
                onCancel={exitDeleteMode}
                isDeleting={isDeleting}
              />
            )}
          </AnimatePresence>

          {/* Generations Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.h2
              className="text-3xl font-bold text-white mb-6 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Your Generations
            </motion.h2>

            {/* Error Display */}
            {error && (
              <motion.div
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-red-400 font-medium mb-2">Error loading generations</div>
                <div className="text-red-300 text-sm">{(error as Error).message}</div>
              </motion.div>
            )}

            {/* Generations Grid */}
            {generations.length === 0 ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className="text-6xl mb-4">🎨</div>
                <div className="text-2xl font-bold text-white mb-2">No generations yet</div>
                <div className="text-purple-200 mb-6">Start creating amazing images!</div>
                <Link
                  href="/"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Create Your First Generation
                </Link>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
                ref={containerRef}
              >
                <AnimatePresence>
                  {generations.map((generation, index) => (
                    <motion.div
                      key={generation.id}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.8 }}
                      transition={{
                        delay: 0.8 + index * 0.1,
                        duration: 0.5,
                        type: "spring",
                        stiffness: 100,
                        damping: 20
                      }}
                      layout
                    >
                      <GenerationCard
                        generation={generation}
                        onImageClick={handleImageClick}
                        isDeleteMode={isDeleteMode}
                        isSelected={selectedGenerations.has(generation.id)}
                        onSelectGeneration={handleGenerationSelect}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Image Modal */}
        <AnimatePresence>
          {isModalOpen && selectedImage && (
            <ImageModal
              imageUrl={selectedImage}
              alt={selectedImageAlt}
              onClose={closeModal}
            />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  )
}

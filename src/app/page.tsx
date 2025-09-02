'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, CheckCircle, AlertCircle, Zap, Camera, Palette } from 'lucide-react'
import { validateImageFile, sanitizePrompt } from '@/lib/utils'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { HeroSection } from '@/components/HeroSection'
import { DragAndDropUploader } from '@/components/DragAndDropUploader'
import { PromptInput } from '@/components/PromptInput'
import { DynamicPreview } from '@/components/DynamicPreview'

export default function HomePage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const generatorSectionRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = (file: File) => {
    try {
      setError('')
      validateImageFile(file)
      setSelectedFile(file)
    } catch (err: any) {
      setError(err.message)
      setSelectedFile(null)
    }
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    setError('')
  }

  const handlePromptChange = (value: string) => {
    setPrompt(value)
    setError('')
  }

  const scrollToGenerator = () => {
    generatorSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  const handleGenerate = async () => {
    if (!user) {
      setError('Please sign in to generate advertisements')
      return
    }

    if (!selectedFile || !prompt.trim()) {
      setError('Please upload an image and enter a description')
      return
    }

    setIsGenerating(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('prompt', sanitizePrompt(prompt))

      console.log('Starting generation:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        prompt: prompt
      })

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Error during generation')
      }

      setSuccess('Advertisement generation started! Check your dashboard for results.')

      // Reset form
      setSelectedFile(null)
      setPrompt('')

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (err: any) {
      console.error('Generation error:', err)
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const isFormValid = selectedFile && prompt.trim().length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      {/* Hero Section */}
      <HeroSection onScrollToGenerator={scrollToGenerator} />

      {/* Generator Section */}
      <section
        id="generator-section"
        ref={generatorSectionRef}
        className="relative py-20 px-4"
      >
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent" />
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="text-5xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Create Your
              </span>
              <br />
              <span className="text-white">AI Advertisement</span>
            </motion.h2>

            <motion.p
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Upload your product image, describe your creative vision, and watch as our AI transforms
              it into a stunning, professional commercial advertisement in seconds.
            </motion.p>
          </motion.div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Form */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {/* File Upload */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Camera className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Product Image</h3>
                </div>

                <DragAndDropUploader
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  onFileRemove={handleFileRemove}
                />
              </div>

              {/* Prompt Input */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Palette className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Creative Vision</h3>
                </div>

                <PromptInput
                  value={prompt}
                  onChange={handlePromptChange}
                  placeholder="Describe how you want your advertisement to look..."
                />
              </div>

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Display */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-400">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate Button */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <motion.button
                  onClick={handleGenerate}
                  disabled={!isFormValid || isGenerating}
                  className={`group relative inline-flex items-center gap-4 px-12 py-6 rounded-2xl text-xl font-bold shadow-2xl transition-all duration-300 transform ${isFormValid && !isGenerating
                      ? "bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 text-white hover:scale-105 hover:shadow-purple-500/25"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                  whileHover={isFormValid && !isGenerating ? { scale: 1.05 } : {}}
                  whileTap={isFormValid && !isGenerating ? { scale: 0.95 } : {}}
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                      Generate Advertisement
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}

                  {/* Button Glow Effect */}
                  {isFormValid && !isGenerating && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                  )}
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Column - Dynamic Preview */}
            <motion.div
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full min-h-[600px]"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Live Preview</h3>
              </div>

              <DynamicPreview
                selectedFile={selectedFile}
                prompt={prompt}
                isGenerating={isGenerating}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose Our AI Generator?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of commercial photography with cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "Ultra-Realistic Results",
                description: "Generate images that look like they were shot by professional photographers with expensive equipment."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Lightning Fast",
                description: "Get your commercial advertisements in seconds, not hours or days of traditional photography."
              },
              {
                icon: <CheckCircle className="w-8 h-8" />,
                title: "Commercial Ready",
                description: "All generated images are optimized for commercial use with proper licensing and quality standards."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-purple-400/30 transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-purple-400">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

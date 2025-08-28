'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'
import { validateImageFile, sanitizePrompt } from '@/lib/utils'
import ImageUpload from '@/components/ImageUpload'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileSelect = (file: File) => {
    try {
      validateImageFile(file)
      setSelectedFile(file)
      setError('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleGenerate = async () => {
    if (!user) {
      setError('გთხოვთ შეხვიდეთ სისტემაში რეკლამის გენერირებისთვის')
      return
    }

    if (!selectedFile || !prompt.trim()) {
      setError('გთხოვთ ატვირთოთ სურათი და შეიყვანოთ აღწერა')
      return
    }

    setIsGenerating(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('prompt', sanitizePrompt(prompt))

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'შეცდომა გენერაციის დროს')
      }

      setSuccess('რეკლამის გენერაცია დაწყებულია! შედეგი ჩნდება დეშბორდში.')

      // Reset form
      setSelectedFile(null)
      setPrompt('')

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const isFormValid = selectedFile && prompt.trim().length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            Normchikas Saagento
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            გარდაქმენით თქვენი სურათები შთამბეჭდავ რეკლამებად AI-ის დახმარებით
          </p>
          {!user && (
            <p className="text-sm text-yellow-400 mt-4">
              🔐 გთხოვთ შეხვიდეთ სისტემაში რეკლამის გენერირებისთვის
            </p>
          )}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass rounded-2xl p-8 backdrop-blur-xl">
            {/* Upload Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Upload className="w-6 h-6" />
                ატვირთეთ თქვენი სურათი
              </h2>
              <ImageUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} />
            </div>

            {/* Prompt Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                აღწერეთ თქვენი ხედვა
              </h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="მაგ: 'გახადეთ ეს პროდუქტი ფუტურისტული ნეონის განათებით და კიბერპანკის ესთეტიკით'"
                className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300"
              >
                {error}
              </motion.div>
            )}

            {/* Success Display */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300"
              >
                {success}
              </motion.div>
            )}

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: isFormValid && user ? 1.02 : 1 }}
              whileTap={{ scale: isFormValid && user ? 0.98 : 1 }}
              onClick={handleGenerate}
              disabled={!isFormValid || isGenerating || !user}
              className={`w-full py-4 px-8 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${isFormValid && !isGenerating && user
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  მუშავდება...
                </>
              ) : !user ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  შეხვიდეთ სისტემაში
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  შექმენით რეკლამა
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center p-6 glass rounded-lg"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">ატვირთეთ და აღწერეთ</h3>
                <p className="text-gray-300 text-sm">
                  ატვირთეთ თქვენი სურათი და აღწერეთ რეკლამის სტილი
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center p-6 glass rounded-lg"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI-ის დამუშავება</h3>
                <p className="text-gray-300 text-sm">
                  ჩვენი მოწინავე AI გარდაქმნის თქვენს სურათს პროფესიონალურ რეკლამად
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center p-6 glass rounded-lg"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">მიიღეთ შედეგი</h3>
                <p className="text-gray-300 text-sm">
                  ჩამოტვირთეთ თქვენი პროფესიონალურად შექმნილი რეკლამა წუთებში
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

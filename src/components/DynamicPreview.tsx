'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Image, Sparkles, Camera, Palette, Zap, CheckCircle } from 'lucide-react'

interface DynamicPreviewProps {
    selectedFile: File | null
    prompt: string
    isGenerating: boolean
}

export function DynamicPreview({ selectedFile, prompt, isGenerating }: DynamicPreviewProps) {
    const getPreviewContent = () => {
        if (isGenerating) {
            return {
                type: 'generating',
                icon: <Sparkles className="w-16 h-16 text-purple-400" />,
                title: 'AI is Creating Magic...',
                subtitle: 'Your image is being generated with advanced AI technology',
                description: 'This usually takes 15-30 seconds. We\'re processing your vision into a stunning commercial advertisement.'
            }
        }

        if (selectedFile && prompt) {
            return {
                type: 'ready',
                icon: <CheckCircle className="w-16 h-16 text-green-400" />,
                title: 'Ready to Generate!',
                subtitle: 'Your image and prompt are ready',
                description: 'Click the Generate button to start creating your commercial advertisement with AI.'
            }
        }

        if (selectedFile) {
            return {
                type: 'image-only',
                icon: <Camera className="w-16 h-16 text-blue-400" />,
                title: 'Great Image!',
                subtitle: 'Now add your creative vision',
                description: 'Describe how you want your image to look. Use our style presets or write your own creative prompt.'
            }
        }

        if (prompt) {
            return {
                type: 'prompt-only',
                icon: <Palette className="w-16 h-16 text-purple-400" />,
                title: 'Creative Vision Set!',
                subtitle: 'Now upload your product image',
                description: 'Your prompt is ready. Upload a product photo to see your vision come to life with AI generation.'
            }
        }

        return {
            type: 'default',
            icon: <Zap className="w-16 h-16 text-purple-400" />,
            title: 'Welcome to AI Image Generation',
            subtitle: 'Transform your ideas into reality',
            description: 'Upload a product image and describe your vision. Our AI will create stunning, photorealistic commercial advertisements in seconds.'
        }
    }

    const content = getPreviewContent()

    return (
        <div className="w-full h-full min-h-[600px] flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={content.type}
                    className="text-center max-w-md mx-auto"
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {/* Icon */}
                    <motion.div
                        className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center"
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: content.type === 'generating' ? [0, 5, -5, 0] : 0,
                        }}
                        transition={{
                            duration: content.type === 'generating' ? 2 : 3,
                            repeat: content.type === 'generating' ? Infinity : 0,
                            ease: "easeInOut"
                        }}
                    >
                        {content.icon}
                    </motion.div>

                    {/* Title */}
                    <motion.h3
                        className="text-2xl font-bold text-white mb-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {content.title}
                    </motion.h3>

                    {/* Subtitle */}
                    <motion.p
                        className="text-lg text-purple-300 mb-4 font-medium"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {content.subtitle}
                    </motion.p>

                    {/* Description */}
                    <motion.p
                        className="text-gray-400 leading-relaxed mb-8"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        {content.description}
                    </motion.p>

                    {/* Image Preview (if file is selected) */}
                    {selectedFile && (
                        <motion.div
                            className="w-full max-w-sm mx-auto mb-6"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <div className="relative rounded-2xl overflow-hidden bg-gray-800 border border-white/10">
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-3 left-3 text-white text-sm font-medium">
                                    Your Product Image
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Prompt Preview (if prompt exists) */}
                    {prompt && (
                        <motion.div
                            className="w-full max-w-sm mx-auto mb-6"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                <div className="text-purple-300 text-sm font-medium mb-2">Your Creative Vision:</div>
                                <div className="text-white text-sm leading-relaxed">
                                    {prompt.length > 100 ? `${prompt.substring(0, 100)}...` : prompt}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Progress Bar for Generating State */}
                    {isGenerating && (
                        <motion.div
                            className="w-full max-w-sm mx-auto"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                                <motion.div
                                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 30, ease: "linear" }}
                                />
                            </div>
                            <div className="text-gray-400 text-sm">
                                Processing your image with AI...
                            </div>
                        </motion.div>
                    )}

                    {/* Feature Highlights */}
                    {content.type === 'default' && (
                        <motion.div
                            className="grid grid-cols-1 gap-3 mt-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                        >
                            {[
                                { icon: <Sparkles className="w-5 h-5" />, text: "Ultra-realistic AI generation" },
                                { icon: <Camera className="w-5 h-5" />, text: "Professional commercial quality" },
                                { icon: <Zap className="w-5 h-5" />, text: "Lightning-fast processing" }
                            ].map((feature, index) => (
                                <motion.div
                                    key={feature.text}
                                    className="flex items-center gap-3 text-gray-400"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                                >
                                    <div className="text-purple-400">{feature.icon}</div>
                                    <span className="text-sm">{feature.text}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MessageSquare, Lightbulb, Palette } from 'lucide-react'

interface PromptInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

const stylePresets = [
    {
        name: "Cinematic Look",
        description: "Movie-style dramatic lighting",
        prompt: "cinematic lighting, dramatic shadows, film noir aesthetic, professional cinematography"
    },
    {
        name: "Studio Photography",
        description: "Clean, professional studio setup",
        prompt: "studio lighting, clean background, professional product photography, high-end commercial look"
    },
    {
        name: "Vintage Style",
        description: "Retro, nostalgic atmosphere",
        prompt: "vintage aesthetic, retro styling, nostalgic atmosphere, classic commercial look"
    },
    {
        name: "Outdoor Setting",
        description: "Natural, outdoor environment",
        prompt: "outdoor setting, natural lighting, environmental context, lifestyle photography"
    },
    {
        name: "Luxury Brand",
        description: "Premium, high-end feel",
        prompt: "luxury aesthetic, premium quality, sophisticated styling, high-end commercial photography"
    },
    {
        name: "Modern Minimalist",
        description: "Clean, contemporary design",
        prompt: "minimalist design, clean lines, modern aesthetic, contemporary commercial style"
    }
]

export function PromptInput({ value, onChange, placeholder = "Describe your vision..." }: PromptInputProps) {
    const [isFocused, setIsFocused] = useState(false)
    const [showPresets, setShowPresets] = useState(false)
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const maxLength = 500
    const remainingChars = maxLength - value.length
    const isNearLimit = remainingChars <= 50

    const handlePresetClick = (preset: typeof stylePresets[0]) => {
        const newPrompt = value.trim() ? `${value.trim()}, ${preset.prompt}` : preset.prompt
        onChange(newPrompt)
        setSelectedPreset(preset.name)

        // Auto-hide presets after selection
        setTimeout(() => setShowPresets(false), 1000)

        // Focus textarea
        textareaRef.current?.focus()
    }

    const addPresetToPrompt = (preset: typeof stylePresets[0]) => {
        handlePresetClick(preset)
    }

    useEffect(() => {
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [value])

    return (
        <div className="w-full">
            {/* Label */}
            <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <label className="text-white font-medium text-lg">
                    How do you want your image to look?
                </label>
            </div>

            {/* Textarea Container */}
            <div className="relative">
                <motion.textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`w-full min-h-[120px] px-4 py-4 bg-white/10 border rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none transition-all duration-300 ${isFocused
                            ? 'border-purple-400/50 bg-white/15 shadow-lg shadow-purple-500/25'
                            : 'border-white/20 hover:border-white/30'
                        }`}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{
                        minHeight: '120px',
                        maxHeight: '300px'
                    }}
                />

                {/* Character Counter */}
                <motion.div
                    className={`absolute bottom-3 right-3 text-xs font-medium transition-colors duration-300 ${isNearLimit ? 'text-red-400' : 'text-gray-400'
                        }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    {remainingChars}/{maxLength}
                </motion.div>

                {/* Focus Indicator */}
                {isFocused && (
                    <motion.div
                        className="absolute inset-0 border-2 border-purple-400/30 rounded-xl pointer-events-none"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </div>

            {/* Style Presets */}
            <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-medium">Style Presets</h3>
                    <motion.button
                        onClick={() => setShowPresets(!showPresets)}
                        className="ml-auto text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {showPresets ? 'Hide' : 'Show'} Presets
                    </motion.button>
                </div>

                <AnimatePresence>
                    {showPresets && (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 gap-3"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {stylePresets.map((preset, index) => (
                                <motion.button
                                    key={preset.name}
                                    onClick={() => addPresetToPrompt(preset)}
                                    className={`p-4 rounded-xl border transition-all duration-300 text-left group ${selectedPreset === preset.name
                                            ? 'border-purple-400 bg-purple-500/20'
                                            : 'border-white/10 bg-white/5 hover:border-purple-400/50 hover:bg-purple-500/10'
                                        }`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${selectedPreset === preset.name
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-white/10 text-gray-400 group-hover:bg-purple-500/20 group-hover:text-purple-400'
                                            }`}>
                                            <Lightbulb className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-semibold mb-1 transition-colors duration-300 ${selectedPreset === preset.name ? 'text-purple-400' : 'text-white'
                                                }`}>
                                                {preset.name}
                                            </h4>
                                            <p className="text-gray-400 text-sm">{preset.description}</p>
                                        </div>
                                        <Sparkles className={`w-4 h-4 transition-all duration-300 ${selectedPreset === preset.name
                                                ? 'text-purple-400 scale-110'
                                                : 'text-gray-500 group-hover:text-purple-400 group-hover:scale-110'
                                            }`} />
                                    </div>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Quick Add Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
                {[
                    "professional lighting",
                    "commercial quality",
                    "high resolution",
                    "studio background"
                ].map((quickPrompt) => (
                    <motion.button
                        key={quickPrompt}
                        onClick={() => {
                            const newPrompt = value.trim() ? `${value.trim()}, ${quickPrompt}` : quickPrompt
                            onChange(newPrompt)
                        }}
                        className="px-3 py-2 bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/30 rounded-lg text-sm text-gray-300 hover:text-purple-300 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        + {quickPrompt}
                    </motion.button>
                ))}
            </div>
        </div>
    )
}

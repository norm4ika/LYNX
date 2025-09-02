'use client'

import { motion } from 'framer-motion'
import { Sparkles, ArrowDown, Play } from 'lucide-react'

interface HeroSectionProps {
    onScrollToGenerator: () => void
}

export function HeroSection({ onScrollToGenerator }: HeroSectionProps) {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900" />

                {/* Animated Particles */}
                <div className="absolute inset-0">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
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
                                duration: Math.random() * 4 + 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>

                {/* Floating Geometric Shapes */}
                <motion.div
                    className="absolute top-20 left-20 w-32 h-32 border border-purple-500/20 rounded-full"
                    animate={{
                        rotate: 360,
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
                <motion.div
                    className="absolute top-40 right-32 w-24 h-24 border border-blue-500/20 rounded-lg"
                    animate={{
                        rotate: -360,
                        scale: [1, 0.9, 1],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
                <motion.div
                    className="absolute bottom-32 left-32 w-20 h-20 border border-purple-400/20 transform rotate-45"
                    animate={{
                        rotate: 180,
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
                {/* Main Headline */}
                <motion.h1
                    className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 leading-tight"
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent">
                        Create
                    </span>
                    <br />
                    <span className="text-white">Photorealistic</span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
                        Commercial Ads
                    </span>
                    <br />
                    <span className="text-white text-6xl md:text-7xl lg:text-8xl">in Seconds</span>
                </motion.h1>

                {/* Sub-headline */}
                <motion.p
                    className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                >
                    Upload your product photo, describe your vision, and let our AI generate stunning,
                    ultra-realistic advertisements that look like they were shot by professional photographers.
                </motion.p>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                >
                    <motion.button
                        onClick={onScrollToGenerator}
                        className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 text-white px-12 py-6 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                        Start Generating Now
                        <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />

                        {/* Button Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                    </motion.button>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1, ease: "easeOut" }}
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="text-purple-400 cursor-pointer"
                        onClick={onScrollToGenerator}
                    >
                        <ArrowDown className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-sm font-medium">Scroll to Generator</span>
                    </motion.div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
                >
                    {[
                        { number: "10M+", label: "Images Generated" },
                        { number: "99.9%", label: "Uptime" },
                        { number: "<30s", label: "Generation Time" }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            className="text-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                        >
                            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                                {stat.number}
                            </div>
                            <div className="text-gray-400 font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

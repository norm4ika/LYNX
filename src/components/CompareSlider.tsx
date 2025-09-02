'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CompareSliderProps {
    beforeImage: string
    afterImage: string
    beforeLabel: string
    afterLabel: string
    className?: string
}

export function CompareSlider({ beforeImage, afterImage, beforeLabel, afterLabel, className = '' }: CompareSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const [imagesLoaded, setImagesLoaded] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMouseDown = () => {
        setIsDragging(true)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            updateSliderPosition(e)
        }
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const updateSliderPosition = (e: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        let clientX: number

        if ('touches' in e) {
            clientX = e.touches[0].clientX
        } else {
            clientX = e.clientX
        }

        const position = ((clientX - rect.left) / rect.width) * 100
        setSliderPosition(Math.max(0, Math.min(100, position)))
    }

    // Handle image loading
    const handleImageLoad = () => {
        setImagesLoaded(prev => prev + 1)
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                setSliderPosition(prev => Math.max(0, prev - 5))
            } else if (e.key === 'ArrowRight') {
                setSliderPosition(prev => Math.min(100, prev + 5))
            } else if (e.key === 'Home') {
                setSliderPosition(0)
            } else if (e.key === 'End') {
                setSliderPosition(100)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Touch events for mobile
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleTouchStart = (e: TouchEvent) => {
            setIsDragging(true)
            updateSliderPosition(e as any)
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (isDragging) {
                updateSliderPosition(e as any)
            }
        }

        const handleTouchEnd = () => {
            setIsDragging(false)
        }

        container.addEventListener('touchstart', handleTouchStart, { passive: false })
        container.addEventListener('touchmove', handleTouchMove, { passive: false })
        container.addEventListener('touchend', handleTouchEnd)

        return () => {
            container.removeEventListener('touchstart', handleTouchStart)
            container.removeEventListener('touchmove', handleTouchMove)
            container.removeEventListener('touchend', handleTouchEnd)
        }
    }, [isDragging])

    const allImagesLoaded = imagesLoaded >= 2

    return (
        <motion.div
            ref={containerRef}
            className={`relative w-full h-64 rounded-2xl overflow-hidden bg-gray-900 ${className}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: allImagesLoaded ? 1 : 0.7, scale: allImagesLoaded ? 1 : 0.95 }}
            transition={{ duration: 0.5 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            {/* Before Image (Full) */}
            <motion.img
                src={beforeImage}
                alt={beforeLabel}
                className="absolute inset-0 w-full h-full object-cover"
                onLoad={handleImageLoad}
                onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-image.png'
                }}
            />

            {/* After Image (Clipped) */}
            <motion.div
                className="absolute inset-0 overflow-hidden"
                style={{
                    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
                }}
            >
                <motion.img
                    src={afterImage}
                    alt={afterLabel}
                    className="w-full h-full object-cover"
                    onLoad={handleImageLoad}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-image.png'
                    }}
                />
            </motion.div>

            {/* Slider Handle */}
            <motion.div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                style={{ left: `${sliderPosition}%` }}
                animate={{
                    scaleX: isDragging ? 1.5 : 1,
                    boxShadow: isDragging ? '0 0 20px rgba(255, 255, 255, 0.8)' : '0 0 10px rgba(255, 255, 255, 0.5)'
                }}
                transition={{ duration: 0.2 }}
            >
                {/* Handle Knob */}
                <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-800 rounded-full" />
                </div>
            </motion.div>

            {/* Labels */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm font-medium">
                {beforeLabel}
            </div>
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm font-medium">
                {afterLabel}
            </div>

            {/* Position Indicator */}
            <motion.div
                className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-lg text-sm font-medium"
                animate={{ opacity: isDragging ? 1 : 0.7 }}
                transition={{ duration: 0.2 }}
            >
                {Math.round(sliderPosition)}%
            </motion.div>

            {/* Loading Overlay */}
            <AnimatePresence>
                {!allImagesLoaded && (
                    <motion.div
                        className="absolute inset-0 bg-black/50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="text-white text-center">
                            <motion.div
                                className="w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="text-sm">Loading images...</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instructions */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-xs opacity-70">
                Drag to compare • Use arrow keys • Home/End to reset
            </div>
        </motion.div>
    )
}

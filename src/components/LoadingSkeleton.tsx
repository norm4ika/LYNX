'use client'

import { motion } from 'framer-motion'

export function LoadingSkeleton() {
  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-xl"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 300 }}
    >
      {/* Header Skeleton */}
      <div className="p-6 border-b border-white/10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <motion.div 
              className="h-6 bg-gradient-to-r from-white/20 to-white/10 rounded-lg mb-2"
              animate={{ 
                background: [
                  "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                  "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)",
                  "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="h-4 bg-gradient-to-r from-purple-400/20 to-purple-400/10 rounded-lg w-3/4"
              animate={{ 
                background: [
                  "linear-gradient(90deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.2) 50%, rgba(168,85,247,0.1) 100%)",
                  "linear-gradient(90deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.3) 50%, rgba(168,85,247,0.1) 100%)",
                  "linear-gradient(90deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.2) 50%, rgba(168,85,247,0.1) 100%)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
          </div>
          
          <motion.div
            className="w-6 h-6 bg-gradient-to-r from-green-500/20 to-green-500/10 rounded-full"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <motion.div 
            className="h-4 bg-gradient-to-r from-blue-400/20 to-blue-400/10 rounded-lg w-20"
            animate={{ 
              background: [
                "linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.2) 50%, rgba(59,130,246,0.1) 100%)",
                "linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.3) 50%, rgba(59,130,246,0.1) 100%)",
                "linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.2) 50%, rgba(59,130,246,0.1) 100%)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />
          
          <motion.div 
            className="h-4 bg-gradient-to-r from-yellow-400/20 to-yellow-400/10 rounded-lg w-24"
            animate={{ 
              background: [
                "linear-gradient(90deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.2) 50%, rgba(251,191,36,0.1) 100%)",
                "linear-gradient(90deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.3) 50%, rgba(251,191,36,0.1) 100%)",
                "linear-gradient(90deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.2) 50%, rgba(251,191,36,0.1) 100%)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
          />
        </div>
      </div>

      {/* Images Grid Skeleton */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Original Image Skeleton */}
          <div className="group/image">
            <div className="text-center mb-2">
              <motion.span 
                className="inline-block h-4 bg-gradient-to-r from-purple-400/20 to-purple-400/10 rounded-lg w-16"
                animate={{ 
                  background: [
                    "linear-gradient(90deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.2) 50%, rgba(168,85,247,0.1) 100%)",
                    "linear-gradient(90deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.3) 50%, rgba(168,85,247,0.1) 100%)",
                    "linear-gradient(90deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.2) 50%, rgba(168,85,247,0.1) 100%)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              />
            </div>
            
            <motion.div 
              className="w-full h-32 bg-gradient-to-br from-white/10 to-purple-500/20 rounded-xl border border-white/20 relative overflow-hidden"
              animate={{ 
                background: [
                  "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(168,85,247,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                  "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(168,85,247,0.3) 50%, rgba(255,255,255,0.1) 100%)",
                  "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(168,85,247,0.2) 50%, rgba(255,255,255,0.1) 100%)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Animated Particles */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-purple-400/30 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + i * 10}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
              
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>

          {/* Generated Image Skeleton */}
          <div className="group/image">
            <div className="text-center mb-2">
              <motion.span 
                className="inline-block h-4 bg-gradient-to-r from-blue-400/20 to-blue-400/10 rounded-lg w-20"
                animate={{ 
                  background: [
                    "linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.2) 50%, rgba(59,130,246,0.1) 100%)",
                    "linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.3) 50%, rgba(59,130,246,0.1) 100%)",
                    "linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.2) 50%, rgba(59,130,246,0.1) 100%)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              />
            </div>
            
            <motion.div 
              className="w-full h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-white/20 relative overflow-hidden"
              animate={{ 
                background: [
                  "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(168,85,247,0.2) 50%, rgba(59,130,246,0.2) 100%)",
                  "linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(168,85,247,0.3) 50%, rgba(59,130,246,0.3) 100%)",
                  "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(168,85,247,0.2) 50%, rgba(59,130,246,0.2) 100%)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              {/* Animated Particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
                  style={{
                    left: `${15 + i * 12}%`,
                    top: `${25 + i * 8}%`,
                  }}
                  animate={{
                    y: [0, -25, 0],
                    opacity: [0.3, 0.9, 0.3],
                    scale: [1, 1.8, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 5 + i * 0.4,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
              
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            </motion.div>
          </div>
        </div>

        {/* Prompt Text Skeleton */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          <motion.div 
            className="h-4 bg-gradient-to-r from-white/20 to-white/10 rounded-lg w-20 mb-2"
            animate={{ 
              background: [
                "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)",
                "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 2.1 }}
          />
          
          <motion.div 
            className="h-16 bg-gradient-to-r from-white/5 to-purple-500/10 rounded-lg border border-white/10 p-3"
            animate={{ 
              background: [
                "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(168,85,247,0.1) 50%, rgba(255,255,255,0.05) 100%)",
                "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(168,85,247,0.15) 50%, rgba(255,255,255,0.05) 100%)",
                "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(168,85,247,0.1) 50%, rgba(255,255,255,0.05) 100%)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 2.4 }}
          >
            {/* Text Lines */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={`h-3 bg-gradient-to-r from-purple-400/20 to-purple-400/10 rounded-lg mb-2 ${
                  i === 2 ? 'w-2/3' : 'w-full'
                }`}
                animate={{ 
                  background: [
                    "linear-gradient(90deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.2) 50%, rgba(168,85,247,0.1) 100%)",
                    "linear-gradient(90deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.3) 50%, rgba(168,85,247,0.1) 100%)",
                    "linear-gradient(90deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.2) 50%, rgba(168,85,247,0.1) 100%)"
                  ]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut", 
                  delay: 2.7 + i * 0.2 
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Action Buttons Skeleton */}
        <motion.div 
          className="flex space-x-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.0, duration: 0.5 }}
        >
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 h-12 bg-gradient-to-r from-purple-600/20 to-purple-700/20 rounded-xl border border-purple-500/30"
              animate={{ 
                background: [
                  "linear-gradient(90deg, rgba(147,51,234,0.2) 0%, rgba(126,34,206,0.2) 50%, rgba(147,51,234,0.2) 100%)",
                  "linear-gradient(90deg, rgba(147,51,234,0.2) 0%, rgba(126,34,206,0.3) 50%, rgba(147,51,234,0.2) 100%)",
                  "linear-gradient(90deg, rgba(147,51,234,0.2) 0%, rgba(126,34,206,0.2) 50%, rgba(147,51,234,0.2) 100%)"
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut", 
                delay: 3.3 + i * 0.2 
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Floating Animation Overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ 
          background: [
            "radial-gradient(circle at 20% 20%, rgba(168,85,247,0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, rgba(59,130,246,0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 20%, rgba(168,85,247,0.05) 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  )
}

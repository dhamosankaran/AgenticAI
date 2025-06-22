'use client'

import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Sparkles, Zap } from 'lucide-react'

export function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <div className="relative flex min-h-screen flex-col">
        {/* Enhanced Fixed Header */}
        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90 backdrop-blur-md border-b border-border/40" />
          <div className="container relative mx-auto px-4 h-20 flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <Sparkles className="w-7 h-7 text-primary" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 text-primary/30 blur-sm"
                  animate={{
                    scale: [1.2, 1.5, 1.2],
                    rotate: [180, 360, 180],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <Sparkles className="w-7 h-7" />
                </motion.div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 text-transparent bg-clip-text bg-300% animate-gradient">
                  AI-Powered Market Research
                </h1>
                <p className="text-xs text-muted-foreground">Powered by Advanced AI Analysis</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Zap className="w-4 h-4" />
                <span>Real-time Analysis</span>
              </div>
            </motion.div>
          </div>
        </header>
        
        {/* Main Content with Adjusted Top Padding */}
        <div className="flex-1 pt-24">
          {children}
        </div>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  )
} 
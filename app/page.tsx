"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-100 to-yellow-200">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center max-w-4xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-block"
          >
            <div className="h-32 w-32 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-orange-300">
              <span className="text-6xl font-bold text-orange-600">ह</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-orange-800 mb-4"
          >
            Hindi Learning System
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-orange-600 mb-8"
          >
            हिंदी शिक्षण प्रणाली
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl text-amber-900 mb-12 max-w-2xl mx-auto"
          >
            Learn to write Hindi letters through interactive practice. Master the Devanagari script with our intuitive
            tracing and freehand drawing tools.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-white/80 p-6 rounded-2xl shadow-md border-2 border-amber-200 hover:border-amber-400 transition-colors">
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl text-amber-600">✏️</span>
              </div>
              <h3 className="text-xl font-bold text-amber-700 mb-2">Interactive Practice</h3>
              <p className="text-amber-800">Trace and draw Hindi letters with immediate feedback</p>
            </div>
            <div className="bg-white/80 p-6 rounded-2xl shadow-md border-2 border-amber-200 hover:border-amber-400 transition-colors">
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl text-amber-600">🏆</span>
              </div>
              <h3 className="text-xl font-bold text-amber-700 mb-2">Track Progress</h3>
              <p className="text-amber-800">Earn badges and monitor your learning journey</p>
            </div>
            <div className="bg-white/80 p-6 rounded-2xl shadow-md border-2 border-amber-200 hover:border-amber-400 transition-colors">
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl text-amber-600">🔊</span>
              </div>
              <h3 className="text-xl font-bold text-amber-700 mb-2">Audio Pronunciation</h3>
              <p className="text-amber-800">Listen to the correct pronunciation of each letter</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="animate-bounce"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xl px-10 py-8 rounded-2xl shadow-lg border-2 border-amber-300">
                Start Learning
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="absolute top-20 left-20 opacity-20 hidden lg:block">
          <div className="text-9xl text-amber-600 font-bold">अ</div>
        </div>
        <div className="absolute bottom-20 right-20 opacity-20 hidden lg:block">
          <div className="text-9xl text-amber-600 font-bold">क</div>
        </div>

        <motion.div
          className="absolute top-1/4 right-1/3 opacity-10 hidden lg:block"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <div className="text-7xl text-amber-700 font-bold">ज</div>
        </motion.div>

        <motion.div
          className="absolute bottom-1/3 left-1/4 opacity-10 hidden lg:block"
          animate={{
            y: [0, 15, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <div className="text-7xl text-amber-700 font-bold">म</div>
        </motion.div>
      </div>
    </div>
  )
}



"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUserStore } from "@/lib/store";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Pencil, GamepadIcon, LogOut, Umbrella } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ChooseActivityPage() {
  const [mounted, setMounted] = useState(false)
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-100 via-cyan-100 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-teal-700"
          >
            Choose Your Activity
          </motion.h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-14 w-14 rounded-full">
                <Avatar className="h-14 w-14 border-2 border-teal-300">
                  <AvatarImage
                    src="https://plus.unsplash.com/premium_vector-1728553013068-ae053473049d?q=80&w=2360&auto=format&fit=crop"
                    alt="Profile"
                  />
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.user_email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/badges" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile & Badges</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/" className="flex items-center w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-teal-800 mb-4">What would you like to do today?</h2>
            <p className="text-lg text-teal-700 max-w-2xl mx-auto">
              Choose between practicing your Hindi writing skills or playing fun letter recognition games.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-teal-200"
            >
              <div className="h-48 bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center">
                <Pencil className="h-24 w-24 text-white" />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-teal-700 mb-3">Letter Tracing</h3>
                <p className="text-teal-600 mb-6">
                  Practice writing Hindi letters with our interactive tracing tool. Perfect your Devanagari script with
                  real-time feedback.
                </p>
                <Link href="/learn">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 rounded-xl text-lg">
                    Start Tracing
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-blue-200"
            >
              <div className="h-48 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                <GamepadIcon className="h-24 w-24 text-white" />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-blue-700 mb-3">Find the Letter</h3>
                <p className="text-blue-600 mb-6">
                  Play a fun game to improve your Hindi letter recognition skills. Find and match letters in exciting
                  challenges.
                </p>
                <Link href="/games">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl text-lg">
                    Play Game
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-green-200"
            >
              <div className="h-48 bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center">
                <Umbrella className="h-24 w-24 text-white" />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-green-700 mb-3">Catch the Letters</h3>
                <p className="text-green-600 mb-6">
                  Move your basket to catch falling Hindi letters. Earn cute animal rewards as you improve your letter
                  recognition.
                </p>
                <Link href="/falling-letters">
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-xl text-lg">
                    Catch Letters
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="absolute top-1/4 right-10 opacity-5 hidden lg:block"
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
            <div className="text-9xl text-teal-700 font-bold">अ</div>
          </motion.div>

          <motion.div
            className="absolute bottom-1/4 left-10 opacity-5 hidden lg:block"
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
            <div className="text-9xl text-blue-700 font-bold">क</div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function User(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}


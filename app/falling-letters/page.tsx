"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Volume2, Medal, User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const hindiLetters = [
  "अ",
  "आ",
  "इ",
  "ई",
  "उ",
  "ऊ",
  "ए",
  "ऐ",
  "ओ",
  "औ",
  "अं",
  "अः",
  "क",
  "ख",
  "ग",
  "घ",
  "च",
  "छ",
  "ज",
  "झ",
  "ट",
  "ठ",
  "ड",
  "ढ",
  "ण",
  "त",
  "थ",
  "द",
  "ध",
  "न",
  "प",
  "फ",
  "ब",
  "भ",
  "म",
  "य",
  "र",
  "ल",
  "व",
  "श",
  "ष",
  "स",
  "ह",
  "क्ष",
  "त्र",
  "ज्ञ",
]

const animalRewards = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵"]

const gameLevels = [
  { speed: 4000, lettersPerWave: 2, targetCount: 5 },
  { speed: 3500, lettersPerWave: 3, targetCount: 7 }, 
  { speed: 3000, lettersPerWave: 3, targetCount: 10 },
  { speed: 2500, lettersPerWave: 4, targetCount: 12 }, 
  { speed: 2000, lettersPerWave: 4, targetCount: 15 }, 
]

export default function FallingLettersGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [score, setScore] = useState(0)
  const [targetLetter, setTargetLetter] = useState("")
  const [fallingLetters, setFallingLetters] = useState<Array<{ id: string; letter: string; x: number }>>([])
  const [basketPosition, setBasketPosition] = useState(50)
  const [caughtCount, setCaughtCount] = useState(0)
  const [showReward, setShowReward] = useState(false)
  const [currentReward, setCurrentReward] = useState("")
  const [progress, setProgress] = useState(0)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const basketRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [debugMessage, setDebugMessage] = useState("")
  const user = useUserStore((state) => state.user);

  const startGame = () => {
    setGameStarted(true)
    setGameCompleted(false)
    setCurrentLevel(0)
    setScore(0)
    setCaughtCount(0)
    setFallingLetters([])
    selectNewTargetLetter()

    setIsMobile(window.innerWidth < 768)
  }

  const selectNewTargetLetter = () => {
    const randomIndex = Math.floor(Math.random() * hindiLetters.length)
    setTargetLetter(hindiLetters[randomIndex])
    playLetterSound(hindiLetters[randomIndex])
  }

  const generateFallingLetters = () => {
    if (!gameAreaRef.current) return

    const gameWidth = gameAreaRef.current.offsetWidth
    const level = gameLevels[currentLevel]
    const newLetters = []

    const targetX = Math.floor(Math.random() * (gameWidth - 50)) + 25 // Keep away from edges
    newLetters.push({
      id: `letter-${Date.now()}-target`,
      letter: targetLetter,
      x: targetX,
    })

    for (let i = 1; i < level.lettersPerWave; i++) {
      let randomLetter
      do {
        const randomIndex = Math.floor(Math.random() * hindiLetters.length)
        randomLetter = hindiLetters[randomIndex]
      } while (randomLetter === targetLetter)

      const x = Math.floor(Math.random() * (gameWidth - 50)) + 25 // Keep away from edges
      newLetters.push({
        id: `letter-${Date.now()}-${i}`,
        letter: randomLetter,
        x,
      })
    }

    setFallingLetters((prev) => [...prev, ...newLetters])
  }

  const playLetterSound = (letter: string) => {
    const utterance = new SpeechSynthesisUtterance(letter)
    utterance.lang = "hi-IN"
    speechSynthesis.speak(utterance)
  }

  const playSound = (type: "correct" | "wrong" | "reward") => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    if (type === "correct") {
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.3)
    } else if (type === "wrong") {
      oscillator.type = "square"
      oscillator.frequency.setValueAtTime(196.0, audioContext.currentTime) // G3
      oscillator.frequency.setValueAtTime(185.0, audioContext.currentTime + 0.1) // F#3
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.3)
    } else if (type === "reward") {
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2) // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.4) // G5
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.6)
    }
  }

  const showAnimalReward = () => {
    const randomIndex = Math.floor(Math.random() * animalRewards.length)
    setCurrentReward(animalRewards[randomIndex])
    setShowReward(true)
    playSound("reward")

    setTimeout(() => {
      setShowReward(false)
    }, 3000)
  }

  const handleLetterReachBottom = (letterId: string) => {
    setFallingLetters((prev) => prev.filter((l) => l.id !== letterId))
  }

  const checkLetterCaught = (letterId: string, letterElement: HTMLElement, letter: string) => {
    if (!basketRef.current || !gameAreaRef.current) return false

    const basketRect = basketRef.current.getBoundingClientRect()
    const letterRect = letterElement.getBoundingClientRect()
    const gameRect = gameAreaRef.current.getBoundingClientRect()

    if (letterRect.bottom >= gameRect.bottom - 60 && letterRect.bottom <= gameRect.bottom - 20) {
      if (
        letterRect.left + letterRect.width / 2 >= basketRect.left &&
        letterRect.left + letterRect.width / 2 <= basketRect.right
      ) {
        if (letter === targetLetter) {
          playSound("correct")
          setScore((prev) => prev + 10)
          setCaughtCount((prev) => {
            const newCount = prev + 1

            if (newCount % 5 === 0) {
              showAnimalReward()
            }

            const level = gameLevels[currentLevel]
            if (newCount >= level.targetCount) {
              if (currentLevel < gameLevels.length - 1) {
                setCurrentLevel((prev) => prev + 1)
                return 0
              } else {
                setTimeout(() => {
                  setGameCompleted(true)
                }, 1500)
              }
            }

            return newCount
          })
        } else {
          playSound("wrong")
          if (basketRef.current) {
            basketRef.current.classList.add("shake")
            setTimeout(() => {
              if (basketRef.current) {
                basketRef.current.classList.remove("shake")
              }
            }, 500)
          }
        }

        return true 
      }
    }

    return false 
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gameAreaRef.current || !gameStarted || gameCompleted) return

    const rect = gameAreaRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100

    const basketWidthPercentage = basketRef.current ? (basketRef.current.offsetWidth / rect.width) * 100 : 10
    const maxPosition = 100 - basketWidthPercentage

    setBasketPosition(Math.max(0, Math.min(percentage, maxPosition)))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setTouchStartX(e.touches[0].clientX)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!gameAreaRef.current || !gameStarted || gameCompleted || e.touches.length === 0) return

    const rect = gameAreaRef.current.getBoundingClientRect()
    const touchX = e.touches[0].clientX

    const percentage = ((touchX - rect.left) / rect.width) * 100

    const basketWidthPercentage = basketRef.current ? (basketRef.current.offsetWidth / rect.width) * 100 : 10
    const maxPosition = 100 - basketWidthPercentage

    setBasketPosition(Math.max(0, Math.min(percentage, maxPosition)))
  }

  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      const level = gameLevels[currentLevel]
      const percentage = (caughtCount / level.targetCount) * 100
      setProgress(percentage)
    }
  }, [caughtCount, currentLevel, gameStarted, gameCompleted])

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (gameStarted && !gameCompleted && !showReward) {
      intervalId = setInterval(() => {
        generateFallingLetters()
      }, gameLevels[currentLevel].speed / 2) 
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [gameStarted, gameCompleted, currentLevel, targetLetter, showReward])

  useEffect(() => {
    if (!gameStarted || gameCompleted) return

    const checkInterval = setInterval(() => {
      fallingLetters.forEach((fallingLetter) => {
        const letterElement = document.getElementById(fallingLetter.id)
        if (letterElement) {
          const isCaught = checkLetterCaught(fallingLetter.id, letterElement, fallingLetter.letter)
          if (isCaught) {
            setFallingLetters((prev) => prev.filter((l) => l.id !== fallingLetter.id))
          }
        }
      })
    }, 100)

    return () => clearInterval(checkInterval)
  }, [fallingLetters, gameStarted, gameCompleted])

  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        50% { transform: translateX(10px); }
        75% { transform: translateX(-5px); }
        100% { transform: translateX(0); }
      }
      .shake {
        animation: shake 0.5s ease-in-out;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-teal-100 to-cyan-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/activity-choice">
              <Button variant="outline" size="icon" className="rounded-full bg-white shadow-md">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-teal-700">Catch the Falling Letter</h1>
          </div>

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
                <Link href="/activity-choice" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4" />
                  <span>Activities</span>
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

        <div
          className="bg-white rounded-3xl shadow-xl border-4 border-teal-200 relative overflow-hidden"
          style={{ height: "70vh", minHeight: "500px" }}
        >
          {!gameStarted && !gameCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10 h-full flex flex-col items-center justify-center"
            >
              <h2 className="text-3xl font-bold text-teal-700 mb-6">Catch the Falling Letters</h2>
              <div className="text-6xl mb-6">🧺</div>
              <p className="text-lg text-teal-600 mb-8 max-w-2xl mx-auto px-4">
                Move the basket to catch the falling Hindi letters that match the target letter at the top. Earn rewards
                by catching 5 correct letters!
              </p>
              <Button
                onClick={startGame}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xl px-10 py-6 rounded-xl"
              >
                Start Game
              </Button>
            </motion.div>
          )}

          {gameStarted && !gameCompleted && (
            <div
              ref={gameAreaRef}
              className="relative h-full w-full"
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onTouchStart={handleTouchStart}
            >
              {/* Game Info Bar */}
              <div className="absolute top-0 left-0 right-0 bg-teal-100 p-4 flex justify-between items-center z-20">
                <div className="flex items-center gap-4">
                  <div className="text-teal-700 font-bold">Level {currentLevel + 1}</div>
                  <div className="w-32">
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-teal-700">?</div>
                  <Button
                    onClick={() => playLetterSound(targetLetter)}
                    className="bg-teal-200 hover:bg-teal-300 text-teal-700 rounded-full h-8 w-8 p-0"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="bg-teal-200 px-4 py-2 rounded-full">
                  <span className="text-teal-700 font-bold">Score: {score}</span>
                </div>
              </div>

              <div className="absolute top-16 left-0 right-0 bottom-20 overflow-hidden">
                {fallingLetters.map((letter) => (
                  <motion.div
                    id={letter.id}
                    key={letter.id}
                    className={`absolute text-3xl font-bold ${letter.letter === targetLetter ? "text-purple-600" : "text-purple-600"} z-10`}
                    initial={{ y: -50, x: letter.x }}
                    animate={{ y: "calc(100vh - 100px)" }}
                    transition={{
                      duration: gameLevels[currentLevel].speed / 1000,
                      ease: "linear",
                    }}
                    onAnimationComplete={() => handleLetterReachBottom(letter.id)}
                    style={{ left: letter.x }}
                  >
                    {letter.letter}
                  </motion.div>
                ))}
              </div>

              <div
                ref={basketRef}
                className="absolute bottom-0 z-10"
                style={{
                  left: `${basketPosition}%`,
                  transform: "translateX(-50%)",
                  transition: "left 0.1s ease-out",
                }}
              >
                <div className="relative">
                  <div className="text-6xl select-none">🧺</div>
                  <div className="absolute -top-10 left-0 right-0 h-10 bg-transparent"></div>
                </div>
              </div>

              <AnimatePresence>
                {showReward && (
                  <motion.div
                    initial={{ scale: 0, y: 100 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, y: 100 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
                  >
                    <div className="flex flex-col items-center">
                      <div className="text-8xl animate-bounce">{currentReward}</div>
                      <div className="mt-4 text-2xl font-bold text-teal-600">Great job!</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isMobile && gameStarted && !gameCompleted && !showReward && (
                <div className="absolute bottom-20 left-0 right-0 text-center text-teal-600 text-sm">
                  Swipe left or right to move the basket
                </div>
              )}

              {debugMessage && (
                <div className="absolute bottom-24 left-0 right-0 text-center text-xs text-red-500">{debugMessage}</div>
              )}
            </div>
          )}

          {gameCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 h-full flex flex-col items-center justify-center"
            >
              <h2 className="text-4xl font-bold text-teal-700 mb-4">Game Completed!</h2>
              <div className="text-8xl mb-6">🏆</div>
              <p className="text-2xl text-teal-600 mb-2">Your Score</p>
              <p className="text-5xl font-bold text-teal-700 mb-8">{score}</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Button
                  onClick={startGame}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xl px-8 py-6 rounded-xl"
                >
                  Play Again
                </Button>
                <Link href="/activity-choice">
                  <Button className="bg-cyan-600 hover:bg-cyan-700 text-white text-xl px-8 py-6 rounded-xl">
                    Choose Another Activity
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        <div className="fixed bottom-8 right-8">
          <Link href="/badges">
            <Button className="h-16 w-16 rounded-full bg-teal-600 hover:bg-teal-700 shadow-lg flex items-center justify-center">
              <Medal className="h-8 w-8" />
              <span className="sr-only">View Badges</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}


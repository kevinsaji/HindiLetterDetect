"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
import confetti from "canvas-confetti"

// Hindi letters for the game
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

// Game level configuration
const gameLevels = [
  { choices: 2, rounds: 5, timeLimit: 0 }, // Level 1: 2 choices, no time limit
  { choices: 3, rounds: 7, timeLimit: 0 }, // Level 2: 3 choices, no time limit
  { choices: 4, rounds: 10, timeLimit: 0 }, // Level 3: 4 choices, no time limit
  { choices: 4, rounds: 10, timeLimit: 10 }, // Level 4: 4 choices, 10 second time limit
]

export default function GamesPage() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [currentRound, setCurrentRound] = useState(0)
  const [targetLetter, setTargetLetter] = useState("")
  const [letterChoices, setLetterChoices] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [progress, setProgress] = useState(0)
  const confettiRef = useRef<HTMLDivElement>(null)

  // Start a new game
  const startGame = () => {
    setCurrentLevel(0)
    setCurrentRound(0)
    setScore(0)
    setGameStarted(true)
    setGameCompleted(false)
    startNewRound(0, 0)
  }

  // Start a new round
  const startNewRound = (level: number, round: number) => {
    // Select a random target letter
    const randomIndex = Math.floor(Math.random() * hindiLetters.length)
    const target = hindiLetters[randomIndex]
    setTargetLetter(target)

    // Generate letter choices including the target
    const numChoices = gameLevels[level].choices
    const choices = [target]

    // Add random incorrect choices
    while (choices.length < numChoices) {
      const randomChoice = hindiLetters[Math.floor(Math.random() * hindiLetters.length)]
      if (!choices.includes(randomChoice)) {
        choices.push(randomChoice)
      }
    }

    // Shuffle the choices
    setLetterChoices(shuffleArray(choices))

    // Set time limit if applicable
    if (gameLevels[level].timeLimit > 0) {
      setTimeLeft(gameLevels[level].timeLimit)
    }

    // Update progress
    const totalRounds = gameLevels.reduce((sum, level) => sum + level.rounds, 0)
    const completedRounds = gameLevels.slice(0, level).reduce((sum, l) => sum + l.rounds, 0) + round
    setProgress((completedRounds / totalRounds) * 100)
  }

  // Handle letter selection
  const handleLetterSelect = (letter: string) => {
    const correct = letter === targetLetter
    setIsCorrect(correct)
    setShowFeedback(true)

    if (correct) {
      // Play success sound
      playSound("success")

      // Trigger confetti for correct answers
      if (confettiRef.current) {
        const rect = confettiRef.current.getBoundingClientRect()
        confetti({
          particleCount: 100,
          spread: 70,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight,
          },
        })
      }

      // Update score
      setScore(score + 1)
    } else {
      // Play error sound
      playSound("error")
    }

    // Show feedback for 1.5 seconds
    setTimeout(() => {
      setShowFeedback(false)

      // Move to next round or level
      const currentLevelConfig = gameLevels[currentLevel]

      if (currentRound + 1 < currentLevelConfig.rounds) {
        // Next round in same level
        setCurrentRound(currentRound + 1)
        startNewRound(currentLevel, currentRound + 1)
      } else if (currentLevel + 1 < gameLevels.length) {
        // Next level
        setCurrentLevel(currentLevel + 1)
        setCurrentRound(0)
        startNewRound(currentLevel + 1, 0)
      } else {
        // Game completed
        setGameCompleted(true)
        playSound("gameComplete")
      }
    }, 1500)
  }

  // Play audio for the target letter
  const playTargetLetterSound = () => {
    const utterance = new SpeechSynthesisUtterance(targetLetter)
    utterance.lang = "hi-IN"
    speechSynthesis.speak(utterance)
  }

  // Play game sounds
  const playSound = (type: "success" | "error" | "gameComplete") => {
    // In a real app, you would play actual sound files
    // For this demo, we'll use the Web Audio API to generate simple sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    if (type === "success") {
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.5)
    } else if (type === "error") {
      oscillator.type = "square"
      oscillator.frequency.setValueAtTime(196.0, audioContext.currentTime) // G3
      oscillator.frequency.setValueAtTime(185.0, audioContext.currentTime + 0.1) // F#3
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.3)
    } else if (type === "gameComplete") {
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2) // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.4) // G5
      oscillator.frequency.setValueAtTime(1046.5, audioContext.currentTime + 0.6) // C6
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.8)
    }
  }

  // Timer effect for timed levels
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (gameStarted && !gameCompleted && !showFeedback && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer as NodeJS.Timeout)
            // Time's up - count as incorrect
            handleLetterSelect("")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [gameStarted, gameCompleted, showFeedback, timeLeft])

  // Play target letter sound when a new round starts
  useEffect(() => {
    if (targetLetter && !showFeedback) {
      playTargetLetterSound()
    }
  }, [targetLetter, showFeedback])

  // Helper function to shuffle an array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-indigo-100 to-purple-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/activity-choice">
              <Button variant="outline" size="icon" className="rounded-full bg-white shadow-md">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-indigo-700">Find the Letter Game</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-14 w-14 rounded-full">
                <Avatar className="h-14 w-14 border-2 border-indigo-300">
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
                  <p className="text-sm font-medium leading-none">Student</p>
                  <p className="text-xs leading-none text-muted-foreground">student@nitk.edu.in</p>
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
                  <LogOut className="mr-2 h-4 w-4" />
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

        {/* Game Container */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border-4 border-indigo-200 relative overflow-hidden">
          {/* Confetti container */}
          <div ref={confettiRef} className="absolute inset-0 pointer-events-none"></div>

          {!gameStarted && !gameCompleted && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10">
              <h2 className="text-3xl font-bold text-indigo-700 mb-6">Find the Letter Game</h2>
              <p className="text-lg text-indigo-600 mb-8 max-w-2xl mx-auto">
                Listen to the Hindi letter and tap on the matching letter from the choices. How many can you get right?
              </p>
              <Button
                onClick={startGame}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl px-10 py-6 rounded-xl"
              >
                Start Game
              </Button>
            </motion.div>
          )}

          {gameStarted && !gameCompleted && (
            <div className="flex flex-col items-center">
              {/* Progress and Score */}
              <div className="w-full flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-700 font-medium">Level {currentLevel + 1}</span>
                  <Progress value={progress} className="w-32 h-2" />
                </div>
                <div className="bg-indigo-100 px-4 py-2 rounded-full">
                  <span className="text-indigo-700 font-bold">Score: {score}</span>
                </div>
                {timeLeft > 0 && (
                  <div
                    className={`px-4 py-2 rounded-full ${timeLeft <= 3 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
                  >
                    <span className="font-bold">{timeLeft}s</span>
                  </div>
                )}
              </div>

              {/* Target Letter */}
              <div className="mb-8 relative">
                <motion.div
                  key={targetLetter}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-[150px] font-bold text-indigo-600 leading-none"
                >
                  ?
                </motion.div>
                <Button
                  onClick={playTargetLetterSound}
                  className="absolute -right-16 top-1/2 transform -translate-y-1/2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full h-12 w-12 p-0"
                >
                  <Volume2 className="h-6 w-6" />
                </Button>
              </div>

              {/* Letter Choices */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                {letterChoices.map((letter, index) => (
                  <motion.div
                    key={`${letter}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => handleLetterSelect(letter)}
                      disabled={showFeedback}
                      className="w-full h-32 text-4xl font-bold bg-white hover:bg-indigo-50 text-indigo-700 border-4 border-indigo-300 rounded-2xl shadow-md"
                    >
                      {letter}
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Feedback Overlay */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm"
                  >
                    <div className="text-center">
                      {isCorrect ? (
                        <div className="flex flex-col items-center">
                          <div className="text-6xl mb-4">🎉</div>
                          <h3 className="text-3xl font-bold text-green-600 mb-2">Shabash!</h3>
                          <p className="text-xl text-green-700">Great job!</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="text-6xl mb-4">🔄</div>
                          <h3 className="text-3xl font-bold text-amber-600 mb-2">Try Again!</h3>
                          <p className="text-xl text-amber-700">You'll get it next time!</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Game Completed Screen */}
          {gameCompleted && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
              <h2 className="text-4xl font-bold text-indigo-700 mb-4">Game Completed!</h2>
              <div className="text-8xl mb-6">🏆</div>
              <p className="text-2xl text-indigo-600 mb-2">Your Score</p>
              <p className="text-5xl font-bold text-indigo-700 mb-8">{score}</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Button
                  onClick={startGame}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl px-8 py-6 rounded-xl"
                >
                  Play Again
                </Button>
                <Link href="/choose-activity">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xl px-8 py-6 rounded-xl">
                    Choose Another Activity
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        {/* Badges Button */}
        <div className="fixed bottom-8 right-8">
          <Link href="/badges">
            <Button className="h-16 w-16 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg flex items-center justify-center">
              <Medal className="h-8 w-8" />
              <span className="sr-only">View Badges</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}


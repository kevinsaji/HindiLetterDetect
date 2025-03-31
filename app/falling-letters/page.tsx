/*

"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Volume2, Medal, User, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Hindi letters for the game
const hindiLetters = [
  "अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "अं", "अः",
  "क", "ख", "ग", "घ", "च", "छ", "ज", "झ", "ट", "ठ", "ड", "ढ", "ण",
  "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल",
  "व", "श", "ष", "स", "ह", "क्ष", "त्र", "ज्ञ"
]

// Animal rewards
const animalRewards = [
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵"
]

// Game levels
const gameLevels = [
  { speed: 2000, lettersPerWave: 2, targetCount: 5 },   // Level 1
  { speed: 1800, lettersPerWave: 3, targetCount: 7 },   // Level 2
  { speed: 1600, lettersPerWave: 3, targetCount: 10 },  // Level 3
  { speed: 1400, lettersPerWave: 4, targetCount: 12 },  // Level 4
  { speed: 1200, lettersPerWave: 4, targetCount: 15 },  // Level 5
]

// Letter component that falls from the top
interface FallingLetterProps {
  letter: string
  x: number
  speed: number
  onCatch: (letter: string, id: string) => void
  id: string
  targetLetter: string
}

const FallingLetter: React.FC<FallingLetterProps> = ({ letter, x, speed, onCatch, id, targetLetter }) => {
  return (
    <motion.div
      className={`absolute text-3xl font-bold ${letter === targetLetter ? 'text-green-600' : 'text-purple-600'} z-10`}
      initial={{ y: -50, x }}
      animate={{ y: "100vh" }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: speed / 1000, ease: "linear" }}
      onAnimationComplete={() => onCatch(letter, id)}
      style={{ top: 0, left: x }}
    >
      {letter}
    </motion.div>
  )
}

export default function FallingLettersGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [score, setScore] = useState(0)
  const [targetLetter, setTargetLetter] = useState("")
  const [fallingLetters, setFallingLetters] = useState<Array<{ id: string; letter: string; x: number }>>([])
  const [basketPosition, setBasketPosition] = useState(50) // percentage from left
  const [caughtCount, setCaughtCount] = useState(0)
  const [showReward, setShowReward] = useState(false)
  const [currentReward, setCurrentReward] = useState("")
  const [progress, setProgress] = useState(0)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const basketRef = useRef<HTMLDivElement>(null)
  const [basketWidth, setBasketWidth] = useState(100)
  const [gameAreaWidth, setGameAreaWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  
  // Initialize the game
  const startGame = () => {
    setGameStarted(true)
    setGameCompleted(false)
    setCurrentLevel(0)
    setScore(0)
    setCaughtCount(0)
    selectNewTargetLetter()
    
    // Measure the game area and basket
    if (gameAreaRef.current) {
      setGameAreaWidth(gameAreaRef.current.offsetWidth)
    }
    if (basketRef.current) {
      setBasketWidth(basketRef.current.offsetWidth)
    }
    
    // Check if mobile
    setIsMobile(window.innerWidth < 768)
  }
  
  // Select a new target letter
  const selectNewTargetLetter = () => {
    const randomIndex = Math.floor(Math.random() * hindiLetters.length)
    setTargetLetter(hindiLetters[randomIndex])
    playLetterSound(hindiLetters[randomIndex])
  }
  
  // Generate a new wave of falling letters
  const generateFallingLetters = () => {
    const level = gameLevels[currentLevel]
    const newLetters = []
    
    // Include at least one target letter
    const targetX = Math.floor(Math.random() * (gameAreaWidth - 50))
    newLetters.push({
      id: `letter-${Date.now()}-${Math.random()}`,
      letter: targetLetter,
      x: targetX
    })
    
    // Add other random letters
    for (let i = 1; i < level.lettersPerWave; i++) {
      let randomLetter
      do {
        const randomIndex = Math.floor(Math.random() * hindiLetters.length)
        randomLetter = hindiLetters[randomIndex]
      } while (randomLetter === targetLetter)
      
      const x = Math.floor(Math.random() * (gameAreaWidth - 50))
      newLetters.push({
        id: `letter-${Date.now()}-${Math.random()}-${i}`,
        letter: randomLetter,
        x
      })
    }
    
    setFallingLetters(prev => [...prev, ...newLetters])
  }
  
  // Handle letter catching
  const handleCatchLetter = (letter: string, id: string) => {
    // Remove the letter from the array
    setFallingLetters(prev => prev.filter(l => l.id !== id))
    
    // Check if the letter was caught by the basket
    if (basketRef.current) {
      const basketRect = basketRef.current.getBoundingClientRect()
      const letterElement = document.getElementById(id)
      
      if (letterElement) {
        const letterRect = letterElement.getBoundingClientRect()
        
        // Check if the letter is within the basket's horizontal bounds
        const isCaught = 
          letterRect.left + letterRect.width / 2 >= basketRect.left &&
          letterRect.left + letterRect.width / 2 <= basketRect.right &&
          letterRect.bottom >= basketRect.top &&
          letterRect.bottom <= basketRect.bottom + 20 // Give a little extra space at the bottom
        
        if (isCaught) {
          if (letter === targetLetter) {
            // Correct catch
            playSound("correct")
            setScore(prev => prev + 10)
            setCaughtCount(prev => {
              const newCount = prev + 1
              
              // Check if we've caught enough for a reward
              if (newCount % 5 === 0) {
                showAnimalReward()
              }
              
              // Check if level is complete
              const level = gameLevels[currentLevel]
              if (newCount >= level.targetCount) {
                if (currentLevel < gameLevels.length - 1) {
                  // Move to next level
                  setCurrentLevel(prev => prev + 1)
                  return 0 // Reset caught count for new level
                } else {
                  // Game completed
                  setTimeout(() => {
                    setGameCompleted(true)
                  }, 1500)
                }
              }
              
              return newCount
            })
          } else {
            // Wrong catch
            playSound("wrong")
            // Make the basket shake
            if (basketRef.current) {
              basketRef.current.classList.add("shake")
              setTimeout(() => {
                if (basketRef.current) {
                  basketRef.current.classList.remove("shake")
                }
              }, 500)
            }
          }
        }
      }
    }
  }
  
  // Show animal reward animation
  const showAnimalReward = () => {
    const randomIndex = Math.floor(Math.random() * animalRewards.length)
    setCurrentReward(animalRewards[randomIndex])
    setShowReward(true)
    playSound("reward")
    
    setTimeout(() => {
      setShowReward(false)
    }, 3000)
  }
  
  // Play letter sound
  const playLetterSound = (letter: string) => {
    const utterance = new SpeechSynthesisUtterance(letter)
    utterance.lang = "hi-IN"
    speechSynthesis.speak(utterance)
  }
  
  // Play game sounds
  const playSound = (type: "correct" | "wrong" | "reward") => {
    // In a real app, you would play actual sound files
    // For this demo, we'll use the Web Audio API to generate simple sounds
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
      oscillator.frequency.setValueAtTime(196.00, audioContext.currentTime) // G3
      oscillator.frequency.setValueAtTime(185.00, audioContext.currentTime + 0.1) // F#3
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
  
  // Handle mouse movement for basket
  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameAreaRef.current && gameStarted && !gameCompleted) {
      const rect = gameAreaRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const newPosition = (x / rect.width) * 100
      
      // Constrain the basket to the game area
      const maxPosition = 100 - (basketWidth / gameAreaWidth) * 100
      setBasketPosition(Math.max(0, Math.min(newPosition, maxPosition)))
    }
  }
  
  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setTouchStartX(e.touches[0].clientX)
    }
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameAreaRef.current && gameStarted && !gameCompleted && e.touches.length > 0) {
      const rect = gameAreaRef.current.getBoundingClientRect()
      const touchX = e.touches[0].clientX
      const deltaX = touchX - touchStartX
      
      // Update touch start for next move
      setTouchStartX(touchX)
      
      // Calculate new position
      const newPosition = basketPosition + (deltaX / rect.width) * 100
      
      // Constrain the basket to the game area
      const maxPosition = 100 - (basketWidth / gameAreaWidth) * 100
      setBasketPosition(Math.max(0, Math.min(newPosition, maxPosition)))
    }
  }
  
  // Generate falling letters at intervals
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    
    if (gameStarted && !gameCompleted && !showReward) {
      intervalId = setInterval(() => {
        generateFallingLetters()
      }, gameLevels[currentLevel].speed)
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [gameStarted, gameCompleted, currentLevel, targetLetter, gameAreaWidth, showReward])
  
  // Update progress
  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      const level = gameLevels[currentLevel]
      const percentage = (caughtCount / level.targetCount) * 100
      setProgress(percentage)
    }
  }, [caughtCount, currentLevel, gameStarted, gameCompleted])
  
  // Update game area and basket measurements on resize
  useEffect(() => {
    const handleResize = () => {
      if (gameAreaRef.current) {
        setGameAreaWidth(gameAreaRef.current.offsetWidth)
      }
      if (basketRef.current) {
        setBasketWidth(basketRef.current.offsetWidth)
      }
      setIsMobile(window.innerWidth < 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Add CSS for the shake animation
  useEffect(() => {
    const style = document.createElement('style')
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
                Move the basket to catch the falling Hindi letters that match the target letter at the top.
                Earn rewards by catching 5 correct letters!
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
              onMouseMove={!isMobile ? handleMouseMove : undefined}
              onTouchStart={isMobile ? handleTouchStart : undefined}
              onTouchMove={isMobile ? handleTouchMove : undefined}
            >
              <div className="absolute top-0 left-0 right-0 bg-teal-100 p-4 flex justify-between items-center z-20">
                <div className="flex items-center gap-4">
                  <div className="text-teal-700 font-bold">Level {currentLevel + 1}</div>
                  <div className="w-32">
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-teal-700">{targetLetter}</div>
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
                <AnimatePresence>
                  {fallingLetters.map(letter => (
                    <div id={letter.id} key={letter.id}>
                      <FallingLetter
                        letter={letter.letter}
                        x={letter.x}
                        speed={gameLevels[currentLevel].speed}
                        onCatch={handleCatchLetter}
                        id={letter.id}
                        targetLetter={targetLetter}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
              
              <div 
                ref={basketRef}
                className="absolute bottom-0 z-10 transition-all duration-100"
                style={{ left: `${basketPosition}%` }}
              >
                <div className="relative">
                  <div className="text-6xl">🧺</div>
                  <div className="absolute -top-2 left-0 right-0 h-10 bg-transparent"></div>
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
                  <Button 
                    className="bg-cyan-600 hover:bg-cyan-700 text-white text-xl px-8 py-6 rounded-xl"
                  >
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

*/


"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Volume2, Medal, User, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Hindi letters for the game
const hindiLetters = [
  "अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "अं", "अः",
  "क", "ख", "ग", "घ", "च", "छ", "ज", "झ", "ट", "ठ", "ड", "ढ", "ण",
  "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल",
  "व", "श", "ष", "स", "ह", "क्ष", "त्र", "ज्ञ"
]

// Animal rewards
const animalRewards = [
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵"
]

// Game levels
const gameLevels = [
  { speed: 2000, lettersPerWave: 2, targetCount: 5 },   // Level 1
  { speed: 1800, lettersPerWave: 3, targetCount: 7 },   // Level 2
  { speed: 1600, lettersPerWave: 3, targetCount: 10 },  // Level 3
  { speed: 1400, lettersPerWave: 4, targetCount: 12 },  // Level 4
  { speed: 1200, lettersPerWave: 4, targetCount: 15 },  // Level 5
]

// Letter component that falls from the top
interface FallingLetterProps {
  letter: string
  x: number
  speed: number
  onCatch: (letter: string, id: string, position: { x: number, y: number }) => void
  id: string
  targetLetter: string
}

const FallingLetter: React.FC<FallingLetterProps> = ({ letter, x, speed, onCatch, id, targetLetter }) => {
  const letterRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Track the letter's position during animation for accurate collision detection
    const updatePosition = () => {
      if (letterRef.current) {
        const rect = letterRef.current.getBoundingClientRect();
        onCatch(letter, id, { x: rect.left + rect.width / 2, y: rect.bottom });
      }
    };
    
    const interval = setInterval(updatePosition, 100);
    return () => clearInterval(interval);
  }, [letter, id, onCatch]);

  return (
    <motion.div
      ref={letterRef}
      className={`absolute text-3xl font-bold ${letter === targetLetter ? 'text-green-600' : 'text-purple-600'} z-10`}
      initial={{ y: -50, x }}
      animate={{ y: "100vh" }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: speed / 1000, ease: "linear" }}
      style={{ top: 0, left: x }}
    >
      {letter}
    </motion.div>
  )
}

export default function FallingLettersGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [score, setScore] = useState(0)
  const [targetLetter, setTargetLetter] = useState("")
  const [fallingLetters, setFallingLetters] = useState<Array<{ id: string; letter: string; x: number }>>([])
  const [basketPosition, setBasketPosition] = useState(50) // percentage from left
  const [caughtCount, setCaughtCount] = useState(0)
  const [showReward, setShowReward] = useState(false)
  const [currentReward, setCurrentReward] = useState("")
  const [progress, setProgress] = useState(0)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const basketRef = useRef<HTMLDivElement>(null)
  const [basketWidth, setBasketWidth] = useState(100)
  const [gameAreaWidth, setGameAreaWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  
  // Initialize the game
  const startGame = () => {
    setGameStarted(true)
    setGameCompleted(false)
    setCurrentLevel(0)
    setScore(0)
    setCaughtCount(0)
    setFallingLetters([])
    selectNewTargetLetter()
    
    // Measure the game area and basket
    if (gameAreaRef.current) {
      setGameAreaWidth(gameAreaRef.current.offsetWidth)
    }
    if (basketRef.current) {
      setBasketWidth(basketRef.current.offsetWidth)
    }
    
    // Center basket position at start
    setBasketPosition(50)
    
    // Check if mobile
    setIsMobile(window.innerWidth < 768)
  }
  
  // Select a new target letter
  const selectNewTargetLetter = () => {
    const randomIndex = Math.floor(Math.random() * hindiLetters.length)
    setTargetLetter(hindiLetters[randomIndex])
    playLetterSound(hindiLetters[randomIndex])
  }
  
  // Generate a new wave of falling letters with better distribution
  const generateFallingLetters = () => {
    if (!gameAreaRef.current) return;
    
    const level = gameLevels[currentLevel]
    const newLetters = []
    const gameWidth = gameAreaRef.current.offsetWidth
    
    // Divide the game area into sections to ensure better distribution
    const sectionWidth = gameWidth / level.lettersPerWave
    
    // Include at least one target letter in a random section
    const targetSection = Math.floor(Math.random() * level.lettersPerWave)
    
    for (let i = 0; i < level.lettersPerWave; i++) {
      // Decide if this section should have the target letter
      const isTargetSection = i === targetSection;
      
      // Calculate random position within this section
      // Add padding to avoid letters at the very edge
      const padding = 30;
      const minX = i * sectionWidth + padding;
      const maxX = (i + 1) * sectionWidth - padding;
      const x = Math.floor(Math.random() * (maxX - minX)) + minX;
      
      // For non-target sections, choose a random letter that's not the target
      let letter;
      if (isTargetSection) {
        letter = targetLetter;
      } else {
        let randomLetter;
        do {
          const randomIndex = Math.floor(Math.random() * hindiLetters.length);
          randomLetter = hindiLetters[randomIndex];
        } while (randomLetter === targetLetter);
        letter = randomLetter;
      }
      
      newLetters.push({
        id: `letter-${Date.now()}-${Math.random()}-${i}`,
        letter: letter,
        x: x
      });
    }
    
    setFallingLetters(prev => [...prev, ...newLetters]);
  }
  
  // Handle letter collision detection with improved accuracy
  const handleCatchLetter = (letter: string, id: string, position: { x: number, y: number }) => {
    // Check if the letter is at the bottom of the game area
    if (basketRef.current && gameAreaRef.current) {
      const basketRect = basketRef.current.getBoundingClientRect();
      const gameRect = gameAreaRef.current.getBoundingClientRect();
      
      // Calculate the letter's position relative to the game area
      const relativeY = position.y - gameRect.top;
      const basketTop = basketRect.top - gameRect.top;
      
      // Check if the letter is at the basket's height
      if (relativeY >= basketTop && relativeY <= basketTop + 60) {
        // Check if it's within the basket's horizontal bounds
        if (position.x >= basketRect.left && position.x <= basketRect.right) {
          // Remove the caught letter
          setFallingLetters(prev => prev.filter(l => l.id !== id));
          
          if (letter === targetLetter) {
            // Correct catch
            playSound("correct");
            setScore(prev => prev + 10);
            setCaughtCount(prev => {
              const newCount = prev + 1;
              
              // Check if we've caught enough for a reward
              if (newCount % 5 === 0) {
                showAnimalReward();
              }
              
              // Check if level is complete
              const level = gameLevels[currentLevel];
              if (newCount >= level.targetCount) {
                if (currentLevel < gameLevels.length - 1) {
                  // Move to next level
                  setCurrentLevel(prev => prev + 1);
                  selectNewTargetLetter(); // Get a new target letter for the next level
                  return 0; // Reset caught count for new level
                } else {
                  // Game completed
                  setTimeout(() => {
                    setGameCompleted(true);
                  }, 1500);
                }
              }
              
              return newCount;
            });
          } else {
            // Wrong catch
            playSound("wrong");
            // Make the basket shake
            if (basketRef.current) {
              basketRef.current.classList.add("shake");
              setTimeout(() => {
                if (basketRef.current) {
                  basketRef.current.classList.remove("shake");
                }
              }, 500);
            }
          }
        }
      }
      
      // Remove letters that have gone off screen
      if (relativeY > gameRect.height) {
        setFallingLetters(prev => prev.filter(l => l.id !== id));
      }
    }
  }
  
  // Show animal reward animation
  const showAnimalReward = () => {
    const randomIndex = Math.floor(Math.random() * animalRewards.length)
    setCurrentReward(animalRewards[randomIndex])
    setShowReward(true)
    playSound("reward")
    
    setTimeout(() => {
      setShowReward(false)
    }, 3000)
  }
  
  // Play letter sound
  const playLetterSound = (letter: string) => {
    const utterance = new SpeechSynthesisUtterance(letter)
    utterance.lang = "hi-IN"
    speechSynthesis.speak(utterance)
  }
  
  // Play game sounds
  const playSound = (type: "correct" | "wrong" | "reward") => {
    // In a real app, you would play actual sound files
    // For this demo, we'll use the Web Audio API to generate simple sounds
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
      oscillator.frequency.setValueAtTime(196.00, audioContext.currentTime) // G3
      oscillator.frequency.setValueAtTime(185.00, audioContext.currentTime + 0.1) // F#3
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
  
  // Improved mouse movement for basket with smoother tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameAreaRef.current && gameStarted && !gameCompleted) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      // Calculate as percentage of game area width
      const newPosition = (x / rect.width) * 100;
      
      // Get basket width in percentage terms
      const basketWidthPercent = (basketWidth / rect.width) * 100;
      
      // Constrain the basket to stay within the game area
      // Subtract half the basket width from both sides to center the basket on the cursor
      const halfBasketWidth = basketWidthPercent / 2;
      const minPosition = halfBasketWidth;
      const maxPosition = 100 - halfBasketWidth;
      
      setBasketPosition(Math.max(minPosition, Math.min(newPosition, maxPosition)));
    }
  }
  
  // Improved touch event handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setTouchStartX(e.touches[0].clientX);
    }
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameAreaRef.current && gameStarted && !gameCompleted && e.touches.length > 0) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      const touchX = e.touches[0].clientX;
      
      // Get the touch position as a percentage of the game area width
      const touchPositionPercent = ((touchX - rect.left) / rect.width) * 100;
      
      // Get basket width in percentage terms
      const basketWidthPercent = (basketWidth / rect.width) * 100;
      
      // Constrain the basket to stay within the game area
      // Subtract half the basket width from both sides to center the basket on the touch position
      const halfBasketWidth = basketWidthPercent / 2;
      const minPosition = halfBasketWidth;
      const maxPosition = 100 - halfBasketWidth;
      
      setBasketPosition(Math.max(minPosition, Math.min(touchPositionPercent, maxPosition)));
      
      // Prevent scrolling while playing
      e.preventDefault();
    }
  }
  
  // Generate falling letters at intervals
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    
    if (gameStarted && !gameCompleted && !showReward) {
      intervalId = setInterval(() => {
        generateFallingLetters()
      }, gameLevels[currentLevel].speed)
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [gameStarted, gameCompleted, currentLevel, targetLetter, gameAreaWidth, showReward])
  
  // Update progress
  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      const level = gameLevels[currentLevel]
      const percentage = (caughtCount / level.targetCount) * 100
      setProgress(percentage)
    }
  }, [caughtCount, currentLevel, gameStarted, gameCompleted])
  
  // Update game area and basket measurements on resize
  useEffect(() => {
    const handleResize = () => {
      if (gameAreaRef.current) {
        setGameAreaWidth(gameAreaRef.current.offsetWidth)
      }
      if (basketRef.current) {
        setBasketWidth(basketRef.current.offsetWidth)
      }
      setIsMobile(window.innerWidth < 768)
    }
    
    window.addEventListener('resize', handleResize)
    handleResize() // Initial measurement
    
    return () => window.removeEventListener('resize', handleResize)
  }, [gameStarted])
  
  // Add CSS for the shake animation
  useEffect(() => {
    const style = document.createElement('style')
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-teal-100 to-cyan-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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

        {/* Game Container */}
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
                Move the basket to catch the falling Hindi letters that match the target letter at the top.
                Earn rewards by catching 5 correct letters!
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
              onMouseMove={!isMobile ? handleMouseMove : undefined}
              onTouchStart={isMobile ? handleTouchStart : undefined}
              onTouchMove={isMobile ? handleTouchMove : undefined}
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
                  <div className="text-3xl font-bold text-teal-700">{targetLetter}</div>
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
              
              {/* Falling Letters */}
              <div className="absolute top-16 left-0 right-0 bottom-20 overflow-hidden">
                <AnimatePresence>
                  {fallingLetters.map(letter => (
                    <FallingLetter
                      key={letter.id}
                      letter={letter.letter}
                      x={letter.x}
                      speed={gameLevels[currentLevel].speed}
                      onCatch={handleCatchLetter}
                      id={letter.id}
                      targetLetter={targetLetter}
                    />
                  ))}
                </AnimatePresence>
              </div>
              
              {/* Basket */}
              <div 
                ref={basketRef}
                className="absolute bottom-0 z-10 transition-all duration-75 ease-out"
                style={{ 
                  left: `${basketPosition}%`, 
                  transform: 'translateX(-50%)' // Center the basket on cursor position
                }}
              >
                <div className="relative">
                  <div className="text-6xl">🧺</div>
                  <div className="absolute -top-2 left-0 right-0 h-10 bg-transparent"></div>
                </div>
              </div>
              
              {/* Animal Reward Animation */}
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
              
              {/* Mobile Controls Hint */}
              {isMobile && gameStarted && !gameCompleted && !showReward && (
                <div className="absolute bottom-20 left-0 right-0 text-center text-teal-600 text-sm">
                  Swipe left or right to move the basket
                </div>
              )}
            </div>
          )}
          
          {/* Game Completed Screen */}
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
                  <Button 
                    className="bg-cyan-600 hover:bg-cyan-700 text-white text-xl px-8 py-6 rounded-xl"
                  >
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
"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/lib/store";
import { Toggle } from "@/components/ui/toggle"
import { Volume2, Pencil, Edit3, User, LogOut, Medal, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import path from "path";
import { useRouter } from "next/navigation";

// Hindi vowels with their completion status
const hindiLetters = [
  { letter: "अ", completed: false },
  { letter: "आ", completed: false },
  { letter: "इ", completed: false },
  { letter: "ई", completed: false },
  { letter: "उ", completed: false },
  { letter: "ऊ", completed: false },
  { letter: "ए", completed: false },
  { letter: "ऐ", completed: false },
  { letter: "ओ", completed: false },
  { letter: "औ", completed: false },
  { letter: "अं", completed: false },
  { letter: "अः", completed: false },
  { letter: "क", completed: false },
  { letter: "ख", completed: false },
  { letter: "ग", completed: false },
  { letter: "घ", completed: false },
  { letter: "च", completed: false },
  { letter: "छ", completed: false },
  { letter: "ज", completed: false },
  { letter: "झ", completed: false },
  { letter: "ट", completed: false },
  { letter: "ठ", completed: false },
  { letter: "ड", completed: false },
  { letter: "ढ", completed: false },
  { letter: "ण", completed: false },
  { letter: "त", completed: false },
  { letter: "थ", completed: false },
  { letter: "द", completed: false },
  { letter: "ध", completed: false },
  { letter: "न", completed: false },
  { letter: "प", completed: false },
  { letter: "फ", completed: false },
  { letter: "ब", completed: false },
  { letter: "भ", completed: false },
  { letter: "म", completed: false },
  { letter: "य", completed: false },
  { letter: "र", completed: false },
  { letter: "ल", completed: false },
  { letter: "व", completed: false },
  { letter: "श", completed: false },
  { letter: "ष", completed: false },
  { letter: "स", completed: false },
  { letter: "ह", completed: false },
  { letter: "क्ष", completed: false },
  { letter: "त्र", completed: false },
  { letter: "ज्ञ", completed: false },
]

// Success and error messages
const successMessages = [
  "Great job! Your writing is excellent!",
  "Perfect! You're getting better at Hindi!",
  "Wonderful! Keep up the good work!",
  "Excellent! You're a natural at this!",
  "Amazing! You're making great progress!",
]

const errorMessages = [
  "Try again! Focus on the letter shape.",
  "Almost there! Give it another try.",
  "Keep practicing! You'll get it soon.",
  "Not quite right. Try following the outline more closely.",
  "Let's try once more. You can do it!",
]

export default function HindiLearning() {
  const router = useRouter();
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [isTracing, setIsTracing] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)
  const [Mistakes, setMistakes] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completedLetters, setCompletedLetters] = useState(new Array(hindiLetters.length).fill(false))
  const [completedLetterValues, setCompletedLetterValues] = useState<string[]>([])
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [drawnPixels, setDrawnPixels] = useState<{ x: number; y: number }[]>([])
  const [isVerifying, setIsVerifying] = useState(false)
  const [similarityScore, setSimilarityScore] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const user = useUserStore((state) => state.user);

  // Function to update progress to server
  const updateProgressToServer = async (): Promise<boolean> => {
    if (!user) return false;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/update-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.user_email,
          completedLetters: completedLetterValues,
          mistakes: Mistakes,
        }),
      });
      console.log(response);
      if (!response.ok) {
        console.error('Failed to update progress');
        return false;
      }
      user.letters_completed = completedLetterValues;
      user.mistakes = Mistakes;
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Load user's completed letters on mount
  useEffect(() => {
    if (user && user.letters_completed) {
      // Update completed letters from user data
      const newCompletedLetters = new Array(hindiLetters.length).fill(false);
      const newCompletedLetterValues: string[] = [...user.letters_completed];
      
      hindiLetters.forEach((letter, index) => {
        if (user.letters_completed.includes(letter.letter)) {
          newCompletedLetters[index] = true;
        }
      });
      
      setCompletedLetters(newCompletedLetters);
      setCompletedLetterValues(newCompletedLetterValues);
      setMistakes(user.mistakes); 
      
      // Update progress
      const completed = newCompletedLetters.filter(Boolean).length;
      const total = hindiLetters.length;
      setProgress((completed / total) * 100);
    }
  }, [user]);

  // Effect to handle canvas setup and letter overlay
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 400

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw the letter overlay only if in tracing mode
    if (isTracing) {
      ctx.font = "300px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "rgba(156, 39, 176, 0.1)" // Light purple with low opacity
      ctx.fillText(hindiLetters[currentLetterIndex].letter, canvas.width / 2, canvas.height / 2)
    }

    // Reset drawn pixels
    setDrawnPixels([])
  }, [currentLetterIndex, isTracing])

  // Effect to update progress
  useEffect(() => {
    const completed = completedLetters.filter(Boolean).length
    const total = hindiLetters.length
    setProgress((completed / total) * 100)
  }, [completedLetters])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    setLastX(x)
    setLastY(y)

    // Add this point to drawn pixels
    setDrawnPixels((prev) => [...prev, { x, y }])
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.strokeStyle = "#4338ca"
    ctx.lineWidth = 12
    ctx.lineCap = "round"
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.stroke()

    setLastX(x)
    setLastY(y)

    // Add this point to drawn pixels
    setDrawnPixels((prev) => [...prev, { x, y }])
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  // Function to verify the drawing using the Python script
  const verifyDrawing = async (): Promise<boolean> => {
    const canvas = canvasRef.current
    if (!canvas) return false
    console.log("Starting verification process")
    
    try {
      // Convert canvas to data URL
      const imageDataUrl = canvas.toDataURL("image/png")
      console.log("Image converted to data URL")
      
      // Send the image to our API route
      const apiPath = path.join(process.cwd(), "api", "verify-letter")
      const response = await fetch(apiPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: imageDataUrl,
          letterIndex: currentLetterIndex
        }),
      })
      
      console.log("API response status:", response.status)
      
      // If response is not OK, try to parse the error message
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API error:", errorData)
        throw new Error(errorData.error || "Failed to verify letter")
      }
      
      const data = await response.json()
      console.log("API response data:", data)
      setSimilarityScore(data.similarity || null)
      return data.isMatch
    } catch (error) {
      console.error("Error verifying drawing:", error)
      return false
    }
  }

  const checkDrawing = async () => {
    if (drawnPixels.length === 0) {
      setFeedbackMessage("Please draw something first.")
      setShowFeedback(true)
      setIsCorrect(false)
      return
    }

    if (!user) return false

    setIsVerifying(true)
    setShowFeedback(false)
    
    try {
      // Verify the drawing
      const isMatch = await verifyDrawing()
      
      setIsCorrect(isMatch)
      setShowResult(true)
      
      // Set feedback message
      if (isMatch) {
        const randomIndex = Math.floor(Math.random() * successMessages.length)
        setFeedbackMessage(successMessages[randomIndex])
        
        // Mark letter as complete if correct
        const currentLetter = hindiLetters[currentLetterIndex].letter;
        setCompletedLetters((prev) => {
          const newCompleted = [...prev]
          newCompleted[currentLetterIndex] = true
          return newCompleted
        })
        
        // Add to completed letter values if not already there
        if (!completedLetterValues.includes(currentLetter)) {
          setCompletedLetterValues(prev => [...prev, currentLetter]);
        }
      } else {
        setMistakes(prev => prev + 1);
        const randomIndex = Math.floor(Math.random() * errorMessages.length)
        setFeedbackMessage(errorMessages[randomIndex])
      }
      
      setShowFeedback(true)
      
      // Hide the result after 2 seconds
      setTimeout(() => {
        setShowResult(false)
        if (isMatch) {
          // Move to next letter if correct
          setTimeout(() => {
            setCurrentLetterIndex((prev) => (prev < hindiLetters.length - 1 ? prev + 1 : 0))
            clearCanvas()
            setShowFeedback(false)
            setSimilarityScore(null)
          }, 1000)
        }
      }, 2000)
    } catch (error) {
      console.error("Error in checkDrawing:", error)
      setFeedbackMessage("There was an error verifying your drawing. Please try again.")
      setShowFeedback(true)
      setIsCorrect(false)
    } finally {
      setIsVerifying(false)
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Redraw the letter overlay only if in tracing mode
    if (isTracing) {
      ctx.font = "300px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "rgba(156, 39, 176, 0.1)"
      ctx.fillText(hindiLetters[currentLetterIndex].letter, canvas.width / 2, canvas.height / 2)
    }

    // Reset drawn pixels
    setDrawnPixels([])
    setShowFeedback(false)
    setSimilarityScore(null)
  }

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(hindiLetters[currentLetterIndex].letter)
    utterance.lang = "hi-IN"
    speechSynthesis.speak(utterance)
  }

  // Handle navigation with progress saving
  const handleNavigate = async (path: string) => {
    setIsSaving(true);
    try {
      // Wait for the progress to be saved first
      const success = await updateProgressToServer();
      if (success) {
        router.push(path);
      } else {
        console.error("Failed to save progress before navigation");
        // Navigate anyway after a short delay
        setTimeout(() => router.push(path), 500);
      }
    } catch (error) {
      console.error("Error during navigation:", error);
      router.push(path);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle logout with progress saving
  const handleLogout = async () => {
    setIsSaving(true);
    try {
      // Save progress first
      await updateProgressToServer();
      // Then logout
      useUserStore.getState().logout();
      router.push('/');
    } catch (error) {
      console.error("Error during logout:", error);
      useUserStore.getState().logout();
      router.push('/');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center text-purple-600 flex-1">हिंदी सीखें (Learn Hindi)</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-14 w-14 rounded-full">
                <Avatar className="h-14 w-14 border-2 border-purple-300">
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
              <DropdownMenuItem asChild>
                <button 
                  className="w-full flex items-center cursor-pointer" 
                  onClick={() => handleNavigate('/badges')}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile & Badges</span>
                    </>
                  )}
                </button>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button 
                  className="w-full flex items-center cursor-pointer" 
                  onClick={() => handleNavigate('/activity-choice')}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      <span>Activities</span>
                    </>
                  )}
                </button>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button 
                  className="w-full flex items-center cursor-pointer" 
                  onClick={handleLogout}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log-Out</span>
                    </>
                  )}
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-lg mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Progress value={progress} className="h-3 bg-green-200 [&>div]:bg-green-600" />
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="flex gap-2 overflow-x-auto py-2">
            {hindiLetters.map((letter, index) => (
              <Button
                key={index}
                variant={currentLetterIndex === index ? "default" : "outline"}
                className={`min-w-[3rem] h-12 ${
                  completedLetters[index] ? "bg-green-100 text-green-700 hover:bg-green-200" : ""
                }`}
                onClick={() => setCurrentLetterIndex(index)}
              >
                {letter.letter}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center space-y-6 shadow-xl border-4 border-purple-200">
            <div className="text-[200px] font-bold text-purple-600 leading-none hover:scale-105 transition-transform">
              {hindiLetters[currentLetterIndex].letter}
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setCurrentLetterIndex((prev) => (prev > 0 ? prev - 1 : hindiLetters.length - 1))}
                className="bg-pink-100 hover:bg-pink-200 border-2 border-pink-300 text-pink-700 rounded-2xl px-6 py-6 text-lg"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentLetterIndex((prev) => (prev < hindiLetters.length - 1 ? prev + 1 : 0))}
                className="bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 text-blue-700 rounded-2xl px-6 py-6 text-lg"
              >
                Next
              </Button>
            </div>
            <Button
              onClick={playAudio}
              className="bg-green-100 hover:bg-green-200 border-2 border-green-300 text-green-700 rounded-2xl px-8 py-6 text-lg"
            >
              <Volume2 className="mr-2 h-6 w-6" />
              Listen
            </Button>
          </div>

          <div className="bg-white rounded-3xl p-8 flex flex-col items-center space-y-6 shadow-xl border-4 border-purple-200 relative">
            {showResult && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="animate-bounce">
                  {isCorrect ? (
                    <div className="h-24 w-24 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="h-16 w-16 text-white" />
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-red-500 flex items-center justify-center">
                      <XCircle className="h-16 w-16 text-white" />
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex space-x-4 mb-4">
              <Toggle
                pressed={isTracing}
                onPressedChange={setIsTracing}
                className="bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 text-purple-700 rounded-2xl px-6 py-6 text-lg data-[state=on]:bg-purple-200"
              >
                <Edit3 className="h-6 w-6 mr-2" />
                Tracing
              </Toggle>
              <Toggle
                pressed={!isTracing}
                onPressedChange={(pressed) => {
                  setIsTracing(!pressed)
                  // Clear canvas when switching to freehand mode
                  const canvas = canvasRef.current
                  if (!canvas) return

                  const ctx = canvas.getContext("2d")
                  if (!ctx) return

                  // Clear the entire canvas
                  ctx.clearRect(0, 0, canvas.width, canvas.height)

                  // Only redraw the letter outline if we're in tracing mode
                  if (pressed === false) {
                    ctx.font = "300px Arial"
                    ctx.textAlign = "center"
                    ctx.textBaseline = "middle"
                    ctx.fillStyle = "rgba(156, 39, 176, 0.1)"
                    ctx.fillText(hindiLetters[currentLetterIndex].letter, canvas.width / 2, canvas.height / 2)
                  }

                  // Reset drawn pixels
                  setDrawnPixels([])
                  setShowFeedback(false)
                  setSimilarityScore(null)
                }}
                className="bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 text-orange-700 rounded-2xl px-6 py-6 text-lg data-[state=on]:bg-orange-200"
              >
                <Pencil className="h-6 w-6 mr-2" />
                Freehand
              </Toggle>
              <Button
                variant="outline"
                onClick={clearCanvas}
                className="bg-red-100 hover:bg-red-200 border-2 border-red-300 text-red-700 rounded-2xl px-6 py-6 text-lg"
              >
                Clear
              </Button>
            </div>

            <canvas
              ref={canvasRef}
              className="border-4 border-purple-200 rounded-2xl bg-white shadow-inner"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{ touchAction: "none" }}
            />

            <Button
              onClick={checkDrawing}
              disabled={isVerifying || drawnPixels.length === 0}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-8 py-6 text-lg flex items-center"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Submit"
              )}
            </Button>

            {showFeedback && (
              <Alert className={`mt-4 ${isCorrect ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                <AlertTitle className={isCorrect ? "text-green-700" : "text-amber-700"}>
                  {isCorrect ? "Success!" : "Try Again"}
                </AlertTitle>
                <AlertDescription className={isCorrect ? "text-green-600" : "text-amber-600"}>
                  {feedbackMessage}
                  {similarityScore !== null && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Similarity score:</span> {similarityScore.toFixed(4)}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <div className="fixed bottom-8 right-8">
          <Button 
            onClick={() => handleNavigate('/badges')}
            disabled={isSaving}
            className="h-16 w-16 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg flex items-center justify-center"
          >
            {isSaving ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Medal className="h-8 w-8" />
            )}
            <span className="sr-only">View Badges</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
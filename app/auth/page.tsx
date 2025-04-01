"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("")

  const [loginError, setLoginError] = useState("")
  const [signupError, setSignupError] = useState("")
  const [passwordMatchError, setPasswordMatchError] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError("")

    setTimeout(() => {
      setIsLoading(false)
      router.push("/activity-choice")
    }, 1500)
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSignupError("")

    if (signupPassword !== signupConfirmPassword) {
      setPasswordMatchError(true)
      setIsLoading(false)
      return
    }

    setTimeout(() => {
      setIsLoading(false)
      router.push("/activity-choice")
    }, 1500)
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupConfirmPassword(e.target.value)
    setPasswordMatchError(signupPassword !== e.target.value && e.target.value !== "")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-purple-700">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-purple-300">
              <span className="text-4xl font-bold text-purple-600">ह</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-2 border-purple-200 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-purple-700">
                {activeTab === "login" ? "Welcome Back!" : "Create an Account"}
              </CardTitle>
              <CardDescription className="text-center">
                {activeTab === "login"
                  ? "Enter your credentials to continue your Hindi learning journey"
                  : "Sign up to start your Hindi learning journey"}
              </CardDescription>
            </CardHeader>

            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your.email@example.com"
                          className="pl-10"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <Link href="#" className="text-xs text-purple-600 hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                    </div>
                    {loginError && <div className="text-sm font-medium text-red-500">{loginError}</div>}
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your.email@example.com"
                          className="pl-10"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm-password"
                          type={showPassword ? "text" : "password"}
                          className={`pl-10 pr-10 ${
                            passwordMatchError ? "border-red-500 focus-visible:ring-red-500" : ""
                          }`}
                          value={signupConfirmPassword}
                          onChange={handleConfirmPasswordChange}
                          required
                        />
                      </div>
                      {passwordMatchError && <p className="text-xs text-red-500">Passwords do not match</p>}
                    </div>
                    {signupError && <div className="text-sm font-medium text-red-500">{signupError}</div>}
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={isLoading || passwordMatchError}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>

            <div className="p-6 pt-0 text-center text-sm">
              {activeTab === "login" ? (
                <div>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setActiveTab("signup")}
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </div>
              ) : (
                <div>
                  Already have an account?{" "}
                  <button onClick={() => setActiveTab("login")} className="text-purple-600 hover:underline font-medium">
                    Log in
                  </button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{" "}
            <Link href="#" className="text-purple-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-purple-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}


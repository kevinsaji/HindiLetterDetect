"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Trophy,
  Medal,
  Award,
  Star,
  Flame,
  Calendar,
  Clock,
  Zap,
  BookOpen,
  Sparkles,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react"

// Badge types and their data
interface Badge {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  earned: boolean
  progress?: number
  date?: string
}

export default function BadgesPage() {
  const [progress, setProgress] = useState(42) // Example progress percentage
  const [streakDays, setStreakDays] = useState(7) // Example streak days
  const [totalLettersLearned, setTotalLettersLearned] = useState(19) // Example letters learned

  // Mock data for badges - in a real app, this would come from a database or state management
  const [badges, setBadges] = useState<Badge[]>([
    // Progress badges
    {
      id: "progress-25",
      name: "Beginner Scholar",
      description: "Completed 25% of Hindi letters",
      icon: Trophy,
      color: "bg-amber-500",
      earned: progress >= 25,
      progress: Math.min((progress / 25) * 100, 100),
      date: progress >= 25 ? "March 5, 2025" : undefined,
    },
    {
      id: "progress-50",
      name: "Intermediate Learner",
      description: "Completed 50% of Hindi letters",
      icon: Medal,
      color: "bg-emerald-500",
      earned: progress >= 50,
      progress: Math.min((progress / 50) * 100, 100),
      date: progress >= 50 ? "March 10, 2025" : undefined,
    },
    {
      id: "progress-75",
      name: "Advanced Student",
      description: "Completed 75% of Hindi letters",
      icon: Award,
      color: "bg-blue-500",
      earned: progress >= 75,
      progress: Math.min((progress / 75) * 100, 100),
    },
    {
      id: "progress-100",
      name: "Hindi Master",
      description: "Completed 100% of Hindi letters",
      icon: Star,
      color: "bg-purple-600",
      earned: progress >= 100,
      progress: Math.min((progress / 100) * 100, 100),
    },

    // Streak badges
    {
      id: "streak-3",
      name: "Consistent Learner",
      description: "Practiced for 3 days in a row",
      icon: Flame,
      color: "bg-orange-500",
      earned: streakDays >= 3,
      progress: Math.min((streakDays / 3) * 100, 100),
      date: streakDays >= 3 ? "March 3, 2025" : undefined,
    },
    {
      id: "streak-7",
      name: "Weekly Warrior",
      description: "Practiced for 7 days in a row",
      icon: Calendar,
      color: "bg-red-500",
      earned: streakDays >= 7,
      progress: Math.min((streakDays / 7) * 100, 100),
      date: streakDays >= 7 ? "March 7, 2025" : undefined,
    },
    {
      id: "streak-30",
      name: "Monthly Master",
      description: "Practiced for 30 days in a row",
      icon: Clock,
      color: "bg-indigo-600",
      earned: streakDays >= 30,
      progress: Math.min((streakDays / 30) * 100, 100),
    },

    // Special achievement badges
    {
      id: "perfect-10",
      name: "Perfect 10",
      description: "Got 10 perfect scores in a row",
      icon: Zap,
      color: "bg-yellow-500",
      earned: false,
      progress: 40,
    },
    {
      id: "speed-writer",
      name: "Speed Writer",
      description: "Completed a letter in under 10 seconds",
      icon: BookOpen,
      color: "bg-cyan-500",
      earned: true,
      date: "March 4, 2025",
    },
    {
      id: "vowel-virtuoso",
      name: "Vowel Virtuoso",
      description: "Mastered all Hindi vowels",
      icon: Sparkles,
      color: "bg-pink-500",
      earned: true,
      date: "March 6, 2025",
    },
    {
      id: "consonant-champion",
      name: "Consonant Champion",
      description: "Mastered all Hindi consonants",
      icon: Medal,
      color: "bg-teal-500",
      earned: false,
      progress: 65,
    },
    {
      id: "early-bird",
      name: "Early Bird",
      description: "Practiced Hindi before 7 AM",
      icon: Flame,
      color: "bg-amber-600",
      earned: true,
      date: "March 2, 2025",
    },
  ])

  // Filter badges by category
  const progressBadges = badges.filter((badge) => badge.id.startsWith("progress-"))
  const streakBadges = badges.filter((badge) => badge.id.startsWith("streak-"))
  const specialBadges = badges.filter((badge) => !badge.id.startsWith("progress-") && !badge.id.startsWith("streak-"))

  // Count earned badges
  const earnedBadges = badges.filter((badge) => badge.earned).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-blue-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/activity-choice">
              <Button variant="outline" size="icon" className="rounded-full bg-white shadow-md">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-center text-purple-600">Profile & Achievements</h1>
          </div>

          <div className="flex items-center gap-4 bg-white rounded-full py-2 px-6 shadow-md">
            <Avatar className="h-14 w-14 border-2 border-purple-300">
              <AvatarImage
                src="https://plus.unsplash.com/premium_vector-1728553013068-ae053473049d?q=80&w=2360&auto=format&fit=crop"
                alt="Profile"
              />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Student</p>
              <p className="text-sm text-muted-foreground">Level 3 Hindi Learner</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/90 shadow-lg border-2 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-purple-700">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Hindi Letters</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 shadow-lg border-2 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-purple-700">Current Streak</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center">
                <Flame className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{streakDays} days</p>
                <p className="text-sm text-muted-foreground">Keep it going!</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 shadow-lg border-2 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-purple-700">Badges Earned</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
                <Medal className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {earnedBadges} / {badges.length}
                </p>
                <p className="text-sm text-muted-foreground">Keep collecting!</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 rounded-xl p-1 shadow-md">
            <TabsTrigger value="all" className="rounded-lg">
              All Badges
            </TabsTrigger>
            <TabsTrigger value="progress" className="rounded-lg">
              Progress
            </TabsTrigger>
            <TabsTrigger value="streaks" className="rounded-lg">
              Streaks
            </TabsTrigger>
            <TabsTrigger value="special" className="rounded-lg">
              Special
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {progressBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="streaks" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {streakBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="special" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {specialBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Badge Card Component
function BadgeCard({ badge }: { badge: Badge }) {
  const Icon = badge.icon

  return (
    <Card className={`overflow-hidden transition-all ${badge.earned ? "bg-white shadow-lg" : "bg-white/60 shadow"}`}>
      <div className={`h-2 w-full ${badge.earned ? badge.color : "bg-gray-200"}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div
            className={`h-14 w-14 rounded-full flex items-center justify-center ${
              badge.earned ? `${badge.color} text-white` : "bg-gray-200 text-gray-400"
            }`}
          >
            <Icon className="h-8 w-8" />
          </div>
          {badge.earned && (
            <div className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
              <CheckIcon className="h-3 w-3 mr-1" />
              Earned
            </div>
          )}
        </div>
        <CardTitle className="text-lg font-medium mt-2">{badge.name}</CardTitle>
        <CardDescription>{badge.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!badge.earned && badge.progress !== undefined && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{badge.progress}%</span>
            </div>
            <Progress value={badge.progress} className="h-2" />
          </div>
        )}
        {badge.earned && badge.date && <div className="text-sm text-muted-foreground">Earned on {badge.date}</div>}
      </CardContent>
    </Card>
  )
}

// Simple check icon component
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}


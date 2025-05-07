"use client"

import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Headphones, PenTool, FileText, BookText } from "lucide-react"

const levelTitles = {
  "0-300": "Beginner (0-300)",
  "300-600": "Intermediate (300-600)",
  "600-800": "Advanced (600-800)",
  "800-990": "Expert (800-990)",
}

const learningModules = [
  {
    id: "vocabulary",
    title: "Vocabulary",
    description: "Build your TOEIC vocabulary with flashcards and exercises",
    icon: <BookOpen className="h-6 w-6" />,
    color: "bg-blue-100 dark:bg-blue-900",
  },
  {
    id: "grammar",
    title: "Grammar",
    description: "Master essential grammar rules for the TOEIC test",
    icon: <PenTool className="h-6 w-6" />,
    color: "bg-green-100 dark:bg-green-900",
  },
  {
    id: "listening",
    title: "Listening",
    description: "Improve your listening skills with audio exercises",
    icon: <Headphones className="h-6 w-6" />,
    color: "bg-purple-100 dark:bg-purple-900",
  },
  {
    id: "fill-in-blanks",
    title: "Fill in the Blanks",
    description: "Practice completing sentences and paragraphs",
    icon: <FileText className="h-6 w-6" />,
    color: "bg-amber-100 dark:bg-amber-900",
  },
  {
    id: "vocabulary-stories",
    title: "Vocabulary Stories",
    description: "Learn vocabulary in context through engaging stories",
    icon: <BookText className="h-6 w-6" />,
    color: "bg-rose-100 dark:bg-rose-900",
  },
]

export default function LevelPage() {
  const { level } = useParams()
  const levelTitle = levelTitles[level as keyof typeof levelTitles] || "Learning Level"

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{levelTitle}</h1>
        <p className="text-muted-foreground">Choose a learning module to start improving your TOEIC skills.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningModules.map((module) => (
          <Card key={module.id} className="flex flex-col">
            <CardHeader className={`${module.color} rounded-t-lg`}>
              <div className="flex items-center gap-3">
                {module.icon}
                <CardTitle>{module.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow pt-4">
              <CardDescription>{module.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to={`/learning/${level}/${module.id}`}>Start Learning</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

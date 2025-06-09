"use client"

import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, PenTool, Sparkles } from "lucide-react"

const levelTitles = {
  "0-300": "Beginner (0-300)",
  "300-600": "Intermediate (300-600)",
  "600-800": "Advanced (600-800)",
}

const learningModules = [
  {
    id: "vocabulary",
    title: "Từ vựng (Vocabulary)",
    description: "Học từ vựng TOEIC thông qua flashcards và bài tập tương tác",
    icon: <BookOpen className="h-8 w-8" />,
    color: "bg-blue-100 dark:bg-blue-950/50",
    borderColor: "border-blue-300 dark:border-blue-800",
    hoverColor: "group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60",
    textColor: "text-blue-800 dark:text-blue-200",
  },
  {
    id: "grammar",
    title: "Ngữ pháp (Grammar)",
    description: "Nắm vững các quy tắc ngữ pháp cơ bản và nâng cao cho kỳ thi TOEIC",
    icon: <PenTool className="h-8 w-8" />,
    color: "bg-green-100 dark:bg-green-950/50",
    borderColor: "border-green-300 dark:border-green-800",
    hoverColor: "group-hover:bg-green-200 dark:group-hover:bg-green-900/60",
    textColor: "text-green-800 dark:text-green-200",
  },
  {
    id: "practice-exams",
    title: "Luyện tập (Practice Exams)",
    description: "Làm các bài tập từ vựng và ngữ pháp theo dạng đề thi thực tế",
    icon: <FileText className="h-8 w-8" />,
    color: "bg-indigo-100 dark:bg-indigo-950/50",
    borderColor: "border-indigo-300 dark:border-indigo-800",
    hoverColor: "group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60",
    textColor: "text-indigo-800 dark:text-indigo-200",
  },
]

export default function LevelPage() {
  const { level } = useParams()
  const levelTitle = levelTitles[level as keyof typeof levelTitles] || "Learning Level"

  return (
    <div className="container py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">{levelTitle}</h1>
        <div className="flex items-center justify-center mb-4">
          <div className="h-1 w-20 bg-primary rounded-full"></div>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Chọn một mô-đun học tập bên dưới để bắt đầu cải thiện kỹ năng TOEIC của bạn.
          <br />Mỗi mô-đun cung cấp các bài học và bài tập tương tác phù hợp với trình độ của bạn.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {learningModules.map((module) => (
          <Link to={`/learning/${level}/${module.id}`} key={module.id} className="group">
            <Card className={`flex flex-col h-full transition-all duration-300 border-2 ${module.borderColor} hover:shadow-lg`}>
              <CardHeader className={`${module.color} rounded-t-lg transition-colors ${module.hoverColor}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/30 dark:bg-black/20 ${module.textColor}`}>
                    {module.icon}
                  </div>
                  <CardTitle className={`${module.textColor}`}>{module.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow pt-4 pb-6">
                <CardDescription className="text-base">{module.description}</CardDescription>
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                <Button className="w-full group-hover:bg-primary/90">
                  Bắt đầu học
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

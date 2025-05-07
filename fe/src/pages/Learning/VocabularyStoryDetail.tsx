"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BookOpen, CheckCircle, PenLine } from "lucide-react"
import VocabularyCards from "@/components/vocabulary-stories/VocabularyCards"
import ClozeTest from "@/components/vocabulary-stories/ClozeTest"
import VocabularyQuiz from "@/components/vocabulary-stories/VocabularyQuiz"

// Mock data - trong thực tế sẽ được lấy từ API
const mockStories = [
  {
    id: "1",
    title: "A Day at the Office",
    level: "0-300",
    content:
      "John arrives at the office early every morning. He checks his email and attends a meeting with his team. During lunch, he discusses a new project with his colleagues. In the afternoon, he prepares a report for his manager. Before leaving, he organizes his desk for the next day.",
    vocabulary: [
      { word: "arrive", meaning: "đến nơi", example: "She will arrive at the airport at 3 PM." },
      { word: "attend", meaning: "tham dự", example: "All employees must attend the annual meeting." },
      { word: "discuss", meaning: "thảo luận", example: "Let's discuss this matter in private." },
      { word: "colleague", meaning: "đồng nghiệp", example: "My colleagues are very supportive." },
      { word: "prepare", meaning: "chuẩn bị", example: "I need to prepare for my presentation." },
      { word: "report", meaning: "báo cáo", example: "The financial report is due tomorrow." },
      { word: "organize", meaning: "sắp xếp", example: "Please organize these files alphabetically." },
    ],
  },
  // Thêm các câu chuyện khác ở đây
]

export default function VocabularyStoryDetail() {
  const { level, id } = useParams()
  const [story, setStory] = useState<typeof mockStories[0] | null>(null)
  const [progress, setProgress] = useState({
    vocabulary: false,
    story: false,
    practice: false,
    quiz: false,
  })

  useEffect(() => {
    // Trong thực tế, đây sẽ là API call
    const foundStory = mockStories.find(s => s.id === id)
    if (foundStory) {
      setStory(foundStory)
    }
  }, [id])

  const handleComplete = (section: keyof typeof progress) => {
    setProgress({ ...progress, [section]: true })
  }

  const isAllCompleted = Object.values(progress).every((value) => value)

  if (!story) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/learning/${level}/vocabulary-stories`}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{story.title}</h1>
        </div>

        <Tabs defaultValue="vocabulary" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vocabulary" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Từ Vựng</span>
              {progress.vocabulary && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="story" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Đọc Chuyện</span>
              {progress.story && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2">
              <PenLine className="h-4 w-4" />
              <span className="hidden sm:inline">Điền Từ</span>
              {progress.practice && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <PenLine className="h-4 w-4" />
              <span className="hidden sm:inline">Kiểm Tra</span>
              {progress.quiz && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vocabulary">
            <Card>
              <CardHeader>
                <CardTitle>Từ Vựng Trong Bài</CardTitle>
              </CardHeader>
              <CardContent>
                <VocabularyCards vocabulary={story.vocabulary} onComplete={() => handleComplete("vocabulary")} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="story">
            <Card>
              <CardHeader>
                <CardTitle>Đọc Câu Chuyện</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-muted rounded-md">
                  <p className="text-lg leading-relaxed">{story.content}</p>
                </div>
                <Button onClick={() => handleComplete("story")} className="w-full">
                  Đánh Dấu Đã Đọc
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="practice">
            <Card>
              <CardHeader>
                <CardTitle>Bài Tập Điền Từ</CardTitle>
              </CardHeader>
              <CardContent>
                <ClozeTest
                  story={story.content}
                  vocabulary={story.vocabulary.map((v) => v.word)}
                  onComplete={() => handleComplete("practice")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <Card>
              <CardHeader>
                <CardTitle>Kiểm Tra Từ Vựng</CardTitle>
              </CardHeader>
              <CardContent>
                <VocabularyQuiz vocabulary={story.vocabulary} onComplete={() => handleComplete("quiz")} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isAllCompleted && (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Chúc mừng!</h2>
                <p className="mb-4">Bạn đã hoàn thành tất cả các phần của bài học từ vựng này.</p>
                <div className="flex gap-4">
                  <Button asChild variant="outline">
                    <Link to={`/learning/${level}/vocabulary-stories`}>Quay Lại Danh Sách</Link>
                  </Button>
                  <Button asChild>
                    <Link to={`/learning/${level}`}>Tiếp Tục Học</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

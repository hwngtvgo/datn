"use client"

import { Link, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data
const mockStories = [
  {
    id: 1,
    title: "A Day at the Office",
    level: "0-300",
    description: "Learn office vocabulary through a simple story",
    wordCount: 15,
    completionTime: "5-10 phút",
  },
  {
    id: 2,
    title: "Business Meeting",
    level: "0-300",
    description: "Practice business meeting vocabulary",
    wordCount: 20,
    completionTime: "10-15 phút",
  },
  {
    id: 3,
    title: "Job Interview",
    level: "0-300",
    description: "Learn vocabulary related to job interviews",
    wordCount: 25,
    completionTime: "15-20 phút",
  },
]

export default function VocabularyStoriesPage() {
  const { level } = useParams()
  const stories = mockStories.filter((story) => story.level === level)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Học Từ Vựng Qua Chuyện</h1>
          <p className="text-muted-foreground">
            Học từ vựng TOEIC thông qua các câu chuyện thú vị và bài tập tương tác.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {stories.map((story) => (
            <Card key={story.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle>{story.title}</CardTitle>
                <CardDescription>{story.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground mb-4">
                  <div>Số từ vựng: {story.wordCount}</div>
                  <div>Thời gian: {story.completionTime}</div>
                </div>
                <Button asChild className="w-full">
                  <Link to={`/learning/${level}/vocabulary-stories/${story.id}`}>Bắt Đầu Học</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {stories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Chưa có câu chuyện từ vựng nào cho cấp độ này.</p>
            <Button asChild variant="outline">
              <Link to={`/learning/${level}`}>Quay Lại</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { AlertCircle } from "lucide-react"

// Mock data cho nhiều bài test
const mockTests = [
  {
    id: "1",
    title: "Đề Thi TOEIC #1",
    sections: [
      {
        id: "listening",
        title: "Phần Nghe",
        questions: [
          {
            id: "l1",
            type: "listening",
            audioUrl: "/audio/sample.mp3",
            question: "What does the woman suggest the man do?",
            options: [
              { id: "l1a", text: "Call a taxi" },
              { id: "l1b", text: "Take a bus" },
              { id: "l1c", text: "Walk to the station" },
              { id: "l1d", text: "Wait for her" },
            ],
          },
          {
            id: "l2",
            type: "listening",
            audioUrl: "/audio/sample2.mp3",
            question: "Where is the meeting taking place?",
            options: [
              { id: "l2a", text: "In a restaurant" },
              { id: "l2b", text: "In an office" },
              { id: "l2c", text: "In a conference room" },
              { id: "l2d", text: "In a hotel" },
            ],
          },
          {
            id: "l3",
            type: "listening",
            audioUrl: "/audio/sample3.mp3",
            question: "What is the man planning to do next?",
            options: [
              { id: "l3a", text: "Go to a meeting" },
              { id: "l3b", text: "Call a client" },
              { id: "l3c", text: "Review a document" },
              { id: "l3d", text: "Take a lunch break" },
            ],
          },
        ],
      },
      {
        id: "reading",
        title: "Phần Đọc",
        questions: [
          {
            id: "r1",
            type: "reading",
            question: "According to the passage, what is the main benefit of the new software?",
            passage:
              "The new accounting software has been implemented across all departments. It streamlines the invoicing process and reduces the time needed for monthly financial reporting by 40%. Additionally, it integrates with existing systems, eliminating the need for manual data entry.",
            options: [
              { id: "r1a", text: "It is less expensive than the previous software" },
              { id: "r1b", text: "It reduces time for financial reporting" },
              { id: "r1c", text: "It requires less staff to operate" },
              { id: "r1d", text: "It provides more detailed reports" },
            ],
          },
          {
            id: "r2",
            type: "reading",
            question: "What is the purpose of the memo?",
            passage:
              "MEMO\nTo: All Staff\nFrom: HR Department\nRe: Office Closure\n\nPlease be advised that the office will be closed on Friday, July 15 for building maintenance. All employees are expected to work remotely on this day. Please ensure you have access to the VPN and necessary files before leaving on Thursday.",
            options: [
              { id: "r2a", text: "To announce a holiday" },
              { id: "r2b", text: "To inform about a technical issue" },
              { id: "r2c", text: "To notify about an office closure" },
              { id: "r2d", text: "To request maintenance feedback" },
            ],
          },
          {
            id: "r3",
            type: "reading",
            question: "What should employees do on Friday?",
            passage:
              "MEMO\nTo: All Staff\nFrom: HR Department\nRe: Office Closure\n\nPlease be advised that the office will be closed on Friday, July 15 for building maintenance. All employees are expected to work remotely on this day. Please ensure you have access to the VPN and necessary files before leaving on Thursday.",
            options: [
              { id: "r3a", text: "Come to the office early" },
              { id: "r3b", text: "Take a day off" },
              { id: "r3c", text: "Work remotely" },
              { id: "r3d", text: "Attend maintenance training" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Đề Thi TOEIC #2",
    sections: [
      // ... add more test data here
    ]
  }
]

export default function TestPage() {
  const { id } = useParams()
  const [test, setTest] = useState<typeof mockTests[0] | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(7200) // 2 hours in seconds
  const [isLoading, setIsLoading] = useState(true)

  // Load test data based on ID
  useEffect(() => {
    const loadTest = async () => {
      setIsLoading(true)
      try {
        const foundTest = mockTests.find(t => t.id === id)
        if (foundTest) {
          setTest(foundTest)
        }
      } catch (error) {
        console.error('Error loading test:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadTest()
  }, [id])

  // Auto-advance in listening section
  useEffect(() => {
    if (!test) return

    if (
      currentSection === 0 && // Listening section
      answers[test.sections[currentSection].questions[currentQuestion].id] && // Answer selected
      currentQuestion < test.sections[currentSection].questions.length - 1 // Not the last question
    ) {
      const timer = setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
      }, 1500) // 1.5 seconds delay

      return () => clearTimeout(timer)
    }
  }, [answers, currentSection, currentQuestion, test])

  // Timer
  useEffect(() => {
    if (isCompleted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          setIsCompleted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isCompleted])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = (questionId: string, answerId: string) => {
    setAnswers({ ...answers, [questionId]: answerId })
  }

  const handleNext = () => {
    if (!test) return

    const currentSectionQuestions = test.sections[currentSection].questions
    if (currentQuestion < currentSectionQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else if (currentSection < test.sections.length - 1) {
      setCurrentSection(currentSection + 1)
      setCurrentQuestion(0)
    } else {
      setIsCompleted(true)
    }
  }

  const handlePrevious = () => {
    if (!test) return

    if (currentSection === 0) {
      // In listening section, can't go back
      return
    }

    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      setCurrentQuestion(test.sections[currentSection - 1].questions.length - 1)
    }
  }

  const calculateProgress = () => {
    if (!test) return 0

    const totalQuestions = test.sections.reduce((acc, section) => acc + section.questions.length, 0)
    const completedQuestions = Object.keys(answers).length
    return (completedQuestions / totalQuestions) * 100
  }

  if (isLoading || !test) {
    return <div>Loading test...</div>
  }

  const currentSectionData = test.sections[currentSection]
  const currentQuestionData = currentSectionData.questions[currentQuestion]
  const isListeningSection = currentSectionData.id === "listening"
  const isFirstQuestion = currentQuestion === 0 && currentSection === 0
  const isLastQuestion =
    currentQuestion === currentSectionData.questions.length - 1 && currentSection === test.sections.length - 1

  if (isCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">Bài Thi Hoàn Thành</h1>
            <p className="mb-4">Cảm ơn bạn đã hoàn thành bài thi TOEIC.</p>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Kết Quả</h2>
              <p>
                Số câu đã trả lời: {Object.keys(answers).length}/
                {test.sections.reduce((acc, section) => acc + section.questions.length, 0)}
              </p>
              <p>Thời gian còn lại: {formatTime(timeLeft)}</p>
            </div>
            <Button className="w-full">Xem Đáp Án Chi Tiết</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{test.title}</h1>
            <p className="text-muted-foreground">
              {currentSectionData.title} - Câu {currentQuestion + 1}/{currentSectionData.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <Progress value={calculateProgress()} className="mb-6" />

        <Card className="mb-6">
          <CardContent className="p-6">
            {isListeningSection && (
              <div className="mb-4">
                <div className="bg-muted p-4 rounded-md flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Phần nghe sẽ tự động chuyển sang câu tiếp theo sau khi bạn chọn đáp án.
                  </p>
                </div>
                <audio controls className="w-full mb-4" src={currentQuestionData.audioUrl} autoPlay>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {currentQuestionData.type === "reading" && currentQuestionData.passage && (
              <div className="mb-4 p-4 bg-muted rounded-md">
                <p className="whitespace-pre-line">{currentQuestionData.passage}</p>
              </div>
            )}

            <h2 className="text-lg font-semibold mb-4">{currentQuestionData.question}</h2>

            <RadioGroup
              value={answers[currentQuestionData.id] || ""}
              onValueChange={(value) => handleAnswer(currentQuestionData.id, value)}
              className="space-y-3"
            >
              {currentQuestionData.options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent"
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-grow cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={isListeningSection || isFirstQuestion}>
            {isListeningSection ? "Không thể quay lại" : "Câu Trước"}
          </Button>

          <Button onClick={handleNext} disabled={isListeningSection && answers[currentQuestionData.id]}>
            {isLastQuestion
              ? "Kết Thúc Bài Thi"
              : isListeningSection && currentQuestion === currentSectionData.questions.length - 1
                ? "Chuyển sang Phần Đọc"
                : "Câu Tiếp Theo"}
          </Button>
        </div>
      </div>
    </div>
  )
}

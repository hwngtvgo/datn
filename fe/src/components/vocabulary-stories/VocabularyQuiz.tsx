"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle } from "lucide-react"

interface VocabularyItem {
  word: string
  meaning: string
  example: string
}

interface VocabularyQuizProps {
  vocabulary: VocabularyItem[]
  onComplete: () => void
}

export default function VocabularyQuiz({ vocabulary, onComplete }: VocabularyQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isChecked, setIsChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // Generate quiz questions from vocabulary
  const generateQuizQuestions = () => {
    return vocabulary.map((item) => {
      // Get 3 random incorrect meanings
      const incorrectOptions = vocabulary
        .filter((v) => v.word !== item.word)
        .map((v) => v.meaning)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)

      // Combine correct and incorrect options and shuffle
      const options = [item.meaning, ...incorrectOptions].sort(() => 0.5 - Math.random())

      return {
        word: item.word,
        correctAnswer: item.meaning,
        options,
      }
    })
  }

  const questions = generateQuizQuestions()

  const handleCheck = () => {
    if (!selectedAnswer) return

    setIsChecked(true)

    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setIsChecked(false)
    } else {
      setIsCompleted(true)
      onComplete()
    }
  }

  if (isCompleted) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-2xl font-bold mb-2">Hoàn Thành!</h3>
        <p className="text-lg mb-4">
          Điểm số của bạn: {score}/{questions.length}
        </p>
        <Button
          onClick={() => {
            setCurrentQuestion(0)
            setSelectedAnswer(null)
            setIsChecked(false)
            setScore(0)
            setIsCompleted(false)
          }}
          variant="outline"
        >
          Làm Lại Bài Kiểm Tra
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Câu hỏi {currentQuestion + 1}/{questions.length}
        </span>
        <span className="text-sm font-medium">Điểm: {score}</span>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 text-center">"{questions[currentQuestion].word}" có nghĩa là gì?</h3>

          <RadioGroup
            value={selectedAnswer || ""}
            onValueChange={setSelectedAnswer}
            className="space-y-3"
            disabled={isChecked}
          >
            {questions[currentQuestion].options.map((option, index) => {
              const isCorrect = option === questions[currentQuestion].correctAnswer
              const isSelected = selectedAnswer === option

              return (
                <div
                  key={index}
                  className={`flex items-center space-x-2 rounded-md border p-3 ${
                    isChecked && isCorrect
                      ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                      : isChecked && isSelected && !isCorrect
                        ? "bg-red-50 dark:bg-red-900/20 border-red-500"
                        : ""
                  }`}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-grow">
                    {option}
                  </Label>
                  {isChecked && isCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {isChecked && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              )
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        {!isChecked ? (
          <Button onClick={handleCheck} className="flex-1" disabled={!selectedAnswer}>
            Kiểm Tra
          </Button>
        ) : (
          <Button onClick={handleNext} className="flex-1">
            {currentQuestion < questions.length - 1 ? "Câu Tiếp Theo" : "Hoàn Thành"}
          </Button>
        )}
      </div>
    </div>
  )
}

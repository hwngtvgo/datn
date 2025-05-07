"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react"

interface VocabularyItem {
  word: string
  meaning: string
  example: string
}

interface VocabularyCardsProps {
  vocabulary: VocabularyItem[]
  onComplete: () => void
}

export default function VocabularyCards({ vocabulary, onComplete }: VocabularyCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [completed, setCompleted] = useState<number[]>([])

  const handleNext = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setFlipped(false)
    }
  }

  const handleFlip = () => {
    setFlipped(!flipped)
    if (!flipped) {
      const newCompleted = [...completed]
      if (!newCompleted.includes(currentIndex)) {
        newCompleted.push(currentIndex)
        setCompleted(newCompleted)

        if (newCompleted.length === vocabulary.length) {
          onComplete()
        }
      }
    }
  }

  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(vocabulary[currentIndex].word)
    utterance.lang = "en-US"
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="icon" onClick={handlePrevious} disabled={currentIndex === 0}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {vocabulary.length}
        </span>
        <Button variant="outline" size="icon" onClick={handleNext} disabled={currentIndex === vocabulary.length - 1}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </Button>
      </div>

      <Card
        className={`h-64 cursor-pointer transition-all duration-500 ${flipped ? "bg-muted" : ""}`}
        onClick={handleFlip}
      >
        <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
          {!flipped ? (
            <div className="flex flex-col items-center">
              <h3 className="text-2xl font-bold mb-4">{vocabulary[currentIndex].word}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  speakWord()
                }}
              >
                <Volume2 className="h-5 w-5" />
                <span className="sr-only">Speak</span>
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-xl font-medium mb-4">{vocabulary[currentIndex].meaning}</p>
              <p className="text-sm italic">"{vocabulary[currentIndex].example}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-center">
        <p className="text-sm text-muted-foreground">
          {flipped ? "Nhấp để xem từ vựng" : "Nhấp để xem nghĩa và ví dụ"}
        </p>
      </div>
    </div>
  )
}

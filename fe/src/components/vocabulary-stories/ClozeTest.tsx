"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertCircle } from "lucide-react"

interface ClozeTestProps {
  story: string
  vocabulary: string[]
  onComplete: () => void
}

export default function ClozeTest({ story, vocabulary, onComplete }: ClozeTestProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isChecked, setIsChecked] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Create a cloze test by replacing vocabulary words with blanks
  const createClozeTest = () => {
    let modifiedStory = story
    const blanks: string[] = []

    vocabulary.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "i")
      if (modifiedStory.match(regex)) {
        blanks.push(word.toLowerCase())
        modifiedStory = modifiedStory.replace(regex, `[BLANK_${blanks.length - 1}]`)
      }
    })

    return { modifiedStory, blanks }
  }

  const { modifiedStory, blanks } = createClozeTest()

  // Focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleInputChange = (index: number, value: string) => {
    setAnswers({ ...answers, [index]: value })
  }

  const handleCheck = () => {
    setIsChecked(true)

    const allCorrect = blanks.every((word, index) => answers[index]?.toLowerCase().trim() === word.toLowerCase())

    if (allCorrect) {
      setIsCompleted(true)
      onComplete()
    }
  }

  const handleReset = () => {
    setAnswers({})
    setIsChecked(false)
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }

  const renderStoryWithBlanks = () => {
    const parts = modifiedStory.split(/(\[BLANK_\d+\])/)

    return parts.map((part, index) => {
      const match = part.match(/\[BLANK_(\d+)\]/)

      if (match) {
        const blankIndex = Number.parseInt(match[1])
        const isCorrect = isChecked && answers[blankIndex]?.toLowerCase().trim() === blanks[blankIndex].toLowerCase()
        const isIncorrect = isChecked && answers[blankIndex] && !isCorrect

        return (
          <span key={index} className="inline-block mx-1">
            <Input
              ref={(el) => {
                inputRefs.current[blankIndex] = el;
              }}
              value={answers[blankIndex] || ""}
              onChange={(e) => handleInputChange(blankIndex, e.target.value)}
              className={`w-32 inline-block ${
                isCorrect
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : isIncorrect
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : ""
              }`}
              disabled={isCompleted}
              tabIndex={blankIndex + 1}
              onKeyDown={(e) => {
                if (e.key === "Tab" && !e.shiftKey) {
                  e.preventDefault()
                  const nextInput = inputRefs.current[blankIndex + 1]
                  if (nextInput) nextInput.focus()
                } else if (e.key === "Tab" && e.shiftKey) {
                  e.preventDefault()
                  const prevInput = inputRefs.current[blankIndex - 1]
                  if (prevInput) prevInput.focus()
                }
              }}
            />
            {isChecked && (
              <span className="ml-1">
                {isCorrect ? (
                  <CheckCircle className="h-4 w-4 text-green-500 inline" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 inline" />
                )}
              </span>
            )}
          </span>
        )
      }

      return <span key={index}>{part}</span>
    })
  }

  return (
    <div>
      <div className="mb-6 p-4 bg-muted rounded-md">
        <p className="text-lg leading-relaxed">{renderStoryWithBlanks()}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {!isCompleted ? (
          <>
            <Button onClick={handleCheck} className="flex-1" disabled={Object.keys(answers).length !== blanks.length}>
              Kiểm Tra
            </Button>
            {isChecked && (
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Làm Lại
              </Button>
            )}
          </>
        ) : (
          <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
            <CheckCircle className="h-4 w-4 mr-2" />
            Hoàn Thành
          </Button>
        )}
      </div>

      {isChecked && !isCompleted && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
          <p>Có một số câu trả lời chưa chính xác. Vui lòng kiểm tra lại.</p>
        </div>
      )}
    </div>
  )
}

"use client"

import { useParams } from "react-router-dom"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Volume2, BookmarkPlus } from "lucide-react"

const vocabularyWords = [
  {
    id: 1,
    word: "Implement",
    partOfSpeech: "verb",
    definition: "Put (a decision, plan, agreement, etc.) into effect",
    example: "The company has implemented a new policy to reduce waste.",
    synonyms: ["execute", "apply", "carry out"],
    category: "Business",
  },
  {
    id: 2,
    word: "Negotiate",
    partOfSpeech: "verb",
    definition: "Try to reach an agreement or compromise by discussion",
    example: "They negotiated a new contract with the supplier.",
    synonyms: ["bargain", "discuss terms", "confer"],
    category: "Business",
  },
  {
    id: 3,
    word: "Facilitate",
    partOfSpeech: "verb",
    definition: "Make an action or process easy or easier",
    example: "The new software will facilitate the sharing of information.",
    synonyms: ["ease", "simplify", "assist"],
    category: "Business",
  },
  {
    id: 4,
    word: "Deadline",
    partOfSpeech: "noun",
    definition: "A time or date by which something must be completed",
    example: "We need to meet the deadline for submitting the proposal.",
    synonyms: ["time limit", "due date", "cutoff date"],
    category: "Business",
  },
  {
    id: 5,
    word: "Collaborate",
    partOfSpeech: "verb",
    definition: "Work jointly on an activity or project",
    example: "Our team collaborated with the marketing department on the campaign.",
    synonyms: ["cooperate", "work together", "team up"],
    category: "Business",
  },
]

export default function VocabularyPage() {
  const { level } = useParams()
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const currentWord = vocabularyWords[currentWordIndex]
  const [showDefinition, setShowDefinition] = useState(false)

  const handleNext = () => {
    if (currentWordIndex < vocabularyWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
      setShowDefinition(false)
    }
  }

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1)
      setShowDefinition(false)
    }
  }

  const playAudio = () => {
    // In a real app, this would play the pronunciation audio
    console.log(`Playing audio for: ${currentWord.word}`)
  }

  const saveToNotes = () => {
    // In a real app, this would save the word to user's notes
    console.log(`Saving to notes: ${currentWord.word}`)
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Vocabulary Practice</h1>
        <p className="text-muted-foreground">Level: {level?.replace("-", " to ")} - Learn essential TOEIC vocabulary</p>
      </div>

      <Tabs defaultValue="flashcards">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="wordlist">Word List</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">
                  Card {currentWordIndex + 1} of {vocabularyWords.length}
                </span>
                <Progress value={((currentWordIndex + 1) / vocabularyWords.length) * 100} className="w-1/3" />
                <Badge variant="outline">{currentWord.category}</Badge>
              </div>

              <Card
                className="w-full h-80 flex flex-col items-center justify-center cursor-pointer mb-6"
                onClick={() => setShowDefinition(!showDefinition)}
              >
                <CardContent className="flex flex-col items-center justify-center h-full w-full text-center p-6">
                  {!showDefinition ? (
                    <div className="space-y-4">
                      <h2 className="text-4xl font-bold">{currentWord.word}</h2>
                      <p className="text-muted-foreground italic">({currentWord.partOfSpeech})</p>
                      <p className="text-sm mt-8">Click to reveal definition</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-xl font-medium">Definition:</h3>
                      <p>{currentWord.definition}</p>
                      <h3 className="text-xl font-medium mt-4">Example:</h3>
                      <p className="italic">"{currentWord.example}"</p>
                      <div className="mt-4">
                        <h3 className="text-xl font-medium">Synonyms:</h3>
                        <p>{currentWord.synonyms.join(", ")}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handlePrevious} disabled={currentWordIndex === 0}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={playAudio}>
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={saveToNotes}>
                    <BookmarkPlus className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentWordIndex === vocabularyWords.length - 1}
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="wordlist">
          <div className="border rounded-lg divide-y">
            {vocabularyWords.map((word) => (
              <div key={word.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="sm:w-1/4">
                  <h3 className="font-bold">{word.word}</h3>
                  <p className="text-sm text-muted-foreground">({word.partOfSpeech})</p>
                </div>
                <div className="sm:w-2/4">
                  <p>{word.definition}</p>
                  <p className="text-sm italic mt-1">"{word.example}"</p>
                </div>
                <div className="sm:w-1/4 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => playAudio()}>
                    <Volume2 className="h-4 w-4 mr-2" /> Listen
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => saveToNotes()}>
                    <BookmarkPlus className="h-4 w-4 mr-2" /> Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quiz">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Vocabulary Quiz</h2>
            <p className="text-muted-foreground mb-8">Test your knowledge of the vocabulary words you've learned</p>
            <Button>Start Quiz</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

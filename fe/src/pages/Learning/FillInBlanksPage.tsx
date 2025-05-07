"use client"

import { useParams } from "react-router-dom"
import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, ArrowLeft } from "lucide-react"

const exercises = [
  {
    id: 1,
    title: "Business Email",
    difficulty: "Easy",
    text: `Dear Mr. Johnson,

I am writing to _____(1)_____ our meeting scheduled for next Thursday at 2 PM. Unfortunately, I need to _____(2)_____ it due to an unexpected conflict in my schedule.

Would it be _____(3)_____ to reschedule for Friday at the same time? I apologize for any _____(4)_____ this may cause.

I look forward to your _____(5)_____.

Best regards,
Sarah Williams`,
    answers: ["confirm", "reschedule", "possible", "inconvenience", "response"],
    hints: [
      "To verify or make certain",
      "To arrange for something to happen at a different time",
      "Able to be done or achieved",
      "Trouble or difficulty caused to someone",
      "A reply or reaction",
    ],
  },
  {
    id: 2,
    title: "Job Advertisement",
    difficulty: "Medium",
    text: `MARKETING SPECIALIST WANTED

We are seeking a highly _____(1)_____ marketing specialist to join our growing team. The ideal candidate will have at least three years of _____(2)_____ in digital marketing and social media management.

Key _____(3)_____ include creating marketing campaigns, analyzing market trends, and _____(4)_____ with the sales team to achieve company objectives.

We offer a competitive salary and excellent _____(5)_____ including health insurance and retirement plans.`,
    answers: ["motivated", "experience", "responsibilities", "collaborating", "benefits"],
    hints: [
      "Having a strong desire to succeed",
      "Knowledge or skill gained over time",
      "Duties or tasks that are part of a job",
      "Working together with others",
      "Advantages provided by an employer",
    ],
  },
]

export default function FillInBlanksPage() {
  const { level } = useParams()
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const currentExercise = exercises[currentExerciseIndex]

  const [userAnswers, setUserAnswers] = useState<string[]>(Array(currentExercise.answers.length).fill(""))
  const [showResults, setShowResults] = useState(false)
  const [showHints, setShowHints] = useState<boolean[]>(Array(currentExercise.answers.length).fill(false))

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers]
    newAnswers[index] = value
    setUserAnswers(newAnswers)
  }

  const toggleHint = (index: number) => {
    const newHints = [...showHints]
    newHints[index] = !newHints[index]
    setShowHints(newHints)
  }

  const checkAnswers = () => {
    setShowResults(true)
  }

  const resetExercise = () => {
    setUserAnswers(Array(currentExercise.answers.length).fill(""))
    setShowResults(false)
    setShowHints(Array(currentExercise.answers.length).fill(false))
  }

  const nextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      resetExercise()
    }
  }

  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
      resetExercise()
    }
  }

  const renderText = () => {
    const blankPattern = /_____\(\d+\)_____/g;
    let lastIndex = 0;
    const parts = [];
    const matches = [...currentExercise.text.matchAll(blankPattern)];
    
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const matchIndex = match.index as number;
      
      if (matchIndex > lastIndex) {
        parts.push(currentExercise.text.substring(lastIndex, matchIndex));
      }
      
      const answerIndex = i;
      parts.push(
        <span key={`blank-${i}`} className="inline-block mx-1">
          <Input
            value={userAnswers[answerIndex]}
            onChange={(e) => handleAnswerChange(answerIndex, e.target.value)}
            className={`w-32 inline-block ${
              showResults
                ? userAnswers[answerIndex].toLowerCase() === currentExercise.answers[answerIndex].toLowerCase()
                  ? "border-green-500"
                  : "border-red-500"
                : ""
            }`}
            disabled={showResults}
          />
          <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => toggleHint(answerIndex)}>
            <HelpCircle className="h-4 w-4" />
          </Button>
          {showHints[answerIndex] && (
            <div className="text-xs text-muted-foreground mt-1">Hint: {currentExercise.hints[answerIndex]}</div>
          )}
          {showResults && (
            <div className="flex items-center mt-1">
              {userAnswers[answerIndex].toLowerCase() === currentExercise.answers[answerIndex].toLowerCase() ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span
                className={
                  userAnswers[answerIndex].toLowerCase() === currentExercise.answers[answerIndex].toLowerCase()
                    ? "text-green-500 text-xs"
                    : "text-red-500 text-xs"
                }
              >
                {userAnswers[answerIndex].toLowerCase() === currentExercise.answers[answerIndex].toLowerCase()
                  ? "Correct"
                  : `Correct answer: ${currentExercise.answers[answerIndex]}`}
              </span>
            </div>
          )}
        </span>
      );
      
      lastIndex = matchIndex + match[0].length;
    }
    
    if (lastIndex < currentExercise.text.length) {
      parts.push(currentExercise.text.substring(lastIndex));
    }
    
    return parts;
  }

  useEffect(() => {
    setUserAnswers(Array(currentExercise.answers.length).fill(""));
    setShowHints(Array(currentExercise.answers.length).fill(false));
  }, [currentExercise]);

  const calculateScore = () => {
    let correct = 0
    for (let i = 0; i < currentExercise.answers.length; i++) {
      if (userAnswers[i].toLowerCase() === currentExercise.answers[i].toLowerCase()) {
        correct++
      }
    }
    return (correct / currentExercise.answers.length) * 100
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Fill in the Blanks</h1>
        <p className="text-muted-foreground">
          Level: {level?.replace("-", " to ")} - Complete the text with appropriate words
        </p>
      </div>

      <Tabs defaultValue="practice">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="tips">Tips & Strategies</TabsTrigger>
        </TabsList>

        <TabsContent value="practice">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{currentExercise.title}</CardTitle>
                  <CardDescription>Fill in the blanks with appropriate words</CardDescription>
                </div>
                <Badge variant="outline">{currentExercise.difficulty}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                  Exercise {currentExerciseIndex + 1} of {exercises.length}
                </span>
                <Progress value={((currentExerciseIndex + 1) / exercises.length) * 100} className="w-1/3" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap mb-6">{renderText()}</div>

              {showResults && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Results</h3>
                  <div className="flex items-center mb-2">
                    <span className="mr-2">Score:</span>
                    <Progress value={calculateScore()} className="w-1/3 mr-2" />
                    <span>{Math.round(calculateScore())}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {calculateScore() === 100
                      ? "Perfect! You got all answers correct."
                      : calculateScore() >= 80
                        ? "Great job! You're doing well."
                        : calculateScore() >= 60
                          ? "Good effort. Keep practicing to improve."
                          : "Keep practicing. You'll get better with time."}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevExercise} disabled={currentExerciseIndex === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>

              {!showResults ? (
                <Button onClick={checkAnswers}>Check Answers</Button>
              ) : (
                <Button onClick={resetExercise}>Try Again</Button>
              )}

              <Button variant="outline" onClick={nextExercise} disabled={currentExerciseIndex === exercises.length - 1}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tips">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Strategies for Fill-in-the-Blank Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-medium">1. Read the entire text first</h3>
                <p>
                  Before attempting to fill in any blanks, read the entire passage to understand the context and main
                  idea.
                </p>

                <h3 className="font-medium">2. Look for context clues</h3>
                <p>
                  Words and phrases surrounding the blank often provide hints about what word might fit. Pay attention
                  to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Adjectives and adverbs that might describe the missing word</li>
                  <li>Verbs that might indicate an action related to the missing word</li>
                  <li>Prepositions that often pair with certain words</li>
                </ul>

                <h3 className="font-medium">3. Consider grammar rules</h3>
                <p>
                  Determine what part of speech (noun, verb, adjective, etc.) is needed in the blank. This will narrow
                  down your options.
                </p>

                <h3 className="font-medium">4. Check for collocations</h3>
                <p>
                  Many words in English commonly appear together (e.g., "make a decision," "do homework"). Recognizing
                  these patterns can help you identify the correct word.
                </p>

                <h3 className="font-medium">5. Use process of elimination</h3>
                <p>
                  If you're given multiple choices, try each option in the blank and eliminate those that don't make
                  sense grammatically or contextually.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Word Categories in TOEIC Fill-in-the-Blank Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-medium">Business Vocabulary</h3>
                <p>Words related to meetings, negotiations, presentations, reports, and office communication.</p>

                <h3 className="font-medium">Linking Words</h3>
                <p>
                  Conjunctions and transitions that connect ideas: however, therefore, nevertheless, in addition, etc.
                </p>

                <h3 className="font-medium">Prepositions</h3>
                <p>
                  Words like in, on, at, by, with, for, etc. that show relationships between elements in a sentence.
                </p>

                <h3 className="font-medium">Phrasal Verbs</h3>
                <p>
                  Combinations of verbs and particles that have specific meanings: set up, look into, carry out, etc.
                </p>

                <h3 className="font-medium">Collocations</h3>
                <p>Word partnerships that naturally occur together: make an appointment, reach a conclusion, etc.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

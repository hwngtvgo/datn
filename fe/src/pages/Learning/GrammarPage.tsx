"use client"

import { useParams } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { BookmarkPlus, CheckCircle2, XCircle } from "lucide-react"

const grammarRules = [
  {
    id: 1,
    title: "Present Simple vs Present Continuous",
    description: "Learn when to use the present simple and present continuous tenses",
    content: `
      <h3>Present Simple</h3>
      <p>We use the present simple to talk about:</p>
      <ul>
        <li>Things that are always true: <em>Water boils at 100 degrees Celsius.</em></li>
        <li>Habits and routines: <em>I usually wake up at 7 AM.</em></li>
        <li>Permanent situations: <em>She works for a multinational company.</em></li>
      </ul>
      
      <h3>Present Continuous</h3>
      <p>We use the present continuous to talk about:</p>
      <ul>
        <li>Actions happening now: <em>I am writing an email to a client.</em></li>
        <li>Temporary situations: <em>She is staying with her parents until she finds an apartment.</em></li>
        <li>Future arrangements: <em>We are meeting the suppliers next week.</em></li>
      </ul>
    `,
  },
  {
    id: 2,
    title: "Past Simple vs Past Continuous",
    description: "Understand the difference between past simple and past continuous",
    content: `
      <h3>Past Simple</h3>
      <p>We use the past simple to talk about:</p>
      <ul>
        <li>Completed actions in the past: <em>I finished the report yesterday.</em></li>
        <li>Series of completed actions: <em>I woke up, had breakfast, and went to work.</em></li>
        <li>Past habits: <em>She always arrived early at the office.</em></li>
      </ul>
      
      <h3>Past Continuous</h3>
      <p>We use the past continuous to talk about:</p>
      <ul>
        <li>Actions in progress at a specific time in the past: <em>At 3 PM yesterday, I was attending a meeting.</em></li>
        <li>Background actions: <em>While I was working on the project, my colleague called.</em></li>
        <li>Parallel actions: <em>She was taking notes while the manager was presenting.</em></li>
      </ul>
    `,
  },
  {
    id: 3,
    title: "Modal Verbs",
    description: "Learn how to use modal verbs for different functions",
    content: `
      <h3>Common Modal Verbs</h3>
      <p>Modal verbs are used to express:</p>
      <ul>
        <li><strong>Can/Could</strong>: Ability, possibility, permission
          <br><em>I can speak three languages. / Could you help me with this?</em>
        </li>
        <li><strong>Must/Have to</strong>: Obligation, necessity
          <br><em>You must submit the report by Friday. / I have to attend the conference.</em>
        </li>
        <li><strong>Should/Ought to</strong>: Advice, recommendation
          <br><em>You should prepare for the presentation. / We ought to inform the client.</em>
        </li>
        <li><strong>May/Might</strong>: Possibility, permission
          <br><em>The project may be delayed. / Might I make a suggestion?</em>
        </li>
        <li><strong>Will/Would</strong>: Future, requests, offers
          <br><em>I will send you the documents. / Would you like some coffee?</em>
        </li>
      </ul>
    `,
  },
]

const quizQuestions = [
  {
    id: 1,
    question: "The company _____ a new product next month.",
    options: ["launch", "launches", "is launching", "are launching"],
    correctAnswer: 2,
  },
  {
    id: 2,
    question: "She _____ in the marketing department since 2018.",
    options: ["works", "is working", "has worked", "has been working"],
    correctAnswer: 2,
  },
  {
    id: 3,
    question: "By the time the CEO arrived, the meeting _____ for an hour.",
    options: ["started", "was starting", "had started", "had been going on"],
    correctAnswer: 3,
  },
  {
    id: 4,
    question: "You _____ check your emails regularly when you're on a business trip.",
    options: ["must", "should", "can", "might"],
    correctAnswer: 1,
  },
  {
    id: 5,
    question: "If we _____ the deadline, we'll lose the contract.",
    options: ["miss", "will miss", "would miss", "are missing"],
    correctAnswer: 0,
  },
]

export default function GrammarPage() {
  const { level } = useParams()

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Grammar Practice</h1>
        <p className="text-muted-foreground">
          Level: {level?.replace("-", " to ")} - Master essential grammar rules for the TOEIC test
        </p>
      </div>

      <Tabs defaultValue="rules">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="rules">Grammar Rules</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <div className="grid gap-6">
            {grammarRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <CardTitle>{rule.title}</CardTitle>
                  <CardDescription>{rule.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div dangerouslySetInnerHTML={{ __html: rule.content }} />
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm">
                      <BookmarkPlus className="h-4 w-4 mr-2" /> Save to Notes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="exercises">
          <Card>
            <CardHeader>
              <CardTitle>Fill in the Blanks</CardTitle>
              <CardDescription>Choose the correct form of the verb to complete each sentence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="font-medium">1. The marketing team _____ on a new campaign at the moment.</p>
                  <RadioGroup defaultValue="is working">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="works" id="q1-1" />
                      <Label htmlFor="q1-1">works</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="is working" id="q1-2" />
                      <Label htmlFor="q1-2">is working</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="has worked" id="q1-3" />
                      <Label htmlFor="q1-3">has worked</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="worked" id="q1-4" />
                      <Label htmlFor="q1-4">worked</Label>
                    </div>
                  </RadioGroup>
                  <div className="flex items-center text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span className="text-sm">Correct! We use present continuous for actions happening now.</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <p className="font-medium">2. Last year, our company _____ its market share by 15%.</p>
                  <RadioGroup defaultValue="increased">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="increase" id="q2-1" />
                      <Label htmlFor="q2-1">increase</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="increases" id="q2-2" />
                      <Label htmlFor="q2-2">increases</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="increased" id="q2-3" />
                      <Label htmlFor="q2-3">increased</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="is increasing" id="q2-4" />
                      <Label htmlFor="q2-4">is increasing</Label>
                    </div>
                  </RadioGroup>
                  <div className="flex items-center text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span className="text-sm">Correct! We use past simple for completed actions in the past.</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <p className="font-medium">3. By the end of this quarter, we _____ all our targets.</p>
                  <RadioGroup defaultValue="will have met">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="will meet" id="q3-1" />
                      <Label htmlFor="q3-1">will meet</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="are meeting" id="q3-2" />
                      <Label htmlFor="q3-2">are meeting</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="will have met" id="q3-3" />
                      <Label htmlFor="q3-3">will have met</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="have met" id="q3-4" />
                      <Label htmlFor="q3-4">have met</Label>
                    </div>
                  </RadioGroup>
                  <div className="flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Incorrect. The correct answer is "will have met" (future perfect).</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="outline">Previous</Button>
                <Button>Next</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz">
          <Card>
            <CardHeader>
              <CardTitle>Grammar Quiz</CardTitle>
              <CardDescription>Test your knowledge of grammar rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {quizQuestions.map((question, index) => (
                  <div key={question.id} className="space-y-4">
                    <p className="font-medium">
                      {index + 1}. {question.question}
                    </p>
                    <RadioGroup>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`q${question.id}-${optionIndex}`} />
                          <Label htmlFor={`q${question.id}-${optionIndex}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {index < quizQuestions.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <Button>Submit Answers</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

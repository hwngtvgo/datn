"use client"

import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"

const listeningExercises = [
  {
    id: 1,
    title: "Business Meeting",
    description: "Listen to a conversation between colleagues discussing a project",
    audioUrl: "/audio/business-meeting.mp3",
    transcript:
      "Woman: Good morning, John. Do you have a minute to discuss the Johnson project?\nMan: Sure, Sarah. What's on your mind?\nWoman: I'm concerned about the timeline. The client wants the first phase completed by the end of the month, but I think we need more time.\nMan: I see. Have you spoken with the project manager about this?\nWoman: Not yet. I wanted to get your input first since you've worked with this client before.\nMan: I appreciate that. In my experience, they're usually flexible if we provide a good reason for the delay. Let's schedule a call with them tomorrow to discuss our concerns.\nWoman: That sounds like a good plan. I'll prepare some talking points for the call.\nMan: Great. I'll also review the project schedule to see if there are any tasks we can expedite.",
    questions: [
      {
        id: 101,
        question: "What is the woman concerned about?",
        options: ["The project budget", "The project timeline", "The client's expectations", "The project manager"],
        correctAnswer: 1,
      },
      {
        id: 102,
        question: "Why does the woman want to talk to the man?",
        options: [
          "He is the project manager",
          "He has worked with the client before",
          "He is responsible for the timeline",
          "He needs to approve changes",
        ],
        correctAnswer: 1,
      },
      {
        id: 103,
        question: "What does the man suggest they do?",
        options: [
          "Extend the timeline without telling the client",
          "Hire more staff for the project",
          "Schedule a call with the client",
          "Speak with the project manager",
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: 2,
    title: "Product Announcement",
    description: "Listen to a company announcement about a new product",
    audioUrl: "/audio/product-announcement.mp3",
    transcript:
      "Good afternoon, everyone. I'm excited to announce that next month, we'll be launching our newest product, the XZ500 series. This innovative line of office equipment represents a significant advancement in both efficiency and sustainability. The XZ500 uses 30% less energy than our previous models while delivering 20% faster performance. We've also incorporated recycled materials in the manufacturing process, reducing our carbon footprint. Pre-orders will begin next week, and we expect high demand based on the positive feedback from our focus groups. The marketing team has prepared detailed information packets that will be distributed to all sales representatives by the end of the day. Please review these materials carefully so you can effectively communicate the benefits to our clients. Thank you for your attention, and I look forward to a successful product launch.",
    questions: [
      {
        id: 201,
        question: "When will the new product be launched?",
        options: ["This week", "Next week", "Next month", "End of the day"],
        correctAnswer: 2,
      },
      {
        id: 202,
        question: "What are two benefits of the new product mentioned in the announcement?",
        options: [
          "Lower cost and faster performance",
          "Energy efficiency and faster performance",
          "Sustainability and lower cost",
          "Recycled materials and longer lifespan",
        ],
        correctAnswer: 1,
      },
      {
        id: 203,
        question: "When will pre-orders begin?",
        options: ["Immediately", "Next week", "Next month", "After the launch"],
        correctAnswer: 1,
      },
    ],
  },
]

export default function ListeningPage() {
  const { level } = useParams()
  const [currentExercise, setCurrentExercise] = useState(listeningExercises[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(100)
  const [volume, setVolume] = useState(80)
  const [showTranscript, setShowTranscript] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})

  useEffect(() => {
    const audio = new Audio(currentExercise.audioUrl)
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration)
    })
    return () => {
      audio.remove()
    }
  }, [currentExercise])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // In a real app, this would control the audio playback
  }

  const handleTimeChange = (value: number[]) => {
    setCurrentTime(value[0])
    // In a real app, this would seek the audio to the specified time
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    // In a real app, this would adjust the audio volume
  }

  const handleExerciseChange = (index: number) => {
    setCurrentExercise(listeningExercises[index])
    setCurrentTime(0)
    setIsPlaying(false)
  }

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex,
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Listening Practice</h1>
        <p className="text-muted-foreground">
          Level: {level?.replace("-", " to ")} - Improve your listening comprehension skills
        </p>
      </div>

      <Tabs defaultValue="exercises">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="exercises">Listening Exercises</TabsTrigger>
          <TabsTrigger value="dictation">Dictation Practice</TabsTrigger>
          <TabsTrigger value="tips">Listening Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises">
          <Card>
            <CardHeader>
              <CardTitle>{currentExercise.title}</CardTitle>
              <CardDescription>{currentExercise.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentTime(0)}>
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handlePlayPause}>
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" disabled>
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider value={[volume]} max={100} step={1} className="w-24" onValueChange={handleVolumeChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <Slider value={[currentTime]} max={duration} step={1} onValueChange={handleTimeChange} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowTranscript(!showTranscript)}>
                  {showTranscript ? "Hide Transcript" : "Show Transcript"}
                </Button>
              </div>

              {showTranscript && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <pre className="whitespace-pre-wrap font-sans text-sm">{currentExercise.transcript}</pre>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-6">
                <h3 className="text-lg font-medium">Comprehension Questions</h3>
                {currentExercise.questions.map((question, index) => (
                  <div key={question.id} className="space-y-4">
                    <p className="font-medium">
                      {index + 1}. {question.question}
                    </p>
                    <RadioGroup
                      value={selectedAnswers[question.id]?.toString()}
                      onValueChange={(value) => handleAnswerSelect(question.id, Number.parseInt(value))}
                    >
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={optionIndex.toString()} id={`q${question.id}-${optionIndex}`} />
                          <Label htmlFor={`q${question.id}-${optionIndex}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {index < currentExercise.questions.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" disabled={currentExercise.id === listeningExercises[0].id}>
                Previous Exercise
              </Button>
              <Button>Check Answers</Button>
              <Button
                variant="outline"
                disabled={currentExercise.id === listeningExercises[listeningExercises.length - 1].id}
              >
                Next Exercise
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="dictation">
          <Card>
            <CardHeader>
              <CardTitle>Dictation Practice</CardTitle>
              <CardDescription>Listen to the audio and type what you hear</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-center gap-4 py-8">
                  <Button variant="outline" size="icon">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button size="icon" className="h-12 w-12">
                    <Play className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Click play to listen to the audio. You can replay it up to 3 times.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dictation">Type what you hear:</Label>
                <textarea
                  id="dictation"
                  className="w-full min-h-[150px] p-4 border rounded-md"
                  placeholder="Type the text you hear in the audio..."
                ></textarea>
              </div>

              <Button className="w-full">Check Answer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Effective Listening Strategies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-medium">1. Focus on Keywords</h3>
                <p>
                  Listen for nouns, verbs, and adjectives that carry the main meaning of the sentence. These keywords
                  will help you understand the main idea even if you miss some details.
                </p>

                <h3 className="font-medium">2. Anticipate Content</h3>
                <p>
                  Before listening, think about what kind of information you might hear based on the topic. This mental
                  preparation helps your brain process the information more efficiently.
                </p>

                <h3 className="font-medium">3. Take Notes</h3>
                <p>
                  Jot down key points as you listen. Don't try to write everything—focus on main ideas, numbers, names,
                  and important details.
                </p>

                <h3 className="font-medium">4. Listen for Transitions</h3>
                <p>
                  Words like "however," "therefore," "in addition," and "on the other hand" signal important shifts in
                  the conversation or presentation.
                </p>

                <h3 className="font-medium">5. Practice Regularly</h3>
                <p>
                  Listen to English audio content daily, even if just for 10-15 minutes. Podcasts, news broadcasts, and
                  TED talks are excellent resources.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common TOEIC Listening Question Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-medium">Photographs</h3>
                <p>
                  You'll see a photograph and hear four statements. Choose the statement that best describes the
                  photograph.
                </p>

                <h3 className="font-medium">Question-Response</h3>
                <p>
                  You'll hear a question and three possible responses. Select the most appropriate response to the
                  question.
                </p>

                <h3 className="font-medium">Conversations</h3>
                <p>
                  You'll hear a conversation between two people followed by multiple-choice questions. The questions
                  test your understanding of main ideas, details, and implied meanings.
                </p>

                <h3 className="font-medium">Talks</h3>
                <p>
                  You'll hear a short talk (announcement, advertisement, etc.) followed by multiple-choice questions
                  about the content.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

const practiceTests = [
  {
    id: "1",
    title: "Full Practice Test 1",
    description: "Complete TOEIC test with listening and reading sections",
    questions: 200,
    duration: 120,
    difficulty: "Medium",
    popular: true,
  },
  {
    id: "2",
    title: "Listening Practice Test",
    description: "Focus on improving your listening skills",
    questions: 100,
    duration: 45,
    difficulty: "Easy",
  },
  {
    id: "3",
    title: "Reading Practice Test",
    description: "Enhance your reading comprehension",
    questions: 100,
    duration: 75,
    difficulty: "Medium",
  },
  {
    id: "4",
    title: "Full Practice Test 2",
    description: "Another complete TOEIC test with all sections",
    questions: 200,
    duration: 120,
    difficulty: "Hard",
  },
  {
    id: "5",
    title: "Quick Practice Test",
    description: "Short test focusing on key TOEIC concepts",
    questions: 50,
    duration: 30,
    difficulty: "Easy",
    popular: true,
  },
  {
    id: "6",
    title: "Advanced Practice Test",
    description: "Challenging test for those aiming for high scores",
    questions: 200,
    duration: 120,
    difficulty: "Hard",
  },
]

export default function PracticeTests() {
  return (
    <div className="container py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">TOEIC Practice Tests</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Prepare for your TOEIC exam with our comprehensive practice tests. Track your progress and improve your score.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {practiceTests.map((test) => (
          <Card key={test.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{test.title}</CardTitle>
                {test.popular && <Badge className="bg-primary">Popular</Badge>}
              </div>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Questions:</span>
                  <span className="font-medium">{test.questions}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{test.duration} min</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span className="font-medium">{test.difficulty}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to={`/practice-tests/${test.id}`}>Start Test</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { BookOpen, Headphones, PenTool, BookText } from "lucide-react"

const levels = [
  {
    id: "0-300",
    title: "Beginner (0-300)",
    description: "Perfect for those just starting their TOEIC journey",
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    color: "bg-blue-50 dark:bg-blue-950",
  },
  {
    id: "300-600",
    title: "Intermediate (300-600)",
    description: "For learners who have some experience with English",
    icon: <Headphones className="h-8 w-8 text-primary" />,
    color: "bg-green-50 dark:bg-green-950",
  },
  {
    id: "600-800",
    title: "Advanced (600-800)",
    description: "For those aiming for higher scores and fluency",
    icon: <PenTool className="h-8 w-8 text-primary" />,
    color: "bg-purple-50 dark:bg-purple-950",
  },
  {
    id: "800-990",
    title: "Expert (800-990)",
    description: "Master advanced concepts for top TOEIC scores",
    icon: <BookText className="h-8 w-8 text-primary" />,
    color: "bg-amber-50 dark:bg-amber-950",
  },
]

export default function Learning() {
  return (
    <div className="container py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">TOEIC Learning Center</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose your level and start improving your TOEIC skills with our comprehensive learning materials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {levels.map((level) => (
          <Card key={level.id} className={`${level.color} border-none`}>
            <CardHeader>
              <div className="flex items-center gap-4">
                {level.icon}
                <div>
                  <CardTitle>{level.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{level.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Vocabulary building exercises</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Grammar practice tailored to your level</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Listening comprehension activities</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Interactive fill-in-the-blanks exercises</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to={`/learning/${level.id}`}>Start Learning</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

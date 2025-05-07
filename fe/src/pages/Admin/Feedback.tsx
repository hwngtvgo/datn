"use client"

import { useState } from "react"

const feedback = [
  {
    id: "F1001",
    user: "John Doe",
    email: "john.doe@example.com",
    type: "suggestion",
    subject: "More listening exercises",
    message: "I would love to see more listening exercises focused on business conversations.",
    rating: 4,
    status: "open",
    date: "2023-03-15",
  },
  {
    id: "F1002",
    user: "Jane Smith",
    email: "jane.smith@example.com",
    type: "bug",
    subject: "Audio not working in Chrome",
    message: "I'm experiencing issues with the audio playback in the listening exercises when using Chrome browser.",
    rating: 2,
    status: "in-progress",
    date: "2023-03-14",
  },
  {
    id: "F1003",
    user: "Robert Johnson",
    email: "robert.johnson@example.com",
    type: "praise",
    subject: "Great vocabulary section",
    message:
      "The vocabulary section is excellent! I've learned so many new words that have helped me in my TOEIC exam.",
    rating: 5,
    status: "closed",
    date: "2023-03-12",
  },
  {
    id: "F1004",
    user: "Emily Davis",
    email: "emily.davis@example.com",
    type: "suggestion",
    subject: "Add more practice tests",
    message: "It would be great if you could add more full practice tests. The current ones are very helpful.",
    rating: 4,
    status: "open",
    date: "2023-03-10",
  },
  {
    id: "F1005",
    user: "Michael Wilson",
    email: "michael.wilson@example.com",
    type: "bug",
    subject: "Can't save progress",
    message: "I'm unable to save my progress in the reading section. It keeps resetting when I return to the page.",
    rating: 2,
    status: "in-progress",
    date: "2023-03-09",
  },
  {
    id: "F1006",
    user: "Sarah Brown",
    email: "sarah.brown@example.com",
    type: "praise",
    subject: "Excellent grammar explanations",
    message: "The grammar explanations are so clear and easy to understand. Thank you for making it so accessible!",
    rating: 5,
    status: "closed",
    date: "2023-03-08",
  },
  {
    id: "F1007",
    user: "David Miller",
    email: "david.miller@example.com",
    type: "suggestion",
    subject: "Mobile app suggestion",
    message: "Have you considered developing a mobile app? It would be great to practice on the go.",
    rating: 4,
    status: "open",
    date: "2023-03-07",
  },
  {
    id: "F1008",
    user: "Jennifer Taylor",
    email: "jennifer.taylor@example.com",
    type: "bug",
    subject: "Score calculation error",
    message:
      "I think there's an error in how the scores are calculated in the practice tests. My total doesn't match the individual section scores.",
    rating: 3,
    status: "open",
    date: "2023-03-06",
  },
]

export default function AdminFeedback() {
  const [searchTerm, setSearchTerm] = useState("")
  
  const filteredFeedback = feedback.filter((item) => 
    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      {/* Add your JSX here */}
    </div>
  )
}

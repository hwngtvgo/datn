"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, X } from "lucide-react"

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Xin chào! Tôi là trợ lý TOEIC AI. Bạn cần giúp đỡ gì về việc luyện thi TOEIC?",
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    // Add user message
    setMessages([...messages, { role: "user", content: input }])

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Cảm ơn câu hỏi của bạn. Đây là một phản hồi mẫu từ trợ lý TOEIC AI. Trong phiên bản thực tế, tôi sẽ cung cấp thông tin hữu ích về TOEIC.",
        },
      ])
    }, 1000)

    setInput("")
  }

  return (
    <>
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg">
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Open chat</span>
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-80 md:w-96 shadow-xl z-50">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <h3 className="font-semibold">Trợ Lý TOEIC AI</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </CardHeader>
          <CardContent className="p-4 h-80 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <form
              className="flex w-full items-center space-x-2"
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
            >
              <Input placeholder="Nhập câu hỏi của bạn..." value={input} onChange={(e) => setInput(e.target.value)} />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}

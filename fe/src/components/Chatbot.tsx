"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, X, Loader2 } from "lucide-react"
import axios from "axios"
import { API_URL } from "@/config/constants"

// Interface cho tin nhắn
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Gọi API thông qua backend
async function callChatAPI(message: string): Promise<string> {
  try {
    console.log('Đang gửi yêu cầu đến backend...');
    
    const response = await axios.post(
      `${API_URL}/ai/chat`,
      {
        message: message,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.content) {
      console.log('Nhận được phản hồi từ backend');
      return response.data.content;
    } else {
      console.error('Phản hồi từ backend không hợp lệ:', response.data);
      throw new Error('Phản hồi từ server không hợp lệ');
    }
  } catch (error: any) {
    console.error('Lỗi khi gọi backend:', error);
    
    // Hiển thị chi tiết lỗi để debug
    if (error.response) {
      // Lỗi từ server với phản hồi
      console.error('Lỗi từ backend:', {
        status: error.response.status,
        data: error.response.data
      });
      
      if (error.response.status === 401) {
        throw new Error('Không có quyền truy cập');
      } else if (error.response.status === 429) {
        throw new Error('Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau');
      } else if (error.response.status === 500) {
        throw new Error('Lỗi server nội bộ');
      }
    } else if (error.request) {
      // Không nhận được phản hồi
      console.error('Không nhận được phản hồi từ backend:', error.request);
      throw new Error('Không thể kết nối với server');
    }
    
    throw new Error('Không thể kết nối với server. Vui lòng thử lại sau.');
  }
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Xin chào! Tôi là trợ lý TOEIC AI. Tôi có thể giúp bạn trả lời các câu hỏi về TOEIC và tiếng Anh. Bạn cần giúp đỡ gì?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Hàm để cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    // Thêm tin nhắn người dùng vào danh sách
    const userMessage: ChatMessage = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Gọi chat API thông qua backend
      const responseText = await callChatAPI(input);
      
      // Thêm phản hồi vào danh sách tin nhắn
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: responseText,
        },
      ]);
    } catch (error: any) {
      console.error("Lỗi khi tạo câu trả lời:", error);
      
      // Thêm tin nhắn lỗi
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: error.message || "Xin lỗi, đã xảy ra lỗi khi kết nối với server. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg">
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Mở trợ lý AI</span>
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-80 md:w-96 shadow-xl z-50">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">Trợ Lý TOEIC AI</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-sm">
                GPT-3.5
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Đóng trợ lý AI</span>
            </Button>
          </CardHeader>
          <CardContent className="p-4 h-80 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </CardContent>
          <CardFooter className="p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex w-full space-x-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi về TOEIC..."
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Gửi</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}

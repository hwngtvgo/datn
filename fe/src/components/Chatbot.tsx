"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, X, Loader2 } from "lucide-react"
import axios from "axios"

// Interface cho tin nhắn
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// API Keys từ biến môi trường
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Thử tạo backend proxy để tránh lỗi CORS
async function callOpenAIWithProxy(messages: ChatMessage[]): Promise<string> {
  try {
    // Kiểm tra API key
    if (!OPENAI_API_KEY) {
      console.error('API key không tồn tại hoặc không hợp lệ');
      throw new Error('API key không hợp lệ');
    }

    console.log('Đang gửi yêu cầu thông qua proxy...');
    
    // Cố gắng gọi API thông qua backend proxy nếu có
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.post(
        `${apiUrl}/ai/chat`,
        {
          messages: messages,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.content) {
        return response.data.content;
      }
    } catch (proxyError) {
      console.log('Không thể sử dụng proxy, thử kết nối trực tiếp...');
    }

    // Gọi API trực tiếp nếu không có proxy hoặc proxy lỗi
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      console.log('Nhận được phản hồi từ OpenAI API');
      return response.data.choices[0].message.content;
    } else {
      console.error('Phản hồi từ API không hợp lệ:', response.data);
      throw new Error('Phản hồi từ server không hợp lệ');
    }
  } catch (error: any) {
    console.error('Lỗi khi gọi server:', error);
    
    // Hiển thị chi tiết lỗi để debug
    if (error.response) {
      // Lỗi từ server với phản hồi
      console.error('Lỗi từ server:', {
        status: error.response.status,
        data: error.response.data
      });
      
      if (error.response.status === 401) {
        throw new Error('API key không hợp lệ hoặc đã hết hạn');
      } else if (error.response.status === 429) {
        throw new Error('Đã vượt quá giới hạn yêu cầu API. Vui lòng thử lại sau');
      } else if (error.response.status === 403) {
        throw new Error('Không có quyền truy cập API');
      } else if (error.response.status === 500) {
        throw new Error('Lỗi server nội bộ');
      }
    } else if (error.request) {
      // Không nhận được phản hồi
      console.error('Không nhận được phản hồi từ server:', error.request);
      throw new Error('Không nhận được phản hồi từ server');
    }
    
    throw new Error('Không thể kết nối với server. Vui lòng thử lại sau.');
  }
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "system",
      content: "Bạn là trợ lý học tập TOEIC thông minh. Bạn cung cấp thông tin chính xác, ngắn gọn và hữu ích về việc học TOEIC và tiếng Anh. Luôn trả lời bằng tiếng Việt trừ khi được yêu cầu sử dụng tiếng Anh."
    },
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
      // Chuẩn bị tin nhắn cho API (bao gồm tin nhắn hệ thống và lịch sử trò chuyện)
      const historyMessages = messages.filter(msg => msg.role !== "system");
      const messagesToSend: ChatMessage[] = [
        messages[0], // Tin nhắn system đầu tiên
        ...historyMessages,
        userMessage
      ];
      
      // Gọi OpenAI API thông qua proxy hoặc trực tiếp
      const responseText = await callOpenAIWithProxy(messagesToSend);
      
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
              {messages.filter(msg => msg.role !== "system").map((message, index) => (
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
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-4 py-2 bg-muted flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang trả lời...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
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
              <Input 
                placeholder="Nhập câu hỏi của bạn..." 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Gửi</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, X, Loader2 } from "lucide-react"
import axios from "axios"

// Kho câu trả lời cục bộ - mô hình miễn phí
const localResponses = {
  // Các câu chào và giới thiệu
  "you nghĩa là gì": "Từ \"you\" trong tiếng Anh có nghĩa là \"bạn\" hoặc \"các bạn\" trong tiếng Việt. Đây là một đại từ nhân xưng ngôi thứ hai, dùng để chỉ người mà bạn đang nói chuyện cùng.",
  "tôi vừa hỏi gì": "Bạn vừa hỏi về câu hỏi trước đó của bạn. Tôi có thể thấy trong lịch sử trò chuyện của chúng ta.",
  "1+1 dịch sang tiếng anh": "\"1+1\" dịch sang tiếng Anh là \"one plus one\" hoặc \"one and one\".",
  "hello": "Xin chào! Tôi là trợ lý TOEIC AI (phiên bản cục bộ). Bạn cần giúp đỡ gì về việc luyện thi TOEIC?",
  "hi": "Chào bạn! Tôi có thể giúp gì cho bạn về việc luyện thi TOEIC?",
  "xin chào": "Chào bạn! Rất vui được hỗ trợ bạn. Bạn có câu hỏi gì về TOEIC không?",
  
  // Câu hỏi về TOEIC
  "toeic là gì": "TOEIC (Test of English for International Communication) là bài kiểm tra đánh giá khả năng sử dụng tiếng Anh trong môi trường giao tiếp quốc tế và công việc. Bài thi gồm hai phần chính: Listening (nghe) và Reading (đọc), mỗi phần có điểm tối đa là 495, tổng điểm tối đa là 990.",
  "part 1 toeic là gì": "Part 1 trong bài thi TOEIC là phần thi nghe đầu tiên, trong đó bạn sẽ xem các bức ảnh và nghe 4 câu mô tả. Nhiệm vụ của bạn là chọn câu mô tả đúng nhất về bức ảnh. Phần này kiểm tra khả năng hiểu ngôn ngữ nói và liên kết nội dung nghe được với hình ảnh.",
  "part 2 toeic là gì": "Part 2 trong bài thi TOEIC là phần Nghe - Hỏi & Đáp. Bạn sẽ nghe một câu hỏi hoặc một câu nói và sau đó nghe 3 câu trả lời hoặc phản hồi. Nhiệm vụ của bạn là chọn câu trả lời hoặc phản hồi phù hợp nhất. Phần này kiểm tra khả năng hiểu câu hỏi và phản hồi phù hợp trong giao tiếp.",
  "part 3 toeic là gì": "Part 3 trong bài thi TOEIC là phần Nghe hội thoại. Bạn sẽ nghe các đoạn hội thoại giữa 2 hoặc 3 người và trả lời 3 câu hỏi cho mỗi đoạn hội thoại. Phần này kiểm tra khả năng hiểu các cuộc hội thoại trong môi trường công việc và xã hội.",
  "part 4 toeic là gì": "Part 4 trong bài thi TOEIC là phần Nghe bài nói ngắn (short talks). Bạn sẽ nghe các bài nói ngắn như thông báo, quảng cáo, tin tức... và trả lời 3 câu hỏi cho mỗi bài nói. Phần này kiểm tra khả năng hiểu thông tin chi tiết và chính từ các bài nói dài hơn.",
  "part 5 toeic là gì": "Part 5 trong bài thi TOEIC là phần Đọc hiểu với các câu đơn lẻ có chỗ trống. Bạn sẽ đọc các câu không hoàn chỉnh và chọn từ hoặc cụm từ thích hợp để điền vào chỗ trống. Phần này kiểm tra kiến thức về ngữ pháp và từ vựng.",
  "part 6 toeic là gì": "Part 6 trong bài thi TOEIC là phần Đọc hiểu đoạn văn ngắn có chỗ trống. Bạn sẽ đọc các đoạn văn như email, thông báo... có 3-4 chỗ trống và chọn từ hoặc cụm từ thích hợp để điền vào mỗi chỗ trống. Phần này kiểm tra khả năng hiểu ngữ cảnh và cấu trúc văn bản.",
  "part 7 toeic là gì": "Part 7 trong bài thi TOEIC là phần Đọc hiểu đoạn văn. Đây là phần cuối và dài nhất của bài thi, gồm các đoạn văn đơn và đoạn văn kép (multiple passages). Bạn sẽ đọc các tài liệu như email, báo cáo, quảng cáo... và trả lời các câu hỏi về nội dung. Phần này kiểm tra khả năng hiểu thông tin chi tiết, suy luận và kết nối thông tin giữa các văn bản.",
  
  // Các câu hỏi về từ vựng
  "luyện từ vựng toeic": "Để luyện từ vựng TOEIC hiệu quả, bạn nên: 1) Học từ vựng theo chủ đề (như kinh doanh, văn phòng, du lịch), 2) Sử dụng flashcards, 3) Đọc tài liệu tiếng Anh thương mại, 4) Nghe podcast và xem video về kinh doanh, 5) Luyện tập với các bài tập từ vựng TOEIC.",
  "từ vựng toeic phổ biến": "Một số từ vựng TOEIC phổ biến bao gồm: accommodate (cung cấp chỗ ở), acquire (mua lại), adhere to (tuân thủ), adjacent (liền kề), allocate (phân bổ), amendment (sửa đổi), appraisal (đánh giá), authorize (ủy quyền), comply with (tuân thủ), coordinate (phối hợp), deadline (hạn chót), enhance (nâng cao), implement (thực hiện), mandatory (bắt buộc), personnel (nhân sự), invoice (hóa đơn), negotiate (đàm phán), optimize (tối ưu hóa), procedure (thủ tục), regulations (quy định)...",
  
  // Các câu hỏi về ngữ pháp
  "ngữ pháp toeic": "Ngữ pháp TOEIC tập trung vào các điểm ngữ pháp thông dụng trong tiếng Anh như: thì (tenses), động từ khiếm khuyết (modal verbs), câu bị động (passive voice), câu điều kiện (conditionals), liên từ (conjunctions), giới từ (prepositions), và các cấu trúc câu phức tạp. Để cải thiện ngữ pháp, bạn nên học lý thuyết và làm nhiều bài tập ứng dụng.",
  "thì trong tiếng anh": "Tiếng Anh có 12 thì chính: 1) Hiện tại đơn (Simple Present), 2) Hiện tại tiếp diễn (Present Continuous), 3) Hiện tại hoàn thành (Present Perfect), 4) Hiện tại hoàn thành tiếp diễn (Present Perfect Continuous), 5) Quá khứ đơn (Simple Past), 6) Quá khứ tiếp diễn (Past Continuous), 7) Quá khứ hoàn thành (Past Perfect), 8) Quá khứ hoàn thành tiếp diễn (Past Perfect Continuous), 9) Tương lai đơn (Simple Future), 10) Tương lai tiếp diễn (Future Continuous), 11) Tương lai hoàn thành (Future Perfect), 12) Tương lai hoàn thành tiếp diễn (Future Perfect Continuous).",
  
  // Mẹo thi TOEIC
  "mẹo thi toeic": "Một số mẹo khi thi TOEIC: 1) Quản lý thời gian hiệu quả, 2) Luyện tập với đề thi thật, 3) Đọc kỹ hướng dẫn trước khi làm bài, 4) Đối với phần nghe, đọc trước các câu hỏi để nắm được thông tin cần lắng nghe, 5) Trong phần đọc, scan nhanh đoạn văn để tìm thông tin quan trọng, 6) Học từ vựng theo chủ đề thường xuất hiện trong TOEIC, 7) Không để trống câu trả lời, hãy đoán nếu không biết.",
  "cách đạt 900 toeic": "Để đạt 900+ điểm TOEIC, bạn cần: 1) Lập kế hoạch học tập dài hạn (ít nhất 3-6 tháng), 2) Làm ít nhất 10-15 đề thi đầy đủ, 3) Mở rộng vốn từ vựng lên 6000-8000 từ, 4) Thành thạo tất cả các cấu trúc ngữ pháp, 5) Luyện nghe với nhiều accent khác nhau, 6) Phân tích lỗi sai và học từ chúng, 7) Học cách suy luận và phân tích các đoạn văn dài, 8) Tập trung vào kỹ năng đọc nhanh và hiểu chính xác.",
  
  // Ứng dụng và tài liệu học TOEIC
  "tài liệu học toeic": "Các tài liệu học TOEIC hiệu quả: 1) ETS TOEIC (sách chính thức), 2) Longman Preparation Series for the TOEIC Test, 3) Barron's TOEIC, 4) TOEIC Practice Exam by ETS, 5) Target TOEIC, 6) TOEIC Analyst 2nd Edition, 7) Very Easy TOEIC, 8) Website như Testden.com và ToeicTest.org.",
  "app học toeic": "Các ứng dụng học TOEIC tốt nhất: 1) ETS TOEIC Official Learning, 2) ELSA Speak (luyện phát âm), 3) TOEIC Test Pro, 4) TOEIC Vocabulary Builder, 5) TOEIC Practice (4T), 6) TOEIC Preparation, 7) English Grammar Test, 8) Memrise hoặc Anki để học từ vựng.",
  
  // Câu hỏi chung về tiếng Anh
  "cách học tiếng anh hiệu quả": "Để học tiếng Anh hiệu quả: 1) Xác định mục tiêu rõ ràng, 2) Học từ vựng trong ngữ cảnh, 3) Luyện nghe và nói thường xuyên, 4) Đọc sách/báo tiếng Anh, 5) Xem phim/nghe nhạc bằng tiếng Anh, 6) Tìm bạn học cùng hoặc partner để luyện nói, 7) Sử dụng app học tiếng Anh, 8) Học 30-60 phút mỗi ngày nhưng đều đặn, 9) Không sợ mắc lỗi và luôn tìm cách cải thiện.",
  
  // Câu trả lời chung khi không biết
  "default": "Xin lỗi, tôi là phiên bản chatbot cục bộ với kiến thức hạn chế. Tôi chỉ có thể trả lời một số câu hỏi cơ bản về TOEIC. Bạn có thể hỏi tôi về các phần thi TOEIC, mẹo luyện thi hoặc từ vựng phổ biến."
};

// Hàm tìm câu trả lời cục bộ phù hợp nhất
const findBestLocalResponse = (query: string): string => {
  // Chuẩn hóa câu hỏi để so sánh dễ dàng hơn
  const normalizedQuery = query.toLowerCase().trim();
  
  // Tìm câu trả lời chính xác
  if (localResponses[normalizedQuery as keyof typeof localResponses]) {
    return localResponses[normalizedQuery as keyof typeof localResponses];
  }
  
  // Tìm câu trả lời dựa trên từ khóa
  for (const [key, value] of Object.entries(localResponses)) {
    // Tìm các từ khóa phổ biến theo ưu tiên
    if (key === normalizedQuery) {
      return value;
    }
    
    // Tìm theo từ khóa TOEIC và các phần thi
    if (normalizedQuery.includes("toeic") && key.includes("toeic")) {
      if ((normalizedQuery.includes("part") && key.includes("part")) || 
          (normalizedQuery.includes("là gì") && key.includes("là gì"))) {
        return value;
      }
    }
    
    // Tìm theo từ vựng và ngữ pháp
    if (normalizedQuery.includes("từ vựng") && key.includes("từ vựng")) {
      return value;
    }
    if (normalizedQuery.includes("ngữ pháp") && key.includes("ngữ pháp")) {
      return value;
    }
    
    // Tìm theo mẹo thi
    if ((normalizedQuery.includes("mẹo") || normalizedQuery.includes("cách")) && 
        (key.includes("mẹo") || key.includes("cách"))) {
      return value;
    }
    
    // Tìm theo nghĩa của từ
    if (normalizedQuery.includes("nghĩa") && key.includes("nghĩa")) {
      return value;
    }
  }
  
  // Trả về câu trả lời mặc định nếu không tìm thấy
  return localResponses["default"];
};

// Tạo câu trả lời thông minh hơn dựa trên đầu vào
const generateSmartResponse = (query: string): string => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Xử lý câu chào hỏi
  if (normalizedQuery.includes("chào") || normalizedQuery.includes("hello") || normalizedQuery.includes("hi")) {
    return "Chào bạn! Tôi là trợ lý TOEIC AI phiên bản cục bộ. Tôi có thể giúp bạn với các thông tin cơ bản về TOEIC. Bạn muốn biết về điều gì?";
  }
  
  // Xử lý câu hỏi về TOEIC
  if (normalizedQuery.includes("toeic là gì")) {
    return localResponses["toeic là gì"];
  }
  
  // Xử lý câu hỏi về phần thi
  for (let i = 1; i <= 7; i++) {
    if (normalizedQuery.includes(`part ${i}`) || normalizedQuery.includes(`phần ${i}`)) {
      const key = `part ${i} toeic là gì` as keyof typeof localResponses;
      return localResponses[key];
    }
  }
  
  // Tìm câu trả lời cục bộ
  const localResponse = findBestLocalResponse(query);
  
  // Nếu không tìm thấy câu trả lời phù hợp, trả về câu trả lời mặc định
  return localResponse;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Xin chào! Tôi là trợ lý TOEIC AI phiên bản cục bộ. Tôi có thể giúp bạn trả lời các câu hỏi cơ bản về TOEIC và tiếng Anh. Bạn cần giúp đỡ gì?",
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
    const userMessage = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Mô phỏng độ trễ để tạo cảm giác xử lý
    setTimeout(() => {
      try {
        // Tạo câu trả lời thông minh dựa trên đầu vào
        const response = generateSmartResponse(input);
        
        // Thêm phản hồi vào danh sách tin nhắn
        setMessages(prev => [
        ...prev,
        {
          role: "assistant",
            content: response,
          },
        ]);
      } catch (error) {
        console.error("Lỗi khi tạo câu trả lời:", error);
        
        // Thêm tin nhắn lỗi
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại hoặc hỏi một câu hỏi khác.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // Độ trễ giả lập 0.5 giây
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
            <div className="flex items-center space-x-2">
            <h3 className="font-semibold">Trợ Lý TOEIC AI</h3>
              <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-sm">
                Cục bộ
              </span>
            </div>
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
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}

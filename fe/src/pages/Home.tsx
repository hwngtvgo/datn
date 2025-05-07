import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Chatbot from "@/components/Chatbot"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">TOEIC BK</h1>
            <p className="text-xl mb-8">
              Nền tảng luyện thi TOEIC toàn diện với các bài tập, đề thi thực tế và trợ lý AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-white text-blue-700 hover:bg-gray-100">
                <Link to="/practice-tests">Luyện Đề TOEIC</Link>
              </Button>
              <div className="relative group">
                <Button size="lg" asChild variant="outline" className="border-white text-blue-700 hover:bg-blue-700">
                  <Link to="/learning">Ôn Luyện</Link>
                </Button>
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link to="/learning/0-300" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Chặng 0-300+
                    </Link>
                    <Link to="/learning/300-600" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Chặng 300-600+
                    </Link>
                    <Link to="/learning/600-800" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Chặng 600-800+
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tính Năng Nổi Bật</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Luyện Đề TOEIC</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Trải nghiệm các đề thi TOEIC thực tế với đầy đủ phần Nghe và Đọc, giúp bạn làm quen với cấu trúc đề
                  thi.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ôn Luyện Theo Trình Độ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Chọn chặng luyện thi phù hợp với trình độ của bạn: 0-300+, 300-600+, hoặc 600-800+ để học hiệu quả.
                </p>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to="/learning/0-300">0-300+</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to="/learning/300-600">300-600+</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to="/learning/600-800">600-800+</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Trợ Lý TOEIC AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Chatbot thông minh hỗ trợ trả lời câu hỏi, giải đáp thắc mắc và cung cấp mẹo học tập hiệu quả.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Tests Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Đề Thi Mới Nhất</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((test) => (
              <Card key={test} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Đề Thi TOEIC #{test}</CardTitle>
                  <CardDescription>Cập nhật: {new Date().toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Đề thi TOEIC mới nhất với cấu trúc chuẩn, giúp bạn đánh giá khả năng hiện tại.</p>
                  <Button asChild>
                    <Link to={`/practice-tests/${test}`}>Bắt Đầu Ngay</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/practice-tests">Xem Tất Cả Đề Thi</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}

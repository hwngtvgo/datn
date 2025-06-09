import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="container flex flex-col items-center justify-center space-y-12 px-4 py-16 text-center">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold tracking-tighter text-primary">404</h1>
          <h2 className="text-3xl font-bold tracking-tight">Không tìm thấy trang</h2>
          <p className="text-muted-foreground text-xl max-w-md mx-auto mt-4">
            Trang bạn đang tìm kiếm có thể đã bị xóa, di chuyển hoặc không tồn tại.
          </p>
        </div>

        <div className="relative w-full max-w-lg">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-[blob_7s_infinite]"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-[blob_7s_infinite_2s]"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-[blob_7s_infinite_4s]"></div>
          <div className="relative">
            <svg
              className="w-64 h-64 mx-auto text-muted-foreground/40"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              <span>Quay về trang chủ</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại trang trước</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, BookOpen, FileText, ChevronDown, LogOut, History } from "lucide-react"                                       
import { ModeToggle } from "./ModeToggle.tsx"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export default function Header() {
  const [isLearningOpen, setIsLearningOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công!", {
        duration: 2000,
        position: "top-center"
      });
      navigate("/");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-accent/50">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:text-primary/80 transition-colors">
                  TOEIC BK
                </Link>
                <Link to="/practice-tests" className="flex items-center gap-2 text-lg hover:text-primary transition-colors">
                  <FileText className="h-5 w-5" />
                  Luyện Đề TOEIC
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsLearningOpen(!isLearningOpen)}
                    className="flex items-center gap-2 text-lg w-full justify-between hover:text-primary transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Ôn Luyện
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isLearningOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isLearningOpen && (
                    <div className="pl-7 mt-2 flex flex-col gap-2 animate-in slide-in-from-top-2">
                      <Link to="/learning/0-300" className="text-sm py-1 hover:text-primary transition-colors">
                        Chặng 0-300+
                      </Link>
                      <Link to="/learning/300-600" className="text-sm py-1 hover:text-primary transition-colors">
                        Chặng 300-600+
                      </Link>
                      <Link to="/learning/600-800" className="text-sm py-1 hover:text-primary transition-colors">
                        Chặng 600-800+
                      </Link>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 mt-auto">
                  {user ? (
                    <>
                      <Link to="/account">
                        <Button variant="outline" className="w-full hover:bg-accent/50 transition-colors">
                          <User className="h-4 w-4 mr-2" />
                          Tài khoản
                        </Button>
                      </Link>
                      <Link to="/test-history">
                        <Button variant="outline" className="w-full hover:bg-accent/50 transition-colors">
                          <History className="h-4 w-4 mr-2" />
                          Lịch sử bài thi
                        </Button>
                      </Link>
                      <Button 
                        onClick={handleLogout}
                        variant="destructive" 
                        className="w-full hover:bg-destructive/90 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Đăng xuất
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login">
                        <Button variant="outline" className="w-full hover:bg-accent/50 transition-colors">
                          Đăng Nhập
                        </Button>
                      </Link>
                      <Link to="/register">
                        <Button className="w-full hover:bg-primary/90 transition-colors">Đăng Ký</Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:text-primary/80 transition-colors">
            TOEIC BK
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/practice-tests" className="text-sm font-medium hover:text-primary transition-colors">
              Luyện Đề TOEIC
            </Link>
            <div className="relative group">
              <Link to="/learning" className="text-sm font-medium flex items-center gap-1 hover:text-primary transition-colors">
                Ôn Luyện
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
              </Link>
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-background ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <Link to="/learning/0-300" className="block px-4 py-2 text-sm hover:bg-accent/50 transition-colors">
                    Chặng 0-300+
                  </Link>
                  <Link to="/learning/300-600" className="block px-4 py-2 text-sm hover:bg-accent/50 transition-colors">
                    Chặng 300-600+
                  </Link>
                  <Link to="/learning/600-800" className="block px-4 py-2 text-sm hover:bg-accent/50 transition-colors">
                    Chặng 600-800+
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/account">
                  <Button variant="ghost" size="sm" className="hover:bg-accent/50 transition-colors">
                    <User className="h-4 w-4 mr-2" />
                    {user.username}
                  </Button>
                </Link>
                <Link to="/test-history">
                  <Button variant="ghost" size="sm" className="hover:bg-accent/50 transition-colors">
                    <History className="h-4 w-4 mr-2" />
                    Lịch sử
                  </Button>
                </Link>
                <Button 
                  onClick={handleLogout}
                  variant="destructive" 
                  size="sm"
                  className="hover:bg-destructive/90 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hover:bg-accent/50 transition-colors">
                    Đăng Nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="hover:bg-primary/90 transition-colors">Đăng Ký</Button>
                </Link>
              </>
            )}
          </div>
          <Link to="/account" className="flex md:hidden">
            <Button variant="ghost" size="icon" className="hover:bg-accent/50 transition-colors">
              <User className="h-5 w-5" />
              <span className="sr-only">Tài khoản</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

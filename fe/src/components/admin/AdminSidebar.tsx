"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  DollarSign,
  MessageSquare,
  Menu,
  X,
  LogOut,
  HelpCircle,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"

const sidebarItems = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/admin",
  },
  {
    title: "Users",
    icon: <Users className="h-5 w-5" />,
    href: "/admin/users",
  },
  {
    title: "Courses",
    icon: <BookOpen className="h-5 w-5" />,
    href: "/admin/courses",
  },
  {
    title: "Exams",
    icon: <FileText className="h-5 w-5" />,
    href: "/admin/exams",
  },
  {
    title: "Questions",
    icon: <HelpCircle className="h-5 w-5" />,
    href: "/admin/toeic-questions",
  },
  {
    title: "Finance",
    icon: <DollarSign className="h-5 w-5" />,
    href: "/admin/finance",
  },
  {
    title: "Feedback",
    icon: <MessageSquare className="h-5 w-5" />,
    href: "/admin/feedback",
  },
]

const learningItems = [
  {
    title: "Vocabulary",
    href: "/admin/learning/vocabulary",
  },
  {
    title: "Grammar",
    href: "/admin/learning/grammar",
  },
  {
    title: "Listening",
    href: "/admin/learning/listening",
  },
  {
    title: "Fill in Blanks",
    href: "/admin/learning/fill-in-blanks",
  },
  {
    title: "Vocabulary Stories",
    href: "/admin/learning/vocabulary-stories",
  },
]

export default function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [learningExpanded, setLearningExpanded] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error)
    }
  }

  return (
    <>
      <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 md:hidden" onClick={toggleSidebar}>
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      <div
        className={cn("fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden", isOpen ? "block" : "hidden")}
        onClick={toggleSidebar}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-card border-r transition-transform md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1 rounded">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl">TOEIC Admin</span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      location.pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                </li>
              ))}

              <li>
                <button
                  onClick={() => setLearningExpanded(!learningExpanded)}
                  className="flex items-center justify-between w-full rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5" />
                    Learning Content
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-4 w-4 transition-transform ${learningExpanded ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {learningExpanded && (
                  <ul className="mt-2 space-y-1 pl-10">
                    {learningItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            location.pathname === item.href ? "bg-primary/10 text-primary" : "hover:bg-muted",
                          )}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>
          </nav>

          <div className="p-4 border-t">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
            
            <Button variant="link" className="w-full justify-start gap-2 mt-2" asChild>
              <Link to="/">
                Quay lại trang người dùng
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { useAuth, AuthProvider } from './contexts/AuthContext'
import authService from './services/authService'
// Layouts
import Layout from "./components/Layout"
import AdminLayout from "./pages/Admin/AdminLayout"

// User pages
import HomePage from "./pages/Home"
import PracticeTests from "./pages/PracticeTests"
import Learning from "./pages/Learning"
import LevelPage from "./pages/Learning/LevelPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Account from "./pages/Account"
import TestPage from "./pages/PracticeTests/TestPage"
import VocabularyPage from "./pages/Learning/VocabularyPage"
import GrammarPage from "./pages/Learning/GrammarPage"
import ListeningPage from "./pages/Learning/ListeningPage"
import FillInBlanksPage from "./pages/Learning/FillInBlanksPage"
import VocabularyStoriesPage from "./pages/Learning/VocabularyStoriesPage"
import VocabularyStoryDetail from "./pages/Learning/VocabularyStoryDetail"

// Admin pages
import AdminDashboard from "./pages/Admin/Dashboard"
import AdminUsers from "./pages/Admin/Users"
import AdminCourses from "./pages/Admin/Courses"
import AdminToeicExams from "./pages/Admin/ToeicExams"
import AdminToeicQuestions from "./pages/Admin/ToeicQuestions"
import AdminFinance from "./pages/Admin/Finance"
import AdminFeedback from "./pages/Admin/Feedback"
import ModalExamples from "./pages/Admin/ModalExamples"


// Components and utilities
import { Toaster } from 'sonner'
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import authModule from "@/modules/auth"

// Route bảo vệ cho người dùng đã đăng nhập
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, checkAuth } = useAuth()
  const [checking, setChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const location = useLocation()

  // Kiểm tra trạng thái đăng nhập với server khi truy cập trang hoặc refresh
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setChecking(true)
        // Nếu đã có user trong context thì không cần kiểm tra với server
        if (user) {
          setIsAuthenticated(true)
          setChecking(false)
          return
        }
        
        // Kiểm tra xác thực với server
        const authenticated = await checkAuth()
        setIsAuthenticated(authenticated)
      } catch (error) {
        console.error('Lỗi khi kiểm tra xác thực:', error)
        setIsAuthenticated(false)
      } finally {
        setChecking(false)
      }
    }

    verifyAuth()
  }, [user, checkAuth, location.pathname])

  // Hiển thị trạng thái loading khi đang kiểm tra
  if (loading || checking) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  }

  // Chuyển hướng đến trang đăng nhập nếu chưa xác thực
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

// Route bảo vệ riêng cho admin
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, checkAuth } = useAuth()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 1 // Giảm số lần thử để tránh quá nhiều requests
  const timeoutRef = useRef<number | null>(null)
  const navigate = useNavigate()

  // Kiểm tra quyền admin 
  useEffect(() => {
    let isMounted = true;
    
    // Đặt timeout để thoát khỏi trạng thái checking nếu quá lâu
    timeoutRef.current = window.setTimeout(() => {
      if (checking && isMounted) {
        console.log("Timeout: Quá thời gian kiểm tra quyền admin trong Route");
        if (isMounted) {
          setChecking(false);
          setIsAdmin(false);
        }
      }
    }, 5000); // 5 giây timeout
    
    // Kiểm tra quyền
    const checkIsAdmin = () => {
      if (!user) {
        console.log("Không có thông tin người dùng, chuyển hướng đến trang đăng nhập");
        setIsAdmin(false);
        setChecking(false);
        return;
      }
      
      // Kiểm tra quyền admin từ localStorage
      const isAdminUser = authService.isAdmin();
      console.log("Kiểm tra quyền admin từ localStorage:", isAdminUser);
      
      if (isAdminUser) {
        setIsAdmin(true);
        setChecking(false);
        return;
      }
      
      // Nếu không phải admin theo localStorage và còn lượt thử
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
      } else {
        // Hết lượt thử
        setIsAdmin(false);
        setChecking(false);
      }
    };
    
    // Hàm kiểm tra và refresh thông tin
    const verifyAdmin = async () => {
      try {
        // Nếu không có user, không làm gì cả
        if (!user) {
          if (isMounted) {
            setIsAdmin(false);
            setChecking(false);
          }
          return;
        }
        
        // Kiểm tra quyền admin nhanh từ cache/localStorage
        const isAdminUser = authService.isAdmin();
        if (isAdminUser) {
          console.log('Xác nhận quyền admin từ cache');
          if (isMounted) {
            setIsAdmin(true);
            setChecking(false);
          }
          return;
        }
        
        // Nếu không phải admin theo cache, kiểm tra lại từ server
        if (retryCount < MAX_RETRIES) {
          console.log(`Thử lại kiểm tra quyền admin (${retryCount + 1}/${MAX_RETRIES})`);
          
          try {
            await checkAuth();
            // Kiểm tra lại sau khi refresh thông tin
            const newAdminCheck = authService.isAdmin();
            
            if (isMounted) {
              setIsAdmin(newAdminCheck);
              setChecking(false);
            }
          } catch (error) {
            console.error("Lỗi khi kiểm tra lại quyền admin:", error);
            if (isMounted) {
              setIsAdmin(false);
              setChecking(false);
            }
          }
        } else {
          // Hết lượt thử
          if (isMounted) {
            setIsAdmin(false);
            setChecking(false);
          }
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra quyền admin:', error);
        if (isMounted) {
          setIsAdmin(false);
          setChecking(false);
        }
      }
    };

    // Nếu đang trong trạng thái loading/checking, thực hiện kiểm tra
    if (checking && !loading && user) {
      checkIsAdmin();
      verifyAdmin();
    } else if (!user || loading) {
      // Nếu không có user hoặc đang loading, kết thúc checking
      setChecking(false);
      setIsAdmin(false);
    }
    
    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [user, checkAuth, retryCount, loading, checking]);

  // Hiển thị trạng thái loading khi đang kiểm tra
  if (loading || checking) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <div className="ml-4 text-blue-500 font-semibold">Đang kiểm tra quyền admin...</div>
    </div>
  }

  // Chuyển hướng đến trang chủ nếu không có quyền admin
  return isAdmin ? <>{children}</> : <Navigate to="/" />
}

function App() {
  // Khởi tạo module auth khi ứng dụng khởi động
  useEffect(() => {
    // Không cần thực hiện gì, chỉ cần import module là đủ
    console.log("Đã khởi tạo auth module:", authModule.isLoggedIn() ? "Đã đăng nhập" : "Chưa đăng nhập");
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <ToastContainer />
      <Routes>
          {/* Trang người dùng */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="practice-tests" element={<PracticeTests />} />
          <Route path="practice-tests/:id" element={<TestPage />} />
          <Route path="learning" element={<Learning />} />
            
          <Route path="learning/:level" element={<LevelPage />} />
          <Route path="learning/:level/vocabulary" element={<VocabularyPage />} />
          <Route path="learning/:level/grammar" element={<GrammarPage />} />
          <Route path="learning/:level/listening" element={<ListeningPage />} />
          <Route path="learning/:level/fill-in-blanks" element={<FillInBlanksPage />} />
          <Route path="learning/:level/vocabulary-stories" element={<VocabularyStoriesPage />} />
          <Route path="learning/:level/vocabulary-stories/:id" element={<VocabularyStoryDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="account" element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            } />
        </Route>

          {/* Trang quản trị */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCourses />} />                                                     
          <Route path="toeic-exams" element={<AdminToeicExams />} />
          <Route path="toeic-questions" element={<AdminToeicQuestions />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="modal-examples" element={<ModalExamples />} />
          <Route path="feedback" element={<AdminFeedback />} />
          {/* Redirects for old URLs */}
          <Route path="exams" element={<Navigate to="/admin/toeic-exams" replace />} />
          <Route path="questions" element={<Navigate to="/admin/toeic-questions" replace />} />
          </Route>
      </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App

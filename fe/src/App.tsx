import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
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
import TestHistory from "@/pages/User/TestHistory"
import TestResultDetail from "@/pages/User/TestResultDetail"
import TestStatistics from "@/pages/User/TestStatistics"
import PracticeExamsPage from "./pages/Learning/PracticeExamsPage"

// Admin pages
import AdminDashboard from "./pages/Admin/Dashboard"
import AdminUsers from "./pages/Admin/Users"
import AdminToeicExams from "./pages/Admin/ToeicExams"
import AdminToeicQuestions from "./pages/Admin/ToeicQuestions"

// Components and utilities
import { Toaster } from 'sonner'
import authModule from "@/modules/auth"
import NotFound from "@/pages/NotFound"

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
  const { user, loading, checkAuth } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sử dụng sessionStorage để theo dõi số lần thử truy cập
  useEffect(() => {
    // Kiểm tra nhanh từ localStorage trước khi làm bất cứ điều gì
    const quickAdminCheck = authService.isAdmin();
    if (quickAdminCheck) {
      console.log('Xác nhận nhanh quyền admin từ localStorage');
      setIsAdmin(true);
      setChecking(false);
      return;
    }
    
    // Hàm để lấy và tăng số lần thử truy cập
    const getAndIncrementAttemptCount = () => {
      const key = 'admin_route_attempt_count';
      const count = parseInt(sessionStorage.getItem(key) || '0', 10);
      const newCount = count + 1;
      sessionStorage.setItem(key, newCount.toString());
      return newCount;
    };
    
    // Hàm để reset số lần thử
    const resetAttemptCount = () => {
      sessionStorage.removeItem('admin_route_attempt_count');
    };
    
    // Kiểm tra số lần thử truy cập
    const attemptCount = getAndIncrementAttemptCount();
    
    // Nếu đã thử quá 3 lần, chuyển hướng về trang chủ và reset bộ đếm
    if (attemptCount > 3) {
      console.log('Đã thử truy cập trang admin quá nhiều lần, chuyển về trang chủ');
      resetAttemptCount();
      navigate('/', { replace: true });
      return;
    }
    
    // Hàm kiểm tra quyền admin
    const verifyAdmin = async () => {
      try {
        // Nếu không có user, chuyển đến trang đăng nhập
        if (!user) {
          setChecking(false);
          setIsAdmin(false);
          resetAttemptCount(); // Reset bộ đếm khi chuyển đến trang đăng nhập
          navigate('/login', { replace: true, state: { from: location } });
          return;
        }
        
        // Refresh token và kiểm tra lại
        await checkAuth();
        
        // Kiểm tra lại sau khi refresh
        const isAdminAfterRefresh = authService.isAdmin();
        
        if (isAdminAfterRefresh) {
          // Nếu là admin sau khi refresh, reset bộ đếm và cho phép truy cập
          resetAttemptCount();
          setIsAdmin(true);
          setChecking(false);
        } else {
          // Nếu vẫn không phải admin, chuyển về trang chủ
          setIsAdmin(false);
          setChecking(false);
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra quyền admin:', error);
        setIsAdmin(false);
        setChecking(false);
        navigate('/', { replace: true });
      }
    };
    
    if (!loading) {
      verifyAdmin();
    }
    
    // Cleanup function
    return () => {
      // Không làm gì trong cleanup
    };
  }, [user, loading, checkAuth, navigate, location]);
  
  // Hiển thị trạng thái loading khi đang kiểm tra
  if (loading || checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <div className="ml-4 text-blue-500 font-semibold">Đang kiểm tra quyền admin...</div>
      </div>
    );
  }
  
  // Render children chỉ khi là admin
  return isAdmin ? <>{children}</> : null;
};

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
          <Route path="learning/:level/practice-exams" element={<PracticeExamsPage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="account" element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            } />
          <Route path="/test-history" element={<PrivateRoute><TestHistory /></PrivateRoute>} />
          <Route path="/test-result/:resultId" element={<PrivateRoute><TestResultDetail /></PrivateRoute>} />
          <Route path="/test-statistics" element={<PrivateRoute><TestStatistics /></PrivateRoute>} />
        </Route>

          {/* Trang quản trị */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="tests" element={<AdminToeicExams />} />
          <Route path="toeic-questions" element={<AdminToeicQuestions />} />
          <Route path="exams" element={<Navigate to="/admin/tests" replace />} />
          <Route path="toeic-exams" element={<Navigate to="/admin/tests" replace />} />
          <Route path="questions" element={<Navigate to="/admin/toeic-questions" replace />} />
          </Route>
          <Route path="*" element={<NotFound />} />
      </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App

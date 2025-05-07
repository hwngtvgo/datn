import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import AdminSidebar from '@/components/AdminSidebar';
import authService from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, checkAuth } = useAuth();
  const [checking, setChecking] = useState(true);
  const [retries, setRetries] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const MAX_RETRIES = 2;
  
  // Đảm bảo focus chuyển về main content khi route thay đổi
  useEffect(() => {
    if (mainContentRef.current) {
      // Đặt tabIndex để có thể focus vào element này
      mainContentRef.current.tabIndex = -1;
      mainContentRef.current.focus();
    }
  }, [location.pathname]);
  
  useEffect(() => {
    let isMounted = true;
    
    // Đặt timeout để thoát khỏi trạng thái checking nếu quá lâu
    timeoutRef.current = window.setTimeout(() => {
      if (isMounted && checking) {
        console.log("Timeout: Quá thời gian kiểm tra quyền admin");
        if (isMounted) {
          setChecking(false);
          toast.error("Không thể xác minh quyền admin trong thời gian cho phép");
        }
      }
    }, 5000); // 5 giây timeout
    
    // Hàm kiểm tra quyền admin
    const verifyAdmin = async () => {
      try {
        // Kiểm tra nhanh nếu không có user
        if (!user) {
          console.log("Không có thông tin người dùng, chuyển hướng đến trang đăng nhập");
          if (isMounted) {
            setChecking(false);
            toast.error("Vui lòng đăng nhập để truy cập trang quản trị");
            navigate('/login');
          }
          return;
        }
        
        // Kiểm tra quyền admin
        const isAdmin = authService.isAdmin();
        console.log("Kết quả kiểm tra admin:", isAdmin);
        
        if (isAdmin) {
          // Nếu là admin, thoát khỏi trạng thái checking
          if (isMounted) {
            setChecking(false);
          }
          return;
        }
        
        // Thử lấy lại thông tin người dùng từ server
        if (retries < MAX_RETRIES) {
          try {
            await checkAuth();
            
            // Kiểm tra lại sau khi refresh
            const isAdminAfterRefresh = authService.isAdmin();
            
            if (isAdminAfterRefresh) {
              if (isMounted) {
                setChecking(false);
              }
              return;
            }
            
            // Nếu vẫn không phải admin
            if (isMounted) {
              setRetries(r => r + 1);
              
              // Nếu đã thử đủ số lần, chuyển hướng về trang chủ
              if (retries >= MAX_RETRIES - 1) {
                setChecking(false);
                toast.error("Bạn không có quyền truy cập trang quản trị");
                navigate('/');
              }
            }
          } catch (error) {
            console.error("Lỗi khi refresh thông tin người dùng:", error);
            if (isMounted) {
              setChecking(false);
              toast.error("Có lỗi xảy ra khi kiểm tra quyền admin");
              navigate('/');
            }
          }
        } else {
          // Hết số lần thử
          if (isMounted) {
            setChecking(false);
            toast.error("Bạn không có quyền truy cập trang quản trị");
            navigate('/');
          }
        }
      } catch (error) {
        console.error("Lỗi không xác định khi kiểm tra quyền admin:", error);
        if (isMounted) {
          setChecking(false);
          toast.error("Có lỗi xảy ra, vui lòng thử lại sau");
          navigate('/');
        }
      }
    };
    
    // Chỉ kiểm tra nếu đang ở trạng thái checking
    if (checking) {
      verifyAdmin();
    }
    
    return () => {
      isMounted = false;
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [navigate, checkAuth, user, retries, checking]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <div className="ml-4 text-blue-500 font-semibold">Đang kiểm tra quyền admin...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div 
        ref={mainContentRef} 
        className="flex-1 overflow-auto focus:outline-none"
        // Không sử dụng aria-hidden để tránh lỗi accessibility
      >
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default AdminLayout; 
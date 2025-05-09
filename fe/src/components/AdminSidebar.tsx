import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Users,
  FileText,
  MessageCircle,
  Settings,
  LogOut,
  HelpCircle,
  BookOpen,
  Home,
  DollarSign,
  Layers,
  Book,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/admin',
      icon: <BarChart className="w-5 h-5" />,
    },
    {
      title: 'Người dùng',
      path: '/admin/users',
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: 'Đề thi TOEIC',
      path: '/admin/toeic-exams',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      title: 'Câu hỏi TOEIC',
      path: '/admin/toeic-questions',
      icon: <HelpCircle className="w-5 h-5" />,
    },
    {
      title: 'Câu hỏi độc lập',
      path: '/admin/standalone-questions',
      icon: <Book className="w-5 h-5" />,
    },
    {
      title: 'Khóa học',
      path: '/admin/courses',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      title: 'Modal Examples',
      path: '/admin/modal-examples',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      title: 'Phản hồi',
      path: '/admin/feedback',
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      title: 'Tài chính',
      path: '/admin/finance',
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      title: 'Cài đặt',
      path: '/admin/settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-slate-800 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold">TOEIC Admin</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center px-4 py-2 rounded-md transition-colors',
                isActive(item.path)
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              )}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          ))}

          <Link
            to="/"
            className="flex items-center px-4 py-2 mt-6 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5 mr-3" />
            <span>Về trang chính</span>
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 rounded-md text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar; 
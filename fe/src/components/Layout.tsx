import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/authService';
import Footer from './Footer';

export function Layout() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Kiểm tra quyền admin
  const isAdmin = user && (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN' || 
                          (user.roles && Array.isArray(user.roles) && 
                           (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ADMIN'))));
  
  console.log('Kiểm tra admin trong Layout:', isAdmin, user);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Nút Trang quản trị cho admin */}
      {isAdmin && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Link to="/admin">
              Trang quản trị
            </Link>
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Layout;

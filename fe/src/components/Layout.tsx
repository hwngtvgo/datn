import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/authService';
import Footer from './Footer';
import Chatbot from './Chatbot';

export function Layout() {
  const location = useLocation();
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      
      {/* Chỉ hiển thị Chatbot khi người dùng đã đăng nhập */}
      {user && <Chatbot />}
    </div>
  );
}

export default Layout;

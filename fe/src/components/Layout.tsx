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
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;

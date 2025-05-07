"use client"

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import authService from '../services/authService';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [isResetComplete, setIsResetComplete] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Lấy token từ URL query string
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');

    if (!tokenParam) {
      toast.error('Token không hợp lệ hoặc đã hết hạn');
      setTokenValid(false);
      setIsValidating(false);
      return;
    }

    setToken(tokenParam);

    // Xác thực token với server
    const validateToken = async () => {
      try {
        const response = await authService.validateResetToken(tokenParam);
        setTokenValid(response.success);
      } catch (error) {
        setTokenValid(false);
        toast.error('Token không hợp lệ hoặc đã hết hạn');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [location.search]);

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Kiểm tra mật khẩu
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu không khớp');
      toast.error('Mật khẩu không khớp');
      return;
    }

    setIsSubmitting(true);
    try {
      // Gọi API đặt lại mật khẩu
      const response = await authService.resetPassword({
        token,
        newPassword
      });
      
      // Đánh dấu đã đặt lại mật khẩu thành công
      setIsResetComplete(true);
      toast.success(response.message || 'Mật khẩu đã được đặt lại thành công');
      
      // Chuyển hướng đến trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu');
      toast.error(error.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="container flex items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-center text-muted-foreground">Đang xác thực token...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="container flex items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">Token không hợp lệ</CardTitle>
            <CardDescription>
              Liên kết đặt lại mật khẩu của bạn không hợp lệ hoặc đã hết hạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Button asChild>
              <Link to="/forgot-password">Yêu cầu liên kết mới</Link>
            </Button>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-center w-full">
              <Link to="/login" className="text-primary hover:underline">
                Quay lại đăng nhập
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Đặt lại mật khẩu</CardTitle>
          <CardDescription>
            {isResetComplete
              ? 'Mật khẩu của bạn đã được đặt lại thành công'
              : 'Tạo mật khẩu mới cho tài khoản của bạn'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isResetComplete ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-500 text-center">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <div className="rounded-full bg-green-100 p-3">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-center text-muted-foreground">
                Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập.
              </p>
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full">
            <Link to="/login" className="text-primary hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword; 
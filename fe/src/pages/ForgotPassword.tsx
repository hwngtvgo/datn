"use client"

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import authService from '../services/authService';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Kiểm tra email
    if (!email || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ');
      toast.error('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    setIsSubmitting(true);
    try {
      // Gọi API yêu cầu đặt lại mật khẩu
      const response = await authService.forgotPassword(email);
      
      // Đánh dấu đã gửi email
      setEmailSent(true);
      toast.success(response.message || 'Đã gửi email hướng dẫn đặt lại mật khẩu');
    } catch (error: any) {
      setError(error.message || 'Đã xảy ra lỗi khi gửi yêu cầu đặt lại mật khẩu');
      toast.error(error.message || 'Đã xảy ra lỗi khi gửi yêu cầu đặt lại mật khẩu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container flex items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Quên mật khẩu</CardTitle>
          <CardDescription>
            {emailSent 
              ? 'Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn' 
              : 'Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-500 text-center">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Địa chỉ email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Đang xử lý...' : 'Gửi hướng dẫn đặt lại mật khẩu'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Vui lòng kiểm tra hộp thư đến của bạn và làm theo hướng dẫn trong email.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Nếu bạn không nhận được email trong vòng vài phút, vui lòng kiểm tra thư mục spam hoặc thử lại.
              </p>
              <Button variant="outline" className="w-full" onClick={() => setEmailSent(false)}>
                Thử lại với email khác
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full">
            Đã nhớ mật khẩu?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;
"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await login(formData.username, formData.password)
      console.log("Đăng nhập thành công!")
      
      // Kiểm tra cookie sau khi đăng nhập
      import('../services/authService').then(module => {
        const authService = module.default;
        authService.getCookies();
        console.log('Kiểm tra quyền admin sau khi đăng nhập:', authService.isAdmin());
        
        if (authService.isAdmin()) {
          console.log('Người dùng là ADMIN, chuyển hướng đến trang admin');
          navigate("/");
        } else {
          console.log('Người dùng KHÔNG phải là admin, chuyển hướng đến trang chủ');
          navigate("/");
        }
      });
      
      toast.success("Đăng nhập thành công!", {
        duration: 3000,
        position: 'top-center'
      })
    } catch (err: any) {
      console.error("Lỗi đăng nhập:", err)
      let errorMessage = 'Đã xảy ra lỗi'
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng'
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
          <CardDescription>Nhập tên đăng nhập và mật khẩu để truy cập tài khoản</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-center">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                placeholder="Tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal">
                Ghi nhớ đăng nhập
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              Đăng nhập
            </Button>
          </form>

          {/* <div className="mt-4 flex items-center">
            <Separator className="flex-grow" />
            <span className="mx-2 text-xs text-muted-foreground">HOẶC</span>
            <Separator className="flex-grow" />
          </div> */}

          <Button variant="outline" className="w-full mt-4">
            Tiếp tục với Google
          </Button>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Đăng ký
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

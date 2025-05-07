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

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
  })
  const [error, setError] = useState("")
  const { register } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    console.log('Đang gửi yêu cầu đăng ký:', { ...formData })
    
    try {
      await register(formData.username, formData.password, formData.email, formData.fullName)
      console.log('Đăng ký thành công, đang chuyển hướng...')
      toast.success("Đăng ký thành công!", {
        duration: 3000,
        position: 'top-center'
      })
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (err: any) {
      console.error('Lỗi đăng ký:', err)
      if (err.response) {
        console.error('Response error data:', err.response.data)
        console.error('Response error status:', err.response.status)
        setError(err.response.data?.message || 'Lỗi khi đăng ký tài khoản')
        toast.error(err.response.data?.message || 'Lỗi khi đăng ký tài khoản')
      } else if (err.request) {
        console.error('Request error:', err.request)
        setError('Không thể kết nối đến máy chủ')
        toast.error('Không thể kết nối đến máy chủ')
      } else {
        console.error('Error message:', err.message)
        setError(err.message || 'Đã xảy ra lỗi')
        toast.error(err.message || 'Đã xảy ra lỗi')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Tạo tài khoản</CardTitle>
          <CardDescription>Nhập thông tin để tạo tài khoản mới</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-center">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Họ và tên"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                name="username"
                placeholder="Tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" required />
              <Label htmlFor="terms" className="text-sm font-normal">
                Tôi đồng ý với{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Điều khoản sử dụng
                </Link>{" "}
                và{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Chính sách bảo mật
                </Link>
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              Tạo tài khoản
            </Button>
          </form>
{/* 
          <div className="mt-4 flex items-center">
            <Separator className="flex-grow" />
            <span className="mx-2 text-xs text-muted-foreground">HOẶC</span>
            <Separator className="flex-grow" />
          </div> */}

          <Button variant="outline" className="w-full mt-4">
            Đăng ký với Google
          </Button>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
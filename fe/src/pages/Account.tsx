"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Loader2, Bell, Mail, Calendar, Clock } from "lucide-react"
import authModule from "@/modules/auth"
import { getMyStatistics, UserStatisticsResponse } from "@/services/testResultService"
import { toast } from "sonner"
import userService from "@/services/userService"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import NotificationTab from "./User/AccountTabs/NotificationTab"

export default function Account() {
  const [user, setUser] = useState(authModule.getUser())
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState<UserStatisticsResponse | null>(null)
  
  // Form state
  const [formState, setFormState] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    marketingEmails: false,
    studyReminders: true,
    studyReminderTime: "18:00"
  })
  const [isNotificationSubmitting, setIsNotificationSubmitting] = useState(false)
  const [notificationSuccess, setNotificationSuccess] = useState(false)
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)

  // Lấy thông tin thống kê của người dùng
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const stats = await getMyStatistics()
        setStatistics(stats)
      } catch (error) {
        console.error("Lỗi khi tải thống kê:", error)
        toast.error("Không thể tải thống kê điểm số")
      } finally {
        setLoading(false)
      }
    }

    loadData()
    
    // Giả lập việc tải cài đặt thông báo từ server
    // Trong thực tế, sẽ cần gọi API để lấy cài đặt thông báo
    setTimeout(() => {
      setNotificationSettings({
        emailNotifications: true,
        marketingEmails: false,
        studyReminders: true,
        studyReminderTime: "18:00"
      })
    }, 500)
  }, [])
  
  // Cập nhật form state khi user thay đổi
  useEffect(() => {
    if (user) {
      setFormState(prev => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.email || "",
      }))
    }
  }, [user])

  // Lọc bỏ các bài thi có điểm 0
  const filterZeroScores = (tests: any[]) => {
    return tests.filter(test => test.totalScore > 0)
  }

  // Tính điểm trung bình loại bỏ điểm 0
  const calculateAverageWithoutZeros = (values: number[]) => {
    const nonZeroValues = values.filter(value => value > 0)
    if (nonZeroValues.length === 0) return 0
    const sum = nonZeroValues.reduce((a, b) => a + b, 0)
    return sum / nonZeroValues.length
  }
  
  // Tính điểm TOEIC trung bình từ các bài thi có điểm > 0
  const calculateAverageToeicScore = () => {
    if (!statistics || !statistics.recentTests) return 0
    
    const nonZeroTests = filterZeroScores(statistics.recentTests)
    if (nonZeroTests.length === 0) return 0

    // Lấy tổng điểm TOEIC từ các bài thi
    const toeicScores = nonZeroTests.map(test => {
      return (test.listeningScaledScore || 0) + (test.readingScaledScore || 0)
    })
    
    // Tính điểm trung bình
    return Math.round(calculateAverageWithoutZeros(toeicScores))
  }

  // Lấy số lượng bài thi thực tế
  const getActualTestsTaken = () => {
    if (!statistics) return 0
    return statistics.testsTaken || 0
  }

  // Lấy thông tin chữ cái đầu tiên của tên người dùng
  const getInitials = () => {
    if (!user || !user.fullName) return ""
    
    const names = user.fullName.split(" ")
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }
  
  // Xử lý khi thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Xóa thông báo lỗi khi người dùng bắt đầu gõ
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }
  
  // Xử lý khi thay đổi switch thông báo
  const handleSwitchChange = (name: keyof typeof notificationSettings, checked: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }))
    setNotificationSuccess(false)
  }
  
  // Xử lý khi thay đổi thời gian nhắc nhở học tập
  const handleTimeChange = (value: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      studyReminderTime: value
    }))
    setNotificationSuccess(false)
  }
  
  // Validate form
  const validateProfileForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formState.fullName.trim()) {
      errors.fullName = "Họ tên không được để trống"
    }
    
    if (!formState.email.trim()) {
      errors.email = "Email không được để trống"
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      errors.email = "Email không hợp lệ"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  // Validate password form
  const validatePasswordForm = () => {
    const errors: Record<string, string> = {}
    
    if (formState.newPassword || formState.confirmPassword || formState.currentPassword) {
      if (!formState.currentPassword) {
        errors.currentPassword = "Mật khẩu hiện tại không được để trống"
      }
      
      if (!formState.newPassword) {
        errors.newPassword = "Mật khẩu mới không được để trống"
      } else if (formState.newPassword.length < 6) {
        errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự"
      }
      
      if (formState.newPassword !== formState.confirmPassword) {
        errors.confirmPassword = "Mật khẩu xác nhận không khớp"
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSuccess(false)
    
    if (!validateProfileForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin")
      return
    }
    
    try {
      setIsSubmitting(true)
      
      await userService.updateCurrentUserProfile({
        fullName: formState.fullName,
        email: formState.email
      })
      
      // Cập nhật state user
      setUser(authModule.getUser())
      
      setFormSuccess(true)
      toast.success("Cập nhật thông tin thành công")
      
      // Reset password fields
      setFormState(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }))
      
    } catch (error: any) {
      console.error("Lỗi khi cập nhật thông tin:", error)
      toast.error(error.response?.data?.message || "Không thể cập nhật thông tin")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Submit password form
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSuccess(false)
    
    // Chỉ validate khi có nhập mật khẩu
    if (formState.currentPassword || formState.newPassword || formState.confirmPassword) {
      if (!validatePasswordForm()) {
        toast.error("Vui lòng kiểm tra lại thông tin mật khẩu")
        return
      }
      
      try {
        setIsSubmitting(true)
        
        await userService.updatePassword({
          currentPassword: formState.currentPassword,
          newPassword: formState.newPassword,
          confirmPassword: formState.confirmPassword
        })
        
        setFormSuccess(true)
        toast.success("Cập nhật mật khẩu thành công")
        
        // Reset password fields
        setFormState(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }))
        
      } catch (error: any) {
        console.error("Lỗi khi cập nhật mật khẩu:", error)
        toast.error(error.response?.data?.message || "Không thể cập nhật mật khẩu")
      } finally {
        setIsSubmitting(false)
      }
    }
  }
  
  // Submit notification settings form
  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsNotificationSubmitting(true)
      
      // Giả lập gọi API lưu cài đặt thông báo
      // Trong thực tế, sẽ cần gọi API để lưu cài đặt
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setNotificationSuccess(true)
      toast.success("Cập nhật cài đặt thông báo thành công")
    } catch (error: any) {
      console.error("Lỗi khi cập nhật cài đặt thông báo:", error)
      toast.error("Không thể cập nhật cài đặt thông báo")
    } finally {
      setIsNotificationSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" alt={user?.fullName || ""} />
                  <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <CardTitle>{user?.fullName || "Người dùng"}</CardTitle>
                  <CardDescription>{user?.email || ""}</CardDescription>
                </div>
                <Badge variant="secondary">{user?.role === "ROLE_ADMIN" ? "Quản trị viên" : "Thành viên"}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Đang tải...</span>
                </div>
              ) : (
              <div className="space-y-4">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Bài thi đã làm</span>
                    <span className="font-medium">{getActualTestsTaken()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Điểm TOEIC trung bình</span>
                    <span className="font-medium">{calculateAverageToeicScore()}/990</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Thời gian đăng ký</span>
                    <span className="font-medium">
                      {user?.lastChecked 
                        ? new Date(user.lastChecked).toLocaleDateString('vi-VN') 
                        : "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/test-statistics'}>
                Xem báo cáo tiến độ
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
              <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Thông tin hồ sơ</CardTitle>
                    <CardDescription>Cập nhật thông tin tài khoản</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <Input 
                        id="fullName"
                        name="fullName" 
                        value={formState.fullName} 
                        onChange={handleInputChange}
                        className={formErrors.fullName ? "border-red-500" : ""}
                      />
                      {formErrors.fullName && (
                        <p className="text-sm text-red-500">{formErrors.fullName}</p>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        value={formState.email} 
                        onChange={handleInputChange}
                        className={formErrors.email ? "border-red-500" : ""}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-500">{formErrors.email}</p>
                      )}
                  </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : "Lưu thay đổi"}
                    </Button>
                    {formSuccess && (
                      <span className="ml-4 text-sm text-green-600">Cập nhật thành công!</span>
                    )}
                </CardFooter>
                </form>
              </Card>

              {/* Phần đổi mật khẩu */}
              <Card className="mt-6">
                <form onSubmit={handlePasswordSubmit}>
                <CardHeader>
                    <CardTitle>Đổi mật khẩu</CardTitle>
                    <CardDescription>Cập nhật mật khẩu đăng nhập</CardDescription>
                </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                      <Input 
                        id="current-password" 
                        name="currentPassword"
                        type="password" 
                        value={formState.currentPassword}
                        onChange={handleInputChange}
                        className={formErrors.currentPassword ? "border-red-500" : ""}
                      />
                      {formErrors.currentPassword && (
                        <p className="text-sm text-red-500">{formErrors.currentPassword}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Mật khẩu mới</Label>
                      <Input 
                        id="new-password" 
                        name="newPassword"
                        type="password" 
                        value={formState.newPassword}
                        onChange={handleInputChange}
                        className={formErrors.newPassword ? "border-red-500" : ""}
                      />
                      {formErrors.newPassword && (
                        <p className="text-sm text-red-500">{formErrors.newPassword}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                      <Input 
                        id="confirm-password" 
                        name="confirmPassword"
                        type="password" 
                        value={formState.confirmPassword}
                        onChange={handleInputChange}
                        className={formErrors.confirmPassword ? "border-red-500" : ""}
                      />
                      {formErrors.confirmPassword && (
                        <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                      )}
                  </div>
                </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : "Đổi mật khẩu"}
                    </Button>
                </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="notifications" className="mt-6">
              <NotificationTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

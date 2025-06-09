import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  BookOpen,
  FileText,
  LineChart,
} from "lucide-react"
import { useEffect, useState } from "react"
import { UserStatisticsResponse } from "@/services/testResultService"
import api from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { UserResponse } from "@/services/userService"

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [userCount, setUserCount] = useState(0)
  const [examCount, setExamCount] = useState(0)
  const [testCount, setTestCount] = useState(0)
  const [testsCompletedByMonth, setTestsCompletedByMonth] = useState<{[key: string]: number}>({})
  const [recentUsers, setRecentUsers] = useState<UserResponse[]>([])
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Lấy tổng số người dùng
        const usersResponse = await api.get('/users')
        setUserCount(usersResponse.data.length)
        
        // Lưu danh sách 5 người dùng mới nhất
        const sortedUsers = [...usersResponse.data].sort((a: UserResponse, b: UserResponse) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5)
        setRecentUsers(sortedUsers)
        
        // Lấy số lượng bài thi TOEIC
        const examsResponse = await api.get('/toeic-exams')
        setExamCount(examsResponse.data.length || 0)
        
        // Lấy tổng số bài test đã hoàn thành (sử dụng API lấy thống kê)
        const statisticsResponse = await api.get('/test-results/my-statistics')
        const statistics: UserStatisticsResponse = statisticsResponse.data
        
        // Tổng số bài test
        setTestCount(statistics.testsTaken || 0)
        
        // Thống kê bài test theo tháng
        setTestsCompletedByMonth(statistics.testsByMonth || {})
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Hàm hiển thị skeleton khi đang loading
  const renderSkeleton = () => (
    <Skeleton className="h-[40px] w-full" />
  )
  
  // Định dạng thời gian từ createdAt
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Tổng quan về hệ thống học TOEIC</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? renderSkeleton() : (
              <div className="text-2xl font-bold">{userCount}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bài thi TOEIC</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? renderSkeleton() : (
              <div className="text-2xl font-bold">{examCount}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bài làm hoàn thành</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? renderSkeleton() : (
              <div className="text-2xl font-bold">{testCount}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Hoạt động người dùng</CardTitle>
                <CardDescription>Số lượng bài test hoàn thành theo tháng</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px]">
                    {renderSkeleton()}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    {Object.keys(testsCompletedByMonth).length > 0 ? (
                      <div className="w-full">
                        {Object.entries(testsCompletedByMonth).map(([month, count]) => (
                          <div key={month} className="flex items-center justify-between mb-3">
                            <span className="font-medium">{month}</span>
                            <div className="flex items-center">
                              <div 
                                className="h-5 bg-primary rounded-md mr-3" 
                                style={{width: `${Math.min(250, count * 8)}px`}}
                              ></div>
                              <span className="font-medium">{count} bài</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <LineChart className="h-16 w-16" />
                        <span className="mt-2">Không có dữ liệu bài test</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Thống kê bài thi</CardTitle>
                <CardDescription>Danh sách bài thi hiện có</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-[20px] w-full" />)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary/10 rounded-lg">
                      <div className="text-lg font-medium flex items-center justify-between">
                        <span>Tổng số bài thi</span>
                        <span className="text-xl font-bold">{examCount}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Người dùng mới</CardTitle>
              <CardDescription>Danh sách người dùng đăng ký gần đây</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-[20px] w-full" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentUsers.length > 0 ? (
                    recentUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between border-b pb-2">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{user.fullName} ({user.username})</p>
                          <p className="text-xs text-muted-foreground">{user.email} - {formatDate(user.createdAt)}</p>
                        </div>
                        <div className="flex items-center">
                          {user.role === 'ROLE_ADMIN' ? (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Admin</span>
                          ) : (
                            <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">User</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Không có người dùng nào</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

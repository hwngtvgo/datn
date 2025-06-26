import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  BookOpen,
  FileText,
  LineChart,
} from "lucide-react"
import { useEffect, useState } from "react"
import api from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { UserResponse } from "@/services/userService"

// Interface cho thống kê admin
interface AdminStatisticsResponse {
  totalUsers: number;
  totalTests: number;
  averageScore: number;
  testsByMonth: { [key: string]: number };
  topUsers: any[];
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [userCount, setUserCount] = useState(0)
  const [examCount, setExamCount] = useState(0)
  const [totalTestResults, setTotalTestResults] = useState(0)
  const [averageScore, setAverageScore] = useState(0)
  const [testsCompletedByMonth, setTestsCompletedByMonth] = useState<{[key: string]: number}>({})
  const [recentUsers, setRecentUsers] = useState<UserResponse[]>([])
  const [topUsers, setTopUsers] = useState<any[]>([])
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Lấy thống kê tổng từ API admin
        const adminStatisticsResponse = await api.get('/test-results/admin/dashboard-statistics')
        const adminStats: AdminStatisticsResponse = adminStatisticsResponse.data
        
        // Cập nhật các thống kê từ API admin
        setUserCount(adminStats.totalUsers)
        setTotalTestResults(adminStats.totalTests)
        setAverageScore(adminStats.averageScore)
        setTestsCompletedByMonth(adminStats.testsByMonth || {})
        setTopUsers(adminStats.topUsers || [])
        
        // Lấy tổng số bài thi TOEIC
        const examsResponse = await api.get('/tests', {
          params: {
            page: 0,
            size: 1
          }
        })
        setExamCount(examsResponse.data.totalElements || 0)
        
        // Lấy danh sách 5 người dùng mới nhất
        const usersResponse = await api.get('/users')
        const sortedUsers = [...usersResponse.data].sort((a: UserResponse, b: UserResponse) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5)
        setRecentUsers(sortedUsers)
        
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Tổng bài làm</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? renderSkeleton() : (
              <div className="text-2xl font-bold">{totalTestResults}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Điểm trung bình TOEIC</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? renderSkeleton() : (
              <div className="text-2xl font-bold">{averageScore ? Math.round(averageScore) : '0'}/990</div>
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
                <CardDescription>Số lượng bài test hoàn thành theo tháng (tất cả người dùng)</CardDescription>
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
                        {Object.entries(testsCompletedByMonth)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([month, count]) => (
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
                <CardTitle>Top 5 người dùng</CardTitle>
                <CardDescription>Xếp hạng theo điểm trung bình TOEIC (không tính bài điểm 0)</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-[50px] w-full" />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topUsers.length > 0 ? (
                      topUsers.map((user, index) => (
                        <div key={user.userId} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{user.username}</div>
                              <div className="text-sm text-muted-foreground">{user.totalTests} bài thi</div>
                            </div>
                          </div>
                          <div className="text-lg font-bold">{Math.round(user.averageScore)}/990</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Chưa có dữ liệu
                      </div>
                    )}
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
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-[60px] w-full" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentUsers.length > 0 ? (
                    recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-muted-foreground">{user.username}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Chưa có người dùng mới
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

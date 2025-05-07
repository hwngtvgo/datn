import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Users,
  BookOpen,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart,
  LineChart,
  PieChart,
} from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your TOEIC preparation platform</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,853</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+2</span> new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Practice Tests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+8</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,234</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-red-500">-4%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>User registrations and active users over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <LineChart className="h-16 w-16 text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Chart visualization would appear here</span>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Users by subscription type</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <PieChart className="h-16 w-16 text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Chart visualization would appear here</span>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Popular Courses</CardTitle>
                <CardDescription>Most enrolled courses this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">TOEIC Full Preparation</p>
                      <p className="text-xs text-muted-foreground">All levels</p>
                    </div>
                    <div className="text-sm font-medium">452 users</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Listening Mastery</p>
                      <p className="text-xs text-muted-foreground">Intermediate</p>
                    </div>
                    <div className="text-sm font-medium">328 users</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Grammar Essentials</p>
                      <p className="text-xs text-muted-foreground">Beginner</p>
                    </div>
                    <div className="text-sm font-medium">271 users</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Business Vocabulary</p>
                      <p className="text-xs text-muted-foreground">Advanced</p>
                    </div>
                    <div className="text-sm font-medium">184 users</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Test Performance</CardTitle>
                <CardDescription>Average scores by test category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <BarChart className="h-16 w-16 text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Chart visualization would appear here</span>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>In-depth analysis of platform usage and performance</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <BarChart className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Detailed analytics would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>Download or view generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Monthly User Activity Report</p>
                    <p className="text-xs text-muted-foreground">Generated on April 1, 2023</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Quarterly Financial Summary</p>
                    <p className="text-xs text-muted-foreground">Generated on March 31, 2023</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Course Engagement Analysis</p>
                    <p className="text-xs text-muted-foreground">Generated on March 15, 2023</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">User Feedback Summary</p>
                    <p className="text-xs text-muted-foreground">Generated on March 1, 2023</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

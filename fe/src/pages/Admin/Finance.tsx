import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Calendar,
  Download,
  LineChart,
  BarChart,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const transactions = [
  {
    id: "T1001",
    date: "2023-03-15",
    user: "John Doe",
    amount: 15.99,
    status: "completed",
    type: "subscription",
    plan: "Premium Monthly",
  },
  {
    id: "T1002",
    date: "2023-03-14",
    user: "Jane Smith",
    amount: 159.99,
    status: "completed",
    type: "subscription",
    plan: "Premium Annual",
  },
  {
    id: "T1003",
    date: "2023-03-14",
    user: "Robert Johnson",
    amount: 15.99,
    status: "completed",
    type: "subscription",
    plan: "Premium Monthly",
  },
  {
    id: "T1004",
    date: "2023-03-13",
    user: "Emily Davis",
    amount: 15.99,
    status: "completed",
    type: "subscription",
    plan: "Premium Monthly",
  },
  {
    id: "T1005",
    date: "2023-03-12",
    user: "Michael Wilson",
    amount: 15.99,
    status: "failed",
    type: "subscription",
    plan: "Premium Monthly",
  },
  {
    id: "T1006",
    date: "2023-03-12",
    user: "Sarah Brown",
    amount: 159.99,
    status: "completed",
    type: "subscription",
    plan: "Premium Annual",
  },
  {
    id: "T1007",
    date: "2023-03-11",
    user: "David Miller",
    amount: 15.99,
    status: "completed",
    type: "subscription",
    plan: "Premium Monthly",
  },
  {
    id: "T1008",
    date: "2023-03-10",
    user: "Jennifer Taylor",
    amount: 15.99,
    status: "refunded",
    type: "subscription",
    plan: "Premium Monthly",
  },
]

export default function AdminFinance() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Finance</h2>
        <p className="text-muted-foreground">Manage your platform's financial data and transactions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,234</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,432</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue Per User</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8.54</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,432</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+5%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Recent Transactions</h3>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ChevronDown className="mr-2 h-4 w-4" /> Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>All Transactions</DropdownMenuItem>
                  <DropdownMenuItem>Completed</DropdownMenuItem>
                  <DropdownMenuItem>Failed</DropdownMenuItem>
                  <DropdownMenuItem>Refunded</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Transaction ID
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Date
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      User
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Amount
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Status
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Type
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.user}</TableCell>
                    <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : transaction.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="capitalize">{transaction.type}</span>
                        <span className="text-xs text-muted-foreground">{transaction.plan}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing <strong>1</strong> to <strong>{transactions.length}</strong> of{" "}
              <strong>{transactions.length}</strong> transactions
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="px-4">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Revenue chart would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Analytics</CardTitle>
              <CardDescription>Breakdown of subscription plans</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <BarChart className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Subscription analytics would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

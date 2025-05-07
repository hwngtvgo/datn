"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Plus, Search, Trash2, Pencil, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import userService, { UserResponse, CreateUserRequest, UpdateUserRequest } from "../../services/userService"
import { useAuth } from "../../contexts/AuthContext"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog"

export default function AdminUsers() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { user: currentUser } = useAuth()
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
  
  // Form states
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    username: "",
    password: "",
    email: "",
    fullName: "",
    role: "USER"
  })
  
  const [editUser, setEditUser] = useState<UpdateUserRequest>({
    username: "",
    email: "",
    fullName: "",
    role: "USER"
  })

  const [editingUser, setEditingUser] = useState<UserResponse | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  // Tải danh sách người dùng
  const loadUsers = async () => {
    try {
      setLoading(true)
      try {
        const data = await userService.getAllUsers()
        setUsers(data)
      } catch (error) {
        console.error("Lỗi khi tải danh sách người dùng:", error)
        toast.error("Không thể tải danh sách người dùng. Hiển thị dữ liệu mẫu.")
        // Tải dữ liệu mẫu nếu không thể tải từ server
        loadSampleUsers()
      }
    } finally {
      setLoading(false)
    }
  }

  // Tải dữ liệu mẫu khi có lỗi
  const loadSampleUsers = () => {
    const sampleUsers: UserResponse[] = [
      {
        id: 1,
        username: "admin",
        email: "admin@example.com",
        fullName: "Admin User",
        role: "ROLE_ADMIN",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        username: "user1",
        email: "user1@example.com",
        fullName: "Regular User",
        role: "ROLE_USER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    setUsers(sampleUsers)
  }

  // Lọc người dùng theo từ khóa tìm kiếm
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Xử lý tạo người dùng mới
  const handleCreateUser = async () => {
    try {
      await userService.createUser(newUser)
      toast.success("Đã tạo người dùng thành công")
      setCreateDialogOpen(false)
      loadUsers()
      // Reset form
      setNewUser({
        username: "",
        password: "",
        email: "",
        fullName: "",
        role: "USER"
      })
    } catch (error: any) {
      console.error("Lỗi khi tạo người dùng:", error)
      toast.error(error.response?.data?.message || "Không thể tạo người dùng")
    }
  }

  // Xử lý cập nhật người dùng
  const handleUpdateUser = async () => {
    if (!editingUser) return
    
    // Đóng dialog trước khi gọi API để tránh block UI
    setIsEditDialogOpen(false)
    
    // Lưu thông tin người dùng hiện tại
    const currentEditingUser = { ...editingUser }
    
    // Cập nhật UI ngay lập tức cho trải nghiệm người dùng tốt hơn
    const updatedUsers = users.map((u) =>
      u.id === currentEditingUser.id ? currentEditingUser : u
    )
    setUsers(updatedUsers)

    try {
      // Tạo đối tượng UpdateUserRequest để gửi lên server
      const updateData = {
        username: currentEditingUser.username,
        email: currentEditingUser.email,
        fullName: currentEditingUser.fullName || "",
        role: currentEditingUser.role === "ROLE_ADMIN" ? "ADMIN" : "USER"
      }
      
      console.log("Dữ liệu cập nhật:", updateData)
      
      // Gọi API cập nhật người dùng
      await userService.updateUser(currentEditingUser.id, updateData)
      toast.success("Cập nhật người dùng thành công!")
      
      // Cập nhật lại danh sách người dùng từ server sau khi cập nhật thành công
      void loadUsers()
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error)
      toast.error("Cập nhật người dùng thất bại. Vui lòng thử lại sau.")
    }
  }

  // Cập nhật hàm xóa người dùng để tránh block giao diện
  const handleDelete = async (id: number) => {
    try {
      // Đóng dialog xóa người dùng
      setDeleteDialogOpen(false);
      
      // Đóng dialog chỉnh sửa nếu đang mở
      if (editDialogOpen) {
        setEditDialogOpen(false);
      }
      
      // Hiển thị toast đang xóa
      toast("Đang xóa người dùng", {
        description: "Đang thực hiện xóa người dùng...",
      });
      
      // Xóa người dùng khỏi state local trước
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      
      // Gọi API xóa người dùng
      await userService.deleteUser(id);
      
      // Thông báo thành công
      toast("Thành công", {
        description: "Đã xóa người dùng",
        icon: <CheckCircle className="h-4 w-4" />,
      });
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      
      // Tải lại danh sách người dùng nếu có lỗi
      loadUsers();
      
      toast("Lỗi", {
        description: "Không thể xóa người dùng",
        icon: <AlertCircle className="h-4 w-4" />,
      });
    }
  };

  // Thiết lập người dùng để chỉnh sửa
  const setupEditUser = (user: UserResponse) => {
    // Kiểm tra xem người dùng có đang chỉnh sửa chính mình không
    if (user.username === currentUser?.username) {
      toast.error("Không thể chỉnh sửa tài khoản của chính mình");
      return;
    }
    
    // Đóng dropdown menu trước khi mở dialog để tránh xung đột focus
    setTimeout(() => {
      setEditingUser(user)
      setIsEditDialogOpen(true)

      // Đảm bảo focus được đặt trong dialog
      setTimeout(() => {
        const dialogInput = document.querySelector('.edit-user-dialog input')
        if (dialogInput) {
          (dialogInput as HTMLElement).focus()
        }
      }, 100)
    }, 10)
  }

  // Thiết lập người dùng để xóa
  const setupDeleteUser = (user: UserResponse) => {
    // Đóng dropdown menu trước khi mở AlertDialog để tránh xung đột focus
    setTimeout(() => {
      setSelectedUser(user)
      setDeleteDialogOpen(true)
    }, 10)
  }

  return (
    <div className="space-y-6" id="main-content" tabIndex={-1}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
          <p className="text-muted-foreground">Quản lý tài khoản người dùng trong hệ thống</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadUsers} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
        </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Thêm người dùng
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm người dùng mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin chi tiết để tạo tài khoản người dùng mới.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Tên đăng nhập
                  </Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Mật khẩu
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fullName" className="text-right">
                    Họ tên
                  </Label>
                  <Input
                    id="fullName"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Vai trò
                  </Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value) => setNewUser({...newUser, role: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Người dùng</SelectItem>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Hủy
              </Button>
                <Button onClick={handleCreateUser}>Tạo người dùng</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm người dùng..."
          className="pl-8 w-full md:w-[300px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-md border focus-within:outline-none focus-within:ring-2 focus-within:ring-ring">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <RefreshCw className="animate-spin h-6 w-6" />
                  </div>
                  <div className="mt-2">Đang tải dữ liệu...</div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Không tìm thấy người dùng nào
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'ADMIN' ? 'Admin' : 'User'}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="focus:ring-2 focus:ring-ring focus:ring-offset-2 focus-visible:outline-none"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Mở menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => setupEditUser(user)}
                          className="flex items-center"
                          disabled={user.username === currentUser?.username} // Không cho phép chỉnh sửa chính mình
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onSelect={(event) => {
                            // Đảm bảo focus được xử lý đúng cách
                            if (event && event.target instanceof HTMLElement) {
                              event.target.blur();
                              // Đóng dropdown menu trước khi mở dialog
                              setTimeout(() => {
                                setupDeleteUser(user);
                              }, 50);
                            }
                          }}
                          disabled={user.username === currentUser?.username} // Không cho phép xóa chính mình
                          className={user.username === currentUser?.username ? "text-muted-foreground" : "text-red-600"}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog chỉnh sửa người dùng */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            // Đặt focus về main content sau khi đóng dialog
            setTimeout(() => {
              const mainContent = document.querySelector('[tabindex="-1"].focus\\:outline-none');
              if (mainContent) {
                (mainContent as HTMLElement).focus();
              }
            }, 50);
          }
        }}
      >
        <DialogContent className="edit-user-dialog">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin người dùng. Nhấn lưu khi hoàn tất.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Tên đăng nhập
                </Label>
                <Input
                  id="username"
                  value={editingUser.username}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, username: e.target.value })
                  }
                  className="col-span-3"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fullName" className="text-right">
                  Họ và tên
                </Label>
                <Input
                  id="fullName"
                  value={editingUser.fullName || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, fullName: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Vai trò
                </Label>
                <Select 
                  value={editingUser.role === "ROLE_ADMIN" ? "ADMIN" : "USER"} 
                  onValueChange={(value) => {
                    const newRole = value === "ADMIN" ? "ROLE_ADMIN" : "ROLE_USER";
                    setEditingUser({ ...editingUser, role: newRole });
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Người dùng</SelectItem>
                    <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateUser}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog xác nhận xóa người dùng */}
      <AlertDialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          // Nếu đang đóng dialog, đầu tiên đặt trạng thái
          if (!open) {
            // Đặt focus về main content trước khi đóng dialog
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
              setTimeout(() => {
                mainContent.focus();
                setDeleteDialogOpen(false);
              }, 10);
            } else {
              setDeleteDialogOpen(false);
            }
          } else {
            setDeleteDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể khôi phục. Bạn có chắc chắn muốn xóa người dùng này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            Bạn đang xóa người dùng: <strong>{selectedUser?.username}</strong>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              const mainContent = document.getElementById('main-content');
              if (mainContent) {
                setTimeout(() => mainContent.focus(), 10);
              }
            }}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(selectedUser?.id || 0)}>
              Xóa người dùng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SimpleModal from '@/components/ui/SimpleModal';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ModalExamples: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const handleSave = () => {
    console.log('Đã lưu:', { name, username });
    // Có thể thêm xử lý lưu dữ liệu ở đây
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Ví dụ về Modal trong Admin</h1>
        <p className="text-gray-600 mb-6">
          Dưới đây là ba cách triển khai modal khác nhau để bạn có thể lựa chọn phù hợp với nhu cầu của mình.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Ví dụ 1: SimpleModal */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-3">1. SimpleModal</h2>
          <p className="text-gray-600 mb-4">
            Modal đơn giản tùy chỉnh với giao diện sạch sẽ và không có các vấn đề về trap focus.
          </p>
          
          <SimpleModal
            trigger={<Button>Mở SimpleModal</Button>}
            title="Chỉnh sửa hồ sơ"
            footer={
              <>
                <Button variant="outline" onClick={() => console.log('Đã hủy')}>
                  Hủy
                </Button>
                <Button onClick={handleSave}>Lưu thay đổi</Button>
              </>
            }
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name-simple">Tên</Label>
                <Input
                  id="name-simple"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username-simple">Tên người dùng</Label>
                <Input
                  id="username-simple"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên người dùng"
                />
              </div>
            </div>
          </SimpleModal>
        </div>

        {/* Ví dụ 2: Sheet (Drawer) */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-3">2. Sheet (Drawer)</h2>
          <p className="text-gray-600 mb-4">
            Giao diện drawer trượt từ bên cạnh, phù hợp cho các form chỉnh sửa.
          </p>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button>Mở Sheet</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Chỉnh sửa hồ sơ</SheetTitle>
                <SheetDescription>
                  Cập nhật thông tin cá nhân của bạn. Nhấn lưu khi hoàn tất.
                </SheetDescription>
              </SheetHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name-sheet">Tên</Label>
                  <Input
                    id="name-sheet"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên của bạn"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username-sheet">Tên người dùng</Label>
                  <Input
                    id="username-sheet"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên người dùng"
                  />
                </div>
              </div>
              
              <SheetFooter>
                <Button onClick={handleSave}>Lưu thay đổi</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Ví dụ 3: AlertDialog */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-3">3. AlertDialog</h2>
          <p className="text-gray-600 mb-4">
            Dialog cảnh báo đơn giản, phù hợp cho các xác nhận hoặc thông báo.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>Mở AlertDialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Chỉnh sửa hồ sơ</AlertDialogTitle>
                <AlertDialogDescription>
                  Cập nhật thông tin cá nhân của bạn. Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name-alert">Tên</Label>
                  <Input
                    id="name-alert"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên của bạn"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username-alert">Tên người dùng</Label>
                  <Input
                    id="username-alert"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên người dùng"
                  />
                </div>
              </div>
              
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleSave}>Lưu thay đổi</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-700 mb-2">Lưu ý khi sử dụng</h3>
        <ul className="list-disc list-inside text-blue-600 space-y-1">
          <li>SimpleModal: Đơn giản, linh hoạt, tùy chỉnh cao</li>
          <li>Sheet: Phù hợp cho form phức tạp hoặc trên thiết bị di động</li>
          <li>AlertDialog: Tốt nhất cho xác nhận, cảnh báo hoặc nội dung ngắn</li>
        </ul>
      </div>
    </div>
  );
};

export default ModalExamples; 
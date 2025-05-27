import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Mail, Calendar, Clock, Loader2 } from "lucide-react"
import { toast } from "sonner"
import notificationService, { NotificationSettingResponse } from "@/services/notificationService"

export default function NotificationTab() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<NotificationSettingResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  
  // Tải cài đặt thông báo
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const data = await notificationService.getNotificationSettings();
        setSettings(data);
      } catch (error) {
        console.error("Lỗi khi tải cài đặt thông báo:", error);
        toast.error("Không thể tải cài đặt thông báo");
        // Khởi tạo giá trị mặc định nếu không thể tải
        setSettings({
          id: 0,
          userId: 0,
          emailNotifications: true,
          studyReminders: true,
          studyReminderTime: "18:00"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Xử lý khi thay đổi switch thông báo
  const handleSwitchChange = (name: keyof Pick<NotificationSettingResponse, 'emailNotifications' | 'studyReminders'>, checked: boolean) => {
    if (!settings) return;
    
    setSettings(prev => prev ? {
      ...prev,
      [name]: checked
    } : null);
    
    setHasChanges(true);
    setFormSuccess(false);
  };
  
  // Xử lý khi thay đổi thời gian nhắc nhở học tập
  const handleTimeChange = (value: string) => {
    if (!settings) return;
    
    setSettings(prev => prev ? {
      ...prev,
      studyReminderTime: value
    } : null);
    
    setHasChanges(true);
    setFormSuccess(false);
  };
  
  // Xử lý khi gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    try {
      setIsSubmitting(true);
      
      await notificationService.updateNotificationSettings({
        emailNotifications: settings.emailNotifications,
        studyReminders: settings.studyReminders,
        studyReminderTime: settings.studyReminderTime
      });
      
      setFormSuccess(true);
      setHasChanges(false);
      toast.success("Cập nhật cài đặt thông báo thành công");
    } catch (error: any) {
      console.error("Lỗi khi cập nhật cài đặt thông báo:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật cài đặt thông báo");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt thông báo</CardTitle>
          <CardDescription>Quản lý cách bạn nhận thông báo</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Đang tải cài đặt...</span>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Cài đặt thông báo</CardTitle>
          <CardDescription>Quản lý cách bạn nhận thông báo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-y-1">
            <div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <Label htmlFor="email-notifications" className="font-medium">Nhận báo cáo hàng tuần</Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Nhận email về hoạt động tài khoản
              </p>
              <p className="text-xs text-muted-foreground ml-6 mt-1 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Gửi vào 7h sáng mỗi thứ Hai</span>
              </p>
            </div>
            <Switch 
              id="email-notifications" 
              checked={settings?.emailNotifications}
              onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between space-y-1">
            <div>
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-primary" />
                <Label htmlFor="study-reminders" className="font-medium">Nhắc nhở học tập hàng ngày</Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Nhận nhắc nhở luyện tập thường xuyên
              </p>
              <div className="flex items-center ml-6 mt-2">
                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                <Label htmlFor="reminder-time" className="text-xs mr-2 text-muted-foreground">Giờ nhắc nhở:</Label>
                <Select 
                  value={settings?.studyReminderTime} 
                  onValueChange={handleTimeChange}
                  disabled={!settings?.studyReminders}
                >
                  <SelectTrigger className="w-24 h-8 text-xs">
                    <SelectValue placeholder="Chọn giờ" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                        {`${i.toString().padStart(2, '0')}:00`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Switch 
              id="study-reminders" 
              checked={settings?.studyReminders}
              onCheckedChange={(checked) => handleSwitchChange('studyReminders', checked)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isSubmitting || !hasChanges}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : "Lưu tùy chọn"}
          </Button>
          {formSuccess && (
            <span className="ml-4 text-sm text-green-600">Cập nhật thành công!</span>
          )}
        </CardFooter>
      </form>
    </Card>
  );
} 
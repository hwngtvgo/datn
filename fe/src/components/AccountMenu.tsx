import { LogOut, User as UserIcon, Settings, History } from "lucide-react";
import { Link } from "react-router-dom";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

const AccountMenu = () => {
  return (
    <div className="flex items-center space-x-4">
      <DropdownMenuItem asChild>
        <Link to="/account">
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Tài khoản</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/test-history">
          <History className="mr-2 h-4 w-4" />
          <span>Lịch sử bài thi</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
    </div>
  );
};

export default AccountMenu; 
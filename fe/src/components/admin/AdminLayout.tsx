import { Outlet } from "react-router-dom"
import AdminSidebar from "./AdminSidebar"
import AdminHeader from "./AdminHeader"
import { ThemeProvider } from "../ThemeProvider"

export default function AdminLayout() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <AdminHeader />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}

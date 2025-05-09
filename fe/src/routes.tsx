import ToeicQuestions from "./pages/Admin/ToeicQuestions";
import StandaloneQuestions from "./pages/Admin/StandaloneQuestions";
import AdminExams from "./pages/Admin/Exams";
import Profile from "./pages/User/Profile";

// Admin routes
{
  path: "/admin",
  element: <AdminLayout />,
  children: [
    { path: "", element: <Navigate to="/admin/dashboard" replace /> },
    { path: "dashboard", element: <AdminDashboard /> },
    { path: "users", element: <AdminUsers /> },
    { path: "toeic-questions", element: <ToeicQuestions /> },
    { path: "standalone-questions", element: <StandaloneQuestions /> },
    { path: "exams", element: <AdminExams /> },
  ]
}, 
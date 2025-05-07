import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">TOEIC BK</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nền tảng luyện thi TOEIC toàn diện với các bài tập, đề thi thực tế và trợ lý AI
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Luyện Thi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/practice-tests"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  Đề Thi TOEIC
                </Link>
              </li>
              <li>
                <Link
                  to="/learning"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  Ôn Luyện
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Tài Khoản</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  Đăng Nhập
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  Đăng Ký
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Liên Hệ</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-600 dark:text-gray-400">Email: contact@toeicbk.vn</li>
              <li className="text-gray-600 dark:text-gray-400">Hotline: 0123 456 789</li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} TOEIC BK. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}

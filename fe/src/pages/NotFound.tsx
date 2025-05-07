import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-6">Trang không tồn tại</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link
          to="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700"
        >
          Quay về Trang Chủ
        </Link>
      </div>
    </div>
  );
}
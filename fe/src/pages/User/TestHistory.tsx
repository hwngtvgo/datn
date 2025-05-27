import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { 
   Loader2
} from "lucide-react";
import { getMyTestHistory, TestResultResponse } from "@/services/testResultService";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const TestHistory: React.FC = () => {
  const [results, setResults] = useState<TestResultResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState<number>(10);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadTestHistory(currentPage);
  }, [currentPage]);

  const loadTestHistory = async (page: number = 0) => {
    setIsLoading(true);
    try {
      const response = await getMyTestHistory(page);
      setResults(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử bài thi:", error);
      toast.error("Không thể tải lịch sử bài thi. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Hàm xử lý điểm để hiển thị màu sắc phù hợp
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 hover:bg-green-200";
    if (score >= 60) return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    if (score >= 40) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    return "bg-red-100 text-red-800 hover:bg-red-200";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử làm bài</CardTitle>
          <CardDescription>
            Xem lại kết quả các bài thi TOEIC bạn đã làm
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Đang tải dữ liệu...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Bạn chưa có lịch sử làm bài nào. Hãy thử làm một bài thi!
              </p>
              <Button onClick={() => navigate("/practice-tests")}>
                Đi đến danh sách bài thi
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableCaption>Danh sách {totalElements} kết quả bài thi của bạn.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bài thi</TableHead>
                    <TableHead>Ngày làm</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Đúng/Tổng</TableHead>
                    <TableHead>Điểm</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.testTitle}</TableCell>
                      <TableCell>{formatDate(result.createdAt)}</TableCell>
                      <TableCell>{result.completionTimeInMinutes} phút</TableCell>
                      <TableCell>
                        {result.correctAnswers}/{result.totalQuestions}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={getScoreColor(result.totalScore)}
                          variant="outline"
                        >
                          {result.totalScore}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/test-result/${result.id}`)}
                        >
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Trước
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Trang {currentPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
          <Button onClick={() => navigate("/test-statistics")}>
            Xem thống kê
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestHistory; 
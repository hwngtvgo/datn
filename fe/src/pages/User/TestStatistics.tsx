import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, Calendar, Award, ChevronLeft, FileAudio, BookOpen, 
  Target, Percent, Trophy, History, Eye
} from "lucide-react";
import { getMyStatistics, UserStatisticsResponse, TestResultResponse } from "@/services/testResultService";
import { toast } from "sonner";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { formatDate } from "@/lib/utils";

// Đăng ký ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TestStatistics: React.FC = () => {
  const [statistics, setStatistics] = useState<UserStatisticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await getMyStatistics();
      setStatistics(response);
    } catch (error) {
      console.error("Lỗi khi tải thống kê:", error);
      toast.error("Không thể tải thống kê điểm số");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/test-history');
  };
  
  const handleViewDetail = (resultId: number) => {
    navigate(`/test-result/${resultId}`);
  };
  
  // Hàm xử lý điểm để hiển thị màu sắc phù hợp
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-blue-100 text-blue-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Lọc bỏ các bài thi có điểm 0 (thêm mới)
  const filterZeroScores = (tests: TestResultResponse[]) => {
    return tests.filter(test => test.totalScore > 0);
  };

  // Tính điểm trung bình loại bỏ điểm 0 (thêm mới)
  const calculateAverageWithoutZeros = (values: number[]) => {
    const nonZeroValues = values.filter(value => value > 0);
    if (nonZeroValues.length === 0) return 0;
    const sum = nonZeroValues.reduce((a, b) => a + b, 0);
    return sum / nonZeroValues.length;
  };

  // Tính điểm TOEIC dự đoán dựa trên bài thi có điểm > 0 (thêm mới)
  const calculatePredictedToeicScore = () => {
    if (!statistics || !statistics.recentTests) return {
      listening: statistics?.listeningScaled || 0,
      reading: statistics?.readingScaled || 0,
      total: (statistics?.listeningScaled || 0) + (statistics?.readingScaled || 0)
    };

    const nonZeroTests = filterZeroScores(statistics.recentTests);
    if (nonZeroTests.length === 0) return {
      listening: statistics.listeningScaled || 0,
      reading: statistics.readingScaled || 0,
      total: (statistics.listeningScaled || 0) + (statistics.readingScaled || 0)
    };

    // Tính điểm trung bình listening và reading từ các bài thi có điểm > 0
    const listeningAvg = calculateAverageWithoutZeros(nonZeroTests.map(test => test.listeningScore));
    const readingAvg = calculateAverageWithoutZeros(nonZeroTests.map(test => test.readingScore));

    // Quy đổi sang thang điểm 495 cho mỗi phần
    const listeningScaled = Math.round(listeningAvg / 100 * 495);
    const readingScaled = Math.round(readingAvg / 100 * 495);
    const totalScore = listeningScaled + readingScaled;

    return {
      listening: listeningScaled,
      reading: readingScaled,
      total: totalScore
    };
  };

  // Chuẩn bị dữ liệu cho biểu đồ điểm theo tháng
  const prepareScoreChartData = () => {
    if (!statistics) return null;
    
    const months = Object.keys(statistics.scoresByMonth).sort();
    const scores = months.map(month => {
      // Nếu điểm của tháng là 0, cố gắng tính lại từ dữ liệu chi tiết nếu có
      if (statistics.scoresByMonth[month] === 0 && statistics.recentTests) {
        const testsInMonth = statistics.recentTests.filter(test => {
          const testDate = new Date(test.createdAt);
          const testMonth = `${testDate.getFullYear()}-${String(testDate.getMonth() + 1).padStart(2, '0')}`;
          return testMonth === month && test.totalScore > 0;
        });
        
        if (testsInMonth.length > 0) {
          const totalScore = testsInMonth.reduce((sum, test) => sum + test.totalScore, 0);
          return totalScore / testsInMonth.length;
        }
      }
      return statistics.scoresByMonth[month];
    });
    
    const data: ChartData<'line'> = {
      labels: months.map(monthKey => {
        // Chuyển đổi định dạng "yyyy-MM" thành "MM/yyyy"
        const [year, monthNum] = monthKey.split('-');
        return `${monthNum}/${year}`;
      }),
      datasets: [
        {
          label: 'Điểm trung bình',
          data: scores,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
    
    return data;
  };
  
  // Chuẩn bị dữ liệu cho biểu đồ số bài thi theo tháng
  const prepareTestCountChartData = () => {
    if (!statistics) return null;
    
    const months = Object.keys(statistics.testsByMonth).sort();
    const counts = months.map(month => statistics.testsByMonth[month]);
    
    const data: ChartData<'bar'> = {
      labels: months.map(monthKey => {
        // Chuyển đổi định dạng "yyyy-MM" thành "MM/yyyy"
        const [year, monthNum] = monthKey.split('-');
        return `${monthNum}/${year}`;
      }),
      datasets: [
        {
          label: 'Số bài thi',
          data: counts,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
        },
      ],
    };
    
    return data;
  };
  
  // Chuẩn bị dữ liệu cho biểu đồ điểm từng phần
  const prepareSkillsChartData = () => {
    if (!statistics) return null;
    
    // Đảm bảo chỉ tính toán từ bài thi có điểm > 0
    const nonZeroTests = statistics.recentTests ? filterZeroScores(statistics.recentTests) : [];
    
    // Tính toán điểm trung bình cho từng kỹ năng
    let listeningAvg = statistics.listeningAvg;
    let readingAvg = statistics.readingAvg;
    let grammarAvg = statistics.grammarAvg; 
    let vocabularyAvg = statistics.vocabularyAvg;
    
    // Nếu có dữ liệu chi tiết, tính toán lại điểm trung bình
    if (nonZeroTests.length > 0) {
      listeningAvg = calculateAverageWithoutZeros(nonZeroTests.map(test => test.listeningScore));
      readingAvg = calculateAverageWithoutZeros(nonZeroTests.map(test => test.readingScore));
      grammarAvg = calculateAverageWithoutZeros(nonZeroTests.map(test => test.grammarScore));
      vocabularyAvg = calculateAverageWithoutZeros(nonZeroTests.map(test => test.vocabularyScore));
    }
    
    const data: ChartData<'bar'> = {
      labels: ['Listening', 'Reading', 'Grammar', 'Vocabulary'],
      datasets: [
        {
          label: 'Điểm trung bình (%)',
          data: [
            listeningAvg || 0,
            readingAvg || 0,
            grammarAvg || 0,
            vocabularyAvg || 0
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ],
          borderColor: [
            'rgb(54, 162, 235)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',
            'rgb(255, 159, 64)'
          ],
          borderWidth: 1,
        },
      ],
    };
    
    return data;
  };
  
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };
  
  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  const skillChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div className="container p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Thống kê điểm số</h1>
          <p className="text-muted-foreground">Xem thống kê kết quả làm bài TOEIC của bạn</p>
        </div>
        <Button onClick={handleBack} variant="outline">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Quay lại lịch sử
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <span className="ml-3">Đang tải dữ liệu thống kê...</span>
        </div>
      ) : !statistics ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Không thể tải dữ liệu thống kê.</p>
          <Button className="mt-4" onClick={loadStatistics}>Thử lại</Button>
        </div>
      ) : (
        <>
          {/* Thẻ tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="rounded-full bg-blue-50 p-3 mb-2">
                  <History className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm text-muted-foreground">Số bài đã làm</p>
                <h3 className="text-2xl font-bold">{statistics.testsTaken}</h3>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="rounded-full bg-green-50 p-3 mb-2">
                  <Percent className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">Điểm trung bình</p>
                <h3 className="text-2xl font-bold">
                  <Badge className={getScoreColor(statistics.averageScore)}>
                    {statistics.recentTests && filterZeroScores(statistics.recentTests).length > 0 
                      ? calculateAverageWithoutZeros(filterZeroScores(statistics.recentTests).map(test => test.totalScore)).toFixed(1)
                      : statistics.averageScore.toFixed(1)}%
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">(Không tính bài điểm 0)</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="rounded-full bg-amber-50 p-3 mb-2">
                  <Trophy className="h-6 w-6 text-amber-600" />
                </div>
                <p className="text-sm text-muted-foreground">Điểm cao nhất</p>
                <h3 className="text-2xl font-bold">
                  <Badge className={getScoreColor(statistics.bestScore)}>
                    {statistics.bestScore.toFixed(1)}%
                  </Badge>
                </h3>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="rounded-full bg-purple-50 p-3 mb-2">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm text-muted-foreground">TOEIC Dự đoán</p>
                <h3 className="text-2xl font-bold">
                  {calculatePredictedToeicScore().total}/990
                </h3>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <span className="text-blue-600 mr-2">L: {calculatePredictedToeicScore().listening}</span>
                  <span className="text-green-600">R: {calculatePredictedToeicScore().reading}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">(Không tính bài điểm 0)</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Biểu đồ điểm theo tháng */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Điểm số theo tháng</CardTitle>
                <CardDescription>Điểm trung bình mỗi tháng (phần trăm)</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {prepareScoreChartData() && (
                  <Line
                    data={prepareScoreChartData()!}
                    options={chartOptions}
                    height={250}
                  />
                )}
              </CardContent>
            </Card>
            
            {/* Biểu đồ số bài thi theo tháng */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Bài thi theo tháng</CardTitle>
                <CardDescription>Số lượng bài thi mỗi tháng</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {prepareTestCountChartData() && (
                  <Bar
                    data={prepareTestCountChartData()!}
                    options={barChartOptions}
                    height={250}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Biểu đồ điểm từng phần */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Điểm số theo kỹ năng</CardTitle>
              <CardDescription>Tỉ lệ đúng trung bình cho từng phần</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="max-w-xl mx-auto">
                {prepareSkillsChartData() && (
                  <Bar
                    data={prepareSkillsChartData()!}
                    options={skillChartOptions}
                    height={250}
                  />
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Các bài thi gần đây */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Bài thi gần đây</CardTitle>
              <CardDescription>5 kết quả gần đây nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.recentTests.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">Chưa có bài thi nào</p>
                ) : (
                  statistics.recentTests.map((result) => (
                    <Card key={result.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-4 md:w-2/3">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{result.testTitle}</h3>
                            <Badge variant={result.totalScore >= 70 ? "default" : result.totalScore >= 40 ? "secondary" : "destructive"} className={
                              result.totalScore >= 70 ? "bg-green-100 text-green-800 hover:bg-green-100" : 
                              result.totalScore >= 40 ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : ""
                            }>
                              {result.totalScore}%
                            </Badge>
                          </div>
                          <div className="flex flex-wrap text-sm text-muted-foreground gap-4 mb-3">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(result.createdAt)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {result.completionTimeInMinutes} phút
                            </div>
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-1" />
                              {result.correctAnswers}/{result.totalQuestions} câu đúng
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                              <FileAudio className="w-3 h-3 mr-1" />
                              Listening: {result.listeningScore}% ({result.listeningScaledScore}/495)
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                              <BookOpen className="w-3 h-3 mr-1" />
                              Reading: {result.readingScore}% ({result.readingScaledScore}/495)
                            </Badge>
                          </div>
                        </div>
                        <div className="bg-muted/50 p-4 flex items-center justify-center md:w-1/3">
                          <div className="text-center">
                            <div className="text-4xl font-bold mb-2">
                              {(result.listeningScaledScore || 0) + (result.readingScaledScore || 0)}
                            </div>
                            <div className="text-sm text-muted-foreground">Tổng điểm TOEIC</div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-3"
                              onClick={() => handleViewDetail(result.id)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Chi tiết
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={handleBack}>
                Xem tất cả lịch sử bài làm
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
};

export default TestStatistics; 
"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle2, AlertCircle, BookOpen, HelpCircle, Lightbulb, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

import * as toeicExamService from "@/services/toeicExamService"

// Định nghĩa các quy tắc ngữ pháp mặc định để hiển thị trong khi API đang tải
const defaultGrammarRules = [
  {
    id: 1,
    title: "Present Simple vs Present Continuous",
    description: "Cách sử dụng thì hiện tại đơn và hiện tại tiếp diễn",
    content: `
      <h3 class="text-lg font-medium mb-2">Hiện tại đơn (Present Simple)</h3>
      <p class="mb-2">Dùng để diễn tả:</p>
      <ul class="list-disc pl-5 mb-3">
        <li>Thói quen, hành động lặp đi lặp lại: I <b>go</b> to school every day.</li>
        <li>Sự thật hiển nhiên: Water <b>boils</b> at 100°C.</li>
        <li>Lịch trình, thời gian biểu: The train <b>leaves</b> at 9 PM.</li>
      </ul>
      
      <h3 class="text-lg font-medium mb-2">Hiện tại tiếp diễn (Present Continuous)</h3>
      <p class="mb-2">Dùng để diễn tả:</p>
      <ul class="list-disc pl-5 mb-3">
        <li>Hành động đang diễn ra: I <b>am studying</b> now.</li>
        <li>Kế hoạch đã định trước trong tương lai gần: We <b>are leaving</b> tomorrow.</li>
        <li>Tình huống tạm thời: She <b>is staying</b> with her parents for a month.</li>
      </ul>
      
      <div class="bg-muted p-3 rounded-md mt-3">
        <p class="font-medium mb-1">Lưu ý:</p>
        <ul class="list-disc pl-5">
          <li>Một số động từ thường không dùng ở thì tiếp diễn: like, love, hate, want, know, understand, remember, believe...</li>
          <li>Cấu trúc hiện tại đơn: S + V(s/es) + O</li>
          <li>Cấu trúc hiện tại tiếp diễn: S + am/is/are + V-ing + O</li>
      </ul>
      </div>
    `,
    examples: [],
    selectedExamples: []
  }
];

// Định nghĩa kiểu dữ liệu cho ngữ pháp
interface GrammarRule {
  id: number;
  title: string;
  description: string;
  content: string;
  examples: GrammarExample[];
  selectedExamples: GrammarExample[];
}

interface OptionData {
  id: number;
  optionKey: string;
  optionText: string;
}

interface GrammarExample {
  id: number;
  question: string;
  answer: string;
  explanation: string;
  options?: OptionData[]; // Thêm options cho câu hỏi từ backend
}

// Interface cho câu hỏi đã định dạng
interface FormattedQuestion {
  id: number;
  ruleId?: number;
  ruleTitle?: string;
  question: string;
  options: {
    id: number;       // ID của option từ backend
    key: string;      // A, B, C, D (optionKey từ backend)
    text: string;     // Nội dung câu trả lời (optionText từ backend)
  }[];
  answer: string;     // Đáp án đúng (optionKey từ backend, thường là A, B, C, D)
  explanation?: string;
}

export default function GrammarPage() {
  const { level } = useParams();
  const [grammarRules, setGrammarRules] = useState<GrammarRule[]>(defaultGrammarRules);
  const [selectedRule, setSelectedRule] = useState<GrammarRule | null>(null);
  const [selectedExample, setSelectedExample] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});
  const [quizQuestions, setQuizQuestions] = useState<FormattedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [rulesPage, setRulesPage] = useState(1);
  const rulesPerPage = 5;

  // Hàm tạo phương án trả lời với key A, B, C, D
  const createOptionsWithKeys = (correctAnswer: string, questionText: string): {key: string, text: string}[] => {
    // Trong thực tế, dữ liệu này nên được lấy từ API
    // Nhưng vì chưa có dữ liệu đầy đủ, tạm thời tạo các phương án
    const options = [
      { key: 'A', text: correctAnswer },
      { key: 'B', text: 'is' },
      { key: 'C', text: 'are' },
      { key: 'D', text: 'was' }
    ];
    
    return options;
  };

  // Tạo câu hỏi cho phần quiz, tập hợp từ tất cả các quy tắc
  const loadQuizQuestions = (rules: GrammarRule[]): FormattedQuestion[] => {
    const quizQuestionsData: FormattedQuestion[] = [];
    
    for (const rule of rules) {
      if (rule.examples.length > 0 && rule.selectedExamples.length > 0) {
        // Lấy tất cả các id của ví dụ đã chọn
        const selectedIds = rule.selectedExamples.map((ex: GrammarExample) => ex.id);
        
        // Lọc các câu hỏi còn lại (không có trong selectedIds)
        const remainingQuestions = rule.examples
          .filter((ex: GrammarExample) => !selectedIds.includes(ex.id))
          .map((ex: GrammarExample) => {
            // Debug: In ra dữ liệu option cho mỗi câu hỏi
            console.log(`Xử lý câu hỏi ${ex.id} với options:`, ex.options);
            
            // Lấy các phương án trả lời từ dữ liệu backend
            const options = ex.options ? ex.options.map((opt: OptionData) => ({
              id: opt.id,
              key: opt.optionKey,
              text: opt.optionText
            })) : [];
            
            // Nếu không có options, tạo một mẫu đơn giản
            const defaultOptions = options.length > 0 ? options : [
              { key: 'A', text: 'Phương án A', id: 0 },
              { key: 'B', text: 'Phương án B', id: 1 },
              { key: 'C', text: 'Phương án C', id: 2 },
              { key: 'D', text: 'Phương án D', id: 3 }
            ];
            
            // Đảm bảo options được sắp xếp theo thứ tự A, B, C, D
            const sortedOptions = [...defaultOptions].sort((a, b) => a.key.localeCompare(b.key));
            
            return {
              id: ex.id,
              ruleId: rule.id,
              ruleTitle: rule.title,
              question: ex.question,
              options: sortedOptions,
              answer: ex.answer,
              explanation: ex.explanation
            };
          });
        
        quizQuestionsData.push(...remainingQuestions);
      }
    }
    
    return quizQuestionsData;
  };

  // Hàm xử lý nội dung để định dạng các từ được đánh dấu bằng **
  const formatContent = (content: string): string => {
    if (!content) return '';
    
    // Chỉ thay thế các đánh dấu **text** thành <strong>text</strong> với màu primary
    let formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>');
    
    // Thêm định dạng cho các từ "am", "is", "are" và "not" để làm nổi bật
    formattedContent = formattedContent.replace(/\b(am|is|are)\b/g, '<span class="text-primary font-semibold">$1</span>');
    formattedContent = formattedContent.replace(/\b(not)\b/g, '<span class="text-primary font-semibold">$1</span>');
    
    // Đảm bảo các đoạn văn được bọc trong thẻ p nếu chưa có thẻ HTML
    if (!formattedContent.startsWith('<')) {
      formattedContent = `<p>${formattedContent}</p>`;
    }
    
    return formattedContent;
  };

  // Tải dữ liệu ngữ pháp từ API
  useEffect(() => {
    const loadGrammarData = async () => {
      setIsLoading(true);
      try {
        // Lấy tất cả các đề thi để tìm các đề thi ngữ pháp
        const examsResponse = await toeicExamService.getAllExams(0, 1000); // Tăng kích thước để lấy tất cả đề thi
        console.log("Dữ liệu đề thi từ API:", examsResponse);
        
        // Lọc các đề thi có loại là GRAMMAR_ONLY
        const allGrammarExams = examsResponse.content ? 
          examsResponse.content.filter((exam: any) => exam.type === 'GRAMMAR_ONLY') : [];
        
        console.log("Đề thi ngữ pháp:", allGrammarExams);
        
        // Xác định mức độ dựa theo URL
        let targetDifficulties: string[] = [];
        let shouldFilter = false;
        
        if (level && level.includes("-")) {
          // URL có định dạng số điểm, ví dụ: 0-300, 300-600, 600-800
          if (level.match(/^\d+-\d+$/)) {
            const [min, max] = level.split("-").map(Number);
            
            if (min >= 0 && max <= 300) {
              targetDifficulties = ["EASY"];
              shouldFilter = true;
              console.log("Lọc theo mức độ: Dễ (0-300)");
            } else if (min >= 300 && max <= 600) {
              targetDifficulties = ["MEDIUM"];
              shouldFilter = true;
              console.log("Lọc theo mức độ: Trung bình (300-600)");
            } else if (min >= 600 && max <= 800) {
              targetDifficulties = ["HARD"];
              shouldFilter = true;
              console.log("Lọc theo mức độ: Khó (600-800)");
            }
          } else {
            // Xử lý chuỗi level từ URL theo cách cũ, ví dụ: "beginner-intermediate"
            const levelParts = level.split('-');
            const difficultyMap: Record<string, string> = {
              "beginner": "EASY",
              "intermediate": "MEDIUM",
              "advanced": "HARD"
            };
            
            // Kiểm tra xem có phải format hợp lệ không
            const isValidFormat = levelParts.every(part => difficultyMap[part]);
            
            if (isValidFormat) {
              // Ánh xạ các giá trị từ URL sang các giá trị difficulty trong backend
              targetDifficulties = levelParts.map(part => difficultyMap[part] || part.toUpperCase());
              shouldFilter = true;
              console.log("Đang lọc theo các trình độ:", targetDifficulties);
            } else {
              console.log("Định dạng level không hợp lệ, hiển thị tất cả bài tập ngữ pháp");
            }
          }
        } else {
          console.log("Không có tham số level hoặc không đúng định dạng, hiển thị tất cả bài tập ngữ pháp");
        }
        
        // Lọc đề thi theo trình độ nếu cần
        let grammarExams = allGrammarExams;
        if (shouldFilter && targetDifficulties.length > 0) {
          grammarExams = allGrammarExams.filter((exam: any) => 
            targetDifficulties.includes(exam.difficulty)
          );
          
          console.log("Đề thi ngữ pháp sau khi lọc theo trình độ:", grammarExams);
        } else {
          console.log("Hiển thị tất cả đề thi ngữ pháp không lọc:", grammarExams.length, "đề thi");
        }
        
        if (grammarExams.length > 0) {
          // Mảng chứa các promise để đợi xử lý tất cả các đề thi
          const rulesPromises = grammarExams.map(async (exam: any) => {
            // Nếu có instructions, sử dụng làm nội dung lý thuyết
            const content = exam.instructions ? 
              `<div class="space-y-4">${formatContent(exam.instructions)}</div>` : 
              `<div class="space-y-4">
                <h3 class="text-lg font-medium mb-2">${exam.title}</h3>
                <p>${exam.description || 'Không có mô tả chi tiết.'}</p>
              </div>`;
            
            // Lấy câu hỏi của đề thi để sử dụng làm ví dụ
            let examples: GrammarExample[] = [];
            let selectedExamples: GrammarExample[] = [];
            
            try {
              const questionsData = await toeicExamService.getExamQuestions(exam.id);
              console.log(`Câu hỏi cho đề thi ${exam.id}:`, questionsData);
              
              // Debug: In ra dữ liệu để kiểm tra cấu trúc
              console.log('Chi tiết câu hỏi nhận được:', JSON.stringify(questionsData, null, 2));
              
              // Tạo ví dụ từ các câu hỏi
              if (questionsData && questionsData.length > 0) {
                // Lấy tất cả câu hỏi từ các nhóm
                const allQuestions = questionsData.flatMap((group: any) => {
                  console.log(`Thông tin nhóm câu hỏi:`, group);
                  return group.questions ? group.questions : [];
                });
                
                console.log('Tổng số câu hỏi:', allQuestions.length);
                console.log('Mẫu câu hỏi đầu tiên:', allQuestions[0]);
                
                // Chuyển đổi tất cả câu hỏi thành examples
                examples = allQuestions.map((q: any) => {
                  // Debug: In ra dữ liệu option cho mỗi câu hỏi
                  console.log(`Options cho câu hỏi ${q.id}:`, q.options);
                  
                  return {
                    id: q.id,
                    question: q.question,
                    answer: q.correctAnswer, // Lưu ý: Đây là optionKey (A, B, C, D) không phải optionText
                    explanation: q.explanation || "Không có giải thích chi tiết cho câu hỏi này.",
                    options: q.options || [] // Lưu lại options từ backend
                  };
                });
                
                // Nhóm câu hỏi theo nhóm gốc (nếu có)
                const questionsByGroup: Record<number, GrammarExample[]> = {};
                questionsData.forEach((group: any) => {
                  if (group.questions && group.questions.length > 0) {
                    questionsByGroup[group.id] = group.questions.map((q: any) => ({
                      id: q.id,
                      question: q.question,
                      answer: q.correctAnswer,
                      explanation: q.explanation || "Không có giải thích chi tiết cho câu hỏi này."
                    }));
                  }
                });
                
                // Lấy câu đầu tiên của mỗi nhóm làm ví dụ minh họa
                selectedExamples = Object.values(questionsByGroup).map(questions => questions[0]);
              }
            } catch (error) {
              console.error(`Lỗi khi lấy câu hỏi cho đề thi ${exam.id}:`, error);
            }
            
            // Trả về một đối tượng GrammarRule
            return {
              id: exam.id,
              title: exam.title,
              description: exam.description || `Bài học ngữ pháp về ${exam.title}`,
              content: content,
              examples: examples,
              selectedExamples: selectedExamples
            } as GrammarRule;
          });
          
          // Đợi tất cả promise hoàn thành
          const rules = await Promise.all(rulesPromises);
          
          setGrammarRules(rules.length > 0 ? rules : defaultGrammarRules);
          setSelectedRule(rules.length > 0 ? rules[0] : defaultGrammarRules[0]);
          
          // Tạo danh sách câu hỏi cho quiz từ tất cả các quy tắc
          const quizQuestionsData = loadQuizQuestions(rules);
          setQuizQuestions(quizQuestionsData);
        } else {
          console.log("Không tìm thấy đề thi ngữ pháp cho trình độ được chọn, hiển thị tất cả đề thi ngữ pháp");
          // Sử dụng tất cả các đề thi ngữ pháp nếu không có đề thi nào phù hợp với trình độ đã chọn
          const rulesPromises = allGrammarExams.map(async (exam: any) => {
            // Nếu có instructions, sử dụng làm nội dung lý thuyết
            const content = exam.instructions ? 
              `<div class="space-y-4">${formatContent(exam.instructions)}</div>` : 
              `<div class="space-y-4">
                <h3 class="text-lg font-medium mb-2">${exam.title}</h3>
                <p>${exam.description || 'Không có mô tả chi tiết.'}</p>
              </div>`;
            
            // Lấy câu hỏi của đề thi để sử dụng làm ví dụ
            let examples: GrammarExample[] = [];
            let selectedExamples: GrammarExample[] = [];
            
            try {
              const questionsData = await toeicExamService.getExamQuestions(exam.id);
              console.log(`Câu hỏi cho đề thi ${exam.id}:`, questionsData);
              
              // Debug: In ra dữ liệu để kiểm tra cấu trúc
              console.log('Chi tiết câu hỏi nhận được:', JSON.stringify(questionsData, null, 2));
              
              // Tạo ví dụ từ các câu hỏi
              if (questionsData && questionsData.length > 0) {
                // Lấy tất cả câu hỏi từ các nhóm
                const allQuestions = questionsData.flatMap((group: any) => {
                  console.log(`Thông tin nhóm câu hỏi:`, group);
                  return group.questions ? group.questions : [];
                });
                
                console.log('Tổng số câu hỏi:', allQuestions.length);
                console.log('Mẫu câu hỏi đầu tiên:', allQuestions[0]);
                
                // Chuyển đổi tất cả câu hỏi thành examples
                examples = allQuestions.map((q: any) => {
                  // Debug: In ra dữ liệu option cho mỗi câu hỏi
                  console.log(`Options cho câu hỏi ${q.id}:`, q.options);
                  
                  return {
                    id: q.id,
                    question: q.question,
                    answer: q.correctAnswer, // Lưu ý: Đây là optionKey (A, B, C, D) không phải optionText
                    explanation: q.explanation || "Không có giải thích chi tiết cho câu hỏi này.",
                    options: q.options || [] // Lưu lại options từ backend
                  };
                });
                
                // Nhóm câu hỏi theo nhóm gốc (nếu có)
                const questionsByGroup: Record<number, GrammarExample[]> = {};
                questionsData.forEach((group: any) => {
                  if (group.questions && group.questions.length > 0) {
                    questionsByGroup[group.id] = group.questions.map((q: any) => ({
                      id: q.id,
                      question: q.question,
                      answer: q.correctAnswer,
                      explanation: q.explanation || "Không có giải thích chi tiết cho câu hỏi này."
                    }));
                  }
                });
                
                // Lấy câu đầu tiên của mỗi nhóm làm ví dụ minh họa
                selectedExamples = Object.values(questionsByGroup).map(questions => questions[0]);
              }
            } catch (error) {
              console.error(`Lỗi khi lấy câu hỏi cho đề thi ${exam.id}:`, error);
            }
            
            // Trả về một đối tượng GrammarRule
            return {
              id: exam.id,
              title: exam.title,
              description: exam.description || `Bài học ngữ pháp về ${exam.title}`,
              content: content,
              examples: examples,
              selectedExamples: selectedExamples
            } as GrammarRule;
          });
          
          // Đợi tất cả promise hoàn thành
          const rules = await Promise.all(rulesPromises);
          
          setGrammarRules(rules.length > 0 ? rules : defaultGrammarRules);
          setSelectedRule(rules.length > 0 ? rules[0] : defaultGrammarRules[0]);
          
          // Tạo câu hỏi cho phần quiz, tập hợp từ tất cả các quy tắc
          const quizQuestionsData = loadQuizQuestions(rules);
          setQuizQuestions(quizQuestionsData);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu ngữ pháp:", error);
        toast.error("Không thể tải dữ liệu ngữ pháp. Đang sử dụng dữ liệu mặc định.");
        setGrammarRules(defaultGrammarRules);
        setSelectedRule(defaultGrammarRules[0]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGrammarData();
  }, [level]); // Thêm level vào dependencies để tải lại dữ liệu khi level thay đổi

  const handleSelectRule = (rule: GrammarRule) => {
    setSelectedRule(rule);
    setSelectedExample(null);
  };

  const handleSelectExample = (exampleId: number) => {
    setSelectedExample(exampleId);
  };

  const toggleExplanation = (questionId: number) => {
    setShowExplanations(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Filter grammar rules based on search query
  const filteredGrammarRules = grammarRules.filter(rule => 
    rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get paginated rules
  const getPaginatedRules = () => {
    const startIndex = (rulesPage - 1) * rulesPerPage;
    const endIndex = startIndex + rulesPerPage;
    return filteredGrammarRules.slice(startIndex, endIndex);
  };

  // Get total pages for rules pagination
  const totalRulesPages = Math.ceil(filteredGrammarRules.length / rulesPerPage);

  // Render the search bar and grammar rules list with pagination
  const renderGrammarRulesList = () => {
    return (
      <div className="space-y-2">
        <h3 className="font-medium text-lg mb-3">Danh sách quy tắc</h3>
        
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm quy tắc..."
            className="w-full pl-8 py-2 pr-4 rounded-md border border-input bg-background"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setRulesPage(1); // Reset to first page when searching
            }}
          />
        </div>
        
        {filteredGrammarRules.length > 0 ? (
          <>
            {getPaginatedRules().map((rule) => (
              <div
                key={rule.id}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  selectedRule?.id === rule.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
                onClick={() => handleSelectRule(rule)}
              >
                <h4 className="font-medium">{rule.title}</h4>
                <p className="text-sm">{rule.description}</p>
              </div>
            ))}
            
            {/* Rules pagination controls */}
            {filteredGrammarRules.length > rulesPerPage && (
              <div className="flex justify-center items-center mt-4 pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="w-8 h-8"
                    onClick={() => setRulesPage(prev => Math.max(prev - 1, 1))}
                    disabled={rulesPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(3, totalRulesPages) }, (_, i) => {
                    let pageToShow;
                    if (totalRulesPages <= 3) {
                      // If 3 or fewer pages, show all
                      pageToShow = i + 1;
                    } else if (rulesPage <= 2) {
                      // Near start
                      pageToShow = i + 1;
                    } else if (rulesPage >= totalRulesPages - 1) {
                      // Near end
                      pageToShow = totalRulesPages - 2 + i;
                    } else {
                      // Middle
                      pageToShow = rulesPage - 1 + i;
                    }
                    
                    return (
                      <Button
                        key={pageToShow}
                        variant={rulesPage === pageToShow ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setRulesPage(pageToShow)}
                      >
                        {pageToShow}
                      </Button>
                    );
                  })}
                  
                  {totalRulesPages > 3 && rulesPage < totalRulesPages - 1 && (
                    <>
                      <span className="mx-1">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setRulesPage(totalRulesPages)}
                      >
                        {totalRulesPages}
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="w-8 h-8" 
                    onClick={() => setRulesPage(prev => Math.min(prev + 1, totalRulesPages))}
                    disabled={rulesPage === totalRulesPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 text-center bg-muted rounded-md">
            <p>Không tìm thấy quy tắc nào phù hợp với "{searchQuery}"</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Grammar Practice</h1>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-muted-foreground">
          Level: {level?.replace("-", " to ")} - Master essential grammar rules for the TOEIC test
        </p>
      </div>
                  </div>

      {isLoading ? (
        <div className="h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg">Đang tải dữ liệu ngữ pháp...</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="theory" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="theory" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Lý thuyết
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Ví dụ minh họa
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Bài tập
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theory">
          <Card>
            <CardHeader>
                <CardTitle>Ngữ pháp cơ bản</CardTitle>
                <CardDescription>Học các quy tắc ngữ pháp tiếng Anh cơ bản</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1 space-y-2">
                    {renderGrammarRulesList()}
                  </div>

                  <div className="md:col-span-3">
                    {selectedRule && (
                      <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-xl font-bold mb-4 text-primary">{selectedRule.title}</h2>
                        <div 
                          className="prose max-w-none grammar-content"
                          dangerouslySetInnerHTML={{ __html: selectedRule.content }}
                        />
                        
                        <Alert className="mt-6 bg-primary/5 border-primary/20">
                          <AlertCircle className="h-4 w-4 text-primary" />
                          <AlertTitle className="text-primary">Mẹo học</AlertTitle>
                          <AlertDescription>
                            Để ghi nhớ tốt các quy tắc ngữ pháp, hãy luyện tập thường xuyên và áp dụng vào các tình huống thực tế. Chuyển sang tab "Ví dụ minh họa" để xem các ví dụ cụ thể và tab "Bài tập" để kiểm tra kiến thức của bạn.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                </div>

                {/* <div className="flex justify-between mt-8">
                <Button variant="outline">Previous</Button>
                <Button>Next</Button>
              </div> */}
            </CardContent>
          </Card>
        </TabsContent>
          
          <TabsContent value="examples">
            <Card>
              <CardHeader>
                <CardTitle>Ví dụ minh họa</CardTitle>
                <CardDescription>Các ví dụ giúp hiểu rõ quy tắc ngữ pháp</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1 space-y-2">
                    {renderGrammarRulesList()}
                  </div>

                  <div className="md:col-span-3">
                    {selectedRule && (
                      <>
                        <h2 className="text-xl font-bold mb-4">Ví dụ cho: {selectedRule.title}</h2>
                        
                        {selectedRule.selectedExamples && selectedRule.selectedExamples.length > 0 ? (
                          <div className="space-y-6">
                            {selectedRule.selectedExamples.map((example) => (
                              <div 
                                key={example.id} 
                                className={`p-4 border rounded-lg ${
                                  selectedExample === example.id ? "border-primary" : ""
                                }`}
                                onClick={() => handleSelectExample(example.id)}
                              >
                                <p className="font-medium mb-2">Câu {example.id}: {example.question}</p>
                                <p className="text-green-600 font-medium mb-2">Đáp án: {example.answer}</p>
                                <p className="text-gray-600">
                                  <span className="font-medium">Giải thích:</span> {example.explanation}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 border rounded-lg">
                            <p className="text-center text-muted-foreground">Không có ví dụ cho chủ đề này</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz">
          <Card>
            <CardHeader>
              <CardTitle>Grammar Quiz</CardTitle>
              <CardDescription>Test your knowledge of grammar rules</CardDescription>
            </CardHeader>
            <CardContent>
              {quizQuestions.length > 0 ? (
                <div className="space-y-8">
                  {/* Chỉ hiển thị câu hỏi thuộc quy tắc ngữ pháp đang được chọn */}
                  {selectedRule && (
              <div className="space-y-6">
                      <h3 className="text-lg font-medium">{selectedRule.title}</h3>
                      
                      {quizQuestions
                        .filter(q => q.ruleId === selectedRule.id)
                        .map((question, index) => (
                        <div key={question.id} className="space-y-4 border rounded-lg p-4">
                    <p className="font-medium">
                      {index + 1}. {question.question}
                    </p>
                          <RadioGroup 
                            value={userAnswers[question.id] || ""}
                            onValueChange={(value) => 
                              setUserAnswers(prev => ({...prev, [question.id]: value}))
                            }
                          >
                            {question.options.map((option) => (
                              <div key={option.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.key} id={`q${question.id}-${option.key}`} />
                                <Label htmlFor={`q${question.id}-${option.key}`}>
                                  <span className="font-medium mr-2">{option.key}.</span>
                                  {option.text}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleExplanation(question.id)}
                            >
                              <HelpCircle className="h-4 w-4 mr-1" />
                              {showExplanations[question.id] ? "Ẩn giải thích" : "Xem giải thích"}
                            </Button>
                            
                            {userAnswers[question.id] && (
                              <span className={
                                userAnswers[question.id] === question.answer 
                                  ? "text-green-600 font-medium" 
                                  : "text-red-600 font-medium"
                              }>
                                {userAnswers[question.id] === question.answer ? "✓ Đúng" : "✗ Sai"}
                              </span>
                            )}
                          </div>
                          
                          {showExplanations[question.id] && (
                            <div className="p-3 bg-muted rounded-md">
                              <p><span className="font-medium">Đáp án đúng:</span> {question.answer}</p>
                              <p><span className="font-medium">Giải thích:</span> {
                                // Tìm giải thích từ câu hỏi gốc
                                grammarRules.flatMap(rule => rule.examples)
                                  .find(ex => ex.id === question.id)?.explanation || 
                                "Không có giải thích chi tiết cho câu hỏi này."
                              }</p>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {quizQuestions.filter(q => q.ruleId === selectedRule.id).length === 0 && (
                        <div className="p-8 text-center">
                          <p className="text-muted-foreground">Không có câu hỏi cho bài kiểm tra này</p>
                        </div>
                      )}
                    </div>
                  )}
                  </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Không có câu hỏi cho bài kiểm tra này</p>
              </div>
              )}

              {/* <div className="mt-8 flex justify-end">
                <Button>Submit Answers</Button>
              </div> */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
    </div>
  )
}
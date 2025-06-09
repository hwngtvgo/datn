"use client"

import { useParams, Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Volume2, BookmarkPlus, Loader2, HelpCircle } from "lucide-react"
import { toast } from "sonner"
import * as toeicExamService from "@/services/toeicExamService"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Định nghĩa interface cho từ vựng
interface VocabularyWord {
  id: number;
  word: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  synonyms: string[];
  category: string;
  audioUrl?: string;
  correctWord: string;
  englishMeaning: string;
  vietnameseMeaning: string;
  examId: number; // Thêm trường examId để biết từ thuộc đề nào
}

// Định nghĩa interface cho đề thi từ vựng
interface VocabularyExam {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  words: VocabularyWord[];
}

// Định nghĩa kiểu dữ liệu cho câu hỏi quiz từ vựng
interface VocabularyQuizQuestion {
  id: number;
  question: string;     // Câu có từ khuyết
  options: {
    id: number;
    key: string;       // A, B, C, D
    text: string;      // Từ vựng
  }[];
  answer: string;      // Đáp án đúng (key: A, B, C, D)
  explanation: string; // Giải thích
  correctWord: string; // Từ đúng
  vietnameseMeaning: string; // Nghĩa tiếng Việt
}

// Dữ liệu mặc định để hiển thị khi API đang tải
const defaultVocabularyExams: VocabularyExam[] = [
  {
    id: 1,
    title: "Business Vocabulary",
    description: "Essential vocabulary for business communication",
    difficulty: "MEDIUM",
    words: [
      {
        id: 1,
        word: "The company has implemented a new policy to reduce waste.",
        partOfSpeech: "verb",
        definition: "Put (a decision, plan, agreement, etc.) into effect",
        example: "implement",
        synonyms: ["execute", "apply", "carry out"],
        category: "Business",
        correctWord: "implement",
        englishMeaning: "Put (a decision, plan, agreement, etc.) into effect",
        vietnameseMeaning: "Thực hiện (một quyết định, kế hoạch, thỏa thuận, v.v.)",
        examId: 1
      },
      {
        id: 2,
        word: "They negotiated a new contract with the supplier.",
        partOfSpeech: "verb",
        definition: "Try to reach an agreement or compromise by discussion",
        example: "negotiate",
        synonyms: ["bargain", "discuss terms", "confer"],
        category: "Business",
        correctWord: "negotiate",
        englishMeaning: "Try to reach an agreement or compromise by discussion",
        vietnameseMeaning: "Thương lượng, đàm phán để đạt được thỏa thuận",
        examId: 1
      }
    ]
  }
];

export default function VocabularyPage() {
  const { level } = useParams()
  const [vocabularyExams, setVocabularyExams] = useState<VocabularyExam[]>(defaultVocabularyExams)
  const [selectedExamIndex, setSelectedExamIndex] = useState(0)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showDefinition, setShowDefinition] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [quizQuestions, setQuizQuestions] = useState<VocabularyQuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});
  
  // Tham chiếu đến thẻ audio
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tạo câu hỏi cho phần quiz từ danh sách từ vựng
  const loadQuizQuestions = (exams: VocabularyExam[]) => {
    const questions: VocabularyQuizQuestion[] = [];
    
    exams.forEach(exam => {
      // Lấy các từ từ mỗi đề thi
      const words = exam.words.map(word => {
        // Tạo các lựa chọn cho câu hỏi (A, B, C, D)
        // với 1 đáp án đúng và 3 đáp án sai ngẫu nhiên từ các từ khác
        const correctOption = {
          id: word.id,
          key: "A",
          text: word.correctWord
        };
        
        // Lấy ngẫu nhiên 3 từ khác từ danh sách
        let otherWords = exam.words
          .filter(w => w.id !== word.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
          
        // Nếu không đủ 3 từ khác, tạo một số từ mẫu
        while (otherWords.length < 3) {
          otherWords.push({
            ...word,
            id: -Math.random(),
            correctWord: `Option ${otherWords.length + 1}`
          });
        }
        
        // Tạo các option B, C, D
        const otherOptions = otherWords.map((w, index) => ({
          id: w.id,
          key: ["B", "C", "D"][index],
          text: w.correctWord
        }));
        
        // Trộn các lựa chọn
        const allOptions = [correctOption, ...otherOptions].sort((a, b) => a.key.localeCompare(b.key));
        
        // Tạo câu hỏi với chỗ khuyết ở vị trí của từ đúng
        let quizQuestion = word.word;
        if (quizQuestion && word.correctWord) {
          if (quizQuestion.includes('_____')) {
            // Đã có chỗ khuyết, giữ nguyên
          } else {
            // Thay thế từ đúng bằng chỗ khuyết
            quizQuestion = quizQuestion.replace(word.correctWord, '_____');
          }
        }
        
        return {
          id: word.id,
          question: quizQuestion,
          options: allOptions,
          answer: "A", // Đáp án luôn là A (vì chúng ta đã đặt từ đúng ở option A)
          explanation: `Từ "${word.correctWord}" được sử dụng trong câu này vì ${word.vietnameseMeaning}`,
          correctWord: word.correctWord,
          vietnameseMeaning: word.vietnameseMeaning
        };
      });
      
      questions.push(...words);
    });
    
    return questions;
  };

  // Tải dữ liệu từ vựng từ API
  useEffect(() => {
    const loadVocabularyData = async () => {
      setIsLoading(true);
      try {
        // Lấy tất cả các đề thi từ vựng
        const examsResponse = await toeicExamService.getAllExams(0, 1000);
        console.log("Dữ liệu đề thi từ API:", examsResponse);
        
        // Lọc các đề thi có loại là VOCABULARY_ONLY
        const allVocabularyExams = examsResponse.content ? 
          examsResponse.content.filter((exam: any) => exam.type === 'VOCABULARY_ONLY') : [];
        
        console.log("Đề thi từ vựng:", allVocabularyExams);
        
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
              console.log("Định dạng level không hợp lệ, hiển thị tất cả từ vựng");
            }
          }
        } else {
          console.log("Không có tham số level hoặc không đúng định dạng, hiển thị tất cả từ vựng");
        }
        
        // Lọc đề thi theo trình độ nếu cần
        let vocabularyExams = allVocabularyExams;
        if (shouldFilter && targetDifficulties.length > 0) {
          vocabularyExams = allVocabularyExams.filter((exam: any) => 
            targetDifficulties.includes(exam.difficulty)
          );
          
          console.log("Đề thi từ vựng sau khi lọc theo trình độ:", vocabularyExams);
        } else {
          console.log("Hiển thị tất cả đề thi từ vựng không lọc:", vocabularyExams.length, "đề thi");
        }
        
        if (vocabularyExams.length > 0) {
          // Tạo mảng để lưu trữ các đề thi với từ vựng
          const formattedExams: VocabularyExam[] = [];
          
          // Mảng chứa các promise để đợi xử lý tất cả các đề thi
          const examsPromises = vocabularyExams.map(async (exam: any) => {
            // Lấy câu hỏi từ vựng của đề thi
            let words: VocabularyWord[] = [];
            
            try {
              const questionsData = await toeicExamService.getExamQuestions(exam.id);
              console.log(`Dữ liệu từ vựng cho đề thi ${exam.id}:`, questionsData);
              
              // Tạo danh sách từ vựng từ dữ liệu API
              if (questionsData && questionsData.length > 0) {
                // Lấy tất cả từ vựng từ các nhóm
                const allWords = questionsData.flatMap((group: any) => {
                  console.log(`Thông tin nhóm từ vựng:`, group);
                  return group.questions ? group.questions : [];
                });
                
                console.log('Tổng số từ vựng:', allWords.length);
                
                if (allWords.length > 0) {
                  console.log('Mẫu từ vựng đầu tiên:', allWords[0]);
                }
                
                // Chuyển đổi tất cả từ thành format VocabularyWord
                words = allWords.map((word: any) => {
                  // Tách thông tin từ đúng, nghĩa tiếng Anh và tiếng Việt
                  let correctWord = "";
                  let englishMeaning = "";
                  let vietnameseMeaning = "";
                  
                  if (word.explanation) {
                    // Tìm kiếm mẫu "Từ đúng: X - Nghĩa: Y"
                    const match = word.explanation.match(/Từ đúng:\s*(\w+)\s*-\s*Nghĩa:\s*(.*)/i);
                    if (match) {
                      correctWord = match[1]?.trim() || "";
                      vietnameseMeaning = match[2]?.trim() || "";
                      
                      // Nghĩa tiếng Anh có thể lấy từ định nghĩa của từ, hoặc từ options
                      const correctOption = word.options?.find((o: any) => o.optionKey === word.correctAnswer);
                      if (correctOption) {
                        // Lấy từ đúng từ options nếu chưa có
                        if (!correctWord) correctWord = correctOption.optionText || "";
                      }
                    } else {
                      // Nếu không khớp mẫu, lưu toàn bộ explanation vào nghĩa tiếng Việt
                      vietnameseMeaning = word.explanation;
                    }
                  }
                  
                  // Nghĩa tiếng Anh mặc định là từ đáp án
                  if (word.options?.length > 0) {
                    const correctOptionText = word.options.find((o: any) => o.optionKey === word.correctAnswer)?.optionText || "";
                    
                    // Nếu từ đúng chưa được xác định, sử dụng optionText
                    if (!correctWord) {
                      correctWord = correctOptionText;
                    }
                    
                    // Sử dụng các tùy chọn khác làm nghĩa tiếng Anh
                    if (!englishMeaning) {
                      // Thử tìm định nghĩa tiếng Anh từ các tùy chọn khác
                      const meaningOptions = word.options.filter((o: any) => o.optionKey !== word.correctAnswer);
                      if (meaningOptions.length > 0) {
                        englishMeaning = meaningOptions[0].optionText || "";
                      } else {
                        englishMeaning = `The word "${correctWord}" to fill in the blank`;
                      }
                    }
                  }
                
                  // Đảm bảo có nghĩa tiếng Anh và tiếng Việt
                  if (!englishMeaning) {
                    englishMeaning = `The word that means "${vietnameseMeaning}" in English`;
                  }
                  
                  if (!vietnameseMeaning) {
                    vietnameseMeaning = "Từ cần điền vào chỗ trống trong câu";
                  }
                  
                  return {
                    id: word.id,
                    word: word.question, // Câu có từ bị khuyết
                    partOfSpeech: word.category || "", 
                    definition: word.correctAnswer, // Mã đáp án (A, B, C, D)
                    example: word.options?.find((o: any) => o.optionKey === word.correctAnswer)?.optionText || "", 
                    synonyms: word.explanation ? [word.explanation] : [],
                    correctWord, // Từ cần điền vào chỗ trống
                    englishMeaning, // Nghĩa tiếng Anh
                    vietnameseMeaning, // Nghĩa tiếng Việt
                    category: exam.title, 
                    audioUrl: word.audioUrl,
                    examId: exam.id // Thêm ID của đề thi
                  };
                });

                // Thêm đề thi với từ vựng vào mảng kết quả
                formattedExams.push({
                  id: exam.id,
                  title: exam.title,
                  description: exam.description || "",
                  difficulty: exam.difficulty,
                  words: words
                });
              }
            } catch (error) {
              console.error(`Lỗi khi lấy từ vựng cho đề thi ${exam.id}:`, error);
            }
          });
          
          // Đợi tất cả promise hoàn thành
          await Promise.all(examsPromises);
          
          if (formattedExams.length > 0) {
            setVocabularyExams(formattedExams);
            setSelectedExamIndex(0);
            setCurrentWordIndex(0);
            console.log("Đã tải xong từ vựng:", formattedExams);
            
            // Tạo danh sách câu hỏi cho quiz từ tất cả các đề thi
            const quizQuestionsData = loadQuizQuestions(formattedExams);
            setQuizQuestions(quizQuestionsData);
          } else {
            console.log("Không tìm thấy dữ liệu từ vựng từ API");
            toast.warning("Không tìm thấy dữ liệu từ vựng phù hợp. Đang sử dụng dữ liệu mẫu.");
            setVocabularyExams(defaultVocabularyExams);
          }
        } else {
          console.log("Không tìm thấy đề thi từ vựng");
          toast.warning("Không tìm thấy dữ liệu từ vựng phù hợp. Đang sử dụng dữ liệu mẫu.");
          setVocabularyExams(defaultVocabularyExams);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ vựng:", error);
        toast.error("Không thể tải dữ liệu từ vựng. Đang sử dụng dữ liệu mẫu.");
        setVocabularyExams(defaultVocabularyExams);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVocabularyData();
  }, [level]);

  // Lấy đề thi đang được chọn
  const selectedExam = vocabularyExams[selectedExamIndex] || defaultVocabularyExams[0];
  
  // Lấy từ vựng đang được hiển thị
  const currentWord = selectedExam.words[currentWordIndex] || selectedExam.words[0];

  // Xử lý khi chọn một đề thi khác
  const handleSelectExam = (index: number) => {
    setSelectedExamIndex(index);
    setCurrentWordIndex(0);
    setShowDefinition(false);
  };

  const handleNext = () => {
    if (currentWordIndex < selectedExam.words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
      setShowDefinition(false)
    }
  }

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1)
      setShowDefinition(false)
    }
  }

  const playAudio = () => {
    if (currentWord.audioUrl) {
      if (audioRef.current) {
        audioRef.current.src = currentWord.audioUrl;
        audioRef.current.play();
      }
    } else {
      // Nếu không có file audio, sử dụng Web Speech API
      const utterance = new SpeechSynthesisUtterance(currentWord.correctWord);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
    
    console.log(`Playing audio for: ${currentWord.correctWord}`);
  }

  const saveToNotes = () => {
    // Trong ứng dụng thực, sẽ lưu từ vào ghi chú của người dùng
    toast.success(`Đã lưu từ "${currentWord.correctWord}" vào ghi chú`);
  }

  // Hàm toggle giải thích cho phần quiz
  const toggleExplanation = (questionId: number) => {
    setShowExplanations(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Xử lý hiển thị flashcard
  const renderFlashcardContent = () => {
    // Đảm bảo có dữ liệu từ vựng hợp lệ
    if (!currentWord) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Không có dữ liệu từ vựng</p>
        </div>
      );
    }
    
    if (!showDefinition) {
      // Mặt trước: CHỈ hiển thị nghĩa tiếng Việt
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-2">Nghĩa tiếng Việt</h3>
          <p className="text-xl font-medium">
            {currentWord.vietnameseMeaning || "Không có nghĩa tiếng Việt"}
          </p>
          
          <p className="text-xs mt-8 text-muted-foreground">Nhấp để xem từ tiếng Anh</p>
        </div>
      );
    } else {
      // Mặt sau: CHỈ hiển thị từ tiếng Anh và ví dụ
      // Xử lý câu ví dụ với từ đúng đã được thay thế
      let completedExample = currentWord.word;
      if (currentWord.word && currentWord.word.includes('_____')) {
        completedExample = currentWord.word.replace('_____', `<strong>${currentWord.correctWord}</strong>`);
      } else if (currentWord.word && currentWord.correctWord) {
        completedExample = currentWord.word.replace(currentWord.correctWord, `<strong>${currentWord.correctWord}</strong>`);
      }

      return (
        <div className="space-y-3">
          <h2 className="text-2xl font-bold mb-2">{currentWord.correctWord}</h2>
          {currentWord.partOfSpeech && (
            <p className="text-xs text-muted-foreground italic mb-2">({currentWord.partOfSpeech})</p>
          )}
          
          <h3 className="text-sm font-medium mb-1">Ví dụ:</h3>
          <p className="text-sm italic" dangerouslySetInnerHTML={{ __html: completedExample }}></p>
        </div>
      );
    }
  };

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Vocabulary Practice</h1>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-muted-foreground">
            Level: {level?.replace("-", " to ")} - Learn essential TOEIC vocabulary
          </p>

        </div>
      </div>

      {/* Tạo thẻ audio nhưng ẩn đi */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      {isLoading ? (
        <div className="h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg">Đang tải dữ liệu từ vựng...</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="flashcards">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="wordlist">Word List</TabsTrigger>
          </TabsList>

          {/* Tab Flashcards */}
          <TabsContent value="flashcards">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Danh sách đề thi từ vựng bên trái */}
              <div className="md:col-span-1 space-y-2">
                <h3 className="font-medium text-lg mb-3">Vocabulary Topics</h3>
                {vocabularyExams.map((exam, index) => (
                  <div
                    key={exam.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedExamIndex === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    onClick={() => handleSelectExam(index)}
                  >
                    <h4 className="font-medium">{exam.title}</h4>
                    <p className="text-sm">{exam.description}</p>
                    <div className="flex justify-end mt-1">
                      <span className="text-xs">{exam.words.length} words</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Flashcard hiển thị bên phải */}
              <div className="md:col-span-3">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground">
                      Card {currentWordIndex + 1} of {selectedExam.words.length}
                    </span>
                    <Progress value={((currentWordIndex + 1) / selectedExam.words.length) * 100} className="w-1/3" />
                    <Badge variant="outline">{selectedExam.title}</Badge>
                  </div>

                  <Card
                    className="w-full h-80 flex flex-col items-center justify-center cursor-pointer mb-6 relative overflow-hidden"
                    onClick={() => setShowDefinition(!showDefinition)}
                  >
                    <CardContent className="flex flex-col items-center justify-center h-full w-full text-center p-6">
                      {renderFlashcardContent()}
                    </CardContent>
                  </Card>

                  <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={handlePrevious} disabled={currentWordIndex === 0}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>

                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={playAudio}>
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={saveToNotes}>
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleNext}
                      disabled={currentWordIndex === selectedExam.words.length - 1}
                    >
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab Quiz */}
          <TabsContent value="quiz">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Danh sách đề thi từ vựng bên trái */}
              <div className="md:col-span-1 space-y-2">
                <h3 className="font-medium text-lg mb-3">Vocabulary Topics</h3>
                {vocabularyExams.map((exam, index) => (
                  <div
                    key={exam.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedExamIndex === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    onClick={() => handleSelectExam(index)}
                  >
                    <h4 className="font-medium">{exam.title}</h4>
                    <p className="text-sm">{exam.description}</p>
                    <div className="flex justify-end mt-1">
                      <span className="text-xs">{exam.words.length} words</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quiz bên phải */}
              <div className="md:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Vocabulary Quiz: {selectedExam.title}</CardTitle>
                    <CardDescription>Điền từ vựng thích hợp vào chỗ trống</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {quizQuestions.filter(q => selectedExam.words.some(w => w.id === q.id)).length > 0 ? (
                      <div className="space-y-8">
                        {quizQuestions
                          .filter(q => selectedExam.words.some(w => w.id === q.id))
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
                                  <p><span className="font-medium">Đáp án đúng:</span> {question.correctWord}</p>
                                  <p><span className="font-medium">Nghĩa:</span> {question.vietnameseMeaning}</p>
                                </div>
                              )}
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <h2 className="text-2xl font-bold mb-4">Vocabulary Quiz</h2>
                        <p className="text-muted-foreground mb-8">Không có câu hỏi cho chủ đề này</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab Word List (giữ nguyên nội dung) */}
          <TabsContent value="wordlist">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Danh sách đề thi từ vựng bên trái */}
              <div className="md:col-span-1 space-y-2">
                <h3 className="font-medium text-lg mb-3">Vocabulary Topics</h3>
                {vocabularyExams.map((exam, index) => (
                  <div
                    key={exam.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedExamIndex === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    onClick={() => handleSelectExam(index)}
                  >
                    <h4 className="font-medium">{exam.title}</h4>
                    <p className="text-sm">{exam.description}</p>
                    <div className="flex justify-end mt-1">
                      <span className="text-xs">{exam.words.length} words</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Danh sách từ vựng bên phải */}
              <div className="md:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedExam.title}</CardTitle>
                    <CardDescription>{selectedExam.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg divide-y">
                      {selectedExam.words.map((word) => (
                        <div key={word.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="sm:w-1/4">
                            <h3 className="font-bold">{word.correctWord}</h3>
                            {/* <p className="text-sm text-muted-foreground">({word.partOfSpeech})</p> */}
                          </div>
                          <div className="sm:w-2/4">
                            <p>{word.vietnameseMeaning}</p>
                            <p className="text-sm italic mt-1" 
                              dangerouslySetInnerHTML={{ 
                                __html: word.word.replace('_____', `<strong>${word.correctWord}</strong>`) 
                              }}
                            ></p>
                          </div>
                          <div className="sm:w-1/4 flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              // Đặt từ hiện tại và chơi âm thanh
                              setCurrentWordIndex(selectedExam.words.findIndex(w => w.id === word.id));
                              setTimeout(() => playAudio(), 100);
                            }}>
                              <Volume2 className="h-4 w-4 mr-2" /> Listen
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => {
                              // Đặt từ hiện tại và lưu vào ghi chú
                              setCurrentWordIndex(selectedExam.words.findIndex(w => w.id === word.id));
                              saveToNotes();
                            }}>
                              <BookmarkPlus className="h-4 w-4 mr-2" /> Save
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

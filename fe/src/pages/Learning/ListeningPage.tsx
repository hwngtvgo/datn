// "use client"

// import { useParams, Link } from "react-router-dom"
// import { useState, useEffect, useRef } from "react"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Slider } from "@/components/ui/slider"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
// import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2 } from "lucide-react"
// import { toast } from "sonner"
// import * as toeicExamService from "@/services/toeicExamService"

// // Định nghĩa interface cho bài tập nghe
// interface ListeningExercise {
//   id: number;
//   title: string;
//   description: string;
//   instructions?: string;
//   audioUrl?: string;
//   transcript?: string;
//   questionGroups?: any[];
//   questions: ListeningQuestion[];
// }

// interface ListeningQuestion {
//   id: number;
//   question: string;
//   options: {
//     id: number;
//     optionKey: string;
//     optionText: string;
//   }[];
//   correctAnswer: string;
//   explanation?: string;
// }

// // Dữ liệu mẫu để hiển thị khi API đang tải
// const defaultListeningExercises: ListeningExercise[] = [
//   {
//     id: 1,
//     title: "Business Meeting",
//     description: "Listen to a conversation between colleagues discussing a project",
//     audioUrl: "/audio/business-meeting.mp3",
//     transcript:
//       "Woman: Good morning, John. Do you have a minute to discuss the Johnson project?\nMan: Sure, Sarah. What's on your mind?\nWoman: I'm concerned about the timeline. The client wants the first phase completed by the end of the month, but I think we need more time.\nMan: I see. Have you spoken with the project manager about this?\nWoman: Not yet. I wanted to get your input first since you've worked with this client before.\nMan: I appreciate that. In my experience, they're usually flexible if we provide a good reason for the delay. Let's schedule a call with them tomorrow to discuss our concerns.\nWoman: That sounds like a good plan. I'll prepare some talking points for the call.\nMan: Great. I'll also review the project schedule to see if there are any tasks we can expedite.",
//     questions: [
//       {
//         id: 101,
//         question: "What is the woman concerned about?",
//         options: [
//           { id: 1, optionKey: "A", optionText: "The project budget" },
//           { id: 2, optionKey: "B", optionText: "The project timeline" },
//           { id: 3, optionKey: "C", optionText: "The client's expectations" },
//           { id: 4, optionKey: "D", optionText: "The project manager" }
//         ],
//         correctAnswer: "B",
//       }
//     ],
//   }
// ];

// export default function ListeningPage() {
//   const { level } = useParams()
//   const [listeningExercises, setListeningExercises] = useState<ListeningExercise[]>(defaultListeningExercises);
//   const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [currentTime, setCurrentTime] = useState(0)
//   const [duration, setDuration] = useState(100)
//   const [volume, setVolume] = useState(80)
//   const [showTranscript, setShowTranscript] = useState(false)
//   const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
//   const [isLoading, setIsLoading] = useState(true)
  
//   // Tham chiếu đến thẻ audio
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   // Lấy đề thi nghe từ API
//   useEffect(() => {
//     const loadListeningData = async () => {
//       setIsLoading(true);
//       try {
//         // Lấy tất cả các đề thi để tìm các đề thi nghe
//         const examsResponse = await toeicExamService.getAllExams(0, 1000);
//         console.log("Dữ liệu đề thi từ API:", examsResponse);
        
//         // Lọc các đề thi có loại là LISTENING_ONLY
//         const allListeningExams = examsResponse.content ? 
//           examsResponse.content.filter((exam: any) => exam.type === 'LISTENING_ONLY') : [];
        
//         console.log("Đề thi nghe:", allListeningExams);
        
//         // Xác định mức độ dựa theo URL
//         let targetDifficulties: string[] = [];
//         let shouldFilter = false;
        
//         if (level && level.includes("-")) {
//           // URL có định dạng số điểm, ví dụ: 0-300, 300-600, 600-800
//           if (level.match(/^\d+-\d+$/)) {
//             const [min, max] = level.split("-").map(Number);
            
//             if (min >= 0 && max <= 300) {
//               targetDifficulties = ["EASY"];
//               shouldFilter = true;
//               console.log("Lọc theo mức độ: Dễ (0-300)");
//             } else if (min >= 300 && max <= 600) {
//               targetDifficulties = ["MEDIUM"];
//               shouldFilter = true;
//               console.log("Lọc theo mức độ: Trung bình (300-600)");
//             } else if (min >= 600 && max <= 800) {
//               targetDifficulties = ["HARD"];
//               shouldFilter = true;
//               console.log("Lọc theo mức độ: Khó (600-800)");
//             }
//           } else {
//             // Xử lý chuỗi level từ URL theo cách cũ, ví dụ: "beginner-intermediate"
//             const levelParts = level.split('-');
//             const difficultyMap: Record<string, string> = {
//               "beginner": "EASY",
//               "intermediate": "MEDIUM",
//               "advanced": "HARD"
//             };
            
//             // Kiểm tra xem có phải format hợp lệ không
//             const isValidFormat = levelParts.every(part => difficultyMap[part]);
            
//             if (isValidFormat) {
//               // Ánh xạ các giá trị từ URL sang các giá trị difficulty trong backend
//               targetDifficulties = levelParts.map(part => difficultyMap[part] || part.toUpperCase());
//               shouldFilter = true;
//               console.log("Đang lọc theo các trình độ:", targetDifficulties);
//             } else {
//               console.log("Định dạng level không hợp lệ, hiển thị tất cả bài tập nghe");
//             }
//           }
//         } else {
//           console.log("Không có tham số level hoặc không đúng định dạng, hiển thị tất cả bài tập nghe");
//         }
        
//         // Lọc đề thi theo trình độ nếu cần
//         let listeningExams = allListeningExams;
//         if (shouldFilter && targetDifficulties.length > 0) {
//           listeningExams = allListeningExams.filter((exam: any) => 
//             targetDifficulties.includes(exam.difficulty)
//           );
          
//           console.log("Đề thi nghe sau khi lọc theo trình độ:", listeningExams);
//         } else {
//           console.log("Hiển thị tất cả đề thi nghe không lọc:", listeningExams.length, "đề thi");
//         }
        
//         if (listeningExams.length > 0) {
//           // Mảng chứa các promise để đợi xử lý tất cả các đề thi
//           const exercisesPromises = listeningExams.map(async (exam: any) => {
//             // Lấy câu hỏi của đề thi
//             let questions: ListeningQuestion[] = [];
            
//             try {
//               const questionsData = await toeicExamService.getExamQuestions(exam.id);
//               console.log(`Câu hỏi cho đề thi ${exam.id}:`, questionsData);
              
//               // Tạo câu hỏi từ dữ liệu API
//               if (questionsData && questionsData.length > 0) {
//                 // Lấy tất cả câu hỏi từ các nhóm
//                 const allQuestions = questionsData.flatMap((group: any) => {
//                   console.log(`Thông tin nhóm câu hỏi:`, group);
//                   return group.questions ? group.questions : [];
//                 });
                
//                 console.log('Tổng số câu hỏi:', allQuestions.length);
//                 if (allQuestions.length > 0) {
//                   console.log('Mẫu câu hỏi đầu tiên:', allQuestions[0]);
//                 }
                
//                 // Chuyển đổi tất cả câu hỏi thành format listening question
//                 questions = allQuestions.map((q: any) => ({
//                   id: q.id,
//                   question: q.question,
//                   options: q.options || [],
//                   correctAnswer: q.correctAnswer,
//                   explanation: q.explanation || "Không có giải thích chi tiết cho câu hỏi này."
//                 }));
//               }
//             } catch (error) {
//               console.error(`Lỗi khi lấy câu hỏi cho đề thi ${exam.id}:`, error);
//             }
            
//             // Trả về một đối tượng ListeningExercise
//             return {
//               id: exam.id,
//               title: exam.title,
//               description: exam.description || `Bài tập luyện nghe ${exam.title}`,
//               audioUrl: exam.resources?.find((r: any) => r.type === "AUDIO")?.url || "",
//               transcript: exam.instructions || "",
//               questions: questions,
//               questionGroups: questionsData
//             } as ListeningExercise;
//           });
          
//           // Đợi tất cả promise hoàn thành
//           const exercises = await Promise.all(exercisesPromises);
          
//           // Lọc các bài tập có file audio
//           const exercisesWithAudio = exercises.filter(ex => ex.audioUrl);
          
//           if (exercisesWithAudio.length > 0) {
//             setListeningExercises(exercisesWithAudio);
//             setCurrentExerciseIndex(0);
//             console.log("Đã tải xong bài tập nghe:", exercisesWithAudio);
//           } else {
//             console.log("Không tìm thấy bài tập nghe có file audio");
//             toast.warning("Không tìm thấy bài tập nghe phù hợp. Đang sử dụng dữ liệu mẫu.");
//             setListeningExercises(defaultListeningExercises);
//           }
//         } else {
//           console.log("Không tìm thấy đề thi nghe");
//           toast.warning("Không tìm thấy bài tập nghe phù hợp. Đang sử dụng dữ liệu mẫu.");
//           setListeningExercises(defaultListeningExercises);
//         }
//       } catch (error) {
//         console.error("Lỗi khi tải dữ liệu bài tập nghe:", error);
//         toast.error("Không thể tải dữ liệu bài tập nghe. Đang sử dụng dữ liệu mẫu.");
//         setListeningExercises(defaultListeningExercises);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     loadListeningData();
//   }, [level]);

//   // Lấy bài tập hiện tại
//   const currentExercise = listeningExercises[currentExerciseIndex];
  
//   // Cập nhật audio khi thay đổi bài tập
//   useEffect(() => {
//     if (!currentExercise?.audioUrl) return;
    
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.src = currentExercise.audioUrl;
//       audioRef.current.load();
//       setIsPlaying(false);
//       setCurrentTime(0);
      
//       // Thêm các sự kiện lắng nghe
//       const handleLoadedMetadata = () => {
//         if (audioRef.current) {
//           setDuration(audioRef.current.duration);
//         }
//       };
      
//       const handleTimeUpdate = () => {
//         if (audioRef.current) {
//           setCurrentTime(audioRef.current.currentTime);
//         }
//       };
      
//       const handleEnded = () => {
//         setIsPlaying(false);
//       };
      
//       audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
//       audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
//       audioRef.current.addEventListener('ended', handleEnded);
      
//       // Cleanup
//       return () => {
//         if (audioRef.current) {
//           audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
//           audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
//           audioRef.current.removeEventListener('ended', handleEnded);
//         }
//       };
//     }
//   }, [currentExercise]);

//   // Xử lý phát/tạm dừng
//   const handlePlayPause = () => {
//     if (!audioRef.current) return;
    
//     if (isPlaying) {
//       audioRef.current.pause();
//     } else {
//       audioRef.current.play();
//     }
    
//     setIsPlaying(!isPlaying);
//   };

//   // Xử lý thay đổi thời gian
//   const handleTimeChange = (value: number[]) => {
//     if (!audioRef.current) return;
    
//     const newTime = value[0];
//     audioRef.current.currentTime = newTime;
//     setCurrentTime(newTime);
//   };

//   // Xử lý thay đổi âm lượng
//   const handleVolumeChange = (value: number[]) => {
//     if (!audioRef.current) return;
    
//     const newVolume = value[0] / 100;
//     audioRef.current.volume = newVolume;
//     setVolume(value[0]);
//   };

//   // Xử lý chuyển đổi bài tập
//   const handleExerciseChange = (index: number) => {
//     if (index >= 0 && index < listeningExercises.length) {
//       setCurrentExerciseIndex(index);
//     }
//   };

//   // Xử lý lựa chọn câu trả lời
//   const handleAnswerSelect = (questionId: number, answer: string) => {
//     setSelectedAnswers({
//       ...selectedAnswers,
//       [questionId]: answer,
//     });
//   };

//   // Format thời gian
//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   // Kiểm tra đáp án
//   const checkAnswers = () => {
//     let correct = 0;
//     let total = currentExercise.questions.length;
    
//     currentExercise.questions.forEach(question => {
//       if (selectedAnswers[question.id] === question.correctAnswer) {
//         correct++;
//       }
//     });
    
//     toast.success(`Kết quả: ${correct}/${total} câu đúng`);
//   };

//   return (
//     <div className="container py-10">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold tracking-tight mb-2">Listening Practice</h1>
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <p className="text-muted-foreground">
//             Level: {level?.replace("-", " to ")} - Improve your listening comprehension skills
//           </p>
//           <div className="flex gap-2">
//             <Link to="/listening/beginner">
//               <Button 
//                 variant={level === "beginner" ? "default" : "outline"} 
//                 size="sm"
//               >
//                 Beginner
//               </Button>
//             </Link>
//             <Link to="/listening/intermediate">
//               <Button 
//                 variant={level === "intermediate" ? "default" : "outline"} 
//                 size="sm"
//               >
//                 Intermediate
//               </Button>
//             </Link>
//             <Link to="/listening/advanced">
//               <Button 
//                 variant={level === "advanced" ? "default" : "outline"} 
//                 size="sm"
//               >
//                 Advanced
//               </Button>
//             </Link>
//             <Link to="/listening/beginner-intermediate">
//               <Button 
//                 variant={level === "beginner-intermediate" ? "default" : "outline"} 
//                 size="sm"
//               >
//                 Mix
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="h-[60vh] flex items-center justify-center">
//           <div className="flex flex-col items-center gap-4">
//             <Loader2 className="h-12 w-12 animate-spin text-primary" />
//             <p className="text-lg">Đang tải dữ liệu bài tập nghe...</p>
//           </div>
//         </div>
//       ) : (
//         <Tabs defaultValue="exercises">
//           <TabsList className="grid w-full grid-cols-3 mb-8">
//             <TabsTrigger value="exercises">Listening Exercises</TabsTrigger>
//             <TabsTrigger value="dictation">Dictation Practice</TabsTrigger>
//             <TabsTrigger value="tips">Listening Tips</TabsTrigger>
//           </TabsList>

//           <TabsContent value="exercises">
//             <Card>
//               <CardHeader>
//                 <CardTitle>{currentExercise.title}</CardTitle>
//                 <CardDescription>{currentExercise.description}</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Tạo thẻ audio nhưng ẩn đi */}
//                 <audio ref={audioRef} src={currentExercise.audioUrl} style={{ display: 'none' }} />
                
//                 <div className="bg-muted p-4 rounded-lg">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-2">
//                       <Button 
//                         variant="outline" 
//                         size="icon" 
//                         onClick={() => {
//                           if (audioRef.current) {
//                             audioRef.current.currentTime = 0;
//                             setCurrentTime(0);
//                           }
//                         }}
//                       >
//                         <SkipBack className="h-4 w-4" />
//                       </Button>
//                       <Button variant="outline" size="icon" onClick={handlePlayPause}>
//                         {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
//                       </Button>
//                       <Button 
//                         variant="outline" 
//                         size="icon" 
//                         disabled={currentTime >= duration - 1}
//                         onClick={() => {
//                           if (audioRef.current && currentTime < duration - 10) {
//                             audioRef.current.currentTime += 10;
//                           }
//                         }}
//                       >
//                         <SkipForward className="h-4 w-4" />
//                       </Button>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <Volume2 className="h-4 w-4 text-muted-foreground" />
//                       <Slider value={[volume]} max={100} step={1} className="w-24" onValueChange={handleVolumeChange} />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm text-muted-foreground">
//                       <span>{formatTime(currentTime)}</span>
//                       <span>{formatTime(duration)}</span>
//                     </div>
//                     <Slider value={[currentTime]} max={duration} step={1} onValueChange={handleTimeChange} />
//                   </div>
//                 </div>

//                 <div className="flex justify-end">
//                   <Button variant="outline" onClick={() => setShowTranscript(!showTranscript)}>
//                     {showTranscript ? "Hide Transcript" : "Show Transcript"}
//                   </Button>
//                 </div>

//                 {showTranscript && (
//                   <Card className="bg-muted/50">
//                     <CardContent className="pt-6">
//                       <pre className="whitespace-pre-wrap font-sans text-sm">{currentExercise.transcript}</pre>
//                     </CardContent>
//                   </Card>
//                 )}

//                 <div className="space-y-6">
//                   <h3 className="text-lg font-medium">Comprehension Questions</h3>
//                   {currentExercise.questions.map((question, index) => (
//                     <div key={question.id} className="space-y-4">
//                       <p className="font-medium">
//                         {index + 1}. {question.question}
//                       </p>
//                       <RadioGroup
//                         value={selectedAnswers[question.id]}
//                         onValueChange={(value) => handleAnswerSelect(question.id, value)}
//                       >
//                         {question.options.map((option) => (
//                           <div key={option.id} className="flex items-center space-x-2">
//                             <RadioGroupItem value={option.optionKey} id={`q${question.id}-${option.optionKey}`} />
//                             <Label htmlFor={`q${question.id}-${option.optionKey}`}>
//                               <span className="font-medium mr-2">{option.optionKey}.</span>
//                               {option.optionText}
//                             </Label>
//                           </div>
//                         ))}
//                       </RadioGroup>
//                       {index < currentExercise.questions.length - 1 && <Separator className="my-4" />}
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//               <CardFooter className="flex justify-between">
//                 <Button 
//                   variant="outline" 
//                   disabled={currentExerciseIndex === 0}
//                   onClick={() => handleExerciseChange(currentExerciseIndex - 1)}
//                 >
//                   Previous Exercise
//                 </Button>
//                 <Button onClick={checkAnswers}>Check Answers</Button>
//                 <Button
//                   variant="outline"
//                   disabled={currentExerciseIndex === listeningExercises.length - 1}
//                   onClick={() => handleExerciseChange(currentExerciseIndex + 1)}
//                 >
//                   Next Exercise
//                 </Button>
//               </CardFooter>
//             </Card>
//           </TabsContent>

//           <TabsContent value="dictation">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Dictation Practice</CardTitle>
//                 <CardDescription>Listen to the audio and type what you hear</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="bg-muted p-4 rounded-lg">
//                   <div className="flex items-center justify-center gap-4 py-8">
//                     <Button 
//                       variant="outline" 
//                       size="icon"
//                       onClick={() => {
//                         if (audioRef.current) {
//                           audioRef.current.currentTime = 0;
//                           setCurrentTime(0);
//                         }
//                       }}
//                     >
//                       <SkipBack className="h-4 w-4" />
//                     </Button>
//                     <Button 
//                       size="icon" 
//                       className="h-12 w-12"
//                       onClick={handlePlayPause}
//                     >
//                       {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
//                     </Button>
//                     <Button 
//                       variant="outline" 
//                       size="icon"
//                       disabled={currentTime >= duration - 1}
//                       onClick={() => {
//                         if (audioRef.current && currentTime < duration - 10) {
//                           audioRef.current.currentTime += 10;
//                         }
//                       }}
//                     >
//                       <SkipForward className="h-4 w-4" />
//                     </Button>
//                   </div>
//                   <p className="text-center text-sm text-muted-foreground">
//                     Click play to listen to the audio. You can replay it up to 3 times.
//                   </p>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="dictation">Type what you hear:</Label>
//                   <textarea
//                     id="dictation"
//                     className="w-full min-h-[150px] p-4 border rounded-md"
//                     placeholder="Type the text you hear in the audio..."
//                   ></textarea>
//                 </div>

//                 <Button className="w-full" onClick={() => toast.info("Tính năng này đang được phát triển")}>Check Answer</Button>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="tips">
//             <div className="grid gap-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Effective Listening Strategies</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <h3 className="font-medium">1. Focus on Keywords</h3>
//                   <p>
//                     Listen for nouns, verbs, and adjectives that carry the main meaning of the sentence. These keywords
//                     will help you understand the main idea even if you miss some details.
//                   </p>

//                   <h3 className="font-medium">2. Anticipate Content</h3>
//                   <p>
//                     Before listening, think about what kind of information you might hear based on the topic. This mental
//                     preparation helps your brain process the information more efficiently.
//                   </p>

//                   <h3 className="font-medium">3. Take Notes</h3>
//                   <p>
//                     Jot down key points as you listen. Don't try to write everything—focus on main ideas, numbers, names,
//                     and important details.
//                   </p>

//                   <h3 className="font-medium">4. Listen for Transitions</h3>
//                   <p>
//                     Words like "however," "therefore," "in addition," and "on the other hand" signal important shifts in
//                     the conversation or presentation.
//                   </p>

//                   <h3 className="font-medium">5. Practice Regularly</h3>
//                   <p>
//                     Listen to English audio content daily, even if just for 10-15 minutes. Podcasts, news broadcasts, and
//                     TED talks are excellent resources.
//                   </p>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Common TOEIC Listening Question Types</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <h3 className="font-medium">Photographs</h3>
//                   <p>
//                     You'll see a photograph and hear four statements. Choose the statement that best describes the
//                     photograph.
//                   </p>

//                   <h3 className="font-medium">Question-Response</h3>
//                   <p>
//                     You'll hear a question and three possible responses. Select the most appropriate response to the
//                     question.
//                   </p>

//                   <h3 className="font-medium">Conversations</h3>
//                   <p>
//                     You'll hear a conversation between two people followed by multiple-choice questions. The questions
//                     test your understanding of main ideas, details, and implied meanings.
//                   </p>

//                   <h3 className="font-medium">Talks</h3>
//                   <p>
//                     You'll hear a short talk (announcement, advertisement, etc.) followed by multiple-choice questions
//                     about the content.
//                   </p>
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>
//         </Tabs>
//       )}
//     </div>
//   )
// }

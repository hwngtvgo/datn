import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Volume2, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TestHeaderProps {
  test: any;
  currentPhase: 'listening' | 'reading';
  timeLeft: number;
  answeredQuestions: number;
  totalQuestions: number;
  formatTime: (seconds: number) => string;
  calculateProgress: () => number;
  getDifficultyBadge: (difficulty: string) => JSX.Element;
  getExamTypeBadge: (type: string | undefined) => JSX.Element;
  onFinishTest: () => void;
}

const TestHeader: React.FC<TestHeaderProps> = ({
  test,
  currentPhase,
  timeLeft,
  answeredQuestions,
  totalQuestions,
  formatTime,
  calculateProgress,
  getDifficultyBadge,
  getExamTypeBadge,
  onFinishTest
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-2">
        <h1 className="text-2xl font-bold">{test.title}</h1>
        <div className="flex items-center gap-2">
          {getDifficultyBadge(test.difficulty || 'MEDIUM')}
          {getExamTypeBadge(test.type)}
        </div>
      </div>
      
      <div className="flex items-center justify-between bg-muted p-3 rounded-lg mb-4">
        <div className="flex items-center gap-4">
          {currentPhase === 'listening' ? (
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-blue-600">Phần Nghe</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-600">Phần Đọc - {formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Tiến độ: {answeredQuestions}/{totalQuestions}</span>
            <div className="w-32">
              <Progress value={calculateProgress()} className="h-2" />
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onFinishTest}
                  variant="destructive"
                  size="sm"
                >
                  Nộp bài
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Nộp bài và xem kết quả ngay lập tức</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default TestHeader; 
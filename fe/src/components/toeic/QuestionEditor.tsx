import React, { useState } from 'react';
import { ToeicQuestionDTO, ToeicOptionDTO } from '@/services/toeicQuestionService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from 'lucide-react';
import { DifficultyLevel, QuestionCategory } from '@/types/toeic';

export interface QuestionEditorProps {
  question: ToeicQuestionDTO;
  onSave: (question: ToeicQuestionDTO) => void;
  onCancel: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onSave, onCancel }) => {
  const [questionText, setQuestionText] = useState<string>(question.question || '');
  const [options, setOptions] = useState<ToeicOptionDTO[]>(question.options || []);
  const [correctAnswer, setCorrectAnswer] = useState<string>(question.correctAnswer || '');
  const [explanation, setExplanation] = useState<string>(question.explanation || '');
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>(
    question.difficultyLevel || DifficultyLevel.MEDIUM
  );
  const [category, setCategory] = useState<QuestionCategory>(() => {
    // Nếu category hiện tại là PRACTICE hoặc OTHER, sử dụng GRAMMAR
    if (question.category === QuestionCategory.PRACTICE || question.category === QuestionCategory.OTHER) {
      return QuestionCategory.GRAMMAR;
    }
    // Nếu không có giá trị hoặc giá trị không hợp lệ, sử dụng GRAMMAR
    return question.category || QuestionCategory.GRAMMAR;
  });
  
  // Thêm tùy chọn mới
  const addOption = () => {
    const optionKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const nextKey = optionKeys[options.length] || '';
    
    if (options.length < 8) {
      setOptions([...options, { optionKey: nextKey, optionText: '' }]);
    }
  };
  
  // Xóa tùy chọn
  const removeOption = (index: number) => {
    const updatedOptions = [...options];
    updatedOptions.splice(index, 1);
    setOptions(updatedOptions);
    
    // Nếu xóa tùy chọn đang chọn làm đáp án đúng
    if (options[index].optionKey === correctAnswer) {
      setCorrectAnswer('');
    }
  };
  
  // Cập nhật tùy chọn
  const updateOption = (index: number, text: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = { ...updatedOptions[index], optionText: text };
    setOptions(updatedOptions);
  };
  
  // Lưu câu hỏi
  const handleSave = () => {
    // Kiểm tra dữ liệu trước khi lưu
    if (!questionText.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    
    if (!correctAnswer) {
      alert('Vui lòng chọn đáp án đúng');
      return;
    }
    
    // Đảm bảo category là giá trị hợp lệ (chỉ GRAMMAR hoặc VOCABULARY)
    let finalCategory = category;
    if (finalCategory !== QuestionCategory.GRAMMAR && finalCategory !== QuestionCategory.VOCABULARY) {
      finalCategory = QuestionCategory.GRAMMAR;
    }
    
    console.log('Lưu câu hỏi với thông tin:');
    console.log('- Category:', finalCategory);
    console.log('- Category type:', typeof finalCategory);
    console.log('- DifficultyLevel:', difficultyLevel);
    console.log('- DifficultyLevel type:', typeof difficultyLevel);
    
    // Kiểm tra xem các enum có hợp lệ không
    console.log('- Kiểm tra enum Category:');
    console.log('  + Các giá trị hợp lệ:', Object.values(QuestionCategory));
    console.log('  + Giá trị hiện tại có thuộc enum không:', Object.values(QuestionCategory).includes(finalCategory as QuestionCategory));
    
    console.log('- Kiểm tra enum DifficultyLevel:');
    console.log('  + Các giá trị hợp lệ:', Object.values(DifficultyLevel));
    console.log('  + Giá trị hiện tại có thuộc enum không:', Object.values(DifficultyLevel).includes(difficultyLevel as DifficultyLevel));
    
    // Kiểm tra JSON stringified
    try {
      const testJson = JSON.stringify({category: finalCategory});
      console.log('- JSON test for category:', testJson);
    } catch (e) {
      console.error('- Không thể chuyển category thành JSON:', e);
    }
    
    const updatedQuestion: ToeicQuestionDTO = {
      ...question,
      question: questionText,
      options: options,
      correctAnswer: correctAnswer,
      explanation: explanation,
      difficultyLevel: difficultyLevel as DifficultyLevel,
      category: finalCategory as QuestionCategory,
    };
    
    console.log('Câu hỏi đã cập nhật trước khi lưu:', JSON.stringify(updatedQuestion, null, 2));
    console.log('Câu hỏi gốc trước khi cập nhật:', JSON.stringify(question, null, 2));
    onSave(updatedQuestion);
  };
  
  return (
    <div className="space-y-4">
      {/* Nội dung câu hỏi */}
      <div className="space-y-2">
        <Label htmlFor="question">Nội dung câu hỏi <span className="text-destructive">*</span></Label>
        <Textarea 
          id="question" 
          placeholder="Nhập nội dung câu hỏi" 
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={3}
        />
      </div>
      
      {/* Danh mục câu hỏi */}
      <div className="space-y-2">
        <Label htmlFor="category">Danh mục <span className="text-destructive">*</span></Label>
        <Select 
          value={category} 
          onValueChange={(value) => setCategory(value as QuestionCategory)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={QuestionCategory.GRAMMAR}>Ngữ pháp</SelectItem>
            <SelectItem value={QuestionCategory.VOCABULARY}>Từ vựng</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Mức độ khó */}
      <div className="space-y-2">
        <Label htmlFor="difficultyLevel">Mức độ khó <span className="text-destructive">*</span></Label>
        <Select 
          value={difficultyLevel} 
          onValueChange={(value) => setDifficultyLevel(value as DifficultyLevel)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn mức độ khó" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DifficultyLevel.EASY}>Dễ (Easy)</SelectItem>
            <SelectItem value={DifficultyLevel.MEDIUM}>Trung bình (Medium)</SelectItem>
            <SelectItem value={DifficultyLevel.HARD}>Khó (Hard)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Các tùy chọn */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Các lựa chọn <span className="text-destructive">*</span></Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addOption}
            disabled={options.length >= 8}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm lựa chọn
          </Button>
        </div>
        
        <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer}>
          {options.map((option, index) => (
            <Card key={index} className="mb-2">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <RadioGroupItem value={option.optionKey} id={`option-${index}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 text-center font-medium">{option.optionKey}.</div>
                      <Input
                        value={option.optionText}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Nội dung lựa chọn ${option.optionKey}`}
                      />
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeOption(index)}
                    disabled={options.length <= 2}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </div>
      
      {/* Giải thích đáp án */}
      <div className="space-y-2">
        <Label htmlFor="explanation">Giải thích đáp án</Label>
        <Textarea 
          id="explanation" 
          placeholder="Nhập giải thích cho đáp án đúng" 
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={3}
        />
      </div>
      
      {/* Nút thao tác */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="button" onClick={handleSave}>
          Lưu
        </Button>
      </div>
    </div>
  );
};

export default QuestionEditor; 
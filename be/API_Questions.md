# API Quản lý câu hỏi TOEIC

Tài liệu này mô tả các endpoint API liên quan đến quản lý câu hỏi TOEIC trong ứng dụng.

## 1. Quản lý câu hỏi TOEIC

### 1.1 Lấy danh sách câu hỏi
- **URL**: `/api/toeic-questions`
- **Method**: GET
- **Xác thực**: Yêu cầu JWT token với quyền ADMIN
- **Mô tả**: Lấy danh sách câu hỏi TOEIC có phân trang

**Phản hồi thành công (200 OK)**:
```json
{
  "content": [
    {
      "id": 1,
      "questionText": "What is the purpose of this meeting?",
      "options": ["To discuss budget", "To plan the project", "To introduce new team members", "To review progress"],
      "correctAnswer": 3,
      "explanation": "The purpose is clearly stated in the memo as a progress review meeting.",
      "questionType": "READING",
      "difficulty": "MEDIUM"
    },
    {
      "id": 2,
      "questionText": "When will the train arrive?",
      "options": ["At 9:30 AM", "At 10:15 AM", "At 11:45 AM", "At 12:30 PM"],
      "correctAnswer": 1,
      "explanation": "The schedule mentions the arrival time as 10:15 AM.",
      "questionType": "LISTENING",
      "difficulty": "EASY"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": []
  },
  "totalElements": 50,
  "totalPages": 5,
  "last": false,
  "first": true,
  "size": 10,
  "number": 0,
  "numberOfElements": 2,
  "empty": false
}
```

### 1.2 Lấy chi tiết câu hỏi theo ID
- **URL**: `/api/toeic-questions/{id}`
- **Method**: GET
- **Xác thực**: Yêu cầu JWT token
- **Tham số đường dẫn**:
  - `id`: ID của câu hỏi
- **Mô tả**: Lấy chi tiết một câu hỏi TOEIC

**Phản hồi thành công (200 OK)**:
```json
{
  "id": 1,
  "questionText": "What is the purpose of this meeting?",
  "options": ["To discuss budget", "To plan the project", "To introduce new team members", "To review progress"],
  "correctAnswer": 3,
  "explanation": "The purpose is clearly stated in the memo as a progress review meeting.",
  "questionType": "READING",
  "difficulty": "MEDIUM",
  "audioUrl": null,
  "imageUrl": null,
  "questionGroupId": 5
}
```

**Phản hồi không tìm thấy (404 Not Found)**:
```json
{
  "message": "Không tìm thấy câu hỏi với id 999",
  "success": false
}
```

### 1.3 Tạo câu hỏi mới
- **URL**: `/api/toeic-questions`
- **Method**: POST
- **Xác thực**: Yêu cầu JWT token với quyền ADMIN
- **Content-Type**: application/json
- **Mô tả**: Tạo câu hỏi TOEIC mới

**Request Body**:
```json
{
  "questionText": "The train to Osaka departs at _____.",
  "options": ["8:30 AM", "9:15 AM", "10:00 AM", "11:45 AM"],
  "correctAnswer": 2,
  "explanation": "According to the announcement, the train departs at 10:00 AM.",
  "questionType": "LISTENING",
  "difficulty": "EASY",
  "audioUrl": "/audio/listening-sample-15.mp3",
  "questionGroupId": 3
}
```

**Phản hồi thành công (201 Created)**:
```json
{
  "id": 51,
  "questionText": "The train to Osaka departs at _____.",
  "options": ["8:30 AM", "9:15 AM", "10:00 AM", "11:45 AM"],
  "correctAnswer": 2,
  "explanation": "According to the announcement, the train departs at 10:00 AM.",
  "questionType": "LISTENING",
  "difficulty": "EASY",
  "audioUrl": "/audio/listening-sample-15.mp3",
  "questionGroupId": 3,
  "message": "Tạo câu hỏi thành công"
}
```

### 1.4 Cập nhật câu hỏi
- **URL**: `/api/toeic-questions/{id}`
- **Method**: PUT
- **Xác thực**: Yêu cầu JWT token với quyền ADMIN
- **Content-Type**: application/json
- **Tham số đường dẫn**:
  - `id`: ID của câu hỏi cần cập nhật
- **Mô tả**: Cập nhật thông tin câu hỏi TOEIC

**Request Body**:
```json
{
  "questionText": "The train to Tokyo departs at _____.",
  "options": ["8:30 AM", "9:15 AM", "10:00 AM", "11:45 AM"],
  "correctAnswer": 1,
  "explanation": "According to the updated announcement, the train departs at 9:15 AM.",
  "questionType": "LISTENING",
  "difficulty": "MEDIUM",
  "audioUrl": "/audio/listening-sample-15-updated.mp3"
}
```

**Phản hồi thành công (200 OK)**:
```json
{
  "id": 51,
  "questionText": "The train to Tokyo departs at _____.",
  "options": ["8:30 AM", "9:15 AM", "10:00 AM", "11:45 AM"],
  "correctAnswer": 1,
  "explanation": "According to the updated announcement, the train departs at 9:15 AM.",
  "questionType": "LISTENING",
  "difficulty": "MEDIUM",
  "audioUrl": "/audio/listening-sample-15-updated.mp3",
  "questionGroupId": 3
}
```

### 1.5 Xóa câu hỏi
- **URL**: `/api/toeic-questions/{id}`
- **Method**: DELETE
- **Xác thực**: Yêu cầu JWT token với quyền ADMIN
- **Tham số đường dẫn**:
  - `id`: ID của câu hỏi cần xóa
- **Mô tả**: Xóa một câu hỏi TOEIC

**Phản hồi thành công (200 OK)**:
```json
{
  "message": "Xóa câu hỏi thành công",
  "success": true
}
```

## 2. Quản lý nhóm câu hỏi

### 2.1 Tạo nhóm câu hỏi mới
- **URL**: `/api/toeic-questions/groups`
- **Method**: POST
- **Xác thực**: Yêu cầu JWT token với quyền ADMIN
- **Content-Type**: application/json
- **Mô tả**: Tạo nhóm câu hỏi mới

**Request Body**:
```json
{
  "title": "Office Memo Comprehension",
  "instructions": "Read the following memo and answer questions 1-5",
  "content": "TO: All Staff\nFROM: HR Department\nSUBJECT: Annual Review\n\nThe annual performance review will start next week...",
  "questionType": "READING",
  "resourceUrl": "/images/memo-sample.jpg"
}
```

**Phản hồi thành công (201 Created)**:
```json
{
  "id": 10,
  "title": "Office Memo Comprehension",
  "instructions": "Read the following memo and answer questions 1-5",
  "content": "TO: All Staff\nFROM: HR Department\nSUBJECT: Annual Review\n\nThe annual performance review will start next week...",
  "questionType": "READING",
  "resourceUrl": "/images/memo-sample.jpg",
  "message": "Tạo nhóm câu hỏi thành công"
}
```

### 2.2 Lấy danh sách câu hỏi theo nhóm
- **URL**: `/api/toeic-questions/by-group/{groupId}`
- **Method**: GET
- **Xác thực**: Yêu cầu JWT token
- **Tham số đường dẫn**:
  - `groupId`: ID của nhóm câu hỏi
- **Mô tả**: Lấy danh sách câu hỏi thuộc một nhóm

**Phản hồi thành công (200 OK)**:
```json
[
  {
    "id": 15,
    "questionText": "What is the subject of the memo?",
    "options": ["Company Picnic", "Annual Review", "Office Relocation", "Budget Meeting"],
    "correctAnswer": 1,
    "explanation": "The subject line of the memo clearly states 'Annual Review'.",
    "questionType": "READING",
    "difficulty": "EASY",
    "questionGroupId": 10
  },
  {
    "id": 16,
    "questionText": "When will the performance review start?",
    "options": ["This week", "Next week", "Next month", "Immediately"],
    "correctAnswer": 1,
    "explanation": "The memo states 'The annual performance review will start next week'.",
    "questionType": "READING",
    "difficulty": "EASY",
    "questionGroupId": 10
  }
]
```

### 2.3 Cập nhật nhóm câu hỏi
- **URL**: `/api/toeic-questions/groups/{id}`
- **Method**: PUT
- **Xác thực**: Yêu cầu JWT token với quyền ADMIN
- **Content-Type**: application/json
- **Tham số đường dẫn**:
  - `id`: ID của nhóm câu hỏi cần cập nhật
- **Mô tả**: Cập nhật thông tin nhóm câu hỏi

**Request Body**:
```json
{
  "title": "Company Memo Analysis",
  "instructions": "Read the following company memo and answer questions 1-5",
  "content": "TO: All Staff\nFROM: HR Department\nSUBJECT: Annual Review\n\nThe annual performance review will start next week...",
  "questionType": "READING",
  "resourceUrl": "/images/memo-sample-updated.jpg"
}
```

**Phản hồi thành công (200 OK)**:
```json
{
  "id": 10,
  "title": "Company Memo Analysis",
  "instructions": "Read the following company memo and answer questions 1-5",
  "content": "TO: All Staff\nFROM: HR Department\nSUBJECT: Annual Review\n\nThe annual performance review will start next week...",
  "questionType": "READING",
  "resourceUrl": "/images/memo-sample-updated.jpg"
}
```

### 2.4 Xóa nhóm câu hỏi
- **URL**: `/api/toeic-questions/groups/{id}`
- **Method**: DELETE
- **Xác thực**: Yêu cầu JWT token với quyền ADMIN
- **Tham số đường dẫn**:
  - `id`: ID của nhóm câu hỏi cần xóa
- **Mô tả**: Xóa một nhóm câu hỏi và tất cả câu hỏi thuộc nhóm đó

**Phản hồi thành công (200 OK)**:
```json
{
  "message": "Xóa nhóm câu hỏi thành công",
  "success": true
}
``` 
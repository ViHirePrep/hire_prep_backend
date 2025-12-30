import {
  PromptBuilder,
  PromptTemplate,
  EvaluationPromptTemplate,
} from './prompt-builder.abstract';

export class VietnamesePromptBuilder extends PromptBuilder {
  getQuestionGenerationTemplate(): PromptTemplate {
    return {
      systemRole:
        'Bạn là một chuyên gia phỏng vấn. Dựa trên mô tả công việc chi tiết dưới đây, hãy tạo các câu hỏi phỏng vấn phù hợp:',
      jobDescriptionLabel: 'Mô tả công việc chi tiết',
      interviewDetailsLabel: 'Yêu cầu phỏng vấn',
      industryLabel: 'Ngành',
      levelLabel: 'Cấp độ',
      stackLabel: 'Công nghệ',
      positionLabel: 'Vị trí',
      numQuestionsLabel: 'số lượng câu hỏi',
      requirementsLabel: 'Yêu cầu tạo câu hỏi',
      requirements: [
        'Phân tích kỹ Mô tả công việc chi tiết để xác định các yêu cầu kỹ thuật cụ thể',
        'Tạo câu hỏi phù hợp với vị trí, cấp độ và công nghệ yêu cầu',
        'Tạo các câu hỏi đa dạng bao gồm kỹ năng kỹ thuật, giải quyết vấn đề và kinh nghiệm thực tế',
        'Bao gồm các mức độ khó khác nhau (DỄ, TRUNG BÌNH, KHÓ)',
        'TẤT CẢ câu hỏi phải là loại TEXT (tạm thời không có câu hỏi VIDEO)',
        'Cung cấp câu trả lời mẫu chi tiết cho mỗi câu hỏi',
        'Ưu tiên các chủ đề và công nghệ được đề cập rõ ràng trong mô tả công việc',
      ],
      stackRequirement: (stack: string) =>
        `Tập trung vào công nghệ và thực tiễn tốt nhất của ${stack}`,
      jsonFormatInstruction:
        'TRẢ LỜI BẰNG TIẾNG VIỆT. Trả về kết quả theo định dạng JSON với mảng "questions" chứa các đối tượng có cấu trúc: {questionText: "nội dung câu hỏi", expectedAnswer: "câu trả lời mẫu chi tiết", difficulty: "EASY | MEDIUM | HARD", questionType: "TEXT"}. Ví dụ: {"questions":[{"questionText":"Nội dung câu hỏi 1","expectedAnswer":"Câu trả lời chi tiết","difficulty":"MEDIUM","questionType":"TEXT"}]}',
      questionTextLabel: 'questionText',
      expectedAnswerLabel: 'expectedAnswer',
    };
  }

  getEvaluationTemplate(): EvaluationPromptTemplate {
    return {
      systemRole:
        'Bạn là một chuyên gia phỏng vấn kỹ thuật. Đánh giá các câu trả lời phỏng vấn thử sau đây.',
      mockInterviewDetailsLabel: 'Thông tin phỏng vấn thử',
      levelLabel: 'Cấp độ',
      industryLabel: 'Ngành',
      stackLabel: 'Stack',
      positionLabel: 'Vị trí',
      questionLabel: 'Câu hỏi',
      expectedAnswerLabel: 'Câu trả lời mẫu',
      candidateAnswerLabel: 'Câu trả lời của ứng viên',
      difficultyLabel: 'Độ khó',
      evaluationRequirements: [
        'Phân tích độ chính xác kỹ thuật và sự đầy đủ của câu trả lời',
        'Đánh giá kỹ năng giao tiếp và sự rõ ràng trong giải thích',
        'Xem xét cách tiếp cận giải quyết vấn đề và phương pháp luận',
        'Cung cấp phản hồi mang tính xây dựng để cải thiện',
        'BẮT BUỘC cho điểm 0 nếu câu trả lời là "Không", "Không biết", "No answer", hoặc vô nghĩa.',
        'Chấm điểm (0-100) cho TỪNG câu hỏi. Điểm số cần khắt khe và công bằng.',
        'Cung cấp "expectedAnswer" và "feedback" thật chi tiết, như một bài học ngắn để ứng viên học hỏi kiến thức.',
      ],
      requirementsLabel: 'Yêu cầu đánh giá',
      jsonFormatInstruction:
        'TRẢ VỀ CHỈ ĐỊNH DẠNG JSON HỢP LỆ (không dùng markdown, không bọc trong ```json). Ví dụ: {"overallScore": 85, "strengths": ["Giỏi PHP"], "weaknesses": ["Yếu bảo mật"], "recommendations": ["Học thêm về CSRF"], "detailedFeedback": [{"questionText": "DI là gì?", "score": 80, "feedback": "Giải thích chưa sâu. DI là pattern giúp giảm sự phụ thuộc... (giải thích chi tiết)"}]}',
      overallScoreLabel: 'overallScore',
      strengthsLabel: 'strengths',
      weaknessesLabel: 'weaknesses',
      recommendationsLabel: 'recommendations',
      detailedFeedbackLabel: 'detailedFeedback',
    };
  }
}

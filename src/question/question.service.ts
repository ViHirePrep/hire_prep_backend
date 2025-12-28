import { Injectable } from '@nestjs/common';

import { GenerateQuestionsInput } from '../ai/ai.abstract';
import { AIService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
  ) {}

  async generateAndSaveQuestions(
    sessionId: string,
    jdText: string | null,
    level: string,
    industry: string,
    stack?: string,
    position?: string,
    numQuestions: number = 5,
    language: 'en' | 'vi' = 'vi',
    aiProvider?: string,
  ) {
    const effectiveJdText =
      jdText ||
      this.buildGenericJobDescription(
        level,
        industry,
        stack,
        position,
        numQuestions,
        language,
      );

    const input: GenerateQuestionsInput = {
      jdText: effectiveJdText,
      level,
      industry,
      stack,
      position,
      numQuestions,
      language,
      aiProvider,
    };

    const generatedQuestions = await this.aiService.generateQuestions(input);

    const savedQuestions = await Promise.all(
      generatedQuestions.map((question, index) =>
        this.prisma.question.create({
          data: {
            sessionId,
            questionText: question.questionText,
            expectedAnswer: question.expectedAnswer,
            difficulty: question.difficulty,
            questionType: question.questionType,
            order: index + 1,
            timeLimit: this.calculateTimeLimit(question.questionType),
          },
        }),
      ),
    );

    return savedQuestions;
  }

  private calculateTimeLimit(questionType: string): number {
    switch (questionType) {
      case 'VIDEO':
        return 5;
      case 'TEXT':
      default:
        return 3;
    }
  }

  private buildGenericJobDescription(
    level: string,
    industry: string,
    stack?: string,
    position?: string,
    numQuestions: number = 5,
    language: 'en' | 'vi' = 'vi',
  ): string {
    const isIT = industry === 'IT';

    if (language === 'vi') {
      return this.buildVietnameseJobDescription(
        level,
        industry,
        stack,
        position,
        numQuestions,
        isIT,
      );
    }

    return this.buildEnglishJobDescription(
      level,
      industry,
      stack,
      position,
      numQuestions,
      isIT,
    );
  }

  private buildEnglishJobDescription(
    level: string,
    industry: string,
    stack?: string,
    position?: string,
    numQuestions: number = 5,
    isIT: boolean = false,
  ): string {
    const positionStr = position || (isIT ? 'developer' : 'professional');
    const stackStr = isIT && stack ? ` specializing in ${stack}` : '';

    return `Generate ${numQuestions} interview questions for a ${level} level ${positionStr} position${stackStr} in the ${industry} industry.

Focus on:
${
  isIT
    ? `- ${stack || 'General'} technical skills and knowledge
- Problem-solving and system design (for senior levels)
- Code quality, testing, and debugging
- Relevant frameworks, tools, and technologies`
    : `- Industry-specific professional skills and knowledge
- Problem-solving and strategic thinking
- Best practices and compliance (if applicable)
- Relevant tools and methodologies`
}
- Core competencies for ${level} level
- Behavioral questions related to team collaboration and leadership

Provide questions with varying difficulty levels appropriate for ${level} level candidates in ${industry}.`;
  }

  private buildVietnameseJobDescription(
    level: string,
    industry: string,
    stack?: string,
    position?: string,
    numQuestions: number = 5,
    isIT: boolean = false,
  ): string {
    const positionStr = position || (isIT ? 'developer' : 'chuyên viên');
    const stackStr = isIT && stack ? ` chuyên về ${stack}` : '';

    return `Tạo ${numQuestions} câu hỏi phỏng vấn cho vị trí ${positionStr} cấp độ ${level}${stackStr} trong ngành ${industry}.

Tập trung vào:
${
  isIT
    ? `- Kỹ năng và kiến thức kỹ thuật về ${stack || 'Tổng quát'}
- Giải quyết vấn đề và thiết kế hệ thống (cho cấp độ senior)
- Chất lượng code, testing và debugging
- Các framework, công cụ và công nghệ liên quan`
    : `- Kỹ năng chuyên môn đặc thù của ngành
- Giải quyết vấn đề và tư duy chiến lược
- Thực tiễn tốt nhất và tuân thủ quy định (nếu có)
- Công cụ và phương pháp liên quan`
}
- Năng lực cốt lõi cho cấp độ ${level}
- Câu hỏi về hành vi liên quan đến làm việc nhóm và lãnh đạo

Cung cấp các câu hỏi với mức độ khó khác nhau phù hợp cho ứng viên cấp độ ${level} trong ngành ${industry}.`;
  }

  async findBySessionId(sessionId: string) {
    return this.prisma.question.findMany({
      where: { sessionId },
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.question.findUnique({
      where: { id },
    });
  }
}

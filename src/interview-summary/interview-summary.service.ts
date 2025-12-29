import { Injectable } from '@nestjs/common';

import { AIService } from '../ai/ai.service';
import { PromptBuilderFactory } from '../ai/prompt-builders';
import { PrismaService } from '../prisma/prisma.service';

export interface InterviewSummaryInput {
  sessionId: string;
  language?: 'en' | 'vi';
  aiProvider?: string;
}

export interface InterviewEvaluation {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback: {
    questionId: string;
    score: number;
    feedback: string;
  }[];
}

@Injectable()
export class InterviewSummaryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
  ) {}

  async generateSummary(
    input: InterviewSummaryInput,
  ): Promise<InterviewEvaluation> {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: input.sessionId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            answers: true,
          },
        },
      },
    });

    if (!session) {
      throw new Error('Interview session not found');
    }

    const prompt = this.buildEvaluationPrompt(session, input.language);

    const aiResponse = await this.aiService.evaluateInterview(
      prompt,
      input.aiProvider,
    );

    return this.parseEvaluationResponse(session, aiResponse);
  }

  private buildEvaluationPrompt(
    session: any,
    language: 'en' | 'vi' = 'vi',
  ): string {
    const questionsAndAnswers = session.questions.map((question: any) => ({
      questionText: question.questionText,
      expectedAnswer: question.expectedAnswer || 'No expected answer provided',
      candidateAnswer:
        question.answers[0]?.candidateAnswerText || 'No answer provided',
      difficulty: question.difficulty,
    }));

    const promptBuilder = PromptBuilderFactory.get(language);

    return promptBuilder.buildEvaluationPrompt(questionsAndAnswers, session);
  }
  private parseEvaluationResponse(
    session: any,
    aiResponse: any,
  ): InterviewEvaluation {
    try {
      let parsedResponse;

      if (typeof aiResponse === 'string') {
        const cleanedResponse = aiResponse
          .replace(/```json\n?|```/g, '')
          .trim();
        parsedResponse = JSON.parse(cleanedResponse);
      } else {
        parsedResponse = aiResponse;
      }

      const overallScore = parsedResponse.overallScore || 0;
      const strengths = Array.isArray(parsedResponse.strengths)
        ? parsedResponse.strengths
        : [];
      const weaknesses = Array.isArray(parsedResponse.weaknesses)
        ? parsedResponse.weaknesses
        : [];
      const recommendations = Array.isArray(parsedResponse.recommendations)
        ? parsedResponse.recommendations
        : [];

      let detailedFeedback = [];

      if (Array.isArray(parsedResponse.detailedFeedback)) {
        detailedFeedback = session.questions.map((q: any) => {
          let aiFeedback = parsedResponse.detailedFeedback.find(
            (feedback: any) => feedback.questionId === q.id,
          );

          if (!aiFeedback) {
            aiFeedback = parsedResponse.detailedFeedback.find(
              (feedback: any) => feedback.questionText === q.questionText,
            );
          }

          if (!aiFeedback && parsedResponse.detailedFeedback.length > 0) {
            const questionIndex = session.questions.findIndex(
              (question: any) => question.id === q.id,
            );
            if (questionIndex < parsedResponse.detailedFeedback.length) {
              aiFeedback = parsedResponse.detailedFeedback[questionIndex];
            }
          }

          return {
            questionId: q.id,
            score: aiFeedback?.score || 0,
            feedback: aiFeedback?.feedback || 'No specific feedback',
          };
        });
      } else {
        detailedFeedback = session.questions.map((q: any) => ({
          questionId: q.id,
          score: 0,
          feedback: 'No feedback provided',
        }));
      }

      return {
        overallScore: Math.round(overallScore),
        strengths,
        weaknesses,
        recommendations,
        detailedFeedback,
      };
    } catch {
      return {
        overallScore: 0,
        strengths: [],
        weaknesses: [],
        recommendations: [],
        detailedFeedback: session.questions.map((q: any) => ({
          questionId: q.id,
          score: 0,
          feedback: 'Could not evaluate answer',
        })),
      };
    }
  }
}

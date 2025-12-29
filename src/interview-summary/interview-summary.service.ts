import { Injectable, NotFoundException } from '@nestjs/common';

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
    questionText: string;
    candidateAnswer: string;
    expectedAnswer: string;
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
        interviewQuestions: {
          orderBy: { order: 'asc' },
          include: {
            interviewAnswer: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Interview session not found');
    }

    const prompt = this.buildEvaluationPrompt(session, input.language);

    const aiResponse = await this.aiService.evaluateInterview(
      prompt,
      input.aiProvider,
    );

    return this.parseEvaluationResponse(session, aiResponse);
  }

  private buildQuestionsAndAnswers(session: any) {
    return session?.interviewQuestions.map((question: any) => ({
      questionId: question.id,
      questionText: question.questionText,
      expectedAnswer: question.expectedAnswer || 'No expected answer provided',
      candidateAnswer:
        question.interviewAnswer?.candidateAnswerText || 'No answer provided',
      difficulty: question.difficulty,
    }));
  }

  private buildEvaluationPrompt(
    session: any,
    language: 'en' | 'vi' = 'vi',
  ): string {
    const questionsAndAnswers = this.buildQuestionsAndAnswers(session);

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
        detailedFeedback = session.interviewQuestions.map(
          (q: any, index: number) => {
            let aiFeedback = parsedResponse.detailedFeedback.find(
              (feedback: any) => feedback.questionId === q.id,
            );

            if (!aiFeedback) {
              aiFeedback = parsedResponse.detailedFeedback.find(
                (feedback: any) => feedback.questionText === q.questionText,
              );
            }

            // Fallback to index if no ID or Text match found
            if (!aiFeedback && parsedResponse.detailedFeedback[index]) {
              aiFeedback = parsedResponse.detailedFeedback[index];
            }

            let score = aiFeedback?.score || 0;
            // Normalize score to 0-100 scale if it seems to be 0-10
            if (score > 0 && score <= 10) {
              score = score * 10;
            }

            return {
              questionId: q.id,
              questionText: q.questionText,
              candidateAnswer:
                q.interviewAnswer?.candidateAnswerText || 'No answer provided',
              expectedAnswer: q.expectedAnswer || 'No expected answer',
              score: score,
              feedback: aiFeedback?.feedback || 'No specific feedback',
            };
          },
        );
      } else {
        detailedFeedback = session.interviewQuestions.map((q: any) => ({
          questionId: q.id,
          questionText: q.questionText,
          candidateAnswer:
            q.interviewAnswer?.candidateAnswerText || 'No answer provided',
          expectedAnswer: q.expectedAnswer || 'No expected answer',
          score: 0,
          feedback: 'No feedback provided',
        }));
      }

      // Calculate real overall score based on average of question scores
      const totalQuestions = detailedFeedback.length;
      const calculatedTotalScore =
        totalQuestions > 0
          ? detailedFeedback.reduce(
              (sum, item: any) => sum + (item.score || 0),
              0,
            ) / totalQuestions
          : 0;

      return {
        overallScore: Math.round(calculatedTotalScore),
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
        detailedFeedback: session.interviewQuestions.map((q: any) => ({
          questionId: q.id,
          questionText: q.questionText,
          candidateAnswer:
            q.interviewAnswer?.candidateAnswerText || 'No answer provided',
          expectedAnswer: q.expectedAnswer || 'No expected answer',
          score: 0,
          feedback: 'Could not evaluate answer',
        })),
      };
    }
  }
}

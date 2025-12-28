import { ServiceUnavailableException } from '@nestjs/common';

import { PromptBuilderFactory } from './prompt-builders';

export interface GenerateQuestionsInput {
  jdText: string;
  level: string;
  industry: string;
  stack?: string;
  position?: string;
  numQuestions: number;
  language?: 'en' | 'vi';
  aiProvider?: string;
}

export interface EvaluateInterviewInput {
  prompt: string;
  language?: 'en' | 'vi';
  aiProvider?: string;
}

export interface GeneratedQuestion {
  questionText: string;
  expectedAnswer: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionType: 'TEXT' | 'VIDEO';
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

export abstract class AbstractAIProvider {
  protected readonly apiKey: string;
  protected readonly apiUrl: string;

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async generateQuestions(
    input: GenerateQuestionsInput,
  ): Promise<GeneratedQuestion[]> {
    try {
      const content = await this.callProviderAPI(input);
      const questions = this.parseAIResponse(content);

      return this.validateQuestions(questions);
    } catch (error) {
      return this.handleError(error, this.getProviderName());
    }
  }

  async evaluateInterview(input: EvaluateInterviewInput): Promise<string> {
    try {
      return await this.callEvaluationAPI(input);
    } catch (error) {
      this.handleError(error, this.getProviderName());
    }
  }

  protected abstract callProviderAPI(
    input: GenerateQuestionsInput,
  ): Promise<string>;

  protected abstract callEvaluationAPI(
    input: EvaluateInterviewInput,
  ): Promise<string>;

  protected abstract getProviderName(): string;

  protected buildPrompt(input: GenerateQuestionsInput): string {
    const promptBuilder = PromptBuilderFactory.get(input.language);
    return promptBuilder.buildQuestionPrompt(input);
  }

  protected buildEvaluationPrompt(input: EvaluateInterviewInput): string {
    return input.prompt;
  }

  protected parseAIResponse(content: string): GeneratedQuestion[] {
    try {
      let jsonContent = content.trim();

      if (jsonContent.startsWith('```json')) {
        const endIdx = jsonContent.indexOf('```', 7);
        if (endIdx > -1) {
          jsonContent = jsonContent.substring(7, endIdx).trim();
        }
      } else if (jsonContent.startsWith('```')) {
        const endIdx = jsonContent.indexOf('```', 3);
        if (endIdx > -1) {
          jsonContent = jsonContent.substring(3, endIdx).trim();
        }
      }

      const parsed = JSON.parse(jsonContent);

      if (Array.isArray(parsed)) {
        return parsed;
      } else if (
        parsed &&
        typeof parsed === 'object' &&
        Array.isArray(parsed.questions)
      ) {
        return parsed.questions;
      } else {
        return [];
      }
    } catch {
      return [];
    }
  }

  protected validateQuestions(
    questions: GeneratedQuestion[],
  ): GeneratedQuestion[] {
    if (questions.length === 0) {
      throw new ServiceUnavailableException(
        'System is currently overloaded. Please try again later.',
      );
    }
    return questions;
  }

  protected handleError(error: unknown, provider?: string): never {
    const providerInfo = provider ? ` (${provider})` : '';
    throw new ServiceUnavailableException(
      `System is currently overloaded ${providerInfo}. Please try again later.`,
    );
  }
}

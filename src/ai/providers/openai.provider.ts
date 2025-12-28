import { Injectable } from '@nestjs/common';
import axios from 'axios';

import {
  GenerateQuestionsInput,
  EvaluateInterviewInput,
  AbstractAIProvider,
} from '../ai.abstract';

@Injectable()
export class OpenAIProvider extends AbstractAIProvider {
  constructor(apiKey: string, apiUrl: string) {
    super(apiKey, apiUrl);
  }

  protected getProviderName(): string {
    return 'OpenAI';
  }

  protected async callProviderAPI(
    input: GenerateQuestionsInput,
  ): Promise<string> {
    const prompt = this.buildPrompt(input);

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert technical interviewer. Always respond with valid JSON only.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey.trim()}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );
      return response.data.choices[0].message.content;
    } catch {
      throw new Error('Failed to generate questions');
    }
  }

  protected async callEvaluationAPI(
    input: EvaluateInterviewInput,
  ): Promise<string> {
    const prompt = this.buildEvaluationPrompt(input);

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert technical interviewer. Evaluate the following mock interview answers and respond with valid JSON only.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey.trim()}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );
      return response.data.choices[0].message.content;
    } catch {
      throw new Error('Failed to evaluate interview');
    }
  }
}

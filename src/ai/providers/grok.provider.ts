import { Injectable } from '@nestjs/common';
import axios from 'axios';

import {
  GenerateQuestionsInput,
  EvaluateInterviewInput,
  AbstractAIProvider,
} from '../ai.abstract';

@Injectable()
export class GrokProvider extends AbstractAIProvider {
  constructor(apiKey: string, apiUrl: string) {
    super(apiKey, apiUrl);
  }

  protected getProviderName(): string {
    return 'Grok';
  }

  protected async callProviderAPI(
    input: GenerateQuestionsInput,
  ): Promise<string> {
    const prompt = this.buildPrompt(input);

    const response = await axios.post(
      this.apiUrl,
      {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert technical interviewer. Always respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.choices[0].message.content;
  }

  protected async callEvaluationAPI(
    input: EvaluateInterviewInput,
  ): Promise<string> {
    const prompt = this.buildEvaluationPrompt(input);

    const response = await axios.post(
      this.apiUrl,
      {
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert technical interviewer. Evaluate the following mock interview answers and respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.choices[0].message.content;
  }
}

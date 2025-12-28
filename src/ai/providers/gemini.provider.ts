import { Injectable } from '@nestjs/common';
import axios from 'axios';

import {
  GenerateQuestionsInput,
  EvaluateInterviewInput,
  AbstractAIProvider,
} from '../ai.abstract';

@Injectable()
export class GeminiProvider extends AbstractAIProvider {
  constructor(apiKey: string, apiUrl: string) {
    super(apiKey, apiUrl);
  }

  protected getProviderName(): string {
    return 'Gemini';
  }

  protected async callProviderAPI(
    input: GenerateQuestionsInput,
  ): Promise<string> {
    const prompt = this.buildPrompt(input);

    const response = await axios.post(
      `${this.apiUrl}?key=${this.apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.candidates[0].content.parts[0].text;
  }

  protected async callEvaluationAPI(
    input: EvaluateInterviewInput,
  ): Promise<string> {
    const prompt = this.buildEvaluationPrompt(input);

    const response = await axios.post(
      `${this.apiUrl}?key=${this.apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.candidates[0].content.parts[0].text;
  }
}

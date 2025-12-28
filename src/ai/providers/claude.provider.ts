import { Injectable } from '@nestjs/common';
import axios from 'axios';

import {
  GenerateQuestionsInput,
  EvaluateInterviewInput,
  AbstractAIProvider,
} from '../ai.abstract';

@Injectable()
export class ClaudeProvider extends AbstractAIProvider {
  constructor(apiKey: string, apiUrl: string) {
    super(apiKey, apiUrl);
  }

  protected getProviderName(): string {
    return 'Claude';
  }

  protected async callProviderAPI(
    input: GenerateQuestionsInput,
  ): Promise<string> {
    const prompt = this.buildPrompt(input);

    const response = await axios.post(
      this.apiUrl,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.content[0].text;
  }

  protected async callEvaluationAPI(
    input: EvaluateInterviewInput,
  ): Promise<string> {
    const prompt = this.buildEvaluationPrompt(input);

    const response = await axios.post(
      this.apiUrl,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.content[0].text;
  }
}

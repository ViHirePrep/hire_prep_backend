import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AIProviderConfigService } from '../ai-provider-config/ai-provider-config.service';

import {
  AbstractAIProvider,
  GeneratedQuestion,
  GenerateQuestionsInput,
} from './ai.abstract';
import { ClaudeProvider } from './providers/claude.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { GrokProvider } from './providers/grok.provider';
import { OpenAIProvider } from './providers/openai.provider';

type ProviderConstructor = new (
  apiKey: string,
  apiUrl: string,
) => AbstractAIProvider;

const PROVIDER_REGISTRY: Record<string, ProviderConstructor> = {
  openai: OpenAIProvider,
  gpt: OpenAIProvider,
  'gpt-4o': OpenAIProvider,
  claude: ClaudeProvider,
  anthropic: ClaudeProvider,
  gemini: GeminiProvider,
  google: GeminiProvider,
  grok: GrokProvider,
  xai: GrokProvider,
};

@Injectable()
export class AIService {
  constructor(
    private readonly configService: ConfigService,
    private readonly providerConfigService: AIProviderConfigService,
  ) {}

  private getApiKey(providerName: string): string {
    const normalizedName = providerName.toLowerCase().trim();

    const baseProvider =
      this.providerConfigService.getBaseProvider(normalizedName) ||
      normalizedName;

    const envKey = `${baseProvider.toUpperCase()}_API_KEY`;
    return this.configService.get<string>(envKey) || '';
  }

  private getApiUrl(providerName: string): string {
    const normalizedName = providerName.toLowerCase().trim();

    const dbUrl = this.providerConfigService.getApiUrl(normalizedName);
    if (dbUrl) {
      return dbUrl;
    }

    const baseProvider =
      this.providerConfigService.getBaseProvider(normalizedName) ||
      normalizedName;

    const envKey = `${baseProvider.toUpperCase()}_API_URL`;
    const envUrl = this.configService.get<string>(envKey);
    if (envUrl) {
      return envUrl;
    }

    return '';
  }

  private createProvider(providerName: string): AbstractAIProvider {
    const normalizedName = providerName.toLowerCase().trim();
    const ProviderClass = PROVIDER_REGISTRY[normalizedName];
    const apiKey = this.getApiKey(normalizedName);
    const apiUrl = this.getApiUrl(normalizedName);

    if (!ProviderClass) {
      throw new ServiceUnavailableException(
        'System is currently overloaded. Please try again later.',
      );
    }

    if (!apiKey || !apiUrl) {
      throw new ServiceUnavailableException(
        'System is currently overloaded. Please try again later.',
      );
    }

    return new ProviderClass(apiKey, apiUrl);
  }

  async generateQuestions(
    input: GenerateQuestionsInput,
  ): Promise<GeneratedQuestion[]> {
    const providerName =
      input.aiProvider ||
      this.configService.get<string>('AI_PROVIDER') ||
      'openai';
    const provider = this.createProvider(providerName);

    try {
      return await provider.generateQuestions(input);
    } catch {
      throw new ServiceUnavailableException(
        'System is currently overloaded. Please try again later.',
      );
    }
  }

  async evaluateInterview(
    prompt: string,
    aiProvider?: string,
    language?: 'en' | 'vi',
  ): Promise<string> {
    const providerName =
      aiProvider || this.configService.get<string>('AI_PROVIDER') || 'openai';
    const provider = this.createProvider(providerName);

    const input = {
      prompt,
      language: language || 'en',
      aiProvider,
    };

    try {
      return await provider.evaluateInterview(input);
    } catch {
      throw new ServiceUnavailableException(
        'System is currently overloaded. Please try again later.',
      );
    }
  }
}

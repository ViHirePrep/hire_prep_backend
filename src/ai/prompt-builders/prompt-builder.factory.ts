import { EnglishPromptBuilder } from './english.prompt-builder';
import { PromptBuilder } from './prompt-builder.abstract';
import { VietnamesePromptBuilder } from './vietnamese.prompt-builder';

export class PromptBuilderFactory {
  static get(language: 'en' | 'vi' = 'vi'): PromptBuilder {
    if (language === 'en') {
      return new EnglishPromptBuilder();
    }
    return new VietnamesePromptBuilder();
  }
}

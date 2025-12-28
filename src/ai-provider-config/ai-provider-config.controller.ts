import { Controller, Get } from '@nestjs/common';

import { AIProviderConfigService } from './ai-provider-config.service';

@Controller('ai-providers')
export class AIProviderConfigController {
  constructor(
    private readonly aiProviderConfigService: AIProviderConfigService,
  ) {}

  @Get()
  getActiveProviders() {
    return this.aiProviderConfigService.getActiveProviders();
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AIProviderConfigController } from '../ai-provider-config/ai-provider-config.controller';
import { AIProviderConfigService } from '../ai-provider-config/ai-provider-config.service';
import { PrismaModule } from '../prisma/prisma.module';

import { AIService } from './ai.service';
import { AI_RATE_LIMIT_CONFIG } from './config/rate-limit.config';
import { AIRateLimitGuard } from './guards/ai-rate-limit.guard';
import { SpeechToTextController, SpeechToTextService } from './speech-to-text';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        name: 'ai-operations',
        ttl: AI_RATE_LIMIT_CONFIG.DEFAULT.ttl,
        limit: AI_RATE_LIMIT_CONFIG.DEFAULT.limit,
      },
    ]),
  ],
  controllers: [AIProviderConfigController, SpeechToTextController],
  providers: [
    AIService,
    AIProviderConfigService,
    AIRateLimitGuard,
    SpeechToTextService,
  ],
  exports: [
    AIService,
    AIProviderConfigService,
    AIRateLimitGuard,
    SpeechToTextService,
  ],
})
export class AIModule {}

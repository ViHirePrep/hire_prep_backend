import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

import { RATE_LIMIT_MESSAGES } from '../config/rate-limit.config';

@Injectable()
export class AIRateLimitGuard extends ThrottlerGuard {
  protected throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(RATE_LIMIT_MESSAGES.AI_OPERATIONS);
  }
}

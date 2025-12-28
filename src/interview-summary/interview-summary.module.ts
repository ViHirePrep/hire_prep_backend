import { Module } from '@nestjs/common';

import { AIModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';

import { InterviewSummaryController } from './interview-summary.controller';
import { InterviewSummaryService } from './interview-summary.service';

@Module({
  imports: [PrismaModule, AIModule],
  controllers: [InterviewSummaryController],
  providers: [InterviewSummaryService],
  exports: [InterviewSummaryService],
})
export class InterviewSummaryModule {}

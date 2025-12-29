import { Module } from '@nestjs/common';

import { AIModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';

import { QuestionService } from './interview-question.service';

@Module({
  imports: [PrismaModule, AIModule],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}

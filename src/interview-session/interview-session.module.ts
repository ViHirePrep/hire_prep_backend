import { Module } from '@nestjs/common';

import { AIModule } from '../ai/ai.module';
import { QuestionModule } from '../interview-question/interview-question.module';
import { JobDescriptionModule } from '../job-description/job-description.module';
import { PrismaModule } from '../prisma/prisma.module';

import { InterviewSessionController } from './interview-session.controller';
import { InterviewSessionService } from './interview-session.service';

@Module({
  imports: [PrismaModule, JobDescriptionModule, QuestionModule, AIModule],
  controllers: [InterviewSessionController],
  providers: [InterviewSessionService],
  exports: [InterviewSessionService],
})
export class InterviewSessionModule {}

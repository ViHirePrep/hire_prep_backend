import { Module } from '@nestjs/common';

import { AIModule } from '../ai/ai.module';
import { InterviewSummaryModule } from '../interview-summary/interview-summary.module';
import { PrismaModule } from '../prisma/prisma.module';

import { InterviewAnswerController } from './interview-answer.controller';
import { InterviewAnswerService } from './interview-answer.service';
import { MockInterviewSpeechController } from './mock-interview-speech.controller';
import { MockInterviewSpeechService } from './mock-interview-speech.service';

@Module({
  imports: [PrismaModule, AIModule, InterviewSummaryModule],
  controllers: [InterviewAnswerController, MockInterviewSpeechController],
  providers: [InterviewAnswerService, MockInterviewSpeechService],
  exports: [InterviewAnswerService, MockInterviewSpeechService],
})
export class InterviewAnswerModule {}

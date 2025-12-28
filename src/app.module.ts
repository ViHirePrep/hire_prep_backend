import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ActivityLogService } from './activity-log/activity-log.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { InterviewAnswerModule } from './interview-answer/interview-answer.module';
import { InterviewSessionModule } from './interview-session/interview-session.module';
import { InterviewSummaryModule } from './interview-summary/interview-summary.module';
import { JobDescriptionModule } from './job-description/job-description.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    InterviewAnswerModule,
    AuthenticationModule,
    JobDescriptionModule,
    InterviewSessionModule,
    InterviewSummaryModule,
  ],
  controllers: [AppController],
  providers: [AppService, ActivityLogService],
})
export class AppModule {}

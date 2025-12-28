import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

import { InterviewSummaryService } from './interview-summary.service';

@Controller('interview-summary')
@UseGuards(JwtAuthGuard)
export class InterviewSummaryController {
  constructor(
    private readonly interviewSummaryService: InterviewSummaryService,
  ) {}

  @Get(':sessionId')
  async getSummary(
    @Param('sessionId') sessionId: string,
    @Query('language') language?: 'en' | 'vi',
    @Query('aiProvider') aiProvider?: string,
  ) {
    return this.interviewSummaryService.generateSummary({
      sessionId,
      language: language || 'vi',
      aiProvider,
    });
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AI_RATE_LIMIT_CONFIG } from '../ai/config/rate-limit.config';
import { AIRateLimitGuard } from '../ai/guards/ai-rate-limit.guard';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

import { CreateSessionDto } from './dto/create-session.dto';
import { InterviewSessionService } from './interview-session.service';

@Controller('interview-sessions')
@UseGuards(JwtAuthGuard)
export class InterviewSessionController {
  constructor(
    private readonly interviewSessionService: InterviewSessionService,
  ) {}

  @Post()
  @UseGuards(AIRateLimitGuard)
  @Throttle({
    'ai-operations': {
      limit: AI_RATE_LIMIT_CONFIG.CREATE_SESSION.limit,
      ttl: AI_RATE_LIMIT_CONFIG.CREATE_SESSION.ttl,
    },
  })
  createSession(@Body() dto: CreateSessionDto, @Req() req: any) {
    return this.interviewSessionService.createInterviewSession(
      dto,
      req?.user?.userId || '',
      req?.user?.email || '',
    );
  }

  @Get(':id')
  async getSession(@Param('id') id: string) {
    return this.interviewSessionService.findById(id);
  }

  @Get('link/:sessionLink')
  async getSessionByLink(@Param('sessionLink') sessionLink: string) {
    return this.interviewSessionService.findBySessionLink(sessionLink);
  }

  @Delete(':id')
  async deleteSession(@Param('id') id: string, @Req() req: any) {
    return this.interviewSessionService.delete(id, req.user.userId);
  }
  @Post(':id/feedback')
  submitFeedback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param('id') id: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() feedbackData: { rating: number; feedback: string },
  ) {
    // return this.interviewSessionService.submitFeedback(id, feedbackData);
    return;
  }
}

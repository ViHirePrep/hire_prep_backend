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
  async createSession(@Body() dto: CreateSessionDto, @Req() req: any) {
    return this.interviewSessionService.createSession(
      dto,
      req?.user?.userId || '',
      req?.user?.email || '',
    );
  }

  @Get()
  async getMySessions(@Req() req: any) {
    return this.interviewSessionService.findByCreator(req.user.userId);
  }

  @Get(':id')
  async getSession(@Param('id') id: string) {
    return this.interviewSessionService.findById(id);
  }

  @Get('link/:uniqueLink')
  async getSessionByLink(@Param('uniqueLink') uniqueLink: string) {
    return this.interviewSessionService.findByUniqueLink(uniqueLink);
  }

  @Delete(':id')
  async deleteSession(@Param('id') id: string, @Req() req: any) {
    return this.interviewSessionService.delete(id, req.user.userId);
  }
}

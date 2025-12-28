import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

import { CreateInterviewAnswerDto } from './dto/create-interview-answer.dto';
import { UpdateInterviewAnswerDto } from './dto/update-interview-answer.dto';
import { InterviewAnswerService } from './interview-answer.service';

@Controller('interview-answer')
@UseGuards(JwtAuthGuard)
export class InterviewAnswerController {
  constructor(
    private readonly interviewAnswerService: InterviewAnswerService,
  ) {}

  @Post()
  create(@Body() createInterviewAnswerDto: CreateInterviewAnswerDto) {
    return this.interviewAnswerService.create(createInterviewAnswerDto);
  }

  @Post('submit')
  async submitAnswers(@Body() body: any) {
    return this.interviewAnswerService.submitAnswers(body);
  }

  @Get()
  findAll() {
    return this.interviewAnswerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interviewAnswerService.findOne(id);
  }

  @Get('session/:sessionId')
  findBySession(@Param('sessionId') sessionId: string) {
    return this.interviewAnswerService.findBySession(sessionId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInterviewAnswerDto: UpdateInterviewAnswerDto,
  ) {
    return this.interviewAnswerService.update(id, updateInterviewAnswerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interviewAnswerService.remove(id);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';

import { InterviewSummaryService } from '../interview-summary/interview-summary.service';
import { PrismaService } from '../prisma/prisma.service';

import { CreateInterviewAnswerDto } from './dto/create-interview-answer.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { UpdateInterviewAnswerDto } from './dto/update-interview-answer.dto';

@Injectable()
export class InterviewAnswerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly interviewSummaryService: InterviewSummaryService,
  ) {}

  async create(createInterviewAnswerDto: CreateInterviewAnswerDto) {
    return this.prisma.interviewAnswer.create({
      data: {
        questionId: createInterviewAnswerDto.questionId,
        sessionId: createInterviewAnswerDto.sessionId,
        candidateAnswerText: createInterviewAnswerDto.candidateAnswerText,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.interviewAnswer.findUnique({
      where: { id },
      include: {
        interviewQuestion: true,
      },
    });
  }

  async findBySession(sessionId: string) {
    return this.prisma.interviewAnswer.findMany({
      where: { sessionId },
      include: {
        interviewQuestion: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async saveAnswer(createInterviewAnswerDto: CreateInterviewAnswerDto) {
    const existingAnswer = await this.prisma.interviewAnswer.findFirst({
      where: {
        sessionId: createInterviewAnswerDto.sessionId,
        questionId: createInterviewAnswerDto.questionId,
      },
    });

    if (existingAnswer)
      throw new BadRequestException('You have already answered this question');

    return this.prisma.interviewAnswer.create({
      data: {
        questionId: createInterviewAnswerDto.questionId,
        sessionId: createInterviewAnswerDto.sessionId,
        candidateAnswerText: createInterviewAnswerDto.candidateAnswerText,
      },
    });
  }

  async update(id: string, updateInterviewAnswerDto: UpdateInterviewAnswerDto) {
    return this.prisma.interviewAnswer.update({
      where: { id },
      data: updateInterviewAnswerDto,
    });
  }

  async remove(id: string) {
    return this.prisma.interviewAnswer.delete({
      where: { id },
    });
  }

  async submitAnswers(submitAnswersDto: SubmitAnswersDto) {
    const { sessionId } = submitAnswersDto;

    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    await this.prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED' },
    });

    const interviewSummary = this.interviewSummaryService.generateSummary({
      sessionId,
      language: 'vi',
    });

    return {
      success: true,
      answers: interviewSummary,
    };
  }
}

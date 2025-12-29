import { Injectable } from '@nestjs/common';

import { InterviewSummaryService } from '../interview-summary/interview-summary.service';
import { PrismaService } from '../prisma/prisma.service';

import { CreateInterviewAnswerDto } from './dto/create-interview-answer.dto';
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

  async findAll() {
    return this.prisma.interviewAnswer.findMany({
      include: {
        question: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.interviewAnswer.findUnique({
      where: { id },
      include: {
        question: true,
      },
    });
  }

  async findBySession(sessionId: string) {
    return this.prisma.interviewAnswer.findMany({
      where: { sessionId },
      include: {
        question: true,
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

    if (!existingAnswer) throw new Error('Answer not found');

    return this.prisma.interviewAnswer.update({
      where: { id: existingAnswer.id },
      data: {
        candidateAnswerText: createInterviewAnswerDto.candidateAnswerText,
        updatedAt: new Date(),
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

  async submitAnswers(body: any) {
    const { sessionId } = body;

    if (!sessionId) {
      throw new Error('Session ID is required');
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

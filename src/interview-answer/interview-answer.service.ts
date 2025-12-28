import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { InterviewSummaryService } from '../interview-summary/interview-summary.service';
import { CreateInterviewAnswerDto } from './dto/create-interview-answer.dto';
import { UpdateInterviewAnswerDto } from './dto/update-interview-answer.dto';

@Injectable()
export class InterviewAnswerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly interviewSummaryService: InterviewSummaryService,
  ) {}

  async create(createInterviewAnswerDto: CreateInterviewAnswerDto) {
    return this.prisma.answer.create({
      data: {
        questionId: createInterviewAnswerDto.questionId,
        sessionId: createInterviewAnswerDto.sessionId,
        candidateAnswerText: createInterviewAnswerDto.answerText,
      },
    });
  }

  async findAll() {
    return this.prisma.answer.findMany({
      include: {
        question: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.answer.findUnique({
      where: { id },
      include: {
        question: true,
      },
    });
  }

  async findBySession(sessionId: string) {
    return this.prisma.answer.findMany({
      where: { sessionId },
      include: {
        question: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async update(id: string, updateInterviewAnswerDto: UpdateInterviewAnswerDto) {
    return this.prisma.answer.update({
      where: { id },
      data: updateInterviewAnswerDto,
    });
  }

  async remove(id: string) {
    return this.prisma.answer.delete({
      where: { id },
    });
  }

  async submitAnswers(body: any) {
    const { sessionId, ...answerData } = body;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const answerEntries = Object.entries(answerData).filter(([key]) =>
      key.startsWith('answer_'),
    );

    const results: Prisma.AnswerGetPayload<{}>[] = [];
    for (const [key, value] of answerEntries) {
      const questionId = key.replace('answer_', '');

      const answerText =
        typeof value === 'string' ? value : JSON.stringify(value);

      const existingAnswer = await this.prisma.answer.findFirst({
        where: {
          sessionId,
          questionId,
        },
      });

      if (existingAnswer) {
        const updatedAnswer = await this.prisma.answer.update({
          where: { id: existingAnswer.id },
          data: {
            candidateAnswerText: answerText,
          },
        });
        results.push(updatedAnswer);
      } else {
        const newAnswer = await this.prisma.answer.create({
          data: {
            sessionId,
            questionId,
            candidateAnswerText: answerText,
          },
        });
        results.push(newAnswer);
      }
    }

    await this.prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED' },
    });

    this.interviewSummaryService
      .generateSummary({
        sessionId,
        language: 'en',
      })
      .catch(() => {});

    return {
      success: true,
      count: results.length,
      answers: results,
    };
  }
}

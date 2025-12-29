import { randomBytes } from 'crypto';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { QuestionService } from '../interview-question/interview-question.service';
import { JobDescriptionService } from '../job-description/job-description.service';
import { PrismaService } from '../prisma/prisma.service';

import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class InterviewSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobDescriptionService: JobDescriptionService,
    private readonly questionService: QuestionService,
  ) {}

  async createInterviewSession(
    dto: CreateSessionDto,
    createdBy: string,
    candidateEmail: string,
  ) {
    console.log(dto, 'haha');
    let jobDescriptionText: string | null = null;
    let jdId: string | null = null;

    if (dto?.jobDescription) {
      const jobDescription = await this.prisma.jobDescription.create({
        data: {
          text: dto.jobDescription,
          uploadedBy: createdBy,
        },
      });
      jobDescriptionText = jobDescription.text;
      jdId = jobDescription.id;
    }

    const sessionLink = this.generateSessionLink();
    const interviewSession = await this.prisma.interviewSession.create({
      data: {
        level: dto.level,
        industry: dto.industry || 'IT',
        stack: dto.stack,
        position: dto.position,
        language: dto.language || 'VIETNAMESE',
        numQuestions: dto.numQuestions,
        createdBy,
        sessionLink,
        candidateEmail: candidateEmail,
        status: 'PENDING',
        jdId,
      },
      include: {
        jobDescription: {
          select: {
            id: true,
            text: true,
            fileUrl: true,
          },
        },
      },
    });

    const languageCode = this.mapLanguageToCode(interviewSession.language);
    await this.questionService.generateAndSaveQuestions(
      interviewSession.id,
      jobDescriptionText || null,
      dto.level,
      interviewSession.industry,
      dto.stack,
      interviewSession.position || '',
      dto.numQuestions,
      languageCode,
      dto.aiProvider,
    );

    return {
      id: interviewSession.id,
      sessionLink: interviewSession.sessionLink,
      level: interviewSession.level,
      industry: interviewSession.industry,
      stack: interviewSession.stack,
      position: interviewSession.position,
      numQuestions: interviewSession.numQuestions,
      timeLimit: interviewSession.timeLimit,
      status: interviewSession.status,
      invitedCandidateEmail: interviewSession.candidateEmail,
      createdAt: interviewSession.createdAt,
      jobDescription: interviewSession.jdId,
    };
  }

  private generateSessionLink(): string {
    return randomBytes(16).toString('hex');
  }

  private mapLanguageToCode(language: string): 'en' | 'vi' {
    return language === 'ENGLISH' ? 'en' : 'vi';
  }

  async findById(id: string) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id },
      include: {
        jobDescription: true,
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Interview session not found');
    }

    return session;
  }

  async findBySessionLink(sessionLink: string) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { sessionLink },
      include: {
        jobDescription: true,
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            difficulty: true,
            timeLimit: true,
            order: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Interview session not found');
    }

    return session;
  }

  async findByCreator(userId: string) {
    return this.prisma.interviewSession.findMany({
      where: { createdBy: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        jobDescription: {
          select: {
            fileUrl: true,
          },
        },
        _count: {
          select: {
            questions: true,
            answers: true,
          },
        },
      },
    });
  }

  async updateStatus(
    id: string,
    status: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED',
  ) {
    return this.prisma.interviewSession.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string, userId: string) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Interview session not found');
    }

    if (session.createdBy !== userId) {
      throw new BadRequestException('Unauthorized to delete this session');
    }

    await this.prisma.interviewSession.delete({
      where: { id },
    });

    return { message: 'Interview session deleted successfully' };
  }
}

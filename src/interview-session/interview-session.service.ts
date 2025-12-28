import { randomBytes } from 'crypto';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { JobDescriptionService } from '../job-description/job-description.service';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionService } from '../question/question.service';

import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class InterviewSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobDescriptionService: JobDescriptionService,
    private readonly questionService: QuestionService,
  ) {}

  async createSession(
    dto: CreateSessionDto,
    createdBy: string,
    candidateEmail: string,
  ) {
    let jobDescription: {
      id: string;
      text: string;
      fileUrl: string | null;
      uploadedBy: string;
      createdAt: Date;
    } | null = null;
    let jobDescriptionText: string | null = null;

    // First check if jdId is provided to get existing job description
    if (dto.jdId) {
      jobDescription = await this.jobDescriptionService.findById(dto.jdId);

      if (!jobDescription) {
        throw new NotFoundException('Job description not found');
      }

      jobDescriptionText = jobDescription.text;
    }
    // Otherwise, use the job description text if provided directly
    else if (dto.jobDescription) {
      jobDescriptionText = dto.jobDescription;
    }

    const uniqueLink = this.generateUniqueLink();

    const timeLimit = dto.timeLimit || dto.numQuestions * 3;

    const session = await this.prisma.interviewSession.create({
      data: {
        jdId: dto.jdId || null, // Still store jdId if provided
        level: dto.level,
        industry: dto.industry || 'IT',
        stack: dto.stack,
        position: dto.position,
        language: dto.language || 'VIETNAMESE',
        numQuestions: dto.numQuestions,
        timeLimit,
        createdBy,
        candidateEmail: candidateEmail,
        uniqueLink,
        status: 'PENDING',
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

    const languageCode = this.mapLanguageToCode(session.language);
    await this.questionService.generateAndSaveQuestions(
      session.id,
      jobDescriptionText || null, // Use the job description text we determined
      dto.level,
      session.industry,
      dto.stack,
      dto.position,
      dto.numQuestions,
      languageCode,
      dto.aiProvider,
    );

    return {
      id: session.id,
      uniqueLink: session.uniqueLink,
      level: dto.level,
      industry: session.industry,
      stack: session.stack,
      position: session.position,
      numQuestions: session.numQuestions,
      timeLimit: session.timeLimit,
      status: session.status,
      invitedCandidateEmail: session.candidateEmail,
      createdAt: session.createdAt,
      jobDescription: session.jobDescription,
    };
  }

  private generateUniqueLink(): string {
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

  async findByUniqueLink(uniqueLink: string) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { uniqueLink },
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

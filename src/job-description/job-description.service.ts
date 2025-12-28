import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as mammoth from 'mammoth';

import { PrismaService } from '../prisma/prisma.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

@Injectable()
export class JobDescriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadAndExtract(file: Express.Multer.File, uploadedBy: string) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const maxFileSize = 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      throw new BadRequestException('File size must be less than 10MB');
    }

    let extractedText = '';

    try {
      if (file.mimetype === 'application/pdf') {
        const pdfData = await pdfParse(file.buffer);
        extractedText = pdfData.text;
      } else if (
        file.mimetype ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/msword'
      ) {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = result.value;
      } else {
        throw new BadRequestException(
          'Invalid file type. Only PDF and DOC/DOCX are supported',
        );
      }

      extractedText = extractedText.trim().replace(/\s+/g, ' ');

      const wordCount = extractedText.split(/\s+/).length;
      if (wordCount > 5000) {
        throw new BadRequestException(
          `Job description is too long. Maximum 5000 words allowed. Current: ${wordCount} words`,
        );
      }

      if (!extractedText || extractedText.length < 100) {
        throw new BadRequestException(
          'Extracted text is too short or empty. Please provide a valid job description',
        );
      }

      const jobDescription = await this.prisma.jobDescription.create({
        data: {
          text: extractedText,
          fileUrl: file.originalname,
          uploadedBy,
        },
      });

      return {
        id: jobDescription.id,
        text: extractedText,
        wordCount,
        uploadedAt: jobDescription.createdAt,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to extract text from file. Please ensure the file is valid',
      );
    }
  }

  async findById(id: string) {
    const jobDescription = await this.prisma.jobDescription.findUnique({
      where: { id },
    });

    if (!jobDescription) {
      throw new NotFoundException('Job description not found');
    }

    return jobDescription;
  }

  async findByUserId(userId: string) {
    return this.prisma.jobDescription.findMany({
      where: { uploadedBy: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileUrl: true,
        createdAt: true,
        text: true,
      },
    });
  }

  async delete(id: string, userId: string) {
    const jobDescription = await this.prisma.jobDescription.findUnique({
      where: { id },
    });

    if (!jobDescription) {
      throw new NotFoundException('Job description not found');
    }

    if (jobDescription.uploadedBy !== userId) {
      throw new BadRequestException(
        'Unauthorized to delete this job description',
      );
    }

    await this.prisma.jobDescription.delete({
      where: { id },
    });

    return { message: 'Job description deleted successfully' };
  }
}

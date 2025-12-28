import { Injectable, BadRequestException } from '@nestjs/common';

import { SpeechToTextService } from '../ai/speech-to-text';
import { InterviewAnswerService } from '../interview-answer/interview-answer.service';
import { PrismaService } from '../prisma/prisma.service';

export interface MockInterviewSpeechInput {
  sessionId: string;
  questionId: string;
  audioFile: Express.Multer.File;
  language?: 'en' | 'vi';
}

@Injectable()
export class MockInterviewSpeechService {
  constructor(
    private readonly speechToTextService: SpeechToTextService,
    private readonly interviewAnswerService: InterviewAnswerService,
    private readonly prisma: PrismaService,
  ) {}

  async processSpeechAnswer(input: MockInterviewSpeechInput) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: input.sessionId },
    });

    if (!session) {
      throw new BadRequestException('Mock interview session not found');
    }

    const question = await this.prisma.question.findUnique({
      where: { id: input.questionId },
    });

    if (!question) {
      throw new BadRequestException('Question not found');
    }

    const transcription = await this.speechToTextService.transcribeAudio(
      input.audioFile,
      input.language,
    );

    const answer = await this.interviewAnswerService.create({
      questionId: input.questionId,
      sessionId: input.sessionId,
      answerText: transcription.text,
      isFromSpeech: true,
    });

    return {
      success: true,
      answerId: answer.id,
      transcribedText: transcription.text,
      language: transcription.language,
    };
  }

  async testAudioForMockInterview(audioFile: Express.Multer.File) {
    return this.speechToTextService.testAudioQuality(audioFile);
  }
}

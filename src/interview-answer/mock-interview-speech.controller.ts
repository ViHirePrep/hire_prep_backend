import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { MockInterviewSpeechService } from './mock-interview-speech.service';

@Controller('mock-interview-speech')
export class MockInterviewSpeechController {
  constructor(
    private readonly mockInterviewSpeechService: MockInterviewSpeechService,
  ) {}

  @Post('answer')
  @UseInterceptors(FileInterceptor('audio'))
  async submitSpeechAnswer(
    @UploadedFile() audio: Express.Multer.File,
    @Query('sessionId') sessionId: string,
    @Query('questionId') questionId: string,
    @Query('language') language?: 'en' | 'vi',
  ) {
    if (!audio) {
      throw new BadRequestException('No audio file provided');
    }

    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    if (!questionId) {
      throw new BadRequestException('Question ID is required');
    }

    return this.mockInterviewSpeechService.processSpeechAnswer({
      sessionId,
      questionId,
      audioFile: audio,
      language,
    });
  }

  @Post('test')
  @UseInterceptors(FileInterceptor('audio'))
  async testAudio(@UploadedFile() audio: Express.Multer.File) {
    if (!audio) {
      throw new BadRequestException('No audio file provided');
    }

    return this.mockInterviewSpeechService.testAudioForMockInterview(audio);
  }
}

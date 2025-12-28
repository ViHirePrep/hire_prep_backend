import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { SpeechToTextService } from './speech-to-text.service';

@Controller('speech-to-text')
export class SpeechToTextController {
  constructor(private readonly speechToTextService: SpeechToTextService) {}

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio'))
  async transcribe(
    @UploadedFile() audio: Express.Multer.File,
    @Query('language') language?: 'en' | 'vi',
  ) {
    if (!audio) {
      throw new BadRequestException('No audio file provided');
    }

    return this.speechToTextService.transcribeAudio(audio, language);
  }

  @Post('test')
  @UseInterceptors(FileInterceptor('audio'))
  async testAudio(@UploadedFile() audio: Express.Multer.File) {
    if (!audio) {
      throw new BadRequestException('No audio file provided');
    }

    return this.speechToTextService.testAudioQuality(audio);
  }
}

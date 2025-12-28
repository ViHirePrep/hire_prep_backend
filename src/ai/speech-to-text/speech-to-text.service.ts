import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

@Injectable()
export class SpeechToTextService {
  private readonly openaiApiKey: string;
  private readonly openaiApiUrl =
    'https://api.openai.com/v1/audio/transcriptions';

  constructor(private readonly configService: ConfigService) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY') || '';

    if (!this.openaiApiKey) {
      throw new BadRequestException(
        'OPENAI_API_KEY not configured. Speech-to-text will not work.',
      );
    }
  }

  async transcribeAudio(
    audioFile: Express.Multer.File,
    language?: 'en' | 'vi',
  ): Promise<TranscriptionResult> {
    if (!this.openaiApiKey) {
      throw new BadRequestException('Speech-to-text service is not configured');
    }

    // Validate file type
    const allowedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/webm',
      'audio/ogg',
      'audio/m4a',
    ];

    if (!allowedTypes.includes(audioFile.mimetype)) {
      throw new BadRequestException(
        `Invalid audio format. Allowed: ${allowedTypes.join(', ')}`,
      );
    }

    const maxSize = 25 * 1024 * 1024;
    if (audioFile.size > maxSize) {
      throw new BadRequestException(
        'Audio file too large. Maximum size is 25MB',
      );
    }

    try {
      const formData = new FormData();
      formData.append('file', audioFile.buffer, {
        filename: audioFile.originalname,
        contentType: audioFile.mimetype,
      });
      formData.append('model', 'whisper-1');

      if (language) {
        formData.append('language', language);
      }

      const response = await axios.post(this.openaiApiUrl, formData, {
        headers: {
          Authorization: `Bearer ${this.openaiApiKey}`,
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
      });

      return {
        text: response.data.text,
        language: response.data.language,
        duration: response.data.duration,
      };
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new BadRequestException(
          'Speech-to-text service is temporarily unavailable. Please try again later.',
        );
      }

      throw new BadRequestException(
        'Failed to transcribe audio. Please ensure the audio is clear and try again.',
      );
    }
  }

  /**
   * Test audio quality and return confidence score
   * Used for pre-interview microphone test
   */
  async testAudioQuality(
    audioFile: Express.Multer.File,
  ): Promise<{ success: boolean; message: string; transcription?: string }> {
    try {
      const result = await this.transcribeAudio(audioFile);

      // Check if we got meaningful transcription
      if (!result.text || result.text.trim().length < 3) {
        return {
          success: false,
          message: 'Audio quality too low. Please speak louder and clearer.',
        };
      }

      return {
        success: true,
        message: 'Audio quality is good. You can start your mock interview.',
        transcription: result.text,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.message ||
          'Failed to test audio. Please check your microphone.',
      };
    }
  }
}

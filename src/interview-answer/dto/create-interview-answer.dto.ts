import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateInterviewAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  sessionId: string;

  @IsString()
  answerText: string;

  @IsOptional()
  @IsBoolean()
  isFromSpeech?: boolean;
}

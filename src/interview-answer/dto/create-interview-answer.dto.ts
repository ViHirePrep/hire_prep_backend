import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateInterviewAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  sessionId: string;

  @IsOptional()
  @IsBoolean()
  candidateAnswerText: string;
}

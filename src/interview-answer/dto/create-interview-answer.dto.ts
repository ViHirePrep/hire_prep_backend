import { IsString, IsOptional } from 'class-validator';

export class CreateInterviewAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  sessionId: string;

  @IsOptional()
  @IsString()
  candidateAnswerText: string;
}

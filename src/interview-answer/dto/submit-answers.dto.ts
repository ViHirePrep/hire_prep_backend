import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitAnswersDto {
  @IsNotEmpty()
  @IsString()
  sessionId: string;
}

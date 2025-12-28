import { PartialType } from '@nestjs/mapped-types';

import { CreateInterviewAnswerDto } from './create-interview-answer.dto';

export class UpdateInterviewAnswerDto extends PartialType(
  CreateInterviewAnswerDto,
) {}

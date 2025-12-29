import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum InterviewLevel {
  INTERN = 'INTERN',
  FRESHER = 'FRESHER',
  JUNIOR = 'JUNIOR',
  MIDDLE = 'MIDDLE',
  SENIOR = 'SENIOR',
  EXPERT = 'EXPERT',
}

export enum TechStack {
  BACKEND = 'BACKEND',
  FRONTEND = 'FRONTEND',
  FULLSTACK = 'FULLSTACK',
  DEVOPS = 'DEVOPS',
  MOBILE = 'MOBILE',
  DATA = 'DATA',
  QA = 'QA',
  SECURITY = 'SECURITY',
  CLOUD = 'CLOUD',
  AI_ML = 'AI_ML',
}

export enum Industry {
  IT = 'IT',
  HEALTHCARE = 'HEALTHCARE',
  FINANCE = 'FINANCE',
  EDUCATION = 'EDUCATION',
  RETAIL = 'RETAIL',
  MANUFACTURING = 'MANUFACTURING',
  MARKETING = 'MARKETING',
  HR = 'HR',
  LEGAL = 'LEGAL',
  OTHER = 'OTHER',
}

export enum Language {
  ENGLISH = 'ENGLISH',
  VIETNAMESE = 'VIETNAMESE',
}

export class CreateSessionDto {
  @IsOptional()
  @IsString()
  jobDescription?: string;

  @IsEnum(InterviewLevel)
  level: InterviewLevel;

  @IsOptional()
  @IsEnum(Industry)
  industry?: Industry;

  @IsOptional()
  @IsEnum(TechStack)
  stack?: TechStack;

  @IsOptional()
  @IsString()
  position?: string;

  @IsInt()
  @Min(5)
  @Max(30)
  numQuestions: number;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(180)
  timeLimit?: number;

  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @IsOptional()
  @IsString()
  aiProvider?: string;
}

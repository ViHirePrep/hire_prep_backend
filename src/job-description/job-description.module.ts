import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { JobDescriptionController } from './job-description.controller';
import { JobDescriptionService } from './job-description.service';

@Module({
  imports: [PrismaModule],
  controllers: [JobDescriptionController],
  providers: [JobDescriptionService],
  exports: [JobDescriptionService],
})
export class JobDescriptionModule {}

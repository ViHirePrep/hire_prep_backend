import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

import { JobDescriptionService } from './job-description.service';

@Controller('job-descriptions')
@UseGuards(JwtAuthGuard)
export class JobDescriptionController {
  constructor(private readonly jobDescriptionService: JobDescriptionService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new Error('Invalid file type. Only PDF and DOC/DOCX are allowed'),
            false,
          );
        }
      },
    }),
  )
  async uploadJobDescription(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.jobDescriptionService.uploadAndExtract(file, req.user.userId);
  }

  @Get()
  async getMyJobDescriptions(@Req() req: any) {
    return this.jobDescriptionService.findByUserId(req.user.userId);
  }

  @Get(':id')
  async getJobDescription(@Param('id') id: string) {
    return this.jobDescriptionService.findById(id);
  }

  @Delete(':id')
  async deleteJobDescription(@Param('id') id: string, @Req() req: any) {
    return this.jobDescriptionService.delete(id, req.user.userId);
  }
}

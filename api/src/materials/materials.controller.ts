import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { MaterialsService } from './materials.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../prisma-enums.js';
import { CreatePresignedUrlDto } from './dto/create-presigned-url.dto.js';

@Controller('materials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post('presigned-url')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  createPresignedUrl(@Body() createPresignedUrlDto: CreatePresignedUrlDto) {
    return this.materialsService.createPresignedUrl(
      createPresignedUrlDto.fileName,
      createPresignedUrlDto.fileType,
    );
  }

  @Get('class/:classId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  listForClass(@Param('classId') classId: string, @Request() req) {
    return this.materialsService.listForClass(classId, req.user);
  }
}

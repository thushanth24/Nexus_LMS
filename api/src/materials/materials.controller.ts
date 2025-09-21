import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreatePresignedUrlDto } from './dto/create-presigned-url.dto';

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
}

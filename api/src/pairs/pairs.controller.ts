import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { PairsService } from './pairs.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../prisma-enums.js';

@Controller('pairs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PairsController {
  constructor(private readonly pairsService: PairsService) {}

  @Get('teaching')
  @Roles(UserRole.TEACHER)
  findTeaching(@Request() req) {
    return this.pairsService.findByTeacher(req.user.userId);
  }

  @Get('enrolled')
  @Roles(UserRole.STUDENT)
  findEnrolled(@Request() req) {
    return this.pairsService.findByStudent(req.user.userId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  findOne(@Param('id') id: string, @Request() req) {
    return this.pairsService.findOneAuthorized(id, req.user);
  }
}

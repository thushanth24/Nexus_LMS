import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../prisma-enums.js';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }
}

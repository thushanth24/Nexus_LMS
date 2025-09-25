import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../prisma-enums.js';
import { CreateGroupDto } from './dto/create-group.dto.js';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.groupsService.findAll();
  }

  @Get('teaching')
  @Roles(UserRole.TEACHER)
  findTeaching(@Request() req) {
    return this.groupsService.findByTeacher(req.user.userId);
  }

  @Get('enrolled')
  @Roles(UserRole.STUDENT)
  findEnrolled(@Request() req) {
    return this.groupsService.findByStudent(req.user.userId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  findOne(@Param('id') id: string, @Request() req) {
    return this.groupsService.findOneAuthorized(id, req.user);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }
}

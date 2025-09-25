import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@Controller('schedule')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('my-sessions')
  findMySessions(@Request() req) {
    return this.scheduleService.findSessionsForUser(req.user.userId, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.scheduleService.findOne(id, req.user);
  }
}

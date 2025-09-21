import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('schedule')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('my-sessions')
  findMySessions(@Request() req) {
    return this.scheduleService.findSessionsForUser(req.user.userId, req.user.role);
  }
}

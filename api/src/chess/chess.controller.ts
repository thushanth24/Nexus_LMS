import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ChessService } from './chess.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../prisma-enums.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@Controller('chess')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChessController {
  constructor(private readonly chessService: ChessService) {}

  @Get('presets')
  @Roles(UserRole.TEACHER)
  findMyPresets(@Request() req) {
    return this.chessService.findPresetsByOwner(req.user.userId);
  }
}

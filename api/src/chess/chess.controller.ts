import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ChessService } from './chess.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../common/guards/roles.guard';

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

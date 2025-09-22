import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { LivekitService } from './livekit.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CreateTokenDto } from './dto/create-token.dto.js';

@Controller('livekit')
@UseGuards(JwtAuthGuard)
export class LivekitController {
  constructor(private readonly livekitService: LivekitService) {}

  @Post('token')
  createToken(@Request() req, @Body() createTokenDto: CreateTokenDto) {
    const { userId, role } = req.user;
    const { roomName } = createTokenDto;

    return this.livekitService.createToken(userId, roomName, role);
  }
}

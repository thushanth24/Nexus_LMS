import { Module } from '@nestjs/common';
import { ChessService } from './chess.service.js';
import { ChessController } from './chess.controller.js';

@Module({
  controllers: [ChessController],
  providers: [ChessService],
})
export class ChessModule {}

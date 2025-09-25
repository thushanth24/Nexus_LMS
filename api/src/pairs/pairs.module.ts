import { Module } from '@nestjs/common';
import { PairsService } from './pairs.service.js';
import { PairsController } from './pairs.controller.js';

@Module({
  controllers: [PairsController],
  providers: [PairsService],
})
export class PairsModule {}

import { Module } from '@nestjs/common';
import { LivekitService } from './livekit.service.js';
import { LivekitController } from './livekit.controller.js';

@Module({
  controllers: [LivekitController],
  providers: [LivekitService],
})
export class LivekitModule {}

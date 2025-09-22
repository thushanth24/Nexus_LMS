import { Module } from '@nestjs/common';
import { MaterialsService } from './materials.service.js';
import { MaterialsController } from './materials.controller.js';

@Module({
  controllers: [MaterialsController],
  providers: [MaterialsService],
})
export class MaterialsModule {}

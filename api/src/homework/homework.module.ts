import { Module } from '@nestjs/common';
import { HomeworkService } from './homework.service.js';
import { HomeworkController } from './homework.controller.js';

@Module({
  controllers: [HomeworkController],
  providers: [HomeworkService],
})
export class HomeworkModule {}

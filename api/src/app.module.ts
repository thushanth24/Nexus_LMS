import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { GroupsModule } from './groups/groups.module.js';
import { ScheduleModule } from './schedule/schedule.module.js';
import { LivekitModule } from './livekit/livekit.module.js';
import { MaterialsModule } from './materials/materials.module.js';
import { HomeworkModule } from './homework/homework.module.js';
import { SubmissionsModule } from './submissions/submissions.module.js';
import { ChessModule } from './chess/chess.module.js';
import { HealthModule } from './health/health.module.js';
import configuration from './config/configuration.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GroupsModule,
    ScheduleModule,
    LivekitModule,
    MaterialsModule,
    HomeworkModule,
    SubmissionsModule,
    ChessModule,
    HealthModule,
  ],
})
export class AppModule {}

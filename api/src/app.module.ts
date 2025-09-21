import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { GroupsModule } from './groups/groups.module';
import { ScheduleModule } from './schedule/schedule.module';
import { LivekitModule } from './livekit/livekit.module';
import { MaterialsModule } from './materials/materials.module';
import { HomeworkModule } from './homework/homework.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { ChessModule } from './chess/chess.module';
import { HealthModule } from './health/health.module';
import configuration from './config/configuration';

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

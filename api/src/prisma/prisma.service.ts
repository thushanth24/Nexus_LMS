import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // FIX: Added constructor to ensure PrismaClient is properly initialized.
  // This resolves the issue with `$connect` and model properties (e.g., `user`, `group`) not being found.
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }
}

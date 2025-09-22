import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ChessService {
  constructor(private prisma: PrismaService) {}

  findPresetsByOwner(ownerId: string) {
    return this.prisma.chessPreset.findMany({
      where: { ownerId },
    });
  }
}

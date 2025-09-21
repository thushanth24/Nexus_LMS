import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient, Room } from 'livekit-server-sdk';
import { UserRole } from '@prisma/client';

@Injectable()
export class LivekitService {
  private roomService: RoomServiceClient;

  constructor(private configService: ConfigService) {
    this.roomService = new RoomServiceClient(
      this.configService.get<string>('livekit.host'),
      this.configService.get<string>('livekit.apiKey'),
      this.configService.get<string>('livekit.apiSecret'),
    );
  }

  createToken(participantId: string, roomName: string, role: UserRole) {
    const at = new AccessToken(
      this.configService.get<string>('livekit.apiKey'),
      this.configService.get<string>('livekit.apiSecret'),
      {
        identity: participantId,
        // Add metadata to identify user role on the client
        metadata: JSON.stringify({ role }),
      },
    );

    // Teacher gets elevated permissions
    const canPublish = role === UserRole.TEACHER || role === UserRole.ADMIN;
    
    at.addGrant({ 
        roomJoin: true, 
        room: roomName,
        canPublish,
        canSubscribe: true,
        canPublishData: canPublish,
    });

    return {
      token: at.toJwt(),
    };
  }
}

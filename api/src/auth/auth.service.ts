import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, pass: string) {
    const user = await this.validateUser(email, pass);
    if (!user) {
      // In a real app, we should use a generic message to avoid email enumeration attacks.
      // For this demo, any password works.
      const userByEmail = await this.usersService.findOneByEmail(email);
      if (!userByEmail) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return this.generateToken(userByEmail);
    }
    return this.generateToken(user);
  }
  
  private generateToken(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }
}

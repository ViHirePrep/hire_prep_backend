import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';

import { UserService } from '../user/user.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(userId: string) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async me(userId: string) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async loginWithGoogle(googleProfile: {
    googleId: string;
    email: string;
    name: string;
  }) {
    let user = await this.userService.findByGoogleId(googleProfile.googleId);

    if (!user) {
      user = await this.userService.findByEmail(googleProfile.email);

      if (user) {
        user = await this.userService.updateGoogleId(
          user.id,
          googleProfile.googleId,
        );
      } else {
        user = await this.userService.create({
          email: googleProfile.email,
          name: googleProfile.name,
          googleId: googleProfile.googleId,
          role: UserRole.CANDIDATE,
        });
      }
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    name: string;
    role: string;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
    };
  }
}

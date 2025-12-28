import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: {
    email: string;
    name: string;
    googleId: string;
    role?: UserRole;
  }) {
    return this.prisma.user.create({
      data: {
        ...data,
        role: data.role ?? UserRole.CANDIDATE,
      },
    });
  }

  async updateGoogleId(userId: string, googleId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { googleId },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.findById(id);
  }

  remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}

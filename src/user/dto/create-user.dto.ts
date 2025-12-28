import { UserRole } from '@prisma/client';

export class CreateUserDto {
  email: string;
  name: string;
  googleId: string;
  role?: UserRole;
}

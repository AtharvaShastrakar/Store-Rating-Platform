import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { generateToken } from '../utils/jwt';
import { SignupInput, LoginInput, UpdatePasswordInput } from '../schemas/auth.schema';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../errors/AppError';
import { Role } from '@prisma/client';

export class AuthService {
  /**
   * Registers a new normal user account.
   */
  public async signup(input: SignupInput) {
    const emailLower = input.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      throw new BadRequestError('Email is already registered', [
        { field: 'email', message: 'Email is already registered' },
      ]);
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: emailLower,
        password: hashedPassword,
        address: input.address.trim(),
        role: Role.NORMAL_USER,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    };
  }

  /**
   * Single login method for all user roles.
   */
  public async login(input: LoginInput) {
    const emailLower = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    };
  }

  /**
   * Updates authenticated user password.
   */
  public async updatePassword(userId: string, input: UpdatePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User account not found');
    }

    if (input.currentPassword) {
      const isMatch = await bcrypt.compare(input.currentPassword, user.password);
      if (!isMatch) {
        throw new BadRequestError('Current password is incorrect', [
          { field: 'currentPassword', message: 'Current password is incorrect' },
        ]);
      }
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  /**
   * Retrieves profile details of authenticated user.
   */
  public async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User account not found');
    }

    return user;
  }
}

export const authService = new AuthService();

import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { generateToken } from '../utils/jwt';
import {
  validateEmail,
  validateName,
  validateAddress,
  validatePassword,
  validateUserPayload,
} from '../utils/validation';
import { AuthenticatedRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

export const signup = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, address } = req.body;

    const validationErrors = validateUserPayload({ name, email, password, address });
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        errors: [{ field: 'email', message: 'Email is already registered' }],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        address: address.trim(),
        role: Role.NORMAL_USER,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const pwdErr = validatePassword(newPassword);
    if (pwdErr) {
      return res.status(400).json({
        errors: [{ field: 'newPassword', message: pwdErr }],
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          errors: [{ field: 'currentPassword', message: 'Current password is incorrect' }],
        });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Update password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

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
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error: any) {
    console.error('Get me error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

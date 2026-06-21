import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { RoleType, User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-token';
const TOKEN_EXPIRY = '7d';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  recruiterCompanyId?: string | null;
}

export class AuthService {
  async register(data: { name: string; email: string; password?: string; role?: RoleType; recruiterCompanyId?: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('A user with this email address already exists.');
    }

    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;

    return userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || 'STUDENT',
      recruiterCompanyId: data.recruiterCompanyId || null,
    });
  }

  async login(email: string, password?: string): Promise<{ token: string; user: UserSession }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('This account has been suspended or deactivated.');
    }

    if (password && user.passwordHash) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        throw new Error('Invalid email or password.');
      }
    } else if (user.passwordHash) {
      throw new Error('Password required for credential login.');
    }

    const sessionData: UserSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      recruiterCompanyId: user.recruiterCompanyId,
    };

    const token = jwt.sign(sessionData, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    // Log login activity
    await userRepository.logAudit(user.id, 'user.login', { email });

    return { token, user: sessionData };
  }

  verifyToken(token: string): UserSession {
    try {
      return jwt.verify(token, JWT_SECRET) as UserSession;
    } catch (e) {
      throw new Error('Session expired or invalid token.');
    }
  }
}

export const authService = new AuthService();

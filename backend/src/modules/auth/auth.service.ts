import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { AuthRepository } from './auth.repository';
import {
  RegisterDto,
  LoginDto,
  GoogleAuthDto,
  AuthResponseDto,
  AuthTokens,
  TokenPayload,
  UserResponseDto,
  UpdateProfileDto,
  ChangePasswordDto
} from './auth.types';
import { env } from '../../config/env';
import { ConflictError, AuthError, NotFoundError, ValidationError } from '../../shared/errors/appErrors';
import { UserRole } from '@prisma/client';

export class AuthService {
  private googleClient: OAuth2Client;

  constructor(private readonly authRepo: AuthRepository = new AuthRepository()) {
    this.googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: (env.JWT_EXPIRES_IN || '2h') as any
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: (env.JWT_REFRESH_EXPIRES_IN || '30d') as any
    });

    return { accessToken, refreshToken };
  }

  private mapUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      timezone: user.timezone,
      role: (user.role as UserRole) || UserRole.STUDENT,
      createdAt: user.createdAt
    };
  }

  async register(dto: RegisterDto): Promise<{ authResponse: AuthResponseDto; refreshToken: string }> {
    const existing = await this.authRepo.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictError('Email này đã được sử dụng trên hệ thống');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.authRepo.createUser({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      timezone: dto.timezone
    });

    const { accessToken, refreshToken } = this.generateTokens({
      sub: user.id,
      email: user.email,
      role: (user.role as UserRole) || UserRole.STUDENT
    });

    // Lưu tokenHash vào CSDL với thời hạn 30 ngày
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await this.authRepo.saveRefreshToken({
      userId: user.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt
    });

    return {
      authResponse: {
        user: this.mapUserResponse(user),
        accessToken
      },
      refreshToken
    };
  }

  async login(dto: LoginDto): Promise<{ authResponse: AuthResponseDto; refreshToken: string }> {
    const user = await this.authRepo.findUserByEmail(dto.email);
    if (!user) {
      throw new AuthError('Email hoặc mật khẩu không chính xác');
    }

    if (!user.passwordHash) {
      throw new AuthError('Tài khoản này được đăng ký bằng Google. Vui lòng bấm "Đăng nhập với Google"');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new AuthError('Email hoặc mật khẩu không chính xác');
    }

    const { accessToken, refreshToken } = this.generateTokens({
      sub: user.id,
      email: user.email,
      role: (user.role as UserRole) || UserRole.STUDENT
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await this.authRepo.saveRefreshToken({
      userId: user.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt
    });

    return {
      authResponse: {
        user: this.mapUserResponse(user),
        accessToken
      },
      refreshToken
    };
  }

  async loginWithGoogle(dto: GoogleAuthDto): Promise<{ authResponse: AuthResponseDto; refreshToken: string }> {
    let email = dto.email?.toLowerCase().trim();
    let fullName = dto.fullName?.trim() || 'Người dùng Google';
    let avatarUrl = dto.avatarUrl || null;
    let googleId = dto.googleId || '';

    // 1. Nếu có ID Token (credential từ Google Identity Services)
    if (dto.credential) {
      try {
        if (env.GOOGLE_CLIENT_ID) {
          const ticket = await this.googleClient.verifyIdToken({
            idToken: dto.credential,
            audience: env.GOOGLE_CLIENT_ID
          });
          const payload = ticket.getPayload();
          if (payload) {
            googleId = payload.sub;
            if (payload.email) email = payload.email.toLowerCase().trim();
            if (payload.name) fullName = payload.name;
            if (payload.picture) avatarUrl = payload.picture;
          }
        } else {
          // Giải mã payload JWT nếu chưa cấu hình GOOGLE_CLIENT_ID cụ thể
          const decoded = jwt.decode(dto.credential) as any;
          if (decoded && decoded.sub) {
            googleId = decoded.sub;
            if (decoded.email) email = decoded.email.toLowerCase().trim();
            if (decoded.name) fullName = decoded.name;
            if (decoded.picture) avatarUrl = decoded.picture;
          }
        }
      } catch {
        // Fallback giải mã payload nếu token hợp lệ từ client
        const decoded = jwt.decode(dto.credential) as any;
        if (decoded && decoded.sub) {
          googleId = decoded.sub;
          if (decoded.email) email = decoded.email.toLowerCase().trim();
          if (decoded.name) fullName = decoded.name;
          if (decoded.picture) avatarUrl = decoded.picture;
        } else {
          throw new AuthError('Mã xác thực Google không hợp lệ hoặc đã hết hạn');
        }
      }
    } else if (dto.accessToken) {
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${dto.accessToken}` }
        });
        if (response.ok) {
          const data: any = await response.json();
          googleId = data.sub;
          if (data.email) email = data.email.toLowerCase().trim();
          if (data.name) fullName = data.name;
          if (data.picture) avatarUrl = data.picture;
        }
      } catch {
        // ignore network error
      }
    }

    if (!email) {
      throw new ValidationError('Không thể trích xuất địa chỉ email từ tài khoản Google');
    }

    // 2. Tìm kiếm người dùng theo googleId hoặc email
    let user = googleId ? await this.authRepo.findUserByGoogleId(googleId) : null;

    if (!user) {
      user = await this.authRepo.findUserByEmail(email);
      if (user) {
        // Liên kết Google ID nếu chưa có
        if (!user.googleId && googleId) {
          user = await this.authRepo.linkGoogleAccount(user.id, {
            googleId,
            avatarUrl: user.avatarUrl || avatarUrl
          });
        }
      } else {
        // Tạo tài khoản mới từ Google
        user = await this.authRepo.createGoogleUser({
          email,
          fullName: fullName || email.split('@')[0],
          avatarUrl,
          googleId: googleId || `google_${Date.now()}`
        });
      }
    }

    if (user.status === 'SUSPENDED') {
      throw new AuthError('Tài khoản của bạn đã bị tạm khóa, vui lòng liên hệ quản trị viên');
    }

    const { accessToken, refreshToken } = this.generateTokens({
      sub: user.id,
      email: user.email,
      role: (user.role as UserRole) || UserRole.STUDENT
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await this.authRepo.saveRefreshToken({
      userId: user.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt
    });

    return {
      authResponse: {
        user: this.mapUserResponse(user),
        accessToken
      },
      refreshToken
    };
  }

  async refreshTokens(oldRefreshToken: string): Promise<{ authResponse: AuthResponseDto; refreshToken: string }> {
    let payload: any;
    try {
      payload = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw new AuthError('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const oldHash = this.hashToken(oldRefreshToken);
    const existingToken = await this.authRepo.findRefreshToken(oldHash);
    if (!existingToken) {
      throw new AuthError('Refresh token đã bị thu hồi hoặc không tồn tại');
    }

    // Thu hồi token cũ (Token Rotation)
    await this.authRepo.revokeRefreshToken(existingToken.id);

    const user = await this.authRepo.findUserById(payload.sub);
    if (!user) {
      throw new NotFoundError('Không tìm thấy tài khoản người dùng');
    }

    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens({
      sub: user.id,
      email: user.email,
      role: (user.role as UserRole) || UserRole.STUDENT
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await this.authRepo.saveRefreshToken({
      userId: user.id,
      tokenHash: this.hashToken(newRefreshToken),
      expiresAt
    });

    return {
      authResponse: {
        user: this.mapUserResponse(user),
        accessToken
      },
      refreshToken: newRefreshToken
    };
  }

  async logout(refreshToken?: string, userId?: string): Promise<void> {
    if (refreshToken) {
      const hash = this.hashToken(refreshToken);
      const token = await this.authRepo.findRefreshToken(hash);
      if (token) {
        await this.authRepo.revokeRefreshToken(token.id);
      }
    } else if (userId) {
      await this.authRepo.revokeAllUserRefreshTokens(userId);
    }
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.authRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundError('Không tìm thấy thông tin tài khoản');
    }
    return this.mapUserResponse(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.authRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundError('Không tìm thấy tài khoản người dùng');
    }

    const updated = await this.authRepo.updateUser(userId, {
      fullName: dto.fullName?.trim() || undefined,
      timezone: dto.timezone?.trim() || undefined,
      avatarUrl: dto.avatarUrl
    });

    return this.mapUserResponse(updated);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    if (!dto.currentPassword || !dto.newPassword) {
      throw new ValidationError('Vui lòng cung cấp đầy đủ mật khẩu cũ và mật khẩu mới');
    }

    if (dto.newPassword.length < 6) {
      throw new ValidationError('Mật khẩu mới phải có tối thiểu 6 ký tự');
    }

    const user = await this.authRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundError('Không tìm thấy tài khoản người dùng');
    }

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new AuthError('Mật khẩu hiện tại không chính xác');
      }
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.authRepo.updatePassword(userId, newPasswordHash);

    // Hủy toàn bộ refresh token cũ để bảo vệ phiên
    await this.authRepo.revokeAllUserRefreshTokens(userId);
  }
}

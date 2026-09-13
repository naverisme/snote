import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, googleAuthSchema } from './auth.schemas';
import { env } from '../../config/env';
import { AuthError } from '../../shared/errors/appErrors';

const REFRESH_COOKIE_NAME = 'snote_refresh_token';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 ngày
};

export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const validated = registerSchema.parse(req.body);
    const { authResponse, refreshToken } = await this.authService.register(validated);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: authResponse
    });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const validated = loginSchema.parse(req.body);
    const { authResponse, refreshToken } = await this.authService.login(validated);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: authResponse
    });
  };

  googleLogin = async (req: Request, res: Response): Promise<void> => {
    const validated = googleAuthSchema.parse(req.body);
    const { authResponse, refreshToken } = await this.authService.loginWithGoogle(validated);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      message: 'Đăng nhập với Google thành công',
      data: authResponse
    });
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
    if (!rawRefreshToken) {
      throw new AuthError('Không tìm thấy Refresh Token');
    }

    const { authResponse, refreshToken: newRefreshToken } = await this.authService.refreshTokens(rawRefreshToken);

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      message: 'Làm mới phiên đăng nhập thành công',
      data: authResponse
    });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
    await this.authService.logout(rawRefreshToken, req.user?.id);

    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      message: 'Đăng xuất tài khoản thành công'
    });
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AuthError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
    }

    const user = await this.authService.getMe(userId);
    res.status(200).json({
      success: true,
      data: user
    });
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AuthError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
    }

    const updated = await this.authService.updateProfile(userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công',
      data: updated
    });
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AuthError('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn');
    }

    await this.authService.changePassword(userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại trên các thiết bị khác nếu cần.'
    });
  };
}

import nodemailer from 'nodemailer';

export interface PasswordResetMailer {
  send(to: string, token: string): Promise<void>;
  sendOtp(to: string, code: string): Promise<void>;
  sendResetOtp(to: string, code: string): Promise<void>;
}

export class SmtpPasswordResetMailer implements PasswordResetMailer {
  private readonly transport;
  constructor(
    host: string,
    port: number,
    private readonly from: string,
    private readonly publicBaseUrl: string,
    user?: string,
    password?: string,
  ) {
    if (!host || !from || !/^https?:\/\//.test(publicBaseUrl) || !Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('Invalid password reset email configuration');
    }
    this.transport = nodemailer.createTransport({
      host, port, secure: port === 465,
      auth: user && password ? { user, pass: password } : undefined,
    });
  }

  async send(to: string, token: string): Promise<void> {
    const base = this.publicBaseUrl.replace(/\/$/, '');
    const url = `${base}/#reset=${encodeURIComponent(token)}`;
    await this.transport.sendMail({
      from: this.from,
      to,
      subject: 'Đặt lại mật khẩu SNOTE',
      text: `Bạn đã yêu cầu đặt lại mật khẩu SNOTE. Mở liên kết sau trong 1 giờ:\n${url}\n\nNếu không yêu cầu, bạn có thể bỏ qua email này.`,
    });
  }

  async sendOtp(to: string, code: string): Promise<void> {
    await this.transport.sendMail({
      from: this.from,
      to,
      subject: 'Mã xác nhận đổi mật khẩu SNOTE',
      text: `Mã xác nhận đổi mật khẩu SNOTE của bạn là ${code}. Mã có hiệu lực trong 10 phút và chỉ dùng một lần. Nếu bạn không yêu cầu, hãy bỏ qua email này.`,
    });
  }

  async sendResetOtp(to: string, code: string): Promise<void> {
    await this.transport.sendMail({
      from: this.from,
      to,
      subject: 'Mã xác nhận đặt lại mật khẩu SNOTE',
      text: `Mã xác nhận đặt lại mật khẩu SNOTE của bạn là ${code}. Mã có hiệu lực trong 10 phút và chỉ dùng một lần. Nếu bạn không yêu cầu, hãy bỏ qua email này.`,
    });
  }
}

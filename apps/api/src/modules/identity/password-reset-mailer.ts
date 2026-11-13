import nodemailer from 'nodemailer';

export interface PasswordResetMailer {
  send(to: string, token: string): Promise<void>;
  sendOtp(to: string, code: string): Promise<void>;
  sendResetOtp(to: string, code: string): Promise<void>;
}

interface OtpEmailTemplateOptions {
  title: string;
  subtitle: string;
  code: string;
  actionText: string;
}

function renderOtpEmailHtml(options: OtpEmailTemplateOptions): string {
  const { title, subtitle, code, actionText } = options;
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <!-- Preheader preview text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-width: 0; opacity: 0;">
    Mã xác nhận SNOTE của bạn là ${code} (hiệu lực trong 10 phút).
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header with Brand Logo -->
          <tr>
            <td style="padding: 28px 36px 20px; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); border-radius: 9px; text-align: center; line-height: 36px; color: #ffffff; font-weight: 800; font-size: 19px;">S</div>
                        </td>
                        <td style="vertical-align: middle; padding-left: 10px;">
                          <div style="font-size: 19px; font-weight: 800; letter-spacing: 0.08em; color: #0f172a; line-height: 1;">SNOTE</div>
                          <div style="font-size: 11px; font-weight: 500; color: #64748b; letter-spacing: 0.02em; margin-top: 3px;">Hệ thống xác thực tài khoản</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-size: 11.5px; font-weight: 600; color: #4338ca; background-color: #eef2ff; border: 1px solid #e0e7ff; padding: 4px 10px; border-radius: 20px; display: inline-block;">Mã xác thực OTP</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 32px 36px 24px;">
              <h1 style="margin: 0 0 10px; font-size: 21px; font-weight: 750; color: #0f172a; line-height: 1.35;">
                ${title}
              </h1>
              <p style="margin: 0 0 20px; font-size: 14.5px; line-height: 1.6; color: #475569;">
                ${subtitle}
              </p>

              <!-- OTP Code Highlight Box -->
              <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 22px 16px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11.5px; font-weight: 650; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; margin-bottom: 10px;">
                  Mã xác nhận bảo mật
                </div>
                <div style="font-family: 'SF Mono', Consolas, Monaco, 'Courier New', monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #1e293b; line-height: 1.15; padding-left: 10px;">
                  ${code}
                </div>
                <div style="font-size: 13px; color: #64748b; margin-top: 12px; font-weight: 500;">
                  ⏱️ Có hiệu lực trong vòng <strong>10 phút</strong> (dùng 1 lần)
                </div>
              </div>

              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #475569;">
                ${actionText}
              </p>

              <!-- Security Warning Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin-top: 24px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <div style="font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 4px;">
                      ⚠️ Cảnh báo an toàn
                    </div>
                    <div style="font-size: 12.5px; line-height: 1.55; color: #b45309;">
                      Tuyệt đối không chia sẻ mã này với bất kỳ ai, kể cả quản trị viên SNOTE. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc đổi mật khẩu ngay để bảo vệ tài khoản của mình.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Professional Footer -->
          <tr>
            <td style="padding: 22px 36px 28px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; line-height: 1.5;">
                Email này được gửi tự động từ hệ thống SNOTE. Vui lòng không trả lời thư này.
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © 2026 SNOTE Platform • <a href="https://snote.online" style="color: #4f46e5; text-decoration: none; font-weight: 600;">snote.online</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
    const subject = 'Đặt lại mật khẩu tài khoản SNOTE';
    const text = `Bạn đã yêu cầu đặt lại mật khẩu SNOTE. Mở liên kết sau trong 1 giờ:\n${url}\n\nNếu không yêu cầu, bạn có thể bỏ qua email này.`;
    await this.transport.sendMail({
      from: this.from,
      to,
      subject,
      text,
    });
  }

  async sendOtp(to: string, code: string): Promise<void> {
    const subject = `[SNOTE] Mã xác thực đổi mật khẩu: ${code}`;
    const text = `Mã xác thực đổi mật khẩu SNOTE của bạn là: ${code}\n\nMã có hiệu lực trong vòng 10 phút và chỉ sử dụng một lần.\n\nLƯU Ý BẢO MẬT: Tuyệt đối không chia sẻ mã này với bất kỳ ai. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.\n\nTrân trọng,\nĐội ngũ SNOTE (https://snote.online)`;
    const html = renderOtpEmailHtml({
      title: 'Xác thực đổi mật khẩu tài khoản',
      subtitle: 'Chúng tôi nhận được yêu cầu đổi mật khẩu tài khoản SNOTE trong phần Cài đặt của bạn.',
      code,
      actionText: 'Hãy nhập mã 6 số này vào trang Cài đặt để xác nhận danh tính trước khi thiết lập mật khẩu mới.',
    });

    await this.transport.sendMail({
      from: this.from,
      to,
      subject,
      text,
      html,
    });
  }

  async sendResetOtp(to: string, code: string): Promise<void> {
    const subject = `[SNOTE] Mã xác thực đặt lại mật khẩu: ${code}`;
    const text = `Mã xác thực đặt lại mật khẩu SNOTE của bạn là: ${code}\n\nMã có hiệu lực trong vòng 10 phút và chỉ sử dụng một lần.\n\nLƯU Ý BẢO MẬT: Tuyệt đối không chia sẻ mã này với bất kỳ ai. Nếu bạn không thực hiện yêu cầu này, tài khoản của bạn vẫn an toàn và bạn có thể yên tâm bỏ qua email này.\n\nTrân trọng,\nĐội ngũ SNOTE (https://snote.online)`;
    const html = renderOtpEmailHtml({
      title: 'Đặt lại mật khẩu tài khoản',
      subtitle: 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản SNOTE gắn với email này.',
      code,
      actionText: 'Hãy nhập mã 6 số này vào màn hình Đặt lại mật khẩu để hoàn tất thiết lập mật khẩu mới.',
    });

    await this.transport.sendMail({
      from: this.from,
      to,
      subject,
      text,
      html,
    });
  }
}


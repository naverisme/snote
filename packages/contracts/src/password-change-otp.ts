/** Authenticated email-code password change; both requests require session and CSRF. */
export interface PasswordChangeOtpRequestResult {
  emailMasked: string;
  resendAfterSeconds: number;
  expiresInSeconds: number;
}

export interface ChangePasswordWithOtpInput {
  code: string;
  newPassword: string;
}

/** Authenticated email-code password change; both requests require session and CSRF. */
export interface PasswordChangeOtpRequestResult {
  emailMasked: string;
  resendAfterSeconds: number;
  expiresInSeconds: number;
}

export interface VerifyOtpInput {
  code: string;
}

export interface ChangePasswordWithOtpInput {
  code: string;
  newPassword: string;
}

/** Unauthenticated email-code password reset */
export interface PasswordResetOtpRequestInput {
  email: string;
}

export interface PasswordResetOtpRequestResult {
  emailMasked: string;
  resendAfterSeconds: number;
  expiresInSeconds: number;
}

export interface VerifyPasswordResetOtpInput {
  email: string;
  code: string;
}

export interface PasswordResetWithOtpInput {
  email: string;
  code: string;
  newPassword: string;
}

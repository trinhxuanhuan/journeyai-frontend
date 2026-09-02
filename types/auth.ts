export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface RegisterResponse {
  userId: string;
  status: string;
  otpExpiresAt: string;
  otpResendAvailableAt: string;
}

export interface VerifyOtpRequest {
  userId: string;
  otpCode: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
}

export interface ResendOtpResponse {
  otpExpiresAt: string;
  otpResendAvailableAt: string;
}

export interface AccountVerificationRequiredResponse extends ApiErrorResponse {
  error: "ACCOUNT_UNVERIFIED";
  userId: string;
  email: string;
  otpExpiresAt: string;
  otpResendAvailableAt: string;
}

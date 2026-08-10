export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface RegisterResponse {
  userId: string;
  status: string;
  otpExpiresAt: string;
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
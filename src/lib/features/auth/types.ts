export interface LoginCredentials {
  email: string;
  password: string;
  // Assuming 'user' object structure might be needed if strictly following backend login req structure,
  // but typically FE sends credentials and BE handles extraction.
  // The backend signature `login(@Request() req)` implies it uses a Guard (Passport Local) which expects username/password in body usually.
}

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
}

export interface ResetPasswordDto {
  code: string;
  newPassword: string;
}

export interface RecoveryPayload {
  email: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface RegisterResponse {
  user: User;
  access_token: string;
}

export interface MessageResponse {
  message: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user: User;
}

export interface User {
  userId: string;
  email: string;
  role: string;
  id?: string;
  isActive?: boolean;
  name?: string;
  username?: string;
  profileImage?: string;
}

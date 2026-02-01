import { HttpClient } from "../../shared/http-client";
import type { HttpResult } from "../../shared/types";
import type {
  LoginCredentials,
  RegisterDto,
  RecoveryPayload,
  ResetPasswordDto,
  LoginResponse,
  RegisterResponse,
  MessageResponse,
  VerifyTokenResponse,
} from "../types";

export class AuthService extends HttpClient {
  constructor() {
    super("auth");
  }

  async login(
    credentials: LoginCredentials,
  ): Promise<HttpResult<LoginResponse>> {
    return this.post("login", credentials);
  }

  async register(dto: RegisterDto): Promise<HttpResult<RegisterResponse>> {
    return this.post("register", dto);
  }

  async recovery(
    payload: RecoveryPayload,
  ): Promise<HttpResult<MessageResponse>> {
    return this.post("forgot-password", { email: payload.email });
  }

  async resetPassword(
    dto: ResetPasswordDto,
  ): Promise<HttpResult<MessageResponse>> {
    return this.post("reset-password", dto);
  }

  async verifyToken(token: string): Promise<HttpResult<VerifyTokenResponse>> {
    return this.post("verify-token", { token });
  }
}

export const authService = new AuthService();

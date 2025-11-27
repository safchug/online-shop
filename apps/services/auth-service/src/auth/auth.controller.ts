import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AuthService } from "./auth.service";
import {
  RegisterDto,
  LoginDto,
  ValidateTokenDto,
  RefreshTokenDto,
  ResetPasswordDto,
} from "./dto";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern("auth.register")
  async register(@Payload() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @MessagePattern("auth.login")
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @MessagePattern("auth.validate")
  async validateToken(@Payload() validateTokenDto: ValidateTokenDto) {
    return this.authService.validateToken(validateTokenDto.token);
  }

  @MessagePattern("auth.refresh")
  async refreshToken(@Payload() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @MessagePattern("auth.profile")
  async getUserProfile(@Payload() data: { userId: string }) {
    return this.authService.getUserProfile(data.userId);
  }

  @MessagePattern("auth.user.byId")
  async getUserById(@Payload() data: { userId: string }) {
    return this.authService.getUserById(data.userId);
  }

  @MessagePattern("auth.user.byEmail")
  async getUserByEmail(@Payload() data: { email: string }) {
    return this.authService.getUserByEmail(data.email);
  }

  @MessagePattern("auth.forgot-password")
  async forgotPassword(@Payload() data: { email: string }) {
    return this.authService.forgotPassword(data.email);
  }

  @MessagePattern("auth.reset-password")
  async resetPassword(@Payload() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @MessagePattern("auth.verify-email")
  async verifyEmail(@Payload() data: { token: string }) {
    return this.authService.verifyEmail(data.token);
  }

  @MessagePattern("auth.resend-verification")
  async resendVerificationEmail(@Payload() data: { email: string }) {
    return this.authService.resendVerificationEmail(data.email);
  }
}

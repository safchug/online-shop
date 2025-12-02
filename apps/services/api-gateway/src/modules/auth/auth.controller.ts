import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { firstValueFrom, timeout, retry } from "rxjs";
import { MICROSERVICES } from "../../config/microservices.config";
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ResendVerificationDto,
} from "./dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    @Inject(MICROSERVICES.AUTH_SERVICE)
    private readonly authService: ClientProxy
  ) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async register(@Body() registerDto: RegisterDto) {
    return await firstValueFrom(
      this.authService.send("auth.register", registerDto)
    );
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 200, description: "User successfully logged in" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async login(@Body() loginDto: LoginDto) {
    return await firstValueFrom(this.authService.send("auth.login", loginDto));
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return await firstValueFrom(
      this.authService.send("auth.refresh", refreshTokenDto)
    );
  }

  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify email address" })
  @ApiResponse({ status: 200, description: "Email verified successfully" })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return await firstValueFrom(
      this.authService.send("auth.verify-email", verifyEmailDto)
    );
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset" })
  @ApiResponse({ status: 200, description: "Password reset email sent" })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await firstValueFrom(
      this.authService.send("auth.forgot-password", forgotPasswordDto)
    );
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password" })
  @ApiResponse({ status: 200, description: "Password reset successfully" })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await firstValueFrom(
      this.authService.send("auth.reset-password", resetPasswordDto)
    );
  }

  @Post("resend-verification")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend email verification" })
  @ApiResponse({ status: 200, description: "Verification email sent" })
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto
  ) {
    return await firstValueFrom(
      this.authService.send("auth.resend-verification", resendVerificationDto)
    );
  }
}

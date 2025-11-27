import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { User, UserDocument } from "../entities/user.entity";
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UserResponseDto,
  TokenPayloadDto,
  RefreshTokenDto,
  ResetPasswordDto,
} from "./dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new RpcException({
        statusCode: 409,
        message: "User with this email already exists",
      });
    }

    // Generate email verification token
    const { token: verificationToken, hashedToken } =
      this.generateHashedToken();

    // Set token expiration for email verification
    const expirationTime = this.configService.get<string>(
      "EMAIL_VERIFICATION_TOKEN_EXPIRATION",
      "24h"
    );
    const expirationMs = this.parseTimeToMilliseconds(expirationTime);

    // Create new user
    const user = new this.userModel({
      email,
      password,
      firstName,
      lastName,
      role,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + expirationMs),
    });

    await user.save();

    // TODO: Send verification email with verificationToken
    if (this.configService.get("NODE_ENV") === "development") {
      console.log(
        `Email verification token for ${email}: ${verificationToken}`
      );
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Hash and save refresh token
    const salt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, salt);
    await user.save();

    return {
      user: this.formatUserResponse(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new RpcException({
        statusCode: 401,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      throw new RpcException({
        statusCode: 401,
        message: "Account is disabled",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: 401,
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Hash and save refresh token
    const salt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, salt);
    await user.save();

    return {
      user: this.formatUserResponse(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async validateToken(token: string): Promise<TokenPayloadDto> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });

      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      throw new RpcException({
        statusCode: 401,
        message: "Invalid token",
      });
    }
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto
  ): Promise<AuthResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });

      // Find user
      const user = await this.userModel.findById(payload.sub);
      if (!user) {
        throw new RpcException({
          statusCode: 401,
          message: "User not found",
        });
      }

      // Verify refresh token matches using bcrypt
      if (!user.refreshToken) {
        throw new RpcException({
          statusCode: 401,
          message: "Invalid refresh token",
        });
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshToken
      );

      if (!isRefreshTokenValid) {
        throw new RpcException({
          statusCode: 401,
          message: "Invalid refresh token",
        });
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Hash and update refresh token
      const salt = await bcrypt.genSalt(10);
      user.refreshToken = await bcrypt.hash(tokens.refreshToken, salt);
      await user.save();

      return {
        user: this.formatUserResponse(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        statusCode: 401,
        message: "Invalid refresh token",
      });
    }
  }

  async getUserProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new RpcException({
        statusCode: 404,
        message: "User not found",
      });
    }

    return this.formatUserResponse(user);
  }

  async getUserById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new RpcException({
        statusCode: 404,
        message: "User not found",
      });
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new RpcException({
        statusCode: 404,
        message: "User not found",
      });
    }
    return user;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });

    if (user) {
      // Generate token only if user exists
      const { token: resetToken, hashedToken } = this.generateHashedToken();

      // Set token and expiry
      const expirationTime = this.configService.get<string>(
        "PASSWORD_RESET_TOKEN_EXPIRATION",
        "1h"
      );
      const expirationMs = this.parseTimeToMilliseconds(expirationTime);

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = new Date(Date.now() + expirationMs);
      await user.save();

      // TODO: Send email with resetToken (not hashedToken)
      if (this.configService.get("NODE_ENV") === "development") {
        console.log(`Password reset token for ${email}: ${resetToken}`);
      }
    }

    // Always return the same response regardless of whether user exists
    return {
      message: "If the email exists, a password reset link has been sent",
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // Hash the provided token to compare with stored hash
    const hashedToken = this.hashToken(token);

    // Find user with valid reset token
    const user = await this.userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new RpcException({
        statusCode: 400,
        message: "Invalid or expired reset token",
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined; // Invalidate all refresh tokens
    await user.save();

    return { message: "Password reset successfully" };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    // Hash the provided token to compare with stored hash
    const hashedToken = this.hashToken(token);

    const user = await this.userModel.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new RpcException({
        statusCode: 400,
        message: "Invalid or expired verification token",
      });
    }

    if (user.isEmailVerified) {
      return { message: "Email already verified" };
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { message: "Email verified successfully" };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });

    if (user && !user.isEmailVerified) {
      // Generate token only if user exists and is not verified
      const { token: verificationToken, hashedToken } =
        this.generateHashedToken();

      // Set token expiration
      const expirationTime = this.configService.get<string>(
        "EMAIL_VERIFICATION_TOKEN_EXPIRATION",
        "24h"
      );
      const expirationMs = this.parseTimeToMilliseconds(expirationTime);

      // Atomically update only if email is still unverified
      await this.userModel.findOneAndUpdate(
        { email, isEmailVerified: false },
        {
          emailVerificationToken: hashedToken,
          emailVerificationExpires: new Date(Date.now() + expirationMs),
        },
        { new: true }
      );

      // TODO: Send email with verificationToken (not hashedToken)
      if (this.configService.get("NODE_ENV") === "development") {
        console.log(
          `Email verification token for ${email}: ${verificationToken}`
        );
      }
    }

    // Always return the same response regardless of whether user exists or is already verified
    return {
      message: "If the email exists, a verification link has been sent",
    };
  }

  private async generateTokens(
    user: UserDocument
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: TokenPayloadDto = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: payload.userId,
          email: payload.email,
          role: payload.role,
          jti: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`, // Unique token ID
        },
        {
          secret: this.configService.get<string>("JWT_SECRET"),
          expiresIn: this.configService.get<string>("JWT_EXPIRATION"),
        }
      ),
      this.jwtService.signAsync(
        {
          sub: payload.userId,
          jti: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`, // Unique token ID
        },
        {
          secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
          expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRATION"),
        }
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private formatUserResponse(user: UserDocument): UserResponseDto {
    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private generateHashedToken(): { token: string; hashedToken: string } {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = this.hashToken(token);

    return { token, hashedToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Parse time string to milliseconds
   * Supports formats like: 1h, 30m, 7d, 1w
   * @param timeString - Time string to parse (e.g., "1h", "30m", "7d")
   * @returns Time in milliseconds
   */
  private parseTimeToMilliseconds(timeString: string): number {
    const units: Record<string, number> = {
      ms: 1,
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
    };

    const match = timeString.match(/^(\d+)([a-zA-Z]+)$/);
    if (!match) {
      throw new Error(
        "Invalid time format. Expected format: [number][unit] (e.g., 1h, 30m, 7d)"
      );
    }

    const [, valueStr, unit] = match;
    const value = parseInt(valueStr, 10);
    const multiplier = units[unit.toLowerCase()];

    if (!multiplier) {
      throw new Error(
        "Unsupported time unit. Supported units: ms, s, m, h, d, w"
      );
    }

    const result = value * multiplier;

    // Limit: 10 years in ms, or Number.MAX_SAFE_INTEGER, whichever is lower
    const MAX_MILLISECONDS = Math.min(
      Number.MAX_SAFE_INTEGER,
      10 * 365 * 24 * 60 * 60 * 1000
    );
    if (result > MAX_MILLISECONDS) {
      throw new Error("Time value too large: exceeds maximum allowed");
    }

    return result;
  }
}

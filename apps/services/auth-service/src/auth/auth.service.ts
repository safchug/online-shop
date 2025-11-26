import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { User, UserDocument } from "../entities/user.entity";
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UserResponseDto,
  TokenPayloadDto,
  RefreshTokenDto,
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

    // Create new user
    const user = new this.userModel({
      email,
      password,
      firstName,
      lastName,
      role,
    });

    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
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

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
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

      // Verify refresh token matches
      if (user.refreshToken !== refreshToken) {
        throw new RpcException({
          statusCode: 401,
          message: "Invalid refresh token",
        });
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update refresh token
      user.refreshToken = tokens.refreshToken;
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
          jti: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique token ID
        },
        {
          secret: this.configService.get<string>("JWT_SECRET"),
          expiresIn: this.configService.get<string>("JWT_EXPIRATION"),
        }
      ),
      this.jwtService.signAsync(
        {
          sub: payload.userId,
          jti: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique token ID
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
}

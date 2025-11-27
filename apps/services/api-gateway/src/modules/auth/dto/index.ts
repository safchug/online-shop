import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "Password123!" })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "Password123!" })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: "John" })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: "Doe" })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "Refresh token",
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    example: "a1b2c3d4e5f6...",
    description: "Email verification token (64-character hexadecimal string)",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-f0-9]{64}$/i, {
    message: "Token must be a 64-character hexadecimal string",
  })
  token: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: "a1b2c3d4e5f6...",
    description: "Password reset token (64-character hexadecimal string)",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-f0-9]{64}$/i, {
    message: "Token must be a 64-character hexadecimal string",
  })
  token: string;

  @ApiProperty({
    example: "NewPassword123!",
    description: "New password (minimum 8 characters)",
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @IsNotEmpty()
  newPassword: string;
}

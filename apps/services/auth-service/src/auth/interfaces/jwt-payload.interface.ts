export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface UserPayload {
  userId: string;
  email: string;
  role: string;
}

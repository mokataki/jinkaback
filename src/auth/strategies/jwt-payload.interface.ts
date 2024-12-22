// src/auth/interfaces/jwt-payload.interface.ts

export interface JwtPayload {
    email: string;
    sub: number; // sub is the user id
    role: string;
}

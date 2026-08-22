import { decodeAccessToken, isTokenExpired } from "./jwt";
import type { AuthTokenResponse } from "../types/auth";

export interface AuthUser {
  id: string;
  role: string;
}

export class InvalidAuthSessionError extends Error {
  constructor(message = "Phien dang nhap khong hop le") {
    super(message);
    this.name = "InvalidAuthSessionError";
  }
}

export function getAuthenticatedUser(
  tokens: unknown,
  nowMilliseconds = Date.now()
): AuthUser {
  if (!tokens || typeof tokens !== "object") {
    throw new InvalidAuthSessionError();
  }

  const candidate = tokens as Partial<AuthTokenResponse>;
  if (
    typeof candidate.accessToken !== "string" ||
    candidate.accessToken.trim() === "" ||
    typeof candidate.refreshToken !== "string" ||
    candidate.refreshToken.trim() === "" ||
    typeof candidate.expiresIn !== "number" ||
    !Number.isFinite(candidate.expiresIn) ||
    candidate.expiresIn <= 0
  ) {
    throw new InvalidAuthSessionError();
  }

  const claims = decodeAccessToken(candidate.accessToken);
  if (!claims || isTokenExpired(claims, 10, nowMilliseconds)) {
    throw new InvalidAuthSessionError();
  }

  return { id: claims.sub, role: claims.role };
}

export function getUserFromUsableAccessToken(
  accessToken: string,
  nowMilliseconds = Date.now()
): AuthUser | null {
  const claims = decodeAccessToken(accessToken);
  if (!claims || isTokenExpired(claims, 10, nowMilliseconds)) return null;
  return { id: claims.sub, role: claims.role };
}

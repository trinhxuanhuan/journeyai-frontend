export interface AccessTokenClaims {
  sub: string;
  role: string;
  exp: number;
  iat?: number;
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeAccessToken(token: string): AccessTokenClaims | null {
  try {
    const segments = token.split(".");
    if (segments.length !== 3) return null;

    const payload = segments[1];
    if (!payload) return null;

    const claims: unknown = JSON.parse(decodeBase64Url(payload));
    if (!claims || typeof claims !== "object") return null;

    const candidate = claims as Record<string, unknown>;
    if (
      typeof candidate.sub !== "string" ||
      candidate.sub.trim() === "" ||
      typeof candidate.role !== "string" ||
      candidate.role.trim() === "" ||
      typeof candidate.exp !== "number" ||
      !Number.isFinite(candidate.exp) ||
      candidate.exp <= 0 ||
      (candidate.iat !== undefined &&
        (typeof candidate.iat !== "number" || !Number.isFinite(candidate.iat)))
    ) {
      return null;
    }

    return {
      sub: candidate.sub,
      role: candidate.role,
      exp: candidate.exp,
      ...(typeof candidate.iat === "number" ? { iat: candidate.iat } : {}),
    };
  } catch {
    return null;
  }
}

export function isTokenExpired(
  claims: AccessTokenClaims,
  skewSeconds = 10,
  nowMilliseconds = Date.now()
): boolean {
  const nowSeconds = nowMilliseconds / 1000;
  return claims.exp <= nowSeconds + skewSeconds;
}

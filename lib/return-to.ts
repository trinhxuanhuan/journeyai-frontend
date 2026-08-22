const DEFAULT_RETURN_TO = "/";
const AUTH_PATH = "/dang-nhap";
const INTERNAL_ORIGIN = "https://journeyai.invalid";
const UNSAFE_URL_CHARACTER = /[\\\u0000-\u001f\u007f]/;

export function sanitizeReturnTo(
  raw: string | null | undefined,
  fallback = DEFAULT_RETURN_TO
): string {
  if (
    !raw ||
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    UNSAFE_URL_CHARACTER.test(raw)
  ) {
    return fallback;
  }

  try {
    const url = new URL(raw, INTERNAL_ORIGIN);
    const targetsAuthPage =
      url.pathname === AUTH_PATH || url.pathname.startsWith(`${AUTH_PATH}/`);
    if (url.origin !== INTERNAL_ORIGIN || targetsAuthPage) {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function createLoginHref(currentLocation: string): string {
  const returnTo = sanitizeReturnTo(currentLocation);
  return `${AUTH_PATH}?returnTo=${encodeURIComponent(returnTo)}`;
}

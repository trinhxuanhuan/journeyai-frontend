export const SITE_NAME = "Việt Khám Phá";

export const SITE_DESCRIPTION =
  "Đặt tour Việt Nam hoặc tự xây lịch trình theo ngân sách và sở thích cùng Việt Khám Phá.";

const LOCAL_SITE_URL = "http://localhost:3000";

export function resolveSiteUrl(rawUrl = process.env.NEXT_PUBLIC_SITE_URL): URL {
  const candidate = rawUrl?.trim();

  if (!candidate) {
    return new URL(LOCAL_SITE_URL);
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return new URL(LOCAL_SITE_URL);
    }

    return new URL(parsed.origin);
  } catch {
    return new URL(LOCAL_SITE_URL);
  }
}

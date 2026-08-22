// lib/auth-events.ts
const AUTH_LOGOUT_EVENT = "journeyai:auth-logout";

export function emitAuthLogout(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}

export function onAuthLogout(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_LOGOUT_EVENT, handler);
  return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handler);
}
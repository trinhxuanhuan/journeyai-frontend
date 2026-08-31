const NOTIFICATION_COUNT_EVENT = "viet-kham-pha:notification-count";

export function emitNotificationCount(unreadCount: number): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<number>(NOTIFICATION_COUNT_EVENT, {
      detail: Math.max(0, Math.floor(unreadCount)),
    })
  );
}

export function onNotificationCount(
  listener: (unreadCount: number) => void
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: Event) => {
    const unreadCount = (event as CustomEvent<number>).detail;
    if (Number.isFinite(unreadCount)) listener(Math.max(0, unreadCount));
  };
  window.addEventListener(NOTIFICATION_COUNT_EVENT, handler);
  return () => window.removeEventListener(NOTIFICATION_COUNT_EVENT, handler);
}

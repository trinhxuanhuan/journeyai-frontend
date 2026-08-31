"use client";

import {
  Bell,
  CalendarClock,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CreditCard,
  Loader2,
  Mail,
  MapPinned,
  RefreshCw,
  Settings2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { emitNotificationCount } from "@/lib/notification-events";
import {
  formatNotificationTime,
  getNotificationPreference,
  getNotificationRequestErrorMessage,
  getNotifications,
  getSafeNotificationActionHref,
  isCanceledNotificationRequest,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATION_FILTERS,
  type NotificationCategory,
  type NotificationFilter,
  type NotificationItem,
  type NotificationPage,
  updateNotificationPreference,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

const FILTER_LABELS: Record<NotificationFilter, string> = {
  ALL: "Tất cả",
  UNREAD: "Chưa đọc",
  READ: "Đã đọc",
};

const CATEGORY_META: Record<
  NotificationCategory,
  { label: string; className: string; icon: typeof Bell }
> = {
  BOOKING: {
    label: "Đặt tour",
    className: "bg-sky-50 text-primary ring-sky-100",
    icon: MapPinned,
  },
  PAYMENT: {
    label: "Thanh toán",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    icon: CreditCard,
  },
  DEPARTURE: {
    label: "Khởi hành",
    className: "bg-amber-50 text-amber-700 ring-amber-100",
    icon: CalendarClock,
  },
  SYSTEM: {
    label: "Hệ thống",
    className: "bg-violet-50 text-violet-700 ring-violet-100",
    icon: Bell,
  },
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: NotificationPage };

type PreferenceState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; emailEnabled: boolean };

export function NotificationCenter() {
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationFilter>("ALL");
  const [page, setPage] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [preference, setPreference] = useState<PreferenceState>({ status: "loading" });
  const [busyNotificationId, setBusyNotificationId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    getNotifications(filter, page, 10, controller.signal)
      .then((data) => {
        setState({ status: "success", data });
        emitNotificationCount(data.unreadCount);
      })
      .catch((error) => {
        if (!isCanceledNotificationRequest(error)) {
          setState({
            status: "error",
            message: getNotificationRequestErrorMessage(error),
          });
        }
      });

    return () => controller.abort();
  }, [filter, page, reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    getNotificationPreference(controller.signal)
      .then((result) => {
        setPreference({ status: "success", emailEnabled: result.emailEnabled });
      })
      .catch((error) => {
        if (!isCanceledNotificationRequest(error)) setPreference({ status: "error" });
      });
    return () => controller.abort();
  }, []);

  const data = state.status === "success" ? state.data : null;
  const pageLabel = useMemo(() => {
    if (!data || data.totalPages === 0) return "Trang 1 / 1";
    return `Trang ${data.page + 1} / ${data.totalPages}`;
  }, [data]);

  const selectFilter = (nextFilter: NotificationFilter) => {
    if (nextFilter === filter) return;
    setState({ status: "loading" });
    setFilter(nextFilter);
    setPage(0);
  };

  const reloadNotifications = () => {
    setState({ status: "loading" });
    setReloadKey((value) => value + 1);
  };

  const openNotification = async (notification: NotificationItem) => {
    if (busyNotificationId) return;
    const actionHref = getSafeNotificationActionHref(notification.actionUrl);

    if (!notification.read) {
      setBusyNotificationId(notification.id);
      try {
        await markNotificationRead(notification.id);
        const nextUnreadCount = Math.max(0, (data?.unreadCount ?? 1) - 1);
        emitNotificationCount(nextUnreadCount);
        if (filter === "UNREAD" && !actionHref) {
          reloadNotifications();
        } else {
          setState((current) => {
            if (current.status !== "success") return current;
            return {
              status: "success",
              data: {
                ...current.data,
                unreadCount: nextUnreadCount,
                content: current.data.content.map((item) =>
                  item.id === notification.id
                    ? { ...item, read: true, readAt: new Date().toISOString() }
                    : item
                ),
              },
            };
          });
        }
      } catch (error) {
        toast.error(getNotificationRequestErrorMessage(error));
      } finally {
        setBusyNotificationId(null);
      }
    }

    if (actionHref) router.push(actionHref);
  };

  const markAllRead = async () => {
    if (markingAll || !data?.unreadCount) return;
    setMarkingAll(true);
    try {
      const updatedCount = await markAllNotificationsRead();
      emitNotificationCount(0);
      toast.success(
        updatedCount > 0
          ? `Đã đánh dấu ${updatedCount} thông báo là đã đọc.`
          : "Bạn không còn thông báo chưa đọc."
      );
      setPage(0);
      reloadNotifications();
    } catch (error) {
      toast.error(getNotificationRequestErrorMessage(error));
    } finally {
      setMarkingAll(false);
    }
  };

  const toggleEmailPreference = async () => {
    if (preference.status !== "success" || savingPreference) return;
    const nextValue = !preference.emailEnabled;
    setSavingPreference(true);
    try {
      const updated = await updateNotificationPreference(nextValue);
      setPreference({ status: "success", emailEnabled: updated.emailEnabled });
      toast.success(
        updated.emailEnabled
          ? "Đã bật thông báo email cho các mốc quan trọng."
          : "Đã tắt thông báo email. Thông báo trong ứng dụng vẫn hoạt động."
      );
    } catch (error) {
      toast.error(getNotificationRequestErrorMessage(error));
    } finally {
      setSavingPreference(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[linear-gradient(180deg,#f0f8ff_0%,#f7fafc_15rem,#f7fafc_100%)] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-primary uppercase">
              Đồng hành cùng chuyến đi
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Trung tâm thông báo
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Theo dõi giữ chỗ, thanh toán, hoàn tiền và những nhắc nhở trước ngày khởi hành.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={markAllRead}
            disabled={markingAll || !data?.unreadCount}
            className="h-11 rounded-xl border-slate-200 bg-white px-4 text-slate-700 shadow-sm"
          >
            {markingAll ? (
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Đánh dấu tất cả đã đọc
          </Button>
        </div>

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex w-full gap-1 rounded-2xl bg-slate-100 p-1 sm:w-auto" role="tablist" aria-label="Lọc thông báo">
              {NOTIFICATION_FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={filter === item}
                  onClick={() => selectFilter(item)}
                  className={cn(
                    "min-w-0 flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:flex-none",
                    filter === item
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {FILTER_LABELS[item]}
                  {item === "UNREAD" && data && data.unreadCount > 0 && (
                    <span className="ml-2 rounded-full bg-[#e84f35] px-2 py-0.5 text-[0.68rem] text-white">
                      {data.unreadCount > 99 ? "99+" : data.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {data && (
              <p className="px-1 text-xs font-semibold text-slate-500" aria-live="polite">
                {data.totalElements} thông báo
              </p>
            )}
          </div>

          {state.status === "loading" && <NotificationSkeleton />}

          {state.status === "error" && (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <CircleAlert className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-xl font-bold text-slate-950">Chưa thể tải thông báo</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{state.message}</p>
              <Button
                type="button"
                onClick={reloadNotifications}
                className="mt-6 h-11 rounded-xl px-5"
              >
                <RefreshCw className="h-4 w-4" /> Thử tải lại
              </Button>
            </div>
          )}

          {state.status === "success" && state.data.content.length === 0 && (
            <NotificationEmpty filter={filter} />
          )}

          {state.status === "success" && state.data.content.length > 0 && (
            <div className="divide-y divide-slate-100">
              {state.data.content.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  busy={busyNotificationId === notification.id}
                  onOpen={() => void openNotification(notification)}
                />
              ))}
            </div>
          )}

          {data && data.totalPages > 1 && (
            <nav className="flex items-center justify-between border-t border-slate-200 px-4 py-4 sm:px-6" aria-label="Phân trang thông báo">
              <Button
                type="button"
                variant="outline"
                disabled={data.page <= 0}
                onClick={() => {
                  setState({ status: "loading" });
                  setPage((value) => Math.max(0, value - 1));
                }}
                className="h-10 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" /> Trang trước
              </Button>
              <span className="text-xs font-semibold text-slate-500">{pageLabel}</span>
              <Button
                type="button"
                variant="outline"
                disabled={data.page + 1 >= data.totalPages}
                onClick={() => {
                  setState({ status: "loading" });
                  setPage((value) => value + 1);
                }}
                className="h-10 rounded-xl"
              >
                Trang sau <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          )}
        </section>

        <section className="mt-6 flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-primary">
              <Settings2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-950">Thông báo qua email</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Nhận email ở các mốc quan trọng như xác nhận thanh toán, hủy tour, hoàn tiền và nhắc khởi hành. Thông báo trong ứng dụng luôn được giữ lại.
              </p>
            </div>
          </div>

          {preference.status === "loading" && (
            <span className="flex h-10 items-center gap-2 text-sm text-slate-400" role="status">
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> Đang tải
            </span>
          )}
          {preference.status === "error" && (
            <span className="text-sm font-semibold text-red-600">Chưa thể đọc cài đặt</span>
          )}
          {preference.status === "success" && (
            <button
              type="button"
              role="switch"
              aria-checked={preference.emailEnabled}
              aria-label="Bật hoặc tắt thông báo qua email"
              disabled={savingPreference}
              onClick={() => void toggleEmailPreference()}
              className={cn(
                "relative h-8 w-14 shrink-0 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-60",
                preference.emailEnabled ? "bg-primary" : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary shadow-sm transition-transform",
                  preference.emailEnabled ? "translate-x-7" : "translate-x-1"
                )}
              >
                {savingPreference ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
                ) : preference.emailEnabled ? (
                  <Check className="h-3.5 w-3.5" />
                ) : null}
              </span>
            </button>
          )}
        </section>
      </div>
    </main>
  );
}

function NotificationRow({
  notification,
  busy,
  onOpen,
}: {
  notification: NotificationItem;
  busy: boolean;
  onOpen: () => void;
}) {
  const meta = CATEGORY_META[notification.category];
  const Icon = meta.icon;
  const actionHref = getSafeNotificationActionHref(notification.actionUrl);

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={busy}
      className={cn(
        "group flex w-full gap-4 px-4 py-5 text-left transition focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-primary sm:px-6",
        notification.read ? "bg-white hover:bg-slate-50" : "bg-sky-50/55 hover:bg-sky-50"
      )}
      aria-label={`${notification.title}${notification.read ? "" : ", chưa đọc"}${actionHref ? ", mở chi tiết" : ""}`}
    >
      <span className={cn("mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1", meta.className)}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <strong className={cn("text-[0.95rem] text-slate-950", notification.read ? "font-semibold" : "font-bold")}>
            {notification.title}
          </strong>
          {!notification.read && <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />}
        </span>
        <span className="mt-1.5 block text-sm leading-6 text-slate-600">{notification.message}</span>
        <span className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400">
          <span className="text-slate-500">{meta.label}</span>
          <span aria-hidden="true">•</span>
          <time dateTime={notification.createdAt}>{formatNotificationTime(notification.createdAt)}</time>
        </span>
      </span>

      <span className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center text-slate-300 transition group-hover:text-primary">
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
        ) : actionHref ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <Mail className="h-4 w-4" />
        )}
      </span>
    </button>
  );
}

function NotificationEmpty({ filter }: { filter: NotificationFilter }) {
  const copy = filter === "UNREAD"
    ? {
        title: "Bạn đã xem hết thông báo",
        message: "Không còn cập nhật nào đang chờ bạn đọc.",
      }
    : filter === "READ"
      ? {
          title: "Chưa có thông báo đã đọc",
          message: "Những cập nhật bạn đã xem sẽ xuất hiện tại đây.",
        }
      : {
          title: "Chưa có thông báo nào",
          message: "Khi booking hoặc hành trình thay đổi, Việt Khám Phá sẽ báo cho bạn tại đây.",
        };

  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-primary">
        <Bell className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-xl font-bold text-slate-950">{copy.title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{copy.message}</p>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="divide-y divide-slate-100" role="status" aria-label="Đang tải thông báo">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="flex gap-4 px-4 py-5 sm:px-6">
          <span className="h-11 w-11 animate-pulse rounded-2xl bg-slate-100 motion-reduce:animate-none" />
          <span className="flex-1 space-y-3">
            <span className="block h-4 w-2/5 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
            <span className="block h-3 w-4/5 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
            <span className="block h-3 w-1/4 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
          </span>
        </div>
      ))}
      <span className="sr-only">Đang tải...</span>
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  Check,
  CircleAlert,
  Compass,
  ImageIcon,
  Loader2,
  Mail,
  MapPinned,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { AccountAvatar } from "@/components/account/account-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccount } from "@/context/account-context";
import {
  ACCOUNT_PREFERENCE_OPTIONS,
  getAccountRequestErrorMessage,
  type AccountIdentity,
  type AccountProfile,
} from "@/lib/account";
import {
  accountIdentityFormSchema,
  accountProfileFormSchema,
  type AccountIdentityFormValues,
  type AccountProfileFormValues,
} from "@/lib/validations/account";
import { cn } from "@/lib/utils";

const quickLinks = [
  {
    href: "/bookings",
    label: "Đơn đặt tour",
    description: "Theo dõi giữ chỗ và thanh toán",
    icon: MapPinned,
  },
  {
    href: "/hanh-trinh",
    label: "Hành trình AI",
    description: "Xem các lịch trình đã lưu",
    icon: Sparkles,
  },
  {
    href: "/thong-bao",
    label: "Thông báo",
    description: "Không bỏ lỡ mốc quan trọng",
    icon: Bell,
  },
] as const;

export function AccountCenter() {
  const { state, reload } = useAccount();

  if (state.status === "idle" || state.status === "loading") {
    return <AccountCenterSkeleton />;
  }

  if (state.status === "error") {
    return (
      <main className="min-h-[calc(100vh-4.5rem)] bg-[#f6f9fc] px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center rounded-3xl border border-red-100 bg-white px-6 py-14 text-center shadow-[0_18px_56px_rgba(15,73,110,0.08)]">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <CircleAlert className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Chưa thể tải hồ sơ của bạn
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">{state.message}</p>
          <Button type="button" onClick={reload} className="mt-6 h-11 rounded-xl px-5">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Thử tải lại
          </Button>
        </div>
      </main>
    );
  }

  const { identity, profile } = state.data;

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[linear-gradient(180deg,#eaf6ff_0%,#f6f9fc_22rem,#f6f9fc_100%)] pb-20">
      <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8 sm:pt-10">
        <AccountHero identity={identity} profile={profile} />

        <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Lối tắt tài khoản">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_10px_30px_rgba(15,73,110,0.05)] transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_16px_38px_rgba(15,73,110,0.09)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary motion-reduce:hover:translate-y-0"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-primary transition group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <strong className="block text-sm text-slate-950">{item.label}</strong>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">{item.description}</span>
                </span>
              </Link>
            );
          })}
        </section>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[0.88fr_1.45fr]">
          <IdentityForm identity={identity} />
          <ProfileForm profile={profile} identity={identity} />
        </div>

        <section className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_36px_rgba(15,73,110,0.05)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-bold text-slate-950">Tài khoản được bảo vệ</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Phiên đăng nhập của bạn được xác thực trước mỗi thao tác cập nhật hồ sơ. Hãy đăng xuất sau khi sử dụng thiết bị dùng chung.
              </p>
            </div>
          </div>
          <Link
            href="/thong-bao"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-primary hover:text-primary"
          >
            Xem thông báo
          </Link>
        </section>
      </div>
    </main>
  );
}

function AccountHero({ identity, profile }: { identity: AccountIdentity; profile: AccountProfile }) {
  return (
    <section className="relative min-h-64 overflow-hidden rounded-[2rem] bg-[#07375c] shadow-[0_22px_64px_rgba(7,55,92,0.2)]">
      <Image
        src="/images/auth-vietnam-journey-v1.webp"
        alt=""
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1152px"
        className="object-cover object-center opacity-55"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,25,43,0.96)_0%,rgba(3,37,62,0.82)_50%,rgba(3,37,62,0.28)_100%)]" />

      <div className="relative flex min-h-64 flex-col justify-between gap-8 p-6 sm:p-8 lg:flex-row lg:items-end">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
          <AccountAvatar
            fullName={identity.fullName}
            email={identity.email}
            avatarUrl={profile.avatarUrl}
            className="h-20 w-20 text-xl shadow-[0_14px_36px_rgba(3,20,34,0.3)] sm:h-24 sm:w-24 sm:text-2xl"
          />
          <div className="min-w-0 text-white">
            <p className="text-xs font-bold tracking-[0.2em] text-sky-200 uppercase">Hồ sơ thành viên</p>
            <h1 className="mt-2 truncate text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              {identity.fullName}
            </h1>
            <p className="mt-2 flex items-center gap-2 truncate text-sm text-slate-200">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              {identity.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <HeroFact
            icon={BadgeCheck}
            label="Trạng thái"
            value={identity.status === "ACTIVE" ? "Đã xác thực" : identity.status}
          />
          <HeroFact
            icon={CalendarDays}
            label="Đồng hành từ"
            value={formatMemberDate(identity.createdAt)}
          />
          <HeroFact
            icon={Compass}
            label="Sở thích"
            value={`${profile.preferenceTags.length} chủ đề`}
          />
        </div>
      </div>
    </section>
  );
}

function HeroFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BadgeCheck;
  label: string;
  value: string;
}) {
  return (
    <span className="min-w-28 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-white backdrop-blur-md">
      <span className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-sky-100">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
      </span>
      <strong className="mt-1.5 block text-xs">{value}</strong>
    </span>
  );
}

function IdentityForm({ identity }: { identity: AccountIdentity }) {
  const { saveIdentity } = useAccount();
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AccountIdentityFormValues>({
    resolver: zodResolver(accountIdentityFormSchema),
    defaultValues: { fullName: identity.fullName },
  });

  useEffect(() => {
    reset({ fullName: identity.fullName });
  }, [identity.fullName, reset]);

  const onSubmit = async (values: AccountIdentityFormValues) => {
    setSaving(true);
    try {
      const updated = await saveIdentity(values);
      reset({ fullName: updated.fullName });
      toast.success("Đã cập nhật họ tên của bạn.");
    } catch (error) {
      toast.error(getAccountRequestErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_36px_rgba(15,73,110,0.05)] sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-primary">
          <UserRound className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-950">Thông tin danh tính</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Tên hiển thị trong tài khoản và các đơn đặt tour.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="account-full-name" className="font-semibold text-slate-700">Họ và tên</Label>
          <Input
            id="account-full-name"
            autoComplete="name"
            disabled={saving}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "account-full-name-error" : undefined}
            className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus-visible:bg-white"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p id="account-full-name-error" className="text-sm text-red-600" role="alert">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="account-email" className="font-semibold text-slate-700">Thư điện tử</Label>
          <Input
            id="account-email"
            type="email"
            value={identity.email}
            readOnly
            disabled
            className="h-12 rounded-xl border-slate-200 bg-slate-100 px-4 text-slate-500"
          />
          <p className="text-xs leading-5 text-slate-400">Địa chỉ thư điện tử là định danh đăng nhập và hiện chỉ có thể xem.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Check className="h-4 w-4" aria-hidden="true" />
          <span className="font-semibold">Tài khoản {formatRole(identity.role)}</span>
        </div>

        <Button
          type="submit"
          disabled={saving || !isDirty}
          className="h-11 w-full rounded-xl font-bold"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <Save className="h-4 w-4" />}
          {saving ? "Đang lưu..." : "Lưu tên hiển thị"}
        </Button>
      </form>
    </section>
  );
}

function ProfileForm({ profile, identity }: { profile: AccountProfile; identity: AccountIdentity }) {
  const { saveProfile } = useAccount();
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AccountProfileFormValues>({
    resolver: zodResolver(accountProfileFormSchema),
    defaultValues: profileFormDefaults(profile),
  });

  useEffect(() => {
    reset(profileFormDefaults(profile));
  }, [profile, reset]);

  const selectedCodes = useWatch({ control, name: "preferenceCodes" }) ?? [];
  const avatarUrl = useWatch({ control, name: "avatarUrl" }) ?? "";
  const displayedPreferences = useMemo(() => {
    const knownCodes = new Set(ACCOUNT_PREFERENCE_OPTIONS.map((item) => item.code as string));
    const custom = profile.preferenceTags
      .filter((item) => !knownCodes.has(item.tagCode))
      .map((item) => ({ code: item.tagCode, label: formatPreferenceCode(item.tagCode) }));
    return [...ACCOUNT_PREFERENCE_OPTIONS, ...custom];
  }, [profile.preferenceTags]);

  const togglePreference = (code: string) => {
    const isSelected = selectedCodes.includes(code);
    if (!isSelected && selectedCodes.length >= 12) {
      toast.info("Bạn chỉ được chọn tối đa 12 sở thích.");
      return;
    }
    setValue(
      "preferenceCodes",
      isSelected ? selectedCodes.filter((item) => item !== code) : [...selectedCodes, code],
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const onSubmit = async (values: AccountProfileFormValues) => {
    const currentWeights = new Map(profile.preferenceTags.map((item) => [item.tagCode, item.weight]));
    setSaving(true);
    try {
      const updated = await saveProfile({
        phone: values.phone,
        avatarUrl: values.avatarUrl,
        preferenceTags: values.preferenceCodes.map((tagCode) => ({
          tagCode,
          weight: currentWeights.get(tagCode) ?? 1,
        })),
      });
      reset(profileFormDefaults(updated));
      toast.success("Đã cập nhật hồ sơ du lịch.");
    } catch (error) {
      toast.error(getAccountRequestErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_36px_rgba(15,73,110,0.05)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#d9472e]">
            <Compass className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Hồ sơ du lịch</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">Thông tin liên hệ, ảnh đại diện và gu khám phá Việt Nam.</p>
          </div>
        </div>
        <AccountAvatar
          fullName={identity.fullName}
          email={identity.email}
          avatarUrl={avatarUrl}
          className="h-12 w-12 text-sm shadow-sm"
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="account-phone" className="font-semibold text-slate-700">
              <Phone className="h-4 w-4 text-slate-400" aria-hidden="true" /> Số điện thoại
            </Label>
            <Input
              id="account-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="0912345678"
              disabled={saving}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "account-phone-error" : undefined}
              className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus-visible:bg-white"
              {...register("phone")}
            />
            {errors.phone && <p id="account-phone-error" className="text-sm text-red-600" role="alert">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-avatar" className="font-semibold text-slate-700">
              <ImageIcon className="h-4 w-4 text-slate-400" aria-hidden="true" /> URL ảnh đại diện
            </Label>
            <Input
              id="account-avatar"
              type="url"
              inputMode="url"
              placeholder="https://..."
              disabled={saving}
              aria-invalid={Boolean(errors.avatarUrl)}
              aria-describedby={errors.avatarUrl ? "account-avatar-error" : "account-avatar-hint"}
              className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus-visible:bg-white"
              {...register("avatarUrl")}
            />
            {errors.avatarUrl ? (
              <p id="account-avatar-error" className="text-sm text-red-600" role="alert">{errors.avatarUrl.message}</p>
            ) : (
              <p id="account-avatar-hint" className="text-xs leading-5 text-slate-400">Để trống nếu bạn muốn dùng chữ cái đại diện.</p>
            )}
          </div>
        </div>

        <fieldset>
          <legend className="font-semibold text-slate-700">Bạn yêu thích điều gì ở Việt Nam?</legend>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Sở thích được lưu trong hồ sơ; khi lập lịch AI, bạn vẫn chủ động chọn nhu cầu riêng cho từng chuyến.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {displayedPreferences.map((preference) => {
              const selected = selectedCodes.includes(preference.code);
              return (
                <button
                  key={preference.code}
                  type="button"
                  aria-pressed={selected}
                  disabled={saving}
                  onClick={() => togglePreference(preference.code)}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60",
                    selected
                      ? "border-primary bg-sky-50 text-primary shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50/60"
                  )}
                >
                  <span className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border",
                    selected ? "border-primary bg-primary text-white" : "border-slate-300"
                  )}>
                    {selected && <Check className="h-3 w-3" aria-hidden="true" />}
                  </span>
                  {preference.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-500" aria-live="polite">
            Đã chọn {selectedCodes.length}/12 sở thích
          </p>
          {errors.preferenceCodes && (
            <p className="mt-2 text-sm text-red-600" role="alert">{errors.preferenceCodes.message}</p>
          )}
        </fieldset>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-400">Bạn có thể xóa số điện thoại hoặc avatar bằng cách để trống rồi lưu.</p>
          <Button
            type="submit"
            disabled={saving || !isDirty}
            className="h-11 shrink-0 rounded-xl px-5 font-bold"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <Save className="h-4 w-4" />}
            {saving ? "Đang lưu..." : "Lưu hồ sơ du lịch"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function profileFormDefaults(profile: AccountProfile): AccountProfileFormValues {
  return {
    phone: profile.phone ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    preferenceCodes: profile.preferenceTags.map((item) => item.tagCode),
  };
}

function formatMemberDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

function formatRole(role: string): string {
  if (role === "CUSTOMER") return "Khách hàng";
  if (role === "ADMIN") return "Quản trị viên";
  return role;
}

function formatPreferenceCode(code: string): string {
  return code.toLocaleLowerCase("vi-VN").replaceAll("_", " ");
}

function AccountCenterSkeleton() {
  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[#f6f9fc] px-5 py-8 sm:px-8" role="status" aria-label="Đang tải hồ sơ tài khoản">
      <div className="mx-auto max-w-6xl">
        <div className="h-64 animate-pulse rounded-[2rem] bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200 motion-reduce:animate-none" />)}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.88fr_1.45fr]">
          <div className="h-[28rem] animate-pulse rounded-3xl bg-white ring-1 ring-slate-200 motion-reduce:animate-none" />
          <div className="h-[36rem] animate-pulse rounded-3xl bg-white ring-1 ring-slate-200 motion-reduce:animate-none" />
        </div>
        <span className="sr-only">Đang tải...</span>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

import { DiscoveryHero } from "@/components/tours/discovery-hero";
import { DestinationCards } from "@/components/home/destination-cards";
import { TourCard } from "@/components/tours/tour-card";
import { Button } from "@/components/ui/button";
import {
  buildTourDiscoveryHref,
  getDestinationDisplayName,
  getTourTypeLabel,
  getTourRequestErrorMessage,
  isCanceledTourRequest,
  parseTourSearchQuery,
  searchTours,
  TOUR_PAGE_SIZE,
  type TourSearchResponse,
  type TourSortOption,
  type TourTypeFilter,
} from "@/lib/tours";

type DiscoveryState =
  | { requestKey: string; status: "success"; data: TourSearchResponse; error: null }
  | { requestKey: string; status: "error"; data: null; error: string };

type CurrentDiscoveryState =
  | DiscoveryState
  | { status: "loading"; data: null; error: null };

const sortLabels: Record<TourSortOption, string> = {
  relevance: "Phù hợp nhất",
  priceAsc: "Giá thấp đến cao",
  priceDesc: "Giá cao đến thấp",
  ratingDesc: "Đánh giá cao nhất",
};

export function TourDiscovery() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = useMemo(() => parseTourSearchQuery(searchParams), [searchParams]);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<DiscoveryState | null>(null);
  const { q, destination, tourType, sortBy, page } = query;
  const requestKey = `${q}\u0000${destination}\u0000${tourType}\u0000${sortBy}\u0000${page}\u0000${reloadKey}`;
  const state: CurrentDiscoveryState =
    result?.requestKey === requestKey
      ? result
      : { status: "loading", data: null, error: null };

  useEffect(() => {
    const controller = new AbortController();

    searchTours({ q, destination, tourType, sortBy, page }, controller.signal)
      .then((data) =>
        setResult({ requestKey, status: "success", data, error: null })
      )
      .catch((error: unknown) => {
        if (controller.signal.aborted || isCanceledTourRequest(error)) return;
        setResult({
          requestKey,
          status: "error",
          data: null,
          error: getTourRequestErrorMessage(error),
        });
      });

    return () => controller.abort();
  }, [q, destination, tourType, sortBy, page, requestKey]);

  const navigate = (nextQuery: typeof query) => {
    const href = buildTourDiscoveryHref(nextQuery);
    router.push(`${href}#tour-results`);
  };

  const handleSearch = (value: {
    q: string;
    destination: string;
    tourType: TourTypeFilter;
  }) => {
    navigate({
      ...query,
      q: value.q,
      destination: value.destination,
      tourType: value.tourType,
      page: 0,
    });
  };

  const handleExplore = (keyword: string) => {
    handleSearch({ q: keyword, destination: "", tourType: query.tourType });
  };

  const handleSortChange = (sortBy: TourSortOption) => {
    navigate({ ...query, sortBy, page: 0 });
  };

  const totalPages =
    state.status === "success"
      ? Math.max(1, Math.ceil(state.data.total / TOUR_PAGE_SIZE))
      : 1;

  return (
    <>
      <DiscoveryHero
        query={query.q}
        destination={query.destination}
        tourType={query.tourType}
        onSearch={handleSearch}
        onExplore={handleExplore}
      />

      <DestinationCards />

      <section
        id="tour-results"
        className="relative mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-14 sm:px-8 sm:py-20"
        aria-busy={state.status === "loading"}
      >
        <div className="mb-9 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-primary uppercase">
              <span className="h-px w-8 bg-primary" />
              Những hành trình đang mở
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-4xl">
              {query.q && query.destination
                ? `“${query.q}” tại ${getDestinationDisplayName(query.destination)}`
                : query.q
                  ? `Kết quả cho “${query.q}”`
                  : query.destination
                    ? `Tour tại ${getDestinationDisplayName(query.destination)}`
                    : query.tourType
                      ? getTourTypeLabel(query.tourType)
                    : "Tour khám phá mới nhất"}
            </h2>
            {state.status === "success" && (
              <p className="mt-2 text-sm text-slate-500" aria-live="polite">
                Tìm thấy {state.data.total.toLocaleString("vi-VN")} tour phù hợp
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Sắp xếp</span>
            <select
              value={query.sortBy}
              onChange={(event) =>
                handleSortChange(event.target.value as TourSortOption)
              }
              className="h-10 border border-slate-300 bg-white rounded-lg px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Sắp xếp danh sách tour"
            >
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {state.status === "loading" && <TourGridSkeleton />}

        {state.status === "error" && (
          <div className="border border-red-200 bg-red-50 rounded-xl px-6 py-12 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">
              Chưa thể tải các hành trình
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
              {state.error}
            </p>
            <Button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="mt-5 bg-primary text-white hover:bg-primary/90"
            >
              Thử tải lại
            </Button>
          </div>
        )}

        {state.status === "success" && state.data.items.length === 0 && (
          <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50 px-6 py-14 text-center">
            <Compass className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
            <h3 className="mt-4 text-xl font-semibold text-slate-900">
              Chưa tìm thấy hành trình phù hợp
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Hãy thử một từ khóa rộng hơn hoặc quay lại xem toàn bộ tour đang mở.
            </p>
            {(query.q ||
              query.destination ||
              query.tourType ||
              query.page > 0 ||
              query.sortBy !== "relevance") && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate({
                    q: "",
                    destination: "",
                    tourType: "",
                    sortBy: "relevance",
                    page: 0,
                  })
                }
                className="mt-5"
              >
                Xem tất cả tour
              </Button>
            )}
          </div>
        )}

        {state.status === "success" && state.data.items.length > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {state.data.items.map((tour) => (
                <TourCard key={tour.tourId} tour={tour} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-10 flex items-center justify-center gap-3"
                aria-label="Phân trang danh sách tour"
              >
                <Button
                  type="button"
                  variant="outline"
                  disabled={query.page === 0}
                  onClick={() => navigate({ ...query, page: query.page - 1 })}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Trang trước
                </Button>
                <span className="px-2 text-sm text-slate-500" aria-live="polite">
                  Trang {query.page + 1} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={query.page + 1 >= totalPages}
                  onClick={() => navigate({ ...query, page: query.page + 1 })}
                >
                  Trang sau
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
}

export function TourDiscoveryFallback() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 text-slate-500">
      <Loader2 className="mr-2 h-5 w-5 animate-spin motion-reduce:animate-none" />
      <span>Đang mở bản đồ hành trình...</span>
    </div>
  );
}

function TourGridSkeleton() {
  return (
    <div
      className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="Đang tải danh sách tour"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white"
        >
          <div className="aspect-[4/3] animate-pulse bg-slate-200 motion-reduce:animate-none" />
          <div className="space-y-4 p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
            <div className="h-6 w-4/5 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
            <div className="h-4 w-3/5 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
            <div className="h-8 border-t border-slate-100 pt-4" />
          </div>
        </div>
      ))}
      <span className="sr-only">Đang tải...</span>
    </div>
  );
}

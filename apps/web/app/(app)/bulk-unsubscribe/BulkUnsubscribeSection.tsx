"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { usePostHog } from "posthog-js/react";
import { FilterIcon } from "lucide-react";
import { Title } from "@tremor/react";
import type { DateRange } from "react-day-picker";
import { LoadingContent } from "@/components/LoadingContent";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  NewsletterStatsQuery,
  NewsletterStatsResponse,
} from "@/app/api/user/stats/newsletters/route";
import { useExpanded } from "@/app/(app)/stats/useExpanded";
import { getDateRangeParams } from "@/app/(app)/stats/params";
import { NewsletterModal } from "@/app/(app)/stats/NewsletterModal";
import { useEmailsToIncludeFilter } from "@/app/(app)/stats/EmailsToIncludeFilter";
import { DetailedStatsFilter } from "@/app/(app)/stats/DetailedStatsFilter";
import { usePremium } from "@/components/PremiumAlert";
import {
  useNewsletterFilter,
  useBulkUnsubscribeShortcuts,
} from "@/app/(app)/bulk-unsubscribe/hooks";
import { useStatLoader } from "@/providers/StatLoaderProvider";
import { usePremiumModal } from "@/app/(app)/premium/PremiumModal";
import { useLabels } from "@/hooks/useLabels";
import {
  BulkUnsubscribeMobile,
  BulkUnsubscribeRowMobile,
} from "@/app/(app)/bulk-unsubscribe/BulkUnsubscribeMobile";
import {
  BulkUnsubscribeDesktop,
  BulkUnsubscribeRowDesktop,
} from "@/app/(app)/bulk-unsubscribe/BulkUnsubscribeDesktop";
import { Card } from "@/components/ui/card";
import { ShortcutTooltip } from "@/app/(app)/bulk-unsubscribe/ShortcutTooltip";
import { SearchBar } from "@/app/(app)/bulk-unsubscribe/SearchBar";
import { useToggleSelect } from "@/hooks/useToggleSelect";
import { BulkActions } from "@/app/(app)/bulk-unsubscribe/BulkActions";
import { ArchiveProgress } from "@/app/(app)/bulk-unsubscribe/ArchiveProgress";
import { ClientOnly } from "@/components/ClientOnly";

type Newsletter = NewsletterStatsResponse["newsletters"][number];

export function BulkUnsubscribeSection({
  dateRange,
  refreshInterval,
  isMobile,
}: {
  dateRange?: DateRange | undefined;
  refreshInterval: number;
  isMobile: boolean;
}) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";

  const [sortColumn, setSortColumn] = useState<
    "emails" | "unread" | "unarchived"
  >("emails");

  const { typesArray } = useEmailsToIncludeFilter();
  const { filtersArray, filters, setFilters } = useNewsletterFilter();
  const posthog = usePostHog();

  const params: NewsletterStatsQuery = {
    types: typesArray,
    filters: filtersArray,
    orderBy: sortColumn,
    limit: 100,
    includeMissingUnsubscribe: true,
    ...getDateRangeParams(dateRange),
  };
  const urlParams = new URLSearchParams(params as any);
  const { data, isLoading, error, mutate } = useSWR<
    NewsletterStatsResponse,
    { error: string }
  >(`/api/user/stats/newsletters?${urlParams}`, {
    refreshInterval,
    keepPreviousData: true,
  });

  const { hasUnsubscribeAccess, mutate: refetchPremium } = usePremium();

  const { expanded, extra } = useExpanded();
  const [openedNewsletter, setOpenedNewsletter] = React.useState<Newsletter>();

  const onOpenNewsletter = (newsletter: Newsletter) => {
    setOpenedNewsletter(newsletter);
    posthog?.capture("Clicked Expand Sender");
  };

  const [selectedRow, setSelectedRow] = React.useState<
    Newsletter | undefined
  >();

  useBulkUnsubscribeShortcuts({
    newsletters: data?.newsletters,
    selectedRow,
    onOpenNewsletter,
    setSelectedRow,
    refetchPremium,
    hasUnsubscribeAccess,
    mutate,
  });

  const [search, setSearch] = useState("");

  const { isLoading: isStatsLoading } = useStatLoader();

  const { userLabels } = useLabels();

  const { PremiumModal, openModal } = usePremiumModal();

  const RowComponent = isMobile
    ? BulkUnsubscribeRowMobile
    : BulkUnsubscribeRowDesktop;

  const rows = data?.newsletters
    .filter(
      search
        ? (item) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.lastUnsubscribeLink
              ?.toLowerCase()
              .includes(search.toLowerCase())
        : Boolean,
    )
    .slice(0, expanded ? undefined : 50);

  const { selected, isAllSelected, onToggleSelect, onToggleSelectAll } =
    useToggleSelect(rows?.map((item) => ({ id: item.name })) || []);

  const tableRows = rows?.map((item) => {
    return (
      <RowComponent
        key={item.name}
        item={item}
        userEmail={userEmail}
        onOpenNewsletter={onOpenNewsletter}
        labels={userLabels}
        mutate={mutate}
        selected={selectedRow?.name === item.name}
        onSelectRow={() => setSelectedRow(item)}
        onDoubleClick={() => onOpenNewsletter(item)}
        hasUnsubscribeAccess={hasUnsubscribeAccess}
        refetchPremium={refetchPremium}
        openPremiumModal={openModal}
        checked={selected.get(item.name) || false}
        onToggleSelect={onToggleSelect}
      />
    );
  });

  return (
    <>
      <Card className="mt-0 md:mt-4">
        <div className="items-center justify-between px-2 pt-2 sm:px-4 md:flex">
          {Array.from(selected.values()).filter(Boolean).length > 0 ? (
            <BulkActions selected={selected} mutate={mutate} />
          ) : (
            <Title className="hidden md:block">Bulk Unsubscriber</Title>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-end gap-1 md:mt-0 lg:flex-nowrap">
            <div className="hidden md:block">
              <ShortcutTooltip />
            </div>

            <SearchBar onSearch={setSearch} />

            <DetailedStatsFilter
              label="Filter"
              icon={<FilterIcon className="mr-2 h-4 w-4" />}
              keepOpenOnSelect
              columns={[
                {
                  label: "All",
                  checked:
                    filters.approved &&
                    filters.autoArchived &&
                    filters.unsubscribed &&
                    filters.unhandled,
                  setChecked: () =>
                    setFilters({
                      approved: true,
                      autoArchived: true,
                      unsubscribed: true,
                      unhandled: true,
                    }),
                },
                {
                  label: "Unhandled",
                  checked: filters.unhandled,
                  setChecked: () =>
                    setFilters({
                      ...filters,
                      unhandled: !filters.unhandled,
                    }),
                },
                {
                  label: "Unsubscribed",
                  checked: filters.unsubscribed,
                  setChecked: () =>
                    setFilters({
                      ...filters,
                      unsubscribed: !filters.unsubscribed,
                    }),
                },
                {
                  label: "Auto Archived",
                  checked: filters.autoArchived,
                  setChecked: () =>
                    setFilters({
                      ...filters,
                      autoArchived: !filters.autoArchived,
                    }),
                },
                {
                  label: "Approved",
                  checked: filters.approved,
                  setChecked: () =>
                    setFilters({ ...filters, approved: !filters.approved }),
                },
              ]}
            />
          </div>
        </div>

        <ClientOnly>
          <ArchiveProgress />
        </ClientOnly>

        {isStatsLoading && !isLoading && !data?.newsletters.length ? (
          <div className="p-4">
            <Skeleton className="h-screen rounded" />
          </div>
        ) : (
          <LoadingContent
            loading={!data && isLoading}
            error={error}
            loadingComponent={
              <div className="p-4">
                <Skeleton className="h-screen rounded" />
              </div>
            }
          >
            {tableRows?.length ? (
              <>
                {isMobile ? (
                  <BulkUnsubscribeMobile tableRows={tableRows} />
                ) : (
                  <BulkUnsubscribeDesktop
                    sortColumn={sortColumn}
                    setSortColumn={setSortColumn}
                    tableRows={tableRows}
                    isAllSelected={isAllSelected}
                    onToggleSelectAll={onToggleSelectAll}
                  />
                )}
                <div className="mt-2 px-6 pb-6">{extra}</div>
              </>
            ) : (
              <p className="max-w-prose space-y-4 p-4 text-gray-700">
                No emails found. To see more, adjust the filter options or click
                the "Load More" button.
              </p>
            )}
          </LoadingContent>
        )}
      </Card>
      <NewsletterModal
        newsletter={openedNewsletter}
        onClose={() => setOpenedNewsletter(undefined)}
        refreshInterval={refreshInterval}
      />
      <PremiumModal />
    </>
  );
}

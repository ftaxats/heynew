"use client";

import useSWR from "swr";
import groupBy from "lodash/groupBy";
import { TopSection } from "@/components/TopSection";
import { ExampleList } from "@/app/(app)/automation/rule/[ruleId]/examples/example-list";
import type { GroupEmailsResponse } from "@/app/api/user/group/[groupId]/messages/controller";
import { LoadingContent } from "@/components/LoadingContent";

export const dynamic = "force-dynamic";

export default function RuleExamplesPage({
  params,
}: {
  params: { groupId: string };
}) {
  const { data, isLoading, error } = useSWR<GroupEmailsResponse>(
    `/api/user/group/${params.groupId}/messages`,
  );

  const threads = groupBy(data?.messages, (m) => m.threadId);
  const groupedBySenders = groupBy(threads, (t) => t[0]?.headers.from);

  const hasExamples = Object.keys(groupedBySenders).length > 0;

  return (
    <div>
      <TopSection
        title="Examples of emails that match this group"
        descriptionComponent={
          isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              {hasExamples ? (
                <p>
                  Here are some examples of previous emails that match this
                  rule.
                </p>
              ) : (
                <p>
                  We did not find any examples to show you that match this rule.
                </p>
              )}
            </>
          )
        }
      />
      <LoadingContent loading={!data && isLoading} error={error}>
        <ExampleList groupedBySenders={groupedBySenders} />
      </LoadingContent>
    </div>
  );
}

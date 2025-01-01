"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import {
  type FieldError,
  type FieldErrors,
  type SubmitHandler,
  type UseFormRegisterReturn,
  type UseFormSetValue,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import TextareaAutosize from "react-textarea-autosize";
import { capitalCase } from "capital-case";
import { usePostHog } from "posthog-js/react";
import { ExternalLinkIcon, PlusIcon } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { ErrorMessage, Input, Label } from "@/components/Input";
import { toastError, toastSuccess } from "@/components/Toast";
import {
  MessageText,
  SectionDescription,
  TypographyH3,
} from "@/components/Typography";
import { ActionType, CategoryFilterType, RuleType } from "@prisma/client";
import { createRuleAction, updateRuleAction } from "@/utils/actions/rule";
import {
  type CreateRuleBody,
  createRuleBody,
} from "@/utils/actions/validation";
import { actionInputs } from "@/utils/actionType";
import { Select } from "@/components/Select";
import { Toggle } from "@/components/Toggle";
import type { GroupsResponse } from "@/app/api/user/group/route";
import { LoadingContent } from "@/components/LoadingContent";
import { TooltipExplanation } from "@/components/TooltipExplanation";
import { ViewGroupButton } from "@/app/(app)/automation/group/ViewGroup";
import { CreateGroupModalButton } from "@/app/(app)/automation/group/CreateGroupModal";
import { createPredefinedGroupAction } from "@/utils/actions/group";
import {
  NEWSLETTER_GROUP_ID,
  RECEIPT_GROUP_ID,
} from "@/app/(app)/automation/create/examples";
import { isActionError } from "@/utils/error";
import { Combobox } from "@/components/Combobox";
import { useLabels } from "@/hooks/useLabels";
import { createLabelAction } from "@/utils/actions/mail";
import type { LabelsResponse } from "@/app/api/google/labels/route";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";
import { useCategories } from "@/hooks/useCategories";
import { hasVariables } from "@/utils/template";
import { getEmptyCondition } from "@/utils/condition";
import { AlertError } from "@/components/Alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function RuleForm({ rule }: { rule: CreateRuleBody & { id?: string } }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<CreateRuleBody>({
    resolver: zodResolver(createRuleBody),
    defaultValues: rule,
  });

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: "conditions",
  });
  const { append, remove } = useFieldArray({ control, name: "actions" });

  const { userLabels, data: gmailLabelsData, isLoading, mutate } = useLabels();
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();
  const router = useRouter();

  const posthog = usePostHog();

  const onSubmit: SubmitHandler<CreateRuleBody> = useCallback(
    async (data) => {
      // create labels that don't exist
      for (const action of data.actions) {
        if (action.type === ActionType.LABEL) {
          const hasLabel = gmailLabelsData?.labels?.some(
            (label) => label.name === action.label,
          );
          if (!hasLabel && action.label?.value && !action.label?.ai) {
            await createLabelAction({ name: action.label.value });
          }
        }
      }

      if (data.id) {
        const res = await updateRuleAction({ ...data, id: data.id });

        if (isActionError(res)) {
          console.error(res);
          toastError({ description: res.error });
        } else if (!res.rule) {
          toastError({
            description: "There was an error updating the rule.",
          });
        } else {
          toastSuccess({ description: "Saved!" });
          posthog.capture("User updated AI rule", {
            conditions: data.conditions.map((condition) => condition.type),
            actions: data.actions.map((action) => action.type),
            automate: data.automate,
            runOnThreads: data.runOnThreads,
          });
          router.push("/automation?tab=rules");
        }
      } else {
        const res = await createRuleAction(data);

        if (isActionError(res)) {
          console.error(res);
          toastError({ description: res.error });
        } else if (!res.rule) {
          toastError({
            description: "There was an error creating the rule.",
          });
        } else {
          toastSuccess({ description: "Created!" });
          posthog.capture("User created AI rule", {
            conditions: data.conditions.map((condition) => condition.type),
            actions: data.actions.map((action) => action.type),
            automate: data.automate,
            runOnThreads: data.runOnThreads,
          });
          router.replace(`/automation/rule/${res.rule.id}`);
          router.push("/automation?tab=rules");
        }
      }
    },
    [gmailLabelsData?.labels, router, posthog],
  );

  const conditions = watch("conditions");
  const unusedCondition = useMemo(() => {
    const usedConditions = new Set(conditions?.map(({ type }) => type));
    return Object.values(RuleType).find((type) => !usedConditions.has(type));
  }, [conditions]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    trigger("conditions");
  }, [conditions]);

  const actionErrors = useMemo(() => {
    const actionErrors: string[] = [];
    watch("actions")?.forEach((_, index) => {
      const actionError =
        errors?.actions?.[index]?.url?.root?.message ||
        errors?.actions?.[index]?.label?.root?.message ||
        errors?.actions?.[index]?.to?.root?.message;
      if (actionError) actionErrors.push(actionError);
    });
    return actionErrors;
  }, [errors, watch]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mt-4">
        <Input
          type="text"
          name="Name"
          label="Rule name"
          registerProps={register("name")}
          error={errors.name}
          placeholder="e.g. Label receipts"
        />
      </div>

      <TypographyH3 className="mt-6">Conditions</TypographyH3>

      {errors.conditions?.root?.message && (
        <div className="mt-4">
          <AlertError
            title="Error"
            description={errors.conditions.root.message}
          />
        </div>
      )}

      <div className="mt-4 space-y-4">
        {conditionFields.map((condition, index) => (
          <Card key={condition.id} className="mt-4">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="sm:col-span-1">
                <Select
                  label="Type"
                  options={[
                    { label: "AI", value: RuleType.AI },
                    { label: "Static", value: RuleType.STATIC },
                    { label: "Group", value: RuleType.GROUP },
                    { label: "Smart Category", value: RuleType.CATEGORY },
                  ]}
                  error={
                    errors.conditions?.[index]?.type as FieldError | undefined
                  }
                  {...register(`conditions.${index}.type`, {
                    onChange: (e) => {
                      const selectedType = e.target.value;

                      // check if we have duplicate condition types
                      const conditionTypes = new Set(
                        conditions.map((condition) => condition.type),
                      );

                      if (conditionTypes.size !== conditions.length) {
                        toastError({
                          description:
                            "You can only have one condition of each type.",
                        });
                      }

                      const emptyCondition = getEmptyCondition(selectedType);
                      if (emptyCondition) {
                        setValue(`conditions.${index}`, emptyCondition);
                      }
                    },
                  })}
                />
              </div>

              <div className="space-y-4 sm:col-span-3">
                {watch(`conditions.${index}.type`) === RuleType.AI && (
                  <Input
                    type="text"
                    autosizeTextarea
                    rows={3}
                    name={`conditions.${index}.instructions`}
                    label="Instructions"
                    registerProps={register(`conditions.${index}.instructions`)}
                    error={
                      (
                        errors.conditions?.[index] as {
                          instructions?: FieldError;
                        }
                      )?.instructions
                    }
                    placeholder='e.g. Apply this rule to all "receipts"'
                    tooltipText="The instructions that will be passed to the AI."
                  />
                )}

                {watch(`conditions.${index}.type`) === RuleType.STATIC && (
                  <>
                    <Input
                      type="text"
                      name={`conditions.${index}.from`}
                      label="From"
                      registerProps={register(`conditions.${index}.from`)}
                      error={
                        (errors.conditions?.[index] as { from?: FieldError })
                          ?.from
                      }
                      placeholder="e.g. elie@getinboxzero.com"
                      tooltipText="Only apply this rule to emails from this address."
                    />
                    <Input
                      type="text"
                      name={`conditions.${index}.to`}
                      label="To"
                      registerProps={register(`conditions.${index}.to`)}
                      error={
                        (errors.conditions?.[index] as { to?: FieldError })?.to
                      }
                      placeholder="e.g. elie@getinboxzero.com"
                      tooltipText="Only apply this rule to emails sent to this address."
                    />
                    <Input
                      type="text"
                      name={`conditions.${index}.subject`}
                      label="Subject"
                      registerProps={register(`conditions.${index}.subject`)}
                      error={
                        (
                          errors.conditions?.[index] as {
                            subject?: FieldError;
                          }
                        )?.subject
                      }
                      placeholder="e.g. Receipt for your purchase"
                      tooltipText="Only apply this rule to emails with this subject."
                    />
                  </>
                )}

                {watch(`conditions.${index}.type`) === RuleType.GROUP && (
                  <GroupsTab
                    registerProps={register(`conditions.${index}.groupId`)}
                    setValue={setValue}
                    errors={errors}
                    groupId={watch(`conditions.${index}.groupId`)}
                  />
                )}

                {watch(`conditions.${index}.type`) === RuleType.CATEGORY && (
                  <>
                    <div className="flex items-center gap-4">
                      <RadioGroup
                        defaultValue={CategoryFilterType.INCLUDE}
                        value={
                          watch(`conditions.${index}.categoryFilterType`) ||
                          undefined
                        }
                        onValueChange={(value) =>
                          setValue(
                            `conditions.${index}.categoryFilterType`,
                            value as CategoryFilterType,
                          )
                        }
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={CategoryFilterType.INCLUDE}
                            id="include"
                          />
                          <Label name="include" label="Match" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={CategoryFilterType.EXCLUDE}
                            id="exclude"
                          />
                          <Label name="exclude" label="Skip" />
                        </div>
                      </RadioGroup>

                      <TooltipExplanation text="This stops the AI from applying this rule to emails that don't match your criteria." />
                    </div>

                    <LoadingContent
                      loading={categoriesLoading}
                      error={categoriesError}
                    >
                      {categories.length ? (
                        <>
                          <MultiSelectFilter
                            title="Categories"
                            maxDisplayedValues={8}
                            options={categories.map((category) => ({
                              label: capitalCase(category.name),
                              value: category.id,
                            }))}
                            selectedValues={
                              new Set(
                                watch(`conditions.${index}.categoryFilters`),
                              )
                            }
                            setSelectedValues={(selectedValues) => {
                              setValue(
                                `conditions.${index}.categoryFilters`,
                                Array.from(selectedValues),
                              );
                            }}
                          />
                          {(
                            errors.conditions?.[index] as {
                              categoryFilters?: { message?: string };
                            }
                          )?.categoryFilters?.message && (
                            <ErrorMessage
                              message={
                                (
                                  errors.conditions?.[index] as {
                                    categoryFilters?: { message?: string };
                                  }
                                )?.categoryFilters?.message || ""
                              }
                            />
                          )}

                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                          >
                            <Link
                              href="/smart-categories/setup"
                              target="_blank"
                            >
                              Create category
                              <ExternalLinkIcon className="ml-1.5 size-4" />
                            </Link>
                          </Button>
                        </>
                      ) : (
                        <div>
                          <SectionDescription>
                            No smart categories found.
                          </SectionDescription>

                          <Button asChild className="mt-1">
                            <Link href="/smart-categories" target="_blank">
                              Set up Smart Categories
                              <ExternalLinkIcon className="ml-1.5 size-4" />
                            </Link>
                          </Button>
                        </div>
                      )}
                    </LoadingContent>
                  </>
                )}
              </div>
            </div>

            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="mt-2"
              onClick={() => removeCondition(index)}
            >
              Remove
            </Button>
          </Card>
        ))}
      </div>

      {unusedCondition && (
        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => appendCondition(getEmptyCondition(unusedCondition))}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Condition
          </Button>
        </div>
      )}

      <TypographyH3 className="mt-6">Actions</TypographyH3>

      {actionErrors.length > 0 && (
        <div className="mt-4">
          <AlertError
            title="Error"
            description={
              <ul className="list-inside list-disc">
                {actionErrors.map((error, index) => (
                  <li key={`action-${index}`}>{error}</li>
                ))}
              </ul>
            }
          />
        </div>
      )}

      <div className="mt-4 space-y-4">
        {watch("actions")?.map((action, i) => {
          return (
            <Card key={i}>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-1">
                  <Select
                    label="Type"
                    options={Object.keys(ActionType).map((action) => ({
                      label: capitalCase(action),
                      value: action,
                    }))}
                    {...register(`actions.${i}.type`)}
                    error={errors.actions?.[i]?.type as FieldError | undefined}
                  />

                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    className="mt-2"
                    onClick={() => remove(i)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="space-y-4 sm:col-span-3">
                  {actionInputs[action.type].fields.map((field) => {
                    const isAiGenerated = action[field.name]?.ai;

                    const value = watch(`actions.${i}.${field.name}.value`);

                    return (
                      <div key={field.label}>
                        <div className="flex items-center justify-between">
                          <Label name={field.name} label={field.label} />
                          {field.name === "label" && (
                            <div className="flex items-center space-x-2">
                              <TooltipExplanation text="Enable for AI-generated values unique to each email. Put the prompt inside braces {{your prompt here}}. Disable to use a fixed value." />
                              <Toggle
                                name={`actions.${i}.${field.name}.ai`}
                                label="AI generated"
                                enabled={isAiGenerated || false}
                                onChange={(enabled) => {
                                  setValue(
                                    `actions.${i}.${field.name}`,
                                    enabled
                                      ? { value: "", ai: true }
                                      : { value: "", ai: false },
                                  );
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {field.name === "label" && !isAiGenerated ? (
                          <div className="mt-2">
                            <LabelCombobox
                              userLabels={userLabels}
                              isLoading={isLoading}
                              mutate={mutate}
                              value={action[field.name]?.value || ""}
                              onChangeValue={(value) => {
                                setValue(
                                  `actions.${i}.${field.name}.value`,
                                  value,
                                );
                              }}
                            />
                          </div>
                        ) : field.textArea ? (
                          <div className="mt-2">
                            <TextareaAutosize
                              className="block w-full flex-1 whitespace-pre-wrap rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                              minRows={3}
                              rows={3}
                              placeholder="Add text or use {{AI prompts}}. e.g. Hi {{write greeting}}"
                              value={value || ""}
                              {...register(`actions.${i}.${field.name}.value`)}
                            />
                          </div>
                        ) : (
                          <div className="mt-2">
                            <input
                              className="block w-full flex-1 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                              type="text"
                              placeholder="Add text or use {{AI prompts}}. e.g. Hi {{write greeting}}"
                              {...register(`actions.${i}.${field.name}.value`)}
                            />
                          </div>
                        )}

                        {hasVariables(value) && (
                          <div className="mt-2 whitespace-pre-wrap rounded-md bg-gray-50 p-2 font-mono text-sm text-gray-900">
                            {(value || "")
                              .split(/(\{\{.*?\}\})/g)
                              .map((part, i) =>
                                part.startsWith("{{") ? (
                                  <span
                                    key={i}
                                    className="rounded bg-blue-100 px-1 text-blue-500"
                                  >
                                    <sub className="font-sans">AI</sub>
                                    {part}
                                  </span>
                                ) : (
                                  <span key={i}>{part}</span>
                                ),
                              )}
                          </div>
                        )}

                        {errors.actions?.[i]?.[field.name]?.message ? (
                          <ErrorMessage
                            message={
                              errors.actions?.[i]?.[field.name]?.message!
                            }
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-4">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => append({ type: ActionType.LABEL })}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Action
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-end space-x-2">
        <TooltipExplanation
          size="md"
          text="When enabled our AI will perform actions automatically. If disabled, you will have to confirm actions first."
        />

        <Toggle
          name="automate"
          label="Automate"
          enabled={watch("automate") || false}
          onChange={(enabled) => {
            setValue("automate", enabled);
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-end space-x-2">
        <TooltipExplanation
          size="md"
          text="When enabled, this rule applies to all emails in a conversation, including replies. When disabled, it only applies to the first email in each conversation."
        />

        <Toggle
          name="runOnThreads"
          label="Apply to threads"
          enabled={watch("runOnThreads") || false}
          onChange={(enabled) => {
            setValue("runOnThreads", enabled);
          }}
        />
      </div>

      <div className="flex justify-end space-x-2 py-6">
        {rule.id ? (
          <>
            {/* {!isAIRule(rule) && (
              <Button variant="outline" asChild>
                <Link href={`/automation/rule/${rule.id}/examples`}>
                  View Examples
                </Link>
              </Button>
            )} */}
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Save
            </Button>
          </>
        ) : (
          <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
            Create
          </Button>
        )}
      </div>
    </form>
  );
}

function GroupsTab(props: {
  registerProps: UseFormRegisterReturn;
  setValue: UseFormSetValue<CreateRuleBody>;
  errors: FieldErrors<CreateRuleBody>;
  groupId?: string | null;
}) {
  const { setValue } = props;
  const { data, isLoading, error, mutate } =
    useSWR<GroupsResponse>("/api/user/group");
  const [loadingCreateGroup, setLoadingCreateGroup] = useState(false);

  useEffect(() => {
    async function createGroup(groupId: string) {
      setLoadingCreateGroup(true);

      const result = await createPredefinedGroupAction(groupId);

      if (isActionError(result)) {
        toastError({ description: result.error });
      } else if (!result) {
        toastError({ description: "Error creating group" });
      } else {
        mutate();
        setValue("conditions", [{ groupId: result.id, type: RuleType.GROUP }]);
      }

      setLoadingCreateGroup(false);
    }

    if (
      props.groupId === NEWSLETTER_GROUP_ID ||
      props.groupId === RECEIPT_GROUP_ID
    ) {
      createGroup(props.groupId);
    }
  }, [mutate, props.groupId, setValue]);

  return (
    <div className="mt-4">
      <SectionDescription>
        A group is a collection of senders or subjects. For example, a group
        could be all receipts or all newsletters.
      </SectionDescription>

      {loadingCreateGroup && (
        <MessageText className="my-4 text-center">
          Creating group with AI... This will take up to 30 seconds.
        </MessageText>
      )}

      <LoadingContent loading={isLoading || loadingCreateGroup} error={error}>
        <div className="mt-2 grid gap-2 sm:flex sm:items-center">
          {data?.groups && data?.groups.length > 0 && (
            <div className="min-w-[250px] flex-1">
              <Select
                label=""
                options={data.groups.map((group) => ({
                  label: group.name,
                  value: group.id,
                }))}
                {...props.registerProps}
                // TODO: fix this
                // error={props.errors.groupId}
              />
            </div>
          )}

          {props.groupId && (
            <ViewGroupButton
              groupId={props.groupId}
              ButtonComponent={({ onClick }) => (
                <Button variant="outline" onClick={onClick}>
                  View
                </Button>
              )}
            />
          )}
          <CreateGroupModalButton
            existingGroups={data?.groups.map((group) => group.name) || []}
            buttonVariant="outline"
          />
        </div>
      </LoadingContent>
    </div>
  );
}

function LabelCombobox({
  value,
  onChangeValue,
  userLabels,
  isLoading,
  mutate,
}: {
  value: string;
  onChangeValue: (value: string) => void;
  userLabels: NonNullable<LabelsResponse["labels"]>;
  isLoading: boolean;
  mutate: () => void;
}) {
  const [search, setSearch] = useState("");

  return (
    <Combobox
      options={userLabels.map((label) => ({
        value: label.name || "",
        label: label.name || "",
      }))}
      value={value}
      onChangeValue={onChangeValue}
      search={search}
      onSearch={setSearch}
      placeholder="Select a label"
      emptyText={
        <div>
          <div>No labels</div>
          {search && (
            <Button
              className="mt-2"
              variant="outline"
              onClick={() => {
                toast.promise(
                  async () => {
                    const res = await createLabelAction({ name: search });
                    mutate();
                    if (isActionError(res)) throw new Error(res.error);
                  },
                  {
                    loading: `Creating label "${search}"...`,
                    success: `Created label "${search}"`,
                    error: (errorMessage) =>
                      `Error creating label "${search}": ${errorMessage}`,
                  },
                );
              }}
            >
              {`Create "${search}" label`}
            </Button>
          )}
        </div>
      }
      loading={isLoading}
    />
  );
}

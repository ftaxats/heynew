import { z } from "zod";
import { CategoryFilterType, GroupItemType } from "@prisma/client";
import { ActionType, RuleType } from "@prisma/client";

// groups
export const createGroupBody = z.object({
  name: z.string(),
  prompt: z.string().optional(),
});
export type CreateGroupBody = z.infer<typeof createGroupBody>;

export const addGroupItemBody = z.object({
  groupId: z.string(),
  type: z.enum([GroupItemType.FROM, GroupItemType.SUBJECT]),
  value: z.string(),
});
export type AddGroupItemBody = z.infer<typeof addGroupItemBody>;

export const updateGroupPromptBody = z.object({
  groupId: z.string(),
  prompt: z.string().nullable(),
});
export type UpdateGroupPromptBody = z.infer<typeof updateGroupPromptBody>;

// rules
export const zodActionType = z.enum([
  ActionType.ARCHIVE,
  ActionType.DRAFT_EMAIL,
  ActionType.FORWARD,
  ActionType.LABEL,
  ActionType.MARK_SPAM,
  ActionType.REPLY,
  ActionType.SEND_EMAIL,
  ActionType.CALL_WEBHOOK,
]);

const zodField = z
  .object({
    value: z.string().nullish(),
    ai: z.boolean().nullish(),
  })
  .nullish();

const zodAction = z
  .object({
    id: z.string().optional(),
    type: zodActionType,
    label: zodField,
    subject: zodField,
    content: zodField,
    to: zodField,
    cc: zodField,
    bcc: zodField,
    url: zodField,
  })
  .superRefine((data, ctx) => {
    if (data.type === ActionType.LABEL && !data.label?.value?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a label name for the Label action",
        path: ["label"],
      });
    }
    if (data.type === ActionType.FORWARD && !data.to?.value?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter an email address to forward to",
        path: ["to"],
      });
    }
    if (data.type === ActionType.CALL_WEBHOOK && !data.url?.value?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a webhook URL",
        path: ["url"],
      });
    }
  });

export const zodRuleType = z.enum([
  RuleType.AI,
  RuleType.STATIC,
  RuleType.GROUP,
  RuleType.CATEGORY,
]);

const zodAiCondition = z.object({
  instructions: z.string().nullish(),
});

const zodGroupCondition = z.object({
  groupId: z.string().nullish(),
});

const zodStaticCondition = z.object({
  to: z.string().nullish(),
  from: z.string().nullish(),
  subject: z.string().nullish(),
  body: z.string().nullish(),
});

const zodCategoryCondition = z.object({
  categoryFilterType: z
    .enum([CategoryFilterType.INCLUDE, CategoryFilterType.EXCLUDE])
    .nullish(),
  categoryFilters: z.array(z.string()).nullish(),
});

const zodCondition = z.object({
  type: zodRuleType,
  ...zodAiCondition.shape,
  ...zodGroupCondition.shape,
  ...zodStaticCondition.shape,
  ...zodCategoryCondition.shape,
});
export type ZodCondition = z.infer<typeof zodCondition>;

export const createRuleBody = z.object({
  id: z.string().optional(),
  name: z.string(),
  instructions: z.string().nullish(),
  automate: z.boolean().nullish(),
  runOnThreads: z.boolean().nullish(),
  actions: z.array(zodAction).min(1, "You must have at least one action"),
  conditions: z
    .array(zodCondition)
    .min(1, "You must have at least one condition")
    .refine(
      (conditions) => {
        const types = conditions.map((condition) => condition.type);
        return new Set(types).size === types.length;
      },
      {
        message: "You can't have two conditions with the same type.",
      },
    ),
});
export type CreateRuleBody = z.infer<typeof createRuleBody>;

export const updateRuleBody = createRuleBody.extend({ id: z.string() });
export type UpdateRuleBody = z.infer<typeof updateRuleBody>;

export const updateRuleInstructionsBody = z.object({
  id: z.string(),
  instructions: z.string(),
});
export type UpdateRuleInstructionsBody = z.infer<
  typeof updateRuleInstructionsBody
>;

export const saveRulesPromptBody = z.object({ rulesPrompt: z.string().trim() });
export type SaveRulesPromptBody = z.infer<typeof saveRulesPromptBody>;

export const rulesExamplesBody = z.object({
  rulesPrompt: z.string(),
});
export type RulesExamplesBody = z.infer<typeof rulesExamplesBody>;

export const testAiBody = z.object({ messageId: z.string() });
export type TestAiBody = z.infer<typeof testAiBody>;

export const reportAiMistakeBody = z
  .object({
    email: z.object({
      from: z.string(),
      subject: z.string(),
      snippet: z.string(),
      textHtml: z.string().nullish(),
      textPlain: z.string().nullish(),
    }),
    actualRuleId: z.string().nullish(),
    expectedRuleId: z.string().nullish(),
    explanation: z.string().nullish(),
  })
  .refine((data) => data.actualRuleId != null || data.expectedRuleId != null, {
    message: "Either the actual or the expected rule must be provided",
    path: ["expectedRuleId"], // This will show the error on the expectedRuleId field
  });
export type ReportAiMistakeBody = z.infer<typeof reportAiMistakeBody>;

// categories
export const createCategoryBody = z.object({
  id: z.string().nullish(),
  name: z.string().max(30),
  description: z.string().max(300).nullish(),
});
export type CreateCategoryBody = z.infer<typeof createCategoryBody>;

// api key
export const createApiKeyBody = z.object({ name: z.string().nullish() });
export type CreateApiKeyBody = z.infer<typeof createApiKeyBody>;

export const deactivateApiKeyBody = z.object({ id: z.string() });
export type DeactivateApiKeyBody = z.infer<typeof deactivateApiKeyBody>;

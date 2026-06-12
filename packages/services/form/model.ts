import { z } from "zod";

const fieldTypeEnum = z.enum(["text", "number", "date", "email", "select", "checkbox", "radio", "yesno", "multiselect"]);

export const createFormInput = z.object({
  title: z.string().max(55).describe("title of the form"),
  description: z.string().max(300).optional().describe("description of the form"),
  createdBy: z.string().describe("uuid of the user creating the form"),
});

export type CreateFormInputType = z.infer<typeof createFormInput>;

export const listFormsByUserIdInput = z.object({
  userId: z.uuid().describe("uuid of the user"),
});

export type ListFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>;

export const deleteFormInput = z.object({
  id: z.uuid(),
  userId: z.uuid(),
});

export type DeleteFormInputType = z.infer<typeof deleteFormInput>;

export const getFieldsInput = z.object({
  formId: z.uuid(),
});

export type GetFieldsInputType = z.infer<typeof getFieldsInput>;

export const createFieldInput = z.object({
  formId: z.uuid(),
  label: z.string().max(100),
  fieldType: fieldTypeEnum,
  placeholder: z.string().optional(),
  description: z.string().optional(),
  isRequired: z.boolean().optional(),
});

export type CreateFieldInputType = z.infer<typeof createFieldInput>;

export const deleteFieldInput = z.object({
  id: z.uuid(),
});

export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>;

export const updateFieldInput = z.object({
  id: z.uuid(),
  label: z.string().max(100).optional(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  isRequired: z.boolean().optional(),
  fieldType: fieldTypeEnum.optional(),
});

export type UpdateFieldInputType = z.infer<typeof updateFieldInput>;

export const reorderFieldInput = z.object({
  id: z.uuid(),
  prevIndex: z.string().optional(),
  nextIndex: z.string().optional(),
});

export type ReorderFieldInputType = z.infer<typeof reorderFieldInput>;

export const getFormByIdInput = z.object({
  formId: z.uuid(),
});

export type GetFormByIdInputType = z.infer<typeof getFormByIdInput>;

export const updateFormStatusInput = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  status: z.enum(["published", "unpublished"]),
});

export type UpdateFormStatusInputType = z.infer<typeof updateFormStatusInput>;

export const updateFormVisibilityInput = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  visibility: z.enum(["public", "unlisted"]),
});

export type UpdateFormVisibilityInputType = z.infer<typeof updateFormVisibilityInput>;

export const getAnalyticsSummaryInput = z.object({
  userId: z.uuid(),
});

export type GetAnalyticsSummaryInputType = z.infer<typeof getAnalyticsSummaryInput>;

export const updateFormSettingsInput = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  maxResponses: z.number().int().positive().nullable().optional(),
  emailNotifications: z.boolean().optional(),
  dailyDigest: z.boolean().optional(),
  theme: z.string().max(20).optional(),
});

export type UpdateFormSettingsInputType = z.infer<typeof updateFormSettingsInput>;

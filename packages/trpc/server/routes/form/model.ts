import { z } from "zod";

const fieldTypeEnum = z.enum(["text", "number", "date", "email", "select", "checkbox", "radio", "yesno", "multiselect"]);

export const createFormInputModel = z.object({
  title: z.string().max(55).describe("title of the form"),
  description: z.string().max(300).optional().describe("description of the form"),
});

export const createFormOutputModel = z.object({
  id: z.string().describe("id of the created form"),
});

export const deleteFormInputModel = z.object({
  id: z.uuid().describe("id of the form to delete"),
});

export const listFormsOutputModel = z.array(z.object({
  id: z.string().describe("id of the form"),
  title: z.string().describe("title of the form"),
  description: z.string().nullable().describe("description of the form"),
  status: z.enum(["draft", "published", "unpublished"]).describe("publish status"),
  visibility: z.enum(["public", "unlisted"]).describe("visibility setting"),
  responseCount: z.number().describe("total number of responses"),
  maxResponses: z.number().nullable().describe("response limit, null means unlimited"),
  emailNotifications: z.boolean().describe("email on each submission"),
  dailyDigest: z.boolean().describe("daily digest email"),
  theme: z.string().describe("form theme id"),
  createdAt: z.date().nullable().describe("creation timestamp"),
  updatedAt: z.date().nullable().describe("last updated timestamp"),
}));

export const getFieldsInputModel = z.object({
  formId: z.uuid(),
});

export const getFieldsOutputModel = z.array(z.object({
  id: z.string(),
  label: z.string(),
  labelKey: z.string(),
  fieldType: fieldTypeEnum,
  placeholder: z.string().nullable(),
  description: z.string().nullable(),
  isRequired: z.boolean(),
  index: z.string(),
}));

export const createFieldInputModel = z.object({
  formId: z.uuid(),
  label: z.string().max(100),
  fieldType: fieldTypeEnum,
  placeholder: z.string().optional(),
  description: z.string().optional(),
  isRequired: z.boolean().optional(),
});

export const createFieldOutputModel = z.object({
  id: z.string(),
});

export const deleteFieldInputModel = z.object({
  id: z.uuid(),
});

export const updateFieldInputModel = z.object({
  id: z.uuid(),
  label: z.string().max(100).optional(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  isRequired: z.boolean().optional(),
  fieldType: fieldTypeEnum.optional(),
});

export const reorderFieldInputModel = z.object({
  id: z.uuid(),
  prevIndex: z.string().optional(),
  nextIndex: z.string().optional(),
});

export const updateFormStatusInputModel = z.object({
  id: z.uuid(),
  status: z.enum(["published", "unpublished"]),
});

export const updateFormVisibilityInputModel = z.object({
  id: z.uuid(),
  visibility: z.enum(["public", "unlisted"]),
});

export const updateFormSettingsInputModel = z.object({
  id: z.uuid(),
  maxResponses: z.number().int().positive().nullable().optional(),
  emailNotifications: z.boolean().optional(),
  dailyDigest: z.boolean().optional(),
  theme: z.string().max(20).optional(),
});

export const getAnalyticsSummaryOutputModel = z.object({
  responsesByDay: z.array(z.object({
    date: z.string(),
    count: z.number(),
  })),
});

export const listPublicFormsOutputModel = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    responseCount: z.number(),
    createdAt: z.date().nullable(),
  }),
);

export const getFormByIdInputModel = z.object({
  formId: z.uuid(),
});

export const getFormByIdOutputModel = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(["draft", "published", "unpublished"]),
  visibility: z.enum(["public", "unlisted"]),
  responseCount: z.number(),
  maxResponses: z.number().nullable(),
  theme: z.string(),
  fields: z.array(z.object({
    id: z.string(),
    label: z.string(),
    labelKey: z.string(),
    fieldType: fieldTypeEnum,
    placeholder: z.string().nullable(),
    description: z.string().nullable(),
    isRequired: z.boolean(),
    index: z.string(),
  })),
});

import { z } from "zod";

export const submitFormInputModel = z.object({
  formId: z.uuid(),
  values: z.array(
    z.object({
      formFieldId: z.uuid(),
      value: z.string(),
    }),
  ),
});

export const submitFormOutputModel = z.object({
  id: z.string(),
});

export const getFormSubmissionsInputModel = z.object({
  formId: z.uuid(),
});

export const getAllSubmissionsOutputModel = z.array(
  z.object({
    id: z.string(),
    formId: z.string(),
    formTitle: z.string(),
    value: z.array(z.object({ formFieldId: z.string(), value: z.string() })).nullable(),
    createdAt: z.date().nullable(),
  }),
);

export const getFormSubmissionsOutputModel = z.array(
  z.object({
    id: z.string(),
    createdAt: z.date().nullable(),
    value: z
      .array(z.object({ formFieldId: z.string(), value: z.string() }))
      .nullable(),
  }),
);

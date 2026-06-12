import { z } from "zod";

export const createSubmissionInput = z.object({
  formId: z.uuid(),
  values: z.array(
    z.object({
      formFieldId: z.uuid(),
      value: z.string(),
    }),
  ),
});

export type CreateSubmissionInputType = z.infer<typeof createSubmissionInput>;

export const getFormSubmissionsInput = z.object({
  formId: z.uuid(),
  userId: z.uuid(),
});

export type GetFormSubmissionsInputType = z.infer<typeof getFormSubmissionsInput>;

export const getAllSubmissionsInput = z.object({
  userId: z.uuid(),
});

export type GetAllSubmissionsInputType = z.infer<typeof getAllSubmissionsInput>;

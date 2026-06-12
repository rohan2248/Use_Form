import { z } from "zod";
import { publicProcedure, authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  submitFormInputModel,
  submitFormOutputModel,
  getFormSubmissionsInputModel,
  getFormSubmissionsOutputModel,
  getAllSubmissionsOutputModel,
} from "./model";
import { submissionService } from "../../services";

const TAGS = ["Submission"];
const getPath = generatePath("/submission");

export const submissionRouter = router({
  getFormSubmissions: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFormSubmissions"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(getFormSubmissionsInputModel)
    .output(getFormSubmissionsOutputModel)
    .query(async ({ input, ctx }) => {
      return submissionService.getFormSubmissions({ formId: input.formId, userId: ctx.user.id });
    }),

  getAllSubmissions: authenticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/getAllSubmissions"), tags: TAGS, protect: true } })
    .input(z.undefined())
    .output(getAllSubmissionsOutputModel)
    .query(async ({ ctx }) => submissionService.getAllSubmissions({ userId: ctx.user.id })),

  submitForm: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/submitForm"),
        tags: TAGS,
      },
    })
    .input(submitFormInputModel)
    .output(submitFormOutputModel)
    .mutation(async ({ input }) => {
      return submissionService.createSubmission(input);
    }),
});

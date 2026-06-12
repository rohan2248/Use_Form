import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createFormInputModel,
  createFormOutputModel,
  deleteFormInputModel,
  listFormsOutputModel,
  getFieldsInputModel,
  getFieldsOutputModel,
  createFieldInputModel,
  createFieldOutputModel,
  deleteFieldInputModel,
  updateFieldInputModel,
  reorderFieldInputModel,
  getFormByIdInputModel,
  getFormByIdOutputModel,
  updateFormStatusInputModel,
  updateFormVisibilityInputModel,
  updateFormSettingsInputModel,
  listPublicFormsOutputModel,
  getAnalyticsSummaryOutputModel,
} from "./model";
import { formService } from "../../services";
import { z } from "zod";

const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({
  createForm: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createForm"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(createFormInputModel)
    .output(createFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { title, description } = input;
      const { id } = await formService.createForm({
        title,
        description,
        createdBy: ctx.user.id,
      });

      return { id };
    }),

  deleteForm: authenticatedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/deleteForm"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(deleteFormInputModel)
    .output(z.object({}))
    .mutation(async ({ input, ctx }) => {
      await formService.deleteForm({ id: input.id, userId: ctx.user.id });
      return {};
    }),

  listForms: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listForms"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(z.undefined())
    .output(listFormsOutputModel)
    .query(async ({ ctx }) => {
      const forms = await formService.listFormsByUserId({ userId: ctx.user.id });
      return forms;
    }),

  getFields: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getFields"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(getFieldsInputModel)
    .output(getFieldsOutputModel)
    .query(async ({ input }) => {
      return formService.getFields({ formId: input.formId });
    }),

  createField: authenticatedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/createField"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(createFieldInputModel)
    .output(createFieldOutputModel)
    .mutation(async ({ input }) => {
      return formService.createField(input);
    }),

  deleteField: authenticatedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/deleteField"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(deleteFieldInputModel)
    .output(z.object({}))
    .mutation(async ({ input }) => {
      await formService.deleteField({ id: input.id });
      return {};
    }),

  updateField: authenticatedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/updateField"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(updateFieldInputModel)
    .output(z.object({}))
    .mutation(async ({ input }) => {
      await formService.updateField(input);
      return {};
    }),

  updateFormStatus: authenticatedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/updateFormStatus"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(updateFormStatusInputModel)
    .output(z.object({}))
    .mutation(async ({ input, ctx }) => {
      await formService.updateFormStatus({ id: input.id, userId: ctx.user.id, status: input.status });
      return {};
    }),

  getForm: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getForm"),
        tags: TAGS,
      },
    })
    .input(getFormByIdInputModel)
    .output(getFormByIdOutputModel)
    .query(async ({ input }) => {
      return formService.getFormById({ formId: input.formId });
    }),

  updateFormVisibility: authenticatedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/updateFormVisibility"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(updateFormVisibilityInputModel)
    .output(z.object({}))
    .mutation(async ({ input, ctx }) => {
      await formService.updateFormVisibility({ id: input.id, userId: ctx.user.id, visibility: input.visibility });
      return {};
    }),

  updateFormSettings: authenticatedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/updateFormSettings"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(updateFormSettingsInputModel)
    .output(z.object({}))
    .mutation(async ({ input, ctx }) => {
      await formService.updateFormSettings({
        id: input.id,
        userId: ctx.user.id,
        maxResponses: input.maxResponses,
        emailNotifications: input.emailNotifications,
        dailyDigest: input.dailyDigest,
        theme: input.theme,
      });
      return {};
    }),

  getAnalyticsSummary: authenticatedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/getAnalyticsSummary"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(z.undefined())
    .output(getAnalyticsSummaryOutputModel)
    .query(async ({ ctx }) => formService.getAnalyticsSummary({ userId: ctx.user.id })),

  listPublicForms: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/listPublicForms"),
        tags: TAGS,
      },
    })
    .input(z.undefined())
    .output(listPublicFormsOutputModel)
    .query(async () => formService.listPublicForms()),

  reorderField: authenticatedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/reorderField"),
        tags: TAGS,
        protect: true,
      },
    })
    .input(reorderFieldInputModel)
    .output(z.object({}))
    .mutation(async ({ input }) => {
      await formService.reorderField(input);
      return {};
    }),
});

import {
  type CreateSubmissionInputType,
  type GetFormSubmissionsInputType,
  type GetAllSubmissionsInputType,
  createSubmissionInput,
  getFormSubmissionsInput,
  getAllSubmissionsInput,
} from "./model";
import { db, eq, sql, desc } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formSubmissionTable } from "@repo/database/models/form-submission";

class SubmissionService {
  public async createSubmission(payload: CreateSubmissionInputType) {
    const { formId, values } = await createSubmissionInput.parseAsync(payload);

    const [form] = await db
      .select({
        id: formsTable.id,
        status: formsTable.status,
        maxResponses: formsTable.maxResponses,
        responseCount: formsTable.responseCount,
      })
      .from(formsTable)
      .where(eq(formsTable.id, formId));

    if (!form) throw new Error("form not found");
    if (form.status !== "published") throw new Error("form is not accepting responses");
    if (form.maxResponses !== null && form.responseCount >= form.maxResponses)
      throw new Error("this form has reached its response limit");

    const [submission] = await db
      .insert(formSubmissionTable)
      .values({ formId, value: values })
      .returning({ id: formSubmissionTable.id });

    if (!submission?.id) throw new Error("failed to save submission");

    await db
      .update(formsTable)
      .set({ responseCount: sql`${formsTable.responseCount} + 1` })
      .where(eq(formsTable.id, formId));

    return { id: submission.id };
  }

  public async getAllSubmissions(payload: GetAllSubmissionsInputType) {
    const { userId } = await getAllSubmissionsInput.parseAsync(payload);

    return db
      .select({
        id: formSubmissionTable.id,
        formId: formSubmissionTable.formId,
        formTitle: formsTable.title,
        value: formSubmissionTable.value,
        createdAt: formSubmissionTable.createdAt,
      })
      .from(formSubmissionTable)
      .innerJoin(formsTable, eq(formSubmissionTable.formId, formsTable.id))
      .where(eq(formsTable.createdBy, userId))
      .orderBy(desc(formSubmissionTable.createdAt));
  }

  public async getFormSubmissions(payload: GetFormSubmissionsInputType) {
    const { formId, userId } = await getFormSubmissionsInput.parseAsync(payload);

    const [form] = await db
      .select({ createdBy: formsTable.createdBy })
      .from(formsTable)
      .where(eq(formsTable.id, formId));

    if (!form) throw new Error("form not found");
    if (form.createdBy !== userId) throw new Error("not authorized");

    return db
      .select({
        id: formSubmissionTable.id,
        value: formSubmissionTable.value,
        createdAt: formSubmissionTable.createdAt,
      })
      .from(formSubmissionTable)
      .where(eq(formSubmissionTable.formId, formId))
      .orderBy(formSubmissionTable.createdAt);
  }
}

export default SubmissionService;

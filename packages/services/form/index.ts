import {
  type CreateFormInputType,
  type ListFormsByUserIdInputType,
  type DeleteFormInputType,
  type CreateFieldInputType,
  type DeleteFieldInputType,
  type UpdateFieldInputType,
  type GetFieldsInputType,
  type ReorderFieldInputType,
  type GetFormByIdInputType,
  type UpdateFormStatusInputType,
  type UpdateFormVisibilityInputType,
  updateFormVisibilityInput,
  type GetAnalyticsSummaryInputType,
  getAnalyticsSummaryInput,
  type UpdateFormSettingsInputType,
  updateFormSettingsInput,
  createFormInput,
  listFormsByUserIdInput,
  deleteFormInput,
  createFieldInput,
  deleteFieldInput,
  updateFieldInput,
  reorderFieldInput,
  getFieldsInput,
  getFormByIdInput,
  updateFormStatusInput,
} from "./model";
import { db, eq, and, max, desc, sql } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formSubmissionTable } from "@repo/database/models/form-submission";

class FormService {
  public async createForm(payload: CreateFormInputType) {
    const { title, description, createdBy } = await createFormInput.parseAsync(payload);

    const result = await db
      .insert(formsTable)
      .values({ title, description, createdBy })
      .returning({ id: formsTable.id });

    if (!result || result.length === 0 || !result[0]?.id)
      throw new Error("something went wrong while creating the form");

    return { id: result[0].id };
  }

  public async deleteForm(payload: DeleteFormInputType) {
    const { id, userId } = await deleteFormInput.parseAsync(payload);

    const [existing] = await db
      .select({ createdBy: formsTable.createdBy })
      .from(formsTable)
      .where(eq(formsTable.id, id));

    if (!existing) throw new Error("form not found");
    if (existing.createdBy !== userId) throw new Error("not authorized to delete this form");

    await db.delete(formFieldsTable).where(eq(formFieldsTable.formId, id));
    await db.delete(formsTable).where(and(eq(formsTable.id, id), eq(formsTable.createdBy, userId)));
  }

  public async listFormsByUserId(payload: ListFormsByUserIdInputType) {
    const { userId } = await listFormsByUserIdInput.parseAsync(payload);

    return db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        status: formsTable.status,
        visibility: formsTable.visibility,
        responseCount: formsTable.responseCount,
        maxResponses: formsTable.maxResponses,
        emailNotifications: formsTable.emailNotifications,
        dailyDigest: formsTable.dailyDigest,
        theme: formsTable.theme,
        createdAt: formsTable.createdAt,
        updatedAt: formsTable.updatedAt,
      })
      .from(formsTable)
      .where(eq(formsTable.createdBy, userId));
  }
  public async getFields(payload: GetFieldsInputType) {
    const { formId } = await getFieldsInput.parseAsync(payload);

    return db
      .select({
        id: formFieldsTable.id,
        label: formFieldsTable.label,
        labelKey: formFieldsTable.labelKey,
        fieldType: formFieldsTable.fieldType,
        placeholder: formFieldsTable.placeholder,
        description: formFieldsTable.description,
        isRequired: formFieldsTable.isRequired,
        index: formFieldsTable.index,
      })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.index);
  }

  public async createField(payload: CreateFieldInputType) {
    const { formId, label, fieldType, placeholder, description, isRequired } =
      await createFieldInput.parseAsync(payload);

    const labelKey = label.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const [maxResult] = await db
      .select({ maxIndex: max(formFieldsTable.index) })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId));

    const index = maxResult?.maxIndex ? (parseFloat(maxResult.maxIndex) + 1).toFixed(2) : "1.00";

    const result = await db
      .insert(formFieldsTable)
      .values({ formId, label, labelKey, fieldType, placeholder, description, isRequired: isRequired ?? false, index })
      .returning({ id: formFieldsTable.id });

    if (!result || result.length === 0 || !result[0]?.id)
      throw new Error("something went wrong while creating the field");

    return { id: result[0].id };
  }

  public async deleteField(payload: DeleteFieldInputType) {
    const { id } = await deleteFieldInput.parseAsync(payload);

    await db.delete(formFieldsTable).where(eq(formFieldsTable.id, id));
  }

  public async updateField(payload: UpdateFieldInputType) {
    const { id, label, placeholder, description, isRequired, fieldType } =
      await updateFieldInput.parseAsync(payload);

    const updates: Partial<typeof formFieldsTable.$inferInsert> = {};
    if (label !== undefined) updates.label = label;
    if (placeholder !== undefined) updates.placeholder = placeholder;
    if (description !== undefined) updates.description = description;
    if (isRequired !== undefined) updates.isRequired = isRequired;
    if (fieldType !== undefined) updates.fieldType = fieldType;

    if (Object.keys(updates).length === 0) return;

    await db.update(formFieldsTable).set(updates).where(eq(formFieldsTable.id, id));
  }

  public async listPublicForms() {
    return db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        responseCount: formsTable.responseCount,
        createdAt: formsTable.createdAt,
      })
      .from(formsTable)
      .where(and(eq(formsTable.status, "published"), eq(formsTable.visibility, "public")))
      .orderBy(desc(formsTable.createdAt));
  }

  public async updateFormVisibility(payload: UpdateFormVisibilityInputType) {
    const { id, userId, visibility } = await updateFormVisibilityInput.parseAsync(payload);

    const [existing] = await db
      .select({ createdBy: formsTable.createdBy })
      .from(formsTable)
      .where(eq(formsTable.id, id));

    if (!existing) throw new Error("form not found");
    if (existing.createdBy !== userId) throw new Error("not authorized");

    await db.update(formsTable).set({ visibility }).where(eq(formsTable.id, id));
  }

  public async updateFormSettings(payload: UpdateFormSettingsInputType) {
    const { id, userId, maxResponses, emailNotifications, dailyDigest, theme } =
      await updateFormSettingsInput.parseAsync(payload);

    const [existing] = await db
      .select({ createdBy: formsTable.createdBy })
      .from(formsTable)
      .where(eq(formsTable.id, id));

    if (!existing) throw new Error("form not found");
    if (existing.createdBy !== userId) throw new Error("not authorized");

    const updates: Partial<typeof formsTable.$inferInsert> = {};
    if (maxResponses !== undefined) updates.maxResponses = maxResponses;
    if (emailNotifications !== undefined) updates.emailNotifications = emailNotifications;
    if (dailyDigest !== undefined) updates.dailyDigest = dailyDigest;
    if (theme !== undefined) updates.theme = theme;

    if (Object.keys(updates).length === 0) return;

    await db.update(formsTable).set(updates).where(eq(formsTable.id, id));
  }

  public async updateFormStatus(payload: UpdateFormStatusInputType) {
    const { id, userId, status } = await updateFormStatusInput.parseAsync(payload);

    const [existing] = await db
      .select({ createdBy: formsTable.createdBy })
      .from(formsTable)
      .where(eq(formsTable.id, id));

    if (!existing) throw new Error("form not found");
    if (existing.createdBy !== userId) throw new Error("not authorized");

    await db.update(formsTable).set({ status }).where(eq(formsTable.id, id));
  }

  public async getFormById(payload: GetFormByIdInputType) {
    const { formId } = await getFormByIdInput.parseAsync(payload);

    const rows = await db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        status: formsTable.status,
        visibility: formsTable.visibility,
        responseCount: formsTable.responseCount,
        maxResponses: formsTable.maxResponses,
        theme: formsTable.theme,
        fieldId: formFieldsTable.id,
        fieldLabel: formFieldsTable.label,
        fieldLabelKey: formFieldsTable.labelKey,
        fieldType: formFieldsTable.fieldType,
        fieldPlaceholder: formFieldsTable.placeholder,
        fieldDescription: formFieldsTable.description,
        fieldIsRequired: formFieldsTable.isRequired,
        fieldIndex: formFieldsTable.index,
      })
      .from(formsTable)
      .leftJoin(formFieldsTable, eq(formFieldsTable.formId, formsTable.id))
      .where(eq(formsTable.id, formId))
      .orderBy(formFieldsTable.index);

    if (rows.length === 0) throw new Error("form not found");

    const { id, title, description, status, visibility, responseCount, maxResponses, theme } = rows[0]!;

    const fields = rows
      .filter((r) => r.fieldId !== null)
      .map((r) => ({
        id: r.fieldId!,
        label: r.fieldLabel!,
        labelKey: r.fieldLabelKey!,
        fieldType: r.fieldType!,
        placeholder: r.fieldPlaceholder ?? null,
        description: r.fieldDescription ?? null,
        isRequired: r.fieldIsRequired!,
        index: r.fieldIndex!,
      }));

    return { id, title, description, status, visibility, responseCount, maxResponses, theme, fields };
  }

  public async getAnalyticsSummary(payload: GetAnalyticsSummaryInputType) {
    const { userId } = await getAnalyticsSummaryInput.parseAsync(payload);

    const responsesByDay = await db
      .select({
        date: sql`DATE(${formSubmissionTable.createdAt})::text`,
        count: sql`COUNT(*)::int`,
      })
      .from(formSubmissionTable)
      .innerJoin(formsTable, eq(formSubmissionTable.formId, formsTable.id))
      .where(
        and(
          eq(formsTable.createdBy, userId),
          sql`${formSubmissionTable.createdAt} >= NOW() - INTERVAL '30 days'`
        )
      )
      .groupBy(sql`DATE(${formSubmissionTable.createdAt})`)
      .orderBy(sql`DATE(${formSubmissionTable.createdAt})`);

    return { responsesByDay: responsesByDay as { date: string; count: number }[] };
  }

  public async reorderField(payload: ReorderFieldInputType) {
    const { id, prevIndex, nextIndex } = await reorderFieldInput.parseAsync(payload);

    const prev = prevIndex !== undefined ? parseFloat(prevIndex) : null;
    const next = nextIndex !== undefined ? parseFloat(nextIndex) : null;

    let newIndex: number;
    if (prev !== null && next !== null) {
      newIndex = (prev + next) / 2;
    } else if (prev !== null) {
      newIndex = prev + 1;
    } else if (next !== null) {
      newIndex = next / 2;
    } else {
      throw new Error("at least one of prevIndex or nextIndex must be provided");
    }

    await db
      .update(formFieldsTable)
      .set({ index: newIndex.toFixed(2) })
      .where(eq(formFieldsTable.id, id));
  }
}

export default FormService;

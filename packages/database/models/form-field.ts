import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  pgEnum,
  integer,
  numeric,
  unique,
} from "drizzle-orm/pg-core";
import { formsTable, usersTable } from "../schema";
import { Table } from "drizzle-orm";

export const fieldTypeEnum = pgEnum("field_type_enum", [
  "text",
  "number",
  "date",
  "email",
  "select",
  "checkbox",
  "radio",
  "yesno",
  "multiselect",
]);

export const formFieldsTable = pgTable(
  "form-fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    formId: uuid("form_id")
      .references(() => formsTable.id)
      .notNull(),

    label: varchar("label", { length: 100 }).notNull(),
    labelKey: varchar("label_key", { length: 100 }).notNull(),
    placeholder: text("placeholder"),
    isRequired: boolean("is_required").notNull().default(false),
    index: numeric("index", { scale: 2 }).notNull(),
    description: text("description"),

    fieldType: fieldTypeEnum("field_type").notNull(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      uniqueFormIdAndIndex: unique().on(table.formId, table.index),
    };
  },
);

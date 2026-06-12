import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { usersTable } from "../schema";

export const formStatusEnum = pgEnum("form_status", ["draft", "published", "unpublished"]);
export const formVisibilityEnum = pgEnum("form_visibility", ["public", "unlisted"]);

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),

  title: varchar("title", { length: 55 }).notNull(),

  description: varchar("description", { length: 300 }),

  createdBy: uuid("created_by")
    .references(() => usersTable.id)
    .notNull(),

  status: formStatusEnum("status").notNull().default("draft"),

  visibility: formVisibilityEnum("visibility").notNull().default("public"),

  responseCount: integer("response_count").notNull().default(0),

  maxResponses: integer("max_responses"),
  emailNotifications: boolean("email_notifications").notNull().default(false),
  dailyDigest: boolean("daily_digest").notNull().default(false),
  theme: varchar("theme", { length: 20 }).notNull().default("paper"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

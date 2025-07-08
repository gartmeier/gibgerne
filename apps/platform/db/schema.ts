import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  publicId: text("public_id")
    .notNull()
    .unique()
    .$defaultFn(() => nanoid()),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

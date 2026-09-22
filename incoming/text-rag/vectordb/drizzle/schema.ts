import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const vectorItems = mysqlTable("vector_items", {
  id: int("id").autoincrement().primaryKey(),
  metadata: text("metadata").notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  embedding: text("embedding").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const documentChunks = mysqlTable("document_chunks", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  embedding: text("embedding").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type VectorItemRow = typeof vectorItems.$inferSelect;
export type DocumentChunkRow = typeof documentChunks.$inferSelect;

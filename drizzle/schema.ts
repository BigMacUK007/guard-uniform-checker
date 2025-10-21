import { mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Companies table - represents security guard companies
export const companies = mysqlTable("companies", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  ownerId: varchar("ownerId", { length: 64 }).notNull(), // Reference to users table
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// Officers table - security guards who need to submit uniform checks
export const officers = mysqlTable("officers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  badgeNumber: varchar("badgeNumber", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Officer = typeof officers.$inferSelect;
export type InsertOfficer = typeof officers.$inferInsert;

// Compliance standards table - defines what officers need to wear
export const complianceStandards = mysqlTable("complianceStandards", {
  id: varchar("id", { length: 64 }).primaryKey(),
  companyId: varchar("companyId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  requirements: text("requirements").notNull(), // JSON array of required items
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ComplianceStandard = typeof complianceStandards.$inferSelect;
export type InsertComplianceStandard = typeof complianceStandards.$inferInsert;

// Uniform checks table - stores officer submissions and AI analysis results
export const uniformChecks = mysqlTable("uniformChecks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  officerId: varchar("officerId", { length: 64 }).notNull(),
  companyId: varchar("companyId", { length: 64 }).notNull(),
  standardId: varchar("standardId", { length: 64 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  status: mysqlEnum("status", ["pending", "compliant", "non_compliant"]).default("pending").notNull(),
  aiAnalysis: text("aiAnalysis"), // JSON object with detailed analysis
  submittedAt: timestamp("submittedAt").defaultNow(),
  location: varchar("location", { length: 500 }), // Optional location data
});

export type UniformCheck = typeof uniformChecks.$inferSelect;
export type InsertUniformCheck = typeof uniformChecks.$inferInsert;

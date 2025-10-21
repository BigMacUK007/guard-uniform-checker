import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, companies, InsertCompany, officers, InsertOfficer, complianceStandards, InsertComplianceStandard, uniformChecks, InsertUniformCheck } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Company queries
export async function createCompany(company: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(companies).values(company);
  return company;
}

export async function getCompanyById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCompaniesByOwner(ownerId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).where(eq(companies.ownerId, ownerId));
}

// Officer queries
export async function createOfficer(officer: InsertOfficer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(officers).values(officer);
  return officer;
}

export async function getOfficersByCompany(companyId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(officers).where(eq(officers.companyId, companyId));
}

export async function getOfficerById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(officers).where(eq(officers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Compliance standard queries
export async function createComplianceStandard(standard: InsertComplianceStandard) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(complianceStandards).values(standard);
  return standard;
}

export async function getStandardsByCompany(companyId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(complianceStandards).where(eq(complianceStandards.companyId, companyId));
}

export async function getStandardById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(complianceStandards).where(eq(complianceStandards.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateComplianceStandard(id: string, updates: Partial<InsertComplianceStandard>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(complianceStandards).set({ ...updates, updatedAt: new Date() }).where(eq(complianceStandards.id, id));
}

// Uniform check queries
export async function createUniformCheck(check: InsertUniformCheck) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(uniformChecks).values(check);
  return check;
}

export async function getChecksByCompany(companyId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(uniformChecks).where(eq(uniformChecks.companyId, companyId));
}

export async function getChecksByOfficer(officerId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(uniformChecks).where(eq(uniformChecks.officerId, officerId));
}

export async function getCheckById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(uniformChecks).where(eq(uniformChecks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUniformCheck(id: string, updates: Partial<InsertUniformCheck>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(uniformChecks).set(updates).where(eq(uniformChecks.id, id));
}

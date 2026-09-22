import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { documentChunks, InsertUser, users, vectorItems } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  values.lastSignedIn ??= new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

const decode = (value: string) => JSON.parse(value) as number[];
const encode = (value: number[]) => JSON.stringify(value);

export async function countVectorItems() { const db = await getDb(); if (!db) return 0; const rows = await db.select({ id: vectorItems.id }).from(vectorItems); return rows.length; }
export async function listVectorItems() {
  const db = await getDb(); if (!db) return [];
  const rows = await db.select().from(vectorItems).orderBy(asc(vectorItems.id));
  return rows.map(row => ({ id: row.id, metadata: row.metadata, category: row.category, embedding: decode(row.embedding) }));
}
export async function insertVectorItem(item: { metadata: string; category: string; embedding: number[] }) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.insert(vectorItems).values({ ...item, embedding: encode(item.embedding) });
  return Number(result[0].insertId);
}
export async function deleteVectorItem(id: number) { const db = await getDb(); if (!db) return false; const result = await db.delete(vectorItems).where(eq(vectorItems.id, id)); return Number(result[0].affectedRows ?? 0) > 0; }

export async function listDocumentChunks() {
  const db = await getDb(); if (!db) return [];
  const rows = await db.select().from(documentChunks).orderBy(asc(documentChunks.id));
  return rows.map(row => ({ id: row.id, title: row.title, text: row.body, embedding: decode(row.embedding) }));
}
export async function insertDocumentChunk(item: { title: string; text: string; embedding: number[] }) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.insert(documentChunks).values({ title: item.title, body: item.text, embedding: encode(item.embedding) });
  return Number(result[0].insertId);
}
export async function deleteDocumentChunk(id: number) { const db = await getDb(); if (!db) return false; const result = await db.delete(documentChunks).where(eq(documentChunks.id, id)); return Number(result[0].affectedRows ?? 0) > 0; }
export async function countDocumentChunks() { const db = await getDb(); if (!db) return 0; const rows = await db.select({ id: documentChunks.id }).from(documentChunks); return rows.length; }

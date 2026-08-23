import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { createDb, RelapseRecord, NewRelapseRecord } from '../db/client';
import { relapseRecords } from '../db/schema';
import type { D1Database } from '@cloudflare/workers-types';

export class RecordService {
  private db;

  constructor(d1: D1Database) {
    this.db = createDb(d1);
  }

  async create(userId: string, data: Omit<NewRelapseRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<RelapseRecord> {
    const now = new Date().toISOString();
    const newRecord: NewRelapseRecord = {
      ...data,
      id: crypto.randomUUID(),
      userId,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.db.insert(relapseRecords).values(newRecord).returning().get();
    return result;
  }

  async getAll(userId: string, from?: string, to?: string): Promise<RelapseRecord[]> {
    const conditions = [eq(relapseRecords.userId, userId)];
    if (from) {
      conditions.push(gte(relapseRecords.date, from));
    }
    if (to) {
      conditions.push(lte(relapseRecords.date, to));
    }
    return this.db.select().from(relapseRecords)
      .where(and(...conditions))
      .orderBy(desc(relapseRecords.date))
      .all();
  }

  async findById(recordId: string): Promise<RelapseRecord | null> {
    const record = await this.db.select().from(relapseRecords)
      .where(eq(relapseRecords.id, recordId))
      .get();
    return record || null;
  }

  async getById(userId: string, recordId: string): Promise<RelapseRecord | null> {
    const record = await this.db.select().from(relapseRecords)
      .where(and(eq(relapseRecords.id, recordId), eq(relapseRecords.userId, userId)))
      .get();
    return record || null;
  }

  async update(userId: string, recordId: string, data: Partial<Omit<NewRelapseRecord, 'userId' | 'createdAt' | 'updatedAt'>>): Promise<RelapseRecord | null> {
    const existing = await this.getById(userId, recordId);
    if (!existing) return null;
    const now = new Date().toISOString();
    const updated = await this.db.update(relapseRecords)
      .set({ ...data, updatedAt: now })
      .where(and(eq(relapseRecords.id, recordId), eq(relapseRecords.userId, userId)))
      .returning()
      .get();
    return updated;
  }

  async delete(userId: string, recordId: string): Promise<boolean> {
    const existing = await this.getById(userId, recordId);
    if (!existing) return false;
    await this.db.delete(relapseRecords)
      .where(and(eq(relapseRecords.id, recordId), eq(relapseRecords.userId, userId)));
    return true;
  }
}
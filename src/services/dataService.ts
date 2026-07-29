import { ModuleType } from '../types';
import { supabase } from './supabaseClient';

const STORAGE_PREFIX = 'alyazen_';

// ── localStorage helpers (also serve as the offline cache) ────────────────────
const localAll = <T>(module: ModuleType): T[] => {
  const data = localStorage.getItem(STORAGE_PREFIX + module);
  return data ? JSON.parse(data) : [];
};
const localWrite = <T>(module: ModuleType, rows: T[]): void => {
  localStorage.setItem(STORAGE_PREFIX + module, JSON.stringify(rows));
};

// The module name is generic (not a typed table), so treat the query builder as
// untyped — this layer is a pure passthrough and validates nothing itself.
const table = (module: ModuleType): any => supabase!.from(module);

/**
 * Async CRUD layer. When Supabase is configured it is the source of truth and
 * every successful read is mirrored into localStorage as an offline cache.
 * When Supabase is absent or a call errors, we transparently fall back to the
 * localStorage cache so the app keeps working.
 */
export const dataService = {
  getAll: async <T>(module: ModuleType): Promise<T[]> => {
    if (supabase) {
      const { data, error } = await table(module).select('*');
      if (!error && data) {
        localWrite(module, data);
        return data as T[];
      }
      if (error) console.warn(`[dataService] getAll(${module}) → falling back to cache:`, error.message);
    }
    return localAll<T>(module);
  },

  getById: async <T extends { id: string }>(module: ModuleType, id: string): Promise<T | undefined> => {
    const all = await dataService.getAll<T>(module);
    return all.find(item => item.id === id);
  },

  create: async <T extends { id: string }>(module: ModuleType, data: Omit<T, 'id'> & { id?: string }): Promise<T> => {
    const newItem = { ...data, id: data.id ?? crypto.randomUUID() } as T;
    if (supabase) {
      const { data: inserted, error } = await table(module).insert(newItem).select().single();
      if (!error && inserted) {
        localWrite(module, [...localAll<T>(module).filter(i => i.id !== newItem.id), inserted as T]);
        return inserted as T;
      }
      if (error) console.warn(`[dataService] create(${module}) → cache-only:`, error.message);
    }
    localWrite(module, [...localAll<T>(module), newItem]);
    return newItem;
  },

  update: async <T extends { id: string }>(module: ModuleType, id: string, patch: Partial<T>): Promise<T | undefined> => {
    if (supabase) {
      const { data: updated, error } = await table(module).update(patch).eq('id', id).select().single();
      if (!error && updated) {
        localWrite(module, localAll<T>(module).map(i => (i.id === id ? (updated as T) : i)));
        return updated as T;
      }
      if (error) console.warn(`[dataService] update(${module}) → cache-only:`, error.message);
    }
    const all = localAll<T>(module);
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...patch };
    localWrite(module, all);
    return all[idx];
  },

  delete: async (module: ModuleType, id: string): Promise<void> => {
    if (supabase) {
      const { error } = await table(module).delete().eq('id', id);
      if (error) console.warn(`[dataService] delete(${module}) → cache-only:`, error.message);
    }
    localWrite(module, localAll<{ id: string }>(module).filter(i => i.id !== id));
  },

  /**
   * Insert-or-update a batch of rows by id (used by the per-day site schedule
   * and worker attendance grids, which persist the whole visible set at once).
   */
  bulkUpsert: async <T extends { id: string }>(module: ModuleType, rows: T[]): Promise<void> => {
    if (supabase && rows.length) {
      const { error } = await table(module).upsert(rows);
      if (error) console.warn(`[dataService] bulkUpsert(${module}) → cache-only:`, error.message);
    }
    const map = new Map(localAll<T>(module).map(r => [r.id, r]));
    rows.forEach(r => map.set(r.id, r));
    localWrite(module, Array.from(map.values()));
  },

  search: async <T>(module: ModuleType, query: string, fields: (keyof T)[]): Promise<T[]> => {
    const all = await dataService.getAll<T>(module);
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter(item =>
      fields.some(field => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(q);
      })
    );
  },
};

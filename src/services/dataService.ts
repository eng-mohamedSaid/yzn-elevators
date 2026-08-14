import { ModuleType } from '../types';
import { supabase } from './supabaseClient';
import { toDataError } from './errors';

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
 * Async CRUD layer.
 *
 * When Supabase is configured it is the sole source of truth: every successful
 * read is mirrored into localStorage, and every *failure* is surfaced as a
 * `DataError` carrying an Arabic message for the UI. Failures are deliberately
 * NOT swallowed into the cache — a write that silently landed in localStorage
 * only would look saved to the user while the server never received it.
 *
 * When Supabase is absent (no env vars yet), localStorage is the store and the
 * app keeps working exactly as before.
 */
export const dataService = {
  getAll: async <T>(module: ModuleType): Promise<T[]> => {
    if (supabase) {
      const { data, error } = await table(module).select('*');
      if (error) throw toDataError(module, 'read', error);
      const rows = (data ?? []) as T[];
      localWrite(module, rows);
      return rows;
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
      if (error) throw toDataError(module, 'create', error);
      const row = inserted as T;
      localWrite(module, [...localAll<T>(module).filter(i => i.id !== row.id), row]);
      return row;
    }
    localWrite(module, [...localAll<T>(module), newItem]);
    return newItem;
  },

  update: async <T extends { id: string }>(module: ModuleType, id: string, patch: Partial<T>): Promise<T | undefined> => {
    if (supabase) {
      const { data: updated, error } = await table(module).update(patch).eq('id', id).select().single();
      if (error) throw toDataError(module, 'update', error);
      const row = updated as T;
      localWrite(module, localAll<T>(module).map(i => (i.id === id ? row : i)));
      return row;
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
      if (error) throw toDataError(module, 'delete', error);
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
      if (error) throw toDataError(module, 'save', error);
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

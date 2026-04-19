import { ModuleType } from '../types';

const STORAGE_PREFIX = 'alyazen_';

export const dataService = {
  getAll: <T>(module: ModuleType): T[] => {
    const data = localStorage.getItem(STORAGE_PREFIX + module);
    return data ? JSON.parse(data) : [];
  },

  getById: <T extends { id: string }>(module: ModuleType, id: string): T | undefined => {
    const all = dataService.getAll<T>(module);
    return all.find(item => item.id === id);
  },

  create: <T extends { id: string }>(module: ModuleType, data: Omit<T, 'id'>): T => {
    const all = dataService.getAll<T>(module);
    const newItem = { ...data, id: crypto.randomUUID() } as T;
    localStorage.setItem(STORAGE_PREFIX + module, JSON.stringify([...all, newItem]));
    return newItem;
  },

  update: <T extends { id: string }>(module: ModuleType, id: string, data: Partial<T>): T => {
    const all = dataService.getAll<T>(module);
    const index = all.findIndex(item => item.id === id);
    if (index === -1) throw new Error(`Item with id ${id} not found in ${module}`);
    
    const updatedItem = { ...all[index], ...data };
    all[index] = updatedItem;
    localStorage.setItem(STORAGE_PREFIX + module, JSON.stringify(all));
    return updatedItem;
  },

  delete: (module: ModuleType, id: string): void => {
    const all = dataService.getAll<{ id: string }>(module);
    const filtered = all.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_PREFIX + module, JSON.stringify(filtered));
  },

  // Specialized search helper
  search: <T>(module: ModuleType, query: string, fields: (keyof T)[]): T[] => {
    const all = dataService.getAll<T>(module);
    if (!query) return all;
    
    const lowerQuery = query.toLowerCase();
    return all.filter(item => 
      fields.some(field => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(lowerQuery);
      })
    );
  }
};

import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase, DBSchema } from 'idb';

interface BarcodeSchema extends DBSchema {
  scans: {
    key: string; // id
    value: {
      id: string;
      code: string;
      createdAt: number;
      status?: 'pending'|'valid'|'invalid'|'error';
      serverMessage?: string;
      syncedAt?: number|null;
    };
    indexes: { 'by-createdAt': number, 'by-status': string };
  };
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private db: Promise<IDBPDatabase<BarcodeSchema>>;

  constructor() {
    this.db = openDB<BarcodeSchema>('barcode-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('scans', { keyPath: 'id' });
        store.createIndex('by-createdAt', 'createdAt');
        store.createIndex('by-status', 'status');
      }
    });
  }

  async addScan(code: string) {
    const d = await this.db;
    const id = crypto.randomUUID();
    await d.put('scans', {
      id, code, createdAt: Date.now(),
      status: 'pending', syncedAt: null
    });
    return id;
  }

  async listAll() {
    const d = await this.db;
    return await d.getAll('scans');
  }

  async listPending() {
    const d = await this.db;
    return await d.getAllFromIndex('scans', 'by-status', 'pending');
  }

  async updateMany(rows: BarcodeSchema['scans']['value'][]) {
    const d = await this.db;
    const tx = d.transaction('scans', 'readwrite');
    for (const r of rows) await tx.store.put(r);
    await tx.done;
  }

  async clearAll() {
    const d = await this.db;
    await d.clear('scans');
  }
}

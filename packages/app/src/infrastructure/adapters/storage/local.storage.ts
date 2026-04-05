import fs from "fs/promises";
import path from "path";
import type { StorageProvider } from "@/domain/recording/StorageProvider";

const BASE_PATH =
  process.env.RECORDINGS_STORAGE_PATH ?? "./storage/recordings";

export const localStorageProvider: StorageProvider = {
  async save(key: string, data: Buffer): Promise<string> {
    const filePath = path.join(BASE_PATH, key);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, data);
    return key;
  },

  async get(key: string): Promise<Buffer | null> {
    const filePath = path.join(BASE_PATH, key);
    try {
      const data = await fs.readFile(filePath);
      return data;
    } catch {
      return null;
    }
  },

  async delete(key: string): Promise<boolean> {
    const filePath = path.join(BASE_PATH, key);
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  },

  getUrl(key: string): string {
    return `/api/recordings/audio/${key}`;
  },
};

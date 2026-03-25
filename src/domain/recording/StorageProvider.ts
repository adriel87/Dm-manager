export interface StorageProvider {
  save(key: string, data: Buffer): Promise<string>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<boolean>;
  getUrl(key: string): string;
}

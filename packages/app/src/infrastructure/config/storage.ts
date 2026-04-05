import { localStorageProvider } from "@/infrastructure/adapters/storage/local.storage";

// Future: add S3, GCS providers and switch based on env var
export const storageProvider = localStorageProvider;

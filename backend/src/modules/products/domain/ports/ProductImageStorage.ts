export interface ProductImageStorage {
  save(file: { buffer: Buffer; originalName: string; mimeType: string }): Promise<string>;
  delete(relativePath: string): Promise<void>;
}

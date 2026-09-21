import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ValidationError } from "../../shared/errors/AppError.js";
import type { ProductImageStorage } from "../../modules/products/domain/ports/ProductImageStorage.js";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export class LocalProductImageStorage implements ProductImageStorage {
  constructor(private readonly uploadDir: string) {}

  async save(file: { buffer: Buffer; originalName: string; mimeType: string }) {
    if (!ALLOWED.has(file.mimeType)) {
      throw new ValidationError("Solo se permiten imágenes JPG, PNG o WEBP");
    }
    await mkdir(this.uploadDir, { recursive: true });
    const ext = path.extname(file.originalName).toLowerCase() || mimeToExt(file.mimeType);
    const filename = `${randomUUID()}${ext}`;
    await writeFile(path.join(this.uploadDir, filename), file.buffer);
    return `/uploads/products/${filename}`;
  }

  async delete(relativePath: string) {
    const filename = path.basename(relativePath);
    const full = path.join(this.uploadDir, filename);
    try {
      await unlink(full);
    } catch {
      // ignore missing files
    }
  }
}

function mimeToExt(mime: string) {
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  return ".jpg";
}

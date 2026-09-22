import { ValidationError } from "../../../../shared/errors/AppError.js";
import type {
  ReceiptValidator,
  ReceiptData,
} from "../../domain/receipt/ReceiptValidator.js";

export class ReceiptValidationService {
  constructor(
    private readonly validators: ReceiptValidator[],
  ) {}

  validate(input: ReceiptData): void {
    const validator = this.validators.find(
      (item) => item.supports(input.receiptType),
    );

    if (!validator) {
      throw new ValidationError("Tipo de comprobante no soportado");
    }

    try {
      validator.validate(input);
    } catch (error) {
      throw new ValidationError(this.mapError(error));
    }
  }

  private mapError(error: unknown): string {
    const code = error instanceof Error ? error.message : "";

    if (code === "INVALID_DNI") {
      return "DNI inválido (8 dígitos)";
    }

    if (code === "MISSING_CUSTOMER_NAME") {
      return "El nombre es obligatorio para boleta con DNI";
    }

    if (code === "INVALID_RUC") {
      return "RUC inválido (11 dígitos)";
    }

    if (code === "MISSING_BUSINESS_NAME") {
      return "La razón social es obligatoria para factura";
    }

    return "Datos de comprobante inválidos";
  }
}
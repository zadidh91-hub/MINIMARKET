import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";
import { prisma } from "./database/prisma/client.js";
import { PrismaProductRepository } from "../modules/products/adapters/outbound/persistence/PrismaProductRepository.js";
import { PrismaCategoryRepository } from "../modules/categories/adapters/outbound/persistence/PrismaCategoryRepository.js";
import { PrismaInventoryMovementRepository } from "../modules/inventory/adapters/outbound/persistence/PrismaInventoryMovementRepository.js";
import { PrismaStockAdjustmentWriter } from "../modules/inventory/adapters/outbound/persistence/PrismaStockAdjustmentWriter.js";
import { PrismaSaleRepository, PrismaSaleRegistrationWriter } from "../modules/sales/adapters/outbound/persistence/PrismaSaleRepository.js";
import { PrismaCustomerRepository } from "../modules/customers/adapters/outbound/persistence/PrismaCustomerRepository.js";
import { PrismaUserRepository } from "../modules/users/adapters/outbound/persistence/PrismaUserRepository.js";
import { BcryptPasswordHasher } from "../modules/auth/adapters/outbound/BcryptPasswordHasher.js";
import { JwtTokenService } from "../modules/auth/adapters/outbound/JwtTokenService.js";
import { LocalProductImageStorage } from "./files/LocalProductImageStorage.js";
import { CreateProductUseCase } from "../modules/products/application/use-cases/CreateProductUseCase.js";
import { UpdateProductUseCase } from "../modules/products/application/use-cases/UpdateProductUseCase.js";
import { DeleteProductUseCase } from "../modules/products/application/use-cases/DeleteProductUseCase.js";
import { GetProductUseCase } from "../modules/products/application/use-cases/GetProductUseCase.js";
import { ListProductsUseCase } from "../modules/products/application/use-cases/ListProductsUseCase.js";
import { SearchProductsUseCase } from "../modules/products/application/use-cases/SearchProductsUseCase.js";
import { CreateCategoryUseCase } from "../modules/categories/application/use-cases/CreateCategoryUseCase.js";
import { UpdateCategoryUseCase } from "../modules/categories/application/use-cases/UpdateCategoryUseCase.js";
import { DeleteCategoryUseCase } from "../modules/categories/application/use-cases/DeleteCategoryUseCase.js";
import { ListCategoriesUseCase } from "../modules/categories/application/use-cases/ListCategoriesUseCase.js";
import { ListInventoryUseCase } from "../modules/inventory/application/use-cases/ListInventoryUseCase.js";
import { ListInventoryMovementsUseCase } from "../modules/inventory/application/use-cases/ListInventoryMovementsUseCase.js";
import { RegisterInventoryMovementUseCase } from "../modules/inventory/application/use-cases/RegisterInventoryMovementUseCase.js";
import { RegisterSaleUseCase } from "../modules/sales/application/use-cases/RegisterSaleUseCase.js";
import { ListSalesUseCase } from "../modules/sales/application/use-cases/ListSalesUseCase.js";
import { GetSaleUseCase } from "../modules/sales/application/use-cases/GetSaleUseCase.js";
import { RegisterCustomerUseCase } from "../modules/customers/application/use-cases/RegisterCustomerUseCase.js";
import { UpdateCustomerUseCase } from "../modules/customers/application/use-cases/UpdateCustomerUseCase.js";
import { GetCustomerUseCase } from "../modules/customers/application/use-cases/GetCustomerUseCase.js";
import { ListCustomersUseCase } from "../modules/customers/application/use-cases/ListCustomersUseCase.js";
import { SearchCustomersUseCase } from "../modules/customers/application/use-cases/SearchCustomersUseCase.js";
import { CreateUserUseCase } from "../modules/users/application/use-cases/CreateUserUseCase.js";
import { UpdateUserUseCase } from "../modules/users/application/use-cases/UpdateUserUseCase.js";
import { ListUsersUseCase } from "../modules/users/application/use-cases/ListUsersUseCase.js";
import { LoginUseCase } from "../modules/auth/application/use-cases/LoginUseCase.js";
import { GetCurrentUserUseCase } from "../modules/auth/application/use-cases/GetCurrentUserUseCase.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "../..");

export function createContainer() {
  const jwtSecret = process.env.JWT_SECRET ?? "dev-secret";
  const jwtExpires = (process.env.JWT_EXPIRES_IN ?? "8h") as SignOptions["expiresIn"];
  const uploadDir = path.resolve(backendRoot, process.env.UPLOAD_DIR ?? "uploads/products");

  const products = new PrismaProductRepository(prisma);
  const categories = new PrismaCategoryRepository(prisma);
  const movements = new PrismaInventoryMovementRepository(prisma);
  const stockWriter = new PrismaStockAdjustmentWriter(prisma);
  const sales = new PrismaSaleRepository(prisma);
  const saleWriter = new PrismaSaleRegistrationWriter(prisma);
  const customers = new PrismaCustomerRepository(prisma);
  const users = new PrismaUserRepository(prisma);
  const hasher = new BcryptPasswordHasher();
  const tokens = new JwtTokenService(jwtSecret, jwtExpires);
  const images = new LocalProductImageStorage(uploadDir);

  return {
    prisma,
    tokens,
    images,
    uploadDir,
    useCases: {
      createProduct: new CreateProductUseCase(products, categories, stockWriter),
      updateProduct: new UpdateProductUseCase(products, categories),
      deleteProduct: new DeleteProductUseCase(products),
      getProduct: new GetProductUseCase(products),
      listProducts: new ListProductsUseCase(products),
      searchProducts: new SearchProductsUseCase(products),
      createCategory: new CreateCategoryUseCase(categories),
      updateCategory: new UpdateCategoryUseCase(categories),
      deleteCategory: new DeleteCategoryUseCase(categories),
      listCategories: new ListCategoriesUseCase(categories),
      listInventory: new ListInventoryUseCase(products),
      listMovements: new ListInventoryMovementsUseCase(movements),
      registerMovement: new RegisterInventoryMovementUseCase(products, stockWriter),
      registerSale: new RegisterSaleUseCase(products, customers, saleWriter),
      listSales: new ListSalesUseCase(sales),
      getSale: new GetSaleUseCase(sales),
      registerCustomer: new RegisterCustomerUseCase(customers),
      updateCustomer: new UpdateCustomerUseCase(customers),
      getCustomer: new GetCustomerUseCase(customers),
      listCustomers: new ListCustomersUseCase(customers),
      searchCustomers: new SearchCustomersUseCase(customers),
      createUser: new CreateUserUseCase(users, hasher),
      updateUser: new UpdateUserUseCase(users, hasher),
      listUsers: new ListUsersUseCase(users),
      login: new LoginUseCase(users, hasher, tokens),
      me: new GetCurrentUserUseCase(users),
    },
  };
}

export type AppContainer = ReturnType<typeof createContainer>;

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);
  const sellerHash = await bcrypt.hash("vendedor123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@minimarket.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@minimarket.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "vendedor@minimarket.com" },
    update: {},
    create: {
      name: "Vendedor",
      email: "vendedor@minimarket.com",
      passwordHash: sellerHash,
      role: "VENDEDOR",
    },
  });

  const abarrotes = await prisma.category.upsert({
    where: { name: "Abarrotes" },
    update: {},
    create: { name: "Abarrotes" },
  });
  const bebidas = await prisma.category.upsert({
    where: { name: "Bebidas" },
    update: {},
    create: { name: "Bebidas" },
  });

  const products = [
    { code: "ARR001", name: "Arroz Costeño 1kg", price: 4.5, stock: 20, categoryId: abarrotes.id },
    { code: "ACE001", name: "Aceite Primor 1L", price: 9.9, stock: 15, categoryId: abarrotes.id },
    { code: "AZU001", name: "Azúcar rubia 1kg", price: 3.8, stock: 8, categoryId: abarrotes.id },
    { code: "INC001", name: "Inca Kola 500ml", price: 2.5, stock: 30, categoryId: bebidas.id },
    { code: "AGU001", name: "Agua San Luis 625ml", price: 1.5, stock: 4, categoryId: bebidas.id },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: {},
      create: {
        ...product,
        minStock: 5,
      },
    });
  }

  await prisma.customer.upsert({
    where: { documentType_documentNumber: { documentType: "DNI", documentNumber: "12345678" } },
    update: {},
    create: { documentType: "DNI", documentNumber: "12345678", name: "Ana Pérez" },
  });

  await prisma.customer.upsert({
    where: { documentType_documentNumber: { documentType: "RUC", documentNumber: "20123456789" } },
    update: {},
    create: { documentType: "RUC", documentNumber: "20123456789", name: "Minimarket Los Andes SAC" },
  });

  console.log("Seed listo. Admin:", admin.email, "contraseña: admin123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

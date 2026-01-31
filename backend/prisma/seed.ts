import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando la siembra de datos (Seeding)...");

  // 1. Crear un Usuario Maestro (TÚ)
  // Usamos 'upsert': Si existe, no hace nada. Si no existe, lo crea.
  const user = await prisma.user.upsert({
    where: { email: "admin@finanzas.com" },
    update: {},
    create: {
      email: "admin@finanzas.com",
      name: "Alex Ingeniero",
      password: "password123", // En el futuro encriptaremos esto
    },
  });

  console.log(`👤 Usuario creado: ${user.name}`);

  // 2. Definir tus Categorías del Excel
  const categories = [
    { name: "Sueldo", icon: "💰" },
    { name: "Otros Ingresos", icon: "gem" },
    { name: "Comida", icon: "🍔" },
    { name: "Carro", icon: "🚗" },
    { name: "Gastos Fijos", icon: "🏠" }, // Luz, agua, internet
    { name: "Regalos", icon: "🎁" },
    { name: "Rifas", icon: "🎟️" },
    { name: "Salud/Personal", icon: "💊" },
  ];

  console.log("📂 Creando categorías...");

  // 3. Insertar categorías vinculadas a tu usuario
  for (const cat of categories) {
    await prisma.category.upsert({
      where: {
        // Truco: Prisma busca por la llave única compuesta (nombre + usuario)
        name_userId: {
          name: cat.name,
          userId: user.id,
        },
      },
      update: {},
      create: {
        name: cat.name,
        icon: cat.icon,
        userId: user.id,
      },
    });
  }

  console.log("✅ Seeding completado con éxito.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export interface Category {
  id: number;
  name: string;
  icon?: string;
}

export interface Transaction {
  id: number;
  amount: number; // O string, dependiendo de cómo lo mande NestJS (Prisma Decimal suele ser string en JSON)
  concept: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  category?: Category; // Puede venir o no
}

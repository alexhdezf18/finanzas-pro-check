export interface Category {
  id: number;
  name: string;
  icon?: string;
}

export interface Transaction {
  id: number;
  amount: number;
  concept: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  categoryId: number;
  category?: Category;
}

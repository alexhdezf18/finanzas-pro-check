import client from "./axios";
import type { Transaction } from "../types";

interface CreateTransactionData {
  amount: number;
  concept: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  categoryId: number;
}

export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await client.get("/transactions");
  return response.data;
};

export const createTransaction = async (
  data: CreateTransactionData,
): Promise<Transaction> => {
  const response = await client.post("/transactions", data);
  return response.data;
};

export const deleteTransaction = async (id: number): Promise<void> => {
  await client.delete(`/transactions/${id}`);
};

import client from "./axios";
import type { Transaction, CreateTransactionData } from "../types";

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

export const updateTransaction = async (
  id: number,
  data: Partial<CreateTransactionData>,
): Promise<Transaction> => {
  const response = await client.patch(`/transactions/${id}`, data);
  return response.data;
};

export const deleteTransaction = async (id: number): Promise<void> => {
  await client.delete(`/transactions/${id}`);
};

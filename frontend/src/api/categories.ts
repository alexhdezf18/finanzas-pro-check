import client from "./axios";
import type { Category } from "../types";

// Definimos qué datos necesitamos para crear una categoría
interface CreateCategoryData {
  name: string;
  icon?: string;
  budgetLimit?: number;
}

// Obtener todas
export const getCategories = async (): Promise<Category[]> => {
  const response = await client.get("/categories");
  return response.data;
};

// Crear nueva
export const createCategory = async (
  data: CreateCategoryData,
): Promise<Category> => {
  const response = await client.post("/categories", data);
  return response.data;
};

// Eliminar
export const deleteCategory = async (id: number): Promise<void> => {
  await client.delete(`/categories/${id}`);
};

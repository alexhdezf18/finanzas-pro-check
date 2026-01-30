import client from "./axios"; // Asumo que aquí exportas tu instancia de axios configurada
import type { Category } from "../types";

// Definimos qué datos necesitamos para crear una categoría
interface CreateCategoryData {
  name: string;
  icon?: string;
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

// Eliminar (ya que estamos aquí, dejémoslo listo)
export const deleteCategory = async (id: number): Promise<void> => {
  await client.delete(`/categories/${id}`);
};

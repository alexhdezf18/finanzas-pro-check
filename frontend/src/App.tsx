import { useEffect, useState } from "react";
import api from "./api/axios";
import type { Category } from "./types";

function App() {
  // Estado: La memoria a corto plazo del Frontend
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Efecto: Lo que pasa cuando la página carga por primera vez
  useEffect(() => {
    // Función asíncrona para pedir datos
    const fetchData = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data); // Guardamos los datos en el estado
      } catch (error) {
        console.error("Error conectando con el cerebro:", error);
      } finally {
        setLoading(false); // Ya terminamos de cargar (sea éxito o error)
      }
    };

    fetchData();
  }, []); // El array vacío [] significa: "Ejecútalo solo una vez al iniciar"

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Mis Finanzas 💰
        </h1>

        <h2 className="text-xl font-semibold mb-4 text-gray-600">
          Categorías Disponibles
        </h2>

        {loading ? (
          <p className="text-center text-blue-500 animate-pulse">
            Cargando datos...
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 border rounded-lg flex flex-col items-center hover:bg-blue-50 transition cursor-pointer"
              >
                <span className="text-3xl mb-2">{cat.icon || "📁"}</span>
                <span className="font-medium text-gray-700">{cat.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-400">
          Conectado a PostgreSQL vía NestJS 🚀
        </div>
      </div>
    </div>
  );
}

export default App;

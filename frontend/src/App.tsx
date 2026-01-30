import { useEffect, useState } from "react";
import api from "./api/axios";
import type { Category } from "./types";

function App() {
  // --- ESTADOS ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para el formulario de creación
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("💰");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- EFECTOS ---
  useEffect(() => {
    fetchData();
  }, []);

  // --- FUNCIONES ---

  // 1. Obtener categorías (GET)
  const fetchData = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error conectando con el cerebro:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Crear categoría (POST)
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    if (!newName.trim()) return; // No permitir nombres vacíos

    setIsSubmitting(true);
    try {
      // Enviamos los datos al Backend
      const response = await api.post("/categories", {
        name: newName,
        icon: newIcon,
      });

      // Actualizamos la lista visualmente agregando la nueva categoría al final
      setCategories([...categories, response.data]);

      // Limpiamos el formulario
      setNewName("");
      setNewIcon("💰");
    } catch (error) {
      console.error("Error creando categoría:", error);
      alert("Error al crear. ¿Tal vez ya existe ese nombre?");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Eliminar categoría (DELETE)
  const handleDelete = async (id: number) => {
    // Confirmación simple antes de borrar
    if (!confirm("¿Seguro que quieres eliminar esta categoría?")) return;

    try {
      await api.delete(`/categories/${id}`);

      // Filtramos la lista para quitar la categoría borrada sin recargar
      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("No se pudo eliminar. Puede que tenga transacciones asociadas.");
    }
  };

  // --- RENDER (VISTA) ---
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        {" "}
        {/* Hice el cuadro un poco más ancho */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Mis Finanzas 🚀
        </h1>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Panel de Control de Categorías
        </p>
        {/* --- FORMULARIO DE NUEVA CATEGORÍA --- */}
        <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            Crear Nueva Categoría
          </h3>
          <form onSubmit={handleCreate} className="flex gap-2">
            {/* Selector de Icono */}
            <select
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="p-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="💰">💰</option>
              <option value="🍔">🍔</option>
              <option value="🚗">🚗</option>
              <option value="🏠">🏠</option>
              <option value="🎮">🎮</option>
              <option value="💊">💊</option>
              <option value="✈️">✈️</option>
              <option value="🎓">🎓</option>
            </select>

            {/* Input de Nombre */}
            <input
              type="text"
              placeholder="Nombre (ej. Gimnasio)"
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            {/* Botón Guardar */}
            <button
              type="submit"
              disabled={isSubmitting || !newName.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition font-medium"
            >
              {isSubmitting ? "..." : "Agregar"}
            </button>
          </form>
        </div>
        {/* --- LISTA DE CATEGORÍAS --- */}
        <h2 className="text-xl font-semibold mb-4 text-gray-600">
          Tus Categorías
        </h2>
        {loading ? (
          <p className="text-center text-blue-500 animate-pulse py-8">
            Cargando datos...
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group relative p-4 border rounded-lg flex flex-col items-center hover:shadow-md transition bg-white"
              >
                {/* Botón de Eliminar (Aparece al pasar el mouse - group-hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Evita clics accidentales
                    handleDelete(cat.id);
                  }}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  title="Eliminar categoría"
                >
                  ✕
                </button>

                <span className="text-3xl mb-2">{cat.icon || "📁"}</span>
                <span className="font-medium text-gray-700 text-center">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        )}
        {categories.length === 0 && !loading && (
          <div className="text-center text-gray-400 py-8">
            No hay categorías aún. ¡Crea la primera arriba! 👆
          </div>
        )}
        <div className="mt-8 text-center text-xs text-gray-300">
          Conectado a PostgreSQL vía NestJS
        </div>
      </div>
    </div>
  );
}

export default App;
